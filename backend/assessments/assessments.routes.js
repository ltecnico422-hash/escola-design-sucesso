const express = require('express');
const router = express.Router();
const { query, get, run } = require('../../database/db.js');
const { requireAuth } = require('../auth/auth.middleware.js');
const { recalculateCourseProgress } = require('../progress/progress.service.js');

// GET /api/assessments/quiz/:id - Carrega quiz para o aluno (sem expor o gabarito)
router.get('/quiz/:id', requireAuth, (req, res) => {
  try {
    const quizId = req.params.id;
    const quiz = get('SELECT id, aula_id, curso_id, titulo, nota_minima FROM quizzes WHERE id = ?', [quizId]);

    if (!quiz) {
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }

    const questions = query('SELECT id, quiz_id, ordem, enunciado FROM questions WHERE quiz_id = ? ORDER BY ordem ASC', [quizId]);

    const questionsWithAnswers = questions.map(q => {
      // NÃO envia o campo "correta" para o cliente
      const answers = query('SELECT id, question_id, texto, ordem FROM answers WHERE question_id = ? ORDER BY ordem ASC', [q.id]);
      return {
        ...q,
        alternativas: answers
      };
    });

    const attempts = query(
      'SELECT nota, total_questoes, acertos, aprovado, created_at FROM user_quiz_attempts WHERE user_id = ? AND quiz_id = ? ORDER BY id DESC',
      [req.user.id, quizId]
    );

    return res.json({
      quiz,
      questoes: questionsWithAnswers,
      historico_tentativas: attempts
    });
  } catch (err) {
    console.error('Erro ao buscar quiz:', err);
    return res.status(500).json({ error: 'Erro ao carregar avaliação.' });
  }
});

// POST /api/assessments/quiz/:id/submit - Validação matemática real da prova e recálculo
router.post('/quiz/:id/submit', requireAuth, (req, res) => {
  try {
    const quizId = req.params.id;
    const userId = req.user.id;
    const { respostas } = req.body; // Objeto { questionId: answerId }

    if (!respostas || typeof respostas !== 'object') {
      return res.status(400).json({ error: 'Formato de respostas inválido.' });
    }

    const quiz = get('SELECT id, curso_id, titulo, nota_minima FROM quizzes WHERE id = ?', [quizId]);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz não encontrado.' });
    }

    const questions = query('SELECT id, enunciado, explicacao FROM questions WHERE quiz_id = ?', [quizId]);
    const totalQuestoes = questions.length;
    let acertos = 0;
    const feedbackDetalhado = [];

    questions.forEach(q => {
      const selectedAnswerId = respostas[q.id];
      const correctAnswer = get('SELECT id, texto FROM answers WHERE question_id = ? AND correta = 1', [q.id]);
      const chosenAnswer = selectedAnswerId
        ? get('SELECT id, texto, correta FROM answers WHERE id = ?', [selectedAnswerId])
        : null;

      const isCorrect = chosenAnswer && chosenAnswer.correta === 1;
      if (isCorrect) acertos++;

      feedbackDetalhado.push({
        questao_id: q.id,
        enunciado: q.enunciado,
        explicacao: q.explicacao,
        acertou: Boolean(isCorrect),
        resposta_usuario: chosenAnswer ? chosenAnswer.texto : 'Não respondeu',
        resposta_correta: correctAnswer ? correctAnswer.texto : ''
      });
    });

    const nota = totalQuestoes > 0 ? Math.round((acertos / totalQuestoes) * 100 * 10) / 10 : 0;
    const aprovado = nota >= quiz.nota_minima ? 1 : 0;

    // Salvar tentativa no banco
    run(
      `INSERT INTO user_quiz_attempts (
        user_id, quiz_id, nota, total_questoes, acertos, aprovado, detalhes_respostas
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, quizId, nota, totalQuestoes, acertos, aprovado, JSON.stringify(feedbackDetalhado)]
    );

    // Seção 29: Registrar tentativa no histórico
    const cursoInfo = get('SELECT titulo FROM courses WHERE id = ?', [quiz.curso_id]);
    const cursoNome = cursoInfo ? cursoInfo.titulo : 'Curso';
    run(
      'INSERT INTO user_history (user_id, tipo, titulo, descricao, curso_id, aula_id) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, 'quiz_realizado', 'Quiz Realizado', `${cursoNome} — ${quiz.titulo} (Nota: ${nota}%)`, quiz.curso_id, quiz.aula_id || null]
    );

    // Recalcular progresso real do curso com base na aprovação
    const novoProgresso = recalculateCourseProgress(userId, quiz.curso_id);

    return res.json({
      nota,
      acertos,
      totalQuestoes,
      aprovado: Boolean(aprovado),
      notaMinima: quiz.nota_minima,
      feedback: feedbackDetalhado,
      progressoAtualizado: novoProgresso,
      mensagem: aprovado
        ? `Parabéns! Você alcançou nota ${nota}% e superou a média mínima de ${quiz.nota_minima}%.`
        : `Você obteve nota ${nota}%. A média mínima necessária é ${quiz.nota_minima}%. Revise o conteúdo e tente novamente!`
    });
  } catch (err) {
    console.error('Erro ao avaliar quiz:', err);
    return res.status(500).json({ error: 'Erro ao submeter avaliação.' });
  }
});

module.exports = router;
