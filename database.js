const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Criar conexão com o banco de dados
const db = new sqlite3.Database(path.join(__dirname, 'portfolio.db'));

// Criar tabela de projetos
db.serialize(() => {
  // Tabela de Projetos (Adicionado data_criacao)
  db.run(`
    CREATE TABLE IF NOT EXISTS projetos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      descricao TEXT NOT NULL,
      imagem TEXT NOT NULL,
      categoria TEXT DEFAULT 'Geral',
      githubLink TEXT NOT NULL,
      liveLink TEXT NOT NULL,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela de projetos:', err);
      return;
    }
    console.log('✅ Tabela "projetos" verificada/criada com sucesso');
    
    // ADICIONADO: Atualiza a tabela existente sem apagar os dados
    db.run(`ALTER TABLE projetos ADD COLUMN data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP`, (err) => {
      if (err && err.message.includes('duplicate column name')) {
        // Coluna já existe, ignora
      }
    });
    
    const projetosIniciais = [
      { 
        nome: 'Encantos da Literatura', 
        descricao: 'Um espaço dedicado à poesia e à literatura gótica. Explore poemas que transitam entre a paixão, a melancolia e o místico.', 
        imagem: '/src/imagensprojetos/encantosdaliteratura.png', 
        categoria: 'Leitura / Poesias / Gótico', 
        githubLink: 'https://github.com/lordnecoreal/encantosDaLiteratura', 
        liveLink: 'https://encantosdaliteratura.vercel.app/' 
      },
      { 
        nome: 'Desafio Amigo Secreto', 
        descricao: 'Uma plataforma interativa para realizar sorteios de amigo secreto de forma rápida, fácil e segura. Ideal para confraternizações e eventos.', 
        imagem: '/src/imagensprojetos/desafioamigosecreto.png', 
        categoria: 'Site / Sorteio / Ferramenta', 
        githubLink: 'https://github.com/lordnecoreal/desafioAmigoSecreto', 
        liveLink: 'https://amigosecretoo.vercel.app/' 
      },
      { 
        nome: 'Anjos Caridosos', 
        descricao: 'Plataforma de gestão de voluntários com perfis específicos (psicólogos, assistentes sociais, educadores). Interface administrativa para cadastrar, visualizar e gerenciar voluntários.', 
        imagem: '/src/imagensprojetos/anjoscaridosos.png', 
        categoria: 'Plataforma / Social', 
        githubLink: 'https://github.com/lordnecoreal/AnjosCaridososFULLSTACK', 
        liveLink: 'https://anjoscaridosos.vercel.app/' 
      },
      { 
        nome: 'Qual sua classe?', 
        descricao: 'Descubra sua classe de RPG! Responda a um quiz de perguntas a sua escolha de personalidade e comportamento para descobrir qual das 15 classes clássicas ou de fantasia mais combina com seu estilo de jogo.', 
        imagem: '/src/imagensprojetos/qualsuaclasse.png', 
        categoria: 'Jogo / Quiz', 
        githubLink: 'https://github.com/lordnecoreal/qualSuaClasse', 
        liveLink: 'https://qualsuaclasse.vercel.app/' 
      },
      { 
        nome: 'Desafio Final Connect', 
        descricao: 'Projeto final do curso Connect, um site completo com funcionalidades modernas e design responsivo.', 
        imagem: '/src/imagensprojetos/desafiofinal.png', 
        categoria: 'Site / Web', 
        githubLink: 'https://github.com/LordNecoReal/DesafioFinalConnectOswaldo', 
        liveLink: 'https://desafiofinalconnectoswaldo.vercel.app/' 
      },
      { 
        nome: 'Calculadora Rock', 
        descricao: 'Uma calculadora temática de rock com design estilizado e funcionalidades completas de cálculos matemáticos.', 
        imagem: '/src/imagensprojetos/calculadorarock.png', 
        categoria: 'Ferramenta', 
        githubLink: 'https://github.com/LordNecoReal/calculadoraRock', 
        liveLink: 'https://calculadorarock.vercel.app/' 
      },
      { 
        nome: 'Árvore Natalina', 
        descricao: 'Um projeto festivo com animações interativas de árvore de Natal, ideal para celebrações e decorações digitais.', 
        imagem: '/src/imagensprojetos/arvorenatalina.png', 
        categoria: 'Animação / Design', 
        githubLink: 'https://github.com/LordNecoReal/arvorenatalina2025', 
        liveLink: 'https://arvorenatalina2025.vercel.app/' 
      },
      { 
        nome: 'Recicla Tech', 
        descricao: 'Iniciativa sustentável para reciclagem de eletrônicos, conscientizando sobre descarte correto e pontos de coleta.', 
        imagem: '/src/imagensprojetos/reciclatech.png', 
        categoria: 'Site / Web', 
        githubLink: 'https://github.com/LordNecoReal/reciclatechlord', 
        liveLink: 'https://reciclatechlord.vercel.app/' 
      },
      { 
        nome: 'Encanto das Bebidas', 
        descricao: 'Plataforma dedicada ao mundo das bebidas, com catálogo interativo e informações sobre diferentes tipos de drinks.', 
        imagem: '/src/imagensprojetos/encantodasbebidas.png', 
        categoria: 'Catálogo', 
        githubLink: 'https://github.com/LordNecoReal/EncantodasBebidas', 
        liveLink: 'https://encantodasbebidas.vercel.app/' 
      },
      { 
        nome: 'Encantos do Lord Neco', 
        descricao: 'Site pessoal mostrando os encantos e projetos especiais do Lord Neco, com design único e interativo.', 
        imagem: '/src/imagensprojetos/encantosdolord.png', 
        categoria: 'Site Pessoal', 
        githubLink: 'https://github.com/LordNecoReal/EncantosDoLordNeco', 
        liveLink: 'https://encantosdolordneco.vercel.app/' 
      },
      { 
        nome: 'Pet Adopt', 
        descricao: 'Plataforma de adoção de pets conectando animais necessitados a lares amorosos com sistema de busca e filtros.', 
        imagem: '/src/imagensprojetos/petadopt.png', 
        categoria: 'Plataforma / Social', 
        githubLink: 'https://github.com/LordNecoReal/petAdopt', 
        liveLink: 'https://petadopt-black.vercel.app/' 
      },
      { 
        nome: 'Caminho da Confiança', 
        descricao: 'Projeto focado em transmitir segurança e credibilidade. Desenvolvido para oferecer uma experiência intuitiva e confiável para os usuários.', 
        imagem: '/src/imagensprojetos/caminhodaconfianca.png', 
        categoria: 'Site / Web', 
        githubLink: 'https://github.com/lordnecoreal/CaminhoDaConfianca', 
        liveLink: 'https://caminhodaconfianca.vercel.app/' 
      }
    ];

    const dbGet = (sql, params) => new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    });

    const dbRun = (sql, params) => new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });

    const popularBanco = async () => {
      for (const p of projetosIniciais) {
        try {
          const row = await dbGet('SELECT id FROM projetos WHERE nome = ?', [p.nome]);
          if (!row) {
            await dbRun(
              `INSERT INTO projetos (nome, descricao, imagem, categoria, githubLink, liveLink) VALUES (?, ?, ?, ?, ?, ?)`,
              [p.nome, p.descricao, p.imagem, p.categoria, p.githubLink, p.liveLink]
            );
            console.log(`✅ Projeto adicionado: ${p.nome}`);
          }
        } catch (error) {
          console.error(`❌ Erro ao processar ${p.nome}:`, error);
        }
      }
      console.log('🌱 Verificação de banco de dados finalizada!');
    };
    
    popularBanco();
  });

  // Tabela de Configurações (Foto e Música)
  db.run(`
    CREATE TABLE IF NOT EXISTS configuracoes (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      perfil_imagem TEXT,
      musica_arquivo TEXT
    )
  `, (err) => {
    if (err) console.error('Erro ao criar tabela de configuracoes:', err);
    else console.log('✅ Tabela "configuracoes" verificada/criada com sucesso');
  });
});

module.exports = db;