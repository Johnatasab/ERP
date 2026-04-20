const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const cookieParser = require('cookie-parser');
const RefreshTokenModel = require('../models/RefreshTokenModel');

const router = express.Router();

// Rota de registo (criar novo utilizador)
router.post('/register', async (req, res) => {
  console.log('Corpo recebido (register):', req.body);
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e password são obrigatórios' });
    }

    // Verifica se o email já está registado
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email já registado' });
    }

    // Encripta a password
    const SALT_ROUNDS = 12;
    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Cria o utilizador
    const newUser = await UserModel.create(name, email, password_hash);

    res.status(201).json({ message: 'Utilizador criado com sucesso', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de login (autenticar utilizador)
router.post('/login', async (req, res) => {
  console.log('Corpo recebido (login):', req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password são obrigatórios' });
    }

    // Procura o utilizador pelo email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Compara a password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar access token (curta duração)
    const acessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    //Gerar refresh token e guardar na base de dados
    const refreshTokenObj = await RefreshTokenModel.create(user.id, 7); // 7 dias

    //Enviar refresh token como httpOnly cookie (seguro)
    res.cookie('refreshToken', refreshTokenObj.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 1000 //7 dias
    });

    res.json({
      message: 'Login bem-sucedido',
      token: acessToken,
      user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para renovar access token usando refresh token (httpOnly cookie)
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token não fornecido' });
    }

    const validToken = await RefreshTokenModel.findValidToken(refreshToken);
    if (!validToken) {
      return res.status(403).json({ error: 'Refresh token inválido ou expirado' });
    }

    // Buscar o utilizador associado
    const user = await UserModel.findById(validToken.user_id);
    if (!user) {
      return res.status(404).json({ error: 'Utilizador não encontrado' });
    }

    // Gerar novo access token
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ token: newAccessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao renovar token' });
  }
});

// Logout: revogar refresh token e limpar cookie
router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await RefreshTokenModel.revoke(refreshToken);
    }
    res.clearCookie('refreshToken');
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer logout' });
  }
});

module.exports = router;