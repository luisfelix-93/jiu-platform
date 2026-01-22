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
            // Logic to promote belt/stripe would go here.
            // For now verifying if we need this based on user request "edit missing classes"
            // The user asked to "put a stripe", so we might need this.
            const result = await UserService.promoteStudent(id);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
