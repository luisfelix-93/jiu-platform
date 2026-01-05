import api from "../lib/api";

import type { User } from "../types/auth";

// Local User interface removed in favor of shared type


export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

export const AuthService = {
    async login(credentials: any): Promise<AuthResponse> {
        const { data } = await api.post("/auth/login", credentials);
        return data;
    },

    async register(userData: any): Promise<AuthResponse> {
        const { data } = await api.post("/auth/register", userData);
        return data;
    },

    async logout() {
        // Optional: Call API to invalidate refresh token if implemented
        // await api.post("/auth/logout");
    },

    async updateProfile(data: Partial<User>): Promise<User> {
        const { data: updatedUser } = await api.put("/users/me", data);
        return updatedUser;
    },

    async getMe(): Promise<User> {
        const { data } = await api.get("/users/me");
        return data;
    }
};
