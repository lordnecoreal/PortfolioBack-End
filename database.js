const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Criar conexão com o banco de dados
const db = new sqlite3.Database(path.join(__dirname, 'portfolio.db'));

// Criar tabela de projetos
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS projetos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT NOT NULL,
      imagem TEXT NOT NULL,
      githubLink TEXT NOT NULL,
      liveLink TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela:', err);
    } else {
      console.log('✅ Tabela "projetos" verificada/criada com sucesso');
      
      // Verificar se o projeto Anjos Caridosos já existe
      db.get('SELECT * FROM projetos WHERE nome = ?', ['Anjos Caridosos'], (err, row) => {
        if (err) {
          console.error('Erro ao verificar projeto:', err);
        } else if (!row) {
          // Inserir o projeto Anjos Caridosos se não existir
          const sql = `
            INSERT INTO projetos (nome, descricao, imagem, githubLink, liveLink)
            VALUES (?, ?, ?, ?, ?)
          `;
          
          db.run(sql, [
            'Anjos Caridosos',
            'Plataforma de gestão de voluntários com perfis específicos (psicólogos, assistentes sociais, educadores). Interface administrativa para cadastrar, visualizar e gerenciar voluntários associando cada pessoa a perfis de atuação.',
            '/src/imagensprojetos/anjoscaridosos.png',
            'https://github.com/lordnecoreal/AnjosCaridososFULLSTACK',
            'https://anjoscaridosos.vercel.app/'
          ], function(err) {
            if (err) {
              console.error('Erro ao inserir Anjos Caridosos:', err);
            } else {
              console.log('✅ Projeto "Anjos Caridosos" adicionado ao banco (ID:', this.lastID, ')');
            }
          });
        } else {
          console.log('ℹ️ Projeto "Anjos Caridosos" já existe no banco (ID:', row.id, ')');
        }
      });
    }
  });
});

module.exports = db;