import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LessonService, type Lesson } from '../../services/lesson.service';
import { ClassService, type Class } from '../../services/class.service';
import { Calendar, Clock, Plus, Trash2, Edit2, X, PlayCircle } from 'lucide-react';
import { ContentService } from '../../services/content.service';
import { format, addMinutes, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Modal } from '../../components/ui/Modal';
import { VideoPlayer } from '../../components/VideoPlayer';

interface CreateLessonSchema {
    classId: string;
    topic?: string;
    date: string;
    startTime: string;
    endTime: string;
}

const createLessonSchema = z.object({
    classId: z.string().min(1, 'Selecione uma turma'),
    topic: z.string().optional(),
    date: z.string().min(1, 'Data é obrigatória'),
    startTime: z.string().min(1, 'Horário de início é obrigatório'),
    endTime: z.string().min(1, 'Horário de término é obrigatório'),
});

export const AdminLessons = () => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<CreateLessonSchema>({
        resolver: zodResolver(createLessonSchema),
    });

    const fetchData = async () => {
        try {
            const [lessonsData, classesData] = await Promise.all([
                LessonService.listLessons(),
                ClassService.listClasses(),
            ]);
            setLessons(lessonsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            setClasses(classesData);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onSubmit = async (data: CreateLessonSchema) => {
        setIsSubmitting(true);
        try {
            let lessonId = editingLessonId;
            if (editingLessonId) {
                await LessonService.updateLesson(editingLessonId, data);
            } else {
                const newLesson = await LessonService.createLesson(data);
                lessonId = newLesson.id;
            }

            if (selectedFile && lessonId) {
                setIsUploading(true);
                try {
                    const { uploadUrl, publicUrl } = await ContentService.getUploadUrl(selectedFile.name, selectedFile.type, lessonId);
                    await ContentService.uploadFile(uploadUrl, selectedFile);
                    await ContentService.saveContentMetadata(lessonId, {
                        title: data.topic || 'Video da Aula',
                        description: 'Video carregado via gestão de aulas admin',
                        contentType: 'video',
                        fileUrl: publicUrl
                    });
                } catch (uploadError: any) {
                    console.error("Upload failed", uploadError);
                    alert("Erro ao enviar vídeo: " + (uploadError.message || "Erro desconhecido"));
                } finally {
                    setIsUploading(false);
                }
            }

            setShowForm(false);
            setEditingLessonId(null);
            setSelectedFile(null);
            reset();
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar aula.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (lesson: Lesson) => {
        setEditingLessonId(lesson.id);
        setValue('classId', lesson.class?.name ? classes.find(c => c.name === lesson.class.name)?.id || '' : '');
        setValue('topic', lesson.topic || '');
        setValue('date', lesson.date.split('T')[0]);
        setValue('startTime', lesson.startTime);
        setValue('endTime', lesson.endTime);
        setShowForm(true);
    };

    const handleWatchVideo = async (lesson: Lesson) => {
        try {
            const content = await ContentService.getLessonContent(lesson.id);
            const videoContent = content.find(c => c.contentType === 'video' || c.contentType.startsWith('video/'));

            if (videoContent && videoContent.fileUrl) {
                setSelectedVideo({
                    url: videoContent.fileUrl,
                    title: videoContent.title || lesson.topic || 'Aula'
                });
                setIsVideoModalOpen(true);
            } else {
                alert("Nenhum vídeo disponível para esta aula.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao carregar vídeo.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta aula?")) return;
        try {
            await LessonService.deleteLesson(id);
            fetchData();
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir aula.");
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingLessonId(null);
        setSelectedFile(null);
        const fileInputs = document.querySelectorAll<HTMLInputElement>('input[type="file"]');
        fileInputs.forEach((input) => {
            input.value = '';
        });
        reset();
    };

    if (isLoading) return <div className="p-8 text-center">Carregando aulas...</div>;

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Administração de Aulas</h2>
                    <p className="text-gray-500 mt-1">Gerencie, agende e monitore todas as aulas.</p>
                </div>
                <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                    <Plus size={20} />
                    Nova Aula
                </Button>
            </header>

            {showForm && (
                <Card className="bg-gray-50 border-dashed border-2 border-gray-200">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">{editingLessonId ? 'Editar Aula' : 'Agendar Nova Aula'}</h3>
                            <Button variant="ghost" size="sm" onClick={cancelForm}><X size={20} /></Button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Turma</label>
                                    <select
                                        {...register('classId')}
                                        className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Selecione uma turma</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>{cls.name} ({cls.schedule?.days?.join(', ') || ''} - {cls.schedule?.time || ''})</option>
                                        ))}
                                    </select>
                                    {errors.classId && <span className="text-xs text-error">{errors.classId.message}</span>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tópico/Tema (Opcional)</label>
                                    <Input {...register('topic')} placeholder="Ex: Passagem de guarda" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Vídeo da Aula</label>
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="file"
                                            accept="video/*"
                                            className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setSelectedFile(e.target.files[0]);
                                                }
                                            }}
                                        />
                                        {selectedFile && (
                                            <p className="text-xs text-neutral-500">
                                                Arquivo selecionado: <span className="font-medium text-gray-900">{selectedFile.name}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Data</label>
                                    <Input type="date" {...register('date')} />
                                    {errors.date && <span className="text-xs text-error">{errors.date.message}</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Início</label>
                                        <Input type="time" {...register('startTime')} />
                                        {errors.startTime && <span className="text-xs text-error">{errors.startTime.message}</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Fim</label>
                                        <Input type="time" {...register('endTime')} />
                                        {errors.endTime && <span className="text-xs text-error">{errors.endTime.message}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button type="button" variant="outline" onClick={cancelForm} disabled={isSubmitting}>
                                    Cancelar
                                </Button>
                                <Button type="submit" isLoading={isSubmitting || isUploading}>
                                    {isUploading ? 'Enviando Vídeo...' : (editingLessonId ? 'Salvar Alterações' : 'Agendar Aula')}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4">
                {lessons.map((lesson) => (
                    <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h4 className="font-bold text-lg">{lesson.class?.name || 'Aula S/ Título'}</h4>
                                <p className="text-neutral-500 text-sm mb-2">{lesson.topic || 'Sem tópico definido'}</p>
                                <div className="flex items-center gap-4 text-sm text-neutral-600">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={14} />
                                        {format(addMinutes(parseISO(lesson.date), new Date().getTimezoneOffset()), "dd/MM/yyyy", { locale: ptBR })}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {lesson.startTime} - {lesson.endTime}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <Button variant="secondary" size="sm" onClick={() => handleWatchVideo(lesson)} title="Assistir Vídeo">
                                    <PlayCircle size={16} />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleEdit(lesson)}>
                                    <Edit2 size={16} />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(lesson.id)}>
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {lessons.length === 0 && !isLoading && (
                    <div className="text-center py-12 text-neutral-500 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                        <p>Nenhuma aula agendada.</p>
                        <Button variant="link" onClick={() => setShowForm(true)}>Agendar primeira aula</Button>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isVideoModalOpen}
                onClose={() => {
                    setIsVideoModalOpen(false);
                    setSelectedVideo(null);
                }}
                title={selectedVideo?.title || 'Assistir Aula'}
                maxWidth="max-w-4xl"
            >
                {selectedVideo ? (
                    <VideoPlayer src={selectedVideo.url} />
                ) : (
                    <p className="text-center p-4">Carregando vídeo...</p>
                )}
            </Modal>
        </div>
    );
};
