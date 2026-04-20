const express = require('express');
const CustomerModel = require('../models/CustomerModel');
const authMiddleware = require('../middleware/authMiddleware'); // se existir, caso contrário comente ou remova
const router = express.Router();
const validate = require('../middleware/validate');
const { createCustomerSchema, updateCustomerSchema } = require('../validations/customerValidation');

// Aplica autenticação em todas as rotas (opcional, comente se não quiser)
// router.use(authMiddleware);

// ==================== ROTAS PÚBLICAS (ou protegidas) ====================

// Listar todos os clientes (com paginação)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const customers = await CustomerModel.findAllPaginated(page, limit);
    const total = await CustomerModel.countTotal();
    const totalPages = Math.ceil(total / limit);
    res.json({
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Buscar um cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await CustomerModel.findById(id);
    if (!customer) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

// Criar novo cliente
router.post('/', validate(createCustomerSchema), async (req, res) => {
  try {
    const { name, email, phone, address, nif } = req.body;

    const newCustomer = await CustomerModel.create(name, email, phone, address, nif);
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email já registado para outro cliente' });
    }
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// Atualizar cliente
router.put('/:id', validate(updateCustomerSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, nif } = req.body;
    const updated = await CustomerModel.update(id, name, email, phone, address, nif);
    if (!updated) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// Eliminar cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CustomerModel.remove(id);
    if (!deleted) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json({ message: 'Cliente eliminado com sucesso', id: deleted.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao eliminar cliente' });
  }
});

module.exports = router;