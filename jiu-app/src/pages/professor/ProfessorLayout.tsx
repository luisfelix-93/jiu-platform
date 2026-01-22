import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Home, Users, ClipboardCheck, Video, Calendar } from 'lucide-react';

export const ProfessorLayout = () => {
    const navItems = [
        { label: 'Início', href: '/professor', icon: <Home className="h-5 w-5" />, end: true },
        { label: 'Minhas Turmas', href: '/professor/turmas', icon: <Users className="h-5 w-5" /> },
        { label: 'Aulas', href: '/professor/aulas', icon: <Calendar className="h-5 w-5" /> },
        { label: 'Presença', href: '/professor/presenca', icon: <ClipboardCheck className="h-5 w-5" /> },
        { label: 'Graduação', href: '/professor/graduacao', icon: <div className="h-5 w-5 flex items-center justify-center font-bold text-xs border border-current rounded">G</div> }, // Using a simple icon for now
        { label: 'Conteúdos', href: '/professor/conteudos', icon: <Video className="h-5 w-5" /> },
        { label: 'Meu Perfil', href: '/professor/perfil', icon: <div className="h-5 w-5 flex items-center justify-center"><Users className="h-5 w-5" /></div> },
    ];

    return (
        <DashboardLayout navItems={navItems}>
            <Outlet />
        </DashboardLayout>
    );
};
