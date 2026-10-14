# Task 8 — gates gerais e fechamento de integração

Data: 14/10/2026

## Gates e correção de contrato

O gate geral de atividade usa o catálogo e as avaliações publicados para verificar as referências e as suítes de aluno. As referências precisam passar; starters de implementação precisam falhar; exceções observacionais são limitadas a pares explícitos de ID e tipo. O harness executa os contratos publicados em ambiente DOM/Node conforme a avaliação, mantém os arquivos de referência corretos para mutação e rejeita mutante que sobreviva.

O gate da Task 8a deriva o conjunto esperado de atividades das baselines protegidas e das 15 conversões justificadas na matriz da Task 2. A evidência final (`output/learning-execution/task-8a-evidence.json`) cobre 55 atividades, das quais 34 têm avaliação executável. Todas as referências executáveis passaram e 64 execuções de mutantes foram mortas. As cinco exceções observacionais são permitidas apenas pela lista explícita de ID/tipo. Os três testes negativos falham como esperado para suíte vazia, referência que falha e mutante sobrevivente.

O teste de regressão da Fase 1 ainda esperava `12.02.requires = ['04.12']`, enquanto o currículo corrente publica `['04.11', '04.12']`. Atualizei a expectativa do teste em `scripts/test-phase1-errors.mjs` para acompanhar a aresta publicada; não foi necessário mudar o conteúdo da atividade. A verificação de Fase 1 passou 12/12 depois do ajuste.

Os scripts `test:catalog`, `test:learning`, `test:executors`, `test:phase1` e `test:phase2`, além dos gates de progresso, app, runtime, layout, diagnóstico e etapas, estão encadeados em `npm test`. O gate agregado final executou de ponta a ponta e terminou com exit 0. A Fase 2 passou 53/53, sem falhas nem skips. A exceção de Worker em um gate Node é intencional e foi validada separadamente no Edge por meio de Worker nativo.

## Verificações finais

- `npm.cmd test`: exit 0; Fase 1 12/12 e Fase 2 53/53. A saída geral inclui a exceção Node para 21.05, coberta pelo gate Edge nativo.
- `npm.cmd run build`: exit 0; 265 atividades publicadas, zero erros e dois avisos conhecidos de pré-requisito em 04.01.
- `npm.cmd run assets:version`: exit 0.
- ESLint focal dos arquivos alterados: exit 0, sem erros nem avisos. Removi um import `statSync` que ficou sem uso em `scripts/test-phase2-dynamic.mjs`; a suíte correspondente passou 16/16 depois disso.
- Edge 155, feedback: 04.04 preservou a primeira divergência após reload (`[2,4]`, esperado `3`, observado `6`), passou após corrigir a referência, manteve igualdade de fingerprint para alteração só de anotação e registrou zero erros de página (`output/playwright/fase2/feedback-browser-results.json`).
- Edge 155, Worker: referência 21.05 passou 5/5; a suíte histórica passou 3/3; quatro mutantes foram rejeitados. A suíte antiga aceita o mutante de cleanup, enquanto a nova o mata (`output/fase2/workers/task7-browser-result.json`).

## Pendências e limites

A revisão humana da amostra da Task 4 foi dispensada pelo usuário em 14/10 e está marcada como resolvida por dispensa; nenhuma leitura humana é alegada. O QA de tempo local verificou contagem por atividade, navegação, reload e revogação, mas não mediu uso real de aluno; foco e visibilidade nativos não ficaram observáveis no harness. Portanto, a medição não calibra as 370–500 horas declaradas. O trabalho técnico da Fase 2 está integrado; somente a validação de uso real e calibração permanecem pendentes.

Não houve commit, push, deploy ou publicação externa.
