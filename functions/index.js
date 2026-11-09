// Cloud Functions d'A Salinha.
//
// criarEsquemaIA (chamável pelo app): planeja e gera fichas da seção
// "Esquemas e Tabelas" com IA (Claude, Gemini ou GPT). Níveis (pedido explícito
// do usuário): intermediário cria 1 esquema por semana e completo 10, só com
// a IA Simples (Gemini); a administração, sem limite e com a IA Plus
// (Claude). A cota é contada aqui, em cotaIA/{e-mail}_{segunda-feira}
// (só o servidor lê e grava). As chaves das IAs ficam
// no Secret Manager do Google Cloud (GEMINI_API_KEY e ANTHROPIC_API_KEY) e
// nunca chegam ao navegador. Cada chamada grava o consumo (tokens) em
// usoIA/ (só o servidor lê e grava). Ver LEIAME-firebase.md.
'use strict';

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret, defineString } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const Anthropic = require('@anthropic-ai/sdk');
const nucleo = require('./nucleo');

initializeApp();

const CHAVE_CLAUDE = defineSecret('ANTHROPIC_API_KEY');
const CLAUDE_LIGADO = true; // false = desliga o Claude ("IA Plus") no app
const CHAVE_GEMINI = defineSecret('GEMINI_API_KEY');
// Modelos e esforço ajustáveis sem mexer no código (arquivo functions/.env).
const CLAUDE_MODELO = defineString('CLAUDE_MODELO', { default: 'claude-opus-5-5' });
const CLAUDE_ESFORCO = defineString('CLAUDE_ESFORCO', { default: 'medium' });
const GEMINI_MODELO = defineString('GEMINI_MODELO', { default: 'gemini-3.8-flash' });
// GPT (IA Simples, segunda opção). Desligado até criar o segredo
// OPENAI_API_KEY no Secret Manager: com GPT_LIGADO = false o segredo nem é
// pedido no deploy e o botão aparece como "em breve" no app. O nome do
// modelo vai em GPT_MODELO (functions/.env), conferido no painel da OpenAI.
const GPT_LIGADO = true;
const CHAVE_GPT = defineSecret('OPENAI_API_KEY');
const GPT_MODELO = defineString('GPT_MODELO', { default: 'gpt-6-luna' });
// Ordem das partes do pedido (ver mensagemUsuario em nucleo.js). "cache":
// material antes da tarefa, para o provedor reaproveitar o material entre
// o plano e os lotes (cache de entrada). "antiga": o comportamento original.
// Para voltar ao original: ORDEM_PROMPT=antiga em functions/.env e publicar.
// A administração pode forçar uma das duas num pedido (ordemPrompt), para
// comparar as duas com o mesmo material sem republicar.
const ORDEM_PROMPT = defineString('ORDEM_PROMPT', { default: 'cache' });
// Cache explícito do GPT (aprovado no teste real de 9/11/2026): ponto de
// corte depois do material nos lotes de execuções com mais de um lote; nas
// demais chamadas (plano, ficha individual, lote único), modo explícito sem
// ponto de corte, para não pagar gravação de cache que nada vai ler.
// Desligar para todos: CACHE_EXPLICITO=nao em functions/.env e publicar
// (volta ao comportamento anterior, cache implícito).
const CACHE_EXPLICITO = defineString('CACHE_EXPLICITO', { default: 'sim' });

// Esquemas por semana (segunda a domingo, horário de Brasília).
const COTA_SEMANAL = { intermediario: 1, completo: 10 };
const IA_PLUS_SO_ADMIN = true; // IA Plus desabilitada para os demais por enquanto

// Segunda-feira da semana atual (AAAA-MM-DD) e a próxima, em Brasília (UTC-3).
function semanaAtual(agora) {
    const br = new Date((agora || new Date()).getTime() - 3 * 3600 * 1000);
    const dia = (br.getUTCDay() + 6) % 7; // 0 = segunda
    const seg = new Date(Date.UTC(br.getUTCFullYear(), br.getUTCMonth(), br.getUTCDate() - dia));
    const prox = new Date(seg.getTime() + 7 * 86400 * 1000);
    const iso = (d) => d.toISOString().slice(0, 10);
    return { chave: iso(seg), renovaEm: iso(prox) };
}
exports._semanaAtual = semanaAtual;

exports.criarEsquemaIA = onCall({
    region: 'southamerica-east1',
    secrets: [CHAVE_GEMINI].concat(CLAUDE_LIGADO ? [CHAVE_CLAUDE] : [], GPT_LIGADO ? [CHAVE_GPT] : []),
    timeoutSeconds: 540,
    memory: '512MiB',
    maxInstances: 3
}, async (req) => {
    if (!req.auth || !req.auth.token || !req.auth.token.email || req.auth.token.email_verified !== true) {
        throw new HttpsError('unauthenticated', 'Entre com Google.');
    }
    const email = req.auth.token.email;
    const db = getFirestore();
    const acesso = await db.doc('acessos/' + email).get();
    const a = acesso.exists ? acesso.data() : {};
    if (a.ativo !== true) throw new HttpsError('permission-denied', 'Acesso inativo.');
    if (a.expiraEm && a.expiraEm.toDate && a.expiraEm.toDate() <= new Date()) throw new HttpsError('permission-denied', 'O seu acesso venceu.');
    const admin = a.papel === 'admin';
    const nivel = admin ? 'admin' : (a.nivel || 'completo');
    if (!admin && !COTA_SEMANAL[nivel]) throw new HttpsError('permission-denied', 'Criar esquemas com IA faz parte dos acessos intermediário e completo.');
    const limite = admin ? null : COTA_SEMANAL[nivel];
    const sem = semanaAtual();
    const refCota = db.doc('cotaIA/' + email + '_' + sem.chave);
    const lerCota = async () => {
        if (limite === null) return { limite: null, usados: 0, renovaEm: sem.renovaEm };
        const d = await refCota.get();
        return { limite, usados: (d.exists && d.data().usados) || 0, renovaEm: sem.renovaEm };
    };
    if (req.data && req.data.acao === 'cota') return { cota: await lerCota(), provedores: { gemini: true, gpt: GPT_LIGADO, claude: CLAUDE_LIGADO && (admin || !IA_PLUS_SO_ADMIN) } };

    let pedido;
    try { pedido = nucleo.validarPedido(req.data); }
    catch (e) { throw new HttpsError('invalid-argument', e.message); }

    if (pedido.provedor === 'claude' && !CLAUDE_LIGADO) throw new HttpsError('failed-precondition', 'O Claude ainda não foi configurado (falta a chave ANTHROPIC_API_KEY). Use o Gemini.');
    const ordemPedida = req.data && req.data.ordemPrompt;
    // Por ora só no GPT (o Gemini e o Claude seguem com a ordem original).
    // O planejamento fica sempre na ordem original: no teste de 9/11 a ordem
    // nova deu um plano de 21 fichas contra 36 (mesmo material), e o plano
    // não divide cache com os lotes (o formato de saída é outro). Só a
    // administração força outra ordem, para testar. 'cache2' = ordem cache
    // com a entrada em dois blocos (teste do cache; ver entradaGPT).
    // Cache explícito (padrão): ponto de corte só nos lotes de uma execução
    // com mais de um lote (req.data.multiLote); nas demais chamadas do GPT,
    // modo explícito sem ponto de corte (sem gravação). A administração pode
    // pedir o comportamento anterior ('semcache' ou os testes de ordem
    // 'antiga', 'cache' e 'cache2'), que segue exatamente como era.
    const loteDeVarios = pedido.acao === 'gerar' && pedido.fichas.length > 0 && req.data && req.data.multiLote === true;
    const testeAnterior = admin && ['semcache', 'antiga', 'cache', 'cache2'].indexOf(ordemPedida) >= 0;
    const explicitoLigado = pedido.provedor === 'gpt' && CACHE_EXPLICITO.value() !== 'nao' && !testeAnterior;
    pedido.cacheExplicito = explicitoLigado && loteDeVarios;
    pedido.semGravar = explicitoLigado && !loteDeVarios;
    const ordemValida = ordemPedida === 'antiga' || ordemPedida === 'cache' || ordemPedida === 'cache2';
    // 'cache2' testa só os lotes; o plano continua na ordem original.
    const testeLotes = ordemPedida === 'cache2' && pedido.acao === 'planejar';
    pedido.ordem = pedido.provedor !== 'gpt' ? 'antiga'
        : pedido.cacheExplicito ? 'cache'
        : admin && ordemValida && !testeLotes ? (ordemPedida === 'cache2' ? 'cache' : ordemPedida)
        : pedido.acao === 'planejar' ? 'antiga'
        : (ORDEM_PROMPT.value() === 'antiga' ? 'antiga' : 'cache');
    pedido.blocos = pedido.provedor === 'gpt' && admin && ordemPedida === 'cache2' && !testeLotes;
    // Diagnóstico de cache: id da resposta anterior da mesma execução.
    const comparacao = String((req.data && req.data.comparacao) || '');
    if (admin && pedido.provedor === 'gpt' && /^resp_[A-Za-z0-9]{10,100}$/.test(comparacao)) pedido.comparacao = comparacao;
    // Identificação para a auditoria de custo: execução (um plano e os seus
    // lotes, ou uma ficha individual) e número do lote (0 = plano).
    const execucao = String((req.data && req.data.execucao) || '').replace(/[^\w-]/g, '').slice(0, 40);
    const lote = Number.isInteger(req.data && req.data.lote) && req.data.lote >= 0 && req.data.lote < 1000 ? req.data.lote : null;
    const fichasPedidas = pedido.acao === 'gerar' ? pedido.fichas.length : 0;
    // Grava cada chamada que o provedor cobrou — também as que falharam
    // depois da resposta (cortada, recusa, JSON inválido, formato errado).
    const registrarUso = async (uso, extra) => {
        if (!uso) return;
        try {
            await db.collection('usoIA').add(Object.assign({
                uid: req.auth.uid, email, acao: pedido.acao, provedor: pedido.provedor, modelo: uso.modelo || '',
                entrada: uso.entrada || 0, saida: uso.saida || 0, cacheEntrada: uso.cache || 0, cacheEscrita: uso.cacheEscrita || 0, raciocinio: uso.raciocinio || 0,
                detalhesUso: uso.detalhes || {}, respostaId: uso.respostaId || '',
                execucao, lote, ordemPrompt: pedido.ordem, formatoEntrada: pedido.cacheExplicito ? 'explicito' : pedido.blocos ? 'dois-blocos' : 'texto', cacheModo: uso.cacheModo || '', fichasPedidas, caracteresMaterial: pedido.material.length,
                comparacao: pedido.comparacao || '', diagnosticoCache: uso.diagnostico ? JSON.stringify(uso.diagnostico).slice(0, 3000) : '',
                impressoes: pedido.provedor === 'gpt' ? nucleo.impressoes(pedido) : {},
                em: FieldValue.serverTimestamp()
            }, extra));
        } catch (e) { console.warn('[criarEsquemaIA] não registrou o uso:', e.message); }
    };

    if (pedido.provedor === 'gpt' && !GPT_LIGADO) throw new HttpsError('failed-precondition', 'O GPT ainda está em configuração. Use o Gemini.');
    if (pedido.provedor === 'claude' && IA_PLUS_SO_ADMIN && !admin) throw new HttpsError('permission-denied', 'A IA Plus ainda não está disponível.');

    // Reserva a cota antes de chamar a IA (pedidos simultâneos não passam do
    // limite); depois acerta pelo número real de fichas, ou devolve se falhar.
    // Planejar não consome, mas só é aceito com cota disponível.
    let reserva = 0;
    if (limite !== null) {
        try {
            reserva = await db.runTransaction(async (t) => {
                const d = await t.get(refCota);
                const usados = (d.exists && d.data().usados) || 0;
                const disp = limite - usados;
                if (disp <= 0) throw new HttpsError('resource-exhausted', 'Você já criou ' + usados + ' de ' + limite + ' esquema(s) nesta semana. A cota renova na segunda-feira.');
                if (pedido.acao !== 'gerar') return 0;
                const n = Math.min(disp, pedido.fichas.length || 2);
                t.set(refCota, { email, semana: sem.chave, limite, usados: usados + n, atualizadoEm: FieldValue.serverTimestamp() }, { merge: true });
                return n;
            });
        } catch (e) {
            if (e instanceof HttpsError) throw e;
            console.error('[criarEsquemaIA] cota:', e && e.message);
            throw new HttpsError('internal', 'Não foi possível conferir a sua cota agora.');
        }
        // Lote: gera só o que cabe na cota.
        if (reserva && pedido.fichas.length > reserva) pedido.fichas = pedido.fichas.slice(0, reserva);
    }
    const devolver = async (n) => {
        if (n > 0) { try { await refCota.update({ usados: FieldValue.increment(-n) }); } catch (e) { console.warn('[criarEsquemaIA] não devolveu a cota:', e.message); } }
    };

    let r;
    try {
        if (pedido.provedor === 'claude') {
            const cliente = new Anthropic({ apiKey: CHAVE_CLAUDE.value(), timeout: 520000, maxRetries: 1 });
            r = await nucleo.chamarClaude(cliente, { modelo: CLAUDE_MODELO.value(), esforco: CLAUDE_ESFORCO.value() }, pedido);
        } else if (pedido.provedor === 'gpt') {
            r = await nucleo.chamarGPT(fetch, { modelo: GPT_MODELO.value(), chave: CHAVE_GPT.value() }, pedido);
        } else {
            r = await nucleo.chamarGemini(fetch, { modelo: GEMINI_MODELO.value(), chave: CHAVE_GEMINI.value() }, pedido);
        }
    } catch (e) {
        console.error('[criarEsquemaIA] falha:', pedido.provedor, e && e.status, e && e.message);
        await devolver(reserva);
        await registrarUso(e && e.uso, { status: 'erro', erro: String((e && e.message) || '').slice(0, 300), fichas: 0 });
        const status = e && e.status;
        const msg = status === 401 ? 'A chave da IA foi recusada (confira o segredo no Secret Manager).'
            // 429 da OpenAI/Gemini também vem quando a conta está sem crédito
            // (insufficient_quota): aí esperar não adianta, precisa recarregar.
            : status === 429 && /quota|billing|credit|cr[eé]dit/i.test((e && e.message) || '') ? 'A conta da IA (' + (pedido.provedor === 'gpt' ? 'OpenAI' : pedido.provedor === 'claude' ? 'Anthropic' : 'Google') + ') está sem créditos ou sem cota. É preciso adicionar créditos no painel de cobrança dela.'
            : status === 429 ? 'Limite de uso da IA atingido. Tente de novo em alguns minutos.'
            : (e && e.message) || 'Falha ao chamar a IA.';
        throw new HttpsError('internal', msg);
    }

    let saida;
    try { saida = nucleo.validarSaida(pedido.acao, r.json); }
    catch (e) {
        await devolver(reserva);
        await registrarUso(r.uso, { status: 'erro', erro: 'Resposta fora do formato: ' + String(e.message).slice(0, 250), fichas: 0 });
        throw new HttpsError('internal', 'Resposta da IA fora do formato: ' + e.message);
    }
    if (reserva) {
        if (saida.fichas.length > reserva) saida.fichas = saida.fichas.slice(0, reserva);
        await devolver(reserva - saida.fichas.length);
    }

    await registrarUso(r.uso, { status: 'ok', fichas: saida.fichas.length, descartadas: saida.descartadas || 0 });

    return { acao: pedido.acao, fichas: saida.fichas, descartadas: saida.descartadas, observacoes: saida.observacoes, uso: r.uso, cota: await lerCota() };
});
