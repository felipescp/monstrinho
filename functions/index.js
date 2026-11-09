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
        const status = e && e.status;
        const msg = status === 401 ? 'A chave da IA foi recusada (confira o segredo no Secret Manager).'
            : status === 429 ? 'Limite de uso da IA atingido. Tente de novo em alguns minutos.'
            : (e && e.message) || 'Falha ao chamar a IA.';
        throw new HttpsError('internal', msg);
    }

    let saida;
    try { saida = nucleo.validarSaida(pedido.acao, r.json); }
    catch (e) { await devolver(reserva); throw new HttpsError('internal', 'Resposta da IA fora do formato: ' + e.message); }
    if (reserva) {
        if (saida.fichas.length > reserva) saida.fichas = saida.fichas.slice(0, reserva);
        await devolver(reserva - saida.fichas.length);
    }

    try {
        await db.collection('usoIA').add({
            uid: req.auth.uid, email, acao: pedido.acao, provedor: pedido.provedor, modelo: r.uso.modelo,
            entrada: r.uso.entrada, saida: r.uso.saida, fichas: saida.fichas.length, caracteresMaterial: pedido.material.length,
            em: FieldValue.serverTimestamp()
        });
    } catch (e) { console.warn('[criarEsquemaIA] não registrou o uso:', e.message); }

    return { acao: pedido.acao, fichas: saida.fichas, descartadas: saida.descartadas, observacoes: saida.observacoes, uso: r.uso, cota: await lerCota() };
});
