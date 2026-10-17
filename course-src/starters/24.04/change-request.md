# L-43 · Manutenção: migração do relatório

Base histórica: consumers/report/legacy.ts usa limitar(origem.titulo,5). Um patch tentou migrar para objeto em main.ts, mas pode alterar o tamanho. Reproduza primeiro a falha; corrija somente a integração necessária e acrescente regressão que detecte tamanho, ordem, IDs, identidade e entrada preservada. Não reordene itens nem clone origem.

Mostre os três momentos em consumidores externos reais:1.1 histórico aprovado;2.0 histórico rejeitado por TS2345 e TypeError;2.0 migrado aprovado. Compare saída1.1 histórica e2.0 migrada. Demonstre que catálogo segue funcionando sem diff. Anexe diff, comandos, saída do pack e orientação para o consumidor. O starter/referência da equipe constitui infraestrutura; sua manutenção precisa de registro próprio.
