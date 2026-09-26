# Arquitetura — Plataforma de Formação em Design ("Escola Digital de Design")

> Documento técnico conforme a especificação da skill [`formacao-design-platform-skill.md`](file:///c:/Users/luidt/OneDrive/escola/SISTEMA-DESIGNER-SUCESSO/.agents/SKILL/formacao-design-platform-skill.md).

---

## 1. Visão Geral do Sistema

A **Escola Digital de Design** é uma plataforma educacional full-stack para formação profissional em Design Gráfico, Digital e Motion Design (Photoshop, Illustrator, CorelDRAW, After Effects e Fundamentos do Design).

### Princípios Arquiteturais:
- **Anti-Superficialidade:** Nenhum número, gráfico, login ou percentual é estático ou simulado. Tudo é persistido e calculado a partir do banco de dados relacional.
- **Modularidade:** Backend desacoplado em serviços com responsabilidades únicas (auth, courses, progress, assessments, projects, certificates, help-center, knowledge-base, search, admin).
- **Didática Estruturada:** Todas as aulas seguem rigidamente o template de 12 tópicos da Seção 5 da skill.

---

## 2. Diagrama de Estrutura de Pastas

```
SISTEMA-DESIGNER-SUCESSO/
├── frontend/                     # SPA Responsiva Moderna
│   ├── index.html                # Ponto de entrada com Google Fonts e tags SEO
│   └── src/
│       ├── styles/
│       │   ├── tokens.css        # Design tokens, paleta cromática e glassmorphism
│       │   ├── layout.css        # Sidebar com 13 itens, header superior com busca
│       │   └── components.css    # Cards, player de 12 tópicos, certificados, modais
│       ├── services/
│       │   └── api.js            # Cliente HTTP com fetch autenticado (Bearer token)
│       ├── components/
│       │   ├── Sidebar.js        # Menu lateral completo (13 itens + admin)
│       │   ├── Header.js         # Busca global, alternador de perfis, atalho de ajuda
│       │   ├── SearchModal.js    # Modal de busca em tempo real (Ctrl+K)
│       │   ├── HelpModal.js      # Modal flutuante do Professor Virtual
│       │   └── Toast.js          # Notificações visuais elegantes
│       ├── pages/                # 13 páginas completas da plataforma
│       └── app.js                # Roteador SPA reativo e gerenciamento de estado
├── backend/                      # API REST Modular em Node.js / Express
│   ├── auth/                     # Autenticação segura com scrypt e HMAC-SHA256
│   ├── courses/                  # Catálogo de cursos, módulos e aulas completas
│   ├── progress/                 # Cálculo dinâmico e persistido do progresso
│   ├── assessments/              # Quizzes avaliativos e validação server-side
│   ├── projects/                 # Portfólio dos alunos e submissão de peças
│   ├── certificates/             # Geração de certificados e validador público
│   ├── help-center/              # Professor Virtual contextual em 5 passos
│   ├── knowledge-base/           # Base técnica interna e motor de busca com fontes
│   ├── search/                   # Busca global unificada em todas as entidades
│   ├── admin/                    # Métricas da escola e monitoramento de versões
│   ├── notes-favorites/          # Caderno de anotações e favoritos dos alunos
│   └── server.js                 # Ponto de entrada do servidor HTTP REST
├── database/                     # Camada de Persistência Relacional
│   ├── schema.sql                # DDL com 20 tabelas, constraints e índices
│   ├── db.js                     # Driver relacional via node:sqlite de alta performance
│   ├── init.js                   # Script de inicialização do banco
│   └── seed.js                   # Semeadura com 3 alunos, admin, 5 cursos e aulas
└── docs/
    ├── arquitetura.md            # Este documento
    ├── deploy.md                 # Guia de implantação em nuvem 24/7
    └── manutencao.md             # Procedimentos operacionais e backups
```

---

## 3. Modelo de Dados Relacional (Entidades)

| Tabela | Função | Principais Relacionamentos |
|---|---|---|
| `users` | Usuários (alunos e administradores) com hash de senha e bio | 1—N com todas as tabelas de atividade |
| `courses` | Cursos oficiais (Photoshop, Illustrator, CorelDRAW, After Effects, Fundamentos) | 1—N com `modules`, `projects`, `quizzes` |
| `modules` | Módulos curriculares ordenados por curso | N—1 com `courses`, 1—N com `lessons` |
| `lessons` | Aulas completas com os 12 tópicos obrigatórios | N—1 com `modules`, 1—N com `exercises` |
| `exercises` | Exercícios práticos e desafios técnicos vinculados à aula | N—1 com `lessons` |
| `projects` | Projetos de conclusão de curso para portfólio | N—1 com `courses` |
| `user_projects` | Portfólio dos alunos com feedback e status de aprovação | N—1 com `users` e `projects` |
| `quizzes` | Avaliações de fixação com nota mínima | N—1 com `lessons`/`courses` |
| `questions` & `answers` | Questões e alternativas com explicação pedagógica | N—1 com `quizzes` |
| `user_quiz_attempts` | Histórico de tentativas e notas reais dos alunos | N—1 com `users` e `quizzes` |
| `user_lesson_progress` | Registro de cada aula concluída | N—1 com `users` e `lessons` |
| `user_exercise_progress` | Registro e resposta dos exercícios | N—1 com `users` e `exercises` |
| `course_progress` | Métricas consolidadas recalculadas matematicamente | N—1 com `users` e `courses` |
| `notes` | Caderno pessoal de anotações por aula | N—1 com `users` e `lessons` |
| `favorites` | Favoritos do aluno (cursos, aulas, artigos) | N—1 com `users` |
| `certificates` | Certificados emitidos com código único e hash SHA-256 | N—1 com `users` e `courses` |
| `knowledge` | Base interna com tags, passos e links para docs oficiais | Independente / referenciável |
| `help_queries` | Consultas ao Professor Virtual e fontes citadas | N—1 com `users` |
| `software_updates` | Registro de novas versões e aulas impactadas | Relacionado a softwares |

---

## 4. Fórmula Matemática do Progresso Real

O progresso de um aluno em um curso não é arbitrário nem estático:

$$\text{Progresso} = \left(\frac{\text{Aulas Concluídas}}{\text{Total de Aulas}} \times 40\%\right) + \left(\frac{\text{Exercícios Concluídos}}{\text{Total de Exercícios}} \times 20\%\right) + \left(\frac{\text{Quizzes Aprovados}}{\text{Total de Quizzes}} \times 20\%\right) + \left(\frac{\text{Projetos Aprovados}}{\text{Total de Projetos}} \times 20\%\right)$$

A cada aula marcada, exercício entregue, quiz aprovado ou projeto avaliado, o serviço `recalculateCourseProgress` atualiza o registro na tabela `course_progress`. Se o progresso atingir 100%, o certificado oficial é emitido automaticamente com código único de validação.
