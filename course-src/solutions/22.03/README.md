# Declaração de parser

`parser.d.ts` descreve a union real `{ ok: true, value } | { ok: false, error }`, aceita somente texto e informa que `on` retorna uma função de remoção. `consumidor.ts` prova narrowing nos dois ramos e contém duas expectativas negativas. A configuração inclui JavaScript para resolução local sem ativar a verificação de parâmetros não anotados do starter; o runtime é avaliado separadamente.

## Transferência independente

# Transfer 22.03

Declare a CSV cell parser returning {kind:'value',value:number}|{kind:'invalid',reason:string}; type its callback unsubscribe and preserve false/zero values. Include consumer compile cases and runtime shape/unsubscribe checks.

## Critérios observáveis da avaliação

- Declaration discriminant, parameter and remover return match actual JavaScript behavior.
- Consumer narrows both result branches and its two negative cases each trigger a real diagnostic.
- Runtime checks valid/invalid shape and remover return; static declaration is not presented as execution proof.

## Verificação

A evidência depende do executor typescript; erros de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.

## Transferência independente

# Transfer 22.03

Extend a numeric CSV cell parser returning {ok:true,value:number}|{ok:false,error:string}; type the on(evento, listener) callback and its removable cleanup return. Cover 0 as a valid value, malformed text as an error, both consumer branches, and idempotent unsubscribe without inventing event emission.

## Transferência independente

# Transfer 22.03

Estenda um analisador de célula CSV numérica que devolve {ok:true,value:number}|{ok:false,error:string}; tipifique o callback on(evento, listener) e o retorno removível de limpeza. Cubra 0 como valor válido, texto malformado como erro, os dois ramos do consumidor e a remoção idempotente, sem inventar emissão de evento.
