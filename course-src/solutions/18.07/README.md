# Referência 18.07

Com noUncheckedIndexedAccess, o índice é User | undefined. A implementação escolhe lançar RangeError para ausência; não usa `!`. Sem essa flag, o tipo não sinaliza o acesso, embora o dado ainda possa faltar em runtime.

## Transferência
Implemente `nomeDe(id)` sobre catálogo `u1 -> "Ana"` sem non-null assertion. Defina a política de ausência: lance RangeError com o id solicitado; demonstre consulta u1 e missing. Borda: id vazio também deve seguir a política documentada.
