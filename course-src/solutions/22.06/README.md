# 22.06 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: pagamento.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 22.06

Validar retorno de gateway de frete {quoteId, cents}: comparar guard manual e schema existente já declarado no projeto; testar string numérica, Infinity, null e id vazio; registrar tamanho da dependência e não instalar biblioteca implicitamente.

## Critérios observáveis da avaliação

- Mesma matriz de entradas é aplicada às abordagens; `10` string, NaN e null não passam por coerção.
- Shape e valores válidos são preservados e erros apontam campo concreto.
- Decisão de schema/guard cobre tipo inferido, runtime validation, custo de bundle e dependência sem install não autorizado.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
