import { AppDataSource } from "../data-source";
import { ScheduledLesson } from "../entities/ScheduledLesson";
import { Class } from "../entities/Class";
import { User } from "../entities/User";
import { MoreThanOrEqual, LessThanOrEqual, Between, In } from "typeorm";

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

    static async listLessons(filters: any, academyIds?: string[]) {
        const qb = lessonRepository.createQueryBuilder("lesson")
            .leftJoinAndSelect("lesson.class", "class")
            .leftJoinAndSelect("lesson.professor", "professor");

        if (academyIds && academyIds.length > 0) {
            qb.andWhere("class.academy_id IN (:...academyIds)", { academyIds });
        }

        if (filters.classId) {
            qb.andWhere("lesson.class_id = :classId", { classId: filters.classId });
        }
        if (filters.status) {
            qb.andWhere("lesson.status = :status", { status: filters.status });
        }
        if (filters.startDate && filters.endDate) {
            qb.andWhere("lesson.date BETWEEN :startDate AND :endDate", {
                startDate: filters.startDate,
                endDate: filters.endDate,
            });
        } else if (filters.startDate) {
            qb.andWhere("lesson.date >= :startDate", { startDate: filters.startDate });
        }

        const page = filters.page || 1;
        const limit = filters.limit || 20;
        const orderDirection = filters.orderDirection || "ASC";

        qb.orderBy("lesson.date", orderDirection)
            .addOrderBy("lesson.startTime", orderDirection)
            .skip((page - 1) * limit)
            .take(limit);

        const [data, total] = await qb.getManyAndCount();
        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: { page, limit, total, totalPages },
        };
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

    static async getUpcomingLessons(academyIds?: string[]) {
        const today = new Date().toISOString().split('T')[0];

        const qb = lessonRepository.createQueryBuilder("lesson")
            .leftJoinAndSelect("lesson.class", "class")
            .where("lesson.date >= :today", { today });

        if (academyIds && academyIds.length > 0) {
            qb.andWhere("class.academy_id IN (:...academyIds)", { academyIds });
        }

        qb.orderBy("lesson.date", "ASC")
            .addOrderBy("lesson.startTime", "ASC")
            .take(20);

        return await qb.getMany();
    }
}
