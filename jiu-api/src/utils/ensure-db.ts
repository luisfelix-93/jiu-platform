import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

export async function ensureDatabaseExists() {
    const dbName = process.env.DB_NAME || "jiujitsu";

    // Connect to the default 'postgres' database to manage other databases
    const client = new Client({
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        database: "postgres", // Connect to default DB
    });

    try {
        await client.connect();

        const res = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );

        if (res.rowCount === 0) {
            console.log(`Database '${dbName}' not found. Creating...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database '${dbName}' created successfully.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }
    } catch (error) {
        console.warn("Could not ensure database existence. Skipping...", error);
        // Don't crash, maybe it already exists or user has restricted permissions.
        // Let TypeORM try to connect and fail normally if needed.
    } finally {
        await client.end();
    }
}
