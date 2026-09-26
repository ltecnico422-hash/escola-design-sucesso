const express = require('express');
const router = express.Router();
const { query, get, run } = require('../../database/db.js');
const { requireAuth } = require('../auth/auth.middleware.js');
const { recalculateCourseProgress } = require('./progress.service.js');

// GET /api/progress/summary - Estatísticas gerais reais do aluno
router.get('/summary', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;

    const progresses = query(
      `SELECT cp.*, c.titulo, c.software_area, c.cor_tema, c.slug, c.icone
       FROM course_progress cp
       JOIN courses c ON cp.curso_id = c.id
       WHERE cp.user_id = ?`,
      [userId]
    );

    let totalHoras = 0;
    let cursosConcluidos = 0;
    let cursosEmAndamento = 0;
    let exerciciosFeitos = 0;
    let projetosAprovados = 0;

    progresses.forEach(p => {
      totalHoras += p.horas_estudadas || 0;
      if (p.percentual_calculado >= 100) {
        cursosConcluidos++;
      } else if (p.percentual_calculado > 0) {
        cursosEmAndamento++;
      }
      exerciciosFeitos += p.exercicios_concluidos || 0;
      projetosAprovados += p.projetos_concluidos || 0;
    });

    const certCountRow = get('SELECT COUNT(*) as count FROM certificates WHERE user_id = ?', [userId]);
    const certificadosTotal = certCountRow ? certCountRow.count : 0;

    // Progresso global ponderado médio
    const totalCursosTotal = get("SELECT COUNT(*) as count FROM courses WHERE status = 'publicado'").count;
    const somaPercentuais = progresses.reduce((acc, curr) => acc + curr.percentual_calculado, 0);
    const progressoGeral = totalCursosTotal > 0 ? Math.round((somaPercentuais / totalCursosTotal) * 10) / 10 : 0;

    return res.json({
      totalHoras: Math.round(totalHoras * 10) / 10,
      cursosConcluidos,
      cursosEmAndamento,
      exerciciosFeitos,
      projetosAprovados,
      certificadosTotal,
      progressoGeral,
      cursos: progresses
    });
  } catch (err) {
    console.error('Erro ao buscar resumo de progresso:', err);
    return res.status(500).json({ error: 'Erro ao calcular resumo de progresso.' });
  }
});

// GET /api/progress/track - Trilha de formação visual com estados reais
router.get('/track', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const courses = query("SELECT * FROM courses WHERE status = 'publicado' ORDER BY ordem_trilha ASC");

    let previousCompleted = true; // O primeiro sempre está disponível

    const track = courses.map((c, index) => {
      const prog = get(
        'SELECT percentual_calculado FROM course_progress WHERE user_id = ? AND curso_id = ?',
        [userId, c.id]
      );
      const percentual = prog ? prog.percentual_calculado : 0;

      let estado = 'bloqueado';

      if (percentual >= 100) {
        estado = 'concluido';
      } else if (percentual > 0) {
        estado = 'em_andamento';
      } else if (previousCompleted || index === 0) {
        estado = 'recomendado';
      } else {
        estado = 'bloqueado';
      }

      // Se este curso não estiver concluído, o próximo ficará bloqueado na trilha estrita
      previousCompleted = (percentual >= 100);

      return {
        ...c,
        percentual,
        estado
      };
    });

    return res.json(track);
  } catch (err) {
    console.error('Erro na trilha de formação:', err);
    return res.status(500).json({ error: 'Erro ao carregar trilha de formação.' });
  }
});

// GET /api/progress/continue - Seção 8: Continuação Automática ("Continue de onde você parou")
router.get('/continue', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const user = get('SELECT ultima_aula_id FROM users WHERE id = ?', [userId]);

    let targetLessonId = user ? user.ultima_aula_id : null;

    if (!targetLessonId) {
      const lastProg = get(
        'SELECT ultima_aula_id FROM course_progress WHERE user_id = ? AND ultima_aula_id IS NOT NULL ORDER BY ultimo_acesso DESC LIMIT 1',
        [userId]
      );
      if (lastProg) targetLessonId = lastProg.ultima_aula_id;
    }

    if (!targetLessonId) {
      const firstLesson = get(
        `SELECT l.id FROM lessons l
         JOIN modules m ON l.modulo_id = m.id
         JOIN courses c ON m.curso_id = c.id
         ORDER BY c.ordem_trilha ASC, m.ordem ASC, l.ordem ASC LIMIT 1`
      );
      if (firstLesson) targetLessonId = firstLesson.id;
    }

    if (!targetLessonId) {
      return res.json({ disponivel: false });
    }

    const lesson = get(
      `SELECT l.id, l.titulo, l.ordem as aula_ordem, l.duracao_minutos,
              m.id as modulo_id, m.titulo as modulo_titulo, m.ordem as modulo_ordem,
              c.id as curso_id, c.titulo as curso_titulo, c.software_area, c.slug as curso_slug, c.cor_tema
       FROM lessons l
       JOIN modules m ON l.modulo_id = m.id
       JOIN courses c ON m.curso_id = c.id
       WHERE l.id = ?`,
      [targetLessonId]
    );

    if (!lesson) {
      return res.json({ disponivel: false });
    }

    return res.json({
      disponivel: true,
      aula: lesson,
      resumo: `${lesson.curso_titulo} — Módulo ${lesson.modulo_ordem} — Aula ${lesson.aula_ordem}: ${lesson.titulo}`
    });
  } catch (err) {
    console.error('Erro na continuação automática:', err);
    return res.status(500).json({ error: 'Erro ao identificar ponto de continuação.' });
  }
});

// POST /api/progress/complete-lesson - Marca aula concluída e recalcula
router.post('/complete-lesson', requireAuth, (req, res) => {
  try {
    const { lessonId, cursoId } = req.body;
    const userId = req.user.id;

    if (!lessonId || !cursoId) {
      return res.status(400).json({ error: 'lessonId e cursoId são obrigatórios.' });
    }

    const existing = get(
      'SELECT id, concluida FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?',
      [userId, lessonId]
    );

    let isNowCompleted = false;

    if (existing) {
      const novoStatus = existing.concluida ? 0 : 1;
      isNowCompleted = novoStatus === 1;
      run(
        'UPDATE user_lesson_progress SET concluida = ?, data_conclusao = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id = ?',
        [novoStatus, novoStatus, existing.id]
      );
    } else {
      isNowCompleted = true;
      run(
        'INSERT INTO user_lesson_progress (user_id, lesson_id, curso_id, concluida, data_conclusao) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)',
        [userId, lessonId, cursoId]
      );
    }

    // Seção 8: Memorizar última aula acessada
    run('UPDATE users SET ultima_aula_id = ? WHERE id = ?', [lessonId, userId]);

    // Seção 29: Registrar no histórico do aluno
    if (isNowCompleted) {
      const lessonInfo = get(
        `SELECT l.titulo as aula_titulo, c.titulo as curso_titulo
         FROM lessons l
         JOIN modules m ON l.modulo_id = m.id
         JOIN courses c ON m.curso_id = c.id
         WHERE l.id = ?`,
        [lessonId]
      );
      if (lessonInfo) {
        run(
          'INSERT INTO user_history (user_id, tipo, titulo, descricao, curso_id, aula_id) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, 'aula_concluida', 'Aula Concluída', `${lessonInfo.curso_titulo} — ${lessonInfo.aula_titulo}`, cursoId, lessonId]
        );
      }
    }

    const updatedProgress = recalculateCourseProgress(userId, cursoId);

    return res.json({
      message: 'Progresso da aula atualizado com sucesso.',
      progresso: updatedProgress
    });
  } catch (err) {
    console.error('Erro ao completar aula:', err);
    return res.status(500).json({ error: 'Erro ao registrar conclusão da aula.' });
  }
});

// POST /api/progress/complete-exercise - Envia resposta do exercício e recalcula
router.post('/complete-exercise', requireAuth, (req, res) => {
  try {
    const { exerciseId, cursoId, resposta } = req.body;
    const userId = req.user.id;

    if (!exerciseId || !cursoId) {
      return res.status(400).json({ error: 'exerciseId e cursoId são obrigatórios.' });
    }

    const existing = get(
      'SELECT id FROM user_exercise_progress WHERE user_id = ? AND exercise_id = ?',
      [userId, exerciseId]
    );

    if (existing) {
      run(
        'UPDATE user_exercise_progress SET concluido = 1, resposta_aluno = ?, data_conclusao = CURRENT_TIMESTAMP WHERE id = ?',
        [resposta || '', existing.id]
      );
    } else {
      run(
        'INSERT INTO user_exercise_progress (user_id, exercise_id, curso_id, concluido, resposta_aluno, data_conclusao) VALUES (?, ?, ?, 1, ?, CURRENT_TIMESTAMP)',
        [userId, exerciseId, cursoId, resposta || '']
      );
    }

    // Seção 29: Registrar no histórico do aluno
    const exInfo = get(
      `SELECT e.titulo as exercicio_titulo, e.aula_id, c.titulo as curso_titulo
       FROM exercises e
       JOIN lessons l ON e.aula_id = l.id
       JOIN modules m ON l.modulo_id = m.id
       JOIN courses c ON m.curso_id = c.id
       WHERE e.id = ?`,
      [exerciseId]
    );
    if (exInfo) {
      run(
        'INSERT INTO user_history (user_id, tipo, titulo, descricao, curso_id, aula_id) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, 'exercicio_entregue', 'Exercício Prático Concluído', `${exInfo.curso_titulo} — ${exInfo.exercicio_titulo}`, cursoId, exInfo.aula_id]
      );
    }

    const updatedProgress = recalculateCourseProgress(userId, cursoId);

    return res.json({
      message: 'Exercício registrado e progresso recalculado.',
      progresso: updatedProgress
    });
  } catch (err) {
    console.error('Erro ao completar exercício:', err);
    return res.status(500).json({ error: 'Erro ao salvar exercício.' });
  }
});

// POST /api/progress/toggle-review - Marca curso para Modo Revisar
router.post('/toggle-review', requireAuth, (req, res) => {
  try {
    const { cursoId } = req.body;
    const userId = req.user.id;

    const row = get('SELECT id, marcado_revisao FROM course_progress WHERE user_id = ? AND curso_id = ?', [userId, cursoId]);
    if (!row) {
      run(
        'INSERT INTO course_progress (user_id, curso_id, marcado_revisao) VALUES (?, ?, 1)',
        [userId, cursoId]
      );
      return res.json({ marcado: true });
    }

    const novoEstado = row.marcado_revisao ? 0 : 1;
    run('UPDATE course_progress SET marcado_revisao = ? WHERE id = ?', [novoEstado, row.id]);
    return res.json({ marcado: Boolean(novoEstado) });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao alterar modo revisão.' });
  }
});

// GET /api/progress/recommendation - Sugere próximo conteúdo ou revisão construtiva
router.get('/recommendation', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;

    // Verifica se há cursos em andamento
    const emAndamento = get(
      `SELECT c.id, c.titulo, c.slug, cp.percentual_calculado, cp.marcado_revisao
       FROM course_progress cp
       JOIN courses c ON cp.curso_id = c.id
       WHERE cp.user_id = ? AND cp.percentual_calculado > 0 AND cp.percentual_calculado < 100
       ORDER BY cp.ultimo_acesso DESC LIMIT 1`,
      [userId]
    );

    if (emAndamento) {
      // Procura a próxima aula não concluída
      const proximaAula = get(
        `SELECT l.id, l.titulo, m.titulo as modulo_titulo
         FROM lessons l
         JOIN modules m ON l.modulo_id = m.id
         WHERE m.curso_id = ?
           AND l.id NOT IN (SELECT lesson_id FROM user_lesson_progress WHERE user_id = ? AND concluida = 1)
         ORDER BY m.ordem ASC, l.ordem ASC LIMIT 1`,
        [emAndamento.id, userId]
      );

      return res.json({
        tipo: emAndamento.marcado_revisao ? 'revisao_sugerida' : 'continuar_estudo',
        curso: emAndamento,
        proximaAula: proximaAula || null,
        mensagem: emAndamento.marcado_revisao
          ? `Sugerimos revisar os pontos-chave de "${emAndamento.titulo}" para consolidar os conceitos com segurança.`
          : `Continue de onde parou em "${emAndamento.titulo}"!`
      });
    }

    // Se nenhum em andamento, recomenda o primeiro curso da trilha
    const primeiro = get('SELECT id, titulo, slug, descricao FROM courses ORDER BY ordem_trilha ASC LIMIT 1');
    return res.json({
      tipo: 'iniciar_trilha',
      curso: primeiro,
      proximaAula: null,
      mensagem: `Dê o primeiro passo na sua formação com "${primeiro.titulo}"!`
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao gerar recomendações.' });
  }
});

module.exports = router;
