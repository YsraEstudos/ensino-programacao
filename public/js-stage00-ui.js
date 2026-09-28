(function (global) {
  "use strict";

  const activities = [
    {
      id: "00.01", title: "Primeiro rastreamento", duration: "18 min", focus: "Código-fonte e saída",
      objective: "Ler instruções em ordem e prever o que cada console.log mostra.",
      explanation: "JavaScript é o texto de instruções que você escreve. console.log(...) pede ao ambiente que mostre valores. O programa começa na primeira linha e segue para baixo; um cálculo dentro dos parênteses acontece antes da chamada mostrar o resultado.",
      vocabulary: ["Código-fonte: as instruções escritas.", "Saída: o que aparece depois da execução.", "Literal: um valor escrito diretamente, como 2 ou \"Oi\"."],
      example: 'console.log("Olá, aprendiz")\nconsole.log(2 + 3)\nconsole.log("Fim da etapa")',
      walkthrough: ["A linha 1 mostra o texto Olá, aprendiz.", "A linha 2 calcula 2 + 3 e mostra o número 5.", "A linha 3 é executada depois das duas primeiras."],
      micro: { question: "O que a segunda linha mostra?", choices: ["O texto 2 + 3", "O número 5", "Nada, porque falta uma variável"], answer: 1, feedback: "A soma acontece antes de console.log mostrar o valor." },
      review: { prompt: "O que console.log(4 + 6) mostra?", choices: ["O texto 4 + 6", "O número 10", "Uma mensagem vazia"], answer: 1, correctFeedback: "Certo: sem aspas, a expressão numérica é calculada antes de ser exibida.", incorrectFeedback: "Revise a diferença entre uma expressão numérica e texto entre aspas." },
      prompt: "Escreva três chamadas console.log: a primeira deve mostrar seu nome ou apelido; a segunda, a soma 4 + 6; a terceira, uma mensagem de encerramento.",
      starter: "", expected: [["Ana"], [10], ["Até a próxima!"]], sample: 'console.log("Ana")\nconsole.log(4 + 6)\nconsole.log("Até a próxima!")',
      expectedLabel: 'três saídas, na ordem: seu nome, o número 10 e uma mensagem final.',
      misconception: "Escrever 4 + 6 entre aspas mostra texto; sem aspas, o interpretador calcula a soma numérica.",
      hints: ["Uma chamada console.log por linha.", "Use aspas para textos e deixe os números sem aspas.", 'Estrutura: console.log("seu texto") e console.log(4 + 6).'],
      reflectionPrompt: "Explique por que 4 + 6 produz um número e por que as três saídas aparecem nessa ordem.",
      transfer: "Troque a soma por 12 - 3. Antes de executar, anote em uma frase qual número espera ver.",
      prediction: "Qual número a expressão 4 + 6 produz?",
      baseline: null
    },
    {
      id: "00.02", title: "Rastrear uma mudança", duration: "20 min", focus: "O programa atual define a saída",
      objective: "Alterar uma chamada, prever a nova saída e comparar o que mudou e o que permaneceu igual.",
      explanation: "A saída pertence ao texto atual do programa. Se você muda só uma expressão, a chamada daquela linha mostra o novo resultado; as outras continuam mostrando seus valores, na mesma ordem.",
      vocabulary: ["Rastreamento: acompanhar cada instrução e sua saída.", "Comparação: observar o antes e o depois sem adivinhar.", "Previsão: registrar o resultado esperado antes de executar."],
      example: 'console.log("A trilha começa")\nconsole.log(2 + 2)\nconsole.log("O foco continua")',
      walkthrough: ["No primeiro programa, a linha 2 mostra o número 4.", "Mude somente o 2 da segunda parcela para 5: 2 + 5.", "Agora a linha 2 mostra 7; a primeira e a terceira saídas não mudam."],
      micro: { question: "Se apenas 2 + 2 virar 2 + 5, o que muda?", choices: ["Só a saída da segunda chamada", "Todas as chamadas", "A ordem das linhas"], answer: 0, feedback: "A alteração está na linha 2: as outras chamadas seguem iguais e na mesma ordem." },
      review: { prompt: "Você mudou somente a expressão da segunda chamada. O que acontece com a primeira saída?", choices: ["Ela também muda automaticamente", "Ela continua igual; a edição afeta a chamada alterada", "Todas as saídas trocam de ordem"], answer: 1, correctFeedback: "Isso: cada chamada mostra o valor descrito pelo código atual daquela linha.", incorrectFeedback: "Lembre-se de acompanhar exatamente qual linha foi editada." },
      prompt: "O exemplo está pronto para você investigar. Registre a previsão e edite somente a segunda chamada para que a saída numérica seja 9; as outras duas linhas devem permanecer iguais.",
      starter: 'console.log("A trilha começa")\nconsole.log(2 + 2)\nconsole.log("O foco continua")',
      expected: [["A trilha começa"], [9], ["O foco continua"]], sample: 'console.log("A trilha começa")\nconsole.log(4 + 5)\nconsole.log("O foco continua")',
      expectedLabel: 'as mesmas mensagens nas linhas 1 e 3, e o número 9 na linha 2.',
      misconception: "Editar o editor não executa o programa sozinho; a saída só se atualiza quando você seleciona Executar.",
      hints: ["Observe qual linha tem uma expressão numérica.", "9 pode ser obtido com 4 + 5.", "Mantenha intactos os dois textos e altere apenas o cálculo."],
      reflectionPrompt: "Qual saída mudou em relação ao programa original? Quais permaneceram iguais?",
      transfer: "Sem mexer nas mensagens, mude o resultado de 9 para 12 e confira se só a saída numérica muda.",
      prediction: "Escreva o novo resultado esperado antes de apertar Executar.", baseline: [["A trilha começa"], [4], ["O foco continua"]]
    },
    {
      id: "00.03", title: "Reconstruir o programa", duration: "22 min", focus: "Ordem das instruções",
      objective: "Reordenar blocos, escolher apenas os trechos relevantes, editar um literal e conferir a sequência final.",
      explanation: "Cada instrução tem uma posição no programa. Reordenar chamadas muda a ordem das saídas. Um bloco extra pode parecer útil, mas precisa ficar de fora se não fizer parte do resultado pedido.",
      vocabulary: ["Bloco: um trecho que pode ser movido inteiro.", "Ordem: a sequência em que as chamadas são executadas.", "Distrator: um bloco disponível que não pertence à solução."],
      example: 'console.log("A")\nconsole.log("B")\nconsole.log("C")',
      walkthrough: ["A saída acompanha a ordem dos blocos.", "Mover o bloco C para cima o faz aparecer antes.", "Um distrator não deve entrar no programa só porque está disponível."],
      micro: { question: "Se o bloco com C vem antes do bloco com A, qual texto aparece primeiro?", choices: ["A", "B", "C"], answer: 2, feedback: "A primeira chamada do programa é a primeira saída." },
      review: { prompt: "Em que ordem o JavaScript mostra três chamadas console.log escritas uma após a outra?", choices: ["Na ordem em que aparecem no programa", "Da última linha para a primeira", "Em ordem alfabética pelo texto"], answer: 0, correctFeedback: "Correto: as instruções são executadas de cima para baixo neste exemplo.", incorrectFeedback: "Imagine o programa percorrendo as linhas desde o início." },
      prompt: "Monte a rotina na ordem acordar → estudar → praticar. Use os controles para organizar os blocos, deixe o distrator de fora e personalize a palavra da última chamada.",
      starter: 'console.log("Acordar")\nconsole.log("Estudar")\nconsole.log("Praticar")',
      expected: [["Acordar"], ["Estudar"], ["Praticar"]], sample: 'console.log("Acordar")\nconsole.log("Estudar")\nconsole.log("Praticar")',
      expectedLabel: 'Acordar e Estudar, seguidos de uma atividade final personalizada.',
      misconception: "O cartão extra não precisa ser usado. Mover um bloco não altera seu texto, só sua posição.",
      hints: ["Comece pelo bloco que representa o início da rotina.", "Use Mover para cima/baixo ou arraste os cartões.", "O cartão Pausar é o distrator; confira também se o editor tem as três chamadas corretas."],
      reflectionPrompt: "Explique como a ordem das chamadas define a ordem das saídas e por que o distrator ficou de fora.",
      transfer: "Inclua uma quarta chamada depois de Praticar com outra atividade sua. Execute e confira a nova última linha.",
      prediction: "Qual palavra deve aparecer como a primeira saída?", baseline: null,
      blocks: [
        { text: "console.log(\"Estudar\")", label: "Estudar", correct: true },
        { text: "console.log(\"Pausar\")", label: "Pausar · distrator", correct: false },
        { text: "console.log(\"Acordar\")", label: "Acordar", correct: true },
        { text: "console.log(\"Praticar\")", label: "Praticar", correct: true }
      ]
    },
    {
      id: "00.04", title: "Complete o eco", duration: "20 min", focus: "Rótulos, números e textos vazios",
      objective: "Completar chamadas com vários argumentos e distinguir o número 0 de uma string vazia.",
      explanation: "Uma chamada pode receber mais de um argumento, separados por vírgulas. Um rótulo ajuda a identificar o próximo valor. O número 0 é um número real; \"\" é um texto com zero caracteres. Os dois existem e podem aparecer na saída.",
      vocabulary: ["Argumento: cada valor separado por vírgula dentro da chamada.", "String vazia: texto entre aspas sem caracteres.", "Número zero: valor numérico 0, sem aspas."],
      example: 'console.log("Saldo:", 0)\nconsole.log("Nome:", "")\nconsole.log("Pontos:", 7)',
      walkthrough: ["Saldo: tem um rótulo e o número 0.", "Nome: tem um rótulo e uma string vazia; o valor não desaparece.", "Pontos: mostra o rótulo e o número 7."],
      micro: { question: "Qual escrita representa uma string vazia?", choices: ["0", '""', '"0"'], answer: 1, feedback: '"" é texto vazio; 0 é um número, e "0" é texto com o caractere zero.' },
      review: { prompt: 'Qual afirmação distingue corretamente 0, "0" e ""?', choices: ["Os três são números iguais", '0 é número, "0" é texto com um caractere e "" é texto vazio', '"" contém o caractere zero'], answer: 1, correctFeedback: 'Exato: aspas delimitam textos; sem caracteres entre elas, a string está vazia.', incorrectFeedback: "Conte os caracteres entre aspas e observe que 0 sem aspas é numérico." },
      prompt: "Complete e personalize os três valores do modelo. Preserve 0 como número na primeira chamada e use \"\" na segunda; depois altere o valor de Pontos para 12.",
      starter: 'console.log("Saldo:", )\nconsole.log("Nome:", )\nconsole.log("Pontos:", )',
      expected: [["Saldo:", 0], ["Nome:", ""], ["Pontos:", 12]], sample: 'console.log("Saldo:", 0)\nconsole.log("Nome:", "")\nconsole.log("Pontos:", 12)',
      expectedLabel: 'Saldo: seguido do número 0; Nome: seguido de texto vazio; Pontos: seguido do número 12.',
      misconception: "Texto vazio continua sendo um argumento. O rótulo ao lado ajuda a notar que a chamada o imprimiu.",
      hints: ["Cada chamada precisa fechar os parênteses.", "Separe o rótulo e o valor com uma vírgula.", 'Use console.log("Nome:", "") para deixar explícito o segundo valor.'],
      reflectionPrompt: 'Explique a diferença entre 0, "0" e "" no resultado do seu programa.',
      transfer: "Troque Saldo: por Estoque: e mantenha o valor 0. Explique por que zero não é a mesma coisa que ausência de argumento.",
      prediction: 'Na chamada console.log("Nome:", ""), quantos caracteres tem o segundo argumento?', baseline: null
    },
    {
      id: "00.05", title: "Mapa de ambientes", duration: "24 min", focus: "Linguagem, ambiente e ferramenta",
      objective: "Distinguir o que é sintaxe JavaScript, o que depende do ambiente hospedeiro e quais itens são ferramentas.",
      explanation: "JavaScript é uma linguagem. Para executar instruções, ela precisa de um ambiente hospedeiro, como o navegador ou Node.js; cada ambiente oferece APIs próprias. Ferramentas como editor e gerenciador de pacotes ajudam a escrever e organizar projetos, mas não são a linguagem.",
      vocabulary: ["Linguagem: regras e construções, como JavaScript.", "Ambiente: navegador ou Node.js, que executa o código e oferece APIs.", "Ferramenta: programa que ajuda a desenvolver, como VS Code ou npm."],
      example: 'console.log("JavaScript", "linguagem")\nconsole.log("Chrome", "navegador")\nconsole.log("Node.js", "ambiente")\nconsole.log("VS Code", "ferramenta")',
      walkthrough: ["JavaScript nomeia a linguagem.", "Chrome é um navegador que hospeda JavaScript.", "Node.js é outro ambiente hospedeiro; VS Code é uma ferramenta de edição."],
      micro: { question: "O que é Node.js nesta classificação?", choices: ["Uma linguagem separada de JavaScript", "Um ambiente que executa JavaScript fora do navegador", "Um editor de código"], answer: 1, feedback: "Node.js é um runtime de JavaScript; ele fornece APIs de servidor próprias." },
      review: { prompt: "Qual classificação de Node.js e VS Code está correta?", choices: ["Node.js é uma ferramenta de edição; VS Code é uma linguagem", "Node.js é um ambiente de execução; VS Code é uma ferramenta", "Ambos são navegadores"], answer: 1, correctFeedback: "Certo: Node.js executa JavaScript fora do navegador; VS Code ajuda a editar código.", incorrectFeedback: "Separe quem executa JavaScript de quem ajuda a escrever e organizar arquivos." },
      prompt: "Classifique os 12 cartões. Depois escreva as quatro chamadas console.log do modelo, preenchendo os rótulos: linguagem, navegador, ambiente e ferramenta. fetch depende do ambiente; classifique como Depende.",
      starter: 'console.log("JavaScript", "____")\nconsole.log("Chrome", "____")\nconsole.log("Node.js", "____")\nconsole.log("VS Code", "____")',
      expected: [["JavaScript", "linguagem"], ["Chrome", "navegador"], ["Node.js", "ambiente"], ["VS Code", "ferramenta"]],
      sample: 'console.log("JavaScript", "linguagem")\nconsole.log("Chrome", "navegador")\nconsole.log("Node.js", "ambiente")\nconsole.log("VS Code", "ferramenta")',
      expectedLabel: 'JavaScript · linguagem; Chrome · navegador; Node.js · ambiente; VS Code · ferramenta.',
      misconception: "fetch é uma API oferecida por navegadores atuais e também por versões atuais de Node.js; sua disponibilidade depende do runtime considerado.",
      hints: ["Separe primeiro os quatro grupos da classificação.", "Chrome abre páginas; Node.js executa JavaScript fora do navegador.", 'Complete o modelo com "linguagem", "navegador", "ambiente" e "ferramenta".'],
      reflectionPrompt: "Por que fetch e console podem depender do ambiente em que o código é executado?",
      transfer: "Escolha uma API que você encontra no navegador e outra de Node.js. Diga qual ambiente fornece cada uma.",
      prediction: "Qual categoria corresponde ao VS Code?", baseline: null,
      cards: [
        ["JavaScript", "linguagem"], ["const", "linguagem"], ["HTML", "linguagem"],
        ["Chrome", "navegador"], ["document", "navegador"], ["window", "navegador"],
        ["Node.js", "ambiente"], ["process", "ambiente"], ["fetch", "depende"],
        ["VS Code", "ferramenta"], ["npm", "ferramenta"], ["console", "depende"]
      ],
      categories: ["linguagem", "navegador", "ambiente", "ferramenta", "depende"]
    }
  ];

  let hintCount = {};
  let pendingSave = null;
  let pendingContext = null;
  let runToken = 0;

  function esc(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }
  function byId(id) { return activities.find((item) => item.id === id); }
  function done(progress, id) { return progress.answers?.[id] === true; }
  function renderOverview(progress) {
    const completed = activities.filter((item) => done(progress, item.id)).length;
    return `<section class="js00-overview"><div class="eyebrow">JAVASCRIPT · ETAPA 00</div><h1>Aprenda escrevendo<span class="brand-period">.</span></h1><p class="js00-lead">Cinco primeiros exercícios: entenda a ideia, veja um exemplo, confira seu raciocínio e escreva código em cada etapa.</p><div class="js00-progress" aria-label="Progresso da etapa"><span style="width:${completed / activities.length * 100}%"></span></div><p class="js00-progress-caption">${completed} de ${activities.length} exercícios concluídos · interpretador introdutório, sem execução geral de JavaScript.</p><div class="js00-card-grid">${activities.map((item, index) => `<article class="js00-card ${done(progress, item.id) ? "is-done" : ""}"><div class="js00-card-top"><span>${esc(item.id)}</span><span>${done(progress, item.id) ? "✓ concluído" : esc(item.duration)}</span></div><div class="js00-card-orbit" aria-hidden="true"><span>${["{ }", "↻", "⇅", '0 ""', "JS"] [index]}</span></div><h2>${esc(item.title)}</h2><p>${esc(item.objective)}</p><a class="button-primary" href="#/javascript/${item.id}">${done(progress, item.id) ? "Revisitar" : "Aprender e praticar"}<span aria-hidden="true">→</span></a></article>`).join("")}</div><aside class="js00-runtime-note"><strong>O que você vai executar</strong><p>Um interpretador pequeno para as chamadas console.log ensinadas aqui. Ele não executa JavaScript arbitrário e não substitui navegador ou Node.js.</p></aside></section>`;
  }

  function renderExercise(id, progress) {
    const item = byId(id);
    if (!item) return "";
    const warmupPassed = progress.warmupCompleted?.[id] === true || done(progress, id);
    const exerciseDone = done(progress, id);
    const draft = typeof progress.exerciseDrafts?.[id] === "string" ? progress.exerciseDrafts[id] : item.starter;
    const code = draft.slice(0, 600);
    const prediction = typeof progress.exercisePredictions?.[id] === "string" ? progress.exercisePredictions[id] : "";
    const reflection = typeof progress.exerciseReflections?.[id] === "string" ? progress.exerciseReflections[id] : "";
    const micro = item.micro;
    const isRebuild = item.id === "00.03";
    const isMap = item.id === "00.05";
    const visual = isRebuild ? `<section class="js00-card-work" aria-labelledby="blocks-heading"><div class="js00-section-kicker">04 · INTERAÇÃO</div><h2 id="blocks-heading">Monte a rotina</h2><p>Reordene os cartões úteis. Arraste com o mouse ou use os botões para teclado.</p><ol class="js00-block-list" data-block-list>${item.blocks.map((block, index) => `<li class="js00-block" draggable="true" data-block-index="${index}" data-correct="${block.correct}" data-code="${esc(block.text)}"><span class="js00-block-grip" aria-hidden="true">⠿</span><span>${esc(block.label)}</span><span><button type="button" data-move="up" aria-label="Mover ${esc(block.label)} para cima">↑</button><button type="button" data-move="down" aria-label="Mover ${esc(block.label)} para baixo">↓</button></span></li>`).join("")}</ol><button type="button" class="button-secondary" data-sync-blocks>Levar blocos úteis ao editor</button><p class="js00-feedback" data-block-feedback aria-live="polite">O cartão Pausar é um distrator e deve ficar de fora.</p></section>` : isMap ? `<section class="js00-card-work"><div class="js00-section-kicker">04 · CLASSIFICAÇÃO</div><h2>Organize os 12 cartões</h2><p>Escolha uma categoria em cada cartão. Para fetch e console, considere o runtime e registre “depende”.</p><div class="js00-vocab-grid">${item.cards.map(([label], index) => `<label class="js00-vocab-card"><span>${esc(label)}</span><select data-vocab="${index}" aria-label="Categoria de ${esc(label)}"><option value="">Escolher</option>${item.categories.map((category) => `<option value="${esc(category)}">${esc(category)}</option>`).join("")}</select></label>`).join("")}</div><button type="button" class="button-secondary" data-check-map>Conferir os cartões</button><p class="js00-feedback" data-map-feedback aria-live="polite"></p></section>` : "";

    return `<article class="js00-exercise"><a class="lesson-back" href="#/javascript">← Visão geral da etapa</a><header class="js00-hero"><div class="eyebrow">${esc(item.id)} · ${esc(item.focus)}</div><h1>${esc(item.title)}<span class="brand-period">.</span></h1><p>${esc(item.objective)}</p><div class="js00-hero-meta"><span>${esc(item.duration)}</span><span>${done(progress, id) ? "✓ concluído" : "em andamento"}</span><span>rascunho salvo automaticamente</span></div></header>
      <div class="js00-steps" aria-label="Etapas da atividade">${["01 Aquecer", "02 Conferir", "03 Prever", "04 Escrever", "05 Executar", "06 Explicar"].map((label, index) => `<span class="${index < (exerciseDone ? 6 : warmupPassed ? 2 : 0) ? "complete" : index === (exerciseDone ? -1 : warmupPassed ? 2 : 0) ? "active" : ""}">${label}</span>`).join("")}</div>
      <section class="js00-learn"><div class="js00-section-kicker">01 · APRENDER ANTES DE PRATICAR</div><h2>Uma ideia de cada vez</h2><p>${esc(item.explanation)}</p><ul class="js00-vocabulary">${item.vocabulary.map((line) => `<li>${esc(line)}</li>`).join("")}</ul></section>
      <section class="js00-worked" data-demo-complete="${warmupPassed}"><div class="js00-section-kicker">02 · AQUECIMENTO ANIMADO</div><div class="js00-worked-head"><div><h2>Veja o código em ação</h2><p>O exemplo é revelado linha por linha; cada saída aparece na ordem de execução.</p></div><div class="js00-play-controls"><button type="button" data-step="back" aria-label="Passo anterior">←</button><button type="button" data-step="play">Assistir ao exemplo</button><button type="button" data-step="next" aria-label="Próximo passo">→</button></div></div><div class="js00-demo-status" data-demo-status role="status" aria-live="polite">${warmupPassed ? "Aquecimento concluído. Você pode rever o exemplo." : "Assista à demonstração completa para liberar a pergunta rápida."}</div><div class="js00-trace"><pre data-trace-code>${esc(item.example)}</pre><div class="js00-trace-output" data-trace-output aria-live="polite"><span>As saídas aparecerão aqui, uma por vez.</span></div></div><ol class="js00-walkthrough">${item.walkthrough.map((line, index) => `<li data-walkthrough="${index}">${esc(line)}</li>`).join("")}</ol></section>
      <section class="js00-micro"><div class="js00-section-kicker">02 · CONFERIR ENTENDIMENTO</div><h2>Uma pergunta rápida</h2><p>${esc(micro.question)}</p><div class="js00-choice-list" role="group" aria-label="Resposta rápida">${micro.choices.map((choice, index) => `<button type="button" class="js00-choice" data-micro-choice="${index}" aria-pressed="${warmupPassed && index === micro.answer}" ${!warmupPassed ? "disabled" : ""}>${String.fromCharCode(65 + index)} · ${esc(choice)}</button>`).join("")}</div><p class="js00-feedback" data-micro-feedback aria-live="polite">${warmupPassed ? `Aquecimento concluído. ${esc(micro.feedback)}` : "A pergunta será liberada depois da demonstração."}</p></section>
      <p class="js00-practice-gate" data-practice-gate role="status" ${warmupPassed ? "hidden" : ""}>Responda corretamente para começar a prática.</p>
      <div class="js00-practice-unlocked" data-practice-unlocked ${warmupPassed ? "" : "hidden"}>${visual}
      <section class="js00-practice"><div class="js00-section-kicker">${isMap ? "05" : isRebuild ? "05" : "04"} · SUA VEZ DE ESCREVER</div><h2>Você no teclado</h2><p>${esc(item.prompt)}</p><label class="js00-prediction">${esc(item.prediction)}<input data-prediction="${esc(id)}" type="text" maxlength="120" placeholder="Registre sua previsão antes de executar" value="${esc(prediction)}" /></label><label class="js00-code-label" for="editor-${esc(id)}">Editor de código · até 600 caracteres</label><textarea id="editor-${esc(id)}" class="js00-editor" data-stage-editor="${esc(id)}" maxlength="600" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="syntax-${esc(id)}">${esc(code)}</textarea><div id="syntax-${esc(id)}" class="js00-syntax-note">Use uma chamada console.log(...) por linha. Aceitos: strings, números e soma de dois literais numéricos.</div><div class="js00-run-row"><button type="button" class="button-primary" data-run="${esc(id)}">Executar meu código <span aria-hidden="true">▶</span></button><button type="button" class="button-secondary" data-hint="${esc(id)}">Preciso de uma dica</button><span class="js00-attempts">${Number(progress.attempts?.[id] || 0)} execuções</span></div><p class="js00-feedback js00-run-feedback" data-run-feedback aria-live="polite"></p><div class="js00-result" data-result hidden aria-live="polite"></div><div class="js00-reflection" data-reflection hidden><strong>Agora, explique o que aconteceu.</strong><p>Compare sua previsão com a saída. ${esc(item.reflectionPrompt)}</p><label class="js00-code-label" for="reflection-${esc(id)}">Sua explicação · pelo menos 16 caracteres</label><textarea id="reflection-${esc(id)}" data-reflection-input="${esc(id)}" maxlength="300" placeholder="Escreva com suas palavras…">${esc(reflection)}</textarea><div class="js00-reflection-footer"><span data-reflection-count>${reflection.trim().length}/16 caracteres</span><button type="button" class="button-primary" data-submit-reflection="${esc(id)}" ${reflection.trim().length < 16 ? "disabled" : ""}>Concluir com minha explicação</button></div><p class="js00-feedback" data-reflection-feedback aria-live="polite"></p></div><div class="js00-hint" data-hint-panel hidden aria-live="polite"></div><div class="js00-transfer" data-transfer hidden><strong>Leve a ideia para outro contexto</strong><p>${esc(item.transfer)}</p></div></section>
      <aside class="js00-misconception"><strong>Uma confusão comum</strong><p>${esc(item.misconception)}</p></aside><footer class="js00-footer"><a class="text-link" href="#/javascript">Voltar aos cinco exercícios</a>${activities[activities.indexOf(item) + 1] ? `<a class="button-secondary" href="#/javascript/${activities[activities.indexOf(item) + 1].id}">Próximo exercício →</a>` : ""}</footer></div></article>`;
  }

  function saveField(context, bucket, id, value, maximum) {
    context.progress[bucket] ||= {};
    context.progress[bucket][id] = String(value).slice(0, maximum);
    clearTimeout(pendingSave);
    pendingContext = context;
    pendingSave = setTimeout(() => { pendingSave = null; pendingContext?.saveProgress(); pendingContext = null; }, 500);
  }

  function saveDraft(context, id, value) { saveField(context, "exerciseDrafts", id, value, 600); }

  function flushDraft(context) {
    if (!pendingSave) return;
    clearTimeout(pendingSave);
    pendingSave = null;
    (pendingContext || context).saveProgress();
    pendingContext = null;
  }

  function activateStep(root, index) {
    root.querySelectorAll(".js00-steps span").forEach((step, stepIndex) => {
      step.classList.toggle("complete", stepIndex < index);
      step.classList.toggle("active", stepIndex === index);
    });
  }

  function completeSteps(root) {
    root.querySelectorAll(".js00-steps span").forEach((step) => {
      step.classList.remove("active");
      step.classList.add("complete");
    });
  }

  function unlockPractice(root) {
    root.querySelector("[data-practice-gate]").hidden = true;
    root.querySelector("[data-practice-unlocked]").hidden = false;
    activateStep(root, 2);
    const heading = root.querySelector("[data-practice-unlocked] h2");
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  }

  function showMicrocheck(button, item, context) {
    const group = button.closest(".js00-micro");
    group.querySelectorAll("[data-micro-choice]").forEach((choice) => choice.setAttribute("aria-pressed", String(choice === button)));
    const feedback = group.querySelector("[data-micro-feedback]");
    const correct = Number(button.dataset.microChoice) === item.micro.answer;
    feedback.textContent = `${correct ? "Isso. " : "Quase. "}${item.micro.feedback}`;
    feedback.classList.toggle("error", !correct);
    feedback.classList.toggle("success", correct);
    if (correct) {
      const root = button.closest(".js00-exercise");
      context.progress.warmupCompleted ||= {};
      context.progress.warmupCompleted[item.id] = true;
      context.saveProgress();
      unlockPractice(root);
    }
  }

  function showHint(button, item) {
    const count = Math.min((hintCount[item.id] || 0) + 1, item.hints.length);
    hintCount[item.id] = count;
    const panel = button.closest(".js00-practice").querySelector("[data-hint-panel]");
    panel.hidden = false;
    const level = ["conceito", "trecho relevante", "exemplo parecido"][count - 1] || "pista";
    panel.textContent = `Dica ${count} de ${item.hints.length} · ${level}: ${item.hints[count - 1]}`;
    button.textContent = count < item.hints.length ? "Próxima dica" : "Ver dica novamente";
  }

  function moveBlock(button, direction) {
    const row = button.closest("[data-block-index]");
    const target = direction === "up" ? row.previousElementSibling : row.nextElementSibling;
    if (!target || !target.matches("[data-block-index]")) return;
    if (direction === "up") row.parentNode.insertBefore(row, target);
    else row.parentNode.insertBefore(target, row);
    row.querySelector(`[data-move="${direction}"]`).focus();
  }

  function handleClick(event, context) {
    const target = event.target.closest("[data-stage-action], [data-micro-choice], [data-hint], [data-run], [data-submit-reflection], [data-step], [data-move], [data-sync-blocks], [data-check-map]");
    if (!target) return false;
    const id = target.dataset.stageAction || target.dataset.microChoice !== undefined && target.closest(".js00-exercise")?.querySelector("[data-run]")?.dataset.run || target.dataset.hint || target.dataset.run || target.dataset.submitReflection || target.closest(".js00-exercise")?.querySelector("[data-run]")?.dataset.run;
    const item = byId(id);
    if (!item) return false;

    if (target.hasAttribute("data-micro-choice")) { showMicrocheck(target, item, context); return true; }
    if (target.hasAttribute("data-hint")) { showHint(target, item); return true; }
    if (target.hasAttribute("data-move")) { moveBlock(target, target.dataset.move); return true; }
    if (target.hasAttribute("data-check-map")) {
      const selects = [...target.closest(".js00-card-work").querySelectorAll("[data-vocab]")];
      const correct = selects.filter((select) => select.value === item.cards[Number(select.dataset.vocab)][1]).length;
      const feedback = target.parentElement.querySelector("[data-map-feedback]");
      feedback.textContent = `${correct} de ${selects.length} classificações corretas. Revise fetch e console pensando no ambiente em que estão disponíveis.`;
      feedback.classList.toggle("success", correct === selects.length);
      feedback.classList.toggle("error", correct !== selects.length);
      return true;
    }
    if (target.hasAttribute("data-sync-blocks")) {
      const rows = [...target.parentElement.querySelectorAll("[data-block-index]")];
      const useful = rows.filter((row) => row.dataset.correct === "true");
      const order = useful.map((row) => row.querySelector("span:nth-child(2)").textContent);
      const textarea = target.closest(".js00-exercise").querySelector("[data-stage-editor]");
      textarea.value = useful.map((row) => row.dataset.code).join("\n");
      saveDraft(context, item.id, textarea.value);
      const feedback = target.parentElement.querySelector("[data-block-feedback]");
      feedback.textContent = order.join(" → ") === "Acordar → Estudar → Praticar" ? "Boa ordem. Confira se o editor também tem exatamente essas três chamadas." : `A ordem atual é ${order.join(" → ")}. Compare com o objetivo da rotina.`;
      feedback.classList.toggle("success", order.join(" → ") === "Acordar → Estudar → Praticar");
      return true;
    }
    if (target.hasAttribute("data-step")) { animateWalkthrough(target, item); return true; }
    if (target.hasAttribute("data-run")) { runCode(target, item, context); return true; }
    if (target.hasAttribute("data-submit-reflection")) { submitReflection(target, item, context); return true; }
    return true;
  }

  function animateWalkthrough(button, item) {
    const section = button.closest(".js00-worked");
    const output = section.querySelector("[data-trace-output]");
    const lines = item.example.split("\n");
    const list = [...section.querySelectorAll("[data-walkthrough]")];
    const current = Number(section.dataset.traceStep || -1);
    const action = button.dataset.step;
    if (action === "play") {
      const wasComplete = section.dataset.demoComplete === "true";
      section.dataset.traceStep = "0";
      section._traceTimer && clearInterval(section._traceTimer);
      output.innerHTML = "";
      section.querySelector("[data-demo-status]").textContent = "Acompanhe cada linha até o fim para liberar a pergunta rápida.";
      if (!wasComplete) {
        section.parentElement.querySelectorAll("[data-micro-choice]").forEach((choice) => { choice.disabled = true; });
      }
      let step = 0;
      const reveal = () => {
        list.forEach((el, index) => el.classList.toggle("is-active", index === step));
        const line = document.createElement("div");
        line.className = "js00-trace-line";
        line.innerHTML = `<span>${step + 1}</span><code></code>`;
        line.querySelector("code").textContent = lines[step];
        output.append(line);
        step += 1;
        if (step >= lines.length) {
          clearInterval(section._traceTimer);
          section.dataset.demoComplete = "true";
          section.querySelector("[data-demo-status]").textContent = "Demonstração concluída. A pergunta rápida está liberada.";
          if (!wasComplete) {
            activateStep(section.closest(".js00-exercise"), 1);
            section.parentElement.querySelectorAll("[data-micro-choice]").forEach((choice) => { choice.disabled = false; });
            section.parentElement.querySelector("[data-micro-feedback]").textContent = "Agora responda para abrir a prática.";
          }
        }
      };
      reveal();
      section._traceTimer = setInterval(reveal, matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 650);
      return;
    }
    section._traceTimer && clearInterval(section._traceTimer);
    const next = Math.max(0, Math.min(lines.length - 1, current + (action === "next" ? 1 : -1)));
    section.dataset.traceStep = String(next);
    list.forEach((el, index) => el.classList.toggle("is-active", index === next));
    output.replaceChildren();
    const line = document.createElement("div"); line.className = "js00-trace-line";
    const number = document.createElement("span"); number.textContent = String(next + 1);
    const code = document.createElement("code"); code.textContent = lines[next];
    line.append(number, code); output.append(line);
  }

  function renderOutput(values, sourceLine) {
    const row = document.createElement("div");
    row.className = "js00-output-line";
    const lineMarker = document.createElement("span");
    lineMarker.className = "js00-source-line";
    lineMarker.textContent = `linha ${sourceLine}`;
    row.append(lineMarker);
    values.forEach((value, index) => {
      if (index) { const comma = document.createElement("span"); comma.className = "js00-output-comma"; comma.textContent = ", "; row.append(comma); }
      const token = document.createElement("span");
      token.className = `js00-output-value ${typeof value === "number" ? "is-number" : "is-string"}`;
      token.textContent = typeof value === "string" && value.length === 0 ? "⟨texto vazio⟩" : String(value);
      if (typeof value === "string" && value.length === 0) token.setAttribute("aria-label", "string vazia");
      row.append(token);
    });
    return row;
  }

  function readableValues(values) {
    return values.map((value) => typeof value === "string" && value.length === 0 ? "⟨texto vazio⟩" : String(value)).join(" · ");
  }

  async function runCode(button, item, context) {
    flushDraft(context);
    const root = button.closest(".js00-exercise");
    const editor = root.querySelector("[data-stage-editor]");
    const feedback = root.querySelector("[data-run-feedback]");
    const resultBox = root.querySelector("[data-result]");
    const reflection = root.querySelector("[data-reflection]");
    const prediction = root.querySelector("[data-prediction]").value.trim();
    if (!prediction) {
      feedback.textContent = "Registre sua previsão antes de executar o código.";
      feedback.classList.remove("success");
      feedback.classList.add("error");
      root.querySelector("[data-prediction]").focus();
      return;
    }
    activateStep(root, 4);
    root.dataset.latestRunCorrect = "false";
    const code = editor.value.slice(0, 600);
    const parsed = global.DevPathStage00Runner.interpret(code);
    const attempt = (Number(context.progress.attempts?.[item.id]) || 0) + 1;
    context.progress.attempts ||= {};
    context.progress.attempts[item.id] = attempt;
    context.saveProgress();
    root.querySelector(".js00-attempts").textContent = `${attempt} ${attempt === 1 ? "execução" : "execuções"}`;
    resultBox.hidden = false;
    reflection.hidden = true;
    feedback.classList.remove("success", "error");
    resultBox.replaceChildren();
    if (!parsed.ok) {
      feedback.textContent = parsed.error.message;
      feedback.classList.add("error");
      context.saveProgress();
      return;
    }

    const outputs = parsed.lines.map((line) => line.values);
    const outputHead = document.createElement("strong"); outputHead.textContent = "Saída do seu programa"; resultBox.append(outputHead);
    const token = ++runToken;
    for (let index = 0; index < outputs.length; index += 1) {
      if (token !== runToken) return;
      const animated = document.createElement("div");
      animated.className = "js00-animated-output";
      animated.append(renderOutput(outputs[index], parsed.lines[index].sourceLine));
      resultBox.append(animated);
      if (!matchMedia("(prefers-reduced-motion: reduce)").matches) await new Promise((resolve) => setTimeout(resolve, 220));
    }
    if (!outputs.length) resultBox.append(document.createTextNode("Nenhuma chamada console.log foi encontrada."));
    if (item.baseline) {
      const comparison = document.createElement("div");
      comparison.className = "js00-comparison";
      const heading = document.createElement("strong");
      heading.textContent = "Comparação: antes e agora";
      comparison.append(heading);
      item.baseline.forEach((before, index) => {
        const after = outputs[index] || [];
        const changed = JSON.stringify(before) !== JSON.stringify(after);
        const row = document.createElement("div");
        row.className = `js00-change ${changed ? "has-changed" : "stayed-same"}`;
        const status = document.createElement("span");
        status.textContent = changed ? `Linha ${index + 1} · mudou` : `Linha ${index + 1} · igual`;
        const values = document.createElement("code");
        values.textContent = `${readableValues(before)}  →  ${readableValues(after) || "sem saída"}`;
        row.append(status, values);
        comparison.append(row);
      });
      resultBox.append(comparison);
    }
    const blocksInOrder = item.id === "00.03"
      ? [...root.querySelectorAll("[data-block-index]")].filter((row) => row.dataset.correct === "true").map((row) => row.querySelector("span:nth-child(2)").textContent).join(" → ") === "Acordar → Estudar → Praticar"
      : true;
    const vocab = [...root.querySelectorAll("[data-vocab]")];
    const cardsCorrect = item.id === "00.05"
      ? vocab.length === 12 && vocab.every((select) => select.value === item.cards[Number(select.dataset.vocab)][1])
      : true;
    let codeCorrect = JSON.stringify(outputs) === JSON.stringify(item.expected);
    if (item.id === "00.01") codeCorrect = outputs.length === 3 && typeof outputs[0]?.[0] === "string" && outputs[0][0].trim().length > 0 && JSON.stringify(outputs.slice(1)) === JSON.stringify([[10], ["Até a próxima!"]]);
    if (item.id === "00.03") codeCorrect = outputs.length === 3 && JSON.stringify(outputs.slice(0, 2)) === JSON.stringify([["Acordar"], ["Estudar"]]) && typeof outputs[2]?.[0] === "string" && outputs[2][0].trim().length > 0 && outputs[2][0].trim() !== "Praticar";
    const exact = codeCorrect && blocksInOrder && cardsCorrect;
    root.dataset.latestRunCorrect = String(exact);
    const predictionFeedback = ` Sua previsão: “${prediction.slice(0, 120)}”.`;
    const baselineNote = item.baseline ? ` Antes, a linha numérica mostrava ${item.baseline[1][0]}; agora mostra ${outputs[1]?.[0] ?? "outro valor"}.` : "";
    if (exact) {
      activateStep(root, 5);
      context.progress.answers ||= {};
      if (context.progress.answers[item.id] !== true) context.progress.answers[item.id] = false;
      feedback.textContent = `Saída correta. Compare-a com sua previsão e escreva uma explicação para concluir: ${item.expectedLabel}${baselineNote}${predictionFeedback}`;
      feedback.classList.add("success");
      reflection.hidden = false;
      root.querySelector("[data-reflection-feedback]").textContent = "";
      root.querySelector("[data-reflection-input]").focus({ preventScroll: true });
      reflection.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      context.saveProgress();
    } else {
      const wasComplete = context.progress.answers?.[item.id] === true;
      feedback.textContent = `Compare a saída exibida com o objetivo (${item.expectedLabel}). Revise a primeira chamada diferente e tente novamente.${predictionFeedback}`;
      feedback.classList.add("error");
      if (!wasComplete) context.progress.answers[item.id] = false;
    }

    if (item.id === "00.03") {
      const rows = [...root.querySelectorAll("[data-block-index]")];
      const order = rows.filter((row) => row.dataset.correct === "true").map((row) => row.querySelector("span:nth-child(2)").textContent);
      const okay = order.join(" → ") === "Acordar → Estudar → Praticar";
      const blockFeedback = root.querySelector("[data-block-feedback]");
      blockFeedback.textContent = okay ? "Ordem dos blocos conferida; o distrator ficou de fora." : `A ordem dos blocos úteis ficou ${order.join(" → ") || "vazia"}. Ajuste os cartões e confira novamente.`;
      blockFeedback.classList.toggle("success", okay);
    }
    if (item.id === "00.05") {
      const selects = [...root.querySelectorAll("[data-vocab]")];
      const correct = selects.filter((select) => select.value === item.cards[Number(select.dataset.vocab)][1]).length;
      const cardFeedback = root.querySelector("[data-map-feedback]");
      cardFeedback.textContent = `${correct} de ${selects.length} cartões classificados corretamente.`;
      cardFeedback.classList.toggle("success", correct === selects.length);
    }
  }

  function submitReflection(button, item, context) {
    const root = button.closest(".js00-exercise");
    const input = root.querySelector("[data-reflection-input]");
    const feedback = root.querySelector("[data-reflection-feedback]");
    const explanation = input.value.trim();
    if (root.dataset.latestRunCorrect !== "true") {
      feedback.textContent = "Execute novamente o código depois da última alteração para confirmar a saída.";
      feedback.classList.add("error");
      return;
    }
    if (explanation.length < 16) {
      feedback.textContent = "Escreva uma frase curta com pelo menos 16 caracteres.";
      feedback.classList.add("error");
      input.focus();
      return;
    }
    context.progress.exerciseReflections ||= {};
    context.progress.exerciseReflections[item.id] = explanation.slice(0, 300);
    context.progress.answers ||= {};
    context.progress.answers[item.id] = true;
    context.progress.completed ||= [];
    if (!context.progress.completed.includes(item.id)) context.progress.completed.push(item.id);
    context.progress.reviewSchedule ||= {};
    if (!context.progress.reviewSchedule[item.id]) context.progress.reviewSchedule[item.id] = { intervalIndex: 0, dueAt: Date.now() + 24 * 60 * 60 * 1000 };
    root.querySelector("[data-transfer]").hidden = false;
    completeSteps(root);
    button.disabled = true;
    button.textContent = "Explicação registrada ✓";
    feedback.textContent = "Explicação registrada. Exercício concluído.";
    feedback.classList.remove("error");
    feedback.classList.add("success");
    context.saveProgress();
  }

  function invalidateRun(root, step) {
    root.dataset.latestRunCorrect = "false";
    activateStep(root, step);
    root.querySelector("[data-reflection]").hidden = true;
    root.querySelector("[data-transfer]").hidden = true;
    const feedback = root.querySelector("[data-run-feedback]");
    feedback.textContent = "Previsão ou código alterados. Execute novamente antes de explicar o resultado.";
    feedback.classList.remove("success");
    feedback.classList.add("error");
  }

  function handleInput(event, context) {
    const editor = event.target.closest("[data-stage-editor]");
    if (editor) {
      saveDraft(context, editor.dataset.stageEditor, editor.value);
      invalidateRun(editor.closest(".js00-exercise"), 4);
      return true;
    }
    const prediction = event.target.closest("[data-prediction]");
    if (prediction) {
      saveField(context, "exercisePredictions", prediction.dataset.prediction, prediction.value, 120);
      invalidateRun(prediction.closest(".js00-exercise"), 2);
      return true;
    }
    const reflection = event.target.closest("[data-reflection-input]");
    if (reflection) {
      saveField(context, "exerciseReflections", reflection.dataset.reflectionInput, reflection.value, 300);
      const section = reflection.closest("[data-reflection]");
      const length = reflection.value.trim().length;
      section.querySelector("[data-reflection-count]").textContent = `${length}/16 caracteres`;
      section.querySelector("[data-submit-reflection]").disabled = length < 16;
      return true;
    }
    return false;
  }

  function handleDrag(event) {
    const row = event.target.closest("[data-block-index]");
    if (event.type === "dragstart" && row) { event.dataTransfer.setData("text/plain", row.dataset.blockIndex); event.dataTransfer.effectAllowed = "move"; return true; }
    if (event.type === "dragover" && row) { event.preventDefault(); row.classList.add("is-drop-target"); return true; }
    if (event.type === "dragleave" && row) { row.classList.remove("is-drop-target"); return true; }
    if (event.type === "drop" && row) {
      event.preventDefault(); row.classList.remove("is-drop-target");
      const source = row.parentElement.querySelector(`[data-block-index="${Number(event.dataTransfer.getData("text/plain"))}"]`);
      if (source && source !== row) row.parentElement.insertBefore(source, row);
      return true;
    }
    return false;
  }

  global.DevPathStage00UI = Object.freeze({ activities, renderOverview, renderExercise, handleClick, handleInput, handleDrag, flushDraft });
})(window);
