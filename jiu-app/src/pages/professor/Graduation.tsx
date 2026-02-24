import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { translateBelt } from '../../utils/belt';

interface Student {
    id: string;
    name: string;
    beltColor: string;
    stripeCount: number;
    attendanceCount: number;
    nextGraduationGoal: number | null;
    avatarUrl: string;
}

export const Graduation = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await api.get('/graduation/students');
            setStudents(response.data);
        } catch (error) {
            console.error("Error fetching students", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromote = async (student: Student) => {
        const isBeltPromotion = student.stripeCount >= 4;
        const message = isBeltPromotion
            ? "Tem certeza que deseja promover este aluno de faixa?"
            : "Tem certeza que deseja adicionar um grau neste aluno?";

        if (!confirm(message)) return;
        try {
            await api.post(`/graduation/students/${student.id}/promote`);
            // Refresh list or update local state
            fetchStudents();
        } catch (error) {
            alert("Erro ao promover aluno");
        }
    };

    const startEditing = (student: Student) => {
        setEditingId(student.id);
        const remaining = student.nextGraduationGoal
            ? Math.max(0, student.nextGraduationGoal - student.attendanceCount)
            : 0;
        setEditValue(remaining.toString());
    };

    const saveGoal = async (student: Student) => {
        const remaining = parseInt(editValue);
        if (isNaN(remaining)) return;

        const newGoal = student.attendanceCount + remaining;

        try {
            await api.patch(`/graduation/students/${student.id}/goal`, { goal: newGoal });
            setEditingId(null);
            fetchStudents();
        } catch (error) {
            alert("Erro ao atualizar meta");
        }
    };

    const getRowColor = (student: Student) => {
        const remaining = student.nextGraduationGoal
            ? Math.max(0, student.nextGraduationGoal - student.attendanceCount)
            : 999;

        if (student.nextGraduationGoal && remaining === 0) return "bg-green-50"; // Ready
        return "";
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-neutral-900">Graduação</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Acompanhamento de Alunos</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p>Carregando...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b text-left text-sm font-medium text-neutral-500">
                                        <th className="p-4">Aluno</th>
                                        <th className="p-4">Faixa</th>
                                        <th className="p-4">Graus</th>
                                        <th className="p-4">Aulas Concluídas</th>
                                        <th className="p-4">Aulas Faltantes (Meta)</th>
                                        <th className="p-4">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => {
                                        const remaining = student.nextGraduationGoal
                                            ? Math.max(0, student.nextGraduationGoal - student.attendanceCount)
                                            : "N/D";

                                        return (
                                            <tr key={student.id} className={`border-b last:border-0 hover:bg-neutral-50 ${getRowColor(student)}`}>
                                                <td className="p-4 font-medium">{student.name}</td>
                                                <td className="p-4 capitalize">{translateBelt(student.beltColor)}</td>
                                                <td className="p-4">
                                                    <div className="flex gap-1">
                                                        {Array.from({ length: 4 }).map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`w-3 h-3 rounded-full border ${i < student.stripeCount ? 'bg-black border-black' : 'bg-transparent border-neutral-300'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-4">{student.attendanceCount}</td>
                                                <td className="p-4">
                                                    {editingId === student.id ? (
                                                        <div className="flex gap-2 items-center">
                                                            <Input
                                                                type="number"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="w-20 h-8"
                                                            />
                                                            <Button onClick={() => saveGoal(student)} size="sm" variant="primary">Ok</Button>
                                                            <Button onClick={() => setEditingId(null)} size="sm" variant="ghost">X</Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 cursor-pointer hover:text-primary" onClick={() => startEditing(student)}>
                                                            <span>{remaining}</span>
                                                            <span className="text-xs text-neutral-400">(Editar)</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <Button
                                                        size="sm"
                                                        disabled={typeof remaining === 'number' && (remaining > 0)}
                                                        onClick={() => handlePromote(student)}
                                                    >
                                                        {student.stripeCount >= 4 ? 'Trocar Faixa' : '+ Grau'}
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

