# Referência 17.08

Microprojeto - cache genérico: preserve a assinatura publicada, valide os campos e condições descritos e prove os resultados com casos de sucesso e borda.

## Transferência
Teste um `Cache<string, number>` com relógio controlado: grave chave "a" em now=100 com TTL 20, consulte em 119 e em 120, e depois chame has. Resultado: 7 antes do limite, undefined no limite e false após remoção. Borda: uma chave sem expiração continua presente.
