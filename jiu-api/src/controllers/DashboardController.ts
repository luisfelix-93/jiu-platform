import { Request, Response } from "express";
import { DashboardService } from "../services/DashboardService";
import { UserRole } from "../entities/User";

export class DashboardController {
    static async getDashboard(req: Request, res: Response) {
        try {
            const user = (req as any).user;

            if (user.role === UserRole.ALUNO) {
                const data = await DashboardService.getStudentData(user.userId);
                res.json(data);
            } else if (user.role === UserRole.PROFESSOR) {
                const data = await DashboardService.getProfessorData(user.userId);
                res.json(data);
            } else if (user.role === UserRole.ADMIN) {
                const data = await DashboardService.getAdminData();
                res.json(data);
            } else {
                res.status(400).json({ error: "Unknown role" });
            }
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getStudentDashboard(req: Request, res: Response) {
        try {
            const result = await DashboardService.getStudentData((req as any).user.userId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getProfessorDashboard(req: Request, res: Response) {
        try {
            const result = await DashboardService.getProfessorData((req as any).user.userId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getAdminDashboard(req: Request, res: Response) {
        try {
            const result = await DashboardService.getAdminData();
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
