import { api } from '../services/api.js';
import { showToast } from '../components/Toast.js';

export async function renderLogin(container, navigateFn) {
  container.innerHTML = `
    <div style="min-height: calc(100vh - 120px); display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div style="width: 100%; max-width: 440px; background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        
        <div style="text-align: center; margin-bottom: 28px;">
          <div style="display: inline-flex; width: 54px; height: 54px; border-radius: 14px; background: linear-gradient(135deg, var(--accent-indigo), var(--accent-purple)); align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; color: white; margin-bottom: 12px; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);">
            ED
          </div>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-white); margin-bottom: 4px;">
            Escola de Design
          </h2>
          <p style="color: var(--text-muted); font-size: 0.85rem;">
            Plataforma Profissional de Formação Online
          </p>
        </div>

        <form id="login-form">
          <div style="margin-bottom: 18px;">
            <label style="display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px;">
              Login / E-mail
            </label>
            <input
              type="text"
              id="login-input"
              class="form-control"
              style="width: 100%; padding: 12px 14px; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); color: var(--text-white); font-size: 0.9rem;"
              placeholder="seu.email@escola.design"
              value="lucas@escola.design"
              required
            />
          </div>

          <div style="margin-bottom: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted);">
                Senha
              </label>
              <a href="#" id="forgot-password-link" style="font-size: 0.76rem; color: var(--accent-indigo); text-decoration: none;">
                Esqueceu a senha?
              </a>
            </div>
            <input
              type="password"
              id="senha-input"
              class="form-control"
              style="width: 100%; padding: 12px 14px; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); color: var(--text-white); font-size: 0.9rem;"
              placeholder="••••••••"
              value="senha123"
              required
            />
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            class="btn btn-primary"
            style="width: 100%; padding: 12px; font-size: 0.95rem; font-weight: 700; margin-top: 8px; justify-content: center;"
          >
            Entrar na Plataforma →
          </button>
        </form>

        <!-- SELETOR RÁPIDO PARA OS 3 ALUNOS INICIAIS + ADMIN -->
        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border-subtle);">
          <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--text-subtle); text-align: center; margin-bottom: 10px;">
            Acesso Rápido para Avaliação
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <button class="btn btn-outline quick-login-btn" data-login="lucas@escola.design" data-pass="senha123" style="font-size: 0.76rem; padding: 6px 8px; text-align: left; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              👤 Lucas Silva (Aluno 1)
            </button>
            <button class="btn btn-outline quick-login-btn" data-login="mariana@escola.design" data-pass="senha123" style="font-size: 0.76rem; padding: 6px 8px; text-align: left; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              👤 Mariana (Aluno 2)
            </button>
            <button class="btn btn-outline quick-login-btn" data-login="rodrigo@escola.design" data-pass="senha123" style="font-size: 0.76rem; padding: 6px 8px; text-align: left; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              👤 Rodrigo (Aluno 3)
            </button>
            <button class="btn btn-outline quick-login-btn" data-login="admin@escola.design" data-pass="admin123" style="font-size: 0.76rem; padding: 6px 8px; text-align: left; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--accent-amber); border-color: rgba(245,158,11,0.3);">
              ⚙️ Camila (Admin)
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL DE RECUPERAÇÃO DE SENHA -->
    <div id="reset-pwd-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 2000; align-items: center; justify-content: center; padding: 20px;">
      <div style="width: 100%; max-width: 400px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
        <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-white); margin-bottom: 8px;">
          Recuperar Senha
        </h3>
        <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 18px;">
          Digite seu login ou e-mail cadastrado para gerar o token seguro de redefinição.
        </p>

        <div id="reset-step-1">
          <input
            type="text"
            id="reset-login-input"
            class="form-control"
            style="width: 100%; padding: 10px 12px; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); color: var(--text-white); margin-bottom: 14px;"
            placeholder="seu.email@escola.design"
          />
          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-outline" id="close-reset-modal-btn">Cancelar</button>
            <button type="button" class="btn btn-primary" id="request-reset-btn">Continuar →</button>
          </div>
        </div>

        <div id="reset-step-2" style="display: none;">
          <div style="background: rgba(99,102,241,0.1); border: 1px solid var(--accent-indigo); border-radius: 8px; padding: 10px; margin-bottom: 14px; font-size: 0.78rem; color: var(--text-muted);">
            Token de validação gerado: <strong id="token-display" style="color: var(--accent-cyan); font-family: monospace;"></strong>
          </div>
          <input
            type="password"
            id="new-pwd-input"
            class="form-control"
            style="width: 100%; padding: 10px 12px; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); color: var(--text-white); margin-bottom: 14px;"
            placeholder="Nova senha (mínimo 4 caracteres)"
          />
          <div style="display: flex; justify-content: flex-end; gap: 8px;">
            <button type="button" class="btn btn-outline" id="cancel-step2-btn">Cancelar</button>
            <button type="button" class="btn btn-primary" id="confirm-reset-btn">Salvar Nova Senha</button>
          </div>
        </div>

      </div>
    </div>
  `;

  // Manipular submit do login
  const form = container.querySelector('#login-form');
  const loginInput = container.querySelector('#login-input');
  const senhaInput = container.querySelector('#senha-input');
  const submitBtn = container.querySelector('#login-submit-btn');

  form.onsubmit = async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Autenticando...';

    try {
      await api.login(loginInput.value.trim(), senhaInput.value);
      showToast('Login realizado com sucesso! Bem-vindo(a).');
      navigateFn('inicio');
    } catch (err) {
      showToast(err.message || 'Falha na autenticação.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Entrar na Plataforma →';
    }
  };

  // Botões de acesso rápido
  container.querySelectorAll('.quick-login-btn').forEach(btn => {
    btn.onclick = () => {
      loginInput.value = btn.getAttribute('data-login');
      senhaInput.value = btn.getAttribute('data-pass');
      form.requestSubmit();
    };
  });

  // Modal de recuperação de senha
  const forgotLink = container.querySelector('#forgot-password-link');
  const modal = container.querySelector('#reset-pwd-modal');
  const closeBtn = container.querySelector('#close-reset-modal-btn');
  const cancelStep2Btn = container.querySelector('#cancel-step2-btn');
  const reqBtn = container.querySelector('#request-reset-btn');
  const confirmBtn = container.querySelector('#confirm-reset-btn');
  const resetLoginInput = container.querySelector('#reset-login-input');
  const newPwdInput = container.querySelector('#new-pwd-input');
  const step1 = container.querySelector('#reset-step-1');
  const step2 = container.querySelector('#reset-step-2');
  const tokenDisplay = container.querySelector('#token-display');

  let activeToken = null;

  forgotLink.onclick = (e) => {
    e.preventDefault();
    resetLoginInput.value = loginInput.value || '';
    step1.style.display = 'block';
    step2.style.display = 'none';
    modal.style.display = 'flex';
  };

  const closeModal = () => {
    modal.style.display = 'none';
  };
  closeBtn.onclick = closeModal;
  cancelStep2Btn.onclick = closeModal;

  reqBtn.onclick = async () => {
    const val = resetLoginInput.value.trim();
    if (!val) {
      showToast('Digite seu login ou email.', 'error');
      return;
    }
    try {
      const res = await api.forgotPassword(val);
      if (res.token) {
        activeToken = res.token;
        tokenDisplay.textContent = res.token;
        step1.style.display = 'none';
        step2.style.display = 'block';
        showToast('Token gerado com sucesso!');
      } else {
        showToast(res.message || 'Verifique seus dados.', 'info');
      }
    } catch (e) {
      showToast('Erro ao processar solicitação.', 'error');
    }
  };

  confirmBtn.onclick = async () => {
    const newPwd = newPwdInput.value;
    if (!newPwd || newPwd.length < 4) {
      showToast('A senha deve ter no mínimo 4 caracteres.', 'error');
      return;
    }
    try {
      await api.resetPassword(activeToken, newPwd);
      showToast('Senha redefinida com sucesso! Você já pode entrar.');
      closeModal();
      senhaInput.value = newPwd;
    } catch (e) {
      showToast(e.message || 'Erro ao redefinir senha.', 'error');
    }
  };
}
