#!/usr/bin/env python3
"""Valida um arquivo de notas do sistema da Lei Seca (Modo comentado).

Confere:
  - formato: {"notas": {"<chave>": [{"texto": "...", "fonte"?: "...", "prova"?: bool}]}};
  - chaves: existem na lei seca (dados/legislacao/<arquivo>.json) — "33",
    "33§4", "33§pu", "28.II", "33§1.I" (alíneas vão na chave do pai);
  - tamanho: avisa nota longa demais (padrão: 900 caracteres) e tabela larga;
  - cópia literal: com --material, aponta trechos de 10+ palavras seguidas
    iguais aos do material de terceiros (devem ser reescritos);
  - cobertura: com --incidencia, lista os dispositivos mais cobrados sem nota.

Uso:
    python3 -I ferramentas/validar_notas.py dados/leiseca/comentarios/lei-4717.json \\
        dados/legislacao/lei-4717.json --material material.md \\
        --incidencia dados/leiseca/incidencia/lei-4717.json

Sai com código 1 se houver erro (formato, chave inexistente ou cópia literal).
"""
import argparse
import json
import re
import sys
import unicodedata

CAMPOS = {'texto', 'fonte', 'prova'}


def chaves_da_lei(lei):
    out = set()
    for a, art in (lei.get('artigos') or {}).items():
        out.add(a)
        for i in (art.get('inc') or {}):
            out.add(a + '.' + i)
        for p, par in (art.get('par') or {}).items():
            out.add(a + '§' + p)
            for i in (par.get('inc') or {}):
                out.add(a + '§' + p + '.' + i)
    return out


def palavras(t):
    t = unicodedata.normalize('NFKD', t.lower())
    t = ''.join(c for c in t if not unicodedata.combining(c))
    t = re.sub(r'[*_`#>|\\\[\]()]', ' ', t)
    return re.findall(r'[a-z0-9]+', t)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('notas')
    ap.add_argument('lei')
    ap.add_argument('--material')
    ap.add_argument('--incidencia')
    ap.add_argument('--max', type=int, default=900, help='caracteres por nota (aviso)')
    ap.add_argument('--janela', type=int, default=10, help='palavras seguidas para acusar cópia')
    a = ap.parse_args()

    erros, avisos = [], []
    try:
        dados = json.load(open(a.notas, encoding='utf-8'))
    except Exception as e:
        print('ERRO: JSON inválido:', e)
        return 1
    notas = dados.get('notas')
    if not isinstance(notas, dict):
        print('ERRO: falta o objeto "notas".')
        return 1
    validas = chaves_da_lei(json.load(open(a.lei, encoding='utf-8')))

    total = prova = 0
    for k, lista in notas.items():
        if k not in validas:
            erros.append(f'chave "{k}" não existe na lei seca (alínea? use a chave do inciso/parágrafo)')
        if not isinstance(lista, list) or not lista:
            erros.append(f'"{k}": deve ser uma lista com pelo menos uma nota')
            continue
        for n in lista:
            total += 1
            if not isinstance(n, dict) or not isinstance(n.get('texto'), str) or not n['texto'].strip():
                erros.append(f'"{k}": nota sem "texto"')
                continue
            extras = set(n) - CAMPOS
            if extras:
                erros.append(f'"{k}": campos desconhecidos {sorted(extras)}')
            if 'prova' in n and not isinstance(n['prova'], bool):
                erros.append(f'"{k}": "prova" deve ser true/false')
            prova += bool(n.get('prova'))
            if len(n['texto']) > a.max:
                avisos.append(f'"{k}": nota com {len(n["texto"])} caracteres (máx. sugerido {a.max}) — enxugue')
            for linha in n['texto'].split('\n'):
                if linha.strip().startswith('|') and linha.count('|') - 1 > 4:
                    avisos.append(f'"{k}": tabela com mais de 4 colunas (fica apertada no celular)')
                    break

    if a.material:
        mat = palavras(open(a.material, encoding='utf-8').read())
        J = a.janela
        trechos = {' '.join(mat[i:i + J]) for i in range(len(mat) - J + 1)}
        lei_txt = palavras(json.dumps(json.load(open(a.lei, encoding='utf-8')), ensure_ascii=False))
        da_lei = {' '.join(lei_txt[i:i + J]) for i in range(len(lei_txt) - J + 1)}
        for k, lista in notas.items():
            for n in lista if isinstance(lista, list) else []:
                w = palavras(n.get('texto', '') if isinstance(n, dict) else '')
                i = 0
                while i <= len(w) - J:
                    s = ' '.join(w[i:i + J])
                    if s in trechos and s not in da_lei:  # citar a própria lei pode
                        fim = i + J
                        while fim < len(w) and ' '.join(w[fim - J + 1:fim + 1]) in trechos:
                            fim += 1
                        erros.append(f'"{k}": cópia literal do material — "{" ".join(w[i:fim])}"')
                        i = fim
                    else:
                        i += 1

    if a.incidencia:
        inc = json.load(open(a.incidencia, encoding='utf-8')).get('dispositivos') or {}
        sem = [(k, v) for k, v in sorted(inc.items(), key=lambda x: -x[1]) if k not in notas][:10]
        if sem:
            print('Mais cobrados sem nota (conferir se não há nada relevante):',
                  ', '.join(f'{k} ({v}×)' for k, v in sem))

    print(f'{len(notas)} dispositivo(s), {total} nota(s), {prova} com "cai em prova".')
    for x in avisos:
        print('AVISO:', x)
    for x in erros:
        print('ERRO:', x)
    return 1 if erros else 0


if __name__ == '__main__':
    sys.exit(main())
