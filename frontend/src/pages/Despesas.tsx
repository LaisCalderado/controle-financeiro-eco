import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { Plus, TrendingDown } from 'lucide-react';
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
  const [despesas, setDespesas] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<Transacao | null>(null);
  const [filtro, setFiltro] = useState({
    tipo: 'mes',
    dataInicio: startOfMonth(new Date()),
    dataFim: endOfMonth(new Date())
  });

  useEffect(() => {
    fetchDespesas();
  }, []);

  const fetchDespesas = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/transactions', {
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

  const totalDespesas = despesasFiltradas.reduce((sum, d) => sum + (d.valor || 0), 0);

  const handleSubmit = async (data: any) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const dataToSend = {
        ...data,
        tipo: 'despesa'
      };

      if (editingDespesa) {
        await api.put(`/transactions/${editingDespesa.id}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await api.post('/transactions', dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setShowForm(false);
      setEditingDespesa(null);
      fetchDespesas();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
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
      await api.delete(`/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDespesas();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Despesas</h1>
              <p className="text-slate-500 mt-1">Gerencie as despesas da lavanderia</p>
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
