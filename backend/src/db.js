const { Pool } = require('pg');
require('dotenv/config');

// Prioridade para DATABASE_URL (Railway, Supabase, etc.)
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL não definida. Verifique as variáveis de ambiente.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : 
  false,
  family: 4
});

pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL ligado com sucesso!'))
  .catch(err => console.error('❌ Erro ao ligar à BD:', err.message));

module.exports = pool;