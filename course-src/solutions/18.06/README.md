# Referência 18.06

`RouteNameAnotada` é `string`, porque a anotação declara um índice aberto. `RouteName` é a união literal `"home" | "about"`, preservada pelo objeto `as const satisfies Record<string, Rota>`. `dispatch("home")` compila e retorna `/`; `dispatch("missing")` e uma rota com `path: 1` falham no TypeScript. Em runtime, `dispatch` lê o caminho configurado. `satisfies` verifica a forma sem substituir o tipo inferido e não valida objetos externos.

## Transferência
Para `status: {rascunho:"draft",publicado:"live"}`, compare a anotação `Record<string,string>` com `as const satisfies Record<string,string>`. Registre os tipos de `keyof`, uma chamada permitida, uma chave recusada e qual configuração você manteria em um catálogo de rotas.
