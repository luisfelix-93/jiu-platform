import { AppDataSource } from "../data-source";
import { ErrorLog, ErrorLogLevel } from "../entities/ErrorLog";
import logger from "../utils/logger";

export interface LogErrorInput {
    level?: ErrorLogLevel;
    message: string;
    stack?: string;
    statusCode?: number;
    endpoint?: string;
    method?: string;
    userId?: string;
    userEmail?: string;
    ip?: string;
    userAgent?: string;
    context?: Record<string, any>;
}

export class ErrorLogService {
    private static repository() {
        return AppDataSource.getRepository(ErrorLog);
    }

    static async logError(input: LogErrorInput): Promise<ErrorLog | null> {
        try {
            if (!AppDataSource.isInitialized) {
                return null;
            }

            const repo = this.repository();
            const log = repo.create({
                level: input.level || "error",
                message: input.message,
                stack: input.stack,
                statusCode: input.statusCode,
                endpoint: input.endpoint,
                method: input.method,
                userId: input.userId,
                userEmail: input.userEmail,
                ip: input.ip,
                userAgent: input.userAgent,
                context: input.context,
            });

            return await repo.save(log);
        } catch (dbError) {
            // Failsafe: gravação no banco não pode derrubar o error handler nem a aplicação
            logger.error({ dbError }, "Failed to persist error log into database");
            return null;
        }
    }

    static async listLogs(filters: {
        page?: number;
        limit?: number;
        level?: string;
        statusCode?: number;
        startDate?: string;
        endDate?: string;
    }) {
        const repo = this.repository();
        const page = Math.max(1, Number(filters.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
        const skip = (page - 1) * limit;

        const qb = repo.createQueryBuilder("log");

        if (filters.level) {
            qb.andWhere("log.level = :level", { level: filters.level });
        }

        if (filters.statusCode) {
            qb.andWhere("log.statusCode = :statusCode", { statusCode: Number(filters.statusCode) });
        }

        if (filters.startDate) {
            qb.andWhere("log.createdAt >= :startDate", { startDate: filters.startDate });
        }

        if (filters.endDate) {
            qb.andWhere("log.createdAt <= :endDate", { endDate: filters.endDate });
        }

        qb.orderBy("log.createdAt", "DESC")
            .skip(skip)
            .take(limit);

        const [data, total] = await qb.getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    static async getLogById(id: string): Promise<ErrorLog | null> {
        const repo = this.repository();
        return await repo.findOneBy({ id });
    }

    static async sanitize(retentionDays: number = 15): Promise<number> {
        try {
            if (!AppDataSource.isInitialized) return 0;

            // Tenta executar a function plpgsql no PostgreSQL
            try {
                const result = await AppDataSource.query("SELECT sanitize_error_logs($1)", [retentionDays]);
                const affected = Number(result[0]?.sanitize_error_logs) || 0;
                logger.info({ affected, retentionDays }, "Sanitized error_logs table via PostgreSQL function");
                return affected;
            } catch {
                // Fallback para TypeORM delete se a function não estiver instalada
                return await this.clearOldLogs(retentionDays);
            }
        } catch (err) {
            logger.error({ err }, "Failed to sanitize error logs");
            return 0;
        }
    }

    static async clearOldLogs(daysToKeep: number = 15): Promise<number> {
        const repo = this.repository();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

        const result = await repo
            .createQueryBuilder()
            .delete()
            .from(ErrorLog)
            .where("createdAt < :cutoffDate", { cutoffDate })
            .execute();

        return result.affected || 0;
    }
}
