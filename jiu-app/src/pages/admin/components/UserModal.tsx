import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { UserService, type User } from '../../../services/user.service';

const userSchema = z.object({
    name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().optional(), // Optional on edit
    role: z.enum(['aluno', 'professor', 'admin']),
    beltColor: z.string().optional(),
    stripeCount: z.number().optional(),
    birthDate: z.string().optional(),
    isActive: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
    onSuccess: () => void;
}

export const UserModal = ({ isOpen, onClose, user, onSuccess }: UserModalProps) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            isActive: true,
            role: 'aluno',
            beltColor: 'white',
            stripeCount: 0
        }
    });

    useEffect(() => {
        if (user) {
            reset({
                name: user.name,
                email: user.email,
                role: user.role,
                beltColor: user.beltColor,
                stripeCount: user.stripeCount,
                birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
                isActive: user.isActive,
            });
        } else {
            reset({
                isActive: true,
                role: 'aluno',
                beltColor: 'white',
                stripeCount: 0
            });
        }
    }, [user, reset]);

    const onSubmit = async (data: UserFormData) => {
        try {
            const payload = {
                ...data,
                // Ensure password is sent only if provided
                password: data.password || undefined
            };

            if (user) {
                await UserService.updateUser(user.id, payload);
            } else {
                if (!data.password) {
                    alert('Senha é obrigatória para novos usuários');
                    return;
                }
                await UserService.createUser(payload as any);
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar usuário');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={user ? 'Editar Usuário' : 'Novo Usuário'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Nome" {...register('name')} error={errors.name?.message} />
                <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />

                <Input
                    label={user ? "Senha (deixe em branco para manter)" : "Senha"}
                    type="password"
                    {...register('password')}
                    error={errors.password?.message}
                />

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Função</label>
                        <select {...register('role')} className="w-full p-2 border rounded-md">
                            <option value="aluno">Aluno</option>
                            <option value="professor">Professor</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>
                    <Input label="Data de Nascimento" type="date" {...register('birthDate')} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Faixa</label>
                        <select {...register('beltColor')} className="w-full p-2 border rounded-md">
                            <option value="white">Branca</option>
                            <option value="grey">Cinza</option>
                            <option value="yellow">Amarela</option>
                            <option value="orange">Laranja</option>
                            <option value="green">Verde</option>
                            <option value="blue">Azul</option>
                            <option value="purple">Roxa</option>
                            <option value="brown">Marrom</option>
                            <option value="black">Preta</option>
                        </select>
                    </div>
                    <Input label="Graus" type="number" {...register('stripeCount', { setValueAs: (v) => v === "" ? undefined : parseInt(v, 10) })} />
                </div>

                <div className="flex items-center gap-2">
                    <input type="checkbox" {...register('isActive')} id="isActive" />
                    <label htmlFor="isActive" className="text-sm">Usuário Ativo</label>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button type="submit" isLoading={isSubmitting}>Salvar</Button>
                </div>
            </form>
        </Modal>
    );
};
