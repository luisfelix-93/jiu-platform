import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { PlusCircle, Search, ArrowLeft, Building2 } from 'lucide-react';
import { AcademyForm } from './AcademyForm';
import { AcademySelect } from './AcademySelect';
import { useAcademyStore } from '../../stores/useAcademyStore';
import { AcademyService } from '../../services/academy.service';
import type { Academy } from '../../types/academy';
import { toast } from 'sonner';

export function AcademyOnboarding() {
    const [view, setView] = useState<'options' | 'create' | 'join'>('options');
    const [isJoining, setIsJoining] = useState(false);
    const { fetchMyAcademies } = useAcademyStore();

    const handleSuccessCreate = async () => {
        await fetchMyAcademies();
    };

    const handleSelectAcademy = async (academy: Academy) => {
        if (isJoining) return;
        setIsJoining(true);
        try {
            await AcademyService.joinAsProfessor(academy.id);
            toast.success(`Você foi associado à ${academy.name} com sucesso!`);
            await fetchMyAcademies();
        } catch (error: any) {
            const msg = error.response?.data?.error || error.message || 'Erro ao se associar à academia';
            toast.error(msg);
        } finally {
            setIsJoining(false);
        }
    };

    if (view === 'create') {
        return (
            <Card className="max-w-2xl mx-auto w-full border-primary/20 bg-primary/5">
                <CardHeader className="flex flex-row items-center gap-4 border-b border-primary/10 pb-4">
                    <Button variant="ghost" size="sm" onClick={() => setView('options')} className="h-8 px-2">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Voltar
                    </Button>
                    <CardTitle className="text-xl m-0">Criar Nova Academia</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 bg-white rounded-b-lg">
                    <AcademyForm onSuccess={handleSuccessCreate} />
                </CardContent>
            </Card>
        );
    }

    if (view === 'join') {
        return (
            <Card className="max-w-2xl mx-auto w-full border-primary/20 bg-primary/5">
                 <CardHeader className="flex flex-row items-center gap-4 border-b border-primary/10 pb-4">
                    <Button variant="ghost" size="sm" onClick={() => setView('options')} className="h-8 px-2">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Voltar
                    </Button>
                    <CardTitle className="text-xl m-0">Associar-se a uma Academia</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 bg-white rounded-b-lg min-h-[300px]">
                    <AcademySelect onSelect={handleSelectAcademy} />
                </CardContent>
            </Card>
        );
    }

    // Default "options" view
    return (
        <Card className="max-w-2xl mx-auto w-full border-primary/20 bg-gradient-to-br from-white to-primary/5 shadow-md">
            <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                    <Building2 className="w-8 h-8" />
                </div>
                <CardTitle className="text-2xl">Bem-vindo à Plataforma!</CardTitle>
                <p className="text-neutral-500 mt-2">
                    Para começar a gerenciar suas turmas e aulas, você precisa estar vinculado a uma academia.
                </p>
            </CardHeader>
            <CardContent className="pt-6 pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                        onClick={() => setView('create')}
                        className="group flex flex-col items-center justify-center p-6 border-2 border-neutral-200 border-dashed rounded-xl hover:border-primary hover:bg-primary/5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <PlusCircle className="w-10 h-10 text-neutral-400 group-hover:text-primary mb-3 transition-colors" />
                        <span className="font-semibold text-neutral-800 group-hover:text-primary">Criar nova academia</span>
                        <span className="text-xs text-neutral-500 text-center mt-2 group-hover:text-neutral-600">
                            Sou diretor ou responsável e quero cadastrar minha academia.
                        </span>
                    </button>

                    <button 
                        onClick={() => setView('join')}
                        className="group flex flex-col items-center justify-center p-6 border-2 border-neutral-200 border-dashed rounded-xl hover:border-primary hover:bg-primary/5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <Search className="w-10 h-10 text-neutral-400 group-hover:text-primary mb-3 transition-colors" />
                        <span className="font-semibold text-neutral-800 group-hover:text-primary">Associar-se à existente</span>
                        <span className="text-xs text-neutral-500 text-center mt-2 group-hover:text-neutral-600">
                            Minha academia já está na plataforma e quero me vincular a ela.
                        </span>
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}
