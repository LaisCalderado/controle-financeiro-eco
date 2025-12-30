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
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// Buscar todas as transações do usuário
router.get('/transactions', verifyToken, async (req: any, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM transacoes WHERE usuario_id = $1 ORDER BY data DESC',
            [req.userId]
        );
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

    try {
        const query = `INSERT INTO transacoes (usuario_id, data, valor, tipo, tipo_servico, categoria, descricao) 
                       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;
        const values = [req.userId, data, valor, tipo, tipo_servico || null, categoria || null, descricao || null];
        
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Erro ao salvar transação", err);
        res.status(500).json({ error: "Erro ao salvar transação" });
    }
});

// Atualizar transação
router.put('/transactions/:id', verifyToken, async (req: any, res) => {
    const { id } = req.params;
    const { data, valor, tipo, categoria, descricao, tipo_servico } = req.body;

    try {
        const result = await pool.query(
            `UPDATE transacoes 
             SET data = $1, valor = $2, tipo = $3, tipo_servico = $4, categoria = $5, descricao = $6
             WHERE id = $7 AND usuario_id = $8
             RETURNING *`,
            [data, valor, tipo, tipo_servico || null, categoria, descricao, id, req.userId]
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


export default router;
