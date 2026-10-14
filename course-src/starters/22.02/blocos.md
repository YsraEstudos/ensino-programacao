# Monte o package.json do pacote ESM

O build gera `dist/index.js` e `dist/index.d.ts` a partir de `src/index.ts`. Acrescente ao `package.json` os blocos necessários, na ordem que faz sentido. Um bloco aponta para um arquivo que não existe: deixe-o de fora.

```text
[A] "type": "module",
[B] "exports": {
      ".": {
        "types": "./dist/index.d.ts",
        "default": "./dist/index.js"
      }
    },
[C] "scripts": { "build": "tsc -p tsconfig.build.json", "prepack": "npm run build" },
[D] "main": "./index.js",
[E] "types": "./dist/index.d.ts",
```

Responda:

1. Por que `"types"` vem antes de `"default"` dentro de `exports`?
2. O que acontece com um consumidor TypeScript se `dist/index.d.ts` não existir no pacote?
3. Por que o `build` precisa rodar antes de publicar (`prepack`)?
4. Consumidor para conferir: `import { sum } from "@curso/soma";` resolve qual arquivo em runtime e qual no typecheck?
