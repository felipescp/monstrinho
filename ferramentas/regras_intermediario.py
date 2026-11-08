"""Acesso intermediário na Lei Seca: só o diploma MAIS COBRADO de cada
disciplina vem com os comentários do sistema (pedido explícito do usuário).

"Mais cobrado" = o 1º diploma com mapa de incidência de cada disciplina em
dados/leiseca/manifesto.json (o manifesto já está em ordem decrescente de
incidência). Este script reescreve, em storage.rules, a lista entre os
marcadores "# INTERMEDIARIO-COMENTARIOS:INICIO/FIM" com os arquivos de
comentários desses diplomas. Roda no workflow de publicação antes de aplicar
as regras, então reordenar o manifesto já atualiza a permissão.

Uso: python3 -I ferramentas/regras_intermediario.py [--verificar]
"""
import json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def arquivos():
    man = json.load(open(os.path.join(RAIZ, 'dados', 'leiseca', 'manifesto.json'), encoding='utf-8'))
    out = []
    for g in man.get('disciplinas', []):
        top = next((d for d in g.get('diplomas', []) if d.get('incidencia')), None)
        if top and top.get('comentarios'):
            out.append(os.path.basename(top['comentarios']))
    return sorted(set(out))

def main():
    caminho = os.path.join(RAIZ, 'storage.rules')
    regras = open(caminho, encoding='utf-8').read()
    lista = ', '.join("'" + a + "'" for a in arquivos())
    novo = re.sub(r'(// INTERMEDIARIO-COMENTARIOS:INICIO\n)(.*?)(\n\s*// INTERMEDIARIO-COMENTARIOS:FIM)',
                  lambda m: m.group(1) + '      allow read: if intermediario() && arq in [' + lista + '];' + m.group(3),
                  regras, flags=re.S)
    if novo == regras:
        print('storage.rules já em dia:', lista); return 0
    if '--verificar' in sys.argv:
        print('storage.rules desatualizado; rode ferramentas/regras_intermediario.py'); return 1
    open(caminho, 'w', encoding='utf-8').write(novo)
    print('storage.rules atualizado:', lista); return 0

if __name__ == '__main__':
    sys.exit(main())
