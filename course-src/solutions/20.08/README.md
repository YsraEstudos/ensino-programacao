# 20.08 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: pipeline.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transferência 20.08

Construa pipeline para pedidos em fluxo infinito: converta cada entrada para {sku, ativo}, filtre ativos e pegue três. Fonte começa com um inativo e, após o terceiro ativo, lança se puxada de novo. Resultado esperado: três SKUs, quatro pulls e produtor fechado. Acrescente `take(0)` sem pull e segunda iteração independente.

## Critérios observáveis da avaliação

- Cada operador adia o trabalho até next e o contador de pulls distingue resultado de entrada.
- A fonte encerra sem pull extra depois do terceiro ativo; take(0) não avança a fonte.
- return/finally fecha o produtor e a explicação relaciona demanda upstream a memória/cancelamento.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.

## Transferência independente

# Transferência 20.08

Compare três fontes para a mesma pipeline: um array reiniciável, a mesma instância de generator (iterador de uso único) e uma fábrica que cria generators. Registre a saída da primeira e da segunda iteração do array e da instância. Em seguida, chame a fábrica para construir uma pipeline nova a cada passagem e confirme que ambas começam do início. Depois encadeie map/filter/take com uma fonte que conte os valores produzidos: inclua entradas descartadas pelo filtro, prove que take(0) não consome, que não há pull após o último resultado aceito e que interromper com break propaga return/finally. Não suponha que todo for...of reinicia qualquer fonte.
