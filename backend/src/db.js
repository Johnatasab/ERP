const { Pool } = require('pg');
require('dotenv/config');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASS,
});

pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL ligado com sucesso!'))
  .catch(err => console.error('❌ Erro ao ligar à BD:', err.message));

module.exports = pool;