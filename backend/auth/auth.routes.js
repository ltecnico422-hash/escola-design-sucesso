const express = require('express');
const router = express.Router();
const { authenticate, hashPassword } = require('./auth.service.js');
const { requireAuth } = require('./auth.middleware.js');
const { run, get } = require('../../database/db.js');

// POST /api/auth/login
router.post('/login', (req, res) => {
  try {
    const { login, senha } = req.body;
    if (!login || !senha) {
      return res.status(400).json({ error: 'Informe login e senha.' });
    }
    const result = authenticate(login, senha);
    return res.json(result);
  } catch (err) {
    return res.status(401).json({ error: err.message || 'Falha na autenticação.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, (req, res) => {
  try {
    const { nome, bio, foto, senhaAtual, novaSenha } = req.body;
    const userId = req.user.id;

    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({ error: 'Para alterar a senha, forneça a senha atual.' });
      }
      const user = get('SELECT senha_hash FROM users WHERE id = ?', [userId]);
      const { verifyPassword } = require('./auth.service.js');
      if (!verifyPassword(senhaAtual, user.senha_hash)) {
        return res.status(400).json({ error: 'Senha atual incorreta.' });
      }
      const newHash = hashPassword(novaSenha);
      run('UPDATE users SET senha_hash = ? WHERE id = ?', [newHash, userId]);
    }

    run(
      'UPDATE users SET nome = COALESCE(?, nome), bio = COALESCE(?, bio), foto = COALESCE(?, foto) WHERE id = ?',
      [nome, bio, foto, userId]
    );

    const updatedUser = get('SELECT id, nome, login, foto, bio, papel, data_entrada FROM users WHERE id = ?', [userId]);
    return res.json({ user: updatedUser, message: 'Perfil atualizado com sucesso.' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

// POST /api/auth/forgot-password - Solicitação de recuperação de senha (Seção 1)
router.post('/forgot-password', (req, res) => {
  try {
    const { login } = req.body;
    if (!login) {
      return res.status(400).json({ error: 'Informe seu login/email cadastrado.' });
    }

    const user = get('SELECT id, nome, login FROM users WHERE login = ?', [login.trim().toLowerCase()]);
    if (!user) {
      // Retorna sucesso neutro por segurança (sem enumeração)
      return res.json({
        message: 'Se o usuário constar na plataforma, as instruções de redefinição foram geradas.',
        token: null
      });
    }

    const crypto = require('node:crypto');
    const resetToken = crypto.randomBytes(24).toString('hex');
    const expiraEm = new Date(Date.now() + 3600000).toISOString(); // 1 hora de validade

    run(
      'INSERT INTO password_resets (user_id, token, expira_em, usado) VALUES (?, ?, ?, 0)',
      [user.id, resetToken, expiraEm]
    );

    return res.json({
      message: 'Instruções de recuperação geradas com sucesso.',
      token: resetToken,
      expiraEm
    });
  } catch (err) {
    console.error('Erro na recuperação de senha:', err);
    return res.status(500).json({ error: 'Erro ao processar solicitação de recuperação de senha.' });
  }
});

// POST /api/auth/reset-password - Concluir redefinição de senha
router.post('/reset-password', (req, res) => {
  try {
    const { token, novaSenha } = req.body;
    if (!token || !novaSenha || novaSenha.length < 4) {
      return res.status(400).json({ error: 'Token válido e nova senha (mínimo 4 caracteres) são obrigatórios.' });
    }

    const resetRow = get(
      'SELECT id, user_id, expira_em, usado FROM password_resets WHERE token = ?',
      [token]
    );

    if (!resetRow) {
      return res.status(400).json({ error: 'Token de recuperação inválido.' });
    }

    if (resetRow.usado) {
      return res.status(400).json({ error: 'Este token de recuperação já foi utilizado.' });
    }

    if (new Date(resetRow.expira_em) < new Date()) {
      return res.status(400).json({ error: 'Este token expirou. Solicite uma nova recuperação.' });
    }

    const newHash = hashPassword(novaSenha);
    run('UPDATE users SET senha_hash = ? WHERE id = ?', [newHash, resetRow.user_id]);
    run('UPDATE password_resets SET usado = 1 WHERE id = ?', [resetRow.id]);

    return res.json({ message: 'Senha redefinida com sucesso! Você já pode realizar o login.' });
  } catch (err) {
    console.error('Erro ao redefinir senha:', err);
    return res.status(500).json({ error: 'Erro ao redefinir senha.' });
  }
});

module.exports = router;

