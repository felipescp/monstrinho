#!/usr/bin/env python3
"""Lei Uniforme de Genebra (Anexo I do Decreto 57.663/1966) a partir de material de estudo em Markdown
(.docx convertido) → Markdown no formato de convenção ("ARTIGO N" / texto), para convencao_planalto.py.

O Planalto não publica o texto dos anexos do decreto (só o PDF digitalizado). O material traz o texto dos
artigos com marcas do autor, que este script tira:
- tabelas de questões de concurso ("| (TJES-2011-CESPE): …") e notas de rodapé ("[^1]");
- referências a provas entre parênteses ("(TJES-2011)", "(Cartórios/TJMG-2015/2018)");
- negrito/itálico e palavras em MAIÚSCULAS de ênfase ("PODE o sacador ESTIPULAR" → "pode o sacador estipular"),
  mantidos os numerais romanos e a maiúscula de início de frase.
Só o Anexo I (arts. 1 a 78); as reservas do Anexo II ficam de fora. O nome do capítulo (ou do título, se o
capítulo não tiver nome) vai como rubrica do primeiro artigo dele.

Uso: python3 ferramentas/lug_md.py <material.md> > lug.md
"""
import re
import sys

TITULO = 'LEI UNIFORME RELATIVA ÀS LETRAS DE CÂMBIO E NOTAS PROMISSÓRIAS'
ROMANO = re.compile(r'^[IVXLC]+$')


def sem_marcas(t):
    t = re.sub(r'\[\^\d+\]', '', t)                              # chamada de nota de rodapé
    t = re.sub(r'\s*\\?\[\s*(?:obs\.?:?|=)[^\]]*\\?\]', '', t, flags=re.I)  # nota do autor ("[obs.: aval em preto]", "[= o lugar…]")
    t = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', t)               # link
    t = re.sub(r'\s*\([^()]*\b(?:19|20)\d{2}\b[^()]*\)', '', t)  # "(TJES-2011)", "(Cartórios/TJMG-2015/2018)"
    t = re.sub(r'\\([.\-*_#])', r'\1', t)                        # "1\." e "\-"
    t = t.replace('**', '').replace('__', '')
    t = re.sub(r'(?<![\w*])\*([^*]+)\*(?![\w*])', r'\1', t)      # itálico
    t = re.sub(r'(?<![\w/])_([^_]+)_(?!\w)', r'\1', t)
    return re.sub(r'\s+', ' ', t).strip()


def minusculas(t):
    """Ênfase em maiúsculas → minúsculas (fora numeral romano); maiúscula de novo no início de frase."""
    def troca(m):
        w = m.group(0)
        return w if ROMANO.match(w) else w.lower()
    t = re.sub(r'\b[A-ZÀ-Ú]{2,}\b', troca, t)
    # Letra solta em maiúscula no meio da frase ("… E VENCIDAS", "… A LETRA"): minúscula.
    t = re.sub(r'(?<=[a-zà-ú,;] )([AEOÀÉ])(?= [a-zà-ú])', lambda m: m.group(1).lower(), t)
    t = re.sub(r'(?<=[a-zà-ú]-)([AEOÁÉÓ])\b', lambda m: m.group(1).lower(), t)  # "entender-se-Á", "tendo-O"
    # Início do texto e de frase.
    t = re.sub(r'^([a-zà-ú])', lambda m: m.group(1).upper(), t)
    t = re.sub(r'(?<=[.!?] )([a-zà-ú])', lambda m: m.group(1).upper(), t)
    # Mas não depois do número de item ("1. a palavra \"letra\"…"), que no texto oficial segue em minúscula.
    t = re.sub(r'^(\d+\.\s)([A-ZÀ-Ú])(?=[a-zà-ú]|\s)', lambda m: m.group(1) + m.group(2).lower(), t)
    return t


def nome_titulo(t):
    t = t.strip().rstrip('.')
    return t[:1].upper() + t[1:].lower()


def converter(src):
    linhas = open(src, encoding='utf-8').read().split('\n')
    ini = next(i for i, l in enumerate(linhas) if 'ANEXO I LEI UNIFORME' in l)
    fim = next(i for i, l in enumerate(linhas) if i > ini and re.match(r'\s*\**\s*ANEXO II\b', l))
    saida, rubrica, em_tabela = [TITULO, ''], None, False
    for bruta in linhas[ini + 1:fim]:
        if bruta.lstrip().startswith('|'):   # questões de concurso em tabela
            continue
        if re.match(r'\s*\[\^\d+\]:', bruta):  # nota de rodapé
            continue
        t = sem_marcas(bruta)
        if not t or t in ('*',):
            continue
        # Títulos e capítulos ("TÍTULO I DAS LETRAS CAPÍTULO" / "I DA EMISSÃO E FORMA DA LETRA", "CAPÍTULO II DO
        # ENDOSSO", "TÍTULO II DA NOTA PROMISSÓRIA"): o nome vira rubrica do artigo seguinte.
        if not re.search(r'[a-zà-ú]', t):
            m = re.match(r'^(?:T[ÍI]TULO\s+[IVX]+\s*)?(?:CAP[ÍI]TULO\s*)?(?:[IVX]+\s+)?(.*?)\s*(?:CAP[ÍI]TULO)?$', t)
            nome = m.group(1).strip() if m else ''
            if nome:
                rubrica = nome_titulo(nome)
            continue
        m = re.match(r'^Art\.\s*(\d+)\s*[º°o]?\s*\.?\s*(.*)$', t)
        if m:
            saida += ['', 'ARTIGO %s' % m.group(1)]
            if rubrica:
                saida.append(rubrica)
                rubrica = None
            if m.group(2):
                saida.append(minusculas(m.group(2).lstrip('. ')))
            continue
        t = minusculas(t)
        # Item de lista sem número ("Uma letra pode ser sacada:" / "à vista;" … "pagável num dia fixado.", art. 33;
        # "endosso (artigos 11 a 20);", art. 77): minúscula, como no texto oficial. Parágrafo depois de ":" que acaba em
        # ponto ("…nos casos determinados nas alíneas seguintes:" / "A letra em que se não indique…", art. 2º) não.
        ant = next((x for x in reversed(saida) if x), '')
        if re.search(r'[:;]$', ant) and not ant.startswith('ARTIGO') and (t.endswith(';') or ant.endswith(';')) \
                and re.match(r'[A-ZÀ-Ú](?:[a-zà-ú]|\s)', t):
            t = t[0].lower() + t[1:]
        saida.append(t)
    return '\n\n'.join(l for l in saida if l is not None)


if __name__ == '__main__':
    sys.stdout.write(converter(sys.argv[1]) + '\n')
