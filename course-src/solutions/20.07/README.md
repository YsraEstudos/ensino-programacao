# 20.07 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: colecao-async.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 20.07

Read a chunked async source of two records: prove collection returns a complete array only after the second record, while for-await handles record one before record two exists. Make the source reject after record one and record what each consumer can return; state which path retains O(n) records and which processes incrementally.

## Critérios observáveis da avaliação

- Array.fromAsync result is a complete array and is published only after the source finishes; fallback is identified when unavailable.
- for-await handles the first item before production of the second; an error from item two rejects the operation.
- Transfer uses a distinct chunk scenario, contrasts materialized O(n) versus streaming consumption, and makes no claim that Array.fromAsync streams.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.

## Transferência independente

# Transfer 20.07

Leia uma fonte assíncrona em blocos com dois registros: prove que a coleta devolve um array completo só depois do segundo registro, enquanto for await trata o primeiro antes de o segundo existir. Faça a fonte rejeitar depois do primeiro registro e registre o que cada consumidor pode devolver; diga qual caminho retém os registros em O(n) e qual processa incrementalmente.
