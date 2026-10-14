# Referência 18.10

Cada utility deriva do contrato-fonte: LoadedUser remove Promise, PresentUser remove null, HandleInput usa parâmetro da função e Exclude/Extract selecionam membros da union. Nenhuma dessas transformações valida JSON em runtime.

## Transferência
Derive os tipos de uma nova API `loadUser(): Promise<User | null>` e eventos `created | failed`; extraia retorno com Awaited/ReturnType, remova null e exclua `failed` para compor os eventos de sucesso. Borda: mostre que `handle("failed")` não pertence ao subconjunto e que o tipo extraído não muda o comportamento runtime.
