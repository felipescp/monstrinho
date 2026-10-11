# Instrução adicional ao Cowork: elaboração de fichas de Jurisprudência

**O que esta instrução cobre:** os campos `processo`, `tema`, `sistematica` e `conexoes`, dos quais dependem os links do app entre fichas e os balões de lei seca.

**O que ela não muda:** as regras de conteúdo que você já segue (tese, resumo, título, classificação por matéria e divisão).

**Por que importa:** o app lê o campo **Conexões** e faz duas coisas:
- transforma cada julgado, Tema ou Súmula citado num link para a ficha correspondente do acervo (o balão mostra a tese, e o clique abre a ficha);
- transforma cada dispositivo de lei citado ("art. 155, § 4º, I, do CP") num balão com o texto da lei seca (base interna em `dados/legislacao/`, com 37 diplomas), avisando quando o texto mudou depois do julgado ou foi declarado inconstitucional.

Para isso funcionar sem apontar a ficha ou o dispositivo errado, toda ficha nova deve seguir a convenção abaixo.

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

**Separe cada citação com `;`.** Julgados, enunciados e dispositivos de lei podem aparecer misturados no mesmo campo. Cada trecho entre `;` é lido sozinho: o tribunal de um Tema e o diploma de um artigo precisam estar **no mesmo trecho** da citação.

| O que citar | Como escrever | Nunca escrever |
|---|---|---|
| Julgado | `ADI 4.899/DF` · `REsp 1.949.761-MG` · `RE 612.043` | "Recurso Especial nº 1949761"; número sem classe |
| Tema | `Tema 499/STF` · `Tema 1.051/STJ` | **"Tema 499" sem tribunal**; "Tema 499 do Supremo" |
| Súmula | `Súmula 435/STJ` · `Súmula 343/STF` · `Súmula 52/TSE` | **"Súmula 7" sem tribunal**; "Súmula do STJ nº 7"; "Enunciado 7" |
| Várias súmulas do mesmo tribunal | `Súmulas 43 e 54/STJ` (tribunal só no fim) | `Súmulas 43/STJ e 54` |
| Súmula Vinculante | `Súmula Vinculante 43` ou `SV 43` | "SV 43/STF" (não precisa de tribunal) |
| Paradigma de um Tema | `Tema 499/STF (RE 612.043)`: o app liga os dois | — |
| Remissão "ver também" | `(ver também: STF, Plenário, RE 636.553-RS, Tema 445/STF, Info 967)` | `…, Tema 445, …` (sem tribunal no Tema) |

**Regras de conteúdo da conexão:**
1. **Tribunal sempre explícito** em Tema e Súmula. Os números de Tema e de Súmula se repetem entre STF e STJ, e uma citação sem tribunal deixa o app sem saber qual ficha mostrar.
   - O app ainda deduz o tribunal em três situações: Tema entre parênteses logo depois do paradigma (`RE 570.392 (Tema 29)` → STF; `REsp … (Tema 1.051)` → STJ); trecho que começa pelo tribunal (`STF Tema 1.082`, `(ver também: STF, Plenário, …, Tema 445)`); e `Tema 29, repercussão geral`. Isso é rede de segurança, não convenção: escreva sempre `/STF` ou `/STJ`.
2. **Tribunal conferido na fonte**, nunca deduzido pelo número nem pela memória. Na dúvida, prefira citar o processo-paradigma, cujo número é único.
3. **Não cite a própria ficha** nas suas conexões.
4. **Uma referência por número.** Não junte "Temas 1 e 2" de tribunais diferentes na mesma expressão.

### 2.1. Dispositivos de lei nas Conexões

O app liga o artigo ao diploma citado **no mesmo trecho** (entre `;`): primeiro o que vem logo depois da lista de artigos (`art. 155 do CP`), senão o mais próximo antes (`CP, art. 155`).

| O que citar | Como escrever | Evitar |
|---|---|---|
| Artigo | `art. 155 do CP` · `CP, art. 155` · `art. 54 da Lei 9.784/1999` | artigo solto sem diploma no trecho (`art. 14, § 3º`) |
| Parágrafo, inciso, alínea | `art. 155, § 4º, I, do CP` · `art. 206, § 3º, V, do CC` · `art. 52, IX, alínea "a", da Lei 9.099/1995` | inciso antes do parágrafo (`art. 24, XIII, § 1º`): para inciso do caput e parágrafo do mesmo artigo, cite em trechos separados |
| Vários parágrafos | `art. 85, §§ 2º, 3º e 8º, do CPC` (a lista de §§ termina no primeiro "e") | `arts. 1º, §§ 1º e 2º, 9º, 10 e 11` funciona, mas prefira `art. 1º, §§ 1º e 2º; arts. 9º, 10 e 11` |
| Artigos de diplomas diferentes | um trecho por diploma: `CF, art. 231; ADCT, art. 67` | `art. 231 e art. 67 do ADCT, CF/88` (o app atribui os dois ao ADCT) |
| Item de lista anexa | `item 17.08 da Lista Anexa à LC 116/2003` · `subitens 4.22 e 4.23 da lista anexa à LC 116/2003` | — |
| Redação antiga | `art. 40, § 4º, II, da CF (redação anterior à EC 103/2019)` | citar a redação antiga sem avisar: o balão mostra o texto atual |

**Nomes reconhecidos** (sigla, nome ou número): CF, ADCT, CP, CPP, CPC (o de 2015; `CPC/73` fica sem balão), CC (o de 2002), CDC, CTN, CTB, ECA, LEP, LINDB, Código Eleitoral, Código Florestal (o de 2012; `antigo Código Florestal` ou `Lei 4.771` ficam sem balão), Estatuto do Desarmamento, Estatuto da OAB/EAOAB, LC 116 e as Leis 4.717, 6.404, 6.830 (LEF), 6.938 (PNMA), 7.347 (LACP), 8.009, 8.112, 8.213, 8.429 (LIA), 9.099, 9.494, 9.504, 9.605, 9.656, 9.784, 11.101, 11.343, 12.016, 12.850 e o Decreto 20.910. Outros diplomas podem ser citados normalmente, mas ainda não têm balão: escreva sempre o número (`Lei 14.133/2021, art. 75`), nunca só o apelido.

**Não use** `CE` para Código Eleitoral (confunde com a UF do Ceará) nem `LRF` sem o número (serve à Responsabilidade Fiscal e à de Recuperação e Falência).

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
   - `processo_nao_reconhecido` não aumentou;
   - `lei_dispositivo_nao_localizado` e `lei_artigo_sem_diploma` não aumentaram (listas `I` e `J` do JSON).
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
