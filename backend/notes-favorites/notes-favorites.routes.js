const express = require('express');
const router = express.Router();
const { query, get, run } = require('../../database/db.js');
const { requireAuth } = require('../auth/auth.middleware.js');

// GET /api/user/notes - Minhas anotações
router.get('/notes', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const notes = query(
      `SELECT n.*, l.titulo as aula_titulo, m.titulo as modulo_titulo, c.titulo as curso_titulo, c.software_area
       FROM notes n
       JOIN lessons l ON n.aula_id = l.id
       JOIN modules m ON l.modulo_id = m.id
       JOIN courses c ON m.curso_id = c.id
       WHERE n.user_id = ?
       ORDER BY n.updated_at DESC`,
      [userId]
    );
    return res.json(notes);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar anotações.' });
  }
});

// POST /api/user/notes - Salvar ou atualizar anotação de aula
router.post('/notes', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const { aulaId, texto } = req.body;

    if (!aulaId) {
      return res.status(400).json({ error: 'aulaId é obrigatório.' });
    }

    const existing = get('SELECT id FROM notes WHERE user_id = ? AND aula_id = ?', [userId, aulaId]);

    if (existing) {
      run('UPDATE notes SET texto = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [texto || '', existing.id]);
    } else {
      run('INSERT INTO notes (user_id, aula_id, texto) VALUES (?, ?, ?)', [userId, aulaId, texto || '']);
    }

    return res.json({ message: 'Anotação salva com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao salvar anotação.' });
  }
});

// GET /api/user/favorites - Meus favoritos
router.get('/favorites', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const favs = query('SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    const enriched = favs.map(f => {
      let item = null;
      if (f.tipo_item === 'curso') {
        item = get('SELECT id, slug, titulo, software_area, cor_tema FROM courses WHERE id = ?', [f.item_id]);
      } else if (f.tipo_item === 'aula') {
        item = get(
          `SELECT l.id, l.titulo, m.titulo as modulo_titulo, c.titulo as curso_titulo
           FROM lessons l
           JOIN modules m ON l.modulo_id = m.id
           JOIN courses c ON m.curso_id = c.id
           WHERE l.id = ?`,
          [f.item_id]
        );
      } else if (f.tipo_item === 'conhecimento') {
        item = get('SELECT id, titulo, software, categoria, fonte FROM knowledge WHERE id = ?', [f.item_id]);
      }
      return { ...f, item };
    });

    return res.json(enriched.filter(f => f.item !== null));
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar favoritos.' });
  }
});

// POST /api/user/favorites/toggle - Alternar favorito
router.post('/favorites/toggle', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const { tipoItem, itemId } = req.body;

    if (!tipoItem || !itemId) {
      return res.status(400).json({ error: 'tipoItem e itemId são obrigatórios.' });
    }

    const existing = get('SELECT id FROM favorites WHERE user_id = ? AND tipo_item = ? AND item_id = ?', [userId, tipoItem, itemId]);

    if (existing) {
      run('DELETE FROM favorites WHERE id = ?', [existing.id]);
      return res.json({ favoritado: false, message: 'Removido dos favoritos.' });
    } else {
      run('INSERT INTO favorites (user_id, tipo_item, item_id) VALUES (?, ?, ?)', [userId, tipoItem, itemId]);
      return res.json({ favoritado: true, message: 'Adicionado aos favoritos!' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao alternar favorito.' });
  }
});

// ==========================================
// SEÇÃO 23: SISTEMA DE REVISÃO (Revisar, Importante, Difícil)
// ==========================================
// GET /api/user/reviews - Lista itens marcados para revisão pelo aluno
router.get('/reviews', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const { classificacao } = req.query; // 'revisar' | 'importante' | 'dificil'

    let sql = `
      SELECT r.*, l.titulo as aula_titulo, l.duracao_minutos, l.ordem as aula_ordem,
             m.id as modulo_id, m.titulo as modulo_titulo, m.ordem as modulo_ordem,
             c.id as curso_id, c.titulo as curso_titulo, c.software_area, c.slug as curso_slug, c.cor_tema
      FROM review_items r
      JOIN lessons l ON r.aula_id = l.id
      JOIN modules m ON l.modulo_id = m.id
      JOIN courses c ON m.curso_id = c.id
      WHERE r.user_id = ?
    `;
    const params = [userId];

    if (classificacao) {
      sql += ' AND r.classificacao = ?';
      params.push(classificacao);
    }

    sql += ' ORDER BY r.created_at DESC';

    const items = query(sql, params);
    return res.json(items);
  } catch (err) {
    console.error('Erro ao buscar itens de revisão:', err);
    return res.status(500).json({ error: 'Erro ao buscar itens de revisão.' });
  }
});

// POST /api/user/reviews/toggle - Marca, altera ou desmarca conteúdo de revisão
router.post('/reviews/toggle', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const { aulaId, cursoId, classificacao } = req.body;

    if (!aulaId || !classificacao) {
      return res.status(400).json({ error: 'aulaId e classificacao (revisar, importante, dificil) são obrigatórios.' });
    }

    if (!['revisar', 'importante', 'dificil'].includes(classificacao)) {
      return res.status(400).json({ error: 'Classificação inválida. Use: revisar, importante ou dificil.' });
    }

    let finalCursoId = cursoId;
    if (!finalCursoId) {
      const lesson = get('SELECT modulo_id FROM lessons WHERE id = ?', [aulaId]);
      if (lesson) {
        const mod = get('SELECT curso_id FROM modules WHERE id = ?', [lesson.modulo_id]);
        if (mod) finalCursoId = mod.curso_id;
      }
    }

    const existing = get('SELECT id, classificacao FROM review_items WHERE user_id = ? AND aula_id = ?', [userId, aulaId]);

    if (existing) {
      if (existing.classificacao === classificacao) {
        // Se clicar no mesmo botão que já estava ativo, desmarca (remove da revisão)
        run('DELETE FROM review_items WHERE id = ?', [existing.id]);
        return res.json({ status: 'removido', classificacao: null, message: 'Item removido da lista de revisão.' });
      } else {
        // Se clicar em outra classificação, atualiza (ex: de 'revisar' para 'dificil')
        run('UPDATE review_items SET classificacao = ?, created_at = CURRENT_TIMESTAMP WHERE id = ?', [classificacao, existing.id]);
        return res.json({ status: 'atualizado', classificacao, message: `Item marcado como "${classificacao}".` });
      }
    } else {
      run(
        'INSERT INTO review_items (user_id, aula_id, curso_id, classificacao) VALUES (?, ?, ?, ?)',
        [userId, aulaId, finalCursoId, classificacao]
      );
      return res.json({ status: 'criado', classificacao, message: `Item marcado como "${classificacao}".` });
    }
  } catch (err) {
    console.error('Erro ao alternar revisão:', err);
    return res.status(500).json({ error: 'Erro ao alternar item de revisão.' });
  }
});

// ==========================================
// SEÇÃO 29: HISTÓRICO DE ATIVIDADES REAL
// ==========================================
// GET /api/user/history - Linha do tempo de atividades do aluno
router.get('/history', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const history = query(
      `SELECT h.*, c.titulo as curso_titulo, c.software_area, c.slug as curso_slug, l.titulo as aula_titulo
       FROM user_history h
       LEFT JOIN courses c ON h.curso_id = c.id
       LEFT JOIN lessons l ON h.aula_id = l.id
       WHERE h.user_id = ?
       ORDER BY h.created_at DESC
       LIMIT 50`,
      [userId]
    );
    return res.json(history);
  } catch (err) {
    console.error('Erro ao buscar histórico:', err);
    return res.status(500).json({ error: 'Erro ao buscar histórico de atividades.' });
  }
});

// ==========================================
// SEÇÃO 33: NOTIFICAÇÕES DO SISTEMA
// ==========================================
// GET /api/user/notifications - Notificações individuais
router.get('/notifications', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [userId]
    );
    const naoLidas = notifications.filter(n => !n.lida).length;
    return res.json({ notifications, totalNaoLidas: naoLidas });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar notificações.' });
  }
});

// POST /api/user/notifications/:id/read - Marcar notificação como lida
router.post('/notifications/:id/read', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    const notifId = req.params.id;
    run('UPDATE notifications SET lida = 1 WHERE id = ? AND user_id = ?', [notifId, userId]);
    return res.json({ message: 'Notificação marcada como lida.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar notificação.' });
  }
});

// POST /api/user/notifications/read-all - Marcar todas como lidas
router.post('/notifications/read-all', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;
    run('UPDATE notifications SET lida = 1 WHERE user_id = ?', [userId]);
    return res.json({ message: 'Todas as notificações foram marcadas como lidas.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar notificações.' });
  }
});

module.exports = router;
