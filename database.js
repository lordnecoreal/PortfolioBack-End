const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Criar conexão com o banco de dados
const db = new sqlite3.Database(path.join(__dirname, 'portfolio.db'));

// Criar tabela de projetos
db.serialize(() => {
  // Adicionado a coluna 'categoria' com valor padrão 'Geral'
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
  `, (err) => {
    if (err) {
      console.error('Erro ao criar tabela:', err);
    } else {
      console.log('✅ Tabela "projetos" verificada/criada com sucesso');
      
      // Lista completa com os 10 projetos
      const projetosIniciais = [
        {
          nome: 'Anjos Caridosos',
          descricao: 'Plataforma de gestão de voluntários com perfis específicos (psicólogos, assistentes sociais, educadores). Interface administrativa para cadastrar, visualizar e gerenciar voluntários associando cada pessoa a perfis de atuação.',
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

      // Função recursiva/iterativa para checar e inserir um por um
      const inserirProjetos = () => {
        const stmt = db.prepare(`
          INSERT INTO projetos (nome, descricao, imagem, categoria, githubLink, liveLink)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

        projetosIniciais.forEach((p) => {
          // Verifica se o projeto já existe pelo nome
          db.get('SELECT id FROM projetos WHERE nome = ?', [p.nome], (err, row) => {
            if (err) {
              console.error('Erro ao verificar projeto:', err);
              return;
            }
            
            // Se não existir (row for undefined), insere!
            if (!row) {
              stmt.run(p.nome, p.descricao, p.imagem, p.categoria, p.githubLink, p.liveLink);
              console.log(`✅ Projeto adicionado: ${p.nome} (Categoria: ${p.categoria})`);
            }
          });
        });

        stmt.finalize();
      };

      // Chama a função para checar e inserir
      inserirProjetos();
    }
  });
});

module.exports = db;