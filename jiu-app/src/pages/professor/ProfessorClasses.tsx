import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ClassService, type Class } from '../../services/class.service';
import { Plus, Users, Calendar } from 'lucide-react';

const createClassSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    description: z.string().optional(),
    days: z.string().min(1, "Selecione pelo menos um dia"),
    time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Horário inválido (HH:MM)"),
    maxStudents: z.string().transform(val => parseInt(val, 10)).optional(),
});

export const ProfessorClasses = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({ // Use any to bypass transform type mismatch for now
        resolver: zodResolver(createClassSchema)
    });

    const fetchClasses = async () => {
        try {
            const data = await ClassService.listClasses();
            setClasses(data);
        } catch (error) {
            console.error("Failed to fetch classes", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const onSubmit = async (data: any) => {
        setIsCreating(true);
        try {
            const schedule = {
                days: data.days.split(',').map((d: string) => d.trim()),
                time: data.time
            };

            const classData = {
                name: data.name,
                description: data.description || '',
                schedule,
                maxStudents: data.maxStudents || 20
            };

            if (editingClass) {
                await ClassService.updateClass(editingClass.id, classData);
            } else {
                await ClassService.createClass(classData);
            }

            await fetchClasses();
            setShowForm(false);
            setEditingClass(null);
            reset();
        } catch (error) {
            console.error("Failed to save class", error);
            alert("Erro ao salvar turma");
        } finally {
            setIsCreating(false);
        }
    };

    const handleEdit = (cls: Class) => {
        setEditingClass(cls);
        setShowForm(true);
        // Reset form with class data
        reset({
            name: cls.name,
            description: cls.description,
            days: cls.schedule.days.join(', '),
            time: cls.schedule.time,
            maxStudents: cls.maxStudents
        });
        // Scroll to top to see form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta turma?")) return;

        try {
            await ClassService.deleteClass(id);
            // Optimistic update
            setClasses(classes.filter(c => c.id !== id));
        } catch (error) {
            console.error("Failed to delete class", error);
            alert("Erro ao excluir turma");
            // Revert or re-fetch if failed
            fetchClasses();
        }
    };

    const handleNewClass = () => {
        setEditingClass(null);
        reset({
            name: '',
            description: '',
            days: '',
            time: '',
            maxStudents: ''
        });
        setShowForm(!showForm);
    };

    if (isLoading) return <div className="p-8 text-center">Carregando turmas...</div>;

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Gerenciar Turmas</h2>
                    <p className="text-neutral-500">Crie e organize as turmas da academia.</p>
                </div>
                <Button onClick={handleNewClass}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Turma
                </Button>
            </header>

            {showForm && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle>{editingClass ? 'Editar Turma' : 'Nova Turma'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input label="Nome da Turma" placeholder="Ex: Jiu-Jitsu Iniciante" error={errors.name?.message as string} {...register('name')} />
                                <Input label="Descrição" placeholder="Ex: Foco em fundamentos" error={errors.description?.message as string} {...register('description')} />
                                <Input label="Dias (separados por vírgula)" placeholder="Ex: seg, qua, sex" error={errors.days?.message as string} {...register('days')} />
                                <Input label="Horário" type="time" error={errors.time?.message as string} {...register('time')} />
                                <Input label="Máximo de Alunos" type="number" placeholder="20" error={errors.maxStudents?.message as string} {...register('maxStudents')} />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                                <Button type="submit" isLoading={isCreating}>
                                    {editingClass ? 'Salvar Alterações' : 'Criar Turma'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => (
                    <Card key={cls.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex justify-between items-start">
                                <span>{cls.name}</span>
                                <span className="text-xs font-normal bg-neutral-100 px-2 py-1 rounded text-neutral-600">
                                    Max: {cls.maxStudents}
                                </span>
                            </CardTitle>
                            <p className="text-sm text-neutral-500">{cls.description}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center text-sm text-neutral-600 gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span>
                                        {cls.schedule?.days?.join(', ')} às {cls.schedule?.time}
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-neutral-600 gap-2">
                                    <Users className="h-4 w-4 text-primary" />
                                    <span>Ver Alunos (Em breve)</span>
                                </div>
                                <div className="pt-4 flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="w-full text-xs"
                                        size="sm"
                                        onClick={() => handleEdit(cls)}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                        size="sm"
                                        onClick={() => handleDelete(cls.id)}
                                    >
                                        Excluir
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {classes.length === 0 && !showForm && (
                <div className="text-center py-12 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                    <p className="text-neutral-500">Nenhuma turma cadastrada.</p>
                    <Button variant="ghost" onClick={() => setShowForm(true)} className="text-primary hover:text-primary hover:bg-primary/10">Criar a primeira turma</Button>
                </div>
            )}
        </div>
    );
};
