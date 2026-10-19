from recipe_api import E

_rubrics = {
    "01.01": ("Distinguir valor e rótulo devolvido por typeof.", "Explicar a peculiaridade histórica de null."),
    "01.02": ("Acompanhar base e total na ordem das instruções.", "Explicar por que somente total muda."),
    "01.03": ("Produzir duas ordens válidas diferentes sem o bloco E.", "Inicializar todos os nomes antes da leitura."),
    "01.04": ("Escolher const ou let pela reatribuição prevista.", "Preservar zero e false como valores válidos."),
    "01.05": ("Classificar NaN e Infinity como number e 1n como bigint.", "Não confundir valor especial com um tipo novo."),
    "01.06": ("Derivar perfil de nome e nivel usando crases e interpolação.", "Conferir o contrato com dados alternativos."),
    "01.07": ("Declarar e imprimir resumo derivado de horas e minutos.", "Preservar zero nos dois campos."),
    "01.08": ("Reatribuir somente volume e imprimir os dois estados.", "Derivar o texto dos bindings sem colar a saída."),
    "01.09": ("Imprimir três fichas atuais, incluindo vida zero.", "Resolver as duas transferências sem dicas e explicar as mudanças."),
}


def _review(prompt, answer, wrong_a, wrong_b):
    return {
        "prompt": prompt, "choices": (answer, wrong_a, wrong_b), "answer": answer,
        "feedback_correct": "Correto: a resposta acompanha o binding e a execução descrita.",
        "feedback_incorrect": "Releia a explicação e acompanhe o valor atual na ordem das instruções.",
    }


_common = {
    "runtime": "Node.js 24 LTS",
    "load": {"novelty": 1, "syntax": 1, "composition": 1, "state": 2, "debugging": 1, "files": 1, "reading": 1, "independence": 2, "tools": 1},
}

CONTENT = {
    "01.01": E("primitives.typeof", 'main.js: console.log(typeof 42);\nconsole.log(typeof "42");\nconsole.log(typeof true);\nconsole.log(typeof undefined);\nconsole.log(typeof null);', 'typeof 42, typeof "42", typeof true, typeof undefined, typeof null -> number, string, boolean, undefined, object', 'typeof "azul", typeof 7, typeof false -> string, number, boolean; null continua retornando object', "Confundir aspas, valor e rótulo retornado.", "Uma previsão não corresponde à string devolvida por typeof.", "Qual rótulo cada chamada devolve?", ("Separe valor e rótulo.", "Aspas fazem texto; sem aspas, 42 é número.", "null é a peculiaridade histórica que retorna object."), "typeof devolve strings: number, string, boolean, undefined e object para as cinco chamadas.", "Classifique typeof 8, typeof \"8\" e typeof false.", title="Classifique valores", content_version=3, kind="PREDICT", estimated=8, requires=("execution.order",), prompt="Preveja cinco rótulos antes de executar e explique apenas a diferença entre valor e rótulo.", explanation={"mental_model":"typeof recebe um valor e devolve uma string com seu rótulo.", "worked_example":"`typeof false` produz `boolean`; `typeof \"oi\"` produz `string`.", "common_trap":"Não responda com o valor original; null é uma peculiaridade documentada.", "why_it_matters":"Classificar valores ajuda a prever o comportamento de APIs."}, first_response="Cinco rótulos, um por chamada, antes do Run.", first_response_timing="Antes de executar.", interaction="Editor somente leitura com cinco linhas de previsão.", resources=("Starter com cinco chamadas typeof.", "Tabela de rótulos.", "MDN typeof."), review=_review("Qual rótulo typeof null retorna?", '"object"', '"null"', '"undefined"'), transfer_prompt="Classifique três novas chamadas typeof", **_common),
    "01.02": E("bindings.reassignment", "const base = 2;\nlet total = base;\ntotal = total + 3;\nconsole.log(base, total);", "após base -> base=2,total não inicializado; após total=base -> base=2,total=2; após reatribuição -> base=2,total=5; saída -> 2 5", "const taxa=2; let custo=taxa; custo=custo+4 -> taxa=2,custo=2 e depois taxa=2,custo=6", "Tratar inicialização como ligação permanente ou chamar um binding antes da inicialização de inexistente.", "A tabela não acompanha o valor atual de total.", "Qual binding muda na última atribuição?", ("Uma linha por instrução.", "Leia o lado direito primeiro.", "Atualize só o nome à esquerda."), "base termina em 2 e total em 5; antes da declaração, total ainda não foi inicializado.", "Rastreie taxa e custo em três instruções.", title="Rastreie bindings", content_version=3, kind="TRACE", estimated=10, requires=("bindings.values",), prompt="Preencha o valor atual de base e total depois de cada instrução.", explanation={"mental_model":"Cada binding tem seu valor atual; inicializar com outro binding copia o valor daquele momento.", "worked_example":"`const limite=4; let contador=limite; contador=contador+1` termina com 4 e 5.", "common_trap":"Antes da declaração, descreva o binding como ainda não inicializado; a causa é a ordem temporal.", "why_it_matters":"Rastrear estado por nome sustenta depuração."}, first_response="Tabela de quatro estados antes do Run.", first_response_timing="Antes do Run.", interaction="Tabela textual navegável.", resources=("Starter de bindings.", "Tabela de estado.", "MDN const e let."), review=_review("O que muda em total=total+3?", "Somente total", "base e total", "Nenhum binding"), transfer_prompt="Rastreie um custo que recebe duas reatribuições.", **_common),
    "01.03": E("bindings.declaration_order", 'E=console.log("diagnóstico"); C=const ativo=true; D=console.log(nome, idade, ativo); B=const idade=20; A=const nome="Lia"', "A,B,C,D ou qualquer ordem de A/B/C antes de D -> Lia 20 true; E fica fora", "D antes de uma declaração que ele consulta causa erro de leitura antes da inicialização", "Forçar uma ordem única entre declarações independentes.", "O consumidor aparece antes de uma declaração necessária ou E entra na resposta.", "Quais nomes D consulta?", ("Liste os nomes lidos.", "Produtores precedem o consumidor.", "A, B e C são independentes."), "A, B e C podem trocar de ordem, desde que venham antes de D; E fica fora.", "Dê duas ordens para três declarações independentes e um consumidor.", title="Organize dependências", content_version=3, kind="PARSONS", estimated=10, requires=("bindings.reassignment",), prompt="Registre duas ordens válidas e explique a dependência real.", explanation={"mental_model":"Uma leitura precisa ocorrer depois da inicialização do nome lido.", "worked_example":"Duas declarações que não se usam podem trocar de lugar antes do log que lê ambas.", "common_trap":"Não invente dependência entre produtores independentes.", "why_it_matters":"Dependências reais orientam a ordem do código."}, first_response="Duas ordens válidas antes de mover blocos.", first_response_timing="Antes de organizar.", interaction="Blocos com ordem inicial embaralhada.", resources=("Cinco blocos.", "Mapa de dependências.", "MDN const."), review=_review("O que limita a posição de D?", "As três declarações que D lê", "A ordem alfabética", "A obrigação de usar E"), transfer_prompt="Organize três declarações antes de um resumo.", **_common),
    "01.04": E("bindings.const_let_choice", '___ nome="Ana";\n___ pontos=0;\npontos=5;\n___ ativo=false;\n___ volume=0;\nvolume=7;\n___ idioma="pt-BR";\n___ tentativas=1;\ntentativas=2;\nconsole.log(nome, pontos, ativo, volume, idioma, tentativas);', "nome,ativo,idioma -> const; pontos,volume,tentativas -> let; valores finais Ana,5,false,7,pt-BR,2", "Zero e false permanecem valores válidos; a escolha segue reatribuição prevista", "Escolher pela aparência do valor inicial.", "Uma reatribuição ocorre em const ou a convenção não é aplicada.", "Quais nomes recebem nova atribuição?", ("Marque as três reatribuições.", "Use let nesses nomes.", "Zero e false não mudam a decisão."), "Use let nos três bindings reatribuídos e const nos demais.", "Classifique bindings de agenda por reatribuição.", title="Escolha const ou let", content_version=3, kind="FADED", estimated=10, requires=("bindings.reassignment",), prompt="Complete seis declarações pela convenção const quando não há reatribuição e let quando há.", explanation={"mental_model":"const protege o binding contra reatribuição; let permite outra atribuição.", "worked_example":"`const sala=0; let ocupacao=0; ocupacao=3` usa const para o fixo e let para o que muda.", "common_trap":"O valor inicial não decide; a mudança prevista decide.", "why_it_matters":"A declaração comunica o estado que o programa terá."}, first_response="Seis escolhas antes de completar o código.", first_response_timing="Antes de preencher.", interaction="Seis lacunas const/let.", resources=("Starter com reatribuições.", "Tabela de decisões.", "MDN const e let."), review=_review("Qual binding precisa de let?", "volume, porque muda", "legendas, porque é false", "idioma, porque é texto"), transfer_prompt="Escolha const/let para uma agenda.", **_common),
    "01.05": E("primitives.special_values", "console.log(typeof NaN);\nconsole.log(typeof Infinity);\nconsole.log(typeof 1n);\nconsole.log(typeof null);", "NaN, Infinity, 1n, null -> number, number, bigint, object", "-0, 5n, -Infinity -> number, bigint, number", "Supor que NaN seja um tipo separado ou que bigint seja apenas number.", "Um rótulo é escolhido pela grafia do nome, não por typeof.", "Qual rótulo typeof devolve?", ("Classifique somente.", "NaN pertence a number.", "n indica bigint."), "NaN e Infinity são number; 1n é bigint; null retorna object.", "Classifique -3, NaN e 5n.", title="Classifique valores especiais", content_version=3, kind="PREDICT", estimated=8, requires=("primitives.typeof",), prompt="Preveja quatro rótulos; operações numéricas ficam para a Etapa 02.", explanation={"mental_model":"typeof classifica o valor recebido; não cria tipos pelo nome escrito.", "worked_example":"`typeof NaN` é `number`; `typeof 1n` é `bigint`.", "common_trap":"Não misture classificação com operações que produzem valores especiais.", "why_it_matters":"Separar tipo e comportamento evita sobrecarga de conceitos."}, first_response="Quatro rótulos antes do Run.", first_response_timing="Antes do Run.", interaction="Tabela somente leitura.", resources=("Quatro chamadas typeof.", "Tabela de classificação.", "MDN typeof."), review=_review("typeof NaN?", '"number"', '"NaN"', '"undefined"'), transfer_prompt="Classifique dois novos valores.", **_common),
    "01.06": E("bindings.template_literal", 'const nome="Nara";\nconst nivel=3;\nconsole.log(/* uma expressão */);', "nome=Nara,nivel=3 -> Nara: nível 3", "nome=Ivo,nivel=1 -> Ivo: nível 1", "Usar aspas comuns ou copiar os valores em vez de interpolar bindings.", "A saída mostra ${nome} literalmente ou não forma uma string.", "Que string os bindings atuais devem formar?", ("Preveja antes de editar.", "Use crases.", "Interpole nome e nivel."), "Use uma única expressão `` `${nome}: nível ${nivel}` ``; o contrato é Nara: nível 3.", "Monte M4 — pronto com dois bindings.", title="Complete uma template literal", content_version=3, kind="FADED", estimated=10, requires=("bindings.values",), prompt="Preveja e complete a única expressão de saída.", explanation={"mental_model":"Crases delimitam a string e ${...} insere o valor avaliado.", "worked_example":"`codigo=R7` e `estado=pronto` formam `R7 — pronto`.", "common_trap":"Aspas comuns não interpolam.", "why_it_matters":"Strings derivadas acompanham os dados atuais."}, first_response="Uma linha prevista antes de editar.", first_response_timing="Antes de editar.", interaction="Editor de uma expressão.", resources=("Starter com nome e nivel.", "Contrato Nara: nível 3.", "MDN template literals."), review=_review("Como inserir nome?", "`${nome}` entre crases", '"${nome}"', "copiar Nara"), transfer_prompt="Monte uma expressão textual com dois bindings.", **_common),
    "01.07": E("bindings.template_literal", "const horas=2;\nconst minutos=15;", "horas=2,minutos=15 -> declara resumo com `${horas}h${minutos}` e imprime 2h15", "horas=4,minutos=0 -> 4h0", "Continuar tratando como lacuna em vez de escrever o programa pedido.", "Falta a declaração, a impressão ou os bindings não são usados.", "Quais duas instruções faltam?", ("Crie resumo.", "Leia horas e minutos.", "Passe resumo a console.log."), "Declare resumo com template literal e execute console.log(resumo); zero é preservado.", "Crie uma duração com dias e horas.", title="Escreva um resumo", content_version=3, kind="MAKE", estimated=12, requires=("bindings.template_literal",), prompt="Crie do zero a declaração do resumo e sua impressão.", explanation={"mental_model":"Uma template literal calcula uma string com os valores atuais; guardar essa string em resumo permite imprimi-la depois. A string guardada não acompanha mudanças posteriores dos dados automaticamente.", "worked_example":"Com dias=2 e horas=3, `${dias}d${horas}h` produz 2d3h.", "common_trap":"Não cole a saída como texto fixo.", "why_it_matters":"Produzir uma string curta consolida bindings e expressão."}, first_response="Saída prevista e plano de duas instruções.", first_response_timing="Antes de escrever.", interaction="Editor com duas declarações iniciais.", resources=("Starter de duração.", "Saída 2h15.", "MDN template literals."), review=_review("O que falta?", "Declarar e imprimir resumo", "Somente mudar horas", "Somente escrever uma string fixa"), transfer_prompt="Crie e imprima duração de dias e horas.", **_common),
    "01.08": E("bindings.configuration", '___ jogo="Arena";\n___ volume=0;\n___ dificuldade="normal";\n___ legendas=false;\n___ idioma="pt-BR";\n// resumo; volume=7; // segundo resumo', "Arena | volume 0 | normal | legendas false | pt-BR; depois Arena | volume 7 | normal | legendas false | pt-BR", "agenda: duração 0 -> duração 3, mantendo lembretes false", "Tratar 0 ou false como ausência e escolher let/const sem olhar reatribuição.", "Um resumo perde 0/false ou não muda apenas volume.", "Qual binding realmente muda?", ("Marque volume.", "Os demais podem ser const.", "Preserve os valores publicados."), "Use let em volume e const nos quatro fixos; derive os dois resumos dos bindings atuais.", "Modele uma agenda alterando somente duração.", title="Transfira const e let para configuração", content_version=3, kind="TRANSFER", estimated=18, requires=("bindings.const_let_choice", "bindings.template_literal"), prompt="Complete as cinco declarações e produza os dois resumos exatos.", explanation={"mental_model":"A configuração combina bindings estáveis com um valor ajustável.", "worked_example":"Arena com volume 0 e depois 7 preserva legendas false nos dois resumos.", "common_trap":"Não substitua escolhas explícitas por outros valores.", "why_it_matters":"Configurações precisam preservar preferências válidas entre estados."}, first_response="Tabela de cinco decisões e duas linhas previstas.", first_response_timing="Antes de editar.", interaction="Lacunas, dois checkpoints e contrato de saída.", resources=("Starter de configuração.", "Contrato Arena.", "MDN const, let e template literals."), review=_review("Qual binding usa let?", "volume, porque recebe 7", "legendas, porque é false", "idioma, porque é texto"), transfer_prompt="Modele e atualize uma configuração de agenda.", **_common),
    "01.09": E("bindings.textual_profile", 'const nome="Iris";\nconst nivel=1;\nlet vida=10;\nconst status="ativa";\n// três checkpoints', "Iris | nível 1 | vida 10 | ativa; Iris | nível 1 | vida 6 | ativa; Iris | nível 1 | vida 0 | ativa", "modelo=Lume, energia=8 -> Lume | energia 8; energia=3 -> Lume | energia 3", "Copiar uma ficha literal, não reatribuir vida ou apagar o zero.", "Uma linha não corresponde ao valor atual ou omite o zero.", "Qual binding muda nos três checkpoints?", ("Use os quatro bindings.", "Altere somente vida.", "Imprima o zero como valor atual."), "Use uma template literal, imprima vida=10, reatribua 6, imprima, reatribua 0 e imprima. O contrato tem exatamente três linhas.", "Crie uma ficha de veículo com energia 8, 3 e 0.", title="Projeto: ficha em três estados", content_version=3, kind="PROJECT", estimated=16, requires=("bindings.reassignment", "bindings.const_let_choice", "bindings.template_literal"), prompt="Complete o arquivo e produza exatamente as três linhas na ordem publicada.", explanation={"mental_model":"Cada execução da expressão cria um snapshot textual do estado atual.", "worked_example":"Lume | energia 8 e depois Lume | energia 3 mostram a mesma expressão reavaliada.", "common_trap":"Não fixe vida no texto e não omita vida=0.", "why_it_matters":"Uma ficha curta integra binding, reatribuição e apresentação."}, first_response="Três linhas previstas antes da primeira edição.", first_response_timing="Antes de escrever.", interaction="Editor com três checkpoints.", resources=("Starter de ficha.", "Contrato de três linhas.", "MDN let e template literals."), review=_review("Por que vida usa let?", "Porque recebe 6 e 0", "Porque todo número usa let", "Porque zero não pode estar em const"), transfer_prompt="Faça uma ficha de veículo com energia 8, 3 e 0.", **_common),
}

# Keep every compact case parseable by the catalog compiler: each transfer has
# an explicit observable expectation after the delimiter.
for _item in CONTENT.values():
    if " -> " not in _item["public"]:
        _item["public"] = f"{_item['public']} -> saída conforme o contrato publicado"
    if " -> " not in _item["hidden"]:
        _item["hidden"] = f"{_item['hidden']} -> saída conforme a regra demonstrada"
    if " -> " not in _item["transfer"]:
        _item["transfer"] = f"{_item['transfer']} -> resposta conforme a regra demonstrada"
    if _item.get("transfer_prompt") and " -> " not in _item["transfer_prompt"]:
        _item["transfer_prompt"] = f"{_item['transfer_prompt']} -> resposta conforme a regra demonstrada"

for _id, _recipe in CONTENT.items():
    _recipe['rubric'] = _rubrics[_id]


# Feedback por alternativa (revisão 15/10/2026): cada alternativa errada nomeia o engano que a produz.
# Em 01.04 a pergunta foi corrigida: pontos e tentativas também são reatribuídos, então a pergunta
# passa a pedir o único binding que, entre as opções, não pode ser const.
CONTENT["01.04"]["review"].update(
    prompt="Qual destes bindings não pode ser declarado com const neste código?",
    choices=("volume, que recebe 7 depois de 0", "ativo, que é false e nunca muda", "idioma, que é texto fixo"),
    answer="volume, que recebe 7 depois de 0",
)
_REVIEW_FEEDBACK = {
    "01.01": (
        "typeof null devolve \"object\" por uma peculiaridade histórica da linguagem, não porque null seja um objeto. typeof sempre devolve um rótulo textual, e null é o caso que contraria a expectativa.",
        "Se escolheu \"null\", confundiu o rótulo com o valor: typeof devolve o nome do tipo, não o valor testado. Se escolheu \"undefined\", tratou null como ausência de valor atribuído a um binding, que é o papel de undefined.",
    ),
    "01.02": (
        "Só total muda: a instrução total = total + 3 reatribui o binding total. base foi declarado com const e continua 2, porque nenhuma instrução atribui a ele.",
        "Se escolheu “base e total”, supôs que toda leitura no lado direito altera os bindings envolvidos; só o lado esquerdo da atribuição recebe o novo valor. Se escolheu “Nenhum binding”, ignorou que total recebe 5 na última reatribuição.",
    ),
    "01.03": (
        "D lê nome, idade e ativo; essas três declarações precisam ser inicializadas antes da leitura. A, B e C podem trocar de posição entre si, e E não entra nessa restrição, porque nenhum consumidor o lê.",
        "Se escolheu “A ordem alfabética”, criou uma regra que o código não tem: a ordem exigida vem das leituras, não dos nomes. Se escolheu “A obrigação de usar E”, confundiu uma saída de diagnóstico com dependência real de D.",
    ),
    "01.04": (
        "volume começa em 0 e recebe 7 em seguida; const impediria essa segunda atribuição, então volume precisa de let. ativo e idioma nunca são reatribuídos, e const é válido para eles mesmo com valores falsos ou textuais.",
        "Se escolheu “ativo, que é false”, associou valor falso a permissão de reatribuição: const aceita false, só proíbe nova atribuição. Se escolheu “idioma, que é texto fixo”, decidiu pelo tipo do valor, quando a regra é a reatribuição prevista.",
    ),
    "01.05": (
        "NaN e Infinity pertencem ao tipo number, e o sufixo n de 1n marca bigint. A pergunta trata de classificação por typeof, não de operações que produzem esses valores.",
        "Se escolheu “NaN”, tomou o nome de um valor especial como rótulo de tipo; typeof devolve o tipo, não a grafia. Se escolheu “undefined”, confundiu um valor numérico especial com a ausência de valor.",
    ),
    "01.06": (
        "Dentro de crases, ${nome} é substituído pelo valor atual do binding, então a expressão produz “Nara: nível 3” com os dados que existem agora, sem texto fixo.",
        "Se escolheu “${nome}” entre aspas comuns, a interpolação não acontece: a saída traz o texto ${nome} literalmente. Se escolheu copiar Nara, a string fica presa ao valor de hoje e deixa de acompanhar o binding.",
    ),
    "01.07": (
        "A tarefa pede uma declaração nova derivada de horas e minutos e a impressão dela. Sem essas duas instruções o programa não produz o resumo, mesmo com os dados já declarados.",
        "Se escolheu “Somente mudar horas”, tratou a tarefa como alteração de dado, mas nenhum valor precisa mudar. Se escolheu “Somente escrever uma string fixa”, perdeu a exigência de derivar o resumo de horas e minutos, que deve preservar zero.",
    ),
    "01.08": (
        "volume é o único binding reatribuído (0 para 7), então é o único que precisa de let. jogo, dificuldade, legendas e idioma permanecem fixos e podem ser const.",
        "Se escolheu “legendas, porque é false”, associou o valor a mudança, quando o que importa é reatribuição. Se escolheu “idioma, porque é texto”, decidiu pelo tipo do valor, não pela atribuição que ocorre depois.",
    ),
    "01.09": (
        "vida muda duas vezes (de 10 para 6 e depois para 0), então precisa de let. nome, nivel e status não mudam e ficam em const; zero é um valor válido e não impede const.",
        "Se escolheu “Porque todo número usa let”, aplicou uma regra por tipo; nivel é número e continua em const porque não muda. Se escolheu “Porque zero não pode estar em const”, confundiu valor com permissão: const aceita zero e só impede nova atribuição.",
    ),
}
for _eid, (_correct, _incorrect) in _REVIEW_FEEDBACK.items():
    CONTENT[_eid]["review"]["feedback_correct"] = _correct
    CONTENT[_eid]["review"]["feedback_incorrect"] = _incorrect

_COMPATIBILITY = {
    "01.01": "Operador typeof e valores primitivos; disponível em ECMAScript e Node.js 24 LTS.",
    "01.02": "Declarações const/let, atribuição e console.log; ECMAScript 2015+ e Node.js 24 LTS.",
    "01.03": "Declarações const e ordem de inicialização (temporal dead zone); ECMAScript 2015+ e Node.js 24 LTS.",
    "01.04": "Declarações const/let e reatribuição; ECMAScript 2015+ e Node.js 24 LTS.",
    "01.05": "typeof BigInt e literais com sufixo n; BigInt exige ECMAScript 2020+ e Node.js 24 LTS.",
    "01.06": "Template literals e interpolação ${expressao}; ECMAScript 2015+ e Node.js 24 LTS.",
    "01.07": "Template literals, interpolação e console.log; ECMAScript 2015+ e Node.js 24 LTS.",
    "01.08": "Declarações const/let, reatribuição e template literals; ECMAScript 2015+ e Node.js 24 LTS.",
    "01.09": "Declarações const/let, reatribuição e template literals; ECMAScript 2015+ e Node.js 24 LTS.",
}
for _eid, _item in CONTENT.items():
    if not _item["starter"].startswith("main.js: "):
        _item["starter"] = f"main.js: {_item['starter']}"
    _item["compatibility"] = _COMPATIBILITY[_eid]

CONTENT["01.03"].update(
    hidden="D antes de A -> ReferenceError: Cannot access 'nome' before initialization (temporal dead zone)",
)
CONTENT["01.03"]["review"].update(
    prompt="O que limita a posição de D?",
    choices=(
        "A, B e C podem trocar de ordem, mas todas precisam vir antes de D.",
        "A, B e C precisam aparecer na ordem A-B-C antes de D.",
        "E precisa vir antes de D para registrar o diagnóstico após a inicialização.",
    ),
    answer="A, B e C podem trocar de ordem, mas todas precisam vir antes de D.",
    feedback_correct="D lê nome, idade e ativo. Por isso A, B e C precisam vir antes de D; como não dependem umas das outras, podem trocar de ordem.",
    feedback_incorrect="A/B/C na ordem fixa confunde a ordem do exemplo com uma dependência real. E registra um diagnóstico, mas não inicializa nenhum nome que D lê e fica fora do resultado pedido.",
)
CONTENT["01.01"]["transfer"] = 'typeof 8, typeof "8", typeof false -> number, string, boolean'
CONTENT["01.02"]["transfer"] = "taxa=2,custo=taxa,custo=custo+4 -> taxa=2,custo=2; depois taxa=2,custo=6"
CONTENT["01.03"]["transfer"] = "A,B,C antes de D -> A,B,C,D e C,A,B,D imprimem Lia 20 true; E fica fora"
CONTENT["01.03"]["transfer_prompt"] = "Organize A, B e C antes de D em duas ordens diferentes. As duas devem imprimir Lia 20 true; E fica fora da saída."
CONTENT["01.04"]["hidden"] = "pontos=0,ativo=false,volume=0,tentativas=1 -> pontos e tentativas usam let e terminam em 5 e 2; volume usa let e termina em 7; ativo permanece false"
CONTENT["01.04"]["transfer"] = "agenda=Oficina,duracao=0,avisos=false; depois duracao=30 -> Oficina | duração 0 | avisos false; Oficina | duração 30 | avisos false"
CONTENT["01.04"]["transfer_prompt"] = "Crie uma agenda Oficina com duração 0 e avisos false; imprima, altere só duração para 30 e imprima. Saída: Oficina | duração 0 | avisos false; Oficina | duração 30 | avisos false."
CONTENT["01.05"]["transfer"] = "typeof -3, typeof NaN, typeof 5n -> number, number, bigint"
CONTENT["01.06"]["transfer"] = "nome=Nara,nivel=3 -> Nara: nível 3"
CONTENT["01.07"]["transfer_prompt"] = "Crie e imprima o resumo de 2 dias e 4 horas; mude horas para 6 e imprima de novo. Saída exata: 2 dias | 4 horas; 2 dias | 6 horas."
CONTENT["01.08"]["transfer_prompt"] = "Modele uma agenda com duração 0 e avisos false, imprima, atualize duração para 30 e imprima. Saída exata: Agenda | duração 0 | avisos false; Agenda | duração 30 | avisos false."
CONTENT["01.09"]["transfer_prompt"] = "Faça uma ficha Lume com energia 8, depois 3 e 0. Imprima exatamente: Lume | energia 8; Lume | energia 3; Lume | energia 0."
CONTENT["01.07"].update(
    public="horas=2,minutos=15 -> 2h15",
    hidden="horas=4,minutos=0 -> 4h0",
    prompt="Declare resumo com uma template literal, imprima-o e confira: horas=2 e minutos=15 produzem 2h15; horas=0 e minutos=0 produzem 0h0.",
    solution="const horas=2; const minutos=15; const resumo=`${horas}h${minutos}`; console.log(resumo); // 2h15",
    transfer="dias=2,horas=4; depois horas=6 -> 2 dias | 4 horas; 2 dias | 6 horas",
    transfer_prompt="Crie e imprima o resumo de 2 dias e 4 horas; mude horas para 6 e imprima de novo. Saída esperada: 2 dias | 4 horas e 2 dias | 6 horas.",
)
CONTENT["01.08"].update(
    public="volume=0; depois volume=7 -> Arena | volume 0 | normal | legendas false | pt-BR; Arena | volume 7 | normal | legendas false | pt-BR",
    hidden="jogo=Mar,dificuldade=leve,idioma=pt,volume=0; depois volume=7 -> Mar | volume 0 | leve | legendas false | pt; Mar | volume 7 | leve | legendas false | pt",
    prompt="Escolha const/let para os cinco nomes, imprima o resumo com volume 0, reatribua volume para 7 e imprima novamente. Saídas: Arena | volume 0 | normal | legendas false | pt-BR; Arena | volume 7 | normal | legendas false | pt-BR.",
    solution='const jogo="Arena"; let volume=0; const dificuldade="normal"; const legendas=false; const idioma="pt-BR"; console.log(`${jogo} | volume ${volume} | ${dificuldade} | legendas ${legendas} | ${idioma}`); volume=7; console.log(`${jogo} | volume ${volume} | ${dificuldade} | legendas ${legendas} | ${idioma}`);',
    transfer="nome=Agenda,duração=0,avisos=false; depois duração=30 -> Agenda | duração 0 | avisos false; Agenda | duração 30 | avisos false",
    transfer_prompt="Modele uma agenda com duração 0 e avisos false, imprima o resumo, atualize duração para 30 e imprima outra vez. Saídas: Agenda | duração 0 | avisos false; Agenda | duração 30 | avisos false.",
)
CONTENT["01.09"].update(
    public="vida=10; depois vida=6 e vida=0 -> Iris | nível 1 | vida 10 | ativa; Iris | nível 1 | vida 6 | ativa; Iris | nível 1 | vida 0 | ativa",
    hidden="modelo=Lume,energia=8; depois energia=3 e energia=0 -> Lume | energia 8; Lume | energia 3; Lume | energia 0",
    prompt="Complete o arquivo para imprimir exatamente três linhas: Iris | nível 1 | vida 10 | ativa; Iris | nível 1 | vida 6 | ativa; Iris | nível 1 | vida 0 | ativa.",
    solution='const nome="Iris"; const nivel=1; let vida=10; const status="ativa"; console.log(`${nome} | nível ${nivel} | vida ${vida} | ${status}`); vida=6; console.log(`${nome} | nível ${nivel} | vida ${vida} | ${status}`); vida=0; console.log(`${nome} | nível ${nivel} | vida ${vida} | ${status}`);',
    transfer="modelo=Lume,energia=8; depois energia=3 e energia=0 -> Lume | energia 8; Lume | energia 3; Lume | energia 0",
    transfer_prompt="Faça uma ficha de veículo com energia 8, depois 3 e 0. Imprima as três linhas: Lume | energia 8; Lume | energia 3; Lume | energia 0.",
)
