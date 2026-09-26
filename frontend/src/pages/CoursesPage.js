import { api } from '../services/api.js';

export async function renderCourses(container, navigateFn, filterInitial = {}) {
  container.innerHTML = `
    <div style="text-align: center; padding: 60px 0;">
      <p style="color: var(--text-muted);">Carregando catálogo de cursos...</p>
    </div>
  `;

  let currentArea = filterInitial.software_area || 'todos';

  async function loadAndRender() {
    try {
      const filters = currentArea !== 'todos' ? { software_area: currentArea } : {};
      const courses = await api.getCourses(filters);

      const softwareFilters = [
        { id: 'todos', label: 'Todos os Cursos' },
        { id: 'Fundamentos', label: '📖 Fundamentos' },
        { id: 'Photoshop', label: '🖌 Photoshop' },
        { id: 'Illustrator', label: '✒️ Illustrator' },
        { id: 'CorelDRAW', label: '🖨 CorelDRAW' },
        { id: 'After Effects', label: '🎬 After Effects' }
      ];

      let filtersHtml = '<div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px;">';
      softwareFilters.forEach(f => {
        const active = currentArea === f.id ? 'btn-primary' : 'btn-secondary';
        filtersHtml += `
          <button class="btn ${active}" data-filter-area="${f.id}" style="font-size: 0.82rem; padding: 8px 16px;">
            ${f.label}
          </button>
        `;
      });
      filtersHtml += '</div>';

      let gridHtml = '<div class="courses-grid">';
      courses.forEach(c => {
        const prog = c.progresso_usuario || 0;
        gridHtml += `
          <div class="course-card">
            <div class="course-card-header">
              <div class="course-software-icon" style="background-color: ${c.cor_tema || '#6366f1'};">
                ${c.software_area.substring(0, 2).toUpperCase()}
              </div>
              <span class="course-badge badge-${c.nivel_minimo.toLowerCase()}">${c.nivel_minimo}</span>
            </div>
            <h3>${c.titulo}</h3>
            <p>${c.descricao}</p>

            <div class="progress-container">
              <div class="progress-header">
                <span>Conclusão Real</span>
                <span class="progress-percent">${prog}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-bar" style="width: ${prog}%; background: linear-gradient(90deg, ${c.cor_tema || 'var(--primary)'}, var(--accent-cyan));"></div>
              </div>
            </div>

            <div class="course-meta">
              <span>⏱ ${c.carga_horaria}h</span>
              <span>📂 ${c.total_modulos} Módulos</span>
              <span>📝 ${c.total_aulas} Aulas</span>
            </div>

            <button class="btn btn-primary" style="width: 100%; margin-top: auto;" data-open-slug="${c.slug}">
              Ver Grade e Aulas →
            </button>
          </div>
        `;
      });
      gridHtml += '</div>';

      container.innerHTML = `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); letter-spacing: -0.02em;">
            Catálogo de Cursos & Softwares
          </h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Matriz curricular rigorosa dividida em módulos, aulas, exercícios práticos, desafios, quizzes e projeto final.
          </p>
        </div>

        ${filtersHtml}
        ${gridHtml}
      `;

      // Eventos de filtro
      container.querySelectorAll('[data-filter-area]').forEach(btn => {
        btn.onclick = () => {
          currentArea = btn.getAttribute('data-filter-area');
          loadAndRender();
        };
      });

      // Eventos de abrir curso
      container.querySelectorAll('[data-open-slug]').forEach(btn => {
        btn.onclick = () => {
          const slug = btn.getAttribute('data-open-slug');
          navigateFn('curso-detalhe', { slug });
        };
      });

    } catch (err) {
      container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px;">Erro ao carregar cursos: ${err.message}</div>`;
    }
  }

  loadAndRender();
}
