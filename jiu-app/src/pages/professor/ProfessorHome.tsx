import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Users } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { DashboardService } from '../../services/dashboard.service';
import { format, parseISO, addMinutes } from 'date-fns';

export const ProfessorHome = () => {
    const { user } = useAuthStore();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await DashboardService.getProfessorData();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch professor dashboard", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <div className="p-8 text-center">Carregando painel...</div>;
    }

    const todayLessons = data?.upcomingLessons || [];

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-800">Olá, Mestre {user?.name?.split(' ')[0]}!</h1>
                <p className="text-neutral-500">Você tem {todayLessons.length} aulas hoje.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Aulas de Hoje (Próximas)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {todayLessons.length > 0 ? (
                                todayLessons.map((lesson: any) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-neutral-800 text-white p-3 rounded-md font-bold text-center w-16">
                                                <span>{lesson.startTime ? lesson.startTime.slice(0, 5) : '00:00'}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-lg">{lesson.class?.name}</h4>
                                                <div className="flex items-center text-sm text-neutral-500 gap-2">
                                                    <Users className="h-4 w-4" />
                                                    <span>{format(addMinutes(parseISO(lesson.date), new Date().getTimezoneOffset()), 'dd/MM/yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline">Ver Detalhes</Button>
                                            <Button size="sm">Iniciar Chamada</Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-neutral-500 text-center py-4">Nenhuma aula agendada para hoje.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
