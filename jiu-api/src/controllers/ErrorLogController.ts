import { Request, Response } from "express";
import { ErrorLogService } from "../services/ErrorLogService";

export class ErrorLogController {
    static async list(req: Request, res: Response) {
        try {
            const { page, limit, level, statusCode, startDate, endDate } = req.query;

            const result = await ErrorLogService.listLogs({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                level: level as string,
                statusCode: statusCode ? Number(statusCode) : undefined,
                startDate: startDate as string,
                endDate: endDate as string,
            });

            res.json(result);
        } catch (error: any) {
            res.status(500).json({ error: error.message || "Failed to list error logs" });
        }
    }

    static async getOne(req: Request, res: Response) {
        try {
            const id = typeof req.params.id === "string" ? req.params.id : (req.params.id?.[0] as string);
            const log = await ErrorLogService.getLogById(id);

            if (!log) {
                res.status(404).json({ error: "Error log not found" });
                return;
            }

            res.json(log);
        } catch (error: any) {
            res.status(500).json({ error: error.message || "Failed to get error log" });
        }
    }

    static async clearOld(req: Request, res: Response) {
        try {
            const days = req.query.days ? Number(req.query.days) : 15;
            const affected = await ErrorLogService.clearOldLogs(days);
            res.json({ message: `Cleared ${affected} old logs older than ${days} days`, affected });
        } catch (error: any) {
            res.status(500).json({ error: error.message || "Failed to clear error logs" });
        }
    }

    static async sanitize(req: Request, res: Response) {
        try {
            const days = req.body?.days || req.query?.days ? Number(req.body?.days || req.query?.days) : 15;
            const affected = await ErrorLogService.sanitize(days);
            res.json({ message: `Sanitized ${affected} error logs older than ${days} days`, affected });
        } catch (error: any) {
            res.status(500).json({ error: error.message || "Failed to sanitize error logs" });
        }
    }
}
