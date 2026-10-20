# Legislação — base interna (sem seção própria)

Cada diploma é um `.json` gerado a partir do texto compilado do Planalto pelo script `ferramentas/legislacao_planalto.py`. O app baixa o arquivo só na primeira consulta (por exemplo, ao passar o mouse sobre "art. 155 do CP" nas Conexões da Jurisprudência) e não o grava no armazenamento pessoal nem na nuvem.

Os diplomas estão agrupados pelas disciplinas da Lei Seca, na ordem de `dados/leiseca/manifesto.json`.

### Noções Gerais de Direito, Formação Humanística e Direitos Humanos

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Convenção Americana sobre Direitos Humanos – Pacto de São José da Costa Rica (Decreto 678/1992) | `cadh.json` | 15/10/2026 |
| Protocolo de San Salvador (Decreto 3.321/1999) | `decreto-3321.json` | 18/10/2026 (texto da página da CIDH, cidh.oas.org, não do Planalto) |
| Pacto Internacional sobre Direitos Civis e Políticos (Decreto 592/1992) | `decreto-592.json` | 18/10/2026 |
| Convenção Interamericana para Prevenir e Punir a Tortura (Decreto 98.386/1989) | `decreto-98386.json` | 18/10/2026 |
| Convenção de Belém do Pará (Decreto 1.973/1996) | `decreto-1973.json` | 18/10/2026 |
| Convenção Interamericana sobre o Desaparecimento Forçado de Pessoas (Decreto 8.766/2016) | `decreto-8766.json` | 18/10/2026 |
| Convenção sobre os Direitos da Criança (Decreto 99.710/1990) | `decreto-99710.json` | 18/10/2026 |
| CEDAW – Convenção sobre a Eliminação de Todas as Formas de Discriminação contra a Mulher (Decreto 4.377/2002) | `decreto-4377.json` | 18/10/2026 (o compilado não traz o título "Artigo 22"; inserido antes da extração, ver `gerar_legislacao.sh`) |
| Estatuto de Roma do Tribunal Penal Internacional (Decreto 4.388/2002) | `decreto-4388.json` | 18/10/2026 |
| Convenção nº 169 da OIT sobre Povos Indígenas e Tribais (Decreto 5.051/2004; Anexo LXXII do Decreto 10.088/2019) | `convencao-169-oit.json` | 18/10/2026 (texto **reconstruído** de cópia com OCR defeituoso e revisado à mão, `ferramentas/textos/convencao-169-oit.md`; conferir com o Planalto quando possível) |
| Declaração das Nações Unidas sobre os Direitos dos Povos Indígenas (Resolução 61/295, 2007) | `declaracao-povos-indigenas.json` | 18/10/2026 (tradução da UNIC Rio, 2009; não há decreto nem compilado do Planalto) |
| Convenção sobre os Direitos das Pessoas com Deficiência (Decreto 6.949/2009) | `decreto-6949.json` | 18/10/2026 |
| Protocolo Facultativo à Convenção sobre os Direitos das Pessoas com Deficiência (Decreto 6.949/2009) | `decreto-6949-protocolo.json` | 18/10/2026 (mesmo compilado; numeração própria, recortado a partir do título do Protocolo) |
| Estatuto da Pessoa com Deficiência – Lei Brasileira de Inclusão (Lei 13.146/2015) | `lei-13146.json` | 20/10/2026 |
| Regras de Mandela – Regras Mínimas das Nações Unidas para o Tratamento de Presos | `regras-mandela.json` | 18/10/2026 (edição do CNJ, 2016, Série Tratados Internacionais de Direitos Humanos; não há decreto nem compilado do Planalto) |
| Regras de Bangkok – Regras das Nações Unidas para o Tratamento de Mulheres Presas e Medidas Não Privativas de Liberdade para Mulheres Infratoras | `regras-bangkok.json` | 18/10/2026 (edição do CNJ, 2016; sem o texto das antigas Regras Mínimas que o CNJ intercala) |

### Direito Constitucional

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Constituição Federal | `constituicao.json` | 09/10/2026 |
| ADCT | `adct.json` | 09/10/2026 |

### Direito Administrativo

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Servidores Públicos Federais (Lei 8.112/1990) | `lei-8112.json` | 09/10/2026 |
| Lei do Processo Administrativo Federal (Lei 9.784/1999) | `lei-9784.json` | 11/10/2026 |
| Improbidade Administrativa (Lei 8.429/1992) | `lei-8429.json` | 09/10/2026 |
| Lei da Ação Popular (Lei 4.717/1965) | `lei-4717.json` | 11/10/2026 |
| Decreto 20.910/1932 (prescrição quinquenal contra a Fazenda) | `decreto-20910.json` | 11/10/2026 |

### Direito Processual Civil

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Código de Processo Civil | `cpc.json` | 09/10/2026 |
| Ação Civil Pública (Lei 7.347/1985) | `lei-7347.json` | 09/10/2026 |
| Lei do Mandado de Segurança (Lei 12.016/2009) | `lei-12016.json` | 11/10/2026 |
| Lei dos Juizados Especiais Cíveis e Criminais (Lei 9.099/1995) | `lei-9099.json` | 11/10/2026 |
| Lei 9.494/1997 (tutela antecipada contra a Fazenda; art. 1º-F) | `lei-9494.json` | 11/10/2026 |
| Lei do Bem de Família (Lei 8.009/1990) | `lei-8009.json` | 11/10/2026 |
| Lei de Alimentos (Lei 5.478/1968) | `lei-5478.json` | 20/10/2026 |
| Lei de Alimentos Gravídicos (Lei 11.804/2008) | `lei-11804.json` | 20/10/2026 |

### Direito Penal

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Código Penal | `codigo-penal.json` | 08/10/2026 |
| Lei Maria da Penha (Lei 11.340/2006) | `lei-11340.json` | 20/10/2026 |
| Lei dos Crimes Raciais (Lei 7.716/1989) | `lei-7716.json` | 20/10/2026 |
| Lei de Tortura (Lei 9.455/1997) | `lei-9455.json` | 20/10/2026 |
| Lei dos Crimes Hediondos (Lei 8.072/1990) | `lei-8072.json` | 20/10/2026 |
| Lei de Drogas (Lei 11.343/2006) | `lei-11343.json` | 09/10/2026 |
| Estatuto do Desarmamento (Lei 10.826/2003) | `lei-10826.json` | 11/10/2026 |
| Lei de Organizações Criminosas (Lei 12.850/2013) | `lei-12850.json` | 11/10/2026 |
| Lei de Lavagem de Dinheiro (Lei 9.613/1998) | `lei-9613.json` | 20/10/2026 |
| Lei de Abuso de Autoridade (Lei 13.869/2019) | `lei-13869.json` | 20/10/2026 (recortado com `--fim` antes da promulgação das partes vetadas, que repete artigos com reticências) |
| Crimes contra a Economia Popular (Lei 1.521/1951) | `lei-1521.json` | 20/10/2026 |
| Crimes contra a Ordem Tributária, Econômica e as Relações de Consumo (Lei 8.137/1990) | `lei-8137.json` | 20/10/2026 |
| Crimes contra o Sistema Financeiro Nacional (Lei 7.492/1986) | `lei-7492.json` | 20/10/2026 |
| Crimes contra a Ordem Econômica – combustíveis e usurpação de bens da União (Lei 8.176/1991) | `lei-8176.json` | 20/10/2026 |
| Código de Trânsito Brasileiro (Lei 9.503/1997) | `ctb.json` | 09/10/2026 |

### Direito Processual Penal

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Código de Processo Penal | `cpp.json` | 09/10/2026 |
| Lei de Execução Penal | `lep.json` | 09/10/2026 |
| Lei de Interceptação Telefônica (Lei 9.296/1996) | `lei-9296.json` | 20/10/2026 |
| Lei da Prisão Temporária (Lei 7.960/1989) | `lei-7960.json` | 20/10/2026 |
| Investigação Criminal pelo Delegado de Polícia (Lei 12.830/2013) | `lei-12830.json` | 20/10/2026 |

### Direito Civil

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Código Civil | `codigo-civil.json` | 09/10/2026 |
| Lei de Introdução às Normas do Direito Brasileiro (Decreto-Lei 4.657/1942) | `lindb.json` | 11/10/2026 |
| Alienação fiduciária – busca e apreensão (Decreto-Lei 911/1969) | `decreto-lei-911.json` | 20/10/2026 |

### Direito Financeiro e Tributário

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Código Tributário Nacional | `ctn.json` | 09/10/2026 |
| Execução Fiscal (Lei 6.830/1980) | `lei-6830.json` | 09/10/2026 |
| Lei Complementar 116/2003 (ISS), com a lista de serviços anexa | `lc-116.json` | 11/10/2026 |

### Direito Empresarial

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Lei das Sociedades por Ações (Lei 6.404/1976) | `lei-6404.json` | 11/10/2026 |
| Recuperação Judicial e Falência (Lei 11.101/2005) | `lei-11101.json` | 09/10/2026 |

### Direito do Consumidor

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Código de Defesa do Consumidor | `cdc.json` | 09/10/2026 |
| Planos de Saúde (Lei 9.656/1998) | `lei-9656.json` | 09/10/2026 |

### Direito Eleitoral

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Código Eleitoral (Lei 4.737/1965) | `codigo-eleitoral.json` | 11/10/2026 |
| Lei das Eleições (Lei 9.504/1997) | `lei-9504.json` | 11/10/2026 |

### Direito Ambiental

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Crimes Ambientais (Lei 9.605/1998) | `lei-9605.json` | 09/10/2026 |
| Código Florestal (Lei 12.651/2012) | `lei-12651.json` | 11/10/2026 |
| Política Nacional do Meio Ambiente (Lei 6.938/1981) | `lei-6938.json` | 11/10/2026 |

### Direito da Criança e do Adolescente

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Estatuto da Criança e do Adolescente | `eca.json` | 09/10/2026 |
| Sistema Nacional de Atendimento Socioeducativo – Sinase (Lei 12.594/2012) | `lei-12594.json` | 19/10/2026 |
| Lei da Alienação Parental (Lei 12.318/2010) | `lei-12318.json` | 20/10/2026 (o compilado não risca as redações antigas; o parágrafo único do art. 6º, renumerado § 1º, é descartado pelo extrator) |

### Direito Previdenciário

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Lei de Benefícios da Previdência Social (Lei 8.213/1991) | `lei-8213.json` | 09/10/2026 |

### Estatuto da Advocacia

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Estatuto da Advocacia e da OAB (Lei 8.906/1994) | `lei-8906.json` | 09/10/2026 (incompleto: faltam os arts. 68 a 87, ausentes do compilado enviado) |

**Convenções (CADH, Convenção contra a Tortura, Convenção de Belém do Pará, Convenção sobre Desaparecimento Forçado, Protocolo de San Salvador, Convenção sobre os Direitos da Criança, CEDAW, Estatuto de Roma, PIDCP, Pessoas com Deficiência e seu Protocolo Facultativo)** não seguem o padrão caput/§/inciso ("ARTIGO 1", itens "1.", alíneas "a)", parágrafos sem número). São citadas como "art. 8.2, h", "art. 7.b, f e g", "arts. 7.1 a 7.6" ou, com artigos em romanos (Desaparecimento Forçado), "arts. I.a e III"; a chave do artigo fica em romanos ("IV"). Subitens em romanos dentro da alínea ("i) Homicídio doloso", Estatuto de Roma, art. 8.2.a) ficam no texto da alínea, um por linha. Elas são geradas por `ferramentas/convencao_planalto.py`, não pelo `legislacao_planalto.py`, e levam `itens: true` em `DIPLOMAS`.

**Regras de Mandela e de Bangkok** (e a **Declaração da ONU sobre os Direitos dos Povos Indígenas**, edição da UNIC Rio) vêm do PDF do CNJ convertido em Markdown, com linhas quebradas, cabeçalhos de página, notas de rodapé e os parágrafos numerados trocados por "- ". `ferramentas/regras_onu_cnj.py` limpa o texto, numera os parágrafos (1, 2, 3…) e o passa ao `convencao_planalto.py`. Nas Regras de Bangkok, o CNJ intercala o texto das antigas Regras Mínimas complementadas ("[Complementa a regra 7…]"); esse bloco sai. A chave é o número da Regra; no app, `rotulo: 'Regra'` troca "Art." por "Regra", e "regras 43 a 45" é reconhecido nas Conexões.

**CF e ADCT** vêm do mesmo compilado. Eles ficam em arquivos separados porque o ADCT recomeça a numeração no art. 1º. Para recortar cada parte, use `--fim` (CF) e `--inicio` (ADCT) com `'^ATO DAS DISPOSI[ÇC][ÕO]ES CONSTITUCIONAIS TRANSIT[ÓO]RIAS$'`.

## Incluir ou atualizar um diploma

1. **Salvar o compilado.** Salve a página compilada do Planalto em Markdown, como foi feito com o `DEL2848compilado.md`.
2. **Gerar o JSON.** Rode o script:

   ```
   python3 ferramentas/legislacao_planalto.py <compilado.md> <ID> "<Nome>" <url-do-planalto> dados/legislacao/<arquivo>.json AAAA-MM-DD
   ```

3. **Registrar o diploma.** Só se o diploma for novo: acrescente uma linha em `window.LEGISLACAO` → `DIPLOMAS` no `index.html`. A linha leva o ID, o arquivo, a URL do Planalto e a expressão que reconhece a sigla ou o nome do diploma.

## Alíneas sem inciso (`ali` no artigo ou parágrafo)

Até 20/10/2026, o extrator só aceitava alínea dentro de inciso; a alínea direto no artigo ou parágrafo (CP, art. 33, § 1º, "a" a "c") era emendada no texto. O extrator foi corrigido, e os JSONs já gerados foram consertados por `ferramentas/separa_alineas.py` (77 dispositivos em 14 diplomas; só o padrão "…: a) …; b) …", sem texto citado de outra lei). No balão, "art. 33, § 1º, "a"" mostra a alínea citada; sem alínea, lista todas.

## Incisos com sufixo escritos "V - A"

O compilado da CF escreve alguns incisos com sufixo como "V - A as causas…". Até 20/10/2026 o extrator lia isso como um novo inciso "V" de texto "A as causas…", que apagava o V verdadeiro: aconteceu na CF, art. 92 (I-A, CNJ, apagava o I) e art. 109 (V-A, IDC, apagava o V). O extrator foi corrigido (vira "V-A" quando o "V" já existe) e os dois incisos foram restaurados no `constituicao.json` com o texto constitucional. As Conexões também passaram a reconhecer inciso com sufixo ("art. 1º, I-A", "art. 93, VIII-A"); antes ficava só "I" ou "VIII".

## Notas de controle de constitucionalidade (`stf`)

Quando o compilado do Planalto anota "Declarado inconstitucional pela ADI…", "Expressões declaradas inconstitucionais…" ou "Vide ADI/ADC/ADPF…", o dispositivo ganha `stf: [{tipo, ref}]`, com `tipo` = `inconst`, `inconst_parcial` ou `vide`. O texto do Planalto não muda; o balão mostra o aviso ("⚖️ Declarado inconstitucional pelo STF (ADI 5.538)") ou a remissão ("⚖️ Vide ADI 3.112").

## Lista anexa (`anexo`)

Quando o compilado traz uma lista anexa ("Lista de serviços anexa à Lei Complementar…"), os itens vão para `anexo: {"1": {...}, "1.05": {...}}`. No app, "item 15.09 da lista anexa à LC 116" e "subitens 4.22 e 4.23" abrem o balão do item, com o grupo (ex.: "15 – Serviços relacionados ao setor bancário").
