# Relatório de auditoria — Lote 8 (19.08 a 22.07, 30 atividades)

Fonte: `lote-8.md` (30 atividades em JSON). Briefing: `brief.md`.
Contagem por gravidade: ALTA 17 · MÉDIA 10 · BAIXA 3 · OK 0.

Padrão sistêmico principal: em 15 atividades, o `assessment.tests` importa nomes (ou assinaturas) que o `starterFiles` não exporta e o `prompt` não nomeia. Um aluno que siga o enunciado não passa no teste. Ver item 1 do Top 5.

---

### 19.08 — Microprojeto - DSL de eventos tipada  [Gravidade: MÉDIA]
- **Escrita:** o `prompt` manda "Escreva primeiro teste para evento-payload", mas o starter já traz `emitter.test.ts` completo, e a `objective` pede "Escreva type tests". Correção no prompt: "Complete `emitter.ts`. Os testes em `emitter.test.ts` já cobrem emit e off; acrescente o teste negativo de `on` antes de implementar." O comentário do starter lista `on("priceChanged", (p: {sku:string; price:string}) => {})` como caso a rejeitar, e esse caso não existe no arquivo de teste.
- **Lógica:**
  - `node --test emitter.test.ts` não executa typecheck. Os `// @ts-expect-error` do teste são só comentários para o Node. Os type tests só valem se alguém rodar `tsc`, que o enunciado não manda. Correção: `npx tsc -p tsconfig.json && node --test emitter.test.ts`.
  - Não há teste negativo para `on`. Um `on` com assinatura frouxa passa em todos os testes de runtime. Teste a adicionar: `// @ts-expect-error price precisa ser number` antes de `emitter.on("priceChanged", (p: { sku: string; price: string }) => {});`.
  - O `tsconfig.json` usa `"types": ["node"]`, mas `package.json` não declara `@types/node` e o lock não o contém. Sem essa dependência o typecheck falha. Correção: incluir `devDependencies` com `@types/node` ou explicitar a instalação.
- **Novo vs planos:** NOVO (escrita e lógica).

### 19.09 — IDs nominais por convenção  [Gravidade: MÉDIA]
- **Escrita:** o `transfer` contradiz o próprio enunciado. Diz "Aceite `u-42` e `inv-8`", mas a solução usa `/^u\d+$/` e não existe `InvoiceId` na atividade. Correção: "Aceite `u42` e `o8`; rejeite `o42` em `makeUserId` e `u42` em `makeOrderId`; rejeite string vazia".
- **Escrita (menor):** `makeUserId` e `makeOrderId` têm tipo de retorno `UserId`/`OrderId` e corpo vazio. Com `strict` isso gera erro de tipo no starter. É um stub, mas o comentário não avisa.
- **Lógica:** a validação de `makeUserId` não tem âncora testada. O teste só usa `'o12'` e `'u'`. `/^u\d+/` (sem `$`) passa em todos os testes e aceita `'u12abc'`. Teste a adicionar: `assert.throws(() => makeUserId('u12x'), RangeError)`. O caso de string vazia, exigido pelo `transfer`, também não é testado.
- **Lógica (menor):** `assert.equal(typeof order, 'string')` é sempre verdadeiro com brand. Não prova nada sobre `makeOrderId`.
- **Novo vs planos:** NOVO. Rubrica genérica "Rode typecheck..." CONFIRMA (rubrica genérica).

### 20.01 — Protocolo iterável  [Gravidade: ALTA]
- **Escrita:**
  - A tabela de previsão tem 3 linhas, mas o starter faz 4 chamadas a `next()` (a 4ª acontece na segunda volta). Correção: acrescentar linha "4 | done:true | — | não (segunda volta, zero elementos)".
  - O `stageBridge` afirma que `Iterator.concat` é "ECMAScript 2026". Não verifiquei esse status. Confirmar antes de publicar.
  - O hint 2 termina com ".." (duplo ponto).
- **Lógica:**
  - Contrato oculto. O teste faz `const{percorrer}=await import('./protocolo.js')` e espera `{primeira, depois, segunda, chamadas}`. O starter não exporta `percorrer`, não tem função e não retorna nada. O enunciado não cita o nome. Correção: exportar `percorrer()` no starter com esse shape, ou documentar o nome e o retorno no enunciado.
- **Novo vs planos:** NOVO (contrato oculto, tabela incompleta). Rubrica "Compare estados e ordem..." CONFIRMA (rubrica genérica).

### 20.02 — Parsons generator  [Gravidade: MÉDIA]
- **Escrita:** o `objective` pede "marque se ela vem antes ou depois da recursão", mas o prompt e o Parsons não pedem essa marcação. A tarefa é reordenar blocos. Correção do objective: "Monte `walk` em pré-ordem e explique em que ponto o valor do nó é emitido em relação à recursão". O `firstResponse.action` repete a mesma frase.
- **Lógica:** a rubrica 2 ("primeiro `next` não materializa descendentes") não é testada. O teste chama `it.next()` uma vez e compara o valor. Uma implementação eager passa:
  ```js
  export function* percorrer(t){const out=[];(function go(n){if(n==null)return;out.push(n.value);for(const c of n.children??[])go(c);})(t);yield* out;}
  ```
  Teste a adicionar: um getter em `children` que registra cada acesso. Após o primeiro `next()`, nenhum filho deve ter sido lido.
- **Novo vs planos:** NOVO (objective/prompt; laziness não testada).

### 20.03 — Complete Symbol.iterator  [Gravidade: BAIXA]
- **Escrita:** `checks.scoring` e `rubric` dizem "Avalie somente as decisões retiradas". É jargão de template. Correção: "Avalie as duas decisões: onde fica o cursor e por que o cursor não é compartilhado entre iteradores".
- **Lógica:** a rubrica 2 cita "caso de cinco elementos com páginas de dois" e o `transfer` pede `PaginaIteravel(total, tamanho)`. Nenhum teste cobre isso. Os testes cobrem `Range(2,4)`, `Range(5,4)` e iteradores intercalados em `Range(7,8)`. O mutante `exclusive-end` é morto pelo primeiro teste. Teste a adicionar para a rubrica: `expect([...new Range(1,5)]).toEqual([1,2,3,4,5])`.
- **Novo vs planos:** NOVO.

### 20.04 — Proxy recursivo ruim  [Gravidade: ALTA]
- **Escrita:** o starter define `const base = { get dobro(){ return this.x * 2; } }` (usa `x`). O teste de runtime usa `proxy.dobro` com `this.base*2` e `base:5`. Os dois não coincidem. O enunciado não nomeia `observar`, que é o export que o teste importa. Correção: usar `this.x` nos dois e nomear `observar(target, onRead?)` no enunciado.
- **Lógica:**
  - Contrato oculto. O teste faz `import {observar} from "./proxy.js"`. O starter não tem `observar` nem `export`.
  - A rubrica 3 ("O log registra a chave") não é testada. Teste a adicionar: `const chaves=[]; observar({a:1}, k=>chaves.push(k)).a; expect(chaves).toEqual(['a'])`.
  - A solução exporta `proxyGetter`, que não é testado e usa `this.base` sem `base` definido.
- **Novo vs planos:** NOVO.

### 20.05 — Validador via Proxy  [Gravidade: ALTA]
- **Escrita:**
  - A `explanation.worked_example` fala em "uma escrita em score". O exercício usa `age`.
  - O `transfer` escreve `50.000` e `2,5` como valores de código. Em JavaScript `50.000` é `50` e `2,5` não é número literal. Correção: `50000` e `2.5`.
- **Lógica:**
  - Contrato oculto. O teste importa `validarUser` e `updateUser` de `validador.js`. O starter tem `function updateUser(atual, patch)` sem `export` e nenhum `validarUser`.
  - O teste 2 trava como esperado que `proxy.address.city = 42` seja aceito (`expect(proxy.address.city).toBe(42)`). Isso exige que uma escrita inválida passe. Uma validação profunda correta falharia. Correção: documentar a limitação em comentário, sem exigir o valor 42.
- **Novo vs planos:** NOVO.

### 20.06 — Iterator helpers  [Gravidade: ALTA]
- **Escrita:** o `materials` cita Node 22.0.0, mas o prompt diz para verificar o runtime alvo. Não é erro. A rubrica 1 cita "o caso informa a presença do recurso no Node", que nenhum teste verifica.
- **Lógica:**
  - Contrato oculto. O teste importa `manualPipeline, take, run` de `pipelines.js`. O starter declara `function* manualPipeline` sem `export`, e não tem `take` nem `run`. O nome `take` ainda colide com `Iterator.prototype.take`.
  - Correção: exportar e nomear `manualPipeline`, `take` e `run` no starter e no enunciado, ou remover esses nomes do teste.
- **Novo vs planos:** NOVO.

### 20.07 — Array.fromAsync  [Gravidade: ALTA]
- **Escrita:** o starter imprime `"produziu 1"` e `"for await processou 1"`. A solução e o teste usam `"produziu:1"`, `"processou:1"`, `"entregou:1,2"`. Esses formatos não estão no enunciado. Correção: padronizar no starter.
- **Lógica:**
  - Contrato oculto. O teste importa `source, collectAll, processIncrementally`. O starter não exporta nenhum deles, e `collectAll` no teste recebe `(sourceFactory, events)`, enquanto no starter não recebe argumentos.
  - A rubrica 1 ("o fallback é identificado quando o recurso não existe") não é testada.
  - O starter usa `await` no nível superior de um `.js` sem `package.json` no lote. Depende da detecção automática de módulo do Node. Declarar `"type":"module"` ou usar `.mjs`.
- **Novo vs planos:** NOVO.

### 20.08 — Microprojeto - pipeline lazy  [Gravidade: ALTA]
- **Escrita:**
  - O prompt manda "implemente os generators" e o starter diz "cada etapa é um generator". A solução de referência não usa generators: é um objeto com `next()` manual. O teste não verifica isso. Correção: alinhar o texto com a solução ou o contrário.
  - O `review.correctFeedback` diz "2 é filtrado; o próximo item vira 5". O valor filtrado é 3 (2 mapeado). Correção: "3 (2 mapeado) é filtrado; 4 vira 5 e passa".
  - O `transfer` diz "Fonte começa com um inativo ... quatro pulls". Para 4 pulls a sequência precisa ser inativo, ativo, ativo, ativo. Isso não está declarado. Correção: declarar a sequência completa.
- **Lógica (bugs na solução de referência):**
  - `take` não é posicional. A solução conta as saídas depois de todos os operadores. Para `pipeline([1,2,3,4]).take(2).filter(x=>x>1)` a solução devolve `[2,3]`. Pela ordem declarada, o resultado correto é `[2]`. Teste a adicionar: esse caso.
  - O fechamento não se propaga. O objeto retornado por `[Symbol.iterator]` só tem `next`. Um `break` no `for...of` não chama `return()` na fonte, então o `finally` do produtor não roda. Teste a adicionar: `let fechou=false; function* f(){try{yield 1;yield 2}finally{fechou=true}} for(const x of pipeline(f()).map(x=>x)){break} expect(fechou).toBe(true)`.
  - O builder é mutável. `api` é o mesmo objeto em `map`, `filter` e `take`. `const base=pipeline(src); const a=base.map(f); const b=base.take(1);` faz `a === b === base`, com as duas operações acumuladas. Teste a adicionar: reutilizar `base` em dois ramos.
- **Novo vs planos:** NOVO.

### 20.09 — Stream sob consumidor lento  [Gravidade: ALTA]
- **Escrita:** a `rubric` e o `checks.scoring` falam em "evidência da ferramenta". Não há ferramenta na atividade, só `console.log`. Correção: "Rubrica: hipótese registrada antes da execução, sequência de eventos, conclusão sobre highWaterMark e reprodução".
- **Lógica:**
  - Contrato oculto. O teste importa `criarStream` e `consumirLento`. O starter não exporta nenhum dos dois. `criarStream()` deve devolver `{stream, eventos}`, e nada disso está no enunciado.
  - A rubrica 2 ("relaciona desiredSize e highWaterMark") é testada só por `typeof n === 'number'`. Teste a adicionar: `expect(sizes[0]).toBe(2)`. Com highWaterMark 2 o primeiro `pull` vê `desiredSize` igual a 2, sem depender do scheduler.
  - O starter usa `await` no nível superior de `.js` sem `package.json`. Mesma observação do 20.07.
- **Novo vs planos:** NOVO.

### 20.10 — String vira bytes  [Gravidade: ALTA]
- **Escrita:** o `objective` fala em "letra acentuada escolhida", mas o starter prevê o comprimento de `"ação 😀"` (com emoji). Correção: "Registre a previsão de `text.length` e `bytes.length` para `'ação 😀'`".
- **Lógica:**
  - Contrato oculto. O teste importa `medirTexto` e `decodificar` de `bytes.js`. O starter não define nem exporta esses nomes, e o enunciado não os cita.
  - Teste fraco. `expect(result.byteLength).toBeGreaterThan(result.textLength)` aceita `2 * text.length` (14 > 7). O valor correto é 11. Correção: `expect(medirTexto("ação 😀").byteLength).toBe(11)`.
- **Novo vs planos:** NOVO.

### 21.01 — Qual é o gargalo?  [Gravidade: MÉDIA]
- **Escrita:**
  - O cenário 2 é ambíguo. "2,4 s no fetch" e "80 ms no servidor" podem ser TTFB, download, fila do cliente ou corpo grande. O enunciado não diz qual. Correção: acrescentar medidas, por exemplo "início até primeiro byte = X ms; download = Y ms".
  - O cenário 5 (`readFile` de 2 GB) pode ser I/O, memória ou os dois. O gabarito não define isso.
  - `checks.scoring` diz "antes de Run". Não existe Run neste exercício. É vazamento de instrução de UI.
- **Lógica:** não há assessment automático (`rubric` apenas, `solution: []`). A rubrica depende de revisão humana, sem critério de referência. Duração de 6 min para seis cenários, seis medições e uma pergunta combinada é apertada. Correção: 10 min.
- **Novo vs planos:** starter só `.md` (CONFIRMA, starter só com prosa). "Run" no scoring (CONFIRMA, vazamento de UI). Rubrica genérica "Compare resposta registrada..." (CONFIRMA).

### 21.02 — Parsons de cleanup  [Gravidade: ALTA]
- **Escrita:** o prompt tem 44 caracteres e não segue o template de 4 blocos (CONFIRMA, está na lista dos piores). O starter diz "Reordene os blocos em montar() e desmontar()", mas `montar()` e `desmontar()` não têm parâmetros.
- **Lógica:**
  - Contrato oculto. O teste chama `montar(target, state, click, calls)` e `desmontar(target, state, click, calls)`, com `calls` injetando `setInterval` e `clearInterval`. O starter tem `function montar()` sem parâmetros e sem `export`. Nenhuma injeção é descrita.
  - Correção: declarar a assinatura no starter e no enunciado, ou reescrever o teste usando globais.
  - `setInterval(() => {}, 1000)` mantém o processo Node vivo se o cleanup falhar. Um aluno com ordem errada trava em vez de falhar. Correção: usar `unref()` ou um timeout no teste.
- **Novo vs planos:** CONFIRMA (prompt curto). Contrato oculto NOVO.

### 21.03 — Complete benchmark  [Gravidade: MÉDIA]
- **Escrita:**
  - O starter diz "complete: quantidade par -> média dos dois centrais" e pede `return ___`. O caso ímpar não aparece no enunciado. Correção: "ímpar: `ordenadas[meio]`; par: média de `ordenadas[meio-1]` e `ordenadas[meio]`".
  - O último comentário pergunta "Se fn lançar um erro, o que benchmark deve fazer?". A edgeCase diz "erro propagado com cleanup", mas a solução não tem cleanup. Correção: "propagar; não há recurso a liberar".
- **Lógica:** `mediana` é exportada e o starter anota `mediana([1,9,2,4])` = 3, mas nenhum teste importa `mediana`. Os dois testes de mediana usam 3 e 9 amostras (ímpares). `s[Math.floor(s.length/2)]` (mediana superior) passa em todos os testes. Teste a adicionar: `import {mediana} from './benchmark.js'; expect(mediana([1,9,2,4])).toBe(3)`.
- **Novo vs planos:** CONFIRMA (prompt curto, na lista dos piores). Rubrica genérica "Avalie somente as decisões retiradas..." CONFIRMA.

### 21.04 — Cache sem limite  [Gravidade: MÉDIA]
- **Escrita:** o prompt diz "introduzir política de limite/expiração". Só há LRU; a rubrica 3 diz "nenhuma afirmação de TTL". Correção: "introduzir política LRU com limite". O starter define `memoize` e pede `memoizeLRU(fn, limite = 2)` só em comentário, sem `export`.
- **Lógica:**
  - A rubrica 1 e o `transfer` exigem chave composta `{tenant,locale}` sem colisão, com pares como `('a|b','c')` e `('a','b|c')`. Nem o starter, nem a solução, nem os testes tratam isso. Correção: remover do rubric/transfer ou adicionar o contrato.
  - A rubrica 3 cita `false` como acerto. O teste usa `0` (falsy), mas não `false`. Teste a adicionar: `memoizeLRU(()=>false,2)` com duas leituras e `c === 1`.
- **Novo vs planos:** CONFIRMA (TTL no briefing e LRU nos testes). NOVO (chave composta).

### 21.05 — Worker para CPU  [Gravidade: ALTA]
- **Escrita:**
  - O comentário do starter "Este arquivo roda no executor do site; worker.js e main.js rodam no navegador" é ambíguo. O que é "executor do site"? Correção: "primos.js é módulo comum, importado pelo worker e pela página".
  - O prompt tem 86 caracteres e está na lista dos piores (CONFIRMA).
- **Lógica:**
  - A parte central não é testada. O assessment só importa `contarPrimos`. `worker.js`, `main.js`, `calcular`, `encerrar`, o casamento de IDs, o fallback e a rejeição de pendentes não têm teste nem solução de referência (a `solution` só tem `primos.js`). Correção: extrair o gerenciador de pendentes (`Map` id→resolve/reject) para uma função pura testável e testar a associação de IDs.
  - Contrato oculto. O teste exige `RangeError` para `-1`, `2.5`, `NaN`, `Infinity` e `'10'`. O enunciado não pede validação, e o starter devolve `0` para `-1`. Correção: incluir no enunciado.
- **Novo vs planos:** CONFIRMA (Worker nunca instanciado no teste). Prompt curto CONFIRMA. Contrato oculto NOVO.

### 21.06 — WeakMap cache por objeto  [Gravidade: ALTA]
- **Escrita:** o starter define `metaDe(node)` como função global e `calculate(node)` sem uso claro. A solução tem `criarCache(calcular)`. Esse nome não aparece no starter.
- **Lógica:**
  - Contrato oculto. O teste importa `criarCache` e `cachePorId`. O starter não tem nenhum dos dois.
  - O mutante `weak-id-map` não é morto. O teste não inspeciona o tipo do cache do aluno. O `expect` com `new WeakMap().set('node-1', {})` testa o JavaScript, não o código do aluno. Correção: remover o mutante ou expor o cache para verificação de tipo.
  - A rubrica 1 cita "primitiva é chave inválida", mas o teste só verifica isso no `WeakMap` nativo.
  - Duração de 12 min para COMPARE com código e três perguntas é apertada.
- **Novo vs planos:** NOVO.

### 21.07 — Debounce vs throttle  [Gravidade: ALTA]
- **Escrita:**
  - O prompt diz "simular 100 eventos e medir numero/tempo de chamadas". O starter e o teste simulam 4 eventos (`0, 20, 40, 160`). Também falta acento em "número". Correção: "simular os eventos t=0, 20, 40 e 160 com relógio falso e registrar o instante de cada chamada".
  - A pergunta de borda `Política de borda: um evento exatamente em t=100 dispara no throttle? ___` não tem resposta no enunciado. O teste assume fronteira inclusiva (`>=`). Correção: declarar a política no enunciado.
- **Lógica:**
  - Harness incompatível. `simular` passa `relogio = {agora, setTimeout, clearTimeout, avancarAte}`. A solução de referência lê `{set, clear}` em `debounce` e `{now}` em `throttle`. Com o harness do starter, a solução usa `setTimeout` e `Date.now` reais. O resultado esperado `[140,260]` e `[0,160]` não é reproduzido. Correção: escolher um contrato e propagar para solução e teste.
  - Contrato oculto. O teste chama `d.cancel()`, que não aparece no starter nem no enunciado. A edgeCase fala em "cancel/flush se expostos", sem definir.
  - A rubrica 1 cita "os testes ... o último valor do autosave". Isso é do `transfer`, e nenhum teste de autosave existe.
- **Novo vs planos:** NOVO.

### 21.08 — using / await using  [Gravidade: ALTA]
- **Escrita:**
  - O prompt manda "criar AsyncDisposable para await using". `AsyncDisposable` não é global. O nome correto é o símbolo `Symbol.asyncDispose`.
  - O prompt tem "descartavel" e "didatico" sem acento.
  - O starter afirma "Node.js 24 suporta `using`". Não verifiquei; confirmar antes de publicar.
- **Lógica:**
  - A solução de referência não passa no próprio assessment. O teste importa `usarRecursos` de `./recurso.js` e checa LIFO após falha e `asyncDispose` aguardado. A solução é `native-using.mjs`, que exporta só `executar()`. O `native-using.test.mjs` da solução espera outro log. Há dois contratos diferentes.
  - `usarRecursos` não aparece no starter nem no enunciado. O starter pede `processarComUsing()` sem parâmetros.
  - `mutants: []`, então a rubrica "a mudança é localizada" não tem mutante de referência.
  - Correção: nomear `usarRecursos(recursos, corpo)` no enunciado e no starter, e fazer a solução exportá-la.
- **Novo vs planos:** NOVO.

### 21.09 — Microprojeto - laboratório de performance  [Gravidade: ALTA]
- **Escrita:**
  - O `objective` diz "Esboce", mas o prompt diz "Construir página" e o projeto tem 95 min. Escolher um.
  - O prompt diz "registra resultados", sem dizer onde (tabela, `localStorage`, arquivo).
- **Lógica:**
  - `ReferenceError` na página. A solução chama `comparar(...)` dentro de `montarLaboratorio`, mas `lab.js` exporta só `somaComReduce`, `somaComFor`, `medir` e `montarLaboratorio`. Ao clicar em Medir, `button.disabled=true` roda antes do erro, e o botão fica desabilitado.
  - Mediana errada para n par. `s[Math.floor(s.length/2)]` devolve a mediana superior: `[1,2,3,4]` dá `3`, quando deveria dar `2.5`. Isso contradiz a regra do 21.03. Correção: reusar a lógica do 21.03.
  - Defaults divergentes. O starter tem `{warmups=5, runs=15}`. A solução tem `{runs=5, warmups=1}`.
  - Contrato oculto. O teste passa `now` injetado e lê `r.samples`. O starter não tem `now` e não nomeia `samples`.
  - O teste "report has fixed sample count and null when memory absent" não verifica memória nenhuma. Correção: `expect(r.memory).toBeNull()` ou renomear.
- **Novo vs planos:** NOVO.

### 21.10 — Transferir não é copiar  [Gravidade: MÉDIA]
- **Escrita:** o `objective` e o `prompt` pedem o byteLength "do worker", mas o starter é local e não tem `worker.js`. O comentário "Experimento local com worker: postMessage(...)" não traz o arquivo. Correção: fornecer o worker (três linhas) ou declarar a parte do worker como opcional.
- **Lógica:**
  - A rubrica 2 diz "8 bytes no destino", mas o `transfer` usa ArrayBuffer de 32 bytes. Alinhar.
  - `assessment.checks` é só `local` e não há teste executável. A solução `experimentar()` não é chamada por nada.
  - A rubrica 3 ("Não chama transfer de compartilhamento") não tem verificação.
- **Novo vs planos:** NOVO.

### 21.11 — Erro durante descarte  [Gravidade: BAIXA]
- **Escrita:**
  - `checks.scoring` e `rubric` dizem "antes de Run". Vazamento de UI, sem Run no exercício (CONFIRMA).
  - O `probe.mjs` do starter tem só `export {};`. Não tem função nem uso.
- **Lógica:**
  - `descarte.js` usa `await` no nível superior sem `"type":"module"`. Depende da detecção automática de módulo do Node. Correção: usar `.mjs` como o `probe.mjs`.
  - A rubrica não é verificável (sem teste). Duração de 6 min para duas cenas, `Promise.any` e duas perguntas é apertada.
- **Novo vs planos:** CONFIRMA (vazamento de "Run" e rubrica genérica). Resto NOVO.

### 22.01 — Runtime vs declaration  [Gravidade: BAIXA]
- **Escrita:**
  - Prompt de 72 caracteres, na lista dos piores (CONFIRMA). "mentiras do tipo" é coloquial.
  - A rubrica 1 cita "Demonstra Promise e valores ana/null em chamada real". O starter só chama com `"u9"` (null). `"ana"` nunca aparece no experimento. Correção: chamar também `buscarApelido("u1")`.
- **Lógica:** o assessment é `local` sem teste executável. A solução de referência está correta (`Promise<string|null>`, `await` e `?.`). O starter não tem `tsconfig`, então "Compila sem erros" depende de uma configuração não fornecida.
- **Novo vs planos:** CONFIRMA (prompt curto). Demais NOVO.

### 22.02 — Parsons de package types  [Gravidade: MÉDIA]
- **Escrita:**
  - Prompt de 49 caracteres, na lista dos piores (CONFIRMA).
  - O `transfer` escreve `npm pack --dry-run` e depois "instalar archive". `--dry-run` não gera o `.tgz`. Correção: `npm pack` (sem `--dry-run`) para gerar o arquivo.
  - O enunciado diz "Um bloco aponta para um arquivo que não existe: deixe-o de fora", mas `[E] "types": "./dist/index.d.ts"` aponta para um arquivo que existe depois do build. A regra fica ambígua.
- **Lógica:**
  - O bloco `[C]` usa `"build": "tsc -p tsconfig.build.json"`. A solução usa `"build": "node scripts/build.mjs"`. Não são o mesmo script.
  - A solução remove `"files": ["dist"]` do starter, e o pacote passa a publicar tudo. Manter `files`.
  - A solução adiciona `typescript: "6.0.3"` em `devDependencies`, sem lockfile que o fixe. Verificar a versão.
- **Novo vs planos:** CONFIRMA (prompt curto, na lista dos piores). Resto NOVO.

### 22.03 — Complete declaração  [Gravidade: MÉDIA]
- **Escrita:** o starter não tem `tsconfig.json`, mas a solução tem. O enunciado não diz como rodar o typecheck. Correção: fornecer o `tsconfig.json`.
- **Lógica:**
  - O `transfer` pede "texto malformado como erro". O `parse` de referência aceita `''` e `'   '` como `{ok:true, value:0}`, porque `Number('') === 0`. Teste a adicionar: `expect(parse('').ok).toBe(false)`, com a regra explícita no enunciado.
  - Bom: o teste de runtime cobre `parse(10)` (TypeError), `on` e o removedor idempotente.
- **Novo vs planos:** NOVO.

### 22.04 — Augmentation perigosa  [Gravidade: ALTA]
- **Escrita:** a rubrica 2 cita "acentos" e a `rubric` do assessment repete o tema. A atividade não trata acentos. A rubrica foi copiada do `transfer` (`slug`). Correção: "Os testes cobrem primeiro item, array vazio e `migrar`; confirmam que `Array.prototype` e `for...in` não mudaram".
- **Lógica:**
  - Contrato oculto. O teste importa `first` e `migrar`. O enunciado nomeia só `first`. `migrar` não aparece no starter.
  - Correção: nomear `migrar` no enunciado ou remover o teste.
- **Novo vs planos:** NOVO.

### 22.05 — Plano de migração  [Gravidade: ALTA]
- **Escrita:** o `plano.md` manda rodar `tsc --noEmit`, mas o starter não traz `tsconfig.json`. A tabela do plano é descrita, não fornecida.
- **Lógica:**
  - Contratos conflitantes. O starter define `totalDosPedidos(textos)`, que soma `total` de `{id,total}`. O assessment importa `executar` de `a.js` e espera `executar('{"quantidade":3,"preco":5}') === 15`, com `quantidade*preco`. A solução segue o assessment. Quem seguir o starter não passa. Correção: escolher um contrato e propagar para starter, plano e `transfer` (que usa 3 × 5).
  - A solução valida só `quantidade`. `{"quantidade":3}` (sem `preco`) passa e devolve `NaN`. A rubrica 2 pede validação do JSON externo. Teste a adicionar: `expect(()=>executar('{"quantidade":3}')).toThrow(TypeError)`.
  - Windows. `a.js` usa `import.meta.url === new URL(process.argv[1], 'file://').href`. No Windows `process.argv[1]` tem letra de drive e a comparação quebra. Correção: `pathToFileURL(process.argv[1]).href`.
- **Novo vs planos:** NOVO.

### 22.06 — Guard manual -> schema  [Gravidade: MÉDIA]
- **Escrita:** o prompt pede comparar com Zod ou Valibot e "instalar". O `transfer` diz "schema existente já declarado no projeto" e "não instalar biblioteca implicitamente". São instruções opostas. Alinhar.
- **Lógica:**
  - O assessment testa só o guard. A comparação com schema (mensagens, inferência, bundle) não tem teste nem gabarito. A rubrica 3 não tem critério verificável.
  - Duração de 12 min para instalar a biblioteca, escrever o schema e comparar mensagens, tipos e custo de bundle é irrealista. Correção: 25 min.
- **Novo vs planos:** NOVO.

### 22.07 — Type test de pacote  [Gravidade: ALTA]
- **Escrita:**
  - O `transfer` tem `files: [{path:"type-tests.ts", content:"Crie asserções de consumidor ..."}]`. O conteúdo é uma instrução em prosa, não código TypeScript. O arquivo ficaria com texto solto.
  - A `solution` tem um `README.md` em inglês com a seção "Transferência independente" duplicada (em português e em inglês). O resto do lote está em português.
  - Rubrica sem acentos: "Mudancas acidentais no contrato sao detectadas". Prompt: "superficie publica".
- **Lógica:**
  - Não existe suíte de referência. A solução tem só `index.d.ts` e `README.md`. O README diz "Compile `tipos.test.ts`", mas o arquivo não está na solução.
  - Os seis mutantes (`optional-baseurl`, `overlapping-result`, `parse-any`, `parse-unknown`, `wide-route`, `wrong-result-shape`) não têm arquivos. A rubrica "cada mutação semântica falha no caminho do teste do aluno" não tem como ser verificada.
  - Correção: publicar a suíte de referência e os arquivos dos mutantes; manter o README em português e uma única seção de transferência.
- **Novo vs planos:** NOVO.

---

## Top 5 do lote

1. **Contrato oculto em 15 atividades (sistêmico).** Os testes importam nomes ou assinaturas que o starter não exporta e o enunciado não cita: 20.01 (`percorrer`), 20.04 (`observar`), 20.05 (`validarUser`, `updateUser`), 20.06 (`manualPipeline`, `take`, `run`), 20.07 (`source`, `collectAll`, `processIncrementally`), 20.09 (`criarStream`, `consumirLento`), 20.10 (`medirTexto`, `decodificar`), 21.02 (`montar(alvo, estado, aoClicar, api)`), 21.05 (RangeError), 21.06 (`criarCache`, `cachePorId`), 21.07 (`set`/`clear`/`now`/`cancel`), 21.08 (`usarRecursos`), 21.09 (`now`, `samples`), 22.04 (`migrar`), 22.05 (`executar`). Correção: validar, antes de publicar, que todo import do `assessment.tests` existe em `starterFiles` ou está nomeado no `prompt`.
2. **21.08: solução de referência não passa no próprio assessment.** O teste importa `usarRecursos` de `recurso.js`; a solução exporta `executar()` de `native-using.mjs`. Correção: uma única API, nomeada no enunciado, exportada no starter e na solução.
3. **21.09: `ReferenceError` ao clicar em Medir e mediana errada para n par.** A solução chama `comparar` sem exportá-la, e o botão fica desabilitado. A mediana usa o índice superior, contrariando o 21.03. Correção: exportar `comparar` (ou inline), reabilitar o botão em `finally` e reusar a mediana do 21.03.
4. **21.07: harness do starter incompatível com a solução.** `simular` passa `{agora, setTimeout, clearTimeout}`, a solução lê `{set, clear}` e `{now}`, e os resultados `[140,260]`/`[0,160]` não saem. O enunciado diz "100 eventos", mas simula 4. Correção: um contrato único para o relógio, propagado para solução, teste e enunciado.
5. **20.08: três bugs na pipeline de referência.** `take` não é posicional (`take(2).filter(x=>x>1)` dá `[2,3]`, o correto é `[2]`); `break` no `for...of` não chama `return()` na fonte; o builder é mutável (`base.map` e `base.take` retornam o mesmo objeto). O enunciado diz "generators", mas a solução não usa generators.

Próximos na fila de correção (ALTA): 22.05 (starter e assessment com contratos diferentes; `process.argv` quebra no Windows) e 22.07 (transfer com instrução em vez de código; sem suíte de referência nem mutantes).
