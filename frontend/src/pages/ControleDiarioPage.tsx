
import React, { useState } from 'react';
import RegisterTransactionForm from '../components/forms/RegisterTransactionForm';

interface RegistroDiario {
  id: number;
  date: string;
  tipo: string;
  valor: number;
  descricao: string;
  serviceType?: string;
}

const ControleDiarioPage: React.FC = () => {
  const [registros, setRegistros] = useState<RegistroDiario[]>([]);
  const userId = 1; // Substitua pelo id real do usuário autenticado

  const handleAddRegistro = (registro: RegistroDiario) => {
    setRegistros(prev => [registro, ...prev]);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📅 Controle Diário</h1>
      </div>
      <RegisterTransactionForm userId={userId} onAddTransaction={handleAddRegistro} />
      <div className="controle-diario-registros">
        <h3>Registros do dia</h3>
        <div className="controle-diario-tabela-wrapper">
          <table className="controle-diario-tabela">
            <thead>
              <tr style={{background: '#f3f6fa'}}>
                <th style={{padding: '10px 8px', borderRadius: '8px 0 0 8px'}}>Data</th>
                <th style={{padding: '10px 8px'}}>Tipo</th>
                <th style={{padding: '10px 8px'}}>Valor</th>
                <th style={{padding: '10px 8px'}}>Descrição</th>
                <th style={{padding: '10px 8px', borderRadius: '0 8px 8px 0'}}>Serviço</th>
              </tr>
            </thead>
            <tbody>
              {registros.length === 0 && (
                <tr>
                  <td colSpan={5} className="controle-diario-vazio">Nenhum registro hoje.</td>
                </tr>
              )}
              {registros.map(r => (
                <tr key={r.id} className="controle-diario-linha">
                  <td className="controle-diario-data">{r.date}</td>
                  <td>{r.tipo}</td>
                  <td className={r.tipo === 'despesa' ? 'controle-diario-despesa' : 'controle-diario-receita'}>
                    R$ {r.valor.toFixed(2)}
                  </td>
                  <td>{r.descricao}</td>
                  <td>{r.serviceType || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ControleDiarioPage;
