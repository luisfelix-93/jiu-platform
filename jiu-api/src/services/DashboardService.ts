import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { ScheduledLesson } from "../entities/ScheduledLesson";
import { Attendance } from "../entities/Attendance";
import { MoreThanOrEqual } from "typeorm";

const userRepository = AppDataSource.getRepository(User);
const lessonRepository = AppDataSource.getRepository(ScheduledLesson);
const attendanceRepository = AppDataSource.getRepository(Attendance);

export class DashboardService {
    static async getStudentData(userId: string) {
        // 1. Upcoming lessons (simplified: all upcoming) - ideally check enrollments
        // For now, getting upcoming lessons for the whole system or check if user enrolled to class of lesson
        // Simplified: return global upcoming lessons
        const upcomingLessons = await lessonRepository.find({
            where: { date: MoreThanOrEqual(new Date().toISOString().split('T')[0]) as any },
            relations: ["class", "professor"],
            take: 5,
            order: { date: "ASC", startTime: "ASC" }
        });

        // 2. Recent attendance
        const recentAttendance = await attendanceRepository.find({
            where: { userId },
            relations: ["lesson", "lesson.class"],
            take: 5,
            order: { createdAt: "DESC" }
        });

        // 3. Stats (total classes attended)
        const totalAttended = await attendanceRepository.countBy({
            userId,
            status: 'present'
        });

        return {
            upcomingLessons,
            recentAttendance,
            stats: {
                totalAttended
            }
        };
    }

    static async getProfessorData(userId: string) {
        // 1. Upcoming lessons to teach
        const upcomingLessons = await lessonRepository.find({
            where: {
                professorId: userId,
                date: MoreThanOrEqual(new Date().toISOString().split('T')[0]) as any
            },
            relations: ["class"],
            take: 10,
            order: { date: "ASC", startTime: "ASC" }
        });

        // 2. Recent classes taught (past)
        // ...

        return {
            upcomingLessons
        };
    }

    static async getAdminData() {
        const totalUsers = await userRepository.count();
        const totalStudents = await userRepository.countBy({ role: "aluno" as any });
        const totalProfessors = await userRepository.countBy({ role: "professor" as any });

        return {
            totalUsers,
            totalStudents,
            totalProfessors
        };
    }
}
