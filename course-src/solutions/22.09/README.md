# 22.09 — isolatedDeclarations no TypeScript 6.0.3

A afirmação de que todo export exige retorno explícito é ampla demais. src/isolated-demo.ts mostra um() sem anotação, que emite declaração por expressão trivial, e tamanho(texto) com retorno : number, necessário porque o tipo depende da análise do corpo. Em uma cópia temporária do pacote, rode npm ci e node node_modules/typescript/bin/tsc --project tsconfig.json --emitDeclarationOnly --outDir dist. Verifique dist/isolated-demo.d.ts e dist/index.d.ts. Remova : number somente para observar o diagnóstico TS9007, depois restaure a anotação mínima. Então compile consumer.ts, que resolve a raiz slug-kit para as declarations emitidas. A API e o comportamento de normalização continuam os mesmos; não adicione anotações a todo tipo do projeto.

## Transferência independente

# Transfer 22.09

Ative isolatedDeclarations em um pacote TS cuja função exportada e opções são inferidas. Adicione apenas as anotações necessárias para a emissão de declarações. Valide dobramento de acentos, comportamento de trim e hífen, fatia padrão de 60 caracteres, máximo customizado, VERSAO e Opcoes em um consumidor.

## Critérios observáveis da avaliação

- A trivial um() export compiles without a return annotation and appears in the emitted declaration.
- Removing : number from tamanho(texto:string) yields the compiler diagnostic for a body-dependent return; restoring it passes.
- The existing slug API and its runtime cases remain intact; the exercise does not require annotating every type.

## Verificação local

node --experimental-strip-types --test src/index.test.ts

node node_modules/typescript/bin/tsc --project tsconfig.json --emitDeclarationOnly --outDir dist

node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --module NodeNext --moduleResolution NodeNext --target ES2022 --strict consumer.ts

Limite: esta evidência é local/contida e não representa aprovação de navegador nem publicação.
