# Tarefa 2 — sintaxe no currículo

Incluídas as atividades `03.10` (ternário versus `if`) e `06.11` (optional chaining e nullish coalescing), cada uma na etapa correspondente, com recipe canônica, IDs, metadados de aprendizagem, preparação/pré-requisitos, starters, testes de avaliação, referências e assets públicos gerados.

`03.10` apresenta e compara ternário para duas alternativas com `if / else if / else` para três estados, incluindo critério de legibilidade. Como a etapa 03 ainda não ensina a criar módulos ou objetos, a preparação fornece o wrapper `export function` e a estrutura de objeto de retorno usados pela atividade. O registry resolve adapter por ID antes de usar o adapter da etapa; assim, 03.10 usa o renderer genérico, enquanto `03.01`–`03.09` continuam no renderer e contratos dedicados. O builder e o validador público autorizam os campos genéricos da etapa 03 somente para IDs ausentes de `stage03Contracts`.

`06.11` ensina `?.` e `??`, preserva `0`, `false` e `""`, e declara defaults concretos (`Visitante`, `100`, `true`, `Sem mensagem`). A avaliação cobre o limite de `?.`: perfil presente com tipo inválido/array retorna `null` por uma validação explícita separada. Pré-requisitos ligam a unidade a `06.10`, e a atividade passa a anteceder `10.01`; `03.10` passa a anteceder `07.06` e `19.01`.

## Verificação

- `npm run check:curriculum` — passou: 259 atividades, 0 avisos e 0 erros; os assets compilados estão atuais.
- `node --test scripts/test-phase1-syntax.mjs scripts/test-phase1-errors.mjs` — 6 testes passaram; inclui dispatch real da UI genérica, starters reprovados e referências aprovadas pelo avaliador publicado.
- `node --test scripts/test-stage03-content.mjs scripts/test-stage03-ui.mjs` — 11 testes passaram; os nove contratos e fluxos dedicados existentes continuam cobertos.
- `node --test scripts/test-course-catalog-validator.mjs` e `node scripts/validate-course-catalog.mjs` — passaram; o fallback genérico não amplia os campos públicos permitidos para IDs dedicados da etapa 03.
- `git diff --check` — sem erros de whitespace; Git emitiu avisos de conversão CRLF/LF para arquivos já modificados na árvore compartilhada.

A geração também imprime `Failed to find real location of ...Python313\\python.exe` ao chamar os validadores Python, mas termina com exit code 0 e validação completa. Nenhum deploy ou publicação foi executado.

Revisão independente: corrigido helper de frases para preservar código inline; regressão confirmou falhaantes e sucessoapós. Conteúdo explicita que testes avaliamresultados e técnica/legibilidade são autoavaliaçãodeclarada. GateChromium output/playwright/fase1/task2-browser.log confirma5/5 rotasnovas comstarterfail/referencepass, conclusãoe estadoverified/draft restaurados. Não foi introduzidocheckerAST de estilo.
