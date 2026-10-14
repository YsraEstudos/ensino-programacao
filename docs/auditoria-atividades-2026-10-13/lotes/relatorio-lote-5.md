# Relatório de auditoria — Lote 5 (11.08 a 13.13, 30 atividades)

Escopo: as 30 atividades foram lidas integralmente, seguindo o checklist do briefing (itens 1–12). Verificação executada: o starter da 12.04 foi rodado em Node 26 (saída `A,B,P1,Q,P2,T`) e o starter da 12.05 foi rodado com o teste 2 (falha, como esperado) e o teste 4 (não consegue falhar). Os demais achados são leitura direta dos campos JSON.

Contagem: ALTA 15 · MÉDIA 12 · BAIXA 3 · OK 0.

Planos neste lote: CONFIRMA que 14 das 30 atividades são só rubrica (`assessmentEnvironment: rubric`, sem teste automatizado). REFUTA a parte "74 sem assessment" para este lote: todas as 30 têm bloco `assessment`.

## Achados transversais (afetam várias atividades)

- **T1 — hints[0] truncado em todas as 13.x (NOVO, ALTA).** Nas 13 atividades 13.01 a 13.13, a primeira dica (`hints[0]` e `preparation.hints[0]`) é cortada no meio de uma palavra: 13.01 termina em "…Re", 13.02 em "…throw T", 13.03 em "…testes existentes só page=", 13.04 em "…prever, executar, br", 13.05 em "…item zero", 13.08 em "…API docum", 13.09 em "…fak", 13.10 em "…lançar erro de domínio co", 13.12 em "…requisito descon", 13.13 em "…form com label,". Nas 12.x e 11.x a dica está completa. Correção no gerador: não truncar o texto, ou truncar só em fronteira de frase.
- **T2 — boilerplate colado no prompt e em practiceSteps das 13.x (NOVO, MÉDIA).** O texto "Starter de trabalho: …" é concatenado ao prompt e a `practiceSteps`, seguido de "Registre sua primeira decisão antes de executar; depois compare previsão, evidência e justificativa." Isso mistura descrição do starter com instrução genérica e duplica conteúdo. Correção: separar `starterSummary` do prompt e deixar a instrução de previsão só em `predictionGuide`. Relacionado ao CONFIRMA do plano sobre instruções de UI nos prompts (ver 12.01, 12.14, 13.04).
- **T3 — "Volte à regra pertinente e explique qual evidência a sustenta." em todos os common_trap e notes das 13.x (NOVO, BAIXA).** Frase de gabarito genérica, sem relação com a armadilha. Correção: escrever a orientação específica de cada armadilha.
- **T4 — starter sem o arquivo que ele importa (NOVO, ALTA).** 13.03 (`pagination.js`), 13.09 (`retry.js`) e 13.13 (HTML do formulário) dependem de arquivos ausentes em `starterFiles`. Detalhes nas seções.
- **T5 — o texto do stageBridge contradiz autoTested (NOVO, MÉDIA).** A 13.01 diz "O site ainda não executa Vitest, então as suítes desta etapa rodam no seu computador", mas 13.02, 13.03, 13.05 a 13.10 e 13.13 estão com `autoTested: true` e `assessmentEnvironment: javascript`/`dom`. Correção: declarar em cada atividade onde a verificação roda (site ou computador local).
- **T6 — transfers genéricos (CONFIRMA rubricas genéricas do plano).** Os transfer.md/transfer.js repetem o enunciado com "Cenário independente", "Critérios já publicados" e "Casos avaliáveis"; quase nenhum tem teste executável. Alguns têm texto sem sentido (ver 11.13).

---

### 11.08 — Microprojeto - Kanban acessivel e persistente  [Gravidade: ALTA]
- **Escrita:**
  - `explanation.why_it_matters`, `conceptSteps[3]` e `notes[1]` falam de outro projeto: "Crie uma lista de reservas de equipamento com estado consistente…". Correção: "Um quadro de tarefas precisa de uma única fonte de verdade: o estado em memória. Renderize e persista a partir dele."
  - `review.incorrectFeedback` começa com a armadilha colada: "Revise esta regra: Escrever DOM e storage como duas fontes de verdade ou renderizar texto via HTML." Correção: "Não. O DOM e o storage são cópias derivadas do estado; ler o DOM como fonte de verdade faz o estado divergir."
  - `index.html` não carrega `app.js` nem `style.css` (sem `<script type="module">` nem `<link>`), e o prompt pede app ponta a ponta no navegador. Correção: adicionar as duas linhas ao starter ou pedir explicitamente no enunciado.
  - `app.js` chama `warn('JSON inválido')`, mas o teste exige `#aviso` com "inválidos". Correção: escolher uma mensagem e usá-la nos dois lugares (ou testar com regex `/inválid/`).
- **Lógica:**
  - Contrato oculto: o teste exige `montarKanban(document, storage)` retornando objeto com `getState()`, cartões em `#todo li span`, botões `button[data-move-to=doing]` com texto "Mover para Em curso", e avisos contendo "adicionada", "Informe" e "Em curso". Nada disso está no prompt, na interação ou no starter. Correção: declarar a API e a estrutura do DOM no enunciado.
  - `mover` deve lançar `RangeError` para status inválido (teste "rejeita status"). O starter devolve `estado` sem validar, e a regra só aparece em `edgeCases`. Correção: incluir na assinatura do enunciado.
  - O teste "rejeita status" usa id `'t1'` inexistente no estado. Ele não prova o caso de id existente. Correção: adicionar um caso com tarefa existente.
  - `transfer.js` pede `carregarLista` com "add/move/remove", função que não existe no starter nem no tema principal; o arquivo só lança erro e não há teste. Correção: trocar o nome da função pelo do contrato real e adicionar um teste.
- **Novo vs planos:** NOVO (contrato oculto, starter sem script, why_it_matters de outro projeto, mensagem de aviso divergente, transfer com função inexistente). CONFIRMA a rubrica genérica "Rode critérios comportamentais e revisão humana para decisões abertas." em `rubric` e `scoring`.

### 11.10 — Kanban em três módulos  [Gravidade: MÉDIA]
- **Escrita:**
  - `why_it_matters`, `conceptSteps[2]` e `notes[1]`: "Extraia model/view/main de um app de lembretes…". É outro app. Correção: "Extraia state/view/main do Kanban mantendo uma fronteira testável para regras e persistência."
  - `mental_model` diz "View recebe snapshot e callbacks", mas `view.js` e o teste usam `render(document, state, list)`, sem callbacks. Correção: "View recebe o estado e o elemento da lista."
  - O prompt pede "valide o carregamento no navegador", mas o starter não tem `index.html` e `main.js` não é chamado por nenhuma página. Correção: incluir o HTML mínimo com `<script type="module" src="main.js">`.
  - `duration: 22 min` para desenhar setas, separar três módulos, conectar o `main` e rodar testes. Correção: 35 min ou reduzir o escopo.
- **Lógica:**
  - `view.js` do starter usa `item.innerHTML = task.text`, o bug que a própria explanation diz evitar, e não há comentário TODO sobre isso. O teste de view exige `textContent`. Correção: comentar o defeito no starter ou trocar por `textContent` com dica.
  - Contrato oculto da view: o teste usa um `document` falso cujo `createElement` devolve `{textContent: ''}` e espera `list.replaceChildren(...nodes)`. Uma implementação com `createTextNode` ou `append` falha. Correção: declarar `replaceChildren` e `createElement` no enunciado.
  - Título enganoso no teste 2 "JSON inválido não sobrescreve": o teste chama `salvar` depois, que grava. Correção: renomear para "carregar não grava ao ler JSON inválido".
  - `main.js` (`boot`) não tem teste, mesmo com o prompt pedindo carregamento e o edge case "file:// -> servir por HTTP". Correção: teste de `boot` com storage e lista falsos.
- **Novo vs planos:** NOVO (exemplo e rationale de outro app, starter com innerHTML, contrato de view não declarado, boot sem teste). CONFIRMA a rubrica genérica "Rode regressões antigas e novos casos; avalie mudança localizada.".

### 11.13 — Save antigo no Kanban  [Gravidade: ALTA]
- **Escrita:**
  - `mental_model`: "Converta done para status e gere IDs estáveis antes de salvar V2." Nenhum formato do lote tem campo `done`: V1 usa `status: 'todo'`. Nenhum teste gera ID. Correção: "Valide cada registro, preencha `priority: 'normal'` quando ausente e preserve `id`, `text` e `status`."
  - `worked_example`, `why_it_matters`, `conceptSteps[3]` e `notes[1]` falam de "lista antiga de favoritos". Correção: usar tarefas do Kanban.
  - O prompt diz "Planeje o carregamento por etapas", mas os testes exigem código. Correção: "Implemente `carregar(entrada, avisos)` …".
  - O comentário do starter diz `carregar(entrada)`, mas o teste chama `carregar(value, warnings)` e lê `warnings.length`. Correção: documentar o segundo argumento no starter.
  - `transfer.js` pede `migrarV2ParaV3` "preservando tema; acrescenta atalhos vazio". Não há tema nem atalhos no lote. Correção: "Implemente `migrarV2ParaV3`, que acrescenta `archived: false` a cada tarefa; repetir a migração não altera registros."
  - Regras contraditórias: o edge principal diz "registro parcial é ignorado com aviso", e o transfer diz "dado parcial não perde campos". Correção: escolher uma regra e alinhar os dois textos.
- **Lógica:**
  - Teste 4 ("JSON inválido retorna vazio sem storage write") é vacuoso: passa um objeto `storage` como `entrada` de `carregar`, não uma string. Qualquer implementação que devolva `{tasks: []}` para entrada desconhecida e nunca chame `setItem` passa, inclusive uma que ignora o storage. Correção: testar `carregar('{')` com string, ou criar `carregarDoStorage(storage)` separado.
  - Teste 2 aceita qualquer implementação que devolva a entrada intacta, porque o V2 de entrada já tem `priority`. Não prova que V2 sem `priority` não é migrado de novo. Correção: `carregar({version:2, tasks:[{id:'x', text:'x', status:'todo'}]})` deve voltar sem `priority`.
  - O edge "prioridade válida existente é preservada" não tem teste. Correção: `carregar({version:1, tasks:[{id:'a', text:'x', status:'todo', priority:'high'}]})` deve manter `'high'`.
  - Contrato oculto: a função deve aceitar `warnings` como array e preencher um item por registro descartado. Correção: declarar no enunciado.
- **Novo vs planos:** NOVO (campo `done` inexistente, exemplo de favoritos, teste vacuoso, regra de registro parcial contraditória).

### 12.10 — Antes de fetch: HTTP  [Gravidade: MÉDIA]
- **Escrita:**
  - `stageBridge` (~2.400 caracteres) mistura HTTP com event loop, `Promise.all/allSettled/race/any`, `Promise.try`, TTL, `Intl`, `for await`, `Array.fromAsync` e `AbortController`. A atividade é READ de 10 min sobre quatro trocas. O texto também cita a "aula avançada 14.13" antes de o aluno chegar lá. Correção: manter só os parágrafos sobre HTTP e mover o restante para as atividades 12.01 a 12.14.
  - `why_it_matters` e `conceptSteps[3]` falam de "upload que pode ser aceito para processamento ou rejeitado", mas nenhuma troca do material é upload. Correção: "Projete o tratamento de resposta para um POST que cria recurso e para um GET que lista."
  - `material.md`: a Troca 4 não tem linha `Request:`, enquanto as outras têm. Correção: acrescentar `Request: DELETE /itens/2` ou explicar a ausência.
  - `worked_example`: "Uma requisição de imagem em faixa pode responder 206…". "Faixa" não é o termo para "Range". Correção: "Uma requisição de intervalo (Range) pode responder 206 Partial Content…".
  - `rubric`: "traceie status, headers e corpo" usa a forma "traceie". Correção: "rastreie".
- **Lógica:**
  - `edgeCases`: "200/201 com Content-Type ausente ou diferente de application/json -> TypeError". Isso contradiz `stageBridge` ("Nem toda resposta é JSON: use text, blob…") e a própria `explanation` ("Escolha parser conforme status e Content-Type"). Correção: definir a política no enunciado ou remover o caso.
- **Novo vs planos:** NOVO (bridge sobrecarregado com forward reference a 14.13, why_it_matters de upload, Troca 4 incompleta, política de TypeError arbitrária).

### 12.11 — Response tem corpo consumível  [Gravidade: MÉDIA]
- **Escrita:**
  - O comentário do starter diz que o cliente precisa tratar "cancelamento", e a rubrica pede "abort", mas `carregar(url, fetcher)` não recebe nenhum sinal de cancelamento. Correção: declarar a assinatura, por exemplo `carregar(url, fetcher, {signal})`.
  - O prompt pede "registre bodyUsed antes/depois", sem dizer onde registrar. Correção: "Retorne `{valor, bodyUsedAntes, bodyUsedDepois}` ou escreva no console."
- **Lógica:**
  - Rubrica: "reproduza 503, uma leitura, 204, JSON inválido, abort e clone antes da segunda leitura." São seis cenários em 20 min, sem fixtures de `fetch` no material (a fixture 503 só existe num comentário). Correção: fornecer as Responses locais ou reduzir a três cenários.
  - O starter lê `resposta.json()` sem checar `response.ok`. Esse é o defeito que a atividade quer ensinar, mas nenhum TODO aponta para ele. Correção: adicionar `// TODO: checar resposta.ok antes de ler o corpo`.
  - Os exemplos (`await res.json()` deixa `bodyUsed=true`, e a segunda leitura lança `TypeError`) estão corretos.
- **Novo vs planos:** NOVO (assinatura de abort indefinida, starter sem TODO no defeito, cenários demais para o tempo). CONFIRMA a rubrica genérica "Rubrica de hipótese, evidência da ferramenta, conclusão e reprodução." em `rubric` e `scoring`.

### 12.01 — Ordem do event loop  [Gravidade: BAIXA]
- **Escrita:**
  - `checks.scoring` e `rubric`: "Compare resposta registrada antes de Run com sequência/valor previstos". "Run" é termo de interface, não de tarefa. Correção: "Compare a previsão registrada com a saída do console."
  - `review.prompt` ("Quando a função passada ao construtor new Promise(executor) é executada?") cobra um conceito que o exercício não usa. Correção: perguntar "Qual log sai por último no starter e por quê?" ou "Por que `setTimeout(…, 0)` não roda antes das microtasks?".
- **Lógica:**
  - Gabarito `A,B,P,T` está correto por raciocínio sobre a fila (não foi executado nesta auditoria): síncrono A e B, microtask P, timer T.
  - Sem teste automatizado (rubric). Aceitável para READ/PREDICT, mas a rubrica "explique fila de microtasks/timer com previsão anterior" não tem exemplo de resposta. Correção: incluir uma resposta-modelo curta.
- **Novo vs planos:** CONFIRMA a instrução de UI misturada ao prompt de predição ("antes de Run"). NOVO (pergunta de review fora do tema da atividade).

### 12.04 — Microtask vs task  [Gravidade: ALTA]
- **Escrita:**
  - `examples.expected`, `checks.fixture.expected`, `hints[1]` e `preparation.hints[1]` dizem `A,B,P1,Q,T`. O resultado está errado: P1 agenda P2 como microtask na fila, e P2 roda antes do timer. O edge case e a rubrica dizem `A,B,P1,Q,P2,T`, o que mostra que o exemplo público contradiz o próprio gabarito. Correção: trocar para `A,B,P1,Q,P2,T` nos quatro lugares.
- **Lógica:**
  - Execução em Node 26 do starter exato: `A`, `B`, `P1`, `Q`, `P2`, `T`. O gabarito correto é esse. O exemplo público leva o aluno a uma resposta errada e o aluno que a confirmar "passa" pelo exemplo.
  - A rubrica diz "explicação curta sobre a primeira divergência", mas não define a divergência nem o gabarito que o avaliador compara. Correção: "Se o aluno escrever `A,B,P1,Q,T`, a divergência é P2 esquecido: a microtask agendada por P1 entra no fim da fila antes de T."
- **Novo vs planos:** NOVO (exemplo público com ordem errada, verificado em execução). CONFIRMA a rubrica genérica "Compare estados e ordem; peça explicação curta sobre a primeira divergência." em `rubric` e `scoring`.

### 12.02 — Parsons de retry  [Gravidade: MÉDIA]
- **Escrita:**
  - O prompt pede "Inclua validação", mas o `material.md` não tem nenhum bloco de validação, e o edge case "max<=0 -> RangeError" não pode ser montado com os blocos A a H. Correção: acrescentar um bloco `if (!Number.isInteger(max) || max < 1) throw new RangeError('max inválido');` ou remover a exigência do prompt e do edge case.
  - A rubrica "não exija ordem entre blocos independentes" não diz quais blocos são independentes. Correção: listar a ordem única A, B, C, D, E, F, G, H e a dependência de E antes de F.
- **Lógica:**
  - A ordem A→H reproduz o exemplo público (três chamadas com `max=3`), verificado por leitura do laço.
  - Com `max=0`, o laço não entra e a função devolve `undefined` sem erro. Esse comportamento não está em nenhum bloco. Correção: o bloco de validação do item anterior resolve.
- **Novo vs planos:** CONFIRMA parcialmente o pré-requisito de `throw` antes da etapa 13: há primer na própria atividade, mas o lote não o lista. NOVO (validação sem bloco, max<=0 sem caminho).

### 12.03 — Complete Promise.all  [Gravidade: ALTA]
- **Escrita:**
  - O prompt diz "mantendo a ordem da API no objeto retornado", e a explanation diz "monte a resposta por nome" e "Desestruture resultado". O teste e o starter exigem array: `toEqual([1, 2, 3])` e "devolver os resultados na ordem acima". Correção: "devolvendo um array na ordem produtos, usuarios, precos" e trocar "por nome" por "por posição".
  - `checks.scoring`: "Avalie somente as decisões retiradas e execute o arquivo completo." A expressão "decisões retiradas" não tem sentido. Correção: "Execute o arquivo completo e avalie a justificativa do limite de rejeição."
- **Lógica:**
  - Teste 2 ("mantém ordem declarada mesmo com conclusão fora de ordem") usa `Promise.resolve` imediato. Todas as promises terminam na ordem de chamada, então o nome do teste promete o que ele não faz. Correção: usar `setTimeout` com atrasos invertidos, como no teste 1, ou renomear o teste.
  - Teste 1 verifica `started` de forma síncrona, o que prova que as três chamadas saem antes do primeiro `await`. Isso está correto.
  - Teste 3 (propaga rejeição) está correto.
- **Novo vs planos:** NOVO (objeto versus array, teste 2 não cumpre o nome). CONFIRMA a rubrica genérica "Avalie somente as decisões retiradas e execute o arquivo completo.".

### 12.05 — Bug de await e captura local  [Gravidade: ALTA]
- **Escrita:**
  - O prompt diz "Repare as duas versões assíncronas", mas o starter tem uma única função `carregar`. Correção: "Repare `carregar` para que o `catch` local receba a rejeição de `fetchProfile`."
  - `edgeCases`: "await faltante propaga Promise como valor" está errado. Dentro de uma função `async`, `return promise` é adotado: o chamador recebe o valor resolvido, não a Promise. Verificado em Node: com o starter, `await carregar(() => Promise.resolve(data))` devolve `data` (mesma referência). O que o bug faz é deixar a rejeição sair da função sem passar pelo `catch`. Correção: "return fetchProfile() sem await dentro do try: a rejeição escapa e o catch local não atua."
- **Lógica:**
  - Teste 4 ("não devolve Promise como dado de sucesso") não pode falhar com nenhuma implementação: `await` de uma função `async` nunca entrega uma Promise ao chamador. Verificado em Node: o starter passa no teste 1 (o teste 4 é argumento de semântica, não executado). Correção: remover o teste 4 e substituí-lo por um caso em que o dado resolvido é diferente do fallback, por exemplo `await carregar(() => Promise.resolve({nome:'ok'}))` deve ser `{nome:'ok'}`.
  - Teste 2 falha no starter (verificado: a rejeição sai da função). Esse é o caso que realmente detecta o bug.
- **Novo vs planos:** NOVO (teste 4 impossível de falhar, edge case factualmente errado, "duas versões" sem segunda versão).

### 12.06 — Busca cancelável  [Gravidade: ALTA]
- **Escrita:**
  - `checks.scoring` e `rubric`: "Aceite qualquer implementação que cumpra entrada, saída, erro e efeitos declarados." Os testes exigem `null` para resposta obsoleta e para `AbortError`, e esse valor não é declarado em nenhum lugar. Correção: declarar no enunciado "resposta obsoleta e AbortError resolvem com `null`".
  - `examples`: "B visível; A abortada". Não há UI nem "visível" no starter; o teste verifica o retorno. Correção: "buscar('B') resolve com o resultado de B; a primeira promise resolve com `null`".
- **Lógica:**
  - Contrato oculto: o teste 1 exige que `buscar('A')` resolva com `null` depois de `buscar('B')`; o teste 2 exige `null` para AbortError; o teste 3 exige que o valor do fetcher seja repassado. Nada disso aparece no prompt.
  - Teste fraco: uma implementação que engole qualquer erro passa nos três testes. Exemplo: `return async function buscar(q){ try { /* sequência + abort */ return await fetcher(q,{signal}); } catch { return null; } }`. A transferência pede "falha real aparece ao usuário", mas nenhum teste cobre isso. Correção: adicionar `test('falha real propaga', async () => { await expect(criarBusca(() => Promise.reject(new Error('rede')))('A')).rejects.toThrow('rede'); })`.
- **Novo vs planos:** NOVO (null não declarado, teste que aceita erro engolido). CONFIRMA a rubrica "Aceite qualquer implementação que cumpra entrada, saída, erro e efeitos declarados.", que é contraditória com os testes.

### 12.07 — Combinadores de Promise  [Gravidade: MÉDIA]
- **Escrita:**
  - `review.correctFeedback` ("Um resumo de viagem precisa tanto do horário…Promise.all") não responde a pergunta sobre `any` versus `race`. Correção: "Correto: `any` espera o primeiro sucesso; `race` encerra no primeiro estado, cumprido ou rejeitado."
  - Os seis requisitos do `material.md` caem em quatro combinadores, e dois pares repetem o mesmo combinador: "primeiro a terminar" e "corrida com timeout" viram `race`; "primeiro sucesso" e "consultar réplicas" viram `any`. Não há gabarito fixo, e a rubrica "Aceite escolha justificada por diferença semântica publicada" aceita quase qualquer escolha. Correção: publicar um gabarito com a justificativa esperada para cada requisito.
- **Lógica:**
  - A rubrica pede "registre AggregateError e cleanup de timeout", mas o material não pede código de timeout nem de cancelamento. A `explanation` manda "planeje cleanup", sem exemplo. Correção: incluir um trecho pequeno com `clearTimeout` ou remover a exigência.
  - Sem teste automatizado. Aceitável para COMPARE, desde que o gabarito exista.
- **Novo vs planos:** NOVO (gabarito ambíguo, feedback da pergunta errado). CONFIRMA a rubrica genérica "Aceite escolha justificada por diferença semântica publicada.".

### 12.09 — Normalizar callbacks com Promise.try()  [Gravidade: MÉDIA]
- **Escrita:**
  - `objective` pede "antes de implementar feature detection", mas o prompt e a rubrica não pedem detecção. A rubrica pede "disponibilidade real". Correção: pedir explicitamente `typeof Promise.try === 'function'` no fluxo.
  - `material.md`, linha 2: `const nativo = Promise.try(callback);` está sem guarda. Em runtimes sem `Promise.try`, o material quebra antes de chegar ao aluno. Correção: `const nativo = typeof Promise.try === 'function' ? Promise.try(callback) : null;`.
  - `review.prompt` ("Para que serve uma verificação de capacidade…") não testa a diferença central da atividade (síncrono versus microtask). Correção: perguntar "Em `Promise.try(fn)`, quando `fn` roda?" com a resposta "imediatamente, na pilha atual".
- **Lógica:**
  - O fallback fiel do starter (`try { return Promise.resolve(callback()); } catch (erro) { return Promise.reject(erro); }`) está correto e os exemplos públicos (3 e 4) também.
  - Sem teste automatizado. A rubrica "registre runtime, fonte/data…" pede data e fonte que o enunciado não define.
- **Novo vs planos:** NOVO (guarda ausente no starter, feature detection não pedida, pergunta de review fora do alvo).

### 12.12 — Tempo, expiração e fuso  [Gravidade: MÉDIA]
- **Escrita:**
  - `transfer.js`: "limite inferior inclusivo" para `isFresh` é ambíguo e parece contrariar o starter, que declara o limite como exclusivo. Correção: "fresco se `nowMs - savedMs < ttlMs` (limite superior exclusivo)".
  - O prompt pede "exibição no fuso America/Sao_Paulo" e a explanation diz "Intl formata só na interface com timeZone declarado", mas nem o starter nem os testes têm formatação. O entregável não é verificado. Correção: adicionar `formatarHorario(ms, timeZone)` ao starter e um teste, ou remover o pedido do prompt.
- **Lógica:**
  - Starter com `nowMs - savedMs <= ttlMs` está errado, e o teste 1 detecta: `isFresh(saved, saved+60000, 60000)` devolve `true` no starter, mas o teste exige `false`. Correto.
  - Teste 2 ("ISO inválido é stale") passa `NaN` diretamente e não chama `parseIsoDate('lixo')`. Correção: `expect(isFresh(parseIsoDate('lixo'), 0, 60)).toBe(false)`.
  - Teste 3 ("instante ISO não depende do fuso") só verifica `Date.parse`, não o fuso. Correção: rodar com outro `TZ` (ou renomear o teste) e checar que o resultado não muda.
  - Valor 1767225600000 de `Date.parse('2026-01-01T00:00:00.000Z')` está correto.
- **Novo vs planos:** NOVO (limite contraditório na transferência, entregável de formatação sem teste, teste de ISO não testa o ISO).

### 12.13 — Iteração assíncrona antes de materializar  [Gravidade: MÉDIA]
- **Escrita:**
  - `examples`, `checks.fixture` e `hints[1]`: "Array.fromAsync(pagina())". `pagina` não existe no starter, que usa `valores()`. Correção: "Array.fromAsync(valores()) -> [1,2] após o fim".
  - `primers`: "Generators são estudados na etapa 20." Esta atividade, da etapa 12, usa `async function*` e `for await` antes da etapa de generators. Pré-requisito oculto que o plano não cita. Correção: reescrever com `async` e `await` sem generator, ou mover a atividade para depois da etapa 20.
  - `stream.js` tem `return comparar();` no nível superior. Isso só é válido em CommonJS: em módulo ESM (`"type": "module"`) dá `SyntaxError`. Correção: trocar por `comparar();` e informar o formato do arquivo.
- **Lógica:**
  - Sem teste automatizado. A rubrica "condicione Array.fromAsync ao runtime" é atendida pelo `typeof` do starter.
  - Edge case "fonte com dois itens" não está no starter.
- **Novo vs planos:** NOVO (generator antes da etapa 20, `pagina` inexistente, `return` no topo).

### 12.14 — Falha agregada  [Gravidade: BAIXA]
- **Escrita:**
  - `worked_example`: "Uma página tenta duas fontes de fonte tipográfica". Correção: "Uma página tenta carregar a fonte tipográfica de duas origens; a primeira que cumpre permite renderizar, mesmo que uma falha anterior tenha chegado antes."
  - `checks.scoring` e `rubric`: "Compare resposta registrada antes de Run…" é instrução de interface. Correção: "Compare a previsão registrada com a saída do console."
- **Lógica:**
  - Gabarito verificado: `errors` na ordem das entradas (`review` e `examples`), `AggregateError` com `errors` vazio para array vazio (edge case) e sucesso tardio após rejeição anterior. Todos corretos.
  - Sem teste automatizado. A rubrica é aceitável para PREDICT de seis minutos.
- **Novo vs planos:** CONFIRMA a instrução de UI ("antes de Run") no prompt de predição. NOVO (expressão "fonte de fonte").

### 12.08 — Microprojeto - dashboard de API  [Gravidade: ALTA]
- **Escrita:**
  - `explanation.mental_model` e `preparation.explanation`: "Cheque response.ok e Content-Type". O fake `response(status, data)` dos testes não tem `headers`. Qualquer implementação que leia `response.headers.get('content-type')` lança `TypeError`, cai no caminho de erro e reprova os testes 1 e 4. A instrução e os testes se contradizem. Correção: incluir `headers` no fake, ou remover o Content-Type do enunciado.
  - `why_it_matters` e `conceptSteps[3]`: "Monte painel de clima para duas fontes". O tema é um dashboard de `/profile` e `/stats`, não clima. Correção: "Monte um painel com perfil e estatísticas a partir de duas rotas."
  - O prompt manda "Complete o dashboard", mas o starter é uma função vazia. Correção: "Implemente `criarDashboard`".
  - O prompt pede "permita retry" e a interação fala em "retry", mas o enunciado não define método nem assinatura para retry. Correção: declarar a API, por exemplo `criarDashboard(fetcher)` devolvendo `{carregar(), tentar()}`.
- **Lógica:**
  - Contrato oculto: os testes exigem que `criarDashboard(fetcher)` resolva em `{status, profile, stats}` ou `{status:'error', error:{status, message}}`. Nada disso está no enunciado.
  - Teste 4 ("não deixa resposta antiga vencer") é vacuoso. A fixture responde `old` na primeira chamada e `new` na segunda, em sequência, sem corrida. O teste só verifica `result.status === 'success'`, que passa com qualquer implementação que não falhe. Correção: responder com promises adiáveis, fazer a resposta antiga chegar depois da nova e afirmar `result.profile.nome === 'new'`.
  - Não há teste de loading, de retry nem de validação da forma (o objetivo fala em "validação da forma"). Correção: incluir pelo menos um teste para cada um, ou tirar do objetivo.
- **Novo vs planos:** NOVO (Content-Type contraditório com o fake, teste de corrida vacuoso, shape de resultado oculto, tema "clima" copiado de outra atividade). CONFIRMA a rubrica genérica "Rode critérios comportamentais e revisão humana para decisões abertas." em `rubric` e `scoring`.

### 13.01 — Leia uma falha de teste  [Gravidade: MÉDIA]
- **Escrita:**
  - O prompt diz "Leia o diff do teste", mas não há diff: só a linha `Teste: expect(paginar([1, 2, 3], 2, 2)).toEqual([3]);` e `Resultado recebido: [2, 3]`. Correção: "Leia a falha abaixo".
  - O prompt traz o bloco "Starter de trabalho" e a instrução de previsão colados (T2).
  - O `stageBridge` (~2.300 caracteres) traz Vitest, DevTools (Sources, Application, Network, Performance), `SuppressedError` e `cause`. A atividade dura 10 min e usa uma linha. Correção: manter só o parágrafo sobre falha de teste e mover o resto para as atividades de ferramentas.
  - `common_trap` e `notes` com o boilerplate da T3.
- **Lógica:**
  - Rubrica "reproduza divergência, reduza ao offset e registre hipótese antes da edição" pede reproduzir e reduzir uma função `paginar`, que não está no material. Correção: incluir o `paginar` no starter ou o diff completo.
  - `duration: 10 min` inclui, segundo o `stageBridge`, preparar npm e Vitest. Não cabe. Correção: 25 min ou separar a preparação em atividade própria.
- **Novo vs planos:** NOVO (diff ausente, função ausente, bridge longo, duração, contradição T5).

### 13.02 — Parsons de validação  [Gravidade: MÉDIA]
- **Escrita:**
  - O prompt lista cinco blocos ("validar número finito, validar divisor, calcular a/b, return, throw TypeError/RangeError"), mas o `material.md` tem quatro (A a D). "Calcular" e "return" estão no mesmo bloco D. Correção: alinhar a lista do prompt com os blocos reais.
  - `hints[0]` truncado em "…return, throw T" (T1).
  - `review.prompt` fala em "anotação de tipo TypeScript", mas o lote não apresenta TypeScript. Não é possível verificar no lote se TypeScript já foi ensinado antes desta etapa. Correção: confirmar o pré-requisito ou trocar o exemplo por JSDoc.
- **Lógica:**
  - A ordem A, B, C, D é correta. Blocos A e B são independentes entre si, e a rubrica deveria dizer isso explicitamente para o avaliador não penalizar a troca.
  - Sem teste automatizado; o edge case `dividir('6',2) -> TypeError` e `dividir(6,0) -> RangeError` está coerente com os blocos.
- **Novo vs planos:** NOVO (blocos divergentes entre prompt e material, TypeScript não verificável no lote).

### 13.03 — Complete a suíte  [Gravidade: ALTA]
- **Escrita:**
  - O starter `pagination.test.js` faz `import { paginar } from './pagination.js'`, mas `pagination.js` não está em `starterFiles`. Nada roda. O prompt diz "mantenha intacta a implementação fornecida", e essa implementação não foi entregue. Correção: incluir `pagination.js` com a implementação de referência, ou ajustar o enunciado.
  - O starter usa `describe`, `it` e `expect` sem `import ... from 'vitest'`. A 13.01 e a 13.09 importam explicitamente. Correção: adicionar o import.
  - `transfer.test.js` pede testes para `listarEventos`, função que não existe em nenhum ponto do lote, e o transfer não tem implementação. Correção: trocar por `paginar` ou fornecer `listarEventos`.
  - O transfer diz "Cada assert precisa falhar no mutante indicado", mas nenhum mutante é nomeado no transfer.
  - `common_trap`: "confundir página 1 com offset 1" é ambíguo. Correção: "tratar page=1 como se começasse no item de índice 1, pulando o primeiro item".
  - `hints[0]` truncado em "testes existentes só page=" (T1).
- **Lógica:**
  - Contrato oculto: a suíte exige que `paginar` lance `RangeError` para `page`/`size` inválidos e para `size` não inteiro. O prompt diz só "valores inválidos", e o gabarito (`solution`) lança `RangeError`. Correção: declarar no enunciado.
  - Os mutantes do assessment são `negative-page` e `skip-last`. Eles são coerentes com o enunciado, mas o aluno não sabe quais são. Isso é intencional e está ok se o enunciado disser que a avaliação é por mutação.
- **Novo vs planos:** NOVO (arquivo importado ausente, import do vitest ausente, função de transfer inexistente, RangeError oculto).

### 13.04 — Prever-executar-debugger  [Gravidade: BAIXA]
- **Escrita:**
  - O prompt manda "breakpoint a cada iteração" e a interação fala em "botões para avançar breakpoint". Isso é instrução de interface, não de tarefa. CONFIRMA a mistura de UI e prompt do plano.
  - `hints[0]` truncado em "…prever, executar, br" (T1).
- **Lógica:**
  - Trace correto: `[1, -2, 3]` produz `total` = 0, 1, 1, 4. Gabarito e rubrica estão coerentes.
  - Edge case `[0, -1] -> 0` está correto, pois `0 > 0` é falso.
  - Sem teste automatizado; rubrica genérica ("Rubrica de hipótese, evidência da ferramenta, conclusão e reprodução.").
- **Novo vs planos:** CONFIRMA a instrução de UI no prompt. NOVO (truncamento da dica).

### 13.05 — Bug fantasma  [Gravidade: ALTA]
- **Escrita:**
  - O prompt diz "Starter de trabalho: módulo 40 linhas com filtros, formatação e bug". O `filtro.js` tem cerca de 8 linhas, com um único filtro e nenhuma formatação. A atividade inteira é "reduzir o módulo até o caso mínimo", e não há o que reduzir. Correção: anexar um módulo de 30 a 40 linhas com filtros e formatação, ou reescrever o prompt.
  - `interaction`: "Editor de módulo e área para retirar etapas com botão, mais diff da redução". Não existe nenhuma dessas ferramentas no material. Correção: remover ou descrever como fazer a redução sem interface.
  - `worked_example`: o exemplo de "formatador de datas que desloca registro para o dia anterior" não tem relação com o bug de `if (valor)`. Correção: "Um filtro de descontos pode descartar desconto 0, tratado como ausência."
  - `edgeCases`: "caso [false] também denuncia teste de truthiness conforme contrato" é ambíguo. Correção: "O caso [false] também falha com o código atual, pela mesma razão."
  - `hints[0]` truncado em "…item zero" (T1).
- **Lógica:**
  - O bug está correto: `if (valor)` descarta `0`, `false`, `null` e `''`, e o contrato pede remover só `undefined`. O teste 1 detecta isso.
  - Teste "não muta entrada" passa tanto com o bug quanto sem ele. Não é falha, mas não discrimina nada; é regressão de bônus.
- **Novo vs planos:** NOVO (módulo de 40 linhas inexistente, interface citada sem existir).

### 13.06 — TDD de parser  [Gravidade: MÉDIA]
- **Escrita:**
  - O prompt diz "lotes de testes progressivos: formato, escape, erro" e "Faça cada lote falhar primeiro". O JSON traz um único `assessment.tests` com quatro casos. Os lotes não existem, então o aluno não tem como seguir o ciclo descrito. Correção: incluir os lotes como arquivos separados, ou reescrever o enunciado como "escreva o próximo teste".
  - `interaction`: "Editor com lotes desbloqueados em sequência" descreve uma interface que o lote não define.
  - `hints[0]` truncado em "…lotes de testes " (T1).
  - Transfer exige "SyntaxError com linha para entrada inválida". "Com linha" não aparece no enunciado principal. Correção: adicionar ao principal ou remover do transfer.
- **Lógica:**
  - Contrato oculto não declarado: `a=1;;b=2` (segmento vazio), `=x` (chave vazia), `a=` (valor vazio) e espaços. Nenhum teste cobre esses casos e o enunciado não diz o que fazer. Correção: especificar e cobrir ao menos `a=` e `;` duplo.
  - Os escapes estão corretos: `'a=x\\;y;b=c\\\\d'` produz `{a:'x;y', b:'c\\d'}`, coerente com o comentário do starter.
- **Novo vs planos:** NOVO (lotes ausentes, contrato de segmentos vazios, "com linha" só no transfer).

### 13.07 — Teste de regressão  [Gravidade: ALTA]
- **Escrita:**
  - O prompt diz "corrija o limite inferior e preserve verificações do limite superior". O starter (`return valor;`) quebra os dois limites: `clamp(12, 0, 10)` devolve `12`. A premissa do enunciado não bate com o código. Correção: "corrija os dois limites".
  - O `tests/clamp.test.js` do starter já contém o teste de regressão (`lower-bound regression`, falhando). O passo "escreva o teste antes de corrigir" está feito. Correção: deixar a suíte com `describe` vazio e pedir o teste.
  - O starter de teste não importa `vitest` (diferente de 13.09).
  - `hints[0]` truncado em "…escrever teste Vitest antes de corrigir " (T1).
- **Lógica:**
  - Gabarito `Math.min(maximo, Math.max(minimo, valor))` com `RangeError` para min > max está correto.
  - Mutantes `exclusive-upper` e `ignore-minimum` são coerentes com os edge cases.
- **Novo vs planos:** NOVO (premissa do prompt contraditória com o starter, teste de regressão já escrito).

### 13.08 — Microprojeto - biblioteca confiável  [Gravidade: ALTA]
- **Escrita:**
  - O starter diz "API documentada com erros" e o material cita "README de API", mas nenhum README foi entregue. O aluno não tem documentação para ler. Correção: incluir o README ou remover a menção.
  - O prompt diz "Documente contratos de três funções e escreva testes", o que sugere uma implementação existente. Mas o `library.js` tem stubs vazios (`{}`), e a avaliação roda testes contra o `library.js` do aluno. Não está claro se o aluno implementa as funções. Correção: decidir entre (a) fornecer a implementação e pedir testes, como em 13.03, ou (b) pedir implementação e testes, e escrever isso no enunciado.
  - `hints[0]` truncado em "…API docum" (T1).
- **Lógica:**
  - Testes não cobrem o exemplo público `clamp(2,0,3)=2`, nem o caso de `min > max` do edge case: `clamp` com `RangeError` não é testado.
  - `paginar` testa `page` 0, mas não `size` 0 nem `size` não inteiro, que o edge case menciona.
  - Teste `unique` com `[NaN, 1, NaN, 1, 0, -0]` está correto e distingue `SameValueZero` de `===`.
- **Novo vs planos:** NOVO (stubs versus "API documentada" inexistente, edge cases sem teste). CONFIRMA a rubrica genérica "Rode critérios comportamentais e revisão humana para decisões abertas." em `rubric` e `scoring`.

### 13.09 — Dublês e relógio falso  [Gravidade: ALTA]
- **Escrita:**
  - `starterFiles` tem só `retry.test.js`, que importa `./retry.js`. O `retry.js` está apenas na `solution` do `assessment`. O aluno não consegue rodar nada. Correção: incluir o `retry.js` de partida ou o enunciado dizendo que ele é fornecido separadamente.
  - O prompt manda usar `vi.useFakeTimers` e "fake fetch injetado", mas o starter injeta o `timer` como quarto argumento de `retry`. Essa assinatura não aparece no enunciado. São duas estratégias misturadas. Correção: declarar `retry(operation, max, delay, timer)` e escolher injeção ou fake timers.
  - `hints[0]` truncado em "…fak" (T1).
- **Lógica:**
  - Gabarito verificado por leitura: no exemplo "op falha uma vez, resolve", há duas chamadas e um atraso. Está correto.
  - `retry(op, 0, …)` lança `undefined` (o `throw last` sem erro). Não há edge case para `max < 1`. Correção: adicionar `if (max < 1) throw new RangeError('max inválido')`.
  - Contrato oculto: quarto parâmetro `timer`. Ver item acima.
- **Novo vs planos:** NOVO (retry.js ausente, parâmetro timer oculto, max<1 sem caminho definido).

### 13.10 — Preserve a causa do erro  [Gravidade: ALTA]
- **Escrita:**
  - `examples.expected` diz `Error('Não foi possível salvar', {cause: erroOriginal})`, mas a atividade é `carregarConfiguracao` (leitura), e o teste exige `'Falha ao carregar configuração'`. Correção: trocar o exemplo para a mensagem do teste.
  - `objective` pede "Separe em duas colunas o dado registrado no log técnico e a mensagem apresentada", mas não há log definido. Correção: remover a coluna de log ou definir o log.
  - `hints[0]` truncado em "…lançar erro de domínio co" (T1).
- **Lógica:**
  - Teste 2 (`normaliza erro que não é Error`) é vacuoso: o `expect` está dentro de `catch`. Se `carregarConfiguracao` resolver, o `catch` nunca roda e o teste passa. Verificável pelo padrão de `try`/`catch` sem `expect.assertions`. Correção: `await expect(carregarConfiguracao(() => Promise.reject('token-secreto'))).rejects.toMatchObject({cause: 'token-secreto'})`.
  - O bloco `try`/`catch` do segundo caso do teste 1 tem o mesmo problema. Mesma correção.
  - Starter `throw new Error(String(erro))` está incorreto e o teste 1 detecta (`cause` ausente).
- **Novo vs planos:** NOVO (exemplo com mensagem divergente do teste, dois testes vacuosos por padrão `try`/`catch`).

### 13.11 — Leia a documentação para implementar  [Gravidade: MÉDIA]
- **Escrita:**
  - `docs[0].title` contém instrução ("Documentação oficial ECMAScript/MDN indicada pelo exercício…. Para a transferência, consulte Object.hasOwn"), e o único link é de `Object.hasOwn`, a API da transferência, não de `Array.prototype.at`, o tema da atividade. Correção: `docs = [{title: 'Array.prototype.at (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at'}]` (confirmar o link antes de publicar).
  - O prompt diz "aplique o que aprendeu numa função pequena", sem dizer qual função. A rubrica "aplicação" não tem o que avaliar. Correção: "Escreva `ultimo(arr)` que devolve o último elemento com `at(-1)`."
  - `hints[0]` truncado em "…índice negativo, r" (T1).
- **Lógica:**
  - `[].at(-1)` devolve `undefined`, e o edge case está correto.
  - Sem teste automatizado; a rubrica depende de consulta externa, que o lote não descreve como ser feita offline.
- **Novo vs planos:** NOVO (link para outra API, função não definida).

### 13.12 — Run, debugger, teste ou leitura?  [Gravidade: ALTA]
- **Escrita:**
  - O prompt diz "quatro falhas: sintaxe; valor inesperado em loop; regressão; requisito desconhecido de API". O `material.md` traz uma única falha: "teste de retry expira após 5 s". Três dos quatro casos não existem. Correção: incluir as quatro falhas no material.
  - A categorização diverge: o `objective` fala em "estrutura, execução, regressão, tempo ou requisito de API" (cinco categorias); o prompt usa quatro com outros nomes; o material fala em tempo. Correção: alinhar as categorias.
  - `common_trap`: "Usar sempre Run…". Termo de interface, CONFIRMA a instrução de UI do plano.
  - `hints[0]` truncado em "…requisito descon" (T1).
- **Lógica:**
  - O gabarito de exemplo (`sintaxe -> leitura/typecheck; loop -> debugger; regressão -> teste; API -> docs oficial`) está coerente.
  - Para a única falha do starter (retry com timer real), não há resposta esperada. A rubrica genérica não permite avaliar. Correção: gabarito "timer real com relógio falso -> teste com log de chamadas e relógio controlado; debugger não prova timing".
- **Novo vs planos:** NOVO (um caso em vez de quatro, categorias divergentes, gabarito ausente para o caso do starter). CONFIRMA a rubrica genérica "Rubrica de hipótese, evidência da ferramenta, conclusão e reprodução.".

### 13.13 — Teste DOM com teclado e foco  [Gravidade: ALTA]
- **Escrita:**
  - O prompt diz "Starter de trabalho: form com label,input,button,ul e região aria-live", mas o starter não tem HTML algum. O `app.js` é um stub e o teste espera `label[for=text]` e `#add[type=submit]` sem nenhuma fixture. Correção: incluir o HTML de partida em `document.body.innerHTML` no teste ou em um arquivo de fixture.
  - Os ids não batem. O teste de partida espera `#add`, `label[for=text]` e `#text`. A `solution` usa `#f`, `#text`, `#list`, `#error`, e nenhum botão `#add`. Nenhum desses ids está no enunciado. Correção: declarar os ids e o HTML esperado.
  - Ambiguidade de papel: o prompt diz "Escreva testes", mas o `app.js` tem um TODO ("associe submit, foco, texto literal e delegação"). O aluno deve implementar `montarWidget` ou só testá-lo? A avaliação por mutação precisa de uma resposta. Correção: decidir e escrever no enunciado.
  - `hints[0]` truncado em "…form com label," (T1).
- **Lógica:**
  - O gabarito cria o botão de remover e a delegação, mas nunca cria o `form`, o `input` ou o `#error`. Ele depende de um HTML que não está entregue.
  - Mutantes `inner-html`, `no-focus`, `submit-click-only` e `target-dataset` são úteis e bem escolhidos.
  - Edge case `string '<img>' -> nenhum img criado` é coberto pelo mutante `inner-html`, mas não há teste explícito para esse caso no starter.
- **Novo vs planos:** NOVO (HTML de partida ausente, ids divergentes entre starter, gabarito e enunciado, papel do aluno ambíguo).

---

## Top 5 do lote

1. **12.04 — exemplo público e gabarito de dica erram a ordem.** `examples.expected`, `checks.fixture.expected`, `hints[1]` e `preparation.hints[1]` dizem `A,B,P1,Q,T`. A execução do starter em Node dá `A,B,P1,Q,P2,T`, que é o que o próprio edge case e a rubrica dizem. Corrigir nos quatro lugares.
2. **12.03 — objeto versus array.** O prompt e a explanation pedem resultado "por nome" dentro de um "objeto", mas o starter e o teste exigem `[1, 2, 3]`. Padronizar em array e corrigir o teste 2, que não testa conclusão fora de ordem.
3. **13.03, 13.09 e 13.13 — starter não roda.** `pagination.js` e `retry.js` são importados pelos testes de partida, mas não estão em `starterFiles`; em 13.13 não há HTML nenhum e os ids divergem entre starter, gabarito e enunciado. Incluir os arquivos e os ids declarados.
4. **T1 + T2 — geração das 13.x.** `hints[0]` é truncado no meio de palavra em todas as 13 atividades 13.01 a 13.13, e o texto "Starter de trabalho…Registre sua primeira decisão…" é colado no prompt e em `practiceSteps`. Corrigir no gerador, não atividade por atividade.
5. **12.08 e 12.06 — testes de obsolescência que não verificam nada.** Em 12.08 o teste 4 só checa `status === 'success'`, sem corrida real, e o enunciado manda checar `Content-Type` num fake sem `headers`, o que reprova a própria solução. Em 12.06 uma implementação que engole qualquer erro passa nos três testes. Trocar por promises adiáveis, afirmar o valor final e incluir um teste de falha real.
