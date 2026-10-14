# 22.09 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente local e as verificações declaradas: local, rubric. Os arquivos de referência são: src/index.ts, src/interno.ts, tsconfig.json, package.json, consumer.ts, src/index.test.ts. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 22.09

Enable isolatedDeclarations in a TS package whose exported function and options are inferred. Add only annotations needed for declaration emit. Validate accent folding, trim/hyphen behavior, default 60-character slice, custom max, VERSAO and Opcoes in a consumer.

## Critérios observáveis da avaliação

- Runtime preserves the starter API: criarSlug(texto), VERSAO, padroes {separador,maximo:60}, limitar(texto,maximo=60), and Opcoes.
- Native isolatedDeclarations emit matches the implementation; only required annotations are added, with no API redesign or changed normalization.
- Native consumer covers accents, trimming, defaults, custom max, and options shape; declaration emit paths and compiler diagnostics are recorded.

## Verificação local

node --experimental-strip-types --test course-src/solutions/22.09/src/index.test.ts

node node_modules/typescript/bin/tsc --project course-src/solutions/22.09/tsconfig.json --noEmit

Limite: esta evidência é local/contida e não representa aprovação de navegador nem publicação.

## Transferência independente

# Transfer 22.09

Ative isolatedDeclarations em um pacote TS cuja função exportada e opções são inferidas. Adicione apenas as anotações necessárias para a emissão de declarações. Valide dobramento de acentos, comportamento de trim e hífen, fatia padrão de 60 caracteres, máximo customizado, VERSAO e Opcoes em um consumidor.
