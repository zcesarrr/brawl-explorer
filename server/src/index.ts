import express from "express";
import type { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { convertModel } from "./libs/convert-model.js";

const modelsDirectory = "/home/CesarZ/Desktop/install_time_asset_pack/assets/sc3d";

const PORT = 3000;

const app: Express = express();
app.use(cors({
    origin: ["http://localhost:5173", "http://192.168.50.28:5173"],
    optionsSuccessStatus: 200,
}));
app.disable('x-powered-by');
app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
    const files = (await fs.readdir(modelsDirectory)).filter(file => file.endsWith("geo.glb"));

    return res.status(200).json({
        success: true,
        data: {
            results: files.length,
            models: files,
        },
    });
});

app.post("/parse-model", async (req: Request, res: Response) => {
    const { filename } = req.body as { filename?: string };

    if (!filename || typeof filename !== "string") {
        return res.status(400).json({
            success: false,
            error: "filename is required",
        });
    }

    const normalizedName = path.basename(filename);
    if (normalizedName !== filename) {
        return res.status(400).json({
            success: false,
            error: "Invalid filename",
        });
    }

    const availableModels = (await fs.readdir(modelsDirectory)).filter(file => file.endsWith("geo.glb"));
    if (!availableModels.includes(normalizedName)) {
        return res.status(404).json({
            success: false,
            error: "Model not found",
        });
    }

    const modelPath = path.join(modelsDirectory, normalizedName);
    const result = await convertModel(modelPath);

    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: result.error ?? "Failed to convert model",
        });
    }

    return res.status(200).json({
        success: true,
        data: result,
    });
});

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).json({
        success: false,
        error: "Nothing to see here",
    });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);

    res.status(500).json({
        success: false,
        error: "Something wen wrong",
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Listening on http://localhost:${PORT}`);
});
