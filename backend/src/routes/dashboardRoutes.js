const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    // Total de clientes
    const customersResult = await pool.query('SELECT COUNT(*) FROM customers');
    const totalCustomers = parseInt(customersResult.rows[0].count);

    // Total de produtos
    const productsResult = await pool.query('SELECT COUNT(*) FROM products');
    const totalProducts = parseInt(productsResult.rows[0].count);

    // Encomendas do mês atual
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const ordersMonthResult = await pool.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue
       FROM orders
       WHERE order_date >= $1`,
      [firstDay]
    );
    const ordersThisMonth = parseInt(ordersMonthResult.rows[0].count);
    const revenueThisMonth = parseFloat(ordersMonthResult.rows[0].revenue);

    // Receita dos últimos 6 meses
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const result = await pool.query(
        `SELECT COALESCE(SUM(total_amount), 0) as revenue
         FROM orders
         WHERE order_date >= $1 AND order_date < $2`,
        [date, nextMonth]
      );
      const monthName = date.toLocaleString('default', { month: 'short' });
      monthlyRevenue.push({
        month: `${monthName} ${date.getFullYear()}`,
        revenue: parseFloat(result.rows[0].revenue)
      });
    }

    // Produtos com stock baixo (stock < 5)
    const lowStockProducts = await pool.query(
      `SELECT id, name, stock FROM products WHERE stock < 5 ORDER BY stock ASC`
    );

    // Matérias-primas com stock baixo (stock < 1)
    const lowStockMaterials = await pool.query(
      `SELECT id, name, unit, stock FROM raw_materials WHERE stock < 1 ORDER BY stock ASC`
    );

    // Saldo actual
    const balanceResult = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END), 0) as receitas,
        COALESCE(SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END), 0) as despesas
      FROM transactions
    `);
    const currentBalance = balanceResult.rows[0].receitas - balanceResult.rows[0].despesas;

    // Percentagem de encomendas pagas
    const paidOrdersResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN payment_status = 'Pago' THEN 1 ELSE 0 END) as paid
      FROM orders
    `);
    const paidPercentage = paidOrdersResult.rows[0].total > 0 
      ? (paidOrdersResult.rows[0].paid / paidOrdersResult.rows[0].total) * 100 
      : 0;

    // ÚNICA resposta com todos os campos
    res.json({
      totalCustomers,
      totalProducts,
      ordersThisMonth,
      revenueThisMonth,
      monthlyRevenue,
      lowStockProducts: lowStockProducts.rows,
      lowStockRawMaterials: lowStockMaterials.rows,
      currentBalance: parseFloat(currentBalance),
      paidPercentage: parseFloat(paidPercentage)
    });
  } catch (error) {
    console.error('Erro detalhado:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

module.exports = router;