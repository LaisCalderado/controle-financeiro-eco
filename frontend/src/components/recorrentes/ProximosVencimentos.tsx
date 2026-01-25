import React from 'react';
import { Vencimento } from '../../services/recorrentes';

interface Props {
  vencimentos: Vencimento[];
  loading: boolean;
}

const ProximosVencimentos: React.FC<Props> = ({ vencimentos, loading }) => {
  if (loading) {
    return (
      <div className="proximos-vencimentos">
        <h2>📅 Próximos Vencimentos</h2>
        <div className="vencimentos-loading">Carregando...</div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'hoje':
      case 'atrasado':
        return 'status-urgente';
      case 'urgente':
        return 'status-atencao';
      default:
        return 'status-normal';
    }
  };

  const getStatusText = (vencimento: Vencimento) => {
    if (vencimento.dias_restantes === 0) return 'HOJE';
    if (vencimento.dias_restantes === 1) return 'Amanhã';
    if (vencimento.dias_restantes < 0) return 'Atrasado';
    return `Em ${vencimento.dias_restantes} dias`;
  };

  const hoje = vencimentos.filter(v => v.status === 'hoje');
  const urgentes = vencimentos.filter(v => v.status === 'urgente');
  const proximos = vencimentos.filter(v => v.status === 'normal');

  return (
    <div className="proximos-vencimentos">
      <h2>📅 Próximos Vencimentos</h2>

      {vencimentos.length === 0 && (
        <div className="vencimentos-vazio">
          <p>✅ Nenhum vencimento nos próximos dias!</p>
        </div>
      )}

      {hoje.length > 0 && (
        <div className="vencimentos-secao">
          <h3 className="secao-titulo urgente">⚠️ HOJE</h3>
          {hoje.map(vencimento => (
            <div key={vencimento.id} className={`vencimento-item ${getStatusClass(vencimento.status)}`}>
              <div className="vencimento-info">
                <span className="vencimento-descricao">{vencimento.descricao}</span>
                <span className="vencimento-valor">{formatCurrency(vencimento.valor)}</span>
              </div>
              <div className="vencimento-status">
                <span className="status-badge">{getStatusText(vencimento)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {urgentes.length > 0 && (
        <div className="vencimentos-secao">
          <h3 className="secao-titulo atencao">Próximos 3 dias</h3>
          {urgentes.map(vencimento => (
            <div key={vencimento.id} className={`vencimento-item ${getStatusClass(vencimento.status)}`}>
              <div className="vencimento-info">
                <span className="vencimento-data">{formatDate(vencimento.data_vencimento)}</span>
                <span className="vencimento-descricao">{vencimento.descricao}</span>
                <span className="vencimento-valor">{formatCurrency(vencimento.valor)}</span>
              </div>
              <div className="vencimento-status">
                <span className="status-badge">{getStatusText(vencimento)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {proximos.length > 0 && (
        <div className="vencimentos-secao">
          <h3 className="secao-titulo normal">Próximos 7 dias</h3>
          {proximos.slice(0, 5).map(vencimento => (
            <div key={vencimento.id} className={`vencimento-item ${getStatusClass(vencimento.status)}`}>
              <div className="vencimento-info">
                <span className="vencimento-data">{formatDate(vencimento.data_vencimento)}</span>
                <span className="vencimento-descricao">{vencimento.descricao}</span>
                <span className="vencimento-valor">{formatCurrency(vencimento.valor)}</span>
              </div>
            </div>
          ))}
          {proximos.length > 5 && (
            <div className="ver-todos">
              + {proximos.length - 5} vencimentos adicionais
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProximosVencimentos;
