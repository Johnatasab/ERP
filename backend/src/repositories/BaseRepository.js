// src/repositories/BaseRepository.js
const pool = require('../db');

class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
  }

  // Criar registo (genérico)
  async create(data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
    const query = `
      INSERT INTO ${this.tableName} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Listar todos (com paginação opcional)
  async findAll(page = null, limit = null) {
    if (page && limit) {
      const offset = (page - 1) * limit;
      const query = `SELECT * FROM ${this.tableName} ORDER BY id LIMIT $1 OFFSET $2`;
      const result = await pool.query(query, [limit, offset]);
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${this.tableName}`);
      const total = parseInt(countResult.rows[0].count);
      return {
        data: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } else {
      const query = `SELECT * FROM ${this.tableName} ORDER BY id`;
      const result = await pool.query(query);
      return result.rows;
    }
  }

  // Buscar por ID
  async findById(id) {
    const query = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Atualizar
  async update(id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const query = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;
    const result = await pool.query(query, [...values, id]);
    return result.rows[0];
  }

  // Eliminar
  async remove(id) {
    const query = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = BaseRepository;