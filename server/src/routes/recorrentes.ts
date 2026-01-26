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
router.get('/', verifyToken, async (req: any, res) => {
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
router.post('/', verifyToken, async (req: any, res) => {
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
            // Formatar data como YYYY-MM-DD para evitar problemas de timezone
            const dataFormatada = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia_vencimento).padStart(2, '0')}`;
            await pool.query(
                `INSERT INTO transacoes 
                 (usuario_id, descricao, valor, tipo, categoria, data) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [req.userId, descricao, valor, tipo, categoria, dataFormatada]
            );
        }

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Erro ao criar transação recorrente:', error);
        res.status(500).json({ error: 'Erro ao criar transação recorrente' });
    }
});

// Atualizar transação recorrente
router.put('/:id', verifyToken, async (req: any, res) => {
    const { id } = req.params;
    const { descricao, valor, tipo, categoria, dia_vencimento, ativa } = req.body;

    try {
        // Se apenas 'ativa' foi enviada, fazer atualização parcial
        if (ativa !== undefined && !descricao && !valor && !tipo && !categoria && !dia_vencimento) {
            const query = `
                UPDATE transacoes_recorrentes 
                SET ativa = $1
                WHERE id = $2 AND usuario_id = $3
                RETURNING *
            `;

            const result = await pool.query(query, [ativa, id, req.userId]);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Transação recorrente não encontrada' });
            }

            return res.json(result.rows[0]);
        }

        // Atualização completa
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
router.delete('/:id', verifyToken, async (req: any, res) => {
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
router.post('/gerar-mes', verifyToken, async (req: any, res) => {
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

// Buscar próximos vencimentos
router.get('/vencimentos', verifyToken, async (req: any, res) => {
    try {
        const dias = parseInt(req.query.dias as string) || 7;
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zerar as horas para comparar apenas a data
        const diaAtual = hoje.getDate();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        // Verificar se a coluna pago existe
        const checkPagoColumn = await pool.query(
            `SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'transacoes' 
            AND column_name = 'pago'`
        );

        const temColunaPago = checkPagoColumn.rows.length > 0;

        const recorrentes = await pool.query(
            'SELECT * FROM transacoes_recorrentes WHERE usuario_id = $1 AND ativa = true ORDER BY dia_vencimento ASC',
            [req.userId]
        );

        const vencimentos = await Promise.all(recorrentes.rows.map(async (rec: any) => {
            let dataVencimento = new Date(anoAtual, mesAtual, rec.dia_vencimento);
            dataVencimento.setHours(0, 0, 0, 0); // Zerar as horas
            
            // Se já passou, considerar próximo mês
            if (dataVencimento < hoje) {
                dataVencimento = new Date(anoAtual, mesAtual + 1, rec.dia_vencimento);
                dataVencimento.setHours(0, 0, 0, 0);
            }

            const diffTime = dataVencimento.getTime() - hoje.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // Buscar se existe uma transação para este mês e se foi paga
            const mesFormatado = dataVencimento.toISOString().slice(0, 7);
            let transacaoQuery = '';
            if (temColunaPago) {
                transacaoQuery = `SELECT id, pago FROM transacoes 
                    WHERE usuario_id = $1 
                    AND descricao = $2 
                    AND TO_CHAR(data, 'YYYY-MM') = $3
                    LIMIT 1`;
            } else {
                transacaoQuery = `SELECT id FROM transacoes 
                    WHERE usuario_id = $1 
                    AND descricao = $2 
                    AND TO_CHAR(data, 'YYYY-MM') = $3
                    LIMIT 1`;
            }

            const transacao = await pool.query(
                transacaoQuery,
                [req.userId, rec.descricao, mesFormatado]
            );

            return {
                ...rec,
                data_vencimento: dataVencimento.toISOString().split('T')[0],
                dias_restantes: diffDays,
                status: diffDays === 0 ? 'hoje' : diffDays < 0 ? 'atrasado' : diffDays <= 3 ? 'urgente' : 'normal',
                transacao_id: transacao.rows[0]?.id || null,
                pago: transacao.rows[0]?.pago || false
            };
        }));

        // Filtrar apenas os que vencem nos próximos X dias
        const vencimentosFiltrados = vencimentos.filter((v: any) => 
            v.dias_restantes >= 0 && v.dias_restantes <= dias
        );

        res.json(vencimentosFiltrados);
    } catch (error) {
        console.error('Erro ao buscar vencimentos:', error);
        res.status(500).json({ error: 'Erro ao buscar vencimentos' });
    }
});

// Estatísticas gerais
router.get('/stats', verifyToken, async (req: any, res) => {
    try {
        // Buscar transações deste mês para calcular totais reais
        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        const primeiroDiaMes = new Date(anoAtual, mesAtual, 1);
        const ultimoDiaMes = new Date(anoAtual, mesAtual + 1, 0);

        // Verificar se a coluna pago existe
        const checkPagoColumn = await pool.query(
            `SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'transacoes' 
            AND column_name = 'pago'`
        );

        const temColunaPago = checkPagoColumn.rows.length > 0;

        // Buscar transações do mês (com ou sem filtro de pago)
        let transacoesPagasQuery = '';
        if (temColunaPago) {
            transacoesPagasQuery = `
                SELECT 
                    SUM(CASE WHEN tipo = 'despesa' AND pago = true THEN valor ELSE 0 END) as total_despesas_pagas,
                    SUM(CASE WHEN tipo = 'receita' AND pago = true THEN valor ELSE 0 END) as total_receitas_pagas
                FROM transacoes 
                WHERE usuario_id = $1 
                AND data >= $2 
                AND data <= $3
            `;
        } else {
            // Se não tem coluna pago, considera todas as transações
            transacoesPagasQuery = `
                SELECT 
                    SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as total_despesas_pagas,
                    SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as total_receitas_pagas
                FROM transacoes 
                WHERE usuario_id = $1 
                AND data >= $2 
                AND data <= $3
            `;
        }

        const transacoesPagas = await pool.query(
            transacoesPagasQuery,
            [req.userId, primeiroDiaMes.toISOString().split('T')[0], ultimoDiaMes.toISOString().split('T')[0]]
        );

        const result = await pool.query(
            `SELECT 
                COUNT(*) as total_recorrentes,
                COUNT(CASE WHEN ativa = true THEN 1 END) as ativas,
                COUNT(CASE WHEN ativa = false THEN 1 END) as inativas
            FROM transacoes_recorrentes 
            WHERE usuario_id = $1`,
            [req.userId]
        );

        const stats = {
            ...result.rows[0],
            total_despesas: parseFloat(transacoesPagas.rows[0].total_despesas_pagas) || 0,
            total_receitas: parseFloat(transacoesPagas.rows[0].total_receitas_pagas) || 0,
            total_mensal: (parseFloat(transacoesPagas.rows[0].total_receitas_pagas) || 0) - (parseFloat(transacoesPagas.rows[0].total_despesas_pagas) || 0)
        };

        // Buscar estatísticas por categoria
        let categoriasQuery = '';
        if (temColunaPago) {
            categoriasQuery = `
                SELECT 
                    categoria,
                    COUNT(*) as quantidade,
                    SUM(valor) as total
                FROM transacoes 
                WHERE usuario_id = $1 
                AND tipo = 'despesa' 
                AND pago = true
                AND data >= $2 
                AND data <= $3
                GROUP BY categoria
                ORDER BY total DESC
            `;
        } else {
            categoriasQuery = `
                SELECT 
                    categoria,
                    COUNT(*) as quantidade,
                    SUM(valor) as total
                FROM transacoes 
                WHERE usuario_id = $1 
                AND tipo = 'despesa' 
                AND data >= $2 
                AND data <= $3
                GROUP BY categoria
                ORDER BY total DESC
            `;
        }

        const categorias = await pool.query(
            categoriasQuery,
            [req.userId, primeiroDiaMes.toISOString().split('T')[0], ultimoDiaMes.toISOString().split('T')[0]]
        );

        res.json({
            ...stats,
            por_categoria: categorias.rows
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
});

// Comparação mensal
router.get('/comparacao', verifyToken, async (req: any, res) => {
    try {
        const meses = parseInt(req.query.meses as string) || 6;
        const hoje = new Date();
        
        const comparacao = [];
        for (let i = meses - 1; i >= 0; i--) {
            const mes = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
            const mesFormatado = mes.toISOString().slice(0, 7);
            
            // Buscar transações recorrentes que foram geradas naquele mês
            const resultado = await pool.query(
                `SELECT 
                    categoria,
                    SUM(valor) as total
                FROM transacoes 
                WHERE usuario_id = $1 
                AND TO_CHAR(data, 'YYYY-MM') = $2
                AND descricao IN (SELECT descricao FROM transacoes_recorrentes WHERE usuario_id = $1)
                GROUP BY categoria`,
                [req.userId, mesFormatado]
            );

            const totalMes = await pool.query(
                `SELECT SUM(valor) as total
                FROM transacoes 
                WHERE usuario_id = $1 
                AND TO_CHAR(data, 'YYYY-MM') = $2
                AND descricao IN (SELECT descricao FROM transacoes_recorrentes WHERE usuario_id = $1)`,
                [req.userId, mesFormatado]
            );

            comparacao.push({
                mes: mesFormatado,
                categorias: resultado.rows,
                total: totalMes.rows[0]?.total || 0
            });
        }

        res.json(comparacao);
    } catch (error) {
        console.error('Erro ao buscar comparação:', error);
        res.status(500).json({ error: 'Erro ao buscar comparação' });
    }
});

// Insights automáticos
router.get('/insights', verifyToken, async (req: any, res) => {
    try {
        const insights = [];
        const hoje = new Date();
        const mesAtual = hoje.toISOString().slice(0, 7);
        const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1).toISOString().slice(0, 7);

        // Comparar valores do mês atual vs anterior
        const recorrentes = await pool.query(
            'SELECT * FROM transacoes_recorrentes WHERE usuario_id = $1 AND ativa = true',
            [req.userId]
        );

        for (const rec of recorrentes.rows) {
            const valorAtual = await pool.query(
                `SELECT valor FROM transacoes 
                WHERE usuario_id = $1 
                AND descricao = $2 
                AND TO_CHAR(data, 'YYYY-MM') = $3
                LIMIT 1`,
                [req.userId, rec.descricao, mesAtual]
            );

            const valorAnterior = await pool.query(
                `SELECT valor FROM transacoes 
                WHERE usuario_id = $1 
                AND descricao = $2 
                AND TO_CHAR(data, 'YYYY-MM') = $3
                LIMIT 1`,
                [req.userId, rec.descricao, mesAnterior]
            );

            if (valorAtual.rows.length > 0 && valorAnterior.rows.length > 0) {
                const atual = parseFloat(valorAtual.rows[0].valor);
                const anterior = parseFloat(valorAnterior.rows[0].valor);
                const variacao = ((atual - anterior) / anterior) * 100;

                if (Math.abs(variacao) >= 10) {
                    insights.push({
                        tipo: variacao > 0 ? 'aumento' : 'reducao',
                        descricao: rec.descricao,
                        valor_atual: atual,
                        valor_anterior: anterior,
                        variacao: variacao.toFixed(2),
                        mensagem: `${rec.descricao} ${variacao > 0 ? 'aumentou' : 'diminuiu'} ${Math.abs(variacao).toFixed(0)}% este mês`
                    });
                }
            }
        }

        // Calcular % da renda (exemplo fixo, ajustar conforme necessário)
        const totalDespesas = await pool.query(
            `SELECT SUM(valor) as total
            FROM transacoes_recorrentes 
            WHERE usuario_id = $1 AND ativa = true AND tipo = 'despesa'`,
            [req.userId]
        );

        const total = parseFloat(totalDespesas.rows[0]?.total || 0);
        if (total > 0) {
            insights.push({
                tipo: 'comprometimento',
                valor: total,
                mensagem: `Suas despesas fixas totalizam R$ ${total.toFixed(2)}/mês`
            });
        }

        res.json(insights);
    } catch (error) {
        console.error('Erro ao buscar insights:', error);
        res.status(500).json({ error: 'Erro ao buscar insights' });
    }
});

export default router;
