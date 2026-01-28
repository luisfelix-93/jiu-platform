import { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { ClassService } from '../../../services/class.service';
import { UserService, type User } from '../../../services/user.service';
import { Trash2, UserPlus, Shield, GraduationCap, User as UserIcon } from 'lucide-react';
import { Input } from '../../../components/ui/Input';

interface ClassEnrollmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    classId: string;
    className: string;
}

interface Enrollment {
    id: string; // The enrollment ID, but sometimes we just need user ID
    user: User;
    enrolledAt: string;
    status: string;
}

export const ClassEnrollmentModal = ({ isOpen, onClose, classId, className }: ClassEnrollmentModalProps) => {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen && classId) {
            fetchEnrollments();
            fetchAllUsers();
        }
    }, [isOpen, classId]);

    const fetchEnrollments = async () => {
        setIsLoading(true);
        try {
            const data = await ClassService.getClassStudents(classId);
            setEnrollments(data);
        } catch (error) {
            console.error("Failed to fetch enrollments", error);
            alert("Erro ao carregar lista de alunos.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const users = await UserService.listUsers();
            setAllUsers(users);
        } catch (error) {
            console.error("Failed to fetch users for selection", error);
        }
    };

    const handleEnroll = async (userId: string) => {
        try {
            await ClassService.enroll(classId, userId);
            fetchEnrollments(); // Refresh list
            setSearchTerm(''); // Clear search
        } catch (error: any) {
            console.error("Failed to enroll", error);
            alert("Erro ao matricular usuário: " + (error.response?.data?.error || error.message));
        }
    };

    const handleRemove = async (userId: string) => {
        if (!confirm("Tem certeza que deseja remover este usuário da turma?")) return;
        try {
            await ClassService.removeStudent(classId, userId);
            setEnrollments(prev => prev.filter(e => e.user.id !== userId));
        } catch (error) {
            console.error("Failed to remove", error);
            alert("Erro ao remover usuário.");
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="h-3 w-3 text-red-500" />;
            case 'professor': return <GraduationCap className="h-3 w-3 text-purple-500" />;
            default: return <UserIcon className="h-3 w-3 text-blue-500" />;
        }
    };

    // Users not yet enrolled
    const availableUsers = allUsers.filter(u =>
        !enrollments.some(e => e.user.id === u.id) &&
        (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ).slice(0, 5); // Limit suggestions

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Matriculados - ${className}`} maxWidth="max-w-2xl">
            <div className="space-y-6">

                {/* Add User Section */}
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Adicionar Aluno/Professor
                    </h4>
                    <div className="relative">
                        <Input
                            placeholder="Buscar usuário para matricular..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="bg-white"
                        />
                        {searchTerm.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-neutral-200 shadow-lg rounded-b-md z-10 max-h-48 overflow-y-auto">
                                {availableUsers.length > 0 ? (
                                    availableUsers.map(user => (
                                        <div key={user.id} className="p-2 hover:bg-neutral-50 flex justify-between items-center cursor-pointer border-b last:border-0" onClick={() => handleEnroll(user.id)}>
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden">
                                                    <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`} alt="" className="h-full w-full object-cover" />
                                                </div>
                                                <div className="text-sm">
                                                    <span className="font-medium">{user.name}</span>
                                                    <span className="text-neutral-500 text-xs ml-2">({user.role})</span>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="h-6 text-xs text-primary">Adicionar</Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-3 text-xs text-neutral-500 text-center">Nenhum usuário encontrado</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* List Section */}
                <div>
                    <h4 className="text-sm font-medium mb-3">Lista de Matriculados ({enrollments.length})</h4>
                    {isLoading ? (
                        <div className="text-center py-4 text-sm text-neutral-500">Carregando...</div>
                    ) : (
                        <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                            {enrollments.map((enrollment) => (
                                <div key={enrollment.id} className="p-3 flex justify-between items-center hover:bg-neutral-50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-neutral-200 overflow-hidden">
                                            <img
                                                src={enrollment.user.avatarUrl || `https://ui-avatars.com/api/?name=${enrollment.user.name}&background=random`}
                                                alt={enrollment.user.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm flex items-center gap-2">
                                                {enrollment.user.name}
                                                <span title={enrollment.user.role}>{getRoleIcon(enrollment.user.role)}</span>
                                            </div>
                                            <div className="text-xs text-neutral-500">{enrollment.user.email} • {enrollment.user.beltColor} belt</div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                        onClick={() => handleRemove(enrollment.user.id)}
                                        title="Remover da turma"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {enrollments.length === 0 && (
                                <div className="p-4 text-center text-sm text-neutral-500">
                                    Nenhum aluno matriculado nesta turma.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <Button onClick={onClose}>Fechar</Button>
                </div>
            </div>
        </Modal>
    );
};
