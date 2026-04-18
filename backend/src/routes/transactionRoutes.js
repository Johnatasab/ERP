const express = require('express');
const TransactionModel = require('../models/TransactionModel');
const router = express.Router();
const pool = require('../db');

// ==================== ROTA DE EXPORTAÇÃO ====================
router.get('/export', async (req, res) => {
  const { format, type, startDate, endDate } = req.query;
  if (!format || !['pdf', 'excel', 'csv'].includes(format)) {
    return res.status(400).json({ error: 'Formato inválido. Use "pdf", "excel" ou "csv".' });
  }

  try {
    // Buscar transações com filtros (sem paginação)
    let query = `SELECT * FROM transactions WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (type && ['receita', 'despesa'].includes(type)) {
      query += ` AND type = $${idx++}`;
      params.push(type);
    }
    if (startDate) {
      query += ` AND transaction_date >= $${idx++}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND transaction_date <= $${idx++}`;
      params.push(endDate);
    }
    query += ` ORDER BY transaction_date DESC`;
    const result = await pool.query(query, params);
    const transactions = result.rows;

    // --- PDF ---
    if (format === 'pdf') {
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ margin: 30, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="transacoes.pdf"');
      doc.pipe(res);
      doc.fontSize(18).text('Relatório de Transações Financeiras', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString()}`, { align: 'center' });
      if (startDate || endDate || type) {
        let filterText = '';
        if (type) filterText += `Tipo: ${type === 'receita' ? 'Receita' : 'Despesa'} `;
        if (startDate) filterText += `Período: ${startDate} a ${endDate || 'hoje'}`;
        doc.text(filterText, { align: 'center' });
      }
      doc.moveDown(2);
      const headers = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (€)'];
      const colWidths = [80, 150, 80, 60, 70];
      let x = 30;
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, x, tableTop, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      doc.font('Helvetica');
      let y = tableTop + 20;
      transactions.forEach(trans => {
        x = 30;
        doc.text(new Date(trans.transaction_date).toLocaleDateString(), x, y, { width: colWidths[0] });
        x += colWidths[0];
        doc.text(trans.description, x, y, { width: colWidths[1] });
        x += colWidths[1];
        doc.text(trans.category || '-', x, y, { width: colWidths[2] });
        x += colWidths[2];
        doc.text(trans.type === 'receita' ? 'Receita' : 'Despesa', x, y, { width: colWidths[3] });
        x += colWidths[3];
        doc.text(parseFloat(trans.amount).toFixed(2), x, y, { width: colWidths[4] });
        y += 20;
        if (y > 750) { doc.addPage(); y = 50; }
      });
      doc.end();
      return;
    }

    // --- Excel ---
    if (format === 'excel') {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Transações');
      worksheet.columns = [
        { header: 'Data', key: 'date', width: 15 },
        { header: 'Descrição', key: 'description', width: 30 },
        { header: 'Categoria', key: 'category', width: 20 },
        { header: 'Tipo', key: 'type', width: 10 },
        { header: 'Valor (€)', key: 'amount', width: 12 }
      ];
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
      transactions.forEach(trans => {
        worksheet.addRow({
          date: new Date(trans.transaction_date).toLocaleDateString(),
          description: trans.description,
          category: trans.category || '-',
          type: trans.type === 'receita' ? 'Receita' : 'Despesa',
          amount: parseFloat(trans.amount).toFixed(2)
        });
      });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="transacoes.xlsx"');
      await workbook.xlsx.write(res);
      res.end();
      return;
    }

    // --- CSV ---
    if (format === 'csv') {
      let csv = 'Data,Descrição,Categoria,Tipo,Valor (€)\n';
      transactions.forEach(trans => {
        const row = [
          new Date(trans.transaction_date).toLocaleDateString(),
          `"${trans.description.replace(/"/g, '""')}"`,
          `"${(trans.category || '-').replace(/"/g, '""')}"`,
          trans.type === 'receita' ? 'Receita' : 'Despesa',
          parseFloat(trans.amount).toFixed(2)
        ].join(',');
        csv += row + '\n';
      });
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="transacoes.csv"');
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

// Listar transacções com paginação
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      type: req.query.type,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    const data = await TransactionModel.findAllPaginated(page, limit, filters);
    const total = await TransactionModel.countTotal(filters);
    const totalPages = Math.ceil(total / limit);
    res.json({ data, pagination: { page, limit, total, totalPages } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar transacções' });
  }
});

// Obter saldo actual
router.get('/balance', async (req, res) => {
  try {
    const balance = await TransactionModel.getBalance();
    res.json(balance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter saldo' });
  }
});

// Criar nova transacção
router.post('/', async (req, res) => {
  try {
    const { description, type, amount, category, transaction_date, order_id } = req.body;
    if (!description || !type || !amount) {
      return res.status(400).json({ error: 'Descrição, tipo e valor são obrigatórios' });
    }
    const newTransaction = await TransactionModel.create(description, type, amount, category, transaction_date || new Date(), order_id);
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar transacção' });
  }
});

// Eliminar transacção
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await TransactionModel.remove(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Transacção não encontrada' });
    res.json({ message: 'Transacção eliminada', id: deleted.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao eliminar transacção' });
  }
});

module.exports = router;