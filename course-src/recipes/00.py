from recipe_api import E

CONTENT = {
    "00.01": E(
        "execution.order",
        'main.js: console.log("A");\nconsole.log(2 + 3);\nconsole.log("B");',
        "código mostrado -> A, 5, B, nessa ordem",
        'troque literais por "X", 4 + 1, "Y" -> X, 5, Y, nessa ordem',
        "Confundir ordem visual de leitura com ordem das chamadas síncronas.",
        "A primeira linha divergente da previsão revela que o aluno pulou ou reordenou uma chamada.",
        "Qual console.log é executado primeiro, e o que ele imprime?",
        ("Leia as chamadas de cima para baixo.", "Anote uma saída por chamada, sem reorganizar.", 'Exemplo análogo: logs "I", 1 + 1, "F" produzem I, 2, F.'),
        'A primeira chamada imprime "A"; a segunda calcula 2 + 3 e imprime 5; a terceira imprime "B".',
        'Em arquivo de status com "início", 1 + 2 e "fim", prever as três linhas -> início, 3, fim',
        prompt=('Leia o main.js. Antes de Run, escreva uma linha de saída para cada chamada e '
         'indique confiança de 0–100%. Execute; compare a primeira divergência e '
         'explique por que 2 + 3 vira um único valor antes de ser impresso.'),
        kind="PREDICT", estimated=6, load={"novelty": 1, "syntax": 1, "composition": 1, "state": 1, "debugging": 1, "files": 1, "reading": 1, "independence": 1, "tools": 1},
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        explanation={'mental_model': 'As instruções síncronas são executadas na ordem em que '
                         'aparecem. Cada console.log avalia seu argumento por completo e '
                         'só então escreve uma linha.',
         'worked_example': 'Passo 1: em um exemplo paralelo, console.log("portas") '
                           'escreve "portas". Passo 2: JavaScript avalia 6 + 2 como 8 '
                           'antes de console.log escrever o número. Passo 3: '
                           'console.log("fechado") escreve "fechado". A saída paralela é '
                           'portas, 8, fechado; agora aplique o mesmo raciocínio ao '
                           'starter sem reutilizar estes valores.',
         'common_trap': 'Não leia console.log(2 + 3) como caracteres para imprimir: sem '
                        'aspas, 2 + 3 é uma expressão. Também não reordene chamadas '
                        'síncronas pela narrativa do texto.',
         'why_it_matters': 'Prever uma saída antes de executar deixa visível seu modelo '
                           'de execução. A mesma prática ajuda depois a localizar a '
                           'primeira divergência ao depurar, em vez de mudar linhas às '
                           'cegas.'},
        first_response=(('Três saídas previstas, uma por chamada e na ordem do arquivo, acompanhadas de '
         'uma confiança de 0–100%.')),
        first_response_timing=('Depois de ler as três linhas de main.js e antes do primeiro Run ou de abrir o '
         'gabarito.'),
        interaction=(('Mostre três campos de resposta rotulados com o número da linha e um campo '
         'textual de confiança. O aprendiz pode preenchê-los pelo teclado; leitor de '
         'tela anuncia linha, valor registrado e resultado após Run. A ordem e '
         'divergência aparecem como texto, nunca só por cor.')),
        resources=('Starter: main.js com três chamadas síncronas, mostrado junto ao enunciado.',
         'Resposta: três campos de previsão alinhados às linhas e um campo de confiança; '
         'a previsão fica visível ao comparar com a execução.',
         'Saída: transcrição em texto com associação linha/resultado e indicação textual '
         'da primeira divergência.'),
        review={'prompt': 'Ao executar o arquivo, qual explicação descreve corretamente a '
                   'chamada console.log(2 + 3) e sua posição na saída?',
         'choices': ('A execução segue a ordem do arquivo; antes da segunda chamada '
                     'escrever uma linha, JavaScript calcula 2 + 3 como 5 e passa esse '
                     'número ao console.log.',
                     'console.log escreve os caracteres 2 + 3 sem avaliar a expressão; o '
                     'cálculo só aconteceria se o resultado fosse guardado numa '
                     'variável.',
                     'As chamadas console.log são agendadas como tarefas assíncronas, '
                     'então o ambiente pode imprimir a última linha antes das '
                     'anteriores.'),
         'answer': 'A execução segue a ordem do arquivo; antes da segunda chamada '
                   'escrever uma linha, JavaScript calcula 2 + 3 como 5 e passa esse '
                   'número ao console.log.',
         'feedback_correct': 'Correto. JavaScript avalia o argumento antes da chamada e '
                             'as instruções síncronas seguem a ordem textual. Por isso a '
                             'linha do meio imprime o valor calculado entre as outras '
                             'duas.',
         'feedback_incorrect': 'Confira duas etapas separadas: sem aspas, 2 + 3 é '
                               'avaliado como expressão; depois console.log imprime o '
                               'valor. Como estas chamadas são síncronas, a posição da '
                               'linha no arquivo determina quando aparece.'},
        transfer_prompt=(('Em um arquivo de status com logs "início", 1 + 2 e "fim", preveja as três linhas e '
         'indique em qual etapa a soma é calculada.')),
    ),
    "00.02": E(
        "execution.contradiction",
        'main.js: // Versão 1\nconsole.log("entrada");\nconsole.log("processo");\nconsole.log("saída");\n\n// Versão 2: alternativa para comparar, não execute junto\n// console.log("entrada");\n// console.log("novo");\n// console.log("saída");',
        "versão inicial -> entrada, processo, saída; segunda linha trocada por console.log('novo') -> entrada, novo, saída",
        "inverta primeira e última linhas -> saída, processo, entrada",
        "Repetir a primeira previsão mesmo após uma linha mudar.",
        "A resposta conserva uma saída que já não está no arquivo.",
        "Qual linha mudou? A previsão foi refeita a partir do programa atual?",
        ("Compare as duas versões linha por linha.", "Recalcule a saída da chamada alterada e confira as demais no código atual.", 'Neste programa, as três chamadas são independentes; por isso, trocar um literal muda só a saída daquela chamada.'),
        "Na segunda versão, a chamada do meio imprime novo; as chamadas da primeira e terceira linhas não mudaram.",
        "Em sequência de mensagens de deploy, troque a última linha e preveja novamente -> só a última saída muda",
        kind="TRACE", estimated=7, requires=("execution.order",), load={"novelty": 1, "syntax": 1, "composition": 2, "state": 1, "debugging": 1, "files": 2, "reading": 2, "independence": 2, "tools": 1},
        prompt=(('Leia as versões 1 e 2, ambas mostradas no starter. Antes de Run, escreva as três saídas '
         'previstas para cada versão e destaque qual linha do código mudou. Depois '
         'compare as previsões e explique por que as outras chamadas mantêm sua posição.')),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        explanation={'mental_model': 'Uma chamada síncrona produz a linha correspondente à sua '
                         'posição no arquivo. Editar uma chamada muda o valor naquela '
                         'posição; não reescreve automaticamente os comandos vizinhos.',
         'worked_example': 'Exemplo paralelo: o arquivo imprime "carregar", "verificar", '
                           '"pronto". Se a chamada do meio passar a imprimir '
                           '"confirmar", a primeira e a última chamadas continuam nos '
                           'mesmos lugares; só a saída central muda. O raciocínio é '
                           'comparar cada chamada, não reutilizar a previsão antiga '
                           'inteira.',
         'common_trap': 'A previsão inicial não continua válida só porque o arquivo '
                        'parece familiar. Releia a versão atual e recalcule a linha '
                        'alterada antes de concluir.',
         'why_it_matters': 'Em uma sequência de status, uma mudança pequena deve '
                           'produzir uma consequência localizada que possa ser '
                           'explicada. Isso ajuda a revisar alterações sem atribuir '
                           'efeitos às linhas que não mudaram.'},
        first_response=(('Uma tabela com linha e saída prevista para as duas versões, mais uma marcação '
         'da única chamada alterada.')),
        first_response_timing=('Depois de ler ambas as versões e antes do primeiro Run ou de abrir a resposta '
         'correta.'),
        interaction=(('Mostre as versões lado a lado em regiões de código rotuladas; a tabela de '
         'previsão tem linha/saída para cada versão. Teclado pode alternar as regiões e '
         'preencher a tabela; leitor de tela anuncia quais linhas diferem e a '
         'transcrição em texto.')),
        resources=('Starter existente: main.js mostra as duas versões completas como snapshots separados; a segunda está comentada para não executar junto.',
         'Material visível: tabela de previsões por versão e destaque textual da linha '
         'alterada, sem depender de cor.',
         'Material visível: transcrição do Run após o envio; nenhum asset externo é '
         'necessário.'),
        review={'prompt': 'Quando uma única chamada de log é substituída, o que deve acontecer '
                   'com a previsão das chamadas síncronas vizinhas?',
         'choices': ('Recalcule a saída da chamada alterada e mantenha as chamadas '
                     'vizinhas na ordem e com o conteúdo que ainda está no arquivo.',
                     'Apague a previsão inteira: mudar uma linha faz todas as outras '
                     'chamadas imprimirem valores novos.',
                     'Mantenha a saída antiga no centro porque trocar o texto da chamada '
                     'não altera o argumento passado ao console.'),
         'answer': 'Recalcule a saída da chamada alterada e mantenha as chamadas '
                   'vizinhas na ordem e com o conteúdo que ainda está no arquivo.',
         'feedback_correct': 'Correto. Cada chamada continua associada à sua própria '
                             'linha síncrona; a edição localiza a mudança sem invalidar '
                             'os comandos que não foram alterados.',
         'feedback_incorrect': 'Compare a versão atual, chamada por chamada. A previsão '
                               'antiga pode ficar desatualizada na linha editada, mas as '
                               'outras chamadas ainda executam conforme o arquivo atual.'},
        transfer_prompt=(('Em um log de três passos de uma implantação, substitua mentalmente a mensagem '
         'final e registre quais linhas da saída permanecem iguais antes de executar.')),
    ),
    "00.03": E(
        "execution.sequence",
        'main.js: console.log("Fim"); // C\nconsole.log("Início"); // A\nconsole.log("Olá"); // D\nconsole.log("Olá, Ana"); // B',
        'saídas pedidas: "Início", "Olá, Ana" e "Fim", nessa ordem, uma por linha -> blocos A, B, C; D fica de fora',
        "se a saudação literal vira Olá, Rui -> A,bloco alterado,C; distrator segue fora",
        "Tratar bloco distrator como parte obrigatória do programa.",
        "A saída contém a saudação curta do distrator ou aparece fora da ordem pedida.",
        "Quais três mensagens o enunciado pede, em que ordem?",
        ("Compare cada bloco com as três mensagens pedidas.", "O distrator também parece uma saudação, mas não corresponde ao texto solicitado.", 'A saída pedida "Olá, Ana" não é a mesma mensagem que "Olá".'),
        'Use A, depois B, depois C: as três linhas imprimem "Início", "Olá, Ana" e "Fim". O bloco D imprime só "Olá" e fica de fora.',
        "Ordenar três logs de um recibo com quarto bloco de debug -> abertura, valor, fecho; debug fora",
        prompt=('Seu programa deve mostrar exatamente três linhas, nesta ordem: "Início", '
         'depois "Olá, Ana" e, por último, "Fim". Reordene as linhas do main.js, apague o '
         'bloco que não entra e execute. Registre a ordem escolhida antes de confirmar.'),
        kind="PARSONS", estimated=7, requires=("execution.order",), rubric=("Mantenha somente as três linhas que imprimem \"Início\", \"Olá, Ana\" e \"Fim\", na ordem pedida; apague o bloco D."), load={"novelty": 1, "syntax": 1, "composition": 2, "state": 1, "debugging": 1, "files": 1, "reading": 2, "independence": 2, "tools": 1},
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        explanation={'mental_model': 'Em Parsons, a saída desejada define quais blocos entram; '
                         'dependências e ordem narrativa definem a sequência. Um bloco '
                         'disponível pode ser um distrator, não uma etapa obrigatória.',
         'worked_example': 'Exemplo paralelo: para a sequência "abrir", "verificar", '
                           '"finalizar", escolha os blocos que imprimem essas mensagens '
                           'nessa ordem. Um bloco separado "diagnóstico interno" não '
                           'representa uma etapa da saída solicitada e fica fora. '
                           'Primeiro associe cada texto ao bloco; depois ordene os três '
                           'necessários.',
         'common_trap': 'Usar todos os blocos só porque foram apresentados acrescenta '
                        'uma saída que o requisito não pediu. Verifique o objetivo antes '
                        'de incluir um distrator.',
         'why_it_matters': 'Separar requisito de material disponível é uma habilidade de '
                           'leitura de tarefas. Em código real, distinguir comportamento '
                           'solicitado de log temporário evita incluir efeitos que '
                           'confundem quem usa o programa.'},
        first_response=(('A sequência de identificadores dos três blocos escolhidos e uma frase '
         'explicando por que o bloco de diagnóstico fica fora.')),
        first_response_timing=('Depois de ler o resultado desejado e antes de mover blocos ou executar o '
         'programa.'),
        interaction=(('Os quatro blocos são apresentados embaralhados. Blocos são linhas de código com rótulo semântico. Botões Mover para cima/baixo '
         'e comandos de teclado alteram a ordem; uma lista numerada oferece o mesmo '
         'percurso a quem não arrasta. Leitor de tela anuncia posição e conteúdo de cada '
         'bloco.')),
        resources=('Starter existente: blocos A–D embutidos na atividade.',
         'Material visível: requisito da saída e área de sequência numerada; o bloco '
         'distrator pode ser marcado como não usado.',
         'Material visível: transcrição textual da sequência montada; sem asset externo.'),
         review={'prompt': 'Em uma montagem Parsons com três mensagens pedidas e uma saudação '
                    'parecida que não foi solicitada, qual critério determina a solução?',
         'choices': ('Incluir apenas os blocos que produzem as três mensagens '
                     'solicitadas e colocá-los na ordem requerida.',
                     'Incluir todo bloco disponível; o programa precisa imprimir também '
                      'cada mensagem que aparece no painel.',
                      'Usar o bloco "Olá" porque ele parece com a saudação, mesmo que o pedido diga "Olá, Ana".'),
         'answer': 'Incluir apenas os blocos que produzem as três mensagens solicitadas '
                   'e colocá-los na ordem requerida.',
         'feedback_correct': 'Correto. O requisito define três saídas e sua ordem; a '
                             'disponibilidade do quarto bloco não torna esse log parte '
                             'do programa pedido.',
         'feedback_incorrect': 'Se marcou "Usar as quatro porque todas foram oferecidas": o pedido define três mensagens, e o bloco D '
                               'imprime só Olá, que não é uma das saídas pedidas. Oferecer um bloco não obriga a usá-lo. Se marcou '
                               '"Manter a ordem em que os blocos aparecem no arquivo": a ordem das linhas muda a saída, porque o '
                               'JavaScript executa as chamadas de cima para baixo. A sequência certa é a que o pedido define.'},
         transfer_prompt=(('Ordene os três logs necessários para um recibo — abertura, valor e fecho — e marque o '
         'quarto bloco de depuração que não deve aparecer na saída.')),
    ),
    "00.04": E(
        "execution.fill_console",
        'main.js: console.log("nome:", ___);\nconsole.log("pontos:", ___);\nconsole.log(___);',
        'lacunas "Ana", 0, "fim" -> nome: Ana; pontos: 0; fim',
        'lacunas "Ana", 0, "fim" -> nome: Ana; pontos: 0; fim',
        "Confundir o valor mostrado com o rótulo ou apagar uma chamada ao preencher uma lacuna.",
        "A saída fica sem uma das três linhas ou mostra o rótulo no lugar do valor.",
        "Quantas chamadas há no arquivo e qual valor cada uma recebe?",
        ("Texto fica entre aspas, como \"Ana\" ou \"fim\"; o número 0 fica sem aspas.", "Analise cada chamada isoladamente: a primeira e a segunda têm rótulo e valor separados por vírgula; a terceira tem um único argumento.", 'Exemplo de outro contexto: console.log("setor:", "B") mostra setor: B; console.log("falhas:", 0) mostra falhas: 0; e console.log("pronto") mostra pronto.'),
        'Substitua as lacunas pelos literais "Ana", 0 e "fim", sem alterar o restante do arquivo.',
        'Completar três logs de temperatura com 0 e "" -> todas as linhas permanecem',
        kind="FADED", estimated=6, load={"novelty": 1, "syntax": 1, "composition": 1, "state": 1, "debugging": 1, "files": 1, "reading": 2, "independence": 2, "tools": 1},
         requires=("execution.order", "execution.sequence"),
         prompt=(('Complete três valores literais em três chamadas a `console.log`: `"Ana"`, `0` e `"fim"`. Antes de '
          'editar, registre exatamente as três linhas esperadas (`nome: Ana`, `pontos: 0`, `fim`). Preserve os rótulos '
          'e a ordem do arquivo; depois execute e compare a saída.')),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        explanation={'mental_model': 'Cada chamada executa quando a execução chega à linha. Os argumentos separados por vírgula são mostrados na mesma saída; o rótulo não substitui o valor.',
         'worked_example': 'Em `console.log("vidas:", 2)`, o texto vidas: e o número 2 aparecem juntos. O mesmo vale para o número 0: ele é um valor que a chamada pode mostrar.',
         'common_trap': 'Não troque o rótulo pelo valor nem apague uma chamada ao preencher uma lacuna. Confira uma linha para cada chamada do arquivo.',
         'why_it_matters': 'Separar rótulo e valor ajuda a ler saídas de estado e a localizar qual chamada produziu cada linha.'},
        first_response=('A previsão exata das três linhas e os três literais escolhidos, um para cada chamada.'),
        first_response_timing=(('Depois de ler os rótulos no starter e antes de preencher o editor ou '
         'pressionar Run.')),
         interaction=(('Três lacunas correspondem às três chamadas, com navegação por teclado na ordem do arquivo. '
          'Peça uma previsão textual para cada saída antes de editar; anuncie rótulos e resultados em texto.' )),
        resources=('Starter existente: main.js com três lacunas nomeadas pelos rótulos de saída.',
         'Caso público visível: com "Ana", 0 e "fim", as três linhas esperadas são `nome: Ana`, `pontos: 0` e `fim`; mantenha todas as chamadas.',
         'Material visível: saída integral após execução, incluindo linhas cujo '
         'argumento seja falsy; sem asset externo.'),
         review={'prompt': 'Em `console.log("pontos:", 0)`, qual saída corresponde aos argumentos da chamada?',
          'choices': ('pontos: 0', '0 pontos:', 'pontos: "0"'),
          'answer': 'pontos: 0',
          'feedback_correct': 'Correto. O rótulo e o número são mostrados na ordem em que foram passados.',
          'feedback_incorrect': 'Leia os argumentos da chamada na ordem: primeiro o texto pontos:, depois o número 0.'},
         transfer_prompt=(('Preencha três chamadas para mostrar `itens: 4`, `saldo: 0` e `pronto`, cada uma em sua própria linha; registre a saída antes de executar.')),
    ),
    "00.05": E(
        "environment.boundaries",
        "matriz: Array | document | process | node:fs | console | fetch | npm | TypeScript; colunas: ECMAScript padrão | API do navegador | API do Node.js 24 | ferramenta/linguagem externa",
          "Array -> ECMAScript padrão; document -> navegador; process e node:fs -> Node.js; console e fetch -> navegador e Node.js 24; npm e TypeScript -> ecossistema/ferramenta externa",
        "cenário Browser + Node.js 24 -> fetch e console têm marca nas duas colunas; node:fs fica na coluna Node como módulo, não como global fs",
        "Tratar a presença de uma API no ambiente como se fosse sintaxe ECMAScript.",
        "O aluno fixa fetch em apenas um host ou classifica npm como linguagem.",
          "Em quais colunas cada nome deve receber uma marca, e quais linhas pertencem a mais de um host?",
        ("Marque primeiro os built-ins do ECMAScript.", "Depois preencha Browser e Node.js 24 separadamente; não force APIs compartilhadas em uma única categoria.", "fetch e console podem receber marca nas duas colunas de host."),
        "Array é padrão ECMAScript; document é Browser; process e node:fs são Node; console e fetch estão nos dois hosts; npm e TypeScript pertencem ao ecossistema/ferramenta externa.",
        "Em navegador e Node.js 24, crypto -> API global do host (Web Crypto no navegador e crypto global no Node), não sintaxe ECMAScript",
        kind="READ", estimated=8, requires=("execution.order", "execution.fill_console"), load={"novelty": 2, "syntax": 1, "composition": 2, "state": 1, "debugging": 1, "files": 1, "reading": 3, "independence": 2, "tools": 1},
         prompt=(('Preencha uma matriz para os oito nomes do starter: marque se cada um é padrão ECMAScript, API do navegador, API do Node.js 24 ou ferramenta/linguagem externa. Uma linha pode ter mais de uma marca quando o nome existe nos dois hosts.')),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        explanation={'mental_model': 'ECMAScript define objetos padrão como Array. O navegador e Node.js fornecem APIs de host; algumas existem nos dois; console, por exemplo, é padronizado pelo WHATWG Console Standard e não faz parte do ECMAScript. Ferramentas e linguagens externas pertencem a outra camada.',
         'worked_example': 'Na matriz, Array recebe marca em ECMAScript; document recebe marca em Browser; process e node:fs em Node 24; console e fetch nas duas colunas de host; npm e TypeScript em ferramenta/linguagem externa.',
         'common_trap': 'Não force cada nome em uma categoria exclusiva. Também não trate fs como global: a API de arquivos é importada do módulo node:fs.',
         'why_it_matters': 'Separar padrão da linguagem, APIs de host e ferramentas evita usar um recurso no ambiente errado ou atribuí-lo à camada errada.'},
        first_response=('Uma matriz preenchida com uma marca por coluna aplicável e uma frase sobre os nomes disponíveis em mais de um host.'),
        first_response_timing=('Depois de ler a lista e antes de abrir a classificação sugerida ou testar '
         'nomes em um runtime.'),
         interaction=(('Apresente a matriz em texto editável com colunas nomeadas para ECMAScript, Browser, Node.js 24 e ferramenta/linguagem externa. Permita múltiplas marcas por linha e resposta por teclado.')),
        resources=('Starter existente: matriz curta de oito nomes e quatro colunas.',
          'Material visível: marcas por origem/disponibilidade, com possibilidade de indicar mais de um host.',
          'Referência de contexto: ECMAScript, APIs dos hosts e ferramentas; nenhum asset externo.'),
        review={'prompt': 'Como classificar `fetch` e `console` no cenário Browser + Node.js 24?',
          'choices': ('Marcar ambos como APIs disponíveis nos dois hosts, sem tratá-los como sintaxe ECMAScript.',
                      'Marcar ambos apenas como APIs do navegador, pois Node.js não tem globais.',
                      'Marcar ambos como ferramentas externas que precisam ser instaladas.'),
          'answer': 'Marcar ambos como APIs disponíveis nos dois hosts, sem tratá-los como sintaxe ECMAScript.',
          'feedback_correct': 'Correto. Disponibilidade compartilhada não transforma uma API de host em parte da sintaxe da linguagem.',
          'feedback_incorrect': 'Leia as duas colunas de host separadamente. A mesma API pode estar disponível no Browser e no Node.js 24.'},
         transfer_prompt=(('Classifique `setTimeout` em Browser e Node.js 24 usando duas marcas de host; explique por que uma matriz representa melhor sua disponibilidade do que uma categoria exclusiva.')),
    ),
    "00.06": E(
        "debug.first_error",
        'main.js: console.log("Olá);\nconsle.log("fim");\nconsole.log("erro");',
        'arquivo intacto -> SyntaxError; após fechar aspas -> "Olá" aparece e a linha consle gera ReferenceError; após corrigir consle -> Olá, fim, erro, sem exceção; trocar "erro" por "ok" -> Olá, fim, ok',
        "com as três linhas corrigidas -> Olá, fim, ok; a versão com a palavra erro roda sem exceção, mas mostra saída diferente da pedida",
        "Tentar corrigir uma linha posterior antes de remover a primeira barreira de sintaxe.",
        "A execução para na primeira falha ou termina sem exceção com uma saída diferente do contrato.",
        "Depois de corrigir a primeira falha, qual é o próximo comportamento observável?",
        ("Comece pelo primeiro erro mostrado pelo runtime.", "Feche a string antes de investigar a próxima linha.", "Depois de corrigir consle, compare o texto impresso com o alvo: código válido também pode mostrar a saída errada."),
        'Feche "Olá", troque consle por console e execute; depois mude o literal "erro" para "ok" e confirme que a saída corresponde ao alvo.',
        "Arquivo tem string sem fechamento, nome de identificador inválido e saída semanticamente errada -> corrigir sintaxe, referência e conteúdo nessa ordem",
        kind="DEBUG", estimated=9, requires=("execution.order", "execution.fill_console"), load={"novelty": 2, "syntax": 2, "composition": 2, "state": 1, "debugging": 3, "files": 1, "reading": 3, "independence": 2, "tools": 1},
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
         prompt=(('Execute o arquivo intacto e observe a mensagem de erro: categoria, linha indicada e o que ela sugere. Formule uma hipótese antes de editar e investigue uma falha por vez, executando de novo a cada alteração. Ao final, compare a saída com o alvo do enunciado, mesmo quando nenhuma exceção aparecer.')),
         explanation={'mental_model': 'Uma string malformada causa SyntaxError antes de qualquer linha rodar. Depois do parse, um nome inexistente causa ReferenceError quando a execução chega a ele. Um programa também pode terminar sem exceção e ainda produzir texto diferente do pedido.',
          'worked_example': 'Primeiro, feche a aspa de Olá para o arquivo poder ser analisado. Depois, consle gera ReferenceError. Corrigir o nome permite que o programa rode; se a última mensagem ainda diz erro em vez de ok, a saída está semanticamente incorreta, embora nenhuma exceção aconteça.',
         'common_trap': 'Não comece por uma chamada posterior: enquanto o parse falha, '
                        'nenhuma linha do arquivo executa. Corrija uma causa, rode '
                        'novamente e use o próximo erro como nova evidência.',
         'why_it_matters': 'Separar falha de sintaxe, falha durante execução e resultado incorreto sem exceção ajuda a escolher a próxima ação e evita declarar sucesso só porque o programa terminou.'},
        first_response=(('A mensagem e a linha do primeiro erro no starter sem alterações, mais uma '
         'hipótese sobre a causa antes de editar.')),
        first_response_timing=('Imediatamente depois da primeira execução do starter intacto e antes da '
         'primeira edição.'),
        interaction=(('Editor de código com Run por teclado e painel de erro em texto, com '
         'linha/coluna rotuladas. Cada execução mantém o histórico textual para '
         'comparação; leitor de tela anuncia a nova primeira falha.')),
        resources=('Starter existente: main.js com uma falha de sintaxe e chamadas posteriores a '
         'investigar.',
         'Material visível: transcrição por execução, linha indicada e campo para '
         'registrar hipótese antes da edição.',
         'Referência: explicação integrada sobre parse versus erro de runtime; sem asset '
         'externo.'),
         review={'prompt': 'Um programa termina sem exceção, mas imprime `erro` quando o contrato pede `ok`. Como classificar o resultado?',
          'choices': ('Como saída incorreta, mesmo que não tenha ocorrido exceção.', 'Como SyntaxError, porque todo texto inesperado impede o parse.', 'Como sucesso, pois o processo terminou sem exceção.'),
          'answer': 'Como saída incorreta, mesmo que não tenha ocorrido exceção.',
          'feedback_correct': 'Correto. A execução pode terminar normalmente e ainda violar o resultado esperado.',
          'feedback_incorrect': 'Compare a saída com o contrato: terminar sem erro não garante que o programa fez o que foi pedido.'},
         transfer_prompt=(('Classifique três observações em outro programa: string sem fechamento; nome inexistente chamado durante a execução; execução normal que imprime `aguardando` quando o alvo é `concluído`.')),
    ),
    "00.07": E(
        "execution.make",
        "main.js: ",
        "arquivo vazio -> três chamadas console.log imprimem início, 0 e fim, cada uma na linha pedida",
        'troque os textos por "abriu" e "fechou" e mantenha o número 0 sem aspas -> abriu, 0, fechou; ainda são três chamadas completas',
        "Tratar console.log como algo que só serve para exibir código pronto, ou escrever o número zero como texto sem perceber a diferença.",
        "Falta uma chamada, a ordem não corresponde ao pedido ou o valor numérico 0 foi substituído por outro tipo de saída.",
        "Quantas chamadas são necessárias e quais valores cada uma deve mostrar?",
        ("Escreva uma chamada console.log completa para cada saída pedida.", "Use aspas nos textos; o zero pedido é o número 0, sem aspas.", 'Exemplo paralelo: `console.log("ligado");`, `console.log(7);`, `console.log("pronto");`.'),
        'Escreva três linhas: `console.log("início");`, `console.log(0);` e `console.log("fim");`, nessa ordem.',
        'Escreva um programa de três linhas para imprimir "abriu", o número 5 e "fechou" nessa ordem -> três chamadas completas, cada saída em sua linha',
        title="Escreva seu primeiro programa", content_version=2,
        requires=("execution.fill_console",),
        prompt=('O arquivo começa vazio. Escreva três chamadas `console.log`, nesta ordem: o texto `início`, o número `0` e o texto `fim`. Registre primeiro a saída prevista; depois execute e explique por que o zero também gera uma linha.'),
        kind="MAKE", estimated=7, load={"novelty": 1, "syntax": 1, "composition": 2, "state": 1, "debugging": 1, "files": 1, "reading": 1, "independence": 2, "tools": 1},
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
         explanation={'mental_model': 'Um programa pode começar com um arquivo vazio. Cada chamada completa `console.log(valor);` imprime o valor recebido; chamadas em linhas sucessivas produzem saídas na mesma ordem.',
          'worked_example': 'Exemplo paralelo: `console.log("ligado");` imprime o texto ligado; `console.log(7);` imprime o número 7; `console.log("pronto");` imprime pronto. Aspas delimitam textos, enquanto o número fica sem aspas.',
          'common_trap': 'Não escreva só os valores sem a chamada nem troque o número 0 por `"0"` quando o enunciado pede um valor numérico. Conte uma chamada por saída.',
          'why_it_matters': 'Escrever um programa curto do zero transforma leitura de código em produção: o aprendiz pratica a estrutura mínima que permite pedir uma saída ao computador.'},
         first_response=('As três linhas de saída previstas, registradas antes da execução, e o plano de usar uma chamada completa para cada linha.'),
         first_response_timing=('Depois de ler os três valores pedidos e antes de digitar código ou pressionar Run.'),
         interaction=('Editor inicialmente vazio, com orientação para escrever três chamadas completas; a previsão da saída é registrada antes de executar e o resultado aparece em transcrição textual acessível.'),
         resources=('Starter existente: main.js vazio, sem chamadas fornecidas.',
          'Material visível: saída pedida e editor para escrever três chamadas completas.',
          'Referência: documentação de `console.log`; nenhum asset externo.'),
         review={'prompt': 'Qual chamada imprime o número zero, em vez do texto formado pelo caractere 0?',
          'choices': ('`console.log(0);`', '`console.log("0");`', '`console.log("zero");`'),
          'answer': '`console.log(0);`',
          'feedback_correct': 'Correto. Sem aspas, 0 é um valor numérico passado à chamada.',
          'feedback_incorrect': 'Não: com aspas, 0 vira o texto "0". A saída parece igual, mas o código representa outro tipo de valor. Para o número, escreva console.log(0), sem aspas.'},
         transfer_prompt=('Escreva três chamadas completas para mostrar `abriu`, o número 5 e `fechou`, nessa ordem; explique por que a chamada do meio não usa aspas.'),
    ),
    "00.08": E(
        "html.tree_reading",
        'index.html: <form id="entrada"><label for="nome">Nome</label><input id="nome" class="campo"><button>Enviar</button></form>',
        "pai de label/input/button -> form; label associado ao input -> for=nome e id=nome; id do form -> entrada; classe do input -> campo",
        "adicione segundo input id=idade -> label nome continua associado somente ao input nome",
        "Confundir classe compartilhável com ID e ignorar hierarquia pai/filho.",
        "O mapa de árvore coloca label fora de form ou associa for ao elemento errado.",
        "Qual tag abre o elemento pai, e qual id corresponde ao for do label?",
        ("Marque tags de abertura e fechamento.", "for e id devem ter o mesmo valor.", "Dois elementos podem ter class campo, mas o id nome deve ser único."),
        "form contém label, input e button. for=nome aponta ao input id=nome; class=campo é metadado de seleção.",
        "Formulário de reserva com input de quantidade id=quantidade -> form é pai; label for=quantidade associa esse input",
         kind="READ", estimated=8, requires=("environment.boundaries",), load={"novelty": 2, "syntax": 1, "composition": 2, "state": 1, "debugging": 1, "files": 2, "reading": 3, "independence": 2, "tools": 2}, runtime="browser-readonly",
        prompt=(('Leia o HTML. Registre quem é pai de cada elemento, qual id corresponde ao for '
         'do label e qual valor é classe; não escreva CSS. Justifique com os atributos '
         'visíveis.')),
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        explanation={'mental_model': 'A hierarquia vem do aninhamento de tags; `for` associa um '
                         'label ao `id` de um controle; `class` é um rótulo reutilizável '
                         'e `id` identifica um elemento no documento.',
          'worked_example': 'No starter, a estrutura é: `<form id="entrada">` contém `<label for="nome">Nome</label>`, `<input id="nome" class="campo">` e `<button>Enviar</button>`. Árvore: `form#entrada` → `label`, `input#nome.campo`, `button`. Exemplo paralelo: em `<form id="contato"><label '
                           'for="postal">CEP</label><input id="postal" '
                           'class="campo-form"></form>`, form é o pai; `for="postal"` '
                           'aponta ao input com `id="postal"`; `campo-form` é uma classe '
                           'que outros elementos podem compartilhar.',
         'common_trap': 'Não associe `for` à classe nem trate `class` como identificador '
                        'único. Leia abertura/fechamento para reconstruir a árvore antes '
                        'de mapear atributos.',
         'why_it_matters': 'Ler relações semânticas do HTML permite criar formulários '
                           'que tecnologias assistivas conseguem associar e depurar '
                           'seletores sem confundir identidade e agrupamento.'},
        first_response=(('Uma árvore textual pai/filho e uma tabela para `id`, `for` e `class`, citando '
         'os atributos que comprovam cada resposta.')),
        first_response_timing=('Depois de ler as tags de abertura/fechamento e antes de abrir qualquer mapa ou '
         'explicação.'),
        interaction=(('Snippet HTML em bloco de código semântico e tabela editável de '
         'árvore/atributos, navegável com teclado. Cada linha e cabeçalho tem nome '
         'anunciado; a hierarquia também aparece em lista textual.')),
        resources=('Starter existente: index.html com um formulário, label, input e botão.',
         'Material visível: snippet com realce semântico e representação textual '
         'pai/filho; sem imagem externa.',
         'Referência: resumo de `id`, `class` e associação label/controle na explicação '
         'integrada.'),
        review={'prompt': 'Em um formulário HTML, como confirmar que um label está associado ao '
                   'input certo e distinguir essa associação de uma classe?',
         'choices': ('O valor de `for` deve corresponder ao `id` do input; a classe pode '
                     'ser compartilhada por vários elementos dentro do formulário.',
                     'O valor de `for` deve corresponder a `class`, pois classes '
                     'identificam unicamente um campo no documento.',
                     'Um label associa-se automaticamente ao primeiro input encontrado, '
                     'e `id` serve apenas para aplicar estilos repetidos.'),
         'answer': 'O valor de `for` deve corresponder ao `id` do input; a classe pode '
                   'ser compartilhada por vários elementos dentro do formulário.',
         'feedback_correct': 'Correto. A árvore vem do aninhamento, e a associação '
                             'explícita usa `for`/`id`. `class` agrupa elementos e não '
                             'substitui a identidade do controle.',
         'feedback_incorrect': 'Leia os atributos e a árvore separadamente: o label '
                               'aponta ao `id` correspondente; a classe é reutilizável e '
                               'não define a relação pai/filho.'},
        transfer_prompt=('Num formulário de reserva, o input de quantidade tem `id="quantidade"`. Desenhe a '
         'relação pai/filho e indique qual valor deve ligar o label a esse input pelo atributo `for`.'),
    ),
    "00.09": E(
        "execution.explain_program",
        'main.js: ',
          "exigência zero aplicada -> Atendimento, Pessoa: Ana, Itens: 0 e Fim, nessa ordem; a chamada Itens: continua no arquivo com o número 0",
          "chamada Itens: apagada ou ainda com 3 depois da exigência zero -> reprovado: a saída precisa ter quatro mensagens e Itens: 0 na terceira",
        "Achar que apagar a chamada Itens: é o mesmo que registrar zero itens.",
        "Programa sem a linha Itens: não cumpre a exigência, mesmo sem erro de execução.",
        "Qual linha muda quando 3 vira 0, e qual linha precisa continuar existindo?",
        ("Anote a saída de cada chamada antes de editar.", "Trocar o número muda só a mensagem daquela chamada; a chamada continua no arquivo.", 'Se a linha Itens: some, a quantidade deixa de aparecer na saída.'),
        "Troque somente o 3 por 0 na chamada Itens:; a saída final é Atendimento, Pessoa: Ana, Itens: 0 e Fim.",
        "Registro de backup com a chamada Copias: 2 -> Backup, Copias: 0 e Fim; a chamada Copias: continua no arquivo e só o número muda",
          kind="TRACE", estimated=15, requires=("execution.order", "execution.sequence"), title="Trace de chamadas e remoções", load={"novelty": 1, "syntax": 1, "composition": 2, "state": 2, "debugging": 1, "files": 1, "reading": 3, "independence": 2, "tools": 1},
          prompt=(('No main.js vazio, escreva chamadas que mostrem uma abertura, a pessoa Ana, a quantidade 3 e um encerramento. '
           'Preveja, execute e compare. Depois aceite a nova exigência de quantidade 0, altere o programa e execute outra vez. '
           'Por fim responda aos dois desafios de transferência.')),
        runtime='Node.js 24 LTS',
        compatibility='Recursos básicos; confirmar cada API recente no runtime declarado',
        explanation={'mental_model': 'Cada console.log produz uma saída na ordem do arquivo. Para '
                         'mudar uma quantidade, troque o número dentro da chamada: a linha '
                         'continua existindo e só a sua mensagem muda.',
         'worked_example': 'Exemplo paralelo: o programa imprime "Empréstimo", "Livro: Dom Casmurro", '
                           '"Multas: 3" e "Fim". Para exigir zero multas, troque só o 3 por 0 '
                           'na chamada Multas:; as outras três mensagens continuam iguais.',
         'common_trap': 'Apagar a linha Itens: para "registrar zero" faz a quantidade sumir da '
                        'saída. O correto é trocar o número por 0 e manter a chamada.',
         'why_it_matters': 'Documentar a relação entre linha e efeito é a base de '
                           'revisão de código e investigação. Explicações verificáveis '
                           'ajudam outra pessoa a avaliar uma alteração pequena sem '
                           'adivinhar a intenção.'},
        first_response=(('Uma lista das quatro mensagens previstas e a chamada que informa a quantidade, '
         'antes de escrever o código.')),
        first_response_timing=(('Depois de ler a explicação e o exemplo resolvido, antes de escrever chamadas no main.js vazio.')),
        interaction=(('Editor main.js vazio com botão de execução; anote a previsão antes de rodar, '
         'use o botão da exigência zero e responda aos desafios em texto.')),
        resources=('Starter: main.js vazio.',
         'Material visível: pedido com quatro mensagens, exigência de zero itens e dois desafios de transferência; '
         'sem asset externo.',
         'Referência: explicação textual liga cada chamada ao efeito observável.'),
        review={'prompt': 'Um programa mostra Empréstimo, Livro: Dom Casmurro, Multas: 3 e Fim. '
                   'Se o 3 virar 0 e a chamada continuar no arquivo, o que muda?',
         'choices': ('Só a linha Multas: passa a mostrar 0; as outras três continuam iguais.',
                     'A linha Multas: some e a saída fica com três mensagens.',
                     'Todas as linhas passam a mostrar 0.'),
         'answer': 'Só a linha Multas: passa a mostrar 0; as outras três continuam iguais.',
         'feedback_correct': 'Correto. Trocar o número muda somente a mensagem da chamada '
                             'alterada; as demais continuam na mesma ordem.',
         'feedback_incorrect': 'Se marcou "A linha Multas: some": apagar a chamada é outra mudança, diferente de trocar o número; a exigência '
                               'pede que a linha continue e mostre 0. Se marcou "Todas as linhas passam a mostrar 0": o número é argumento de uma única '
                               'chamada. Trocá-lo altera só a linha dessa chamada, e as outras três não recebem esse valor.'},
        transfer_prompt=(('Num registro de backup com a chamada Copias: 2, troque somente o número para 0 e escreva a saída esperada, sem apagar a linha.')),
    ),
}

_OFFICIAL_DOCS = {
    "00.01": "MDN console.log: https://developer.mozilla.org/en-US/docs/Web/API/console/log_static; Node.js Console: https://nodejs.org/api/console.html#consolelogdata-args",
    "00.02": "MDN console.log: https://developer.mozilla.org/en-US/docs/Web/API/console/log_static; Node.js Console: https://nodejs.org/api/console.html#consolelogdata-args",
    "00.03": "MDN console.log: https://developer.mozilla.org/en-US/docs/Web/API/console/log_static",
    "00.04": "MDN console.log: https://developer.mozilla.org/en-US/docs/Web/API/console/log_static",
    "00.05": "MDN standard built-in objects: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects; Node.js globals: https://nodejs.org/api/globals.html; WHATWG Console Standard (console, fora da ECMAScript): https://console.spec.whatwg.org/",
    "00.06": "MDN JavaScript errors: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors",
    "00.07": "MDN console.log: https://developer.mozilla.org/en-US/docs/Web/API/console/log_static; Node.js Console: https://nodejs.org/api/console.html#consolelogdata-args",
    "00.08": "MDN label element: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label; input element: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input",
    "00.09": "MDN console.log: https://developer.mozilla.org/en-US/docs/Web/API/console/log_static; Node.js Console: https://nodejs.org/api/console.html#consolelogdata-args",
}
for _exercise_id, _official_docs in _OFFICIAL_DOCS.items():
    CONTENT[_exercise_id]["docs"] = _official_docs
    CONTENT[_exercise_id]["resources"] += (f"Documentação oficial: {_official_docs}",)
