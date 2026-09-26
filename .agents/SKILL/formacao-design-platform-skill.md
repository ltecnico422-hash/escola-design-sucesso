---
name: formacao-design-platform
description: >
  Skill para planejar, construir, manter e expandir uma plataforma web completa
  de formação profissional em Design Gráfico, Design Digital e Motion Design
  (Photoshop, Illustrator, After Effects, CorelDRAW, Fundamentos de Design),
  em português do Brasil, hospedada em nuvem, com cursos estruturados em
  módulos/aulas/exercícios/projetos/avaliações, progresso automático,
  certificados, portfólio, Central de Ajuda contextual, Central de
  Conhecimento (base interna + pesquisa na internet), painel administrativo
  e sistema multiusuário. Use esta skill sempre que o usuário pedir para
  criar, estruturar, editar, expandir ou fazer deploy dessa "escola digital
  de design", mesmo que peça apenas uma parte dela (um curso, o dashboard de
  progresso, a Central de Ajuda, o banco de dados, o painel admin ou o deploy).
compatibility: >
  Aplicação web full-stack (front-end + back-end + banco de dados) hospedada
  em cloud; requer capacidade de gerar código, configurar banco remoto e
  documentar deploy. Não depende de nenhuma ferramenta proprietária específica.
---

# Skill — Plataforma de Formação em Design ("Escola Digital de Design")

## 1. Propósito

Esta skill guia a construção de uma **escola online completa** de Design
Gráfico, Design Digital e Motion Design — não uma biblioteca de vídeos, e
sim um sistema educacional real: trilha de aprendizagem, progresso
mensurado, avaliações, projetos, certificados, portfólio, Central de Ajuda
contextual (professor virtual) e Central de Conhecimento (base interna +
pesquisa na web), com painel administrativo completo.

Tudo deve ser em **português do Brasil**, com tom claro, profissional e
didático. A interface deve ser moderna/tecnológica, nunca infantil.

**Regra de ouro (anti-superficialidade):** nunca entregar botões sem
função, percentuais estáticos, login falso ou "cursos" vazios. Se algo
ainda não está implementado, marcar explicitamente como
`NÃO IMPLEMENTADO` em vez de simular funcionamento.

---

## 2. Como usar esta skill

Trabalhe em etapas, sempre dizendo em qual etapa está e o que ficou de fora
por enquanto:

1. **Planejamento** — confirmar stack, banco, hospedagem e escopo da rodada atual.
2. **Estrutura base** — projeto, banco, autenticação, layout, navegação.
3. **Sistema educacional** — cursos → módulos → aulas → exercícios → projetos → avaliações.
4. **Progresso** — cálculo automático, histórico, estatísticas.
5. **Central de Ajuda** — professor virtual contextual.
6. **Central de Conhecimento** — base interna + pesquisa na internet com citação de fontes.
7. **Perfis e portfólio** — acompanhamento individual dos 3 usuários.
8. **Certificados**.
9. **Administração** — CRUD de cursos/aulas/usuários, estatísticas.
10. **Deploy** — hospedagem em nuvem, HTTPS, variáveis de ambiente, backup.

Nunca pule para "aparência" antes de ter a lógica real conectada ao banco.
Prioridade: **Funcionalidade → Organização → Didática → Escalabilidade →
Segurança → Experiência do usuário → Design.**

Como o escopo é enorme, ao receber um pedido do usuário identifique qual
fatia ele quer (um módulo específico, o banco, o deploy, a Central de
Ajuda etc.) e entregue essa fatia de forma completa e funcional, em vez de
tentar gerar o sistema inteiro em uma única resposta.

---

## 3. Arquitetura de referência

Modular, para permitir crescer além dos 3 usuários iniciais sem reescrita.

```
plataforma-design/
├── frontend/            (SPA responsiva: dashboard, cursos, perfil, admin)
├── backend/
│   ├── auth/             (login, sessão, controle de acesso)
│   ├── courses/          (cursos, módulos, aulas)
│   ├── progress/         (cálculo e histórico de progresso)
│   ├── assessments/       (quizzes, provas, exercícios)
│   ├── projects/         (projetos práticos, portfólio)
│   ├── certificates/     (geração/consulta de certificados)
│   ├── help-center/      (Central de Ajuda contextual)
│   ├── knowledge-base/   (Central de Conhecimento: interna + web search)
│   ├── notifications/
│   ├── search/           (busca global)
│   └── admin/            (painel administrativo)
├── database/             (schema, migrations, seeds)
└── docs/                 (arquitetura, deploy, manutenção)
```

Cada módulo do backend tem responsabilidade única e API própria — nenhum
módulo deve depender de detalhes internos de outro (comunicação via
interfaces/serviços claros).

**Stack sugerida (ajustável ao ambiente disponível):** front-end SPA
responsivo; back-end com API REST; banco relacional (as entidades abaixo
são fortemente relacionais); autenticação por sessão/token; hospedagem
cloud com banco gerenciado remoto, HTTPS e variáveis de ambiente para
segredos. Adapte a tecnologia exata ao que estiver disponível no ambiente
de execução, mantendo essa separação de módulos.

---

## 4. Modelo de dados (entidades principais)

| Entidade | Campos-chave | Relações |
|---|---|---|
| `USERS` | nome, login, senha (hash), foto, papel (aluno/admin), data de entrada | 1—N com todas as entidades de progresso |
| `COURSES` | título, software/área, descrição, nível mínimo | 1—N `MODULES` |
| `MODULES` | curso_id, ordem, título | 1—N `LESSONS` |
| `LESSONS` | módulo_id, objetivo, conceito, ferramentas, explicação, passo a passo, dica profissional, erros comuns, conclusão | 1—N `EXERCISES`, `QUIZZES` |
| `EXERCISES` | aula_id, enunciado, tipo | N—1 `LESSONS` |
| `PROJECTS` | curso_id, nome, categoria, descrição, imagem, status | N—1 `USERS` (via portfólio) |
| `QUIZZES` / `QUESTIONS` / `ANSWERS` | vínculo a aula/curso, nota, tentativas | N—1 `LESSONS`/`USERS` |
| `PROGRESS` | user_id, curso_id, % calculado, aulas/exercícios/projetos concluídos | N—1 `USERS`, `COURSES` |
| `NOTES` | user_id, aula_id, texto | N—1 `USERS`, `LESSONS` |
| `FAVORITES` | user_id, tipo de item, item_id | N—1 `USERS` |
| `CERTIFICATES` | user_id, curso_id, carga horária, data, código único, % conclusão | N—1 `USERS`, `COURSES` |
| `KNOWLEDGE` | título, fonte, url, autor, data, software, versão, categoria, tags | independente, referenciável por aula |
| `HELP` | pergunta, contexto (curso/aula), resposta, fontes | N—1 `USERS` |
| `UPDATES` | software, versão, data, mudanças, aulas afetadas | N—N `LESSONS` |

Progresso nunca é editado manualmente pelo aluno — é sempre recalculado a
partir de aulas concluídas + exercícios + quizzes/provas + projetos.

---

## 5. Estrutura curricular

Padrão obrigatório para todo curso:

```
CURSO → MÓDULOS → AULAS → EXERCÍCIOS → PROJETOS → AVALIAÇÃO → CERTIFICADO
```

Cada aula segue este template fixo (nunca resumir para "Introdução /
Ferramentas / Projeto"):

```
## Objetivo
## Conceito
## Ferramentas
## Explicação
## Passo a passo
## Dica profissional
## Erros comuns
## Exercício
## Desafio
## Quiz
## Conclusão
## Próxima aula
```

Cada curso principal percorre 5 níveis: **Iniciante → Básico →
Intermediário → Avançado → Profissional**, com pré-requisitos coerentes
(ex.: Composição → Tipografia → Hierarquia → Design de cartaz).

### Cursos obrigatórios
- **Photoshop** (16 módulos: interface → camadas → seleções → máscaras →
  tipografia → cores → tratamento/manipulação de imagens → composição →
  luz/sombra → efeitos → cartazes/publicidade → projetos profissionais →
  projeto final: campanha gráfica completa)
- **Illustrator** (vetores, Pathfinder, Pen Tool, tipografia, logo,
  identidade visual, padrões, símbolos, ilustração, editorial, impressão →
  projeto final: identidade visual completa)
- **After Effects** (timeline, keyframes, Graph Editor, shape layers,
  motion graphics, tracking, rotoscopia, chroma key, 3D, expressões,
  render → projeto final: peça de Motion Design)
- **CorelDRAW** (vetores, curvas/nós, tipografia, logotipos, panfletos,
  CMYK, sangria, preparação para gráfica → projeto final: kit de materiais
  para impressão)
- **Fundamentos do Design**: teoria das cores, tipografia, composição,
  hierarquia visual, Gestalt, branding, identidade visual, direção de
  arte, design para redes sociais/impressão, tratamento/manipulação de
  imagens, motion design, fotografia para designers, briefing,
  atendimento ao cliente, apresentação de projetos, portfólio, mercado de
  design.

---

## 6. Progresso, trilha e recomendação

- Progresso por curso = função de (aulas concluídas + exercícios +
  quizzes/provas + projetos), recalculado a cada evento e persistido.
- Dashboard mostra barras de progresso por curso e progresso geral, horas
  estudadas, certificados, projetos e exercícios concluídos.
- **Trilha de formação** visual: Fundamentos → Photoshop → Illustrator →
  CorelDRAW → After Effects → Direção de Arte → Projetos Profissionais →
  Portfólio, com estados: concluído / em andamento / bloqueado /
  recomendado.
- **Recomendação de estudos**: sugere o próximo conteúdo com base no que
  foi concluído, e sugere revisão (nunca punição) quando o aproveitamento
  em um módulo for baixo.
- **Modo Revisar**: reúne conteúdos marcados como difícil/revisar/importante.

---

## 7. Central de Ajuda (professor virtual contextual)

Fluxo obrigatório ao receber uma pergunta:

1. Identificar a dúvida e, quando possível, o curso/aula em que o aluno
   está (contexto: ex. "Photoshop → Módulo 5 → Máscaras").
2. Explicar o conceito usando a base interna da aula atual.
3. Mostrar passo a passo e exemplo.
4. Propor exercício.
5. Perguntar se o aluno compreendeu.

Se a base interna não cobrir a dúvida (ferramenta nova, erro específico,
versão recente), a Central deve poder **pesquisar na internet** (ver
Central de Conhecimento) e trazer a resposta didaticamente, sempre citando
a fonte consultada.

---

## 8. Central de Conhecimento (base interna + internet)

Funciona como **biblioteca + professor + pesquisador + assistente
técnico**, combinando:

- **Base interna**: cursos, aulas, apostilas, exercícios, glossário,
  projetos, documentação cadastrada.
- **Internet**: pesquisa quando a base interna não resolve, quando o
  software recebeu atualização, quando o usuário pede informação atual ou
  pergunta sobre uma versão específica.

**Prioridade de fontes** (sempre nessa ordem):
1. Documentação oficial dos softwares (Adobe, Corel, centros de suporte).
2. Fontes técnicas/educacionais confiáveis.
3. Sites especializados em Design.
4. Tutoriais de profissionais.
5. Fóruns/comunidades (principalmente para solução prática de problemas).

**Regras não negociáveis:**
- Toda resposta baseada em pesquisa externa deve informar a fonte
  consultada (e link, quando possível).
- Nunca copiar conteúdo integral de sites, livros ou cursos pagos; sempre
  **pesquisar → analisar → resumir → explicar → referenciar**, nunca
  reproduzir.
- Ao encontrar fontes divergentes, explicitar o conflito: "a documentação
  oficial recomenda X, enquanto outra fonte sugere Y" — nunca apresentar
  opinião de terceiros como fato absoluto.
- Distinguir sempre **documentação oficial** de **opinião/tutorial/experiência de usuário**.
- Considerar versão do software e data da informação quando relevante.
- Nunca inventar links, autores ou referências.

**Modos de interação:**
- 🔎 **Pesquisar na internet** — pesquisa explícita, retorna resposta + passo a passo + fontes + data da consulta.
- 🎓 **Aprender** — resposta didática completa: O que é? / Por que existe? / Como funciona? / Passo a passo / Exemplo / Erro comum / Exercício / Fontes.
- 🛠 **Solucionar problema** — diagnóstico de erros: causas prováveis → perguntas de esclarecimento → soluções em ordem → fontes.

O administrador pode promover um resultado de pesquisa para a base
interna (`ADICIONAR À BASE DE CONHECIMENTO`), registrando título, fonte,
autor, URL, datas, software/versão, categoria e tags.

---

## 9. Avaliações, projetos, certificados e portfólio

- **Avaliações**: quizzes, provas, exercícios, desafios e avaliações
  práticas, registrando nota, tentativas, acertos/erros e data.
- **Projetos**: vinculados ao progresso do curso; cada um com nome, data,
  curso, categoria, descrição, imagem, status; reunidos em **Meu
  Portfólio**.
- **Certificados**: gerados automaticamente ao cumprir os requisitos de um
  curso, contendo nome, curso, carga horária, data, código único de
  identificação, % de conclusão e identificação da plataforma. Consultáveis
  em **Meus Certificados**.

---

## 10. Painel administrativo

O admin pode: criar/editar cursos, módulos, aulas, exercícios, provas,
projetos e certificados; gerenciar usuários e visualizar progresso
individual (nunca como ranking competitivo); gerenciar Central de
Conhecimento e Central de Ajuda; acompanhar **Atualizações** (software,
versão, data, mudanças, aulas afetadas — sinalizando aulas desatualizadas);
visualizar estatísticas gerais.

---

## 11. Navegação e UX

Menu principal padrão:

```
🏠 Início · 📚 Meus Cursos · 🎓 Formação · 🛠 Softwares · 📖 Fundamentos
🧠 Central de Conhecimento · 🆘 Central de Ajuda · 📁 Meu Portfólio
📊 Meu Progresso · 🏆 Certificados · ⭐ Favoritos · 📝 Minhas Anotações
👤 Meu Perfil
```

Interface: moderna/tecnológica, cards, ícones, gráficos, barras de
progresso, microinterações discretas, navegação lateral, busca global
(pesquisa cursos, aulas, ferramentas, conceitos, exercícios, projetos e
conteúdo da Central de Conhecimento/Ajuda em um único resultado),
responsiva (desktop, tablet, celular). Evitar visual infantil ou
excessivamente colorido.

---

## 12. Segurança e dados

- Autenticação obrigatória, senhas sempre com hash (nunca em texto puro ou expostas no código).
- Controle de sessão e de permissões (aluno vs. admin), área administrativa protegida.
- Validação de dados de entrada em toda API.
- HTTPS, variáveis de ambiente para segredos, backups periódicos do banco e dos conteúdos.
- Documentar processo de restauração a partir de backup.

---

## 13. Deploy e disponibilidade

Requisito inegociável: a plataforma deve continuar acessível mesmo com o
computador local do administrador desligado. Ao gerar a documentação de
deploy, cobrir sempre:

1. Preparar ambiente e instalar dependências.
2. Configurar banco de dados remoto (gerenciado pelo provedor de nuvem).
3. Configurar variáveis de ambiente (segredos, URLs, chaves).
4. Criar usuário administrador inicial.
5. Rodar localmente para validação.
6. Deploy em servidor/cloud.
7. Configurar domínio próprio (se houver).
8. Configurar HTTPS.
9. Configurar rotina de backup.
10. Procedimento de atualização da aplicação em produção.
11. Passos de solução de problemas comuns (troubleshooting).

---

## 14. Checklist "regra contra implementação superficial"

Antes de entregar qualquer parte do sistema, confirmar:

- [ ] Login é real (não simulado) e protegido.
- [ ] Percentuais de progresso vêm de cálculo real, não valores fixos.
- [ ] Cursos entregues têm estrutura curricular real (módulos/aulas
      completos no template da seção 5), não só títulos.
- [ ] Botões/menus mostrados existem conectados à lógica correspondente.
- [ ] Certificados têm dados reais do aluno/curso, não apenas decorativos.
- [ ] Dashboard está conectado ao banco de dados.
- [ ] Central de Ajuda responde de fato (base interna e/ou pesquisa real).
- [ ] Qualquer parte não implementada está marcada como `NÃO IMPLEMENTADO`.

---

## 15. Entrega final esperada

Ao concluir uma rodada de trabalho com esta skill, apresentar de forma
objetiva: arquitetura usada, stack escolhida, estrutura de pastas, schema
do banco, fluxo do usuário e do administrador, estrutura dos cursos
entregues, sistema de progresso, Central de Ajuda, Central de
Conhecimento, certificados, hospedagem, backup, e instruções de
instalação/deploy/manutenção — sempre explicando o motivo de decisões
arquiteturais importantes e citando claramente qualquer limitação atual.
