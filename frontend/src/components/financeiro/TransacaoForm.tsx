import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

const categoriasReceita = [
  { value: 'lavagem', label: 'Lavagem' },
  { value: 'secagem', label: 'Secagem' },
  { value: 'passadoria', label: 'Passadoria' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'tingimento', label: 'Tingimento' },
  { value: 'outros', label: 'Outros' }
];

const categoriasDespesa = [
  { value: 'agua', label: 'Água' },
  { value: 'energia', label: 'Energia' },
  { value: 'produtos', label: 'Produtos' },
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'funcionarios', label: 'Funcionários' },
  { value: 'manutencao', label: 'Manutenção' },
  { value: 'outros', label: 'Outros' }
];

interface TransacaoFormProps {
  tipo: 'receita' | 'despesa';
  transacao?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TransacaoForm({ tipo, transacao, onSubmit, onCancel, isLoading }: TransacaoFormProps) {
  const [formData, setFormData] = useState({
    data: transacao?.data ? transacao.data.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
    valor: transacao?.valor || '',
    descricao: transacao?.descricao || '',
    categoria: transacao?.categoria || ''
  });

  const categorias = tipo === 'receita' ? categoriasReceita : categoriasDespesa;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      valor: parseFloat(formData.valor.toString())
    });
  };

  return (
    <motion.form
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onSubmit={handleSubmit}
      className="space-y-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-lg"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-900">
          {transacao ? 'Editar' : 'Nova'} {tipo === 'receita' ? 'Receita' : 'Despesa'}
        </h3>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="data" className="block text-sm font-medium text-slate-700">
            Data
          </label>
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="valor" className="block text-sm font-medium text-slate-700">
            Valor (R$)
          </label>
          <input
            id="valor"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={formData.valor}
            onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
            required
            className="w-full px-4 py-2 text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="categoria" className="block text-sm font-medium text-slate-700">
          Categoria
        </label>
        <select
          id="categoria"
          value={formData.categoria}
          onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
          required
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="descricao" className="block text-sm font-medium text-slate-700">
          Descrição
        </label>
        <textarea
          id="descricao"
          placeholder="Descreva a transação..."
          value={formData.descricao}
          onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
          required
          rows={3}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
            tipo === 'receita' 
              ? 'bg-emerald-600 hover:bg-emerald-700' 
              : 'bg-rose-600 hover:bg-rose-700'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Save className="w-4 h-4" />
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </motion.form>
  );
}
