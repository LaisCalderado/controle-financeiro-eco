import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/dashboard/StatCard';
import FiltroData from '../components/dashboard/FiltroData';

interface Transacao {
  id: number;
  tipo: string;
  descricao: string;
  valor: number;
  data: string;
  categoria?: string;
}

interface CategoriaResumo {
  total: number;
  quantidade: number;
}

const categoriasLabels: Record<string, string> = {
  lavagem: 'Lavagem',
  passadoria: 'Passadoria',
  delivery: 'Delivery',
  tingimento: 'Tingimento',
  agua: 'Água',
  energia: 'Energia',
  produtos: 'Produtos',
  aluguel: 'Aluguel',
  funcionarios: 'Funcionários',
  manutencao: 'Manutenção',
  outros: 'Outros'
};

export default function Relatorio() {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState({
    tipo: 'mes',
    dataInicio: startOfMonth(new Date()),
    dataFim: endOfMonth(new Date())
  });

  useEffect(() => {
    fetchTransacoes();
  }, []);

  const fetchTransacoes = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransacoes(response.data);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const { receitasFiltradas, despesasFiltradas, resumo, receitasPorCategoria, despesasPorCategoria } = useMemo(() => {
    const receitas = transacoes.filter((t) => t.tipo === 'receita');
    const despesas = transacoes.filter((t) => t.tipo === 'despesa');

    const receitasFiltradas = receitas.filter((r) => {
      const data = parseISO(r.data);
      return isWithinInterval(data, { start: filtro.dataInicio, end: filtro.dataFim });
    });

    const despesasFiltradas = despesas.filter((d) => {
      const data = parseISO(d.data);
      return isWithinInterval(data, { start: filtro.dataInicio, end: filtro.dataFim });
    });

    const totalReceitas = receitasFiltradas.reduce((sum, r) => sum + (Number(r.valor) || 0), 0);
    const totalDespesas = despesasFiltradas.reduce((sum, d) => sum + (Number(d.valor) || 0), 0);
    const saldo = totalReceitas - totalDespesas;
    const margemLucro = totalReceitas > 0 ? ((saldo / totalReceitas) * 100).toFixed(1) : '0';

    const receitasPorCategoria = receitasFiltradas.reduce((acc, r) => {
      const cat = r.categoria || 'outros';
      if (!acc[cat]) acc[cat] = { total: 0, quantidade: 0 };
      acc[cat].total += Number(r.valor) || 0;
      acc[cat].quantidade += 1;
      return acc;
    }, {} as Record<string, CategoriaResumo>);

    const despesasPorCategoria = despesasFiltradas.reduce((acc, d) => {
      const cat = d.categoria || 'outros';
      if (!acc[cat]) acc[cat] = { total: 0, quantidade: 0 };
      acc[cat].total += Number(d.valor) || 0;
      acc[cat].quantidade += 1;
      return acc;
    }, {} as Record<string, CategoriaResumo>);

    return {
      receitasFiltradas,
      despesasFiltradas,
      resumo: { totalReceitas, totalDespesas, saldo, margemLucro },
      receitasPorCategoria,
      despesasPorCategoria
    };
  }, [transacoes, filtro]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Relatórios</h1>
              <p className="text-slate-500 mt-1">Análise financeira detalhada</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FileText className="w-4 h-4" />
              Período: {format(filtro.dataInicio, "dd/MM/yyyy")} - {format(filtro.dataFim, "dd/MM/yyyy")}
            </div>
          </motion.div>

          <div className="mb-6">
            <FiltroData onFilterChange={setFiltro} currentFilter={filtro} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Receitas"
              value={`R$ ${resumo.totalReceitas.toFixed(2)}`}
              icon={TrendingUp}
              variant="success"
            />
            <StatCard
              title="Total Despesas"
              value={`R$ ${resumo.totalDespesas.toFixed(2)}`}
              icon={TrendingDown}
              variant="danger"
            />
            <StatCard
              title={resumo.saldo >= 0 ? 'Lucro' : 'Prejuízo'}
              value={`R$ ${Math.abs(resumo.saldo).toFixed(2)}`}
              icon={Wallet}
              variant={resumo.saldo >= 0 ? 'primary' : 'danger'}
            />
            <StatCard
              title="Margem de Lucro"
              value={`${resumo.margemLucro}%`}
              icon={FileText}
              variant="default"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-700">
                  <TrendingUp className="w-5 h-5" />
                  Receitas por Categoria
                </h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Categoria</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Qtd</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Total</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(receitasPorCategoria)
                        .sort(([, a], [, b]) => b.total - a.total)
                        .map(([categoria, dados]) => (
                          <tr key={categoria} className="border-b border-slate-100 last:border-0">
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                {categoriasLabels[categoria] || categoria}
                              </span>
                            </td>
                            <td className="text-center py-3 px-4 text-sm text-slate-600">{dados.quantidade}</td>
                            <td className="text-right py-3 px-4 text-sm font-medium text-slate-900">
                              R$ {dados.total.toFixed(2)}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-500">
                              {resumo.totalReceitas > 0
                                ? ((dados.total / resumo.totalReceitas) * 100).toFixed(1)
                                : 0}%
                            </td>
                          </tr>
                        ))}
                      {Object.keys(receitasPorCategoria).length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center text-slate-400 py-8">
                            Nenhuma receita no período
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-rose-700">
                  <TrendingDown className="w-5 h-5" />
                  Despesas por Categoria
                </h3>
              </div>
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Categoria</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Qtd</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">Total</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(despesasPorCategoria)
                        .sort(([, a], [, b]) => b.total - a.total)
                        .map(([categoria, dados]) => (
                          <tr key={categoria} className="border-b border-slate-100 last:border-0">
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                                {categoriasLabels[categoria] || categoria}
                              </span>
                            </td>
                            <td className="text-center py-3 px-4 text-sm text-slate-600">{dados.quantidade}</td>
                            <td className="text-right py-3 px-4 text-sm font-medium text-slate-900">
                              R$ {dados.total.toFixed(2)}
                            </td>
                            <td className="text-right py-3 px-4 text-sm text-slate-500">
                              {resumo.totalDespesas > 0
                                ? ((dados.total / resumo.totalDespesas) * 100).toFixed(1)
                                : 0}%
                            </td>
                          </tr>
                        ))}
                      {Object.keys(despesasPorCategoria).length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center text-slate-400 py-8">
                            Nenhuma despesa no período
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Resumo do Resultado</h3>
            </div>
            <div className="p-6">
              <div className={`p-8 rounded-xl text-center ${resumo.saldo >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                <p className="text-lg text-slate-600 mb-2">
                  Resultado financeiro no período
                </p>
                <p className={`text-4xl font-bold ${resumo.saldo >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {resumo.saldo >= 0 ? 'Lucro de ' : 'Prejuízo de '}
                  R$ {Math.abs(resumo.saldo).toFixed(2)}
                </p>
                <p className="text-sm text-slate-500 mt-3">
                  {receitasFiltradas.length} receitas | {despesasFiltradas.length} despesas
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
