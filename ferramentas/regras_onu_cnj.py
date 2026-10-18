#!/usr/bin/env python3
"""Regras da ONU na edição do CNJ (Série Tratados Internacionais de Direitos Humanos, 2016),
PDF convertido em Markdown → JSON da lei seca: Regras de Mandela e Regras de Bangkok.

As Regras não foram promulgadas por decreto: não há compilado do Planalto. O PDF do CNJ
chega com linhas quebradas no meio da frase, cabeçalho e número de página repetidos
("## 2223", "REGRAS DE MANDELA"), títulos de seção ("Registros", "Higiene pessoal"),
notas de rodapé (às vezes no meio da regra) e os parágrafos numerados trocados por "- ".
Este script limpa o texto e o reescreve no formato das convenções ("Artigo N", "1. …",
"a) …"); quem gera o JSON é o mesmo convencao_planalto.py. A chave é o número da Regra.
Nas Regras de Bangkok, o CNJ intercala o texto das antigas Regras Mínimas que cada regra
complementa ("[Complementa a regra 7 das Regras mínimas…]", "## 7.", "1) …"): esse bloco
vai até a próxima Regra e sai.

Uso: python3 ferramentas/regras_onu_cnj.py mandela|bangkok <arquivo.md> <saida.json> AAAA-MM-DD
"""
import os
import re
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import convencao_planalto  # noqa: E402

DIPLOMAS = {
    'mandela': ('MANDELA', 'Regras Mínimas das Nações Unidas para o Tratamento de Presos (Regras de Mandela)'),
    'bangkok': ('BANGKOK', 'Regras das Nações Unidas para o Tratamento de Mulheres Presas e Medidas Não Privativas de Liberdade para Mulheres Infratoras (Regras de Bangkok)'),
}
RE_REGRA = re.compile(r'^(?:##\s*)?Regra\s+(\d+)\s*$')


def normalizar(src):
    brutas = [l.rstrip('\n') for l in open(src, encoding='utf-8')]
    ini = next(i for i, l in enumerate(brutas) if RE_REGRA.match(l.strip()))
    # Fim: a parte em inglês ("## United Nations", Mandela) ou o fecho da resolução ("45ª Sessão Plenária", Bangkok).
    fim = next((i for i, l in enumerate(brutas) if i > ini and re.match(r'^(?:##\s*)?(United Nations|E/CN\.15|\d+ª Sess[ãa]o Plen[áa]ria)', l.strip())), len(brutas))
    linhas, citado = [], False
    for l in brutas[ini:fim]:
        t = re.sub(r'\s+', ' ', l.replace(' ', ' ')).strip()
        if not t:
            continue
        sem = re.sub(r'^##\s*', '', t)
        if RE_REGRA.match(t):
            linhas.append(('regra', RE_REGRA.match(t).group(1)))
            citado = False
        elif citado or sem.startswith('[Complementa'):  # Regras Mínimas citadas (Bangkok): até a próxima Regra
            citado = True
        elif re.fullmatch(r'\d+', sem):  # número de página ("## 2223") ou chamada de nota ("## 29")
            if len(sem) >= 3: linhas.append(('pagina', sem))
        elif sem.upper() == sem and re.search(r'[A-ZÁ-Ú]{4}', sem):  # cabeçalho ("REGRAS DE MANDELA", "MANDELA RULES")
            linhas.append(('pagina', sem))
        else:
            linhas.append(('txt', sem))
    out, nota, item = [], False, 0
    for k, (tipo, t) in enumerate(linhas):
        if tipo == 'pagina':  # quebra de página encerra a nota de rodapé
            nota = False
            continue
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
        # Vale também para subtítulo em forma de alínea ("(b) Atendimento médico específico para mulheres", Bangkok).
        if (not novo or t.startswith('(')) and len(t) < 90 and not re.search(r'[.:;,!?)”"]$', t):
            j = k + 1
            while j < len(linhas) and (linhas[j][0] == 'pagina' or linhas[j][0] == 'txt' and len(linhas[j][1]) < 90 and not re.search(r'[.:;,!?)”"]$', linhas[j][1])):
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
    return '\n\n'.join(['REGRAS DA ONU'] + out) + '\n'


def main(qual, src, dst, data):
    with tempfile.NamedTemporaryFile('w', suffix='.md', delete=False, encoding='utf-8') as f:
        f.write(normalizar(src))
    try:
        ident, nome = DIPLOMAS[qual]
        convencao_planalto.main(f.name, dst, ident, nome, 'https://www.cnj.jus.br/', data, 'REGRAS DA ONU')
    finally:
        os.unlink(f.name)


if __name__ == '__main__':
    main(*sys.argv[1:5])
