import { Request, Response } from "express";
import { ContentService } from "../services/ContentService";

export class ContentController {
    static async upload(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            const { title, description, contentType, fileUrl } = req.body;
            const createdBy = req.user!.userId;

            // In a real scenario, file upload processing would happen here or via middleware (multer)
            // For MVP, we assume fileUrl is passed or we handling a mock upload.

            const result = await ContentService.uploadContent({
                lessonId,
                title,
                description,
                contentType,
                fileUrl,
                createdBy: { id: createdBy }
            });
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async listLessonContent(req: Request, res: Response) {
        try {
            const result = await ContentService.getLessonContent(req.params.lessonId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getLibrary(req: Request, res: Response) {
        try {
            // Define validation schema for query parameters
            const { z } = require("zod");
            const getLibrarySchema = z.object({
                page: z.coerce.number().int().min(1).optional().default(1),
                limit: z.coerce.number().int().min(1).max(100).optional().default(20)
            });

            // Validate query parameters
            const validation = getLibrarySchema.safeParse(req.query);

            if (!validation.success) {
                return res.status(400).json({ error: validation.error.format() });
            }

            const result = await ContentService.listLibrary(validation.data);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    static async getUploadUrl(req: Request, res: Response) {
        try {
            const { fileName, contentType, lessonId } = req.body;
            if (!fileName || !contentType) {
                return res.status(400).json({ error: "fileName and contentType are required" });
            }
            const result = await ContentService.generateUploadUrl(fileName, contentType, lessonId);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
