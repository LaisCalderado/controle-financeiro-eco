const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

function getConnectionString() {
  if (process.env.RENDER_DATABASE_URL) {
    return process.env.RENDER_DATABASE_URL;
  }

  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost')) {
    return process.env.DATABASE_URL;
  }

  const setupFile = path.resolve(__dirname, 'executar-setup.js');
  if (fs.existsSync(setupFile)) {
    const content = fs.readFileSync(setupFile, 'utf8');
    const match = content.match(/postgresql:\/\/[^'"\s]+/);
    if (match && match[0]) {
      return match[0];
    }
  }

  return process.env.DATABASE_URL;
}

const connectionString = getConnectionString();

if (!connectionString) {
  console.error('DATABASE_URL não encontrada em server/.env.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const now = new Date();
const pad = (value) => String(value).padStart(2, '0');
const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;

const outputDir = __dirname;
const outputFile = path.join(outputDir, `render_backup_${timestamp}.json`);

async function runBackup() {
  const client = await pool.connect();

  try {
    const dbInfo = await client.query(
      `SELECT current_database() AS database_name, now() AS backup_time, version() AS postgres_version`
    );

    const tablesResult = await client.query(
      `
      SELECT table_schema, table_name
      FROM information_schema.tables
      WHERE table_type = 'BASE TABLE'
        AND table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
      `
    );

    const backup = {
      meta: {
        database: dbInfo.rows[0].database_name,
        backup_time: dbInfo.rows[0].backup_time,
        postgres_version: dbInfo.rows[0].postgres_version,
        generated_at: new Date().toISOString()
      },
      tables: {}
    };

    for (const table of tablesResult.rows) {
      const fullName = `${table.table_schema}.${table.table_name}`;

      const columnsResult = await client.query(
        `
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          ordinal_position
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position
        `,
        [table.table_schema, table.table_name]
      );

      const dataResult = await client.query(
        `SELECT * FROM "${table.table_schema}"."${table.table_name}"`
      );

      backup.tables[fullName] = {
        columns: columnsResult.rows,
        row_count: dataResult.rowCount,
        rows: dataResult.rows
      };
    }

    fs.writeFileSync(outputFile, JSON.stringify(backup, null, 2), 'utf8');
    console.log(`Backup gerado com sucesso: ${outputFile}`);
  } catch (error) {
    console.error('Erro ao gerar backup:', error.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

runBackup();