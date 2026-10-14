# Fase 2 — tarefa 7: LRU e Worker

## Escopo implementado

- **21.04:** suíte cobre refresh LRU, remoção da chave menos recente, capacidade padrão 2, capacidade 0, valores falsy, erros não armazenados com retry, pares adversariais de chave e capacidade 3. A sequência de capacidade 3 mantém `C` depois de `A,B,C,A,D` e confirma que `B` foi removida.
- **21.05:** suíte DOM executa `main.js`, `worker.js` e `primos.js` com Worker nativo. Além de IDs, erros isolados e fechamento, a suíte ativa preserva a validação independente por crivo para todo `n` de 0 a 1500, `N=20011`, 12 amostras determinísticas e entradas inválidas `-1`, `2.5`, `NaN`, `Infinity` e texto. Os casos Task 4 publicados para essa cobertura são `21.05.sieve-range-and-deterministic-samples` e `21.05.invalid-inputs`.
- **Fallback sem Worker:** o código de referência já executa `contarPrimos` em `Promise.resolve().then(...)` quando não há `Worker`. O gate Node focal prova resolução assíncrona, `RangeError` e rejeição após fechamento nesse modo. O cálculo continua executando na thread principal e pode bloqueá-la; a suíte DOM nativa não simula indisponibilidade de Worker.

## Contratos Task 4 e Worker real

O gate focal verifica a propagação de `assertionCases` do DOM runner para o grafo usado no bundle do Worker. No Edge, cada grafo de `worker.js` recebeu 29 registros de assert e os seis IDs públicos da atividade. O teste de IDs segura a primeira chamada a `postMessage`, envia a segunda e depois a primeira por `NativeWorker.prototype.postMessage.call`; observa eventos nativos e comprova que as promessas recebem resultados associados aos IDs. O Worker e os cálculos não são simulados.

## Verificação

- `node scripts/test-phase2-workers.mjs`: 5/5 passaram. A referência LRU passa; `fifo-hit` e `fn-throw-poisons-cache` falham na suíte nova. A suíte histórica antiga passa contra `fn-throw-poisons-cache`.
- `node --test scripts/test-course-worker-preview.mjs scripts/test-course-dom.mjs`: 15/15 passaram, incluindo repasse dos contratos ao bundle do Worker.
- Microsoft Edge 155 servido em `http://127.0.0.1:8765/devpath.html`: referência 21.05 passou 5/5; a suíte histórica passou 3/3 contra referência e `cleanup-without-terminate`. Os mutantes `off-by-one-prime-count`, `skips-two`, `cleanup-without-terminate` e `response-ignores-id` foram rejeitados. O mutante de IDs falhou no caso `21.05.real-worker-response-ids`; o mutante de cleanup falhou em `21.05.close-terminates-and-cleans-pending`.
- Evidências reexecutáveis: [task7-browser-result.json](workers/task7-browser-result.json), [task7-browser-run.log](workers/task7-browser-run.log) e [task7-browser-check.js](workers/task7-browser-check.js).
- `node scripts/test-phase2-contracts.mjs` foi executado antes da publicação e parou porque os assets públicos ainda não continham o novo ID `21.04.composite-keys-capacity-three`. Esse gate depende do publisher consolidado que o root executará; não rodei build amplo nem regeneração canônica.

Os snapshots históricos permaneceram intactos: `21.04.old.test.js` SHA-256 `2788B9CD75FD8C18D82C622F426C37251D67947E6682A05B87B1D432CAFA6B86`; `21.05.old.test.js` SHA-256 `61853B01C55D060AB235CDCE32BAAFCB100F6EC43DDFA41476C49B8184D9174A`.

Fechamento consolidado pelo root em14/10: publisher e --check executados com265 atividades; assets:version atualizado. O gate de contratos após publicação passou:156 suítes,1045asserts anotados,998IDs estáveis. A re-review especializada confirmou restauração do crivo/entradas inválidas, remoção de TTL e fallback focal sem Worker.
