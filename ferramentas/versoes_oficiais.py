#!/usr/bin/env python3
"""Versões dos arquivos oficiais → dados/versoes-oficiais.json (fora do git).

Jurisprudência, Esquemas, Flashcards e Glossário: com este arquivo, o app só baixa de novo os arquivos
que mudaram (resumo do conteúdo diferente do que já tem), em vez de baixar
tudo a cada abertura.

    {"arquivos": {caminho: resumo}, "totais": {secao: nº de itens oficiais}}

O app guarda uma cópia de cada arquivo (IndexedDB, fora do backup) junto com
o resumo; enquanto o resumo for o mesmo, usa a cópia sem baixar.

Roda sozinho no deploy (.github/workflows/firebase.yml), antes de enviar
dados/ ao Storage; rodar à mão só para testar no localhost:
    python3 -I ferramentas/versoes_oficiais.py
"""
import hashlib
import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECOES = ('jurisprudencia', 'esquemas', 'flashcards', 'glossario')


def main():
    arquivos, totais = {}, {}
    for secao in SECOES:
        manifesto = os.path.join(RAIZ, 'dados', 'manifesto-' + secao + '.txt')
        caminhos = [l.strip() for l in open(manifesto, encoding='utf-8') if l.strip() and not l.strip().startswith('#')]
        ids = set()
        for c in caminhos:
            arq = os.path.join(RAIZ, c.replace('\\', '/'))
            if not os.path.isfile(arq):
                print('ERRO: não encontrado:', c)
                return 1
            with open(arq, 'rb') as f:
                bruto = f.read()
            arquivos[c] = hashlib.sha256(bruto).hexdigest()[:16]
            j = json.loads(bruto.decode('utf-8'))
            for itens in (j.values() if isinstance(j, dict) else []):
                for it in (itens if isinstance(itens, list) else []):
                    if isinstance(it, dict) and it.get('id') and (secao != 'flashcards' or isinstance(it.get('cards'), list)):
                        ids.add(it['id'])
        totais[secao] = len(ids)
    with open(os.path.join(RAIZ, 'dados', 'versoes-oficiais.json'), 'w', encoding='utf-8') as f:
        json.dump({'arquivos': arquivos, 'totais': totais}, f, ensure_ascii=False, separators=(',', ':'), sort_keys=True)
    print('versoes-oficiais.json:', len(arquivos), 'arquivos;', ', '.join(f'{k} {v}' for k, v in totais.items()))
    return 0


if __name__ == '__main__':
    sys.exit(main())
