# 20.04 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: proxy.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transferência 20.04

Crie um proxy de auditoria para um objeto de configuração cuja propriedade herdada `endpoint` getter usa `this.host`. Leia `endpoint` e `Symbol.toStringTag`, registre a chave observada e mostre que o getter recebe o próprio proxy. Um segundo getter devolve um valor derivado de `this`; inclua um teste que falhe se delegar sem receiver.

## Critérios observáveis da avaliação

- O trap delega com Reflect.get e encaminha o receiver recebido.
- Getter herdado que lê host funciona pelo proxy; leitura simbólica não reentra.
- O log registra a chave sem substituir ou quebrar a semântica do getter.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
