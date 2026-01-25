import React from 'react';
import { Insight } from '../../services/recorrentes';

interface Props {
  insights: Insight[];
  loading: boolean;
}

const InsightsPanel: React.FC<Props> = ({ insights, loading }) => {
  if (loading) {
    return (
      <div className="insights-panel">
        <h2>💡 Insights & Recomendações</h2>
        <div className="insights-loading">Analisando seus dados...</div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="insights-panel">
        <h2>💡 Insights & Recomendações</h2>
        <div className="insights-vazio">
          <p>✅ Tudo sob controle! Continue assim.</p>
        </div>
      </div>
    );
  }

  const getInsightIcon = (tipo: string) => {
    switch (tipo) {
      case 'aumento':
        return '⚠️';
      case 'reducao':
        return '✅';
      case 'comprometimento':
        return '📊';
      default:
        return '💡';
    }
  };

  const getInsightClass = (tipo: string) => {
    switch (tipo) {
      case 'aumento':
        return 'insight-alerta';
      case 'reducao':
        return 'insight-sucesso';
      case 'comprometimento':
        return 'insight-info';
      default:
        return 'insight-normal';
    }
  };

  return (
    <div className="insights-panel">
      <h2>💡 Insights & Recomendações</h2>
      <div className="insights-lista">
        {insights.map((insight, index) => (
          <div key={index} className={`insight-item ${getInsightClass(insight.tipo)}`}>
            <div className="insight-icon">{getInsightIcon(insight.tipo)}</div>
            <div className="insight-content">
              <p className="insight-mensagem">{insight.mensagem}</p>
              {insight.variacao && (
                <div className="insight-detalhes">
                  <span>De R$ {insight.valor_anterior?.toFixed(2)}</span>
                  <span className="seta">→</span>
                  <span>Para R$ {insight.valor_atual?.toFixed(2)}</span>
                  <span className={`variacao ${parseFloat(insight.variacao) > 0 ? 'positiva' : 'negativa'}`}>
                    ({insight.variacao}%)
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsPanel;
