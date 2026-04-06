import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AcademyService } from '../../services/academy.service';
import { toast } from 'sonner';

const academySchema = z.object({
    name: z.string().min(3, "Nome muito curto"),
    address: z.string().min(5, "Endereço obrigatório"),
    phone: z.string().min(8, "Telefone inválido"),
    logoUrl: z.string().url("URL inválida").optional().or(z.literal('')),
});

export type AcademyFormData = z.infer<typeof academySchema>;

interface AcademyFormProps {
    academy?: {
        id: string;
        name: string;
        address?: string;
        phone?: string;
        logoUrl?: string;
    };
    onSuccess?: () => void;
}

export function AcademyForm({ academy, onSuccess }: AcademyFormProps) {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AcademyFormData>({
        resolver: zodResolver(academySchema),
        defaultValues: {
            name: academy?.name || '',
            address: academy?.address || '',
            phone: academy?.phone || '',
            logoUrl: academy?.logoUrl || '',
        }
    });

    const onSubmit = async (data: AcademyFormData) => {
        try {
            if (academy?.id) {
                await AcademyService.update(academy.id, data);
                toast.success('Academia atualizada com sucesso!');
            } else {
                await AcademyService.create(data);
                toast.success('Academia criada com sucesso!');
            }
            onSuccess?.();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Erro ao salvar academia');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
            <Input 
                id="academy-name"
                label="Nome da Academia" 
                {...register('name')} 
                error={errors.name?.message} 
            />
            <Input 
                id="academy-address"
                label="Endereço" 
                {...register('address')} 
                error={errors.address?.message} 
            />
            <Input 
                id="academy-phone"
                label="Telefone (WhatsApp)" 
                {...register('phone')} 
                error={errors.phone?.message} 
            />
            <Input 
                id="academy-logo"
                label="URL da Logo (Opcional)" 
                placeholder="https://exemplo.com/logo.png"
                {...register('logoUrl')} 
                error={errors.logoUrl?.message} 
            />
            <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={isSubmitting} className="w-full sm:w-auto">
                    {academy ? 'Salvar Alterações' : 'Criar Academia'}
                </Button>
            </div>
        </form>
    );
}
