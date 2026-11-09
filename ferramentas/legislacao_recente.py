#!/usr/bin/env python3
"""Verificação semanal da legislação recente (pedido explícito do usuário).

Não vasculha o Planalto inteiro: leis, leis complementares, medidas
provisórias e emendas constitucionais são numeradas em sequência, então o
script testa os números SEGUINTES aos últimos já vistos (relatorios/
legislacao-recente-estado.json) até encontrar uma sequência de números ainda
não publicados. Para cada norma nova:

  1. lê o título (data) e a ementa;
  2. descobre quais leis da BASE ela altera (ementa e "passa a vigorar");
  3. baixa de novo o texto compilado dessas leis e o converte com
     ferramentas/legislacao_planalto.py, com os MESMOS parâmetros da linha
     correspondente de ferramentas/gerar_legislacao.sh (e reaplica os
     ajustes manuais listados ali para o mesmo arquivo, como as notas do STF);
     se a conversão perder artigos (> 2%), a lei fica como estava e o caso
     vai para o relatório;
  4. compara antes e depois, dispositivo a dispositivo.

Saídas (nada vai ao ar sozinho: o workflow abre um pull request para revisão):
  - dados/legislacao/*.json das leis atualizadas;
  - relatorios/legislacao-recente.md: normas novas, leis afetadas, antes →
    depois, normas avulsas (que não alteram a base) e falhas;
  - relatorios/novidades-pendentes.json: o mesmo em JSON, para a curadoria
    de dados/leiseca/novidades.json;
  - relatorios/legislacao-recente-estado.json: últimos números vistos.

Uso: python3 -I ferramentas/legislacao_recente.py [--sem-rede-teste]
Sai com código 0; imprime "mudou=1" quando há algo novo (o workflow lê).
"""
import datetime, html as H, json, os, re, shlex, subprocess, sys, tempfile, urllib.request, urllib.error

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ESTADO = os.path.join(RAIZ, 'relatorios', 'legislacao-recente-estado.json')
RELATORIO = os.path.join(RAIZ, 'relatorios', 'legislacao-recente.md')
PENDENTES = os.path.join(RAIZ, 'relatorios', 'novidades-pendentes.json')
GERAR = os.path.join(RAIZ, 'ferramentas', 'gerar_legislacao.sh')
UA = 'Mozilla/5.0 (compatible; ASalinha-legislacao-recente/1.0)'
HOJE = datetime.date.today()
MESES = {m: i + 1 for i, m in enumerate(['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho',
                                         'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'])}
# Quantos números seguidos sem publicação encerram a busca de cada espécie.
FOLGA = {'Lei': 8, 'Lei Complementar': 3, 'MP': 6, 'EC': 3}
# Normas avulsas sem interesse para concursos jurídicos (não entram no relatório).
IRRELEVANTE = re.compile(r'denomina|inscreve o nome|Livro (?:dos )?Her[óo]is|institui o Dia|Dia Nacional|Semana Nacional|'
                         r'Capital Nacional|declara .{0,80}(?:patrimônio|patrono|patrona)|cr[ée]dito (?:extraordin|especial|suplementar)|'
                         r'abre ao Or[çc]amento|Or[çc]amento Fiscal|reconhece .{0,60}(?:manifesta[çc]|patrimônio)|Ano Nacional|M[êe]s ', re.I)


def ato(ano):
    ini = 2023 + 4 * ((ano - 2023) // 4)
    return '_ato%d-%d' % (ini, ini + 3)


def urls(especie, n, ano):
    if especie == 'Lei':
        base = 'https://www.planalto.gov.br/ccivil_03/%s/%d/lei/' % (ato(ano), ano)
        return [base + 'L%d.htm' % n, base + 'l%d.htm' % n]
    if especie == 'MP':
        base = 'https://www.planalto.gov.br/ccivil_03/%s/%d/mpv/' % (ato(ano), ano)
        return [base + 'mpv%d.htm' % n, base + 'Mpv%d.htm' % n]
    if especie == 'Lei Complementar':
        return ['https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp%d.htm' % n, 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp%d.htm' % n]
    return ['https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc%d.htm' % n]


def baixar(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def texto_html(bruto):
    try: t = bruto.decode('utf-8')
    except UnicodeDecodeError: t = bruto.decode('cp1252', errors='replace')
    t = re.sub(r'(?is)<(script|style|head)\b.*?</\1>', '', t)
    t = re.sub(r'(?is)<(strike|s|del)\b[^>]*>.*?</\1>', '', t)
    t = re.sub(r'(?is)<br\s*/?>|</p>|</div>|</h\d>|</li>|</tr>', '\n', t)
    t = re.sub(r'(?s)<[^>]+>', '', t)
    t = H.unescape(t).replace('\r', '')
    return [re.sub(r'\s+', ' ', l).strip() for l in t.split('\n') if l.strip()]


def fmt_num(n):
    return '{:,}'.format(n).replace(',', '.')


def rotulo(especie, n, ano):
    return '%s %s/%d' % (especie, fmt_num(n), ano)


def ler_norma(especie, n):
    """Tenta o ano corrente e o anterior; devolve dict ou None (não publicada)."""
    for ano in (HOJE.year, HOJE.year - 1):
        for u in urls(especie, n, ano):
            try:
                linhas = texto_html(baixar(u))
            except urllib.error.HTTPError as e:
                if e.code in (404, 410): continue
                raise
            titulo, data, i_tit = None, None, -1
            for i, l in enumerate(linhas[:80]):
                m = re.search(r'(LEI COMPLEMENTAR|LEI|MEDIDA PROVIS[ÓO]RIA|EMENDA CONSTITUCIONAL)\s+N[º°o.]*\s*[\d.]+\s*,?\s*DE\s+(\d{1,2})\s*[º°o]?\s+DE\s+([A-ZÇÃa-zçã]+)\s+DE\s+(\d{4})', l, re.I)
                if m:
                    titulo, i_tit = l, i
                    mes = MESES.get(m.group(3).lower())
                    if mes: data = '%s-%02d-%02d' % (m.group(4), mes, int(m.group(2)))
                    break
            if not titulo: continue
            ano_real = int(data[:4]) if data else ano
            ementa = ''
            for l in linhas[i_tit + 1:i_tit + 12]:
                if len(l) > 40 and not re.match(r'(?i)(O PRESIDENTE|A PRESIDENTA|AS MESAS|Mensagem de veto|Vig[êe]ncia|Convers[ãa]o|Texto compilado|Promulga[çc][ãa]o)', l):
                    ementa = l; break
            return {'especie': especie, 'numero': n, 'ano': ano_real, 'norma': rotulo(especie, n, ano_real),
                    'data': data, 'url': u, 'titulo': titulo, 'ementa': ementa, 'texto': '\n'.join(linhas)}
    return None


# ── Base: linhas "gera …" de gerar_legislacao.sh → chave (espécie, número) ──
def base():
    out = {}
    pos = {}
    for l in open(GERAR, encoding='utf8'):
        l = l.strip()
        if not l.startswith('gera '): continue
        try: a = shlex.split(l)[1:]
        except ValueError: continue
        if len(a) < 5: continue
        entrada, ident, nome, fonte, saida = a[:5]
        resto = a[6:] if len(a) > 5 and re.match(r'\d{4}-\d{2}-\d{2}$', a[5]) else a[5:]
        arq = fonte.rsplit('/', 1)[-1].lower()
        chave = None
        if arq.startswith('constituicao'): chave = ('CF', 0)
        elif (m := re.match(r'del(\d+)', arq)): chave = ('Decreto-Lei', int(m.group(1)))
        elif (m := re.match(r'lcp(\d+)', arq)): chave = ('Lei Complementar', int(m.group(1)))
        elif (m := re.match(r'l([\d.]+?)(?:compilad[oa]|cons|consol)?\.htm', arq)): chave = ('Lei', int(m.group(1).replace('.', '')))
        if not chave: continue
        out.setdefault(chave, []).append({'id': ident, 'nome': nome, 'fonte': fonte, 'saida': saida, 'resto': resto})
    return out


def diplomas_alterados(nr, mapa):
    """Leis da base citadas como alteradas na ementa ou em "… passa a vigorar"."""
    achados = set()
    trechos = [nr['ementa']]
    for m in re.finditer(r'(?:^|\n)[^\n]{0,40}?\b(?:A|O)\s+((?:Lei|Decreto-Lei|Lei Complementar)\s+n[º°o.]*\s*[\d.]+)[^\n]{0,250}?(?:passa(?:m)?\s+a\s+vigorar|fica(?:m)?\s+acrescid|fica(?:m)?\s+revogad)', nr['texto']):
        trechos.append(m.group(1))
    # Cada menção ("Lei nº 7.210, de …", "Leis nºs 8.069, de …, 12.850, de … e 8.072, de …",
    # "Decreto-Lei nº 2.848", "Lei Complementar nº 64"): os números que vêm até a próxima
    # menção, ";" ou "para".
    KIND = re.compile(r'\b(Decretos?-Leis?|Leis?\s+Complementar(?:es)?|Leis?)\s+n[º°o.]*s?\s*', re.I)
    for t in trechos:
        ms = list(KIND.finditer(t))
        for k, m in enumerate(ms):
            fim = ms[k + 1].start() if k + 1 < len(ms) else len(t)
            seg = t[m.end():fim]
            corte = re.search(r';|\bpara\b|\bque\b', seg)
            if corte: seg = seg[:corte.start()]
            esp = 'Decreto-Lei' if m.group(1).lower().startswith('decreto') else ('Lei Complementar' if 'omplementar' in m.group(1).lower() else 'Lei')
            # Sem as datas ("de 13 de julho de 1990") e o que está entre parênteses, sobram os números.
            limpo = re.sub(r'\([^)]*\)', ' ', seg)
            limpo = re.sub(r',?\s*de\s+\d{1,2}[º°o]?\s+de\s+[a-zç]+\s+de\s+\d{4}', ' ', limpo, flags=re.I)
            limpo = re.sub(r'/\d{2,4}', ' ', limpo)
            for num in re.findall(r'(?<![\d.])(\d{1,3}(?:\.\d{3})+|\d{2,4})(?![\d.])', limpo):
                achados.add((esp, int(num.replace('.', ''))))
    if nr['especie'] == 'EC' or re.search(r'Constitui[çc][ãa]o Federal passa', nr['texto']):
        achados.add(('CF', 0))
    return [d for k in achados if k in mapa for d in mapa[k]]


def achatar(arts):
    """{chave: (texto, pena, alt, revogado)} para comparar versões."""
    out = {}
    def w(ch, n):
        if isinstance(n, str): out[ch] = (n, None, None, False); return
        out[ch] = (n.get('texto') or '', n.get('pena'), n.get('alt'), bool(n.get('revogado')))
        for k, rot in (('par', '§'), ('inc', ''), ('ali', '')):
            for kk, v in (n.get(k) or {}).items():
                w(ch + ('§' + kk if k == 'par' else '.' + kk), v)
    for a, n in arts.items(): w(a, n)
    return out


def contar(arts):
    return len(arts)


def atualizar_diploma(d, normas, data):
    """Baixa e converte; devolve (ok, mudancas, aviso)."""
    destino = os.path.join(RAIZ, d['saida'])
    antigo = json.load(open(destino, encoding='utf8')) if os.path.exists(destino) else {'artigos': {}}
    with tempfile.TemporaryDirectory() as tmp:
        htm = os.path.join(tmp, 'fonte.htm'); novo = os.path.join(tmp, 'novo.json')
        open(htm, 'wb').write(baixar(d['fonte']))
        cmd = [sys.executable, '-I', os.path.join(RAIZ, 'ferramentas', 'legislacao_planalto.py'), htm, d['id'], d['nome'], d['fonte'], novo, data] + d['resto']
        r = subprocess.run(cmd, capture_output=True, text=True)
        if r.returncode != 0 or not os.path.exists(novo):
            return False, [], 'conversão falhou: ' + (r.stderr or r.stdout)[-300:]
        nv = json.load(open(novo, encoding='utf8'))
        na, aa = contar(nv.get('artigos', {})), contar(antigo.get('artigos', {}))
        if aa and na < aa * 0.98:
            return False, [], 'conversão suspeita: %d artigos (antes %d) — mantido o texto anterior' % (na, aa)
        A, N = achatar(antigo.get('artigos', {})), achatar(nv.get('artigos', {}))
        rot = set(normas)
        mud = []
        for ch in N:
            if N[ch][2] not in rot: continue  # só o que as normas novas alteraram
            ant = A.get(ch)
            tipo = 'revogado' if N[ch][3] and not (ant and ant[3]) else ('incluído' if not ant else 'alterado')
            if ant and ant[:2] == N[ch][:2] and ant[3] == N[ch][3]: continue
            mud.append({'dip': d['id'], 'chave': ch, 'tipo': tipo, 'norma': N[ch][2],
                        'antes': (ant[0] + (' — Pena: ' + ant[1] if ant and ant[1] else '')) if ant else '',
                        'depois': N[ch][0] + (' — Pena: ' + N[ch][1] if N[ch][1] else '')})
        if not mud:
            return False, [], 'o texto compilado do Planalto ainda não traz as alterações (tentar na próxima semana)'
        json.dump(nv, open(destino, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
    # Ajustes manuais do mesmo arquivo (notas do STF etc.), na ordem do gerar_legislacao.sh.
    for l in open(GERAR, encoding='utf8'):
        l = l.strip()
        if l.startswith('python3') and d['saida'] in l and '/root/' not in l and 'legislacao_planalto' not in l:
            subprocess.run(l, shell=True, cwd=RAIZ)
    return True, mud, ''


def semente_estado():
    """1ª execução: parte dos maiores números já registrados na base (campo "alt")."""
    # Maior número do ano mais recente de cada espécie (protege de anotações
    # fora do padrão, como leis estaduais na base ou ano trocado no Planalto).
    vistos = {}
    pasta = os.path.join(RAIZ, 'dados', 'legislacao')
    for f in os.listdir(pasta):
        if not f.endswith('.json'): continue
        try: s = open(os.path.join(pasta, f), encoding='utf8').read()
        except OSError: continue
        for esp, num, ano in re.findall(r'"alt":"(Lei Complementar|Lei|MP|EC) ([\d.]+)/(\d{4})"', s):
            vistos.setdefault(esp, []).append((int(ano), int(num.replace('.', ''))))
    ult = {}
    for esp in ('Lei', 'Lei Complementar', 'MP', 'EC'):
        v = vistos.get(esp, [])
        ano = max([a for a, _ in v], default=0)
        cand = sorted(n for a, n in v if a == ano)
        # Descarta saltos isolados (> 300 acima da mediana do ano).
        if cand:
            med = cand[len(cand) // 2]
            cand = [n for n in cand if n <= med + 300]
        ult[esp] = max(cand, default=0)
    return {'ultimo': ult, 'verificadoEm': None}


def main():
    estado = json.load(open(ESTADO, encoding='utf8')) if os.path.exists(ESTADO) else semente_estado()
    mapa = base()
    novas, falhas = [], []
    conferidas = []
    for esp in ('Lei', 'Lei Complementar', 'MP', 'EC'):
        # Autoverificação: a última norma conhecida tem de ser lida pelo mesmo
        # endereço; senão o padrão de URL mudou e "nada novo" não seria confiável.
        ult = estado['ultimo'].get(esp, 0)
        try: ref = ler_norma(esp, ult) if ult else None
        except Exception as e: ref = None
        if ult and not ref:
            falhas.append('%s %s (última conhecida) não foi encontrada no Planalto: o endereço pode ter mudado.' % (esp, fmt_num(ult)))
            continue
        if ref: conferidas.append(ref['norma'])
        n, vazios = ult + 1, 0
        while vazios < FOLGA[esp]:
            try: nr = ler_norma(esp, n)
            except Exception as e:
                falhas.append('%s %s: %s' % (esp, fmt_num(n), e)); nr = None; vazios = FOLGA[esp]
            if nr:
                novas.append(nr); estado['ultimo'][esp] = n; vazios = 0
            else:
                vazios += 1
            n += 1
    afetados = {}
    for nr in novas:
        nr['diplomas'] = diplomas_alterados(nr, mapa)
        for d in nr['diplomas']: afetados.setdefault(d['saida'], {'d': d, 'normas': []})['normas'].append(nr['norma'])
    mudancas, avisos = {}, {}
    for saida, x in afetados.items():
        try:
            ok, mud, aviso = atualizar_diploma(x['d'], x['normas'], HOJE.isoformat())
        except Exception as e:
            ok, mud, aviso = False, [], 'erro ao baixar/converter: %s' % e
        if mud: mudancas.setdefault(x['d']['id'], []).extend(mud)
        if aviso: avisos[x['d']['id']] = aviso
    # Planalto inacessível em todas as espécies: falha visível (o GitHub avisa por e-mail).
    if falhas and not novas:
        print('Planalto inacessível:\n' + '\n'.join(falhas))
        print('mudou=0')
        sys.exit(2)
    estado['verificadoEm'] = HOJE.isoformat()

    # ── Relatório ──
    pend = []
    md = ['# Legislação recente — verificação de %s' % HOJE.strftime('%d/%m/%Y'), '',
          'Gerado por `ferramentas/legislacao_recente.py`. Normas novas: %d. Leis da base atualizadas: %d.' % (len(novas), len(mudancas)), '']
    if falhas: md += ['## Falhas de acesso ao Planalto', ''] + ['- ' + f for f in falhas] + ['']
    alteram = [nr for nr in novas if nr['diplomas']]
    avulsas = [nr for nr in novas if not nr['diplomas'] and not IRRELEVANTE.search(nr['ementa'] or '')]
    if alteram:
        md += ['## Normas que alteram leis da base', '']
        for nr in alteram:
            ids = sorted(set(d['id'] for d in nr['diplomas']))
            md += ['### %s (%s)' % (nr['norma'], nr['data'] or '?'), '', nr['ementa'], '', 'Leis da base: %s · [Planalto](%s)' % (', '.join(ids), nr['url']), '']
            mud = [m for i in ids for m in mudancas.get(i, []) if m['norma'] == nr['norma']]
            for i in ids:
                if i in avisos: md.append('- ⚠ %s: %s' % (i, avisos[i]))
            for m in mud[:60]:
                md.append('- **%s %s** (%s)%s → %s' % (m['dip'], m['chave'], m['tipo'],
                          (' ' + m['antes'][:300]) if m['antes'] else '', m['depois'][:400]))
            if len(mud) > 60: md.append('- … +%d dispositivos' % (len(mud) - 60))
            md.append('')
            pend.append({'norma': nr['norma'], 'data': nr['data'], 'url': nr['url'], 'ementa': nr['ementa'], 'diplomas': ids, 'mudancas': mud})
    if avulsas:
        md += ['## Normas avulsas (não alteram leis da base)', '']
        for nr in avulsas:
            md.append('- **%s** (%s): %s · [Planalto](%s)' % (nr['norma'], nr['data'] or '?', nr['ementa'], nr['url']))
            pend.append({'norma': nr['norma'], 'data': nr['data'], 'url': nr['url'], 'ementa': nr['ementa'], 'diplomas': [], 'mudancas': []})
        md.append('')
    os.makedirs(os.path.dirname(ESTADO), exist_ok=True)
    json.dump(estado, open(ESTADO, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    mudou = bool(novas)
    if mudou:
        open(RELATORIO, 'w', encoding='utf8').write('\n'.join(md) + '\n')
        json.dump({'verificadoEm': HOJE.isoformat(), 'normas': pend}, open(PENDENTES, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print('Conferidas (última conhecida de cada espécie): ' + (', '.join(conferidas) or '—'))
    if falhas: print('Falhas:\n- ' + '\n- '.join(falhas))
    print('Normas novas: %d (%s) · leis atualizadas: %s · falhas: %d' % (len(novas), ', '.join(nr['norma'] for nr in novas) or '—', ', '.join(mudancas) or '—', len(falhas)))
    print('mudou=%d' % (1 if mudou else 0))


if __name__ == '__main__':
    main()
