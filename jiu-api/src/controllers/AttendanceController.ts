import { Request, Response } from "express";
import { AttendanceService } from "../services/AttendanceService";

export class AttendanceController {
    static async register(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            const { userId, status, notes } = req.body;
            const checkedBy = (req as any).user.userId;

            const result = await AttendanceService.registerAttendance({
                lessonId,
                userId,
                status,
                checkedBy,
                notes
            });
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getLessonAttendance(req: Request, res: Response) {
        try {
            const result = await AttendanceService.getLessonAttendance(req.params.lessonId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getStats(req: Request, res: Response) {
        try {
            const userId = req.params.userId || (req as any).user.userId;
            const result = await AttendanceService.getUserAttendanceStats(userId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async checkIn(req: Request, res: Response) {
        try {
            const { lessonId } = req.body;
            const userId = (req as any).user.userId;

            const result = await AttendanceService.registerAttendance({
                lessonId,
                userId,
                status: 'present',
                checkedBy: userId,
                notes: 'Self check-in'
            });
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async checkStatus(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            const userId = (req as any).user.userId;

            const attendance = await AttendanceService.getLessonAttendance(lessonId);
            const userAttendance = attendance.find((a: any) => a.userId === userId);

            res.json({ checkedIn: !!userAttendance, status: userAttendance?.status });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
