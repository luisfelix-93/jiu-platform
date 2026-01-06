import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { ZodError } from "zod";

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            console.log("Registering user");
            const result = await AuthService.register(req.body);

            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000 // 15m
            });
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
            });

            res.status(201).json({ user: result.user });
        } catch (error: any) {
            if (error instanceof ZodError) {
                console.error("Zod Validation Error:", JSON.stringify(error.issues, null, 2));
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

            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000 // 15m
            });
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
            });

            res.json({ user: result.user });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async refresh(req: Request, res: Response) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) throw new Error("No refresh token provided");

            const result = await AuthService.refreshToken(refreshToken);

            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000 // 15m
            });
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
            });

            res.json({ user: result.user });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
