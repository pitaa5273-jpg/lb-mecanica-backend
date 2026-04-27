const createDbConnection = require('../database/connection');

module.exports = {
  async index(req, res) {
    const db = await createDbConnection();
    const veiculos = await db.all(`
      SELECT veiculos.*, clientes.nome as cliente_nome 
      FROM veiculos 
      JOIN clientes ON veiculos.cliente_id = clientes.id
    `);
    return res.json(veiculos);
  },

  async store(req, res) {
    const { cliente_id, marca, modelo, placa, ano } = req.body;
    const db = await createDbConnection();
    const result = await db.run(
      'INSERT INTO veiculos (cliente_id, marca, modelo, placa, ano) VALUES (?, ?, ?, ?, ?)',
      [cliente_id, marca, modelo, placa, ano]
    );
    return res.json({ id: result.lastID, cliente_id, marca, modelo, placa, ano });
  },

  async update(req, res) {
    const { id } = req.params;
    const { marca, modelo, placa, ano } = req.body;
    const db = await createDbConnection();
    await db.run(
      'UPDATE veiculos SET marca = ?, modelo = ?, placa = ?, ano = ? WHERE id = ?',
      [marca, modelo, placa, ano, id]
    );
    return res.json({ id, marca, modelo, placa, ano });
  },

  async delete(req, res) {
    const { id } = req.params;
    const db = await createDbConnection();
    await db.run('DELETE FROM veiculos WHERE id = ?', [id]);
    return res.status(204).send();
  }
};
