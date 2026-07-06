import { Request, Response } from "express";
import { UserService } from "../services/UserService";
import { z } from "zod";

export class GraduationController {
    static async listStudents(req: Request, res: Response) {
        try {
            const result = await UserService.listStudentsWithGraduationInfo();
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async updateGoal(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const schema = z.object({
                goal: z.number().min(0)
            });

            const { goal } = schema.parse(req.body);

            const result = await UserService.updateGraduationGoal(id, goal);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async promoteStudent(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await UserService.promoteStudent(id);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async adjustAttendance(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const schema = z.object({
                newCount: z.number().min(0)
            });

            const { newCount } = schema.parse(req.body);
            const adjustedBy = (req as any).user?.userId;

            if (!adjustedBy) {
                throw new Error("Authenticated user not found");
            }

            const result = await UserService.adjustAttendanceCount(id as string, newCount, adjustedBy);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async updateGraduationDate(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const schema = z.object({
                date: z.string().nullable()
            });

            const { date } = schema.parse(req.body);
            
            const result = await UserService.updateGraduationDate(id as string, date ? new Date(date) : null);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
