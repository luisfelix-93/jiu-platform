import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { User, Phone, Building2, Pencil, Plus } from 'lucide-react';
import { AuthService } from '../../services/auth.service';
import { translateBelt } from '../../utils/belt';
import { useAcademyStore } from '../../stores/useAcademyStore';
import { Modal } from '../../components/ui/Modal';
import { AcademyForm } from '../../components/academy/AcademyForm';
import { AcademyProfessorsModal } from '../../components/academy/AcademyProfessorsModal';
import type { Academy } from '../../types/academy';

const profileSchema = z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z.string().email('Email inválido'), // Read-only usually, but let's keep it in schema
    phone: z.string().optional(),
    emergencyContact: z.string().optional(),
    birthDate: z.string().optional(),
});

type ProfileSchema = z.infer<typeof profileSchema>;

export const ProfessorProfile = () => {
    const { user, updateUser } = useAuthStore();
    const { myAcademies, fetchMyAcademies } = useAcademyStore();
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const [isAcademyModalOpen, setIsAcademyModalOpen] = useState(false);
    const [editingAcademy, setEditingAcademy] = useState<Academy | undefined>(undefined);
    const [isProfessorsModalOpen, setIsProfessorsModalOpen] = useState(false);
    const [managingAcademy, setManagingAcademy] = useState<Academy | null>(null);

    // Pre-fill form with user data + profile data if available
    // Note: user object from stats/me might need to be refreshed or we use what's in store

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProfileSchema>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: (user as any)?.profile?.phone || '',
            emergencyContact: (user as any)?.profile?.emergencyContact || '',
            birthDate: (user as any)?.birthDate ? new Date((user as any).birthDate).toISOString().split('T')[0] : '',
        },
    });

    // Fetch latest profile data on mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const latestUser = await AuthService.getMe();
                // Update store in background
                updateUser(latestUser);

                // Update form
                reset({
                    name: latestUser.name,
                    email: latestUser.email,
                    phone: (latestUser as any).profile?.phone || '',
                    emergencyContact: (latestUser as any).profile?.emergencyContact || '',
                    birthDate: (latestUser as any).birthDate ? new Date((latestUser as any).birthDate).toISOString().split('T')[0] : '',
                });
            } catch (error) {
                console.error("Failed to load profile", error);
            }
        };
        loadProfile();
    }, [reset, updateUser]);

    const onSubmit = async (data: ProfileSchema) => {
        setSuccessMessage('');
        setError('');
        try {
            // We only send updatable fields. Email is usually immutable or requires special flow.
            const { email, ...updateData } = data;

            const updatedUser = await AuthService.updateProfile(updateData);
            updateUser(updatedUser);
            setSuccessMessage('Perfil atualizado com sucesso!');
        } catch (err: any) {
            console.error("Failed to update profile", err);
            setError('Erro ao atualizar perfil. Tente novamente.');
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-neutral-800">Meu Perfil</h2>
                <p className="text-neutral-500">Gerencie suas informações pessoais.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Informações Básicas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-6 mb-8">
                        <div className="h-24 w-24 rounded-full bg-neutral-200 overflow-hidden shrink-0 border-4 border-white shadow-sm">
                            <img
                                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div>
                            <h3 className="font-medium text-lg">{user.name}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary uppercase">
                                {user.role === 'professor' ? 'Professor' : `Faixa ${translateBelt(user.beltColor) || 'Branca'}`}
                            </span>
                            <p className="text-sm text-neutral-500 mt-1">Membro ativo</p>
                        </div>
                    </div>

                    {successMessage && (
                        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm mb-4">
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Nome Completo"
                            error={errors.name?.message}
                            {...register('name')}
                        />
                        <Input
                            label="Data de Nascimento"
                            type="date"
                            error={errors.birthDate?.message}
                            {...register('birthDate')}
                        />
                        <Input
                            label="Email"
                            type="email"
                            disabled
                            className="bg-neutral-100 cursor-not-allowed"
                            title="Não é possível alterar o email"
                            error={errors.email?.message}
                            {...register('email')}
                        />

                        <div className="pt-4 border-t">
                            <h4 className="text-sm font-medium mb-4 flex items-center gap-2 text-neutral-600">
                                <Phone className="h-4 w-4" /> Contato
                            </h4>
                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Telefone"
                                    placeholder="(00) 00000-0000"
                                    error={errors.phone?.message}
                                    {...register('phone')}
                                />
                                <Input
                                    label="Contato de Emergência"
                                    placeholder="Nome e Telefone"
                                    error={errors.emergencyContact?.message}
                                    {...register('emergencyContact')}
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" isLoading={isSubmitting}>
                                Salvar Alterações
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Minhas Academias
                    </CardTitle>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                            setEditingAcademy(undefined);
                            setIsAcademyModalOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Academia
                    </Button>
                </CardHeader>
                <CardContent>
                    {myAcademies.length === 0 ? (
                        <p className="text-neutral-500 text-sm py-4">
                            Você ainda não está vinculado a nenhuma academia.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {myAcademies.map((academy) => (
                                <div key={academy.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        {academy.logoUrl ? (
                                            <img src={academy.logoUrl} alt={academy.name} className="h-12 w-12 rounded-md object-cover bg-neutral-100" />
                                        ) : (
                                            <div className="h-12 w-12 flex items-center justify-center rounded-md bg-neutral-100 text-neutral-400">
                                                <Building2 className="h-6 w-6" />
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-semibold text-neutral-900">{academy.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${academy.role === 'owner' ? 'bg-primary/10 text-primary' : 'bg-neutral-200 text-neutral-700'}`}>
                                                    {academy.role === 'owner' ? 'Dono/Administrador' : 'Professor Membro'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {academy.role === 'owner' && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setManagingAcademy(academy);
                                                    setIsProfessorsModalOpen(true);
                                                }}
                                            >
                                                <User className="h-4 w-4 mr-2" />
                                                Professores
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setEditingAcademy(academy);
                                                    setIsAcademyModalOpen(true);
                                                }}
                                            >
                                                <Pencil className="h-4 w-4 mr-2" />
                                                Editar
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal 
                isOpen={isAcademyModalOpen} 
                onClose={() => setIsAcademyModalOpen(false)}
                title={editingAcademy ? "Editar Academia" : "Nova Academia"}
                maxWidth="max-w-2xl"
            >
                <div className="py-4">
                    <AcademyForm 
                        academy={editingAcademy} 
                        onSuccess={() => {
                            setIsAcademyModalOpen(false);
                            fetchMyAcademies();
                        }} 
                    />
                </div>
            </Modal>

            <AcademyProfessorsModal 
                isOpen={isProfessorsModalOpen} 
                onClose={() => setIsProfessorsModalOpen(false)} 
                academy={managingAcademy} 
            />
        </div>
    );
};
