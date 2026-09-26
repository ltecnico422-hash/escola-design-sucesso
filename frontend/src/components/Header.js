import { api } from '../services/api.js';

export function renderHeader(pageTitle = 'Painel do Aluno') {
  const user = api.getCurrentUser() || {
    id: 2,
    nome: 'Lucas Silva',
    login: 'lucas@escola.design',
    foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    papel: 'aluno'
  };

  return `
    <header class="top-header">
      <div style="display: flex; align-items: center; gap: 20px;">
        <button class="header-search-btn" id="open-global-search-btn">
          <span>🔍</span>
          <span>Buscar cursos, ferramentas, conceitos...</span>
          <span class="search-shortcut">Ctrl+K</span>
        </button>
      </div>

      <div class="header-actions">
        <!-- SELETOR RÁPIDO DE USUÁRIO PARA VALIDAÇÃO DOS 3 ALUNOS E ADMIN -->
        <div class="user-quick-switch" title="Alternar entre os 3 alunos ou administrador">
          <label>Perfil:</label>
          <select id="user-switcher-select">
            <option value="lucas@escola.design" ${user.login === 'lucas@escola.design' ? 'selected' : ''}>Lucas Silva (Aluno 1)</option>
            <option value="mariana@escola.design" ${user.login === 'mariana@escola.design' ? 'selected' : ''}>Mariana Costa (Aluno 2)</option>
            <option value="rodrigo@escola.design" ${user.login === 'rodrigo@escola.design' ? 'selected' : ''}>Rodrigo Alves (Aluno 3)</option>
            <option value="admin@escola.design" ${user.login === 'admin@escola.design' ? 'selected' : ''}>Administrador (Master)</option>
          </select>
        </div>

        <button class="btn btn-outline" id="quick-help-btn" style="padding: 6px 14px; font-size: 0.82rem;" title="Central de Ajuda">
          <span>🆘</span>
          <span>Professor Virtual</span>
        </button>

        <!-- SINO DE NOTIFICAÇÕES (Seção 33) -->
        <div style="position: relative;">
          <button class="btn btn-outline" id="header-notif-btn" style="padding: 7px 11px; font-size: 0.95rem; position: relative;" title="Notificações">
            <span>🔔</span>
            <span id="notif-badge" style="display: none; position: absolute; top: -4px; right: -4px; background: #ef4444; color: white; border-radius: 10px; font-size: 0.65rem; padding: 1px 5px; font-weight: 700;"></span>
          </button>
          
          <!-- Dropdown Notificações -->
          <div id="notif-dropdown" style="display: none; position: absolute; right: 0; top: 42px; width: 340px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 1000; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border-color); background: rgba(255,255,255,0.02);">
              <span style="font-weight: 700; font-size: 0.88rem;">Notificações</span>
              <button id="notif-read-all-btn" style="background: none; border: none; color: var(--accent-indigo); font-size: 0.75rem; cursor: pointer;">Marcar lidas</button>
            </div>
            <div id="notif-list-container" style="max-height: 320px; overflow-y: auto; padding: 8px 0;">
              <div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.82rem;">Carregando...</div>
            </div>
          </div>
        </div>

        <!-- PERFIL & ENCERRAMENTO DE SESSÃO -->
        <button class="profile-avatar-btn" id="header-profile-btn" data-route="perfil">
          <img src="${user.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="${user.nome}" class="profile-avatar-img" />
          <div class="profile-avatar-info">
            <span class="profile-avatar-name">${user.nome}</span>
            <span class="profile-avatar-role">${user.papel === 'admin' ? 'Administrador' : 'Aluno'}</span>
          </div>
        </button>

        <button class="btn btn-outline" id="header-logout-btn" style="padding: 6px 10px; font-size: 0.8rem; color: #ef4444; border-color: rgba(239,68,68,0.3);" title="Encerrar Sessão">
          <span>🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </header>
  `;
}

export function setupHeader(navigate) {
  const notifBtn = document.getElementById('header-notif-btn');
  const notifDropdown = document.getElementById('notif-dropdown');
  const notifBadge = document.getElementById('notif-badge');
  const notifList = document.getElementById('notif-list-container');
  const readAllBtn = document.getElementById('notif-read-all-btn');
  const logoutBtn = document.getElementById('header-logout-btn');

  // Buscar notificações
  api.getNotifications().then(res => {
    if (res && res.totalNaoLidas > 0) {
      notifBadge.style.display = 'inline-block';
      notifBadge.textContent = res.totalNaoLidas;
    } else {
      notifBadge.style.display = 'none';
    }

    if (notifList && res && res.notifications) {
      if (res.notifications.length === 0) {
        notifList.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.82rem;">Nenhuma notificação recente.</div>';
      } else {
        notifList.innerHTML = res.notifications.map(n => `
          <div style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.05); ${n.lida ? 'opacity: 0.65;' : 'background: rgba(99,102,241,0.05);'} cursor: pointer;" class="notif-item" data-id="${n.id}" data-link="${n.link || ''}">
            <div style="font-weight: 600; font-size: 0.82rem; color: var(--text-primary); margin-bottom: 3px;">${n.titulo}</div>
            <div style="font-size: 0.76rem; color: var(--text-muted); line-height: 1.3;">${n.mensagem}</div>
          </div>
        `).join('');

        notifList.querySelectorAll('.notif-item').forEach(item => {
          item.onclick = async () => {
            const id = item.getAttribute('data-id');
            const link = item.getAttribute('data-link');
            await api.markNotificationRead(id).catch(() => {});
            notifDropdown.style.display = 'none';
            if (link) navigate(link);
          };
        });
      }
    }
  }).catch(() => {});

  if (notifBtn && notifDropdown) {
    notifBtn.onclick = (e) => {
      e.stopPropagation();
      notifDropdown.style.display = notifDropdown.style.display === 'none' ? 'block' : 'none';
    };
    document.addEventListener('click', (e) => {
      if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
        notifDropdown.style.display = 'none';
      }
    });
  }

  if (readAllBtn) {
    readAllBtn.onclick = async () => {
      await api.markAllNotificationsRead().catch(() => {});
      notifBadge.style.display = 'none';
      if (notifList) {
        notifList.querySelectorAll('.notif-item').forEach(el => el.style.opacity = '0.65');
      }
    };
  }

  if (logoutBtn) {
    logoutBtn.onclick = () => {
      api.logout();
      navigate('login');
    };
  }
}
