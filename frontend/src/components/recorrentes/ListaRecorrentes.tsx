import React, { useState } from 'react';
import { Edit2, Trash2, Play, Pause, List, Home, ShoppingCart, Car, Heart, BookOpen, Gamepad2, Lightbulb, Smartphone, Package } from 'lucide-react';
import { TransacaoRecorrente, Vencimento } from '../../services/recorrentes';

interface Props {
  recorrentes: TransacaoRecorrente[];
  vencimentos: Vencimento[];
  loading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleAtiva: (id: number, ativa: boolean) => void;
}

interface RecorrentesAgrupadas {
  [categoria: string]: TransacaoRecorrente[];
}

const ListaRecorrentes: React.FC<Props> = ({ recorrentes, vencimentos, loading, onEdit, onDelete, onToggleAtiva }) => {
  const [categoriaExpandida, setCategoriaExpandida] = useState<{ [key: string]: boolean }>({});
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [ordenacao, setOrdenacao] = useState<'vencimento' | 'valor' | 'nome'>('vencimento');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const toggleCategoria = (categoria: string) => {
    setCategoriaExpandida(prev => ({
      ...prev,
      [categoria]: !prev[categoria]
    }));
  };

  const getCategoriaIcon = (categoria: string) => {
    const icons: { [key: string]: React.ReactElement } = {
      'Moradia': <Home className="w-5 h-5" />,
      'Alimentação': <ShoppingCart className="w-5 h-5" />,
      'Transporte': <Car className="w-5 h-5" />,
      'Saúde': <Heart className="w-5 h-5" />,
      'Educação': <BookOpen className="w-5 h-5" />,
      'Lazer': <Gamepad2 className="w-5 h-5" />,
      'Utilidades': <Lightbulb className="w-5 h-5" />,
      'Assinaturas': <Smartphone className="w-5 h-5" />,
      'Outros': <Package className="w-5 h-5" />
    };
    return icons[categoria] || <Package className="w-5 h-5" />;
  };

  // Agrupar por categoria
  const agruparPorCategoria = (): RecorrentesAgrupadas => {
    const agrupadas: RecorrentesAgrupadas = {};
    
    let recorrentesFiltradas = recorrentes;
    if (filtroCategoria !== 'todas') {
      recorrentesFiltradas = recorrentes.filter(r => r.categoria === filtroCategoria);
    }

    // Ordenar
    const ordenadas = [...recorrentesFiltradas].sort((a, b) => {
      switch (ordenacao) {
        case 'vencimento':
          return a.dia_vencimento - b.dia_vencimento;
        case 'valor':
          return b.valor - a.valor;
        case 'nome':
          return a.descricao.localeCompare(b.descricao);
        default:
          return 0;
      }
    });

    ordenadas.forEach(rec => {
      const categoria = rec.categoria || 'Outros';
      if (!agrupadas[categoria]) {
        agrupadas[categoria] = [];
      }
      agrupadas[categoria].push(rec);
    });

    return agrupadas;
  };

  const calcularTotalCategoria = (items: TransacaoRecorrente[]) => {
    return items.reduce((sum, item) => {
      const valor = item.ativa ? Number(item.valor) || 0 : 0;
      return sum + valor;
    }, 0);
  };

  const verificarPaga = (recorrenteId: number) => {
    // Verifica se existe algum vencimento pago deste mês para esta recorrente
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    
    return vencimentos.some(v => {
      if (v.id !== recorrenteId || !v.pago) return false;
      
      const dataVencimento = new Date(v.data_vencimento + 'T00:00:00');
      return dataVencimento.getMonth() === mesAtual && dataVencimento.getFullYear() === anoAtual;
    });
  };

  const categorias = Array.from(new Set(recorrentes.map(r => r.categoria || 'Outros')));
  const agrupadas = agruparPorCategoria();

  if (loading) {
    return <div className="lista-recorrentes-loading">Carregando...</div>;
  }

  return (
    <div className="lista-recorrentes">
      <div className="lista-header">
        <h2 className="flex items-center gap-2">
          <List className="w-6 h-6 text-blue-600" />
          Todas as Despesas Fixas
        </h2>
        <div className="lista-controles">
          <select 
            value={filtroCategoria} 
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="filtro-select"
          >
            <option value="todas">Todas as categorias</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            value={ordenacao} 
            onChange={(e) => setOrdenacao(e.target.value as any)}
            className="ordenacao-select"
          >
            <option value="vencimento">Ordenar: Vencimento</option>
            <option value="valor">Ordenar: Valor</option>
            <option value="nome">Ordenar: Nome</option>
          </select>
        </div>
      </div>

      {recorrentes.length === 0 && (
        <div className="lista-vazia">
          <p>Nenhuma despesa fixa cadastrada.</p>
        </div>
      )}

      {Object.entries(agrupadas).map(([categoria, items]) => {
        const isExpandida = categoriaExpandida[categoria] !== false; // Expandido por padrão
        const total = calcularTotalCategoria(items);

        return (
          <div key={categoria} className="categoria-grupo">
            <div 
              className="categoria-header" 
              onClick={() => toggleCategoria(categoria)}
            >
              <div className="categoria-info">
                <span className="categoria-icon">{getCategoriaIcon(categoria)}</span>
                <span className="categoria-nome">{categoria.toUpperCase()}</span>
                <span className="categoria-count">({items.length} {items.length === 1 ? 'conta' : 'contas'})</span>
              </div>
              <div className="categoria-total">
                <span>{formatCurrency(total)}/mês</span>
                <span className={`expand-icon ${isExpandida ? 'expanded' : ''}`}>▼</span>
              </div>
            </div>

            {isExpandida && (
              <div className="categoria-items">
                {items.map(rec => {
                  const estaPaga = verificarPaga(rec.id);
                  
                  return (
                    <div key={rec.id} className={`recorrente-item ${!rec.ativa ? 'inativa' : ''}`}>
                      <div className="recorrente-principal">
                        <div className="recorrente-info">
                          <h4>{rec.descricao}</h4>
                          <div className="recorrente-detalhes">
                            <span className="detalhe">Dia {rec.dia_vencimento}</span>
                            <span className="detalhe-separador">|</span>
                            <span className="detalhe">{formatCurrency(rec.valor)}</span>
                            <span className="detalhe-separador">|</span>
                            <span className={`status-badge ${rec.ativa ? 'ativa' : 'inativa'}`}>
                              {rec.ativa ? '✅ Ativa' : '⏸️ Pausada'}
                            </span>
                            {estaPaga && (
                              <>
                                <span className="detalhe-separador">|</span>
                                <span className="status-badge badge-mes-pago">✓ Pago este mês</span>
                              </>
                            )}
                          </div>
                        </div>
                      <div className="recorrente-acoes">
                        <button 
                          className="btn-acao btn-editar"
                          onClick={() => onEdit(rec.id)}
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          className="btn-acao btn-toggle"
                          onClick={() => onToggleAtiva(rec.id, !rec.ativa)}
                          title={rec.ativa ? 'Pausar' : 'Ativar'}
                        >
                          {rec.ativa ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button 
                          className="btn-acao btn-deletar"
                          onClick={() => onDelete(rec.id)}
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-rose-500" />
                        </button>
                      </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ListaRecorrentes;
