import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Home, Calendar, BookOpen, Trophy, User } from 'lucide-react';
import { useAcademyStore } from '../../stores/useAcademyStore';

export const StudentLayout = () => {
    const { fetchMyAcademies } = useAcademyStore();

    useEffect(() => {
        fetchMyAcademies();
    }, [fetchMyAcademies]);

    const navItems = [
        { label: 'Início', href: '/aluno', icon: <Home className="h-5 w-5" />, end: true },
        { label: 'Calendário', href: '/aluno/calendario', icon: <Calendar className="h-5 w-5" /> },
        { label: 'Biblioteca', href: '/aluno/tecnicas', icon: <BookOpen className="h-5 w-5" /> },
        { label: 'Progresso', href: '/aluno/progresso', icon: <Trophy className="h-5 w-5" /> },
        { label: 'Perfil', href: '/aluno/perfil', icon: <User className="h-5 w-5" /> },
    ];

    return (
        <DashboardLayout navItems={navItems}>
            <Outlet />
        </DashboardLayout>
    );
};
