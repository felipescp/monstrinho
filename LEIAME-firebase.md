# A Salinha no Firebase (laboratório protegido)

Projeto `monstrinho-lab` · site `https://www.asalinha.com.br` · bucket `gs://monstrinho-lab.firebasestorage.app`

O nome exposto passou a ser **A Salinha**. Os nomes internos (projeto, repositório, chaves `tjpe_v1__`, logo `monstrinho.png`) não mudaram.

## Como funciona

- **Hosting** publica só o app (`index.html`, `dashboard.html`, `taxonomia.js`, imagens). A pasta `dados/` **não** vai para o Hosting.
- **Storage** guarda o acervo em `dados/` (sem `dados/materiais/pdfs`, que o app não usa).
- **`storage.rules`** só entrega o acervo a quem:
  - entrou com Google, com e-mail verificado;
  - tem o documento `acessos/{e-mail}` no Firestore, com `ativo: true`.
- **No `index.html`**, o bloco `SALINHA_FB`, no topo do `<head>`:
  - acompanha o login Google;
  - confirma o acesso;
  - registra o pedido de acesso de quem ainda não foi liberado;
  - troca cada leitura de `dados/…` por uma leitura no Storage com o token do usuário.
- **Sem tela cheia:** o app abre normalmente.
  - O botão **Entrar com Google** fica no topo.
  - Antes do login, uma faixa avisa que o acervo e os dados pessoais só aparecem depois de entrar.
  - As partes que dependem do acervo ficam vazias e se preenchem sozinhas quando o acesso é liberado.
- **Endereço único:** tudo isso só roda em `www.asalinha.com.br`. Os endereços `monstrinho-lab.web.app`, `monstrinho-lab.firebaseapp.com` e `asalinha.com.br` redirecionam para ele. Cada endereço tem o seu armazenamento no navegador, por isso só um pode valer.
- **No `localhost`**, nada disso roda, a não ser com `?lab=1` (ver "Testar no localhost").
- **Seções e baterias** exigem login Google com acesso liberado.
- **Dados pessoais:** são sincronizados sozinhos no Firestore (ver "Sincronização automática"). Não há mais botões ☁️ Salvar/Carregar nem login com GitHub na A Salinha. Esses ficam só no Monstrinho antigo (branch `pages-legado`).

## Primeira publicação (manual, uma vez)

No terminal, dentro da pasta do Monstrinho, depois de `git pull`.

1. **Instalar as ferramentas.** São o Firebase CLI e o Google Cloud CLI (https://cloud.google.com/sdk/docs/install).
   ```
   npm install -g firebase-tools
   firebase login
   gcloud auth login
   gcloud config set project monstrinho-lab
   ```

2. **Liberar o seu acesso.** No console do Firebase, vá em Firestore Database → Iniciar coleção e preencha:
   - ID da coleção: `acessos`;
   - ID do documento: o seu e-mail Google, em minúsculas;
   - campo `ativo`, tipo boolean, valor `true`.

3. **Enviar o acervo e liberar o CORS.**
   ```
   gcloud storage rsync dados gs://monstrinho-lab.firebasestorage.app/dados --recursive --exclude="^materiais/pdfs/"
   gcloud storage buckets update gs://monstrinho-lab.firebasestorage.app --cors-file=cors.json
   ```

4. **Publicar o app e as regras.**
   ```
   firebase deploy --only hosting,storage,firestore:rules
   ```
   Se o CLI pedir permissão para as regras do Storage consultarem o Firestore, responda **Y**.

5. **Nome na tela do Google.** Em Configurações do projeto → Geral → "Nome voltado ao público", troque `project-1031537511970` por `Monstrinho`.

6. **Testar.** Abra `https://www.asalinha.com.br`, clique em Entrar com Google e confira se o app abre com o acervo.

## Publicação automática a cada push no `main` (GitHub Action)

O arquivo `.github/workflows/firebase.yml` fica desligado até você fazer os passos abaixo.

1. **Criar a conta de serviço.** No Google Cloud Console (projeto `monstrinho-lab`), vá em IAM → Contas de serviço → Criar, com o nome `github-deploy`. Dê três papéis:
   - **Administrador do Firebase**;
   - **Administrador de objetos do Storage**;
   - **Leitor de chaves de API**.
2. **Gerar a chave.** Na conta criada, vá em Chaves → Adicionar chave → JSON. O arquivo é baixado.
3. **Guardar a chave no GitHub.** No repositório, vá em Settings → Secrets and variables → Actions:
   - em **Secrets**, crie `FIREBASE_SERVICE_ACCOUNT` e cole o conteúdo inteiro do JSON;
   - em **Variables**, crie `FIREBASE_DEPLOY` com o valor `sim`.
4. **Apagar o JSON baixado** do computador. A chave fica só no GitHub.

A partir daí, cada push no `main` faz seis coisas:
- gera `dados/versoes-oficiais.json` (fora do git) com `ferramentas/versoes_oficiais.py`: um resumo de cada arquivo de Jurisprudência, Esquemas, Flashcards e Glossário. O app guarda uma cópia desses arquivos no aparelho, fora do backup, e só baixa de novo os que mudaram;
- gera o índice raso das baterias (`dados/bateriasvf/indice.json` e `indice-versao.json`, sem enunciados nem explicações, fora do git) com `ferramentas/indice_baterias.py`. O app lê só esse índice ao abrir e baixa o arquivo completo de uma bateria quando ela é aberta (carregamento sob demanda). Se o índice faltar, o app volta a baixar todos os arquivos;
- envia ao Storage o que mudou em `dados/`;
- gera o catálogo público da vitrine (`vitrine-publica.js`, sem as questões);
- **minifica** `index.html` e `dashboard.html` só na cópia publicada, com a configuração de `ferramentas/minificar.json`. O repositório continua com o código legível. Se a minificação falhar, a publicação para e nada quebrado vai ao ar;
- publica o app e as regras.

O resultado aparece na aba Actions. Para desligar, mude `FIREBASE_DEPLOY` para qualquer outro valor.

## Depois que o site no Firebase estiver funcionando

- Deixe o repositório **privado**: GitHub → Settings → General → Danger Zone → Change visibility.
- O GitHub Pages (Monstrinho antigo, branch `pages-legado`) sai do ar.
- O Worker do Cloudflare (`cloudflare-worker/`) só serve ao login do GitHub do Monstrinho antigo. A Salinha não o usa.

## Níveis de acesso e liberação

Há três níveis, no campo `nivel` do documento `acessos/{e-mail}` (a lista completa do que cada um libera está em `window.mostrarNiveis`, no `index.html`):

| Nível | Como chega | O que libera |
|---|---|---|
| `simples` | Só o login | Todas as baterias, com os **materiais associados** na barra lateral e todas as estatísticas; as seções **Flashcards** e **Glossário**; uma **amostra da Lei Seca** (os diplomas citados na bateria, sem os comentários do sistema). Não salva questões. |
| `intermediario` | Permissão da administração | Tudo do simples, mais as seções **Esquemas**, **Jurisprudência**, **Prazos** e **Penas** (sem o Treinar); **Lei Seca** comentada só com o diploma mais cobrado de cada disciplina; **criar 1 esquema com IA por semana** (IA Simples); salvar **questões sem limite**; refazer erradas e caderno de questões salvas. |
| `completo` | Em breve (será a assinatura) | Tudo: Lei Seca inteira, Treinar em Prazos e Penas, comentários e grifos (Jurisprudência e questões), exportar selecionados, clonar esquemas, **10 esquemas com IA por semana**. Contas ativas **sem** o campo `nivel` (liberadas antes dos níveis) também são completas. |

O que não é do nível aparece **visível, mas desabilitado** (esmaecido, com 🔒); ao clicar, abre a explicação dos níveis.

Não é preciso pedir o e-mail a ninguém:

1. A pessoa abre `www.asalinha.com.br` e clica em **Entrar com Google**.
2. No primeiro login, o app cria sozinho `acessos/{e-mail}` com `ativo: true` e `nivel: "simples"`, e a pessoa já começa a usar. Ao lado do nome aparece o selo **ACESSO SIMPLES** (no intermediário, **INTERMEDIÁRIO**).
3. Ao clicar numa seção com 🔒 (ou no selo), ela pode **Pedir acesso intermediário**. O app grava `pedidoCompletoEm` no documento (o nome antigo do campo foi mantido), e você recebe o e-mail (ver "Aviso por e-mail de pedidos de acesso").
4. Para liberar: no console do Firebase, em **Firestore Database → acessos →** documento da pessoa, mude `nivel` para `intermediario` (ou `completo`, para assinantes). A pessoa recarrega o site. Para quem está no intermediário, o botão **Completo** aparece desabilitado, sem preço nem chamada de assinatura (divulgação como ferramenta, não como produto).

Outras situações:
- **Voltar para o acesso simples:** mude `nivel` para `simples`.
- **Bloquear alguém:** mude `ativo` para `false` e `nivel` para `bloqueado`. O site mostra "acesso suspenso". Só `ativo: false`, sem `nivel: "bloqueado"`, não basta para um pedido antigo, porque ele viraria acesso simples no próximo login.
- **Pedidos antigos** (de antes dos níveis, com só `ativo: false` e `pedidoEm`) viram acesso simples sozinhos no próximo login da pessoa.

**A trava é no servidor.** `storage.rules` só entrega as pastas `bateriasvf`, `esquemas`, `jurisprudencia`, `flashcards`, `glossario` e `legislacao` (o texto das leis usado nas remissões) a quem está no acesso simples. Da Lei Seca, o acesso simples recebe só o manifesto e os mapas de incidência (a amostra; a escolha dos diplomas citados na bateria é feita pelo app). O intermediário recebe também Prazos, Penas e os comentários da Lei Seca do diploma mais cobrado de cada disciplina: a lista desses arquivos em `storage.rules` é regerada a cada publicação por `ferramentas/regras_intermediario.py`, a partir da ordem do manifesto. Os demais comentários do sistema ficam só no completo. A cota de esquemas com IA é contada no servidor (`cotaIA/{e-mail}_{segunda-feira}`, que só a função lê e grava). Pelo app, a pessoa só cria a própria conta no acesso simples e só marca o pedido do completo: subir de nível, mudar papel e validade continua só pelo console (`firestore.rules`).

**Limite:** os materiais associados (Esquemas, Jurisprudência, Flashcards) chegam inteiros ao aparelho de quem está no acesso simples, porque a barra lateral de cada bateria precisa deles. O cadeado nas seções fecha o acesso pela tela, não impede quem tenha conhecimento técnico de olhar esses dados no navegador. O mesmo vale para a amostra da Lei Seca: o servidor entrega os mapas de incidência a quem está no acesso simples, e o app limita a amostra aos diplomas citados na bateria. Comentários do sistema, Prazos e Penas nem são baixados.

### Acesso com prazo (opcional)

Para liberar alguém só até uma data, acrescente no documento dessa pessoa o campo `expiraEm`, do tipo **timestamp**, com a data e a hora. Sem o campo, o acesso não vence.

- As regras (`firestore.rules` e `storage.rules`) deixam de entregar o acervo e os dados sincronizados depois dessa data.
- Nos últimos 7 dias, o site mostra "Seu acesso vence em N dias".
- Depois do prazo, mostra "O acesso de … venceu em …".
- Para renovar, mude a data. Para tirar o prazo, apague o campo.

No futuro, esse documento passa a ser gravado pela Cloud Function de pagamento.

## Conta de administração (papel "admin")

Algumas opções são só da administração:
- exportações completas do acervo (Exportar Tudo / Disciplina / Tópico / Visíveis, .json e .md), na Jurisprudência, nos Esquemas, no Glossário, nos Flashcards, em Prazos e em Penas;
- "Exportar Grupo" e "Exportar Selecionadas" das baterias, e exportar uma bateria oficial;
- importações em massa de Jurisprudência, Glossário e Flashcards;
- "📥 Restaurar (apaga atual)".

Para todos continuam: todas as seções, 📤 Backup, 📥 Merge, Gerar Questões e a importação em massa de Esquemas.

Para marcar uma conta como admin:
1. No console do Firebase, abra **Firestore Database → acessos →** o documento com o e-mail da conta.
2. Clique em **Adicionar campo**: nome `papel`, tipo `string`, valor `admin`.
3. Na conta, recarregue o site. As opções aparecem logo depois do login.

Para tirar o privilégio, apague o campo `papel`. Ninguém consegue se dar esse papel pelo app: `firestore.rules` só deixa o usuário criar a própria conta no acesso simples e marcar o pedido do completo, nada além disso.

Os botões somem para quem não é admin, e as funções também recusam. Ainda assim, o que o aluno já baixou para estudar (cards, esquemas, baterias abertas) está no navegador dele: a restrição impede a cópia fácil do acervo inteiro, não a de quem tenha conhecimento técnico.

## App Check (só o site acessa o acervo)

Com o App Check aplicado, o Storage e o Firestore só atendem pedidos vindos do próprio site em www.asalinha.com.br. Scripts e robôs, mesmo com uma conta liberada, ficam de fora. O código já está pronto em `index.html` (`APP_CHECK_SITE_KEY`) e fica desligado enquanto a chave estiver vazia.

1. **Criar a chave do reCAPTCHA v3** em google.com/recaptcha/admin/create:
   - tipo **reCAPTCHA v3**;
   - domínios `www.asalinha.com.br` e `asalinha.com.br`.

   Saem duas chaves: a **chave do site**, que é pública, e a **chave secreta**.
2. **Firebase → App Check → Apps →** o app web → **reCAPTCHA** → cole a **chave secreta** e salve.
3. **Colocar a chave do site** em `APP_CHECK_SITE_KEY` (index.html) e publicar.
4. **Observar por alguns dias**, sem aplicar: em App Check → APIs, veja em Cloud Storage e Cloud Firestore se as solicitações aparecem quase todas como **verificadas**.
5. **Aplicar** (Enforce) no Cloud Storage e no Cloud Firestore. Para voltar atrás, é só desfazer a aplicação no mesmo lugar.

Quem usa bloqueador de rastreadores pode precisar liberar `www.google.com/recaptcha` para o site. Sem o token, o site mostra um aviso explicando isso, em vez de "acesso não liberado".

## Monitoramento de downloads

São duas camadas: uma no app, por conta, e outra no Google Cloud, pelo volume total.

### 1. Uso por conta (já funciona sozinho)

O app de cada conta soma, por dia, quantos arquivos do acervo baixou, quantos MB e quantas baterias abriu. Os números ficam no Firestore, na coleção `uso`, com um documento por conta e por dia.

- Para ver, entre com a conta de administração e abra **📁 Arquivo → 📊 Uso do acervo**. Aparecem os últimos 7 dias, da conta que mais baixou para a que menos baixou.
- Fica em vermelho, com ⚠️, a conta que num dia passar de **400 arquivos**, **80 MB** ou **40 baterias**. Os limites estão em `window.USO_LIMITE_ARQUIVOS`, `USO_LIMITE_MB` e `USO_LIMITE_BATERIAS`, no `index.html`.
- Uso normal: a primeira abertura num aparelho novo baixa uns 65 arquivos (cerca de 20 MB). As seguintes baixam poucos, porque o app guarda as cópias e só busca o que mudou.
- Cada conta só grava o próprio registro, e os números só podem aumentar. Só a administração vê as outras contas (`firestore.rules`).
- **Limite:** é um sinal, não uma trava. Quem copiar por fora do app não é contado aqui. Com o App Check aplicado, o Storage só atende o próprio site, o que dificulta esse caminho. Para o volume total, use a camada 2.

### 2. Alerta de volume no Google Cloud (fazer uma vez, no console)

Avisa por e-mail quando o Storage entrega muito mais dados do que o normal, venha de onde vier.

1. Abra https://console.cloud.google.com/monitoring/alerting e escolha o projeto **monstrinho-lab**.
2. Clique em **Create policy**.
3. Em **Select a metric**, procure **GCS Bucket → Sent bytes** (`storage.googleapis.com/network/sent_bytes_count`).
4. Em **Filter**, escolha `bucket_name = monstrinho-lab.firebasestorage.app`.
5. Em **Transform data**: *Rolling window* = **1 day**, *Rolling window function* = **sum**.
6. Em **Configure trigger** (Configurar gatilho de alerta): *Threshold*, "Alguma série temporal viola", "Acima do limite" e, em **Valor do limite**, **2000000000**. O campo é em bytes (B), e esse número dá 2 GB. Para começar, isso dá cerca de 100 aparelhos novos por dia. Ajuste depois de ver o gráfico de alguns dias.
7. Em **Notifications**, crie um canal de **Email** com o seu endereço.
8. Dê um nome, como "Salinha: download alto do acervo", e salve.

Se o projeto estiver no plano Blaze, também vale um **alerta de orçamento** em https://console.cloud.google.com/billing → *Budgets & alerts*, com um valor baixo (por exemplo, R$ 20 por mês), para ser avisado de qualquer gasto inesperado.

## Backup do Firestore (dados pessoais dos usuários)

O acervo oficial está seguro no GitHub. Os dados pessoais sincronizados (cadernos, progresso, conjuntos, grifos, comentários) só existem no Firestore e nos aparelhos. O backup agendado protege contra exclusão acidental ou um erro que apague dados. Requer o plano Blaze; o custo é de centavos, porque os dados são pequenos.

1. Abra https://console.cloud.google.com/firestore/databases/-default-/disaster-recovery?project=monstrinho-lab. Se não abrir: Google Cloud Console → projeto **monstrinho-lab** → **Firestore** → banco **(default)** → **Recuperação de desastres** (*Disaster recovery*).
2. Em **Backups**, clique em **Criar agendamento** (*Create schedule*): **Diário** (*Daily*), retenção de **14 dias**. Salve.
3. Opcional: em **Recuperação pontual** (*Point-in-time recovery*, PITR), clique em **Ativar**. Permite voltar o banco a qualquer minuto dos últimos 7 dias.

Para restaurar, o backup vira um **banco novo**, sem sobrescrever o atual: na lista de backups, **Restaurar** → dê um nome ao banco novo. Depois é preciso copiar de volta só o que se perdeu; peça ajuda numa sessão do Claude.

## Aviso por e-mail de pedidos de acesso

Um script do Google Apps Script, na **sua** conta (dona do projeto), confere a cada 10 minutos e manda um e-mail para você, com o link de cada conta no console. O e-mail traz:
- os **pedidos de acesso completo** (quem clicou em "Pedir acesso completo"): é o que pede ação sua;
- as **contas novas no acesso simples**, só para saber, porque elas já estão liberadas;
- pedidos antigos ainda pendentes, de antes dos níveis.

Cada item é avisado uma vez só. Não precisa de servidor, senha de e-mail nem plano pago.

Se você já instalou a versão anterior do script, troque o conteúdo de `Código.gs` pelo de `ferramentas/aviso-pedidos-acesso.gs` e salve. O manifesto e o acionador continuam os mesmos.

Instalação (uma vez, cerca de 5 minutos):

1. Abra https://script.google.com, com a mesma conta Google que é dona do projeto no Firebase, e clique em **Novo projeto**. Dê o nome "A Salinha — aviso de pedidos".
2. Apague o conteúdo de `Código.gs` e cole todo o conteúdo de `ferramentas/aviso-pedidos-acesso.gs`.
3. Clique na engrenagem ⚙️ (**Configurações do projeto**) e marque **Mostrar o arquivo de manifesto "appsscript.json" no editor**.
4. Volte ao **Editor** (`< >`), abra `appsscript.json`, apague o conteúdo e cole o de `ferramentas/aviso-pedidos-acesso.appsscript.json`. Salve (💾).
5. No topo, escolha a função **testarAviso** e clique em **Executar**. Na primeira vez, o Google pede autorização: **Revisar permissões** → sua conta → *Avançado* → *Acessar A Salinha — aviso de pedidos (não seguro)* → **Permitir**. O aviso de "não seguro" aparece porque o script é seu e não foi publicado; é normal. Deve chegar um e-mail de teste com os pedidos pendentes, ou "Nenhum pedido pendente".
6. Escolha a função **instalarAcionador** e clique em **Executar**. A partir daí, o script confere sozinho a cada 10 minutos.

- Cada pedido é avisado uma vez. Vários pedidos no mesmo intervalo vêm num e-mail só.
- Para parar: no script, menu **Acionadores** (⏰) → apague o acionador.
- Se o teste der erro "Firestore respondeu 403", confira se a conta do script é a dona do projeto **monstrinho-lab** e se o `appsscript.json` foi colado (o passo 4).

## Criar Esquema com IA (fase 1: só a administração)

Em **Esquemas**, o botão **✨ Criar com IA** (visível só para a conta admin) gera fichas com o Claude ou o Gemini:
- **Ficha individual:** um tema, com ou sem trecho do material.
- **A partir de um material:** a IA propõe o plano de fichas, você marca as que quer e ela gera em lotes de até 5.

Aceita texto colado ou arquivo `.md`, `.txt`, `.pdf` (com texto selecionável) ou `.docx`. A conversão é feita no navegador, com as bibliotecas em `vendor/`. O resultado segue pela importação em massa de sempre, com pré-visualização. Também dá para baixar o `.txt` de importação ou copiar o texto.

**Como funciona por dentro:**
- A função `criarEsquemaIA` (pasta `functions/`, Cloud Functions, região São Paulo) confere se a conta é admin, chama a IA e devolve as fichas.
- As chaves das IAs ficam no **Secret Manager** e nunca chegam ao navegador.
- Cada chamada registra o consumo (tokens) na coleção `usoIA` do Firestore, que só o servidor lê e grava.
- O prompt adapta as instruções da Fábrica de fichas (v4) e o padrão de citação; está em `functions/nucleo.js`.
- Modelos padrão: `claude-opus-5-5`, com esforço `medium`, e `gemini-3.8-flash`. Ficam em `functions/.env` (obrigatório na publicação automática); para trocar, edite `CLAUDE_MODELO=…`, `CLAUDE_ESFORCO=…` ou `GEMINI_MODELO=…`.
- **IA Simples com duas opções: Gemini 3.8 Flash e GPT-6 Luna.** O GPT usa a API de respostas da OpenAI (`chamarGPT` em `functions/nucleo.js`), com a chave no Secret Manager como `OPENAI_API_KEY` e o modelo em `GPT_MODELO` (`functions/.env`, hoje `gpt-6-luna`). Para desligar, troque `GPT_LIGADO = true` para `false` em `functions/index.js`; o app volta a mostrar "GPT-6 Luna (em breve)". Conta na mesma cota semanal da IA Simples. Preço de referência no painel de custo: US$ 0,10 / 0,50 por milhão de tokens (entrada/saída), em `_precos` (index.html).

**Para ativar (uma vez):**

1. **Chaves das IAs**
   - **Gemini:** https://aistudio.google.com/apikey → *Create API key*. Tem cota gratuita, boa para testes.
   - **Claude:** https://console.anthropic.com → *API Keys* → *Create Key*. A API é cobrada à parte da assinatura do Claude.ai: compre créditos em *Billing* (o mínimo basta para testar).
2. **Guardar as chaves no Secret Manager**
   - Abra https://console.cloud.google.com/security/secret-manager?project=monstrinho-lab. Se pedir, clique em **Ativar** (Secret Manager API).
   - **Create secret** com o nome exato `GEMINI_API_KEY` e a chave como valor.
   - Faça o mesmo com o nome exato `ANTHROPIC_API_KEY`.
   - Na janela, o seletor **IA: Simples / Plus** escolhe Gemini (Simples) ou Claude (Plus, mais detalhado e mais caro). Para desligar o Claude, mude `CLAUDE_LIGADO` para `false` em `functions/index.js`.
3. **Permissões da conta de serviço do GitHub** (a do segredo `FIREBASE_SERVICE_ACCOUNT`)
   - Em https://console.cloud.google.com/iam-admin/iam?project=monstrinho-lab, clique no lápis da conta de serviço usada pelo GitHub Actions.
   - Acrescente os papéis: **Cloud Functions Admin**, **Cloud Run Admin**, **Service Account User**, **Cloud Build Editor**, **Artifact Registry Administrator** e **Secret Manager Admin**.
4. **APIs:** em https://console.cloud.google.com/apis/library?project=monstrinho-lab, ative **Cloud Functions API**, **Cloud Run Admin API**, **Cloud Build API**, **Artifact Registry API** e **Eventarc API**, se ainda não estiverem ativas.
5. **Publicar:** o próximo push no `main` (ou *Actions → Publicar no Firebase → Run workflow*) publica a função na etapa **Funções → Firebase**.
   - Essa etapa não trava o site: se faltar algo, ela fica vermelha e o resto da publicação segue normal. O log mostra o que falta.

**Custos:** Cloud Functions tem cota gratuita mensal. A IA é paga por uso, em tokens de entrada (o material) e de saída (as fichas). O consumo de cada pedido aparece no rodapé da janela e fica registrado em `usoIA`. O material longo é relido a cada lote de 5 fichas, então gerar a partir de um material grande custa mais que a ficha individual.

**Teste sem gastar:** `cd functions && npm ci && node teste-nucleo.js` testa o prompt, a validação e o formato da requisição com respostas simuladas.

### Custo da IA: cache de entrada e registro de uso

**Planejamento sempre na ordem original** (desde 9/11/2026): no teste com o mesmo material, a ordem nova deu um plano de 21 fichas contra 36, e o plano não divide cache com os lotes (o formato de saída é outro). A chave abaixo vale só para os **lotes**.

**Ordem do pedido (GPT).** Com `ORDEM_PROMPT=cache` (padrão, em `functions/.env`), o pedido de cada lote ao GPT vai na ordem: instruções, formato, taxonomia, fonte, **material**, tarefa. O que se repete entre o plano e os lotes fica no começo, e a OpenAI cobra a parte repetida pelo preço de cache (US$ 0,01/milhão no gpt-6-luna, contra US$ 0,10). O conteúdo do pedido é o mesmo da ordem antiga; só a posição muda (e a tarefa diz "material acima"). Gemini e Claude seguem na ordem original.
- **Desligar:** `ORDEM_PROMPT=antiga` em `functions/.env` e publicar. O pedido volta a ser idêntico ao anterior, caractere por caractere.
- **Comparar sem republicar (administração):** no rodapé do "Criar Esquema com IA", "Teste de custo — ordem do pedido" força uma das duas ordens nos próximos pedidos.

**Reaproveitamento do planejamento (desde 9/11/2026).** Cada plano gerado fica guardado em `planosIA/{uid}_{chave}` (só o servidor lê e grava; guarda a lista de fichas e as observações, não o material) por 30 dias (`PLANO_VALIDADE_DIAS`). A chave (`chavePlano` em `nucleo.js`) é o SHA-256 de tudo o que influencia o plano: material, orientação, fonte, taxonomia, instruções, formato de saída, IA, modelo e esforço configurados, mais `VERSAO_PLANO` (aumentar para invalidar todos os planos guardados). O mesmo usuário pedindo o mesmo plano recebe o guardado, sem chamar a IA e sem custo; `usoIA` registra `status: "reaproveitado"` com zero tokens. No app aparece "♻️ Plano reaproveitado" e o botão "Planejar de novo" (`replanejar`), que chama a IA e substitui o plano guardado.

**Registro em `usoIA`** (um documento por chamada cobrada). Campos novos, somados aos antigos: `cacheEntrada` (tokens de entrada lidos do cache; já incluídos em `entrada`), `cacheEscrita` (tokens gravados no cache, cobrados a 1,25 × a entrada; também incluídos em `entrada` — lidos, gravados e o restante são partes separadas e somam `entrada`), `formatoEntrada` (`texto` ou `dois-blocos`), `impressoes` (SHA-256 de cada parte do pedido: instruções, formato, taxonomia, cabeçalho, material, tarefa e a entrada inteira — mostram o que mudou entre dois lotes), `comparacao` e `diagnosticoCache` (ver abaixo), `raciocinio` (tokens de raciocínio; já incluídos em `saida`), `detalhesUso` (os detalhes de uso devolvidos pelo provedor), `respostaId`, `execucao` (liga o plano aos lotes dele, ou identifica a ficha individual), `lote` (0 = plano), `ordemPrompt`, `fichasPedidas`, `status` (`ok` ou `erro`) e `erro`. Chamadas que a IA respondeu, mas falharam depois (resposta cortada, recusa, JSON inválido), agora também são registradas, com `status: erro`. Recusas antes da resposta (chave inválida, sem crédito) não são cobradas e não são registradas. Os documentos antigos continuam como estão.

**Diagnóstico do cache (administração).** Nos lotes 2 em diante, o app envia o id da resposta do lote anterior (`prompt_cache_options.comparison_response_id`), e o servidor grava em `diagnosticoCache` o `prompt_cache_diagnostics` devolvido pela OpenAI. Se a API recusar o parâmetro (erro 400, nada cobrado), o pedido é repetido sem ele e `diagnosticoCache` registra `indisponivel` com a mensagem da API. O teste "lotes em dois blocos" (seletor do rodapé) manda a parte estável (taxonomia, fonte, material) e a tarefa como duas mensagens, para verificar se o cache passa a ser lido; o plano continua na ordem original.

**Cache explícito (padrão desde 9/11/2026, aprovado no teste real).** Nos lotes de uma execução com mais de um lote, a entrada vai em duas mensagens, e a parte estável (taxonomia, fonte, material) leva `prompt_cache_breakpoint: { mode: "explicit" }`; o pedido leva `prompt_cache_options: { mode: "explicit", ttl: "30m" }`. O lote 1 grava o prefixo; os seguintes o leem (no teste: 88.478 tokens lidos por lote, diagnóstico `cache_hit`). Nas chamadas sem reaproveitamento (plano, ficha individual, execução de lote único), `prompt_cache_options: { mode: "explicit" }` sem ponto de corte: o texto é o mesmo de antes e não há gravação de cache (antes, cada uma gravava ~88 mil tokens a 1,25 × sem uso). Em `usoIA`, `cacheModo` é `explicit`, `sem-gravacao`, `implicito` ou `recusado` (a API recusou: o pedido é repetido sem as opções e sem o ponto de corte). A comparação diagnóstica (`comparison_response_id`) é só da administração.
- **Desligar para todos:** `CACHE_EXPLICITO=nao` em `functions/.env` e publicar (volta ao cache implícito anterior).
- **Comparar (administração):** no rodapé, "sem cache explícito (comportamento anterior)" ou os testes de ordem anteriores.

**Custo estimado na tela** (agora com a gravação no cache a US$ 0,125/milhão): a entrada lida do cache sai pelo preço de cache; o rodapé mostra quantos tokens vieram do cache e quantos foram de raciocínio.

## Proteção do acervo na publicação

**Checagem automática** (`ferramentas/checar_acervo.py`, primeiro passo de `.github/workflows/firebase.yml`): antes de enviar qualquer coisa ao Firebase, compara Jurisprudência, Esquemas, Glossário e Flashcards com a versão anterior ao envio e **para a publicação** quando:
- um arquivo do manifesto não existe ou não está no formato `{"Disciplina > Divisão": [itens com id]}`;
- um arquivo traz itens de mais de uma disciplina, ou de outra disciplina que não a de antes (ex.: o arquivo de Direito Penal com as fichas de Processo Penal, como em 9/11/2026);
- ids passam a se repetir (cópia de itens ou de um arquivo sobre outro); repetidos que já existiam só geram aviso;
- uma disciplina perde mais de 10 itens **e** mais de 10% do que tinha, ou um arquivo sai do manifesto.

O relatório aparece no resumo da execução no GitHub (Actions → "Publicar no Firebase"). Redução intencional (ex.: limpeza de repetidos): escrever `[reducao-intencional]` na mensagem do commit; a perda vira aviso, as outras regras continuam valendo. Testar à mão: `python3 -I ferramentas/checar_acervo.py --base HEAD`.

**Aviso de ocultos na exportação:** nas exportações em JSON de Jurisprudência e Esquemas (Tudo, Tudo por disciplina, Disciplina, Tópico), se houver itens ocultos no recorte, o app avisa que eles não entram no arquivo e seriam apagados do acervo se o arquivo for usado para atualizá-lo.

## Atualização de fichas (versionamento do acervo)

Quando uma ficha de **esquema** ou uma **questão** for corrigida por mudança de lei ou de entendimento, acrescente ao objeto (no JSON de `dados/esquemas/` ou de `dados/bateriasvf/`) o campo `atualizacoes`, da mais recente para a mais antiga:

```json
"atualizacoes": [
  { "data": "2026-10-20", "motivo": "lei", "texto": "a jornada passou de 44 para 40 horas semanais", "ref": "EC 141/2026" }
]
```

- `motivo`: `lei` ("Houve modificação na legislação"), `jurisprudencia` ("O entendimento anterior foi superado") ou `correcao` ("Correção do conteúdo").
- **Esquema:** aparece a faixa "🔄 Esta ficha foi atualizada em …" com o motivo e o histórico. O botão **Ok** some com a faixa para aquele usuário, até a próxima atualização.
- **Questão:** o sinal 🔄 só aparece **depois que a questão é respondida** (antes, não antecipa nada): ao lado do número, no enunciado (passar o mouse ou clicar mostra em que consistiu a mudança), e discreto no canto do número na grade da bateria, com o motivo ao passar o mouse. Assim, nas baterias já feitas, dá para ver quais questões merecem atenção. Vale também para baterias feitas **antes** da atualização (cuja cópia salva no aparelho não tem o campo): no deploy, `ferramentas/indice_atualizacoes.py` gera `dados/bateriasvf/atualizacoes.json` ({id: atualizacoes}, fora do git), e o app consulta essa lista pelo id da questão.
- Questões já salvas em cadernos são cópias: só as cópias feitas depois da atualização carregam o sinal.

**Onde procurar o que atualizar:** `NODE_PATH=$(npm root -g) node ferramentas/revisao_acervo.js` cruza as novidades de `dados/leiseca/novidades.json` com as citações das questões e dos esquemas e gera `relatorios/revisao-acervo.md`: primeiro os itens que citam o próprio dispositivo alterado (com o trecho), depois os que citam só o número do artigo. Item corrigido e marcado com `atualizacoes` (com `ref` igual à norma) sai da lista na execução seguinte; item conferido e já correto vai para `ferramentas/revisao_acervo_conferidos.json`, para não voltar. A ferramenta só acha citações explícitas; vale também uma busca pelo conteúdo (ex.: "44 horas").

## Importação em massa sem matéria aberta (Glossário, Esquemas, Jurisprudência)

A matéria de cada `### L2:` vem da taxonomia (`resolverDivisoesImportacao`), então não é preciso abrir a matéria antes de importar, e um mesmo texto pode trazer divisões de várias matérias. Hoje só um nome de L2 existe em duas matérias: "Sujeitos do Processo" (Processual Civil e Penal). Ele usa a matéria aberta quando ela é uma das duas; sem isso, a prévia recusa o bloco e pede a forma completa `### L2: Matéria > Divisão`, que vale para qualquer divisão. Nome inexistente continua recusado na prévia.

## Esquemas: grifos, comentário pessoal e revisão ativa

**Ocultar Todas as Oficiais.** Caixa ao lado de "🏷️ Aplicar Classificação de Prioridade do Sistema": esconde os esquemas oficiais de toda a seção (grade, contagens da barra lateral, abas Crítico/Importante/Regular e Leitor), deixando só os esquemas próprios. É preferência de visualização, gravada neste aparelho (`localStorage`, chave `tjpe_v1__esq_ocultar_todas_oficiais`); as exportações não mudam.

**Grifos e 💭 comentário (acesso completo).** Os grifos usam as mesmas canetas da Jurisprudência ("🖍 Grifar:" amarelo, verde, rosa e borracha): escolhe-se a cor e depois se seleciona o trecho. Ficam no Leitor (barra de cima) e na janela do esquema, à direita de "Cor de fundo da célula"; num esquema oficial (somente leitura) a barra mostra só as canetas, e o grifo é pessoal: `grifos {id → {faixas:[{ini,fim,cor}], atualizadoEm}}` na camada `esquemas_runtime`, faixas pelo texto corrido do esquema. Num esquema próprio, aberto para edição, a caneta marca o próprio texto (substitui o antigo marca-texto 🖍️ da barra) e não tem trava de nível. O comentário fica em `comentarios {id → {texto, atualizadoEm}}`, logo abaixo do texto na janela do esquema ("💭 Comentar"). Na nuvem vence o `atualizadoEm` mais recente; comentário apagado vira `texto: ''`. No intermediário, as canetas dos esquemas oficiais e o botão de comentar aparecem com 🔒. Na grade, o 💭 só aparece no card que tem comentário (mesmo estilo do indicador da Jurisprudência) e abre o comentário. Esquema com atualização registrada (`atualizacoes`) mostra 🔄 ao lado de 🔴🟡🟢 na grade e na lista do Leitor.

**Revisão ativa no Leitor (todos os níveis com acesso a Esquemas).** O botão "🙈 Esconder respostas" desfoca todas as colunas das tabelas menos a primeira. Clicar numa célula revela só ela; "Revelar tudo" mostra o cartão inteiro. O modo continua ligado ao trocar de cartão, e cada cartão novo começa escondido.

## Jurisprudência: aba "🆕 Divergências e Mudanças"

A aba reúne as fichas oficiais com o campo `mudanca`, mais recentes primeiro:

- 🔄 **Mudança de entendimento**: a ficha registra o entendimento novo.
- ⚖️ **Divergência viva**: Turmas ou Tribunais decidem de modo diferente, sem uniformização.
- ✅ **Divergência resolvida**: Seção, Corte Especial ou Plenário uniformizou.
- ⛔ **Superado / cancelado**: súmula ou tese que não vale mais (por lei, EC ou novo precedente). A ficha também ganha o selo na grade.

A curadoria fica em `ferramentas/curadoria_mudancas_jur.py` (id da ficha, tipo, resumo de uma linha, data da mudança e fichas ligadas em "Ver também"). Para incluir ou tirar uma ficha, edite a lista e rode `python3 ferramentas/curadoria_mudancas_jur.py`. Súmulas que só a doutrina considera superadas ficam de fora.

A mesma curadoria alimenta os **Esquemas**: quando um esquema cita uma súmula ou tese marcada como superada, cancelada ou em divergência viva, aparece um selo logo depois da citação (⛔ Cancelada, ⛔ Superado por lei, ⚖️ Divergência…), e o tooltip da citação mostra o motivo. Só vale quando o tribunal está identificado na citação (ex.: "Súmula 212/STJ"); "Súmula 212" solta não ganha selo, porque pode ser de outro tribunal.

## Jurisprudência: Leitor autônomo

Sem matéria, atalho ou seleção na barra lateral, o botão "📖 Leitor" abre o
Leitor direto (`abrirLeitorAutonomo`), com o painel de filtros aberto e o
baralho vazio ("Escolha os filtros para montar a sua leitura"). Com matéria
aberta, o menu do Leitor continua igual e ganha a opção "🧭 Montar leitura
por filtros".

- Filtro "Tópico" no modo Tribunal: aparece depois de escolher a(s)
  disciplina(s) e lista só os tópicos delas; tirar a disciplina tira os
  tópicos dela. "Ler tópico" pela barra lateral já abre com o tópico marcado.
- Atalhos (no painel e no estado inicial): 📰 Informativos mais recentes (o
  mais recente de cada tribunal, sem edições extraordinárias), 🔴 Críticas não
  visualizadas e 🆕 Divergências e Mudanças (fichas com `mudanca`).
- O último filtro aplicado (ou atalho usado no Leitor autônomo) fica salvo no
  aparelho (`tjpe_v1__jur_leitor_ultimo_filtro`) e a próxima abertura do
  Leitor autônomo já começa com ele. Se não sobrar ficha, abre vazio com os
  filtros preenchidos.

## Divulgar: imagens para Instagram e X (administração)

`window.DIVULGAR` (index.html). Nas baterias, cada questão de Verdadeiro ou
Falso tem o botão 📤, visível só para a administração. Ele gera um
carrossel em PNG, desenhado em `<canvas>` sem bibliotecas:

- primeiro a questão, com as opções V/F; depois o gabarito (selo verde ou
  vermelho), a explicação e a caixa "Para não esquecer" (axioma);
- texto longo continua na imagem seguinte ("A questão continua →", "A
  explicação continua →"), com a numeração 1/N; sem linha órfã nem título
  sozinho no pé; o cabeçalho da tabela se repete; acima de 4 imagens a
  prévia sugere encurtar;
- markdown das explicações nas mesmas regras de `mdExplicacao`: negrito,
  itálico, listas (- e 1.), citação (> ), tabela e título (#);
- sempre gera as duas versões (pedido explícito do usuário): Instagram
  (carrossel 4:5, dica "Arraste →") e X (fio, um post por imagem, dica
  "no próximo post ↓"; 4:5 por padrão ou 16:9); Stories (9:16) opcional.
  Abas na prévia para ver cada versão; "Baixar tudo" gera um .zip com
  `instagram/` (imagens + legenda.txt) e `x/` (imagens + fio.txt, um texto
  de até 280 caracteres por post); tema claro ou escuro. Formato do X, tema
  e Stories ficam lembrados no aparelho (`tjpe_v1__divulgar_prefs`);
- o texto pode ser editado na prévia sem mudar o acervo; baixa cada PNG ou
  todos num .zip (`downloadZipArquivos` aceita bytes); legenda sugerida
  para copiar.

Botão 📤 também nos cards da grade de Jurisprudência e de Esquemas (ao lado da
classificação), via `abrirJulgadoPorId`/`abrirEsquemaPorId`.

Julgados (`DIVULGAR.abrirJulgado`): botão "📤 Divulgar" no Leitor da
Jurisprudência, só para a administração e só em fichas oficiais. Primeira
imagem: faixa com tribunal e informativo, selos de sistemática/tema e de
mudança de entendimento, título, processo · órgão · relator · data e a tese;
depois, opcional, "Entenda o caso" com a caixa do que mudou (`mudanca`) e o
resumo. Tese ou resumo longos continuam na imagem seguinte.

Esquemas (`DIVULGAR.abrirEsquema`): botão "📤 Divulgar" no rodapé do Leitor
de Esquemas (administração, só oficiais). O HTML do esquema vira markdown
editável na prévia (`_htmlParaMd`: tabelas, citações, listas, títulos; a
linha "Subtema/Tipo/Ref." sai à parte, abaixo do título). Tabelas de 3 ou
mais colunas viram, por padrão, um bloco por linha (1ª célula como título,
demais como "Coluna: texto"), mais legível no celular; dá para voltar à
tabela na prévia. Um bloco só se parte entre imagens se a sobra for grande;
linha de tabela mais alta que a imagem é partida em pedaços.

## Domínio próprio (www.asalinha.com.br)

1. **Firebase → Hosting → Adicionar domínio personalizado:**
   - `www.asalinha.com.br`;
   - `asalinha.com.br`, com a opção de **redirecionar** para `www.asalinha.com.br`.
2. **DNS** (Registro.br ou o provedor do domínio): crie os registros que o Firebase mostrar (TXT de verificação e A/CNAME). **Não apague** registros existentes, como os de e-mail (MX). O certificado HTTPS sai em minutos, podendo levar até 24 h.
3. **Authentication → Configurações → Domínios autorizados:** adicione `www.asalinha.com.br` e `asalinha.com.br`.
4. **Configurações do projeto → Geral → Nome voltado ao público:** `A Salinha`.
5. **CORS do Storage, com o `cors.json` novo:**
   ```
   gcloud storage buckets update gs://monstrinho-lab.firebasestorage.app --cors-file=cors.json
   ```

**Só depois** de `https://www.asalinha.com.br` abrir com o cadeado de HTTPS, publique o código no `main`. A partir daí, `monstrinho-lab.web.app` passa a redirecionar para o domínio.

Se você usou o `monstrinho-lab.web.app` antes, faça lá **📁 Arquivo → 📤 Backup** antes de publicar. Os dados de lá não aparecem no domínio novo, e depois do redirecionamento o endereço antigo não abre mais.

## Levar os dados do GitHub Pages para o site

1. No endereço antigo, **📁 Arquivo → 📤 Backup**.
2. Em `www.asalinha.com.br`, **Entrar com Google** e depois **📁 Arquivo → 📥 Merge (mantém local)**, escolhendo o arquivo.

Use sempre **Merge**, nunca "Restaurar". Depois do Merge, a página recarrega e a sincronização envia os dados para a nuvem sozinha.

## Sincronização automática

Os dados pessoais vão para o Firestore sozinhos, sem botão. A pessoa abre o site em qualquer aparelho, entra com Google e encontra tudo como deixou. O código é o bloco `SALINHA_SYNC`, no `index.html`.

**O que sincroniza:**
- as chaves de `SALINHA_BACKUP.STORAGE_KEYS` (as mesmas do 📤 Backup) e o banco factual;
- **não** sincroniza a tela aberta (`salinha_active_module`, `cordeiro_view_ativa`), que é de cada aparelho;
- do acervo de provas, só as baterias pessoais. As oficiais se refazem a cada abertura.

**No Firestore:**
```
usuarios/{uid}/dados/{chave}                   versao, partes, valor, tamanho, hash, dispositivo, atualizadoEm
usuarios/{uid}/dados/{chave}/partes/{versao}_{n}   dados (bytes, até 900 KB)
```
- Chaves de até 900 KB ficam inteiras no campo `valor`, com `partes: 0`.
- **Chaves maiores:**
  - as partes da versão nova são gravadas primeiro;
  - só depois o documento da chave passa a apontar para ela (`partes: n`, `valor: null`);
  - as partes antigas são apagadas em seguida.
- Quem lê segue sempre a versão apontada, então nunca mistura partes de gerações diferentes.

**Quando envia:**
- 3 s depois da última mudança (10 s para a sessão ativa, gravada a cada resposta);
- na hora, quando a página é escondida ou fechada;
- nunca reenvia o que já está igual na nuvem.

**Sem conexão:** as mudanças ficam na fila do Firestore (persistência offline) e saem quando a rede volta.

**Indicador no topo:** ✓ Sincronizado / ⏳ Sincronizando / ⚠ Sem conexão — será enviado depois.

**Ao entrar:** o navegador guarda de quem são os dados locais (`tjpe_v1__sync_uid`).

| Situação | O que acontece |
|---|---|
| Dados locais sem dono (de antes desta versão, ex.: Merge do backup do Monstrinho) | Ficam com a primeira conta que entrar |
| Nuvem vazia e dados no aparelho | Sobem |
| Nuvem com dados e aparelho vazio | Baixam, e a página recarrega uma vez |
| Dados dos dois lados | Mesclados com a mesma regra do 📥 Merge (`aplicarPayloadMerge`), sem descartar nada local; o resultado sobe e a página recarrega uma vez |
| Dados locais de outra conta | São apagados do aparelho antes de baixar os da conta atual |

"Aparelho vazio" quer dizer que ele só tem o que o app grava sozinho ao abrir: estruturas vazias, sessão sem baterias abertas e acervo só com as oficiais.

**Mudança vinda de outro aparelho:** chega em tempo real.
- Se este aparelho não tinha mudança pendente naquela chave, a versão da nuvem substitui a local.
- Se tinha, as duas são mescladas com a regra do 📥 Merge e o resultado sobe.
- **Jurisprudência, Esquemas, Glossário, Prazos, Penas e Lei Seca** se atualizam na tela, sem recarregar a página, mesmo com o modal aberto. Os cards oficiais continuam na tela.
- **Nas demais áreas** (baterias, histórico, cronograma, flashcards, caderno), e também quando você está digitando num campo, a página recarrega sozinha se nenhum modal estiver aberto. Com modal aberto, aparece um balão por cima de tudo, "Seus dados foram atualizados em outro aparelho", com o botão **Recarregar agora**. Se ninguém clicar, a página recarrega quando o modal for fechado.
- Há uma trava de no máximo 3 recargas automáticas por minuto.
- **Abas do mesmo navegador** (inclusive várias janelas anônimas abertas ao mesmo tempo) dividem o armazenamento e contam como um só aparelho. Quando uma delas muda um dado, avisa as outras (`BroadcastChannel`), que recarregam do mesmo jeito: na hora, ou com o balão se houver modal aberto.

**Envio confirmado:** uma chave só conta como sincronizada depois que a nuvem aceita a gravação. Se a página recarregar ou fechar antes disso, a próxima abertura reenvia. O 📥 Merge espera o envio terminar antes de recarregar.

**Ao sair:** o que estiver pendente é enviado, e os dados pessoais saem deste aparelho, porque estão na nuvem. Se algo ainda não tiver a confirmação da nuvem (por exemplo, sem conexão), o app pergunta antes de sair.

**Regras (`firestore.rules`):** só o próprio usuário, com `acessos/{e-mail}.ativo == true`, lê e grava em `usuarios/{uid}/dados/{chave}`. Os limites são:
- nome da chave `tjpe_v1__…`;
- campos fixos;
- `valor` com até 1.000.000 caracteres;
- partes com até 950 KB.

Nada fora desses caminhos é aceito.

## Testar no localhost (`?lab=1`)

`http://localhost:8812/index.html?lab=1` liga o login Google e a sincronização com o Firestore **real** do projeto, mas lê `dados/` do próprio servidor local, porque o CORS do Storage não aceita localhost. O acesso é conferido direto em `acessos/{e-mail}`.

1. Na pasta do repositório: `python -m http.server 8812`.
2. Use contas Google liberadas em `acessos`. Para o cenário h, use uma conta sem liberação.
3. Para cada navegador "limpo", use uma janela anônima ou outro perfil do navegador.

Os dados de teste ficam em `usuarios/{uid}` no Firestore de produção. Depois de testar, apague-os no console, se quiser.

| # | Cenário | O que fazer | O que conferir no console do Firestore |
|---|---|---|---|
| a | Login | Abra a página, veja a faixa "Entre com Google…" e o app aberto por baixo. Clique em **Entrar com Google**. | A faixa some, o nome aparece no topo e o acervo carrega. O indicador fica ✓. Ainda nada em `usuarios`, se o navegador não tinha dados. |
| b | Primeira sincronização com dados locais (sobe) | Num navegador com dados (ex.: depois do 📥 Merge de um backup), entre com Google. | Em `usuarios/{uid}/dados` aparecem as chaves com dados (ex.: `tjpe_v1__leiseca_runtime`), com `partes: 0` e `valor` preenchido, ou `partes > 0` nas grandes. |
| c | Navegador limpo (baixa) | Em janela anônima, entre com a mesma conta. | A página recarrega uma vez e mostra os mesmos dados. No console, nenhum `atualizadoEm` muda (o navegador novo não regrava nada). |
| d | Dois navegadores ao mesmo tempo | Use uma janela normal e uma anônima (duas anônimas são o mesmo navegador; aí o teste é de abas). Com a Jurisprudência aberta nas duas, marque um semáforo numa delas. | Uns 3 s depois, a chave ganha `versao` e `dispositivo` novos. Na outra janela, o semáforo muda sozinho, sem recarregar. Em áreas sem atualização na tela (ex.: baterias), a página recarrega, ou aparece o balão se houver modal aberto. Esperando 10 s, nada mais muda (sem eco nem laço). |
| e | Offline e volta | DevTools → Network → Offline. Faça uma mudança e veja "⚠ Sem conexão". Volte para Online. | Enquanto offline, a `versao` não muda. Ao voltar, o indicador vai para ✓ e a `versao` avança. |
| f | Chave grande (partes) | Crie esquemas pessoais grandes (somando mais de 900 KB). | `tjpe_v1__esquemas_runtime` com `partes: n` e `valor: null`. A subcoleção `partes` tem exatamente n documentos `{versao}_{1..n}`, todos com a mesma `versao`. |
| g | Sair e entrar com outra conta | Clique em ✕ (sair) e entre com outra conta liberada. | Depois de sair, os dados pessoais somem deste navegador. A outra conta não recebe nada da primeira: `usuarios/{uid2}` fica vazio ou só com os dados dela. |
| h | Conta sem acesso liberado | Entre com uma conta que não está em `acessos`. | Aparece a faixa "Pedido de acesso registrado para…", sem tela cheia, e as seções pedem login. Surge `acessos/{e-mail}` com `ativo: false`. Nada é criado em `usuarios`. |

Para liberar alguém, mude `ativo` para `true` e peça para a pessoa clicar em **Verificar de novo**.
