import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isAfter, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { LessonService } from '../../services/lesson.service';
import { CheckCircle2 } from 'lucide-react';

const locales = {
    'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resourceId?: number;
    notes?: string;
    instructor?: string;
    videoUrl?: string;
}

export const StudentCalendar = () => {
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [attendanceStatus, setAttendanceStatus] = useState<{ checkedIn: boolean; status?: string } | null>(null);
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const lessons = await LessonService.listLessons();
                const calendarEvents = lessons.map((lesson: any) => {
                    // Combine date and time
                    const startDateTime = new Date(`${lesson.date.split('T')[0]}T${lesson.startTime}`);
                    const endDateTime = new Date(`${lesson.date.split('T')[0]}T${lesson.endTime}`);

                    return {
                        id: lesson.id,
                        title: lesson.class?.name || 'Jiu Jitsu',
                        start: startDateTime,
                        end: endDateTime,
                        instructor: lesson.professor?.name,
                        notes: lesson.topic
                    };
                });
                setEvents(calendarEvents);
            } catch (error) {
                console.error("Failed to fetch lessons", error);
            }
        };

        fetchLessons();
    }, []);

    const handleSelectEvent = async (event: CalendarEvent) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
        setAttendanceStatus(null);
        setIsLoadingAttendance(true);
        try {
            const status = await LessonService.getAttendanceStatus(event.id);
            setAttendanceStatus(status);
        } catch (error) {
            console.error("Failed to fetch attendance status", error);
        } finally {
            setIsLoadingAttendance(false);
        }
    };

    const handleCheckIn = async () => {
        if (!selectedEvent) return;
        setIsLoadingAttendance(true);
        try {
            await LessonService.checkIn(selectedEvent.id);
            setAttendanceStatus({ checkedIn: true, status: 'present' });
            alert("Presença confirmada com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao confirmar presença.");
        } finally {
            setIsLoadingAttendance(false);
        }
    };

    const canCheckIn = selectedEvent && (isToday(selectedEvent.start) || isAfter(selectedEvent.start, new Date()));

    return (
        <>
            <Card className="h-full min-h-[600px] flex flex-col">
                <CardHeader>
                    <CardTitle>Calendário de Aulas</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: '100%', minHeight: '500px' }}
                        culture="pt-BR"
                        views={['month', 'week', 'day', 'agenda']}
                        defaultView="month"
                        messages={{
                            next: 'Próximo',
                            previous: 'Anterior',
                            today: 'Hoje',
                            month: 'Mês',
                            week: 'Semana',
                            day: 'Dia',
                            agenda: 'Agenda',
                            date: 'Data',
                            time: 'Hora',
                            event: 'Evento',
                            noEventsInRange: 'Sem eventos neste período.'
                        }}
                        onSelectEvent={handleSelectEvent}
                    />
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedEvent?.title}
            >
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Instrutor</h4>
                        <p className="text-neutral-800">{selectedEvent?.instructor || 'Não informado'}</p>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Horário</h4>
                        <p className="text-neutral-800">
                            {selectedEvent && format(selectedEvent.start, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                        <h4 className="text-sm font-semibold text-yellow-800 uppercase tracking-wider mb-2">Tópico / Notas</h4>
                        <p className="text-neutral-700 whitespace-pre-wrap">
                            {selectedEvent?.notes || "Nenhuma anotação disponível."}
                        </p>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                        {attendanceStatus?.checkedIn ? (
                            <Button variant="outline" className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700 cursor-default">
                                <CheckCircle2 size={18} className="mr-2" />
                                Presença Confirmada
                            </Button>
                        ) : (
                            canCheckIn ? (
                                <Button
                                    onClick={handleCheckIn}
                                    isLoading={isLoadingAttendance}
                                    disabled={isLoadingAttendance}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Confirmar Presença
                                </Button>
                            ) : (
                                <span className="text-sm text-neutral-500 italic">
                                    Check-in disponível apenas para aulas de hoje ou futuras.
                                </span>
                            )
                        )}
                    </div>
                </div>
            </Modal>
        </>
    );
};
