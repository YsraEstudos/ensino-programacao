# Relatório de auditoria — Lote 6 (13.14 a 16.05, 30 atividades)

Fonte: `lote-6.md` (30 atividades JSON). Checklist seguindo `brief.md`. Nada foi executado; as afirmações sobre execução são deduções a partir do código e dos testes presentes no lote.

Contagem por gravidade: ALTA 10 · MÉDIA 15 · BAIXA 4 · OK 1.

Legenda de "Novo vs planos": CONFIRMA = item já citado nos planos e comprovado no lote; REFUTA = item citado que os dados mostram já corrigido (nenhum caso neste lote); NOVO = não citado nos planos.

---

## Achados transversais do lote (antes das atividades)

- **Objective repetido literalmente** em `preparation.introduction` nas 30 atividades. Em várias, `predictionGuide` repete a mesma frase. NOVO.
- **Hints cortadas no meio da frase.** O primeiro hint de cada atividade é um trecho de ~300 caracteres do prompt que termina em "...Registre sua primeira decisão", "...Saves V1 percorre", etc. Há também ".." duplo ao final de exemplos (13.14, 14.07, 14.02 e outras). NOVO.
- **Vazamento de template em feedback.** `correctFeedback` vira "Correto: <resposta> <explicação>" e `incorrectFeedback` diz "A resposta conceitual esperada é: <resposta>" (14.03, 14.06, 14.08, 14.09, 14.10). Isso expõe a resposta duas vezes e soa robótico. NOVO.
- **`mutants` inválidos.** Em 15.02, 15.03, 15.04, 15.07, 15.08, 15.11, 16.02, 16.03, 16.04 e 16.05, `mutants` é a string `"plausible"` ou um id (`"16.02-behavior"`) sem definição de mutante. O check `mutation` declarado nessas atividades não tem o que executar. NOVO.
- **Transfer genérico.** Em 14.01, 14.02, 14.04, 14.05, 14.09, 14.10, 14.11, 14.12, 14.13 e 15.x, o transfer é "Tarefa independente — Cenário independente: ... Critérios já publicados: X" sem entrada concreta. Em 15.06, 15.09, 15.10 e 16.01 a rubrica do transfer é cópia literal da rubrica principal. CONFIRMA parcialmente (rubricas genéricas); os detalhes são NOVO.
- **`visible_rubric` diverge de `assessment.rubric`.** Exemplos: 14.01 (visível: "Rubrica de localização..."; assessment: "identifique SCC A/B/C..."), 14.04, 14.06, 14.11, 14.12. CONFIRMA: o build copia `visible_rubric`, e o aluno não vê o critério que de fato é avaliado.
- **Starter só em prosa (`material.md`).** 14.01, 14.02, 14.04, 14.09, 14.10 e 14.12. CONFIRMA (planos: 48 starters).
- **Atividades sem teste automatizado.** 17 de 30 não têm `assessment.tests` (14.01, 14.02, 14.03, 14.04, 14.05, 14.07, 14.09, 14.10, 14.11, 14.12, 14.13, 15.01, 15.06, 15.09, 15.10, 16.01, 16.09). Em 14.03 e 14.05 há apenas `test.todo`. CONFIRMA (planos: 144 no total).
- **Template de prompt com instrução de UI.** "Registre sua primeira decisão antes de executar; depois compare previsão, evidência e justificativa." aparece em quase todos os prompts 14.xx. Também há "Tab para enviar" (15.01) e "sem mover cartões" (16.09). CONFIRMA (planos: 39 prompts com UI).
- **Frameworks de teste misturados.** `node:test` + `test.todo` (14.03, 14.05, 14.08 starter), `describe/test/expect` globais sem import (14.06 e assessment de 14.08), e `node:test` + `node:assert/strict` (15.x). A etapa 14 ensina node:test e a 14.03 nunca contrasta com Vitest, mas o exemplo de 14.03 usa `vitest run`. Parcialmente CONFIRMA (planos: 14.03 sem contraste), com achado novo sobre a inconsistência entre atividades. NOVO.
- **Pré-requisitos não listados nos planos (verificar se foram ensinados antes).** `import.meta.url` (14.05, 14.10), `import()` dinâmico e top-level await (14.10), `Object.hasOwn` e `new Error(msg, {cause})` (15.x, 16.04, 16.05), `Error.isError` (16.01, possivelmente indisponível no Node 24). NOVO.

---

## 13.14 — Kanban V2: migração e regressões  [Gravidade: ALTA]

- **Escrita:**
  - `hints[0]` e `preparation.hints[0]` cortam no meio: "...Saves V1 percorre". Corrigir o gerador de hints.
  - "Tags inválidas viram []" não define o que é tag inválida. O teste usa `tags: ['']`, mas o enunciado não diz se string vazia, não-string ou espaços contam. Sugestão: "Uma tag é válida se for string não vazia (após `trim`); qualquer outro valor vira descarte da tag com aviso."
  - "JSON totalmente inválido segue o contrato anterior" aponta para um contrato que não está no lote. Dizer explicitamente: "retorna `{version:3, tasks:[]}` e não chama `setItem`".
  - `transfer.prompt` pede "migração V3→V4" sem dizer qual campo V4 acrescenta. A tarefa independente é impossível de executar. NOVO.
  - O prompt pede "Mantenha texto HTML literal, teclado, foco e persistência", mas o assessment só tem testes de domínio.
- **Lógica:**
  - **Teste 1 e teste 2 quebram implementação correta.** `carregar({ version: 1, tasks: [...] })` passa o próprio save no lugar de `storage`. O teste 4 mostra que `storage` tem `getItem`/`setItem`. Qualquer `carregar` que leia `storage.getItem` lança TypeError antes de chegar à migração. Mesmo problema em `carregar(v3)` no teste 2. Correção: `carregar({ getItem: () => JSON.stringify(v1), setItem() {} })`, e o mesmo padrão nos demais testes.
  - **Teste 3 passa um array como segundo argumento de `migrarV2ParaV3`.** O starter declara `migrarV2ParaV3(value)`, e `carregar` recebe `warn` como função. Contrato oculto: aviso como array ou como callback? Correção: declarar `migrarV2ParaV3(value, warn = () => {})` e no teste `const warnings = []; migrarV2ParaV3(v, (w) => warnings.push(w));`.
  - **Rubrica 3 e 4 e `checks[3]` exigem DOM, teclado, foco e persistência, mas nenhum teste DOM existe.** Ou adicionar um teste com DOM simulado (jsdom ou similar) ou explicitar que esses itens são avaliação manual.
  - "V1 percorre ambas" ainda não pode ser conferido se o retorno do `carregar` for o próprio objeto; garantir que o teste compare `carregar` com storage válido.
  - A solução de referência não existe em `assessment.solution`. Sem ela não há como validar que os 4 testes passam após a implementação.
- **Novo vs planos:** NOVO (storage e argumentos de `carregar`/`migrarV2ParaV3` quebram implementação correta; V4 indefinido; tags inválidas indefinidas; DOM sem teste). CONFIRMA (rubrica "Casos avaliáveis" genérica no transfer).

---

## 14.01 — Mapa de imports  [Gravidade: MÉDIA]

- **Escrita:**
  - `stageBridge` tem "Exemplo com ajuda retirada: diante de `main.js`, `dados.js` e um erro de import..." sem exemplo concreto. Correção: "Exercício: dados `main.js` importa `{ total } from './dados.js'` e `dados.js` não exporta `total`. Diga se a falha é de caminho (arquivo não resolvido) ou de nome (export ausente)."
  - `material.md` pede "considere um import de tipo isolado em D", mas o grafo não marca nenhuma aresta como import de tipo e a explicação do conceito não existe no lote.
  - `prompt` usa "Registre sua primeira decisão antes de executar" (template de UI).
- **Lógica:**
  - A rubrica do assessment exige "diferencie edge de valor e import de tipo", mas o material não define a distinção nem rotula as arestas. Correção: rotular no material `D -> B (type)` e acrescentar a regra "import de tipo não participa do ciclo de runtime".
  - `examples` e `checks` pedem "extrair contrato comum X", sem definir X nem dar um grafo com X.
  - O transfer "Extraia contrato comum X sem ciclo" não traz grafo de entrada.
- **Novo vs planos:** CONFIRMA (starter só `material.md`; sem teste automatizado; visible_rubric genérica). NOVO (aresta de tipo indefinida; X indefinido).

---

## 14.02 — Parsons de CLI  [Gravidade: MÉDIA]

- **Escrita:**
  - Bloco A usa `process.argv.slice(2)`, mas o contexto declara `function main(argv = process.argv)`. O bloco deveria ser `argv.slice(2)`, senão o parâmetro é ignorado. Correção: "Bloco A: `const argumentos = argv.slice(2);`".
  - Bloco E usa `comandos.has(comando)` e `mostrarUso()`. Nenhum dos dois aparece no material, então o aluno não consegue reconstruir o bloco com fidelidade. Declarar `const comandos = new Set(['add','list','remove'])` e `mostrarUso` como parte do material.
  - Template "Registre sua primeira decisão..." no prompt.
- **Lógica:**
  - Não há `assessment.tests` nem `solution`. A rubrica "ordene parse, validação, domínio e saída; unknown retorna usage e exitCode 2" não tem gabarito de ordem. Sugestão de solução de referência: A, B, E, C, D (validação antes do domínio, saída por último).
  - O `checks.scoring` diz "não exija ordem entre blocos independentes", mas não identifica quais são independentes. Declarar explicitamente: "B precede E; E precede C; C precede D; A precede B."
- **Novo vs planos:** CONFIRMA (starter só `material.md`; sem teste). NOVO (Bloco A ignora o parâmetro `argv`; blocos referenciam nomes não definidos).

---

## 14.03 — Complete package scripts  [Gravidade: ALTA]

- **Escrita:**
  - `examples[0]` e `checks` dizem `npm test -> vitest run`. O `README.md` do starter diz "usa node:test" e o `test/app.test.js` importa `node:test`. Contradição direta. Correção: "`npm test -> node --test`".
  - `rubric` e `checks.scoring`: "Avalie somente as decisões retiradas e execute o arquivo completo" não tem sentido claro. Sugestão: "Avalie cada script pelo comportamento: `dev` observa mudanças em `src/main.js`; `test` roda uma vez; `start` executa `src/main.js` uma vez."
  - `preparation.materials` diz "terminal didático simula dev/test/start sem rede", mas `assessmentEnvironment` é `local`. Definir qual dos dois vale.
- **Lógica:**
  - `test/app.test.js` contém `test.todo('app')`. Um TODO não faz asserção, então `node --test` tende a não reprovar nada; o starter já "passa". Correção: `test('app', () => { assert.equal(typeof main, 'function') })` ou equivalente com asserção falhável.
  - Sem `assessment.tests`. Teste sugerido: `JSON.parse(readFileSync('package.json')).scripts` com `test === 'node --test'`, `start === 'node src/main.js'` e `dev` contendo `--watch` e `src/main.js`.
  - Se o exemplo `vitest run` for mantido, o `package-lock.json` precisa listar `vitest`; hoje não lista nenhuma dependência, e o `prompt` fala em "dependências".
- **Novo vs planos:** CONFIRMA ("14.03 introduz node:test sem contrastar com Vitest"), e o problema é pior: o próprio exemplo usa Vitest. NOVO (`test.todo` passa vazio; lock sem dependências).

---

## 14.04 — ESM vs CJS  [Gravidade: MÉDIA]

- **Escrita:**
  - O starter não traz `package.json`, mas o prompt pede "formato declarado" e o exemplo usa `package.json type=module`. Incluir `package.json` mínimo no starter.
  - `rubric`: "Aceite escolha justificada por diferença semântica publicada." Não existe "diferença semântica publicada" no lote; a frase não se refere a nada.
- **Lógica:**
  - `assessment.rubric` pede "falha de require em ESM", que não está no prompt. O aluno pode cumprir o enunciado sem demonstrar isso. Correção: incluir no prompt "execute `require` dentro do módulo ESM e registre o erro".
  - Sem teste automatizado e sem solução. Sugestão de teste: `node --input-type=module -e "import('./app.js')"` com `stdout` igual a `5`.
  - Transfer genérico ("Migração de uma fronteira CommonJS preservando API") sem entrada concreta.
- **Novo vs planos:** CONFIRMA (rubrica genérica "Aceite escolha justificada..."; visible_rubric). NOVO (falta `package.json` no starter; critério de `require` não pedido no prompt).

---

## 14.05 — Bug de caminho  [Gravidade: MÉDIA]

- **Escrita:**
  - `prompt` diz `readFileSync('./data/config.json')`, mas o starter usa `readFile` de `node:fs/promises`. Alinhar o texto ao código.
  - `config.js` lê `./data/config.json`, mas o arquivo `data/config.json` não está no `starterFiles`. Sem ele não há reprodução possível.
  - A `review.prompt` pergunta por que usar os helpers de `node:path`, mas a correção do bug não é `node:path`; é resolver o caminho em relação ao módulo (`new URL('./data/config.json', import.meta.url)` ou `fileURLToPath`). A pergunta testa outro conceito. Sugestão: "Por que `process.cwd()` não é base correta para um recurso ao lado do módulo?"
- **Lógica:**
  - `test/config.test.js` é só `test.todo('carregarConfig')`. A rubrica pede "reprodução, causa, correção e regressão cross-cwd", mas nenhum teste roda o CLI de outro diretório. Sugestão: teste que executa `node config.js` com `cwd: os.tmpdir()` e confere o retorno.
  - `edgeCases` cita `import.meta.url`, que não é ensinado no lote (pré-requisito, ver transversal).
  - `assessmentEnvironment: local` e `checks: ["local"]`, sem nenhum comando de verificação definido.
- **Novo vs planos:** NOVO (review fora do conceito; `data/config.json` ausente; `readFileSync`/`readFile` inconsistentes; `import.meta.url` pré-requisito).

---

## 14.06 — Config por ambiente  [Gravidade: ALTA]

- **Escrita:**
  - O prompt diz "exija segredo no ambiente adequado", mas não diz qual variável define "adequado". O teste usa `NODE_ENV: 'production'`, que não aparece no prompt nem no starter (que lista apenas `PORT`, `LOG_LEVEL`, `TOKEN`). Contrato oculto.
  - O prompt não define os níveis aceitos de `LOG_LEVEL`. O teste aceita `'debug'` e rejeita `'verbose'`.
  - O prompt não define o formato de retorno (o teste exige `{ port, logLevel }`), nem o tipo de erro (`RangeError`), nem a mensagem (`/TOKEN obrigatório/`). Todos são contrato oculto.
- **Lógica:**
  - **O teste do segredo é vacuo.** O código é `try { loadConfig({NODE_ENV:'production', TOKEN:'segredo'}) } catch (error) { expect(error.message.includes('segredo')).toBe(false) }`. Se a função não lançar, o `try` completa sem nenhuma asserção e o teste passa. Correção: `const err = capturarErro(() => loadConfig({ PORT: 'abc', TOKEN: 'segredo' })); assert(err); assert(!err.message.includes('segredo'));`, e um caso de `TOKEN` ausente em produção que exija o erro.
  - Os testes usam `describe`/`test`/`expect` globais sem import. Nas atividades vizinhas o padrão é `node:test`. O runner precisa ser declarado.
  - Solução de referência ausente; a rubrica do `visible` é "Aceite qualquer implementação..." e não corresponde aos testes.
- **Novo vs planos:** NOVO (NODE_ENV/TOKEN ocultos; mensagem e tipo de erro ocultos; teste de segredo vacuo; runner inconsistente). CONFIRMA (rubrica genérica "Aceite qualquer implementação...").

---

## 14.07 — Compatibilidade de feature  [Gravidade: BAIXA]

- **Escrita:**
  - O comentário do starter entrega a resposta: `// C: NÃO equivalente — adia fn para uma microtask.` Reescrever como "// C: compare com B e registre quando `fn` executa."
  - `prompt` pede "Decida entre usar a API, usar o fallback B ou adiar", mas "adiar" não aparece em nenhum exemplo nem em critério.
  - `hints` com ".." duplo no fim.
- **Lógica:**
  - A rubrica exige "fonte oficial com versão, data e link" obtidos na hora. Sem acesso à web, o aluno não cumpre. Oferecer alternativa offline (saída de `node --version` mais link fixo) ou declarar que a consulta é obrigatória.
  - O caminho A (`Promise.try` nativo) só é coberto se o aluno rodar em um runtime que tenha a API. A rubrica pede os dois caminhos, mas o starter não indica como obter os dois.
  - Sem teste automatizado; a avaliação é manual.
- **Novo vs planos:** NOVO (starter entrega a resposta; rubrica depende de rede; "adiar" sem critério).

---

## 14.08 — Microprojeto - CLI de notas  [Gravidade: ALTA]

- **Escrita:**
  - O prompt exige um "repositório JSON com leitura e validação seguras", mas o starter não traz repositório JSON nem nome de arquivo. Só há `executar` e `salvarAtomico`.
  - "Starter de trabalho: CLI modular add/list/remove" descreve comandos que não existem no starter.
  - `interaction` fala em "Editor em três módulos" e `prompt` em "CLI modular", mas o assessment importa tudo de `cli.js`. Sugestão: declarar os arquivos (`parse.js`, `dominio.js`, `repositorio-json.js`) e importar de cada um nos testes.
  - O contrato de retorno de `executar` não está definido. O starter retorna `{status:'usage', exitCode:2}`; o teste espera `{id:'1', text:'A'}` para `add` e um array para `list`. Definir a tabela de retornos.
  - `test/cli.test.js` (starter) usa `node:test` com `test.todo`, mas o assessment usa `describe/expect` globais. Padronizar.
- **Lógica:**
  - **Os testes não cobrem o núcleo do pedido.** Não há teste de repositório JSON, nem de JSON inválido (o exemplo "list com JSON inválido -> erro contextual sem sobrescrever storage" não está em `tests`), nem de `remove` de id existente.
  - O teste "domínio não depende de process.argv" não testa argv. Só chama `executar('add', r, ['A'])`, o que passaria mesmo se o domínio lesse `process.argv`. Correção: substituir `process.argv` por outro array no teste e verificar que o resultado não muda.
  - O teste atômico verifica `calls[1][1].toContain('.tmp')`. Um temporário em outro diretório (`/tmp/x.tmp`) passa. Correção: `assert.equal(path.dirname(calls[0][1]), path.dirname('data.json'))`.
  - O repositório fake gera ids `String(notes.length + 1)`. Depois de `remove('1')` e `add('C')`, o id `'2'` aparece duplicado. Não é coberto nem definido no prompt.
- **Novo vs planos:** CONFIRMA (atividade de projeto sem teste do núcleo). NOVO (testes não cobrem JSON; contrato de `executar` indefinido; teste de argv não testa argv; teste atômico frouxo; ids duplicados).

---

## 14.09 — Git antes do PR  [Gravidade: MÉDIA]

- **Escrita:**
  - O starter é só prosa (`material.md`) descrevendo um repositório que não existe. O aluno não consegue reproduzir o estado. Fornecer um script de setup (`setup-repo.sh`) que cria `main`, `feature` e o conflito.
  - O prompt diz "conflito preparado em arquivo de configuração", mas o material cria o conflito em `README.md` ("uso" e "uso e exemplo"), e a working tree tem `config.json`. As duas afirmações não batem.
  - `objective` e `prompt` usam "base/head" sem definição. O conceito de PR não é explicado no lote.
  - O material fala em "segredo fictício visível no diff", mas o prompt não manda removê-lo. Só o `edgeCases` diz "remover antes de commit". Incluir no prompt.
- **Lógica:**
  - O material não define quais linhas entram em conflito. Sem isso, "resolver preservando as duas intenções" não é verificável.
  - Rubrica "Rode regressões antigas e novos casos" não tem regressões nem testes. A rubrica "evidência Git e preservação de intenção" não tem gabarito.
  - Sugestão de verificação automática: script que confere `git status --porcelain` vazio, `git log --oneline` com 2 commits de feature e 1 de merge, e ausência da string do segredo no `HEAD`.
- **Novo vs planos:** CONFIRMA (starter só `material.md`; sem teste). NOVO (`README.md` vs `config.json`; "base/head" sem definição; segredo fora do critério).

---

## 14.10 — Grafo ESM em execução  [Gravidade: MÉDIA]

- **Escrita:**
  - `prompt` e `hints` falam em "Starter: ... import.meta.url", mas o material não usa `import.meta.url`.
  - O material não diz qual arquivo é o ponto de entrada. Se o aluno rodar `node a.js`, `c.js` nunca executa; se rodar `node c.js`, a ordem dos logs é outra. Correção: "Execute `node c.js` e registre a ordem".
  - `prompt` pede "analise ciclo apenas a partir dos bindings realmente lidos", mas o material não tem ciclo (`a -> b`, `c -> a` dinâmico). Ciclo só aparece em `edgeCases` e em `rubric`.
  - `rubric` usa "link/evaluation/TLA/import Promise" sem definir "TLA".
- **Lógica:**
  - A rubrica exige "dê exemplo concreto de ReferenceError em ciclo", mas não há ciclo no material para o aluno analisar.
  - Sem solução e sem saída esperada. O avaliador não tem a sequência de logs de referência. Sugestão: anexar a saída de `node c.js` e a linha do tempo esperada.
  - Duração de 9 min para desenhar três módulos, traçar TLA e `import()` e registrar previsão. Está subestimada.
- **Novo vs planos:** NOVO (entrada indefinida; ciclo ausente; `import.meta.url` e TLA como pré-requisito; duração). CONFIRMA (starter só `material.md`).

---

## 14.11 — Devo instalar esta dependência?  [Gravidade: ALTA]

- **Escrita:**
  - O `starterFiles[0].content` (`package.json`) contém um objeto JSON válido seguido de prosa: "Dossiê local compara licença, manutenção, tamanho, dependências transitivas...". O arquivo não é JSON válido, então `JSON.parse` e `npm` falham. Correção: mover a prosa para `dossie.md` e deixar só o JSON em `package.json`.
  - O prompt diz "dados de licença/manutenção/dependências/lockfile", mas o starter não traz nenhum desses dados. Há só os nomes `csv-choice-a` e `csv-choice-b` com versões. Sem o dossiê, a rubrica "compare licença, manutenção..." não pode ser cumprida.
  - "Transitivas", "pin" e "lockfile" aparecem sem definição no lote.
  - Os `examples` dizem "A ativa mas pesada, B leve porém abandonada", mas o starter não diz qual biblioteca é qual.
- **Lógica:**
  - Sem teste automatizado. A rubrica "rejeite licença incompatível" não tem caso: não há licença no dossiê para rejeitar.
  - `edgeCases` ("licença incompatível -> descartar opção") não tem caso correspondente no starter.
  - Sugestão de gabarito: dossiê com tabela (licença, última release, número de dependências transitivas) e uma linha de decisão esperada com justificativa.
- **Novo vs planos:** CONFIRMA (sem teste; rubrica genérica "Aceite escolha justificada..."). NOVO (`package.json` inválido; dossiê ausente; termos sem definição).

---

## 14.12 — Por que existe um bundler?  [Gravidade: ALTA]

- **Escrita:**
  - `material.md` diz "Compare os arquivos-fonte com um bundle de saída fornecido pelo exercício", mas nenhum bundle é fornecido no `starterFiles`. O material também diz "O diretório dist ainda não existe", então não há saída para comparar.
  - O prompt pede "configuração mínima de bundler", mas nenhuma configuração é fornecida nem escolhida.
  - `import './style.css'` dentro de um módulo ESM do Node não roda sem bundler. Isso pode ser a tese da atividade, mas o material não explica qual erro o aluno deve observar.
  - "Chunk", "source map" e "chunks/assets" aparecem em `examples` e `interaction` sem definição.
- **Lógica:**
  - Sem teste e sem gabarito. O `examples` ("build -> chunks/assets gerados e source map apontando ao original") exige uma saída que o aluno não consegue gerar sem uma configuração de referência.
  - A rubrica "trate chunk dinâmico como dependente da ferramenta" não corresponde a nenhum `import()` no código.
  - Sugestão: fornecer `bundle.js` e `bundle.js.map` de referência, ou escolher uma ferramenta e uma configuração de referência com comando exato.
  - Duração de 12 min para configurar e comparar um build está subestimada.
- **Novo vs planos:** CONFIRMA (starter só `material.md`; sem teste). NOVO (bundle prometido ausente; `style.css` em Node ESM; rubrica sem correspondência com o código).

---

## 14.13 — Event loop em dois runtimes  [Gravidade: ALTA]

- **Escrita:**
  - O exemplo de referência diz `browser síncrono A, Promise P, timer T` -> `A,P,T`. O snippet loga também `B síncrono`, então a sequência correta do browser é `A síncrono, B síncrono, P promise, T timer`. Corrigir o exemplo.
  - O snippet de Node existe só como comentário dentro de `ordem-browser.js`. O prompt pede "rode localmente como node-ordem.mjs e depois como node-ordem.cjs", mas esses arquivos não estão no starter.
  - O comentário "este arquivo roda no executor do site" não aponta para nenhum executor no lote.
- **Lógica:**
  - Não há saída de referência para Node ESM e CJS. A `edgeCases` afirma que a ordem de `nextTick` e Promise depende do contexto, mas o avaliador não tem o que comparar. Sugestão: anexar as saídas esperadas para `.mjs` e `.cjs`, com a versão de Node registrada.
  - Sem teste. A rubrica "execute browser e Node ESM/CJS separadamente" é manual.
  - Duração de 12 min para dois runtimes em dois formatos é apertada.
- **Novo vs planos:** NOVO (exemplo de referência incompleto; arquivos do Node ausentes). CONFIRMA (sem teste).

---

## 15.01 — Leia o erro do compilador  [Gravidade: MÉDIA]

- **Escrita:**
  - `interaction` pede "marque compile-time ou runtime em cada uma", mas `matriz.md` não tem coluna para isso. Adicionar a coluna "Fase (compile/runtime)".
  - O comentário do starter é condicional e confuso: "Numa pasta sem tsconfig.json, rode `npx tsc ...` (com tsconfig.json presente, ... exige --ignoreConfig)". O `tsconfig.json` está no `starterFiles`. Dar um único comando.
  - `interaction` usa "Tab para enviar" (instrução de UI no lugar da tarefa).
  - O exemplo mínimo pedido em `matriz.md` ("Escreva um exemplo mínimo...") não tem modelo nem local de entrega claro.
- **Lógica:**
  - `assessment.checks = ["types"]`, mas nenhum script verifica a matriz. A rubrica "0–2 por linha" é inteiramente manual. Sugestão: rodar `tsc --noEmit --pretty false` e conferir que há exatamente seis erros, cada um numa das linhas do starter com o código esperado (TS18048, TS2322, TS18046, TS2540, TS2353, TS2366).
  - Verifiquei os seis diagnósticos do starter: todos correspondem a erros reais no modo `strict` com `noUncheckedIndexedAccess`. O gabarito de "causa" e "correção sem cast" não existe no lote, então a correção de cada linha depende de julgamento.
- **Novo vs planos:** NOVO (matriz sem coluna prometida; comando condicional). CONFIRMA (UI misturada: "Tab para enviar").

---

## 15.02 — Parsons tipado  [Gravidade: BAIXA]

- **Escrita:**
  - Boa organização. Sugestão: explicitar que o bloco R (checagem de objeto) precisa vir antes de P (`"port" in raw`), porque a leitura de `raw.port` depende da narrowing.
  - O prompt não diz que um valor numérico como `port: 1` deve virar `RangeError`. Isso está no comentário do starter ("qualquer outro valor -> RangeError") e no teste, mas não no enunciado.
- **Lógica:**
  - Verifiquei a ordem correta (R, P, U, V, T, Q) e a solução: os casos de borda (`'1'`, `'65535'`, `'65536'`, `'0'`, `''`, `' 80'`, `'80 '`, `'+80'`, `'8e1'`, `'1.5'`) batem com a regex e com a faixa.
  - `mutants: ["plausible"]` não é mutante. Sugestão: listar mutantes concretos, por exemplo "aceitar número", "não validar faixa", "usar `Number(texto)` sem regex".
- **Novo vs planos:** NOVO (`mutants` inválidos). Demais pontos sem problema relevante.

---

## 15.03 — Complete as anotações mínimas  [Gravidade: BAIXA]

- **Escrita:**
  - `rubric` e `checks.scoring`: "Avalie somente as decisões retiradas e execute o arquivo completo." Não é claro. Sugestão: "Avalie a assinatura de `criarUsuario` (parâmetros e retorno) e as duas chamadas (válida e inválida)."
- **Lógica:**
  - O teste "não altera a idade permitida" é redundante com o primeiro teste, que já usa 13. Trocar por um caso acima do mínimo, por exemplo `criarUsuario('Bia', 120).idade === 120`.
  - O primeiro teste aceita uma tolerância de ±1000 ms em `Date.now()`, o que pode ser frágil em máquinas lentas.
  - `mutants: ["plausible"]` (ver transversal).
  - A solução usa literal `13` em vez de `IDADE_MINIMA`. A constante do starter não tem teste de regressão, o que não é problema grave.
- **Novo vs planos:** CONFIRMA (scoring genérico). NOVO (teste redundante; mutants inválidos).

---

## 15.04 — Any contagioso  [Gravidade: MÉDIA]

- **Escrita:**
  - `prompt` pede "lance TypeError com mensagem clara", e o starter pede "com a sua mensagem". O teste exige a substring `/Nome inválido/`. Contrato oculto. Incluir no prompt ou relaxar o teste.
  - O título do teste "aceita nomes em branco sem alterar o limite da função" não corresponde ao caso, que usa `'bia'` (não é branco). A expressão "sem alterar o limite da função" não tem sentido aqui. Sugestão: `test('nome vazio tem comportamento definido', () => ...)`.
- **Lógica:**
  - Nenhum caso testa nome em branco de fato. Se o aluno rejeitar `''` ou `'   '`, o teste atual continua passando, e o comportamento de branco fica indefinido.
  - O teste "valida a string antes de chamar métodos" repete a rejeição de `name: 42` já coberta em "rejeita cada fronteira".
  - `checks.scoring` ("Rode regressões antigas e novos casos") não tem regressões no lote.
- **Novo vs planos:** NOVO (título do teste contradiz o caso; mensagem oculta; branco não testado). CONFIRMA (rubrica genérica).

---

## 15.06 — Estrutural vs nominal  [Gravidade: MÉDIA]

- **Escrita:**
  - `edgeCases` usa "MeterA", "MeterB", "private _tag" e "Child". O starter usa "MedidorA", "MedidorB", "tag" e "Filho". Alinhar.
  - `primers` afirma que interfaces "podem ser reabertas e estendidas com `extends`". `extends` não é reabertura; a reabertura é declaration merging. Confusão conceitual. Sugestão: "Interfaces podem ser estendidas com `extends` e reabertas por declaration merging; isso fica para a etapa 17."
  - "excess-property checking" aparece em inglês em `checks.fixture` sem definição fora do `explanation`.
  - Passo 2 ("mude B.id para number") não diz em qual linha editar nem qual erro esperar em cada linha de uso.
- **Lógica:**
  - Sem `tests` e sem `solution`. A rubrica pede "(0–3)" e "(0–4)", mas não há gabarito de diagnóstico. Sugestão de tabela esperada: passo 1 sem erro nas duas linhas; passo 2 erro em `deBparaA`; passo 3 erro em `fresco` e sem erro em `viaVariavel`; passo 4 erro em `cruzado` e sem erro em `herdado`.
  - A `rubric` principal ("Aceite escolha justificada por diferença semântica publicada.") é genérica e não corresponde ao conteúdo.
  - O transfer repete a rubrica principal sem alteração.
- **Novo vs planos:** NOVO (nomes divergentes; declaration merging confuso; gabarito ausente). CONFIRMA (rubrica genérica).

---

## 15.07 — Flags strict extras  [Gravidade: ALTA]

- **Escrita:**
  - O prompt diz "crie casos próprios que demonstrem o contrato de ausência escolhido pelo produto" e o transfer diz "Defina se vazio retorna fallback ou erro". Mas o teste fixa `RangeError` para lista vazia. A liberdade prometida não existe.
  - `examples`: "string|undefined e guard; apelido ausente -> válido" não bate com a solução, que lança `RangeError` para lista vazia e nunca devolve `undefined`.
- **Lógica:**
  - **O teste `primeiroNome([])` exige `RangeError`.** Uma implementação correta que devolve fallback (`''`) ou `undefined` reprova. Correção: ou fixar no prompt ("lista vazia lança RangeError") e remover a escolha do transfer, ou aceitar as duas políticas e testar a escolha declarada pelo aluno.
  - `rotulo` não define `apelido: ''` (string vazia). Com `??`, a string vazia passa e o resultado é `''`. Decidir se string vazia conta como ausente e testar isso.
  - `mutants: ["plausible"]` inválido.
- **Novo vs planos:** NOVO (contrato fixado no teste contra "decida o contrato"; transfer contradiz o teste).

---

## 15.08 — Microprojeto - migrar utilitários  [Gravidade: ALTA]

- **Escrita:**
  - O starter diz "Migre para paginacao.ts", mas o `paginacao.test.js` pede para "troque o import para ./paginacao.ts" sem que o prompt diga para renomear o arquivo. Esclarecer.
  - `package.json` define `"typecheck": "tsc --noEmit -p tsconfig.json"`, mas o `tsconfig.json` não tem `files` nem `include` e não há nenhum `.ts` no starter antes da migração. O `tsc` falha com "No inputs were found". Baixa gravidade.
  - `interaction` diz "sem ordenar visualmente cartões" (linguagem de UI sem sentido aqui).
  - `prompt` cita "chamadas externas preservadas", mas não há consumidor (uma tela, um módulo) no starter. O termo não é definido.
- **Lógica:**
  - Os testes do assessment cobrem `clamp`, `unique` e `paginar`, mas não cobrem o caso "entrada inválida" do exemplo na forma que o prompt pede (registro de erro por função) nem um consumidor.
  - `paginar` testa `pagina` não inteiro (`1.2`) e `tamanho` zero, mas não testa `tamanho` não inteiro (`2.5`). Adicionar `[1, 2.5]` ao loop.
  - A rubrica "nenhum as any; declarations representam exports" (`edgeCases`) não é verificada: o tsconfig não tem `declaration`.
  - `mutants: ["plausible"]` inválido.
- **Novo vs planos:** NOVO (consumidor ausente; cobertura parcial de `paginar`; `typecheck` falha antes da migração).

---

## 15.09 — Readonly observa mutação  [Gravidade: BAIXA]

- **Escrita:**
  - `preparation.workedExample` repete a frase de `mental_model` ("Readonly limita escrita pela referência tipada..."). Trocar por um exemplo concreto de tela de inventário com dois aliases.
  - O comentário "Escreva cada previsão antes de rodar `node inventario.ts` (o Node.js 24 remove os tipos)" confunde execução com checagem. Esclarecer que "compila?" é respondido por `tsc --noEmit`, não pela execução.
  - `checks.scoring` diz "confiança é diagnóstica", conceito não explicado no lote.
- **Lógica:**
  - Sem gabarito de saída completa. O assessment só tem o texto `[1,2]`. A saída do starter inteiro é `vista.itens [1,2]` seguido de `mesmo objeto? true [1,2,3]`. Anexar a saída completa.
  - `environment: rubric` para um arquivo executável. Um teste simples com `Object.is(dados, vista)` e `vista.itens.length === 3` após o `push(3)` seria automatizável.
  - Transfer repete a rubrica principal.
- **Novo vs planos:** NOVO (repetição em `workedExample`; saída de referência incompleta; rubrica manual para atividade executável).

---

## 15.10 — Literal fresco versus variável  [Gravidade: MÉDIA]

- **Escrita:**
  - Examples, hints, `checks` e rubrica falam em campo "role"; o starter usa "destaque". Unificar em "destaque".
  - O prompt pede "invente um campo adicional", mas o starter já traz `destaque` como campo inventado. Esclarecer que o aluno pode trocar o nome.
  - O comentário D (`const recebido: unknown = await (await fetch(...)).json()`) está fora de contexto executável, sem explicação de onde o `fetch` aponta.
- **Lógica:**
  - `environment: rubric` com `checks: ["rubric"]`. A rubrica pede "evidência de checker" sem comando. Sugestão: marcar os casos com `// @ts-expect-error` no starter, para que `tsc` valide automaticamente a linha A (erro esperado) e a linha B (sem erro).
  - A rubrica item 2 pede "caso próprio com tipo/valor errado" sem exemplo.
  - O transfer repete a rubrica principal e mantém o nome "role".
- **Novo vs planos:** NOVO (role vs destaque; falta de verificação automática).

---

## 15.11 — Compilou, mas falhou  [Gravidade: MÉDIA]

- **Escrita:**
  - O teste exige que a mensagem de erro contenha "Perfil inválido" (`/Perfil inválido/`), e a solução usa "Perfil inválido: name deve ser texto". O prompt não pede mensagem nenhuma. Contrato oculto: incluir no prompt ou relaxar o teste.
  - O prompt pede "remova o cast", mas não diz se o erro de parse deve ser o `SyntaxError` original ou uma nova mensagem. A solução relança com `new SyntaxError('JSON inválido')`, o que descarta a causa original. Sugestão: pedir `{ cause }`.
- **Lógica:**
  - A rubrica "Exija reprodução, causa, correção e regressão" está no `checks` mas a regressão não tem teste separado; os casos de sucesso e falha existem, então é aceitável.
  - `mutants: ["plausible"]` inválido.
- **Novo vs planos:** NOVO (mensagem oculta; `SyntaxError` sem causa). CONFIRMA (rubrica genérica "Exija reprodução...").

---

## 16.01 — Ache estados impossíveis  [Gravidade: MÉDIA]

- **Escrita:**
  - O starter tem duas lacunas (`| ___ | ___;`), mas o enunciado pede quatro variantes: `idle`, `loading`, `success` (com `data`) e `error` (com `message`). Corrigir para quatro lacunas.
  - O `stageBridge` mostra uma união com três variantes ("permite exatamente três") e não quatro. Alinhar com a tarefa.
  - `stageBridge` cita `Error.isError(e)` "quando disponível". A API pode não existir no Node 24; conferir antes de manter, ou remover.
- **Lógica:**
  - Sem `tests` e sem `solution`. A rubrica "evidência de typecheck (0–3)" não tem comando. Sugestão: deixar as linhas impossíveis com `// @ts-expect-error` no starter, para que `tsc` valide automaticamente.
  - Rubrica "Definir variantes ... sem combinações impossíveis (0–4)" não é checável sem gabarito.
  - O transfer diz "Aplique os critérios a Ache estados impossíveis em um caso com entrada e resultado/diagnóstico definidos" sem caso concreto.
- **Novo vs planos:** NOVO (duas lacunas para quatro variantes; `stageBridge` com três). CONFIRMA (sem teste; rubrica sem gabarito).

---

## 16.02 — Parsons de narrowing  [Gravidade: OK]

Consistente: ordem correta N, M, K; bloco L (truthiness) fica de fora e os testes cobrem `format(0) === '0'`, que L reprovaria. Único ponto: `mutants: ["16.02-behavior"]` não tem definição (ver transversal).

---

## 16.03 — Complete a união  [Gravidade: ALTA]

- **Escrita:**
  - **Nome do campo do boleto inconsistente.** `examples` diz "boleto com linha -> válido", o starter comenta `{ metodo: "boleto", linha: "123", ultimos4: "4242" }`, mas o teste e a solução usam `codigo` (`{metodo:'boleto', codigo:'B-1'}`). Quem seguir o exemplo reprova no teste e no typecheck. Correção: usar `linha` em todos os pontos, ou `codigo` em todos. Escolha sugerida: `linha`, e o teste vira `resumo({metodo:'boleto', linha:'B-1'}) === 'Boleto B-1'`.
  - Os placeholders `___` do starter escondem o nome do campo do boleto. O enunciado "Complete as lacunas" não diz o nome.
  - `interaction` mistura instrução de leitor de tela com a tarefa ("método, campos, resultado").
- **Lógica:**
  - Não há teste negativo automatizado para `pix sem chave` e `boleto com campo de cartão`. O `checks` diz "types", mas nenhuma linha usa `@ts-expect-error`. Sugestão: deixar as duas linhas comentadas com `// @ts-expect-error` e verificar com `tsc`.
  - `mutants: ["16.03-behavior"]` sem definição.
  - O teste "valores distintos não colapsam" é fraco: qualquer implementação que devolva strings diferentes passa, e o teste não diz nada sobre a união.
- **Novo vs planos:** NOVO (`linha` vs `codigo` quebra o caso de exemplo; sem teste negativo de tipo).

---

## 16.09 — Exaustividade com assertNever  [Gravidade: MÉDIA]

- **Escrita:**
  - No starter, `default:` fica vazio com o comentário "complete: o compilador deve provar que nenhum evento sobrou aqui". O prompt não diz que o `default` deve chamar `assertNever(evento)`. Dizer explicitamente.
  - `interaction`: "organize em seções numeradas sem mover cartões" usa linguagem de UI que não se aplica.
  - `review.prompt` pergunta sobre fallthrough em `switch` JavaScript, que é outro conceito. O tema da atividade é exaustividade com `never`. Sugestão: "Por que `assertNever(valor: never)` falha em compilação quando um novo tipo de evento não é tratado?"
- **Lógica:**
  - `assessment` sem `tests`, sem `solution` e sem `mutants`. `checks` ("types", "mutation") não tem nada para executar. O avaliador não tem como saber se o handler final está correto.
  - Sugestão de gabarito: `case` para `digitou`, `enviou`, `limpou` e `default: return assertNever(evento);`. Teste: após adicionar `{tipo:'filtrou'}`, `tsc` deve acusar o `assertNever`, e a linha deve ter `@ts-expect-error` apenas no caso intencional.
  - `edgeCases` diz "runtime inesperado -> lança Error contextual", mas nenhum teste cobre isso.
- **Novo vs planos:** NOVO (sem gabarito; `review` fora do conceito; `default` sem instrução).

---

## 16.04 — Cast perigoso  [Gravidade: MÉDIA]

- **Escrita:**
  - O starter pede "erro de validação que diga qual campo falhou", mas o teste não verifica o nome do campo. Adicionar `assert.match(error.message, /id/)` no caso de `id` e `/name/` no de `name`.
  - O prompt diz "identificando a etapa de cada uma", mas o teste não diferencia etapas (parse, validação, uso). Sugestão: o erro de parse deve ser `SyntaxError` ou ter `cause` de `SyntaxError`, e o erro de validação deve ser `TypeError`.
- **Lógica:**
  - **Teste de validação fraco.** `assert.ok(error)` aceita qualquer exceção. Uma implementação ingênua `return { id: raw.id, name: raw.name }` lança `TypeError: Cannot read properties of null` para o payload `null` e o teste passa. Correção: `assert.ok(error instanceof TypeError)` em cada caso, mais checagem de mensagem.
  - O caso `{id:'1',name:'A'}` é validado por `assert.ok(error)`, o que aceita erro de runtime qualquer. Mesma correção.
  - `solution` usa `new Error(msg, { cause })` (ES2022). Pré-requisito a conferir.
- **Novo vs planos:** NOVO (teste de validação não distingue erro de validação de erro acidental).

---

## 16.05 — Type predicate  [Gravidade: MÉDIA]

- **Escrita:**
  - `preparation.workedExample` fala de `isPoint(x)` com `latitude` e `longitude`. Essa função não existe no lote e o exemplo não corresponde ao contrato de `User`. Trocar por `isUser`.
  - O prompt não menciona que as propriedades devem ser próprias. O starter sim ("como propriedades próprias"). Incluir no prompt.
- **Lógica:**
  - **A solução usa `(x as any)` duas vezes**, `typeof (x as any).id === "number"` e `typeof (x as any).name === "string"`. A etapa ensina a evitar `as any` (15.04 e 15.08 dizem "nenhum as any"). Sugestão: `Object.hasOwn(x, 'id') && typeof Reflect.get(x, 'id') === 'number'`, ou um `Record<string, unknown>` obtido após checagem de objeto.
  - **A solução troca o corpo do exemplo.** `assessment.solution` define `export const usuarios: User[] = [];`, enquanto o starter faz `registros.filter(isUser)` e o comentário diz "esperado: [{ id: 1, name: "A" }]". Quem copiar a solução perde a demonstração do filtro. Manter `usuarios = registros.filter(isUser)`.
  - O teste "não confunde objeto simples com array-like" só checa aceitação de `{0:1,length:1,id:3,name:'C'}`. O título sugere mais do que o teste verifica.
- **Novo vs planos:** NOVO (`as any` na solução contra o ensino da etapa; `isPoint` órfão; solução altera o exemplo).

---

## Top 5 do lote

1. **13.14 — testes quebram implementação correta.** `carregar({version:1, tasks:[...]})` passa o save como `storage` (o teste 4 mostra que `storage` precisa de `getItem`), e `migrarV2ParaV3(v, warnings)` passa um array onde o starter espera um aviso. Correção: passar `{ getItem: () => JSON.stringify(v1), setItem() {} }` nos testes 1 e 2, e declarar `migrarV2ParaV3(value, warn = () => {})` com o teste usando callback.
2. **15.07 — teste impõe contrato que o enunciado diz ser livre.** `primeiroNome([])` deve lançar `RangeError`, mas o prompt pede "o contrato de ausência escolhido pelo produto" e o transfer pede "fallback ou erro". Correção: fixar no prompt "lista vazia lança RangeError", ou aceitar as duas políticas declaradas pelo aluno.
3. **16.03 — nome do campo do boleto diverge entre exemplo e teste.** Exemplo e starter usam `linha`; teste e solução usam `codigo`. Correção: padronizar em `linha` e ajustar o teste e a solução. Adicionar `@ts-expect-error` para os dois casos inválidos.
4. **14.03 — exemplo de script contradiz o starter.** O exemplo manda `npm test -> vitest run`, mas o README e o teste dizem `node:test`, e o lock não tem `vitest`. O starter ainda usa `test.todo`, que não reprova nada. Correção: `"test": "node --test"` no gabarito, e um teste que leia `package.json` e confira os três scripts.
5. **14.11 — starter inválido e evidência ausente.** O `package.json` do starter tem prosa depois do JSON (não é JSON válido), e os dados de licença, manutenção e lockfile prometidos no prompt não existem. A atividade não pode ser feita como descrita. Correção: separar `dossie.md` com a tabela de dados e deixar `package.json` só com o JSON.

Achados ALTA adicionais, fora do Top 5: 14.06 (NODE_ENV e TOKEN ocultos, mensagem e tipo de erro ocultos, teste do segredo vacuo); 14.08 (testes não cobrem repositório JSON nem JSON inválido, e `executar` não tem contrato); 14.12 (bundle prometido não existe); 14.13 (exemplo de referência `A,P,T` omite `B síncrono`, e os arquivos do Node não existem).
