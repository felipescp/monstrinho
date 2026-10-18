#!/usr/bin/env python3
"""Convenção promulgada por decreto (CADH, Decreto 678/1992; Convenção contra a
Tortura, Decreto 98.386/1989; Convenção de Belém do Pará, Decreto 1.973/1996) → JSON da lei seca.

A convenção não segue o padrão de lei brasileira (caput, §, inciso): cada "ARTIGO N"
tem rubrica e itens numerados ("1.", "2."), que podem ter alíneas ("a)").
Guardamos os itens em "inc" (chave "1", "2"…) e as alíneas em "ali" do item; o
diploma leva "numeracao": "itens" para o app rotular "1." e "a)" em vez de
"§"/"inciso". Alíneas sem item (ex.: art. 33) ficam em "ali" do próprio artigo.
Parágrafos sem número (Convenção contra a Tortura, arts. 2, 6, 13) ficam no
"texto" separados por quebra de linha; o parágrafo que vem depois das alíneas
(art. 12) vai para "fecho".

Uso (CADH, padrão): python3 ferramentas/convencao_planalto.py D678.md dados/legislacao/cadh.json
Outra convenção:    python3 ferramentas/convencao_planalto.py <compilado.md> <saida.json> <ID> "<Nome>" <url> AAAA-MM-DD "<TÍTULO DA CONVENÇÃO>"
"""
import json
import re
import sys


def limpar(t):
    t = re.sub(r'\\([.*_\-])', r'\1', t)
    t = re.sub(r'\*\*|__', '', t)
    return re.sub(r'\s+', ' ', t).strip()


CADH = ('CADH', 'Convenção Americana sobre Direitos Humanos (Pacto de São José da Costa Rica)',
        'https://www.planalto.gov.br/ccivil_03/decreto/d0678.htm', '2026-10-15', 'CONVENÇÃO AMERICANA SOBRE DIREITOS HUMANOS')


def main(src, dst, ident=CADH[0], nome=CADH[1], fonte=CADH[2], data=CADH[3], titulo=CADH[4]):
    linhas = [limpar(l) for l in open(src, encoding='utf-8')]
    linhas = [l for l in linhas if l]
    ini = next(i for i, l in enumerate(linhas) if l.upper() == titulo.upper())
    # Fim: declarações e reservas (CADH) ou fecho dos plenipotenciários ("Em fé do que…", Belém do Pará).
    fim = next((i for i, l in enumerate(linhas) if i > ini and (l.startswith('Declarações e reservas') or re.match(r'Em f[ée] do que', l, re.I))), len(linhas))
    artigos, art, item = {}, None, None
    i = ini
    while i < fim:
        t = linhas[i]
        m = re.match(r'ARTIGO\s+(\d+)$', t, re.I)  # "ARTIGO 1" (CADH) ou "Artigo 1" (Belém do Pará)
        if m:
            art = {'texto': ''}
            artigos[m.group(1)] = art
            item = None
            prox = linhas[i + 1] if i + 1 < fim else ''
            if prox and not re.match(r'(\d+\.|[a-z]\)|ARTIGO|CAP[ÍI]TULO|PARTE|Se[çc][ãa]o)', prox, re.I) and len(prox) < 90 and not prox.endswith(('.', ':', ';')):
                art['rubrica'] = prox
                i += 1
            i += 1
            continue
        if art is None or re.match(r'(PARTE\s+[IVX]+|CAP[ÍI]TULO\s+[IVX]+|Se[çc][ãa]o\s+\d)', t, re.I):
            i += 1
            continue
        m = re.match(r'(\d+)\.\s+(.*)$', t)
        if m:
            item = {'texto': m.group(2)}
            art.setdefault('inc', {})[m.group(1)] = item
            i += 1
            continue
        m = re.match(r'([a-z])\)\s+(.*)$', t)
        if m:
            alvo = item if item is not None else art
            alvo.setdefault('ali', {})[m.group(1)] = m.group(2)
            i += 1
            continue
        # Linha de título (nome de capítulo/seção) logo antes de um ARTIGO: ignora.
        titulo = len(t) < 90 and not t.endswith(('.', ':', ';', ','))
        if titulo and i + 1 < fim and (re.match(r'ARTIGO\s+\d+$', linhas[i + 1], re.I) or re.match(r'(CAP[ÍI]TULO|Se[çc][ãa]o|PARTE)', linhas[i - 1], re.I)):
            i += 1
            continue
        if item is not None:
            item['texto'] += ' ' + t
        elif art.get('ali'):
            art['fecho'] = (art.get('fecho', '') + '\n' + t).strip()
        else:
            art['texto'] = (art['texto'] + '\n' + t).strip()
        i += 1
    saida = {
        'id': ident,
        'nome': nome,
        'fonte': fonte,
        'dataTexto': data,
        'numeracao': 'itens',
        'artigos': artigos,
    }
    with open(dst, 'w', encoding='utf-8') as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print(len(artigos), 'artigos')


if __name__ == '__main__':
    main(*sys.argv[1:8])
