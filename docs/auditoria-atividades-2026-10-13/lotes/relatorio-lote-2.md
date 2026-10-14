# Relatório de auditoria: Lote 2 (30 atividades, 02.08 a 05.10)

Fonte lida integralmente: `lote-2.md` (4676 linhas). Cada seção indica a linha de início da atividade no lote. Os trechos citados são copiados do JSON. Propostas de teste foram conferidas à mão contra o código do starter e da solução. Itens marcados como "verificar" dependem de conteúdo de outras etapas que não está no lote.

## Resumo de gravidade

| Gravidade | Qtd | Atividades |
|---|---|---|
| ALTA | 4 | 03.04, 04.03, 04.07, 04.09 |
| MÉDIA | 15 | 02.08, 02.10, 03.01, 03.02, 03.03, 03.05, 03.08, 04.01, 04.02, 04.05, 04.08, 04.10, 05.03, 05.06, 05.07 |
| BAIXA | 11 | 02.09, 02.11, 02.12, 03.06, 03.07, 03.09, 04.04, 04.06, 05.01, 05.04, 05.10 |
| OK | 0 | nenhuma sem ressalva |

Cobertura de avaliação do lote: 21 das 30 atividades estão com `SEM ASSESSMENT/TESTE AUTOMATIZADO`. As 9 restantes têm `assessment` com testes, e todas têm `mutants: []`.

## Padrões transversais (achados NOVOS, afetam várias atividades)

1. **Instrução de previsão invertida.** `firstResponse.timing` e `preparation.predictionGuide` trazem "Antes de executar, pedir dica ou abrir a solução." em 04.01 a 04.10. Em 05.01, 05.06 e 05.10 aparecem variantes como "Antes do Run ou solução" e "Antes do primeiro Run, dica ou solução". Isso manda abrir a solução antes da tentativa, o oposto da lógica de previsão. Correção sugerida para cada uma: "Antes de executar, escreva sua previsão. Peça dica só depois de registrar uma tentativa."
2. **Primeira dica cortada e repetindo o enunciado.** A primeira dica de cada atividade com `preparation` guiado copia o enunciado inteiro ("Releia o enunciado e separe entrada, saída e restrições: ..."). Em 04.01, 04.03, 04.07, 04.09 e 05.06 o texto é cortado no meio de uma palavra ou frase (ex.: "...uma arrow é atribuída a um bindin", "...Indique duas ordens válidas para A, B ", "...resumo deve chamar "). Correção: remover o trecho copiado e usar uma dica curta e completa.
3. **`vocabulary` e `workedExample` de outro domínio.** Em 04.03, 04.08 e 04.09 os verbetes têm o mesmo parágrafo repetido e citam funções que não existem no starter (`validarCodigo`, `buscarDescricao`, `montarMensagem`, `minutosDeLeitura`, `paginasConcluidas`, `energiaDisponivel`, `capacidadeDeCarga`).
4. **`mutants: []`** em 9 atividades com assessment (04.04, 04.05, 04.06, 04.07, 04.09, 05.04, 05.06, 05.07, 05.10). Sem mutantes não há como medir a força dos testes, o que explica vários casos de teste fraco abaixo.
5. **Rubricas e `scoring` genéricos** (texto reutilizado) em cerca de 20 das 30 atividades: "Compare competência estrutural em domínio diferente e sem ajuda.", "Aceite qualquer implementação que cumpra entrada, saída, erro e efeitos declarados.", "Exija reprodução, causa, correção e regressão.", "Rode critérios comportamentais e revisão humana para decisões abertas.", "Avalie somente as decisões retiradas e execute o arquivo completo.".
6. **Pré-requisitos ainda não ensinados** (NOVOS, além dos listados nos planos): `node:test` em 04.09 (a etapa 14.03 é quem o apresenta); `export`/ESM em 04.07 (primer diz "Módulos são estudados na etapa 14"); objetos literais em 04.05 e 05.04 (primer diz "etapa 06"); arrays, `push` e spread em 04.02 (antes das etapas 05 e 06); callbacks em 05.03 (primer diz "etapa 07"); `**` em 02.11 (verificar).

---

## Atividades

### 02.08 — Transferencia - preferencia de usuario  [Gravidade: MÉDIA]
Linha 5.
- **Escrita:**
  - O termo "falsy" aparece no prompt ("registre quais valores falsy são escolhas válidas") e "fallback" aparece no objetivo, sem definição no bloco. Proposta de `mental_model`: "Valores falsy são os que o teste `if` trata como falsos: 0, \"\", false, null, undefined e NaN."
  - `common_trap`: "Não grave sempre os valores do primeiro caso." é ambíguo. Texto sugerido: "Não use o valor padrão em todos os casos: se o tema for \"escuro\", ele deve continuar \"escuro\"."
  - `examples.expected` mistura formatos: `0,\"\",false`. Um `console.log` com string vazia imprime um espaço, não aspas. Sugestão: padronizar a saída com `JSON.stringify([volume, tema, notificacoes])`.
- **Lógica:**
  - Sem teste automatizado (`SEM ASSESSMENT`). O `checks.scoring` é genérico.
  - Teste sugerido (fixtures em JSON): as 5 linhas de `examples` como casos, mais `{volumeEntrada: null, temaEntrada: undefined, notificacoesEntrada: undefined}` (esperado `[50, "claro", true]`). Caso que o teste pega: `notificacoesEntrada || true` com entrada `false` devolve `true`, então a correção é verificada.
- **Novo vs planos:** CONFIRMA (sem assessment; scoring genérico). NOVO: termos "falsy" e "fallback" sem definição; formato de saída com `""`.

### 02.09 — Checkpoint: placar com entradas opcionais  [Gravidade: BAIXA]
Linha 71.
- **Escrita:**
  - `prompt`: "Antes de codificar, escreva os dois valores usados e a estratégia para ausência" não diz quais valores. Sugestão: "Antes de codificar, escreva o valor de cada placar depois de aplicar o padrão (a e b) e a soma prevista."
  - `duration` de 10 min para plano, código e 5 casos é curto. Sugestão: 15 min.
- **Lógica:**
  - Os casos de `examples` conferem: 0+5=5; ambos ausentes=0; null e 0=0; 3 e ausência=3; 7 e 2=9.
  - Teste ingênuo `a + b` com undefined dá NaN, e o caso "Ambos ausentes" pega isso.
  - Sem `assessment`. Sugestão: transformar os 5 casos em fixtures executáveis.
- **Novo vs planos:** CONFIRMA (sem assessment). NOVO: duração curta.

### 02.10 — Math: arredondamento, utilitários e sorteios  [Gravidade: MÉDIA]
Linha 137.
- **Escrita:**
  - `examples.given` diz "s=89" mas os resultados são de `89/60` (floor 1, ceil 2). Sugestão: "segundos=89 (minutos = 89/60 = 1,48...)".
  - `checks.scoring` diz "Confira os casos publicados antes e depois da mudança; explique o que alterou", mas esta atividade não tem mudança de código a comparar. Sugestão: "Compare a previsão registrada com a saída de Run, linha por linha da tabela."
- **Lógica:**
  - Verificados: floor/ceil/round/trunc de 89/60 e -89/60; min/max/abs; faces 1, 4 e 6 para 0, 0.5 e 0.9999999999999999.
  - Teste fraco: `Math.round(5*x) + 1` passa nos três casos publicados (0→1, 0.5→4, 0.9999…→6), mas não é a fórmula ensinada (`Math.floor(x*6)+1`). Adicionar `sorteio = 0.1 → face 1` (floor: 0.6→0, face 1; round: 0.5→1, face 2) e `sorteio = 0.3 → face 2` (floor: 1.8→1, face 2; round: 1.5→2, face 3).
  - Sem assessment.
- **Novo vs planos:** CONFIRMA (scoring genérico; sem assessment). NOVO: teste de distribuição insuficiente; `s=89` sem `/60`.

### 02.11 — Number não representa todo decimal exatamente  [Gravidade: BAIXA]
Linha 204.
- **Escrita:**
  - `examples.expected` diz `"bigint" (string)`. `console.log(typeof 1n)` imprime `bigint` sem aspas. Sugestão: "bigint".
  - `prompt`: "Resolva e confira o bloco A antes de avançar" é instrução de UI misturada à tarefa.
- **Lógica:**
  - Valores verificados: `0.1 + 0.2` = 0.30000000000000004; `Number.isSafeInteger(2**53)` = false; `9007199254740992n + 1n` = 9007199254740993n.
  - `scoring` ("confiança é diagnóstica") não é automatizável; sem assessment.
  - O operador `**` aparece no starter (`2 ** 53`) sem explicação nesta lote. Verificar se foi ensinado antes.
- **Novo vs planos:** CONFIRMA (sem assessment; scoring genérico; instrução de UI). NOVO: `**` (verificar).

### 02.12 — Escolha a tolerância pela política do sensor  [Gravidade: BAIXA]
Linha 268.
- **Escrita:**
  - "Não exigir função, rejeição ou if." é confuso. Sugestão: "Não exija função, validação de entrada nem if."
  - "resolução 0.01 unidade" em prosa: use "resolução de 0,01 unidade" (decimal vírgula, como nas outras prosas do curso).
- **Lógica:**
  - Verificados todos os `examples`, incluindo o caso de borda (`a=0, b=0.125, resolucao=0.25 -> true`).
  - Testes ingênuos que seriam pegos: `< tolerancia` (estrito) falha no caso de borda; `Number.EPSILON` como limiar falha em 2000.3 vs 2000.304.
  - Sem assessment. Sugestão: fixtures com os 5 `examples`.
- **Novo vs planos:** CONFIRMA (sem assessment; scoring genérico). NOVO: wording.

### 03.04 — Classificador de faixa  [Gravidade: ALTA]
Linha 335.
- **Escrita:**
  - O starter tem um único placeholder (`else if (/* complete a próxima faixa */)`) seguido de `else { faixa = "A" }`. Faltam três ramos (D, C, B), mas o enunciado fala em "Complete as faixas". A dica "use <40, <60, <80" resolve, mas o starter não mostra isso. Sugestão de starter:
    ```
    } else if (/* D: nota < 40 */) { faixa = "D"; }
    else if (/* C: nota < 60 */) { faixa = "C"; }
    else if (/* B: nota < 80 */) { faixa = "B"; }
    else { faixa = "A"; }
    ```
  - `stageBridge`: "No terceiro exemplo o aluno explica o que a variável representa..." referencia um terceiro exemplo que não existe na atividade. Remover ou incluir.
  - `mental_model`: "nota < 0 || nota > 100 aceita qualquer uma das duas situações inválidas." `aceita` está errado: a condição é verdadeira para as situações inválidas. Sugestão: "é verdadeira para qualquer uma das duas situações inválidas."
  - `duration: "14 min"` para classificador, miniprática com switch, transferência e tabela de 7 linhas. Subestimado. Sugestão: 30 min ou dividir a atividade.
- **Lógica:**
  - As 12 fixtures conferem com a regra (ex.: 19→E, 39→D, 59→C, 79→B, 101→inválida).
  - Teste ingênuo: a cadeia só com D (sem C e B) dá "A" para 60, e a fixture `nota:60 → B` pega.
  - `review` correto (índice 2): 40 falha em `<20` e `<40`, passa em `<60`.
  - Sem assessment para as partes automatizáveis; as fixtures estão no `preparation`.
- **Novo vs planos:** NOVO (starter não corresponde ao enunciado; referência a terceiro exemplo inexistente; duração irreal).

### 03.05 — Teste de limites  [Gravidade: MÉDIA]
Linha 785.
- **Escrita:**
  - `rubric`: "Registrei abaixo, no corte e acima para as três regras." mas o enunciado e a tabela têm quatro regras (inclui `x > 0`). Sugestão: "para as quatro regras".
  - O enunciado não diz os operadores das regras: "Crie casos ... para as regras de desconto, idade, peso e a regra adicional x>0". Os operadores (`total >= 100`, `idade >= 18`, `peso <= 5`, `x > 0`) só aparecem na tabela. Sugestão: escrever as quatro regras no enunciado.
  - `starterFiles.path` é `matriz.md`, mas o conteúdo é JS com `console.log`. Trocar por um `.md` com tabela, ou renomear para `main.js`.
- **Lógica:**
  - `examples` e `table.rows[].expected` trazem o gabarito (99/100/101 → não/sim/sim). Quem copia ganha sem pensar. Sugestão: manter só o `x > 0` nos exemplos, ou ocultar o `expected`.
  - `checks: []`: nenhum check automatizado. Sugestão: 12 fixtures de fronteira (ex.: `{total:99}→false`, `{total:100}→true`).
- **Novo vs planos:** NOVO (rubric com número errado; regras não enunciadas; `matriz.md` com JS).

### 03.01 — Tabela de execução  [Gravidade: MÉDIA]
Linha 960.
- **Escrita:**
  - `objective` diz "o valor após a última atualização de i", o `prompt` diz "preencha i e total", e a `table` tem colunas "Total antes" e "Total depois". Três coisas diferentes. Sugestão para o objetivo: "Registre i e total antes e depois de cada passagem."
  - "os dois pontos e vírgulas separam início, teste e atualização" é ambíguo (lê-se como dois-pontos). Sugestão: "os dois ponto-e-vírgula (;) separam...".
  - `prompt` tem 128 caracteres (abaixo de 150, ver planos).
- **Lógica:**
  - Verificados: linhas (1,1), (2,3), (3,6), (4,10); worked example (2,2), (3,5), (4,9).
  - Sem teste de prova além da fixture `{}`. Fixture suficiente para esta etapa.
- **Novo vs planos:** CONFIRMA (prompt curto). NOVO: incoerência entre objetivo, prompt e tabela.

### 03.02 — Trace sem arrays  [Gravidade: MÉDIA]
Linha 1154.
- **Escrita:**
  - `worked_example` e `preparation.teaching.code` usam `if (i === 3) continue;` (soma final 12). O starter usa `if (i % 2 === 0) continue;` (soma final 9). O aluno vê dois códigos diferentes e uma soma diferente. Sugestão de worked example com o starter: "i=1 soma (1); i=2 pula; i=3 soma (4); i=4 pula; i=5 soma; total 9. Com break em i=2, o laço terminaria com soma 1."
  - `prompt` tem 143 caracteres (abaixo de 150).
- **Lógica:**
  - Fixture `{}` → 9 confere. Teste ingênuo `if (i % 2 === 1) continue;` dá 6, e a fixture pega.
  - Sem assessment automatizado.
- **Novo vs planos:** CONFIRMA (prompt curto; sem assessment). NOVO: worked example com código diferente do starter.

### 03.03 — Monte o FizzBuzz restrito  [Gravidade: MÉDIA]
Linha 1324.
- **Escrita:**
  - `starterFiles` (main.js) tem apenas dois comentários ("Os blocos abaixo devem ser ordenados..."). Os blocos não estão no arquivo; estão só em `parsons.blocks`. Documentar isso no starter ou no `materials`.
  - O bloco `both` usa `i % 15 === 0`, mas o teaching usa `numero % 3 === 0 && numero % 5 === 0`. São equivalentes; falta uma frase ligando as duas formas.
- **Lógica:**
  - Problema principal: `expectedOrder: ["both","three","five","other"]` exige uma sequência exata. `three` e `five` são mutuamente exclusivos, então a ordem entre eles não muda o resultado. A ordem `["both","five","three","other"]` seria recusada, mesmo sendo correta.
  - Correção no validador: aceitar qualquer ordem em que `both` venha antes de `three` e de `five`, e `other` por último.
  - Fixture 1 a 30 e fixture Ping/Pong (1 a 24) conferem.
- **Novo vs planos:** CONFIRMA (starter sem código). NOVO: Parsons com ordem sobre-especificada, que rejeita respostas corretas.

### 03.06 — Loop que não termina  [Gravidade: BAIXA]
Linha 1666.
- **Escrita:** prompt tem 148 caracteres (abaixo de 150).
- **Lógica:**
  - Starter verificado: `fila=3` gera loop infinito com "pausa" (ocorre em `fila=2`, pula `fila--`). Correção `fila--` antes do `continue` dá `[["pausa"],[0]]` para 3 e 4, conforme as fixtures.
  - Miniprática "break numa busca": `let encontrado = 0;` usa 0 como valor de ausência, o mesmo sentinela que 05.04 declara inválido. Sugestão: `let encontrado = null;` e teste também o caso sem negativo.
  - Transferência: a fixture com `saldo: 3` trava o starter (não só falha), o que é um teste válido.
- **Novo vs planos:** CONFIRMA (prompt curto). NOVO: sentinela 0 na miniprática.

### 03.07 — Contador por intervalo  [Gravidade: BAIXA]
Linha 1922.
- **Escrita:**
  - `table.caption`: "Candidatos-chave: ambas as regras são verdadeiras? Escreva sim ou não." não diz `limite=4` nem `divisor=2`, que são os valores usados nas linhas 4, 6, 8 e 10. Sugestão: "Com limite=4 e divisor=2, a regra vale para 4, 6, 8 e 10?"
- **Lógica:**
  - Verificados os 7 casos de `checks` (3, 3, 2, 0, 0, 2, 1).
  - Testes ingênuos pegos: `i >= limite` dá 4 em (10,4,2), e `i < n` dá 2 em (10,4,2).
  - Sem assessment.
- **Novo vs planos:** NOVO (tabela sem parâmetros).

### 03.08 — Transferencia - simulador de fila  [Gravidade: MÉDIA]
Linha 2205.
- **Escrita:**
  - `objective` e `teaching`: "preencha quatro linhas com tick, uma chegada, se há atendimento agendado, fila final e total atendido". A `table` tem só "Fila final" e "Atendidos". Sugestão: incluir as colunas tick, chegada e agenda.
  - `prompt`: "A agenda pode informar zero chegadas em um tick", mas o starter tem só `const chegadasPorTick = 1;`, sem agenda por tick. Sugestão: remover "agenda" e manter `chegadasPorTick`.
- **Lógica:**
  - Verificados: ticks 4→[2,2], 20→[10,10], 1→[1,0], chegadas 0→[0,0]; transferência (ticks 1,2,4,6) → [0,4].
  - Lacuna: os fixtures do cenário-base não distinguem a ordem "chegada antes de atendimento" de "atendimento antes de chegada". Versão que atende primeiro dá os mesmos resultados nos ticks 1, 4 e 20. Só a transferência pega (no tick 6 a fila está vazia antes da chegada: a ordem errada dá [1,3] em vez de [0,4]). Sugestão: mover a transferência para `checks` (hoje ela não está em `checks`).
- **Novo vs planos:** NOVO (colunas da tabela; agenda inexistente; teste base não distingue a ordem).

### 03.09 — Microprojeto - batalha por turnos  [Gravidade: BAIXA]
Linha 2444.
- **Escrita:** `transferPrompt` diz "por no máximo 5 rodadas" e "Informe ... rodada", enquanto o restante usa "turno". Uniformizar para "turno".
- **Lógica:**
  - Verificados os 6 `checks` (`[8,0,3,"heroi"]`, `[0,6,1,"monstro"]`, `[12,9,20,"empate"]`, `[12,0,1,"heroi"]`, `[0,6,1,"monstro"]`, `[10,6,1,"empate"]`) e a tabela (10/6, 8/3, 8/0).
  - Testes ingênuos pegos: sem clamp de HP (`monstro=-4` no fixture `monstro:1`), e contra-ataque de quem já morreu (`[10,-4,1,"heroi"]`).
  - Sem assessment automatizado para a versão principal.
- **Novo vs planos:** NOVO (rodada/turno).

### 04.01 — Preveja retornos  [Gravidade: MÉDIA]
Linha 2722.
- **Escrita:**
  - `firstResponse.timing` e `predictionGuide`: "Antes de executar, pedir dica ou abrir a solução." (padrão transversal 1).
  - Primeira dica truncada: "...uma arrow é atribuída a um bindin" (padrão transversal 2).
  - `prompt`: "Antes da tabela, compare duas formas de declarar uma função" mistura instrução de UI com a tarefa.
- **Lógica:**
  - `checks.fixture.given` é só `"a()"`, mas `expected` cobre 8 chamadas. A fixture não executa. Sugestão: `[["a",[],2],["b",[],undefined],["c",[3],6],["d",[0],undefined],["e",[],null],["f",[],undefined],["g",[2],3],["h",[2],undefined]]`.
  - Valores verificados: a() 2; b() undefined; c(3) 6; d(0) undefined; e() null; f() undefined; g(2) 3; h(2) undefined. `edgeCases` confere.
  - Sem assessment.
- **Novo vs planos:** CONFIRMA (sem assessment; scoring genérico; UI no prompt). NOVO: fixture não executável; timing invertido; dica truncada.

### 04.02 — Retorno vs efeito  [Gravidade: MÉDIA]
Linha 2837.
- **Escrita:**
  - `primers` apresentam `[...a]`, `a.push(1)` e `++n` (arrays e spread antes das etapas 05 e 06). O primer ajuda, mas é conteúdo novo para uma atividade de classificação. Sugestão: trocar `copia` e `muda` por funções só com números nesta etapa, ou mover a atividade para depois da etapa 05.
  - `firstResponse.timing`: padrão transversal 1.
- **Lógica:**
  - A `classificação` é texto livre: `checks` tem uma única fixture com `given: "dobro"` e `expected` em prosa. Não há como validar a resposta automaticamente. Sugestão: tabela com gabarito (dobro: puro; conta: impuro; imprime: impuro; copia: puro; muda: impuro; aleatorio: impuro) e checagem de texto por palavra-chave.
  - Classificações conferidas: `conta` impura (`++n` altera `n`); `muda` impura (`push`); `copia` pura.
- **Novo vs planos:** NOVO (arrays antes da etapa 05; classificação sem checagem).

### 04.03 — Parsons de decomposição  [Gravidade: ALTA]
Linha 2953.
- **Escrita:**
  - `preparation.vocabulary`: os três verbetes (`validarCodigo`, `buscarDescricao`, `montarMensagem`) têm o mesmo texto, "Num gerador de mensagem, ... são auxiliares independentes ...", e nenhum dos três nomes aparece no starter (A–D usam `cParaF`, `formatar`, `exibir`). O verbete não define nenhum termo da atividade. Substituir por:
    - `cParaF`: "converte Celsius em Fahrenheit com c*9/5+32."
    - `formatar`: "acrescenta \" °F\" ao número."
    - `exibir`: "compõe conversão e formatação e devolve o texto final."
  - `preparation.workedExample` fala de "gerador de mensagem" (outro domínio). Sugestão: "Em `exibir(0)`, `cParaF(0)` vale 32; `formatar(32)` devolve \"32 °F\"."
  - `prompt` e `objective` falam em "Desenhe setas" e "Organize os blocos", mas o artefato é `material.md` em prosa (padrão já listado nos planos: 48 starters só com material.md). O aluno não tem como executar a chamada D.
- **Lógica:**
  - Verificados: `exibir(0)` = "32 °F"; `exibir(100)` = "212 °F" (está só em `edgeCases`, não em `examples`).
  - `checks.scoring` ("Avalie ordem/seleção...") não é executável. Sugestão: incluir `exibir(100)` como fixture.
  - Starter não executa: não há `main.js`.
- **Novo vs planos:** CONFIRMA (starter em prosa). NOVO (vocabulário e worked example de outro domínio).

### 04.04 — Complete a assinatura  [Gravidade: BAIXA]
Linha 3069.
- **Escrita:**
  - "mantenha clamp dentro do intervalo se min<=max" é condicional ambíguo. Sugestão: "Considere sempre min <= max (entradas válidas)."
  - `rubric`: "Avalie somente as decisões retiradas e execute o arquivo completo." é genérica (CONFIRMA).
- **Lógica:**
  - Testes sólidos: `media(1,2)=1.5`, `clamp(-1,0,5)=0`, `clamp(5,0,5)=5`, `saudacao("")="Olá, "`, e checagem de que nenhuma função imprime (`semImprimir`).
  - Testes ingênuos pegos: `a+b/2` (dá 4 em `media(2,4)`), `Math.max(x,min)` sem limite superior (dá 10 em `clamp(10,0,5)`).
  - Lacuna: sem caso `min === max`. Sugestão: `clamp(3,5,5)` → 5.
  - `mutants: []`.
- **Novo vs planos:** CONFIRMA (rubric genérica). NOVO: `mutants` vazio.

### 04.05 — Intl em contexto  [Gravidade: MÉDIA]
Linha 3189.
- **Escrita:**
  - Comentário do starter: "Os três formatadores recebem um número e devolvem texto em pt-BR." Contradiz o teste, que exige `formatadorBRL` ser um `Intl.NumberFormat` (`toBeInstanceOf`) e usa `.format(...)`. O aluno pode escrever funções. Sugestão: "Cada formatador é um `Intl.NumberFormat`; o texto sai de `formatador.format(numero)`."
  - `primers`: "Objetos são estudados na etapa 06". O literal `{ style: 'currency' ... }` aparece antes disso. Primer ajuda, mas é pré-requisito antecipado (NOVO).
- **Lógica:**
  - Verifiquei a função `normalizar`: o `replace` troca U+00A0 (espaço sem quebra) por espaço comum. Está correto, não é defeito.
  - Valores conferidos nos testes: `R$ 1.234,50`, `25%`, `1,2 mil`, `999`.
- **Novo vs planos:** NOVO (comentário do starter contradiz o teste; objeto antes da etapa 06).

### 04.06 — Bug de retorno  [Gravidade: BAIXA]
Linha 3312.
- **Escrita:**
  - `prompt`: "Faça a menor correção" não diz que é preciso remover o `console.log` de `dobro`. O teste exige isso (`contarLogs` = 0). Sugestão: "Faça `dobro` devolver `x * 2`, sem `console.log`; imprima o resultado fora de `somaDobros`."
  - `firstResponse.timing`: padrão transversal 1.
- **Lógica:**
  - Verificado: o starter dá NaN e loga 4 e 6. A correção dá 10 sem logs.
  - Teste ingênuo (`return` mantido, `console.log` mantido) falha em `contarLogs`. Boa cobertura.
  - `mutants: []`.
- **Novo vs planos:** CONFIRMA (rubric genérica). NOVO: wording da correção.

### 04.07 — API de carrinho  [Gravidade: ALTA]
Linha 3432.
- **Escrita:**
  - `prompt` não diz o que `adicionarTaxa` devolve (subtotal mais imposto). Só diz "some o imposto". Sugestão: "adicionarTaxa devolve subtotal + imposto."
  - `primers` e `prompt`: `export` e ESM são usados como contrato, mas "Módulos são estudados na etapa 14". Primer mitiga, mas é pré-requisito antecipado (NOVO).
- **Lógica:**
  - Problema principal: o teste não distingue `Math.round` de `Math.ceil`, que é exatamente a regra ("meio centavo arredondado para cima"). Verificado: com `Math.ceil`, todos os casos publicados passam (10000→11000; 105→116; 5→6; 0→0; 105 com desconto 11→105; 100 com desconto 99999→0). O teste `Number.isInteger(totalFinal(333, 0.07, 1))` passa com qualquer inteiro.
  - Testes que pegam o erro (acrescentar ao `assessment.tests`):
    - `expect(adicionarTaxa(1, 0.1)).toBe(1)`: `round(0.1)=0` dá 1; `ceil` dá 2.
    - `expect(adicionarTaxa(333, 0.07)).toBe(356)`: `333*0.07=23.31`, `round` dá 23, `ceil` dá 24.
    - `expect(totalFinal(333, 0.07, 1)).toBe(355)`.
  - `mutants: []`.
- **Novo vs planos:** NOVO (teste deixa passar `Math.ceil`, a regra específica do enunciado).

### 04.08 — Transferencia - regra por funcoes  [Gravidade: MÉDIA]
Linha 3558.
- **Escrita:**
  - `vocabulary`: `minutosDeLeitura` e `paginasConcluidas` (mesmo parágrafo nos dois verbetes) não existem na atividade. Trocar por `custoPeso` e `custoDistancia`.
  - `workedExample`: "resumo diário" é outro domínio. Sugestão: usar `frete(2, 10)`.
  - `firstResponse.timing`: padrão transversal 1.
- **Lógica:**
  - Sem `assessment` (`SEM ASSESSMENT`).
  - Inconsistência de contrato: 04.07 exige centavos inteiros; 04.08 usa R$ como Number float. `custoDistancia(3)` dá `0.30000000000000004` (3*0.1). O enunciado não diz como arredondar nem em que unidade devolver. Sugestão: declarar o retorno em centavos (`custoDistancia(3) = 30`) ou com `toFixed(2)`.
  - Valores conferidos: `custoPeso(2)=4`; `custoDistancia(10)=1`; `frete(2,10)=5`; borda `1.5` e `2` dá `3.2`.
- **Novo vs planos:** CONFIRMA (sem assessment; rubric genérica). NOVO: float em dinheiro; vocabulário de outro domínio.

### 04.09 — Microprojeto - gerador de ficha  [Gravidade: ALTA]
Linha 3671.
- **Escrita:**
  - `vocabulary`: `energiaDisponivel` e `capacidadeDeCarga` não aparecem no starter nem no assessment (padrão transversal 3).
  - Primeira dica truncada: "...resumo deve chamar " (padrão transversal 2).
  - `firstResponse.timing`: padrão transversal 1.
- **Lógica:**
  - Problema principal: o starter `test/main.test.js` usa `import test from 'node:test'` e `test.todo(...)`. O `assessment` usa `describe`, `test` e `expect` como globais (estilo Jest/Vitest). O aluno escreve testes em um runner e o avaliador usa outro. Sugestão: escolher um só e usá-lo no starter e no assessment.
  - `node:test` aparece aqui, na etapa 04. Os planos apontam que a etapa 14.03 o introduz sem contraste com Vitest. Isso é pré-requisito antecipado (NOVO).
  - Testes verificados: `ataque(3,2)=5`; `defesa(4,2)=5`; `defesa(10,7)=13`; `resumo("Lia",3,2,4)`; `resumo("",0,0,0)`; `resumo("Bo",10,5,2)="Bo | ataque 15 | defesa 4"`. Teste ingênuo `armadura + nivel/2` dá `0.5` em `defesa(0,1)`, e o teste pega.
  - `mutants: []`.
- **Novo vs planos:** NOVO (runner diferente no starter e no assessment; `node:test` antes da etapa 14).

### 04.10 — Renomear para explicar  [Gravidade: MÉDIA]
Linha 3799.
- **Escrita:**
  - `mental_model`: "Refatorar nomes é mudança estrutural". Renomear é refatoração sem mudança de comportamento, não mudança estrutural. Sugestão: "Renomear é refatoração: o comportamento observável deve permanecer igual."
  - `firstResponse.timing`: padrão transversal 1.
- **Lógica:**
  - `review` (resposta 2): "as verificações existentes preservam interface e comportamento". A atividade não entrega nenhuma verificação. A premissa da resposta correta não existe no material.
  - `rubric`: "Rode regressões antigas e novos casos" não define quais são as regressões antigas.
  - Sem `assessment`. Sugestão: fornecer 4 casos de regressão (`totalPedido(10,2,3)=17`, `totalPedido(0,4,0)=0`, `totalPedido(4,3,20)=0`, `totalPedido(4,3,0)=12`) e um `assessment` que os execute.
- **Novo vs planos:** NOVO (resposta correta se apoia em verificações inexistentes; regressões não definidas).

### 05.01 — Estado do array  [Gravidade: BAIXA]
Linha 3909.
- **Escrita:**
  - `firstResponse.timing`: "Antes do primeiro Run, dica ou solução." (padrão transversal 1).
- **Lógica:**
  - `examples` dizem `[1,2],[1,2],[1,2]`. Em Node, `console.log(a,b,c)` imprime `[ 1, 2 ] [ 1, 2 ] [ 1, 2 ]`. O gabarito deveria usar o formato real da saída, ou o aluno ficará em dúvida ao comparar.
  - Trace verificado: a=[1,2,3] → pop → [1,2]; b=[1,2]; c=[1,2].
  - `checks.scoring` genérica (predição não é automatizada).
- **Novo vs planos:** NOVO (formato de saída do gabarito).

### 05.03 — Parsons de slug  [Gravidade: MÉDIA]
Linha 4029.
- **Escrita:**
  - O `worked_example` usa `join('.')` e fala em "com ponto". A atividade usa `join("-")`. Sugestão: "com hífen".
  - `hints[1]` (pista): "dado: \" Olá Mundo \"". O exemplo público é `"  Olá  Mundo  "` (espaços duplos). Sem espaços duplos não há token vazio, e a dica perde o ponto da atividade. Corrigir a dica para o exemplo público.
  - `stageBridge`/`primers`: "funções como argumento são estudadas na etapa 07". O `filter` com callback é usado já na etapa 05 (o primer atenua, mas é pré-requisito antecipado).
- **Lógica:**
  - Ordem A→B→C→D→E é única, porque cada bloco depende do anterior. A Parsons está bem especificada.
  - Starter com problema: o `main.js` contém a linha `Blocos: A=const limpo=...` depois da função. Isso não é JavaScript válido, então o arquivo não executa. Mover os blocos para `material.md` ou para o `parsons.blocks`, deixando `main.js` só com a função vazia.
  - Verificados: `"  Olá  Mundo  "→"olá-mundo"`; `""→""`; `" A  B "→"a-b"`.
- **Novo vs planos:** NOVO (starter inválido; hint com espaços simples; `join('.')` no worked example).

### 05.04 — Complete a busca  [Gravidade: BAIXA]
Linha 4155.
- **Escrita:**
  - `prompt`: "registre sua previsão para ocorrências múltiplas, posição inicial e ausência" usa "posição inicial" de forma ambígua. Sugestão: "para ocorrências múltiplas, a primeira posição (índice 0) e a ausência".
  - `primers`: "Objetos são estudados na etapa 06" (mesmo caso de 04.05; pré-requisito antecipado mitigado pelo primer).
- **Lógica:**
  - Testes sólidos: `[a,b,a]/a → {0,2}`; `[sol,lua,sol,mar]/sol → {0,2}` (zero é posição válida); `Object.freeze` não é alterado; ausência `{-1,-1}`.
  - Teste ingênuo `indexOf` nas duas posições falha em `[a,b,a]`. Teste ingênuo `if (indice)` falha em `sol`.
  - `mutants: []`.
- **Novo vs planos:** NOVO (ambiguidade "posição inicial"; objetos antes da etapa 06).

### 05.06 — Bug da mutação: legado vs moderno  [Gravidade: MÉDIA]
Linha 4286.
- **Escrita:**
  - `prompt` entrega as duas soluções prontas: "a versão compatível com cópia explícita `[...numeros].sort((a,b)=>a-b).reverse()` e a versão moderna `numeros.toSorted((a,b)=>a-b).toReversed()`". O aluno copia em vez de implementar. Sugestão: "Corrija `ordenarSemMutar` sem alterar a entrada e implemente `ordenarSemMutarModerno` com os métodos que devolvem cópia."
  - `worked_example` diz "ordem inversa", mas o `prompt` diz "ordem numérica decrescente". Unificar.
  - `firstResponse.timing`: "Antes do Run ou solução." (padrão transversal 1).
- **Lógica:**
  - Testes sólidos (`assessment.tests`): ordem numérica, não texto (`[10,9,100]`), não altera a entrada, entrada congelada, lista vazia, lista nova.
  - Verifiquei: a versão original `numeros.sort(...)` falha com `Object.freeze([2,1])` (TypeError), como o primer explica.
  - `checks.fixture.expected` é prosa (a verificação real está no `assessment`). `mutants: []`.
- **Novo vs planos:** NOVO (solução entregue no enunciado); CONFIRMA (rubric genérica "Exija reprodução, causa, correção e regressão.").

### 05.07 — Estatísticas de lista  [Gravidade: MÉDIA]
Linha 4427.
- **Escrita:**
  - `prompt`: "preserve o retorno publicado para []". O retorno `[null,null,0,null]` só aparece em `edgeCases` e no teste. O enunciado e os exemplos não o mostram. Sugestão: incluir `[] → [null, null, 0, null]` nos exemplos.
  - `prompt`: "escreva uma tabela de acumuladores antes de executar", mas a atividade não tem bloco de tabela (`table`). Sugestão: tabela com colunas `valor`, `min`, `max`, `soma` e `média` para `[11,14,9]`.
- **Lógica:**
  - Testes sólidos: `[2,4,6]`, `[-3]`, `[5,-1,3]` (média 7/3), `[]`, NaN/Infinity/-Infinity/"2" lançam `TypeError`, entrada congelada.
  - Teste ingênuo `Math.min(...numeros)` dá `Infinity` para `[]`; a fixture de `[]` pega. Média por `Math.floor` falha em `[5,-1,3]`.
  - `mutants: []`.
- **Novo vs planos:** CONFIRMA (throw/TypeError antes da etapa 13, listado nos planos; primer mitiga). NOVO: tabela pedida e ausente; contrato de `[]` não visível no enunciado.

### 05.10 — Desaninhe grupos com flat()  [Gravidade: BAIXA]
Linha 4558.
- **Escrita:**
  - `prompt` tem 98 caracteres (abaixo de 150). Pede "explique a profundidade aplicada" sem critério. Sugestão: "Explique em uma frase quantos níveis `flat()` remove."
  - `firstResponse.timing`: "Antes do Run." (padrão transversal 1).
- **Lógica:**
  - Testes sólidos: `[[1,2],[3,[4]]] → [1,2,3,[4]]`; `[[[[1]]]] → [[[1]]]` (pega `flat(Infinity)`); `[[],[1]] → [1]`; entrada congelada.
  - A explicação escrita não é avaliada automaticamente. Aceitável, mas o `scoring` genérico não diz o que checar.
- **Novo vs planos:** CONFIRMA (prompt curto; scoring genérico).

---

## Top 5 do lote

1. **04.07 — teste não distingue arredondamento.** `Math.ceil` passa em todos os testes publicados, mas o enunciado exige `Math.round` ("meio centavo para cima"). Acrescentar a `assessment.tests`: `expect(adicionarTaxa(1, 0.1)).toBe(1)` e `expect(adicionarTaxa(333, 0.07)).toBe(356)`.
2. **03.04 — starter não corresponde ao enunciado.** O starter tem um único placeholder para os ramos D, C e B, com `else` = A. Escrever o starter com os quatro cortes explícitos (`<40`, `<60`, `<80`, else A) e ajustar a duração (14 min é irreal).
3. **03.03 — Parsons rejeita respostas corretas.** `expectedOrder` exige uma ordem exata, mas `three` e `five` são mutuamente exclusivos. Validar apenas: `both` antes de `three` e `five`, e `other` por último.
4. **04.01 a 04.10 (e 05.x) — instrução de previsão invertida.** `firstResponse.timing` e `predictionGuide` dizem "Antes de executar, pedir dica ou abrir a solução." Trocar por "Antes de executar, escreva sua previsão. Peça dica só depois de registrar uma tentativa."
5. **04.09 — runner de testes divergente.** O starter de teste usa `node:test` (e `test.todo`), enquanto o `assessment` usa `describe`/`test`/`expect` globais. O aluno escreve testes em um runner e o avaliador roda outro. Unificar o runner nos dois lados, e não introduzir `node:test` antes da etapa 14.
