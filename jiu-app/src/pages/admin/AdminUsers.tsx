import { useEffect, useState } from 'react';
import { UserService, type User } from '../../services/user.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserModal } from './components/UserModal';
import { Edit2, Trash2, Plus, Search, Shield, User as UserIcon, GraduationCap } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { translateBelt } from '../../utils/belt';

export const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await UserService.listUsers(); // Fetch all
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
        try {
            await UserService.deleteUser(id);
            setUsers(users.filter(u => u.id !== id));
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir usuário');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="h-4 w-4 text-red-500" />;
            case 'professor': return <GraduationCap className="h-4 w-4 text-purple-500" />;
            default: return <UserIcon className="h-4 w-4 text-blue-500" />;
        }
    };

    const getBeltColorDisplay = (color: string) => {
        const colors: Record<string, string> = {
            white: 'bg-white border-gray-200 text-gray-800',
            grey: 'bg-gray-400 text-white',
            yellow: 'bg-yellow-400 text-yellow-900',
            orange: 'bg-orange-500 text-white',
            green: 'bg-green-600 text-white',
            blue: 'bg-blue-600 text-white',
            purple: 'bg-purple-600 text-white',
            brown: 'bg-stone-700 text-white',
            black: 'bg-black text-white',
            red: 'bg-red-600 text-white'
        };
        return colors[color.toLowerCase()] || 'bg-gray-100';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400">
                    Gerenciar Usuários
                </h1>
                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Usuário
                </Button>
            </div>

            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <Input
                            placeholder="Buscar por nome ou email..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 bg-neutral-100 p-1 rounded-lg">
                        {['all', 'aluno', 'professor', 'admin'].map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${roleFilter === role
                                    ? 'bg-white shadow text-primary'
                                    : 'text-neutral-500 hover:text-neutral-700'
                                    }`}
                            >
                                {role === 'all' ? 'Todos' : role.charAt(0).toUpperCase() + role.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-8">Carregando usuários...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 border-b">
                                <tr>
                                    <th className="p-3 font-medium text-neutral-500">Usuário</th>
                                    <th className="p-3 font-medium text-neutral-500">Função</th>
                                    <th className="p-3 font-medium text-neutral-500">Faixa</th>
                                    <th className="p-3 font-medium text-neutral-500">Status</th>
                                    <th className="p-3 font-medium text-neutral-500 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="p-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-neutral-200 overflow-hidden">
                                                    <img
                                                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                                        alt={user.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-neutral-900">{user.name}</div>
                                                    <div className="text-xs text-neutral-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2 capitalize text-neutral-700">
                                                {getRoleIcon(user.role)}
                                                {user.role}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getBeltColorDisplay(user.beltColor)}`}>
                                                {translateBelt(user.beltColor)}
                                                {user.stripeCount > 0 && ` (${user.stripeCount} graus)`}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.isActive ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(user.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-8 text-neutral-500">Nenhum usuário encontrado.</div>
                        )}
                    </div>
                )}
            </Card>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                onSuccess={fetchUsers}
            />
        </div>
    );
};
