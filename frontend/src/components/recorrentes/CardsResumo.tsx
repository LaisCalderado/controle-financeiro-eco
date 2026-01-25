import React from 'react';
import { Wallet, TrendingUp, PiggyBank, CheckCircle } from 'lucide-react';
import { Estatisticas } from '../../services/recorrentes';

interface Props {
  stats: Estatisticas | null;
  loading: boolean;
  vencimentosPagos?: number;
  totalVencimentos?: number;
}

const CardsResumo: React.FC<Props> = ({ stats, loading, vencimentosPagos = 0, totalVencimentos = 0 }) => {
  if (loading) {
    return (
      <div className="cards-resumo">
        <div className="card-resumo skeleton">
          <div className="skeleton-text"></div>
        </div>
        <div className="card-resumo skeleton">
          <div className="skeleton-text"></div>
        </div>
        <div className="card-resumo skeleton">
          <div className="skeleton-text"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const percentualPago = totalVencimentos > 0 
    ? Math.round((vencimentosPagos / totalVencimentos) * 100) 
    : 0;

  return (
    <div className="cards-resumo">
      <div className="card-resumo card-total">
        <div className="card-icon">
          <Wallet className="w-8 h-8 text-blue-600" />
        </div>
        <div className="card-content">
          <h3>Total Mensal</h3>
          <p className="card-value">{formatCurrency(stats.total_despesas)}</p>
          <small className="card-subtitle">
            {stats.ativas} despesas ativas
          </small>
        </div>
      </div>

      <div className="card-resumo card-receitas">
        <div className="card-icon">
          <TrendingUp className="w-8 h-8 text-green-600" />
        </div>
        <div className="card-content">
          <h3>Receitas Fixas</h3>
          <p className="card-value">{formatCurrency(stats.total_receitas)}</p>
          <small className="card-subtitle">Entrada garantida</small>
        </div>
      </div>

      <div className="card-resumo card-saldo">
        <div className="card-icon">
          <PiggyBank className="w-8 h-8 text-purple-600" />
        </div>
        <div className="card-content">
          <h3>Saldo Mensal</h3>
          <p className={`card-value ${stats.total_receitas - stats.total_despesas >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(stats.total_receitas - stats.total_despesas)}
          </p>
          <small className="card-subtitle">
            {stats.total_receitas - stats.total_despesas >= 0 ? 'Superávit' : 'Déficit'}
          </small>
        </div>
      </div>

      <div className="card-resumo card-pagamentos">
        <div className="card-icon">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="card-content">
          <h3>Pagamentos no Prazo</h3>
          <p className="card-value card-value-percentual">{percentualPago}%</p>
          <small className="card-subtitle">
            {vencimentosPagos} de {totalVencimentos} contas pagas
          </small>
        </div>
      </div>
    </div>
  );
};

export default CardsResumo;
