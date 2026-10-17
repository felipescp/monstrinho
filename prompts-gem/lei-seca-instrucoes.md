# Lei Seca — instruções para a sessão do Claude

Leia este arquivo inteiro, e também `dados/legislacao/LEIAME.md`, antes de incluir qualquer diploma.

## O que o usuário envia

**Texto compilado do Planalto** salvo em Markdown (.md), um diploma por arquivo.

Esta janela trata só da **lei seca pura**, ou seja, o texto em `dados/legislacao`. Ela serve para:
- as remissões, como o balão de "art. 155 do CP" nas Conexões, Penas e Prazos;
- a leitura no menu Lei Seca;
- ser pré-requisito do mapa de incidência.

O mapa de incidência (arquivo público com o mapa de calor) é feito em outra janela, com `prompts-gem/lei-seca-incidencia-instrucoes.md`.

## Passos para cada diploma novo

1. **Gerar o JSON do texto**

   ```
   python3 -I ferramentas/legislacao_planalto.py <compilado.md> <ID> "<Nome>" <url-do-planalto> dados/legislacao/<arquivo>.json AAAA-MM-DD
   ```

   - **ID:** curto, no padrão `L<número>`. Exemplos: `L14133`, `LC101` e `DL3365`. Use sigla só para código, como `CLT` e `CPM`.
   - **Arquivo:** `lei-<número>.json`, `lc-<n>.json` ou `decreto-<n>.json`.
   - **Data:** a de hoje, que é quando o texto do Planalto foi conferido.
   - Acrescente a mesma linha em `ferramentas/gerar_legislacao.sh`.

2. **Conferir o resultado**
   - Quantidade de artigos e último artigo, comparando com o compilado.
   - Artigos com sufixo (`-A`).
   - Parágrafo único (`pu`), incisos, alíneas e revogados.
   - Notas `stf` (ADI etc.) e lista anexa, se houver.

   Se a estrutura do compilado for nova e o extrator falhar (Livro sem Título, cabeçalho sem acento, numeração quebrada), corrija `ferramentas/legislacao_planalto.py`. Depois regenere os diplomas afetados e confirme que **não mudaram**, com `git diff --stat dados/legislacao`.

3. **Registrar em `window.LEGISLACAO` → `DIPLOMAS` (index.html)**
   - Use o mesmo modelo das linhas existentes, como `L6938` e `L12850`: `{ nome, arquivo, planalto, re }`.
   - `re` reconhece o número ("Lei nº 14.133", "Lei 14133") e o nome usual e a sigla, sem capturar outros diplomas.
   - Para diploma com numeração própria, veja `itens: true` (CADH), `ancora` (ADCT) e `anexo: true` (LC 116).

4. **Incluir no menu Lei Seca (`dados/leiseca/manifesto.json`)**
   - Na disciplina certa, com `{ "id": "<ID>", "nome": "Nome curto (Lei n.º)" }`.
   - Se a disciplina ainda não existir, crie-a. Siga os nomes do edital e da taxonomia (`taxonomia.js`).

5. **Atualizar a tabela de `dados/legislacao/LEIAME.md`** com o diploma, o arquivo e a data.

6. **Diagnóstico das conexões**
   - Rode `python3 relatorios/diagnostico_conexoes.py`.
   - A lista **K** (diplomas citados que não estão na base) deve diminuir.
   - A lista **I** (dispositivo citado que não existe) não pode ganhar falsos positivos do diploma novo.

7. **Teste no navegador**
   - Rode `python3 -m http.server 8812`, só se `curl localhost:8812` falhar.
   - Faça um script Playwright no scratchpad, rodando com `NODE_PATH=$(npm root -g)`.
   - Confira:
     - o diploma aparece no menu Lei Seca e abre;
     - títulos, capítulos e artigos estão certos;
     - o balão de um artigo citado nas Conexões da Jurisprudência funciona;
     - não há erros no console.

8. **Commit e push**

   ```bash
   git add -A dados ferramentas relatorios index.html
   git commit -m "Lei Seca: <Diploma> (Lei n.º/AAAA)"
   B=<branch de trabalho da sessão>
   git push -u origin $B
   git fetch origin main && git checkout main && git merge --ff-only origin/main && git merge --no-edit $B && git push origin main
   git checkout $B
   ```

9. **Responder em português**, informando:
    - número de artigos;
    - o que precisou de ajuste no extrator;
    - quantas citações da jurisprudência passaram a ser reconhecidas, comparando a lista K antes e depois.

## Para atualizar um diploma que já existe

Rode o passo 1 sobre o mesmo arquivo, com a data nova, e atualize a data no `LEIAME.md` e em `gerar_legislacao.sh`. Os dispositivos alterados nos últimos 2 anos recebem o selo "Novo" sozinhos.

## Situação

Os diplomas já na base estão no `LEIAME.md`.

Mais citados na jurisprudência e ainda fora da base, pela lista K de `relatorios/diagnostico-conexoes.md`:
- CLT;
- Lei 6.766 (parcelamento do solo);
- Lei 14.133 (licitações) e Lei 8.666;
- Lei 12.965 (Marco Civil da Internet);
- Lei 9.514 (alienação fiduciária de imóvel) e DL 911;
- Lei 11.340 (Maria da Penha);
- Lei 9.279 (propriedade industrial);
- DL 3.365 (desapropriação);
- Lei 8.987 (concessões);
- Lei 12.594 (Sinase);
- Lei 8.072 (crimes hediondos);
- CPM;
- Lei 9.096 (partidos políticos);
- Lei 8.212 (custeio da previdência);
- Lei 8.137 (crimes contra a ordem tributária);
- LC 101 (Responsabilidade Fiscal);
- Lei 8.245 (inquilinato);
- Lei 13.146 (Estatuto da Pessoa com Deficiência).
