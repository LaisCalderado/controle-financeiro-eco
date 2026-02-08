-- Migration: Adicionar tabelas de transações recorrentes e parceladas
-- Data: 2026-01-24

-- Criação da tabela de transações recorrentes (despesas fixas)
CREATE TABLE IF NOT EXISTS transacoes_recorrentes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    categoria VARCHAR(100),
    dia_vencimento INTEGER NOT NULL CHECK (dia_vencimento BETWEEN 1 AND 31),
    ativa BOOLEAN DEFAULT true,
    proxima_geracao DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de transações parceladas
CREATE TABLE IF NOT EXISTS transacoes_parceladas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    valor_total DECIMAL(10, 2) NOT NULL,
    valor_parcela DECIMAL(10, 2) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    categoria VARCHAR(100),
    parcela_atual INTEGER NOT NULL DEFAULT 1,
    total_parcelas INTEGER NOT NULL,
    data_primeira_parcela DATE NOT NULL,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_transacoes_recorrentes_usuario ON transacoes_recorrentes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_parceladas_usuario ON transacoes_parceladas(usuario_id);

-- Comentários
COMMENT ON TABLE transacoes_recorrentes IS 'Tabela de despesas/receitas fixas recorrentes';
COMMENT ON TABLE transacoes_parceladas IS 'Tabela de transações parceladas';
