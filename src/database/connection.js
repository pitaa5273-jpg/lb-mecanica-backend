const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function createDbConnection() {
  const db = await open({
    filename: path.resolve(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      telefone TEXT,
      email TEXT
    );

    CREATE TABLE IF NOT EXISTS veiculos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      marca TEXT,
      modelo TEXT,
      placa TEXT,
      ano INTEGER,
      FOREIGN KEY (cliente_id) REFERENCES clientes (id)
    );

    CREATE TABLE IF NOT EXISTS os (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      veiculo_id INTEGER,
      descricao TEXT,
      status TEXT DEFAULT 'Pendente',
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes (id),
      FOREIGN KEY (veiculo_id) REFERENCES veiculos (id)
    );

    CREATE TABLE IF NOT EXISTS servicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      os_id INTEGER,
      descricao TEXT,
      valor REAL,
      FOREIGN KEY (os_id) REFERENCES os (id)
    );

    CREATE TABLE IF NOT EXISTS pecas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      os_id INTEGER,
      nome TEXT,
      valor REAL,
      FOREIGN KEY (os_id) REFERENCES os (id)
    );

    CREATE TABLE IF NOT EXISTS financeiro (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT, -- entrada/saida
      descricao TEXT,
      valor REAL,
      data DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS fotos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      os_id INTEGER,
      tipo TEXT, -- antes, durante, depois
      caminho TEXT,
      FOREIGN KEY (os_id) REFERENCES os (id)
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    );
  `);

  // Criar usuário padrão se não existir
  const bcrypt = require('bcryptjs');
  const user = await db.get('SELECT * FROM usuarios WHERE username = ?', ['lbmecanica']);
  if (!user) {
    const hashedPassword = await bcrypt.hash('eaixuxu', 10);
    await db.run('INSERT INTO usuarios (username, password) VALUES (?, ?)', ['lbmecanica', hashedPassword]);
  }

  return db;
}

module.exports = createDbConnection;
