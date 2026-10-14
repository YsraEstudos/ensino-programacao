# 20.03 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: range.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transferência 20.03

Implemente `PaginaIteravel(total, tamanho)` para total=5 e tamanho=2. A primeira sessão deve produzir [0,1,2,3,4]; duas sessões intercaladas não podem roubar itens uma da outra. Confirme também total=0 e que `done` só fica true após o último item. Entregue o iterable e um teste próprio que use dois iteradores simultâneos.

## Critérios observáveis da avaliação

- O cursor pertence a cada iterator criado por Symbol.iterator e a coleção conserva apenas os limites.
- O caso de cinco elementos com páginas de dois mantém ordem e limite final; duas sessões intercaladas são independentes.
- O retorno terminal tem done:true e não aparece como elemento da sequência.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
