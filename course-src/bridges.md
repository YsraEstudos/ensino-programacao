# Pontes conceituais e exemplos resolvidos

Estas aulas curtas entram no site antes das atividades indicadas. Em cada ponte, o aluno primeiro prevê, depois executa, compara o resultado com a explicação e só então resolve a atividade. A terceira variação retira ajuda quando houver evidência de domínio. O conteúdo abaixo é a redação de referência para a aula, não apenas um título no currículo.

## Ponte 00 — Linguagem, ambiente e execução

JavaScript é a linguagem. Navegador e Node.js são ambientes que executam JavaScript e oferecem APIs diferentes. `console.log('A'); console.log(2 + 3); console.log('B')` produz A, 5, B nesta ordem: cada chamada é síncrona e o programa passa à próxima instrução depois que a anterior termina. O console é saída observável, não o próprio código. Um `SyntaxError` impede analisar o programa; um erro em execução surge depois que o programa começou; uma saída incorreta pode ocorrer sem exceção. No primeiro contato, leia a mensagem, a linha e a menor expressão que a explica antes de tentar uma alteração. A microponte HTML da etapa 00 apresenta elemento, atributo, hierarquia, `id`, `class`, `input`, `button`, `form` e `label`, somente como pré-requisito explícito para a etapa 11.

Nesta etapa, o site executa o arquivo principal do exercício (normalmente `main.js`) e mostra na área de saída as mensagens que cada `console.log` pedir. Você não precisa configurar nada: cada exercício mostra os arquivos de que precisa e os executa um de cada vez, sem configuração de projeto. Como organizar um programa em vários arquivos será estudado com calma em etapas posteriores.

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

Retomada local da unidade A: antes de avançar, preveja `0 ?? 10`, `null ?? 10`, `NaN ?? 10` e `Number.isFinite(NaN)`. Conferência após sua tentativa: 0, 10, NaN e false. Zero é presente e válido neste exemplo; null é ausência; NaN é presente, mas inválido para um cálculo finito. Preservar com ?? não é validar. Compare também `"pronto" && 7`, `0 && "fim"` e `"" || "reserva"`: os resultados são 7 (number), 0 (number) e "reserva" (string). Explique qual operando foi devolvido, sem transformar todos os resultados em booleanos.

Unidade B (02.10–02.12): arredondamento e utilitários → sorteios e intervalos → decimais → inteiros seguros → tolerância. Releia esta ponte antes de 02.10. Em 02.11, confira o bloco de decimais/valores especiais antes do bloco de inteiros/BigInt.

`Number` usa ponto flutuante binário para números comuns. Alguns decimais, como `0.5` e `0.25`, são exatos; `0.1 + 0.2` é `0.30000000000000004` e sua igualdade com `0.3` é false. Inteiros só são representados sem lacunas dentro do intervalo seguro indicado por `Number.isSafeInteger`; `BigInt` serve a inteiros maiores, mas não resolve frações decimais nem deve ser misturado implicitamente com `Number`. `NaN` representa resultado numérico inválido e não é igual a si mesmo; `Infinity` pode surgir de operações como divisão por zero. Mostre `Math.floor(-1.8)=-2`, `Math.ceil(-1.8)=-1`, `Math.trunc(-1.8)=-1` e `Math.round(1.5)=2`: arredondar, truncar e escolher teto/piso são decisões de domínio distintas. `Math.min(3,5)=3`, `Math.max(3,5)=5` e `Math.abs(-3)=3`. `Math.random()` produz um valor em `[0,1)`; `Math.floor(sorteio*6)+1` transforma esse valor em uma face de 1 a 6. Teste os extremos com sorteios literais 0 e 0.9999999999999999, sem exigir uma saída aleatória fixa. `Math.random` não é fonte criptográfica. Como curiosidade opcional, `Math.round(-0.5)` é `-0`.

Exemplo resolvido A: a regra `Math.abs(a-b) <= tolerancia` compara dois valores finitos quando a tolerância vem da precisão exigida pelo problema. Com a=0.1+0.2, b=0.3 e tolerância=1e-15, o resultado é verdadeiro. Exemplo resolvido B: compare valores perto de 2000 e observe que uma tolerância absoluta escolhida para números perto de 1 pode ser inadequada. A fórmula não deve usar `Number.EPSILON` como constante universal. Exemplo com ajuda retirada: o aluno recebe a resolução de um sensor e uma política explícita que aceita até metade da resolução, inclusive; precisa declarar seu limiar antes de implementar. Resolução sozinha não determina uma política universal. A ponte antecede 02.11 e 02.12.

## Ponte 03 — Decidir antes de repetir

Na unidade 03A, `if/else`, operadores booleanos, `switch` e guard clauses escolhem um caminho. Uma condição não percorre uma coleção. Exemplo A: `let faixa = 'menor'; if (idade >= 18) faixa = 'adulto';` produz uma única decisão; na etapa 04 a mesma ideia vira guard clause com `return` dentro de uma função. Exemplo B: `switch (estado)` escolhe uma entre variantes conhecidas; uma alternativa desconhecida recebe tratamento explícito. A unidade 03B começa só depois dessa prova: `for` e `while` repetem ações; contador mede quantas vezes, acumulador mantém um resultado e `break` encerra o loop. Exemplo A: somar 1,2,3 usa acumulador inicial zero e três atualizações. Exemplo B: encontrar primeiro valor negativo encerra no primeiro match; não precisa percorrer todos. No terceiro exemplo o aluno explica o que a variável representa, do que depende e qual entrada refutaria sua hipótese, em vez de decorar um rótulo de “papel”.

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

Antes do projeto 11.08, trate `localStorage` como persistência do estado do Kanban, não como uma segunda fonte de verdade: leia o registro V1 `{version:1,tasks:[{id,text,status}]}`, valide e reconstrua o estado em memória; depois de cada mudança válida, serialize esse estado. Ao recarregar, restaure as tarefas e renderize o DOM a partir do estado. Se o JSON salvo for inválido, inicie vazio, avise e preserve o valor original para diagnóstico; tarefas criadas pelo usuário devem aparecer como texto literal, não como HTML.

O parser constrói DOM. Script clássico no head pode executar antes do body; `defer` e `type="module"` aguardam o parse; `async` executa quando disponível, sem ordem fixa frente ao parse. `DOMContentLoaded` tem relação específica com scripts adiados/módulos. Em 11.08, construa o Kanban V1 com inclusão, movimentação, persistência e renderização testadas. Em 11.10, pratique outra parte da fronteira modular: `state.js` carrega/salva o V1 e exporta `mover` sem mutar a entrada; `view.js` recebe estado e renderiza a lista; `main.js` importa ambos e `boot` conecta leitura e renderização. Carregue a entrada com `type="module"` por servidor local e confira os imports ESM. O exercício testa essa composição e as funções de estado/renderização; não exige implementar controles da interface.

Exemplo resolvido de segurança: `p.textContent='<img src=x onerror=alert(1)>'` mostra texto literal e não cria imagem. `innerHTML` interpreta markup e não recebe texto não confiável por padrão. Em eventos, capture desce, target identifica a origem e bubble sobe. `preventDefault()` cancela uma ação padrão cancelável; `stopPropagation()` interrompe propagação e não é sinônimo. `once` remove após uma chamada, `passive` promete não cancelar ação padrão e `signal` liga o listener a um `AbortController` para cleanup. Em formulário, `FormData.get` fornece uma entrada e `getAll` preserva nomes repetidos; números continuam strings até conversão e validação. Labels, foco e feedback dinâmico fazem parte do comportamento, não da decoração. A migração de save V1 para V2 (11.13) é a base da V3 de 13.14, que volta com testes.

## Ponte 12 — HTTP, Promise e tempo

HTTP é uma troca entre request e response: método e URL pedem uma operação; status e headers descrevem a resposta; `Content-Type` ajuda a decidir como interpretar o corpo. `fetch` resolve a Promise para muitos status HTTP ruins, então cheque `response.ok`. O corpo é consumível: após `json()` ou `text()`, `bodyUsed` muda e uma segunda leitura falha; faça `clone()` antes da primeira leitura se duas leituras forem realmente necessárias. Nem toda resposta é JSON: use `text`, `blob`, `arrayBuffer` ou `formData` conforme o protocolo. Depois de parsear, ainda valide a forma dos dados externos. A aba Network do DevTools mostra método, URL, status, headers, corpo e tempo para uma falha concreta.

Exemplo resolvido de event loop A: código síncrono A, Promise.then P e timer T produzem A,P,T no navegador. Exemplo B: uma microtask que agenda outra entra na fila; ela não volta à pilha síncrona anterior. Exemplo parcialmente resolvido: compare `Promise.all` (todos necessários), `allSettled` (resultados parciais), `race` (primeiro assentamento) e `any` (primeiro sucesso; todas rejeitam com `AggregateError.errors`). `Promise.try(fn)` chama `fn` imediatamente e encapsula retorno/throw em Promise. `Promise.resolve().then(fn)` também encapsula, mas chama `fn` em uma microtask; não é substituto de mesma ordem. Uma alternativa fiel à ordem básica usa `try { return Promise.resolve(fn()) } catch (e) { return Promise.reject(e) }` quando a API moderna não estiver disponível.

Cancelamento e resposta obsoleta são problemas distintos: `AbortController` tenta interromper trabalho cancelável; um número de geração impede que a resposta antiga pinte a UI mesmo se chegar depois. TTL compara instantes numéricos (epoch ms), não datas formatadas. Guarde ISO/UTC para persistência e use `Intl.DateTimeFormat` apenas para apresentar em um fuso declarado. `for await...of` processa valores gradualmente; `Array.fromAsync` materializa tudo quando suportado. Em Node, a ordem detalhada de `process.nextTick`, Promise e fases depende do contexto e do formato CJS/ESM; a aula avançada 14.13 explicita o runtime antes da previsão.

## Ponte 13 — Testar, depurar e preservar causas

Um teste útil fixa entrada, saída e borda observável. Um teste de regressão reproduz primeiro a falha antiga, depois protege a correção. `vi.fn` registra chamadas; `vi.spyOn` observa ou substitui um método; timers falsos controlam tempo; uma resposta de rede simulada evita instabilidade externa. O aluno escolhe Run para confirmar hipótese curta, debugger para acompanhar estado em código com múltiplos ramos, teste para uma regra repetível e documentação quando a dúvida é contrato de API. O painel Sources entra junto do breakpoint; Application/Storage junto da migração; Network junto do HTTP; Performance e Memory junto de gargalos.

Use tipos de erro de acordo com o contrato: erro de validação de entrada, status HTTP, parse, timeout, cancelamento e falha interna não são a mesma coisa. `new Error('mensagem pública',{cause:erroOriginal})` preserva a causa técnica sem exibir token. Em `catch` de TypeScript o valor pode não ser `Error`; trate `unknown`. `AggregateError.errors` lista falhas de um grupo; `SuppressedError` preserva erro durante descarte de recurso quando outro erro já existia. A etapa 13.14 retoma o Kanban como software existente e exige testes antes da migração.

Preparar o ambiente antes de 13.01: numa pasta nova, `npm init -y`, depois `npm install -D vitest`. Coloque `"type": "module"` e `"scripts": { "test": "vitest" }` no `package.json`, crie `soma.test.js` com `import { test, expect } from 'vitest'` e rode `npm test`: o Vitest fica em modo watch e reexecuta a cada arquivo salvo; `npx vitest run` roda uma vez. O site ainda não executa Vitest, então as suítes desta etapa rodam no seu computador.

## Ponte 14 — Módulos, contratos e execução

Um módulo é um arquivo com fronteira explícita: `export` torna um valor disponível e `import` declara de onde outro arquivo o recebe. Um nome exportado não fica automaticamente global. Caminhos relativos partem do arquivo importador; extensão e modo do projeto fazem parte do contrato do runtime. Separe interface e implementação quando isso melhora a leitura, mas não crie arquivos só para imitar uma arquitetura maior.

Exemplo resolvido A: `export function total(itens) { return itens.length; }` publica uma função nomeada; `import { total } from "./total.js"` recebe exatamente esse nome. Exemplo resolvido B: `export default function iniciar() {}` pode ser importado com um nome escolhido pelo consumidor, enquanto export nomeado exige corresponder ao nome. Exemplo com ajuda retirada: diante de `main.js`, `dados.js` e um erro de import, o aluno identifica o caminho relativo e distingue falha de resolução de caminho de erro na função. Antes de avançar, confirme qual arquivo é a entrada e se o runtime executa ES Modules.

Antes do projeto 14.08, pense na gravação como substituição protegida: serialize os dados válidos em um arquivo temporário no mesmo diretório do destino; somente depois que a escrita terminar, renomeie o temporário para o nome final. Se leitura ou validação do JSON falhar, informe a origem do erro e não escreva nem renomeie: o arquivo anterior continua intacto. O teste do projeto verifica a ordem `writeFile` → `rename` e que o destino do rename é o arquivo final.

## Ponte 15 — O compilador como primeiro leitor

TypeScript verifica relações estáticas e apaga os tipos: o JavaScript que roda é o mesmo sem as anotações. Leia um diagnóstico em três partes: código (`TS2322`), local e frase "Type A is not assignable to type B"; a parte importante costuma ser a última linha do detalhe. A compatibilidade é estrutural: duas interfaces com nomes diferentes e mesma forma são intercambiáveis. Literal fresco é exceção controlada: `{nome:'Ana', extra:1}` passado direto gera erro de propriedade em excesso, mas a mesma forma guardada antes numa variável passa. `any` desliga a verificação e se espalha para tudo que toca; `unknown` exige prova antes do uso. `type Usuario = { nome: string }` e `interface Usuario { nome: string }` descrevem a mesma forma de objeto. Tipos com parâmetro aparecem desde já: `Array<number>` é o mesmo que `number[]`, e `Promise<User>` é a Promise que entrega um `User`; escrever os seus próprios fica para a etapa 17.

Exemplo resolvido A: com `strict` (padrão desde o TypeScript 6), `function nome(u:{nome?:string}){ return u.nome.length }` falha porque `nome` pode ser `undefined`; a correção é decidir o que fazer na ausência, não acrescentar `!`. Exemplo resolvido B: `noUncheckedIndexedAccess` faz `lista[0]` valer `T | undefined`, e `exactOptionalPropertyTypes` distingue "chave ausente" de `{apelido: undefined}`. Exemplo com ajuda retirada: diante de `const u = JSON.parse(txt) as User`, o aluno mostra que o cast compila e mesmo assim `u.name.toUpperCase()` falha quando `name` é número; a verificação do formato pertence à execução. `readonly` impede escrita pela visão tipada, não congela o objeto em runtime.

Para rodar fora do site: `tsc --noEmit` só verifica; o Node.js 24 executa `.ts` com sintaxe apagável (sem `enum` nem `namespace` com valor), e `erasableSyntaxOnly` faz o compilador acusar o que o Node não consegue apagar. O TypeScript 7 rejeita opções que o 6 apenas marcava como obsoletas (`baseUrl`, `moduleResolution: "node"`, alvo ES5).

Antes do projeto 15.08, congele a suíte de runtime da API JavaScript e migre `clamp`, `unique` e `paginar` uma função por vez para `paginacao.ts`. Mantenha nomes e exports, ordem dos argumentos, resultados e erros observáveis; então rode os mesmos casos de runtime e `tsc --noEmit` em modo `strict`. O typecheck verifica relações estáticas, enquanto a suíte confirma comportamento: um não substitui o outro. Registre diagnósticos resolvidos e evite `as any` para silenciá-los.

## Ponte 16 — Estados possíveis, narrowing e exaustividade

Um tipo bom descreve só os estados que podem existir. Dois booleanos `carregando` e `erro` permitem quatro combinações, inclusive a contraditória; uma union discriminada `{status:'loading'} | {status:'success', data:T} | {status:'error', message:string}` permite exatamente três. Narrowing é o compilador acompanhando provas que o código faz: `typeof`, `in`, `instanceof`, comparação com o discriminante e predicates próprios.

Exemplo resolvido A: uma entrada `unknown` só aceita `.name` depois de provar que é objeto não nulo e que `typeof v.name === 'string'`. Exemplo resolvido B: no `switch (estado.status)`, cada `case` libera apenas os campos daquele ramo; ler `data` no ramo `error` é erro de compilação. Exemplo parcialmente resolvido: acrescente uma variante e use `assertNever(x:never):never` no `default`; o compilador aponta cada `switch` que ainda não trata a novidade. `catch (e)` recebe `unknown` em modo estrito: teste `e instanceof Error` (ou `Error.isError(e)`, quando disponível) antes de ler `.message`.

Um type predicate (`v is Pix`) é uma promessa do autor: se a função checa menos do que promete, o compilador confia e o erro aparece em runtime. Cast (`as`) também não verifica nada. `as const` congela literais no tipo e permite derivar a união a partir de um array runtime, mantendo uma fonte única.

## Ponte 17 — Generics preservam relações

Um parâmetro de tipo existe para ligar duas posições: entrada e saída, chave e valor, item e callback. Se a saída é sempre a mesma, uma union ou um tipo fixo basta. `identity<T>(x:T):T` preserva o tipo; `first<T>(xs:readonly T[]):T | undefined` preserva o tipo e admite a lista vazia; `map<T,U>(xs:T[], f:(x:T)=>U):U[]` precisa de dois papéis porque a saída pode mudar de tipo, enquanto `filter` preserva um.

Exemplo resolvido A: `get<T, K extends keyof T>(obj:T, key:K):T[K]` faz o retorno acompanhar a chave escolhida. Exemplo resolvido B: um `Repository<T extends {id:ID}, ID>` mantém o tipo do identificador separado da entidade; uma constraint maior do que o corpo usa (exigir `nome` só para ler `id`) bloqueia consumidores legítimos. Exemplo com ajuda retirada: diante de três assinaturas, o aluno escolhe overload, union ou generic conforme a relação que o consumidor precisa preservar e confirma pela inferência no editor.

`const` em parâmetro de tipo (`<const T>`) mantém literais sem pedir `as const` ao chamador. `enum` gera um objeto em runtime; um objeto `as const` com união derivada produz o mesmo uso sem sintaxe que o Node.js não consegue apagar, por isso é a escolha padrão em código novo. Mantenha `enum` quando ele já existe e o projeto compila com `tsc`.

## Ponte 18 — Derive tipos em vez de copiar

Quando dois tipos repetem os mesmos campos, uma mudança futura atualiza um e esquece o outro. Derive de uma fonte: `keyof` dá as chaves, `T[K]` dá o valor de uma chave, `typeof valor` sobe um objeto runtime para o tipo, e `Partial`, `Pick`, `Omit`, `Record` e `Readonly` transformam uma forma existente. Mapped types expandem uma chave de cada vez e só valem a pena quando preservam uma relação útil.

Exemplo resolvido A: `type Patch<T> = { [K in keyof T]?: T[K] }` aceita alteração parcial; um merge raso ainda substitui um objeto aninhado inteiro, e o tipo não muda essa regra de runtime. Exemplo resolvido B: `const rotas = {...} satisfies Record<string, Rota>` verifica a forma e preserva as chaves literais; a anotação `const rotas: Record<string, Rota>` alarga as chaves para `string` e perde o autocompletar. Exemplo com ajuda retirada: num mapa de handlers indexado pela união de eventos, o aluno acrescenta um evento sem handler e explica o erro que aparece.

`import type` some do JavaScript emitido; um import de valor permanece e executa o módulo importado. Com `verbatimModuleSyntax`, o código precisa dizer explicitamente qual dos dois quer. Índices seguros dependem de `noUncheckedIndexedAccess`; a flag muda a análise, não o código gerado.

## Ponte 19 — Tipos condicionais com orçamento

Um tipo condicional é um `if` avaliado pelo compilador. Expandir à mão antes de confiar no resultado é a habilidade central desta etapa. Resolvido A: `type Unwrap<T> = T extends Promise<infer U> ? U : T` devolve `number` para `Promise<number>` e conserva `string` para `string`. Resolvido B: `type IsString<T> = T extends string ? true : false` aplicado a `string | number` devolve `true | false`, pois o parâmetro `T` nu distribui sobre a união; `IsString<never>` vira `never`. Exemplo com ajuda retirada: o aluno recebe só `type AllStrings<T> = [T] extends [string] ? true : false`, prevê por que `AllStrings<string | number>` é `false` e testa o efeito de tirar e pôr os colchetes num caso próprio.

Template literal types combinam uniões de strings: `` `on${Capitalize<Evento>}` `` gera um nome por evento. Tipos recursivos como `JsonValue` descrevem estruturas aninhadas, mas mensagens de erro ficam difíceis de ler rapidamente. IDs nominais por convenção (`string & {__brand:'UserId'}`) só ajudam se um construtor validar a string antes de aplicar a marca.

Orçamento de complexidade: um tipo avançado precisa de type tests (`@ts-expect-error` para o caso proibido, igualdade de tipos para o permitido) e de um colega que consiga ler a mensagem de erro. Se ninguém da equipe consegue explicar o tipo, prefira uma API mais simples ou validação em runtime.

## Ponte 20 — Iteradores, laziness e bytes

Um iterable entrega valores sob demanda: `[Symbol.iterator]()` devolve um objeto com `next()`, e cada chamada retorna `{value, done}`. Cada `for...of` solicita um iterador, mas isso não garante um cursor novo: um array entrega iteradores independentes; uma instância de generator devolve a si mesma e pode já estar consumida. Para repetir um generator, chame sua fábrica novamente e obtenha outra instância. Um pipeline sobre array pode ser percorrido novamente; sobre a mesma instância de generator, a segunda passagem pode ficar vazia. Laziness significa que `take(3)` limita a três valores entregues; um filtro anterior pode precisar ler e descartar mais entradas. Um teste com contador de `next()` distingue leituras, descartes e entregas. Os iterator helpers (`map`, `filter`, `take`, `drop` em `Iterator.prototype`) permitem compor operações sem arrays intermediários, quando disponíveis no ambiente escolhido.

Exemplo resolvido A: `function* contar(n){ for(let i=0;i<n;i++) yield i }`: o corpo só avança quando alguém chama `next()`. Exemplo resolvido B: interromper um `for...of` com `break` chama `return()` no iterador, e é assim que a fonte libera recursos. Exemplo com ajuda retirada: num pipeline lazy, o aluno prevê quantas leituras `take(0)` faz (nenhuma) e o que acontece quando o consumidor para antes de a fonte falhar.

Um async iterable pode aguardar entre valores; `Array.fromAsync` materializa tudo de uma vez e só convém quando o volume é pequeno. `ReadableStream` torna visível o backpressure quando o consumidor não acompanha o produtor. `TextEncoder` transforma string em bytes UTF-8: `'é'.length` é 1, mas ocupa 2 bytes, e um emoji pode ter `length` 2 e 4 bytes.

## Ponte 21 — Medir, limitar e liberar recursos

Desempenho começa com uma hipótese e uma medida, não com uma otimização. Separe o aquecimento das amostras, repita a medição, reporte mediana e dispersão e descreva o ambiente; uma execução única não prova nada. Confirme que as duas versões produzem o mesmo resultado antes de comparar tempo.

Exemplo resolvido A: um cache `Map` sem limite cresce com cada chave nova; uma política LRU usa a ordem de inserção do `Map` (apagar e reinserir no acesso, remover `keys().next().value` ao passar do limite). Exemplo resolvido B: `WeakMap` serve para associar dados a um objeto sem impedir que ele seja coletado, mas não aceita string como chave nem permite contar ou listar entradas. `getOrInsert` e `getOrInsertComputed` (ECMAScript 2026) substituem o par `has`/`set` quando o runtime oferece. Exemplo com ajuda retirada: o aluno desenha uma linha do tempo de eventos e marca onde debounce e throttle (leading/trailing) chamam a função.

Todo recurso criado tem um dono que o libera: listener, timer, worker, conexão. `using x = recurso` chama `x[Symbol.dispose]()` ao sair do bloco, e `await using` aguarda `Symbol.asyncDispose`; o Node.js 24 suporta os dois, e em navegadores é preciso conferir o suporte. Se o corpo lança A e o descarte lança B, o erro propagado é um `SuppressedError` com `error` = B e `suppressed` = A. Em `postMessage(buf, [buf])`, o `ArrayBuffer` é transferido e fica com `byteLength` 0 no emissor; sem a lista de transferência, o worker recebe uma cópia estruturada.

## Ponte 22 — Pacotes, declarações e fronteiras

Uma biblioteca tem dois contratos: o JavaScript que roda e os arquivos `.d.ts` que descrevem esse JavaScript. Quando eles divergem, o compilador do consumidor confia na declaração e o erro aparece em runtime. Em `package.json`, `"type": "module"` define o formato e `"exports"` lista as entradas públicas; a condição `"types"` vem antes de `"import"` ou `"default"` dentro de cada entrada.

Exemplo resolvido A: `export function parse(txt:string): Result<Config>` com `Result = {ok:true, value:T} | {ok:false, error:string}` obriga o consumidor a tratar os dois casos, sem `try/catch` invisível. Exemplo resolvido B: com `isolatedDeclarations`, exports que exigem análise adicional precisam de anotações para emitir `.d.ts` isoladamente; expressões triviais ainda podem ser inferidas. No TypeScript 6.0.3, `export const VERSAO = "1.0.0"` e `export function um(){ return 1; }` dispensam anotação explícita, mas `export function tamanho(texto:string){ return texto.length; }` exige anotar o retorno `: number`. Confira os dois casos com o compilador escolhido, sem impor anotações a todo o projeto. Exemplo com ajuda retirada: o aluno empacota com `npm pack`, instala o `.tgz` num projeto vazio e confirma que import, tipos e execução funcionam fora do workspace.

Dados externos continuam `unknown` até serem validados: um guard manual serve para formas pequenas, e uma biblioteca de schema compensa quando a mesma forma precisa de validação, tipo derivado e mensagem de erro. Augmentation de módulo global muda o tipo para todo o programa; prefira um wrapper. Migração para TypeScript vai de módulo em módulo, com um critério verificável para avançar (typecheck limpo e testes passando), e um código legado em `checkJs` ou JSDoc continua válido durante a transição.

## Ponte 23 — Ler, mudar e operar um sistema

Leia um mini-repositório antes de editar: README, árvore de arquivos, testes, fluxo da entrada até a regra e persistência. Uma arquitetura útil separa domínio (regras puras), portas (interfaces que o domínio precisa) e adapters (storage, HTTP, DOM). A pergunta de cada mudança é qual camada é dona da regra.

Exemplo resolvido A: uma issue "limite permite 11 itens" começa com um teste que reproduz o caso exatamente no limite; só depois a correção entra, na regra do domínio e não na interface. Exemplo resolvido B: numa revisão de PR, cada achado tem local, impacto e evidência ou correção mínima; "não gostei" não é achado. Exemplo com ajuda retirada: o aluno refatora código legado em passos pequenos, cada um protegido por um teste que passava antes e continua passando depois.

O capstone recebe mudança de requisito e auditoria de operação: entradas externas validadas na fronteira, DOM seguro, dados antigos migrados, logs estruturados sem segredo, causas de erro preservadas com `cause` e dependências justificadas. Construa o sistema (23.08), torne as falhas observáveis (23.09) e só então aplique a mudança de autorização com auditoria (23.07). Escolha ferramentas pelo problema: não há bônus por classe, Proxy, generic, regex, worker ou biblioteca quando uma solução simples cumpre melhor o contrato.
## Ponte 24 — Especializações para o nível sênior

A etapa 24 inicia as especializações da Fase 7. O primeiro lote compartilha práticas de segurança, testes avançados, manutenção profissional e desenvolvimento com IA; os projetos de back-end, front-end e bibliotecas chegam em `24.02`–`24.04` por lotes separados. O mapa de competências distingue introdução, prática, avaliação e evidência declarada.

O lote back-end `24.02` já fornece checkpoint local: API node:http com projetos/tarefas, schema Zod comparado ao guard manual de22.06, SQLite com migrações e rollback real e sessão/autorização por usuário. Depois o aluno porta a fatia para Hono com adaptador Node e executa o mesmo contrato HTTP/banco. Piso específico Node >=24.15.0; node:sqlite é Stability1.2 Release candidate, não API estável2. Logs/erros não revelam segredos, e shutdown/cleanup encerram os recursos. A referência interna não sai no ZIP; evidência continua local-declared. Front-end e bibliotecas seguem pendentes.
