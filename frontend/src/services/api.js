// ============================================================
// SERVIÇO DE COMUNICAÇÃO COM O BACKEND REST
// ============================================================

const API_BASE = '/api';

const state = {
  token: localStorage.getItem('edd_token') || null,
  user: JSON.parse(localStorage.getItem('edd_user') || 'null')
};

// Se não houver usuário logado no primeiro acesso, loga automaticamente como Lucas Silva (Aluno 1)
async function ensureInitialAuth() {
  if (!state.token || !state.user) {
    try {
      await login('lucas@escola.design', 'senha123');
    } catch (e) {
      console.warn('Não foi possível autenticar o usuário inicial:', e);
    }
  }
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Erro HTTP: ${response.status}`);
  }

  return data;
}

// AUTENTICAÇÃO
async function login(loginStr, senha) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login: loginStr, senha })
  });

  state.token = data.token;
  state.user = data.user;
  localStorage.setItem('edd_token', data.token);
  localStorage.setItem('edd_user', JSON.stringify(data.user));

  window.dispatchEvent(new CustomEvent('auth-changed', { detail: data.user }));
  return data;
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('edd_token');
  localStorage.removeItem('edd_user');
  window.dispatchEvent(new CustomEvent('auth-changed', { detail: null }));
}

function getCurrentUser() {
  return state.user;
}

// CURSOS & AULAS
async function getCourses(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return request(`/courses${query ? `?${query}` : ''}`);
}

async function getCourseDetail(slugOrId) {
  return request(`/courses/${slugOrId}`);
}

async function getLessonDetail(lessonId) {
  return request(`/courses/lessons/${lessonId}`);
}

// PROGRESSO
async function getProgressSummary() {
  return request('/progress/summary');
}

async function getTrainingTrack() {
  return request('/progress/track');
}

async function completeLesson(lessonId, cursoId) {
  return request('/progress/complete-lesson', {
    method: 'POST',
    body: JSON.stringify({ lessonId, cursoId })
  });
}

async function completeExercise(exerciseId, cursoId, resposta) {
  return request('/progress/complete-exercise', {
    method: 'POST',
    body: JSON.stringify({ exerciseId, cursoId, resposta })
  });
}

async function getStudyRecommendation() {
  return request('/progress/recommendation');
}

// AVALIAÇÕES E QUIZZES
async function getQuiz(quizId) {
  return request(`/assessments/quiz/${quizId}`);
}

async function submitQuiz(quizId, respostas) {
  return request(`/assessments/quiz/${quizId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ respostas })
  });
}

// PROJETOS & PORTFÓLIO
async function getMyPortfolio() {
  return request('/projects/my-portfolio');
}

async function getCourseProjects(courseId) {
  return request(`/projects/course/${courseId}`);
}

async function submitProject(payload) {
  return request('/projects/submit', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

// CERTIFICADOS
async function getMyCertificates() {
  return request('/certificates/my');
}

async function issueCertificate(courseId) {
  return request(`/certificates/issue/${courseId}`, {
    method: 'POST'
  });
}

async function verifyCertificate(codigo) {
  return request(`/certificates/verify/${codigo}`);
}

// CENTRAL DE AJUDA
async function askVirtualProfessor(pergunta, cursoId = null, aulaId = null) {
  return request('/help/ask', {
    method: 'POST',
    body: JSON.stringify({ pergunta, cursoId, aulaId })
  });
}

async function getHelpHistory() {
  return request('/help/history');
}

// CENTRAL DE CONHECIMENTO
async function getKnowledgeArticles(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  return request(`/knowledge${query ? `?${query}` : ''}`);
}

async function searchExternalKnowledge(termo, modo = 'aprender', software = null) {
  return request('/knowledge/search-external', {
    method: 'POST',
    body: JSON.stringify({ termo, modo, software })
  });
}

// BUSCA GLOBAL
async function globalSearch(term) {
  return request(`/search?q=${encodeURIComponent(term)}`);
}

// ANOTAÇÕES E FAVORITOS
async function getMyNotes() {
  return request('/user/notes');
}

async function saveNote(aulaId, texto) {
  return request('/user/notes', {
    method: 'POST',
    body: JSON.stringify({ aulaId, texto })
  });
}

async function getMyFavorites() {
  return request('/user/favorites');
}

async function toggleFavorite(tipoItem, itemId) {
  return request('/user/favorites/toggle', {
    method: 'POST',
    body: JSON.stringify({ tipoItem, itemId })
  });
}

// ADMIN
async function getAdminMetrics() {
  return request('/admin/metrics');
}

async function getAdminUsersProgress() {
  return request('/admin/users-progress');
}

// CONTINUAÇÃO AUTOMÁTICA (Seção 8)
async function getContinuePoint() {
  return request('/progress/continue');
}

// SISTEMA DE REVISÃO (Seção 23)
async function getMyReviews(classificacao = null) {
  const q = classificacao ? `?classificacao=${encodeURIComponent(classificacao)}` : '';
  return request(`/user/reviews${q}`);
}

async function toggleReview(aulaId, cursoId, classificacao) {
  return request('/user/reviews/toggle', {
    method: 'POST',
    body: JSON.stringify({ aulaId, cursoId, classificacao })
  });
}

// HISTÓRICO DE ATIVIDADES REAL (Seção 29)
async function getMyHistory() {
  return request('/user/history');
}

// NOTIFICAÇÕES (Seção 33)
async function getNotifications() {
  return request('/user/notifications');
}

async function markNotificationRead(id) {
  return request(`/user/notifications/${id}/read`, { method: 'POST' });
}

async function markAllNotificationsRead() {
  return request('/user/notifications/read-all', { method: 'POST' });
}

// RECUPERAÇÃO DE SENHA (Seção 1)
async function forgotPassword(loginStr) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ login: loginStr })
  });
}

async function resetPassword(token, novaSenha) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, novaSenha })
  });
}

// ADMINISTRAÇÃO DE USUÁRIOS (Seção 30)
async function getAdminUsers() {
  return request('/admin/users');
}

async function createAdminUser(userData) {
  return request('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}

async function updateAdminUser(id, userData) {
  return request(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
}

async function toggleAdminUserActive(id) {
  return request(`/admin/users/${id}`, {
    method: 'DELETE'
  });
}

export const api = {
  ensureInitialAuth,
  login,
  logout,
  getCurrentUser,
  getCourses,
  getCourseDetail,
  getLessonDetail,
  getProgressSummary,
  getTrainingTrack,
  getContinuePoint,
  completeLesson,
  completeExercise,
  getStudyRecommendation,
  getQuiz,
  submitQuiz,
  getMyPortfolio,
  getCourseProjects,
  submitProject,
  getMyCertificates,
  issueCertificate,
  verifyCertificate,
  askVirtualProfessor,
  getHelpHistory,
  getKnowledgeArticles,
  searchExternalKnowledge,
  globalSearch,
  getMyNotes,
  saveNote,
  getMyFavorites,
  toggleFavorite,
  getMyReviews,
  toggleReview,
  getMyHistory,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  forgotPassword,
  resetPassword,
  getAdminMetrics,
  getAdminUsersProgress,
  getSoftwareUpdates,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  toggleAdminUserActive
};

