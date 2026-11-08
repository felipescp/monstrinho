// Núcleo do "Criar Esquema com IA": prompt, formatos de saída, validação e
// chamadas às IAs (Claude e Gemini). Sem dependência do Firebase, para
// testar localmente (ver functions/teste-nucleo.js).
//
// O prompt adapta as "Instruções do Projeto — Fábrica de fichas para
// Esquemas e Tabelas" (v4) ao uso no app: em vez da conversa com comandos
// (inventário, lote N/T…), duas tarefas fixas —
//   planejar: lê o material e propõe a lista de fichas;
//   gerar:    produz as fichas pedidas, com campos separados.
// O app monta, a partir dos campos, o texto de importação da seção Esquemas
// (### L2 / Subtema | Tipo / Referência / CORPO / ALERTA / FONTE).
'use strict';

const TIPOS = ['Classificação', 'Comparativo', 'Requisitos e prazos', 'Rol', 'Alteração legislativa', 'Jurisprudência esquematizada', 'Macete'];
const LIMITE_MATERIAL = 300000;   // caracteres (~75 mil tokens)
const LIMITE_FICHAS_POR_PEDIDO = 5;

const SISTEMA = `Você é o extrator de esquemas d'A Salinha, plataforma de estudo para carreiras jurídicas (juiz, promotor, defensor; banca FGV). Converte material jurídico em fichas da seção "Esquemas e Tabelas": tabelas, classificações e macetes.

O QUE É EXTRAÍVEL
- Extraia quando o trecho for, ou puder virar, uma tabela de duas ou mais colunas: classificações e espécies; contrastes "X vs Y"; antes e depois de alteração legislativa; requisitos, prazos, frações e percentuais; rol de vedações; competências e efeitos por hipótese; jurisprudência organizada por tese; macetes e mnemônicos.
- Não extraia texto expositivo sem eixo comparativo, exemplo isolado, doutrina discursiva de um parágrafo só, nem lei seca corrida que não se estrutura em colunas.
- Requisitos, prazos, frações, quóruns, róis e vedações do texto de lei podem virar ficha mesmo sem tabela pronta no material, quando o dispositivo se estruturar em colunas.
- Capítulos curtos e vizinhos que a banca cobra pelo contraste podem virar uma ficha comparativa.
- Esquemas irmãos (o mesmo tema fatiado) viram UMA ficha. Nunca fatie um esquema para inflar a contagem.

CLASSIFICAÇÃO DE CADA FICHA
- materia e divisao: identifique pelo conteúdo do material a matéria (L1) e a divisão (L2) de cada ficha, usando exatamente um par da lista "Matérias e divisões válidas" (letra por letra; a divisão tem de pertencer à matéria escolhida). Fichas do mesmo material podem cair em matérias diferentes. Se nenhuma divisão servir bem, use a mais próxima e diga isso em "observacoes".
- subtema: identificação livre e curta (ex.: "Dosimetria da pena").
- tipo: exatamente um destes: ${TIPOS.join('; ')}. Ordem de verificação (pare na primeira que bater): é antes/depois de lei? Alteração legislativa. É quadro de teses de tribunal? Jurisprudência esquematizada. Tem requisito, fração, prazo ou percentual como eixo? Requisitos e prazos. Contrasta dois institutos? Comparativo. Enumera hipóteses sem contraste? Rol. Divide um instituto em espécies? Classificação. Nenhuma? Macete. Ficha com mais de uma tabela: o tipo é o da primeira.

FORMA DO CORPO (campo corpo_html, HTML numa única linha)
- Vocabulário permitido: <table><tr><th>…</th></tr><tr><td>…</td></tr></table>; <ul>/<ol>/<li> para rol corrido; <p><strong>…</strong></p> como subtítulo entre tabelas; <p>…</p> para uma frase de enquadramento antes da tabela; <strong> e <em> (expressão latina); &#8627; na coluna 1 para subespécie. Nada mais (sem estilos, classes ou atributos).
- Coluna 1 = o eixo (espécie, critério, hipótese, dispositivo). Nunca coluna de numeração.
- Toda linha tem o mesmo número de células do cabeçalho. Sem conteúdo: "Não se aplica.".
- Negrito só no termo que muda o gabarito.
- Mais de um eixo no mesmo tema: mais de uma tabela, cada uma com subtítulo.
- Use hífen simples, nunca travessão longo; evite aspas curvas.

ALERTA (obrigatório, uma linha): onde a questão erra de propósito (inversão da teoria adotada, troca de fração, cumulativo virando alternativo, exceção virando regra). Sem ponto de corte real, o macete de memorização.

REESCRITA: o material é licenciado. Preserve a substância jurídica, mas com redação, ordem de colunas e recorte seus; não reproduza frases explicativas do material. Preserve literalmente só: texto de lei citado como lei, súmulas, enunciados, expressões latinas, nomes de teorias e autores, números de artigos, leis, informativos e precedentes.

PRECISÃO
- Nunca invente artigo, fração, prazo, súmula, informativo ou precedente. Ausente no material: deixe fora ou escreva "(ref. não indicada no material)".
- Contradição interna do material: registre as duas versões e escreva "DIVERGENCIA NO MATERIAL" dentro da célula.
- Material desatualizado em relação a lei nova evidente: diga isso em "observacoes".

PADRÃO DE CITAÇÃO (o app transforma cada citação em link para o texto da lei ou para o julgado)
- Todo artigo traz a lei no mesmo trecho, por sigla ou número: "art. 157, § 2º, II, do CP"; "art. 75, VIII, da Lei 14.133/2021"; "art. 5º, XXXV, da CF". Nunca "desta Lei", "do mesmo diploma" ou artigo solto.
- Ordem: artigo, parágrafo, inciso, alínea, separados por vírgula.
- Siglas: CF, CP, CPP, CC, CPC, CDC, CTN, ECA, CLT, LEP, LCP, LINDB, CTB, CPM, CPPM; demais leis pelo número ("Lei 11.343/2006", "LC 101/2000"). "LRF" é só a LC 101/2000; a Lei de Recuperação e Falência é "Lei 11.101/2005".
- Julgados com classe, número e tribunal: "(STJ, 3ª Turma, REsp 1.234.567/SP, j. dd/mm/aaaa - Info nnn)"; "Súmula 711 do STF"; "Tema 1.215 do STJ". Enunciados das Jornadas: "JDC nn".

SAÍDA: responda somente com o JSON pedido, sem texto antes ou depois. Qualidade sobre quantidade.`;

function esquemaPlano() {
    return {
        type: 'object',
        properties: {
            fichas: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        titulo: { type: 'string' },
                        materia: { type: 'string' },
                        divisao: { type: 'string' },
                        subtema: { type: 'string' },
                        tipo: { type: 'string', enum: TIPOS },
                        resumo: { type: 'string' }
                    },
                    required: ['titulo', 'materia', 'divisao', 'subtema', 'tipo', 'resumo'],
                    additionalProperties: false
                }
            },
            observacoes: { type: 'string' }
        },
        required: ['fichas', 'observacoes'],
        additionalProperties: false
    };
}
function esquemaFichas() {
    return {
        type: 'object',
        properties: {
            fichas: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        materia: { type: 'string' },
                        divisao: { type: 'string' },
                        titulo: { type: 'string' },
                        subtema: { type: 'string' },
                        tipo: { type: 'string', enum: TIPOS },
                        referencia: { type: 'string' },
                        corpo_html: { type: 'string' },
                        alerta: { type: 'string' },
                        fonte: { type: 'string' }
                    },
                    required: ['materia', 'divisao', 'titulo', 'subtema', 'tipo', 'referencia', 'corpo_html', 'alerta', 'fonte'],
                    additionalProperties: false
                }
            },
            observacoes: { type: 'string' }
        },
        required: ['fichas', 'observacoes'],
        additionalProperties: false
    };
}

// Valida e limpa o pedido vindo do app. Lança Error com mensagem para o usuário.
function validarPedido(d) {
    d = d || {};
    const acao = d.acao, provedor = d.provedor;
    if (acao !== 'planejar' && acao !== 'gerar') throw new Error('Ação inválida.');
    if (provedor !== 'claude' && provedor !== 'gemini') throw new Error('Escolha a IA (Claude ou Gemini).');
    // Taxonomia inteira (a IA escolhe matéria e divisão de cada ficha).
    const taxonomia = (Array.isArray(d.taxonomia) ? d.taxonomia : []).slice(0, 60).map(m => ({
        materia: String((m && m.materia) || '').trim().slice(0, 200),
        divisoes: (Array.isArray(m && m.divisoes) ? m.divisoes : []).map(x => String(x).trim().slice(0, 200)).filter(Boolean).slice(0, 120)
    })).filter(m => m.materia && m.divisoes.length);
    if (!taxonomia.length) throw new Error('Taxonomia de matérias ausente.');
    const tema = String(d.tema || '').trim().slice(0, 2000);
    const material = String(d.material || '');
    const fonte = String(d.fonte || '').trim().slice(0, 300);
    if (material.length > LIMITE_MATERIAL) throw new Error('O material passa do limite de ' + LIMITE_MATERIAL.toLocaleString('pt-BR') + ' caracteres. Divida em partes.');
    if (!material.trim() && !tema) throw new Error('Cole o material ou descreva o tema.');
    let fichas = [];
    if (acao === 'gerar') {
        fichas = (Array.isArray(d.fichas) ? d.fichas : []).slice(0, LIMITE_FICHAS_POR_PEDIDO).map(f => ({
            titulo: String((f && f.titulo) || '').slice(0, 300),
            materia: String((f && f.materia) || '').slice(0, 200),
            divisao: String((f && f.divisao) || '').slice(0, 300),
            subtema: String((f && f.subtema) || '').slice(0, 300),
            tipo: String((f && f.tipo) || '').slice(0, 60),
            resumo: String((f && f.resumo) || '').slice(0, 1000)
        }));
    }
    return { acao, provedor, taxonomia, tema, material, fonte, fichas };
}

function mensagemUsuario(p) {
    let t = 'Matérias e divisões válidas (L1 e, abaixo de cada uma, as L2; use exatamente estes nomes):\n' + p.taxonomia.map(m => '## ' + m.materia + '\n' + m.divisoes.map(x => '- ' + x).join('\n')).join('\n') + '\n\n';
    if (p.fonte) t += 'Fonte do material (para o campo "fonte"): ' + p.fonte + '\n\n';
    if (p.acao === 'planejar') {
        t += 'TAREFA: planejar. Leia o material e proponha a lista de fichas extraíveis (sem gerar o corpo), na ordem do material. Para cada uma: titulo, materia, divisao, subtema, tipo e um resumo de uma linha do que a tabela vai conter. Em "observacoes", lacunas, divergências ou trechos sem L2 correspondente (ou "" se nada).';
        if (p.tema) t += '\nOrientação do usuário: ' + p.tema;
        t += '\nResponda no formato JSON: {"fichas":[{"titulo","materia","divisao","subtema","tipo","resumo"}],"observacoes"}.';
    } else {
        if (p.fichas.length) {
            t += 'TAREFA: gerar estas fichas, uma para cada item, nesta ordem:\n' + p.fichas.map((f, i) => (i + 1) + '. ' + f.titulo + ' | matéria: ' + f.materia + ' | divisão: ' + f.divisao + ' | subtema: ' + f.subtema + ' | tipo: ' + f.tipo + (f.resumo ? ' | conteúdo: ' + f.resumo : '')).join('\n');
            if (p.tema) t += '\nOrientação do usuário: ' + p.tema;
        } else {
            t += p.tema ? 'TAREFA: gerar UMA ficha (ou duas, se o tema tiver dois eixos que não cabem numa só) sobre: ' + p.tema
                : 'TAREFA: gerar UMA ficha (ou duas, se o conteúdo tiver dois eixos que não cabem numa só) que esquematize o material abaixo. Dê à ficha um título curto e descritivo do conteúdo.';
        }
        t += '\nCampos de cada ficha: materia, divisao, titulo, subtema, tipo, referencia (dispositivos e julgados de base, no padrão de citação; ou "(ref. não indicada no material)"), corpo_html, alerta, fonte (a fonte do material, com página se houver). Em "observacoes", o que faltou no material (ou "").';
        t += '\nResponda no formato JSON: {"fichas":[{"materia","divisao","titulo","subtema","tipo","referencia","corpo_html","alerta","fonte"}],"observacoes"}.';
    }
    t += p.material.trim() ? '\n\n<material>\n' + p.material + '\n</material>' : '\n\n(Sem material anexado: use apenas conhecimento jurídico consolidado e seguro; na dúvida, omita.)';
    return t;
}

// Extrai o JSON do texto da IA (tolera cercas ```json).
function lerJson(texto) {
    let t = String(texto || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const i = t.indexOf('{'), j = t.lastIndexOf('}');
    if (i < 0 || j < i) throw new Error('A IA não devolveu JSON.');
    return JSON.parse(t.slice(i, j + 1));
}

const umaLinha = s => String(s == null ? '' : s).replace(/\s*[\r\n]+\s*/g, ' ').trim();

// Confere e normaliza a saída. Fichas com tipo fora do vocabulário ou sem
// corpo são descartadas (e contadas).
function validarSaida(acao, j) {
    const fichasBrutas = Array.isArray(j && j.fichas) ? j.fichas : [];
    const out = { fichas: [], descartadas: 0, observacoes: umaLinha(j && j.observacoes) };
    fichasBrutas.forEach(f => {
        if (!f || typeof f !== 'object') { out.descartadas++; return; }
        const tipo = TIPOS.find(x => x.toLowerCase() === String(f.tipo || '').trim().toLowerCase());
        const base = { titulo: umaLinha(f.titulo), materia: umaLinha(f.materia), divisao: umaLinha(f.divisao), subtema: umaLinha(f.subtema), tipo: tipo || '' };
        if (!base.titulo || !base.divisao || !tipo) { out.descartadas++; return; }
        if (acao === 'planejar') { out.fichas.push(Object.assign(base, { resumo: umaLinha(f.resumo) })); return; }
        const corpo = umaLinha(f.corpo_html);
        if (!/<(table|ul|ol|p)\b/i.test(corpo)) { out.descartadas++; return; }
        out.fichas.push(Object.assign(base, { referencia: umaLinha(f.referencia) || '(ref. não indicada no material)', corpo_html: corpo, alerta: umaLinha(f.alerta), fonte: umaLinha(f.fonte) }));
    });
    return out;
}

// ── Chamadas às IAs ──
// Claude: SDK oficial, streaming (respostas longas), saída estruturada por
// JSON schema, fallback do servidor em caso de recusa.
async function chamarClaude(cliente, cfg, p) {
    const stream = cliente.beta.messages.stream({
        model: cfg.modelo,
        max_tokens: 32000,
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: cfg.esforco || 'medium', format: { type: 'json_schema', schema: p.acao === 'planejar' ? esquemaPlano() : esquemaFichas() } },
        system: SISTEMA,
        messages: [{ role: 'user', content: mensagemUsuario(p) }]
    });
    const msg = await stream.finalMessage();
    if (msg.stop_reason === 'refusal') throw new Error('A IA recusou o pedido' + (msg.stop_details && msg.stop_details.explanation ? ': ' + msg.stop_details.explanation : '.'));
    if (msg.stop_reason === 'max_tokens') throw new Error('A resposta ficou longa demais e foi cortada. Peça menos fichas por vez.');
    const texto = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
    return {
        json: lerJson(texto),
        uso: { modelo: msg.model, entrada: msg.usage.input_tokens || 0, saida: msg.usage.output_tokens || 0 }
    };
}

// Gemini: API REST (generativelanguage), resposta em JSON.
async function chamarGemini(fetchFn, cfg, p) {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(cfg.modelo) + ':generateContent';
    const r = await fetchFn(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': cfg.chave },
        body: JSON.stringify({
            systemInstruction: { parts: [{ text: SISTEMA }] },
            contents: [{ role: 'user', parts: [{ text: mensagemUsuario(p) }] }],
            generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 32768 }
        })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error('Gemini respondeu ' + r.status + ': ' + String((j.error && j.error.message) || '').slice(0, 200));
    const cand = (j.candidates || [])[0] || {};
    if (cand.finishReason === 'MAX_TOKENS') throw new Error('A resposta ficou longa demais e foi cortada. Peça menos fichas por vez.');
    if (cand.finishReason && cand.finishReason !== 'STOP') throw new Error('O Gemini interrompeu a resposta (' + cand.finishReason + ').');
    const texto = ((cand.content && cand.content.parts) || []).map(x => x.text || '').join('');
    const u = j.usageMetadata || {};
    return {
        json: lerJson(texto),
        uso: { modelo: cfg.modelo, entrada: u.promptTokenCount || 0, saida: (u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0) }
    };
}

module.exports = { TIPOS, SISTEMA, LIMITE_MATERIAL, LIMITE_FICHAS_POR_PEDIDO, esquemaPlano, esquemaFichas, validarPedido, mensagemUsuario, lerJson, validarSaida, chamarClaude, chamarGemini };
