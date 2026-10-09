"""Converte o texto COMPILADO do Planalto (salvo em Markdown) num JSON por
diploma, em dados/legislacao/, para consulta interna do app (balão dos
artigos citados nas Conexões, Penas etc.). Sem seção própria: o arquivo só
é baixado quando algum artigo daquele diploma é consultado.

Uso:
  python3 ferramentas/legislacao_planalto.py <compilado.md> <ID> "<Nome>" <url-fonte> <saida.json> [AAAA-MM-DD]
  ex.: ... DEL2848compilado.md CP "Código Penal" \
       https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm \
       dados/legislacao/codigo-penal.json 2026-10-08

Formato de saída:
  { "id", "nome", "fonte", "dataTexto", "artigos": {
      "155": { "rubrica", "texto", "alt", "pena", "inc": {"I": {"texto","alt","ali":{"a":"…"}}},
               "par": {"1": {...mesmo formato...}, "pu": {...}, "4-A": {...}} } } }
  "alt" = lei mais recente anotada no dispositivo ("Lei 15.397/2026");
  "revogado": true quando o dispositivo foi revogado.
"""
import json, re, sys, datetime

def limpa(l):
    l = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', l)
    l = re.sub(r'<sup>\s*[oº°]\s*</sup>', 'º', l)
    l = re.sub(r'<[^>]+>', '', l)
    l = l.replace('\\-', '-').replace(' ', ' ')
    return l.replace('**', '').strip().lstrip('>').strip()

RE_PAR = re.compile(r'\(([^()]*)\)')
def separa_anotacoes(l):
    """Tira do texto as anotações do Planalto e devolve (texto, alt, revogado)."""
    alt, rev = None, False
    def troca(m):
        nonlocal alt, rev
        t = m.group(1)
        if re.match(r'\s*(Reda[çc][ãa]o dada|Inclu[íi]d[oa]|Acrescentad[oa]|Renumerad[oa]|Alterad[oa]|Revogad[oa]|Vide|Vig[êe]ncia|Produ[çc][ãa]o de efeito|Promulga[çc][ãa]o)', t, re.I):
            if re.match(r'\s*Revogad', t, re.I): rev = True
            lm = re.search(r'(Lei Complementar|Lei|Medida Provis[óo]ria)\s*n\S*\s*([\d.]+)', t, re.I)
            anos = re.findall(r'(?<![\d.])(1[89]\d{2}|20\d{2})(?![\d.])', t)
            if lm and anos and not re.match(r'\s*(Vide|Vig)', t, re.I):
                tipo = 'Lei Complementar' if 'omplementar' in lm.group(1) else ('MP' if 'edida' in lm.group(1) else 'Lei')
                cand = (int(anos[-1]), int(lm.group(2).replace('.', '').rstrip('.') or 0), '%s %s/%s' % (tipo, lm.group(2).rstrip('.'), anos[-1]))
                if alt is None or cand > alt: alt = cand
            return ''
        return m.group(0)
    texto = RE_PAR.sub(troca, l)
    texto = re.sub(r'\bVig[êe]ncia\b\s*$', '', texto)
    texto = re.sub(r'\s+', ' ', texto).replace('**', '').strip()
    return texto, (alt[2] if alt else None), rev

def junta_alt(a, b):
    if not a: return b
    if not b: return a
    ka = (int(a[-4:]), a); kb = (int(b[-4:]), b)
    return a if ka >= kb else b

def novo_disp(texto, alt, rev):
    d = {'texto': texto}
    if alt: d['alt'] = alt
    if rev: d['revogado'] = True
    return d

def converter(md):
    artigos, art, seg, inc, rubrica = {}, None, None, None, None
    for raw in open(md, encoding='utf8'):
        bruto = raw.strip()
        if not bruto: continue
        l = limpa(raw)
        if not l: continue
        m = re.match(r'^Art\.\s*(\d+(?:\.\d{3})?)\s*[ºo°]?\s*(?:-([A-Z](?:-[A-Z])?)(?![a-zà-ú]))?\s*[.\-–—:]*\s*(.*)$', l)
        if m:
            num = m.group(1).replace('.', '') + ('-' + m.group(2) if m.group(2) else '')
            texto, alt, rev = separa_anotacoes(m.group(3))
            art = novo_disp(texto, alt, rev)
            if rubrica: art['rubrica'] = rubrica
            artigos[num] = art
            seg, inc, rubrica = art, None, None
            continue
        if art is None: continue
        # Fecho do diploma (local, data, assinaturas): nada mais é dispositivo.
        if re.match(r'^(Rio de Janeiro|Bras[íi]lia),\s*\d', l): art = None; continue
        m = re.match(r'^§\s*(\d+)\s*[ºo°]?\s*(?:-([A-Z])(?![a-zà-ú]))?\s*[.\-–—:]*\s*(.*)$', l)
        pu = re.match(r'^Par[áa]grafo\s+[úu]nico\s*[.\-–—:]*\s*(.*)$', l, re.I)
        if m or pu:
            chave = 'pu' if pu else m.group(1) + ('-' + m.group(2) if m.group(2) else '')
            texto, alt, rev = separa_anotacoes(pu.group(1) if pu else m.group(3))
            p = novo_disp(texto, alt, rev)
            if rubrica: p['rubrica'] = rubrica
            art.setdefault('par', {})[chave] = p
            seg, inc, rubrica = p, None, None
            continue
        m = re.match(r'^([IVXL]+)\s*[-–—]\s*(.*)$', l)
        if m:
            texto, alt, rev = separa_anotacoes(m.group(2))
            inc = novo_disp(texto, alt, rev)
            seg.setdefault('inc', {})[m.group(1)] = inc
            rubrica = None
            continue
        m = re.match(r'^Pena\s*[-–—:]\s*(.*)$', l, re.I)
        if m:
            texto, alt, rev = separa_anotacoes(m.group(1))
            seg['pena'] = (seg.get('pena', '') + ' / ' if seg.get('pena') else '') + texto
            seg['alt'] = junta_alt(seg.get('alt'), alt)
            if not seg['alt']: del seg['alt']
            continue
        m = re.match(r'^([a-z])\)\s*(.*)$', l)
        if m and inc is not None:
            texto, alt, rev = separa_anotacoes(m.group(2))
            inc.setdefault('ali', {})[m.group(1)] = texto
            inc['alt'] = junta_alt(inc.get('alt'), alt)
            if not inc['alt']: del inc['alt']
            continue
        # Rubrica (linha em negrito curta, ex.: "**Furto qualificado**").
        if bruto.startswith('**'):
            t, _, _ = separa_anotacoes(l)
            t = t.strip('* ').strip()
            if t and len(t) < 160 and not re.match(r'^(T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O|PARTE|LIVRO)\b', t, re.I): rubrica = t
            else: rubrica = None
            continue
        # Linha solta (continuação) → acrescenta ao dispositivo corrente.
        texto, alt, rev = separa_anotacoes(l)
        if texto and not re.match(r'^(T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O|PARTE|LIVRO)\b', texto, re.I) and len(texto) > 3:
            alvo = inc if inc is not None else seg
            alvo['texto'] = (alvo['texto'] + ' ' + texto).strip()
    return artigos

if __name__ == '__main__':
    md, ident, nome, fonte, saida = sys.argv[1:6]
    data = sys.argv[6] if len(sys.argv) > 6 else datetime.date.today().isoformat()
    arts = converter(md)
    out = {'id': ident, 'nome': nome, 'fonte': fonte, 'dataTexto': data, 'artigos': arts}
    json.dump(out, open(saida, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    print('%d artigos → %s' % (len(arts), saida))
