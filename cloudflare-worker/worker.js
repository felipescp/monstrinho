// ─────────────────────────────────────────────────────────────────────────
// RELAY CORS — GitHub OAuth Device Flow (Monstrinho / A Salinha)
// ─────────────────────────────────────────────────────────────────────────
// Usado pelo botão "🔑 Entrar com GitHub" do Monstrinho. Não guarda nem
// precisa de client_secret — o Device Flow foi desenhado justamente pra
// apps que não conseguem proteger um segredo (SPA/CLI), e o GitHub confirma
// isso na própria documentação: "The client_secret is not needed for the
// device flow."
//
// A ÚNICA razão desse Worker existir é contornar o CORS: o navegador não
// consegue chamar github.com/login/device/code nem
// github.com/login/oauth/access_token diretamente — o próprio GitHub não
// envia os cabeçalhos de CORS necessários nesses endpoints. Este Worker só
// repassa a requisição (server-to-server, sem CORS) e devolve a resposta
// com os cabeçalhos que o navegador exige.
//
// Nada aqui é segredo — este arquivo pode ficar público sem risco.
//
// ── CONFIGURAÇÃO (Cloudflare Dashboard → Workers → este Worker →
//    Settings → Variables and Secrets) ──
//   GITHUB_CLIENT_ID  — Client ID do OAuth App (github.com → Settings →
//                       Developer settings → OAuth Apps → Monstrinho).
//                       Não é segredo, mas fica travado aqui (nunca aceita
//                       o client_id vindo do front-end) pra este proxy só
//                       servir esse único app, mesmo sendo público.
//   ALLOWED_ORIGIN    — origem exata onde o Monstrinho está hospedado
//                       (ex.: "https://felipescp.github.io"), pra nenhum
//                       outro site conseguir usar este Worker como proxy
//                       CORS genérico.
// ─────────────────────────────────────────────────────────────────────────

const GITHUB_DEVICE_CODE_URL = 'https://github.com/login/device/code';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

function corsHeaders(origemPermitida) {
    return {
        'Access-Control-Allow-Origin': origemPermitida || '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
}

async function repassarParaGithub(urlDestino, camposCorpo, clientId) {
    let params = new URLSearchParams(camposCorpo);
    params.set('client_id', clientId); // sempre o do env — nunca o que o cliente mandar
    let resposta = await fetch(urlDestino, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });
    let texto = await resposta.text();
    return { status: resposta.status, texto: texto };
}

export default {
    async fetch(request, env) {
        let headersCors = corsHeaders(env.ALLOWED_ORIGIN);

        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: headersCors });
        }

        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405, headers: headersCors });
        }

        if (!env.GITHUB_CLIENT_ID) {
            return new Response(JSON.stringify({ error: 'worker_sem_client_id_configurado' }), {
                status: 500,
                headers: Object.assign({ 'Content-Type': 'application/json' }, headersCors),
            });
        }

        let url = new URL(request.url);
        let corpoRecebido = {};
        try { corpoRecebido = await request.json(); } catch (e) { corpoRecebido = {}; }

        let destino, camposParaGithub;
        if (url.pathname === '/device/code') {
            destino = GITHUB_DEVICE_CODE_URL;
            // Escopo fixo — nunca deixa o front-end pedir outro além de "gist".
            camposParaGithub = { scope: 'gist' };
        } else if (url.pathname === '/token') {
            destino = GITHUB_TOKEN_URL;
            camposParaGithub = {
                device_code: corpoRecebido.device_code || '',
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
            };
        } else {
            return new Response('Not found', { status: 404, headers: headersCors });
        }

        try {
            let resultado = await repassarParaGithub(destino, camposParaGithub, env.GITHUB_CLIENT_ID);
            return new Response(resultado.texto, {
                status: resultado.status,
                headers: Object.assign({ 'Content-Type': 'application/json' }, headersCors),
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: 'falha_ao_contatar_github', detalhe: String(e && e.message || e) }), {
                status: 502,
                headers: Object.assign({ 'Content-Type': 'application/json' }, headersCors),
            });
        }
    },
};
