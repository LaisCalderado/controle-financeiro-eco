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

export default router;
