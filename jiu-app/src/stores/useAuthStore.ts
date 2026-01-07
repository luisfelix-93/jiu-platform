import { create } from 'zustand';
import { type AuthState, type User } from '../types/auth';
import { AuthService } from '../services/auth.service';

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,

    login: async (credentials) => {
        try {
            const { user } = await AuthService.login(credentials);
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
        try {
            // Just try to fetch the profile. If cookie is invalid/missing, it will fail (401)
            const user = await AuthService.getMe();
            set({ user, isAuthenticated: true });
        } catch (error) {
            console.debug("Auth check failed", error);
            set({ user: null, isAuthenticated: false });
        }
    }
}));
