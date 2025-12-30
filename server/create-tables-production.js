// Script para criar tabelas no banco de produção
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://dbname_bnig_user:K0UmORic0g3kqMEvl8EMZOdKkY6mJ3h6@dpg-d3ko09hr0fns73bs2910-a.oregon-postgres.render.com:5432/dbname_bnig',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTables() {
  try {
    console.log('Conectando ao banco de produção...');
    
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
    console.log('✅ Tabela usuarios criada com sucesso!');
    
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
    console.log('✅ Tabela transacoes criada com sucesso!');
    
    console.log('\n🎉 Todas as tabelas foram criadas!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
  } finally {
    await pool.end();
  }
}

createTables();
