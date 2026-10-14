# 23.11 — Fronteira inclusiva do raio

A regra é distância <= raio em src/domain/raio.js; formatação da UI não classifica entregas. Teste primeiro com 5.000 m para reproduzir o bug, então altere só o operador e preserve validação. A suíte inclui 4.999/5.000/5.001, raio customizado e valores negativos/não finitos.

## Transferência independente

# Transfer 23.11

Corrigir limite de elegibilidade de um programa: 1.000 pontos dá desconto, 1.001 não; rejeitar score negativo e NaN, respeitar configuração de 250 pontos; adicionar primeiro teste que falha, localizar regra de domínio e manter resumo/ordenação existente.

## Critérios observáveis da avaliação

- Teste red é exatamente no limite e demonstra que relatório/service consome a função de domínio.
- Correção é inclusiva e localizada; 1 abaixo, no limite e 1 acima passam junto com raio configurável e entradas inválidas.
- Relatório mantém ordenação/forma e storage retorna cópias; UI não recebe regra duplicada.

## Verificação

A evidência depende do executor node-simulated; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
