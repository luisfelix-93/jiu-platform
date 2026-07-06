import { Request, Response } from "express";
import { UserService } from "../services/UserService";

export class UserController {
    static async getMe(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const result = await UserService.getProfile(userId);
            res.json(result);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    static async updateMe(req: Request, res: Response) {
        try {
            const userId = req.user!.userId;
            const result = await UserService.updateProfile(userId, req.body);
            res.json(result);
        } catch (error: any) {
            if (error.message === "User not found") {
                return res.status(404).json({ error: "User not found" });
            }
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

    // Admin methods
    static async create(req: Request, res: Response) {
        try {
            const result = await UserService.createUser(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            if (error.message === "User already exists") {
                return res.status(409).json({ error: "User already exists" });
            }
            res.status(400).json({ error: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const result = await UserService.updateUser(req.params.id as string, req.body);
            res.json(result);
        } catch (error: any) {
            if (error.message === "User not found") {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(400).json({ error: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            await UserService.deleteUser(req.params.id as string);
            res.json({ message: "User deleted successfully" });
        } catch (error: any) {
            if (error.message === "User not found") {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(400).json({ error: error.message });
        }
    }
}
