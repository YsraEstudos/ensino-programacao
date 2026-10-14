# Relatório de auditoria — Lote 7 (16.10 a 19.07, 30 atividades)

Fonte: `lote-7.md` lido integralmente (4388 linhas). Verificação de runtime feita com Node 26 (type stripping) sobre os starters e soluções reais. Achados de tipo marcados "não verificado com tsc" porque o TypeScript não está instalado localmente; são baseados na especificação da linguagem e devem ser confirmados.

Contagem por gravidade: ALTA 6 | MÉDIA 16 | BAIXA 7 | OK 1 (total 30).

Evidências de runtime executadas:
- 16.10: starter falha 2 de 3 testes; solução expõe `e.message` ao usuário.
- 18.07: solução retorna `undefined` (não lança) para `constructor`, `toString`, `__proto__`.
- 18.10: starter falha 2 de 3 testes da própria atividade (`handle`).
- 18.03: testes passam em runtime com a solução, mas o 3º teste chama `get` com chave que o tipo proíbe.
- 19.05: starter executado com Node dá `ReferenceError: on is not defined`.
- 17.08: TTL 0 expira na mesma hora; TTL NaN e Infinity nunca expiram.

---

### 16.10 — Catch recebe unknown  [Gravidade: ALTA]
- **Escrita:**
  - Starter: `catch (e) { return \`Falhou: ${e.message}\`; }` retorna string, mas o prompt e o comentário do starter pedem "relance um novo Error". O starter contradiz o enunciado.
  - `interaction`: "escreva dois casos de throw", mas o starter e os testes usam quatro entradas (Error, string, objeto, null). Correção: "escreva um caso para Error e um para valor não-Error, cada um com a mensagem pública e o cause".
  - `review` pergunta sobre `stack` (contexto de chamadas), tema que não aparece na atividade (unknown, narrowing, cause). Correção: perguntar "Qual propriedade de Error guarda o valor original quando relançado com `{ cause }`?" (resposta: `cause`).
- **Lógica:**
  - Starter reprova 2 de 3 testes (verificado): `Error vira mensagem e preserva cause` e `valores não Error...`.
  - Solução vaza mensagem interna ao usuário (verificado com `new Error('SELECT * FROM pedidos; senha=123')` → `Falhou: SELECT * FROM pedidos; senha=123`). Isso contradiz o `mental_model` ("mantenha separadas a mensagem apresentada ao usuário e a informação técnica") e o termo "mensagem pública segura".
  - Contrato oculto: o teste exige a string exata `'Falhou: Não foi possível salvar o pedido.'` para valores não-Error, e o prefixo `Falhou: ` para todos. O prompt diz "a mensagem pública escolhida", o que não pode ser adivinhado.
  - `new Error('')` produz `Falhou: ` (mensagem vazia). A borda do `transfer` pede fallback, mas nenhum teste cobre isso (verificado).
  - Correção proposta: no prompt, fixar a mensagem pública: "Para qualquer falha, a mensagem pública é `Não foi possível salvar o pedido.`; nunca exponha `message` interna; relance `new Error('Falhou: Não foi possível salvar o pedido.', { cause: original })`." Ajustar o teste 2 para esperar essa mensagem fixa e acrescentar: `new Error('SELECT...')` não deve aparecer em `observed.message`; `new Error('')` produz a mesma mensagem fixa.
- **Novo vs planos:** NOVO (contrato oculto de mensagem; vazamento de `message`; starter que não relança; `review` fora do tema). CONFIRMA a rubrica genérica no topo ("Rode regressões antigas e novos casos; avalie mudança localizada.").

### 16.06 — as const derivado  [Gravidade: ALTA]
- **Escrita:**
  - Domínio errado. `objective`, `firstResponse.action`, `preparation.introduction`, `predictionGuide`, `primers`, `edgeCases`, `examples` e `checks` falam de `STATUS`, `Status`, `'idle'`, `'loading'`, `'done'`, mas o starter define `NIVEIS = ["leitor","editor","admin"]` e `type Nivel`. Parece texto copiado de outra atividade.
  - Ex.: `"Preveja o tipo de STATUS[0] e o resultado do push em tsc..."`. Correção: "Preveja o tipo de NIVEIS[0] depois de adicionar `as const` e o resultado de `NIVEIS.push('dono')` em tsc, antes de observar o array runtime."
  - `examples`: `"'idle' atribui a Status"` não corresponde ao starter. Trocar por `const ok: Nivel = "editor"` e `const fora: Nivel = "dono"`.
  - `primers` usa `(typeof STATUS)[number]`, e a nota diz que indexed access "é aprofundado na etapa 18", mas a atividade (etapa 16) já exige `[number]`.
- **Lógica:**
  - `autoTested: true`, mas não há `tests` nem `solution` no `assessment`; só `checks: ["types","mutation"]` e `mutants: []`. Não existe referência para validar a atividade.
  - Correção: adicionar solução `export const NIVEIS = ["leitor","editor","admin"] as const; export type Nivel = (typeof NIVEIS)[number];` e um teste que verifique `Object.isFrozen(NIVEIS) === false` em runtime e uma linha `// @ts-expect-error` para `"dono"` (não verificado com tsc).
- **Novo vs planos:** NOVO (domínio STATUS/NIVEIS inconsistente; autoTested sem testes nem solução; forward reference de indexed access). CONFIRMA a falta de teste automatizado (parte do total de 144).

### 16.07 — Mudança de requisito  [Gravidade: MÉDIA]
- **Escrita:**
  - Título "Mudanca de requisito" sem acento (no starter aparece "Mudança").
  - `review`: distratores "Para permitir que os handlers antigos escolham qualquer variante automaticamente." e "Para remover a nova alternativa dos tipos..." são fáceis de descartar. Trocar por distratores plausíveis, como "Para que o compilador gere o caso default automaticamente".
  - Hint 1 truncada: termina em "confirme que height ausente " (texto cortado).
  - Hint 2 com ponto duplo: "...falha no typecheck..".
- **Lógica:**
  - O prompt exige "confirme que height ausente é rejeitado no typecheck", mas os testes são só de runtime. Nenhum teste verifica o erro de tipo (não verificado com tsc).
  - Correção: no arquivo de teste, acrescentar `// @ts-expect-error` antes de `area({ kind: "triangle", base: 6 });`, e um teste de runtime `area({kind:"triangle",base:6,height:4}) === 12`.
  - Os valores esperados (9 para base 6 e height 3; 12 para 6 e 4; Math.PI para circle raio 1) conferem com a fórmula.
- **Novo vs planos:** NOVO (requisito de tipo sem teste). CONFIRMA rubrica genérica no topo.

### 16.08 — Microprojeto - máquina de estados  [Gravidade: MÉDIA]
- **Escrita:**
  - Starter: `reducer` é só comentário, sem `return`; o arquivo não compila como entregue (TS2366, esperado em stub, mas o comentário não avisa). Correção: "// implemente; retorne o próximo Estado".
  - Starter: "devolva o mesmo estado (documente no fim do arquivo)", mas não há lugar para documentar no fim do arquivo.
  - `interaction`: "percorra as transições em linhas sequenciais com Tab para enviar" não é compreensível.
  - `review`: "quais dependem de validar um número recebido" é frase truncada/ambígua.
- **Lógica:**
  - Os testes não cobrem transições inválidas além de `progress` em `idle`. Um reducer que aceita `start` a partir de `idle`, ou `resolve` a partir de `selecting`, passa em todos os testes. `fail` não é testado.
  - Conflito: o `transfer` pede "progresso 100 não deve ser aceito como upload ainda ativo se a regra o reserva ao sucesso", enquanto o teste "fronteiras são inclusivas" fixa `progress: 100` como válido em `uploading`.
  - Correção: acrescentar `reducer({status:'idle'},{type:'start'})` deve devolver o mesmo objeto; `reducer({status:'selecting'},{type:'resolve',url:'/x'})` idem; `reducer({status:'uploading',progress:5},{type:'fail',message:'x'})` deve ir para `error`.
- **Novo vs planos:** NOVO (testes fracos de transição; conflito entre transfer e teste de fronteira). CONFIRMA rubrica genérica ("Rode critérios comportamentais e revisão humana...").

### 17.01 — Generic ou union?  [Gravidade: MÉDIA]
- **Escrita:**
  - `interaction` e `firstResponse`/`objective` falam de "cartões de assinatura" e "opções do cartão", mas não existe cartão: o starter é um `.ts` com 8 assinaturas em comentário.
  - `firstResponse.action` pede "Invente uma API...", mas o prompt pede classificar "as APIs do starter". Duas tarefas diferentes.
  - Trecho de `stageBridge` com `\r\n` literal no texto (quebra de linha Windows gravada no conteúdo; inofensivo, mas poluí o JSON).
- **Lógica:**
  - Sem `tests` nem `solution`; só rubrica. O gabarito completo não existe. Gabarito proposto: `identity` genérica; `parseStatus` union; `first` genérica; `area` concreta; `pair` genérica (K, V); `log` concreta; `getById` concreta (`Usuario[]` fixo, sem T); `selectKey` genérica (`K extends keyof T`).
  - A rubrica agrupa `getById` como caso de "relação de tipos", mas sem T não há relação a preservar. Corrigir a rubrica.
- **Novo vs planos:** NOVO (cartões vs starter; gabarito incompleto). CONFIRMA rubrica sem teste.

### 17.02 — Parsons de repository  [Gravidade: MÉDIA]
- **Escrita:**
  - Starter: "complete as lacunas `___`", mas o arquivo não tem nenhum `___`. Correção: remover a instrução ou criar as lacunas.
  - Starter: "Reordene os blocos (helpers antes do Repository)", mas `Repository` não usa `wrap` nem `pair` em nenhum ponto. A ordem exigida não tem motivo; a `interaction` afirma que "os blocos independentes não exigem ordem entre si".
  - `#itens` (campo privado com `#`) aparece aqui, e só é explicado no primer de 17.08.
- **Lógica:**
  - Prompt pede "mantenha o ID como papel de tipo separado", mas o starter fixa `get(id: Entity["id"])` (string) sem parâmetro de tipo para ID. A bridge de 17.01 usa `Repository<T extends {id:ID}, ID>`. As duas etapas ensinam formas diferentes de repositório.
  - Sem testes; só rubrica. Não há como validar "chave string" e "busca ausente" automaticamente.
  - Correção: definir a forma de ID (parâmetro de tipo `ID extends string` ou fixo) e acrescentar um arquivo de teste com `repo.get('u9') === undefined`.
- **Novo vs planos:** NOVO (lacunas inexistentes; ID não é papel separado). CONFIRMA o plano "sintaxe de classe TS só em 17.08": 17.02 já usa `class Repository<T extends Entity>` e `#itens` antes desse primer.

### 17.03 — Complete callbacks  [Gravidade: MÉDIA]
- **Escrita:**
  - Rubrica/scoring "Avalie somente as decisões retiradas e execute o arquivo completo." não é compreensível ("decisões retiradas"). Correção: "Avalie a assinatura de `map` e `filter` e confira a execução do arquivo completo."
  - Termo "Predicate boolean comum" não é explicado (type guard `x is T`).
- **Lógica:**
  - Os testes só verificam runtime. Uma implementação com `any` passa nos três testes: `export function map(xs: readonly any[], fn: (x: any, index: number) => any): any[]`. O enunciado proíbe `any`, mas nada verifica isso.
  - Correção: acrescentar um teste de tipo com `Expect<Equal<ReturnType<typeof map<number,string>>, string[]>>` ou usar `// @ts-expect-error` para `const bad: number[] = map([1,2], n => String(n));` (não verificado com tsc).
- **Novo vs planos:** NOVO (ausência de teste de tipo; `any` passa). CONFIRMA rubrica genérica.

### 17.04 — Constraint excessiva  [Gravidade: MÉDIA]
- **Escrita:** título e enunciado coerentes. Nada grave.
- **Lógica:**
  - A solução reescreve a linha do starter `export const achado = buscarPorId([{ id: "x", nome: "A" }], "x");` para `buscarPorId(objeto?[objeto]:[], "x")`. A solução não corresponde ao arquivo que o aluno recebe; a expressão é artificial. Correção: manter a linha original.
  - O objetivo central é que `primeiro([1,2])` tenha tipo `number | undefined`, mas nada verifica isso. Uma versão `primeiro(xs: any[]): any` passa nos três testes. Correção: acrescentar `Expect<Equal<typeof n, number | undefined>>`.
  - O `transfer` pede `readonly (string | number)[]`, mas a solução usa `T[]` mutável. Corrigir o transfer ou a solução.
- **Novo vs planos:** NOVO (solução difere do starter; sem teste de tipo).

### 17.05 — Readonly por contrato  [Gravidade: MÉDIA]
- **Escrita:**
  - `objective` diz "Preveja se ordenar a coleção compilaria", mas o starter e a previsão usam `xs.push(0)`. Corrigir para "se acrescentar um elemento (`push`) compilaria".
- **Lógica:**
  - `autoTested: true` sem `tests`, sem `solution`, `mutants: []`. Nada valida a mudança.
  - Correção: solução `export function soma(xs: readonly number[]): number { ... }` e teste `soma([1,2]) === 3`, `soma([4,7,9] as const) === 20`, `soma([2,3]) === 5`, `soma([]) === 0`.
- **Novo vs planos:** NOVO (autoTested sem testes). CONFIRMA a falta de teste automatizado.

### 17.06 — Overload, union ou generic?  [Gravidade: MÉDIA]
- **Escrita:**
  - `firstResponse` e `objective`: "Escolha uma chamada do trecho..." — não existe "trecho" na atividade.
  - Rubrica: "Justificar o contrato mínimo para filtros sem uma genericidade sem relação (0–3)." O lote não tem filtros nesta atividade; texto copiado de outra (provavelmente 17.03).
  - Prompt pede "oito APIs", mas o starter já entrega a oitava (`ler`) pronta. Dizer explicitamente que a 8 é exemplo.
- **Lógica:**
  - Só rubrica; não há gabarito. A pergunta "quando um generic resolveria a 8?" não é respondida por nenhum material da atividade.
- **Novo vs planos:** NOVO (rubrica com "filtros", objetivo com "trecho").

### 17.07 — Const type parameter  [Gravidade: MÉDIA]
- **Escrita:**
  - Transfer: "explique como recuperar a precisão" de um array já alargado. Não há como recuperar; o `edgeCases` diz exatamente isso ("const generic não recupera literais"). Correção: "explique por que a precisão já perdida não volta e onde declarar o literal para preservá-la".
- **Lógica:**
  - `autoTested: true`, mas sem `tests` e sem `solution`; só `checks: ["types","mutation"]`.
  - Correção: solução `export function defineRoutes<const T extends Record<string, string>>(rotas: T): T { return rotas; }` e teste de tipo para `defineRoutes({ home: "/", sobre: "/sobre" })` (o resultado esperado é com chaves e valores literais; confirmar no editor, pois não verifiquei com tsc).
- **Novo vs planos:** NOVO (autoTested sem testes; transfer pede o impossível).

### 17.08 — Microprojeto - cache genérico  [Gravidade: MÉDIA]
- **Escrita:**
  - Interaction: "o trecho correspondente do output", mas não há output na atividade.
  - Transfer: "Resultado: 7 antes do limite" — o valor 7 nunca foi definido no enunciado; "Borda: uma chave sem expiração continua presente" é impossível, pois `set` exige `ttlMs`.
  - Hint 1 truncada: termina em "Suporte valores a".
  - Hint 2 com ponto duplo: "...has devolve false..".
- **Lógica:**
  - TTL 0 expira imediatamente (verificado: `set('ttl0', 1, 0)` seguido de `get` no mesmo instante devolve `undefined`). A atividade não define isso, e nenhum teste cobre TTL 0.
  - TTL `NaN` e `Infinity` são aceitos e nunca expiram (verificado: `NaN` ainda presente em t=1e12). A validação `ttl < 0` deixa passar esses valores. O enunciado só fala de TTL negativo.
  - Correção: definir a política e testar: `set(k,v,NaN)` e `set(k,v,Infinity)` lançam RangeError (ou aceitam Infinity de forma documentada); definir se `ttl 0` é válido.
  - Os testes visíveis em `cache.test.ts` e os testes ocultos em `assessment.tests` são diferentes; o aluno vê uma versão e é avaliado em outra. Não é erro, mas deve ser documentado.
  - Primer: a explicação de `private`/`#` está correta.
- **Novo vs planos:** NOVO (TTL 0/NaN/Infinity; "chave sem expiração" impossível; "output" inexistente). CONFIRMA rubrica genérica ("Rode critérios comportamentais e revisão humana para decisões abertas.").

### 17.09 — Enum, objeto e código emitido  [Gravidade: BAIXA]
- **Escrita:**
  - Rubrica "Declarar que executor local não prova `node formas.ts` equivalente" é vaga; "executor local" não é definido.
  - Review: distratores absurdos ("Qual forma tem a menor quantidade de caracteres..."). Trocar por opções plausíveis.
  - Prompt pede "alternativas baseadas em valores", mas o starter só traz `enum` e um objeto `as const`.
- **Lógica:**
  - Não há gabarito. Respostas esperadas, com base na semântica do TS: `Numerico` tem reverse mapping (`Numerico[0] === "A"`); `Texto` não tem; `Objeto` vira objeto normal e o alias some. `node formas.ts` falha porque `enum` não é apagável (não verificado com Node neste arquivo; confirmar).
  - Correção: incluir gabarito na rubrica.
- **Novo vs planos:** NOVO (sem gabarito; distratores).

### 18.01 — Derive, não replique  [Gravidade: BAIXA]
- **Escrita:** sem problemas graves. Ponto de atenção: `criarPedido` usa `crypto.randomUUID()` global; a compilação depende de tipos de Node, que não são declarados em lugar algum da atividade.
- **Lógica:** consistente. `UserId` = `User["id"]`, `RouteName` = `keyof typeof routes`, `Pedido` = `ReturnType<typeof criarPedido>`, `Status` = `(typeof STATUS)[number]`. Sem gabarito explícito, só rubrica.
- **Novo vs planos:** NOVO (dependência de tipos de Node não declarada). CONFIRMA rubrica sem teste.

### 18.02 — Parsons de patch  [Gravidade: MÉDIA]
- **Escrita:** o texto explica bem que `Partial` é raso (correto). A `edgeCases` menciona `exactOptionalPropertyTypes`, que só aparece como pergunta em 19.06.
- **Lógica:**
  - Sem `tests` nem `solution`. Os "Casos para conferir" são comentários que nada executa.
  - A ordem correta (B, depois A) não é verificada; `return {...base,...patch}` sem C também passaria sem testes.
  - Política de `undefined` não definida: `update({a:1}, {a: undefined})` produz `a: undefined`. O enunciado não diz se isso é aceito. Correção: definir e testar.
  - Correção: acrescentar teste `const base = {a:1}; const r = update(base, {a:2}); assert.notEqual(r, base); assert.equal(base.a, 1)`.
- **Novo vs planos:** NOVO (política de undefined indefinida; sem teste de não mutação). CONFIRMA rubrica sem teste.

### 18.03 — Complete chave/valor  [Gravidade: MÉDIA]
- **Escrita:**
  - `objective`: "Liste as chaves válidas do seu objeto", sem que o objeto seja definido antes na atividade.
  - O `transfer` usa `noUncheckedIndexedAccess` e a rubrica pede que se descreva essa flag, mas ela só é ensinada em 18.07 (depois). Pré-requisito oculto.
- **Lógica:**
  - VERIFICADO: a solução passa nos 3 testes em runtime. O 3º teste, `get({nome:'Ana'},'id')`, chama `get` com chave que `K extends keyof T` proíbe em tipo. O teste contradiz a lição da própria atividade ("chave ausente não compila").
  - Se o check `types` compilar o arquivo de teste (não sabemos pelos dados), toda solução correta falha; se não compilar, o teste ensina um padrão proibido.
  - Correção: trocar o 3º teste por `// @ts-expect-error` com `get({nome:'Ana'}, 'id')` (não verificado com tsc), mantendo a asserção de runtime com cast explícito e comentário.
- **Novo vs planos:** NOVO (teste que viola o próprio tipo; pré-requisito de flag antes de ser ensinada).

### 18.04 — Utility type inadequado  [Gravidade: MÉDIA]
- **Escrita:**
  - Starter: "com só os campos públicos decididos", mas o enunciado não diz quais são. A forma esperada (`id`, `name`, `avatarUrl?`) só aparece em `examples` e `transfer`.
  - Teste de tipo comentado (`const vazado: ProfileSummary = {...}`), sem execução automatizada.
- **Lógica:**
  - `autoTested: true`, sem `tests` nem `solution`; `checks: ["types","mutation"]`.
  - Correção: acrescentar no prompt a forma esperada `{ id: string; name: string; avatarUrl?: string }`, e um arquivo de teste com `// @ts-expect-error` para `passwordHash` (não verificado com tsc).
- **Novo vs planos:** NOVO (decisão de contrato fora do prompt; autoTested sem testes). CONFIRMA parte da falta de teste.

### 18.05 — Mapa de handlers  [Gravidade: ALTA]
- **Escrita:**
  - Prompt: "Crie uma tabela completa de handlers para uma nova união finita de comandos", mas o starter trabalha com `EventName` (eventos open/close/error). Comandos e eventos são usados como sinônimos sem explicação.
  - Review: distrator "Espalhar decisões de despacho por módulos sem relação..." é obviamente errado.
- **Lógica:**
  - Passo ausente: após a Tarefa 2 (tipar o mapa com `Payloads`), `handle(nome: EventName, payload: unknown)` deixa de compilar, porque `handlers[nome]` vira união de funções com parâmetros incompatíveis (esperado pelo tsc; não verificado). A Tarefa não manda atualizar `handle`, e o aluno fica sem caminho.
  - Correção: acrescentar passo 4: `export function handle<K extends keyof Payloads>(nome: K, payload: Payloads[K]): void { handlers[nome](payload); }` e um caso negativo `handle("close", { id: "x" })` com `@ts-expect-error`.
  - Sem `tests` nem `solution` (autoTested: true).
- **Novo vs planos:** NOVO (passo ausente que quebra o fluxo; "comandos" vs "eventos").

### 18.06 — satisfies vs annotation  [Gravidade: BAIXA]
- **Escrita:** clara; boas previsões.
- **Lógica:**
  - Inconsistência interna: `assessment.environment: "rubric"` e `checks: ["rubric"]`, mas há `tests` com três asserções. Escolher um modo.
  - O teste "paths definidos permanecem distintos" é trivial. Os experimentos negativos (`dispatch("missing")`, `path: 1`) estão só em comentários.
  - Resultado de tipo para `RouteNameAnotada` é `string`, correto.
- **Novo vs planos:** NOVO (inconsistência de modo de avaliação).

### 18.07 — Índice seguro  [Gravidade: ALTA]
- **Escrita:**
  - Título "Indice seguro" sem acento (deveria ser "Índice seguro").
  - `interaction`: "o leitor de tela anuncia valor, escolha feita e resultado" é texto genérico sem relação com a atividade.
- **Lógica:**
  - VERIFICADO: a solução `porId[id]` com `Record<string, User>` retorna `undefined` (não lança RangeError) para chaves herdadas do objeto: `constructor`, `toString`, `__proto__` (todas truthy, e `.nome` dá `undefined`). A atividade trata justamente de "ausência", e o contrato "ausente → RangeError" é violado. `noUncheckedIndexedAccess` não cobre esse caso.
  - Correção: `if (!Object.hasOwn(porId, id)) throw new RangeError("Usuário ausente: " + id);` (ou usar `Map`). Acrescentar teste: `assert.throws(() => nomeDe('constructor'), RangeError)`.
- **Novo vs planos:** NOVO (bug na solução de referência: chaves herdadas).

### 18.08 — Microprojeto - formulario tipado com satisfies  [Gravidade: MÉDIA]
- **Escrita:**
  - Título "formulario" sem acento.
  - O prompt fala em "configuração de filtros" e o `filtros.ts` é um "formulário"; o nome da atividade é "formulário tipado". Unificar a terminologia.
  - `checks.scoring` diz "Rode critérios comportamentais e revisão humana para decisões abertas", mas os testes são automatizados; trecho genérico.
- **Lógica:**
  - A solução não lê `config` em runtime. `min: 0` e `kind` nunca são usados; `nome` e `idade` estão fixos no código. Um teste com `min` alterado para 18 passaria sem nenhuma mudança. A "derivação" existe só no tipo, não na validação.
  - Aceita valores não inteiros: `idade: "1.5"` vira `1.5` (verificado pela semântica de `Number`). Não há regra definida sobre inteiros.
  - Correção: validar com base em `config` (ler `kind` e `min`) e decidir/testar inteiros.
- **Novo vs planos:** NOVO (configuração não usada em runtime; sem regra de inteiro).

### 18.09 — Import de tipo não roda  [Gravidade: BAIXA]
- **Escrita:** o starter diz "(package.json com "type": "module")", mas o pacote não traz `package.json`. Sem ele, `node saida/consumidor.js` depende de detecção automática de módulo; declarar o arquivo ou remover o trecho.
- **Lógica:** as perguntas 1-3 têm resposta clara (`import type` some; `import` de valor fica; `verbatimModuleSyntax` dá erro para import de tipo sem `type`). A pergunta 2 é trivial. A pergunta 4 já traz a resposta na dica. Sem gabarito.
- **Novo vs planos:** NOVO (package.json anunciado e ausente).

### 18.10 — Utility types com propósito  [Gravidade: ALTA]
- **Escrita:**
  - Hint 1 truncada: termina em "preserva uma relaç".
  - Enunciado pede refatorar tipos; a solução também muda comportamento.
- **Lógica:**
  - VERIFICADO: o starter reprova 2 de 3 testes da própria atividade (`handle('ok')` devolve `erro`, não `{ok:true,valor:1}`; `handle('bad')` devolve `erro` com "não é número: bad").
  - A solução reescreve `handle` como `input === "ok" ? {ok:true,valor:1} : {ok:false,erro:input}`, mudando o comportamento sem o enunciado pedir. Um aluno que faz só a refatoração de tipos falha nos testes.
  - Correção: manter o corpo original de `handle` na solução e trocar os testes por `handle('12')` → `{ok:true,valor:12}` e `handle('abc')` → `{ok:false,erro:'não é número: abc'}`.
- **Novo vs planos:** NOVO (testes contradizem o starter e o enunciado; solução altera comportamento).

### 19.01 — Expanda à mão  [Gravidade: BAIXA]
- **Escrita:**
  - O prompt pede "uma atribuição incompatível", mas o exemplo do starter (`{ id: true, name: true }`) é rejeitado por falta de `active`, não por tipo incompatível. Correção: manter o exemplo e reescrever o prompt para "uma atribuição com chave ausente", ou usar um valor incompatível.
  - O `primer` explica o operador ternário e tipos condicionais, mas a atividade é sobre mapped types. Trocar o primer por um sobre `[K in keyof T]`.
- **Lógica:** a expansão `{id: boolean; name: boolean; active: boolean}` e a resposta da review (índice 3) estão corretas. A borda sobre modificadores (mapped type homomórfico preserva `readonly` e `?`) está correta conforme a especificação (não verificado com tsc).
- **Novo vs planos:** NOVO (prompt vs exemplo; primer fora de tema). CONFIRMA "confiança é diagnóstica" sem campo de confiança na interação (ver padrões transversais).

### 19.02 — Parsons condicional  [Gravidade: OK]
- Ordem correta dos blocos (2, 4, 1, 3) produz `ElementOrSelf<T> = T extends readonly (infer U)[] ? U : T`. Os resultados previstos (`string`, `1 | 2`, `number`, `number | boolean`) estão corretos e a pergunta sobre a união (distributividade) é respondível pela bridge de 19.01. Única pendência: sem `tests` nem `solution` (rubrica apenas), o que é parte do padrão do plano.

### 19.03 — Complete infer  [Gravidade: MÉDIA]
- **Escrita:**
  - Starter: `// // @ts-expect-error ___` tem `//` duplicado. Pela sintaxe da diretiva, `@ts-expect-error` precisa começar o comentário; com `//` duplicado, a diretiva não é reconhecida (não verificado com tsc). Correção: `// @ts-expect-error`.
  - `FnResult` usa `any[]`, contrariando a convenção de 17.03 ("sem any") e a forma usada em 19.07 (`(...args: never[]) => unknown`). Correção: `(...args: never[]) => infer ___`.
  - Transfer: "registre FnResult como Promise do objeto e Unwrap como objeto ainda envelopado" — não fica claro a que `Unwrap` é aplicado.
- **Lógica:**
  - Sem `tests` nem `solution`; `autoTested: true`. Correção: solução `Unwrap<T> = T extends Promise<infer U> ? U : T` e `FnResult<T> = T extends (...args: never[]) => infer R ? R : never`, com os type tests já escritos.
- **Novo vs planos:** NOVO (diretiva malformada; any[] vs convenção; autoTested sem testes).

### 19.04 — Distributividade surpresa  [Gravidade: BAIXA]
- **Escrita:** o enunciado pergunta "Qual o requisito do produto pede?", mas em nenhum lugar da atividade há requisito de produto. Pergunta sem base.
- **Lógica:**
  - `WholeString<never>` vale `true` (`[never] extends [string]` é verdadeiro, porque `never` é atribuível a qualquer tipo; não verificado com tsc). A previsão não está no `objective` nem no `transfer`, e é contraintuitiva. Acrescentar a previsão e explicar.
  - `IsString<string|number>` = `boolean` (true | false), que é o bug que o teste mostra; a explicação está correta.
  - Sem `tests` nem `solution`; `autoTested: true`.
- **Novo vs planos:** NOVO (requisito inexistente; previsão não discutida).

### 19.05 — Eventos por template literal  [Gravidade: MÉDIA]
- **Escrita:** nada grave. A `interaction` menciona "Editor TS com painel textual de inferência", que não existe.
- **Lógica:**
  - VERIFICADO: o starter declara `declare function on(...)` (sem implementação). Executado com Node, dá `ReferenceError: on is not defined`. A rubrica manda "Rode typecheck... e runtime onde necessário", o que é impossível como o arquivo está.
  - Correção: trocar `declare` por uma implementação real (ex.: `function on(event: string, listener: (value: unknown) => void): void {}`) ou remover "runtime" da pontuação.
  - Assinatura proposta (não verificado com tsc): `declare function on<K extends keyof Model & string>(event: \`${K}Changed\`, listener: (value: Model[K]) => void): void;`
  - Sem `tests` nem `solution`; `autoTested: true`.
- **Novo vs planos:** NOVO (declare com chamadas em runtime; autoTested sem testes).

### 19.06 — Expandir mapped type  [Gravidade: ALTA]
- **Escrita:**
  - Review, `incorrectFeedback`: "O modificador afeta se a propriedade pode faltar; não apaga automaticamente undefined já incluído em T[K]." Está errado. O Handbook (Mapped Types, "Mapping Modifiers") diz que, em `strictNullChecks`, quando um mapeamento homomórfico remove `?` com `-?`, também remove `undefined` do tipo da propriedade. Exemplo: `Required<{ a?: string }>` é `{ a: string }`.
  - Rubrica: "...sem afirmar que `-?` remove valor undefined (0–2)". Pede para não dizer algo que é verdadeiro. Corrigir.
  - Starter: "Política de undefined: `{ a: undefined, ... }` é aceito? Depende de exactOptionalPropertyTypes?". Com `-?`, `a` é `string`, então `a: undefined` é rejeitado nos dois modos. A pergunta sugere que a resposta depende do modo, o que é enganoso.
- **Lógica:**
  - Correção do feedback: "-? remove a opcionalidade e, em strictNullChecks, também o undefined que a opcionalidade acrescentou a T[K]."
  - Correção da rubrica: "Explica que -? remove opcionalidade e o undefined implícito, e prova com `Expect<Equal<Required<{ a?: string }>, { a: string }>>`."
  - Correção da pergunta: "Com `-?`, `a` é `string`: `{ a: undefined, ... }` é rejeitado em ambos os modos de exactOptionalPropertyTypes. A diferença entre os modos aparece em `a?: string` sem `-?`."
  - Observação: o próprio T1 do starter (`a: string` para `a?: string`) já confirma a remoção de `undefined`, contrariando o feedback. Não verifiquei com tsc neste ambiente.
- **Novo vs planos:** NOVO (erro factual em feedback e rubrica; pergunta enganosa).

### 19.07 — Orcamento de complexidade  [Gravidade: BAIXA]
- **Escrita:**
  - Título "Orcamento" sem acento.
  - Prompt: "utility recursivo de 20 linhas"; o starter tem ~14 linhas.
  - `interaction`: "Revisão de diff textual navegável por teclado" — não há diff.
  - Gênero de "alias": aqui "uma alias recursiva" e "a alias"; em 18.04 "Um alias". Padronizar.
  - Hint 1 truncada: termina em "Não implement".
- **Lógica:**
  - Sem gabarito; só rubrica. Gabarito proposto: `JsonValue` modela dados finitos (válido); `DeepDto` é um transformador com ~14 ramos e só serve a um DTO de 2 campos; recomendação "simplificar" com `type PedidoDto = { id: string; criadoEm: string }` ou "deferir" a transformação genérica.
  - Rejeição de `Date` quando `JsonValue` é exigido: interface sem assinatura de índice não é atribuível a `{[key:string]: JsonValue}` (não verificado com tsc).
- **Novo vs planos:** NOVO (diff boilerplate; sem gabarito; hint truncada).

---

## Padrões transversais do lote

1. Autoavaliação sem teste nem solução: 8 atividades têm `autoTested: true` mas nenhum `tests` nem `solution`: 16.06, 17.05, 17.07, 18.04, 18.05, 19.03, 19.04, 19.05. Nesses casos o check automático não tem referência. CONFIRMA o plano (144 sem teste), com dado concreto deste lote.
2. Cobertura de testes no lote: 11 de 30 têm `tests`; 19 de 30 não têm teste automatizado. Só 16.10, 16.07, 16.08, 17.03, 17.04, 17.08, 18.03, 18.06, 18.07, 18.08 e 18.10 têm testes (18.06 sem solução). CONFIRMA o plano.
3. Rubricas genéricas e textos de pontuação copiados: "Rode typecheck...", "Rode regressões antigas e novos casos...", "Compare resposta registrada antes de Run com sequência/valor previstos; confiança é diagnóstica." (17.01, 19.01, 19.06), "Avalie somente as decisões retiradas..." (17.03, 19.03). O "Run" e a "confiança" não existem nessas atividades. CONFIRMA o plano (rubricas genéricas) e acrescenta o caso de texto de UI copiado.
4. Hints truncadas e pontos duplos: truncadas em 16.07, 17.08, 18.10 e 19.07; pontos duplos em 16.07, 17.02 e 17.08. NOVO.
5. Títulos sem acento: "Mudanca" (16.07), "Indice" (18.07), "formulario" (18.08), "Orcamento" (19.07). NOVO.
6. `interaction` com texto genérico de outro tipo de atividade: "controles de ordenação" (16.10), "trecho correspondente do output" (17.08), "variantes por botão" (19.04), "painel textual de inferência" (19.05), "diff textual" (19.07), "cartões" (17.01). NOVO.
7. Pré-requisitos ocultos NOVOS: `#campo` em 17.02 (explicado só em 17.08); `noUncheckedIndexedAccess` no transfer de 18.03 (ensinado em 18.07); `exactOptionalPropertyTypes` na borda de 18.02 (ensinado só como pergunta em 19.06); opção `{ cause }` de `Error` em 16.10 (sem explicação); indexed access `[number]` em 16.06 (primer remete à etapa 18); `any[]` em 19.03 contra a convenção de 17.03. CONFIRMA o plano quanto à "sintaxe de classe TS só em 17.08": 17.02 já usa classe genérica com `#`.
8. Distratores de review fracos: 17.09, 18.05, 16.07 (opções absurdas). BAIXA.
9. Termo "alias" com gênero inconsistente entre atividades (um/uma). BAIXA.

---

## Top 5 do lote

1. **19.06 (ALTA):** o feedback da review e a rubrica afirmam que `-?` não remove `undefined`, o que contraria o Handbook; a pergunta sobre `exactOptionalPropertyTypes` também induz a erro. Corrigir feedback, rubrica e pergunta conforme a seção 19.06.
2. **18.10 (ALTA):** os testes reprovam o starter (2 de 3, verificado) e a solução muda o comportamento de `handle`. Manter o corpo original e trocar os testes por `handle('12')` e `handle('abc')`.
3. **16.10 (ALTA):** o starter retorna em vez de relançar; o teste exige uma mensagem fixa que o enunciado não descreve; a solução expõe `e.message` ao usuário (verificado com texto de SQL). Fixar a mensagem pública no prompt e no teste; o cause continua no erro relançado.
4. **18.07 (ALTA):** a solução de referência retorna `undefined` para `constructor`, `toString` e `__proto__` em vez de RangeError (verificado). Usar `Object.hasOwn(porId, id)` e acrescentar teste.
5. **18.05 (ALTA):** após a Tarefa 2, `handle` deixa de compilar e nenhuma etapa manda corrigi-lo; além disso o texto fala em "comandos" e o starter em "eventos". Acrescentar o passo com a assinatura genérica de `handle` (não verificado com tsc) e unificar o termo.

Próximas em ordem de prioridade: 16.06 (domínio STATUS/Status copiado de outra atividade, sem solução) e 19.05 (`declare` impede a execução, verificado com ReferenceError).
