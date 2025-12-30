-- Criação das tabelas para produção

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transacoes (
    id SERIAL PRIMARY KEY,
    descricao TEXT,
    valor DECIMAL(10, 2) NOT NULL,
    data DATE NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
    tipo_servico VARCHAR(50) CHECK (tipo_servico IN ('selfservice', 'completo')),
    categoria VARCHAR(100),
    usuario_id INTEGER REFERENCES usuarios(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
