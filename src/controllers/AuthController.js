const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createDbConnection = require('../database/connection');

module.exports = {
  async login(req, res) {
    const { username, password } = req.body;
    console.log(`Tentativa de login para o usuário: ${username}`);
    const db = await createDbConnection();

    const user = await db.get('SELECT * FROM usuarios WHERE username = ?', [username]);

    if (!user) {
      console.log(`Usuário não encontrado: ${username}`);
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log(`Senha inválida para o usuário: ${username}`);
      return res.status(400).json({ error: 'Senha inválida' });
    }
    console.log(`Login bem-sucedido para o usuário: ${username}`);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret_key_lb_mecanica', {
      expiresIn: '1d',
    });

    return res.json({ user: { id: user.id, username: user.username }, token });
  }
};
