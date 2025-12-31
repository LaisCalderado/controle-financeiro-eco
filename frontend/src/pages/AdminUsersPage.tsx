// src/pages/AdminUsersPage.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit2, Trash2, Menu, Shield, User } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { api } from '../services/api';

interface Usuario {
    id: number;
    nome: string;
    email: string;
    role: 'user' | 'admin';
    created_at: string;
}

export default function AdminUsersPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user' as 'user' | 'admin'
    });

    useEffect(() => {
        loadUsuarios();
    }, []);

    const loadUsuarios = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await api.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsuarios(response.data);
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        try {
            if (editingUser) {
                // Atualizar usuário
                await api.put(`/api/admin/users/${editingUser.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Criar novo usuário
                await api.post('/api/admin/users', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            
            setShowModal(false);
            setEditingUser(null);
            setFormData({ name: '', email: '', password: '', role: 'user' });
            loadUsuarios();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao salvar usuário');
        }
    };

    const handleEdit = (usuario: Usuario) => {
        setEditingUser(usuario);
        setFormData({
            name: usuario.nome,
            email: usuario.email,
            password: '',
            role: usuario.role
        });
        setShowModal(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja deletar este usuário?')) return;

        const token = localStorage.getItem('token');
        try {
            await api.delete(`/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            loadUsuarios();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Erro ao deletar usuário');
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: '', role: 'user' });
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
            {/* Sidebar Desktop */}
            <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-50">
                <Sidebar />
            </div>

            {/* Sidebar Mobile */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'tween' }}
                            className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden"
                        >
                            <Sidebar onClose={() => setSidebarOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="lg:ml-64">
                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-white/50 rounded-lg transition-colors"
                        >
                            <Menu className="w-6 h-6 text-slate-700" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                                <Users className="w-8 h-8 text-emerald-600" />
                                Gerenciar Usuários
                            </h1>
                            <p className="text-slate-600 mt-1">Administre todos os usuários do sistema</p>
                        </div>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Novo Usuário
                        </button>
                    </div>

                    {/* Users Table */}
                    {loading ? (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <p className="text-slate-500">Carregando usuários...</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Usuário
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Perfil
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Criado em
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                Ações
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-slate-200">
                                        {usuarios.map((usuario) => (
                                            <tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-slate-900">{usuario.nome}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-slate-600">{usuario.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        usuario.role === 'admin'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                        {usuario.role === 'admin' ? (
                                                            <Shield className="w-3 h-3" />
                                                        ) : (
                                                            <User className="w-3 h-3" />
                                                        )}
                                                        {usuario.role === 'admin' ? 'Admin' : 'Usuário'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                                                    {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(usuario)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(usuario.id)}
                                                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        >
                            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                    {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Nome
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Senha {editingUser && '(deixe em branco para não alterar)'}
                                        </label>
                                        <input
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={!editingUser}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Perfil
                                        </label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                                        >
                                            <option value="user">Usuário</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                                        >
                                            {editingUser ? 'Salvar' : 'Criar'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
