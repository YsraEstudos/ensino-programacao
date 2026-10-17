# I-F32 — Tarefas antigas sumiram na atualização

Sintoma: clientes v1 têm cards completos; app v2 abre vazio mesmo sem erro de rede. Reprodução determinística: `npm.cmd run test:e2e -- --grep IndexedDB` cria banco v1 real, escreve tarefa legada, fecha, abre versão2 e compara dados exatos após upgrade/reabertura. Starter perde o registro porque não migra; uma versão com migração desligada deve reprovar por asserção.

Investigue oldVersion, stores, transação de upgrade e ordem de commit. Recupere dados a partir de cards preservado, sem apagar banco como "correção". Escreva sintoma/linha do tempo/hipóteses/causa/recuperação/prevenção/limites em postmortem.md. Para banco real, exporte backup antes de alterar; a fixture usa contexto isolado e não contém dados reais.
