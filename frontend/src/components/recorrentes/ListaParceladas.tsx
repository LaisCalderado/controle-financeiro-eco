import React, { useState } from 'react';
import { Edit2, Trash2, CreditCard, Home, ShoppingCart, Car, Heart, BookOpen, Gamepad2, Lightbulb, Smartphone, Package } from 'lucide-react';

export interface TransacaoParcelada {
  id: number;
  descricao: string;
  valor_total: number;
  valor_parcela: number;
  tipo: 'despesa' | 'receita';
  categoria: string;
  total_parcelas: number;
  parcelas_pagas: number;
  data_primeira_parcela: string;
  ativa: boolean;
}

interface Props {
  parceladas: TransacaoParcelada[];
  loading: boolean;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

interface ParceladasAgrupadas {
  [categoria: string]: TransacaoParcelada[];
}

const ListaParceladas: React.FC<Props> = ({ parceladas, loading, onEdit, onDelete }) => {
  const [categoriaExpandida, setCategoriaExpandida] = useState<{ [key: string]: boolean }>({});
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');

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

  const agruparPorCategoria = (): ParceladasAgrupadas => {
    const agrupadas: ParceladasAgrupadas = {};
    
    let parceladasFiltradas = parceladas.filter(p => p.ativa);
    if (filtroCategoria !== 'todas') {
      parceladasFiltradas = parceladasFiltradas.filter(p => p.categoria === filtroCategoria);
    }

    parceladasFiltradas.forEach((parcelada) => {
      if (!agrupadas[parcelada.categoria]) {
        agrupadas[parcelada.categoria] = [];
      }
      agrupadas[parcelada.categoria].push(parcelada);
    });

    return agrupadas;
  };

  const agrupadas = agruparPorCategoria();
  const categorias = Object.keys(agrupadas).sort();
  const categoriasUnicas = Array.from(new Set(parceladas.map(p => p.categoria))).sort();

  const calcularProgresso = (parcelada: TransacaoParcelada) => {
    return (parcelada.parcelas_pagas / parcelada.total_parcelas) * 100;
  };

  if (loading) {
    return <div className="lista-recorrentes-loading">Carregando...</div>;
  }

  if (parceladas.filter(p => p.ativa).length === 0) {
    return (
      <div className="lista-recorrentes">
        <div className="lista-header">
          <h2 className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-600" />
            Despesas Parceladas
          </h2>
        </div>
        <div className="lista-vazia">
          <p>Nenhuma despesa parcelada ativa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lista-recorrentes">
      <div className="lista-header">
        <h2 className="flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-purple-600" />
          Despesas Parceladas
        </h2>
        <div className="lista-controles">
          {categoriasUnicas.length > 1 && (
            <select 
              value={filtroCategoria} 
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="filtro-select"
            >
              <option value="todas">Todas as categorias</option>
              {categoriasUnicas.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {categorias.map((categoria) => {
        const items = agrupadas[categoria];
        const totalCategoria = items.reduce((sum, item) => sum + item.valor_parcela, 0);
        const isExpanded = categoriaExpandida[categoria] !== false;

        return (
          <div key={categoria} className="categoria-grupo">
            <div 
              className="categoria-header" 
              onClick={() => toggleCategoria(categoria)}
            >
              <div className="categoria-info">
                <span className="categoria-icon">{getCategoriaIcon(categoria)}</span>
                <span className="categoria-nome">{categoria.toUpperCase()}</span>
                <span className="categoria-count">({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
              </div>
              <div className="categoria-total">
                <span>{formatCurrency(totalCategoria)}/mês</span>
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
              </div>
            </div>

            {isExpanded && (
              <div className="categoria-items">
                {items.map((parcelada) => {
                  const progresso = calcularProgresso(parcelada);
                  const parcelasRestantes = parcelada.total_parcelas - parcelada.parcelas_pagas;

                  return (
                    <div key={parcelada.id} className="recorrente-item">
                      <div className="recorrente-principal">
                        <div className="recorrente-info">
                          <h4>{parcelada.descricao}</h4>
                          <div className="recorrente-detalhes">
                            <span className="detalhe">
                              {parcelada.parcelas_pagas}/{parcelada.total_parcelas} pagas
                            </span>
                            <span className="detalhe-separador">|</span>
                            <span className="detalhe">{formatCurrency(parcelada.valor_parcela)}/mês</span>
                            <span className="detalhe-separador">|</span>
                            <span className="detalhe">Total: {formatCurrency(parcelada.valor_total)}</span>
                            <span className="detalhe-separador">|</span>
                            <span className="status-badge" style={{ background: '#9333ea' }}>
                              {progresso.toFixed(0)}% concluído
                            </span>
                          </div>
                          {/* Barra de progresso */}
                          <div style={{ marginTop: '0.75rem', width: '100%', background: '#e2e8f0', borderRadius: '9999px', height: '6px', overflow: 'hidden' }}>
                            <div
                              style={{ 
                                background: 'linear-gradient(to right, #a855f7, #9333ea)', 
                                height: '100%', 
                                transition: 'width 0.5s ease',
                                width: `${progresso}%` 
                              }}
                            />
                          </div>
                        </div>
                        <div className="recorrente-acoes">
                          <button 
                            className="btn-acao btn-editar"
                            onClick={() => onEdit(parcelada.id)}
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            className="btn-acao btn-deletar"
                            onClick={() => onDelete(parcelada.id)}
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

export default ListaParceladas;