import { spawn } from "child_process";
import { unlink, mkdir, readFile, access } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export async function convertTexture(texturePath: string) {
    try {
        if (!texturePath) {
            return { 
                success: false,
                error: "No file path provided"
            };
        }

        await access(texturePath);

        const tempDir = path.join(process.cwd(), 'temp');

        if (!existsSync(tempDir)) {
            await mkdir(tempDir, { recursive: true });
        }

        const uniqueId = randomUUID();
        const sourceFileName = path.basename(texturePath);
        const outputFileName = `output_${uniqueId}.png`;
        const outputPath = path.join(tempDir, outputFileName);

        const result = await executeSctxDecode(texturePath, outputPath);

        if (!result.success) {
            await unlink(outputPath).catch(() => {});

            return {
                success: false,
                error: result.error
            };
        }

        const convertedFile = await readFile(outputPath);
        const base64 = convertedFile.toString('base64');

        await unlink(outputPath).catch(() => {});

        return {
            success: true,
            uri: `data:image/png;base64,${base64}`,
            filename: `converted_${sourceFileName}`,
            originalName: sourceFileName,
            mimeType: "image/png",
            size: convertedFile.byteLength,
        }
    } catch (err) {
        console.error("Error processing file:", err);

        return {
            success: false,
            error: `Failed to process file: ${err}`
        };
    }
}

type ScriptResult = {
    success: boolean;
    error?: string;
    output?: string;
};

async function executeSctxDecode(input: string, output: string): Promise<ScriptResult> {
    const converterCandidates = [
        path.join(process.cwd(), 'src/sctx-converter/main.exe'),
        path.join(process.cwd(), 'src/libs/sctx-converter/main.exe'),
    ];

    const converterPath = converterCandidates.find((candidate) => existsSync(candidate));

    if (!converterPath) {
        return {
            success: false,
            error: `SCTX converter not found. Expected one of: ${converterCandidates.join(', ')}`,
        };
    }

    return new Promise((resolve) => {
        const isWindows = process.platform === "win32";
        const command = isWindows ? converterPath : "wine";
        const args = isWindows
            ? ["decode", "-t", input, output]
            : [converterPath, "decode", "-t", input, output];

        const converterProcess = spawn(command, args, {
            env: isWindows
                ? process.env
                : {
                    ...process.env,
                    WINEDEBUG: "-all",
                },
        });

        let stdout = '';
        let stderr = '';

        converterProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        converterProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        converterProcess.on("close", code => {
            if (code === 0) {
                resolve({ success: true, output: stdout });
            } else {
                resolve({
                    success: false,
                    error: `SCTX converter failed with code ${code}: ${stderr || stdout}`
                });
            }
        });

        converterProcess.on('error', (error) => {
            resolve({
                success: false,
                error: `Failed to start SCTX converter (${command}): ${error.message}`
            });
        });
    });
}