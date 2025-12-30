import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const categoriaStyles: Record<string, { label: string; color: string }> = {
  lavagem: { label: 'Lavagem', color: 'bg-blue-100 text-blue-700' },
  passadoria: { label: 'Passadoria', color: 'bg-purple-100 text-purple-700' },
  delivery: { label: 'Delivery', color: 'bg-green-100 text-green-700' },
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
}

interface TransacaoListProps {
  transacoes: Transacao[];
  tipo: 'receita' | 'despesa';
  onEdit: (transacao: Transacao) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export default function TransacaoList({ transacoes, tipo, onEdit, onDelete, isLoading }: TransacaoListProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);

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

  const handleDeleteClick = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <AnimatePresence>
          {transacoes.map((transacao, index) => (
            <motion.div
              key={transacao.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`p-2 rounded-lg ${tipo === 'receita' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    {tipo === 'receita' ? (
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-rose-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{transacao.descricao}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-sm text-slate-500">
                        {format(parseISO(transacao.data), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        categoriasLabels[transacao.categoria]?.color || 'bg-gray-100 text-gray-700'
                      }`}>
                        {categoriasLabels[transacao.categoria]?.label || transacao.categoria}
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
                      onClick={() => handleDeleteClick(transacao.id)}
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

      {/* Modal de confirmação de exclusão */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Confirmar exclusão</h3>
            <p className="text-slate-600 mb-6">
              Tem certeza que deseja excluir esta {tipo}? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                Excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
