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

// Listar todas as transações parceladas do usuário
router.get('/parceladas', verifyToken, async (req: any, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM transacoes_parceladas WHERE usuario_id = $1 ORDER BY data_primeira_parcela DESC',
            [req.userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar transações parceladas:', error);
        res.status(500).json({ error: 'Erro ao buscar transações parceladas' });
    }
});

// Criar nova transação parcelada
router.post('/parceladas', verifyToken, async (req: any, res) => {
    const { descricao, valor_total, total_parcelas, tipo, categoria, data_primeira_parcela } = req.body;

    if (!descricao || !valor_total || !total_parcelas || !tipo || !data_primeira_parcela) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    if (total_parcelas < 2) {
        return res.status(400).json({ error: 'Número de parcelas deve ser no mínimo 2' });
    }

    try {
        const valor_parcela = (parseFloat(valor_total) / parseInt(total_parcelas)).toFixed(2);

        const query = `
            INSERT INTO transacoes_parceladas 
            (usuario_id, descricao, valor_total, valor_parcela, tipo, categoria, total_parcelas, data_primeira_parcela) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING *
        `;

        const result = await pool.query(query, [
            req.userId,
            descricao,
            valor_total,
            valor_parcela,
            tipo,
            categoria,
            total_parcelas,
            data_primeira_parcela
        ]);

        // Gerar todas as parcelas imediatamente
        const parcelada = result.rows[0];
        const transacoesCriadas = [];
        
        for (let i = 0; i < total_parcelas; i++) {
            // Garantir que a data seja tratada corretamente sem timezone
            const dataBase = data_primeira_parcela.includes('T') ? data_primeira_parcela.split('T')[0] : data_primeira_parcela;
            const [ano, mes, dia] = dataBase.split('-').map(Number);
            const dataParcela = new Date(ano, mes - 1 + i, dia);
            const dataFormatada = `${dataParcela.getFullYear()}-${String(dataParcela.getMonth() + 1).padStart(2, '0')}-${String(dataParcela.getDate()).padStart(2, '0')}`;

            const transacao = await pool.query(
                `INSERT INTO transacoes 
                 (usuario_id, descricao, valor, tipo, categoria, data) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING *`,
                [
                    req.userId,
                    `${descricao} (${i + 1}/${total_parcelas})`,
                    valor_parcela,
                    tipo,
                    categoria,
                    dataFormatada
                ]
            );

            transacoesCriadas.push(transacao.rows[0]);
        }

        res.status(201).json({
            parcelada: parcelada,
            transacoes: transacoesCriadas
        });
    } catch (error) {
        console.error('Erro ao criar transação parcelada:', error);
        res.status(500).json({ error: 'Erro ao criar transação parcelada' });
    }
});

// Atualizar transação parcelada
router.put('/parceladas/:id', verifyToken, async (req: any, res) => {
    const { id } = req.params;
    const { ativa } = req.body;

    try {
        const query = `
            UPDATE transacoes_parceladas 
            SET ativa = $1
            WHERE id = $2 AND usuario_id = $3
            RETURNING *
        `;

        const result = await pool.query(query, [ativa, id, req.userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transação parcelada não encontrada' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar transação parcelada:', error);
        res.status(500).json({ error: 'Erro ao atualizar transação parcelada' });
    }
});

// Deletar transação parcelada
router.delete('/parceladas/:id', verifyToken, async (req: any, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM transacoes_parceladas WHERE id = $1 AND usuario_id = $2 RETURNING *',
            [id, req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Transação parcelada não encontrada' });
        }

        res.json({ message: 'Transação parcelada excluída com sucesso' });
    } catch (error) {
        console.error('Erro ao excluir transação parcelada:', error);
        res.status(500).json({ error: 'Erro ao excluir transação parcelada' });
    }
});

export default router;
