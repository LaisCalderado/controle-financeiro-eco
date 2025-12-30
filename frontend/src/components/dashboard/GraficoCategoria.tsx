import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#22c55e', '#f97316', '#6366f1', '#64748b'];

const categoriasLabels: Record<string, string> = {
  lavagem: 'Lavagem',
  passadoria: 'Passadoria',
  delivery: 'Delivery',
  agua: 'Água',
  energia: 'Energia',
  produtos: 'Produtos',
  aluguel: 'Aluguel',
  funcionarios: 'Funcionários',
  manutencao: 'Manutenção',
  outros: 'Outros'
};

interface Transacao {
  categoria?: string;
  valor: number;
}

interface GraficoCategoriaProps {
  dados: Transacao[];
  tipo: string;
  titulo: string;
}

export default function GraficoCategoria({ dados, tipo, titulo }: GraficoCategoriaProps) {
  const dadosAgrupados = dados.reduce((acc: Record<string, number>, item) => {
    const categoria = item.categoria || 'outros';
    if (!acc[categoria]) {
      acc[categoria] = 0;
    }
    acc[categoria] += item.valor || 0;
    return acc;
  }, {});

  const chartData = Object.entries(dadosAgrupados).map(([name, value]) => ({
    name: categoriasLabels[name] || name,
    value: parseFloat(value.toFixed(2))
  })).sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{titulo}</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400">Sem dados para exibir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{titulo}</h3>
      <div>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => percent ? `${name} ${(percent * 100).toFixed(0)}%` : name}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => {
                const numValue = typeof value === 'number' ? value : parseFloat(value as string);
                return [`R$ ${numValue.toFixed(2)}`, 'Valor'];
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center mt-2">
          <p className="text-sm text-slate-500">Total</p>
          <p className={`text-xl font-bold ${tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
            R$ {total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}