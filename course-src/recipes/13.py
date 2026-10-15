from recipe_api import C, E
_MENTAL_MODELS = {'testing.evolving_project': 'Uma mudança de projeto convive com comportamento já utilizado. '
                             'Evoluir exige preservar compatibilidade e tornar as novas regras '
                             'observáveis.',
 'testing.dom_accessibility': 'Testes de interface podem observar estrutura, foco e eventos, mas '
                              'cada ferramenta tem limites sobre a experiência assistiva completa.',
 'testing.failure_reading': 'Uma falha de teste é uma observação que restringe hipóteses; a causa '
                            'precisa de evidência adicional antes de ser afirmada.',
 'errors.validation_order': 'Pré-condições definem quando uma operação pertence ao domínio válido; '
                            'erros previsíveis dependem de respeitar essa fronteira.',
 'testing.boundary_cases': 'Contratos de funções incluem limites, entradas inválidas, efeitos '
                           'sobre argumentos e o comportamento após o intervalo comum.',
 'debugging.predict_run_step': 'Previsão e execução são fontes diferentes de conhecimento: uma '
                               'revela expectativa, outra fornece evidência sobre o estado '
                               'percorrido.',
 'debugging.minimal_repro': 'Um defeito pode depender de várias camadas; reduzir contexto ajuda a '
                            'separar a condição causal do cenário incidental.',
 'testing.tdd_parser': 'Desenvolvimento guiado por testes é uma sequência de hipóteses pequenas '
                       'que evoluem junto com a compreensão do formato aceito.',
 'testing.regression': 'Um defeito corrigido pode reaparecer; uma reprodução automatizada '
                       'transforma a descoberta em proteção duradoura.',
 'testing.library_contract': 'Uma API pública é definida por resultados, erros e efeitos '
                             'observáveis, não apenas pela quantidade de linhas exercitadas.',
 'testing.doubles_fake_time': 'Dependências substituíveis e tempo controlado permitem observar '
                              'trabalho assíncrono sem depender de serviços ou relógios variáveis.',
 'errors.cause': 'Erros atravessam fronteiras de camadas. Contexto útil para diagnóstico e '
                 'informação apropriada à interface têm necessidades distintas.',
 'docs.official_lookup': 'Documentação de API registra contrato e compatibilidade em uma fonte '
                         'verificável; versões de runtime determinam o que está disponível.',
 'debugging.tool_choice': 'Cada ferramenta torna certos fatos observáveis e deixa outros fora de '
                          'alcance; a escolha depende da pergunta investigada.'}

def _lesson(skill, starter, misconception, _hints, _solution, transfer, estimate, runtime, row):
    (task, example, first, interaction, resources, q, answer, wrong1, wrong2, transfer_task) = row
    minutes = min(4, max(1, (estimate + 5) // 6))
    transfer_scenario = transfer.split("->", 1)[0].strip()
    mental_model = _MENTAL_MODELS[skill]
    if runtime == "browser":
        runtime_note = "Compatibilidade: navegador atual com APIs DOM; execução local, sem serviço externo."
    elif runtime.startswith("Browser with official documentation"):
        runtime_note = "Compatibilidade: navegador atual e documentação oficial acessível; registre a fonte e a data da consulta."
    elif runtime == "Node.js 24 with a provisioned Vitest runner":
        runtime_note = "Compatibilidade: Node.js 24 e runner Vitest provisionado para o exercício."
    else:
        runtime_note = f"Compatibilidade: {runtime}; use recursos nativos e fixtures locais descritos."
    return {
        "prompt": task + chr(10) + chr(10) + "Starter de trabalho:" + chr(10) + starter + chr(10) + chr(10) + "Registre sua primeira decisão antes de executar; depois compare previsão, evidência e justificativa.",
        "explanation": {
            "mental_model": mental_model,
            "worked_example": example,
            "common_trap": f"Armadilha: {misconception} Volte à regra pertinente e explique qual evidência a sustenta.",
            "why_it_matters": f"Esse raciocínio reaparece em {transfer_scenario}. Reconhecer o mesmo mecanismo permite reutilizá-lo sem copiar a implementação.",
        },
        "first_response": first,
        "first_response_timing": f"Reserve os primeiros {minutes} min de {estimate} min para esse registro, antes de executar ou abrir qualquer resposta-modelo.",
        "interaction": interaction + " Todas as ações funcionam por teclado e as mudanças são anunciadas em texto; nenhuma resposta depende apenas de cor ou arraste.",
        "resources": (resources,),
        "review": {
            "prompt": q, "choices": (answer, wrong1, wrong2), "answer": answer,
            "feedback_correct": f"Correto: {answer} {mental_model}",
            "feedback_incorrect": f"Reveja o conceito: {mental_model} A resposta conceitual esperada é: {answer}",
        },
        "transfer_prompt": transfer_task,
        "compatibility": runtime_note,
    }


CONTENT = {
"13.14": C(
    'testing.evolving_project',
    ('Kanban com V1 de 11.08 {version:1,tasks:[{id,text,status}]} e migração V1→V2 de 11.13 '
     "(acrescenta priority='normal'); esta change request cria migrarV2ParaV3, que acrescenta "
     'tags; fixtures V1, V2, V3, parcial e inválida'),
    ("V2 {version:2,tasks:[{id:'t1',text:'Ler pauta',status:'todo',priority:'high'}]} -> V3 "
     'mantém id/text/status/priority e acrescenta tags:[]; V1 -> passa por V1→V2 e depois V2→V3'),
    ('tags válidas existentes -> preservadas; tags inválidas -> [] com aviso; registro parcial '
     '-> descartado com aviso sem perder os demais; V3 -> não migra de novo; JSON inválido -> '
     'storage não é sobrescrito; texto HTML -> literal; teclado, foco e persistência sem regressão'),
    ('Reimplementar V1→V2, converter V1 direto para V3 ou reaplicar uma migração a um save que '
     'já está na versão atual; perder dados ou acessibilidade anterior.'),
    ('Cubra com teste a migração V1→V2 de 11.13 antes de mudar qualquer coisa.',
     'Implemente migrarV2ParaV3 como função pura: tags ausente vira [], priority não muda.',
     'Componha V1→V2→V3 no loader e rode as regressões de domínio, DOM e persistência.'),
    ('Implemente migrarV2ParaV3 pura: acrescente tags:[] quando ausente, preserve tags válidas '
     '(array de strings não vazias) e todos os campos V2. O loader aceita V1, V2 e V3, aplica '
     'V1→V2 de 11.13 e depois V2→V3, valida cada registro, reporta os descartados e só grava V3 '
     'após conversão segura. Mantenha os testes antigos e acrescente casos V1, V2, V3, parcial '
     'e inválido.'),
    'Catálogo de estoque V2→V3 com reorderThreshold -> V1 e V2 migram pela cadeia preservando itens e controles acessíveis',
    kind='MODIFY',
    runtime='browser',
    estimated=75,
    **_lesson('testing.evolving_project', ('Kanban com V1 de 11.08 {version:1,tasks:[{id,text,status}]} e migração V1→V2 de 11.13 '
     "(acrescenta priority='normal'); esta change request cria migrarV2ParaV3, que acrescenta "
     'tags; fixtures V1, V2, V3, parcial e inválida'), ('Reimplementar V1→V2, converter V1 direto para V3 ou reaplicar uma migração a um save que '
     'já está na versão atual; perder dados ou acessibilidade anterior.'), ('Cubra com teste a migração V1→V2 de 11.13 antes de mudar qualquer coisa.',
     'Implemente migrarV2ParaV3 como função pura: tags ausente vira [], priority não muda.',
     'Componha V1→V2→V3 no loader e rode as regressões de domínio, DOM e persistência.'), ('Implemente migrarV2ParaV3 pura: acrescente tags:[] quando ausente, preserve tags válidas '
     '(array de strings não vazias) e todos os campos V2. O loader aceita V1, V2 e V3, aplica '
     'V1→V2 de 11.13 e depois V2→V3, valida cada registro, reporta os descartados e só grava V3 '
     'após conversão segura. Mantenha os testes antigos e acrescente casos V1, V2, V3, parcial '
     'e inválido.'), 'Catálogo de estoque V2→V3 com reorderThreshold -> V1 e V2 migram pela cadeia preservando itens e controles acessíveis', 75, 'browser', ('Implemente V2→V3 (campo tags) como evolução incremental do Kanban existente. Preserve o '
     'migrador V1→V2 de 11.13 e demonstre que formatos antigos percorrem a cadeia sem perder '
     'dados nem compatibilidade da interface.',
     'Uma lista de compras V2 pode ganhar um campo opcional de categoria na V3; a migração '
     'pode preencher um padrão sem reescrever a transformação que já atualiza V1 para V2.',
     'Registre a responsabilidade de cada etapa da cadeia de migração e quais versões o '
     'loader precisa aceitar antes de alterar o código.',
     'Editor de migração, seletor de versão/fixture, painel de saída e checklist de '
     'regressões; teclado percorre cada registro.',
     'Fixtures locais V1/V2/V3, editor do loader e suíte Vitest provisionada para lógica '
     'pura e UI; nenhum storage pessoal.',
     'Por que V1 deve continuar passando pela migração V1→V2 existente antes de V2→V3?',
     'Cada etapa tem contrato próprio; compô-las preserva a compatibilidade e evita '
     'reimplementar a transformação antiga.',
     'Substituir o migrador antigo por uma conversão direta só para o formato V3.',
     'Descartar registros V1 sem tentar a cadeia de versões.',
     'Evolua o catálogo de estoque V2 para V3 adicionando reorderThreshold; preserve a migração encadeada para '
     'entradas V1/V2, os dados e os controles acessíveis.')),
          load={"novelty": 4, "syntax": 3, "composition": 5, "state": 5, "debugging": 4, "files": 5, "reading": 4, "independence": 5, "tools": 4}),
"13.13": C(
    'testing.dom_accessibility',
    'form com label,input,button,ul e região aria-live; escrever testes de DOM e teclado',
    'label ligada e submit Enter -> item criado e foco conforme contrato',
    ("erro inválido -> foco no campo e texto anunciado; string '<img>' -> nenhum img "
     'criado; clique de botão filho por delegação -> um item removido'),
    'Testar só querySelector e deixar foco/teclado/sink inseguro passar.',
    ('Use ações de teclado e asserts de foco.',
     'Inspecione nome/associação de label e região de feedback.',
     'Verifique DOM real para texto não confiável.'),
    ('Suíte DOM testa entrada por teclado, foco, mensagens, delegação e ausência de '
     'elemento injetado; diferencie checks automáticos de revisão manual com leitor de '
     'tela.'),
    'Testar diálogo de confirmação acessível -> foco/restauração e teclado',
    kind='TEST',
    runtime='browser',
    estimated=25,
    **_lesson('testing.dom_accessibility', 'form com label,input,button,ul e região aria-live; escrever testes de DOM e teclado', 'Testar só querySelector e deixar foco/teclado/sink inseguro passar.', ('Use ações de teclado e asserts de foco.',
     'Inspecione nome/associação de label e região de feedback.',
     'Verifique DOM real para texto não confiável.'), ('Suíte DOM testa entrada por teclado, foco, mensagens, delegação e ausência de '
     'elemento injetado; diferencie checks automáticos de revisão manual com leitor de '
     'tela.'), 'Testar diálogo de confirmação acessível -> foco/restauração e teclado', 25, 'browser', ('Escreva testes para uso por teclado, associação de rótulo/erro, foco após submit, '
     'anúncio de resultado e inserção segura de texto. Separe o que o teste automatizado '
     'prova do que requer revisão assistiva.',
     'Num acordeão, um teste pode verificar que Enter expande a seção e atualiza '
     'aria-expanded; revisar anúncio e ordem de foco com tecnologia assistiva ainda exige '
     'conferir experiência real.',
     'Liste o comportamento observável e a ferramenta adequada antes de escrever cada '
     'assert.',
     'Painel de testes com ações de teclado, árvore DOM, activeElement e região de '
     'anúncio; execução/resultado anunciados em texto.',
     'Starter com DOM de formulário, runner Vitest/DOM, utilitário de teclado e inspetor '
     'de foco; leitor de tela opcional para revisão manual.',
     'O que um teste DOM automatizado consegue verificar diretamente?',
     'Relações do DOM, estado de foco e resposta a eventos de teclado simulados.',
     'Toda a qualidade do anúncio para qualquer leitor de tela e dispositivo.',
     'A experiência completa sem verificar ordem de foco ou texto anunciado.',
     'Teste um diálogo de confirmação acessível: abertura por teclado, foco inicial, '
     'fechamento e retorno de foco ao acionador.')),
          load={"novelty": 4, "syntax": 3, "composition": 3, "state": 4, "debugging": 2, "files": 3, "reading": 4, "independence": 3, "tools": 4}),
"13.01": C(
    'testing.failure_reading',
    'Vitest: expect(paginar([1,2,3],2,2)).toEqual([3]); Received: [2,3]',
    'esperado -> [3]; recebido -> [2,3]; hipótese: offset da página começa cedo',
    'hipótese não prova causa -> pedir menor reprodução e inspecionar fórmula de início',
    'Interpretar diff como prova definitiva do bug.',
    ('Separe esperado de recebido.',
     'Ache primeira diferença observável.',
     'Formule hipótese testável sem declarar certeza.'),
    ('Registre entrada/esperado/recebido e hipótese de offset; verifique com caso página 1 '
     'antes de corrigir.'),
    'Ler falha de ordenação com item extra -> hipótese e contraexemplo',
    kind='READ',
    estimated=10,
    runtime='Node.js 24 with a provisioned Vitest runner',
    **_lesson('testing.failure_reading', 'Vitest: expect(paginar([1,2,3],2,2)).toEqual([3]); Received: [2,3]', 'Interpretar diff como prova definitiva do bug.', ('Separe esperado de recebido.',
     'Ache primeira diferença observável.',
     'Formule hipótese testável sem declarar certeza.'), ('Registre entrada/esperado/recebido e hipótese de offset; verifique com caso página 1 '
     'antes de corrigir.'), 'Ler falha de ordenação com item extra -> hipótese e contraexemplo', 10, 'Node.js 24 with a provisioned Vitest runner', ('Leia o diff do teste sem declarar causa antes da hora. Separe esperado, recebido e '
     'hipótese; peça uma reprodução mínima que possa refutar a hipótese.',
     'Um teste de contagem esperava quatro registros e recebeu cinco. A diferença revela '
     'uma observação e sugere duplicação, mas um recorte menor ainda precisa confirmar a '
     'causa.',
     'Escreva esperado/recebido e formule uma hipótese como pergunta que um caso pequeno '
     'possa confirmar ou refutar.',
     'Cartão do diff com campos de observação/hipótese e editor para propor uma entrada '
     'mínima; leitor de tela recebe cada região.',
     'Saída Vitest fornecida, função de ordenação e console de Node; execução local e '
     'determinística.',
     'Um diff de teste demonstra sozinho a causa raiz do defeito?',
     'Não; mostra diferença observável e orienta uma hipótese que ainda precisa de '
     'reprodução.',
     'Sim; a primeira diferença prova qual linha causou o problema.',
     'Não; resultados esperados devem ser ignorados até alterar o código.',
     'Analise uma falha de ordenação com elemento extra e registre hipótese mais '
     'contraexemplo mínimo antes de editar.')),
          load={"novelty": 2, "syntax": 1, "composition": 2, "state": 1, "debugging": 2, "files": 1, "reading": 4, "independence": 2, "tools": 1}),
"13.02": C(
    'errors.validation_order',
    ('blocos: validar número finito, validar divisor, calcular a/b, return, throw '
     'TypeError/RangeError'),
    'dividir(6,2) -> 3',
    ("dividir('6',2) -> TypeError; dividir(6,0) -> RangeError; nenhum cálculo antes de "
     'validar'),
    'Calcular primeiro e validar depois, deixando NaN/Infinity escapar.',
    ('Cheque tipos e finitude.', 'Cheque divisor zero.', 'Só então calcule e retorne.'),
    ('Ordene guardas antes de a/b e escolha erros estáveis: TypeError para tipo/finito, '
     'RangeError para divisor zero.'),
    'Validador de média com array vazio -> erro antes da divisão',
    kind='PARSONS',
    estimated=10,
    runtime='Node.js 24 with a provisioned Vitest runner',
    **_lesson('errors.validation_order', ('blocos: validar número finito, validar divisor, calcular a/b, return, throw '
     'TypeError/RangeError'), 'Calcular primeiro e validar depois, deixando NaN/Infinity escapar.', ('Cheque tipos e finitude.', 'Cheque divisor zero.', 'Só então calcule e retorne.'), ('Ordene guardas antes de a/b e escolha erros estáveis: TypeError para tipo/finito, '
     'RangeError para divisor zero.'), 'Validador de média com array vazio -> erro antes da divisão', 10, 'Node.js 24 with a provisioned Vitest runner', ('Ordene as guardas para rejeitar entradas inválidas antes do cálculo. Escolha tipo de '
     'erro estável e indique por que a operação só vem depois.',
     'Ao calcular percentual concluído, valide que o total de tarefas é positivo antes de '
     'dividir a quantidade concluída pelo total.',
     'Agrupe as pré-condições pelo tipo de erro e coloque todas antes da primeira operação '
     'aritmética.',
     'Blocos ordenáveis por teclado, sequência do fluxo e painel que informa a primeira '
     'guarda acionada; sem arrastar.',
     'Função inicial de divisão, blocos de código e runner Vitest local; erros aparecem em '
     'texto.',
     'Por que as guardas devem executar antes da divisão?',
     'Para impedir que entrada inválida produza NaN/Infinity antes do erro definido pelo '
     'contrato.',
     'Para converter todo erro aritmético em TypeError depois do cálculo.',
     'Para permitir que a divisão escolha quais parâmetros são válidos.',
     'Defina o tratamento de array vazio num cálculo de média, lançando o erro previsto '
     'antes de dividir.')),
          load={"novelty": 2, "syntax": 2, "composition": 2, "state": 2, "debugging": 1, "files": 1, "reading": 2, "independence": 2, "tools": 1}),
"13.03": C(
    'testing.boundary_cases',
    'paginar(items,page,size) 1-based; testes existentes só page=1,size=2',
    '[1,2,3], page=2,size=2 -> [3]',
    ('page=0/size=0 -> RangeError; além do fim -> []; entrada não mutada; size não inteiro '
     '-> RangeError'),
    'Testar somente caminho feliz e confundir página 1 com offset 1.',
    ('Liste limites de page/size.',
     'Cubra última página parcial e além do fim.',
     'Cheque erros e não mutação da entrada.'),
    ('Adicione asserts para segunda/última página, lista vazia, inválidos, além do fim e '
     'referência/ordem da entrada; não altere implementação fornecida.'),
    'Completar testes de fatiamento por janela -> bordas e invariantes',
    kind='TEST',
    estimated=25,
    runtime='Node.js 24 with a provisioned Vitest runner',
    **_lesson('testing.boundary_cases', 'paginar(items,page,size) 1-based; testes existentes só page=1,size=2', 'Testar somente caminho feliz e confundir página 1 com offset 1.', ('Liste limites de page/size.',
     'Cubra última página parcial e além do fim.',
     'Cheque erros e não mutação da entrada.'), ('Adicione asserts para segunda/última página, lista vazia, inválidos, além do fim e '
     'referência/ordem da entrada; não altere implementação fornecida.'), 'Completar testes de fatiamento por janela -> bordas e invariantes', 25, 'Node.js 24 with a provisioned Vitest runner', ('Amplie a suíte de paginação com limites, página parcial, além do fim, valores '
     'inválidos e garantia de não mutação; mantenha intacta a implementação fornecida.',
     'Um leitor de lotes processa cinco códigos em grupos de três: o último grupo é '
     'parcial e pedir outro grupo não deve alterar a lista fonte.',
     'Liste condições de page e size, depois cubra a última janela parcial e o caso além '
     'do final.',
     'Editor de casos Vitest, matriz de fronteiras e relatório por assert; cada controle '
     'usa teclado.',
     'Implementação existente de paginar, starter de testes Vitest e console local; sem '
     'editar o código da função.',
     'Qual invariante adicional protege os dados de quem chama paginar?',
     'A entrada permanece sem mutação após calcular qualquer página.',
     'A lista original deve ser ordenada in-place antes de cada chamada.',
     'Somente page=1 precisa ser verificada para provar todos os limites.',
     'Complete testes para janelas de fatiamento, cobrindo limites inválidos, última '
     'janela e preservação do array de entrada.')),
          load={"novelty": 2, "syntax": 2, "composition": 3, "state": 2, "debugging": 2, "files": 2, "reading": 3, "independence": 3, "tools": 3}),
"13.04": C(
    'debugging.predict_run_step',
    ('função somaPositivos([1,-2,3]) com loop e acumulador; prever, executar, breakpoint a '
     'cada iteração'),
    'previsão registrada -> 4; execução -> 4; passos mostram acc 0,1,1,4',
    'entrada [0,-1] -> 0; registrar se previsão divergiu e qual passo resolveu dúvida',
    'Rodar antes de prever e perder diagnóstico do modelo mental.',
    ('Escreva previsão com confiança.',
     'Execute com entrada fixa.',
     'Inspecione acc e índice a cada parada.'),
    ('Entregue tabela previsão/resultado/traço e explique qual ferramenta forneceu '
     'evidência em cada fase.'),
    'Mesmo protocolo para buscar máximo -> registrar primeira divergência',
    kind='INVESTIGATE',
    estimated=20,
    runtime='Node.js 24 with a provisioned Vitest runner',
    **_lesson('debugging.predict_run_step', ('função somaPositivos([1,-2,3]) com loop e acumulador; prever, executar, breakpoint a '
     'cada iteração'), 'Rodar antes de prever e perder diagnóstico do modelo mental.', ('Escreva previsão com confiança.',
     'Execute com entrada fixa.',
     'Inspecione acc e índice a cada parada.'), ('Entregue tabela previsão/resultado/traço e explique qual ferramenta forneceu '
     'evidência em cada fase.'), 'Mesmo protocolo para buscar máximo -> registrar primeira divergência', 20, 'Node.js 24 with a provisioned Vitest runner', ('Siga o protocolo prever→executar→inspecionar em cada iteração. Registre a primeira '
     'divergência e qual evidência do debugger resolveu sua dúvida.',
     'Ao procurar a primeira letra “r” em “arara”, marque índice e posição encontrada a '
     'cada iteração; o traço mostra quando a condição encerra o laço.',
     'Escreva resultado previsto e confiança, depois escolha a variável e o ponto de '
     'parada que tornariam cada passo observável.',
     'Tabela previsão/execução/traço e botões para avançar breakpoint; estado acessível '
     'por teclado e valor lido em texto.',
     'Função curta com loop, console do Node e depurador com breakpoint por linha; entrada '
     'local controlada.',
     'O que deve ser registrado antes de iniciar o debugger para diagnosticar o modelo '
     'mental?',
     'Uma previsão com confiança; depois ela pode ser comparada com o traço de cada '
     'iteração.',
     'Só o valor final observado após executar várias entradas.',
     'A correção esperada copiada antes de registrar qualquer hipótese.',
     'Aplique o mesmo protocolo de previsão/execução a uma rotina de busca do maior valor '
     'e registre a primeira divergência.')),
          load={"novelty": 2, "syntax": 2, "composition": 2, "state": 3, "debugging": 4, "files": 1, "reading": 3, "independence": 2, "tools": 4}),
"13.05": C(
    'debugging.minimal_repro',
    ('módulo 40 linhas com filtros, formatação e bug: item zero desaparece por if(valor); '
     'reduzir'),
    'caso mínimo [0,1] -> deve preservar 0; versão bug devolve [1]',
    ('remover UI/rede -> falha persiste; caso [false] também denuncia teste de truthiness '
     'conforme contrato'),
    'Corrigir código grande sem isolar uma entrada que falha.',
    ('Liste entradas/saídas observadas.',
     'Remova partes irrelevantes conservando falha.',
     'Só depois ajuste condição e guarde regressão.'),
    ('Reduza a função a filtro com if(valor !== undefined) conforme contrato; teste 0 e '
     'mantenha diff mínimo.'),
    'Reduzir bug de preço zero em carrinho -> reprodução curta',
    kind='DEBUG',
    estimated=22,
    runtime='Node.js 24 with a provisioned Vitest runner',
    **_lesson('debugging.minimal_repro', ('módulo 40 linhas com filtros, formatação e bug: item zero desaparece por if(valor); '
     'reduzir'), 'Corrigir código grande sem isolar uma entrada que falha.', ('Liste entradas/saídas observadas.',
     'Remova partes irrelevantes conservando falha.',
     'Só depois ajuste condição e guarde regressão.'), ('Reduza a função a filtro com if(valor !== undefined) conforme contrato; teste 0 e '
     'mantenha diff mínimo.'), 'Reduzir bug de preço zero em carrinho -> reprodução curta', 22, 'Node.js 24 with a provisioned Vitest runner', ('Reduza o módulo até a falha caber num caso mínimo. Confirme que o defeito persiste '
     'sem UI/rede, faça uma correção pequena e preserve a reprodução como regressão.',
     'Um formatador de datas pode deslocar um registro para o dia anterior. Remover rede e '
     'interface e reduzir a duas datas próximas à meia-noite revela se a conversão é a '
     'causa.',
     'Remova uma responsabilidade de cada vez e execute a reprodução após cada redução; '
     'pare quando o menor caso ainda falhar.',
     'Editor de módulo e área para retirar etapas com botão, mais diff da redução; teclado '
     'opera cada ação.',
     'Módulo inicial com filtros/formatação e runner Vitest; execução local sem rede.',
     'Qual é o propósito principal de uma reprodução mínima?',
     'Isolar uma entrada que ainda demonstra a falha removendo partes irrelevantes.',
     'Refatorar todo o módulo antes de confirmar que o defeito continua.',
     'Apagar os testes e manter apenas a saída que parece correta.',
     'Reduza um defeito em que preço zero desaparece no carrinho a uma reprodução pequena '
     'antes de corrigir.')),
          load={"novelty": 3, "syntax": 2, "composition": 3, "state": 3, "debugging": 5, "files": 3, "reading": 3, "independence": 4, "tools": 4}),
"13.06": C(
    'testing.tdd_parser',
    "parseLinha('nome=Ana;idade=3') com lotes de testes progressivos: formato, escape, erro",
    "'nome=Ana;idade=3' -> {nome:'Ana',idade:'3'}",
    ("chave repetida -> último valor por política; segmento sem '=' -> SyntaxError; "
     "entrada vazia -> objeto vazio; escape '\\;' conforme lote"),
    'Implementar formato completo imaginado antes de ler o próximo teste.',
    ('Faça primeiro teste falhar.',
     'Implemente menor passo que passa o lote.',
     'Refatore sem perder testes anteriores.'),
    ('Parser incremental separa segmentos não escapados, valida chave/igual, aplica '
     'política de repetição; registre ciclos vermelho/verde/refatoração.'),
    'Parser de cabeçalho simples com separador diferente -> mesmo ciclo',
    kind='PROJECT',
    estimated=90,
    runtime='Node.js 24 with a provisioned Vitest runner',
    **_lesson('testing.tdd_parser', "parseLinha('nome=Ana;idade=3') com lotes de testes progressivos: formato, escape, erro", 'Implementar formato completo imaginado antes de ler o próximo teste.', ('Faça primeiro teste falhar.',
     'Implemente menor passo que passa o lote.',
     'Refatore sem perder testes anteriores.'), ('Parser incremental separa segmentos não escapados, valida chave/igual, aplica '
     'política de repetição; registre ciclos vermelho/verde/refatoração.'), 'Parser de cabeçalho simples com separador diferente -> mesmo ciclo', 90, 'Node.js 24 with a provisioned Vitest runner', ('Implemente parseLinha em incrementos guiados pelos lotes de testes. Faça cada lote '
     'falhar primeiro, passe com a menor mudança e refatore mantendo os anteriores verdes.',
     'Um parser de pares separados por vírgula pode começar aceitando uma chave e valor, '
     'depois adicionar repetição conforme a política documentada; não precisa antecipar '
     'escapes ainda não pedidos.',
     'Leia o próximo teste antes de escolher a menor regra que o faz passar; só avance '
     'quando os casos anteriores continuarem passando.',
     'Editor com lotes desbloqueados em sequência e indicação textual vermelho/verde; '
     'todos os testes podem ser acionados por teclado.',
     'Starter parseLinha, lotes Vitest locais e resumo de testes; sem rede.',
     'Qual decisão combina com uma evolução TDD por lotes?',
     'Implementar o menor comportamento que passa o lote atual e preservar os testes '
     'anteriores.',
     'Antecipar todos os formatos imagináveis antes de ler os próximos testes.',
     'Remover os testes antigos quando um novo formato aparece.',
     'Implemente por ciclos TDD um parser de cabeçalho simples com outro separador, lendo '
     'cada teste antes de ampliar a gramática.')),
          load={"novelty": 3, "syntax": 3, "composition": 4, "state": 3, "debugging": 2, "files": 3, "reading": 3, "independence": 4, "tools": 3}),
"13.07": C(
    'testing.regression',
    'bug: clamp(-5,0,10) retorna -5; escrever teste Vitest antes de corrigir',
    'clamp(-5,0,10) -> 0; teste inicialmente falha e depois passa',
    'clamp(12,0,10) -> 10; min>max -> RangeError; min/max exatos preservados',
    'Mudar código primeiro e só depois criar teste sem demonstrar regressão.',
    ('Registre saída defeituosa.',
     'Escreva expect que falha no bug real.',
     'Corrija e rode antiga+nova suíte.'),
    ('Teste reproduz limite inferior, corrige com Math.min(Math.max(x,min),max) após '
     'validar intervalo e conserva teste.'),
    'Bug de desconto acima do teto -> teste vermelho e correção',
    kind='TEST',
    estimated=25,
    runtime='Node.js 24 with a provisioned Vitest runner',
    **_lesson('testing.regression', 'bug: clamp(-5,0,10) retorna -5; escrever teste Vitest antes de corrigir', 'Mudar código primeiro e só depois criar teste sem demonstrar regressão.', ('Registre saída defeituosa.',
     'Escreva expect que falha no bug real.',
     'Corrija e rode antiga+nova suíte.'), ('Teste reproduz limite inferior, corrige com Math.min(Math.max(x,min),max) após '
     'validar intervalo e conserva teste.'), 'Bug de desconto acima do teto -> teste vermelho e correção', 25, 'Node.js 24 with a provisioned Vitest runner', ('Demonstre a regressão com um teste que falha no código atual, corrija o limite '
     'inferior e preserve verificações do limite superior e dos extremos.',
     'Um controle de volume limitado entre 2 e 8 deve retornar 8 quando recebe 11; esse '
     'teste é uma afirmação separada para a outra fronteira.',
     'Registre primeiro a saída defeituosa e escreva o assert que a contradiz; só então '
     'faça a mudança de código.',
     'Editor de teste e função lado a lado, com estados de execução antes/depois em texto '
     'e navegação por teclado.',
     'Starter clamp, arquivo de teste Vitest e terminal local com relatório '
     'vermelho/verde.',
     'O que faz do teste uma prova de regressão útil?',
     'Ele reproduz o defeito antes da correção e permanece na suíte depois dela.',
     'Ele é escrito somente após corrigir, sem demonstrar que falhava.',
     'Ele testa apenas um caso já correto e apaga a saída defeituosa.',
     'Proteja uma regra de desconto máximo com um teste que falha antes da correção e '
     'cobre as fronteiras relacionadas.')),
          load={"novelty": 2, "syntax": 2, "composition": 2, "state": 1, "debugging": 2, "files": 2, "reading": 2, "independence": 2, "tools": 3}),
"13.08": C(
    'testing.library_contract',
    'utilitários clamp, unique, paginar em módulo ESM; API documentada com erros',
    'clamp(2,0,3), unique([1,1,2]), paginar([1,2,3],2,2) -> 2,[1,2],[3]',
    ('clamp min>max -> RangeError; unique preserva ordem e SameValueZero; paginar page '
     'inválida -> RangeError; sem mutação'),
    'Cobertura percentual sem verificar semântica de bordas.',
    ('Declare contratos públicos e erros.',
     'Teste exemplo, borda, erro e não mutação por função.',
     'Separe implementação de suíte e documentação curta.'),
    ('Entregue três exports com JSDoc, Vitest cobrindo contratos e README de '
     'entradas/erros; revisão avalia cenários além da métrica.'),
    'Módulo de moeda/intervalos com API -> suíte equivalente para bordas e erros',
    kind='PROJECT',
    estimated=90,
    runtime='Node.js 24 with a provisioned Vitest runner',
    **_lesson('testing.library_contract', 'utilitários clamp, unique, paginar em módulo ESM; API documentada com erros', 'Cobertura percentual sem verificar semântica de bordas.', ('Declare contratos públicos e erros.',
     'Teste exemplo, borda, erro e não mutação por função.',
     'Separe implementação de suíte e documentação curta.'), ('Entregue três exports com JSDoc, Vitest cobrindo contratos e README de '
     'entradas/erros; revisão avalia cenários além da métrica.'), 'Módulo de moeda/intervalos com API -> suíte equivalente para bordas e erros', 90, 'Node.js 24 with a provisioned Vitest runner', ('Documente contratos de três funções e escreva testes para exemplos, bordas, erros e '
     'não mutação. Explique por que cobertura percentual não substitui semântica.',
     'Uma função unique para rótulos ["x","x","y"] pode preservar a primeira ocorrência e '
     'a ordem; um teste deve afirmar ambos, não apenas contar linhas executadas.',
     'Para cada export, escreva pré-condições, resultado, erro possível e se a entrada '
     'pode mudar antes de escolher testes.',
     'Matriz por função × categoria de contrato, editor JSDoc/teste e relatório acessível '
     'de cenários.',
     'Módulo ESM com clamp/unique/paginar, runner Vitest, README de API e console local.',
     'O que uma alta cobertura percentual demonstra diretamente?',
     'Que muitas das linhas medidas foram executadas, sem provar que todos os contratos foram verificados.',
     'Que todos os resultados, erros e efeitos da API tenham sido testados.',
     'Que o código coberto não contenha defeitos.',
     'Crie contrato e suíte para um módulo de moeda e intervalos, cobrindo erros, bordas e '
     'invariantes.')),
          load={"novelty": 3, "syntax": 3, "composition": 4, "state": 3, "debugging": 2, "files": 4, "reading": 4, "independence": 4, "tools": 4}),
"13.09": C(
    'testing.doubles_fake_time',
    ('retry(op,max,delay) com timer; testes vi.fn, vi.spyOn, vi.useFakeTimers; fake fetch '
     'injetado'),
    'op falha uma vez, resolve -> duas chamadas e um atraso virtual',
    ('falha até max -> erro original; após teste vi.useRealTimers/vi.restoreAllMocks; spy '
     'não altera código de produção'),
    'Usar rede real ou timer real e criar teste lento/instável.',
    ('Injete op/clock ou use fake timers.',
     'Avance relógio controladamente.',
     'Restaure spies e timers no teardown.'),
    ('Suíte Vitest controla promise e tempo, verifica número de chamadas/intervalos e '
     'restaura estado global em afterEach.'),
    'Testar debounce sem esperar relógio real -> chamadas determinísticas',
    kind='TEST',
    estimated=25,
    runtime='Node.js 24 with a provisioned Vitest runner',
    **_lesson('testing.doubles_fake_time', ('retry(op,max,delay) com timer; testes vi.fn, vi.spyOn, vi.useFakeTimers; fake fetch '
     'injetado'), 'Usar rede real ou timer real e criar teste lento/instável.', ('Injete op/clock ou use fake timers.',
     'Avance relógio controladamente.',
     'Restaure spies e timers no teardown.'), ('Suíte Vitest controla promise e tempo, verifica número de chamadas/intervalos e '
     'restaura estado global em afterEach.'), 'Testar debounce sem esperar relógio real -> chamadas determinísticas', 25, 'Node.js 24 with a provisioned Vitest runner', ('Controle a resposta assíncrona e o tempo sem rede real ou espera real. Verifique '
     'tentativas/atrasos e restaure spies e timers após cada teste.',
     'Um aviso de sucesso desaparece após alguns segundos; avançar o relógio virtual permite '
     'conferir que ele permanece antes do prazo e expira depois, sem aguardar tempo real.'
     '',
     'Identifique dependências externas de tempo/operação e escolha injeção ou relógio '
     'falso antes de montar os asserts.',
     'Painel de avanço do relógio virtual, histórico de chamadas e saída Vitest; ações por '
     'teclado, sem pausa real.',
     'retry(op,max,delay), vi.fn/spy, fake timers e fetcher injetável; rede/timers reais '
     'não são usados.',
     'Por que usar relógio falso num teste com atraso?',
     'Para controlar a ordem e o tempo virtual sem deixar o teste lento ou instável.',
     'Para fazer a função de produção executar com um relógio diferente.',
     'Para dispensar restauração de timer e spy após o teste.',
     'Teste debounce sem aguardar o relógio real, provando a quantidade de chamadas após '
     'os intervalos.')),
          load={"novelty": 3, "syntax": 3, "composition": 3, "state": 4, "debugging": 3, "files": 2, "reading": 3, "independence": 3, "tools": 4}),
"13.10": C(
    'errors.cause',
    ('capturar erro do adaptador externo e lançar erro de domínio com cause; UI mostra '
     'mensagem pública'),
    "falha externa 'ECONNRESET' -> Error('Não foi possível salvar',{cause:erroOriginal})",
    ('cause mantém identidade do erro; UI não mostra token/URL sensível; erro não-Error '
     'lançado -> normalização explícita'),
    'Perder stack/cause ao substituir erro ou exibir detalhes sensíveis ao usuário.',
    ('Capture falha de fronteira.',
     'Relance com mensagem pública e cause original.',
     'Separe logging técnico da apresentação.'),
    ("try/catch na borda; throw new Error('Não foi possível salvar',{cause:e}); camada UI "
     'lê só mensagem pública.'),
    'Erro de storage indisponível -> causa técnica preservada e UI genérica',
    kind='MODIFY',
    estimated=22,
    runtime='Node.js 24 with a provisioned Vitest runner',
    **_lesson('errors.cause', ('capturar erro do adaptador externo e lançar erro de domínio com cause; UI mostra '
     'mensagem pública'), 'Perder stack/cause ao substituir erro ou exibir detalhes sensíveis ao usuário.', ('Capture falha de fronteira.',
     'Relance com mensagem pública e cause original.',
     'Separe logging técnico da apresentação.'), ("try/catch na borda; throw new Error('Não foi possível salvar',{cause:e}); camada UI "
     'lê só mensagem pública.'), 'Erro de storage indisponível -> causa técnica preservada e UI genérica', 22, 'Node.js 24 with a provisioned Vitest runner', ('Traduza falha externa para erro de domínio conservando cause. Separe mensagem '
     'pública de detalhe técnico e decida como normalizar valores que não são Error.',
     'Um adaptador de compactação pode lançar uma falha técnica; a camada de domínio pode '
     'acrescentar contexto funcional mantendo a causa original para diagnóstico interno.',
     'Separe em duas colunas o dado registrado no log técnico e a mensagem apresentada à '
     'pessoa antes de escrever o catch.',
     'Editor de tratamento de erro, painel separado para UI/log privado e inspeção de '
     'cause/identidade; foco e retorno textual.',
     'Adaptador simulado que falha, UI local e console; erros determinísticos sem token, '
     'URL ou serviço real.',
     'Por que conservar a causa ao criar um erro de domínio?',
     'Ela mantém a evidência técnica para diagnóstico sem expor detalhes na mensagem '
     'pública.',
     'Para mostrar stack e dados sensíveis diretamente na interface.',
     'Para substituir o erro original e apagar o encadeamento de falha.',
     'Trate falha de armazenamento: mantenha a causa técnica para diagnóstico e mostre '
     'mensagem genérica à interface.')),
          load={"novelty": 3, "syntax": 3, "composition": 3, "state": 3, "debugging": 3, "files": 2, "reading": 3, "independence": 3, "tools": 2}),
"13.11": C(
    'docs.official_lookup',
    ('documentação oficial de Array.prototype.at: assinatura, índice negativo, retorno e '
     'compatibilidade; usar em tarefa'),
    '[10,20,30].at(-1) -> 30; fonte oficial identificada com URL/data',
    ('[].at(-1) -> undefined; índice fora -> undefined; fallback arr[arr.length-1] quando '
     'baseline exigir'),
    'Copiar exemplo de blog sem checar retorno/compatibilidade oficial.',
    ('Localize página oficial da API.',
     'Extraia assinatura, retorno, limites e compatibilidade.',
     'Use a API em uma função curta e cite a decisão de fallback.'),
    ('Entregue ficha de documentação com link oficial e lastItem(arr) que retorna '
     'arr.at(-1) ou fallback declarado.'),
    'Ler docs de Object.hasOwn e aplicar em lookup de propriedade -> contrato e suporte',
    kind='DOCS',
    estimated=18,
    runtime='Browser with official documentation',
    **_lesson('docs.official_lookup', ('documentação oficial de Array.prototype.at: assinatura, índice negativo, retorno e '
     'compatibilidade; usar em tarefa'), 'Copiar exemplo de blog sem checar retorno/compatibilidade oficial.', ('Localize página oficial da API.',
     'Extraia assinatura, retorno, limites e compatibilidade.',
     'Use a API em uma função curta e cite a decisão de fallback.'), ('Entregue ficha de documentação com link oficial e lastItem(arr) que retorna '
     'arr.at(-1) ou fallback declarado.'), 'Ler docs de Object.hasOwn e aplicar em lookup de propriedade -> contrato e suporte', 18, 'Browser with official documentation', ('Consulte a documentação oficial de Array.prototype.at, registre '
     'assinatura/retorno/compatibilidade e aplique o que aprendeu numa função pequena.',
     'A busca oficial de findLast documenta que o retorno pode ser undefined quando nenhum '
     'elemento satisfaz a condição; esse caso precisa constar no contrato da função que a '
     'usa.',
     'Encontre a página oficial, anote assinatura, retorno e limite relevante, e registre '
     'a data/fonte antes de codificar.',
     'Ficha de documentação com campos fonte/data/retorno/compatibilidade e editor de '
     'função; links e controles navegáveis por teclado.',
     'Documentação oficial ECMAScript/MDN indicada pelo exercício, navegador e editor de '
     'função; consulta pontual, sem copiar tutorial de terceiros. Para a transferência, consulte Object.hasOwn: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn.',
     'Qual evidência torna uma decisão de compatibilidade verificável depois?',
     'Fonte oficial identificada com URL, ambiente alvo e data da consulta.',
     'Um exemplo de blog sem checar assinatura nem retorno.',
     'O ano em que a proposta foi aprovada, sem olhar suporte do runtime.',
     'Leia a documentação de Object.hasOwn e aplique-a numa busca por propriedade própria, '
     'registrando retorno e suporte.')),
          load={"novelty": 4, "syntax": 2, "composition": 2, "state": 1, "debugging": 1, "files": 1, "reading": 4, "independence": 4, "tools": 3}),
"13.12": C(
    'debugging.tool_choice',
    ('quatro falhas: sintaxe; valor inesperado em loop; regressão; requisito desconhecido '
     'de API'),
    ('sintaxe -> leitura/typecheck; loop -> debugger; regressão -> teste; API -> docs '
     'oficial'),
    ('caso intermitente dependente de tempo -> fake timer/log controlado; registrar '
     'evidência e ferramenta alternativa'),
    'Usar sempre Run sem hipótese ou sempre debugger para dúvida documental.',
    ('Classifique a dúvida antes da ferramenta.',
     'Escolha ferramenta que torna evidência observável.',
     'Compare custo/limite com alternativa.'),
    ('Para cada falha registre hipótese, ferramenta, evidência, conclusão e alternativa; '
     'não declare correção sem reprodução.'),
    'Diagnóstico de bug de Promise -> teste com tempo controlado e traço',
    kind='INVESTIGATE',
    estimated=20,
    runtime='Node.js 24 with a provisioned Vitest runner',
    **_lesson('debugging.tool_choice', ('quatro falhas: sintaxe; valor inesperado em loop; regressão; requisito desconhecido '
     'de API'), 'Usar sempre Run sem hipótese ou sempre debugger para dúvida documental.', ('Classifique a dúvida antes da ferramenta.',
     'Escolha ferramenta que torna evidência observável.',
     'Compare custo/limite com alternativa.'), ('Para cada falha registre hipótese, ferramenta, evidência, conclusão e alternativa; '
     'não declare correção sem reprodução.'), 'Diagnóstico de bug de Promise -> teste com tempo controlado e traço', 20, 'Node.js 24 with a provisioned Vitest runner', ('Associe cada falha à ferramenta que produz a evidência necessária. Escreva hipótese, '
     'evidência observada, limite da ferramenta e alternativa.',
     'Uma falha de sintaxe fica visível num diagnóstico de parse; um valor inesperado '
     'dentro de um loop pede observar índice/acumulador com uma entrada fixa.',
     'Classifique primeiro a pergunta: estrutura, execução, regressão, tempo ou requisito '
     'de API; só então escolha a ferramenta.',
     'Quatro cartões de falha, seletor de ferramenta, campos evidência/limite/alternativa '
     'e execução textual; teclado percorre cartões.',
     'Snippets locais, runner Vitest, debugger e links oficiais de referência; sem '
     'chamadas externas de app.',
     'Como escolher uma ferramenta de diagnóstico?',
     'Pela evidência necessária para testar a hipótese, considerando também seus limites.',
     'Sempre usar Run, qualquer que seja a pergunta.',
     'Sempre usar debugger mesmo para confirmar requisito documental.',
     'Investigue uma falha de Promise com tempo controlado e registre contexto, traço e '
     'alternativa à ferramenta escolhida.')),
          load={"novelty": 3, "syntax": 2, "composition": 3, "state": 2, "debugging": 4, "files": 2, "reading": 4, "independence": 4, "tools": 4}),
}


_LITERAL_STARTERS = {
    '13.14': [
        {"path": "migration.js", "content": "export function migrarV1ParaV2(value) { /* TODO: reutilize a migração existente de 11.13 */ }\nexport function migrarV2ParaV3(value) { /* TODO: acrescente tags sem perder prioridade */ }\nexport function carregar(storage, warn = () => {}) { /* TODO: validar por registro e gravar somente V3 válido */ }"},
        {"path": "migration.test.js", "content": "import { migrarV1ParaV2, migrarV2ParaV3, carregar } from './migration.js';\n\n// V1 (11.08): { version: 1, tasks: [{ id, text, status }] }\n// V2 (11.13): acrescenta priority ('normal' por padrão)\n// V3 (esta change request): acrescenta tags, um array de strings ([] por padrão)\n\nconst v1 = { version: 1, tasks: [{ id: 't1', text: 'Ler pauta', status: 'todo' }] };\nconst v2 = { version: 2, tasks: [{ id: 't1', text: 'Ler pauta', status: 'todo', priority: 'high' }] };\n\n// TODO: mantenha os testes de 11.13 e acrescente V1→V3, V2→V3, V3 sem nova migração,\n// tags inválidas, registro parcial e JSON inválido.\n"},
    ],
    '13.13': [
        {"path": "app.js", "content": "export function montarWidget(document) { /* TODO: associe submit, foco, texto literal e delegação */ }"},
        {"path": "tests/13.13.test.js", "content": "import {montarWidget} from '../app.js';\ndescribe('suíte DOM do widget', () => {\n  test('mantém associação de rótulo e botão de submit', () => { montarWidget(document); expect(document.querySelector('label[for=text]')).toBeTruthy(); expect(document.querySelector('#add[type=submit]')).toBeTruthy(); });\n});"},
    ],
    '13.01': "material.md: Teste: expect(paginar([1, 2, 3], 2, 2)).toEqual([3]);\nResultado recebido: [2, 3]\n\nA falha localiza uma divergência entre a saída esperada e recebida; ainda não identifica a causa.",
    '13.02': "material.md: Bloco A: if (typeof dividendo !== 'number' || !Number.isFinite(dividendo)) throw new TypeError('dividendo inválido');\nBloco B: if (typeof divisor !== 'number' || !Number.isFinite(divisor)) throw new TypeError('divisor inválido');\nBloco C: if (divisor === 0) throw new RangeError('divisor não pode ser zero');\nBloco D: return dividendo / divisor;\n\nContexto: function dividir(dividendo, divisor) { /* ordenar blocos; toda validação precede a divisão */ }",
    '13.03': "pagination.test.js: import { paginar } from './pagination.js';\n\ndescribe('paginar', () => {\n  it('retorna a primeira página', () => {\n    expect(paginar([1, 2, 3], 1, 2)).toEqual([1, 2]);\n  });\n});\n\n// Complete a suíte para contratos de borda; page e size são inteiros 1-based.",
    '13.04': "debug.js: export function somaPositivos(valores) {\n  let total = 0;\n  for (const valor of valores) {\n    if (valor > 0) total += valor;\n  }\n  return total;\n}\n\n// Preveja os estados de total para [1, -2, 3] antes de avançar o debugger.",
    '13.05': "filtro.js: export function manterDefinidos(valores) {\n  const resultado = [];\n  for (const valor of valores) {\n    if (valor) resultado.push(valor); // BUG: remove valores válidos falsy, como 0 e false.\n  }\n  return resultado;\n}\n\n// Contrato: remover somente undefined; preservar 0, false, null, strings e sua ordem.",
    '13.06': "parser.js: export function parseLinha(texto) {\n  // Formato: chave=valor;chave=valor. \\; representa ; literal e \\\\ representa \\ literal.\n  // Chave repetida: último valor vence. Segmento sem '=' ou escape incompleto: SyntaxError.\n  // Entrada vazia retorna {}.\n}\n",
    '13.07': [
        {"path": "clamp.js", "content": "export function clamp(valor, minimo, maximo) {\n  if (minimo > maximo) throw new RangeError('intervalo inválido');\n  return valor; // BUG: deveria limitar o valor aos extremos.\n}\n\n// Primeiro escreva um teste que falhe para clamp(-5, 0, 10); depois corrija."},
        {"path": "tests/clamp.test.js", "content": "import {clamp} from '../clamp.js';\ndescribe('clamp regression', () => { test('lower-bound regression', () => { expect(clamp(-5, 0, 10)).toBe(0); }); });"},
    ],
    '13.08': "library.js: export function clamp(valor, minimo, maximo) {}\nexport function unique(valores) {}\nexport function paginar(valores, pagina, tamanho) {}\n\n// API ESM pública; registre entrada, saída, erros, mutação e ordem para cada função.",
    '13.09': "retry.test.js: import { retry } from './retry.js';\nimport { vi, expect, it } from 'vitest';\n\nit('retorna o resultado de uma operação bem-sucedida', async () => {\n  const operation = vi.fn(async () => 'ok');\n  const timer = (fn, ms) => { fn(); return 1; };\n  expect(await retry(operation, 2, 10, timer)).toBe('ok');\n});\n\n// Amplie para falha transitória, limite de tentativas, atraso e limpeza entre testes.",
    '13.10': "service.js: export async function carregarConfiguracao(readFile) {\n  try {\n    return await readFile();\n  } catch (erro) {\n    throw new Error(String(erro));\n  }\n}\n\n// BUG: a causa original foi descartada e o texto externo pode expor detalhes indevidos.",
    '13.11': "indices.js: const itens = ['a', 'b', 'c'];\nconsole.log(itens.at(0));\nconsole.log(itens.at(-1));\nconsole.log(itens.at(3));\n\n// Compare índice fora dos limites, índice negativo e o uso equivalente com bracket access.",
    '13.12': "material.md: Falha: teste de retry expira após 5 s.\nEvidências disponíveis: log de chamadas, relógio do teste e stack trace.\nHipótese inicial: timer real foi usado junto com relógio falso.\n\nEscolha a ferramenta que pode confirmar a hipótese e anote o que ela não prova.",
}
for _card_id, _starter in _LITERAL_STARTERS.items():
    CONTENT[_card_id]["starter"] = _starter

# A etapa 13 estende as versões existentes do Kanban; o catálogo de estoque é só transferência.
CONTENT["13.14"]["starter"] = _LITERAL_STARTERS["13.14"]
CONTENT["13.14"]["solution"] = (
    "Implemente migrarV2ParaV3 como função pura: acrescente tags:[] quando ausente, preserve "
    "tags válidas e todos os campos V2, inclusive priority. O loader aceita V1, V2 e V3, aplica "
    "a migração V1→V2 de 11.13 a entradas V1 e depois V2→V3; valida por registro e só "
    "grava V3 após conversão segura. Preserve os testes e a interface existentes."
)
CONTENT["13.14"]["hidden"] = (
    "V1 do Kanban 11.08 -> passa por V1→V2 de 11.13 e então V2→V3; V2 com priority='high' -> "
    "V3 mantém high e recebe tags:[]; tags inválidas -> [] com aviso; registro parcial é "
    "reportado sem perder outros itens; V3 não migra novamente; JSON inválido não sobrescreve storage"
)
CONTENT["13.14"]["failure"] = (
    "A versão V1 não percorre as duas migrações; tarefas, priority ou tags se perdem, ou "
    "V3 é convertido de novo ao carregar."
)

# Defina a gramática de escape antes dos testes ocultos.
CONTENT["13.06"]["hidden"] = (
    "chave repetida -> último valor; \\; decodifica como ; e \\\\ como \\; segmento sem '=' "
    "ou barra invertida final -> SyntaxError; entrada vazia -> {}"
)
CONTENT["13.05"]["failure"] = (
    "manterDefinidos([0, false, null, undefined]) omite 0/false/null ou mantém undefined, "
    "revelando filtro por truthiness no lugar do contrato.")
CONTENT["13.06"]["failure"] = (
    "Uma chave repetida não segue a política de último valor, ou um separador escapado é "
    "tratado como delimitador; escape incompleto deve produzir SyntaxError.")
CONTENT["13.07"]["failure"] = (
    "O teste que chama clamp(-5, 0, 10) passa antes da correção ou o valor continua abaixo "
    "do mínimo; a regressão precisa falhar primeiro.")
_OBSERVABLE_FAILURES = {
    '13.14': 'A versão V1 não percorre V1→V2→V3, prioridade existente se perde ou V3 é migrada outra vez.',
    '13.13': 'O teste não detecta falha de teclado/foco/associação ou confunde checagem DOM com experiência completa de leitor de tela.',
    '13.01': 'A resposta afirma causa apenas pela diferença entre esperado e recebido, sem reduzir e inspecionar a expressão.',
    '13.02': 'Divisão ocorre antes da validação; string/Infinity e divisor zero não produzem os erros publicados.',
    '13.03': 'Página/tamanho inválido não falha ou última página, além do fim e não mutação divergem do contrato.',
    '13.04': 'Total previsto deixa de acompanhar o acumulador em uma iteração sem que a primeira divergência seja localizada.',
    '13.05': '0/false/null são descartados ou undefined permanece, reproduzindo o filtro por truthiness.',
    '13.06': 'Separador escapado divide o valor ou chave repetida/escape incompleto diverge da gramática publicada.',
    '13.07': 'O caso regressivo não falha antes do fix ou clamp continua abaixo do mínimo/acima do máximo.',
    '13.08': 'A API passa exemplos comuns, mas viola erro, borda, ordenação ou não mutação explicitamente contratados.',
    '13.09': 'O teste depende de relógio/rede real ou deixa timers e mocks ativos para o próximo teste.',
    '13.10': 'O erro externo perde cause ou sua mensagem interna/segredo aparece ao usuário.',
    '13.11': 'Índice negativo/out-of-range diverge de Array.prototype.at ou a decisão ignora compatibilidade do runtime.',
    '13.12': 'A ferramenta escolhida não mostra a evidência necessária ou a conclusão excede o que a observação prova.',
}
for _card_id, _failure in _OBSERVABLE_FAILURES.items():
    CONTENT[_card_id]["failure"] = _failure

_OFFICIAL_DOCS = {
    '13.14': 'https://vitest.dev/guide/learn/writing-tests',
    '13.13': 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets',
    '13.01': 'https://vitest.dev/guide/learn/writing-tests',
    '13.02': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RangeError',
    '13.03': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
    '13.04': 'https://developer.chrome.com/docs/devtools/javascript/',
    '13.05': 'https://nodejs.org/en/learn/getting-started/debugging',
    '13.06': 'https://vitest.dev/guide/',
    '13.07': 'https://vitest.dev/guide/learn/writing-tests',
    '13.08': 'https://vitest.dev/guide/learn/writing-tests',
    '13.09': 'https://vitest.dev/guide/mocking/timers',
    '13.10': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause',
    '13.11': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at',
    '13.12': 'https://nodejs.org/en/learn/getting-started/debugging',
}
for _card_id, _official_url in _OFFICIAL_DOCS.items():
    CONTENT[_card_id]["docs"] = _official_url

# Revisão editorial de 05/10/2026: enunciado, starter e contrato realinhados.
CONTENT["13.14"]["content_version"] = 2


# Fase 4 (análise curricular, item 4.6): subclasses de Error com cause e Error.isError com fallback (item 5.3).
CONTENT["13.15"] = E(
    "errors.custom_cause",
    "main.js: export class ErroPagamento extends Error { /* defina name e repasse as opções (cause) ao super */ } export function pagar(valor, gateway) { return undefined; } export function ehErro(valor) { return false; }",
    'pagar(10, {cobrar: v => v}) -> 10; pagar(0, {cobrar: v => v}) -> lança ErroPagamento "valor deve ser positivo"',
    'pagar(5, {cobrar() { throw new Error("recusado"); }}) -> ErroPagamento com cause.message "recusado"; ehErro({name: "Error", message: "x"}) -> false',
    "Relançar o erro do gateway sem contexto, criar classe de erro sem name e sem cause, ou identificar erro só pela mensagem.",
    "A camada de cima recebe 'recusado' sem saber que a falha veio da cobrança; o erro não tem tipo nem causa para distinguir falha de cobrança de valor inválido.",
    "Como o chamador distingue um erro de domínio de uma falha técnica sem perder a causa original?",
    ("Um erro de domínio é uma classe própria; cause guarda o erro original sem misturar mensagens.", "Em super(mensagem, { cause }) a causa fica em error.cause. Para checar se algo é erro, use Error.isError quando existir e instanceof Error como fallback.", "Exemplo parecido: class ErroCadastro extends Error { constructor(m, o) { super(m, o); this.name = 'ErroCadastro'; } }."),
    "export class ErroPagamento extends Error { constructor(mensagem, opcoes) { super(mensagem, opcoes); this.name = 'ErroPagamento'; } } export function pagar(valor, gateway) { if (valor <= 0) throw new ErroPagamento('valor deve ser positivo'); try { return gateway.cobrar(valor); } catch (erro) { throw new ErroPagamento('falha ao cobrar', { cause: erro }); } } export function ehErro(valor) { return typeof Error.isError === 'function' ? Error.isError(valor) : valor instanceof Error; }",
    "Falha ao ler configuração -> erro de domínio com cause apontando para o erro do sistema de arquivos",
    kind="MAKE", estimated=24, load={"novelty": 4, "syntax": 3, "composition": 3, "state": 2, "debugging": 3, "files": 2, "reading": 3, "independence": 3, "tools": 2},
    runtime="Node.js 24.x, módulos ES, sem DOM.",
    compatibility="Error cause é ES2022. Error.isError exige Node.js 24.3.0 e está marcado na matriz de recursos; sem ele, a atividade usa instanceof Error como fallback declarado.",
    explanation={
        "mental_model": "Um erro tem tipo (classe), mensagem e causa. Subclasses dão tipo ao que o domínio precisa tratar; cause prende o erro original para quem depura, sem reescrever a mensagem.",
        "worked_example": "Quando gateway.cobrar lança Error('recusado'), pagar captura o erro e lança ErroPagamento('falha ao cobrar', {cause}); o chamador lê error.cause.message.",
        "common_trap": "Esquecer this.name: o erro continua com o nome 'Error' e a classe fica invisível em logs. Também é comum distinguir erros só pelo texto da mensagem.",
        "why_it_matters": "Tratar cada tipo de falha do jeito certo depende de identificar o tipo sem ler texto. A causa evita perder o que originou a falha.",
    },
    first_response="Escreva as duas categorias de erro que pagar pode lançar e o que cada uma deve carregar.",
    first_response_timing="Antes do primeiro Run.",
    interaction="Lista de erros lançados com tipo, mensagem e causa lado a lado, anunciada em texto.",
    resources=("MDN: Error.cause — https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error/cause", "MDN: Error.isError — https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error/isError"),
    review={
        "prompt": "Qual chamada preserva o erro original sem trocar a mensagem do novo erro?",
        "choices": ["new ErroPagamento('falha ao cobrar', { cause: erro })", "new ErroPagamento(erro.message)", "throw erro"],
        "answer": "new ErroPagamento('falha ao cobrar', { cause: erro })",
        "feedback_correct": "A opção cause guarda o erro original em error.cause, e a mensagem continua a da camada atual.",
        "feedback_incorrect": "Repassar só a mensagem perde o objeto original; relançar o erro não diz em que camada a falha foi tratada.",
    },
    transfer_prompt="Crie um erro de domínio para falha ao ler configuração que preserve a causa do sistema de arquivos. Mostre no teste que error.cause aponta para o erro original e que name identifica a classe.",
    prompt="Implemente ErroPagamento, pagar e ehErro. Antes de executar, diga qual name e qual cause um erro lançado pelo gateway deve ter ao chegar ao chamador.",
)
