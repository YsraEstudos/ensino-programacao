# Task 1 — núcleo 04–10

## Escopo materializado

O catálogo compilado contém **69 atividades** entre 04 e 10. As 30 que estavam sem avaliação agora têm assessment: 22 suites de comportamento executáveis e 8 avaliações rubric-declared com critérios concretos. O gate parte dos arquivos `catalog-before.json` e `assessments-before.json`, confirma os 30 casos iniciais e mantém fixos os 17 starters que eram apenas prosa.

Os 17 starters agora têm `main.js`: 04.03, 06.02, 06.03, 07.01, 07.03, 08.01, 08.02, 08.04, 09.01, 09.02, 09.04, 09.05, 09.07, 10.01, 10.02, 10.06 e 10.07. Também foram materializados ou corrigidos os artefatos de 04.01, 04.08, 04.10, 05.01, 05.03, 06.01 e 08.07.

## Evidência de avaliação

As 22 atividades executáveis têm testes protegidos que importam `main.js`; o gate executa as referências e exige que passem. Nas atividades de implementação, reconstrução, depuração e transferência, o gate também exige ao menos uma falha do starter. Previsões/traços usam o programa de referência como observação, e as nove tabelas estruturadas foram comparadas ao JSON emitido: 04.01, 05.01, 06.01, 06.02, 08.01, 08.07, 09.01, 09.04 e 10.01.

04.10 é a exceção intencional ao critério starter-fail: a tarefa pede renomeação sem mudança comportamental, então o starter passa a suíte de regressão. O teste protege API e saídas; a rubrica humana revisa os nomes. Não se infere qualidade de nomes por AST nem se apresenta essa atividade como implementação reprovada pelo starter.

07.01 e 09.07 são leitura/comparação conceitual com tabelas executáveis e avaliação rubric-declared. A execução demonstra as APIs; a justificativa conceitual fica nos critérios humanos. Em 08.01, a comparação registra rótulos declarados observáveis e diz explicitamente que saída ou tempo de execução não mede Big-O. Em 10.01, os casos capturam o `TypeError` real da chamada de método desvinculada e comparam com `this` léxico da arrow.

As respostas são salvas em `exercisePredictions`, antes de liberar a prática, como JSON versionado. Depois de executar, o painel mostra valores esperados e observados, identifica previsões parciais e chama a comparação de reflexão, sem transformar acerto de previsão em nota ou bloqueio. Um rascunho livre antigo ou JSON de outra versão continua visível e escapado; o botão de substituição abre uma previsão atual sem apagar o conteúdo antigo até que o aluno confirme uma resposta nova. Formatos antigos não são comparados nem liberam a execução da atividade até o registro explícito da previsão estruturada vigente. Respostas estruturadas maiores que o limite de 400 caracteres são recusadas sem truncamento, gravação ou alteração do rascunho/progresso. A tabela que define esses campos integra o fingerprint; os metadados editoriais de evidência ficam fora dele, preservando fingerprints históricos sem `predictionTable`.

## Verificações

- `npm run build:curriculum` — passou usando `DEVPATH_PYTHON` do runtime bundled; compilou 261 atividades.
- `node scripts/test-phase2-core.mjs` — passou: 69 atividades, 17 starters materializados, 30 assessments adicionados; valida referência, falha de starter onde aplicável, comparação das nove previsões e registros estruturados.
- `node scripts/test-course-assessment.mjs` — passou: 78 testes, incluindo fingerprint de `predictionTable`, allowlist e estabilidade quando o campo está ausente.
- `node scripts/validate-course-catalog.mjs` — passou: 261 atividades e IDs de API compatíveis.
- `node scripts/test-course-controller.mjs` — passou: 11 testes, incluindo preservação de resposta livre legada e aviso/bloqueio para versão incompatível até substituição explícita.
- `node scripts/test-app-maintenance.mjs` — passou: 8/8 após a fixture do root selecionar 04.02. O seed antigo de 04.01 não incluía exerciseVersions=2 após a mudança real do starter; isExerciseDone verifica essa versão. A causa não era uma exigência genérica de testes em isExerciseDone.
- Browser core do root — 22/22 referências aprovadas; 9 comparações observadas; 22 drafts e seus estados após reload verificados; sem erros de página. Evidência: `output/playwright/fase2/core-browser-results.json`. Migração de previsão legada: 2/2 casos aprovados no Chromium, incluindo substituição explícita, exibição escapada e preservação após reload (`output/playwright/fase2/legacy-browser.log`).

Não houve commit, push ou deploy. Os gates globais ficam para a integração da Fase 2.
