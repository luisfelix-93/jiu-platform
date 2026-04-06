// c:\Users\luisf\source\repos\dev\jiu-platform\jiu-app\src\types\academy.ts
export interface Academy {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    logoUrl?: string;
    createdAt: string;
    
    // Virtual properties from API depending on context
    studentCount?: number;
    role?: 'owner' | 'member'; // If returning for a professor
    enrolledAt?: string; // If returning for a student
    professors?: AcademyProfessor[]; // When fetching full details
}

export interface AcademyProfessor {
    academyId: string;
    professorId: string;
    role: 'owner' | 'member';
    createdAt: string;
    professor?: { id: string; name: string; avatarUrl?: string; email: string };
}

export interface StudentAcademy {
    academyId: string;
    studentId: string;
    isActive: boolean;
    enrolledAt: string;
}

export interface PaginatedAcademies {
    data: Academy[];
    total: number;
    page: number;
    limit: number;
}
