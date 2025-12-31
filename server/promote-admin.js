// Script para promover usuário a admin
require('dotenv').config();
const { Pool } = require('pg');

// Usa o banco de produção do Render
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dbname_bnig_user:cKM0eCEPjuXBuDqiFD6wMevSbHfRrMbS@dpg-d3ko09hr0fns73bs2910-a.oregon-postgres.render.com:5432/dbname_bnig';

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function promoteToAdmin(email) {
    try {
        // Primeiro, adiciona a coluna role se não existir
        await pool.query(`
            ALTER TABLE usuarios 
            ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' 
            CHECK (role IN ('admin', 'user'));
        `);
        console.log('✓ Coluna role verificada/criada');

        // Atualiza o usuário para admin
        const result = await pool.query(
            'UPDATE usuarios SET role = $1 WHERE email = $2 RETURNING id, nome, email, role',
            ['admin', email]
        );

        if (result.rows.length > 0) {
            console.log('✓ Usuário promovido a admin:');
            console.log(result.rows[0]);
        } else {
            console.log('✗ Usuário não encontrado com email:', email);
        }

        // Lista todos os usuários
        const users = await pool.query('SELECT id, nome, email, role FROM usuarios');
        console.log('\nTodos os usuários:');
        console.table(users.rows);

    } catch (error) {
        console.error('Erro:', error.message);
    } finally {
        await pool.end();
    }
}

// Pega o email da linha de comando ou usa um padrão
const email = process.argv[2] || 'lais.calderaro06@gmail.com';
promoteToAdmin(email);
