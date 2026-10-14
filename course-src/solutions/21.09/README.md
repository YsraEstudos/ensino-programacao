# 21.09 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente dom e as verificações declaradas: behavior, mutation. Os arquivos de referência são: lab.js, index.html. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 21.09

Compare two CSV normalization strategies on an imported 2,000-row fixture with duplicate keys and blank rows. Define identical output and invalid-row behavior first; collect 3 warmups and 9 timed runs for each, preserve raw samples, median/min/max, input hash and browser version, and explain whether the sample spread supports a performance claim.

## Critérios observáveis da avaliação

- Both implementations receive one identical deterministic fixture; the returned totals must match before timing.
- The UI validates integer bounds, displays raw samples/median/min/max and environment, and exposes status through a labeled input and live region.
- Missing performance.memory is shown as N/D; conclusions cite spread and avoid declaring a universal winner.

## Verificação

A evidência depende do executor dom; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.

## Transferência independente

# Transfer 21.09

Compare duas estratégias de normalização de CSV em um fixture importado de 2.000 linhas com chaves duplicadas e linhas em branco. Defina antes a saída idêntica e o comportamento para linhas inválidas; colete 3 aquecimentos e 9 execuções medidas para cada uma, preserve as amostras brutas, mediana, mínimo e máximo, o hash da entrada e a versão do navegador, e explique se a dispersão das amostras sustenta uma afirmação de desempenho.
