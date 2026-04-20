const express = require('express');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');
const authMiddleware = require('../middleware/authMiddleware'); // se existir, senão cria


const router = express.Router();

// Aplica middleware de autenticação a todas as rotas deste ficheiro
router.use(authMiddleware);

// Obter perfil do utilizador autenticado
router.get('/', async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// Atualizar perfil (nome, email)
router.put('/', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }
    // Verificar se o email já está em uso por outro utilizador
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser && existingUser.id !== req.userId) {
      return res.status(409).json({ error: 'Email já registado por outro utilizador' });
    }
    const updatedUser = await UserModel.updateProfile(req.userId, name, email);
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// Alterar password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Password atual e nova password são obrigatórias' });
    }
    const user = await UserModel.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });

    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Password atual incorreta' });
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await UserModel.updatePassword(req.userId, newPasswordHash);
    res.json({ message: 'Password alterada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao alterar password' });
  }
});

module.exports = router;