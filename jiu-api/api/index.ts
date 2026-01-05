import { AppDataSource } from "../src/data-source";
import app from "../src/app";

const PORT = 3000;

export default async function handler(req: any, res: any) {
    if (!AppDataSource.isInitialized) {
        try {
            await AppDataSource.initialize();
            console.log("Data Source has been initialized!");
        } catch (err) {
            console.error("Error during Data Source initialization:", err);
            return res.status(500).json({ error: "Database connection failed" });
        }
    }

    app(req, res);
}
