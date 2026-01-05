import { Request, Response } from "express";
import { ClassService } from "../services/ClassService";

export class ClassController {
    static async create(req: Request, res: Response) {
        try {
            const result = await ClassService.createClass(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async list(req: Request, res: Response) {
        try {
            const result = await ClassService.listClasses();
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getOne(req: Request, res: Response) {
        try {
            const result = await ClassService.getClassById(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    static async enroll(req: Request, res: Response) {
        try {
            const { studentId } = req.body; // Assuming picking a student, or if self enrollment use user.id
            // If professor enrolling someone else:
            const result = await ClassService.enrollStudent(req.params.id, studentId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getStudents(req: Request, res: Response) {
        try {
            const result = await ClassService.getClassStudents(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async removeStudent(req: Request, res: Response) {
        try {
            const { studentId } = req.params; // /:id/enroll/:studentId
            // Or userId from body
            // Spec says /classes/:id/enroll/:userId
            // But here I'll follow spec: DELETE /api/classes/:id/enroll/:userId
            await ClassService.removeStudent(req.params.id, studentId); // Careful with variable naming
            res.json({ message: "Student removed from class" });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const result = await ClassService.updateClass(req.params.id, req.body);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            await ClassService.deleteClass(req.params.id);
            res.json({ message: "Class deleted successfully" });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

}

