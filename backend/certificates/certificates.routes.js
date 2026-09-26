const express = require('express');
const router = express.Router();
const crypto = require('node:crypto');
const { query, get, run } = require('../../database/db.js');
const { requireAuth } = require('../auth/auth.middleware.js');

// GET /api/certificates/my - Lista certificados do usuário logado
router.get('/my', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const certs = query(
      `SELECT cert.*, c.titulo as curso_titulo, c.software_area, c.cor_tema, u.nome as aluno_nome
       FROM certificates cert
       JOIN courses c ON cert.curso_id = c.id
       JOIN users u ON cert.user_id = u.id
       WHERE cert.user_id = ?
       ORDER BY cert.data_emissao DESC`,
      [userId]
    );

    return res.json(certs);
  } catch (err) {
    console.error('Erro ao buscar certificados:', err);
    return res.status(500).json({ error: 'Erro ao carregar certificados.' });
  }
});

// POST /api/certificates/issue/:courseId - Emissão sob demanda se requisitos cumpridos
router.post('/issue/:courseId', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const prog = get(
      'SELECT percentual_calculado FROM course_progress WHERE user_id = ? AND curso_id = ?',
      [userId, courseId]
    );

    if (!prog || prog.percentual_calculado < 100) {
      return res.status(400).json({
        error: `Requisitos não concluídos. Seu progresso atual é de ${prog ? prog.percentual_calculado : 0}%. É necessário atingir 100% de conclusão.`
      });
    }

    const existing = get('SELECT * FROM certificates WHERE user_id = ? AND curso_id = ?', [userId, courseId]);
    if (existing) {
      return res.json({ message: 'Certificado já emitido anteriormente.', certificado: existing });
    }

    const codigoUnico = `EDD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const hashValidacao = crypto.createHash('sha256').update(`${codigoUnico}-${userId}-${courseId}`).digest('hex');
    const cursoRow = get('SELECT carga_horaria FROM courses WHERE id = ?', [courseId]);
    const carga = cursoRow ? cursoRow.carga_horaria : 40;

    run(
      'INSERT INTO certificates (user_id, curso_id, codigo_unico, carga_horaria, percentual_conclusao, hash_validacao) VALUES (?, ?, ?, ?, 100.0, ?)',
      [userId, courseId, codigoUnico, carga, hashValidacao]
    );

    const novoCert = get('SELECT * FROM certificates WHERE codigo_unico = ?', [codigoUnico]);
    return res.json({ message: 'Certificado oficial gerado com sucesso!', certificado: novoCert });
  } catch (err) {
    console.error('Erro ao emitir certificado:', err);
    return res.status(500).json({ error: 'Erro ao gerar certificado.' });
  }
});

// GET /api/certificates/verify/:codigo - Verificação pública de autenticidade
router.get('/verify/:codigo', (req, res) => {
  try {
    const { codigo } = req.params;
    const cert = get(
      `SELECT cert.*, c.titulo as curso_titulo, c.software_area, u.nome as aluno_nome
       FROM certificates cert
       JOIN courses c ON cert.curso_id = c.id
       JOIN users u ON cert.user_id = u.id
       WHERE cert.codigo_unico = ?`,
      [codigo.toUpperCase()]
    );

    if (!cert) {
      return res.status(404).json({
        valido: false,
        error: 'Certificado não encontrado no registro nacional da Escola Digital de Design.'
      });
    }

    return res.json({
      valido: true,
      certificado: cert,
      instituicao: 'Escola Digital de Design',
      mensagem: 'Documento autêntico e registrado com integridade criptográfica.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao verificar autenticidade do certificado.' });
  }
});

module.exports = router;
