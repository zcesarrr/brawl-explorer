import "dotenv/config";

import express from "express";
import type { Express, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { convertModel } from "./libs/convert-model.js";
import { convertTexture } from "./libs/convert-texture.js";

const assetsDirectory = process.env.ASSETS_DIRECTORY || "";

const PORT = Number(process.env.PORT);

const app: Express = express();
app.use(cors({
    origin: process.env.ORIGIN_ALLOWED?.split(","),
    optionsSuccessStatus: 200,
}));
app.disable('x-powered-by');
app.use(express.json());
app.use(helmet());

app.get("/models", async (req: Request, res: Response) => {
    const files = (await fs.readdir(assetsDirectory)).filter(file => file.endsWith("geo.glb"));

    return res.status(200).json({
        success: true,
        data: {
            results: files.length,
            models: files,
        },
    });
});

app.get("/textures", async (req: Request, res: Response) => {
    const files = (await fs.readdir(assetsDirectory)).filter(file => file.endsWith("tex.sctx"));

    return res.status(200).json({
        success: true,
        data: {
            results: files.length,
            textures: files,
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

    const availableModels = (await fs.readdir(assetsDirectory)).filter(file => file.endsWith("geo.glb"));
    if (!availableModels.includes(normalizedName)) {
        return res.status(404).json({
            success: false,
            error: "Model not found",
        });
    }

    const modelPath = path.join(assetsDirectory, normalizedName);
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

app.post("/parse-texture", async (req: Request, res: Response) => {
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

    const availableTextures = (await fs.readdir(assetsDirectory)).filter(file => file.endsWith("tex.sctx"));
    if (!availableTextures.includes(normalizedName)) {
        return res.status(404).json({
            success: false,
            error: "Texture not found",
        });
    }

    const texturePath = path.join(assetsDirectory, normalizedName);
    const result = await convertTexture(texturePath);

    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: result.error ?? "Failed to convert texture",
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

app.listen(PORT);
