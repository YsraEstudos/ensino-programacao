# 21.05 — Referência de avaliação

## Contrato observado

A suíte executa main.js e seus módulos locais no DevPathDomRunner servido. main.js cria um Worker nativo a partir de worker.js; primos.js exporta o cálculo puro. A fixture declara worker.js como entrada local e não substitui o Worker nem as mensagens.

## Transferência independente

# Transfer 21.05

Mova um cálculo de CPU para um Worker nativo do navegador. Envie solicitações {id,n}, resolva cada promessa pelo ID da resposta, converta falhas de tarefa em rejeições isoladas e encerre o Worker rejeitando trabalho pendente. Demonstre mensagens reais, resposta fora de ordem controlada e terminate no navegador servido.

## Critérios observáveis da avaliação

- Escolhe casos que separam contagem correta de tabela: todo n de 0 a 1.500 e valores sorteados por semente fixa.
- Explica por que n=0, n=1 e n=2 são fronteiras: ausência de primos, não primo e menor primo par.
- Separa a validação de entrada (RangeError para negativo, fracionário, NaN e texto) da própria contagem.

## Verificação

A avaliação executa a suíte publicada no ambiente dom; erro de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
