import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

import { authConfig } from "../config/auth.config";

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
}

export interface AuthRequest extends Request {
    user?: JwtPayload | string;
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    let token = req.cookies.accessToken;

    if (!token && req.headers.authorization) {
        const parts = req.headers.authorization.split(" ");
        if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
            token = parts[1];
        }
    }

    if (!token) {
        res.status(401).json({ error: "No token provided" });
        return;
    }

    try {
        const decoded = jwt.verify(token, authConfig.getJwtSecret());
        (req as AuthRequest).user = decoded;
        next();
    } catch (err: any) {
        if (err.name === "TokenExpiredError") {
            res.status(401).json({ error: "Token expired" });
            return;
        }
        if (err.name === "JsonWebTokenError") {
            res.status(401).json({ error: "Invalid token" });
            return;
        }
        console.error("Auth middleware error:", err);
        res.status(500).json({ error: "Authentication failed" });
        return;
    }
};

export const checkRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        if (!user || !roles.includes(user.role)) {
            res.status(403).json({ error: "Access denied" });
            return;
        }
        next();
    };
};
