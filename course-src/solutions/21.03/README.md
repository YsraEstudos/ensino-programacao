# 21.03 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente node-simulated e as verificações declaradas: behavior, mutation. Os arquivos de referência são: benchmark.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 21.03

Compare two sort strategies on the same 12,000-record fixture, each with 2 warmups and 7 timed samples. Deliver raw amostras, mediana and environment; explain differences smaller than sample spread.

## Critérios observáveis da avaliação

- Default call performs 5 warmups and 9 samples and preserves amostras/mediana keys.
- Explicit run counts exclude warmups and compute the median over measured samples.
- Conclusion records environment and uncertainty, not a universal winner.

## Verificação

A evidência depende do executor node-simulated; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.

## Transferência independente

# Transfer 21.03

Compare duas estratégias de ordenação no mesmo fixture de 12.000 registros, cada uma com 2 aquecimentos e 7 amostras medidas. Entregue as amostras brutas, a mediana e o ambiente; explique diferenças menores que a dispersão das amostras.
