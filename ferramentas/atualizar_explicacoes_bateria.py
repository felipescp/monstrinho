#!/usr/bin/env python3
"""
Valida e/ou injeta novas explicações em Markdown em um arquivo de bateria JSON
de dados/bateriasvf/, garantindo que:
1. O arquivo de saída continue no formato de lista `[bateria]`.
2. Nenhum ID de bateria, metadado, enunciado, gabarito, axioma ou tópico seja alterado ou perdido.
3. Todas as questões recebam a explicação enriquecida e sem erros de sintaxe JSON.
4. Ao gravar (`--gravar`), regere automaticamente:
   - dados/bateriasvf/indice.json e indice-versao.json
   - dados/bateriasvf/atualizacoes.json
   - vitrine-publica.js

Formatos aceitos para o arquivo de entrada (`<entrada>`):
- Formato 1 (Recomendado - Mapa enxuto de explicações gerado pelo Gem):
  `[ { "id": "sim_..._q1", "explicacao": "..." }, ... ]`
  ou `{ "sim_..._q1": "...", "sim_..._q2": "..." }`
- Formato 2 (Bateria JSON completa devolvida pelo Gem):
  `[ { "id": "sim_...", "dados": { "blocos": [ ... ] } } ]`

Uso:
  # Apenas validar e ver relatório (sem sobrescrever a bateria original):
  python ferramentas/atualizar_explicacoes_bateria.py dados/bateriasvf/dcivil-responsabilidade-civil.json caminho/saida_gem.json

  # Validar, injetar na bateria original e atualizar índices:
  python ferramentas/atualizar_explicacoes_bateria.py dados/bateriasvf/dcivil-responsabilidade-civil.json caminho/saida_gem.json --gravar
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def extrair_json_limpo(texto: str):
    """Permite ler arquivos que contenham blocos ```json ... ``` copiados direto do Gem."""
    t = texto.strip()
    m = re.search(r"```(?:json)?\s*([\s\S]*?)```", t)
    if m:
        t = m.group(1).strip()
    return json.loads(t)


def mapear_questoes_bateria(bat: dict) -> dict:
    """Retorna dict { id_questao: objeto_questao } na ordem original."""
    mapa = {}
    blocos = (bat.get("dados") or {}).get("blocos") or []
    for bl in blocos:
        for q in bl.get("questoes") or []:
            if isinstance(q, dict) and q.get("id"):
                mapa[q["id"]] = q
    return mapa


def extrair_mapa_explicacoes(dados_entrada, mapa_orig: dict) -> tuple[dict, list[str]]:
    """
    Extrai { id_questao: nova_explicacao } de qualquer um dos formatos suportados
    e também verifica se, caso seja uma bateria completa, houve tentativa de mutação
    em enunciado ou gabarito.
    """
    avisos = []
    novas = {}

    # Caso 1: Dicionário direto { "sim_..._q1": "markdown..." }
    if isinstance(dados_entrada, dict) and "dados" not in dados_entrada and "id" not in dados_entrada:
        for k, v in dados_entrada.items():
            if isinstance(v, str):
                novas[str(k)] = v
            elif isinstance(v, dict) and isinstance(v.get("explicacao"), str):
                novas[str(k)] = v["explicacao"]
        return novas, avisos

    lista = dados_entrada if isinstance(dados_entrada, list) else [dados_entrada]
    if not lista:
        return novas, ["Arquivo de entrada vazio."]

    primeiro = lista[0]

    # Caso 2: Lista enxuta [ { "id": "sim_..._q1", "explicacao": "..." }, ... ]
    # ou por número [ { "numOrig": 1, "explicacao": "..." } ]
    if isinstance(primeiro, dict) and "dados" not in primeiro and ("explicacao" in primeiro or "id" in primeiro):
        por_num = {q.get("numOrig"): qid for qid, q in mapa_orig.items() if q.get("numOrig") is not None}
        for item in lista:
            if not isinstance(item, dict):
                continue
            qid = item.get("id")
            if not qid and item.get("numOrig") in por_num:
                qid = por_num[item.get("numOrig")]
            exp = item.get("explicacao")
            if qid and isinstance(exp, str):
                novas[str(qid)] = exp
        return novas, avisos

    # Caso 3: Bateria completa [ { "id": "sim_...", "dados": { "blocos": [...] } } ]
    for bat_in in lista:
        if not isinstance(bat_in, dict):
            continue
        q_in_map = mapear_questoes_bateria(bat_in)
        for qid, q_in in q_in_map.items():
            q_or = mapa_orig.get(qid)
            if q_or:
                if (q_in.get("enunciado") or "").strip() != (q_or.get("enunciado") or "").strip():
                    avisos.append(f"[{qid}] Enunciado no arquivo do Gem difere do original (mantido o original).")
                if q_in.get("gabarito") != q_or.get("gabarito"):
                    avisos.append(
                        f"[{qid}] ALERTA CRÍTICO: Gabarito no Gem ({q_in.get('gabarito')!r}) "
                        f"difere do original ({q_or.get('gabarito')!r})! Mantido o gabarito original."
                    )
            exp = q_in.get("explicacao")
            if isinstance(exp, str):
                novas[qid] = exp

    return novas, avisos


def auditar_markdown(qid: str, exp: str) -> list[str]:
    """Verifica problemas comuns de formatação Markdown para o renderizador mdExplicacao."""
    alertas = []
    if not exp.strip():
        alertas.append(f"[{qid}] Explicação está vazia.")
        return alertas

    # Verifica se há tabelas com número inconsistente de colunas ou sem separador
    linhas = exp.splitlines()
    em_tabela = False
    tem_separador = False
    for ln in linhas:
        s = ln.strip()
        if s.startswith("|") and s.endswith("|"):
            if not em_tabela:
                em_tabela = True
                tem_separador = False
            elif re.match(r"^\|[\s:|-]+\|$", s):
                tem_separador = True
        else:
            if em_tabela and not tem_separador:
                alertas.append(f"[{qid}] Possível tabela Markdown sem linha separadora (|---|---|).")
            em_tabela = False
    if em_tabela and not tem_separador:
        alertas.append(f"[{qid}] Possível tabela Markdown no fim do texto sem linha separadora (|---|---|).")

    return alertas


def main():
    ap = argparse.ArgumentParser(description="Valida e injeta explicações Markdown em uma bateria oficial.")
    ap.add_argument("bateria", help="Caminho da bateria original (ex.: dados/bateriasvf/dcivil-responsabilidade-civil.json)")
    ap.add_argument("entrada", help="Caminho do JSON/texto gerado pelo Gem com as novas explicações")
    ap.add_argument("--gravar", action="store_true", help="Grava as alterações na bateria e atualiza os índices")
    ap.add_argument("--parcial", action="store_true", help="Permite atualizar apenas um lote parcial de questões da bateria")
    args = ap.parse_args()

    arq_bat = Path(args.bateria)
    if not arq_bat.is_absolute():
        arq_bat = RAIZ / arq_bat
    arq_ent = Path(args.entrada)
    if not arq_ent.is_absolute():
        arq_ent = RAIZ / arq_ent

    if not arq_bat.exists():
        print(f"Erro: bateria original não encontrada: {arq_bat}", file=sys.stderr)
        sys.exit(1)
    if not arq_ent.exists():
        print(f"Erro: arquivo de entrada não encontrado: {arq_ent}", file=sys.stderr)
        sys.exit(1)

    dados_orig = json.loads(arq_bat.read_text(encoding="utf-8"))
    if not isinstance(dados_orig, list) or len(dados_orig) != 1:
        print(f"Erro: a bateria original deve ser uma lista com 1 bateria ([bateria]).", file=sys.stderr)
        sys.exit(1)

    bat_orig = dados_orig[0]
    mapa_orig = mapear_questoes_bateria(bat_orig)

    try:
        dados_ent = extrair_json_limpo(arq_ent.read_text(encoding="utf-8"))
    except Exception as e:
        print(f"Erro de sintaxe JSON no arquivo do Gem ({arq_ent.name}):\n  {e}", file=sys.stderr)
        sys.exit(1)

    novas_exp, avisos_mutacao = extrair_mapa_explicacoes(dados_ent, mapa_orig)

    ids_orig = set(mapa_orig.keys())
    ids_novos = set(novas_exp.keys())
    ids_desconhecidos = ids_novos - ids_orig
    ids_faltantes = [qid for qid in mapa_orig.keys() if qid not in novas_exp]

    alertas_md = []
    alteradas = 0
    for qid, exp in novas_exp.items():
        if qid not in mapa_orig:
            continue
        alertas_md.extend(auditar_markdown(qid, exp))
        if (mapa_orig[qid].get("explicacao") or "") != exp:
            alteradas += 1

    print("=" * 65)
    print(f"Bateria : {bat_orig.get('nome')} ({bat_orig.get('id')})")
    print(f"Arquivo : {arq_bat.relative_to(RAIZ)}")
    print(f"Questões: {len(mapa_orig)} no original | {len(novas_exp)} recebidas na entrada | {alteradas} com nova explicação")
    print("=" * 65)

    if avisos_mutacao:
        print("\n[!] Avisos de blindagem (enunciado/gabarito preservados do original):")
        for av in avisos_mutacao:
            print("  -", av)

    if ids_desconhecidos:
        print(f"\n[!] ERRO: {len(ids_desconhecidos)} ID(s) na entrada não existem nesta bateria:")
        for x in sorted(ids_desconhecidos)[:10]:
            print("  -", x)
        sys.exit(1)

    if ids_faltantes and not args.parcial:
        print(f"\n[!] Faltam {len(ids_faltantes)} questão(ões) na entrada (use --parcial se for um lote parcial):")
        for x in ids_faltantes[:15]:
            print("  -", x)
        if len(ids_faltantes) > 15:
            print(f"  ... e mais {len(ids_faltantes) - 15}.")
        sys.exit(1)
    elif ids_faltantes and args.parcial:
        print(f"\n[i] Modo parcial: {len(ids_faltantes)} questão(ões) mantidas como estavam.")

    if alertas_md:
        print(f"\n[!] Avisos de formatação Markdown ({len(alertas_md)}):")
        for al in alertas_md[:15]:
            print("  -", al)

    if not args.gravar:
        print("\nValidação concluída com sucesso! (Simulação — use --gravar para salvar no arquivo e atualizar índices).")
        return

    # Injeta apenas o campo explicacao nas questões correspondentes
    for qid, exp in novas_exp.items():
        if qid in mapa_orig:
            mapa_orig[qid]["explicacao"] = exp

    arq_bat.write_text(json.dumps([bat_orig], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\n[OK] Arquivo atualizado: {arq_bat.relative_to(RAIZ)}")

    for script in ["indice_baterias.py", "indice_atualizacoes.py", "vitrine_publica.py"]:
        subprocess.run([sys.executable, str(RAIZ / "ferramentas" / script)], check=True)


if __name__ == "__main__":
    main()
