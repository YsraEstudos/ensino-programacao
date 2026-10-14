# 22.02 — Pacote ESM

Exports resolve types antes do runtime default; prepack gera dist antes do archive. main apontando ./index.js foi removido porque arquivo não existe. Consumidor limpo importa @curso/soma e tsc resolve declaração.

## Transferência independente

# Transfer 22.02

Montar pacote ESM @curso/data-only com função dataIso e declaration; gerar dist, npm pack --dry-run e instalar archive offline em pasta temporária, provando import runtime e type resolution com exports.

## Critérios observáveis da avaliação

- Exports types precede default e ambos apontam para artefatos realmente gerados; main inexistente foi removido.
- Build/prepack executa antes do pack; arquivo dist ausente causa falha no consumidor typecheck.
- Transferência inclui consumidor isolado JS/TS e não depende de alias do workspace.

## Verificação local

node -e require('node:child_process').execFileSync(process.execPath,['node_modules/typescript/bin/tsc','-p','tsconfig.build.json'],{stdio:'inherit'})

node --input-type=module -e import {sum} from './dist/index.js'; if (sum(2, 3) !== 5) throw new Error('soma incorreta'); console.log('runtime ok');

node -e require('node:child_process').execFileSync(process.execPath,['node_modules/typescript/bin/tsc','--noEmit','--strict','--module','NodeNext','--moduleResolution','NodeNext','dist/index.d.ts'],{stdio:'inherit'})

npm pack --dry-run

Limite: esta evidência é local/contida e não representa aprovação de navegador nem publicação.
