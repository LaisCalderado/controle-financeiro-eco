// src/routes/setup.ts
import express from 'express';
import { pool } from '../db';

const router = express.Router();

// Endpoint para criar tabelas (use apenas uma vez!)
router.post('/create-tables', async (req, res) => {
    try {
        // Criar tabela usuarios
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                senha VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Criar tabela transacoes
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transacoes (
                id SERIAL PRIMARY KEY,
                descricao TEXT,
                valor DECIMAL(10, 2) NOT NULL,
                data DATE NOT NULL,
                tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
                tipo_servico VARCHAR(50),
                categoria VARCHAR(100),
                usuario_id INTEGER REFERENCES usuarios(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        res.json({ message: 'Tabelas criadas com sucesso!' });
    } catch (error: any) {
        console.error('Erro ao criar tabelas:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para listar todos os usuários
router.get('/list-users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nome, email, role, created_at FROM usuarios ORDER BY id');
        res.json(result.rows);
    } catch (error: any) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para listar todas as transações
router.get('/list-transactions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transacoes ORDER BY data DESC, id DESC');
        res.json(result.rows);
    } catch (error: any) {
        console.error('Erro ao listar transações:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para adicionar coluna role (migração)
router.post('/add-role-column', async (req, res) => {
    try {
        await pool.query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' 
            CHECK (role IN ('admin', 'user'));
        `);
        res.json({ message: 'Coluna role adicionada com sucesso!' });
    } catch (error: any) {
        console.error('Erro ao adicionar coluna role:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint temporário para promover usuário a admin (REMOVER EM PRODUÇÃO)
router.post('/promote-admin', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email é obrigatório' });
        }

        // Adiciona coluna se não existir
        await pool.query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' 
            CHECK (role IN ('admin', 'user'));
        `);

        // Promove usuário a admin
        const result = await pool.query(
            'UPDATE usuarios SET role = $1 WHERE email = $2 RETURNING id, nome, email, role',
            ['admin', email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json({ 
            message: 'Usuário promovido a admin com sucesso!',
            user: result.rows[0]
        });
    } catch (error: any) {
        console.error('Erro ao promover admin:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
