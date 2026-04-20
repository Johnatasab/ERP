const pool = require('../db');

// Gerar código de barras único
const generateBarcode = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return timestamp.slice(-8) + random;
};

// Criar produto
const create = async (data) => {
  const { name, description, category, color, size, weight, supplier, initial_stock, unit_cost, selling_price, profit_margin, image_url } = data;
  const barcode = generateBarcode();
  // Converter strings vazias para null em campos numéricos
  const safeWeight = weight === '' ? null : weight;
  const safeUnitCost = unit_cost === '' ? null : unit_cost;
  const safeSellingPrice = selling_price === '' ? null : selling_price;
  const safeProfitMargin = profit_margin === '' ? null : profit_margin;
  const safeInitialStock = initial_stock === '' ? 0 : initial_stock;
  const query = `
    INSERT INTO products (name, description, category, color, size, barcode, weight, supplier, initial_stock, unit_cost, selling_price, profit_margin, image_url, stock)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `;
  const values = [name, description, category, color, size, barcode, safeWeight, supplier, safeInitialStock, safeUnitCost, safeSellingPrice, safeProfitMargin, image_url, safeInitialStock];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Listar todos (sem paginação)
const findAll = async () => {
  const result = await pool.query('SELECT * FROM products ORDER BY id');
  return result.rows;
};

// Listar com paginação
const findAllPaginated = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `SELECT * FROM products ORDER BY id LIMIT $1 OFFSET $2`;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

// Contar total
const countTotal = async () => {
  const result = await pool.query('SELECT COUNT(*) FROM products');
  return parseInt(result.rows[0].count);
};

// Buscar por ID
const findById = async (id) => {
  const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  return result.rows[0];
};

// Atualizar produto
const update = async (id, data) => {
  const { name, description, category, color, size, weight, supplier, initial_stock, unit_cost, selling_price, profit_margin, image_url, stock } = data;
  const safeWeight = weight === '' ? null : weight;
  const safeUnitCost = unit_cost === '' ? null : unit_cost;
  const safeSellingPrice = selling_price === '' ? null : selling_price;
  const safeProfitMargin = profit_margin === '' ? null : profit_margin;
  const safeInitialStock = initial_stock === '' ? 0 : initial_stock;
  const query = `
    UPDATE products
    SET name = $1, description = $2, category = $3, color = $4, size = $5, weight = $6, supplier = $7, initial_stock = $8, unit_cost = $9, selling_price = $10, profit_margin = $11, image_url = $12, stock = $13
    WHERE id = $14
    RETURNING *
  `;
  const values = [name, description, category, color, size, safeWeight, supplier, safeInitialStock, safeUnitCost, safeSellingPrice, safeProfitMargin, image_url, stock, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

// Eliminar produto
const remove = async (id) => {
  const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
};

// ==================== FUNÇÕES PARA MATÉRIAS-PRIMAS ====================
const addRawMaterial = async (productId, rawMaterialId, quantity) => {
  const query = `
    INSERT INTO product_materials (product_id, raw_material_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (product_id, raw_material_id) DO UPDATE SET quantity = EXCLUDED.quantity
    RETURNING *
  `;
  const result = await pool.query(query, [productId, rawMaterialId, quantity]);
  return result.rows[0];
};

const removeRawMaterial = async (productId, rawMaterialId) => {
  const query = `
    DELETE FROM product_materials
    WHERE product_id = $1 AND raw_material_id = $2
    RETURNING *
  `;
  const result = await pool.query(query, [productId, rawMaterialId]);
  return result.rows[0];
};

const getProductMaterials = async (productId) => {
  const query = `
    SELECT rm.id, rm.name, rm.unit, rm.unit_cost, pm.quantity
    FROM product_materials pm
    JOIN raw_materials rm ON pm.raw_material_id = rm.id
    WHERE pm.product_id = $1
  `;
  const result = await pool.query(query, [productId]);
  return result.rows;
};

// ==================== CONTROLO DE STOCK ====================
const updateStock = async (productId, quantity) => {
  const query = `
    UPDATE products
    SET stock = stock - $1
    WHERE id = $2 AND stock >= $1
    RETURNING id, stock
  `;
  const result = await pool.query(query, [quantity, productId]);
  return result.rows[0];
};

module.exports = {
  create,
  findAll,
  findAllPaginated,
  countTotal,
  findById,
  update,
  remove,
  addRawMaterial,
  removeRawMaterial,
  getProductMaterials,
  updateStock
};