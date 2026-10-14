# Referência 19.09

Os brands distinguem os IDs em assinaturas sem criar wrapper. Cada construtor valida a forma da string e só então aplica a assertion; um cast arbitrário pode escapar do controle e não valida dados.

## Transferência
Defina brands UserId e InvoiceId com construtores validados. Aceite `u-42` e `inv-8`, rejeite prefixo errado e string vazia em cada construtor, e mostre que `getUser` recusa InvoiceId. Borda: explique que cast explícito pode contornar a marca e que validação runtime continua necessária.
