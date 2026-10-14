# 23.10 — Localizar fonte da regra

ISSUE R$150 representa 15.000 centavos. Fonte da verdade é src/domain/limite.js, chamada pelo service/relatorio.js; src/ui/formatar-limite.js apenas apresenta. A correção não pertence ao formatter.

## Transferência independente

# Transfer 23.10

Em mini-repositório de envio gratuito, localizar regra de CEP/valor mínimo antes de editar; traçar UI → serviço → domínio e citar teste de 9.999/10.000 centavos, evitando alterar só formatter.

## Critérios observáveis da avaliação

- Nomeia src/domain/limite.js como regra e traça UI → service → domain com teste que consome a comparação.
- R$150 é 15.000 centavos e falha segundo o limite padrão 10.000; formatter não altera classificação.
- Transferência cita função/módulo/teste em um repositório diferente e justifica menor diff.

## Verificação

A evidência depende do executor node-simulated; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.
