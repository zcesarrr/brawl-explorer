import { spawn } from "child_process";
import { writeFile, unlink, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export async function convertModel(modelFile: File) {
    try {
        if (!modelFile) {
            return { 
                success: false,
                error: "No file provided"
            };
        }

        const tempDir = path.join(process.cwd(), 'temp');

        if (!existsSync(tempDir)) {
            await mkdir(tempDir, { recursive: true });
        }

        const uniqueId = randomUUID();
        const inputFileName = `input_${uniqueId}${path.extname(modelFile.name)}`;
        const outputFileName = `output_${uniqueId}.glb`;
        const inputPath = path.join(tempDir, inputFileName);
        const outputPath = path.join(tempDir, outputFileName);

        const bytes = await modelFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(inputPath, buffer);

        const result = await executePythonScript(inputPath, outputPath);

        if (!result.success) {
            await unlink(inputPath).catch(() => {});
            await unlink(outputPath).catch(() => {});

            return {
                success: false,
                error: result.error
            };
        }

        const convertedFile = await readFile(outputPath);
        const base64 = convertedFile.toString('base64');

        await unlink(inputPath).catch(() => {});
        await unlink(outputPath).catch(() => {});

        return {
            success: true,
            data: base64,
            filename: `converted_${modelFile.name}`,
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
            console.log(`Python stdout: ${data}`);
        });

        py.stderr.on('data', (data) => {
            stderr += data.toString();
            console.error(`Python stderr: ${data}`);
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