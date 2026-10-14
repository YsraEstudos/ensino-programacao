# Referência 18.03

`K extends keyof T` restringe a chave e `T[K]` relaciona o resultado ao campo escolhido. Um cast anterior em dados externos não executa validação de schema.

## Transferência
Aplique `get<T,K extends keyof T>` a `{sku:"A-1", disponivel:true, estoque:0}`: registre os tipos retornados para sku e estoque. Mostre que chave ausente não compila; borda: com `noUncheckedIndexedAccess`, compare essa chave literal conhecida com um índice string desconhecido que pode resultar undefined.
