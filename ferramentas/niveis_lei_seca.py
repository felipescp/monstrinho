#!/usr/bin/env python3
"""Tabela dos níveis da Lei Seca por diploma → LEI-SECA-NIVEIS.md (raiz do repo).

Níveis:
  1. Pura        — texto em dados/legislacao/<arquivo>.json, ligado em
                   window.LEGISLACAO.DIPLOMAS (index.html);
  2. Incidência  — campo "incidencia" do diploma em dados/leiseca/manifesto.json,
                   com o arquivo existente;
  3. Comentado   — campo "comentarios" no manifesto, com o arquivo existente
                   (a célula mostra quantas notas).

Agrupada pelas disciplinas do manifesto, na ordem dele; diplomas com texto mas
fora do manifesto vão em "Fora do manifesto".

Uso:
    python3 -I ferramentas/niveis_lei_seca.py              # regrava a tabela
    python3 -I ferramentas/niveis_lei_seca.py --verificar  # só confere (sai 1 se desatualizada)

Rode ao fim de qualquer tarefa que inclua um diploma em algum nível (as
instruções de prompts-gem/lei-seca-*.md mandam) e faça commit junto.
"""
import json
import os
import re
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'LEI-SECA-NIVEIS.md')


def ler(caminho):
    with open(os.path.join(RAIZ, caminho), encoding='utf-8') as f:
        return json.load(f)


def existe(caminho):
    return bool(caminho) and os.path.isfile(os.path.join(RAIZ, caminho))


def diplomas_legislacao():
    """id → arquivo, do bloco window.LEGISLACAO (DIPLOMAS) do index.html."""
    with open(os.path.join(RAIZ, 'index.html'), encoding='utf-8') as f:
        html = f.read()
    ini = html.index('window.LEGISLACAO = (function()')
    bloco = html[ini:ini + 200000]
    return dict(re.findall(r"^\s{8}(\w+):\s*\{\s*nome:\s*'[^']*',\s*arquivo:\s*'([^']+)'", bloco, re.M))


def gerar():
    leg = diplomas_legislacao()
    man = ler('dados/leiseca/manifesto.json')
    linhas, vistos = [], set()
    tot = {'diplomas': 0, 1: 0, 2: 0, 3: 0, 'notas': 0}

    def celulas(d):
        did = d.get('id')
        n1 = existe(leg.get(did))
        n2 = existe(d.get('incidencia'))
        n3, notas = existe(d.get('comentarios')), 0
        if n3:
            try:
                notas = sum(len(v) for v in (ler(d['comentarios']).get('notas') or {}).values() if isinstance(v, list))
            except Exception:
                notas = 0
        tot['diplomas'] += 1
        tot[1] += n1
        tot[2] += n2
        tot[3] += n3
        tot['notas'] += notas
        c3 = (f'X ({notas} nota{"s" if notas != 1 else ""})' if n3 else '-')
        return f"| {d.get('nome') or did} | {'X' if n1 else '-'} | {'X' if n2 else '-'} | {c3} |"

    cab = ['| Diploma | 1. Pura | 2. Incidência | 3. Comentado |', '|---|:---:|:---:|:---:|']
    for disc in man.get('disciplinas') or []:
        ds = disc.get('diplomas') or []
        if not ds:
            continue
        linhas += ['', f"### {disc.get('nome')}", ''] + cab
        for d in ds:
            vistos.add(d.get('id'))
            linhas.append(celulas(d))
    fora = [i for i in leg if i not in vistos and existe(leg[i])]
    if fora:
        linhas += ['', '### Fora do manifesto', '', '_Têm texto (nível 1), mas não estão em `dados/leiseca/manifesto.json`: servem às referências dos cards e não aparecem na seção Lei Seca._', ''] + cab
        for i in sorted(fora):
            linhas.append(celulas({'id': i, 'nome': i}))

    topo = [
        '# Lei Seca — níveis por diploma',
        '',
        '> Arquivo gerado por `ferramentas/niveis_lei_seca.py` — não edite à mão.',
        '> Regere ao incluir um diploma em qualquer nível: `python3 -I ferramentas/niveis_lei_seca.py`.',
        '',
        '**Níveis:** 1. Pura (texto da lei) · 2. c/ Incidência (mapa de cobranças em provas; é o que faz o diploma aparecer na seção) · 3. Comentado (notas do sistema do 📝 Modo comentado).',
        '',
        f"**Totais:** {tot['diplomas']} diplomas · 1. Pura: {tot[1]} · 2. Incidência: {tot[2]} · 3. Comentado: {tot[3]} ({tot['notas']} notas).",
    ]
    return '\n'.join(topo + linhas) + '\n'


def main():
    novo = gerar()
    atual = open(SAIDA, encoding='utf-8').read() if os.path.isfile(SAIDA) else ''
    if '--verificar' in sys.argv:
        if novo != atual:
            print('LEI-SECA-NIVEIS.md desatualizado: rode python3 -I ferramentas/niveis_lei_seca.py')
            return 1
        print('LEI-SECA-NIVEIS.md em dia.')
        return 0
    if novo != atual:
        with open(SAIDA, 'w', encoding='utf-8') as f:
            f.write(novo)
        print('LEI-SECA-NIVEIS.md atualizado.')
    else:
        print('LEI-SECA-NIVEIS.md já estava em dia.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
