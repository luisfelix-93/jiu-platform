import { Card } from '../../components/ui/Card';
import { Users, BookOpen, Video, LayoutList } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';




export const AdminHome = () => {
    const navigate = useNavigate();



    const actions = [
        {
            title: 'Gerenciar Usuários',
            description: 'Adicionar, editar ou remover alunos e professores.',
            icon: <Users className="h-8 w-8 text-blue-500" />,
            action: () => navigate('/admin/usuarios'),
            btnText: 'Ver Usuários'
        },
        {
            title: 'Gerenciar Turmas',
            description: 'Criar e organizar turmas da academia.',
            icon: <LayoutList className="h-8 w-8 text-green-500" />,
            action: () => navigate('/admin/turmas'),
            btnText: 'Ver Turmas'
        },
        {
            title: 'Gerenciar Aulas',
            description: 'Planejar aulas e registrar presenças.',
            icon: <BookOpen className="h-8 w-8 text-orange-500" />,
            action: () => navigate('/admin/aulas'),
            btnText: 'Ver Aulas'
        },
        {
            title: 'Conteúdo',
            description: 'Gerenciar biblioteca de vídeos e técnicas.',
            icon: <Video className="h-8 w-8 text-purple-500" />,
            action: () => navigate('/admin/conteudos'),
            btnText: 'Ver Conteúdos'
        }
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">Painel Administrativo</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {actions.map((item, index) => (
                    <Card key={index} className="p-6 flex flex-col items-center text-center space-y-4 hover:shadow-lg transition-shadow">
                        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-full">
                            {item.icon}
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <p className="text-sm text-neutral-500 mt-1">{item.description}</p>
                        </div>
                        <Button onClick={item.action} variant="outline" className="w-full mt-auto">
                            {item.btnText}
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};
