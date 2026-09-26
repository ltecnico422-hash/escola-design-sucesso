import { api } from '../services/api.js';
import { showToast } from '../components/Toast.js';

export async function renderProgress(container, navigateFn) {
  container.innerHTML = `
    <div style="text-align: center; padding: 60px 0;">
      <p style="color: var(--text-muted);">Carregando métricas reais de desempenho...</p>
    </div>
  `;

  try {
    const summary = await api.getProgressSummary();

    let coursesCardsHtml = '';
    summary.cursos.forEach(c => {
      coursesCardsHtml += `
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--accent-cyan);">${c.software_area}</span>
              <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-white); margin-top: 2px;">${c.titulo}</h3>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <button class="btn ${c.marcado_revisao ? 'btn-primary' : 'btn-outline'}" style="font-size: 0.75rem; padding: 6px 12px;" data-toggle-review="${c.curso_id}">
                ${c.marcado_revisao ? '⭐ Marcado p/ Revisão' : 'Marcar p/ Modo Revisar'}
              </button>
              <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 6px 14px;" data-open-slug="${c.slug}">
                Ir ao Curso →
              </button>
            </div>
          </div>

          <div class="progress-container">
            <div class="progress-header">
              <span>Cálculo Ponderado Real</span>
              <span class="progress-percent" style="font-size: 1.1rem;">${c.percentual_calculado}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar" style="width: ${c.percentual_calculado}%; background: linear-gradient(90deg, ${c.cor_tema || 'var(--primary)'}, var(--accent-cyan));"></div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 14px; background: rgba(0,0,0,0.2); border-radius: var(--radius-md); padding: 14px; font-size: 0.82rem; color: var(--text-muted);">
            <div>
              <strong style="color: var(--text-white); display: block; font-size: 1.05rem;">${c.aulas_concluidas}/${c.total_aulas}</strong>
              <span>Aulas Concluídas</span>
            </div>
            <div>
              <strong style="color: var(--text-white); display: block; font-size: 1.05rem;">${c.exercicios_concluidos}/${c.total_exercicios}</strong>
              <span>Exercícios Práticos</span>
            </div>
            <div>
              <strong style="color: var(--text-white); display: block; font-size: 1.05rem;">${c.quizzes_aprovados}/${c.total_quizzes}</strong>
              <span>Quizzes Aprovados</span>
            </div>
            <div>
              <strong style="color: var(--text-white); display: block; font-size: 1.05rem;">${c.projetos_concluidos}/${c.total_projetos}</strong>
              <span>Projetos Aprovados</span>
            </div>
            <div>
              <strong style="color: var(--text-white); display: block; font-size: 1.05rem;">${c.horas_estudadas}h</strong>
              <span>Tempo Dedicado</span>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); letter-spacing: -0.02em;">
          Meu Progresso e Rendimento Acadêmico
        </h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Conforme a regra de ouro da skill, nenhum percentual é estático: cada número reflete registros reais no banco de dados.
        </p>
      </div>

      <div class="metrics-ribbon">
        <div class="metric-card">
          <div class="metric-icon" style="background: rgba(99, 102, 241, 0.15); color: var(--primary);">⏱</div>
          <div>
            <div class="metric-value">${summary.totalHoras}h</div>
            <div class="metric-label">Carga Horária Cumprida</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon" style="background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan);">📈</div>
          <div>
            <div class="metric-value">${summary.progressoGeral}%</div>
            <div class="metric-label">Média da Formação</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald);">🎯</div>
          <div>
            <div class="metric-value">${summary.exerciciosFeitos}</div>
            <div class="metric-label">Exercícios Entregues</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 32px;">
        <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--text-white); margin-bottom: 20px;">
          Detalhamento por Curso Matriculado
        </h3>
        ${coursesCardsHtml}
      </div>
    `;

    container.querySelectorAll('[data-toggle-review]').forEach(btn => {
      btn.onclick = async () => {
        const cursoId = parseInt(btn.getAttribute('data-toggle-review'));
        try {
          const res = await api.request('/progress/toggle-review', {
            method: 'POST',
            body: JSON.stringify({ cursoId })
          });
          showToast(res.marcado ? 'Curso incluído no Modo Revisar!' : 'Curso removido do Modo Revisar.');
          renderProgress(container, navigateFn);
        } catch (e) {
          showToast('Erro ao alternar revisão.', 'error');
        }
      };
    });

    container.querySelectorAll('[data-open-slug]').forEach(btn => {
      btn.onclick = () => {
        const slug = btn.getAttribute('data-open-slug');
        navigateFn('curso-detalhe', { slug });
      };
    });

  } catch (err) {
    container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px;">Erro: ${err.message}</div>`;
  }
}
