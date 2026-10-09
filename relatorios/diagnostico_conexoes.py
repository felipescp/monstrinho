"""Diagnóstico das Conexões da Jurisprudência (base oficial em dados/jurisprudencia).

Replica a lógica do app (JURISPRUDENCIA_RUNTIME._refsDoTexto / _chavesDaFicha)
e lista o que impede ou pode distorcer o vínculo conexão → ficha do acervo.
Uso: python3 relatorios/diagnostico_conexoes.py  (gera .md e .json ao lado)
"""
import json, glob, re, os, collections

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RE_PROC = re.compile(r'\b((?:(?:AgRg|AgInt|EDcl|ED|EREsp|EAREsp)\s+(?:n[oa]s?\s+)?)*(ADI|ADC|ADO|ADPF|RE|ARE|REsp|AREsp|EREsp|EAREsp|HC|RHC|MS|RMS|MI|Rcl|RCL|CC|Pet|Inq|AP|APn|IAC|IRDR|RCD|AI|ACO|AO|SLS|SL|STP|SS|RO|AR|IF|PUIL|Ext|SEC|HDE|CR|PSV|Ag|Recurso\s+Especial|Recurso\s+Extraordin[áa]rio))(?:\s*n[º°o.]*)?\s*(\d{1,3}(?:\.\d{3})+|\d+)(?:\s*[\/-]\s*[A-Z]{2}\b)?')
RE_ENUN = re.compile(r'\b(S[úu]mulas?\s+Vinculantes?|SVs?|S[úu]mulas?|Temas?)(?:\s+n[º°o.]*)?\s+(\d{1,4}(?:\.\d{3})?(?:\s*(?:,|\be\b)\s*\d{1,4}(?:\.\d{3})?)*)(?:\s*(?:[\/–-]\s*|(?:d[oa]|no|na|de)\s+(?:[oa]\s+)?)(STF|STJ|TSE|TST|Repercuss[ãa]o\s+Geral|RG|Recursos?\s+Repetitivos?|Repetitivos?)\b)?')

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
    if f.get('tema') and trib:
        for n in re.findall(r'\d{1,4}(?:\.\d{3})?', str(f['tema'])): out.append('TEMA %s %s' % (trib, n.replace('.', '')))
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
saida = {
    'resumo': {'fichas': len(fichas), 'citacoes_nas_conexoes': total_refs, 'citacoes_ligadas': ligadas,
               'sem_tribunal': len(sem_tribunal), 'referencias_fora_do_acervo': len(nao_encontrados),
               'citacoes_fora_do_acervo': sum(len(v) for v in nao_encontrados.values()), 'tribunal_possivelmente_trocado': len(tribunal_trocado),
               'rg_repetitivo_sem_tema': len(sist_sem_tema), 'tema_em_tribunal_incompativel': len(tema_trib_errado),
               'processo_nao_reconhecido': len(proc_sem_chave), 'sumula_sem_tribunal_no_processo': len(sumula_sem_trib),
               'sumula_ou_sv_com_mais_de_uma_ficha': len(duplicadas)},
    'A_citacoes_sem_tribunal': sem_tribunal,
    'B_tribunal_possivelmente_trocado': tribunal_trocado,
    'C_referencias_fora_do_acervo': [{'chave': k, 'vezes': len(v), 'citada_em': v} for k, v in ranking],
    'D_rg_repetitivo_sem_tema': sist_sem_tema,
    'E_tema_em_tribunal_incompativel': tema_trib_errado,
    'F_processo_nao_reconhecido': proc_sem_chave,
    'G_sumula_sem_tribunal_no_processo': sumula_sem_trib,
    'H_sumula_ou_sv_duplicada': duplicadas,
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
open(os.path.join(RAIZ, 'relatorios/diagnostico-conexoes.md'), 'w', encoding='utf8').write('\n'.join(md) + '\n')
print(json.dumps(r, ensure_ascii=False, indent=1))
