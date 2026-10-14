# 21.04 — Referência de avaliação

## Contrato observado

Cache com capacidade limitada, política LRU, capacidade padrão 2, resultados falsy, capacidade zero e retry após erro. Arquivo avaliado: memo.js.

## Transferência independente

# Transfer 21.04

Adapte um cache de capacidade 3 a chaves compostas {tenant,locale}; distinga ('a|b','c') de ('a','b|c'). Rastreie A,B,C,A,D, depois consulte o B removido e registre false; informe a contagem exata de recálculos e o tamanho máximo.

## Critérios observáveis da avaliação

- A codificação da chave composta é livre de colisões e os pares adversariais são testados.
- A sequência comprova que a entrada recém-usada é renovada e que a menos recente é removida; o tamanho fica em no máximo 3.
- false é um acerto de cache; a capacidade padrão continua 2.

## Verificação

A avaliação executa a suíte publicada no ambiente javascript; erro de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
