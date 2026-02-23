import { Router } from "express";
import { pool } from "../db";
import jwt from "jsonwebtoken";

const router = Router();

// Middleware para verificar o token JWT
const verifyToken = async (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'chave_secreta') as any;
        const userId = decoded.id;

        const userResult = await pool.query('SELECT id FROM usuarios WHERE id = $1', [userId]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
        }

        req.userId = userId;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// Buscar todas as transações do usuário
router.get('/transactions', verifyToken, async (req: any, res) => {
    try {
                const checkPagoColumn = await pool.query(
                        `SELECT column_name 
                         FROM information_schema.columns 
                         WHERE table_name = 'transacoes' 
                         AND column_name = 'pago'`
                );

                const temColunaPago = checkPagoColumn.rows.length > 0;

                const query = temColunaPago
                        ? `
                                SELECT t.*
                                FROM transacoes t
                                WHERE t.usuario_id = $1
                                    AND (
                                        t.tipo <> 'despesa'
                                        OR t.pago = true
                                        OR NOT EXISTS (
                                            SELECT 1
                                            FROM transacoes_recorrentes tr
                                            WHERE tr.usuario_id = t.usuario_id
                                                AND tr.tipo = 'despesa'
                                                AND LOWER(TRIM(tr.descricao)) = LOWER(TRIM(t.descricao))
                                        )
                                    )
                                ORDER BY t.data DESC
                            `
                        : 'SELECT * FROM transacoes WHERE usuario_id = $1 ORDER BY data DESC';

                const result = await pool.query(query, [req.userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({ error: 'Erro ao buscar transações' });
    }
});

// Registrar nova transação
router.post('/transactions', verifyToken, async (req: any, res) => {
    console.log('REQ.BODY:', req.body);
    const { data, valor, tipo, categoria, descricao, tipo_servico } = req.body;

    // Campos obrigatórios
    if (!data || valor == null || valor === "" || !tipo) {
        return res.status(400).json({ error: "Campos obrigatórios ausentes (data, valor, tipo)" });
    }

    const valorNumerico = Number(valor);
    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
        return res.status(400).json({ error: 'Valor inválido. Informe um número maior que zero.' });
    }

    try {
        // Garante que a data seja tratada como data local sem conversão de timezone
        const dataLocal = data.includes('T') ? data.split('T')[0] : data;
        
        const query = `INSERT INTO transacoes (usuario_id, data, valor, tipo, tipo_servico, categoria, descricao) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;
        const values = [req.userId, dataLocal, valorNumerico, tipo, tipo_servico || null, categoria || null, descricao || null];
        
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err: any) {
        console.error("Erro ao salvar transação", err);

        if (err.code === '23503') {
            return res.status(401).json({ error: 'Sessão inválida. Faça login novamente.' });
        }

        if (err.code === '23514' || err.code === '22P02') {
            return res.status(400).json({ error: 'Dados inválidos para salvar a transação.' });
        }

        res.status(500).json({ error: "Erro ao salvar transação" });
    }
});

// Rota temporária para limpar todas as transações (USAR COM CUIDADO!)
// DEVE vir ANTES da rota /:id para não ser interpretada como um ID
router.delete('/transactions/clear-all', verifyToken, async (req: any, res) => {
    try {
        await pool.query('DELETE FROM transacoes');
        await pool.query('ALTER SEQUENCE transacoes_id_seq RESTART WITH 1');
        res.json({ message: 'Todas as transações foram excluídas' });
    } catch (error) {
        console.error('Erro ao limpar transações:', error);
        res.status(500).json({ error: 'Erro ao limpar transações' });
    }
});

// Atualizar transação
router.put('/transactions/:id', verifyToken, async (req: any, res) => {
    const { id } = req.params;
    const { data, valor, tipo, categoria, descricao, tipo_servico } = req.body;

    try {
        // Garante que a data seja tratada como data local sem conversão de timezone
        const dataLocal = data.includes('T') ? data.split('T')[0] : data;
        
        const result = await pool.query(
            `UPDATE transacoes 
             SET data = $1, valor = $2, tipo = $3, tipo_servico = $4, categoria = $5, descricao = $6
             WHERE id = $7 AND usuario_id = $8
             RETURNING *`,
            [dataLocal, valor, tipo, tipo_servico || null, categoria, descricao, id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar transação:', error);
        res.status(500).json({ error: 'Erro ao atualizar transação' });
    }
});

// Deletar transação
router.delete('/transactions/:id', verifyToken, async (req: any, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM transacoes WHERE id = $1 AND usuario_id = $2 RETURNING id',
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        res.json({ message: 'Transação excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir transação:', error);
        res.status(500).json({ error: 'Erro ao excluir transação' });
    }
});

// Marcar transação como paga/não paga
router.put('/transactions/:id/marcar-pago', verifyToken, async (req: any, res) => {
    const { id } = req.params;
    const { pago } = req.body;

    if (typeof pago !== 'boolean') {
        return res.status(400).json({ error: 'Campo pago deve ser boolean' });
    }

    try {
        // Verificar se a coluna pago existe
        const checkPagoColumn = await pool.query(
            `SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'transacoes' 
            AND column_name = 'pago'`
        );

        if (checkPagoColumn.rows.length === 0) {
            return res.status(400).json({ 
                error: 'Coluna pago não existe. Execute a migration add_pago_column.sql primeiro.' 
            });
        }

        const result = await pool.query(
            'UPDATE transacoes SET pago = $1 WHERE id = $2 AND usuario_id = $3 RETURNING *',
            [pago, id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transação não encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao marcar transação como paga:', error);
        res.status(500).json({ error: 'Erro ao marcar transação como paga' });
    }
});

export default router;
