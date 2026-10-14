# Referência 19.08

Microprojeto - DSL de eventos tipada: preserve a assinatura publicada, valide os campos e condições descritos e prove os resultados com casos de sucesso e borda.

## Transferência
Para um emitter de estoque com `stockChanged: {sku:string; units:number}` e `itemArchived: {sku:string}`, registre os payloads recebidos e prove que `off` remove só o mesmo callback, repetidamente. Borda: tentar registrar `{units:"4"}` para stockChanged deve falhar no typecheck; listeners do outro evento continuam ativos.
