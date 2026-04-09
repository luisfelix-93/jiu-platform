import api from "../lib/api";
import type { Academy, PaginatedAcademies } from "../types/academy";

export const AcademyService = {
    // Professor - Creation
    async create(data: { name: string; address: string; phone: string; logoUrl?: string }): Promise<Academy> {
        const response = await api.post("/academies", data);
        return response.data;
    },

    // Any authenticated user - Listing their own academies
    async getMyAcademies(): Promise<Academy[]> {
        const response = await api.get("/academies/me");
        return response.data;
    },

    // Owner - Updation
    async update(id: string, data: Partial<{ name: string; address: string; phone: string; logoUrl: string }>): Promise<Academy> {
        const response = await api.put(`/academies/${id}`, data);
        return response.data;
    },

    // Any authenticated user - Getting details of an academy
    async getOne(id: string): Promise<Academy> {
        const response = await api.get(`/academies/${id}`);
        return response.data;
    },

    // Any authenticated user - Searching academies 
    async search(params: { q?: string; page?: number; limit?: number }): Promise<PaginatedAcademies> {
        const response = await api.get("/academies", { params });
        return response.data;
    },

    // Owner - Managing professors
    async addProfessor(id: string, professorId: string): Promise<any> {
        const response = await api.post(`/academies/${id}/professors`, { professorId });
        return response.data;
    },

    async removeProfessor(id: string, professorId: string): Promise<void> {
        await api.delete(`/academies/${id}/professors/${professorId}`);
    },

    // Student - Enrolling/Unenrolling
    async enrollStudent(id: string): Promise<any> {
        const response = await api.post(`/academies/${id}/students`);
        return response.data;
    },

    async unenrollStudent(id: string): Promise<void> {
        await api.delete(`/academies/${id}/students/me`);
    }
};
