import "reflect-metadata";
import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import classRoutes from "./routes/class.routes";
import lessonRoutes from "./routes/lesson.routes";
import attendanceRoutes from "./routes/attendance.routes";
import contentRoutes from "./routes/content.routes";
import dashboardRoutes from "./routes/dashboard.routes";

const app = express();

app.use(cors());
app.use(helmet());
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

export default app;
