import { api } from '../services/api.js';
import { showToast } from '../components/Toast.js';

export async function renderProfile(container, navigateFn) {
  const user = api.getCurrentUser();

  container.innerHTML = `
    <div style="margin-bottom: 28px;">
      <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); letter-spacing: -0.02em;">
        Meu Perfil & Acesso
      </h2>
      <p style="color: var(--text-muted); font-size: 0.9rem;">
        Gerenciamento de conta, segurança e credenciais de acesso.
      </p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
      <!-- DADOS CADASTRAIS -->
      <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 28px;">
        <div style="display: flex; align-items: center; gap: 18px; margin-bottom: 24px;">
          <img src="${user.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="${user.nome}" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary);" />
          <div>
            <h3 style="color: var(--text-white); font-size: 1.3rem; margin: 0;">${user.nome}</h3>
            <span style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 600;">${user.login}</span>
            <span class="course-badge" style="display: inline-block; margin-top: 6px; background: rgba(99, 102, 241, 0.15); color: var(--primary);">
              Papel: ${user.papel.toUpperCase()}
            </span>
          </div>
        </div>

        <form id="profile-edit-form" style="display: flex; flex-direction: column; gap: 16px;">
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Nome Completo:</label>
            <input type="text" id="prof-nome" value="${user.nome}" required style="width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-white);" />
          </div>

          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Biografia Profissional:</label>
            <textarea id="prof-bio" rows="3" style="width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-white); font-family: var(--font-sans);">${user.bio || ''}</textarea>
          </div>

          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Nova Senha (Opcional):</label>
            <input type="password" id="prof-nova-senha" placeholder="Deixe em branco se não desejar alterar" style="width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-white);" />
          </div>

          <div id="prof-senha-atual-container" style="display: none;">
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Senha Atual (Obrigatória para confirmar nova senha):</label>
            <input type="password" id="prof-senha-atual" placeholder="Sua senha atual" style="width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-white);" />
          </div>

          <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
            Salvar Alterações do Perfil
          </button>
        </form>
      </div>

      <!-- ALTERNADOR RÁPIDO DE USUÁRIOS (SEÇÃO 7 DA SKILL) -->
      <div>
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-glow); border-radius: var(--radius-lg); padding: 28px;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-white); margin-bottom: 6px;">
            Alternar Usuário para Validação
          </h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px;">
            Conforme a Seção 7 da skill ("Acompanhamento individual dos 3 usuários"), você pode alternar instantaneamente entre os perfis abaixo para testar o progresso independente de cada um:
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <button class="btn ${user.login === 'lucas@escola.design' ? 'btn-primary' : 'btn-secondary'}" style="justify-content: flex-start; padding: 12px 18px;" data-switch-user="lucas@escola.design" data-switch-pass="senha123">
              <span style="font-size: 1.2rem;">👨‍🎨</span>
              <div style="text-align: left;">
                <div style="font-weight: 700;">Lucas Silva (Aluno 1)</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">lucas@escola.design • Focado em Photoshop e Motion</div>
              </div>
            </button>

            <button class="btn ${user.login === 'mariana@escola.design' ? 'btn-primary' : 'btn-secondary'}" style="justify-content: flex-start; padding: 12px 18px;" data-switch-user="mariana@escola.design" data-switch-pass="senha123">
              <span style="font-size: 1.2rem;">👩‍🎨</span>
              <div style="text-align: left;">
                <div style="font-weight: 700;">Mariana Costa (Aluno 2)</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">mariana@escola.design • Focada em Illustrator e Branding</div>
              </div>
            </button>

            <button class="btn ${user.login === 'rodrigo@escola.design' ? 'btn-primary' : 'btn-secondary'}" style="justify-content: flex-start; padding: 12px 18px;" data-switch-user="rodrigo@escola.design" data-switch-pass="senha123">
              <span style="font-size: 1.2rem;">👨‍💻</span>
              <div style="text-align: left;">
                <div style="font-weight: 700;">Rodrigo Alves (Aluno 3)</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">rodrigo@escola.design • Focado em CorelDRAW e Gráfica</div>
              </div>
            </button>

            <button class="btn ${user.login === 'admin@escola.design' ? 'btn-primary' : 'btn-secondary'}" style="justify-content: flex-start; padding: 12px 18px; border-color: rgba(99, 102, 241, 0.4);" data-switch-user="admin@escola.design" data-switch-pass="admin123">
              <span style="font-size: 1.2rem;">👑</span>
              <div style="text-align: left;">
                <div style="font-weight: 700; color: #facc15;">Administrador Master</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">admin@escola.design • Acesso total e Gestão</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Mostrar campo de senha atual se preencher nova senha
  const novaSenhaInput = container.querySelector('#prof-nova-senha');
  const senhaAtualContainer = container.querySelector('#prof-senha-atual-container');
  novaSenhaInput.oninput = () => {
    senhaAtualContainer.style.display = novaSenhaInput.value ? 'block' : 'none';
  };

  // Submit perfil
  const form = container.querySelector('#profile-edit-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const nome = container.querySelector('#prof-nome').value;
    const bio = container.querySelector('#prof-bio').value;
    const novaSenha = container.querySelector('#prof-nova-senha').value;
    const senhaAtual = container.querySelector('#prof-senha-atual').value;

    try {
      await api.request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ nome, bio, novaSenha: novaSenha || undefined, senhaAtual: senhaAtual || undefined })
      });
      showToast('Perfil atualizado com sucesso!');
      // Atualizar dados locais
      const meData = await api.request('/auth/me');
      localStorage.setItem('edd_user', JSON.stringify(meData.user));
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: meData.user }));
    } catch (err) {
      showToast(`Erro ao atualizar: ${err.message}`, 'error');
    }
  };

  // Alternador de usuários
  container.querySelectorAll('[data-switch-user]').forEach(btn => {
    btn.onclick = async () => {
      const login = btn.getAttribute('data-switch-user');
      const senha = btn.getAttribute('data-switch-pass');
      try {
        await api.login(login, senha);
        showToast(`Sessão alterada para ${login}!`);
        navigateFn('inicio');
      } catch (err) {
        showToast(`Erro ao alternar: ${err.message}`, 'error');
      }
    };
  });
}
