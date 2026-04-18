const BaseRepository = require('../repositories/BaseRepository');
const pool = require('../db');

class ProductRepository extends BaseRepository {
  constructor() {
    super('products');
  }
}

const findAllPaginated = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `SELECT * FROM products ORDER BY id LIMIT $1 OFFSET $2`;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

const countTotal = async () => {
  const result = await pool.query(`SELECT COUNT(*) FROM products`);
  return parseInt(result.rows[0].count);
};

module.exports = { findAllPaginated, countTotal };