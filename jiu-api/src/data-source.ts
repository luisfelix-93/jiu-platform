import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "jiujitsu",
    synchronize: true, // Should be false in production
    logging: false,
    entities: [process.env.NODE_ENV === "production" ? "dist/entities/**/*.js" : "src/entities/**/*.ts"],
    migrations: [process.env.NODE_ENV === "production" ? "dist/migrations/**/*.js" : "src/migrations/**/*.ts"],
    subscribers: [process.env.NODE_ENV === "production" ? "dist/subscribers/**/*.js" : "src/subscribers/**/*.ts"],
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});
