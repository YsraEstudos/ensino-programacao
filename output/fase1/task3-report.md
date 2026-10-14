# Tarefa 3 — tipos TypeScript e JSDoc

## Entrega

- `17.11` foi inserida antes de `17.08` e `22.11` antes de `22.05`, preservando os IDs existentes por `SEQUENCE_OVERRIDES`.
- `17.11` pratica `private`, `readonly` e `implements` em campos explícitos e atribuições no construtor. A explicação registra que parameter properties são incompatíveis com `erasableSyntaxOnly`; esse padrão não é usado no código executável. O primer de `17.08` agora corresponde ao uso real de campos `#` e atribuição explícita no construtor.
- `22.11` usa JavaScript `.js` com JSDoc e `@ts-check`; `checkJs: true` fornece a verificação efetiva do arquivo e mantém o contrato ativo mesmo sem a diretiva. O teste também confirma que remover apenas `@ts-check` não apaga as annotations, e que contratos enfraquecidos para `any`/sem tipos são rejeitados. Testes de comportamento executam pelo evaluator do site com `test`/`expect` globais e import `./main.js`.

## Verificação

- `npm.cmd run build:curriculum`: passou; catálogo com 261 atividades e grafo acíclico.
- `node --test scripts/test-phase1-types.mjs`: passou, 5/5. Confirma posição/IDs, starter falhando e referência passando no evaluator real, mutantes de tipos protegidos e configuração/sintaxe de classes.

O gate cobre os contratos e fluxos descritos acima; não representa homologação manual da experiência no navegador.
