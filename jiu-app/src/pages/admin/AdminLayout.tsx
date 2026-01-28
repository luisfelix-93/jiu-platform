import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Home, Users, BookOpen, Video, LayoutList } from 'lucide-react';

export const AdminLayout = () => {
    const navItems = [
        { label: 'Visão Geral', href: '/admin', icon: <Home className="h-5 w-5" />, end: true },
        { label: 'Usuários', href: '/admin/usuarios', icon: <Users className="h-5 w-5" /> },
        { label: 'Turmas', href: '/admin/turmas', icon: <LayoutList className="h-5 w-5" /> },
        { label: 'Aulas', href: '/admin/aulas', icon: <BookOpen className="h-5 w-5" /> },
        { label: 'Conteúdos', href: '/admin/conteudos', icon: <Video className="h-5 w-5" /> },
    ];

    return (
        <DashboardLayout navItems={navItems} title="Administração">
            <Outlet />
        </DashboardLayout>
    );
};
