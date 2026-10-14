# 20.06 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: pipelines.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 20.06

Compare a streaming filter/map/take over sensor readings with array filter/map/slice; record source pulls for first two valid readings and for take(0), then gate Iterator.from by runtime feature detection and retain manual fallback.

## Critérios observáveis da avaliação

- Case reports Node feature presence rather than assuming it; manual fallback remains executable.
- Lazy take(2) pulls only through second accepted even value and take(0) pulls zero.
- Eager array path is explicitly labeled/materializes all five; transfer captures its own pull counts.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.

## Transferência independente

# Transfer 20.06

Compare um filter/map/take em streaming sobre leituras de sensores com filter/map/slice de array; registre as chamadas à fonte para as duas primeiras leituras válidas e para take(0). Depois verifique Iterator.from por detecção de recurso em tempo de execução e mantenha um fallback manual.
