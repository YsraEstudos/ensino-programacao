# 22.01 — Runtime e declaration

Implementação real retorna Promise e null para id desconhecido. lib.d.ts agora expressa Promise<string|null>; consumidor aguarda e trata null. A declaração não transforma o JavaScript nem valida retorno runtime.

## Transferência independente

# Transfer 22.01

Auditar cliente JS que retorna Promise<Registro|undefined> mas .d.ts promete Registro; rodar sem await para observar valor, corrigir assinatura e consumidor com guarda de undefined, depois verificar runtime inalterado.

## Critérios observáveis da avaliação

- Demonstra Promise e valores ana/null em chamada real antes de comparar a declaration.
- Consumidor aguarda e trata null; a declaração passa a refletir Promise<string|null>.
- Transferência audita divergência runtime/types e corrige declaration e uso, sem dizer que declaration altera runtime.

## Verificação local

node --input-type=module -e import { buscarApelido } from "./lib.js"; const p=buscarApelido("u9"); console.log(p instanceof Promise, await p)

node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --target ES2022 --module ESNext --moduleResolution Bundler consumidor.ts

Limite: esta evidência é local/contida e não representa aprovação de navegador nem publicação.
