#!/usr/bin/env node
// Revisão do acervo diante das novidades legislativas.
//
// Cruza os dispositivos de dados/leiseca/novidades.json (campo "arts") com as
// citações das questões (dados/bateriasvf) e dos esquemas (dados/esquemas),
// usando o próprio reconhecedor do app (LEGISLACAO.refsDoTexto, só citações
// explícitas: "art. 7º, XIII, da CF", "CP, art. 155"). O resultado é uma
// lista de trabalho para a administração, em relatorios/revisao-acervo.md:
// o que conferir e, se for o caso, corrigir e marcar com "atualizacoes"
// (ver LEIAME-firebase.md). O usuário final não vê nada disso.
//
// Uso: NODE_PATH=$(npm root -g) node ferramentas/revisao_acervo.js
//      (precisa do Playwright; sobe um servidor local só para a análise)

const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '..');
const SAIDA = path.join(RAIZ, 'relatorios', 'revisao-acervo.md');
// Itens já conferidos que NÃO precisaram de mudança: { "norma": ["id", ...] }.
// (Os corrigidos saem sozinhos, pelo campo "atualizacoes".)
const CONFERIDOS = path.join(RAIZ, 'ferramentas', 'revisao_acervo_conferidos.json');
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };

function servidor() {
    return new Promise((ok) => {
        const srv = http.createServer((req, res) => {
            const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
            const arq = path.join(RAIZ, rel);
            if (!arq.startsWith(RAIZ) || !fs.existsSync(arq) || fs.statSync(arq).isDirectory()) { res.writeHead(404); res.end(); return; }
            res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arq)] || 'application/octet-stream' });
            fs.createReadStream(arq).pipe(res);
        });
        srv.listen(0, '127.0.0.1', () => ok(srv));
    });
}

const lerJson = (rel) => JSON.parse(fs.readFileSync(path.join(RAIZ, rel), 'utf8'));
const semTags = (html) => String(html || '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/\s+/g, ' ');

function coletarItens() {
    const itens = [];
    for (const arq of fs.readdirSync(path.join(RAIZ, 'dados/bateriasvf')).filter((f) => f.endsWith('.json') && !/^indice/.test(f)).sort()) {
        for (const bat of lerJson('dados/bateriasvf/' + arq)) {
            for (const bloco of (bat.dados && bat.dados.blocos) || []) {
                for (const q of bloco.questoes || []) {
                    const alts = Array.isArray(q.alternativas) ? q.alternativas.map((a) => (typeof a === 'string' ? a : (a && (a.texto || a.t)) || '')).join(' \n ') : '';
                    itens.push({
                        tipo: 'questao', id: q.id, arquivo: 'dados/bateriasvf/' + arq,
                        rotulo: (bat.nome || '') + ' · questão ' + (q.numOrig || '?'),
                        criado: bat.dataCriacao || '', atualizacoes: q.atualizacoes || [],
                        textos: [q.enunciado, alts, q.explicacao].filter(Boolean).map(String),
                    });
                }
            }
        }
    }
    for (const arq of fs.readdirSync(path.join(RAIZ, 'dados/esquemas')).filter((f) => f.endsWith('.json')).sort()) {
        const d = lerJson('dados/esquemas/' + arq);
        for (const chave of Object.keys(d)) {
            for (const e of d[chave] || []) {
                itens.push({
                    tipo: 'esquema', id: e.id, arquivo: 'dados/esquemas/' + arq,
                    rotulo: e.titulo || e.id, criado: e.criadoEm || '', atualizacoes: e.atualizacoes || [],
                    textos: [semTags(e.conteudoHtml)],
                });
            }
        }
    }
    return itens;
}

// Arquivo de cada diploma (tabela DIPLOMAS do index.html).
function arquivosDiplomas() {
    const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8'), m = {}, re = /\b([A-Z][A-Za-z0-9]*):\s*\{\s*nome:\s*'[^']*',\s*arquivo:\s*'([^']+)'/g;
    let x;
    while ((x = re.exec(html))) if (!m[x[1]]) m[x[1]] = x[2];
    return m;
}
const normNorma = (t) => String(t || '').replace(/[\s.]/g, '').toLowerCase();

// Dispositivos que a norma alterou no artigo (nós com "alt" que a cita):
// lista de [par, inc, ali]; null = o artigo todo (caput alterado ou incluído).
function alterados(art, norma) {
    if (!art) return [];
    const bate = (no) => no && no.alt && normNorma(no.alt).indexOf(normNorma(norma)) >= 0;
    if (bate(art)) return null;
    const out = [];
    const incs = (obj, par) => Object.keys((obj && obj.inc) || {}).forEach((i) => {
        const no = obj.inc[i];
        if (bate(no)) out.push([par, i, '']);
        Object.keys(no.ali || {}).forEach((a) => { if (bate(no.ali[a])) out.push([par, i, a]); });
    });
    incs(art, '');
    Object.keys(art.par || {}).forEach((p) => {
        if (bate(art.par[p])) out.push([p, '', '']);
        incs(art.par[p], p);
    });
    return out;
}

// A citação (par, inc, ali) alcança algum dispositivo alterado?
// 'preciso' = cita o próprio dispositivo (ou algo dentro dele, ou que não
// existe mais no artigo); 'artigo' = só "art. N", sem parágrafo nem inciso.
function alcance(cit, lista, art) {
    if (lista === null) return 'preciso';
    if (!lista.length) return null;
    const [par, inc, ali] = cit;
    if (!par && !inc) return 'artigo';
    const pars = par ? par.split(',') : [''], incs2 = inc ? inc.split(',') : [''];
    for (const P of pars) {
        if (P && P !== 'pu' && !(art.par && art.par[P])) return 'preciso';          // § que não existe mais
        if (P === 'pu' && !(art.par && art.par.pu)) return 'preciso';               // parágrafo único renumerado
        for (const I of incs2) {
            for (const [lp, li, la] of lista) {
                const pOk = (P === 'pu' ? '' : P) === lp || (!P && !I);
                if (!pOk) continue;
                if (!I) return 'preciso';                                           // cita o § inteiro
                if (I === li && (!ali || !la || ali === la)) return 'preciso';
            }
        }
    }
    return null;
}

(async () => {
    const novidades = lerJson('dados/leiseca/novidades.json').novidades || [];
    const arquivos = arquivosDiplomas(), cacheLei = {};
    const artigoDe = (id, art) => {
        if (!(id in cacheLei)) cacheLei[id] = arquivos[id] && fs.existsSync(path.join(RAIZ, arquivos[id])) ? lerJson(arquivos[id]) : null;
        return cacheLei[id] && cacheLei[id].artigos ? cacheLei[id].artigos[art] : null;
    };
    const mudou = {}; // novidade.id + "|" + "ID|art" -> lista de alterados (ou null = artigo todo)
    for (const n of novidades) for (const [id, art] of n.arts || []) {
        const a = artigoDe(id, art);
        // Sem o texto ou sem marcas "alt" da norma: trata como artigo todo.
        const l = a ? alterados(a, n.norma) : null;
        mudou[n.id + '|' + id + '|' + art] = l && l.length === 0 ? null : l;
    }
    const alvo = {}; // "CF|7" -> [novidade]
    for (const n of novidades) for (const [id, art] of n.arts || []) (alvo[id + '|' + art] = alvo[id + '|' + art] || []).push(n);
    const itens = coletarItens();
    const conferidos = fs.existsSync(CONFERIDOS) ? JSON.parse(fs.readFileSync(CONFERIDOS, 'utf8')) : {};
    const jaConferido = (n, id) => (conferidos[n.norma] || []).indexOf(id) >= 0;
    let nConferidos = 0;

    const srv = await servidor();
    const navegador = await chromium.launch();
    const pagina = await navegador.newPage();
    await pagina.goto('http://127.0.0.1:' + srv.address().port + '/index.html?lab=1');
    await pagina.waitForFunction(() => window.LEGISLACAO && typeof window.LEGISLACAO.refsDoTexto === 'function', null, { timeout: 30000 });

    // Só as chaves "ID|art" interessam; o recorte de contexto sai daqui.
    const achados = await pagina.evaluate(({ itens, chaves }) => {
        const quer = new Set(chaves), out = [];
        itens.forEach((it, i) => {
            it.textos.forEach((t) => {
                let refs = [];
                try { refs = window.LEGISLACAO.refsDoTexto(t) || []; } catch (e) { refs = []; }
                refs.forEach((r) => {
                    const p = String(r.chave || '').split('|'), k = p[0] + '|' + p[1];
                    if (!quer.has(k)) return;
                    const ini = Math.max(0, r.ini - 90), fim = Math.min(t.length, r.fim + 90);
                    out.push({ i, k, chave: r.chave, trecho: (ini ? '…' : '') + t.slice(ini, fim).trim() + (fim < t.length ? '…' : '') });
                });
            });
        });
        return out;
    }, { itens: itens.map((it) => ({ textos: it.textos })), chaves: Object.keys(alvo) });
    await navegador.close();
    srv.close();

    // Agrupa: novidade → item → trechos.
    const porNovidade = new Map();
    for (const a of achados) {
        const it = itens[a.i];
        for (const n of alvo[a.k]) {
            // Já marcado como atualizado por essa norma: sai da lista.
            if ((it.atualizacoes || []).some((u) => u && u.ref && u.ref.replace(/\s/g, '').indexOf(n.norma.replace(/\s/g, '')) >= 0)) continue;
            if (jaConferido(n, it.id)) { nConferidos++; continue; }
            const p = a.chave.split('|');
            const nivel = alcance([p[2] || '', p[3] || '', p[4] || ''], mudou[n.id + '|' + a.k], artigoDe(p[0], p[1]) || {});
            if (!nivel) continue;
            if (!porNovidade.has(n.id)) porNovidade.set(n.id, { n, itens: new Map() });
            const g = porNovidade.get(n.id).itens;
            if (!g.has(a.i)) g.set(a.i, { it, refs: new Set(), trechos: [], preciso: false });
            const e = g.get(a.i);
            if (nivel === 'preciso' && !e.preciso) { e.preciso = true; e.trechos = []; }
            if (nivel !== 'preciso' && e.preciso) continue;
            e.refs.add(a.chave.split('|').filter(Boolean).slice(1).join(', '));
            if (e.trechos.length < 2 && !e.trechos.includes(a.trecho)) e.trechos.push(a.trecho);
        }
    }

    const ordem = novidades.filter((n) => porNovidade.has(n.id));
    const contar = (f) => ordem.reduce((s, n) => s + [...porNovidade.get(n.id).itens.values()].filter(f).length, 0);
    const total = contar((e) => e.preciso), genericos = contar((e) => !e.preciso);
    const descrever = (n) => (n.arts || []).map(([id, art]) => {
        const l = mudou[n.id + '|' + id + '|' + art];
        if (l === null) return id + ' art. ' + art;
        return id + ' art. ' + art + ' (' + l.map(([p, i, a]) => [p ? (p === 'pu' ? 'p.ú.' : '§ ' + p) : '', i, a].filter(Boolean).join(', ') || 'caput').join('; ') + ')';
    }).join('; ');
    const linhas = [];
    linhas.push('# Revisão do acervo: itens que citam dispositivos alterados');
    linhas.push('');
    linhas.push('Gerado por `ferramentas/revisao_acervo.js` em ' + new Date().toISOString().slice(0, 10) + '. Lista de trabalho só da administração: o usuário não vê nada disto.');
    linhas.push('');
    linhas.push('Para cada novidade de `dados/leiseca/novidades.json`, as questões e esquemas que citam explicitamente o artigo alterado. Confira se o conteúdo ainda está certo; se precisar corrigir, corrija e acrescente `atualizacoes` ao item (com `ref` contendo a norma, ex. "EC 141/2026"), e ele sai desta lista na próxima execução.');
    linhas.push('');
    linhas.push('**' + total + '** itens citam o próprio dispositivo alterado (' + itens.length + ' analisados; ocorrências já conferidas e corretas, listadas em ferramentas/revisao_acervo_conferidos.json, ficam de fora). Outros **' + genericos + '** citam só o número do artigo e ficam no fim de cada seção, sem trecho. Itens criados depois do ano da norma vêm com 🆗 (provavelmente já a refletem).');
    linhas.push('');
    for (const n of ordem) {
        const g = porNovidade.get(n.id);
        const todos = [...g.itens.values()].sort((a, b) => (a.it.tipo + a.it.rotulo).localeCompare(b.it.tipo + b.it.rotulo));
        const lista = todos.filter((e) => e.preciso), gen = todos.filter((e) => !e.preciso);
        linhas.push('## ' + n.norma + ': ' + n.titulo + ' (' + lista.length + (gen.length ? ' + ' + gen.length + ' só o artigo' : '') + ')');
        linhas.push('');
        linhas.push('Alterados: ' + descrever(n));
        linhas.push('');
        for (const e of lista) {
            const ano = parseInt(String(e.it.criado).slice(0, 4), 10);
            const depois = ano && n.ano && ano > n.ano ? ' 🆗' : '';
            linhas.push('- ' + (e.it.tipo === 'questao' ? '❓ ' : '🧩 ') + '**' + e.it.rotulo.replace(/\*/g, '') + '**' + depois + ' (art. ' + [...e.refs].join('; ') + ') · `' + e.it.id + '` · ' + e.it.arquivo);
            for (const t of e.trechos) linhas.push('  > ' + t.replace(/\n/g, ' '));
        }
        if (gen.length) {
            linhas.push('');
            linhas.push('<details><summary>Citam só o artigo (' + gen.length + ')</summary>');
            linhas.push('');
            for (const e of gen) linhas.push('- ' + (e.it.tipo === 'questao' ? '❓ ' : '🧩 ') + e.it.rotulo.replace(/\*/g, '') + ' · `' + e.it.id + '`');
            linhas.push('');
            linhas.push('</details>');
        }
        linhas.push('');
    }
    fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
    fs.writeFileSync(SAIDA, linhas.join('\n'));
    console.log(total + ' ocorrências em ' + ordem.length + ' novidades → ' + path.relative(RAIZ, SAIDA));
})().catch((e) => { console.error(e); process.exit(1); });
