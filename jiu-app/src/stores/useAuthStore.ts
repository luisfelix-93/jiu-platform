







import { create } from 'zustand';
import { type AuthState, type User } from '../types/auth';
import { AuthService } from '../services/auth.service';

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,

    login: async (credentials) => {
        try {
            const { user, accessToken, refreshToken } = await AuthService.login(credentials);
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            set({ user, isAuthenticated: true });
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
        AuthService.logout().catch(console.error);
    },

    updateUser: (data: Partial<User>) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
    })),

    checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const user = await AuthService.getMe();
                set({ user, isAuthenticated: true });
            } catch (error) {
                console.error("Auth check failed", error);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({ user: null, isAuthenticated: false });
            }
        }
    }
}));
