# Referência 17.04

A função `primeiro` não usa id, portanto aceita qualquer T e retorna `T | undefined`. Apenas `buscarPorId` conserva a constraint `{id:string}`. A leitura vazia continua explícita como undefined.

## Transferência
Projete `primeiro` para `readonly (string | number)[]` sem constraint de id e `buscarPorId` para usuários `{id, nome}`. Calcule a inferência de lista vazia e de `[ {id:"p-2", nome:"Nina"} ]`; mostre chamada inválida com número em buscarPorId. Borda: ambas as consultas podem retornar undefined.
