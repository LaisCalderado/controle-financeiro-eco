-- Migração: Adicionar campo tipo_servico à tabela transacoes
-- Data: 2025-12-30

-- Adicionar coluna tipo_servico (pode ser NULL para transações antigas e despesas)
ALTER TABLE transacoes 
ADD COLUMN IF NOT EXISTS tipo_servico VARCHAR(50) 
CHECK (tipo_servico IN ('selfservice', 'completo', NULL));

-- Adicionar comentário explicativo
COMMENT ON COLUMN transacoes.tipo_servico IS 'Tipo de serviço: selfservice (cliente faz) ou completo (funcionário faz com taxa de +R$15)';

-- Verificar a estrutura atualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'transacoes';
