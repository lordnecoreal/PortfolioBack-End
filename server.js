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
            .btn {
                display: inline-block;
                background: #667eea;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 10px;
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
            
            <h2>🔍 Painel Administrativo</h2>
            <p>Acesse o painel para gerenciar seus projetos:</p>
            <a href="/login" class="btn">🔐 Acessar Painel Admin</a>
            
            <hr>
            
            <h2>📡 Outros exemplos</h2>
            <div class="exemplo">
                📋 Buscar projeto específico:<br>
                <code>http://localhost:3000/projetos/1</code>
            </div>
            
            <div class="exemplo">
                🖼️ Ver uma imagem:<br>
                <code>http://localhost:3000/src/imagensprojetos/desafiofinal.png</code>
            </div>
            
            <div class="footer">
                <p>🚀 Desenvolvido por Lord Neco</p>
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

// 3. POST - Criar novo projeto COM UPLOAD DE IMAGEM
app.post('/projetos', upload.single('imagem'), (req, res) => {
  try {
    const { nome, descricao, githubLink, liveLink } = req.body;
    
    // Validar campos obrigatórios
    if (!nome || !descricao || !githubLink || !liveLink) {
      res.status(400).json({ error: 'Campos obrigatórios: nome, descricao, githubLink, liveLink' });
      return;
    }
    
    // Validar se arquivo foi enviado
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
        // Se der erro, deletar arquivo de imagem
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
  
  // Primeiro, buscar o projeto atual
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
    
    // Se nova imagem foi enviada
    if (req.file) {
      // Deletar imagem antiga se existir
      if (projeto.imagem) {
        const oldImagePath = path.join(__dirname, projeto.imagem);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log(`🗑️ Imagem antiga deletada: ${oldImagePath}`);
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
        // Se houve upload de imagem e deu erro, deletar a nova imagem
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
  
  // Buscar o projeto para pegar o caminho da imagem
  db.get('SELECT imagem FROM projetos WHERE id = ?', [id], (err, projeto) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!projeto) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }
    
    // Deletar do banco
    db.run('DELETE FROM projetos WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Deletar arquivo de imagem se existir
      if (projeto.imagem) {
        const imagePath = path.join(__dirname, projeto.imagem);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log(`🗑️ Imagem deletada: ${imagePath}`);
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