// Script para executar o setup do banco de dados
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// URL Externa do banco (permite conexão de fora do Render)
const DATABASE_URL = 'postgresql://controle_financeiro_db_ipq0_user:wtSPPSCnjnQwgoSR2lr22D5xVumUfFQg@dpg-d64emc75r7bs73aedl10-a.oregon-postgres.render.com/controle_financeiro_db_ipq0';

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function executarSetup() {
  console.log('🔄 Conectando ao banco de dados...');
  
  try {
    // Testa a conexão
    await pool.query('SELECT NOW()');
    console.log('✅ Conectado com sucesso!\n');
    
    // Lê o arquivo SQL
    const sqlPath = path.join(__dirname, 'setup-novo-banco.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Executando script SQL...\n');
    
    // Executa o SQL
    await pool.query(sql);
    
    console.log('✅ Setup concluído com sucesso!\n');
    
    // Verifica as tabelas criadas
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📊 Tabelas criadas:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
    
    console.log('\n🎉 Banco de dados pronto para uso!');
    
  } catch (error) {
    console.error('❌ Erro ao executar setup:', error.message);
    console.error('\nDetalhes:', error);
  } finally {
    await pool.end();
  }
}

executarSetup();
