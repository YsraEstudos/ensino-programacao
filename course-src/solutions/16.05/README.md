# Referência 16.05

Type predicate: preserve a assinatura publicada, valide os campos e condições descritos e prove os resultados com casos de sucesso e borda.

## Transferência
Crie `isProduct(value: unknown): value is Product` para `{sku: string, stock: number}` e filtre uma lista contendo produto válido, sku numérico, stock negativo e null. Defina quais itens permanecem; na borda, decida se stock zero é válido e faça o predicado refletir essa decisão.
