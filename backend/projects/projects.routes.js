const express = require('express');
const router = express.Router();
const { query, get, run } = require('../../database/db.js');
const { requireAuth, requireAdmin } = require('../auth/auth.middleware.js');
const { recalculateCourseProgress } = require('../progress/progress.service.js');

// GET /api/projects/my-portfolio - Retorna os projetos submetidos pelo aluno
router.get('/my-portfolio', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const portfolio = query(
      `SELECT up.*, p.nome as projeto_nome, p.categoria, c.titulo as curso_titulo, c.software_area
       FROM user_projects up
       JOIN projects p ON up.project_id = p.id
       JOIN courses c ON up.curso_id = c.id
       WHERE up.user_id = ?
       ORDER BY up.created_at DESC`,
      [userId]
    );

    return res.json(portfolio);
  } catch (err) {
    console.error('Erro ao buscar portfólio:', err);
    return res.status(500).json({ error: 'Erro ao carregar itens do portfólio.' });
  }
});

// GET /api/projects/course/:courseId - Lista os projetos propostos de um curso
router.get('/course/:courseId', requireAuth, (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const projects = query('SELECT * FROM projects WHERE curso_id = ?', [courseId]);

    const enriched = projects.map(p => {
      const userSub = get(
        'SELECT * FROM user_projects WHERE user_id = ? AND project_id = ? ORDER BY id DESC LIMIT 1',
        [userId, p.id]
      );
      return {
        ...p,
        minha_submissao: userSub || null
      };
    });

    return res.json(enriched);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar projetos do curso.' });
  }
});

// POST /api/projects/submit - Aluno submete ou atualiza projeto prático
router.post('/submit', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const { projectId, cursoId, titulo, descricao, imagemUrl, arquivoUrl } = req.body;

    if (!projectId || !cursoId || !titulo || !imagemUrl) {
      return res.status(400).json({ error: 'Campos obrigatórios: projectId, cursoId, titulo e imagemUrl.' });
    }

    const existing = get(
      'SELECT id FROM user_projects WHERE user_id = ? AND project_id = ?',
      [userId, projectId]
    );

    if (existing) {
      run(
        `UPDATE user_projects SET
          titulo = ?,
          descricao = ?,
          imagem_url = ?,
          arquivo_url = ?,
          status = 'enviado',
          data_envio = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [titulo, descricao || '', imagemUrl, arquivoUrl || '', existing.id]
      );
    } else {
      run(
        `INSERT INTO user_projects (
          user_id, project_id, curso_id, titulo, descricao, imagem_url, arquivo_url, status, data_envio
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'enviado', CURRENT_TIMESTAMP)`,
        [userId, projectId, cursoId, titulo, descricao || '', imagemUrl, arquivoUrl || '']
      );
    }

    // Seção 29 & 33: Histórico e Notificação
    const course = get('SELECT titulo FROM courses WHERE id = ?', [cursoId]);
    const cursoNome = course ? course.titulo : 'Curso';
    run(
      'INSERT INTO user_history (user_id, tipo, titulo, descricao, curso_id, aula_id) VALUES (?, ?, ?, ?, ?, NULL)',
      [userId, 'projeto_enviado', 'Projeto Submetido', `${cursoNome} — ${titulo}`, cursoId]
    );
    run(
      'INSERT INTO notifications (user_id, titulo, mensagem, tipo, link) VALUES (?, ?, ?, ?, ?)',
      [userId, '📝 Projeto em Avaliação', `Seu projeto "${titulo}" foi enviado para a banca e está em análise.`, 'info', 'portfolio']
    );

    return res.json({ message: 'Projeto submetido com sucesso para avaliação dos professores!' });
  } catch (err) {
    console.error('Erro ao submeter projeto:', err);
    return res.status(500).json({ error: 'Erro ao registrar submissão de projeto.' });
  }
});

// PUT /api/projects/:id/evaluate - Admin avalia projeto
router.put('/:id/evaluate', requireAdmin, (req, res) => {
  try {
    const userProjectId = req.params.id;
    const { status, feedback, nota } = req.body;

    if (!['aprovado', 'precisa_ajustes'].includes(status)) {
      return res.status(400).json({ error: 'Status deve ser "aprovado" ou "precisa_ajustes".' });
    }

    const projectRow = get('SELECT user_id, curso_id, titulo FROM user_projects WHERE id = ?', [userProjectId]);
    if (!projectRow) {
      return res.status(404).json({ error: 'Submissão de projeto não encontrada.' });
    }

    run(
      `UPDATE user_projects SET
        status = ?,
        feedback_admin = ?,
        nota = ?,
        data_aprovacao = CASE WHEN ? = 'aprovado' THEN CURRENT_TIMESTAMP ELSE NULL END
      WHERE id = ?`,
      [status, feedback || '', nota || null, status, userProjectId]
    );

    // Se aprovado, recalcula o progresso do aluno no curso!
    const updatedProgress = recalculateCourseProgress(projectRow.user_id, projectRow.curso_id);

    // Notificar aluno
    const isApproved = status === 'aprovado';
    run(
      'INSERT INTO notifications (user_id, titulo, mensagem, tipo, link) VALUES (?, ?, ?, ?, ?)',
      [
        projectRow.user_id,
        isApproved ? '🏆 Projeto Aprovado!' : '⚠️ Ajustes Solicitados no Projeto',
        isApproved
          ? `Parabéns! Seu projeto "${projectRow.titulo}" foi aprovado com nota ${nota || 100} e está no seu portfólio!`
          : `O professor avaliou seu projeto "${projectRow.titulo}". Veja os apontamentos de melhoria no seu portfólio.`,
        isApproved ? 'success' : 'warning',
        'portfolio'
      ]
    );

    return res.json({
      message: 'Avaliação registrada com sucesso.',
      progressoAtualizado: updatedProgress
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao avaliar projeto.' });
  }
});

module.exports = router;
