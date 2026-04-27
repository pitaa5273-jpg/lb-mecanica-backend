const createDbConnection = require('../database/connection');

module.exports = {
  async storeServico(req, res) {
    const { os_id, descricao, valor } = req.body;
    const db = await createDbConnection();
    const result = await db.run(
      'INSERT INTO servicos (os_id, descricao, valor) VALUES (?, ?, ?)',
      [os_id, descricao, valor]
    );
    return res.json({ id: result.lastID, os_id, descricao, valor });
  },

  async deleteServico(req, res) {
    const { id } = req.params;
    const db = await createDbConnection();
    await db.run('DELETE FROM servicos WHERE id = ?', [id]);
    return res.status(204).send();
  },

  async storePeca(req, res) {
    const { os_id, nome, valor } = req.body;
    const db = await createDbConnection();
    const result = await db.run(
      'INSERT INTO pecas (os_id, nome, valor) VALUES (?, ?, ?)',
      [os_id, nome, valor]
    );
    return res.json({ id: result.lastID, os_id, nome, valor });
  },

  async deletePeca(req, res) {
    const { id } = req.params;
    const db = await createDbConnection();
    await db.run('DELETE FROM pecas WHERE id = ?', [id]);
    return res.status(204).send();
  }
};
