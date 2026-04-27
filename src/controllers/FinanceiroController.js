const createDbConnection = require('../database/connection');
const PDFDocument = require('pdfkit');

module.exports = {
  async index(req, res) {
    const db = await createDbConnection();
    const lancamentos = await db.all('SELECT * FROM financeiro ORDER BY data DESC');
    return res.json(lancamentos);
  },

  async store(req, res) {
    const { tipo, descricao, valor, data } = req.body;
    const db = await createDbConnection();
    const result = await db.run(
      'INSERT INTO financeiro (tipo, descricao, valor, data) VALUES (?, ?, ?, ?)',
      [tipo, descricao, valor, data || new Date().toISOString()]
    );
    return res.json({ id: result.lastID, tipo, descricao, valor, data });
  },

  async summary(req, res) {
    const db = await createDbConnection();
    const entradas = await db.get("SELECT SUM(valor) as total FROM financeiro WHERE tipo = 'entrada'");
    const saidas = await db.get("SELECT SUM(valor) as total FROM financeiro WHERE tipo = 'saida'");
    
    const totalEntradas = entradas.total || 0;
    const totalSaidas = saidas.total || 0;
    
    return res.json({
      entradas: totalEntradas,
      saidas: totalSaidas,
      saldo: totalEntradas - totalSaidas
    });
  },

  async generateReport(req, res) {
    const db = await createDbConnection();
    const lancamentos = await db.all('SELECT * FROM financeiro ORDER BY data DESC');
    
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=Relatorio_Financeiro.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('LB Mecânica Automotiva', { align: 'center' });
    doc.fontSize(16).text('Relatório Financeiro', { align: 'center' });
    doc.moveDown();

    let totalEntradas = 0;
    let totalSaidas = 0;

    lancamentos.forEach(l => {
      const dataFormatada = new Date(l.data).toLocaleDateString('pt-BR');
      doc.fontSize(10).text(`${dataFormatada} - [${l.tipo.toUpperCase()}] ${l.descricao}: R$ ${l.valor.toFixed(2)}`);
      if (l.tipo === 'entrada') totalEntradas += l.valor;
      else totalSaidas += l.valor;
    });

    doc.moveDown();
    doc.fontSize(12).text(`Total Entradas: R$ ${totalEntradas.toFixed(2)}`);
    doc.text(`Total Saídas: R$ ${totalSaidas.toFixed(2)}`);
    doc.fontSize(14).text(`Saldo Final: R$ ${(totalEntradas - totalSaidas).toFixed(2)}`, { bold: true });

    doc.end();
  }
};
