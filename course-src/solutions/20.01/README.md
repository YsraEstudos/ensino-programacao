# 20.01 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: protocolo.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 20.01

Implementar leitor de páginas cujo next retorna duas páginas e depois {value:cursor,done:true}; provar cursor terminal não entra em linhas exibidas, contar chamadas e explicar por que segunda leitura do mesmo cursor é vazia.

## Critérios observáveis da avaliação

- Tabela identifica as três chamadas iniciais, terminal não entra no corpo e quarta chamada fecha segunda iteração.
- Transferência distingue dados da página e cursor terminal e comprova contagem em código.
- Explicação cita que Symbol.iterator devolve o mesmo objeto consumido, sem generalizar para todos iteráveis.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
