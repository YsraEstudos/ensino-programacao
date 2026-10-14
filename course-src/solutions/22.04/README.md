# 22.04 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: patch.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 22.04

Replace a legacy global String.prototype.slug helper with an exported slug(text) function. Cover empty input, accented input policy, unchanged prototype descriptors and a caller migrated to an explicit import; note any compatibility wrapper decision.

## Critérios observáveis da avaliação

- New function is module-scoped and callers use its export.
- Tests cover the chosen accent/empty rules and confirm no global prototype or enumeration change.
- Compatibility decision describes affected consumers without relying on TypeScript augmentation alone.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.

## Transferência independente

# Transfer 22.04

Substitua um auxiliar global legado String.prototype.slug por uma função exportada slug(texto). Cubra entrada vazia, a política para acentos, descritores do protótipo inalterados e um chamador migrado para importação explícita; registre qualquer decisão sobre wrapper de compatibilidade.
