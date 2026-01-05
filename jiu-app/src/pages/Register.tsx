import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/auth.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const registerSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    role: z.enum(["aluno", "professor"]),
});

type RegisterSchema = z.infer<typeof registerSchema>;

export const Register = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'aluno'
        }
    });

    const selectedRole = watch('role');

    const onSubmit = async (data: RegisterSchema) => {
        setIsLoading(true);
        setError('');
        try {
            await AuthService.register(data);
            navigate('/login', { state: { message: 'Cadastro realizado com sucesso! Faça login.' } });
        } catch (err: any) {
            console.error('Registration failed', err);
            setError(err.response?.data?.error || 'Falha ao realizar cadastro. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="text-center">
                <CardTitle>Crie sua conta</CardTitle>
                <p className="text-sm text-neutral-500">Junte-se à nossa comunidade</p>
            </CardHeader>
            <CardContent>
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Nome Completo"
                        placeholder="Ex: João da Silva"
                        error={errors.name?.message}
                        {...register('name')}
                    />

                    <Input
                        label="Email"
                        type="email"
                        placeholder="seu@email.com"
                        error={errors.email?.message}
                        {...register('email')}
                    />

                    <Input
                        label="Senha"
                        type="password"
                        placeholder="••••••"
                        error={errors.password?.message}
                        {...register('password')}
                    />

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-700">Tipo de Conta</label>
                        <div className="flex gap-2 p-1 bg-neutral-100 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setValue('role', 'aluno')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${selectedRole === 'aluno' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
                            >
                                Aluno
                            </button>
                            <button
                                type="button"
                                onClick={() => setValue('role', 'professor')}
                                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${selectedRole === 'professor' ? 'bg-white shadow text-neutral-900' : 'text-neutral-500 hover:text-neutral-900'}`}
                            >
                                Professor
                            </button>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Cadastrar
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <span className="text-neutral-500">Já tem uma conta? </span>
                    <Link to="/login" className="text-primary font-bold hover:underline">
                        Entrar
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
};
