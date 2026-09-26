import { api } from '../services/api.js';

export async function renderTrack(container, navigateFn) {
  container.innerHTML = `
    <div style="text-align: center; padding: 60px 0;">
      <p style="color: var(--text-muted);">Carregando trilha de formação profissional...</p>
    </div>
  `;

  try {
    const track = await api.getTrainingTrack();

    const stateLabels = {
      concluido: { label: 'Concluído', color: 'var(--accent-emerald)', icon: '✅' },
      em_andamento: { label: 'Em Andamento', color: 'var(--primary)', icon: '⏳' },
      recomendado: { label: 'Recomendado', color: 'var(--accent-amber)', icon: '⭐' },
      bloqueado: { label: 'Pré-requisito Pendente', color: 'var(--text-subtle)', icon: '🔒' }
    };

    let timelineHtml = '<div class="track-timeline">';
    track.forEach((item, index) => {
      const stateInfo = stateLabels[item.estado] || stateLabels.bloqueado;
      const isLocked = item.estado === 'bloqueado';

      timelineHtml += `
        <div class="track-node ${item.estado}">
          <div style="display: flex; align-items: center; gap: 18px;">
            <div style="width: 48px; height: 48px; border-radius: var(--radius-md); background: ${item.cor_tema || '#6366f1'}; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: #fff; font-weight: 800;">
              ${index + 1}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: ${stateInfo.color};">
                  ${stateInfo.icon} ${stateInfo.label}
                </span>
                <span style="color: var(--text-subtle); font-size: 0.75rem;">• Carga: ${item.carga_horaria}h</span>
              </div>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-white); margin-bottom: 4px;">${item.titulo}</h3>
              <p style="font-size: 0.82rem; color: var(--text-muted); max-width: 600px; margin: 0;">${item.descricao}</p>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 20px;">
            <div style="text-align: right; min-width: 90px;">
              <span style="font-size: 1.1rem; font-weight: 800; color: ${stateInfo.color};">${item.percentual}%</span>
              <span style="font-size: 0.7rem; color: var(--text-subtle); display: block;">Conclusão</span>
            </div>
            ${isLocked
              ? `<button class="btn btn-outline" disabled style="opacity: 0.5; cursor: not-allowed;">
                   <span>Bloqueado</span> <span>🔒</span>
                 </button>`
              : `<button class="btn btn-primary" data-track-open="${item.slug}">
                   <span>Acessar Etapa</span> <span>→</span>
                 </button>`
            }
          </div>
        </div>
      `;
    });
    timelineHtml += '</div>';

    container.innerHTML = `
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); letter-spacing: -0.02em;">
          Trilha de Formação Profissional
        </h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Fluxo pedagógico estruturado de 5 níveis: <strong>Iniciante → Básico → Intermediário → Avançado → Profissional</strong>.
        </p>
      </div>

      ${timelineHtml}
    `;

    container.querySelectorAll('[data-track-open]').forEach(btn => {
      btn.onclick = () => {
        const slug = btn.getAttribute('data-track-open');
        navigateFn('curso-detalhe', { slug });
      };
    });

  } catch (err) {
    container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px;">Erro ao carregar trilha: ${err.message}</div>`;
  }
}
