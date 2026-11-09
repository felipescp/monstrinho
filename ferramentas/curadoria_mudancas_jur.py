#!/usr/bin/env python3
"""Curadoria da aba "🆕 Divergências e Mudanças" da Jurisprudência.

Grava o campo `mudanca` nas fichas oficiais de dados/jurisprudencia/*.json:
  { "tipo": "mudanca" | "superado" | "divergencia",
    "situacao": "viva" | "resolvida"   (só divergência),
    "causa": "lei"                     (quando a mudança veio de lei/EC),
    "data": "AAAA-MM-DD", "AAAA-MM" ou "AAAA" (mudança posterior ao julgado),
    "resumo": "...",
    "ver": ["id", ...] }               (fichas ligadas: a nova, a antiga, a outra Turma)

Para incluir uma ficha nova: acrescente-a em CURADORIA (pelo id completo) e rode
  python3 ferramentas/curadoria_mudancas_jur.py
O campo é regravado do zero a cada execução (remove de quem saiu da lista).
"""
import json, glob, re, sys

M, S, D = 'mudanca', 'superado', 'divergencia'
# id da ficha: (tipo, extras, resumo, [processos/ids ligados])
CURADORIA = {
 # ── Mudanças de entendimento ──
 'jur_1791073903438_wi6bgw': (M, {'data': '2026-03-11'}, 'Nos EDcl dos repetitivos (Info 881), a 1ª Seção alterou a tese de mar/2025 sobre a cumulação da Lei 12.158/2009 com o art. 34 da MP 2.215-10 para os taifeiros: passou a limitar os proventos à graduação de Suboficial e a admitir revisão no prazo decadencial de 5 anos.', []),
 'jur_1788565527682_hu9c5e': (M, {}, 'A 1ª Seção abandonou o entendimento de 2021 (EREsp 1.496.347) e, alinhada à ADPF 418/STF, passou a admitir que o juiz converta a perda da função em cassação de aposentadoria na execução da improbidade.', []),
 'jur_1788565527682_qh9cw0': (M, {'causa': 'lei'}, 'Com o rol taxativo do art. 11 da LIA (Lei 14.230/2021), o STJ reviu sua posição: o assédio sexual praticado por professor deixou de configurar, por si só, improbidade.', []),
 'jur_1788565527682_rmex4j': (M, {'causa': 'lei'}, 'Fim do dano presumido: após a Lei 14.230/2021, o art. 10 da LIA exige perda patrimonial efetiva, inclusive nos processos em curso.', []),
 'jur_1788788258352_qtf5ma': (M, {}, 'Mudança de entendimento: superado o AgRg no REsp 1.394.161-SC (2013), o contratado sem licitação, mesmo de má-fé, deve ser indenizado pelo custo básico do serviço efetivamente prestado, sem lucro.', []),
 'jur_1788806646964_s43i2p': (M, {}, 'Em EDcl com efeitos infringentes, o STJ reviu a posição anterior: a CCEE, por exercer autorregulação e não poder de polícia, pode aplicar sanções contratuais aos associados sem previsão legal expressa.', []),
 'jur_1788804204908_kf6xbe': (M, {}, 'Superada a Súmula 119/STJ (20 anos): a desapropriação indireta prescreve, em regra, em 10 anos, e em 15 se não houver obras ou serviços públicos no local (Tema 1.019).', ['jur_1791738937484_s02c1w']),
 'jur_1790158157526_ku0yqz': (M, {}, 'O STF superou a prescrição trintenária do FGTS (Súmula 210/STJ e 362/TST): o prazo passou a ser quinquenal, com modulação de efeitos (Tema 608).', ['jur_1791738937556_opw247']),
 'jur_1789367132498_lz6kex': (M, {}, 'Superando a exigência de impugnação de todo o complexo normativo, o STF passou a declarar, por arrastamento e de ofício, a inconstitucionalidade da norma revogada que tinha o mesmo vício.', []),
 'jur_1789374549449_qd9wkd': (M, {}, 'Mudança de entendimento: o Plenário superou precedente de Turma e admitiu impor a shopping center a obrigação de instalar creches para filhos das empregadas das lojas.', []),
 'jur_1789374629103_cgmiud': (M, {}, 'Mudança de entendimento: lei estadual pode permitir, mas não obrigar, a manutenção da Bíblia em bibliotecas e espaços públicos (interpretação conforme).', []),
 'jur_1789594933814_0cpt5e': (M, {}, 'Superada a Súmula 421/STJ: a Defensoria Pública tem direito a honorários sucumbenciais inclusive contra o ente ao qual se vincula (Tema 1.002).', ['jur_1791738937559_5q1ncf']),
 'jur_1789376695075_qncddg': (M, {}, 'Tema 1.234/STF: superou o Tema 793 quanto à inclusão automática da União no polo passivo das ações de medicamentos e revogou, por conflito, as teses do IAC 14/STJ.', []),
 'jur_1789376695075_n0j6th': (M, {'data': '2024'}, 'Em 2024 o STF passou a admitir procuradorias jurídicas próprias em universidades estaduais, sem ofensa ao art. 132 da CF, ao contrário do que decidira em 2021.', []),
 'jur_1788868642150_ebhaci': (M, {}, 'Reafirma a virada da ADPF 634/SP (2021): estados e municípios podem instituir feriado de significado histórico-cultural ou religioso local.', []),
 'jur_1788872263637_scwyew': (M, {'data': '2021'}, 'Antes (ADI 3.038, 2014), a CE não podia restringir além da CF os requisitos para chefiar a Polícia Civil; hoje (ADI 3.922, 2021), pode exigir delegado da classe final, salvo vício de iniciativa parlamentar.', []),
 'jur_1788868642150_bzy8my': (M, {}, 'Regra geral válida (ADI 5.745): lei estadual pode exigir identificação prévia do profissional que fará atendimento domiciliar. Para telecomunicações, o entendimento atual (ADI 6.214) é de invasão da competência privativa da União.', []),
 'jur_1791757112268_d72b6t': (M, {}, 'Com o Tema 201/STF, superado o entendimento da ADI 1.851: na substituição tributária progressiva, cabe restituição do ICMS quando a base de cálculo efetiva for menor que a presumida.', []),
 'jur_1788518776065_4ywk5w': (M, {}, 'O concurso de preferência entre entes públicos (art. 187, parágrafo único, do CTN) não foi recepcionado: cancelada a Súmula 563/STF e superada a Súmula 497/STJ.', ['jur_1791738937595_kkv9us', 'jur_1791738937599_at4cf8']),
 'jur_1789069124903_2z9xer': (M, {}, 'Após o STF validar o Código Florestal (ADC 42), o STJ superou sua jurisprudência anterior: o cômputo da APP na Reserva Legal alcança situações consolidadas.', []),
 'jur_1789069124903_pq8xcr': (M, {}, 'Superada a teoria da dupla imputação: a pessoa jurídica pode responder sozinha por crime ambiental, sem denúncia conjunta da pessoa física.', ['jur_1789470359830_at2qv0']),
 'jur_1789470359830_at2qv0': (M, {}, 'O STJ abandonou a dupla imputação (REsp 610.114, 2005) e seguiu o STF: a pessoa jurídica pode ser responsabilizada isoladamente por crime ambiental.', ['jur_1789069124903_pq8xcr']),
 'jur_1788223823979_4zhp22': (M, {}, 'Tema 1.249: medidas protetivas são tutela inibitória, não dependem de BO, inquérito ou processo e vigoram por prazo indeterminado. Superou a revisão obrigatória a cada 90 dias e resolveu a divergência entre a 5ª e a 6ª Turmas.', ['jur_1788223823979_3io0lk']),
 'jur_1788223823979_aj2ykr': (M, {}, 'Superado o entendimento anterior sobre competência para o estupro infantil (REsp 2.005.974 e EAREsp 2.099.532): a idade da vítima não afasta a vara de violência doméstica nem a Lei Maria da Penha.', []),
 'jur_1786379843114_0s75ic': (M, {}, 'Mudança de entendimento: os requisitos da colaboração do art. 41 da Lei de Drogas são cumulativos, superado o HC 663.265-SP (Info 789).', []),
 'jur_1786379843114_3nb319': (M, {}, 'No tráfico internacional pelos Correios, a competência passou a ser do juízo federal do local de destino; a Súmula 528/STJ foi cancelada em 2022.', ['jur_1791738937615_xweg60']),
 'jur_1789607138535_tb494c': (M, {}, 'Overruling da AP 937: a prerrogativa de foro para crimes praticados no cargo e em razão dele subsiste após o fim do mandato, qualquer que seja a causa.', ['jur_1791718798503_xf7iar', 'jur_1790221818145_dpdzhd']),
 'jur_1790221818145_dpdzhd': (M, {}, 'A Corte Especial aplicou a virada do STF (HC 232.627): o foro no STJ subsiste após o afastamento do cargo, com incidência imediata nos feitos em curso.', ['jur_1789607138535_tb494c']),
 'jur_1789701172276_a0p553': (M, {}, 'Superado o in dubio pro societate na pronúncia: não basta inquérito nem testemunho de ouvir dizer.', []),
 'jur_1789603469051_sdfuwn': (M, {'causa': 'lei'}, 'Com o art. 85, § 18, do CPC, superada a Súmula 453/STJ: cabe ação autônoma para fixar e cobrar honorários omitidos em decisão transitada em julgado.', ['jur_1791738937663_gg7pk5']),
 'jur_1789072708852_by6ljl': (M, {'causa': 'lei'}, 'A Lei 14.454/2022 superou a taxatividade do rol da ANS (EREsps 1.886.929 e 1.889.704) e se aplica de imediato a tratamentos contínuos.', []),
 'jur_1786071019250_dql7pu': (M, {'causa': 'lei'}, 'Antes, a jurisprudência dispensava a CND na recuperação judicial; após a Lei 14.112/2020, o STJ passou a exigi-la (ou a CPEN) para homologar o plano.', []),
 'jur_1791753692688_m2nhyx': (S, {'causa': 'lei'}, 'SUPERADO: com o art. 400, parágrafo único, do CPC/2015, o STJ passou a admitir multa cominatória na exibição de documentos (Tema 1.000).', ['jur_1791738937631_draq8y']),
 # ── Superados por lei ou por novo precedente ──
 'jur_1789374383893_jmrmgk': (S, {'causa': 'lei', 'data': '2023'}, 'Superado pela EC 131/2023: a aquisição voluntária de outra nacionalidade não acarreta mais, por si só, a perda da nacionalidade brasileira.', []),
 'jur_1788889756492_dwq25b': (S, {'causa': 'lei', 'data': '2026-05'}, 'Superado pela EC 139/2026, que alterou os arts. 31, § 1º, e 75 da CF: hoje é vedada a extinção dos Tribunais de Contas dos Municípios.', []),
 'jur_1793053336474_kqdrxk': (S, {'causa': 'lei'}, 'Superado pela Lei 13.491/2017: crimes da legislação comum praticados nas hipóteses do art. 9º do CPM passaram a ser militares.', []),
 'jur_1790221818145_f3t0y3': (S, {'data': '2025-12-04'}, 'Superado pelo CC 215.970-PR (3ª Seção, Info 881): constar da lista de espécies ameaçadas não basta para a competência federal; exige-se transnacionalidade ou ofensa direta a interesse da União.', []),
 'jur_1791718798503_xf7iar': (S, {'data': '2025-03-12'}, 'Superado em parte: o item 2 (perpetuação só a partir das alegações finais) caiu com o HC 232.627; o item 1 (crime no cargo e em razão dele) continua válido.', ['jur_1789607138535_tb494c']),
 'jur_1786377815002_7gehr2': (S, {'causa': 'lei', 'data': '2023'}, 'Superado pela Lei 14.562/2023: adulterar placa de reboque ou semirreboque passou a ser crime (art. 311 do CP).', []),
 'jur_1789423966904_hrip78': (S, {'causa': 'lei', 'data': '2026'}, 'Vale só para fatos anteriores: a Lei 15.353/2026 (novo § 4º-A do art. 217-A do CP) vedou relativizar a presunção de vulnerabilidade.', []),
 'jur_1789930334089_ce0z24': (S, {'causa': 'lei', 'data': '2024-04-11'}, 'Parcialmente superada pela Lei 14.843/2024: o exame criminológico passou a ser obrigatório na progressão de regime.', []),
 'jur_1789129952319_3heysd': (S, {'causa': 'lei', 'data': '2024'}, 'Superado pela Lei 14.939/2024: sem comprovação do feriado local na interposição, o tribunal manda corrigir o vício; a Corte Especial aplicou a regra inclusive a recursos anteriores.', []),
 'jur_1788223823979_3io0lk': (D, {'situacao': 'resolvida'}, 'Divergência resolvida pelo Tema 1.249/STJ: medidas protetivas são tutela inibitória autônoma, como sustentava a 6ª Turma.', ['jur_1788223823979_4zhp22']),
 # ── Súmulas canceladas ou superadas ──
 'jur_1791738937481_t8q1ys': (S, {'data': '2020-10-28'}, 'Cancelada pela 1ª Seção (Pet 12.344/DF) depois que o STF validou os juros compensatórios de 6% ao ano na ADI 2.332.', []),
 'jur_1791738937484_s02c1w': (S, {}, 'Superada: com o CC/2002, a desapropriação indireta prescreve, em regra, em 10 anos (Tema 1.019).', ['jur_1788804204908_kf6xbe']),
 'jur_1790005944061_flw27c': (S, {}, 'Superada em parte (Tema 1.073): só se aplica a situações anteriores a 12/01/2000 (MP 1.997-34).', []),
 'jur_1790005944061_s51d30': (S, {}, 'Superada em parte (Tema 1.073): só se aplica a situações anteriores a 12/01/2000.', []),
 'jur_1790005944061_c95ofj': (S, {}, 'Superada em parte (Tema 1.073): após a MP 1.997-34, juros compensatórios e moratórios não incidem simultaneamente.', []),
 'jur_1791738937520_bgme88': (S, {'data': '2018-08-22'}, 'Cancelada pela 2ª Seção: o STJ passou a admitir o desconto em conta-corrente autorizado pelo correntista.', []),
 'jur_1791738937527_izzif2': (S, {'data': '2018-04-25'}, 'Cancelada e substituída pela Súmula 610/STJ: o suicídio nos dois primeiros anos do contrato não é coberto, premeditado ou não.', []),
 'jur_1791738937530_gw6cfr': (S, {'causa': 'lei'}, 'Superada pelo critério objetivo de dois anos do art. 798 do CC/2002 (Súmula 610/STJ).', []),
 'jur_1791738937556_opw247': (S, {}, 'Superada: o STF (ARE 709.212, Tema 608) fixou prescrição quinquenal para o FGTS.', ['jur_1790158157526_ku0yqz']),
 'jur_1789948782334_asnh5x': (S, {'causa': 'lei'}, 'Superada em parte: a disponibilidade é remunerada proporcionalmente ao tempo de serviço (art. 41, § 3º, da CF), e não com todos os vencimentos.', []),
 'jur_1789948867949_uyehah': (S, {'causa': 'lei'}, 'Superada em parte: pelo CDC, só a culpa exclusiva do correntista afasta a responsabilidade do banco; a concorrente, não.', []),
 'jur_1791738937573_wl5bgv': (S, {}, 'Superada: a sanção do Chefe do Executivo não convalida o vício de iniciativa.', []),
 'jur_1791738937579_37jnvs': (S, {'data': '2018-04-11'}, 'Cancelada e substituída pela Súmula 608/STJ: o CDC não se aplica aos planos de autogestão.', []),
 'jur_1791738937589_tyhffz': (S, {}, 'Cancelada: a vedação passou ao art. 170-A do CTN e ao art. 7º, § 2º, da Lei 12.016/2009, mas o STF declarou inconstitucional a vedação em mandado de segurança (ADI 4.296).', []),
 'jur_1791738937595_kkv9us': (S, {'data': '2021-06-24'}, 'Cancelada na ADPF 357: o concurso de preferência entre entes públicos não foi recepcionado pela CF/88.', ['jur_1788518776065_4ywk5w']),
 'jur_1791738937599_at4cf8': (S, {'data': '2021-06-24'}, 'Superada pela ADPF 357/STF: não há preferência das autarquias federais sobre a Fazenda estadual.', ['jur_1788518776065_4ywk5w']),
 'jur_1791738937425_ttqbna': (S, {}, 'Cancelada pela 3ª Seção (Pet 11.796) depois do HC 118.533/STF: o tráfico privilegiado não é hediondo, como diz hoje o art. 112, § 5º, da LEP.', []),
 'jur_1791738937618_yjgndc': (S, {'data': '2002-10-24'}, 'Cancelada pela 3ª Seção: a arma de brinquedo não autoriza o aumento de pena do roubo.', []),
 'jur_1791738937434_yxj29j': (S, {'causa': 'lei'}, 'Superada pela reforma de 1984, que admite a continuidade específica nos crimes dolosos com violência ou grave ameaça (art. 71, parágrafo único, do CP).', []),
 'jur_1791165771979_7b97ch': (S, {'data': '2024-11-13'}, 'Cancelada pela 1ª Seção (Info 835): após a EC 45/2004, a contribuição sindical é da competência da Justiça do Trabalho.', []),
 'jur_1791738937631_draq8y': (S, {'causa': 'lei'}, 'Superada pelo art. 400, parágrafo único, do CPC/2015: cabe multa cominatória na exibição de documentos (Tema 1.000).', ['jur_1791753692688_m2nhyx']),
 'jur_1791738937650_ggir8d': (S, {}, 'Cancelada pela Corte Especial e substituída pela Súmula 579/STJ: não é preciso ratificar o REsp interposto antes dos embargos de declaração que não alteraram o julgado.', []),
 'jur_1791738937559_5q1ncf': (S, {}, 'Cancelada: o STF (Tema 1.002) reconheceu honorários à Defensoria inclusive contra o ente ao qual pertence.', ['jur_1789594933814_0cpt5e']),
 'jur_1791738937663_gg7pk5': (S, {'causa': 'lei'}, 'Superada pelo art. 85, § 18, do CPC: os honorários omitidos podem ser cobrados em ação autônoma.', ['jur_1789603469051_sdfuwn']),
 'jur_1791738937386_dh8ob6': (S, {'data': '2000-11-08'}, 'Cancelada pela 3ª Seção: em regra, crime contra a fauna é da Justiça Estadual.', []),
 'jur_1791738937615_xweg60': (S, {'data': '2022-02-25'}, 'Cancelada pela 3ª Seção: a competência é do juízo federal do local de destino da droga.', ['jur_1786379843114_3nb319']),
 'jur_1791738937680_6vo9af': (S, {}, 'Cancelada no Inq 687 QO (1999). Em 2025, no HC 232.627, o STF voltou a admitir que o foro subsiste após a saída do cargo para crimes funcionais.', ['jur_1789607138535_tb494c']),
 'jur_1790005701958_0xzhzr': (S, {'causa': 'lei'}, 'Superada em parte pelo CPC/2015: o juiz pode declarar de ofício a ineficácia da cláusula abusiva de eleição de foro (art. 63, § 3º).', []),
 'jur_1790005701958_63zlzb': (S, {'causa': 'lei'}, 'No processo civil, superada pelo fim dos embargos infringentes no CPC/2015; segue aplicável no processo penal.', []),
 # ── Divergências vivas ──
 'jur_1793297833108_oem6rf': (D, {'situacao': 'viva'}, 'Divergência entre Turmas do STF sobre o alcance da modulação do Tema 395 para quintos reconhecidos administrativamente e não pagos (2ª Turma, RE 1.393.330 AgR).', []),
 'jur_1788565527682_fywp4e': (D, {'situacao': 'viva'}, '1ª x 2ª Turma do STJ: cabe ou não pedido de dano moral coletivo na ação de improbidade após a Lei 14.230/2021.', []),
 'jur_1790985682257_jr6rej': (D, {'situacao': 'viva'}, '1ª Turma veda converter a demolição em APP em indenização; a 2ª Turma admite excepcionalmente (AgInt no AREsp 2.110.631-SC).', ['jur_1789585566092_rs0w6p']),
 'jur_1789585566092_rs0w6p': (D, {'situacao': 'viva'}, '2ª Turma admite, excepcionalmente, converter a demolição em APP em indenização; a 1ª Turma veda (AgInt no REsp 2.154.598-CE).', ['jur_1790985682257_jr6rej']),
 'jur_1791068077931_yv5c20': (D, {'situacao': 'viva'}, '3ª Turma dispensa intimar o devedor do leilão extrajudicial de bem móvel; a 4ª Turma exige (AgInt no REsp 2.076.261-AP).', ['jur_1791068077931_5nohjk']),
 'jur_1791068077931_5nohjk': (D, {'situacao': 'viva'}, '4ª Turma exige a intimação prévia do devedor sobre o leilão; a 3ª Turma dispensa para bens móveis (REsp 2.163.612-PR).', ['jur_1791068077931_yv5c20']),
 'jur_1791068077931_rwl0mh': (D, {'situacao': 'viva'}, '4ª Turma nega aplicar a Súmula 308 por analogia à alienação fiduciária; a 3ª Turma admite (REsp 1.576.164-DF).', ['jur_1791759694750_x3nral']),
 'jur_1791759694750_x3nral': (D, {'situacao': 'viva'}, '3ª Turma aplica a Súmula 308 por analogia à alienação fiduciária; a 4ª Turma divergiu em 2025 (REsp 2.130.141-RS).', ['jur_1791068077931_rwl0mh']),
 'jur_1791073903438_fsqn3x': (D, {'situacao': 'viva'}, '1ª Turma admite, excepcionalmente, multa da Lei 9.847/1999 abaixo do mínimo legal; a 2ª Turma não admite.', []),
 'jur_1788223823979_v0q3b0': (D, {'situacao': 'viva'}, '5ª Turma vê bis in idem na agravante do art. 61, II, "f", do CP sobre o crime do art. 24-A da LMP; a 6ª Turma aplica o Tema 1.197 e admite.', []),
 'jur_1789478261234_vslgaj': (D, {'situacao': 'viva'}, 'Celular no trabalho externo: para a 6ª Turma, só é falta grave se houver vedação judicial expressa; para a 5ª, é falta grave de todo modo.', []),
 'jur_1790221824137_oiiq6t': (D, {'situacao': 'viva'}, 'Multa não paga: para a 6ª Turma, ser assistido pela Defensoria reforça a presunção de hipossuficiência; a 5ª Turma exige prova concreta de renda.', []),
 'jur_1786069261020_t5pnq8': (D, {'situacao': 'viva'}, 'STJ x STF: para o STJ, o depositário judicial do faturamento que não deposita comete apropriação indébita; para a 2ª Turma do STF, não (SV 25).', []),
 'jur_1792429932416_mpn14j': (D, {'situacao': 'viva'}, 'Preparo na execução de honorários: a 3ª Turma dispensa o advogado de adiantar; a 4ª Turma exige (art. 82, § 3º, do CPC).', []),
 'jur_1786067848889_f5wfui': (D, {'situacao': 'viva'}, 'Estabilização da tutela antecedente: para a 1ª Turma, só o agravo a impede; para a 3ª e a 4ª Turmas, basta a contestação.', []),
 'jur_1791073098028_36g79q': (D, {'situacao': 'viva'}, 'Para a 5ª Turma, os desembargadores que receberam a denúncia ficam impedidos de julgar a apelação após a perda do foro; a 6ª Turma afasta o impedimento.', []),
 # ── Divergências resolvidas ──
 'jur_1790981180557_mzs65u': (D, {'situacao': 'resolvida'}, 'A 1ª Seção resolveu a divergência entre as Turmas: multa administrativa segue a norma da data da infração; a mais benéfica só retroage com previsão legal.', []),
 'jur_1786328524372_r3n80a': (D, {'situacao': 'resolvida'}, 'A Corte Especial pacificou, em repetitivo, a antiga divergência: a SELIC é a taxa do art. 406 do CC, inclusive antes da Lei 14.905/2024.', []),
 'jur_1786066368871_wldxd2': (D, {'situacao': 'resolvida'}, 'Uniformizando a divergência entre Turmas, o STJ reconheceu a responsabilidade objetiva da igreja por abuso sexual praticado por padre.', []),
 'jur_1786379843114_zfv0y5': (D, {'situacao': 'resolvida'}, 'A 3ª Seção pacificou a divergência entre a 5ª e a 6ª Turmas: plantio de Cannabis para fins medicinais não é crime; cabe salvo-conduto.', []),
 'jur_1786379843114_v370zp': (D, {'situacao': 'resolvida'}, 'A 3ª Seção resolveu a divergência e superou o REsp 1.985.297: quantidade e natureza da droga podem modular a fração do § 4º, se não usadas na 1ª fase.', []),
 'jur_1789603469051_jv7wwu': (D, {'situacao': 'resolvida'}, 'A Corte Especial resolveu a divergência entre as Turmas de Direito Privado: cabem honorários na rejeição do IDPJ.', []),
 'jur_1791761276344_9k2j5m': (D, {'situacao': 'resolvida'}, 'O Plenário do STF pacificou tema controvertido: a fuga para dentro do imóvel ao ver a polícia configura fundadas razões (Tema 280); o STJ passou a seguir.', ['jur_1786070484362_0g3kju']),
}

def main():
    arquivos = sorted(glob.glob('dados/jurisprudencia/*.json'))
    dados = {f: json.load(open(f, encoding='utf-8')) for f in arquivos}
    por_sufixo = {}
    for f, d in dados.items():
        for lst in d.values():
            for x in lst:
                por_sufixo[x['id']] = x
    faltam = [s for s in CURADORIA if s not in por_sufixo]
    for s, (_, _, _, ver) in CURADORIA.items():
        faltam += [v for v in ver if v not in por_sufixo]
    if faltam:
        sys.exit('ids não encontrados: ' + ', '.join(faltam))
    n = 0
    for f, d in dados.items():
        mudou = False
        for lst in d.values():
            for x in lst:
                s = x['id']
                antes = x.get('mudanca')
                if s in CURADORIA:
                    tipo, extra, resumo, ver = CURADORIA[s]
                    novo = {'tipo': tipo}
                    novo.update(extra)
                    novo['resumo'] = resumo
                    if ver: novo['ver'] = [por_sufixo[v]['id'] for v in ver]
                    x['mudanca'] = novo; n += 1
                elif 'mudanca' in x:
                    del x['mudanca']
                if x.get('mudanca') != antes: mudou = True
        if mudou:
            with open(f, 'w', encoding='utf-8') as fh:
                json.dump(d, fh, ensure_ascii=False, indent=2)
    print(f'{n} fichas com `mudanca`')

if __name__ == '__main__':
    main()
