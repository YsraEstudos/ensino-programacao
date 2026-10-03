# Pontes conceituais e exemplos resolvidos

Estas aulas curtas entram no site antes das atividades indicadas. Em cada ponte, o aluno primeiro prevê, depois executa, compara o resultado com a explicação e só então resolve a atividade. A terceira variação retira ajuda quando houver evidência de domínio. O conteúdo abaixo é a redação de referência para a aula, não apenas um título no currículo.

## Ponte 00 — Linguagem, ambiente e execução

JavaScript é a linguagem. Navegador e Node.js são ambientes que executam JavaScript e oferecem APIs diferentes. `console.log('A'); console.log(2 + 3); console.log('B')` produz A, 5, B nesta ordem: cada chamada é síncrona e o programa passa à próxima instrução depois que a anterior termina. O console é saída observável, não o próprio código. Um `SyntaxError` impede analisar o programa; um erro em execução surge depois que o programa começou; uma saída incorreta pode ocorrer sem exceção. No primeiro contato, leia a mensagem, a linha e a menor expressão que a explica antes de tentar uma alteração. A microponte HTML da etapa 00 apresenta elemento, atributo, hierarquia, `id`, `class`, `input`, `button`, `form` e `label`, somente como pré-requisito explícito para a etapa 11.

Este site usa Node.js em modo ES Module para carregar os arquivos dos exercícios. Nas fichas iniciais, `export function nome(...)` apenas identifica a função que o executor chama; o aluno prevê e altera o corpo da função, sem configurar imports ou `package.json`. A organização de vários módulos, imports, exports e configuração de projeto é ensinada formalmente na etapa 14.

## Ponte 01 — Valores, bindings e reatribuição

Um binding é um nome associado ao seu valor atual. `=` inicializa um binding ou atribui um novo valor; `const` impede reatribuir aquele nome e `let` permite mudanças previstas. Nesta trilha, prefira `const` para valores que não mudam e `let` para os que mudam — uma convenção de estilo, não uma regra que torna `let` inválido. Antes da declaração, o binding lexical ainda não foi inicializado; descreva esse estado temporal com precisão, sem dizer que o nome não existe.

Exemplo resolvido:

```js
const nome = "Ana";
let pontos = 0;
console.log(nome, pontos); // Ana 0
pontos = 5;
console.log(nome, pontos); // Ana 5
```

`nome` permanece Ana; `pontos` passa de 0 para 5. Zero e `false` também podem ser valores escolhidos intencionalmente. Aspas e crases delimitam strings no código; elas não fazem parte do valor textual exibido. `typeof valor` informa um rótulo de tipo; `typeof null` retorna `"object"` por uma peculiaridade histórica. Um `let` ou `const` não pode ser lido antes de sua inicialização: essa região é chamada temporal dead zone e a leitura causa `ReferenceError`.

Template literals usam crases e `${...}` para inserir valores: `` `${nome}: ${pontos}` `` resulta em `Ana: 5`. Nesta etapa, o vocabulário se limita a nomes de identificadores que o código realmente usa. `NaN`, `Infinity` e `BigInt` aparecem apenas para classificar o resultado de `typeof`; operações, precisão e comparações numéricas são tratadas na Etapa 02.

Exemplo resolvido A: `const codigo = "Q7"; let tentativas = 0;` guarda um código fixo e um contador que pode mudar. Exemplo resolvido B: depois de `tentativas = 1`, o resumo `` `${codigo}: ${tentativas}` `` produz `Q7: 1`; mudar o contador não muda `codigo`. Exemplo com ajuda retirada: um registro de manutenção fornece `intervaloDias = 0` e `alertaAutomatico = false`; o aluno prevê o resumo e marca qual binding pode receber nova atribuição. Esta ponte prepara o cartão `01.08` e a ficha de `01.09`. Symbol e objetos ficam explicitamente para etapas posteriores.

## Ponte 02 — Expressões, operadores, Number e Math

### Ponte 02A — Expressões, operadores e coerção

Unidade A (02.01–02.09): aritmética e precedência → comparação e lógica → ausência → conversão e detecção de validade → transferência. Em 02.01, resolva e confira o bloco aritmético antes do lógico; a comparação curta entre `==` e `===` vem ao final.

`+`, `-`, `*`, `/`, `%` (resto) e `**` (potência) calculam valores. Parênteses mudam a ordem; `2 + 3 * 4` é 14 e `(2 + 3) * 4` é 20. `===` compara sem converter tipos; `>`, `>=` comparam grandezas. `!` inverte truthiness. `&&` devolve o primeiro operando falsy, ou o último se nenhum for falsy; `||` devolve o primeiro truthy, ou o último se nenhum for truthy. Por isso `true && "ok"` devolve `"ok"` (string), e não um boolean.

Na matriz 02.02, `||` substitui os seis valores falsy **desta tabela**; `??` substitui apenas `null` e `undefined`, preservando `0`, `false`, `""` e `NaN`. String vazia deve ser mostrada como `""`. Estes seis valores não são a lista completa de falsy de JavaScript.

Coerção é conversão de tipo: `"2" + 3` concatena e produz `"23"`; `Number("2") + 3` calcula 5. Compare depois dos blocos: `0 === "0"` é false, `0 == "0"` é true porque `==` aplica regras adicionais de coerção. A trilha prefere `===`, salvo intenção explícita. `Number("")` e `Number("   ")` dão zero; a flag de vazio da fixture registra ausência. `Number("abc")` produz `NaN`; `Number("Infinity")` produz infinito. `Number.isNaN` identifica apenas NaN; `Number.isFinite` rejeita NaN e ambos os infinitos. A validação de 02.04 é `vazio || !Number.isFinite(numero)`, preservando o texto `"0"` com flag false.

Exemplo resolvido A: `(8 - 2) / 3` é 2. Exemplo resolvido B: com saldo 15, valor 6 e conta ativa, `saldo >= valor && ativa === true` é true; qualquer requisito false torna a autorização false. Exemplo com ajuda retirada: escolha um fallback para tentativas explicitamente iguais a zero e explique por que zero não significa ausência.

Interface das fixtures: todos os arquivos iniciais declaram entradas literais. O runner substitui apenas essas inicializações entre casos, preservando seus nomes e o código do aluno; nenhuma variável vem de um contexto invisível. Flags de vazio são booleanos declarados e correspondem a campos vazios ou só espaços. Em 02.05, apenas detecte validade: ainda não há if, throw nem tratamento de erro. Em 02.07, preço e taxa já pertencem ao domínio publicado; não existe validação escondida no starter.

### Ponte 02B — Number, Math e tolerância

Unidade B (02.10–02.12): arredondamento e utilitários → sorteios e intervalos → decimais → inteiros seguros → tolerância. Releia esta ponte antes de 02.10. Em 02.11, confira o bloco de decimais/valores especiais antes do bloco de inteiros/BigInt.

`Number` usa ponto flutuante binário para números comuns. Alguns decimais, como `0.5` e `0.25`, são exatos; `0.1 + 0.2` é `0.30000000000000004` e sua igualdade com `0.3` é false. Inteiros só são representados sem lacunas dentro do intervalo seguro indicado por `Number.isSafeInteger`; `BigInt` serve a inteiros maiores, mas não resolve frações decimais nem deve ser misturado implicitamente com `Number`. `NaN` representa resultado numérico inválido e não é igual a si mesmo; `Infinity` pode surgir de operações como divisão por zero. Mostre `Math.floor(-1.8)=-2`, `Math.ceil(-1.8)=-1`, `Math.trunc(-1.8)=-1` e `Math.round(1.5)=2`: arredondar, truncar e escolher teto/piso são decisões de domínio distintas. `Math.min(3,5)=3`, `Math.max(3,5)=5` e `Math.abs(-3)=3`. `Math.random()` produz um valor em `[0,1)`; `Math.floor(sorteio*6)+1` transforma esse valor em uma face de 1 a 6. Teste os extremos com sorteios literais 0 e 0.9999999999999999, sem exigir uma saída aleatória fixa. `Math.random` não é fonte criptográfica. Como curiosidade opcional, `Math.round(-0.5)` é `-0`.

Exemplo resolvido A: a regra `Math.abs(a-b) <= tolerancia` compara dois valores finitos quando a tolerância vem da precisão exigida pelo problema. Com a=0.1+0.2, b=0.3 e tolerância=1e-15, o resultado é verdadeiro. Exemplo resolvido B: compare valores perto de 2000 e observe que uma tolerância absoluta escolhida para números perto de 1 pode ser inadequada. A fórmula não deve usar `Number.EPSILON` como constante universal. Exemplo com ajuda retirada: o aluno recebe a resolução de um sensor e uma política explícita que aceita até metade da resolução, inclusive; precisa declarar seu limiar antes de implementar. Resolução sozinha não determina uma política universal. A ponte antecede 02.11 e 02.12.

## Ponte 03 — Decidir antes de repetir

Na unidade 03A, `if/else`, operadores booleanos, `switch` e guard clauses escolhem um caminho. Uma condição não percorre uma coleção. Exemplo A: `if (idade >= 18) return 'adulto'; return 'menor'` produz uma única decisão. Exemplo B: `switch (estado)` escolhe uma entre variantes conhecidas; uma alternativa desconhecida recebe tratamento explícito. A unidade 03B começa só depois dessa prova: `for` e `while` repetem ações; contador mede quantas vezes, acumulador mantém um resultado e `break` encerra o loop. Exemplo A: somar 1,2,3 usa acumulador inicial zero e três atualizações. Exemplo B: encontrar primeiro valor negativo encerra no primeiro match; não precisa percorrer todos. No terceiro exemplo o aluno explica o que a variável representa, do que depende e qual entrada refutaria sua hipótese, em vez de decorar um rótulo de “papel”.

## Ponte 04 — Funções pequenas que compõem uma regra

Uma função nomeia uma transformação com entradas e saída. Separe regras independentes em funções pequenas; a função de nível mais alto coordena seus resultados sem duplicar fórmulas.

Exemplo resolvido A: `custoPeso(kg)` recebe quilogramas e devolve um custo; `custoDistancia(km)` recebe quilômetros e devolve outro. Exemplo resolvido B: `frete(pedido)` chama as duas funções e soma os valores, mantendo as unidades claras. Exemplo com ajuda retirada: para um resumo de expediente, o aluno identifica entradas e saídas de `minutosTrabalhados` e `intervalo`, depois decide o que o resumo deve chamar. A ponte antecede `04.08`, que transfere composição para frete, e `04.09`, que combina regras derivadas em uma ficha.

## Ponte 05 — Texto, array, Unicode e regex

Strings e arrays entram com indexação, `slice`, `split`, `join` e operações de cópia/mutação. Aqui, callback significa função passada a outra operação para ser chamada por ela; o comparador passado a `sort` é o primeiro exemplo. `sort` altera o array; `toSorted` devolve outro array. Uma cópia rasa separa a coleção externa, mas não clona objetos internos. `map`, `filter` e pipelines de callbacks entram depois na etapa 07. Regex só é escolhida quando a regra textual permanece legível; formato estruturado complexo pede parser explícito. `RegExp.escape` só aparece sob contrato de runtime compatível.

Unicode exige três contagens diferentes: unidades UTF-16 (`'😀'.length` é 2), pontos de código (um para este emoji, percorrível por `for...of`) e grafemas percebidos pela pessoa (que podem envolver vários pontos de código). `codePointAt` lê um ponto de código, enquanto `normalize()` permite comparar sequências canonicamente equivalentes; normalizar não resolve todas as regras de língua nem segmentação visual. Exemplo A: 'é' pré-composto e 'e' seguido de acento combinante podem parecer iguais e ter comprimentos diferentes. Exemplo B: conte pontos de código com `[...texto].length` e explique por que isso não é contador universal de caracteres visuais. A ponte antecede 05.11.

## Ponte 06 — Objeto próprio, herança e referência

`const a={x:1}; const b=a; b.x=2` faz `a.x` valer 2 porque ambos referem o mesmo objeto. `const c={...a}` cria outro objeto externo, mas objetos aninhados continuam compartilhados. `structuredClone` pode copiar certos grafos de dados, com limites e tipos suportados; JSON não é clone universal e pode perder tipos. Em uma cadeia de protótipos, `'x' in objeto` consulta a cadeia; `Object.hasOwn(objeto,'x')` pergunta se o objeto possui a propriedade. `Object.keys` lista propriedades próprias enumeráveis, não tudo que `in` encontra. Descriptor mostra, por exemplo, se uma propriedade é enumerável ou gravável. Esses conceitos aparecem antes de `class` e `this` para que “herança” não seja uma caixa preta. “Stack/heap” aqui é analogia didática, não promessa do layout interno do motor JavaScript.

Antes de `06.06`, um JSON com sintaxe inválida lança um erro de parse. `try/catch` delimita somente essa operação: o `catch` converte a falha de sintaxe em `null`; JSON sintaticamente válido ainda precisa de validação de esquema separada. Mais tarde, a etapa 13 amplia esse modelo para classes de erro, causas e diagnóstico, sem tratar `catch` como validação automática.

## Ponte 07 — Escolher coleção pelo significado

Arrays preservam uma sequência de registros; callbacks transformam ou selecionam itens; `Map` guarda um valor por chave e `Set` representa membros únicos. A estrutura decorre da pergunta que cada métrica responde.

Exemplo resolvido A: `map` transforma `[3,5]` em `[6,10]` sem alterar a entrada. Exemplo resolvido B: ao percorrer doações, inicialize `totais` com zero quando `totais.has(campanha)` for falso e depois some o valor; `doadores.add(id)` elimina repetição de identidade. Exemplo com ajuda retirada: em uma lista curta de eventos, o aluno marca se precisa preservar ordem, agregar por chave ou contar únicos antes de escolher array, Map ou Set. A ponte prepara o exercício compacto `07.08` e depois o analisador `07.09`.

## Ponte 08 — Busca em largura antes de medir crescimento

Um grafo representa vértices e suas arestas; em um mapa sem pesos, BFS explora por camadas usando uma fila FIFO. Marque o vértice como visitado ao enfileirá-lo e guarde o predecessor na primeira descoberta. Assim ciclos não repetem trabalho e a cadeia de predecessores reconstrói um caminho mínimo.

Exemplo resolvido A: de A, enfileire B e C, nessa ordem. Exemplo resolvido B: ao remover B, descubra D e grave `anterior[D] = B`; C já está na fila, então não troque esse predecessor ao encontrar D outra vez. Exemplo com ajuda retirada: dado um mapa de estações com um ciclo, o aluno preenche a fila após cada remoção e reconstrói a rota de Central até Museu. A ponte antecede `08.07`, que pratica o traçado, e o planejador completo `08.08`.

## Ponte 09 — Closure com ajuda decrescente

Exemplo resolvido A: `function make(){let n=0;return ()=>++n}` devolve uma função que ainda acessa o binding `n` depois do retorno de `make`. Duas chamadas a `make()` criam bindings independentes. Exemplo resolvido B: uma factory retorna `inc` e `read`; ambas leem o mesmo `n`, então `read` observa o novo valor após `inc`. A função conserva acesso ao binding, não uma fotografia do valor inicial. Exemplo parcialmente resolvido: forneça a factory e retire a implementação de `reset`, pedindo previsão antes de editar. Exemplo independente: criar um store com `subscribe` e `unsubscribe`. Se o aluno errar captura em loop, compare `var` compartilhado com `let` por iteração e agende transferência em domínio diferente, como handlers de linhas de tabela.

## Ponte 10 — this, método e arrow

Exemplo resolvido A: `obj.metodo()` define o receptor pela forma da chamada; `const f=obj.metodo; f()` perde a base. Em módulo estrito, ler `this.x` nessa chamada solta pode lançar. Exemplo resolvido B: `obj.metodo.call(outro)` chama método comum com outro receptor, mas `.call` não substitui o `this` lexical de uma arrow. Exemplo parcialmente resolvido: o aluno recebe um callback extraído e escolhe `bind` ou wrapper `()=>obj.metodo()` explicando qual objeto será consultado no momento da execução. Só depois aparecem classes e protótipos. Classe é ferramenta para um contrato de instâncias, não prêmio por avançar no currículo; composição é preferível quando capacidades variam independentemente.

## Ponte 11 — Do HTML ao Kanban em módulos

O parser constrói DOM. Script clássico no head pode executar antes do body; `defer` e `type="module"` aguardam o parse; `async` executa quando disponível, sem ordem fixa frente ao parse. `DOMContentLoaded` tem relação específica com scripts adiados/módulos. Antes do Kanban, monte três arquivos: `state.js` exporta operações sobre tarefas; `view.js` recebe estado e cria nós; `main.js` importa os dois e instala eventos. Carregue `main.js` com `type="module"` por servidor local. O primeiro projeto pode ter testes manuais determinísticos; a etapa 13 acrescenta testes automatizados e evolução de dados.

Exemplo resolvido de segurança: `p.textContent='<img src=x onerror=alert(1)>'` mostra texto literal e não cria imagem. `innerHTML` interpreta markup e não recebe texto não confiável por padrão. Em eventos, capture desce, target identifica a origem e bubble sobe. `preventDefault()` cancela uma ação padrão cancelável; `stopPropagation()` interrompe propagação e não é sinônimo. `once` remove após uma chamada, `passive` promete não cancelar ação padrão e `signal` liga o listener a um `AbortController` para cleanup. Em formulário, `FormData.get` fornece uma entrada e `getAll` preserva nomes repetidos; números continuam strings até conversão e validação. Labels, foco e feedback dinâmico fazem parte do comportamento, não da decoração. A migração de save V1 para V2 volta em 13.14 com testes.

## Ponte 12 — HTTP, Promise e tempo

HTTP é uma troca entre request e response: método e URL pedem uma operação; status e headers descrevem a resposta; `Content-Type` ajuda a decidir como interpretar o corpo. `fetch` resolve a Promise para muitos status HTTP ruins, então cheque `response.ok`. O corpo é consumível: após `json()` ou `text()`, `bodyUsed` muda e uma segunda leitura falha; faça `clone()` antes da primeira leitura se duas leituras forem realmente necessárias. Nem toda resposta é JSON: use `text`, `blob`, `arrayBuffer` ou `formData` conforme o protocolo. Depois de parsear, ainda valide a forma dos dados externos. A aba Network do DevTools mostra método, URL, status, headers, corpo e tempo para uma falha concreta.

Exemplo resolvido de event loop A: código síncrono A, Promise.then P e timer T produzem A,P,T no navegador. Exemplo B: uma microtask que agenda outra entra na fila; ela não volta à pilha síncrona anterior. Exemplo parcialmente resolvido: compare `Promise.all` (todos necessários), `allSettled` (resultados parciais), `race` (primeiro assentamento) e `any` (primeiro sucesso; todas rejeitam com `AggregateError.errors`). `Promise.try(fn)` chama `fn` imediatamente e encapsula retorno/throw em Promise. `Promise.resolve().then(fn)` também encapsula, mas chama `fn` em uma microtask; não é substituto de mesma ordem. Uma alternativa fiel à ordem básica usa `try { return Promise.resolve(fn()) } catch (e) { return Promise.reject(e) }` quando a API moderna não estiver disponível.

Cancelamento e resposta obsoleta são problemas distintos: `AbortController` tenta interromper trabalho cancelável; um número de geração impede que a resposta antiga pinte a UI mesmo se chegar depois. TTL compara instantes numéricos (epoch ms), não datas formatadas. Guarde ISO/UTC para persistência e use `Intl.DateTimeFormat` apenas para apresentar em um fuso declarado. `for await...of` processa valores gradualmente; `Array.fromAsync` materializa tudo quando suportado. Em Node, a ordem detalhada de `process.nextTick`, Promise e fases depende do contexto e do formato CJS/ESM; a aula avançada 14.13 explicita o runtime antes da previsão.

## Ponte 13 — Testar, depurar e preservar causas

Um teste útil fixa entrada, saída e borda observável. Um teste de regressão reproduz primeiro a falha antiga, depois protege a correção. `vi.fn` registra chamadas; `vi.spyOn` observa ou substitui um método; timers falsos controlam tempo; uma resposta de rede simulada evita instabilidade externa. O aluno escolhe Run para confirmar hipótese curta, debugger para acompanhar estado em código com múltiplos ramos, teste para uma regra repetível e documentação quando a dúvida é contrato de API. O painel Sources entra junto do breakpoint; Application/Storage junto da migração; Network junto do HTTP; Performance e Memory junto de gargalos.

Use tipos de erro de acordo com o contrato: erro de validação de entrada, status HTTP, parse, timeout, cancelamento e falha interna não são a mesma coisa. `new Error('mensagem pública',{cause:erroOriginal})` preserva a causa técnica sem exibir token. Em `catch` de TypeScript o valor pode não ser `Error`; trate `unknown`. `AggregateError.errors` lista falhas de um grupo; `SuppressedError` preserva erro durante descarte de recurso quando outro erro já existia. A etapa 13.14 retoma o Kanban como software existente e exige testes antes da migração.

## Ponte 14 — Módulos, contratos e execução

Um módulo é um arquivo com fronteira explícita: `export` torna um valor disponível e `import` declara de onde outro arquivo o recebe. Um nome exportado não fica automaticamente global. Caminhos relativos partem do arquivo importador; extensão e modo do projeto fazem parte do contrato do runtime. Separe interface e implementação quando isso melhora a leitura, mas não crie arquivos só para imitar uma arquitetura maior.

Exemplo resolvido A: `export function total(itens) { return itens.length; }` publica uma função nomeada; `import { total } from "./total.js"` recebe exatamente esse nome. Exemplo resolvido B: `export default function iniciar() {}` pode ser importado com um nome escolhido pelo consumidor, enquanto export nomeado exige corresponder ao nome. Exemplo com ajuda retirada: diante de `main.js`, `dados.js` e um erro de import, o aluno identifica o caminho relativo e distingue falha de resolução de caminho de erro na função. Antes de avançar, confirme qual arquivo é a entrada e se o runtime executa ES Modules.

## Ponte 15–19 — Tipo é prova parcial, não parser

TypeScript verifica relações estáticas e remove tipos do JavaScript emitido. Exemplo resolvido A de narrowing: uma entrada `unknown` só aceita `.name` depois de provar que é objeto e que `name` é string. Exemplo B: uma union discriminada separa `loading`, `success(data)` e `error(message)`; o `switch` torna cada campo disponível no ramo correto. Exemplo parcialmente resolvido: retire um ramo e use `assertNever(x:never):never` para que a nova variante gere erro de compilação até ser tratada. `catch(e:unknown)` exige guarda antes de ler `.message`. Uma resposta externa continua precisando de validação runtime mesmo que o código compile.

Exemplo resolvido de generic: `identity<T>(x:T):T` preserva o tipo entre entrada e saída; `first<T>(xs:readonly T[]):T|undefined` preserva tipo e reconhece lista vazia. Exemplo parcialmente resolvido: `get<T,K extends keyof T>(obj:T,key:K):T[K]` relaciona chave e retorno. Conditional types podem distribuir sobre união quando o parâmetro está “nu” à esquerda de `extends`; `[T] extends [U]` muda essa regra. Mapped types expandem uma chave de cada vez e devem ser usados quando preservam uma relação útil, não por complexidade ornamental. `readonly` restringe escrita pela visão tipada, não congela runtime; excess property checks em literal fresco não são schema. `satisfies` verifica forma preservando inferência mais específica, enquanto uma anotação ampla pode alargar nomes de chave. APIs públicas têm `import type` para tipo apagado e import de valor para efeito runtime. A aula de bibliotecas inclui `isolatedDeclarations`; Project References são extensão opcional para projetos grandes.

Conditional types recebem três exemplos graduais antes da etapa 19. Resolvido A: `type Unwrap<T> = T extends Promise<infer U> ? U : T` devolve `number` para `Promise<number>` e conserva `string` para `string`. Resolvido B: `type IsString<T> = T extends string ? true : false` aplicado a `string | number` devolve `true | false`, pois o parâmetro `T` nu distribui sobre a união. Exemplo com ajuda retirada: o aluno recebe somente `type AllStrings<T> = [T] extends [string] ? true : false` e prevê por que `AllStrings<string | number>` é `false`; depois remove/coloca os colchetes em um caso próprio. A etapa 19 só pede uma API tipada independente após essas previsões.

## Ponte 20–23 — Dados grandes e mudança de software

Um iterable entrega valores sob demanda por `next`; um async iterable pode aguardar entre valores. Materializar uma sequência grande em array aumenta memória. `ReadableStream` torna visível backpressure quando o consumidor não acompanha o produtor. `TextEncoder` transforma string em bytes UTF-8 num `Uint8Array`; emoji pode ocupar mais bytes do que unidades UTF-16. Worker recebe dados por mensagem; ao transferir `ArrayBuffer`, o emissor perde acesso ao buffer transferido, diferentemente de uma cópia por `structuredClone` sem transferência. Meça antes de otimizar e reporte múltiplas amostras, ambiente e incerteza.

Na etapa final, leia um mini-repositório antes de editar: README, árvore, teste, fluxo da entrada até a regra e persistência. Depois reproduza a issue, escreva regressão e mude a camada dona. O capstone recebe mudança de requisito e auditoria de operação: entradas externas validadas, DOM seguro, dados antigos migrados, logs estruturados sem segredo, causas de erro preservadas e dependências justificadas. O aluno escolhe ferramentas pelo problema; não há bônus por classe, Proxy, generic, regex, worker ou biblioteca quando uma solução simples cumpre melhor o contrato.
