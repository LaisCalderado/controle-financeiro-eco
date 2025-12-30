import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, Wallet, DollarSign, LogOut, Plus, Calendar, Tag, Menu, Sparkles, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/dashboard/StatCard';
import FiltroData from '../components/dashboard/FiltroData';
import GraficoCategoria from '../components/dashboard/GraficoCategoria';
import GraficoEvolucao from '../components/dashboard/GraficoEvolucao';

interface Transacao {
    id: number;
    descricao: string;
    valor: number;
    data: string;
    tipo: 'receita' | 'despesa';
    tipo_servico?: 'selfservice' | 'completo' | null;
    categoria?: string;
}

const DashboardPage: React.FC = () => {
    const [transacoes, setTransacoes] = useState<Transacao[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [filtro, setFiltro] = useState({
        tipo: 'mes',
        dataInicio: startOfMonth(new Date()),
        dataFim: endOfMonth(new Date())
    });

    const fetchTransacoes = React.useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('/api/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const data: Transacao[] = response.data.map((t: any) => ({
                id: t.id,
                descricao: t.descricao || 'Sem descrição',
                valor: Number(t.value || t.valor) || 0,
                data: t.date || t.data || t.createdAt || new Date().toISOString(),
                tipo: t.tipo === 'receita' ? 'receita' : 'despesa',
                tipo_servico: t.tipo_servico || null,
                categoria: t.categoria || 'Outros'
            }));

            setTransacoes(data);
        } catch (error) {
            console.error('Erro ao buscar transações:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchTransacoes(); }, [fetchTransacoes]);

    const { receitasFiltradas, despesasFiltradas, totais } = useMemo(() => {
        const receitasFiltradas = transacoes.filter((t) => {
            if (t.tipo !== 'receita') return false;
            const data = parseISO(t.data);
            return isWithinInterval(data, { start: filtro.dataInicio, end: filtro.dataFim });
        });

        const despesasFiltradas = transacoes.filter((t) => {
            if (t.tipo !== 'despesa') return false;
            const data = parseISO(t.data);
            return isWithinInterval(data, { start: filtro.dataInicio, end: filtro.dataFim });
        });

        const receitasSelfService = receitasFiltradas.filter(r => r.tipo_servico === 'selfservice');
        const receitasCompleto = receitasFiltradas.filter(r => r.tipo_servico === 'completo');

        const totalReceitas = receitasFiltradas.reduce((sum, r) => sum + Number(r.valor || 0), 0);
        const totalDespesas = despesasFiltradas.reduce((sum, d) => sum + Number(d.valor || 0), 0);
        const totalSelfService = receitasSelfService.reduce((sum, r) => sum + Number(r.valor || 0), 0);
        const totalCompleto = receitasCompleto.reduce((sum, r) => sum + Number(r.valor || 0), 0);
        const saldo = totalReceitas - totalDespesas;

        return {
            receitasFiltradas,
            despesasFiltradas,
            totais: { totalReceitas, totalDespesas, totalSelfService, totalCompleto, saldo }
        };
    }, [transacoes, filtro]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-xl font-semibold text-slate-600">Carregando...</div>
            </div>
        );
    }
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 fixed h-full">
                <Sidebar />
            </aside>

            {/* Sidebar Mobile */}
            <AnimatePresence>
                {sidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'tween' }}
                            className="fixed left-0 top-0 h-full w-64 bg-white z-50 lg:hidden shadow-xl"
                        >
                            <Sidebar onClose={() => setSidebarOpen(false)} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <Menu className="w-6 h-6 text-slate-600" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Dashboard Financeiro</h1>
                                <p className="text-slate-500 mt-1">Acompanhe suas finanças em tempo real</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate(`/selfservice`)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="hidden sm:inline">Nova Transação</span>
                            </button>
                        </div>
                    </motion.div>

                    <div className="mb-6">
                        <FiltroData onFilterChange={setFiltro} currentFilter={filtro} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <StatCard
                            title="Self-Service"
                            value={`R$ ${totais.totalSelfService.toFixed(2)}`}
                            icon={Sparkles}
                            variant="primary"
                        />
                        <StatCard
                            title="Serviço Completo"
                            value={`R$ ${totais.totalCompleto.toFixed(2)}`}
                            icon={Star}
                            variant="default"
                        />
                        <StatCard
                            title="Total Receitas"
                            value={`R$ ${totais.totalReceitas.toFixed(2)}`}
                            icon={TrendingUp}
                            variant="success"
                        />
                        <StatCard
                            title="Total Despesas"
                            value={`R$ ${totais.totalDespesas.toFixed(2)}`}
                            icon={TrendingDown}
                            variant="danger"
                        />
                        <StatCard
                            title="Saldo Atual"
                            value={`R$ ${totais.saldo.toFixed(2)}`}
                            icon={Wallet}
                            variant={totais.saldo >= 0 ? 'primary' : 'danger'}
                        />
                    </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <GraficoCategoria
                        dados={receitasFiltradas}
                        tipo="receita"
                        titulo="Receitas por Categoria"
                    />
                    <GraficoCategoria
                        dados={despesasFiltradas}
                        tipo="despesa"
                        titulo="Despesas por Categoria"
                    />
                </div>
                <div className="mb-8">
                    <GraficoEvolucao
                        receitas={receitasFiltradas}
                        despesas={despesasFiltradas}
                        dataInicio={filtro.dataInicio}
                        dataFim={filtro.dataFim}
                        agrupamento={filtro.tipo === 'ano' ? 'mes' : 'dia'}
                    />
                </div>

                {/* Seção de Receitas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                                Receitas Recentes
                            </h2>
                            <span className="text-sm text-slate-500">
                                {receitasFiltradas.length} {receitasFiltradas.length === 1 ? 'receita' : 'receitas'}
                            </span>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            <AnimatePresence mode="popLayout">
                                {receitasFiltradas.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center py-8 text-slate-400"
                                    >
                                        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                        <p>Nenhuma receita no período</p>
                                    </motion.div>
                                ) : (
                                    receitasFiltradas.slice(0, 10).map((receita) => (
                                        <motion.div
                                            key={receita.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900">{receita.descricao}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(parseISO(receita.data), "dd/MM/yyyy", { locale: ptBR })}
                                                    </span>
                                                    {receita.categoria && (
                                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                                            <Tag className="w-3 h-3" />
                                                            {receita.categoria}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-emerald-600">
                                                    + R$ {receita.valor.toFixed(2)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Seção de Despesas */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <TrendingDown className="w-5 h-5 text-rose-500" />
                                Despesas Recentes
                            </h2>
                            <span className="text-sm text-slate-500">
                                {despesasFiltradas.length} {despesasFiltradas.length === 1 ? 'despesa' : 'despesas'}
                            </span>
                        </div>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            <AnimatePresence mode="popLayout">
                                {despesasFiltradas.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-center py-8 text-slate-400"
                                    >
                                        <TrendingDown className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                        <p>Nenhuma despesa no período</p>
                                    </motion.div>
                                ) : (
                                    despesasFiltradas.slice(0, 10).map((despesa) => (
                                        <motion.div
                                            key={despesa.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="flex items-center justify-between p-3 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900">{despesa.descricao}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(parseISO(despesa.data), "dd/MM/yyyy", { locale: ptBR })}
                                                    </span>
                                                    {despesa.categoria && (
                                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                                            <Tag className="w-3 h-3" />
                                                            {despesa.categoria}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-rose-600">
                                                    - R$ {despesa.valor.toFixed(2)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
