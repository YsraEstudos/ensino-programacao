# Relatório de auditoria — Lote 1 (D.01 a 02.07, 30 atividades)

Fonte: `lote-1.md` (3744 linhas, lido integralmente). Referências de linha são desse arquivo. Todas as 30 atividades têm `assessment` = "SEM ASSESSMENT/TESTE AUTOMATIZADO". Nenhuma atividade foi executada; as afirmações sobre saídas foram conferidas à mão.

Legenda de gravidade: ALTA = gabarito, contrato ou teste induz a erro ou aceita solução errada; MÉDIA = instrução ambígua, starter/rubrica que não sustenta a tarefa, ou falta de caso de teste; BAIXA = estilo, terminologia, repetição ou pré-requisito menor.

## Observações sistêmicas do lote

- **Feedback genérico na etapa 01 (NOVO).** A frase "Correto: a resposta acompanha o binding e a execução descrita." e "Releia a explicação e acompanhe o valor atual na ordem das instruções." aparecem em 01.01 a 01.09 (18 ocorrências, pois cada atividade repete o review). Em 01.01 (typeof), 01.05 (NaN), 01.06 (template literal), 01.07 (resumo) e 01.09 a resposta correta é elogiada com um texto que não tem relação com a pergunta.
- **Review duplicado (NOVO).** Em quase todas as atividades 00.x e 01.x, o bloco `review` aparece duas vezes (no topo e dentro de `preparation`), com a mesma pergunta. As respostas batem, mas uma edição futura pode dessincronizar as cópias.
- **objective = mental_model (NOVO, padrão do checklist).** Em 00.01, 00.02, 00.03, 00.04, 00.05, 00.06, 00.07, 00.08 e 00.09 o `objective` é idêntico a `explanation.mental_model` e a `preparation.mental`.
- **Starters em material.md com código a executar (verificar).** Em 01.02, 01.04, 01.05, 01.06, 01.07, 01.08, 01.09, 02.01, 02.02 e 02.03 (além de D.02, que é prosa) o arquivo de partida é `material.md`, mas vários enunciados mandam "Execute" ou "execute o arquivo completo". Os dados não mostram se o executor roda `material.md`. Se não rodar, essas 10 atividades quebram. Verificar no runner.
- **"Run" sem definição (NOVO).** Termo usado como nome de botão em D.01, 00.02, 01.01, 01.02, 01.05, 02.01, 02.02 e nas rubricas. O aluno não recebe a definição.
- **Scoring/rubric genéricos (CONFIRMA).** Ex.: "Avalie somente as decisões retiradas e execute o arquivo completo." (00.04, 01.04, 01.06, 02.04); "Aceite qualquer cálculo..." (02.07); "Aceite qualquer implementação..." (00.07, 01.07); "Compare resposta registrada antes de Run..." (D.01, D.02, 01.05, 02.01, 02.02); "Compare competência estrutural..." (01.08); "Rode critérios comportamentais..." (01.09). Em 02.03 e 02.06 a `rubric` repete o texto dirigido ao avaliador.

---

## Atividades

### D.01 — Leitura de saída  [Gravidade: BAIXA]
- **Escrita:**
  - `explanation.worked_example` (linha 22): "A expressão 3 + 2 vale 5 antes da chamada seguinte escrever 5" é ambíguo, porque a chamada que escreve 5 é a própria chamada de 3 + 2. Correção: "A expressão 3 + 2 vale 5 antes de a segunda chamada escrever 5; depois, a última chamada escreve aberta."
  - `objective` e `firstResponse.action` (linhas 14 e 17) são o mesmo texto.
- **Lógica:**
  - `checks.scoring` e `rubric` (linhas 46 e 51): "Compare resposta registrada antes de Run..." não dá ao aluno um critério observável. Correção de rubrica: "Registrou três saídas na ordem do arquivo e comparou cada uma com a execução."
  - Gabarito (`answer` 0) e feedback estão corretos. Os valores porta, 5, aberta conferem.
- **Novo vs planos:** CONFIRMA rubrica genérica e ausência de assessment. NOVO: "Run" sem definição.

### D.02 — Valores e tipos  [Gravidade: MÉDIA]
- **Escrita:**
  - `objective` (linha 78) diz "quando solicitado, o resultado de typeof", mas o `prompt` (linha 79) não solicita typeof. Correção do prompt: "Classifique cada cartão e registre o resultado de typeof; informe sua confiança."
  - `examples[0].given` é "0", mas o `expected` cobre os seis cartões. Correção: `given` = "cartões: 0, '', false, null, '0', undefined".
  - `mental_model` cita `typeof NaN` e `explanation`, mas NaN não está entre os cartões. Remover ou incluir o cartão.
- **Lógica:**
  - `checks.scoring` (linha 110): "Compare resposta registrada antes de Run..." não se aplica. A atividade é PREDICT sem código executável. Correção: "Cada cartão tem o tipo conceitual e o resultado de typeof registrados; o aluno justifica null e a string vazia."
  - Pré-requisito oculto (NOVO): "truthy/falsy" e "tipo conceitual" são usados no `explanation` ("0 é number e falsy") antes de qualquer definição. A trilha só ensina truthiness em 02.01. Correção: incluir em `preparation.vocabulary` a definição "falsy é um valor que se comporta como falso numa condição (0, '', false, null, undefined, NaN)".
  - Starter (`material.md`, linha 94) é prosa, não cartões. CONFIRMA material.md.
- **Novo vs planos:** NOVO: truthy/falsy antes do ensino. CONFIRMA: material.md e scoring genérico.

### D.03 — Fluxo de decisão  [Gravidade: MÉDIA]
- **Escrita:**
  - O `prompt` diz "preveja o ramo em duas entradas", mas o starter (linha 158) não declara `pontos`. As entradas 10 e 9 só aparecem em `examples`. Correção: starter com `const pontos = 10;` e enunciado "Para pontos = 10 e para pontos = 9, registre o ramo".
  - `why_it_matters` (linha 152): "Testar abaixo, no limite e acima da condição" — só há dois casos (9 e 10); o caso "acima" nunca aparece. Correção: "Testar abaixo e no limite (9 e 10) confirma a regra de decisão."
- **Lógica:**
  - Executar o starter como está gera `ReferenceError: pontos is not defined`. Correção: declarar `pontos` (ver acima).
  - O review (`answer` 2, "Ele oferece o caminho alternativo...") está correto.
- **Novo vs planos:** NOVO (starter sem declaração de entrada; why_it_matters descreve um caso que não existe).

### D.04 — Função e retorno  [Gravidade: BAIXA]
- **Escrita:** bem escrita. `checks.scoring` (linha 238) "Rubrica de localização, fluxo de dados e intenção; nenhuma edição de código é exigida." é o mesmo texto de 00.05 e 00.08.
- **Lógica:** o starter roda e imprime 6; o gabarito (`answer` 0) confere. Não há falha de lógica.
- **Novo vs planos:** CONFIRMA rubrica genérica copiada. NOVO (menor): `function` e `return` aparecem em D.04 sem ensino anterior na trilha; confirmar se o diagnóstico D cobre isso de propósito.

### D.05 — Localize a falha  [Gravidade: ALTA]
- **Escrita:**
  - `prompt` (linha 271): "Escolha leitura, Run ou teste para localizar uma falha curta", mas não existe falha no código.
  - `review.prompt` (linha 310): "o contador diverge do esperado dentro do loop" — a variável se chama `n` e é um acumulador, não um contador.
- **Lógica:**
  - O starter (linha 286) está correto: `total([2,-1,3])` retorna 5 e a soma só considera positivos para qualquer `xs`. Não há defeito a localizar. Os `examples`/`checks` ("por que falha em caso grande? -> teste de borda e debugger") pedem o diagnóstico de algo que não existe, e o gabarito ("breakpoint") não corresponde a nenhum bug do código.
  - Correção sugerida: trocar o starter por uma versão com defeito reproduzível, por exemplo `function total(xs) { let n=0; for (const x of xs) if(x>0) n=x; return n; }`. Então `total([2,-1,3])` retorna 3 e o esperado é 5. Esse caso pequeno reproduz a falha; o debugger é usado para ver `n` a cada iteração. Ajustar `review` e `examples` para esse defeito.
  - `breakpoint` e `debugger` aparecem na explicação sem ensino prévio (NOVO).
- **Novo vs planos:** NOVO. O planos não citam essa atividade.

### 00.01 — Seu primeiro contato com código e saída  [Gravidade: BAIXA]
- **Escrita:**
  - `stageBridge` (linha 514) introduz "modo ES Module", `export function nome(...)` e "imports" antes de qualquer ensino. Nenhum starter desta atividade usa export. Correção: remover essa parte da ponte da 00.01 ou mover para a ponte da etapa 14.
  - `stageBridge` diz "Este site usa Node.js", e `preparation.glossary` diz "não é preciso instalar Node.js". Não é contradição, mas confunde. Correção: "O site executa o arquivo por dentro; você não precisa instalar Node.js."
  - `steps` (linha 406): "Clique em Registrar resposta. Depois use Executar e comparar." — instrução de UI misturada ao conteúdo.
- **Lógica:** o gabarito A, 5, B está correto. O `lab.steps` (answers 0, 0, 1, 0) confere.
- **Novo vs planos:** CONFIRMA instruções de UI. NOVO: export e ES Module na ponte da 00.01.

### 00.02 — Compare uma alteração no programa  [Gravidade: BAIXA]
- **Escrita:**
  - `prompt` (linha 531): "Execute os dois arquivos separadamente pelo botão" é instrução de UI no enunciado. CONFIRMA.
  - `common_trap` (linha 539): "A previsão inicial não continua válida só porque o arquivo parece familiar." é confuso. Correção: "Não reutilize a previsão antiga: releia o arquivo atual e recalcule a linha alterada."
- **Lógica:** o gabarito (entrada / novo / saída) confere, e os casos do `lab` estão coerentes. Sem falha de lógica.
- **Novo vs planos:** CONFIRMA UI no prompt e ausência de assessment.

### 00.03 — Monte um programa com linhas prontas  [Gravidade: ALTA]
- **Escrita:**
  - `prompt` (linha 742): "mostre exatamente Início, Olá, Ana e Fim, nessa ordem" lista quatro itens, mas o resultado esperado tem três linhas (Início / Olá, Ana / Fim). A vírgula em "Olá, Ana" só é esclarecida no `steps[0]`. Correção: "Monte um programa que mostre exatamente três linhas, nesta ordem: Início; Olá, Ana; Fim."
- **Lógica:**
  - `checks.scoring` (linha 773): "não exija ordem entre blocos independentes" contradiz `rubric` (linha 779: "Executei as chamadas na ordem Início, Olá, Ana, Fim") e o `expected` ordenado. Um programa que mostre Fim, Início, Olá, Ana passaria pelo scoring. Correção: "Exija a ordem Início, Olá, Ana, Fim e a ausência de Olá sozinho."
  - Teste fraco: `console.log("Olá"); console.log("Ana");` no lugar de `console.log("Olá, Ana");` produz quatro linhas e não é aceito pelo `expected` de três linhas, mas o enunciado induz esse erro (ver escrita).
- **Novo vs planos:** NOVO.

### 00.04 — Complete os valores de uma mensagem  [Gravidade: BAIXA]
- **Escrita:** `checks.scoring` (linha 900): "Avalie somente as decisões retiradas" não diz nada para o avaliador. Correção: "Avalie as três lacunas preenchidas e execute o arquivo completo."
- **Lógica:** gabarito ("nome: Ana", "pontos: 0", "fim") confere. O `lab` (message-action) está correto: a saída não prova um pagamento real.
- **Novo vs planos:** CONFIRMA scoring genérico copiado para 01.04, 01.06 e 02.04.

### 00.05 — Descubra quem fornece cada recurso  [Gravidade: BAIXA]
- **Escrita:** clara. O link em `preparation.docs[0]` (linha 1229) aponta para a versão fixa "v24.16.0". Não é possível verificar aqui se o caminho existe; conferir antes de publicar.
- **Lógica:** a tabela de referência confere: console e fetch são padrão de host nos dois ambientes; document é navegador; process e node:fs são Node; npm e TypeScript são ferramentas externas. O `lab` (answers 0 e 1) está correto.
- **Novo vs planos:** CONFIRMA rubrica genérica em `checks`. Sem problemas de lógica.

### 00.06 — Investigue um erro de cada vez  [Gravidade: BAIXA]
- **Escrita:** `worked_example` (linha 1340) fala em "Se a linha final mostrasse "errado" em vez de "pronto"", mas o starter usa "erro" e o alvo é "ok". Correção: "em vez de "ok"".
- **Lógica:** a sequência confere: `console.log("Olá);` gera SyntaxError; `consle` gera ReferenceError; "erro" deve virar "ok". O `expected` (Olá, fim, ok) está correto.
- **Novo vs planos:** CONFIRMA ausência de assessment ("Exija reprodução, causa, correção e regressão" sem teste).

### 00.07 — Escreva seu primeiro programa  [Gravidade: MÉDIA]
- **Escrita:** `common_trap` (linha 1031) mistura crases em texto corrido ("`"0"`"). Menor.
- **Lógica:**
  - O objetivo central da atividade é separar o número 0 da string "0", mas a saída não diferencia os dois: `console.log(0)` e `console.log("0")` imprimem o mesmo "0". Um programa `console.log("início"); console.log("0"); console.log("fim");` passa no `expected` (["início"], [0], ["fim"]). Com teste só de saída, a regra "número sem aspas" não é verificada.
  - Correção: além da saída, um teste estático que exija `console.log(0)` (literal numérico) ou que rejeite `"0"` no código. Corrigir `checks.scoring` (linha 1054), hoje genérico: "Aceite qualquer programa que imprima início, 0 e fim nessa ordem, com o zero escrito como número (sem aspas)."
- **Novo vs planos:** NOVO (teste de saída não distingue número de texto). CONFIRMA scoring genérico.

### 00.08 — Leia seu primeiro formulário HTML  [Gravidade: BAIXA]
- **Escrita:** `lab.intro` (linha 1576) diz "Compare ... o foco do campo antes e depois de corrigir", mas o lab não mostra foco. Correção: "Compare o código e a árvore antes e depois de corrigir."
- **Lógica:** gabarito (for=nome ↔ id=nome) e `lab.answer` confere. Sem falha de lógica.
- **Novo vs planos:** NOVO: review duplicado (ver observações sistêmicas).

### 00.09 — Integre as habilidades em um programa curto  [Gravidade: ALTA]
- **Escrita:**
  - `examples[0].expected` (linha 1644) e `checks.fixture.expected` (linha 1651) dizem "removida segunda linha -> abrir, fechar sem erro; apenas o log da linha removida desaparece". Mas o pedido é "aceite a nova exigência de quantidade 0", ou seja, mudar o valor para zero e manter "Itens: 0". `lab.zeroRequirement` (linha 1742) diz "Altere somente o necessário".
  - `worked_example`, `common_trap` e `review` também tratam de remoção de chamada, e não de troca de valor.
- **Lógica:**
  - `expectedByRequirement.zero` (linhas 1708–1723) exige `["Itens:", 0]`. O `checks` aceita a versão sem a linha "Itens:". Um programa que remove a chamada da quantidade passa no fixture e falha no contrato. Correção: trocar o fixture por "zero: ['Itens:', 0] presente; ['Itens:'] ausente -> reprovado" e remover "removida segunda linha" de `examples`/`checks`. A pergunta de remoção pode ficar em `review`, mas separada do requisito de zero.
  - `duration` "8 min" (linha 1620) não cobre quatro linhas, uma exigência de mudança, duas transferências e um desafio final. Sugerir 15 a 18 min.
- **Novo vs planos:** NOVO (fixture contradiz o requisito; duração irreal).

### 01.01 — Classifique valores  [Gravidade: MÉDIA]
- **Escrita:**
  - `objective` (linha 1790): "Cinco rótulos, um por chamada, antes do Run." é fragmento e não é instrução. Correção: "Preveja o rótulo devolvido por typeof em cada uma das cinco chamadas, antes de executar."
  - `correctFeedback` (linha 1838): "Correto: a resposta acompanha o binding e a execução descrita." não se aplica a typeof. Correção: "Correto. typeof null devolve "object" por uma peculiaridade histórica; null é um valor próprio."
  - `stageBridge` (linha 1841) é muito longo e mistura TDZ, template literal, NaN/Infinity/BigInt. Cita "cartão 01.08" e "ficha de 01.09" sem explicação. Sugestão: reduzir ao necessário para typeof e null; mover TDZ para 01.02.
  - Crases em texto corrido (`typeof false` produz `boolean`) podem aparecer literalmente na interface.
- **Lógica:**
  - `prompt` (linha 1791) pede "explique apenas a diferença entre valor e rótulo", mas `rubric` (linha 1828) cobra "Explicar a peculiaridade histórica de null". Critério oculto. Correção: incluir no prompt "e por que typeof null devolve "object"", ou remover a rubrica.
  - Gabarito (`answer` 2, "object") confere.
- **Novo vs planos:** NOVO (feedback genérico, critério oculto). CONFIRMA scoring genérico.

### 01.02 — Rastreie bindings  [Gravidade: MÉDIA]
- **Escrita:** `objective` (linha 1938) e `interaction` (linha 1950) são fragmentos ("Tabela de quatro estados antes do Run.", "Tabela textual navegável."). Correção: "Preencha a tabela com o valor de base e de total após cada uma das quatro instruções."
- **Lógica:**
  - `practiceSteps[1]` (linha 2087) manda "Execute o código e compare cada linha", mas o starter está em `material.md` (linha 1954) e `mode` é "trace". O aluno não tem executor para o arquivo. Correção: renomear para `main.js` ou trocar a instrução por "compare sua tabela com o trace do exemplo".
  - A tabela de estados confere: base=2; total não inicializado; total=2; total=5; saída "2 5".
  - `correctFeedback` genérico (sistêmico).
- **Novo vs planos:** NOVO (instrução de execução em material.md). NOVO: fragmentos no objective.

### 01.03 — Organize dependências  [Gravidade: BAIXA]
- **Escrita:** `notes[1]` (linha 2243) mistura instrução de UI ("Use os botões de subir e descer; para outra tentativa, restaure os blocos.").
- **Lógica:** o gabarito confere: duas ordens válidas com A, B, C independentes antes de D; E fica de fora; "Lia 20 true". O `checks.scoring` "não exija ordem entre blocos independentes" está correto aqui, ao contrário de 00.03, onde a ordem da saída é obrigatória.
- **Novo vs planos:** NOVO: correctFeedback genérico (sistêmico).

### 01.04 — Escolha const ou let  [Gravidade: MÉDIA]
- **Escrita:**
  - `review.choices[0]` (linha 2323): "legendas, porque é false". "legendas" não existe em 01.04 (só aparece em 01.08). Correção: "ativo, porque é false", que é um binding real deste starter.
  - `review.prompt` (linha 2321): "Qual binding precisa de let?" pressupõe uma resposta única, mas pontos, volume e tentativas precisam de let. Correção: "Qual destes bindings muda depois da declaração?" com as opções pontos, ativo, volume.
- **Lógica:**
  - Starter com seis lacunas confere. O `example` (const: nome, ativo, idioma; let: pontos, volume, tentativas; finais Ana, 5, false, 7, pt-BR, 2) está correto.
  - `checks.scoring` (linha 2312) "execute o arquivo completo" esbarra no `material.md` (ver observações sistêmicas).
- **Novo vs planos:** NOVO (distrator com nome inexistente; pergunta com mais de uma resposta). CONFIRMA scoring genérico.

### 01.05 — Classifique valores especiais  [Gravidade: BAIXA]
- **Escrita:** `objective` (linha 2473) "Quatro rótulos antes do Run." é fragmento. `transfer` (linha 2573) "typeof -3" usa o operador unário de menos, mas `notes` diz que operações ficam para a Etapa 02. Correção: trocar por "typeof 3" ou "typeof -Infinity" com aviso, ou remover o sinal.
- **Lógica:** o gabarito (number, number, bigint, object) confere. Starter (`material.md`, linha 2489) com `1n` e o exemplo com `5n` estão corretos e não se contradizem.
- **Novo vs planos:** NOVO (operador unário antes da etapa 02). CONFIRMA material.md.

### 01.06 — Complete uma template literal  [Gravidade: MÉDIA]
- **Escrita:** `practiceSteps[2]` (linha 2721) manda "Execute com os dados alternativos", e `rubric` (linha 2652) diz "Conferir o contrato com dados alternativos". Não há dados alternativos no arquivo nem no enunciado.
- **Lógica:**
  - Teste fraco: a saída pode ser "Nara: nível 3" escrita como texto (`console.log("Nara: nível 3")`) e passa no `contract` sem usar as variáveis. Correção: teste com fixture alternativa (`nome="Lia"`, `nivel=5` → "Lia: nível 5") e checagem de `${`.
  - A solução `` `${nome}: nível ${nivel}` `` cumpre o contrato.
  - O starter é `material.md` (ver observações sistêmicas).
- **Novo vs planos:** NOVO (dados alternativos inexistentes; teste aceita texto colado).

### 01.07 — Escreva um resumo  [Gravidade: BAIXA]
- **Escrita:** `review.prompt` (linha 2787) "O que falta?" não diz do quê. Correção: "Para mostrar '2h15' a partir de horas=2 e minutos=15, o que ainda falta no programa?"
- **Lógica:**
  - `rubric` (linha 2784) "Preservar zero nos dois campos." não tem caso de zero em `examples` nem em `checks`. Correção: incluir fixture `horas=2, minutos=0` → "2h0".
  - `checks.scoring` (linha 2778) aceita `console.log("2h15")` como texto colado. Correção: exigir `${horas}` e `${minutos}` e testar com fixture alternativa.
- **Novo vs planos:** NOVO (teste aceita string colada). CONFIRMA scoring genérico.

### 01.08 — Transfira const e let para configuração  [Gravidade: MÉDIA]
- **Escrita:**
  - `examples[0].expected` (linha 2897) diz "saída conforme o contrato publicado". O contrato (`contract`, linhas 3016–3019) só existe no JSON. Se o aluno não o vê, o enunciado não diz quais são as duas linhas. Correção: copiar as duas linhas esperadas para `prompt` ou `interaction`.
  - `notes[0]` (linha 3021) "execute volume = 7" usa "execute" para atribuição. Correção: "faça a atribuição volume = 7".
- **Lógica:**
  - `checks.scoring` (linha 2906) "Compare competência estrutural em domínio diferente e sem ajuda." não é critério verificável.
  - O gabarito (volume é o único let; duas linhas do contrato) confere.
- **Novo vs planos:** NOVO (contrato fora do enunciado). CONFIRMA scoring genérico.

### 01.09 — Projeto: ficha em três estados  [Gravidade: ALTA]
- **Escrita:**
  - `prompt` (linha 3060): "produza exatamente as três linhas na ordem publicada", mas as três linhas não aparecem no enunciado. Estão em `contract` (linhas 3170–3174).
  - `reflectionPrompt` e `predictionGuide` são o mesmo texto de 01.05, 01.06, 01.07 e demais (boilerplate).
- **Lógica:**
  - Contrato oculto em `masteryTransfers`: o `prompt` do config (linha 3179) diz "altere apenas duração", mas o `expected` exige "duração 30" (linha 3183). O prompt do duration (linha 3220) diz "atualize apenas horas", mas o `expected` exige "6 horas" (linha 3224). Nenhum dos valores 30 e 6 está no enunciado. Correção: "altere a duração para 30" e "altere as horas para 6".
  - `duration` "16 min" (linha 3058) para projeto com três checkpoints, duas transferências com dois casos cada e reflexão. Sugerir 25 min.
  - `checks.scoring` (linha 3091) "Rode critérios comportamentais e revisão humana para decisões abertas." é genérico.
- **Novo vs planos:** NOVO (valores esperados ocultos nas transferências). CONFIRMA scoring genérico e boilerplate.

### 02.01 — Expressões por família: aritmética, comparação e lógica  [Gravidade: MÉDIA]
- **Escrita:**
  - `interaction` (linha 3307) diz "exemplo executável antes da previsão", mas o exemplo fica no `worked_example` e o starter é `material.md`. Correção: publicar o exemplo em `main.js`.
  - `objective` (linha 3295) e `firstResponse.action` (linha 3298) são o mesmo texto longo.
- **Lógica:**
  - Conferidos: Bloco A (14, 20, 5, 2, 4, 8); Bloco B (false, true, true, true, false, "x", "23"); COMPARE (false, true, true, false). O `worked_example` (7 >= 7 → true; !2 → false; "4" + 1 → "41"; curto-circuito) está correto. O review (`answer` 2) confere.
  - `prompt` (linha 3296) pede "explique a coerção de == e por que a trilha prefere ===", mas `rubric` (linha 3332) só cobra "Compare resposta registrada antes de Run...". A explicação não é avaliada. Correção de rubrica: "Explicou por que 0 == \"0\" é true (\"0\" vira número) e por que a trilha usa ===."
- **Novo vs planos:** NOVO (explicação pedida não avaliada). CONFIRMA rubrica genérica e material.md.

### 02.02 — Matriz falsy/nullish  [Gravidade: BAIXA]
- **Escrita:** o starter (`material.md`, linha 3377) é prosa, não uma matriz. O prompt pede "Preencha a matriz", mas não há matriz para preencher. Correção: starter com uma tabela Markdown vazia com colunas `x`, `x || "padrão"`, `x ?? "padrão"`.
- **Lógica:** gabarito correto: `||` dá "padrão" para os seis valores; `??` preserva false, 0, "" e NaN; null e undefined dão "padrão". `review.answer` 0 confere.
- **Novo vs planos:** CONFIRMA rubrica genérica ("Compare resposta registrada antes de Run..."). NOVO: starter sem matriz.

### 02.03 — Parsons de validação  [Gravidade: BAIXA]
- **Escrita:** o distrator E (linha 3441) declara `const podePagar` com o mesmo nome de C. Se o aluno incluir E junto com C, o código dá erro de redeclaração (SyntaxError), e isso não é um distrator lógico. Correção: renomear E para `podePagarAlt` ou explicitar no enunciado que E é distrator lógico.
- **Lógica:** o gabarito confere: `&&` é a conjunção correta; as cinco combinações de `examples` batem. A `rubric` (linha 3462) repete o texto do `scoring`, que é dirigido ao avaliador, não ao aluno. Correção: "Monte a ordem em que C vem depois de A e B e D depois de C; explique por que `&&` e não `||`."
- **Novo vs planos:** NOVO (distrator com redeclaração). CONFIRMA rubrica copiada do scoring.

### 02.04 — Normalizador de entrada  [Gravidade: MÉDIA]
- **Escrita:**
  - `prompt` (linha 3490) pede `numero` e `invalido` "para cada entrada pública", mas o starter (linha 3505) só imprime `invalido`. Correção: `console.log(numero, invalido);` ou pedir só `invalido`.
  - "Entrada pública" não é listada. `examples[0].given` tem só "12". Correção: listar no enunciado as entradas públicas: "12", "0", "" (vazio=true), "abc", "Infinity".
- **Lógica:**
  - Teste fraco: a solução `invalido = vazio || isNaN(numero)` (função global) passa em todos os casos de `examples`, porque nenhum deles é "Infinity". Mas `Number("Infinity")` é aceito como válido por ela. O enunciado cita Infinity e 1e309 como inválidos, e a atividade não os testa. Correção: incluir "Infinity" → invalido true e "1e309" → invalido true.
  - Os demais valores conferem: "12" → false; "0" → false; "" com vazio=true → true; "abc" → true.
- **Novo vs planos:** NOVO (teste deixa passar isNaN no lugar de isFinite; prompt e starter divergem).

### 02.05 — Coercao explicita  [Gravidade: MÉDIA]
- **Escrita:**
  - Título: "Coercao explicita" está sem acento e cedilha. Correção: "Coerção explícita". Em outros pontos do lote a palavra aparece como "Coerção".
  - `prompt` (linha 3557) pede "Exiba entradaValida, total e etiqueta", mas o starter (linha 3572) só tem `console.log(total, etiqueta);` e não declara `entradaValida`. Correção: acrescentar o identificador ao console.log no starter ou ao enunciado.
- **Lógica:**
  - Os cinco casos de `examples` conferem (30; 0; vazio → 0 com válido false; "x" → NaN; "Infinity" → Infinity).
  - Teste fraco: `etiqueta = total + " reais"` (coerção implícita, que o enunciado proíbe) produz a mesma saída. Correção: exigir `String(` na etiqueta e `Number(` nas entradas, ou testar o uso explícito.
- **Novo vs planos:** NOVO (título com erro de português; teste não verifica a conversão explícita pedida).

### 02.06 — Bug de fallback  [Gravidade: MÉDIA]
- **Escrita:** o `constraints` (linha 3659) diz "O domínio desta atividade inclui number, false, null e undefined", mas `examples` e `checks` não dizem o que `false` produz com `??`. Correção: incluir "volumeEntrada=false → false (preservado pelo ??)" ou tirar false do domínio.
- **Lógica:** o gabarito (`??`) confere: 0 → 0; null e undefined → 50. O `review` (answer 1) está correto. O único caso faltante é `false`.
- **Novo vs planos:** NOVO (domínio declarado sem caso de teste). CONFIRMA rubrica que repete o scoring.

### 02.07 — Regra de desconto  [Gravidade: MÉDIA]
- **Escrita:**
  - `objective` (linha 3689) e `firstResponse.action` (linha 3692) falam em "a anotação da fração que permanece", mas o `prompt` não pede anotação. Correção: retirar essa parte do objetivo ou acrescentar ao prompt "registre em comentário a fração que permanece".
  - `interaction` (linha 3701) diz "casos incluem preço zero e desconto integral", mas `examples`/`checks` só têm (100, 0.2) e (50, 0). Correção: incluir (0, 0.2) → 0 e (100, 1) → 0.
- **Lógica:** a fórmula `preco * (1 - taxa)` confere: 80 e 50. O review (answer 2) está correto.
- **Novo vs planos:** NOVO (objetivo e interação prometem coisas que o prompt e os testes não cobram). CONFIRMA scoring genérico ("Aceite qualquer cálculo...").

---

## Top 5 do lote

1. **00.09 — fixture contradiz o requisito.** O enunciado pede quantidade 0 (linha "Itens: 0"), mas `examples`/`checks` aceitam a remoção da linha de quantidade ("removida segunda linha", linhas 1644 e 1651). Um programa que apaga a linha passa. Correção: fixture `['Itens:', 0]` obrigatório e ausência da linha reprovada.
2. **00.03 — o resultado pedido está ambíguo e o scoring contradiz a ordem.** "Início, Olá, Ana e Fim" são quatro itens, mas a saída são três linhas. O scoring diz "não exija ordem entre blocos independentes" (linha 773), enquanto a rubrica e o `expected` exigem a ordem. Correção: "três linhas, nesta ordem: Início; Olá, Ana; Fim" e scoring com ordem obrigatória.
3. **D.05 — o código não tem falha a localizar.** `total` está correto para qualquer entrada, e o enunciado e o gabarito pedem o diagnóstico de um bug inexistente. Correção: trocar o starter por `n=x` (em vez de `n+=x`), em que `total([2,-1,3])` dá 3 e o esperado é 5.
4. **01.09 — valores esperados ocultos nas transferências.** `masteryTransfers` exige "duração 30" e "2 dias | 6 horas", mas os enunciados não dizem esses valores. O enunciado principal também manda produzir "as três linhas na ordem publicada" sem mostrá-las. Correção: escrever os valores no prompt e exibir as linhas do contrato.
5. **Etapa 01 (01.01 a 01.09) — feedback de acerto e erro não corresponde à pergunta.** Em nove atividades, a resposta correta recebe "Correto: a resposta acompanha o binding e a execução descrita." mesmo quando a pergunta é sobre typeof, NaN ou template literal. Correção: feedback específico por questão (ex.: 01.01: "Correto. typeof null devolve "object" por uma peculiaridade histórica; null é um valor próprio.").
