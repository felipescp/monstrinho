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
    # Anotação sem o "(" de abertura: "[Redação dada pela Lei nº 13.204, de 2015)](…)" (Lei 13.019, art. 48, III).
    l = re.sub(r'\[((?:Reda[çc][ãa]o\s+dada|Inclu[íi]d[oa]|Revogad[oa]|Acrescid[oa]|Renumerad[oa])[^\]()]*\))\]', r'[(\1]', l)
    # Anotação sem o ")" de fechamento: "[(Incluído pela Lei nº 14.382, de 2022](…)" (Lei 6.015, art. 46, § 6º).
    # (Se o ")" vem logo depois do link, "[(Incluído pela Lei nº 14.026, de 2020](…))", não é o caso.)
    l = re.sub(r'\[(\((?:Reda[çc][ãa]o\s+dada|Inclu[íi]d[oa]|Revogad[oa]|Acrescid[oa]|Renumerad[oa])[^\]()]*\d{4})\](\([^()\s]*\))(?!\s*\))', r'[\1)]\2', l)
    # Anotação sem nenhum parêntese: "§ 1º [Revogado pela Lei nº 9.032, de 28.4.95.](…)" (Lei 8.212, art. 30).
    l = re.sub(r'\[(Revogad[oa]s?\s+pel[oa]\s[^\]()]*)\]', r'[(\1)]', l)
    # Link que corta a última letra da palavra: "[…Constituição Federa](…) l." (Lei 13.300, art. 1º).
    l = re.sub(r'\[([^\]]*[a-zà-ú])\]\([^)]*\)\s([b-df-hj-np-tv-z])(?![\wà-ú])', r'[\1\2]()', l)
    # Link que começa uma letra depois da palavra: "com base nos i [ncisos XX do art. 21](…)" (Lei 13.089, art. 1º).
    l = re.sub(r'(?<![\wà-ú])([b-df-hj-np-tv-zi])\s\[(?=[a-zà-ú])', r'[\1', l)
    l = re.sub(r'\b(c?m)\s*<sup>\s*([23])\s*</sup>', lambda m: m.group(1) + '²³'[int(m.group(2)) - 2], l)  # "60 m <sup>2</sup>" (Lei 6.015, art. 290)
    # Chamada de nota de rodapé: "é de: <sup>[6](#ne6)</sup>", "posteriores; _<sup>9</sup>_" (Lei 8.212).
    l = re.sub(r'(?<=[\s.;:,)])\s*_?<sup>\s*(?:\[\d{1,2}\]\(#[^)]*\)|\d{1,2})\s*</sup>_?', '', l)
    l = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', l)
    l = re.sub(r'<sup>\s*[oº°]\s*</sup>', 'º', l)
    l = re.sub(r'<[^>]+>', '', l)
    l = l.replace('Visualizar dispositivos do STF', '')  # link do STF antes de cada artigo da CF
    l = re.sub(r'\s*_\\-_\s*', '-', l)  # hífen em itálico com espaços: "Conceder _\-_ se _\-_ á" (Lei 8.245)
    l = re.sub(r'(?<!\w)_(\w+)-_\s+', r'\1-', l)  # "_apart-_ hotéis" (Lei 8.245, art. 1º)
    l = re.sub(r'(?<![\w])_([^_]+)_(?![\w])', r'\1', l)  # itálico (_habeas corpus_)
    l = l.replace('\\-', '-').replace('\\.', '.').replace(' ', ' ')
    l = re.sub(r'^(\s*Art\.\s*\d+)\s(\d+)(?=\.\s)', r'\1\2', l)  # "Art. 5 7. (VETADO)" (Lei 13.709)
    l = re.sub(r'^(\s*Art)\s+\.(?=\s*\d)', r'\1.', l)  # "Art . 95." (Lei 13.465)
    return l.replace('**', '').strip().lstrip('>').strip()

RE_PAR = re.compile(r'\(([^()]*)\)')
# Notas de controle de constitucionalidade da última linha lida ("Vide ADIN 3.112-1",
# "Declarado inconstitucional pela ADIN 5538"): separa_anotacoes preenche, novo_disp consome.
_STF = []
ANEXO = {}  # itens da lista anexa ao diploma, se houver (LC 116)

def notas_stf(t):
    """Anotação → [{'tipo': 'inconst'|'inconst_parcial'|'vide', 'ref': 'ADI 3.112'}, …]. Aceita várias
    ações na mesma anotação e o plural/hífen: "Vide Adins nºs 1.351-3 e 1.354-8", "Vide ADI-5105" (Lei 9.096)."""
    m = re.search(r'\b(ADIN|ADI|ADC|ADO|ADPF|ADCN)s?(?![A-Za-z])[\s-]*(?:n[º°o.]*s?\s*)?(\d[\d.]*(?:-\d)?(?:\s*(?:,|\be\b)\s*\d[\d.]*(?:-\d)?)*)', t, re.I)
    if not m: return []
    cls = {'ADIN': 'ADI', 'ADCN': 'ADC'}.get(m.group(1).upper(), m.group(1).upper())
    if re.search(r'Express(?:ão|ões)\s+declarad', t, re.I): tipo = 'inconst_parcial'
    elif re.search(r'Declarad[oa]s?\s+inconstitucional', t, re.I): tipo = 'inconst'
    else: tipo = 'vide'
    out = []
    for n in re.findall(r'(\d[\d.]*)(?:-\d)?', m.group(2)):
        num = int(n.replace('.', '') or 0)
        if num: out.append({'tipo': tipo, 'ref': '%s %s' % (cls, format(num, ',').replace(',', '.'))})
    return out

def separa_anotacoes(l):
    """Tira do texto as anotações do Planalto e devolve (texto, alt, revogado)."""
    alt, rev = None, False
    del _STF[:]
    def troca(m):
        nonlocal alt, rev
        t = m.group(1)
        if re.match(r'\s*(Declarad[oa]s?\s+inconstitucion|Express(?:ão|ões)\s+declarad|Express(?:ão|ões)\s+substitu[íi]d|(?:Par[áa]grafo(?:\s+[úu]nico)?|Inciso|Al[íi]nea|Artigo)\s+(?:inclu[íi]d|acrescentad|renumerad|alterad)|Reda[çc][ãa]o (?:dada|pel)|Inclu[íi]d[oa]|Acrescentad[oa]|Renumerad[oa]|Alterad[oa]|Revogad[oa]|Rejeitad[oa]|Vide|Vig[êe]ncia|Produ[çc][ãa]o de efeito|Promulga[çc][ãa]o|Suspens[ao]|Execu[çc][ãa]o suspensa|Regulamento|Mensagem de veto)', t, re.I):
            if re.match(r'\s*Revogad', t, re.I): rev = True
            for ns in notas_stf(t):
                if ns not in _STF: _STF.append(ns)
            lm = re.search(r'(Emenda Constitucional de Revis[ãa]o|Emenda Constitucional|Lei Complementar|Lcp|Lei|Medida Provis[óo]ria)\s*(?:n\S*\s*)?(\d{1,3}(?:[.,]\d{3})+|\d+)', t, re.I)  # "Lei nº 14.811" ou "Lei 14.811" (Lei 8.072)
            # Ano solto ("de 2009") ou no fim da data ("de 19.7.1995", Lei 8.137, art. 16).
            anos = re.findall(r'(?<![\d.])(1[89]\d{2}|20\d{2})(?![\d.])', t) or re.findall(r'(?<![\d.])\d{1,2}\.\d{1,2}\.(1[89]\d{2}|20\d{2})(?![\d.])', t)
            # Data com ano de dois dígitos: "de 15/05/97" (Lei 7.716, arts. 1º e 20), "de 20.12.77" (Lei 4.132, art. 2º, VIII).
            if not anos: anos = [('19' if int(x) >= 30 else '20') + x for x in re.findall(r'(?<![\d/.])\d{1,2}([/.])\d{1,2}\1(\d{2})(?![\d/])', t) for x in [x[1]]]
            if lm and anos and not re.match(r'\s*(Vide|Vig)', t, re.I):
                g = lm.group(1).lower()
                tipo = 'ECR' if 'revis' in g else ('EC' if 'emenda' in g else ('Lei Complementar' if 'omplementar' in g or g == 'lcp' else ('MP' if 'edida' in g else 'Lei')))
                num = int(re.sub(r'[.,]', '', lm.group(2)))  # "Lei nº 12,010" (vírgula, Lei 8.560, art. 2º, § 5º)
                # Número com ponto de milhar mesmo quando o compilado não põe ("Lei nº 10467", CP, art. 337-B).
                cand = (int(anos[-1]), num, '%s %s/%s' % (tipo, format(num, ',').replace(',', '.'), anos[-1]))
                if alt is None or cand > alt: alt = cand
            return ''
        return m.group(0)
    texto = RE_PAR.sub(troca, l)
    texto = re.sub(r'(?:\s*\b(?:Vig[êe]ncia|Produ[çc][ãa]o\s+de\s+efeitos?)\b)+\s*$', '', texto)  # links soltos (Lei 11.079, art. 6º)
    texto = re.sub(r'(?<=[.;:])\s+Regulamento\.?\s*$', '', texto)  # link "Regulamento" sem parênteses (Lei 13.022, art. 5º; "Regulamento.", Lei 9.985, art. 57-A)
    texto = re.sub(r'\s+', ' ', texto).replace('**', '').strip()
    # Pontuação que sobra ao tirar a anotação: "preventiva: ." → "preventiva:".
    texto = re.sub(r'([:;,])\s*\.$', r'\1', texto)
    texto = re.sub(r'\s+([.;,:])', r'\1', texto)
    texto = re.sub(r'\.\.$', '.', texto)
    texto = re.sub(r"([.;:])\s*'$", r'\1', texto)  # apóstrofo solto antes da anotação (Lei 9.455, art. 1º, § 4º, II)
    # Restos do texto riscado: "devedor,," / "condenatória ()".
    texto = re.sub(r'^0(?= [A-Za-zÁ-Úá-ú])', 'O', texto)  # "0 termo" (zero no lugar de O, Lei 6.830)
    texto = re.sub(r'\(\s*\)', '', texto)
    texto = re.sub(r',\s*,', ',', texto)
    texto = re.sub(r'\s+([.;,:])', r'\1', texto).strip()
    texto = re.sub(r'([:;,])\.+$', r'\1', texto)  # "competência;." (duas anotações com ponto, Lei 8.212, art. 30, I, b)
    if re.fullmatch(r'[.;,:\s–-]*', texto): texto = ''  # sobra de "§ 2º . (Revogado…)"
    # Texto que é só "Revogado." / "(Revogado)." (sem a lei revogadora entre parênteses).
    if re.fullmatch(r'(?:Caput\.\s*)?\(?\s*Revogad[oa]s?\s*\.?\s*\)?\s*[.;]?', texto, re.I): texto, rev = '', True
    return texto, (alt[2] if alt else None), rev

def so_vide_mp(t):
    """Linha cujo conteúdo é só "(Vide Medida Provisória …)" (dispositivo de MP que caducou)."""
    return bool(re.fullmatch(r'[\s.]*(?:\(\s*Vide\s+Medida\s+Provis[óo]ria[^()]*\)[\s.]*)+', t, re.I))

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
ART_RISCADO = '\u2064'  # marca artigo inteiro riscado (os filhos que seguem são da redação antiga)

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
            anuncia = False
            citado = em_citacao and bool(conteudo)
            l = re.sub(r'^\s*(?:>\s*)+', '', l)
        elif anuncia and (re.match(r'^\s*\[?\s*[“"«]', l) or not re.search(r'[a-zà-ú]', re.sub(r'\]\([^)]*\)', '', l))):
            # Cabeçalho citado fora do bloco ">" ("[“CAPÍTULO II-B](…)" e "DOS CRIMES EM LICITAÇÕES…",
            # Lei 14.133, art. 178): continua anunciado, e o bloco ">" seguinte é citado.
            citado = True
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
        # Risco interrompido só em volta de um link ("~Art. 53. O art. 1º da~ [Lei nº 7.347…](…)~, passa…~",
        # Lei 10.257): o link também está riscado. Link de anotação ("[(Revogado…)]") não.
        l = re.sub(r'(?<=[^\s~])~\s*(\[(?!\()[^\]]*\]\([^)]*\))\s*~(?=[^\s~])', r' \1 ', l)
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
        # Risco que começa depois do rótulo ("Art. ~115 - Em caso de afastamento…~ (Revogado…)", LC 35):
        # o rótulo vai para dentro do risco, senão o número do artigo some com ele.
        l = re.sub(r'^(\s*)(Art\.\s*)~(?=\d)', r'\1~\2', l)
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
        art_riscado = riscada and re.match(r'\s*~\s*Art\.?\s*\d', l)
        l = re.sub(r'(?<!~)~[^~\n]+~(?!~)', '', l)
        # Artigo inteiro riscado (redação antiga): o que vier até o próximo artigo é dele, não do
        # artigo anterior (Lei 12.527: o parágrafo único do art. 12 antigo ia para o art. 11).
        if art_riscado and not re.search(r'\w', re.sub(r'\[[^\]]*\]\([^)]*\)|\([^)]*\)', '', l)):
            yield ART_RISCADO + '\n'
            continue
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
        # Inciso grudado no anterior depois de "; e" ("…do edital; e VII – licença ambiental…", Lei 11.079, art. 10).
        l = re.sub(r'(;\s(?:e|ou))\s+(?=[IVXL]+\s*[–—-]\s+[a-zà-ú])', '\\1\n', l)
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

def converter(md, inicio=None, fim=None, rubrica_capitulo=False):
    artigos, art, seg, inc, rubrica = {}, None, None, None, None
    em_anexo = False
    cab = None  # nome de capítulo sem negrito em montagem (Lei 9.307)
    RE_CAB = r'(?:Cap[íi]tulo|CAP[ÍI]TULO|T[ÍI]TULO|SE[ÇC][ÃA]O|Se[çc][ãa]o)' if rubrica_capitulo else r'Cap[íi]tulo'
    ANEXO.clear()
    ativo = inicio is None
    fonte = linhas_html(md) if re.search(r'\.html?$', md, re.I) else linhas_md(md)
    anterior = ''  # linha não vazia anterior (negrito de "Subseção" em duas linhas)
    for raw in fonte:
        bruto = raw.strip()
        if not bruto: continue
        anterior, sub_aberta = bruto, re.match(r'^\*\*\s*(?:Subse[çc][ãa]o|CAP[ÍI]TULO)\b[^*]*$', anterior, re.I)
        if raw.startswith(ART_RISCADO):
            if art is not None: art, seg, inc = {'texto': ''}, None, None
            seg = art
            continue
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
        # Redação de MP que caducou ("[Vigência encerrada]", Lei 14.133, art. 191): o compilado repete
        # depois o texto restabelecido. Artigo sai; parágrafo ou inciso vira nó descartável, para os
        # filhos não grudarem no dispositivo anterior (o parágrafo único "revogado" do art. 191 ia para o 190).
        if re.search(r'Vig[êe]ncia\s+encerrada', l, re.I):
            if re.match(r'^Art\.?\s*\d', l):
                art, seg, inc, rubrica = None, None, None, None
                continue
            if art is not None and re.match(r'^(§|Par[áa]grafo\s+[úu]nico|[IVXL]+\s*[-–—])', l):
                if l[0] in '§P': seg, inc = {'texto': ''}, None
                else: inc = {'texto': ''}
                continue
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
            seg, inc, rubrica, cab = art, None, None, None
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
        # (Antes do teste de artigo aberto: o capítulo I vem antes do art. 1º.)
        t = separa_anotacoes(l)[0] if cab is not None or re.match(RE_CAB, l) else ''
        # Título sem negrito ("Capítulo I" / "Disposições Gerais"; "Capítulo VI" / "Do Reconhecimento…" /
        # "Arbitrais Estrangeiras", Lei 9.307): o nome, em uma ou mais linhas, vira a rubrica do artigo seguinte.
        # Com --rubrica-capitulo, também "TÍTULO II" / "CAPÍTULO I" em maiúsculas (Leis 9.096 e 12.288). Não é o
        # padrão: em muitos compilados (CP, CPPM) o nome se junta à rubrica em negrito do artigo.
        # Título seguinte dentro do capítulo ("Capítulo II" / "DAS PRESTAÇÕES EM GERAL" / "Seção I" / "Das
        # Espécies de Prestações", Lei 8.213, art. 18): recomeça o nome; vale o mais específico.
        # "CAPÍTULO ÚNICO" sem nome próprio (LC 35, art. 89): fica o nome do título.
        if cab is not None and re.fullmatch(r'(?:Cap[íi]tulo|CAP[ÍI]TULO|(?:Sub)?Se[çc][ãa]o|(?:SUB)?SE[ÇC][ÃA]O)\s+(?:[ÚU]nic[oa]|ÚNIC[OA])', t):
            continue
        if re.fullmatch(RE_CAB + r'\s+[IVXLC]+(?:-[A-Z])?', t) or cab is not None and re.fullmatch(
                r'(?:T[ÍIíi]tulo|Cap[ÍIíi]tulo|(?:Sub)?Se[ÇCçc][ÃAãa]o|TÍTULO|CAPÍTULO|(?:SUB)?SEÇÃO)\s+[IVXLC]+(?:-[A-Z])?', t, re.I):
            cab, rubrica = [], None
            continue
        if cab is not None and t and len(t) < 150 and not re.search(r'[.;:!?)”"»]$', t) and not l.startswith('**'):
            cab.append(t)
            rubrica = ' '.join(cab)
            continue
        if art is None: continue
        # Fecho do diploma (local, data, assinaturas): nada mais é dispositivo.
        if re.match(r'^(Rio de Janeiro|Bras[íi]lia|Senado Federal|C[âa]mara dos Deputados|Congresso Nacional),\s*(?:em\s+)?\d', l): art = None; continue
        m = re.match(r'^§\s*(\d+)\.?\s*[ºo°]?\s*(?:-([A-Z])(?![a-zà-ú]))?\s*[.\-–—:]*\s*(.*)$', l)
        pu = re.match(r'^Par[áa]grafo\s+[úu]nico\s*[.\-–—:]*\s*(.*)$', l, re.I)
        if m or pu:
            chave = 'pu' if pu else m.group(1) + ('-' + m.group(2) if m.group(2) else '')
            texto, alt, rev = separa_anotacoes(pu.group(1) if pu else m.group(3))
            # Dispositivo que só existiu em MP que caducou ("§ 13. (Vide Medida Provisória nº 871, de 2019)",
            # Lei 8.742, art. 20; Lei 8.213, art. 60, §§ 12 e 13): não entra; nó descartável para os filhos.
            if not texto and so_vide_mp(pu.group(1) if pu else m.group(3)):
                seg, inc = {'texto': ''}, None
                continue
            p = novo_disp(texto, alt, rev)
            if rubrica: p['rubrica'] = rubrica
            # Parágrafo único renumerado como § 1º sem a redação antiga riscada no compilado
            # (Lei 12.318, art. 6º): o "Parágrafo único" de mesmo texto é a versão anterior.
            velho = art.get('par', {}).get('pu')
            # Também quando o § 1º traz "Redação dada"/"Renumerado" e o texto mudou pouco (Lei 13.089, art. 3º).
            if chave == '1' and velho and not velho.get('revogado') and (velho.get('texto') == texto
                    or re.search(r'Reda[çc][ãa]o\s+dada|Renumerad', pu.group(1) if pu else m.group(3), re.I)):
                del art['par']['pu']
            art.setdefault('par', {})[chave] = p
            seg, inc, rubrica = p, None, None
            continue
        # "l -", "ll -" (L minúsculo no lugar de I, erro do compilado da Lei 7.347).
        # Também "Il -" (CPP, art. 78) e outras misturas de I e l.
        l = re.sub(r'^([IVX]*l[IVXl]*)(?=\s*[-–—])', lambda mm: mm.group(1).replace('l', 'I'), l)
        # "III - texto", "VIII-A - texto", "I-A. – texto" (Lei 9.433, art. 33) e, sem travessão
        # (falha do compilado da CF, art. 93), "IX todos os julgamentos…": numeral seguido de minúscula.
        m = re.match(r'^([IVXL]+(?:-[A-Z](?![a-zà-ú]))?)\.?\s*[-–—]\s*(.*)$', l) or \
            re.match(r'^([IVXL]+(?:-[A-Z](?![a-zà-ú]))?)\s+(?=[a-zà-ú])(.*)$', l) or \
            re.match(r'^([IVXL]+)\)\s+(.*)$', l)  # "I) o número de testemunhas…" (Lei 1.521, art. 23)
        if m:
            chave, resto = m.group(1), m.group(2)
            # "V - A as causas…" é o inciso V-A, não um novo V (CF, arts. 92 e 109: o V-A apagava o V).
            sx = re.match(r'^([A-Z])\s+(?=[a-zà-ú])(.*)$', resto)
            if sx and '-' not in chave and chave in seg.get('inc', {}):
                chave, resto = chave + '-' + sx.group(1), sx.group(2)
            texto, alt, rev = separa_anotacoes(resto)
            if not texto and so_vide_mp(resto):
                inc = {'texto': ''}
                continue
            inc = novo_disp(texto, alt, rev)
            # Inciso que continua a lista do caput depois de §§ intercalados
            # (Lei 4.717, art. 7º: I, §§ 1º e 2º, II…VI): vai para o artigo.
            ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV']
            if (seg is not art and not seg.get('inc') and chave in ROM[1:]
                    and ROM[ROM.index(chave) - 1] in art.get('inc', {})
                    and chave not in art.get('inc', {})):
                seg = art
            # Linha só com anotação ("III - (Vide Lei nº 13.043…) Vigência", Lei 11.079, art. 6º) não
            # apaga o inciso de mesmo número já lido.
            if not texto and not rev and seg.get('inc', {}).get(chave, {}).get('texto'):
                inc = seg['inc'][chave]
                continue
            seg.setdefault('inc', {})[chave] = inc
            rubrica = None
            continue
        m = re.match(r'^Penas?\s*[-–—:]\s*(.*)$', l, re.I)
        if m:
            texto, alt, rev = separa_anotacoes(m.group(1))
            # Pena própria de inciso ou alínea que a anuncia com ":" (CPM, art. 191: "I - se a deserção
            # não chega a consumar-se: Pena - …; II - se consumada a deserção: Pena - …").
            dono = inc if inc is not None else seg
            if dono.get('ali') and dono['ali'][max(dono['ali'])].rstrip().endswith(':'):
                letra = max(dono['ali'])
                dono['ali'][letra] += '\nPena – ' + texto
                continue
            # Só quando o padrão começa no inciso I (ele mesmo, ou já com pena própria): a lista
            # "I - …; II - …; III - …:" seguida de pena é do artigo (CPM, art. 142).
            primeiro = next(iter(seg.get('inc', {}).values()), None)
            alvo = inc if (inc is not None and not inc.get('ali') and inc.get('texto', '').rstrip().endswith(':')
                           and (inc is primeiro or (primeiro or {}).get('pena'))) else seg
            # Pena nova com "(Redação dada…)" substitui a anterior que o compilado não riscou
            # (Lei 11.340, art. 24-A: "detenção, de 3 meses…" e depois "reclusão, de 2 a 5 anos…").
            if alvo.get('pena') and re.search(r'Reda[çc][ãa]o\s+dada', m.group(1), re.I): alvo['pena'] = ''
            # Pena repetida igual (CP, art. 121, § 2º: o compilado repete a linha depois dos incisos).
            if texto not in alvo.get('pena', '').split(' / '):
                alvo['pena'] = (alvo.get('pena', '') + ' / ' if alvo.get('pena') else '') + texto
            alvo['alt'] = junta_alt(alvo.get('alt'), alt)
            if not alvo['alt']: del alvo['alt']
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
        # Também o nome de uma subseção em negrito de duas linhas ("**Subseção I" /
        # "Da Guarda de Registros de Conexão**", Lei 12.965).
        if bruto.startswith('**') or sub_aberta and bruto.endswith('**') and bruto.count('**') == 1 and len(l) < 160:
            t, _, _ = separa_anotacoes(l)
            t = t.strip('* ').strip()
            if t and len(t) < 160 and not re.match(r'^(T[ÍI]TULO|CAP[ÍI]TULO|(?:SUB)?SE[ÇC][ÃA]O|PARTE|LIVRO)\b', t, re.I): rubrica = t
            else: rubrica = None
            continue
        # Linha solta (continuação) → acrescenta ao dispositivo corrente.
        texto, alt, rev = separa_anotacoes(l)
        # Item numerado direto no dispositivo, sem alínea ("I - o registro:" / "1) da instituição de bem
        # de família;" … "48) …" e "15 - da re-ratificação…", Lei 6.015, art. 167; "1°) o dia, mês…",
        # art. 54): um por linha. Vem antes dos filtros de título, que descartariam "38) (VETADO)" e
        # "13)" (só a anotação de revogação).
        alvo = inc if inc is not None else seg
        if alvo is not None and not alvo.get('ali') and re.match(r'^\d{1,2}[º°]?(?:[.)]|\s[-–])(?:\s|$)', texto) \
                and re.search(r':$|\n\d{1,2}[º°]?(?:[.)]|\s[-–])[^\n]*$', alvo['texto']):
            if re.search(r'Vig[êe]ncia\s+encerrada', l, re.I): continue  # item de MP que caducou (art. 167, II, 33)
            if re.fullmatch(r'\d{1,2}[º°]?[.)]', texto): texto += ' (Revogado)' if rev else ''
            alvo['texto'] += '\n' + texto
            continue
        # Cabeçalho em maiúsculas ("DO FUNDO DE INVESTIMENTO") não é continuação.
        if texto and texto.upper() == texto and re.search(r'[A-ZÁ-Ú]{3}', texto): continue
        # Rubrica/título sem negrito ("Fundos de Participação dos Estados"):
        # linha curta sem pontuação final também não é continuação.
        if texto and len(texto) < 150 and not re.search(r'[.;:!?)”"»]$', texto): continue
        if texto and not re.match(r'^(T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O|PARTE|LIVRO)\b', texto, re.I) and len(texto) > 3:
            alvo = inc if inc is not None else seg
            # Subitem numerado da alínea ("a) as locações: 1. de imóveis…; 2. de vagas…", Lei 8.245,
            # art. 1º, parágrafo único): fica na alínea, um por linha.
            if alvo.get('ali') and re.match(r'^\d{1,2}[.)]\s', texto):
                letra = max(alvo['ali'])
                alvo['ali'][letra] += '\n' + texto
                continue
            alvo['texto'] = (alvo['texto'] + ' ' + texto).strip()
    return artigos

if __name__ == '__main__':
    args, opts = [], {}
    it = iter(sys.argv[1:])
    for a in it:
        if a in ('--inicio', '--fim'): opts[a[2:]] = next(it)
        elif a == '--rubrica-capitulo': opts['rubrica_capitulo'] = True
        else: args.append(a)
    md, ident, nome, fonte, saida = args[:5]
    data = args[5] if len(args) > 5 else datetime.date.today().isoformat()
    arts = converter(md, opts.get('inicio'), opts.get('fim'), opts.get('rubrica_capitulo', False))
    out = {'id': ident, 'nome': nome, 'fonte': fonte, 'dataTexto': data, 'artigos': arts}
    if ANEXO: out['anexo'] = dict(ANEXO)
    json.dump(out, open(saida, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    print('%d artigos → %s' % (len(arts), saida))
