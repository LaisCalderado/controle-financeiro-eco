-- Migration: Adicionar coluna pago na tabela transacoes
-- Data: 2026-01-25

-- Adicionar coluna pago (boolean) com valor padrão false
ALTER TABLE transacoes 
ADD COLUMN IF NOT EXISTS pago BOOLEAN DEFAULT false;

-- Criar índice para melhor performance em queries
CREATE INDEX IF NOT EXISTS idx_transacoes_pago ON transacoes(pago);

-- Comentário
COMMENT ON COLUMN transacoes.pago IS 'Indica se a transação já foi paga (true) ou está pendente (false)';
