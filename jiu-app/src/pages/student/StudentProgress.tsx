import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/useAuthStore';
import { AttendanceService, type AttendanceStats } from '../../services/attendance.service';
import { Trophy, Calendar as CalendarIcon, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const StudentProgress = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await AttendanceService.getMyStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch statistics", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return <div className="p-8 text-center">Carregando progresso...</div>;
    }

    const beltColor = user?.beltColor || 'Branca';

    return (
        <div className="space-y-6">
            <header>
                <h2 className="text-2xl font-bold text-neutral-800">Seu Progresso</h2>
                <p className="text-neutral-500">Acompanhe sua jornada no Jiu-Jitsu.</p>
            </header>

            {/* Belt Status */}
            <Card className="bg-gradient-to-r from-neutral-800 to-neutral-900 text-white">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-neutral-400 text-sm uppercase tracking-wider mb-1">Graduação Atual</p>
                        <h3 className="text-3xl font-bold capitalize">{beltColor} Belt</h3>
                        <p className="text-sm text-neutral-400 mt-2">
                            {user?.stripeCount ? `${user.stripeCount} Grau(s)` : 'Sem graus'}
                        </p>
                    </div>
                    <div className="h-16 w-16 bg-white/10 rounded-full flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-yellow-400" />
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Total Classes */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500">Aulas Totais</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalClasses || 0}</div>
                        <p className="text-xs text-neutral-500 mt-1">Desde o início</p>
                    </CardContent>
                </Card>

                {/* Monthly Streak */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500">Sequência Atual</CardTitle>
                        <TrendingUp className="h-4 w-4 text-success" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.streak || 0} Dias</div>
                        <p className="text-xs text-neutral-500 mt-1">Treinando sem parar!</p>
                    </CardContent>
                </Card>

                {/* Last Class */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500">Último Treino</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-neutral-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-semibold truncate">
                            {stats?.lastClass?.date ? format(new Date(stats.lastClass.date), "dd/MM", { locale: ptBR }) : '-'}
                        </div>
                        <p className="text-xs text-neutral-500 truncate">
                            {stats?.lastClass?.className || 'Nenhum registro recente'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Breakdown Chart (Replaced with List for MVP) */}
            <Card>
                <CardHeader>
                    <CardTitle>Histórico Recente</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats?.monthlyAttendance && stats.monthlyAttendance.length > 0 ? (
                            stats.monthlyAttendance.map((item, index) => (
                                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <span className="capitalize">{item.month}</span>
                                    <span className="font-bold bg-neutral-100 px-2 py-1 rounded">{item.count} Aulas</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-neutral-500 text-center py-4">Sem dados de frequência recentes.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
