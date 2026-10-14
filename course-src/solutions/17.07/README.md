# Referência 17.07

O parâmetro de tipo `const` preserva literais da chamada direta, sem congelar o objeto em runtime. Um objeto previamente alargado continua alargado; `as const` no chamador é alternativa.

## Transferência
Crie `defineColumns` com parâmetro const genérico para preservar `[{key:"nome", width:120}, {key:"preco", width:80}]` quando o literal é passado diretamente. Mostre tipo literal e rejeite width string. Borda: um array previamente tipado como `Column[]` já perdeu as chaves literais; explique como recuperar a precisão.
