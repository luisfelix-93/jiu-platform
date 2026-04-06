import { Request, Response, NextFunction } from "express";
import { AcademyService } from "../services/AcademyService";

export const academyScopeMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user?.userId) {
            return next();
        }

        const academyIds = await AcademyService.getAcademyIdsByUser(req.user.userId);
        req.user.academyIds = academyIds;
        next();
    } catch (error) {
        console.error("Academy scope middleware error:", error);
        next();
    }
};
