# Task 5 — diagnósticos por faixa

## Resultado

Task5 implementada com quatro atividades novas, D.06–D.09, anexadas depois de D.01–D.05. As faixas são Fundamentos, Intermediário, TypeScript e Avançado. As recomendações permanecem limitadas à primeira entrada de cada faixa: D.06 → 01.01; D.07 → 07.01; D.08 → 15.01; D.09 → 21.01. A matriz vincula os campos às competências e às listas públicas de pré-requisitos `learningMetadata.requires`; ela não usa `recipe.requires` como fonte de pré-requisito.

O diagnóstico produz previsões declaradas de estudo. O envio registra resposta explicada, mas não chama avaliação, não cria `verified`/`demonstrated` e não certifica uma etapa. Respostas `unknown`, incorretas ou incompletas, e respostas em tentativa assistida continuam permitindo estudar e concluir a atividade; não geram entrada sugerida. Concluir com reflexão vazia envia o snapshot realmente registrado ao adaptador de estudo (ou a reflexão se ela atende ao mínimo do contrato), de modo que a transição possa registrar `studied` sem fabricar texto. Uma tentativa completa, correta e independente recomenda somente o item mapeado e não conclui nenhuma atividade antiga.

Os snapshots compactos guardam respostas, confiança e revisão e permanecem abaixo de 400 caracteres. Cada submissão conserva `attemptId`, versão/revisão, modo, independência, assistência, cobertura, recomendação e horário. Os campos passam pelo sanitizer e pelo roundtrip da API. D.07 cobre alias de array (`b = valores`) e isolamento de array copiado por `slice`. D.08 cobre alias de objeto, campo primitivo de uma cópia rasa e a referência aninhada que continua compartilhada (`pessoa.meta.ativo` e `copia.meta === pessoa.meta`). Todas essas respostas fazem parte da elegibilidade.

Feedback pós-envio não cria ajuda. Editar resposta/confiança depois de feedback fecha a explicação antiga e registra ajuda na tentativa de recall; reverter aos valores anteriores não reabre o snapshot antigo. A nova resposta precisa de outro envio. Reflexão não altera a revisão da resposta. Uma nova tentativa recall também exige envio próprio antes de revelar feedback.

## Evidência de verificação

Executados isoladamente, todos com exit 0:

| Comando | Resultado |
|---|---:|
| `node --test scripts/test-phase2-diagnostic.mjs` | 10/10 |
| `node --test scripts/test-diagnostic.mjs` | 12/12 |
| `node --test scripts/test-learning-paths.mjs` | 9/9 |
| `node --test scripts/test-learning-paths-review.mjs` | 8/8 |
| `node --test scripts/test-progress-api.mjs` | 7/7 |
| `node --test scripts/test-progress-model.mjs` | 5/5 |
| `node --test scripts/test-course-catalog-validator.mjs` | 4/4 |
| `npm run check:curriculum` | 265 cards; D=9; catálogo e IDs API concordam; 0 errors |
| `npm run build:progress` | exit 0 |

O gate Task5 percorre submissões completas nas quatro faixas, limites de campo ausente, `unknown`, sequência fora de ordem, erro em alias/cópia, ajuda antes do envio, feedback, reflexão, edição, reversão, reload e novo attemptId. Ele verifica que errar uma questão dos pré-requisitos 05.01 ou 06.01 bloqueia a entrada. A fixture confirma que conclusão sem reflexão envia o snapshot efetivo ao adaptador; o callback browser verifica `studied` no armazenamento real após reload. O teste de API verifica que a elegibilidade anterior e o marcador de assistência persistem lado a lado. O teste legado percorre D.01–D.09 e preserva a exceção editorial original de rótulos em D.05. No diff editorial, os novos objetos começam depois de D.05; não houve alteração de IDs existentes nem das listas protegidas de baseline.

O teste da API imprime logs esperados nas duas verificações de registro JSON corrompido; esses casos também passam e a suite terminou com exit 0. Após os ajustes finais, root confirmou o build consolidado em 265 atividades; a igualdade fonte/public também passa em `test-diagnostic`. O validador curricular reportou dois avisos preexistentes em 04.01 (`arrays.pipeline` e `callbacks.basic`); não são erros e não foram alterados pela Task5.

## Limites e próxima verificação

Root executou o callback `output/fase2/playwright-task5.js` no Edge com servidor local na porta 8765. Os oito cenários passaram: recomendações limitadas D.06→01.01, D.07→07.01, D.08→15.01, D.09→21.01 com reload; `unknown` permite concluir estudo sem sugestão e preserva estado `studied` após reload; ajuda pré-envio bloqueia a sugestão; edição/reversão cria uma resposta assistida sem apagar a submissão histórica; e um novo recall não reutiliza o feedback antigo antes de reenvio explícito. Evidência: `output/playwright/fase2/diagnostic-browser-results.json` e `output/playwright/fase2/diagnostic-browser.log`.

Essa sessão comprova comportamento local da UI e persistência no navegador. Não é calibração com alunos nem prova de transferência, retenção ou proficiência.
