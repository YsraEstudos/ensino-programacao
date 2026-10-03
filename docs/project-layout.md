# Organização do DevPath

O workspace contém um único projeto ativo em `devpath-publish/`. Entre nessa pasta para desenvolver, executar testes e compilar. A antiga prévia estática e o worktree do catálogo completo foram consolidados neste projeto.

## Fontes canônicas

- `course-src/recipes/` e `course-src/stages/`: contratos Python e roteiros de cada etapa.
- `course-src/stage00-preparation.mjs`: ensino e práticas da Etapa 00.
- `course-src/stage01-preparation.mjs`: ensino e práticas da Etapa 01, incluindo os apoios para iniciantes.
- `course-src/stage03-preparation.mjs` e `stage03-contract.mjs`: ensino, casos e práticas da Etapa 03.
- `course-src/diagnostic-preparation.mjs`: perguntas e práticas do diagnóstico.
- `course-src/bridges.md`: pontes conceituais.
- `course-src/publication-overrides.json`: revisões editoriais de campos específicos das atividades de diagnóstico e avançadas que antes existiam somente no catálogo completo. Tem precedência sobre os respectivos campos das receitas; não é outro catálogo. Edite cada campo em seu local canônico e retire o override se migrar a revisão para a receita.
- `public/app.js`, os renderizadores, interpretadores e CSS: implementação da interface, mantida uma única vez neste projeto.

## Saídas geradas

`course-src/resolved_preview.json` é o resultado intermediário do compilador Python. `public/course-catalog.json`, os bundles de preparação de 01/03/diagnóstico e `lib/course-exercise-ids.ts` são saídas geradas. Sua presença é necessária para o navegador e a API, mas eles não são outras versões editáveis do projeto.

`npm run build:curriculum` gera os cinco artefatos exclusivamente das fontes locais. `npm run check:curriculum` compara suas saídas, valida o catálogo completo e verifica os contratos. Nenhum gerador lê um catálogo anterior para preservar silenciosamente alterações manuais.

Após alterar receitas, execute `uv run python course-src/compile_content.py`, atualize o grafo com `uv run python course-src/build_graph.py` e depois `npm run build:curriculum`. Após editar a preparação de 00, atualize também o intermediário com `node course-src/build-stage00-preparation.mjs` antes do compilador Python.

## Verificação

`npm test` executa a verificação da estrutura única, diagnóstico e etapas 00–03. Todos os testes usam o próprio projeto. `npm run build` gera e valida o currículo antes de compilar o site. Documentos e imagens finais ficam em `output/`; auditorias em `docs/` registram contexto histórico e não são checkouts adicionais.

## Consolidação de 03/10/2026

A base da interface veio do catálogo completo (254 atividades, diagnóstico, etapas 21–23 e melhorias de 01). As receitas, roteiros e registros mais recentes das etapas 02/03 vieram da fonte editorial da raiz. O checkout principal e a configuração do site autenticado foram preservados. Os IDs, versões de conteúdo e contratos de progresso existentes continuam sendo utilizados.
