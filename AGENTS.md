# AGENTS.md — Monstrinho (TJPE)

## 1. PROPÓSITO DESTE ARQUIVO

Este arquivo estabelece o contexto arquitetural, as invariantes e as regras
operacionais que agentes de programação devem observar ao trabalhar no
repositório do Monstrinho.

Ele NÃO substitui a leitura do código.

O código atual é a fonte de verdade para comportamento efetivamente
implementado.

Quando houver divergência entre este documento e o código:

1. não presumir que o código está errado;
2. não corrigir automaticamente;
3. investigar a divergência;
4. informar o responsável antes de realizar alteração arquitetural.

Este projeto sofreu muitas modificações ao longo do tempo. Conhecimento
histórico não confirmado no código atual NÃO deve ser tratado como verdade.

---

# 2. REGRA FUNDAMENTAL: INVESTIGAR ANTES DE MODIFICAR

Antes de modificar código, o agente deve:

1. localizar todas as definições relevantes;
2. localizar todos os leitores e escritores do estado afetado;
3. rastrear as funções que chamam o código;
4. verificar dependências entre documentos;
5. verificar efeitos sobre localStorage, IndexedDB, sessionStorage,
   arquivos oficiais e backup;
6. verificar se existe código duplicado ou definição posterior que
   sobrescreva a definição encontrada;
7. verificar se a alteração afeta algum protocolo postMessage;
8. verificar se a alteração afeta importação/exportação ou restauração;
9. identificar eventuais efeitos sobre outros módulos;
10. somente então propor ou executar a alteração.

Não inferir arquitetura apenas a partir do nome de um arquivo ou função.

---

# 3. NATUREZA DO PROJETO

O Monstrinho é uma aplicação web estática.

Não há:

- framework de frontend;
- build system;
- package.json;
- pipeline CI/CD versionado;
- módulos ES;
- bundler.

O núcleo da aplicação está concentrado em:

    index.html

O arquivo é grande e contém múltiplos blocos de JavaScript inline,
organizados em runtimes/engines funcionais.

A aplicação utiliza principalmente:

- localStorage;
- IndexedDB;
- sessionStorage;
- arquivos JSON oficiais;
- GitHub Gist como backup remoto opcional.

Não presumir que a ausência de build system seja um erro a ser corrigido.
Ela é parte da arquitetura atual.

---

# 4. ARQUIVOS PRINCIPAIS

## index.html

É o núcleo atual do Monstrinho.

IMPORTANTE:

`index.html` é o simulador que originalmente se chamava
`simulador.html` e foi posteriormente RENOMEADO e MODIFICADO por decisão
do proprietário do projeto.

Portanto:

- não tratar a ausência de `simulador.html` como um bug a ser corrigido;
- não renomear `index.html`;
- não recriar `simulador.html`;
- não tentar restaurar automaticamente a arquitetura antiga;
- não alterar referências históricas do `planner.HTML` sem solicitação
  expressa.

`index.html` concentra grande parte da lógica da aplicação, incluindo
simulados, baterias, cronograma, flashcards, caderno, materiais,
esquemas, jurisprudência, backup e outras funcionalidades.

## dashboard.html

É a Central Analítica/Analytics.

É carregado por `index.html` dentro de iframe quando o modal de estatísticas
é aberto.

Ele é um documento independente, mas compartilha o localStorage da mesma
origem com `index.html`.

Pode ler e, em alguns fluxos, escrever determinados estados compartilhados.

Não presumir que toda escrita compartilhada constitui uma condição de
corrida. O fluxo efetivo deve ser analisado.

## planner.HTML

É um aplicativo separado/histórico.

Atualmente não há evidência de que `index.html` carregue ou dependa dele.

Ele contém referências ao antigo `simulador.html`, mas essas referências
não devem ser automaticamente "corrigidas" para `index.html`.

O fato de o planner permanecer no repositório não significa que ele faça
parte do fluxo funcional atual.

Só modificar ou reconectar o planner quando isso for explicitamente
solicitado.

## taxonomia.js

É a fonte única atual da taxonomia jurídica.

Não criar uma segunda taxonomia paralela sem necessidade expressa.

A estrutura possui três níveis:

    matéria (L1)
      └── divisão (L2)
            └── tópico (L3)

Os tópicos possuem aliases.

`index.html` deriva em runtime estruturas auxiliares, como
`MAPA_TAXONOMIA`.

## dados/

Contém o conteúdo oficial versionado.

A estrutura é manifest-driven:

    dados/
      manifesto-baterias.txt
      manifesto-esquemas.txt
      manifesto-jurisprudencia.txt
      manifesto-materiais.txt
      bateriasvf/
      esquemas/
      jurisprudencia/
      materiais/

O aplicativo lê os manifestos e posteriormente busca os JSONs listados.

---

# 5. REGRA CRÍTICA SOBRE CONTEÚDO OFICIAL

Itens marcados com:

    origem_oficial: true

são conteúdo oficial do repositório.

Eles NÃO devem ser:

- persistidos como conteúdo pessoal em localStorage;
- incorporados indevidamente ao backup pessoal;
- tratados como itens editáveis do usuário;
- duplicados desnecessariamente no estado local.

Conteúdo oficial deve continuar sendo carregado a partir dos arquivos
oficiais/manifestos.

Essa separação é deliberada.

Antes de modificar qualquer `salvar()`, `exportar()`, `importar()` ou
`aplicarPayloadMerge()`, verificar expressamente o tratamento de
`origem_oficial`.

---

# 6. MANIFESTOS DE DADOS OFICIAIS

Cada arquivo JSON oficial colocado em uma subpasta de `dados/` deve ter
sua entrada correspondente no manifesto daquela categoria.

Exemplo:

    dados/esquemas/novo-arquivo.json

exige a correspondente entrada em:

    dados/manifesto-esquemas.txt

A ausência no manifesto pode causar falha silenciosa: o arquivo existe,
mas não é carregado pelo aplicativo.

Não criar ou remover arquivos oficiais sem verificar simultaneamente:

1. arquivo físico;
2. manifesto correspondente;
3. nome/caminho exato;
4. código consumidor;
5. eventual impacto sobre a taxonomia.

Os manifestos possuem formato simples: uma entrada de caminho relativo
por linha.

Não introduzir comentários ou metadados no manifesto sem verificar antes
como o parser atual funciona.

---

# 7. PERSISTÊNCIA

## localStorage

É a principal camada de persistência da aplicação.

O namespace atual é:

    tjpe_v1__

Novos estados persistentes do `index.html` devem seguir esse padrão,
salvo exceção arquitetural expressamente justificada.

Não criar chaves novas arbitrariamente.

Antes de criar uma nova chave, pesquisar se já existe estado equivalente.

## IndexedDB

Atualmente é utilizado para estruturas maiores, especialmente:

- Arquivo Morto;
- Sessão Ativa.

Não migrar dados entre localStorage e IndexedDB sem compreender o fluxo
de migração existente.

## sessionStorage

É utilizado para estados efêmeros e alguns protocolos de navegação/
retorno.

Não tratá-lo como equivalente ao localStorage.

---

# 8. ESTADOS COMPARTILHADOS ENTRE INDEX E DASHBOARD

Existem estados que podem ser lidos/escritos pelos dois documentos.

Atualmente incluem, entre outros:

    tjpe_v1__cordeiro_acervo_provas
    tjpe_v1__salinha_longitudinal_runtime

e há leitura legada de:

    tjpe_v1__etl_planner_db

IMPORTANTE:

A existência de mais de um escritor NÃO deve ser automaticamente
classificada como condição de corrida.

Auditoria específica demonstrou que, no fluxo atual:

- não foi demonstrada perda de dados por concorrência;
- operações de read-modify-write relevantes são executadas de forma
  síncrona;
- o dashboard é aberto em modal que bloqueia fisicamente a interação
  com a UI do index;
- o fluxo assíncrono encontrado relê o estado no próprio callback antes
  de escrever;
- `etl_planner_db` não possui atualmente dois escritores: o dashboard
  apenas o lê como fallback legado.

Portanto:

> NÃO impor uma regra artificial de "um único escritor por chave".

Quando modificar qualquer uma dessas chaves, porém, rastrear o fluxo real
dos dois documentos antes da alteração.

---

# 9. DASHBOARD E MODAL DE ESTATÍSTICAS

O dashboard é aberto em um modal full-screen.

Enquanto esse modal está aberto, a UI do `index.html` fica fisicamente
inacessível ao usuário.

O iframe do dashboard é destruído quando o modal é fechado.

Não presumir que `dashboard.html` permanece executando em segundo plano
depois do fechamento do modal.

Ao alterar o dashboard:

1. verificar o fluxo de abertura;
2. verificar o ciclo de vida do iframe;
3. verificar localStorage compartilhado;
4. verificar postMessage;
5. verificar se o código é efetivamente alcançável.

---

# 10. POSTMESSAGE

Existem protocolos `postMessage` relacionados a:

- controle do simulador;
- planner;
- tema;
- sincronização;
- eventos de conclusão.

Os nomes das mensagens constituem contratos implícitos.

Exemplos:

    CMD_LIMPAR
    CMD_MOBILE
    CMD_AUTO
    CMD_CEGAS
    CMD_SOM
    CMD_TEMA
    CMD_ZOOM_OUT
    CMD_ZOOM_IN
    CMD_ATUALIZAR_COR
    SYNC_TOOLS
    SIMULADO_FINALIZADO
    BATERIA_CRIADA
    FECHAR_MODAL

Não renomear ou remover mensagens sem localizar todos os emissores e
receptores.

Não assumir que uma mensagem é inútil apenas porque determinado caminho
atual parece inativo.

Da mesma forma, não reativar automaticamente protocolos antigos.

---

# 11. BACKUP E GITHUB

O backup remoto utiliza GitHub Gist.

Há dois mecanismos de autenticação:

- token manual;
- OAuth Device Flow.

O Cloudflare Worker atua como relay CORS para o fluxo OAuth.

O Gist é uma camada de backup/remoto.

Ele NÃO é a fonte primária dos dados oficiais do aplicativo.

---

# 12. BACKUP AUTOMÁTICO PERIÓDICO — ESTADO DELIBERADO

Existe no código um mecanismo de salvamento automático periódico de nuvem.

Ele foi originalmente concebido para verificar, a cada aproximadamente
5 minutos de atividade, se deveria executar:

    exportarNuvemSilenciosa()

IMPORTANTE:

Esse mecanismo está atualmente DESATIVADO DELIBERADAMENTE.

A desativação é feita por um `return` incondicional dentro de:

    verificarSalvamentoPeriodicoNuvem()

O código foi preservado intencionalmente.

NÃO:

- remover o código;
- reativá-lo;
- substituir por setInterval;
- alterar sua periodicidade;
- retirar a documentação da desativação;

sem solicitação explícita do proprietário.

A implementação original não era um setInterval absoluto.
Ela era acionada a partir do `autoSave()` e verificava se haviam decorrido
5 minutos desde o último envio.

O backup manual continua ATIVO.

O auto-load/restauração silenciosa da nuvem também é um mecanismo distinto
e continua ATIVO.

Existe ainda um envio pontual silencioso durante determinado fluxo de
merge/restauração para corrigir estado específico. Isso NÃO significa que
o backup periódico tenha sido reativado.

---

# 13. BACKUP MANUAL

Não confundir:

    exportarNuvem()

com:

    exportarNuvemSilenciosa()

O primeiro pertence ao fluxo manual acionado pelo usuário.

O segundo pertence à infraestrutura silenciosa utilizada pelo mecanismo
periódico preservado/desativado e por determinados fluxos automáticos
pontuais.

Modificar um não significa automaticamente modificar o outro.

---

# 14. TAXONOMIA

`taxonomia.js` é a fonte de dados taxonômicos.

Estrutura:

    taxonomia_concursos[]
      └── matéria
            └── divisoes[]
                  └── topicos[]
                        └── aliases[]

Os IDs de L1/L2/L3 são importantes para a vinculação entre:

- questões;
- baterias;
- flashcards;
- materiais;
- esquemas;
- jurisprudência;
- cronograma;
- demais conteúdos.

Não alterar IDs, nomes ou estrutura sem verificar todos os consumidores.

Não criar uma taxonomia paralela em outro arquivo para resolver
temporariamente um problema de consumo.

---

# 15. ARQUITETURA DOS RUNTIMES

O `index.html` possui vários subsistemas/runtimes.

Entre eles:

- `CRONOGRAMA_RUNTIME`
- `FLASHCARDS_RUNTIME`
- `PRATICAR_CADERNO_RUNTIME`
- `MATERIAIS_RUNTIME`
- `ESQUEMAS_RUNTIME`
- `JURISPRUDENCIA_RUNTIME`
- `SimuladosEngine`
- `PlaylistsEngine`
- `ProvasEngine`
- `SALINHA_BACKUP`
- `SALINHA_GIST_SYNC`
- `SALINHA_GITHUB_OAUTH`

Cada subsistema pode possuir:

- STORAGE_KEY;
- carregar();
- salvar();
- init();
- bootstrap lazy;
- exportadores;
- importadores.

Antes de modificar um runtime, identificar seu contrato de persistência
e seus consumidores.

---

# 16. IMPORTAÇÃO E EXPORTAÇÃO

Importação/exportação não deve ser tratada como simples manipulação de
arquivo.

Sempre verificar:

    arquivo
       ↓
    parser
       ↓
    validação
       ↓
    merge/substituição
       ↓
    persistência
       ↓
    renderização

Especial atenção a:

- IDs;
- deduplicação;
- fusão;
- conteúdo oficial;
- estado existente;
- backups;
- restauração.

Não substituir o estado inteiro quando a operação existente foi desenhada
como merge.

---

# 17. OPERAÇÕES DESTRUTIVAS

Existem operações potencialmente destrutivas, incluindo:

- `localStorage.clear()`;
- purga por namespace;
- remoção de itens;
- restauração total de backup;
- limpeza de partes antigas do Gist.

Antes de modificar qualquer operação destrutiva:

1. localizar todos os call-sites;
2. verificar se existe confirmação do usuário;
3. verificar exatamente qual estado será afetado;
4. verificar se há possibilidade de restauração;
5. informar o risco antes de executar.

Nunca substituir uma operação seletiva por `clear()` ou purga ampla apenas
porque é mais simples.

---

# 18. SEGURANÇA

Nunca:

- inserir tokens reais no código;
- inserir PATs;
- inserir OAuth tokens;
- inserir client secrets;
- commitar credenciais;
- reproduzir credenciais em logs ou relatórios;
- mover credenciais para arquivos versionados.

Tokens do usuário são armazenados localmente pelo aplicativo.

Se uma tarefa exigir credencial, utilizar o mecanismo já existente.

Não criar uma nova forma de armazenamento de segredo sem necessidade
expressa.

---

# 19. GITHUB / GIT

O repositório atual utiliza:

    branch: main

Antes de iniciar trabalho de modificação:

    git status
    git log -n ...

devem ser consultados quando a tarefa envolver estado do repositório.

IMPORTANTE:

O histórico apresentou commits curtos como "2" e "3". Existe histórico
de um mecanismo de backup/commit automático, mas o mecanismo exato não
deve ser presumido pelo agente.

O backup automático de nuvem de 5 minutos está deliberadamente suspenso.
Isso não deve ser confundido com eventual mecanismo externo de commit Git.

Nunca:

- fazer reset;
- checkout destrutivo;
- clean;
- rebase;
- force push;
- apagar alterações locais;

sem autorização explícita.

Não fazer commit ou push automaticamente, salvo se o usuário solicitar.

---

# 20. ALTERAÇÕES EM index.html

`index.html` é um arquivo monolítico grande, com aproximadamente 21 mil
linhas e múltiplos blocos de script.

Uma alteração aparentemente pequena pode afetar outros subsistemas.

Antes de editar:

1. localizar a função;
2. localizar todas as definições da mesma função/nome;
3. verificar se existe definição posterior que a sobrescreve;
4. localizar todos os call-sites;
5. localizar todas as chaves de estado relacionadas;
6. verificar listeners e timers;
7. verificar postMessage;
8. verificar import/export;
9. verificar boot/init;
10. avaliar regressões.

Após editar:

1. verificar sintaxe de cada bloco JavaScript afetado;
2. quando possível, extrair o bloco e executar verificação equivalente a
   `new Function()` sem executá-lo;
3. inspecionar o diff;
4. confirmar que nenhuma região não relacionada foi alterada;
5. realizar teste funcional da área modificada.

Não considerar "o arquivo salvou sem erro" como validação.

---

# 21. DEFINIÇÕES DUPLICADAS E CÓDIGO LEGADO

O projeto contém algumas estruturas duplicadas/vestigiais.

Exemplo conhecido:

`window.excluirSimuladoIndividual` possui duas definições no arquivo,
sendo a posterior a efetivamente utilizada.

Outro exemplo:

`dashboard.html` possui código relacionado a uma subfeature de modal
iframe que atualmente não possui caminho funcional confirmado.

Essas situações NÃO devem ser automaticamente corrigidas.

Antes de remover código aparentemente morto:

1. localizar referências;
2. verificar execução real;
3. verificar histórico quando necessário;
4. verificar se há integração externa;
5. consultar o usuário quando a remoção puder afetar compatibilidade.

"Código não chamado" não é sinônimo automático de "código que pode ser
apagado".

---

# 22. CÓDIGO LEGADO DO PLANNER

`planner.HTML` contém estruturas antigas, inclusive chaves sem o prefixo
`tjpe_v1__` e referências ao antigo `simulador.html`.

Essas estruturas podem ser relevantes historicamente.

NÃO:

- migrar automaticamente essas chaves;
- conectar novamente o planner;
- trocar `simulador.html` por `index.html`;
- remover as chaves legadas;
- "modernizar" o planner;

sem solicitação específica.

O estado atual é deliberado até prova em contrário.

---

# 23. REGRA SOBRE INFERÊNCIAS

Sempre distinguir:

    FATO OBSERVADO
    INFERÊNCIA
    NÃO CONFIRMADO

Se o código demonstra algo diretamente, trate como fato.

Se a conclusão deriva de nomes, padrões ou arquitetura provável,
identifique-a como inferência.

Se não houver evidência suficiente, diga:

    NÃO CONFIRMADO

Nunca transforme uma inferência arquitetural em regra de implementação.

---

# 24. QUANDO O AGENTE ENCONTRAR UM PROBLEMA

Não corrigir automaticamente todo problema encontrado.

Classificar primeiro:

1. BUG FUNCIONAL
2. RISCO ARQUITETURAL
3. DÍVIDA TÉCNICA
4. CÓDIGO LEGADO
5. INCONSISTÊNCIA DOCUMENTAL
6. COMPORTAMENTO DELIBERADO
7. NÃO CONFIRMADO

Exemplo:

"Dois documentos escrevem a mesma chave"

NÃO é suficiente para concluir:

"há condição de corrida".

É necessário rastrear o fluxo concreto e demonstrar a possibilidade de
perda/sobrescrita de estado.

---

# 25. ESCOPO

Alterar somente os arquivos necessários para a tarefa solicitada.

Não:

- refatorar arquivos não relacionados;
- reorganizar o projeto;
- formatar o projeto inteiro;
- renomear arquivos por conveniência;
- substituir arquitetura existente por uma arquitetura "melhor";
- atualizar bibliotecas sem solicitação;
- remover código legado sem análise;
- alterar dados oficiais incidentalmente.

Se uma alteração aparentemente exigir mudança fora do escopo, informar
antes de executá-la, salvo quando a dependência for inequívoca e
estritamente necessária.

---

# 26. NÃO INVENTAR COMPONENTES

Não criar:

- novos arquivos;
- novas APIs;
- novas chaves de armazenamento;
- novos mecanismos de sincronização;
- novos locks;
- novas camadas de abstração;

apenas porque parecem arquiteturalmente melhores.

Primeiro entender o sistema existente.

Quando uma nova estrutura for realmente necessária, justificar:

1. por que a existente não atende;
2. qual será o contrato;
3. quem será seu proprietário;
4. quem lerá;
5. quem escreverá;
6. como será migrado;
7. como será revertido.

---

# 27. PRINCÍPIO DE MÍNIMA ALTERAÇÃO

Para correções pontuais:

> alterar o mínimo necessário para corrigir o problema.

Evitar refatorações oportunísticas.

Não aproveitar um bug simples para reorganizar toda a arquitetura.

Uma mudança arquitetural deve ser tratada como mudança arquitetural e
explicitamente comunicada.

---

# 28. TESTES E VALIDAÇÃO

Não há suíte automatizada abrangente.

A validação deve combinar:

1. inspeção estática;
2. verificação de sintaxe;
3. inspeção de diff;
4. teste funcional no navegador;
5. verificação de persistência;
6. verificação de regressão das áreas afetadas.

Para alterações envolvendo localStorage:

- testar leitura;
- testar escrita;
- testar reload;
- testar importação/exportação quando aplicável.

Para alterações envolvendo iframes:

- testar abertura;
- teste de fechamento;
- testar postMessage;
- testar estado antes/depois.

Para alterações envolvendo dados oficiais:

- testar manifesto;
- testar fetch;
- testar carregamento;
- confirmar `origem_oficial`.

---

# 29. RELATÓRIO APÓS ALTERAÇÕES

Ao concluir uma tarefa, o agente deve informar:

## Alterado

Arquivos efetivamente modificados.

## O que mudou

Resumo objetivo da alteração.

## Por quê

Problema que motivou a alteração.

## Validação

Testes/verificações realizados.

## Riscos

Eventuais riscos remanescentes.

## Não alterado

Aspectos relacionados que foram deliberadamente preservados.

Não afirmar que algo foi testado se não foi efetivamente testado.

---

# 30. REGRA FINAL

O objetivo do agente não é tornar o Monstrinho mais elegante segundo
sua própria concepção de arquitetura.

O objetivo é:

> preservar o comportamento existente, compreender os contratos atuais,
> corrigir exatamente o problema solicitado e evitar regressões.

Quando houver conflito entre:

    "uma arquitetura teoricamente melhor"

e

    "a arquitetura deliberadamente escolhida pelo proprietário"

preservar a arquitetura existente, salvo solicitação expressa para
mudá-la.

Antes de qualquer alteração estrutural, perguntar:

    O que realmente precisa mudar?

    Qual estado será afetado?

    Quem depende dele?

    Qual é o menor caminho seguro para produzir a mudança?

    Como demonstrar que nada não solicitado foi quebrado?