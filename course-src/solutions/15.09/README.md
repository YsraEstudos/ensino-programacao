# Referência 15.09

`vista.itens` e `dados.itens` apontam para o mesmo array; `dados.itens.push(2)` é visível pela vista. `readonly` impede atribuir outra referência a `vista.itens`, mas não torna imutável o array e é superficial. `Object.freeze` também não deve ser presumido profundo.

## Evidência independente
Uma coleção de membros é compartilhada entre editor e painel. Registre o que acontece após push por cada alias, uma tentativa de reatribuição e uma opção de cópia. Separe readonly superficial, identidade e congelamento runtime.
