# Referência 16.02

Parsons de narrowing: preserve a assinatura publicada, valide os campos e condições descritos e prove os resultados com casos de sucesso e borda.

## Transferência
Uma API recebe `preco: string | number | null`. Defina a saída de `formatarPreco(1299)`, `formatarPreco("1299.50")` e `formatarPreco(null)`; escolha e declare uma política para string numérica decimal. Na borda, compare `0` com `"0"` e mostre por que a guarda escolhida não confunde os tipos.
