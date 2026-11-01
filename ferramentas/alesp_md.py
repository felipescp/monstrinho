#!/usr/bin/env python3
"""Texto de lei paulista copiado do site da ALESP (al.sp.gov.br, "Texto com alterações")
→ Markdown no formato do compilado do Planalto, para legislacao_planalto.py.

Diferenças da ALESP que este script desfaz:
- dispositivos colados ao fim da linha anterior ("…de suas funções.**Artigo 6° -** São…",
  "…lei complementar.**Parágrafo único -** O mandato…");
- "Artigo 1° -" por extenso (vira "Art. 1º -") e títulos com "#### ";
- a alteração vem numa linha à parte, em itálico, depois do dispositivo
  ("_- Alínea "a" com redação dada pela Lei Complementar n° 1.434, de 11/09/2025, com
  efeitos a partir de 01/07/2025._"): vira anotação no fim do dispositivo, no formato do
  Planalto ("(Redação dada pela Lei Complementar nº 1.434, de 11/09/2025)");
- "(NR)" no fim do texto alterado;
- rótulo em negrito ("**VII -**", "**1.**"), que o extrator leria como rubrica.

Inconstitucionalidade declarada pelo STF ("…nos autos da ADI n° 4163") vira "(Declarado
inconstitucional pela ADI 4163)" ou, para expressão, "(Expressão declarada inconstitucional
pela ADI 7314)"; a declarada pelo TJSP (ADI estadual, "2073085-92.2017.8.26.0000") vira só
"(Vide …)", para não virar nota do STF.

Uso: python3 ferramentas/alesp_md.py <texto-alesp.md>  > saida.md
"""
import re
import sys


def anotacao(t):
    """Linha de alteração da ALESP (sem o "_- " e o "_" final) → anotação "(…)" do Planalto."""
    t = re.sub(r'\[([^\]]*)\]\([^)]*\)', r'\1', t)
    t = re.sub(r'[_*]', '', t).strip().rstrip('.').strip()
    t = re.sub(r',?\s*com efeitos? a partir de [\d/]+', '', t)  # o ano do efeito não é o da lei
    t = t.replace('n°', 'nº')
    stf = re.search(r'Supremo Tribunal Federal.*?ADI nº?\s*([\d.]+)\b', t.replace('n°', 'nº'))
    if re.search(r'declarad[oa]s? inconstitucional', t, re.I):
        if stf:
            if t.startswith('Expressão'):
                return '(Expressão declarada inconstitucional pela ADI %s)' % stf.group(1)
            return '(Declarado inconstitucional pela ADI %s)' % stf.group(1)
        return '(Vide %s)' % re.sub(r'\bADI\b', 'ação direta', t)  # TJSP: só remissão, sem virar nota do STF
    m = re.search(r'(com redação dada|acrescentad[oa]s?|revogad[oa]s?)\s+pel[oa]\s+(.*)$', t, re.I)
    if m:
        verbo = {'c': 'Redação dada', 'a': 'Incluído', 'r': 'Revogado'}[m.group(1)[0].lower()]
        return '(%s pela %s)' % (verbo, re.sub(r'^(?:a|o)\s+', '', m.group(2)))
    return '(Vide %s)' % re.sub(r'^Vide\s+', '', t)


def converter(src):
    linhas = open(src, encoding='utf-8').read().split('\n')
    saida = []
    for l in linhas:
        l = l.rstrip()
        # Dispositivo colado ao fim da linha anterior ("…funções.**Artigo 6° -**", "…complementar.**Parágrafo
        # único -**"). Não depois de "~" (início de trecho riscado: "~**XI -** …~").
        partes = re.split(r'(?<=[^\s~])(?=\*\*(?:Artigo\s+\d|Par[áa]grafo\s+[úu]nico|§\s*\d|[IVXL]+\s*-|\d+\s*-|[a-z]\)))', l)
        for p in partes:
            p = re.sub(r'^#+\s*', '', p).strip()
            m = re.match(r'^_?\\?-\s+(.*)$', p)
            if m and saida:
                # Alteração: vai para o último dispositivo (linha não vazia anterior).
                k = len(saida) - 1
                while k >= 0 and not saida[k].strip(): k -= 1
                if k >= 0:
                    saida[k] = re.sub(r'\s*\(NR\)\s*$', '', saida[k]) + '    ' + anotacao(m.group(1))
                continue
            p = re.sub(r'\s*\(NR\)\s*$', '', p)
            p = re.sub(r'\*\*Artigo\s+(\d+)\s*[°º]?(?:\s*-\s*([A-Z])(?![a-z]))?\s*(?:\\?-)?\s*\*\*\s*(?:\\?-\s*)?',
                       lambda mm: 'Art. %s%s - ' % (mm.group(1) + ('º' if int(mm.group(1)) < 10 else ''), '-' + mm.group(2) if mm.group(2) else ''), p)
            # Rótulo em negrito ("**1.** …", "**VII -** …", "~**XI -** …~"): na ALESP todo rótulo é negrito, e
            # legislacao_planalto lê linha que começa em negrito como rubrica.
            p = re.sub(r'^(~?)\*\*([^*]*)\*\*', r'\1\2', p)
            saida.append(p)
    return '\n'.join(saida)


if __name__ == '__main__':
    sys.stdout.write(converter(sys.argv[1]) + '\n')
