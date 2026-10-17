# Guia de migração a completar

Leia a declaração pública1.1 e2.0 dentro do pacote instalado. Descreva assinatura retirada e assinatura substituta, comportamento default e exports preservados. Registre diff do consumidor relatório, TS2345 antes, TypeError antes e aprovação depois. consumers/report/main.ts contém uma tentativa defeituosa; mantenha legacy.ts como reprodução histórica.

Preencha tabela de compatibilidade: catálogo1.1/2.0; relatório legado1.1/2.0; relatório migrado1.1/2.0. Para cada célula cite comando e saída de execução real. Não declare sucesso por compilação isolada ou por imports de src.

Plano de rollout: responsáveis, comunicação/revisão, trava de major, janela sintética e critério de rollback. Limites: pacote ESM e consumidores locais; não foi exercitado registry público, CJS, browser ou integração contínua real.
