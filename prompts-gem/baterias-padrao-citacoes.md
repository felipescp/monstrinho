# Baterias — padrão de citação de leis e julgados (colar nas instruções do Gem)

O app transforma as citações das Explicações em links: o artigo de lei abre um balão com o texto do dispositivo e o julgado abre o card da Jurisprudência. Para isso funcionar, toda citação precisa trazer a lei (ou o tribunal) de forma explícita. Cole o bloco abaixo nas instruções do Gem que gera as baterias.

---

**Citações na Explicação (obrigatório)**

1. Todo artigo citado traz a lei no mesmo trecho, com a sigla ou o número:
   - certo: "art. 157, § 2º, II, do CP"; "art. 75, VIII, da Lei 14.133/2021"; "art. 5º, XXXV, da CF"; "art. 23, § 3º, da LRF".
   - errado: "(art. 157, § 2º)"; "o art. 88 desta Lei"; "conforme o mesmo diploma"; "o art. 12 da norma".
2. Ordem do dispositivo: artigo, parágrafo, inciso, alínea, sempre nessa ordem e separados por vírgula: "art. 121, § 2º, I, do CP"; "art. 61, II, \"f\", do CP". Evite "o inciso II do § 2º do art. 121".
3. Siglas aceitas: CF, CP, CPP, CC, CPC, CDC, CTN, ECA, CLT, LEP, LCP, LINDB, CTB, CPM, CPPM. Demais leis: pelo número, com ou sem ano ("Lei 11.343/2006", "LC 101/2000").
4. "LRF" é sempre a Lei de Responsabilidade Fiscal (LC 101/2000). A Lei de Recuperação e Falência é sempre "Lei 11.101/2005" (nunca "LRF", "LREF" ou "LFRE").
5. A Constituição pode ser "CF" ou "Constituição Federal". Evite "Carta Magna", "Lei Maior" e "Texto Constitucional" na citação do artigo.
6. Julgados e enunciados com a classe, o número e o tribunal: "REsp 1.234.567/SP", "HC 123.456/STF", "Súmula 711 do STF", "Súmula Vinculante 14", "Tema 1.215 do STJ".
7. Resoluções, recomendações, provimentos e outros atos: sempre com o nome completo junto do artigo ("art. 3º da Resolução CNMP 164/2017").

---

O texto acima já está incorporado ao prompt do Gem em `prompts-gem/gerador-questoes-fgv.md` (seção "Padrão de Citação").

Para padronizar baterias já existentes no acervo oficial, rode `ferramentas/normalizar_citacoes.js` (instruções no cabeçalho do script). O relatório da última rodada fica em `relatorios/normalizacao-citacoes.md`.
