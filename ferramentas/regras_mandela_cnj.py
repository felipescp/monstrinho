#!/usr/bin/env python3
"""Regras de Mandela (edição do CNJ, 2016, PDF convertido em Markdown) → JSON da lei seca.

As Regras não foram promulgadas por decreto: não há compilado do Planalto. O PDF do CNJ
chega com linhas quebradas no meio da frase, cabeçalho e número de página repetidos
("## 2223", "REGRAS DE MANDELA"), títulos de seção ("Registros", "Higiene pessoal"),
notas de rodapé (às vezes no meio da regra) e os parágrafos numerados trocados por "- ".
Este script limpa o texto e o reescreve no formato das convenções ("Artigo N", "1. …",
"a) …"); quem gera o JSON é o mesmo convencao_planalto.py. A chave é o número da Regra.

Uso: python3 ferramentas/regras_mandela_cnj.py <mandela.md> dados/legislacao/regras-mandela.json AAAA-MM-DD
"""
import os
import re
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import convencao_planalto  # noqa: E402

RE_REGRA = re.compile(r'^(?:##\s*)?Regra\s+(\d+)\s*$')


def normalizar(src):
    brutas = [l.rstrip('\n') for l in open(src, encoding='utf-8')]
    ini = next(i for i, l in enumerate(brutas) if RE_REGRA.match(l.strip()))
    # Fim: a parte em inglês ("E/CN.15/2015/L.6/Rev.1", "## United Nations") depois da Regra 122.
    fim = next((i for i, l in enumerate(brutas) if i > ini and re.match(r'^(?:##\s*)?(United Nations|E/CN\.15)', l.strip())), len(brutas))
    linhas = []
    for l in brutas[ini:fim]:
        t = re.sub(r'\s+', ' ', l.replace(' ', ' ')).strip()
        if not t:
            continue
        sem = re.sub(r'^##\s*', '', t)
        if RE_REGRA.match(t):
            linhas.append(('regra', RE_REGRA.match(t).group(1)))
        elif re.fullmatch(r'\d+', sem):  # número de página ("## 2223") ou chamada de nota ("## 29")
            continue
        elif sem.upper() == sem and re.search(r'[A-ZÁ-Ú]{4}', sem):  # cabeçalho ("REGRAS DE MANDELA", "MANDELA RULES")
            continue
        else:
            linhas.append(('txt', sem))
    out, nota, item = [], False, 0
    for k, (tipo, t) in enumerate(linhas):
        if tipo == 'regra':
            out.append('Artigo ' + t)
            nota, item = False, 0
            continue
        # Nota de rodapé ("29 Cf. Regra 67 das Regras…"): vai até o próximo parágrafo, alínea ou regra.
        if re.match(r'^\d{1,3}\s+[A-ZÁ-Ú]', t):
            nota = True
            continue
        novo = re.match(r'^-\s*(.*)$', t) or re.match(r'^\(([a-z])\)\s*(.*)$', t)
        if nota and not novo:
            continue
        nota = False
        # Título de seção: linha curta, sem pontuação final, seguida (talvez de outros títulos) por uma Regra.
        if not novo and len(t) < 90 and not re.search(r'[.:;,!?)”"]$', t):
            j = k + 1
            while j < len(linhas) and linhas[j][0] == 'txt' and len(linhas[j][1]) < 90 and not re.search(r'[.:;,!?)”"]$', linhas[j][1]):
                j += 1
            if j < len(linhas) and linhas[j][0] == 'regra':
                continue
        m = re.match(r'^-\s*(.*)$', t)
        if m:
            item += 1
            out.append('%d. %s' % (item, m.group(1)))
            continue
        m = re.match(r'^\(([a-z])\)\s*(.*)$', t)
        if m:
            out.append('%s) %s' % (m.group(1), m.group(2)))
            continue
        # Continuação da linha anterior (o PDF quebra a frase no fim da linha).
        if out and not out[-1].startswith('Artigo '):
            out[-1] += ' ' + t
        else:
            out.append(t)
    return '\n\n'.join(['REGRAS DE MANDELA'] + out) + '\n'


def main(src, dst, data):
    with tempfile.NamedTemporaryFile('w', suffix='.md', delete=False, encoding='utf-8') as f:
        f.write(normalizar(src))
    try:
        convencao_planalto.main(f.name, dst, 'MANDELA',
                                'Regras Mínimas das Nações Unidas para o Tratamento de Presos (Regras de Mandela)',
                                'https://www.cnj.jus.br/', data, 'REGRAS DE MANDELA')
    finally:
        os.unlink(f.name)


if __name__ == '__main__':
    main(*sys.argv[1:4])
