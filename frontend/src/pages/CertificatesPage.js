import { api } from '../services/api.js';
import { showToast } from '../components/Toast.js';

export async function renderCertificates(container, navigateFn) {
  container.innerHTML = `
    <div style="text-align: center; padding: 60px 0;">
      <p style="color: var(--text-muted);">Carregando certificados oficiais emitidos...</p>
    </div>
  `;

  try {
    const certs = await api.getMyCertificates();

    let certsListHtml = '';
    certs.forEach(cert => {
      certsListHtml += `
        <div class="certificate-preview-box" style="margin-bottom: 32px;">
          <div class="certificate-header-seal">🏛️</div>
          <div style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.15em; color: var(--accent-cyan); margin-bottom: 4px;">
            Escola Digital de Design • Registro Nacional
          </div>
          <div class="certificate-title">Certificado de Conclusão</div>
          <p style="font-size: 0.95rem; color: #cbd5e1; margin: 10px 0;">Certificamos formalmente que</p>
          <div class="certificate-student">${cert.aluno_nome}</div>
          <p style="font-size: 0.95rem; color: #cbd5e1; max-width: 600px; margin: 10px auto;">
            concluiu com êxito todas as etapas teóricas, exercícios práticos, avaliações e projeto de conclusão do curso profissional de:
          </p>
          <h3 style="font-size: 1.4rem; color: #facc15; margin: 12px 0;">${cert.curso_titulo}</h3>
          <p style="font-size: 0.85rem; color: #94a3b8;">
            Carga Horária Oficial: <strong>${cert.carga_horaria} Horas</strong> • Aproveitamento: <strong>${cert.percentual_conclusao}%</strong>
          </p>

          <div class="certificate-code">
            Código de Autenticidade: ${cert.codigo_unico}
          </div>
          <div style="font-size: 0.7rem; color: #64748b; margin-top: 10px;">
            Hash Criptográfico SHA-256: ${cert.hash_validacao.substring(0, 32)}...
          </div>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="margin-bottom: 28px;">
        <h2 style="font-size: 1.8rem; font-weight: 800; color: var(--text-white); letter-spacing: -0.02em;">
          Meus Certificados Oficiais
        </h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          Certificados emitidos com código identificador único e verificação de autenticidade no banco de dados.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px;">
        <!-- LISTA DE CERTIFICADOS CONQUISTADOS -->
        <div>
          ${certsListHtml || `
            <div style="background-color: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 40px; text-align: center;">
              <span style="font-size: 2.5rem; display: block; margin-bottom: 12px;">🏆</span>
              <h3 style="color: var(--text-white); font-size: 1.15rem; margin-bottom: 8px;">Nenhum Certificado Emitido Ainda</h3>
              <p style="color: var(--text-muted); font-size: 0.88rem; max-width: 480px; margin: 0 auto 20px;">
                Conforme o regulamento da escola, o certificado é gerado automaticamente quando você atinge 100% de conclusão nas aulas, exercícios e projetos do curso.
              </p>
              <button class="btn btn-primary" id="btn-cert-go-courses">
                Ver Cursos em Andamento →
              </button>
            </div>
          `}
        </div>

        <!-- FORMULÁRIO PÚBLICO DE VERIFICAÇÃO DE AUTENTICIDADE -->
        <div>
          <div style="background-color: var(--bg-card); border: 1px solid var(--border-glow); border-radius: var(--radius-lg); padding: 24px;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-white); margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
              <span>🛡️</span> Validador de Certificados
            </h3>
            <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 18px;">
              Qualquer empresa ou recrutador pode validar a autenticidade de um certificado inserindo o código único abaixo.
            </p>

            <div style="margin-bottom: 14px;">
              <label style="font-size: 0.78rem; color: var(--text-subtle); display: block; margin-bottom: 6px;">Código Identificador Único:</label>
              <input
                type="text"
                id="cert-verify-input"
                placeholder="Ex: EDD-XXXXX-XXXX"
                style="width: 100%; background-color: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 10px; color: var(--text-white); font-family: var(--font-mono); font-size: 0.88rem; text-transform: uppercase;"
              />
            </div>

            <button class="btn btn-secondary" id="btn-verify-cert" style="width: 100%;">
              Consultar Registro Oficial
            </button>

            <div id="cert-verify-result" style="margin-top: 18px; display: none;"></div>
          </div>
        </div>
      </div>
    `;

    const goCoursesBtn = container.querySelector('#btn-cert-go-courses');
    if (goCoursesBtn) {
      goCoursesBtn.onclick = () => navigateFn('cursos');
    }

    const verifyBtn = container.querySelector('#btn-verify-cert');
    const verifyInput = container.querySelector('#cert-verify-input');
    const verifyResult = container.querySelector('#cert-verify-result');

    verifyBtn.onclick = async () => {
      const codigo = verifyInput.value.trim();
      if (!codigo) {
        showToast('Insira o código do certificado.', 'error');
        return;
      }

      verifyBtn.disabled = true;
      verifyBtn.innerText = 'Validando hash no banco de dados...';

      try {
        const res = await api.verifyCertificate(codigo);
        verifyResult.style.display = 'block';
        verifyResult.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid var(--accent-emerald); border-radius: var(--radius-sm); padding: 14px; font-size: 0.85rem;">
            <div style="font-weight: 700; color: var(--accent-emerald); margin-bottom: 6px;">
              Autenticidade Confirmada ✓
            </div>
            <div style="color: var(--text-white); font-size: 0.82rem;">
              <strong>Aluno:</strong> ${res.certificado.aluno_nome}<br/>
              <strong>Curso:</strong> ${res.certificado.curso_titulo}<br/>
              <strong>Carga Horária:</strong> ${res.certificado.carga_horaria} horas<br/>
              <strong>Data de Emissão:</strong> ${new Date(res.certificado.data_emissao).toLocaleDateString('pt-BR')}
            </div>
          </div>
        `;
      } catch (err) {
        verifyResult.style.display = 'block';
        verifyResult.innerHTML = `
          <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid var(--accent-rose); border-radius: var(--radius-sm); padding: 14px; font-size: 0.85rem; color: #fca5a5;">
            Registro não encontrado. Verifique o código e tente novamente.
          </div>
        `;
      } finally {
        verifyBtn.disabled = false;
        verifyBtn.innerText = 'Consultar Registro Oficial';
      }
    };

  } catch (err) {
    container.innerHTML = `<div style="color: var(--accent-rose); padding: 40px;">Erro: ${err.message}</div>`;
  }
}
