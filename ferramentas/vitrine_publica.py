#!/usr/bin/env python3
"""Catálogo público da vitrine de baterias → vitrine-publica.js (raiz do repo).

As baterias oficiais (dados/bateriasvf/*.json, listadas em
dados/manifesto-baterias.txt) ficam no Storage, só para quem tem acesso. Para
a vitrine mostrar o acervo ANTES do login (bloqueado só no acesso, como no
Monstrinho), este script publica apenas o catálogo: id, nome, matéria,
caminho na taxonomia, tipo, estilo, data de criação e número de questões —
nunca as questões.

Roda sozinho no deploy (.github/workflows/firebase.yml); rodar à mão só para
testar no localhost:
    python3 -I ferramentas/vitrine_publica.py
"""
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'vitrine-publica.js')
CAMPOS = ('id', 'nome', 'id_taxonomia', 'materia', 'caminho_completo', 'tipo', 'estilo', 'iaUtilizada', 'dataCriacao')


def itens(arquivo):
    with open(arquivo, encoding='utf-8') as f:
        j = json.load(f)
    if isinstance(j, dict):
        j = j.get('data') or j.get('sims') or j.get('simulados') or [j]
    return [x for x in (j if isinstance(j, list) else [j]) if isinstance(x, dict) and x.get('id')]


def main():
    manifesto = os.path.join(RAIZ, 'dados', 'manifesto-baterias.txt')
    caminhos = [l.strip() for l in open(manifesto, encoding='utf-8') if l.strip() and not l.strip().startswith('#')]
    catalogo, vistos = [], set()
    for c in caminhos:
        arq = os.path.join(RAIZ, c)
        if not os.path.isfile(arq):
            print('AVISO: não encontrado:', c)
            continue
        for b in itens(arq):
            if b['id'] in vistos:
                continue
            vistos.add(b['id'])
            d = b.get('dados') or {}
            qtd = sum(len(bl.get('questoes') or []) for bl in (d.get('blocos') or []) if isinstance(bl, dict))
            e = {k: b[k] for k in CAMPOS if b.get(k) not in (None, '')}
            e['qtdQuestoes'] = qtd
            catalogo.append(e)
    js = ('// Gerado por ferramentas/vitrine_publica.py — não edite à mão.\n'
          '// Catálogo público da vitrine (sem questões): mostra as baterias antes do login.\n'
          'window.VITRINE_PUBLICA = ' + json.dumps(catalogo, ensure_ascii=False, separators=(',', ':')) + ';\n')
    with open(SAIDA, 'w', encoding='utf-8') as f:
        f.write(js)
    print(f'vitrine-publica.js: {len(catalogo)} baterias, {sum(x["qtdQuestoes"] for x in catalogo)} questões, {len(js)} bytes.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
