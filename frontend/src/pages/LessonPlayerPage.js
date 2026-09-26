import { api } from '../services/api.js';
import { showToast } from '../components/Toast.js';

export async function renderLessonPlayer(container, lessonId, navigateFn) {
  container.innerHTML = `
    <div style="text-align: center; padding: 60px 0;">
      <p style="color: var(--text-muted);">Carregando conteúdo didático da aula...</p>
    </div>
  `;

  try {
    const data = await api.getLessonDetail(lessonId);
    const { aula, modulo, curso, exercicio, quiz, progresso, notaQuiz, anotacao } = data;

    let isCompleted = progresso.concluida;

    // Tópico 10: Quiz Interativo
    let quizHtml = '';
    if (quiz) {
      quizHtml = `
        <div class="lesson-topic-block" id="quiz-section">
          <div class="lesson-topic-title">
            <span>📝</span> <span>10. Quiz de Fixação e Avaliação</span>
          </div>
          <div style="background: rgba(99, 102, 241, 0.05); border: 1px solid var(--border-glow); border-radius: var(--radius-md); padding: 22px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <div>
                <strong style="color: var(--text-white); font-size: 1.05rem;">${quiz.titulo}</strong>
                <span style="font-size: 0.75rem; color: var(--text-subtle); display: block;">Média mínima para aprovação: ${quiz.nota_minima}%</span>
              </div>
              <div id="quiz-status-badge">
                ${notaQuiz
                  ? `<span class="course-badge" style="background: ${notaQuiz.aprovado ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}; color: ${notaQuiz.aprovado ? '#34d399' : '#fb7185'};">
                       Nota: ${notaQuiz.nota}% (${notaQuiz.aprovado ? 'Aprovado' : 'Reprovado'})
                     </span>`
                  : '<span style="font-size: 0.75rem; color: var(--text-subtle);">Pendente</span>'
                }
              </div>
            </div>

            <div id="quiz-questions-box">
              <button class="btn btn-primary" id="btn-load-quiz" data-quiz-id="${quiz.id}">
                ${notaQuiz ? 'Refazer Avaliação' : 'Iniciar Quiz da Aula'}
              </button>
            </div>
            <div id="quiz-result-box" style="display: none; margin-top: 18px;"></div>
          </div>
        </div>
      `;
    }

    // Tópico 8: Exercício Prático
    let exerciseHtml = '';
    if (exercicio) {
      exerciseHtml = `
        <div class="lesson-topic-block">
          <div class="lesson-topic-title">
            <span>🛠</span> <span>8. Exercício Prático Obrigatório</span>
          </div>
          <div style="background: rgba(0,0,0,0.2); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px;">
            <h4 style="color: var(--text-white); font-size: 1rem; margin-bottom: 8px;">${exercicio.titulo}</h4>
            <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 14px;">${exercicio.enunciado}</p>

            <div style="font-size: 0.8rem; color: var(--accent-cyan); background: rgba(6, 182, 212, 0.08); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 16px;">
              <strong>Critérios de Avaliação Técnica:</strong> ${exercicio.criterios_avaliacao || 'Fidelidade de execução e precisão.'}
            </div>

            <label style="font-size: 0.8rem; color: var(--text-subtle); display: block; margin-bottom: 6px;">Sua resposta / Anotação da solução:</label>
            <textarea
              id="exercise-answer-input"
              rows="3"
              placeholder="Descreva como resolveu o exercício ou cole o link do seu arquivo de teste..."
              style="width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-white); font-family: var(--font-sans); font-size: 0.88rem; margin-bottom: 12px;"
            ></textarea>
            <button class="btn btn-secondary" id="btn-submit-exercise" data-ex-id="${exercicio.id}">
              <span>Enviar Solução do Exercício</span> <span>✓</span>
            </button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div style="margin-bottom: 20px;">
        <button class="btn btn-outline" id="btn-back-to-course" style="font-size: 0.8rem; padding: 6px 12px; margin-bottom: 12px;">
          ← Voltar para ${curso.titulo}
        </button>

        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
          <div>
            <span style="font-size: 0.78rem; text-transform: uppercase; color: var(--accent-cyan); font-weight: 700;">
              ${curso.software_area} • ${modulo.titulo}
            </span>
            <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); margin-top: 4px;">
              ${aula.titulo}
            </h2>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <!-- Seção 23: Sistema de Revisão -->
            <div style="display: flex; gap: 4px; background: rgba(0,0,0,0.3); padding: 3px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
              <button class="btn btn-outline" id="btn-tag-revisar" style="font-size: 0.74rem; padding: 4px 8px; ${data.classificacaoRevisao === 'revisar' ? 'background: rgba(245,158,11,0.25); border-color: var(--accent-amber); color: var(--accent-amber); font-weight: 700;' : ''}">
                📌 Revisar
              </button>
              <button class="btn btn-outline" id="btn-tag-importante" style="font-size: 0.74rem; padding: 4px 8px; ${data.classificacaoRevisao === 'importante' ? 'background: rgba(6,182,212,0.25); border-color: var(--accent-cyan); color: var(--accent-cyan); font-weight: 700;' : ''}">
                ⭐ Importante
              </button>
              <button class="btn btn-outline" id="btn-tag-dificil" style="font-size: 0.74rem; padding: 4px 8px; ${data.classificacaoRevisao === 'dificil' ? 'background: rgba(244,63,94,0.25); border-color: var(--accent-rose); color: var(--accent-rose); font-weight: 700;' : ''}">
                🔥 Difícil
              </button>
            </div>

            <button class="btn btn-outline" id="btn-toggle-favorite" data-lesson-id="${aula.id}" style="font-size: 0.78rem; padding: 6px 12px; ${data.favoritado ? 'background: rgba(245,158,11,0.15); border-color: var(--accent-amber); color: var(--accent-amber);' : ''}">
              ${data.favoritado ? '⭐ Favoritada' : '☆ Favoritar'}
            </button>
            <button class="btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}" id="btn-toggle-complete" style="font-size: 0.8rem; padding: 6px 14px;">
              ${isCompleted ? '✅ Concluída (Desmarcar)' : '✓ Marcar como Concluída'}
            </button>
          </div>
        </div>
      </div>

      <div class="lesson-player-container">
        <!-- ÁREA CENTRAL COM OS 12 TÓPICOS OBRIGATÓRIOS DA SEÇÃO 5 -->
        <div class="lesson-content">

          <!-- 1. OBJETIVO -->
          <div class="lesson-topic-block">
            <div class="lesson-topic-title">
              <span>🎯</span> <span>1. Objetivo da Aula</span>
            </div>
            <p style="font-size: 0.95rem; color: var(--text-main); line-height: 1.7;">
              ${aula.objetivo}
            </p>
          </div>

          <!-- 2. CONCEITO -->
          <div class="lesson-topic-block">
            <div class="lesson-topic-title">
              <span>💡</span> <span>2. Conceito Teórico Fundamental</span>
            </div>
            <p style="font-size: 0.95rem; color: var(--text-main); line-height: 1.7;">
              ${aula.conceito}
            </p>
          </div>

          <!-- 3. FERRAMENTAS -->
          <div class="lesson-topic-block">
            <div class="lesson-topic-title">
              <span>🛠</span> <span>3. Ferramentas e Atalhos Envolvidos</span>
            </div>
            <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 14px 18px; font-family: var(--font-mono); font-size: 0.9rem; color: var(--accent-cyan);">
              ${aula.ferramentas}
            </div>
          </div>

          <!-- 4. EXPLICAÇÃO -->
          <div class="lesson-topic-block">
            <div class="lesson-topic-title">
              <span>📖</span> <span>4. Explicação Técnica Detalhada</span>
            </div>
            <div style="font-size: 0.95rem; color: var(--text-main); line-height: 1.8; white-space: pre-line;">
              ${aula.explicacao}
            </div>
          </div>

          <!-- 5. PASSO A PASSO -->
          <div class="lesson-topic-block">
            <div class="lesson-topic-title">
              <span>🪜</span> <span>5. Passo a Passo Prático de Execução</span>
            </div>
            <div class="lesson-step-list">
              ${aula.passo_a_passo}
            </div>
          </div>

          <!-- 6. DICA PROFISSIONAL -->
          <div class="lesson-topic-block">
            <div class="lesson-topic-title">
              <span>✨</span> <span>6. Dica Profissional (Segredo de Mercado)</span>
            </div>
            <div class="lesson-pro-tip">
              💡 ${aula.dica_profissional}
            </div>
          </div>

          <!-- 7. ERROS COMUNS -->
          <div class="lesson-topic-block">
            <div class="lesson-topic-title">
              <span>⚠️</span> <span>7. Erros Comuns e Como Evitá-los</span>
            </div>
            <div class="lesson-common-errors">
              🚫 ${aula.erros_comuns}
            </div>
          </div>

          <!-- 8. EXERCÍCIO -->
          ${exerciseHtml}

          <!-- 9. DESAFIO -->
          <div class="lesson-topic-block">
            <div class="lesson-topic-title">
              <span>🏆</span> <span>9. Desafio Avançado</span>
            </div>
            <p style="font-size: 0.92rem; color: var(--text-muted); line-height: 1.6;">
              Tente reproduzir este fluxo alterando a orientação da tela e adicionando uma textura de ruído sutil para checar se a iluminação preserva naturalidade.
            </p>
          </div>

          <!-- 10. QUIZ -->
          ${quizHtml}

          <!-- 11. CONCLUSÃO -->
          <div class="lesson-topic-block">
            <div class="lesson-topic-title">
              <span>🏁</span> <span>11. Conclusão da Aula</span>
            </div>
            <p style="font-size: 0.95rem; color: var(--text-main); line-height: 1.7;">
              ${aula.conclusao}
            </p>
          </div>

          <!-- 12. PRÓXIMA AULA -->
          <div class="lesson-topic-block" style="background: rgba(99, 102, 241, 0.05); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 22px;">
            <div class="lesson-topic-title">
              <span>⏭</span> <span>12. Próxima Aula</span>
            </div>
            <p style="font-size: 0.92rem; color: var(--text-muted); margin-bottom: 14px;">
              ${aula.proxima_aula}
            </p>
            <button class="btn btn-primary" id="btn-next-step">
              Avançar no Módulo →
            </button>
          </div>

        </div>

        <!-- PAINEL LATERAL DE FERRAMENTAS DO ALUNO -->
        <div>
          <!-- DÚVIDA NA AULA? -->
          <div style="background-color: var(--bg-card); border: 1px solid var(--border-glow); border-radius: var(--radius-md); padding: 20px; margin-bottom: 20px;">
            <h4 style="font-size: 0.95rem; color: var(--text-white); margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
              <span>🆘</span> Dúvida nesta aula?
            </h4>
            <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 14px;">
              Consulte o Professor Virtual contextualmente com base nos conceitos desta aula.
            </p>
            <button class="btn btn-outline" id="btn-ask-lesson-help" style="width: 100%; font-size: 0.82rem;">
              Perguntar ao Professor Virtual
            </button>
          </div>

          <!-- MINHAS ANOTAÇÕES PESSOAIS -->
          <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 20px;">
            <h4 style="font-size: 0.95rem; color: var(--text-white); margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
              <span>📝</span> Caderno de Anotações
            </h4>
            <textarea
              id="lesson-notes-textarea"
              rows="8"
              placeholder="Digite seus insights, atalhos úteis ou lembretes desta aula (salvo automaticamente)..."
              style="width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 12px; color: var(--text-white); font-family: var(--font-sans); font-size: 0.85rem; resize: vertical;"
            >${anotacao || ''}</textarea>
            <button class="btn btn-secondary" id="btn-save-notes" style="width: 100%; font-size: 0.8rem; margin-top: 10px;">
              Salvar Anotação
            </button>
          </div>
        </div>
      </div>
    `;

    // Conectar Eventos
    container.querySelector('#btn-back-to-course').onclick = () => {
      navigateFn('curso-detalhe', { slug: curso.slug });
    };

    container.querySelector('#btn-next-step').onclick = () => {
      showToast('Progresso registrado! Avance para a próxima aula.');
      navigateFn('curso-detalhe', { slug: curso.slug });
    };

    // Marcar Concluída
    const toggleCompleteBtn = container.querySelector('#btn-toggle-complete');
    toggleCompleteBtn.onclick = async () => {
      try {
        const res = await api.completeLesson(aula.id, curso.id);
        isCompleted = !isCompleted;
        toggleCompleteBtn.className = `btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`;
        toggleCompleteBtn.innerText = isCompleted ? '✅ Aula Concluída (Clique p/ Desmarcar)' : 'Marcar como Concluída ✓';
        showToast(isCompleted ? 'Parabéns! Aula marcada como concluída e progresso recalculado!' : 'Aula desmarcada.');
      } catch (err) {
        showToast(`Erro ao atualizar: ${err.message}`, 'error');
      }
    };

    // Seção 23: Sistema de Revisão (Revisar, Importante, Difícil)
    ['revisar', 'importante', 'dificil'].forEach(cls => {
      const btn = container.querySelector(`#btn-tag-${cls}`);
      if (btn) {
        btn.onclick = async () => {
          try {
            const res = await api.toggleReview(aula.id, curso.id, cls);
            showToast(res.message);
            renderLessonPlayer(container, lessonId, navigateFn);
          } catch (err) {
            showToast('Erro ao atualizar classificação de revisão.', 'error');
          }
        };
      }
    });

    // Favoritar
    container.querySelector('#btn-toggle-favorite').onclick = async () => {
      try {
        const res = await api.toggleFavorite('aula', aula.id);
        showToast(res.message);
        renderLessonPlayer(container, lessonId, navigateFn);
      } catch (err) {
        showToast('Erro ao favoritar aula.', 'error');
      }
    };

    // Salvar Anotações
    container.querySelector('#btn-save-notes').onclick = async () => {
      const texto = container.querySelector('#lesson-notes-textarea').value;
      try {
        await api.saveNote(aula.id, texto);
        showToast('Anotações salvas com sucesso no seu perfil!');
      } catch (err) {
        showToast('Erro ao salvar anotação.', 'error');
      }
    };

    // Enviar Exercício
    const submitExBtn = container.querySelector('#btn-submit-exercise');
    if (submitExBtn) {
      submitExBtn.onclick = async () => {
        const exId = submitExBtn.getAttribute('data-ex-id');
        const resposta = container.querySelector('#exercise-answer-input').value;
        try {
          await api.completeExercise(exId, curso.id, resposta);
          showToast('Exercício registrado com sucesso e progresso recalculado!');
          submitExBtn.innerText = 'Exercício Concluído ✓';
          submitExBtn.disabled = true;
        } catch (err) {
          showToast(`Erro ao submeter exercício: ${err.message}`, 'error');
        }
      };
    }

    // Perguntar ao Professor Virtual da Aula
    container.querySelector('#btn-ask-lesson-help').onclick = () => {
      const helpOverlay = document.getElementById('help-modal-overlay');
      const helpInput = document.getElementById('help-modal-input');
      if (helpOverlay && helpInput) {
        helpOverlay.classList.add('active');
        helpInput.value = `Dúvida sobre ${aula.titulo}: `;
        helpInput.focus();
      }
    };

    // Quiz Interativo
    const loadQuizBtn = container.querySelector('#btn-load-quiz');
    if (loadQuizBtn) {
      loadQuizBtn.onclick = async () => {
        loadQuizBtn.disabled = true;
        loadQuizBtn.innerText = 'Carregando questões...';
        try {
          const quizData = await api.getQuiz(quiz.id);
          renderInteractiveQuiz(container.querySelector('#quiz-questions-box'), quizData, curso.id);
        } catch (err) {
          showToast('Erro ao carregar quiz.', 'error');
          loadQuizBtn.disabled = false;
        }
      };
    }

  } catch (err) {
    container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px;">Erro ao carregar aula: ${err.message}</div>`;
  }
}

function renderInteractiveQuiz(targetBox, quizData, cursoId) {
  const { quiz, questoes } = quizData;

  let qHtml = '<form id="interactive-quiz-form" style="display: flex; flex-direction: column; gap: 20px;">';

  questoes.forEach((q, idx) => {
    let answersHtml = '';
    q.alternativas.forEach(alt => {
      answersHtml += `
        <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); cursor: pointer;">
          <input type="radio" name="question_${q.id}" value="${alt.id}" required style="accent-color: var(--primary);" />
          <span style="font-size: 0.88rem; color: var(--text-main);">${alt.texto}</span>
        </label>
      `;
    });

    qHtml += `
      <div style="background: rgba(0,0,0,0.25); border-radius: var(--radius-md); padding: 18px;">
        <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700;">Questão ${idx + 1} de ${questoes.length}</span>
        <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-white); margin: 6px 0 14px;">${q.enunciado}</p>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${answersHtml}
        </div>
      </div>
    `;
  });

  qHtml += `
    <button type="submit" class="btn btn-primary" style="margin-top: 10px;">
      <span>Submeter Respostas para Correção Real</span> <span>✓</span>
    </button>
  </form>`;

  targetBox.innerHTML = qHtml;

  const form = targetBox.querySelector('#interactive-quiz-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const respostas = {};

    questoes.forEach(q => {
      const val = formData.get(`question_${q.id}`);
      if (val) respostas[q.id] = parseInt(val);
    });

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Processando correção no servidor...';

    try {
      const result = await api.submitQuiz(quiz.id, respostas);
      renderQuizResult(targetBox, result);
      showToast(result.mensagem, result.aprovado ? 'success' : 'error');
    } catch (err) {
      showToast(`Erro ao submeter: ${err.message}`, 'error');
      submitBtn.disabled = false;
    }
  };
}

function renderQuizResult(targetBox, result) {
  let feedbackHtml = '';
  result.feedback.forEach((f, idx) => {
    feedbackHtml += `
      <div style="padding: 12px; border-radius: var(--radius-sm); margin-bottom: 10px; background: ${f.acertou ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)'}; border: 1px solid ${f.acertou ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'};">
        <div style="display: flex; justify-content: space-between; font-weight: 600; color: ${f.acertou ? '#34d399' : '#fb7185'}; font-size: 0.88rem;">
          <span>Questão ${idx + 1}: ${f.acertou ? 'Correta ✓' : 'Incorreta ✕'}</span>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-white); margin: 6px 0;">${f.enunciado}</p>
        <div style="font-size: 0.78rem; color: var(--text-subtle);">
          <span>Sua resposta: <strong>${f.resposta_usuario}</strong></span> |
          <span>Correta: <strong>${f.resposta_correta}</strong></span>
        </div>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 6px; font-style: italic;">
          Justificativa pedagógica: ${f.explicacao}
        </div>
      </div>
    `;
  });

  targetBox.innerHTML = `
    <div style="text-align: center; padding: 24px 0;">
      <div style="font-size: 3rem;">${result.aprovado ? '🎉' : '📚'}</div>
      <h3 style="color: var(--text-white); font-size: 1.4rem; margin: 8px 0;">Nota Final: ${result.nota}%</h3>
      <p style="color: ${result.aprovado ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; font-weight: 600;">
        ${result.aprovado ? 'Aprovado com Sucesso!' : `Nota insuficiente (Mínima: ${result.notaMinima}%)`}
      </p>
      <p style="color: var(--text-muted); font-size: 0.85rem; max-width: 500px; margin: 8px auto 20px;">${result.mensagem}</p>
      <div style="text-align: left; max-height: 400px; overflow-y: auto;">
        ${feedbackHtml}
      </div>
    </div>
  `;
}
