#!/usr/bin/env node
/*
 * Padroniza as citações de lei nos ESQUEMAS oficiais (dados/esquemas/*.json),
 * como ferramentas/normalizar_citacoes.js faz nas Explicações das baterias:
 * toda citação de artigo passa a trazer a lei de forma explícita, para que o
 * app ligue o artigo certo (balão com o texto da lei) — pedido explícito do
 * usuário, depois de ligar as referências nos Esquemas.
 *
 *   "(art. 10)."                        → "(art. 10 da Lei 8.429)."
 *   "Crime Típico (Artigo 16 do Estatuto)" → "… (Artigo 16 do Estatuto do Desarmamento)"
 *   "Arts. 70 a 72"                     → "Arts. 70 a 72 da Lei 11.101/2005"
 *
 * Só o TEXTO muda (nós de texto do conteudoHtml): tabelas, listas e
 * formatação ficam como estão. Usa o MESMO reconhecimento do app
 * (window.LEGISLACAO no index.html), no navegador do Playwright.
 *
 * De onde vem a lei de um artigo sem lei no trecho:
 *   1. a última lei citada antes no mesmo esquema (título e divisão contam);
 *   2. senão, a lei principal do esquema: a citada no nome da divisão ou no
 *      título, ou a que domina (≥ 40%) as citações explícitas do esquema —
 *      só se o dispositivo existir nela.
 * Esquema sobre ato fora da base (Resolução, Provimento, Regimento…) não usa
 * a lei dominante. Se (1) e (2) apontam leis diferentes que têm o mesmo
 * dispositivo, é ambíguo: não mexe (vai para o relatório). Depois de
 * reescrever, confere que cada citação passou a ser reconhecida, sem
 * contexto, com a mesma lei e o mesmo artigo; se não, mantém o original.
 *
 * Uso (na raiz do repositório):
 *   python3 -m http.server 8812 &            # se ainda não estiver rodando
 *   NODE_PATH=$(npm root -g) node ferramentas/normalizar_citacoes_esquemas.js           # só relatório
 *   NODE_PATH=$(npm root -g) node ferramentas/normalizar_citacoes_esquemas.js --gravar  # grava os arquivos
 * Relatório: relatorios/normalizacao-citacoes-esquemas.md
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '..');
const URL = process.env.SALINHA_URL || 'http://localhost:8812/index.html?lab=1';
const GRAVAR = process.argv.includes('--gravar');
const PASTA = 'dados/esquemas';

(async () => {
    const navegador = await chromium.launch();
    const pagina = await (await navegador.newContext()).newPage();
    await pagina.goto(URL);
    await pagina.waitForTimeout(2500);
    // Fora do site publicado o login não libera o acervo: busca direto do
    // servidor local (o mesmo arquivo que o app leria).
    await pagina.evaluate(() => {
        const ifr = document.createElement('iframe');
        document.body.appendChild(ifr);
        const f = ifr.contentWindow.fetch.bind(ifr.contentWindow);
        window.fetch = (u, o) => f(new URL(String(u), location.href).href, o);
    });
    const arquivos = {};
    fs.readdirSync(path.join(RAIZ, PASTA)).filter(n => n.endsWith('.json')).forEach(n => {
        arquivos[PASTA + '/' + n] = JSON.parse(fs.readFileSync(path.join(RAIZ, PASTA, n), 'utf8'));
    });

    const r = await pagina.evaluate(async (arquivos) => {
        const L = window.LEGISLACAO;
        const ids = new Set();
        Object.values(arquivos).forEach(d => Object.keys(d).forEach(k => (d[k] || []).forEach(e => {
            L.diplomasCitados(k + ' ' + e.titulo + ' ' + String(e.conteudoHtml || '').replace(/<[^>]+>/g, ' ')).forEach(i => ids.add(i));
        })));
        await Promise.all([...ids].map(id => Promise.race([L.carregar(id).catch(() => {}), new Promise(ok => setTimeout(ok, 30000))])));

        // Forma padrão de citar cada lei: "do CP", "da Lei 11.101/2005", "do Estatuto do Desarmamento".
        const forma = id => {
            if (id === 'L11101') return 'da Lei 11.101/2005';
            const nome = String(L.DIPLOMAS[id].nome).split(' (')[0];
            const fem = /^(Lei|LC|Resolu|LINDB|LCP|LEP|LEF|CF|CLT|LUG|Constitui|Conven|Declara)/.test(nome);
            return (fem ? 'da ' : 'do ') + nome;
        };
        // Anáfora depois do artigo ("desta Lei", "do mesmo Código", "do Estatuto"
        // sozinho): troca pela lei explícita em vez de acrescentar.
        const ANAFORA = /^(\s*,?\s*)(?:d[eo]st[ae]|d[oa]\s+mesm[oa]|d[oa]\s+(?:referid|citad|aludid|mencionad|nov|pr[óo]pri)[oa])\s+(?:Lei(?:\s+Complementar)?|lei|C[óo]digo|c[óo]digo|norma|diploma(?:\s+(?:normativo|legal))?|legisla[çc][ãa]o|Estatuto|estatuto|texto\s+legal|Carta)\b|^(\s*,?\s*)d[oa]\s+(?:Estatuto|C[óo]digo|Lei)\b(?!\s+(?:d[aeo]s?\b|n[ºo°.]|\d|Complementar|Org[âa]nica|Maria|Seca))/;
        const anteriorTexto = () => {};
        const chaveArt = x => x.chave.split('|').slice(0, 2).join('|');
        const rel = { esquemas: 0, textos: 0, alterados: 0, insercoes: 0, revertidos: 0, ambiguos: 0, partidas: 0, porArquivo: {}, exemplos: [], ambiguosEx: [], revertidosEx: [] };
        const saida = {};

        for (const caminho of Object.keys(arquivos)) {
            const dados = arquivos[caminho];
            let mudouArquivo = false;
            const est = rel.porArquivo[caminho] = { esquemas: 0, insercoes: 0 };
            for (const divisao of Object.keys(dados)) {
                for (const esq of (dados[divisao] || [])) {
                    if (!esq || typeof esq.conteudoHtml !== 'string' || !esq.conteudoHtml) continue;
                    rel.esquemas++;
                    const tpl = document.createElement('template');
                    tpl.innerHTML = esq.conteudoHtml;
                    const nos = [];
                    const w = document.createTreeWalker(tpl.content, NodeFilter.SHOW_TEXT);
                    while (w.nextNode()) nos.push(w.currentNode);
                    // Lei principal: a do nome da divisão/título e as que dominam as citações explícitas.
                    const cab = divisao + ' ; ' + (esq.titulo || '');
                    // Citações explícitas contadas trecho a trecho (no texto corrido, um "(Art. 35)"
                    // solto seria atribuído à lei citada logo antes, noutra célula).
                    const cont = {}; let tot = 0;
                    // Artigo citado com a lei no próprio esquema ("Ref.: arts. 23 do CP"): é a melhor
                    // prova de qual lei é um "(Art. 23)" solto em outra célula.
                    const leisDoArt = {};
                    nos.forEach(no => L.refsDoTexto(no.nodeValue || '').forEach(x => {
                        const [id, art] = x.chave.split('|'); cont[id] = (cont[id] || 0) + 1; tot++;
                        (leisDoArt[art] = leisDoArt[art] || new Set()).add(id);
                    }));
                    let pad = L.diplomasCitados(cab, null);
                    const foraDaBase = /Resolu[çc]|Recomenda[çc]|Provimento|Portaria|Instru[çc][ãa]o\s+Normativa|Regimento|[ÉE]tica|Decreto/i.test(esq.titulo || '');
                    if (!foraDaBase) Object.keys(cont).forEach(id => { if (tot && cont[id] / tot >= 0.4 && pad.indexOf(id) < 0) pad.push(id); });
                    // Mais citada primeiro (o padrão escolhe a 1ª lei em que o dispositivo existe).
                    pad = pad.sort((a, b) => (cont[b] || 0) - (cont[a] || 0));
                    // Esquema que cita lei fora da base com artigos próprios (CLT, Código
                    // Eleitoral, regimentos…): os artigos soltos podem ser dela — não deduz.
                    const citaForaDaBase = /\bCLT\b|Consolida[çc][ãa]o das Leis do Trabalho|C[óo]digo Eleitoral|\bCE\b|Regimento|\bRI(?:STF|STJ|TST|TSE)?\b/.test(cab + ' ' + tpl.content.textContent);
                    if (citaForaDaBase) { rel.esqForaDaBase = (rel.esqForaDaBase || 0) + 1; anteriorTexto(nos); continue; }
                    let anterior = cab, mudouEsq = false;
                    const trocas = [];
                    nos.forEach(no => {
                        const orig = no.nodeValue;
                        if (!orig || !/\d/.test(orig) || !/\b(?:[Aa]rts?\.|[Aa]rtigos?)\s*\d/.test(orig)) { anterior += '\n' + (orig || ''); return; }
                        rel.textos++;
                        let t = orig;
                        const explicitas = L.refsDoTexto(t);
                        const fora = x => !explicitas.some(y => y.ini < x.fim && x.ini < y.fim);
                        const porAnterior = L.refsDoTexto(t, { anterior, pularForaDaBase: true }).filter(fora);
                        const porPadrao = pad.length ? L.refsDoTexto(t, { padrao: pad }).filter(fora) : [];
                        // Junta as duas leituras; divergência com dispositivo nas duas leis = ambíguo.
                        const implicitas = [];
                        porAnterior.forEach(x => {
                            const p = porPadrao.find(y => y.ini === x.ini);
                            if (p && p.chave.split('|')[0] !== x.chave.split('|')[0]) {
                                rel.ambiguos++;
                                if (rel.ambiguosEx.length < 60) rel.ambiguosEx.push(esq.titulo + ' :: "' + t.slice(Math.max(0, x.ini - 40), x.fim + 20).replace(/\s+/g, ' ') + '" (' + x.chave.split('|')[0] + ' ou ' + p.chave.split('|')[0] + ')');
                                return;
                            }
                            // Só pela lei citada antes (sem confirmação pela lei principal): grava
                            // quando ela é a principal do esquema ou foi citada no mesmo trecho;
                            // senão fica implícita (o app ainda liga pelo contexto, na tela).
                            const idA = x.chave.split('|')[0];
                            if (!p && pad.indexOf(idA) < 0 && L.diplomasCitados(t.slice(0, x.ini), null).indexOf(idA) < 0) {
                                rel.semConfirmacao = (rel.semConfirmacao || 0) + 1;
                                if ((rel.semConfirmacaoEx = rel.semConfirmacaoEx || []).length < 40) rel.semConfirmacaoEx.push(esq.titulo + ' :: "' + t.slice(Math.max(0, x.ini - 40), x.fim + 20).replace(/\s+/g, ' ') + '" (' + idA + ')');
                                return;
                            }
                            implicitas.push(x);
                        });
                        porPadrao.forEach(y => { if (!porAnterior.some(x => x.ini === y.ini)) implicitas.push(y); });
                        // A lei com que o esquema cita o mesmo artigo prevalece; se o artigo aparece
                        // citado com mais de uma lei e nenhuma é a escolhida, é ambíguo.
                        for (let i = implicitas.length - 1; i >= 0; i--) {
                            const x = implicitas[i], partes = x.chave.split('|'), conj = leisDoArt[partes[1]];
                            if (!conj || conj.has(partes[0])) continue;
                            if (conj.size === 1) { partes[0] = [...conj][0]; x.chave = partes.join('|'); rel.pelaRef = (rel.pelaRef || 0) + 1; }
                            else { implicitas.splice(i, 1); rel.ambiguos++; }
                        }
                        // Sem pelo menos uma das leituras, a mesma posição pode ter entrado duas vezes.
                        for (let i = implicitas.length - 1; i > 0; i--) if (implicitas.slice(0, i).some(y => y.ini === implicitas[i].ini)) implicitas.splice(i, 1);
                        anterior += '\n' + orig;
                        if (!implicitas.length) return;
                        // Agrupa itens da mesma lista ("arts. 19 e 20") para citar a lei uma vez.
                        const grupos = [];
                        implicitas.sort((a, b) => a.ini - b.ini).forEach(x => {
                            const id = x.chave.split('|')[0], g = grupos[grupos.length - 1];
                            if (g && g.id === id && /^[\s,]*(?:e|a|ou)?[\s,]*$/i.test(t.slice(g.fim, x.ini))) { g.fim = Math.max(g.fim, x.fim); g.refs.push(x); }
                            else grupos.push({ id, ini: x.ini, fim: x.fim, refs: [x] });
                        });
                        let nIns = 0, feitos = [];
                        grupos.sort((a, b) => b.ini - a.ini).forEach(g => {
                            const depois = t.slice(g.fim), m = depois.match(ANAFORA);
                            // Texto de lei transcrito ("Art. 11. Constitui…", "Art. 3º As disposições…"): é o
                            // cabeçalho do artigo, não citação — fica como está.
                            if (/^\s*$/.test(t.slice(0, g.ini).split('\n').pop()) && /^Art\./.test(t.slice(g.ini)) && /^\.?\s+(?!d[aeo]s?\b)[A-ZÀ-Ú]/.test(depois)) { rel.transcritos = (rel.transcritos || 0) + 1; return; }
                            // A citação continua ("e § 3º", "alínea 'b'", "caput e"): não parte ao meio.
                            // Já vem com uma lei (fora da base, não reconhecida): "art. 83 do CE", "art. 22 da Res. 23.659".
                            if (!m && /^\s*,?\s*d[aoe]s?\s+(?:[A-ZÀ-Ú]|n[ºo°]\s*\d)/.test(depois)) { rel.comLeiDesconhecida = (rel.comLeiDesconhecida || 0) + 1; return; }
                            if (!m && (/^\s*,?\s*(?:e\s+|ou\s+)?(?:§|par[áa]grafos?\b|incisos?\b|al[íi]neas?\b|caput\b|['"“][a-z]['"”])/i.test(depois) || /^\s*,\s*[a-z](?![\wÀ-ÿ])/.test(depois)
                                // Intervalo ou complemento colado: "1.836-1.837", "I a V", "1ª parte", "arts. 5º e 6º".
                                || /^[ªº°\w\-–\/]/.test(depois) || /^\s*[-–\/]\s*\d/.test(depois) || /^\s*,?\s*(?:a|e|ou|até)\s+(?:[IVXL]+\b|\d)/.test(depois))) { rel.partidas++; return; }
                            if (m) t = t.slice(0, g.fim) + ' ' + forma(g.id) + depois.slice(m[0].length);
                            else t = t.slice(0, g.fim) + (/,/.test(t.slice(g.ini, g.fim)) ? ', ' : ' ') + forma(g.id) + depois;
                            nIns++; feitos.push(g);
                        });
                        if (t === orig) return;
                        // Conferência: sem contexto, cada citação agora é reconhecida com a mesma lei e artigo.
                        const depoisRefs = L.refsDoTexto(t);
                        const ok = feitos.every(g => g.refs.every(x => depoisRefs.some(y => chaveArt(y) === chaveArt(x))));
                        if (!ok) { rel.revertidos++; if (rel.revertidosEx.length < 40) rel.revertidosEx.push(esq.titulo + ' :: ' + orig.slice(0, 200)); return; }
                        trocas.push({ de: orig, para: t });
                        mudouEsq = true;
                        rel.alterados++; rel.insercoes += nIns; est.insercoes += nIns;
                        rel.exemplos.push({ esquema: esq.titulo, antes: orig, depois: t });
                    });
                    // Troca no HTML ORIGINAL (re-serializar o DOM acrescentaria <tbody>, mudaria
                    // entidades etc.): os trechos de texto entre tags, na ordem, são os nós de
                    // texto; só troca o trecho que decodifica exatamente para o texto original.
                    if (mudouEsq) {
                        const dec = document.createElement('textarea');
                        const esc = x => x.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                        const partes = esq.conteudoHtml.split(/(<[^>]*>)/);
                        let k = 0, feitas = 0;
                        for (let i = 0; i < partes.length && k < trocas.length; i += 2) {
                            if (!partes[i]) continue;
                            dec.innerHTML = partes[i];
                            if (dec.value !== trocas[k].de) continue;
                            // Só trechos sem entidades (o texto volta escapado do mesmo jeito).
                            if (esc(dec.value) === partes[i] || dec.value === partes[i]) { partes[i] = esc(trocas[k].para); feitas++; }
                            else rel.comEntidade = (rel.comEntidade || 0) + 1;
                            k++;
                        }
                        if (k < trocas.length) rel.naoAchados = (rel.naoAchados || 0) + trocas.length - k;
                        if (feitas) {
                            esq.conteudoHtml = partes.join('');
                            est.esquemas++;
                            mudouArquivo = true;
                        }
                    }
                }
            }
            if (mudouArquivo) saida[caminho] = dados;
        }
        return { rel, saida };
    }, arquivos);
    await navegador.close();

    const { rel, saida } = r;
    let md = '# Normalização das citações nos Esquemas\n\n';
    md += `Gerado por \`ferramentas/normalizar_citacoes_esquemas.js\`. Esquemas: ${rel.esquemas}; trechos com artigo: ${rel.textos}; trechos alterados: ${rel.alterados}; leis acrescentadas: ${rel.insercoes}; ambíguos (não mexidos): ${rel.ambiguos}; citações que continuam (não partidas): ${rel.partidas}; revertidos (não conferiram): ${rel.revertidos}.\n\n`;
    md += `Cabeçalhos de artigo transcritos (não mexidos): ${rel.transcritos || 0}. Sem confirmação (lei só pela citada antes, distante e fora da lei principal; ficaram implícitas): ${rel.semConfirmacao || 0}. Esquemas que citam CLT/Código Eleitoral/regimentos (não mexidos): ${rel.esqForaDaBase || 0}. Artigo já seguido de lei não reconhecida (não mexido): ${rel.comLeiDesconhecida || 0}. Lei corrigida pela citação explícita do mesmo artigo no esquema: ${rel.pelaRef || 0}.\n\n`;
    md += '## Por arquivo\n\n| Arquivo | Esquemas alterados | Leis acrescentadas |\n|---|---:|---:|\n';
    Object.keys(rel.porArquivo).sort().forEach(c => { const e = rel.porArquivo[c]; if (e.insercoes) md += `| ${c.replace(PASTA + '/', '')} | ${e.esquemas} | ${e.insercoes} |\n`; });
    md += '\n## Ambíguos (dispositivo em duas leis; ficaram como estavam)\n\n';
    rel.ambiguosEx.forEach(x => { md += '- ' + x + '\n'; });
    md += '\n## Sem confirmação (ficaram implícitas; amostra)\n\n';
    (rel.semConfirmacaoEx || []).forEach(x => { md += '- ' + x + '\n'; });
    md += '\n## Exemplos (trecho alterado)\n\n';
    rel.exemplos.forEach(e => {
        let i = 0; while (i < e.antes.length && e.antes[i] === e.depois[i]) i++;
        const ini = Math.max(0, i - 60);
        md += `- **${e.esquema}**: …${e.antes.slice(ini, i + 40).replace(/\n/g, ' ')}… → …${e.depois.slice(ini, i + 80).replace(/\n/g, ' ')}…\n`;
    });
    if (rel.alterados) {
        fs.mkdirSync(path.join(RAIZ, 'relatorios'), { recursive: true });
        fs.writeFileSync(path.join(RAIZ, 'relatorios/normalizacao-citacoes-esquemas.md'), md);
    }
    console.log(`Trechos com entidade HTML (não trocados): ${rel.comEntidade || 0} · não localizados: ${rel.naoAchados || 0}`);
    console.log(`Esquemas ${rel.esquemas} · trechos ${rel.textos} · alterados ${rel.alterados} · leis acrescentadas ${rel.insercoes} · ambíguos ${rel.ambiguos} · revertidos ${rel.revertidos} · arquivos ${Object.keys(saida).length}`);
    if (rel.revertidosEx.length) console.log('Revertidos (amostra):\n' + rel.revertidosEx.slice(0, 5).join('\n'));
    if (GRAVAR) {
        Object.keys(saida).forEach(c => {
            const bruto = fs.readFileSync(path.join(RAIZ, c), 'utf8');
            const ind = /^\{\n "/.test(bruto) ? 1 : 2;
            fs.writeFileSync(path.join(RAIZ, c), JSON.stringify(saida[c], null, ind) + (bruto.endsWith('\n') ? '\n' : ''));
        });
        console.log('Gravado.');
    }
})();
