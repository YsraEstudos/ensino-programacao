# Referência 16.09

`assertNever` recebe `never` e retorna `never`; a union mantém discriminantes e payloads correlacionados. O switch cobre todos os casos e lança um erro contextual se chegar em runtime um evento forjado.

## Transferência
Adicione o evento `{tipo: "falhou", codigo: number}` ao `EventoPesquisa`. Registre o ponto do handler que deixa de ser exaustivo e a mensagem para codigo 503 após atualizar o switch. Borda: `limpou` não deve carregar `codigo`.
