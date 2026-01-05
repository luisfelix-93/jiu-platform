import { AppDataSource } from "../data-source";
import { Attendance } from "../entities/Attendance";
import { ScheduledLesson } from "../entities/ScheduledLesson";
import { User } from "../entities/User";
import { ClassEnrollment } from "../entities/ClassEnrollment";

const attendanceRepository = AppDataSource.getRepository(Attendance);
const lessonRepository = AppDataSource.getRepository(ScheduledLesson);
const userRepository = AppDataSource.getRepository(User);
const enrollmentRepository = AppDataSource.getRepository(ClassEnrollment);

export class AttendanceService {
    static async registerAttendance(data: any) {
        const { lessonId, userId, status, checkedBy, notes } = data;

        const lesson = await lessonRepository.findOne({
            where: { id: lessonId },
            relations: ["class"]
        });
        if (!lesson) throw new Error("Lesson not found");

        // Check if user is enrolled (optional, but good practice)
        const enrollment = await enrollmentRepository.findOneBy({ classId: lesson.classId, userId });
        // if (!enrollment) throw new Error("Student not enrolled in this class"); // Maybe allow trial class?

        let attendance = await attendanceRepository.findOneBy({ lessonId, userId });

        if (attendance) {
            attendance.status = status;
            attendance.notes = notes;
            attendance.checkInTime = new Date();
        } else {
            attendance = attendanceRepository.create({
                lessonId,
                userId,
                status,
                checkedBy,
                notes,
                checkInTime: new Date()
            });
        }

        return await attendanceRepository.save(attendance);
    }

    static async getLessonAttendance(lessonId: string) {
        return await attendanceRepository.find({
            where: { lessonId },
            relations: ["user"]
        });
    }

    static async getUserAttendanceStats(userId: string) {
        const attendances = await attendanceRepository.find({
            where: { userId },
            relations: ["lesson", "lesson.class"]
        });

        const total = attendances.length;
        const present = attendances.filter(a => a.status === 'present').length;

        return {
            total,
            present,
            history: attendances
        };
    }
}
