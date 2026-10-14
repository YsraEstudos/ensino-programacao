# Relatório de auditoria: Lote 9 (14 atividades)

Fonte: `lote-9.md`. Atividades: 22.08, 22.09, 22.10, 23.01, 23.02, 23.03, 23.04, 23.05, 23.06, 23.10, 23.11, 23.08, 23.09, 23.07 (ordem do arquivo).

Verificações executadas (Node v26, sem gravar arquivos):
- `Intl` pt-BR formata `R$ 12,34` com U+00A0 entre símbolo e número. Os literais de teste de 22.08 também usam U+00A0, então não há falha ali (suspeita descartada).
- `39.9 * 3` = `119.69999999999999` (confirmado; ver 23.01).
- `new Date('2026-02-30')` rola para 2026-03-02 (a solução de 23.03 trata isso com round-trip).
- `Number.isFinite(Infinity)` = false e `isNaN(Infinity)` = false (ver 23.04).
- Os demais achados de lógica foram verificados por leitura do código starter, solução e testes.

## Padrões transversais do lote

- NOVO: em todas as 14 atividades, `transfer.rubric` é cópia literal de `assessment.rubric`. A transferência não tem critério próprio.
- NOVO: em todas, `firstResponse.action` é idêntico a `objective` (e `preparation.introduction` também).
- NOVO: em 23.02, 23.03, 23.04, 23.07, 23.08, 23.09 e 23.10 a suíte de avaliação importa nomes de export, assinaturas ou campos que não aparecem no starter nem no prompt (contrato oculto).
- CONFIRMA: prompts curtos (23.01, 23.04, 22.08 e 23.08 estão na lista dos piores) e rubricas/checks genéricos ("Rode critérios comportamentais e revisão humana...", "Rode regressões antigas e novos casos...") aparecem em 22.08, 22.09, 22.10, 23.02, 23.03, 23.04, 23.08, 23.09 e 23.11.
- CONFIRMA: atividades só com rubrica, sem teste automatizado: 22.10, 23.01, 23.05, 23.06.
- NOVO: a ordem dos IDs no lote (23.10 e 23.11 antes de 23.08) não coincide com a sequência narrada no `stageBridge` de 23.01 (23.08, depois 23.09, depois 23.07). Confirmar a ordem real do curso.

---

### 22.08 — Microprojeto - pacote publicável  [Gravidade: ALTA]

- **Escrita:**
  - Prompt curto e sem contrato: "Criar pequena biblioteca TS com build de JS, declarations, exports, testes e exemplo de consumo." Não diz os nomes `centavosParaTexto` e `somarCentavos`, nem que o consumidor testa o tarball. CONFIRMA (lista dos piores prompts).
  - Rubrica 1: "as duas assinaturas autorais permanecem inalteradas". "Autorais" é ambíguo (pode ser lido como autoria). Correção: "as assinaturas das duas funções públicas permanecem inalteradas".
  - `consumidor/main.mjs`, passo 3: "num main.ts equivalente, npx tsc --noEmit". Não existe `main.ts` nem `tsconfig.json` no consumidor. Correção: remover a menção ou listar o arquivo e o tsconfig do consumidor como entregas.
  - `assessment.entryPath` = `src/index.js`, mas o starter tem `src/index.ts`. Correção: alinhar.
- **Lógica:**
  - Rubrica 3 exige que o tarball "contém a declaração gerada", mas a solução (`scripts/build.mjs`) copia `src/index.d.ts` escrito à mão. Nenhuma declaração é gerada pelo compilador, e o `declaration: true` do starter é descartado. Correção: o build deve usar `tsc -p tsconfig.json` e o teste deve checar que `dist/index.d.ts` existe e foi emitido a partir de `src/index.ts`.
  - Consumidor dentro do workspace: o passo 1 manda gerar o tarball na pasta do pacote e o passo 2 cria `consumidor/` dentro dessa mesma árvore. O prompt e o `preparation` pedem teste "fora do workspace". Correção: consumidor em pasta irmã (`../consumidor-teste`), com `npm install ../curso-centavos-0.1.0.tgz`.
  - Edge case "arquivo dist ausente -> validação falha" não tem teste. Correção: teste que lê `package.json` (`exports["."]`) e confere, via `npm pack --dry-run --json`, que `types` e `default` estão no tarball.
  - `checks` usa "Rode critérios comportamentais e revisão humana para decisões abertas." sem critério concreto. CONFIRMA.
- **Novo vs planos:** CONFIRMA prompt curto e rubrica genérica. NOVO: declaração escrita à mão em vez de gerada, contrariando a própria rubrica. NOVO: consumidor dentro do pacote, contrariando "fora do workspace".

### 22.09 — Exports e declarations  [Gravidade: MÉDIA]

- **Escrita:**
  - Prompt mistura nota de escopo: "Ative isolatedDeclarations num pacote; anote exports públicos e gere declarations. Project References ficam em extensão opcional." A última frase deveria estar em `constraints`, como em 22.10. NOVO.
  - `review`: a resposta correta (0) é a única longa e específica; os distratores são absurdos ("Elas são o código JavaScript executado..."). Correção: distratores plausíveis, por exemplo "Elas substituem a necessidade de testes da implementação, pois descrevem o comportamento completo."
- **Lógica:**
  - `tsconfig` do starter tem `include: ["src"]` sem `exclude`. Com isso `src/index.test.ts` entra no build e sai em `dist/index.test.js` e `dist/index.test.d.ts`. Correção: `"exclude": ["src/**/*.test.ts"]`, como faz 22.08.
  - O `package.json` do starter só tem o script `build`; não há `test`. O `test.todo` nunca roda. Correção: `"test": "node --test src/index.test.ts"`.
  - Mistura de frameworks: starter usa `node:test` + `assert`; `assessment.tests` usa `expect(...).toBe(...)` (estilo Jest/Vitest) sem declarar o runner. Correção: declarar o runner da suíte de avaliação. NOVO, relacionado ao ponto de 14.03 sobre node:test sem contraste com Vitest.
  - Nome do pacote diverge: starter `@curso/slug`, solução `slug-kit`. Correção: unificar.
  - `consumer.ts` (solução) importa `./src/index.js` (código-fonte), não o pacote por `exports`. A rubrica "consumidor nativo" não exercita o artefato compilado. Correção: importar `dist/index.js` ou usar `npm pack`, como em 22.08.
- **Novo vs planos:** NOVO em todos os itens acima.

### 22.10 — Trilha opcional: Project References  [Gravidade: MÉDIA]

- **Escrita:**
  - Prompt: "Separe biblioteca e consumidor em dois projetos TypeScript composite" contradiz o `roteiro.md`, que pede `composite: true` só em `packages/core` (passo 1). `packages/app` não recebe `composite`. Correção: "Torne `core` composite e faça `app` referenciar `core`."
  - `interaction`: "Desenhe as referências core → app" inverte o sentido da dependência (app referencia core). Correção: "Desenhe a referência app → core (app depende de core)."
- **Lógica:**
  - `assessment.solution` é `[]` e não há testes. A rubrica pede que "o grafo e os JS, declarações e build-info emitidos mostram que core é compilado antes", mas não há gabarito da ordem de build nem da lista de arquivos. Correção: incluir na suíte a saída esperada de `tsc -b packages/app` (ordem e arquivos em `core/dist`).
  - Duração de 22 min para sete passos com três builds e um diagnóstico de ciclo é irrealista. Correção: 40 min.
  - O passo 3 do roteiro não explica que `packages/app/src/main.ts` falha antes de `core/dist` existir. Correção: informar o erro esperado antes do passo 3.
- **Novo vs planos:** CONFIRMA atividade sem teste e com rubrica genérica. NOVO: contradição de `composite` e direção da seta.

---

### 23.01 — Revisão arquitetural  [Gravidade: ALTA]

- **Escrita:**
  - Prompt no infinitivo, sem sujeito imperativo: "Receber módulo “god object” e separar responsabilidades em um diagrama de dependências." Correção: "Receba o módulo “god object” e separe as responsabilidades em um diagrama de dependências." CONFIRMA (23.01 está na lista dos piores prompts).
  - `diagrama.md`: "porta Repositorio" (e a tabela de contrato) sem acento. Correção: "porta Repositório".
  - `stageBridge`: cita "generic", "Proxy" e "worker" como opções sem ensino prévio nesta etapa, e "Exemplo com ajuda retirada" é jargão. Correção: reduzir a lista a conceitos já vistos ou explicar.
- **Lógica:**
  - Incoerência central: `checks.scoring` diz "nenhuma edição de código é exigida", mas `assessment.rubric` exige "Fake repository testa preço sem rede e erro HTTP preserva cause técnica distinta da mensagem pública" e "transferência cobre outro módulo". Não há testes nem solução. Correção: ou remover esses critérios e pedir apenas a descrição de como um fake repository testaria o preço, ou transformar em MODIFY com teste.
  - Desenho incompleto: o desenho em `diagrama.md` mostra `serviço ──> porta Repositorio`, mas o `worked_example` diz "o domínio usa uma porta de repositório". A seta de domínio para porta não aparece. Correção: `domínio ──> porta Repositorio <── adapter localStorage` e `serviço ──> domínio`.
  - Regra de preço em float: `total = quantidade * 39.9` para caneca. Verificado: `39.9 * 3 = 119.69999999999999`. E `render()` imprime `R$ ${p.total}` sem formatação de moeda, então o usuário vê o float. Correção: trabalhar em centavos inteiros (`3990`) e formatar com `Intl.NumberFormat`. NOVO.
  - `render()` usa `innerHTML` com dado externo. O comentário do starter já marca, mas a rubrica não exige a troca por `textContent`. Correção: rubrica explícita "render usa textContent/elementos".
  - Duração de 10 min para ler o módulo, desenhar, responder três perguntas e fazer uma transferência é irrealista. Correção: 20 min.
- **Novo vs planos:** CONFIRMA prompt curto e rubrica genérica. NOVO: rubrica pede código inexistente; diagrama sem a seta domínio para porta; float no preço.

### 23.02 — Parsons de fluxo  [Gravidade: ALTA]

- **Escrita:**
  - `explanation.common_trap`: "Um tipo TypeScript não valida em execução um JSON externo" num exercício JS (`assessmentEnvironment: javascript`, `fluxo.js`). Correção: "Uma anotação de tipo ou JSDoc não valida em execução um JSON externo." NOVO.
  - Instrução de ordenação incompleta: o starter diz "Ordene os blocos dentro de criarPedido", mas os blocos [A]–[E] estão dentro de um comentário e `criarPedido` é uma função vazia. Correção: dizer explicitamente que o aluno deve substituir o comentário pelos blocos em ordem.
  - `prompt`: "Reordenar camadas de entrada -> validação -> domínio -> persistência -> apresentação." O prompt fala em camadas e o starter em blocos. Correção: "Ordene os blocos de `criarPedido` nas camadas entrada, validação, domínio, persistência e apresentação."
- **Lógica:**
  - Contrato oculto: os testes importam `criarServico(repo)` e chamam `responder(servico, raw)`. O starter exporta `responder(entrada)` (sem `servico`), não exporta `criarPedido`, e `criarServico` não aparece em lugar nenhum. Correção: declarar a assinatura pública no starter.
  - Vazamento: a resposta pública 500 traz `causa: erro.cause?.message` (starter e solução). Isso contradiz a rubrica 2 ("Erro público 500 não inclui mensagem técnica") e a explanation ("a UI recebe um erro seguro"). O teste ainda exige `r.causa === 'disco cheio'`. Correção: `{ status: 500, corpo: 'Erro interno. Tente de novo.' }`, com a causa enviada a um logger injetado, e teste `assert.equal('causa' in r, false)`.
  - Produto em branco aceito: `produto: "   "` passa na validação (só checa `typeof`), e o pedido é persistido com `produto: ""`. Não há mutante para isso. Correção: `dados.produto.trim() !== ""` na validação, teste e mutante `accept-blank-produto`.
  - Duração de 10 min para implementar pipeline, `ValidationError`, `responder` e testes é irrealista. Correção: 25 min.
- **Novo vs planos:** NOVO em todos os itens. Confirma o padrão de rubrica genérica ("Avalie ordem/seleção de blocos..."), que já está nos planos.

### 23.03 — Complete o contrato  [Gravidade: ALTA]

- **Escrita:**
  - `objective` pede "Escreva a assinatura de criarTarefa", mas o starter não contém nenhuma declaração `criarTarefa`: só o bloco JSDoc, seguido de um comentário. Correção: incluir após o JSDoc a linha `export async function criarTarefa(entrada, repositorio) { /* ... */ }` ou pedir explicitamente para declarar a função.
  - `starter` diz "Ainda não implemente o corpo", enquanto a suíte de avaliação exige corpo implementado e persistência. Correção: ver Lógica.
  - Muitos `___` sem pista no enunciado (formato de prazo, status inicial, invariantes). Intencional, mas a tarefa fica indeterminada. Correção: dar ao menos a lista de status ou o formato de prazo como hipótese declarada.
- **Lógica:**
  - Contradição central: `objective` e `checks` ("Avalie somente as decisões retiradas") pedem contrato, mas `assessment.tests` exige implementação completa (retorno, persistência, `StorageError`).
  - Contrato oculto nos testes: `criarTarefa` recebe um terceiro argumento `criarId` (`() => 't-1'`), status inicial `'a-fazer'`, `prazo` no formato ISO, e a classe `StorageError` com `cause`. Nenhum desses nomes aparece no starter, exceto `ValidationError`.
  - Os testes validam o nome e a estrutura de um erro que o starter não define. Correção: adicionar `StorageError` e o terceiro parâmetro ao JSDoc, e fixar `status` inicial no bloco `@typedef`.
  - Duração de 10 min para contrato, implementação e três testes é irrealista. Correção: 25 min.
- **Novo vs planos:** NOVO em todos os itens.

### 23.04 — Refactor guiado por testes  [Gravidade: ALTA]

- **Escrita:**
  - Prompt curto: "Melhorar código legado em passos mantendo testes verdes." CONFIRMA (23.04 está na lista dos piores prompts).
  - `roteiro` passo 3: "Trocar var/== por const/let/===" sem dizer que a troca de `==` altera comportamento para ids em string. Correção: anotar a exceção no roteiro.
- **Lógica:**
  - Nome e assinatura ocultos: `assessment.tests` importa `criarCadastroCliente` e chama `criarCadastroCliente(r, nome, email, idade)`. O starter exporta `cadastrarCliente(nome, email, idade)`. Correção: declarar no starter o nome-alvo e a assinatura, ou manter `cadastrarCliente` com `repo` opcional.
  - Passo 2 do roteiro quebra o teste: "repositório injetável" como parâmetro obrigatório faz `legado.test.js` falhar, porque ele chama `cadastrarCliente(nome, email, idade)`. Isso torna impossível "testes verdes a cada passo". Correção: `repo = repositorioPadrao` como default.
  - Mudança de comportamento sem teste: a solução usa `c.id === id` em `atualizarCliente`. No legado, `"1" == 1` é verdadeiro, e um id vindo de formulário como string era encontrado. Nenhum teste caracteriza isso, embora a rubrica peça "registrar compatibilidade de coerção". Correção: teste `atualizarCliente(r, "1", ...)` com o resultado intencional documentado.
  - Mudança de comportamento sem teste: `isNaN(idade)` foi trocado por `!Number.isFinite(Number(idade))`. Verificado: `isNaN(Infinity)` é false e `Infinity < 18` é false, então o legado aceita `idade = Infinity`; a solução recusa. Correção: caso de teste e registro como mudança intencional.
- **Novo vs planos:** CONFIRMA prompt curto. NOVO: nome e assinatura ocultos, passo 2 quebrando a suíte, `==` para `===` e `Infinity` sem teste.

### 23.05 — Revisão de PR simulada  [Gravidade: MÉDIA]

- **Escrita:**
  - Prompt entrega a resposta: "Analisar diff com bugs de async, tipos frouxos, mutação inesperada e teste frágil." Correção: "Analise o diff e registre até quatro achados com evidência." (sem as categorias).
  - `revisao.md` lista os quatro achados como "Pistas para investigar": "retry sem limite dentro do catch; any no payload; ordenação que muta a entrada; teste que depende de tempo real". Correção: remover as pistas ou transformá-las em perguntas genéricas de revisão.
- **Lógica:**
  - Achados reais no diff (verificados por leitura): (1) `carregarRanking` chama `tentarDeNovo`, que chama `carregarRanking` sem limite, então uma falha persistente gera retry infinito; (2) o `try` cobre também `ordenar(vendas.itens)`, então um erro de ordenação dispara retry; (3) `vendedores.sort` muta o array recebido; (4) o teste mede tempo real (1 s por execução) e não confere o resultado retornado.
  - `assessment.solution` é `[]`, sem gabarito dos achados. Correção: gabarito com linha e impacto de cada achado.
  - Falso positivo sem alvo: a rubrica pede "refuta ou marca um falso positivo", mas o diff não contém comentário candidato a falso positivo. Correção: incluir no diff um candidato plausível e refutável (por exemplo, `catch (erro)` com `erro` não usado).
  - A transferência cita "diff de sincronização offline", mas nenhum diff é entregue. Correção: anexar o diff de transferência.
  - O teste usa `falharProximaChamada()`, que não existe no diff. Correção: incluir o helper ou o mock.
- **Novo vs planos:** CONFIRMA atividade só com rubrica. NOVO: pistas e prompt entregam os achados, falso positivo sem alvo, transferência sem diff.

### 23.06 — Boundary audit  [Gravidade: MÉDIA]

- **Escrita:**
  - Prompt: "marcar onde cada uma vira dado de dominio validado." Falta acento: "domínio". O erro se repete em `practiceSteps` e `hints`. NOVO.
  - Pergunta 3 de `bordas.md`: "Qual validação é compartilhada entre duas fontes e onde ela deve morar?" é ambígua. Correção: "Qual regra de validação aparece em duas fontes (por exemplo, HTTP e arquivo) e em que camada ela deve ficar?"
- **Lógica:**
  - Caminhos que não existem: a tabela cita `api/cliente.ts`, `storage/adapter.ts`, `ui/formulario.ts`, `config.ts` e `importar.ts`. Nenhum existe nas atividades anteriores nem no esqueleto do capstone (23.08, que usa `src/adapters/`, `src/portas.ts`, `src/servico.ts`). Correção: usar os caminhos do esqueleto ou declarar que são hipotéticos.
  - Entrega divergente: a rubrica 2 pede "Diagrama de trust boundaries e parsers claros", mas o starter pede uma tabela. Correção: alinhar (tabela ou diagrama).
  - Atividade sem teste (rubrica apenas). CONFIRMA.
- **Novo vs planos:** CONFIRMA rubrica-only. NOVO: caminhos inexistentes, diagrama versus tabela, acentuação.

### 23.10 — Encontre a regra no mini-repositório  [Gravidade: ALTA]

- **Escrita:**
  - Incoerência de tipo: `checks.scoring` diz "Rubrica de localização... nenhuma edição de código é exigida" e `assessmentEnvironment` é `node-simulated`, com testes automatizados. Correção: escolher um modo e alinhar o campo de avaliação.
- **Lógica:**
  - A solução quebra o repositório que a atividade entrega. Verificado por leitura:
    - `src/service/relatorio.js` passa a exportar só `resumir`. `gerarRelatorio` some, mas `src/main.js` e `test/relatorio.test.js` o importam.
    - `dentroDoLimite(10.5)` passa a retornar `false` em vez de lançar `RangeError`, e `test/limite.test.js` ("rejeita valor não inteiro") espera o `throw`.
    - `dentroDoLimite(-1)` passa a ser `false`. No starter, `-1 <= 10000` é `true`. A regra de negativos é uma decisão nova sem registro no ISSUE.
  - Contrato oculto: a suíte de avaliação importa `resumir` e usa o campo `totalCentavos`. O starter exporta `gerarRelatorio` e o campo se chama `valorCentavos`.
  - Correção: manter `gerarRelatorio` (pode delegar a `resumir`), manter o `RangeError` para não inteiros, decidir e documentar a regra de negativos em `ISSUE.md`, e alinhar os nomes de campo.
- **Novo vs planos:** NOVO em todos os itens. Solução incompatível com o starter e com os testes existentes.

### 23.11 — Corrija uma issue alheia  [Gravidade: MÉDIA]

- **Escrita:**
  - `objective`, `firstResponse.action` e `interaction` pedem "o resultado abaixo", mas nada aparece abaixo. Correção: "Preveja o retorno de `dentroDoRaio` para 4.999, 5.000 e 5.001 metros."
  - Rubrica (assessment e transfer): "Teste red é exatamente no limite". "Red" é inglês sem tradução. Correção: "Teste que falha (vermelho) exatamente no limite."
- **Lógica:**
  - Requisito oculto: a suíte exige `dentroDoRaio(1, NaN)` lançar `RangeError` ("raio configurável e entradas inválidas"), mas a ISSUE não pede validação do raio e o starter não valida. Correção: incluir o requisito em `ISSUE.md` ou retirar do teste.
  - Transferência: o `transfer.rubric` é idêntico ao da avaliação (padrão transversal).
- **Novo vs planos:** NOVO. O restante da atividade está coerente: o starter, o teste de limite e a solução batem.

### 23.08 — Capstone - sistema completo  [Gravidade: ALTA]

- **Escrita:**
  - Prompt: "Construir aplicação ou biblioteca de porte médio com JS/TS, API interna tipada, persistência substituível, testes e documentação." Tem 128 caracteres e está na lista dos piores prompts. CONFIRMA.
  - `explanation` e `examples` falam em "criar/listar/mover/remover", mas nem o starter nem a solução têm `listar`. Correção: "criar, mover, remover e recuperar após reinício."
- **Lógica:**
  - Contrato oculto, três pontos:
    - a suíte importa `migrar` de `src/adapters/versao.ts` e exige o formato v0 `{ versao: 0, dados: [{ id, titulo, concluida }] }`. Nenhum formato é descrito no starter, que só diz "leia o formato v0";
    - a suíte importa `adicionar`, `alterarColuna` e `excluir` de `src/servico.ts`, nomes que não aparecem no starter;
    - `StorageError` é importado de `src/adapters/memoria.ts` com construtor `(message, cause)`, mas o starter define outra `StorageError` em `src/portas.ts` com `(mensagemPublica, options)`. São duas classes incompatíveis.
  - Bypass de validação: `migrar` com `versao: 1` devolve `documento.dados as Estado` sem validar. A 23.06 ensina que storage passa por parse, migração e validação, e a rubrica 2 da própria atividade diz que a validação fica no domínio. Correção: passar o estado migrado pela validação do domínio.
  - Auditoria incompleta: `adicionar` grava evento `criada`, mas `alterarColuna` e `excluir` usam `repo.salvar` sem evento. O README diz que o adapter "persiste estado/eventos juntos". Correção: todas as escritas com evento, ou exceção documentada.
  - Reinício não testado: o teste "simula reinício" usa a mesma instância em memória. Nada é serializado nem recarregado. Correção: serializar `carregar()` em JSON, criar novo repositório a partir do JSON e passar por `migrar`.
  - Rubrica 3 pede "limitação do adapter demonstrada por teste", que não está no README nem na suíte.
  - `mutants: []`: nenhuma mutação prova a suíte. Correção: `persist-before-validation` e `drop-event-on-failure`.
  - `assessment.tests` importa `./test/contrato.test.ts` e sobrescreve o teste do aluno. Correção: importar a suíte do aluno, ou documentar a sobrescrita.
- **Novo vs planos:** CONFIRMA prompt curto e rubrica genérica de checks. NOVO: contrato oculto (`migrar`, `servico`, `StorageError` duplicado), bypass de validação no storage, reinício não testado, `mutants` vazio.

### 23.09 — Falha observável sem segredo  [Gravidade: ALTA]

- **Escrita:**
  - Prompt: "...produza relatório sem token." O "relatório" não é definido. A saída real é um JSON de logs no console. Correção: "produza o registro de logs sem token".
  - `starter` comentário: "CHAVES_SENSIVEIS = ['authorization', 'token', 'cookie']" em minúsculas, mas os cabeçalhos do exemplo usam `Authorization` e `Cookie`. O enunciado não diz se a comparação é sem distinção de maiúsculas. Correção: escrever "a comparação de chaves não diferencia maiúsculas" no comentário.
- **Lógica:**
  - Contrato oculto: a suíte importa `lerLogs` e `limparLogs` de `operacao.js`, e os logs no starter são uma constante local (`const logs`), não exportada. A suíte também espera o campo `duracaoMs`, que nunca é nomeado no enunciado. Correção: exportar `lerLogs`/`limparLogs` e nomear `duracaoMs` no comentário do starter.
  - Bug na solução: `class ValidationError extends Error{}` não define `name`, então `err.name === 'ValidationError'` é sempre falso. A mensagem de erro de validação sai como `'falha técnica'`. O nível `warn` está certo porque usa `instanceof`. Correção: `this.name = 'ValidationError'` na classe, ou usar `instanceof` também para a mensagem. Verificado por leitura.
  - Redação ampla: `SECRET = /authorization|token|cookie/i` redige qualquer chave que contenha "token" (por exemplo, `tokenizacaoDaLoja`). O contrato não diz se isso é intencional. Correção: documentar a regra (substring ou chave exata).
  - Rubrica genérica: "Rode critérios comportamentais e revisão humana para decisões abertas." CONFIRMA.
- **Novo vs planos:** NOVO: `lerLogs`/`limparLogs` e `duracaoMs` ocultos, bug do `err.name`, regra de redação não documentada. CONFIRMA rubrica genérica.

### 23.07 — Change request final  [Gravidade: MÉDIA]

- **Escrita:**
  - Prompt: "...e implementa-la sem reescrever tudo." Correção: "implementá-la". NOVO (acentuação).
  - Rubrica: "Diff pequeno/coerente, testes novos e regressao zero." Correção: "regressão zero". NOVO.
  - `src/reabrir.ts` comentário: "tarefa inexistente ou fora de 'feito' -> erro de validação". A solução lança `Error` genérico. Correção: a solução deve usar `ValidationError`, como diz o comentário.
- **Lógica:**
  - Mudança fora do escopo: a solução altera `criar` (passa a rejeitar id duplicado), `mover` (valida a coluna) e `remover` (passa a lançar). A rubrica pede "diff pequeno" e "regressão zero", e a solicitação fala só de reabrir. Correção: manter `criar`, `mover` e `remover` intactos, ou registrar essas mudanças como item separado.
  - Contrato oculto: a suíte exige `carregarEventos` e `salvarComEvento` no adapter. O starter não tem nenhum dos dois, e o `mudanca.md` diz apenas "storage". Correção: nomear os métodos no `mudanca.md`.
  - "Regressão zero" não é verificável no pacote: o starter não tem `test/contrato.test.ts` nem script `test`, mas o README da solução manda rodar "a suíte de contrato 23.08". Correção: incluir a suíte no starter.
  - `mutants` vazio. Correção: adicionar `skip-audit-on-failure`.
  - Duração de 22 min para uma mudança transversal com cinco camadas e testes é irrealista. Correção: 40 min.
- **Novo vs planos:** NOVO em todos os itens.

---

## Top 5 do lote

1. **23.10: a solução quebra o repositório que a atividade entrega.** Remove `gerarRelatorio`, usado por `src/main.js` e `test/relatorio.test.js`, e faz `dentroDoLimite(10.5)` retornar `false` em vez de lançar `RangeError`, o que quebra `test/limite.test.js`. Correção: manter as exportações existentes, manter o `RangeError` e documentar a regra de negativos no ISSUE.
2. **23.02: a resposta pública 500 expõe a causa técnica.** Starter e solução devolvem `causa: erro.cause?.message`, contrariando a rubrica 2 e a explanation. Além disso, a suíte chama `criarServico` e `responder(servico, raw)`, nomes que não existem no starter. Correção: resposta sem `causa`, log com a causa, e assinatura pública declarada.
3. **23.04: a suíte exige um nome e uma assinatura que o starter não define, e o roteiro quebra o teste.** A suíte importa `criarCadastroCliente(repo, ...)`; o starter tem `cadastrarCliente(nome, email, idade)`. O passo 2 do roteiro (repositório obrigatório) faz `legado.test.js` falhar. A solução também troca `==` por `===` e `isNaN` por `isFinite` sem teste (`Infinity` deixa de ser aceito). Correção: `repo` com valor default, nome-alvo declarado e casos de caracterização para id em string e idade `Infinity`.
4. **23.03: os testes exigem implementação, mas o enunciado pede só o contrato.** O objetivo e o starter ("Ainda não implemente o corpo") pedem assinatura e invariantes; a suíte exige `criarTarefa` completo, um terceiro parâmetro `criarId`, status `'a-fazer'` e uma `StorageError` que o starter não define. Correção: declarar esses elementos no JSDoc do starter, ou retirar a implementação da avaliação e avaliar só o contrato.
5. **22.08: a rubrica exige declaração gerada, mas a solução copia um `.d.ts` escrito à mão, e o consumidor fica dentro do pacote.** `scripts/build.mjs` copia `src/index.d.ts`, então o `declaration: true` do starter nunca é exercitado. O passo 2 do consumidor também cria a pasta dentro da árvore do pacote, contra o "fora do workspace" do enunciado. Correção: build com `tsc`, teste que confere `dist/index.d.ts`, e consumidor em pasta irmã.
