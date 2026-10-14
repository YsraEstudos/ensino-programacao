# Task 4 — mapa semântico dos asserts publicados

Leitura somente do inventário, suítes-fonte `course-src/tests/*.test.js`, assessments canônicos e catálogo publicado. Nenhum arquivo canônico foi alterado. O inventário pós-Task2 tem 878 asserts em 131 IDs distintos (contagem por `Set(cases.map(x => x.id))`), 131 arquivos de teste, 30 asserts sob loops, 36 expressões de entrada em closure e zero erros de parse. Suítes `.types.ts` não entram nesse inventário; o escopo obrigatório atual é `*.test.js`. Atualizar após Task3.

Este mapa é uma passagem semântica prioritária, não cobertura completa: as tabelas trazem 98 IDs e a seção avançada acrescenta quatro notas concretas (18.02, 20.05, 21.04 e 21.05), totalizando 102 dos 131 IDs. O núcleo 04–10 e as suítes Task2 11–14 foram priorizados; a seção avançada registra só casos selecionados. IDs ainda sem linha/nota semântica neste documento: `03.10`, `17.11`, `20.01`–`20.04`, `20.06`–`20.10`, `21.02`–`21.03`, `21.06`–`21.09`, `22.03`–`22.06`, `22.09`, `22.11`, `23.02`–`23.04`, `23.09`–`23.11`. Completar essa revisão antes do gate final; a ausência aqui não significa ausência de asserts ou contrato.

| Faixa | Asserts | IDs |
|---|---:|---:|
| 04 | 82 | 12 |
| 05 | 88 | 10 |
| 06 | 60 | 8 |
| 07 | 87 | 10 |
| 08 | 45 | 7 |
| 09 | 45 | 8 |
| 10 | 67 | 8 |
| 11 | 96 | 13 |
| 12 | 41 | 9 |
| 13 | 61 | 10 |
| 14 | 18 | 3 |

“Direto” significa que a regra e o esperado aparecem em `examples`/`edgeCases`; ainda faltam case IDs por offset. “Completar” indica domínio/resultado ausente. Nome de teste sozinho não é contrato.

## Núcleo 04–10

| ID / asserts | Grupos reais de asserts | Relação com contrato publicado e lacuna |
|---|---|---|
| 04.01 / 1 | retorno composto com `undefined`, `null` e número | Direto: example cobre `a()`…`h()`; edge distingue `null` de `undefined` e os casos de `d`. |
| 04.03 / 2 | `exibir(0)` e `exibir(100)` | Direto: 32°F, 212°F e ordem de dependências. |
| 04.04 / 11 | média, clamp, saudação e sem `console.log` | Valores diretos. Publicar regra explícita “retorna sem imprimir” para o interceptor de logs. |
| 04.05 / 9 | cálculo, tipo `Intl.NumberFormat`, BRL, percentual e compacto | Completar: falta `formatadorBRL instanceof Intl.NumberFormat` e resultado compacto de 999; example/edge cobrem cálculo, BRL, percent e 1200. |
| 04.06 / 7 | dobro/soma, negativos/zero, sem logs | Example/edge sustentam cálculo e o log do starter; declarar não imprimir como regra própria. |
| 04.07 / 14 | taxa/arredondamento, cupom/piso, ordem e inteiro | Direto: valores concretos constam em example/edge. |
| 04.08 / 7 | custo por peso/distância e composição; zero/fração | Direto nos valores publicados. |
| 04.09 / 10 | ataque, defesa com floor, resumo exato e nome vazio | Direto em example/edge; anotar cada matcher, inclusive asserts da ficha composta. |
| 04.10 / 4 | renomeação mantém API e cálculo | Direto: valores normais/zero/piso e API inalterada. Starter funcional é o resultado ensinado. |
| 04.11 / 5 | válidos, string inválida e closure no loop `[-1,101,NaN,Infinity]` | Direto e conferido: string lança `TypeError`; NaN, Infinity, -1 e 101 lançam `RangeError`. Um case do loop precisa publicar os quatro valores e o esperado comum. |
| 04.12 / 7 | JSON válido/inválido, erro original e cleanup | Direto: contexto, identidade do erro de leitura e liberação uma vez. Closure precisa contexto explícito. |
| 04.13 / 5 | opções, desconhecida `null`, entrada inválida `TypeError` | Direto: comum/expressa/noturna, string vazia e número são entradas distintas. |
| 05.01 / 5 | alias e cópia rasa após `pop`/`push` | Direto: example/edge distinguem array compartilhado de cópia. |
| 05.02 / 14 | regex ASCII: início, posição, vazio, newline, hífen/acentos | Direto: example/edge definem alfabeto ASCII e newline final. |
| 05.03 / 3 | slug por trim/caixa/espaços/vazio | Direto nos valores publicados; ordem de Parsons é editorial. |
| 05.04 / 7 | primeira/última, índice zero, ausente e lista intacta | Resultados diretos; publicar imutabilidade como regra explícita se continuar assertada. |
| 05.05 / 16 | busca literal por ponto, vazio, `[x]`, `*`, `()`, `?`, `|`, `$`, `\\`, `+` | Completar: enumerar como literais os metacaracteres dos asserts: `f(x)`, `se?`, `a|b`, `$ 5`, `\\d`, `1+1`. |
| 05.06 / 7 | sort numérico, sem mutação, congelada/vazia, lista nova; percorre `Object.entries(versoes)` | Regra existe; contrato deve nomear as duas versões (“cópia explícita”, “métodos modernos”) e declarar cada entrada/saída em ambas. |
| 05.07 / 10 | estatística, vazio/negativo/fracionário, sem mutação, texto/não finitos `TypeError` | Direto; especificar texto numérico no grupo de entradas rejeitadas. |
| 05.08 / 8 | parser, ordem, sem mutação, delimitadores/campos vazios, pipe em mensagem | Completar com regra explícita de que pipes restantes pertencem à mensagem. |
| 05.09 / 10 | adicionar/listar/remover, duplicata, ausente e isolamento por chamada | Direto: duplicação, primeira ocorrência, `false`, vazio e isolamento publicados. |
| 05.10 / 8 | `flat()` nível 1, entrada intacta, congelada/nova, vazio/profundidade | Direto; publicar identidade de array novo se assertada. |
| 06.01 / 1 | objeto aninhado compartilhado na cópia rasa | Direto: alias a/b e campo aninhado descritos. |
| 06.02 / 5 | alias altera base; spread compartilha interno; reatribuição separa | Direto no example/edge. |
| 06.03 / 2 | normaliza campos permitidos, omite extra, preserva nome vazio | Direto no example/edge. |
| 06.04 / 11 | merge raso, ausente/novo, `false`/`null`/`''`/0, imutabilidade e referência aninhada | Direto no example/edge. |
| 06.07 / 12 | índice por id, último duplicado, vazio, `__proto__` como chave comum, entrada/prototype intactos | Direto no example/edge. |
| 06.08 / 12 | V1→V2, V2, defaults para JSON inválido/vazio, versão futura, preservar original | Direto; edge publica defaults e estado `unsupported`. |
| 06.09 / 9 | save/restore V2, round-trip, default novo, migração, campo extra e vida inválida | Direto; separar status e conteúdo nos cases compostos. |
| 06.11 / 8 | optional chaining não é validação; padrão ausente/null/undefined; preserva falsy; rejeita contêiner | Direto: entradas distinguem 0, false e string vazia. |
| 07.01 / 1 | classifica 12 intenções em `map/filter/find/some/every/reduce` | Tabela pública lista as respostas; decisão codificada/conceitual, sem claim de domínio independente. |
| 07.02 / 9 | groupBy `Map`, ordem de grupos/itens, vazio, objetos originais e não mutação | Completar: publicar tipo `Map` e identidade dos objetos recebidos. |
| 07.03 / 2 | ranking decrescente, desempate por nome/ordem estável | Direto no example/edge. |
| 07.04 / 8 | filtra ativos, soma, `existeCaro` estrito, vazio/zero | Direto: comparação é `total > limite`. |
| 07.05 / 16 | interseção/diferença direcional/subconjunto; vazio/disjunto; entrada intacta e saída nova | Completar: declarar que os Sets retornados são objetos novos. |
| 07.06 / 3 | reduce por categoria, total zero, acumulados independentes, entrada intacta | Direto no example/edge. |
| 07.07 / 14 | contador/agrupador `Map`, ordem, duplicadas, vazio | Publicar o tipo do valor separado: número no contador, arrays no agrupador. |
| 07.08 / 12 | totais, doadores, maior campanha, empate, zero/vazio e sem mutação | Direto no example/edge. |
| 07.09 / 14 | duração, únicas, top/empate na ordem original, taxa, vazio e ordenação em cópia | Direto: example publica tabela completa dos resultados. |
| 07.10 / 8 | flatMap pedidos/itens, cancelados, vazio, array aninhado, ordem e não mutação | Direto; escrever não mutação explicitamente se assert mantida. |
| 08.01 / 1 | classifica crescimento de trechos | Direto na sequência; caso conceitual, sem alegar benchmark real. |
| 08.02 / 2 | soma árvore e ramo ausente | Direto no example/edge. |
| 08.03 / 13 | busca binária, índices/duplicata e acessos via Proxy | Completar: as duas buscas em 1024 elementos agregam leituras e exigem `<100`; publicar máximo 99 leituras combinadas, não “dezenas”. |
| 08.05 / 9 | off-by-one, vazio e undefined legítimo | Publicar undefined como valor possível distinto da sentinela de término. |
| 08.06 / 9 | dedup ordem/SameValueZero, NaN, 1 vs '1', identidade e saída nova; executa em `Object.entries(versoes)` | Publicar identidade de objetos distintos e saída nova e nomear ambas as versões (“com laço e includes”, “com Set”), com domínio/esperados em cada uma. |
| 08.07 / 1 | BFS FIFO, predecessores e caminho mínimo | Direto: publicar a trace de fila/predecessores A→D. |
| 08.08 / 10 | rota mínima/desempate, ciclo, início=fim, ausente/inalcançável | Direto; não mutação explícita se assertada. |
| 09.01 / 1 | binding lexical e ReferenceError fora do escopo | Direto. |
| 09.02 / 7 | factory privada, saldo, depósito inválido e independência | Direto. |
| 09.03 / 8 | multiplicador, fatores distintos/zero | Direto. |
| 09.04 / 1 | closures guardam bindings; método destacado não depende de `this` | Direto. |
| 09.05 / 4 | callbacks guardam índices 0..2/0..3 e n=0 dá lista vazia | Direto; loop n e callback depois do loop precisam contexto explícito. |
| 09.06 / 11 | memoize cache-hit, resultados falsy/undefined/NaN, instâncias isoladas e chave 1 vs '1' | Direto; a suíte não testa objetos apesar de edge delimitá-los fora do contrato. |
| 09.07 / 1 | WeakMap por identidade, não enumerável, primitiva lança | Direto; não afirmar GC. |
| 09.08 / 12 | state/subscribers, unsubscribe, Object.is, ordem, cancelamento durante emissão, stores isoladas | Assert real #6 usa `.not.toThrow` após primeiro cancelamento; edge não publica idempotência. Adicionar regra de segunda chamada sem exceção. |
| 10.01 / 1 | método acompanha call-site `this`; arrow conserva contexto léxico | Direto. |
| 10.02 / 8 | saldo privado, inicialização/deposito e ausência de saldo negativo | Direto. |
| 10.03 / 9 | método compartilhado no prototype e movimento acumulado | Direto. |
| 10.04 / 7 | closure fixa objeto original; wrapper lê objeto atual após reassignment | Direto; declarar fases [5,5] e depois [5,9]. |
| 10.05 / 8 | ordem de `super`, herança e descrição composta | Direto; starter corrigido passa conforme curso. |
| 10.06 / 9 | capacidades compostas, função compartilhada e estado por entidade | Publicar chamadas/valores que distinguem entidades com/sem capacidade. |
| 10.07 / 3 | canal email/SMS intercambiável e mensagens concretas | Assert executável de `criarNotificador`; publicar dois canais e strings esperadas. |
| 10.08 / 22 | entidades/posições isoladas, movimento/dano, capacidade ausente, zero e saturação | Example cobre A–D; detalhar NaN/Infinity/string rejeitados sem mutação e zero válido. |

## Suítes Task2 11–14

| ID / asserts | Grupos reais | Ligação publicada / lacuna |
|---|---|---|
| 11.01 / 1 | target/currentTarget no bubble | Publicar ordem de handlers. |
| 11.02 / 4 | texto literal e remover só item acionado | Incluir descendente que iniciou clique e alvo final. |
| 11.03 / 8 | normalização; nome vazio; loop decimal/zero/texto; preserva edição | Edge direto; capturar valor do loop em runtime. |
| 11.04 / 8 | FormData strings/File/null, checkbox repetido, quantidade crua e vazio | Direto; não alegar coerção Number. |
| 11.05 / 3 | destroy remove listener; rerender não duplica | Declarar contagem de ações após novo render. |
| 11.06 / 3 | botão dinâmico; alvos fora/sem id ignorados; descendente resolve ancestral | Publicar entradas ignoradas e válida. |
| 11.07 / 6 | label/submit, foco/anúncio em erro e sucesso | Um case para foco no campo, outro para resumo. |
| 11.08 / 32 | HTML, add/move, DOM/storage/reload, acessibilidade, texto literal e erros | Edge cobre V1/status/HTML/JSON. Assert `.not.toBe` exige state novo explícito. Suíte protegida usa HTML real da tentativa; limitar preview do DTO. |
| 11.10 / 6 | módulos state/view/main, V1, storage, texto | Direto. |
| 11.11 / 2 | stopPropagation e preventDefault separados | Direto; irmãos e ação padrão precisam distinction explícita. |
| 11.12 / 7 | tags como texto, sem img, newline/vazio | Direto. |
| 11.13 / 7 | V1→V2, idempotência, parcial/JSON inválido | Direto. |
| 11.14 / 4 | once/passive/AbortSignal | Direto. |
| 12.02 / 5 | retry sucesso posterior, erro final original, delay só entre tentativas | Direto. |
| 12.03 / 4 | início independente, ordem de saída, rejection preservada | `.rejects.toBe(failure)` requer fixture `api` e identidade esperada, não só rótulo “propaga”. |
| 12.05 / 4 | `return` vs `return await`, captura sync/async, fallback | Direto. |
| 12.06 / 7 | abort anterior, resposta nova, query/signal, ignora AbortError | Direto. |
| 12.08 / 8 | sucesso, 404/JSON inválido, resposta antiga e loading | Direto. |
| 12.11 / 3 | consumo do body uma vez, clone/JSON inválido/status | Direto. |
| 12.12 / 5 | limite TTL, ISO inválido, fuso | Direto. |
| 12.13 / 2 | parcial `for await` antes da coleção completa | Direto. |
| 12.14 / 2 | AggregateError ordenado e primeiro sucesso | Direto, inclusive vazio e rejeições restantes. |
| 13.02 / 4 | finito, NaN/Infinity TypeError, divisor zero RangeError | Direto; manter regra específica do ID. |
| 13.03 / 7 | páginas, invalidade, além do fim e sem mutação | Direto. |
| 13.05 / 3 | remove undefined e preserva falsy/ordem | Publicar qual falsy mínimo o assert usa. |
| 13.06 / 6 | parser, escapes, último par, vazio e SyntaxError | Direto. |
| 13.07 / 6 | clamp e intervalo invertido | Direto. |
| 13.08 / 6 | clamp, unique SameValueZero, página e não mutação | Direto. |
| 13.09 / 7 | retry, erro final sem delay, timer injetado | Direto. Source usa `it()`, inventory traz label nulo; suportar `it` no contexto AST. `.rejects.toBe(failure)` valida identidade. |
| 13.10 / 7 | sucesso, erro não-Error seguro, cause e segredo omitido | Direto; DTO não pode expor segredo. |
| 13.13 / 7 | teclado/foco/label/delegação/texto | Direto. |
| 13.14 / 8 | V1→V2→V3, preservação, idempotência e dados inválidos | Direto. |
| 14.02 / 5 | CLI separa argv/domínio, sucesso e status 2 | Direto. |
| 14.06 / 7 | defaults/branco/port válida; loop de portas inválidas; log level/TOKEN | Edge enumera abc/0/65536; loop inclui 2.5. Publicar decimal inválido como RangeError; mensagem não revela TOKEN. |
| 14.08 / 6 | add/list/remove, storage e temp+rename; argv separado | Direto. |

## Avançados e amostra

- 18.02 (5): o teste protegido de `aplicarPatch` verifica conteúdo da cópia, nova identidade (`.not.toBe`), referência interna compartilhada e base original intacta. `assessment.tests` inline deve carregar a mesma anotação sem desfazer a normalização de `../patch.js` para `./patch.js`.
- 20.05 (7): example publica age=20 e age=-1 → RangeError. Source percorre [-1,151,1.5,NaN,"20"], espera RangeError e comprova age ainda 150. Publicar o domínio completo, limite 0..150, erro e não mutação; edge atual só cobre escrita aninhada sem proxy.
- 21.04 (5): edge já publica A,B,A,C → B removida, recálculo, zero como cache válido e capacidade zero. Task7 deve manter contrato LRU sem voltar ao briefing TTL.
- 21.05 possui três asserts em loops; Task7 alterará a suíte, então esperar os offsets finais.
- 22.07 `.types.ts` não aparece no inventory; extensão TypeScript posterior. Comportamento protegido em atividade TypeScript que fica no escopo JS é 18.02.
- 09.08 `.not.toThrow` está realmente no source; falta contrato explícito de idempotência.

Oito candidatos para futura amostra humana, com trechos fonte inspecionados: 04.11 loop de quatro valores/RangeError; 05.06 sort numérico nas duas variantes; 09.08 segunda chamada de unsubscribe sem throw; 12.03 identidade de rejection; 13.09 identidade de erro final de retry; 18.02 `.not.toBe` em comportamento protegido inline; 11.08 HTML literal protegido; 20.05 loop de inválidos e estado preservado. Os casos 09.08 e 20.05 têm lacuna de publicação anotada acima; amostra técnica precisa confirmar suporte contratual por assert antes da revisão humana. Nenhum case foi anotado ou declarado revisado por humano.

O inventory não identifica o nome do teste de 13.09 porque source usa `it()`; extrator AST deve suportar `it` junto de `test`, sem reatribuir IDs por ordem de execução.
