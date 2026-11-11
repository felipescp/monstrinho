#!/usr/bin/env python3
"""Checagem do acervo oficial antes da publicação (pedido explícito do usuário).

Roda no deploy (.github/workflows/firebase.yml), antes de enviar qualquer coisa
ao Firebase. Se encontrar um problema, termina com erro e a publicação para:
nada vai ao Storage nem ao Hosting. Seções conferidas (todas no formato
{"Disciplina > Divisão": [itens com "id"]}): jurisprudencia, esquemas,
glossario e flashcards.

Bloqueia quando:
  1. um arquivo do manifesto não existe ou não é um JSON nesse formato;
  2. um arquivo traz itens de mais de uma disciplina, ou de uma disciplina
     diferente da que tinha antes (ex.: o arquivo de Direito Penal com as
     fichas de Processo Penal);
  3. o mesmo id aparece em mais de um lugar da seção (cópia de um arquivo
     sobre outro) — só os repetidos novos; os que já existiam na versão
     anterior viram aviso;
  4. comparado com a versão anterior (--base), uma disciplina perde muitos
     itens de uma vez — mais de 10 e mais de 10% do que tinha — ou um arquivo
     sai do manifesto.

Redução intencional (ex.: limpeza de fichas repetidas): ponha
"[reducao-intencional]" na mensagem do commit; o item 4 vira só aviso. Os
itens 1 a 3 sempre bloqueiam.

Uso:
    python3 -I ferramentas/checar_acervo.py [--base <commit>] [--atual <commit>]
--base: versão de comparação (no deploy, o commit anterior ao envio).
--atual: confere um commit em vez dos arquivos da pasta (para testar).
"""
import json
import os
import subprocess
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SECOES = ('jurisprudencia', 'esquemas', 'glossario', 'flashcards')
LIMITE_ABS, LIMITE_PCT = 10, 0.10
MARCA_REDUCAO = '[reducao-intencional]'


def ler(rev, rel):
    """Conteúdo de um arquivo: da pasta (rev None) ou de um commit."""
    rel = rel.replace('\\', '/')
    if rev is None:
        caminho = os.path.join(RAIZ, rel)
        if not os.path.isfile(caminho):
            return None
        with open(caminho, encoding='utf-8') as f:
            return f.read()
    try:
        return subprocess.check_output(['git', 'show', rev + ':' + rel], cwd=RAIZ, stderr=subprocess.DEVNULL).decode('utf-8')
    except subprocess.CalledProcessError:
        return None


def manifesto(rev, secao):
    txt = ler(rev, 'dados/manifesto-' + secao + '.txt')
    if txt is None:
        return None
    return [l.strip().replace('\\', '/') for l in txt.splitlines() if l.strip() and not l.strip().startswith('#')]


def analisar(txt):
    """(disciplinas, ids) de um arquivo, ou (None, motivo) se o formato não serve."""
    try:
        d = json.loads(txt)
    except ValueError as e:
        return None, 'JSON inválido (%s)' % e
    if not isinstance(d, dict):
        return None, 'não é um objeto {"Disciplina > Divisão": [...]}'
    disciplinas, ids = set(), []
    for chave, itens in d.items():
        if ' > ' not in chave or not isinstance(itens, list):
            return None, 'chave fora do formato "Disciplina > Divisão": %r' % chave[:80]
        disciplinas.add(chave.split(' > ')[0])
        for it in itens:
            if not isinstance(it, dict) or not it.get('id'):
                return None, 'item sem "id" em %r' % chave[:80]
            ids.append(it['id'])
    return disciplinas, ids


def repetidos(rev, man):
    """{id: [arquivos]} dos ids que aparecem mais de uma vez na seção."""
    onde = {}
    for rel in man or []:
        txt = ler(rev, rel)
        if txt is None:
            continue
        disc, ids = analisar(txt)
        if disc is None:
            continue
        for i in ids:
            onde.setdefault(i, []).append(rel.split('/')[-1])
    return {i: l for i, l in onde.items() if len(l) > 1}


def base_disponivel(base):
    if not base or set(base) == {'0'}:
        return False
    return subprocess.call(['git', 'cat-file', '-e', base + '^{commit}'], cwd=RAIZ, stderr=subprocess.DEVNULL) == 0


def main():
    args = sys.argv[1:]
    def opcao(nome):
        return args[args.index(nome) + 1] if nome in args and args.index(nome) + 1 < len(args) else None
    base, atual = opcao('--base'), opcao('--atual')
    tem_base = base_disponivel(base)
    msg = os.environ.get('MENSAGEM_COMMIT', '')
    permitir_reducao = MARCA_REDUCAO in msg

    erros, avisos, linhas = [], [], []
    if base and not tem_base:
        avisos.append('Versão anterior (%s) indisponível: sem comparação de perdas, só as checagens de formato.' % base[:12])

    for secao in SECOES:
        man = manifesto(atual, secao)
        if man is None:
            continue
        man_base = manifesto(base, secao) if tem_base else None
        vistos = {}
        for rel in man:
            nome = rel.split('/')[-1]
            txt = ler(atual, rel)
            if txt is None:
                erros.append('%s: %s está no manifesto mas não existe.' % (secao, rel))
                continue
            disc, ids = analisar(txt)
            if disc is None:
                erros.append('%s: %s — %s.' % (secao, nome, ids))
                continue
            if len(disc) > 1:
                erros.append('%s: %s mistura disciplinas (%s).' % (secao, nome, ', '.join(sorted(disc))))
            n_base = None
            if tem_base:
                txt_b = ler(base, rel)
                if txt_b is not None:
                    disc_b, ids_b = analisar(txt_b)
                    if disc_b is not None:
                        n_base = len(ids_b)
                        if disc_b and disc and disc_b != disc:
                            erros.append('%s: %s trazia %s e agora traz %s.' % (secao, nome, ', '.join(sorted(disc_b)), ', '.join(sorted(disc))))
                        perda = len(set(ids_b) - set(ids))
                        if perda > LIMITE_ABS and perda > LIMITE_PCT * len(ids_b):
                            texto = '%s: %s perderia %d de %d itens.' % (secao, nome, perda, len(ids_b))
                            (avisos if permitir_reducao else erros).append(texto + (' (redução marcada como intencional)' if permitir_reducao else ''))
            linhas.append('%-15s %-72s %6s → %d' % (secao, nome[:72], '' if n_base is None else n_base, len(ids)))
        rep_agora = repetidos(atual, man)
        rep_antes = repetidos(base, man_base) if tem_base else rep_agora
        novos = [i for i in rep_agora if i not in rep_antes]
        if novos:
            exemplos = '; '.join('%s em %s' % (i, ' e '.join(rep_agora[i])) for i in novos[:3])
            erros.append('%s: %d id(s) passaram a se repetir (cópia de itens ou de um arquivo sobre outro?): %s%s.' % (secao, len(novos), exemplos, '…' if len(novos) > 3 else ''))
        antigos = [i for i in rep_agora if i in rep_antes]
        if antigos:
            avisos.append('%s: %d id(s) repetidos que já existiam antes (ex.: %s em %s).' % (secao, len(antigos), antigos[0], ' e '.join(rep_agora[antigos[0]])))
        if man_base:
            for rel in man_base:
                if rel not in man:
                    texto = '%s: %s saiu do manifesto.' % (secao, rel)
                    (avisos if permitir_reducao else erros).append(texto)

    relatorio = ['Checagem do acervo' + (' (comparado com %s)' % base[:12] if tem_base else ''), ''] + linhas + ['']
    relatorio += ['AVISO: ' + a for a in avisos]
    relatorio += ['ERRO: ' + e for e in erros]
    if erros:
        relatorio += ['', 'Publicação bloqueada. Corrija os arquivos (ou, se a redução for intencional, use %s na mensagem do commit).' % MARCA_REDUCAO]
    else:
        relatorio += ['Tudo certo.']
    print('\n'.join(relatorio))
    resumo = os.environ.get('GITHUB_STEP_SUMMARY')
    if resumo:
        with open(resumo, 'a', encoding='utf-8') as f:
            f.write('```\n' + '\n'.join(relatorio) + '\n```\n')
    sys.exit(1 if erros else 0)


if __name__ == '__main__':
    main()
