# 22.09 — isolatedDeclarations

Use TypeScript 6.0.3, fixado localmente. O export um() em src/isolated-demo.ts é inferível por ser expressão trivial. tamanho(texto) precisa de anotação porque isolatedDeclarations não analisa o corpo para inferir o tipo público. Remova : number para observar TS9007 e restaure a anotação mínima. Anote apenas os exports de src/index.ts necessários; preserve os TODOs iniciais.

Em uma cópia temporária, rode npm ci, node --experimental-strip-types --test src/index.test.ts, npx tsc --project tsconfig.json --emitDeclarationOnly --outDir dist e npx tsc --ignoreConfig --noEmit --module NodeNext --moduleResolution NodeNext --target ES2022 --strict consumer.ts. O consumer importa a raiz local slug-kit após a emissão de dist/index.d.ts e dist/isolated-demo.d.ts.
