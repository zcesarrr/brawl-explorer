import express from "express";
import type { Express, Request, Response } from "express";

const PORT = 3000;

const app: Express = express();

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({
        message: "Hello!",
    });
});

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});
