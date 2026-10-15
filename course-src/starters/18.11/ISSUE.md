# Issue #31 · Quais identificadores de rota o compilador aceita?

A equipe quer adicionar uma rota nova sem mexer em três lugares. Antes disso, precisamos saber o que o compilador aceita hoje, e por quê. Não proponha mudança de código nesta issue.

Responda com evidência:

1. De onde vem o tipo `RotaId`? Quais identificadores ele aceita? Por que `satisfies` não alarga as chaves da tabela?
2. Suponha um arquivo novo com `caminhoDe('admin')`. Qual diagnóstico aparece, em que código e em qual chamada? Compare com `exigeLogin('admin')`, que aceita `string`.
3. Dentro de `exigeLogin`, qual guarda protege o acesso à tabela? O que o `as RotaId` garante e o que ele não garante?
4. Se a tabela fosse declarada como `const rotas: Record<string, Rota>`, quais diagnósticos desapareceriam e quais riscos surgiriam?
5. Por que `destinoAposLogin` pode devolver `RotaId` sem erro? Aponte a linha que restringe o valor.
