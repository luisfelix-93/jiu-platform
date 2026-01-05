import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { DashboardService, type DashboardData } from '../../services/dashboard.service';
import { LessonService } from '../../services/lesson.service';
import { format, isToday, isAfter, parseISO, addMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const StudentHome = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [attendanceStatus, setAttendanceStatus] = useState<{ checkedIn: boolean; status?: string } | null>(null);
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const result = await DashboardService.getStudentData();
                setData(result);
            } catch (error) {
                console.error("Failed to fetch dashboard", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    const handleOpenDetails = async (lesson: any) => {
        setSelectedLesson(lesson);
        setIsModalOpen(true);
        setAttendanceStatus(null);
        setIsLoadingAttendance(true);
        try {
            const status = await LessonService.getAttendanceStatus(lesson.id);
            setAttendanceStatus(status);
        } catch (error) {
            console.error("Failed to fetch attendance status", error);
        } finally {
            setIsLoadingAttendance(false);
        }
    };

    const handleCheckIn = async () => {
        if (!selectedLesson) return;
        setIsLoadingAttendance(true);
        try {
            await LessonService.checkIn(selectedLesson.id);
            setAttendanceStatus({ checkedIn: true, status: 'present' });
            alert("Presença confirmada com sucesso!");

            // Refresh stats if needed
            const result = await DashboardService.getStudentData();
            setData(result);
        } catch (error) {
            console.error(error);
            alert("Erro ao confirmar presença.");
        } finally {
            setIsLoadingAttendance(false);
        }
    };

    const canCheckIn = selectedLesson && (() => {
        const lessonDate = new Date(`${selectedLesson.date.split('T')[0]}T${selectedLesson.startTime}`);
        return isToday(lessonDate) || isAfter(lessonDate, new Date());
    })();

    if (isLoading) {
        return <div className="p-8 text-center">Carregando painel...</div>;
    }

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-800">Olá, {user?.name?.split(' ')[0]}!</h1>
                <p className="text-neutral-500">Pronto para treinar hoje?</p>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Upcoming Classes */}
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium">Próximas Aulas</CardTitle>
                        <Calendar className="h-5 w-5 text-neutral-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data?.upcomingLessons && data.upcomingLessons.length > 0 ? (
                                data.upcomingLessons.map((lesson: any) => (
                                    <div key={lesson.id} className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 border border-neutral-100">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 text-primary p-3 rounded-md font-bold text-center w-16">
                                                <span className="block text-xs uppercase">{format(addMinutes(parseISO(lesson.date), new Date().getTimezoneOffset()), 'dd MMM', { locale: ptBR })}</span>
                                                <span>{lesson.startTime ? lesson.startTime.slice(0, 5) : '00:00'}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{lesson.class?.name || 'Aula'}</h4>
                                                <p className="text-sm text-neutral-500">{lesson.professor?.name || 'Professor'}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="outline" onClick={() => handleOpenDetails(lesson)}>Detalhes</Button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-neutral-500 text-center py-4">Nenhuma aula agendada.</p>
                            )}
                        </div>
                        <Button className="w-full mt-4" variant="ghost" onClick={() => navigate('/aluno/calendario')}>Ver Calendário Completo</Button>
                    </CardContent>
                </Card>

                {/* Stats / Progress */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-medium">Sua Frequência</CardTitle>
                        <CheckCircle2 className="h-5 w-5 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-center py-6">
                            <span className="text-5xl font-bold text-neutral-800">{data?.stats?.totalAttended || 0}</span>
                            <p className="text-sm text-neutral-500 mt-2">Aulas (Total)</p>
                        </div>
                        <div className="space-y-2 mt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-500">Status</span>
                                <span className="font-medium text-success">Ativo</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedLesson?.class?.name || 'Detalhes da Aula'}
            >
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Instrutor</h4>
                        <p className="text-neutral-800">{selectedLesson?.professor?.name || 'Não informado'}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Horário</h4>
                        <p className="text-neutral-800">
                            {selectedLesson && format(addMinutes(parseISO(selectedLesson.date), new Date().getTimezoneOffset()), "dd 'de' MMMM", { locale: ptBR })}
                            {' às '}
                            {selectedLesson?.startTime}
                        </p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                        <h4 className="text-sm font-semibold text-yellow-800 uppercase tracking-wider mb-2">Tópico / Notas</h4>
                        <p className="text-neutral-700 whitespace-pre-wrap">
                            {selectedLesson?.topic || "Nenhuma anotação disponível."}
                        </p>
                    </div>

                    <div className="pt-4 border-t flex justify-between items-center gap-2">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Fechar</Button>

                        {attendanceStatus?.checkedIn ? (
                            <Button variant="outline" className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700 cursor-default">
                                <CheckCircle2 size={18} className="mr-2" />
                                Presença Confirmada
                            </Button>
                        ) : (
                            canCheckIn && (
                                <Button
                                    onClick={handleCheckIn}
                                    isLoading={isLoadingAttendance}
                                    disabled={isLoadingAttendance}
                                >
                                    Confirmar Presença
                                </Button>
                            )
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    );
}
