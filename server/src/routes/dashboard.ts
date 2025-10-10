import express from 'express';
import { pool } from '../db';

const router = express.Router();

router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await pool.query(
            'SELECT * FROM transacoes WHERE usuario_id = $1 ORDER BY data DESC',
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error ao buscar transações ', error);
        res.status(500).json({ error: 'Erro ao buscar transções ' });
    }
});

export default router;