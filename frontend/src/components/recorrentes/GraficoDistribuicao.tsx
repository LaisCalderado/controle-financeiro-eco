import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Estatisticas } from '../../services/recorrentes';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  stats: Estatisticas | null;
}

const GraficoDistribuicao: React.FC<Props> = ({ stats }) => {
  if (!stats || stats.por_categoria.length === 0) {
    return (
      <div className="grafico-container">
        <h3>📊 Distribuição por Categoria</h3>
        <p className="grafico-vazio">Nenhum dado disponível</p>
      </div>
    );
  }

  const cores = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#C9CBCF'
  ];

  const data = {
    labels: stats.por_categoria.map(c => c.categoria || 'Outros'),
    datasets: [
      {
        data: stats.por_categoria.map(c => c.total),
        backgroundColor: cores,
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const formatted = new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(value);
            return `${label}: ${formatted}`;
          }
        }
      }
    },
  };

  return (
    <div className="grafico-container">
      <h3>📊 Distribuição por Categoria</h3>
      <div className="grafico-pie">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default GraficoDistribuicao;
