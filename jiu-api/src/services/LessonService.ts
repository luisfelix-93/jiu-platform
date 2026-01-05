import { AppDataSource } from "../data-source";
import { ScheduledLesson } from "../entities/ScheduledLesson";
import { Class } from "../entities/Class";
import { User } from "../entities/User";
import { MoreThanOrEqual, LessThanOrEqual, Between } from "typeorm";

const lessonRepository = AppDataSource.getRepository(ScheduledLesson);
const classRepository = AppDataSource.getRepository(Class);
const userRepository = AppDataSource.getRepository(User);

export class LessonService {
    static async createLesson(data: any) {
        const cls = await classRepository.findOneBy({ id: data.classId });
        if (!cls) throw new Error("Class not found");

        const professor = await userRepository.findOneBy({ id: data.professorId });
        if (!professor) throw new Error("Professor not found");

        const lesson = lessonRepository.create({
            ...data,
            class: cls,
            professor: professor
        });

        return await lessonRepository.save(lesson);
    }

    static async listLessons(filters: any) {
        const where: any = {};
        if (filters.classId) where.classId = filters.classId;
        if (filters.status) where.status = filters.status;

        // Date range filter
        if (filters.startDate && filters.endDate) {
            where.date = Between(filters.startDate, filters.endDate);
        } else if (filters.startDate) {
            where.date = MoreThanOrEqual(filters.startDate);
        }

        return await lessonRepository.find({
            where,
            relations: ["class", "professor"],
            order: { date: "ASC", startTime: "ASC" }
        });
    }

    static async getLessonById(id: string) {
        const lesson = await lessonRepository.findOne({
            where: { id },
            relations: ["class", "professor"]
        });
        if (!lesson) throw new Error("Lesson not found");
        return lesson;
    }

    static async updateStatus(id: string, status: string) {
        const lesson = await lessonRepository.findOneBy({ id });
        if (!lesson) throw new Error("Lesson not found");

        lesson.status = status;
        return await lessonRepository.save(lesson);
    }

    static async updateLesson(id: string, data: any) {
        const lesson = await lessonRepository.findOneBy({ id });
        if (!lesson) throw new Error("Lesson not found");

        lesson.topic = data.topic ?? lesson.topic;
        lesson.date = data.date ?? lesson.date;
        lesson.startTime = data.startTime ?? lesson.startTime;
        lesson.endTime = data.endTime ?? lesson.endTime;

        if (data.classId) {
            const cls = await classRepository.findOneBy({ id: data.classId });
            if (cls) lesson.class = cls;
        }

        return await lessonRepository.save(lesson);
    }

    static async deleteLesson(id: string) {
        const lesson = await lessonRepository.findOneBy({ id });
        if (!lesson) throw new Error("Lesson not found");
        return await lessonRepository.remove(lesson);
    }

    static async getUpcomingLessons() {
        const today = new Date().toISOString().split('T')[0];
        return await lessonRepository.find({
            where: { date: MoreThanOrEqual(today) as any }, // TypeORM date string issue sometimes
            relations: ["class"],
            take: 5,
            order: { date: "ASC", startTime: "ASC" }
        });
    }
}
