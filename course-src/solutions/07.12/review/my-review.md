# Minha revisão

## P1 — Linha 4 — o PR altera a lista recebida
Evidência: `sort` modifica o array recebido e o chamador observa a nova ordem.
Impacto: outras telas podem depender da ordem original.
Sugestão: ordene uma cópia e teste que a entrada permanece igual.

## P1 — Linha 5 — preços fracionários são truncados
Evidência: `parseInt("12.90", 10)` retorna 12.
Impacto: o total financeiro fica incorreto.
Sugestão: valide e converta centavos inteiros ou use uma representação decimal explícita.

## P1 — Linha 6 — saída HTML recebe conteúdo sem escape
Evidência: `items` pode conter texto fornecido por usuário interpolado em `innerHTML`.
Impacto: conteúdo vira markup executável em vez de texto.
Sugestão: use `textContent` ou escape os valores antes de montar markup.

## P2 — Linha 7 — lista vazia produz média inválida
Evidência: `0 / 0` resulta em `NaN`.
Impacto: resumo não comunica que não há itens.
Sugestão: declare a média de lista vazia como `null` ou omita esse campo e teste o contrato.
