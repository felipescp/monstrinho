# Lei Seca — notas do sistema (Modo comentado) a partir de material comentado

Leia este arquivo inteiro antes de processar qualquer material. Ele explica como transformar um material de lei comentada (ex.: Eduardo B. S. Teixeira — "Belisário") nas **notas do sistema** (📘) que aparecem no 📝 Modo comentado da Lei Seca.

## Tabela de níveis (obrigatório, ao terminar)

A situação de cada diploma (1. Pura · 2. c/ Incidência · 3. Comentado) fica em `LEI-SECA-NIVEIS.md`, na raiz. Ao incluir ou alterar um diploma em qualquer nível, rode no fim:

```
python3 -I ferramentas/niveis_lei_seca.py
```

Faça commit do `LEI-SECA-NIVEIS.md` junto com o resto. Antes de publicar, `python3 -I ferramentas/niveis_lei_seca.py --verificar` tem de dizer "em dia".

## Objetivo

Extrair **só o que é relevante e indispensável para a prova**, reescrito de forma curta, e ligado ao dispositivo certo. A nota complementa a lei: não repete o texto do artigo nem a lista de provas (essa já está no mapa de incidência).

## Pré-requisitos

O diploma precisa já ter:
- a lei seca em `dados/legislacao/<arquivo>.json`;
- o mapa de incidência em `dados/leiseca/incidencia/<arquivo>.json` (ver `lei-seca-incidencia-instrucoes.md`).

Se faltar algum, **pare e avise o usuário**.

## O que o usuário envia

O material em Markdown, exportado do Word: a lei com as provas no fim de cada dispositivo, quadros "#Atenção", "#Doutrina", "#Comentários sobre o julgado", questões de concurso transcritas e julgados (STF, STJ, Dizer o Direito).

## Regra de ouro: sintetizar, não copiar

O material é de terceiros e o site é pago. Por isso:
- **Reescreva com suas palavras**, em forma de esquema. Nunca transcreva parágrafos, comentários ou enunciados de questões.
- Pode e deve citar o **identificador** de julgados e súmulas ("Súmula 365 do STF", "REsp 1.234.567", "Info 607 do STJ") e a **própria lei**.
- Ideias, entendimentos e classificações não são do autor; o texto dele, sim.
- O validador (passo 4) recusa qualquer trecho de 10 ou mais palavras seguidas igual ao material, exceto o que for texto da própria lei.

## O que entra e o que fica de fora

| Entra (indispensável) | Fica de fora |
|---|---|
| Entendimento do STF/STJ que a banca cobra (súmula, tese, informativo) | Lista de provas e siglas ("MPSP-2019…") |
| **Pegadinha**: o ponto que a banca inverte (no material, o trecho destacado "em azul", ou questão com gabarito "errado") | Enunciados de questões e "BL:" |
| Comparação que a banca explora (ex.: ação popular × ação civil pública) | O que só repete o dispositivo com outras palavras |
| Classificação doutrinária cobrada em prova | Citações longas de doutrina; histórico legislativo sem efeito prático |
| Prazos, quóruns, números e exceções ("salvo…") | Repetição: um ponto aparece **uma vez**, no dispositivo mais específico |
| Entendimento **superado**, se ainda confunde (dizer o atual) | Opinião isolada de autor sem reflexo em prova |

**Quantidade proporcional à incidência.** Os dispositivos do quartil superior do mapa (os mais cobrados) recebem nota sempre que houver algo além do texto da lei. Os pouco cobrados só recebem nota com jurisprudência ou pegadinha. Em geral, **uma nota por dispositivo** e **10 a 30 notas por lei**.

## Atualidade: confira antes de afirmar

- Veja no cabeçalho do material a data da **"última atualização jurisprudencial"**. Ela pode ser bem anterior à das questões.
- Tudo que o material marca como "superado" deve sair com o entendimento **atual** ou ficar de fora.
- Confira os julgados no acervo da Jurisprudência (`dados/jurisprudencia/*.json`, campo `processo`) e na lei seca atual. Se houver conflito, prevalece o acervo ou a lei, e você avisa o usuário.
- Se não tiver certeza de que o entendimento continua valendo, **não inclua**. Liste o ponto no relatório final para o usuário decidir.

## Formato do arquivo

`dados/leiseca/comentarios/<arquivo>.json` (mesmo nome do arquivo da lei):

```json
{
 "_leiame": "Notas do sistema da Lei 4.717/1965 (Modo comentado).",
 "_fonte": "Síntese própria a partir de material de questões (E. B. S. Teixeira), questões até DD/MM/AAAA; jurisprudência conferida em DD/MM/AAAA.",
 "diploma": "L4717",
 "atualizadoEm": "AAAA-MM-DD",
 "notas": {
  "1": [{ "texto": "markdown…", "prova": true }],
  "1§3": [{ "texto": "…", "fonte": "STJ, Info 607" }]
 }
}
```

- **Chaves**: as do mapa de incidência. `"33"` é o caput, depois `"33§4"`, `"33§pu"`, `"28.II"` e `"33§1.I"`. **Alíneas não têm chave**: a nota vai no inciso ou parágrafo a que pertencem.
- **`texto`**: markdown leve, até cerca de 900 caracteres.
- **`prova`** (opcional): `true` quando o ponto da nota foi cobrado em **3 ou mais provas** ou está no quartil superior do mapa. Aparece o selo "cai em prova".
- **`fonte`** (opcional): o julgado ou informativo que sustenta a nota, quando houver um só.

## Markdown aceito (o app desenha assim)

- `**negrito**` só na palavra-chave; `*itálico*` para latim e termos técnicos.
- Listas `- item` e `1. item`; citação `> texto`.
- **Tabelas** `| a | b |` com a linha `|---|---|`, no máximo **4 colunas**: no celular a tabela rola de lado, mas fica apertada.
- Links `[texto](https://…)` só quando indispensável.

**Citações viram link sozinhas** quando há card no acervo ou artigo na base de leis. Para isso, escreva no padrão: "Súmula 365 do STF", "REsp 1.234.567", "ADI 5.617", "art. 5º, LXXIII, da CF", "art. 18 da Lei 7.347".

## Moldes (forma; confira o conteúdo antes de usar)

**Pegadinha + jurisprudência**

```
**Só o cidadão** (eleitor) propõe. **Pessoa jurídica não** (Súmula 365 do STF).
- Pegadinha: MP, associação ou partido também não; o MP pode **assumir** a ação se o autor desistir (art. 9º).
```

**Classificação**

```
**Finalidades**
1. **Preventiva**: antes de o dano se consumar, com suspensão liminar do ato (art. 5º, § 4º).
2. **Repressiva**: desfaz o ato lesivo já praticado.
3. **Supletiva** (doutrina): obriga a Administração omissa a agir.
```

**Comparação em tabela**

```
| | Ação popular | Ação civil pública |
|---|---|---|
| Quem propõe | Só o cidadão | Rol do art. 5º da Lei 7.347 (MP, Defensoria, entes, associações…) |
| Custas | Autor isento, salvo má-fé | Associação autora isenta, salvo má-fé (art. 18 da Lei 7.347) |
| Prazo | 5 anos (art. 21) | A lei não fixa |
```

## Passos

1. **Ler** o material, a lei seca (`dados/legislacao/<arquivo>.json`) e o mapa de incidência. Ordene os dispositivos pela incidência.
2. **Redigir**, dispositivo por dispositivo, na ordem da lei, aplicando os filtros acima. Comece pelo que cai em prova; frases curtas; nada de introdução.
3. **Conferir a atualidade** (seção acima).
4. **Validar**:

   ```
   python3 -I ferramentas/validar_notas.py dados/leiseca/comentarios/<arquivo>.json dados/legislacao/<arquivo>.json --material <material.md> --incidencia dados/leiseca/incidencia/<arquivo>.json
   ```

   - Corrija todo **ERRO**: chave inexistente ou cópia literal (reescreva o trecho).
   - Trate os **AVISOS**: nota longa ou tabela larga.
   - Para cada dispositivo da lista "mais cobrados sem nota", confirme que não falta nada relevante.

5. **Ligar no manifesto**: no diploma em `dados/leiseca/manifesto.json`, acrescente `"comentarios": "dados/leiseca/comentarios/<arquivo>.json"`.

6. **Testar no navegador** (como em `lei-seca-incidencia-instrucoes.md`), em 📜 Lei Seca › diploma › 📝 Modo comentado:
   - as notas aparecem sob os dispositivos certos;
   - tabelas e listas estão bem desenhadas, inclusive na largura de celular (390 px);
   - as citações viraram link;
   - nenhum erro no console.

7. **Relatório ao usuário**:
   - quantas notas, em quais dispositivos;
   - o que ficou de fora por dúvida de atualidade (superado, conflito com o acervo), para ele decidir;
   - julgados citados sem card no acervo, que são candidatos a novos cards.
