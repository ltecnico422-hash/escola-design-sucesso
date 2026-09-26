import { api } from '../services/api.js';
import { showToast } from '../components/Toast.js';

export async function renderKnowledge(container, navigateFn, initialSearch = '') {
  container.innerHTML = `
    <div style="text-align: center; padding: 60px 0;">
      <p style="color: var(--text-muted);">Carregando Central de Conhecimento...</p>
    </div>
  `;

  let currentTab = 'interna'; // 'interna' ou 'externa'
  let currentSoftware = 'todos';

  async function loadAndRender() {
    try {
      const articles = await api.getKnowledgeArticles({
        software: currentSoftware !== 'todos' ? currentSoftware : undefined,
        q: initialSearch || undefined
      });

      const user = api.getCurrentUser();
      const isAdmin = user && user.papel === 'admin';

      container.innerHTML = `
        <div style="margin-bottom: 28px;">
          <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); letter-spacing: -0.02em;">
            Central de Conhecimento Técnico
          </h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Base de consulta oficial, bibliotecas conceituais e motor de pesquisa didática na web com citação obrigatória de fontes.
          </p>
        </div>

        <!-- ABAS: BASE INTERNA vs PESQUISA NA INTERNET -->
        <div style="display: flex; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 12px;">
          <button class="btn ${currentTab === 'interna' ? 'btn-primary' : 'btn-outline'}" id="tab-internal-btn" style="font-size: 0.88rem;">
            <span>📚 Base Interna da Escola</span>
          </button>
          <button class="btn ${currentTab === 'externa' ? 'btn-primary' : 'btn-outline'}" id="tab-external-btn" style="font-size: 0.88rem;">
            <span>🌐 Pesquisar na Web (Docs Oficiais)</span>
          </button>
        </div>

        <div id="knowledge-tab-content"></div>
      `;

      const tabContent = container.querySelector('#knowledge-tab-content');

      if (currentTab === 'interna') {
        renderInternalTab(tabContent, articles, isAdmin);
      } else {
        renderExternalSearchTab(tabContent, isAdmin);
      }

      container.querySelector('#tab-internal-btn').onclick = () => {
        currentTab = 'interna';
        loadAndRender();
      };
      container.querySelector('#tab-external-btn').onclick = () => {
        currentTab = 'externa';
        loadAndRender();
      };

    } catch (err) {
      container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px;">Erro: ${err.message}</div>`;
    }
  }

  function renderInternalTab(target, articles, isAdmin) {
    let cardsHtml = '';
    articles.forEach(art => {
      cardsHtml += `
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 24px; display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
            <div>
              <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--accent-cyan);">
                ${art.software} • ${art.categoria}
              </span>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-white); margin-top: 4px;">${art.titulo}</h3>
            </div>
            <span class="course-badge" style="background: rgba(99, 102, 241, 0.15); color: var(--primary);">
              ${art.tipo_fonte.toUpperCase()}
            </span>
          </div>

          <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.6; margin: 0;">
            ${art.conteudo_resumo}
          </p>

          ${art.passo_a_passo ? `
            <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 12px 16px; font-family: var(--font-mono); font-size: 0.82rem; color: var(--text-main); white-space: pre-line;">
              ${art.passo_a_passo}
            </div>
          ` : ''}

          <div style="margin-top: auto; padding-top: 14px; border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--text-subtle);">
            <span>Fonte: <strong>${art.fonte}</strong></span>
            ${art.url ? `<a href="${art.url}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: none;">Acessar Doc Oficial ↗</a>` : ''}
          </div>
        </div>
      `;
    });

    target.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 24px;">
        ${cardsHtml || '<p style="color: var(--text-subtle);">Nenhum artigo encontrado com os filtros atuais.</p>'}
      </div>
    `;
  }

  function renderExternalSearchTab(target, isAdmin) {
    target.innerHTML = `
      <div style="background-color: var(--bg-card); border: 1px solid var(--border-glow); border-radius: var(--radius-lg); padding: 28px; margin-bottom: 24px;">
        <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-white); margin-bottom: 8px;">
          Pesquisador Técnico & Assistente Especializado
        </h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px;">
          Consulte documentações oficiais da Adobe, Corel, ABIGRAF e referências com rigor técnico.
        </p>

        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 12px; margin-bottom: 16px;">
          <input
            type="text"
            id="external-search-input"
            placeholder="Ex: Como exportar PDF/X-1a no CorelDRAW sem converter RGB..."
            style="background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px 14px; color: var(--text-white); font-family: var(--font-sans); font-size: 0.9rem;"
          />
          <select id="external-search-software" style="background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; color: var(--text-white); font-family: var(--font-sans); font-size: 0.85rem;">
            <option value="Photoshop">Photoshop</option>
            <option value="Illustrator">Illustrator</option>
            <option value="CorelDRAW">CorelDRAW</option>
            <option value="After Effects">After Effects</option>
            <option value="Fundamentos">Fundamentos do Design</option>
          </select>
          <select id="external-search-mode" style="background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 10px; color: var(--text-white); font-family: var(--font-sans); font-size: 0.85rem;">
            <option value="aprender">🎓 Modo Aprender</option>
            <option value="solucionar">🛠 Modo Solucionar</option>
            <option value="pesquisar">🔎 Pesquisa Técnica</option>
          </select>
          <button class="btn btn-primary" id="btn-run-external-search">
            <span>Consultar</span>
          </button>
        </div>
      </div>

      <div id="external-search-result-box"></div>
    `;

    const runBtn = target.querySelector('#btn-run-external-search');
    const input = target.querySelector('#external-search-input');
    const softwareSelect = target.querySelector('#external-search-software');
    const modeSelect = target.querySelector('#external-search-mode');
    const resultBox = target.querySelector('#external-search-result-box');

    runBtn.onclick = async () => {
      const termo = input.value.trim();
      if (!termo) {
        showToast('Digite um termo para pesquisar.', 'error');
        return;
      }

      runBtn.disabled = true;
      runBtn.innerText = 'Pesquisando...';
      resultBox.innerHTML = `
        <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
          <p>Consultando manuais oficiais e compilando resposta didática...</p>
        </div>
      `;

      try {
        const data = await api.searchExternalKnowledge(termo, modeSelect.value, softwareSelect.value);

        let sourcesHtml = '';
        data.fontes.forEach(f => {
          sourcesHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); font-size: 0.78rem;">
              <span><strong>${f.nome}</strong> (${f.tipo})</span>
              <a href="${f.url}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); text-decoration: none;">Verificação da Fonte ↗</a>
            </div>
          `;
        });

        resultBox.innerHTML = `
          <div style="background-color: var(--bg-card); border: 1px solid var(--border-glow); border-radius: var(--radius-lg); padding: 28px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <span class="course-badge" style="background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan);">
                Modo: ${data.modo.toUpperCase()} • Data da Consulta: ${data.dataConsulta}
              </span>
              ${isAdmin ? `
                <button class="btn btn-secondary" id="btn-promote-to-db" style="font-size: 0.75rem; padding: 5px 12px;">
                  + Adicionar à Base de Conhecimento
                </button>
              ` : ''}
            </div>

            <h3 style="font-size: 1.3rem; font-weight: 800; color: var(--text-white); margin-bottom: 14px;">
              ${data.titulo}
            </h3>

            ${data.oQueE ? `
              <div style="margin-bottom: 16px;">
                <strong style="color: var(--accent-cyan); display: block; font-size: 0.85rem; margin-bottom: 4px;">O que é?</strong>
                <p style="font-size: 0.92rem; color: var(--text-main); margin: 0;">${data.oQueE}</p>
              </div>
              <div style="margin-bottom: 16px;">
                <strong style="color: var(--accent-cyan); display: block; font-size: 0.85rem; margin-bottom: 4px;">Por que existe?</strong>
                <p style="font-size: 0.92rem; color: var(--text-main); margin: 0;">${data.porQueExiste}</p>
              </div>
              <div style="margin-bottom: 16px;">
                <strong style="color: var(--accent-cyan); display: block; font-size: 0.85rem; margin-bottom: 4px;">Como funciona?</strong>
                <p style="font-size: 0.92rem; color: var(--text-main); margin: 0;">${data.comoFunciona}</p>
              </div>
            ` : ''}

            ${data.resumo ? `<p style="font-size: 0.95rem; color: var(--text-main); margin-bottom: 16px;">${data.resumo}</p>` : ''}
            ${data.diagnostico ? `<p style="font-size: 0.95rem; color: var(--text-main); margin-bottom: 16px;"><strong>Diagnóstico:</strong> ${data.diagnostico}</p>` : ''}

            ${data.passoAPasso ? `
              <div style="margin-bottom: 16px;">
                <strong style="color: var(--accent-amber); display: block; font-size: 0.85rem; margin-bottom: 6px;">Passo a Passo Técnico:</strong>
                <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 14px; font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-main);">
                  ${Array.isArray(data.passoAPasso) ? data.passoAPasso.join('\n') : data.passoAPasso}
                </div>
              </div>
            ` : ''}

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-subtle);">
              <strong style="font-size: 0.82rem; color: var(--text-muted); display: block; margin-bottom: 8px;">Fontes Oficiais Consultadas (Citação Obrigatória):</strong>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${sourcesHtml}
              </div>
            </div>
          </div>
        `;

        if (isAdmin) {
          const promoteBtn = resultBox.querySelector('#btn-promote-to-db');
          if (promoteBtn) {
            promoteBtn.onclick = async () => {
              try {
                await api.request('/knowledge', {
                  method: 'POST',
                  body: JSON.stringify({
                    titulo: data.titulo,
                    fonte: data.fontes[0].nome,
                    url: data.fontes[0].url,
                    software: softwareSelect.value,
                    categoria: 'Pesquisa Curada',
                    conteudo_resumo: data.resumo || data.oQueE || data.diagnostico,
                    passo_a_passo: Array.isArray(data.passoAPasso) ? data.passoAPasso.join('\n') : data.passoAPasso,
                    tipo_fonte: 'oficial'
                  })
                });
                showToast('Artigo adicionado à Base Interna com sucesso!');
                promoteBtn.disabled = true;
                promoteBtn.innerText = 'Indexado ✓';
              } catch (err) {
                showToast('Erro ao indexar artigo.', 'error');
              }
            };
          }
        }

      } catch (err) {
        resultBox.innerHTML = `<div style="color: var(--accent-rose); padding: 20px;">Erro na pesquisa: ${err.message}</div>`;
      } finally {
        runBtn.disabled = false;
        runBtn.innerHTML = '<span>Consultar</span>';
      }
    };
  }

  loadAndRender();
}
