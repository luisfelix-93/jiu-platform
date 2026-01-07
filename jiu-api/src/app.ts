import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import classRoutes from "./routes/class.routes";
import lessonRoutes from "./routes/lesson.routes";
import attendanceRoutes from "./routes/attendance.routes";
import contentRoutes from "./routes/content.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    ...(process.env.FRONTEND_URL?.split(",") ?? [])
].map(origin => origin?.trim()).filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true,
}));
app.use(cookieParser());
app.use(helmet());

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});

// Apply the rate limiting middleware to all requests.
app.use("/api", globalLimiter);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/health", (req, res) => {
    res.json({
        status: "UP",
        timestamp: new Date().toISOString()
    });
});

app.get("/", (req, res) => {
    res.json({ message: "Jiu-Jitsu Platform API is running" });
});

if (process.env.NODE_ENV !== "production") {
    app.get("/api/debug", async (req, res) => {
        try {
            const tables = await import("./data-source").then(m => m.AppDataSource.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"));
            const users = await import("./data-source").then(m => m.AppDataSource.query("SELECT count(*) FROM users"));
            res.json({
                message: "Database Debug",
                tables,
                userCount: users[0] || 0,
                env: process.env.NODE_ENV,
                entitiesLoaded: import("./data-source").then(m => m.AppDataSource.entityMetadatas.map(e => e.name))
            });
        } catch (error: any) {
            res.status(500).json({ error: error.message, stack: error.stack });
        }
    });
}

export default app;
