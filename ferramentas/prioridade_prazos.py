#!/usr/bin/env python3
"""Prioridade do sistema (classificacaoOficial) dos Prazos pelo mapa de incidência da Lei Seca.

Cada prazo recebe a cobrança do dispositivo da sua "base" (o mais cobrado, se
citar mais de um; sem § nem inciso, o caput ou o mais cobrado dos seus incisos)
e o nível pelos mesmos limiares da Lei Seca, relativos ao diploma: Crítico =
quartil superior das contagens (>0), Importante = da mediana ao quartil,
Regular = abaixo da mediana ou não cobrado.

Uso: python3 ferramentas/prioridade_prazos.py            (só mostra)
     python3 ferramentas/prioridade_prazos.py --gravar   (grava nos JSON)
     ... [SIGLA ...]   só esses diplomas (ex.: CTN)
     ... --descartar   com --gravar, remove os itens sem nenhuma cobrança no mapa
Diploma novo: acrescente-o em MAP (prazos e mapa de incidência).
"""
import json,re,sys,collections
ROMAN=r'[IVXL]+'
MAP={'CPC':('dados/prazos/prazos-cpc.json','dados/leiseca/incidencia/cpc.json'),
     'CPP':('dados/prazos/prazos-cpp.json','dados/leiseca/incidencia/cpp.json'),
     'L9099':('dados/prazos/prazos-juizados-especiais-lei-9-099.json','dados/leiseca/incidencia/lei-9099.json'),
     'ECA':('dados/prazos/prazos-eca.json','dados/leiseca/incidencia/eca.json'),
     'CP':('dados/prazos/prazos-codigo-penal.json','dados/leiseca/incidencia/codigo-penal.json'),
     'LEP':('dados/prazos/prazos-lep.json','dados/leiseca/incidencia/lep.json'),
     'L11343':('dados/prazos/prazos-lei-de-drogas.json','dados/leiseca/incidencia/lei-11343.json'),
     'L11340':('dados/prazos/prazos-maria-da-penha.json','dados/leiseca/incidencia/lei-11340.json'),
     'L7960':('dados/prazos/prazos-prisao-temporaria.json','dados/leiseca/incidencia/lei-7960.json'),
     'CC':('dados/prazos/prazos-codigo-civil.json','dados/leiseca/incidencia/codigo-civil.json'),
     'CDC':('dados/prazos/prazos-cdc.json','dados/leiseca/incidencia/cdc.json'),
     'L12016':('dados/prazos/prazos-mandado-de-seguranca.json','dados/leiseca/incidencia/lei-12016.json'),
     'L8429':('dados/prazos/prazos-improbidade.json','dados/leiseca/incidencia/lei-8429.json'),
     'LEF':('dados/prazos/prazos-execucao-fiscal.json','dados/leiseca/incidencia/lei-6830.json'),
     'L11101':('dados/prazos/prazos-falencia.json','dados/leiseca/incidencia/lei-11101.json'),
     'L8245':('dados/prazos/prazos-locacoes.json','dados/leiseca/incidencia/lei-8245.json'),
     'L12850':('dados/prazos/prazos-organizacao-criminosa.json','dados/leiseca/incidencia/lei-12850.json'),
     'L9296':('dados/prazos/prazos-interceptacao.json','dados/leiseca/incidencia/lei-9296.json'),
     'CF':('dados/prazos/prazos-constituicao.json','dados/leiseca/incidencia/constituicao.json'),
     'L9784':('dados/prazos/prazos-processo-administrativo.json','dados/leiseca/incidencia/lei-9784.json'),
     'L9307':('dados/prazos/prazos-arbitragem.json','dados/leiseca/incidencia/lei-9307.json'),
     'CTB':('dados/prazos/prazos-codigo-de-transito.json','dados/leiseca/incidencia/ctb.json'),
     'L14133':('dados/prazos/prazos-licitacoes.json','dados/leiseca/incidencia/lei-14133.json'),
     'L13303':('dados/prazos/prazos-estatais.json','dados/leiseca/incidencia/lei-13303.json'),
     'CTN':('dados/prazos/prazos-ctn.json','dados/leiseca/incidencia/ctn.json'),
     'L12527':('dados/prazos/prazos-acesso-a-informacao.json','dados/leiseca/incidencia/lei-12527.json'),
     'L10741':('dados/prazos/prazos-pessoa-idosa.json','dados/leiseca/incidencia/lei-10741.json'),
     'L10257':('dados/prazos/prazos-estatuto-da-cidade.json','dados/leiseca/incidencia/lei-10257.json'),
     'L12651':('dados/prazos/prazos-codigo-florestal.json','dados/leiseca/incidencia/lei-12651.json'),
     'L10826':('dados/prazos/prazos-estatuto-do-desarmamento.json','dados/leiseca/incidencia/lei-10826.json'),
     'L11079':('dados/prazos/prazos-ppp.json','dados/leiseca/incidencia/lei-11079.json'),
     'L8987':('dados/prazos/prazos-concessoes.json','dados/leiseca/incidencia/lei-8987.json'),
     'DL3365':('dados/prazos/prazos-desapropriacao.json','dados/leiseca/incidencia/decreto-lei-3365.json'),
     'L13869':('dados/prazos/prazos-abuso-de-autoridade.json','dados/leiseca/incidencia/lei-13869.json'),
     'L9790':('dados/prazos/prazos-oscip.json','dados/leiseca/incidencia/lei-9790.json'),
     'L7347':('dados/prazos/prazos-acao-civil-publica.json','dados/leiseca/incidencia/lei-7347.json'),
     'L13709':('dados/prazos/prazos-lgpd.json','dados/leiseca/incidencia/lei-13709.json'),
     'L13300':('dados/prazos/prazos-mandado-de-injuncao.json','dados/leiseca/incidencia/lei-13300.json'),
     'L12846':('dados/prazos/prazos-anticorrupcao.json','dados/leiseca/incidencia/lei-12846.json'),
     'DL911':('dados/prazos/prazos-alienacao-fiduciaria.json','dados/leiseca/incidencia/decreto-lei-911.json'),
     'L12965':('dados/prazos/prazos-marco-civil.json','dados/leiseca/incidencia/lei-12965.json'),
     'LINDB':('dados/prazos/prazos-lindb.json','dados/leiseca/incidencia/lindb.json')}
def lim(vals):
    v=sorted([x for x in vals if x>0],reverse=True)
    return v[int(len(v)*0.25)], v[int(len(v)*0.5)]
def alvos(base):
    m=re.match(r'arts?\.\s*([\d.]+)º?(-[A-Z])?(.*)$',base); art=m.group(1).replace('.','')+(m.group(2) or ''); resto=m.group(3)
    partes=[x.strip() for x in re.split(r',| e ',resto) if x.strip()]
    out=[]; par=None; got=False
    for x in partes:
        if x=='caput': out.append((art,None,None)); got=True; par=None
        elif x.startswith('parágrafo único'): par='pu'; out.append((art,par,None)); got=True
        elif x.startswith('§'):
            mm=re.match(r'§\s*(\d+)º?(-[A-Z])?',x); par=mm.group(1)+(mm.group(2) or ''); out.append((art,par,None)); got=True
        elif re.fullmatch(ROMAN,x):
            if out and out[-1][2] is None and out[-1][1]==par: out.pop()
            out.append((art,par,x)); got=True
    if not got: out.append((art,None,None))
    return out
def contagem(disp,a,p,i):
    pre=a+('§'+p if p else '')
    if i: return disp.get(pre+'.'+i,0)
    return max([n for k,n in disp.items() if k==pre or k.startswith(pre+'.')] or [0])
SO={a for a in sys.argv[1:] if not a.startswith('-')}
res={}
for dip,(fp,fi) in MAP.items():
    if SO and dip not in SO: continue
    inc=json.load(open(fi,encoding='utf-8')); disp=inc['dispositivos']
    crit,imp=lim(disp.values())
    d=json.load(open(fp,encoding='utf-8'))
    dist=collections.Counter()
    for it in list(d.values())[0]:
        n=max(contagem(disp,*t) for t in alvos(it['base']))
        nivel='crítico' if n and n>=crit else 'importante' if n and n>=imp else 'regular'
        it['_n']=n; it['_nivel']=nivel; dist[nivel]+=1
    res[dip]=(d,fp,crit,imp,dist)
    print(dip,'limiares crit>=%d imp>=%d'%(crit,imp),dict(dist))
if '--gravar' in sys.argv:
    for dip,(d,fp,crit,imp,dist) in res.items():
        lista=list(d.values())[0]
        if '--descartar' in sys.argv:
            fora=[it for it in lista if not it['_n']]
            for it in fora: lista.remove(it)
            if fora: print(dip,'descartados sem cobrança:',len(fora))
        for it in lista:
            it['classificacaoOficial']=it.pop('_nivel'); it.pop('_n')
        open(fp,'w',encoding='utf-8').write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
else:
    for dip,(d,*_ ) in res.items():
        L=sorted(list(d.values())[0],key=lambda i:-i['_n'])
        print('--',dip); [print('  ',i['_n'],i['_nivel'],i['base'],'|',i['ato'][:60]) for i in L[:6]+L[-3:]]
