const createDbConnection = require('../database/connection');

module.exports = {
  async index(req, res) {
    const db = await createDbConnection();
    const clientes = await db.all('SELECT * FROM clientes');
    return res.json(clientes);
  },

  async show(req, res) {
    const { id } = req.params;
    const db = await createDbConnection();
    const cliente = await db.get('SELECT * FROM clientes WHERE id = ?', [id]);
    if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
    return res.json(cliente);
  },

  async store(req, res) {
    const { nome, telefone, email } = req.body;
    const db = await createDbConnection();
    const result = await db.run(
      'INSERT INTO clientes (nome, telefone, email) VALUES (?, ?, ?)',
      [nome, telefone, email]
    );
    return res.json({ id: result.lastID, nome, telefone, email });
  },

  async update(req, res) {
    const { id } = req.params;
    const { nome, telefone, email } = req.body;
    const db = await createDbConnection();
    await db.run(
      'UPDATE clientes SET nome = ?, telefone = ?, email = ? WHERE id = ?',
      [nome, telefone, email, id]
    );
    return res.json({ id, nome, telefone, email });
  },

  async delete(req, res) {
    const { id } = req.params;
    const db = await createDbConnection();
    await db.run('DELETE FROM clientes WHERE id = ?', [id]);
    return res.status(204).send();
  }
};
