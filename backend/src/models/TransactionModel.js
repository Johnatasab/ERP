const pool = require('../db');

// Criar nova transacção
const create = async (description, type, amount, category, transaction_date, order_id = null) => {
  const query = `
    INSERT INTO transactions (description, type, amount, category, transaction_date, order_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const result = await pool.query(query, [description, type, amount, category, transaction_date, order_id]);
  return result.rows[0];
};

// Listar transacções (sem paginação, para relatórios)
const findAll = async (filters = {}) => {
  let query = `SELECT t.* FROM transactions t WHERE 1=1`;
  const values = [];
  let idx = 1;

  if (filters.type && ['receita', 'despesa'].includes(filters.type)) {
    query += ` AND t.type = $${idx++}`;
    values.push(filters.type);
  }
  if (filters.startDate) {
    query += ` AND t.transaction_date >= $${idx++}`;
    values.push(filters.startDate);
  }
  if (filters.endDate) {
    query += ` AND t.transaction_date <= $${idx++}`;
    values.push(filters.endDate);
  }
  if (filters.order_id) {
    query += ` AND t.order_id = $${idx++}`;
    values.push(filters.order_id);
  }

  query += ` ORDER BY t.transaction_date DESC, t.id DESC`;
  const result = await pool.query(query, values);
  return result.rows;
};

// Listar transacções com paginação
const findAllPaginated = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  let query = `SELECT t.* FROM transactions t WHERE 1=1`;
  const values = [];
  let idx = 1;

  if (filters.type && ['receita', 'despesa'].includes(filters.type)) {
    query += ` AND t.type = $${idx++}`;
    values.push(filters.type);
  }
  if (filters.startDate) {
    query += ` AND t.transaction_date >= $${idx++}`;
    values.push(filters.startDate);
  }
  if (filters.endDate) {
    query += ` AND t.transaction_date <= $${idx++}`;
    values.push(filters.endDate);
  }

  query += ` ORDER BY t.transaction_date DESC, t.id DESC LIMIT $${idx++} OFFSET $${idx++}`;
  values.push(limit, offset);
  const result = await pool.query(query, values);
  return result.rows;
};

// Contar total de transacções com filtros
const countTotal = async (filters = {}) => {
  let query = `SELECT COUNT(*) FROM transactions WHERE 1=1`;
  const values = [];
  let idx = 1;

  if (filters.type && ['receita', 'despesa'].includes(filters.type)) {
    query += ` AND type = $${idx++}`;
    values.push(filters.type);
  }
  if (filters.startDate) {
    query += ` AND transaction_date >= $${idx++}`;
    values.push(filters.startDate);
  }
  if (filters.endDate) {
    query += ` AND transaction_date <= $${idx++}`;
    values.push(filters.endDate);
  }

  const result = await pool.query(query, values);
  return parseInt(result.rows[0].count);
};

// Obter saldo actual
const getBalance = async () => {
  const query = `
    SELECT 
      COALESCE(SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END), 0) as total_receitas,
      COALESCE(SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END), 0) as total_despesas
    FROM transactions
  `;
  const result = await pool.query(query);
  const balance = result.rows[0].total_receitas - result.rows[0].total_despesas;
  return {
    total_receitas: parseFloat(result.rows[0].total_receitas),
    total_despesas: parseFloat(result.rows[0].total_despesas),
    balance: parseFloat(balance)
  };
};

// Eliminar transacção
const remove = async (id) => {
  const result = await pool.query(`DELETE FROM transactions WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0];
};

module.exports = { create, findAll, findAllPaginated, countTotal, getBalance, remove };