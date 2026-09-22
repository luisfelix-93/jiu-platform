import { Request, Response, NextFunction } from "express";
import { pinoHttp } from "pino-http";
import crypto from "node:crypto";
import logger from "../utils/logger";

export const requestLogger = pinoHttp({
    logger,
    genReqId: (req: Request, res: Response) => {
        const existingId = req.headers["x-request-id"] as string;
        const reqId = existingId || crypto.randomUUID();
        res.setHeader("X-Request-Id", reqId);
        return reqId;
    },
    customLogLevel: (req: Request, res: Response, err?: Error) => {
        if (res.statusCode >= 500 || err) {
            return "error";
        }
        if (res.statusCode >= 400) {
            return "warn";
        }
        if (req.url === "/health" || req.url === "/") {
            return "trace";
        }
        return "info";
    },
    customProps: (req: Request, res: Response) => {
        const user = (req as any).user;
        const academyId = (req as any).academyId;
        return {
            userId: user?.id,
            userRole: user?.role,
            academyId: academyId || user?.academyId,
        };
    },
    customSuccessMessage: (req: Request, res: Response, responseTime: number) => {
        return `${req.method} ${req.url} ${res.statusCode} - ${Math.round(responseTime)}ms`;
    },
    customErrorMessage: (req: Request, res: Response, error: Error) => {
        return `${req.method} ${req.url} ${res.statusCode} - ${error.message}`;
    },
});

export default requestLogger;
