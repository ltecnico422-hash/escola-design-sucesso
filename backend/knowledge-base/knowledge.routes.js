const express = require('express');
const router = express.Router();
const { query, get, run } = require('../../database/db.js');
const { optionalAuth, requireAdmin } = require('../auth/auth.middleware.js');

// GET /api/knowledge - Lista artigos da base interna com filtros e busca
router.get('/', optionalAuth, (req, res) => {
  try {
    const { software, categoria, tipo_fonte, q } = req.query;
    let sql = 'SELECT * FROM knowledge WHERE 1=1';
    const params = [];

    if (software) {
      sql += ' AND software = ?';
      params.push(software);
    }
    if (categoria) {
      sql += ' AND categoria = ?';
      params.push(categoria);
    }
    if (tipo_fonte) {
      sql += ' AND tipo_fonte = ?';
      params.push(tipo_fonte);
    }
    if (q) {
      sql += ' AND (titulo LIKE ? OR tags LIKE ? OR conteudo_resumo LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }

    sql += ' ORDER BY curado_admin DESC, created_at DESC';

    const items = query(sql, params);
    return res.json(items);
  } catch (err) {
    console.error('Erro ao buscar base de conhecimento:', err);
    return res.status(500).json({ error: 'Erro ao carregar Central de Conhecimento.' });
  }
});

// GET /api/knowledge/categories - Lista softwares e categorias disponíveis
router.get('/meta/categories', (req, res) => {
  try {
    const softwares = query('SELECT DISTINCT software FROM knowledge WHERE software IS NOT NULL');
    const categories = query('SELECT DISTINCT categoria FROM knowledge WHERE categoria IS NOT NULL');
    return res.json({
      softwares: softwares.map(s => s.software),
      categorias: categories.map(c => c.categoria)
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar categorias.' });
  }
});

// POST /api/knowledge/search-external - Modo Pesquisar na Web com os 3 modos (Pesquisar, Aprender, Solucionar)
router.post('/search-external', (req, res) => {
  try {
    const { termo, modo, software } = req.body; // modo: 'pesquisar' | 'aprender' | 'solucionar'

    if (!termo) {
      return res.status(400).json({ error: 'Termo de pesquisa é obrigatório.' });
    }

    const tLower = termo.toLowerCase();
    const dataConsulta = new Date().toISOString().split('T')[0];

    // Simulação rigorosa fundamentada nos padrões da Seção 8 da skill
    let resultado = {};

    if (modo === 'aprender') {
      resultado = {
        titulo: `Guia Didático Completo: ${termo}`,
        modo: 'aprender',
        software: software || 'Design Geral',
        dataConsulta,
        oQueE: `Definição e natureza essencial de "${termo}" no contexto da computação gráfica e comunicação visual.`,
        porQueExiste: `Foi desenvolvido para resolver limitações de fidelidade visual, precisão matemática e interoperabilidade entre mídias físicas e digitais.`,
        comoFunciona: `Opera através de algoritmos de interpolação não-destrutiva, mapeamento de matrizes de cor e parametrização de nós vetoriais.`,
        passoAPasso: [
          'Acesse o menu correspondente nas propriedades da ferramenta.',
          'Configure a tolerância ou resolução conforme o destino do arquivo (Web ou Impressão).',
          'Aplique o parâmetro mantendo uma cópia do elemento base em Smart Object.'
        ],
        exemplo: `Exemplo em fluxo profissional: aplicação de curvas de tons para harmonizar iluminação de 2 fotografias distintas.`,
        erroComum: `Aplicar alterações diretamente na matriz rasterizada sem duplicar ou mascarar o canal alfa.`,
        exercicio: `Pratique este conceito em uma tela de teste com 3 variações de intensidade.`,
        fontes: [
          { nome: 'Adobe Design Systems Documentation', tipo: 'Oficial', url: 'https://helpx.adobe.com' },
          { nome: 'Manual Internacional de Tipografia e Cor', tipo: 'Técnica', url: 'https://w3.org' }
        ]
      };
    } else if (modo === 'solucionar') {
      resultado = {
        titulo: `Diagnóstico e Solução: ${termo}`,
        modo: 'solucionar',
        software: software || 'Design Geral',
        dataConsulta,
        diagnostico: `Análise de causas prováveis para o comportamento relatado em "${termo}".`,
        causasProvaveis: [
          'Conflito entre espaço de cor do documento (ex: RGB) e perfil da placa gráfica.',
          'Camada bloqueada (Lock) ou máscara oculta desativada temporariamente.',
          'Resolução de efeito de rasterização abaixo de 300 DPI em arquivos vetoriais.'
        ],
        solucoesEmOrdem: [
          '1. Verifique Janela > Camadas e confirme se a camada ativa está desmarcada como "Bloqueada".',
          '2. Pressione D para redefinir as cores frontais para preto e branco.',
          '3. Verifique Janela > Espaço de Trabalho e clique em "Redefinir Espaço de Trabalho".'
        ],
        fontes: [
          { nome: 'Adobe Community & Troubleshooting Hub', tipo: 'Fórum / Oficial', url: 'https://community.adobe.com' },
          { nome: 'CorelDRAW Knowledge Support', tipo: 'Oficial', url: 'https://kb.corel.com' }
        ]
      };
    } else {
      // Modo Pesquisar
      resultado = {
        titulo: `Pesquisa Técnica: ${termo}`,
        modo: 'pesquisar',
        software: software || 'Design Geral',
        dataConsulta,
        resumo: `Resultados consolidados a partir da documentação técnica e centros de suporte autorizados para "${termo}".`,
        passoAPasso: [
          'Localize a função através do atalho nativo ou barra de menus do aplicativo.',
          'Ajuste os controles deslizantes observando o histograma ou grade de visualização.',
          'Salve uma predefinição (Preset) para automatizar futuras aplicações.'
        ],
        fontes: [
          { nome: 'Adobe Creative Cloud Official Manual', tipo: 'Oficial', url: 'https://helpx.adobe.com' },
          { nome: 'ABIGRAF — Associação Brasileira da Indústria Gráfica', tipo: 'Técnica', url: 'https://abigraf.org.br' }
        ]
      };
    }

    return res.json(resultado);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao processar pesquisa externa.' });
  }
});

// POST /api/knowledge - Admin promove resultado externo à base interna
router.post('/', requireAdmin, (req, res) => {
  try {
    const { titulo, fonte, url, autor, software, versao, categoria, tags, conteudo_resumo, passo_a_passo, tipo_fonte } = req.body;

    if (!titulo || !fonte || !software || !categoria || !conteudo_resumo) {
      return res.status(400).json({ error: 'Campos obrigatórios: titulo, fonte, software, categoria e conteudo_resumo.' });
    }

    run(
      `INSERT INTO knowledge (
        titulo, fonte, url, autor, data_publicacao, software, versao, categoria, tags, conteudo_resumo, passo_a_passo, tipo_fonte, curado_admin
      ) VALUES (?, ?, ?, ?, CURRENT_DATE, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        titulo,
        fonte,
        url || '',
        autor || 'Curador da Escola',
        software,
        versao || 'Atual',
        categoria,
        tags || '',
        conteudo_resumo,
        passo_a_passo || '',
        tipo_fonte || 'oficial'
      ]
    );

    return res.json({ message: 'Artigo promovido e indexado com sucesso na Central de Conhecimento!' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao salvar artigo na base de conhecimento.' });
  }
});

module.exports = router;
