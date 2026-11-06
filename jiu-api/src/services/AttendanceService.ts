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

    private static getEffectiveAttendanceDate(attendance: Attendance): Date {
        if (attendance.lesson?.date) {
            const d = new Date(attendance.lesson.date);
            if (!isNaN(d.getTime())) {
                return d;
            }
        }
        if (attendance.checkInTime) {
            const d = new Date(attendance.checkInTime);
            if (!isNaN(d.getTime())) {
                return d;
            }
        }
        if (attendance.createdAt) {
            const d = new Date(attendance.createdAt);
            if (!isNaN(d.getTime())) {
                return d;
            }
        }
        return new Date();
    }

    static async getUserAttendanceStats(userId: string) {
        // Fetch attendances sorted by createdAt descending as baseline
        const attendances = await attendanceRepository.find({
            where: { userId, status: 'present' },
            relations: ["lesson", "lesson.class"],
            order: {
                createdAt: "DESC"
            }
        });

        // Refine sorting in memory by effective attendance date descending
        attendances.sort((a, b) => {
            const dateA = AttendanceService.getEffectiveAttendanceDate(a).getTime();
            const dateB = AttendanceService.getEffectiveAttendanceDate(b).getTime();
            return dateB - dateA;
        });

        // 1. Total Classes
        const totalClasses = attendances.length;

        // 2. Streak Calculation (Consecutive Days Present)
        let streak = 0;
        if (attendances.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Get unique dates of attendance using effective date
            const uniqueDates = Array.from(
                new Set(attendances.map(a => AttendanceService.getEffectiveAttendanceDate(a).toDateString()))
            );

            // Check if user attended today or yesterday to start streak counting
            // Convert strings back to dates for comparison
            const sortedUniqueDates = uniqueDates.map(d => {
                const date = new Date(d);
                date.setHours(0, 0, 0, 0);
                return date;
            }).sort((a, b) => b.getTime() - a.getTime());

            if (sortedUniqueDates.length > 0) {
                const firstDate = sortedUniqueDates[0];
                const diffTime = Math.abs(today.getTime() - firstDate.getTime());
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                // If last attendance was today (0) or yesterday (1), streak is alive
                if (diffDays <= 1) {
                    streak = 1;
                    // Iterate backwards checking for continuity
                    for (let i = 0; i < sortedUniqueDates.length - 1; i++) {
                        const current = sortedUniqueDates[i];
                        const prev = sortedUniqueDates[i + 1];

                        const dTime = Math.abs(current.getTime() - prev.getTime());
                        const dDays = Math.round(dTime / (1000 * 60 * 60 * 24));

                        if (dDays === 1) {
                            streak++;
                        } else {
                            break;
                        }
                    }
                }
            }
        }

        // 3. Last Class with null safety and friendly fallback labels
        let lastClass: { date: string; className: string } | null = null;
        if (attendances.length > 0) {
            const first = attendances[0];
            const dateStr = first.lesson?.date 
                ? (typeof first.lesson.date === 'string' ? first.lesson.date : new Date(first.lesson.date).toISOString())
                : AttendanceService.getEffectiveAttendanceDate(first).toISOString();

            let className = "Aula Avulsa";
            if (first.lesson?.class?.name) {
                className = first.lesson.class.name;
            } else if (first.isManualCredit) {
                className = "Crédito Manual";
            }

            lastClass = {
                date: dateStr,
                className
            };
        }

        // 4. Monthly Attendance (Last 6 months)
        const monthlyAttendance: { month: string; count: number }[] = [];
        const monthMap = new Map<string, number>();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString('pt-BR', { month: 'long' }); // e.g., "janeiro"
            monthMap.set(key, 0);
            if (!monthlyAttendance.find(m => m.month === key)) {
                monthlyAttendance.push({ month: key, count: 0 });
            }
        }

        attendances.forEach(a => {
            const d = AttendanceService.getEffectiveAttendanceDate(a);
            const key = d.toLocaleString('pt-BR', { month: 'long' });
            if (monthMap.has(key)) {
                const matchIndex = monthlyAttendance.findIndex(m => m.month === key);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - d.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 180 && matchIndex !== -1) {
                    monthlyAttendance[matchIndex].count++;
                }
            }
        });

        // 5. Graduation Info
        const user = await userRepository.findOne({ where: { id: userId }, select: ["beltColor", "stripeCount", "nextGraduationGoal"] });
        const graduation = user ? {
            beltColor: user.beltColor,
            stripeCount: user.stripeCount,
            nextGoal: user.nextGraduationGoal || 0, // 0 means not set
            remaining: user.nextGraduationGoal ? Math.max(0, user.nextGraduationGoal - totalClasses) : 0
        } : null;

        return {
            totalClasses,
            streak,
            lastClass,
            monthlyAttendance,
            graduation
        };
    }
}
