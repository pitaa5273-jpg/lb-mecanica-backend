const createDbConnection = require('../database/connection');
const PDFDocument = require('pdfkit');

module.exports = {
  async index(req, res) {
    const db = await createDbConnection();
    const os = await db.all(`
      SELECT os.*, clientes.nome as cliente_nome, veiculos.modelo as veiculo_modelo, veiculos.placa as veiculo_placa
      FROM os
      JOIN clientes ON os.cliente_id = clientes.id
      JOIN veiculos ON os.veiculo_id = veiculos.id
      ORDER BY os.data_criacao DESC
    `);
    return res.json(os);
  },

  async show(req, res) {
    const { id } = req.params;
    const db = await createDbConnection();
    const os = await db.get(`
      SELECT os.*, clientes.nome as cliente_nome, clientes.telefone as cliente_telefone,
             veiculos.marca, veiculos.modelo, veiculos.placa, veiculos.ano
      FROM os
      JOIN clientes ON os.cliente_id = clientes.id
      JOIN veiculos ON os.veiculo_id = veiculos.id
      WHERE os.id = ?
    `, [id]);

    if (!os) return res.status(404).json({ error: 'OS não encontrada' });

    const servicos = await db.all('SELECT * FROM servicos WHERE os_id = ?', [id]);
    const pecas = await db.all('SELECT * FROM pecas WHERE os_id = ?', [id]);
    const fotos = await db.all('SELECT * FROM fotos WHERE os_id = ?', [id]);

    return res.json({ ...os, servicos, pecas, fotos });
  },

  async store(req, res) {
    const { cliente_id, veiculo_id, descricao, status } = req.body;
    const db = await createDbConnection();
    const result = await db.run(
      'INSERT INTO os (cliente_id, veiculo_id, descricao, status) VALUES (?, ?, ?, ?)',
      [cliente_id, veiculo_id, descricao, status || 'Pendente']
    );
    return res.json({ id: result.lastID, cliente_id, veiculo_id, descricao, status });
  },

  async update(req, res) {
    const { id } = req.params;
    const { status, descricao } = req.body;
    const db = await createDbConnection();
    await db.run(
      'UPDATE os SET status = ?, descricao = ? WHERE id = ?',
      [status, descricao, id]
    );
    return res.json({ id, status, descricao });
  },

  async generatePDF(req, res) {
    const { id } = req.params;
    const db = await createDbConnection();
    const os = await db.get(`
      SELECT os.*, clientes.nome as cliente_nome, clientes.telefone as cliente_telefone,
             veiculos.marca, veiculos.modelo, veiculos.placa, veiculos.ano
      FROM os
      JOIN clientes ON os.cliente_id = clientes.id
      JOIN veiculos ON os.veiculo_id = veiculos.id
      WHERE os.id = ?
    `, [id]);

    if (!os) return res.status(404).json({ error: 'OS não encontrada' });

    const servicos = await db.all('SELECT * FROM servicos WHERE os_id = ?', [id]);
    const pecas = await db.all('SELECT * FROM pecas WHERE os_id = ?', [id]);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=OS_${id}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('LB Mecânica Automotiva', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text(`Ordem de Serviço #${os.id}`, { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Cliente: ${os.cliente_nome}`);
    doc.text(`Telefone: ${os.cliente_telefone}`);
    doc.text(`Veículo: ${os.marca} ${os.modelo} (${os.placa}) - Ano: ${os.ano}`);
    doc.text(`Status: ${os.status}`);
    doc.text(`Data: ${new Date(os.data_criacao).toLocaleDateString('pt-BR')}`);
    doc.moveDown();
    doc.text(`Descrição: ${os.descricao}`);
    doc.moveDown();

    doc.fontSize(14).text('Serviços:');
    let totalServicos = 0;
    servicos.forEach(s => {
      doc.fontSize(12).text(`- ${s.descricao}: R$ ${s.valor.toFixed(2)}`);
      totalServicos += s.valor;
    });
    doc.moveDown();

    doc.fontSize(14).text('Peças:');
    let totalPecas = 0;
    pecas.forEach(p => {
      doc.fontSize(12).text(`- ${p.nome}: R$ ${p.valor.toFixed(2)}`);
      totalPecas += p.valor;
    });
    doc.moveDown();

    doc.fontSize(16).text(`Total Geral: R$ ${(totalServicos + totalPecas).toFixed(2)}`, { align: 'right' });

    doc.end();
  }
};
