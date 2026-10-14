# Referência 18.04

`ProfileSummary` é uma lista nomeada e deliberada dos campos públicos: id, name e avatar opcional. Não deriva automaticamente campos internos futuros e não inclui hash de senha ou IP.

## Transferência
Projete `ProfileSummary` para resposta pública `{id, name, avatarUrl?}` e exclua `passwordHash`, `lastLoginIp` e `email`. Mostre um objeto sem avatar e outro com avatar; borda: uma evolução futura de UserRecord com `mfaSecret` não deve aparecer no resumo. Preserve `ProfileCard` como alias compatível.
