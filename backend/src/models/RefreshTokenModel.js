const pool = require('../db');
const crypto = require('crypto');

// Gera um token aleatório (não JWT) para o refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

// Criar um refresh token para um utilizador
const create = async (userId, expiresInDays = 7) => {
  const token = generateRefreshToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  const query = `
    INSERT INTO refresh_tokens (user_id, token, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, token, expires_at
  `;
  const result = await pool.query(query, [userId, token, expiresAt]);
  return result.rows[0];
};

// Buscar um refresh token válido (não revogado e não expirado)
const findValidToken = async (token) => {
  const query = `
    SELECT * FROM refresh_tokens
    WHERE token = $1 AND revoked = FALSE AND expires_at > NOW()
  `;
  const result = await pool.query(query, [token]);
  return result.rows[0];
};

// Revogar um refresh token (logout ou troca de password)
const revoke = async (token) => {
  const query = `UPDATE refresh_tokens SET revoked = TRUE WHERE token = $1 RETURNING id`;
  const result = await pool.query(query, [token]);
  return result.rows[0];
};

// Revogar todos os refresh tokens de um utilizador (ex: quando altera a password)
const revokeAllByUserId = async (userId) => {
  const query = `UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1`;
  await pool.query(query, [userId]);
};

module.exports = { create, findValidToken, revoke, revokeAllByUserId };