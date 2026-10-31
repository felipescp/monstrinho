# Monstrinho no Firebase (laboratório protegido)

Projeto `monstrinho-lab` · site `https://monstrinho-lab.web.app` · bucket `gs://monstrinho-lab.firebasestorage.app`

## Como funciona

- **Hosting** publica só o app (`index.html`, `dashboard.html`, `taxonomia.js`, imagens). A pasta `dados/` **não** vai para o Hosting.
- **Storage** guarda o acervo em `dados/` (sem `dados/materiais/pdfs`, que o app não usa).
- **`storage.rules`** só entrega o acervo a quem:
  - entrou com Google, com e-mail verificado;
  - tem o documento `acessos/{e-mail}` no Firestore, com `ativo: true`.
- **No `index.html`**, o bloco "PORTÃO DE ACESSO", no topo do `<head>`, faz duas coisas:
  - mostra a tela "Entrar com Google";
  - troca cada leitura de `dados/…` por uma leitura no Storage com o token do usuário.
- **Fora do Firebase**, o portão não roda: no `localhost` e no GitHub Pages tudo funciona como antes.
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

Crie `acessos/{e-mail-da-pessoa}` com `ativo: true`. Para bloquear, mude para `false` ou apague o documento.

No futuro, esse documento passa a ser gravado pela Cloud Function de pagamento.
