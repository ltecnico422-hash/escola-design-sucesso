import { api } from '../services/api.js';

export async function renderNotes(container, navigateFn) {
  container.innerHTML = `
    <div style="text-align: center; padding: 60px 0;">
      <p style="color: var(--text-muted);">Carregando suas anotações...</p>
    </div>
  `;

  try {
    const notes = await api.getMyNotes();

    let notesHtml = '';
    notes.forEach(n => {
      notesHtml += `
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 22px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div>
              <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--accent-cyan);">
                ${n.curso_titulo} • ${n.modulo_titulo}
              </span>
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-white); margin-top: 2px;">${n.aula_titulo}</h3>
            </div>
            <button class="btn btn-secondary" style="font-size: 0.78rem; padding: 5px 12px;" data-open-lesson="${n.aula_id}">
              Ir para Aula →
            </button>
          </div>

          <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 14px; color: var(--text-main); font-size: 0.88rem; line-height: 1.6; white-space: pre-line;">
            ${n.texto}
          </div>

          <div style="font-size: 0.72rem; color: var(--text-subtle); margin-top: 10px; text-align: right;">
            Atualizado em: ${new Date(n.updated_at).toLocaleString('pt-BR')}
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); letter-spacing: -0.02em;">
          Minhas Anotações de Estudo
        </h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Seu caderno digital sincronizado com as aulas e exercícios da plataforma.
        </p>
      </div>

      <div>
        ${notesHtml || `
          <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 40px; text-align: center;">
            <span style="font-size: 2rem; display: block; margin-bottom: 10px;">📝</span>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Você ainda não fez anotações nas aulas. Acesse qualquer aula e utilize o painel lateral de anotações.</p>
          </div>
        `}
      </div>
    `;

    container.querySelectorAll('[data-open-lesson]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-open-lesson');
        navigateFn('aula-player', { id });
      };
    });

  } catch (err) {
    container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px;">Erro: ${err.message}</div>`;
  }
}
