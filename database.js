const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Criar conexão com o banco de dados
const db = new sqlite3.Database(path.join(__dirname, 'portfolio.db'));

// Criar tabela de projetos com nomes em português
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS projetos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT NOT NULL,
      imagem TEXT NOT NULL,
      fallback TEXT NOT NULL,
      githubLink TEXT NOT NULL,
      liveLink TEXT NOT NULL
    )
  `);
});

module.exports = db;