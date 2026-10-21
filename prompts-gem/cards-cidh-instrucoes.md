# Cards da CIDH — instruções para a sessão do Claude

Leia este arquivo inteiro antes de processar qualquer documento. Esta sessão cuida **só** da seção 🌎 **Casos da CIDH** da Jurisprudência. Os casos contenciosos e as opiniões consultivas da Corte IDH ficam em outra janela, com `prompts-gem/cards-corte-idh-instrucoes.md`.

## O que entra na seção

| `tipoCIDH` | Documento | Exemplos |
|---|---|---|
| Relatório de Mérito | Relatório do art. 51 da CADH (ou do art. 50, se publicado) | Maria da Penha (Relatório 54/01) |
| Solução Amistosa | Relatório de solução amistosa (art. 49) | José Pereira (trabalho escravo, 2003) |
| Admissibilidade | Relatório de admissibilidade relevante (art. 46/47) | quando firma tese sobre esgotamento, prazo, competência |
| Medida Cautelar | Resolução de medida cautelar deferida pela CIDH (art. 25 do Regulamento) | Belo Monte (MC 382/10), Pedrinhas, Yanomami |
| Medida Provisória (Corte IDH) | Resolução de medida provisória deferida pela Corte IDH (art. 63.2 CADH) | Plácido de Sá Carvalho, Complexo do Curado, UNIS |

**Medida provisória se sobrepõe à cautelar.** Se a Corte IDH deferiu medida provisória num assunto que começou como cautelar da CIDH, o card é o da medida provisória (`tipoCIDH` "Medida Provisória (Corte IDH)", `tribunal` "Corte IDH", data da resolução mais relevante). A cautelar só aparece no `desdobramento`, como antecedente, e não ganha card próprio nem define tipo ou data. Se o usuário enviar só a cautelar de um assunto que você sabe ter virado medida provisória, avise e espere as resoluções da Corte.

Prioridade: casos contra o **Brasil**, decisões **definitivas ou deferidas** e o que costuma cair em prova.

## O que o usuário envia

O **documento original** em Markdown (.md), convertido do PDF ou da página da CIDH/Corte IDH: relatório, resolução de cautelar ou de medida provisória. **Não há ficha intermediária**: você lê o documento e faz o card direto.

- O arquivo pode ser grande. Leia por partes (`Read` com `offset`/`limit`) ou procure as seções-chave: conclusões ("Conclusiones", "Conclusões"), recomendações, parte resolutiva ("Resuelve", "Decide"), fatos provados, análise de direito.
- Ignore cabeçalhos, rodapés, números de página e quebras soltas. O número do parágrafo é o do início do parágrafo ("45."), não o da página.
- Documento em espanhol ou inglês: o card sai em português.
- Se o .md vier em partes, espere a última antes de fazer o card.

## Fluxo

1. Identifique o tipo do documento e os dados de identificação (número do caso, petição ou MC; número do relatório ou da resolução; data; Estado; beneficiários).
2. Verifique se o caso já tem card (`id` começando por `cidh_`, ou mesmo `processo`). Se tiver, **revise o mesmo card mantendo o `id`**. Um caso com várias resoluções (ex.: medida provisória ampliada ou prorrogada) fica num card só: a mais relevante define a data, e as demais vão no `desdobramento`.
3. Extraia **só o essencial para concurso**, sempre fiel ao documento:
   - **Mérito**: artigos violados (e os não violados relevantes), a tese da Comissão e as recomendações.
   - **Solução amistosa**: os compromissos assumidos pelo Estado e o que foi cumprido.
   - **Admissibilidade**: a questão de admissibilidade decidida (esgotamento, prazo de 6 meses, competência, litispendência) e os direitos admitidos para análise.
   - **Medida cautelar / provisória**: os requisitos (gravidade, urgência e dano irreparável; na Corte IDH, extrema gravidade e urgência), os beneficiários, os direitos protegidos e as medidas determinadas.
4. Separe o que a parte **alegou** do que a CIDH/Corte **decidiu**. Alegação não entra.
5. **Relacione com a base** (`casosRelacionados`): casos da Corte IDH afins (ex.: o caso que nasceu da mesma petição, a sentença sobre o mesmo tema contra o Brasil) e outros casos da CIDH. Faça a relação inversa no card do outro caso, quando pertinente.
6. O que não estiver no documento e for clássico de prova (desfecho posterior, lei aprovada, envio à Corte IDH) pode entrar **de memória**, e você avisa o usuário.
7. Commit e push no branch de trabalho **e** em `main`.
8. Responda em português: pontos de prova, o que entrou de memória e qualquer ponto duvidoso do documento.

## Formato do card

- Arquivo: `dados/jurisprudencia/jurisprudencia-corte-idh.json`, chave única
  `"Noções Gerais de Direito, Formação Humanística e Direitos Humanos > Sistema Interamericano de Direitos Humanos"`.
- **Modelo pronto: `cidh_maria_da_penha`** (copie a estrutura dele).
- Campos fixos: `orgao: ""`, `relator: ""`, `tema: ""`, `materiaL1` e `divisaoL2` como nos demais, `sistematica: "Caso da CIDH"`, `tribunal: "CIDH"` (medida provisória: `"Corte IDH"`), `dataConsulta` = hoje, `comentario: ""`.
- Campos do caso:
  - `id`: `cidh_<nome>` (ex.: `cidh_belo_monte`)
  - `tipoCIDH`: exatamente um dos cinco valores da tabela acima (é o eixo "Tipo" do agrupamento)
  - `processo`: o destaque do card. Casos: "Caso Maria da Penha Maia Fernandes vs. Brasil". Cautelares e provisórias: "Comunidades Indígenas da Bacia do Rio Xingu vs. Brasil (Belo Monte)", "Instituto Penal Plácido de Sá Carvalho vs. Brasil" (mesmo padrão de nome dos casos: português, apelido entre parênteses)
  - `sistematicaDetalhe`: identificação oficial, ex.: "Caso 12.051 · Relatório nº 54/01", "MC 382/10 · Resolução de 01/04/2011", "Petição 1.234-05 · Relatório nº 10/07"
  - `dataJulgado`: "AAAA-MM-DD" (data do relatório ou da resolução)
  - `titulo`: a tese ou a medida em uma frase
  - `estado`, `vitima` (na cautelar/provisória: os beneficiários), `marco` (por que o caso é lembrado), `tematica`
  - `temasIDH`: só o vocabulário de `prompts-gem/cards-corte-idh-instrucoes.md`
  - `artigosCADH`: artigos da CADH violados ou protegidos (lista de strings)
  - `dispositivos`: outros instrumentos em texto livre (ex.: "Declaração Americana dos Direitos e Deveres do Homem, arts. II e XVIII; Convenção de Belém do Pará, art. 7")
  - `tese`: o que a CIDH/Corte concluiu ou determinou, com os requisitos aplicados
  - `resumo`: fatos em 2–4 frases
  - `dicas`: **3 a 5**, [{tipo, titulo, texto}], `tipo` ∈ "Vai cair", "Atenção", "Não confunda", "Cola na retina", "Green tips". Sempre uma dica que deixe claro **quem decidiu** (Comissão × Corte) e o **efeito** (recomendação, compromisso, medida obrigatória)
  - `conceitos`: 1 a 3 [{termo, explicacao}]
  - `reparacoes`: aparece como "Recomendações e medidas": recomendações do relatório, compromissos da solução amistosa ou medidas determinadas (lista curta)
  - `desdobramento`: o que veio depois (lei aprovada, envio à Corte IDH, cumprimento, prorrogação, ampliação ou levantamento da medida)
  - `casosRelacionados`: [{caso, ano, semelhanca, diferenca}], `caso` idêntico ao `processo` do outro card
  - `conexoes`: dispositivos da CADH e do Regulamento da CIDH, outros tratados, CF e leis brasileiras
  - `link`: endereço oficial do documento (cidh.oas.org / oas.org/es/cidh / corteidh.or.cr)

## Edição (Python, a partir da raiz do repo)

```python
import json
P='dados/jurisprudencia/jurisprudencia-corte-idh.json'
d=json.load(open(P,encoding='utf-8')); L=list(d.values())[0]
modelo=next(i for i in L if i['id']=='cidh_maria_da_penha')
base={k:modelo[k] for k in ["orgao","relator","tema","materiaL1","divisaoL2","sistematica","tribunal"]}
x=dict(base); x.update(id="cidh_...", criadoEm="AAAA-MM-DDT12:00:00.000Z", dataConsulta="AAAA-MM-DD", comentario="", tipoCIDH="...", ...)
assert not any(i['id']==x['id'] for i in L); L.append(x)
by={i['id']:i for i in L}  # relação inversa: by['jur_idh_outro']['casosRelacionados'].append({...})
open(P,'w',encoding='utf-8').write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
```

## Commit e push

```bash
python3 relatorios/diagnostico_conexoes.py >/dev/null 2>&1
git add -A dados relatorios
git commit -m "CIDH: <caso ou medida>"
B=<branch de trabalho da sessão>
git push -u origin $B
git fetch origin main && git checkout main && git merge --ff-only origin/main && git merge --no-edit $B && git push origin main
git checkout $B
```

A janela dos cards da Corte IDH grava no mesmo JSON. Se o push em `main` for recusado, faça `git fetch origin main`, junte (`git merge origin/main`) e envie de novo.

## Situação

- Cadastrado: Caso Maria da Penha Maia Fernandes vs. Brasil (Relatório de Mérito nº 54/01), revisado com o texto do relatório.
- Cadastrado: Adolescentes privados de liberdade no CASA Cedro vs. Brasil (MC 302/15, Resolução 43/2016; levantada pela Resolução 51/2022).
- Cadastrado: Instituto Penal Plácido de Sá Carvalho vs. Brasil (Medida Provisória da Corte IDH, Resolução de 22/11/2018). A MC 208/16 da CIDH aparece só no desdobramento.
- Sugestões para os próximos: José Pereira (solução amistosa, 2003); medidas cautelares de Belo Monte (MC 382/10), Pedrinhas e povos Yanomami e Munduruku; medidas provisórias da Corte IDH do Instituto Penal Plácido de Sá Carvalho, do Complexo do Curado e da Unidade de Internação Socioeducativa (UNIS).
