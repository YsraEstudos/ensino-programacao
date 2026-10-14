# 20.10 — Referência de avaliação

## Contrato observado

Avalie este ID com o ambiente javascript e as verificações declaradas: behavior, mutation. Os arquivos de referência são: bytes.js. A referência preserva o contrato authored indicado nos arquivos e no enunciado.

## Transferência independente

# Transferência 20.10

Codifique a mensagem de protocolo `café / 🛰️`. Registre `string.length`, quantidade de bytes enviados e conteúdo recuperado. Depois decodifique [0x7b,0xc3,0x28,0x7d] em modo tolerante e estrito; descreva qual resposta a aplicação envia ao receber sequência inválida.

## Critérios observáveis da avaliação

- Mede UTF-16 e bytes UTF-8 separadamente para texto não ASCII e emoji.
- Registra round-trip exato e diferença entre replacement padrão e erro fatal.
- Define política observável para payload inválido sem cortar arbitrariamente uma sequência multibyte.

## Verificação

A evidência depende do executor javascript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
