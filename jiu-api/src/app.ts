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

app.get("/", (req, res) => {
    res.json({ message: "Jiu-Jitsu Platform API is running" });
});

export default app;
