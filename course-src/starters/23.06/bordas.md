# Auditoria de bordas do capstone

Toda entrada externa chega como `unknown` (ou texto) e só vira dado de domínio depois de validada. Preencha uma linha por fonte.

| Fonte | Onde chega no código | Formato bruto | Onde é analisada (parse) | Onde é validada | Tipo de domínio resultante | Política de falha |
|-------|----------------------|---------------|--------------------------|-----------------|----------------------------|-------------------|
| HTTP (resposta JSON) | `api/cliente.ts` | `unknown` | | | `DomainInput` | |
| Storage (localStorage / arquivo de save) | `storage/adapter.ts` | string | | migrar versão -> validar | `DomainState` | |
| DOM / FormData | `ui/formulario.ts` | strings | | | | |
| Variáveis de ambiente | `config.ts` | `string \| undefined` | | | | segredo nunca vai para log |
| Arquivo importado pelo usuário | `importar.ts` | bytes/texto | | | | erro com `cause` |

Perguntas:

1. Qual fonte você ainda trata como confiável sem perceber?
2. Onde o texto vindo de fora é exibido na tela? Ele usa `textContent`?
3. Qual validação é compartilhada entre duas fontes e onde ela deve morar?
