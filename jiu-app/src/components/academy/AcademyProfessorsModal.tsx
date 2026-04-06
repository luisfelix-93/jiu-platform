import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { AcademyService } from '../../services/academy.service';
import { UserService, type User } from '../../services/user.service';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import { UserMinus, UserPlus, Shield, User as UserIcon } from 'lucide-react';
import type { Academy, AcademyProfessor } from '../../types/academy';

interface AcademyProfessorsModalProps {
    academy: Academy | null;
    isOpen: boolean;
    onClose: () => void;
}

export function AcademyProfessorsModal({ academy, isOpen, onClose }: AcademyProfessorsModalProps) {
    const { user } = useAuthStore();
    const [members, setMembers] = useState<AcademyProfessor[]>([]);
    const [availableProfessors, setAvailableProfessors] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedProfessorId, setSelectedProfessorId] = useState('');

    const loadData = async () => {
        if (!academy?.id) return;
        setIsLoading(true);
        try {
            // Load members of this academy
            const loadedAcademy = await AcademyService.getOne(academy.id);
            setMembers(loadedAcademy.professors || []);

            // Load all professors out there
            const allProfs = await UserService.listUsers('professor');
            
            // Filter out those who are already members
            const memberIds = new Set((loadedAcademy.professors || []).map(p => p.professorId));
            setAvailableProfessors(allProfs.filter(p => !memberIds.has(p.id)));
        } catch (error) {
            toast.error('Erro ao carregar professores');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && academy?.id) {
            loadData();
            setSelectedProfessorId('');
        }
    }, [isOpen, academy?.id]);

    const handleAddProfessor = async () => {
        if (!selectedProfessorId || !academy) return;
        try {
            await AcademyService.addProfessor(academy.id, selectedProfessorId);
            toast.success('Professor adicionado com sucesso!');
            setSelectedProfessorId('');
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Erro ao adicionar professor');
        }
    };

    const handleRemoveProfessor = async (professorId: string) => {
        if (!academy) return;
        if (professorId === user?.id) {
            toast.error('Você não pode remover a si mesmo da academia na qual é owner!');
            return;
        }

        if (!window.confirm('Tem certeza que deseja remover este professor?')) return;

        try {
            await AcademyService.removeProfessor(academy.id, professorId);
            toast.success('Professor removido com sucesso!');
            loadData();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Erro ao remover professor');
        }
    };

    if (!academy) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Professores - ${academy.name}`} maxWidth="max-w-3xl">
            <div className="py-4 space-y-6">
                {/* Adicionar novo professor */}
                <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                    <h3 className="text-sm font-medium text-neutral-800 mb-3 flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Adicionar Professor
                    </h3>
                    <div className="flex gap-2">
                        <select
                            value={selectedProfessorId}
                            onChange={(e) => setSelectedProfessorId(e.target.value)}
                            className="flex-1 rounded-md border-neutral-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                            disabled={isLoading || availableProfessors.length === 0}
                        >
                            <option value="">Selecione um professor...</option>
                            {availableProfessors.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                            ))}
                        </select>
                        <Button 
                            onClick={handleAddProfessor} 
                            disabled={!selectedProfessorId || isLoading}
                        >
                            Adicionar
                        </Button>
                    </div>
                    {availableProfessors.length === 0 && !isLoading && (
                        <p className="text-xs text-neutral-500 mt-2">Não há mais professores disponíveis para adicionar.</p>
                    )}
                </div>

                {/* Lista de Membros */}
                <div>
                    <h3 className="text-sm font-medium text-neutral-800 mb-3 flex items-center gap-2">
                        <UserIcon className="h-4 w-4" />
                        Membros Atuais
                    </h3>
                    
                    {isLoading ? (
                        <p className="text-sm text-neutral-500">Carregando membros...</p>
                    ) : members.length === 0 ? (
                        <p className="text-sm text-neutral-500">Nenhum membro encontrado.</p>
                    ) : (
                        <div className="space-y-3">
                            {members.map(member => (
                                <div key={member.professorId} className="flex items-center justify-between p-3 border rounded-md bg-white hover:border-neutral-300 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                                            <img 
                                                src={member.professor?.avatarUrl || `https://ui-avatars.com/api/?name=${member.professor?.name}`} 
                                                alt="Profile" 
                                                className="h-full w-full object-cover" 
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-neutral-800">{member.professor?.name}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-neutral-500">{member.professor?.email}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide ${member.role === 'owner' ? 'bg-primary/10 text-primary' : 'bg-neutral-100 text-neutral-600'}`}>
                                                    {member.role === 'owner' ? (
                                                        <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Owner</span>
                                                    ) : 'Membro'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {member.role !== 'owner' && (
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={() => handleRemoveProfessor(member.professorId)}
                                        >
                                            <UserMinus className="h-4 w-4 mr-2" />
                                            Remover
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={onClose}>
                    Fechar
                </Button>
            </div>
        </Modal>
    );
}
