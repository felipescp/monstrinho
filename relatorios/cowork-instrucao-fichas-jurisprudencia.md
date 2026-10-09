# Instrução adicional ao Cowork: elaboração de fichas de Jurisprudência

**O que esta instrução cobre:** os campos `processo`, `tema`, `sistematica` e `conexoes`, dos quais dependem os links do app entre fichas.

**O que ela não muda:** as regras de conteúdo que você já segue (tese, resumo, título, classificação por matéria e divisão).

**Por que importa:** o app lê o campo **Conexões** e transforma cada julgado, Tema ou Súmula citado num link para a ficha correspondente do acervo. O balão mostra a tese, e o clique abre a ficha. Para isso funcionar sem apontar a ficha errada, toda ficha nova deve seguir a convenção abaixo.

---

## 1. Identificação da própria ficha

| Campo | Regra | Exemplos |
|---|---|---|
| `tribunal` | Sigla: `STF`, `STJ` ou `TSE` | `STJ` |
| `processo` | Classe abreviada + número com pontos + UF (hífen ou barra). Vários processos ligados por "e". Agravos com o prefixo por extenso. | `REsp 2.183.860-DF` · `ADI 4.899/DF` · `AgInt no AREsp 1.627.735-SP` · `REsps 1.643.856-SP e 1.643.873-SP` |
| `processo` (Súmula) | `Súmula N-STJ`, `Súmula N-STF` ou `Súmula N-TSE` | `Súmula 435-STJ` |
| `processo` (Súmula Vinculante) | `SV N` | `SV 43` |
| `sistematica` | Um destes valores, exatamente: `Súmula Vinculante`, `Súmula`, `Repercussão Geral`, `Recurso Repetitivo`, `Controle Concentrado`, `IAC`, `Caso isolado (Turma)`, `Caso isolado (Seção)` | `Repercussão Geral` |
| `tema` | **Só o número**, sem "Tema" e sem pontos. Obrigatório em Repercussão Geral e Recurso Repetitivo; vazio nos demais. | `1229` |
| `informativo` | Só o número | `851` |

**Regras de consistência**, que o diagnóstico verifica:
- Repercussão Geral → `tribunal` = `STF` e `tema` preenchido.
- Recurso Repetitivo → `tribunal` = `STJ` e `tema` preenchido.
- Não pode haver duas fichas com a mesma Súmula ou com a mesma Súmula Vinculante. Se o enunciado já existe, atualize a ficha existente.

**Classes reconhecidas pelo app:** ADI, ADC, ADO, ADPF, RE, ARE, REsp, AREsp, EREsp, EAREsp, HC, RHC, MS, RMS, MI, Rcl, CC, Pet, Inq, AP, APn, IAC, IRDR, AI, Ag, ACO, AO, SL, SLS, STP, SS, RO, AR, IF, PUIL, Ext, SEC, HDE, CR, PSV. Prefixos aceitos: AgRg, AgInt, EDcl, ED, também encadeados (`AgInt nos EDcl no REsp …`).

- Use sempre a abreviação, não o nome por extenso.
- Processos do TSE com numeração única (`REspEl 0600467-44.2020.6.26.0000`) não são reconhecidos. Nas conexões que citarem um julgado do TSE, use a mesma forma escrita no `processo` da ficha citada.

---

## 2. Campo `conexoes`: convenção obrigatória

**Separe cada citação com `;`.** Dispositivos de lei podem aparecer misturados, como já acontece: o app só liga julgados, Temas e Súmulas.

| O que citar | Como escrever | Nunca escrever |
|---|---|---|
| Julgado | `ADI 4.899/DF` · `REsp 1.949.761-MG` · `RE 612.043` | "Recurso Especial nº 1949761"; número sem classe |
| Tema | `Tema 499/STF` · `Tema 1.051/STJ` | **"Tema 499" sem tribunal**; "Tema 499 do Supremo" |
| Súmula | `Súmula 435/STJ` · `Súmula 343/STF` · `Súmula 52/TSE` | **"Súmula 7" sem tribunal**; "Súmula do STJ nº 7"; "Enunciado 7" |
| Várias súmulas do mesmo tribunal | `Súmulas 43 e 54/STJ` (tribunal só no fim) | `Súmulas 43/STJ e 54` |
| Súmula Vinculante | `Súmula Vinculante 43` ou `SV 43` | "SV 43/STF" (não precisa de tribunal) |
| Paradigma de um Tema | `Tema 499/STF (RE 612.043)`: o app liga os dois | — |

**Regras de conteúdo da conexão:**
1. **Tribunal sempre explícito** em Tema e Súmula. Os números de Tema e de Súmula se repetem entre STF e STJ, e uma citação sem tribunal deixa o app sem saber qual ficha mostrar.
2. **Tribunal conferido na fonte**, nunca deduzido pelo número nem pela memória. Na dúvida, prefira citar o processo-paradigma, cujo número é único.
3. **Não cite a própria ficha** nas suas conexões.
4. **Uma referência por número.** Não junte "Temas 1 e 2" de tribunais diferentes na mesma expressão.

---

## 3. Antes de entregar cada lote

1. **Consulte o acervo** (`dados/jurisprudencia/*.json`) para cada julgado, Tema ou Súmula citado nas conexões:
   - **se existe:** confira se o tribunal e o número citados batem com a ficha existente;
   - **se não existe:** mantenha a citação, que ficará como lacuna no diagnóstico, e anote-a na lista "**Pendências de acervo**" no fim da sua resposta, com quantas vezes foi citada no lote.
2. **Não duplique:** se o processo, a Súmula ou o Tema da ficha nova já existir no acervo, atualize a ficha existente, mantendo o `id`, em vez de criar outra.
3. **Rode o diagnóstico:** `python3 relatorios/diagnostico_conexoes.py`. O lote só está pronto se:
   - `sem_tribunal` não aumentou;
   - `tribunal_possivelmente_trocado` não aumentou, ou cada caso novo está justificado como lacuna de acervo;
   - `rg_repetitivo_sem_tema`, `tema_em_tribunal_incompativel` e `sumula_ou_sv_com_mais_de_uma_ficha` continuam em 0;
   - `processo_nao_reconhecido` não aumentou.
4. **Informe no fim da resposta:**
   - o resumo do diagnóstico antes e depois do lote;
   - a lista de pendências de acervo;
   - os casos em que não foi possível confirmar o tribunal na fonte.

---

## 4. Exemplo de ficha conforme

```json
{
  "titulo": "Concurso para segurança pública: investigação social pode excluir candidato por conduta incompatível",
  "tribunal": "STJ",
  "orgao": "2ª Turma",
  "processo": "RMS 70.921-PA",
  "relator": "Min. Marco Aurélio Bellizze",
  "dataJulgado": "2025-09-02",
  "informativo": "861",
  "sistematica": "Caso isolado (Turma)",
  "tema": "",
  "tese": "…",
  "resumo": "…",
  "conexoes": "CF, arts. 5º, LVII, e 37, I e II; Tema 22/STF (RE 560.900); RMS 69.065-MS; RMS 77.518-RS; Súmula 266/STJ",
  "link": "…",
  "dataConsulta": "2026-10-09"
}
```
