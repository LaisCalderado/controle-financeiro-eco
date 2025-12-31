// src/pages/AdminDashboardPage.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Users, TrendingUp, TrendingDown, Menu, DollarSign } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import { api } from '../services/api';

interface DashboardData {
    usuarios: {
        total: number;
    };
    transacoes: {
        total: number;
        receitas: {
            total: number;
            porCategoria: Array<{ categoria: string; quantidade: string; total: string }>;
        };
        despesas: {
            total: number;
            porCategoria: Array<{ categoria: string; quantidade: string; total: string }>;
        };
        saldo: number;
    };
}

export default function AdminDashboardPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await api.get('/api/admin/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
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
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                                <BarChart3 className="w-8 h-8 text-emerald-600" />
                                Dashboard Consolidado
                            </h1>
                            <p className="text-slate-600 mt-1">Visão geral de todos os usuários</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <p className="text-slate-500">Carregando dados...</p>
                        </div>
                    ) : data ? (
                        <>
                            {/* Cards de Resumo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-lg p-6 shadow-sm border border-slate-200"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-600 text-sm">Total de Usuários</span>
                                        <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900">{data.usuarios.total}</div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white rounded-lg p-6 shadow-sm border border-emerald-200"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-600 text-sm">Total Receitas</span>
                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-emerald-600">
                                        {formatCurrency(data.transacoes.receitas.total)}
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white rounded-lg p-6 shadow-sm border border-rose-200"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-600 text-sm">Total Despesas</span>
                                        <TrendingDown className="w-5 h-5 text-rose-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-rose-600">
                                        {formatCurrency(data.transacoes.despesas.total)}
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className={`bg-white rounded-lg p-6 shadow-sm border ${
                                        data.transacoes.saldo >= 0 ? 'border-emerald-200' : 'border-rose-200'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-slate-600 text-sm">Saldo Total</span>
                                        <DollarSign className={`w-5 h-5 ${data.transacoes.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
                                    </div>
                                    <div className={`text-3xl font-bold ${
                                        data.transacoes.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'
                                    }`}>
                                        {formatCurrency(data.transacoes.saldo)}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Receitas por Categoria */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white rounded-lg p-6 shadow-sm"
                                >
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                        Receitas por Categoria
                                    </h3>
                                    <div className="space-y-3">
                                        {data.transacoes.receitas.porCategoria.length > 0 ? (
                                            data.transacoes.receitas.porCategoria.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                                                    <div>
                                                        <div className="font-medium text-slate-900 capitalize">{item.categoria || 'Sem categoria'}</div>
                                                        <div className="text-sm text-slate-600">{item.quantidade} transações</div>
                                                    </div>
                                                    <div className="text-lg font-bold text-emerald-600">
                                                        {formatCurrency(parseFloat(item.total))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 text-center py-4">Nenhuma receita registrada</p>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Despesas por Categoria */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-white rounded-lg p-6 shadow-sm"
                                >
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <TrendingDown className="w-5 h-5 text-rose-600" />
                                        Despesas por Categoria
                                    </h3>
                                    <div className="space-y-3">
                                        {data.transacoes.despesas.porCategoria.length > 0 ? (
                                            data.transacoes.despesas.porCategoria.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
                                                    <div>
                                                        <div className="font-medium text-slate-900 capitalize">{item.categoria || 'Sem categoria'}</div>
                                                        <div className="text-sm text-slate-600">{item.quantidade} transações</div>
                                                    </div>
                                                    <div className="text-lg font-bold text-rose-600">
                                                        {formatCurrency(parseFloat(item.total))}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-500 text-center py-4">Nenhuma despesa registrada</p>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-white rounded-lg p-6 shadow-sm"
                            >
                                <h3 className="text-xl font-bold text-slate-900 mb-4">Estatísticas Gerais</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <div className="text-sm text-slate-600 mb-1">Total de Transações</div>
                                        <div className="text-2xl font-bold text-slate-900">{data.transacoes.total}</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <div className="text-sm text-slate-600 mb-1">Média por Usuário</div>
                                        <div className="text-2xl font-bold text-slate-900">
                                            {data.usuarios.total > 0 
                                                ? (data.transacoes.total / data.usuarios.total).toFixed(1)
                                                : '0'}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <div className="text-sm text-slate-600 mb-1">Ticket Médio</div>
                                        <div className="text-2xl font-bold text-slate-900">
                                            {data.transacoes.total > 0
                                                ? formatCurrency(data.transacoes.receitas.total / data.transacoes.total)
                                                : formatCurrency(0)}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <p className="text-slate-500">Erro ao carregar dados</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
