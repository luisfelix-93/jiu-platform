import { Request, Response, NextFunction } from "express";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import logger from "../utils/logger";

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Enrich active OpenTelemetry span if available
    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
        activeSpan.recordException(err);
        activeSpan.setStatus({
            code: SpanStatusCode.ERROR,
            message: err?.message || "Internal Server Error",
        });
    }

    const reqId = (req as any).id || req.headers["x-request-id"];

    logger.error(
        {
            err,
            requestId: reqId,
            method: req.method,
            path: req.path,
            statusCode: err.statusCode || 500,
        },
        `Unhandled error: ${err.message || "Unknown error"}`
    );

    if (res.headersSent) {
        return next(err);
    }

    const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;
    const message = statusCode === 500 && process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message || "An unexpected error occurred";

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
        requestId: reqId,
    });
};

export default errorHandler;
