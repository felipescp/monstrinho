#!/usr/bin/env python3
"""Mapa de prioridade ESTIMADA para lei sem histórico de questões (lei nova).

Em vez de contar cobranças num material de questões (incidencia_questoes.py),
lê uma classificação feita à mão, dispositivo a dispositivo, pelo tipo do
dispositivo e pela chance de ser cobrado (critérios em
prompts-gem/lei-seca-incidencia-instrucoes.md, "Lei nova, sem questões"):

    python3 -I ferramentas/prioridade_estimada.py dados/leiseca/estimativas/<arq>.txt \\
        dados/legislacao/<arq>.json dados/leiseca/incidencia/<arq>.json \\
        --fonte "Prioridade estimada (lei sem questões de concurso até DD/MM/AAAA)"

Arquivo de classificação: uma chave por linha, no padrão do mapa ("33", "33§4",
"33§pu", "28.II", "33§1.I"), seguida do nível (critico, importante, regular ou
nenhum) e, depois de "#", do motivo. Linhas em branco e só com "#" são ignoradas.
O dispositivo vigente que não estiver na lista recebe o nível de --padrao
(regular); vetado ou revogado fica sem prioridade. O nível do artigo, no mapa,
é o maior entre os seus dispositivos (o front-end calcula).

Estrutura (títulos/capítulos): rubricas em CAIXA ALTA na base são cabeçalhos de
grupo e valem até a próxima; rubricas em caixa normal são epígrafes do artigo e
não abrem grupo. --capitulo "ART=rótulo" substitui o rótulo a partir do artigo.
"""
import argparse
import json
import re
import sys

NIVEIS = ('critico', 'importante', 'regular', 'nenhum')


def dispositivos(artigos):
    """(chave, nó) de todo caput, parágrafo e inciso da base, na ordem da lei."""
    for a, no in artigos.items():
        yield a, no
        for k, inc in (no.get('inc') or {}).items():
            yield a + '.' + k, inc
        for p, par in (no.get('par') or {}).items():
            yield a + '§' + p, par
            for k, inc in (par.get('inc') or {}).items():
                yield a + '§' + p + '.' + k, inc


def sem_vigencia(no):
    return bool(no.get('revogado')) or bool(re.fullmatch(r'\(?\s*VETADO\s*\)?\.?', (no.get('texto') or '').strip(), re.I))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('classificacao')
    ap.add_argument('base')
    ap.add_argument('saida')
    ap.add_argument('--fonte', required=True)
    ap.add_argument('--padrao', default='regular', choices=NIVEIS)
    ap.add_argument('--capitulo', action='append', default=[], help='"ART=rótulo" a partir do artigo')
    a = ap.parse_args()

    base = json.load(open(a.base, encoding='utf-8'))
    B = base['artigos']
    nos = dict(dispositivos(B))

    escolha, erros = {}, []
    for n, linha in enumerate(open(a.classificacao, encoding='utf-8'), 1):
        linha = linha.split('#', 1)[0].strip()
        if not linha:
            continue
        partes = linha.split()
        if len(partes) != 2 or partes[1] not in NIVEIS:
            erros.append('linha %d: esperado "<chave> <nível>", veio %r' % (n, linha))
        elif partes[0] not in nos:
            erros.append('linha %d: %s não existe na base' % (n, partes[0]))
        elif partes[0] in escolha:
            erros.append('linha %d: %s repetido' % (n, partes[0]))
        else:
            escolha[partes[0]] = partes[1]
    if erros:
        sys.exit('\n'.join(erros))

    prioridade = {}
    for chave, no in nos.items():
        nv = escolha.get(chave, 'nenhum' if sem_vigencia(no) else a.padrao)
        if sem_vigencia(no) and nv != 'nenhum':
            print('aviso: %s está vetado/revogado e recebeu %s' % (chave, nv), file=sys.stderr)
        if nv != 'nenhum':
            prioridade[chave] = nv

    cap_extra = dict(x.split('=', 1) for x in a.capitulo)
    estrutura, rotulo = [], None
    for art, no in B.items():
        rub = (no.get('rubrica') or '').strip()
        if rub and rub.upper() == rub and re.search(r'[A-ZÀ-Ú]', rub):
            rotulo = rub[:1] + rub[1:].lower()
        rotulo = cap_extra.get(art, rotulo)
        if not estrutura or estrutura[-1]['capitulo'] != rotulo:
            estrutura.append({'titulo': None, 'capitulo': rotulo, 'arts': []})
        estrutura[-1]['arts'].append(art)

    out = {'id': base['id'], 'fonte': a.fonte, 'estimada': True, 'estrutura': estrutura,
           'dispositivos': {}, 'prioridade': prioridade}
    json.dump(out, open(a.saida, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    cont = {nv: sum(1 for v in prioridade.values() if v == nv) for nv in NIVEIS[:3]}
    por_art = {}
    for chave, nv in prioridade.items():
        art = re.split(r'[§.]', chave)[0]
        por_art[art] = max(por_art.get(art, 0), 3 - NIVEIS.index(nv))
    arts = {nv: sum(1 for v in por_art.values() if v == 3 - i) for i, nv in enumerate(NIVEIS[:3])}
    print('dispositivos: %d crítico, %d importante, %d regular · artigos: %d crítico, %d importante, %d regular, %d sem prioridade · %d de %d na estrutura'
          % (cont['critico'], cont['importante'], cont['regular'], arts['critico'], arts['importante'], arts['regular'],
             len(B) - len(por_art), sum(len(g['arts']) for g in estrutura), len(B)))


if __name__ == '__main__':
    main()
