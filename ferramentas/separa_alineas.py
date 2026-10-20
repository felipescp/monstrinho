#!/usr/bin/env python3
"""Separa alíneas que ficaram emendadas no texto de artigo ou parágrafo, sem inciso
("§ 1º - O regime fechado…: a) regime fechado…; b) regime semi-aberto…; c) …").

Até 20/10/2026, legislacao_planalto.py só aceitava alínea dentro de inciso; a alínea direto
no artigo ou parágrafo virava continuação do texto. O extrator foi corrigido, mas os
compilados antigos não estavam à mão; este script corrige os JSONs já gerados.

Só separa o padrão completo: "a)" depois de ":" ou ";" e as letras seguintes em ordem
(b, c, d…), cada uma depois de ";", ":" ou ".". Não mexe em texto citado de outra lei
(artigo que "passa a vigorar com…", aspas “ ”) nem nos diplomas com numeração por itens.

Uso: python3 ferramentas/separa_alineas.py [--gravar] dados/legislacao/*.json
"""
import json
import re
import sys

# Anotação que o extrator antigo não tirava (ECA, art. 148, parágrafo único).
RE_EXPR = re.compile(r'\s*\(Express(?:ão|ões)\s+substitu[íi]d[ao]s?\s+pela\s+Lei\s+n\S*\s*([\d.]+),\s+de\s+(\d{4})\)')
RE_ALI = re.compile(r'(?:(?<=[:;.])|(?<=[:;.]["”]))\s+([a-z])\)\s+')


def separar(texto):
    """→ (texto antes da alínea "a", {letra: texto}) ou None."""
    if '“' in texto or re.search(r'passa(?:m)? a vigorar|seguinte reda[çc][ãa]o', texto, re.I):
        return None
    marcas, esperada = [], 'a'
    for m in RE_ALI.finditer(texto):
        if m.group(1) == esperada:
            if esperada == 'a' and not re.search(r'[:;]\s*$', texto[:m.start() + 1]):
                continue
            marcas.append(m)
            esperada = chr(ord(esperada) + 1)
    if len(marcas) < 2:
        return None
    ali = {}
    for i, m in enumerate(marcas):
        fim = marcas[i + 1].start() if i + 1 < len(marcas) else len(texto)
        # Subitens "1)", "2)" dentro da alínea (Lei 6.404, art. 183, § 1º, d): um por linha.
        ali[m.group(1)] = re.sub(r'(?<=[:;])\s+(?=\d+\)\s)', '\n', texto[m.end():fim].strip())
    return texto[:marcas[0].start()].strip(), ali


def main(args):
    gravar = '--gravar' in args
    total = 0
    for f in [a for a in args if a != '--gravar']:
        j = json.load(open(f, encoding='utf-8'))
        if j.get('numeracao') == 'itens':
            continue
        mudou = False
        for k, art in j['artigos'].items():
            nos = [('caput', art)] + [('§' + p, x) for p, x in art.get('par', {}).items()]
            for rot, no in nos:
                if no.get('ali') or no.get('revogado'):
                    continue
                texto, alts = no.get('texto', ''), RE_EXPR.findall(no.get('texto', ''))
                if alts and re.search(r'\s[a-z]\)\s', texto):
                    texto = RE_EXPR.sub('', texto)
                    ano, num = max((int(a), n) for n, a in alts)
                    if not no.get('alt') or int(no['alt'][-4:]) < ano: no['alt'] = 'Lei %s/%d' % (num, ano)
                r = separar(texto)
                if not r:
                    continue
                no['texto'], no['ali'] = r
                mudou = True
                total += 1
                print('%s art. %s %s → %s' % (f.split('/')[-1], k, rot, ', '.join(r[1])))
        if mudou and gravar:
            with open(f, 'w', encoding='utf-8') as out:
                json.dump(j, out, ensure_ascii=False, separators=(',', ':'))
    print(total, 'dispositivos')


if __name__ == '__main__':
    main(sys.argv[1:])
