import { Request, Response } from "express";
import { LessonService } from "../services/LessonService";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";

export class LessonController {
    static async create(req: Request, res: Response) {
        try {
            const authReq = req as AuthRequest;
            if (!authReq.user || typeof authReq.user === 'string') {
                return res.status(401).json({ error: "Unauthorized" });
            }

            const userId = (authReq.user as any).userId;

            // Define validation schema
            const createLessonSchema = z.object({
                topic: z.string().optional(),
                description: z.string().optional(),
                classId: z.string().uuid("Invalid class ID"),
                date: z.string().min(1, "Date is required"), // Could validate date format
                startTime: z.string().min(1, "Start time is required"),
                endTime: z.string().min(1, "End time is required"),
            });

            // Validate body
            const validation = createLessonSchema.safeParse(req.body);

            if (!validation.success) {
                return res.status(400).json({ error: validation.error.format() });
            }

            const { topic, description, classId, date, startTime, endTime } = validation.data;

            const lessonData = {
                topic,
                description,
                classId,
                date,
                startTime,
                endTime,
                professorId: userId
            };

            const result = await LessonService.createLesson(lessonData);
            return res.status(201).json(result);
        } catch (error: any) {
            console.error("Error creating lesson:", error?.message); // Log sanitized error information
            // Handle unique constraint violation (Postgres code 23505)
            if (error.code === '23505') {
                return res.status(409).json({ error: "Já existe uma aula agendada para esta turma neste horário." });
            }
            return res.status(400).json({ error: error.message });
        }
    }

    static async list(req: Request, res: Response) {
        try {
            const result = await LessonService.listLessons(req.query);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getOne(req: Request, res: Response) {
        try {
            const result = await LessonService.getLessonById(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    static async updateStatus(req: Request, res: Response) {
        try {
            const { status } = req.body;
            const result = await LessonService.updateStatus(req.params.id, status);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const result = await LessonService.updateLesson(req.params.id, req.body);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            await LessonService.deleteLesson(req.params.id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getUpcoming(req: Request, res: Response) {
        try {
            const result = await LessonService.getUpcomingLessons();
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
