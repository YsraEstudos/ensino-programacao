const mdn = (title, url, section, question) => ({ title, url, section, question });

const docs = {
  types: [mdn('MDN: typeof', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof', 'Return value', 'Que string typeof devolve para cada valor?')],
  bindings: [mdn('MDN: const', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const', 'Description', 'O que fica impedido quando um binding const recebe uma nova atribuição?'), mdn('MDN: let', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let', 'Description', 'Quando let permite que o binding receba outro valor?')],
  templates: [mdn('MDN: template literals', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals', 'Syntax', 'Como crases e ${expressao} formam uma string?')],
};

export const stage01Preparation = {
  '01.01': {
    vocabulary: ['Aspas delimitam uma string; elas não são parte do valor exibido.', 'number é o rótulo de números; string é o rótulo de texto; boolean é true ou false.', 'null representa ausência intencional; undefined indica que nenhum valor foi fornecido; typeof devolve rótulos em texto.'],
    explanation: 'Leia o valor entre parênteses e preveja o rótulo textual que typeof devolve. O texto "42" é diferente do número 42; null é uma peculiaridade histórica que retorna object.',
    workedExample: { code: 'console.log(typeof "azul");\nconsole.log(typeof 7);\nconsole.log(typeof false);', output: ['string', 'number', 'boolean'], steps: ['As aspas fazem de azul uma string.', '7 sem aspas é um número.', 'false é um booleano e typeof imprime o rótulo boolean.'] },
    docs: [mdn('MDN: typeof', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof', 'Description', 'Que string typeof devolve para cada valor?')],
    predictionRows: [{label:'typeof 42'}, {label:'typeof "42"'}, {label:'typeof true'}, {label:'typeof undefined'}, {label:'typeof null'}],
    hints: ['Separe o valor do texto que typeof retorna.', 'Número sem aspas e texto entre aspas têm rótulos diferentes.', 'null é o caso histórico que retorna object.'],
    transfer: 'Preveja typeof 8, typeof "8" e typeof true em três linhas.', mode: 'predict', readonly: true,
  },
  '01.02': {
    vocabulary: ['Binding é o identificador associado a um valor.', 'const cria um binding que não recebe nova atribuição; let cria um binding que pode receber outro valor.', 'Inicializar é dar o primeiro valor; reatribuir é dar outro valor ao mesmo binding.'],
    explanation: 'Acompanhe cada instrução de cima para baixo. Antes de uma declaração, o binding ainda não foi inicializado; depois da atribuição, atualize somente o nome à esquerda.',
    workedExample: { code: 'const limite = 4;\nlet contador = limite;\ncontador = contador + 1;\nconsole.log(limite, contador);', output: ['4 5'], steps: ['limite recebe 4.', 'contador recebe o valor atual de limite, 4.', 'A reatribuição calcula 4 + 1 e muda somente contador.'] },
    docs: docs.bindings,
    predictionRows: [{label:'após const base = 2'}, {label:'após let total = base'}, {label:'após total = total + 3'}, {label:'saída'}],
    hints: ['Registre o estado depois de cada linha.', 'Leia o lado direito antes de atualizar o nome à esquerda.', 'Uma inicialização posterior não altera o valor já guardado em outro binding.'],
    transfer: 'Rastreie const taxa=2; let custo=taxa; custo=custo+4; e registre cada estado.', mode: 'trace', readonly: true,
  },
  '01.03': {
    vocabulary: ['Declaração cria e inicializa um binding.', 'Uma leitura precisa ocorrer depois da inicialização do nome lido.', 'Blocos independentes podem trocar de ordem sem mudar o resultado.'],
    explanation: 'O bloco de saída lê nome, idade e ativo. As três declarações precisam estar antes dele, mas não têm dependência entre si. O bloco de diagnóstico é um extra e fica fora.',
    workedExample: { code: 'const cidade = "Recife";\nconst aberto = true;\nconsole.log(cidade, aberto);', output: ['Recife true'], steps: ['cidade e aberto são inicializados.', 'Como não dependem um do outro, a ordem das duas declarações pode trocar.', 'O log vem depois dos dois nomes que consulta.'] },
    docs: docs.bindings,
    predictionRows: [{label:'ordem válida 1'}, {label:'ordem válida 2'}],
    hints: ['Liste os nomes que o consumidor lê.', 'Coloque cada declaração produtora antes do consumidor.', 'Troque entre si apenas declarações independentes.'],
    transfer: 'Dê duas ordens válidas para três declarações independentes seguidas por um resumo.', mode: 'parsons',
    parsons: { blocks: [{id:'A', code:'const nome = "Lia";'}, {id:'B', code:'const idade = 20;'}, {id:'C', code:'const ativo = true;'}, {id:'D', code:'console.log(nome, idade, ativo);'}, {id:'E', code:'console.log("diagnóstico");'}], initialOrder: ['E','C','D','B','A'] },
  },
  '01.04': {
    vocabulary: ['const impede reatribuição do binding.', 'let permite reatribuição do binding.', 'A escolha const/let depende da mudança prevista, não do valor inicial.'],
    explanation: 'Use const nos nomes que permanecem com o mesmo binding e let nos nomes que recebem uma nova atribuição. Zero e false continuam sendo valores explícitos e válidos.',
    workedExample: { code: 'const sala = "azul";\nlet lugares = 0;\nlugares = 2;\nconsole.log(sala, lugares);', output: ['azul 2'], steps: ['sala não muda e usa const.', 'lugares começa em zero, mas muda depois e usa let.', 'A saída lê os valores atuais.'] },
    docs: docs.bindings,
    predictionRows: [{label:'nome'}, {label:'pontos'}, {label:'ativo'}, {label:'volume'}, {label:'idioma'}, {label:'tentativas'}],
    hints: ['A escolha depende de uma nova atribuição ao mesmo nome, não do tipo ou valor inicial.', 'Procure cada nome à esquerda de = depois da declaração e separe os nomes reatribuídos dos que são apenas lidos.', 'Em outra situação, a temperatura de uma estação recebe uma nova leitura, mas o nome da estação permanece igual. Qual declaração permite a mudança e qual comunica que ela não está prevista?'], transfer: 'Escolha const/let para uma agenda com três preferências fixas e uma duração reatribuída.', mode: 'faded',
    blanks: [{name:'nome', choices:['const','let']}, {name:'pontos', choices:['const','let']}, {name:'ativo', choices:['const','let']}, {name:'volume', choices:['const','let']}, {name:'idioma', choices:['const','let']}, {name:'tentativas', choices:['const','let']}],
  },
  '01.05': {
    vocabulary: ['NaN é um valor do tipo number.', 'Infinity é um valor do tipo number.', 'A notação 1n cria um valor do tipo bigint; null mantém a peculiaridade object de typeof.'],
    explanation: 'Classifique o valor que typeof recebe sem estudar ainda as operações que produzem esses valores. A grafia NaN não é o nome de um tipo separado.',
    workedExample: { code: 'console.log(typeof -0);\nconsole.log(typeof 5n);\nconsole.log(typeof Infinity);', output: ['number', 'bigint', 'number'], steps: ['-0 ainda é number.', 'O sufixo n identifica bigint.', 'Infinity pertence a number.'] },
    docs: docs.types,
    predictionRows: [{label:'typeof NaN'}, {label:'typeof Infinity'}, {label:'typeof 1n'}, {label:'typeof null'}],
    hints: ['Preveja apenas os rótulos.', 'NaN não cria uma categoria nova.', 'A notação n é a pista para bigint.'], transfer: 'Classifique typeof -3, typeof NaN e typeof 5n.', mode: 'predict', readonly: true,
  },
  '01.06': {
    vocabulary: ['Template literal é uma string delimitada por crases.', 'Uma expressão entre ${...} é avaliada e inserida no texto.', 'Os identificadores dentro da expressão precisam estar inicializados antes da leitura.'],
    explanation: 'Use uma única expressão de template literal para montar o texto com os bindings atuais. Crases delimitam a string; aspas comuns deixariam ${nome} como texto literal.',
    workedExample: { code: 'const codigo = "R7";\nconst estado = "pronto";\nconsole.log(`${codigo} — ${estado}`);', output: ['R7 — pronto'], steps: ['codigo e estado recebem seus valores.', 'Cada ${...} lê um binding.', 'A expressão resulta em uma string única.'] },
    docs: docs.templates,
    predictionRows: [{label:'saída de perfil'}], hints: ['Preveja a linha antes de editar.', 'Use crases ao redor do texto.', 'Interpole nome e nivel, sem copiar seus valores.'], transfer: 'Monte uma expressão que produza M4 — pronto a partir de dois bindings.', mode: 'faded', contract: 'Nara: nível 3', requiredKinds: ['expression'],
  },
  '01.07': {
    vocabulary: ['Uma declaração pode guardar uma string derivada.', 'console.log mostra o valor atual passado como argumento.', 'Uma template literal pode combinar dois bindings na ordem escrita.'],
    explanation: 'Crie o resumo e imprima-o. O programa deve usar os bindings de duração para produzir uma única linha; zero continua aparecendo como parte do texto.',
    workedExample: { code: 'const dias = 2;\nconst horas = 3;\nconst resumo = `${dias}d${horas}h`;\nconsole.log(resumo);', output: ['2d3h'], steps: ['dias e horas são dados.', 'resumo é derivado dos dois bindings.', 'console.log imprime a string guardada.'] },
    docs: docs.templates, predictionRows: [{label:'saída de duração'}], hints: ['Uma string derivada combina os valores atuais; copiar o resultado como texto fixo perde essa relação.', 'Separe duas decisões: qual expressão produz o texto e qual instrução mostra o valor guardado.', 'Com caixas=3 e unidades=0, um rótulo pode mostrar 3 caixas | 0 unidades. Como ler os dois nomes na expressão e depois mostrar esse texto?'], transfer: 'Crie e imprima um resumo de dias e horas usando dois bindings.', mode: 'make',
  },
  '01.08': {
    vocabulary: ['Configuração é um conjunto de bindings que descreve um estado.', 'Um binding que muda usa let nesta trilha; os demais usam const.', 'Cada resumo deve ler os valores atuais dos bindings.'],
    explanation: 'Escolha const ou let pela reatribuição indicada e produza dois resumos. volume muda de 0 para 7; jogo, dificuldade, legendas e idioma permanecem iguais. Preserve 0 e false como escolhas publicadas.',
    workedExample: { code: 'const nome = "Agenda";\nlet duracao = 15;\nconst avisos = false;\nconsole.log(`${nome} | duração ${duracao} | avisos ${avisos}`);\nduracao = 30;\nconsole.log(`${nome} | duração ${duracao} | avisos ${avisos}`);', output: ['Agenda | duração 15 | avisos false', 'Agenda | duração 30 | avisos false'], steps: ['Somente duracao recebe nova atribuição.', 'O primeiro resumo lê quinze.', 'Depois da atribuição, o segundo resumo lê trinta e mantém false.'] },
    docs: [...docs.bindings, ...docs.templates], predictionRows: [{label:'primeiro resumo'}, {label:'segundo resumo'}], hints: ['Uma configuração reúne escolhas estáveis e valores que podem receber outra atribuição.', 'Compare as instruções antes e depois do primeiro resumo: qual nome recebe outro valor? A declaração precisa permitir essa mudança.', 'Em uma agenda, o título permanece e a duração passa de 0 para 30. A opção de avisos continua false. Escolha as declarações pela mudança prevista e calcule um texto em cada momento.'], transfer: 'Modele uma agenda, altere apenas a duração e gere dois resumos preservando 0 e false.', mode: 'transfer',
    blanks: [{name:'jogo', choices:['const','let']}, {name:'volume', choices:['const','let']}, {name:'dificuldade', choices:['const','let']}, {name:'legendas', choices:['const','let']}, {name:'idioma', choices:['const','let']}], contract: ['Arena | volume 0 | normal | legendas false | pt-BR', 'Arena | volume 7 | normal | legendas false | pt-BR'],
  },
  '01.09': {
    vocabulary: ['Estado é o conjunto de valores atuais em um momento.', 'Reatribuição muda o binding escolhido para as próximas leituras.', 'Uma string derivada é recalculada quando a expressão é executada.'],
    explanation: 'Construa uma ficha com os bindings atuais e execute três vezes: vida começa em 10, passa a 6 e passa a 0. O snapshot textual de cada chamada reflete o momento em que foi calculado; não há funções nesta etapa.',
    workedExample: { code: 'const modelo = "Lume";\nlet energia = 8;\nconsole.log(`${modelo} | energia ${energia}`);\nenergia = 3;\nconsole.log(`${modelo} | energia ${energia}`);', output: ['Lume | energia 8', 'Lume | energia 3'], steps: ['modelo permanece fixo.', 'A primeira expressão lê energia 8.', 'Depois da reatribuição, a próxima expressão lê energia 3.'] },
    docs: docs.bindings.concat(docs.templates), predictionRows: [{label:'ficha inicial'}, {label:'ficha após vida = 6'}, {label:'ficha após vida = 0'}], hints: ['Use nome, nivel, vida e status na ficha.', 'Reatribua somente vida entre os checkpoints.', 'Inclua o zero na última linha.'], transfer: 'Faça uma ficha de veículo com energia 8, 3 e 0, imprimindo cada estado.', mode: 'project', contract: ['Iris | nível 1 | vida 10 | ativa', 'Iris | nível 1 | vida 6 | ativa', 'Iris | nível 1 | vida 0 | ativa'], masteryTransfers: [{id:'config', title:'Configuração de agenda', prompt:'Modele uma agenda com nome, duração e avisos. Comece com duração 0, atualize-a para 30 e imprima os dois estados.', starter:'const nome = "Agenda";\nlet duracao = 0;\nconst avisos = false;', expected:['Agenda | duração 0 | avisos false','Agenda | duração 30 | avisos false'], solution:'const resumo = `${nome} | duração ${duracao} | avisos ${avisos}`;\nconsole.log(resumo);\nduracao = 30;\nconst resumoAtualizado = `${nome} | duração ${duracao} | avisos ${avisos}`;\nconsole.log(resumoAtualizado);', cases:[{label:'default',fixtures:{nome:'Agenda',duracao:0,avisos:false},expected:['Agenda | duração 0 | avisos false','Agenda | duração 30 | avisos false']},{label:'alternate',fixtures:{nome:'Calendário',duracao:0,avisos:false},expected:['Calendário | duração 0 | avisos false','Calendário | duração 30 | avisos false']}], requiredKinds:{nome:'const',duracao:'let',avisos:'const'}}, {id:'duration', title:'Duração por dias e horas', prompt:'Comece com 2 dias e 4 horas, atualize apenas horas para 6 horas e imprima os dois estados.', starter:'const dias = 2;\nlet horas = 4;', expected:['2 dias | 4 horas','2 dias | 6 horas'], solution:'const resumo = `${dias} dias | ${horas} horas`;\nconsole.log(resumo);\nhoras = 6;\nconst resumoAtualizado = `${dias} dias | ${horas} horas`;\nconsole.log(resumoAtualizado);', cases:[{label:'default',fixtures:{dias:2,horas:4},expected:['2 dias | 4 horas','2 dias | 6 horas']},{label:'alternate',fixtures:{dias:0,horas:4},expected:['0 dias | 4 horas','0 dias | 6 horas']}], requiredKinds:{dias:'const',horas:'let'}}] },
};

stage01Preparation['01.09'].masteryTransfers[0].solution = 'const nome = "Agenda";\nlet duracao = 0;\nconst avisos = false;\nconst resumo = `${nome} | duração ${duracao} | avisos ${avisos}`;\nconsole.log(resumo);\nduracao = 30;\nconst resumoAtualizado = `${nome} | duração ${duracao} | avisos ${avisos}`;\nconsole.log(resumoAtualizado);';
stage01Preparation['01.09'].masteryTransfers[1].solution = 'const dias = 2;\nlet horas = 4;\nconst resumo = `${dias} dias | ${horas} horas`;\nconsole.log(resumo);\nhoras = 6;\nconst resumoAtualizado = `${dias} dias | ${horas} horas`;\nconsole.log(resumoAtualizado);';

// Teaching scaffolds belong to this stage; examples use different data from the challenges.
stage01Preparation['01.01'].workedExample = {
  code: 'console.log(typeof "azul");\nconsole.log(typeof 7);\nconsole.log(typeof false);\nconsole.log(typeof undefined);\nconsole.log(typeof null);',
  output: ['string', 'number', 'boolean', 'undefined', 'object'],
  steps: ['Aspas fazem de "azul" um texto; 7 sem aspas é um número.', 'false e true são os dois valores booleanos.', 'undefined é um valor que indica ausência de valor fornecido.', 'null representa ausência intencional. typeof null devolve "object" por uma peculiaridade histórica; null continua sendo um primitivo.']
};
stage01Preparation['01.01'].notes = ['Um literal escreve o valor diretamente no código. console.log mostra o resultado de typeof, não o valor que ele examinou. O rótulo retornado também é uma string.', 'Não confunda o valor undefined com um nome não declarado: console.log(pessoa) antes de declarar pessoa causa erro. Nesta atividade, você examina valores literais. Objetos e Symbol serão estudados depois.', 'Para estudar fora do site, copie o código necessário para main.js, salve e execute `node main.js` no terminal dessa pasta, se Node.js estiver instalado. Você também pode usar o Console do navegador. Faça a previsão em uma anotação sua; a avaliação interna não é necessária para conferir a saída. Ao usar IA, envie o enunciado, o código, sua previsão e o resultado observado.'];
stage01Preparation['01.02'].explanation = 'Uma variável é um nome associado a um valor; binding é o termo para essa associação. Em const limite = 4, const declara, limite é o nome, = atribui e 4 é o valor inicial. Leia o programa de cima para baixo: primeiro calcule o lado direito e só depois atualize o nome à esquerda. O sinal = faz uma atribuição, não uma comparação.';
stage01Preparation['01.02'].notes = ['Em contador = contador + 1, usamos apenas a soma de dois números: 4 + 1 produz 5. As demais operações e conversões serão estudadas na Etapa 02.', 'Nomes diferenciam maiúsculas de minúsculas: total e Total são diferentes. Use nomes descritivos como totalPontos, sem espaços ou hífen, e não comece com um número. Nesta prática, use letras sem acentos; const e let são palavras reservadas.', 'console.log(limite, contador) lê os dois valores atuais e os exibe na mesma linha, separados por um espaço.', 'Prática local: preveja cada estado de `let original = 4; let copia = original; original = 9; console.log(original, copia);`. Ao mudar original, copia também muda? Execute somente depois da previsão.', 'Conferência após a tentativa: a saída é 9 4. copia recebeu o valor numérico 4 durante a inicialização; não ficou ligada às mudanças posteriores de original. Acompanhe 4 / não inicializado, 4 / 4 e 9 / 4. Esta explicação trata de valores primitivos; objetos serão estudados depois.'];
stage01Preparation['01.02'].workedExample.trace = {
  columns: ['Instrução', 'limite', 'contador'],
  rows: [['const limite = 4;', '4', 'ainda não inicializado'], ['let contador = limite;', '4', '4'], ['contador = contador + 1;', '4', '5'], ['console.log(limite, contador);', '4', '5']]
};
stage01Preparation['01.02'].predictionGuide = 'Em cada campo, escreva base: valor; total: valor. Se um nome ainda não foi inicializado, escreva isso. No último campo, registre a linha impressa.';
stage01Preparation['01.03'].notes = ['No exemplo, cidade → aberto → saída e aberto → cidade → saída são duas ordens válidas. Saída → cidade → aberto é inválida: tenta ler nomes ainda não inicializados.', 'Um log extra muda a saída, mesmo quando seu código executa sem erro. Por isso, remova o diagnóstico que não faz parte do resultado pedido. Use os botões de subir e descer; para outra tentativa, restaure os blocos.'];
stage01Preparation['01.03'].predictionGuide = 'Registre duas sequências de letras separadas por espaços. Organize os blocos na primeira sequência e escreva a segunda no campo “Segunda ordem válida”.';
stage01Preparation['01.04'].predictionGuide = 'Para cada nome, preveja const ou let. Depois use os seis seletores para completar o arquivo. A impressão final já está pronta; você só precisa escolher as declarações.';
stage01Preparation['01.04'].notes = ['Usar let num nome fixo pode funcionar em JavaScript, mas esta atividade pede a convenção const quando não há reatribuição. A escolha comunica sua intenção.', 'Tentar reatribuir um const provoca erro. Para mudar lugares de 0 para 2, declare let lugares = 0; depois escreva lugares = 2;, sem declarar o nome outra vez.', 'Comparação local: execute cada trecho em arquivo separado. A: `let setor = "azul"; console.log(setor);`. B: `const setor = "azul"; console.log(setor);`. C: `const lugares = 0; lugares = 2; console.log(lugares);`. Quais executam? Em qual a escolha comunica melhor que não haverá reatribuição?', 'Conferência depois de responder: A e B mostram azul; B segue a convenção para um nome sem reatribuição. C causa TypeError na reatribuição e não chega ao log. Usar let em A não é erro da linguagem; a convenção do exercício e uma proibição da linguagem são critérios diferentes.'];
stage01Preparation['01.05'].workedExample = {code: 'console.log(typeof NaN);\nconsole.log(typeof Infinity);\nconsole.log(typeof 5n);\nconsole.log(typeof null);', output: ['number','number','bigint','object'], steps: ['NaN representa um resultado numérico inválido, mas seu tipo ainda é number.', 'Infinity representa infinito no tipo number.', '5n é um inteiro bigint; aqui basta reconhecer o sufixo n.', 'null retoma a peculiaridade de typeof estudada em 01.01.']};
stage01Preparation['01.05'].notes = ['typeof informa o tipo, mas não garante que um número seja finito ou adequado ao problema: NaN e Infinity também devolvem number. Na Etapa 02, você estudará operações que produzem esses valores. Não é necessário calculá-los aqui.'];
stage01Preparation['01.06'].notes = ['Expressão é um trecho que produz um valor: nome, 3 e uma template literal são exemplos. Substitua o comentário /* uma expressão */ dentro de console.log; mantenha as declarações iniciais.', 'Comentários explicam o código e não são executados: // vale até o fim da linha; /* ... */ delimita um comentário. Dentro das crases, o texto fora de ${...} permanece como você o escreveu, incluindo espaços e pontuação.'];
stage01Preparation['01.07'].notes = ['O formato pedido é horas + a letra h + minutos, sem acrescentar zeros: 2h15 e 0h0. Isso é uma representação textual, não um cálculo de duração.', 'Uma string derivada guarda o resultado calculado naquele momento. Ela não mantém uma ligação automática com as variáveis usadas para criá-la.'];
stage01Preparation['01.08'].notes = ['Substitua os comentários por instruções reais: imprima um resumo, execute volume = 7; e imprima o resumo seguinte. Escrever volume=7 dentro de // não altera nenhum valor.', 'Não declare volume de novo: ele já existe. Reavalie a template literal depois da atribuição para ler o volume atual.'];
stage01Preparation['01.09'].workedExample = {code: 'const modelo = "Lume";\nlet energia = 8;\nconst resumo = `${modelo} | energia ${energia}`;\nconsole.log(resumo);\nenergia = 3;\nconsole.log(resumo);\nconsole.log(`${modelo} | energia ${energia}`);\nenergia = 0;\nconsole.log(`${modelo} | energia ${energia}`);', output: ['Lume | energia 8', 'Lume | energia 8', 'Lume | energia 3', 'Lume | energia 0'], steps: ['resumo guarda a string calculada quando energia era 8.', 'Mudar energia para 3 não muda a string já guardada: o segundo log ainda mostra 8.', 'A próxima template literal é calculada novamente e lê 3.', 'Depois da reatribuição para 0, uma nova avaliação mostra zero. No projeto, produza somente as três fichas atuais pedidas.']};
stage01Preparation['01.09'].notes = ['Checkpoint é um momento de observação: imprima a ficha inicial, reatribua vida, imprima outra ficha, reatribua vida novamente e imprima a última. Você pode repetir console.log; não precisa criar funções.', 'Desafio local sem consultar a demonstração: preveja as três linhas de `const item = "Lápis"; let quantidade = 2; const etiqueta = `${item}: ${quantidade}`; console.log(etiqueta); quantidade = 0; console.log(etiqueta); console.log(`${item}: ${quantidade}`);`. Explique qual texto é reaproveitado e qual é calculado novamente. Depois execute.', 'Conferência após a previsão: Lápis: 2 / Lápis: 2 / Lápis: 0, uma mensagem por linha. A segunda chamada usa a string já calculada; somente a última avalia outra template literal com quantidade zero.', 'Revisão em outro dia, por exemplo amanhã: sem consultar a solução, modele uma configuração com nome Oficina, volume inicial 0 e avisos false. Imprima `Oficina | volume 0 | avisos false`, altere somente volume para 4 e imprima `Oficina | volume 4 | avisos false`. Escolha const/let, derive o texto dos nomes e justifique a escolha. Se precisar de IA, registre sua tentativa primeiro e peça uma pista; depois confira executando localmente.', 'Preparação para a Etapa 02: antes de calcular ou comparar, identifique se o dado é número, texto ou booleano. "3" e 3 têm tipos diferentes. Zero e false são valores presentes; não são sinônimos de null ou undefined. As conversões e comparações serão ensinadas na próxima etapa.'];

stage01Preparation['01.02'].vocabulary = ['Um nome no código pode ficar associado a um valor; essa associação é chamada binding.', 'const cria um nome que não recebe outra atribuição; let cria um nome que pode receber outro valor.', 'Inicializar é dar o primeiro valor ao nome; reatribuir é dar outro valor ao mesmo nome.'];
stage01Preparation['01.03'].vocabulary = ['Uma declaração cria um nome associado a um valor.', 'Uma leitura precisa ocorrer depois de o nome lido receber seu primeiro valor.', 'Nomes independentes podem ser declarados em ordens diferentes sem mudar o resultado.'];
stage01Preparation['01.04'].vocabulary = ['const impede reatribuir o nome associado ao valor.', 'let permite reatribuir o nome quando ele precisa apontar para outro valor.', 'A escolha const/let depende da mudança prevista, não do valor inicial.'];

const stage01Scaffolds = {
  '01.01': {
    introduction: 'Nesta atividade, você vai descobrir como JavaScript classifica valores e como o operador typeof devolve esse rótulo em texto.',
    conceptSteps: ['Um valor é o dado que aparece no código, como 42, "42" ou true.', 'Aspas transformam o conteúdo em texto; sem aspas, 42 continua sendo um número.', 'typeof recebe um valor e devolve uma string com seu rótulo, como "number" ou "string".', 'undefined, null e os rótulos que eles produzem têm regras próprias; observe-as antes de prever.'],
    practiceSteps: ['Leia cada valor sem executar e escreva o rótulo que typeof deve devolver.', 'Compare sua previsão com as cinco linhas executadas e marque onde valor e rótulo são diferentes.', 'Explique com suas palavras por que typeof null devolve "object" nesta linguagem.']
  },
  '01.02': {
    introduction: 'Nesta atividade, você vai acompanhar como um nome mantém seu valor ou recebe outro valor linha por linha.',
    conceptSteps: ['Um nome associado a um valor é um binding; a declaração cria essa associação.', 'Na atribuição, leia primeiro o lado direito e só depois atualize o nome à esquerda.', 'const mantém a associação sem nova atribuição; let permite que o nome receba outro valor.', 'Uma soma como contador + 1 produz um novo valor; ela não muda o outro nome usado no cálculo.'],
    practiceSteps: ['Preencha o estado de base e total depois de cada instrução, incluindo quando total ainda não foi inicializado.', 'Execute o código e compare cada linha da tabela com sua previsão.', 'Explique por que a última atribuição muda total, mas deixa base com o mesmo valor.']
  },
  '01.03': {
    introduction: 'Nesta atividade, você vai organizar instruções pela dependência real entre os nomes que elas produzem e leem.',
    conceptSteps: ['Uma declaração produz um nome com seu primeiro valor.', 'Um console.log é consumidor: ele precisa vir depois dos nomes que lê.', 'Declarações que não usam umas às outras podem trocar de lugar.', 'Uma linha extra pode executar, mas ainda assim não pertencer à saída pedida.'],
    practiceSteps: ['Liste os nomes que o resumo lê e coloque suas declarações antes dele.', 'Monte uma primeira ordem válida e depois escreva outra trocando apenas produtores independentes.', 'Retire o diagnóstico extra e explique por que ele não faz parte do resultado.']
  },
  '01.04': {
    introduction: 'Nesta atividade, você vai escolher const ou let olhando para o que cada nome precisará fazer depois.',
    conceptSteps: ['const e let declaram nomes associados a valores.', 'Use const quando o nome não receberá outra atribuição.', 'Use let quando o nome for reatribuído mais adiante.', 'Zero, false e texto são valores válidos; o valor inicial sozinho não decide a escolha.'],
    practiceSteps: ['Procure as linhas que reatribuem um nome e marque esses nomes primeiro.', 'Escolha let para os nomes que mudam e const para os demais.', 'Confira se zero e false continuam na saída e explique uma das suas escolhas.']
  },
  '01.05': {
    introduction: 'Nesta atividade, você vai classificar valores especiais sem tentar calcular como eles foram produzidos.',
    conceptSteps: ['typeof classifica o valor recebido; o nome escrito não cria uma categoria nova.', 'NaN e Infinity continuam pertencendo ao tipo number.', 'O sufixo n mostra que 1n e 5n são bigint.', 'null continua sendo a peculiaridade histórica que typeof apresenta como "object".'],
    practiceSteps: ['Leia os quatro valores e preencha somente os rótulos de typeof.', 'Compare NaN, Infinity, bigint e null com os casos comuns da atividade anterior.', 'Explique por que um valor especial não precisa ser um tipo novo.']
  },
  '01.06': {
    introduction: 'Nesta atividade, você vai montar uma string a partir de valores guardados em nomes.',
    conceptSteps: ['Uma template literal é uma string delimitada por crases.', 'O texto fora de ${...} permanece como foi escrito.', 'Cada expressão dentro de ${...} é avaliada e inserida no texto.', 'Os nomes usados dentro da expressão precisam ter recebido valor antes da leitura.'],
    practiceSteps: ['Preveja a linha final usando os valores atuais de nome e nivel.', 'Substitua o comentário por uma única expressão entre crases.', 'Execute com os dados alternativos e confirme que o texto acompanha os bindings, sem valores colados.']
  },
  '01.07': {
    introduction: 'Nesta atividade, você vai criar uma string derivada e imprimi-la como uma linha de resumo.',
    conceptSteps: ['Uma expressão pode produzir uma string a partir de outros valores.', 'O exemplo usa dias e horas para mostrar o formato; o desafio usa horas e minutos com a mesma ideia.', 'Guardar o resultado em resumo permite passá-lo depois para console.log.', 'O zero também é um valor que deve aparecer no texto.'],
    practiceSteps: ['Preveja o formato de horas e minutos com os valores fornecidos.', 'Declare resumo usando horas e minutos dentro de crases.', 'Imprima resumo e confira um caso em que um dos campos vale zero.']
  },
  '01.08': {
    introduction: 'Nesta atividade, você vai modelar uma configuração que mantém algumas escolhas e altera apenas um valor.',
    conceptSteps: ['Uma configuração é um conjunto de nomes associados aos valores de um estado.', 'Um nome que permanece com o mesmo valor pode usar const pela convenção desta atividade.', 'Um nome que recebe outra atribuição precisa de uma declaração que permita a mudança.', 'Cada resumo deve ser montado de novo para ler os valores atuais.'],
    practiceSteps: ['Marque o nome que muda antes de preencher as cinco declarações.', 'Produza o primeiro resumo, reatribua apenas volume e produza o segundo.', 'Compare os dois estados e explique por que zero e false continuam publicados.']
  },
  '01.09': {
    introduction: 'Nesta atividade, você vai registrar uma ficha em três momentos para observar como uma reatribuição muda as próximas leituras.',
    conceptSteps: ['Um estado é o conjunto de valores atuais em um momento.', 'A ficha inicial usa vida 10; depois, o mesmo nome recebe 6 e depois 0.', 'Uma template literal é calculada quando a linha é executada e lê os valores daquele momento.', 'Uma string guardada antes da mudança continua com o texto antigo; uma nova template literal pode mostrar o valor atual.'],
    practiceSteps: ['Preveja as três fichas antes de editar, incluindo vida 0.', 'Imprima a ficha inicial, reatribua somente vida para 6 e imprima a ficha desse estado.', 'Reatribua vida para 0, imprima a última ficha e explique por que vida usa let e o zero não deve desaparecer.']
  }
};

for (const [id, scaffold] of Object.entries(stage01Scaffolds)) {
  Object.assign(stage01Preparation[id], scaffold);
}

for (const [id, config] of Object.entries(stage01Preparation)) {
  config.predictionGuide ||= 'Preveja a saída do código do desafio, não a do exemplo resolvido. Cada campo corresponde a uma chamada console.log. Uma previsão diferente do resultado é uma oportunidade de revisar seu raciocínio; ela não precisa estar correta para você concluir.';
  config.reflectionPrompt = id === '01.09' ? 'Explique por que vida usa let, por que zero aparece na última ficha e por que uma string guardada antes da mudança pode mostrar um valor antigo. Relacione também uma das transferências ao projeto.' : `Compare sua previsão com a execução. Explique a regra praticada e um erro que ela ajuda a evitar. Use um nome ou valor deste desafio como exemplo.`;
}

stage01Preparation['01.01'].hints[2] = 'null é o caso histórico que desafia a intuição sobre o rótulo, mas ainda é um valor primitivo.';
stage01Preparation['01.01'].transfer = 'Classifique typeof 8, typeof "8" e typeof true -> number, string e boolean.';
stage01Preparation['01.02'].transfer = 'Rastreie const taxa=2; let custo=taxa; custo=custo+4 -> taxa permanece 2 e custo termina em 6.';
stage01Preparation['01.03'].transfer = 'Dê duas ordens para três declarações independentes e um resumo -> A,B,C,D e C,A,B,D imprimem Lia 20 true.';
stage01Preparation['01.04'].transfer = 'Escolha const/let para uma agenda com duração 0 e 30 -> Agenda | duração 0 | avisos false; Agenda | duração 30 | avisos false.';
stage01Preparation['01.05'].transfer = 'Classifique typeof -3, typeof NaN e typeof 5n -> number, number e bigint.';
stage01Preparation['01.06'].transfer = 'Monte uma expressão com codigo=M4 e estado=pronto -> M4 — pronto.';
stage01Preparation['01.07'].transfer = 'Crie um resumo para dias=2,horas=4 e depois horas=6 -> 2 dias | 4 horas; 2 dias | 6 horas.';
stage01Preparation['01.08'].transfer = 'Modele nome=Agenda,duração=0,avisos=false; depois duração=30 -> Agenda | duração 0 | avisos false; Agenda | duração 30 | avisos false.';
stage01Preparation['01.09'].transfer = 'Modele modelo=Lume,energia=8; depois energia=3 e energia=0 -> Lume | energia 8; Lume | energia 3; Lume | energia 0.';
