import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';


const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export const Login = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginSchema) => {
        setIsLoading(true);
        try {
            await login(data);

            // Get user from store to check role (it should be updated after login)
            const user = useAuthStore.getState().user;

            if (user?.role === 'aluno') {
                navigate('/aluno');
            } else if (user?.role === 'professor') {
                navigate('/professor');
            } else if (user?.role === 'admin') {
                navigate('/admin');
            }
        } catch (error: any) {
            console.error('Login failed', error);
            const errorMessage = error.response?.data?.error || 'Email ou senha inválidos. Verifique suas credenciais e tente novamente.';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="text-center">
                <CardTitle>Bem-vindo de volta</CardTitle>
                <p className="text-sm text-neutral-500">Faça login para acessar sua conta</p>
            </CardHeader>
            <CardContent>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    <div className="text-right">
                        <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                            Esqueci minha senha
                        </Link>
                    </div>
                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Entrar
                    </Button>
                </form>

                <div className="mt-4 text-center text-sm">
                    <span className="text-neutral-500">Não tem uma conta? </span>
                    <Link to="/register" className="text-primary font-bold hover:underline">
                        Cadastre-se
                    </Link>
                </div>

                <div className="mt-4 text-center text-xs text-neutral-400">
                    <p>Para teste:</p>
                    <p>Aluno: Selecione Aluno. Professor: Selecione Professor.</p>
                </div>
            </CardContent>
        </Card>
    );
};
