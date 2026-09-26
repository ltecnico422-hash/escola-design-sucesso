import { api } from '../services/api.js';

export function renderHelpModal() {
  return `
    <div class="modal-overlay" id="help-modal-overlay">
      <div class="modal-card" style="max-width: 740px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.4rem;">🆘</span>
            <div>
              <h3 style="color: var(--text-white); font-size: 1.1rem; margin: 0;">Central de Ajuda — Professor Virtual</h3>
              <span style="font-size: 0.75rem; color: var(--accent-cyan);">Atendimento Didático Contextual & Pesquisa Técnica</span>
            </div>
          </div>
          <button id="close-help-modal-btn" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem;">✕</button>
        </div>
        <div class="modal-body" style="padding: 20px 24px;">
          <div style="margin-bottom: 16px;">
            <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 6px;">Qual é a sua dúvida ou dificuldade técnica?</label>
            <textarea
              id="help-modal-input"
              rows="3"
              placeholder="Ex: Como funciona o ajuste de curvas no Photoshop? Como evitar que o corte do panfleto fique torto na gráfica?"
              style="width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 12px; color: var(--text-white); font-family: var(--font-sans); font-size: 0.9rem; resize: vertical;"
            ></textarea>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <span style="font-size: 0.75rem; color: var(--text-subtle);">O professor analisa o contexto da aula e consulta a documentação oficial.</span>
            <button class="btn btn-primary" id="help-modal-submit-btn">
              <span>Perguntar ao Professor</span>
              <span>🚀</span>
            </button>
          </div>

          <div id="help-modal-response" style="display: none; border-top: 1px solid var(--border-subtle); padding-top: 20px;">
            <!-- Resposta carregada dinamicamente -->
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupHelpModal() {
  const overlay = document.getElementById('help-modal-overlay');
  const closeBtn = document.getElementById('close-help-modal-btn');
  const openBtn = document.getElementById('quick-help-btn');
  const submitBtn = document.getElementById('help-modal-submit-btn');
  const input = document.getElementById('help-modal-input');
  const responseBox = document.getElementById('help-modal-response');

  function openModal() {
    overlay.classList.add('active');
    input.focus();
  }

  function closeModal() {
    overlay.classList.remove('active');
  }

  if (openBtn) openBtn.onclick = openModal;
  if (closeBtn) closeBtn.onclick = closeModal;

  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };

  if (submitBtn) {
    submitBtn.onclick = async () => {
      const pergunta = input.value.trim();
      if (!pergunta) return;

      submitBtn.disabled = true;
      submitBtn.innerText = 'Consultando base...';
      responseBox.style.display = 'block';
      responseBox.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 20px 0;">
          <p>O Professor Virtual está formulando a explicação passo a passo com referências técnicas...</p>
        </div>
      `;

      try {
        const res = await api.askVirtualProfessor(pergunta);
        responseBox.innerHTML = `
          <div style="background: rgba(99, 102, 241, 0.08); border: 1px solid var(--border-glow); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--accent-cyan);">
                Origem: ${res.origemResposta === 'base_interna' ? 'Base Didática Interna da Escola' : 'Pesquisa na Web com Citação de Fontes'}
              </span>
              <span style="font-size: 0.72rem; color: var(--text-subtle);">${new Date().toLocaleTimeString()}</span>
            </div>
            <div style="font-size: 0.92rem; color: var(--text-white); white-space: pre-line; line-height: 1.7;">
              ${res.resposta}
            </div>
            <div style="margin-top: 14px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.75rem; color: var(--text-subtle);">
              <strong>Fontes consultadas:</strong> ${res.fontesCitadas}
            </div>
          </div>
        `;
      } catch (err) {
        responseBox.innerHTML = `
          <div style="color: var(--accent-rose); padding: 10px;">
            Erro ao processar sua dúvida: ${err.message}
          </div>
        `;
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Perguntar ao Professor</span> <span>🚀</span>';
      }
    };
  }
}
