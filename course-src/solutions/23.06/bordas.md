# Trust-boundary audit

| Origem | bruto | parse/validação | tipo interno | falha |
|---|---|---|---|---|
| HTTP JSON | string | JSON.parse + schema de tarefa | comando validado | 400 seguro |
| storage | documento unknown | versão + validação + migração | Estado | não sobrescrever bytes inválidos |
| DOM/FormData | string | trim, enum, número finito | DTO validado | mensagem textContent |
| env | string/ausente | parser de URL/segredo | Config | sem logar valor |
| arquivo importado | bytes | decode, JSON, schema | lote | abortar sem commit parcial |

Um cast para Estado não valida. Erros técnicos guardam cause redigida; domínio recebe apenas valores já validados.
