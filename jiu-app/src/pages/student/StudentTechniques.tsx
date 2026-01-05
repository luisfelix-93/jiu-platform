import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { PlayCircle, Clock } from 'lucide-react';
import { ContentService } from '../../services/content.service';

export const StudentTechniques = () => {
    const [contents, setContents] = useState<any[]>([]);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const data = await ContentService.listLibrary();
                setContents(data);
            } catch (error) {
                console.error("Failed to fetch content", error);
            }
        };
        fetchContent();
    }, []);

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-neutral-800">Biblioteca de Técnicas</h2>
                <p className="text-neutral-500">Revise o conteúdo aprendido nas aulas.</p>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contents.length > 0 ? (
                    contents.map((tech) => (
                        <Card key={tech.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                            <div className="relative aspect-video bg-neutral-200">
                                <img src={tech.thumbnailUrl || 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80&w=300&h=200'} alt={tech.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PlayCircle className="w-12 h-12 text-white" />
                                </div>
                                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {tech.duration || '00:00'}
                                </span>
                            </div>
                            <CardHeader className="p-4 pb-2">
                                <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">{tech.contentType || 'Técnica'}</div>
                                <CardTitle className="text-base">{tech.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-1">
                                <Button size="sm" variant="secondary" className="w-full">Assistir Aula</Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 text-neutral-500">
                        Nenhum conteúdo disponível no momento.
                    </div>
                )}
            </div>
        </div>
    );
};
