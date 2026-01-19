import { AppDataSource } from "../data-source";
import { LessonContent } from "../entities/LessonContent";
import { ScheduledLesson } from "../entities/ScheduledLesson";
import { User } from "../entities/User";
import { storageService } from "./StorageService";

const contentRepository = AppDataSource.getRepository(LessonContent);
const lessonRepository = AppDataSource.getRepository(ScheduledLesson);
const userRepository = AppDataSource.getRepository(User);

export class ContentService {
    static async uploadContent(data: any) {
        const lesson = await lessonRepository.findOneBy({ id: data.lessonId });
        if (!lesson) throw new Error("Lesson not found");

        const content = contentRepository.create(data);
        return await contentRepository.save(content);
    }

    static async getLessonContent(lessonId: string) {
        return await contentRepository.find({
            where: { lessonId },
            relations: ["createdBy"]
        });
    }

    static async getContentById(id: string) {
        const content = await contentRepository.findOne({
            where: { id },
            relations: ["lesson"]
        });
        if (!content) throw new Error("Content not found");
        return content;
    }

    static async listLibrary(filters: any) {
        // Mock filters for library
        return await contentRepository.find({
            relations: ["lesson"],
            take: 50
        });
    }

    static async generateUploadUrl(fileName: string, contentType: string, lessonId?: string) {

        const timestamp = Date.now();
        // sanitize filename
        const cleanFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const key = `lessons/${lessonId || 'library'}/${timestamp}-${cleanFileName}`;

        const uploadUrl = await storageService.getUploadUrl(key, contentType);
        const publicUrl = storageService.getPublicUrl(key);

        return { uploadUrl, publicUrl, key };
    }
}
