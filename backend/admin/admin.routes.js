const express = require('express');
const router = express.Router();
const { query, get, run } = require('../../database/db.js');
const { requireAdmin } = require('../auth/auth.middleware.js');

// Protege todas as rotas deste router para uso exclusivo do admin
router.use(requireAdmin);

// GET /api/admin/metrics - Estatísticas gerais e saúde da escola
router.get('/metrics', (req, res) => {
  try {
    const totalAlunos = get("SELECT COUNT(*) as count FROM users WHERE papel = 'aluno'").count;
    const totalCursos = get('SELECT COUNT(*) as count FROM courses').count;
    const totalAulas = get('SELECT COUNT(*) as count FROM lessons').count;
    const totalExercicios = get('SELECT COUNT(*) as count FROM exercises').count;
    const totalQuizzes = get('SELECT COUNT(*) as count FROM quizzes').count;
    const totalProjetosEnviados = get('SELECT COUNT(*) as count FROM user_projects').count;
    const totalCertificadosEmitidos = get('SELECT COUNT(*) as count FROM certificates').count;
    const totalDuvidasAtendidas = get('SELECT COUNT(*) as count FROM help_queries').count;

    // Média de horas de estudo
    const mediaHorasRow = get('SELECT AVG(horas_estudadas) as media FROM course_progress');
    const mediaHoras = mediaHorasRow && mediaHorasRow.media ? Math.round(mediaHorasRow.media * 10) / 10 : 0;

    return res.json({
      totalAlunos,
      totalCursos,
      totalAulas,
      totalExercicios,
      totalQuizzes,
      totalProjetosEnviados,
      totalCertificadosEmitidos,
      totalDuvidasAtendidas,
      mediaHoras
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao compilar métricas administrativas.' });
  }
});

// GET /api/admin/users-progress - Acompanhamento individual dos alunos (nunca competitivo)
router.get('/users-progress', (req, res) => {
  try {
    const alunos = query("SELECT id, nome, login, foto, data_entrada, created_at FROM users WHERE papel = 'aluno' ORDER BY id ASC");

    const alunosComProgresso = alunos.map(aluno => {
      const cursosProgresso = query(
        `SELECT cp.*, c.titulo as curso_titulo, c.software_area
         FROM course_progress cp
         JOIN courses c ON cp.curso_id = c.id
         WHERE cp.user_id = ?`,
        [aluno.id]
      );

      const projetosSubmetidos = query(
        `SELECT up.*, p.nome as projeto_nome, c.titulo as curso_titulo
         FROM user_projects up
         JOIN projects p ON up.project_id = p.id
         JOIN courses c ON up.curso_id = c.id
         WHERE up.user_id = ?`,
        [aluno.id]
      );

      const certificados = query('SELECT id, codigo_unico, carga_horaria, data_emissao FROM certificates WHERE user_id = ?', [aluno.id]);

      return {
        ...aluno,
        cursos: cursosProgresso,
        projetos: projetosSubmetidos,
        certificados
      };
    });

    return res.json(alunosComProgresso);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar acompanhamento de alunos.' });
  }
});

// GET /api/admin/updates - Monitoramento de versões de software e aulas afetadas
router.get('/updates', (req, res) => {
  try {
    const updates = query('SELECT * FROM software_updates ORDER BY data_lancamento DESC');
    return res.json(updates);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar atualizações de software.' });
  }
});

// POST /api/admin/updates - Cadastrar nova versão de software e marcar aulas impactadas
router.post('/updates', (req, res) => {
  try {
    const { software, versao, data_lancamento, mudancas, aulas_afetadas, status_revisao } = req.body;
    if (!software || !versao || !mudancas) {
      return res.status(400).json({ error: 'Campos software, versao e mudancas são obrigatórios.' });
    }

    run(
      `INSERT INTO software_updates (software, versao, data_lancamento, mudancas, aulas_afetadas, status_revisao)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [software, versao, data_lancamento || new Date().toISOString().split('T')[0], mudancas, aulas_afetadas || '', status_revisao || 'pendente']
    );

    return res.json({ message: 'Registro de atualização cadastrado com sucesso!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao cadastrar atualização de software.' });
  }
});

// ==========================================
// SEÇÃO 30: GERENCIAMENTO DE USUÁRIOS PELO ADMINISTRADOR
// ==========================================
// GET /api/admin/users - Lista todos os usuários
router.get('/users', (req, res) => {
  try {
    const users = query('SELECT id, nome, login, foto, bio, papel, is_ativo, data_entrada, created_at FROM users ORDER BY id ASC');
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao listar usuários.' });
  }
});

// POST /api/admin/users - Criação de usuário pelo administrador (Seção 1, 30)
router.post('/users', (req, res) => {
  try {
    const { nome, login, senha, papel, bio, foto } = req.body;
    if (!nome || !login || !senha) {
      return res.status(400).json({ error: 'Nome, login/email e senha são obrigatórios.' });
    }

    const existing = get('SELECT id FROM users WHERE login = ?', [login.trim().toLowerCase()]);
    if (existing) {
      return res.status(400).json({ error: 'Este login já está cadastrado na plataforma.' });
    }

    const { hashPassword } = require('../auth/auth.service.js');
    const senhaHash = hashPassword(senha);
    const papelFinal = papel === 'admin' ? 'admin' : 'aluno';
    const fotoFinal = foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=6366f1&color=fff`;

    run(
      `INSERT INTO users (nome, login, senha_hash, foto, bio, papel, is_ativo, data_entrada)
       VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      [nome.trim(), login.trim().toLowerCase(), senhaHash, fotoFinal, bio || '', papelFinal]
    );

    const novoId = get('SELECT last_insert_rowid() as id').id;
    const novoUsuario = get('SELECT id, nome, login, foto, bio, papel, is_ativo, data_entrada FROM users WHERE id = ?', [novoId]);

    return res.status(201).json({ user: novoUsuario, message: 'Usuário criado com sucesso pelo administrador!' });
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    return res.status(500).json({ error: 'Erro ao cadastrar novo usuário.' });
  }
});

// PUT /api/admin/users/:id - Editar usuário
router.put('/users/:id', (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { nome, login, senha, papel, bio, is_ativo, foto } = req.body;

    const user = get('SELECT * FROM users WHERE id = ?', [targetUserId]);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    let senhaHash = user.senha_hash;
    if (senha && senha.trim().length >= 4) {
      const { hashPassword } = require('../auth/auth.service.js');
      senhaHash = hashPassword(senha);
    }

    run(
      `UPDATE users SET
         nome = COALESCE(?, nome),
         login = COALESCE(?, login),
         senha_hash = ?,
         papel = COALESCE(?, papel),
         bio = COALESCE(?, bio),
         is_ativo = COALESCE(?, is_ativo),
         foto = COALESCE(?, foto)
       WHERE id = ?`,
      [
        nome || null,
        login ? login.trim().toLowerCase() : null,
        senhaHash,
        papel || null,
        bio !== undefined ? bio : null,
        is_ativo !== undefined ? is_ativo : null,
        foto || null,
        targetUserId
      ]
    );

    const updated = get('SELECT id, nome, login, foto, bio, papel, is_ativo, data_entrada FROM users WHERE id = ?', [targetUserId]);
    return res.json({ user: updated, message: 'Dados do usuário atualizados com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar dados do usuário.' });
  }
});

// DELETE /api/admin/users/:id - Desativação de usuário pelo administrador
router.delete('/users/:id', (req, res) => {
  try {
    const targetUserId = req.params.id;
    if (parseInt(targetUserId) === req.user.id) {
      return res.status(400).json({ error: 'Você não pode desativar seu próprio usuário administrador.' });
    }

    const user = get('SELECT id, is_ativo FROM users WHERE id = ?', [targetUserId]);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const novoStatus = user.is_ativo ? 0 : 1;
    run('UPDATE users SET is_ativo = ? WHERE id = ?', [novoStatus, targetUserId]);

    return res.json({
      message: novoStatus === 0 ? 'Usuário desativado com sucesso.' : 'Usuário reativado com sucesso.',
      is_ativo: novoStatus
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao alterar status do usuário.' });
  }
});

module.exports = router;
