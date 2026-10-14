# 21.11 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente local e as verificações declaradas: local. Os arquivos de referência são: probe.mjs. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 21.11

Desenhar cleanup de transação em que operação falha e rollback também falha: decidir qual erro é primário, como guardar o secundário, e executar Promise.any com dois serviços indisponíveis registrando AggregateError.errors.

## Critérios observáveis da avaliação

- Antes de fixar resultado confirma suporte a SuppressedError/using; unsupported é runtime, não falha semântica do aluno.
- Distingue erro de cleanup em error e erro original em suppressed; não confunde try/finally manual.
- Promise.any lista AggregateError.errors em ordem e transferência compõe erros sem perder a causa.

## Verificação local

node course-src/solutions/21.11/probe.mjs

node --version

Limite: esta evidência é local/contida e não representa aprovação de navegador nem publicação.
