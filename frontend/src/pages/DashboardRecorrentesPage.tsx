import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, RefreshCw, Plus, CalendarClock, Repeat, CircleDollarSign } from 'lucide-react';
import recorrentesService, { 
  TransacaoRecorrente, 
  Vencimento, 
  Estatisticas, 
  Insight 
} from '../services/recorrentes';
import Sidebar from '../components/layout/Sidebar';
import CardsResumo from '../components/recorrentes/CardsResumo';
import ProximosVencimentos from '../components/recorrentes/ProximosVencimentos';
import ListaRecorrentes from '../components/recorrentes/ListaRecorrentes';
import InsightsPanel from '../components/recorrentes/InsightsPanel';
import GraficoDistribuicao from '../components/recorrentes/GraficoDistribuicao';
import '../styles/dashboard-recorrentes.css';

const DashboardRecorrentesPage: React.FC = () => {
  const navigate = useNavigate();
  const [recorrentes, setRecorrentes] = useState<TransacaoRecorrente[]>([]);
  const [vencimentos, setVencimentos] = useState<Vencimento[]>([]);
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; id: number | null; descricao: string }>({ show: false, id: null, descricao: '' });
  const [gerarMesModal, setGerarMesModal] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        recorrentesData,
        vencimentosData,
        statsData,
        insightsData
      ] = await Promise.all([
        recorrentesService.listar(),
        recorrentesService.vencimentos(7),
        recorrentesService.estatisticas(),
        recorrentesService.insights()
      ]);

      setRecorrentes(recorrentesData);
      setVencimentos(vencimentosData);
      setStats(statsData);
      setInsights(insightsData);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.response?.data?.error || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const vencimentosPagos = vencimentos.filter(v => v.pago).length;
  const totalVencimentos = vencimentos.length;

  const handleEdit = (id: number) => {
    const recorrente = recorrentes.find(r => r.id === id);
    if (recorrente) {
      // Buscar se já existe uma transação gerada para esta recorrente no mês atual
      const vencimentoAtual = vencimentos.find(v => v.id === id);
      
      // Redirecionar para /despesas com os dados da despesa fixa
      navigate('/despesas', { 
        state: { 
          editRecorrente: {
            id: recorrente.id,
            descricao: recorrente.descricao,
            valor: recorrente.valor,
            categoria: recorrente.categoria,
            dia_vencimento: recorrente.dia_vencimento,
            tipo: recorrente.tipo,
            transacao_id: vencimentoAtual?.transacao_id || null
          }
        } 
      });
    }
  };

  const handleDelete = (id: number) => {
    const recorrente = recorrentes.find(r => r.id === id);
    if (recorrente) {
      setDeleteModal({ show: true, id, descricao: recorrente.descricao });
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;

    try {
      await recorrentesService.deletar(deleteModal.id);
      setDeleteModal({ show: false, id: null, descricao: '' });
      await carregarDados();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir');
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, id: null, descricao: '' });
  };

  const handleToggleAtiva = async (id: number, ativa: boolean) => {
    try {
      await recorrentesService.atualizar(id, { ativa });
      await carregarDados();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao atualizar');
    }
  };

  const handleGerarMes = () => {
    setGerarMesModal(true);
  };

  const confirmGerarMes = async () => {
    try {
      const result = await recorrentesService.gerarMes();
      alert(result.message);
      setGerarMesModal(false);
      await carregarDados();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao gerar transações');
    }
  };

  const cancelGerarMes = () => {
    setGerarMesModal(false);
  };

  const handleMarcarPago = async (transacaoId: number, pago: boolean) => {
    try {
      await recorrentesService.marcarComoPago(transacaoId, pago);
      await carregarDados(); // Recarregar dados para atualizar o status
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao marcar como pago');
    }
  };

  if (error) {
    return (
      <div className="dashboard-recorrentes">
        <div className="error-container">
          <h2>❌ Erro</h2>
          <p>{error}</p>
          <button onClick={carregarDados} className="btn-retry">
            Tentar Novamente
          </button>
        </div>
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
        <div className="dashboard-recorrentes">
          <div className="dashboard-header">
            <div className="header-content">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6 text-slate-600" />
                </button>
                <div>
                  <h1 className="flex items-center gap-2">
                    <Repeat className="w-8 h-8 text-blue-600" />
                    Dashboard de Despesas Fixas
                  </h1>
                  <p className="header-subtitle">Gerencie suas despesas e receitas recorrentes</p>
                </div>
              </div>
            </div>
            <div className="header-acoes">
              <button 
                onClick={handleGerarMes} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Gerar Transações do Mês</span>
              </button>
              <button 
                onClick={() => navigate('/despesas', { state: { openRecorrenteForm: true } })}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Nova Despesa Fixa</span>
              </button>
            </div>
          </div>

          {/* Cards de Resumo */}
          <CardsResumo 
            stats={stats} 
            loading={loading}
            vencimentosPagos={vencimentosPagos}
            totalVencimentos={totalVencimentos}
          />

          {/* Layout em Grid */}
          <div className="dashboard-grid">
            {/* Coluna Esquerda - Principal */}
            <div className="dashboard-main">
              {/* Próximos Vencimentos */}
              <ProximosVencimentos 
                vencimentos={vencimentos} 
                loading={loading}
                onMarcarPago={handleMarcarPago}
              />

              {/* Lista Completa */}
              <ListaRecorrentes 
                recorrentes={recorrentes}
                vencimentos={vencimentos}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleAtiva={handleToggleAtiva}
              />
            </div>

            {/* Coluna Direita - Análises */}
            <div className="dashboard-sidebar">
              {/* Gráfico de Distribuição */}
              <GraficoDistribuicao stats={stats} />

              {/* Insights */}
              <InsightsPanel insights={insights} loading={loading} />
            </div>
          </div>
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
                    Tem certeza que deseja excluir a despesa fixa <strong>"{deleteModal.descricao}"</strong>? Esta ação não pode ser desfeita.
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

      {/* Modal de Confirmação para Gerar Transações do Mês */}
      <AnimatePresence>
        {gerarMesModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={cancelGerarMes}
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
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Gerar Transações do Mês
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Deseja gerar todas as transações recorrentes ativas para o mês atual? Esta ação criará novas transações baseadas nas despesas fixas cadastradas.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={cancelGerarMes}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmGerarMes}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Gerar
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
};

export default DashboardRecorrentesPage;
