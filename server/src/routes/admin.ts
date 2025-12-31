// src/routes/admin.ts
import express from 'express';
import { pool } from '../db';
import bcrypt from 'bcrypt';
import { verifyToken, requireAdmin } from '../middleware/adminAuth';

const router = express.Router();

// Todas as rotas de admin precisam de autenticação + role admin
router.use(verifyToken);
router.use(requireAdmin);

// GET /admin/users - Listar todos os usuários
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nome, email, role, created_at FROM usuarios ORDER BY id'
        );
        res.json(result.rows);
    } catch (error: any) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
});

// POST /admin/users - Criar novo usuário
router.post('/users', async (req, res) => {
    const { name, email, password, role = 'user' } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    if (role !== 'user' && role !== 'admin') {
        return res.status(400).json({ error: 'Role deve ser "user" ou "admin"' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            'INSERT INTO usuarios (nome, email, senha, role) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, role, created_at',
            [name, email, hashedPassword, role]
        );

        res.status(201).json(result.rows[0]);
    } catch (error: any) {
        console.error('Erro ao criar usuário:', error);
        
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }
        
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

// PUT /admin/users/:id - Atualizar usuário
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    if (!name && !email && !password && !role) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    if (role && role !== 'user' && role !== 'admin') {
        return res.status(400).json({ error: 'Role deve ser "user" ou "admin"' });
    }

    try {
        // Verifica se o usuário existe
        const userExists = await pool.query('SELECT id FROM usuarios WHERE id = $1', [id]);
        if (userExists.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Constrói a query dinamicamente
        const updates: string[] = [];
        const values: any[] = [];
        let paramCount = 1;

        if (name) {
            updates.push(`nome = $${paramCount++}`);
            values.push(name);
        }
        if (email) {
            updates.push(`email = $${paramCount++}`);
            values.push(email);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updates.push(`senha = $${paramCount++}`);
            values.push(hashedPassword);
        }
        if (role) {
            updates.push(`role = $${paramCount++}`);
            values.push(role);
        }

        values.push(id);

        const result = await pool.query(
            `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, nome, email, role, created_at`,
            values
        );

        res.json(result.rows[0]);
    } catch (error: any) {
        console.error('Erro ao atualizar usuário:', error);
        
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }
        
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

// DELETE /admin/users/:id - Deletar usuário
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Verifica se o usuário existe
        const userExists = await pool.query('SELECT id FROM usuarios WHERE id = $1', [id]);
        if (userExists.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Impede que o admin delete a si mesmo
        if (parseInt(id) === req.userId) {
            return res.status(400).json({ error: 'Você não pode deletar sua própria conta' });
        }

        // Deleta as transações do usuário primeiro (integridade referencial)
        await pool.query('DELETE FROM transacoes WHERE usuario_id = $1', [id]);
        
        // Deleta o usuário
        await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);

        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error: any) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
});

// GET /admin/transactions - Listar todas as transações (de todos os usuários)
router.get('/transactions', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                t.*,
                u.nome as usuario_nome,
                u.email as usuario_email
            FROM transacoes t
            LEFT JOIN usuarios u ON t.usuario_id = u.id
            ORDER BY t.data DESC, t.id DESC
        `);
        res.json(result.rows);
    } catch (error: any) {
        console.error('Erro ao listar transações:', error);
        res.status(500).json({ error: 'Erro ao listar transações' });
    }
});

// GET /admin/dashboard - Dashboard consolidado
router.get('/dashboard', async (req, res) => {
    try {
        // Total de usuários
        const usersResult = await pool.query('SELECT COUNT(*) as total FROM usuarios');
        const totalUsers = parseInt(usersResult.rows[0].total);

        // Total de transações
        const transactionsResult = await pool.query('SELECT COUNT(*) as total FROM transacoes');
        const totalTransactions = parseInt(transactionsResult.rows[0].total);

        // Soma de receitas e despesas
        const receitasResult = await pool.query(
            "SELECT COALESCE(SUM(valor), 0) as total FROM transacoes WHERE tipo = 'receita'"
        );
        const despesasResult = await pool.query(
            "SELECT COALESCE(SUM(valor), 0) as total FROM transacoes WHERE tipo = 'despesa'"
        );

        const totalReceitas = parseFloat(receitasResult.rows[0].total);
        const totalDespesas = parseFloat(despesasResult.rows[0].total);
        const saldo = totalReceitas - totalDespesas;

        // Transações por categoria (receitas)
        const receitasPorCategoria = await pool.query(`
            SELECT categoria, COUNT(*) as quantidade, SUM(valor) as total
            FROM transacoes
            WHERE tipo = 'receita'
            GROUP BY categoria
            ORDER BY total DESC
        `);

        // Transações por categoria (despesas)
        const despesasPorCategoria = await pool.query(`
            SELECT categoria, COUNT(*) as quantidade, SUM(valor) as total
            FROM transacoes
            WHERE tipo = 'despesa'
            GROUP BY categoria
            ORDER BY total DESC
        `);

        res.json({
            usuarios: {
                total: totalUsers
            },
            transacoes: {
                total: totalTransactions,
                receitas: {
                    total: totalReceitas,
                    porCategoria: receitasPorCategoria.rows
                },
                despesas: {
                    total: totalDespesas,
                    porCategoria: despesasPorCategoria.rows
                },
                saldo: saldo
            }
        });
    } catch (error: any) {
        console.error('Erro ao buscar dashboard:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
    }
});

export default router;
