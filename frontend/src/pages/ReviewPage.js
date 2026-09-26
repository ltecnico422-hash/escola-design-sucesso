import { api } from '../services/api.js';
import { showToast } from '../components/Toast.js';

export async function renderReview(container, navigateFn) {
  let activeFilter = 'todos';

  async function loadData() {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 0;">
        <p style="color: var(--text-muted);">Carregando conteúdos marcados para revisão...</p>
      </div>
    `;

    try {
      const items = await api.getMyReviews(activeFilter === 'todos' ? null : activeFilter);
      const recommendation = await api.getStudyRecommendation().catch(() => null);

      let cardsHtml = '';
      if (items.length === 0) {
        cardsHtml = `
          <div style="background-color: var(--bg-card); border: 1px dashed var(--border-subtle); border-radius: var(--radius-md); padding: 48px; text-align: center;">
            <span style="font-size: 2.2rem; display: block; margin-bottom: 12px;">🔄</span>
            <h4 style="font-size: 1.1rem; color: var(--text-white); font-weight: 700; margin-bottom: 6px;">Nenhum conteúdo nesta categoria</h4>
            <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 480px; margin: 0 auto;">
              Durante as aulas, clique nos botões <strong>📌 Revisar</strong>, <strong>⭐ Importante</strong> ou <strong>🔥 Difícil</strong> para catalogar os temas que precisam de reforço.
            </p>
          </div>
        `;
      } else {
        cardsHtml = items.map(item => {
          let badgeColor = 'var(--accent-amber)';
          let badgeBg = 'rgba(245, 158, 11, 0.12)';
          let badgeLabel = '📌 Revisar';

          if (item.classificacao === 'importante') {
            badgeColor = 'var(--accent-cyan)';
            badgeBg = 'rgba(6, 182, 212, 0.12)';
            badgeLabel = '⭐ Importante';
          } else if (item.classificacao === 'dificil') {
            badgeColor = 'var(--accent-rose)';
            badgeBg = 'rgba(244, 63, 94, 0.12)';
            badgeLabel = '🔥 Difícil';
          }

          return `
            <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; gap: 16px; transition: transform 0.2s;" onmouseover="this.style.borderColor='var(--border-focus)'" onmouseout="this.style.borderColor='var(--border-subtle)'">
              <div style="flex: 1;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                  <span style="font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; background-color: ${badgeBg}; color: ${badgeColor};">
                    ${badgeLabel}
                  </span>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">
                    ${item.curso_titulo} • Módulo ${item.modulo_ordem || 1}
                  </span>
                </div>
                <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-white); margin-bottom: 4px;">
                  ${item.aula_titulo}
                </h4>
                <div style="font-size: 0.78rem; color: var(--text-subtle);">
                  ⏱️ ${item.duracao_minutos} minutos de estudo prático
                </div>
              </div>

              <div style="display: flex; gap: 10px; align-items: center;">
                <button class="btn btn-primary" style="font-size: 0.82rem; padding: 8px 16px;" data-open-lesson="${item.aula_id}">
                  Revisar Aula →
                </button>
                <button class="btn btn-outline" style="font-size: 0.8rem; padding: 8px 12px; color: var(--text-muted);" title="Remover da lista de revisão" data-remove-review="${item.aula_id}" data-course-id="${item.curso_id}" data-class="${item.classificacao}">
                  ✕
                </button>
              </div>
            </div>
          `;
        }).join('');
      }

      const recHtml = (recommendation && recommendation.tipo === 'revisao_sugerida') ? `
        <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.1)); border: 1px solid var(--accent-indigo); border-radius: var(--radius-md); padding: 18px 24px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 0.76rem; font-weight: 700; color: var(--accent-indigo); text-transform: uppercase;">💡 Recomendação Inteligente de Desempenho</div>
            <div style="font-size: 0.95rem; font-weight: 600; color: var(--text-white); margin-top: 2px;">${recommendation.mensagem}</div>
          </div>
          ${recommendation.proximaAula ? `
            <button class="btn btn-primary" style="font-size: 0.8rem;" id="rec-lesson-btn" data-lesson-id="${recommendation.proximaAula.id}">
              Iniciar Revisão Sugerida →
            </button>
          ` : ''}
        </div>
      ` : '';

      container.innerHTML = `
        <div style="margin-bottom: 24px;">
          <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); letter-spacing: -0.02em;">
            Sistema de Revisão
          </h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Acesse conteúdos categorizados para fixação técnica, pontos difíceis e tópicos essenciais de formação.
          </p>
        </div>

        ${recHtml}

        <!-- FILTROS DE CATEGORIA -->
        <div style="display: flex; gap: 8px; margin-bottom: 20px;">
          <button class="btn ${activeFilter === 'todos' ? 'btn-primary' : 'btn-outline'}" data-filter="todos" style="font-size: 0.8rem; padding: 6px 14px;">
            Todos os Itens
          </button>
          <button class="btn ${activeFilter === 'revisar' ? 'btn-primary' : 'btn-outline'}" data-filter="revisar" style="font-size: 0.8rem; padding: 6px 14px;">
            📌 Revisar
          </button>
          <button class="btn ${activeFilter === 'importante' ? 'btn-primary' : 'btn-outline'}" data-filter="importante" style="font-size: 0.8rem; padding: 6px 14px;">
            ⭐ Importante
          </button>
          <button class="btn ${activeFilter === 'dificil' ? 'btn-primary' : 'btn-outline'}" data-filter="dificil" style="font-size: 0.8rem; padding: 6px 14px;">
            🔥 Difícil
          </button>
        </div>

        <div>
          ${cardsHtml}
        </div>
      `;

      // Eventos dos filtros
      container.querySelectorAll('[data-filter]').forEach(btn => {
        btn.onclick = () => {
          activeFilter = btn.getAttribute('data-filter');
          loadData();
        };
      });

      // Eventos de abrir aula
      container.querySelectorAll('[data-open-lesson]').forEach(btn => {
        btn.onclick = () => {
          const lessonId = btn.getAttribute('data-open-lesson');
          navigateFn('aula-player', { id: lessonId });
        };
      });

      // Evento de recomendação
      const recBtn = container.querySelector('#rec-lesson-btn');
      if (recBtn) {
        recBtn.onclick = () => {
          const lessonId = recBtn.getAttribute('data-lesson-id');
          navigateFn('aula-player', { id: lessonId });
        };
      }

      // Eventos de remover da revisão
      container.querySelectorAll('[data-remove-review]').forEach(btn => {
        btn.onclick = async () => {
          const aulaId = btn.getAttribute('data-remove-review');
          const cursoId = btn.getAttribute('data-course-id');
          const classificacao = btn.getAttribute('data-class');
          try {
            await api.toggleReview(aulaId, cursoId, classificacao);
            showToast('Item removido da lista de revisão.');
            loadData();
          } catch (e) {
            showToast('Erro ao remover item.', 'error');
          }
        };
      });

    } catch (err) {
      container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px;">Erro ao carregar revisões: ${err.message}</div>`;
    }
  }

  loadData();
}
