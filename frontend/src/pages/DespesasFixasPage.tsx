import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Repeat, CreditCard, Trash2, Play, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

interface Recorrente {
  id: number;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  dia_vencimento: number;
  ativa: boolean;
}

interface Parcelada {
  id: number;
  descricao: string;
  valor_total: number;
  valor_parcela: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  parcela_atual: number;
  total_parcelas: number;
  data_primeira_parcela: string;
  ativa: boolean;
}

export default function DespesasFixasPage() {
  const [recorrentes, setRecorrentes] = useState<Recorrente[]>([]);
  const [parceladas, setParceladas] = useState<Parcelada[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recorrentes' | 'parceladas'>('recorrentes');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [recorrentesRes, parceladasRes] = await Promise.all([
        api.get('/recorrentes', config),
        api.get('/parceladas', config)
      ]);

      setRecorrentes(recorrentesRes.data);
      setParceladas(parceladasRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const excluirRecorrente = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir esta despesa fixa?')) return;

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/recorrentes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir despesa fixa');
    }
  };

  const excluirParcelada = async (id: number) => {
    if (!window.confirm('Deseja realmente excluir esta despesa parcelada?')) return;

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/parceladas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir despesa parcelada');
    }
  };

  const gerarTransacoesMes = async () => {
    if (!window.confirm('Gerar todas as transações fixas do mês atual?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/recorrentes/gerar-mes', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(response.data.message);
    } catch (error) {
      console.error('Erro ao gerar transações:', error);
      alert('Erro ao gerar transações do mês');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Despesas Fixas e Parceladas</h1>
          <p className="text-slate-600">Gerencie suas despesas recorrentes e parcelamentos</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('recorrentes')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'recorrentes'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Repeat className="w-5 h-5" />
            Despesas Fixas ({recorrentes.filter(r => r.ativa).length})
          </button>
          <button
            onClick={() => setActiveTab('parceladas')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'parceladas'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            Parceladas ({parceladas.filter(p => p.ativa).length})
          </button>
        </div>

        {/* Action Button */}
        {activeTab === 'recorrentes' && (
          <div className="mb-6">
            <button
              onClick={gerarTransacoesMes}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg"
            >
              <Play className="w-5 h-5" />
              Gerar Transações do Mês
            </button>
            <p className="text-sm text-slate-500 mt-2">
              Clique para criar automaticamente todas as transações fixas do mês atual
            </p>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {activeTab === 'recorrentes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recorrentes.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-slate-500">
                    Nenhuma despesa fixa cadastrada
                  </div>
                ) : (
                  recorrentes.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-slate-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">{item.descricao}</h3>
                          <p className="text-sm text-slate-500 capitalize">{item.categoria}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.tipo === 'receita'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {item.tipo}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className={`text-2xl font-bold ${
                          item.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          R$ {parseFloat(item.valor.toString()).toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Todo dia {item.dia_vencimento} do mês
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className={`flex items-center gap-1 text-sm ${
                          item.ativa ? 'text-green-600' : 'text-slate-400'
                        }`}>
                          <CheckCircle className="w-4 h-4" />
                          {item.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                        <button
                          onClick={() => excluirRecorrente(item.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'parceladas' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parceladas.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-slate-500">
                    Nenhuma despesa parcelada cadastrada
                  </div>
                ) : (
                  parceladas.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-slate-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">{item.descricao}</h3>
                          <p className="text-sm text-slate-500 capitalize">{item.categoria}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            item.tipo === 'receita'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {item.tipo}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className={`text-2xl font-bold ${
                          item.tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          R$ {parseFloat(item.valor_total.toString()).toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {item.total_parcelas}x de R$ {parseFloat(item.valor_parcela.toString()).toFixed(2)}
                        </p>
                        <div className="mt-2 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-orange-600 h-full transition-all"
                            style={{
                              width: `${(item.parcela_atual / item.total_parcelas) * 100}%`
                            }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Parcela {item.parcela_atual} de {item.total_parcelas}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <span className={`flex items-center gap-1 text-sm ${
                          item.ativa ? 'text-green-600' : 'text-slate-400'
                        }`}>
                          <CheckCircle className="w-4 h-4" />
                          {item.ativa ? 'Ativa' : 'Concluída'}
                        </span>
                        <button
                          onClick={() => excluirParcelada(item.id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
