# Task 4 — desenho de contratos, primeira divergência e gates

Pré-flight somente leitura em 2026-10-13. A contagem usada abaixo é provisória: `output/fase2/assertion-inventory.json` contém 878 chamadas `expect` em 131 IDs distintos (30 assertivas sob loops, 36 closures na expressão de entrada, 3 com `.not`; o scan atual reporta zero erros de parse). A contagem veio de `Set(cases.map(case => case.id))` no inventário atualizado após Task2; atualizar novamente depois da Task3 antes de implementar.

## Decisão central: annotation aponta para caso publicado, não para atividade genérica

Use `/*@case <case-id>*/` imediatamente antes de cada nó de asserção, com `case-id` estável e específico, por exemplo `04.11.range-negative` ou `18.02.patch-shallow`. O prefixo do caso deve ser um ID de atividade existente. Não aceite só `04.11` como contrato universal para toda a suíte: ele identifica a atividade, mas não diz qual regra foi exercitada.

Cada anotação deve resolver a um registro concreto publicado pelo gerador. O registro pode ser extraído da AST e do trecho local do teste; não precisa inventar uma frase editorial. Proposta de formato aditivo em `course-src/assessments.json`:

```json
"assertionCases": [{
  "id": "04.11.range-error",
  "sourceTestPath": "tests/04.11.test.js",
  "inputExpression": "validarPercentual(valor)",
  "matcher": "toThrow",
  "expectedExpression": "RangeError",
  "negated": false,
  "loopDomainExpression": "[-1, 101, NaN, Infinity]",
  "contractRef": {"field": "edgeCases", "index": 0}
}]
```

`inputExpression`, matcher, expressão esperada, negation e expressão de domínio são dados estáticos extraídos do código real. A referência aponta à linha de `examples`/`edgeCases`; se ela não der suporte suficiente, publicar os campos concretos do assert e seu arranjo local, sem substituir isso por título de teste ou frase genérica. Valores especiais como `NaN`, `Infinity`, `undefined`, funções e DOM permanecem expressões/código JS, não JSON fingido.

Não é necessário publicar 878 registros isolados: asserts podem compartilhar case ID quando o mesmo caso/arranjo local os reúne. A validade é por nó AST e offsets, não por linha. IDs diferentes nunca podem ser ambíguos. Para `for (const valor of [...])`, o case inclui domínio literal e expected real; para `Object.entries(versoes)`, inclui as implementações enumeradas, não apenas o cabeçalho do loop. Não ampliar uma expressão AST para promessa mais abrangente que o contrato curricular.

Para JS, usar os comentários de Acorn 8.16 e os offsets exatos do `CallExpression`/nó reconhecido. O comentário é associado ao primeiro assert elegível seguinte, sem atravessar outro assert ou outro escopo de teste; asserts na mesma linha recebem anotações distintas. Rejeitar anotação duplicada/ambígua, ausente, malformada, ID inexistente, ID pertencente a outro item e comentário que não alcança um assert. Percorrer todos os nós, inclusive `for`, `for...of`, callbacks e closures.

A Task 4 obrigatória cobre suítes handwritten `*.test.js`. Suítes `.types.ts` como 22.07 estão fora do inventário JSON e não entram neste gate; a API TypeScript existente pode ser usada numa extensão posterior depois de fechar a cobertura JS. O caso 18.02 é comportamento executável protegido em uma atividade TypeScript e permanece no escopo JS. As suítes da Task 7 entram quando forem publicadas.

## Fonte canônica, publicação e fingerprints

A fonte de suítes e contratos é `course-src/`; `course-src/build-public-curriculum.mjs` gera o catálogo, `public/course-tests.json` e `public/course-assessments.json`. Para cada atividade, o gate compara o mapa validado de source tests, os arquivos publicados em `course-tests` e a forma consumida em `assessment.tests`/`testPaths`; toda transformação de path deve preservar os IDs de caso. O incidente atual em 18.02 demonstra que a suíte `tests/18.02.test.js` (`import '../patch.js'`) é copiada como `assessment.tests` inline com `import './patch.js'`. A Task 4 precisa anotar/reconhecer as duas representações sem perder associação, e deixar o import publicado normalizado para a raiz. Para suítes de estudante, verificar separadamente o arquivo learner-authored e o comportamento protegido inline: não confundir `studentSuite` com `protectedBehavior`.

O fingerprint mantém schema `/2` e allowlist dos campos executados. Alterar somente metadata editorial de associação não pode invalidar evidência. Remover do hash exclusivamente o token de comentário exato `/*@case ...*/` dentro do conteúdo das suítes que o executor realmente usa (`tests`, `assessment.tests` e arquivos da suíte reconhecidos por `testPath`/`testPaths`); não normalizar/remover todos os comentários, e não aplicar regex global ao assessment ou aos arquivos da submissão. A filtragem tem de ser token-aware ou validada pelo parser para reconhecer apenas comentários completos da forma permitida. Preservar exatamente os demais bytes/comentários do fingerprint.

Gate de fingerprint: calcular hash da suíte atual, inserir/adicionar/remover uma anotação válida e provar hash idêntico; depois mudar um matcher/esperado/código da suíte e provar hash diferente. Incluir a representação inline normalizada para o caso 18.02. Contratos publicados consumidos pelo avaliador devem entrar na allowlist/fingerprint quando mudarem o critério de execução; metadata de anotação sozinha não.

## Primeira divergência e transporte do resultado

Acrescentar ao resultado do runtime um DTO opcional, limitado e serializável, criado no próprio matcher que falhou — a fonte da verdade é a comparação executada, não uma reconstrução posterior a partir do texto:

```ts
type FirstFailure = {
  caseId: string;
  testName?: string;
  matcher: string;
  negated: boolean;
  inputExpression?: string;       // expressão estática do caso validado
  inputRuntime?: SafeValue;       // só quando um helper/contexto explícito capturou a entrada real
  expected: SafeValue;             // operando normalizado pelo matcher
  observed: SafeValue;             // valor/erro observado pelo matcher
  contractRule: string;
};
```

`SafeValue` deve ser preview determinístico e limitado (strings truncadas, profundidade/itens limitados, marcações para `undefined`, `NaN`, `Infinity`, DOM e erro). O runtime deve capturar `expected` e `observed` no ponto de `check()`/matcher, incluindo `.not`, `.rejects`, `toThrow` e erros de comparação. Sem serialização de objetos arbitrários ou de dados de usuário além do tamanho fixo.

`inputExpression` vem da AST/inventário: é texto estático, não prova que a variável tinha certo valor. `inputRuntime` fica ausente salvo captura explícita no momento da execução (helper contextual ou fixture/caso executável que passa o input ao matcher); não deduzir entrada a partir do `observed`, do nome do teste ou do `expected`. Para loops, o helper passa o valor corrente; para `toThrow`/closures, a captura envolve a chamada real. Se só houver expressão estática, UI apresenta “Expressão de entrada: …” e explica que não capturou o valor executado; não chama isso de entrada observada.

Integração mínima:

1. `public/course-test-runtime.js`: matcher associa a asserção corrente ao case ID/contrato, captura apenas a primeira falha e devolve `{passed, failed, total, firstFailure?}`. Se `firstFailure` não for seguro/serializável, manter texto de erro existente e omitir DTO.
2. `public/course-runner.js`: encaminha o DTO junto com `tests` do Worker/iframe usando a mesma validação de origem/token/terminação já existente; não transforma `error`, `timeout`, `cancelled` ou falha de infraestrutura em divergência.
3. `public/course-assessment.js`: conserva DTO somente para `kind: failed` de testes executados; resultados de typecheck, unsupported, erro de compilação e falha do executor não recebem `firstFailure`. Para suítes protegidas e learner-authored, preservar o case ID da suíte executada e indicar sua origem.
4. `public/course-controller.js`: quando `firstFailure` existir, renderiza e persiste texto derivado seguro: caso/regra, expressão estática ou entrada runtime explicitamente capturada, esperado, observado e próxima investigação vinculada ao contrato. Continuar com a contagem e mensagens existentes quando não houver DTO. Nunca mostrar uma entrada que o runtime não observou.

A próxima investigação deve ser orientação específica e publicada (por exemplo, verificar limite inclusivo, preservar referência, ou distinguir tipo/faixa), associada ao caso. Não gerar dica a partir de erro bruto nem repetir segredo/conteúdo arbitrário.

## Amostra auditável (8 candidatos concretos)

Os oito trechos de assert abaixo foram conferidos nas suítes-fonte. A coluna distingue o suporte já publicado das lacunas que ainda impedem tratar alguns como contrato aprovado; a amostra não substitui validação dos demais asserts.

| Caso | Assert/cenário a mostrar | Evidência pública e cuidado de captura |
|---|---|---|
| `04.11.range-error` | O loop espera `RangeError` para `[-1, 101, NaN, Infinity]`; outro assert usa string `25` e espera `TypeError`. | Fonte, solução e edgeCases concordam. Publicar domínio numérico literal; o assert de string tem case separado. |
| `05.06.numeric-sort` | `ordenar([10, 9, 100]).toEqual([100, 10, 9])` é executado para “cópia explícita” e “métodos modernos” | A regra de ordenação numérica está publicada. O case precisa identificar as duas variantes e seu domínio concreto; a variável `ordenar` não deve ser apresentada como valor runtime capturado. |
| `09.08.cancel-twice` | Assert real do source: após `cancelar()` inicial, `expect(() => cancelar()).not.toThrow()` | Confirmado em `course-src/tests/09.08.test.js`; o edgeCase publicado não explicita idempotência, então abrir regra específica. A closure executada é a segunda chamada. |
| `12.03.propagate-rejection` | `await expect(carregar(api)).rejects.toBe(failure)` | Caso público “propaga rejeição”; esperado é a identidade da rejeição original. Matcher `.rejects` deve capturar o erro observado, sem substituir rejection por erro do runner. |
| `13.09.retry-final-rejection` | `await expect(retry(...)).rejects.toBe(failure)` | Contrato público da política de retries deve determinar tentativas/atrasos e rejeição final. Não reportar como divergência timeout do Worker ou falha de infraestrutura. |
| `18.02.patch-copy` | `expect(atual).not.toBe(original)` | Contrato publicado exige cópia rasa e preservação da base. É comportamento protegido publicado via `assessment.tests` inline; preservar normalização `../patch.js` → `./patch.js` e anotação equivalente da fonte. |
| `11.08.kanban-safe-render` | Assert da suíte protegida sobre texto literal `<img src=x>` após renderização e estado/storage | Contrato publica texto literal, acessibilidade e persistência. Capturar DOM/estado por preview limitado; identificar que é teste de comportamento protegido. |
| `20.05.invalid-setter` | Closure dentro de `for (const value of [-1, 151, 1.5, NaN, "20"])` que atribui `user.age=value` e espera `RangeError`; depois verifica idade ainda em 150 | Assert real conferido. O example publica age=20 e age=-1, mas os demais valores, limites inclusivos e garantia de não mutação ainda precisam de regra antes de aprovar o case. |

A amostra candidata em `output/fase2/task4-sample-review.md` deve registrar para cada linha: trecho da anotação, offset/assert, ID do caso, regra publicada, esperado/matcher, se a entrada é expressão estática ou captura runtime, e origem da suíte (learner-authored/protegida/TypeScript). É preparação para revisão técnica; a revisão humana só é concluída após leitura humana explícita do artefato.

## Arquivos e gates previstos

- `course-src/tests/*.test.js`: anotações específicas nos nós de assert; preservar arranjo/imports salvo ajuste mínimo para captura contextual explícita.
- `course-src/assessments.json` (ou módulo canônico pequeno se o manifesto ficar excessivamente extenso): contratos por case ID, sem metadata genérica; manter ordem/IDs/behavior existentes.
- `course-src/build-public-curriculum.mjs`: validar/publicar contratos e preservar anotação no arquivo e suíte inline normalizada. Não alterar arquivos gerados manualmente.
- `public/course-assessment.js`: allowlist/fingerprint para exclusão do token exato e contrato de assert; validação de DTO na saída.
- `public/course-test-runtime.js`, `public/course-runner.js`, `public/course-controller.js`: captura e apresentação da primeira divergência, sem classificar infraestrutura como erro semântico.
- `scripts/test-phase2-contracts.mjs`: parser AST JS/TS, cobertura exaustiva das suítes executáveis, comments ausentes/inválidos/órfãos/ambíguos, asserts múltiplos por linha, loops, `.not`, `.rejects`, closure, fonte/publicação, contrato conhecido e fingerprint (metadata idêntica, mutação de matcher divergente).
- `scripts/test-phase2-feedback.mjs`: matcher captura primeira falha para matchers positivos/negados/throw/reject; DTO atravessa runner→assessment→controller; erros/timeout/typecheck/infra não recebem DTO; UI mostra campos corretos e não inventa input.
- `output/fase2/task4-sample-review.md` e `output/fase2/task4-report.md`: amostra auditável e resultados/limitações.

Gates: `node scripts/test-phase2-contracts.mjs`, `node scripts/test-phase2-feedback.mjs`, suites focais de assessment/test-runtime/runner/controller e depois o gate integrado da Task 8. As suítes da Task 7 serão anotadas e entram nos gates antes da integração final. Não rodar build, gerador, browser ou instalar dependência no preflight.

## Riscos que exigem decisão explícita durante a implementação

- AST recupera expressão, título e operador, mas não prova que o texto do teste é contrato publicado. Onde exemplo/edge case não basta, criar regra específica antes de anotar; IDs sem caso válido bloqueiam o gate.
- A fonte e `assessment.tests` podem divergir por cópia, import normalizado ou formatação. A associação é por case ID e assert semântico, e cada forma publicada precisa validar parser e imports.
- Um campo `firstFailure` não pode ser gerado para comparação apenas textual, typecheck, Worker interrompido ou erro de setup. Preservar o `kind` atual e o resultado textual nos caminhos sem DTO.
- `.rejects` recebe erro assíncrono como observado, mas não conhece argumentos originais de funções internas. Exigir contexto de caso explícito quando a entrada não está no matcher.
- Ignorar todos os comentários quebraria a evidência histórica: só o marcador exato de case pode sair do hash e só nas suítes reconhecidas.
- Contratos para os 878 asserts exigem revisão semântica. Inventário automático é ferramenta de mapeamento, não gerador de aprovação; não usar rótulo/título genérico para preencher lacunas.

É preciso implementar a associação entre annotation e matcher: comentário não existe no objeto `expect` e offsets da fonte não são stack locations confiáveis após a publicação. O gate pode gerar tabela estática ID/offset ou instrumentar o nó AST do matcher uma vez imediatamente antes do runner; a instrumentação executa o callback uma vez e não reavalia argumento/closure. Para `.rejects`, guardar o case ID no matcher/promise até a conclusão. Usar Acorn já instalado, preservar source/imports, anotar source e assessment inline com associação equivalente. Erro de configuração se faltar ID; sem fallback por ordem de execução.








