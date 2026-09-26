const express = require('express');
const cors = require('cors');
const path = require('node:path');
const { initDb } = require('../database/db.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializa banco de dados e schema relacional
console.log('Verificando integridade do banco de dados relacional...');
initDb();

// Middlewares essenciais
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log leve de requisições
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (!req.url.startsWith('/css') && !req.url.startsWith('/js')) {
      console.log(`[${req.method}] ${req.url} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Importação e montagem modular das rotas da API
const authRoutes = require('./auth/auth.routes.js');
const coursesRoutes = require('./courses/courses.routes.js');
const progressRoutes = require('./progress/progress.routes.js');
const assessmentsRoutes = require('./assessments/assessments.routes.js');
const projectsRoutes = require('./projects/projects.routes.js');
const certificatesRoutes = require('./certificates/certificates.routes.js');
const helpRoutes = require('./help-center/help.routes.js');
const knowledgeRoutes = require('./knowledge-base/knowledge.routes.js');
const searchRoutes = require('./search/search.routes.js');
const adminRoutes = require('./admin/admin.routes.js');
const notesFavRoutes = require('./notes-favorites/notes-favorites.routes.js');

app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/assessments', assessmentsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/certificates', certificatesRoutes);
app.use('/api/help', helpRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', notesFavRoutes);

// Rota de Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    plataforma: 'Escola Digital de Design',
    versao: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Servir arquivos estáticos do frontend
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Fallback SPA: qualquer requisição GET que não seja da API serve o index.html
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(frontendPath, 'index.html');
    if (require('node:fs').existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

// Tratamento de erro 404 para rotas de API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint da API não encontrado.' });
});

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado na aplicação:', err);
  res.status(500).json({ error: 'Ocorreu um erro interno no servidor.' });
});

// Inicia o servidor se executado diretamente
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Escola Digital de Design - Servidor Ativo!`);
    console.log(`🔗 URL Local: http://localhost:${PORT}`);
    console.log(`📚 Banco Relacional: SQLite em database/escola_design.sqlite`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
