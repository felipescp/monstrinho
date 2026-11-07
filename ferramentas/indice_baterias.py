#!/usr/bin/env python3
"""Índice "raso" das baterias oficiais → dados/bateriasvf/indice*.json.

Carregamento sob demanda: em vez de o app baixar, a cada abertura, todos os
arquivos de dados/manifesto-baterias.txt (≈ 11 MB), ele lê este índice — as
mesmas baterias, mas sem enunciado, explicação e axioma (a mesma cópia "rasa"
que o app já guardava no aparelho) — e só busca o arquivo completo de uma
bateria quando ela é aberta.

Gera dois arquivos (fora do git, ver .gitignore):
  - indice.json        {"versao", "arquivos": {caminho: [baterias rasas]}}
  - indice-versao.json {"versao", "ids"} — pequeno; o app só baixa o índice
                       inteiro quando a versão muda.

Roda sozinho no deploy (.github/workflows/firebase.yml), antes de enviar
dados/ ao Storage; rodar à mão só para testar no localhost:
    python3 -I ferramentas/indice_baterias.py
"""
import hashlib
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PASTA = os.path.join(RAIZ, 'dados', 'bateriasvf')
APAGAR = ('enunciado', 'explicacao', 'axioma')


def itens(arquivo):
    with open(arquivo, encoding='utf-8') as f:
        j = json.load(f)
    if isinstance(j, dict):
        j = j.get('data') or j.get('sims') or j.get('simulados') or [j]
    return [x for x in (j if isinstance(j, list) else [j]) if isinstance(x, dict) and x.get('id')]


def rasa(b):
    b = json.loads(json.dumps(b))
    for bl in ((b.get('dados') or {}).get('blocos') or []):
        for q in (bl.get('questoes') or []) if isinstance(bl, dict) else []:
            if isinstance(q, dict):
                for k in APAGAR:
                    if k in q:
                        q[k] = ''
    return b


def main():
    manifesto = os.path.join(RAIZ, 'dados', 'manifesto-baterias.txt')
    caminhos = [l.strip() for l in open(manifesto, encoding='utf-8') if l.strip() and not l.strip().startswith('#')]
    arquivos, ids = {}, []
    for c in caminhos:
        arq = os.path.join(RAIZ, c)
        if not os.path.isfile(arq):
            print('ERRO: não encontrado:', c)
            return 1
        lista = [rasa(b) for b in itens(arq)]
        arquivos[c] = lista
        ids += [b['id'] for b in lista]
    corpo = json.dumps(arquivos, ensure_ascii=False, separators=(',', ':'), sort_keys=True)
    versao = hashlib.sha256(corpo.encode('utf-8')).hexdigest()[:16]
    with open(os.path.join(PASTA, 'indice.json'), 'w', encoding='utf-8') as f:
        f.write('{"versao":"' + versao + '","arquivos":' + corpo + '}')
    with open(os.path.join(PASTA, 'indice-versao.json'), 'w', encoding='utf-8') as f:
        json.dump({'versao': versao, 'ids': sorted(set(ids))}, f, ensure_ascii=False, separators=(',', ':'))
    tam = os.path.getsize(os.path.join(PASTA, 'indice.json'))
    print(f'indice.json: {len(caminhos)} arquivos, {len(set(ids))} baterias, {tam} bytes, versão {versao}.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
