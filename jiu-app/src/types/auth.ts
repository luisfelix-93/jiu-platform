export type UserRole = 'aluno' | 'professor' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    beltColor?: string;
    stripeCount?: number;
    avatarUrl?: string;
    isActive?: boolean;
    createdAt?: string;
    // Mapped properties for compatibility if needed, or we just switch to beltColor
    // belt: 'White' | 'Blue' | 'Purple' | 'Brown' | 'Black'; // Deprecated/Removed to align with backend
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
    checkAuth: () => Promise<void>;
}
