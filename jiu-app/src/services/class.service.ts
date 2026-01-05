import api from "../lib/api";

export interface Class {
    id: string;
    name: string;
    description: string;
    schedule: {
        days: string[];
        time: string;
    };
    maxStudents: number;
    academyId?: string;
}

export const ClassService = {
    async createClass(data: Partial<Class>): Promise<Class> {
        const { data: newClass } = await api.post("/classes", data);
        return newClass;
    },

    async updateClass(id: string, data: Partial<Class>): Promise<Class> {
        const { data: updatedClass } = await api.put(`/classes/${id}`, data);
        return updatedClass;
    },

    async deleteClass(id: string): Promise<void> {
        await api.delete(`/classes/${id}`);
    },

    async listClasses(): Promise<Class[]> {
        const { data } = await api.get("/classes");
        return data;
    },

    async enroll(classId: string, studentId: string): Promise<any> {
        const { data } = await api.post(`/classes/${classId}/enroll`, { studentId });
        return data;
    },

    async getClassStudents(classId: string): Promise<any[]> {
        const { data } = await api.get(`/classes/${classId}/students`);
        return data;
    },

    async removeStudent(classId: string, studentId: string): Promise<void> {
        await api.delete(`/classes/${classId}/students/${studentId}`);
    }
};
