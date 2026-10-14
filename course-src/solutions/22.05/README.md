# 22.05 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: c.js, b.js, a.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 22.05

Plan migration of D→E→F where D is entry, E calculates invoice total, F parses third-party JSON. Capture result 24 before each rename, start at F, add unknown-shape validation, keep each consumer executable and track any-count without adding casts.

## Critérios observáveis da avaliação

- Dependency order follows leaf F→E→D and each checkpoint retains the previous observable result.
- External JSON is validated as unknown before calculation; malformed JSON and wrong fields are separate tests.
- Plan records compile/runtime gate and any-count per checkpoint, avoiding broad cast substitutions.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.

## Transferência independente

# Transfer 22.05

Planeje a migração de D→E→F, em que D é a entrada, E calcula o total da fatura e F analisa JSON de terceiro. Registre o resultado 15 antes de cada renomeação (3 × 5 do fixture), comece por F, adicione validação de formato unknown, mantenha cada consumidor executável e acompanhe a contagem de any sem adicionar casts.
