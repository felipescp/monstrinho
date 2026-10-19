#!/usr/bin/env python3
"""Mapa de incidência da Lei Seca a partir de material de "questões de concurso".

O material (ex.: Eduardo B. S. Teixeira, exportado do Word para Markdown) traz,
no fim de cada dispositivo cobrado, as provas em que ele caiu:
"(MPSP-2008/2010/2017) (TJRS-2022)". Cada ano conta como uma cobrança.

Só a CONTAGEM por dispositivo e a estrutura (títulos e capítulos) vão para o
arquivo de saída; comentários e questões do material não são copiados.

Uso:
    python3 ferramentas/incidencia_questoes.py MATERIAL.md dados/legislacao/lei-11343.json \
        dados/leiseca/incidencia/lei-11343.json --fonte "Material de questões (Eduardo B. S. Teixeira), até 01/07/2026"

Chaves dos dispositivos: "33" (caput), "33§4", "33§pu", "28.II", "33§1.I".
Tratados com itens numerados (base com "numeracao": "itens", ex.: CADH): o
cabeçalho é "Artigo 4." e a chave do item é "4.1"; a estrutura é Parte > Capítulo.
Dispositivo renumerado depois do material: --alias "57§pu=57§1".
Material com mais de um diploma (CF e ADCT): --ate / --desde com a linha que os
separa ("ATO DAS DISPOSIÇÕES CONSTITUCIONAIS TRANSITÓRIAS").
Capítulo cujo cabeçalho falta no material: --capitulo "10=Cap. IV — Nome" (vale
a partir do artigo indicado, até o próximo capítulo do material); título, com
--titulo "209=Disposições finais e transitórias" (zera o capítulo).
Alíneas contam no inciso (ou parágrafo) a que pertencem. Dispositivo que não
existe na base de lei seca é listado no fim e fica fora do arquivo.
"""
import argparse
import collections
import json
import re
import sys

RE_ARTIGO = re.compile(r'(?:Artigo|ARTIGO)\s+(\d+)\s*(?:º|°)?\s*(?:\.|$)')
TAG = re.compile(r'\(([^()]{2,80}?-(?:19|20)\d{2}(?:/(?:19|20)\d{2})*)\)')
# Letra do artigo ("Art. 4º-A", "Art. 18-A."), não a palavra que abre o texto
# ("Art. 4º - A EXECUÇÃO FISCAL…", Lei 6.830): hífen colado ou letra seguida de "." ou "º".
RE_ART = re.compile(r'Art\.\s*(\d+(?:\.\d{3})?)\s*(?:º|°|o\b)?(?:(?<=[\dº°o])-\s*([A-Z])|\s*-\s*([A-Z])(?=[.º°]))?')


def chave_art(m):
    letra = m.group(2) or m.group(3)
    return m.group(1).replace('.', '') + ('-' + letra if letra else '')


def limpar(t):
    # Markdown do Word: **negrito**, [texto](link), [texto]{.mark}/{.underline} (pandoc).
    t = re.sub(r'\]\{[^}]*\}', '', t)
    t = re.sub(r'^(?:>\s*|&nbsp;\s*)+', '', t.strip())  # citação (blockquote), espaço do Joplin
    # ~~tachado~~: dispositivo com eficácia suspensa pelo STF (Improbidade), ainda cobrado.
    return re.sub(r'[*\\_]|~~|\[|\]\([^)]*\)', '', t).strip()


def romano(r):
    v = {'I': 1, 'V': 5, 'X': 10, 'L': 50}
    return sum(-v[c] if v[c] < v.get(r[i + 1:i + 2], 0) else v[c] for i, c in enumerate(r))


def arabico_romano(n):
    s = ''
    for v, c in ((50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')):
        while n >= v:
            s, n = s + c, n - v
    return s


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('material')
    ap.add_argument('base')
    ap.add_argument('saida')
    ap.add_argument('--fonte', default='')
    ap.add_argument('--alias', action='append', default=[],
                    help='dispositivo renumerado depois do material: "57§pu=57§1"')
    ap.add_argument('--desde', help='linha do material (exata, sem formatação) onde o diploma começa')
    ap.add_argument('--ate', help='linha do material (exata, sem formatação) onde o diploma termina')
    ap.add_argument('--capitulo', action='append', default=[],
                    help='capítulo que falta no material, a partir de um artigo: "10=Cap. IV — Nome"')
    ap.add_argument('--titulo', action='append', default=[],
                    help='título que falta no material, a partir de um artigo: "209=Disposições finais"')
    a = ap.parse_args()

    alias = dict(x.split('=', 1) for x in a.alias)
    cap_extra = dict(x.split('=', 1) for x in a.capitulo)
    tit_extra = dict(x.split('=', 1) for x in a.titulo)
    base = json.load(open(a.base, encoding='utf-8'))
    B = base['artigos']
    # Questões e comentários vêm em tabelas (Markdown "|" ou HTML "<table>",
    # "<p>"): ficam de fora; só o texto da lei, com as marcas de prova, conta.
    brutas = [l for l in open(a.material, encoding='utf-8')
              if l.strip() and not l.strip().startswith(('|', '<'))]
    if a.desde or a.ate:
        idx = [limpar(l) for l in brutas]
        ini = idx.index(a.desde) if a.desde else 0
        fim = idx.index(a.ate, ini + 1) if a.ate else len(brutas)
        brutas = brutas[ini:fim]
    itens = base.get('numeracao') == 'itens'
    num_cap = num_parte = 0
    linhas = [limpar(l) for l in brutas]
    # Cabeçalho de artigo do material vem em negrito ("**Art. 1º", "**[Art. 121]");
    # artigo citado no meio dos comentários, em texto simples.
    negrito = [re.sub(r'^(?:\s|>|&nbsp;)+', '', l).startswith(('**', '[Art', '*[')) for l in brutas]

    def nome_seguinte(i):
        j = i + 1
        while j < len(linhas) and linhas[j].startswith('(') and not re.match(r'\(VETADO\)', linhas[j], re.I):
            j += 1
        if j >= len(linhas):
            return ''
        t = linhas[j]
        if re.match(r'(T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O|LIVRO|Art\.|Artigo\s|ARTIGO\s)', t):
            return ''
        # Nome em caixa alta quebrado em várias linhas ("DA REPRESSÃO … / E AO TRÁFICO …").
        while (j + 1 < len(linhas) and t.isupper() and linhas[j + 1].isupper()
               and not re.match(r'(T[ÍI]TULO|CAP[ÍI]TULO|SE[ÇC][ÃA]O|LIVRO|Art\.|Artigo\s|ARTIGO\s)', linhas[j + 1])):
            j += 1
            t += ' ' + linhas[j]
        t = t.strip(' "“”\'.:')
        return t[:1].upper() + t[1:].lower()

    POS = {k: i for i, k in enumerate(B)}

    def ordem(a):
        # Sequência (par, inc) do artigo na base: caput, incisos, §§ e seus incisos.
        no = B.get(a) or {}
        o = [(None, None)] + [(None, k) for k in (no.get('inc') or {})]
        for p, q in (no.get('par') or {}).items():
            o += [(p, None)] + [(p, k) for k in (q.get('inc') or {})]
        return o
    com_negrito = set()
    for t, n in zip(linhas, negrito):
        m = RE_ART.match(t)
        if m and n:
            com_negrito.add(chave_art(m))
    JANELA = 25  # artigos adiante aceitos como próximo cabeçalho (revogados/omitidos no meio)
    cont = collections.Counter()
    fora = collections.Counter()
    estrutura, vistos = [], set()
    titulo = capitulo = None
    parte = livro = livro_nome = ''
    art = par = inc = None
    for i, t in enumerate(linhas):
        if itens:
            # Tratado: "PARTE I" (nome na linha seguinte) ou "PARTE 1 - POLÍTICA GERAL",
            # e capítulos de numeração contínua (o material da CADH traz
            # "CAPÍTULO IV" no lugar do IX: segue a sequência).
            m = re.match(r'PARTE\s+([IVX]+|\d+)(?:\s*[-–—]\s*(.+))?$', t)
            if m:
                num_parte = int(m.group(1)) if m.group(1).isdigit() else romano(m.group(1))
                nome = m.group(2) or nome_seguinte(i)
                titulo = 'Parte ' + arabico_romano(num_parte) + ' — ' + nome[:1].upper() + nome[1:].lower()
                capitulo = None
                continue
            # Parte sem o rótulo, só o nome em caixa alta antes do artigo (Convenção
            # 169 da OIT: "INDÚSTRIAS RURAIS" é a Parte IV), em tratado sem capítulos.
            if (num_parte and not num_cap and t.isupper() and not re.search(r'\d', t)
                    and i + 1 < len(linhas) and RE_ARTIGO.match(linhas[i + 1])
                    and not re.match(r'PARTE\b', linhas[i - 1])):
                num_parte += 1
                titulo = 'Parte ' + arabico_romano(num_parte) + ' — ' + t[:1] + t[1:].lower()
                continue
            m = re.match(r'CAP[ÍI]TULO\s+([IVXL]+|\d+)$', t, re.I)  # "Capitulo 1" (Belém do Pará)
            if m:
                n = int(m.group(1)) if m.group(1).isdigit() else romano(m.group(1).upper())
                num_cap = n if n > num_cap else num_cap + 1
                capitulo = 'Cap. ' + arabico_romano(num_cap) + ' — ' + nome_seguinte(i)
                continue
            # Cabeçalho em negrito; sem negrito, só se for o artigo seguinte da base.
            m = RE_ARTIGO.match(t)
            seguinte = list(B)[POS[art] + 1] if art in POS and POS[art] + 1 < len(B) else None
            if m and (negrito[i] or m.group(1) == seguinte) and m.group(1) in B and m.group(1) not in vistos:
                art, par, inc = m.group(1), None, None
                vistos.add(art)
                if art in tit_extra:
                    titulo, capitulo = tit_extra[art], None
                capitulo = cap_extra.get(art, capitulo)
                if not estrutura or estrutura[-1]['titulo'] != titulo or estrutura[-1]['capitulo'] != capitulo:
                    estrutura.append({'titulo': titulo, 'capitulo': capitulo, 'arts': []})
                estrutura[-1]['arts'].append(art)
                continue
            if not art or re.match(r'SE[ÇC][ÃA]O\b', t, re.I):
                continue
            # Item "1." do artigo; alínea "a." ou "a)" conta no item (ou no caput);
            # parágrafo sem número continua o item (ou o caput) corrente.
            m = re.match(r'(\d+)\s*\.(?!\d)', t)
            if m and m.group(1) in (B[art].get('inc') or {}):
                inc = m.group(1)
        # Códigos com Parte Geral e Parte Especial repetem a numeração dos títulos.
        m = re.match(r'PARTE(GERAL|ESPECIAL)$', re.sub(r'\s+', '', t).upper())  # "P A R T E  E S P E C I A L", "Parte Especial"
        if m:
            parte = 'PG · ' if m.group(1) == 'GERAL' else 'PE · '
            livro = ''
            titulo = capitulo = None
            continue
        # Livros (CC, CPC): o número dos títulos recomeça em cada livro.
        m = re.match(r'LIVRO\s+([IVXL]+|COMPLEMENTAR|PRIMEIRO|SEGUNDO|TERCEIRO|QUARTO|QUINTO|SEXTO)$', t)
        if m:
            ordinal = {'PRIMEIRO': 'I', 'SEGUNDO': 'II', 'TERCEIRO': 'III', 'QUARTO': 'IV', 'QUINTO': 'V', 'SEXTO': 'VI'}  # CTN
            livro = 'Livro ' + ('Complementar' if m.group(1) == 'COMPLEMENTAR' else ordinal.get(m.group(1), m.group(1)))
            livro_nome = nome_seguinte(i)
            # Livro sem títulos (ex.: CPP, Livro VI): o próprio livro é o grupo.
            titulo = parte + livro + ' — ' + livro_nome
            livro += ' · '
            capitulo = None
            continue
        # "TÍTULO I" ou, sozinho na linha, "Título I" (ECA).
        m = re.match(r'T[ÍI]TULO\s+([IVXL]+(?:-[A-Z])?|[ÚU]NICO)$', t) or re.fullmatch(r'T[íi]tulo\s+([IVXL]+(?:-[A-Z])?|[ÚUúu]nico)', t)
        if m:
            num = 'único' if m.group(1).upper() in ('ÚNICO', 'UNICO') else m.group(1)
            nome = nome_seguinte(i) or (livro_nome if num == 'único' else '')
            titulo = parte + livro + 'Título ' + num + (' — ' + nome if nome else '')
            capitulo = None
            continue
        # "CAPÍTULO II" ou, sozinho na linha, "Capítulo II" (Juizados Especiais).
        m = re.match(r'CAP[ÍI]TULO\s+([IVXL]+(?:-[A-Z])?)\b', t) or re.fullmatch(r'Cap[íi]tulo\s+([IVXL]+(?:-[A-Z])?)', t)
        if m:
            capitulo = 'Cap. ' + m.group(1) + ' — ' + nome_seguinte(i)
            continue
        m = None if itens else RE_ART.match(t)
        if itens:
            pass
        elif m:
            novo = chave_art(m)
            # Artigo citado dentro de comentário ("Art. 355. O juiz julgará…" de
            # novo, ou outro mais à frente): não muda o artigo corrente. Artigo que
            # tem cabeçalho em negrito no material só vale nele; os demais (vetado,
            # não cobrado) valem em texto simples. Em todo caso, só o que ainda não
            # apareceu e está adiante na base.
            if novo == art:
                par = inc = None  # o mesmo artigo de novo (caput repetido): as marcas contam nele
            elif novo in com_negrito and not negrito[i]:
                continue
            elif novo in B and art in POS and (novo in vistos or not 0 < POS[novo] - POS[art] <= JANELA):
                continue
            # Artigo de outra lei citado no comentário: "Art. 22 da Lei 13.869/19",
            # ou ausente da base e fora da sequência ("Art. 150 - Entrar…" do CP no art. 5º da CF).
            elif re.match(r'\s*(?:º|°|o\b)?\s*,?\s*d[aeo]s?\s', t[m.end():]):
                continue
            elif novo not in B and art and not 0 <= int(m.group(1).replace('.', '')) - int(re.match(r'\d+', art).group()) <= JANELA:
                continue
            else:
                art = novo
                par = inc = None
            if art in B and art not in vistos:
                vistos.add(art)
                if art in tit_extra:
                    titulo, capitulo = tit_extra[art], None
                capitulo = cap_extra.get(art, capitulo)
                if not estrutura or estrutura[-1]['titulo'] != titulo or estrutura[-1]['capitulo'] != capitulo:
                    estrutura.append({'titulo': titulo, 'capitulo': capitulo, 'arts': []})
                estrutura[-1]['arts'].append(art)
        elif art:
            m = re.match(r'§\s*(\d+)\s*(?:º|°|o)?(?:-([A-Z])(?![A-Za-zÀ-ú]))?', t) or re.match(r'(Parágrafo\s+único)', t, re.I)
            if m:
                novo = ('pu' if m.group(1).lower().startswith('par') else m.group(1) + ('-' + m.group(2) if m.lastindex and m.lastindex > 1 and m.group(2) else ''), None)
            else:
                m = re.match(r'([IVXLC]+)\s*[-–—]', t)
                if m:
                    novo = (par, m.group(1))
                elif not re.match(r'[a-z]\)|\d+\)', t):  # alínea, ou subitem "1)" de alínea (ECA, art. 83)
                    continue
                else:
                    novo = (par, inc)
            # Trecho de lei citado no comentário, sem negrito e sem marca de prova
            # ("§ 3º A abertura de crédito…" no meio do art. 62, § 1º): só muda a
            # posição se for o dispositivo seguinte da base.
            if '**' not in brutas[i] and not TAG.search(t) and (par, inc) in ordem(art):
                o = ordem(art)
                k = o.index((par, inc))
                if not (novo in o[k + 1:k + 4] or (novo[0] and (None, novo[1]) in o[k + 1:k + 4])):
                    continue
            par, inc = novo
        if not art:
            continue
        tags = TAG.findall(t)
        if not tags:
            continue
        # Cada ano é uma cobrança; a barra de "Cartórios/TJPI-2013" ou "ENAM/2º-2024" não.
        n = sum(1 + len(re.findall(r'/(?:19|20)\d{2}', g)) for g in tags)
        chave = art + ('§' + par if par else '') + ('.' + inc if inc else '')
        chave = alias.get(chave, chave)
        if chave != art + ('§' + par if par else '') + ('.' + inc if inc else ''):
            art, par, inc = (re.match(r'([^§.]+)(?:§([^.]+))?(?:\.(.+))?$', chave).groups())
        no = B.get(art)
        ok = bool(no)
        if ok and par:
            no = no.get('par', {}).get(par)
            ok = bool(no)
        if ok and inc:
            ok = inc in (no.get('inc') or {})
        # Inciso do caput lido depois de um "§" citado no comentário (mesmo um
        # "§" que o artigo não tem, como o "§ 5º" da Lei de Migração no art. 5º).
        if not ok and par and inc and B.get(art) and inc in (B[art].get('inc') or {}):
            chave, ok = art + '.' + inc, True
        if ok:
            cont[chave] += n
        else:
            fora[chave] += n

    # Só a Parte Especial marcada (CC): o que vem antes dela é a Parte Geral.
    if any((g['titulo'] or '').startswith('PE · ') for g in estrutura):
        for g in estrutura:
            if (g['titulo'] or '').startswith('PE · '):
                break
            if g['titulo'] and not g['titulo'].startswith('PG · '):
                g['titulo'] = 'PG · ' + g['titulo']

    # Artigos da base que o material não trouxe (ex.: revogados): entram logo
    # depois do artigo anterior da base, no mesmo grupo dele.
    anterior = None
    for k in B:
        if k in vistos:
            anterior = k
            continue
        g = next((g for g in estrutura if anterior in g['arts']), None)
        if g:
            g['arts'].insert(g['arts'].index(anterior) + 1, k)
        elif estrutura:
            estrutura[0]['arts'].insert(0, k)
        else:
            estrutura.append({'titulo': None, 'capitulo': None, 'arts': [k]})
        vistos.add(k)
        anterior = k

    saida = {
        'id': base.get('id'),
        'fonte': a.fonte,
        'estrutura': estrutura,
        'dispositivos': dict(sorted(cont.items(), key=lambda kv: -kv[1])),
    }
    with open(a.saida, 'w', encoding='utf-8') as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print('dispositivos', len(cont), '· cobranças', sum(cont.values()),
          '· artigos na estrutura', sum(len(g['arts']) for g in estrutura), 'de', len(B))
    if fora:
        print('não localizados na base:', dict(fora), file=sys.stderr)


if __name__ == '__main__':
    main()
