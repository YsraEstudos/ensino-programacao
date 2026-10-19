# Referência 19.06

Com `Settings = { readonly theme?: "light" | "dark"; readonly retries?: number }`, `MutableRequired<Settings>` torna ambos os campos obrigatórios e graváveis. Sob `strict`, remover `?` de propriedade opcional remove a ausência; teste separadamente uma propriedade cujo valor declare explicitamente `undefined` e compare com `exactOptionalPropertyTypes` ligado e desligado.
