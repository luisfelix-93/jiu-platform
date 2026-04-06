import { Request, Response } from "express";
import { AcademyService } from "../services/AcademyService";
import { createAcademySchema, updateAcademySchema, addProfessorSchema, searchAcademiesSchema } from "../schemas/academy.schema";

export class AcademyController {
    static async create(req: Request, res: Response) {
        try {
            const validation = createAcademySchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ error: validation.error.format() });
            }

            const result = await AcademyService.createAcademy(req.user!.userId, validation.data);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const validation = updateAcademySchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ error: validation.error.format() });
            }

            const result = await AcademyService.updateAcademy(req.params.id, req.user!.userId, validation.data);
            res.json(result);
        } catch (error: any) {
            const status = error.message.includes("owner") ? 403 : 400;
            res.status(status).json({ error: error.message });
        }
    }

    static async getOne(req: Request, res: Response) {
        try {
            const result = await AcademyService.getAcademyById(req.params.id);
            res.json(result);
        } catch (error: any) {
            res.status(404).json({ error: error.message });
        }
    }

    static async getMyAcademies(req: Request, res: Response) {
        try {
            const result = await AcademyService.getAcademiesByUser(req.user!.userId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async search(req: Request, res: Response) {
        try {
            const validation = searchAcademiesSchema.safeParse(req.query);
            if (!validation.success) {
                return res.status(400).json({ error: validation.error.format() });
            }

            const { q, page, limit } = validation.data;
            const result = await AcademyService.searchAcademies(q, page, limit);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async addProfessor(req: Request, res: Response) {
        try {
            const validation = addProfessorSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ error: validation.error.format() });
            }

            const result = await AcademyService.addProfessorToAcademy(
                req.params.id,
                req.user!.userId,
                validation.data.professorId
            );
            res.status(201).json(result);
        } catch (error: any) {
            const status = error.message.includes("owner") ? 403 : 400;
            res.status(status).json({ error: error.message });
        }
    }

    static async removeProfessor(req: Request, res: Response) {
        try {
            await AcademyService.removeProfessorFromAcademy(
                req.params.id,
                req.user!.userId,
                req.params.userId
            );
            res.json({ message: "Professor removido da academia" });
        } catch (error: any) {
            const status = error.message.includes("owner") ? 403 : 400;
            res.status(status).json({ error: error.message });
        }
    }

    static async enrollStudent(req: Request, res: Response) {
        try {
            const result = await AcademyService.enrollStudent(req.params.id, req.user!.userId);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async unenrollStudent(req: Request, res: Response) {
        try {
            await AcademyService.unenrollStudent(req.params.id, req.user!.userId);
            res.json({ message: "Saiu da academia com sucesso" });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
