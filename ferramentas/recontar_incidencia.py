#!/usr/bin/env python3
"""Reconta, de uma vez, os mapas de incidência a partir de uma pasta com os
materiais de questões (Markdown), aplicando as regras atuais do extrator:
total SEM concursos de cartório e contagem por carreira (Magistratura,
Defensoria, MP, Delegado). Pedido explícito do usuário.

Uso (da raiz do repositório):
    python3 -I ferramentas/recontar_incidencia.py PASTA_DOS_MATERIAIS [--ordenar-manifesto]

Para cada material, acha o mapa correspondente em dados/leiseca/incidencia/
sem precisar de tabela de nomes: tenta os mapas de nome mais parecido e só
grava no que passar na conferência do `incidencia_questoes.py --recontar`
(a releitura, com cartórios, tem de bater dispositivo a dispositivo com o
mapa atual — um material errado não passa). A estrutura (títulos e
capítulos) não muda.

Material com parâmetros especiais (--alias, --desde/--ate, ex.: CF + ADCT)
não passa sozinho: aparece no relatório para rodar à mão com
`incidencia_questoes.py <material> <base> <mapa> --recontar <parâmetros>`.

--ordenar-manifesto: reordena os diplomas de cada disciplina em
dados/leiseca/manifesto.json pelo novo total (os de prioridade estimada e os
sem mapa continuam no fim, na ordem em que estavam).
"""
import argparse
import difflib
import glob
import json
import os
import re
import subprocess
import sys
import unicodedata

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTRATOR = os.path.join(R, 'ferramentas', 'incidencia_questoes.py')
INC = os.path.join(R, 'dados', 'leiseca', 'incidencia')
LEG = os.path.join(R, 'dados', 'legislacao')
MANIFESTO = os.path.join(R, 'dados', 'leiseca', 'manifesto.json')
TENTATIVAS = 8


def norm(t):
    t = unicodedata.normalize('NFKD', str(t).lower())
    t = ''.join(c for c in t if not unicodedata.combining(c))
    t = re.sub(r'(\d)\.(\d)', r'\1\2', t)  # 11.343 -> 11343
    return ' '.join(re.findall(r'[a-z0-9]+', t))


def nomes_do_manifesto():
    m = json.load(open(MANIFESTO, encoding='utf-8'))
    out = {}
    for g in m.get('disciplinas', []):
        for d in g.get('diplomas', []):
            if d.get('incidencia'):
                out[os.path.basename(d['incidencia'])] = d.get('nome', '') + ' ' + d.get('id', '')
    return out


def candidatos(material, mapas, nomes):
    alvo = norm(os.path.splitext(os.path.basename(material))[0])
    nums = set(re.findall(r'\d{3,}', alvo))

    def nota(arq):
        rot = norm(arq[:-5].replace('-', ' ') + ' ' + nomes.get(arq, ''))
        s = difflib.SequenceMatcher(None, alvo, rot).ratio()
        if nums & set(re.findall(r'\d{3,}', rot)):
            s += 1  # número da lei em comum pesa mais que o nome
        return s
    return sorted(mapas, key=nota, reverse=True)[:TENTATIVAS]


def total(arq):
    j = json.load(open(os.path.join(INC, arq), encoding='utf-8'))
    return sum((j.get('dispositivos') or {}).values())


def ordenar_manifesto():
    m = json.load(open(MANIFESTO, encoding='utf-8'))
    for g in m.get('disciplinas', []):
        com, est, sem = [], [], []
        for d in g.get('diplomas', []):
            if not d.get('incidencia'):
                sem.append(d)
                continue
            try:
                j = json.load(open(os.path.join(R, d['incidencia']), encoding='utf-8'))
            except OSError:
                sem.append(d)
                continue
            (est if j.get('estimada') else com).append((sum((j.get('dispositivos') or {}).values()), d))
        com.sort(key=lambda x: -x[0])  # sort estável: empates mantêm a ordem atual
        g['diplomas'] = [d for _, d in com] + [d for _, d in est] + sem
    with open(MANIFESTO, 'w', encoding='utf-8') as f:
        json.dump(m, f, ensure_ascii=False, indent=1)
        f.write('\n')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pasta')
    ap.add_argument('--ordenar-manifesto', action='store_true')
    a = ap.parse_args()
    nomes = nomes_do_manifesto()
    pendentes = []
    for arq in sorted(os.listdir(INC)):
        if not arq.endswith('.json'):
            continue
        j = json.load(open(os.path.join(INC, arq), encoding='utf-8'))
        if not j.get('estimada') and not j.get('semCartorios'):
            pendentes.append(arq)
    materiais = sorted(glob.glob(os.path.join(a.pasta, '**', '*.md'), recursive=True))
    print('%d materiais · %d mapas a recontar' % (len(materiais), len(pendentes)))
    feitos, sem_par = [], []
    for mat in materiais:
        livres = [p for p in pendentes if p not in dict(feitos)]
        achou = None
        for arq in candidatos(mat, livres, nomes):
            base = os.path.join(LEG, arq)
            if not os.path.exists(base):
                continue
            antes = total(arq)
            r = subprocess.run([sys.executable, '-I', EXTRATOR, mat, base, os.path.join(INC, arq), '--recontar'],
                               capture_output=True, text=True)
            if r.returncode == 0 and r.stdout.startswith('OK'):
                achou = arq
                fora = [l for l in r.stderr.splitlines() if l.startswith('fora das carreiras')]
                feitos.append((arq, (os.path.basename(mat), antes, total(arq), fora[0] if fora else '')))
                break
        if not achou:
            sem_par.append(os.path.basename(mat))
    print('\n== Recontados (%d)' % len(feitos))
    for arq, (mat, antes, depois, fora) in feitos:
        print('  %-40s ← %-45s %6d → %6d%s' % (arq, mat[:45], antes, depois, '' if antes == depois else '  (−%d cartório)' % (antes - depois)))
    print('\n== Siglas fora das carreiras (confira se nenhuma é de carreira)')
    siglas = {}
    for _, (_, _, _, fora) in feitos:
        for s, n in re.findall(r"'([^']+)': (\d+)", fora):
            siglas[s] = siglas.get(s, 0) + int(n)
    print('  ' + ', '.join('%s (%d)' % kv for kv in sorted(siglas.items(), key=lambda kv: -kv[1])[:80]))
    restantes = [p for p in pendentes if p not in dict(feitos)]
    print('\n== Materiais sem mapa correspondente (%d): rode à mão com os parâmetros do mapa' % len(sem_par))
    for m in sem_par:
        print('  ' + m)
    print('\n== Mapas ainda NÃO recontados (%d)' % len(restantes))
    for p in restantes:
        print('  ' + p)
    if a.ordenar_manifesto:
        ordenar_manifesto()
        print('\nmanifesto reordenado pelo novo total.')


if __name__ == '__main__':
    main()
