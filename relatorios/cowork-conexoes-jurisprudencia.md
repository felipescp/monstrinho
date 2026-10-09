# Rodada Cowork — Conexões da Jurisprudência

**Objetivo:** fazer cada citação do campo **Conexões** apontar, sem ambiguidade, para a ficha certa do acervo, e registrar o que o acervo ainda não tem.

- **Entrada:** `relatorios/diagnostico-conexoes.json`, gerado por `python3 relatorios/diagnostico_conexoes.py`.
- **Saída:** os arquivos `dados/jurisprudencia/*.json` corrigidos, mantendo os mesmos `id`.
- **Fechamento:** rodar o script de novo ao fim de cada etapa e anexar o resumo.

## Convenção de escrita das Conexões

Esta é a convenção que o app reconhece. Vale também para o Gem que gera as fichas.

1. **Separador:** citações separadas por `;`.
2. **Processo:** classe abreviada, número com pontos e UF.
   - Exemplos: `ADI 4.899/DF`, `REsp 1.949.761-MG`, `AgRg no HC 123.456-SP`, `RE 612.043`.
3. **Tema:** sempre com o tribunal.
   - Exemplos: `Tema 499/STF`, `Tema 1.051/STJ`.
   - `Tema 979 de Repercussão Geral` vale como STF, e `de Recurso Repetitivo` vale como STJ.
4. **Súmula:** sempre com o tribunal.
   - Exemplos: `Súmula 435/STJ`, `Súmula 343/STF`, `Súmula 52/TSE`.
   - Lista: `Súmulas 43 e 54/STJ`, com o tribunal no fim.
5. **Súmula Vinculante:** `Súmula Vinculante 43` ou `SV 43`, sem tribunal.
6. **O que nunca usar:**
   - "Súmula 7" ou "Tema 1.229" sem tribunal;
   - "Súmula do STJ nº 7", pois o número precisa vir logo após "Súmula";
   - nome por extenso no lugar da classe ("Recurso Especial 1.949.761" é reconhecido, mas a forma preferida é a abreviada).
7. **Ficha de Tema:** o campo `tema` deve ter só o número (ex.: `1229`), e `tribunal` deve ser STF para Repercussão Geral e STJ para Repetitivo.
8. **Ficha de Súmula:** `processo` = `Súmula N-STJ`, `Súmula N-STF` ou `Súmula N-TSE`; Súmula Vinculante = `SV N`.

## Etapas, em ordem de prioridade

### 1. Citar o tribunal (lista `A_citacoes_sem_tribunal`)

- **Volume:** 503 citações, das quais 479 são Temas e 24 são Súmulas.
- **O que fazer:** completar cada citação com `/STF`, `/STJ` ou `/TSE` no texto da conexão.
- **Como decidir:** pela fonte original da ficha (link ou informativo) e pelo contexto, como a sistemática citada ao lado ou o processo-paradigma entre parênteses.
- **Não deduzir pelo número.** Os números de Tema se repetem entre STF e STJ. Por isso, 112 dessas citações hoje mostram dois candidatos no balão, e 311 mostram um só, que pode ser o errado.
- Se não houver como confirmar, deixar como está e anotar na lista de pendências.

### 2. Conferir o tribunal (lista `B_tribunal_possivelmente_trocado`)

- **Volume:** 103 citações. Nelas, a citação diz um tribunal, mas o acervo só tem aquele número em outro. Exemplos: "Tema 1150/STJ" quando só existe o Tema 1150/STF; "Súmula 266/STJ" quando só existe a 266/STF.
- **Para cada uma, decidir entre:**
  - (a) a citação está errada → corrigir o tribunal;
  - (b) a citação está certa e falta a ficha no acervo → entra na etapa 3.
- **Súmulas do TST** (ex.: 363/TST e 390/TST) não existem no acervo: manter como estão, porque são corretas.

### 3. Lacunas do acervo (lista `C_referencias_fora_do_acervo`)

- **Volume:** 713 referências distintas, somando 876 citações, que não têm ficha.
- **Ordem sugerida:** criar fichas a partir das mais citadas (o campo `vezes` já vem em ordem decrescente).
  - Prioridade: Súmulas (114), Temas (77) e Súmulas Vinculantes (6), que são enunciados curtos e de alto valor.
  - Depois: ADIs, ADPFs e ADCs.
  - Os mais citados: Súmulas 435, 444, 364, 392, 630 e 341 do STJ; Tema 499/STF; ADI 7265; ADI 3150; ADI 3026.
- **Antes de criar, procurar erro de digitação** (número trocado, classe errada): às vezes a ficha existe com outro número.
- **Formato:** fichas novas seguem o formato da base oficial (`materiaL1`, `divisaoL2`, `processo` na convenção acima, `tema`, `tese`, `sistematica`).

### 4. Processos em formato não reconhecido (lista `F_processo_nao_reconhecido`)

- **Volume:** 8 fichas, a maioria do TSE (`REspe 0600467-44.2020.6.26.0000`) e algumas classes raras (RvCr, QC, ET).
- **O que fazer:** padronizar o número do TSE para a forma em que ele é citado nas conexões das outras fichas, ou incluir na conexão a forma curta usada pela fonte.

### 5. Consistência das fichas (listas `D`, `E`, `G`, `H`)

- **Situação hoje:** zero ocorrências em D (RG ou Repetitivo sem tema), E (tema em tribunal incompatível) e H (súmula duplicada), e 1 em G (súmula sem tribunal no processo).
- **O que fazer:** manter esses indicadores em zero ao criar fichas novas.

## Critério de aceite

Rodar `python3 relatorios/diagnostico_conexoes.py` e conferir:

- `sem_tribunal` → 0, ou só as pendências justificadas;
- `tribunal_possivelmente_trocado` → só os casos (b) já registrados como lacuna;
- `referencias_fora_do_acervo` → em queda a cada rodada;
- `citacoes_ligadas` → em alta. Hoje são 2.738 de 3.693.
