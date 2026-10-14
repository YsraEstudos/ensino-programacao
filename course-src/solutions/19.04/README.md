# Referência 19.04

A distributive conditional testa cada membro da união; string|number vira true|false, enquanto never vira never. A forma vestida `[T] extends [string]` testa a união inteira: string é true, string|number é false e never satisfaz vacuamente a condição, logo true.

## Transferência
Para `string | number`, compare `IsString<T>` distributivo e `WholeString<T>` não distributivo; registre `true | false` e `false`. Inclua `never` e explique por que o distributivo retorna never, enquanto a forma em tupla responde a uma pergunta sobre a união inteira. Borda: registre também o resultado para `string` puro.
