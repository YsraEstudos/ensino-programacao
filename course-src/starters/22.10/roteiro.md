# Project References (trilha opcional)

1. Em `packages/core/tsconfig.json`, ligue `"composite": true`.
2. Em `packages/app/tsconfig.json`, acrescente `"references": [{ "path": "../core" }]`.
3. Rode `npx tsc -b packages/app` e anote a ordem: qual projeto compila primeiro e que arquivos aparecem em `core/dist` (`.js`, `.d.ts`) e onde fica o `tsconfig.tsbuildinfo`.
4. Rode de novo sem mudar nada: o que o build incremental pula?
5. Mude a assinatura de `total` em core e rode `tsc -b packages/app` outra vez.
6. Tire `composite` de core e registre o diagnóstico.
7. Faça core referenciar app também. O que o `tsc -b` diz sobre referência cíclica?

Quando isto compensa: monorepo com vários pacotes que dependem uns dos outros. Para um pacote só, é complexidade sem retorno.
