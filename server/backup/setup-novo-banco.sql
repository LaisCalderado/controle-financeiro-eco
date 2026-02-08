-- ====================================================================
-- SCRIPT DE SETUP COMPLETO - NOVO BANCO RENDER
-- Controle Financeiro ECO
-- Data: 2026-02-08
-- ====================================================================
-- Execute este script no novo banco de dados para criar todas as tabelas
-- ====================================================================

-- 1. TABELA DE USUÁRIOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE TRANSAÇÕES
-- ====================================================================
CREATE TABLE IF NOT EXISTS transacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    tipo_servico VARCHAR(50) CHECK (tipo_servico IN ('selfservice', 'completo', NULL)),
    categoria VARCHAR(100),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    pago BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABELA DE TRANSAÇÕES RECORRENTES (DESPESAS FIXAS)
-- ====================================================================
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

-- 4. TABELA DE TRANSAÇÕES PARCELADAS
-- ====================================================================
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

-- 5. ÍNDICES PARA PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_transacoes_usuario ON transacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data);
CREATE INDEX IF NOT EXISTS idx_transacoes_pago ON transacoes(pago);
CREATE INDEX IF NOT EXISTS idx_transacoes_recorrentes_usuario ON transacoes_recorrentes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_parceladas_usuario ON transacoes_parceladas(usuario_id);

-- 6. COMENTÁRIOS
-- ====================================================================
COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema';
COMMENT ON TABLE transacoes IS 'Tabela de transações financeiras';
COMMENT ON TABLE transacoes_recorrentes IS 'Tabela de despesas/receitas fixas recorrentes';
COMMENT ON TABLE transacoes_parceladas IS 'Tabela de transações parceladas';
COMMENT ON COLUMN transacoes.pago IS 'Indica se a transação já foi paga (true) ou está pendente (false)';

-- ====================================================================
-- SETUP CONCLUÍDO!
-- ====================================================================
-- Próximos passos:
-- 1. Criar seu primeiro usuário através do endpoint de registro
-- 2. Atualizar a variável DATABASE_URL no serviço web do Render
-- ====================================================================
