import React, { useState } from 'react';
import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, Trash2, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categoriaStyles: Record<string, { label: string; color: string }> = {
  lavagem: { label: 'Lavagem', color: 'bg-blue-100 text-blue-700' },
  passadoria: { label: 'Passadoria', color: 'bg-purple-100 text-purple-700' },
  agua: { label: 'Água', color: 'bg-cyan-100 text-cyan-700' },
  energia: { label: 'Energia', color: 'bg-yellow-100 text-yellow-700' },
  produtos: { label: 'Produtos', color: 'bg-green-100 text-green-700' },
  aluguel: { label: 'Aluguel', color: 'bg-orange-100 text-orange-700' },
  funcionarios: { label: 'Funcionários', color: 'bg-indigo-100 text-indigo-700' },
  manutencao: { label: 'Manutenção', color: 'bg-slate-100 text-slate-700' },
  outros: { label: 'Outros', color: 'bg-gray-100 text-gray-700' }
};

interface Transacao {
  id: number;
  tipo: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  numero?: number;
}

interface TransacaoListProps {
  transacoes: Transacao[];
  tipo: 'receita' | 'despesa';
  onEdit: (transacao: Transacao) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export default function TransacaoList({ transacoes, tipo, onEdit, onDelete, isLoading }: TransacaoListProps) {
  // Adicionar numeração automática por categoria e mês
  const transacoesComNumero = React.useMemo(() => {
    const contadores: Record<string, number> = {}; // chave: "categoria-mes-ano"
    
    // Ordenar por data crescente para numeração sequencial correta
    const transacoesOrdenadas = [...transacoes].sort((a, b) => 
      new Date(a.data).getTime() - new Date(b.data).getTime()
    );
    
    const resultado = transacoesOrdenadas.map((transacao) => {
      const data = parseISO(transacao.data);
      const mesAno = format(data, 'MM-yyyy');
      const chave = `${transacao.categoria}-${mesAno}`;
      
      if (!contadores[chave]) {
        contadores[chave] = 0;
      }
      contadores[chave]++;
      
      return {
        ...transacao,
        numero: contadores[chave]
      };
    });
    
    // Reverter ordem para exibir mais recentes primeiro (Hoje, Ontem, ...)
    return resultado.reverse();
  }, [transacoes]);

  const formatarData = (dataString: string) => {
    const data = parseISO(dataString);
    
    if (isToday(data)) {
      return 'Hoje';
    }
    
    if (isYesterday(data)) {
      return 'Ontem';
    }
    
    // Formato: "Sexta, 03 Jan"
    return format(data, "EEEE, dd MMM", { locale: ptBR });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-slate-100 rounded-xl h-20" />
        ))}
      </div>
    );
  }

  if (!transacoes || transacoes.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
        <div className="text-slate-400 mb-2">
          {tipo === 'receita' ? <TrendingUp className="w-12 h-12 mx-auto" /> : <TrendingDown className="w-12 h-12 mx-auto" />}
        </div>
        <p className="text-slate-500">Nenhuma {tipo} registrada</p>
        <p className="text-sm text-slate-400 mt-1">Clique no botão acima para adicionar</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <AnimatePresence>
          {transacoesComNumero.map((transacao, index) => (
            <motion.div
              key={transacao.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${tipo === 'receita' ? 'bg-emerald-100' : 'bg-rose-100'} flex-shrink-0`}>
                    {tipo === 'receita' ? (
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base text-slate-900 mb-1">
                      {transacao.descricao} <span className="text-slate-500">#{transacao.numero}</span>
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatarData(transacao.data)}</span>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                        categoriaStyles[transacao.categoria]?.color || 'bg-gray-100 text-gray-700'
                      }`}>
                        {categoriaStyles[transacao.categoria]?.label || transacao.categoria}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-lg font-bold ${tipo === 'receita' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tipo === 'receita' ? '+' : '-'} R$ {Number(transacao.valor).toFixed(2)}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(transacao)}
                      className="h-8 w-8 flex items-center justify-center hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-slate-500" />
                    </button>
                    <button
                      onClick={() => onDelete(transacao.id)}
                      className="h-8 w-8 flex items-center justify-center hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
