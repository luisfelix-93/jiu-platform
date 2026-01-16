import api from "../lib/api";
import { Lesson } from "./lesson.service";
import { AttendanceRecord } from "./attendance.service";

export interface DashboardData {
    upcomingLessons: Lesson[];
    recentAttendance: AttendanceRecord[];
    stats: {
        totalAttended: number;
    }
}

export interface ProfessorDashboardData {
    upcomingLessons: Lesson[];
    stats?: {
        totalClasses?: number;
        totalStudents?: number;
    };
}

export const DashboardService = {
    async getDashboard(): Promise<DashboardData> {
        const { data } = await api.get("/dashboard");
        return data;
    },

    async getStudentData(): Promise<DashboardData> {
        const { data } = await api.get("/dashboard/aluno");
        return data;
    },

    async getProfessorData(): Promise<ProfessorDashboardData> {
        const { data } = await api.get("/dashboard/professor");
        return data;
    }
};
