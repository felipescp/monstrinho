"""Acrescenta a um JSON de legislação uma nota de controle de constitucionalidade que o
compilado do Planalto ainda não traz.

  python3 ferramentas/nota_stf_manual.py <arquivo.json> <artigo> <tipo> "<referência>"

tipo: inconst | inconst_parcial | vide (os mesmos de legislacao_planalto.nota_stf).
Ex.: Marco Civil, art. 19 (STF, Temas 987 e 533, 2025: inconstitucionalidade parcial).
"""
import json, sys

arq, art, tipo, ref = sys.argv[1:5]
assert tipo in ('inconst', 'inconst_parcial', 'vide'), tipo
d = json.load(open(arq, encoding='utf8'))
no = d['artigos'][art]
nota = {'tipo': tipo, 'ref': ref}
if nota not in no.setdefault('stf', []): no['stf'].append(nota)
json.dump(d, open(arq, 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
