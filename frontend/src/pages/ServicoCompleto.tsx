import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { Plus, TrendingUp, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import StatCard from '../components/dashboard/StatCard';
import FiltroData from '../components/dashboard/FiltroData';
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

export default function ServicoCompleto() {
  const [receitas, setReceitas] = useState<Transacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReceita, setEditingReceita] = useState<Transacao | null>(null);
  const [filtro, setFiltro] = useState({
    tipo: 'mes',
    dataInicio: startOfMonth(new Date()),
    dataFim: endOfMonth(new Date())
  });

  // Estado do formulário
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    valorBase: '',
    descricao: '',
    categoria: 'lavagem'
  });

  const TAXA_SERVICO = 15.00;

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
      // Filtrar apenas receitas do tipo serviço completo
      const receitasData = response.data.filter((t: Transacao) => 
        t.tipo === 'receita' && t.tipo_servico === 'completo'
      );
      setReceitas(receitasData);
    } catch (error) {
      console.error('Erro ao buscar receitas serviço completo:', error);
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

  const valorTotal = useMemo(() => {
    const base = Number(formData.valorBase) || 0;
    return base + TAXA_SERVICO;
  }, [formData.valorBase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      const dataToSend = {
        data: formData.data,
        valor: valorTotal,
        descricao: formData.descricao,
        categoria: formData.categoria,
        tipo: 'receita',
        tipo_servico: 'completo'
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
      setFormData({
        data: new Date().toISOString().split('T')[0],
        valorBase: '',
        descricao: '',
        categoria: 'lavagem'
      });
      fetchReceitas();
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (receita: Transacao) => {
    // Ao editar, subtrai a taxa para mostrar o valor base
    const valorBase = Number(receita.valor) - TAXA_SERVICO;
    setFormData({
      data: receita.data.split('T')[0],
      valorBase: valorBase.toString(),
      descricao: receita.descricao,
      categoria: receita.categoria
    });
    setEditingReceita(receita);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReceitas();
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
    }
  };

  const categorias = [
    { value: 'lavagem', label: 'Lavagem' },
    { value: 'passadoria', label: 'Passadoria' },
    { value: 'tingimento', label: 'Tingimento' },
    { value: 'outros', label: 'Outros' }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Star className="w-6 h-6 text-amber-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900">Serviço Completo</h1>
              </div>
              <p className="text-slate-500">Funcionário faz a lavagem/secagem (+ R$ 15,00)</p>
            </div>
            <button
              onClick={() => {
                setEditingReceita(null);
                setFormData({
                  data: new Date().toISOString().split('T')[0],
                  valorBase: '',
                  descricao: '',
                  categoria: 'lavagem'
                });
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-md"
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
              variant="default"
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
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    {editingReceita ? 'Editar Receita' : 'Nova Receita'}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Data
                        </label>
                        <input
                          type="date"
                          value={formData.data}
                          onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                          required
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Categoria
                        </label>
                        <select
                          value={formData.categoria}
                          onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        >
                          {categorias.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Descrição
                      </label>
                      <input
                        type="text"
                        value={formData.descricao}
                        onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        placeholder="Ex: Lavagem + Secagem Cliente João"
                        required
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Valor Base (lavagem/secagem)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.valorBase}
                          onChange={(e) => setFormData({ ...formData, valorBase: e.target.value })}
                          placeholder="0.00"
                          required
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                        />
                      </div>

                      <div className="flex flex-col justify-end">
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-sm text-slate-600 mb-1">Taxa de Serviço: + R$ {TAXA_SERVICO.toFixed(2)}</p>
                          <p className="text-lg font-bold text-amber-700">
                            Valor Total: R$ {valorTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingReceita(null);
                          setFormData({
                            data: new Date().toISOString().split('T')[0],
                            valorBase: '',
                            descricao: '',
                            categoria: 'lavagem'
                          });
                        }}
                        className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? 'Salvando...' : editingReceita ? 'Atualizar' : 'Salvar'}
                      </button>
                    </div>
                  </form>
                </div>
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
