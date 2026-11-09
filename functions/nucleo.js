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
    if (provedor !== 'claude' && provedor !== 'gemini' && provedor !== 'gpt') throw new Error('Escolha a IA (Gemini, GPT ou Claude).');
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

// Ordem das partes (p.ordem, decidida em index.js):
//   'antiga': taxonomia, fonte, TAREFA, material — o comportamento original;
//   'cache':  taxonomia, fonte, material, TAREFA — o que se repete entre o
//             plano e os lotes fica no começo (prefixo idêntico), e o cache
//             de entrada do provedor reaproveita o material nos lotes
//             seguintes. Conteúdo igual; só muda a posição, e por isso a
//             tarefa diz "material acima" em vez de "material abaixo".
// Partes da mensagem, para a mensagem em si, para a variante em dois blocos
// e para as impressões digitais gravadas em usoIA (diagnóstico do cache).
function partesMensagem(p) {
    const cache = p.ordem === 'cache';
    let cab = 'Matérias e divisões válidas (L1 e, abaixo de cada uma, as L2; use exatamente estes nomes):\n' + p.taxonomia.map(m => '## ' + m.materia + '\n' + m.divisoes.map(x => '- ' + x).join('\n')).join('\n') + '\n\n';
    if (p.fonte) cab += 'Fonte do material (para o campo "fonte"): ' + p.fonte + '\n\n';
    const onde = cache ? 'acima' : 'abaixo';
    let t = '';
    if (p.acao === 'planejar') {
        t += 'TAREFA: planejar. Leia o material e proponha a lista de fichas extraíveis (sem gerar o corpo), na ordem do material. Para cada uma: titulo, materia, divisao, subtema, tipo e um resumo de uma linha do que a tabela vai conter. Em "observacoes", lacunas, divergências ou trechos sem L2 correspondente (ou "" se nada).';
        if (p.tema) t += '\nOrientação/delimitação do usuário (siga-a: planeje só o que ela abrange): ' + p.tema;
        t += '\nResponda no formato JSON: {"fichas":[{"titulo","materia","divisao","subtema","tipo","resumo"}],"observacoes"}.';
    } else {
        if (p.fichas.length) {
            t += 'TAREFA: gerar estas fichas, uma para cada item, nesta ordem:\n' + p.fichas.map((f, i) => (i + 1) + '. ' + f.titulo + ' | matéria: ' + f.materia + ' | divisão: ' + f.divisao + ' | subtema: ' + f.subtema + ' | tipo: ' + f.tipo + (f.resumo ? ' | conteúdo: ' + f.resumo : '')).join('\n');
            if (p.tema) t += '\nOrientação/delimitação do usuário (siga-a): ' + p.tema;
        } else {
            t += p.tema ? 'TAREFA: gerar UMA ficha (ou duas, se o conteúdo tiver dois eixos que não cabem numa só) a partir do material ' + onde + ', seguindo esta orientação/delimitação do usuário — restrinja o conteúdo ao que ela pede, adote o formato que ela indicar e dê à ficha um título curto e descritivo: ' + p.tema
                : 'TAREFA: gerar UMA ficha (ou duas, se o conteúdo tiver dois eixos que não cabem numa só) que esquematize o material ' + onde + '. Dê à ficha um título curto e descritivo do conteúdo.';
        }
        t += '\nCampos de cada ficha: materia, divisao, titulo, subtema, tipo, referencia (dispositivos e julgados de base, no padrão de citação; ou "(ref. não indicada no material)"), corpo_html, alerta, fonte (a fonte do material, com página se houver). Em "observacoes", o que faltou no material (ou "").';
        t += '\nResponda no formato JSON: {"fichas":[{"materia","divisao","titulo","subtema","tipo","referencia","corpo_html","alerta","fonte"}],"observacoes"}.';
    }
    const mat = p.material.trim() ? '<material>\n' + p.material + '\n</material>' : '(Sem material anexado: use apenas conhecimento jurídico consolidado e seguro; na dúvida, omita.)';
    return { cache, cab, tarefa: t, mat };
}
function mensagemUsuario(p) {
    const x = partesMensagem(p);
    return x.cache ? x.cab + x.mat + '\n\n' + x.tarefa : x.cab + x.tarefa + '\n\n' + x.mat;
}
// Entrada enviada à IA. Padrão: um texto só (mensagemUsuario). Teste da
// administração (p.blocos, só na ordem 'cache'): duas mensagens — a parte
// estável (taxonomia, fonte, material) e a tarefa —, para verificar se o
// cache reaproveita até o fim de um bloco.
function entradaGPT(p) {
    if (!(p.blocos && p.ordem === 'cache')) return mensagemUsuario(p);
    const x = partesMensagem(p);
    return [
        { role: 'user', content: [{ type: 'input_text', text: x.cab + x.mat }] },
        { role: 'user', content: [{ type: 'input_text', text: x.tarefa }] }
    ];
}
// Impressões digitais (SHA-256, 16 caracteres) de cada parte do pedido:
// mostram em usoIA o que mudou entre dois pedidos da mesma execução.
function impressoes(p) {
    const h = t => require('crypto').createHash('sha256').update(String(t)).digest('hex').slice(0, 16);
    const x = partesMensagem(p);
    const tax = x.cab.split('\n\nFonte do material')[0];
    return { instrucoes: h(SISTEMA), formato: h(JSON.stringify(p.acao === 'planejar' ? esquemaPlano() : esquemaFichas())), taxonomia: h(tax), cabecalho: h(x.cab), material: h(x.mat), tarefa: h(x.tarefa), entrada: h(JSON.stringify(entradaGPT(p))) };
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

// ── Uso (tokens) ──
// Só números, para gravar em usoIA sem lixo: {campo: inteiro}.
function soNumeros(o) {
    const r = {};
    Object.keys(o || {}).forEach(k => { const v = o[k]; if (typeof v === 'number' && isFinite(v)) r[k] = v; });
    return r;
}
// Erro depois de a IA responder (resposta cortada, recusa, JSON inválido):
// o provedor já cobrou, então o uso vai junto no erro para ser registrado.
function erroComUso(e, uso) { if (e && typeof e === 'object') e.uso = uso; return e; }

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
    const usoC = msg.usage || {};
    const uso = { modelo: msg.model, entrada: usoC.input_tokens || 0, saida: usoC.output_tokens || 0, cache: usoC.cache_read_input_tokens || 0, raciocinio: 0, detalhes: { entrada: soNumeros(usoC) }, respostaId: msg.id || '' };
    try {
    if (msg.stop_reason === 'refusal') throw new Error('A IA recusou o pedido' + (msg.stop_details && msg.stop_details.explanation ? ': ' + msg.stop_details.explanation : '.'));
    if (msg.stop_reason === 'max_tokens') throw new Error('A resposta ficou longa demais e foi cortada. Peça menos fichas por vez.');
    const texto = msg.content.filter(b => b.type === 'text').map(b => b.text).join('');
    return { json: lerJson(texto), uso };
    } catch (e) { throw erroComUso(e, uso); }
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
    if (!r.ok) { const e = new Error('Gemini respondeu ' + r.status + ': ' + String((j.error && j.error.message) || '').slice(0, 200)); e.status = r.status; throw e; }
    const u = j.usageMetadata || {};
    const uso = { modelo: cfg.modelo, entrada: u.promptTokenCount || 0, saida: (u.candidatesTokenCount || 0) + (u.thoughtsTokenCount || 0), cache: u.cachedContentTokenCount || 0, raciocinio: u.thoughtsTokenCount || 0, detalhes: { entrada: soNumeros(u) }, respostaId: j.responseId || '' };
    try {
    const cand = (j.candidates || [])[0] || {};
    if (cand.finishReason === 'MAX_TOKENS') throw new Error('A resposta ficou longa demais e foi cortada. Peça menos fichas por vez.');
    if (cand.finishReason && cand.finishReason !== 'STOP') throw new Error('O Gemini interrompeu a resposta (' + cand.finishReason + ').');
    const texto = ((cand.content && cand.content.parts) || []).map(x => x.text || '').join('');
    return { json: lerJson(texto), uso };
    } catch (e) { throw erroComUso(e, uso); }
}

// GPT (OpenAI): API REST de respostas (Responses), saída em JSON pelo mesmo
// schema do Claude (strict desligado: os schemas daqui têm campos opcionais).
async function chamarGPT(fetchFn, cfg, p) {
    const corpo = {
        model: cfg.modelo,
        instructions: SISTEMA,
        input: entradaGPT(p),
        max_output_tokens: 32000,
        text: { format: { type: 'json_schema', name: p.acao === 'planejar' ? 'plano' : 'fichas', schema: p.acao === 'planejar' ? esquemaPlano() : esquemaFichas(), strict: false } }
    };
    // Diagnóstico oficial de cache (p.comparacao = id da resposta anterior da
    // mesma execução). Se a API recusar o parâmetro (400, nada cobrado),
    // repete o pedido sem ele e anota que o diagnóstico não está disponível.
    if (p.comparacao) corpo.prompt_cache_options = { comparison_response_id: p.comparacao };
    const enviar = () => fetchFn('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: 'Bearer ' + cfg.chave },
        body: JSON.stringify(corpo)
    });
    let r = await enviar();
    let j = await r.json().catch(() => ({}));
    let diagnosticoRecusado = '';
    if (!r.ok && r.status === 400 && corpo.prompt_cache_options) {
        diagnosticoRecusado = String((j.error && j.error.message) || 'recusado').slice(0, 200);
        delete corpo.prompt_cache_options;
        r = await enviar();
        j = await r.json().catch(() => ({}));
    }
    if (!r.ok) { const e = new Error('GPT respondeu ' + r.status + ' (' + String((j.error && (j.error.code || j.error.type)) || '') + '): ' + String((j.error && j.error.message) || '').slice(0, 200)); e.status = r.status; throw e; }
    // Uso devolvido pela OpenAI: input_tokens inclui os lidos do cache
    // (input_tokens_details.cached_tokens); output_tokens inclui o
    // raciocínio (output_tokens_details.reasoning_tokens).
    const u = j.usage || {}, ue = u.input_tokens_details || {}, us = u.output_tokens_details || {};
    // cached_tokens (lidos), cache_write_tokens (gravados) e o restante são
    // partes separadas de input_tokens (conferido nos registros reais).
    const uso = { modelo: j.model || cfg.modelo, entrada: u.input_tokens || 0, saida: u.output_tokens || 0, cache: ue.cached_tokens || 0, cacheEscrita: ue.cache_write_tokens || 0, raciocinio: us.reasoning_tokens || 0, detalhes: { entrada: soNumeros(ue), saida: soNumeros(us) }, respostaId: j.id || '' };
    if (p.comparacao) uso.diagnostico = diagnosticoRecusado ? { indisponivel: diagnosticoRecusado } : (j.prompt_cache_diagnostics != null ? j.prompt_cache_diagnostics : { ausente: true });
    try {
    if (j.status === 'incomplete') {
        const motivo = j.incomplete_details && j.incomplete_details.reason;
        throw new Error(motivo === 'max_output_tokens' ? 'A resposta ficou longa demais e foi cortada. Peça menos fichas por vez.' : 'O GPT interrompeu a resposta (' + (motivo || 'incompleta') + ').');
    }
    const partes = [];
    (j.output || []).forEach(o => (o.content || []).forEach(c => {
        if (c.type === 'refusal') throw new Error('A IA recusou o pedido' + (c.refusal ? ': ' + c.refusal : '.'));
        if (c.type === 'output_text' && c.text) partes.push(c.text);
    }));
    return { json: lerJson(partes.join('')), uso };
    } catch (e) { throw erroComUso(e, uso); }
}

module.exports = { partesMensagem, entradaGPT, impressoes, TIPOS, SISTEMA, LIMITE_MATERIAL, LIMITE_FICHAS_POR_PEDIDO, esquemaPlano, esquemaFichas, validarPedido, mensagemUsuario, lerJson, validarSaida, chamarClaude, chamarGemini, chamarGPT };
