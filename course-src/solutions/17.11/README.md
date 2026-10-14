# Referência 17.11

`private` e `readonly` são checados pelo TypeScript. A interface confirma a forma pública da classe; `implements` não emite lógica de runtime. Os campos estão declarados explicitamente e atribuídos no constructor, mantendo `erasableSyntaxOnly: true`.

Uma parameter property como `constructor(private limiteBytes: number)` exige transformação para declarar e atribuir o campo. Ela é incompatível com `erasableSyntaxOnly`; fica apenas como conceito explicado, não no código executável.

## Transferência

Modele outro limite com interface e propriedades explícitas. Mostre um consumidor que usa a interface, uma atribuição readonly inválida e uma chamada runtime na fronteira.
