"""Diagnóstico das Conexões da Jurisprudência (base oficial em dados/jurisprudencia).

Replica a lógica do app (JURISPRUDENCIA_RUNTIME._refsDoTexto / _chavesDaFicha /
_tribunalDoContexto e window.LEGISLACAO.refsDoTexto) e lista o que impede ou pode
distorcer o vínculo conexão → ficha do acervo (listas A a H) e conexão → dispositivo
da lei seca em dados/legislacao (listas I a K).
Uso: python3 relatorios/diagnostico_conexoes.py  (gera .md e .json ao lado)
"""
import json, glob, re, os, collections

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RE_PROC = re.compile(r'\b((?:(?:AgRg|AgInt|EDcl|ED|EREsp|EAREsp)\s+(?:n[oa]s?\s+)?)*(ADI|ADC|ADO|ADPF|RE|ARE|REsp|AREsp|EREsp|EAREsp|HC|RHC|MS|RMS|MI|Rcl|RCL|CC|Pet|Inq|AP|APn|IAC|IRDR|RCD|AI|ACO|AO|SLS|SL|STP|SS|RO|AR|IF|PUIL|Ext|SEC|HDE|CR|PSV|Ag|Recurso\s+Especial|Recurso\s+Extraordin[áa]rio))(?:\s*n[º°o.]*)?\s*(\d{1,3}(?:\.\d{3})+|\d+)(?:\s*[\/-]\s*[A-Z]{2}\b)?')
RE_ENUN = re.compile(r'\b(S[úu]mulas?\s+Vinculantes?|SVs?|S[úu]mulas?|Temas?)(?:\s+n[º°o.]*)?\s+(\d{1,4}(?:\.\d{3})?(?:\s*(?:,|\be\b)\s*\d{1,4}(?:\.\d{3})?)*)(?:\s*(?:[\/–-]\s*|(?:d[oa]|no|na|de)\s+(?:[oa]\s+)?|,\s*(?=[Rr]epercuss|[Rr]ecursos?\s+[Rr]epetitiv|[Rr]epetitiv))(STF|STJ|TSE|TST|[Rr]epercuss[ãa]o\s+[Gg]eral|RG|[Rr]ecursos?\s+[Rr]epetitivos?|[Rr]epetitivos?)\b)?')

def tribunal_do_contexto(texto, ini):
    # Igual a JURISPRUDENCIA_RUNTIME._tribunalDoContexto.
    antes = texto[:ini]
    m = re.search(r'\b(RE|ARE|AI|REsp|AREsp)\s*n?[º°o.]*\s*\d[\d.]*(?:\s*[\/-]\s*[A-Z]{2})?\s*\(\s*$', antes)
    if m: return 'STF' if m.group(1) in ('RE', 'ARE', 'AI') else 'STJ'
    m = re.match(r'^\s*\(?\s*(?:ver\s+tamb[ée]m:\s*)?(STF|STJ|TSE)\b', antes[antes.rfind(';') + 1:])
    return m.group(1) if m else ''

def chave_proc(classe, num):
    c = re.sub(r'\s+', ' ', classe).strip()
    if re.match(r'^recurso especial$', c, re.I): c = 'REsp'
    elif re.match(r'^recurso extraordin', c, re.I): c = 'RE'
    return c.upper() + ' ' + num.replace('.', '')

def refs(texto):
    texto = texto or ''
    out = [(m.start(), m.end(), chave_proc(m.group(2), m.group(3)), m.group(0)) for m in RE_PROC.finditer(texto)]
    for m in RE_ENUN.finditer(texto):
        tipo = 'SV' if re.search(r'vinculante|^SV', m.group(1), re.I) else ('SUM' if m.group(1)[0] in 'Ss' else 'TEMA')
        trib = m.group(3) or ''
        if re.search(r'repercuss|^RG$', trib, re.I): trib = 'STF'
        elif re.search(r'repetitiv', trib, re.I): trib = 'STJ'
        if not trib and tipo != 'SV': trib = tribunal_do_contexto(texto, m.start())
        trib = trib.upper() or '?'
        for n in re.findall(r'\d{1,4}(?:\.\d{3})?', m.group(2)):
            n = n.replace('.', '')
            out.append((m.start(), m.end(), 'SV ' + n if tipo == 'SV' else '%s %s %s' % (tipo, trib, n), m.group(0)))
    return out

def chaves_ficha(f):
    out = [r[2] for r in refs(f.get('processo', '')) if not r[2].startswith(('SV', 'SUM', 'TEMA'))]
    proc, trib = f.get('processo', ''), (f.get('tribunal') or '').upper()
    m = re.match(r'^\s*SV\s*(\d+)', proc, re.I)
    if m or (re.search('vinculante', f.get('sistematica') or '', re.I) and re.search(r'(\d+)', proc)):
        out.append('SV ' + (m or re.search(r'(\d+)', proc)).group(1))
    else:
        m = re.search(r'S[úu]mula\s+(\d+)\s*(?:[\/-]\s*(STF|STJ|TSE|TST))?', proc, re.I)
        if m: out.append('SUM %s %s' % ((m.group(2) or trib).upper(), m.group(1)))
    # IAC: chave "IAC N", como no app (não "TEMA STJ N", que colide com o repetitivo).
    iac = (f.get('sistematica') or '').strip().lower() == 'iac'
    if f.get('tema') and (trib or iac):
        for n in re.findall(r'\d{1,4}(?:\.\d{3})?', str(f['tema'])):
            out.append('IAC %s' % n.replace('.', '') if iac else 'TEMA %s %s' % (trib, n.replace('.', '')))
    return out

fichas = []
for arq in sorted(glob.glob(os.path.join(RAIZ, 'dados/jurisprudencia/*.json'))):
    for ch, lista in json.load(open(arq, encoding='utf8')).items():
        if isinstance(lista, list):
            for f in lista: f['_arquivo'] = os.path.basename(arq); f['_chave'] = ch; fichas.append(f)

idx = collections.defaultdict(list)
for f in fichas:
    for k in set(chaves_ficha(f)): idx[k].append(f)

def candidatos(k):
    p = k.split(' ')
    if len(p) == 3 and p[1] == '?': return [f for t in ('STF', 'STJ', 'TSE', 'TST') for f in idx.get('%s %s %s' % (p[0], t, p[2]), [])]
    return idx.get(k, [])

def ident(f): return {'id': f['id'], 'processo': f.get('processo', ''), 'tribunal': f.get('tribunal', ''), 'arquivo': f['_arquivo']}

sem_tribunal, nao_encontrados, tribunal_trocado = [], collections.defaultdict(list), []
total_refs = ligadas = 0
for f in fichas:
    for ini, fim, k, trecho in refs(f.get('conexoes')):
        total_refs += 1
        c = [x for x in candidatos(k) if x['id'] != f['id']]
        if c: ligadas += 1
        if ' ? ' in k:
            sem_tribunal.append(dict(ident(f), trecho=trecho, chave=k, candidatos=[ident(x) for x in c]))
        elif not c:
            nao_encontrados[k].append(dict(ident(f), trecho=trecho))
            p = k.split(' ')
            if p[0] in ('SUM', 'TEMA'):
                outros = [x for t in ('STF', 'STJ', 'TSE') if t != p[1] for x in idx.get('%s %s %s' % (p[0], t, p[2]), [])]
                if outros: tribunal_trocado.append(dict(ident(f), trecho=trecho, chave=k, existe_em=sorted({x['tribunal'] for x in outros})))

sist_sem_tema = [dict(ident(f), sistematica=f.get('sistematica')) for f in fichas if f.get('sistematica') in ('Repercussão Geral', 'Recurso Repetitivo') and not str(f.get('tema') or '').strip()]
tema_trib_errado = [dict(ident(f), tema=f.get('tema'), sistematica=f.get('sistematica')) for f in fichas if f.get('tema') and ((f.get('sistematica') == 'Repercussão Geral' and f.get('tribunal') != 'STF') or (f.get('sistematica') == 'Recurso Repetitivo' and f.get('tribunal') != 'STJ'))]
proc_sem_chave = [ident(f) for f in fichas if not chaves_ficha(f)]
sumula_sem_trib = [ident(f) for f in fichas if re.search(r'S[úu]mula', f.get('sistematica') or '') and 'vinculante' not in (f.get('sistematica') or '').lower() and not re.search(r'S[úu]mula\s+\d+\s*[\/-]\s*(STF|STJ|TSE|TST)', f.get('processo', ''), re.I)]
duplicadas = {k: [ident(f) for f in v] for k, v in idx.items() if len(v) > 1 and (k.startswith('SV') or k.startswith('SUM'))}

ranking = sorted(nao_encontrados.items(), key=lambda kv: -len(kv[1]))

# ---------------------------------------------------------------------------
# Lei seca: citações de dispositivos ("art. 155, § 4º, I, do CP") nas Conexões.
# Replica window.LEGISLACAO.refsDoTexto do index.html: as expressões (DIPLOMAS,
# RE_OUTROS, RE_LISTA, RE_ITEM) são lidas do próprio index.html, para não divergir.
# ---------------------------------------------------------------------------
HTML = open(os.path.join(RAIZ, 'index.html'), encoding='utf8').read()
BLOCO = HTML[HTML.index('window.LEGISLACAO = (function()'):]
BLOCO = BLOCO[:BLOCO.index('function refsDoTexto')]

def js_re(fonte, flags=''):
    # \b, \w e \d do JS são ASCII; em Python, re.ASCII reproduz isso ("5º" etc.).
    return re.compile(fonte, re.ASCII | (re.I if 'i' in flags else 0))

DIPLOMAS = {}
for m in re.finditer(r"\n\s*(\w+): \{ nome: '([^']*)', arquivo: '([^']*)'(.*?)\n?\s*re: /(.+?)/([gimsuy]*) \},?(?=\n)", BLOCO, re.S):
    ident_, nome, arq, resto, fonte, fl = m.groups()
    DIPLOMAS[ident_] = {'nome': nome, 'arquivo': arq, 'anexo': 'anexo: true' in resto, 're': js_re(fonte, fl)}
def _re_let(nome):
    m = re.search(r'let %s = /(.+?)/([gimsuy]*);\n' % nome, BLOCO)
    return js_re(m.group(1), m.group(2))
RE_OUTROS, RE_LISTA, RE_ITEM_LEI = _re_let('RE_OUTROS'), _re_let('RE_LISTA'), _re_let('RE_ITEM')
RE_ITEM_ANEXO = js_re(r'\b(?:[Ss]ub)?[Ii]te(?:m|ns)\s+(\d{1,2}(?:\.\d{2})?)((?:\s*(?:,|\be\b)\s*\d{1,2}(?:\.\d{2})?)*)')
LEIS = {}
def lei(ident_):
    if ident_ not in LEIS:
        try: LEIS[ident_] = json.load(open(os.path.join(RAIZ, DIPLOMAS[ident_]['arquivo']), encoding='utf8'))
        except Exception: LEIS[ident_] = {'artigos': {}}
    return LEIS[ident_]

def mencoes(seg):
    out = []
    for ident_, d in DIPLOMAS.items():
        out += [(m.start(), m.end(), ident_, m.group(0)) for m in d['re'].finditer(seg)]
    for m in RE_OUTROS.finditer(seg):
        if not any(x[0] < m.end() and m.start() < x[1] for x in out): out.append((m.start(), m.end(), None, m.group(0)))
    return sorted(out)

def detalhes(t):
    d = {}
    m = re.search(r'§§((?:\s*(?:,|\be\b)?\s*\d+\s*[ºo°]?(?:-[A-Z])?)+)', t, re.ASCII)
    if m:
        d['par'] = ','.join(re.sub(r'[\sºo°]', '', x) for x in re.findall(r'\d+\s*[ºo°]?(?:-[A-Z])?', m.group(1)))
        t = t.replace(m.group(0), '')
    else:
        m = re.search(r'§\s*(\d+)\s*[ºo°]?(?:-([A-Z]))?', t)
        if m: d['par'] = m.group(1) + ('-' + m.group(2) if m.group(2) else '')
        elif re.search(r'par[áa]grafo\s+[úu]nico', t, re.I): d['par'] = 'pu'
    incs = re.findall(r'(?:,|\be\b)\s*([IVXL]+(?:-[A-Z])?)\b', t, re.ASCII)
    if incs: d['inc'] = ','.join(incs)
    m = re.search(r'al[íi]nea\s*["“]?([a-z])\b|["“]([a-z])["”]', t)
    if m: d['ali'] = m.group(1) or m.group(2)
    return d

def alvo_de(ms, ini, fim, seg, folga):
    depois = [x for x in ms if x[0] >= fim]
    antes = [x for x in ms if x[1] <= ini]
    if depois and len(seg[fim:depois[0][0]]) < folga: return depois[0]
    return antes[-1] if antes else (depois[0] if depois else None)

def refs_lei(texto):
    """[(trecho, chave 'ID|art|par|inc|ali' ou None, diploma citado)] por citação de artigo/item."""
    out = []
    for seg in str(texto or '').split(';'):
        ms = mencoes(seg)
        for m in RE_LISTA.finditer(seg):
            alvo = alvo_de(ms, m.start(), m.end(), seg, 25)
            for it in RE_ITEM_LEI.finditer(m.group(1)):
                if not it.group(0).strip(): continue
                if not alvo: out.append((m.group(0), None, None, seg.strip())); break
                if not alvo[2]:
                    # Diploma fora da base: número completo ("Lei nº 8.987/1995" → "Lei 8.987").
                    nm = re.match(r'(Lei\s+Complementar|LC|Lei|Decreto-Lei|Decreto|Resolu[çc][ãa]o|Medida\s+Provis[óo]ria|MP)\s*n?[º°o.]*\s*([\d.]*\d)', seg[alvo[0]:])
                    out.append((m.group(0), None, (re.sub(r'\s+', ' ', nm.group(1)) + ' ' + nm.group(2)) if nm else alvo[3], seg.strip())); break
                d = detalhes(it.group(3) or '')
                out.append((m.group(0), '|'.join([alvo[2], it.group(1).replace('.', '') + (it.group(2) or ''), d.get('par', ''), d.get('inc', ''), d.get('ali', '')]), alvo[3], seg.strip()))
        for m in RE_ITEM_ANEXO.finditer(seg):
            alvo = alvo_de(ms, m.start(), m.end(), seg, 40)
            if alvo and alvo[2] and DIPLOMAS[alvo[2]]['anexo']:
                for n in re.findall(r'\d{1,2}(?:\.\d{2})?', m.group(1) + m.group(2)): out.append((m.group(0), alvo[2] + '|anexo:' + n + '|||', alvo[3], seg.strip()))
    return out

def falta_no_texto(chave):
    """Motivo pelo qual o balão não acha o dispositivo, ou None se acha."""
    p = chave.split('|'); j = lei(p[0])
    if p[1].startswith('anexo:'): return None if p[1][6:] in j.get('anexo', {}) else 'item %s não existe na lista anexa' % p[1][6:]
    a = j['artigos'].get(p[1])
    if not a: return 'art. %s não existe no texto' % p[1]
    alvo = a
    if p[2]:
        for k in p[2].split(','):
            par = (a.get('par') or {}).get(k)
            if not par and not (k == 'pu' and (a.get('par') or {}).get('1')): return '%s não existe no art. %s' % ('parágrafo único' if k == 'pu' else '§ ' + k, p[1])
            if ',' not in p[2]: alvo = par or a['par']['1']
    incs = [r for r in p[3].split(',') if r]
    if incs and not p[2] and incs[0] not in (a.get('inc') or {}) and incs[0] in (((a.get('par') or {}).get('pu') or {}).get('inc') or {}):
        alvo = a['par']['pu']  # o balão procura no parágrafo único
    for r in incs:
        inc = (alvo.get('inc') or {}).get(r)
        if not inc: return 'inciso %s não existe no trecho citado' % r
        if inc.get('revogado'): continue  # o balão mostra "(revogado)"
        if p[4] and p[4] not in (inc.get('ali') or {}): return 'alínea %s não existe no inciso %s' % (p[4], r)
    return None

lei_total = lei_ok = 0
lei_inexistente, lei_sem_diploma, fora_base = [], [], collections.Counter()
for f in fichas:
    for trecho, chave, citado, segmento in refs_lei(f.get('conexoes')):
        lei_total += 1
        if chave is None:
            if citado is None: lei_sem_diploma.append(dict(ident(f), trecho=trecho, segmento=segmento))
            else: fora_base[re.sub(r'\s+', ' ', citado).strip()] += 1
            continue
        motivo = falta_no_texto(chave)
        if motivo: lei_inexistente.append(dict(ident(f), trecho=trecho, segmento=segmento, chave=chave, diploma=DIPLOMAS[chave.split('|')[0]]['nome'], motivo=motivo))
        else: lei_ok += 1

saida = {
    'resumo': {'fichas': len(fichas), 'citacoes_nas_conexoes': total_refs, 'citacoes_ligadas': ligadas,
               'sem_tribunal': len(sem_tribunal), 'referencias_fora_do_acervo': len(nao_encontrados),
               'citacoes_fora_do_acervo': sum(len(v) for v in nao_encontrados.values()), 'tribunal_possivelmente_trocado': len(tribunal_trocado),
               'rg_repetitivo_sem_tema': len(sist_sem_tema), 'tema_em_tribunal_incompativel': len(tema_trib_errado),
               'processo_nao_reconhecido': len(proc_sem_chave), 'sumula_sem_tribunal_no_processo': len(sumula_sem_trib),
               'sumula_ou_sv_com_mais_de_uma_ficha': len(duplicadas),
               'lei_citacoes_de_artigo': lei_total, 'lei_citacoes_ligadas': lei_ok,
               'lei_dispositivo_nao_localizado': len(lei_inexistente), 'lei_artigo_sem_diploma': len(lei_sem_diploma),
               'lei_citacoes_de_diplomas_fora_da_base': sum(fora_base.values())},
    'A_citacoes_sem_tribunal': sem_tribunal,
    'B_tribunal_possivelmente_trocado': tribunal_trocado,
    'C_referencias_fora_do_acervo': [{'chave': k, 'vezes': len(v), 'citada_em': v} for k, v in ranking],
    'D_rg_repetitivo_sem_tema': sist_sem_tema,
    'E_tema_em_tribunal_incompativel': tema_trib_errado,
    'F_processo_nao_reconhecido': proc_sem_chave,
    'G_sumula_sem_tribunal_no_processo': sumula_sem_trib,
    'H_sumula_ou_sv_duplicada': duplicadas,
    'I_lei_dispositivo_nao_localizado': lei_inexistente,
    'J_lei_artigo_sem_diploma': lei_sem_diploma,
    'K_lei_diplomas_fora_da_base': [{'citado_como': k, 'vezes': v} for k, v in fora_base.most_common()],
}
json.dump(saida, open(os.path.join(RAIZ, 'relatorios/diagnostico-conexoes.json'), 'w', encoding='utf8'), ensure_ascii=False, indent=1)

r = saida['resumo']
md = ['# Diagnóstico das Conexões — Jurisprudência', '',
      'Gerado por `relatorios/diagnostico_conexoes.py` sobre `dados/jurisprudencia/*.json`. Listas completas (com id, processo e arquivo de cada ficha) em `relatorios/diagnostico-conexoes.json`.', '',
      '| Indicador | Qtde |', '|---|---|']
for k, v in r.items(): md.append('| %s | %s |' % (k.replace('_', ' '), v))
md += ['', '## C — Referências mais citadas que não estão no acervo (top 40)', '', '| Referência | Vezes |', '|---|---|']
for k, v in ranking[:40]: md.append('| %s | %d |' % (k, len(v)))
md += ['', '## B — Tribunal possivelmente trocado (amostra)', '']
for x in tribunal_trocado[:25]: md.append('- %s (%s): "%s" → no acervo só existe em %s' % (x['processo'], x['id'], x['trecho'], ', '.join(x['existe_em'])))
md += ['', '## A — Citações sem tribunal (amostra)', '']
for x in sem_tribunal[:25]: md.append('- %s (%s): "%s" — candidatos: %s' % (x['processo'], x['id'], x['trecho'], ', '.join(c['tribunal'] + ' ' + c['processo'] for c in x['candidatos']) or 'nenhum'))
md += ['', '## D — Repercussão Geral / Repetitivo sem campo "tema" (amostra)', '']
for x in sist_sem_tema[:25]: md.append('- %s · %s · %s (%s)' % (x['tribunal'], x['processo'], x['sistematica'], x['id']))
md += ['', '## E — Tema em tribunal incompatível com a sistemática', '']
for x in tema_trib_errado[:25]: md.append('- %s · %s · Tema %s · %s (%s)' % (x['tribunal'], x['processo'], x['tema'], x['sistematica'], x['id']))
md += ['', '## F — Processo em formato não reconhecido (amostra)', '']
for x in proc_sem_chave[:40]: md.append('- %s · "%s" (%s)' % (x['tribunal'], x['processo'], x['id']))
md += ['', '## I — Lei seca: dispositivo citado que não existe no texto (amostra)', '']
for x in lei_inexistente[:40]: md.append('- %s (%s): "%s" → %s: %s' % (x['processo'], x['id'], x['trecho'], x['diploma'], x['motivo']))
md += ['', '## J — Lei seca: artigo citado sem diploma no mesmo trecho (amostra)', '']
for x in lei_sem_diploma[:25]: md.append('- %s (%s): "%s" — trecho: "%s"' % (x['processo'], x['id'], x['trecho'], x['segmento'][:120]))
md += ['', '## K — Lei seca: diplomas citados que ainda não estão na base (top 30)', '', '| Citado como | Vezes |', '|---|---|']
for k, v in fora_base.most_common(30): md.append('| %s | %d |' % (k, v))
open(os.path.join(RAIZ, 'relatorios/diagnostico-conexoes.md'), 'w', encoding='utf8').write('\n'.join(md) + '\n')
print(json.dumps(r, ensure_ascii=False, indent=1))
