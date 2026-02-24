import React, { useEffect, useMemo, useState } from 'react';

interface FormValues {
  data: string;
  qtdLavagens: number;
  qtdSecagens: number;
  descricao: string;
}

interface SubmitPayload extends FormValues {
  valorTotal: number;
}

interface Props {
  title: string;
  initialValues: FormValues;
  isSaving: boolean;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (payload: SubmitPayload) => void;
}

const TAXA_SERVICO = 15.0;
const PRECO_LAVAGEM_UNITARIO = 16.99;
const PRECO_SECAGEM_UNITARIO = 16.99;

const ServicoCompletoForm: React.FC<Props> = ({
  title,
  initialValues,
  isSaving,
  submitLabel,
  onCancel,
  onSubmit
}) => {
  const [formData, setFormData] = useState<FormValues>(initialValues);

  useEffect(() => {
    setFormData(initialValues);
  }, [initialValues]);

  const valorBase = useMemo(() => {
    const totalLavagem = (Number(formData.qtdLavagens) || 0) * PRECO_LAVAGEM_UNITARIO;
    const totalSecagem = (Number(formData.qtdSecagens) || 0) * PRECO_SECAGEM_UNITARIO;
    return totalLavagem + totalSecagem;
  }, [formData.qtdLavagens, formData.qtdSecagens]);

  const valorTotal = useMemo(() => valorBase + TAXA_SERVICO, [valorBase]);

  const ajustarQuantidade = (tipo: 'lavagem' | 'secagem', incremento: number) => {
    setFormData((prev) => {
      if (tipo === 'lavagem') {
        return { ...prev, qtdLavagens: Math.max(0, prev.qtdLavagens + incremento) };
      }
      return { ...prev, qtdSecagens: Math.max(0, prev.qtdSecagens + incremento) };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if ((formData.qtdLavagens || 0) + (formData.qtdSecagens || 0) <= 0) {
      alert('Informe pelo menos uma lavagem ou secagem.');
      return;
    }

    onSubmit({
      ...formData,
      valorTotal
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data</label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Descricao</label>
            <input
              type="text"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Ex: 2 lavagens e 2 secagens - Cliente Joao"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Quantidade de Lavagens</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => ajustarQuantidade('lavagem', -1)}
                className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                -
              </button>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.qtdLavagens}
                onChange={(e) => setFormData({ ...formData, qtdLavagens: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => ajustarQuantidade('lavagem', 1)}
                className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Quantidade de Secagens</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => ajustarQuantidade('secagem', -1)}
                className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                -
              </button>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.qtdSecagens}
                onChange={(e) => setFormData({ ...formData, qtdSecagens: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => ajustarQuantidade('secagem', 1)}
                className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-slate-600 mb-1">
            Lavagens ({formData.qtdLavagens}x): R$ {(formData.qtdLavagens * PRECO_LAVAGEM_UNITARIO).toFixed(2)}
          </p>
          <p className="text-sm text-slate-600 mb-1">
            Secagens ({formData.qtdSecagens}x): R$ {(formData.qtdSecagens * PRECO_SECAGEM_UNITARIO).toFixed(2)}
          </p>
          <p className="text-sm text-slate-600 mb-1">Subtotal servicos: R$ {valorBase.toFixed(2)}</p>
          <p className="text-sm text-slate-600 mb-1">Taxa de Servico: + R$ {TAXA_SERVICO.toFixed(2)}</p>
          <p className="text-lg font-bold text-amber-700">Valor Total: R$ {valorTotal.toFixed(2)}</p>
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
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServicoCompletoForm;
