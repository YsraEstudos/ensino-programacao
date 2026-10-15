# Fase 6: mapa de cobertura de conceitos do núcleo

Data: 2026-10-15. Gerado pelo script de apoio (fora do repositório) a partir das fontes listadas abaixo. Os números são estimativas de planejamento; a classificação editorial final depende de revisão humana.

## Método e fontes

- **Grafo e denominador:** os IDs de `course-src/.generated/concept_graph.json` (versão 3.1, gerado por `course-src/build_graph.py` a partir de `STAGE_INTRODUCES` em `course-src/compile_content.py`). O denominador são os conceitos do grafo, não a contagem de `primary_skill`.
- **Validação do grafo:** o JSON é posterior à última alteração de `compile_content.py` (confirmado). A checagem de metadados de aprendizagem (`scripts/learning-metadata.mjs`, `course-src/learning-metadata.json`) passou sobre o catálogo publicado.
- **Catálogo publicado:** `public/course-catalog.json` (302 atividades). Divergências com a fonte resolvida: 0. Classificação obrigatória/opcional pela regra de `requiredActivities()` (`public/app.js:369`): `optional !== true`.
- **Vínculo exato:** a atividade declara o conceito em `introduces` (skill primária, exceto na etapa 02, em que as skills secundárias também contam) ou em `secondary_skills`. Só o vínculo exato conta para variações existentes.
- **Vínculo sugerido (não contado):** atividade da mesma etapa de introdução com a mesma família de skill (prefixo antes do ponto). Serve para triagem; cada sugestão precisa de confirmação editorial antes de ser contada.
- **Executável no navegador:** `autoTested === true` e `assessmentEnvironment` em javascript, typescript, dom, network ou node-simulated. Local e rubrica não contam como execução comprovada.
- **Variações:** o alvo é 3 variações por conceito de implementação ou previsão-leitura. Cada atividade obrigatória com vínculo exato conta como uma variação existente; variantes dentro de uma atividade não contam como atividades concluídas. Novas = max(0, 3 − existentes).
- **Classificação:** implementação (há atividade obrigatória de MAKE, PROJECT, MODIFY, DEBUG, FADED, PARSONS, TEST, UI, TYPE, TRANSFER ou INVESTIGATE); previsão-leitura (somente PREDICT, TRACE, READ, COMPARE ou DOCS); isento com justificativa (proposta editorial, com texto na tabela); pendente (sem vínculo).
- **Faixas de kata:** um conceito é candidato à faixa 07, 11, 14, 18 quando foi introduzido em etapa anterior à faixa.

## Resumo

| Indicador | Valor |
|---|---:|
| Conceitos no grafo | 105 |
| Com vínculo exato | 43 |
| Associação ausente | 62 |
| Classificação: implementação / previsão-leitura / isento / pendente | 70 / 22 / 2 / 11 |
| Variações reaproveitadas (até 3 por conceito) | 44 |
| Dessas, executáveis no navegador | 6 |
| Novas variantes necessárias | 267 |
| Novas variantes se as sugestões forem confirmadas | 73 |
| Katas candidatos, faixa 07 / 11 / 14 / 18 | 55 / 65 / 78 / 89 |
| Estimativa de autoria de variantes (h) | 592.5 |
| Estimativa de autoria de katas (h) | 240 |
| Total estimado (h) | 832.5 |

**Estimativa não calibrada (2.7).** Premissas: variante de implementação 2,5 h (starter, referência, testes de reprovação e aprovação, enunciado); variante de previsão-leitura 1,0 h; kata de implementação ou pendente 1,0 h; kata de previsão-leitura 0,5 h; sem revisão editorial, sem tempo de tradução e sem calibração com alunos. Katas e variantes podem se sobrepor (um kata pode reutilizar uma variante), e o total não desconta essa sobreposição; por isso é um teto grosseiro.

## Achados

- **O grafo da Fase 4 não cobre as skills das atividades.** 266 de 302 atividades têm skill primária fora dos IDs do grafo. Os vínculos exatos existentes são poucos por conceito; por isso a maioria dos conceitos aparece como associação ausente ou depende de sugestão. Isso confirma o alerta da Fase 6: o grafo não é inventário de competências, e a associação precisa ser editada, não inferida.
- **Sugestões por etapa e família** indicam 53 conceitos sem vínculo exato que têm atividades candidatas. Confirmá-las reduz as novas variantes de 267 para 73.
- **Atividades opcionais** não entram na contagem do núcleo nem na tabela; os vínculos opcionais estão no JSON (campo exactOptional). Conceito com vínculo apenas opcional consta como vinculado, mas não entra em Existentes nem em Novas.
- **Carga estimada acima da faixa do plano:** 832.5 h, contra 370–500 h citadas na Fase 6. O plano diz que essa faixa não é teto; a diferença vem sobretudo das 267 variantes novas, que caem para 73 se as sugestões forem confirmadas. Recalcular após a revisão editorial.

## Tabela por conceito

Colunas: conceito; etapa de introdução; classificação; atividades obrigatórias com vínculo exato (tipo; "(ambiente)" quando não executável no navegador); executáveis no navegador; variações existentes; novas variantes; faixas de kata; status.

| Conceito | Etapa | Classificação | Atividades obrigatórias (vínculo exato) | Executáveis | Existentes | Novas | Katas (faixas) | Status |
|---|---|---|---|---:|---:|---:|---|---|
| `execution.order` | 00 | previsão-leitura | 00.01 PREDICT (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `environment.boundaries` | 00 | isento com justificativa | 00.05 READ (sem ambiente declarado) | 0 | 1 | 0 | 07, 11, 14, 18 | vinculado |
| `html.tree_reading` | 00 | isento com justificativa | 00.08 READ (sem ambiente declarado) | 0 | 1 | 0 | 07, 11, 14, 18 | vinculado |
| `modules.esm` | 00 | pendente | — | 0 | 0 | 3 | 07, 11, 14, 18 | associação ausente |
| `execution.contradiction` | 00 | previsão-leitura | 00.02 TRACE (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `execution.sequence` | 00 | implementação | 00.03 PARSONS (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `execution.fill_console` | 00 | implementação | 00.04 FADED (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `debug.first_error` | 00 | implementação | 00.06 DEBUG (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `execution.make` | 00 | implementação | 00.07 MAKE (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `execution.explain_program` | 00 | previsão-leitura | 00.09 TRACE (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `bindings.values` | 01 | implementação | — | 0 | 0 | 3 | 07, 11, 14, 18 | associação ausente; sugeridas: 01.02, 01.03, 01.04, 01.06, 01.07, 01.08, 01.09 |
| `primitives.types` | 01 | previsão-leitura | — | 0 | 0 | 3 | 07, 11, 14, 18 | associação ausente; sugeridas: 01.01, 01.05 |
| `primitives.typeof` | 01 | previsão-leitura | 01.01 PREDICT (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `bindings.reassignment` | 01 | previsão-leitura | 01.02 TRACE (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `bindings.declaration_order` | 01 | implementação | 01.03 PARSONS (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `bindings.const_let_choice` | 01 | implementação | 01.04 FADED (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `primitives.special_values` | 01 | previsão-leitura | 01.05 PREDICT (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `bindings.template_literal` | 01 | implementação | 01.06 FADED (sem ambiente declarado), 01.07 MAKE (sem ambiente declarado) | 0 | 2 | 1 | 07, 11, 14, 18 | vinculado |
| `bindings.configuration` | 01 | implementação | 01.08 TRANSFER (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `bindings.textual_profile` | 01 | implementação | 01.09 PROJECT (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `operators.basic` | 02 | previsão-leitura | 02.01 PREDICT (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `number.model` | 02 | implementação | 02.04 FADED (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `math.basic` | 02 | implementação | 02.10 MODIFY (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `control.branch` | 03 | implementação | — | 0 | 0 | 3 | 07, 11, 14, 18 | associação ausente; sugeridas: 03.04, 03.05, 03.01, 03.02, 03.03, 03.06, 03.07, 03.08, 03.09, 03.10 |
| `control.loop` | 03 | implementação | — | 0 | 0 | 3 | 07, 11, 14, 18 | associação ausente; sugeridas: 03.04, 03.05, 03.01, 03.02, 03.03, 03.06, 03.07, 03.08, 03.09, 03.10 |
| `functions.return` | 04 | previsão-leitura | 04.01 PREDICT | 1 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `functions.decomposition` | 04 | implementação | 04.03 PARSONS | 1 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `errors.throw` | 04 | implementação | — | 0 | 0 | 3 | 07, 11, 14, 18 | associação ausente; sugeridas: 04.11, 04.12, 04.13 |
| `errors.types` | 04 | implementação | — | 0 | 0 | 3 | 07, 11, 14, 18 | associação ausente; sugeridas: 04.11, 04.12, 04.13 |
| `arrays.basic` | 05 | implementação | — | 0 | 0 | 3 | 07, 11, 14, 18 | associação ausente; sugeridas: 05.01, 05.04, 05.06, 05.07, 05.10, 05.09 |
| `strings.basic` | 05 | implementação | — | 0 | 0 | 3 | 07, 11, 14, 18 | associação ausente; sugeridas: 05.03, 05.08 |
| `regex.basic` | 05 | implementação | — | 0 | 0 | 3 | 07, 11, 14, 18 | associação ausente; sugeridas: 05.02, 05.05, 05.12, 05.13, 05.14 |
| `unicode.basic` | 05 | previsão-leitura | — | 0 | 0 | 3 | 07, 11, 14, 18 | associação ausente; sugeridas: 05.11, 05.16 |
| `callbacks.basic` | 05 | pendente | — | 0 | 0 | 3 | 07, 11, 14, 18 | associação ausente |
| `objects.identity` | 06 | previsão-leitura | 06.01 PREDICT | 1 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `objects.own` | 06 | implementação | — | 0 | 0 | 3 | 07, 11, 14, 18 | associação ausente; sugeridas: 06.01, 06.02, 06.03, 06.04, 06.05, 06.07, 06.10, 06.11 |
| `serialization.json` | 06 | implementação | — | 0 | 0 | 3 | 07, 11, 14, 18 | associação ausente; sugeridas: 06.06, 06.12, 06.09 |
| `errors.try_catch` | 06 | pendente | — | 0 | 0 | 3 | 07, 11, 14, 18 | associação ausente |
| `arrays.pipeline` | 07 | implementação | — | 0 | 0 | 3 | 11, 14, 18 | associação ausente; sugeridas: 07.01, 07.02, 07.03, 07.06, 07.10, 07.08, 07.09 |
| `mapset.basic` | 07 | pendente | — | 0 | 0 | 3 | 11, 14, 18 | associação ausente; sugeridas: 07.14 |
| `git.basics` | 07 | implementação | — | 0 | 0 | 3 | 11, 14, 18 | associação ausente; sugeridas: 07.11 |
| `algorithms.complexity` | 08 | implementação | — | 0 | 0 | 3 | 11, 14, 18 | associação ausente; sugeridas: 08.01, 08.02, 08.03, 08.04, 08.05, 08.06, 08.07, 08.08 |
| `algorithms.recursion` | 08 | implementação | — | 0 | 0 | 3 | 11, 14, 18 | associação ausente; sugeridas: 08.01, 08.02, 08.03, 08.04, 08.05, 08.06, 08.07, 08.08 |
| `scope.lexical` | 09 | previsão-leitura | — | 0 | 0 | 3 | 11, 14, 18 | associação ausente; sugeridas: 09.01 |
| `closures.basic` | 09 | implementação | — | 0 | 0 | 3 | 11, 14, 18 | associação ausente; sugeridas: 09.02, 09.03, 09.04, 09.05, 09.06, 09.10, 09.08 |
| `this.binding` | 10 | pendente | — | 0 | 0 | 3 | 11, 14, 18 | associação ausente |
| `prototype.chain` | 10 | pendente | — | 0 | 0 | 3 | 11, 14, 18 | associação ausente |
| `classes.basic` | 10 | implementação | — | 0 | 0 | 3 | 11, 14, 18 | associação ausente; sugeridas: 10.02, 10.05, 10.10 |
| `dom.basic` | 11 | implementação | — | 0 | 0 | 3 | 14, 18 | associação ausente; sugeridas: 11.09, 11.01, 11.11, 11.14, 11.02, 11.03, 11.04, 11.06, 11.05, 11.07, 11.12, 11.08 |
| `events.propagation` | 11 | pendente | — | 0 | 0 | 3 | 14, 18 | associação ausente |
| `forms.basic` | 11 | pendente | — | 0 | 0 | 3 | 14, 18 | associação ausente |
| `storage.versioned` | 11 | implementação | — | 0 | 0 | 3 | 14, 18 | associação ausente; sugeridas: 11.13 |
| `modules.browser` | 11 | implementação | — | 0 | 0 | 3 | 14, 18 | associação ausente; sugeridas: 11.10 |
| `async.promise` | 12 | implementação | — | 0 | 0 | 3 | 14, 18 | associação ausente; sugeridas: 12.01, 12.04, 12.02, 12.03, 12.05, 12.21, 12.07, 12.17, 12.18, 12.09, 12.13, 12.14 |
| `http.basic` | 12 | previsão-leitura | — | 0 | 0 | 3 | 14, 18 | associação ausente; sugeridas: 12.10 |
| `fetch.basic` | 12 | implementação | — | 0 | 0 | 3 | 14, 18 | associação ausente; sugeridas: 12.11, 12.06, 12.08 |
| `date.time` | 12 | implementação | — | 0 | 0 | 3 | 14, 18 | associação ausente; sugeridas: 12.12 |
| `async.iterables` | 12 | implementação | — | 0 | 0 | 3 | 14, 18 | associação ausente; sugeridas: 12.01, 12.04, 12.02, 12.03, 12.05, 12.21, 12.07, 12.17, 12.18, 12.09, 12.13, 12.14 |
| `testing.behavior` | 13 | implementação | — | 0 | 0 | 3 | 14, 18 | associação ausente; sugeridas: 13.01, 13.03, 13.06, 13.07, 13.08, 13.09, 13.13, 13.14 |
| `debugging.tools` | 13 | implementação | — | 0 | 0 | 3 | 14, 18 | associação ausente; sugeridas: 13.04, 13.05, 13.12 |
| `errors.cause` | 13 | implementação | 13.10 MODIFY | 1 | 1 | 2 | 14, 18 | vinculado |
| `modules.project_structure` | 14 | previsão-leitura | — | 0 | 0 | 3 | 18 | associação ausente; sugeridas: 14.01, 14.04, 14.22, 14.19, 14.10 |
| `node.basics` | 14 | implementação | — | 0 | 0 | 3 | 18 | associação ausente; sugeridas: 14.02, 14.21, 14.05, 14.06, 14.20, 14.08 |
| `npm.safety` | 14 | implementação | — | 0 | 0 | 3 | 18 | associação ausente; sugeridas: 14.03, 14.11, 14.18 |
| `ts.basic` | 14 | pendente | — | 0 | 0 | 3 | 18 | associação ausente |
| `ts.unknown` | 15 | implementação | — | 0 | 0 | 3 | 18 | associação ausente; sugeridas: 15.01, 15.02, 15.03, 15.04, 15.06, 15.07, 15.08, 15.09, 15.10, 15.11 |
| `ts.readonly` | 15 | implementação | — | 0 | 0 | 3 | 18 | associação ausente; sugeridas: 15.01, 15.02, 15.03, 15.04, 15.06, 15.07, 15.08, 15.09, 15.10, 15.11 |
| `ts.unions` | 16 | implementação | — | 0 | 0 | 3 | 18 | associação ausente; sugeridas: 16.01, 16.02, 16.03, 16.09, 16.04, 16.05, 16.10, 16.06, 16.07, 16.08 |
| `ts.narrowing` | 16 | implementação | — | 0 | 0 | 3 | 18 | associação ausente; sugeridas: 16.01, 16.02, 16.03, 16.09, 16.04, 16.05, 16.10, 16.06, 16.07, 16.08 |
| `validation.manual` | 16 | pendente | — | 0 | 0 | 3 | 18 | associação ausente |
| `ts.generics` | 17 | implementação | — | 0 | 0 | 3 | 18 | associação ausente; sugeridas: 17.01, 17.02, 17.03, 17.04, 17.05, 17.06, 17.07, 17.11, 17.08, 17.09 |
| `ts.functions` | 17 | implementação | — | 0 | 0 | 3 | 18 | associação ausente; sugeridas: 17.01, 17.02, 17.03, 17.04, 17.05, 17.06, 17.07, 17.11, 17.08, 17.09 |
| `ts.keyof_indexed_access` | 18 | implementação | 18.03 FADED | 1 | 1 | 2 | — | vinculado |
| `ts.utility` | 18 | implementação | — | 0 | 0 | 3 | — | associação ausente; sugeridas: 18.01, 18.02, 18.03, 18.04, 18.05, 18.06, 18.07, 18.08, 18.09, 18.10 |
| `ts.satisfies` | 18 | implementação | — | 0 | 0 | 3 | — | associação ausente; sugeridas: 18.01, 18.02, 18.03, 18.04, 18.05, 18.06, 18.07, 18.08, 18.09, 18.10 |
| `ts.import_type` | 18 | implementação | — | 0 | 0 | 3 | — | associação ausente; sugeridas: 18.01, 18.02, 18.03, 18.04, 18.05, 18.06, 18.07, 18.08, 18.09, 18.10 |
| `ts.advanced` | 19 | implementação | — | 0 | 0 | 3 | — | associação ausente; sugeridas: 19.01, 19.02, 19.03, 19.04, 19.05, 19.06, 19.07, 19.08, 19.09 |
| `ts.branding` | 19 | implementação | — | 0 | 0 | 3 | — | associação ausente; sugeridas: 19.01, 19.02, 19.03, 19.04, 19.05, 19.06, 19.07, 19.08, 19.09 |
| `iterators.sync` | 20 | implementação | — | 0 | 0 | 3 | — | associação ausente; sugeridas: 20.01, 20.03, 20.08 |
| `iterators.async` | 20 | implementação | — | 0 | 0 | 3 | — | associação ausente; sugeridas: 20.01, 20.03, 20.08 |
| `streams.basic` | 20 | pendente | — | 0 | 0 | 3 | — | associação ausente; sugeridas: 20.09 |
| `performance.measure` | 21 | implementação | — | 0 | 0 | 3 | — | associação ausente; sugeridas: 21.01, 21.03, 21.04, 21.07, 21.09 |
| `workers.basic` | 21 | implementação | — | 0 | 0 | 3 | — | associação ausente; sugeridas: 21.05, 21.10 |
| `resources.cleanup` | 21 | implementação | 21.02 PARSONS | 1 | 1 | 2 | — | vinculado |
| `ts.packages` | 22 | implementação | — | 0 | 0 | 3 | — | associação ausente; sugeridas: 22.01, 22.02, 22.03, 22.04, 22.11, 22.05, 22.07, 22.08, 22.09, 22.10 |
| `validation.schema` | 22 | previsão-leitura | — | 0 | 0 | 3 | — | associação ausente; sugeridas: 22.06 |
| `architecture.boundaries` | 23 | implementação | — | 0 | 0 | 3 | — | associação ausente; sugeridas: 23.01, 23.02, 23.03, 23.04, 23.05, 23.06, 23.08, 23.07, 23.12 |
| `operations.observability` | 23 | implementação | — | 0 | 0 | 3 | — | associação ausente; sugeridas: 23.09 |
| `operators.predict` | 02 | previsão-leitura | 02.01 PREDICT (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `operators.arithmetic` | 02 | previsão-leitura | 02.01 PREDICT (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `operators.comparison` | 02 | previsão-leitura | 02.01 PREDICT (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `operators.logical` | 02 | previsão-leitura | 02.01 PREDICT (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `operators.falsy_nullish` | 02 | previsão-leitura | 02.02 PREDICT (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `operators.boolean_validation` | 02 | implementação | 02.03 PARSONS (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `coercion.number_validation` | 02 | implementação | 02.04 FADED (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `coercion.explicit` | 02 | implementação | 02.05 MODIFY (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `operators.nullish_fallback` | 02 | implementação | 02.06 DEBUG (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `operators.discount_expression` | 02 | implementação | 02.07 MAKE (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `operators.preferences` | 02 | implementação | 02.08 TRANSFER (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `operators.scoreboard` | 02 | implementação | 02.09 TRANSFER (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `math.rounding` | 02 | implementação | 02.10 MODIFY (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `math.random` | 02 | implementação | 02.10 MODIFY (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `number.ieee754` | 02 | previsão-leitura | 02.11 PREDICT (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `number.safe_integers` | 02 | previsão-leitura | 02.11 PREDICT (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |
| `number.tolerance` | 02 | implementação | 02.12 TRANSFER (sem ambiente declarado) | 0 | 1 | 2 | 07, 11, 14, 18 | vinculado |

## Isenções propostas

- `environment.boundaries`: Limites de ambiente (o que o navegador e o Node.js oferecem): a aprendizagem é verificada por leitura e previsão de contexto; implementação não acrescenta evidência nova.
- `html.tree_reading`: Leitura de árvore HTML: a evidência é identificar estrutura e nós em leitura; a implementação ocorre em 11.

Revisão editorial pendente: confirmar as associações ausentes, as sugestões e as isenções antes de contar qualquer variante como reaproveitada.

## Revisão editorial de vínculos (15/10/2026)

A fonte canônica dos vínculos passa a ser `course-src/concept-links.json` (versão 1), com uma decisão por conceito do grafo (105 itens, ordenados por id). A tabela acima é o retrato de planejamento anterior à revisão e não foi reescrita; quando divergirem, vale o JSON. O validador `scripts/validate-concept-links.mjs` confere cobertura do grafo, IDs de atividade, obrigatoriedade (`activities` só com atividades obrigatórias; `optionalActivities` só com opcionais), etapa mínima em relação à introdução do conceito, rationale e a presença de ao menos uma atividade obrigatória em conceitos `linked`. Os testes estão em `scripts/test-concept-links.mjs`.

Resumo do validador (`node scripts/validate-concept-links.mjs`):

```json
{"total":105,"linked":102,"exempt":0,"needsNewActivity":3,"newVariantsNeeded":116}
```

**Conceitos `needs-new-activity` (3).** Nenhuma atividade obrigatória os exercita de fato:

- `async.iterables` (implementação, etapa 12): a única atividade que toca o tema, 12.13, é opcional e só compara iteração incremental com materialização. Nova atividade: consumir uma fonte assíncrona com `for await` e encerrar a iteração cedo.
- `iterators.async` (implementação, etapa 20): 20.01, 20.02, 20.03 e 20.08 tratam apenas iteradores e geradores síncronos. Nova atividade: implementar e testar um async iterator.
- `streams.basic` (implementação, etapa 20): só 20.09 (opcional) investiga produtor e consumidor sob uma fila de stream. Nova atividade: criar e consumir um stream com controle de demanda.

**Conceitos `exempt` (0).** As duas isenções propostas não se sustentaram na revisão, porque as atividades já exercitam o conceito diretamente:

- `environment.boundaries`: 00.05 (READ, obrigatória) exige classificar cada recurso como padrão da linguagem ou oferecido pelo ambiente. Mantido como `linked`.
- `html.tree_reading`: 00.08 (READ, obrigatória) exige desenhar a árvore pai/filhos e ligar o label ao input pelo atributo `for`. Mantido como `linked`.

**Nova estimativa de variantes.** `newVariantsNeeded` = 116, pela regra do próprio mapa (soma de max(0, 3 − atividades obrigatórias) sobre conceitos de implementação ou previsão-leitura não isentos). Conferência: a mesma regra sem nenhuma sugestão reproduz as 267 variantes da tabela; aceitando todas as sugestões sem revisão daria 132. A estimativa de 73 da tabela original não é reproduzível pela regra descrita neste mapa, por isso não deve ser usada; a estimativa de horas acima também precisa ser recalculada a partir de 116.

**Mudanças de classificação e de vínculo.**

- `unicode.basic` passa de previsão-leitura para implementação, porque 05.15 (MAKE, Intl.Segmenter) é obrigatória.
- Os 11 conceitos pendentes receberam classificação de implementação, com vínculos procurados no catálogo inteiro (não só na etapa de introdução).
- Atividades incluídas além das sugestões do mapa, por evidência direta no enunciado: 12.16, 12.20, 13.15, 14.05, 14.09, 17.05, 17.11, 20.02, 20.04, 21.12, 11.09, e as incluídas nos conceitos pendentes (ver `rationale` de cada item no JSON).

**Dúvidas editoriais abertas.** Confirmar se 20.02 e 20.04 devem contar para `algorithms.recursion`; confirmar se 11.09 (ordem de execução de scripts) conta para `modules.browser`; e decidir se `needs-new-activity` deve ser tratado como bloqueio de publicação da fase ou apenas como nova variante a produzir.

## Investigações de código alheio (6.4)

Quatro atividades novas, opcionais, uma por faixa: 07.15 (faixa 07), 11.15 (faixa 11), 14.23 (faixa 14) e 18.11 (faixa 18). Ver o registro em [2026-10-15-fase6.md](2026-10-15-fase6.md#64--investigações).

- **Classificação:** obrigatória/opcional pela regra de `requiredActivities()` (`optional !== true`). As quatro são `optional: true`.
- **Justificativa da opcionalidade (decisão do orquestrador):** não multiplicar a carga obrigatória nem alterar o progresso de quem já concluiu as etapas. Entram na revisão por adesão; não entram na contagem do núcleo (272 obrigatórias antes e depois).
- **Vínculos:** cada uma aparece em `optionalActivities` de um conceito existente: `arrays.pipeline` (07.15), `forms.basic` (11.15), `modules.project_structure` (14.23) e `ts.keyof_indexed_access` (18.11). Nenhuma entra em `activities`.
- **Volume:** catálogo 302 → 306; opcionais 30 → 34; `learningRecords` 378 → 383.
- **Estimativa de carga:** 45 min (07.15), 45 min (11.15), 25 min (14.23) e 30 min (18.11), não calibrados (2.7).

