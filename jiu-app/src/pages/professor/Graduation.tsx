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
    lastGraduationDate: string | null;
    avatarUrl: string;
}

export const Graduation = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
    const [editGoalValue, setEditGoalValue] = useState<string>('');
    const [editingAttendanceId, setEditingAttendanceId] = useState<string | null>(null);
    const [editAttendanceValue, setEditAttendanceValue] = useState<string>('');
    const [savingAttendance, setSavingAttendance] = useState(false);
    
    const [editingDateId, setEditingDateId] = useState<string | null>(null);
    const [editDateValue, setEditDateValue] = useState<string>('');
    const [savingDate, setSavingDate] = useState(false);

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
            fetchStudents();
        } catch (error) {
            alert("Erro ao promover aluno");
        }
    };

    // --- Goal editing ---
    const startEditingGoal = (student: Student) => {
        setEditingGoalId(student.id);
        const remaining = student.nextGraduationGoal
            ? Math.max(0, student.nextGraduationGoal - student.attendanceCount)
            : 0;
        setEditGoalValue(remaining.toString());
    };

    const saveGoal = async (student: Student) => {
        const remaining = parseInt(editGoalValue);
        if (isNaN(remaining)) return;

        const newGoal = student.attendanceCount + remaining;

        try {
            await api.patch(`/graduation/students/${student.id}/goal`, { goal: newGoal });
            setEditingGoalId(null);
            fetchStudents();
        } catch (error) {
            alert("Erro ao atualizar meta");
        }
    };

    // --- Attendance editing ---
    const startEditingAttendance = (student: Student) => {
        setEditingAttendanceId(student.id);
        setEditAttendanceValue(student.attendanceCount.toString());
    };

    const saveAttendance = async (student: Student) => {
        const newCount = parseInt(editAttendanceValue);
        if (isNaN(newCount) || newCount < 0) return;
        if (newCount === student.attendanceCount) {
            setEditingAttendanceId(null);
            return;
        }

        setSavingAttendance(true);
        try {
            await api.post(`/graduation/students/${student.id}/adjust-attendance`, {
                newCount,
            });
            setEditingAttendanceId(null);
            fetchStudents();
        } catch (error: any) {
            const msg = error?.response?.data?.error || "Erro ao ajustar presenças";
            alert(msg);
        } finally {
            setSavingAttendance(false);
        }
    };

    const handleAttendanceKeyDown = (e: React.KeyboardEvent, student: Student) => {
        if (e.key === 'Enter') saveAttendance(student);
        if (e.key === 'Escape') setEditingAttendanceId(null);
    };

    // --- Graduation Date editing ---
    const startEditingDate = (student: Student) => {
        setEditingDateId(student.id);
        if (student.lastGraduationDate) {
            const date = new Date(student.lastGraduationDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            setEditDateValue(`${year}-${month}-${day}`);
        } else {
            setEditDateValue('');
        }
    };

    const saveDate = async (student: Student) => {
        setSavingDate(true);
        try {
            let isoDate = null;
            if (editDateValue) {
                const [year, month, day] = editDateValue.split('-');
                const d = new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999);
                isoDate = d.toISOString();
            }
            await api.patch(`/graduation/students/${student.id}/graduation-date`, { 
                date: isoDate 
            });
            setEditingDateId(null);
            fetchStudents();
        } catch (error) {
            alert("Erro ao atualizar data de graduação");
        } finally {
            setSavingDate(false);
        }
    };

    const handleDateKeyDown = (e: React.KeyboardEvent, student: Student) => {
        if (e.key === 'Enter') saveDate(student);
        if (e.key === 'Escape') setEditingDateId(null);
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
                                        <th className="p-4">Última Graduação</th>
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
                                                {/* Editable Graduation Date */}
                                                <td className="p-4">
                                                    {editingDateId === student.id ? (
                                                        <div className="flex gap-2 items-center">
                                                            <Input
                                                                type="date"
                                                                value={editDateValue}
                                                                onChange={(e) => setEditDateValue(e.target.value)}
                                                                onKeyDown={(e) => handleDateKeyDown(e, student)}
                                                                className="w-36 h-8"
                                                                autoFocus
                                                                disabled={savingDate}
                                                            />
                                                            <Button
                                                                onClick={() => saveDate(student)}
                                                                size="sm"
                                                                variant="primary"
                                                                disabled={savingDate}
                                                            >
                                                                {savingDate ? '...' : 'Ok'}
                                                            </Button>
                                                            <Button
                                                                onClick={() => setEditingDateId(null)}
                                                                size="sm"
                                                                variant="ghost"
                                                                disabled={savingDate}
                                                            >
                                                                X
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="flex items-center gap-2 cursor-pointer hover:text-primary"
                                                            onClick={() => startEditingDate(student)}
                                                            title="Clique para editar a data da última graduação"
                                                        >
                                                            <span>
                                                                {student.lastGraduationDate 
                                                                    ? new Date(student.lastGraduationDate).toLocaleDateString() 
                                                                    : 'N/D'}
                                                            </span>
                                                            <span className="text-xs text-neutral-400">(Editar)</span>
                                                        </div>
                                                    )}
                                                </td>
                                                {/* Editable Attendance Count */}
                                                <td className="p-4">
                                                    {editingAttendanceId === student.id ? (
                                                        <div className="flex gap-2 items-center">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={editAttendanceValue}
                                                                onChange={(e) => setEditAttendanceValue(e.target.value)}
                                                                onKeyDown={(e) => handleAttendanceKeyDown(e, student)}
                                                                className="w-20 h-8"
                                                                autoFocus
                                                                disabled={savingAttendance}
                                                            />
                                                            <Button
                                                                onClick={() => saveAttendance(student)}
                                                                size="sm"
                                                                variant="primary"
                                                                disabled={savingAttendance}
                                                            >
                                                                {savingAttendance ? '...' : 'Ok'}
                                                            </Button>
                                                            <Button
                                                                onClick={() => setEditingAttendanceId(null)}
                                                                size="sm"
                                                                variant="ghost"
                                                                disabled={savingAttendance}
                                                            >
                                                                X
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="flex items-center gap-2 cursor-pointer hover:text-primary"
                                                            onClick={() => startEditingAttendance(student)}
                                                            title="Clique para editar a quantidade de presenças"
                                                        >
                                                            <span>{student.attendanceCount}</span>
                                                            <span className="text-xs text-neutral-400">(Editar)</span>
                                                        </div>
                                                    )}
                                                </td>
                                                {/* Editable Goal (remaining classes) */}
                                                <td className="p-4">
                                                    {editingGoalId === student.id ? (
                                                        <div className="flex gap-2 items-center">
                                                            <Input
                                                                type="number"
                                                                value={editGoalValue}
                                                                onChange={(e) => setEditGoalValue(e.target.value)}
                                                                className="w-20 h-8"
                                                            />
                                                            <Button onClick={() => saveGoal(student)} size="sm" variant="primary">Ok</Button>
                                                            <Button onClick={() => setEditingGoalId(null)} size="sm" variant="ghost">X</Button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 cursor-pointer hover:text-primary" onClick={() => startEditingGoal(student)}>
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
