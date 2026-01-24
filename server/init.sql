-- Script de inicialização do banco de dados
-- Controle Financeiro ECO

-- Criação da tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de transações
CREATE TABLE IF NOT EXISTS transacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    tipo_servico VARCHAR(50) CHECK (tipo_servico IN ('selfservice', 'completo', NULL)),
    categoria VARCHAR(100),
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_transacoes_usuario ON transacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_data ON transacoes(data);
CREATE INDEX IF NOT EXISTS idx_transacoes_recorrentes_usuario ON transacoes_recorrentes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_transacoes_parceladas_usuario ON transacoes_parceladas(usuario_id);

-- Inserir usuário de teste (senha: 123456)
INSERT INTO usuarios (nome, email, senha) 
VALUES ('Usuário Teste', 'teste@exemplo.com', '$2b$10$YourHashedPasswordHere')
ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE usuarios IS 'Tabela de usuários do sistema';
COMMENT ON TABLE transacoes IS 'Tabela de transações financeiras';
COMMENT ON TABLE transacoes_recorrentes IS 'Tabela de despesas/receitas fixas recorrentes';
COMMENT ON TABLE transacoes_parceladas IS 'Tabela de transações parceladas';
