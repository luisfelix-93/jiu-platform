import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LessonService, type Lesson } from '../../services/lesson.service';
import { AttendanceService, type AttendanceRecord } from '../../services/attendance.service';
import { Check, X, Clock, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ProfessorAttendance = () => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchParams] = useSearchParams();
    const lessonIdParam = searchParams.get('lessonId');

    // Fetch lessons for today or upcoming (simplification: listing recent/upcoming)
    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const data = await LessonService.listLessons();
                // Filter for recent/upcoming or just show all for MVP
                // Sort by date desc
                setLessons(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            } catch (error) {
                console.error("Failed to fetch lessons", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLessons();
    }, []);

    // Auto-select lesson from URL param
    useEffect(() => {
        if (lessons.length > 0 && lessonIdParam && !selectedLesson) {
            const preselected = lessons.find(l => l.id === lessonIdParam);
            if (preselected) {
                handleLessonSelect(preselected);
            }
        }
    }, [lessons, lessonIdParam, selectedLesson]);

    const fetchAttendance = async (lessonId: string) => {
        try {
            const data = await AttendanceService.getLessonAttendance(lessonId);
            setAttendanceList(data);
        } catch (error) {
            console.error("Failed to fetch attendance", error);
            setAttendanceList([]);
        }
    };

    const handleLessonSelect = (lesson: Lesson) => {
        setSelectedLesson(lesson);
        fetchAttendance(lesson.id);
    };

    const handleMarkAttendance = async (userId: string, status: 'present' | 'absent') => {
        if (!selectedLesson) return;
        try {
            await AttendanceService.register(selectedLesson.id, {
                userId,
                status,
                notes: 'Marked via Professor App'
            });
            // Refresh list
            fetchAttendance(selectedLesson.id);
        } catch (error) {
            console.error("Failed to mark attendance", error);
            alert("Erro ao registrar presença");
        }
    };

    if (isLoading) return <div className="p-8 text-center">Carregando aulas...</div>;

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-neutral-800">Chamada</h2>
                <p className="text-neutral-500">Registre a presença dos alunos.</p>
            </header>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* List of Lessons */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-semibold text-lg">Aulas Recentes</h3>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                        {lessons.map((lesson) => (
                            <Card
                                key={lesson.id}
                                className={`cursor-pointer hover:border-primary transition-colors ${selectedLesson?.id === lesson.id ? 'border-primary ring-1 ring-primary' : ''}`}
                                onClick={() => handleLessonSelect(lesson)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold">{lesson.class?.name || 'Aula Avulsa'}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${lesson.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {lesson.status === 'scheduled' ? 'Agendada' : 'Concluída'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-neutral-500 flex items-center gap-2">
                                        <Calendar className="h-3 w-3" />
                                        {format(parseISO(lesson.date), "dd/MM/yyyy", { locale: ptBR })}
                                    </div>
                                    <div className="text-sm text-neutral-500 flex items-center gap-2 mt-1">
                                        <Clock className="h-3 w-3" />
                                        {lesson.startTime}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Attendance List */}
                <div className="lg:col-span-2">
                    {selectedLesson ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>Lista de Presença</span>
                                    <span className="text-sm font-normal text-neutral-500">
                                        {format(parseISO(selectedLesson.date), "dd 'de' MMMM", { locale: ptBR })}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {attendanceList.length > 0 ? (
                                    <div className="space-y-2">
                                        {attendanceList.map((record) => (
                                            <div key={record.userId} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-xs">
                                                        {record.user?.name?.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{record.user?.name || 'Aluno'}</p>
                                                        <p className="text-xs text-neutral-500 capitalize">{record.user?.beltColor || 'Branca'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant={record.status === 'present' ? 'primary' : 'outline'}
                                                        className={record.status === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                                                        onClick={() => handleMarkAttendance(record.userId, 'present')}
                                                    >
                                                        <Check className="h-4 w-4 mr-1" /> Presente
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={record.status === 'absent' ? 'primary' : 'outline'}
                                                        className={record.status === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                                                        onClick={() => handleMarkAttendance(record.userId, 'absent')}
                                                    >
                                                        <X className="h-4 w-4 mr-1" /> Falta
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-neutral-500">
                                        <p>Nenhum aluno matriculado ou registro de presença.</p>
                                        <p className="text-xs mt-2">(Certifique-se de que os alunos estão matriculados na turma desta aula)</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-neutral-50 rounded-lg border border-dashed border-neutral-300 min-h-[400px]">
                            <p className="text-neutral-500">Selecione uma aula para fazer a chamada.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
