import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Home, Calendar, BookOpen, Trophy, User } from 'lucide-react';

export const StudentLayout = () => {
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
