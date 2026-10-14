# 21.10 — Transferir ownership

Cópia mantém origem de 8 bytes independente. structuredClone com transfer entrega 8 bytes e detached a origem. SharedArrayBuffer é uma semântica diferente e fica fora do escopo.

## Transferência independente

# Transfer 21.10

Enviar um ArrayBuffer de 32 bytes com postMessage(buffer,[buffer]) a um worker; registrar bytes do emissor antes/depois e do receptor, comparar com structuredClone sem transfer e declarar que não há memória compartilhada.

## Critérios observáveis da avaliação

- Experimento prova cópia independente modificando destino e observando byte original.
- Transferência mostra byteLength 0/detached na origem e 8 bytes no destino.
- Não chama transfer de compartilhamento; transferência worker opcional separa evidência local e browser.

## Verificação local

node --input-type=module -e import { experimentar } from "./transferir.js"; console.log(JSON.stringify(experimentar()))

node --version

Limite: esta evidência é local/contida e não representa aprovação de navegador nem publicação.
