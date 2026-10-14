# 21.02 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: cleanup.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transfer 21.02

Montar/desmontar um painel de busca com keydown e debounce timer; chamar mount duas vezes, dispatch uma tecla, desmontar duas vezes e confirmar um handler e nenhum timer vivo, usando mesma referência para remover listener.

## Critérios observáveis da avaliação

- Mount e unmount repetidos são idempotentes e uma ação gera exatamente um evento.
- Cleanup usa callback original e limpa intervalo; callback wrapper não equivalente falharia.
- Transferência inclui timer + listener e confere estado final, não só ausência visual do componente.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
