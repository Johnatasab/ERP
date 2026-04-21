const pool = require('../db');

// Criar nova encomenda (apenas cabeçalho, sem itens ainda)
const createOrder = async (customer_id, notes) => {
  const query = `
    INSERT INTO orders (customer_id, notes)
    VALUES ($1, $2)
    RETURNING *
  `;
  const result = await pool.query(query, [customer_id, notes]);
  return result.rows[0];
};

// Adicionar item à encomenda (atualiza o total da encomenda automaticamente)
const addOrderItem = async (order_id, product_id, quantity, unit_price) => {
  const total = quantity * unit_price;
  const insertQuery = `
    INSERT INTO order_items (order_id, product_id, quantity, unit_price, total)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const insertResult = await pool.query(insertQuery, [order_id, product_id, quantity, unit_price, total]);
  
  // Atualizar total da encomenda
  const updateTotalQuery = `
    UPDATE orders
    SET total_amount = (SELECT SUM(total) FROM order_items WHERE order_id = $1)
    WHERE id = $1
  `;
  await pool.query(updateTotalQuery, [order_id]);
  
  return insertResult.rows[0];
};

// Listar todas as encomendas (sem paginação - usado internamente)
const findAll = async () => {
  const query = `
    SELECT o.*, c.name as customer_name
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    ORDER BY o.id DESC
  `;
  const result = await pool.query(query);
  return result.rows;
};

// Listar encomendas com paginação
const findAllPaginated = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const query = `
    SELECT o.*, c.name as customer_name
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    ORDER BY o.id DESC
    LIMIT $1 OFFSET $2
  `;
  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

// Contar total de encomendas
const countTotal = async () => {
  const result = await pool.query(`SELECT COUNT(*) FROM orders`);
  return parseInt(result.rows[0].count);
};

// Buscar uma encomenda por ID (com itens e detalhes dos produtos)
const findById = async (id) => {
  const orderQuery = `
    SELECT o.*, c.name as customer_name, c.email, c.phone
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.id = $1
  `;
  const orderResult = await pool.query(orderQuery, [id]);
  if (orderResult.rows.length === 0) return null;
  const order = orderResult.rows[0];
  
  const itemsQuery = `
    SELECT oi.*, p.name as product_name, p.category
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = $1
  `;
  const itemsResult = await pool.query(itemsQuery, [id]);
  order.items = itemsResult.rows;
  
  return order;
};

// Atualizar status da encomenda
const updateStatus = async (id, status) => {
  const query = `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
};

// Atualizar o status de pagamento (Pago / Não pago)
const updatePaymentStatus = async (id, payment_status) => {
  const validPayments = ['Pago', 'Não pago'];
  if (!validPayments.includes(payment_status)) {
    throw new Error('Status de pagamento inválido');
  }
  const query = `UPDATE orders SET payment_status = $1 WHERE id = $2 RETURNING *`;
  const result = await pool.query(query, [payment_status, id]);
  return result.rows[0];
};

// Eliminar encomenda (cancela e remove itens por CASCADE)
const remove = async (id) => {
  const result = await pool.query(`DELETE FROM orders WHERE id = $1 RETURNING id`, [id]);
  return result.rows[0];
};

module.exports = { 
  createOrder, 
  addOrderItem, 
  findAll, 
  findAllPaginated,
  countTotal,
  findById, 
  updateStatus, 
  updatePaymentStatus,
  remove 
};