import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { User } from "./entities/User";
import { Academy } from "./entities/Academy";
import { AcademyProfessor } from "./entities/AcademyProfessor";
import { StudentAcademy } from "./entities/StudentAcademy";
import { Attendance } from "./entities/Attendance";
import { Class } from "./entities/Class";
import { ClassEnrollment } from "./entities/ClassEnrollment";
import { LessonContent } from "./entities/LessonContent";
import { Profile } from "./entities/Profile";
import { RefreshToken } from "./entities/RefreshToken";
import { ScheduledLesson } from "./entities/ScheduledLesson";
import { StudentProgress } from "./entities/StudentProgress";

import * as path from "path";

dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL;
const useSSL = isProd || !!databaseUrl;
const sslConfig = useSSL ? { rejectUnauthorized: false } : false;

const baseConfig = databaseUrl
    ? {
          url: databaseUrl,
      }
    : {
          host: process.env.DB_HOST || "localhost",
          port: parseInt(process.env.DB_PORT || "5432"),
          username: process.env.DB_USER || "postgres",
          password: process.env.DB_PASSWORD || "postgres",
          database: process.env.DB_NAME || "jiujitsu_dev",
      };

export const AppDataSource = new DataSource({
    type: "postgres",
    ...baseConfig,
    synchronize: !isProd,
    logging: isProd ? ["error", "warn", "schema", "migration"] : ["error", "warn", "schema"],
    maxQueryExecutionTime: 1000,
    extra: {
        max: 20,
        min: 2,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
        acquireTimeoutMillis: 60000,
        ssl: sslConfig,
        family: 4,
    },
    entities: [
        User,
        Academy,
        AcademyProfessor,
        StudentAcademy,
        Attendance,
        Class,
        ClassEnrollment,
        LessonContent,
        Profile,
        RefreshToken,
        ScheduledLesson,
        StudentProgress
    ],
    migrations: [path.join(__dirname, "migrations", "*.{ts,js}")],
    subscribers: [],
    ssl: sslConfig,
});
