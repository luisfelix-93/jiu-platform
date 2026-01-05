import { Request, Response } from "express";
import { ContentService } from "../services/ContentService";

export class ContentController {
    static async upload(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            const { title, description, contentType, fileUrl } = req.body;
            const createdBy = (req as any).user.userId;

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
            const result = await ContentService.listLibrary(req.query);
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
