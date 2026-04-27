const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createDbConnection = require('../database/connection');

module.exports = {
  async login(req, res) {
    const { username, password } = req.body;
    const db = await createDbConnection();

    const user = await db.get('SELECT * FROM usuarios WHERE username = ?', [username]);

    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Senha inválida' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_key_lb_mecanica', {
      expiresIn: '1d',
    });

    return res.json({ user: { id: user.id, username: user.username }, token });
  }
};
