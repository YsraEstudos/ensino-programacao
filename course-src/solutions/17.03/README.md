# Referência 17.03

`map<T,U>` usa T na entrada/callback e U no retorno. `filter<T>` mantém T nos elementos aceitos. As entradas são readonly e as funções constroem arrays de saída sem alterar a original.

## Transferência
Implemente `map` sobre `["a", "b"]` para produzir `[[0,"a"],[1,"b"]]`, usando o índice do callback; filtre a lista por índice par. Mostre que a entrada readonly continua igual após ambas as chamadas. Borda: lista vazia gera dois arrays vazios e nenhum callback.
