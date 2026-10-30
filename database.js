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
      categoria TEXT DEFAULT 'Geral',
      githubLink TEXT NOT NULL,
      liveLink TEXT NOT NULL
    )
  `, async (err) => {
    if (err) {
      console.error('Erro ao criar tabela:', err);
      return;
    }
    console.log('✅ Tabela "projetos" verificada/criada com sucesso');
    
    const projetosIniciais = [
      { nome: 'Anjos Caridosos', descricao: 'Plataforma de gestão de voluntários...', imagem: '/src/imagensprojetos/anjoscaridosos.png', categoria: 'Plataforma / Social', githubLink: 'https://github.com/lordnecoreal/AnjosCaridososFULLSTACK', liveLink: 'https://anjoscaridosos.vercel.app/' },
      { nome: 'Qual sua classe?', descricao: 'Descubra sua classe de RPG...', imagem: '/src/imagensprojetos/qualsuaclasse.png', categoria: 'Jogo / Quiz', githubLink: 'https://github.com/lordnecoreal/qualSuaClasse', liveLink: 'https://qualsuaclasse.vercel.app/' },
      { nome: 'Desafio Final Connect', descricao: 'Projeto final do curso Connect...', imagem: '/src/imagensprojetos/desafiofinal.png', categoria: 'Site / Web', githubLink: 'https://github.com/LordNecoReal/DesafioFinalConnectOswaldo', liveLink: 'https://desafiofinalconnectoswaldo.vercel.app/' },
      { nome: 'Calculadora Rock', descricao: 'Uma calculadora temática de rock...', imagem: '/src/imagensprojetos/calculadorarock.png', categoria: 'Ferramenta', githubLink: 'https://github.com/LordNecoReal/calculadoraRock', liveLink: 'https://calculadorarock.vercel.app/' },
      { nome: 'Árvore Natalina', descricao: 'Um projeto festivo com animações...', imagem: '/src/imagensprojetos/arvorenatalina.png', categoria: 'Animação / Design', githubLink: 'https://github.com/LordNecoReal/arvorenatalina2025', liveLink: 'https://arvorenatalina2025.vercel.app/' },
      { nome: 'Recicla Tech', descricao: 'Iniciativa sustentável para reciclagem...', imagem: '/src/imagensprojetos/reciclatech.png', categoria: 'Site / Web', githubLink: 'https://github.com/LordNecoReal/reciclatechlord', liveLink: 'https://reciclatechlord.vercel.app/' },
      { nome: 'Encanto das Bebidas', descricao: 'Plataforma dedicada ao mundo das bebidas...', imagem: '/src/imagensprojetos/encantodasbebidas.png', categoria: 'Catálogo', githubLink: 'https://github.com/LordNecoReal/EncantodasBebidas', liveLink: 'https://encantodasbebidas.vercel.app/' },
      { nome: 'Encantos do Lord Neco', descricao: 'Site pessoal mostrando os encantos...', imagem: '/src/imagensprojetos/encantosdolord.png', categoria: 'Site Pessoal', githubLink: 'https://github.com/LordNecoReal/EncantosDoLordNeco', liveLink: 'https://encantosdolordneco.vercel.app/' },
      { nome: 'Pet Adopt', descricao: 'Plataforma de adoção de pets...', imagem: '/src/imagensprojetos/petadopt.png', categoria: 'Plataforma / Social', githubLink: 'https://github.com/LordNecoReal/petAdopt', liveLink: 'https://petadopt-black.vercel.app/' },
      { nome: 'Caminho da Confiança', descricao: 'Projeto focado em transmitir segurança...', imagem: '/src/imagensprojetos/caminhodaconfianca.png', categoria: 'Site / Web', githubLink: 'https://github.com/lordnecoreal/CaminhoDaConfianca', liveLink: 'https://caminhodaconfianca.vercel.app/' }
    ];

    // Função que promisifica o db.get e db.run para podermos usar await
    const dbGet = (sql, params) => new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    });

    const dbRun = (sql, params) => new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });

    // Loop assíncrono para inserir um por um, de forma segura
    for (const p of projetosIniciais) {
      try {
        const row = await dbGet('SELECT id FROM projetos WHERE nome = ?', [p.nome]);
        
        if (!row) {
          await dbRun(
            `INSERT INTO projetos (nome, descricao, imagem, categoria, githubLink, liveLink) VALUES (?, ?, ?, ?, ?, ?)`,
            [p.nome, p.descricao, p.imagem, p.categoria, p.githubLink, p.liveLink]
          );
          console.log(`✅ Projeto adicionado: ${p.nome} (Categoria: ${p.categoria})`);
        }
      } catch (error) {
        console.error(`❌ Erro ao processar o projeto ${p.nome}:`, error);
      }
    }
    
    console.log('🌱 Verificação de banco de dados finalizada com sucesso!');
  });
});

module.exports = db;