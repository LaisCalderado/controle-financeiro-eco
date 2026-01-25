import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
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
  const [recorrentes, setRecorrentes] = useState<TransacaoRecorrente[]>([]);
  const [vencimentos, setVencimentos] = useState<Vencimento[]>([]);
  const [stats, setStats] = useState<Estatisticas | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const handleEdit = (id: number) => {
    // TODO: Implementar modal de edição
    console.log('Editar:', id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa fixa?')) {
      return;
    }

    try {
      await recorrentesService.deletar(id);
      await carregarDados();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao excluir');
    }
  };

  const handleToggleAtiva = async (id: number, ativa: boolean) => {
    try {
      await recorrentesService.atualizar(id, { ativa });
      await carregarDados();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao atualizar');
    }
  };

  const handleGerarMes = async () => {
    if (!window.confirm('Deseja gerar as transações recorrentes deste mês?')) {
      return;
    }

    try {
      const result = await recorrentesService.gerarMes();
      alert(result.message);
      await carregarDados();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erro ao gerar transações');
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
                  <h1>💰 Dashboard de Despesas Fixas</h1>
                  <p className="header-subtitle">Gerencie suas despesas e receitas recorrentes</p>
                </div>
              </div>
            </div>
            <div className="header-acoes">
              <button onClick={handleGerarMes} className="btn-gerar-mes">
                🔄 Gerar Transações do Mês
              </button>
              <button className="btn-adicionar">
                ➕ Nova Despesa Fixa
              </button>
            </div>
          </div>

          {/* Cards de Resumo */}
          <CardsResumo stats={stats} loading={loading} />

          {/* Layout em Grid */}
          <div className="dashboard-grid">
            {/* Coluna Esquerda - Principal */}
            <div className="dashboard-main">
              {/* Próximos Vencimentos */}
              <ProximosVencimentos vencimentos={vencimentos} loading={loading} />

              {/* Lista Completa */}
              <ListaRecorrentes 
                recorrentes={recorrentes}
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
    </div>
  );
};

export default DashboardRecorrentesPage;
