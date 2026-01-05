import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { ZodError } from "zod";

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const result = await AuthService.register(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            if (error instanceof ZodError) {
                return res.status(400).json({ error: "Validation error", details: error.issues });
            }
            if (error.message === "User already exists") {
                return res.status(409).json({ error: "User already exists" });
            }
            console.error("Registration error:", error);
            res.status(400).json({ error: error.message });
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const result = await AuthService.login(req.body);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async refresh(req: Request, res: Response) {
        try {
            const { refreshToken } = req.body;
            const result = await AuthService.refreshToken(refreshToken);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
