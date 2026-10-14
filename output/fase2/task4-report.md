# Task 4 — contratos públicos e primeira divergência

## Implementado

As 156 suítes `course-src/tests/*.test.js` contêm 1.045 asserts anotados com 998 IDs estáveis. O gate associa cada marker diretamente ao matcher da AST, permite apenas espaço/comentário e o prefixo `await` entre eles, rejeita markers órfãos/ambíguos e compara uma ocorrência de contrato por contexto. IDs repetidos permanecem como contextos distintos e todos são conferidos; nenhum é descartado por um `Map` de chave única.

O registro canônico e o publicado preservam expressão completa do assert, entrada estática, matcher, negação, esperado, prefixo de arranjo, domínio e origem. A regra pública preserva modos assíncronos (`rejects.toBe`, `resolves.toBe`), e o feedback mostra o matcher completo com negação em sua posição (`rejects.not.toBe`). Nos domínios `Object.entries(versoes)` de 05.06 e 08.06, os bindings de módulo e suas implementações são publicados e comparados com a AST.

O materializador agora preserva IDs e campos contratuais existentes e falha com mensagem explícita se entrada, matcher, esperado, negação, expressão completa, domínio, binding ou prefixo AST mudar sem revisão do contrato. Não remove asserts anteriores do arranjo. A execução final materializou 1.045 registros, preservou os 998 IDs estáveis e o gate de contratos passou.

O fingerprint mantém schema `/2`; somente tokens exatos `/*@case ID*/` em suites reconhecidas são removidos. Strings, templates, regex literals e comentários editoriais permanecem no hash. A regressão inclui um regex válido contendo texto parecido com marker. O primeiro DTO de falha contém valores seguros e limitados, via matcher, com captura runtime apenas pelo helper explícito. O caminho runner → assessment → controller persiste e exibe a primeira divergência para execução comportamental; erros de execução, timeout e typecheck não viram divergência semântica.

## Validação

- `node scripts/test-phase2-contracts.mjs`: passou; 156 suítes, 1.045 asserts e 998 IDs.
- `node --test scripts/test-phase2-feedback.mjs scripts/test-course-test-runtime.mjs scripts/test-module-graph.mjs`: 22/22 passaram, incluindo dois contextos de um mesmo ID público com feedback associado à ocorrência correta.
- A suíte integrada da Fase 2 passou 53/53; inclui associação AST, `.not`/`.rejects`/`.resolves`, captura sem reavaliação de entrada, contexto de caso e DTO limitado.
- Após a correção do hash baseado em parser, `scripts/test-course-assessment.mjs` passou 83/83 e `scripts/test-module-graph.mjs` 7/7, incluindo fingerprint annotation-only estável, mudança semântica distinta, strings, comentários e regex literal.
- `node scripts/test-course-runner.mjs`: 6/6.
- `node scripts/test-phase2-contracts.mjs`: valida também que a regra publicada e a investigação dos asserts assíncronos conservam `rejects`/`resolves` junto ao matcher.
- `node scripts/test-module-graph.mjs`: 5/5; `node scripts/test-course-controller.mjs`: 13/13.
- `node scripts/test-project-export.mjs`: 25/25. Os campos de grader continuam filtrados do export; as suites não foram inseridas no projeto exportado.
- `node scripts/test-check-local-course-cli.mjs`: 3/3.
- `npm.cmd test`: terminou com exit 0, incluindo 12/12 testes da Fase 1 e 53/53 da Fase 2.
- `npm.cmd run build` com `DEVPATH_PYTHON=C:/Users/israe/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`: build de produção concluído. O validador curricular manteve dois avisos de pré-requisito em 04.01 e zero erros.
- Edge 155: `output/playwright/fase2/feedback-browser-results.json` registra 04.04 com `inputRuntime: [2,4]`, esperado `3`, observado `6`; a evidência persistiu após reload, a referência corrigida passou, annotation-only preservou o hash, mudança semântica mudou o hash e não houve page errors.
- Edge 155: `output/fase2/workers/task7-browser-result.json` registra 21.05 com Worker nativo, 5/5 casos de referência, suíte histórica 3/3 e quatro mutantes rejeitados; a suíte histórica ainda aceita o mutante de cleanup, confirmando a lacuna antiga que o contrato novo fecha.

As baselines protegidas `initial-hashes.json`, `catalog-before.json` e `assessments-before.json` mantiveram seus horários de modificação de 13/10. A Task 7 foi validada depois da publicação local consolidada; não houve commit, push ou deploy.

## Limites

As expressões de entrada de loops como 04.11 e 20.05 e closures como 09.08 permanecem estáticas; o DTO não afirma qual valor de loop/closure foi observado. Em 20.05, o assert do loop c035 confere as cinco escritas inválidas; o assert 665 confere separadamente que `age` continua em 150, em dois contextos. A captura runtime demonstrada no Chromium é o helper explícito de 04.04; sua investigação visível ao aluno descreve o cálculo da média sem expor o helper interno. Suites marcadas `source-local-suite; not evidence of browser behavior` não são apresentadas como executadas no site. O caminho de falha foi exercitado no navegador para 04.04; os oito trechos para leitura humana estão em `output/fase2/task4-sample-review.md`.

Em 14/10, o usuário dispensou a revisão humana pedida pela especificação 2.3 e decidiu considerar o item resolvido. O sample-review continua pronto para consulta; nenhuma revisão humana é alegada aqui.
