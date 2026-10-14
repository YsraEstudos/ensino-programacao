# Referência 18.08

`FieldName` deriva das chaves de config; mapped type escolhe string ou number conforme o kind. A função ainda recebe texto, converte idade e lança RangeError para ausência, texto não numérico ou valor negativo. `satisfies` não valida um objeto vindo da rede.

## Transferência
Defina formulário de busca com `termo` textual obrigatório e `pagina` numérica mínima 1. Para `{termo:"  livro ", pagina:"2"}`, espere `{termo:"livro", pagina:2}`; campo `pagina` ausente lança RangeError com seu nome, e campo extra é ignorado. Borda: pagina `"0"` é rejeitada.
