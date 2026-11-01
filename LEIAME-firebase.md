# A Salinha no Firebase (laboratório protegido)

Projeto `monstrinho-lab` · site `https://www.asalinha.com.br` · bucket `gs://monstrinho-lab.firebasestorage.app`

O nome exposto passou a ser **A Salinha**. Os nomes internos (projeto, repositório, chaves `tjpe_v1__`, logo `monstrinho.png`) não mudaram.

## Como funciona

- **Hosting** publica só o app (`index.html`, `dashboard.html`, `taxonomia.js`, imagens). A pasta `dados/` **não** vai para o Hosting.
- **Storage** guarda o acervo em `dados/` (sem `dados/materiais/pdfs`, que o app não usa).
- **`storage.rules`** só entrega o acervo a quem:
  - entrou com Google, com e-mail verificado;
  - tem o documento `acessos/{e-mail}` no Firestore, com `ativo: true`.
- **No `index.html`**, o bloco "PORTÃO DE ACESSO", no topo do `<head>`, faz duas coisas:
  - mostra a tela "Entrar com Google";
  - troca cada leitura de `dados/…` por uma leitura no Storage com o token do usuário.
- **Endereço único:** o portão só roda em `www.asalinha.com.br`. Os endereços `monstrinho-lab.web.app`, `monstrinho-lab.firebaseapp.com` e `asalinha.com.br` redirecionam para ele. Cada endereço tem o seu armazenamento no navegador, por isso só um pode valer.
- **Fora do Firebase**, o portão não roda: no `localhost` e no GitHub Pages tudo funciona como antes.
- **No site, o login Google basta para abrir as seções.** O login do GitHub fica só para o backup no Gist.
- **Sincronização:** a do Gist continua igual. A troca pelo Firestore é uma etapa futura.

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

5. **Atualizar o Worker do Cloudflare**, para o login do Gist funcionar no endereço novo:
   - Abra Cloudflare → Workers → o Worker do Monstrinho → Edit code.
   - Cole o conteúdo de `cloudflare-worker/worker.js` e clique em Deploy.
   - Em Settings → Variables, mude `ALLOWED_ORIGIN` para:
     `https://felipescp.github.io,https://monstrinho-lab.web.app`

6. **Nome na tela do Google.** Em Configurações do projeto → Geral → "Nome voltado ao público", troque `project-1031537511970` por `Monstrinho`.

7. **Testar.** Abra `https://monstrinho-lab.web.app`, clique em Entrar com Google e confira se o app abre com o acervo.

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

A partir daí, cada push no `main` faz duas coisas:
- envia ao Storage o que mudou em `dados/`;
- publica o app e as regras.

O resultado aparece na aba Actions. Para desligar, mude `FIREBASE_DEPLOY` para qualquer outro valor.

## Depois que o site no Firebase estiver funcionando

- Deixe o repositório **privado**: GitHub → Settings → General → Danger Zone → Change visibility.
- O GitHub Pages sai do ar.
- Tire `https://felipescp.github.io` do `ALLOWED_ORIGIN` do Worker.

## Liberar outra pessoa

Não é preciso pedir o e-mail a ninguém:

1. A pessoa abre `www.asalinha.com.br` e clica em **Entrar com Google**.
2. Sem acesso liberado, o portão cria sozinho `acessos/{e-mail}` com `ativo: false` e mostra "Pedido de acesso registrado".
3. No console do Firebase, em **Firestore Database → acessos**, os pedidos pendentes são os documentos com `ativo: false`. Para liberar, mude o campo para `true`.

Para bloquear alguém, mude para `false`. Se o documento for apagado, a pessoa volta a gerar um pedido na próxima entrada.

O usuário só consegue criar o próprio documento, e sempre com `ativo: false`: liberar, alterar ou apagar continua restrito ao console (ver `firestore.rules`).

No futuro, esse documento passa a ser gravado pela Cloud Function de pagamento.

## Domínio próprio (www.asalinha.com.br)

1. **Firebase → Hosting → Adicionar domínio personalizado:**
   - `www.asalinha.com.br`;
   - `asalinha.com.br`, com a opção de **redirecionar** para `www.asalinha.com.br`.
2. **DNS** (Registro.br ou o provedor do domínio): crie os registros que o Firebase mostrar (TXT de verificação e A/CNAME). **Não apague** registros existentes, como os de e-mail (MX). O certificado HTTPS sai em minutos, podendo levar até 24 h.
3. **Authentication → Configurações → Domínios autorizados:** adicione `www.asalinha.com.br` e `asalinha.com.br`.
4. **Configurações do projeto → Geral → Nome voltado ao público:** `A Salinha`.
5. **Worker do Cloudflare → Settings → Variables → `ALLOWED_ORIGIN`:**
   `https://felipescp.github.io,https://monstrinho-lab.web.app,https://www.asalinha.com.br`
6. **CORS do Storage, com o `cors.json` novo:**
   ```
   gcloud storage buckets update gs://monstrinho-lab.firebasestorage.app --cors-file=cors.json
   ```

**Só depois** de `https://www.asalinha.com.br` abrir com o cadeado de HTTPS, publique o código no `main`. A partir daí, `monstrinho-lab.web.app` passa a redirecionar para o domínio.

Se você usou o `monstrinho-lab.web.app` antes, faça lá **📁 Arquivo → 📤 Backup** antes de publicar. Os dados de lá não aparecem no domínio novo, e depois do redirecionamento o endereço antigo não abre mais.

## Levar os dados do GitHub Pages para o site

1. No endereço antigo, **📁 Arquivo → 📤 Backup**.
2. Em `www.asalinha.com.br`, **Entrar com Google** e depois **📁 Arquivo → 📥 Merge (mantém local)**, escolhendo o arquivo.

Use sempre **Merge**, nunca "Restaurar".
