import { AppDataSource } from "../data-source";
import { Attendance } from "../entities/Attendance";
import { ScheduledLesson } from "../entities/ScheduledLesson";
import { User } from "../entities/User";
import { ClassEnrollment } from "../entities/ClassEnrollment";
import { EmailService } from "./EmailService";

const attendanceRepository = AppDataSource.getRepository(Attendance);
const lessonRepository = AppDataSource.getRepository(ScheduledLesson);
const userRepository = AppDataSource.getRepository(User);
const enrollmentRepository = AppDataSource.getRepository(ClassEnrollment);

export class AttendanceService {

    static async registerAttendance(data: any) {
        const { lessonId, userId, status, checkedBy, notes } = data;

        const lesson = await lessonRepository.findOne({
            where: { id: lessonId },
            relations: ["class", "professor"]
        });
        if (!lesson) throw new Error("Lesson not found");

        const student = await userRepository.findOneBy({ id: userId });
        if (!student) throw new Error("Student not found");

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

        const savedAttendance = await attendanceRepository.save(attendance);

        // Send Emails asynchronously so it doesn't block the response
        if (status === 'present') {
            this.sendAttendanceEmails(student, lesson).catch(err => {
                console.error("Failed to send attendance emails:", err);
            });
        }

        return savedAttendance;
    }

    private static async sendAttendanceEmails(student: User, lesson: ScheduledLesson) {
        const promises: Promise<any>[] = [];

        // Email to Student
        if (student.email) {
            promises.push(EmailService.sendMail(
                student.email,
                "Presença Confirmada - Jiu Platform",
                `
                <h1>Presença Confirmada!</h1>
                <p>Olá ${student.name},</p>
                <p>Sua presença foi confirmada para a aula <strong>${lesson.class.name}</strong> agendada para <strong>${lesson.date}</strong> às <strong>${lesson.startTime}</strong>.</p>
                `
            ));
        }

        // Email to Professor
        if (lesson.professor && lesson.professor.email) {
            promises.push(EmailService.sendMail(
                lesson.professor.email,
                "Presença do Aluno Confirmada - Jiu Platform",
                `
                <h1>Presença do Aluno Confirmada!</h1>
                <p>Olá Professor ${lesson.professor.name},</p>
                <p><strong>${student.name}</strong> marcou presença na sua aula<strong>${lesson.class.name}</strong> agendada para <strong>${lesson.date}</strong> às <strong>${lesson.startTime}</strong>.</p>
                `
            ));
        }

        if (promises.length > 0) {
            await Promise.all(promises);
        }
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
