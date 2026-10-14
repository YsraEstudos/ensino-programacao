# Task 3 — Rubricas e entregas dos capstones

## Mudanças

- O publisher publica `assessment.rubric` quando existe. Sem ela, o cartão usa os critérios específicos da fonte editorial. Os fallbacks `Aceite qualquer implementação` e `Rode critérios comportamentais` não aparecem no checklist nem no texto de pontuação dos exemplos públicos; esses exemplos usam a rubrica ou o contrato específico.
- Os itens 09.08, 11.08, 12.08, 14.08 e 23.08 agora mostram critérios ligados ao resultado e às falhas declaradas. Os quatro capstones apresentam entregas graduais nos checklists existentes; os critérios cabem nos arquivos editáveis de cada starter e na reflexão já salva pelo curso.
- Cada cartão com checklist publica `rubricFingerprint` (`sha256:` + SHA-256 do array ordenado de critérios). A evidência guarda esse identificador ao lado dos índices conferidos. O sanitizador TypeScript aceita apenas o formato delimitado e a API preserva o campo.
- Quando um cartão já concluído recebe outra rubrica, a tela mantém respostas, evidência e conclusão histórica, mostra que os critérios atuais precisam de revisão e não pré-marca índices antigos. Só conferir todos os critérios atuais revalida o registro. Rascunhos e reflexões mantêm suas chaves; `contentVersion` e `assessmentVersion` não foram incrementados por mudança editorial.
- O validador do catálogo agora reconhece `rubricFingerprint` como campo público.

## Verificação

- `npm.cmd run build:curriculum` — passou com 261 atividades.
- `node course-src/build-public-curriculum.mjs --check` — passou.
- `node scripts/validate-course-catalog.mjs` — passou; IDs e ordem continuam iguais ao currículo compilado.
- `node scripts/validate-curriculum-source.mjs` — 0 erros e 2 avisos preexistentes em 04.01 (prerequisitos de pipeline/callbacks declarados para a etapa 05).
- `node scripts/test-phase2-rubrics.mjs` — passou; valida uso das rubricas de avaliação, ausência dos fallbacks genéricos, critérios dos capstones, fingerprint e preservação de versões.
- `node --test scripts/test-course-controller.mjs scripts/test-progress-model.mjs scripts/test-progress-api.mjs scripts/test-course-catalog-validator.mjs` — 27 testes passaram. Inclui revisão de rubrica com a mesma quantidade de critérios, bloqueio de revalidação parcial, persistência API do fingerprint, e preservação de rascunhos/reflexões.

## Limites

Root validou os cinco cartões prioritários no Chromium: critérios exatos, marks antigos com a mesma contagem desmarcados e botão de conclusão disabled, rascunhos/reflexões anteriores visíveis, revisão explícita e entrega editada preservadas após reload. Zero page errors; `output/playwright/fase2/rubrics-browser-results.json`. A revisão técnica encontrou e corrigiu o estado inicial do botão antes deste rerun. Isso verifica a interface/persistência, não a correção das soluções de projetos.

A revisão explícita substitui os índices e o fingerprint da evidência atual. O formato mantém a evidência mais recente, sem histórico permanente de cada versão de rubrica. A revisão de aprendizado com pessoas continua distinta destes gates técnicos.
