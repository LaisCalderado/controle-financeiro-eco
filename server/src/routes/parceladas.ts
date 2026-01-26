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

// Listar todas as transações parceladas do usuário com progresso
router.get('/', verifyToken, async (req: any, res) => {
    try {
        // Verificar se a coluna pago existe
        const checkPagoColumn = await pool.query(
            `SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'transacoes' 
            AND column_name = 'pago'`
        );

        const temColunaPago = checkPagoColumn.rows.length > 0;

        let query = '';
        if (temColunaPago) {
            query = `
                SELECT 
                    p.*,
                    COALESCE(COUNT(t.id) FILTER (WHERE t.pago = true), 0)::integer as parcelas_pagas
                FROM transacoes_parceladas p
                LEFT JOIN transacoes t ON 
                    t.usuario_id = p.usuario_id AND 
                    t.descricao LIKE p.descricao || '%' AND
                    t.tipo = p.tipo AND
                    t.categoria = p.categoria AND
                    t.valor = p.valor_parcela
                WHERE p.usuario_id = $1
                GROUP BY p.id
                ORDER BY p.data_primeira_parcela DESC
            `;
        } else {
            // Se não tem coluna pago, retorna sem o filtro
            query = `
                SELECT 
                    p.*,
                    COALESCE(COUNT(t.id), 0)::integer as parcelas_pagas
                FROM transacoes_parceladas p
                LEFT JOIN transacoes t ON 
                    t.usuario_id = p.usuario_id AND 
                    t.descricao LIKE p.descricao || '%' AND
                    t.tipo = p.tipo AND
                    t.categoria = p.categoria AND
                    t.valor = p.valor_parcela
                WHERE p.usuario_id = $1
                GROUP BY p.id
                ORDER BY p.data_primeira_parcela DESC
            `;
        }
        
        const result = await pool.query(query, [req.userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar transações parceladas:', error);
        res.status(500).json({ error: 'Erro ao buscar transações parceladas' });
    }
});

// Criar nova transação parcelada
router.post('/', verifyToken, async (req: any, res) => {
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
router.put('/:id', verifyToken, async (req: any, res) => {
    const { id } = req.params;
    const { descricao, valor_total, total_parcelas, categoria, data_primeira_parcela, ativa } = req.body;

    try {
        // Se recebeu apenas ativa, só atualiza o status
        if (ativa !== undefined && !descricao) {
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

            return res.json(result.rows[0]);
        }

        // Atualização completa dos dados
        const valor_parcela = (parseFloat(valor_total) / parseInt(total_parcelas)).toFixed(2);

        // Buscar a descrição antiga antes de atualizar
        const oldData = await pool.query(
            'SELECT descricao FROM transacoes_parceladas WHERE id = $1 AND usuario_id = $2',
            [id, req.userId]
        );

        if (oldData.rows.length === 0) {
            return res.status(404).json({ error: 'Transação parcelada não encontrada' });
        }

        const oldDescricao = oldData.rows[0].descricao;

        const query = `
            UPDATE transacoes_parceladas 
            SET descricao = $1, 
                valor_total = $2, 
                valor_parcela = $3, 
                categoria = $4,
                total_parcelas = $5,
                data_primeira_parcela = $6
            WHERE id = $7 AND usuario_id = $8
            RETURNING *
        `;

        const result = await pool.query(query, [
            descricao,
            valor_total,
            valor_parcela,
            categoria,
            total_parcelas,
            data_primeira_parcela,
            id,
            req.userId
        ]);

        // Atualizar as transações já criadas mantendo o número da parcela
        await pool.query(
            `UPDATE transacoes 
             SET descricao = REPLACE(descricao, $1, $2),
                 valor = $3,
                 categoria = $4
             WHERE usuario_id = $5 
             AND descricao LIKE $6
             AND tipo = $7`,
            [oldDescricao, descricao, valor_parcela, categoria, req.userId, `${oldDescricao}%`, 'despesa']
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao atualizar transação parcelada:', error);
        res.status(500).json({ error: 'Erro ao atualizar transação parcelada' });
    }
});

// Deletar transação parcelada
router.delete('/:id', verifyToken, async (req: any, res) => {
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
