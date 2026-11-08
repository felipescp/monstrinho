#!/usr/bin/env node
/*
 * Padroniza as citações de lei nas EXPLICAÇÕES das baterias oficiais
 * (dados/bateriasvf/, pelo manifesto), para que toda citação traga a lei de
 * forma explícita e o app ligue o artigo certo (balão com o texto da lei).
 *
 *   "(Art. 157, § 2º, inciso IV)"   → "(Art. 157, § 2º, inciso IV, do CP)"
 *   "o art. 88 desta Lei"           → "o art. 88 da Lei 11.101"
 *   "LRF" no sentido de falência    → "Lei 11.101/2005" ("LRF" fica só para a LC 101)
 *
 * Usa o MESMO reconhecimento do app (window.LEGISLACAO no index.html), no
 * navegador do Playwright. A lei de um artigo sem lei no trecho vem da última
 * lei citada antes no mesmo texto ou da lei principal da bateria (a do nome da
 * bateria, ou a que domina as citações, ≥ 40%), e só entra se o dispositivo
 * (artigo, parágrafo e inciso) existir naquela lei. Enunciados não são
 * alterados. Depois de reescrever, confere que cada citação passou a ser
 * reconhecida com a mesma lei; se não, mantém o texto original.
 *
 * Uso (na raiz do repositório):
 *   python3 -m http.server 8812 &            # se ainda não estiver rodando
 *   NODE_PATH=$(npm root -g) node ferramentas/normalizar_citacoes.js           # só relatório
 *   NODE_PATH=$(npm root -g) node ferramentas/normalizar_citacoes.js --gravar  # grava os arquivos
 * Relatório: relatorios/normalizacao-citacoes.md
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const RAIZ = path.resolve(__dirname, '..');
const URL = process.env.SALINHA_URL || 'http://localhost:8812/index.html';
const GRAVAR = process.argv.includes('--gravar');

(async () => {
    const navegador = await chromium.launch();
    const pagina = await (await navegador.newContext()).newPage();
    await pagina.goto(URL);
    await pagina.evaluate(() => window.__bootOficialPromise__);
    const caminhos = fs.readFileSync(path.join(RAIZ, 'dados/manifesto-baterias.txt'), 'utf8').split('\n').map(s => s.trim()).filter(Boolean);
    const arquivos = {};
    caminhos.forEach(c => { arquivos[c] = JSON.parse(fs.readFileSync(path.join(RAIZ, c), 'utf8')); });

    const r = await pagina.evaluate(async (arquivos) => {
        const L = window.LEGISLACAO;
        await Promise.all(Object.keys(L.DIPLOMAS).map(id => L.carregar(id).catch(() => {})));
        // Forma padrão de citar cada lei: "do CP", "da Lei 11.101", "da LC 101".
        const forma = id => {
            if (id === 'L11101') return 'da Lei 11.101/2005';
            const nome = String(L.DIPLOMAS[id].nome).split(' (')[0];
            const fem = /^(Lei|LC|Resolu|LINDB|LCP|LEP|LEF|CF|CLT|LUG|Constitui)/.test(nome);
            return (fem ? 'da ' : 'do ') + nome;
        };
        const reLRF = /\bL(?:RF|REF|FRE)\b/g;
        const contar = (t, re) => (t.match(re) || []).length;
        const ehFalencia = t => contar(t, /fal[êe]ncia|falid[oa]|recupera[çc][ãa]o\s+(?:judicial|extrajudicial)|massa\s+falida|recuperand|concursa|administrador\s+judicial|assembleia\s+(?:geral\s+)?de\s+credores|plano\s+de\s+recupera/gi);
        const ehFiscal = t => contar(t, /responsabilidade\s+fiscal|gest[ãa]o\s+fiscal|despesas?\s+(?:total\s+)?(?:com|de)\s+pessoal|receita\s+corrente|ente\s+(?:da\s+)?federa|or[çc]ament|endividamento|opera[çc][õo]es?\s+de\s+cr[ée]dito|restos\s+a\s+pagar|renúncia\s+de\s+receita|transfer[êe]ncias?\s+volunt/gi);
        const ANAFORA = /^(\s*,?\s*)(?:d[eo]st[ae]|d[oa]\s+mesm[oa]|d[oa]\s+(?:referid|citad|aludid|mencionad|nov|pr[óo]pri)[oa])\s+(?:Lei(?:\s+Complementar)?|lei|C[óo]digo|c[óo]digo|norma|diploma(?:\s+(?:normativo|legal))?|legisla[çc][ãa]o|Estatuto|estatuto|texto\s+legal|Carta)\b/;
        const rel = { textos: 0, alterados: 0, insercoes: 0, lrf: 0, revertidos: 0, porBateria: {}, exemplos: [], revertidosEx: [] };
        const saida = {};

        for (const caminho of Object.keys(arquivos)) {
            const lista = Array.isArray(arquivos[caminho]) ? arquivos[caminho] : (arquivos[caminho].data || []);
            let mudouArquivo = false;
            for (const bt of lista) {
                const Dd = bt.dados;
                if (!Dd || !Dd.blocos) continue;
                // Lei principal: a do nome/caminho e as que dominam (≥ 40%) as citações.
                window._lsAssocCache = null;
                const refsBat = window._refsLeiSecaDaBateria(bt.id, Dd);
                const cont = {}; let tot = 0;
                Object.keys(refsBat).forEach(id => { let n = 0; Object.values(refsBat[id]).forEach(v => n += v); cont[id] = n; tot += n; });
                const nomeBat = (bt.nome || '') + ' ; ' + (bt.caminho_completo || '');
                const lrfBat = cont.L11101 > (cont.LC101 || 0) || /fal[êe]ncia|recupera[çc][ãa]o/i.test(nomeBat) ? 'L11101' : (cont.LC101 || /fiscal|financeir/i.test(nomeBat) ? 'LC101' : null);
                const pad = L.diplomasCitados(nomeBat, lrfBat);
                // Bateria sobre ato fora da base (Resoluções CNMP, Código de Ética…):
                // os artigos sem lei são desse ato — não usa a lei dominante.
                const foraDaBase = /Resolu[çc]|Recomenda[çc]|Provimento|Portaria|Instru[çc][ãa]o\s+Normativa|Regimento|[ÉE]tica/i.test(nomeBat);
                if (!foraDaBase) Object.keys(cont).sort((a, b) => cont[b] - cont[a]).forEach(id => { if (tot && cont[id] / tot >= 0.4 && pad.indexOf(id) < 0) pad.push(id); });
                const est = rel.porBateria[bt.nome] = { padrao: pad.join(', '), insercoes: 0, lrf: 0 };

                Dd.blocos.forEach(bl => (bl.questoes || []).forEach(q => {
                    if (!q || typeof q.explicacao !== 'string' || !q.explicacao) return;
                    rel.textos++;
                    const orig = q.explicacao;
                    let t = orig;
                    // 1) LRF no sentido de falência → Lei 11.101/2005.
                    const fal = ehFalencia(t), fis = ehFiscal(t);
                    const lrf = fal > fis ? 'L11101' : fis > fal ? 'LC101' : lrfBat;
                    let nLrf = 0;
                    if (lrf === 'L11101') t = t.replace(reLRF, () => { nLrf++; return 'Lei 11.101/2005'; });
                    // 2) Artigo sem lei no trecho → lei explícita.
                    const explicitas = L.refsDoTexto(t);
                    const comCtx = L.refsDoTexto(t, { padrao: pad, lrf: 'LC101' });
                    const implicitas = comCtx.filter(x => !explicitas.some(y => y.ini < x.fim && x.ini < y.fim));
                    // Agrupa itens da mesma lista ("arts. 19 e 20") para citar a lei uma vez.
                    const grupos = [];
                    implicitas.sort((a, b) => a.ini - b.ini).forEach(x => {
                        const id = x.chave.split('|')[0], g = grupos[grupos.length - 1];
                        if (g && g.id === id && /^[\s,]*(?:e|a|ou)?[\s,]*$/i.test(t.slice(g.fim, x.ini))) { g.fim = Math.max(g.fim, x.fim); g.refs.push(x); }
                        else grupos.push({ id, ini: x.ini, fim: x.fim, refs: [x] });
                    });
                    let nIns = 0, partida = false;
                    grupos.sort((a, b) => b.ini - a.ini).forEach(g => {
                        const depois = t.slice(g.fim), m = depois.match(ANAFORA);
                        // A citação continua ("e § 3º", "alínea 'b'", "caput e"): não parte ao meio.
                        if (!m && /^\s*,?\s*(?:e\s+|ou\s+)?(?:§|par[áa]grafos?\b|incisos?\b|al[íi]neas?\b|caput\b|['"“][a-z]['"”])/i.test(depois)) { partida = true; return; }
                        if (m) t = t.slice(0, g.fim) + ' ' + forma(g.id) + depois.slice(m[0].length);
                        else t = t.slice(0, g.fim) + (/,/.test(t.slice(g.ini, g.fim)) ? ', ' : ' ') + forma(g.id) + depois;
                        nIns++;
                    });
                    if (partida) rel.partidas = (rel.partidas || 0) + 1;
                    if (t === orig) return;
                    // 3) Conferência: cada citação implícita agora é explícita, com a mesma lei.
                    const depoisRefs = L.refsDoTexto(t);
                    const ok = implicitas.every(x => depoisRefs.some(y => y.chave.split('|').slice(0, 2).join('|') === x.chave.split('|').slice(0, 2).join('|')));
                    if (!ok) { rel.revertidos++; if (rel.revertidosEx.length < 40) rel.revertidosEx.push(bt.nome + ' :: ' + orig.slice(0, 300)); return; }
                    q.explicacao = t;
                    mudouArquivo = true;
                    rel.alterados++; rel.insercoes += nIns; rel.lrf += nLrf; est.insercoes += nIns; est.lrf += nLrf;
                    if (rel.exemplos.length < 400) rel.exemplos.push({ bateria: bt.nome, antes: orig, depois: t });
                }));
            }
            if (mudouArquivo) saida[caminho] = arquivos[caminho];
        }
        return { rel, saida };
    }, arquivos);
    await navegador.close();

    const { rel, saida } = r;
    // Relatório
    let md = '# Normalização das citações nas Explicações\n\n';
    md += `Gerado por \`ferramentas/normalizar_citacoes.js\`. Textos: ${rel.textos}; alterados: ${rel.alterados}; leis acrescentadas: ${rel.insercoes}; "LRF" → "Lei 11.101/2005": ${rel.lrf}; revertidos (não conferiram): ${rel.revertidos}.\n\n`;
    md += '## Por bateria\n\n| Bateria | Lei principal | Leis acrescentadas | LRF → Lei 11.101 |\n|---|---|---:|---:|\n';
    Object.keys(rel.porBateria).filter(n => rel.porBateria[n].insercoes || rel.porBateria[n].lrf).sort().forEach(n => {
        const e = rel.porBateria[n]; md += `| ${n} | ${e.padrao || '—'} | ${e.insercoes} | ${e.lrf} |\n`;
    });
    md += '\n## Exemplos (trecho alterado)\n\n';
    rel.exemplos.slice(0, 120).forEach(e => {
        let i = 0; while (i < e.antes.length && e.antes[i] === e.depois[i]) i++;
        const ini = Math.max(0, i - 60);
        md += `- **${e.bateria}**: …${e.antes.slice(ini, i + 60).replace(/\n/g, ' ')}… → …${e.depois.slice(ini, i + 80).replace(/\n/g, ' ')}…\n`;
    });
    // Sem nada a mudar (acervo já padronizado), mantém o relatório da última padronização.
    if (rel.alterados) {
        fs.mkdirSync(path.join(RAIZ, 'relatorios'), { recursive: true });
        fs.writeFileSync(path.join(RAIZ, 'relatorios/normalizacao-citacoes.md'), md);
    }
    console.log(`Textos ${rel.textos} · alterados ${rel.alterados} · leis acrescentadas ${rel.insercoes} · LRF→Lei 11.101 ${rel.lrf} · revertidos ${rel.revertidos} · arquivos ${Object.keys(saida).length}`);
    if (rel.revertidosEx.length) console.log('Revertidos (amostra):\n' + rel.revertidosEx.slice(0, 5).join('\n'));
    if (GRAVAR) {
        Object.keys(saida).forEach(c => fs.writeFileSync(path.join(RAIZ, c), JSON.stringify(saida[c], null, 2)));
        console.log('Gravado.');
    }
})();
