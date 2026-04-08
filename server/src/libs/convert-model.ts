import { spawn } from "child_process";
import { unlink, mkdir, readFile, access } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export async function convertModel(modelPath: string) {
    try {
        if (!modelPath) {
            return { 
                success: false,
                error: "No file path provided"
            };
        }

        await access(modelPath);

        const tempDir = path.join(process.cwd(), 'temp');

        if (!existsSync(tempDir)) {
            await mkdir(tempDir, { recursive: true });
        }

        const uniqueId = randomUUID();
        const sourceFileName = path.basename(modelPath);
        const outputFileName = `output_${uniqueId}.glb`;
        const outputPath = path.join(tempDir, outputFileName);

        const result = await executePythonScript(modelPath, outputPath);

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
            uri: `data:model/gltf-binary;base64,${base64}`,
            filename: `converted_${sourceFileName}`,
            mimeType: "model/gltf-binary"
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

async function executePythonScript(input: string, output: string): Promise<ScriptResult> {
    const pythonScript = path.join(process.cwd(), 'src/libs/supercell-flat-converter/main.py');

    return new Promise((resolve) => {
        const py = spawn("python3", [
            pythonScript,
            "decode",
            "-i",
            input,
            "-o",
            output,
        ]);

        let stdout = '';
        let stderr = '';

        py.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        py.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        py.on("close", code => {
            if (code === 0) {
                resolve({ success: true, output: stdout });
            } else {
                resolve({
                    success: false,
                    error: `Python script failed with code ${code}: ${stderr}`
                });
            }
        });

        py.on('error', (error) => {
            resolve({
                success: false,
                error: `Failed to start Python process: ${error.message}`
            });
        });
    });
}