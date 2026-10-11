# Rodada Cowork — Conexões da Jurisprudência

**Objetivo:** fazer cada citação do campo **Conexões** apontar, sem ambiguidade, para a ficha certa do acervo ou para o dispositivo certo da lei seca, e registrar o que o acervo ainda não tem.

- **Entrada:** `relatorios/diagnostico-conexoes.json`, gerado por `python3 relatorios/diagnostico_conexoes.py`. O resumo legível fica em `relatorios/diagnostico-conexoes.md`.
- **Saída:** os arquivos `dados/jurisprudencia/*.json` corrigidos, mantendo os mesmos `id`.
- **Fechamento:** rodar o script de novo ao fim de cada etapa e anexar o resumo (o bloco `resumo` que ele imprime).
- **Convenção de escrita:** a de `relatorios/cowork-instrucao-fichas-jurisprudencia.md` (seções 2 e 2.1). Ela vale para as fichas novas e para toda correção desta rodada.

O script lê as regras de reconhecimento do próprio `index.html`: o que ele aponta é exatamente o que o app deixa de ligar.

## Situação em 11/10/2026

| Indicador | Qtde | Observação |
|---|---|---|
| fichas | 3.812 | |
| citações de julgados, Temas e Súmulas | 6.020 | 5.011 ligadas a uma ficha |
| `sem_tribunal` | 152 | 137 Temas e 15 Súmulas |
| `tribunal_possivelmente_trocado` | 130 | |
| `referencias_fora_do_acervo` | 811 | 992 citações |
| `processo_nao_reconhecido` | 7 | |
| citações de artigos de lei | 5.721 | 5.025 com balão |
| `lei_dispositivo_nao_localizado` | 17 | |
| `lei_artigo_sem_diploma` | 138 | |
| `lei_citacoes_de_diplomas_fora_da_base` | 541 | só informativo |

**Atenção ao que a Fase 3 (conexões recíprocas) produziu.** Ela dobrou as conexões, mas escreveu a maior parte das remissões como `(ver também: STF, Plenário, RE 636.553-RS, Tema 445, Info 967)`, com o Tema sem tribunal: foram 474 citações novas sem tribunal. O app agora deduz o tribunal nesses casos (trecho que começa por `STF`/`STJ`, Tema entre parênteses depois do paradigma, `Tema N, repercussão geral`), o que trouxe `sem_tribunal` de 1.023 para 152. Mesmo assim, **as remissões novas devem trazer o tribunal no próprio Tema**: `Tema 445/STF`.

## Etapas, em ordem de prioridade

### 1. Citar o tribunal (lista `A_citacoes_sem_tribunal`)

- **Volume:** 152 citações (137 Temas e 15 Súmulas) em que nem o texto nem o contexto indicam o tribunal. Exemplo: `Bloco Direito Administrativo Sancionador: Tema 1327 (…)`.
- **O que fazer:** completar cada citação com `/STF`, `/STJ` ou `/TSE`.
- **Como decidir:** pela fonte original da ficha (link ou informativo) e pelo contexto. O campo `candidatos` mostra as fichas do acervo com aquele número em cada tribunal, mas **não deduza pelo número**: os números de Tema se repetem entre STF e STJ.
- Se não houver como confirmar, deixar como está e anotar na lista de pendências.

### 2. Conferir o tribunal (lista `B_tribunal_possivelmente_trocado`)

- **Volume:** 130 citações. Nelas, a citação diz um tribunal, mas o acervo só tem aquele número em outro. Exemplos: "Tema 1150/STJ" quando só existe o Tema 1150/STF; "STF Tema 1.082" quando só existe o Tema 1.082/STJ.
- **Para cada uma, decidir entre:**
  - (a) a citação está errada → corrigir o tribunal;
  - (b) a citação está certa e falta a ficha no acervo → entra na etapa 3.
- Antes da dedução automática, várias dessas citações (as escritas como `STF Tema 1.082`) eram ligadas à ficha do outro tribunal, com o mesmo número: o balão mostrava a tese errada. Hoje elas aparecem aqui.
- **Súmulas do TST** (ex.: 363/TST, 390/TST) não existem no acervo: manter como estão, porque são corretas.

### 3. Lacunas do acervo (lista `C_referencias_fora_do_acervo`)

- **Volume:** 811 referências distintas, somando 992 citações, que não têm ficha.
- **Ordem sugerida:** criar fichas a partir das mais citadas (o campo `vezes` já vem em ordem decrescente).
  - Prioridade: Súmulas, Temas e Súmulas Vinculantes, que são enunciados curtos e de alto valor.
  - Depois: ADIs, ADPFs e ADCs.
- **Antes de criar, procurar erro de digitação** (número trocado, classe errada): às vezes a ficha existe com outro número.
- **Formato:** fichas novas seguem o formato da base oficial (`materiaL1`, `divisaoL2`, `processo` na convenção, `tema`, `tese`, `sistematica`).

### 4. Processos em formato não reconhecido (lista `F_processo_nao_reconhecido`)

- **Volume:** 7 fichas, a maioria do TSE (`REspe 0600467-44.2020.6.26.0000`) e algumas classes raras (RvCr, QC, ET).
- **O que fazer:** padronizar o número do TSE para a forma em que ele é citado nas conexões das outras fichas, ou incluir na conexão a forma curta usada pela fonte.

### 5. Dispositivo de lei que não existe no texto (lista `I_lei_dispositivo_nao_localizado`)

- **Volume:** 17 citações. O campo `motivo` diz o que falta ("art. 9199 não existe no texto", "inciso II não existe no trecho citado"), e `segmento` traz o trecho inteiro.
- **Causas encontradas e o que fazer:**
  - **diploma errado no trecho:** `art. 231 e art. 67 do ADCT, CF/88` → `CF, art. 231; ADCT, art. 67`; `CP art. 935 (… do CC art. 935)` → `CC, art. 935`;
  - **erro de digitação:** `arts. 43 e 91995` → conferir na fonte;
  - **inciso escrito antes do parágrafo:** `art. 24, XIII, § 1º` → `CF, art. 24, XIII; CF, art. 24, § 1º`;
  - **redação antiga:** `art. 40, § 4º, II` (anterior à EC 103/2019), `art. 87, § 2º, Lei 8.112/90 (redação original)` → manter, acrescentando `(redação anterior à EC 103/2019)` ou equivalente, se ainda não houver;
  - **lacuna da base de lei, não da ficha:** arts. 68 a 87 do Estatuto da OAB (Lei 8.906) ainda não estão na base → não mexer.

### 6. Artigo sem diploma no trecho (lista `J_lei_artigo_sem_diploma`)

- **Volume:** 138 citações de artigo em trecho (entre `;`) que não nomeia nenhum diploma. Exemplo: `CF, art. 37; art. 14, § 3º` — o segundo trecho não diz de qual lei é o art. 14.
- **O que fazer:** acrescentar o diploma em cada trecho (`CF, art. 14, § 3º`), conferindo pela fonte. Na dúvida, deixar e anotar.

### 7. Consistência das fichas (listas `D`, `E`, `G`, `H`)

- **Situação hoje:** zero em D (RG ou Repetitivo sem tema), E (tema em tribunal incompatível) e H (súmula duplicada), e 1 em G (súmula sem tribunal no processo).
- **O que fazer:** manter esses indicadores em zero ao criar fichas novas.

### Só informativo (lista `K_lei_diplomas_fora_da_base`)

Diplomas citados com artigo que ainda não têm base de lei seca (Lei 6.766, Lei 14.133, Lei 8.666, CLT, DL 911…). **Não exige correção nas fichas**: serve para decidir quais leis acrescentar. `CPC` nessa lista são citações ao CPC/73, que ficam sem balão de propósito.

## Critério de aceite

Rodar `python3 relatorios/diagnostico_conexoes.py` e conferir:

- `sem_tribunal` → 0, ou só as pendências justificadas;
- `tribunal_possivelmente_trocado` → só os casos (b) já registrados como lacuna;
- `referencias_fora_do_acervo` → em queda a cada rodada;
- `citacoes_ligadas` → em alta (hoje 5.011 de 6.020);
- `lei_dispositivo_nao_localizado` → só redações antigas anotadas e lacunas da base;
- `lei_artigo_sem_diploma` → em queda (hoje 138);
- `rg_repetitivo_sem_tema`, `tema_em_tribunal_incompativel` e `sumula_ou_sv_com_mais_de_uma_ficha` → 0.
