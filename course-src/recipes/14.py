from recipe_api import C
_MENTAL_MODELS = {'tooling.bundler_model': 'Ferramentas de build transformam e organizam arquivos para '
                          'distribuição; isso é uma etapa de produção, separada da semântica do '
                          'programa em runtime.',
 'runtime.event_loop_context': 'Ordem de callbacks depende do runtime e do contexto de execução; '
                               'uma observação local não estabelece uma regra universal.',
 'modules.dependency_graph': 'Um grafo mostra relações de dependência. Pertencer a um ciclo requer '
                             'participar do caminho que retorna ao ponto de partida.',
 'node.cli_entry': 'A linha de comando é uma fronteira entre convenções do processo e operações '
                   'reutilizáveis da aplicação.',
 'npm.scripts': 'Scripts de pacote são nomes ligados a comandos concretos e caminhos do projeto; '
                'sua utilidade depende dessa configuração corresponder aos arquivos e ambiente.',
 'modules.esm_cjs': 'CommonJS e ES modules definem formas de ligação entre módulos; o formato '
                    'precisa ser coerente ao longo da fronteira entre consumidor e fornecedor.',
 'node.module_relative_paths': 'O diretório de execução e a localização do módulo têm origens '
                               'diferentes; caminhos devem expressar qual deles define o recurso.',
 'node.environment_config': 'Variáveis de ambiente chegam como texto externo; a aplicação precisa '
                            'atribuir significado, domínio válido e política de exposição.',
 'compatibility.feature_decision': 'Uma especificação descreve uma capacidade da plataforma; '
                                   'disponibilidade concreta depende do runtime e da versão '
                                   'escolhida.',
 'node.notes_cli': 'Aplicações de linha de comando combinam entrada do processo, regras de domínio '
                   'e persistência, que têm responsabilidades distintas.',
 'git.workflow': 'Git registra estados e diferenças entre versões. Revisar essas evidências torna '
                 'mudanças e integrações mais compreensíveis.',
 'modules.esm_graph': 'Carregamento de módulos envolve ligação de dependências e avaliação de '
                      'código; a ordem dessas etapas importa para efeitos e valores.',
 'npm.dependency_decision': 'Dependências carregam custo e responsabilidade ao longo do tempo; '
                            'popularidade é só uma dimensão da decisão.'}

def _lesson(skill, starter, misconception, _hints, _solution, transfer, estimate, runtime, row):
    (task, example, first, interaction, resources, q, answer, wrong1, wrong2, transfer_task) = row
    minutes = min(4, max(1, (estimate + 5) // 6))
    transfer_scenario = transfer.split("->", 1)[0].strip()
    mental_model = _MENTAL_MODELS[skill]
    runtime_notes = {
        "browser": "Compatibilidade: navegador atual com APIs DOM; execução local, sem serviço externo.",
        "Node.js": "Compatibilidade: Node.js atual conforme runtime indicado; código local, sem credenciais.",
        "Node.js 24 LTS": "Compatibilidade: Node.js 24 LTS; use somente APIs e módulos declarados.",
        "Node.js 24 LTS (ES modules)": "Compatibilidade: Node.js 24 LTS com módulos ES.",
        "Node.js 24 + browser": "Compatibilidade: Node.js 24 e navegador atual, com exemplos executados no ambiente indicado.",
        "Node.js + browser": "Compatibilidade: Node.js e navegador atual; compare os contextos separadamente.",
        "Git": "Compatibilidade: Git CLI local em repositório descartável; sem remoto, conta ou credenciais.",
    }
    if runtime.startswith("Browser with official documentation"):
        runtime_note = "Compatibilidade: navegador atual e documentação oficial acessível; registre fonte e data."
    else:
        runtime_note = runtime_notes.get(runtime, f"Compatibilidade: {runtime}; use os recursos nativos e fixtures locais descritos.")
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
"14.12": C(
    'tooling.bundler_model',
    ('projeto ESM main.js importa math.js e style.css; configuração mínima de bundler; '
     'comparar source/output'),
    'build -> entrada processada, chunks/assets gerados e source map apontando ao original',
    ('import dinâmico -> chunk separado se ferramenta/config permitir; build sem sourcemap '
     '-> depuração menos clara; bundle não valida dados runtime'),
    'Achar que bundler é requisito da linguagem ESM ou que substitui testes.',
    ('Execute ESM nativo primeiro.',
     'Compare grafo fonte e arquivos de saída.',
     'Registre transformação, assets, source map e limites.'),
    ('Experimento documenta por que usar bundler no projeto e quando módulos nativos '
     'bastam; nenhuma framework exigida.'),
    'Empacotar widget pequeno com CSS -> saída e source map explicados',
    kind='COMPARE',
    runtime='Node.js + browser',
    estimated=12,
    **_lesson('tooling.bundler_model', ('projeto ESM main.js importa math.js e style.css; configuração mínima de bundler; '
     'comparar source/output'), 'Achar que bundler é requisito da linguagem ESM ou que substitui testes.', ('Execute ESM nativo primeiro.',
     'Compare grafo fonte e arquivos de saída.',
     'Registre transformação, assets, source map e limites.'), ('Experimento documenta por que usar bundler no projeto e quando módulos nativos '
     'bastam; nenhuma framework exigida.'), 'Empacotar widget pequeno com CSS -> saída e source map explicados', 12, 'Node.js + browser', ('Analise o que o bundler transforma e o que continua sendo responsabilidade do '
     'runtime. Compare os arquivos de origem com a saída e registre os limites da '
     'ferramenta.',
     'Um mapa interativo pode importar uma imagem e um módulo de dados; o build pode '
     'emitir arquivos de saída e manter um mapa de origem que aponta para o módulo '
     'original.',
     'Antes do build, anote os arquivos esperados e quais evidências mostrariam '
     'transformação, divisão e depuração do código.',
     'Comparador árvore-fonte/artefatos, painel de configuração e perguntas textuais sobre '
     'source map; tudo navegável por teclado.',
     'Projeto ESM mínimo com CSS e asset local, build do bundler, pasta de saída e source '
     'map; sem framework ou deploy.',
     'O que um bundler não garante só por produzir arquivos de saída?',
     'Que os dados recebidos em runtime sejam válidos ou que os testes estejam corretos.',
     'Que toda aplicação ESM precise de bundler para funcionar.',
     'Que o source map substitua a inspeção dos artefatos.',
     'Empacote um widget pequeno com CSS, compare a saída gerada e explique o que o source '
     'map permite depurar.')),
          load={"novelty": 4, "syntax": 3, "composition": 4, "state": 3, "debugging": 3, "files": 5, "reading": 4, "independence": 4, "tools": 5}),
"14.13": C(
    'runtime.event_loop_context',
    ('dois snippets rotulados: browser Promise.then,setTimeout; Node ESM '
     'process.nextTick,Promise.then; prever com contexto'),
    'browser síncrono A, Promise P, timer T -> A,P,T',
    ('Node nextTick versus Promise em ESM/top-level -> ordem depende de contexto; executar '
     'no runtime declarado e registrar versão; não aplicar regra de CJS universalmente'),
    'Dizer sempre nextTick antes de Promise sem informar CJS/ESM e fase.',
    ('Comece com ordem síncrona e filas do navegador.',
     'Em Node declare versão e formato de módulo.',
     'Compare saída observada e fonte oficial para a situação.'),
    ('Tabela separa garantias do browser de detalhes de Node; previsão Node inclui '
     'contexto e verificação, sem regra universal falsa.'),
    'Investigar ordem de callback I/O e microtasks em Node -> contexto antes da previsão',
    kind='COMPARE',
    runtime='Node.js 24 + browser',
    estimated=12,
    **_lesson('runtime.event_loop_context', ('dois snippets rotulados: browser Promise.then,setTimeout; Node ESM '
     'process.nextTick,Promise.then; prever com contexto'), 'Dizer sempre nextTick antes de Promise sem informar CJS/ESM e fase.', ('Comece com ordem síncrona e filas do navegador.',
     'Em Node declare versão e formato de módulo.',
     'Compare saída observada e fonte oficial para a situação.'), ('Tabela separa garantias do browser de detalhes de Node; previsão Node inclui '
     'contexto e verificação, sem regra universal falsa.'), 'Investigar ordem de callback I/O e microtasks em Node -> contexto antes da previsão', 12, 'Node.js 24 + browser', ('Faça previsões separadas para navegador e Node, anotando versão, formato do módulo e '
     'contexto de execução. Não transforme uma observação contextual em regra universal.',
     'Quando um timer do navegador executa, ele pode agendar uma Promise; essa reação só '
     'roda depois que o callback atual termina e antes da próxima task de timer.',
     'Registre primeiro ambiente, módulo e fase de execução para cada snippet; depois '
     'monte sua previsão e execute no mesmo contexto.',
     'Duas trilhas separadas para browser/Node, seletor de versão/contexto e tabela de '
     'callbacks; resultados em texto e teclado.',
     'Snippets locais identificados por runtime, Node.js 24, console do browser e saída de '
     'cada ambiente; sem serviço externo.',
     'Por que não se deve generalizar uma ordem de callbacks de Node sem declarar '
     'contexto?',
     'O formato CJS/ESM e a fase podem alterar a observação; a versão e o contexto '
     'precisam ser registrados.',
     'Todo callback nextTick precede qualquer Promise em qualquer módulo e fase.',
     'A ordem do navegador pode ser aplicada sem ajuste ao event loop de Node.',
     'Investigue callbacks de I/O e microtasks em Node, registrando versão, formato e fase '
     'antes de propor a ordem.')),
          load={"novelty": 4, "syntax": 3, "composition": 4, "state": 5, "debugging": 3, "files": 4, "reading": 4, "independence": 4, "tools": 4}),
"14.01": C(
    'modules.dependency_graph',
    'grafo A->B->C->A, D->B, E isolado; desenhe dependências',
    'ciclo -> A,B,C; extrair contrato comum X -> A/B/C dependem de X sem volta',
    ('D aponta ao ciclo -> D não pertence a ele; import de tipo isolado não apaga import '
     'runtime de valor'),
    'Marcar qualquer módulo que aponta ao ciclo como parte dele.',
    ('Siga arestas até voltar ao ponto inicial.',
     'Separe dependente do componente cíclico.',
     'Extraia abstração estável sem fazer X depender dos consumidores.'),
    ('Identifique ciclo A-B-C-A e proponha módulo X de interface/função compartilhada com '
     'grafo acíclico.'),
    'Ciclo service/repository/model -> fronteira comum',
    kind='READ',
    estimated=10,
    runtime='Node.js 24 LTS (ES modules)',
    **_lesson('modules.dependency_graph', 'grafo A->B->C->A, D->B, E isolado; desenhe dependências', 'Marcar qualquer módulo que aponta ao ciclo como parte dele.', ('Siga arestas até voltar ao ponto inicial.',
     'Separe dependente do componente cíclico.',
     'Extraia abstração estável sem fazer X depender dos consumidores.'), ('Identifique ciclo A-B-C-A e proponha módulo X de interface/função compartilhada com '
     'grafo acíclico.'), 'Ciclo service/repository/model -> fronteira comum', 10, 'Node.js 24 LTS (ES modules)', ('Identifique exatamente os nós que pertencem ao ciclo e proponha uma fronteira comum '
     'que quebre a dependência sem criar um novo ciclo.',
     'Se módulos carrinho, preço e estoque dependem em círculo, um módulo de tipos/regras '
     'compartilhadas pode receber contrato estável desde que não importe os consumidores.',
     'Siga cada aresta até retornar ao ponto inicial e marque separadamente os módulos que '
     'apenas apontam para o ciclo.',
     'Grafo de dependências editável por teclado com adicionar/remover aresta e painel de '
     'componentes fortemente conectados.',
     'Grafo inicial, editor de módulo compartilhado e verificador local de ciclos; console '
     'com lista de dependências.',
     'Um módulo que aponta para um ciclo pertence automaticamente ao ciclo?',
     'Não; ele é dependente do componente cíclico, mas pode não fazer parte do caminho que '
     'volta ao início.',
     'Sim; qualquer aresta de entrada o coloca dentro do ciclo.',
     'Não há diferença entre módulo cíclico e consumidor do ciclo.',
     'Desenhe dependências entre service/repository/model e proponha uma fronteira comum '
     'que deixe o grafo acíclico.')),
          load={"novelty": 3, "syntax": 1, "composition": 2, "state": 1, "debugging": 3, "files": 2, "reading": 4, "independence": 3, "tools": 1}),
"14.02": C(
    'node.cli_entry',
    ('blocos: process.argv.slice(2), validar comando, parse args, chamar função de '
     'domínio, imprimir e definir exitCode'),
    "node cli.js add 'A' -> domínio recebe add/A e saída confirma A",
    ('comando desconhecido -> mensagem de uso e exitCode=2; função de domínio não lê '
     'process.argv diretamente'),
    'Espalhar leitura do processo dentro da lógica de domínio.',
    ('Entrada CLI fica na borda.',
     'Valide antes de invocar domínio.',
     'Formate saída/erro depois do resultado.'),
    'Reordene parse/validação/chamada/apresentação e deixe domínio invocável sem processo.',
    'CLI para listar tarefas com argumento opcional -> camada de borda',
    kind='PARSONS',
    runtime='Node.js',
    estimated=10,
    **_lesson('node.cli_entry', ('blocos: process.argv.slice(2), validar comando, parse args, chamar função de '
     'domínio, imprimir e definir exitCode'), 'Espalhar leitura do processo dentro da lógica de domínio.', ('Entrada CLI fica na borda.',
     'Valide antes de invocar domínio.',
     'Formate saída/erro depois do resultado.'), 'Reordene parse/validação/chamada/apresentação e deixe domínio invocável sem processo.', 'CLI para listar tarefas com argumento opcional -> camada de borda', 10, 'Node.js', ('Ordene a entrada CLI para separar leitura de argumentos, validação, chamada ao '
     'domínio e apresentação. Mantenha o domínio invocável sem process.argv.',
     'Um comando de exportação pode validar o formato solicitado na borda e então chamar '
     'uma função de domínio recebendo uma opção já estruturada, sem ler argumentos de '
     'processo.',
     'Marque o ponto em que dados externos se tornam entrada validada e só depois conecte '
     'a função de domínio.',
     'Blocos de CLI reordenáveis por teclado, fluxo argumento→resultado e captura textual '
     'de stdout/exit code.',
     'Blocos process.argv/parse/validação, função de domínio simulada e terminal local; '
     'sem subprocesso real obrigatório.',
     'Onde deve ocorrer a leitura de process.argv?',
     'Na borda da aplicação, antes de validar e chamar o domínio.',
     'Dentro de cada regra de domínio que precisa do comando.',
     'Depois de imprimir sucesso para decidir qual saída produzir.',
     'Adapte a CLI para listar tarefas com um argumento opcional mantendo a regra '
     'independente do processo.')),
          load={"novelty": 3, "syntax": 3, "composition": 3, "state": 3, "debugging": 2, "files": 3, "reading": 3, "independence": 3, "tools": 3}),
"14.03": C(
    'npm.scripts',
    'package.json incompleto; src/main.js; test/*.test.js; scripts dev,test,start',
    ('npm run dev -> node --watch src/main.js; npm test -> vitest run; npm start -> node '
     'src/main.js'),
    ('script ausente -> npm run falha; package type module combina com imports ESM; '
     'lockfile versionado'),
    'Copiar scripts que apontam para arquivo inexistente ou misturar CJS/ESM.',
    ('Liste arquivos de entrada reais.',
     'Associe um comando a cada modo.',
     'Cheque package type e dependência vitest.'),
    ('Preencha scripts com caminhos reais e verifique que test termina, dev observa e '
     'start executa uma vez.'),
    'Scripts para app com src/server.js -> caminhos coerentes',
    kind='FADED',
    runtime='Node.js',
    estimated=10,
    **_lesson('npm.scripts', 'package.json incompleto; src/main.js; test/*.test.js; scripts dev,test,start', 'Copiar scripts que apontam para arquivo inexistente ou misturar CJS/ESM.', ('Liste arquivos de entrada reais.',
     'Associe um comando a cada modo.',
     'Cheque package type e dependência vitest.'), ('Preencha scripts com caminhos reais e verifique que test termina, dev observa e '
     'start executa uma vez.'), 'Scripts para app com src/server.js -> caminhos coerentes', 10, 'Node.js', ('Complete os scripts dev/test/start usando caminhos que existem, formato de módulo '
     'coerente e comando apropriado para cada ciclo de trabalho.',
     'Um projeto pode ter um script check que aponta para src/check.js; o nome bonito do '
     'script não ajuda se o arquivo ou executável não existe.',
     'Inspecione arquivos/dependências antes de escrever os valores em scripts e depois '
     'confira quais comandos rodam uma vez ou observam mudanças.',
     'Editor de package.json com validação de caminho, previsão do comportamento do script '
     'e feedback em texto; teclado total.',
     'package.json incompleto, árvore de arquivos src/test e instalação local indicada; '
     'terminal didático simula dev/test/start sem rede.',
     'O que precisa ser verificado além do nome do script no package.json?',
     'O caminho de entrada, as dependências e a compatibilidade com o formato de módulos '
     'do pacote.',
     'Que dev, test e start sejam todos aliases do mesmo comando.',
     'Que o lockfile não seja versionado para permitir versões variadas.',
     'Configure scripts para uma aplicação com src/server.js, distinguindo execução única '
     'e modo de desenvolvimento.')),
          load={"novelty": 2, "syntax": 2, "composition": 3, "state": 1, "debugging": 1, "files": 3, "reading": 3, "independence": 2, "tools": 3}),
"14.04": C(
    'modules.esm_cjs',
    "CJS: module.exports={soma}; require('./math'); converter pacote para ESM",
    ('package.json type=module; math.js export function soma; main.js import {soma} from '
     "'./math.js' -> 3"),
    ('require direto em ESM -> ReferenceError; extensão .js em import relativo Node ESM; '
     'exportações padrão e nomeadas consistentes'),
    'Achar que trocar uma palavra em package.json converte imports automaticamente.',
    ('Defina o formato do pacote.',
     'Converta export e import em conjunto.',
     'Execute entrada com caminhos/extension corretos.'),
    ('Edite package type, math export nomeado e main import relativo com extensão; '
     'documente fronteira com dependência CJS se houver.'),
    'Converter módulo de formatter CJS para ESM -> mesmo resultado',
    kind='COMPARE',
    runtime='Node.js',
    estimated=12,
    **_lesson('modules.esm_cjs', "CJS: module.exports={soma}; require('./math'); converter pacote para ESM", 'Achar que trocar uma palavra em package.json converte imports automaticamente.', ('Defina o formato do pacote.',
     'Converta export e import em conjunto.',
     'Execute entrada com caminhos/extension corretos.'), ('Edite package type, math export nomeado e main import relativo com extensão; '
     'documente fronteira com dependência CJS se houver.'), 'Converter módulo de formatter CJS para ESM -> mesmo resultado', 12, 'Node.js', ('Converta o pacote CommonJS para ESM de modo consistente: formato declarado, exports, '
     'imports relativos com extensão e execução.',
     'Um módulo de validação pode trocar module.exports/require por export nomeado/import '
     'relativo; tanto produtor quanto consumidor precisam usar o mesmo formato.',
     'Faça uma tabela do que o arquivo exporta e do que cada consumidor importa antes de '
     'mudar package.json ou sintaxe.',
     'Comparador CommonJS/ESM, editor de dois módulos, checagem de import e saída de '
     'execução; teclado navega arquivos.',
     'Pacote local CommonJS com módulo/consumidor e Node.js para executar depois da '
     'conversão; sem instalar dependências.',
     'O que precisa mudar junto quando o pacote passa a declarar ESM?',
     'As sintaxes de export/import e os caminhos relativos devem corresponder ao novo '
     'formato.',
     'Somente o campo type do package.json converte require automaticamente.',
     'Apenas os arquivos consumidores mudam; exports permanecem como estão.',
     'Converta um módulo de formatação de data de CommonJS para ESM preservando a API que '
     'o consumidor espera.')),
          load={"novelty": 3, "syntax": 3, "composition": 4, "state": 3, "debugging": 2, "files": 4, "reading": 3, "independence": 3, "tools": 4}),
"14.05": C(
    'node.module_relative_paths',
    "readFileSync('./data/config.json') quebra ao chamar CLI de outro cwd; módulo ESM",
    ('executar no diretório do projeto -> carrega; executar de /tmp -> carrega o mesmo '
     'arquivo junto ao módulo'),
    ("caminho com espaço -> new URL('./data/config.json',import.meta.url) resolve; arquivo "
     'ausente -> erro contextual com cause'),
    'Pensar que caminho relativo de fs se refere ao arquivo fonte.',
    ('process.cwd aponta diretório de execução.',
     'import.meta.url aponta módulo.',
     'new URL(relative,import.meta.url) produz URL aceitável por fs.'),
    ("Use readFile(new URL('./data/config.json', import.meta.url), 'utf8') e envolva erro "
     'com causa contextual.'),
    'CLI instalado globalmente lê template ao lado do módulo -> independente do cwd',
    kind='DEBUG',
    runtime='Node.js',
    estimated=22,
    **_lesson('node.module_relative_paths', "readFileSync('./data/config.json') quebra ao chamar CLI de outro cwd; módulo ESM", 'Pensar que caminho relativo de fs se refere ao arquivo fonte.', ('process.cwd aponta diretório de execução.',
     'import.meta.url aponta módulo.',
     'new URL(relative,import.meta.url) produz URL aceitável por fs.'), ("Use readFile(new URL('./data/config.json', import.meta.url), 'utf8') e envolva erro "
     'com causa contextual.'), 'CLI instalado globalmente lê template ao lado do módulo -> independente do cwd', 22, 'Node.js', ('Corrija a resolução do arquivo para que o CLI encontre seu recurso ao ser chamado de '
     'qualquer diretório de trabalho. Contextualize erro ausente com causa.',
     'Um módulo de importação pode localizar schema.json relativo à própria URL ao ser '
     'chamado por um teste iniciado em outra pasta.',
     'Escreva a diferença entre diretório de execução e URL do módulo antes de trocar a '
     'expressão de caminho.',
     'Painel de diretórios de trabalho, árvore de arquivos do módulo e comparador do '
     'caminho resolvido; tudo em texto.',
     'Módulo ESM, arquivo local de configuração, controle para alternar cwd simulado e '
     'console Node.',
     'O que import.meta.url representa nesse caso?',
     'A localização do módulo atual, útil para resolver um recurso que fica ao lado dele.',
     'O diretório de onde o usuário executou o CLI.',
     'O caminho absoluto do arquivo de entrada passado em process.argv.',
     'Faça um CLI instalado globalmente localizar o template distribuído ao lado de seu '
     'módulo, qualquer que seja o cwd.')),
          load={"novelty": 3, "syntax": 3, "composition": 3, "state": 4, "debugging": 4, "files": 4, "reading": 3, "independence": 4, "tools": 4}),
"14.06": C(
    'node.environment_config',
    'loadConfig(env) recebe PORT, LOG_LEVEL, TOKEN; defaults PORT=3000, LOG_LEVEL=info',
    "env vazio -> port 3000/logLevel info; PORT='8080' -> 8080",
    ("PORT='abc'/0/65536 -> RangeError; TOKEN ausente em produção -> erro; nunca imprimir "
     'TOKEN em mensagem/log'),
    'Usar || sobre strings sem validar ou publicar segredo em erro.',
    ('Injete env para testar.',
     'Parseie porta inteira dentro de 1..65535.',
     'Separe segredo da saída e valide por modo.'),
    ('Função pura parseia env, aplica defaults seguros e rejeita inválidos; retorno é '
     'configuração tipada, logs redigem token.'),
    'Config de timeout e ambiente -> defaults e validação explícitos',
    kind='MAKE',
    runtime='Node.js',
    estimated=25,
    **_lesson('node.environment_config', 'loadConfig(env) recebe PORT, LOG_LEVEL, TOKEN; defaults PORT=3000, LOG_LEVEL=info', 'Usar || sobre strings sem validar ou publicar segredo em erro.', ('Injete env para testar.',
     'Parseie porta inteira dentro de 1..65535.',
     'Separe segredo da saída e valide por modo.'), ('Função pura parseia env, aplica defaults seguros e rejeita inválidos; retorno é '
     'configuração tipada, logs redigem token.'), 'Config de timeout e ambiente -> defaults e validação explícitos', 25, 'Node.js', ('Implemente loadConfig(env) como função pura: leia defaults, converta e valide porta '
     'e nível, exija segredo no ambiente adequado e nunca o exponha em mensagens.',
     'Uma configuração em ambiente de teste pode usar um timeout padrão; em produção, '
     'ausência de um identificador obrigatório deve gerar erro contextual sem incluir seu '
     'valor secreto.',
     'Liste cada variável como texto de entrada, tipo/intervalo de saída e regra de '
     'segredo antes de codificar.',
     'Tabela interativa de env→config/erro, campo de modo, editor da função e saída '
     'textual com redação de segredo.',
     'Função loadConfig isolada, conjunto de env fixtures locais e console; nenhuma '
     'variável real do sistema é lida.',
     'Por que injetar env em loadConfig?',
     'Para testar combinações de configuração de forma determinística sem depender do '
     'processo real.',
     'Para registrar todas as variáveis, inclusive segredos, no console.',
     'Para deixar strings numéricas sem validação porque o ambiente já é tipado.',
     'Defina defaults e validação para timeout em diferentes modos, mantendo segredos fora '
     'da saída.')),
          load={"novelty": 3, "syntax": 3, "composition": 4, "state": 3, "debugging": 2, "files": 2, "reading": 3, "independence": 4, "tools": 3}),
"14.07": C(
    'compatibility.feature_decision',
    ('recurso moderno proposto: Promise.try; baseline do projeto fixado em runtime '
     'nomeado; consultar docs oficiais'),
    ('suporte verificado no baseline -> usar; sem suporte -> fallback fiel try{return '
     'Promise.resolve(fn())}catch(e){return Promise.reject(e)}'),
    ('callback lança -> fallback retorna rejeição sem deixar throw síncrono escapar; '
     'Promise.resolve().then(fn) posterga a chamada para microtask e não é equivalente; '
     'transpilador transforma sintaxe mas não garante API runtime; registrar versão/data '
     'da consulta'),
    ('Confundir ano da proposta com suporte em navegador/Node alvo ou tratar '
     'Promise.resolve().then como fallback semanticamente idêntico.'),
    ('Declare runtime e versão antes da consulta.',
     'Leia tabela/nota oficial de suporte.',
     'Escolha fallback e compare quando fn é chamado e como throws são tratados.'),
    ('Ficha registra recurso, baseline, fonte oficial, data, decisão e alternativa. '
     'Fallback fiel chama fn dentro de try, converte retorno com Promise.resolve e exceção '
     'com Promise.reject; documente que trocar o momento da chamada muda semântica.'),
    'Avaliar Iterator helpers em runtime alvo -> usar, fallback ou adiar',
    kind='DOCS',
    estimated=18,
    runtime='Node.js 24 LTS (ES modules)',
    **_lesson('compatibility.feature_decision', ('recurso moderno proposto: Promise.try; baseline do projeto fixado em runtime '
     'nomeado; consultar docs oficiais'), ('Confundir ano da proposta com suporte em navegador/Node alvo ou tratar '
     'Promise.resolve().then como fallback semanticamente idêntico.'), ('Declare runtime e versão antes da consulta.',
     'Leia tabela/nota oficial de suporte.',
     'Escolha fallback e compare quando fn é chamado e como throws são tratados.'), ('Ficha registra recurso, baseline, fonte oficial, data, decisão e alternativa. '
     'Fallback fiel chama fn dentro de try, converte retorno com Promise.resolve e exceção '
     'com Promise.reject; documente que trocar o momento da chamada muda semântica.'), 'Avaliar Iterator helpers em runtime alvo -> usar, fallback ou adiar', 18, 'Node.js 24 LTS (ES modules)', ('Consulte fonte oficial para decidir se Promise.try cabe no runtime alvo. '
     'Registre suporte, fallback semanticamente equivalente ou motivo para adiar.',
     'Uma API moderna pode existir na especificação antes de estar disponível no runtime '
     'implantado; uma tabela oficial por versão responde à pergunta que o código sozinho '
     'não resolve.',
     'Registre runtime/baseline e abra a tabela de compatibilidade oficial antes de '
     'escolher API ou fallback.',
     'Ficha de decisão com fonte/versão/data, seletor usar/fallback/adiar e editor de '
     'exemplo; navegação por teclado.',
     'Página oficial de compatibilidade Node/ECMAScript indicada pelo exercício, runtime '
     'alvo e snippet curto; nenhum pacote remoto é instalado.',
     'Que evidência sustenta a decisão de usar uma API recente?',
     'Suporte verificado para o runtime baseline na documentação oficial com data '
     'registrada.',
     'O ano em que a proposta chegou ao padrão, sem checar implementação.',
     'Um transpiler de sintaxe, que garante automaticamente APIs do runtime.',
     'Avalie Iterator helpers para o runtime alvo e decida entre uso, fallback ou '
     'adiamento com fonte verificável.')),
          load={"novelty": 4, "syntax": 2, "composition": 2, "state": 1, "debugging": 1, "files": 2, "reading": 4, "independence": 4, "tools": 4}),
"14.08": C(
    'node.notes_cli',
    'CLI modular add/list/remove; storage JSON local; domínio puro e adaptador de fs',
    'add A; list -> [A]; remove ID de A; list -> []; remove ID inexistente -> not-found; list com JSON inválido -> erro contextual sem sobrescrever storage',
    ('list com JSON inválido -> erro contextual sem sobrescrever storage; remove ID inexistente -> not-found; '
     'escrita atômica via temp+rename para evitar truncamento'),
    'Misturar process.argv, regras e fs num arquivo difícil de testar.',
    ('Modele comandos puros e IDs.',
     'Injete repositório para teste.',
     'Persistência lê/valida e grava com estratégia segura.'),
    ('Separe parse CLI, serviço de notas e repositório JSON; teste domínio sem I/O e teste '
     'adaptador com diretório temporário.'),
    'CLI de inventário com comandos equivalentes -> módulo isolado',
    kind='PROJECT',
    runtime='Node.js',
    estimated=100,
    **_lesson('node.notes_cli', 'CLI modular add/list/remove; storage JSON local; domínio puro e adaptador de fs', 'Misturar process.argv, regras e fs num arquivo difícil de testar.', ('Modele comandos puros e IDs.',
     'Injete repositório para teste.',
     'Persistência lê/valida e grava com estratégia segura.'), ('Separe parse CLI, serviço de notas e repositório JSON; teste domínio sem I/O e teste '
     'adaptador com diretório temporário.'), 'CLI de inventário com comandos equivalentes -> módulo isolado', 100, 'Node.js', ('Entregue uma CLI modular de notas: parse de argumentos na borda, domínio puro e '
     'repositório JSON com leitura e validação seguras; ID inexistente retorna not-found; JSON inválido gera erro contextual sem sobrescrever storage; para gravar atomicamente, escreva em arquivo temporário no mesmo diretório e depois renomeie-o.',
     'Uma CLI de relatórios pode validar --format na borda, chamar uma função pura para '
     'montar o conteúdo e só então imprimir o texto.',
     'Desenhe dependências CLI→serviço→repositório e identifique uma operação de cada '
     'fronteira antes de implementar.',
     'Editor em três módulos, terminal local simulado, painel JSON e controles de erro; '
     'acessível por teclado.',
     'Starter da CLI, storage JSON local isolado, repositório injetável e diretório '
     'temporário do runner; sem dados pessoais.',
     'Por que manter process.argv e fs fora do domínio puro?',
     'Para poder testar regras de negócio sem processo ou I/O e trocar adaptadores sem '
     'reescrevê-las.',
     'Para deixar cada função de domínio abrir seu próprio arquivo.',
     'Para que o serviço armazene argumentos globais e os leia depois.',
     'Crie CLI de inventário com comandos equivalentes, serviço isolado e persistência em '
     'repositório substituível.')),
          load={"novelty": 4, "syntax": 4, "composition": 5, "state": 5, "debugging": 4, "files": 5, "reading": 4, "independence": 5, "tools": 5}),
"14.09": C(
    'git.workflow',
    ('repositório local descartável com main e feature, histórico curto e conflito '
     'preparado em arquivo de configuração; sem remoto real'),
    'status,diff,commit,merge -> resolução preserva intenção das duas mudanças',
    ('arquivos não rastreados exigem add explícito; segredo fictício no diff -> remover '
     'antes de commit; diff de PR simulado compara base/head'),
    'Fazer commit sem ler diff ou resolver conflito aceitando cegamente um lado.',
    ('Inspecione status e diff.',
     'Crie branch/commit pequeno.',
     'No conflito, leia base e as duas versões antes de editar.'),
    ('Roteiro executável status,diff,add,commit,switch,merge; registre resolução sem '
     'perder conteúdo e revise diff do PR simulado.'),
    'Conflito em configuração de script -> combinar as duas mudanças',
    kind='MODIFY',
    runtime='Git',
    estimated=22,
    **_lesson('git.workflow', ('repositório local descartável com main e feature, histórico curto e conflito '
     'preparado em arquivo de configuração; sem remoto real'), 'Fazer commit sem ler diff ou resolver conflito aceitando cegamente um lado.', ('Inspecione status e diff.',
     'Crie branch/commit pequeno.',
     'No conflito, leia base e as duas versões antes de editar.'), ('Roteiro executável status,diff,add,commit,switch,merge; registre resolução sem '
     'perder conteúdo e revise diff do PR simulado.'), 'Conflito em configuração de script -> combinar as duas mudanças', 22, 'Git', ('Use o repositório descartável para inspecionar status/diff, criar commits pequenos e '
     'resolver o conflito preservando as duas intenções. Revise base/head antes de '
     'concluir.',
     'Ao revisar uma mudança sem conflito que renomeia um arquivo, compare o status e o '
     'diff staged para confirmar exatamente qual caminho será incluído no commit.',
     'Escreva quais comandos revelam estado, conteúdo staged e diferença entre base/head '
     'antes de iniciar merge.',
     'Terminal Git simulado com histórico em passos, resolução por editor e checklist de '
     'revisão textual; funciona por teclado.',
     'Repositório local descartável com branches/histórico/conflito didático; sem remoto, '
     'token ou segredo real.',
     'O que deve ser feito antes de confirmar uma resolução de conflito?',
     'Ler as duas versões e revisar o diff resultante para confirmar que ambas as '
     'intenções foram preservadas.',
     'Aceitar sempre o lado atual para evitar ler o conflito.',
     'Fazer commit sem olhar status/diff porque o merge reporta qualquer problema.',
     'Resolva um conflito em configuração de scripts juntando as mudanças e revise o diff '
     'antes do commit.')),
          load={"novelty": 3, "syntax": 2, "composition": 4, "state": 3, "debugging": 4, "files": 4, "reading": 4, "independence": 4, "tools": 4}),
"14.10": C(
    'modules.esm_graph',
    "A importa B; B tem top-level await; C usa import('./A.js'); log ordem; import.meta.url",
    'B com await -> avaliação de A espera B; import() -> Promise de namespace',
    ('ciclo com leitura de binding antes da inicialização -> ReferenceError possível; '
     'import.meta.url refere módulo atual; import com efeito colateral executa uma vez'),
    'Achar que import() devolve namespace síncrono ou que ciclo sempre funciona.',
    ('Separe vinculação de avaliação.',
     'Trace dependências e awaits.',
     'Marque leitura em zona temporal antes de inicialização.'),
    ('Diagrama de grafo e cronologia de logs, com resultado de import() aguardado e '
     'explicação do ciclo concreto.'),
    'Módulos config/data/UI com await na inicialização -> ordem de execução',
    kind='TRACE',
    runtime='Node.js',
    estimated=9,
    **_lesson('modules.esm_graph', "A importa B; B tem top-level await; C usa import('./A.js'); log ordem; import.meta.url", 'Achar que import() devolve namespace síncrono ou que ciclo sempre funciona.', ('Separe vinculação de avaliação.',
     'Trace dependências e awaits.',
     'Marque leitura em zona temporal antes de inicialização.'), ('Diagrama de grafo e cronologia de logs, com resultado de import() aguardado e '
     'explicação do ciclo concreto.'), 'Módulos config/data/UI com await na inicialização -> ordem de execução', 9, 'Node.js', ('Desenhe o grafo e a linha do tempo de avaliação dos módulos. Aguarde o import '
     'dinâmico e analise ciclo apenas a partir dos bindings realmente lidos.',
     'Um módulo de tema pode importar tokens e aguardar configuração assíncrona; o módulo '
     'importador só continua a avaliação após a dependência terminar sua etapa assíncrona.',
     'Separe vinculação, avaliação e resolução de Promise numa cronologia antes de prever '
     'os logs.',
     'Grafo editável e tabela de eventos, com passo a passo da Promise de import; teclado '
     'e resultado textual.',
     'Pequenos módulos ESM locais, log de ordem, import dinâmico e console Node; sem rede.',
     'O que import() devolve imediatamente?',
     'Uma Promise que se resolve com o namespace do módulo.',
     'O objeto namespace síncrono, pronto para acessar sem await.',
     'Uma Promise que cancela a avaliação se o importador fechar.',
     'Trace módulos config/data/UI com inicialização assíncrona e explique a ordem de '
     'avaliação entre dependências.')),
          load={"novelty": 4, "syntax": 3, "composition": 4, "state": 4, "debugging": 3, "files": 3, "reading": 4, "independence": 3, "tools": 3}),
"14.11": C(
    'npm.dependency_decision',
    ('opções biblioteca A, B ou função local para parse de 20 linhas; dados de '
     'licença/manutenção/dependências/lockfile'),
    ('A ativa mas pesada, B leve porém abandonada, local pequena -> decisão justificada '
     'por critérios e riscos'),
    ('licença incompatível -> descartar opção; lockfile sem versão pinada -> build não '
     'reproduzível; teste/atualização considerados'),
    'Escolher apenas por estrelas ou downloads sem verificar licença e manutenção.',
    ('Defina requisito e risco de implementação local.',
     'Cheque fonte primária: repositório/licença/changelog.',
     'Registre versão, dependências transitivas e plano de atualização.'),
    ('Matriz compara solução local/A/B com evidências datadas; escolha justificada e breve '
     'política de lockfile/atualização.'),
    'Escolher parser de CSV para produto pequeno -> evidência e tradeoffs',
    kind='COMPARE',
    estimated=12,
    runtime='Node.js 24 LTS (ES modules)',
    **_lesson('npm.dependency_decision', ('opções biblioteca A, B ou função local para parse de 20 linhas; dados de '
     'licença/manutenção/dependências/lockfile'), 'Escolher apenas por estrelas ou downloads sem verificar licença e manutenção.', ('Defina requisito e risco de implementação local.',
     'Cheque fonte primária: repositório/licença/changelog.',
     'Registre versão, dependências transitivas e plano de atualização.'), ('Matriz compara solução local/A/B com evidências datadas; escolha justificada e breve '
     'política de lockfile/atualização.'), 'Escolher parser de CSV para produto pequeno -> evidência e tradeoffs', 12, 'Node.js 24 LTS (ES modules)', ('Compare implementação local e bibliotecas com critérios de licença, manutenção, '
     'dependências transitivas, lockfile, testes e custo futuro. Baseie a escolha em '
     'evidência verificável.',
     'Para formatar uma duração curta, uma função local minúscula pode ter custo de '
     'manutenção menor que adicionar dependência; para regras amplas, a política de '
     'licença e atualizações pesa na comparação.',
     'Registre requisito mínimo e risco de manutenção local antes de avaliar fontes '
     'primárias e versões.',
     'Matriz textual editável de critérios/evidências, escolha e risco residual; opções '
     'acessíveis por teclado.',
     'Dossiê local de duas bibliotecas fictícias com versão/licença/changelog/dependências '
     'e referência de lockfile; sem consultas/rede necessárias.',
     'Qual evidência deve pesar além da popularidade ao escolher uma dependência?',
     'Licença compatível, manutenção ativa, árvore transitiva, versão fixada e plano de '
     'atualização.',
     'Somente número de downloads e estrelas do repositório.',
     'Tamanho minificado isolado, sem ler a licença nem a manutenção.',
     'Escolha uma estratégia para parsing de CSV em produto pequeno e registre evidências '
     'e tradeoffs de implementação/dependência.')),
          load={"novelty": 4, "syntax": 2, "composition": 4, "state": 2, "debugging": 2, "files": 3, "reading": 5, "independence": 4, "tools": 4}),
}


_LITERAL_STARTERS = {
    '14.12': "material.md: // src/main.js\nimport { soma } from './math.js';\nimport './style.css';\nconsole.log(soma(2, 3));\n\n// package.json declara type=module. O diretório dist ainda não existe.\n// Compare os arquivos-fonte com um bundle de saída fornecido pelo exercício.",
    '14.13': "ordem-browser.js: // Snippet A — navegador (este arquivo roda no executor do site).\nconsole.log('A síncrono');\nsetTimeout(() => console.log('T timer'), 0);\nPromise.resolve().then(() => console.log('P promise'));\nconsole.log('B síncrono');\n\n// Snippet B — Node.js 24 LTS, rode localmente como node-ordem.mjs (ESM) e depois como node-ordem.cjs (CommonJS):\n//   console.log('A síncrono');\n//   setTimeout(() => console.log('T timer'), 0);\n//   Promise.resolve().then(() => console.log('P promise'));\n//   process.nextTick(() => console.log('N nextTick'));\n//   console.log('B síncrono');\n// Registre versão do Node (node --version), formato do módulo e a ordem observada em cada formato.",
    '14.01': "material.md: // grafo de import de valor\nA -> B\nB -> C\nC -> A\nD -> B\nE (sem dependências)\n\nDesenhe o ciclo e indique quais módulos pertencem ao ciclo. Depois considere um import de tipo isolado em D.",
    '14.02': "material.md: Bloco A: const argumentos = process.argv.slice(2);\nBloco B: const comando = argumentos[0];\nBloco C: const resultado = executarDominio(comando, argumentos.slice(1));\nBloco D: process.stdout.write(`${resultado}\\n`);\nBloco E: if (!comandos.has(comando)) { mostrarUso(); process.exitCode = 2; return; }\n\nContexto: function main(argv = process.argv) { /* ordenar blocos; domínio não lê process.argv */ }",
    '14.03': "package.json: {\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"TODO\",\n    \"test\": \"TODO\",\n    \"start\": \"TODO\"\n  }\n}\n\nArquivos existentes: src/main.js e test/app.test.js. Preencha somente os três comandos; o ambiente é Node.js 24 e usa node:test.",
    '14.04': "material.md: // math.cjs\nfunction soma(a, b) { return a + b; }\nmodule.exports = { soma };\n\n// app.cjs\nconst { soma } = require('./math.cjs');\nconsole.log(soma(2, 3));\n\nConverta o pacote para ESM no Node.js: package type module, exports/imports consistentes e extensão relativa explícita.",
    '14.05': "config.js: import { readFile } from 'node:fs/promises';\n\nexport async function carregarConfig() {\n  return JSON.parse(await readFile('./data/config.json', 'utf8'));\n}\n\n// BUG: o caminho é resolvido em relação ao cwd do processo. O arquivo fica ao lado do módulo.",
    '14.06': "config.js: export function loadConfig(env) {\n  const portTexto = env.PORT || '3000';\n  const logLevel = env.LOG_LEVEL || 'info';\n  const token = env.TOKEN;\n  // TODO: trate defaults, conversão/intervalo da porta e segredo exigido em produção.\n  // Nunca inclua token em erro ou log.\n}\n",
    '14.07': "promise-try.js: // Runtime-alvo: Node.js 24 LTS. Registre a versão exata (node --version), a fonte oficial e a data da consulta.\nconst registro = [];\nconst callback = () => {\n  registro.push('callback executou');\n  throw new Error('falhou');\n};\n\n// A: API nativa, se existir no runtime-alvo.\nif (typeof Promise.try === 'function') {\n  registro.push('antes de A');\n  Promise.try(callback).catch((erro) => registro.push(`A rejeitou: ${erro.message}`));\n}\n\n// B: fallback fiel — chama fn agora e transforma throw síncrono em rejeição.\nfunction tentar(fn) {\n  try { return Promise.resolve(fn()); }\n  catch (erro) { return Promise.reject(erro); }\n}\nregistro.push('antes de B');\ntentar(callback).catch((erro) => registro.push(`B rejeitou: ${erro.message}`));\n\n// C: NÃO equivalente — adia fn para uma microtask.\nregistro.push('antes de C');\nPromise.resolve().then(callback).catch((erro) => registro.push(`C rejeitou: ${erro.message}`));\nregistro.push('fim do código síncrono');\n\nsetTimeout(() => console.log(registro.join('\\n')), 0);\n// TODO: preveja a ordem do registro e explique quando o callback roda em A, B e C.",
    '14.08': "cli.js: export async function executar(comando, repositorio, argumentos = []) {\n  if (!repositorio || typeof repositorio[comando] !== 'function') return {status: 'usage', exitCode: 2};\n}\nexport async function salvarAtomico(fs, destino, conteudo) { await fs.writeFile(destino, conteudo); }\n\n// BUG: a gravação direta pode deixar dados parciais; o contrato exige temp e rename.",
    '14.09': "material.md: repositório descartável\nbranch main: README.md contém 'uso'\nbranch feature: README.md contém 'uso' e 'exemplo'\nworking tree: config.json modificado e segredo fictício visível no diff\n\nAntes de concluir merge/commit, inspecione status, diff staged e resultado combinado.",
    '14.10': "material.md: Traceie a sequência de três módulos abaixo.\n\n```js\n// a.js\nimport { valor } from './b.js';\nconsole.log('A', valor);\n\n// b.js\nexport const valor = await Promise.resolve(5);\n\n// c.js\nconst modulo = await import('./a.js');\nconsole.log('C', modulo.valor);\n```\n\nRegistre separadamente: vinculação do import nomeado; avaliação assíncrona de b.js; instante em que a Promise de import() de c.js resolve; e ordem dos logs. Não misture o grafo ilustrativo em um único arquivo executável.",
    '14.11': "package.json: {\n  \"dependencies\": { \"csv-choice-a\": \"^1.2.0\", \"csv-choice-b\": \"^3.0.0\" }\n}\n\nDossiê local compara licença, manutenção, tamanho, dependências transitivas, versão/lockfile e plano de atualização.",
}
for _card_id, _starter in _LITERAL_STARTERS.items():
    CONTENT[_card_id]["starter"] = _starter

# Multi-file starters: every file that a declared command or the exercise text names must exist in the starter.
# The literal "path: content" form only carries one file, so these are written as explicit file lists.
def _split_starter(value: str) -> dict[str, str]:
    path, _, content = value.partition(": ")
    return {"path": path, "content": content}

CONTENT["14.03"]["starter"] = [
    {"path": "package.json", "content": '{\n  "name": "devpath-14-03",\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "TODO",\n    "test": "TODO",\n    "start": "TODO"\n  }\n}\n'},
    {"path": "package-lock.json", "content": '{\n  "name": "devpath-14-03",\n  "version": "1.0.0",\n  "lockfileVersion": 3,\n  "requires": true,\n  "packages": {\n    "": {\n      "name": "devpath-14-03",\n      "version": "1.0.0"\n    }\n  }\n}\n'},
    {"path": "src/main.js", "content": "// Ponto de entrada do app: implemente o módulo ESM neste arquivo.\nexport {};\n"},
    {"path": "test/app.test.js", "content": "import test from 'node:test';\n\n// Escreva o teste do app com node:test; substitua este lembrete pelo caso real.\ntest.todo('app');\n"},
    {"path": "README.md", "content": "# Projeto do app\n\nPreencha somente os comandos dev, test e start em package.json. Arquivos existentes: src/main.js e test/app.test.js. O ambiente é Node.js 24 e usa node:test.\n"},
]
CONTENT["14.05"]["starter"] = [
    _split_starter(CONTENT["14.05"]["starter"]),
    {"path": "test/config.test.js", "content": "import test from 'node:test';\n\n// Escreva os casos: cwd diferente, caminho com espaço e arquivo ausente com cause.\ntest.todo('carregarConfig');\n"},
]
CONTENT["14.08"]["starter"] = [
    _split_starter(CONTENT["14.08"]["starter"]),
    {"path": "test/cli.test.js", "content": "import test from 'node:test';\n\n// Escreva os testes de adicionar, listar, remover e das falhas de storage em diretório temporário.\ntest.todo('CLI de notas');\n"},
]

# A consulta de compatibilidade é extensão opt-in e usa o recurso realmente avaliado.
CONTENT["14.07"]["optional"] = True

# Defina os casos de defaults de porta e a fronteira inválida.
CONTENT["14.06"]["hidden"] = (
    "PORT ausente/vazio/espaços -> 3000; PORT='8080' -> 8080; PORT='abc'/'0'/'65536' -> "
    "RangeError; TOKEN ausente ou vazio em produção -> erro sem revelar segredo"
)
CONTENT["14.06"]["solution"] = (
    "Trate PORT ausente ou em branco como default 3000; converta texto restante e aceite "
    "somente inteiro de 1 a 65535. LOG_LEVEL ausente ou em branco vira info e valor "
    "desconhecido é rejeitado. Em produção, TOKEN ausente/em branco falha sem expor o valor."
)
_OBSERVABLE_FAILURES = {
    '14.12': 'O bundle é confundido com o runtime e a resposta atribui ao bundler suporte a API que ele não implementa.',
    '14.13': 'A previsão ignora bloqueio síncrono ou transfere ordem/temporização do Node para o navegador sem delimitar contexto.',
    '14.01': 'D é classificado como parte do ciclo só por apontar para B, ou o import de tipo é confundido com dependência de runtime.',
    '14.02': 'Domínio acessa process.argv diretamente, ou comando ausente/desconhecido não imprime uso e define o status contratado.',
    '14.03': 'Script aponta para caminho inexistente, usa módulo incompatível ou não devolve o status do teste.',
    '14.04': 'Somente package.json ou só um lado da fronteira muda; import relativo ESM não resolve no Node.',
    '14.05': 'A execução de outro cwd procura data/config.json no diretório do usuário em vez do diretório do módulo.',
    '14.06': 'Porta em branco/inválida recebe valor fora do intervalo ou segredo aparece em erro/log.',
    '14.07': 'A decisão usa ano da proposta/transpilação sem verificar a API no runtime alvo em fonte oficial.',
    '14.08': 'Regra de domínio depende de argv/fs, JSON inválido é sobrescrito ou gravação parcial destrói notas.',
    '14.09': 'O commit inclui segredo/modificação não revisada ou a resolução descarta uma das intenções do conflito.',
    '14.10': 'A ordem ignora espera assíncrona, ciclo concreto ou o fato de import() retornar uma Promise.',
    '14.11': 'Popularidade/tamanho isolado decide a dependência sem licença, manutenção, transitive tree ou lockfile.',
}
for _card_id, _failure in _OBSERVABLE_FAILURES.items():
    CONTENT[_card_id]["failure"] = _failure

_OFFICIAL_DOCS = {
    '14.12': 'https://vite.dev/guide/',
    '14.13': 'https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop',
    '14.01': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules',
    '14.02': 'https://nodejs.org/api/process.html',
    '14.03': 'https://docs.npmjs.com/cli/v11/using-npm/scripts',
    '14.04': 'https://nodejs.org/api/esm.html',
    '14.05': 'https://nodejs.org/api/fs.html',
    '14.06': 'https://nodejs.org/api/process.html',
    '14.07': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try',
    '14.08': 'https://nodejs.org/api/fs.html',
    '14.09': 'https://git-scm.com/docs/git-status',
    '14.10': 'https://nodejs.org/api/esm.html',
    '14.11': 'https://docs.npmjs.com/cli/v11/configuring-npm/package-json',
}
for _card_id, _official_url in _OFFICIAL_DOCS.items():
    CONTENT[_card_id]["docs"] = _official_url

# Revisão editorial de 05/10/2026: enunciado, starter e contrato realinhados.
CONTENT["14.07"]["content_version"] = 2
CONTENT["14.13"]["content_version"] = 2

CONTENT["14.08"]["rubric"] = (
    "Entrega 1 — parse de add/list/remove fica na borda da CLI; serviço recebe argumentos explícitos e domínio não lê process.argv nem importa fs.",
    "Entrega 2 — repository é injetável; testes comprovam ordem, remoção, not-found e rejeição antes de alterar o estado.",
    "Entrega 3 — JSON inválido produz erro contextual e preserva os bytes; gravação escreve temporário no mesmo diretório e só então renomeia.",
    "Entrega 4 — testes de domínio e adapter usam diretório temporário; checklist e reflexão registram comando, formato de dados e política de falha observada.",
)

CONTENT["14.14"] = C(
    "tooling.typescript_local",
    "src/index.ts e tsconfig.json: inicialize tsc, habilite strict e erasableSyntaxOnly, compare execução Node com tsc/tsx/bundler.",
    "Node executa sintaxe TypeScript apagável -> saída correta; tsc --noEmit -> erros estáticos reportados; sintaxe que exige transformação é rejeitada pelo erasableSyntaxOnly",
    "node src/index.ts -> type stripping sem typecheck; tsc --noEmit -> diagnóstico estático; sintaxe que exige transformação requer tsx ou bundler",
    "Usar node src/index.ts como substituto de tsc ou acreditar que TypeScript valida JSON em runtime.",
    ("Comece com npm init e npx tsc --init; habilite erasableSyntaxOnly no tsconfig.", "Rode Node no arquivo TS e compare com tsc --noEmit.", "Use tsx para conveniência de execução e bundler quando o destino exigir transformação/empacotamento."),
    "O projeto de referência executa TypeScript apagável nativamente em Node e roda tsc --noEmit. No seu projeto, gere tsconfig com tsc --init; mantenha strict e erasableSyntaxOnly; use Node para type stripping, tsc para checagem, tsx para desenvolvimento conveniente e bundler para transformar/empacotar conforme o destino.",
    "arquivo TS novo -> escolha justificada entre execução Node, tsc, tsx e bundler.",
    kind="PROJECT", title="Monte um projeto TypeScript local", runtime="TypeScript 7.0 strict; Node.js 24 LTS",
    compatibility="Use Node.js 24.12 LTS ou posterior para type stripping estável; tsc faz typecheck, e sintaxe que emite JavaScript requer tsx ou bundler.",
    estimated=45,
    first_response="Explique em uma frase como executar TS difere de checar os tipos.", first_response_timing="Antes de rodar Node ou tsc.",
    interaction="Projeto local com editor de arquivos, saída de terminal e comandos npm; type stripping e typecheck são apresentados como ações separadas.",
    transfer_prompt="Crie um arquivo TS novo e decida se Node, tsc, tsx ou bundler resolve cada necessidade declarada.",
    explanation={"mental_model": "Node pode apagar tipos sintáticos sem checar tipos; tsc analisa tipos; tsx transforma para desenvolvimento e bundler produz artefatos conforme o destino.", "worked_example": "Execute um arquivo com anotações apagáveis no Node e depois rode tsc --noEmit; compare uma sintaxe com emissão e escolha uma ferramenta que a transforme.", "common_trap": "Execução bem-sucedida não prova que os tipos estão corretos, e anotações não validam dados de runtime.", "why_it_matters": "Separar execução, checagem e distribuição evita promessas falsas sobre o que cada ferramenta garante."},
    review={"prompt": "Node executou o arquivo TypeScript. O que isso prova?", "choices": ("Que o runtime conseguiu apagar a sintaxe compatível, não que os tipos passaram", "Que tsc rodou", "Que JSON externo foi validado"), "answer": "Que o runtime conseguiu apagar a sintaxe compatível, não que os tipos passaram", "feedback_correct": "Type stripping remove tipos; tsc faz checagem estática.", "feedback_incorrect": "Execução não substitui checagem nem valida dados externos."},
    prompt="No projeto exportado, inicialize TypeScript com tsc --init, configure strict e erasableSyntaxOnly, rode um arquivo .ts com o type stripping nativo do Node e compare com tsc --noEmit, tsx e bundler.",
    resources=("Node.js TypeScript support: https://nodejs.org/api/typescript.html", "TypeScript erasableSyntaxOnly: https://www.typescriptlang.org/tsconfig/erasableSyntaxOnly.html"),
    rubric=("tsconfig mantém strict e erasableSyntaxOnly e o projeto inclui lockfile.", "Execução Node e tsc são comparados como operações distintas; executar não é typecheck.", "O aluno escolhe entre tsc, tsx e bundler segundo a necessidade e registra limitações.", "Testes e typecheck são executados localmente; a evidência é declarada pelo aluno."),
)

CONTENT["14.15"] = C(
    "tooling.lint_format",
    "eslint.config.js e src/format.js: use flat config do ESLint 9+, Prettier e corrija uma regra com explicação.",
    "npm run lint -> identifica variável não usada; correção passa lint e testes; Prettier --check não muda semântica",
    "violação de lint -> corrija a causa; desativar regra sem justificativa não é correção; formatter organiza texto sem provar lógica",
    "Confundir lint com formatação ou remover uma regra para esconder um erro observado.",
    ("Leia eslint.config.js e identifique a regra aplicada ao arquivo.", "Corrija a causa no código e compare antes/depois do lint.", "Rode Prettier --check e explique que formatação não testa comportamento."),
    "O fixture configura ESLint flat e Prettier e traz uma falha lint deliberada. Leia a regra, corrija-a no projeto exportado, rode npm run lint e npm run format:check; não use eslint-disable como solução sem justificar a exceção.",
    "biblioteca JavaScript -> regras lint e formato conferidos em comandos separados.",
    kind="PROJECT", title="Use ESLint 9 e Prettier", runtime="Node.js 24 LTS",
    compatibility="Use flat config com ESLint 9+ e instale ESLint/Prettier no projeto; os comandos de lint e format são ferramentas distintas.",
    estimated=40,
    first_response="Escolha uma regra do lint que você espera que o starter viole.", first_response_timing="Antes de executar ESLint.",
    interaction="Starter multi-arquivo editável; comandos separados para ESLint e Prettier; erros são visíveis em texto no terminal.",
    transfer_prompt="Adicione uma regra lint explicada e uma verificação de formato a um projeto próprio, sem confundir os resultados.",
    explanation={"mental_model": "ESLint aponta padrões configurados no código; Prettier aplica convenções de formato. Seus diagnósticos respondem perguntas diferentes.", "worked_example": "Uma regra no-unused-vars aponta uma declaração sem uso; corrija o código e execute format check em etapa separada.", "common_trap": "Desligar a regra esconde o diagnóstico e um formato consistente não prova lógica correta.", "why_it_matters": "Ferramentas claras reduzem erros repetidos e deixam a revisão humana focar decisões de comportamento."},
    review={"prompt": "Qual é a diferença entre ESLint e Prettier?", "choices": ("Lint aplica regras configuradas; Prettier verifica/formata apresentação", "Prettier executa testes de comportamento", "ESLint gera o bundle de produção"), "answer": "Lint aplica regras configuradas; Prettier verifica/formata apresentação", "feedback_correct": "As ferramentas podem ser usadas juntas, mas respondem perguntas diferentes.", "feedback_incorrect": "Formatação não prova lógica nem gera build."},
    prompt="Leia a flat config do ESLint 9+, encontre uma regra que falha no starter, corrija o código e rode lint e Prettier. Explique qual bug ou inconsistência a regra ajuda a revelar e o que o formatter não garante.",
    resources=("ESLint configuration files: https://eslint.org/docs/latest/use/configure/configuration-files", "Prettier CLI: https://prettier.io/docs/cli"),
    rubric=("Configuração usa eslint.config.js e uma regra identificável do ESLint 9+.", "A causa da violação é corrigida no código e lint termina sem erro.", "Prettier --check é executado separadamente e não é descrito como teste de comportamento.", "Dependências e lockfile são preservados; a evidência dos comandos é declarada pelo aluno."),
)

CONTENT["14.16"] = C(
    "tooling.vite_local",
    "src/index.html, src/main.js e vite.config.js: crie/ajuste a página, rode o servidor de desenvolvimento e gere build.",
    "npm run dev -> página local servida; npm run build -> dist com HTML e assets; import dinâmico gera chunk separado",
    "npm run dev -> servidor local; npm run build -> dist para produção; caminho de assets depende de base e build inválido retorna erro",
    "Achar que Vite é apenas um servidor ou que a tela dev prova o artefato final.",
    ("Leia os scripts do package e inicie o servidor Vite.", "Abra a página e identifique imports transformados no browser.", "Gere dist e examine arquivos e referências de assets separadamente."),
    "O projeto tem package, lockfile, configuração e arquivo HTML mínimo. Rode npm ci no seu checkout, npm run dev para inspecionar a aplicação e npm run build; compare a origem com dist. O verificador isolado confere contrato e build esperado em código, enquanto o aluno executa o bundler após instalar dependências.",
    "página com módulo -> servidor Vite e pasta dist inspecionados separadamente.",
    kind="PROJECT", title="Crie, rode e gere build com Vite", runtime="Node.js 24 LTS",
    compatibility="Use uma versão de Vite compatível com Node.js 24 LTS; npm run dev e npm run build exigem que Vite esteja instalado no projeto.",
    estimated=45,
    first_response="Preveja que arquivo o build vai produzir além do HTML original.", first_response_timing="Antes de iniciar Vite.",
    interaction="Página HTML simples com módulo JavaScript, terminal de desenvolvimento e inspeção textual do diretório dist.",
    transfer_prompt="Acrescente uma página e um módulo ao projeto e compare comportamento no servidor dev com arquivos produzidos em dist.",
    explanation={"mental_model": "Vite serve módulos durante desenvolvimento e transforma a aplicação em arquivos de distribuição durante build.", "worked_example": "Abra index.html pelo servidor dev, observe o import de um módulo e depois inspecione a pasta dist emitida pelo build.", "common_trap": "Ver a página no servidor dev não comprova que os caminhos e arquivos do build final estão corretos.", "why_it_matters": "Examinar entrada e saída torna transformação e empacotamento partes observáveis do desenvolvimento."},
    review={"prompt": "Por que executar npm run build depois do servidor dev?", "choices": ("Dev server e artefato de distribuição são caminhos diferentes", "Build publica automaticamente no servidor", "Dev server já prova todos os caminhos de produção"), "answer": "Dev server e artefato de distribuição são caminhos diferentes", "feedback_correct": "Inspecionar dist verifica a saída que será distribuída.", "feedback_incorrect": "A página dev não substitui o build de produção."},
    prompt="Configure a aplicação local com Vite, rode npm run dev, inspecione a página e imports no navegador e depois execute npm run build. Explique a diferença entre servidor de desenvolvimento e conteúdo de dist.",
    resources=("Vite Guide: https://vite.dev/guide/", "Vite build: https://vite.dev/guide/build"),
    rubric=("package.json declara scripts dev e build compatíveis com Vite.", "Servidor local abre a aplicação e o aluno identifica pelo menos um módulo/asset servido.", "Build produz dist e o aluno verifica HTML, assets e import dinâmico.", "A validação do projeto declara quais comandos foram executados localmente."),
)

CONTENT["14.17"] = C(
    "tooling.github_actions_ci",
    ".github/workflows/ci.yml: crie uma pipeline que instale com npm ci e rode lint, typecheck e test.",
    "workflow disparado em pull_request e push -> Node 24, npm ci, lint, typecheck e test executados em sequência",
    "etapa falha -> job fica vermelho; workflow não valida código que não está no commit; ações externas devem ser revisadas/pinadas conforme política",
    "Tratar CI verde como prova de qualidade total ou omitir typecheck porque os testes passaram.",
    ("Declare eventos e uma versão Node reproduzível.", "Use npm ci com lockfile e etapas separadas para lint, typecheck e test.", "Compare comandos locais com workflow e explique uma falha que bloqueia o job."),
    "Escreva workflow mínimo e mantenha comandos em scripts do package para executar os mesmos gates localmente. A checagem local valida arquivos e scripts; o GitHub executa a pipeline somente após o aluno enviar a branch, algo que não ocorre pelo verificador do curso.",
    "pull request -> gates de lint, typecheck e testes executados localmente e em CI quando publicada a branch.",
    kind="PROJECT", title="Crie CI mínima com GitHub Actions", runtime="Node.js 24 LTS",
    compatibility="Workflow usa actions/setup-node com Node.js 24 LTS e npm; execução hospedada depende de push/pull request no GitHub e não é simulada localmente.",
    estimated=35,
    first_response="Anote quais três comandos devem bloquear uma entrega quando falharem.", first_response_timing="Antes de editar o workflow.",
    interaction="Workflow YAML e scripts npm editáveis; teste estrutural local, sem enviar alterações ao GitHub automaticamente.",
    transfer_prompt="Transfira os comandos de qualidade de outro projeto para CI e declare quais observações dependem de execução no host remoto.",
    explanation={"mental_model": "CI reexecuta gates declarados num ambiente automatizado; ela reduz diferenças de ambiente, mas cobre somente as verificações configuradas.", "worked_example": "Workflow em push e pull_request configura Node, instala com npm ci e roda lint, typecheck e testes em passos distintos.", "common_trap": "Um job verde não prova usabilidade, acessibilidade, segurança total ou ausência de casos não cobertos.", "why_it_matters": "Gates reproduzíveis tornam erros visíveis antes de integrar mudanças compartilhadas."},
    review={"prompt": "O que um job verde de CI comprova?", "choices": ("Somente que os gates configurados passaram naquela execução", "Ausência de defeitos e riscos", "Que todo cenário de usuário foi homologado"), "answer": "Somente que os gates configurados passaram naquela execução", "feedback_correct": "CI é evidência vinculada aos comandos e ao ambiente declarados.", "feedback_incorrect": "Gates não cobrem automaticamente aspectos não configurados."},
    prompt="Adicione um workflow GitHub Actions para pull_request e push: configure Node 24, instale com npm ci e execute lint, typecheck e test como etapas explícitas. Rode os mesmos scripts localmente e explique o que o CI não consegue provar.",
    resources=("GitHub Actions, build and test Node.js: https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-nodejs", "GitHub Actions workflows: https://docs.github.com/en/actions/writing-workflows"),
    rubric=("Workflow declara triggers, versão Node e npm ci usando lockfile.", "Lint, typecheck e testes aparecem e são executados como gates distintos.", "Comandos locais correspondem ao workflow e uma falha é descrita como bloqueio.", "CI é tratada como evidência limitada e execução em GitHub é declarada pelo aluno."),
)

CONTENT["14.18"] = C(
    "npm.dependency_supply_chain",
    "package.json e package-lock.json: compare ^, ~ e versão exata; execute npm ci e npm audit; avalie scripts postinstall.",
    "npm ci -> instalação reproduz lockfile; npm audit -> relatório de advisories; postinstall -> código de pacote pode executar durante instalação",
    "npm ci -> reproduz lockfile coerente; ^ e ~ têm faixas semver diferentes; audit report não prova ausência de risco; lockfile não torna pacote confiável",
    "Interpretar npm audit sem achados como garantia, ignorar postinstall ou usar npm install em CI para alterar o lockfile.",
    ("Compare intervalos semver e identifique o que muda numa major.", "Confira package-lock e rode npm ci em uma cópia própria.", "Leia npm audit e examine scripts de ciclo de vida antes de confiar numa dependência."),
    "A atividade usa uma fixture segura sem scripts de instalação. No projeto exportado, compare versões, confira o lockfile, rode npm ci e npm audit; revise postinstall antes de adicionar pacotes. Nunca execute deliberadamente um script de pacote suspeito para demonstrar o risco.",
    "pacote npm novo -> faixa semver, lockfile, audit e script de instalação avaliados antes do uso.",
    kind="PROJECT", title="Instale dependências com segurança", runtime="Node.js 24 LTS",
    compatibility="npm ci exige package-lock compatível com package.json; npm audit depende do registry e seus resultados variam com o tempo.",
    estimated=40,
    first_response="Compare o risco de uma versão fixa com uma faixa de atualização.", first_response_timing="Antes de rodar npm ci ou audit.",
    interaction="Manifestos JSON e lockfile legíveis; o exemplo postinstall é dado estático e não é executado pela atividade.",
    transfer_prompt="Avalie uma dependência nova, documente a faixa aceita, o lockfile, a saída de audit e scripts de ciclo de vida antes da instalação.",
    explanation={"mental_model": "Semver expressa uma faixa de versões; lockfile fixa uma resolução concreta; instalação pode executar scripts definidos por pacotes.", "worked_example": "Compare ^1.2.3, ~1.2.3 e 1.2.3, rode npm ci com lock coerente e leia avisos do npm audit antes de decidir uma mudança.", "common_trap": "Lockfile e audit reduzem incerteza, mas não certificam a origem ou comportamento de um pacote.", "why_it_matters": "Revisar mudanças de dependência reduz atualizações acidentais e exposição a execução não esperada durante install."},
    review={"prompt": "npm audit sem vulnerabilidades prova que a dependência é confiável?", "choices": ("Não; o relatório cobre advisories conhecidos e não certifica o pacote", "Sim; lockfile elimina todos os riscos", "Sim, se a versão for major zero"), "answer": "Não; o relatório cobre advisories conhecidos e não certifica o pacote", "feedback_correct": "Audit é uma fonte de informação, não uma garantia de segurança.", "feedback_incorrect": "Lockfile e audit não eliminam riscos de origem ou comportamento."},
    prompt="Compare ^, ~ e versão exata, verifique a função do package-lock, rode npm ci e npm audit no projeto e avalie o risco de scripts postinstall. Diferencie o relatório do audit de uma garantia de segurança.",
    resources=("npm semver calculator/ranges: https://docs.npmjs.com/about-semantic-versioning", "npm ci: https://docs.npmjs.com/cli/commands/npm-ci", "npm audit: https://docs.npmjs.com/cli/commands/npm-audit", "npm lifecycle scripts: https://docs.npmjs.com/cli/using-npm/scripts"),
    rubric=("Explica como ^ e ~ limitam atualizações e por que uma major pode quebrar compatibilidade.", "Lockfile é versionado e npm ci é separado de npm install.", "npm audit é interpretado como relatório limitado, não como prova de ausência de risco.", "A análise considera scripts de instalação e declara o resultado observado localmente."),
)


# Fase 5 (análise curricular, item 5.7): extensões opcionais com Node real, executadas como checkpoint local.
# Os comandos rodam numa cópia limpa da referência; a plataforma não executa Node real no navegador.
from recipe_api import E as _E14

# import.meta.dirname e filename: depois de 14.05 (bug de caminho).
CONTENT["14.19"] = _E14(
    "modules.import_meta_paths",
    "Crie caminhos.mjs com pastaDoModulo(), arquivoDoModulo() e arquivoPorUrl(), sem depender do diretório de execução.",
    "pastaDoModulo() -> a pasta do arquivo; arquivoDoModulo() termina em caminhos.mjs; arquivoPorUrl() -> coincide com arquivoDoModulo()",
    "rodar o teste de outra pasta -> mesmo resultado; path.dirname(arquivoDoModulo()) -> coincide com pastaDoModulo()",
    "Montar o caminho com process.cwd(), que depende de onde o comando foi executado, e não do arquivo.",
    "Ao rodar o teste de outra pasta, o caminho calculado com process.cwd() aponta para o lugar errado e o teste falha.",
    "Qual valor muda quando você roda o comando de outra pasta: o diretório de execução ou o arquivo do módulo?",
    ("O caminho do módulo não depende de onde o processo começou; ele depende do arquivo.", "Use import.meta.dirname e import.meta.filename. Para runtimes sem essas propriedades, derive o caminho de import.meta.url com fileURLToPath.", "Exemplo parecido: o __dirname de CommonJS era a alternativa antiga para o mesmo problema."),
    "import.meta.dirname e import.meta.filename apontam para o arquivo do módulo; fileURLToPath(import.meta.url) é a alternativa para versões sem essas propriedades.",
    "Comando rodado de outra pasta -> pastaDoModulo() continua apontando para a pasta do módulo",
    kind="MAKE", estimated=18, load={"novelty": 3, "syntax": 2, "composition": 2, "state": 1, "debugging": 2, "files": 2, "reading": 2, "independence": 3, "tools": 3},
    runtime="Node.js 24 LTS (ES modules)",
    compatibility="import.meta.dirname e import.meta.filename (Node.js 20.11 e 21.2; estáveis no 24). Não se aplicam ao navegador; use import.meta.url como alternativa.",
    optional=True,
    explanation={
        "mental_model": "Cada módulo sabe onde está. import.meta.dirname e import.meta.filename descrevem o arquivo que contém o código, independentemente do diretório de trabalho.",
        "worked_example": "Ao rodar node --test caminhos.test.mjs a partir da pasta do projeto ou de outra pasta, arquivoDoModulo() continua apontando para caminhos.mjs.",
        "common_trap": "Usar process.cwd() para achar arquivos vizinhos: o resultado depende de quem chamou o comando.",
        "why_it_matters": "Scripts e ferramentas rodam de lugares diferentes. Caminhos ligados ao arquivo evitam erros que só aparecem no computador de outra pessoa.",
    },
    first_response="Antes de rodar, escreva a pasta que você espera em pastaDoModulo() quando o comando é executado de outra pasta.",
    first_response_timing="Antes do primeiro comando.",
    interaction="Checkpoint local: comandos e saídas são registrados pelo aluno no próprio computador.",
    resources=("Node.js: import.meta.dirname e import.meta.filename — https://nodejs.org/api/esm.html", "Node.js: node --test — https://nodejs.org/api/test.html"),
    review={
        "prompt": "Qual expressão dá a pasta do módulo, mesmo quando o comando roda de outra pasta?",
        "choices": ["import.meta.dirname", "process.cwd()", "'.'"],
        "answer": "import.meta.dirname",
        "feedback_correct": "import.meta.dirname depende do arquivo do módulo, e não de onde o comando foi executado.",
        "feedback_incorrect": "process.cwd() e '.' dependem do diretório de execução, que muda entre comandos.",
    },
    transfer_prompt="Carregue um arquivo de dados ao lado do script e rode o comando a partir de outra pasta. Registre o comando, a saída e o código de saída.",
    prompt="Crie caminhos.mjs e rode node --test caminhos.test.mjs. Antes do Run, escreva a pasta que pastaDoModulo() deve devolver e por que ela não muda com o diretório de execução.",
    rubric=("Registra o comando, a saída e o código de saída de node --test.", "Explica por que import.meta.dirname não depende do diretório de execução.", "Mostra a alternativa com import.meta.url para runtimes sem a propriedade."),
)

# --env-file e process.loadEnvFile: depois de 14.06 (config por ambiente).
CONTENT["14.20"] = _E14(
    "node.env_file_loading",
    "Crie config.mjs com carregarEnvArquivo(caminho) usando process.loadEnvFile e lerConfig(env), que valida PORTA e aplica padrões.",
    "lerConfig({}) -> porta 3000 e modo producao; lerConfig({PORTA: '8080', MODO: 'dev'}) -> porta 8080 e modo dev",
    "PORTA 'abc' -> lança RangeError; arquivo com PORTA=9000 -> lerConfig(process.env) devolve porta 9000",
    "Ler o arquivo .env dentro da função de validação, o que mistura leitura de disco com regra de negócio e impede testar lerConfig com um objeto.",
    "A função que valida a configuração passa a depender do disco: o teste de PORTA inválida precisa de um arquivo, e o erro aparece tarde.",
    "Qual parte depende do sistema de arquivos e qual parte pode ser uma função pura sobre um objeto?",
    ("Separe o efeito (ler o arquivo para process.env) da validação (uma função que recebe um objeto).", "Chame process.loadEnvFile(caminho) em uma função própria e passe process.env ou outro objeto para lerConfig.", "Exemplo parecido: a validação de um formulário recebe os dados, e quem lê a requisição fica fora dela."),
    "carregarEnvArquivo chama process.loadEnvFile; lerConfig recebe um objeto e valida PORTA com expressão regular, devolvendo porta numérica e modo com padrões.",
    "Arquivo .env com MODO ausente e PORTA válida -> lerConfig devolve o modo padrão e a porta lida",
    kind="MAKE", estimated=20, load={"novelty": 3, "syntax": 2, "composition": 3, "state": 2, "debugging": 2, "files": 2, "reading": 2, "independence": 3, "tools": 3},
    runtime="Node.js 24 LTS (ES modules)",
    compatibility="process.loadEnvFile (Node.js 20.12 e 21.7; não experimental desde 22.21 e 24.10). Não existe no navegador; o carregamento fica separado de lerConfig, que é pura.",
    optional=True,
    explanation={
        "mental_model": "Variáveis de ambiente chegam ao processo de uma vez. process.loadEnvFile lê um arquivo e preenche process.env; depois disso, uma função pura lê o objeto e decide os valores válidos.",
        "worked_example": "Com PORTA=9000 no arquivo, process.loadEnvFile preenche process.env.PORTA; lerConfig(process.env) devolve porta 9000. Com PORTA=abc, a mesma validação lança RangeError.",
        "common_trap": "Esperar que loadEnvFile sobrescreva variáveis já definidas: ele não sobrescreve, por isso o teste limpa as variáveis antes.",
        "why_it_matters": "Configuração por ambiente é onde a maioria das falhas de implantação começa. Separar leitura e validação deixa o erro visível antes do deploy.",
    },
    first_response="Antes de rodar, escreva o que lerConfig({}) devolve e qual parte do código precisa do disco para mudar esse resultado.",
    first_response_timing="Antes do primeiro comando.",
    interaction="Checkpoint local: comandos e saídas são registrados pelo aluno no próprio computador.",
    resources=("Node.js: process.loadEnvFile — https://nodejs.org/api/process.html", "Node.js: --env-file — https://nodejs.org/api/cli.html"),
    review={
        "prompt": "Por que lerConfig deve receber um objeto, e não ler o disco sozinha?",
        "choices": ["Para testar a validação sem depender de arquivo", "Porque process.env não existe no Node", "Para que o navegador possa carregá-la"],
        "answer": "Para testar a validação sem depender de arquivo",
        "feedback_correct": "Uma função pura recebe os valores e devolve o resultado, e o teste não precisa de disco.",
        "feedback_incorrect": "process.env existe no Node; a razão é separar efeito de validação para testar cada parte.",
    },
    transfer_prompt="Adicione a variável MODO com valores permitidos e escreva o teste de valor inválido. Registre comandos e códigos de saída.",
    prompt="Crie config.mjs e rode node --test config.test.mjs. Antes do Run, diga qual variável o loadEnvFile não sobrescreve e por que o teste a limpa.",
    rubric=("Registra os comandos, a versão do Node e o código de saída do teste.", "Separa carregamento de arquivo da função pura lerConfig.", "Explica o que loadEnvFile faz e o que não faz com variáveis existentes."),
)

# node --run e npm run: depois de 14.03 (package scripts).
CONTENT["14.21"] = _E14(
    "node.run_scripts",
    "Crie um package.json com os scripts saudacao (node saudacao.mjs) e presaudacao (um script de aviso), e rode os dois comandos para comparar a saída.",
    "node --run saudacao -> imprime 'olá, DevPath' com código 0; npm run saudacao -> imprime o aviso antes de 'olá, DevPath'",
    "node --run não executa presaudacao -> só olá; npm run executa presaudacao antes do script principal",
    "Achar que node --run é só um atalho idêntico a npm run, sem diferença em scripts pre e post.",
    "Ao comparar as saídas, o aviso de presaudacao aparece só com npm run; quem usou node --run e esperava o aviso fica sem explicação.",
    "Qual dos dois comandos executa os scripts pre e post, e qual não executa?",
    ("Compare as duas saídas linha a linha antes de concluir qualquer coisa.", "node --run lê o script e roda só o comando indicado. npm run além disso segue os hooks pre e post definidos no mesmo package.json.", "Exemplo parecido: um script de build com um hook de limpeza executado só pelo gerenciador de pacotes."),
    "node --run saudacao roda apenas o comando do script; npm run saudacao roda presaudacao, depois saudacao. A diferença vem do que cada comando executa, não da velocidade.",
    "Script com hook pre e comando de verificação -> node --run sem o hook; npm run com o hook",
    kind="COMPARE", estimated=16, load={"novelty": 3, "syntax": 2, "composition": 2, "state": 1, "debugging": 2, "files": 2, "reading": 3, "independence": 3, "tools": 3},
    runtime="Node.js",
    compatibility="node --run (Node.js 22.3, estável no 24) executa scripts do package.json sem os hooks pre e post do npm run. A versão 20.15 não foi confirmada.",
    optional=True,
    explanation={
        "mental_model": "Um script no package.json é um comando com nome. npm run acrescenta regras do gerenciador de pacotes, como pre e post. node --run executa o comando nomeado sem essas regras.",
        "worked_example": "Com presaudacao definido, npm run saudacao imprime 'antes do script' e depois 'olá, DevPath'. Com node --run saudacao, só 'olá, DevPath' aparece.",
        "common_trap": "Concluir que node --run é mais rápido e usá-lo em um fluxo que depende de hooks: o script pre nunca roda.",
        "why_it_matters": "Scripts que preparam ambiente ou validam código dependem de hooks. Trocar o comando sem saber disso muda o resultado do build sem erro visível.",
    },
    first_response="Antes de rodar, escreva qual das duas saídas você espera ver a linha 'antes do script'.",
    first_response_timing="Antes do primeiro comando.",
    interaction="Checkpoint local: duas saídas registradas lado a lado, com o código de saída de cada comando.",
    resources=("Node.js: node --run (CLI) — https://nodejs.org/api/cli.html", "npm: scripts e hooks pre/post — https://docs.npmjs.com/cli/v10/using-npm/scripts"),
    review={
        "prompt": "Qual comando executa o script presaudacao antes de saudacao?",
        "choices": ["npm run saudacao", "node --run saudacao", "node saudacao.mjs"],
        "answer": "npm run saudacao",
        "feedback_correct": "npm run segue os hooks pre e post definidos no package.json; node --run não segue.",
        "feedback_incorrect": "node --run e node saudacao.mjs executam só o comando nomeado, sem os hooks do npm.",
    },
    transfer_prompt="Crie um script de verificação com hook pre e compare os dois comandos. Registre a saída e o código de saída de cada um.",
    prompt="Crie o package.json com saudacao e presaudacao e rode os dois comandos. Antes de rodar, diga qual saída você espera de node --run saudacao.",
    rubric=("Registra a saída e o código de saída de node --run e de npm run.", "Explica a diferença entre comando nomeado e hooks pre/post.", "Indica quando node --run é apropriado e quando o fluxo depende de npm run."),
)

# require(esm) e top-level await: depois de 14.04 (ESM vs CJS).
CONTENT["14.22"] = _E14(
    "modules.require_esm",
    "Crie util.mjs (ESM síncrono) e usar.cjs, que o carrega com require(). Depois crie comTopLevelAwait.mjs e compare require() com import().",
    "node usar.cjs -> imprime 5 (2 + 3) e sai com código 0",
    "require de módulo com top-level await -> lança ERR_REQUIRE_ASYNC_MODULE; import() do mesmo módulo -> imprime 1",
    "Achar que require() carrega qualquer módulo ESM, incluindo módulos com top-level await.",
    "Ao chamar require em comTopLevelAwait.mjs, o código de erro é ERR_REQUIRE_ASYNC_MODULE; quem espera que require carregue o módulo sem erro não entende a falha.",
    "Qual condição do módulo impede require() de carregá-lo?",
    ("Olhe o que o módulo contém: a presença de await no nível do módulo muda a regra.", "require() só carrega ESM síncrono. Para o módulo com top-level await, use import(), que é assíncrono.", "Exemplo parecido: uma função async é chamada com await; um módulo async exige o mesmo cuidado com import()."),
    "require(esm) carrega util.mjs porque ele é síncrono; comTopLevelAwait.mjs lança ERR_REQUIRE_ASYNC_MODULE, e import() devolve o namespace assíncrono do mesmo módulo.",
    "Módulo com await de nível superior -> require lança ERR_REQUIRE_ASYNC_MODULE e import devolve o valor",
    kind="COMPARE", estimated=16, load={"novelty": 4, "syntax": 2, "composition": 3, "state": 2, "debugging": 3, "files": 3, "reading": 3, "independence": 3, "tools": 3},
    runtime="Node.js 24 LTS (ES modules)",
    compatibility="require(esm) (Node.js 22.0 com flag; liberado sem flag em 22.12 e no 24). Módulo com top-level await lança ERR_REQUIRE_ASYNC_MODULE; a alternativa é import(). Não existe no navegador.",
    optional=True,
    explanation={
        "mental_model": "require() é síncrono e precisa devolver o módulo na mesma chamada. Um módulo com top-level await só termina depois de uma promise, então não pode ser entregue de forma síncrona: nesse caso, import() é a porta.",
        "worked_example": "usar.cjs chama require('./util.mjs') e imprime 5. Para comTopLevelAwait.mjs, require lança ERR_REQUIRE_ASYNC_MODULE e import('./comTopLevelAwait.mjs') resolve com valor 1.",
        "common_trap": "Usar require para tudo porque 'agora funciona': a falha aparece só quando o módulo ganha um await de nível superior.",
        "why_it_matters": "Bibliotecas misturam CommonJS e ESM. Saber quando require basta evita erros de carga que só aparecem em produção.",
    },
    first_response="Antes de rodar, escreva o que você espera de require('./comTopLevelAwait.mjs') e por quê.",
    first_response_timing="Antes do primeiro comando.",
    interaction="Checkpoint local: três saídas registradas (usar, falha, alternativa) com código de saída.",
    resources=("Node.js: carregar ESM com require() — https://nodejs.org/api/modules.html", "Node.js: import() — https://nodejs.org/api/esm.html"),
    review={
        "prompt": "Um módulo ESM tem top-level await. Qual função deve carregá-lo?",
        "choices": ["import()", "require()", "module.exports"],
        "answer": "import()",
        "feedback_correct": "import() é assíncrono e aceita módulos com top-level await; require() não.",
        "feedback_incorrect": "require() é síncrono e lança ERR_REQUIRE_ASYNC_MODULE nesse caso; module.exports não carrega nada.",
    },
    transfer_prompt="Explique por que um módulo que lê configuração com await no topo quebra require() e qual mudança no chamador resolve o problema.",
    prompt="Crie util.mjs, usar.cjs, comTopLevelAwait.mjs e falha.cjs, e rode cada comando. Antes do Run, diga o código de erro esperado de falha.cjs.",
    rubric=("Registra a saída e o código de saída de cada comando.", "Explica a diferença entre require() síncrono e import() assíncrono.", "Identifica a causa do ERR_REQUIRE_ASYNC_MODULE no grafo do módulo."),
)
