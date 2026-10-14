# Plano de migração executado

| Passo | Módulo | Mudança e critério observado |
|---|---|---|
| 1 | C (`c.js`) | `@ts-check`; valida JSON parseado como desconhecido e exige `id` texto e `total` inteiro finito não negativo. `node a.js` continua mostrando 15. |
| 2 | B (`b.js`) | anota entrada como `string[]`, retorno como `number`, mantém a chamada a C e roda typecheck e consumidor. |
| 3 | A (`a.js`) | preserva a interface de entrada e a saída 15; build strict sem aumentar `any`. |

A folha C é migrada primeiro porque A e B dependem dela. JSON externo é validado antes de virar `Pedido`; erros de parse e shape são testes distintos. Os checkpoints preservam o comportamento e não substituem a validação por cast amplo.
