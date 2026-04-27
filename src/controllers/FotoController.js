const createDbConnection = require('../database/connection');

module.exports = {
  async store(req, res) {
    const { os_id, tipo } = req.body;
    const caminho = req.file.filename;
    
    const db = await createDbConnection();
    const result = await db.run(
      'INSERT INTO fotos (os_id, tipo, caminho) VALUES (?, ?, ?)',
      [os_id, tipo, caminho]
    );
    
    return res.json({ id: result.lastID, os_id, tipo, caminho });
  },

  async index(req, res) {
    const { os_id } = req.params;
    const db = await createDbConnection();
    const fotos = await db.all('SELECT * FROM fotos WHERE os_id = ?', [os_id]);
    return res.json(fotos);
  },

  async delete(req, res) {
    const { id } = req.params;
    const db = await createDbConnection();
    // Aqui poderíamos deletar o arquivo físico também
    await db.run('DELETE FROM fotos WHERE id = ?', [id]);
    return res.status(204).send();
  }
};
