import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { Plus, TrendingDown, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/dashboard/StatCard';
import FiltroData from '../components/dashboard/FiltroData';
import TransacaoForm from '../components/financeiro/TransacaoForm';
import TransacaoList from '../components/financeiro/TransacaoList';

interface Transacao {
  id: number;
  tipo: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
}

export default function Despesas() {
  const location = useLocation();
  const [despesas, setDespesas] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<Transacao | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtro, setFiltro] = useState({
    tipo: 'mes',
    dataInicio: startOfMonth(new Date()),
    dataFim: endOfMonth(new Date())
  });

  useEffect(() => {
    fetchDespesas();

    // Verificar se veio dados de uma despesa fixa para editar
    const state = location.state as any;
    if (state?.editRecorrente) {
      const recorrente = state.editRecorrente;
      // Abrir formulário com dados pré-preenchidos da despesa fixa
      const hoje = new Date();
      const mesAtual = hoje.getMonth();
      const anoAtual = hoje.getFullYear();
      const dataVencimento = new Date(anoAtual, mesAtual, recorrente.dia_vencimento);
      
      setEditingDespesa({
        id: 0, // ID temporário, será uma nova transação baseada na recorrente
        tipo: 'despesa',
        descricao: recorrente.descricao,
        valor: recorrente.valor,
        data: dataVencimento.toISOString().split('T')[0],
        categoria: recorrente.categoria
      });
      setShowForm(true);
      
      // Limpar o state para não reabrir ao voltar
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchDespesas = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const despesasData = response.data.filter((t: Transacao) => t.tipo === 'despesa');
      setDespesas(despesasData);
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const despesasFiltradas = useMemo(() => {
    return despesas.filter((d) => {
      const data = parseISO(d.data);
      return isWithinInterval(data, { start: filtro.dataInicio, end: filtro.dataFim });
    });
  }, [despesas, filtro]);

  const totalDespesas = useMemo(() => {
    return despesasFiltradas.reduce((sum, d) => sum + (Number(d.valor) || 0), 0);
  }, [despesasFiltradas]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const dataToSend = {
        ...data,
        tipo: 'despesa'
      };

      if (editingDespesa) {
        await api.put(`/api/transactions/${editingDespesa.id}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/api/transactions', dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowForm(false);
      setEditingDespesa(null);
      fetchDespesas();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      alert('Erro ao salvar despesa');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitRecorrente = async (data: any) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      await api.post('/api/recorrentes', data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowForm(false);
      fetchDespesas(); // Atualiza a lista
      alert('Despesa fixa cadastrada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar despesa recorrente:', error);
      alert('Erro ao salvar despesa fixa');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitParcelada = async (data: any) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      await api.post('/api/parceladas', data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowForm(false);
      fetchDespesas(); // Atualiza a lista pois as parcelas já foram criadas
      alert('Despesa parcelada cadastrada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar despesa parcelada:', error);
      alert('Erro ao salvar despesa parcelada');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (despesa: Transacao) => {
    setEditingDespesa(despesa);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDespesas();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
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
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      <main className="flex-1 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-slate-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Despesas</h1>
                <p className="text-slate-500 mt-1">Gerencie as despesas da lavanderia</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingDespesa(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Despesa</span>
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Total no Período"
              value={`R$ ${totalDespesas.toFixed(2)}`}
              icon={TrendingDown}
              variant="danger"
            />
            <div className="md:col-span-2">
              <FiltroData onFilterChange={setFiltro} currentFilter={filtro} />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showForm && (
              <motion.div
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <TransacaoForm
                  tipo="despesa"
                  transacao={editingDespesa}
                  onSubmit={handleSubmit}
                  onSubmitRecorrente={handleSubmitRecorrente}
                  onSubmitParcelada={handleSubmitParcelada}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingDespesa(null);
                  }}
                  isLoading={isSaving}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <TransacaoList
            transacoes={despesasFiltradas}
            tipo="despesa"
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
