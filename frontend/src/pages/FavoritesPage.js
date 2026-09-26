import { api } from '../services/api.js';

export async function renderFavorites(container, navigateFn) {
  container.innerHTML = `
    <div style="text-align: center; padding: 60px 0;">
      <p style="color: var(--text-muted);">Carregando conteúdos favoritos...</p>
    </div>
  `;

  try {
    const favorites = await api.getMyFavorites();

    let itemsHtml = '';
    favorites.forEach(f => {
      const item = f.item;
      let title = 'Conteúdo Favorito';
      let subtitle = '';
      let actionRoute = 'cursos';
      let actionParams = {};

      if (f.tipo_item === 'curso') {
        title = `📚 ${item.titulo}`;
        subtitle = `Curso • ${item.software_area}`;
        actionRoute = 'curso-detalhe';
        actionParams = { slug: item.slug };
      } else if (f.tipo_item === 'aula') {
        title = `▶️ ${item.titulo}`;
        subtitle = `Aula • ${item.curso_titulo}`;
        actionRoute = 'aula-player';
        actionParams = { id: item.id };
      } else if (f.tipo_item === 'conhecimento') {
        title = `🧠 ${item.titulo}`;
        subtitle = `Artigo • ${item.software}`;
        actionRoute = 'conhecimento';
        actionParams = { search: item.titulo };
      }

      itemsHtml += `
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--accent-cyan);">${subtitle}</span>
            <h4 style="font-size: 1.05rem; font-weight: 600; color: var(--text-white); margin-top: 4px;">${title}</h4>
          </div>
          <button class="btn btn-primary" style="font-size: 0.8rem; padding: 6px 14px;" data-fav-route="${actionRoute}" data-fav-params='${JSON.stringify(actionParams)}'>
            Acessar →
          </button>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); letter-spacing: -0.02em;">
          Meus Favoritos
        </h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Cursos, aulas e artigos marcados para acesso rápido.
        </p>
      </div>

      <div>
        ${itemsHtml || `
          <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 40px; text-align: center;">
            <span style="font-size: 2rem; display: block; margin-bottom: 10px;">⭐</span>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Você ainda não marcou conteúdos como favoritos. Clique na estrela dentro das aulas ou cursos para adicioná-los aqui.</p>
          </div>
        `}
      </div>
    `;

    container.querySelectorAll('[data-fav-route]').forEach(btn => {
      btn.onclick = () => {
        const route = btn.getAttribute('data-fav-route');
        const params = JSON.parse(btn.getAttribute('data-fav-params') || '{}');
        navigateFn(route, params);
      };
    });

  } catch (err) {
    container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px;">Erro: ${err.message}</div>`;
  }
}
