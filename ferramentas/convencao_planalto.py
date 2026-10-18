#!/usr/bin/env python3
"""Convenção promulgada por decreto (CADH, Decreto 678/1992; Convenção contra a
Tortura, Decreto 98.386/1989; Convenção de Belém do Pará, Decreto 1.973/1996; Desaparecimento Forçado, Decreto 8.766/2016; Protocolo de San Salvador, Decreto 3.321/1999) → JSON da lei seca.

A convenção não segue o padrão de lei brasileira (caput, §, inciso): cada "ARTIGO N"
tem rubrica e itens numerados ("1.", "2."), que podem ter alíneas ("a)").
Guardamos os itens em "inc" (chave "1", "2"…) e as alíneas em "ali" do item; o
diploma leva "numeracao": "itens" para o app rotular "1." e "a)" em vez de
"§"/"inciso". Alíneas sem item (ex.: art. 33) ficam em "ali" do próprio artigo.
Artigos em romanos ("Artigo IV") mantêm a chave "IV". Parágrafos sem número (Convenção contra a Tortura, arts. 2, 6, 13) ficam no
"texto" separados por quebra de linha; o parágrafo que vem depois das alíneas
(art. 12) vai para "fecho".

Uso (CADH, padrão): python3 ferramentas/convencao_planalto.py D678.md dados/legislacao/cadh.json
Outra convenção:    python3 ferramentas/convencao_planalto.py <compilado.md> <saida.json> <ID> "<Nome>" <url> AAAA-MM-DD "<TÍTULO DA CONVENÇÃO>"
"""
import json
import re
import sys


def limpar(t):
    t = re.sub(r'^\s*#+\s*', '', t)  # cabeçalho Markdown ("## Artigo 4", "# Direito à saúde")
    t = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', t).replace('\u2011', '-')  # link; hífen inseparável ("comprometem‑se")
    t = re.sub(r'\\([.*_\-])', r'\1', t)
    t = re.sub(r'\*\*|__', '', t).replace('\u00ad', '')  # hífen invisível ("desa­parecimento")
    return re.sub(r'\s+', ' ', t).strip()


CADH = ('CADH', 'Convenção Americana sobre Direitos Humanos (Pacto de São José da Costa Rica)',
        'https://www.planalto.gov.br/ccivil_03/decreto/d0678.htm', '2026-10-15', 'CONVENÇÃO AMERICANA SOBRE DIREITOS HUMANOS')


def main(src, dst, ident=CADH[0], nome=CADH[1], fonte=CADH[2], data=CADH[3], titulo=CADH[4]):
    brutas = []
    for l in open(src, encoding='utf-8'):
        # Página salva como uma célula de tabela, com <br> entre as linhas (Protocolo de San Salvador, site da CIDH).
        brutas += l.strip().strip('|').split('<br>') if '<br>' in l else [l]
    brutas = [b for b in brutas if limpar(b) and limpar(b) != '*']  # "\*" solto no fim do compilado
    linhas = [limpar(b) for b in brutas]
    negrito = [bool(re.match(r'\s*(\*\*|#)', b)) for b in brutas]
    ini = next(i for i, l in enumerate(linhas) if l.upper() == titulo.upper())
    # Fim: declarações e reservas (CADH) ou fecho dos plenipotenciários ("Em fé do que…", Belém do Pará).
    # Navegação da página da CIDH ("[ ÍNDICE | ANTERIOR | PRÓXIMO ]") também encerra.
    fim = next((i for i, l in enumerate(linhas) if i > ini and (l.startswith('Declarações e reservas') or re.match(r'Em f[ée] do que', l, re.I) or ('ÍNDICE' in l and 'ANTERIOR' in l))), len(linhas))
    artigos, art, item = {}, None, None
    i = ini
    while i < fim:
        t = linhas[i]
        m = re.match(r'ARTIGO\s+(\d+|[IVXL]+)$', t, re.I)  # "ARTIGO 1" (CADH), "Artigo 1" (Belém do Pará), "Artigo IV" (Desaparecimento Forçado)
        if m:
            art = {'texto': ''}
            artigos[m.group(1)] = art
            item = None
            # Rubrica em negrito que ocupa mais de uma linha (San Salvador, arts. 21 e 22).
            j = i + 1
            while j < fim and negrito[j] and len(linhas[j]) < 90 and not re.match(r'(ARTIGO\s|\d+\.\s|[a-z][.)]\s)', linhas[j], re.I):
                j += 1
            if j > i + 2:
                art['rubrica'] = ' '.join(linhas[i + 1:j])
                i = j
                continue
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
        # "a) texto" ou "- a. texto" (Desaparecimento Forçado).
        # "a. Texto" (San Salvador): só com maiúscula depois, para não pegar continuação.
        m = re.match(r'(?:-\s*)?([a-z])\)\s+(.*)$', t) or re.match(r'-\s*([a-z])\.\s+(.*)$', t) or re.match(r'([a-z])\.\s+([A-ZÁ-Ú].*)$', t)
        if m:
            alvo = item if item is not None else art
            alvo.setdefault('ali', {})[m.group(1)] = m.group(2)
            i += 1
            continue
        # Linha de título (nome de capítulo/seção) logo antes de um ARTIGO: ignora.
        titulo = len(t) < 90 and not t.endswith(('.', ':', ';', ','))
        if titulo and i + 1 < fim and (re.match(r'ARTIGO\s+(\d+|[IVXL]+)$', linhas[i + 1], re.I) or re.match(r'(CAP[ÍI]TULO|Se[çc][ãa]o|PARTE)', linhas[i - 1], re.I)):
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
