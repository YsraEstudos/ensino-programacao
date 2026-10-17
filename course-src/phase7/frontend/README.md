# 24.03 — Front-end: Quadro Kanban

Checkpoint local exportável. Node **>=24.0.0**, TypeScript strict com DOM, Web Components nativos e Chromium do Playwright. Não há serviço público nem conta real. A API de fixture vem pronta; o exercício está em `src/model.mjs`, `src/storage.mjs` e `maintenance/visible.mjs`. A solução da equipe fica fora do ZIP.

## Começar no Windows

Extraia o ZIP em caminho curto, por exemplo `C:\dev\quadro`, e abra PowerShell nessa pasta. Preserve package-lock.json. Instale somente aqui:

```powershell
node --version
npm.cmd ci --ignore-scripts --no-audit --no-fund
npm.cmd run build
npm.cmd run test:types
npm.cmd test
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.browsers'
npm.cmd run browser:install
npm.cmd run test:e2e
npm.cmd start
```

Abra `http://127.0.0.1:4173/#/`. O starter compila e mostra uma mensagem indicando o contrato a implementar; `npm test` reprova por asserções. Depois de implementar, oito testes de integração/contrato/regressão e sete E2E devem passar. Import, download, spawn, socket, sinal e timeout são erros de ambiente/runner; não provam lacuna do aluno. Uma execução de Playwright que não abriu navegador não é E2E aprovado.

Para copiar o projeto sem dependências e executá-lo separadamente:

```powershell
$copy = Join-Path $env:TEMP ('quadro-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $copy
Get-ChildItem -Force | Where-Object Name -NotIn @('node_modules','.browsers','dist','test-results','playwright-report','reference','scripts') | Copy-Item -Destination $copy -Recurse
Set-Location -LiteralPath $copy
npm.cmd ci --ignore-scripts --no-audit --no-fund
npm.cmd run build
```

`npm start` usa porta4173; configure `$env:PORT='4174'` se necessário. O Playwright usa servidor exclusivo com `PORT=0`, espera `KANBAN_READY` com URL capturada e encerra seus processos. Não reutiliza servidor aberto pelo usuário. Ctrl+C encerra o servidor manual; o Windows não tem a mesma semântica de SIGTERM do POSIX. Testes de API fecham listener e conexões em finally.

## Contrato e prática

Leia `ticket.md`, `contract.md`, `ADR-001.md`, `change-request.md`, `incident.md` e `manual-test-plan.md`. Reserve 25–40h além dos blocos comuns24.01: arquitetura/rotas4–6h, estado/cache6–9h, IndexedDB4–7h, testes/acessibilidade/métricas7–11h, comunicação/manutenção4–7h. Faixas são estimativas sem calibração com alunos. Pré-requisitos diretos:11.08,13.14,12.16,14.16,14.18 e24.01; o mapa do curso contém o fechamento transitivo.

Rotas são `#/` e `#/tasks/:id`, com voltar/avançar e link profundo; hash dispensa fallback no servidor. Links de navegação e histórico revalidam a API na rota válida, mostrando o snapshot enquanto atualizam. Alteração externa aparece ao voltar ao quadro e ao revisitar detalhe. O skip-link move o foco para main sem mudar o hash ou a rota. `kanban-app` coordena estado e efeitos, `kanban-board` renderiza o quadro; DOM light mantém semântica inspecionável e estilos simples. Texto da API usa textContent. O modelo faz cache por quadro e revalidação; um contador de geração invalida respostas antigas, inclusive uma falha antiga após sucesso recente. Não use só comparação de chave: duas requisições para a mesma chave também chegam fora de ordem.

No detalhe da mesma tarefa, revalidar mantém o select interativo, o mesmo controleDOM e o foco. Uma escolha ainda não salva prevalece sobre o snapshot recebido; se não há edição pendente, a seleção acompanha a API. Salvar confirma a escolha enviada e encerra esse draft; uma escolha nova feita enquanto salva continua pendente. Mudar de rota encerra o editor daquela tarefa; o draft não é uma mutação persistida nem uma filaoffline.

IndexedDB v1 contém `cards` com `completed:boolean`; v2 contém `tasks` com `status`. Migre dentro de `onupgradeneeded`, preservando id/título/data e mapeando completed para done/todo. O store legado permanece para auditoria; abrir v2 novamente não repete a migração. `writeTasks` substitui snapshot de forma transacional. A UI salva apenas quadroall; não salve resultadoempty/error como substituto das tarefas. Cache IndexedDB é snapshot offline de leitura, sem fila de escrita offline. Mutação exige API disponível; o seed da API reinicia a cada processo.

O service worker fornecido guarda somente o shell estático; chamadasAPI permanecem de rede e os dados ficam em IndexedDB. Primeiro acesso precisa estar online para instalar/ativar o worker. Offline é suportado após essa preparação, inclusive reload. Ao alterar o shell para uma entrega, incremente o nome de cache em sw.js; teste upgrade/retorno de versão. Não há fila de writes, atualização de múltiplas abas ou política de conflitos nesta fixture. Se o upgrade for bloqueado, a UI orienta “Feche outra aba do quadro e tente novamente.”; feche a aba que segura a versão antiga e recarregue para retomar a persistência.

Web Vitals usa **web-vitals6.2.3**, callbacks reais onLCP/onCLS/onINP; nenhuma métrica é inventada. Não envia telemetria: amostra aparece na UI. LCP/CLS finalizam com ciclo de visibilidade; INP precisa de interação suportada pelo navegador. O E2E injeta carga de80ms em uma interação para testar Event Timing; é amostra de laboratório, sem p75/RUM, selo de desempenho, garantia de campo ou comparação entre dispositivos.

Técnica adicional escolhida: mutação. O gate interno altera guarda de geração, cache, validação, filtro de manutenção e migração; os mesmos testes devem rejeitar as cinco regressões por asserção. Custo: várias cópias/processos/navegador; risco: mutantes sintáticos triviais não representam todos os defeitos. Os scripts internos e mutantes não são respostas exportadas.

## Evidência e limites

Registre Node/SO, comandos/saídas, diff, ajuda, ticket, ADR, revisão, mudança F-33 antes/depois e incidente I-F32/postmortem; complete quatro blocos/rubricas24.01. **local-declared**: a execução da referência pela equipe não é execução independente da submissão do aluno e não concede demonstrated.

Automação cobre fluxo real Chromium desktop/mobile, teclado/link/foco, estados, retry, corrida de rede, reload offline, migração/reabertura e Web Vitals. Não é auditoria WCAG completa: leitor de tela, zoom200/400%, contraste medido, toque e outros navegadores permanecem manuais. API é fixture local sem autenticação; controles de sessão/CORS/CSRF e rubricas comuns permanecem obrigatórios em24.01. SQL/upload/URL remota/comando não existem neste fluxo. CSP/textContent e teste de payload cobrem a fronteira DOM pertinente; não há eval.

Fontes: [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components), [IndexedDB upgrade](https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/upgradeneeded_event), [web-vitals](https://github.com/GoogleChrome/web-vitals), [servidor Playwright](https://playwright.dev/docs/test-webserver). A implementação curricular local da Fase 7 inclui também o bloco de bibliotecas 24.04. Ainda falta homologar navegação/exportação no Site e retomada/sincronização em conta real.
