const express = require('express');
const router = express.Router();
const { query } = require('../../database/db.js');

// GET /api/search?q=termo - Busca global unificada em todas as entidades
router.get('/', (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json({
        total: 0,
        cursos: [],
        aulas: [],
        exercicios: [],
        projetos: [],
        conhecimento: []
      });
    }

    const term = `%${q.trim()}%`;

    // 1. Cursos
    const cursos = query(
      `SELECT id, slug, titulo, software_area, descricao, nivel_minimo, cor_tema
       FROM courses
       WHERE titulo LIKE ? OR software_area LIKE ? OR descricao LIKE ?
       LIMIT 5`,
      [term, term, term]
    );

    // 2. Aulas e Conceitos
    const aulas = query(
      `SELECT l.id, l.titulo, l.duracao_minutos, l.conceito, l.ferramentas, m.titulo as modulo_titulo, c.titulo as curso_titulo, c.slug as curso_slug
       FROM lessons l
       JOIN modules m ON l.modulo_id = m.id
       JOIN courses c ON m.curso_id = c.id
       WHERE l.titulo LIKE ? OR l.conceito LIKE ? OR l.ferramentas LIKE ? OR l.explicacao LIKE ?
       LIMIT 8`,
      [term, term, term, term]
    );

    // 3. Exercícios
    const exercicios = query(
      `SELECT e.id, e.titulo, e.enunciado, e.tipo, l.titulo as aula_titulo, l.id as aula_id
       FROM exercises e
       JOIN lessons l ON e.aula_id = l.id
       WHERE e.titulo LIKE ? OR e.enunciado LIKE ?
       LIMIT 5`,
      [term, term]
    );

    // 4. Projetos Práticos
    const projetos = query(
      `SELECT p.id, p.nome, p.categoria, p.descricao, c.titulo as curso_titulo
       FROM projects p
       JOIN courses c ON p.curso_id = c.id
       WHERE p.nome LIKE ? OR p.categoria LIKE ? OR p.descricao LIKE ?
       LIMIT 5`,
      [term, term, term]
    );

    // 5. Central de Conhecimento
    const conhecimento = query(
      `SELECT id, titulo, software, categoria, fonte, conteudo_resumo
       FROM knowledge
       WHERE titulo LIKE ? OR tags LIKE ? OR conteudo_resumo LIKE ?
       LIMIT 6`,
      [term, term, term]
    );

    const total = cursos.length + aulas.length + exercicios.length + projetos.length + conhecimento.length;

    return res.json({
      total,
      cursos,
      aulas,
      exercicios,
      projetos,
      conhecimento
    });
  } catch (err) {
    console.error('Erro na busca global:', err);
    return res.status(500).json({ error: 'Erro ao realizar busca.' });
  }
});

module.exports = router;
