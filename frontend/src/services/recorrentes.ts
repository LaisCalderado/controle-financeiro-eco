import { api } from './api';

export interface TransacaoRecorrente {
  id: number;
  usuario_id: number;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  dia_vencimento: number;
  ativa: boolean;
  proxima_geracao: string;
  created_at: string;
}

export interface Vencimento extends TransacaoRecorrente {
  data_vencimento: string;
  dias_restantes: number;
  status: 'hoje' | 'atrasado' | 'urgente' | 'normal';
  transacao_id?: number;
  pago?: boolean;
}

export interface Estatisticas {
  total_recorrentes: number;
  ativas: number;
  inativas: number;
  total_despesas: number;
  total_receitas: number;
  total_mensal: number;
  por_categoria: {
    categoria: string;
    quantidade: number;
    total: number;
  }[];
}

export interface ComparacaoMensal {
  mes: string;
  categorias: {
    categoria: string;
    total: number;
  }[];
  total: number;
}

export interface Insight {
  tipo: 'aumento' | 'reducao' | 'comprometimento';
  descricao?: string;
  valor_atual?: number;
  valor_anterior?: number;
  variacao?: string;
  valor?: number;
  mensagem: string;
}

const recorrentesService = {
  // Listar todas as transações recorrentes
  listar: async (): Promise<TransacaoRecorrente[]> => {
    const response = await api.get('/api/recorrentes');
    return response.data;
  },

  // Criar nova transação recorrente
  criar: async (dados: Omit<TransacaoRecorrente, 'id' | 'usuario_id' | 'created_at' | 'proxima_geracao'>): Promise<TransacaoRecorrente> => {
    const response = await api.post('/api/recorrentes', dados);
    return response.data;
  },

  // Atualizar transação recorrente
  atualizar: async (id: number, dados: Partial<TransacaoRecorrente>): Promise<TransacaoRecorrente> => {
    const response = await api.put(`/api/recorrentes/${id}`, dados);
    return response.data;
  },

  // Deletar transação recorrente
  deletar: async (id: number): Promise<void> => {
    await api.delete(`/api/recorrentes/${id}`);
  },

  // Gerar transações do mês
  gerarMes: async (): Promise<any> => {
    const response = await api.post('/api/recorrentes/gerar-mes');
    return response.data;
  },

  // Buscar próximos vencimentos
  vencimentos: async (dias: number = 7): Promise<Vencimento[]> => {
    const response = await api.get(`/api/recorrentes/vencimentos?dias=${dias}`);
    return response.data;
  },

  // Buscar estatísticas
  estatisticas: async (): Promise<Estatisticas> => {
    const response = await api.get('/api/recorrentes/stats');
    return response.data;
  },

  // Buscar comparação mensal
  comparacao: async (meses: number = 6): Promise<ComparacaoMensal[]> => {
    const response = await api.get(`/api/recorrentes/comparacao?meses=${meses}`);
    return response.data;
  },

  // Buscar insights
  insights: async (): Promise<Insight[]> => {
    const response = await api.get('/api/recorrentes/insights');
    return response.data;
  },

  // Marcar transação como paga
  marcarComoPago: async (transacaoId: number, pago: boolean): Promise<any> => {
    const response = await api.put(`/api/transactions/${transacaoId}/marcar-pago`, { pago });
    return response.data;
  },

  adiantarPagamento: async (recorrenteId: number): Promise<any> => {
    const response = await api.post(`/api/recorrentes/${recorrenteId}/adiantar-pagamento`);
    return response.data;
  }
};

export default recorrentesService;
