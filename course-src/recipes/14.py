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
     'com Promise.reject; documente que trocar o momento da chamada muda semântica.'), 'Avaliar Iterator helpers em runtime alvo -> usar, fallback ou adiar', 18, 'Node.js 24 LTS (ES modules)', ('Consulte fonte oficial para decidir se Iterator helpers cabem no runtime alvo. '
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
    '14.13': "event-loop.js: const inicio = Date.now();\nfor (let i = 0; i < 1_000_000_000; i += 1) {}\nsetTimeout(() => console.log('timer', Date.now() - inicio), 0);\nconsole.log('sync', Date.now() - inicio);\n\n// Compare bloqueio síncrono com trabalho em pequenos lotes agendados.",
    '14.01': "material.md: // grafo de import de valor\nA -> B\nB -> C\nC -> A\nD -> B\nE (sem dependências)\n\nDesenhe o ciclo e indique quais módulos pertencem ao ciclo. Depois considere um import de tipo isolado em D.",
    '14.02': "material.md: Bloco A: const argumentos = process.argv.slice(2);\nBloco B: const comando = argumentos[0];\nBloco C: const resultado = executarDominio(comando, argumentos.slice(1));\nBloco D: process.stdout.write(`${resultado}\\n`);\nBloco E: if (!comandos.has(comando)) { mostrarUso(); process.exitCode = 2; return; }\n\nContexto: function main(argv = process.argv) { /* ordenar blocos; domínio não lê process.argv */ }",
    '14.03': "package.json: {\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"TODO\",\n    \"test\": \"TODO\",\n    \"start\": \"TODO\"\n  }\n}\n\nArquivos existentes: src/main.js e test/app.test.js. Preencha somente os três comandos; o ambiente é Node.js 24 e usa node:test.",
    '14.04': "material.md: // math.cjs\nfunction soma(a, b) { return a + b; }\nmodule.exports = { soma };\n\n// app.cjs\nconst { soma } = require('./math.cjs');\nconsole.log(soma(2, 3));\n\nConverta o pacote para ESM no Node.js: package type module, exports/imports consistentes e extensão relativa explícita.",
    '14.05': "config.js: import { readFile } from 'node:fs/promises';\n\nexport async function carregarConfig() {\n  return JSON.parse(await readFile('./data/config.json', 'utf8'));\n}\n\n// BUG: o caminho é resolvido em relação ao cwd do processo. O arquivo fica ao lado do módulo.",
    '14.06': "config.js: export function loadConfig(env) {\n  const portTexto = env.PORT || '3000';\n  const logLevel = env.LOG_LEVEL || 'info';\n  const token = env.TOKEN;\n  // TODO: trate defaults, conversão/intervalo da porta e segredo exigido em produção.\n  // Nunca inclua token em erro ou log.\n}\n",
    '14.07': "material.md: const quadrados = Iterator.from([1, 2, 3]).map((n) => n * n).toArray();\n\nRuntime declarado para a decisão: Node.js 24 LTS.\nConsulte documentação oficial de compatibilidade; registre fonte/data e escolha usar, fallback ou adiar. A sintaxe transpilada não garante a API em runtime.",
    '14.08': "cli.js: export function executar(comando, repositorio) {\n  // TODO: separar parse de argv, regras de notas e adaptador de filesystem.\n  // Contrato: add cria; list preserva ordem; remove ausente retorna not-found.\n}\n\n// Fixtures: arquivo ausente e JSON corrompido devem produzir erro contextual sem sobrescrever dados.",
    '14.09': "material.md: repositório descartável\nbranch main: README.md contém 'uso'\nbranch feature: README.md contém 'uso' e 'exemplo'\nworking tree: config.json modificado e segredo fictício visível no diff\n\nAntes de concluir merge/commit, inspecione status, diff staged e resultado combinado.",
    '14.10': "material.md: Traceie a sequência de três módulos abaixo.\n\n```js\n// a.js\nimport { valor } from './b.js';\nconsole.log('A', valor);\n\n// b.js\nexport const valor = await Promise.resolve(5);\n\n// c.js\nconst modulo = await import('./a.js');\nconsole.log('C', modulo.valor);\n```\n\nRegistre separadamente: vinculação do import nomeado; avaliação assíncrona de b.js; instante em que a Promise de import() de c.js resolve; e ordem dos logs. Não misture o grafo ilustrativo em um único arquivo executável.",
    '14.11': "package.json: {\n  \"dependencies\": { \"csv-choice-a\": \"^1.2.0\", \"csv-choice-b\": \"^3.0.0\" }\n}\n\nDossiê local compara licença, manutenção, tamanho, dependências transitivas, versão/lockfile e plano de atualização.",
}
for _card_id, _starter in _LITERAL_STARTERS.items():
    CONTENT[_card_id]["starter"] = _starter

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
    '14.07': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Iterator',
    '14.08': 'https://nodejs.org/api/fs.html',
    '14.09': 'https://git-scm.com/docs/git-status',
    '14.10': 'https://nodejs.org/api/esm.html',
    '14.11': 'https://docs.npmjs.com/cli/v11/configuring-npm/package-json',
}
for _card_id, _official_url in _OFFICIAL_DOCS.items():
    CONTENT[_card_id]["docs"] = _official_url
