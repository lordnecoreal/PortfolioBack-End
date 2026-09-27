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
      
      // Lista de projetos para inserir
      const projetos = [
        {
          nome: 'Desafio Final Connect',
          descricao: 'Projeto final do curso Connect, um site completo com funcionalidades modernas e design responsivo.',
          imagem: '/src/imagensprojetos/desafiofinal.png',
          githubLink: 'https://github.com/LordNecoReal/DesafioFinalConnectOswaldo',
          liveLink: 'https://desafiofinalconnectoswaldo.vercel.app/'
        },
        {
          nome: 'Calculadora Rock',
          descricao: 'Uma calculadora temática de rock com design estilizado e funcionalidades completas de cálculos matemáticos.',
          imagem: '/src/imagensprojetos/calculadorarock.png',
          githubLink: 'https://github.com/LordNecoReal/calculadoraRock',
          liveLink: 'https://calculadorarock.vercel.app/'
        },
        {
          nome: 'Árvore Natalina',
          descricao: 'Um projeto festivo com animações interativas de árvore de Natal, ideal para celebrações e decorações digitais.',
          imagem: '/src/imagensprojetos/arvorenatalina.png',
          githubLink: 'https://github.com/LordNecoReal/arvorenatalina2025',
          liveLink: 'https://arvorenatalina2025.vercel.app/'
        },
        {
          nome: 'Recicla Tech',
          descricao: 'Iniciativa sustentável para reciclagem de eletrônicos, conscientizando sobre descarte correto e pontos de coleta.',
          imagem: '/src/imagensprojetos/reciclatech.png',
          githubLink: 'https://github.com/LordNecoReal/reciclatechlord',
          liveLink: 'https://reciclatechlord.vercel.app/'
        },
        {
          nome: 'Anjos Caridosos',
          descricao: 'Plataforma de gestão de voluntários com perfis específicos (psicólogos, assistentes sociais, educadores). Interface administrativa para cadastrar, visualizar e gerenciar voluntários.',
          imagem: '/src/imagensprojetos/anjoscaridosos.png',
          githubLink: 'https://github.com/lordnecoreal/AnjosCaridososFULLSTACK',
          liveLink: 'https://anjoscaridosos.vercel.app/'
        },
        {
          nome: 'Encanto das Bebidas',
          descricao: 'Plataforma dedicada ao mundo das bebidas, com catálogo interativo e informações sobre diferentes tipos de drinks.',
          imagem: '/src/imagensprojetos/encantodasbebidas.png',
          githubLink: 'https://github.com/LordNecoReal/EncantodasBebidas',
          liveLink: 'https://encantodasbebidas.vercel.app/'
        },
        {
          nome: 'Encantos do Lord Neco',
          descricao: 'Site pessoal mostrando os encantos e projetos especiais do Lord Neco, com design único e interativo.',
          imagem: '/src/imagensprojetos/encantosdolord.png',
          githubLink: 'https://github.com/LordNecoReal/EncantosDoLordNeco',
          liveLink: 'https://encantosdolordneco.vercel.app/'
        },
        {
          nome: 'Pet Adopt',
          descricao: 'Plataforma de adoção de pets conectando animais necessitados a lares amorosos com sistema de busca e filtros.',
          imagem: '/src/imagensprojetos/petadopt.png',
          githubLink: 'https://github.com/LordNecoReal/petAdopt',
          liveLink: 'https://petadopt-black.vercel.app/'
        },
        {
          nome: 'Verde Ação',
          descricao: 'Projeto ambiental com foco em ações sustentáveis, plantio de árvores e preservação da natureza.',
          imagem: '/src/imagensprojetos/verdeacao.png',
          githubLink: 'https://github.com/LordNecoReal/VerdeAcaoLord',
          liveLink: 'https://verdeacaolord.vercel.app/'
        }
      ];
      
      // Inserir cada projeto (apenas se não existir)
      projetos.forEach((projeto) => {
        db.get('SELECT * FROM projetos WHERE nome = ?', [projeto.nome], (err, row) => {
          if (err) {
            console.error('Erro ao verificar projeto:', err);
          } else if (!row) {
            const sql = `
              INSERT INTO projetos (nome, descricao, imagem, githubLink, liveLink)
              VALUES (?, ?, ?, ?, ?)
            `;
            
            db.run(sql, [
              projeto.nome,
              projeto.descricao,
              projeto.imagem,
              projeto.githubLink,
              projeto.liveLink
            ], function(err) {
              if (err) {
                console.error(`Erro ao inserir ${projeto.nome}:`, err);
              } else {
                console.log(`✅ Projeto "${projeto.nome}" adicionado (ID: ${this.lastID})`);
              }
            });
          } else {
            console.log(`ℹ️ Projeto "${projeto.nome}" já existe (ID: ${row.id})`);
          }
        });
      });
    }
  });
});

module.exports = db;