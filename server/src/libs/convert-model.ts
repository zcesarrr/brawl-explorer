import { spawn } from "child_process";
import { writeFile, unlink, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export async function convertModel(formData: FormData) {
    try {
        const file = formData.get("file") as File;

        if (!file) {
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
        const inputFileName = `input_${uniqueId}${path.extname(file.name)}`;
        const outputFileName = `output_${uniqueId}.glb`;
        const inputPath = path.join(tempDir, inputFileName);
        const outputPath = path.join(tempDir, outputFileName);

        const bytes = await file.arrayBuffer();
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
            filename: `converted_${file.name}`,
            mimeType: "model/gltf-binary"
        }
    } catch (error) {
        console.error("Error processing file:", error);

        return {
            success: false,
            error: `Failed to process file: ${error.message}`
        };
    }
}

function executePythonScript(input, output) {
    const pythonScript = path.join(process.cwd(), 'src/python/Supercell-Flat-Converter/main.py');

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