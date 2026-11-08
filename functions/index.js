// Cloud Functions d'A Salinha.
//
// criarEsquemaIA (chamável pelo app): planeja e gera fichas da seção
// "Esquemas e Tabelas" com IA (Claude ou Gemini). Fase 1: só a conta de
// administração (acessos/{e-mail}.papel == "admin"). As chaves das IAs ficam
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

exports.criarEsquemaIA = onCall({
    region: 'southamerica-east1',
    secrets: CLAUDE_LIGADO ? [CHAVE_CLAUDE, CHAVE_GEMINI] : [CHAVE_GEMINI],
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
    if (a.ativo !== true || a.papel !== 'admin') throw new HttpsError('permission-denied', 'Por enquanto, só a administração cria esquemas com IA.');

    let pedido;
    try { pedido = nucleo.validarPedido(req.data); }
    catch (e) { throw new HttpsError('invalid-argument', e.message); }

    if (pedido.provedor === 'claude' && !CLAUDE_LIGADO) throw new HttpsError('failed-precondition', 'O Claude ainda não foi configurado (falta a chave ANTHROPIC_API_KEY). Use o Gemini.');

    let r;
    try {
        if (pedido.provedor === 'claude') {
            const cliente = new Anthropic({ apiKey: CHAVE_CLAUDE.value(), timeout: 520000, maxRetries: 1 });
            r = await nucleo.chamarClaude(cliente, { modelo: CLAUDE_MODELO.value(), esforco: CLAUDE_ESFORCO.value() }, pedido);
        } else {
            r = await nucleo.chamarGemini(fetch, { modelo: GEMINI_MODELO.value(), chave: CHAVE_GEMINI.value() }, pedido);
        }
    } catch (e) {
        console.error('[criarEsquemaIA] falha:', pedido.provedor, e && e.status, e && e.message);
        const status = e && e.status;
        const msg = status === 401 ? 'A chave da IA foi recusada (confira o segredo no Secret Manager).'
            : status === 429 ? 'Limite de uso da IA atingido. Tente de novo em alguns minutos.'
            : (e && e.message) || 'Falha ao chamar a IA.';
        throw new HttpsError('internal', msg);
    }

    let saida;
    try { saida = nucleo.validarSaida(pedido.acao, r.json); }
    catch (e) { throw new HttpsError('internal', 'Resposta da IA fora do formato: ' + e.message); }

    try {
        await db.collection('usoIA').add({
            uid: req.auth.uid, email, acao: pedido.acao, provedor: pedido.provedor, modelo: r.uso.modelo,
            entrada: r.uso.entrada, saida: r.uso.saida, fichas: saida.fichas.length, caracteresMaterial: pedido.material.length,
            em: FieldValue.serverTimestamp()
        });
    } catch (e) { console.warn('[criarEsquemaIA] não registrou o uso:', e.message); }

    return { acao: pedido.acao, fichas: saida.fichas, descartadas: saida.descartadas, observacoes: saida.observacoes, uso: r.uso };
});
