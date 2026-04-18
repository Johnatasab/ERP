const express = require('express');
const RawMaterialModel = require('../models/RawMaterialModel');
const router = express.Router();

// Listar
router.get('/', async (req, res) => {
  try {
    const materials = await RawMaterialModel.findAll();
    res.json(materials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar matérias-primas' });
  }
});

// Buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const material = await RawMaterialModel.findById(req.params.id);
    if (!material) return res.status(404).json({ error: 'Não encontrado' });
    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar' });
  }
});

// Criar
router.post('/', async (req, res) => {
  try {
    const { name, unit_cost, unit, stock } = req.body;
    const newMaterial = await RawMaterialModel.create(name, unit_cost, unit, stock);
    res.status(201).json(newMaterial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar matéria-prima' });
  }
});

// Atualizar
router.put('/:id', async (req, res) => {
  try {
    const { name, unit_cost, unit, stock } = req.body;
    const updated = await RawMaterialModel.update(req.params.id, name, unit_cost, unit, stock);
    if (!updated) return res.status(404).json({ error: 'Não encontrado' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar' });
  }
});

// Eliminar
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await RawMaterialModel.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Matéria-prima eliminada', id: deleted.id });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao eliminar' });
  }
});

module.exports = router;