import { api } from '../services/api.js';
import { showToast } from '../components/Toast.js';

export async function renderAdmin(container, navigateFn) {
  const user = api.getCurrentUser();
  if (!user || user.papel !== 'admin') {
    container.innerHTML = `
      <div style="padding: 60px 20px; text-align: center; color: var(--accent-rose); max-width: 480px; margin: 0 auto;">
        <span style="font-size: 3rem; display: block; margin-bottom: 12px;">🔒</span>
        <h3 style="font-size: 1.4rem; color: var(--text-white); font-weight: 700;">Área Restrita Administrativa</h3>
        <p style="color: var(--text-muted); margin: 8px 0 20px;">Esta área é de uso exclusivo do administrador da plataforma.</p>
        <button class="btn btn-primary" id="btn-login-admin-demo">
          Entrar como Administrador Master →
        </button>
      </div>
    `;
    const btn = container.querySelector('#btn-login-admin-demo');
    if (btn) {
      btn.onclick = async () => {
        await api.login('admin@escola.design', 'admin123');
        renderAdmin(container, navigateFn);
      };
    }
    return;
  }

  container.innerHTML = `
    <div style="text-align: center; padding: 60px 0;">
      <p style="color: var(--text-muted);">Carregando métricas da administração da escola...</p>
    </div>
  `;

  try {
    const [metrics, usersProgress, updates, allUsers] = await Promise.all([
      api.getAdminMetrics(),
      api.getAdminUsersProgress(),
      api.getSoftwareUpdates(),
      api.getAdminUsers().catch(() => [])
    ]);

    // Cards de Usuários - Acompanhamento Individual Real (Seção 31)
    let usersListHtml = '';
    usersProgress.forEach((aluno, idx) => {
      let cursosHtml = '';
      aluno.cursos.forEach(c => {
        cursosHtml += `
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.84rem; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.04);">
            <span style="color: var(--text-muted);">${c.curso_titulo}:</span>
            <strong style="color: var(--accent-cyan);">${c.percentual_calculado}%</strong>
          </div>
        `;
      });

      usersListHtml += `
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 22px; display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <img src="${aluno.foto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="${aluno.nome}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--border-focus);" />
              <div>
                <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--accent-indigo); letter-spacing: 0.05em;">USUÁRIO 0${idx + 1}</span>
                <h4 style="color: var(--text-white); font-size: 1.05rem; margin: 2px 0 0; font-weight: 700;">${aluno.nome}</h4>
                <span style="font-size: 0.75rem; color: var(--text-subtle);">${aluno.login}</span>
              </div>
            </div>
            <span style="font-size: 0.72rem; background: rgba(16,185,129,0.12); color: var(--accent-emerald); padding: 2px 8px; border-radius: 4px; font-weight: 600;">Ativo</span>
          </div>

          <div style="background: rgba(0,0,0,0.25); border-radius: var(--radius-sm); padding: 14px; border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.74rem; text-transform: uppercase; color: var(--text-subtle); font-weight: 700; margin-bottom: 8px;">
              Desempenho por Software (Seção 31)
            </div>
            ${cursosHtml || '<span style="font-size: 0.78rem; color: var(--text-subtle);">Nenhum curso iniciado</span>'}
          </div>

          <div style="font-size: 0.78rem; color: var(--text-subtle); display: flex; justify-content: space-between; margin-top: auto; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
            <span>📁 Projetos: <strong style="color: var(--text-white);">${aluno.projetos.length}</strong></span>
            <span>🏆 Certificados: <strong style="color: var(--text-white);">${aluno.certificados.length}</strong></span>
          </div>
        </div>
      `;
    });

    // Atualizações de software
    let updatesHtml = '';
    updates.forEach(u => {
      updatesHtml += `
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <strong style="color: var(--text-white); font-size: 0.95rem;">${u.software} — ${u.versao}</strong>
            <span class="course-badge" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald);">
              ${u.status_revisao.toUpperCase()}
            </span>
          </div>
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 8px; line-height: 1.4;">${u.mudancas}</p>
          <div style="font-size: 0.75rem; color: var(--accent-amber); background: rgba(245, 158, 11, 0.08); padding: 6px 10px; border-radius: var(--radius-sm);">
            <strong>Aulas Impactadas:</strong> ${u.aulas_afetadas || 'Nenhuma'}
          </div>
        </div>
      `;
    });

    // Tabela de Gerenciamento de Usuários (Seção 30)
    let userRowsHtml = '';
    allUsers.forEach(u => {
      userRowsHtml += `
        <tr style="border-bottom: 1px solid var(--border-subtle);">
          <td style="padding: 12px 14px; font-weight: 600; color: var(--text-white); font-size: 0.88rem;">${u.nome}</td>
          <td style="padding: 12px 14px; color: var(--text-muted); font-size: 0.82rem;">${u.login}</td>
          <td style="padding: 12px 14px; font-size: 0.82rem;">
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 700; ${u.papel === 'admin' ? 'background: rgba(245,158,11,0.15); color: var(--accent-amber);' : 'background: rgba(99,102,241,0.15); color: var(--accent-indigo);'}">
              ${u.papel === 'admin' ? 'Administrador' : 'Aluno'}
            </span>
          </td>
          <td style="padding: 12px 14px; font-size: 0.82rem;">
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 0.72rem; font-weight: 700; ${u.is_ativo ? 'background: rgba(16,185,129,0.15); color: var(--accent-emerald);' : 'background: rgba(244,63,94,0.15); color: var(--accent-rose);'}">
              ${u.is_ativo ? 'Ativo' : 'Desativado'}
            </span>
          </td>
          <td style="padding: 12px 14px; text-align: right;">
            ${u.id !== user.id ? `
              <button class="btn btn-outline" style="font-size: 0.72rem; padding: 4px 8px;" data-toggle-user="${u.id}">
                ${u.is_ativo ? 'Desativar' : 'Reativar'}
              </button>
            ` : '<span style="font-size: 0.72rem; color: var(--text-subtle);">Você</span>'}
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px;">
        <div>
          <span class="course-badge" style="background: rgba(245, 158, 11, 0.15); color: var(--accent-amber); margin-bottom: 6px; display: inline-block;">
            Área Administrativa & Pedagógica
          </span>
          <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); letter-spacing: -0.02em;">
            Painel do Administrador
          </h2>
          <p style="color: var(--text-muted); font-size: 0.88rem;">
            Acompanhamento individual dos alunos, gestão de usuários e controle de atualizações.
          </p>
        </div>
        <button class="btn btn-primary" id="btn-create-user-modal">
          + Criar Novo Usuário
        </button>
      </div>

      <!-- MÉTRICAS GERAIS -->
      <div class="metrics-ribbon" style="margin-bottom: 28px;">
        <div class="metric-card">
          <div class="metric-icon" style="background: rgba(99, 102, 241, 0.15); color: var(--primary);">👥</div>
          <div>
            <div class="metric-value">${metrics.totalAlunos}</div>
            <div class="metric-label">Alunos Oficiais</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon" style="background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan);">📚</div>
          <div>
            <div class="metric-value">${metrics.totalCursos}</div>
            <div class="metric-label">Cursos Ativos</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald);">📝</div>
          <div>
            <div class="metric-value">${metrics.totalAulas}</div>
            <div class="metric-label">Aulas no Template</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon" style="background: rgba(245, 158, 11, 0.15); color: var(--accent-amber);">🏆</div>
          <div>
            <div class="metric-value">${metrics.totalCertificadosEmitidos}</div>
            <div class="metric-label">Certificados</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon" style="background: rgba(168, 85, 247, 0.15); color: var(--accent-violet);">🆘</div>
          <div>
            <div class="metric-value">${metrics.totalDuvidasAtendidas}</div>
            <div class="metric-label">Consultas Virtuais</div>
          </div>
        </div>
      </div>

      <!-- SEÇÃO 31: ACOMPANHAMENTO INDIVIDUAL (Sem ranking) -->
      <div style="margin-bottom: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
          <div>
            <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-white);">
              Acompanhamento Individual dos 3 Alunos (Seção 31 & 32)
            </h3>
            <span style="font-size: 0.78rem; color: var(--text-subtle);">Dados reais calculados pelo banco de dados — sem mecanismos de ranking competitivo.</span>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px;">
          ${usersListHtml}
        </div>
      </div>

      <!-- SEÇÃO 30: TABELA DE GERENCIAMENTO DE USUÁRIOS & ATUALIZAÇÕES -->
      <div style="display: grid; grid-template-columns: 1.8fr 1.2fr; gap: 24px;">
        <!-- Gestão de Usuários -->
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-white); margin-bottom: 14px;">
            Gerenciamento de Contas e Acessos
          </h3>
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 2px solid var(--border-subtle); font-size: 0.75rem; text-transform: uppercase; color: var(--text-subtle);">
                  <th style="padding: 8px 14px;">Nome</th>
                  <th style="padding: 8px 14px;">Login</th>
                  <th style="padding: 8px 14px;">Papel</th>
                  <th style="padding: 8px 14px;">Status</th>
                  <th style="padding: 8px 14px; text-align: right;">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${userRowsHtml}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Atualizações de Softwares -->
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-white);">
              Atualizações de Softwares (Seção 22)
            </h3>
            <button class="btn btn-secondary" id="btn-add-software-update" style="font-size: 0.74rem; padding: 4px 10px;">
              + Nova Versão
            </button>
          </div>
          <div>
            ${updatesHtml || '<p style="color: var(--text-subtle);">Nenhuma atualização registrada.</p>'}
          </div>
        </div>
      </div>

      <!-- MODAL PARA CRIAÇÃO DE USUÁRIO -->
      <div id="modal-create-user" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 2000; align-items: center; justify-content: center; padding: 20px;">
        <div style="width: 100%; max-width: 440px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">
          <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-white); margin-bottom: 6px;">Criar Novo Usuário</h3>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 16px;">Cadastre um novo aluno ou administrador da plataforma.</p>

          <form id="form-create-user">
            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: var(--text-muted); display: block; margin-bottom: 4px;">Nome Completo</label>
              <input type="text" id="new-user-nome" required style="width: 100%; padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); color: var(--text-white);" placeholder="Ex: Fernanda Lima" />
            </div>

            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: var(--text-muted); display: block; margin-bottom: 4px;">Login / E-mail</label>
              <input type="text" id="new-user-login" required style="width: 100%; padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); color: var(--text-white);" placeholder="fernanda@escola.design" />
            </div>

            <div style="margin-bottom: 12px;">
              <label style="font-size: 0.78rem; color: var(--text-muted); display: block; margin-bottom: 4px;">Senha Provisória</label>
              <input type="password" id="new-user-senha" required style="width: 100%; padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); color: var(--text-white);" placeholder="••••••••" />
            </div>

            <div style="margin-bottom: 18px;">
              <label style="font-size: 0.78rem; color: var(--text-muted); display: block; margin-bottom: 4px;">Papel do Usuário</label>
              <select id="new-user-papel" style="width: 100%; padding: 8px 12px; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); color: var(--text-white);">
                <option value="aluno">Aluno Oficial</option>
                <option value="admin">Administrador Master</option>
              </select>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px;">
              <button type="button" class="btn btn-outline" id="btn-cancel-create-user">Cancelar</button>
              <button type="submit" class="btn btn-primary" id="btn-submit-create-user">Cadastrar Usuário</button>
            </div>
          </form>
        </div>
      </div>
    `;

    // Eventos do Modal de Usuário
    const modalCreate = container.querySelector('#modal-create-user');
    const openCreateBtn = container.querySelector('#btn-create-user-modal');
    const cancelCreateBtn = container.querySelector('#btn-cancel-create-user');
    const formCreate = container.querySelector('#form-create-user');

    if (openCreateBtn) openCreateBtn.onclick = () => { modalCreate.style.display = 'flex'; };
    if (cancelCreateBtn) cancelCreateBtn.onclick = () => { modalCreate.style.display = 'none'; };

    if (formCreate) {
      formCreate.onsubmit = async (e) => {
        e.preventDefault();
        const nome = container.querySelector('#new-user-nome').value.trim();
        const login = container.querySelector('#new-user-login').value.trim();
        const senha = container.querySelector('#new-user-senha').value;
        const papel = container.querySelector('#new-user-papel').value;

        try {
          await api.createAdminUser({ nome, login, senha, papel });
          showToast(`Usuário ${nome} criado com sucesso!`);
          modalCreate.style.display = 'none';
          renderAdmin(container, navigateFn);
        } catch (err) {
          showToast(`Erro ao criar: ${err.message}`, 'error');
        }
      };
    }

    // Toggle Ativo / Desativar Usuário
    container.querySelectorAll('[data-toggle-user]').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.getAttribute('data-toggle-user');
        try {
          const res = await api.toggleAdminUserActive(id);
          showToast(res.message);
          renderAdmin(container, navigateFn);
        } catch (err) {
          showToast(`Erro: ${err.message}`, 'error');
        }
      };
    });

    // Atualização de Softwares
    const addUpdateBtn = container.querySelector('#btn-add-software-update');
    if (addUpdateBtn) {
      addUpdateBtn.onclick = async () => {
        const software = prompt('Nome do Software (Ex: Photoshop, CorelDRAW, Illustrator, After Effects):');
        if (!software) return;
        const versao = prompt('Versão de Lançamento (Ex: 2026 v28.0):');
        if (!versao) return;
        const mudancas = prompt('Resumo das Mudanças Técnicas:');
        if (!mudancas) return;
        const aulas = prompt('Aulas Afetadas (Ex: Módulo 4: Máscaras):');

        try {
          await api.request('/admin/updates', {
            method: 'POST',
            body: JSON.stringify({ software, versao, mudancas, aulas_afetadas: aulas })
          });
          showToast('Atualização de software registrada com sucesso!');
          renderAdmin(container, navigateFn);
        } catch (err) {
          showToast(`Erro ao registrar: ${err.message}`, 'error');
        }
      };
    }

  } catch (err) {
    container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px;">Erro: ${err.message}</div>`;
  }
}
