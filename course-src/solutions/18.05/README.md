# Referência 18.05

O mapa mapeado associa cada evento a um payload distinto, incluindo close sem payload. `handle<K>` preserva essa relação; `Record<string, unknown>` ou Partial perderia completude e correlação.

## Transferência
Crie mapa de handlers para comandos `archive: {id:string}`, `rename: {id:string; title:string}` e `refresh: undefined`. Mostre chamadas válidas correlacionadas e o diagnóstico se `rename` for removido; borda: `archive` com payload de rename deve ser recusado.
