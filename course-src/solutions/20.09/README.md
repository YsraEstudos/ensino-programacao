# 20.09 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: stream.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 20.09

Adapt socket chunks para uma fila highWaterMark 1 com um consumidor que pausa após cada chunk; observar que demanda desacelera a fonte e cancelamento fecha o recurso, sem exigir quantidade exata de pull do scheduler.

## Critérios observáveis da avaliação

- Registra hipótese, valores lidos e cancelamento com motivo; sem fixar pull-count/scheduler.
- Relaciona desiredSize e highWaterMark à capacidade da fila e demonstra consumidor lento.
- Transferência explicita estratégia e cleanup quando consumidor encerra.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
