import express from "express";
import cors from "cors";
import { router } from './routes.js';

export function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use('/api', router);

    app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        console.error('Error:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    });

    return app;
}