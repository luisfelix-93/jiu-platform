import api from "../lib/api";

export interface AttendanceStats {
    totalClasses: number;
    monthlyAttendance: { month: string; count: number }[];
    streak: number;
    lastClass?: {
        date: string;
        className: string;
    };
}

export const AttendanceService = {
    async getMyStats(): Promise<AttendanceStats> {
        const { data } = await api.get("/attendance/me/stats");
        return data;
    },

    async getUserStats(userId: string): Promise<AttendanceStats> {
        const { data } = await api.get(`/attendance/stats/${userId}`);
        return data;
    },

    async getLessonAttendance(lessonId: string): Promise<any[]> {
        const { data } = await api.get(`/lessons/${lessonId}/attendance`);
        return data;
    },

    // Register single attendance (or update)
    async register(lessonId: string, data: { userId: string; status: string; notes?: string }): Promise<any> {
        // According to routes: PUT /api/attendance/:lessonId
        // But body has userId.
        const response = await api.put(`/attendance/${lessonId}`, data);
        return response.data;
    }
};
