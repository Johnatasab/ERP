// src/middleware/errorHandler.js
const logger = require('../utils/logger');

// Middleware global de tratamento de erros
const errorHandler = (err, req, res, next) => {
  // Log do erro (podes usar console ou winston)
  console.error('Erro:', err.stack);
  if (logger) logger.error(err.message);

  // Se a resposta já foi enviada, delega para o próximo
  if (res.headersSent) {
    return next(err);
  }

  // Resposta padrão
  const status = err.status || 500;
  const message = err.message || 'Erro interno do servidor';
  res.status(status).json({ error: message });
};

module.exports = errorHandler;