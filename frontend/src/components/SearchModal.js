import { api } from '../services/api.js';

export function renderSearchModal() {
  return `
    <div class="modal-overlay" id="search-modal-overlay">
      <div class="modal-card">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
            <span style="font-size: 1.2rem;">🔍</span>
            <input
              type="text"
              id="global-search-input"
              placeholder="Digite o conceito, ferramenta ou aula (ex: Camadas, Pen Tool, CMYK)..."
              style="width: 100%; background: transparent; border: none; outline: none; font-size: 1.05rem; color: var(--text-white); font-family: var(--font-sans);"
              autocomplete="off"
            />
            <button id="close-search-modal-btn" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem;">✕</button>
          </div>
        </div>
        <div class="modal-body" id="search-results-container" style="min-height: 250px;">
          <div style="text-align: center; color: var(--text-subtle); padding: 40px 0;">
            <p>Digite pelo menos 2 caracteres para pesquisar em toda a plataforma...</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupSearchModal(navigateFn) {
  const overlay = document.getElementById('search-modal-overlay');
  const input = document.getElementById('global-search-input');
  const resultsContainer = document.getElementById('search-results-container');
  const closeBtn = document.getElementById('close-search-modal-btn');
  const openBtn = document.getElementById('open-global-search-btn');

  function openModal() {
    overlay.classList.add('active');
    input.focus();
    input.select();
  }

  function closeModal() {
    overlay.classList.remove('active');
  }

  if (openBtn) openBtn.onclick = openModal;
  if (closeBtn) closeBtn.onclick = closeModal;

  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openModal();
    }
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeModal();
    }
  });

  let debounceTimer = null;
  input.oninput = () => {
    clearTimeout(debounceTimer);
    const term = input.value.trim();

    if (term.length < 2) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-subtle); padding: 40px 0;">
          <p>Digite pelo menos 2 caracteres para pesquisar...</p>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 30px 0;">
        <p>Buscando em cursos, aulas e base de conhecimento...</p>
      </div>
    `;

    debounceTimer = setTimeout(async () => {
      try {
        const data = await api.globalSearch(term);
        renderResults(data, term);
      } catch (err) {
        resultsContainer.innerHTML = `<p style="color: var(--accent-rose);">Erro na busca.</p>`;
      }
    }, 250);
  };

  function renderResults(data, term) {
    if (data.total === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 40px 0;">
          <p>Nenhum resultado encontrado para "<strong>${term}</strong>".</p>
          <p style="font-size: 0.8rem; color: var(--text-subtle); margin-top: 6px;">Tente pesquisar por ferramentas como "Pen Tool", conceitos como "CMYK" ou softwares.</p>
        </div>
      `;
      return;
    }

    let html = `<p style="font-size: 0.78rem; color: var(--text-subtle); margin-bottom: 16px;">Encontrados ${data.total} resultados:</p>`;

    // Cursos
    if (data.cursos && data.cursos.length > 0) {
      html += `<div style="font-size: 0.72rem; text-transform: uppercase; color: var(--accent-cyan); font-weight: 700; margin-bottom: 8px;">Cursos</div>`;
      data.cursos.forEach(c => {
        html += `
          <div class="search-result-item" data-action="curso" data-id="${c.slug}" style="padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); margin-bottom: 8px; cursor: pointer; border: 1px solid var(--border-subtle);">
            <div style="font-weight: 600; color: var(--text-white); font-size: 0.92rem;">📚 ${c.titulo}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${c.descricao.substring(0, 110)}...</div>
          </div>
        `;
      });
    }

    // Aulas
    if (data.aulas && data.aulas.length > 0) {
      html += `<div style="font-size: 0.72rem; text-transform: uppercase; color: var(--accent-amber); font-weight: 700; margin-top: 14px; margin-bottom: 8px;">Aulas e Conceitos</div>`;
      data.aulas.forEach(a => {
        html += `
          <div class="search-result-item" data-action="aula" data-id="${a.id}" style="padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); margin-bottom: 8px; cursor: pointer; border: 1px solid var(--border-subtle);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: 600; color: var(--text-white); font-size: 0.92rem;">▶️ ${a.titulo}</span>
              <span style="font-size: 0.7rem; color: var(--text-subtle);">${a.curso_titulo}</span>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 3px;"><strong>Conceito:</strong> ${a.conceito}</div>
          </div>
        `;
      });
    }

    // Central de Conhecimento
    if (data.conhecimento && data.conhecimento.length > 0) {
      html += `<div style="font-size: 0.72rem; text-transform: uppercase; color: var(--accent-violet); font-weight: 700; margin-top: 14px; margin-bottom: 8px;">Base de Conhecimento</div>`;
      data.conhecimento.forEach(k => {
        html += `
          <div class="search-result-item" data-action="conhecimento" data-id="${k.id}" style="padding: 10px 14px; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); margin-bottom: 8px; cursor: pointer; border: 1px solid var(--border-subtle);">
            <div style="font-weight: 600; color: var(--text-white); font-size: 0.92rem;">🧠 ${k.titulo}</div>
            <div style="font-size: 0.75rem; color: var(--text-subtle); margin-top: 2px;">${k.software} • Fonte: ${k.fonte}</div>
          </div>
        `;
      });
    }

    resultsContainer.innerHTML = html;

    // Conectar cliques nos resultados
    resultsContainer.querySelectorAll('.search-result-item').forEach(el => {
      el.onclick = () => {
        const action = el.getAttribute('data-action');
        const id = el.getAttribute('data-id');
        closeModal();

        if (action === 'curso') {
          navigateFn('curso-detalhe', { slug: id });
        } else if (action === 'aula') {
          navigateFn('aula-player', { id });
        } else if (action === 'conhecimento') {
          navigateFn('conhecimento', { search: id });
        }
      };
    });
  }
}
