import { api } from '../services/api.js';

export async function renderCourseDetail(container, slugOrId, navigateFn) {
  container.innerHTML = `
    <div style="text-align: center; padding: 60px 0;">
      <p style="color: var(--text-muted);">Carregando estrutura curricular do curso...</p>
    </div>
  `;

  try {
    const data = await api.getCourseDetail(slugOrId);
    const { curso, modulos, projetos, quizzes, progresso } = data;

    const percentual = progresso ? progresso.percentual_calculado : 0;
    const concluido = percentual >= 100;

    let modulesHtml = '';
    modulos.forEach((m, index) => {
      let lessonsHtml = '';
      m.aulas.forEach(a => {
        lessonsHtml += `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="color: ${a.concluida ? 'var(--accent-emerald)' : 'var(--text-subtle)'}; font-size: 1.1rem;">
                ${a.concluida ? '✅' : '⚪'}
              </span>
              <div>
                <span style="font-size: 0.92rem; font-weight: 600; color: var(--text-white);">${a.titulo}</span>
                <span style="font-size: 0.75rem; color: var(--text-subtle); display: block;">⏱ ${a.duracao_minutos} minutos • Template Oficial (12 Tópicos)</span>
              </div>
            </div>
            <button class="btn ${a.concluida ? 'btn-secondary' : 'btn-primary'}" style="padding: 6px 14px; font-size: 0.8rem;" data-open-lesson="${a.id}">
              ${a.concluida ? 'Revisar Aula' : 'Estudar Agora →'}
            </button>
          </div>
        `;
      });

      const modProg = m.progresso_modulo !== undefined ? m.progresso_modulo : 0;
      const modConcluido = modProg === 100;

      modulesHtml += `
        <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 22px; margin-bottom: 20px;">
          <!-- Seção 10: Progresso por Módulo -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
            <div>
              <span style="font-size: 0.72rem; font-weight: 700; color: var(--accent-indigo); text-transform: uppercase;">Módulo ${m.ordem}</span>
              <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--text-white); margin-top: 2px;">${m.titulo}</h4>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="font-size: 0.82rem; font-weight: 700; color: ${modConcluido ? 'var(--accent-emerald)' : 'var(--accent-cyan)'};">
                ${modConcluido ? '✓ 100% Concluído' : `${modProg}%`}
              </span>
              <div style="width: 100px; height: 7px; background: rgba(255,255,255,0.08); border-radius: 4px; overflow: hidden;">
                <div style="width: ${modProg}%; height: 100%; background: ${modConcluido ? 'var(--accent-emerald)' : 'linear-gradient(90deg, var(--accent-indigo), var(--accent-cyan))'};"></div>
              </div>
              <span style="font-size: 0.75rem; color: var(--text-subtle);">(${m.aulas_concluidas || 0}/${m.total_aulas || m.aulas.length} aulas)</span>
            </div>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 16px;">${m.descricao || ''}</p>
          <div>
            ${lessonsHtml || '<p style="color: var(--text-subtle); font-size: 0.8rem;">Aulas sendo estruturadas no padrão.</p>'}
          </div>
        </div>
      `;
    });

    // Projetos e Quizzes
    let projectsHtml = '';
    projetos.forEach(p => {
      projectsHtml += `
        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <strong style="color: var(--text-white);">${p.nome}</strong>
            <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: var(--radius-full); background: rgba(99, 102, 241, 0.15); color: var(--primary);">
              ${p.categoria}
            </span>
          </div>
          <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 12px;">${p.descricao}</p>
          <div style="font-size: 0.75rem; color: var(--text-subtle); background: rgba(0,0,0,0.2); padding: 10px; border-radius: 4px; white-space: pre-line;">
            <strong>Requisitos de Entrega:</strong>\n${p.requisitos}
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="margin-bottom: 24px;">
        <button class="btn btn-outline" id="btn-back-courses" style="font-size: 0.8rem; padding: 6px 12px; margin-bottom: 16px;">
          ← Voltar aos Cursos
        </button>

        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span class="course-badge badge-${curso.nivel_minimo.toLowerCase()}">${curso.nivel_minimo}</span>
              <span style="font-size: 0.8rem; color: var(--accent-cyan); font-weight: 600;">${curso.software_area}</span>
              <span>•</span>
              <span style="font-size: 0.8rem; color: var(--text-subtle);">Carga Horária Oficial: ${curso.carga_horaria} horas</span>
            </div>
            <h2 style="font-size: 2rem; font-weight: 800; color: var(--text-white); letter-spacing: -0.02em;">
              ${curso.titulo}
            </h2>
            <p style="color: var(--text-muted); font-size: 0.95rem; max-width: 800px; margin-top: 8px;">
              ${curso.descricao}
            </p>
          </div>

          <div style="min-width: 260px; background-color: var(--bg-card); border: 1px solid var(--border-glow); border-radius: var(--radius-md); padding: 20px;">
            <div class="progress-header">
              <span style="font-size: 0.8rem; color: var(--text-muted);">Seu Aproveitamento</span>
              <span class="progress-percent" style="font-size: 1.1rem;">${percentual}%</span>
            </div>
            <div class="progress-track" style="margin: 8px 0 16px;">
              <div class="progress-bar" style="width: ${percentual}%; background: linear-gradient(90deg, ${curso.cor_tema || 'var(--primary)'}, var(--accent-cyan));"></div>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-subtle); display: flex; flex-direction: column; gap: 4px;">
              <span>• Aulas Concluídas: ${progresso ? progresso.aulas_concluidas : 0} de ${progresso ? progresso.total_aulas : 0}</span>
              <span>• Exercícios Práticos: ${progresso ? progresso.exercicios_concluidos : 0} de ${progresso ? progresso.total_exercicios : 0}</span>
              <span>• Quizzes Aprovados: ${progresso ? progresso.quizzes_aprovados : 0} de ${progresso ? progresso.total_quizzes : 0}</span>
              <span>• Projetos Aprovados: ${progresso ? progresso.projetos_concluidos : 0} de ${progresso ? progresso.total_projetos : 0}</span>
            </div>

            ${concluido
              ? `<button class="btn btn-primary" id="btn-course-cert" style="width: 100%; margin-top: 16px;">
                   <span>🏆 Ver Certificado Oficial</span>
                 </button>`
              : `<div style="font-size: 0.72rem; color: var(--text-subtle); margin-top: 14px; text-align: center;">
                   Conclua 100% dos requisitos para desbloquear o certificado.
                 </div>`
            }
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px; margin-top: 32px;">
        <div>
          <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--text-white); margin-bottom: 20px;">
            Módulos Curriculares e Aulas
          </h3>
          ${modulesHtml}
        </div>

        <div>
          <h3 style="font-size: 1.3rem; font-weight: 700; color: var(--text-white); margin-bottom: 20px;">
            Projetos & Portfólio do Curso
          </h3>
          ${projectsHtml || '<p style="color: var(--text-subtle); font-size: 0.85rem;">Projetos em validação pedagógica.</p>'}
        </div>
      </div>
    `;

    // Eventos
    container.querySelector('#btn-back-courses').onclick = () => navigateFn('cursos');

    container.querySelectorAll('[data-open-lesson]').forEach(btn => {
      btn.onclick = () => {
        const lessonId = btn.getAttribute('data-open-lesson');
        navigateFn('aula-player', { id: lessonId });
      };
    });

    const certBtn = container.querySelector('#btn-course-cert');
    if (certBtn) {
      certBtn.onclick = () => navigateFn('certificados');
    }

  } catch (err) {
    container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px;">Erro ao carregar detalhes: ${err.message}</div>`;
  }
}
