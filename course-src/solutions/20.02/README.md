# 20.02 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: walk.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 20.02

Gerar caminhos de diretórios em pré-ordem; parada após o primeiro arquivo não deve visitar nem abrir diretórios posteriores. Testar raiz sem filhos, filho aninhado e primeiro next.

## Critérios observáveis da avaliação

- Nó atual precede filhos, recursão usa yield* e raiz nula não produz valor.
- Primeiro next não materializa descendentes e teste demonstra parada na primeira folha.
- Transferência preserva ordem de diretórios e comprova que parte não percorrida não foi visitada.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
