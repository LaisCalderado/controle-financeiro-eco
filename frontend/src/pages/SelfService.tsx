import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { Plus, TrendingUp, Sparkles, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/dashboard/StatCard';
import FiltroData from '../components/dashboard/FiltroData';
import TransacaoForm from '../components/financeiro/TransacaoForm';
import TransacaoList from '../components/financeiro/TransacaoList';

interface Transacao {
  id: number;
  tipo: string;
  tipo_servico?: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
}

export default function SelfService() {
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
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: number | null; descricao: string }>({ show: false, id: null, descricao: '' });

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
      // Filtrar apenas receitas do tipo self-service
      const receitasData = response.data.filter((t: Transacao) => 
        t.tipo === 'receita' && t.tipo_servico === 'selfservice'
      );
      setReceitas(receitasData);
    } catch (error) {
      console.error('Erro ao buscar receitas self-service:', error);
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
        tipo: 'receita',
        tipo_servico: 'selfservice'
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
      await fetchReceitas();
    } catch (error: any) {
      console.error('Erro ao salvar receita self-service:', error);
      alert(`Erro ao salvar receita: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (receita: Transacao) => {
    setEditingReceita(receita);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    const receita = receitas.find(r => r.id === id);
    if (receita) {
      setDeleteModal({ show: true, id, descricao: receita.descricao });
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/transactions/${deleteModal.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteModal({ show: false, id: null, descricao: '' });
      fetchReceitas();
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, id: null, descricao: '' });
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
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
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900">Self-Service</h1>
                </div>
                <p className="text-slate-500">Cliente lava/seca a própria roupa</p>
              </div>
            </div>
            <button
              onClick={() => {
                setEditingReceita(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
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
              variant="primary"
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

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {deleteModal.show && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelDelete}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Confirmar Exclusão
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Tem certeza que deseja excluir a receita <strong>"{deleteModal.descricao}"</strong>? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={cancelDelete}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
