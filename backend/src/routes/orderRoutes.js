const express = require('express');
const router = express.Router();
const pool = require('../db');
const OrderModel = require('../models/OrderModel');
const TransactionModel = require('../models/TransactionModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// ==================== ROTA DE EXPORTAÇÃO (DEVE VIR ANTES DO /:id) ====================
router.get('/export', async (req, res) => {
  const { format, startDate, endDate } = req.query;
  if (!format || !['pdf', 'excel', 'csv'].includes(format)) {
    return res.status(400).json({ error: 'Formato inválido. Use "pdf", "excel" ou "csv".' });
  }

  try {
    // Buscar encomendas com filtro de datas (sem paginação)
    let query = `
      SELECT o.*, c.name as customer_name
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (startDate) {
      query += ` AND o.order_date >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND o.order_date <= $${params.length + 1}`;
      params.push(endDate);
    }
    query += ` ORDER BY o.order_date DESC`;
    const result = await pool.query(query, params);
    const orders = result.rows;

    // --- PDF ---
    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="encomendas.pdf"');
      doc.pipe(res);
      doc.fontSize(18).text('Relatório de Encomendas', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString()}`, { align: 'center' });
      if (startDate || endDate) {
        doc.text(`Período: ${startDate || 'início'} a ${endDate || 'hoje'}`, { align: 'center' });
      }
      doc.moveDown(2);
      const headers = ['ID', 'Cliente', 'Data', 'Total (€)', 'Status', 'Pagamento'];
      const colWidths = [50, 120, 80, 70, 80, 80];
      let x = 30;
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, x, tableTop, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      doc.font('Helvetica');
      let y = tableTop + 20;
      orders.forEach(order => {
        // Garantir que total_amount seja número
        const totalAmount = parseFloat(order.total_amount);
        const totalDisplay = isNaN(totalAmount) ? '0.00' : totalAmount.toFixed(2);
        x = 30;
        doc.text(order.id.toString(), x, y, { width: colWidths[0] });
        x += colWidths[0];
        doc.text(order.customer_name, x, y, { width: colWidths[1] });
        x += colWidths[1];
        doc.text(new Date(order.order_date).toLocaleDateString(), x, y, { width: colWidths[2] });
        x += colWidths[2];
        doc.text(totalDisplay, x, y, { width: colWidths[3] });
        x += colWidths[3];
        doc.text(order.status, x, y, { width: colWidths[4] });
        x += colWidths[4];
        doc.text(order.payment_status || 'Não pago', x, y, { width: colWidths[5] });
        y += 20;
        if (y > 750) { doc.addPage(); y = 50; }
      });
      doc.end();
      // Importante: não enviar mais nada após o pipe
      return;
    }

    // --- Excel ---
    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Encomendas');
      worksheet.columns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Cliente', key: 'customer_name', width: 25 },
        { header: 'Data', key: 'order_date', width: 15 },
        { header: 'Total (€)', key: 'total_amount', width: 12 },
        { header: 'Status', key: 'status', width: 20 },
        { header: 'Pagamento', key: 'payment_status', width: 15 },
        { header: 'Notas', key: 'notes', width: 30 }
      ];
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
      orders.forEach(order => {
        const totalAmount = parseFloat(order.total_amount);
        const totalDisplay = isNaN(totalAmount) ? 0 : totalAmount;
        worksheet.addRow({
          id: order.id,
          customer_name: order.customer_name,
          order_date: new Date(order.order_date).toLocaleDateString(),
          total_amount: totalDisplay,
          status: order.status,
          payment_status: order.payment_status || 'Não pago',
          notes: order.notes || ''
        });
      });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="encomendas.xlsx"');
      await workbook.xlsx.write(res);
      res.end();
      return;
    }

    // --- CSV ---
    if (format === 'csv') {
      let csv = 'ID,Cliente,Data,Total (€),Status,Pagamento,Notas\n';
      orders.forEach(order => {
        const totalAmount = parseFloat(order.total_amount);
        const totalDisplay = isNaN(totalAmount) ? '0.00' : totalAmount.toFixed(2);
        const row = [
          order.id,
          `"${order.customer_name}"`,
          new Date(order.order_date).toLocaleDateString(),
          totalDisplay,
          order.status,
          order.payment_status || 'Não pago',
          `"${(order.notes || '').replace(/"/g, '""')}"`
        ].join(',');
        csv += row + '\n';
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="encomendas.csv"');
      res.send(csv);
      return;
    }
  } catch (error) {
    console.error('Erro na exportação:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  }
});

// ==================== ROTA PRINCIPAL COM PAGINAÇÃO ====================
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const data = await OrderModel.findAllPaginated(page, limit);
    const total = await OrderModel.countTotal();
    const totalPages = Math.ceil(total / limit);
    res.json({ data, pagination: { page, limit, total, totalPages } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar encomendas' });
  }
});

// ==================== ROTAS CRUD ====================
router.get('/:id', async (req, res) => {
  try {
    const order = await OrderModel.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Encomenda não encontrada' });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar encomenda' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customer_id, notes } = req.body;
    if (!customer_id) return res.status(400).json({ error: 'Cliente é obrigatório' });
    const newOrder = await OrderModel.createOrder(customer_id, notes);
    res.status(201).json(newOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar encomenda' });
  }
});

router.post('/:id/items', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { product_id, quantity, unit_price } = req.body;
    if (!product_id || !quantity || !unit_price) {
      return res.status(400).json({ error: 'Produto, quantidade e preço unitário são obrigatórios' });
    }
    const item = await OrderModel.addOrderItem(orderId, product_id, quantity, unit_price);
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao adicionar item' });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await OrderModel.updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Encomenda não encontrada' });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

router.patch('/:id/payment', async (req, res) => {
  try {
    const { payment_status } = req.body;
    const orderId = req.params.id;
    const currentOrder = await OrderModel.findById(orderId);
    if (!currentOrder) return res.status(404).json({ error: 'Encomenda não encontrada' });
    if (currentOrder.payment_status === payment_status) return res.json(currentOrder);
    const updated = await OrderModel.updatePaymentStatus(orderId, payment_status);

    if (payment_status === 'Pago') {
      console.log(`🔍 Processando pagamento para orderId ${orderId}, total_amount = ${currentOrder.total_amount}`);
      const amount = parseFloat(currentOrder.total_amount);
      if (amount <= 0) {
        console.log(`⚠️ Total amount é zero ou negativo (${amount}), transação NÃO criada.`);
      } else {
        const existingTransactions = await TransactionModel.findAll({ order_id: orderId });
        const hasTransaction = existingTransactions.some(t => t.order_id == orderId);
        console.log(`🔍 Já existe transação? ${hasTransaction}`);
        if (!hasTransaction) {
          const description = `Encomenda #${orderId} - Pagamento`;
          const category = 'Vendas';
          const transactionDate = new Date().toISOString().slice(0, 10);
          try {
            const newTrans = await TransactionModel.create(description, 'receita', amount, category, transactionDate, orderId);
            console.log(`✅ Transação criada com sucesso:`, newTrans);
          } catch (err) {
            console.error('❌ Erro ao criar transação:', err);
          }
        } else {
          console.log(`⚠️ Transação já existe para orderId ${orderId}, não será duplicada.`);
        }
      }
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar pagamento' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await OrderModel.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Encomenda não encontrada' });
    res.json({ message: 'Encomenda eliminada', id: deleted.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao eliminar encomenda' });
  }
});

module.exports = router;