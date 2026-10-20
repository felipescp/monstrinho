"""Converte o texto COMPILADO do Planalto (salvo em Markdown) num JSON por
diploma, em dados/legislacao/, para consulta interna do app (balão dos
artigos citados nas Conexões, Penas etc.). Sem seção própria: o arquivo só
é baixado quando algum artigo daquele diploma é consultado.

Uso:
  python3 ferramentas/legislacao_planalto.py <compilado.md|.htm> <ID> "<Nome>" <url-fonte> <saida.json> [AAAA-MM-DD] [--inicio REGEX] [--fim REGEX]
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
    # Links "Visualizar…" antes do artigo (STF na CF, Corpus927 no CPC etc.).
    l = re.sub(r'^\s*>?\s*(?:\[[^\]]*\]\([^)]*\)\s*)+(?=Art\.)', '', l)
    l = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', l)
    l = re.sub(r'<sup>\s*[oº°]\s*</sup>', 'º', l)
    l = re.sub(r'<[^>]+>', '', l)
    l = l.replace('Visualizar dispositivos do STF', '')  # link do STF antes de cada artigo da CF
    l = re.sub(r'(?<![\w])_([^_]+)_(?![\w])', r'\1', l)  # itálico (_habeas corpus_)
    l = l.replace('\\-', '-').replace(' ', ' ')
    return l.replace('**', '').strip().lstrip('>').strip()

RE_PAR = re.compile(r'\(([^()]*)\)')
# Notas de controle de constitucionalidade da última linha lida ("Vide ADIN 3.112-1",
# "Declarado inconstitucional pela ADIN 5538"): separa_anotacoes preenche, novo_disp consome.
_STF = []
ANEXO = {}  # itens da lista anexa ao diploma, se houver (LC 116)

def nota_stf(t):
    """Anotação → {'tipo': 'inconst'|'inconst_parcial'|'vide', 'ref': 'ADI 3.112'} ou None."""
    m = re.search(r'\b(ADIN|ADI|ADC|ADO|ADPF|ADCN)\s*(?:n[º°o.]*\s*)?(\d[\d.]*)', t, re.I)
    if not m: return None
    cls = {'ADIN': 'ADI', 'ADCN': 'ADC'}.get(m.group(1).upper(), m.group(1).upper())
    num = int(m.group(2).replace('.', '').rstrip('.') or 0)
    if not num: return None
    ref = '%s %s' % (cls, format(num, ',').replace(',', '.'))
    if re.search(r'Express(?:ão|ões)\s+declarad', t, re.I): tipo = 'inconst_parcial'
    elif re.search(r'Declarad[oa]s?\s+inconstitucional', t, re.I): tipo = 'inconst'
    else: tipo = 'vide'
    return {'tipo': tipo, 'ref': ref}

def separa_anotacoes(l):
    """Tira do texto as anotações do Planalto e devolve (texto, alt, revogado)."""
    alt, rev = None, False
    del _STF[:]
    def troca(m):
        nonlocal alt, rev
        t = m.group(1)
        if re.match(r'\s*(Declarad[oa]s?\s+inconstitucion|Express(?:ão|ões)\s+declarad|Express(?:ão|ões)\s+substitu[íi]d|(?:Par[áa]grafo|Inciso|Al[íi]nea|Artigo)\s+(?:inclu[íi]d|acrescentad)|Reda[çc][ãa]o dada|Inclu[íi]d[oa]|Acrescentad[oa]|Renumerad[oa]|Alterad[oa]|Revogad[oa]|Vide|Vig[êe]ncia|Produ[çc][ãa]o de efeito|Promulga[çc][ãa]o|Suspens[ao]|Execu[çc][ãa]o suspensa|Regulamento|Mensagem de veto)', t, re.I):
            if re.match(r'\s*Revogad', t, re.I): rev = True
            ns = nota_stf(t)
            if ns and ns not in _STF: _STF.append(ns)
            lm = re.search(r'(Emenda Constitucional de Revis[ãa]o|Emenda Constitucional|Lei Complementar|Lei|Medida Provis[óo]ria)\s*(?:n\S*\s*)?([\d.]+)', t, re.I)  # "Lei nº 14.811" ou "Lei 14.811" (Lei 8.072)
            # Ano solto ("de 2009") ou no fim da data ("de 19.7.1995", Lei 8.137, art. 16).
            anos = re.findall(r'(?<![\d.])(1[89]\d{2}|20\d{2})(?![\d.])', t) or re.findall(r'(?<![\d.])\d{1,2}\.\d{1,2}\.(1[89]\d{2}|20\d{2})(?![\d.])', t)
            if lm and anos and not re.match(r'\s*(Vide|Vig)', t, re.I):
                g = lm.group(1).lower()
                tipo = 'ECR' if 'revis' in g else ('EC' if 'emenda' in g else ('Lei Complementar' if 'omplementar' in g else ('MP' if 'edida' in g else 'Lei')))
                cand = (int(anos[-1]), int(lm.group(2).replace('.', '').rstrip('.') or 0), '%s %s/%s' % (tipo, lm.group(2).rstrip('.'), anos[-1]))
                if alt is None or cand > alt: alt = cand
            return ''
        return m.group(0)
    texto = RE_PAR.sub(troca, l)
    texto = re.sub(r'\bVig[êe]ncia\b\s*$', '', texto)
    texto = re.sub(r'\s+', ' ', texto).replace('**', '').strip()
    # Pontuação que sobra ao tirar a anotação: "preventiva: ." → "preventiva:".
    texto = re.sub(r'([:;,])\s*\.$', r'\1', texto)
    texto = re.sub(r'\s+([.;,:])', r'\1', texto)
    texto = re.sub(r'\.\.$', '.', texto)
    # Restos do texto riscado: "devedor,," / "condenatória ()".
    texto = re.sub(r'^0(?= [A-Za-zÁ-Úá-ú])', 'O', texto)  # "0 termo" (zero no lugar de O, Lei 6.830)
    texto = re.sub(r'\(\s*\)', '', texto)
    texto = re.sub(r',\s*,', ',', texto)
    texto = re.sub(r'\s+([.;,:])', r'\1', texto).strip()
    if re.fullmatch(r'[.;,:\s–-]*', texto): texto = ''  # sobra de "§ 2º . (Revogado…)"
    # Texto que é só "Revogado." / "(Revogado)." (sem a lei revogadora entre parênteses).
    if re.fullmatch(r'\(?\s*Revogad[oa]s?\s*\.?\s*\)?\s*[.;]?', texto, re.I): texto, rev = '', True
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
    if _STF:
        d['stf'] = list(_STF)
        del _STF[:]
    return d

def linhas_html(caminho):
    """Página do Planalto salva em .htm/.html (Ctrl+S) → linhas no mesmo
    formato do Markdown. O texto riscado (<strike>, redação antiga) sai."""
    import html as H
    bruto = open(caminho, 'rb').read()
    try: t = bruto.decode('utf-8')
    except UnicodeDecodeError: t = bruto.decode('cp1252', errors='replace')
    t = re.sub(r'(?is)<(script|style|head)\b.*?</\1>', '', t)
    t = re.sub(r'(?is)<(strike|s|del)\b[^>]*>.*?</\1>', '', t)
    t = re.sub(r'(?is)</?(b|strong)\b[^>]*>', '**', t)
    t = re.sub(r'(?is)<sup>\s*[oº°]\s*</sup>', 'º', t)
    t = re.sub(r'(?is)<br\s*/?>|</p>|</div>|</h\d>|</li>|</tr>', '\n', t)
    t = re.sub(r'(?s)<[^>]+>', '', t)
    t = H.unescape(t).replace('\r', '')
    for l in t.split('\n'):
        l = re.sub(r'\s+', ' ', l).strip()
        l = re.sub(r'\*\*\s*\*\*', '', l)
        if l: yield l + '\n'

CITACAO = '\u2063'  # marca linha de texto citado (não é dispositivo do diploma)

def linhas_md(caminho):
    em_citacao = anuncia = False
    for l in open(caminho, encoding='utf8'):
        # Bloco ">" do Markdown: às vezes é só formatação de dispositivo real
        # ("> Art. 234-A." no CP); às vezes é texto citado por artigo que altera
        # outra lei ("> > “Art. 16. A sentença…”"). Citado = bloco que abre com
        # aspas; vale até o bloco ">" acabar (cada linha citada pode fechar as
        # próprias aspas e a seguinte vir sem elas: CDC art. 113, ECA art. 263).
        citado = False
        if re.match(r'^\s*>', l):
            conteudo = re.sub(r'^\s*(?:>\s*)+', '', l).strip()
            if not em_citacao and (re.match(r'^\[?\s*[“"«]', conteudo) or anuncia): em_citacao = True
            citado = em_citacao and bool(conteudo)
            l = re.sub(r'^\s*(?:>\s*)+', '', l)
        elif l.strip():
            em_citacao = False
            # Linha que anuncia redação de outra lei ("…passa a vigorar com as
            # seguintes alterações:"): o bloco ">" seguinte é texto citado (ECA, art. 263).
            anuncia = bool(re.search(r'(passa[m]? a vigorar|seguintes? reda[çc]|acrescid[oa]s?|altera[çc][õo]es|seguintes? modifica)[^:]*:\s*(?:\[.*)?$', l, re.I))
        if citado:
            yield CITACAO + l if l.endswith('\n') else CITACAO + l + '\n'
            continue
        # Texto riscado do compilado (~~redação antiga~~) sai.
        # "~~" solto (sem fechamento) é artefato da conversão, não risco:
        # nesses casos a linha traz o texto vigente ("Redação dada pela…").
        # Til único na linha é artefato de risco que atravessa linhas (Código
        # Eleitoral: "~        Art. 152. …", dispositivo vigente), não risco.
        if l.count('~') == 1: l = l.replace('~', '')
        # Rubrica e artigo na mesma linha ("**Falsa atribuição de privilégio**  Art 188. (Revogado…)",
        # CP): separa, senão a linha inteira vira rubrica e o artigo some.
        mm = re.match(r'^(\s*\*\*[^*\n]+\*\*)\s+(Art\.?\s*\d.*)$', l)
        if mm:
            yield mm.group(1) + '\n'
            l = mm.group(2) + '\n'
        # Erros de digitação do Planalto no rótulo: "At. 248.", "Ar. 337." (Código Eleitoral).
        l = re.sub(r'^(\s*)A(?:t|r)\.\s*(?=\d)', r'\1Art. ', l)
        til_solto = '~~' in re.sub(r'~~.*?~~', '', l)
        l = re.sub(r'~~.*?~~', '', l).replace('~~', '')
        # Ordinal sobrescrito exportado como "~º~" (ex.: "§ 4~º~"): não é risco.
        l = re.sub(r'(?<=\d)\s*~\s*[oº°]\s*~(?!~)', 'º', l)
        l = re.sub(r'(?<!~)~\s*[oº°]\s*~(?!~)', 'º', l)
        # Travessão do inciso exportado como "~–~" ("III ~–~ as parcelas…").
        l = re.sub(r'(?<!~)~\s*([–—-])\s*~(?!~)', r'\1', l)
        # Risco com til simples (~redação antiga~), usado em alguns compilados.
        riscada = re.search(r'(?<!~)~[^~\n]+~(?!~)', l)
        # Dispositivo riscado com a anotação de revogação fora do risco
        # ("~I - texto antigo~ (Revogado pela LC 150…)"): fica o rótulo, revogado.
        if riscada:
            # § só sem "~~" solto: na Lei 9.605, art. 67, "~~~Parágrafo único…~
            # (Revogado…)" vem antes da pena nova, e o rótulo antigo a roubaria.
            # Também o artigo inteiro riscado ("~Art. 9º. Constitui contravenção…~ (Revogado…)", Lei 1.521).
            rot = re.match(r'~\s*([IVXL]+\s*[-–—]+)', riscada.group(0)) or \
                (None if til_solto else re.match(r'~\s*(§\s*\d+\s*[ºo°]?(?:-[A-Z])?\.?|Par[áa]grafo\s+[úu]nico\.?|Art\.\s*\d+(?:\.\d{3})?\s*[ºo°]?(?:-[A-Z])?\.?)', riscada.group(0)))
            resto = l[riscada.end():]
            if rot and re.search(r'Revogad', resto, re.I) and not re.search(r'Revogad', riscada.group(0), re.I):
                l = l[:riscada.start()] + rot.group(1) + ' ' + resto
                riscada = None
        l = re.sub(r'(?<!~)~[^~\n]+~(?!~)', '', l)
        # Dispositivo de MP com vigência encerrada (anotação riscada): sai inteiro.
        if riscada and re.search(r'Vig[êe]ncia\s+encerrada', l, re.I): continue
        # Títulos em Markdown ("#### CAPÍTULO II", "##### DA PREVENÇÃO"): não são dispositivo.
        if re.match(r'^\s*#{1,6}\s', l): continue
        # Vários artigos revogados na mesma linha ("Art. 232. (Revogado…) Art. 233. (Revogado…)").
        # Só quebra depois de uma anotação de revogação/veto: texto citado entre
        # aspas (ex.: ECA art. 263, "1) Art. 121…") continua inteiro.
        # Dispositivo grudado no anterior por uma sequência de espaços (Código
        # Eleitoral, art. 112: "…da idade.        Parágrafo único. Na definição…").
        l = re.sub(r'(?<=[.;:])[ \u00a0]{4,}(?=(?:Par[áa]grafo\s+[úu]nico|§\s*\d|Art\.\s*\d)[^\n]{20})', '\n', l)
        if '\n' in l.rstrip('\n'):
            for pedaco in l.rstrip('\n').split('\n'): yield pedaco + '\n'
            continue
        partes, ini = [], 0
        for mm in re.finditer(r'(?<=[)\]])[\s\u00a0]+(?=Art\.\s*\d)', l):
            if re.search(r'Revogad|VETAD', l[ini:mm.start()], re.I):
                partes.append(l[ini:mm.start()]); ini = mm.end()
        partes.append(l[ini:])
        for parte in partes:
            yield parte if parte.endswith('\n') else parte + '\n'

def converter(md, inicio=None, fim=None):
    artigos, art, seg, inc, rubrica = {}, None, None, None, None
    em_anexo = False
    ANEXO.clear()
    ativo = inicio is None
    fonte = linhas_html(md) if re.search(r'\.html?$', md, re.I) else linhas_md(md)
    for raw in fonte:
        bruto = raw.strip()
        if not bruto: continue
        citado = raw.startswith(CITACAO)
        l = limpa(raw.replace(CITACAO, ''))
        if not l: continue
        # Texto citado (redação dada a outra lei): continuação, nunca dispositivo.
        if citado:
            # Texto citado de artigo revogado (Lei 8.137, art. 18: o art. 163 que ele acrescentava ao CP) sai.
            if art is not None and ativo and not art.get('revogado'):
                alvo = inc if inc is not None else seg
                alvo['texto'] = (alvo['texto'] + ' ' + l).strip()
            continue
        # --inicio/--fim: recorta um trecho do compilado (ex.: CF sem o ADCT,
        # e o ADCT à parte, porque ele recomeça a numeração no art. 1º).
        if not ativo:
            if re.search(inicio, l, re.I): ativo = True
            continue
        if fim and re.search(fim, l, re.I): break
        # Faixa revogada em bloco: "Art. 1.620. a 1.629. (Revogados pela Lei…)".
        # Também "Art. 556. a Art. 560 (Revogado…)" e "Art. 561. e Art. 562. (…)".
        m = re.match(r'^Arts?\.?\s*(\d+(?:\.\d{3})?)\s*[ºo°]?\.?\s*(a|e)\s*(?:Art\.?\s*)?(\d+(?:\.\d{3})?)\s*[ºo°]?\.?\s*(.*)$', l)
        if m:
            texto, alt, rev = separa_anotacoes(m.group(4))
            ini, fim_ = int(m.group(1).replace('.', '')), int(m.group(3).replace('.', ''))
            for n in (range(ini, fim_ + 1) if m.group(2) == 'a' else (ini, fim_)):
                artigos[str(n)] = novo_disp(texto, alt, rev)
            art, seg, inc, rubrica = None, None, None, None
            continue
        # Também "Art. 10A." sem hífen (Lei 9.613): letra grudada no número e seguida de ponto.
        m = re.match(r'^Art\.?\s*(\d+(?:\.\d{3})?)\s*[ºo°]?\s*(?:-([A-Z](?:-[A-Z])?)(?![a-zà-ú])|(?<=\d)([A-Z])(?=\.))?\s*[.\-–—:]*\s*(.*)$', l)
        if m:
            suf = m.group(2) or m.group(3)
            num = m.group(1).replace('.', '') + ('-' + suf if suf else '')
            texto, alt, rev = separa_anotacoes(m.group(4))
            # Artigo de MP com vigência encerrada e sem texto (Lei 9.613, art. 17-F): não entra.
            if re.fullmatch(r'\s*Vig[êe]ncia\s+encerrada\s*', texto, re.I):
                art, seg, inc, rubrica = None, None, None, None
                continue
            art = novo_disp(texto, alt, rev)
            if rubrica: art['rubrica'] = rubrica
            artigos[num] = art
            seg, inc, rubrica = art, None, None
            continue
        # Lista anexa (LC 116: "Lista de serviços anexa à Lei Complementar…"):
        # itens "1 – Serviços de informática", "1.05 – Licenciamento…" vão para ANEXO.
        if re.match(r'^(Lista|Rela[çc][ãa]o)\b.{0,40}\banexa\b', l, re.I):
            em_anexo, art = True, None
            continue
        if em_anexo:
            m = re.match(r'^(\d{1,2}(?:\.\d{2})?)\s*[-–—]\s*(.*)$', l)
            if m:
                texto, alt, rev = separa_anotacoes(m.group(2))
                ANEXO[m.group(1)] = novo_disp(texto, alt, rev)
            continue
        if art is None: continue
        # Fecho do diploma (local, data, assinaturas): nada mais é dispositivo.
        if re.match(r'^(Rio de Janeiro|Bras[íi]lia|Senado Federal|C[âa]mara dos Deputados|Congresso Nacional),\s*(?:em\s+)?\d', l): art = None; continue
        m = re.match(r'^§\s*(\d+)\.?\s*[ºo°]?\s*(?:-([A-Z])(?![a-zà-ú]))?\s*[.\-–—:]*\s*(.*)$', l)
        pu = re.match(r'^Par[áa]grafo\s+[úu]nico\s*[.\-–—:]*\s*(.*)$', l, re.I)
        if m or pu:
            chave = 'pu' if pu else m.group(1) + ('-' + m.group(2) if m.group(2) else '')
            texto, alt, rev = separa_anotacoes(pu.group(1) if pu else m.group(3))
            p = novo_disp(texto, alt, rev)
            if rubrica: p['rubrica'] = rubrica
            art.setdefault('par', {})[chave] = p
            seg, inc, rubrica = p, None, None
            continue
        # "l -", "ll -" (L minúsculo no lugar de I, erro do compilado da Lei 7.347).
        # Também "Il -" (CPP, art. 78) e outras misturas de I e l.
        l = re.sub(r'^([IVX]*l[IVXl]*)(?=\s*[-–—])', lambda mm: mm.group(1).replace('l', 'I'), l)
        # "III - texto", "VIII-A - texto" e, sem travessão (falha do compilado da CF,
        # art. 93), "IX todos os julgamentos…": numeral seguido de minúscula.
        m = re.match(r'^([IVXL]+(?:-[A-Z](?![a-zà-ú]))?)\s*[-–—]\s*(.*)$', l) or \
            re.match(r'^([IVXL]+(?:-[A-Z](?![a-zà-ú]))?)\s+(?=[a-zà-ú])(.*)$', l) or \
            re.match(r'^([IVXL]+)\)\s+(.*)$', l)  # "I) o número de testemunhas…" (Lei 1.521, art. 23)
        if m:
            chave, resto = m.group(1), m.group(2)
            # "V - A as causas…" é o inciso V-A, não um novo V (CF, arts. 92 e 109: o V-A apagava o V).
            sx = re.match(r'^([A-Z])\s+(?=[a-zà-ú])(.*)$', resto)
            if sx and '-' not in chave and chave in seg.get('inc', {}):
                chave, resto = chave + '-' + sx.group(1), sx.group(2)
            texto, alt, rev = separa_anotacoes(resto)
            inc = novo_disp(texto, alt, rev)
            # Inciso que continua a lista do caput depois de §§ intercalados
            # (Lei 4.717, art. 7º: I, §§ 1º e 2º, II…VI): vai para o artigo.
            ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV']
            if (seg is not art and not seg.get('inc') and chave in ROM[1:]
                    and ROM[ROM.index(chave) - 1] in art.get('inc', {})
                    and chave not in art.get('inc', {})):
                seg = art
            seg.setdefault('inc', {})[chave] = inc
            rubrica = None
            continue
        m = re.match(r'^Penas?\s*[-–—:]\s*(.*)$', l, re.I)
        if m:
            texto, alt, rev = separa_anotacoes(m.group(1))
            # Pena nova com "(Redação dada…)" substitui a anterior que o compilado não riscou
            # (Lei 11.340, art. 24-A: "detenção, de 3 meses…" e depois "reclusão, de 2 a 5 anos…").
            if seg.get('pena') and re.search(r'Reda[çc][ãa]o\s+dada', m.group(1), re.I): seg['pena'] = ''
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
        # Alínea direto no artigo ou parágrafo, sem inciso (Lei 1.521, art. 4º: usura).
        if m and not seg.get('ali') and m.group(1) == 'a' or m and seg.get('ali') and chr(ord(max(seg['ali'])) + 1) == m.group(1):
            texto, alt, rev = separa_anotacoes(m.group(2))
            seg.setdefault('ali', {})[m.group(1)] = texto
            seg['alt'] = junta_alt(seg.get('alt'), alt)
            if not seg['alt']: del seg['alt']
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
        # Cabeçalho em maiúsculas ("DO FUNDO DE INVESTIMENTO") não é continuação.
        if texto and texto.upper() == texto and re.search(r'[A-ZÁ-Ú]{3}', texto): continue
        # Rubrica/título sem negrito ("Fundos de Participação dos Estados"):
        # linha curta sem pontuação final também não é continuação.
        if texto and len(texto) < 150 and not re.search(r'[.;:!?)”"»]$', texto): continue
        if texto and not re.match(r'^(T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O|PARTE|LIVRO)\b', texto, re.I) and len(texto) > 3:
            alvo = inc if inc is not None else seg
            alvo['texto'] = (alvo['texto'] + ' ' + texto).strip()
    return artigos

if __name__ == '__main__':
    args, opts = [], {}
    it = iter(sys.argv[1:])
    for a in it:
        if a in ('--inicio', '--fim'): opts[a[2:]] = next(it)
        else: args.append(a)
    md, ident, nome, fonte, saida = args[:5]
    data = args[5] if len(args) > 5 else datetime.date.today().isoformat()
    arts = converter(md, opts.get('inicio'), opts.get('fim'))
    out = {'id': ident, 'nome': nome, 'fonte': fonte, 'dataTexto': data, 'artigos': arts}
    if ANEXO: out['anexo'] = dict(ANEXO)
    json.dump(out, open(saida, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    print('%d artigos → %s' % (len(arts), saida))
