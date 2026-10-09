# Legislação — base interna (sem seção própria)

Cada diploma é um `.json` gerado a partir do texto compilado do Planalto pelo script `ferramentas/legislacao_planalto.py`. O app baixa o arquivo só na primeira consulta (por exemplo, ao passar o mouse sobre "art. 155 do CP" nas Conexões da Jurisprudência) e não o grava no armazenamento pessoal nem na nuvem.

| Diploma | Arquivo | Texto conforme o Planalto em |
|---|---|---|
| Código Penal | `codigo-penal.json` | 08/10/2026 |
| Constituição Federal | `constituicao.json` | 09/10/2026 |
| ADCT | `adct.json` | 09/10/2026 |
| Código de Processo Civil | `cpc.json` | 09/10/2026 |

**CF e ADCT** vêm do mesmo compilado. Eles ficam em arquivos separados porque o ADCT recomeça a numeração no art. 1º. Para recortar cada parte, use `--fim` (CF) e `--inicio` (ADCT) com `'^ATO DAS DISPOSI[ÇC][ÕO]ES CONSTITUCIONAIS TRANSIT[ÓO]RIAS$'`.

## Incluir ou atualizar um diploma

1. **Salvar o compilado.** Salve a página compilada do Planalto em Markdown, como foi feito com o `DEL2848compilado.md`.
2. **Gerar o JSON.** Rode o script:

   ```
   python3 ferramentas/legislacao_planalto.py <compilado.md> <ID> "<Nome>" <url-do-planalto> dados/legislacao/<arquivo>.json AAAA-MM-DD
   ```

3. **Registrar o diploma.** Só se o diploma for novo: acrescente uma linha em `window.LEGISLACAO` → `DIPLOMAS` no `index.html`. A linha leva o ID, o arquivo, a URL do Planalto e a expressão que reconhece a sigla ou o nome do diploma.
