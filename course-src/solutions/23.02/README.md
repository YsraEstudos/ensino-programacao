# 23.02 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: fluxo.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 23.02

Ordenar importação de inventário em parse CSV, validação de SKU/quantidade, cálculo, repository e resposta; casos linha corrompida 400 sem writes, SKU sem autorização 400, falha de banco 500 seguro com cause disponível apenas no log.

## Critérios observáveis da avaliação

- JSON/parse e validação antecedem domínio/persistência; caso inválido deixa repo intacto.
- Erro público 500 não inclui mensagem técnica, enquanto cause fica preservada para observabilidade.
- Transferência aponta dependências das camadas e rejeita Response/DOM dentro do domínio.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
