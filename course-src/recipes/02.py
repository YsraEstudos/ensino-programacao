from recipe_api import E

CONTENT = {
    '02.01': E(
        'operators.predict',
        'material.md: Bloco A — aritmética e precedência: 2+3*4; (2+3)*4; 9-4; 6%4; 8/2; 2**3.\nBloco B — comparação e lógica: 0===false; 5>3; 5>=5; !0; true&&false; false||"x"; "2"+3.\nCOMPARE posterior aos dois blocos: 0==="0"; 0=="0"; 0!=="0"; 3!==3.',
        'Bloco A -> 14 (number), 20 (number), 5 (number), 2 (number), 4 (number), 8 (number); Bloco B -> false (boolean), true (boolean), true (boolean), true (boolean), false (boolean), "x" (string), "23" (string); COMPARE -> false, true, true, false',
        '3+1*2 -> 5 (number); false&&"x" -> false (boolean); true&&"x" -> "x" (string)',
        'Misturar precedência, igualdade estrita e fallback em uma regra única.',
        'Primeira divergência indica se falhou aritmética, comparação ou nullish.',
        'Qual família de operadores você está resolvendo e qual valor e tipo ela devolve?',
        ('Resolva uma família por vez; parênteses mudam a precedência.', '&& e || devolvem operandos; anote também o tipo.', 'Em 1==="1" o resultado é false; 1=="1" é true por coerção. Prefira === na trilha.'),
        'A: 14,20,5,2,4,8. B: false,true,true,true,false,"x","23". COMPARE: false,true,true,false. === não converte tipos; == aplica regras adicionais de coerção e só deve ser usado com intenção explícita. ?? será praticado em 02.02.',
        'Prever (3+1)*2 e true&&"ok", com tipos -> 8 (number), "ok" (string)',
        prompt=('Resolva primeiro o bloco A (+ - * / % ** e parênteses), registre valores e tipos e confira antes '
         'de avançar. Depois resolva B (=== > >= ! && || e concatenação). Por último compare 0 === "0" com '
         '0 == "0" e teste também !==: explique a coerção de == e por que a trilha prefere ===. O operador ?? entra em 02.02.'),
        kind='PREDICT',
        requires=(),
        secondary=('operators.arithmetic', 'operators.comparison', 'operators.logical', 'operators.basic'),
        constraints=(),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        estimated=22,
        load={'novelty': 2,
         'syntax': 2,
         'composition': 3,
         'state': 1,
         'debugging': 1,
         'files': 1,
         'reading': 4,
         'independence': 2,
         'tools': 1},
        docs=('MDN operator precedence: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence; '
         'nullish coalescing: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing'),
        assets=(),
        rubric=(),
        next_ids=(),
        optional=False,
        title='Expressões por família: aritmética, comparação e lógica',
        content_version=3,
        explanation={'mental_model': 'Uma expressão combina valores e produz outro valor. + soma, - subtrai, * multiplica, / divide, % encontra o resto e ** calcula potência. Resolva parênteses, depois potências, multiplicação/divisão/resto e, por último, soma/subtração. Comparações devolvem booleanos. > significa maior, >= inclui igualdade, < significa menor e <= inclui igualdade. Truthiness é a forma como um valor é tratado numa condição: 0 é falsy; 2 e textos não vazios são truthy. ! inverte essa condição. && exige os dois lados quando eles são booleanos; || aceita qualquer um. === exige o mesmo tipo e o mesmo valor; !== responde o oposto dessa comparação. == pode converter tipos, e por isso exige cuidado ao ler código antigo.', 'worked_example': 'console.log(5 + 2 * 3);\nconsole.log((5 + 2) * 3);\nconsole.log(7 % 3, 3 ** 2);\n2 * 3 vale 6; 5 + 6 vale 11. Com parênteses, 5 + 2 vale 7; 7 * 3 vale 21. 7 dividido por 3 deixa resto 1. 3 ** 2 é 3 vezes 3, portanto 9. Cada resultado tem tipo number.\n\nconsole.log(7 >= 7, !2);\nconsole.log(true && "ok", false || "reserva");\nconsole.log("4" + 1);\nconsole.log(false && nomeNaoDeclarado, true || nomeNaoDeclarado);\n7 >= 7 é true; 2 é truthy e !2 é false. && retorna o primeiro falsy ou o último operando. || retorna o primeiro truthy ou o último operando. Assim true && "ok" retorna uma string e false || "reserva" também. Com uma string, + concatena: "4" + 1 produz "41", não 5. Curto-circuito: nas duas últimas expressões, o primeiro lado já decide o resultado. Ler nomeNaoDeclarado causaria erro, mas o lado direito é pulado. Execute o exemplo: ele produz false e true sem erro. Se o primeiro lado de && fosse true, o nome seria lido e ocorreria erro.\n\nconsole.log(1 === "1", 1 == "1");\nconsole.log(1 !== "1", 2 !== 2);\nO número 1 e a string "1" têm tipos diferentes: === dá false, mas == faz coerção e dá true. !== não converte os tipos: 1 !== "1" é true; 2 !== 2 é false. Os quatro resultados têm tipo boolean.', 'common_trap': 'Não resolva tudo da esquerda para a direita. % devolve o resto, não uma porcentagem. && e || nem sempre devolvem booleanos. = atribui; === compara. Prefira === e !==. Aprender este exemplo não significa conhecer todas as regras de ==.', 'why_it_matters': 'Separar cálculo, comparação, lógica e concatenação permite escrever e ler condições sem confundir valor com tipo.'},
        first_response=('Duas listas separadas (A e B) de valor e tipo, registradas antes de executar cada bloco; depois '
         'a comparação curta entre ==, === e !==.'),
        first_response_timing='Após estudar a regra e o exemplo resolvido, antes de executar a solução própria.',
        interaction='Três blocos sequenciais com tabela de valor e tipo, exemplo executável antes da previsão e comparação posterior. Inclui ===, == e !==.',
        resources=('Starter disponível no cartão: material.md.',
         'Duas listas de previsão A/B com valor e tipo; comparação ==/=== após os blocos.',
         'Ponte 02A antes da atividade; previsão e execução em blocos separados.',
         'Documentação oficial: MDN operator precedence: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_precedence; '
         'nullish coalescing: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing'),
        review={'prompt': 'Que valor e tipo false || "x" e "2" + 3 devolvem?',
         'choices': ('"x" e "23", ambos strings.',
                     'true e 5, ambos convertidos em números.',
                     'false e 23, porque + sempre soma numericamente.'),
         'answer': '"x" e "23", ambos strings.',
         'feedback_correct': '|| devolve um operando; + concatena quando há string. Aspas deixam o tipo '
                             'explícito.',
         'feedback_incorrect': 'Anote valor e tipo. O fallback pode devolver string e + concatena texto.'},
        transfer_prompt='Preveja (3 + 1) * 2 e true && "ok"; registre valor e tipo sem executar.',
    ),
    '02.02': E(
        'operators.falsy_nullish',
        'tabela: x em [false,0,"",null,undefined,NaN]; colunas x||"padrão" e x??"padrão"',
        'false/0/""/NaN -> || dá padrão, ?? preserva x; null/undefined -> ambos dão padrão',
        "x=true -> ambos preservam true; x='ok' -> ambos preservam ok",
        'Tratar falso, zero e vazio como ausência em ??.',
        'Coluna ?? substitui um valor válido que é falsy.',
        'O valor é null/undefined ou apenas falsy?',
        ('Liste os dois valores nullish.', '|| testa truthiness; ?? testa só nullish.', 'Para volume 0, 0||50 dá 50 e 0??50 dá 0.'),
        '|| substitui os seis valores falsy desta tabela; ?? substitui apenas null e undefined. Exiba "" entre aspas, nunca como uma célula sem resposta.',
        'Comparar flags false e null em preferências -> false preservado por ??, null recebe fallback',
        prompt=('Preencha a matriz para cada valor sob `x || "padrão"` e `x ?? "padrão"`. Antes de conferir, '
         'marque quais valores são falsy e quais são nullish e explique onde os operadores divergem.'),
        kind='PREDICT',
        requires=('operators.logical',),
        secondary=(),
        constraints=(),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        estimated=10,
        load={'novelty': 2,
         'syntax': 2,
         'composition': 2,
         'state': 2,
         'debugging': 1,
         'files': 1,
         'reading': 4,
         'independence': 2,
         'tools': 1},
        docs=('MDN logical OR: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR; nullish '
         'coalescing: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing'),
        assets=(),
        rubric=(),
        next_ids=(),
        optional=False,
        title=None,
        content_version=3,
        explanation={'mental_model': 'Falsy significa tratado como falso numa condição; nullish significa ausência null ou undefined. Os seis valores desta tabela são falsy, mas só dois são nullish. || usa um padrão para qualquer falsy; ?? usa um padrão somente para nullish.', 'worked_example': 'const tentativas = 0;\nconsole.log(tentativas || 3, tentativas ?? 3);\nconsole.log(null || 3, null ?? 3);\nZero é falsy, mas não é nullish: || devolve 3 e ?? preserva 0. null é falsy e nullish: os dois operadores devolvem 3. Na matriz, classifique a entrada e depois preveja cada operador.', 'common_trap': '"" é uma resposta (string vazia), não uma célula sem resposta. NaN pode ser inválido e mesmo assim não ser ausência. Esta tabela não lista todos os falsy de JavaScript.', 'why_it_matters': 'Escolher a regra de ausência correta preserva escolhas válidas de preferências e formulários.'},
        first_response='Uma matriz com duas saídas por valor e colunas separadas para truthy/falsy e nullish/não-nullish.',
        first_response_timing='Após estudar a regra e o exemplo resolvido, antes de executar a solução própria.',
        interaction='Tabela por expressão com valor e tipo, classificação falsy/nullish por entrada e comparação com a previsão registrada.',
        resources=('Starter disponível no cartão: material.md.',
         'Matriz de previsão com uma linha por valor e duas colunas de operadores.',
         'Explicação integrada com zero number e fallback; BigInt fica para 02.11.',
         'Documentação oficial: MDN logical OR: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR; nullish '
         'coalescing: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing'),
        review={'prompt': 'Qual diferença entre `||` e `??` explica o tratamento de valores falsy versus valores '
                   'ausentes?',
         'choices': ('`||` substitui qualquer valor falsy; `??` mantém falsy válidos e substitui somente '
                     'null ou undefined.',
                     '`??` substitui false, 0 e texto vazio, enquanto `||` substitui só null e undefined.',
                     'Ambos testam exatamente truthiness e diferem apenas na forma de escrever o '
                     'fallback.'),
         'answer': '`||` substitui qualquer valor falsy; `??` mantém falsy válidos e substitui somente '
                   'null ou undefined.',
         'feedback_correct': 'Correto. `||` usa truthiness, mas `??` limita o fallback aos dois valores '
                             'nullish.',
         'feedback_incorrect': 'Classifique primeiro o valor. False, 0 e vazio podem ser escolhas válidas; '
                               'somente null e undefined ativam `??`.'},
        transfer_prompt=('Compare `0` e `undefined` em duas preferências numéricas opcionais; escolha o operador que '
         'preserva uma escolha explícita e justifique a política para ausência.'),
    ),
    '02.03': E(
        'operators.boolean_validation',
        'material.md: entradas: saldo=10, valor=8, ativa=true.\nA: const suficiente = saldo >= valor;\nB: const autorizada = ativa === true;\nC: const podePagar = suficiente && autorizada;\nD: console.log(podePagar);\nE (distrator): const podePagar = suficiente || autorizada;',
        'Saldo e conta suficientes: saldo=10,valor=8,ativa=true -> true; Saldo exatamente igual: saldo=8,valor=8,ativa=true -> true; Saldo insuficiente: saldo=8,valor=10,ativa=true -> false; Conta inativa: saldo=10,valor=8,ativa=false -> false; Dois requisitos ausentes: saldo=2,valor=8,ativa=false -> false',
        'saldo=8,valor=10,ativa=true -> false; saldo=10,valor=8,ativa=false -> false',
        'Usar || para uma regra que exige as duas condições.',
        'A resposta aprova conta inativa ou saldo insuficiente.',
        'As duas condições são necessárias ou basta uma?',
        ('Calcule suficiente e autorizada separadamente.', 'Una com && porque ambas são obrigatórias.', 'Em entrada permitida e senha correta, só as duas verdadeiras autorizam.'),
        'A e B podem trocar de ordem; ambos devem vir antes de C e D. O distrator E viola a regra.',
        'Montar expressão para estoque suficiente E pedido ativo -> false se qualquer requisito falhar',
        prompt=('Monte a expressão de validação ordenando os blocos. Registre quais duas condições são '
         'obrigatórias e quais blocos devem anteceder o resultado; não use if, que será ensinado depois.'),
        kind='PARSONS',
        requires=('operators.comparison', 'operators.logical'),
        secondary=(),
        constraints=(),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        estimated=12,
        load={'novelty': 2,
         'syntax': 2,
         'composition': 3,
         'state': 2,
         'debugging': 1,
         'files': 1,
         'reading': 3,
         'independence': 2,
         'tools': 1},
        docs=('MDN logical AND: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND'),
        assets=(),
        rubric=(),
        next_ids=(),
        optional=False,
        title=None,
        content_version=3,
        explanation={'mental_model': 'Calcule cada requisito separadamente e combine os booleanos. O pagamento exige saldo suficiente E conta ativa; saldo igual ao valor já é suficiente. Um nome precisa ser declarado antes de ser usado.', 'worked_example': 'const estoque = 6;\nconst pedido = 6;\nconst aberto = true;\nconst suficiente = estoque >= pedido;\nconst autorizado = aberto === true;\nconst podeAtender = suficiente && autorizado;\nconsole.log(podeAtender);\n6 >= 6 é true; aberto === true também. true && true autoriza o pedido. Se qualquer requisito for false, && devolve false. A e B são independentes, mas C depende dos dois e D depende de C.', 'common_trap': '|| autorizaria com apenas um requisito. Retirar um bloco obrigatório exige restaurar a montagem.', 'why_it_matters': 'Uma regra de autorização precisa exigir todos os requisitos, incluindo a borda em que saldo e valor são iguais.'},
        first_response=('Uma lista ordenada dos blocos e uma frase dizendo por que cada condição obrigatória precisa ser '
         'combinada com a outra.'),
        first_response_timing='Após estudar a regra e o exemplo resolvido, antes de executar a solução própria.',
        interaction='Montagem de A/B/C/D com botões de teclado e retirada do distrator. Prévia de código somente leitura; conferir exige levar uma montagem válida ao editor.',
        resources=('Starter disponível no cartão: material.md.',
         'Lista textual dos requisitos de saldo e conta ativa ao lado da área de montagem.',
         'Execução e feedback textuais sobre cada condição depois do envio.',
         'Documentação oficial: MDN logical AND: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND'),
        review={'prompt': 'Quando saldo suficiente e conta ativa são requisitos simultâneos, que operador combina '
                   'os resultados?',
         'choices': ('Use `&&`: a validação só é true se as duas condições forem true.',
                     'Use `||`: basta saldo suficiente ou conta ativa, porque qualquer condição válida '
                     'autoriza o pedido.',
                     'Use `!` para inverter cada condição e aceite o pedido sempre que uma delas for '
                     'false.'),
         'answer': 'Use `&&`: a validação só é true se as duas condições forem true.',
         'feedback_correct': 'Correto. A regra pede ambas as condições; conjunção impede autorização '
                             'quando qualquer uma falha.',
         'feedback_incorrect': 'Observe a palavra “e”. Uma condição alternativa não garante que os dois '
                               'requisitos estejam satisfeitos ao mesmo tempo.'},
        transfer_prompt=('Defina quando uma reserva de sala pode ser confirmada: a cobrança foi recebida e a sala está '
         'disponível. Escreva a condição e explique por que ambos os requisitos precisam valer.'),
    ),
    '02.04': E(
        'coercion.number_validation',
        'main.js: const texto = "12";\nconst vazio = false;\nconst numero = /* complete */;\nconst invalido = /* complete */;\nconsole.log(invalido);',
        '"12" -> invalido false; "0" -> false; "" com vazio=true -> true; "abc" -> true',
        '"NaN" -> true; "Infinity" -> true porque Number("Infinity") não é finito; 1e309 -> true; espaços com vazio=true -> true',
        'Usar isNaN global que converte entrada implicitamente ou aceitar vazio como zero.',
        'Aceitar Infinity como quantidade válida ou tratar vazio como zero, embora o contrato exija um número finito e preserve a flag de ausência.',
        'O site já forneceu vazio; depois da conversão, o número é finito? Zero continua válido quando o campo não está vazio.',
        ('Use a flag vazio declarada na fixture.', 'Converta com Number(texto); isNaN sozinho não rejeita Infinity.', 'Um valor é inválido quando está vazio ou não é finito: vazio || !Number.isFinite(numero).'),
        'const numero=Number(texto); const invalido=vazio || !Number.isFinite(numero). Number("Infinity") e 1e309 resultam em Infinity e são inválidos porque o contrato exige valor finito; vazio continua distinto do número 0.',
        "Marcar quantidade '0' como válida e 'x' como inválida -> false e true",
        prompt=('Preveja `numero` e `invalido` para cada entrada pública, incluindo a flag `vazio`. O contrato '
         'aceita apenas números finitos: `Number("Infinity")` e `1e309` produzem Infinity e são inválidos. '
         'Um campo vazio é inválido pela flag; o texto "0" com `vazio=false` continua válido. Depois '
         'preencha somente as duas lacunas do starter e explique a validação.'),
        kind='FADED',
        requires=('operators.boolean_validation',),
        secondary=('number.model',),
        constraints=('As fixtures substituem apenas os literais texto e vazio declarados no arquivo. texto é string; '
         'vazio é boolean e vale true para texto vazio ou só espaços. Não há identificadores injetados.',
         'O contrato exige finitude. Number.isNaN detecta somente NaN; Number.isFinite também rejeita '
         'Infinity e -Infinity. Não exigir if, throw ou funções.'),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        estimated=15,
        load={'novelty': 2,
         'syntax': 3,
         'composition': 3,
         'state': 2,
         'debugging': 1,
         'files': 1,
         'reading': 4,
         'independence': 3,
         'tools': 2},
        docs=('MDN Number: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number; '
         'Number.isFinite: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite'),
        assets=(),
        rubric=(),
        next_ids=(),
        optional=False,
        title=None,
        content_version=3,
        explanation={'mental_model': 'Number(texto) converte texto em número. Number.isFinite(numero) responde se é um número finito; Number.isNaN só identifica NaN. A flag vazio já vem da entrada e vale true para campo vazio ou só espaços.', 'worked_example': 'const texto = "42.5";\nconst vazio = false;\nconst numero = Number(texto);\nconst invalido = vazio || !Number.isFinite(numero);\nconsole.log(numero, invalido);\n"42.5" vira 42.5; é finito. !true é false e false || false resulta em invalido=false. Number("") produz 0, mas vazio=true torna a entrada inválida. Já o texto "0" com vazio=false representa zero válido. "abc" vira NaN e "Infinity" vira Infinity: ambos são rejeitados por isFinite. Complete apenas as duas expressões ausentes.', 'common_trap': 'Number.isNaN(Infinity) é false. Usar só isNaN deixaria infinitos passarem.', 'why_it_matters': 'Separar conversão e validade evita tratar um campo vazio como zero legítimo ou aceitar Infinity.'},
        first_response='Uma tabela de entrada → numero → invalido para os casos públicos, antes de preencher o código.',
        first_response_timing='Após estudar a regra e o exemplo resolvido, antes de executar a solução própria.',
        interaction='Previsão textual de numero e invalido por caso, seguida de duas lacunas rotuladas e prévia de código somente leitura.',
        resources=('Starter disponível no cartão: main.js.',
         'Casos públicos em tabela textual com previsão independente da execução.',
         'Painel de resultado distingue conversão numérica e validade da entrada.',
         'Documentação oficial: MDN Number: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number; '
         'Number.isFinite: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite'),
        review={'prompt': 'Por que `Number(texto)` não basta para decidir se uma entrada de formulário é válida?',
         'choices': ('A conversão pode produzir um número que ainda precisa ser finito, e a flag de campo '
                     'vazio informa uma ausência que não se deve confundir com zero.',
                     '`Number` rejeita automaticamente toda string vazia e toda palavra, então uma '
                     'validação adicional não acrescenta informação.',
                     'Qualquer resultado de Number é válido; NaN e Infinity representam quantidades que '
                     'devem ser aceitas como zero.'),
         'answer': 'A conversão pode produzir um número que ainda precisa ser finito, e a flag de campo '
                   'vazio informa uma ausência que não se deve confundir com zero.',
         'feedback_correct': 'Correto. Converter fornece um valor, mas a flag e a finitude determinam se '
                             'esse valor atende à regra da entrada.',
         'feedback_incorrect': 'Separe parsing da validação. `Number("")` pode virar zero; a flag vazio e '
                               'Number.isFinite preservam as distinções do contrato.'},
        transfer_prompt=('Valide a quantidade textual "0" e o texto "x", ambos com a flag de campo vazio em false; '
         'registre o valor convertido e a decisão de validade antes de executar.'),
    ),
    '02.05': E(
        'coercion.explicit',
        'main.js: const quantidade = "3";\nconst preco = "10";\nconst quantidadeVazia = false;\nconst precoVazio = false;\nconst total = quantidade * preco;\nconst etiqueta = total + " reais";\nconsole.log(total, etiqueta);',
        'quantidade="3",preco="10",flags=false -> entradaValida=true, total=30, etiqueta="30 reais"; quantidade="0",preco="10",flags=false -> entradaValida=true, total=0, etiqueta="0 reais"; quantidade="",quantidadeVazia=true,preco="10",precoVazio=false -> entradaValida=false, total=0, etiqueta="0 reais"; quantidade="3",preco="x",flags=false -> entradaValida=false, total=NaN, etiqueta="NaN reais"; quantidade="3",preco="Infinity",flags=false -> entradaValida=false, total=Infinity, etiqueta="Infinity reais"',
        'quantidade="   ",quantidadeVazia=true,preco="10",precoVazio=false -> entradaValida=false, total=0, etiqueta="0 reais"; quantidade="3",preco="NaN",flags=false -> entradaValida=false, total=NaN, etiqueta="NaN reais"',
        'Achar que coerção implícita acidental expressa claramente a intenção do domínio.',
        'O código produz número por conversão escondida ou aceita entrada vazia sem decisão.',
        'Onde o dado externo vira número e onde o número vira texto de apresentação?',
        ('Separe conversão, detecção de validade e cálculo.', 'Combine flags de vazio e Number.isFinite nos dois números.', 'Para texto "4" e preço "2", calcule com Number e só depois formate com String.'),
        'const quantidadeNumero=Number(quantidade); const precoNumero=Number(preco); const entradaValida=!quantidadeVazia && !precoVazio && Number.isFinite(quantidadeNumero) && Number.isFinite(precoNumero); const total=quantidadeNumero*precoNumero; const etiqueta=String(total)+" reais"; console.log(entradaValida,total,etiqueta); Para entradas inválidas, só detectar: o cálculo diagnóstico permanece observável; não emitir erros nem bloquear execução ainda.',
        'Quantidade "6", preço "2.25", flags de vazio false -> entradaValida=true,total=13.5,etiqueta="13.5 reais"',
        prompt=('Refatore a multiplicação usando Number() em cada entrada e String() na apresentação. Declare '
         'entradaValida combinando flags de vazio e finitude. Exiba entradaValida, total e etiqueta. Aqui '
         'você apenas detecta entrada inválida: o cálculo continua e seus resultados diagnósticos estão '
         'nos casos públicos. Rejeição com if e mensagens de erro será ensinada depois. Não é exigido '
         'Boolean().'),
        kind='MODIFY',
        requires=('coercion.number_validation',),
        secondary=(),
        constraints=('Fixtures substituem apenas os quatro literais declarados. quantidade e preco são strings; '
         'quantidadeVazia e precoVazio são booleanos verdadeiros para campos vazios ou só espaços.',
         'Não lançar erros ou usar if; entradaValida é o comportamento de detecção. total e etiqueta são '
         'calculados mesmo quando entradaValida=false.'),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        estimated=17,
        load={'novelty': 2,
         'syntax': 3,
         'composition': 3,
         'state': 2,
         'debugging': 1,
         'files': 1,
         'reading': 3,
         'independence': 3,
         'tools': 2},
        docs=('MDN Number: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number; '
         'addition operator: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Addition'),
        assets=(),
        rubric=(),
        next_ids=(),
        optional=False,
        title=None,
        content_version=3,
        explanation={'mental_model': 'Separe três decisões: converter as duas entradas, detectar validade e apresentar o cálculo como texto. Nesta prática, entradaValida sinaliza um problema; ainda não há if nem rejeição de entrada.', 'worked_example': 'const unidades = "4";\nconst valor = "2.5";\nconst unidadesVazias = false;\nconst valorVazio = false;\nconst unidadesNumero = Number(unidades);\nconst valorNumero = Number(valor);\nconst valida = !unidadesVazias && !valorVazio && Number.isFinite(unidadesNumero) && Number.isFinite(valorNumero);\nconst soma = unidadesNumero * valorNumero;\nconsole.log(valida, soma, String(soma) + " reais");\nAs conversões produzem 4 e 2.5. As flags são false e os dois números são finitos, então valida=true. 4 * 2.5 vale 10. String(10) vira "10"; a apresentação é "10 reais". Com entrada vazia, o cálculo diagnóstico pode ser zero e a validade continua false. Isso não autoriza uma compra.', 'common_trap': 'A multiplicação converte strings implicitamente; aqui use Number nas duas entradas e String na apresentação para deixar a intenção explícita.', 'why_it_matters': 'Conversões explícitas tornam visível a passagem de texto recebido a cálculo numérico e apresentação, sem confundir diagnóstico com autorização.'},
        first_response=('O fluxo texto → números → entradaValida → total → etiqueta, com previsão das saídas válidas e '
         'inválidas antes da edição.'),
        first_response_timing='Após estudar a regra e o exemplo resolvido, antes de executar a solução própria.',
        interaction='Editor com entradas declaradas e tabela de casos após execução: validade, total numérico e etiqueta textual. Exemplo resolve conversão, detecção e apresentação passo a passo.',
        resources=('Starter disponível no cartão: main.js.',
         'Mapa textual de parsing/cálculo/exibição com espaço para anotar o tipo em cada etapa.',
         'Casos públicos e saída textual após execução; sem asset externo.',
         'Documentação oficial: MDN Number: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number; '
         'addition operator: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Addition'),
        review={'prompt': 'Em que ordem uma entrada textual deve virar um valor calculado e uma apresentação?',
         'choices': ('Converta o texto, detecte validade, calcule os resultados diagnósticos e só então '
                     'formate a saída.',
                     'Concatene a entrada e a unidade primeiro; deixe a coerção implícita decidir como '
                     'multiplicar a string.',
                     'Formate a entrada como moeda antes de calcular e faça a função de domínio retornar '
                     'esse texto localizado.'),
         'answer': 'Converta o texto, detecte validade, calcule os resultados diagnósticos e só então '
                   'formate a saída.',
         'feedback_correct': 'Conversão, detecção, cálculo e apresentação têm papéis separados. Entrada '
                             'inválida é marcada como false; rejeição com if vem depois.',
         'feedback_incorrect': 'Confira os tipos em cada fronteira. Coerção implícita e formatação '
                               'antecipada escondem a intenção e podem impedir cálculos posteriores.'},
        transfer_prompt=('Refatore uma tarifa de quantidade "6" e preço "2.25", ambos não vazios. Exiba validade, total e '
         'etiqueta, separando conversão e apresentação.'),
    ),
    '02.06': E(
        'operators.nullish_fallback',
        'main.js: const volumeEntrada = 0;\nconst volume = volumeEntrada || 50;\nconsole.log(volume);',
        'volume=0 -> 0 após correção com ??; volume=null/undefined -> 50',
        'volume=false -> false preservado pelo operador ??, mas UI de volume deve validar tipo em etapa posterior',
        'Substituir zero explícito por default.',
        'O teste com volume 0 retorna 50.',
        'Zero significa ausência ou uma escolha legítima?',
        ('Compare || e ?? com 0.', 'Use fallback apenas para null/undefined.', '0??50 é 0; null??50 é 50.'),
        'const volume = volumeEntrada ?? 50; em exercício posterior, validar faixa e tipo separadamente.',
        'Corrigir brilho 0 substituído por 80 -> brilho 0 preservado, null usa 80',
        prompt=('Execute o starter sem mudanças e registre qual valor configurado desaparece no fallback. Corrija '
         'usando a distinção nullish apropriada, teste a ausência separadamente e explique por que a '
         'validação de tipo fica fora desta etapa.'),
        kind='DEBUG',
        requires=('operators.falsy_nullish',),
        secondary=(),
        constraints=('Altere somente o literal volumeEntrada entre casos. O domínio desta atividade inclui number, '
         'false, null e undefined; validação de volume pertence a uma etapa posterior.',),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        estimated=10,
        load={'novelty': 2,
         'syntax': 2,
         'composition': 2,
         'state': 2,
         'debugging': 4,
         'files': 1,
         'reading': 3,
         'independence': 3,
         'tools': 2},
        docs=('MDN nullish coalescing: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing'),
        assets=(),
        rubric=(),
        next_ids=(),
        optional=False,
        title=None,
        content_version=3,
        explanation={'mental_model': 'Depurar é observar uma saída que contradiz a regra, localizar a causa e conferir a correção. Volume zero é uma escolha explícita; o padrão 50 deve servir apenas para ausência.', 'worked_example': 'const limiteEntrada = 0;\nconsole.log(limiteEntrada || 3);\nconsole.log(limiteEntrada ?? 3);\n|| trata zero como falsy e mostra 3. ?? preserva zero. Execute o código original da atividade: ele mostra 50 com volumeEntrada=0. Depois registre sua previsão, corrija o operador e compare todos os casos.', 'common_trap': 'Trocar somente o número 50 por 0 não resolve os casos de null e undefined.', 'why_it_matters': 'Observar a contradição, localizar o operador e testar as ausências ensina a corrigir a causa de um erro de fallback.'},
        first_response=('O valor inicial observado, a previsão para um valor presente e a previsão para ausência, antes '
         'de alterar a expressão.'),
        first_response_timing='Após estudar a regra e o exemplo resolvido, antes de executar a solução própria.',
        interaction='Código original visível e executável antes da previsão. Depois, editor para correção e tabela comparativa dos casos; explicação da causa ao concluir.',
        resources=('Starter disponível no cartão: main.js.',
         'Painel textual para registrar valor presente versus ausência e comparar execuções.',
         'Explicação integrada diferencia seleção de default e validação posterior.',
         'Documentação oficial: MDN nullish coalescing: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing'),
        review={'prompt': 'Quando um default só deve substituir uma configuração ausente, qual regra preserva uma '
                   'escolha numérica igual a zero?',
         'choices': ('Use `??`, que mantém zero e usa o valor padrão somente para null ou undefined.',
                     'Use `||`, pois zero é falsy e portanto sempre deve significar ausência.',
                     'Use `??` e trate o resultado como automaticamente válido para qualquer faixa e tipo '
                     'de configuração.'),
         'answer': 'Use `??`, que mantém zero e usa o valor padrão somente para null ou undefined.',
         'feedback_correct': 'Correto. Nullish fallback escolhe um default para ausência; ele não '
                             'transforma zero em ausência nem valida a regra de domínio.',
         'feedback_incorrect': 'Compare o critério de cada operador. `||` substitui zero; `??` preserva '
                               'zero. Validação de faixa e tipo é uma checagem separada.'},
        transfer_prompt=('Investigue um contador de novas tentativas cujo fallback é 5 e que perde a escolha explícita 0; '
         'corrija a regra e compare com o caso ausente.'),
    ),
    '02.07': E(
        'operators.discount_expression',
        'main.js: const preco = 100;\nconst taxa = 0.2;\n// Escreva o cálculo do total e exiba-o com console.log.',
        'preço=100,taxa=0.2 -> total=80; preço=50,taxa=0 -> total=50',
        'preco=0,taxa=0.5 -> 0; preco=100,taxa=1 -> 0',
        'Aplicar taxa como valor absoluto ou somá-la ao preço.',
        'Desconto de 20% em 100 produz 20 ou 120 em vez de 80.',
        'Que fração do preço permanece depois de descontar taxa?',
        ('A fração restante é 1 - taxa.', 'Multiplique o preço pela fração restante.', 'Se taxa=0, o resultado deve ser o preço original.'),
        'const total = preco * (1 - taxa); console.log(total); As fixtures garantem preço finito não negativo e taxa finita em 0..1; não existe validação oculta no starter.',
        'Calcular valor após taxa de 10% em frete 40 -> 36',
        prompt=('Com preco finito não negativo e taxa finita entre 0 e 1, escreva o cálculo do total e exiba-o. O '
         'starter fornece apenas as entradas; você declara o resultado. Não implemente validação, if ou '
         'funções. Entradas fora desse domínio não são avaliadas aqui.'),
        kind='MAKE',
        requires=('operators.arithmetic',),
        secondary=(),
        constraints=('Fixtures alteram apenas preco e taxa declarados; preço >= 0 e taxa em [0,1], ambos finitos. Não '
         'há validação fornecida e nenhuma rejeição é exigida.',),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        estimated=12,
        load={'novelty': 2,
         'syntax': 3,
         'composition': 2,
         'state': 1,
         'debugging': 1,
         'files': 1,
         'reading': 2,
         'independence': 3,
         'tools': 2},
        docs=('MDN multiplication operator: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Multiplication'),
        assets=(),
        rubric=(),
        next_ids=(),
        optional=False,
        title=None,
        content_version=3,
        explanation={'mental_model': 'Uma taxa é uma fração: 25% corresponde a 25 / 100 = 0.25. Um desconto de 25% deixa 75% do preço. O domínio fornecido já garante preço finito não negativo e taxa entre 0 e 1.', 'worked_example': 'const valor = 84;\nconst desconto = 0.25;\nconst fracaoRestante = 1 - desconto;\nconst final = valor * fracaoRestante;\nconsole.log(final);\n1 - 0.25 vale 0.75. Multiplique 84 por 0.75: o resultado é 63. Sem desconto, taxa=0 deixa a fração 1. Desconto integral, taxa=1, deixa a fração 0. Escreva sua regra no binding total.', 'common_trap': 'preco * taxa calcula o desconto, não o preço final. Não use 20 para representar 20%.', 'why_it_matters': 'Transformar uma porcentagem em fração e testar os extremos permite transferir a fórmula para preços diferentes.'},
        first_response=('A expressão JavaScript que calcula o total depois do desconto e a anotação da fração que '
         'permanece.'),
        first_response_timing='Após estudar a regra e o exemplo resolvido, antes de executar a solução própria.',
        interaction='Editor a partir das entradas e comentários, sem fórmula pronta no starter. Exemplo paralelo explica taxa e fração restante; casos incluem preço zero e desconto integral.',
        resources=('Starter disponível no cartão: main.js.',
         'Exemplo paralelo de preço 84 e taxa 25% na explicação.',
         'Casos públicos exibidos como entrada/total e painel de saída após execução.',
         'Documentação oficial: MDN multiplication operator: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Multiplication'),
        review={'prompt': 'Se `taxa` representa a fração removida do preço, qual expressão produz o total '
                   'restante?',
         'choices': ('`preco * (1 - taxa)`, porque `1 - taxa` é a proporção que permanece.',
                     '`preco * taxa`, porque a fração removida é também o total final a pagar.',
                     '`preco + taxa`, porque a taxa é um valor monetário fixo que sempre se soma ao '
                     'preço.'),
         'answer': '`preco * (1 - taxa)`, porque `1 - taxa` é a proporção que permanece.',
         'feedback_correct': 'Correto. A subtração encontra a fração remanescente; multiplicá-la pelo '
                             'preço aplica o desconto.',
         'feedback_incorrect': 'Identifique primeiro se está calculando a parte removida ou a parte '
                               'restante. O contrato pede o total após o desconto, não o desconto em si.'},
        transfer_prompt=('Calcule o total de um frete de 40 após aplicar a taxa de 10% já validada. Antes de executar, '
         'escreva a expressão que usa a fração do preço que permanece.'),
    ),
    '02.08': E(
        'operators.preferences',
        'main.js: const volumeEntrada = 0;\nconst temaEntrada = "";\nconst notificacoesEntrada = false;\nconst volume = volumeEntrada || 50;\nconst tema = temaEntrada || "claro";\nconst notificacoes = notificacoesEntrada || true;\nconsole.log(volume, tema, notificacoes);',
        'Escolhas falsy válidas: volumeEntrada=0,temaEntrada="",notificacoesEntrada=false -> 0,"",false; Três ausências: volumeEntrada=null,temaEntrada=undefined,notificacoesEntrada=null -> 50,"claro",true; Escolhas presentes: volumeEntrada=20,temaEntrada="escuro",notificacoesEntrada=true -> 20,"escuro",true; Ausência só no volume: volumeEntrada=undefined,temaEntrada="escuro",notificacoesEntrada=false -> 50,"escuro",false; Ausência só no tema: volumeEntrada=10,temaEntrada=null,notificacoesEntrada=true -> 10,"claro",true',
        'entradas null,undefined,null -> 50,"claro",true',
        'Aplicar || a preferências falsy que têm significado.',
        'Ao carregar preferências, zero, vazio ou false são apagados.',
        'Quais campos podem ser falsy por escolha do usuário?',
        ('Teste o objeto com todas as escolhas falsy.', 'Troque fallback de ausência por ??.', 'Validação de tipo é regra separada da escolha de default.'),
        'Use ?? nos três campos; preserve 0, string vazia e false. O contrato aceita vazio como tema personalizado nesta atividade.',
        'Preservar modo silencioso=false e brilho=0 em app de leitura -> ambos mantidos',
        prompt=('Corrija o fallback das três preferências. Antes de editar, registre quais valores falsy são '
         'escolhas válidas; depois preserve-os sem misturar fallback de ausência com validação de tipo.'),
        kind='TRANSFER',
        requires=('operators.nullish_fallback',),
        secondary=(),
        constraints=('Fixtures substituem apenas os três literais de entrada. Zero, false e "" são escolhas aceitas; '
         'null/undefined significam ausência. String vazia aparece como "" na tabela.',),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        estimated=16,
        load={'novelty': 2,
         'syntax': 3,
         'composition': 3,
         'state': 2,
         'debugging': 2,
         'files': 1,
         'reading': 3,
         'independence': 3,
         'tools': 2},
        docs=('MDN nullish coalescing: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing'),
        assets=(),
        rubric=(),
        next_ids=(),
        optional=False,
        title=None,
        content_version=3,
        explanation={'mental_model': 'Aplique a regra de ausência a cada preferência, de forma independente. Nesta atividade, 0, false e "" são escolhas aceitas, e qualquer outro valor presente também deve permanecer.', 'worked_example': 'const tentativasEntrada = 0;\nconst avisoEntrada = null;\nconst tentativas = tentativasEntrada ?? 3;\nconst aviso = avisoEntrada ?? false;\nconsole.log(tentativas, aviso);\ntentativas mantém 0; aviso recebe false porque sua entrada é null. Transfira essa regra para volume, tema e notificacoes. Observe os casos em que apenas uma preferência está ausente.', 'common_trap': 'Não grave sempre os valores do primeiro caso. Um tema "escuro" precisa continuar "escuro".', 'why_it_matters': 'Aplicar a mesma política em outro domínio demonstra que ausência não significa zero, falso ou texto vazio.'},
        first_response=('Uma tabela com os três valores recebidos, se cada um é escolha válida ou ausência, e qual '
         'fallback deve ser aplicado.'),
        first_response_timing='Após estudar a regra e o exemplo resolvido, antes de executar a solução própria.',
        interaction='Editor e tabela de preferências após executar. Casos cobrem falsy válidos, escolhas presentes e ausências independentes.',
        resources=('Starter disponível no cartão: main.js.',
         'Tabela textual para registrar se o valor é escolha ou ausência antes do patch.',
         'Saída de cada preferência no painel após execução; nenhum asset externo.',
         'Documentação oficial: MDN nullish coalescing: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing'),
        review={'prompt': 'Que operador preserva escolhas falsy quando o default só deve atuar para ausência?',
         'choices': ('Use `??` nos campos cujos valores 0, string vazia ou false são escolhas válidas; '
                     'valide tipo e domínio separadamente.',
                     'Use `||` em todos os campos, porque qualquer valor falsy representa que o usuário '
                     'não fez escolha.',
                     'Use `??` e dispense qualquer validação: valores diferentes de null e undefined são '
                     'sempre válidos para o produto.'),
         'answer': 'Use `??` nos campos cujos valores 0, string vazia ou false são escolhas válidas; '
                   'valide tipo e domínio separadamente.',
         'feedback_correct': 'Correto. Nullish fallback preserva escolhas falsy; a validação continua '
                             'responsável por tipos e regras do domínio.',
         'feedback_incorrect': 'Confirme a semântica do campo antes do fallback. `||` troca valores falsy '
                               'válidos, e `??` não substitui a validação de produto.'},
        transfer_prompt=('Revise defaults de um player com volume 0, repetição false e legenda vazia; determine quando '
         'cada campo deve receber um padrão.'),
    ),
    '02.09': E(
        'operators.scoreboard',
        'main.js: const aEntrada = 0;\nconst bEntrada = 5;\n// Declare a e b com padrão 0 para ausência, calcule total e exiba a, b, total.',
        'Zero e cinco: aEntrada=0,bEntrada=5 -> 0,5,5; Ambos ausentes: aEntrada=undefined,bEntrada=undefined -> 0,0,0; Null e zero: aEntrada=null,bEntrada=0 -> 0,0,0; Três e ausência: aEntrada=3,bEntrada=undefined -> 3,0,3; Dois placares presentes: aEntrada=7,bEntrada=2 -> 7,2,9',
        'aEntrada=null,bEntrada=0 -> 0,0,0; aEntrada=3,bEntrada=undefined -> 3,0,3',
        'Somar entradas opcionais diretamente e propagar NaN quando uma delas é undefined.',
        'Uma entrada undefined faz a soma virar NaN em vez de usar zero.',
        'Você distingue ausência de valor zero?',
        ('Use ?? para ausência.', 'Não substitua zero por default.', 'Some os dois valores após aplicar o fallback.'),
        'const a=aEntrada??0; const b=bEntrada??0; const total=a+b; a validação de entradas externas vem após controle de fluxo.',
        'Placar de duas equipes com um campo ausente e outro zero -> total zero sem NaN',
        prompt=('Construa um placar de duas equipes que aplique o default a campos ausentes e some os valores. '
         'Antes de codificar, escreva os dois valores usados e a estratégia para ausência; depois rode os '
         'casos públicos.'),
        kind='TRANSFER',
        requires=('operators.arithmetic', 'operators.preferences'),
        secondary=(),
        constraints=('As fixtures substituem apenas aEntrada e bEntrada. Cada entrada é um Number finito não negativo, '
         'null ou undefined. Parsing de strings e rejeição de dados externos não fazem parte deste '
         'checkpoint.',),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        estimated=10,
        load={'novelty': 1,
         'syntax': 2,
         'composition': 2,
         'state': 1,
         'debugging': 1,
         'files': 1,
         'reading': 2,
         'independence': 3,
         'tools': 1},
        docs=('MDN nullish coalescing: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing; '
         'addition operator: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Addition'),
        assets=(),
        rubric=(),
        next_ids=(),
        optional=False,
        title='Checkpoint: placar com entradas opcionais',
        content_version=3,
        explanation={'mental_model': 'Checkpoint: normalize cada placar ausente para 0 e some os dois números. As entradas são números finitos não negativos, null ou undefined. Retome 02.02 e 02.08 se precisar; tente escrever sem abrir dicas.', 'worked_example': 'const pontos = 13;\nconst visitante = null;\nconsole.log(pontos + (visitante ?? 0));\nvisitante é null e recebe 0; pontos continua 13. A soma é 13. Na sua solução, declare a e b separadamente antes de total. Escolha casos que distingam zero presente, ausência e dois placares presentes.', 'common_trap': 'Não converta texto: este checkpoint não recebe strings. Na próxima etapa, uma condição como total >= 10 poderá escolher um caminho; aqui você aprende a calculá-la.', 'why_it_matters': 'Combinar normalização e soma consolida operadores antes de usar condições para controlar o fluxo na Etapa 03.'},
        first_response=('Um plano curto de normalização dos dois campos e a primeira expressão/implementação que produz o '
         'total.'),
        first_response_timing='Após estudar a regra e o exemplo resolvido, antes de executar a solução própria.',
        interaction='Checkpoint com previsão textual e editor único. Casos públicos cobrem ausência, zero e dois placares presentes; tente resolver sem dicas.',
        resources=('Starter disponível no cartão: main.js.',
         'Tabela textual de campo recebido → valor usado → total.',
         'Saída de cada caso público em transcrição acessível após execução.',
         'Documentação oficial: MDN nullish coalescing: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing; '
         'addition operator: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Addition'),
        review={'prompt': 'Em que ordem normalizar entradas opcionais para montar um placar sem trocar um zero '
                   'válido por default?',
         'choices': ('Aplique `?? 0` a cada entrada ausente, preserve os valores presentes e depois some '
                     'os dois números normalizados.',
                     'Some aEntrada e bEntrada diretamente, pois undefined participa da soma como zero.',
                     'Some os campos primeiro e troque NaN por zero ao final, sem definir a política por '
                     'entrada.'),
         'answer': 'Aplique `?? 0` a cada entrada ausente, preserve os valores presentes e depois some os '
                   'dois números normalizados.',
         'feedback_correct': 'Correto. A política por campo explicita a ausência; aplicar o default antes '
                             'da soma preserva zero e evita propagar undefined.',
         'feedback_incorrect': 'Normalize antes de somar: undefined não é zero na soma e null/undefined '
                               'devem receber o padrão por campo. || 0 dá o mesmo resultado para este '
                               'domínio, mas não explica a política nullish.'},
        transfer_prompt=('Monte o saldo de duas cotas de orçamento: uma contribuição explícita é zero e a outra está '
         'ausente. Defina o padrão só para a ausência antes de somar.'),
    ),
    '02.10': E(
        'math.rounding',
        'main.js: const segundos = 89;\nconst segundosNegativos = -89;\nconsole.log(Math.floor(segundos / 60));\n// Complete ceil, round e trunc; depois as quatro operações para segundosNegativos.\nconst x = 3;\nconst y = 5;\nconst deslocamento = -3;\n// Exiba min(x,y), max(x,y) e abs(deslocamento).\nconst sorteio = Math.random();\n// Declare face usando sorteio para gerar um inteiro de 1 a 6 e exiba sorteio, face.',
        's=89 -> floor 1, ceil 2, round 1, trunc 1; s=-89 -> floor -2, ceil -1, round -1, trunc -1; x=3,y=5,deslocamento=-3 -> min 3,max 5,abs 3; sorteio=0 -> face 1; sorteio=0.5 -> face 4; sorteio=0.9999999999999999 -> face 6',
        's=30 -> round 1; s=-30 -> round -0 (curiosidade opcional); x=-2,y=7,deslocamento=4 -> min -2,max 7,abs 4; sorteio=0.25 -> face 2',
        'Tratar floor e trunc como equivalentes para negativos.',
        'Com -89 segundos, o resultado de floor foi -1.',
        'Qual operação arredonda em direção a -Infinity e qual apenas remove a fração?',
        ('Compare arredondamentos para números negativos.', 'Use min/max para extremos e abs para magnitude.', 'Para sortear 1 a 4, Math.floor(sorteio * 4) + 1 transforma [0,1) em inteiros 1..4.'),
        'Complete floor/ceil/round/trunc para ambos os quocientes e console.log(Math.min(x,y),Math.max(x,y),Math.abs(deslocamento)). const face=Math.floor(sorteio*6)+1; console.log(sorteio,face). Não compare uma execução aleatória com uma saída exata; confira 0<=sorteio && sorteio<1 e face inteira em 1..6. As fixtures determinísticas testam a transformação nos extremos.',
        'Dado de quatro faces: sorteio 0 e 0.9999999999999999 -> faces 1 e 4; paginação de 15 itens com 7 por página -> 3',
        prompt=('Bloco A: preveja e complete floor/ceil/round/trunc para 89/60 e -89/60. Bloco B: escreva '
         'min(x,y), max(x,y) e abs(deslocamento). Bloco C: execute Math.random(), explique 0 <= sorteio < '
         '1 e escreva a transformação para um dado de 1 a 6. Teste também sorteio 0, 0.5 e '
         '0.9999999999999999, substituindo somente a inicialização. Não espere uma saída aleatória fixa. '
         'Math.random não serve a senhas ou tokens. Curiosidade opcional: Math.round(-0.5) retorna -0.'),
        kind='MODIFY',
        requires=('operators.arithmetic', 'coercion.number_validation'),
        secondary=('math.basic', 'math.random'),
        constraints=('Fixtures alteram apenas segundos, segundosNegativos, x, y e deslocamento; são números finitos. '
         'Para o sorteio, substituem Math.random() por literais no intervalo [0,1).',
         'Avalie o intervalo da saída aleatória e os casos determinísticos da fórmula; nunca exija um '
         'sorteio específico. A distinção de -0 é opcional.'),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        estimated=28,
        load={'novelty': 2,
         'syntax': 3,
         'composition': 3,
         'state': 2,
         'debugging': 1,
         'files': 1,
         'reading': 4,
         'independence': 3,
         'tools': 2},
        docs=('MDN Math methods: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math'),
        assets=(),
        rubric=(),
        next_ids=(),
        optional=False,
        title='Math: arredondamento, utilitários e sorteios',
        content_version=3,
        explanation={'mental_model': 'Math é um conjunto de ferramentas numéricas. A chamada Math.floor(x) recebe um número e devolve outro: floor vai ao inteiro abaixo, ceil ao inteiro acima, trunc remove a parte fracionária e round escolhe o inteiro mais próximo (empates vão em direção a +Infinity). Math.min(a,b) devolve o menor argumento e Math.max(a,b) o maior. Math.abs(x) mede magnitude: a distância até zero, sem sinal. Math.random() não recebe argumentos e gera um número em [0,1): inclui zero e exclui um. Para N faces, multiplique por N, tire a parte fracionária com floor e some 1.', 'worked_example': 'const minutos = 149 / 60;\nconsole.log(Math.floor(minutos), Math.ceil(minutos), Math.round(minutos), Math.trunc(minutos));\nconsole.log(Math.floor(-1.8), Math.trunc(-1.8));\n149 / 60 é aproximadamente 2.483: floor=2, ceil=3, round=2 e trunc=2. Para -1.8, o inteiro abaixo é -2; remover a fração dá -1. Na atividade, compare as quatro regras para os dois sinais.\n\nconsole.log(Math.min(2, 8), Math.max(2, 8));\nconsole.log(Math.abs(-4));\nEntre 2 e 8, min=2 e max=8. A magnitude de -4 é 4. Use as entradas x, y e deslocamento para que a regra continue funcionando em cada caso.\n\nconst amostra = 0.5;\nconst faceDeQuatro = Math.floor(amostra * 4) + 1;\nconsole.log(amostra, faceDeQuatro);\nExemplo paralelo com quatro faces: 0.5 * 4 vale 2; floor(2) + 1 vale 3. Zero vira 1; valores perto de 1 viram 4. O exercício pede SEIS faces: adapte N para 6 e mantenha Math.random() no starter. Os casos substituem sorteio por números fixos para testar a regra. O botão de sorteio real pode mostrar qualquer amostra em [0,1), mas a face deve ser inteira de 1 a 6.', 'common_trap': 'Arredondar um número negativo não é simplesmente apagar o sinal. A distinção entre -0 e 0 é opcional neste bloco. abs não arredonda. Em -2 e 7, o menor é -2, mesmo com magnitude positiva. Multiplicar por quatro resolveria o exemplo, não a tarefa. Math.random não serve para senhas ou tokens.', 'why_it_matters': 'Escolher arredondamento e mapear intervalos evita erros de limites em medidas, contagens e sorteios.'},
        first_response=('Tabelas de arredondamento e utilitários; previsão do intervalo de sorteio e das faces para 0, '
         '0.5 e 0.9999999999999999 antes de executar cada bloco.'),
        first_response_timing='Após estudar a regra e o exemplo resolvido, antes de executar a solução própria.',
        interaction='Três blocos sequenciais com previsão de resultados, exemplos executáveis e tabelas de casos; sorteio real separado dos casos determinísticos.',
        resources=('Starter disponível no cartão: main.js.',
         'Blocos A: arredondamento; B: min/max/abs; C: sorteio e transformação de [0,1) para faces 1..6.',
         'Documentação oficial: MDN Math methods: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math'),
        review={'prompt': 'Qual fórmula transforma um sorteio x em [0,1) em faces inteiras de 1 a 6?',
         'choices': ('Math.floor(x * 6) + 1; inclui 1 e 6 e não serve para segredos.',
                     'Math.round(x * 6); gera apenas 1 a 6 com chances iguais.',
                     'Math.ceil(x * 6); sempre inclui 1 e nunca devolve 0.'),
         'answer': 'Math.floor(x * 6) + 1; inclui 1 e 6 e não serve para segredos.',
         'feedback_correct': 'Floor produz 0..5; somar 1 desloca a faixa para 1..6. Para segurança, '
                             'Math.random é inadequado.',
         'feedback_incorrect': 'Teste x=0 e x perto de 1. Round muda a distribuição; ceil(0) é 0.'},
        transfer_prompt=('Gere um inteiro de 1 a 4 usando um sorteio em [0,1). Explique as saídas para 0 e um valor perto '
         'de 1; depois escolha a operação para acomodar 15 itens em páginas de 7.'),
    ),
    '02.11': E(
        'number.ieee754',
        'main.js: // Bloco A: decimais e valores especiais\nconsole.log(0.5 + 0.25 === 0.75);\nconsole.log(0.1 + 0.2);\nconsole.log(0.1 + 0.2 === 0.3);\nconsole.log(Number.isNaN(NaN));\nconsole.log(Number.isFinite(Infinity));\n// Bloco B: inteiros seguros e BigInt\nconsole.log(Number.isSafeInteger(2 ** 53 - 1));\nconsole.log(Number.isSafeInteger(2 ** 53));\nconsole.log(typeof 1n);',
        'Bloco A -> true, 0.30000000000000004, false, true, false; Bloco B -> true, false, "bigint" (string)',
        '0.2+0.4===0.6 -> false; Number.isSafeInteger(-(2**53-1)) -> true; Object.is(-0,0) -> false (opcional)',
        'Supor que Number representa todo decimal/inteiro sem perda.',
        'O aluno prevê igualdade exata ou classifica 2**53 como inteiro seguro.',
        'Qual bloco avalia aproximação decimal e qual avalia inteiros seguros?',
        ('Compare um decimal binário exato (0.5) com outro aproximado (0.1).', 'NaN é inválido; Infinity não é finito. Inteiros seguros têm limite próprio.', 'BigInt é para inteiros; typeof 2n produz a string "bigint".'),
        'Bloco A: true,0.30000000000000004,false,true,false. Bloco B: true,false,"bigint". 0.5 e 0.25 são exatos; 0.1 e 0.2 são aproximados em binário. Inteiros seguros estão entre -(2**53-1) e 2**53-1. BigInt é para aritmética inteira, sem mistura implícita com Number.',
        'Prever 0.2+0.4===0.6 e segurança de 2**53-1 -> false, true',
        prompt=('Resolva e confira o bloco A antes de avançar: alguns decimais como 0.5 e 0.25 são exatos; 0.1 + '
         '0.2 é 0.30000000000000004 e sua igualdade com 0.3 é false. Distinga NaN de Infinity. Depois '
         'preveja o bloco B: inteiros seguros e typeof 1n. Explique onde BigInt ajuda e por que não '
         'resolve frações. -0 é uma curiosidade opcional.'),
        kind='PREDICT',
        requires=('number.model', 'operators.comparison'),
        secondary=('number.safe_integers',),
        constraints=(),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        estimated=22,
        load={'novelty': 4,
         'syntax': 2,
         'composition': 2,
         'state': 1,
         'debugging': 1,
         'files': 1,
         'reading': 4,
         'independence': 3,
         'tools': 2},
        docs=('MDN Number: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number; '
         'Number.isNaN: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN; '
         'Object.is: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is; '
         'BigInt: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt'),
        assets=(),
        rubric=(),
        next_ids=(),
        optional=False,
        title='Number não representa todo decimal exatamente',
        content_version=3,
        explanation={'mental_model': 'Number representa números em ponto flutuante binário. Frações como 0.5 e 0.25 têm representação exata; muitas outras são aproximações. Isso pode aparecer na soma e na igualdade estrita. Number.isSafeInteger(x) confirma que x é um inteiro dentro de -(2 ** 53 - 1) até 2 ** 53 - 1. Fora desse intervalo, Number pode perder diferenças entre inteiros. O sufixo n cria um BigInt.', 'worked_example': 'console.log(0.5 + 0.25 === 0.75);\nconsole.log(0.2 + 0.7, 0.2 + 0.7 === 0.9);\nconsole.log(Number.isNaN(NaN), Number.isFinite(Infinity));\nA primeira comparação é true. A segunda soma produz 0.8999999999999999 e a igualdade é false. O resultado é determinístico. NaN indica resultado numérico inválido; Infinity não é finito. Use os predicados explícitos para distingui-los.\n\nconsole.log(Number.isSafeInteger(9007199254740991));\nconsole.log(9007199254740992 === 9007199254740993);\nconsole.log(9007199254740992n + 1n);\nconsole.log(typeof 2n);\nO limite 9007199254740991 é seguro. Os dois Number da comparação seguinte acabam com a mesma representação: a igualdade dá true. BigInt preserva o inteiro seguinte: a soma dá 9007199254740993n e typeof devolve "bigint".', 'common_trap': 'Nem todo decimal é inexato. Não use a impressão arredondada como prova de igualdade. BigInt não representa frações; 1n + 1 mistura tipos e causa erro. Use operandos do mesmo tipo.', 'why_it_matters': 'O modelo numérico orienta a comparação de medidas e a escolha de tipos para inteiros grandes.'},
        first_response='Previsões separadas para blocos A e B, com valor e tipo, antes de executar cada bloco.',
        first_response_timing='Após estudar a regra e o exemplo resolvido, antes de executar a solução própria.',
        interaction='Duas tabelas sequenciais de valor e tipo: decimais/valores especiais, depois inteiros/BigInt. Exemplos resolvidos antes de prever.',
        resources=('Starter disponível no cartão: main.js.',
         'Blocos de previsão separados: A decimais/NaN/Infinity; B inteiros seguros/BigInt.',
         'Documentação oficial: MDN Number: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number; '
         'Number.isNaN: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN; '
         'Object.is: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is; '
         'BigInt: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt'),
        review={'prompt': 'Por que Number pode falhar numa comparação decimal exata e que tipo usar para inteiros '
                   'além da precisão segura?',
         'choices': ('Number é binário e aproxima muitos decimais; BigInt permite aritmética inteira '
                     'precisa, mas precisa ser usado sem misturar implicitamente com Number.',
                     'Number armazena todos os decimais exatamente; uma comparação false só pode '
                     'significar que o operador === está quebrado.',
                     'BigInt é uma forma de Number com decimais exatos e pode ser somado diretamente a '
                     'qualquer Number.'),
         'answer': 'Number é binário e aproxima muitos decimais; BigInt permite aritmética inteira '
                   'precisa, mas precisa ser usado sem misturar implicitamente com Number.',
         'feedback_correct': 'Correto. IEEE-754 explica as aproximações de decimal, e BigInt é indicado '
                             'para inteiros que exigem precisão além da faixa segura.',
         'feedback_incorrect': 'Considere a representação binária e o tipo da operação. BigInt é exato '
                               'para inteiros, mas não converte Number em decimal exato nem se mistura '
                               'implicitamente.'},
        transfer_prompt=('Preveja 0.2 + 0.4 === 0.6 e Number.isSafeInteger(2 ** 53 - 1). Explique por que o primeiro '
         'resultado é determinístico e por que BigInt serve apenas a inteiros.'),
    ),
    '02.12': E(
        'number.tolerance',
        'main.js: const a = 2000.3;\nconst b = 2000.304;\nconst resolucao = 0.01;\n// A política aceita diferença de até metade da resolução, inclusive.\n// Declare tolerancia a partir de resolucao e exiba a comparação aproximada.',
        'a=2000.3,b=2000.304,resolucao=0.01 -> tolerancia=0.005, true; a=1,b=1.1,resolucao=0.02 -> tolerancia=0.01, false; a=0.1+0.2,b=0.3,resolucao=2e-15 -> tolerancia=1e-15, true; a=1000.1+1000.2,b=2000.3,resolucao=2e-12 -> tolerancia=1e-12, true; a=0,b=0.125,resolucao=0.25 -> tolerancia=0.125, true',
        'a=0,b=0.25,resolucao=0.25 -> tolerancia=0.125, false; a=4,b=4,resolucao=0.01 -> tolerancia=0.005, true',
        'Usar Number.EPSILON fixo para todo domínio e escala.',
        'O caso em torno de 2000 falha apesar de tolerância publicada.',
        'Qual tolerância a política de metade da resolução determina?',
        ('A política pede metade da resolução; isso é uma escolha deste domínio, não uma lei universal.', 'Declare o limiar antes da comparação e use Math.abs(a-b).', 'Em outro sensor com resolução 0.2, metade é 0.1; diferença 0.08 fica dentro desse limite.'),
        'const tolerancia=resolucao/2; console.log(Math.abs(a-b)<=tolerancia); O limiar foi derivado da política publicada. Não inferir tolerância apenas da resolução sem política; Number.EPSILON não é limite universal.',
        'Sensor: resolução 0.02, política metade da resolução, a=400,b=400.004 -> tolerancia=0.01, true',
        prompt=('O sensor informa resolução 0.01 unidade. A política deste exercício aceita diferença absoluta de '
         'até metade dessa resolução, inclusive. Declare sua tolerancia a partir de resolucao; depois '
         'escreva e exiba a comparação aproximada. Antes de executar, registre limiar, diferença e '
         'decisão. Não use Number.EPSILON como limite universal; compare também os casos publicados perto '
         'de 1 e de 2000.'),
        kind='TRANSFER',
        requires=('math.rounding', 'number.ieee754'),
        secondary=(),
        constraints=('Fixtures substituem a, b e resolucao declarados: a/b são finitos e resolucao é finita positiva. '
         'A política é tolerancia=resolucao/2, com limite inclusivo.',
         'Não exigir função, rejeição ou if. Resolução sozinha não determina política de comparação; aqui '
         'a regra de metade está publicada.'),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        estimated=20,
        load={'novelty': 2,
         'syntax': 3,
         'composition': 3,
         'state': 1,
         'debugging': 1,
         'files': 1,
         'reading': 3,
         'independence': 3,
         'tools': 2},
        docs=('MDN Math.abs: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs; '
         'Number: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number'),
        assets=(),
        rubric=(),
        next_ids=(),
        optional=False,
        title='Escolha a tolerância pela política do sensor',
        content_version=3,
        explanation={'mental_model': 'Comparar medidas aproximadas exige uma política do domínio. Aqui ela é explícita: aceitar diferença de ATÉ metade da resolução, inclusive. Math.abs(a - b) mede a distância; <= inclui o limite.', 'worked_example': 'const leituraA = 0;\nconst leituraB = 0.125;\nconst passo = 0.25;\nconst limite = passo / 2;\nconsole.log(limite, Math.abs(leituraA - leituraB) <= limite);\n0.25 / 2 vale 0.125. A distância também é 0.125, então <= devolve true no limite. Com <, o mesmo caso falharia. No starter, 0.01 / 2 vale 0.005; a distância das leituras é aproximadamente 0.004 e é aceita. Declare tolerancia a partir de resolucao em cada caso.', 'common_trap': 'Number.EPSILON descreve uma escala perto de 1, não a política deste sensor. Resolução sozinha não define uma tolerância universal.', 'why_it_matters': 'Uma tolerância definida pelo domínio torna a comparação de sensores justificável e testável, inclusive na borda.'},
        first_response=('O limiar derivado de cada resolução, a diferença absoluta prevista e a decisão true/false antes '
         'de escrever a comparação.'),
        first_response_timing='Após estudar a regra e o exemplo resolvido, antes de executar a solução própria.',
        interaction='Previsão textual de tolerancia e comparação, editor único e tabela de entradas/saídas. Caso exatamente no limite verifica a política inclusiva.',
        resources=('Starter disponível no cartão: main.js.',
         'Política explícita de metade da resolução; tabela para declarar o limiar antes da comparação.',
         'Documentação oficial: MDN Math.abs: '
         'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs; '
         'Number: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number'),
        review={'prompt': 'Com resolução 0.02 e política que aceita até metade da resolução, qual limiar e '
                   'comparação usar?',
         'choices': ('tolerancia = 0.02 / 2; Math.abs(a - b) <= tolerancia.',
                     'tolerancia = Number.EPSILON sempre, independentemente da política.',
                     'tolerancia = 0.02; a === b, pois a resolução elimina aproximações.'),
         'answer': 'tolerancia = 0.02 / 2; Math.abs(a - b) <= tolerancia.',
         'feedback_correct': 'A política determina 0.01 e inclui a borda. A diferença absoluta aplica o '
                             'limiar.',
         'feedback_incorrect': 'Derive o limiar da política publicada. EPSILON e igualdade estrita não '
                               'expressam esse requisito.'},
        transfer_prompt=('Outro sensor informa resolução 0.02 e política de metade da resolução. Declare o limiar e '
         'compare 400 com 400.004; justifique usando a política.'),
    ),
}
