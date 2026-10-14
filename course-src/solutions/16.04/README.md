# Referência 16.04

Cast perigoso: preserve a assinatura publicada, valide os campos e condições descritos e prove os resultados com casos de sucesso e borda.

## Transferência
Adapte o parser para resposta de perfil `{id: "u-8", name: "Lia", avatar: null}` e para `{id: 8, name: "Lia"}`. Defina o resultado esperado para sucesso e a falha pública para `id` numérico e para payload não-objeto; não use cast como validação. Borda: `avatar` ausente deve seguir uma política explícita diferente ou igual a null.
