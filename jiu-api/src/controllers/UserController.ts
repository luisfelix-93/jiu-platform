import { Request, Response } from "express";
import { UserService } from "../services/UserService";

export class UserController {
    static async getMe(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const result = await UserService.getProfile(userId);
            res.json(result);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    static async updateMe(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const result = await UserService.updateProfile(userId, req.body);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async list(req: Request, res: Response) {
        try {
            const { role } = req.query;
            const result = await UserService.listUsers(role as string);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
