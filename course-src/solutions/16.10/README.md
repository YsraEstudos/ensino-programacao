# Referência 16.10

Catch recebe unknown: preserve a assinatura publicada, valide os campos e condições descritos e prove os resultados com casos de sucesso e borda.

## Transferência
Implemente o tratamento de erro de uma operação `exportarRelatorio` rejeitada com `Error("permissão")` e com o valor `{status: 503}`. Especifique a mensagem pública, mantenha o valor original em `cause` e demonstre que sucesso ainda retorna `"Relatório salvo."`. Borda: um `Error` sem message usa texto seguro sem perder o objeto original.
