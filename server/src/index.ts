import "dotenv/config";

import express from "express";
import type { Express, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";
import path from "path";
import multer from "multer";
import { randomUUID } from "crypto";
import { convertModel } from "./libs/convert-model.js";
import { convertTexture } from "./libs/convert-texture.js";
import { convertGlbToFbx } from "./libs/glb-to-fbx.js";

const assetsDirectory = process.env.ASSETS_DIRECTORY || "";
const uploadDirectory = path.join(process.cwd(), "temp", "uploads");

const PORT = Number(process.env.PORT);

if (!existsSync(uploadDirectory)) {
    mkdirSync(uploadDirectory, { recursive: true });
}

const upload = multer({
    storage: multer.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, uploadDirectory);
        },
        filename: (_req, file, cb) => {
            const extension = path.extname(file.originalname) || ".glb";
            cb(null, `${randomUUID()}${extension}`);
        },
    }),
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        if (extension !== ".glb") {
            cb(new Error("Only .glb files are allowed"));
            return;
        }

        cb(null, true);
    },
});

const app: Express = express();
app.use(cors({
    origin: process.env.ORIGIN_ALLOWED?.split(","),
    optionsSuccessStatus: 200,
}));
app.use(express.json({ limit: "20mb" }))
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

app.post("/glb-to-fbx", upload.single("file"), async (req: Request, res: Response) => {
    const uploadedFilePath = req.file?.path;

    if (!uploadedFilePath) {
        return res.status(400).json({
            success: false,
            error: "file is required",
        });
    }

    const result = await convertGlbToFbx(uploadedFilePath);

    await fs.unlink(uploadedFilePath).catch(() => {});

    if (!result.success) {
        return res.status(500).json({
            success: false,
            error: result.error ?? "Conversion failed",
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
        error: "Something went wrong",
    });
});

app.listen(PORT);
