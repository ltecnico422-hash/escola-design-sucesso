import { api } from '../services/api.js';

export function renderSidebar(currentRoute = 'inicio') {
  const user = api.getCurrentUser();
  const isAdmin = user && user.papel === 'admin';

  const navItems = [
    { section: 'Principal' },
    { id: 'inicio', label: 'Início', icon: '🏠', badge: null },
    { id: 'cursos', label: 'Meus Cursos', icon: '📚', badge: '5' },
    { id: 'formacao', label: 'Formação', icon: '🎓', badge: null },

    { section: 'Softwares & Fundamentos' },
    { id: 'photoshop', label: 'Photoshop', icon: '🎨', badge: '16 Mód.' },
    { id: 'illustrator', label: 'Illustrator', icon: '✒️', badge: null },
    { id: 'after-effects', label: 'After Effects', icon: '🎬', badge: null },
    { id: 'coreldraw', label: 'CorelDRAW', icon: '📐', badge: null },
    { id: 'fundamentos-design', label: 'Fundamentos do Design', icon: '📖', badge: null },

    { section: 'Suporte & Conhecimento' },
    { id: 'conhecimento', label: 'Central de Conhecimento', icon: '🧠', badge: 'Oficial' },
    { id: 'ajuda', label: 'Central de Ajuda', icon: '🆘', badge: 'IA' },

    { section: 'Estudo & Prática' },
    { id: 'revisao', label: 'Revisão', icon: '🔄', badge: null },
    { id: 'progresso', label: 'Meu Progresso', icon: '📊', badge: null },
    { id: 'portfolio', label: 'Meu Portfólio', icon: '📁', badge: null },
    { id: 'certificados', label: 'Certificados', icon: '🏆', badge: null },
    { id: 'favoritos', label: 'Favoritos', icon: '⭐', badge: null },
    { id: 'anotacoes', label: 'Minhas Anotações', icon: '📝', badge: null },
    { id: 'historico', label: 'Histórico', icon: '⏱️', badge: null },

    { section: 'Conta' },
    { id: 'perfil', label: 'Meu Perfil', icon: '👤', badge: null }
  ];

  if (isAdmin) {
    navItems.push(
      { section: 'Gestão' },
      { id: 'admin', label: 'Painel Admin', icon: '⚙️', badge: 'Admin' }
    );
  }

  let navHtml = '';
  for (const item of navItems) {
    if (item.section) {
      navHtml += `<div class="nav-section-title">${item.section}</div>`;
    } else {
      const activeClass = currentRoute === item.id ? 'active' : '';
      const badgeHtml = item.badge ? `<span class="nav-item-badge">${item.badge}</span>` : '';
      navHtml += `
        <a class="nav-item ${activeClass}" data-route="${item.id}" id="nav-btn-${item.id}">
          <span class="nav-item-icon">${item.icon}</span>
          <span>${item.label}</span>
          ${badgeHtml}
        </a>
      `;
    }
  }

  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="brand-logo-icon">ED</div>
        <div class="brand-text">
          <h1>Escola de Design</h1>
          <span>Formação Profissional</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${navHtml}
      </nav>
      <div class="sidebar-footer">
        <div style="font-size: 0.72rem; color: var(--text-subtle); display: flex; justify-content: space-between; align-items: center;">
          <span>Versão 1.0 (Nuvem)</span>
          <span style="display: inline-block; width: 8px; height: 8px; background-color: var(--accent-emerald); border-radius: 50%;"></span>
        </div>
      </div>
    </aside>
  `;
}
