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

A partir daí, cada push no `main` faz duas coisas:
- envia ao Storage o que mudou em `dados/`;
- publica o app e as regras.

O resultado aparece na aba Actions. Para desligar, mude `FIREBASE_DEPLOY` para qualquer outro valor.

## Depois que o site no Firebase estiver funcionando

- Deixe o repositório **privado**: GitHub → Settings → General → Danger Zone → Change visibility.
- O GitHub Pages (Monstrinho antigo, branch `pages-legado`) sai do ar.
- O Worker do Cloudflare (`cloudflare-worker/`) só serve ao login do GitHub do Monstrinho antigo. A Salinha não o usa.

## Liberar outra pessoa

Não é preciso pedir o e-mail a ninguém:

1. A pessoa abre `www.asalinha.com.br` e clica em **Entrar com Google**.
2. Sem acesso liberado, o app cria sozinho `acessos/{e-mail}` com `ativo: false` e mostra a faixa "Pedido de acesso registrado".
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
- A página recarrega sozinha quando nenhum modal está aberto. Com modal aberto (ex.: Lei Seca), aparece um balão por cima de tudo, "Seus dados foram atualizados em outro aparelho", com o botão **Recarregar agora**. Se ninguém clicar, a página recarrega quando o modal for fechado.
- Há uma trava de no máximo 3 recargas automáticas por minuto.

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
| d | Dois navegadores ao mesmo tempo | Com os dois abertos, marque algo num deles (ex.: uma prioridade na Lei Seca). | Uns 3 s depois, a chave ganha `versao` e `dispositivo` novos. No outro navegador: sem modal aberto, recarrega sozinho; com modal aberto, aparece o balão "Seus dados foram atualizados em outro aparelho" e a página recarrega ao fechar o modal. Esperando 10 s, nada mais muda (sem eco nem laço). |
| e | Offline e volta | DevTools → Network → Offline. Faça uma mudança e veja "⚠ Sem conexão". Volte para Online. | Enquanto offline, a `versao` não muda. Ao voltar, o indicador vai para ✓ e a `versao` avança. |
| f | Chave grande (partes) | Crie esquemas pessoais grandes (somando mais de 900 KB). | `tjpe_v1__esquemas_runtime` com `partes: n` e `valor: null`. A subcoleção `partes` tem exatamente n documentos `{versao}_{1..n}`, todos com a mesma `versao`. |
| g | Sair e entrar com outra conta | Clique em ✕ (sair) e entre com outra conta liberada. | Depois de sair, os dados pessoais somem deste navegador. A outra conta não recebe nada da primeira: `usuarios/{uid2}` fica vazio ou só com os dados dela. |
| h | Conta sem acesso liberado | Entre com uma conta que não está em `acessos`. | Aparece a faixa "Pedido de acesso registrado para…", sem tela cheia, e as seções pedem login. Surge `acessos/{e-mail}` com `ativo: false`. Nada é criado em `usuarios`. |

Para liberar alguém, mude `ativo` para `true` e peça para a pessoa clicar em **Verificar de novo**.
