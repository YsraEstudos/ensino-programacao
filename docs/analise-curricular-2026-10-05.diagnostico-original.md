# Análise curricular do DevPath — de iniciante a sênior em JavaScript e TypeScript

Data: 05/10/2026 (atualizada em 09/10/2026 e fechada em 11/10/2026, ver a seção final, com a cobertura por etapa, o quadro de competências profissionais, os critérios de ordem das versões e as referências). Escopo: diagnóstico e etapas 00–23 (254 atividades publicadas em `public/course-catalog.json`), roteiros em `course-src/stages/`, pontes em `course-src/bridges.md`, especificação em `course-src/site_spec.md` e o executor genérico em `public/course-runner.js` / `public/course-controller.js`.

Método: li os 24 roteiros, extraí de cada atividade objetivo, enunciado, restrições, arquivos iniciais, checks e rubrica, e cruzei, por busca no catálogo, **onde cada conceito é ensinado** e **onde ele é cobrado pela primeira vez**. As afirmações abaixo citam o ID da atividade para conferência.

**Limites da análise.** Trabalhei sobre o checkout local. Não validei a versão publicada nem fiz uma sessão completa de aluno no navegador. As três verificações existentes (consistência dos artefatos, catálogo de 254 atividades e validação da fonte com zero avisos e erros) passam, mas comprovam **consistência estrutural pelas regras atuais**, não domínio pedagógico nem execução dos projetos.

---

## 0. Resumo executivo

O desenho pedagógico é bom: prever → executar → comparar, formatos PRIMM (PREDICT, TRACE, PARSONS, FADED, MAKE, DEBUG, TRANSFER), concepções erradas explícitas, fronteiras de confiança, acessibilidade, APIs modernas com checagem de runtime e mudanças de requisito. As etapas 00–03 têm runners próprios, preparação dedicada e checks reais.

O problema é que **a partir da etapa 04 o curso deixa de cumprir o que promete**, e os buracos ficam maiores conforme o nível sobe:

| # | Problema | Impacto |
|---|----------|---------|
| 1 | Etapas 04–23 não têm correção automática: a conclusão é autoavaliação (marcar todos os critérios + reflexão de 16 caracteres). | Dá para "concluir" o curso inteiro sem escrever código correto. Os gates que citam "testes ocultos" não existem. (antes) |
| 2 | O executor genérico roda só JS isolado, **sem DOM, Node, TypeScript ou Vitest**. | As etapas 11 (DOM), 13 (testes), 14 (Node), 15–19 e 22 (TS) viram "análise escrita". O aluno nunca vê um erro real do `tsc`. (antes) |
| 3 | Nas etapas 15–23, os "arquivos iniciais" são descrições de uma linha (`material.md: seis trechos TS: ...`, `código legado de 80 linhas...`, `mini-repo com 10 arquivos...`), sem o código. 21–23 também não têm nenhum recurso. (antes) | Atividades impossíveis de executar como estão escritas. |
| 4 | Volume de prática: cerca de **110 h** de atividades contra **370–500 h** declaradas nos roteiros. | Não há repetição suficiente para dominar. Regex, `reduce`, `switch` e generators têm uma atividade ou nenhuma. |
| 5 | Muitos **pré-requisitos ocultos**: conceitos cobrados etapas antes de serem ensinados (seção 2). | Frustração e "copiar sem entender" justamente no ponto que o curso quer evitar. |
| 6 | Erros de conteúdo: enunciado e arquivo não batem em 11.10, 13.14, 14.07 e 14.13; 23.07 (mudança no capstone) vem antes de 23.08 (capstone) (seção 4). | O aluno não consegue cumprir o que o enunciado pede. |
| 6b | O gerador do catálogo descarta `edge_contract`: regras de borda definidas na fonte (lista vazia, erros, `take(0)`) não chegam ao aluno (seção 3.9). | Uma correção futura cobraria regras invisíveis. |
| 6c | O editor limita o texto a `1100 / nº de arquivos` caracteres; o starter de 11.08 já tem 1.138 (seção 3.10). | O projeto Kanban não cabe no editor. |
| 7 | O ambiente real (instalar Node, terminal, editor, Git, `npm init`, `tsc`) nunca é ensinado como prática. Git aparece uma única vez (14.09). (antes) | Nenhuma ponte entre o site e o trabalho real. |
| 8 | Faltam pilares do trabalho sênior: back-end Node/HTTP, persistência real, segurança web, ferramentas (lint, CI, bundler), um framework de UI, testes de integração/E2E, desenvolvimento com IA (seção 5). | O egresso sabe a linguagem, mas não entrega um sistema. |
| 9 | Pontes conceituais reaproveitadas: 15–19 compartilham a mesma ponte; 20, 21, 22 e 23 compartilham a ponte de iteradores/streams. | A etapa 23 (arquitetura) abre com um texto sobre `ReadableStream`. |
| 10 | O diagnóstico tem 5 itens e cobre só 00–04. | Quem já programa não tem como pular para o próprio nível. |
| 11 | Não há um ambiente-alvo único: os cartões dizem "ES2023", "TypeScript 5.0+" ou só "Node.js"; o projeto usa TS 5.9.3; o roteiro fala em TS 7; o Node 24 entra em manutenção em 20/10/2026 (seção 8). | O curso ensina versões desatualizadas e misturadas, e recursos de ES2024–2026 ficam de fora ou opcionais. |

---

**Veredito (antes do fechamento de 11/10/2026).** O DevPath tem uma boa estrutura de conteúdos, mas, no estado atual, **ainda não comprova uma formação de iniciante a sênior**. As maiores distâncias estão entre o conteúdo declarado e a prática disponível, em alguns pré-requisitos antecipados e na avaliação de domínio.

**Critério final de aprovação.** O aluno deve conseguir receber um problema novo, esclarecer o contrato, investigar uma base existente, implementar, testar, entregar, observar uma falha e absorver uma mudança sem regressão, explicando suas decisões. O currículo já aponta nessa direção; as alterações deste documento devem fazer essa capacidade ser praticada e demonstrada.

---

## 1. Mapa do que cada etapa ensina e de quanto ela pratica

Horas = soma das durações das atividades; carga = valor declarado no roteiro.

| Etapa | Tema | Ativ. | Horas reais | Carga declarada | Avaliação real (antes) |
|---|---|---|---|---|---|
| D | Diagnóstico (saída, tipos, if, função, investigação) | 5 | 0,3 | — | sem nota; não cobre 05+ |
| 00 | Ambiente, execução, leitura, HTML mínimo | 9 | 1,1 | 3–5 h | runner próprio, executor **simulado** |
| 01 | const/let, primitivos, typeof, template literal | 9 | 1,7 | 2–3 h | runner próprio + dicas |
| 02 | Operadores, coerção, `??`, Number/Math, tolerância | 12 | 3,2 | 3–4 h | runner próprio |
| 03 | if/else, for, while, break/continue, rastreamento | 9 | 3,0 | 9–12 h | interpretador com limite de passos |
| 04 | Funções, retorno vs efeito, decomposição, Intl | 10 | 3,9 | 10–14 h | autoavaliação |
| 05 | Strings, arrays, mutação, regex, Unicode | 11 | 3,8 | 12–16 h | autoavaliação |
| 06 | Objetos, referência, spread, JSON, structuredClone | 10 | 4,0 | 12–16 h | autoavaliação |
| 07 | Callbacks, map/filter/reduce, Map/Set, groupBy | 10 | 4,2 | 14–18 h | autoavaliação |
| 08 | Complexidade, recursão, busca binária, BFS (paralela) | 8 | 3,6 | 16–22 h | autoavaliação |
| 09 | Escopo, closures, factory, memoize, store | 8 | 3,4 | 14–18 h | autoavaliação |
| 10 | this, protótipos, classes, composição | 8 | 3,0 | 16–22 h | autoavaliação |
| 11 | DOM, eventos, forms, a11y, localStorage, Kanban | 14 | 5,2 | 18–24 h | **só escrita** (sem DOM) |
| 12 | HTTP, event loop, Promises, fetch, Abort, tempo | 14 | 4,6 | 20–28 h | parcial (sem rede) |
| 13 | Erros, debugger, Vitest, dublês, TDD | 14 | 8,0 | 18–24 h | **só escrita** (sem Vitest) |
| 14 | ESM/CJS, Node, npm, config, Git, bundler | 13 | 4,6 | 18–26 h | **só escrita** (sem Node) |
| 15 | TS: erasure, strict, unknown, estrutural | 10 | 4,3 | 12–16 h | **só escrita** (sem tsc) |
| 16 | Unions, narrowing, discriminadas, assertNever | 10 | 4,3 | 14–18 h | só escrita |
| 17 | Generics, callbacks tipados, overloads, enum | 9 | 7,2 | 16–22 h | só escrita |
| 18 | keyof, T[K], utility types, satisfies | 10 | 7,9 | 16–22 h | só escrita |
| 19 | Mapped/conditional/template types, infer, brand | 9 | 4,5 | 20–30 h | só escrita |
| 20 | Iteradores, generators, Proxy, streams, bytes | 10 (6 opc.) | 4,9 | 18–26 h | autoavaliação |
| 21 | Performance, memória, workers, debounce, `using` | 11 | 4,3 | 20–28 h | só escrita (workers/DOM) |
| 22 | .d.ts, pacotes, migração, schema (Zod/Valibot) | 10 | 4,3 | 22–32 h | só escrita |
| 23 | Arquitetura, revisão, observabilidade, capstone | 11 | 9,6 | 30–50 h | só escrita |

**Leitura do mapa:** a trilha cobre bem o núcleo da linguagem até closures/this. A partir de 11, a cobertura de *temas* continua boa, mas a de *prática executável* despenca. As etapas que mais formam um profissional (DOM, testes, Node, TS, arquitetura) são justamente as que o aluno não consegue executar dentro da plataforma. (antes)

---

## 2. Pré-requisitos ocultos: cobrado antes de ensinado

| Atividade | O que exige | Onde o conceito é ensinado | Correção proposta |
|---|---|---|---|
| Ponte 03 | `return` em guard clause (`if (idade >= 18) return 'adulto'`) | Funções só na etapa 04 | Trocar o exemplo por atribuição (`faixa = ...`), como 03.04 já faz. |
| 04.02 | `[...a]`, `a.push(1)` e `++n` prefixo | Arrays na 05, spread na 06; o curso só mostra `i++` | Trocar por exemplos com números/strings ou mover para a 05. |
| 04.05 | Objeto de opções `{ style: 'currency', currency: 'BRL' }` | Objetos na 06 | Microexplicação "objeto literal como pacote de opções" antes da atividade. |
| 04.07–04.10 | `export function` (ESM) | Módulos na 14 | Já há nota curta; tornar uma mini-lição fixa na entrada da 04 ("o avaliador importa sua função"). |
| 05.03 | `filter` com callback | Callbacks/HOF na 07 (o roteiro da 05 diz que "callbacks ainda não são obrigatórios") | Usar `for...of` + `push`, como o exemplo resolvido da própria 05, ou mover para a 07. |
| 05.04 | Retornar `{ primeira, ultima }` | Objetos na 06 | Retornar array `[primeira, ultima]`. |
| 05.06 | "Entrada congelada" (`Object.freeze`) | Nunca é ensinado | Explicar `Object.freeze` no próprio cartão ou fazer congelamento no avaliador, sem exigir conhecimento. |
| 05.07 | "Lance TypeError" (`throw`) | `throw`/Error formal na 13 | **Mover o básico de erros (throw, try/catch, Error) para logo após 04** (ver 3.1). |
| 06.06, 06.08, 06.09 | `try/catch` em `JSON.parse` | Há uma microponte na própria 06; o tratamento completo é na 13 | Não é ausência total: aprofundar a microponte e ligá-la à etapa 04B. |
| 06.06, 06.09 | `Map` e `Set` (round-trip JSON, persistência) | Etapa 07 | Trocar a ordem 06↔07 nesses itens ou adiar a parte Map/Set para revisão na 07. |
| 06.07 | Chave `__proto__` e poluição de protótipo | Protótipos na 10 | Explicar com `Object.create(null)`/`Map` sem depender do modelo de protótipos, ou mover para a 10. |
| 06.10 | `Object.create(proto)`, própria vs herdada | Protótipos na 10 | Mover para a 10 (é exatamente o assunto dela). |
| 08 (toda) | `Set.has`, `Map` de adjacência (08.01, 08.06–08.08), objetos-nó de árvore (08.02) | 06 e 07; o roteiro diz que o pré-requisito é só "funções, loops, arrays" | Declarar pré-requisito 07 ou reescrever com arrays. |
| 09.05 | `var` e hoisting de `var` | `var` nunca é apresentado (01 só ensina const/let) | Mini-lição "var em código legado" em 09.01. |
| 10.01 | Optional chaining `this?.x` | Prometido para "etapas posteriores" no roteiro 02 e **nunca ensinado** | Ensinar `?.` na 06 (objetos aninhados) com exercício próprio. |
| 11.05 | `closest()` | Ensinado na 11.06, que vem depois | Inverter 11.05 e 11.06. |
| 11.10 | Separar o Kanban em módulos | O Kanban só é construído em 11.08, que vem **depois** na navegação | Colocar 11.10 depois de 11.08 (e corrigir o arquivo, ver seção 4). |
| 12.02, 12.05 | `try/catch` com `await`, `throw` | Etapa 13 | Ver 3.1. |
| 12.13 (opc.) | `async function*`, `for await` | Generators na 20 | Mover para a 20 (já existe 20.07, muito parecido). |
| 13.xx | Ambiente Vitest local | Nenhuma etapa ensina instalar/rodar Vitest | Atividade de setup antes de 13.01 (ver 3.4). |
| 15.06 | `interface` | Etapa 17 | Introduzir `type`/`interface` de objeto na própria 15. |
| 15.09 | `Readonly<typeof dados>` (utility type + typeof de tipo) | Etapa 18 | Usar anotação manual `{ readonly itens: number[] }`. |
| 16.04 | `Promise<User>` (tipo genérico) | Generics na 17 | Explicar "tipos com parâmetro" em uma frase na 15 (Array<T>, Promise<T>). |
| 16.06 | `(typeof STATUS)[number]` | Indexed access na 18 | Mover para a 18 ou explicar ali mesmo. |
| 17.08 | `class Cache<K,V>` com TS | Recursos de classe em TS (`private`, `readonly`, parameter properties, `implements`) nunca são ensinados | Adicionar atividade "classes em TS" na 17. |
| 19.x | Sintaxe `A extends B ? X : Y` | O operador ternário de JS **nunca é ensinado** | Ensinar o ternário na 02/03. |
| 22.05 | `checkJs` (tipagem de JS via JSDoc) | JSDoc nunca é ensinado (só aparece de passagem em 13.08) | Atividade de JSDoc + `// @ts-check` antes de 22.05. |
| 20.08 | Escrever generators | A única prática de escrita (20.02) é **opcional** | Tornar 20.02 obrigatória. |

Nem toda antecipação precisa sair do lugar. Um objeto de opções pronto (04.05) ou um `export` (04.07) pode aparecer antes da aula completa, desde que o cartão explique o suficiente para não virar caixa preta. Também não são lacunas: **TDZ** já é ensinada na 09 e o `try/catch` de JSON tem uma microponte na 06.

---

## 3. Problemas estruturais e o que eu mudaria

### 3.1 Reordenar o tratamento de erros (alta prioridade)
**Problema:** `throw`, `try/catch` e `Error` são cobrados desde 05.07 e 06.06, mas a etapa de erros é a 13. Isso força o aluno a imitar sintaxe sem modelo mental. As atividades 02.04/02.05 contornam a falta de `if` calculando `total` mesmo com entrada inválida, o que normaliza um padrão ruim da vida real.
**Mudança:** criar uma **etapa 04B "Falhas previsíveis"** (logo após funções): `throw new Error`, `TypeError`/`RangeError`, `try/catch/finally`, guard clauses, "retornar vs lançar". A etapa 13 fica com debugging avançado, `cause`, testes e dublês.

### 3.2 Avaliação automática real nas etapas 04–23 (alta prioridade)
**Problema (antes):** cada atividade de 04+ tem **um único** "check" em texto livre (ex.: `given: "[2,4,6]", expected: "[2,6,12,4]"`) que não é executado. A conclusão exige só marcar todos os critérios da rubrica e escrever 16 caracteres; a análise escrita é aceita com 40 caracteres. Uma execução que termina em **erro ou timeout** também grava `status: "executed"` e libera a conclusão (`public/course-controller.js:354`). Registrar a tentativa com erro é bom para ensinar depuração; usá-la como condição suficiente para concluir uma implementação, não. A própria `site_spec.md` diz que itens `contract_ready` **não deveriam ser publicados** e que "item DRAFT não aparece no catálogo".
**Mudança:**
0. Separar quatro estados no progresso: **tentativa registrada**, **atividade estudada**, **comportamento verificado** (testes passaram) e **competência demonstrada** (transferência sem ajuda + recuperação posterior). O painel mostra cada um separadamente.
1. Para cada MAKE/FADED/DEBUG/MODIFY/PROJECT: testes públicos + testes ocultos executados no worker (o executor já importa módulos ESM; falta um mini-`expect` compatível com Vitest).
2. Para cada TEST: rodar a suíte do aluno contra a implementação correta **e contra mutantes** (a rubrica já pede isso e não acontece).
3. Rótulo claro no catálogo: "corrigido automaticamente" vs "revisão própria".
4. Tirar dos gates das etapas 05–10 a frase "passarem testes ocultos" enquanto esses testes não existirem.
5. Trocar rubricas genéricas ("Rode critérios comportamentais e revisão humana", "Aceite qualquer implementação que cumpra...") por critérios específicos: resultado, mutação permitida, erro esperado, estado após falha e evidência exigida. Prioridade: 09.08, 11.08, 12.08, 14.08 e 23.08.

### 3.3 Executores que correspondem ao conteúdo (alta prioridade)
**Problema (antes):** o executor mostra "sem DOM, rede ou APIs do Node.js"; TS, DOM, Vitest e Node ficam como "análise escrita". Um aluno de TS que nunca vê `error TS2322` não aprende a ler o compilador (meta da 15.01).
**Mudança:**
- **TypeScript:** rodar o `typescript` (ou o compilador nativo do TS 7) em um worker com `noEmit` e mostrar diagnósticos reais; type tests com `@ts-expect-error`/`expectTypeOf`.
- **DOM:** pré-visualização em iframe sandbox com o HTML/CSS/JS do exercício, mais um "teste de teclado" automatizado (foco, Tab, Enter) para 11.07/13.13.
- **Node:** sistema de arquivos em memória e `process.argv/env` simulados para 14.02–14.08 ou, melhor, WebContainers para projetos.
- **Vitest:** API `describe/it/expect/vi.fn/vi.useFakeTimers` mínima no worker.
- **Perfis de prática:** em vez de um executor único, três perfis: JavaScript (já existe), navegador/DOM (com preview e teste de teclado) e TypeScript com diagnósticos reais. Node e ferramentas locais ficam em um projeto baixável com comandos reproduzíveis (seção 6, item 11).

### 3.4 Trilha de "ambiente real" desde o início (alta prioridade)
**Problema (antes):** a etapa 00 promete "executar no navegador e no Node.js" e "usar editor e terminal", mas 00.01 e 00.05 dizem explicitamente que é tudo simulado. Nenhuma atividade pede para instalar Node, abrir terminal, rodar `node main.js`, `npm init`, `npx vitest` ou `tsc --init`. Git aparece **uma vez**, na 14.09.
**Mudança:** "checkpoints locais" obrigatórios a cada faixa:
- fim da 03: instalar Node, rodar um arquivo, ler um stack trace no terminal;
- fim da 07: primeiro repositório Git (`init`, `add`, `commit`, `log`, `diff`) — **e commits em todo projeto daí em diante**;
- antes da 13: `npm init`, instalar Vitest, rodar testes em modo watch;
- antes da 15: `tsc --init`, `strict`, rodar TS no Node (type stripping nativo, `erasableSyntaxOnly`) e entender quando usar `tsc`, `tsx` ou bundler.
- na etapa 13: entregar o ambiente de testes pronto (projeto com Vitest já configurado) e só depois ensinar a configurá-lo;
- na etapa 14: semver, lockfile, lint, build e execução limpa aplicados aos projetos, não só como teoria.
A plataforma verifica colando a saída do terminal ou enviando o `git log`.

### 3.5 Arquivos iniciais de verdade nas etapas 15–23 (alta prioridade)
Todas as atividades de 15 a 23 têm só `material.md` com uma descrição (antes). Exemplos:
- 15.01 pede para classificar "os seis diagnósticos do starter", mas os seis trechos não estão no arquivo;
- 21.04 diz "memoize de Map sem limite", sem o código;
- 23.04 cita "código legado de 80 linhas", 23.10/23.11 citam um "mini-repo com 10 arquivos": nada disso existe.

Além disso, 21–23 têm **zero** links de documentação.
**Mudança:** materializar os arquivos (`.ts`, `tsconfig.json`, testes, mini-repositórios de 8–15 arquivos, como a própria spec descreve) e adicionar recursos oficiais (MDN, TS Handbook, Node docs).

### 3.6 Volume de prática e prática intercalada
**Problema:** cerca de 110 h de atividades. Para ir de zero a sênior, a carga declarada (370–500 h) já é otimista. Conceitos centrais têm uma única ocorrência: regex (05.02; 05.05 é opcional), `reduce` (só é refatorado em 07.06, nunca escrito), generators (só opcional), Proxy (100% opcional), `switch` (nenhuma prática em JS).
**Mudança:** banco de exercícios isomórficos por conceito (3–5 variações com dados e domínios diferentes), revisão espaçada que **sorteia exercícios executáveis** e não só perguntas de múltipla escolha, e "katas" curtos intercalados de etapas anteriores.

### 3.7 Pontes, dicas e grafo de pré-requisitos
- Pontes: 15–19 usam todas o texto de narrowing; 20–23 usam o de iteradores/streams. É preciso escrever pontes próprias para 16, 17, 18, 19, 21, 22 e 23.
- Dicas: só a 01 tem `hints` no catálogo (02/03 têm apoio nos próprios módulos). De 04 a 23, nenhuma atividade tem escada de dicas, prompt de transferência ou campo `requires`, embora a spec descreva "grafo de requisitos" e "escada de ajuda". Fazer o build falhar quando faltar `requires`, o que já detectaria a seção 2 automaticamente.
- Grafo: a validação atual (`course-src/build_graph.py:112`) só compara **etapas**. Um pré-requisito ensinado mais adiante na mesma etapa passa, e conteúdo obrigatório pode depender de atividade opcional (caso 20.08 → 20.02). Registrar por competência a atividade que **introduz**, a que **pratica com ajuda** e a que **verifica sem ajuda**; validar a ordem real de navegação e reprovar dependência obrigatória → opcional.
- Exemplos resolvidos: em vários cartões avançados o "exemplo" é só uma frase ("um cache preserva tipos de chave e valor"). Nos conceitos difíceis, exigir código, entrada, estado intermediário, saída e a justificativa da decisão.
- Revisão espaçada: as revisões genéricas reaproveitam perguntas de múltipla escolha, que medem reconhecimento. Alternar com previsão de código novo, correção curta e mini-implementação em outro domínio.

### 3.9 Contratos de borda perdidos na publicação (alta prioridade, esforço baixo)
**Problema:** as receitas definem `edge_contract` (vazio, erro, limite, cancelamento), mas `course-src/build-public-curriculum.mjs` não exporta esse campo. Em 05.07 o enunciado pede preservar "o retorno publicado para `[]`", e o valor `[null,null,0,null]` só existe na fonte (`recipes/05.py:227`). Em 20.08 somem `take(0)` sem leituras, o encerramento antecipado antes de a fonte falhar e um cursor independente por iteração.
**Mudança:** publicar as bordas relevantes ao aluno como exemplos públicos e ligar cada teste à regra que ele verifica. O build falha se um teste oculto cobrar uma borda que não está publicada (critério 4 da spec).

### 3.10 Editor que comporta os projetos
**Problema:** cada arquivo tem `maxlength = max(80, floor(1100 / nº de arquivos))` (`public/course-controller.js:87`). O starter de 11.08 tem 1.138 caracteres, então o aluno não consegue acrescentar código no projeto Kanban. Os microprojetos e o capstone também não cabem.
**Mudança:** limite por arquivo compatível com projetos (ex.: 20–50 KB), contador visível, persistência por arquivo e, para PROJECT, o workspace multiarquivo da seção 6.

### 3.11 Explicação liberada só depois da primeira resposta
**Problema:** no fluxo genérico, explicação e ponte só aparecem depois que o aluno registra uma previsão ou decisão (`answered` em `public/course-controller.js:61`). Isso funciona para relembrar o que já foi visto, mas atrapalha quando a atividade introduz um conceito novo.
**Mudança:** dois caminhos por atividade. **"Aprender este conceito"**: exemplo resolvido antes do exercício. **"Tentar de memória"**: previsão antes da explicação. A sequência de retirada de ajuda passa a ser: exemplo resolvido → completar uma decisão → modificar → criar sozinho → transferir → recuperar depois. Um erro no modelo básico leva a uma recuperação específica antes do projeto.
- Ponte 08 abre com BFS, mas a primeira atividade da 08 é complexidade (08.01): reordenar a ponte ou as atividades.

### 3.8 Diagnóstico de nivelamento
Os 5 itens cobrem 00–04. Quem já trabalha com JS precisa passar por 200 atividades. **Mudança:** diagnóstico por faixas (Fundamentos, Intermediário, TS, Avançado), cada uma com 4–6 itens executáveis, liberando etapas com "teste de saída" (fazer as transferências da etapa sem dica).

---

### 3.12 Alterações por etapa (cobertura curricular)

A tabela descreve o conteúdo previsto e o que mudaria em cada etapa. As limitações de execução e avaliação das seções 3.2 e 3.3 continuam valendo.

| Etapa | Conteúdo atual | Alteração e motivo |
|---|---|---|
| **Diagnóstico** | Saída, tipos, decisões, retorno e localização de falha. | Manter curto e criar diagnósticos posteriores para coleções, async e TS. O atual não mede prontidão para toda a trilha. |
| **00** | Execução, console, sequência, erros, ambientes e leitura de HTML. | Acrescentar uma tarefa real no console do navegador e outra em arquivo local. Transferir o modelo do interpretador para ferramentas reais. |
| **01** | Valores, `typeof`, bindings, `const/let`, reatribuição, valores especiais e templates. | Preservar a estrutura e ampliar pequenas transferências em contextos diferentes. O núcleo está bem apoiado. |
| **02** | Operadores, coerção, falsy/nullish, validação numérica, `Math`, precisão e tolerância. | Dividir práticas extensas e exigir explicação de fronteiras. Acrescentar ternário em uma comparação simples com `if`, sem confundir concisão com legibilidade. |
| **03** | Decisões, loops, contadores, acumuladores, parada e limites. | Garantir prática própria de `switch`, `break/continue` e escolha entre `for` e `while`. Corrigir a ponte com `return` antecipado. |
| **04** | Funções, parâmetros, retorno, efeito, pureza, decomposição e formatação. | Acrescentar exercícios de parâmetros padrão e rest, declarados no roteiro mas sem prática dedicada. Introduzir falhas de contrato. |
| **05** | Strings, arrays, buscas, mutação, ordenação, regex, `flat` e Unicode. | Separar coleções básicas de regex e Unicode; preparar callbacks e comparadores; publicar todos os casos vazios e inválidos. |
| **06** | Referências, aliasing, spread, destructuring, merge, clone, JSON e propriedades. | Criar práticas graduais de sintaxe de objetos e de validação de esquema. Acrescentar optional chaining com limites claros. |
| **07** | Callbacks, métodos de array, `Map/Set`, agrupamento, `reduce` e `flatMap`. | Fazer o aluno escrever uma transformação com loop e callback antes de grandes pipelines. Avaliar valores intermediários e a escolha da estrutura. |
| **08** | Complexidade, recursão, busca binária, invariantes, deduplicação e BFS. | Declarar os requisitos reais de objetos e `Map/Set`; exigir pseudocódigo e uma medição simples. Manter como caminho paralelo quando apropriado. |
| **09** | Escopo, closures, factories, captura em loop, cache, `WeakMap` e store. | Implementar um laboratório visual de bindings e assinaturas. Acrescentar recuperação para `var` e ownership do estado. |
| **10** | `this`, arrow, método extraído, protótipos, classes, herança e composição. | Fornecer programas reais em contextos explícitos. Comparar factory, objeto simples e classe para a mesma necessidade. |
| **11** | DOM, scripts, eventos, formulários, listeners, texto seguro, acessibilidade e Kanban. | Oferecer navegador de prática, arquivos separados e verificação de teclado e foco. Corrigir 11.10 e acompanhar a evolução do mesmo Kanban. |
| **12** | HTTP, `Response`, event loop, Promises, cancelamento, concorrência, retry, tempo e dashboard. | Ensinar estados de Promise e `async/await` em passos antes dos combinadores e do corpo de `Response`, que só pode ser lido uma vez. Acrescentar limites de concorrência e retry seguro. |
| **13** | Testes, debugger, regressão, TDD, dublês, relógio falso, causas de erro e testes DOM. | Entregar o ambiente de testes pronto e depois ensinar a configurá-lo. Corrigir a migração contraditória e avaliar testes contra bugs conhecidos. |
| **14** | ESM/CJS, Node, scripts, caminhos, configuração, dependências, bundler, Git e compatibilidade. | Distribuir Git desde os primeiros projetos. Praticar semver, lockfile, lint, build e execução limpa. Corrigir 14.07 e 14.13. |
| **15** | Inferência, `any/unknown`, estruturalidade, strict, readonly, excess properties e runtime. | Entregar código TS e diagnósticos reais. Praticar `void`, propriedades opcionais, tuples e a escolha entre `type` e `interface`. |
| **16** | Unions discriminadas, narrowing, exaustividade, guards, `catch unknown` e máquina de estados. | Associar cada prova estática a um caso de runtime. Decompor a sintaxe antecipada em 16.06 e mostrar guards incorretos. |
| **17** | Generics, constraints, callbacks, readonly, overloads, const parameters, enum e cache. | Introduzir classes em TS no contexto do cache. Avaliar quando um generic preserva uma relação útil e quando só acrescenta complexidade. |
| **18** | `keyof`, indexed access, utility types, `satisfies`, índices seguros e imports de tipo. | Mostrar tipos inferidos e código emitido. Exigir consumidores que demonstrem a compatibilidade de uma mudança. |
| **19** | Conditional, mapped e template literal types, `infer`, distributividade, DSL e branding. | Reduzir exercícios que só expandem tipos; ampliar problemas de API e manutenção. Avaliar quando abandonar uma abstração de tipos. |
| **20** | Iteradores, generators, lazy pipelines, Proxy, streams e bytes. | Consolidar o protocolo síncrono antes do async. Tornar observáveis consumo, encerramento e recursos. Manter APIs raras como extensões. |
| **21** | Medição, benchmark, cache, cleanup, workers, debounce/throttle, transferência e descarte. | Exigir evidência real de profiling e de antes/depois. Ensinar cleanup comum antes de APIs recentes como `using`. |
| **22** | Declarations, pacotes, augmentation, migração, schemas, type tests e referências de projeto. | Entregar biblioteca e consumidores reais. Praticar JSDoc/`checkJs`, `npm pack` e testes do pacote empacotado. |
| **23** | Arquitetura, contratos, refactor, review, fronteiras, manutenção, observabilidade e capstone. | Reordenar o projeto e sua manutenção. Fortalecer a rubrica com entrega, falhas, acessibilidade, operação e mudança posterior. |

### 3.13 Estimativa de carga

As durações cadastradas somam cerca de **109 horas**, incluindo diagnóstico e extras. O capstone (23.08) tem **6 horas** cadastradas (360 min), enquanto a etapa declara 30–50 horas. Isso não prova carga inadequada, mas precisa de explicação: estudo, prática adicional, revisão e trabalho externo estão incluídos onde? Eu calibraria essas estimativas com uso real e dividiria os projetos em entregas menores, cada uma com seu critério de conclusão.

---

## 4. Erros de conteúdo e inconsistências pontuais

| Atividade | Problema | Correção |
|---|---|---|
| **23.07 / 23.08** | A navegação põe 23.07 ("capstone pronto; nova regra...") antes de 23.08 (construir o capstone) e de 23.09 (`course-src/compile_content.py:130`). | Ordem 23.08 → 23.09 (falha observável) → 23.07 (mudança de requisito). |
| **11.10** | O enunciado pede para "separar o Kanban em estado, visualização e ponto de entrada", mas o material é um exemplo `math.js` / `somar`, e a atividade aparece **antes** do Kanban (11.08). | Mover para depois de 11.08 e fornecer o Kanban monolítico como starter. |
| **13.14** | O objetivo diz "Não crie V3" e "estenda V2 com `priority`", mas o arquivo importa `migrarV2ParaV3` e o comentário diz "Esta mudança adiciona V2→V3 com priority". Além disso, 11.13 **já** criou V2 com `priority='normal'`, então a change request repete o que já foi feito. | Escolher um contrato. Sugestão: 11.13 = V1→V2 (adiciona `priority`); 13.14 = V2→V3 com um campo novo (ex.: `dueDate` ou `tags`) + testes de regressão. |
| **14.07** | O objetivo e o enunciado são sobre `Promise.try`, mas o material contém `Iterator.from(...).map(...)`; o próprio enunciado diz "não troque o recurso principal por Iterator helpers". Também repete o tema de 12.09. | Usar um material sobre `Promise.try` ou trocar o tema para checar compatibilidade de Iterator helpers (que é da 20). |
| **14.13** | O enunciado fala em snippets com `Promise.then`, `setTimeout` e `process.nextTick` nos dois runtimes; o arquivo contém um loop de 10⁹ iterações que bloqueia a thread (e pode estourar o timeout de 2 s do executor). | Fornecer os dois snippets descritos e mover o bloqueio para a 21. |
| **14.03** | Usa `node:test`, enquanto a 13 declara Vitest "a API padrão da plataforma". | Tornar a escolha uma comparação explícita ("Vitest vs `node:test`") ou padronizar. |
| Runtime TS | Os cartões dizem "TypeScript 5.0+", o roteiro 22 diz que "TS 7.0 está estável em 2026" e o projeto fixa `typescript` 5.9.3. | Ver a seção 8: um ambiente-alvo único, aplicado a cartões, starters, soluções, testes e executores. |
| 02.04 / 02.05 | Validação sem `if` faz o programa continuar calculando com entrada inválida. | Introduzir `if` mínimo antes, ou deixar explícito que "isso é só detecção; em código real você rejeitaria". |
| 03 (roteiro) | `switch` é conceito nuclear da etapa, mas nenhuma atividade o pratica. | Atividade MAKE com `switch` sobre estados discretos (ex.: ação do turno na batalha 03.09). |
| 05 (roteiro) | Promete classes, quantificadores, **grupos** e **flags** de regex; a prática cobre só um padrão âncora. | 2–3 atividades: `replace` com grupos nomeados, `matchAll`, flags `g`/`i`/`u`/`v`, e "regex vs parser". |
| 11 (roteiro) | Debounce/throttle "conceitualmente" na 11; a prática só vem na 21.07. | Ok manter, mas avisar na 11 que a prática vem depois. |
| 07 | `sort` com `localeCompare` aparece no exemplo resolvido do roteiro, mas nenhuma atividade ensina comparação de strings com localidade (`localeCompare`/`Intl.Collator`). | Incluir no Parsons de ranking (07.03). |

---

## 5. O que falta ensinar para chegar a sênior

Agrupado por área. "Essencial" é o que eu esperaria de qualquer pleno/sênior JS/TS em 2026; "Recomendado" diferencia.

### 5.1 Linguagem JavaScript (lacunas)
- **Essencial:** operador ternário; `switch` praticado; optional chaining `?.`; `var` e hoisting (para ler legado); `new Promise` e promisificação de APIs de callback (`setTimeout`, callbacks *error-first* do Node); `unhandledrejection` e rejeições não tratadas; subclasses de `Error` (`class NotFoundError extends Error`); getters/setters e `Object.defineProperty`; `URL`/`URLSearchParams`; regex intermediária; `Intl.DateTimeFormat`, `Intl.Collator`, `Intl.PluralRules`, `Intl.RelativeTimeFormat` e `Intl.Segmenter` (05.11 ensina *code points*, mas não *grapheme clusters*). Também: estados de Promise (pending, fulfilled, rejected) e `async/await` em passos antes dos combinadores (`Promise.all`, `allSettled`, `race`, `any`), e parâmetros padrão e rest, declarados no roteiro sem prática dedicada.
- **Recomendado:** tagged templates; `EventTarget`/`CustomEvent`; limitação de concorrência (pool de N promessas) e retry com backoff exponencial + jitter (12.02 tem retry sem backoff); `Temporal` em ambiente com suporte; strict mode e diferenças entre script e módulo.

### 5.2 Ferramentas e fluxo de trabalho (praticamente ausente)
- Terminal, editor (atalhos de navegação e refatoração, "ir para definição"), Node instalado (ver 3.4).
- **Git contínuo**: branch, commit pequeno, rebase/merge, resolução de conflito, PR, revisão. Hoje é uma atividade.
- **ESLint e Prettier**: nenhuma atividade. Ler e configurar regras, entender por que uma regra existe.
- **Bundler na prática** (Vite): 14.12 compara, mas não configura nem roda.
- **CI**: um pipeline mínimo (lint + typecheck + test) em GitHub Actions.
- **DevTools além do debugger**: aba Network (status, timing, CORS), Performance (21 cita, mas não executa), Memory/heap snapshot, Lighthouse.
- **Segurança de dependências**: `npm audit`, lockfile, riscos de cadeia de suprimentos, `postinstall`.
- **Versionamento**: semver (`^`, `~`, faixas e o que uma mudança *major* quebra), lockfile e por que `npm ci` reproduz o ambiente.

### 5.3 Back-end com Node (ausente)
Um desenvolvedor JS/TS sênior quase sempre toca o servidor. Falta uma etapa com:
- servidor HTTP (`node:http` primeiro, depois um framework leve como Fastify/Hono), roteamento, middleware;
- validação na borda com schema (reaproveita 22.06), códigos de status, erros padronizados (RFC 9457);
- persistência real (SQLite) e noções de SQL, migrações, transações;
- autenticação/autorização básicas (sessão por cookie vs token), hashing de senha;
- streams do Node, desligamento gracioso (`SIGTERM`), logs estruturados (23.09 começa isso);
- testes de integração da API.

### 5.4 Segurança web (fragmentada)
Hoje há XSS por `innerHTML` (11.12), poluição de protótipo (06.07) e segredos em config/logs (14.06, 23.09). Falta um bloco coeso: CORS, CSP, CSRF, cookies `HttpOnly/SameSite`, injeção (SQL/comando), validação de upload/URL, `eval`/`new Function`, OWASP Top 10 aplicado a JS.

### 5.5 Front-end de produção
- Um framework de componentes (React é o mais pedido; alternativa: Web Components nativos) depois do Kanban, para transferir "estado → render" a um modelo real.
- Roteamento no cliente (`history`, `URL` como estado), gerenciamento de estado assíncrono (cache, invalidação).
- CSS mínimo de layout (flex/grid) e responsividade: o curso diz explicitamente que não exige CSS, mas o trabalho real exige.
- Web Vitals, lazy loading, IndexedDB para persistência maior que `localStorage`.

### 5.6 Testes além do unitário
Integração, E2E (Playwright), testes de contrato de API, testes baseados em propriedades (fast-check) e o uso de mutation testing como ferramenta (a rubrica cita mutantes, mas o aluno nunca roda um). Pirâmide/troféu de testes e custo de manutenção de cada tipo.

### 5.7 TypeScript (lacunas)
- **Setup:** `tsc --init`, opções `target/module/moduleResolution/lib`, type stripping no Node, `tsx`, quando o bundler faz o trabalho.
- **Sintaxe básica explícita** antes das fronteiras: tipos de array, tupla (nomeada e variádica), objeto, função, assinatura de índice, propriedades opcionais. A 15 pula direto para `unknown` e diagnósticos.
- **Classes em TS:** `private`/`protected`/`#private`, `readonly`, parameter properties, `implements`, `abstract`.
- **Tipos do DOM:** `HTMLInputElement`, `querySelector<T>`, eventos tipados. Liga a 11 à 15.
- **JSDoc + `@ts-check`** (necessário para a 22.05).
- **Decorators** padrão TC39 (leitura, para frameworks).
- TS em testes (Vitest com TS, `expectTypeOf`), tipagem de `fetch`/respostas e geração de tipos a partir de schema/OpenAPI.
- **Limite do sistema de tipos:** `as` não valida dados em runtime. O aluno deve ver isso antes de confiar em um tipo vindo de JSON ou da rede ([Handbook oficial](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions)).

### 5.8 Habilidades de sênior (pouco ou tardiamente trabalhadas)
- **Ler código alheio cedo:** a primeira tarefa em mini-repositório é a 23.10. Deveria haver uma por faixa (07, 11, 14, 18).
- **Code review contínuo:** a 23.05 é a única revisão de PR. Propor revisão de código "de colega" em todo microprojeto a partir da 07.
- **Requisitos ambíguos:** quase todos os enunciados são completos e precisos. Na vida real, o sênior faz perguntas. Incluir "tickets" incompletos em que o primeiro passo é listar perguntas, com respostas liberadas depois.
- **Decomposição e estimativa:** quebrar uma feature em tarefas, estimar, entregar incrementalmente.
- **Documentação técnica:** README, ADR (citado na 23.08), comentários de API.
- **Incidentes:** simulação de "produção caiu" com logs, hipótese, mitigação, postmortem.
- **Design pragmático:** padrões que aparecem em código JS real (observer, strategy, adapter, factory, DI), SOLID sem dogma, quando *não* abstrair. Hoje estão espalhados (09.08, 10.07, 14 e 23).
- **Desenvolvimento com IA (2026):** revisar código gerado por IA, escrever testes para validar sugestões, reconhecer alucinação de API (casa com o foco do curso em "verificar o runtime alvo"). Totalmente ausente.

---

### 5.9 Competências de entrega e operação

Quadro que resume o que o egresso precisa demonstrar, com a situação observada e a prática que eu acrescentaria. Ele reúne e amplia as seções 5.2 a 5.8.

| Competência | Situação observada | Prática que eu acrescentaria |
|---|---|---|
| **Ambiente real** | Conceitos de ambiente existem; a prática local é pouco materializada. | Abrir um checkout limpo, instalar dependências, executar, testar e diagnosticar configuração incorreta. |
| **Git e colaboração** | Há uma atividade específica e uma revisão simulada. | Branches, conflitos, commits revisáveis, feedback de review e atualização de PR ao longo dos projetos. |
| **Entrega e release** | Pacote e build aparecem; o ciclo operacional completo é pouco avaliado. | CI, artefato reproduzível, versão, changelog, smoke test e rollback. |
| **Confiabilidade de APIs** | Cancelamento, timeout, retry e resposta obsoleta já existem. | Idempotência, backoff, limite de concorrência, operações duplicadas e falhas parciais. |
| **Persistência** | JSON/storage e migração estão presentes. | Evolução de schema, concorrência entre gravações, atomicidade e recuperação. Banco entra no caminho que precisar dele. |
| **Segurança aplicada** | Há texto seguro, validação, dependências e autorização. | Casos de abuso, fronteira real de autorização, segredos, configuração e análise de risco de dependências. |
| **Testes em camadas** | O desenho é forte em testes unitários e de DOM. | Integração entre adaptadores, contratos e ao menos um fluxo E2E do projeto escolhido. |
| **Performance** | Medição e workers estão previstos. | Perfil real, hipótese, experimento, evidência e discussão do custo da solução. |
| **Observabilidade** | Logs, causa, duração e correlação aparecem. | Investigar um incidente por logs e métricas, explicar o impacto e propor prevenção. Ver [sinais e contexto operacional](https://opentelemetry.io/docs/concepts/observability-primer/). |
| **Arquitetura e decisão** | Separação de responsabilidades já existe. | Comparar duas soluções válidas sob custo, prazo, risco, manutenção e requisitos incompletos. |
| **Comunicação técnica** | Existem explicações e comentários de review. | Escrever issue reproduzível, proposta curta, decisão arquitetural (ADR) e relatório de incidente. |
| **Autonomia com ferramentas e IA** | Não há uma sequência dedicada. | Investigar código recebido, verificar sugestões, testar hipóteses e explicar as limitações de uma solução gerada. |

Esses eixos aprofundam princípios que já estão corretos no currículo. Na performance de Node, a prática precisa demonstrar o impacto de bloquear o event loop, conforme a [documentação oficial](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop).

### 5.10 Caminhos depois do núcleo comum

Depois do núcleo comum, eu dividiria a formação profissional em caminhos:

- **Frontend:** HTML/CSS mais completos, acessibilidade, componentes, estado, navegação, browser APIs, performance e um framework usado em um projeto real.
- **Backend:** servidor HTTP, autorização, persistência, concorrência, configuração, operação e testes de integração.
- **Bibliotecas e ferramentas:** superfície pública, compatibilidade, declarations, consumidores, empacotamento e migração de versões.

Não exigiria todos os frameworks, bancos ou APIs avançadas de toda pessoa. Exigiria **profundidade em pelo menos um contexto de atuação e capacidade de aprender outro**.

---

## 6. Recursos da plataforma para facilitar e simular a vida real

1. **Projeto contínuo (fio condutor RPG).** O curso já usa um tema de RPG em vários pontos (03.09 batalha, 04.09 ficha, 06.09 save de jogo, 10.08 motor de entidades). Transformar isso em **um único repositório que evolui** da 03 à 23: batalha → funções → save versionado → entidades → UI acessível → API assíncrona → testes → módulos/CLI → migração para TS → performance → pacote → capstone. Cada etapa vira uma *change request* no mesmo código, que é como o trabalho real funciona: o aluno convive com as próprias decisões antigas.
2. **Workspace multiarquivo persistente** com árvore de arquivos, histórico e *diff* entre tentativas (o "Kanban V2" e o capstone exigem isso).
3. **Git simulado no navegador** (isomorphic-git) integrado ao workspace: commits obrigatórios, *diff* e branch para cada change request.
4. **Correção em camadas:** testes públicos → testes ocultos → mutantes (para TEST) → typecheck → checagem de acessibilidade automatizada → rubrica humana/IA só para o que é subjetivo.
5. **Escada de dicas** para 04–23 (conceitual → estrutural → exemplo análogo → solução comentada), registrando o nível de ajuda usado; a spec já descreve isso.
6. **Debugger visual** no executor genérico (o interpretador da 03 já tem limite de passos): breakpoints, *step*, inspeção de escopo/closures e da pilha. Ajuda muito em 09, 10 e 12.
7. **Visualizador de event loop** passo a passo para 12.01/12.04, e de referências/heap para 06.01/06.02.
8. **Tickets com ambiguidade e "stakeholder" simulado:** o aluno faz perguntas antes de codar; um assistente responde só o que está no contrato oculto.
9. **Revisão de código simulada:** o aluno recebe um PR com 3–5 problemas e escreve comentários priorizados; e recebe revisão no próprio PR com sugestões a aceitar ou rejeitar com justificativa.
10. **Modo "incidente":** logs e métricas falsos de um serviço com problema, limite de tempo, e um postmortem no final.
11. **Exportar para local:** botão "baixar como projeto" com `package.json`, testes e config, para o aluno rodar no próprio computador e enviar a saída do CI de volta.
12. **Revisão espaçada executável:** a fila de revisão já existe (`review-schedule.js`); passar a sortear mini-exercícios executáveis isomórficos, não só múltipla escolha.
13. **Portfólio:** cada microprojeto concluído com testes verdes vira um repositório publicável, com README gerado a partir das decisões registradas.
14. **Simulador de rede determinístico.** Controles para atraso, 404/503, JSON inválido, cancelamento e respostas fora de ordem. Serve para ensinar async sem depender de serviços instáveis.
15. **Painel de competências com evidências.** Mostra o que foi resolvido com ajuda, o que foi feito de forma independente, o que foi transferido e o que foi recuperado depois. Serve para diferenciar atividade concluída de habilidade demonstrada.
16. **Feedback ligado à primeira divergência.** Mostra entrada, valor esperado, valor observado e uma próxima investigação. Serve para desenvolver depuração.
17. **Repositório alheio completo.** README, arquivos, histórico, issue e testes reais. Serve para praticar investigação antes de qualquer alteração (complementa 23.10 e 23.11).
18. **Banco de transferências.** Problemas estruturalmente relacionados em domínios diferentes, sem apenas trocar nomes. Serve para verificar compreensão além da memorização (seção 3.6).

---

## 7. Plano de execução

O plano executável, com fases, critérios de saída, calendário fixo e decisões abertas, está em [planos/2026-10-09-plano-por-fases.md](planos/2026-10-09-plano-por-fases.md). Ele substitui a antiga lista P0/P1/P2 e o registro de andamento desta seção.

Resumo da ordem: linha de base → ambiente-alvo → progressão → TypeScript 7 → executores → avaliação automática → prática → ambiente real → trilhas sênior → recursos avançados → manutenção contínua.

---

## 8. Atualização de versões em todas as etapas

### 8.1 Situação atual

O curso não declara um ambiente-alvo único e coerente:

| Onde | O que está hoje |
|---|---|
| Cartões 04 | "JavaScript **ES2023** no Node.js 24 LTS" |
| Cartões 05–14, 20–23 | "Node.js 24 LTS", "Node.js 24.x", "Node.js" ou "browser", sem versão do ECMAScript |
| Cartões 15–19 (antes) | "TypeScript **5.0+** strict" |
| Cartões 22 (antes) | "TypeScript strict", sem versão; o roteiro diz "TypeScript 7.0 está estável em 2026" |
| `package.json` (antes) | `typescript` 5.9.3, `@types/node` 22.19, `engines.node >= 22.13` |
| Executor genérico (antes) | `esbuild-wasm` 0.28 só remove tipos; não há typecheck |

Referências em 05/10/2026:

- **ECMAScript 2026** foi aprovado em 30/06/2026. As novidades são `Math.sumPrecise`, `Iterator.concat`, `Array.fromAsync`, `Error.isError`, os métodos de Map/WeakMap para valor padrão na leitura (`getOrInsert`/`getOrInsertComputed`), base64/hex em `Uint8Array`, o acesso ao texto-fonte em revivers de `JSON.parse` e `JSON.rawJSON`. O ES2025 já tinha trazido Iterator helpers, métodos de `Set`, `Promise.try`, `RegExp.escape`, `Float16Array`, import attributes/JSON modules e modificadores de regex. **Temporal não faz parte do ES2026**: ensinar só onde o runtime-alvo oferecer suporte.
- **TypeScript 7.0** está estável desde 08/07/2026 (7.0.2). O compilador nativo, escrito em Go, faz a mesma checagem de tipos do 6.0. O 7.0 herda os novos padrões do 6.0 (`strict: true`, `module: esnext`, `target` atual, `types: []`, `rootDir: "."`, `noUncheckedSideEffectImports: true`) e transforma em erro o que o 6.0 tinha descontinuado: `target: ES5`, `baseUrl`, `outFile`, módulos `amd/umd/systemjs` e `moduleResolution: node`. **Ainda não há API programática estável (prevista para o 7.1)**. Isso afeta typescript-eslint, ferramentas de frameworks e qualquer verificador embutido no site.
- **Node.js:** o 24 é o LTS ativo, mas **entra em manutenção em 20/10/2026** (fim de vida em 30/04/2028). O **26 vira LTS ativo em 28/10/2026** (fim de vida em 30/04/2029). O 22 já está em manutenção até 30/04/2027.

### 8.2 Política de versões proposta

1. **Um único arquivo de ambiente-alvo** (ex.: `course-src/runtime-baseline.json`) com: edição do ECMAScript, versão do TypeScript, Node principal e mínimo, critério de navegador (Baseline "amplamente disponível") e versões de Vitest/ESLint/Vite. Receitas, cartões, `package.json` dos starters, executores e documentação leem desse arquivo. **O build falha** se um cartão citar uma versão diferente ou usar um recurso acima do ambiente-alvo sem o campo `compatibility`.
2. **Matriz de recursos**: para cada API, registrar a edição do ECMAScript, a versão mínima do Node e o status Baseline. Recursos de ES2025/2026 entram depois dos fundamentos, com feature detection quando o runtime mínimo não os tiver.
3. **Node:** até 28/10/2026, manter o 24 como base. Depois, **26 LTS como principal e 24 como mínimo suportado**, com testes dos starters e soluções nas duas versões. Revisar a cada outubro (troca de LTS) e a cada junho (nova edição do ECMAScript).
4. **TypeScript:** ensinar a semântica e a configuração do **7.0** e usar o `tsgo`/`tsc` 7 nos projetos locais e no CI. Para o verificador dentro do site, enquanto não houver API estável do 7.x utilizável no navegador, usar o **6.0** (mesma checagem de tipos, padrões e deprecações já do 7). Migrar quando o 7.1 publicar a API, e mostrar isso ao aluno como um caso real de compatibilidade de ferramentas.
5. **Práticas modernas como caminho principal** (ESM, `strict`, APIs atuais, ferramentas mantidas) e **legado como habilidade de manutenção** (`var`, CommonJS, `Date`, `moduleResolution` antigo, `enum`), sempre com o rótulo "leitura de legado".
6. **Atualizar o pacote completo, não só o texto**: roteiro, cartão, starter, solução, testes públicos e ocultos, recursos/links e executor. Trocar "TypeScript 5" por "TypeScript 7" só no texto manteria a inconsistência.
7. **Novidades depois dos fundamentos:** um recurso recente entra quando ajudar a resolver o problema da atividade e quando seus pré-requisitos já tiverem sido ensinados. **Compatibilidade do exercício:** cada recurso precisa funcionar no navegador ou no Node que o exercício usa, com feature detection quando o runtime mínimo não o tiver.
8. **Resumo de referência (05–09/10/2026):** JavaScript em ECMAScript 2026; TypeScript 7.0 como versão ensinada, com o verificador do site em 6.0 até a API estável; Node 24 como base até 28/10/2026, depois Node 26 LTS como principal e 24 como mínimo suportado.

### 8.3 Alterações por etapa

| Etapa | Atualização de versão |
|---|---|
| **D, 00** | Rótulos com o ambiente-alvo. Na trilha de ambiente real (3.4): instalar o Node LTS por um gerenciador de versões (nvm, fnm ou Volta), conferir `node --version` e explicar o ciclo Current/LTS/manutenção usando a troca 24 → 26 de outubro de 2026. |
| **01** | Sem mudança de API. Alinhar o rótulo "Interpretador da Etapa 01" com a edição ECMAScript que ele implementa. |
| **02** | Em 02.11/02.12, apresentar `Math.sumPrecise` (ES2026), que segundo a verificação de 09/10/2026 não existe no Node.js 24 nem no 26: usar só como nota de especificação; deixar claro que não resolve dinheiro (centavos inteiros ou BigInt continuam sendo a resposta). |
| **03** | Sem mudança de API; só o rótulo do interpretador. |
| **04** | Trocar "ES2023" pelo ambiente-alvo. Em 04.05, conferir as opções do `Intl.NumberFormat` no Node-alvo. |
| **05** | Regex: flag `v` (ES2024), grupos nomeados duplicados e modificadores `(?i:...)` (ES2025). `RegExp.escape` (ES2025) deixa de ser opcional se estiver no Node mínimo. Em 05.11, acrescentar `String.prototype.isWellFormed/toWellFormed` (ES2024) e `Intl.Segmenter` para grafemas. `toSorted/toReversed/toSpliced/with` (ES2023) continuam. |
| **06** | 06.06: usar `JSON.rawJSON` e o contexto de origem do reviver (ES2026) para o round-trip de BigInt/números grandes, comparando com a solução manual. `Error.isError` (ES2026) na leitura segura de erros. `structuredClone` continua. |
| **07** | 07.05: usar os **métodos nativos de `Set`** (`union`, `intersection`, `difference`, `isSubsetOf`; ES2025), que o roteiro promete e o exercício não pede, mantendo a versão manual como comparação. 07.07: contagem com `Map.prototype.getOrInsert`/`getOrInsertComputed` (ES2026) depois da versão com `has/get/set`. `Object.groupBy/Map.groupBy` (ES2024) continuam. |
| **08** | Sem API nova. Atualizar a menção a `sort` estável e às garantias do ECMAScript atual. |
| **09** | 09.06/09.07: memoize e metadados com `getOrInsertComputed` em `Map`/`WeakMap` (ES2026) depois da versão manual. Manter `var` como leitura de legado. |
| **10** | Verificação de marca com `#campo in obj` (ES2022) junto dos campos privados. Decorators: só como leitura e com o rótulo "proposta TC39 / TypeScript", sem tratá-los como padrão da linguagem. |
| **11** | Trocar "browser" por "navegadores evergreen, recursos Baseline amplamente disponíveis". Revisar 11.07/11.08 com `<dialog>` e Popover se fizerem parte do Baseline. Marcar APIs fora do Baseline como extras. |
| **12** | `Promise.withResolvers` (ES2024) e `Promise.try` (ES2025) entram no caminho principal. `AbortSignal.timeout`/`AbortSignal.any` em 12.06/12.08. `Array.fromAsync` (ES2026) em 12.13. Em 12.12, Temporal só se estiver no runtime-alvo; senão, `Date` + `Intl.DateTimeFormat` com nota sobre Temporal. `fetch` global do Node atual nos exemplos de Node. |
| **13** | Fixar a versão estável atual do Vitest no starter baixável e no mini-runner do site. Mostrar `node:test` (nativo do Node) como alternativa e esclarecer 14.03. `Error.isError` e `cause` em 13.10. |
| **14** | 14.04: `require(esm)` (estável nas linhas LTS atuais) muda a conversa CJS↔ESM; ensinar pacotes só ESM e o legado CJS. 14.05: corrigir com **`import.meta.dirname`/`import.meta.filename`** e mostrar `fileURLToPath` como legado. 14.06: `--env-file`/`process.loadEnvFile` nativos. 14.03: `node --watch`, `node --test` e `node --run`. 14.12: Vite na versão atual. ESLint 9+ com flat config. 14.07: refazer a checagem de compatibilidade com o Node principal **e** o mínimo. |
| **15** | TypeScript 7: `strict` já vem ligado por padrão; a atividade 15.07 passa a explicar **o que** o `strict` liga e por que não desligá-lo. `types: []` por padrão: declarar `"types": ["node"]` nos starters de Node. Ensinar a rodar TS: `tsgo`/`tsc --noEmit` para checar e o **type stripping nativo do Node** para executar, com `erasableSyntaxOnly`. Cartões com "TypeScript 7.0 strict; Node.js <alvo>". |
| **16** | Rótulos atualizados. Confirmar que `catch (e: unknown)` reflete `useUnknownInCatchVariables` (parte do `strict`). |
| **17** | 17.09: `enum` e parameter properties **não são sintaxe apagável**, então não rodam com type stripping nem passam com `erasableSyntaxOnly`. Ótimo motivo moderno para preferir objetos `as const`. Classes de TS (a acrescentar) com `erasableSyntaxOnly` em mente. |
| **18** | 18.09: `noUncheckedSideEffectImports` (padrão no 6/7) e `verbatimModuleSyntax` mudam o que acontece com imports só de efeito colateral; atualizar previsão e solução. Revisar exemplos com `paths` sem `baseUrl`. |
| **19** | Sem mudança de semântica (a checagem do 7 é igual à do 6). Usar a velocidade do `tsgo` para rodar type tests de verdade. Medir o custo de tipos complexos com `--extendedDiagnostics`. |
| **20** | Iterator helpers (ES2025) já estão no Node principal: 20.06 deixa de ser opcional. `Iterator.concat` (ES2026) com feature detection se o Node mínimo não tiver. 20.07: `Array.fromAsync` é ES2026, atualizar o texto. 20.10: `Uint8Array.prototype.toBase64/toHex` e `fromBase64/fromHex` (ES2026). `Float16Array` (ES2025) como menção. |
| **21** | `using`/`await using`, `DisposableStack` e `SuppressedError`: confirmar a edição do ECMAScript e o suporte nos dois Node do alvo antes de manter no caminho obrigatório. Rótulo com a versão exata do runtime nos benchmarks: resultados mudam entre 24 e 26. |
| **22** | TypeScript 7: remover `baseUrl`, `outFile`, `moduleResolution: node` e alvos ES5 dos materiais; usar `module/moduleResolution: nodenext` (pacotes Node) ou `bundler` (apps). Explicar que o 7.0 não tem API programática estável e que typescript-eslint/ferramentas de frameworks ainda dependem do 6.x: **compatibilidade de ferramentas vira conteúdo** da migração (22.05). 22.06: Zod e Valibot nas versões estáveis atuais. 22.08: publicar pacote ESM com `exports` e `types`, testado nos dois Node do alvo. |
| **23** | Capstone com `package.json` fixando o ambiente-alvo (`engines`, `.nvmrc`/`.node-version`, `packageManager`) e CI rodando a matriz Node principal + mínimo. Observabilidade com OpenTelemetry na versão estável. Atividade de manutenção: "atualizar o projeto de Node 24 para 26 / TS 6 para 7 sem regressão", que é exatamente a tarefa sênior que esta seção descreve. |

### 8.4 Infraestrutura do próprio site

- `package.json`: `typescript` → 6.0 (verificador embutido) + `@typescript/native-preview`/TS 7 nos scripts de checagem; `@types/node` na linha do Node principal; `engines.node` igual ao mínimo do ambiente-alvo.
- Executores: o runner genérico e os interpretadores 01/03 informam a edição do ECMAScript que suportam, e há uma suíte que roda cada solução de referência no Node mínimo e no principal.
- Build do currículo: validar a matriz de recursos (seção 8.2, itens 1–2) e reprovar rótulos de runtime fora do padrão.
- Reavaliação agendada: junho (nova edição do ECMAScript) e outubro (troca de LTS do Node).

### 8.5 Ordem de execução

A ordem das fases de versão foi incorporada ao plano por fases: a fase 1 de versões está na Fase 1 do plano, a fase 2 na Fase 3, a fase 3 na Fase 7, a fase 4 na Fase 6 e a fase 5 na Fase 10.

---

## Fechamento do plano de correções (2026-10-11)

Este fechamento registra o estado final do plano de correções curriculares de 09/10/2026 (13 tarefas) em relação à sua especificação. Os dois arquivos foram excluídos em 14/10/2026 depois de incorporados ao plano mestre, fases 37 a 40. Os números foram medidos em 11/10/2026 pelo script somente leitura `output/learning-execution/task-13-docs-counts.mjs` (saída em `task-13-docs-counts.json`). As afirmações marcadas "(antes)" nas seções anteriores são mantidas como histórico.

### Contagens por etapa

Base: `public/course-catalog.json` (254 atividades) e `public/course-assessments.json` (180 entradas de avaliação).

Legenda: **Aval.** = com entrada de avaliação; **Comp.** = com teste comportamental; **Tipos** = com checagem de tipos (`types`, `typeEntryPath`, `contractTypeFiles` ou `expectedDiagnostics`); **Mut.** = entradas em `mutantDirs`; **Transf.** = transferência independente; **Rubr.** = ambiente `rubric`; **Local** = ambiente `local`; **Arestas (ativ.)** = arestas `requires` (atividades com ao menos uma); **Dicas** = com `hints`; **Isentas** = sem dica genérica, por renderer dedicado (`hintExemption`).

| Etapa | Ativ. | Aval. | Comp. | Tipos | Mut. | Transf. | Rubr. | Local | Arestas (ativ.) | Dicas | Isentas |
|---|---|---|---|---|---|---|---|---|---|---|---|
| D | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 (0) | 0 | 5 |
| 00 | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 10 (7) | 0 | 9 |
| 01 | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 11 (8) | 9 | 0 |
| 02 | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 30 (12) | 0 | 12 |
| 03 | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 22 (9) | 0 | 9 |
| 04 | 10 | 5 | 5 | 0 | 0 | 0 | 0 | 0 | 10 (10) | 10 | 0 |
| 05 | 11 | 8 | 8 | 0 | 0 | 0 | 0 | 0 | 11 (11) | 11 | 0 |
| 06 | 10 | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 10 (10) | 10 | 0 |
| 07 | 10 | 7 | 7 | 0 | 0 | 0 | 0 | 0 | 20 (10) | 10 | 0 |
| 08 | 8 | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 20 (8) | 8 | 0 |
| 09 | 8 | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 11 (8) | 8 | 0 |
| 10 | 8 | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 19 (8) | 8 | 0 |
| 11 | 14 | 14 | 9 | 0 | 0 | 14 | 5 | 0 | 29 (14) | 14 | 0 |
| 12 | 14 | 14 | 5 | 0 | 0 | 14 | 9 | 0 | 17 (14) | 14 | 0 |
| 13 | 14 | 14 | 6 | 0 | 10 | 14 | 5 | 0 | 16 (14) | 14 | 0 |
| 14 | 13 | 13 | 2 | 0 | 0 | 13 | 8 | 3 | 23 (13) | 13 | 0 |
| 15 | 10 | 10 | 6 | 8 | 6 | 10 | 2 | 0 | 21 (10) | 10 | 0 |
| 16 | 10 | 10 | 7 | 9 | 7 | 10 | 1 | 0 | 18 (10) | 10 | 0 |
| 17 | 9 | 9 | 3 | 5 | 3 | 9 | 4 | 0 | 16 (9) | 9 | 0 |
| 18 | 10 | 10 | 4 | 6 | 4 | 10 | 4 | 0 | 26 (10) | 10 | 0 |
| 19 | 9 | 9 | 2 | 5 | 2 | 9 | 4 | 0 | 27 (9) | 9 | 0 |
| 20 | 10 | 10 | 10 | 0 | 12 | 10 | 0 | 0 | 15 (10) | 10 | 0 |
| 21 | 11 | 11 | 7 | 0 | 12 | 11 | 1 | 3 | 19 (11) | 11 | 0 |
| 22 | 10 | 10 | 4 | 2 | 10 | 10 | 1 | 4 | 28 (10) | 10 | 0 |
| 23 | 11 | 11 | 6 | 0 | 8 | 11 | 3 | 2 | 28 (11) | 11 | 0 |
| **Total** | **254** | **180** | **106** | **35** | **74** | **145** | **47** | **12** | **457 (246)** | **219** | **35** |

Notas:
- Mutantes tipados (`typeContractMutants`, etapas 15–19): 18 (15: 2; 16: 2; 17: 4; 18: 6; 19: 4). `typecheckMutants`: 0 em todo o curso.
- Ambientes (total): javascript 72, node-simulated 37, rubric 47, dom 8, local 12, typescript 4. Nas etapas 11–23, 86 de 145 atividades são executadas automaticamente (JavaScript, DOM, TypeScript ou Node simulado); 47 são rubricas declaradas e 12 são locais declaradas.
- Primers: 23 (inalterado em relação ao apêndice).
- Arquivos de teste comportamental: todos os caminhos da fonte `course-src/assessments.json` existem (0 ausentes).
- Divergência de fonte: 54 atividades têm `mutantDirs`. Em 13.03, 13.07, 13.09 e 13.13 (10 mutantes) a declaração existe só no manifesto público, não na fonte `course-src/assessments.json`. A origem precisa ser conferida no build.

### Estado das oito lacunas originais

As oito lacunas são as da especificação (§1). Estado em 11/10/2026.

| # | Lacuna | Estado | Evidência |
|---|---|---|---|
| 1 | Metadados pedagógicos (pré-requisitos e dicas) | Fechada com limitação | `course-src/learning-metadata.json`: 254 IDs e 457 arestas; o validador rejeita ID desconhecido, autorreferência, ciclo e dependência posterior (`output/learning-execution/task-2-report.md`). Limitação: 35 cartões de D/00/02/03 não têm dica genérica, isentos por renderer dedicado. |
| 2 | Coerência de TypeScript | Fechada com limitação | 15.07 corrigida; `course-src/runtime-baseline.json` separa o curso (TypeScript 7.0) do verificador embutido (6.0; `package.json`: 6.0.3) (`task-2-report.md`). Limitação: o verificador do site não é o 7.x, porque não há API programática estável do 7.x (seção 8.2, item 4). |
| 3 | Verificação e execução no navegador | Fechada com limitação | Gate Chromium final: PASS 42/42 (28 executáveis + 14 rubric/local `unsupported`), 42/42 mutantes mortos com resultado por mutante (36 individuais + 6 pela suíte de tipos do aluno em 22.07), 0 iframes restantes (`output/learning-execution/task-9-chromium-gate-final.json`). Revisão da Tarefa 9: C1–C3, I1, I3, I4 e bloqueantes da re-revisão corrigidos (`task-9-review.md`, `task-9-report.md`). I2 (testes embutidos publicados) é a proteção pretendida: o avaliador ignora a cópia do aluno. Limitações (a), (b) e (f). |
| 4 | Avaliação de 11–23 | Fechada com limitação | 145 de 145 atividades têm entrada de avaliação: 86 executadas automaticamente, 47 rubricas declaradas e 12 locais declaradas (`task-9-report.md`). Limitação (c); rubricas não são corrigidas automaticamente. |
| 5 | Quatro estados de progresso | Fechada com limitação | Reducer compartilhado com `attempted`, `studied`, `verified` e `demonstrated`; migração conservadora; revisão APPROVED (`task-10-review.md`, `task-10-report.md`). Limitação (e). |
| 6 | Dois caminhos de aprendizagem | Fechada com limitação | Revisão da Tarefa 11 (`task-11-review.md`): I-1 a I-4 corrigidos e re-revisados; bloqueantes da re-revisão (B-1 confirmação também em "Aprender este conceito"; B-2 `at` com piso em `currentUpdatedAt`) corrigidos com testes (`scripts/test-learning-mode-confirm.mjs`, `scripts/test-learning-event-queue.mjs`). Chromium: D.01/D.03/D.04 recall → ajuda → recarga mantém `assisted` e a mesma tentativa; "Aprender" → Estudada persiste; rota inalterada; badges no catálogo. Hashes `?v=` atualizados. Limitação (e). |
| 7 | Matriz de compatibilidade | Fechada com limitação | `course-src/feature-matrix.json` e `course-src/runtime-baseline.json`, com `validateRuntimeFeatures` (`task-2-report.md`). Limitações: o piso e o ciclo Node 24/26 dependem de decisão editorial (seção de Node abaixo), e o verificador é o 6.0 (gap 2). |
| 8 | Checkpoints locais e Git | Fechada com limitação | Revisão da Tarefa 12 APPROVED (`task-12-review.md`). Exportação dos 45 elegíveis: 45/45 nos dois modos, medido em 11/10/2026 com `output/learning-execution/export-all-drafts.mjs` (somente leitura). Limitações: `course-src/local-checkpoints.json` não foi criado (o espelho está em `public/local-checkpoints.js`); 23.07 não é verificada automaticamente (exige `npm install` no projeto do aluno) e 14.05 não tem referência; download verificado no Chromium para 21.09 ("Download preparado"); o painel passa o checkpoint declarado ao exportador (teste "enhance hands the declared checkpoint to the exporter"); achado I-1 (exposição pública) fora do diff. |

### Testes e verificações finais

- `npm test` (Node 26.7.0): 735 aprovados, 0 falhas (11/10/2026, execução final).
- `check:curriculum` (Node 26): 254 cartões, 0 erros (medido pelo coordenador, 11/10/2026).
- Gate Chromium: 42/42, 42/42 mutantes mortos (ver gap 3).
- `export-all-drafts.mjs`: 45/45 nos modos padrão e `--as-ui`.
- `npm test` (Node 24.19.0, piso declarado em `engines`): 735 aprovados, 0 falhas; `check:curriculum`: 254 cartões, 0 erros (11/10/2026).

### Limitações conhecidas e decisões em aberto

(a) `public/course-assessments.json` é buscado publicamente e expõe `tests` (109 atividades), `correctFiles` (68) e `mutantDirs`. A correção ocorre no navegador, então o gabarito fica visível ao aluno. **Decisão de produto pendente:** aceitar esse modelo de correção no cliente ou mover a correção para o servidor.

(b) 21.04 implementa somente LRU, mas o briefing menciona TTL. **Decisão editorial pendente** (`task-9-review.md`, I5).

(c) As entradas de teste de 21.05 são determinísticas e publicadas. Por isso, uma tabela de consulta completa até 1500 ainda passaria nos testes publicados.

(d) Versões do executor e do verificador não entram na identidade da tentativa (`task-13-fingerprint-report.md`, pendência 2). O esquema `devpath-assessment-fingerprint/2` invalida evidências antigas. Isso é intencional e precisa ser comunicado aos alunos.

(e) A sincronização de progresso no modo conta (fora de localhost) não foi verificada em navegador real.

(f) O runner DOM em iframe não tem cancelamento preemptivo; há apenas prazo e teardown.

(g) Mutantes de 13.03/13.07/13.09/13.13 não aparecem em `course-src/assessments.json` porque o build os descobre pelos diretórios `course-src/mutants/<id>/` (`course-src/build-public-curriculum.mjs:206`); o diretório é a fonte. Não é divergência.

Outros pontos abertos:
- Tarefa 9: resíduo de C3 (tabela completa em 21.05) e I5 (TTL × LRU em 21.04) são decisões editoriais; M5 parcial e M8 (asserts por substring no snapshot canônico) aceitos.
- Tarefa 12: menores M-2 (13.13 exporta o arquivo de teste já público do starter), M-3 (pacote do checkpoint ignorado em colisão de caminho) e M-5 (checkpoint via global) não tratados; M-1, M-4, M-6, M-7 e M-8 corrigidos.
- `scripts/validate-curriculum-source.mjs` não rejeita ambiente `local` sem `local.commands`; a regra existe apenas no snapshot canônico da Tarefa 9.
- O plano por fases (`docs/planos/2026-10-09-plano-por-fases.md`) não foi atualizado nesta entrega.
## Apêndice — evidências reutilizáveis

Os números deste relatório podem ser recalculados a partir do catálogo:

```powershell
node -e "const c=require('./public/course-catalog.json');const by={};for(const a of c){by[a.stage]=(by[a.stage]||0)+(parseInt(a.duration)||0)};console.log(by)"
```

- Em 09/10/2026: 219 de 254 atividades têm `hints`; 9 têm `requires` (antes; em 11/10/2026 são 246 atividades, com 457 arestas); 23 têm `primers`.
- Executor genérico (antes): `public/course-controller.js` (texto "sem DOM, rede ou APIs do Node.js"; conclusão exige rubrica completa + reflexão ≥ 16 caracteres).
- Política de publicação: `course-src/site_spec.md`, seções 1 e 5 (itens `contract_ready` não devem aparecer como prontos).

---

## Referências

**Aprendizagem**
- IES, *Practice Guide* sobre exemplos resolvidos, resolução de problemas e recuperação espaçada: <https://ies.ed.gov/ncee/wwc/PracticeGuide/1>

**Linguagens e runtimes**
- Ecma International, TC39 (padrão ECMAScript): <https://ecma-international.org/technical-committees/tc39/>
- TypeScript, downloads e versões: <https://www.typescriptlang.org/download/>
- TypeScript, Handbook (asserções de tipo): <https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions>
- Microsoft DevBlogs, anúncio do TypeScript 7.0: <https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/>
- Node.js, calendário de releases (repositório oficial): <https://github.com/nodejs/Release>
- Node.js, não bloquear o event loop: <https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop>

**Observabilidade**
- OpenTelemetry, primer de observabilidade: <https://opentelemetry.io/docs/concepts/observability-primer/>