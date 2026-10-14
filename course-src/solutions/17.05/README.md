# Referência 17.05

A assinatura recebe `readonly number[]`, suficiente para iterar sem escrever. O array não é copiado ou congelado; outra referência mutável ainda pode alterar os mesmos dados.

## Transferência
Use `soma` com a tupla readonly `[4, 7, 9] as const` e com uma variável `readonly number[]` contendo `[2, 3]`; resultados esperados: 20 e 5. Mostre que a função não escreve na entrada. Borda: soma de array vazio é 0.
