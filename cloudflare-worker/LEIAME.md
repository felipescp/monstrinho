# Login com GitHub (Device Flow) — passos de configuração

O código (Worker + front-end) já está pronto e testado. Faltam só os passos
que precisam da sua conta — ninguém mais consegue fazer isso por você.
Enquanto não forem feitos, o botão "🔑 Entrar com GitHub" mostra um aviso
("ainda não foi configurado") e não quebra nada — o botão ⚙️ (token colado
à mão) continua funcionando exatamente como sempre, para os 3 usuários
atuais, durante e depois dessa configuração.

## Passo 1 — Registrar o GitHub OAuth App (~5 min)

1. Acesse **github.com → foto de perfil → Settings → Developer settings →
   OAuth Apps → New OAuth App**.
2. Preencha:
   - **Application name**: `Monstrinho` (ou o nome que preferir)
   - **Homepage URL**: a URL onde o Monstrinho está publicado (ex.:
     `https://felipescp.github.io/monstrinho`)
   - **Authorization callback URL**: pode ser a mesma URL acima — o Device
     Flow não usa redirect, mas o GitHub exige preencher o campo.
3. Clique em **Register application**.
4. Na página do app recém-criado, copie o **Client ID** (não é segredo,
   pode ficar visível no código do site sem problema).
5. Role até **Device Flow** e marque **Enable Device Flow**. Salve.
6. **Não precisa gerar Client Secret** — o Device Flow não usa.

## Passo 2 — Publicar o Worker na Cloudflare (~10 min)

1. Crie uma conta gratuita em **dash.cloudflare.com** (se ainda não tiver).
2. No painel, vá em **Workers & Pages → Create → Create Worker**.
3. Dê um nome (ex.: `monstrinho-oauth`) e clique em **Deploy** (cria um
   Worker vazio primeiro, você edita o código depois).
4. Clique em **Edit code** e substitua todo o conteúdo pelo arquivo
   `cloudflare-worker/worker.js` deste repositório (copiar e colar).
5. Clique em **Deploy** de novo, agora com o código certo.
6. Volte pra tela do Worker → **Settings → Variables and Secrets** → **Add
   variable** (duas vezes):
   - `GITHUB_CLIENT_ID` = o Client ID copiado no Passo 1
   - `ALLOWED_ORIGIN` = a URL exata onde o Monstrinho roda (ex.:
     `https://felipescp.github.io`) — sem barra no final
7. Salve. A URL do seu Worker aparece no topo da página, algo como:
   `https://monstrinho-oauth.SEU-SUBDOMINIO.workers.dev`

## Passo 3 — Ligar o front-end no Worker (1 linha)

Em `index.html`, procure por `window.SALINHA_GITHUB_OAUTH` e preencha:

```js
WORKER_URL: 'https://monstrinho-oauth.SEU-SUBDOMINIO.workers.dev',
```

(cole a URL exata do Passo 2, sem barra no final). Depois disso o botão
"🔑 Entrar com GitHub" já funciona pra qualquer pessoa que abrir o site —
sem precisar mexer em mais nada por usuário.

## Testando

1. Clique em "🔑 Entrar com GitHub".
2. Aparece um código e um link — abra o link (pode ser em outra aba/outro
   dispositivo), cole o código, clique em **Authorize**.
3. O Monstrinho detecta sozinho em alguns segundos e fecha o popup.
4. Clique em "☁️⬆️ Salvar" pra confirmar que criou um Gist na SUA conta
   (github.com/seu-usuario → aba Gists).

## Migração dos 3 usuários atuais (quando quiserem trocar)

Não é obrigatório — quem quiser continuar com o token manual (⚙️) pode.
Para quem quiser migrar para o próprio login:

1. **Antes de trocar**: menu **📁 Arquivo → 📤 Backup** (salva um `.json`
   local com tudo).
2. Clicar em "🔑 Entrar com GitHub" e autorizar com a conta PRÓPRIA da
   pessoa (não a sua).
3. Importar o `.json` salvo no passo 1: **📁 Arquivo → 📥 Restaurar** (ou
   **Merge**, se preferir mesclar em vez de substituir).
4. Clicar em "☁️⬆️ Salvar" — cria um Gist novo, na conta da própria pessoa,
   já com os dados restaurados.
