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
- **Fora do Firebase**, o portão não roda: no `localhost` e no GitHub Pages não há tela de entrada.
- **Sincronização:** a do Gist continua igual. A troca pelo Firestore é uma etapa futura.
- **No laboratório, o login Google do portão basta para abrir as seções.** O login do GitHub fica só para o backup no Gist.

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

## Migração dos usuários (GitHub Pages → laboratório)

O progresso de cada pessoa fica no navegador, e cada endereço tem o seu. Por isso os dados não passam sozinhos de `felipescp.github.io` para `monstrinho-lab.web.app`. O bloco `window.MIGRACAO`, no `index.html` (logo depois da sincronização do Gist), faz a ponte.

**No GitHub Pages (e no localhost):**
- Uma faixa no topo avisa da mudança e do prazo. O prazo fica na constante `MIGRACAO_PRAZO`.
- Depois do envio ao Gist, o ☁️⬆️ Salvar copia o mesmo backup para o Firestore. O Gist não muda.
- **Sem login Google:** o aviso de sucesso mostra o botão "Entrar com Google e copiar".
- **Já logado:** a cópia acontece direto. O salvamento silencioso e o salvamento ao concluir bateria também copiam, mas só com login.

**No Firestore:**
- `usuarios/{uid}/migracao/meta`: `email`, `versao`, `totalPartes`, `completo`, `origem: 'github-pages'` e `formato: 1`.
- `usuarios/{uid}/migracao_partes/v{versao}_p{n}`: as partes, com até 700.000 caracteres em base64 cada.
- O `meta` só aponta para uma versão quando todas as partes dela foram gravadas.
- A cópia leva também a Lei Seca e as duas listas de exclusão (baterias e Histórico), que o backup do Gist não inclui.

**No laboratório:** depois da liberação do portão, o app procura a cópia.
- **Navegador vazio:** importa sozinho e recarrega.
- **Já há dados aqui:** pergunta antes de mesclar, com as opções [Importar e mesclar] e [Agora não].
- A marca `tjpe_v1__migracao_importada` evita importar a mesma cópia duas vezes. Uma cópia nova, feita depois, é oferecida de novo.
- **Navegador "vazio"** é aquele que só tem o que o app grava sozinho ao abrir: as baterias oficiais, as estruturas vazias e as preferências de tela.

**Quem ainda não foi liberado** vê "Acesso não liberado". Se a cópia existe, aparece também "Seus dados já estão guardados; avise o administrador para liberar o acesso."

### Testar no computador (localhost)

1. Uma vez, para o modo lab do localhost ler o acervo no Storage:
   ```
   gcloud storage buckets update gs://monstrinho-lab.firebasestorage.app --cors-file=cors.json
   ```
2. Na pasta do Monstrinho, rode `python -m http.server 8812`.
   - `http://localhost:8812/` funciona como o GitHub Pages.
   - `http://localhost:8812/?modo=lab` funciona como o laboratório. O parâmetro só vale no localhost.
3. **Antes de cada cenário de laboratório**, limpe o navegador: DevTools (F12) → Application → Storage → **Clear site data**. Uma janela anônima também serve. O Gist precisa de "Entrar com GitHub" no localhost.

**Cenários:**

- **a) Pages: Salvar e login.**
  - Em `localhost:8812/`, entre com GitHub e clique em ☁️⬆️ Salvar.
  - No aviso, clique em **Entrar com Google e copiar** e escolha a conta.
  - Deve aparecer "Seus dados foram copiados…", e a faixa fica verde.
  - No console do Firestore, confira `usuarios/{uid}/migracao/meta`, com `email` e `completo: true`, e as partes em `migracao_partes`.
  - Um segundo Salvar copia sem perguntar e apaga as partes da versão anterior.
- **b) Pages: cancelar o login.**
  - Em outro navegador ou janela anônima, faça Salvar e feche a janela do Google sem escolher conta.
  - O aviso fecha e o Gist fica salvo (confira com ☁️⬇️ Carregar).
  - Nada é gravado no Firestore.
- **c) Laboratório com navegador limpo.**
  - Limpe os dados do site e abra `localhost:8812/?modo=lab`.
  - Entre com a mesma conta Google, que precisa estar liberada em `acessos`.
  - Deve aparecer "📥 Trouxemos seus dados do endereço antigo…". A página recarrega, com o progresso de volta (inclusive Lei Seca e conjuntos).
  - Recarregar de novo não importa outra vez.
- **d) Laboratório com dados locais.**
  - Repita o cenário c sem limpar, depois de fazer um novo Salvar no modo Pages. Ou, num navegador limpo, faça antes alguma ação, como marcar uma prioridade em Prazos.
  - Deve aparecer a pergunta "Importar e mesclar?".
  - "Agora não" volta a perguntar na próxima vez que o navegador abrir.
- **e) Conta sem liberação.**
  - Entre no modo lab com uma conta que não está em `acessos`.
  - Aparece "Acesso não liberado".
  - Se essa conta já fez a cópia no cenário a, aparece também "Seus dados já estão guardados; avise o administrador para liberar o acesso."

### Encerrar a migração

Depois do prazo, com todos importados:
- remova o bloco `window.MIGRACAO` (a faixa e a cópia);
- deixe o repositório privado;
- tire o `felipescp.github.io` do Worker.

A pasta `usuarios/{uid}/migracao*` pode ser apagada no console.
