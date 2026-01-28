import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AuthService } from '../services/auth.service';

const forgotPasswordSchema = z.object({
    email: z.string().email('Email inválido'),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordSchema) => {
        setIsLoading(true);
        setErrorMessage('');
        try {
            await AuthService.forgotPassword(data.email);
            setIsSuccess(true);
        } catch (error: any) {
            console.error('Forgot password failed', error);
            setErrorMessage('Ocorreu um erro ao enviar o email. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="text-center">
                <CardTitle>Recuperar Senha</CardTitle>
                <p className="text-sm text-neutral-500">
                    Digite seu email para receber o link de redefinição
                </p>
            </CardHeader>
            <CardContent>
                {isSuccess ? (
                    <div className="text-center space-y-4">
                        <div className="p-4 bg-green-50 text-green-700 rounded-md">
                            Email enviado com instruções para redefinição de senha via console do backend.
                        </div>
                        <Button variant="outline" className="w-full">
                            <Link to="/login">Voltar para Login</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {errorMessage && (
                            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md">
                                {errorMessage}
                            </div>
                        )}
                        <Input
                            label="Email"
                            type="email"
                            placeholder="seu@email.com"
                            error={errors.email?.message}
                            {...register('email')}
                        />
                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Enviar Link
                        </Button>
                    </form>
                )}

                {!isSuccess && (
                    <div className="mt-4 text-center text-sm">
                        <Link to="/login" className="text-primary font-bold hover:underline">
                            Voltar para Login
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
