import React, { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Save, X, Repeat, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const categoriasReceita = [
  { value: 'lavagem', label: 'Lavagem' },
  { value: 'secagem', label: 'Secagem' },
  { value: 'passadoria', label: 'Passadoria' },
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
  onSubmitRecorrente?: (data: any) => void;
  onSubmitParcelada?: (data: any) => void;
  initialTipoTransacao?: 'normal' | 'recorrente' | 'parcelada';
}

export default function TransacaoForm({ tipo, transacao, onSubmit, onCancel, isLoading, onSubmitRecorrente, onSubmitParcelada, initialTipoTransacao = 'normal' }: TransacaoFormProps) {
  const [tipoTransacao, setTipoTransacao] = useState<'normal' | 'recorrente' | 'parcelada'>(initialTipoTransacao);
  const [formData, setFormData] = useState({
    data: transacao?.data ? transacao.data.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
    valor: transacao?.valor || '',
    descricao: transacao?.descricao || '',
    categoria: transacao?.categoria || '',
    dia_vencimento: 1,
    total_parcelas: 2
  });

  const categorias = tipo === 'receita' ? categoriasReceita : categoriasDespesa;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const baseData = {
      descricao: formData.descricao,
      valor: parseFloat(formData.valor.toString()),
      tipo,
      categoria: formData.categoria
    };

    if (tipoTransacao === 'recorrente' && onSubmitRecorrente) {
      onSubmitRecorrente({
        ...baseData,
        dia_vencimento: formData.dia_vencimento
      });
    } else if (tipoTransacao === 'parcelada' && onSubmitParcelada) {
      onSubmitParcelada({
        ...baseData,
        valor_total: baseData.valor,
        total_parcelas: formData.total_parcelas,
        data_primeira_parcela: formData.data
      });
    } else {
      onSubmit({
        ...formData,
        valor: parseFloat(formData.valor.toString())
      });
    }
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

      {/* Seletor de tipo de transação */}
      {!transacao && (
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setTipoTransacao('normal')}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              tipoTransacao === 'normal'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Normal
          </button>
          {onSubmitRecorrente && (
            <button
              type="button"
              onClick={() => setTipoTransacao('recorrente')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                tipoTransacao === 'recorrente'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Repeat className="w-4 h-4" />
              Fixa
            </button>
          )}
          {onSubmitParcelada && (
            <button
              type="button"
              onClick={() => setTipoTransacao('parcelada')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                tipoTransacao === 'parcelada'
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Parcelada
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tipoTransacao === 'recorrente' ? (
          <div className="space-y-2">
            <label htmlFor="dia_vencimento" className="block text-sm font-medium text-slate-700">
              Dia do Vencimento
            </label>
            <input
              id="dia_vencimento"
              type="number"
              min="1"
              max="31"
              value={formData.dia_vencimento}
              onChange={(e) => setFormData({ ...formData, dia_vencimento: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-slate-500">Dia do mês em que a despesa se repete</p>
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor="data" className="block text-sm font-medium text-slate-700">
              Data {tipoTransacao === 'parcelada' ? '(1ª Parcela)' : ''}
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
        )}

        <div className="space-y-2">
          <label htmlFor="valor" className="block text-sm font-medium text-slate-700">
            Valor {tipoTransacao === 'parcelada' ? 'Total' : ''} (R$)
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
          {tipoTransacao === 'parcelada' && formData.valor && (
            <p className="text-xs text-slate-500">
              {formData.total_parcelas}x de R$ {(parseFloat(formData.valor) / formData.total_parcelas).toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {tipoTransacao === 'parcelada' && (
        <div className="space-y-2">
          <label htmlFor="total_parcelas" className="block text-sm font-medium text-slate-700">
            Número de Parcelas
          </label>
          <input
            id="total_parcelas"
            type="number"
            min="2"
            max="48"
            value={formData.total_parcelas}
            onChange={(e) => setFormData({ ...formData, total_parcelas: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="categoria" className="block text-sm font-medium text-slate-700">
          Categoria
        </label>
        <select
          id="categoria"
          value={formData.categoria}
          onChange={(e) => {
            const categoria = e.target.value;
            const novoFormData: any = { ...formData, categoria };
            
            // Se for receita e categoria for lavagem ou secagem, preenche valor com 16.99
            if (tipo === 'receita' && (categoria === 'lavagem' || categoria === 'secagem')) {
              novoFormData.valor = '16.99';
            }
            
            setFormData(novoFormData);
          }}
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
