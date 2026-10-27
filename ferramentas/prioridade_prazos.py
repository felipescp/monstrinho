#!/usr/bin/env python3
"""Prioridade do sistema (classificacaoOficial) dos Prazos pelo mapa de incidência da Lei Seca.

Cada prazo recebe a cobrança do dispositivo da sua "base" (o mais cobrado, se
citar mais de um; sem § nem inciso, o caput ou o mais cobrado dos seus incisos)
e o nível pelos mesmos limiares da Lei Seca, relativos ao diploma: Crítico =
quartil superior das contagens (>0), Importante = da mediana ao quartil,
Regular = abaixo da mediana ou não cobrado.

Uso: python3 ferramentas/prioridade_prazos.py            (só mostra)
     python3 ferramentas/prioridade_prazos.py --gravar   (grava nos JSON)
Diploma novo: acrescente-o em MAP (prazos e mapa de incidência).
"""
import json,re,sys,collections
ROMAN=r'[IVXL]+'
MAP={'CPC':('dados/prazos/prazos-cpc.json','dados/leiseca/incidencia/cpc.json'),
     'CPP':('dados/prazos/prazos-cpp.json','dados/leiseca/incidencia/cpp.json'),
     'L9099':('dados/prazos/prazos-juizados-especiais-lei-9-099.json','dados/leiseca/incidencia/lei-9099.json'),
     'ECA':('dados/prazos/prazos-eca.json','dados/leiseca/incidencia/eca.json')}
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
res={}
for dip,(fp,fi) in MAP.items():
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
        for it in list(d.values())[0]:
            it['classificacaoOficial']=it.pop('_nivel'); it.pop('_n')
        open(fp,'w',encoding='utf-8').write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
else:
    for dip,(d,*_ ) in res.items():
        L=sorted(list(d.values())[0],key=lambda i:-i['_n'])
        print('--',dip); [print('  ',i['_n'],i['_nivel'],i['base'],'|',i['ato'][:60]) for i in L[:6]+L[-3:]]
