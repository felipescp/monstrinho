#!/usr/bin/env python3
"""Questões atualizadas → dados/bateriasvf/atualizacoes.json (fora do git).

Quem fez uma bateria antes de uma questão ser atualizada tem, salva no
aparelho, uma cópia antiga da questão, sem o campo "atualizacoes". Com este
arquivo o app mostra o 🔄 também nessas baterias (inclusive em "Revisar
Questões"), pelo id da questão — sempre só depois de ela ser respondida.

    {"versao": "<resumo>", "questoes": {id: [atualizacoes]}}

Fica dentro de dados/bateriasvf/ porque todos os níveis de acesso já leem
essa pasta no Storage (ver storage.rules). Os scripts de baterias leem só os
arquivos do manifesto, então este arquivo não é tratado como bateria.

Roda sozinho no deploy (.github/workflows/firebase.yml), antes de enviar
dados/ ao Storage; rodar à mão só para testar no localhost:
    python3 -I ferramentas/indice_atualizacoes.py
"""
import hashlib
import json
import os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SAIDA = os.path.join(RAIZ, 'dados', 'bateriasvf', 'atualizacoes.json')


def main():
    manifesto = os.path.join(RAIZ, 'dados', 'manifesto-baterias.txt')
    caminhos = [l.strip() for l in open(manifesto, encoding='utf-8') if l.strip() and not l.strip().startswith('#')]
    questoes = {}
    for rel in caminhos:
        arq = os.path.join(RAIZ, rel)
        if not os.path.isfile(arq):
            continue
        with open(arq, encoding='utf-8') as f:
            dados = json.load(f)
        for bateria in (dados if isinstance(dados, list) else [dados]):
            for bloco in ((bateria.get('dados') or {}).get('blocos') or []):
                for q in bloco.get('questoes') or []:
                    if q.get('id') and q.get('atualizacoes'):
                        questoes[q['id']] = q['atualizacoes']
    corpo = json.dumps(questoes, ensure_ascii=False, sort_keys=True)
    versao = hashlib.sha256(corpo.encode('utf-8')).hexdigest()[:16]
    with open(SAIDA, 'w', encoding='utf-8') as f:
        json.dump({'versao': versao, 'questoes': questoes}, f, ensure_ascii=False)
    print('atualizacoes.json: %d questão(ões) atualizada(s), versão %s' % (len(questoes), versao))


if __name__ == '__main__':
    main()
