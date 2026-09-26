import { api } from '../services/api.js';

export async function renderHistory(container, navigateFn) {
  container.innerHTML = `
    <div style="text-align: center; padding: 60px 0;">
      <p style="color: var(--text-muted);">Carregando histórico de atividades...</p>
    </div>
  `;

  try {
    const history = await api.getMyHistory();

    function formatDateTime(dtStr) {
      if (!dtStr) return '';
      const d = new Date(dtStr);
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      const hora = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${dia}/${mes}/${ano} às ${hora}:${min}`;
    }

    let itemsHtml = '';
    if (history.length === 0) {
      itemsHtml = `
        <div style="background-color: var(--bg-card); border: 1px dashed var(--border-subtle); border-radius: var(--radius-md); padding: 48px; text-align: center;">
          <span style="font-size: 2.2rem; display: block; margin-bottom: 12px;">⏱️</span>
          <h4 style="font-size: 1.1rem; color: var(--text-white); font-weight: 700; margin-bottom: 6px;">Nenhuma atividade registrada ainda</h4>
          <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 480px; margin: 0 auto;">
            Assim que você concluir aulas, entregar exercícios práticos, realizar quizzes ou enviar projetos para a banca, o seu histórico cronológico será atualizado automaticamente aqui.
          </p>
        </div>
      `;
    } else {
      itemsHtml = history.map((item, idx) => {
        let icon = '📌';
        let badgeColor = 'var(--accent-indigo)';
        let badgeBg = 'rgba(99, 102, 241, 0.12)';

        if (item.tipo === 'aula_concluida') {
          icon = '🎓';
          badgeColor = 'var(--accent-emerald)';
          badgeBg = 'rgba(16, 185, 129, 0.12)';
        } else if (item.tipo === 'exercicio_entregue') {
          icon = '✍️';
          badgeColor = 'var(--accent-cyan)';
          badgeBg = 'rgba(6, 182, 212, 0.12)';
        } else if (item.tipo === 'quiz_realizado') {
          icon = '📝';
          badgeColor = 'var(--accent-amber)';
          badgeBg = 'rgba(245, 158, 11, 0.12)';
        } else if (item.tipo === 'projeto_enviado') {
          icon = '🎨';
          badgeColor = 'var(--accent-rose)';
          badgeBg = 'rgba(244, 63, 94, 0.12)';
        }

        return `
          <div style="display: flex; gap: 18px; margin-bottom: 20px; position: relative;">
            <!-- Linha vertical da linha do tempo -->
            <div style="display: flex; flex-direction: column; align-items: center;">
              <div style="width: 36px; height: 36px; border-radius: 50%; background: ${badgeBg}; color: ${badgeColor}; display: flex; align-items: center; justify-content: center; font-size: 1rem; border: 1px solid ${badgeColor}; flex-shrink: 0; z-index: 1;">
                ${icon}
              </div>
              ${idx < history.length - 1 ? '<div style="width: 2px; flex: 1; background: var(--border-subtle); margin: 6px 0;"></div>' : ''}
            </div>

            <!-- Conteúdo do evento -->
            <div style="flex: 1; background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 16px 20px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                <div>
                  <span style="font-size: 0.72rem; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: ${badgeBg}; color: ${badgeColor}; margin-right: 8px;">
                    ${item.titulo}
                  </span>
                  <span style="font-size: 0.78rem; color: var(--text-subtle);">
                    ${formatDateTime(item.created_at)}
                  </span>
                </div>
                ${item.aula_id ? `
                  <button class="btn btn-outline" style="font-size: 0.72rem; padding: 3px 10px;" data-goto-lesson="${item.aula_id}">
                    Ver Aula →
                  </button>
                ` : ''}
                ${!item.aula_id && item.curso_slug ? `
                  <button class="btn btn-outline" style="font-size: 0.72rem; padding: 3px 10px;" data-goto-course="${item.curso_slug}">
                    Ver Curso →
                  </button>
                ` : ''}
              </div>

              <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-white); margin-bottom: 4px;">
                ${item.descricao}
              </div>

              ${item.curso_titulo ? `
                <div style="font-size: 0.76rem; color: var(--text-muted);">
                  Curso: <strong>${item.curso_titulo}</strong> ${item.software_area ? `(${item.software_area})` : ''}
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    }

    container.innerHTML = `
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); letter-spacing: -0.02em;">
          Histórico de Atividades
        </h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Registro cronológico e auditável de todo o seu percurso de aprendizagem e evolução técnica.
        </p>
      </div>

      <div style="max-width: 800px;">
        ${itemsHtml}
      </div>
    `;

    container.querySelectorAll('[data-goto-lesson]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-goto-lesson');
        navigateFn('aula-player', { id });
      };
    });

    container.querySelectorAll('[data-goto-course]').forEach(btn => {
      btn.onclick = () => {
        const slug = btn.getAttribute('data-goto-course');
        navigateFn('curso-detalhe', { slug });
      };
    });

  } catch (err) {
    container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px;">Erro ao carregar histórico: ${err.message}</div>`;
  }
}
