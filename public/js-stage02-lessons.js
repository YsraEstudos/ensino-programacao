(function (global) {
    'use strict';
    const sample = (label, fixtures, expected) => ({
        label, fixtures, expected
    });
    const block = (title, starter, cases, options = {}) => ({
        title, starter, cases, ...options
    });
    const lessons = {
        '02.01': [
            block('A · Aritmética e precedência', '// Escreva um console.log para cada expressão:\n// 2 + 3 * 4\n// (2 + 3) * 4\n// 9 - 4\n// 6 % 4\n// 8 / 2\n// 2 ** 3', [sample('Seis expressões, na ordem', {}, [
                    14, 20, 5, 2, 4, 8
                ])], { rows: [
                    '2 + 3 * 4', '(2 + 3) * 4', '9 - 4', '6 % 4', '8 / 2', '2 ** 3'
                ], example: 'Em 5 + 2 * 3, primeiro calcule 2 * 3; a soma resulta em 11. Com parênteses, (5 + 2) * 3 resulta em 21.' }),
            block('B · Comparação, lógica e texto', '// Escreva console.log para as expressões, na ordem:\n// 0 === false\n// 5 > 3\n// 5 >= 5\n// !0\n// true && false\n// false || "x"\n// "2" + 3', [sample('Sete expressões, na ordem', {}, [
                    false, true, true, true, false, 'x', '23'
                ])], { rows: [
                    '0 === false', '5 > 3', '5 >= 5', '!0', 'true && false', 'false || "x"', '"2" + 3'
                ], example: '7 >= 4 devolve true. true && "ok" devolve "ok", uma string. + concatena se houver string: "4" + 1 resulta em "41".' }),
            block('C · Igualdade e diferença estritas', '// Exiba as comparações, na ordem:\n// 0 === "0"\n// 0 == "0"\n// 0 !== "0"\n// 3 !== 3', [sample('Igualdade, coerção e diferença', {}, [
                    false, true, true, false
                ])], { rows: [
                    '0 === "0"', '0 == "0"', '0 !== "0"', '3 !== 3'
                ], example: '1 === "1" é false porque os tipos diferem. 1 == "1" é true após coerção. !== é o oposto de === e também não converte tipos.' }),
        ],
        '02.02': [
            block('Matriz · Falsy e nullish', 'const x = false;\n// Exiba x || "padrão" e x ?? "padrão", nesta ordem.', [
                false, 0, '', null, undefined, NaN
            ].map(x => sample(`x = ${global.DevPathStage02Runner.format(x)}`, { x }, [x || 'padrão', x ?? 'padrão'])), { rows: [
                    'false || "padrão"', 'false ?? "padrão"', '0 || "padrão"', '0 ?? "padrão"', '"" || "padrão"', '"" ?? "padrão"', 'null || "padrão"', 'null ?? "padrão"', 'undefined || "padrão"', 'undefined ?? "padrão"', 'NaN || "padrão"', 'NaN ?? "padrão"'
                ], example: "0 || 50 resulta em 50, mas 0 ?? 50 preserva 0. Os seis falsy desta tabela não são a lista completa " +
                    "de JavaScript; nullish inclui apenas null e undefined." }),
        ],
        '02.03': [
            block('Parsons · Exigir as duas condições', 'const saldo = 10;\nconst valor = 8;\nconst ativa = true;\n// Monte os blocos abaixo e escreva o código aqui.', [
                sample('Saldo e conta suficientes', {
                    saldo: 10, valor: 8, ativa: true
                }, [true]), sample('Saldo exatamente igual', {
                    saldo: 8, valor: 8, ativa: true
                }, [true]), sample('Saldo insuficiente', {
                    saldo: 8, valor: 10, ativa: true
                }, [false]), sample('Conta inativa', {
                    saldo: 10, valor: 8, ativa: false
                }, [false]), sample('Dois requisitos ausentes', {
                    saldo: 2, valor: 8, ativa: false
                }, [false]),
            ], { parsons: true, example: 'Primeiro descubra se há saldo e se a conta está ativa. Com &&, a autorização só é true se os dois requisitos forem true; || aceita apenas um.' }),
        ],
        '02.04': [block('Converter e detectar finitude', 'const texto = "12";\nconst vazio = false;\nconst numero = /* complete */;\nconst invalido = /* complete */;\nconsole.log(invalido);', [
                sample('Texto numérico', { texto: '12', vazio: false }, [false]), sample('Zero válido', { texto: '0', vazio: false }, [false]), sample('Vazio', { texto: '', vazio: true }, [true]), sample('Só espaços', { texto: '   ', vazio: true }, [true]), sample('Texto inválido', { texto: 'abc', vazio: false }, [true]), sample('NaN textual', { texto: 'NaN', vazio: false }, [true]), sample('Infinito', { texto: 'Infinity', vazio: false }, [true]), sample('Infinito negativo', { texto: '-Infinity', vazio: false }, [true]), sample('Fora da faixa finita', { texto: '1e309', vazio: false }, [true]),
            ], { example: "Number(\"42.5\") produz 42.5; Number(\"abc\") produz NaN. Number.isFinite rejeita NaN e ambos os " +
                    "infinitos. Number(\"\") é 0, por isso a flag de vazio continua necessária." })],
        '02.05': [block('Conversão explícita e validade', "const quantidade = \"3\";\nconst preco = \"10\";\nconst quantidadeVazia = false;\nconst precoVazio = " +
                "false;\nconst total = quantidade * preco;\nconst etiqueta = total + \" reais\";\n// Declare " +
                "quantidadeNumero, precoNumero e entradaValida.\n// Refatore total/etiqueta e exiba entradaValida, " +
                "total, etiqueta.", [
                sample('Compra válida', {
                    quantidade: '3', preco: '10', quantidadeVazia: false, precoVazio: false
                }, [true, 30, '30 reais']), sample('Quantidade zero', {
                    quantidade: '0', preco: '10', quantidadeVazia: false, precoVazio: false
                }, [true, 0, '0 reais']), sample('Quantidade vazia', {
                    quantidade: '', preco: '10', quantidadeVazia: true, precoVazio: false
                }, [false, 0, '0 reais']), sample('Quantidade só espaços', {
                    quantidade: '   ', preco: '10', quantidadeVazia: true, precoVazio: false
                }, [false, 0, '0 reais']), sample('Preço inválido', {
                    quantidade: '3', preco: 'x', quantidadeVazia: false, precoVazio: false
                }, [false, NaN, 'NaN reais']), sample('Preço infinito', {
                    quantidade: '3', preco: 'Infinity', quantidadeVazia: false, precoVazio: false
                }, [false, Infinity, 'Infinity reais']), sample('Preço NaN', {
                    quantidade: '3', preco: 'NaN', quantidadeVazia: false, precoVazio: false
                }, [false, NaN, 'NaN reais']),
            ], { explicitConversion: true, example: "Converta \"4\" e \"2.5\" com Number; detecte validade pelas flags e pela finitude. Calcule 10 e só " +
                    "depois use String para exibir \"10 reais\". Se houver entrada inválida, entradaValida é false e o " +
                    "resultado permanece diagnóstico; rejeição com if vem depois." })],
        '02.06': [block('Depure o fallback', 'const volumeEntrada = 0;\nconst volume = volumeEntrada || 50;\nconsole.log(volume);', [
                sample('Zero explícito', { volumeEntrada: 0 }, [0]), sample('Ausência null', { volumeEntrada: null }, [50]), sample('Ausência undefined', { volumeEntrada: undefined }, [50]), sample('False presente', { volumeEntrada: false }, [false]),
            ], { example: "Para um limite opcional, limiteEntrada ?? 3 devolve 3 quando a entrada é undefined; com entrada 0 " +
                    "mantém 0. Ausência e validade de tipo são decisões distintas.", debug: true })],
        '02.07': [block('Escreva a regra de desconto', 'const preco = 100;\nconst taxa = 0.2;\n// Declare total e exiba-o.', [
                sample('Desconto de 20%', { preco: 100, taxa: 0.2 }, [80]), sample('Sem desconto', { preco: 50, taxa: 0 }, [50]), sample('Preço zero', { preco: 0, taxa: 0.5 }, [0]), sample('Desconto integral', { preco: 100, taxa: 1 }, [0]),
            ], { example: "Preço 84, taxa 0.25: permanece a fração 0.75, então o total é 63. Aqui o preço é finito não negativo " +
                    "e a taxa está em [0,1]; nenhuma validação escondida existe no starter." })],
        '02.08': [block('Transfira para preferências', "const volumeEntrada = 0;\nconst temaEntrada = \"\";\nconst notificacoesEntrada = false;\nconst volume = " +
                "volumeEntrada || 50;\nconst tema = temaEntrada || \"claro\";\nconst notificacoes = notificacoesEntrada " +
                "|| true;\nconsole.log(volume, tema, notificacoes);", [
                sample('Escolhas falsy válidas', {
                    volumeEntrada: 0, temaEntrada: '', notificacoesEntrada: false
                }, [0, '', false]), sample('Três ausências', {
                    volumeEntrada: null, temaEntrada: undefined, notificacoesEntrada: null
                }, [50, 'claro', true]), sample('Escolhas presentes', {
                    volumeEntrada: 20, temaEntrada: 'escuro', notificacoesEntrada: true
                }, [20, 'escuro', true]), sample('Ausência só no volume', {
                    volumeEntrada: undefined, temaEntrada: 'escuro', notificacoesEntrada: false
                }, [50, 'escuro', false]), sample('Ausência só no tema', {
                    volumeEntrada: 10, temaEntrada: null, notificacoesEntrada: true
                }, [10, 'claro', true]),
            ], { example: "Uma configuração tentativas=0 é uma escolha explícita. ?? preserva o zero; defaults agem só para " +
                    "ausência. Nesta atividade, \"\" também é um tema aceito." })],
        '02.09': [block('Checkpoint · Normalize e some', 'const aEntrada = 0;\nconst bEntrada = 5;\n// Declare a e b com padrão 0 para ausência.\n// Declare total e exiba a, b, total.', [
                sample('Zero e cinco', { aEntrada: 0, bEntrada: 5 }, [0, 5, 5]), sample('Ambos ausentes', { aEntrada: undefined, bEntrada: undefined }, [0, 0, 0]), sample('Null e zero', { aEntrada: null, bEntrada: 0 }, [0, 0, 0]), sample('Três e ausência', { aEntrada: 3, bEntrada: undefined }, [3, 0, 3]), sample('Dois placares presentes', { aEntrada: 7, bEntrada: 2 }, [7, 2, 9]),
            ], { example: "Uma equipe tem 13 pontos e a outra está ausente. Normalize cada ausência para 0 e só depois some: " +
                    "13. As entradas aqui são números finitos não negativos, null ou undefined; não há parsing de texto." })],
        '02.10': [
            block('A · Quatro regras de arredondamento', "const segundos = 89;\nconst segundosNegativos = -89;\nconsole.log(Math.floor(segundos / 60));\n// " +
                "Complete ceil, round, trunc para segundos;\n// depois floor, ceil, round, trunc para " +
                "segundosNegativos.", [
                sample('89 e -89 segundos', { segundos: 89, segundosNegativos: -89 }, [
                    1, 2, 1, 1, -2, -1, -1, -1
                ]), sample('Meio minuto positivo e negativo', { segundos: 30, segundosNegativos: -30 }, [
                    0, 1, 1, 0, -1, -0, -0, -0
                ]),
            ], { ignoreSignedZero: true, example: "149/60: floor=2, ceil=3, round=2, trunc=2. Em -149/60, floor=-3 e trunc=-2: piso e truncamento " +
                    "diferem abaixo de zero. Curiosidade: Math.round(-0.5) é -0, mas a distinção não é exigida neste " +
                    "bloco." }),
            block('B · Extremos e magnitude', 'const x = 3;\nconst y = 5;\nconst deslocamento = -3;\n// Exiba min(x,y), max(x,y), abs(deslocamento).', [
                sample('Três e cinco', {
                    x: 3, y: 5, deslocamento: -3
                }, [3, 5, 3]), sample('Sinais diferentes', {
                    x: -2, y: 7, deslocamento: 4
                }, [-2, 7, 4]),
            ], { example: 'Math.min(2,8) é 2; Math.max(2,8) é 8; Math.abs(-4) é 4. O valor absoluto mede magnitude sem sinal.' }),
            block('C · Um dado de 1 a 6', 'const sorteio = Math.random();\n// Declare face usando sorteio, Math.floor e o intervalo de seis faces.\n// Exiba sorteio e face.', [
                sample('Extremo inferior', { sorteio: 0 }, [0, 1]), sample('Um quarto', { sorteio: 0.25 }, [0.25, 2]), sample('Metade', { sorteio: 0.5 }, [0.5, 4]), sample('Próximo do extremo superior', { sorteio: 0.9999999999999999 }, [0.9999999999999999, 6]),
            ], { random: true, example: "Math.random() gera um valor em [0,1). Para quatro faces, Math.floor(sorteio * 4) + 1 gera 1..4. O " +
                    "extremo 0 vira 1 e um valor próximo de 1 vira 4. Math.random não serve a senhas, tokens ou outros " +
                    "segredos." }),
        ],
        '02.11': [
            block('A · Decimais e valores especiais', "// Escreva console.log para cada expressão, na ordem:\n// 0.5 + 0.25 === 0.75\n// 0.1 + 0.2\n// 0.1 + " +
                "0.2 === 0.3\n// Number.isNaN(NaN)\n// Number.isFinite(Infinity)", [sample('Decimais e finitude', {}, [
                    true, 0.30000000000000004, false, true, false
                ])], { rows: [
                    '0.5 + 0.25 === 0.75', '0.1 + 0.2', '0.1 + 0.2 === 0.3', 'Number.isNaN(NaN)', 'Number.isFinite(Infinity)'
                ], example: "0.5 e 0.25 têm representação binária exata. 0.2 + 0.7 é 0.8999999999999999, então a igualdade com " +
                    "0.9 é false. Não se trata de aleatoriedade. NaN representa resultado inválido; Infinity não é " +
                    "finito." }),
            block('B · Inteiros seguros e BigInt', '// Escreva console.log para cada expressão, na ordem:\n// Number.isSafeInteger(2 ** 53 - 1)\n// Number.isSafeInteger(2 ** 53)\n// typeof 1n', [sample('Limite seguro e tipo', {}, [true, false, 'bigint'])], { rows: ['Number.isSafeInteger(2 ** 53 - 1)', 'Number.isSafeInteger(2 ** 53)', 'typeof 1n'], example: "Inteiros seguros de Number vão de -(2**53-1) a 2**53-1. BigInt é apropriado para inteiros além dessa " +
                    "precisão; não representa frações e não se mistura implicitamente com Number." }),
        ],
        '02.12': [block('Declare a tolerância do sensor', "const a = 2000.3;\nconst b = 2000.304;\nconst resolucao = 0.01;\n// Política: diferença de até metade " +
                "da resolução, inclusive.\n// Declare tolerancia e exiba tolerancia, comparação aproximada.", [
                sample('Sensor perto de 2000', {
                    a: 2000.3, b: 2000.304, resolucao: 0.01
                }, [0.005, true]), sample('Fora da tolerância', {
                    a: 1, b: 1.1, resolucao: 0.02
                }, [0.01, false]), sample('Soma perto de 1', {
                    a: 0.1 + 0.2, b: 0.3, resolucao: 2e-15
                }, [1e-15, true]), sample('Soma perto de 2000', {
                    a: 1000.1 + 1000.2, b: 2000.3, resolucao: 2e-12
                }, [1e-12, true]), sample('Exatamente no limite', {
                    a: 0, b: 0.125, resolucao: 0.25
                }, [0.125, true]), sample('Acima do limite', {
                    a: 0, b: 0.25, resolucao: 0.25
                }, [0.125, false]), sample('Leituras iguais', {
                    a: 4, b: 4, resolucao: 0.01
                }, [0.005, true]),
            ], { tolerance: true, example: "Outro sensor informa resolução 0.2 e a mesma política de metade: o limiar é 0.1. Diferença 0.08 é " +
                    "aceita e 0.2 é rejeitada. Esta política pertence ao exercício; resolução sozinha não define uma " +
                    "tolerância universal. Number.EPSILON não substitui os requisitos." })],
    };
    // Each block teaches the rule before asking for a prediction. Parallel
    // examples use different inputs so learners still apply the rule themselves.
    const teaching = {
        '02.01': [
            {
                model: "Uma expressão combina valores e produz outro valor. + soma, - subtrai, * multiplica, / divide, % " +
                    "encontra o resto e ** calcula potência. Resolva parênteses, depois potências, " +
                    "multiplicação/divisão/resto e, por último, soma/subtração.", code: 'console.log(5 + 2 * 3);\nconsole.log((5 + 2) * 3);\nconsole.log(7 % 3, 3 ** 2);', steps: ['2 * 3 vale 6; 5 + 6 vale 11. Com parênteses, 5 + 2 vale 7; 7 * 3 vale 21.', '7 dividido por 3 deixa resto 1. 3 ** 2 é 3 vezes 3, portanto 9. Cada resultado tem tipo number.'], trap: 'Não resolva tudo da esquerda para a direita. % devolve o resto, não uma porcentagem.'
            },
            {
                model: "Comparações devolvem booleanos. > significa maior, >= inclui igualdade, < significa menor e <= " +
                    "inclui igualdade. Truthiness é a forma como um valor é tratado numa condição: 0 é falsy; 2 e textos " +
                    "não vazios são truthy. ! inverte essa condição. && exige os dois lados quando eles são booleanos; || " +
                    "aceita qualquer um.", code: "console.log(7 >= 7, !2);\nconsole.log(true && \"ok\", false || \"reserva\");\nconsole.log(\"4\" + " +
                    "1);\nconsole.log(false && nomeNaoDeclarado, true || nomeNaoDeclarado);", steps: [
                    '7 >= 7 é true; 2 é truthy e !2 é false.', "&& retorna o primeiro falsy ou o último operando. || retorna o primeiro truthy ou o último operando. " +
                        "Assim true && \"ok\" retorna uma string e false || \"reserva\" também.", 'Com uma string, + concatena: "4" + 1 produz "41", não 5.', "Curto-circuito: nas duas últimas expressões, o primeiro lado já decide o resultado. Ler " +
                        "nomeNaoDeclarado causaria erro, mas o lado direito é pulado. Execute o exemplo: ele produz false e " +
                        "true sem erro. Se o primeiro lado de && fosse true, o nome seria lido e ocorreria erro."
                ], trap: '&& e || nem sempre devolvem booleanos. = atribui; === compara.'
            },
            {
                model: "=== exige o mesmo tipo e o mesmo valor; !== responde o oposto dessa comparação. == pode converter " +
                    "tipos, e por isso exige cuidado ao ler código antigo.", code: 'console.log(1 === "1", 1 == "1");\nconsole.log(1 !== "1", 2 !== 2);', steps: ['O número 1 e a string "1" têm tipos diferentes: === dá false, mas == faz coerção e dá true.', '!== não converte os tipos: 1 !== "1" é true; 2 !== 2 é false. Os quatro resultados têm tipo boolean.'], trap: 'Prefira === e !==. Aprender este exemplo não significa conhecer todas as regras de ==.'
            },
        ],
        '02.02': [{
                model: "Falsy significa tratado como falso numa condição; nullish significa ausência null ou undefined. Os " +
                    "seis valores desta tabela são falsy, mas só dois são nullish. || usa um padrão para qualquer falsy; " +
                    "?? usa um padrão somente para nullish.", code: 'const tentativas = 0;\nconsole.log(tentativas || 3, tentativas ?? 3);\nconsole.log(null || 3, null ?? 3);', steps: ['Zero é falsy, mas não é nullish: || devolve 3 e ?? preserva 0.', 'null é falsy e nullish: os dois operadores devolvem 3. Na matriz, classifique a entrada e depois preveja cada operador.'], trap: "\"\" é uma resposta (string vazia), não uma célula sem resposta. NaN pode ser inválido e mesmo assim " +
                    "não ser ausência. Esta tabela não lista todos os falsy de JavaScript."
            }],
        '02.03': [{
                model: "Calcule cada requisito separadamente e combine os booleanos. O pagamento exige saldo suficiente E " +
                    "conta ativa; saldo igual ao valor já é suficiente. Um nome precisa ser declarado antes de ser usado.", code: "const estoque = 6;\nconst pedido = 6;\nconst aberto = true;\nconst suficiente = estoque >= " +
                    "pedido;\nconst autorizado = aberto === true;\nconst podeAtender = suficiente && " +
                    "autorizado;\nconsole.log(podeAtender);", steps: ['6 >= 6 é true; aberto === true também. true && true autoriza o pedido.', 'Se qualquer requisito for false, && devolve false. A e B são independentes, mas C depende dos dois e D depende de C.'], trap: '|| autorizaria com apenas um requisito. Retirar um bloco obrigatório exige restaurar a montagem.'
            }],
        '02.04': [{
                model: "Number(texto) converte texto em número. Number.isFinite(numero) responde se é um número finito; " +
                    "Number.isNaN só identifica NaN. A flag vazio já vem da entrada e vale true para campo vazio ou só " +
                    "espaços.", code: "const texto = \"42.5\";\nconst vazio = false;\nconst numero = Number(texto);\nconst invalido = vazio || " +
                    "!Number.isFinite(numero);\nconsole.log(numero, invalido);", steps: ['"42.5" vira 42.5; é finito. !true é false e false || false resulta em invalido=false.', 'Number("") produz 0, mas vazio=true torna a entrada inválida. Já o texto "0" com vazio=false representa zero válido.', '"abc" vira NaN e "Infinity" vira Infinity: ambos são rejeitados por isFinite. Complete apenas as duas expressões ausentes.'], trap: 'Number.isNaN(Infinity) é false. Usar só isNaN deixaria infinitos passarem.'
            }],
        '02.05': [{
                model: "Separe três decisões: converter as duas entradas, detectar validade e apresentar o cálculo como " +
                    "texto. Nesta prática, entradaValida sinaliza um problema; ainda não há if nem rejeição de entrada.", code: "const unidades = \"4\";\nconst valor = \"2.5\";\nconst unidadesVazias = false;\nconst valorVazio = " +
                    "false;\nconst unidadesNumero = Number(unidades);\nconst valorNumero = Number(valor);\nconst valida = " +
                    "!unidadesVazias && !valorVazio && Number.isFinite(unidadesNumero) && " +
                    "Number.isFinite(valorNumero);\nconst soma = unidadesNumero * valorNumero;\nconsole.log(valida, soma, " +
                    "String(soma) + \" reais\");", steps: ['As conversões produzem 4 e 2.5. As flags são false e os dois números são finitos, então valida=true.', '4 * 2.5 vale 10. String(10) vira "10"; a apresentação é "10 reais".', 'Com entrada vazia, o cálculo diagnóstico pode ser zero e a validade continua false. Isso não autoriza uma compra.'], trap: 'A multiplicação converte strings implicitamente; aqui use Number nas duas entradas e String na apresentação para deixar a intenção explícita.'
            }],
        '02.06': [{
                model: "Depurar é observar uma saída que contradiz a regra, localizar a causa e conferir a correção. Volume " +
                    "zero é uma escolha explícita; o padrão 50 deve servir apenas para ausência.", code: 'const limiteEntrada = 0;\nconsole.log(limiteEntrada || 3);\nconsole.log(limiteEntrada ?? 3);', steps: ['|| trata zero como falsy e mostra 3. ?? preserva zero.', 'Execute o código original da atividade: ele mostra 50 com volumeEntrada=0. Depois registre sua previsão, corrija o operador e compare todos os casos.'], trap: 'Trocar somente o número 50 por 0 não resolve os casos de null e undefined.'
            }],
        '02.07': [{
                model: "Uma taxa é uma fração: 25% corresponde a 25 / 100 = 0.25. Um desconto de 25% deixa 75% do preço. O " +
                    "domínio fornecido já garante preço finito não negativo e taxa entre 0 e 1.", code: 'const valor = 84;\nconst desconto = 0.25;\nconst fracaoRestante = 1 - desconto;\nconst final = valor * fracaoRestante;\nconsole.log(final);', steps: ['1 - 0.25 vale 0.75. Multiplique 84 por 0.75: o resultado é 63.', 'Sem desconto, taxa=0 deixa a fração 1. Desconto integral, taxa=1, deixa a fração 0. Escreva sua regra no binding total.'], trap: 'preco * taxa calcula o desconto, não o preço final. Não use 20 para representar 20%.'
            }],
        '02.08': [{
                model: "Aplique a regra de ausência a cada preferência, de forma independente. Nesta atividade, 0, false e " +
                    "\"\" são escolhas aceitas, e qualquer outro valor presente também deve permanecer.", code: "const tentativasEntrada = 0;\nconst avisoEntrada = null;\nconst tentativas = tentativasEntrada ?? " +
                    "3;\nconst aviso = avisoEntrada ?? false;\nconsole.log(tentativas, aviso);", steps: ['tentativas mantém 0; aviso recebe false porque sua entrada é null.', 'Transfira essa regra para volume, tema e notificacoes. Observe os casos em que apenas uma preferência está ausente.'], trap: 'Não grave sempre os valores do primeiro caso. Um tema "escuro" precisa continuar "escuro".'
            }],
        '02.09': [{
                model: "Checkpoint: normalize cada placar ausente para 0 e some os dois números. As entradas são números " +
                    "finitos não negativos, null ou undefined. Retome 02.02 e 02.08 se precisar; tente escrever sem abrir " +
                    "dicas.", code: 'const pontos = 13;\nconst visitante = null;\nconsole.log(pontos + (visitante ?? 0));', steps: ['visitante é null e recebe 0; pontos continua 13. A soma é 13.', 'Na sua solução, declare a e b separadamente antes de total. Escolha casos que distingam zero presente, ausência e dois placares presentes.'], trap: "Não converta texto: este checkpoint não recebe strings. Na próxima etapa, uma condição como total >= " +
                    "10 poderá escolher um caminho; aqui você aprende a calculá-la."
            }],
        '02.10': [
            {
                model: "Math é um conjunto de ferramentas numéricas. A chamada Math.floor(x) recebe um número e devolve " +
                    "outro: floor vai ao inteiro abaixo, ceil ao inteiro acima, trunc remove a parte fracionária e round " +
                    "escolhe o inteiro mais próximo (empates vão em direção a +Infinity).", code: "const minutos = 149 / 60;\nconsole.log(Math.floor(minutos), Math.ceil(minutos), Math.round(minutos), " +
                    "Math.trunc(minutos));\nconsole.log(Math.floor(-1.8), Math.trunc(-1.8));", steps: ['149 / 60 é aproximadamente 2.483: floor=2, ceil=3, round=2 e trunc=2.', 'Para -1.8, o inteiro abaixo é -2; remover a fração dá -1. Na atividade, compare as quatro regras para os dois sinais.'], trap: 'Arredondar um número negativo não é simplesmente apagar o sinal. A distinção entre -0 e 0 é opcional neste bloco.'
            },
            {
                model: 'Math.min(a,b) devolve o menor argumento e Math.max(a,b) o maior. Math.abs(x) mede magnitude: a distância até zero, sem sinal.', code: 'console.log(Math.min(2, 8), Math.max(2, 8));\nconsole.log(Math.abs(-4));', steps: ['Entre 2 e 8, min=2 e max=8. A magnitude de -4 é 4.', 'Use as entradas x, y e deslocamento para que a regra continue funcionando em cada caso.'], trap: 'abs não arredonda. Em -2 e 7, o menor é -2, mesmo com magnitude positiva.'
            },
            {
                model: "Math.random() não recebe argumentos e gera um número em [0,1): inclui zero e exclui um. Para N " +
                    "faces, multiplique por N, tire a parte fracionária com floor e some 1.", code: 'const amostra = 0.5;\nconst faceDeQuatro = Math.floor(amostra * 4) + 1;\nconsole.log(amostra, faceDeQuatro);', steps: ['Exemplo paralelo com quatro faces: 0.5 * 4 vale 2; floor(2) + 1 vale 3. Zero vira 1; valores perto de 1 viram 4.', 'O exercício pede SEIS faces: adapte N para 6 e mantenha Math.random() no starter. Os casos substituem sorteio por números fixos para testar a regra.', 'O botão de sorteio real pode mostrar qualquer amostra em [0,1), mas a face deve ser inteira de 1 a 6.'], trap: 'Multiplicar por quatro resolveria o exemplo, não a tarefa. Math.random não serve para senhas ou tokens.'
            },
        ],
        '02.11': [
            {
                model: "Number representa números em ponto flutuante binário. Frações como 0.5 e 0.25 têm representação " +
                    "exata; muitas outras são aproximações. Isso pode aparecer na soma e na igualdade estrita.", code: 'console.log(0.5 + 0.25 === 0.75);\nconsole.log(0.2 + 0.7, 0.2 + 0.7 === 0.9);\nconsole.log(Number.isNaN(NaN), Number.isFinite(Infinity));', steps: ['A primeira comparação é true. A segunda soma produz 0.8999999999999999 e a igualdade é false. O resultado é determinístico.', 'NaN indica resultado numérico inválido; Infinity não é finito. Use os predicados explícitos para distingui-los.'], trap: 'Nem todo decimal é inexato. Não use a impressão arredondada como prova de igualdade.'
            },
            {
                model: "Number.isSafeInteger(x) confirma que x é um inteiro dentro de -(2 ** 53 - 1) até 2 ** 53 - 1. Fora " +
                    "desse intervalo, Number pode perder diferenças entre inteiros. O sufixo n cria um BigInt.", code: "console.log(Number.isSafeInteger(9007199254740991));\nconsole.log(9007199254740992 === " +
                    "9007199254740993);\nconsole.log(9007199254740992n + 1n);\nconsole.log(typeof 2n);", steps: ['O limite 9007199254740991 é seguro. Os dois Number da comparação seguinte acabam com a mesma representação: a igualdade dá true.', 'BigInt preserva o inteiro seguinte: a soma dá 9007199254740993n e typeof devolve "bigint".'], trap: 'BigInt não representa frações; 1n + 1 mistura tipos e causa erro. Use operandos do mesmo tipo.'
            },
        ],
        '02.12': [{
                model: "Comparar medidas aproximadas exige uma política do domínio. Aqui ela é explícita: aceitar diferença " +
                    "de ATÉ metade da resolução, inclusive. Math.abs(a - b) mede a distância; <= inclui o limite.", code: "const leituraA = 0;\nconst leituraB = 0.125;\nconst passo = 0.25;\nconst limite = passo / " +
                    "2;\nconsole.log(limite, Math.abs(leituraA - leituraB) <= limite);", steps: ['0.25 / 2 vale 0.125. A distância também é 0.125, então <= devolve true no limite. Com <, o mesmo caso falharia.', 'No starter, 0.01 / 2 vale 0.005; a distância das leituras é aproximadamente 0.004 e é aceita. Declare tolerancia a partir de resolucao em cada caso.'], trap: 'Number.EPSILON descreve uma escala perto de 1, não a política deste sensor. Resolução sozinha não define uma tolerância universal.'
            }],
    };
    const beginnerSupport = {
        '02.01': [
            {
                vocabulary: [['precedência', 'ordem em que operadores são calculados'], ['parênteses', 'marcadores que forçam uma parte a ser calculada primeiro']], goal: 'Calcular expressões respeitando a ordem dos operadores.', taskSteps: ['Resolva primeiro potência, multiplicação, divisão ou resto.', 'Compare a expressão sem parênteses com a expressão agrupada.', 'Registre os seis resultados na ordem antes de executar.']
            },
            {
                vocabulary: [['truthiness', 'forma como um valor é tratado como verdadeiro ou falso'], ['operando', 'valor de um lado de um operador'], ['concatenação', 'juntar texto com +']], goal: 'Prever valores e tipos em lógica e texto.', taskSteps: ['Classifique o valor usado por !, && e || como truthy ou falsy.', 'Lembre que && e || podem devolver um operando, inclusive uma string.', 'Com uma string em +, preveja concatenação e registre o tipo.']
            },
            {
                vocabulary: [['igualdade estrita', 'comparação de tipo e valor sem conversão'], ['coerção', 'conversão implícita feita por uma operação']], goal: 'Explicar a diferença entre === e ==.', taskSteps: ['Compare 0 com "0" usando === e observe os tipos.', 'Repita com == e identifique a coerção.', 'Registre os dois booleanos e justifique a preferência por ===.']
            }
        ],
        '02.02': [{
                vocabulary: [['falsy', 'valor tratado como falso'], ['nullish', 'somente null ou undefined'], ['fallback', 'valor substituto']], goal: 'Escolher o fallback sem apagar valores válidos.', taskSteps: ['Separe null e undefined dos outros falsy.', 'Preveja o resultado de || e ?? para cada entrada.', 'Escreva a string vazia como "" e explique a divergência.']
            }],
        '02.03': [{
                vocabulary: [['condição', 'expressão que testa um requisito'], ['&&', 'exige que os dois lados sejam verdadeiros'], ['distrator', 'bloco que viola a regra']], goal: 'Autorizar somente quando saldo e conta ativa forem verdadeiros.', taskSteps: ['Calcule cada requisito em seu próprio bloco.', 'Combine os dois com && antes de imprimir.', 'Retire || e confira os três casos.']
            }],
        '02.04': [{
                vocabulary: [['parsing', 'converter texto em número'], ['finitude', 'não ser NaN nem Infinity'], ['flag de vazio', 'registro de ausência da entrada']], goal: 'Separar conversão numérica da validade.', taskSteps: ['Converta texto com Number(texto).', 'Combine vazio com Number.isFinite(numero).', 'Confira zero, vazio, texto inválido e Infinity.']
            }],
        '02.05': [{
                vocabulary: [['conversão explícita', 'pedir Number ou String no código'], ['validade', 'decisão baseada em flags e finitude'], ['diagnóstico', 'resultado observado mesmo com entrada inválida']], goal: 'Construir o fluxo texto, número, cálculo e apresentação.', taskSteps: ['Converta quantidade e preço separadamente.', 'Combine as flags e os testes de finitude.', 'Calcule com números e apresente com String().']
            }],
        '02.06': [{
                vocabulary: [['default', 'valor substituto'], ['ausência', 'null ou undefined'], ['debug', 'observar a falha antes de corrigir']], goal: 'Preservar zero e usar default somente para ausência.', taskSteps: ['Execute o starter original e registre o resultado de zero.', 'Compare zero, null e undefined com || e ??.', 'Troque o operador e confira todos os casos.']
            }],
        '02.07': [{
                vocabulary: [['taxa', 'fração removida do preço'], ['fração restante', 'parte que permanece após o desconto'], ['domínio', 'faixa aceita pelo contrato']], goal: 'Calcular o preço depois do desconto.', taskSteps: ['Derive a fração restante como 1 - taxa.', 'Multiplique preco por essa fração.', 'Confira taxa 0, taxa 1 e preço zero.']
            }],
        '02.08': [{
                vocabulary: [['preferência', 'valor escolhido pelo usuário'], ['ausência', 'null ou undefined'], ['validação de tipo', 'regra separada do default']], goal: 'Preservar preferências falsy e preencher ausências.', taskSteps: ['Classifique 0, "" e false como escolhas válidas.', 'Use ?? em cada preferência.', 'Confira escolhas falsy e três ausências.']
            }],
        '02.09': [{
                vocabulary: [['normalizar', 'preparar cada entrada para uso'], ['opcional', 'campo que pode estar ausente'], ['agregar', 'combinar valores por soma']], goal: 'Normalizar duas entradas antes de somá-las.', taskSteps: ['Aplique ?? 0 a cada entrada separadamente.', 'Preserve zero explícito.', 'Some e exiba a, b e total nessa ordem.']
            }],
        '02.10': [
            {
                vocabulary: [['floor', 'arredonda para menos infinito'], ['ceil', 'arredonda para mais infinito'], ['trunc', 'remove a fração em direção a zero']], goal: 'Distinguir arredondamentos para valores positivos e negativos.', taskSteps: ['Divida os segundos por 60.', 'Compare floor e trunc nos dois sinais.', 'Complete as oito chamadas na ordem do starter.']
            },
            {
                vocabulary: [['min', 'seleciona o menor argumento'], ['max', 'seleciona o maior argumento'], ['magnitude', 'tamanho sem considerar o sinal']], goal: 'Encontrar extremos e magnitude com Math.', taskSteps: ['Passe x e y para min e max.', 'Passe deslocamento para abs.', 'Confira também o caso com sinais diferentes.']
            },
            {
                vocabulary: [['intervalo [0,1)', 'inclui zero e exclui um'], ['face', 'inteiro produzido pelo dado'], ['aleatório', 'valor que varia entre execuções']], goal: 'Mapear Math.random para seis faces.', taskSteps: ['Multiplique sorteio por 6 e use Math.floor.', 'Some 1 para obter faces de 1 a 6.', 'Teste 0, 0.5 e valor próximo de 1.']
            }
        ],
        '02.11': [
            {
                vocabulary: [['ponto flutuante', 'representação binária de Number'], ['NaN', 'resultado numérico inválido'], ['Infinity', 'valor fora da faixa finita']], goal: 'Reconhecer precisão decimal, NaN e Infinity.', taskSteps: ['Compare decimais exatos e aproximados.', 'Observe o valor de 0.1 + 0.2 antes da igualdade.', 'Use Number.isNaN e Number.isFinite.']
            },
            {
                vocabulary: [['inteiro seguro', 'inteiro sem perda de precisão em Number'], ['BigInt', 'tipo para inteiros grandes'], ['typeof', 'operador que informa o tipo']], goal: 'Identificar o limite seguro e o tipo BigInt.', taskSteps: ['Compare 2 ** 53 - 1 e 2 ** 53 com isSafeInteger.', 'Leia typeof 1n.', 'Explique por que BigInt não serve para frações nem se mistura implicitamente com Number.']
            }
        ],
        '02.12': [{
                vocabulary: [['resolução', 'menor diferença distinguível pelo sensor'], ['tolerância', 'diferença máxima aceita'], ['diferença absoluta', 'distância sem sinal entre valores']], goal: 'Derivar a tolerância e comparar medidas.', taskSteps: ['Calcule resolucao / 2.', 'Calcule Math.abs(a - b) e use <=.', 'Confira o caso inicial, o limite exato e um caso acima do limite.']
            }]
    };
    const required = {
        '02.03': ['suficiente', 'autorizada', 'podePagar'], '02.04': ['numero', 'invalido'],
        '02.05': [
            'quantidadeNumero', 'precoNumero', 'entradaValida', 'total', 'etiqueta'
        ],
        '02.06': ['volume'], '02.07': ['total'], '02.08': ['volume', 'tema', 'notificacoes'],
        '02.09': ['a', 'b', 'total'], '02.10': ['face'], '02.12': ['tolerancia'],
    };
    for (const [id, configs] of Object.entries(lessons))
        configs.forEach((config, index) => {
            config.teaching = { ...teaching[id][index], ...beginnerSupport[id][index] };
            config.requiredVariables = id === '02.10' && index !== 2 ? [] : required[id] || [];
            config.faded = id === '02.04';
            config.classifications = id === '02.02';
        });
    const hints = {
        '02.01': [
            ['Calcule a multiplicação antes da soma; depois compare com a expressão entre parênteses.', 'Use uma chamada console.log por linha do quadro e mantenha a ordem pedida.', 'Confira também o resto com %, a divisão com / e a potência com **.'],
            ['Avalie cada linha como expressão independente; ! atua sobre truthiness.', '&& e || podem devolver um dos operandos, inclusive uma string.', 'Para "2" + 3, observe se há uma string antes de prever o tipo do resultado.'],
            ['Escreva primeiro a comparação estrita e depois a comparação com coerção.', 'Os valores têm o mesmo conteúdo visual, mas tipos diferentes.', 'A segunda expressão aceita a conversão implícita; a primeira exige mesmo tipo e valor.'],
        ],
        '02.02': [
            ['Separe null e undefined dos outros quatro valores da matriz.', '|| troca qualquer valor falsy; ?? só troca ausência nullish.', 'Imprima as duas expressões para cada x, na ordem, preservando a string vazia como resultado quando ela for mantida.'],
        ],
        '02.03': [
            ['Crie uma variável para saldo suficiente e outra para conta ativa.', 'A autorização precisa depender das duas variáveis.', 'Escolha && para exigir ambas; o bloco com || é o distrator.'],
        ],
        '02.04': [
            ['Converta texto para número antes de verificar se ele é finito.', 'A flag vazio identifica ausência; Number("") sozinho produziria zero.', 'Combine a flag com Number.isFinite(numero) para marcar entradas vazias ou não finitas como inválidas.'],
        ],
        '02.05': [
            ['Converta quantidade e preço separadamente com Number().', 'Entrada válida exige as duas flags falsas e os dois números finitos.', 'Calcule total com os números convertidos; para a etiqueta, converta o total com String().'],
        ],
        '02.06': [
            ['O valor zero está presente, embora seja falsy.', 'Compare o comportamento de || com ?? para zero e null.', 'Troque o operador do fallback para que zero e false sejam preservados e null/undefined recebam 50.'],
        ],
        '02.07': [
            ['A taxa é a parte descontada; descubra qual fração do preço permanece.', 'Subtraia do preço a parcela preco * taxa.', 'Teste a expressão com taxa 0 e taxa 1 para conferir os dois limites.'],
        ],
        '02.08': [
            ['As três configurações iniciais são valores falsy, mas algumas são escolhas explícitas.', 'Use um fallback apenas para null ou undefined.', 'Aplique ?? a cada entrada; assim zero, string vazia e false continuam sendo preferências válidas.'],
        ],
        '02.09': [
            ['Normalize a e b separadamente antes de somá-los.', 'Os casos incluem zero explícito, null e undefined; só os dois últimos significam ausência.', 'Use ?? 0 para cada entrada, depois exiba a normalizada, b normalizada e a soma nessa ordem.'],
        ],
        '02.10': [
            ['Divida os segundos por 60 antes de arredondar.', 'floor vai para baixo e ceil para cima; em negativos eles se afastam em direções diferentes.', 'Complete as oito chamadas na ordem do starter: quatro para positivos e depois quatro para negativos.'],
            ['min escolhe o menor valor e max o maior.', 'O sinal não muda qual valor abs retorna: ele mede a magnitude.', 'Use os argumentos x e y em min/max e deslocamento em abs.'],
            ['sorteio já está no intervalo de zero até antes de um.', 'Multiplique por seis para dividir esse intervalo em seis faixas iguais.', 'Use floor(sorteio * 6) + 1; isso mapeia zero para 1 e o extremo superior para 6.'],
        ],
        '02.11': [
            ['Compare primeiro a soma dos valores binários exatos 0.5 e 0.25.', 'Depois observe o valor exibido por 0.1 + 0.2 antes de testar igualdade com 0.3.', 'Use Number.isNaN para NaN e Number.isFinite para distinguir Infinity.'],
            ['O limite seguro termina em 2 ** 53 - 1.', '2 ** 53 já está fora do conjunto seguro de inteiros.', 'isSafeInteger responde booleanos; typeof 1n devolve o texto "bigint".'],
        ],
        '02.12': [
            ['A política define tolerância como metade da resolução.', 'Use <= porque o limite é inclusivo; compare a distância entre a e b.', 'Exiba primeiro resolucao / 2 e depois Math.abs(a - b) <= tolerancia.'],
        ],
    };
    function check(id, index, source) {
        const config = lessons[id]?.[index];
        if (!config)
            return {
                ok: false, message: 'Bloco desconhecido.', results: []
            };
        const runner = global.DevPathStage02Runner;
        const results = config.cases.map(item => {
            const result = runner.run(source, item.fixtures);
            const same = (a, b) => config.ignoreSignedZero && a === 0 && b === 0 || Object.is(a, b);
            const passed = result.ok && result.values.length === item.expected.length && result.values.every((value, index) => same(value, item.expected[index]));
            return {
                ...item, actual: result.values, variables: result.variables, error: result.error, passed
            };
        });
        let message = '';
        if (results.some(entry => !entry.error && config.requiredVariables.some(name => !Object.hasOwn(entry.variables || {}, name))))
            message = `Declare os nomes pedidos antes da saída: ${config.requiredVariables.join(', ')}.`;
        const outputBindings = {
            '02.03': ['podePagar'], '02.04': ['invalido'], '02.05': ['entradaValida', 'total', 'etiqueta'],
            '02.06': ['volume'], '02.07': ['total'], '02.08': ['volume', 'tema', 'notificacoes'],
            '02.09': ['a', 'b', 'total'], '02.12': ['tolerancia'],
        };
        const bindings = config.random ? ['sorteio', 'face'] : outputBindings[id] || [];
        if (results.some(entry => !entry.error && bindings.some((name, i) => !Object.is(entry.variables?.[name], entry.expected[i]))))
            message = 'As variáveis pedidas também devem conter os valores esperados de cada caso; não basta imprimir uma saída separada.';
        if (source.trim() === config.starter.trim())
            message = 'Escreva ou altere o código antes de conferir.';
        if (config.explicitConversion) {
            const result = runner.run(source, config.cases[0].fixtures);
            if (!result.ok || result.calls.filter(name => name === 'Number').length < 2 || !result.calls.includes('String'))
                message = 'Além das saídas, esta atividade pede conversões explícitas com Number() nas duas entradas e String() na apresentação.';
        }
        if (config.tolerance) {
            if (config.cases.some(entry => !Object.is(runner.run(source, entry.fixtures).variables?.tolerancia, entry.fixtures.resolucao / 2)))
                message = 'Declare tolerancia a partir de resolucao / 2 em cada caso, antes da comparação.';
        }
        if (config.random) {
            const result = runner.run(source);
            if (!result.ok || !result.calls.includes('Math.random') || result.values.length !== 2 || !(result.values[0] >= 0 && result.values[0] < 1) || !Number.isInteger(result.values[1]) || result.values[1] < 1 || result.values[1] > 6)
                message = 'Mantenha Math.random() no starter e exiba sorteio em [0,1) e uma face inteira de 1 a 6.';
        }
        const ok = !message && results.every(result => result.passed);
        return {
            ok, results, message: message || (ok ? 'Todos os casos passaram. Explique o que aprendeu antes de concluir.' : 'Há casos para corrigir. Compare esperado e obtido; a primeira divergência ajuda a localizar o erro.')
        };
    }
    global.DevPathStage02Lessons = {
        lessons, check, hints
    };
})(globalThis);
