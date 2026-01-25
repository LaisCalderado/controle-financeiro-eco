import React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import { Insight } from '../../services/recorrentes';

interface Props {
  insights: Insight[];
  loading: boolean;
}

const InsightsPanel: React.FC<Props> = ({ insights, loading }) => {
  if (loading) {
    return (
      <div className="insights-panel">
        <h2 className="flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          Insights & Recomendações
        </h2>
        <div className="insights-loading">Analisando seus dados...</div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="insights-panel">
        <h2 className="flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          Insights & Recomendações
        </h2>
        <div className="insights-vazio">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <p>Tudo sob controle! Continue assim.</p>
        </div>
      </div>
    );
  }

  const getInsightIcon = (tipo: string) => {
    switch (tipo) {
      case 'aumento':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'reducao':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'comprometimento':
        return <BarChart3 className="w-5 h-5 text-blue-500" />;
      default:
        return <Lightbulb className="w-5 h-5 text-yellow-500" />;
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
      <h2 className="flex items-center gap-2">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
        Insights & Recomendações
      </h2>
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
