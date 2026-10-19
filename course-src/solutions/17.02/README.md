# Referência 17.02

`pair<K, V>` preserva os papéis da chave e do valor; `pair("a", 2)` tem tipo `[string, number]`. `wrap<T>` devolve `{ value: T }`. `Repository<T extends Entity>` exige `id: string` e conserva a entidade concreta em `save` e `get`; uma busca ausente retorna `undefined`. O exercício altera assinaturas e não pede implementação de armazenamento. `Entity` pode ser interface ou type conforme extensão/composição necessárias; nenhum é universalmente superior.
