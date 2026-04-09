import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Home, Users, ClipboardCheck, Video, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useAcademyStore } from '../../stores/useAcademyStore';
import { AcademyOnboarding } from '../../components/academy/AcademyOnboarding';

export const ProfessorLayout = () => {
    const { user } = useAuthStore();
    const location = useLocation();
    const { myAcademies, isLoading, fetchMyAcademies } = useAcademyStore();

    useEffect(() => {
        fetchMyAcademies();
    }, [fetchMyAcademies]);

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

    const isProfilePage = location.pathname === '/professor/perfil';
    const showOnboarding = !isProfilePage && !isLoading && myAcademies.length === 0;

    return (
        <DashboardLayout navItems={navItems}>
            {isLoading && myAcademies.length === 0 ? (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : showOnboarding ? (
                <div className="flex flex-col justify-start pt-10 h-full">
                    <AcademyOnboarding />
                </div>
            ) : (
                <Outlet />
            )}
        </DashboardLayout>
    );
};
