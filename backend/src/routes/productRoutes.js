const express = require('express');
const ProductModel = require('../models/ProductModel');
const router = express.Router();


router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const data = await ProductModel.findAllPaginated(page, limit);
    const total = await ProductModel.countTotal();
    const totalPages = Math.ceil(total / limit);
    res.json({ data, pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } });
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Listar produtos (com custo calculado)
router.get('/', async (req, res) => {
  try {
    const products = await ProductModel.findAll();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Buscar produto por ID (com custo e matérias-primas associadas)
router.get('/:id', async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
    const materials = await ProductModel.getProductMaterials(req.params.id);
    product.materials = materials;
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// Criar produto
router.post('/', async (req, res) => {
  try {
    const { name, description, selling_price, category, image_url } = req.body;
    const newProduct = await ProductModel.create(name, description, selling_price, category, image_url);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
});

// Atualizar produto
router.put('/:id', async (req, res) => {
  try {
    const { name, description, selling_price, category, image_url } = req.body;
    const updated = await ProductModel.update(req.params.id, name, description, selling_price, category, image_url);
    if (!updated) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// Eliminar produto
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await ProductModel.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ message: 'Produto eliminado', id: deleted.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao eliminar produto' });
  }
});

// Associar matéria-prima a um produto
router.post('/:id/materials', async (req, res) => {
  try {
    const { raw_material_id, quantity } = req.body;
    const association = await ProductModel.addRawMaterial(req.params.id, raw_material_id, quantity);
    res.status(201).json(association);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao associar matéria-prima' });
  }
});

// Remover associação
router.delete('/:id/materials/:materialId', async (req, res) => {
  try {
    await ProductModel.removeRawMaterial(req.params.id, req.params.materialId);
    res.json({ message: 'Associação removida' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao remover associação' });
  }
});

module.exports = router;