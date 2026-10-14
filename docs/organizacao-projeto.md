# Organização do DevPath

O workspace contém um único projeto ativo em `devpath-publish/`. Entre nessa pasta para desenvolver, executar testes e compilar. A antiga prévia estática e o worktree do catálogo completo foram consolidados neste projeto.

## Fontes canônicas

- `course-src/recipes/` e `course-src/stages/`: contratos Python e roteiros de cada etapa.
- `course-src/stage00-preparation.mjs`: ensino e práticas da Etapa 00.
- `course-src/stage01-preparation.mjs`: ensino e práticas da Etapa 01, incluindo os apoios para iniciantes.
- `course-src/stage03-preparation.mjs` e `stage03-contract.mjs`: ensino, casos e práticas da Etapa 03.
- `course-src/diagnostic-preparation.mjs`: perguntas e práticas do diagnóstico.
- `course-src/bridges.md`: pontes conceituais.
- `course-src/runtime-baseline.json`: ambiente-alvo do curso (ECMAScript, Node.js, TypeScript, navegadores) e perfis de runtime publicados nos cartões. Runtime desconhecido interrompe o build.
- `course-src/prerequisite-primers.json`: explicações curtas, publicadas no campo `primers`, para recursos que uma atividade usa antes da etapa que os ensina. ID inexistente ou entrada vazia interrompe o build; retire a entrada quando o conteúdo for movido para a etapa certa.
- `course-src/starters/<id>/` e `course-src/starters/manifest.json`: arquivos iniciais reais das etapas 15–23, um diretório por atividade. O manifesto define a ordem dos arquivos (o primeiro `.js` é a entrada do executor) e a `content_version`; ao mudar um arquivo de forma que invalide rascunhos, suba a versão. Pasta e manifesto divergentes, ou um `starterFiles` em `publication-overrides.json` para a mesma atividade, interrompem o build. Os arquivos são incompletos ou com bugs de propósito e ficam fora do lint e do `tsconfig.json` da raiz.
- `course-src/tests/<id>.test.js` e `course-src/solutions/<id>/main.js`: testes automáticos de uma atividade (importam `./main.js` do aluno e usam `describe`/`test`/`expect`) e sua solução de referência. O build publica os testes em `public/course-tests.json` e marca a atividade com `autoTested`; a atividade só conclui quando todos passam. `scripts/test-course-tests.mjs` exige que o starter falhe e a solução passe. O primeiro arquivo do starter precisa ser `main.js` e exportar o que os testes importam.
- `course-src/official-docs.json`: links de documentação oficial por atividade (título, URL, seção, pergunta), publicados como recursos e exibidos em "Consulta opcional".
- `course-src/exercise_index.json` e `course-src/audit_requirements.json`: contratos e requisitos editoriais usados pelos compiladores e auditorias.
- `course-src/publication-overrides.json`: revisões editoriais de campos específicos das atividades de diagnóstico e avançadas que antes existiam somente no catálogo completo. Tem precedência sobre os respectivos campos das receitas; não é outro catálogo. Edite cada campo em seu local canônico e retire o override se migrar a revisão para a receita.
- `public/app.js`, os renderizadores, interpretadores e CSS: implementação da interface, mantida uma única vez neste projeto.

## Saídas geradas

`course-src/.generated/` guarda resultados locais e reproduzíveis do compilador: `resolved_preview.json`, `concept_graph.json` e `audit_coverage.json`. Eles não são fontes editoriais nem são versionados. `public/course-catalog.json`, os bundles de preparação de 01/03/diagnóstico e `lib/course-exercise-ids.ts` são saídas geradas e versionadas porque o navegador e a API as consomem diretamente.

`npm run build:curriculum` compila receitas e etapas, recria `resolved_preview.json`, `concept_graph.json` e `audit_coverage.json` em `course-src/.generated/` e regenera os artefatos públicos. `npm run check:curriculum` compara essas saídas, valida o catálogo completo e verifica os contratos. Nenhum gerador lê um catálogo anterior para preservar silenciosamente alterações manuais.

Após alterar receitas ou etapas, execute `npm run build:curriculum`; ele atualiza todos os intermediários em `course-src/.generated/` e as saídas públicas, incluindo os dados derivados de `stage00-preparation.mjs`. Para gerar o PDF editorial, gere os dados primeiro e execute `python course-src/render_pdf.py`.

## Verificação

`npm test` executa a verificação da estrutura única, diagnóstico e etapas 00–03. Todos os testes usam o próprio projeto. `npm run build` gera e valida o currículo antes de compilar o site. Documentos e imagens finais ficam em `output/`; auditorias em `docs/` registram contexto histórico e não são checkouts adicionais.

## Consolidação de 03/10/2026

A base da interface veio do catálogo completo (254 atividades, diagnóstico, etapas 21–23 e melhorias de 01). As receitas, roteiros e registros mais recentes das etapas 02/03 vieram da fonte editorial da raiz. O checkout principal e a configuração do site autenticado foram preservados. Os IDs, versões de conteúdo e contratos de progresso existentes continuam sendo utilizados.
