# 18.11 — Referência de leitura

1. `RotaId` é `keyof typeof rotas`, ou seja, a união literal `'inicio' | 'perfil' | 'relatorios'`. `satisfies Record<string, Rota>` só verifica o formato dos valores; o tipo de `rotas` continua com as chaves literais. Anotar com `Record<string, Rota>` alargaria `keyof` para `string`.
2. `caminhoDe('admin')`, em código externo, gera erro de atribuição do argumento (TS2345): `'admin'` não cabe em `RotaId`. `exigeLogin('admin')` compila, porque o parâmetro é `string`; em tempo de execução devolve `false`, pela guarda `Object.hasOwn`.
3. A guarda é `Object.hasOwn(rotas, id)`, verificada em tempo de execução. O `as RotaId` apenas afirma ao compilador que o valor já é uma chave; ele não é verificado. A guarda garante o acesso; o cast só cala o tipo.
4. Com `Record<string, Rota>`, `caminhoDe('admin')` deixaria de ser erro, porque `RotaId` vira `string`; `rotas[id].caminho` também deixaria de checar a existência da chave, e um id inválido poderia cair em `undefined` sem diagnóstico.
5. `destinoAposLogin` devolve `'perfil'` ou `ROTA_PADRAO`, ambos literais de `RotaId`. A linha `pedido === 'perfil' ? 'perfil' : ROTA_PADRAO` restringe o valor: o compilador vê apenas essas duas alternativas.

Critérios: explica a união literal e o papel de `satisfies`; prevê o diagnóstico de `caminhoDe` antes de confirmar; separa guarda de runtime do cast; descreve o efeito de alargar a tabela.
