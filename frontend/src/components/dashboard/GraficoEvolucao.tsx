import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, eachDayOfInterval, eachMonthOfInterval, isSameDay, isSameMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transacao {
  data: string;
  valor: number;
}

interface GraficoEvolucaoProps {
  receitas: Transacao[];
  despesas: Transacao[];
  dataInicio: Date;
  dataFim: Date;
  agrupamento?: 'dia' | 'mes';
}

export default function GraficoEvolucao({ receitas, despesas, dataInicio, dataFim, agrupamento = 'dia' }: GraficoEvolucaoProps) {
  const gerarDados = () => {
    let periodos: Date[];
    let formatLabel: (date: Date) => string;
    let compareFn: (dateLeft: Date, dateRight: Date) => boolean;

    if (agrupamento === 'mes') {
      periodos = eachMonthOfInterval({ start: dataInicio, end: dataFim });
      compareFn = isSameMonth;
      formatLabel = (date: Date) => format(date, 'MMM/yy', { locale: ptBR });
    } else {
      periodos = eachDayOfInterval({ start: dataInicio, end: dataFim });
      compareFn = isSameDay;
      formatLabel = (date: Date) => format(date, 'dd/MM', { locale: ptBR });
    }

    return periodos.map((periodo) => {
      const receitasDoPeriodo = receitas.filter((r) => {
        const dataReceita = parseISO(r.data);
        return compareFn(dataReceita, periodo);
      });

      const despesasDoPeriodo = despesas.filter((d) => {
        const dataDespesa = parseISO(d.data);
        return compareFn(dataDespesa, periodo);
      });

      const totalReceitas = receitasDoPeriodo.reduce((sum, r) => sum + (r.valor || 0), 0);
      const totalDespesas = despesasDoPeriodo.reduce((sum, d) => sum + (d.valor || 0), 0);

      return {
        periodo: formatLabel(periodo),
        receitas: parseFloat(totalReceitas.toFixed(2)),
        despesas: parseFloat(totalDespesas.toFixed(2)),
        saldo: parseFloat((totalReceitas - totalDespesas).toFixed(2))
      };
    });
  };

  const dados = gerarDados();

  if (dados.length === 0 || (receitas.length === 0 && despesas.length === 0)) {
    return (
      <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Evolução Financeira</h3>
        <div className="flex items-center justify-center h-64">
          <p className="text-slate-400">Sem dados para exibir</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Evolução Financeira</h3>
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dados} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="periodo"
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tickFormatter={(value) => `R$${value}`}
            />
            <Tooltip
              formatter={(value, name) => {
                const numValue = typeof value === 'number' ? value : parseFloat(value as string);
                const label = name === 'receitas' ? 'Receitas' : name === 'despesas' ? 'Despesas' : 'Saldo';
                return [`R$ ${numValue.toFixed(2)}`, label];
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="receitas"
              name="Receitas"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorReceitas)"
            />
            <Area
              type="monotone"
              dataKey="despesas"
              name="Despesas"
              stroke="#f43f5e"
              strokeWidth={2}
              fill="url(#colorDespesas)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}