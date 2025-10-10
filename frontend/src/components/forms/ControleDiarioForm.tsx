import React, { useState } from 'react';

interface RegistroDiario {
  id: number;
  data: string;
  tipoServico: string;
  tipoOperacao: string;
  valor: number;
  formaPagamento: string;
}

const ControleDiarioForm: React.FC<{ onAdd: (registro: RegistroDiario) => void }> = ({ onAdd }) => {
  const [data, setData] = useState('');
  const [tipoServico, setTipoServico] = useState('Self-service');
  const [tipoOperacao, setTipoOperacao] = useState('Lavagem');
  const [valor, setValor] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('Pix');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !valor) return;
    onAdd({
      id: Date.now(),
      data,
      tipoServico,
      tipoOperacao,
      valor: parseFloat(valor),
      formaPagamento,
    });
    setValor('');
  };

  return (
    <form className="form-box" onSubmit={handleSubmit} style={{marginBottom: 32}}>
      <input type="date" value={data} onChange={e => setData(e.target.value)} required />
      <select value={tipoServico} onChange={e => setTipoServico(e.target.value)}>
        <option value="Self-service">Self-service</option>
        <option value="Lavamos pra você">Lavamos pra você</option>
      </select>
      <select value={tipoOperacao} onChange={e => setTipoOperacao(e.target.value)}>
        <option value="Lavagem">Lavagem</option>
        <option value="Secagem">Secagem</option>
      </select>
      <input type="number" placeholder="Valor cobrado" value={valor} onChange={e => setValor(e.target.value)} min="0" step="0.01" required />
      <select value={formaPagamento} onChange={e => setFormaPagamento(e.target.value)}>
        <option value="Pix">Pix</option>
        <option value="Débito">Débito</option>
        <option value="Crédito">Crédito</option>
      </select>
      <button type="submit">Registrar Serviço</button>
    </form>
  );
};

