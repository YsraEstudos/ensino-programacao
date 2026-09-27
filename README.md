# DevPath

Plataforma de aprendizagem de desenvolvimento web em português, com tema escuro e layout adaptável a celulares, tablets e computadores.

## Conta e progresso

O Site usa o fluxo oficial **Entrar com ChatGPT** do Sites. Não há senha criada pelo DevPath. As rotas protegidas e a API validam a identidade no servidor; o identificador estável da conta é a chave de cada registro.

O progresso fica no D1 configurado como `DB`: aulas concluídas, respostas, tentativas, desafios escritos, revisões e dias ativos. O navegador não usa `localStorage` como fonte dos dados. Se o banco ficar temporariamente indisponível, a interface informa que não conseguiu sincronizar.

## Desenvolvimento

- `npm run dev`: prévia local com autenticação de desenvolvimento do Sites.
- `npm run db:generate`: gera uma nova migração Drizzle depois de alterar `db/schema.ts`.
- `npm run build`: compila a aplicação para Cloudflare Workers.

As migrações ficam em `drizzle/` e são aplicadas pelo Sites durante a publicação.
