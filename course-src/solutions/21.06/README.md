# 21.06 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: metadados.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 21.06

Cachear AST nodes com WeakMap se metadado vive só enquanto nó existir; compare com Map por id quando painel exige enumeração/invalidação e descreva retenção, sem usar GC como teste determinístico.

## Critérios observáveis da avaliação

- Mesma referência calcula uma vez e objeto com mesma forma calcula de novo; primitiva é chave inválida.
- Map por ID é recomendado somente quando estabilidade/enumerabilidade justificam retenção.
- Não promete coleta observável nem tamanho de WeakMap; transferência declara lifetime do AST.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
