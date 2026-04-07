import { Request, Response, NextFunction } from "express";
import { AcademyService } from "../services/AcademyService";

export const academyScopeMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user?.userId) {
            return next();
        }

        req.user.academyIds = [];

        const academyIds = await AcademyService.getAcademyIdsByUser(req.user.userId);
        req.user.academyIds = Array.isArray(academyIds) ? academyIds : [];
        return next();
    } catch (error) {
        console.error("Academy scope middleware error:", error);
        return res.status(500).json({ message: "Failed to resolve academy scope" });
    }
};
