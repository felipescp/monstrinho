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
Alíneas contam no inciso (ou parágrafo) a que pertencem. Dispositivo que não
existe na base de lei seca é listado no fim e fica fora do arquivo.
"""
import argparse
import collections
import json
import re
import sys

TAG = re.compile(r'\(([^()]{2,80}?-(?:19|20)\d{2}(?:/(?:19|20)\d{2})*)\)')
RE_ART = re.compile(r'Art\.\s*(\d+(?:\.\d{3})?)\s*(?:º|°|o\b)?\s*(?:-\s*([A-Z]))?')


def limpar(t):
    # Markdown do Word: **negrito**, [texto](link), [texto]{.mark}/{.underline} (pandoc).
    t = re.sub(r'\]\{[^}]*\}', '', t)
    t = re.sub(r'^(?:>\s*)+', '', t.strip())  # citação (blockquote)
    return re.sub(r'[*\\_]|\[|\]\([^)]*\)', '', t).strip()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('material')
    ap.add_argument('base')
    ap.add_argument('saida')
    ap.add_argument('--fonte', default='')
    a = ap.parse_args()

    base = json.load(open(a.base, encoding='utf-8'))
    B = base['artigos']
    # Questões e comentários vêm em tabelas (Markdown "|" ou HTML "<table>",
    # "<p>"): ficam de fora; só o texto da lei, com as marcas de prova, conta.
    linhas = [limpar(l) for l in open(a.material, encoding='utf-8')
              if l.strip() and not l.strip().startswith(('|', '<'))]

    def nome_seguinte(i):
        j = i + 1
        while j < len(linhas) and linhas[j].startswith('(') and not re.match(r'\(VETADO\)', linhas[j], re.I):
            j += 1
        if j >= len(linhas):
            return ''
        t = linhas[j]
        # Nome em caixa alta quebrado em várias linhas ("DA REPRESSÃO … / E AO TRÁFICO …").
        while (j + 1 < len(linhas) and t.isupper() and linhas[j + 1].isupper()
               and not re.match(r'(TÍTULO|CAPÍTULO|SEÇÃO|Art\.)', linhas[j + 1])):
            j += 1
            t += ' ' + linhas[j]
        return t[:1].upper() + t[1:].lower()

    cont = collections.Counter()
    fora = collections.Counter()
    estrutura, vistos = [], set()
    titulo = capitulo = None
    parte = ''
    art = par = inc = None
    for i, t in enumerate(linhas):
        # Códigos com Parte Geral e Parte Especial repetem a numeração dos títulos.
        m = re.match(r'PARTE\s+(GERAL|ESPECIAL)\b', t)
        if m and not RE_ART.match(t):
            parte = 'PG · ' if m.group(1) == 'GERAL' else 'PE · '
            titulo = capitulo = None
            continue
        m = re.match(r'TÍTULO\s+([IVXL]+(?:-[A-Z])?)$', t)
        if m:
            titulo = parte + 'Título ' + m.group(1) + ' — ' + nome_seguinte(i)
            capitulo = None
            continue
        m = re.match(r'CAPÍTULO\s+([IVXL]+(?:-[A-Z])?)\b', t)
        if m:
            capitulo = 'Cap. ' + m.group(1) + ' — ' + nome_seguinte(i)
            continue
        m = RE_ART.match(t)
        if m:
            art = m.group(1).replace('.', '') + ('-' + m.group(2) if m.group(2) else '')
            par = inc = None
            if art in B and art not in vistos:
                vistos.add(art)
                if not estrutura or estrutura[-1]['titulo'] != titulo or estrutura[-1]['capitulo'] != capitulo:
                    estrutura.append({'titulo': titulo, 'capitulo': capitulo, 'arts': []})
                estrutura[-1]['arts'].append(art)
        elif art:
            m = re.match(r'§\s*(\d+)\s*(?:º|°|o)?(?:-([A-Z])(?![A-Za-zÀ-ú]))?', t) or re.match(r'(Parágrafo único)', t, re.I)
            if m:
                par = 'pu' if m.group(1).lower().startswith('par') else m.group(1) + ('-' + m.group(2) if m.lastindex and m.lastindex > 1 and m.group(2) else '')
                inc = None
            else:
                m = re.match(r'([IVXLC]+)\s*[-–—]', t)
                if m:
                    inc = m.group(1)
                elif not re.match(r'[a-z]\)', t):
                    continue
        if not art:
            continue
        tags = TAG.findall(t)
        if not tags:
            continue
        n = sum(1 + g.count('/') for g in tags)
        chave = art + ('§' + par if par else '') + ('.' + inc if inc else '')
        no = B.get(art)
        ok = bool(no)
        if ok and par:
            no = no.get('par', {}).get(par)
            ok = bool(no)
        if ok and inc:
            ok = inc in (no.get('inc') or {})
        if ok:
            cont[chave] += n
        else:
            fora[chave] += n

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
