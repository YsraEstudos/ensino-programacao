# Relatório de auditoria — Lote 4 (08.06 a 11.12, 30 atividades)

Fontes: `brief.md` (checklist) e `lote-4.md` (30 atividades lidas integralmente, linhas 1 a 3804).
Verificações executadas: estatísticas por atividade (tamanho do prompt, starter, assessment, resposta da revisão, docs) via script; trechos de teste e solução isolados em Node (08.06, 11.03, 11.12). Nenhum dado de origem foi alterado.

**Contagem por gravidade:** ALTA 6 | MÉDIA 17 | BAIXA 7 | OK 0

## Padrões do lote (NOVO, afetam várias atividades)

1. **Feedback de revisão copia o worked_example.** Em 11 de 11 atividades da etapa 11 (11.01, 11.02, 11.03, 11.04, 11.05, 11.06, 11.07, 11.09, 11.11, 11.12, 11.14), `correctFeedback` e `incorrectFeedback` repetem o exemplo de caso em vez de explicar a resposta. Ex.: 11.09 diz "Correto. Um script de métricas lento com async..." para uma pergunta sobre `defer`.
2. **Campo `docs` com URL partida.** Em 9 atividades (09.01, 09.05, 09.07, 09.08, 10.01, 10.04, 10.05, 10.06, 10.07) o link vem quebrado entre `section` e `question`, por exemplo `"section": "; MDN let: https://developer"` e `"question": "mozilla.org/en-US/docs/..."`. O `url` principal às vezes aponta para outro tema.
3. **`vocabulary` que não define o termo.** Em vários casos a entrada repete a frase do exemplo em vez de definir o termo (09.01, 09.04, 09.08, 10.01, 10.03, 10.05, 10.06, 10.07, 10.08).
4. **Transfer em template repetido.** Em 11 atividades da etapa 11 o texto é o mesmo ("Tarefa independente — Cenário independente: ... Critérios já publicados: ... A entrega deve demonstrar..."). "Critérios já publicados" não existe em nenhuma delas.
5. **"Rode testes" / "rode o snippet" sem arquivo executável ou sem assessment.** 09.01, 09.02, 09.05, 10.02, 10.07.
6. **Exemplo de outro domínio que o starter.** 09.04 (`makeClock` vs `make`), 09.08 (`createListStore` vs `createStore`), 10.06, 10.07, 10.08.
7. **Duração irrealista.** 6 min em 11.09 e 11.14; 9 min em 11.01; 10 min em 10.02 e 11.03.

### Confirmações dos planos (dados do lote 4)
- CONFIRMA: prompts com menos de 150 caracteres: 8 atividades (11.02, 11.03, 11.04, 11.06, 11.09, 11.11, 11.12, 11.14).
- CONFIRMA: starters só `material.md`: 14 atividades (09.01, 09.02, 09.04, 09.05, 09.07, 10.01, 10.02, 10.06, 10.07, 11.01, 11.02, 11.09, 11.11, 11.14).
- CONFIRMA: sem teste automatizado: 15 (10 sem assessment: 08.07, 09.01, 09.02, 09.04, 09.05, 09.07, 10.01, 10.02, 10.06, 10.07; 5 só com rubrica: 11.01, 11.02, 11.09, 11.11, 11.14).
- CONFIRMA: rubricas genéricas. As 30 atividades têm `scoring` genérico ("Aceite qualquer...", "Rode critérios...", "Avalie somente as decisões retiradas...", "Exija reprodução...", "Teste DOM..."). Nas que têm teste, o teste é o critério real e o `scoring` é decorativo.
- CONFIRMA: prompts com instrução de UI misturada à tarefa: 09.01 ("Leia o snippet no editor"), 09.02 ("Rode o exemplo"), 09.05 ("Rode testes"), 10.02 ("depois rode o cenário").
- CONFIRMA: jargão "hierarquia artificial" e "hierarquias explosivas" em 10.06.
- CONFIRMA: `?.` aparece pela primeira vez em primer da 10.01.
- NOVO: o pré-requisito de `AbortController`, `FormData` e `DOMContentLoaded` está concentrado no `stageBridge` da 11.09, sem ensino prévio no lote.

---

## Atividades

### 08.06 — Deduplique eficientemente  [Gravidade: MÉDIA]
- **Escrita:**
  - `objective` "Declare a regra de igualdade antes de escolher includes ou Set." aparece idêntico em `firstResponse.action`, `preparation.introduction` e `predictionGuide`. Manter no objective e reescrever o primeiro passo, por exemplo: "Escreva a regra de igualdade que vai usar para as chaves do domínio antes de codar."
  - `prompt`: "Implemente a mudança" não tem código a mudar (o starter é só `export function unicosLento(xs){} export function unicosSet(xs){}`). Trocar por "Implemente unicosLento(xs) e unicosSet(xs) em main.js".
  - `explanation.worked_example` diz que duas linhas com o mesmo ISBN são a mesma ocorrência, mas os testes usam igualdade SameValueZero/identidade (`{id:1}` duplicado continua distinto). Os dois ensinos se contradizem. Trocar o exemplo por valores primitivos ou dizer que ISBN seria outra regra.
- **Lógica:**
  - Teste fraco. Verifiquei em Node que a implementação `[...new Set(xs.slice().sort())]` passa em todos os 6 testes (inclui `[a,b,a,c]`, `[NaN,NaN]`, objetos distintos e `1`/`'1'`), mas devolve `["a","b"]` para `["b","a","b"]`, onde o esperado é `["b","a"]`. O enunciado exige primeira ocorrência e nenhum teste cobre isso.
  - Correção: adicionar `test("preserva a ordem de primeira aparição", () => expect(unicos(["b","a","b"])).toEqual(["b","a"]))` e `[3,1,3,2] -> [3,1,2]`.
- **Novo vs planos:** NOVO (teste que aceita ordenação; objective duplicado; contradição ISBN).

### 08.07 — Trace BFS por largura  [Gravidade: ALTA]
- **Escrita:**
  - `review.answer` é `3` ("Para visitar o destino antes de processar qualquer vizinho."), que está errada. A resposta correta é o índice `0` ("Para impedir que ciclos ou vizinhos convergentes sejam enfileirados várias vezes."). O `correctFeedback` "Correto. Registrar na descoberta..." está hoje ligado à opção errada. Corrigir para `"answer": 0`.
- **Lógica:**
  - `checks.fixture.expected` diz "fila após cada remoção [],[B,C],[C,D],[D],[]", mas há 4 remoções (A, B, C, D) e a lista tem 5 estados. O `[B,C]` é o estado depois de enfileirar os vizinhos de A, não depois de uma remoção. Na simulação o correto é `[],[C,D],[D],[]`. Correção: rotular como "fila após cada operação" e manter os 5 estados, ou manter os 4 estados da remoção.
  - O `scoring` "Compare estados e ordem; peça explicação curta" não diz quem avalia nem com que critério (sem assessment).
  - Nota: `stageTitle` "COMPLEXIDADE E RECURSÃO" para uma atividade de grafos e Set; verificar com o mapa de etapas.
- **Novo vs planos:** NOVO (resposta da revisão errada; fixture mal rotulada). CONFIRMA (sem assessment; rubrica genérica).

### 08.08 — Microprojeto - planejador de rotas simplificado  [Gravidade: MÉDIA]
- **Escrita:**
  - `prompt` pede "uma decisão de comportamento visível ao usuário", mas nenhum teste nem campo do checklist define ou avalia essa decisão. Ex.: "Escolha uma mensagem para 'sem rota' e registre-a".
  - `objective` duplicado idêntico em `firstResponse.action`, `introduction` e `predictionGuide` (mesmo padrão de 08.06).
  - "sem predecessora não há rota" (common_trap) e "siga predecessoras e inverta" (worked_example): predecessor é masculino. Trocar para "sem predecessor" e "siga os predecessores".
- **Lógica:**
  - Contrato oculto de desempate. O teste `caminho(grafo,"A","D")` espera `["A","B","D"]`, empatado com `["A","C","D"]`. Só passa se o predecessor for fixado na primeira descoberta. O prompt diz apenas "pela ordem de vizinhos publicada". Correção no prompt: "em caso de empate, vence o vizinho que aparece primeiro na lista de adjacência".
  - Os demais testes são bons: caminho mais curto `[A,C,D]`, início igual ao fim, ciclo e grafo não alterado.
- **Novo vs planos:** NOVO (desempate oculto; decisão visível não avaliada; concordância). CONFIRMA (rubrica "Rode critérios comportamentais e revisão humana..." genérica).

### 09.01 — Mapa de escopo  [Gravidade: MÉDIA]
- **Escrita:**
  - `prompt` e `interaction` pedem "Leia o snippet no editor" e "rode o snippet", mas o starter é `material.md` em prosa ("snippet: const fora=1; {...}"). Não há editor nem arquivo executável. Correção: criar `snippet.js` e mudar para "rode `snippet.js` no console".
  - `preparation.docs`: `"section": "; MDN let: https://developer"`, `"question": "mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let"`. Correção: `{"title":"MDN: instrução let","url":"https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let","section":"","question":""}`.
  - `vocabulary` ("`taxa`", "`parcial`") repete o exemplo e não define o termo. Correção: "`bloco` — par de chaves que delimita um escopo para let e const".
  - `stageBridge` mistura notas de instrutor com texto do aluno: "agende transferência em domínio diferente" e "forneça a factory e retire a implementação de reset" não fazem sentido para o aluno.
- **Lógica:**
  - Valores conferem: `f()` = 1+2+3 = 6; `fora` = 1; `bloco` fora -> ReferenceError. Review `answer: 1` correto.
  - Sem assessment: a previsão não tem gabarito verificável.
- **Novo vs planos:** NOVO (snippet sem arquivo; docs quebrado; vocabulary; notas de instrutor no aluno). CONFIRMA (sem assessment).

### 09.02 — Parsons de factory  [Gravidade: MÉDIA]
- **Escrita:**
  - `review` opção correta (índice 2): "Uma função junto ao acesso que mantém ao ambiente léxico relevante." é frase quebrada. Correção: "Uma função combinada com o acesso ao ambiente léxico em que foi criada."
  - Starter: "blocos embaralhados: function criarConta(inicial), let saldo, return {depositar, consultar}, validação de depósito, chamadas". "validação de depósito" e "chamadas" são ambíguos.
  - "Rode o exemplo" sem arquivo executável.
- **Lógica:**
  - Não há gabarito: nenhuma solução de referência nem ordem aceita. O aluno não tem como ser avaliado de forma verificável. Correção: incluir `solution.js` e a ordem aceita.
  - Contrato oculto: `depositar(-1) -> false` aparece em `examples`, mas o prompt não define regra de depósito válido. Correção: "depósito válido é número maior que zero".
  - Edge "contas com 1 e 9 -> saldos independentes" não está em examples nem em testes.
- **Novo vs planos:** NOVO (sem gabarito; regra de depósito oculta; frase quebrada). CONFIRMA (sem assessment; rubrica genérica).

### 09.03 — Complete closure  [Gravidade: BAIXA]
- **Escrita:**
  - `review` cobra "currying" (answer 0, correto), mas `explanation` e `conceptSteps` só ensinam closure. O termo aparece sem ser definido antes. Correção: acrescentar uma frase de definição de currying em `explanation.mental_model`.
  - `scoring` "Avalie somente as decisões retiradas e execute o arquivo completo" é vago.
- **Lógica:**
  - Testes bons: `multiplicador(3)(4) === 12`, `triplo(-2) === -6`, fator 0, duas funções independentes. Uma implementação `x => fator * x` passa, o que é correto.
- **Novo vs planos:** NOVO (currying cobrado sem ensino). CONFIRMA (rubrica genérica).

### 09.04 — Closure passo a passo  [Gravidade: MÉDIA]
- **Escrita:**
  - `examples`: `a.read(),a.inc(),a.read(),b.read()` -> `0,1,1,0`. O método `inc(){n++}` não retorna nada, então a segunda posição seria `undefined`, não `1`. Correção: "0, undefined, 1, 0", ou pedir "valor de n após cada chamada: 0, 1, 1, 0".
  - `worked_example` e `vocabulary` falam de `makeClock()`, `advance()`, `minute`. O starter é `make()`, `inc()`, `n`. Correção: trocar o exemplo para o domínio do starter.
- **Lógica:**
  - `edgeCases`: "const r=a.read; r() -> 1 porque método não usa this". O `read` começa com `n=0`, então o resultado é `0` sem um `inc` prévio. Correção: "const r=a.read; a.inc(); r() -> 1".
- **Novo vs planos:** NOVO (exemplo e starter de domínios diferentes; saída de `inc` inconsistente). CONFIRMA (sem assessment).

### 09.05 — Bug no loop e callback  [Gravidade: MÉDIA]
- **Escrita:**
  - `prompt` e `practiceSteps` mandam "Rode testes" e "Rode testes e justifique...", mas não há testes nem arquivo executável (`material.md` em prosa; sem assessment).
  - `preparation.docs` com URL partida ("let" e "var" misturados em `section`/`question`).
  - `worked_example` fala em "três nomes e funções `()=>nome`", mas o starter usa `i`. Correção: usar `i`.
- **Lógica:**
  - Verifiquei: com `var` dá `[3,3,3]`; com `let` dá `[0,1,2]`. Review `answer: 1` correto. O primer sobre `var` está correto (içamento e `undefined`).
- **Novo vs planos:** NOVO (testes que não existem; docs quebrado; exemplo fora do starter). CONFIRMA (sem assessment).

### 09.06 — Cache simples  [Gravidade: BAIXA]
- **Escrita:**
  - Starter divergente entre campos: `starterFiles` tem `return function (x) { return fn(x); }`, enquanto `materials` diz `return function(x){}`. Alinhar.
  - `prompt` e `interaction` pedem "função instrumentada" e "contador textual de invocações", mas o helper `instrumentada` só existe nos testes ocultos. O aluno não recebe o contador.
  - "predicado" é jargão sem definição.
- **Lógica:**
  - Testes bons: `0`, `undefined` e `false` não são recalculados (exige `Map.has`, não checagem de valor truthy); `NaN` como chave; `1` vs `'1'`; cada `memoize` com cache próprio. Review `answer: 2` correto.
- **Novo vs planos:** NOVO (starter divergente; helper ausente). CONFIRMA (rubrica genérica).

### 09.07 — WeakMap de metadados  [Gravidade: BAIXA]
- **Escrita:**
  - `preparation.docs`: `"section": "; MDN Map: https://developer"`, `"question": "mozilla.org/.../Map"` (URL partida).
  - "coletor" e "chaves-objeto" são usados sem definição; "diferença semântica publicada" não diz onde foi publicada.
- **Lógica:**
  - Verifiquei os fatos: `WeakMap.set("id",1)` lança TypeError e `typeof WeakMap.keys` é `"undefined"`. Review `answer: 0` correto.
  - Sem assessment (atividade `optional`). Rubrica "Aceite escolha justificada..." sem critério.
- **Novo vs planos:** NOVO (docs quebrado; jargão). CONFIRMA (sem assessment; rubrica genérica).

### 09.08 — Microprojeto - store mínimo  [Gravidade: MÉDIA]
- **Escrita:**
  - `vocabulary` e `worked_example` falam de `createListStore`, `items` e `listeners`. O starter é `createStore(initial)`, sem `items`. Correção: usar `createStore` e o nome de estado do starter.
  - `docs`: `"section": "; MDN Object"`, `"question": "is(): https://.../Object/is"`, misturado com o link de `Set`.
  - `prompt`: "registre evidências textuais do contrato" é vago.
- **Lógica:**
  - Testes conferidos: `Object.is` em `NaN` notifica uma vez; cancelamento durante emissão dá `["A","B","B"]` com snapshot. A implementação correta passa.
  - A política de notificação para objetos não é testada (só primitivos), o que é aceitável mas não está declarado.
- **Novo vs planos:** NOVO (nome de função divergente; docs quebrado). CONFIRMA (rubrica genérica "Rode critérios...").

### 10.01 — Preveja this - metodo comum vs arrow  [Gravidade: MÉDIA]
- **Escrita:**
  - `vocabulary` para `call` não define `call`; a entrada fala de arrow. Correção: "`call` — método que invoca uma função com `this` explícito: `f.call(obj)`".
  - `docs`: `"section": "; MDN arrow functions: https://developer"`, `"question": "mozilla.org/.../Arrow_functions"` (URL partida).
  - `stageBridge` com linguagem de instrutor: "Classe é ferramenta ... não prêmio por avançar no currículo".
- **Lógica:**
  - `checks.scoring`: "confiança é diagnóstica", mas nenhum campo de confiança existe na interação.
  - O starter tem `arrow:()=>this?.x`, mas nenhum exemplo ou teste usa a arrow. "arrow.call({x:7}) -> não devolve 7" só aparece em `edgeCases`, sem valor esperado. Correção: incluir `obj.arrow.call({x:7}) -> undefined` nos examples.
  - Corretos: `solto()` em módulo estrito lança ao ler `this.x`; review `answer: 1`.
- **Novo vs planos:** NOVO (vocabulary de `call`; campo de confiança inexistente; arrow sem exemplo). CONFIRMA (`?.` no primer da 10.01).

### 10.02 — Parsons de classe  [Gravidade: MÉDIA]
- **Escrita:**
  - `examples`: `new Cofre(2).depositar(3); saldo` -> `5`. `saldo` sozinho não é acessível: existem `#saldo` privado e `get saldo()`. Correção: `const c = new Cofre(2); c.depositar(3); c.saldo -> 5`.
  - "Rode o cenário e acrescente um teste" sem arcabouço de teste na atividade.
- **Lógica:**
  - Contrato oculto: `edgeCases` diz "saldo inicial negativo -> 0" e "depósito zero/negativo -> false", mas o prompt e o starter não dizem isso. Correção: incluir as regras no prompt.
  - Sem gabarito de ordem nem solução de referência; a rubrica "Avalie ordem/seleção..." não tem referência.
- **Duração:** 10 min para ordenar blocos, completar validação, rodar e escrever teste de invariante é irrealista. Sugestão: 20 min.
- **Novo vs planos:** NOVO (exemplo inválido; regras ocultas; duração). CONFIRMA (sem assessment; rubrica genérica).

### 10.03 — Complete protótipo  [Gravidade: BAIXA]
- **Escrita:**
  - `vocabulary` define `this` por frase sobre cadeia de protótipos; `comando` e `ligado` não são definidos e só repetem o exemplo.
  - Duração de 10 min é apertada para o trabalho descrito.
- **Lógica:**
  - Testes bons: uma implementação que copia `mover` para cada objeto falha em "mover é herdado"; dados no protótipo falham em "dados independentes". Review `answer: 0` correto.
- **Novo vs planos:** NOVO (vocabulary sem definição). CONFIRMA (rubrica genérica).

### 10.04 — Metodo extraido  [Gravidade: BAIXA]
- **Escrita:**
  - `examples` e hint 2 usam "dado: após correção: antes da troca", que não é entrada executável. Correção: "executar(4,5,9) -> {antes:[5,5], depois:[5,9]}".
  - `docs`: `"section": "; MDN Function"`, `"question": "bind(): https://..."` (URL partida).
- **Lógica:**
  - Verifiquei: o starter devolve `antes: [4,5]` e falha; com `bind(obj)` devolve `[5,5]` e `[5,9]`. Uma solução com `() => obj.ler()` falha no teste de "depois" (dá `[9,9]`), o que é correto.
  - Review `answer: 1` correto.
- **Novo vs planos:** NOVO (exemplo não executável; docs quebrado).

### 10.05 — Bug de herança  [Gravidade: BAIXA]
- **Escrita:**
  - `docs`: `"section": "; MDN Error"`, `"question": "cause: .../Error/cause"`. O link é sobre `Error.cause`, sem relação com `extends`. Trocar por "MDN: super".
  - `vocabulary` de `super` define por proibições ("Não acesse this antes de super...") em vez de definir o termo.
- **Lógica:**
  - Reproduz os dois bugs (ReferenceError e descrição sem base). Testes bons, incluindo o que muda `Base.prototype.descricao` e verifica `super.descricao()`. Review `answer: 2` correto.
- **Novo vs planos:** NOVO (docs irrelevante; vocabulary).

### 10.06 — Refatore para composição  [Gravidade: ALTA]
- **Escrita:**
  - `vocabulary` e `worked_example` tratam de `{bateria, capacidades}`, `emitirSom` e `piscar` (um instrumento). Nada disso existe no starter, que fala de Personagem, MagoCuradorVoador, mover, atacar e curar.
  - Jargão: "hierarquia artificial" e "hierarquias explosivas".
  - `docs`: `"section": "; MDN Functions"`, `"question": "mozilla.org/.../Guide/Functions"`, sem relação com composição.
- **Lógica:**
  - MODIFY sem código: `starterFiles` é um `material.md` com uma frase ("hierarquia artificial Personagem->MagoCuradorVoador; capacidades mover/atacar/curar recebem estado explícito"). "Investigue a hierarquia", "substitua a combinação de subclasses" e "rode regressões antigas" não têm o que operar.
  - Correção: fornecer o starter com as classes (Personagem, MagoCuradorVoador, MagoCurador etc.), a API esperada de mover, atacar e curar, e um teste de regressão. Alinhar o domínio do worked_example com o starter.
  - Sem assessment: `examples` ("entidade sem atacar -> não expõe atacar") não diz qual API verificar.
  - Review `answer: 0` correto.
- **Novo vs planos:** CONFIRMA (jargão "hierarquia artificial" em 10.06; sem assessment). NOVO (MODIFY sem código; domínio incoerente).

### 10.07 — Transferencia - composicao vs heranca  [Gravidade: MÉDIA]
- **Escrita:**
  - `examples` e `checks.fixture` têm `given: "A"` (não é entrada) e `expected` que é rubrica ("justificativa cita invariantes"). Correção: resposta esperada por cenário, ou marcar como avaliação humana.
  - `worked_example` e `vocabulary` tratam de relatório CSV/JSON e `exportador`, que não estão nos cenários do starter (quadrado/retângulo e email/SMS).
  - `docs`: `"section": "; MDN extends: https://developer"`, `"question": "mozilla.org/.../Classes/extends"` (URL partida).
- **Lógica:**
  - "implemente a decisão do cenário de estratégia e escreva testes" sem código e sem runner (SEM assessment). Correção: fornecer `estrategia.js` e um teste.
  - Correto: `edgeCases` sobre `setter de largura do quadrado` (violação de substituição). Review `answer: 1` correto.
- **Novo vs planos:** NOVO (fixture não executável; exemplo de outro domínio; docs quebrado). CONFIRMA (sem assessment).

### 10.08 — Microprojeto - motor de entidades  [Gravidade: MÉDIA]
- **Escrita:**
  - `vocabulary` ("`ligado`") e `worked_example` ("coleção de sensores", `ativar(sensor)`) não existem no starter.
- **Lógica:**
  - Verifiquei: os cenários públicos A, B, C e D e os testes de validação de dano (NaN, Infinity, `"3"`, zero) batem com a especificação do starter. A cópia de `posicao` e `capacidades` é testada.
  - O prompt manda "acrescente cura sem alterar o mover", mas nem o starter nem os testes definem a cura (nome, efeito, retorno). Correção: especificar `curar(ent, n)` e incluir um teste.
  - Review `answer: 2` correto.
- **Novo vs planos:** NOVO (cura não especificada; vocabulary de outro domínio). CONFIRMA (rubrica "Rode critérios comportamentais..." genérica).

### 11.09 — Quando o script executa  [Gravidade: MÉDIA]
- **Escrita:**
  - `review.correctFeedback` ("Correto. Um script de métricas lento com async...") é o feedback de async, enquanto a pergunta é sobre `defer`. `incorrectFeedback` ("Revise esta regra: Considerar async ordenado como defer.") também não se aplica. Correção: "defer baixa sem bloquear o parse, executa após o parse e antes de DOMContentLoaded, na ordem do documento."
  - `stageBridge` tem muitos conceitos (textContent, innerHTML, capture/bubble, once/passive/signal, FormData, Kanban V1/V2/V3, 11.08/11.10/11.13/13.14) e instrui "Carregue main.js com type=module por servidor local", que é de outra atividade. Enxugar para o que é avaliado aqui.
- **Lógica:**
  - Correto: `defer` e `module` executam após o parse e antes de DOMContentLoaded; `async` não tem ordem fixa. Review `answer: 0` correto.
  - Duração de 6 min para prever quatro scripts e justificar, mais transfer, é irrealista.
- **Novo vs planos:** NOVO (feedback copiado; stageBridge sobrecarregado e com material de outra atividade; duração). CONFIRMA (prompt de 138 caracteres, abaixo de 150).

### 11.01 — Rastreie eventos  [Gravidade: MÉDIA]
- **Escrita:**
  - `examples`: "logs botão,filho,pai", mas o id no starter é `botao` (sem acento). Correção: "botao,filho,pai".
  - `review.correctFeedback` copia o exemplo "article > a > span" e não explica a diferença entre `target` e `currentTarget`.
- **Lógica:**
  - O prompt pede "compare stopPropagation e stopImmediatePropagation pelo efeito em listeners do mesmo nó", e `edgeCases` diz "segundo listener do filho não roda". O starter tem um só listener por nó, então a comparação não tem o que observar. Correção: adicionar um segundo listener em `#filho` no starter.
  - Duração de 9 min para trace, duas comparações e transfer é apertada.
- **Novo vs planos:** NOVO (listeners ausentes para a comparação; feedback copiado; example com acento). Transfer em template (padrão 4).

### 11.11 — Propagação não é comportamento padrão  [Gravidade: MÉDIA]
- **Escrita:**
  - `materials` diz "link aninhado, listeners capture/bubble", e `examples` diz "capture ul, target link, bubble li, bubble ul". O starter usa `#menu`, `#item` e `data-parar`, e não tem nenhum listener em capture. O prompt manda "Rastreie capture, target e bubble". Os três não batem.
  - `registrar` é citado no starter sem ser definido.
  - `review.correctFeedback` copia o exemplo do link e não explica a direção do capture (review `answer: 2` correto).
- **Lógica:**
  - Correto: `passive` faz `preventDefault` não cancelar; `stopPropagation` não cancela a navegação.
  - `scoring` "Aceite escolha justificada por diferença semântica publicada" é vago.
- **Novo vs planos:** NOVO (starter, exemplo e prompt em DOM diferentes; feedback copiado). CONFIRMA (rubrica genérica; prompt de 118 caracteres, abaixo de 150).

### 11.14 — Listeners com ciclo de vida  [Gravidade: BAIXA]
- **Escrita:**
  - `correctFeedback` começa com "Correto." e repete os três casos do exemplo; não justifica por que `once` é a resposta. Correção: "`once: true` remove o listener depois da primeira invocação."
  - "Em cada situação" não lista as situações; elas só aparecem como linhas do starter. Listar as três no prompt.
  - Duração de 6 min para três listeners, justificativas e transfer é irrealista.
- **Lógica:**
  - Correto: `signal` já abortado não instala o listener; `passive` com `preventDefault` não cancela e gera aviso. Review `answer: 0` correto.
- **Novo vs planos:** NOVO (feedback copiado; duração). CONFIRMA (prompt de 144 caracteres, abaixo de 150).

### 11.02 — Parsons de componente  [Gravidade: MÉDIA]
- **Escrita:**
  - `materials`: "Editor com os seis blocos DOM do enunciado", mas são sete (Bloco A a G). Correção: "sete blocos".
  - `worked_example`: "Novo <em>rascunho</em>" não confere com o starter (`mensagem = '<b>rascunho</b>'`). Usar `<b>`.
  - `review.correctFeedback` copia o exemplo e não explica a resposta (createElement).
- **Lógica:**
  - Rubrica "Avalie ordem/seleção de blocos..." sem ordem de referência. As dependências são: D depende de C; E depende de A e C; F depende de A, B, C e D; G depende de `lista` e A. Correção: registrar a ordem aceita e as alternativas válidas.
  - Review `answer: 1` (createElement) correto.
- **Novo vs planos:** NOVO (blocos contados errado; exemplo com tag diferente do starter). CONFIRMA (prompt de 138 caracteres; rubrica genérica).

### 11.03 — Complete validação  [Gravidade: ALTA]
- **Escrita:**
  - `interaction` fala em "formulário rotulado, botão validar e região de erro", e `materials` em "formulário HTML rotulado", mas o starter é só `validate.js`.
- **Lógica:**
  - Contrato oculto (ALTA). Os testes exigem `result.valores` nos casos de erro: `result.valores.nome` em "rejeita nome vazio sem apagar entrada", `result.valores.quantidade` nos casos `2.5`/`0`/`abc` e `validar(entrada).valores` em "preserva valor de edição". O TODO do starter diz só `{ ok: false, erros }`. Verifiquei em Node: seguindo o TODO, `result.valores.nome` lança `TypeError: Cannot read properties of undefined (reading 'nome')`.
  - Correção: alterar o TODO para "retorne { ok: false, erros, valores }, onde valores é a entrada crua", ou remover `valores` dos testes e dizer isso no enunciado.
  - O `transfer.js` tem o mesmo problema (exige que os valores de edição sejam mantidos, sem formato definido).
  - Correto: examples `' Ana ', '3'` -> `{ok:true,nome:'Ana',quantidade:3}`. Review `answer: 2` correto.
- **Novo vs planos:** NOVO (contrato oculto de retorno que quebra quem segue o TODO).

### 11.04 — FormData real  [Gravidade: ALTA]
- **Escrita:**
  - `explanation.mental_model` e `practiceSteps` falam em "submit preventDefault" e "leia os valores no submit", mas o starter não registra listener de submit.
  - `transfer.prompt`: "checkboxes repetidos canal, quantidade numérica" está truncado e sem sentido. Correção: "checkboxes repetidos (canal) e quantidade numérica".
  - `review.correctFeedback` copia o exemplo de `getAll("cor")`, mas a pergunta é sobre o evento `submit`.
- **Lógica:**
  - Testes sem fixture (ALTA). `fill()` usa `document.querySelector('#inscricao')`, mas nenhum arquivo cria um form com `id="inscricao"`. O starter cria o form em `area`, que nunca entra no documento. Todos os testes que chamam `fill()` (inclusive os 4) lançam `Cannot read properties of null`, a menos que um harness não declarado crie esse elemento. Correção: criar `<form id="inscricao">` no `beforeEach` do teste ou no starter.
  - Mesmo contrato oculto de 11.03: o teste "quantidade inválida mantém o valor cru" exige `result.erros.quantidade` e `result.valores.quantidade`, sem definição no starter.
  - Correto: `getAll('interesse')` devolve `['JS','TS']`; `FormData.get` devolve string. Review `answer: 0` correto.
- **Novo vs planos:** NOVO (fixture `#inscricao` ausente; contrato oculto; submit inexistente).

### 11.05 — Bug de listeners duplicados  [Gravidade: ALTA]
- **Escrita:**
  - `prompt` e `objective` descrevem `mount` ("mount instala uma delegação"), mas `app.js` exporta só `render`, `destroy` e `getAcoes`, e os testes não chamam `mount`. Correção: exportar `mount(lista)` ou remover `mount` do enunciado.
  - `review.correctFeedback` copia o exemplo do painel de favoritos e não explica a pergunta sobre `addEventListener`.
- **Lógica:**
  - Starter/teste quebrados (ALTA). `const lista = document.querySelector('#lista')` roda no import. Nenhum teste cria `#lista` (só usa `document.querySelector('button')`). Se nenhum harness criar `#lista` antes do import, `lista` é `null` e `render` lança `TypeError`. Correção: consultar `#lista` dentro de `render`/`mount` e criar o elemento no `beforeEach`.
  - Estado compartilhado entre testes: `acoes` nunca zera, e os listeners de `render(['b'])` não são removidos entre testes. O teste "destroy remove listener" só passa porque o contador veio de 1 no teste anterior. Correção: exportar um `reset()` ou isolar o módulo por teste.
  - Review `answer: 2` correto.
- **Novo vs planos:** NOVO (mount inexistente; `#lista` capturado no import; dependência entre testes).

### 11.06 — Delegação de eventos  [Gravidade: MÉDIA]
- **Escrita:**
  - `review.correctFeedback` copia o exemplo "Numa lista de arquivos..." e não explica `currentTarget`.
- **Lógica:**
  - Contrato oculto: `removerPorId` recebe `'7'` (string, vinda de `dataset`). O prompt diz "Converta ou compare ID conforme contrato de dados" sem o contrato. Correção: "removerPorId recebe o data-id como string".
  - "ID desconhecido" aparece no TODO e em `edgeCases`, mas nenhum conjunto de ids conhecidos é definido nem testado.
  - Teste fraco provável: no teste "ignora alvo sem botão com id", um clique no span de `#plain` com uma solução ingênua `event.target.closest('button').dataset.id` lança `TypeError` dentro do listener. Em jsdom, exceção de listener não aparece no `dispatchEvent`, então o teste pode passar mesmo com erro. Correção: verificar que o listener não lança (capturando `window` `error`) e cobrir o caso `closest` nulo explicitamente.
  - Review `answer: 1` correto.
- **Novo vs planos:** NOVO (contrato de string; id desconhecido sem definição; teste que pode não reprovar erro).

### 11.07 — A11y de formulario  [Gravidade: MÉDIA]
- **Escrita:**
  - `worked_example` fala no rótulo "Endereço", mas o campo do starter é "E-mail".
  - O `index.html` do starter mostra `<p id="erro">Campo inválido</p>` já no carregamento, então a mensagem de erro aparece antes de qualquer interação.
- **Lógica:**
  - Contrato oculto: os testes exigem `label[for=email]` e `button[type=submit]`, mas o prompt só diz "controles nativos". O starter tem `<div onclick="enviarFormulario()">`, e `enviarFormulario` não existe. Correção: no prompt, citar `<label for="email">` e `<button type="submit">`.
  - "sucesso foca resumo": o teste espera foco em `#resultado`, um `<p>` sem `tabindex`, que não recebe foco. `edgeCases` menciona `tabindex=-1`, mas o prompt não. Correção: citar `tabindex="-1"` no prompt.
  - `scoring` cita "teclado", mas nenhum teste aciona Tab, Enter ou Space. Correção: adicionar teste de `keydown` ou marcar como revisão manual.
  - O `index.html` não tem `<script src="main.js">`. Se o harness não carregar `main.js`, o listener de submit não existe (confirmar no harness).
  - O teste de sucesso não verifica o texto de `#resultado` ("anuncia" não é testado).
- **Novo vs planos:** NOVO (controles e tabindex implícitos; teclado não testado; script não referenciado).

### 11.12 — Comentário como texto seguro  [Gravidade: ALTA]
- **Escrita:**
  - Três nomes para a mesma função: o prompt manda implementar `renderComentario`, o starter e os testes usam `mostrarTitulo`, e o transfer usa `mostrarComentario`. Unificar.
  - `explanation.mental_model` manda "Crie um elemento contêiner", mas o starter já tem o alvo (`<h2 id="titulo">`). `interaction` fala em "inspetor de árvore", que não existe no lote.
- **Lógica:**
  - Teste de segurança vacuo (ALTA). O teste "não cria evento executável para img" passa com a implementação vulnerável do starter (`alvo.innerHTML = titulo`), porque o mock não interpreta HTML e `querySelector('img')` devolve `null`. Verifiquei em Node. Correção: usar DOM real (jsdom `document.createElement`) ou fazer o mock parsear, e asserir `textContent === titulo` com nó de texto.
  - Contrato oculto no mock: o mock não tem setter de `textContent`, então `alvo.textContent = titulo` lança `TypeError` em módulo estrito. Só `replaceChildren`/`appendChild` com nós funcionam. O prompt não diz isso.
  - "string vazia cria comentário vazio (nodeType 8)" não está no prompt. Correção: incluir no enunciado ou remover.
  - Review `answer: 1` correto.
- **Novo vs planos:** NOVO (teste de segurança que passa com innerHTML; nome divergente; contrato do mock).

---

## Top 5 do lote

1. **08.07 — resposta da revisão errada.** `review.answer` é `3` ("visitar o destino antes de processar qualquer vizinho"), mas a correta é `0` ("impedir que ciclos ou vizinhos convergentes sejam enfileirados várias vezes"). Corrigir para `"answer": 0`. Hoje o aluno que acerta recebe a correção errada.
2. **11.12 — teste de segurança vacuo e nomes divergentes.** O teste "não cria evento executável para img" passa com `alvo.innerHTML = titulo` (verificado). Trocar o mock por DOM real ou por um mock que parseie HTML, e unificar o nome da função (`renderComentario` no prompt, `mostrarTitulo` no starter e nos testes, `mostrarComentario` no transfer).
3. **11.05 — starter e testes incompatíveis.** O prompt descreve `mount`, que não existe no starter nem nos testes. `#lista` é lido no import e nenhum teste cria esse elemento, então `render` tende a lançar `TypeError` sem harness. Exportar `mount`, consultar o DOM dentro das funções e isolar o estado entre testes.
4. **11.03 e 11.04 — contrato oculto de retorno e fixture ausente.** Os testes exigem `result.valores` nos casos de erro, mas o TODO diz só `{ ok: false, erros }` (verificado: `TypeError`). Em 11.04, o teste usa `document.querySelector('#inscricao')`, que nenhum arquivo cria. Especificar o formato de retorno no TODO e criar o form com `id="inscricao"`.
5. **10.06 — MODIFY sem código e domínio incoerente.** `starterFiles` é uma frase em `material.md`; não há hierarquia para "investigar" nem "substituir", e o worked_example trata de instrumentos (`emitirSom`, `piscar`) que não existem no starter. Fornecer o código do starter com Personagem e MagoCuradorVoador, a API de mover, atacar e curar, e um teste de regressão.

**Demais itens de prioridade MÉDIA com correção simples:** 08.06 (teste aceita ordenação; verificado em Node, falta caso `["b","a","b"]`), 09.04 (saída `0,1,1,0` com `inc` que retorna `undefined`), 10.02 (`saldo` sem `.`), 10.07 e 11.06 (contrato oculto e teste que pode não reprovar erro).
