const { get, query, run } = require('../../database/db.js');

/**
 * Recalcula matematicamente o progresso real de um usuário em um curso
 * com base na soma ponderada de:
 * - Aulas concluídas (40% do peso)
 * - Exercícios práticos concluídos (20% do peso)
 * - Quizzes aprovados com nota mínima (20% do peso)
 * - Projetos práticos aprovados no portfólio (20% do peso)
 */
function recalculateCourseProgress(userId, courseId) {
  // 1. Total de Aulas do Curso
  const totalAulasRow = get(
    'SELECT COUNT(l.id) as count FROM lessons l JOIN modules m ON l.modulo_id = m.id WHERE m.curso_id = ?',
    [courseId]
  );
  const totalAulas = totalAulasRow ? totalAulasRow.count : 0;

  const aulasConcluidasRow = get(
    'SELECT COUNT(*) as count FROM user_lesson_progress WHERE user_id = ? AND curso_id = ? AND concluida = 1',
    [userId, courseId]
  );
  const aulasConcluidas = aulasConcluidasRow ? aulasConcluidasRow.count : 0;

  // 2. Total de Exercícios
  const totalExerciciosRow = get(
    'SELECT COUNT(e.id) as count FROM exercises e JOIN lessons l ON e.aula_id = l.id JOIN modules m ON l.modulo_id = m.id WHERE m.curso_id = ?',
    [courseId]
  );
  const totalExercicios = totalExerciciosRow ? totalExerciciosRow.count : 0;

  const exerciciosConcluidosRow = get(
    'SELECT COUNT(*) as count FROM user_exercise_progress WHERE user_id = ? AND curso_id = ? AND concluido = 1',
    [userId, courseId]
  );
  const exerciciosConcluidos = exerciciosConcluidosRow ? exerciciosConcluidosRow.count : 0;

  // 3. Quizzes Aprovados
  const totalQuizzesRow = get(
    'SELECT COUNT(id) as count FROM quizzes WHERE curso_id = ?',
    [courseId]
  );
  const totalQuizzes = totalQuizzesRow ? totalQuizzesRow.count : 0;

  const quizzesAprovadosRow = get(
    `SELECT COUNT(DISTINCT q.id) as count
     FROM quizzes q
     JOIN user_quiz_attempts a ON a.quiz_id = q.id
     WHERE q.curso_id = ? AND a.user_id = ? AND a.aprovado = 1`,
    [courseId, userId]
  );
  const quizzesAprovados = quizzesAprovadosRow ? quizzesAprovadosRow.count : 0;

  // 4. Projetos Práticos Aprovados
  const totalProjetosRow = get(
    'SELECT COUNT(id) as count FROM projects WHERE curso_id = ?',
    [courseId]
  );
  const totalProjetos = totalProjetosRow ? totalProjetosRow.count : 0;

  const projetosConcluidosRow = get(
    "SELECT COUNT(*) as count FROM user_projects WHERE user_id = ? AND curso_id = ? AND status = 'aprovado'",
    [userId, courseId]
  );
  const projetosConcluidos = projetosConcluidosRow ? projetosConcluidosRow.count : 0;

  // Cálculo ponderado dinâmico adaptativo
  let scorePonderado = 0;
  let pesoTotal = 0;

  if (totalAulas > 0) {
    scorePonderado += (aulasConcluidas / totalAulas) * 40;
    pesoTotal += 40;
  }
  if (totalExercicios > 0) {
    scorePonderado += (exerciciosConcluidos / totalExercicios) * 20;
    pesoTotal += 20;
  }
  if (totalQuizzes > 0) {
    scorePonderado += (quizzesAprovados / totalQuizzes) * 20;
    pesoTotal += 20;
  }
  if (totalProjetos > 0) {
    scorePonderado += (projetosConcluidos / totalProjetos) * 20;
    pesoTotal += 20;
  }

  const percentualFinal = pesoTotal > 0 ? Math.round((scorePonderado / pesoTotal) * 100 * 10) / 10 : 0;

  // Estimar horas estudadas com base na duração das aulas concluídas e tarefas
  const duracaoMinutosRow = get(
    `SELECT SUM(l.duracao_minutos) as total_minutos
     FROM lessons l
     JOIN user_lesson_progress p ON l.id = p.lesson_id
     WHERE p.user_id = ? AND p.curso_id = ? AND p.concluida = 1`,
    [userId, courseId]
  );
  const minutos = (duracaoMinutosRow && duracaoMinutosRow.total_minutos) ? duracaoMinutosRow.total_minutos : 0;
  const horas = Math.round((minutos / 60 + (exerciciosConcluidos * 0.5) + (projetosConcluidos * 3.0)) * 10) / 10;

  // Persistir no banco de dados relacional
  const existing = get('SELECT id FROM course_progress WHERE user_id = ? AND curso_id = ?', [userId, courseId]);

  if (existing) {
    run(
      `UPDATE course_progress SET
        percentual_calculado = ?,
        aulas_concluidas = ?,
        total_aulas = ?,
        exercicios_concluidos = ?,
        total_exercicios = ?,
        quizzes_aprovados = ?,
        total_quizzes = ?,
        projetos_concluidos = ?,
        total_projetos = ?,
        horas_estudadas = ?,
        ultimo_acesso = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        percentualFinal,
        aulasConcluidas,
        totalAulas,
        exerciciosConcluidos,
        totalExercicios,
        quizzesAprovados,
        totalQuizzes,
        projetosConcluidos,
        totalProjetos,
        horas,
        existing.id
      ]
    );
  } else {
    run(
      `INSERT INTO course_progress (
        user_id, curso_id, percentual_calculado, aulas_concluidas, total_aulas,
        exercicios_concluidos, total_exercicios, quizzes_aprovados, total_quizzes,
        projetos_concluidos, total_projetos, horas_estudadas, ultimo_acesso
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        userId,
        courseId,
        percentualFinal,
        aulasConcluidas,
        totalAulas,
        exerciciosConcluidos,
        totalExercicios,
        quizzesAprovados,
        totalQuizzes,
        projetosConcluidos,
        totalProjetos,
        horas
      ]
    );
  }

  // Se atingiu 100%, verificar ou emitir certificado automaticamente
  if (percentualFinal >= 100) {
    const certExist = get('SELECT id FROM certificates WHERE user_id = ? AND curso_id = ?', [userId, courseId]);
    if (!certExist) {
      const crypto = require('node:crypto');
      const codigoUnico = `CERT-${courseId}-${userId}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
      const hashValidacao = crypto.createHash('sha256').update(`${codigoUnico}-${userId}-${courseId}`).digest('hex');
      const cursoRow = get('SELECT carga_horaria FROM courses WHERE id = ?', [courseId]);
      const carga = cursoRow ? cursoRow.carga_horaria : 40;

      run(
        'INSERT INTO certificates (user_id, curso_id, codigo_unico, carga_horaria, percentual_conclusao, hash_validacao) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, courseId, codigoUnico, carga, percentualFinal, hashValidacao]
      );
    }
  }

  return {
    percentual_calculado: percentualFinal,
    aulas_concluidas: aulasConcluidas,
    total_aulas: totalAulas,
    exercicios_concluidos: exerciciosConcluidos,
    total_exercicios: totalExercicios,
    quizzes_aprovados: quizzesAprovados,
    total_quizzes: totalQuizzes,
    projetos_concluidos: projetosConcluidos,
    total_projetos: totalProjetos,
    horas_estudadas: horas
  };
}

module.exports = {
  recalculateCourseProgress
};
