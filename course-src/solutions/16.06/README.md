# Referência 16.06

A lista fica `as const`, derivando a união de `(typeof NIVEIS)[number]`. Isso preserva os literais e torna a tupla readonly no checker; não congela o array em runtime. O negativo `dono` e a tentativa de `push` são recusados estaticamente.

## Transferência
Derive `Theme` de `THEMES = ["light", "dark", "system"] as const` e aplique a uma função `setTheme`. Inclua chamada aceita `system`, recusa `sepia` e explique o que acontece se a lista for alargada para `string[]`. Borda: diferencie readonly no typecheck de congelamento do array em runtime.
