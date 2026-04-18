const pool = require('../db');

const create = async (name, email, phone, address, nif) => {
  const query = `
    INSERT INTO customers (name, email, phone, address, nif)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const result = await pool.query(query, [name, email, phone, address, nif]);
  return result.rows[0];
};

const findAll = async () => {
  const query = `SELECT * FROM customers ORDER BY id`;
  const result = await pool.query(query);
  return result.rows;
};

// Função de paginação (essencial)
const findAllPaginated = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `SELECT * FROM customers ORDER BY id LIMIT $1 OFFSET $2`;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

// Contagem total (essencial)
const countTotal = async () => {
  const result = await pool.query(`SELECT COUNT(*) FROM customers`);
  return parseInt(result.rows[0].count);
};

const findById = async (id) => {
  const query = `SELECT * FROM customers WHERE id = $1`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const update = async (id, name, email, phone, address, nif) => {
  const query = `
    UPDATE customers
    SET name = $1, email = $2, phone = $3, address = $4, nif = $5
    WHERE id = $6
    RETURNING *
  `;
  const result = await pool.query(query, [name, email, phone, address, nif, id]);
  return result.rows[0];
};

const remove = async (id) => {
  const query = `DELETE FROM customers WHERE id = $1 RETURNING id`;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = { create, findAll, findAllPaginated, countTotal, findById, update, remove };