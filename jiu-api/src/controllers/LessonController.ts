import { Request, Response } from "express";
import { LessonService } from "../services/LessonService";

export class LessonController {
    static async create(req: Request, res: Response) {
        try {
            const result = await LessonService.createLesson(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
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
