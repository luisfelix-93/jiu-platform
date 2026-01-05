import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { User, Phone } from 'lucide-react';
import { AuthService } from '../../services/auth.service';

const profileSchema = z.object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z.string().email('Email inválido'), // Read-only usually, but let's keep it in schema
    phone: z.string().optional(),
    emergencyContact: z.string().optional(),
});

type ProfileSchema = z.infer<typeof profileSchema>;

export const StudentProfile = () => {
    const { user, updateUser } = useAuthStore();
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    // Pre-fill form with user data + profile data if available
    // Note: user object from stats/me might need to be refreshed or we use what's in store

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ProfileSchema>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            // Assuming user object might have these, or we need to fetch profile details first if separate.
            // For now, let's assume they are on the user object or we treat them as new fields.
            // If they are deep in 'profile' object, we'd need to map them.
            phone: (user as any)?.profile?.phone || '',
            emergencyContact: (user as any)?.profile?.emergencyContact || '',
        },
    });

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
                                Faixa {user.beltColor || 'Branca'}
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
        </div>
    );
};
