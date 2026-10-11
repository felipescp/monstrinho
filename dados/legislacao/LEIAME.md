# Legislação — base interna (sem seção própria)

Cada diploma é um `.json` gerado a partir do texto compilado do Planalto pelo script `ferramentas/legislacao_planalto.py`. O app baixa o arquivo só na primeira consulta (por exemplo, ao passar o mouse sobre "art. 155 do CP" nas Conexões da Jurisprudência) e não o grava no armazenamento pessoal nem na nuvem.

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Código Penal | `codigo-penal.json` | 08/10/2026 |
| Constituição Federal | `constituicao.json` | 09/10/2026 |
| ADCT | `adct.json` | 09/10/2026 |
| Código de Processo Civil | `cpc.json` | 09/10/2026 |
| Código Civil | `codigo-civil.json` | 09/10/2026 |
| Código de Processo Penal | `cpp.json` | 09/10/2026 |
| Código de Defesa do Consumidor | `cdc.json` | 09/10/2026 |
| Código Tributário Nacional | `ctn.json` | 09/10/2026 |
| Lei de Execução Penal | `lep.json` | 09/10/2026 |
| Estatuto da Criança e do Adolescente | `eca.json` | 09/10/2026 |
| Lei de Drogas (Lei 11.343/2006) | `lei-11343.json` | 09/10/2026 |
| Recuperação Judicial e Falência (Lei 11.101/2005) | `lei-11101.json` | 09/10/2026 |
| Ação Civil Pública (Lei 7.347/1985) | `lei-7347.json` | 09/10/2026 |
| Planos de Saúde (Lei 9.656/1998) | `lei-9656.json` | 09/10/2026 |
| Crimes Ambientais (Lei 9.605/1998) | `lei-9605.json` | 09/10/2026 |
| Execução Fiscal (Lei 6.830/1980) | `lei-6830.json` | 09/10/2026 |
| Improbidade Administrativa (Lei 8.429/1992) | `lei-8429.json` | 09/10/2026 |
| Servidores Públicos Federais (Lei 8.112/1990) | `lei-8112.json` | 09/10/2026 |
| Código de Trânsito Brasileiro (Lei 9.503/1997) | `ctb.json` | 09/10/2026 |
| Estatuto da Advocacia e da OAB (Lei 8.906/1994) | `lei-8906.json` | 09/10/2026 (incompleto: faltam os arts. 68 a 87, ausentes do compilado enviado) |
| Lei de Benefícios da Previdência Social (Lei 8.213/1991) | `lei-8213.json` | 09/10/2026 |
| Lei do Processo Administrativo Federal (Lei 9.784/1999) | `lei-9784.json` | 11/10/2026 |
| Lei das Eleições (Lei 9.504/1997) | `lei-9504.json` | 11/10/2026 |
| Lei do Mandado de Segurança (Lei 12.016/2009) | `lei-12016.json` | 11/10/2026 |
| Lei de Introdução às Normas do Direito Brasileiro (Decreto-Lei 4.657/1942) | `lindb.json` | 11/10/2026 |
| Lei da Ação Popular (Lei 4.717/1965) | `lei-4717.json` | 11/10/2026 |
| Lei das Sociedades por Ações (Lei 6.404/1976) | `lei-6404.json` | 11/10/2026 |
| Lei do Bem de Família (Lei 8.009/1990) | `lei-8009.json` | 11/10/2026 |
| Lei 9.494/1997 (tutela antecipada contra a Fazenda; art. 1º-F) | `lei-9494.json` | 11/10/2026 |

**CF e ADCT** vêm do mesmo compilado. Eles ficam em arquivos separados porque o ADCT recomeça a numeração no art. 1º. Para recortar cada parte, use `--fim` (CF) e `--inicio` (ADCT) com `'^ATO DAS DISPOSI[ÇC][ÕO]ES CONSTITUCIONAIS TRANSIT[ÓO]RIAS$'`.

## Incluir ou atualizar um diploma

1. **Salvar o compilado.** Salve a página compilada do Planalto em Markdown, como foi feito com o `DEL2848compilado.md`.
2. **Gerar o JSON.** Rode o script:

   ```
   python3 ferramentas/legislacao_planalto.py <compilado.md> <ID> "<Nome>" <url-do-planalto> dados/legislacao/<arquivo>.json AAAA-MM-DD
   ```

3. **Registrar o diploma.** Só se o diploma for novo: acrescente uma linha em `window.LEGISLACAO` → `DIPLOMAS` no `index.html`. A linha leva o ID, o arquivo, a URL do Planalto e a expressão que reconhece a sigla ou o nome do diploma.
