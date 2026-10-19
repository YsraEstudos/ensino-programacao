# Referência 18.02

`aplicarPatch<T extends object>(base: T, patch: Partial<T>): T` cria uma cópia com spread superficial. Um patch `{ nome: "Bia" }` mantém os campos omitidos. Um `Perfil` aninhado é substituído por inteiro, sem deep merge, e `base` permanece intacto. JSON externo requer parse como `unknown` e validação de runtime antes de ser aceito como patch; declare a política de `undefined` com `exactOptionalPropertyTypes`.
