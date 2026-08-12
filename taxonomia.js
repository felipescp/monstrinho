const TAXONOMIA_DADOS = {
  "taxonomia_concursos": [
    {
      "id": "civil",
      "nivel_1": "Direito Civil",
      "divisoes": [
        {
          "id": "civil_lindb_teoria",
          "nivel_2": "Introdução ao Direito Civil e LINDB",
          "topicos": [
            {
              "id": "civil_lindb",
              "nivel_3": "Lei de Introdução às Normas do Direito Brasileiro",
              "aliases": [
                "LINDB",
                "Aplicação da Lei",
                "Integração"
              ]
            },
            {
              "id": "civil_sistema_cc",
              "nivel_3": "Sistema do Código Civil e Princípios Gerais do Direito",
              "aliases": [
                "Unidade Sistemática",
                "Pluralidade de Fontes",
                "Codificação e Constitucionalização"
              ]
            },
            {
              "id": "civil_dir_subjetivo",
              "nivel_3": "Direito Subjetivo, Direito Potestativo e Faculdade Jurídica",
              "aliases": [
                "Direitos Imprescritíveis",
                "Relação e Situações Jurídicas",
                "Situações Existenciais e Patrimoniais"
              ]
            },
            {
              "id": "civil_lindb_intro",
              "nivel_3": "Conceito, Princípios e Constitucionalização do Direito Civil",
              "aliases": [
                "eficácia horizontal dos direitos fundamentais"
              ]
            },
            {
              "id": "civil_lindb_regras",
              "nivel_3": "Vigência, Aplicação da Lei, Hermenêutica e Conflitos",
              "aliases": [
                "vacatio legis",
                "repristinação",
                "lacunas",
                "segurança jurídica e eficiência (arts. 20 a 30 da lindb)",
                "rjet (lei 14.010/20)"
              ]
            }
          ]
        },
        {
          "id": "civil_pessoas",
          "nivel_2": "Parte Geral: Das Pessoas",
          "topicos": [
            {
              "id": "civil_pes_naturais",
              "nivel_3": "Pessoas Naturais (Personalidade, Capacidade e Nome)",
              "aliases": [
                "Direitos de Personalidade",
                "Liberdade, Autonomia e Novas Tecnologias",
                "emancipação",
                "nascituro"
              ]
            },
            {
              "id": "civil_pes_ausencia",
              "nivel_3": "Ausência e Domicílio",
              "aliases": []
            },
            {
              "id": "civil_pes_juridicas",
              "nivel_3": "Pessoas Jurídicas e Desconsideração da Personalidade",
              "aliases": [
                "Teorias da Desconsideração da Personalidade Jurídica",
                "associações",
                "fundações",
                "desvio de finalidade"
              ]
            },
            {
              "id": "civil_pes_direitos",
              "nivel_3": "Direitos da Personalidade e Ausência",
              "aliases": [
                "imagem",
                "privacidade",
                "sucessão provisória"
              ]
            }
          ]
        },
        {
          "id": "civil_bens",
          "nivel_2": "Parte Geral: Dos Bens",
          "topicos": [
            {
              "id": "civil_bens_classificacao",
              "nivel_3": "Classificação dos Bens Considerados em Si Mesmos",
              "aliases": [
                "Móveis e Imóveis",
                "Fungíveis e Consumíveis",
                "Divisíveis",
                "Singulares e Coletivos"
              ]
            },
            {
              "id": "civil_bens_reciprocos",
              "nivel_3": "Bens Reciprocamente Considerados",
              "aliases": [
                "Principais e Acessórios",
                "Benfeitorias e Classificação"
              ]
            },
            {
              "id": "civil_bens_publicos",
              "nivel_3": "Bens Públicos",
              "aliases": [
                "Distinção dos Particulares"
              ]
            },
            {
              "id": "civil_bens_class",
              "nivel_3": "Classificação e Bens Públicos vs. Privados",
              "aliases": [
                "bens móveis",
                "bens imóveis",
                "pertenças",
                "benfeitorias"
              ]
            },
            {
              "id": "civil_bens_imateriais",
              "nivel_3": "Bens Imateriais e Direitos Autorais (Lei 9.610/98)",
              "aliases": [
                "contrafação",
                "direitos patrimoniais e morais do autor",
                "domínio público"
              ]
            }
          ]
        },
        {
          "id": "civil_fatos_juridicos",
          "nivel_2": "Parte Geral: Fatos Jurídicos",
          "topicos": [
            {
              "id": "civil_fj_negocio_juridico",
              "nivel_3": "Teoria Geral do Negócio Jurídico e Atos Lícitos",
              "aliases": [
                "Pressupostos e Elementos de Existência",
                "Requisitos de Validade",
                "Inexistência, Invalidade e Ineficácia",
                "Interpretação e Prova"
              ]
            },
            {
              "id": "civil_fj_defeitos",
              "nivel_3": "Defeitos dos Atos e Negócios Jurídicos",
              "aliases": [
                "Erro",
                "Dolo",
                "Coação",
                "Estado de Perigo",
                "Lesão",
                "Fraude Contra Credores",
                "Simulação"
              ]
            },
            {
              "id": "civil_fj_nulidades",
              "nivel_3": "Invalidade do Negócio Jurídico (Nulidade e Anulabilidade)",
              "aliases": [
                "Negócio Nulo e Anulável",
                "Convalidação"
              ]
            },
            {
              "id": "civil_fj_ilicitos",
              "nivel_3": "Atos Ilícitos",
              "aliases": [
                "Requisitos de Configuração",
                "Excludentes do Ato Ilícito"
              ]
            },
            {
              "id": "civil_fj_prescricao_decadencia",
              "nivel_3": "Prescrição e Decadência",
              "aliases": [
                "Interrupção e Suspensão",
                "Termo Legal",
                "Prazos de Prescrição e Decadência",
                "Renúncia e Exceção"
              ]
            },
            {
              "id": "civil_fj_usura",
              "nivel_3": "Lei da Usura",
              "aliases": [
                "Decreto nº 22.626/1933"
              ]
            },
            {
              "id": "civil_fat_negocio",
              "nivel_3": "Negócio Jurídico (Requisitos, Elementos Acidentais)",
              "aliases": [
                "condição",
                "termo",
                "encargo"
              ]
            },
            {
              "id": "civil_fat_defeitos",
              "nivel_3": "Defeitos do Negócio Jurídico (Erro, Dolo, Coação, etc.)",
              "aliases": [
                "estado de perigo",
                "lesão",
                "fraude contra credores"
              ]
            },
            {
              "id": "civil_fat_ilicitos",
              "nivel_3": "Atos Ilícitos",
              "aliases": [
                "prazos prescricionais",
                "causas suspensivas"
              ]
            }
          ]
        },
        {
          "id": "civil_obrigacoes_atos_unilaterais",
          "nivel_2": "Direito das Obrigações e Atos Unilaterais",
          "topicos": [
            {
              "id": "civil_obrig_modalidades",
              "nivel_3": "Modalidades das Obrigações",
              "aliases": [
                "Obrigações de Dar, Fazer e Não Fazer",
                "Alternativas",
                "Divisíveis e Indivisíveis",
                "Solidariedade Ativa e Passiva"
              ]
            },
            {
              "id": "civil_obrig_transmissao",
              "nivel_3": "Transmissão das Obrigações",
              "aliases": []
            },
            {
              "id": "civil_obrig_adimplemento",
              "nivel_3": "Adimplemento, Inadimplemento e Extinção",
              "aliases": [
                "Mora"
              ]
            }
          ]
        },
        {
          "id": "civil_contratos",
          "nivel_2": "Dos Contratos",
          "topicos": [
            {
              "id": "civil_cont_teoria_geral",
              "nivel_3": "Teoria Geral dos Contratos e Formação",
              "aliases": [
                "Autonomia da Vontade",
                "Função Social do Contrato",
                "Intervenção do Estado",
                "Teoria da Boa-Fé Objetiva"
              ]
            },
            {
              "id": "civil_cont_extincao_revisao",
              "nivel_3": "Revisão e Extinção do Contrato",
              "aliases": [
                "Distrato",
                "Cláusula Resolutiva",
                "Exceção do Contrato Não Cumprido",
                "Teoria da Imprevisão e Onerosidade Excessiva",
                "Teoria da Base do Negócio Jurídico"
              ]
            },
            {
              "id": "civil_cont_classificacao",
              "nivel_3": "Classificação dos Contratos e Regras Especiais",
              "aliases": [
                "Estipulação em Favor de Terceiro",
                "Promessa de Fato de Terceiro",
                "Vícios Redibitórios e Evicção",
                "Contratos Aleatórios",
                "Contrato Preliminar",
                "Contrato com Pessoa a Declarar/Nomear"
              ]
            },
            {
              "id": "civil_cont_especie",
              "nivel_3": "Contratos em Espécie (Típicos e Atípicos)",
              "aliases": [
                "Compra e Venda",
                "Troca ou Permuta",
                "Contrato Estimatório",
                "Doação",
                "Locação de Coisas",
                "Fiança",
                "Empréstimo (Comodato e Mútuo)",
                "Prestação de Serviço",
                "Empreitada",
                "Depósito",
                "Mandato",
                "Comissão, Agência, Distribuição e Corretagem",
                "Transporte",
                "Seguro e Constituição de Renda",
                "Transação"
              ]
            },
            {
              "id": "civil_cont_agrarios",
              "nivel_3": "Contratos Agrários",
              "aliases": [
                "Parceria e Arrendamento"
              ]
            },
            {
              "id": "civil_cont_liberdade_economica",
              "nivel_3": "Lei de Liberdade Econômica",
              "aliases": [
                "Lei nº 13.874/2019"
              ]
            }
          ]
        },
        {
          "id": "civil_responsabilidade",
          "nivel_2": "Responsabilidade Civil",
          "topicos": [
            {
              "id": "civil_resp_obrigacao",
              "nivel_3": "Responsabilidade Civil e Obrigação de Indenizar",
              "aliases": [
                "Novo Direito de Danos",
                "Imputação e Nexo Causal"
              ]
            },
            {
              "id": "civil_resp_teoria",
              "nivel_3": "Teorias, Elementos (Conduta, Dano, Nexo Causal)",
              "aliases": [
                "responsabilidade objetiva",
                "responsabilidade subjetiva",
                "dano moral",
                "perda de uma chance"
              ]
            },
            {
              "id": "civil_resp_indeniz",
              "nivel_3": "Indenização, Excludentes e Responsabilidade por Fato de Terceiro/Coisa",
              "aliases": [
                "fato exclusivo da vítima",
                "caso fortuito",
                "ruína de edifício"
              ]
            }
          ]
        },
        {
          "id": "civil_reais",
          "nivel_2": "Direito das Coisas (Reais)",
          "topicos": [
            {
              "id": "civil_reais_posse",
              "nivel_3": "Posse (Teorias, Classificação, Efeitos e Proteção)",
              "aliases": [
                "Conceito e Classificação",
                "Detenção",
                "Aquisição, Efeitos e Perda",
                "Composse",
                "Proteção Possessória e Desforço Próprio",
                "Exceptio Proprietatis",
                "jus possessionis",
                "frutos",
                "benfeitorias"
              ]
            },
            {
              "id": "civil_reais_propriedade",
              "nivel_3": "Propriedade, Aquisição (Usucapião, Registro) e Perda",
              "aliases": [
                "Função Social",
                "Aquisição Originária e Derivada",
                "Tradição",
                "Perda da Propriedade",
                "Direitos de Vizinhança",
                "acessão",
                "descoberta",
                "função social da propriedade"
              ]
            },
            {
              "id": "civil_reais_usucapiao",
              "nivel_3": "Usucapião",
              "aliases": [
                "Espécies e Requisitos"
              ]
            },
            {
              "id": "civil_reais_alheias",
              "nivel_3": "Direitos Reais sobre Coisas Alheias (Superfície, Servidão, Usufruto)",
              "aliases": [
                "Superfície",
                "Servidões",
                "Usufruto",
                "Uso e Habitação",
                "Direito do Promitente Comprador",
                "uso",
                "habitação",
                "direito de laje"
              ]
            },
            {
              "id": "civil_reais_garantia",
              "nivel_3": "Direitos Reais de Garantia (Penhor, Hipoteca, Alienação Fiduciária)",
              "aliases": [
                "Penhor",
                "Hipoteca",
                "Anticrese",
                "Alienação Fiduciária",
                "propriedade fiduciária",
                "sistema de financiamento imobiliário e alienação fiduciária (lei 9.514/97)"
              ]
            },
            {
              "id": "civil_reais_vizinhanca",
              "nivel_3": "Direitos de Vizinhança e Condomínio (Geral e Edilício)",
              "aliases": [
                "passagem forçada",
                "árvores limítrofes",
                "multipropriedade",
                "condomínio em multipropriedade",
                "fundo de investimento",
                "incorporações imobiliárias (lei 4.591/64)"
              ]
            },
            {
              "id": "civil_reais_promitente",
              "nivel_3": "Direito do Promitente Comprador (Adjudicação Compulsória)",
              "aliases": []
            }
          ]
        },
        {
          "id": "civil_familia",
          "nivel_2": "Direito de Família",
          "topicos": [
            {
              "id": "civil_fam_casamento",
              "nivel_3": "Casamento, União Estável, Dissolução",
              "aliases": [
                "Formas, Pressupostos e Capacidade",
                "Impedimentos e Causas Suspensivas",
                "Celebração, Provas, Nulidade e Eficácia",
                "Dissolução da Sociedade Conjugal",
                "Separação e Divórcio",
                "regime de bens",
                "divórcio",
                "separação",
                "concubinato"
              ]
            },
            {
              "id": "civil_fam_uniao_estavel",
              "nivel_3": "União Estável, Concubinato e União Homoafetiva",
              "aliases": [
                "Conceito, Condições e Impedimentos",
                "Regime Patrimonial"
              ]
            },
            {
              "id": "civil_fam_parentesco",
              "nivel_3": "Relação de Parentesco e Filiação",
              "aliases": [
                "Reconhecimento de Filhos e Adoção",
                "Poder Familiar",
                "Investigação de Paternidade",
                "Bases Socioafetivas e Posse de Estado de Filho",
                "Descendência Genética"
              ]
            },
            {
              "id": "civil_fam_guarda_tutela",
              "nivel_3": "Guarda, Tutela e Curatela",
              "aliases": [
                "Guarda Compartilhada (Lei nº 13.058/2014)",
                "Direito Protetivo"
              ]
            },
            {
              "id": "civil_fam_patrimonial",
              "nivel_3": "Direitos Patrimoniais e Alimentos",
              "aliases": [
                "Regimes de Bens no Casamento",
                "Usufruto e Administração dos Bens dos Filhos",
                "Alimentos (Pressupostos e Critérios)",
                "Bem de Família"
              ]
            },
            {
              "id": "civil_fam_violencia",
              "nivel_3": "Medidas Protetivas à Violência Doméstica",
              "aliases": [
                "Lei nº 11.340/2006 (Lei Maria da Penha)"
              ]
            },
            {
              "id": "civil_fam_filiacao",
              "nivel_3": "Filiação, Reconhecimento e Adoção",
              "aliases": [
                "multiparentalidade",
                "socioafetividade",
                "investigação de paternidade",
                "lei de investigação de paternidade (lei 8.560/92)"
              ]
            },
            {
              "id": "civil_fam_alimentos",
              "nivel_3": "Poder Familiar, Guarda, Alimentos e Bem de Família",
              "aliases": [
                "guarda compartilhada",
                "alienação parental",
                "impenhorabilidade",
                "alimentos gravídicos (lei 11.804/08)"
              ]
            },
            {
              "id": "civil_fam_tutela",
              "nivel_3": "Tutela, Curatela e Tomada de Decisão Apoiada",
              "aliases": [
                "incapacidade",
                "estatuto da pessoa com deficiência (reflexos civis)"
              ]
            }
          ]
        },
        {
          "id": "civil_sucessoes",
          "nivel_2": "Direito das Sucessões",
          "topicos": [
            {
              "id": "civil_suc_geral",
              "nivel_3": "Sucessão em Geral e Vocação Hereditária",
              "aliases": [
                "Herança e Administração",
                "Aceitação, Renúncia e Exclusão",
                "Herança Jacente e Petição de Herança",
                "Disposições Transitórias (Arts. 2.028 a 2.046 do CC)"
              ]
            },
            {
              "id": "civil_suc_legitima",
              "nivel_3": "Sucessão Legítima",
              "aliases": [
                "Ordem de Vocação Hereditária",
                "Herdeiros Necessários",
                "Direito de Representação",
                "ordem de vocação"
              ]
            },
            {
              "id": "civil_suc_testamentaria",
              "nivel_3": "Sucessão Testamentária",
              "aliases": [
                "Testamentos (Público, Cerrado, Particular e Especiais)",
                "Codicilo e Legados",
                "Direito de Acrescer e Substituições",
                "Deserdação e Redução",
                "Revogação e Rompimento"
              ]
            },
            {
              "id": "civil_suc_inventario",
              "nivel_3": "Inventário e Partilha",
              "aliases": [
                "Sonegados",
                "Pagamento de Dívidas",
                "Colação de Bens",
                "Garantia dos Quinhões e Anulação"
              ]
            },
            {
              "id": "civil_obrig_mod",
              "nivel_3": "Modalidades das Obrigações (Dar, Fazer, Solidariedade)",
              "aliases": [
                "obrigações alternativas",
                "divisibilidade"
              ]
            },
            {
              "id": "civil_obrig_transm",
              "nivel_3": "Transmissão (Cessão de Crédito e Assunção de Dívida)",
              "aliases": [
                "cessão de posição contratual"
              ]
            },
            {
              "id": "civil_obrig_adimp",
              "nivel_3": "Adimplemento, Extinção, Pagamento e Mora",
              "aliases": [
                "lugar do pagamento",
                "dação",
                "novação",
                "compensação",
                "pagamento com sub-rogação",
                "imputação do pagamento"
              ]
            },
            {
              "id": "civil_obrig_inadimp",
              "nivel_3": "Inadimplemento, Cláusula Penal e Arras",
              "aliases": [
                "perdas e danos",
                "juros de mora"
              ]
            },
            {
              "id": "civil_suc_jacente",
              "nivel_3": "Herança Jacente e Vacante",
              "aliases": []
            },
            {
              "id": "civil_suc_partilha",
              "nivel_3": "Inventário, Partilha, Colação e Sonegados",
              "aliases": [
                "pagamento de dívidas",
                "garantia dos quinhões"
              ]
            }
          ],
          "aliases": [
            "Direito das Obrigações"
          ]
        },
        {
          "id": "civil_registros_publicos",
          "nivel_2": "Registros Públicos",
          "topicos": [
            {
              "id": "civil_reg_6015",
              "nivel_3": "Registros Públicos (Lei nº 6.015/1973 e Provimento CNJ nº 149/2023)",
              "aliases": [
                "Registro de Imóveis e Averbações",
                "Registro de Títulos e Documentos",
                "Registro Civil das Pessoas Naturais"
              ]
            },
            {
              "id": "civil_reg_notariais",
              "nivel_3": "Serviços Notariais e Registros (Lei nº 8.935/1994)",
              "aliases": [
                "Tabelionatos de Notas e de Protestos Cambiais",
                "Natureza dos Serviços e Fé Pública"
              ]
            },
            {
              "id": "civil_reg_serp",
              "nivel_3": "Sistema Eletrônico dos Registros Públicos",
              "aliases": [
                "Lei nº 14.382/2022"
              ]
            },
            {
              "id": "civil_reg_publicos",
              "nivel_3": "Lei 6.015/73 (Registro de Imóveis, Pessoas Naturais e Jurídicas)",
              "aliases": [
                "averbação",
                "retificação de registro",
                "dúvida registral"
              ]
            }
          ]
        },
        {
          "id": "civil_legislacao_especial",
          "nivel_2": "Legislação Civil Especial",
          "topicos": [
            {
              "id": "civil_esp_imobiliario",
              "nivel_3": "Legislação Imobiliária e Financeira",
              "aliases": [
                "Alienação Fiduciária (Decreto-Lei nº 911/1969 e Lei nº 9.514/1997)",
                "Condomínio e Incorporações (Lei nº 4.591/1964)",
                "Lei nº 10.931/2004",
                "Parcelamento do Solo Urbano (Lei nº 6.766/1979)"
              ]
            },
            {
              "id": "civil_esp_locacao",
              "nivel_3": "Locação de Imóveis Urbanos",
              "aliases": [
                "Lei nº 8.245/1991"
              ]
            },
            {
              "id": "civil_esp_estatutos",
              "nivel_3": "Estatutos e Proteção de Vulneráveis",
              "aliases": [
                "Estatuto da Pessoa Idosa (Lei nº 10.741/2003)",
                "Estatuto da Pessoa com Deficiência (Lei nº 13.146/2015)"
              ]
            },
            {
              "id": "civil_esp_tecnologia",
              "nivel_3": "Direitos Digitais e Novas Tecnologias",
              "aliases": [
                "Lei Geral de Proteção de Dados - LGPD (Lei nº 13.709/2018)",
                "Marco Civil da Internet (Lei nº 12.965/2014)",
                "Resolução CNJ nº 452/2022"
              ]
            },
            {
              "id": "civil_esp_rjet",
              "nivel_3": "Regime Jurídico Emergencial e Transitório",
              "aliases": [
                "RJET (Lei nº 14.010/2020)"
              ]
            }
          ]
        },
        {
          "id": "civil_atos_unilaterais",
          "nivel_2": "Atos Unilaterais",
          "topicos": [
            {
              "id": "civil_au_especies",
              "nivel_3": "Promessa de Recompensa, Gestão de Negócios, Pagamento Indevido e Enriquecimento Sem Causa",
              "aliases": []
            }
          ],
          "aliases": [
            "Promessa de Recompensa",
            "Gestão de Negócios",
            "Pagamento Indevido",
            "Enriquecimento Sem Causa",
            "Atos Unilaterais"
          ]
        },
        {
          "id": "civil_contratos_geral",
          "nivel_2": "Contratos em Geral",
          "topicos": [
            {
              "id": "civil_cont_teoria",
              "nivel_3": "Teoria Geral, Princípios, Formação e Extinção",
              "aliases": [
                "boa-fé objetiva",
                "função social",
                "resolução por onerosidade",
                "exceção do contrato não cumprido"
              ]
            },
            {
              "id": "civil_cont_fase",
              "nivel_3": "Fase Pré-Contratual e Contrato Preliminar",
              "aliases": []
            },
            {
              "id": "civil_cont_efeitos",
              "nivel_3": "Efeitos dos Contratos e Relatividade",
              "aliases": [
                "estipulação em favor de terceiro",
                "promessa de fato de terceiro",
                "contrato com pessoa a declarar"
              ]
            },
            {
              "id": "civil_cont_vicios",
              "nivel_3": "Vícios Redibitórios e Evicção",
              "aliases": [
                "garantias contratuais"
              ]
            },
            {
              "id": "civil_esp_venda",
              "nivel_3": "Compra e Venda, Doação, Empréstimo (Mútuo/Comodato)",
              "aliases": [
                "troca",
                "pacto de retrovenda",
                "venda a contento"
              ]
            },
            {
              "id": "civil_esp_servicos",
              "nivel_3": "Locação, Prestação de Serviços, Empreitada e Fiança",
              "aliases": [
                "mandato",
                "transação"
              ]
            },
            {
              "id": "civil_esp_estimatorio",
              "nivel_3": "Contrato Estimatório, Corretagem e Comissão",
              "aliases": []
            },
            {
              "id": "civil_esp_transporte",
              "nivel_3": "Transporte, Seguro e Jogo e Aposta",
              "aliases": []
            }
          ],
          "aliases": [
            "Contratos em Espécie"
          ]
        }
      ]
    },
    {
      "id": "proc_civil",
      "nivel_1": "Direito Processual Civil",
      "divisoes": [
        {
          "id": "pc_fundamentos",
          "nivel_2": "Normas Fundamentais, Jurisdição e Ação",
          "topicos": [
            {
              "id": "pc_fund_normas",
              "nivel_3": "Normas Processuais Fundamentais e Aplicação da Lei",
              "aliases": [
                "Boa-fé, eficiência e colaboração",
                "Meios adequados de resolução de conflitos",
                "Conciliação, Mediação e Arbitragem",
                "princípios processuais",
                "boa-fé processual",
                "condições da ação",
                "direito intertemporal",
                "processo estrutural",
                "Normas Fundamentais, Jurisdição e Ação"
              ]
            },
            {
              "id": "pc_fund_jurisdicao",
              "nivel_3": "Jurisdição e Competência",
              "aliases": [
                "Incompetência absoluta e relativa",
                "Modificação da competência",
                "Cooperação nacional e internacional"
              ]
            },
            {
              "id": "pc_fund_acao_processo",
              "nivel_3": "Ação e Processo",
              "aliases": [
                "Condições da ação",
                "Pressupostos processuais",
                "Elementos da demanda"
              ]
            },
            {
              "id": "pc_fund_comp",
              "nivel_3": "Competência (Fixação, Modificação e Conflitos)",
              "aliases": [
                "competência relativa",
                "competência absoluta",
                "foro de eleição"
              ]
            },
            {
              "id": "pc_fund_cooperacao",
              "nivel_3": "Limites da Jurisdição e Cooperação Internacional",
              "aliases": [
                "homologação de decisão estrangeira",
                "carta rogatória",
                "auxílio direto"
              ]
            },
            {
              "id": "pc_fund_masc",
              "nivel_3": "Meios Adequados de Solução de Conflitos (MASC)",
              "aliases": [
                "arbitragem (lei 9.307/96)",
                "mediação (lei 13.140/15)",
                "cláusula compromissória",
                "confidencialidade"
              ]
            }
          ],
          "aliases": [
            "Parte Geral: Fundamentos e Competência"
          ]
        },
        {
          "id": "pc_sujeitos",
          "nivel_2": "Sujeitos do Processo",
          "topicos": [
            {
              "id": "pc_suj_partes",
              "nivel_3": "Partes, Procuradores e Gratuidade da Justiça",
              "aliases": [
                "Capacidade processual",
                "Deveres processuais e litigância de má-fé",
                "Honorários de sucumbência e despesas",
                "Sucessão e substituição",
                "deveres das partes",
                "honorários de sucumbência",
                "sucessão processual"
              ]
            },
            {
              "id": "pc_suj_litis_terceiros",
              "nivel_3": "Litisconsórcio e Intervenção de Terceiros",
              "aliases": [
                "Assistência",
                "Denunciação da lide",
                "Chamamento ao processo",
                "Incidente de desconsideração da personalidade jurídica (IDPJ)",
                "Amicus Curiae"
              ]
            },
            {
              "id": "pc_suj_juiz_aux",
              "nivel_3": "Juiz e Auxiliares da Justiça",
              "aliases": [
                "Poderes, deveres e responsabilidades do Juiz",
                "Impedimento e suspeição",
                "Perito e Oficial de Justiça"
              ]
            },
            {
              "id": "pc_suj_funcoes_essenciais",
              "nivel_3": "Funções Essenciais à Administração da Justiça",
              "aliases": [
                "Ministério Público",
                "Advocacia Pública",
                "Defensoria Pública"
              ]
            },
            {
              "id": "pc_suj_atores",
              "nivel_3": "Juiz, MP, Advocacia Pública e Defensoria Pública",
              "aliases": [
                "impedimento",
                "suspeição",
                "poderes do juiz",
                "prerrogativas da fazenda pública",
                "prazo em dobro"
              ]
            }
          ],
          "aliases": [
            "Parte Geral: Sujeitos do Processo"
          ]
        },
        {
          "id": "pc_atos",
          "nivel_2": "Atos Processuais",
          "topicos": [
            {
              "id": "pc_atos_teoria",
              "nivel_3": "Teoria dos Atos e Negócios Processuais: Forma, Tempo, Prazos e Nulidades",
              "aliases": [
                "Forma, tempo e lugar",
                "Negócio jurídico processual",
                "Processo eletrônico",
                "Valor da causa",
                "preclusão",
                "negócios jurídicos processuais"
              ]
            },
            {
              "id": "pc_atos_comunicacao",
              "nivel_3": "Comunicação dos Atos Processuais",
              "aliases": [
                "Citação e intimação",
                "Citação real e ficta",
                "Cartas precatória e rogatória"
              ]
            },
            {
              "id": "pc_atos_prazos",
              "nivel_3": "Prazos Processuais e Preclusão",
              "aliases": [
                "Preclusão temporal, lógica e consumativa"
              ]
            },
            {
              "id": "pc_atos_nulidades",
              "nivel_3": "Invalidades e Nulidades Processuais",
              "aliases": [
                "Mera irregularidade, anulabilidade e nulidade",
                "Vícios sanáveis e insanáveis"
              ]
            },
            {
              "id": "pc_atos_comunic",
              "nivel_3": "Comunicação dos Atos (Citação e Intimação)",
              "aliases": [
                "citação eletrônica",
                "citação por edital",
                "cartas"
              ]
            },
            {
              "id": "pc_atos_extincao",
              "nivel_3": "Formação, Suspensão e Extinção do Processo",
              "aliases": [
                "litispendência",
                "abandono de causa",
                "desistência da ação"
              ]
            }
          ],
          "aliases": [
            "Parte Geral: Atos Processuais"
          ]
        },
        {
          "id": "pc_tutelas",
          "nivel_2": "Tutelas Provisórias",
          "topicos": [
            {
              "id": "pc_tutela_urgencia",
              "nivel_3": "Tutela de Urgência (Antecipada e Cautelar)",
              "aliases": [
                "Requisitos e procedimentalização",
                "Estabilização da tutela antecipada antecedente",
                "Tutela inibitória e remoção do ilícito"
              ]
            },
            {
              "id": "pc_tutela_evidencia",
              "nivel_3": "Tutela de Evidência",
              "aliases": [
                "Cabimento e requisitos"
              ]
            }
          ],
          "aliases": [
            "Tutela Provisória"
          ]
        },
        {
          "id": "pc_procedimento_comum",
          "nivel_2": "Procedimento Comum",
          "topicos": [
            {
              "id": "pc_comum_peticao",
              "nivel_3": "Petição Inicial e Formação do Processo",
              "aliases": [
                "Requisitos, emenda e aditamento",
                "Inépcia e indeferimento",
                "Improcedência liminar do pedido"
              ]
            },
            {
              "id": "pc_comum_resposta",
              "nivel_3": "Resposta do Réu e Revelia",
              "aliases": [
                "Contestação",
                "Reconvenção",
                "Impugnação ao valor da causa",
                "Teoria da asserção"
              ]
            },
            {
              "id": "pc_comum_saneamento",
              "nivel_3": "Providências Preliminares e Saneamento",
              "aliases": [
                "Julgamento conforme o estado do processo",
                "Julgamento antecipado do mérito",
                "Saneamento e organização do processo"
              ]
            },
            {
              "id": "pc_comum_provas",
              "nivel_3": "Provas e Audiência de Instrução e Julgamento",
              "aliases": [
                "Teoria geral e ônus da prova",
                "Distribuição estática e dinâmica",
                "Provas típicas e atípicas",
                "Prova ilícita",
                "Valoração e standards de prova"
              ]
            },
            {
              "id": "pc_comum_sentenca",
              "nivel_3": "Sentença e Coisa Julgada",
              "aliases": [
                "Elementos e fundamentação analítica",
                "Remessa obrigatória",
                "Eficácias da coisa julgada e relativização",
                "Liquidação de sentença"
              ]
            },
            {
              "id": "pc_comum_cumprimento",
              "nivel_3": "Cumprimento de Sentença",
              "aliases": [
                "Obrigação de pagar quantia certa",
                "Obrigação de fazer, não fazer e entregar coisa",
                "Prestações de alimentos",
                "Cumprimento contra a Fazenda Pública",
                "Impugnação"
              ]
            }
          ]
        },
        {
          "id": "pc_especiais",
          "nivel_2": "Procedimentos Especiais",
          "topicos": [
            {
              "id": "pc_esp_contenciosos",
              "nivel_3": "Procedimentos de Jurisdição Contenciosa",
              "aliases": [
                "Ação de consignação em pagamento",
                "Ação de exigir contas",
                "Ações possessórias",
                "Inventário e partilha",
                "Ações de família",
                "Embargos de terceiro",
                "Ação monitória",
                "Dissolução parcial de sociedade",
                "consignação em pagamento",
                "exigir contas",
                "ação de divisão e demarcação",
                "Procedimentos Especiais de Jurisdição Contenciosa (Possessórias, Monitória, etc.)"
              ]
            },
            {
              "id": "pc_esp_voluntarios",
              "nivel_3": "Procedimentos de Jurisdição Voluntária",
              "aliases": [
                "Alienação judicial",
                "Divórcio e separação consensuais",
                "Testamentos e codicilos",
                "Interdição e tutela",
                "Herança jacente"
              ]
            },
            {
              "id": "pc_esp_voluntaria",
              "nivel_3": "Procedimentos de Jurisdição Voluntária",
              "aliases": [
                "interdição",
                "divórcio consensual",
                "alvará judicial"
              ]
            }
          ]
        },
        {
          "id": "pc_execucao",
          "nivel_2": "Processo de Execução",
          "topicos": [
            {
              "id": "pc_exec_teoria",
              "nivel_3": "Teoria Geral, Títulos Extrajudiciais e Responsabilidade Patrimonial",
              "aliases": [
                "Requisitos da execução",
                "Responsabilidade patrimonial",
                "Fraude à execução e Fraude contra credores",
                "fraude à execução",
                "fraude contra credores",
                "requisitos do título",
                "execução fiscal (lei 6.830/80)"
              ]
            },
            {
              "id": "pc_exec_especies",
              "nivel_3": "Espécies de Execução e Atos de Expropriação",
              "aliases": [
                "Entrega de coisa",
                "Obrigações de fazer e não fazer",
                "Quantia certa",
                "Contra a Fazenda Pública",
                "Execução de alimentos",
                "Penhora, Adjudicação e Alienação"
              ]
            },
            {
              "id": "pc_exec_defesas",
              "nivel_3": "Defesas, Suspensão e Extinção",
              "aliases": [
                "Embargos à execução",
                "Exceção de pré-executividade",
                "Extinção do processo de execução",
                "efeito suspensivo nos embargos",
                "Defesas do Executado: Defesas, Suspensão e Extinção"
              ]
            },
            {
              "id": "pc_exec_atos",
              "nivel_3": "Penhora, Expropriação de Bens e Satisfação do Crédito",
              "aliases": [
                "adjudicação",
                "alienação",
                "ordem de preferência"
              ]
            },
            {
              "id": "pc_exec_extincao",
              "nivel_3": "Suspensão e Extinção do Processo de Execução",
              "aliases": []
            }
          ],
          "aliases": [
            "Processo de Conhecimento"
          ]
        },
        {
          "id": "pc_tribunais",
          "nivel_2": "Processos nos Tribunais e Recursos",
          "topicos": [
            {
              "id": "pc_trib_acoes_originarias",
              "nivel_3": "Ações Originárias e Incidentes",
              "aliases": [
                "Ação rescisória",
                "Reclamação constitucional",
                "Conflito de competência",
                "Homologação de sentença estrangeira"
              ]
            },
            {
              "id": "pc_trib_precedentes",
              "nivel_3": "Teoria dos Precedentes e Casos Repetitivos",
              "aliases": [
                "Incidente de resolução de demandas repetitivas (IRDR)",
                "Incidente de assunção de competência (IAC)",
                "Ratio decidendi, obiter dictum, distinguishing e overruling",
                "Súmulas vinculantes",
                "incidente de resolução de demandas repetitivas",
                "incidente de assunção de competência",
                "ação rescisória",
                "reclamação constitucional",
                "conflito de competência",
                "súmula vinculante"
              ]
            },
            {
              "id": "pc_trib_recursos_geral",
              "nivel_3": "Teoria Geral dos Recursos",
              "aliases": [
                "Normas fundamentais, classificação e efeitos",
                "Juízo de admissibilidade e de mérito",
                "Sucedâneos recursais"
              ]
            },
            {
              "id": "pc_trib_recursos_especie",
              "nivel_3": "Recursos em Espécie",
              "aliases": [
                "Apelação",
                "Agravo de instrumento e interno",
                "Embargos de declaração e de divergência",
                "Recurso Ordinário, Especial (REsp) e Extraordinário (RE)",
                "Repercussão geral e recursos repetitivos"
              ]
            }
          ],
          "aliases": [
            "Processos nos Tribunais"
          ]
        },
        {
          "id": "pc_provas",
          "nivel_2": "Processo de Conhecimento: Provas",
          "topicos": [
            {
              "id": "pc_prov_teoria",
              "nivel_3": "Teoria Geral da Prova, Ônus e Produção Antecipada",
              "aliases": [
                "distribuição dinâmica do ônus da prova",
                "prova ilícita"
              ]
            },
            {
              "id": "pc_prov_meios",
              "nivel_3": "Meios de Prova em Espécie",
              "aliases": [
                "prova testemunhal",
                "prova pericial",
                "depoimento pessoal",
                "prova documental",
                "ata notarial",
                "prova emprestada"
              ]
            }
          ]
        },
        {
          "id": "pc_coletivo",
          "nivel_2": "Microssistema de Tutela Coletiva e Ações Constitucionais",
          "topicos": [
            {
              "id": "pc_col_teoria",
              "nivel_3": "Teoria Geral do Processo Coletivo",
              "aliases": [
                "direitos difusos, coletivos e individuais homogêneos",
                "coisa julgada secundum eventum litis",
                "fluid recovery (recuperação fluida)",
                "legitimidade ativa e adequação"
              ]
            },
            {
              "id": "pc_col_acp_ap",
              "nivel_3": "Ação Civil Pública e Ação Popular",
              "aliases": [
                "lei 7.347/85",
                "lei 4.717/65",
                "litisconsórcio no processo coletivo",
                "fundo de defesa dos direitos difusos"
              ]
            },
            {
              "id": "pc_col_remedios",
              "nivel_3": "Remédios Constitucionais Processuais",
              "aliases": [
                "mandado de segurança (lei 12.016/09)",
                "mandado de injunção (lei 13.300/16)",
                "habeas data (lei 9.507/97)",
                "reclamação"
              ]
            }
          ]
        },
        {
          "id": "div_1786556855082",
          "nivel_2": "Legislação Processual Civil Especial",
          "topicos": []
        }
      ]
    },
    {
      "id": "consumidor",
      "nivel_1": "Direito do Consumidor",
      "divisoes": [
        {
          "id": "cons_fundamentos_relacao",
          "nivel_2": "Fundamentos e Relação de Consumo",
          "topicos": [
            {
              "id": "cons_fundamentos",
              "nivel_3": "Fundamentos Constitucionais e Infraconstitucionais",
              "aliases": [
                "Campo de Aplicação do CDC"
              ]
            },
            {
              "id": "cons_relacao",
              "nivel_3": "Relação de Consumo",
              "aliases": [
                "Conceitos de Consumidor e Fornecedor",
                "Conceitos de Produto e Serviço",
                "Correntes e Posicionamento do STJ"
              ]
            },
            {
              "id": "cons_principios",
              "nivel_3": "Principiologia e Direitos Básicos no CDC",
              "aliases": [
                "Boa-fé Objetiva",
                "Inversão do Ônus da Prova"
              ]
            },
            {
              "id": "cdc_teo_princ",
              "nivel_3": "Princípios, Direitos Básicos e Conceitos (Consumidor/Fornecedor)",
              "aliases": [
                "teoria finalista, maximalista e finalista mitigada",
                "consumidor equiparado (bystander)",
                "vulnerabilidade",
                "inversão do ônus da prova"
              ]
            },
            {
              "id": "cdc_teo_idpj",
              "nivel_3": "Desconsideração da Personalidade Jurídica no CDC",
              "aliases": [
                "teoria menor",
                "teoria maior",
                "grupos econômicos, sociedades coligadas e consorciadas"
              ]
            },
            {
              "id": "cdc_prat_cobranca",
              "nivel_3": "Cobrança de Dívidas e Cadastro Positivo (Lei nº 12.414/2011)",
              "aliases": [
                "repetição de indébito em dobro",
                "cadastro positivo",
                "spc/serasa"
              ]
            },
            {
              "id": "cdc_prat_super",
              "nivel_3": "Prevenção e Tratamento do Superendividamento (Lei 14.181/21)",
              "aliases": [
                "mínimo existencial",
                "audiência de conciliação global",
                "plano de pagamento"
              ]
            }
          ],
          "aliases": [
            "Teoria Geral e Relação de Consumo",
            "Práticas e Contratos de Consumo"
          ]
        },
        {
          "id": "cons_responsabilidade",
          "nivel_2": "Responsabilidade e Prazos",
          "topicos": [
            {
              "id": "cons_resp_fato_vicio",
              "nivel_3": "Responsabilidade pelo Fato e pelo Vício",
              "aliases": [
                "Fato do Produto e do Serviço",
                "Vício do Produto e do Serviço"
              ]
            },
            {
              "id": "cons_resp_prazos",
              "nivel_3": "Prazos, Garantias, Decadência e Prescrição",
              "aliases": [
                "Garantia Contratual e Legal"
              ]
            },
            {
              "id": "cons_resp_desconsideracao",
              "nivel_3": "Desconsideração da Personalidade Jurídica no CDC",
              "aliases": []
            }
          ]
        },
        {
          "id": "cons_praticas_contratos",
          "nivel_2": "Práticas Comerciais e Proteção Contratual",
          "topicos": [
            {
              "id": "cons_praticas_oferta",
              "nivel_3": "Oferta, Publicidade e Práticas Comerciais Abusivas",
              "aliases": [
                "Cobrança de Dívidas",
                "Cadastros de Inadimplentes"
              ]
            },
            {
              "id": "cons_comercio_eletronico",
              "nivel_3": "Contratação no Comércio Eletrônico",
              "aliases": [
                "Decreto nº 7.962/2013"
              ]
            },
            {
              "id": "cons_protecao_contratual",
              "nivel_3": "Proteção Contratual e Cláusulas Abusivas",
              "aliases": [
                "Contratos de Adesão",
                "Financiamentos",
                "Ações de Revisão de Contrato"
              ]
            }
          ]
        },
        {
          "id": "cons_defesa_sancoes",
          "nivel_2": "Defesa do Consumidor e Sanções",
          "topicos": [
            {
              "id": "cons_defesa_sindec",
              "nivel_3": "Sanções Administrativas e Sistema Nacional de Defesa do Consumidor",
              "aliases": []
            },
            {
              "id": "cons_defesa_juizo",
              "nivel_3": "Defesa dos Direitos do Consumidor em Juízo",
              "aliases": [
                "Ações Coletivas em Matéria de Consumo",
                "Interesses Difusos, Coletivos e Individuais Homogêneos"
              ]
            }
          ]
        },
        {
          "id": "cons_legislacao_especial",
          "nivel_2": "Legislação Especial e Setorial",
          "topicos": [
            {
              "id": "cons_leg_cadastro_positivo",
              "nivel_3": "Lei do Cadastro Positivo",
              "aliases": [
                "Lei nº 12.414/2011",
                "Decreto nº 9.936/2019"
              ]
            },
            {
              "id": "cons_leg_telecom",
              "nivel_3": "Regulamento de Serviços de Telecomunicações",
              "aliases": [
                "Resolução Anatel nº 765/2023"
              ]
            },
            {
              "id": "cons_leg_energia",
              "nivel_3": "Regras de Prestação de Serviço de Energia Elétrica",
              "aliases": [
                "Resolução Normativa Aneel nº 1.000/2021"
              ]
            },
            {
              "id": "cons_leg_saude",
              "nivel_3": "Planos e Seguros Privados de Assistência à Saúde",
              "aliases": [
                "Lei nº 9.656/1998"
              ]
            }
          ]
        },
        {
          "id": "cons_jurisprudencia",
          "nivel_2": "Jurisprudência dos Tribunais Superiores",
          "topicos": [
            {
              "id": "cons_jur_stf_stj",
              "nivel_3": "Jurisprudência, Precedentes e Súmulas do STF e STJ em Matéria de Consumo",
              "aliases": []
            }
          ]
        },
        {
          "id": "cdc_qualidade",
          "nivel_2": "Qualidade de Produtos e Serviços",
          "topicos": [
            {
              "id": "cdc_qual_saude",
              "nivel_3": "Da Proteção à Saúde e Segurança (Arts. 8º a 10)",
              "aliases": [
                "recall",
                "risco inerente vs. risco adquirido"
              ]
            },
            {
              "id": "cdc_qual_fato",
              "nivel_3": "Responsabilidade pelo Fato (Defeito) do Produto/Serviço",
              "aliases": [
                "acidente de consumo",
                "responsabilidade objetiva",
                "excludentes",
                "fortuito interno e externo",
                "risco do desenvolvimento"
              ]
            },
            {
              "id": "cdc_qual_vicio",
              "nivel_3": "Responsabilidade pelo Vício do Produto/Serviço e Prazos",
              "aliases": [
                "vício oculto",
                "vício aparente",
                "decadência",
                "prescrição",
                "garantia legal vs. garantia contratual"
              ]
            }
          ]
        },
        {
          "id": "cdc_sistema",
          "nivel_2": "Sistema de Defesa e Tutela",
          "topicos": [
            {
              "id": "cdc_sist_sndc",
              "nivel_3": "Convenção Coletiva de Consumo e SNDC (Decreto nº 2.181/1997)",
              "aliases": [
                "procon",
                "senacon",
                "termo de ajustamento de conduta (tac)"
              ]
            },
            {
              "id": "cdc_sist_sancoes",
              "nivel_3": "Sanções Administrativas e Infrações Penais de Consumo",
              "aliases": [
                "multa",
                "interdição",
                "crimes contra as relações de consumo"
              ]
            },
            {
              "id": "cdc_sist_tutela",
              "nivel_3": "Defesa em Juízo e Ações Coletivas Consumeristas",
              "aliases": [
                "interesses difusos, coletivos e individuais homogêneos",
                "coisa julgada secundum eventum litis",
                "legitimidade ativa (mp e associações)",
                "reparação fluida (fluid recovery)",
                "danos sociais",
                "desvio produtivo do consumidor (perda do tempo útil)"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "crianca_adolescente",
      "nivel_1": "Direito da Criança e do Adolescente",
      "divisoes": [
        {
          "id": "eca_fundamentos",
          "nivel_2": "Fundamentos e Sistema de Proteção Integral",
          "topicos": [
            {
              "id": "eca_constituicao",
              "nivel_3": "Constituição Federal de 1988",
              "aliases": [
                "Proteção Integral e Prioridade Absoluta",
                "Direitos da Infância e Juventude"
              ]
            },
            {
              "id": "eca_estatuto",
              "nivel_3": "Estatuto da Criança e do Adolescente (ECA)",
              "aliases": [
                "Lei nº 8.069/1990"
              ]
            },
            {
              "id": "eca_primeira_infancia",
              "nivel_3": "Marco Legal da Primeira Infância",
              "aliases": [
                "Lei nº 13.257/2016"
              ]
            }
          ]
        },
        {
          "id": "eca_sistema_garantias",
          "nivel_2": "Sistema de Garantia de Direitos e Assistência Social",
          "topicos": [
            {
              "id": "eca_sgdca",
              "nivel_3": "Sistema de Garantia dos Direitos da Criança e do Adolescente",
              "aliases": [
                "Resoluções Conanda nº 113/2006 e nº 117/2006"
              ]
            },
            {
              "id": "eca_conselho_tutelar",
              "nivel_3": "Conselho Tutelar",
              "aliases": [
                "Resolução Conanda nº 231/2022"
              ]
            },
            {
              "id": "eca_assistencia_social",
              "nivel_3": "Políticas e Normativas de Assistência Social",
              "aliases": [
                "Lei Orgânica da Assistência Social - LOAS (Lei nº 8.742/1993)",
                "Política Nacional de Assistência Social (Resolução CNAS nº 145/2004)",
                "Tipificação Nacional de Serviços Socioassistenciais (Resolução CNAS nº 109/2009)"
              ]
            }
          ]
        },
        {
          "id": "eca_sinase",
          "nivel_2": "Sistema Nacional de Atendimento Socioeducativo (SINASE)",
          "topicos": [
            {
              "id": "eca_sinase_lei",
              "nivel_3": "Lei do SINASE",
              "aliases": [
                "Lei nº 12.594/2012"
              ]
            },
            {
              "id": "eca_sinase_judiciario",
              "nivel_3": "Atendimento Socioeducativo no Judiciário",
              "aliases": [
                "Resolução CNJ nº 165/2012",
                "Resolução Conanda nº 169/2014"
              ]
            }
          ]
        },
        {
          "id": "eca_protecao_violencia",
          "nivel_2": "Prevenção à Violência e Escuta Especializada",
          "topicos": [
            {
              "id": "eca_escuta",
              "nivel_3": "Sistema de Garantia de Direitos da Vítima ou Testemunha de Violência",
              "aliases": [
                "Lei nº 13.431/2017",
                "Decreto nº 9.603/2018",
                "Escuta Especializada e Depoimento Especial"
              ]
            },
            {
              "id": "eca_henry_borel",
              "nivel_3": "Prevenção e Enfrentamento da Violência Doméstica e Familiar (Lei Henry Borel)",
              "aliases": [
                "Lei nº 14.344/2022"
              ]
            }
          ]
        },
        {
          "id": "eca_justica_normativas",
          "nivel_2": "Proteção Judicial, Atos do CNJ e Saúde Mental",
          "topicos": [
            {
              "id": "eca_cnj_viagem",
              "nivel_3": "Autorização de Viagem",
              "aliases": [
                "Resolução CNJ nº 295/2019"
              ]
            },
            {
              "id": "eca_cnj_audiencias",
              "nivel_3": "Audiências Concentradas e Outros Atos Normativos",
              "aliases": [
                "Recomendação CNJ nº 98/2021",
                "Atos Normativos do CNJ"
              ]
            },
            {
              "id": "eca_saude_mental",
              "nivel_3": "Proteção e Direitos de Crianças e Adolescentes com Transtornos Mentais",
              "aliases": [
                "Lei nº 10.216/2001"
              ]
            }
          ]
        },
        {
          "id": "eca_internacional",
          "nivel_2": "Normativa Internacional",
          "topicos": [
            {
              "id": "eca_int_convencoes",
              "nivel_3": "Declarações e Convenções da ONU",
              "aliases": [
                "Declaração Universal dos Direitos da Criança",
                "Convenção das Nações Unidas sobre os Direitos da Criança e do Adolescente"
              ]
            },
            {
              "id": "eca_int_haia",
              "nivel_3": "Convenção de Haia",
              "aliases": [
                "Cooperação em Matéria de Adoção"
              ]
            },
            {
              "id": "eca_int_beijing",
              "nivel_3": "Regras de Beijing",
              "aliases": [
                "Regras Mínimas das Nações Unidas para a Administração da Justiça Juvenil"
              ]
            }
          ]
        },
        {
          "id": "eca_teoria",
          "nivel_2": "Teoria Geral e Direitos Fundamentais",
          "topicos": [
            {
              "id": "eca_teo_princ",
              "nivel_3": "Doutrina da Proteção Integral, Princípios e Direitos Básicos",
              "aliases": [
                "prioridade absoluta",
                "condição peculiar de pessoa em desenvolvimento"
              ]
            },
            {
              "id": "eca_teo_direitos_vida",
              "nivel_3": "Direito à Vida, à Saúde, à Liberdade, ao Respeito e à Dignidade",
              "aliases": [
                "primeira infância (lei nº 13.257/16)",
                "gestante e parturiente",
                "vacinação",
                "internação psiquiátrica",
                "lei menino bernardo (castigo físico)"
              ]
            },
            {
              "id": "eca_teo_direitos_edu",
              "nivel_3": "Direito à Educação, Cultura, Esporte, Lazer e Profissionalização",
              "aliases": [
                "vagas em creche e pré-escola",
                "educação inclusiva",
                "trabalho infantil",
                "menor aprendiz"
              ]
            }
          ]
        },
        {
          "id": "eca_convivencia",
          "nivel_2": "Convivência Familiar e Comunitária",
          "topicos": [
            {
              "id": "eca_conv_guarda",
              "nivel_3": "Guarda, Tutela e Adoção",
              "aliases": [
                "adoção internacional",
                "cadastro nacional de adoção",
                "família substituta",
                "família extensa",
                "adoção póstuma",
                "adoção intuitu personae",
                "adoção por divorciados",
                "adoção de criança indígena",
                "estágio de convivência"
              ]
            },
            {
              "id": "eca_conv_poder",
              "nivel_3": "Perda/Suspensão do Poder Familiar e Acolhimento (Institucional/Familiar)",
              "aliases": [
                "destituição do poder familiar",
                "entrega voluntária",
                "apadrinhamento",
                "audiências concentradas"
              ]
            }
          ]
        },
        {
          "id": "eca_prevencao",
          "nivel_2": "Prevenção e Rede de Proteção",
          "topicos": [
            {
              "id": "eca_prev_entidades",
              "nivel_3": "Entidades de Atendimento e Conselho Tutelar",
              "aliases": [
                "atribuições do conselho tutelar",
                "escolha dos conselheiros",
                "fiscalização das entidades",
                "resoluções do conanda",
                "cras / creas / loas"
              ]
            },
            {
              "id": "eca_prev_viagens",
              "nivel_3": "Autorização para Viagens e Sistema de Garantia de Direitos",
              "aliases": [
                "acesso a diversões e espetáculos",
                "hospedagem"
              ]
            }
          ]
        },
        {
          "id": "eca_protecao",
          "nivel_2": "Medidas de Proteção",
          "topicos": [
            {
              "id": "eca_prot_medidas",
              "nivel_3": "Hipóteses de Aplicação e Medidas Específicas",
              "aliases": [
                "requisição de tratamento médico",
                "inclusão em programa oficial"
              ]
            }
          ]
        },
        {
          "id": "eca_infracional",
          "nivel_2": "Ato Infracional e Socioeducação",
          "topicos": [
            {
              "id": "eca_inf_direitos",
              "nivel_3": "Direitos Individuais e Apuração do Ato Infracional",
              "aliases": [
                "apreensão em flagrante",
                "garantias processuais",
                "internação provisória",
                "oitiva informal",
                "súmulas do stj sobre atos infracionais"
              ]
            },
            {
              "id": "eca_inf_medidas",
              "nivel_3": "Medidas Socioeducativas e Remissão",
              "aliases": [
                "advertência",
                "liberdade assistida",
                "prestação de serviços à comunidade",
                "internação",
                "remissão cumulada",
                "internação-sanção",
                "prescrição"
              ]
            },
            {
              "id": "eca_inf_sinase",
              "nivel_3": "Execução das Medidas Socioeducativas (SINASE - Lei 12.594/12)",
              "aliases": [
                "plano individual de atendimento (pia)",
                "unificação de medidas",
                "reavaliação",
                "maioridade superveniente",
                "progressão e regressão de medida",
                "pnaisari"
              ]
            }
          ]
        },
        {
          "id": "eca_justica",
          "nivel_2": "Justiça da Infância e Infrações",
          "topicos": [
            {
              "id": "eca_jus_proc",
              "nivel_3": "Competência, Procedimentos e Recursos no ECA",
              "aliases": [
                "procedimento de apuração de irregularidade em entidade",
                "apelação no eca",
                "prazos recursais (10 dias)",
                "efeitos dos recursos"
              ]
            },
            {
              "id": "eca_jus_escuta",
              "nivel_3": "Sistema de Garantia de Direitos de Menores Vítimas (Lei nº 13.431/17)",
              "aliases": [
                "escuta especializada",
                "depoimento especial",
                "revitimização"
              ]
            },
            {
              "id": "eca_jus_tutela",
              "nivel_3": "Tutela Coletiva e Atuação do Ministério Público",
              "aliases": [
                "ação civil pública no eca",
                "multas administrativas"
              ]
            },
            {
              "id": "eca_jus_crimes",
              "nivel_3": "Crimes e Infrações Administrativas previstos no ECA",
              "aliases": [
                "corrupção de menores",
                "venda de bebida alcoólica",
                "multa administrativa"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "penal",
      "nivel_1": "Direito Penal",
      "divisoes": [
        {
          "id": "penal_lei",
          "nivel_2": "Parte Geral: Teoria da Lei Penal",
          "topicos": [
            {
              "id": "penal_lei_tempo",
              "nivel_3": "Lei Penal no Tempo e no Espaço (Territorialidade)",
              "aliases": [
                "Novatio Legis",
                "Abolitio Criminis e Irretroatividade",
                "extraterritorialidade"
              ]
            },
            {
              "id": "top_1779236024381",
              "nivel_3": "Princípios Penais",
              "aliases": [
                "Legalidade",
                "Intervenção Mínima e Insignificância"
              ]
            },
            {
              "id": "top_1779236030436",
              "nivel_3": "Conflito Aparente de Normas",
              "aliases": [
                "Especialidade",
                "Subsidiariedade",
                "Consunção"
              ]
            },
            {
              "id": "top_1779236060268",
              "nivel_3": "Lei Penal no Espaço",
              "aliases": [
                "Territorialidade e Extraterritorialidade"
              ]
            },
            {
              "id": "penal_lei_princ",
              "nivel_3": "Princípios, Interpretação e Conflito de Normas",
              "aliases": [
                "legalidade",
                "insignificância",
                "especialidade"
              ]
            }
          ]
        },
        {
          "id": "penal_crime",
          "nivel_2": "Parte Geral: Teoria do Crime",
          "topicos": [
            {
              "id": "penal_crime_fato",
              "nivel_3": "Fato Típico (Resultado, Nexo Causal e Teoria da Imputação Objetiva)",
              "aliases": [
                "dolo",
                "culpa",
                "omissão",
                "imputação objetiva"
              ]
            },
            {
              "id": "penal_crime_iter",
              "nivel_3": "Iter Criminis (Consumação, Tentativa e Desistências)",
              "aliases": [
                "Arrependimento Eficaz",
                "Crime Impossível",
                "Iter Criminis: Consumação, Tentativa e Desistências"
              ]
            },
            {
              "id": "penal_crime_culpabilidade",
              "nivel_3": "Culpabilidade e Causas de Exclusão (Imputabilidade)",
              "aliases": [
                "Potencial Consciência da Ilicitude",
                "Inexigibilidade de Conduta"
              ]
            },
            {
              "id": "penal_crime_erro",
              "nivel_3": "Teoria do Erro (Erro de Tipo e Erro de Proibição)",
              "aliases": [
                "Descriminantes Putativas",
                "Erro na Execução"
              ]
            },
            {
              "id": "penal_crime_concurso",
              "nivel_3": "Concurso de Pessoas (Autoria e Participação)",
              "aliases": [
                "Coautoria",
                "Domínio do Fato"
              ]
            },
            {
              "id": "top_1779236098180",
              "nivel_3": "Fato Típico (Conduta)",
              "aliases": [
                "Dolo",
                "Culpa e Preterdolo"
              ]
            },
            {
              "id": "top_1779236142204",
              "nivel_3": "Fato Típico (Tipicidade Formal e Conglobante)"
            },
            {
              "id": "top_1779236202996",
              "nivel_3": "Excludentes de Ilicitude (Estrito Cumprimento do Dever e Exercício Regular de Direito)"
            },
            {
              "id": "top_1779236289914",
              "nivel_3": "Excludentes de Ilicitude (Legítima Defesa e Estado de Necessidade)"
            },
            {
              "id": "penal_crime_ilicitude",
              "nivel_3": "Ilicitude (Antijuridicidade) e Causas de Exclusão",
              "aliases": [
                "legítima defesa",
                "estado de necessidade"
              ]
            }
          ]
        },
        {
          "id": "penal_pena",
          "nivel_2": "Parte Geral: Teoria da Pena",
          "topicos": [
            {
              "id": "penal_pena_especies",
              "nivel_3": "Penas em Espécie e Regimes de Cumprimento",
              "aliases": [
                "PPL",
                "PRD",
                "Multa"
              ]
            },
            {
              "id": "penal_pena_sursis",
              "nivel_3": "Suspensão (Sursis), Livramento e Efeitos da Condenação",
              "aliases": [
                "Confisco",
                "Reabilitação"
              ]
            },
            {
              "id": "penal_pena_medida",
              "nivel_3": "Medidas de Segurança",
              "aliases": [
                "Internação",
                "Tratamento Ambulatorial"
              ]
            },
            {
              "id": "top_1779236332386",
              "nivel_3": "Dosimetria (Circunstâncias Judiciais)"
            },
            {
              "id": "top_1779236349075",
              "nivel_3": "Dosimetria (Agravantes/Atenuantes)"
            },
            {
              "id": "top_1779236362482",
              "nivel_3": "Dosimetria (Causas de Aumento)"
            },
            {
              "id": "top_1779236393569",
              "nivel_3": "Concurso de Crimes"
            },
            {
              "id": "top_1779236404865",
              "nivel_3": "Penas Restritivas de Direito (PRD) e Substituição"
            },
            {
              "id": "top_1779236427801",
              "nivel_3": "Regimes de Cumprimento de Pena"
            },
            {
              "id": "top_1779236446833",
              "nivel_3": "Efeitos da Condenação"
            },
            {
              "id": "penal_pena_dosimetria",
              "nivel_3": "Dosimetria, Limites e Concurso de Crimes",
              "aliases": [
                "agravantes",
                "concurso material e formal"
              ]
            }
          ]
        },
        {
          "id": "penal_punibilidade",
          "nivel_2": "Parte Geral: Punibilidade",
          "topicos": [
            {
              "id": "penal_pun_extincao",
              "nivel_3": "Extinção da Punibilidade e Escusas Absolutórias",
              "aliases": [
                "Anistia",
                "Graça",
                "Indulto",
                "Perdão"
              ]
            },
            {
              "id": "penal_pun_prescricao",
              "nivel_3": "Prescrição e Decadência",
              "aliases": [
                "Prescrição da Pretensão Punitiva",
                "Causas Interruptivas"
              ]
            }
          ]
        },
        {
          "id": "penal_pe_pessoa",
          "nivel_2": "Parte Especial: Crimes contra a Pessoa",
          "topicos": [
            {
              "id": "top_1779240455769",
              "nivel_3": "Lesões Corporais"
            },
            {
              "id": "top_1779240456697",
              "nivel_3": "Crimes contra a Honra"
            },
            {
              "id": "top_1779240457337",
              "nivel_3": "Crimes contra a Liberdade"
            },
            {
              "id": "top_1779240488376",
              "nivel_3": "Crimes contra a Vida"
            },
            {
              "id": "penal_pe_vida",
              "nivel_3": "Crimes contra a Vida (Homicídio, Aborto, Infanticídio)",
              "aliases": [
                "feminicídio",
                "induzimento ao suicídio"
              ]
            },
            {
              "id": "penal_pe_lesoes",
              "nivel_3": "Lesões Corporais, Honra, Liberdade e Periclitação",
              "aliases": [
                "calúnia",
                "sequestro",
                "ameaça"
              ]
            }
          ]
        },
        {
          "id": "penal_pe_patrimonio",
          "nivel_2": "Parte Especial: Patrimônio e Propriedade Imaterial",
          "topicos": [
            {
              "id": "penal_pe_pat_estelionato",
              "nivel_3": "Apropriação Indébita, Estelionato e Receptação",
              "aliases": [
                "Dano",
                "Fraude"
              ]
            },
            {
              "id": "penal_pe_pat_imaterial",
              "nivel_3": "Crimes contra a Propriedade Imaterial (Direitos Autorais)",
              "aliases": [
                "Pirataria",
                "Patentes"
              ]
            },
            {
              "id": "top_1779236472145",
              "nivel_3": "Furto",
              "aliases": [
                "Simples",
                "Qualificado e de Coisa Comum"
              ]
            },
            {
              "id": "top_1779236480185",
              "nivel_3": "Roubo",
              "aliases": [
                "Próprio",
                "Impróprio e Majorado"
              ]
            },
            {
              "id": "top_1779236489225",
              "nivel_3": "Extorsão e Extorsão Mediante Sequestro"
            },
            {
              "id": "penal_pe_pat_furto",
              "nivel_3": "Furto, Roubo e Extorsão",
              "aliases": [
                "latrocínio",
                "extorsão mediante sequestro"
              ]
            }
          ]
        },
        {
          "id": "penal_pe_dignidade",
          "nivel_2": "Parte Especial: Dignidade Sexual e Família",
          "topicos": [
            {
              "id": "penal_pe_dig_estupro",
              "nivel_3": "Estupro, Assédio e Corrupção de Menores",
              "aliases": [
                "Estupro de Vulnerável",
                "Importunação Sexual"
              ]
            },
            {
              "id": "penal_pe_dig_prost",
              "nivel_3": "Favorecimento da Prostituição e Ultraje Público",
              "aliases": [
                "Rufianismo",
                "Ato Obsceno"
              ]
            },
            {
              "id": "penal_pe_dig_familia",
              "nivel_3": "Crimes contra a Família (Casamento, Filiação e Assistência)",
              "aliases": [
                "Bigamia",
                "Abandono Material"
              ]
            }
          ]
        },
        {
          "id": "penal_pe_adm_estado",
          "nivel_2": "Parte Especial: Administração Pública",
          "topicos": [
            {
              "id": "penal_pe_adm_func",
              "nivel_3": "Crimes praticados por Funcionário Público",
              "aliases": [
                "Peculato",
                "Corrupção Passiva",
                "Prevaricação"
              ]
            },
            {
              "id": "penal_pe_adm_part",
              "nivel_3": "Crimes de Particular e contra a Administração da Justiça",
              "aliases": [
                "Corrupção Ativa",
                "Falso Testemunho",
                "Desacato"
              ]
            },
            {
              "id": "top_1779236600728",
              "nivel_3": "Corrupção Passiva e Prevaricação"
            },
            {
              "id": "top_1779236618064",
              "nivel_3": "Peculato e Concussão"
            },
            {
              "id": "penal_pe_adm_demo",
              "nivel_3": "Crimes contra o Estado Democrático de Direito (Título XII)",
              "aliases": [
                "golpe de estado",
                "abolição violenta"
              ]
            }
          ],
          "aliases": [
            "Parte Especial: Administração Pública e Estado Democrático"
          ]
        },
        {
          "id": "penal_pe_coletividade",
          "nivel_2": "Parte Especial: Crimes contra a Coletividade",
          "topicos": [
            {
              "id": "penal_pe_col_paz",
              "nivel_3": "Incolumidade, Paz Pública e Sentimento Religioso",
              "aliases": [
                "Incêndio",
                "Associação Criminosa",
                "Vilipêndio"
              ]
            },
            {
              "id": "penal_pe_col_fe",
              "nivel_3": "Crimes contra a Fé Pública (Falsidades e Moeda Falsa)",
              "aliases": [
                "Falsidade Ideológica",
                "Uso de Documento Falso"
              ]
            },
            {
              "id": "penal_pe_col_trab",
              "nivel_3": "Crimes contra a Organização do Trabalho",
              "aliases": [
                "Atentado contra Liberdade de Trabalho"
              ]
            }
          ]
        },
        {
          "id": "penal_especial",
          "nivel_2": "Legislação Penal Especial",
          "topicos": [
            {
              "id": "penal_esp_drogas",
              "nivel_3": "Lei de Drogas (Lei 11.343/06)",
              "aliases": [
                "Tráfico",
                "Associação para o Tráfico"
              ]
            },
            {
              "id": "penal_esp_armas",
              "nivel_3": "Desarmamento, Crimes Hediondos e Tortura",
              "aliases": [
                "Estatuto do Desarmamento",
                "Lei 8.072/90"
              ]
            },
            {
              "id": "penal_esp_vulneraveis",
              "nivel_3": "Crimes contra Grupos Vulneráveis (Maria da Penha, Idoso, Racismo, ECA, Henry Borel)",
              "aliases": [
                "Lei 11.340/06",
                "Preconceito e Discriminação (Lei 7.716/89)",
                "Homofobia e Transfobia",
                "Estatuto do Idoso (Crimes)",
                "Lei Henry Borel (Lei 14.344/22)"
              ]
            },
            {
              "id": "penal_esp_contravencoes",
              "nivel_3": "Contravenções Penais e Crimes de Responsabilidade",
              "aliases": [
                "Lei das Contravenções Penais (DL 3.688/41)",
                "Crimes de Prefeitos (DL 201/67)",
                "Vias de Fato",
                "Perturbação do Sossego"
              ]
            },
            {
              "id": "penal_esp_org",
              "nivel_3": "Organização Criminosa (Lei nº 12.850/13)",
              "aliases": [
                "Lei 12.850/13",
                "Delação Premiada",
                "Ocultação de Bens"
              ]
            },
            {
              "id": "penal_esp_transito",
              "nivel_3": "Trânsito, Ambiental e Crimes Econômicos/Tributários",
              "aliases": [
                "CTB",
                "Crimes Ambientais",
                "Sonegação"
              ]
            },
            {
              "id": "penal_esp_abuso",
              "nivel_3": "Abuso de Autoridade (Lei 13.869/19)"
            },
            {
              "id": "top_1786562526771",
              "nivel_3": "Crimes em Licitações e Contratos (Arts. 178 a 183-B do CP / Lei 14.133)"
            },
            {
              "id": "top_1786562541539",
              "nivel_3": "Lei de Lavagem de Capitais (Lei nº 9.613/98)"
            },
            {
              "id": "top_1786562572910",
              "nivel_3": "Lei Maria da Penha e Henry Borel: Aspectos Penais (Lei nº 11.340/06)"
            },
            {
              "id": "top_1786562659298",
              "nivel_3": "Lei Antiterrorismo"
            },
            {
              "id": "top_1786562723774",
              "nivel_3": "Lei Antifacção (Lei nº 15.358/2026)"
            },
            {
              "id": "top_1786562770290",
              "nivel_3": "Outros"
            }
          ]
        }
      ]
    },
    {
      "id": "proc_penal",
      "nivel_1": "Direito Processual Penal",
      "divisoes": [
        {
          "id": "pp_fundamentos",
          "nivel_2": "Fundamentos e Princípios",
          "topicos": [
            {
              "id": "pp_fund_principios",
              "nivel_3": "Direito Processual Penal à luz da CF e Princípios",
              "aliases": [
                "Sistemas Processuais",
                "Garantias Constitucionais",
                "Juiz das Garantias"
              ]
            },
            {
              "id": "pp_fund_aplicacao",
              "nivel_3": "Interpretação e Aplicação da Norma Processual Penal",
              "aliases": [
                "Lei Processual no Tempo",
                "Lei Processual no Espaço"
              ]
            }
          ]
        },
        {
          "id": "pp_investigacao",
          "nivel_2": "Investigação Criminal",
          "topicos": [
            {
              "id": "pp_inv_inquerito",
              "nivel_3": "Inquérito Policial",
              "aliases": [
                "Características e Prazos",
                "Arquivamento",
                "Valor Probatório"
              ]
            },
            {
              "id": "pp_inv_anpp",
              "nivel_3": "Acordo de Não Persecução Penal (ANPP)",
              "aliases": [
                "Pacote Anticrime"
              ]
            },
            {
              "id": "pp_invest_ip",
              "nivel_3": "Inquérito Policial, ANPP e Outros Procedimentos",
              "aliases": [
                "indiciamento",
                "arquivamento",
                "pic",
                "identificação criminal (lei 12.037/09)",
                "infrações de repercussão interestadual (lei 10.446/02)"
              ]
            }
          ]
        },
        {
          "id": "pp_acao",
          "nivel_2": "Ação Penal e Ação Civil",
          "topicos": [
            {
              "id": "pp_acao_penal",
              "nivel_3": "Ação Penal (Pública e Privada)",
              "aliases": [
                "Denúncia e Queixa",
                "Condições da Ação",
                "Decadência e Perempção"
              ]
            },
            {
              "id": "pp_acao_civil",
              "nivel_3": "Ação Civil Ex Delicto",
              "aliases": [
                "Reparação Civil",
                "Efeitos Civis da Sentença Penal"
              ]
            },
            {
              "id": "pp_acao_especies",
              "nivel_3": "Ação Penal (Pública e Privada) e Reparação Civil",
              "aliases": [
                "denúncia",
                "queixa-crime",
                "decadência",
                "perempção",
                "fixação de valor mínimo para indenização",
                "efeitos civis da sentença penal absolutória"
              ]
            }
          ],
          "aliases": [
            "Ação Penal e Ação Civil Ex Delicto"
          ]
        },
        {
          "id": "pp_jurisdicao",
          "nivel_2": "Jurisdição, Competência e Incidentes",
          "topicos": [
            {
              "id": "pp_jur_competencia",
              "nivel_3": "Competência (Fixação e Modificação)",
              "aliases": [
                "Lugar da Infração e Domicílio",
                "Conexão e Continência",
                "Foro por Prerrogativa de Função",
                "Prevenção"
              ]
            },
            {
              "id": "pp_jur_incidentes",
              "nivel_3": "Questões e Processos Incidentes",
              "aliases": [
                "Exceções",
                "Restituição de Coisas Apreendidas",
                "Medidas Assecuratórias (Sequestro, Arresto)",
                "Incidente de Insanidade Mental",
                "Incidente de Falsidade"
              ]
            },
            {
              "id": "pp_jurisdicao_comp",
              "nivel_3": "Fixação, Modificação (Conexão/Continência) e Conflitos",
              "aliases": [
                "prevenção",
                "foro por prerrogativa"
              ]
            },
            {
              "id": "pp_jurisdicao_incid",
              "nivel_3": "Exceções, Restituição de Coisas Apreendidas e Medidas Assecuratórias",
              "aliases": [
                "sequestro",
                "arresto",
                "incidente de insanidade",
                "questões prejudiciais homogêneas e heterogêneas",
                "incidente de falsidade"
              ]
            }
          ]
        },
        {
          "id": "pp_provas",
          "nivel_2": "Das Provas",
          "topicos": [
            {
              "id": "pp_prov_teoria",
              "nivel_3": "Teoria Geral da Prova e Cadeia de Custódia",
              "aliases": [
                "Ônus da Prova",
                "Provas Ilícitas",
                "Sistemas de Valoração"
              ]
            },
            {
              "id": "pp_prov_meios",
              "nivel_3": "Meios de Prova em Espécie",
              "aliases": [
                "Exame de Corpo de Delito e Perícias",
                "Interrogatório e Confissão",
                "Prova Testemunhal",
                "Reconhecimento de Pessoas e Coisas",
                "Acareação e Documentos"
              ]
            },
            {
              "id": "pp_provas_teoria",
              "nivel_3": "Teoria Geral da Prova, Ônus e Cadeia de Custódia",
              "aliases": [
                "provas ilícitas",
                "sistemas de valoração",
                "standard probatório (além da dúvida razoável / íntima convicção)"
              ]
            },
            {
              "id": "pp_provas_meios",
              "nivel_3": "Meios de Prova (Testemunhal, Pericial, Interrogatório)",
              "aliases": [
                "confissão",
                "reconhecimento",
                "corpo de delito",
                "programa de proteção a testemunhas (lei 9.807/99)"
              ]
            },
            {
              "id": "pp_provas_obtencao",
              "nivel_3": "Meios de Obtenção de Prova (Busca, Interceptação, Colaboração Premiada)",
              "aliases": [
                "quebra de sigilo",
                "infiltração policial"
              ]
            }
          ],
          "aliases": [
            "Provas"
          ]
        },
        {
          "id": "pp_sujeitos",
          "nivel_2": "Sujeitos do Processo",
          "topicos": [
            {
              "id": "pp_suj_atores",
              "nivel_3": "Juiz, MP, Acusado e Defensor",
              "aliases": [
                "Impedimento e Suspeição"
              ]
            },
            {
              "id": "pp_suj_auxiliares",
              "nivel_3": "Assistentes e Auxiliares da Justiça",
              "aliases": [
                "Direitos do Ofendido",
                "Assistente de Acusação"
              ]
            },
            {
              "id": "pp_sujeitos_atores",
              "nivel_3": "Juiz, MP, Acusado, Defensor, Ofendido e Assistente",
              "aliases": [
                "impedimento",
                "suspeição",
                "atribuições",
                "direitos do ofendido (art. 201 do cpp)",
                "competências do juiz das garantias"
              ]
            }
          ]
        },
        {
          "id": "pp_prisoes",
          "nivel_2": "Prisões e Medidas Cautelares",
          "topicos": [
            {
              "id": "pp_pris_flagrante",
              "nivel_3": "Prisão em Flagrante",
              "aliases": [
                "Espécies",
                "Audiência de Custódia"
              ]
            },
            {
              "id": "pp_pris_preventiva",
              "nivel_3": "Prisão Preventiva e Prisão Temporária",
              "aliases": [
                "Requisitos e Prazos"
              ]
            },
            {
              "id": "pp_pris_cautelares",
              "nivel_3": "Medidas Cautelares Diversas e Liberdade Provisória",
              "aliases": [
                "Fiança"
              ]
            },
            {
              "id": "pp_prisoes_prov",
              "nivel_3": "Prisões Provisórias (Flagrante, Preventiva e Temporária)",
              "aliases": [
                "audiência de custódia",
                "requisitos",
                "prisão domiciliar",
                "prisão especial"
              ]
            },
            {
              "id": "pp_prisoes_cautelares",
              "nivel_3": "Medidas Cautelares Diversas da Prisão e Liberdade Provisória",
              "aliases": [
                "fiança",
                "tornozeleira eletrônica",
                "art. 319"
              ]
            }
          ]
        },
        {
          "id": "pp_atos",
          "nivel_2": "Atos Processuais, Citações e Sentença",
          "topicos": [
            {
              "id": "pp_atos_citacoes",
              "nivel_3": "Citações e Intimações",
              "aliases": [
                "Citação por Edital",
                "Suspensão do Processo (Art. 366)"
              ]
            },
            {
              "id": "pp_atos_sentenca",
              "nivel_3": "Sentença e Coisa Julgada",
              "aliases": [
                "Emendatio Libelli",
                "Mutatio Libelli",
                "Absolvição e Condenação",
                "absolvição",
                "efeitos da sentença",
                "Sentença, Coisa Julgada (Emendatio/Mutatio Libelli)"
              ]
            },
            {
              "id": "pp_atos_comunic",
              "nivel_3": "Comunicação dos Atos (Citação, Intimação) e Prazos",
              "aliases": [
                "citação por edital",
                "citação por hora certa",
                "carta rogatória",
                "suspensão do processo e da prescrição (art. 366)"
              ]
            },
            {
              "id": "pp_atos_nulidades",
              "nivel_3": "Teoria das Nulidades no Processo Penal",
              "aliases": [
                "nulidade absoluta",
                "nulidade relativa",
                "prejuízo"
              ]
            }
          ],
          "aliases": [
            "Atos, Prazos e Nulidades"
          ]
        },
        {
          "id": "pp_procedimentos",
          "nivel_2": "Processos Comum e Especiais",
          "topicos": [
            {
              "id": "pp_proc_comum",
              "nivel_3": "Processo Comum (Ordinário e Sumário)",
              "aliases": [
                "transação penal",
                "suspensão condicional do processo",
                "fase postulatória",
                "fase instrutória"
              ]
            },
            {
              "id": "pp_proc_juri",
              "nivel_3": "Tribunal do Júri",
              "aliases": [
                "Fase de Pronúncia",
                "Plenário e Quesitação",
                "pronúncia",
                "impronúncia",
                "plenário",
                "quesitação",
                "Procedimento do Tribunal do Júri"
              ]
            },
            {
              "id": "pp_proc_especiais",
              "nivel_3": "Procedimentos Especiais (Drogas, Funcionário Público, Honra)",
              "aliases": [
                "Competência Originária dos Tribunais",
                "Crimes de Responsabilidade de Funcionário Público",
                "Crimes contra a Honra",
                "ritos especiais",
                "propriedade imaterial"
              ]
            },
            {
              "id": "pp_proc_originaria",
              "nivel_3": "Procedimentos de Competência Originária dos Tribunais",
              "aliases": [
                "lei 8.038/90",
                "foro por prerrogativa de função",
                "ação penal originária",
                "súmula vinculante 45"
              ]
            }
          ],
          "aliases": [
            "Procedimentos em Espécie"
          ]
        },
        {
          "id": "pp_nulidades_recursos",
          "nivel_2": "Nulidades e Recursos",
          "topicos": [
            {
              "id": "pp_nulidades",
              "nivel_3": "Nulidades",
              "aliases": [
                "Princípio do Prejuízo",
                "Nulidade Absoluta e Relativa"
              ]
            },
            {
              "id": "pp_rec_teoria",
              "nivel_3": "Teoria Geral dos Recursos e Ações Autônomas",
              "aliases": [
                "Habeas Corpus",
                "Revisão Criminal",
                "Mandado de Segurança Criminal",
                "juízo de admissibilidade",
                "efeito suspensivo",
                "efeito devolutivo",
                "Teoria Geral dos Recursos e Efeitos"
              ]
            },
            {
              "id": "pp_rec_especie",
              "nivel_3": "Recursos em Espécie",
              "aliases": [
                "Recurso em Sentido Estrito (RESE)",
                "Apelação",
                "Embargos de Declaração",
                "Agravo em Execução",
                "Recursos nos Tribunais Superiores",
                "embargos infringentes",
                "resp",
                "re",
                "Recursos em Espécie (Apelação, RESE, Agravo, Embargos)"
              ]
            },
            {
              "id": "pp_rec_acoes",
              "nivel_3": "Ações Autônomas (Habeas Corpus, Revisão Criminal, Mandado de Segurança)",
              "aliases": [
                "cabimento de hc",
                "requisitos da revisão"
              ]
            }
          ],
          "aliases": [
            "Recursos e Ações de Impugnação"
          ]
        },
        {
          "id": "pp_execucao",
          "nivel_2": "Execução Penal (Lei nº 7.210/1984)",
          "topicos": [
            {
              "id": "pp_exec_direitos",
              "nivel_3": "Direitos, Deveres e Disciplina",
              "aliases": [
                "Faltas Disciplinares",
                "Regime Disciplinar Diferenciado (RDD)"
              ]
            },
            {
              "id": "pp_exec_regimes",
              "nivel_3": "Regimes, Progressão e Regressão",
              "aliases": [
                "Livramento Condicional",
                "Saídas Temporárias"
              ]
            },
            {
              "id": "pp_exec_incidentes",
              "nivel_3": "Incidentes da Execução",
              "aliases": [
                "Remição e Detração",
                "Conversões",
                "Medidas de Segurança"
              ]
            },
            {
              "id": "pp_exec_teoria",
              "nivel_3": "Teoria Geral, Órgãos da Execução e Estabelecimentos Penais",
              "aliases": [
                "juízo da execução",
                "conselho penitenciário"
              ]
            },
            {
              "id": "pp_exec_disc",
              "nivel_3": "Direitos, Deveres e Disciplina (Faltas, RDD e Sanções)",
              "aliases": [
                "falta grave",
                "procedimento disciplinar"
              ]
            },
            {
              "id": "pp_exec_incid",
              "nivel_3": "Incidentes da Execução (Progressão, Regressão, Remição e Detração)",
              "aliases": [
                "agravo em execução",
                "cálculo de pena",
                "trabalho do preso",
                "execução de medida de segurança",
                "exame de cessação de periculosidade",
                "desinternação"
              ]
            },
            {
              "id": "pp_exec_saidas",
              "nivel_3": "Saídas Antecipadas, Livramento Condicional e Anistia/Indulto",
              "aliases": [
                "permissão de saída",
                "saída temporária",
                "indulto natalino"
              ]
            }
          ],
          "aliases": [
            "Execução Penal (Lei 7.210/84)"
          ]
        },
        {
          "id": "pp_legislacao_especial",
          "nivel_2": "Legislação Processual Penal Especial",
          "topicos": [
            {
              "id": "pp_leg_jecrim",
              "nivel_3": "Juizados Especiais Criminais (Lei nº 9.099/1995)",
              "aliases": [
                "Transação Penal",
                "Suspensão Condicional do Processo"
              ]
            },
            {
              "id": "pp_leg_investigacao",
              "nivel_3": "Técnicas de Investigação Especial",
              "aliases": [
                "Interceptação Telefônica (Lei nº 9.296/1996)",
                "Organizações Criminosas (Lei nº 12.850/2013)"
              ]
            },
            {
              "id": "pp_leg_vulneraveis",
              "nivel_3": "Proteção a Vítimas e Vulneráveis",
              "aliases": [
                "Lei Maria da Penha (Lei nº 11.340/2006)",
                "Lei Henry Borel (Lei nº 14.344/2022)",
                "Programa de Proteção (Lei nº 9.807/1999)"
              ]
            },
            {
              "id": "pp_leg_diversas",
              "nivel_3": "Outras Leis Esparsas (Procedimentos)",
              "aliases": [
                "Lei de Drogas (Lei nº 11.343/2006)",
                "Lei dos Crimes Hediondos (Lei nº 8.072/1990)",
                "Crimes de Prefeitos (DL nº 201/1967)",
                "Sequestro de Bens (DL nº 3.240/1941)",
                "Lei de Abuso de Autoridade (Lei nº 13.869/2019)",
                "Código de Trânsito Brasileiro (Lei nº 9.503/1997)",
                "Estatuto do Desarmamento (Lei nº 10.826/2003)"
              ]
            },
            {
              "id": "pp_leg_resolucoes",
              "nivel_3": "Resoluções do CNJ",
              "aliases": [
                "Audiência de Custódia (Resolução nº 213/2015)",
                "Proteção de Dados (Resolução nº 427/2021)",
                "Reconhecimento de Pessoas (Resolução nº 484/2022)"
              ]
            }
          ]
        },
        {
          "id": "pp_teoria",
          "nivel_2": "Princípios e Teoria da Lei Processual",
          "topicos": [
            {
              "id": "pp_teoria_princ",
              "nivel_3": "Princípios e Aplicação da Lei no Tempo e no Espaço",
              "aliases": [
                "sistemas processuais",
                "interpretação"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "constitucional",
      "nivel_1": "Direito Constitucional",
      "divisoes": [
        {
          "id": "const_teoria_poder",
          "nivel_2": "Teoria da Constituição e Poder Constituinte",
          "topicos": [
            {
              "id": "const_teoria_constituicao",
              "nivel_3": "Teoria da Constituição e Estado Democrático de Direito",
              "aliases": [
                "Conceito e classificação",
                "Supremacia da Constituição",
                "Fundamentos constitucionais e princípio da República"
              ]
            },
            {
              "id": "const_interpretacao_aplicabilidade",
              "nivel_3": "Interpretação e Aplicabilidade das Normas",
              "aliases": [
                "Hermenêutica constitucional e mutação",
                "Classificação quanto à eficácia e aplicabilidade"
              ]
            },
            {
              "id": "const_poder_constituinte",
              "nivel_3": "Poder Constituinte e Reforma Constitucional",
              "aliases": [
                "Poder originário e poder derivado",
                "Poder constituinte estadual",
                "Legitimidade e limites",
                "emendas",
                "cláusulas pétreas"
              ]
            },
            {
              "id": "const_teoria_conceito",
              "nivel_3": "Conceito, Classificações e Elementos",
              "aliases": [
                "sentidos da constituição",
                "tipologia"
              ]
            }
          ],
          "aliases": [
            "Teoria da Constituição"
          ]
        },
        {
          "id": "const_direitos_fundamentais",
          "nivel_2": "Direitos e Garantias Fundamentais",
          "topicos": [
            {
              "id": "const_dir_individuais",
              "nivel_3": "Direitos Individuais e Coletivos",
              "aliases": [
                "Direito à vida, privacidade e igualdade",
                "Propriedade e função social",
                "Dignidade da pessoa humana"
              ]
            },
            {
              "id": "const_dir_sociais",
              "nivel_3": "Direitos Sociais",
              "aliases": [
                "Direitos dos trabalhadores"
              ]
            },
            {
              "id": "const_nacionalidade_politicos",
              "nivel_3": "Nacionalidade e Direitos Políticos",
              "aliases": [
                "Direitos dos estrangeiros",
                "Cidadania, voto e elegibilidade",
                "Partidos políticos (Lei nº 9.096/1995)"
              ]
            },
            {
              "id": "const_remedios",
              "nivel_3": "Ações e Remédios Constitucionais",
              "aliases": [
                "Habeas corpus, habeas data e mandado de segurança",
                "Ação civil pública e ação popular",
                "Mandado de injunção"
              ]
            }
          ]
        },
        {
          "id": "const_organizacao_estado",
          "nivel_2": "Organização do Estado",
          "topicos": [
            {
              "id": "const_federacao",
              "nivel_3": "Estrutura Federativa e Repartição de Competências",
              "aliases": [
                "União, Estados, Municípios e DF",
                "Consórcios públicos (Lei nº 11.107/2005)"
              ]
            },
            {
              "id": "const_intervencao",
              "nivel_3": "Intervenção",
              "aliases": [
                "Intervenção federal",
                "Intervenção nos Estados e Municípios"
              ]
            },
            {
              "id": "const_org_estado_comp",
              "nivel_3": "Repartição de Competências e Entes Federados",
              "aliases": [
                "união",
                "estados",
                "municípios"
              ]
            },
            {
              "id": "const_org_estado_interv",
              "nivel_3": "Intervenção Federal e Estadual",
              "aliases": [
                "pressupostos de intervenção"
              ]
            }
          ]
        },
        {
          "id": "const_legislativo",
          "nivel_2": "Poder Legislativo",
          "topicos": [
            {
              "id": "const_legis_org",
              "nivel_3": "Organização e Atribuições",
              "aliases": [
                "congresso",
                "imunidades",
                "cpi"
              ]
            },
            {
              "id": "const_legis_processo",
              "nivel_3": "Processo Legislativo e Fiscalização (TCU)",
              "aliases": [
                "leis complementares",
                "medidas provisórias"
              ]
            }
          ],
          "aliases": [
            "Processo legislativo",
            "Comissões parlamentares e imunidades",
            "Tribunais de Contas e fiscalização",
            "Poder Legislativo"
          ]
        },
        {
          "id": "const_executivo",
          "nivel_2": "Poder Executivo",
          "aliases": [
            "Presidencialismo",
            "Medida Provisória",
            "Estado de sítio e Estado de defesa",
            "Poder Executivo e Defesa do Estado"
          ],
          "topicos": [
            {
              "id": "const_exec_atrib",
              "nivel_3": "Atribuições e Responsabilidades do Chefe de Estado",
              "aliases": [
                "presidente",
                "impeachment"
              ]
            }
          ]
        },
        {
          "id": "const_judiciario",
          "nivel_2": "Poder Judiciário",
          "topicos": [
            {
              "id": "const_jud_org",
              "nivel_3": "Organização, Atribuições e Estatuto (LOMAN/CNJ)",
              "aliases": [
                "stf",
                "stj",
                "precatórios"
              ]
            }
          ],
          "aliases": [
            "STF, STJ e Justiça dos Estados",
            "Súmula Vinculante",
            "Conselho Nacional de Justiça (CNJ)",
            "Poder Judiciário"
          ]
        },
        {
          "id": "const_funcoes",
          "nivel_2": "Funções Essenciais à Justiça",
          "topicos": [
            {
              "id": "const_func_mp",
              "nivel_3": "Ministério Público, Advocacia e Defensoria",
              "aliases": [
                "autonomia",
                "prerrogativas institucionais"
              ]
            }
          ],
          "aliases": [
            "Ministério Público",
            "Advocacia e Defensoria Pública",
            "Advocacia Pública",
            "Funções Essenciais à Justiça"
          ]
        },
        {
          "id": "const_controle",
          "nivel_2": "Controle de Constitucionalidade",
          "topicos": [
            {
              "id": "const_controle_concentrado_difuso",
              "nivel_3": "Sistemas e Instrumentos de Controle",
              "aliases": [
                "Controle difuso e concentrado",
                "ADI, ADC e ADPF",
                "Inconstitucionalidade por omissão",
                "Efeitos da declaração"
              ]
            },
            {
              "id": "const_controle_difuso",
              "nivel_3": "Teoria Geral e Controle Difuso",
              "aliases": [
                "reserva de plenário",
                "súmula vinculante"
              ]
            },
            {
              "id": "const_controle_concentrado",
              "nivel_3": "Controle Concentrado (ADI, ADC, ADO, ADPF)",
              "aliases": [
                "ações objetivas",
                "modulação de efeitos"
              ]
            }
          ]
        },
        {
          "id": "const_temas_especiais",
          "nivel_2": "Temas Especiais",
          "topicos": [
            {
              "id": "const_pcd",
              "nivel_3": "Convenção Internacional sobre os Direitos das Pessoas com Deficiência",
              "aliases": [
                "Estatuto da Pessoa com Deficiência"
              ]
            },
            {
              "id": "const_indigenas",
              "nivel_3": "Marco temporal indígena",
              "aliases": [
                "Direitos dos Povos Indígenas"
              ]
            }
          ]
        },
        {
          "id": "const_defesa",
          "nivel_2": "Defesa do Estado e Instituições",
          "topicos": [
            {
              "id": "const_defesa_sitio",
              "nivel_3": "Estado de Sítio, Defesa e Segurança Pública",
              "aliases": [
                "forças armadas",
                "polícias"
              ]
            }
          ]
        },
        {
          "id": "const_ordem_social",
          "nivel_2": "Ordem Social",
          "topicos": [
            {
              "id": "const_ordem_seguridade",
              "nivel_3": "Seguridade Social (Saúde, Prev. e Assistência)",
              "aliases": [
                "sus",
                "financiamento"
              ]
            },
            {
              "id": "const_ordem_educacao",
              "nivel_3": "Educação, Cultura, Desporto e Ciência",
              "aliases": [
                "ensino",
                "patrimônio cultural"
              ]
            },
            {
              "id": "const_ordem_familia",
              "nivel_3": "Família, Criança, Idoso e Povos Indígenas",
              "aliases": [
                "terras indígenas",
                "proteção especial"
              ]
            }
          ]
        },
        {
          "id": "const_ordem_eco",
          "nivel_2": "Ordem Econômica e Financeira",
          "topicos": []
        },
        {
          "id": "const_trib_orc",
          "nivel_2": "Tributação e Orçamento",
          "topicos": []
        }
      ]
    },
    {
      "id": "eleitoral",
      "nivel_1": "Direito Eleitoral",
      "divisoes": [
        {
          "id": "eleitoral_fundamentos_org",
          "nivel_2": "Fundamentos, Direitos Políticos e Justiça Eleitoral",
          "topicos": [
            {
              "id": "eleitoral_teoria",
              "nivel_3": "Conceitos, Princípios, Fontes e Sistemas Eleitorais",
              "aliases": [
                "Interpretação",
                "Aplicação Subsidiária do CPC",
                "Sistema Majoritário e Proporcional"
              ]
            },
            {
              "id": "eleitoral_dir_politicos",
              "nivel_3": "Direitos Políticos",
              "aliases": [
                "Sufrágio Universal e Voto",
                "Perda e Suspensão de Direitos Políticos",
                "Características do Voto"
              ]
            },
            {
              "id": "eleitoral_org_justica",
              "nivel_3": "Órgãos da Justiça Eleitoral e Ministério Público Eleitoral",
              "aliases": [
                "TSE, TREs, Juízes e Juntas Eleitorais",
                "Composição, Atribuições e Competências",
                "Poder Normativo do TSE"
              ]
            }
          ]
        },
        {
          "id": "eleitoral_alistamento_partidos",
          "nivel_2": "Alistamento, Partidos Políticos e Convenções",
          "topicos": [
            {
              "id": "eleitoral_alistamento",
              "nivel_3": "Alistamento e Domicílio Eleitoral",
              "aliases": [
                "Ato, Efeitos, Transferência e Encerramento",
                "Cancelamento e Exclusão do Eleitor",
                "Resolução TSE nº 23.659/2021"
              ]
            },
            {
              "id": "eleitoral_partidos",
              "nivel_3": "Partidos Políticos (Lei nº 9.096/1995)",
              "aliases": [
                "Registro, Funcionamento, Criação e Extinção",
                "Filiação, Fidelidade e Disciplina Partidária",
                "Federações Partidárias"
              ]
            },
            {
              "id": "eleitoral_financas_partidos",
              "nivel_3": "Finanças e Contabilidade dos Partidos",
              "aliases": [
                "Fundo Partidário",
                "Fundo Especial de Financiamento de Campanha (FEFC)",
                "Propaganda Partidária"
              ]
            },
            {
              "id": "eleitoral_coligacoes",
              "nivel_3": "Coligações e Convenções para Escolha de Candidatos",
              "aliases": []
            }
          ]
        },
        {
          "id": "eleitoral_elegibilidade",
          "nivel_2": "Elegibilidade, Inelegibilidade e Registro",
          "topicos": [
            {
              "id": "eleitoral_cond_elegibilidade",
              "nivel_3": "Elegibilidade e Inelegibilidades",
              "aliases": [
                "Lei das Inelegibilidades (LC nº 64/1990)",
                "Prazos de Desincompatibilização (LC nº 86/1996)"
              ]
            },
            {
              "id": "eleitoral_registro",
              "nivel_3": "Registro de Candidatos",
              "aliases": [
                "Impugnação de Registro",
                "Cotas de Gênero"
              ]
            }
          ]
        },
        {
          "id": "eleitoral_campanha",
          "nivel_2": "Campanha Eleitoral e Propaganda",
          "topicos": [
            {
              "id": "eleitoral_financiamento",
              "nivel_3": "Arrecadação, Aplicação de Recursos e Prestação de Contas",
              "aliases": []
            },
            {
              "id": "eleitoral_pesquisas",
              "nivel_3": "Pesquisas e Testes Pré-Eleitorais",
              "aliases": []
            },
            {
              "id": "eleitoral_propaganda",
              "nivel_3": "Propaganda Eleitoral (Lei nº 9.504/1997)",
              "aliases": [
                "Imprensa, Rádio, TV e Internet",
                "Propaganda Eleitoral Antecipada",
                "Direito de Resposta"
              ]
            }
          ]
        },
        {
          "id": "eleitoral_pleito",
          "nivel_2": "Votação, Apuração e Diplomação",
          "topicos": [
            {
              "id": "eleitoral_votacao_atos",
              "nivel_3": "Da Votação e Atos Preparatórios",
              "aliases": [
                "Circunscrição, Zona e Seção Eleitoral",
                "Mesas Receptoras, Cabinas e Urnas",
                "Polícia e Fiscalização das Eleições"
              ]
            },
            {
              "id": "eleitoral_votacao_sistema",
              "nivel_3": "Sistema Eletrônico de Votação, Apuração e Totalização",
              "aliases": [
                "Nulidades na Votação",
                "Proclamação e Diplomação dos Eleitos"
              ]
            }
          ]
        },
        {
          "id": "eleitoral_processo",
          "nivel_2": "Processo e Ações Eleitorais",
          "topicos": [
            {
              "id": "eleitoral_acoes",
              "nivel_3": "Ações e Representações Eleitorais",
              "aliases": [
                "Ação de Impugnação de Registro de Candidatura (AIRC)",
                "Ação de Investigação Judicial Eleitoral (AIJE)",
                "Ação de Impugnação de Mandato Eletivo (AIME)",
                "Recurso Contra Expedição de Diploma (RCED)",
                "Representação por Captação Ilícita de Sufrágio",
                "Impugnações perante as Juntas"
              ]
            },
            {
              "id": "eleitoral_recursos",
              "nivel_3": "Recursos Eleitorais",
              "aliases": [
                "Pressupostos, Efeitos e Prazos",
                "Recursos perante Juntas, Juízos e TREs"
              ]
            },
            {
              "id": "eleitoral_jurisprudencia",
              "nivel_3": "Jurisprudência dos Tribunais Superiores em Matéria Eleitoral",
              "aliases": []
            },
            {
              "id": "ele_proc_cand",
              "nivel_3": "Convenções, Coligações/Federações e Registro de Candidatura",
              "aliases": [
                "cotas de gênero",
                "drap",
                "rrc",
                "fraude à cota de gênero",
                "substituição de candidatos"
              ]
            },
            {
              "id": "ele_proc_prop",
              "nivel_3": "Propaganda Eleitoral, Pesquisas e Direito de Resposta",
              "aliases": [
                "propaganda antecipada",
                "propaganda na internet",
                "imprensa",
                "gravação ambiental e prova ilícita no processo eleitoral"
              ]
            },
            {
              "id": "ele_proc_preparatorios",
              "nivel_3": "Atos Preparatórios, Mesas Receptoras, Lugares de Votação e Fiscalização",
              "aliases": [
                "poder de polícia na votação",
                "fiscais e delegados de partido",
                "mesários"
              ]
            },
            {
              "id": "ele_proc_contas",
              "nivel_3": "Arrecadação, Gastos e Prestação de Contas de Campanha",
              "aliases": [
                "limites de gastos",
                "doações de pessoas físicas",
                "sobras de campanha"
              ]
            },
            {
              "id": "ele_proc_vot",
              "nivel_3": "Votação, Apuração, Totalização e Diplomação",
              "aliases": [
                "sistemas eleitorais",
                "quociente eleitoral",
                "quociente partidário",
                "nulidades da votação",
                "eleições suplementares",
                "reclamação contra a totalização"
              ]
            }
          ],
          "aliases": [
            "Processo Eleitoral (Lei 9.504/97)"
          ]
        },
        {
          "id": "eleitoral_penal",
          "nivel_2": "Direito Penal e Processual Penal Eleitoral",
          "topicos": [
            {
              "id": "eleitoral_crimes",
              "nivel_3": "Crimes Eleitorais",
              "aliases": [
                "Conceito, Natureza e Classificação",
                "Tipos previstos na Legislação Eleitoral"
              ]
            },
            {
              "id": "eleitoral_processo_penal",
              "nivel_3": "Processo Penal Eleitoral",
              "aliases": [
                "Investigação Criminal Eleitoral (Inquérito, Flagrante, Notícia Crime)",
                "Ação Penal Eleitoral e Competência",
                "Rito Processual e Incidentes"
              ]
            }
          ]
        },
        {
          "id": "ele_teoria",
          "nivel_2": "Teoria Geral e Direitos Políticos",
          "topicos": [
            {
              "id": "ele_teo_princ",
              "nivel_3": "Princípios, Fontes e Alistamento Eleitoral",
              "aliases": [
                "princípio da anualidade eleitoral",
                "domicílio eleitoral",
                "capacidade eleitoral ativa"
              ]
            },
            {
              "id": "ele_teo_direitos",
              "nivel_3": "Direitos Políticos: Aquisição, Perda e Suspensão (Art. 15 da CF)",
              "aliases": [
                "revisão de eleitorado",
                "condenação criminal transitada em julgado",
                "improbidade administrativa"
              ]
            }
          ]
        },
        {
          "id": "ele_justica",
          "nivel_2": "Justiça Eleitoral e Partidos",
          "topicos": [
            {
              "id": "ele_jus_org",
              "nivel_3": "Organização e Competência (TSE, TREs, Juízes e Juntas)",
              "aliases": [
                "poder normativo do tse",
                "composição dos tribunais"
              ]
            },
            {
              "id": "ele_jus_mpe",
              "nivel_3": "Ministério Público Eleitoral",
              "aliases": [
                "composição",
                "atribuições",
                "legitimidade"
              ]
            },
            {
              "id": "ele_jus_part",
              "nivel_3": "Partidos Políticos (Lei 9.096/95 - Criação, Fusão e Fidelidade)",
              "aliases": [
                "autonomia partidária",
                "justa causa para desfiliação",
                "filiação partidária",
                "propaganda partidária"
              ]
            },
            {
              "id": "ele_jus_fin",
              "nivel_3": "Financiamento Partidário e Fundo Especial",
              "aliases": [
                "fundo partidário",
                "fefc"
              ]
            }
          ]
        },
        {
          "id": "ele_ilicitos",
          "nivel_2": "Ilícitos Eleitorais",
          "topicos": [
            {
              "id": "ele_ili_crimes",
              "nivel_3": "Crimes Eleitorais e Processo Penal Eleitoral",
              "aliases": [
                "boca de urna",
                "transporte irregular de eleitores",
                "corrupção eleitoral",
                "falsidade ideológica eleitoral (art. 350 do ce)",
                "inscrição fraudulenta de eleitor",
                "denunciação caluniosa eleitoral",
                "calúnia, difamação e injúria eleitoral"
              ]
            },
            {
              "id": "ele_ili_condutas",
              "nivel_3": "Condutas Vedadas aos Agentes Públicos e Abuso de Poder",
              "aliases": [
                "abuso de poder econômico",
                "abuso de poder político",
                "uso da máquina pública"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "empresarial",
      "nivel_1": "Direito Empresarial",
      "divisoes": [
        {
          "id": "emp_teoria_geral",
          "nivel_2": "Teoria Geral e Estabelecimento",
          "topicos": [
            {
              "id": "emp_teoria_empresa",
              "nivel_3": "Empresário, Caracterização e Registro",
              "aliases": [
                "Conceito de empresário",
                "Capacidade e impedimentos",
                "Registro Público de Empresas Mercantis"
              ]
            },
            {
              "id": "emp_teoria_conceito",
              "nivel_3": "Conceito de Empresário, Requisitos e Capacidade",
              "aliases": [
                "teoria da empresa",
                "impedimentos",
                "fontes do direito empresarial",
                "capacidade e outorga conjugal"
              ]
            },
            {
              "id": "emp_teoria_individual",
              "nivel_3": "Empresário Individual e Sociedade Limitada Unipessoal (SLU)",
              "aliases": [
                "eireli (extinta)",
                "mei"
              ]
            },
            {
              "id": "emp_teoria_registro",
              "nivel_3": "Registro de Empresas (DREI e Juntas Comerciais)",
              "aliases": [
                "nire"
              ]
            },
            {
              "id": "emp_teoria_escrituracao",
              "nivel_3": "Da Escrituração e Livros Empresariais",
              "aliases": [
                "sigilo e exibição judicial",
                "livros comerciais"
              ]
            },
            {
              "id": "emp_teoria_estab",
              "nivel_3": "Estabelecimento Empresarial e Trespasse",
              "aliases": [
                "ponto comercial",
                "aviamento",
                "cláusula de não concorrência"
              ]
            },
            {
              "id": "emp_teoria_nome",
              "nivel_3": "Nome Empresarial",
              "aliases": [
                "firma",
                "denominação"
              ]
            },
            {
              "id": "emp_teoria_prepostos",
              "nivel_3": "Dos Prepostos do Empresário",
              "aliases": [
                "gerente",
                "contabilista"
              ]
            }
          ],
          "aliases": [
            "Teoria Geral da Empresa"
          ]
        },
        {
          "id": "emp_societario",
          "nivel_2": "Direito Societário",
          "topicos": [
            {
              "id": "emp_soc_geral",
              "nivel_3": "Sociedades em Geral e Personificadas/Não Personificadas",
              "aliases": [
                "Sociedade comum",
                "Sociedade em conta de participação",
                "Sociedade simples",
                "Desconsideração da personalidade jurídica"
              ]
            },
            {
              "id": "emp_soc_limitada",
              "nivel_3": "Sociedade Limitada",
              "aliases": [
                "Administração e conselho fiscal",
                "Exclusão de sócio",
                "Responsabilidade dos sócios"
              ]
            },
            {
              "id": "emp_soc_acoes",
              "nivel_3": "Sociedade por Ações (Lei nº 6.404/1976)",
              "aliases": [
                "Capital social e ações",
                "Debêntures",
                "Órgãos sociais",
                "Responsabilidade dos administradores",
                "Operações societárias"
              ]
            },
            {
              "id": "emp_op_reestruturacao",
              "nivel_3": "Transformação, Incorporação, Fusão e Cisão",
              "aliases": [
                "consórcios"
              ]
            }
          ],
          "aliases": [
            "Direito Societário: Operações"
          ]
        },
        {
          "id": "emp_titulos_credito",
          "nivel_2": "Títulos de Crédito",
          "topicos": [
            {
              "id": "emp_tit_geral",
              "nivel_3": "Teoria Geral e Títulos em Espécie (LUG)",
              "aliases": [
                "Lei Uniforme de Genebra (Decreto nº 57.663/1966)",
                "Aval e endosso",
                "Letra de câmbio, nota promissória, cheque e duplicata"
              ]
            },
            {
              "id": "emp_tit_protesto",
              "nivel_3": "Protesto de Títulos (Lei nº 9.492/1997)",
              "aliases": [
                "Fins e efeitos do protesto"
              ]
            },
            {
              "id": "emp_tit_teoria",
              "nivel_3": "Teoria Geral, Princípios e Atributos",
              "aliases": [
                "cartularidade",
                "literalidade",
                "autonomia",
                "títulos em suporte escritural/eletrônico"
              ]
            },
            {
              "id": "emp_tit_atos",
              "nivel_3": "Endosso, Aval, Aceite e Protesto",
              "aliases": [
                "cessão civil vs. endosso",
                "ação cambial"
              ]
            },
            {
              "id": "emp_tit_lc_np",
              "nivel_3": "Títulos em Espécie: Letra de Câmbio e Nota Promissória",
              "aliases": [
                "lug",
                "saque"
              ]
            },
            {
              "id": "emp_tit_cheque",
              "nivel_3": "Títulos em Espécie: Cheque e Duplicata",
              "aliases": [
                "cheque pré-datado",
                "aceite por presunção"
              ]
            },
            {
              "id": "emp_tit_especiais",
              "nivel_3": "Títulos Especiais (Agronegócio, Bancário, Imobiliário)",
              "aliases": [
                "cdb",
                "cédula de produto rural (cpr)",
                "commercial papers (nota comercial)",
                "cédulas de crédito bancário/industrial",
                "títulos do agronegócio (cdca, cra, cpr)"
              ]
            }
          ]
        },
        {
          "id": "emp_falencia",
          "nivel_2": "Direito Falimentar e Recuperacional",
          "topicos": [
            {
              "id": "emp_fal_rec_judicial",
              "nivel_3": "Recuperação Judicial e Extrajudicial (Lei nº 11.101/2005)",
              "aliases": [
                "Plano de recuperação",
                "Administrador judicial",
                "Comitê de credores"
              ]
            },
            {
              "id": "emp_fal_processo",
              "nivel_3": "Falência",
              "aliases": [
                "Sentença declaratória",
                "Classificação dos créditos",
                "Inabilitação e reabilitação do falido"
              ]
            },
            {
              "id": "emp_fal_comuns",
              "nivel_3": "Disposições Comuns, Verificação de Créditos e Administrador Judicial",
              "aliases": [
                "juízo universal",
                "comitê de credores",
                "assembleia geral de credores",
                "consolidação substancial e processual",
                "submissão de empresas estatais"
              ]
            },
            {
              "id": "emp_fal_rj",
              "nivel_3": "Recuperação Judicial: Requisitos, Procedimento e Plano",
              "aliases": [
                "stay period",
                "cram down",
                "plano especial para me/epp"
              ]
            },
            {
              "id": "emp_fal_re",
              "nivel_3": "Recuperação Extrajudicial",
              "aliases": [
                "homologação judicial",
                "créditos sujeitos"
              ]
            },
            {
              "id": "emp_fal_decretacao",
              "nivel_3": "Falência: Decretação, Pedido e Efeitos quanto às Pessoas e Bens",
              "aliases": [
                "autofalência",
                "arrecadação de bens",
                "inabilitação do falido"
              ]
            },
            {
              "id": "emp_fal_efeitos",
              "nivel_3": "Falência: Efeitos nos Contratos e Ação Revocatória",
              "aliases": [
                "termo legal da falência",
                "ineficácia de atos",
                "ação revocatória"
              ]
            },
            {
              "id": "emp_fal_pagamento",
              "nivel_3": "Falência: Realização do Ativo, Quadro de Credores e Pagamento",
              "aliases": [
                "ordem de preferência",
                "créditos extraconcursais",
                "restituição"
              ]
            },
            {
              "id": "emp_fal_crimes",
              "nivel_3": "Crimes Falimentares",
              "aliases": [
                "fraude a credores",
                "competência penal"
              ]
            },
            {
              "id": "emp_fal_transnacional",
              "nivel_3": "Insolvência Transnacional",
              "aliases": []
            },
            {
              "id": "emp_fal_liquidacao",
              "nivel_3": "Intervenção e Liquidação Extrajudicial de Instituições Financeiras (Lei nº 6.024/74)",
              "aliases": []
            }
          ],
          "aliases": [
            "Recuperação de Empresas e Falência"
          ]
        },
        {
          "id": "emp_prop_industrial",
          "nivel_2": "Propriedade Industrial",
          "topicos": [
            {
              "id": "emp_prop_ind_geral",
              "nivel_3": "Marcas, Patentes e Concorrência Desleal (Lei nº 9.279/1996)",
              "aliases": [
                "Invenção e modelo de utilidade",
                "Desenho industrial",
                "Indicação geográfica"
              ]
            },
            {
              "id": "emp_pi_patentes",
              "nivel_3": "Patentes de Invenção e Modelo de Utilidade",
              "aliases": [
                "requisitos de patenteabilidade",
                "prazo de vigência",
                "licença compulsória"
              ]
            },
            {
              "id": "emp_pi_marcas",
              "nivel_3": "Marcas, Desenho Industrial e Indicações Geográficas",
              "aliases": [
                "marca de alto renome",
                "concorrência desleal"
              ]
            }
          ],
          "aliases": [
            "Propriedade Industrial (Lei 9.279/96)"
          ]
        },
        {
          "id": "emp_legislacao_especial",
          "nivel_2": "Legislação Especial",
          "topicos": [
            {
              "id": "emp_leg_mep_epp",
              "nivel_3": "Microempresa e Empresa de Pequeno Porte (LC nº 123/2006)",
              "aliases": [
                "Tratamento diferenciado e favorecido",
                "Simples nacional"
              ]
            },
            {
              "id": "emp_leg_agronegocio",
              "nivel_3": "Títulos do Agronegócio (Lei nº 11.076/2004)",
              "aliases": [
                "CDA e WA"
              ]
            }
          ]
        },
        {
          "id": "emp_societario_teoria",
          "nivel_2": "Direito Societário: Teoria Geral e Tipos Menores",
          "topicos": [
            {
              "id": "emp_soc_teoria",
              "nivel_3": "Teoria Geral das Sociedades e Desconsideração da Personalidade",
              "aliases": [
                "affectio societatis",
                "sociedade entre cônjuges"
              ]
            },
            {
              "id": "emp_soc_nao_personificadas",
              "nivel_3": "Sociedades Não Personificadas (Comum e Conta de Participação)",
              "aliases": [
                "sociedade de fato",
                "sócio oculto"
              ]
            },
            {
              "id": "emp_soc_personificadas",
              "nivel_3": "Sociedades Personificadas (Simples, Nome Coletivo, Comandita)",
              "aliases": [
                "responsabilidade dos sócios"
              ]
            },
            {
              "id": "emp_soc_dissolucao",
              "nivel_3": "Dissolução, Liquidação e Extinção das Sociedades",
              "aliases": [
                "apuração de haveres",
                "direito de retirada",
                "exclusão de sócio"
              ]
            }
          ]
        },
        {
          "id": "emp_societario_ltda",
          "nivel_2": "Direito Societário: Sociedade Limitada (LTDA)",
          "topicos": [
            {
              "id": "emp_ltda_regras",
              "nivel_3": "Sociedade Limitada: Quotas, Administração e Deliberações",
              "aliases": [
                "conselho fiscal",
                "exclusão de sócio",
                "cessão de quotas"
              ]
            },
            {
              "id": "emp_sa_capital",
              "nivel_3": "S.A.: Características, Capital Social e Valores Mobiliários (Ações/Debêntures)",
              "aliases": [
                "partes beneficiárias",
                "bônus de subscrição",
                "companhia aberta e fechada",
                "comissão de valores mobiliários (cvm)",
                "voto plural",
                "sociedade anônima do futebol (saf - lei nº 14.193/2021)"
              ]
            },
            {
              "id": "emp_sa_orgaos",
              "nivel_3": "S.A.: Órgãos Sociais (Assembleia, Diretoria, Conselhos)",
              "aliases": [
                "assembleia geral ordinária",
                "assembleia geral extraordinária"
              ]
            },
            {
              "id": "emp_sa_acionistas",
              "nivel_3": "S.A.: Acionistas (Direitos, Deveres e Acordo de Acionistas)",
              "aliases": [
                "acionista controlador",
                "abuso de poder de controle"
              ]
            },
            {
              "id": "emp_sa_coligadas",
              "nivel_3": "Sociedades Coligadas, Controladas, Filiadas e Oferta Pública de Ações (OPA)",
              "aliases": [
                "grupos societários"
              ]
            }
          ],
          "aliases": [
            "Direito Societário: Sociedades Anônimas (S.A.)"
          ]
        },
        {
          "id": "emp_cooperativas",
          "nivel_2": "Sociedades Cooperativas",
          "topicos": [
            {
              "id": "emp_coop_regras",
              "nivel_3": "Sociedades Cooperativas (Lei nº 5.764/1971)",
              "aliases": [
                "fundo de reserva",
                "fates",
                "quotas-partes"
              ]
            }
          ]
        },
        {
          "id": "emp_contratos",
          "nivel_2": "Contratos Empresariais",
          "topicos": [
            {
              "id": "emp_cont_franq",
              "nivel_3": "Franquia (Franchising) e Faturização (Factoring)",
              "aliases": [
                "circular de oferta de franquia",
                "fomento mercantil"
              ]
            },
            {
              "id": "emp_cont_rep",
              "nivel_3": "Representação Comercial, Concessão, Agência e Distribuição",
              "aliases": [
                "cláusula de del credere",
                "exclusividade"
              ]
            },
            {
              "id": "emp_cont_alienacao",
              "nivel_3": "Alienação Fiduciária em Garantia (Decreto-Lei nº 911/1969)",
              "aliases": []
            },
            {
              "id": "emp_cont_arrendamento",
              "nivel_3": "Arrendamento Mercantil (Leasing - Lei nº 6.099/74) e Contratos Bancários",
              "aliases": [
                "patrimônio rural em afetação (lei do agro)"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "financeiro_tributario",
      "nivel_1": "Direito Financeiro e Tributário",
      "divisoes": [
        {
          "id": "trib_sistema_competencia",
          "nivel_2": "Sistema Tributário Nacional, Competência e Limitações",
          "topicos": [
            {
              "id": "trib_stn_receitas",
              "nivel_3": "Sistema Tributário Nacional e Repartição de Receitas",
              "aliases": [
                "Princípios gerais",
                "Repartições de competência na CF/88"
              ]
            },
            {
              "id": "trib_competencia",
              "nivel_3": "Competência Tributária",
              "aliases": [
                "Conceito, espécies e características",
                "Capacidade tributária ativa e limitações"
              ]
            },
            {
              "id": "trib_limitacoes_imunidades",
              "nivel_3": "Limitações ao Poder de Tributar e Imunidades",
              "aliases": [
                "Imunidades genéricas e específicas",
                "Limitações constitucionais"
              ]
            }
          ]
        },
        {
          "id": "trib_tributos_especies",
          "nivel_2": "Teoria Geral dos Tributos e Espécies Tributárias",
          "topicos": [
            {
              "id": "trib_conceito_classificacao",
              "nivel_3": "Conceito e Classificação dos Tributos",
              "aliases": [
                "Natureza jurídica e denominação",
                "Tributos diretos e indiretos",
                "Fiscalidade, extrafiscalidade e parafiscalidade"
              ]
            },
            {
              "id": "trib_especies",
              "nivel_3": "Espécies Tributárias",
              "aliases": [
                "Impostos, taxas e contribuição de melhoria",
                "Contribuições sociais",
                "Preço público, tarifa e pedágio"
              ]
            },
            {
              "id": "trib_impostos_especie",
              "nivel_3": "Impostos em Espécie",
              "aliases": [
                "Impostos da União",
                "Impostos dos Estados e do Distrito Federal",
                "Impostos dos Municípios"
              ]
            }
          ]
        },
        {
          "id": "trib_legislacao_obrigacao",
          "nivel_2": "Legislação, Norma e Obrigação Tributária",
          "topicos": [
            {
              "id": "trib_normas_legislacao",
              "nivel_3": "Normas e Legislação Tributária",
              "aliases": [
                "Fontes e espécies normativas",
                "Vigência, aplicação, interpretação e integração"
              ]
            },
            {
              "id": "trib_norma_fato_gerador",
              "nivel_3": "Norma Jurídica e Fato Gerador",
              "aliases": [
                "Regra-matriz de incidência tributária",
                "Efeitos e classificações do fato gerador"
              ]
            },
            {
              "id": "trib_obrigacao",
              "nivel_3": "Obrigação Tributária",
              "aliases": [
                "Deveres instrumentais ou formais",
                "Sujeito ativo e sujeito passivo",
                "Solidariedade, capacidade e domicílio tributário"
              ]
            },
            {
              "id": "trib_responsabilidade",
              "nivel_3": "Responsabilidade Tributária",
              "aliases": [
                "Responsabilidade de sucessores e terceiros",
                "Responsabilidade por infrações",
                "Substituição tributária"
              ]
            },
            {
              "id": "trib_obrig_teoria",
              "nivel_3": "Legislação, Vigência, Interpretação e Fato Gerador",
              "aliases": [
                "obrigação principal e acessória",
                "evasão e elisão"
              ]
            },
            {
              "id": "trib_obrig_suj",
              "nivel_3": "Sujeitos da Obrigação e Solidariedade",
              "aliases": [
                "sujeito ativo",
                "sujeito passivo",
                "capacidade tributária"
              ]
            },
            {
              "id": "trib_obrig_resp",
              "nivel_3": "Responsabilidade Tributária (Sucessores, Terceiros e Infrações)",
              "aliases": [
                "substituição tributária",
                "art. 135 do ctn",
                "denúncia espontânea",
                "sucessão empresarial e incorporação",
                "responsabilidade de sócios e gerentes",
                "responsabilidade de notários e registradores",
                "redirecionamento da execução",
                "grupo econômico"
              ]
            }
          ],
          "aliases": [
            "Obrigação Tributária"
          ]
        },
        {
          "id": "trib_credito",
          "nivel_2": "Crédito Tributário",
          "topicos": [
            {
              "id": "trib_constituicao_lancamento",
              "nivel_3": "Constituição e Lançamento Tributário",
              "aliases": [
                "Conceito, natureza jurídica e atributos",
                "Modalidades e revisão"
              ]
            },
            {
              "id": "trib_suspensao",
              "nivel_3": "Suspensão da Exigibilidade do Crédito",
              "aliases": [
                "Moratória e parcelamento",
                "Depósito, reclamações e recursos administrativos",
                "Medida liminar e tutela antecipada"
              ]
            },
            {
              "id": "trib_extincao",
              "nivel_3": "Extinção do Crédito Tributário",
              "aliases": [
                "Pagamento, compensação, transação e remissão",
                "Decadência e prescrição",
                "Repetição de indébito e dação em pagamento"
              ]
            },
            {
              "id": "trib_exclusao",
              "nivel_3": "Exclusão do Crédito Tributário",
              "aliases": [
                "Isenção e anistia"
              ]
            },
            {
              "id": "trib_garantias",
              "nivel_3": "Garantias e Privilégios do Crédito",
              "aliases": [
                "Preferências"
              ]
            },
            {
              "id": "trib_esp_fed",
              "nivel_3": "Impostos Federais (IR, IPI, IOF, ITR, II, IE, IGF)",
              "aliases": [
                "imposto de renda",
                "produtos industrializados",
                "ganho de capital",
                "imposto de renda retido na fonte (irrf)",
                "desembaraço aduaneiro"
              ]
            },
            {
              "id": "trib_esp_est",
              "nivel_3": "Impostos Estaduais (ICMS, IPVA, ITCMD)",
              "aliases": [
                "guerra fiscal",
                "não-cumulatividade",
                "base de cálculo",
                "icms-difal",
                "inventário extrajudicial (itcmd)",
                "progressividade do itcmd"
              ]
            },
            {
              "id": "trib_esp_mun",
              "nivel_3": "Impostos Municipais (ISS, IPTU, ITBI)",
              "aliases": [
                "lista de serviços",
                "progressividade do iptu",
                "integralização de capital social (itbi)",
                "função social da propriedade urbana (iptu)",
                "local da prestação e exportação de serviços (iss)"
              ]
            },
            {
              "id": "trib_esp_taxas",
              "nivel_3": "Taxas, Contribuições de Melhoria e Empréstimos Compulsórios",
              "aliases": [
                "poder de polícia",
                "serviço público específico e divisível"
              ]
            },
            {
              "id": "trib_esp_contrib",
              "nivel_3": "Contribuições Especiais (Sociais, CIDE, Iluminação)",
              "aliases": [
                "cosip",
                "pis/cofins",
                "contribuições ao sistema s",
                "contribuição sindical"
              ]
            }
          ],
          "aliases": [
            "Espécies Tributárias"
          ]
        },
        {
          "id": "trib_adm_processo",
          "nivel_2": "Administração, Infrações e Processo Tributário",
          "topicos": [
            {
              "id": "trib_administracao_sancoes",
              "nivel_3": "Administração e Sanções Tributárias",
              "aliases": [
                "Fiscalização",
                "Dívida ativa e protesto de CDA",
                "Certidões negativas",
                "Ilícitos administrativos e sanções tributárias"
              ]
            },
            {
              "id": "trib_processo_judicial",
              "nivel_3": "Processo Judicial Tributário",
              "aliases": [
                "Execução fiscal",
                "Ação cautelar fiscal e ação declaratória",
                "Ação anulatória e mandado de segurança",
                "Ação de consignação em pagamento"
              ]
            },
            {
              "id": "trib_proc_fisc",
              "nivel_3": "Fiscalização Tributária",
              "aliases": [
                "quebra de sigilo bancário e fiscal",
                "dever de prestar informações"
              ]
            },
            {
              "id": "trib_proc_adm",
              "nivel_3": "Dívida Ativa, Certidões e Processo Administrativo Fiscal (PAF)",
              "aliases": [
                "certidão positiva com efeito de negativa",
                "sigilo fiscal",
                "consulta fiscal"
              ]
            },
            {
              "id": "trib_proc_jud",
              "nivel_3": "Processo Judicial Tributário (Execução Fiscal, Repetição, Anulatória)",
              "aliases": [
                "lei 6.830/80",
                "mandado de segurança tributário",
                "exceção de pré-executividade",
                "medida cautelar fiscal (lei nº 8.397/92)",
                "embargos à execução fiscal",
                "ação de repetição de indébito",
                "garantia do juízo"
              ]
            }
          ],
          "aliases": [
            "Administração e Processo Tributário"
          ]
        },
        {
          "id": "financeiro_internacional",
          "nivel_2": "Direito Financeiro e Tributação Internacional",
          "topicos": [
            {
              "id": "trib_internacional",
              "nivel_3": "Tributação Internacional",
              "aliases": [
                "Acordos para evitar dupla tributação",
                "OMC, Mercosul, ALADI e ALCA",
                "Incentivos fiscais, evasão e elisão tributárias"
              ]
            },
            {
              "id": "fin_atividade_orcamento",
              "nivel_3": "Direito Financeiro e Orçamento",
              "aliases": [
                "Atividade financeira do Estado",
                "Leis orçamentárias (PPA, LDO e LOA)",
                "Lei de Responsabilidade Fiscal",
                "Lei nº 4.320/1964"
              ]
            }
          ]
        },
        {
          "id": "econ_ordem",
          "nivel_2": "Ordem Econômica Constitucional",
          "topicos": [
            {
              "id": "econ_ord_princ",
              "nivel_3": "Princípios Gerais e Formas de Atuação do Estado",
              "aliases": [
                "livre iniciativa",
                "livre concorrência",
                "função social da empresa",
                "estado regulador",
                "intervenção direta e indireta"
              ]
            },
            {
              "id": "econ_ord_monopolios",
              "nivel_3": "Monopólios, Serviços Públicos e Atividade Econômica",
              "aliases": [
                "monopólio da união",
                "petróleo",
                "exploração direta de atividade econômica"
              ]
            }
          ]
        },
        {
          "id": "econ_concorrencia",
          "nivel_2": "Defesa da Concorrência",
          "topicos": [
            {
              "id": "econ_conc_sbdc",
              "nivel_3": "Sistema Brasileiro de Defesa da Concorrência (SBDC e CADE)",
              "aliases": [
                "tribunal do cade",
                "superintendência-geral",
                "departamento de estudos econômicos"
              ]
            },
            {
              "id": "econ_conc_infracoes",
              "nivel_3": "Infrações da Ordem Econômica e Acordo de Leniência (Lei 12.529/11)",
              "aliases": [
                "cartel",
                "dumping",
                "abuso de posição dominante",
                "termo de compromisso de cessação (tcc)"
              ]
            },
            {
              "id": "econ_conc_estruturas",
              "nivel_3": "Controle de Estruturas (Atos de Concentração)",
              "aliases": [
                "fusão",
                "aquisição",
                "joint venture",
                "notificação prévia"
              ]
            }
          ]
        },
        {
          "id": "econ_sfn",
          "nivel_2": "Sistema Financeiro Nacional",
          "topicos": [
            {
              "id": "econ_sfn_cmn",
              "nivel_3": "Conselho Monetário Nacional (CMN) e Banco Central (Bacen)",
              "aliases": [
                "política monetária",
                "política cambial",
                "independência do banco central"
              ]
            },
            {
              "id": "econ_sfn_cvm",
              "nivel_3": "Comissão de Valores Mobiliários (CVM) e Instituições Financeiras",
              "aliases": [
                "mercado de capitais",
                "crimes contra o sistema financeiro nacional (reflexos)",
                "bancos"
              ]
            }
          ]
        },
        {
          "id": "econ_fin_normas",
          "nivel_2": "Normas Gerais de Direito Financeiro",
          "topicos": [
            {
              "id": "econ_fin_atividade",
              "nivel_3": "Atividade Financeira do Estado e Constituição Financeira",
              "aliases": [
                "competência legislativa",
                "princípios orçamentários",
                "leis orçamentárias (ppa, ldo e loa)"
              ]
            },
            {
              "id": "econ_fin_receitas_despesas",
              "nivel_3": "Receitas Públicas, Despesas Públicas e Precatórios",
              "aliases": [
                "receitas originárias e derivadas",
                "preço público vs. taxa",
                "regime constitucional de precatórios e rpv",
                "dívida ativa"
              ]
            },
            {
              "id": "econ_fin_credito_divida",
              "nivel_3": "Crédito Público, Dívida Pública e Responsabilidade Fiscal",
              "aliases": [
                "operações de crédito",
                "limites de endividamento",
                "garantias e contragarantias",
                "aspectos jurídicos da lrf"
              ]
            }
          ]
        },
        {
          "id": "trib_const",
          "nivel_2": "Sistema Constitucional Tributário",
          "topicos": [
            {
              "id": "trib_const_conceito",
              "nivel_3": "Conceito de Tributo, Natureza Jurídica e Preços Públicos",
              "aliases": [
                "pedágio",
                "tarifa",
                "pecúnia compulsória"
              ]
            },
            {
              "id": "trib_const_princ",
              "nivel_3": "Princípios e Limitações ao Poder de Tributar",
              "aliases": [
                "legalidade",
                "anterioridade",
                "irretroatividade",
                "confisco"
              ]
            },
            {
              "id": "trib_const_comp",
              "nivel_3": "Competência Tributária (Privativa, Comum, Cumulativa e Residual)",
              "aliases": [
                "competência residual",
                "competência extraordinária"
              ]
            },
            {
              "id": "trib_const_repart",
              "nivel_3": "Repartição Constitucional de Receitas Tributárias",
              "aliases": [
                "fundos de participação",
                "fundo de participação dos municípios (fpm)",
                "fundo de participação dos estados (fpe)",
                "retenção na fonte (irrf)",
                "desvinculação de receitas (dru/drem)"
              ]
            },
            {
              "id": "trib_const_imun",
              "nivel_3": "Imunidades Tributárias",
              "aliases": [
                "imunidade recíproca",
                "templos de qualquer culto",
                "livros e jornais"
              ]
            },
            {
              "id": "trib_const_reforma",
              "nivel_3": "Reforma Tributária (EC nº 132/2023)",
              "aliases": [
                "ibs",
                "cbs",
                "imposto seletivo (is)",
                "não cumulatividade plena",
                "período de transição"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "ambiental",
      "nivel_1": "Direito Ambiental",
      "divisoes": [
        {
          "id": "amb_fundamentos_constitucional",
          "nivel_2": "Fundamentos e Direito Ambiental Constitucional",
          "topicos": [
            {
              "id": "amb_teoria_geral",
              "nivel_3": "Teoria Geral, Princípios e Ética Ambiental",
              "aliases": [
                "Conceito, Natureza e Fontes",
                "Estado Constitucional Ecológico",
                "Ética e o Estatuto da Cidade"
              ]
            },
            {
              "id": "amb_direito_constitucional",
              "nivel_3": "Direito Ambiental Constitucional",
              "aliases": [
                "Deveres ambientais e ecológicos",
                "Competência legislativa em matéria ambiental",
                "Competências exclusivas e concorrentes"
              ]
            }
          ]
        },
        {
          "id": "amb_pnma_instrumentos",
          "nivel_2": "Política Nacional do Meio Ambiente e Instrumentos",
          "topicos": [
            {
              "id": "amb_pnma_sisnama",
              "nivel_3": "Política Nacional do Meio Ambiente (PNMA) e SISNAMA",
              "aliases": [
                "Princípios, finalidade e instrumentos",
                "Conselho de Governo, Conama e Ministério do Meio Ambiente",
                "Ibama e Fundo Nacional do Meio Ambiente (FNMA)"
              ]
            },
            {
              "id": "amb_licenciamento_eia",
              "nivel_3": "Licenciamento e Avaliação de Impacto Ambiental",
              "aliases": [
                "Tipos de Licença (LP, LI e LO)",
                "Estudo de Impacto Ambiental (EIA/RIMA)",
                "Audiência Pública e Normas do Conama"
              ]
            },
            {
              "id": "amb_zoneamento",
              "nivel_3": "Zoneamento Ambiental",
              "aliases": [
                "Zoneamento Ecológico-Econômico",
                "Zonas de Uso Industrial (ZUI, ZUEI, ZUPI, ZUD)",
                "Zoneamento Ambiental Agrícola e Costeiro"
              ]
            },
            {
              "id": "amb_pnma_diretrizes",
              "nivel_3": "Diretrizes, SISNAMA e Instrumentos (Zoneamento, Padrões)",
              "aliases": [
                "conama",
                "ibama",
                "órgãos seccionais e locais",
                "servidão ambiental",
                "zoneamento ecológico-econômico (zee)"
              ]
            },
            {
              "id": "amb_pnma_licenciamento",
              "nivel_3": "Licenciamento Ambiental e Estudos de Impacto (EIA/RIMA)",
              "aliases": [
                "licença prévia",
                "licença de instalação",
                "licença de operação",
                "audiência pública",
                "resolução conama nº 237/1997",
                "renovação de licença"
              ]
            }
          ],
          "aliases": [
            "Política Nacional do Meio Ambiente"
          ]
        },
        {
          "id": "amb_bens_espacos_poluicao",
          "nivel_2": "Bens Ambientais, Espaços Protegidos e Poluição",
          "topicos": [
            {
              "id": "amb_bens_ambientais",
              "nivel_3": "Bens Ambientais e Recursos Naturais",
              "aliases": [
                "Águas e cavidades naturais",
                "Fauna, flora e florestas",
                "Praias, plataforma continental e terrenos de marinha"
              ]
            },
            {
              "id": "amb_espacos_protegidos",
              "nivel_3": "Espaços Territoriais Especialmente Protegidos",
              "aliases": [
                "Sistema Nacional de Unidades de Conservação (SNUC)",
                "Áreas de Preservação Permanente (APP)"
              ]
            },
            {
              "id": "amb_poluicao_mudancas",
              "nivel_3": "Poluição e Mudanças Climáticas",
              "aliases": [
                "Poluição de águas, atmosférica, sonora e por resíduos",
                "Poluição por agrotóxicos e rejeitos perigosos",
                "Mercado de Carbono e Pagamento por Serviços Ambientais"
              ]
            }
          ]
        },
        {
          "id": "amb_responsabilidade_tutela",
          "nivel_2": "Responsabilidade, Defesa Processual e Crimes Ambientais",
          "topicos": [
            {
              "id": "amb_responsabilidade_dano",
              "nivel_3": "Dano e Responsabilidade Ambiental",
              "aliases": [
                "Apuração e reparação do dano",
                "Responsabilidade Administrativa, Civil e Penal",
                "Infrações administrativas e sanções"
              ]
            },
            {
              "id": "amb_defesa_processual",
              "nivel_3": "Meios Processuais para a Defesa Ambiental",
              "aliases": [
                "Ação Civil Pública e Ação Popular",
                "Mandado de Segurança, MI e ADI",
                "Tutela inibitória, de urgência e evidência",
                "Desapropriação e Tombamento"
              ]
            },
            {
              "id": "amb_crimes_ambientais",
              "nivel_3": "Crimes Contra o Meio Ambiente",
              "aliases": [
                "Lei de Crimes Ambientais (Lei nº 9.605/1998)",
                "Responsabilidade penal da pessoa jurídica",
                "Crimes contra flora, fauna, patrimônio e de poluição"
              ]
            },
            {
              "id": "amb_resp_civil",
              "nivel_3": "Responsabilidade Civil Ambiental (Teoria do Risco Integral)",
              "aliases": [
                "obrigação propter rem",
                "imprescritibilidade do dano",
                "reparação integral",
                "danos ambientais interinos e residuais",
                "dano moral coletivo ambiental",
                "teoria do fato consumado"
              ]
            },
            {
              "id": "amb_resp_adm",
              "nivel_3": "Responsabilidade Administrativa e Infrações",
              "aliases": [
                "auto de infração",
                "multa ambiental",
                "poder de polícia ambiental",
                "decreto nº 6.514/2008",
                "prescrição intercorrente"
              ]
            },
            {
              "id": "amb_resp_penal",
              "nivel_3": "Responsabilidade Penal (Lei 9.605/98)",
              "aliases": [
                "crimes contra a flora e fauna",
                "responsabilidade penal da pessoa jurídica"
              ]
            }
          ],
          "aliases": [
            "Responsabilidade Ambiental"
          ]
        },
        {
          "id": "amb_legislacao_especial_internacional",
          "nivel_2": "Políticas Nacionais, Legislação Especial e Direito Internacional",
          "topicos": [
            {
              "id": "amb_politicas_nacionais",
              "nivel_3": "Políticas Nacionais Setoriais e Leis Específicas",
              "aliases": [
                "Recursos Hídricos (Lei nº 9.433/1997) e Saneamento (Lei nº 11.445/2007)",
                "Resíduos Sólidos (Lei nº 12.305/2010)",
                "Código Florestal (Lei nº 12.651/2012) e Mata Atlântica (Lei nº 11.428/2006)",
                "Educação Ambiental, Biossegurança e Biodiversidade"
              ]
            },
            {
              "id": "amb_internacional",
              "nivel_3": "Direito Ambiental Internacional",
              "aliases": [
                "Princípios gerais e fontes",
                "Mercosul e procedimentos transfronteiriços",
                "Organizações Não Governamentais (ONGs)"
              ]
            },
            {
              "id": "amb_legislacao_estadual",
              "nivel_3": "Legislação Estadual de Pernambuco",
              "aliases": [
                "Lei Estadual nº 14.249/2010",
                "Licenciamento ambiental e infrações em PE"
              ]
            }
          ]
        },
        {
          "id": "amb_teoria",
          "nivel_2": "Teoria Geral e Constituição",
          "topicos": [
            {
              "id": "amb_teo_princ",
              "nivel_3": "Conceito de Meio Ambiente e Princípios (Precaução, Poluidor-Pagador)",
              "aliases": [
                "prevenção",
                "desenvolvimento sustentável",
                "usuário-pagador"
              ]
            },
            {
              "id": "amb_teo_const",
              "nivel_3": "Competências Constitucionais e Cooperação Federativa (LC 140/11)",
              "aliases": [
                "art. 225 da cf",
                "competência concorrente",
                "competência comum",
                "lei complementar 140/11",
                "atuação supletiva e subsidiária",
                "transparência ambiental (ativa e passiva)",
                "princípio da proibição do retrocesso"
              ]
            }
          ]
        },
        {
          "id": "amb_espacos",
          "nivel_2": "Espaços Territorialmente Protegidos",
          "topicos": [
            {
              "id": "amb_esp_snuc",
              "nivel_3": "Sistema Nacional de Unidades de Conservação (SNUC - Lei 9.985/00)",
              "aliases": [
                "unidades de proteção integral",
                "unidades de uso sustentável",
                "compensação ambiental",
                "criação, alteração e desafetação de ucs",
                "plano de manejo"
              ]
            },
            {
              "id": "amb_esp_florestal",
              "nivel_3": "Código Florestal (APP, Reserva Legal e CAR - Lei 12.651/12)",
              "aliases": [
                "área de preservação permanente",
                "área rural consolidada",
                "programa de regularização ambiental (pra)",
                "proibição do uso de fogo",
                "cota de reserva ambiental (cra)",
                "documento de origem florestal (dof)"
              ]
            },
            {
              "id": "amb_esp_biomas",
              "nivel_3": "Lei da Mata Atlântica (Lei nº 11.428/06) e Proteção de Outros Biomas",
              "aliases": []
            }
          ]
        },
        {
          "id": "amb_micro",
          "nivel_2": "Microssistemas Ambientais",
          "topicos": [
            {
              "id": "amb_mic_hidricos",
              "nivel_3": "Recursos Hídricos (Lei nº 9.433/97) e Segurança de Barragens (Lei nº 12.334/10)",
              "aliases": [
                "outorga",
                "cobrança pelo uso da água",
                "comitê de bacia hidrográfica"
              ]
            },
            {
              "id": "amb_mic_saneamento",
              "nivel_3": "Resíduos Sólidos (Lei nº 12.305/10), Saneamento e Agrotóxicos",
              "aliases": [
                "responsabilidade compartilhada",
                "acordo setorial",
                "logística reversa",
                "lei nº 14.785/2023"
              ]
            },
            {
              "id": "amb_mic_clima",
              "nivel_3": "Mudanças Climáticas, Biodiversidade e Pagamento por Serviços Ambientais",
              "aliases": [
                "mercado de carbono",
                "conhecimento tradicional associado",
                "política nacional de pagamento por serviços ambientais (pnpsa - lei 14.119/21)",
                "fundo do clima",
                "acesso ao patrimônio genético"
              ]
            }
          ]
        },
        {
          "id": "urb_estatuto",
          "nivel_2": "Política Urbana e Estatuto da Cidade (Lei 10.257/01)",
          "topicos": [
            {
              "id": "urb_est_diretrizes",
              "nivel_3": "Diretrizes Gerais e Plano Diretor",
              "aliases": [
                "função social da propriedade urbana",
                "gestão democrática",
                "obrigatoriedade do plano diretor"
              ]
            },
            {
              "id": "urb_est_indutores",
              "nivel_3": "Instrumentos Indutores e Tributários",
              "aliases": [
                "parcelamento e edificação compulsórios",
                "iptu progressivo no tempo",
                "desapropriação com pagamento em títulos",
                "outorga onerosa do direito de construir",
                "afetação das mais-valias"
              ]
            },
            {
              "id": "urb_est_controle",
              "nivel_3": "Instrumentos de Intervenção e Controle",
              "aliases": [
                "estudo de impacto de vizinhança (eiv)",
                "operações urbanas consorciadas",
                "direito de preempção",
                "direito de superfície",
                "transferência do direito de construir"
              ]
            }
          ]
        },
        {
          "id": "urb_parcelamento",
          "nivel_2": "Parcelamento do Solo Urbano (Lei 6.766/79)",
          "topicos": [
            {
              "id": "urb_parc_especies",
              "nivel_3": "Espécies, Requisitos e Áreas Públicas",
              "aliases": [
                "loteamento",
                "desmembramento",
                "desdobro",
                "áreas verdes e institucionais",
                "faixa non aedificandi"
              ]
            },
            {
              "id": "urb_parc_registro",
              "nivel_3": "Aprovação, Registro, Contratos e Sanções",
              "aliases": [
                "loteamento clandestino ou irregular",
                "rescisão por inadimplemento",
                "responsabilidade do loteador",
                "crimes contra a administração pública"
              ]
            }
          ]
        },
        {
          "id": "urb_reurb_moradia",
          "nivel_2": "Regularização Fundiária e Direito à Moradia",
          "topicos": [
            {
              "id": "urb_rm_reurb",
              "nivel_3": "Regularização Fundiária Urbana - REURB (Lei 13.465/17)",
              "aliases": [
                "reurb-s (interesse social)",
                "reurb-e (interesse específico)",
                "legitimação fundiária",
                "legitimação de posse",
                "direito real de laje"
              ]
            },
            {
              "id": "urb_rm_instrumentos",
              "nivel_3": "Instrumentos de Titulação e Moradia (Constituição e MP 2.220/01)",
              "aliases": [
                "usucapião especial urbana individual",
                "usucapião especial urbana coletiva",
                "concessão de uso especial para fins de moradia",
                "concessão de direito real de uso (cdru)"
              ]
            }
          ]
        },
        {
          "id": "urb_local_mobilidade",
          "nivel_2": "Mobilidade Urbana e Microssistemas Locais",
          "topicos": [
            {
              "id": "urb_loc_mobilidade",
              "nivel_3": "Política Nacional de Mobilidade Urbana (Lei 12.587/12)",
              "aliases": [
                "transporte público coletivo",
                "política tarifária",
                "acessibilidade"
              ]
            },
            {
              "id": "urb_loc_municipais",
              "nivel_3": "Códigos Municipais, Posturas e Limitações Administrativas",
              "aliases": [
                "código de obras",
                "código de posturas",
                "zoneamento urbano",
                "zonas especiais de interesse social (zeis)",
                "recuos e alinhamentos"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "administrativo",
      "nivel_1": "Direito Administrativo",
      "divisoes": [
        {
          "id": "adm_fundamentos_org",
          "nivel_2": "Fundamentos e Organização Administrativa",
          "topicos": [
            {
              "id": "adm_regime_principios",
              "nivel_3": "Regime Jurídico-Administrativo e Princípios",
              "aliases": [
                "Princípios Constitucionais",
                "Restrições ao princípio da legalidade",
                "A constitucionalização do Direito Administrativo"
              ]
            },
            {
              "id": "adm_lindb",
              "nivel_3": "Lei de Introdução às Normas do Direito Brasileiro (LINDB)",
              "aliases": [
                "Interpretação do direito administrativo",
                "Controle sistemático das relações"
              ]
            },
            {
              "id": "adm_organizacao",
              "nivel_3": "Organização Administrativa",
              "aliases": [
                "Administração Direta e Indireta",
                "Autarquias, Agências Reguladoras e Executivas",
                "Fundações e Consórcios Públicos",
                "Empresas Públicas e Sociedades de Economia Mista"
              ]
            },
            {
              "id": "adm_estatais",
              "nivel_3": "Estatuto das Empresas Estatais",
              "aliases": [
                "Lei nº 13.303/2006"
              ]
            },
            {
              "id": "adm_terceiro_setor",
              "nivel_3": "Terceiro Setor e Entidades de Colaboração",
              "aliases": [
                "Organizações Sociais (OS)",
                "OSCIPs e Organizações da Sociedade Civil",
                "Ajustes Colaborativos"
              ]
            },
            {
              "id": "adm_org_direta",
              "nivel_3": "Administração Direta e Órgãos Públicos",
              "aliases": [
                "desconcentração",
                "teoria do órgão"
              ]
            },
            {
              "id": "adm_org_indireta",
              "nivel_3": "Administração Indireta (Autarquias, Fundações, Estatais)",
              "aliases": [
                "descentralização",
                "agências reguladoras"
              ]
            },
            {
              "id": "adm_org_terceiro",
              "nivel_3": "Terceiro Setor (OS, OSCIP, Serviços Sociais Autônomos)",
              "aliases": [
                "sistema s",
                "entidades de apoio"
              ]
            }
          ],
          "aliases": [
            "Organização Administrativa"
          ]
        },
        {
          "id": "adm_atos_poderes",
          "nivel_2": "Atos, Poderes e Controles Administrativos",
          "topicos": [
            {
              "id": "adm_atos",
              "nivel_3": "Atos Administrativos",
              "aliases": [
                "Conceito, elementos, atributos e espécies",
                "Validade, eficácia e extinção (anulação, revogação, caducidade, etc.)",
                "Controle de mérito e de legalidade"
              ]
            },
            {
              "id": "adm_poderes",
              "nivel_3": "Poderes Administrativos",
              "aliases": [
                "Poder de Polícia"
              ]
            },
            {
              "id": "adm_poderes_policia",
              "nivel_3": "Poder de Polícia (Ciclo, Delegação e Limites)",
              "aliases": [
                "consentimento",
                "fiscalização",
                "sanção"
              ]
            },
            {
              "id": "adm_poderes_outros",
              "nivel_3": "Poderes Hierárquico, Disciplinar e Normativo",
              "aliases": [
                "delegação",
                "avocação",
                "regulamentar"
              ]
            },
            {
              "id": "adm_atos_teoria",
              "nivel_3": "Conceito, Requisitos (Elementos) e Atributos",
              "aliases": [
                "competência",
                "finalidade",
                "presunção de legitimidade"
              ]
            },
            {
              "id": "adm_atos_extincao",
              "nivel_3": "Extinção (Anulação, Revogação, Cassação) e Convalidação",
              "aliases": [
                "desfazimento",
                "caducidade"
              ]
            },
            {
              "id": "adm_atos_especies",
              "nivel_3": "Classificação e Espécies",
              "aliases": [
                "atos normativos",
                "atos punitivos"
              ]
            },
            {
              "id": "adm_contratos_teoria",
              "nivel_3": "Teoria Geral, Alteração e Cláusulas Exorbitantes",
              "aliases": [
                "equilíbrio econômico-financeiro",
                "reajuste"
              ]
            },
            {
              "id": "adm_contratos_ext",
              "nivel_3": "Extinção, Sanções e Meios Alternativos de Resolução",
              "aliases": [
                "rescisão unilateral",
                "arbitragem"
              ]
            }
          ],
          "aliases": [
            "Poderes da Administração",
            "Atos Administrativos",
            "Contratos Administrativos"
          ]
        },
        {
          "id": "adm_agentes_publicos",
          "nivel_2": "Agentes Públicos",
          "topicos": [
            {
              "id": "adm_agentes_regime",
              "nivel_3": "Regime dos Servidores Públicos",
              "aliases": [
                "Cargo, emprego e função pública",
                "Provimento, vacância, remoção, redistribuição e substituição",
                "Direitos, vantagens, deveres e responsabilidades"
              ]
            },
            {
              "id": "adm_agentes_disciplinar",
              "nivel_3": "Regime Disciplinar e Seguridade Social",
              "aliases": [
                "Aposentadoria e pensões",
                "Aposentadoria de magistrado e MP"
              ]
            },
            {
              "id": "adm_agentes_loman",
              "nivel_3": "Lei Orgânica da Magistratura Nacional (LOMAN)",
              "aliases": [
                "LC nº 35/1979"
              ]
            },
            {
              "id": "adm_agentes_estaduais",
              "nivel_3": "Estatuto dos Servidores Públicos de Pernambuco",
              "aliases": [
                "Lei Estadual nº 6.123/1968"
              ]
            },
            {
              "id": "adm_servicos_teoria",
              "nivel_3": "Teoria Geral, Princípios e Direitos dos Usuários",
              "aliases": [
                "continuidade",
                "modicidade"
              ]
            },
            {
              "id": "adm_servicos_delegao",
              "nivel_3": "Concessões, Permissões (Lei 8.987) e PPPs (Lei 11.079)",
              "aliases": [
                "concessão patrocinada",
                "caducidade da concessão"
              ]
            },
            {
              "id": "adm_agentes_const",
              "nivel_3": "Disposições Constitucionais (Acesso, Acumulação, Teto)",
              "aliases": [
                "concurso público",
                "greve"
              ]
            },
            {
              "id": "adm_agentes_estatuto",
              "nivel_3": "Provimento, Vacância, Direitos e Vantagens (Estatutos)",
              "aliases": [
                "posse",
                "estágio probatório",
                "aposentadoria"
              ]
            },
            {
              "id": "adm_agentes_pad",
              "nivel_3": "Responsabilidade e Processo Administrativo Disciplinar (PAD)",
              "aliases": [
                "sindicância",
                "demissão"
              ]
            },
            {
              "id": "adm_bens_class",
              "nivel_3": "Classificação, Características e Afetação/Desafetação",
              "aliases": [
                "impenhorabilidade",
                "uso comum do povo"
              ]
            },
            {
              "id": "adm_bens_uso",
              "nivel_3": "Aquisição, Alienação e Uso por Particulares",
              "aliases": [
                "autorização de uso",
                "concessão de uso"
              ]
            }
          ],
          "aliases": [
            "Serviços Públicos",
            "Bens Públicos"
          ]
        },
        {
          "id": "adm_licitacoes_contratos",
          "nivel_2": "Licitações e Contratos",
          "topicos": [
            {
              "id": "adm_licitacao",
              "nivel_3": "Licitações (Lei nº 14.133/2021)",
              "aliases": [
                "Princípios e modalidades",
                "Dispensa e Inexigibilidade",
                "Fases da licitação, habilitação e julgamento",
                "Registro de preços e RDC"
              ]
            },
            {
              "id": "adm_contratos",
              "nivel_3": "Contratos Administrativos",
              "aliases": [
                "Espécies e características",
                "Prerrogativas da Administração",
                "Execução, inexecução e rescisão",
                "Teoria da Imprevisão e Cláusula rebus sic stantibus"
              ]
            },
            {
              "id": "adm_licit_modalidades",
              "nivel_3": "Princípios, Fases e Modalidades (Lei 14.133/21)",
              "aliases": [
                "pregão",
                "concorrência",
                "edital"
              ]
            },
            {
              "id": "adm_licit_direta",
              "nivel_3": "Contratação Direta (Dispensa e Inexigibilidade)",
              "aliases": [
                "licitação dispensável",
                "licitação frustrada"
              ]
            }
          ],
          "aliases": [
            "Licitações e Contratações"
          ]
        },
        {
          "id": "adm_servicos_bens",
          "nivel_2": "Serviços Públicos, Bens e Intervenção",
          "topicos": [
            {
              "id": "adm_servicos",
              "nivel_3": "Serviços Públicos e Delegações",
              "aliases": [
                "Concessões e Permissões (Lei nº 8.987/1995)",
                "Parcerias Público-Privadas (PPPs)",
                "Convênios e Consórcios"
              ]
            },
            {
              "id": "adm_bens",
              "nivel_3": "Domínio Público e Bens Públicos",
              "aliases": [
                "Regime jurídico, classificação e utilização",
                "Alienação",
                "Estatuto da Cidade (Lei nº 10.257/2001)"
              ]
            },
            {
              "id": "adm_intervencao_propriedade",
              "nivel_3": "Intervenção do Estado na Propriedade",
              "aliases": [
                "Desapropriação e Retrocessão",
                "Servidão administrativa, Tombamento e Requisição",
                "Ocupação provisória e Limitação administrativa",
                "Loteamento e zoneamento"
              ]
            }
          ]
        },
        {
          "id": "adm_probidade_responsabilidade",
          "nivel_2": "Probidade e Responsabilidade Civil",
          "topicos": [
            {
              "id": "adm_responsabilidade",
              "nivel_3": "Responsabilidade Civil do Estado",
              "aliases": [
                "Responsabilidade objetiva e subjetiva",
                "Causas de exclusão e mitigação",
                "Direito de regresso"
              ]
            },
            {
              "id": "adm_improbidade",
              "nivel_3": "Improbidade Administrativa (Lei nº 8.429/1992)",
              "aliases": [
                "Atos de improbidade (Enriquecimento ilícito, Prejuízo ao erário)",
                "Penas, procedimento e prescrição"
              ]
            },
            {
              "id": "adm_transparencia_anticorrupcao",
              "nivel_3": "Legislação Anticorrupção e Transparência",
              "aliases": [
                "Lei de Responsabilidade Fiscal (LC nº 101/2000)",
                "Lei de Acesso à Informação (Lei nº 12.527/2011)",
                "Lei Anticorrupção (Lei nº 12.846/2013)"
              ]
            },
            {
              "id": "adm_resp_teoria",
              "nivel_3": "Evolução, Regra Constitucional e Ação de Regresso",
              "aliases": [
                "teoria do risco administrativo",
                "responsabilidade objetiva"
              ]
            },
            {
              "id": "adm_resp_excludentes",
              "nivel_3": "Causas Excludentes e Atenuantes",
              "aliases": [
                "culpa exclusiva da vítima",
                "força maior"
              ]
            }
          ],
          "aliases": [
            "Responsabilidade Civil do Estado"
          ]
        },
        {
          "id": "adm_processo_infracoes",
          "nivel_2": "Processo Administrativo e Infrações",
          "topicos": [
            {
              "id": "adm_processo_geral",
              "nivel_3": "Infrações, Sanções e Processo Administrativo",
              "aliases": [
                "Princípios, sujeitos e instrução",
                "Sindicância e recursos",
                "Coisa julgada, revisão, prescrição e decadência"
              ]
            },
            {
              "id": "adm_processo_pe",
              "nivel_3": "Processo Administrativo Estadual",
              "aliases": [
                "Lei Estadual nº 11.781/2000"
              ]
            }
          ]
        },
        {
          "id": "adm_jurisprudencia",
          "nivel_2": "Jurisprudência e Súmulas",
          "topicos": [
            {
              "id": "adm_jur_stf_stj",
              "nivel_3": "Jurisprudência dos Tribunais Superiores",
              "aliases": [
                "Súmulas Vinculantes",
                "Recursos repetitivos e repercussão geral em Direito Administrativo"
              ]
            }
          ]
        },
        {
          "id": "adm_regime",
          "nivel_2": "Regime Jurídico e Princípios",
          "topicos": [
            {
              "id": "adm_regime_princ",
              "nivel_3": "Princípios Expressos, Implícitos e Fontes",
              "aliases": [
                "limpe",
                "supremacia do interesse público"
              ]
            }
          ]
        },
        {
          "id": "adm_controle",
          "nivel_2": "Controle da Administração",
          "topicos": [
            {
              "id": "adm_controle_adm_jud",
              "nivel_3": "Controle Administrativo e Judicial",
              "aliases": [
                "autotutela",
                "sindicabilidade",
                "lai"
              ]
            },
            {
              "id": "adm_controle_legis",
              "nivel_3": "Controle Legislativo e Tribunais de Contas",
              "aliases": [
                "sustação de atos",
                "julgamento de contas"
              ]
            },
            {
              "id": "adm_improb_teoria",
              "nivel_3": "Sujeitos, Elemento Subjetivo e Atos (Lei 8.429/92)",
              "aliases": [
                "dolo específico",
                "enriquecimento ilícito"
              ]
            },
            {
              "id": "adm_improb_sancoes",
              "nivel_3": "Sanções, Aspectos Processuais e Acordo (ANPC)",
              "aliases": [
                "indisponibilidade de bens",
                "prescrição intercorrente"
              ]
            }
          ]
        },
        {
          "id": "adm_intervencao",
          "nivel_2": "Intervenção na Propriedade",
          "topicos": [
            {
              "id": "adm_interv_desaprop",
              "nivel_3": "Desapropriação (Comum e Sancionatória)",
              "aliases": [
                "tredestinação",
                "retrocessão",
                "indenização"
              ]
            },
            {
              "id": "adm_interv_outras",
              "nivel_3": "Servidão, Tombamento, Requisição e Ocupação",
              "aliases": [
                "limitações administrativas",
                "restrições"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "agrario",
      "nivel_1": "Direito Agrário",
      "divisoes": [
        {
          "id": "agr_teoria",
          "nivel_2": "Teoria Geral, Histórico e Conceitos Fundamentais",
          "topicos": [
            {
              "id": "agr_teo_historico",
              "nivel_3": "Histórico do Direito Agrário e Lei de Terras (Lei 601/1850)",
              "aliases": [
                "registro paroquial",
                "sesmarias",
                "criminalização do apossamento"
              ]
            },
            {
              "id": "agr_teo_conceitos",
              "nivel_3": "Conceitos Básicos (Estatuto da Terra - Lei 4.504/64)",
              "aliases": [
                "imóvel rural (prédio rústico)",
                "módulo rural",
                "módulo fiscal",
                "fração mínima de parcelamento",
                "georreferenciamento"
              ]
            }
          ]
        },
        {
          "id": "agr_const",
          "nivel_2": "Política Agrária e Aspectos Constitucionais",
          "topicos": [
            {
              "id": "agr_const_funcao",
              "nivel_3": "Função Social da Propriedade Rural",
              "aliases": [
                "aproveitamento racional e adequado",
                "preservação do meio ambiente",
                "observância das normas trabalhistas",
                "bem-estar dos proprietários e trabalhadores"
              ]
            },
            {
              "id": "agr_const_desaprop",
              "nivel_3": "Desapropriação para Fins de Reforma Agrária e Vistoria (LC 76/93 e Lei 8.629/93)",
              "aliases": [
                "pequena e média propriedade (imunidade)",
                "propriedade produtiva",
                "títulos da dívida agrária (tda)",
                "indenização de benfeitorias",
                "esbulho possessório (vedação de vistoria)",
                "rito sumário"
              ]
            },
            {
              "id": "agr_const_politica",
              "nivel_3": "Política Agrícola e Fundiária",
              "aliases": [
                "plano nacional de reforma agrária",
                "participação do setor de produção"
              ]
            }
          ]
        },
        {
          "id": "agr_terras",
          "nivel_2": "Terras Públicas e Povos Tradicionais",
          "topicos": [
            {
              "id": "agr_terras_devolutas",
              "nivel_3": "Terras Devolutas e Ação Discriminatória",
              "aliases": [
                "conceito de terras devolutas",
                "procedimento discriminatório judicial (natureza declaratória)",
                "legitimação de posse",
                "bens de domínio da união e estados"
              ]
            },
            {
              "id": "agr_terras_tradicionais",
              "nivel_3": "Terras Indígenas e Comunidades Quilombolas",
              "aliases": [
                "ocupação tradicional",
                "usufruto exclusivo",
                "inalienabilidade e indisponibilidade",
                "remanescentes de quilombos (propriedade definitiva)"
              ]
            }
          ]
        },
        {
          "id": "agr_aquisicao",
          "nivel_2": "Aquisição da Propriedade e Posse Agrária",
          "topicos": [
            {
              "id": "agr_aq_usucapiao",
              "nivel_3": "Usucapião Constitucional Rural (Especial/Pro Labore)",
              "aliases": [
                "limite de 50 hectares",
                "posse agrária originária",
                "prazo de 5 anos ininterruptos",
                "moradia e trabalho produtivo",
                "lei 6.969/81"
              ]
            },
            {
              "id": "agr_aq_estrangeiro",
              "nivel_3": "Aquisição e Arrendamento por Estrangeiros (Lei 5.709/71)",
              "aliases": [
                "limitação de módulos",
                "pessoa jurídica brasileira com capital estrangeiro",
                "autorização do congresso nacional"
              ]
            }
          ]
        },
        {
          "id": "agr_contratos",
          "nivel_2": "Contratos Agrários (Decreto 59.566/66)",
          "topicos": [
            {
              "id": "agr_cont_teoria",
              "nivel_3": "Teoria Geral dos Contratos Agrários",
              "aliases": [
                "prazos mínimos",
                "proteção social e econômica",
                "compáscuo",
                "contrato de integração agrária"
              ]
            },
            {
              "id": "agr_cont_especies",
              "nivel_3": "Arrendamento e Parceria Rural",
              "aliases": [
                "cota-parte do proprietário",
                "subarrendamento",
                "indenização por benfeitorias (úteis e necessárias)",
                "formas de retribuição"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "inst",
      "nivel_1": "Direito Institucional (Magistratura, MP e Defensoria)",
      "divisoes": [
        {
          "id": "inst_dpe",
          "nivel_2": "Defensoria Pública (LC 80/94)",
          "topicos": [
            {
              "id": "inst_dpe_princ",
              "nivel_3": "Histórico, Princípios Institucionais, Autonomia e Objetivos",
              "aliases": [
                "indivisibilidade",
                "independência funcional",
                "assistência jurídica integral e gratuita",
                "custos vulnerabilis",
                "ec 45/04 e ec 80/14",
                "capacidade postulatória e poder de requisição"
              ]
            },
            {
              "id": "inst_dpe_modelos",
              "nivel_3": "Modelos de Assistência Jurídica e Evolução do Acesso à Justiça",
              "aliases": [
                "ondas renovatórias (cappelletti e garth)",
                "modelo judicare",
                "salaried staff",
                "advocacia pro bono"
              ]
            },
            {
              "id": "inst_dpe_org",
              "nivel_3": "Organização: Órgãos de Administração Superior e Execução",
              "aliases": [
                "conselho superior",
                "defensor público-geral",
                "corregedoria-geral",
                "ouvidoria"
              ]
            },
            {
              "id": "inst_dpe_carreira",
              "nivel_3": "Ingresso, Carreira, Promoção e Remoção",
              "aliases": [
                "estágio probatório",
                "critérios de promoção"
              ]
            },
            {
              "id": "inst_dpe_garantias",
              "nivel_3": "Garantias, Prerrogativas, Direitos e Vedações do Defensor",
              "aliases": [
                "intimação pessoal",
                "prazo em dobro",
                "inamovibilidade",
                "poder de requisição"
              ]
            },
            {
              "id": "inst_dpe_estadual",
              "nivel_3": "Legislação Estadual, Normas Internas e Resoluções do CSDPE",
              "aliases": [
                "critérios de hipossuficiência",
                "denegação de atendimento",
                "leis orgânicas estaduais",
                "participação popular (ouvidoria externa)",
                "fundo de aparelhamento (faj)"
              ]
            },
            {
              "id": "inst_dpe_funcoes",
              "nivel_3": "Funções Institucionais e Legitimidade de Atuação (Jurisprudência)",
              "aliases": [
                "ação civil pública pela dpe",
                "curadoria especial",
                "atuação a favor de pessoa jurídica",
                "tutela coletiva",
                "conflito de atribuições"
              ]
            },
            {
              "id": "inst_dpe_auxiliares",
              "nivel_3": "Órgãos Auxiliares, Fundos e Escolas da Defensoria",
              "aliases": [
                "fundo de assistência/aparelhamento (faj/fundep)",
                "escola superior da defensoria pública",
                "centros de atendimento multidisciplinar",
                "participação popular"
              ]
            }
          ]
        },
        {
          "id": "inst_mp",
          "nivel_2": "Ministério Público (Lei 8.625/93 e LC 75/93)",
          "topicos": [
            {
              "id": "inst_mp_princ",
              "nivel_3": "Princípios Institucionais, Autonomia e CNMP",
              "aliases": [
                "unidade",
                "conselho nacional do ministério público"
              ]
            },
            {
              "id": "inst_mp_org",
              "nivel_3": "Organização (MPE) e Órgãos de Administração Superior e Colégios",
              "aliases": [
                "procurador-geral de justiça",
                "colégio de procuradores",
                "conselho superior do mp",
                "corregedoria-geral",
                "eleição e destituição do pgj"
              ]
            },
            {
              "id": "inst_mp_garantias",
              "nivel_3": "Garantias, Prerrogativas, Vedações e Processo Disciplinar",
              "aliases": [
                "vitaliciedade",
                "irredutibilidade de subsídio",
                "atividade político-partidária"
              ]
            },
            {
              "id": "inst_mp_cnmp",
              "nivel_3": "Resoluções do CNMP e Procedimentos Extrajudiciais",
              "aliases": [
                "procedimento investigatório criminal (pic)",
                "inquérito civil",
                "notícia de fato",
                "procedimento administrativo"
              ]
            },
            {
              "id": "inst_mp_estadual",
              "nivel_3": "Legislação Estadual do Ministério Público",
              "aliases": [
                "leis orgânicas estaduais (lompe)",
                "regimentos internos",
                "eleição do procurador-geral de justiça nos estados"
              ]
            },
            {
              "id": "inst_mp_mpu_eleitoral",
              "nivel_3": "Ministério Público da União (LC 75/93) e MP Eleitoral",
              "aliases": [
                "estrutura do mpu",
                "procurador-geral da república (pgr)",
                "promotor e procurador eleitoral"
              ]
            }
          ]
        },
        {
          "id": "inst_magis",
          "nivel_2": "Magistratura e Organização Judiciária",
          "topicos": [
            {
              "id": "inst_mag_princ",
              "nivel_3": "Princípios, Autonomia e Conselho Nacional de Justiça (CNJ)",
              "aliases": [
                "garantias da magistratura",
                "independência judicial",
                "atribuições do cnj"
              ]
            },
            {
              "id": "inst_mag_carreira",
              "nivel_3": "Ingresso, Promoção, Remoção e Vitaliciedade",
              "aliases": [
                "quinto constitucional",
                "escalonamento na carreira"
              ]
            },
            {
              "id": "inst_mag_garantias",
              "nivel_3": "Direitos, Deveres, Prerrogativas e Processo Disciplinar",
              "aliases": [
                "aposentadoria compulsória",
                "sanções disciplinares",
                "vedações aos magistrados"
              ]
            },
            {
              "id": "inst_mag_coje",
              "nivel_3": "Códigos de Organização e Divisão Judiciárias Estaduais (COJE)",
              "aliases": [
                "comarcas e entrâncias (criação e classificação)",
                "varas especializadas",
                "órgão especial",
                "tribunal pleno"
              ]
            },
            {
              "id": "inst_mag_serventuarios",
              "nivel_3": "Serventuários, Auxiliares da Justiça e Justiça de Paz",
              "aliases": [
                "juiz de paz",
                "escrivães",
                "oficiais de justiça",
                "regimes de lotação e permuta de serventuários"
              ]
            },
            {
              "id": "inst_mag_jec",
              "nivel_3": "Sistema dos Juizados Especiais e Turmas Recursais",
              "aliases": [
                "turma de uniformização",
                "conflitos de competência nos juizados"
              ]
            },
            {
              "id": "inst_mag_orgaos_cupula",
              "nivel_3": "Órgãos Diretivos e de Cúpula dos Tribunais",
              "aliases": [
                "presidente e vice-presidente do tj",
                "corregedoria-geral da justiça",
                "conselho da magistratura"
              ]
            },
            {
              "id": "inst_mag_fundos_regimento",
              "nivel_3": "Regimento Interno, Fundos Especiais e Custas",
              "aliases": [
                "funjuris / fundos de reaparelhamento",
                "regimento interno",
                "sessões do tribunal pleno e turmas",
                "súmulas locais do tj"
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "humanistica_dh",
      "nivel_1": "Noções Gerais de Direito, Formação Humanística e Direitos Humanos",
      "divisoes": [
        {
          "id": "hum_leg_estadual",
          "nivel_2": "Legislação Estadual de Pernambuco",
          "topicos": [
            {
              "id": "hum_leg_pe_estatutos",
              "nivel_3": "Estatutos e Códigos Judiciários",
              "aliases": [
                "Estatuto dos Servidores Públicos de PE (Lei nº 6.123/1968)",
                "Código de Organização Judiciária de PE (LC nº 100/2007)"
              ]
            },
            {
              "id": "hum_leg_pe_custas",
              "nivel_3": "Custas, Taxa Judiciária e Previdência",
              "aliases": [
                "Regime jurídico da taxa judiciária (Lei nº 17.116/2020)",
                "Sistema de Previdência Social dos Servidores (LC nº 28/2000)"
              ]
            },
            {
              "id": "hum_leg_pe_const",
              "nivel_3": "Constituição Estadual e Regimento",
              "aliases": [
                "Constituição do Estado de Pernambuco",
                "Regimento interno do Tribunal de Justiça de Pernambuco (TJPE)"
              ]
            }
          ]
        },
        {
          "id": "hum_sociologia",
          "nivel_2": "Sociologia do Direito",
          "topicos": [
            {
              "id": "hum_soc_administracao",
              "nivel_3": "Sociologia da Administração Judiciária",
              "aliases": [
                "Aspectos gerenciais",
                "Gestão de pessoas e economia"
              ]
            },
            {
              "id": "hum_soc_relacoes",
              "nivel_3": "Relações Sociais e Comunicação",
              "aliases": [
                "Controle social e o Direito",
                "Transformações sociais",
                "Direito, Comunicação Social e opinião pública"
              ]
            },
            {
              "id": "hum_soc_conflitos",
              "nivel_3": "Conflitos Sociais",
              "aliases": [
                "Sistemas não judiciais de composição de litígios",
                "Mecanismos de resolução"
              ]
            }
          ]
        },
        {
          "id": "hum_psicologia",
          "nivel_2": "Psicologia Judiciária",
          "topicos": [
            {
              "id": "hum_psi_comunicacao",
              "nivel_3": "Psicologia e Comunicação",
              "aliases": [
                "Relacionamento interpessoal",
                "Relacionamento do magistrado com a sociedade e a mídia"
              ]
            },
            {
              "id": "hum_psi_problemas",
              "nivel_3": "Problemas Atuais com Reflexos no Direito",
              "aliases": [
                "Assédio moral",
                "Assédio sexual"
              ]
            },
            {
              "id": "hum_psi_conflitos",
              "nivel_3": "Teoria do Conflito e Verdade Judicial",
              "aliases": [
                "Mecanismos autocompositivos",
                "Técnicas de negociação e mediação",
                "Processo psicológico, comportamento de partes e testemunhas"
              ]
            }
          ]
        },
        {
          "id": "hum_etica",
          "nivel_2": "Ética e Estatuto Jurídico da Magistratura Nacional",
          "topicos": [
            {
              "id": "hum_etica_regime",
              "nivel_3": "Regime Jurídico, Direitos e Deveres",
              "aliases": [
                "Carreiras, ingresso, promoções e remoções",
                "Integridade pessoal, honra e decoro",
                "Cortesia e prudência do Juiz"
              ]
            },
            {
              "id": "hum_etica_codigo",
              "nivel_3": "Código de Ética da Magistratura Nacional",
              "aliases": [
                "Ilícitos éticos e sanções",
                "O papel da cordialidade na prestação jurisdicional"
              ]
            },
            {
              "id": "hum_etica_controles",
              "nivel_3": "Administração, Controles e Responsabilidade",
              "aliases": [
                "Sistemas de controle interno (Corregedorias, Ouvidorias, CNJ)",
                "Responsabilidade administrativa, civil e criminal",
                "Administração judicial e planejamento estratégico"
              ]
            }
          ]
        },
        {
          "id": "hum_filosofia",
          "nivel_2": "Filosofia do Direito",
          "topicos": [
            {
              "id": "hum_fil_justica",
              "nivel_3": "O Conceito de Justiça e de Direito",
              "aliases": [
                "Justiça como valor universal e jurídico-político",
                "Equidade",
                "Direito e Moral"
              ]
            },
            {
              "id": "hum_fil_interpretacao",
              "nivel_3": "Interpretação do Direito",
              "aliases": [
                "A lógica do razoável",
                "Superação do raciocínio lógico-dedutivo"
              ]
            }
          ]
        },
        {
          "id": "hum_teoria_geral",
          "nivel_2": "Teoria Geral do Direito e da Política",
          "topicos": [
            {
              "id": "hum_tgd_direito",
              "nivel_3": "Direito Objetivo, Subjetivo e Fontes",
              "aliases": [
                "Princípios gerais de Direito",
                "Jurisprudência e Súmula vinculante"
              ]
            },
            {
              "id": "hum_tgd_eficacia",
              "nivel_3": "Eficácia da Lei no Tempo",
              "aliases": [
                "Conflito de normas jurídicas no tempo"
              ]
            },
            {
              "id": "hum_tgd_politica",
              "nivel_3": "Política e Ideologias",
              "aliases": [
                "Conceito de política",
                "Política e Direito"
              ]
            },
            {
              "id": "hum_tgd_onu_agenda",
              "nivel_3": "ONU e Agenda 2030",
              "aliases": [
                "Declaração Universal dos Direitos do Homem (DUDH)",
                "Agenda 2030 e os 17 ODS"
              ]
            },
            {
              "id": "hum_tgd_genero",
              "nivel_3": "Gênero e Protocolo de Julgamento",
              "aliases": [
                "Gênero e Patriarcado",
                "Gênero e Raça",
                "Protocolo de Julgamento com perspectiva de gênero (CNJ)"
              ]
            }
          ]
        },
        {
          "id": "hum_digital",
          "nivel_2": "Direito Digital",
          "topicos": [
            {
              "id": "hum_dig_judiciario",
              "nivel_3": "Transformação Digital no Poder Judiciário",
              "aliases": [
                "4ª Revolução industrial",
                "Inteligência Artificial e Direito",
                "Ciência de dados, jurimetria e audiências virtuais"
              ]
            },
            {
              "id": "hum_dig_penal",
              "nivel_3": "Persecução Penal e Novas Tecnologias",
              "aliases": [
                "Crimes virtuais e cibersegurança",
                "Deepweb e Darkweb",
                "Provas digitais e criptomoedas"
              ]
            },
            {
              "id": "hum_dig_contratos_dados",
              "nivel_3": "Contratos Inteligentes e Proteção de Dados",
              "aliases": [
                "Blockchain e algoritmos",
                "LGPD e proteção de dados pessoais"
              ]
            }
          ]
        },
        {
          "id": "hum_pragmatismo_economia",
          "nivel_2": "Pragmatismo, Análise Econômica e Economia Comportamental",
          "topicos": [
            {
              "id": "hum_pec_pragmatismo",
              "nivel_3": "Função Judicial e Pragmatismo",
              "aliases": [
                "Consequencialismo, Antifundacionalismo",
                "Racionalismo, Empirismo e Utilitarismo"
              ]
            },
            {
              "id": "hum_pec_aed",
              "nivel_3": "Análise Econômica do Direito",
              "aliases": [
                "Eficiência processual e racionalidade econômica",
                "Demandas frívolas",
                "Precedentes, segurança jurídica e coisa julgada"
              ]
            },
            {
              "id": "hum_pec_comportamental",
              "nivel_3": "Economia Comportamental e Governança",
              "aliases": [
                "Heurística e vieses cognitivos",
                "Governança corporativa e Compliance no Brasil",
                "Whistleblower"
              ]
            }
          ]
        },
        {
          "id": "hum_antidiscriminacao",
          "nivel_2": "Direito da Antidiscriminação",
          "topicos": [
            {
              "id": "hum_antid_conceitos",
              "nivel_3": "Conceitos e Modalidades de Discriminação",
              "aliases": [
                "Racismo, Sexismo, Intolerância Religiosa, LGBTQIA+fobia",
                "Legislação antidiscriminação nacional e internacional"
              ]
            },
            {
              "id": "hum_antid_acoes_povos",
              "nivel_3": "Ações Afirmativas e Povos Tradicionais",
              "aliases": [
                "Direitos dos Povos indígenas",
                "Direitos das comunidades tradicionais"
              ]
            }
          ]
        },
        {
          "id": "direitos_humanos",
          "nivel_2": "Direitos Humanos",
          "topicos": [
            {
              "id": "dh_teoria_sistemas",
              "nivel_3": "Teoria Geral e Sistemas de Proteção",
              "aliases": [
                "Sistema global de proteção",
                "Sistema regional interamericano"
              ]
            },
            {
              "id": "dh_aplicacao_brasil",
              "nivel_3": "Aplicação e Controle de Convencionalidade",
              "aliases": [
                "Controle de convencionalidade",
                "Relação entre o direito internacional e o direito brasileiro",
                "Os direitos humanos na CF/1988 e a jurisprudência do STF"
              ]
            }
          ]
        },
        {
          "id": "dh_teoria",
          "nivel_2": "Teoria Geral e Fundamentos",
          "topicos": [
            {
              "id": "dh_teo_fund",
              "nivel_3": "Histórico, Fundamentos e Características (Universalidade, Indivisibilidade)",
              "aliases": [
                "gerações/dimensões de direitos",
                "relativismo cultural",
                "efetividade",
                "interseccionalidade",
                "teoria crítica e decolonialidade"
              ]
            },
            {
              "id": "dh_teo_incorp",
              "nivel_3": "Incorporação de Tratados, Status Normativo e IDC",
              "aliases": [
                "supralegalidade",
                "bloco de constitucionalidade",
                "incidente de deslocamento de competência"
              ]
            },
            {
              "id": "dh_teo_convenc",
              "nivel_3": "Controle de Convencionalidade e Diálogo das Cortes",
              "aliases": [
                "pro persona",
                "margem de apreciação nacional"
              ]
            }
          ]
        },
        {
          "id": "dh_onu",
          "nivel_2": "Sistema Global (ONU)",
          "topicos": [
            {
              "id": "dh_onu_dudh",
              "nivel_3": "Declaração Universal dos Direitos Humanos (DUDH)",
              "aliases": [
                "carta internacional dos direitos humanos"
              ]
            },
            {
              "id": "dh_onu_pactos",
              "nivel_3": "Pactos Internacionais (PIDCP e PIDESC) e Comitês",
              "aliases": [
                "protocolos facultativos",
                "comitê de direitos humanos"
              ]
            },
            {
              "id": "dh_onu_extrac",
              "nivel_3": "Mecanismos Extraconvencionais (Conselho de DH e RPU)",
              "aliases": [
                "revisão periódica universal",
                "relatores especiais"
              ]
            },
            {
              "id": "dh_onu_tpi",
              "nivel_3": "Direito Internacional Penal e Tribunal Penal Internacional (TPI)",
              "aliases": [
                "estatuto de roma",
                "tribunal de nuremberg",
                "crimes contra a humanidade"
              ]
            }
          ]
        }
      ]
    }
  ]
};