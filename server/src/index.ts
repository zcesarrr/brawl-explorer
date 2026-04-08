import express from "express";
import type { Express, NextFunction, Request, Response } from "express";
import multer from "multer";
import fs from "fs/promises";

const modelsDirectory = "/home/CesarZ/Desktop/install_time_asset_pack/assets/sc3d";

const PORT = 3000;
const upload = multer({ dest: "uploads/" });

const app: Express = express();
app.disable('x-powered-by');

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

app.post("/parse-model", upload.single("file"), async (req: Request, res: Response) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({
            success: false,
            error: "No file received",
        });
    }

    return res.status(200).json({
        success: true,
        data: {
            originalName: file.originalname,
            filename: file.fieldname,
            size: file.size,
        }
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

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});
