# Tarefa 6 — medição consentida e escopo da carga

Data: 14/10/2026

## Integração

O contador e sua UI são carregados antes de `app.js`; o painel permanece em `#study-time-root`, fora de `#view`. A inicialização ocorre depois que `activityById` recebe o catálogo. `getActivity` usa `routeInfo()` e só retorna um item para a rota de atividade. A obtenção de `localStorage` está protegida por `try/catch` e os intervalos usam `performance.now()`. O componente não publica conteúdo de resposta nem eventos de tentativa.

O opt-in fica desligado por padrão. Com consentimento, o armazenamento local contém apenas IDs de atividades e milissegundos. Quando a persistência é bloqueada, a aprendizagem continua e a UI informa que a sessão fica em memória. A UI coordena rota, foco, visibilidade, `pagehide`/`pageshow`, eventos `storage`, flush periódico e descarte. Revogar apaga o registro e interrompe outras abas; atualização remota de consentimento ativo não é ecoada.

## Carga horária

O catálogo publicado contém 265 atividades. A soma atual dos campos `duration` é 6.722 minutos (112 h 02 min), que representa somente a estimativa guiada registrada por atividade. Durações guiadas e tempo com foco medido são apresentados separadamente.

A faixa declarada de 370–500 horas é descrita nesta revisão como faixa provisória de planejamento que pode incluir, além das atividades guiadas, leitura de documentação oficial, prática externa, retomadas/retakes e projetos. Esta explicação estabelece o escopo na revisão atual; não há evidência de uma decomposição histórica por componente. A diferença não recebeu alocação matemática e nenhum multiplicador foi inferido. A faixa não foi validada com alunos; observação de estudantes e calibração permanecem pendentes. O escopo está registrado em [`docs/README.md`](../../docs/README.md).

## Verificação técnica

Testes Node:

- `scripts/test-phase2-study-time.mjs`: 5/5 passou.
- `scripts/test-phase2-study-time-ui.mjs`: 5/5 passou, incluindo retorno por `pageshow` e ausência de echo em evento `storage`.
- `scripts/test-app-maintenance.mjs`: 8/8 passou.
- ESLint focal em `public/app.js`, `public/study-time.js` e `public/study-time-ui.js`: sem erros; permanece um warning preexistente em `public/app.js:218` (`target` definido e não usado).

O QA controlado em Microsoft Edge foi executado no servidor local `http://127.0.0.1:8765/devpath.html` em contexto novo. O helper desligou por CDP a emulação de foco configurada pelo Playwright em cada página; não sintetizou eventos DOM.

- Opt-in e tempo por atividade: 04.01 acumulou 1.423 ms e 04.02 acumulou 1.438 ms em intervalos reais de espera no browser. A UI mostrou a estimativa guiada de 14 min para 04.02 separadamente.
- Navegação e reload: sair para o catálogo produziu delta persistido de 0 ms no período de pausa. Depois de reload, 04.02 passou de 2.768 ms para 4.174 ms.
- Eventos de storage: a primeira aba recebeu 1 atualização remota, sem escrita de echo (0); revogar consentimento na outra aba removeu o registro e ele não foi recriado.
- Foco/visibilidade: não observável neste harness. Após desativar a emulação Playwright, as duas páginas ainda reportaram `document.hasFocus() === true`, `visibilityState === "visible"` e nenhum evento nativo ao alternar `bringToFront`. Um pedido CDP para minimizar a janela também não mudou esses sinais. O cenário ficou `not-observable` no [`task6-qa.json`](task6-qa.json); esta execução não comprova pausa por foco/visibilidade no navegador. O contrato permanece coberto pelos testes unitários da UI.

Este QA é uma verificação funcional controlada, não amostra de aluno, estudo de uso, validação pedagógica ou calibração de carga. O JSON continua `passed-with-limits` porque a evidência de foco real não ficou observável. Após o wiring final do parser, o root concluiu `npm.cmd run build` e `npm.cmd run assets:version`, ambos com exit 0; o validador registrou 265 cartões, zero erros e dois avisos conhecidos em 04.01.
