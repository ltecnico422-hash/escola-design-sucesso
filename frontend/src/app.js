import { api } from './services/api.js';
import { renderSidebar } from './components/Sidebar.js';
import { renderHeader, setupHeader } from './components/Header.js';
import { renderSearchModal, setupSearchModal } from './components/SearchModal.js';
import { renderHelpModal, setupHelpModal } from './components/HelpModal.js';
import { showToast } from './components/Toast.js';

// Importação das Páginas
import { renderDashboard } from './pages/DashboardPage.js';
import { renderCourses } from './pages/CoursesPage.js';
import { renderCourseDetail } from './pages/CourseDetailPage.js';
import { renderLessonPlayer } from './pages/LessonPlayerPage.js';
import { renderTrack } from './pages/TrackPage.js';
import { renderKnowledge } from './pages/KnowledgePage.js';
import { renderHelpCenter } from './pages/HelpCenterPage.js';
import { renderPortfolio } from './pages/PortfolioPage.js';
import { renderProgress } from './pages/ProgressPage.js';
import { renderCertificates } from './pages/CertificatesPage.js';
import { renderFavorites } from './pages/FavoritesPage.js';
import { renderNotes } from './pages/NotesPage.js';
import { renderProfile } from './pages/ProfilePage.js';
import { renderAdmin } from './pages/AdminPage.js';
import { renderReview } from './pages/ReviewPage.js';
import { renderHistory } from './pages/HistoryPage.js';
import { renderLogin } from './pages/LoginPage.js';

let currentRoute = 'inicio';
let routeParams = {};

export async function navigate(route, params = {}) {
  currentRoute = route;
  routeParams = params;
  renderApp();
}

async function renderApp() {
  const root = document.getElementById('root');
  if (!root) return;

  const user = api.getCurrentUser();

  // Se não estiver logado e tentar acessar área interna, redireciona para login
  if (!user && currentRoute !== 'login') {
    currentRoute = 'login';
  }

  // ROTA ESPECIAL: TELA DE LOGIN (Sem Sidebar e Header)
  if (currentRoute === 'login') {
    root.innerHTML = `
      <div style="min-height: 100vh; background-color: var(--bg-main);">
        <main id="page-content"></main>
      </div>
    `;
    const pageContainer = document.getElementById('page-content');
    await renderLogin(pageContainer, navigate);
    return;
  }

  const sidebarHtml = renderSidebar(currentRoute);
  const headerHtml = renderHeader();
  const searchModalHtml = renderSearchModal();
  const helpModalHtml = renderHelpModal();

  root.innerHTML = `
    <div class="app-container">
      <div id="sidebar-mount">${sidebarHtml}</div>
      <div class="main-wrapper">
        <div id="header-mount">${headerHtml}</div>
        <main class="content-area" id="page-content"></main>
      </div>
    </div>
    ${searchModalHtml}
    ${helpModalHtml}
  `;

  // Conectar navegação da sidebar
  root.querySelectorAll('.nav-item').forEach(item => {
    item.onclick = () => {
      const r = item.getAttribute('data-route');
      navigate(r);
    };
  });

  // Conectar navegação de perfil no header
  const profileHeaderBtn = root.querySelector('#header-profile-btn');
  if (profileHeaderBtn) {
    profileHeaderBtn.onclick = () => navigate('perfil');
  }

  // Seletor rápido de usuário no Header (Alternância entre os 3 alunos e o admin)
  const userSelect = root.querySelector('#user-switcher-select');
  if (userSelect) {
    userSelect.onchange = async () => {
      const selectedLogin = userSelect.value;
      const senha = selectedLogin === 'admin@escola.design' ? 'admin123' : 'senha123';
      try {
        await api.login(selectedLogin, senha);
        showToast(`Perfil alternado para ${selectedLogin}!`);
        renderApp();
      } catch (e) {
        showToast('Falha ao alternar usuário.', 'error');
      }
    };
  }

  // Setup dos componentes interativos do Header e Modais Globais
  setupHeader(navigate);
  setupSearchModal(navigate);
  setupHelpModal();

  // Renderizar a página ativa
  const pageContainer = document.getElementById('page-content');

  switch (currentRoute) {
    case 'inicio':
      await renderDashboard(pageContainer, navigate);
      break;
    case 'cursos':
      await renderCourses(pageContainer, navigate, routeParams);
      break;
    case 'curso-detalhe':
      await renderCourseDetail(pageContainer, routeParams.slug || routeParams.id || 1, navigate);
      break;
    case 'aula-player':
      await renderLessonPlayer(pageContainer, routeParams.id || 1, navigate);
      break;
    case 'formacao':
      await renderTrack(pageContainer, navigate);
      break;

    // Softwares Diretos do Menu Principal (Seção 4)
    case 'photoshop':
      await renderCourses(pageContainer, navigate, { software_area: 'Photoshop' });
      break;
    case 'illustrator':
      await renderCourses(pageContainer, navigate, { software_area: 'Illustrator' });
      break;
    case 'after-effects':
      await renderCourses(pageContainer, navigate, { software_area: 'After Effects' });
      break;
    case 'coreldraw':
      await renderCourses(pageContainer, navigate, { software_area: 'CorelDRAW' });
      break;
    case 'fundamentos-design':
    case 'fundamentos':
      await renderCourses(pageContainer, navigate, { software_area: 'Fundamentos' });
      break;

    // Suporte e Conhecimento
    case 'conhecimento':
      await renderKnowledge(pageContainer, navigate, routeParams.search || '');
      break;
    case 'ajuda':
      await renderHelpCenter(pageContainer, navigate);
      break;

    // Estudo, Revisão e Prática
    case 'revisao':
      await renderReview(pageContainer, navigate);
      break;
    case 'historico':
      await renderHistory(pageContainer, navigate);
      break;
    case 'portfolio':
      await renderPortfolio(pageContainer, navigate);
      break;
    case 'progresso':
      await renderProgress(pageContainer, navigate);
      break;
    case 'certificados':
      await renderCertificates(pageContainer, navigate);
      break;
    case 'favoritos':
      await renderFavorites(pageContainer, navigate);
      break;
    case 'anotacoes':
      await renderNotes(pageContainer, navigate);
      break;
    case 'perfil':
      await renderProfile(pageContainer, navigate);
      break;
    case 'admin':
      await renderAdmin(pageContainer, navigate);
      break;
    default:
      await renderDashboard(pageContainer, navigate);
  }
}

// Inicialização da Aplicação com verificação de prontidão do DOM
async function initApp() {
  try {
    // 1. Tenta renderizar imediatamente
    await renderApp();

    // 2. Se usuário não estiver logado, tenta autenticação inicial e atualiza
    if (!api.getCurrentUser()) {
      await api.ensureInitialAuth();
      await renderApp();
    }
  } catch (err) {
    console.error('Erro na inicialização da aplicação:', err);
    // Em caso de falha, garante exibição da tela de login
    const root = document.getElementById('root');
    if (root) {
      currentRoute = 'login';
      await renderApp();
    }
  }

  window.addEventListener('auth-changed', () => renderApp());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

