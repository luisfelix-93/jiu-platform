import { Request, Response, NextFunction } from "express";
import { ErrorLogService } from "../services/ErrorLogService";

export const httpErrorLogger = (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function (body: any) {
        if (res.statusCode >= 400) {
            // Previne duplicidade caso já tenha sido registrado
            if (!(res as any)._errorLogged) {
                (res as any)._errorLogged = true;

                const isServerError = res.statusCode >= 500;
                const level = isServerError ? "error" : "warn";

                let message: string;
                if (typeof body?.error === "string") {
                    message = body.error;
                } else if (typeof body?.message === "string") {
                    message = body.message;
                } else if (typeof body === "string") {
                    message = body;
                } else {
                    message = `HTTP ${res.statusCode} em ${req.method} ${req.path}`;
                }

                const user = (req as any).user;
                const reqId = (req as any).id || req.headers["x-request-id"];

                ErrorLogService.logError({
                    level,
                    message,
                    stack: (res as any)._errStack,
                    statusCode: res.statusCode,
                    endpoint: req.originalUrl || req.path,
                    method: req.method,
                    userId: user?.userId || user?.id,
                    userEmail: user?.email,
                    ip: req.ip || (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim(),
                    userAgent: req.headers["user-agent"] as string,
                    context: {
                        requestId: reqId,
                        errorDetails: body?.details || body?.errors,
                        params: req.params,
                        query: req.query,
                    },
                }).catch(() => {
                    // Failsafe interno no ErrorLogService
                });
            }
        }

        return originalJson.call(this, body);
    };

    next();
};

export default httpErrorLogger;
