import { api } from '../services/api.js';
import { showToast } from '../components/Toast.js';

export async function renderHelpCenter(container, navigateFn) {
  container.innerHTML = `
    <div style="text-align: center; padding: 60px 0;">
      <p style="color: var(--text-muted);">Carregando Central de Ajuda...</p>
    </div>
  `;

  try {
    const [courses, history] = await Promise.all([
      api.getCourses(),
      api.getHelpHistory()
    ]);

    let courseOptionsHtml = '<option value="">Dúvida Geral (Sem curso específico)</option>';
    courses.forEach(c => {
      courseOptionsHtml += `<option value="${c.id}">${c.titulo} (${c.software_area})</option>`;
    });

    let historyHtml = '';
    history.forEach(h => {
      historyHtml += `
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: var(--text-white); font-size: 0.95rem;">${h.pergunta}</strong>
            <span style="font-size: 0.72rem; color: var(--accent-cyan); font-weight: 700; text-transform: uppercase;">
              ${h.origem_resposta === 'base_interna' ? 'Base Interna' : 'Pesquisa Web Oficial'}
            </span>
          </div>
          <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.6; white-space: pre-line; margin-bottom: 10px;">
            ${h.resposta}
          </p>
          <div style="font-size: 0.75rem; color: var(--text-subtle); border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;">
            Fontes: ${h.fontes_citadas || 'Escola Digital de Design'} • ${new Date(h.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); letter-spacing: -0.02em;">
          Central de Ajuda — Professor Virtual
        </h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Tire dúvidas em tempo real contextualizadas com as aulas do seu curso.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
        <!-- FORMULÁRIO DE PERGUNTA -->
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-glow); border-radius: var(--radius-lg); padding: 28px;">
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-white); margin-bottom: 6px;">
            Fazer uma Nova Pergunta
          </h3>
          <p style="font-size: 0.82rem; color: var(--text-subtle); margin-bottom: 18px;">
            O Professor Virtual explica o conceito, fornece passo a passo prático e indica fontes oficiais.
          </p>

          <div style="margin-bottom: 14px;">
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Contexto do Curso:</label>
            <select id="help-course-select" style="width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; color: var(--text-white); font-family: var(--font-sans); font-size: 0.88rem;">
              ${courseOptionsHtml}
            </select>
          </div>

          <div style="margin-bottom: 18px;">
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Sua Dúvida:</label>
            <textarea
              id="help-question-text"
              rows="5"
              placeholder="Ex: Não estou conseguindo fazer o recorte suave de cabelos sem deixar bordas brancas..."
              style="width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; color: var(--text-white); font-family: var(--font-sans); font-size: 0.9rem; resize: vertical;"
            ></textarea>
          </div>

          <button class="btn btn-primary" id="btn-submit-help" style="width: 100%;">
            <span>Enviar Pergunta ao Professor Virtual</span> <span>🚀</span>
          </button>

          <div id="new-help-response" style="margin-top: 24px; display: none;"></div>
        </div>

        <!-- HISTÓRICO DE DÚVIDAS -->
        <div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-white); margin-bottom: 16px;">
            Suas Consultas Recentes
          </h3>
          <div style="max-height: 650px; overflow-y: auto; padding-right: 6px;">
            ${historyHtml || '<p style="color: var(--text-subtle); font-size: 0.85rem;">Você ainda não realizou consultas.</p>'}
          </div>
        </div>
      </div>
    `;

    const submitBtn = container.querySelector('#btn-submit-help');
    const questionInput = container.querySelector('#help-question-text');
    const courseSelect = container.querySelector('#help-course-select');
    const responseBox = container.querySelector('#new-help-response');

    submitBtn.onclick = async () => {
      const pergunta = questionInput.value.trim();
      if (!pergunta) {
        showToast('Digite sua dúvida antes de enviar.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerText = 'O Professor Virtual está respondendo...';
      responseBox.style.display = 'block';
      responseBox.innerHTML = `
        <div style="text-align: center; padding: 20px 0; color: var(--text-muted);">
          <p>Analisando base interna e literatura técnica...</p>
        </div>
      `;

      try {
        const cursoId = courseSelect.value ? parseInt(courseSelect.value) : null;
        const res = await api.askVirtualProfessor(pergunta, cursoId);

        responseBox.innerHTML = `
          <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid var(--border-glow); border-radius: var(--radius-md); padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--accent-cyan);">
                Resposta Didática • ${res.origemResposta === 'base_interna' ? 'Base Interna da Escola' : 'Pesquisa Web com Fontes Oficiais'}
              </span>
            </div>
            <div style="font-size: 0.92rem; color: var(--text-white); line-height: 1.7; white-space: pre-line;">
              ${res.resposta}
            </div>
            <div style="margin-top: 14px; font-size: 0.75rem; color: var(--text-subtle); border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
              Fontes consultadas: <strong>${res.fontesCitadas}</strong>
            </div>
          </div>
        `;

        showToast('Resposta gerada com sucesso pelo Professor Virtual!');
        questionInput.value = '';
      } catch (err) {
        responseBox.innerHTML = `<div style="color: var(--accent-rose); padding: 10px;">Erro: ${err.message}</div>`;
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Enviar Pergunta ao Professor Virtual</span> <span>🚀</span>';
      }
    };

  } catch (err) {
    container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px;">Erro: ${err.message}</div>`;
  }
}
