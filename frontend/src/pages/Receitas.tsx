import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { Plus, TrendingUp, Menu } from 'lucide-react';
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

export default function Receitas() {
  const [receitas, setReceitas] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReceita, setEditingReceita] = useState<Transacao | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filtro, setFiltro] = useState({
    tipo: 'mes',
    dataInicio: startOfMonth(new Date()),
    dataFim: endOfMonth(new Date())
  });

  useEffect(() => {
    fetchReceitas();
  }, []);

  const fetchReceitas = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const receitasData = response.data.filter((t: Transacao) => t.tipo === 'receita');
      setReceitas(receitasData);
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const receitasFiltradas = useMemo(() => {
    return receitas.filter((r) => {
      const data = parseISO(r.data);
      return isWithinInterval(data, { start: filtro.dataInicio, end: filtro.dataFim });
    });
  }, [receitas, filtro]);

  const totalReceitas = useMemo(() => {
    return receitasFiltradas.reduce((sum, r) => sum + (Number(r.valor) || 0), 0);
  }, [receitasFiltradas]);

  const handleSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const dataToSend = {
        ...data,
        tipo: 'receita'
      };

      if (editingReceita) {
        await api.put(`/api/transactions/${editingReceita.id}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/api/transactions', dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowForm(false);
      setEditingReceita(null);
      fetchReceitas();
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (receita: Transacao) => {
    setEditingReceita(receita);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReceitas();
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
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
                <h1 className="text-3xl font-bold text-slate-900">Receitas</h1>
                <p className="text-slate-500 mt-1">Gerencie as receitas da lavanderia</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingReceita(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Receita</span>
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Total no Período"
              value={`R$ ${totalReceitas.toFixed(2)}`}
              icon={TrendingUp}
              variant="success"
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
                  tipo="receita"
                  transacao={editingReceita}
                  onSubmit={handleSubmit}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingReceita(null);
                  }}
                  isLoading={isSaving}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <TransacaoList
            transacoes={receitasFiltradas}
            tipo="receita"
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
