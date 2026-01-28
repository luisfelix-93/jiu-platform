import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AuthService } from '../services/auth.service';

const resetPasswordSchema = z
    .object({
        password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
        confirmPassword: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'As senhas não coincidem',
        path: ['confirmPassword'],
    });

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordSchema) => {
        if (!token) {
            setErrorMessage('Token inválido ou expirado.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        try {
            await AuthService.resetPassword(token, data.password);

            // Redirect to login with success message (could use toast or state)
            // For now, simple alert or redirect
            navigate('/login');
        } catch (error: any) {
            console.error('Reset password failed', error);
            setErrorMessage(error.response?.data?.error || 'Falha ao redefinir a senha.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <Card className="w-full shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle>Token Inválido</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-red-500">O link de redefinição de senha é inválido ou expirou.</p>
                    <Button variant="outline" className="w-full">
                        <Link to="/login">Voltar para Login</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="text-center">
                <CardTitle>Redefinir Senha</CardTitle>
                <p className="text-sm text-neutral-500">
                    Digite sua nova senha abaixo
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {errorMessage && (
                        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                            {errorMessage}
                        </div>
                    )}
                    <Input
                        label="Nova Senha"
                        type="password"
                        placeholder="••••••"
                        error={errors.password?.message}
                        {...register('password')}
                    />
                    <Input
                        label="Confirmar Nova Senha"
                        type="password"
                        placeholder="••••••"
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                    />
                    <Button type="submit" className="w-full" isLoading={isLoading}>
                        Salvar Nova Senha
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
