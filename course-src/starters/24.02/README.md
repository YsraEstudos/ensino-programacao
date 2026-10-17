# 24.02 — API persistente local

Implemente `src/service.mjs`, `src/schema.mjs`, a transação em `src/store.mjs` e a fatia de rotas `src/hono.mjs`. O transporte HTTP, o leitor limitado, as migrações e as primitivas de senha são apoio fornecido. O starter compila e falha por asserções intencionais; não contém a solução. O contrato público é `contract.md`; nenhum serviço ou conta externa é necessário para executar os testes após `npm ci`.

## Ambiente e comandos Windows/PowerShell

Piso específico: **Node >=24.15.0**. A [documentação versionada do Node](https://nodejs.org/download/release/v24.15.0/docs/api/sqlite.html) classifica `node:sqlite` como **Stability 1.2 — Release candidate** desde 24.15.0. Não é API Stability 2. O curso tem base geral 24; este checkpoint exige o minor 24.15.0 e usa somente DatabaseSync/prepare/run/get/all/exec/close disponíveis ali. A [documentação atual](https://nodejs.org/api/sqlite.html) e o piso devem ser revistos antes de atualizar o runtime. Consultado em 16/10/2026.

Extraia o ZIP em caminho curto, por exemplo `$env:TEMP\devpath-24-02`, e abra essa pasta:

```powershell
node --version
npm.cmd ci --ignore-scripts --no-audit --no-fund
npm.cmd run build
npm.cmd run test:schema
npm.cmd test
# Depois de implementar: servidor didático em outra janela, sem senha real
$env:DEMO_PASSWORD = 'senha-local-exemplo-907!'
$env:DB_PATH = Join-Path $env:TEMP 'devpath-demo-24-02.sqlite'
$env:PORT = '0'
npm.cmd start
# Ctrl+C encerra listener e SQLite. Troque por npm.cmd run start:hono para a fatia portada.
```

O evento JSON `ready` informa URL/porta disponível. `npm start` exige uma senha didática de 12..128 caracteres e cria Ana e Bruno no primeiro banco; se o banco já existe, o seed preserva os hashes existentes. Exclua apenas seu banco de demonstração se quiser trocar o seed. Nunca use contas/senhas de produção. Não existem token padrão nem segredo embutido no servidor. `DB_PATH` é configuração confiável do operador, nunca um parâmetro HTTP.

`build` verifica sintaxe ESM; o projeto é JavaScript e não alega typecheck TypeScript. A prática `22.06` é continuada em `src/schema-bridge.mjs` (guard manual fornecido), `parsePayment` com Zod a implementar e corpus idêntico positivo/negativo em `test:schema`. Depois aplique o schema às rotas. Compare mensagens, custo/importação e limites em `ADR-001.md`.

## Contrato e teste adicional escolhido

`npm test` executa o mesmo contrato contra `node:http` e Hono servido pelo **adaptador Node**. O wrapper `scripts/test.mjs` cria uma pasta UUID no processo pai e executa a suíte num único processo filho (`--test-isolation=none`), dono do SQLite. Cada caso usa diretório reservado pelo pai, porta efêmera, espera `listening` e fecha/valida listener e DB no filho. Somente depois da saída do filho, o pai remove serialmente DB/WAL/SHM e seus artifacts conhecidos, verifica diretórios vazios e comprova rmdir/ausência no próprio processo. A falha por duplicação da segunda tarefa testa rollback real de projeto + primeira tarefa. A suíte também reabre o banco e verifica preservação/idempotência das migrações. Senhas recebem `crypto.scrypt`, salt CSPRNG e comparação constante. Sessões Bearer têm 256 bits CSPRNG, TTL e revogação; o banco armazena apenas SHA-256 do token.

O store permanece em WAL e usa DatabaseSync.close para fechar suas conexões. Resultados são separados: a suíte nativa precisa cumprir suas asserções; o pai precisa aprovar cleanup após child exit. Cleanup aprovado não transforma timeout/import/erro de ambiente em teste aprovado nem mutante morto. Não execute este contrato por `node --test` diretamente: use os comandos npm fornecidos para manter ownership. No Windows foram capturados artifacts `<DB>-SHM.tmp`/`<DB>-WAL.tmp` de ator desconhecido; a tentativa de saída explícita de WAL não estabilizou o teardown no mesmo processo e foi retirada. O pai aceita somente nomes whitelisted derivados do DB; filho inesperado, unlink recusado ou ENOTEMPTY falha, sem retry ou supressão.

Escolha adicional de 7.4: **mutation testing**. A equipe usa quatro alterações completas e isoladas (proprietário, rollback, sessão previsível, schema permissivo). Ao entregar, proponha um quinto mutante, execute a mesma suíte e explique risco/custo. Na fixture interna, `node scripts/verify-fixtures.mjs` cria cópia temporária, instala a referência apenas ali, exige referência verde, starter vermelho por asserção e quatro mutantes rejeitados por asserção. Os diretórios `reference/`, o gate interno e o reporter da equipe não fazem parte do ZIP do aluno.

## Escopo e evidência

Os resultados enviados pelo aluno são **local-declared**. O site não executa sockets/SQLite/npm, não verifica seus documentos e não concede `demonstrated` com saída local, teste da referência ou mutante. Conclua também `24.01`: quatro blocos comuns, patch de IA, transferência e quatro rubricas. Este checkpoint sozinho não conclui a Fase 7 nem comprova senioridade. A carga de 30–45 h é estimativa sem calibração com alunos.

Leia `manual-test-plan.md`, `ticket.md`, `change-request.md`, `incident.md` e preencha `postmortem.md`. Registre ajuda, decisões, comandos, Node exato, SO, falhas e lacunas. O modelo ADR é um trabalho a completar, não uma aprovação prévia.

## Limites honestos

HTTP loopback didático, sem HTTPS, interface web, cookies, CSP/DOM ou upload. Cookies exigiriam HttpOnly/Secure/SameSite, CSRF e origem explícita; Bearer aqui exige envio manual no header e rejeita Origin, não oferece acesso por browser. CORS não é autorização. O token não deve ir a URL, log ou localStorage. O desenho não inclui refresh token, recuperação de senha, múltiplos processos, limitação de tentativas por identidade ou revisão de parâmetros scrypt para produção. Não publica uma API pronta para internet. SQLite síncrono bloqueia o event loop e é adequado apenas ao volume pequeno desta atividade. SQL usa parâmetros; não há comando externo, URL de saída, upload ou eval na aplicação; essas dispensas não substituem a fixture comum 24.01.

Não há E2E Playwright específico desta API: sua integração exigida é HTTP + SQLite real; navegador é coberto na atividade comum e tem evidência própria. Sinais POSIX e Ctrl+C/IPC no Windows não são equivalentes a `Stop-Process -Force`: interrupção forçada não comprova graceful shutdown. Testes locais de close não comprovam comportamento de produção sob carga, falha de energia ou todos os sinais/SOs.
