import { Router } from "express";
import { pool } from "../db";
import jwt from "jsonwebtoken";

const router = Router();

// Middleware para verificar o token JWT
const verifyToken = (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave_secreta') as any;
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// Listar todas as transações recorrentes do usuário
router.get('/recorrentes', verifyToken, async (req: any, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM transacoes_recorrentes WHERE usuario_id = $1 ORDER BY dia_vencimento ASC',
            [req.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar transações recorrentes:', error);
        res.status(500).json({ error: 'Erro ao buscar transações recorrentes' });
    }
});

// Criar nova transação recorrente
router.post('/recorrentes', verifyToken, async (req: any, res) => {
    const { descricao, valor, tipo, categoria, dia_vencimento } = req.body;

    if (!descricao || !valor || !tipo || !dia_vencimento) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    if (dia_vencimento < 1 || dia_vencimento > 31) {
        return res.status(400).json({ error: 'Dia de vencimento deve estar entre 1 e 31' });
    }

    try {
        // Calcular próxima geração
        const hoje = new Date();
        let proximaGeracao = new Date(hoje.getFullYear(), hoje.getMonth(), dia_vencimento);
        
        // Se o dia já passou neste mês, agendar para o próximo mês
        if (proximaGeracao < hoje) {
            proximaGeracao = new Date(hoje.getFullYear(), hoje.getMonth() + 1, dia_vencimento);
        }

        const query = `
            INSERT INTO transacoes_recorrentes 
            (usuario_id, descricao, valor, tipo, categoria, dia_vencimento, proxima_geracao) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING *
        `;

        const result = await pool.query(query, [
            req.userId,
            descricao,
            valor,
            tipo,
            categoria,
            dia_vencimento,
            proximaGeracao
        ]);

        // Gerar a primeira transação automaticamente para o mês atual
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        const dataTransacao = new Date(anoAtual, mesAtual, dia_vencimento);

        // Só cria se a data não for no futuro
        if (dataTransacao <= hoje) {
            await pool.query(
                `INSERT INTO transacoes 
                 (usuario_id, descricao, valor, tipo, categoria, data) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [req.userId, descricao, valor, tipo, categoria, dataTransacao]
            );
        }

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar transação recorrente:', error);
        res.status(500).json({ error: 'Erro ao criar transação recorrente' });
    }
});

// Atualizar transação recorrente
router.put('/recorrentes/:id', verifyToken, async (req: any, res) => {
    const { id } = req.params;
    const { descricao, valor, tipo, categoria, dia_vencimento, ativa } = req.body;

    try {
        const query = `
            UPDATE transacoes_recorrentes 
            SET descricao = $1, valor = $2, tipo = $3, categoria = $4, 
                dia_vencimento = $5, ativa = $6
            WHERE id = $7 AND usuario_id = $8
            RETURNING *
        `;

        const result = await pool.query(query, [
            descricao,
            valor,
            tipo,
            categoria,
            dia_vencimento,
            ativa,
            id,
            req.userId
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transação recorrente não encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar transação recorrente:', error);
        res.status(500).json({ error: 'Erro ao atualizar transação recorrente' });
    }
});

// Deletar transação recorrente
router.delete('/recorrentes/:id', verifyToken, async (req: any, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM transacoes_recorrentes WHERE id = $1 AND usuario_id = $2 RETURNING *',
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transação recorrente não encontrada' });
        }

        res.json({ message: 'Transação recorrente excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir transação recorrente:', error);
        res.status(500).json({ error: 'Erro ao excluir transação recorrente' });
    }
});

// Gerar transações do mês baseadas nas recorrentes
router.post('/recorrentes/gerar-mes', verifyToken, async (req: any, res) => {
    try {
        // Buscar todas as transações recorrentes ativas do usuário
        const recorrentes = await pool.query(
            'SELECT * FROM transacoes_recorrentes WHERE usuario_id = $1 AND ativa = true',
            [req.userId]
        );

        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        const transacoesCriadas = [];

        for (const recorrente of recorrentes.rows) {
            // Verificar se já existe uma transação para este mês
            const dataTransacao = new Date(anoAtual, mesAtual, recorrente.dia_vencimento);
            
            const jaExiste = await pool.query(
                `SELECT id FROM transacoes 
                 WHERE usuario_id = $1 
                 AND descricao = $2 
                 AND EXTRACT(MONTH FROM data) = $3 
                 AND EXTRACT(YEAR FROM data) = $4`,
                [req.userId, recorrente.descricao, mesAtual + 1, anoAtual]
            );

            if (jaExiste.rows.length === 0) {
                // Criar a transação
                const novaTransacao = await pool.query(
                    `INSERT INTO transacoes 
                     (usuario_id, descricao, valor, tipo, categoria, data) 
                     VALUES ($1, $2, $3, $4, $5, $6) 
                     RETURNING *`,
                    [
                        req.userId,
                        recorrente.descricao,
                        recorrente.valor,
                        recorrente.tipo,
                        recorrente.categoria,
                        dataTransacao
                    ]
                );

                transacoesCriadas.push(novaTransacao.rows[0]);
            }
        }

        res.json({
            message: `${transacoesCriadas.length} transações criadas com sucesso`,
            transacoes: transacoesCriadas
        });
    } catch (error) {
        console.error('Erro ao gerar transações do mês:', error);
        res.status(500).json({ error: 'Erro ao gerar transações do mês' });
    }
});

export default router;
