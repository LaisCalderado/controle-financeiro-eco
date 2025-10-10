// src/routes/auth.ts
import express from 'express';
import { pool } from '../db';
import bcrypt from 'bcrypt';
import jwt  from 'jsonwebtoken';

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

// Login de usuário
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log("Tentando login com:", email);

    if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).json({ error: 'Usuário não encontrado' });
        }

        const validPassword = await bcrypt.compare(password, user.senha);
        if (!validPassword) {
            return res.status(400).json({ error: 'Senha incorreta' });
        }

        // Gera token JWT
        const jwt = await import('jsonwebtoken');
        const token = jwt.default.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'chave_secreta',
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Login realizado com sucesso',
            token,
            user: { id: user.id, name: user.nome, email: user.email },
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
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
