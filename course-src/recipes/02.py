from recipe_api import E

CONTENT = {
    '02.01': E(
        'operators.predict',
        'material.md: Bloco A — aritmética e precedência: 2+3*4; (2+3)*4; 9-4; 6%4; 8/2; 2**3.\nBloco B — comparação e lógica: 0===false; 5>3; 5>=5; !0; true&&false; false||"x"; "2"+3.\nCOMPARE posterior aos dois blocos: 0==="0"; 0=="0".',
        'Bloco A -> 14 (number), 20 (number), 5 (number), 2 (number), 4 (number), 8 (number); Bloco B -> false (boolean), true (boolean), true (boolean), true (boolean), false (boolean), "x" (string), "23" (string); COMPARE -> false, true',
        '3+1*2 -> 5 (number); false&&"x" -> false (boolean); true&&"x" -> "x" (string)',
        'Misturar precedência, igualdade estrita e fallback em uma regra única.',
        'Primeira divergência indica se falhou aritmética, comparação ou nullish.',
        'Qual família de operadores você está resolvendo e qual valor e tipo ela devolve?',
        ('Resolva uma família por vez; parênteses mudam a precedência.', '&& e || devolvem operandos; anote também o tipo.', 'Em 1==="1" o resultado é false; 1=="1" é true por coerção. Prefira === na trilha.'),
        'A: 14,20,5,2,4,8. B: false,true,true,true,false,"x","23". COMPARE: false,true. === não converte tipos; == aplica regras adicionais de coerção e só deve ser usado com intenção explícita. ?? será praticado em 02.02.',
        'Prever (3+1)*2 e true&&"ok", com tipos -> 8 (number), "ok" (string)',
        prompt=('Resolva primeiro o bloco A (+ - * / % ** e parênteses), registre valores e tipos e confira antes '
         'de avançar. Depois resolva B (=== > >= ! && || e concatenação). Por último compare 0 === "0" com '
         '0 == "0": explique a coerção de == e por que a trilha prefere ===. O operador ?? entra em 02.02.'),
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
        content_version=2,
        explanation={'mental_model': 'Expressões aritméticas calculam números; comparações retornam booleanos; && e || '
                         'podem devolver operandos. + concatena quando há string. Cada família tem sua '
                         'regra.',
         'worked_example': 'A: 5 + 2 * 3 = 11; (5 + 2) * 3 = 21. B: 7 >= 4 é true; true && "ok" é "ok" '
                           '(string). Após os blocos, compare 1 === "1" (false) com 1 == "1" (true por '
                           'coerção).',
         'common_trap': 'Não resolva tudo da esquerda para a direita, nem omita o tipo: "23" é texto e 23 '
                        'é número. == e === não seguem a mesma regra.',
         'why_it_matters': 'Separar as famílias reduz confusões entre cálculo, condição e concatenação.'},
        first_response=('Duas listas separadas (A e B) de valor e tipo, registradas antes de executar cada bloco; depois '
         'a comparação curta entre == e ===.'),
        first_response_timing='Depois de ler as expressões e antes do primeiro Run.',
        interaction=('Blocos A e B em sequência, com campos numerados valor/tipo; confira um bloco antes do seguinte. '
         'Strings aparecem entre aspas, inclusive "". COMPARE textual após B, acessível por teclado.'),
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
        content_version=2,
        explanation={'mental_model': '`||` escolhe o lado direito quando o lado esquerdo é falsy; `??` escolhe o lado '
                         'direito somente para null ou undefined. Nullish é um subconjunto dos valores que '
                         'podem acionar fallback.',
         'worked_example': 'Exemplo paralelo: para `0n`, `0n || "padrão"` usa o texto à direita porque '
                           'zero bigint é falsy; `0n ?? "padrão"` mantém o bigint, pois ele não é null nem '
                           'undefined. A diferença vem do predicado de cada operador.',
         'common_trap': 'Não trate zero, false ou string vazia como ausência automaticamente. Decida se o '
                        'domínio quer substituir qualquer falsy ou somente valor nullish.',
         'why_it_matters': 'Escolher o fallback certo preserva escolhas válidas de preferências e '
                           'formulários; evita sobrescrever silenciosamente dados que significam zero, '
                           'false ou vazio.'},
        first_response='Uma matriz com duas saídas por valor e colunas separadas para truthy/falsy e nullish/não-nullish.',
        first_response_timing='Depois de identificar cada valor e antes de executar ou revelar a tabela resolvida.',
        interaction=('Matriz editável por teclado com linhas de valores e colunas `||`/`??`/classificação. Leitor de '
         'tela anuncia os cabeçalhos e os textos completos; resultados não são codificados somente por '
         'cor.'),
        resources=('Starter disponível no cartão: material.md.',
         'Matriz de previsão com uma linha por valor e duas colunas de operadores.',
         'Explicação integrada com o exemplo paralelo de bigint zero e fallback.',
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
        'saldo=10,valor=8,ativa=true -> A,B,C,D e true; E não usado',
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
        content_version=2,
        explanation={'mental_model': 'Quando duas condições precisam ser verdadeiras ao mesmo tempo, `&&` combina os '
                         'requisitos. A validação continua booleana, e o resultado não deve passar se '
                         'qualquer requisito obrigatório falhar.',
         'worked_example': 'Exemplo paralelo: com saldo 15, pedido 6 e conta ativa, primeiro avalie `15 >= '
                           '6`, depois combine esse resultado com `ativa`. A condição final só autoriza '
                           'quando ambos os requisitos forem true; mudar qualquer um para false invalida o '
                           'conjunto.',
         'common_trap': 'Não use `||` quando ambos os requisitos são necessários: isso permitiria passar '
                        'com só um deles verdadeiro.',
         'why_it_matters': 'Expressar pré-condições como condições separadas torna regras de autorização '
                           'legíveis e evita aceitar operações sem saldo ou sem estado permitido.'},
        first_response=('Uma lista ordenada dos blocos e uma frase dizendo por que cada condição obrigatória precisa ser '
         'combinada com a outra.'),
        first_response_timing='Depois de identificar os requisitos no enunciado e antes de montar ou executar a expressão.',
        interaction=('Blocos com botões Mover para cima/baixo e alternativa em lista textual numerada; a relação '
         '“ambas obrigatórias” é mostrada como texto. Leitor de tela anuncia posição, expressão e remoção '
         'do distrator.'),
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
        content_version=2,
        explanation={'mental_model': '`Number(texto)` converte uma string, mas a conversão sozinha não decide se a '
                         'entrada é aceitável. A flag de campo vazio representa uma informação distinta; '
                         '`Number.isFinite` verifica se o resultado é um número finito. '
                         '`Number("Infinity")` e o literal `1e309` resultam em Infinity, que não atende ao '
                         'contrato.',
         'worked_example': 'Exemplo paralelo: `Number("42.5")` produz o número finito 42.5. A etapa '
                           'seguinte ainda pergunta se o campo foi marcado como vazio; converter texto e '
                           'validar intenção são decisões diferentes. A string "0" com `vazio=false` '
                           'converte para zero e é válida; um campo vazio segue inválido mesmo que '
                           '`Number("")` também produza zero.',
         'common_trap': 'Não aceite texto vazio como zero nem use isNaN para decidir finitude; preserve a '
                        'flag declarada e use Number.isFinite após a conversão.',
         'why_it_matters': 'Parsing explícito separa dado recebido de valor numérico validado e evita que '
                           'formulários interpretem falta de resposta como uma quantidade legítima ou '
                           'aceitem Infinity.'},
        first_response='Uma tabela de entrada → numero → invalido para os casos públicos, antes de preencher o código.',
        first_response_timing='Depois de ler o starter e antes da primeira edição nas lacunas.',
        interaction=('Tabela de casos com campos rotulados para número e validade, seguida de editor com somente duas '
         'lacunas. Tab percorre os campos; leitor de tela anuncia entrada, flag vazio e resultado.'),
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
        content_version=2,
        explanation={'mental_model': 'Number converte texto; as flags e Number.isFinite detectam validade; '
                         'multiplicação calcula; String formata. Detectar não significa rejeitar: nesta '
                         'etapa todos os resultados continuam sendo exibidos.',
         'worked_example': 'Para quantidade "4" e preço "2.5", Number produz 4 e 2.5, entradaValida é '
                           'true, total é 10 e etiqueta é "10 reais". Se preço for "x", entradaValida é '
                           'false, total é NaN e etiqueta é "NaN reais"; são resultados diagnósticos.',
         'common_trap': 'Number("") é 0; por isso a flag de vazio é necessária. Number.isNaN sozinho não '
                        'rejeita infinito.',
         'why_it_matters': 'Conversão explícita e validade observável preparam a futura rejeição de '
                           'entradas com controle de fluxo.'},
        first_response=('O fluxo texto → números → entradaValida → total → etiqueta, com previsão das saídas válidas e '
         'inválidas antes da edição.'),
        first_response_timing='Depois de ler o starter e antes da primeira mudança de código.',
        interaction=('Editor com painel de fluxo e saída textual; o aprendiz pode anotar tipos por etapa, editar pelo '
         'teclado e ler resultados em ordem. O diff mostra separadamente parsing, cálculo e formatação.'),
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
        content_version=2,
        explanation={'mental_model': '`??` aplica o valor padrão somente quando a entrada é null ou undefined. Um '
                         'valor numérico falsy, como zero, continua sendo uma escolha presente; a '
                         'faixa/tipo é uma validação independente.',
         'worked_example': 'Exemplo paralelo: `const tentativas = limiteEntrada ?? 3`. Se a propriedade '
                           'não tiver valor (undefined), o padrão é 3; se receber 12, esse valor '
                           'permanece. A regra de ausência não valida se 12 está dentro da faixa '
                           'permitida.',
         'common_trap': 'Não use `||` para um campo em que zero seja significativo. Também não tente '
                        'resolver validação de domínio com o mesmo operador que escolhe um default.',
         'why_it_matters': 'Preservar valores explicitamente escolhidos evita alterar configurações '
                           'válidas; separar default e validação mantém cada regra simples.'},
        first_response=('O valor inicial observado, a previsão para um valor presente e a previsão para ausência, antes '
         'de alterar a expressão.'),
        first_response_timing='Após executar o starter intacto e antes do primeiro patch.',
        interaction=('Editor com diff textual da expressão e painel de execução por caso. Botões e áreas são '
         'navegáveis por teclado; a transcrição distingue o valor lido do fallback escolhido sem depender '
         'de cor.'),
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
        content_version=2,
        explanation={'mental_model': 'Uma taxa de desconto remove uma fração do preço; a fração restante é `1 - taxa`. '
                         'Multiplicar o preço por essa fração mantém o resultado numérico.',
         'worked_example': 'Exemplo paralelo: preço 84 e taxa 0.25 deixam 0.75 do valor inicial. `84 * (1 '
                           '- 0.25)` calcula 63. Se a taxa for zero, a fração restante é 1 e o preço não '
                           'muda.',
         'common_trap': 'Não multiplique preço apenas pela taxa — isso calcula a parte descontada — nem '
                        'some a taxa ao preço.',
         'why_it_matters': 'Traduzir uma regra percentual em uma expressão clara evita erros em preços e '
                           'deixa validação de entrada separada do cálculo.'},
        first_response=('A expressão JavaScript que calcula o total depois do desconto e a anotação da fração que '
         'permanece.'),
        first_response_timing='Depois de ler o domínio das entradas e antes da primeira escrita no código.',
        interaction=('Editor completo para escrever declaração e console.log, com entradas literais e painel textual '
         'de preço/taxa/total acessível por teclado.'),
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
        'entradas 0,"",false -> 0,"",false após correção',
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
        content_version=2,
        explanation={'mental_model': 'Uma preferência pode escolher explicitamente um valor falsy. `??` preserva '
                         'qualquer valor que não seja null/undefined; validação do domínio é outra etapa.',
         'worked_example': 'Exemplo paralelo: uma preferência `passos = 0n` pode significar nenhum passo '
                           'adicional. `passos ?? 4n` mantém zero bigint; usar `||` substituiria essa '
                           'escolha por 4n. Uma preferência válida não é definida apenas por truthiness.',
         'common_trap': 'Não use `||` em todos os campos por hábito: false, zero ou string vazia podem ter '
                        'significado definido pelo produto.',
         'why_it_matters': 'Preservar as escolhas do usuário é essencial para interfaces configuráveis; '
                           'defaults só devem agir quando o contrato declara ausência.'},
        first_response=('Uma tabela com os três valores recebidos, se cada um é escolha válida ou ausência, e qual '
         'fallback deve ser aplicado.'),
        first_response_timing='Depois de ler os campos e antes de alterar qualquer operador.',
        interaction=('Tabela de preferências com valor e estado de ausência; editor de expressões e comparação textual '
         'antes/depois. Zero, false e string vazia têm rótulos acessíveis, não estilo visual isolado.'),
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
        'aEntrada=0,bEntrada=5 -> 0,5,5; ambos undefined -> 0,0,0',
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
        content_version=2,
        explanation={'mental_model': 'Resolva ausência de cada entrada antes da soma. `?? 0` preserva um zero '
                         'fornecido e substitui somente valor nullish; então a soma opera sobre os dois '
                         'pontos já escolhidos.',
         'worked_example': 'Exemplo paralelo: se `timeA = 13` e `timeB` estiver ausente, normalize `timeB` '
                           'para zero antes de somar. O total é composto de dois valores numéricos '
                           'explícitos, em vez de somar undefined ou concatenar texto.',
         'common_trap': 'Não substitua zero usando `||`, e não some entradas externas antes de aplicar a '
                        'política para ausência.',
         'why_it_matters': 'Normalizar opcionalidade antes de agregar evita NaN e facilita auditar de onde '
                           'veio cada parte do resultado.'},
        first_response=('Um plano curto de normalização dos dois campos e a primeira expressão/implementação que produz o '
         'total.'),
        first_response_timing='Depois de decompor a regra do placar e antes da primeira escrita no starter.',
        interaction=('Editor do placar, painel textual para cada campo após normalização e total final. Casos podem '
         'ser selecionados por teclado; leitor de tela anuncia ausência, valor preservado e soma em '
         'etapas.'),
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
        content_version=2,
        explanation={'mental_model': 'floor vai para menos infinito, ceil para mais infinito, trunc remove a fração e '
                         'round escolhe o inteiro mais próximo, com empate em direção a mais infinito. '
                         'min/max selecionam extremos e abs mede magnitude. Math.random gera um Number em '
                         '[0,1).',
         'worked_example': '149/60: floor/trunc 2, ceil 3, round 2; -149/60: floor -3 e trunc -2. '
                           'min(2,8)=2, max(2,8)=8, abs(-4)=4. Um sorteio 0.75 em Math.floor(sorteio*4)+1 '
                           'resulta em 4; zero resulta em 1.',
         'common_trap': 'Floor e trunc diferem abaixo de zero. Math.round não é adequado ao dado: ele '
                        'distorce os extremos. Math.random não é criptograficamente seguro.',
         'why_it_matters': 'Escolher arredondamento e intervalos evita páginas incompletas, limites '
                           'incorretos e sorteios fora da faixa.'},
        first_response=('Tabelas de arredondamento e utilitários; previsão do intervalo de sorteio e das faces para 0, '
         '0.5 e 0.9999999999999999 antes de executar cada bloco.'),
        first_response_timing='Depois de ler os valores positivos e negativos e antes de executar ou editar o starter.',
        interaction=('Três blocos sequenciais com previsão, editor e saída textual: arredondamento, utilitários e '
         'sorteios. Valores aleatórios são avaliados por faixa e os limites por fixtures determinísticas. '
         'Controles acessíveis por teclado.'),
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
        content_version=2,
        explanation={'mental_model': 'Number usa ponto flutuante binário; alguns decimais são exatos e outros são '
                         'aproximados. NaN é resultado numérico inválido; infinito não é finito. No bloco '
                         'B, inteiros seguros vão de -(2**53-1) a 2**53-1; BigInt oferece aritmética '
                         'inteira precisa.',
         'worked_example': 'A: 0.5 + 0.25 === 0.75 é true; 0.2 + 0.7 resulta em 0.8999999999999999, '
                           'portanto a igualdade com 0.9 é false. B: Number.isSafeInteger(2**53-1) é true; '
                           'Number.isSafeInteger(2**53) é false. typeof 1n devolve "bigint".',
         'common_trap': 'Não conclua que nenhum decimal é exato. BigInt não armazena frações e não se '
                        'mistura implicitamente com Number.',
         'why_it_matters': 'O modelo numérico orienta a comparação de medidas e a escolha de tipos para '
                           'identificadores grandes.'},
        first_response='Previsões separadas para blocos A e B, com valor e tipo, antes de executar cada bloco.',
        first_response_timing='Após ler as expressões e antes do Run ou da abertura da solução.',
        interaction=('Duas tabelas sequenciais: decimais/valores especiais e inteiros/BigInt. Confira A antes de B. '
         'Resultados textuais acessíveis por teclado; -0 opcional.'),
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
        content_version=2,
        explanation={'mental_model': 'Primeiro derive o limiar da política: metade da resolução. Depois aceite '
                         'Math.abs(a-b) <= tolerancia. Outras aplicações podem definir outra política; '
                         'EPSILON mede uma propriedade de Number perto de 1 e não substitui requisitos.',
         'worked_example': 'Sensor paralelo: resolução 0.2 e política de metade definem tolerância 0.1. '
                           'Entre 10 e 10.08, a diferença é aproximadamente 0.08 e a comparação é true; '
                           'entre 10 e 10.2 é false. O operador <= inclui a borda.',
         'common_trap': 'Não escolha EPSILON automaticamente nem trate metade da resolução como regra de '
                        'todos os sensores. Leia a política antes de declarar o limiar.',
         'why_it_matters': 'Uma tolerância ligada aos requisitos evita comparar medidas com uma precisão '
                           'que o domínio não promete.'},
        first_response=('O limiar derivado de cada resolução, a diferença absoluta prevista e a decisão true/false antes '
         'de escrever a comparação.'),
        first_response_timing='Depois de ler a política do sensor e antes da primeira escrita ou execução.',
        interaction=('Editor completo com entradas literais; tabela de resolução, política, limiar escolhido e '
         'diferença. Sem funções; controles e números acessíveis por teclado.'),
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
