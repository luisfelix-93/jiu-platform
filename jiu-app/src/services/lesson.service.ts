import api from "../lib/api";

export interface Lesson {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    topic: string;
    status: string;
    class: {
        name: string;
    };
    professor: {
        name: string;
    };
}

export const LessonService = {
    async listLessons(filters?: { startDate?: string; endDate?: string, classId?: string }): Promise<Lesson[]> {
        const { data } = await api.get("/lessons", { params: filters });
        return data;
    },

    async getUpcomingLessons(): Promise<Lesson[]> {
        const { data } = await api.get("/lessons/upcoming");
        return data;
    },

    async createLesson(data: any): Promise<Lesson> {
        const { data: lesson } = await api.post("/lessons", data);
        return lesson;
    },

    async updateLesson(id: string, data: any): Promise<Lesson> {
        const { data: lesson } = await api.put(`/lessons/${id}`, data);
        return lesson;
    },

    async deleteLesson(id: string): Promise<void> {
        await api.delete(`/lessons/${id}`);
    },

    async checkIn(lessonId: string): Promise<void> {
        await api.post('/attendance/check-in', { lessonId });
    },

    async getAttendanceStatus(lessonId: string): Promise<{ checkedIn: boolean; status?: string }> {
        const { data } = await api.get(`/attendance/status/${lessonId}`);
        return data;
    }
};
