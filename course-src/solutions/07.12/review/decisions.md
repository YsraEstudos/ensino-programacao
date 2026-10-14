# Respostas aos comentários recebidos

## R1: aceitar — teste para lista vazia
Justificativa: a função publica um resumo e a fronteira vazia é aceita; o teste fixa `average: null` sem alterar outros casos.

## R2: rejeitar — remover validação de entrada
Justificativa: entradas externas continuam sem garantia; remover a guarda permitiria estado inválido e contradiz o contrato publicado.
