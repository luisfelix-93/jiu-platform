import api from "../lib/api";

export interface DashboardData {
    upcomingLessons: any[];
    recentAttendance: any[];
    stats: {
        totalAttended: number;
    }
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

    async getProfessorData(): Promise<any> {
        const { data } = await api.get("/dashboard/professor");
        return data;
    }
};
