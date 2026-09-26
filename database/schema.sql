-- ============================================================
-- ESCOLA DIGITAL DE DESIGN - SCHEMA RELACIONAL EXPANDIDO
-- Conforme especificação formacao-design-platform-skill.md e Requisitos de Funcionamento
-- ============================================================

PRAGMA foreign_keys = ON;

-- 1. USUÁRIOS
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    login TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    foto TEXT,
    bio TEXT,
    papel TEXT NOT NULL CHECK(papel IN ('aluno', 'admin')) DEFAULT 'aluno',
    is_ativo INTEGER NOT NULL DEFAULT 1,
    ultima_aula_id INTEGER,
    data_entrada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ultima_aula_id) REFERENCES lessons(id) ON DELETE SET NULL
);

-- 2. RECUPERAÇÃO DE SENHA
CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expira_em DATETIME NOT NULL,
    usado INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. CURSOS
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    titulo TEXT NOT NULL,
    software_area TEXT NOT NULL,
    descricao TEXT NOT NULL,
    nivel_minimo TEXT NOT NULL CHECK(nivel_minimo IN ('Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Profissional')) DEFAULT 'Iniciante',
    carga_horaria INTEGER NOT NULL DEFAULT 40,
    icone TEXT,
    imagem_capa TEXT,
    cor_tema TEXT DEFAULT '#6366f1',
    ordem_trilha INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL CHECK(status IN ('publicado', 'rascunho')) DEFAULT 'publicado',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. MÓDULOS
CREATE TABLE IF NOT EXISTS modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    curso_id INTEGER NOT NULL,
    ordem INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (curso_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 5. AULAS (Template fixo de 12 tópicos com mídias e materiais)
CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modulo_id INTEGER NOT NULL,
    ordem INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    duracao_minutos INTEGER NOT NULL DEFAULT 15,
    video_url TEXT,
    materiais_download TEXT,
    imagem_ilustrativa TEXT,
    -- Os 12 tópicos estruturados obrigatórios:
    objetivo TEXT NOT NULL,
    conceito TEXT NOT NULL,
    ferramentas TEXT NOT NULL,
    explicacao TEXT NOT NULL,
    passo_a_passo TEXT NOT NULL,
    dica_profissional TEXT NOT NULL,
    erros_comuns TEXT NOT NULL,
    conclusao TEXT NOT NULL,
    proxima_aula TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (modulo_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- 6. EXERCÍCIOS PRÁTICOS
CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aula_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    enunciado TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('pratico', 'teorico', 'desafio')) DEFAULT 'pratico',
    solucao_esperada TEXT NOT NULL,
    criterios_avaliacao TEXT,
    materiais_necessarios TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aula_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- 7. PROJETOS PRÁTICOS DE CONCLUSÃO
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    curso_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    categoria TEXT NOT NULL,
    descricao TEXT NOT NULL,
    imagem_url TEXT,
    requisitos TEXT NOT NULL,
    criterios_aprovacao TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (curso_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 8. PROJETOS DOS ALUNOS (Portfólio individual)
CREATE TABLE IF NOT EXISTS user_projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    curso_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    imagem_url TEXT NOT NULL,
    arquivo_url TEXT,
    status TEXT NOT NULL CHECK(status IN ('em_andamento', 'enviado', 'aprovado', 'precisa_ajustes')) DEFAULT 'em_andamento',
    feedback_admin TEXT,
    nota REAL,
    data_envio DATETIME,
    data_aprovacao DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 9. QUIZZES E QUESTÕES
CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aula_id INTEGER,
    curso_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    nota_minima REAL NOT NULL DEFAULT 70.0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aula_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id INTEGER NOT NULL,
    ordem INTEGER NOT NULL,
    enunciado TEXT NOT NULL,
    explicacao TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    texto TEXT NOT NULL,
    correta INTEGER NOT NULL CHECK(correta IN (0, 1)) DEFAULT 0,
    ordem INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_quiz_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quiz_id INTEGER NOT NULL,
    nota REAL NOT NULL,
    total_questoes INTEGER NOT NULL,
    acertos INTEGER NOT NULL,
    aprovado INTEGER NOT NULL CHECK(aprovado IN (0, 1)),
    detalhes_respostas TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

-- 10. PROGRESSO (Histórico e Cálculo Real Persistido)
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    lesson_id INTEGER NOT NULL,
    curso_id INTEGER NOT NULL,
    concluida INTEGER NOT NULL CHECK(concluida IN (0, 1)) DEFAULT 0,
    data_conclusao DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_exercise_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exercise_id INTEGER NOT NULL,
    curso_id INTEGER NOT NULL,
    concluido INTEGER NOT NULL CHECK(concluido IN (0, 1)) DEFAULT 0,
    resposta_aluno TEXT,
    data_conclusao DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, exercise_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS course_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    curso_id INTEGER NOT NULL,
    percentual_calculado REAL NOT NULL DEFAULT 0.0,
    aulas_concluidas INTEGER NOT NULL DEFAULT 0,
    total_aulas INTEGER NOT NULL DEFAULT 0,
    exercicios_concluidos INTEGER NOT NULL DEFAULT 0,
    total_exercicios INTEGER NOT NULL DEFAULT 0,
    quizzes_aprovados INTEGER NOT NULL DEFAULT 0,
    total_quizzes INTEGER NOT NULL DEFAULT 0,
    projetos_concluidos INTEGER NOT NULL DEFAULT 0,
    total_projetos INTEGER NOT NULL DEFAULT 0,
    horas_estudadas REAL NOT NULL DEFAULT 0.0,
    ultima_aula_id INTEGER,
    ultimo_acesso DATETIME DEFAULT CURRENT_TIMESTAMP,
    marcado_revisao INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, curso_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 11. SISTEMA DE REVISÃO (REVISAR, IMPORTANTE, DIFÍCIL)
CREATE TABLE IF NOT EXISTS review_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    aula_id INTEGER NOT NULL,
    curso_id INTEGER NOT NULL,
    classificacao TEXT NOT NULL CHECK(classificacao IN ('revisar', 'importante', 'dificil')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, aula_id, classificacao),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (aula_id) REFERENCES lessons(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 12. HISTÓRICO DE ATIVIDADES REAL (Seção 29)
CREATE TABLE IF NOT EXISTS user_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tipo TEXT NOT NULL, -- 'aula_concluida', 'exercicio_entregue', 'quiz_realizado', 'projeto_enviado', 'certificado_emitido'
    titulo TEXT NOT NULL,
    descricao TEXT,
    curso_id INTEGER,
    aula_id INTEGER,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 13. SISTEMA DE NOTIFICAÇÕES (Seção 33)
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TEXT DEFAULT 'info',
    lida INTEGER NOT NULL DEFAULT 0,
    link TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 14. ANOTAÇÕES DOS ALUNOS
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    aula_id INTEGER NOT NULL,
    texto TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, aula_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (aula_id) REFERENCES lessons(id) ON DELETE CASCADE
);

-- 15. FAVORITOS
CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    tipo_item TEXT NOT NULL CHECK(tipo_item IN ('curso', 'aula', 'conhecimento')),
    item_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tipo_item, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 16. CERTIFICADOS
CREATE TABLE IF NOT EXISTS certificates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    curso_id INTEGER NOT NULL,
    codigo_unico TEXT NOT NULL UNIQUE,
    carga_horaria INTEGER NOT NULL,
    percentual_conclusao REAL NOT NULL,
    data_emissao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    hash_validacao TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, curso_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (curso_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- 17. CENTRAL DE CONHECIMENTO
CREATE TABLE IF NOT EXISTS knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    fonte TEXT NOT NULL,
    url TEXT,
    autor TEXT,
    data_publicacao TEXT,
    software TEXT NOT NULL,
    versao TEXT,
    categoria TEXT NOT NULL,
    tags TEXT,
    conteudo_resumo TEXT NOT NULL,
    passo_a_passo TEXT,
    erros_comuns TEXT,
    exercicio_proposto TEXT,
    tipo_fonte TEXT NOT NULL CHECK(tipo_fonte IN ('oficial', 'tecnica', 'tutorial', 'comunidade')) DEFAULT 'oficial',
    curado_admin INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 18. CENTRAL DE AJUDA (Professor Virtual Contextual)
CREATE TABLE IF NOT EXISTS help_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    contexto_curso_id INTEGER,
    contexto_aula_id INTEGER,
    pergunta TEXT NOT NULL,
    resposta TEXT NOT NULL,
    passo_a_passo TEXT,
    exercicio_proposto TEXT,
    fontes_citadas TEXT,
    origem_resposta TEXT NOT NULL CHECK(origem_resposta IN ('base_interna', 'pesquisa_web', 'hibrida')) DEFAULT 'base_interna',
    resolvido INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (contexto_curso_id) REFERENCES courses(id) ON DELETE SET NULL,
    FOREIGN KEY (contexto_aula_id) REFERENCES lessons(id) ON DELETE SET NULL
);

-- 19. ATUALIZAÇÕES DE SOFTWARES
CREATE TABLE IF NOT EXISTS software_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    software TEXT NOT NULL,
    versao TEXT NOT NULL,
    data_lancamento DATE NOT NULL,
    mudancas TEXT NOT NULL,
    aulas_afetadas TEXT,
    status_revisao TEXT NOT NULL CHECK(status_revisao IN ('pendente', 'revisado', 'atualizado')) DEFAULT 'pendente',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES PARA VELOCIDADE E BUSCA GLOBAL
CREATE INDEX IF NOT EXISTS idx_modules_curso ON modules(curso_id);
CREATE INDEX IF NOT EXISTS idx_lessons_modulo ON lessons(modulo_id);
CREATE INDEX IF NOT EXISTS idx_exercises_aula ON exercises(aula_id);
CREATE INDEX IF NOT EXISTS idx_projects_curso ON projects(curso_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_curso ON quizzes(curso_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_progress ON user_lesson_progress(user_id, curso_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_software ON knowledge(software, categoria);
CREATE INDEX IF NOT EXISTS idx_help_queries_user ON help_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history_user ON user_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_review_items_user ON review_items(user_id);
