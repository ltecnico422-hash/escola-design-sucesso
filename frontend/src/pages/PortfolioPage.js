import { api } from '../services/api.js';
import { showToast } from '../components/Toast.js';

export async function renderPortfolio(container, navigateFn) {
  container.innerHTML = `
    <div style="text-align: center; padding: 60px 0;">
      <p style="color: var(--text-muted);">Carregando portfólio profissional...</p>
    </div>
  `;

  try {
    const [portfolio, courses] = await Promise.all([
      api.getMyPortfolio(),
      api.getCourses()
    ]);

    let cardsHtml = '';
    portfolio.forEach(item => {
      const isApproved = item.status === 'aprovado';
      cardsHtml += `
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; display: flex; flex-direction: column;">
          <div style="height: 200px; background-image: url('${item.imagem_url}'); background-size: cover; background-position: center; position: relative;">
            <span class="course-badge" style="position: absolute; top: 12px; right: 12px; background: ${isApproved ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)'}; color: #fff;">
              ${isApproved ? 'Aprovado ✓' : 'Em Análise'}
            </span>
          </div>

          <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
            <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--accent-cyan);">
              ${item.curso_titulo} • ${item.categoria || 'Geral'}
            </span>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-white); margin: 6px 0 10px;">
              ${item.titulo}
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px;">
              ${item.descricao || ''}
            </p>

            ${item.feedback_admin ? `
              <div style="background: rgba(99, 102, 241, 0.08); border-left: 3px solid var(--primary); padding: 10px 14px; border-radius: 0 var(--radius-sm) var(--radius-sm) 0; margin-top: auto; font-size: 0.78rem; color: var(--text-main);">
                <strong>Parecer do Avaliador:</strong> ${item.feedback_admin}
                ${item.nota ? `<span style="display: block; font-weight: 700; color: var(--accent-emerald); margin-top: 4px;">Nota Final: ${item.nota}/100</span>` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });

    let courseOptions = '';
    courses.forEach(c => {
      courseOptions += `<option value="${c.id}">${c.titulo}</option>`;
    });

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; flex-wrap: wrap; gap: 16px;">
        <div>
          <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); letter-spacing: -0.02em;">
            Meu Portfólio Profissional
          </h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Peças e projetos práticos submetidos durante a formação, avaliados pelo corpo docente.
          </p>
        </div>

        <button class="btn btn-primary" id="btn-open-submit-project">
          <span>+ Submeter Novo Projeto</span>
        </button>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px;">
        ${cardsHtml || '<p style="color: var(--text-subtle); padding: 20px;">Você ainda não enviou projetos para o portfólio.</p>'}
      </div>

      <!-- MODAL DE SUBMISSÃO DE PROJETO -->
      <div class="modal-overlay" id="project-submit-modal">
        <div class="modal-card">
          <div class="modal-header">
            <h3 style="color: var(--text-white); font-size: 1.15rem; margin: 0;">Submeter Projeto ao Portfólio</h3>
            <button id="close-project-modal" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem;">✕</button>
          </div>
          <div class="modal-body">
            <form id="submit-project-form" style="display: flex; flex-direction: column; gap: 16px;">
              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Curso Relacionado:</label>
                <select id="proj-course-id" required style="width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-white);">
                  ${courseOptions}
                </select>
              </div>

              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Título da Peça Gráfica:</label>
                <input type="text" id="proj-title" placeholder="Ex: Campanha Publicitária de Verão" required style="width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-white);" />
              </div>

              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 6px;">URL da Imagem de Apresentação (Render/Mockup):</label>
                <input type="url" id="proj-image-url" placeholder="https://images.unsplash.com/photo-..." required style="width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-white);" />
              </div>

              <div>
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Descrição do Conceito e Técnicas Aplicadas:</label>
                <textarea id="proj-desc" rows="4" placeholder="Descreva as técnicas de recorte, curvas de cor ou tipografia utilizadas..." required style="width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-white); font-family: var(--font-sans);"></textarea>
              </div>

              <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
                Enviar para Avaliação Docente →
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    const modal = container.querySelector('#project-submit-modal');
    const openBtn = container.querySelector('#btn-open-submit-project');
    const closeBtn = container.querySelector('#close-project-modal');
    const form = container.querySelector('#submit-project-form');

    openBtn.onclick = () => modal.classList.add('active');
    closeBtn.onclick = () => modal.classList.remove('active');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };

    form.onsubmit = async (e) => {
      e.preventDefault();
      const cursoId = parseInt(container.querySelector('#proj-course-id').value);
      const titulo = container.querySelector('#proj-title').value;
      const imagemUrl = container.querySelector('#proj-image-url').value;
      const descricao = container.querySelector('#proj-desc').value;

      try {
        await api.submitProject({
          projectId: 1,
          cursoId,
          titulo,
          imagemUrl,
          descricao
        });
        showToast('Projeto enviado com sucesso para o portfólio!');
        modal.classList.remove('active');
        renderPortfolio(container, navigateFn);
      } catch (err) {
        showToast(`Erro ao submeter: ${err.message}`, 'error');
      }
    };

  } catch (err) {
    container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px;">Erro: ${err.message}</div>`;
  }
}
