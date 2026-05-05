const express = require('express');
const cors = require('cors');
const db = require('./database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'src', 'imagensprojetos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'projeto-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif)'));
    }
  }
});

// Servir arquivos estáticos
app.use('/src/imagensprojetos', express.static(path.join(__dirname, 'src', 'imagensprojetos')));
app.use('/front', express.static(path.join(__dirname, 'front')));

// Rotas para páginas HTML
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'admin.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'login.html'));
});

// ============ ROTA PRINCIPAL - PÁGINA INICIAL COM HEADER ============
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API do Portfólio - Lord Neco</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #f5f5f5;
                padding-top: 70px;
            }

            /* HEADER FIXO */
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 15px 30px;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }

            .header-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .logo h1 {
                font-size: 20px;
                margin-bottom: 5px;
            }

            .logo p {
                font-size: 12px;
                opacity: 0.9;
            }

            .nav-menu {
                display: flex;
                gap: 20px;
                align-items: center;
            }

            .nav-link {
                color: white;
                text-decoration: none;
                padding: 8px 15px;
                border-radius: 5px;
                transition: background 0.3s;
            }

            .nav-link:hover {
                background: rgba(255,255,255,0.2);
            }

            .btn-admin {
                background: #ff9800;
                color: white;
                border: none;
                padding: 8px 20px;
                border-radius: 20px;
                cursor: pointer;
                font-size: 14px;
                font-weight: bold;
                transition: background 0.3s;
            }

            .btn-admin:hover {
                background: #e68900;
            }

            /* CONTEÚDO PRINCIPAL */
            .container {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }

            .card {
                background: white;
                border-radius: 10px;
                padding: 30px;
                margin-bottom: 20px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }

            h1 {
                color: #667eea;
                margin-bottom: 10px;
                font-size: 28px;
            }

            h2 {
                color: #764ba2;
                margin-bottom: 20px;
                border-bottom: 2px solid #764ba2;
                padding-bottom: 10px;
            }

            .endpoint {
                background: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 15px;
                margin: 15px 0;
                border-radius: 5px;
            }

            .method {
                display: inline-block;
                font-weight: bold;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 12px;
                margin-right: 10px;
            }

            .get { background: #4CAF50; color: white; }
            .post { background: #2196F3; color: white; }
            .put { background: #FF9800; color: white; }
            .delete { background: #f44336; color: white; }

            .url {
                font-family: monospace;
                font-size: 14px;
                color: #667eea;
                background: #e9ecef;
                padding: 3px 8px;
                border-radius: 3px;
            }

            code {
                background: #e9ecef;
                padding: 2px 5px;
                border-radius: 3px;
                font-family: monospace;
                font-size: 13px;
            }

            .example {
                background: #e9ecef;
                padding: 10px;
                border-radius: 5px;
                margin-top: 10px;
                font-size: 13px;
            }

            .footer {
                text-align: center;
                margin-top: 30px;
                padding: 20px;
                color: #888;
                font-size: 12px;
            }

            .status {
                display: inline-block;
                width: 10px;
                height: 10px;
                background: #4CAF50;
                border-radius: 50%;
                margin-right: 5px;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }

            @media (max-width: 768px) {
                .header-content {
                    flex-direction: column;
                    gap: 10px;
                }
                body {
                    padding-top: 100px;
                }
                .card {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <!-- HEADER FIXO -->
        <div class="header">
            <div class="header-content">
                <div class="logo">
                    <h1>🎨 API do Portfólio</h1>
                    <p>Lord Neco</p>
                </div>
                <div class="nav-menu">
                    <a href="#documentacao" class="nav-link">📚 Documentação</a>
                    <a href="#exemplos" class="nav-link">📡 Exemplos</a>
                    <button onclick="irParaAdmin()" class="btn-admin">🔐 Área Administrativa</button>
                </div>
            </div>
        </div>

        <!-- CONTEÚDO PRINCIPAL -->
        <div class="container">
            <div class="card" id="documentacao">
                <h1>🎨 Bem-vindo à API do Portfólio</h1>
                <p>Esta API fornece acesso aos projetos do meu portfólio. Utilize os endpoints abaixo para interagir com os dados.</p>
                
                <h2>📌 Endpoints Disponíveis</h2>
                
                <div class="endpoint">
                    <div>
                        <span class="method get">GET</span>
                        <span class="url">/projetos</span>
                    </div>
                    <p>📋 Lista todos os projetos cadastrados</p>
                </div>
                
                <div class="endpoint">
                    <div>
                        <span class="method get">GET</span>
                        <span class="url">/projetos/:id</span>
                    </div>
                    <p>🔍 Busca um projeto específico pelo ID</p>
                </div>
                
                <div class="endpoint">
                    <div>
                        <span class="method post">POST</span>
                        <span class="url">/projetos</span>
                    </div>
                    <p>➕ Adiciona um novo projeto (requer autenticação)</p>
                </div>
                
                <div class="endpoint">
                    <div>
                        <span class="method put">PUT</span>
                        <span class="url">/projetos/:id</span>
                    </div>
                    <p>✏️ Atualiza um projeto existente (requer autenticação)</p>
                </div>
                
                <div class="endpoint">
                    <div>
                        <span class="method delete">DELETE</span>
                        <span class="url">/projetos/:id</span>
                    </div>
                    <p>🗑️ Remove um projeto (requer autenticação)</p>
                </div>
            </div>

            <div class="card" id="exemplos">
                <h2>📡 Exemplos de Uso</h2>
                
                <div class="example">
                    <strong>📋 Listar todos os projetos:</strong><br>
                    <code>GET /projetos</code>
                </div>
                
                <div class="example">
                    <strong>🔍 Buscar projeto com ID 1:</strong><br>
                    <code>GET /projetos/1</code>
                </div>
                
                <div class="example">
                    <strong>➕ Adicionar novo projeto (via POST):</strong><br>
                    <code>
                    {<br>
                    &nbsp;&nbsp;"nome": "Meu Novo Projeto",<br>
                    &nbsp;&nbsp;"descricao": "Descrição do projeto",<br>
                    &nbsp;&nbsp;"githubLink": "https://github.com/...",<br>
                    &nbsp;&nbsp;"liveLink": "https://...vercel.app/"<br>
                    }
                    </code>
                    <br><br>
                    <small>⚠️ A imagem deve ser enviada via formulário multipart/form-data</small>
                </div>
                
                <div class="example">
                    <strong>🖼️ Acessar uma imagem:</strong><br>
                    <code>GET /src/imagensprojetos/nome-da-imagem.png</code>
                </div>
            </div>

            <div class="card">
                <h2>🔐 Área Administrativa</h2>
                <p>Para gerenciar seus projetos (adicionar, editar, excluir), acesse o painel administrativo:</p>
                <br>
                <button onclick="irParaAdmin()" style="background: #667eea; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px;">
                    🔐 Ir para o Painel Admin
                </button>
                <br><br>
                <small>⚠️ Acesso restrito - requer login de administrador</small>
            </div>

            <div class="footer">
                <p>🚀 Desenvolvido por Lord Neco</p>
                <p>📊 Status da API: <span class="status"></span> <span id="statusTexto">Online</span></p>
                <p>© 2026 - API do Portfólio</p>
            </div>
        </div>

        <script>
            function irParaAdmin() {
                window.location.href = '/login';
            }
        </script>
    </body>
    </html>
  `);
});

// ============ ROTAS DA API ============

// 1. GET - Listar todos os projetos
app.get('/projetos', (req, res) => {
  db.all('SELECT * FROM projetos ORDER BY id', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 2. GET - Buscar projeto por ID
app.get('/projetos/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM projetos WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }
    res.json(row);
  });
});

// 3. POST - Criar novo projeto COM UPLOAD DE IMAGEM
app.post('/projetos', upload.single('imagem'), (req, res) => {
  try {
    const { nome, descricao, githubLink, liveLink } = req.body;
    
    if (!nome || !descricao || !githubLink || !liveLink) {
      res.status(400).json({ error: 'Campos obrigatórios: nome, descricao, githubLink, liveLink' });
      return;
    }
    
    if (!req.file) {
      res.status(400).json({ error: 'Imagem é obrigatória' });
      return;
    }
    
    const imagemPath = `/src/imagensprojetos/${req.file.filename}`;
    
    const sql = `
      INSERT INTO projetos (nome, descricao, imagem, githubLink, liveLink)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [nome, descricao, imagemPath, githubLink, liveLink], function(err) {
      if (err) {
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.status(201).json({
        id: this.lastID,
        nome,
        descricao,
        imagem: imagemPath,
        githubLink,
        liveLink
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. PUT - Atualizar projeto COM OU SEM UPLOAD DE IMAGEM
app.put('/projetos/:id', upload.single('imagem'), (req, res) => {
  const { id } = req.params;
  const { nome, descricao, githubLink, liveLink } = req.body;
  
  db.get('SELECT * FROM projetos WHERE id = ?', [id], (err, projeto) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!projeto) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }
    
    let imagemPath = projeto.imagem;
    
    if (req.file) {
      if (projeto.imagem) {
        const oldImagePath = path.join(__dirname, projeto.imagem);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      imagemPath = `/src/imagensprojetos/${req.file.filename}`;
    }
    
    const sql = `
      UPDATE projetos 
      SET nome = ?, descricao = ?, imagem = ?, githubLink = ?, liveLink = ?
      WHERE id = ?
    `;
    
    db.run(sql, [nome, descricao, imagemPath, githubLink, liveLink, id], function(err) {
      if (err) {
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Projeto não encontrado' });
        return;
      }
      
      res.json({ message: 'Projeto atualizado com sucesso' });
    });
  });
});

// 5. DELETE - Remover projeto E SUA IMAGEM
app.delete('/projetos/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT imagem FROM projetos WHERE id = ?', [id], (err, projeto) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!projeto) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }
    
    db.run('DELETE FROM projetos WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (projeto.imagem) {
        const imagePath = path.join(__dirname, projeto.imagem);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      
      res.json({ message: 'Projeto removido com sucesso' });
    });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📁 Pasta de imagens: ${path.join(__dirname, 'src', 'imagensprojetos')}`);
  console.log(`📋 Para ver os projetos, acesse: http://localhost:${PORT}/projetos`);
  console.log(`🔐 Painel admin: http://localhost:${PORT}/login`);
});