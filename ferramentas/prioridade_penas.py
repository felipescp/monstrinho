#!/usr/bin/env python3
"""Prioridade do sistema (classificacaoOficial) das Penas pelo mapa de incidência da Lei Seca.

Mesmo critério de ferramentas/prioridade_prazos.py: cada crime recebe a cobrança
do dispositivo do seu ART (o mais cobrado, se citar mais de um; sem § nem
inciso, o caput ou o mais cobrado dos seus incisos) e o nível pelos limiares
da Lei Seca, relativos ao diploma (Crítico = quartil superior das contagens >0,
Importante = da mediana ao quartil, Regular = abaixo ou não cobrado).
Exceção: dispositivo criado/alterado desde 2024 fica com o maior nível entre o
da incidência e o anterior (ainda sem histórico de prova).
Diploma sem mapa de incidência mantém a classificação que já tinha.

Uso: python3 ferramentas/prioridade_penas.py [-v] [--gravar] [SIGLA ...]
(com SIGLA, ex. CPM, só esses diplomas são recalculados e gravados)
"""
import re
ROM={'I':1,'V':5,'X':10,'L':50,'C':100}
def r2i(s):
    t=0
    for i,c in enumerate(s):
        v=ROM[c]; t+= -v if i+1<len(s) and ROM[s[i+1]]>v else v
    return t
def i2r(n):
    out=''
    for v,s in [(100,'C'),(90,'XC'),(50,'L'),(40,'XL'),(10,'X'),(9,'IX'),(5,'V'),(4,'IV'),(1,'I')]:
        while n>=v: out+=s; n-=v
    return out
def alvos(base):
    """'art. 155, § 4º, I, CP' → [(art, par|None, inc|None)]"""
    m=re.match(r'\s*arts?\.\s*([\d.]+)\s*[º°o]?\s*(-[A-Z])?(.*)$',base,re.I)
    if not m: return []
    art=m.group(1).replace('.','')+(m.group(2) or ''); resto=m.group(3)
    toks=[x.strip() for x in re.split(r',|\be\b',resto) if x.strip()]
    out=[]; par=None
    for x in toks:
        x2=re.sub(r'^(incisos?|inc\.)\s+','',x,flags=re.I)
        if re.fullmatch(r'caput',x,re.I): par=None; out.append((art,None,None))
        elif re.match(r'par[áa]grafo [úu]nico',x,re.I): par='pu'; out.append((art,'pu',None))
        elif x.startswith('§'):
            for mm in re.finditer(r'(\d+)\s*[º°o]?(-[A-Z])?',x):
                par=mm.group(1)+(mm.group(2) or ''); out.append((art,par,None))
        elif re.fullmatch(r'\d+\s*[º°o]?(-[A-Z])?',x) and par is not None and par!='pu':  # "§§ 1º e 2º"
            mm=re.match(r'(\d+)\s*[º°o]?(-[A-Z])?',x); par=mm.group(1)+(mm.group(2) or ''); out.append((art,par,None))
        elif re.fullmatch(r'([IVXLC]+)\s+a\s+([IVXLC]+)',x2):
            a,b=x2.split(' a ')
            for n in range(r2i(a.strip()),r2i(b.strip())+1): out.append((art,par,i2r(n)))
        elif re.fullmatch(r'[IVXLC]+',x2):
            out.append((art,par,x2))
    if not out: out.append((art,None,None))
    return out
def contagem(disp,a,p,i):
    pre=a+('§'+p if p else '')
    if i: return disp.get(pre+'.'+i,0)
    return max([n for k,n in disp.items() if k==pre or k.startswith(pre+'.')] or [0])
def lim(vals):
    v=sorted([x for x in vals if x>0],reverse=True)
    return v[int(len(v)*0.25)], v[int(len(v)*0.5)]
def nivel(n,crit,imp): return 'crítico' if n and n>=crit else 'importante' if n and n>=imp else 'regular'
import json,sys,collections,os,glob
INC={'CP':'codigo-penal','L13869':'lei-13869','CDC':'cdc','L8137':'lei-8137','L7716':'lei-7716','ECA':'eca','L10826':'lei-10826','L9613':'lei-9613','L1521':'lei-1521','L11343':'lei-11343','L9455':'lei-9455','L11101':'lei-11101','L9296':'lei-9296','L12850':'lei-12850',
     'CTB':'ctb','CE':'codigo-eleitoral','LCP':'lcp','L9605':'lei-9605','L15358':'lei-15358','CPM':'codigo-penal-militar'}
SO={a for a in sys.argv[1:] if not a.startswith('-')}
for f in sorted(glob.glob('dados/penas/*.json')):
    d=json.load(open(f,encoding='utf-8'))
    for k,v in d.items():
        if k=='__notas__' or not isinstance(v,list) or (SO and k not in SO): continue
        fi='dados/leiseca/incidencia/%s.json'%INC[k]
        if not os.path.exists(fi): print('SEM MAPA',k,len(v)); continue
        disp=json.load(open(fi,encoding='utf-8'))['dispositivos']; crit,imp=lim(disp.values())
        mud=collections.Counter(); dist=collections.Counter()
        for it in v:
            al=alvos(it['art'])
            if not al: print('  NAO LEU',k,it['art']); continue
            n=max(contagem(disp,*t) for t in al); nv=nivel(n,crit,imp)
            # Dispositivo criado/alterado desde 2024 (selo "Novo" da Lei Seca): a
            # incidência ainda não reflete a cobrança — fica o maior nível entre
            # o da incidência e a classificação anterior.
            RANK={'regular':0,'importante':1,'crítico':2}
            ant=it.get('classificacaoOficial')
            if ant in RANK and re.search(r'\b20(2[4-9]|[3-9]\d)\b',it.get('alteracao','')) and RANK[ant]>RANK[nv]: nv=ant
            if '-v' in sys.argv: print('  ',k,n,nv,'(antes %s)'%it.get('classificacaoOficial'),it['art'],'|',it['crime'][:40])
            mud[(it.get('classificacaoOficial','-'),nv)]+=1; dist[nv]+=1
            it['classificacaoOficial']=nv
        print(k,'crit>=%d imp>=%d'%(crit,imp),dict(dist),'mudaram',sum(c for (a,b),c in mud.items() if a!=b),'de',len(v))
        if '--gravar' in sys.argv: open(f,'w',encoding='utf-8').write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
