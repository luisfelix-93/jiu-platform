import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: "No token provided" });
        return;
    }

    const [, token] = authHeader.split(" ");

    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not defined");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        (req as any).user = decoded; // TODO: Fix type definition
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
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
