import { Outlet } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Home, Users, ClipboardCheck, Video, Calendar, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';

export const ProfessorLayout = () => {
    const { user } = useAuthStore();

    const baseNavItems = [
        { label: 'Início', href: '/professor', icon: <Home className="h-5 w-5" />, end: true },
        { label: 'Minhas Turmas', href: '/professor/turmas', icon: <Users className="h-5 w-5" /> },
        { label: 'Aulas', href: '/professor/aulas', icon: <Calendar className="h-5 w-5" /> },
        { label: 'Presença', href: '/professor/presenca', icon: <ClipboardCheck className="h-5 w-5" /> },
        { label: 'Graduação', href: '/professor/graduacao', icon: <div className="h-5 w-5 flex items-center justify-center font-bold text-xs border border-current rounded">G</div> }, // Using a simple icon for now
        { label: 'Conteúdos', href: '/professor/conteudos', icon: <Video className="h-5 w-5" /> },
        { label: 'Meu Perfil', href: '/professor/perfil', icon: <div className="h-5 w-5 flex items-center justify-center"><Users className="h-5 w-5" /></div> },
    ];

    const studentNavItems = [
        { label: 'Calendário (Aluno)', href: '/professor/calendario-aluno', icon: <Calendar className="h-5 w-5" /> },
        { label: 'Meu Progresso', href: '/professor/progresso', icon: <TrendingUp className="h-5 w-5" /> },
    ];

    const navItems = user?.beltColor && user.beltColor !== 'black' && user.beltColor !== 'coral' && user.beltColor !== 'red'
        ? [...baseNavItems, ...studentNavItems]
        : baseNavItems;

    return (
        <DashboardLayout navItems={navItems}>
            <Outlet />
        </DashboardLayout>
    );
};
