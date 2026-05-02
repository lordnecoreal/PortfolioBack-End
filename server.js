const express = require('express');
const cors = require('cors');
const db = require('./database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

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
    const originalName = file.originalname;
    cb(null, originalName);
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

// Servir arquivos estáticos (imagens)
app.use('/src/imagensprojetos', express.static(path.join(__dirname, 'src', 'imagensprojetos')));

// ============ ROTA PRINCIPAL - PÁGINA SIMPLIFICADA ============
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API do Portfólio - Lord Neco</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 50px auto;
                padding: 20px;
                text-align: center;
                background: #1a1a1a;
                color: #fff;
            }
            .container {
                background: #2d2d2d;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            }
            h1 {
                color: #667eea;
                margin-bottom: 10px;
            }
            .url {
                background: #1a1a1a;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
                font-family: monospace;
                font-size: 18px;
                word-break: break-all;
            }
            .url span {
                color: #4CAF50;
            }
            .exemplo {
                background: #1a1a1a;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                font-size: 14px;
                margin: 10px 0;
            }
            code {
                background: #1a1a1a;
                padding: 2px 5px;
                border-radius: 3px;
                color: #ff6b6b;
            }
            .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #888;
            }
            hr {
                border-color: #444;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎨 API do Portfólio</h1>
            <p>Lord Neco</p>
            
            <hr>
            
            <h2>📌 Como acessar os dados</h2>
            <p>Para visualizar todos os projetos, adicione <code>/projetos</code> no final da URL:</p>
            
            <div class="url">
                <span>URL atual:</span> http://localhost:3000<br>
                <span>URL com dados:</span> http://localhost:3000/<strong style="color:#4CAF50">projetos</strong>
            </div>
            
            <div class="exemplo">
                💡 Exemplo: <strong>http://localhost:3000/projetos</strong>
            </div>
            
            <hr>
            
            <h2>🔍 Outros exemplos</h2>
            <div class="exemplo">
                📋 Buscar projeto específico:<br>
                <code>http://localhost:3000/projetos/1</code>
            </div>
            
            <div class="exemplo">
                🖼️ Ver uma imagem:<br>
                <code>http://localhost:3000/src/imagensprojetos/desafiofinal.png</code>
            </div>
            
            <div class="footer">
                <p>🚀 Para adicionar, editar ou deletar projetos, utilize o <strong>Postman</strong></p>
                <p>© 2026 - API do Portfólio</p>
            </div>
        </div>
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

// 3. POST - Criar novo projeto
app.post('/projetos', (req, res) => {
  const { nome, descricao, imagem, fallback, githubLink, liveLink } = req.body;
  
  if (!nome || !descricao || !imagem || !fallback || !githubLink || !liveLink) {
    res.status(400).json({ error: 'Todos os campos são obrigatórios: nome, descricao, imagem, fallback, githubLink, liveLink' });
    return;
  }
  
  const sql = `
    INSERT INTO projetos (nome, descricao, imagem, fallback, githubLink, liveLink)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(sql, [nome, descricao, imagem, fallback, githubLink, liveLink], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.status(201).json({
      id: this.lastID,
      nome,
      descricao,
      imagem,
      fallback,
      githubLink,
      liveLink
    });
  });
});

// 4. PUT - Atualizar projeto
app.put('/projetos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, descricao, imagem, fallback, githubLink, liveLink } = req.body;
  
  const sql = `
    UPDATE projetos 
    SET nome = ?, descricao = ?, imagem = ?, fallback = ?, githubLink = ?, liveLink = ?
    WHERE id = ?
  `;
  
  db.run(sql, [nome, descricao, imagem, fallback, githubLink, liveLink, id], function(err) {
    if (err) {
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

// 5. DELETE - Remover projeto
app.delete('/projetos/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM projetos WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }
    
    res.json({ message: 'Projeto removido com sucesso' });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📁 Pasta de imagens: ${path.join(__dirname, 'src', 'imagensprojetos')}`);
  console.log(`📋 Para ver os projetos, acesse: http://localhost:${PORT}/projetos`);
});