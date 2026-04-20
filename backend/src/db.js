const { Pool } = require('pg');
require('dotenv/config');

// Determina a string de ligação (prioridade para DATABASE_URL)
const connectionString = process.env.DATABASE_URL || process.env.DB_URL;

let poolConfig;

if (connectionString) {
  // Usar connection string (ex: do Supabase ou Railway)
  poolConfig = {
    connectionString: connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  };
} else {
  // Fallback para variáveis individuais (desenvolvimento local)
  poolConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  };
}

const pool = new Pool(poolConfig);

pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL ligado com sucesso!'))
  .catch(err => console.error('❌ Erro ao ligar à BD:', err.message));

module.exports = pool;