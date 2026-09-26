import { api } from '../services/api.js';

export async function renderDashboard(container, navigateFn) {
  container.innerHTML = `
    <div style="text-align: center; padding: 60px 0;">
      <p style="color: var(--text-muted);">Carregando métricas, continuidade e cursos do aluno...</p>
    </div>
  `;

  try {
    const [summary, courses, recommendation, continuePoint, history] = await Promise.all([
      api.getProgressSummary(),
      api.getCourses(),
      api.getStudyRecommendation().catch(() => null),
      api.getContinuePoint().catch(() => null),
      api.getMyHistory().catch(() => [])
    ]);

    const user = api.getCurrentUser() || { nome: 'Aluno', foto: '' };

    // ==========================================
    // SEÇÃO 8: BANNER "CONTINUE DE ONDE VOCÊ PAROU"
    // ==========================================
    let continueBannerHtml = '';
    if (continuePoint && continuePoint.disponivel && continuePoint.aula) {
      const a = continuePoint.aula;
      continueBannerHtml = `
        <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(168, 85, 247, 0.15)); border: 1px solid var(--accent-indigo); border-radius: var(--radius-lg); padding: 22px 28px; margin-bottom: 28px; display: flex; align-items: center; justify-content: space-between; gap: 20px; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.15);">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: var(--accent-cyan); letter-spacing: 0.08em; background: rgba(6,182,212,0.15); padding: 2px 8px; border-radius: 4px;">
                ▶ Memorização de Sessão
              </span>
              <span style="font-size: 0.8rem; color: var(--text-muted);">Continue de onde você parou:</span>
            </div>
            <h3 style="color: var(--text-white); font-size: 1.3rem; font-weight: 800; margin: 4px 0;">
              ${a.curso_titulo} — Módulo ${a.modulo_ordem || 1} — Aula ${a.aula_ordem || 1}: ${a.titulo}
            </h3>
            <div style="font-size: 0.82rem; color: var(--text-subtle);">
              Duração estimada: ${a.duracao_minutos} minutos • Conteúdo prático 100% interativo
            </div>
          </div>
          <div>
            <button class="btn btn-primary" id="btn-continue-direct" data-lesson-id="${a.id}" style="font-size: 0.95rem; font-weight: 700; padding: 12px 24px; box-shadow: 0 4px 14px rgba(99,102,241,0.4);">
              <span>CONTINUAR</span> <span>→</span>
            </button>
          </div>
        </div>
      `;
    }

    // ==========================================
    // SEÇÃO 3 & 28: METRICS RIBBON EXPANDIDO
    // ==========================================
    const ribbonHtml = `
      <div class="metrics-ribbon" style="margin-bottom: 28px;">
        <div class="metric-card">
          <div class="metric-icon" style="background: rgba(99, 102, 241, 0.15); color: var(--primary);">⏱</div>
          <div>
            <div class="metric-value">${summary.totalHoras}h</div>
            <div class="metric-label">Horas de Estudo</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon" style="background: rgba(6, 182, 212, 0.15); color: var(--accent-cyan);">📊</div>
          <div>
            <div class="metric-value">${summary.progressoGeral}%</div>
            <div class="metric-label">Progresso Geral</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon" style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald);">📚</div>
          <div>
            <div class="metric-value">${summary.cursosEmAndamento}</div>
            <div class="metric-label">Cursos em Andamento</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon" style="background: rgba(59, 130, 246, 0.15); color: #3b82f6;">🎓</div>
          <div>
            <div class="metric-value">${summary.cursosConcluidos}</div>
            <div class="metric-label">Cursos Concluídos</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon" style="background: rgba(245, 158, 11, 0.15); color: var(--accent-amber);">📁</div>
          <div>
            <div class="metric-value">${summary.projetosAprovados}</div>
            <div class="metric-label">Projetos Aprovados</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon" style="background: rgba(168, 85, 247, 0.15); color: var(--accent-violet);">🏆</div>
          <div>
            <div class="metric-value">${summary.certificadosTotal}</div>
            <div class="metric-label">Certificados</div>
          </div>
        </div>
      </div>
    `;

    // Recomendações
    let recHtml = '';
    if (recommendation && recommendation.curso) {
      recHtml = `
        <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.05)); border: 1px solid var(--border-glow); border-radius: var(--radius-md); padding: 18px 24px; margin-bottom: 28px; display: flex; align-items: center; justify-content: space-between; gap: 20px;">
          <div>
            <span style="font-size: 0.72rem; text-transform: uppercase; font-weight: 700; color: var(--accent-cyan); letter-spacing: 0.08em;">
              💡 Recomendação de Estudo
            </span>
            <h4 style="color: var(--text-white); font-size: 1.1rem; margin: 3px 0 4px;">${recommendation.mensagem}</h4>
            <p style="color: var(--text-muted); font-size: 0.82rem; margin: 0;">
              ${recommendation.proximaAula ? `Próximo conteúdo: <strong>${recommendation.proximaAula.titulo}</strong> (${recommendation.proximaAula.modulo_titulo})` : 'Continue sua trilha de especialização técnica.'}
            </p>
          </div>
          <div>
            ${recommendation.proximaAula
              ? `<button class="btn btn-outline" id="btn-continue-lesson" data-lesson-id="${recommendation.proximaAula.id}" style="font-size: 0.82rem;">
                   <span>Ir para a Aula</span> <span>→</span>
                 </button>`
              : `<button class="btn btn-outline" id="btn-view-rec-course" data-slug="${recommendation.curso.slug}" style="font-size: 0.82rem;">
                   <span>Acessar Curso</span> <span>→</span>
                 </button>`
            }
          </div>
        </div>
      `;
    }

    // Grid de Cursos
    let coursesHtml = '<div class="courses-grid" style="margin-bottom: 32px;">';
    courses.forEach(c => {
      const prog = c.progresso_usuario || 0;
      coursesHtml += `
        <div class="course-card" data-slug="${c.slug}">
          <div class="course-card-header">
            <div class="course-software-icon" style="background-color: ${c.cor_tema || '#6366f1'};">
              ${c.software_area.substring(0, 2).toUpperCase()}
            </div>
            <span class="course-badge badge-${c.nivel_minimo.toLowerCase()}">${c.nivel_minimo}</span>
          </div>
          <h3 style="font-size: 1.1rem; margin-bottom: 6px;">${c.titulo}</h3>
          <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 14px;">${c.descricao}</p>

          <div class="progress-container">
            <div class="progress-header">
              <span>Progresso Real</span>
              <span class="progress-percent">${prog}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-bar" style="width: ${prog}%; background: linear-gradient(90deg, ${c.cor_tema || 'var(--primary)'}, var(--accent-cyan));"></div>
            </div>
          </div>

          <div class="course-meta">
            <span>⏱ ${c.carga_horaria}h</span>
            <span>📂 ${c.total_modulos} Módulos</span>
            <span>📝 ${c.total_aulas} Aulas</span>
          </div>

          <div style="display: flex; gap: 10px; margin-top: auto;">
            <button class="btn btn-primary" style="flex: 1; font-size: 0.82rem;" data-action="open-course" data-slug="${c.slug}">
              ${prog > 0 ? 'Continuar Curso →' : 'Iniciar Curso →'}
            </button>
          </div>
        </div>
      `;
    });
    coursesHtml += '</div>';

    // Seção 29: Últimas atividades resumidas
    let recentHistoryHtml = '';
    if (history && history.length > 0) {
      recentHistoryHtml = `
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 22px 26px; margin-bottom: 28px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-white);">Últimas Atividades Realizadas</h3>
            <button class="btn btn-outline" id="btn-see-full-history" style="font-size: 0.75rem; padding: 4px 10px;">Ver Histórico Completo →</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${history.slice(0, 3).map(h => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid var(--border-subtle);">
                <div>
                  <span style="font-weight: 600; font-size: 0.85rem; color: var(--text-white);">${h.titulo}:</span>
                  <span style="font-size: 0.85rem; color: var(--text-muted); margin-left: 6px;">${h.descricao}</span>
                </div>
                <span style="font-size: 0.75rem; color: var(--text-subtle); flex-shrink: 0; margin-left: 12px;">
                  ${new Date(h.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
        <div>
          <div style="font-size: 0.82rem; color: var(--text-subtle);">Painel Geral de Aprendizado</div>
          <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); letter-spacing: -0.02em;">
            Olá, ${user.nome}! 👋
          </h2>
        </div>
        <div style="font-size: 0.82rem; color: var(--text-muted);">
          Plataforma Online • <strong>Escola Digital de Design</strong>
        </div>
      </div>

      ${continueBannerHtml}
      ${ribbonHtml}
      ${recHtml}

      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; color: var(--text-white);">Meus Cursos em Formação</h3>
        <button class="btn btn-outline" id="btn-see-all-courses" style="font-size: 0.8rem; padding: 6px 14px;">
          Ver Trilha de Formação →
        </button>
      </div>

      ${coursesHtml}
      ${recentHistoryHtml}
    `;

    // Eventos
    container.querySelectorAll('[data-action="open-course"]').forEach(btn => {
      btn.onclick = () => {
        const slug = btn.getAttribute('data-slug');
        navigateFn('curso-detalhe', { slug });
      };
    });

    const btnContinueDirect = container.querySelector('#btn-continue-direct');
    if (btnContinueDirect) {
      btnContinueDirect.onclick = () => {
        const lessonId = btnContinueDirect.getAttribute('data-lesson-id');
        navigateFn('aula-player', { id: lessonId });
      };
    }

    const recLessonBtn = container.querySelector('#btn-continue-lesson');
    if (recLessonBtn) {
      recLessonBtn.onclick = () => {
        const id = recLessonBtn.getAttribute('data-lesson-id');
        navigateFn('aula-player', { id });
      };
    }

    const recCourseBtn = container.querySelector('#btn-view-rec-course');
    if (recCourseBtn) {
      recCourseBtn.onclick = () => {
        const slug = recCourseBtn.getAttribute('data-slug');
        navigateFn('curso-detalhe', { slug });
      };
    }

    const seeAllBtn = container.querySelector('#btn-see-all-courses');
    if (seeAllBtn) {
      seeAllBtn.onclick = () => navigateFn('formacao');
    }

    const fullHistoryBtn = container.querySelector('#btn-see-full-history');
    if (fullHistoryBtn) {
      fullHistoryBtn.onclick = () => navigateFn('historico');
    }

  } catch (err) {
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--accent-rose);">
        <p>Erro ao carregar o painel: ${err.message}</p>
        <button class="btn btn-primary" onclick="window.location.reload()" style="margin-top: 16px;">Tentar novamente</button>
      </div>
    `;
  }
}
