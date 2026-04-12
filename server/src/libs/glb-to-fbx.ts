import "dotenv/config";
import { spawn } from "child_process";
import { unlink, mkdir, readFile, access } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export async function convertGlbToFbx(inputPath: string) {
    let outputPath: string | null = null;

    try {
        if (!inputPath) {
            return { 
                success: false,
                error: "No GLB input path provided"
            };
        }

        await access(inputPath);

        const tempDir = path.join(process.cwd(), 'temp');

        if (!existsSync(tempDir)) {
            await mkdir(tempDir, { recursive: true });
        }

        const uniqueId = randomUUID();
        outputPath = path.join(tempDir, `output_${uniqueId}.fbx`);

        const result = await executePythonScript(inputPath, outputPath);

        if (!result.success) {
            await Promise.all([
                unlink(outputPath).catch(() => {}),
            ]);

            return {
                success: false,
                error: result.error
            };
        }

        const convertedFile = await readFile(outputPath);
        const base64 = convertedFile.toString('base64');

        await Promise.all([
            unlink(outputPath).catch(() => {}),
        ]);

        return {
            success: true,
            uri: `data:model/fbx;base64,${base64}`,
            mimeType: "model/fbx",
            size: convertedFile.byteLength,
        }
    } catch (err) {
        console.error("Error processing file:", err);

        await Promise.all([
            outputPath ? unlink(outputPath).catch(() => {}) : Promise.resolve(),
        ]);

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
    const conversionScript = path.join(process.cwd(), 'src/libs/glb-to-fbx/main.py');
    const blenderExecutable = process.env.BLENDER_DIRECTORY;

    if (!blenderExecutable) {
        return {
            success: false,
            error: "BLENDER_DIRECTORY is not configured"
        };
    }

    return new Promise((resolve) => {
        const py = spawn(blenderExecutable, [
            "--background",
            "--factory-startup",
            "--python",
            conversionScript,
            "--",
            input,
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
                    error: `Blender conversion failed with code ${code} using "${blenderExecutable}": ${stderr || stdout}`
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