# Prioridade do sistema em Penas e Prazos — instruções para a sessão do Claude

A prioridade do sistema (Crítico / Importante / Regular) de cada crime (Penas) e de cada prazo (Prazos) é o campo `classificacaoOficial` dos JSON em `dados/penas/` e `dados/prazos/`. Ela vem do **mapa de incidência da Lei Seca** (`dados/leiseca/incidencia/`). No app, o usuário a adota pelo botão "🏷️ Aplicar prioridade do sistema"; a escolhida por ele sempre prevalece.

## Comandos

```bash
python3 ferramentas/prioridade_penas.py            # só mostra o resultado (use -v para ver item a item)
python3 ferramentas/prioridade_penas.py --gravar   # grava em dados/penas/*.json
python3 ferramentas/prioridade_prazos.py           # idem para Prazos
python3 ferramentas/prioridade_prazos.py --gravar
```

## Critério (o mesmo nos dois)

- Cada item recebe a cobrança do dispositivo da sua base legal (`art` em Penas, `base` em Prazos): o mais cobrado, se citar mais de um; sem § nem inciso, o caput ou o mais cobrado dos seus incisos.
- Nível pelos limiares da Lei Seca, relativos ao diploma: **Crítico** = quartil superior das contagens (>0); **Importante** = da mediana ao quartil; **Regular** = abaixo da mediana ou não cobrado.
- Penas: dispositivo criado ou alterado desde 2024 (campo `alteracao`) fica com o **maior** nível entre o da incidência e o anterior (ainda sem histórico de prova).
- Diploma sem mapa de incidência mantém a classificação que tinha.

## Quando rodar

- Ao criar ou atualizar o mapa de incidência de um diploma que tem Penas ou Prazos.
- Ao incluir um diploma novo em Penas ou Prazos.
  - Penas: acrescente a sigla → arquivo do mapa em `INC` (`ferramentas/prioridade_penas.py`).
  - Prazos: acrescente o diploma em `MAP` (`ferramentas/prioridade_prazos.py`).
- Rode sem `--gravar`, confira o resumo ("mudaram X de Y"), grave, confira `git diff --stat` (só linhas `classificacaoOficial`) e faça commit e push no branch e em `main`.
