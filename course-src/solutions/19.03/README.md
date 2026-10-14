# Referência 19.03

`infer` extrai o argumento de Promise e o tipo de retorno da função. `Unwrap` mantém tipos que não são Promise. `Awaited` continua uma operação diferente que também desembrulha retornos assíncronos aninhados.

## Transferência
Implemente `Unwrap<T>` e `FnResult<T>` para `buscarPedido(): Promise<{id:"p-9"}>`. Registre FnResult como Promise do objeto e Unwrap como objeto ainda envelopado; compare com Awaited<FnResult<...>>. Borda: entrada number preserva number e não deve ser desembrulhada por Unwrap.
