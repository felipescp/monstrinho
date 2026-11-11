#!/usr/bin/env python3
"""
Valida, audita (modo cirúrgico) e/ou injeta novas explicações em Markdown em um
arquivo de bateria JSON de dados/bateriasvf/, garantindo que:
1. O arquivo de saída continue no formato de lista `[bateria]`.
2. Nenhum ID de bateria, metadado, enunciado, gabarito, axioma ou tópico seja alterado ou perdido.
3. Antes da gravação, seja feita auditoria automática questão por questão:
   - Correspondência temática com o enunciado original (detecta questão trocada pelo Gem);
   - Coerência com o gabarito oficial ('V' ou 'F') e ausência de menção a '(alternativa A..E)';
   - Preservação cirúrgica do parágrafo original vs. reescrita/prolixidade ("floreio");
   - Ausência de rótulo 'Axioma' ou paráfrase do Axioma já existente no card nativo;
   - Detecção de duplicação interna (ex.: frase final do parágrafo repetida na lista/blockquote logo abaixo);
   - Limpeza automática de tags `[cite: ...]` e de crases (`code`) ao redor de julgados/artigos/súmulas.
4. Ao gravar (`--gravar`), regere automaticamente:
   - dados/bateriasvf/indice.json e indice-versao.json
   - dados/bateriasvf/atualizacoes.json
   - vitrine-publica.js

Uso:
  # 1º passo (SEMPRE): Auditar e conferir relatório detalhado antes de incorporar:
  python ferramentas/atualizar_explicacoes_bateria.py dados/bateriasvf/dcivil-direito-das-coisas.json caminho/saida_gem.json

  # 2º passo: Gravar na bateria original e atualizar índices após conferência:
  python ferramentas/atualizar_explicacoes_bateria.py dados/bateriasvf/dcivil-direito-das-coisas.json caminho/saida_gem.json --gravar
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

RE_CITE = re.compile(r"\s*\[cite:\s*[\d,\s]+\]", re.IGNORECASE)
# Remove crases indevidas ao redor de referências jurídicas (REsp, Tema, Súmula, Art., ADI, ADPF, HC, etc.)
RE_CODE_JUR = re.compile(
    r"`((?:AgRg|EDcl|AREsp|REsp|RE|ADI|ADC|ADPF|HC|RHC|MS|RMS|CC|EREsp|Tema|S[úu]mula|Info(?:rmativo)?|Art\.?| Lei\b)[^`\n]{2,80})`",
    re.IGNORECASE,
)


def limpar_explicacao(exp: str) -> str:
    """Remove resíduos de citação do Gemini (ex.: [cite: 2]) e crases em referências jurídicas."""
    limpo = RE_CITE.sub("", exp)
    limpo = RE_CODE_JUR.sub(r"\1", limpo)
    return limpo.strip()


def extrair_json_limpo(texto: str):
    """
    Permite ler arquivos que contenham um ou VÁRIOS blocos ```json ... ```
    ou múltiplos arrays JSON colados em sequência (ex.: lotes de 5 a 10 questões do Gem),
    ignorando ruídos de interface do chat entre os blocos.
    """
    t = texto.strip()
    blocos_md = re.findall(r"```(?:json)?\s*([\s\S]*?)```", t)
    if blocos_md:
        acumulado = []
        for b in blocos_md:
            obj = json.loads(b.strip())
            if isinstance(obj, list):
                acumulado.extend(obj)
            else:
                acumulado.append(obj)
        return acumulado

    try:
        return json.loads(t)
    except json.JSONDecodeError:
        # Varre o texto procurando arrays '[' ou objetos '{' JSON válidos (ignora texto solto do chat)
        dec = json.JSONDecoder()
        pos = 0
        n = len(t)
        acumulado = []
        while pos < n:
            m = re.search(r"[\[{]", t[pos:])
            if not m:
                break
            inicio = pos + m.start()
            try:
                obj, fim = dec.raw_decode(t, inicio)
                if isinstance(obj, list):
                    acumulado.extend(obj)
                elif isinstance(obj, dict):
                    acumulado.append(obj)
                pos = fim
            except json.JSONDecodeError:
                pos = inicio + 1
        if acumulado:
            return acumulado
        raise


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

    if isinstance(dados_entrada, dict) and "dados" not in dados_entrada and "id" not in dados_entrada:
        for k, v in dados_entrada.items():
            if isinstance(v, str):
                novas[str(k)] = limpar_explicacao(v)
            elif isinstance(v, dict) and isinstance(v.get("explicacao"), str):
                novas[str(k)] = limpar_explicacao(v["explicacao"])
        return novas, avisos

    lista = dados_entrada if isinstance(dados_entrada, list) else [dados_entrada]
    if not lista:
        return novas, ["Arquivo de entrada vazio."]

    primeiro = lista[0]

    if isinstance(primeiro, dict) and "dados" not in primeiro and ("explicacao" in primeiro or "id" in primeiro):
        por_num = {str(q.get("numOrig")): qid for qid, q in mapa_orig.items() if q.get("numOrig") is not None}
        for item in lista:
            if not isinstance(item, dict):
                continue
            qid = item.get("id")
            if not qid and item.get("numOrig") is not None and str(item.get("numOrig")) in por_num:
                qid = por_num[str(item.get("numOrig"))]
            exp = item.get("explicacao")
            if qid and isinstance(exp, str):
                novas[str(qid)] = limpar_explicacao(exp)
        return novas, avisos

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
                novas[qid] = limpar_explicacao(exp)

    return novas, avisos


def _palavras_chave(texto: str) -> set[str]:
    stop = {
        "a", "o", "as", "os", "de", "da", "do", "das", "dos", "em", "na", "no", "nas", "nos",
        "por", "para", "com", "sem", "sob", "sobre", "que", "se", "ou", "e", "ao", "aos", "um",
        "uma", "não", "nao", "é", "são", "ser", "está", "estão", "pelo", "pela", "pelos", "pelas",
        "como", "mais", "mas", "sua", "seu", "suas", "seus", "apenas", "ainda", "mesmo", "quando",
        "qualquer", "toda", "todo", "todas", "todos", "contra", "entre", "até", "ate", "art",
        "código", "codigo", "civil", "lei", "assertiva", "porque", "pois", "nos", "termos",
    }
    tokens = re.findall(r"[a-zà-ú0-9]{3,}", (texto or "").lower())
    return {t for t in tokens if t not in stop}


def classificar_intervencao(exp_orig: str, exp_nova: str) -> str:
    """Classifica se a alteração manteve o texto original (CIRÚRGICA) ou reescreveu o texto."""
    if not exp_orig.strip():
        return "NOVA"
    kw_orig = _palavras_chave(exp_orig)
    kw_nova = _palavras_chave(exp_nova)
    if not kw_orig:
        return "CIRÚRGICA"
    preservacao = len(kw_orig & kw_nova) / len(kw_orig)
    if preservacao >= 0.72:
        return f"CIRÚRGICA ({preservacao:.0%} do texto base preservado)"
    return f"REESCRITA ({preservacao:.0%} do texto base preservado)"


def auditar_markdown(qid: str, exp: str, q_orig: dict | None = None) -> tuple[list[str], list[str]]:
    """
    Verifica problemas de formatação Markdown, correspondência com a questão original,
    redundância com o Axioma, duplicação interna e prolixidade.
    Retorna (erros_criticos, alertas_md).
    """
    erros = []
    alertas = []
    if not exp.strip():
        erros.append(f"[{qid}] Explicação está vazia.")
        return erros, alertas

    q_orig = q_orig or {}
    gab = (q_orig.get("gabarito") or "").strip().upper()
    axioma_orig = q_orig.get("axioma") or ""
    enunciado_orig = q_orig.get("enunciado") or ""
    exp_orig = q_orig.get("explicacao") or ""

    # 1. Contradição frontal com o gabarito V/F nos primeiros 140 caracteres
    inicio = exp.strip()[:140].lower()
    if gab == "F" and re.search(r"assertiva\s+(?:est[áa]\s+|é\s+)?(?:\*\*)?(?:correta|verdadeira|certa)", inicio):
        erros.append(f"[{qid}] CONTRADIÇÃO DE GABARITO: questão é 'F', mas a explicação inicia afirmando que está Correta/Verdadeira.")
    elif gab == "V" and re.search(r"assertiva\s+(?:est[áa]\s+|é\s+)?(?:\*\*)?(?:errada|falsa|incorreta)", inicio):
        erros.append(f"[{qid}] CONTRADIÇÃO DE GABARITO: questão é 'V', mas a explicação inicia afirmando que está Errada/Falsa.")

    # 2. Menção a "(alternativa A/B/C/D/E)" em questão Certo/Errado
    if gab in ("V", "F") and re.search(r"\(\s*alternativa\s+[a-e]\b", exp, flags=re.IGNORECASE):
        erros.append(f"[{qid}] QUESTÃO TROCADA: explicação menciona '(alternativa A..E)' em bateria Certo/Errado.")

    # 3. Aderência temática mínima com o enunciado + axioma + explicação da questão original
    kw_ref = _palavras_chave(enunciado_orig + " " + axioma_orig + " " + exp_orig)
    kw_exp = _palavras_chave(exp)
    if len(kw_ref) >= 5 and kw_exp:
        comuns = kw_ref & kw_exp
        taxa = len(comuns) / len(kw_ref)
        if len(comuns) <= 2 or taxa < 0.08:
            erros.append(
                f"[{qid}] POSSÍVEL QUESTÃO TROCADA: baixíssima aderência à questão original ({len(comuns)}/{len(kw_ref)} termos-chave em comum)."
            )

    # 4. Verificação de tabelas, blockquotes (Axioma / paráfrase do Axioma)
    linhas = exp.splitlines()
    em_tabela = False
    tem_separador = False
    tem_tabela_valida = False
    for ln in linhas:
        s = ln.strip()
        if s.startswith("|") and s.endswith("|"):
            if not em_tabela:
                em_tabela = True
                tem_separador = False
            elif re.match(r"^\|[\s:|-]+\|$", s):
                tem_separador = True
                tem_tabela_valida = True
        else:
            if em_tabela and not tem_separador:
                alertas.append(f"[{qid}] Possível tabela Markdown sem linha separadora (|---|---|).")
            em_tabela = False

        if s.startswith(">") and re.search(r"\baxioma\b", s, flags=re.IGNORECASE):
            erros.append(f"[{qid}] RÓTULO PROIBIDO: Blockquote usa a nomenclatura 'Axioma' (já existe o card nativo 📌 AXIOMA).")
        elif s.startswith(">") and axioma_orig:
            kw_ax = _palavras_chave(axioma_orig)
            corpo_bq = re.sub(r"^>\s*(?:\*\*[^*]+\*\*\s*:?\s*)?", "", s)
            kw_bq = _palavras_chave(corpo_bq)
            if len(kw_ax) >= 4 and kw_bq:
                inter = len(kw_ax & kw_bq) / min(len(kw_ax), len(kw_bq))
                if inter >= 0.50:
                    alertas.append(
                        f"[{qid}] PARÁFRASE DO AXIOMA: Blockquote tem {inter:.0%} de sobreposição com o Axioma original da questão."
                    )
    if em_tabela and not tem_separador:
        alertas.append(f"[{qid}] Possível tabela Markdown no fim do texto sem linha separadora (|---|---|).")

    # 5. Verificação de duplicação interna (última frase do 1º parágrafo repetida na lista ou blockquote seguinte)
    blocos = [b.strip() for b in re.split(r"\n\s*\n", exp.strip()) if b.strip()]
    if len(blocos) >= 2:
        par_inicial = blocos[0]
        sentencas = [s.strip() for s in re.split(r"[.!?]+", par_inicial) if len(s.strip()) > 20]
        ult_sentenca = sentencas[-1] if sentencas else par_inicial
        kw_ult = _palavras_chave(ult_sentenca)
        for bl_extra in blocos[1:]:
            if bl_extra.startswith("|"):
                continue  # Tabelas comparativas naturalmente retomam os termos do parágrafo
            corpo_extra = re.sub(r"^>\s*(?:\*\*[^*]+\*\*\s*:?\s*)?", "", bl_extra)
            kw_extra = _palavras_chave(corpo_extra)
            if len(kw_ult) >= 4 and len(kw_extra) >= 4:
                inter_int = len(kw_ult & kw_extra) / min(len(kw_ult), len(kw_extra))
                if inter_int >= 0.55:
                    alertas.append(
                        f"[{qid}] DUPLICAÇÃO INTERNA ({inter_int:.0%}): o bloco adicional repete a frase final do parágrafo ('{ult_sentenca[:70]}...')."
                    )

    # 6. Verificação de prolixidade / reescrita desnecessária do texto original
    if exp_orig.strip():
        modo = classificar_intervencao(exp_orig, exp)
        if modo.startswith("REESCRITA"):
            alertas.append(f"[{qid}] {modo}: verifique se o Gem não 'floreou' o que já estava bom.")
        razao_tam = len(exp) / max(len(exp_orig), 1)
        if razao_tam > 2.2 and not tem_tabela_valida:
            alertas.append(
                f"[{qid}] PROLIXIDADE: explicação cresceu {razao_tam:.1f}x ({len(exp_orig)} -> {len(exp)} chars) sem tabela comparativa."
            )

    return erros, alertas


def imprimir_relatorio_questoes(novas_exp: dict, mapa_orig: dict):
    """Imprime o comparativo questão por questão para conferência humana antes da gravação."""
    print("\n" + "=" * 65)
    print("RELATÓRIO DE CONFERÊNCIA PRÉ-INCORPORAÇÃO (QUESTÕES ALTERADAS)")
    print("=" * 65)
    for qid, exp_nova in novas_exp.items():
        q_or = mapa_orig.get(qid)
        if not q_or:
            continue
        exp_orig = (q_or.get("explicacao") or "").strip()
        if exp_orig == exp_nova.strip():
            continue
        num = q_or.get("numOrig") or qid
        gab = q_or.get("gabarito") or "?"
        axioma = q_or.get("axioma") or "(sem axioma)"
        modo = classificar_intervencao(exp_orig, exp_nova)
        erros_q, alertas_q = auditar_markdown(qid, exp_nova, q_or)

        print(f"\n--- Q{num} ({qid}) | Gabarito: {gab} | {modo} ---")
        print(f"  Enunciado : {(q_or.get('enunciado') or '')[:130]}...")
        print(f"  📌 Axioma : {axioma}")
        print(f"  [ANTES] ({len(exp_orig)} chars):\n    " + exp_orig.replace("\n", "\n    "))
        print(f"  [DEPOIS] ({len(exp_nova)} chars):\n    " + exp_nova.replace("\n", "\n    "))
        if erros_q or alertas_q:
            for e in erros_q:
                print(f"  ❌ {e}")
            for a in alertas_q:
                print(f"  ⚠️  {a}")
        else:
            print("  ✅ Sem alertas de redundância, duplicação ou prolixidade.")


def main():
    ap = argparse.ArgumentParser(description="Valida, audita e injeta explicações Markdown em uma bateria oficial.")
    ap.add_argument("bateria", help="Caminho da bateria original (ex.: dados/bateriasvf/dcivil-direito-das-coisas.json)")
    ap.add_argument("entrada", help="Caminho do JSON/texto gerado pelo Gem com as novas explicações")
    ap.add_argument("--gravar", action="store_true", help="Grava as alterações na bateria e atualiza os índices")
    ap.add_argument("--parcial", action="store_true", help="Permite atualizar apenas um lote parcial/cirúrgico de questões")
    ap.add_argument("--exigir-todas", action="store_true", help="Exige que 100%% das questões da bateria estejam no arquivo de entrada")
    ap.add_argument("--forcar", action="store_true", help="Permite gravar mesmo se houver alertas críticos (não recomendado)")
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

    erros_criticos = []
    alertas_md = []
    alteradas = 0
    for qid, exp in novas_exp.items():
        if qid not in mapa_orig:
            continue
        erros_q, alertas_q = auditar_markdown(qid, exp, mapa_orig[qid])
        erros_criticos.extend(erros_q)
        alertas_md.extend(alertas_q)
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

    if not args.gravar:
        imprimir_relatorio_questoes(novas_exp, mapa_orig)

    if erros_criticos and not args.forcar:
        print(f"\n[X] ERROS CRÍTICOS DE CORRESPONDÊNCIA / GABARITO / AXIOMA ({len(erros_criticos)}):")
        for er in erros_criticos[:25]:
            print("  -", er)
        if len(erros_criticos) > 25:
            print(f"  ... e mais {len(erros_criticos) - 25} erro(s).")
        print("\nIncorporação bloqueada para proteger a integridade da bateria.")
        sys.exit(1)

    if ids_faltantes and args.exigir_todas:
        print(f"\n[!] Faltam {len(ids_faltantes)} questão(ões) na entrada (--exigir-todas ativo):")
        for x in ids_faltantes[:15]:
            print("  -", x)
        sys.exit(1)
    elif ids_faltantes:
        print(f"\n[i] Modo cirúrgico/parcial: {len(ids_faltantes)} questão(ões) mantidas intactas como estavam.")

    if alertas_md:
        print(f"\n[!] Alertas de curadoria para revisão ({len(alertas_md)}):")
        for al in alertas_md[:20]:
            print("  -", al)

    if not args.gravar:
        print("\n[CONFERÊNCIA CONCLUÍDA] Nenhuma alteração foi gravada ainda. Após revisar os alertas acima, rode com --gravar.")
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
