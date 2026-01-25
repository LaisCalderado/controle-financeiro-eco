import React from 'react';
import { Vencimento } from '../../services/recorrentes';

interface Props {
  vencimentos: Vencimento[];
  loading: boolean;
  onMarcarPago?: (transacaoId: number, pago: boolean) => void;
}

const ProximosVencimentos: React.FC<Props> = ({ vencimentos, loading, onMarcarPago }) => {
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

  // Filtrar apenas vencimentos não pagos
  const vencimentosPendentes = vencimentos.filter(v => !v.pago);

  const hoje = vencimentosPendentes.filter(v => v.status === 'hoje');
  const urgentes = vencimentosPendentes.filter(v => v.status === 'urgente');
  const proximos = vencimentosPendentes.filter(v => v.status === 'normal');

  const handleCheckboxChange = (vencimento: Vencimento) => {
    console.log('Checkbox clicado:', vencimento);
    console.log('transacao_id:', vencimento.transacao_id);
    console.log('pago atual:', vencimento.pago);
    console.log('onMarcarPago existe?', !!onMarcarPago);
    
    if (vencimento.transacao_id && onMarcarPago) {
      onMarcarPago(vencimento.transacao_id, !vencimento.pago);
    } else {
      console.log('Não executou onMarcarPago. transacao_id:', vencimento.transacao_id, 'onMarcarPago:', !!onMarcarPago);
    }
  };

  const renderVencimento = (vencimento: Vencimento, mostrarData: boolean = true) => {
    const isPago = vencimento.pago;
    const temTransacao = !!vencimento.transacao_id;

    return (
      <div key={vencimento.id} className={`vencimento-item ${getStatusClass(vencimento.status)} ${isPago ? 'status-pago' : ''}`}>
        {temTransacao ? (
          <input
            type="checkbox"
            checked={isPago}
            onChange={() => handleCheckboxChange(vencimento)}
            className="checkbox-pago"
            title={isPago ? 'Marcar como não pago' : 'Marcar como pago'}
          />
        ) : (
          <div className="checkbox-placeholder" />
        )}
        <div className="vencimento-content">
          <div className="vencimento-info">
            {mostrarData && <span className="vencimento-data">{formatDate(vencimento.data_vencimento)}</span>}
            <span className={`vencimento-descricao ${isPago ? 'text-pago' : ''}`}>{vencimento.descricao}</span>
            <span className={`vencimento-valor ${isPago ? 'text-pago' : ''}`}>{formatCurrency(vencimento.valor)}</span>
          </div>
          <div className="vencimento-status">
            {isPago ? (
              <span className="status-badge badge-pago">✓ Pago</span>
            ) : (
              <span className="status-badge badge-pendente">{getStatusText(vencimento)}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="proximos-vencimentos">
      <h2>📅 Próximos Vencimentos</h2>

      {vencimentosPendentes.length === 0 && (
        <div className="vencimentos-vazio">
          <p>✅ Nenhum vencimento pendente nos próximos dias!</p>
        </div>
      )}

      {hoje.length > 0 && (
        <div className="vencimentos-secao">
          <h3 className="secao-titulo urgente">⚠️ HOJE</h3>
          {hoje.map(vencimento => renderVencimento(vencimento, false))}
        </div>
      )}

      {urgentes.length > 0 && (
        <div className="vencimentos-secao">
          <h3 className="secao-titulo atencao">Próximos 3 dias</h3>
          {urgentes.map(vencimento => renderVencimento(vencimento, true))}
        </div>
      )}

      {proximos.length > 0 && (
        <div className="vencimentos-secao">
          <h3 className="secao-titulo normal">Próximos 7 dias</h3>
          {proximos.slice(0, 5).map(vencimento => renderVencimento(vencimento, true))}
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
