#!/usr/bin/env python3
"""
Individualiza as baterias de dados/bateriasvf/ em 1 arquivo JSON por bateria,
mantendo o envelope de lista `[bateria]` e atualizando:
- dados/manifesto-baterias.txt
- dados/bateriasvf/indice.json e indice-versao.json (via ferramentas/indice_baterias.py)
- dados/bateriasvf/atualizacoes.json (via ferramentas/indice_atualizacoes.py)
- vitrine-publica.js (via ferramentas/vitrine_publica.py)

Uso:
  python ferramentas/individualizar_baterias.py
"""

import json
import os
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MANIFESTO = RAIZ / "dados" / "manifesto-baterias.txt"
PASTA_BAT = RAIZ / "dados" / "bateriasvf"

PREFIXOS_MATERIA = {
    "DIREITO CIVIL": "dcivil",
    "DIREITO CONSTITUCIONAL": "dconst",
    "DIREITO PENAL": "dpenal",
    "DIREITO PROCESSUAL CIVIL": "dpc",
    "DIREITO PROCESSUAL PENAL": "dpp",
    "DIREITO ADMINISTRATIVO": "dadm",
    "DIREITO EMPRESARIAL": "demp",
    "DIREITO DO CONSUMIDOR": "dcons",
    "DIREITO FINANCEIRO E TRIBUTÁRIO": "dtrib",
    "DIREITO ELEITORAL": "deleit",
    "DIREITO AMBIENTAL": "damb",
    "DIREITO DA CRIANÇA E DO ADOLESCENTE": "deca",
    "DIREITO INSTITUCIONAL (MAGISTRATURA, MP E DEFENSORIA)": "dinst",
    "NOÇÕES GERAIS DE DIREITO, FORMAÇÃO HUMANÍSTICA E DIREITOS HUMANOS": "dhum",
}


def slugify(texto: str) -> str:
    s = unicodedata.normalize("NFKD", texto or "")
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.lower()
    s = s.replace("º", "").replace("ª", "").replace("§", "")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s


def prefixo_da_bateria(bat: dict) -> str:
    mat = (bat.get("materia") or "").strip().upper()
    if mat in PREFIXOS_MATERIA:
        return PREFIXOS_MATERIA[mat]
    tax = (bat.get("id_taxonomia") or "").split("_")[0].strip().lower()
    return f"d{tax}" if tax else "bat"


def main():
    if not MANIFESTO.exists():
        print(f"Erro: {MANIFESTO} não encontrado.", file=sys.stderr)
        sys.exit(1)

    caminhos_antigos = [
        ln.strip()
        for ln in MANIFESTO.read_text(encoding="utf-8").splitlines()
        if ln.strip() and not ln.strip().startswith("#")
    ]

    baterias = []
    arquivos_antigos_lidos = set()

    for rel in caminhos_antigos:
        arq = RAIZ / rel
        if not arq.exists():
            print(f"Aviso: arquivo listado no manifesto não existe: {rel}", file=sys.stderr)
            continue
        arquivos_antigos_lidos.add(arq.resolve())
        dados = json.loads(arq.read_text(encoding="utf-8"))
        lista = dados if isinstance(dados, list) else (dados.get("data") or [dados])
        for b in lista:
            if isinstance(b, dict) and b.get("id"):
                baterias.append(b)

    print(f"Lidas {len(baterias)} baterias de {len(arquivos_antigos_lidos)} arquivos.")

    usados = set()
    novos_caminhos = []
    arquivos_novos_criados = set()

    for b in baterias:
        pref = prefixo_da_bateria(b)
        slug_nome = slugify(b.get("nome") or b.get("id"))
        base = f"{pref}-{slug_nome}"
        candidato = base
        sufixo = 2
        while candidato in usados:
            candidato = f"{base}-{sufixo}"
            sufixo += 1
        usados.add(candidato)

        rel_novo = f"dados/bateriasvf/{candidato}.json"
        arq_novo = RAIZ / rel_novo
        conteudo = json.dumps([b], ensure_ascii=False, indent=2) + "\n"
        arq_novo.write_text(conteudo, encoding="utf-8")
        arquivos_novos_criados.add(arq_novo.resolve())
        novos_caminhos.append(rel_novo)

    # Atualiza manifesto-baterias.txt (mantendo a ordem original das baterias)
    MANIFESTO.write_text("\n".join(novos_caminhos) + "\n", encoding="utf-8")
    print(f"Manifesto atualizado com {len(novos_caminhos)} arquivos individuais.")

    # Remove os arquivos antigos (grupo-ce-*.json) que não fazem parte dos novos
    removidos = 0
    for arq_antigo in arquivos_antigos_lidos:
        if arq_antigo not in arquivos_novos_criados and arq_antigo.exists():
            arq_antigo.unlink()
            removidos += 1
    print(f"Removidos {removidos} arquivos agrupados antigos.")

    # Regenera índices e vitrine pública
    for script in ["indice_baterias.py", "indice_atualizacoes.py", "vitrine_publica.py"]:
        caminho_script = RAIZ / "ferramentas" / script
        subprocess.run([sys.executable, str(caminho_script)], check=True)


if __name__ == "__main__":
    main()
