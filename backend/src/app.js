require('dotenv/config');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
require('./db'); // ligação à BD

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
};

const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

// Rotas
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const productRoutes = require('./routes/productRoutes');
const rawMaterialRoutes = require('./routes/rawMaterialRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();

// Segurança
app.use(helmet());

// Limitar requisições
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: { error: 'Muitas requisições deste IP, tente novamente mais tarde.' },
});
app.use('/api/', limiter);
app.use(hpp());

// CORS com domínio do frontend
const allowedOrigins = ['http://localhost:5173'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Compressão
app.use(compression());

// LOGS (morgan) - criar pasta logs se não existir
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}
const accessLogStream = fs.createWriteStream(
  path.join(logDir, 'access.log'),
  { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream })); // escreve no ficheiro
app.use(morgan('dev')); // mostra no console

// Parsers
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.get('/', (req, res) => { res.json({ message: '🚀 API ERP está a funcionar' }); });
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error(err);
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({ error: 'Erro interno do servidor' });
  } else {
    res.status(err.status || 500).json({ error: err.message, stack: err.stack });
  }
});

const PORT = env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor a correr em http://localhost:${PORT}`);
  console.log(`🔒 Ambiente: ${env.NODE_ENV}`);
});