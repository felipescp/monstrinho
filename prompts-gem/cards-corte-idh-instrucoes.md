# Cards da Corte IDH — instruções para a sessão do Claude

Leia este arquivo inteiro antes de processar qualquer ficha.

## Fluxo

1. O usuário envia uma ficha (.txt) gerada pelo Gem com `prompts-gem/extrator-corte-idh.txt`.
2. Verifique se o caso já tem card (busque pelo nome/id). Se tiver, **revise o mesmo card mantendo o `id`** (preserva as marcações pessoais do usuário). Se não, crie.
3. Só o **essencial para concurso**: tese, dicas de prova, artigos violados, conceitos cobráveis, reparações estruturais ou incomuns. Estilo enxuto.
4. **Relacione com outros casos da base** (`casosRelacionados`), inclusive a relação inversa no card do outro caso, quando pertinente.
5. A ficha manda (fidelidade ao dispositivo). Se ela divergir do que você sabe, confira e **avise o usuário**. Pode acrescentar de memória o que for clássico de prova (ex.: Série C, nome doutrinário da tese), avisando.
6. Commit e push no branch de trabalho **e** em `main` (ver abaixo).
7. Responda em português: pontos de prova, o que entrou de memória, divergências com a ficha.

## Arquivo e formato

- Arquivo: `dados/jurisprudencia/jurisprudencia-corte-idh.json`, chave única
  `"Noções Gerais de Direito, Formação Humanística e Direitos Humanos > Sistema Interamericano de Direitos Humanos"` (lista de cards).
- Campos fixos (copie de um card existente): `tribunal`, `orgao`, `relator`, `sistematica` ("Caso Contencioso (Corte IDH)" ou "Opinião Consultiva (Corte IDH)"), `tema` (vazio), `dataConsulta`, `materiaL1`, `divisaoL2`.
- Campos do caso:
  - `id`: `jur_idh_<nome>`; `criadoEm`; `comentario: ""`
  - `processo`: "Caso X vs. País" — é o destaque do card. Padrão: em português, sem artigo após "Caso" ("Caso Povo Saramaka", não "Caso do Povo Saramaka"); "e outros/outras/outro/outra" e demais partes do nome oficial em minúsculas; apelido entre parênteses e aspas ("Guerrilha do Araguaia"), traduzido quando houver tradução usual (exceção: "Campo Algodonero")
  - `titulo`: síntese da tese em uma frase
  - `estado` (na OC: o solicitante), `vitima`, `marco`, `tematica`
  - `sistematicaDetalhe`: "Série C, nº N"; `dataJulgado`: "AAAA-MM-DD" (ou só "AAAA" se desconhecida)
  - `temasIDH`: lista, usando **só** o vocabulário abaixo (criar tema novo só se nenhum servir)
  - `dicas`: [{tipo, titulo, texto}] — `tipo` é "Vai cair", "Atenção", "Não confunda", "Cola na retina" ou "Green tips" (das marcações #VAICAIR, #ATENÇÃO, #NÃOCONFUNDA, #COLANARETINA e #GREENTIPS da ficha); `titulo` curto; `texto` em 1–2 frases. Alvo de 5 a 8 dicas: unificar dicas afins e cortar o puramente processual (placar comum, custas, publicação, "sentença é reparação", quarta instância/esgotamento/reconhecimento parcial genéricos); placar só quando cobrável, embutido na dica temática. Inclua votação apertada e artigos NÃO violados relevantes como dica. Sem `sentencas` (campo abolido)
  - `artigosCADH`: lista de strings ("8.1", "25.1", "1.1", "2")
  - `tese`, `resumo` (fatos curtos)
  - `conceitos`: [{termo, explicacao}] (4–6)
  - `reparacoes`: lista curta (estruturais primeiro)
  - `casosRelacionados`: [{caso, ano, semelhanca, diferenca}] — `caso` deve ser **idêntico** ao `processo` do outro card para virar link
  - `conexoes`: dispositivos da CADH, outros tratados, CF/leis brasileiras e precedentes
  - `link`: `https://www.corteidh.or.cr/docs/casos/articulos/seriec_<N>_esp.pdf`

### Vocabulário de `temasIDH`

Desaparecimento forçado · Anistia e justiça de transição · Execução extrajudicial · Tortura e integridade pessoal · Justiça militar e devido processo · Dever de investigar e proteção judicial · Liberdade de expressão, associação e vida privada · Nacionalidade · Crianças e adolescentes · Saúde e pessoas com deficiência · Escravidão e trabalho forçado · Pobreza e discriminação estrutural · Projeto de vida e reparações · Competência da Corte · Defensores de direitos humanos e movimentos sociais · Violência policial · Violência de gênero · Povos indígenas e comunidades tradicionais · Direitos sociais (art. 26) · Racismo e discriminação racial · Pessoas privadas de liberdade · Pena de morte · Direitos políticos · Migrantes · Direitos sexuais e reprodutivos · Conflito armado e DIH

## Edição (Python, a partir da raiz do repo)

```python
import json
P='dados/jurisprudencia/jurisprudencia-corte-idh.json'
d=json.load(open(P,encoding='utf-8')); L=list(d.values())[0]
base={k:L[0][k] for k in ["tribunal","orgao","relator","sistematica","tema","dataConsulta","materiaL1","divisaoL2"]}
x=dict(base); x.update(id="jur_idh_...", criadoEm="AAAA-MM-DDT12:00:00.000Z", comentario="", ...)
assert not any(i['id']==x['id'] for i in L); L.append(x)
by={i['id']:i for i in L}  # para relações inversas: by['jur_idh_outro']['casosRelacionados'].append({...})
open(P,'w',encoding='utf-8').write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
```

## Commit e push

```bash
python3 relatorios/diagnostico_conexoes.py >/dev/null 2>&1
git add -A dados relatorios
git commit -m "Corte IDH: <Caso>"
B=<branch de trabalho da sessão>
git push -u origin $B
git fetch origin main && git checkout main && git merge --ff-only origin/main && git merge --no-edit $B && git push origin main
git checkout $B
```

## Situação

- Base com 93 casos contenciosos; nenhuma Opinião Consultiva ainda (Atala Riffo tem só a sentença de interpretação na ficha; mérito entrou de memória).
- Todos os cards já revisados com a ficha nova. Todos os cards têm `dicas`, mas só os enviados como "Seção 6" no padrão novo (9–11 dicas, com #COLANARETINA e #GREENTIPS, artigos não violados e reparação) estão completos. Dicas no padrão antigo (das primeiras fichas), a refazer quando vier a seção 6 nova — pendentes: Tribunal Constitucional (Peru), Castillo Petruzzi. Padrão intermediário (seção 6 nova, mas sem #COLANARETINA/#GREENTIPS): Velásquez Rodríguez, Cantoral Benavides, Ivcher Bronstein, Loayza Tamayo, Villagrán Morales, Barrios Altos, Awas Tingni, Última Tentação, Hilaire, Myrna Mack.
- Casos citados em `casosRelacionados` que ainda não têm card (viram link quando criados; use exatamente este nome no `processo`): Albán Cornejo e outros vs. Equador; Huilca Tecse vs. Peru; Massacres de Ituango vs. Colômbia; Raxcacó Reyes vs. Guatemala; Tristán Donoso vs. Panamá; Azul Rojas Marín e outra vs. Peru; Baldeón García vs. Peru; Cinco Aposentados vs. Peru; García Asto e Ramírez Rojas vs. Peru; Godínez Cruz vs. Honduras; La Cantuta vs. Peru; Meninas Yean e Bosico vs. República Dominicana; Nadege Dorzema e outros vs. República Dominicana; Petro Urrego vs. Colômbia.
