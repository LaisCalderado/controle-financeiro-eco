// src/routes/auth.ts
import express from 'express';
import { pool } from '../db';
import bcrypt from 'bcrypt';

const router = express.Router();

// Cadastro de usuário
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    console.log('Requisição recebida:', req.body);

    // Verifica se todos os campos foram enviados
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    try {
        // Criptografa a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insere no banco (campos do banco: nome, email, senha)
        const result = await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING *',
            [name, email, hashedPassword]
        );

        const user = result.rows[0];

        // Retorna o usuário para o front usando as variáveis em inglês
        res.status(201).json({
            id: user.id,
            name: user.nome, // pega do campo 'nome' do banco
            email: user.email
        });
    } catch (error: any) {
        console.error('Erro ao cadastrar usuário:', error);

        if (error.code === '23505') {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
});

// Adicione no final do arquivo src/routes/auth.ts
router.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nome AS name, email FROM usuarios');
        res.json(result.rows);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});


export default router;
