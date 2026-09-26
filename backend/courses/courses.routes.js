const express = require('express');
const router = express.Router();
const { query, get, run } = require('../../database/db.js');
const { optionalAuth, requireAdmin } = require('../auth/auth.middleware.js');

// GET /api/courses - Lista todos os cursos com métricas e progresso se autenticado
router.get('/', optionalAuth, (req, res) => {
  try {
    const { software_area, nivel } = req.query;
    let sql = "SELECT * FROM courses WHERE status = 'publicado'";
    const params = [];

    if (software_area) {
      sql += ' AND software_area = ?';
      params.push(software_area);
    }
    if (nivel) {
      sql += ' AND nivel_minimo = ?';
      params.push(nivel);
    }
    sql += ' ORDER BY ordem_trilha ASC';

    const courses = query(sql, params);

    const enrichedCourses = courses.map(course => {
      const moduleCount = get('SELECT COUNT(*) as count FROM modules WHERE curso_id = ?', [course.id]).count;
      const lessonCount = get(
        'SELECT COUNT(*) as count FROM lessons l JOIN modules m ON l.modulo_id = m.id WHERE m.curso_id = ?',
        [course.id]
      ).count;
      const projectCount = get('SELECT COUNT(*) as count FROM projects WHERE curso_id = ?', [course.id]).count;

      let progress = 0;
      let horasEstudadas = 0;
      let concluido = false;

      if (req.user) {
        const progRow = get(
          'SELECT percentual_calculado, horas_estudadas FROM course_progress WHERE user_id = ? AND curso_id = ?',
          [req.user.id, course.id]
        );
        if (progRow) {
          progress = progRow.percentual_calculado;
          horasEstudadas = progRow.horas_estudadas;
          concluido = progress >= 100;
        }
      }

      return {
        ...course,
        total_modulos: moduleCount,
        total_aulas: lessonCount,
        total_projetos: projectCount,
        progresso_usuario: progress,
        horas_estudadas: horasEstudadas,
        concluido
      };
    });

    return res.json(enrichedCourses);
  } catch (err) {
    console.error('Erro ao listar cursos:', err);
    return res.status(500).json({ error: 'Erro ao carregar catálogo de cursos.' });
  }
});

// GET /api/courses/:slugOrId - Detalhes do curso, módulos e estrutura curricular
router.get('/:slugOrId', optionalAuth, (req, res) => {
  try {
    const { slugOrId } = req.params;
    const isNum = !isNaN(slugOrId);
    const course = isNum
      ? get('SELECT * FROM courses WHERE id = ?', [slugOrId])
      : get('SELECT * FROM courses WHERE slug = ?', [slugOrId]);

    if (!course) {
      return res.status(404).json({ error: 'Curso não encontrado.' });
    }

    const modules = query('SELECT * FROM modules WHERE curso_id = ? ORDER BY ordem ASC', [course.id]);

    const enrichedModules = modules.map(mod => {
      const lessons = query(
        'SELECT id, modulo_id, ordem, titulo, duracao_minutos FROM lessons WHERE modulo_id = ? ORDER BY ordem ASC',
        [mod.id]
      );

      const lessonsWithProgress = lessons.map(lesson => {
        let concluida = false;
        if (req.user) {
          const prog = get(
            'SELECT concluida FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?',
            [req.user.id, lesson.id]
          );
          if (prog && prog.concluida) concluida = true;
        }
        return { ...lesson, concluida };
      });

      const totalAulas = lessons.length;
      const aulasConcluidas = lessonsWithProgress.filter(l => l.concluida).length;
      const progressoModulo = totalAulas > 0 ? Math.round((aulasConcluidas / totalAulas) * 100) : 0;

      return {
        ...mod,
        total_aulas: totalAulas,
        aulas_concluidas: aulasConcluidas,
        progresso_modulo: progressoModulo,
        aulas: lessonsWithProgress
      };
    });

    const projects = query('SELECT * FROM projects WHERE curso_id = ?', [course.id]);
    const quizzes = query('SELECT id, aula_id, curso_id, titulo, nota_minima FROM quizzes WHERE curso_id = ?', [course.id]);

    let userProgress = null;
    if (req.user) {
      userProgress = get('SELECT * FROM course_progress WHERE user_id = ? AND curso_id = ?', [req.user.id, course.id]);
    }

    return res.json({
      curso: course,
      modulos: enrichedModules,
      projetos: projects,
      quizzes: quizzes,
      progresso: userProgress
    });
  } catch (err) {
    console.error('Erro ao carregar detalhes do curso:', err);
    return res.status(500).json({ error: 'Erro ao buscar curso.' });
  }
});

// GET /api/courses/lessons/:id - Aula completa no template fixo de 12 tópicos
router.get('/lessons/:id', optionalAuth, (req, res) => {
  try {
    const lessonId = req.params.id;
    const lesson = get('SELECT * FROM lessons WHERE id = ?', [lessonId]);

    if (!lesson) {
      return res.status(404).json({ error: 'Aula não encontrada.' });
    }

    const moduleInfo = get('SELECT id, titulo, ordem, curso_id FROM modules WHERE id = ?', [lesson.modulo_id]);
    const courseInfo = get('SELECT id, slug, titulo, software_area FROM courses WHERE id = ?', [moduleInfo.curso_id]);

    const exercise = get('SELECT * FROM exercises WHERE aula_id = ?', [lessonId]);
    const quiz = get('SELECT id, titulo, nota_minima FROM quizzes WHERE aula_id = ?', [lessonId]);

    let progressoAula = { concluida: false };
    let notaQuiz = null;
    let anotacao = '';
    let classificacaoRevisao = null;
    let favoritado = false;

    if (req.user) {
      // Seção 8: Memorizar exatamente onde o usuário parou
      run('UPDATE users SET ultima_aula_id = ? WHERE id = ?', [lessonId, req.user.id]);

      const userProg = get('SELECT concluida FROM user_lesson_progress WHERE user_id = ? AND lesson_id = ?', [req.user.id, lessonId]);
      if (userProg) progressoAula.concluida = Boolean(userProg.concluida);

      if (quiz) {
        const attempt = get(
          'SELECT nota, aprovado FROM user_quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY id DESC LIMIT 1',
          [req.user.id, quiz.id]
        );
        if (attempt) notaQuiz = attempt;
      }

      const noteRow = get('SELECT texto FROM notes WHERE user_id = ? AND aula_id = ?', [req.user.id, lessonId]);
      if (noteRow) anotacao = noteRow.texto;

      // Seção 23: Sistema de Revisão (revisar, importante, dificil)
      const revRow = get('SELECT classificacao FROM review_items WHERE user_id = ? AND aula_id = ?', [req.user.id, lessonId]);
      if (revRow) classificacaoRevisao = revRow.classificacao;

      // Seção 25: Favoritos
      const favRow = get('SELECT id FROM favorites WHERE user_id = ? AND tipo_item = ? AND item_id = ?', [req.user.id, 'aula', lessonId]);
      if (favRow) favoritado = true;
    }

    return res.json({
      aula: lesson,
      modulo: moduleInfo,
      curso: courseInfo,
      exercicio: exercise || null,
      quiz: quiz || null,
      progresso: progressoAula,
      notaQuiz,
      anotacao,
      classificacaoRevisao,
      favoritado
    });
  } catch (err) {
    console.error('Erro ao buscar aula:', err);
    return res.status(500).json({ error: 'Erro ao buscar aula.' });
  }
});

module.exports = router;
