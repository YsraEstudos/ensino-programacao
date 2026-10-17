# Contrato compartilhado node:http / Hono

Dois recursos: projeto com proprietário e tarefas pertencentes ao projeto. IDs são inteiros positivos de até nove dígitos. Todo acesso ao projeto e às suas tarefas consulta o proprietário no servidor; não revelar a existência do recurso alheio (404). Cada usuário lista somente seus projetos. SQL recebe parâmetros ligados, nunca interpolação de entrada.

| Método/caminho | Corpo | Resultado |
|---|---|---|
| POST /sessions | username (ana/bruno), password 1..128 | 201 `{token, expiresIn:900}`; senha errada 401 |
| DELETE /sessions/current | nenhum; Bearer | 200 `{ended:true}`, remove sessão |
| GET /projects | Bearer | 200 array `{id,name}` próprios |
| POST /projects | Bearer; `{name,tasks}` | 201 `{id}`; insere projeto e tarefas numa transação |
| GET /projects/:id | Bearer | 200 `{id,name,tasks:[{id,title}]}` |
| POST /projects/:id/tasks | Bearer; `{title}` | 201 `{id}` |

Nome/título: string aparada 1..80; tasks array com 0..8 títulos; chaves desconhecidas rejeitadas. Não aceitar null, arrays como objetos, coerção numérica, propriedade owner, protótipos herdados como identidade. A duplicação de título dentro do mesmo projeto viola UNIQUE: retornar 409 genérico e desfazer todos os inserts daquela criação. Uma mesma tarefa em outro projeto é válida.

Corpos JSON têm teto de 16 KiB antes do parser; 413 ao exceder, 400 JSON/schema inválido, 415 media type inválido. Rotas desconhecidas 404, método não permitido 405. Headers de erro: `application/problem+json`, `cache-control:no-store`, `x-content-type-options:nosniff`. Problema [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457): `type:about:blank`, `title` correspondente ao status, `status` numérico e `instance` apenas pathname. Nunca emitir stack, SQL, corpo, senha ou token. Erro não previsto vira 500 genérico.

Bearer obrigatório em todos os recursos; ausente, vencido, revogado e inválido retornam 401. A requisição com Origin é recusada 403 neste cenário CLI. O token expira em 900 s. Sessões são distintas e não previsíveis; persistir somente hash. Logs selecionam método/path/status/evento; omitir query, corpo, cookie, Authorization e erros brutos. Os testes usam sentinelas em sucesso e falha.

Migrações versionadas 001 e 002 executam uma vez numa transação com `schema_migrations`; reabrir não apaga dados. Ativar foreign_keys e WAL. `close()` para de aceitar, drena chamadas e limita conexões persistentes antes de fechar o banco; operação idempotente. O CLI tem prontidão JSON, Ctrl+C/SIGINT e SIGTERM, e IPC `shutdown` para automação Windows. Use `manual-test-plan.md` para diferenças de plataforma.

Hono mantém Request/Response/roteamento de framework e porta Node; reutiliza schema/serviço/SQL para reduzir drift. A fatia de sessões/projetos/tarefas executa o mesmo contrato HTTP, não somente `app.request` em memória. Explique esse tradeoff no ADR e não atribua autenticação/autorizações ao framework.
