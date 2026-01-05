import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ContentService, type Content } from '../../services/content.service';
import { Library, Plus, Video, FileText, ExternalLink } from 'lucide-react';

const createContentSchema = z.object({
    title: z.string().min(3, "Título obrigatório"),
    description: z.string().min(5, "Descrição obrigatória"),
    contentType: z.enum(["video", "document", "link"]),
    fileUrl: z.string().url("URL inválida"),
});

type CreateContentSchema = z.infer<typeof createContentSchema>;

export const ProfessorContent = () => {
    const [contents, setContents] = useState<Content[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateContentSchema>({
        resolver: zodResolver(createContentSchema)
    });

    const fetchContent = async () => {
        try {
            const data = await ContentService.listLibrary();
            setContents(data);
        } catch (error) {
            console.error("Failed to fetch content", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const onSubmit = async (data: CreateContentSchema) => {
        setIsCreating(true);
        try {
            await ContentService.createContent(data);
            await fetchContent();
            setShowForm(false);
            reset();
        } catch (error) {
            console.error("Failed to create content", error);
            alert("Erro ao criar conteúdo");
        } finally {
            setIsCreating(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Carregando biblioteca...</div>;

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-800">Biblioteca Técnica</h2>
                    <p className="text-neutral-500">Gerencie vídeos e materiais de estudo.</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Conteúdo
                </Button>
            </header>

            {showForm && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle>Adicionar Conteúdo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input label="Título" error={errors.title?.message} {...register('title')} />
                            <Input label="Descrição" error={errors.description?.message} {...register('description')} />

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tipo</label>
                                <select
                                    {...register('contentType')}
                                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="video">Vídeo</option>
                                    <option value="document">Documento</option>
                                    <option value="link">Link Externo</option>
                                </select>
                            </div>

                            <Input label="URL do Arquivo/Link" placeholder="https://..." error={errors.fileUrl?.message} {...register('fileUrl')} />

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                                <Button type="submit" isLoading={isCreating}>Salvar</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contents.map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-start justify-between">
                                <span className="truncate pr-2">{item.title}</span>
                                {item.contentType === 'video' ? <Video className="h-5 w-5 text-blue-500" /> :
                                    item.contentType === 'document' ? <FileText className="h-5 w-5 text-orange-500" /> :
                                        <ExternalLink className="h-5 w-5 text-neutral-500" />}
                            </CardTitle>
                            <p className="text-sm text-neutral-500 line-clamp-2">{item.description}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-neutral-400 capitalize">{item.contentType}</span>
                                <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                    Acessar <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {contents.length === 0 && !showForm && (
                <div className="text-center py-12 bg-neutral-50 rounded-lg border border-dashed border-neutral-300">
                    <Library className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500">Biblioteca vazia.</p>
                    <Button variant="ghost" onClick={() => setShowForm(true)}>Adicionar primeiro item</Button>
                </div>
            )}
        </div>
    );
};
