# Lei Seca com mapa de incidência — instruções para a sessão do Claude

Leia este arquivo inteiro antes de processar qualquer material. É o arquivo público da seção 📜 Lei Seca: os artigos coloridos pela incidência em provas, com o número de cobranças por dispositivo.

## Pré-requisito

O diploma precisa já existir **como lei seca pura**:
- em `dados/legislacao/<arquivo>.json`;
- em `window.LEGISLACAO.DIPLOMAS` (index.html);
- em `dados/leiseca/manifesto.json`.

Se faltar, **pare e avise o usuário**. A lei pura é feita em outra janela, com `prompts-gem/lei-seca-instrucoes.md`.

## O que o usuário envia

Um **material de questões** em Markdown, exportado do Word. Exemplo: Eduardo B. S. Teixeira. É a lei comentada com as provas no fim de cada dispositivo cobrado, como "(MPSP-2008/2010/2017) (TJRS-2022)". Cada ano conta como uma cobrança.

## Regras

- **Não copie** comentários, questões nem texto do material. O arquivo de saída tem só a estrutura (títulos e capítulos) e a **contagem** por dispositivo, porque o material é de terceiros.
- A fonte da contagem fica registrada em `--fonte`, com o autor e a data de atualização do material.

## Passos

1. **Gerar o mapa**

   ```
   python3 -I ferramentas/incidencia_questoes.py <material.md> dados/legislacao/<arquivo>.json dados/leiseca/incidencia/<arquivo>.json --fonte "Material de questões (<autor>), até DD/MM/AAAA"
   ```

   - O script imprime quantos dispositivos e cobranças achou, e quantos artigos entraram na estrutura em relação ao total da base. Os dois números de artigos devem bater.
   - As chaves seguem este padrão: `"33"` é o caput, `"33§4"`, `"33§pu"`, `"28.II"` e `"33§1.I"`. Alíneas contam no inciso ou parágrafo a que pertencem.

2. **Tratar o que ficou de fora**

   O script lista no fim os dispositivos "não localizados na base". Para cada um:
   - **Renumerado depois do material:** use `--alias "57§pu=57§1"`, pode repetir.
   - **Erro de leitura do extrator:** corrija `ferramentas/incidencia_questoes.py`. São casos como artigo citado no meio do comentário, cabeçalho sem negrito, Livro sem Títulos, "Título único", cabeçalho sem acento ou Parte Geral/Especial.
   - **Revogado ou inexistente na lei atual:** pode ficar de fora. Diga ao usuário quais e quantas cobranças são.

3. **Conferir a estrutura**
   - Títulos e capítulos na ordem da lei.
   - Em códigos, Parte Geral (`PG ·`) e Parte Especial (`PE ·`), e Livros.
   - Os artigos sem marca (revogados, não cobrados) aparecem no lugar certo.
   - Compare uma amostra de 5 a 10 dispositivos com o material.

4. **Se mexer no extrator**, regenere os mapas já existentes e confirme com `git diff --stat dados/leiseca` que eles **não mudaram**, a não ser uma correção intencional que você explique. Os mapas existentes são CP, CC, CPP, CPC, CDC, Lei de Drogas, CADH, CF, ADCT, LEP, Lei 12.850, Estatuto do Desarmamento, Convenção 169 da OIT, Convenção Interamericana contra a Tortura, Convenção de Belém do Pará, LINDB, Lei de Improbidade, Lei da Ação Civil Pública, Lei do Mandado de Segurança, Lei dos Juizados Especiais, CTN, Lei de Execução Fiscal, Sinase, ECA, Código Florestal, Política Nacional do Meio Ambiente, Lei de Falências, Lei das S.A., Lei de Abuso de Autoridade, Lei de Economia Popular, Lei 8.137, Lei 7.492, Lei 8.176, Lei de Crimes Hediondos, Lei de Interceptação Telefônica, Lei de Lavagem de Dinheiro, Lei Maria da Penha, Lei 7.716, Lei de Tortura, Lei 12.830, Lei de Prisão Temporária, Lei de Alimentos, DL 911, Lei de Alienação Parental, Lei de Alimentos Gravídicos, Estatuto da Pessoa com Deficiência, Estatuto da Pessoa Idosa, Lei do Bem de Família, Lei de Investigação de Paternidade, Lei do Inquilinato, Declaração Universal dos Direitos Humanos, Lei do Mandado de Injunção, LGPD, PIDCP, PIDESC, LOAS, Marco Civil da Internet, Lei de Licitações (14.133), Estatuto da Cidade, Lei de Concessões (8.987), Código de Trânsito Brasileiro, Lei de Crimes Ambientais, Lei de Acesso à Informação, Lei dos Consórcios Públicos, Lei das Estatais, Lei das Organizações Sociais, Lei das PPPs, Lei das OSCIPs, Estatuto da Metrópole, MROSC (Lei 13.019), Lei Anticorrupção, Lei de Desapropriação (DL 3.365), Lei de Desapropriação por Interesse Social (4.132), Código Penal Militar, Código de Processo Penal Militar, Lei de Custeio da Seguridade Social (8.212), Lei de Benefícios da Previdência Social (8.213), Lei do Processo Administrativo (9.784) e Lei de Arbitragem. Os comandos usados estão no histórico: `git log -- dados/leiseca/incidencia`.

5. **Ligar no manifesto**: no diploma em `dados/leiseca/manifesto.json`, acrescente `"incidencia": "dados/leiseca/incidencia/<arquivo>.json"`. É isso que faz o diploma aparecer no menu Lei Seca: os diplomas sem mapa ficam ocultos.

6. **Teste no navegador**
   - Rode `python3 -m http.server 8812`, só se `curl localhost:8812` falhar.
   - Faça um script Playwright no scratchpad e rode com `NODE_PATH=$(npm root -g)`.
   - Abra 📜 Lei Seca › disciplina › diploma e confira:
     - o mapa de artigos colorido;
     - a prioridade do sistema (quartil superior = Crítico, da mediana ao quartil = Importante);
     - o número de cobranças nos dispositivos;
     - o filtro "Apenas";
     - nenhum erro no console.

7. **Commit e push**

   ```bash
   git add -A dados ferramentas
   git commit -m "Lei Seca: mapa de incidência do <Diploma>"
   B=<branch de trabalho da sessão>
   git push -u origin $B
   git fetch origin main && git checkout main && git merge --ff-only origin/main && git merge --no-edit $B && git push origin main
   git checkout $B
   ```

8. **Responder em português**, informando:
   - dispositivos e cobranças;
   - os 5 dispositivos mais cobrados;
   - o que ficou de fora e por quê;
   - ajustes feitos no extrator, com a confirmação de que os outros mapas não mudaram.

## Situação

- Com mapa: CP, CC, CPP, CPC, CDC, Lei de Drogas, CADH, CF, ADCT, LEP, Lei 12.850, Estatuto do Desarmamento, Convenção 169 da OIT, Convenção Interamericana contra a Tortura, Convenção de Belém do Pará, LINDB, Lei de Improbidade, Lei da Ação Civil Pública, Lei do Mandado de Segurança, Lei dos Juizados Especiais, CTN, Lei de Execução Fiscal, Sinase, ECA, Código Florestal, Política Nacional do Meio Ambiente, Lei de Falências, Lei das S.A., Lei de Abuso de Autoridade, Lei de Economia Popular, Lei 8.137, Lei 7.492, Lei 8.176, Lei de Crimes Hediondos, Lei de Interceptação Telefônica, Lei de Lavagem de Dinheiro, Lei Maria da Penha, Lei 7.716, Lei de Tortura, Lei 12.830, Lei de Prisão Temporária, Lei de Alimentos, DL 911, Lei de Alienação Parental, Lei de Alimentos Gravídicos, Estatuto da Pessoa com Deficiência, Estatuto da Pessoa Idosa, Lei do Bem de Família, Lei de Investigação de Paternidade, Lei do Inquilinato, Declaração Universal dos Direitos Humanos, Lei do Mandado de Injunção, LGPD, PIDCP, PIDESC, LOAS, Marco Civil da Internet, Lei de Licitações (14.133), Estatuto da Cidade, Lei de Concessões (8.987), Código de Trânsito Brasileiro, Lei de Crimes Ambientais, Lei de Acesso à Informação, Lei dos Consórcios Públicos, Lei das Estatais, Lei das Organizações Sociais, Lei das PPPs, Lei das OSCIPs, Estatuto da Metrópole, MROSC (Lei 13.019), Lei Anticorrupção, Lei de Desapropriação (DL 3.365), Lei de Desapropriação por Interesse Social (4.132), Código Penal Militar, Código de Processo Penal Militar, Lei de Custeio da Seguridade Social (8.212), Lei de Benefícios da Previdência Social (8.213), Lei do Processo Administrativo (9.784) e Lei de Arbitragem.
- Os demais diplomas de `dados/leiseca/manifesto.json` ainda não têm mapa e só precisam do material. Até lá, não aparecem no menu.
- Material com mais de um diploma (CF + ADCT): `--ate` / `--desde` com a linha que os separa.
- Capítulo cujo cabeçalho falta no material: `--capitulo "10=Cap. IV — Nome"` (Belém do Pará).
- Título que falta no material: `--titulo "209=Disposições finais e transitórias"` (CTN).
