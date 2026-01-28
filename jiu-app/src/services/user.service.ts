import api from '../lib/api';

export interface User {
    id: string;
    email: string;
    name: string;
    role: 'aluno' | 'professor' | 'admin';
    beltColor: string;
    stripeCount: number;
    avatarUrl?: string;
    isActive: boolean;
    birthDate?: string;
    createdAt: string;
}

export class UserService {
    static async listUsers(role?: string) {
        const params = role ? { role } : {};
        const response = await api.get<User[]>('/users', { params });
        return response.data;
    }

    static async createUser(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password?: string }) {
        const response = await api.post<User>('/users', data);
        return response.data;
    }

    static async updateUser(id: string, data: Partial<User> & { password?: string }) {
        const response = await api.put<User>(`/users/${id}`, data);
        return response.data;
    }

    static async deleteUser(id: string) {
        await api.delete(`/users/${id}`);
    }
}
