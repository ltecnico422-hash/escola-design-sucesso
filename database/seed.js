const { initDb, get, run, query, transaction } = require('./db.js');
const { hashPassword } = require('../backend/auth/auth.service.js');

function runSeed() {
  console.log('--- Iniciando Semeadura Completa e Expandida da Escola Digital de Design ---');
  initDb();

  transaction(({ run, get, query }) => {
    // Limpeza de tabelas para re-semeadura limpa
  run('DELETE FROM notifications;');
  run('DELETE FROM user_history;');
  run('DELETE FROM review_items;');
  run('DELETE FROM password_resets;');
  run('DELETE FROM help_queries;');
  run('DELETE FROM knowledge;');
  run('DELETE FROM software_updates;');
  run('DELETE FROM certificates;');
  run('DELETE FROM favorites;');
  run('DELETE FROM notes;');
  run('DELETE FROM course_progress;');
  run('DELETE FROM user_exercise_progress;');
  run('DELETE FROM user_lesson_progress;');
  run('DELETE FROM user_quiz_attempts;');
  run('DELETE FROM answers;');
  run('DELETE FROM questions;');
  run('DELETE FROM quizzes;');
  run('DELETE FROM user_projects;');
  run('DELETE FROM projects;');
  run('DELETE FROM exercises;');
  run('DELETE FROM lessons;');
  run('DELETE FROM modules;');
  run('DELETE FROM courses;');
  run('DELETE FROM users;');

  console.log('1. Criando Perfis de Usuários...');
  const senhaAluno = hashPassword('senha123');
  const senhaAdmin = hashPassword('admin123');

  const usersList = [
    {
      nome: 'Administrador Master',
      login: 'admin@escola.design',
      senha_hash: senhaAdmin,
      foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      bio: 'Coordenador Geral e Curador Educacional da Escola Digital de Design.',
      papel: 'admin'
    },
    {
      nome: 'Lucas Silva',
      login: 'lucas@escola.design',
      senha_hash: senhaAluno,
      foto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      bio: 'Estudante com foco em Manipulação Publicitária e Motion Graphics.',
      papel: 'aluno'
    },
    {
      nome: 'Mariana Costa',
      login: 'mariana@escola.design',
      senha_hash: senhaAluno,
      foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      bio: 'Estudante dedicada a Design Editorial, Branding e Identidade Visual.',
      papel: 'aluno'
    },
    {
      nome: 'Rodrigo Alves',
      login: 'rodrigo@escola.design',
      senha_hash: senhaAluno,
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bio: 'Designer gráfico focado em produção de materiais comerciais e pré-impressão.',
      papel: 'aluno'
    }
  ];

  for (const u of usersList) {
    run('INSERT INTO users (nome, login, senha_hash, foto, bio, papel) VALUES (?, ?, ?, ?, ?, ?)', [
      u.nome, u.login, u.senha_hash, u.foto, u.bio, u.papel
    ]);
  }

  console.log('2. Inserindo Cursos com Imagens de Capa e Metadados...');
  const coursesList = [
    {
      slug: 'fundamentos-do-design',
      titulo: 'Fundamentos do Design e Teoria Visual',
      software_area: 'Fundamentos',
      descricao: 'Base conceitual obrigatória: Teoria das Cores, Tipografia, Gestalt, Hierarquia Visual, Composição, Grid, Branding e Mercado Profissional.',
      nivel_minimo: 'Iniciante',
      carga_horaria: 50,
      icone: 'palette',
      imagem_capa: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
      cor_tema: '#6366f1',
      ordem_trilha: 1
    },
    {
      slug: 'photoshop-profissional',
      titulo: 'Adobe Photoshop — Da Base ao Avançado',
      software_area: 'Photoshop',
      descricao: 'Formação profissional em 16 módulos: Camadas, Seleções Cirúrgicas, Máscaras Não-Destrutivas, Tratamento High-End, Luz, Sombra e Publicidade.',
      nivel_minimo: 'Iniciante',
      carga_horaria: 80,
      icone: 'image',
      imagem_capa: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800',
      cor_tema: '#38bdf8',
      ordem_trilha: 2
    },
    {
      slug: 'illustrator-vetorial',
      titulo: 'Adobe Illustrator — Vetores e Identidade Visual',
      software_area: 'Illustrator',
      descricao: 'Domínio da Pen Tool, Pathfinder, Grid de Construção, Design de Logotipos, Sistemas de Identidade Visual, Tipografia Vetorial e Impressão.',
      nivel_minimo: 'Iniciante',
      carga_horaria: 70,
      icone: 'pen-tool',
      imagem_capa: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800',
      cor_tema: '#f59e0b',
      ordem_trilha: 3
    },
    {
      slug: 'coreldraw-grafica',
      titulo: 'CorelDRAW — Produção Gráfica e Pré-Impressão',
      software_area: 'CorelDRAW',
      descricao: 'Criação vetorial com foco na indústria gráfica: Curvas/Nós Bézier, CMYK, Sangria, Separação de Cores, Facas Especiais e Fechamento de Arquivos.',
      nivel_minimo: 'Iniciante',
      carga_horaria: 45,
      icone: 'printer',
      imagem_capa: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
      cor_tema: '#10b981',
      ordem_trilha: 4
    },
    {
      slug: 'after-effects-motion',
      titulo: 'Adobe After Effects — Motion Design Profissional',
      software_area: 'After Effects',
      descricao: 'Animação para telas e publicidade: Timeline, Keyframes, Graph Editor, Shape Layers, Animação Tipográfica, Chroma Key, 3D e Expressões.',
      nivel_minimo: 'Intermediário',
      carga_horaria: 75,
      icone: 'film',
      imagem_capa: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
      cor_tema: '#a855f7',
      ordem_trilha: 5
    }
  ];

  for (const c of coursesList) {
    run('INSERT INTO courses (slug, titulo, software_area, descricao, nivel_minimo, carga_horaria, icone, imagem_capa, cor_tema, ordem_trilha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
      c.slug, c.titulo, c.software_area, c.descricao, c.nivel_minimo, c.carga_horaria, c.icone, c.imagem_capa, c.cor_tema, c.ordem_trilha
    ]);
  }

  const cFund = get("SELECT id FROM courses WHERE slug = 'fundamentos-do-design'").id;
  const cPs = get("SELECT id FROM courses WHERE slug = 'photoshop-profissional'").id;
  const cAi = get("SELECT id FROM courses WHERE slug = 'illustrator-vetorial'").id;
  const cCorel = get("SELECT id FROM courses WHERE slug = 'coreldraw-grafica'").id;
  const cAe = get("SELECT id FROM courses WHERE slug = 'after-effects-motion'").id;

  console.log('3. Inserindo Módulos dos Cursos...');
  // Fundamentos
  run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, 1, ?, ?)', [cFund, 'Módulo 1: Teoria das Cores e Harmonia Cromática', 'Círculo cromático, psicologia das cores, contraste e proporção 60-30-10']);
  run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, 2, ?, ?)', [cFund, 'Módulo 2: Tipografia e Hierarquia Visual', 'Anatomia das fontes, pairing tipográfico, kerning, tracking e leading']);
  run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, 3, ?, ?)', [cFund, 'Módulo 3: Composição, Grid e Gestalt', 'Leis da Gestalt, regra dos terços, grids modulares e equilíbrio visual']);
  run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, 4, ?, ?)', [cFund, 'Módulo 4: Branding e Identidade Visual', 'Briefing, construção de manual de marca e aplicações práticas']);

  // Photoshop (16 Módulos completos)
  const psModules = [
    'Módulo 1: Interface, Espaço de Trabalho e Resolução',
    'Módulo 2: O Sistema de Camadas e Smart Objects',
    'Módulo 3: Seleções Fundamentais e Geométricas',
    'Módulo 4: Máscaras de Camada Não-Destrutivas',
    'Módulo 5: Tipografia e Efeitos de Camada (Layer Styles)',
    'Módulo 6: Teoria e Ajuste de Cores (Curves, Levels, HSL)',
    'Módulo 7: Tratamento de Imagem e Separação de Frequências',
    'Módulo 8: Seleção Cirúrgica de Cabelos e Objetos Complexos',
    'Módulo 9: Composição e Montagem Fotográfica Realista',
    'Módulo 10: Iluminação, Sombras de Contato e Atmosfera',
    'Módulo 11: Efeitos Visuais, Filtros e Modos de Mesclagem',
    'Módulo 12: Design de Cartazes e Publicidade de Alto Impacto',
    'Módulo 13: Peças Promocionais para Mídias Sociais',
    'Módulo 14: Mockups Profissionais e Apresentação de Portfólio',
    'Módulo 15: Automação, Ações e Otimização de Exportação',
    'Módulo 16: Projeto Final — Campanha Gráfica Completa'
  ];
  for (let i = 0; i < psModules.length; i++) {
    run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, ?, ?, ?)', [
      cPs, i + 1, psModules[i], `Conteúdo técnico aprofundado do ${psModules[i]}`
    ]);
  }

  // Illustrator
  run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, 1, ?, ?)', [cAi, 'Módulo 1: Fundamentos Vetoriais e a Caneta (Pen Tool)', 'Nós de ancoragem, tangentes de direção, precisão e atalhos']);
  run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, 2, ?, ?)', [cAi, 'Módulo 2: Pathfinder, Shape Builder e Geometria', 'Operações booleanas, fusão e simplificação de formas complexas']);
  run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, 3, ?, ?)', [cAi, 'Módulo 3: Construção de Logotipos com Grids', 'Grid de precisão geométrica, proporção áurea e manual de aplicação']);
  run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, 4, ?, ?)', [cAi, 'Módulo 4: Ilustração Vetorial e Padrões (Patterns)', 'Cores globais, gradientes e texturas escaláveis']);

  // CorelDRAW
  run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, 1, ?, ?)', [cCorel, 'Módulo 1: Ferramentas de Desenho e Edição de Nós Bézier', 'Manipulação precisa de curvas, nós simétricos e cúspides']);
  run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, 2, ?, ?)', [cCorel, 'Módulo 2: Tipografia Editorial e Diagramação Comercial', 'Caixas de texto vinculadas, colunas e estilos de parágrafo']);
  run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, 3, ?, ?)', [cCorel, 'Módulo 3: Pré-Impressão, Fechamento de Arquivo e Sangria', 'Perfis ICC, canais CMYK, linhas de corte e exportação PDF/X-1a']);

  // After Effects
  run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, 1, ?, ?)', [cAe, 'Módulo 1: Interface, Composições e a Linha do Tempo', 'Frame rates, resoluções, FPS e organização de projeto']);
  run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, 2, ?, ?)', [cAe, 'Módulo 2: Keyframes, Graph Editor e Curvas de Velocidade', 'Easy Ease, antecipação, interpolação e aceleração orgânica']);
  run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, 3, ?, ?)', [cAe, 'Módulo 3: Shape Layers, Modificadores e Texto Cinético', 'Trim Paths, repetição de formas, wiggle e tipografia em movimento']);
  run('INSERT INTO modules (curso_id, ordem, titulo, descricao) VALUES (?, 4, ?, ?)', [cAe, 'Módulo 4: Rotoscopia, Chroma Key e Render Profissional', 'Track de câmera, remoção de fundo e codecs de entrega']);

  console.log('4. Inserindo Grade Completa de Aulas no Template Fixo de 12 Tópicos...');

  // Módulos IDs
  const modFund1 = get("SELECT id FROM modules WHERE curso_id = ? AND ordem = 1", [cFund]).id;
  const modFund2 = get("SELECT id FROM modules WHERE curso_id = ? AND ordem = 2", [cFund]).id;
  const modPs1 = get("SELECT id FROM modules WHERE curso_id = ? AND ordem = 1", [cPs]).id;
  const modPs2 = get("SELECT id FROM modules WHERE curso_id = ? AND ordem = 2", [cPs]).id;
  const modPs4 = get("SELECT id FROM modules WHERE curso_id = ? AND ordem = 4", [cPs]).id;
  const modPs7 = get("SELECT id FROM modules WHERE curso_id = ? AND ordem = 7", [cPs]).id;
  const modPs10 = get("SELECT id FROM modules WHERE curso_id = ? AND ordem = 10", [cPs]).id;
  const modAi1 = get("SELECT id FROM modules WHERE curso_id = ? AND ordem = 1", [cAi]).id;
  const modAi2 = get("SELECT id FROM modules WHERE curso_id = ? AND ordem = 2", [cAi]).id;
  const modCorel1 = get("SELECT id FROM modules WHERE curso_id = ? AND ordem = 1", [cCorel]).id;
  const modCorel3 = get("SELECT id FROM modules WHERE curso_id = ? AND ordem = 3", [cCorel]).id;
  const modAe1 = get("SELECT id FROM modules WHERE curso_id = ? AND ordem = 1", [cAe]).id;
  const modAe2 = get("SELECT id FROM modules WHERE curso_id = ? AND ordem = 2", [cAe]).id;

  // Função auxiliar para inserir aula com seus 12 tópicos
  function addLesson(modId, ordem, titulo, duracao, obj, conc, ferr, expl, passo, dica, erros, concl, prox, videoUrl, matDownload) {
    run(`INSERT INTO lessons (
      modulo_id, ordem, titulo, duracao_minutos,
      video_url, materiais_download, imagem_ilustrativa,
      objetivo, conceito, ferramentas, explicacao,
      passo_a_passo, dica_profissional, erros_comuns,
      conclusao, proxima_aula
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
      modId, ordem, titulo, duracao,
      videoUrl || 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      matDownload || 'https://escola.design/materiais/aula-pack.zip',
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600',
      obj, conc, ferr, expl, passo, dica, erros, concl, prox
    ]);
    return get('SELECT last_insert_rowid() AS id').id;
  }

  // --- AULAS PHOTOSHOP ---
  const aulaPs1_1 = addLesson(
    modPs1, 1,
    'Aula 1: Anatomia da Interface e Configuração de Documentos', 25,
    'Compreender a estrutura de trabalho do Photoshop, definir perfis de cores e criar telas otimizadas para digital e impressão.',
    'Resolução, Densidade de Pixels (PPI/DPI) e Espaços de Cores (sRGB vs Adobe RGB vs CMYK).',
    'Janela Novo Documento (Ctrl+N), Barra de Menus, Barra de Opções e Painéis Laterais.',
    'O Photoshop opera em mapa de bits (raster). Configurar o documento corretamente desde o início evita interpolação destrutiva e distorção de qualidade.',
    '1. Abra o Photoshop e pressione Ctrl+N.\n2. Escolha o preset "Web Mais Comum" ou defina 1920x1080px com 72 PPI para web.\n3. Para impressão gráfica, defina 300 PPI com perfil de cores CMYK Fogra39 ou Coated GRACol.\n4. Organize sua área de trabalho em Janela > Espaço de Trabalho > Fotografia ou Design Gráfico.',
    'Sempre salve seu próprio espaço de trabalho personalizado ("Workspace") para recuperar painéis fechados por acidente com apenas um clique.',
    'Criar documentos para impressão em 72 DPI ou trabalhar diretamente em CMYK sem calibrar o monitor, resultando em cores lavadas.',
    'Dominar a interface é o alicerce para trabalhar com velocidade e sem interrupções técnicas.',
    'Aula 2: Navegação Ágil, Réguas, Guias e Snapping Inteligente.'
  );

  const aulaPs1_2 = addLesson(
    modPs1, 2,
    'Aula 2: Navegação Ágil, Réguas, Guias e Snapping Inteligente', 20,
    'Dominar a navegação fluida em grandes arquivos através de atalhos e posicionamento milimétrico com guias.',
    'Coordenadas Cartesianas (X/Y), Magnético (Snap to Guides) e Margens de Sangria.',
    'Mão (Barra de Espaço), Zoom Scrubby (Z), Réguas (Ctrl+R), Bloquear Guias (Alt+Ctrl+;).',
    'O tempo gasto procurando ferramentas na interface atrasa projetos em até 40%. A navegação por teclado é o padrão da indústria.',
    '1. Pressione Ctrl+R para ativar as réguas.\n2. Clique com botão direito na régua para alternar entre Pixels, Centímetros e Milímetros.\n3. Arraste da régua até a tela para criar linhas-guia verticais e horizontais.\n4. Ative Visualizar > Encaixar para que os objetos se alinhem magneticamente às guias.',
    'Pressione Barra de Espaço + Ctrl para zoom in e Barra de Espaço + Alt para zoom out sem trocar de ferramenta ativa.',
    'Trabalhar sem margens de segurança, deixando textos colados nas bordas do arquivo.',
    'Sua área de trabalho agora está limpa, precisa e pronta para produção ágil.',
    'Módulo 2: O Sistema de Camadas (Layers) e Smart Objects.'
  );

  const aulaPs2_1 = addLesson(
    modPs2, 1,
    'Aula 1: A Arquitetura das Camadas e Smart Objects', 30,
    'Compreender o empilhamento não-destrutivo de camadas e a preservação matemática de dados através de Objetos Inteligentes.',
    'Hierarquia Visual em Camadas, Objeto Inteligente (Smart Object) e Modos de Mesclagem (Blending Modes).',
    'Painel Camadas (F7), Criar Grupo (Ctrl+G), Converter em Objeto Inteligente, Travar Camada, Opacidade vs Preenchimento.',
    'Trabalhar de forma não-destrutiva é o marco que separa amadores de profissionais: se redimensionar uma imagem rasterizada para baixo e depois para cima, ela perde pixels; como Smart Object, mantém o original intacto.',
    '1. Arraste uma foto para o Photoshop.\n2. Clique com botão direito na camada e escolha "Converter em Objeto Inteligente".\n3. Reduza a escala para 10% com Ctrl+T e confirme.\n4. Pressione Ctrl+T novamente e amplie para 100%: observe que a imagem não sofreu qualquer pixelização.\n5. Crie um grupo de camadas nomeado "BACKGROUND" e organize seus elementos.',
    'Use o atalho Alt + Colchetes [ ou ] para navegar rapidamente entre camadas sem tirar as mãos do teclado.',
    'Trabalhar na camada "Plano de Fundo" travada, não nomear camadas em projetos complexos e rasterizar camadas desnecessariamente.',
    'Camadas bem estruturadas garantem escalabilidade e facilidade de alteração perante pedidos de clientes.',
    'Aula 2: Modos de Mesclagem Essenciais — Multiplicação, Divisão e Sobreposição.'
  );

  const aulaPs4_1 = addLesson(
    modPs4, 1,
    'Aula 1: O Poder das Máscaras de Camada (Layer Masks)', 35,
    'Aprender a ocultar e revelar partes de uma imagem com precisão cirúrgica sem nunca usar a ferramenta Borracha.',
    'Visibilidade em Escala de Cinza: Branco revela, Preto oculta, Cinza gera transparência parcial.',
    'Botão Adicionar Máscara de Camada, Pincel (B), Tecla X (inverter cores frontal/fundo), Tecla D (cores padrão preto e branco).',
    'A borracha é destrutiva porque apaga os pixels de forma permanente. As máscaras de camada apenas controlam a opacidade através de um canal alfa acoplado à camada.',
    '1. Selecione a camada desejada.\n2. Clique no ícone de retângulo com círculo na base do painel Camadas.\n3. Pressione a tecla D para redefinir as cores para Preto e Branco.\n4. Selecione o Pincel (B) com dureza de 0% ou 50%.\n5. Pinte de preto na tela sobre as partes que deseja ocultar.\n6. Pressione a tecla X para pintar de branco e restaurar as partes ocultas a qualquer momento.',
    'Pressione Alt + clique sobre a miniatura da máscara no painel de camadas para visualizar exclusivamente a máscara em tela cheia e checar falhas.',
    'Usar a ferramenta Borracha (E), pintar diretamente na miniatura da imagem em vez de clicar na miniatura da máscara, e esquecer a dureza do pincel.',
    'Com máscaras de camada, qualquer corte ou manipulação é 100% reversível e editável em nível profissional.',
    'Aula 2: Seleção e Refinamento de Cabelos com Selecionar e Mascarar (Select and Mask).'
  );

  const aulaPs7_1 = addLesson(
    modPs7, 1,
    'Aula 1: Separação de Frequências para Tratamento de Pele', 40,
    'Dominar a técnica profissional de Hollywood e editoriais para tratar textura e cor da pele de forma totalmente independente.',
    'Baixa Frequência (Cores, Tons, Sombras) vs Alta Frequência (Textura, Poros, Linhas finas).',
    'Desfoque Gaussiano, Aplicar Imagem (Apply Image), Modo de Mesclagem Luz Linear (Linear Light), Pincel de Recuperação (Healing Brush).',
    'Ao separar a textura das cores, você pode suavizar manchas avermelhadas sem transformar a pele em uma textura plástica artificial.',
    '1. Duplique a foto duas vezes: renomeie a inferior como "BAIXA" e a superior como "ALTA".\n2. Na camada BAIXA, aplique Filtro > Desfoque > Desfoque Gaussiano com raio entre 4px e 8px.\n3. Na camada ALTA, acesse Imagem > Aplicar Imagem: selecione a camada BAIXA, modo Subtrair, Escala 2, Deslocamento 128.\n4. Mude o modo de mesclagem da camada ALTA para Luz Linear.\n5. Use a ferramenta Pincel de Recuperação na camada ALTA para remover cravos e espinhas mantendo a textura original.',
    'Nunca use o Pincel de Recuperação na camada BAIXA; trabalhe com o Pincel Padrão com fluxo de 2% para transições de cor na camada BAIXA.',
    'Aplicar desfoque excessivo eliminando os poros, resultando em uma pele falsa de porcelana.',
    'A separação de frequências é o padrão ouro de publicidade de beleza em revistas de moda.',
    'Módulo 10: Iluminação, Sombras de Contato e Atmosfera.'
  );

  const aulaPs10_1 = addLesson(
    modPs10, 1,
    'Aula 1: Sombras de Contato, Oclusão Ambiental e Cast Shadows', 35,
    'Criar a tridimensionalidade de qualquer recorte através da física realista de luz e sombra.',
    'Sombra de Contato (escura e nítida), Oclusão (área onde a luz não entra) e Sombra Projetada (desvanecida e difusa).',
    'Pincel Redondo Suave (0% de dureza), Modo de Mesclagem Multiplicação (Multiply), Curvas de Ajuste e Níveis.',
    'Um objeto parece "flutuando" não por causa do recorte, mas porque a física da sombra está ausente. Cada fonte de luz gera 3 níveis distintos de sombreamento.',
    '1. Crie uma camada abaixo do objeto e configure-a em Multiplicação com opacidade em 80%.\n2. Com um pincel preto achatado de 1px a 3px, pinte exatamente a linha de toque com o chão (Sombra de Contato).\n3. Crie uma segunda camada para a sombra projetada, aplicando Desfoque Gaussiano de 15px com opacidade em 40%.\n4. Ajuste a cor da sombra para que absorva a tonalidade ambiente da cena (nunca use preto puro 100%).',
    'Use o conta-gotas na parte mais escura do chão da cena para capturar a cor da sombra real em vez de usar preto absoluto (#000000).',
    'Criar apenas uma mancha cinza redonda embaixo do produto, ignorando a sombra de contato milimétrica.',
    'Com sombras físicas coerentes, qualquer fotomontagem ganha realismo instantâneo de estúdio.',
    'Módulo 12: Design de Cartazes e Publicidade de Alto Impacto.'
  );

  // --- AULAS ILLUSTRATOR ---
  const aulaAi1_1 = addLesson(
    modAi1, 1,
    'Aula 1: A Arte e a Geometria da Pen Tool', 40,
    'Conquistar controle absoluto sobre nós de ancoragem, tangentes de direção e criação de curvas suaves com a mínima quantidade de pontos.',
    'Pontos de Canto (Corner Points), Pontos Suaves (Smooth Points) e Alças Bézier.',
    'Pen Tool (P), Direct Selection Tool (A), Anchor Point Tool (Shift+C).',
    'A Pen Tool não é uma ferramenta de desenho livre, mas sim de escultura de equações matemáticas. Menos pontos de ancoragem significam curvas mais limpas e arquivos mais leves.',
    '1. Selecione a Pen Tool (P).\n2. Clique para criar nós retos; clique e arraste para puxar alças tangentes na direção em que a curva deve avançar.\n3. Mantenha Shift pressionado para travar alças em ângulos de 45° e 90°.\n4. Segure a tecla Alt para quebrar a simetria de uma alça e mudar a direção abruptamente.',
    'Posicione os nós de ancoragem sempre nos "extremos" da forma (pontos mais altos, baixos, esquerdos e direitos), mantendo as alças horizontais ou verticais.',
    'Criar dezenas de nós em uma única curva gerando contornos ondulados e facetados, ou puxar alças excessivamente longas.',
    'A Pen Tool é a chave mestra de qualquer software vetorial profissional no mundo.',
    'Aula 2: Operações Booleanas com Pathfinder e Shape Builder.'
  );

  const aulaAi2_1 = addLesson(
    modAi2, 1,
    'Aula 1: Operações Booleanas com Pathfinder e Shape Builder', 30,
    'Construir formas complexas a partir de primitivas geométricas simples através de união, subtração e interseção.',
    'Geometria Construtiva de Sólidos (CSG), Operações Booleanas e Junção Não-Destrutiva.',
    'Shape Builder Tool (Shift+M), Painel Pathfinder (Shift+Ctrl+F9), Unir (Unite), Menos Frente (Minus Front).',
    'Quase todos os símbolos e logotipos famosos (Apple, Nike, Twitter) foram construídos a partir de círculos e retângulos combinados, e não de desenho à mão livre.',
    '1. Desenhe dois círculos sobrepostos com a ferramenta Elipse (L).\n2. Selecione ambos e pressione Shift+M para ativar o Shape Builder.\n3. Clique e arraste através dos círculos para fundi-los em uma única forma.\n4. Segure Alt e clique em uma área para subtraí-la instantaneamente.',
    'Pressione Alt ao clicar nos botões do Pathfinder para criar uma "Forma Composta" editável, permitindo reposicionar os círculos a qualquer momento.',
    'Deixar pequenos vãos entre círculos gerando artefatos microscópicos no vetor final.',
    'A combinação de primitivas garante que seus logotipos tenham precisão matemática perfeita.',
    'Módulo 3: Construção de Logotipos com Grids.'
  );

  // --- AULAS CORELDRAW ---
  const aulaCorel1_1 = addLesson(
    modCorel1, 1,
    'Aula 1: A Ferramenta Bézier e Manipulação de Nós no CorelDRAW', 35,
    'Dominar o traçado vetorial e o controle de nós simétricos, suaves e cúspides no ambiente do CorelDRAW.',
    'Vetorização Industrial, Nós Cúspides vs Suaves, Fechamento Automático de Curvas.',
    'Ferramenta Bézier, Ferramenta Forma (F10), Barra de Propriedades de Nós, Converter em Curvas (Ctrl+Q).',
    'Na indústria de comunicação visual, estamparia, corte a laser e envelopamento, o CorelDRAW é a ferramenta dominante pela precisão de exportação para plotters de recorte.',
    '1. Selecione a ferramenta Bézier na caixa de ferramentas.\n2. Clique para definir nós; clique e arraste para projetar a curva.\n3. Pressione F10 para alternar para a ferramenta Forma.\n4. Selecione um nó e clique em "Nó Cúspide" para alterar um único lado da curva de forma independente.',
    'Dê duplo clique em uma linha com a ferramenta Forma para criar um nó instantaneamente sem precisar ir à barra de propriedades.',
    'Esquecer de fechar o contorno do vetor, impedindo que o objeto receba preenchimento de cor.',
    'Seus arquivos agora podem ser enviados diretamente para plotters de recorte e fresadoras CNC.',
    'Módulo 3: Pré-Impressão, Fechamento de Arquivo e Sangria.'
  );

  const aulaCorel3_1 = addLesson(
    modCorel3, 1,
    'Aula 1: Sangria, Margem de Segurança e Fechamento em PDF/X-1a', 30,
    'Preparar arquivos para parques gráficos industriais sem risco de cortes brancos, conversão errônea de cores ou fontes ausentes.',
    'Sangria (Bleed), Margem Interna de Segurança, Overprint (Sobreposição) e Preto Puro (K100) vs Preto Rico.',
    'Opções do Documento (Ctrl+J), Visualização de Separação de Cores, Exportar para PDF (Ctrl+E com preset PDF/X-1a).',
    'Se uma guilhotina gráfica oscilar 1 milímetro durante o corte e seu arquivo não possuir sangria, o material sairá com um filete branco imperdoável na borda.',
    '1. Configure o tamanho real da página (ex: Cartão de Visita 90x50mm).\n2. Acesse Layout > Configurações da Página e defina Sangria em 3mm.\n3. Estenda qualquer elemento de fundo colorido até a linha vermelha de sangria.\n4. Mantenha todos os textos a no mínimo 4mm para dentro da linha de corte (margem interna).\n5. Selecione todos os textos e converta em curvas com Ctrl+Q.\n6. Exporte em Arquivo > Publicar em PDF, escolhendo o padrão industrial PDF/X-1a.',
    'Textos pequenos (abaixo de 12pt) devem sempre ser configurados em C:0 M:0 Y:0 K:100% para evitar registro descentralizado nas 4 chapas da impressora offset.',
    'Enviar arquivos em RGB com fotos em 72 DPI, ou usar preto composto (C:100 M:100 Y:100 K:100) em textos.',
    'Seu trabalho agora atende aos mais rigorosos padrões da Associação Brasileira de Tecnologia Gráfica (ABTG).',
    'Projeto Final: Kit de Materiais Gráficos Completos.'
  );

  // --- AULAS AFTER EFFECTS ---
  const aulaAe1_1 = addLesson(
    modAe1, 1,
    'Aula 1: A Linha do Tempo e Estrutura de Composições', 30,
    'Configurar composições profissionais, taxas de quadros (FPS) e a dinâmica de camadas espaciais e temporais.',
    'Frame Rate (24fps Cinema vs 30fps/60fps Telas), Resolução de Prévia, Pixels Quadrados.',
    'Nova Composição (Ctrl+N), Linha do Tempo, Painel Projeto, Controles de Reprodução (Espaço ou 0 no teclado numérico).',
    'O After Effects une o poder das camadas do Photoshop com a dimensão do tempo. Uma composição mal configurada no início pode forçar renderizações desnecessárias de horas.',
    '1. Abra o After Effects e pressione Ctrl+N.\n2. Defina Resolução 1920x1080 (Full HD) ou 1080x1920 (Vertical Reels/TikTok).\n3. Escolha 30 FPS ou 60 FPS com duração de 10 segundos.\n4. Arraste arquivos vetoriais do Illustrator ativando "Manter Tamanho da Camada".',
    'Pressione a tecla U no teclado para revelar apenas as propriedades que possuem keyframes na camada selecionada.',
    'Criar composições com proporção de pixels não-quadrados gerando imagens esticadas ou distorcidas no celular.',
    'A base estrutural de um projeto de Motion Design impecável está pronta.',
    'Módulo 2: Keyframes, Graph Editor e Curvas de Velocidade.'
  );

  const aulaAe2_1 = addLesson(
    modAe2, 1,
    'Aula 1: O Graph Editor e a Magia das Curvas de Velocidade', 35,
    'Substituir movimentos mecânicos e artificiais por animações fluidas, orgânicas e dinâmicas com controle de aceleração.',
    'Interpolação Espacial vs Temporal, Easy Ease (F9), Curvas de Valor e Curvas de Velocidade.',
    'Graph Editor (Shift+F3), Easy Ease (F9), Alças de Influência Bézier, Travar Eixo.',
    'Na física real, nenhum objeto atinge a velocidade máxima instantaneamente: carros aceleram gradualmente e desaceleram suavemente. O Graph Editor traduz as leis da inércia para a tela.',
    '1. Crie uma forma e anime a Posição (P) do ponto A ao ponto B em 1 segundo.\n2. Selecione os dois keyframes e pressione F9 para aplicar Easy Ease.\n3. Clique no ícone do Graph Editor.\n4. Selecione o keyframe final e puxe a alça de influência para 75% ou 85% para criar uma frenagem cinematográfica suave.',
    'Use o atalho Alt + Shift + P/S/R para criar keyframes rápidos de Posição, Escala ou Rotação no ponto exato da agulha.',
    'Deixar movimentos em interpolação linear padrão (sem curvas), resultando em um visual de apresentação amadora.',
    'Seu motion agora possui peso, intenção dramática e ritmo profissional.',
    'Módulo 3: Shape Layers, Modificadores e Texto Cinético.'
  );

  // --- AULAS FUNDAMENTOS ---
  const aulaFund1_1 = addLesson(
    modFund1, 1,
    'Aula 1: Círculo Cromático e Harmonias Estratégicas', 30,
    'Dominar o círculo cromático de Itten, harmonias de cores (complementares, análogas, tríades) e psicologia das cores em marcas.',
    'Matiz (Hue), Saturação (Saturation), Luminosidade (Brightness), Cores Quentes vs Frias.',
    'Adobe Color (Color Wheel), Guia de Cores, Seletor HSB e Paletas Harmonizadas.',
    'A cor transmite emoção antes mesmo que o cérebro processe a forma ou o texto. Compreender proporções e contrastes cromáticos é determinante para uma leitura fluida.',
    '1. Abra a roda de cores e localize sua cor primária dominante (ex.: Azul #1E40AF).\n2. Calcule a cor complementar oposta a 180 graus (ex.: Laranja #F97316) para botões de ação (CTA).\n3. Crie uma paleta com a regra 60-30-10: 60% cor neutra dominante, 30% cor de suporte institucional, 10% cor vibrante de destaque.',
    'Ao desenhar interfaces ou identidades, teste sempre a paleta em tons de cinza primeiro: se a hierarquia funcionar em preto e branco, ela funcionará perfeitamente em cores.',
    'Usar saturação máxima em todas as cores competindo entre si, ignorar o contraste de luminosidade e utilizar mais de 4 cores dominantes sem critério.',
    'Cores bem escolhidas guiam o olho do usuário e aumentam a conversão e memorização de uma marca.',
    'Aula 2: Espaços de Cor — O Guia Definitivo do RGB, CMYK e Escala Pantone.'
  );

  const aulaFund2_1 = addLesson(
    modFund2, 1,
    'Aula 1: Anatomia do Tipo, Kerning, Tracking e Hierarquia Visual', 30,
    'Dominar a escolha de famílias tipográficas, legibilidade em diferentes escalas e contraste de pesos para guiar a leitura.',
    'Serifa vs Não-Serifa, Altura de X, Ascendentes/Descendentes, Kerning óptico e Tracking.',
    'Painel Caractere, Painel Parágrafo, Escala Modular Tipográfica, Teste de Leitura em Distância.',
    'Mais de 90% da informação na internet e no design gráfico é transmitida por meio de texto. Um layout com tipografia impecável se sustenta mesmo sem imagens.',
    '1. Escolha uma família com pelo menos 5 pesos (ex: Light, Regular, Medium, Bold, ExtraBold).\n2. Estabeleça uma escala modular: Título 32px, Subtítulo 20px, Corpo de texto 16px, Legenda 12px.\n3. Ajuste o leading (espaçamento entre linhas) para 130% a 150% do tamanho da fonte.\n4. Ajuste o kerning entre letras maiúsculas para aumentar a sofisticação em títulos.',
    'Nunca combine duas fontes serifadas ou duas fontes sem serifa muito similares; combine uma fonte sem serifa geométrica para títulos com uma com serifa clássica para leitura longa.',
    'Usar texto justificado sem hifenização gerando "rios de espaço em branco" entre as palavras.',
    'A tipografia agora trabalha a favor da clareza e da credibilidade do seu design.',
    'Módulo 3: Composição, Grid e Gestalt.'
  );

  console.log('5. Inserindo Exercícios e Quizzes...');
  // Exercícios
  run("INSERT INTO exercises (aula_id, titulo, enunciado, tipo, solucao_esperada, criterios_avaliacao, materiais_necessarios) VALUES (?, ?, ?, 'pratico', ?, ?, ?)", [
    aulaPs1_1,
    'Exercício Prático: O Espaço de Trabalho Ideal',
    'Crie um documento no Photoshop para uma capa de redes sociais (1080x1350px, 72 PPI, RGB) e organize réguas com margem interna de segurança de 80px em todas as bordas.',
    'Arquivo PSD configurado nas dimensões exatas com 4 linhas-guia (x=80, x=1000, y=80, y=1270).',
    'Dimensões corretas, resolução adequada para web (72 PPI) e guias milimetricamente ajustadas.',
    'Adobe Photoshop e arquivo de template base para redes sociais.'
  ]);
  const exPs1Id = get('SELECT last_insert_rowid() AS id').id;

  run("INSERT INTO exercises (aula_id, titulo, enunciado, tipo, solucao_esperada, criterios_avaliacao, materiais_necessarios) VALUES (?, ?, ?, 'pratico', ?, ?, ?)", [
    aulaPs4_1,
    'Desafio de Recorte Não-Destrutivo com Máscara',
    'Importe uma foto de um produto com fundo complexo, isole o produto utilizando exclusivamente uma Máscara de Camada com pincel preto e branco, preservando bordas suaves sem apagar nenhum pixel.',
    'Camada original intacta preservada com Smart Object e Layer Mask acoplada com transição perfeita.',
    '100% de uso de máscara, zero pixels deletados na camada base, contorno suave sem bordas brancas.',
    'Fotografia de produto em alta resolução e Adobe Photoshop.'
  ]);
  const exPs4Id = get('SELECT last_insert_rowid() AS id').id;

  run("INSERT INTO exercises (aula_id, titulo, enunciado, tipo, solucao_esperada, criterios_avaliacao, materiais_necessarios) VALUES (?, ?, ?, 'teorico', ?, ?, ?)", [
    aulaFund1_1,
    'Aplicação da Regra 60-30-10 em Cartaz',
    'Desenvolva o esquema de cores para um festival de música aplicando a proporção harmônica 60-30-10 entre fundo neutro, cor de marca e cor de contraste para informações críticas.',
    'Especificação em códigos hexadecimais de 3 cores com cálculo de contraste WCAG AA.',
    'Harmonia cromática consistente, legibilidade e conformidade com a proporção áurea de cores.',
    'Adobe Color e tabela de códigos hexadecimais.'
  ]);
  const exFund1Id = get('SELECT last_insert_rowid() AS id').id;

  // Quizzes
  run('INSERT INTO quizzes (aula_id, curso_id, titulo, nota_minima) VALUES (?, ?, ?, 70.0)', [
    aulaPs1_1, cPs, 'Avaliação de Fixação: Interface e Resolução'
  ]);
  const qzPs1Id = get('SELECT last_insert_rowid() AS id').id;

  run('INSERT INTO questions (quiz_id, ordem, enunciado, explicacao) VALUES (?, 1, ?, ?)', [
    qzPs1Id,
    'Qual é a resolução padrão recomendada em PPI para imagens destinadas exclusivamente a mídias digitais e redes sociais?',
    'Para dispositivos de tela (monitores, celulares), a densidade padrão histórica é 72 PPI (pixels por polegada), enquanto para impressão comercial de alta resolução o padrão é 300 DPI.'
  ]);
  const q1Id = get('SELECT last_insert_rowid() AS id').id;
  run('INSERT INTO answers (question_id, texto, correta, ordem) VALUES (?, ?, 0, 1)', [q1Id, '300 PPI']);
  run('INSERT INTO answers (question_id, texto, correta, ordem) VALUES (?, ?, 1, 2)', [q1Id, '72 PPI']);
  run('INSERT INTO answers (question_id, texto, correta, ordem) VALUES (?, ?, 0, 3)', [q1Id, '1200 PPI']);
  run('INSERT INTO answers (question_id, texto, correta, ordem) VALUES (?, ?, 0, 4)', [q1Id, '150 PPI']);

  run('INSERT INTO questions (quiz_id, ordem, enunciado, explicacao) VALUES (?, 2, ?, ?)', [
    qzPs1Id,
    'Por que converter uma camada em Objeto Inteligente (Smart Object) é considerado essencial no fluxo profissional?',
    'Smart Objects protegem o arquivo-fonte original com suas dimensões e dados vetoriais/raster intactos dentro de um contêiner matemático, permitindo redimensionamentos sucessivos sem perda de nitidez.'
  ]);
  const q2Id = get('SELECT last_insert_rowid() AS id').id;
  run('INSERT INTO answers (question_id, texto, correta, ordem) VALUES (?, ?, 0, 1)', [q2Id, 'Porque reduz o tamanho do arquivo no disco em até 80%']);
  run('INSERT INTO answers (question_id, texto, correta, ordem) VALUES (?, ?, 1, 2)', [q2Id, 'Porque preserva os dados originais da imagem permitindo transformações não-destrutivas']);
  run('INSERT INTO answers (question_id, texto, correta, ordem) VALUES (?, ?, 0, 3)', [q2Id, 'Porque aplica automaticamente correção de cor e contraste']);
  run('INSERT INTO answers (question_id, texto, correta, ordem) VALUES (?, ?, 0, 4)', [q2Id, 'Porque impede que outros usuários abram a imagem']);

  // Quiz Máscaras
  run('INSERT INTO quizzes (aula_id, curso_id, titulo, nota_minima) VALUES (?, ?, ?, 70.0)', [
    aulaPs4_1, cPs, 'Avaliação de Fixação: Máscaras de Camada'
  ]);
  const qzPs4Id = get('SELECT last_insert_rowid() AS id').id;

  run('INSERT INTO questions (quiz_id, ordem, enunciado, explicacao) VALUES (?, 1, ?, ?)', [
    qzPs4Id,
    'Ao pintar sobre uma máscara de camada (Layer Mask), o que a cor PRETA faz?',
    'Nas máscaras de camada vigora a regra universal: o Branco REVELA a camada, o Preto OCULTA (torna transparente) e os tons de Cinza criam transparências parciais.'
  ]);
  const q3Id = get('SELECT last_insert_rowid() AS id').id;
  run('INSERT INTO answers (question_id, texto, correta, ordem) VALUES (?, ?, 1, 1)', [q3Id, 'Torna os pixels correspondentes totalmente transparentes (oculta)']);
  run('INSERT INTO answers (question_id, texto, correta, ordem) VALUES (?, ?, 0, 2)', [q3Id, 'Pinta a foto de preto sólido']);
  run('INSERT INTO answers (question_id, texto, correta, ordem) VALUES (?, ?, 0, 3)', [q3Id, 'Apaga permanentemente os dados do disco rígido']);
  run('INSERT INTO answers (question_id, texto, correta, ordem) VALUES (?, ?, 0, 4)', [q3Id, 'Inverte a luminosidade da imagem']);

  console.log('6. Inserindo Projetos Práticos de Conclusão...');
  run(`INSERT INTO projects (curso_id, nome, categoria, descricao, imagem_url, requisitos, criterios_aprovacao) VALUES (
    ?,
    'Campanha Publicitária de Lançamento de Produto',
    'Publicidade & Manipulação',
    'Desenvolver um cartaz promocional e 3 desdobramentos para mídias sociais (Story, Feed e Banner) utilizando manipulação com iluminação realista, recorte perfeito e tipografia hierárquica.',
    'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=600',
    '1. Mínimo de 3 imagens combinadas em composição harmônica.\n2. Sombras de contato e oclusão desenhadas manualmente.\n3. Ajustes de cor globais com Curves e Color Lookup.\n4. Projeto salvo em PSD em camadas organizadas.',
    'Recorte limpo sem halos, consistência de direção de luz, hierarquia de leitura clara e aplicação não-destrutiva de efeitos.'
  )`, [cPs]);

  run(`INSERT INTO projects (curso_id, nome, categoria, descricao, imagem_url, requisitos, criterios_aprovacao) VALUES (
    ?,
    'Sistema de Identidade Visual Completo',
    'Branding & Vetor',
    'Criação de logotipo vetorial, símbolo, paleta cromática, manual de proporções em grid e mockups de aplicação em papelaria comercial.',
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600',
    '1. Logotipo construído em curvas limpas no Illustrator.\n2. Versões positiva, negativa e monocromática.\n3. Grid de construção e área de reserva.',
    'Escalabilidade técnica sem defeitos vetoriais, proporções áureas coerentes e apresentação profissional.'
  )`, [cAi]);

  run(`INSERT INTO projects (curso_id, nome, categoria, descricao, imagem_url, requisitos, criterios_aprovacao) VALUES (
    ?,
    'Manual de Teoria Visual Aplicada a uma Marca',
    'Design Teórico & Estrutural',
    'Documento em PDF com análise de psicologia das cores, estudo de tipografia combinada e testes de contraste visual para uma empresa de tecnologia sustentável.',
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600',
    'Relatório detalhado justificando cada decisão de design com base nos princípios de Gestalt e harmonia cromática.',
    'Profundidade técnica dos argumentos, aplicação correta da regra 60-30-10 e conformidade de contraste.'
  )`, [cFund]);

  console.log('7. Inicializando os Registros de Progresso Real para os 3 Alunos (Seção 31)...');
  const userLucas = get("SELECT id FROM users WHERE login = 'lucas@escola.design'").id;
  const userMariana = get("SELECT id FROM users WHERE login = 'mariana@escola.design'").id;
  const userRodrigo = get("SELECT id FROM users WHERE login = 'rodrigo@escola.design'").id;

  // Atualizar a última aula acessada de Lucas (Continuação Automática da Seção 8)
  run('UPDATE users SET ultima_aula_id = ? WHERE id = ?', [aulaPs4_1, userLucas]);
  run('UPDATE users SET ultima_aula_id = ? WHERE id = ?', [aulaAi1_1, userMariana]);
  run('UPDATE users SET ultima_aula_id = ? WHERE id = ?', [aulaCorel3_1, userRodrigo]);

  // Lucas concluiu algumas aulas
  run('INSERT INTO user_lesson_progress (user_id, lesson_id, curso_id, concluida, data_conclusao) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)', [userLucas, aulaFund1_1, cFund]);
  run('INSERT INTO user_lesson_progress (user_id, lesson_id, curso_id, concluida, data_conclusao) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)', [userLucas, aulaPs1_1, cPs]);
  run('INSERT INTO user_lesson_progress (user_id, lesson_id, curso_id, concluida, data_conclusao) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)', [userLucas, aulaPs1_2, cPs]);
  run('INSERT INTO user_lesson_progress (user_id, lesson_id, curso_id, concluida, data_conclusao) VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)', [userLucas, aulaPs2_1, cPs]);

  run('INSERT INTO user_exercise_progress (user_id, exercise_id, curso_id, concluido, resposta_aluno, data_conclusao) VALUES (?, ?, ?, 1, ?, CURRENT_TIMESTAMP)', [
    userLucas, exFund1Id, cFund, 'Paleta desenvolvida com #0F172A (60%), #3B82F6 (30%) e #F59E0B (10%) para os botões.'
  ]);
  run('INSERT INTO user_exercise_progress (user_id, exercise_id, curso_id, concluido, resposta_aluno, data_conclusao) VALUES (?, ?, ?, 1, ?, CURRENT_TIMESTAMP)', [
    userLucas, exPs1Id, cPs, 'Arquivo criado com réguas em 80px e 1080x1350px exportado para validação.'
  ]);
  run('INSERT INTO user_quiz_attempts (user_id, quiz_id, nota, total_questoes, acertos, aprovado, detalhes_respostas) VALUES (?, ?, 100.0, 2, 2, 1, ?)', [
    userLucas, qzPs1Id, 'Respondeu 72 PPI e Preservação não-destrutiva'
  ]);

  // Recalcular course_progress para os 3 alunos
  run(`INSERT INTO course_progress (
    user_id, curso_id, percentual_calculado, aulas_concluidas, total_aulas,
    exercicios_concluidos, total_exercicios, quizzes_aprovados, total_quizzes,
    projetos_concluidos, total_projetos, horas_estudadas, ultima_aula_id, ultimo_acesso
  ) VALUES (?, ?, 80.0, 1, 2, 1, 1, 0, 0, 0, 1, 14.5, ?, CURRENT_TIMESTAMP)`, [userLucas, cFund, aulaFund1_1]);

  run(`INSERT INTO course_progress (
    user_id, curso_id, percentual_calculado, aulas_concluidas, total_aulas,
    exercicios_concluidos, total_exercicios, quizzes_aprovados, total_quizzes,
    projetos_concluidos, total_projetos, horas_estudadas, ultima_aula_id, ultimo_acesso
  ) VALUES (?, ?, 68.0, 3, 6, 1, 2, 1, 2, 0, 1, 22.0, ?, CURRENT_TIMESTAMP)`, [userLucas, cPs, aulaPs4_1]);

  run(`INSERT INTO course_progress (
    user_id, curso_id, percentual_calculado, aulas_concluidas, total_aulas,
    exercicios_concluidos, total_exercicios, quizzes_aprovados, total_quizzes,
    projetos_concluidos, total_projetos, horas_estudadas, ultima_aula_id, ultimo_acesso
  ) VALUES (?, ?, 62.0, 1, 2, 0, 0, 0, 0, 0, 1, 16.2, ?, CURRENT_TIMESTAMP)`, [userLucas, cAi, aulaAi1_1]);

  run(`INSERT INTO course_progress (
    user_id, curso_id, percentual_calculado, aulas_concluidas, total_aulas,
    exercicios_concluidos, total_exercicios, quizzes_aprovados, total_quizzes,
    projetos_concluidos, total_projetos, horas_estudadas, ultima_aula_id, ultimo_acesso
  ) VALUES (?, ?, 45.0, 1, 2, 0, 0, 0, 0, 0, 1, 9.5, ?, CURRENT_TIMESTAMP)`, [userLucas, cAe, aulaAe1_1]);

  run(`INSERT INTO course_progress (
    user_id, curso_id, percentual_calculado, aulas_concluidas, total_aulas,
    exercicios_concluidos, total_exercicios, quizzes_aprovados, total_quizzes,
    projetos_concluidos, total_projetos, horas_estudadas, ultima_aula_id, ultimo_acesso
  ) VALUES (?, ?, 31.0, 0, 2, 0, 0, 0, 0, 0, 1, 4.0, ?, CURRENT_TIMESTAMP)`, [userLucas, cCorel, aulaCorel1_1]);

  // Mariana Costa (Aluno 2)
  run(`INSERT INTO course_progress (user_id, curso_id, percentual_calculado, aulas_concluidas, total_aulas, horas_estudadas, ultimo_acesso)
       VALUES (?, ?, 55.0, 2, 6, 18.0, CURRENT_TIMESTAMP)`, [userMariana, cPs]);
  run(`INSERT INTO course_progress (user_id, curso_id, percentual_calculado, aulas_concluidas, total_aulas, horas_estudadas, ultimo_acesso)
       VALUES (?, ?, 71.0, 2, 2, 24.5, CURRENT_TIMESTAMP)`, [userMariana, cAi]);
  run(`INSERT INTO course_progress (user_id, curso_id, percentual_calculado, aulas_concluidas, total_aulas, horas_estudadas, ultimo_acesso)
       VALUES (?, ?, 28.0, 1, 2, 6.0, CURRENT_TIMESTAMP)`, [userMariana, cAe]);
  run(`INSERT INTO course_progress (user_id, curso_id, percentual_calculado, aulas_concluidas, total_aulas, horas_estudadas, ultimo_acesso)
       VALUES (?, ?, 44.0, 1, 2, 12.0, CURRENT_TIMESTAMP)`, [userMariana, cCorel]);

  // Rodrigo Alves (Aluno 3)
  run(`INSERT INTO course_progress (user_id, curso_id, percentual_calculado, aulas_concluidas, total_aulas, horas_estudadas, ultimo_acesso)
       VALUES (?, ?, 40.0, 1, 6, 11.0, CURRENT_TIMESTAMP)`, [userRodrigo, cPs]);
  run(`INSERT INTO course_progress (user_id, curso_id, percentual_calculado, aulas_concluidas, total_aulas, horas_estudadas, ultimo_acesso)
       VALUES (?, ?, 38.0, 1, 2, 10.0, CURRENT_TIMESTAMP)`, [userRodrigo, cAi]);
  run(`INSERT INTO course_progress (user_id, curso_id, percentual_calculado, aulas_concluidas, total_aulas, horas_estudadas, ultimo_acesso)
       VALUES (?, ?, 62.0, 2, 2, 20.0, CURRENT_TIMESTAMP)`, [userRodrigo, cAe]);
  run(`INSERT INTO course_progress (user_id, curso_id, percentual_calculado, aulas_concluidas, total_aulas, horas_estudadas, ultimo_acesso)
       VALUES (?, ?, 20.0, 1, 2, 5.0, CURRENT_TIMESTAMP)`, [userRodrigo, cCorel]);

  console.log('8. Inserindo Itens de Portfólio dos Alunos...');
  const projPsId = get("SELECT id FROM projects WHERE curso_id = ?", [cPs]).id;
  run(`INSERT INTO user_projects (
    user_id, project_id, curso_id, titulo, descricao, imagem_url, status, feedback_admin, nota, data_envio, data_aprovacao
  ) VALUES (?, ?, ?, ?, ?, ?, 'aprovado', ?, 95.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`, [
    userLucas,
    projPsId,
    cPs,
    'Campanha Cyberpunk para Bebida Energética',
    'Composição realista no Photoshop combinando modelos 3D, neon com iluminação refletida no piso e máscaras de corte refinadas.',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
    'Excelente equilíbrio entre a temperatura de cor dos neons e a sombra de contato da lata. Aprovado com louvor.'
  ]);

  console.log('9. Inserindo Histórico de Atividades Real (Seção 29)...');
  run("INSERT INTO user_history (user_id, tipo, titulo, descricao, curso_id, aula_id) VALUES (?, 'aula_concluida', 'Aula Concluída', 'Photoshop — Aula 1: A Arquitetura das Camadas e Smart Objects', ?, ?)", [userLucas, cPs, aulaPs2_1]);
  run("INSERT INTO user_history (user_id, tipo, titulo, descricao, curso_id, aula_id) VALUES (?, 'exercicio_entregue', 'Exercício Prático Concluído', 'Exercício Prático: O Espaço de Trabalho Ideal (Aprovado)', ?, ?)", [userLucas, cPs, aulaPs1_1]);
  run("INSERT INTO user_history (user_id, tipo, titulo, descricao, curso_id, aula_id) VALUES (?, 'quiz_realizado', 'Quiz Realizado', 'Avaliação de Fixação: Interface e Resolução — Nota: 100%', ?, ?)", [userLucas, cPs, aulaPs1_1]);
  run("INSERT INTO user_history (user_id, tipo, titulo, descricao, curso_id, aula_id) VALUES (?, 'projeto_enviado', 'Projeto Aprovado', 'Campanha Cyberpunk para Bebida Energética (Portfólio)', ?, NULL)", [userLucas, cPs]);

  console.log('10. Inserindo Notificações do Sistema (Seção 33)...');
  run("INSERT INTO notifications (user_id, titulo, mensagem, tipo, link) VALUES (?, '🎓 Módulo Concluído!', 'Você concluiu todas as aulas do Módulo 1 de Fundamentos do Design.', 'success', 'curso-detalhe')", [userLucas]);
  run("INSERT INTO notifications (user_id, titulo, mensagem, tipo, link) VALUES (?, '💡 Recomendação de Estudo', 'Que tal praticar agora o Desafio de Recorte Não-Destrutivo com Máscara?', 'info', 'aula-player')", [userLucas]);
  run("INSERT INTO notifications (user_id, titulo, mensagem, tipo, link) VALUES (?, '🔄 Atualização de Software', 'Photoshop 2026 recebeu novos recursos neurais de seleção de cabelo.', 'warning', 'conhecimento')", [userLucas]);

  console.log('11. Inserindo Itens do Sistema de Revisão (Seção 23)...');
  run("INSERT INTO review_items (user_id, aula_id, curso_id, classificacao) VALUES (?, ?, ?, 'revisar')", [userLucas, aulaPs4_1, cPs]);
  run("INSERT INTO review_items (user_id, aula_id, curso_id, classificacao) VALUES (?, ?, ?, 'importante')", [userLucas, aulaPs7_1, cPs]);
  run("INSERT INTO review_items (user_id, aula_id, curso_id, classificacao) VALUES (?, ?, ?, 'dificil')", [userLucas, aulaPs10_1, cPs]);

  console.log('12. Inserindo Central de Conhecimento com Fontes Oficiais...');
  const knowledgeItems = [
    {
      titulo: 'Guia Oficial de Máscaras e Modos de Mesclagem',
      fonte: 'Adobe Help Center — Photoshop Documentation',
      url: 'https://helpx.adobe.com/br/photoshop/using/layer-masks.html',
      autor: 'Adobe Technical Communications Team',
      data: '2026-01-15',
      software: 'Photoshop',
      versao: '2026 (v27.x)',
      categoria: 'Camadas e Máscaras',
      tags: 'máscaras, camadas, não-destrutivo, blending modes, opacidade',
      tipo_fonte: 'oficial',
      conteudo_resumo: 'As máscaras de camada são bitmaps em tons de cinza que determinam como as áreas da camada são exibidas ou ocultadas. O preto oculta, o branco revela e os cinzas intermediários conferem translucidez sem alterar o arquivo original.',
      passo_a_passo: '1. Selecione a camada e clique em "Adicionar Máscara".\n2. Escolha o Pincel suave.\n3. Pinte com preto (#000000) para ocultar e branco (#FFFFFF) para revelar.',
      erros_comuns: 'Pintar na imagem em vez da máscara; esquecer de checar se a cor primária é realmente preto absoluto.',
      exercicio: 'Recorte uma xícara de café com fumaça usando máscara suave e modo de mesclagem Divisão (Screen).'
    },
    {
      titulo: 'Boas Práticas de Fechamento de Arquivo para Impressão Gráfica',
      fonte: 'ABIGRAF & Adobe Print Production Guide',
      url: 'https://helpx.adobe.com/br/indesign/using/preparing-files-for-service-provider.html',
      autor: 'Comitê Técnico de Pré-Impressão',
      data: '2025-11-20',
      software: 'CorelDRAW',
      versao: 'Universal',
      categoria: 'Pré-Impressão e Gráfica',
      tags: 'cmyk, sangria, marcas de corte, faca especial, overprint, trapping',
      tipo_fonte: 'tecnica',
      conteudo_resumo: 'Para evitar filetes brancos e cortes erráticos na guilhotina, todo impresso com fundo colorido precisa de no mínimo 3mm a 5mm de sangria externa, além de 5mm de margem interna de segurança para elementos de texto.',
      passo_a_passo: '1. Configure a página com tamanho final do material.\n2. Ative a sangria de 3mm no documento.\n3. Estenda fotos e fundos coloridos até a borda externa da linha de sangria.\n4. Converta textos em curvas e exporte em PDF/X-1a.',
      erros_comuns: 'Deixar textos colados na linha de corte; enviar arquivos com imagens em RGB; usar preto composto (400% de tinta) em textos pequenos.',
      exercicio: 'Feche um panfleto 10x15cm em PDF/X-1a com sangria de 3mm e verifique no Adobe Acrobat a separação de chapas CMYK.'
    },
    {
      titulo: 'Compreendendo o Graph Editor e as Curvas de Velocidade no After Effects',
      fonte: 'School of Motion & Adobe AE User Guide',
      url: 'https://helpx.adobe.com/br/after-effects/using/speed.html',
      autor: 'Motion Design Association',
      data: '2026-02-10',
      software: 'After Effects',
      versao: '2026 (v25.x)',
      categoria: 'Motion Graphics',
      tags: 'graph editor, keyframes, interpolação, easy ease, velocidade, curvas',
      tipo_fonte: 'tecnica',
      conteudo_resumo: 'O olho humano não percebe movimentos mecânicos como naturais. O Graph Editor permite manipular a aceleração e desaceleração (easing) de qualquer propriedade espacial ou temporal, transformando movimentos lineares em animações orgânicas.',
      passo_a_passo: '1. Selecione dois keyframes e pressione F9 (Easy Ease).\n2. Clique no ícone do Graph Editor.\n3. Puxe as alças de influência para acentuar a curva de saída e chegada.\n4. Visualize a reprodução com espaço (RAM Preview).',
      erros_comuns: 'Deixar animações em interpolação linear padrão; exagerar na curvatura tornando o movimento espasmódico.',
      exercicio: 'Anime um círculo cruzando a tela com saída explosiva e frenagem gradual usando influência de 80% na curva.'
    }
  ];

  for (const k of knowledgeItems) {
    run(`INSERT INTO knowledge (
      titulo, fonte, url, autor, data_publicacao, software, versao, categoria, tags,
      conteudo_resumo, passo_a_passo, erros_comuns, exercicio_proposto, tipo_fonte, curado_admin
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`, [
      k.titulo, k.fonte, k.url, k.autor, k.data, k.software, k.versao, k.categoria, k.tags,
      k.conteudo_resumo, k.passo_a_passo, k.erros_comuns, k.exercicio, k.tipo_fonte
    ]);
  }

  console.log('13. Inserindo Registro de Atualizações de Software...');
  run(`INSERT INTO software_updates (software, versao, data_lancamento, mudancas, aulas_afetadas, status_revisao) VALUES (
    'Photoshop', '2026 (v27.0)', '2026-01-10',
    'Novo motor de seleção por IA com detecção de transparências em vidro e cabelos finos; melhoria nos filtros neurais de iluminação.',
    'Módulo 4: Máscaras; Módulo 8: Recorte Cirúrgico',
    'atualizado'
  )`);
  run(`INSERT INTO software_updates (software, versao, data_lancamento, mudancas, aulas_afetadas, status_revisao) VALUES (
    'Illustrator', '2026 (v30.0)', '2026-02-01',
    'Geração paramétrica de padrões vetoriais e novo snapping magnético de nós em curvas complexas.',
    'Módulo 1: Pen Tool; Módulo 4: Padrões',
    'revisado'
  )`);

  console.log('--- Semeadura Expandida Concluída com Pleno Sucesso! ---');
  });
}

if (require.main === module) {
  runSeed();
}

module.exports = { runSeed };
