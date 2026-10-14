# Relatório da Fase 1 — Tarefa 1

## Resultado

Tarefa concluída no checkout existente, preservando as demais alterações pendentes. O currículo compilado cresceu de 254 para **257 atividades**; a etapa 04 passou de 10 para **13 atividades** e o total permanece abaixo do limite de 300. Nenhum ID anterior foi renumerado.

## Identidades e dependências

- `course-src/build-public-curriculum.mjs` agora exige unicidade dos IDs compilados e igualdade integral de IDs e ordem entre fonte compilada e catálogo público. A mensagem de build deriva a contagem do catálogo que acabou de ser gerado.
- `scripts/validate-course-catalog.mjs`, `scripts/test-app-maintenance.mjs` e `scripts/test-project-layout.mjs` comparam o catálogo aos IDs de `course-src/.generated/resolved_preview.json`, em vez de fixar 254 ou agregados 217/32.
- `scripts/task-9-canonical-regeneration.mjs` deriva os IDs das etapas 20–23 do currículo compilado e compara a identidade completa com as avaliações dessas etapas; deixou de exigir exatamente 42 por contagem literal.
- `course-src/build_coverage.py` e `course-src/render_pdf.py` derivam contagens editoriais do currículo e das observações de auditoria de origem. `scripts/measure-engineering.mjs` agora mede amostras relativas e o catálogo completo.
- Em `course-src/learning-metadata.json`, 04.08–04.10 passam a exigir 04.07; a progressão nova é 04.11 → 04.12 → 04.13. 05.07 exige 04.11; 12.02 e 12.05 exigem 04.12; 08.02 também exige 06.01. As dependências de atividade ficam no grafo de aprendizagem; `recipes[].requires` continua reservado a conceitos do grafo formal.

## Unidade «Falhas previsíveis»

- **04.11 — Validar percentual:** guard clauses para tipo, finitude e limites inclusivos; `TypeError` distingue tipo incompatível de `RangeError` para valor fora de 0–100. A referência devolve os limites e rejeita entradas inválidas.
- **04.12 — Falha com contexto e limpeza:** `JSON.parse`, `SyntaxError`, `try/catch/finally`, `catch (erro)`, `new Error` com mensagem contextualizada e preservação por identidade de erros de leitura não reconhecidos. O primer explica callbacks, `instanceof`, a ordem de execução de `finally` e que `return`/`throw` ali substituiria o resultado ou a falha anterior. A atividade declara que a função de limpeza não lança.
- **04.13 — Retorno esperado ou erro:** guard clauses para argumento inválido; taxas conhecidas retornam número, opção desconhecida bem formada retorna `null`, e chamada inválida lança `TypeError`.
- Fontes canônicas acrescentadas/alteradas: `course-src/exercise_index.json`, `course-src/recipes/04.py`, `course-src/learning-metadata.json`, `course-src/starters/manifest.json` e `course-src/starters/04.11`–`04.13/main.js`, `course-src/assessments.json`, `course-src/tests/04.11`–`04.13.test.js`, `course-src/solutions/04.11`–`04.13/main.js`, `course-src/official-docs.json`, `course-src/prerequisite-primers.json`, `course-src/guided-preparation.mjs` e `course-src/stages/04.txt`.
- O teste de tarefa está em `scripts/test-phase1-errors.mjs`; pode ser integrado depois a `test:phase1` pelo agregador da Fase 1.

## Verificações

- `npm run check:curriculum` — **passou**: 257 atividades compiladas; grafo acíclico com 479 arestas; catálogo, IDs públicos e fontes validados; 0 avisos e 0 erros.
- `node --test scripts/test-phase1-errors.mjs scripts/test-course-catalog-validator.mjs scripts/test-project-layout.mjs scripts/test-app-maintenance.mjs` — **16 testes passaram, 0 falharam**.
- Avaliador publicado do site, executado pelo harness real do runner: 04.11 referência **2/2** e starter **0/2**; 04.12 referência **3/3** e starter **0/3**; 04.13 referência **2/2** e starter **0/2**. Os três starters retornaram falha sem erro de compilação; as três referências passaram.
- `py_compile` validou `course-src/build_coverage.py` e `course-src/render_pdf.py`; `node --check` validou os scripts de gate e regeneração alterados.

## Limites conhecidos

- O script completo de regeneração da Tarefa 9 foi atualizado e teve sintaxe verificada, mas não foi executado nesta tarefa, pois ele regenera em lote os artefatos da Tarefa 9. A identidade 20–23 já foi exercitada pela comparação equivalente no gate de fonte e a suíte específica de Tarefa 1 passou.
- A suíte global e a homologação de navegador ficam para a Tarefa 5; estes resultados provam o build curricular e o caminho de avaliação no harness do site, não uma homologação ampla do navegador.
- O Python padrão do PATH emitiu avisos de inicialização sem executar o build. O build autorizado passou com o Python bundled via `DEVPATH_PYTHON`; nenhum dado persistente foi tocado.
