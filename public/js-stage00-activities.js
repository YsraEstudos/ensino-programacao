// Legacy introductory activities used only when the full catalog is unavailable.
(function (global) {
    "use strict";
    global.DevPathStage00Activities = Object.freeze([
        {
            id: "00.01", title: "Primeiro rastreamento", duration: "18 min", focus: "Código-fonte e saída",
            objective: "Ler instruções em ordem e prever o que cada console.log mostra.",
            explanation: "JavaScript é o texto de instruções que você escreve. console.log(...) pede ao ambiente que mostre " +
                "valores. O programa começa na primeira linha e segue para baixo; um cálculo dentro dos parênteses " +
                "acontece antes da chamada mostrar o resultado.",
            vocabulary: ["Código-fonte: as instruções escritas.", "Saída: o que aparece depois da execução.", "Literal: um valor escrito diretamente, como 2 ou \"Oi\"."],
            example: 'console.log("Olá, aprendiz")\nconsole.log(2 + 3)\nconsole.log("Fim da etapa")',
            walkthrough: ["A linha 1 mostra o texto Olá, aprendiz.", "A linha 2 calcula 2 + 3 e mostra o número 5.", "A linha 3 é executada depois das duas primeiras."],
            micro: {
                question: "O que a segunda linha mostra?", choices: ["O texto 2 + 3", "O número 5", "Nada, porque falta uma variável"], answer: 1, feedback: "A soma acontece antes de console.log mostrar o valor."
            },
            review: {
                prompt: "O que console.log(4 + 6) mostra?", choices: ["O texto 4 + 6", "O número 10", "Uma mensagem vazia"], answer: 1, correctFeedback: "Certo: sem aspas, a expressão numérica é calculada antes de ser exibida.", incorrectFeedback: "Revise a diferença entre uma expressão numérica e texto entre aspas."
            },
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
            explanation: "A saída pertence ao texto atual do programa. Se você muda só uma expressão, a chamada daquela linha " +
                "mostra o novo resultado; as outras continuam mostrando seus valores, na mesma ordem.",
            vocabulary: ["Rastreamento: acompanhar cada instrução e sua saída.", "Comparação: observar o antes e o depois sem adivinhar.", "Previsão: registrar o resultado esperado antes de executar."],
            example: 'console.log("A trilha começa")\nconsole.log(2 + 2)\nconsole.log("O foco continua")',
            walkthrough: ["No primeiro programa, a linha 2 mostra o número 4.", "Mude somente o 2 da segunda parcela para 5: 2 + 5.", "Agora a linha 2 mostra 7; a primeira e a terceira saídas não mudam."],
            micro: {
                question: "Se apenas 2 + 2 virar 2 + 5, o que muda?", choices: ["Só a saída da segunda chamada", "Todas as chamadas", "A ordem das linhas"], answer: 0, feedback: "A alteração está na linha 2: as outras chamadas seguem iguais e na mesma ordem."
            },
            review: {
                prompt: "Você mudou somente a expressão da segunda chamada. O que acontece com a primeira saída?", choices: ["Ela também muda automaticamente", "Ela continua igual; a edição afeta a chamada alterada", "Todas as saídas trocam de ordem"], answer: 1, correctFeedback: "Isso: cada chamada mostra o valor descrito pelo código atual daquela linha.", incorrectFeedback: "Lembre-se de acompanhar exatamente qual linha foi editada."
            },
            prompt: "O exemplo está pronto para você investigar. Registre a previsão e edite somente a segunda chamada " +
                "para que a saída numérica seja 9; as outras duas linhas devem permanecer iguais.",
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
            explanation: "Cada instrução tem uma posição no programa. Reordenar chamadas muda a ordem das saídas. Um bloco " +
                "extra pode parecer útil, mas precisa ficar de fora se não fizer parte do resultado pedido.",
            vocabulary: ["Bloco: um trecho que pode ser movido inteiro.", "Ordem: a sequência em que as chamadas são executadas.", "Distrator: um bloco disponível que não pertence à solução."],
            example: 'console.log("A")\nconsole.log("B")\nconsole.log("C")',
            walkthrough: ["A saída acompanha a ordem dos blocos.", "Mover o bloco C para cima o faz aparecer antes.", "Um distrator não deve entrar no programa só porque está disponível."],
            micro: {
                question: "Se o bloco com C vem antes do bloco com A, qual texto aparece primeiro?", choices: ["A", "B", "C"], answer: 2, feedback: "A primeira chamada do programa é a primeira saída."
            },
            review: {
                prompt: "Em que ordem o JavaScript mostra três chamadas console.log escritas uma após a outra?", choices: ["Na ordem em que aparecem no programa", "Da última linha para a primeira", "Em ordem alfabética pelo texto"], answer: 0, correctFeedback: "Correto: as instruções são executadas de cima para baixo neste exemplo.", incorrectFeedback: "Imagine o programa percorrendo as linhas desde o início."
            },
            prompt: "Monte a rotina na ordem acordar → estudar → praticar. Use os controles para organizar os blocos, " +
                "deixe o distrator de fora e personalize a palavra da última chamada.",
            starter: 'console.log("Acordar")\nconsole.log("Estudar")\nconsole.log("Praticar")',
            expected: [["Acordar"], ["Estudar"], ["Praticar"]], sample: 'console.log("Acordar")\nconsole.log("Estudar")\nconsole.log("Praticar")',
            expectedLabel: 'Acordar e Estudar, seguidos de uma atividade final personalizada.',
            misconception: "O cartão extra não precisa ser usado. Mover um bloco não altera seu texto, só sua posição.",
            hints: ["Comece pelo bloco que representa o início da rotina.", "Use Mover para cima/baixo ou arraste os cartões.", "O cartão Pausar é o distrator; confira também se o editor tem as três chamadas corretas."],
            reflectionPrompt: "Explique como a ordem das chamadas define a ordem das saídas e por que o distrator ficou de fora.",
            transfer: "Inclua uma quarta chamada depois de Praticar com outra atividade sua. Execute e confira a nova última linha.",
            prediction: "Qual palavra deve aparecer como a primeira saída?", baseline: null,
            blocks: [
                {
                    text: "console.log(\"Estudar\")", label: "Estudar", correct: true
                },
                {
                    text: "console.log(\"Pausar\")", label: "Pausar · distrator", correct: false
                },
                {
                    text: "console.log(\"Acordar\")", label: "Acordar", correct: true
                },
                {
                    text: "console.log(\"Praticar\")", label: "Praticar", correct: true
                }
            ]
        },
        {
            id: "00.04", title: "Complete o eco", duration: "20 min", focus: "Rótulos, números e textos vazios",
            objective: "Completar chamadas com vários argumentos e distinguir o número 0 de uma string vazia.",
            explanation: "Uma chamada pode receber mais de um argumento, separados por vírgulas. Um rótulo ajuda a identificar " +
                "o próximo valor. O número 0 é um número real; \"\" é um texto com zero caracteres. Os dois existem e " +
                "podem aparecer na saída.",
            vocabulary: ["Argumento: cada valor separado por vírgula dentro da chamada.", "String vazia: texto entre aspas sem caracteres.", "Número zero: valor numérico 0, sem aspas."],
            example: 'console.log("Saldo:", 0)\nconsole.log("Nome:", "")\nconsole.log("Pontos:", 7)',
            walkthrough: ["Saldo: tem um rótulo e o número 0.", "Nome: tem um rótulo e uma string vazia; o valor não desaparece.", "Pontos: mostra o rótulo e o número 7."],
            micro: {
                question: "Qual escrita representa uma string vazia?", choices: ["0", '""', '"0"'], answer: 1, feedback: '"" é texto vazio; 0 é um número, e "0" é texto com o caractere zero.'
            },
            review: {
                prompt: 'Qual afirmação distingue corretamente 0, "0" e ""?', choices: ["Os três são números iguais", '0 é número, "0" é texto com um caractere e "" é texto vazio', '"" contém o caractere zero'], answer: 1, correctFeedback: 'Exato: aspas delimitam textos; sem caracteres entre elas, a string está vazia.', incorrectFeedback: "Conte os caracteres entre aspas e observe que 0 sem aspas é numérico."
            },
            prompt: "Complete e personalize os três valores do modelo. Preserve 0 como número na primeira chamada e use " +
                "\"\" na segunda; depois altere o valor de Pontos para 12.",
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
            explanation: "JavaScript é uma linguagem. Para executar instruções, ela precisa de um ambiente hospedeiro, como o " +
                "navegador ou Node.js; cada ambiente oferece APIs próprias. Ferramentas como editor e gerenciador de " +
                "pacotes ajudam a escrever e organizar projetos, mas não são a linguagem.",
            vocabulary: ["Linguagem: regras e construções, como JavaScript.", "Ambiente: navegador ou Node.js, que executa o código e oferece APIs.", "Ferramenta: programa que ajuda a desenvolver, como VS Code ou npm."],
            example: 'console.log("JavaScript", "linguagem")\nconsole.log("Chrome", "navegador")\nconsole.log("Node.js", "ambiente")\nconsole.log("VS Code", "ferramenta")',
            walkthrough: ["JavaScript nomeia a linguagem.", "Chrome é um navegador que hospeda JavaScript.", "Node.js é outro ambiente hospedeiro; VS Code é uma ferramenta de edição."],
            micro: {
                question: "O que é Node.js nesta classificação?", choices: ["Uma linguagem separada de JavaScript", "Um ambiente que executa JavaScript fora do navegador", "Um editor de código"], answer: 1, feedback: "Node.js é um runtime de JavaScript; ele fornece APIs de servidor próprias."
            },
            review: {
                prompt: "Qual classificação de Node.js e VS Code está correta?", choices: ["Node.js é uma ferramenta de edição; VS Code é uma linguagem", "Node.js é um ambiente de execução; VS Code é uma ferramenta", "Ambos são navegadores"], answer: 1, correctFeedback: "Certo: Node.js executa JavaScript fora do navegador; VS Code ajuda a editar código.", incorrectFeedback: "Separe quem executa JavaScript de quem ajuda a escrever e organizar arquivos."
            },
            prompt: "Classifique os 12 cartões. Depois escreva as quatro chamadas console.log do modelo, preenchendo os " +
                "rótulos: linguagem, navegador, ambiente e ferramenta. fetch depende do ambiente; classifique como " +
                "Depende.",
            starter: 'console.log("JavaScript", "____")\nconsole.log("Chrome", "____")\nconsole.log("Node.js", "____")\nconsole.log("VS Code", "____")',
            expected: [
                ["JavaScript", "linguagem"], ["Chrome", "navegador"], ["Node.js", "ambiente"], ["VS Code", "ferramenta"]
            ],
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
            categories: [
                "linguagem", "navegador", "ambiente", "ferramenta", "depende"
            ]
        },
        {
            id: "00.06", stage: "00", title: "Caça ao erro inicial", duration: "9 min", focus: "Depurar uma falha por vez",
            objective: "Encontrar três erros em sequência, corrigir o primeiro que impede a execução e conferir cada ajuste.",
            explanation: "O interpretador precisa conseguir ler a instrução antes de executá-la. Uma aspa aberta pode impedir " +
                "a leitura do restante do arquivo. Depois que a sintaxe é corrigida, outros erros podem aparecer; por " +
                "isso, investigamos uma falha por vez.",
            vocabulary: ["Sintaxe: regras de escrita que permitem ler o programa.", "Erro de execução: uma instrução válida tenta usar algo que não existe.", "Regressão: executar outra vez depois do ajuste para conferir o resultado."],
            example: 'console.log("Olá")\nconsole.log("fim")\nconsole.log("ok")',
            walkthrough: ["As aspas fecham o texto da primeira linha.", "console.log tem o nome correto nas três instruções.", "Com a primeira falha removida, o programa pode chegar às linhas seguintes."],
            micro: {
                question: "Qual problema pode impedir o arquivo de ser lido antes de qualquer saída?", choices: ["Uma aspa que não foi fechada", "Uma mensagem curta", "Um número negativo"], answer: 0, feedback: "Uma string sem fechamento deixa a instrução incompleta; corrija isso antes de investigar a próxima linha."
            },
            review: {
                prompt: "Um arquivo mostra SyntaxError na primeira linha. Qual é a melhor próxima ação?", choices: ["Mudar todas as linhas ao mesmo tempo", "Corrigir uma causa provável nessa linha e executar de novo", "Apagar o restante do arquivo"], answer: 1, correctFeedback: "Isso. Uma alteração por vez ajuda a ligar cada correção ao resultado observado.", incorrectFeedback: "Tente preservar o programa e isolar a primeira falha antes de mudar outras linhas."
            },
            prompt: "O arquivo tem uma aspa ausente, um nome de método digitado errado e uma chamada inexistente. Corrija um problema por vez e execute após cada mudança.",
            starter: 'console.log("Olá);\nconsole.lo("fim");\nconsole.logg("ok");', expected: [["Olá"], ["fim"], ["ok"]], sample: 'console.log("Olá")\nconsole.log("fim")\nconsole.log("ok")', minimumEdits: 3,
            expectedLabel: "três textos curtos, depois de corrigir as falhas sem pular direto para uma solução copiada.",
            misconception: "A primeira mensagem de erro pode esconder problemas que só ficam visíveis depois da primeira correção.",
            hints: ["Comece pela mensagem de erro mais antiga; o arquivo pode nem ter sido lido por completo.", "Confira o fechamento das aspas na linha 1 antes de avaliar as chamadas seguintes.", 'Compare com esta forma válida: console.log("A") — depois revise o nome de cada chamada.'],
            reflectionPrompt: "Qual foi o primeiro erro, o que apareceu depois de corrigi-lo e por que você executou entre os ajustes?",
            transfer: 'Investigue outro trecho curto como console.log("B) e console.lo("C"). Descreva a primeira falha sem copiar a solução.',
            prediction: "Antes de executar, qual tipo de erro você espera encontrar primeiro?", baseline: null
        },
        {
            id: "00.07", stage: "00", title: "Calculadora por literais", duration: "7 min", focus: "Somar valores escritos no código",
            objective: "Prever e completar três somas de literais, incluindo zero e um número negativo.",
            explanation: "O sinal + soma os dois valores numéricos escritos ao lado dele. Cada console.log mostra o resultado " +
                "dessa linha. Zero pode participar de uma soma sem mudar o outro valor; um número negativo continua " +
                "sendo um número.",
            vocabulary: ["Operador +: soma dois valores numéricos neste exercício.", "Literal: número escrito diretamente no código.", "Precedência: regra sobre qual operador calcular primeiro; ainda não precisamos dela aqui."],
            example: "console.log(2 + 3)\nconsole.log(0 + 4)\nconsole.log(-1 + 2)",
            walkthrough: ["2 + 3 resulta em 5.", "Somar zero a 4 mantém o resultado 4.", "-1 + 2 resulta em 1; o sinal negativo faz parte do primeiro número."],
            micro: {
                question: "Quanto resulta em 0 + 4?", choices: ["0", "4", "04"], answer: 1, feedback: "Zero não altera o outro valor em uma soma numérica."
            },
            review: {
                prompt: "O que console.log(-3 + 1) mostra?", choices: ["-2", "-4", "31"], answer: 0, correctFeedback: "Correto: partindo de -3 e avançando uma unidade, o resultado é -2.", incorrectFeedback: "Marque os números na reta: -3, -2, -1, 0, 1."
            },
            prompt: "Complete os dois espaços e personalize uma das somas. Registre primeiro os três resultados que espera ver.",
            starter: "console.log(2 + )\nconsole.log(0 + 4)\nconsole.log(-1 + )", expected: [[5], [4], [1]], sample: "console.log(2 + 3)\nconsole.log(0 + 4)\nconsole.log(-1 + 2)",
            expectedLabel: "5, 4 e 1, na ordem do programa.", misconception: "Sem aspas, esses valores são somas numéricas; o programa não está juntando caracteres.",
            hints: ["Resolva uma soma de cada vez, sem misturar as linhas.", "A primeira lacuna participa de 2 + 3; a última começa em -1.", "Um exemplo parecido: console.log(-2 + 5) mostra 3."],
            reflectionPrompt: "Explique como o zero e o sinal negativo aparecem nos resultados das três linhas.",
            transfer: "Troque 0 + 4 por 0 + 0 e -1 + 2 por -3 + 1; preveja e confira as novas saídas.",
            prediction: "Escreva os três resultados na ordem antes de executar.", baseline: null
        },
        {
            id: "00.08", stage: "00", title: "HTML ponte zero", duration: "8 min", focus: "Ler e escrever uma estrutura HTML",
            codeMode: "html", objective: "Identificar form, label, input, button, atributos e relações pai-filho; completar a ligação entre rótulo e campo.",
            explanation: "HTML descreve a estrutura de uma página. Uma tag indica o tipo de elemento; atributos dão detalhes " +
                "como id e class. Um label pode apontar para um campo por meio do atributo for, cujo valor precisa " +
                "corresponder ao id desse input.",
            vocabulary: ["Tag: marca de abertura ou fechamento de um elemento HTML.", "Atributo: informação escrita na tag, como id ou class.", "Pai e filho: relação entre um elemento que contém outro e o elemento contido."],
            example: '<form id="entrada">\n  <label for="nome">Nome</label>\n  <input id="nome" class="campo">\n  <button>Enviar</button>\n</form>',
            walkthrough: ["form contém os três elementos do pequeno formulário.", "label aponta para o campo cujo id é nome.", "input é filho de form, assim como label e button."],
            micro: {
                question: "Para qual atributo o valor de label for deve apontar?", choices: ["Para o id do input correspondente", "Para o nome da tag form", "Para a class do botão"], answer: 0, feedback: "O valor de for conecta o rótulo ao id do campo."
            },
            review: {
                prompt: 'Um label tem for="email". Qual input corresponde a ele?', choices: ['O input com id="email"', 'Qualquer input dentro da mesma página', 'O input com class="email"'], answer: 0, correctFeedback: "Isso: for se conecta ao id do controle.", incorrectFeedback: "Compare o atributo for do rótulo com o id do campo; class não faz essa ligação."
            },
            prompt: 'Complete a ligação do rótulo: acrescente for="nome" ao label. Mantenha os três elementos como filhos de form; depois execute a conferência estrutural.',
            starter: '<form id="entrada">\n  <label>Nome</label>\n  <input id="nome" class="campo">\n  <button>Enviar</button>\n</form>', expected: [], sample: '<form id="entrada">\n  <label for="nome">Nome</label>\n  <input id="nome" class="campo">\n  <button>Enviar</button>\n</form>', codeStarterForComparison: '<form id="entrada">\n  <label>Nome</label>\n  <input id="nome" class="campo">\n  <button>Enviar</button>\n</form>',
            expectedLabel: "um form contendo label, input e button, com for e id ligados pelo valor nome.", misconception: "id e class descrevem elementos, mas o vínculo acessível do label usa for com o id do campo.",
            hints: ['O rótulo precisa indicar a qual campo seu texto pertence.', "Compare o atributo for do label com o id do input abaixo dele.", 'Exemplo parecido: <label for="cidade">Cidade</label> e <input id="cidade">.'],
            reflectionPrompt: "Explique como o navegador sabe que o texto Nome pertence àquele input.",
            transfer: 'Se o campo passar a ter id="email", altere o label correspondente e mantenha-os dentro do mesmo form.',
            prediction: "Antes de conferir, o que falta para associar Nome ao input?", baseline: null
        },
        {
            id: "00.09", stage: "00", title: "Microprojeto — roteiro de execução", duration: "15 min", focus: "Prever, modificar e explicar a execução",
            objective: "Modificar um pequeno programa, registrar cada saída e explicar o que muda quando uma instrução é removida.",
            explanation: "Um roteiro de execução relaciona cada linha do código com o que ela produz. Ao remover uma chamada, " +
                "a saída daquela linha desaparece; as outras instruções permanecem na sequência original.",
            vocabulary: ["Roteiro de execução: registro linha a linha do que o programa faz.", "Efeito: mudança observável depois de editar ou remover uma linha.", "Evidência: saída que ajuda a justificar sua explicação."],
            example: 'console.log("abrir")\nconsole.log(1 + 2)\nconsole.log("fechar")',
            walkthrough: ["A primeira linha mostra abrir.", "A segunda calcula 1 + 2 e mostra 3.", "A última linha mostra fechar; remover a linha numérica não apaga as outras duas."],
            micro: {
                question: "Se a linha do cálculo for removida, o que ainda aparece?", choices: ["abrir e fechar", "Somente 3", "Nada"], answer: 0, feedback: "As chamadas restantes continuam sendo executadas na sua ordem."
            },
            review: {
                prompt: 'Em console.log("abrir"), console.log(1 + 2), console.log("fechar"), o que aparece se a segunda linha for removida?', choices: ["abrir e fechar, nessa ordem", "abrir, 3 e fechar", "Somente fechar"], answer: 0, correctFeedback: "Correto: remover uma linha elimina sua saída e preserva as outras.", incorrectFeedback: "Rastreie apenas as chamadas que ainda existem depois da remoção."
            },
            prompt: "Preveja as três saídas. Depois mude a soma para obter 8, execute e anote o que a remoção da linha numérica faria.",
            starter: 'console.log("abrir")\nconsole.log(1 + 2)\nconsole.log("fechar")', expected: [["abrir"], [8], ["fechar"]], sample: 'console.log("abrir")\nconsole.log(3 + 5)\nconsole.log("fechar")', baseline: [["abrir"], [3], ["fechar"]],
            expectedLabel: "abrir, 8 e fechar; sem a linha do cálculo, ainda aparecem abrir e fechar.", misconception: "Editar uma chamada muda sua saída; remover a chamada não altera as demais linhas.",
            hints: ["Siga cada chamada de cima para baixo e registre uma saída por linha.", "A alteração pedida está apenas na expressão numérica do meio.", "Uma soma semelhante, 6 + 2, resulta em 8; teste-a no editor."],
            reflectionPrompt: "Qual linha mudou, quais saídas permaneceram e o que sumiria ao remover o cálculo?",
            transfer: 'Troque a mensagem abrir por "preparar" e simule mentalmente a remoção da última chamada.',
            prediction: "Escreva as três saídas esperadas e indique qual delas sumiria se a linha 2 fosse removida.", baseline: [["abrir"], [3], ["fechar"]]
        },
        {
            id: "01.01", stage: "01", title: "Classifique os valores", duration: "8 min", focus: "Tipos e operador typeof",
            objective: "Prever e executar typeof em dez valores, distinguindo tipos conceituais e resultados observados.",
            explanation: "Valores diferentes têm tipos diferentes. O operador typeof pergunta ao JavaScript qual tipo está " +
                "associado a um valor e devolve essa resposta como texto. Algumas respostas históricas surpreendem: " +
                "typeof null resulta em \"object\", embora null represente a ausência intencional de um valor de " +
                "objeto.",
            vocabulary: ["Tipo: categoria de um valor, como string, number ou boolean.", "typeof: operador que devolve o nome do tipo como uma string.", "NaN: valor numérico especial; typeof NaN resulta em \"number\"."],
            example: 'console.log(typeof "trilha")\nconsole.log(typeof 42)\nconsole.log(typeof null)',
            walkthrough: ["O texto entre aspas tem tipo string.", "42 tem tipo number.", "typeof null devolve object por uma peculiaridade histórica da linguagem."],
            micro: {
                question: "Qual texto typeof 8 devolve?", choices: ['"number"', '"string"', '"undefined"'], answer: 0, feedback: "O valor é numérico; o resultado do typeof é o texto number."
            },
            review: {
                prompt: "Qual é o resultado de typeof null?", choices: ['"null"', '"object"', '"undefined"'], answer: 1, correctFeedback: "Isso: typeof null devolve object, um comportamento histórico que vale reconhecer.", incorrectFeedback: "A resposta observada é object. null e undefined continuam sendo valores diferentes."
            },
            prompt: "Confira as dez previsões e personalize pelo menos três literais sem mudar os tipos esperados. Execute para comparar previsões e resultados.",
            starter: "console.log(typeof \"JS\")\nconsole.log(typeof 42)\nconsole.log(typeof true)\nconsole.log(typeof " +
                "false)\nconsole.log(typeof null)\nconsole.log(typeof undefined)\nconsole.log(typeof " +
                "NaN)\nconsole.log(typeof 3.14)\nconsole.log(typeof `trilha`)\nconsole.log(typeof \"\")",
            expected: [
                ["string"], ["number"], ["boolean"], ["boolean"], ["object"], ["undefined"], ["number"], ["number"], ["string"], ["string"]
            ],
            sample: "console.log(typeof \"DevPath\")\nconsole.log(typeof 21)\nconsole.log(typeof true)\nconsole.log(typeof " +
                "false)\nconsole.log(typeof null)\nconsole.log(typeof undefined)\nconsole.log(typeof " +
                "NaN)\nconsole.log(typeof 9.5)\nconsole.log(typeof `aprendizado`)\nconsole.log(typeof \"\")", minimumEdits: 3,
            expectedLabel: "string, number, boolean, boolean, object, undefined, number, number, string e string.",
            misconception: "O tipo conceitual de null é ausência intencional; a resposta específica de typeof null é object.",
            hints: ["typeof devolve o nome do tipo como texto; faça uma previsão antes de executar.", "Compare cada valor na chamada typeof, especialmente null, undefined e NaN.", 'Exemplo parecido: console.log(typeof `exemplo`) mostra string.'],
            reflectionPrompt: "Compare sua previsão com a saída e explique a peculiaridade observada em typeof null.",
            transfer: "Troque um número inteiro por outro número e um texto por outro texto; observe o que muda e o que permanece no typeof.",
            prediction: "Anote os tipos esperados para null, undefined e NaN, nessa ordem.", baseline: null
        }
    ]);
})(globalThis);
