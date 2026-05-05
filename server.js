const express = require('express');
const cors = require('cors');
const db = require('./database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações de autenticação - Usa variáveis de ambiente
const ADMIN_USER = process.env.ADMIN_USER || 'lordneco';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const API_SECRET = process.env.API_SECRET || 'goticorj';

// Configurar Cloudinary com as variáveis de ambiente
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middlewares
app.use(cors());
app.use(express.json());

// Configuração do multer para upload temporário (antes de enviar ao Cloudinary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'temp');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'temp-' + uniqueSuffix + ext);
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

// ============ MIDDLEWARE DE AUTENTICAÇÃO ============
function autenticarAdmin(req, res, next) {
    const token = req.headers['authorization'];
    const usuarioLogado = req.headers['x-user'];
    
    if (!token || !usuarioLogado) {
        return res.status(401).json({ error: 'Não autorizado. Faça login primeiro.' });
    }
    
    if (usuarioLogado === ADMIN_USER && token === API_SECRET) {
        next();
    } else {
        res.status(403).json({ error: 'Acesso negado. Você não tem permissão.' });
    }
}

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

// ============ ROTA PRINCIPAL - PÁGINA INICIAL ============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'front', 'index.html'));
});

// ============ ROTA DE AUTENTICAÇÃO ============
app.post('/auth/login', (req, res) => {
  const { usuario, senha } = req.body;
  
  if (!ADMIN_PASSWORD) {
    console.error('⚠️ SENHA NÃO CONFIGURADA no Render!');
    return res.status(500).json({ error: 'Erro na configuração do servidor' });
  }
  
  if (usuario === ADMIN_USER && senha === ADMIN_PASSWORD) {
    res.json({ 
      success: true, 
      token: API_SECRET,
      usuario: usuario 
    });
  } else {
    res.status(401).json({ error: 'Usuário ou senha inválidos' });
  }
});

// ============ ROTAS DA API ============

// 1. GET - Listar todos os projetos (PÚBLICO)
app.get('/projetos', (req, res) => {
  db.all('SELECT * FROM projetos ORDER BY id', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// 2. GET - Buscar projeto por ID (PÚBLICO)
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

// 3. POST - Criar novo projeto COM CLOUDINARY
app.post('/projetos', autenticarAdmin, upload.single('imagem'), async (req, res) => {
  let tempFilePath = null;
  
  try {
    const { nome, descricao, githubLink, liveLink } = req.body;
    
    if (!nome || !descricao || !githubLink || !liveLink) {
      // Limpar arquivo temporário se existir
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ error: 'Campos obrigatórios: nome, descricao, githubLink, liveLink' });
      return;
    }
    
    if (!req.file) {
      res.status(400).json({ error: 'Imagem é obrigatória' });
      return;
    }
    
    tempFilePath = req.file.path;
    
    // Upload para o Cloudinary
    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder: 'portfolio-projetos',
      transformation: [
        { width: 800, height: 600, crop: 'limit' }
      ]
    });
    
    const imagemUrl = result.secure_url;
    
    // Limpar arquivo temporário
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    
    const sql = `
      INSERT INTO projetos (nome, descricao, imagem, githubLink, liveLink)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.run(sql, [nome, descricao, imagemUrl, githubLink, liveLink], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.status(201).json({
        id: this.lastID,
        nome,
        descricao,
        imagem: imagemUrl,
        githubLink,
        liveLink
      });
    });
    
  } catch (error) {
    // Limpar arquivo temporário em caso de erro
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem: ' + error.message });
  }
});

// 4. PUT - Atualizar projeto COM CLOUDINARY
app.put('/projetos/:id', autenticarAdmin, upload.single('imagem'), async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, githubLink, liveLink } = req.body;
  let tempFilePath = null;
  
  db.get('SELECT * FROM projetos WHERE id = ?', [id], async (err, projeto) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!projeto) {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }
    
    let imagemUrl = projeto.imagem;
    
    // Se nova imagem foi enviada
    if (req.file) {
      tempFilePath = req.file.path;
      
      try {
        // Fazer upload da nova imagem
        const result = await cloudinary.uploader.upload(tempFilePath, {
          folder: 'portfolio-projetos',
          transformation: [
            { width: 800, height: 600, crop: 'limit' }
          ]
        });
        imagemUrl = result.secure_url;
        
        // Limpar arquivo temporário
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        
        // Opcional: deletar imagem antiga do Cloudinary (se for do Cloudinary)
        if (projeto.imagem && projeto.imagem.includes('cloudinary')) {
          try {
            const publicId = projeto.imagem.split('/').slice(-2).join('/').split('.')[0];
            await cloudinary.uploader.destroy(publicId);
          } catch (deleteError) {
            console.log('Não foi possível deletar imagem antiga:', deleteError);
          }
        }
        
      } catch (cloudinaryError) {
        // Limpar arquivo temporário em caso de erro
        if (tempFilePath && fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        console.error('Erro no upload:', cloudinaryError);
        res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
        return;
      }
    }
    
    const sql = `
      UPDATE projetos 
      SET nome = ?, descricao = ?, imagem = ?, githubLink = ?, liveLink = ?
      WHERE id = ?
    `;
    
    db.run(sql, [nome, descricao, imagemUrl, githubLink, liveLink, id], function(err) {
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
});

// 5. DELETE - Remover projeto (PROTEGIDO)
app.delete('/projetos/:id', autenticarAdmin, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT imagem FROM projetos WHERE id = ?', [id], async (err, projeto) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!projeto) {
      res.status(404).json({ error: 'Projeto não encontrado' });
      return;
    }
    
    // Deletar imagem do Cloudinary se existir
    if (projeto.imagem && projeto.imagem.includes('cloudinary')) {
      try {
        const publicId = projeto.imagem.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
        console.log(`🗑️ Imagem deletada do Cloudinary: ${publicId}`);
      } catch (cloudinaryError) {
        console.log('Erro ao deletar imagem do Cloudinary:', cloudinaryError);
      }
    }
    
    // Deletar do banco de dados
    db.run('DELETE FROM projetos WHERE id = ?', [id], function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({ message: 'Projeto removido com sucesso' });
    });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 Para ver os projetos, acesse: http://localhost:${PORT}/projetos`);
  console.log(`🔐 Painel admin: http://localhost:${PORT}/login`);
  console.log(`☁️ Cloudinary configurado: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Sim' : '❌ Não'}`);
});