from recipe_api import C

def _lesson(skill, starter, misconception, hints, solution, transfer, minutes, runtime, details):
    prompt, worked_example, first_response, interaction, resource, review_prompt, correct, wrong_a, wrong_b, transfer_prompt = details
    return {
        "prompt": prompt,
        "explanation": {
            "mental_model": " ".join(hints),
            "worked_example": worked_example,
            "common_trap": misconception,
            "why_it_matters": transfer_prompt,
        },
        "first_response": first_response,
        "first_response_timing": "Antes de executar ou abrir a explicação.",
        "interaction": interaction,
        "resources": (resource,),
        "compatibility": f"Baseline {runtime}; o comportamento de cada API está delimitado pelo contrato desta atividade.",
        "review": {
            "prompt": review_prompt,
            "choices": (correct, wrong_a, wrong_b),
            "answer": correct,
            "feedback_correct": f"Correto. {worked_example}",
            "feedback_incorrect": f"Revise esta regra: {misconception} {worked_example}",
        },
        "transfer_prompt": transfer_prompt,
    }

CONTENT = {
"12.01": C(
    'async.event_loop',
    ("console.log('A'); setTimeout(()=>log('T'),0); Promise.resolve().then(()=>log('P')); "
     "log('B')"),
    'execução -> A,B,P,T',
    ('dois then encadeados e timer -> microtasks drenam antes do timer, com FIFO entre '
     'microtasks agendadas'),
    'Tratar timeout 0 como execução imediata.',
    ('Execute a pilha síncrona.',
     'Depois drene fila de microtasks.',
     'Então processe a próxima task.'),
    ('Ordem A,B,P,T; promessa agenda microtask e setTimeout agenda task, mesmo com atraso '
     'zero.'),
    'Prever logs de resposta resolvida e timer de UI -> ordem explicada',
    load={"novelty": 1, "syntax": 1, "composition": 1, "state": 1, "debugging": 1, "files": 1, "reading": 2, "independence": 1, "tools": 1},
        kind='PREDICT',
    estimated=6,
    runtime='Node.js 24 LTS',
    **_lesson('async.event_loop', ("console.log('A'); setTimeout(()=>log('T'),0); Promise.resolve().then(()=>log('P')); "
     "log('B')"), 'Tratar timeout 0 como execução imediata.', ('Execute a pilha síncrona.',
     'Depois drene fila de microtasks.',
     'Então processe a próxima task.'), ('Ordem A,B,P,T; promessa agenda microtask e setTimeout agenda task, mesmo com atraso '
     'zero.'), 'Prever logs de resposta resolvida e timer de UI -> ordem explicada', 6, 'Node.js 24 LTS', ('Sem executar, preveja a ordem dos logs e explique por que atraso zero não torna um '
     'timer síncrono.',
     'Um log síncrono antes e depois de queueMicrotask permanece na mesma pilha; a '
     'microtask roda após essa pilha e antes do callback setTimeout.',
     'Escreva uma linha para pilha atual, outra para microtasks e outra para a próxima '
     'task antes de prever a ordem.',
     'Linha do tempo com ordenação textual e controles de mover para cima/baixo por '
     'teclado.',
     'Snippet Node.js, console de saída e quadro de etapas; sem instalar pacote ou usar '
     'rede.',
     'Quando um callback setTimeout pode rodar em relação às reações de Promise já '
     'enfileiradas?',
     'Depois da pilha atual e quando a fila de microtasks estiver vazia.',
     'Imediatamente após a linha que o agenda porque o atraso é zero.',
     'Antes das instruções síncronas que vêm depois do agendamento.',
     'Preveja a ordem entre uma resposta já resolvida e uma notificação de interface '
     'agendada por timer; identifique cada fila.')),
         ),
"12.02": C(
    'async.retry',
    ('blocos embaralhados: attempt=0; try await op(); catch; se attempt<max await delay; '
     'senão throw'),
    'op falha duas vezes e resolve na 3ª, max=3 -> 3 chamadas, resultado',
    ('max=1 com falha -> 1 chamada e erro original; delay só entre tentativas; max<=0 -> '
     'rejeição de validação antes da primeira chamada'),
    'Repetir infinitamente ou esperar após última falha.',
    ('Defina se max conta tentativas totais.',
     'Incremente antes de executar op.',
     'Só aguarde se ainda houver tentativa.'),
    ('Loop for attempt de 1 a max, return await op no try; catch relança na última, senão '
     'await delay; valide max.'),
    'Retry de gravação transitória com máximo fixo -> chamadas e atrasos exatos',
    load={"novelty": 2, "syntax": 3, "composition": 4, "state": 4, "debugging": 3, "files": 2, "reading": 3, "independence": 3, "tools": 2},
        kind='PARSONS',
    estimated=10,
    runtime='Node.js 24 LTS',
    requires=('errors.types',),
    **_lesson('async.retry', ('blocos embaralhados: attempt=0; try await op(); catch; se attempt<max await delay; '
     'senão throw'), 'Repetir infinitamente ou esperar após última falha.', ('Defina se max conta tentativas totais.',
     'Incremente antes de executar op.',
     'Só aguarde se ainda houver tentativa.'), ('Loop for attempt de 1 a max, return await op no try; catch relança na última, senão '
     'await delay; valide max.'), 'Retry de gravação transitória com máximo fixo -> chamadas e atrasos exatos', 10, 'Node.js 24 LTS', ('Ordene os blocos de retry e declare se max representa tentativas totais. Inclua '
     'validação e os pontos onde uma espera é permitida.',
     'Se uma gravação de arquivo puder ser tentada duas vezes, uma falha transitória na '
     'primeira chamada permite uma espera e uma última chamada; não há espera depois da '
     'falha final.',
     'Defina o significado de max e marque no laço a única transição que pode aguardar '
     'antes de uma nova tentativa.',
     'Blocos reordenáveis por teclado com contador de tentativas e log de atrasos '
     'virtuais; sem arrastar.',
     'Starter com operação e delay injetados, promises locais controláveis e saída de '
     'chamadas/esperas/erros.',
     'Quando retry deve esperar antes de chamar a operação novamente?',
     'Após uma falha quando o limite configurado ainda permite nova tentativa.',
     'Após toda falha, inclusive a última.',
     'Antes de cada chamada, mesmo se a operação já teve sucesso.',
     'Especifique retry limitado para uma gravação temporariamente indisponível, com '
     'limites explícitos de chamadas e esperas.')),
         ),
"12.03": C(
    'async.promise_all',
    ('main.js: export async function carregar(api){ /* produtos, usuários, preços '
     'independentes */ }'),
    'três promises resolvem 1,2,3 -> Promise.all devolve [1,2,3] na ordem de entrada',
    ('resolução fora de ordem -> array ainda [1,2,3]; uma rejeita -> Promise.all rejeita, '
     'outras operações não são automaticamente canceladas'),
    ('Fazer awaits sequenciais para recursos independentes ou pensar que rejeição cancela '
     'requests.'),
    ('Inicie as três operações antes do primeiro await.',
     'Passe promises em array na ordem do contrato.',
     'Desestruture resultado após Promise.all.'),
    ('const [produtos,usuarios,precos]=await '
     'Promise.all([api.produtos(),api.usuarios(),api.precos()]); retorne objeto nomeado.'),
    'Carregar perfil e preferências independentes -> concorrência e ordem estável',
    load={"novelty": 2, "syntax": 3, "composition": 3, "state": 3, "debugging": 2, "files": 2, "reading": 3, "independence": 3, "tools": 2},
        kind='FADED',
    estimated=10,
    runtime='Node.js 24 LTS',
    **_lesson('async.promise_all', ('main.js: export async function carregar(api){ /* produtos, usuários, preços '
     'independentes */ }'), ('Fazer awaits sequenciais para recursos independentes ou pensar que rejeição cancela '
     'requests.'), ('Inicie as três operações antes do primeiro await.',
     'Passe promises em array na ordem do contrato.',
     'Desestruture resultado após Promise.all.'), ('const [produtos,usuarios,precos]=await '
     'Promise.all([api.produtos(),api.usuarios(),api.precos()]); retorne objeto nomeado.'), 'Carregar perfil e preferências independentes -> concorrência e ordem estável', 10, 'Node.js 24 LTS', ('Complete carregar iniciando juntas as requisições independentes e mantendo a ordem '
     'da API no objeto retornado. Explique o limite de rejeição.',
     'Uma tela pode pedir detalhes de conta e preferências ao mesmo tempo; se preferências '
     'terminar primeiro, cada valor ainda ocupa seu campo nomeado no resultado final.',
     'Marque quais chamadas dependem de outras; inicie apenas as independentes antes do '
     'primeiro await.',
     'Editor com três stubs nomeados, linha do tempo por ordem de conclusão e retorno em '
     'texto; controles por teclado.',
     'Módulo inicial, funções API injetadas, promises locais adiáveis e console; nenhum '
     'endpoint remoto.',
     'O que determina a ordem dos valores retornados por Promise.all?',
     'A ordem das promises na entrada, não o tempo em que se resolvem.',
     'A ordem em que cada promise é cumprida.',
     'Uma rejeição cancela automaticamente todas as outras operações.',
     'Carregue seções de conta independentes ao mesmo tempo e monte a resposta por nome, '
     'ainda que terminem em ordens diferentes.')),
         ),
"12.04": C(
    'async.microtasks_tasks',
    'logs sync A; Promise.resolve().then P1; queueMicrotask Q; setTimeout T; log B',
    'ordem -> A,B,P1,Q,T',
    'P1 agenda P2 durante execução -> A,B,P1,Q,P2,T',
    'Supor que novas microtasks pulam à frente das que já estavam na fila.',
    ('Marque execução síncrona primeiro.',
     'Adicione microtasks à fila na ordem de agendamento.',
     'Task T só roda após esvaziar a fila.'),
    ('Trace a fila FIFO de microtasks, incluindo as adicionadas por P1; timer é task '
     'posterior.'),
    'Prever atualização assíncrona antes de timeout -> ordem com fila explícita',
    load={"novelty": 2, "syntax": 3, "composition": 3, "state": 3, "debugging": 2, "files": 1, "reading": 4, "independence": 3, "tools": 2},
        kind='TRACE',
    estimated=9,
    runtime='Node.js 24 LTS',
    **_lesson('async.microtasks_tasks', 'logs sync A; Promise.resolve().then P1; queueMicrotask Q; setTimeout T; log B', 'Supor que novas microtasks pulam à frente das que já estavam na fila.', ('Marque execução síncrona primeiro.',
     'Adicione microtasks à fila na ordem de agendamento.',
     'Task T só roda após esvaziar a fila.'), ('Trace a fila FIFO de microtasks, incluindo as adicionadas por P1; timer é task '
     'posterior.'), 'Prever atualização assíncrona antes de timeout -> ordem com fila explícita', 9, 'Node.js 24 LTS', ('Trace pilha síncrona, fila FIFO de microtasks e task do timer, incluindo uma '
     'microtask agendada por outra.',
     'Se um callback de Promise enfileira outra microtask enquanto uma já espera, a que '
     'aguardava conserva sua posição; a nova é anexada ao fim.',
     'Desenhe a fila após cada agendamento e só escreva a ordem final quando as instruções '
     'síncronas terminarem.',
     'Tabela de fila com controles adicionar/remover passo a passo e registro textual; '
     'teclado percorre todas as ações.',
     'Snippet Node.js com then, queueMicrotask e setTimeout e folha de rastreamento vazia.',
     'Onde entra uma microtask criada enquanto a fila está sendo drenada?',
     'No fim da fila de microtasks existente.',
     'No início, antes de todas as microtasks já enfileiradas.',
     'Depois da próxima task do timer.',
     'Trace uma atualização assíncrona que agenda uma segunda microtask antes de uma '
     'notificação atrasada.')),
         ),
"12.05": C(
    'async.await_catch',
    ('duas versões: const x=asyncFunc(); usar x como dado; try{return '
     'asyncFunc()}catch(e){...}; corrigir'),
    ('await asyncFunc() -> valor resolvido; try{return await asyncFunc()}catch -> catch '
     'local intercepta rejeição'),
    ('return asyncFunc() sem await em try -> catch local não intercepta rejeição '
     'posterior; await faltante propaga Promise como valor'),
    'Achar que try/catch captura rejeição de Promise retornada sem await.',
    ('Promise é um valor até ser aguardada.',
     'Para tratar localmente, faça await dentro do try.',
     'Teste tanto resolve quanto reject com promise controlada.'),
    ('Use const x=await asyncFunc() e return await asyncFunc() dentro do try quando a '
     'intenção é capturar localmente; preserve a causa.'),
    'Função async que transforma erro de rede -> catch local real',
    load={"novelty": 2, "syntax": 4, "composition": 4, "state": 4, "debugging": 4, "files": 2, "reading": 4, "independence": 4, "tools": 3},
        kind='DEBUG',
    estimated=22,
    runtime='Node.js 24 LTS',
    **_lesson('async.await_catch', ('duas versões: const x=asyncFunc(); usar x como dado; try{return '
     'asyncFunc()}catch(e){...}; corrigir'), 'Achar que try/catch captura rejeição de Promise retornada sem await.', ('Promise é um valor até ser aguardada.',
     'Para tratar localmente, faça await dentro do try.',
     'Teste tanto resolve quanto reject com promise controlada.'), ('Use const x=await asyncFunc() e return await asyncFunc() dentro do try quando a '
     'intenção é capturar localmente; preserve a causa.'), 'Função async que transforma erro de rede -> catch local real', 22, 'Node.js 24 LTS', ('Repare as duas versões assíncronas para que usem valores resolvidos e o catch local '
     'receba a rejeição pretendida.',
     'Se um carregador retorna Promise, use await dentro do try quando essa função precisa '
     'traduzir localmente uma rejeição para uma mensagem útil.',
     'Marque onde a Promise é criada, liquidada e aguardada antes de editar try/catch.',
     'Editor lado a lado com controles resolver/rejeitar e texto que identifica qual catch '
     'tratou o resultado.',
     'Módulo inicial e factory de promise controlada; console Node.js, sem rede nem timer '
     'real.',
     'Por que return promise dentro de try pode não ativar o catch local na rejeição?',
     'A função retorna antes de aguardar a rejeição dentro do try.',
     'Qualquer rejeição de Promise é capturada pelo try lexical mais próximo, mesmo sem '
     'await.',
     'Uma função async transforma todas as rejeições em valores de sucesso.',
     'Repare um helper que converte erro de configuração assíncrono em mensagem de domínio '
     'sem perder a causa.')),
         ),
"12.06": C(
    'fetch.abort_race',
    ('search(q) recebe un fetcher injetado; fixtures determinísticas controlam resposta, '
     'rejeição e atraso; AbortController; UI loading/result/error'),
    'fixture A lenta, depois B rápida -> B visível; A abortada',
    ('abort anterior ocorre antes de iniciar B; resposta A chega tardiamente apesar de '
     'abort -> token de sequência impede sobrescrita; AbortError não aparece como erro ao '
     'usuário; nenhuma chamada à rede externa'),
    'Confiar só na ordem de chegada ou mostrar abort como falha.',
    ('Guarde controller corrente.',
     'Abort anterior e gere id crescente.',
     'Antes de render, cheque id e trate AbortError separado.'),
    ('Injete fetcher controlado nos exemplos: cada busca cria controller e geração; nova '
     'busca aborta anterior; somente geração atual altera UI e erros de cancelamento são '
     'silenciosos. Não use endpoint real.'),
    'Autocomplete com fixture atrasada -> resultado mais recente vence sem depender da rede',
    load={"novelty": 3, "syntax": 4, "composition": 5, "state": 5, "debugging": 4, "files": 4, "reading": 4, "independence": 5, "tools": 4},
        kind='MAKE',
    runtime='browser',
    estimated=25,
    **_lesson('fetch.abort_race', ('search(q) recebe un fetcher injetado; fixtures determinísticas controlam resposta, '
     'rejeição e atraso; AbortController; UI loading/result/error'), 'Confiar só na ordem de chegada ou mostrar abort como falha.', ('Guarde controller corrente.',
     'Abort anterior e gere id crescente.',
     'Antes de render, cheque id e trate AbortError separado.'), ('Injete fetcher controlado nos exemplos: cada busca cria controller e geração; nova '
     'busca aborta anterior; somente geração atual altera UI e erros de cancelamento são '
     'silenciosos. Não use endpoint real.'), 'Autocomplete com fixture atrasada -> resultado mais recente vence sem depender da rede', 25, 'browser', ('Implemente a busca somente com o fetcher injetado e fixtures determinísticas. '
     'Cancele trabalho obsoleto e proteja a renderização se uma resposta antiga chegar '
     'tarde.',
     'Busque uma cidade com fixture lenta e depois outra com fixture rápida. Mesmo que a '
     'primeira resolva por último apesar do abort, um id de geração impede que substitua o '
     'resultado novo.',
     'Escreva a invariável “só a geração atual pode renderizar” e indique onde incrementar '
     'e verificar o id.',
     'Campo de busca, agendador local de fixtures com pausar/liberar, traço de geração e '
     'estados de carregamento/erro/resultado em texto.',
     'Fetcher injetado, Responses locais com ordem de conclusão controlável, '
     'AbortController e estados de UI; sem rede externa.',
     'O que protege a interface se uma requisição abortada ainda resolver?',
     'Uma verificação de geração que só deixa a requisição atual alterar a tela.',
     'Supor que abort torna impossível toda resposta anterior.',
     'Exibir AbortError como falha comum da busca.',
     'Construa autocomplete latest-query-wins com fixtures que deixam liberar respostas em '
     'ordens diferentes.')),
         ),
"12.07": C(
    'async.combinators',
    ('seis cenários: todos necessários; relatório parcial; primeiro resultado/erro; '
     'primeiro sucesso; timeout; fontes espelho'),
    ('todos necessários -> all; parcial -> allSettled; primeiro settle -> race; primeiro '
     'sucesso -> any'),
    ('any com todas rejeitadas -> AggregateError; race timeout exige limpar timer/cancelar '
     'trabalho se possível; all não cancela entradas'),
    'Tratar any e race como equivalentes ou pensar que all cancela tarefas.',
    ('Identifique critério: todos, parcial, primeiro settle ou primeiro sucesso.',
     'Especifique comportamento de rejeição.',
     'No timeout, planeje cleanup e cancelamento.'),
    ('Matriz de escolha com justificativa e casos de falha; implemente exemplo pequeno de '
     'each combinator e compare saídas.'),
    'Encontrar o primeiro pacote de ícones disponível entre cache local, pacote instalado e catálogo remoto -> Promise.any; todas as fontes indisponíveis -> AggregateError',
    load={"novelty": 3, "syntax": 3, "composition": 3, "state": 3, "debugging": 2, "files": 1, "reading": 4, "independence": 4, "tools": 2},
        kind='COMPARE',
    estimated=12,
    runtime='Node.js 24 LTS',
    **_lesson('async.combinators', ('seis cenários: todos necessários; relatório parcial; primeiro resultado/erro; '
     'primeiro sucesso; timeout; fontes espelho'), 'Tratar any e race como equivalentes ou pensar que all cancela tarefas.', ('Identifique critério: todos, parcial, primeiro settle ou primeiro sucesso.',
     'Especifique comportamento de rejeição.',
     'No timeout, planeje cleanup e cancelamento.'), ('Matriz de escolha com justificativa e casos de falha; implemente exemplo pequeno de '
     'each combinator e compare saídas.'), 'Encontrar o primeiro pacote de ícones disponível entre cache local, pacote instalado e catálogo remoto -> Promise.any; todas as fontes indisponíveis -> AggregateError', 12, 'Node.js 24 LTS', ('Escolha um combinador Promise para cada requisito e justifique sucesso, falha '
     'parcial e timeout.',
     'Um resumo de viagem precisa tanto do horário de chegada quanto do portão: '
     'Promise.all entrega o par quando ambos cumprem; se um rejeita, o par não fica disponível.',
     'Em cada cenário, sublinhe se precisa de todos os valores, todos os estados, primeiro '
     'settlement ou primeiro sucesso.',
     'Cartões de cenário por teclado, matriz dos combinadores e rastreamento textual da '
     'ordem resolve/reject; sem arrastar.',
     'Seis cenários locais de promises com tempo controlado, cartão de referência e '
     'console Node.js.',
     'Que diferença separa Promise.any de Promise.race?',
     'any espera o primeiro cumprimento; race encerra no primeiro cumprimento ou rejeição.',
     'Ambos retornam o primeiro sucesso e ignoram rejeições anteriores.',
     'all cancela as operações restantes quando uma rejeita.',
     'Localize o primeiro pacote de ícones de tema disponível entre cache local, pacote instalado e catálogo remoto; verifique o caso de '
     'sucesso e o resultado quando todas as fontes falharem.')),
         ),
"12.08": C(
    'fetch.dashboard',
    ('dashboard consulta /profile e /stats por fetcher injetado; fixtures locais fornecem '
     'Response/status/body/atraso determinísticos; UI loading/error/success; retry; '
     'geração por atualização'),
    ('duas fixtures 200 com JSON válido -> sucesso com dois painéis; retry após fixture de '
     'erro -> nova tentativa'),
    ('fixture HTTP 404 -> erro mesmo com Promise resolvida; JSON inválido -> erro; fixture '
     'antiga lenta -> não sobrescreve nova; loading finaliza; nenhuma requisição externa'),
    'Assumir que fetch rejeita em status HTTP de erro.',
    ('Cheque response.ok e Content-Type.',
     'Leia corpo uma vez e valide forma mínima.',
     'Identificador de geração impede race e try/finally fecha loading.'),
    ('Camada api verifica HTTP e body; controlador inicia requisições independentes, '
     'atualiza estados, permite retry e descarta resposta obsoleta. Todas as respostas vêm '
     'de fixtures injetadas; não dependa da rede.'),
    ('Painel de clima com fixtures para duas fontes -> loading/erro/retry e resposta atual '
     'determinísticos'),
    load={"novelty": 3, "syntax": 4, "composition": 5, "state": 5, "debugging": 4, "files": 5, "reading": 5, "independence": 5, "tools": 4},
        kind='PROJECT',
    runtime='browser',
    estimated=90,
    **_lesson('fetch.dashboard', ('dashboard consulta /profile e /stats por fetcher injetado; fixtures locais fornecem '
     'Response/status/body/atraso determinísticos; UI loading/error/success; retry; '
     'geração por atualização'), 'Assumir que fetch rejeita em status HTTP de erro.', ('Cheque response.ok e Content-Type.',
     'Leia corpo uma vez e valide forma mínima.',
     'Identificador de geração impede race e try/finally fecha loading.'), ('Camada api verifica HTTP e body; controlador inicia requisições independentes, '
     'atualiza estados, permite retry e descarta resposta obsoleta. Todas as respostas vêm '
     'de fixtures injetadas; não dependa da rede.'), ('Painel de clima com fixtures para duas fontes -> loading/erro/retry e resposta atual '
     'determinísticos'), 90, 'browser', ('Complete o dashboard somente com fixtures injetadas. Trate status HTTP separado de '
     'rejeição, valide JSON, permita retry e ignore atualizações obsoletas.',
     'Uma fixture local pode cumprir com status 503 e corpo JSON válido. A Promise de rede '
     'foi cumprida, mas o dashboard precisa classificar a resposta HTTP como malsucedida.',
     'Mapeie transporte, status, parse do corpo, validação da forma e renderização; '
     'associe uma falha possível a cada etapa.',
     'Dashboard com seletor de fixture, tempo controlado, retry e regiões '
     'loading/erro/sucesso; cada estado é anunciado em texto.',
     'Duas fixtures de endpoint com status/header/body/atraso, editor e saída local; '
     'nenhum serviço externo.',
     'Por que a aplicação precisa verificar response.ok depois que fetch cumpre?',
     'Status HTTP de erro também pode produzir Response cumprida, então o status deve ser '
     'conferido.',
     'Toda fetch cumprida sempre contém JSON válido e dados da aplicação.',
     'Response.json rejeita automaticamente em qualquer status que não seja 2xx.',
     'Monte painel de clima para duas fontes com fixtures determinísticas, '
     'loading/erro/retry e proteção contra resposta obsoleta.')),
         ),
"12.09": C(
    'async.promise_try',
    'função talvez síncrona ou Promise; normalize com Promise.try quando runtime suportar',
    'Promise.try(()=>3).then -> 3; Promise.try(()=>Promise.resolve(4)) -> 4',
    ('callback lança Error -> promise rejeita; fallback try{return '
     'Promise.resolve(fn())}catch(e){return Promise.reject(e)} preserva chamada síncrona'),
    ('Executar callback fora de try e deixar throw escapar síncrono, ou dizer que '
     '.then(fn) tem mesma ordem.'),
    ('Promise.try chama callback sincronamente.',
     'Promise.resolve().then(fn) chama callback em microtask; não é igual.',
     'Fallback fiel usa try/catch ao chamar fn e converte retorno/erro em Promise.'),
    ('Use Promise.try(fn) sob feature detection; fallback try{return '
     'Promise.resolve(fn())}catch(e){return Promise.reject(e)}; declare diferença de '
     'criação de Promise e baseline.'),
    ('Normalizar plugin que pode retornar valor ou Promise -> rejeição encapsulada e '
     'chamada no momento correto'),
    load={"novelty": 5, "syntax": 4, "composition": 3, "state": 3, "debugging": 2, "files": 1, "reading": 4, "independence": 4, "tools": 3},
        kind='MODIFY',
    estimated=22,
    runtime='Node.js 24 LTS',
    **_lesson('async.promise_try', 'função talvez síncrona ou Promise; normalize com Promise.try quando runtime suportar', ('Executar callback fora de try e deixar throw escapar síncrono, ou dizer que '
     '.then(fn) tem mesma ordem.'), ('Promise.try chama callback sincronamente.',
     'Promise.resolve().then(fn) chama callback em microtask; não é igual.',
     'Fallback fiel usa try/catch ao chamar fn e converte retorno/erro em Promise.'), ('Use Promise.try(fn) sob feature detection; fallback try{return '
     'Promise.resolve(fn())}catch(e){return Promise.reject(e)}; declare diferença de '
     'criação de Promise e baseline.'), ('Normalizar plugin que pode retornar valor ou Promise -> rejeição encapsulada e '
     'chamada no momento correto'), 22, 'Node.js 24 LTS', ('Normalize um callback que pode retornar valor, Promise ou lançar erro. Compare '
     'Promise.try com fallback fiel e registre quando o callback é chamado.',
     'Um plugin pode retornar string simples e ser normalizado para Promise cumprida; se '
     'lançar durante a chamada, o wrapper transforma isso em rejeição em vez de deixar '
     'escapar sincronamente.',
     'Registre se fn roda na pilha atual ou em uma microtask para as duas abordagens antes '
     'de implementar feature detection.',
     'Editor com seletores de callback que retorna valor, Promise ou lança; saída separa '
     'chamada síncrona e settlement posterior.',
     'Runtime Node.js com Promise.try quando disponível, fallback com Promise nativa e '
     'callbacks controlados.',
     'Por que Promise.resolve().then(fn) não reproduz sempre o timing de Promise.try?',
     'Ele agenda fn em microtask, em vez de chamá-lo imediatamente ao criar o resultado do '
     'wrapper.',
     'Ele captura erro síncrono antes de chamar fn.',
     'Ele retorna valor sem criar Promise alguma.',
     'Normalize um hook de plugin que pode devolver valor ou Promise preservando timing '
     'declarado e caminho de rejeição.')),
         ),
"12.10": C(
    'http.response_model',
    'três trocas HTTP: GET 200 application/json; POST 201 Location; GET 404 text/plain',
    ('GET 200 JSON -> parse JSON; POST 201 -> recurso criado + Location; 404 -> erro de '
     'domínio, não sucesso'),
    ('204 No Content -> não chamar json(); Content-Type ausente/incompatível -> política '
     'explícita'),
    'Confundir status, cabeçalho e corpo ou assumir JSON em toda resposta.',
    ('Leia método e URL da request.',
     'Leia status e headers da response antes do corpo.',
     'Escolha parser conforme status e Content-Type.'),
    ('Tabela por troca com request, response, status, headers e tratamento; 204 tem corpo '
     'ausente por contrato.'),
    'Ler resposta de upload 202 versus 400 -> tratamento distinto',
    load={"novelty": 2, "syntax": 2, "composition": 3, "state": 2, "debugging": 1, "files": 2, "reading": 4, "independence": 3, "tools": 2},
        kind='READ',
    estimated=10,
    runtime='Browser (Fetch API)',
    **_lesson('http.response_model', 'três trocas HTTP: GET 200 application/json; POST 201 Location; GET 404 text/plain', 'Confundir status, cabeçalho e corpo ou assumir JSON em toda resposta.', ('Leia método e URL da request.',
     'Leia status e headers da response antes do corpo.',
     'Escolha parser conforme status e Content-Type.'), ('Tabela por troca com request, response, status, headers e tratamento; 204 tem corpo '
     'ausente por contrato.'), 'Ler resposta de upload 202 versus 400 -> tratamento distinto', 10, 'Browser (Fetch API)', ('Em cada troca HTTP, identifique o que vem do status, dos headers e do corpo. Defina '
     'a política antes de escolher o parser.',
     'Uma requisição de imagem em faixa pode responder 206 com bytes parciais e '
     'Content-Range; o cliente deve distinguir essa representação de uma resposta JSON.',
     'Anote status, tipo de conteúdo e presença de corpo nessa ordem para cada troca.',
     'Tabela de status/header/corpo, seletor de parser e explicação textual acessível para '
     'cada troca.',
     'Cartões locais de request/response para JSON, texto simples e sem conteúdo; nenhum '
     'servidor/rede.',
     'O que conferir antes de chamar json() numa resposta?',
     'Se há corpo e se o tipo/política da resposta pede JSON.',
     'Fazer parse de toda resposta como JSON se o request for GET.',
     'Ignorar status e inferir sucesso apenas pelo header.',
     'Projete o tratamento de resposta para upload que pode ser aceito para processamento '
     'ou rejeitado.')),
         ),
"12.11": C(
    'fetch.body_consumption',
    'Response com JSON, texto, binário Blob/arrayBuffer e FormData; testar bodyUsed',
    'await res.json() -> objeto e bodyUsed=true; segunda leitura res.text() -> TypeError',
    ('204/no body -> tratamento explícito; Content-Type não força parser automaticamente; '
     'res.clone() antes de consumir permite duas leituras'),
    ('Achar que header Content-Type consome/parseia corpo ou que body pode ser lido '
     'repetidamente.'),
    ('Inspecione status/header primeiro.',
     'Escolha método de leitura conforme protocolo.',
     'Se precisar de duas leituras, clone antes da primeira.'),
    ('Demonstre text/json/blob/arrayBuffer/formData em responses apropriadas e registre '
     'bodyUsed antes/depois; valide tipo retornado.'),
    'Response de CSV e imagem -> parser/buffer correto e uma leitura',
    load={"novelty": 3, "syntax": 3, "composition": 4, "state": 4, "debugging": 3, "files": 2, "reading": 4, "independence": 4, "tools": 4},
        kind='INVESTIGATE',
    estimated=20,
    runtime='Browser (Fetch API)',
    **_lesson('fetch.body_consumption', 'Response com JSON, texto, binário Blob/arrayBuffer e FormData; testar bodyUsed', ('Achar que header Content-Type consome/parseia corpo ou que body pode ser lido '
     'repetidamente.'), ('Inspecione status/header primeiro.',
     'Escolha método de leitura conforme protocolo.',
     'Se precisar de duas leituras, clone antes da primeira.'), ('Demonstre text/json/blob/arrayBuffer/formData em responses apropriadas e registre '
     'bodyUsed antes/depois; valide tipo retornado.'), 'Response de CSV e imagem -> parser/buffer correto e uma leitura', 20, 'Browser (Fetch API)', ('Inspecione status e representação, escolha um leitor de corpo e registre bodyUsed '
     'antes/depois.',
     'Um recibo em texto simples pode ser lido uma vez com text(); depois bodyUsed indica '
     'consumo, e outra leitura do mesmo stream não deve ser presumida reutilizável.',
     'Escolha primeiro a representação pretendida e preveja se o corpo ficará consumido '
     'após essa leitura.',
     'Tabela de status, Content-Type, leitor e bodyUsed; controles de leitura por teclado '
     'e resultado em texto.',
     'Responses locais para JSON, texto, Blob/ArrayBuffer e FormData, com console; sem '
     'servidor.',
     'Como ler a mesma resposta por dois consumidores de propósito?',
     'Clonar Response antes de consumir o corpo e ler cada clone uma vez.',
     'Chamar json() e text() em sequência porque o header restaura o stream.',
     'Ler Content-Type, que faz parse e armazena automaticamente o corpo.',
     'Escolha parser e política de leitura única para uma resposta CSV e uma resposta de '
     'imagem.')),
         ),
"12.12": C(
    'date.ttl_timezone',
    'cache {savedAt: ISO UTC,data}; isFresh(now,ttl); Intl.DateTimeFormat para exibir',
    'savedAt 2026-01-01T00:00:00.000Z, now +59s, ttl 60s -> fresh=true; ISO inválido -> stale; ttl negativo -> RangeError; now +60s, ttl 60s -> fresh=false (nowMs - savedMs < ttl)',
    ('fuso de apresentação alterado -> '
     'mesmo instante e frescor em epoch ms'),
    'Comparar strings locais ou exibição formatada para expiração.',
    ('Guarde instante em ISO UTC.',
     'Converta para epoch ms e compare diferença com ttl.',
     'Intl formata só na interface com timeZone declarado.'),
    ('isFresh valida timestamps e ttl, usa Date.parse e nowMs-savedMs < ttl; formatação '
     'Intl separada do cálculo.'),
    'Expiração de token com relógio UTC e exibição São Paulo -> mesmo instante',
    load={"novelty": 3, "syntax": 4, "composition": 4, "state": 3, "debugging": 3, "files": 2, "reading": 4, "independence": 4, "tools": 4},
        kind='MODIFY',
    estimated=22,
    runtime='Node.js 24 LTS',
    **_lesson('date.ttl_timezone', 'cache {savedAt: ISO UTC,data}; isFresh(now,ttl); Intl.DateTimeFormat para exibir', 'Comparar strings locais ou exibição formatada para expiração.', ('Guarde instante em ISO UTC.',
     'Converta para epoch ms e compare diferença com ttl.',
     'Intl formata só na interface com timeZone declarado.'), ('isFresh valida timestamps e ttl, usa Date.parse e nowMs-savedMs < ttl; formatação '
     'Intl separada do cálculo.'), 'Expiração de token com relógio UTC e exibição São Paulo -> mesmo instante', 22, 'Node.js 24 LTS', ('Separe cálculo de frescor da formatação de exibição. Valide timestamp e TTL e use a condição estrita nowMs - savedMs < ttl; na igualdade, o cache está expirado. '
     'Converta e compare os instantes antes de formatar a saída para o fuso escolhido.',
     'O mesmo instante salvo em Lisboa e exibido em Tóquio continua sendo um único valor '
     'de epoch; a conversão visual não altera tempo decorrido.',
     'Escreva a expressão de tempo decorrido e a regra de limite estrito antes de escolher '
     'um formato de exibição.',
     'Controles savedAt/now/TTL, saídas separadas de frescor e horário e seletor de fuso '
     'por teclado.',
     'Função isFresh pura, relógio fixo de fixtures e painel Intl.DateTimeFormat; sem '
     'esperar tempo real.',
     'Por que mudar o fuso deve alterar a exibição, mas não o frescor?',
     'Frescor compara instantes em epoch; o fuso muda apenas sua apresentação.',
     'Strings formatadas locais são a comparação mais confiável para expiração.',
     'O horário exibido deve ser subtraído do TTL para parecer local.',
     'Implemente expiração de token com relógio UTC e exibição no fuso America/Sao_Paulo, '
     'preservando a identidade do instante.')),
         ),
"12.13": C(
    'async.iteration',
    ('async function* pagina(){yield 1; await Promise.resolve(); yield 2}; consumir gradualmente e '
     'materializar'),
    'for await...of -> processa 1 e depois 2; Array.fromAsync(pagina()) -> [1,2] após fim',
    ('fonte com dois itens -> o loop registra cada valor assim que chega; '
     'Array.fromAsync resolve a coleção completa somente depois do fim'),
    'Achar que materializar mantém processamento incremental para o consumidor.',
    ('async generator implementa protocolo async iterator.',
     'for await entrega item por item.',
     'Array.fromAsync só resolve com coleção completa.'),
    ('Compare log temporal de for await com Array.fromAsync quando suportado; fallback '
     'acumula array manualmente com for await.'),
    'Processar páginas de API uma a uma versus carregar todas -> escolha por memória',
    load={"novelty": 4, "syntax": 4, "composition": 4, "state": 4, "debugging": 3, "files": 2, "reading": 4, "independence": 4, "tools": 3},
        kind='COMPARE',
    estimated=12,
    runtime='Node.js 24 LTS',
    **_lesson('async.iteration', ('async function* pagina(){yield 1; await Promise.resolve(); yield 2}; consumir gradualmente e '
     'materializar'), 'Achar que materializar mantém processamento incremental para o consumidor.', ('async generator implementa protocolo async iterator.',
     'for await entrega item por item.',
     'Array.fromAsync só resolve com coleção completa.'), ('Compare log temporal de for await com Array.fromAsync quando suportado; fallback '
     'acumula array manualmente com for await.'), 'Processar páginas de API uma a uma versus carregar todas -> escolha por memória', 12, 'Node.js 24 LTS', ('Compare iteração async incremental com materialização completa. Marque quando cada '
     'valor fica disponível e quando a coleção completa pode ser usada.',
     'Uma fonte async de registros pode deixar o loop resumir o primeiro item enquanto o '
     'segundo ainda carrega; uma coleção completa só é retornada quando a iteração '
     'termina.',
     'Marque o momento de processar o primeiro item e o de finalizar a fonte antes de '
     'escolher uma estratégia.',
     'Comparação de linha do tempo, log item a item e saída de array; teclado avança itens '
     'e erros são textuais.',
     'Fixture de async generator com atraso controlável, starter for-await, '
     'checagem opcional de Array.fromAsync e console.',
     'Qual forma deixa o consumidor processar item antes de a fonte async terminar?',
     'for await...of, porque expõe valores gradualmente.',
     'Array.fromAsync, porque retorna um array parcial após cada yield.',
     'Ambas esperam o iterador inteiro antes de disponibilizar valores.',
     'Escolha streaming ou coleção completa para páginas de API quando memória e tempo até '
     'primeiro resultado têm custos diferentes.')),
         ),
"12.14": C(
    'async.aggregate_error',
    "Promise.any([reject('A'),reject('B')]); capture AggregateError",
    "todas rejeitam -> AggregateError com errors ['A','B'] na ordem de entradas",
    ('uma resolve tardiamente -> sucesso, mesmo com rejeição anterior; array vazio -> '
     'AggregateError com errors vazio'),
    'Tratar primeira rejeição como falha final de any.',
    ('any procura primeira satisfação.',
     'Rejeições são coletadas até todas falharem.',
     'Inspecione .errors e preserve causas originais.'),
    ('try/await Promise.any; catch verifica AggregateError e mapeia errors sem apagar '
     'causas.'),
    'Buscar em três espelhos, reportar causas se todos falham -> falha agregada',
    load={"novelty": 2, "syntax": 3, "composition": 2, "state": 3, "debugging": 1, "files": 1, "reading": 3, "independence": 2, "tools": 2},
        kind='PREDICT',
    estimated=6,
    runtime='Node.js 24 LTS',
    **_lesson('async.aggregate_error', "Promise.any([reject('A'),reject('B')]); capture AggregateError", 'Tratar primeira rejeição como falha final de any.', ('any procura primeira satisfação.',
     'Rejeições são coletadas até todas falharem.',
     'Inspecione .errors e preserve causas originais.'), ('try/await Promise.any; catch verifica AggregateError e mapeia errors sem apagar '
     'causas.'), 'Buscar em três espelhos, reportar causas se todos falham -> falha agregada', 6, 'Node.js 24 LTS', ('Preveja como Promise.any termina conforme cada entrada cumpre ou rejeita. Inspecione '
     'AggregateError apenas depois que todas falharem.',
     'Uma página tenta duas fontes de fonte tipográfica; a primeira que cumpre permite '
     'renderizar, mesmo se uma falha anterior chegou antes.',
     'Monte uma tabela de settlement para cada entrada e só pare no evento que determina o '
     'resultado de any.',
     'Linha do tempo com controles fulfill/reject, lista de erros e avanço por teclado; '
     'saída textual.',
     'Promises controladas com resultados nomeados e console Node.js; sem rede.',
     'Em que situação Promise.any rejeita com AggregateError?',
     'Somente quando todas as entradas rejeitam; o erro conserva os motivos.',
     'Assim que a primeira entrada rejeita.',
     'Sempre que as entradas terminam em ordens diferentes.',
     'Modele uma busca em réplicas e relate falhas somente se nenhuma delas cumprir.')),
         ),
}


_LITERAL_STARTERS = {
    '12.01': "main.js: console.log('A');\nsetTimeout(() => console.log('T'), 0);\nPromise.resolve().then(() => console.log('P'));\nconsole.log('B');",
    '12.02': "material.md: Bloco A: let tentativa = 0;\nBloco B: while (tentativa < max) {\nBloco C: try { return await operacao(); }\nBloco D: catch (erro) {\nBloco E: if (tentativa === max - 1) throw erro;\nBloco F: await esperar(atraso);\nBloco G: tentativa += 1;\nBloco H: }\n\nContexto: async function tentar(operacao, max, esperar, atraso) { /* ordenar blocos */ } Atraso só ocorre antes de uma nova tentativa.",
    '12.03': "main.js: export async function carregar(api) {\n  // api.produtos(), api.usuarios() e api.precos() são independentes.\n  // TODO: iniciar as três operações em paralelo e devolver os resultados na ordem acima.\n}\n",
    '12.04': "main.js: console.log('A');\nPromise.resolve().then(() => {\n  console.log('P1');\n  Promise.resolve().then(() => console.log('P2'));\n});\nqueueMicrotask(() => console.log('Q'));\nsetTimeout(() => console.log('T'), 0);\nconsole.log('B');",
    '12.05': "profile.js: export async function carregar(fetchProfile) {\n  try {\n    return fetchProfile();\n  } catch (erro) {\n    return { nome: 'offline' };\n  }\n}\n\n// fetchProfile() devolve uma Promise que pode rejeitar depois da chamada.\n// O fallback deveria ser usado quando essa rejeição ocorre.",
    '12.06': "search.js: export function criarBusca(fetcher) {\n  let controllerAtual;\n  let sequencia = 0;\n  return async function buscar(query) {\n    // TODO: cancelar a busca anterior, iniciar a nova e ignorar resposta obsoleta.\n    // fetcher(query, { signal }) usa fixtures locais e pode resolver/rejeitar com atraso.\n  };\n}\n",
    '12.07': "material.md: // São seis requisitos possíveis: esperar todas; conservar sucessos parciais; primeiro a terminar; primeiro sucesso; corrida com timeout; consultar réplicas.\n// Para cada requisito, escolha all, allSettled, race ou any e registre efeitos de cancelamento/limpeza.",
    '12.08': "dashboard.js: export function criarDashboard(fetcher) {\n  // fetcher('/profile') e fetcher('/stats') retornam Response de fixtures locais.\n  // TODO: modelar loading/error/success, validar status e JSON e ignorar resposta antiga.\n}\n",
    '12.09': "material.md: const callback = () => 3;\nconst nativo = Promise.try(callback);\nconst comFallback = (() => {\n  try { return Promise.resolve(callback()); }\n  catch (erro) { return Promise.reject(erro); }\n})();\n\nCompare quando callback roda e como um throw síncrono vira rejeição. Promise.resolve().then(callback) adia a chamada para uma microtask.",
    '12.10': "material.md: // Troca 1\nRequest: GET /itens\nResponse: 200, Content-Type: application/json, body=[{\"id\":1}]\n\n// Troca 2\nRequest: POST /itens\nResponse: 201, Location: /itens/2, Content-Type: application/json, body={\"id\":2}\n\n// Troca 3\nRequest: GET /ausente\nResponse: 404, Content-Type: text/plain, body=not found\n\n// Troca 4\nResponse: 204 No Content, sem corpo.",
    '12.11': "client.js: export async function carregar(url, fetcher) {\n  const resposta = await fetcher(url);\n  return resposta.json();\n}\n\n// Fixture pública: status 503, Content-Type application/json, corpo {\"erro\":\"indisponível\"}.\n// O cliente também precisa tratar status, cabeçalho, JSON inválido e cancelamento.",
    '12.12': "dates.js: export function parseIsoDate(text) { return Date.parse(text); }\nexport function isFresh(savedMs, nowMs, ttlMs) { return nowMs - savedMs <= ttlMs; }\n\n// BUG: datas inválidas e TTL negativo não são tratados; o limite deveria ser exclusivo.",
    '12.13': "stream.js: async function* valores() {\n  yield 1;\n  await Promise.resolve();\n  yield 2;\n}\n\nasync function comparar() {\n  const vistos = [];\n  for await (const valor of valores()) {\n    vistos.push(valor);\n    console.log('parcial', vistos.join(','));\n  }\n  const completo = typeof Array.fromAsync === 'function'\n    ? await Array.fromAsync(valores())\n    : 'Array.fromAsync indisponível neste runtime';\n  console.log('coleção completa', completo);\n}\n\nreturn comparar();",
    '12.14': "material.md: const erros = [new Error('rede'), new Error('timeout')];\nconst erro = new AggregateError(erros, 'Todas as fontes falharam');\n\n// Inspecione message, errors e a diferença entre este erro agregado e o primeiro erro.",
}
for _card_id, _starter in _LITERAL_STARTERS.items():
    CONTENT[_card_id]["starter"] = _starter

# Promise.try é uma extensão de compatibilidade; o exercício é comparativo e opcional.
CONTENT["12.09"]["kind"] = "COMPARE"
CONTENT["12.09"]["optional"] = True

# 204 não tem corpo; JSON só é aceito com Content-Type application/json.
CONTENT["12.10"]["hidden"] = (
    '204 -> null sem chamar json(); 200/201 com Content-Type ausente ou diferente de '
    'application/json -> TypeError; 404 text/plain -> erro HTTP com status preservado'
)
CONTENT["12.10"]["solution"] = (
    'Verifique status antes do corpo; 204 retorna null sem parse. Para 200/201 exija '
    'Content-Type application/json e então faça parse; em status não-2xx ou tipo ausente/'
    'incompatível, devolva erro contextual que preserva o status.'
)

_OBSERVABLE_FAILURES = {
    '12.01': 'O log coloca timer antes da continuação Promise ou trata atraso zero como execução síncrona.',
    '12.02': 'A operação excede max, espera após a última tentativa ou troca o erro original por erro de retry.',
    '12.03': 'Resultados fora de ordem de conclusão mudam a ordem do array, ou uma rejeição é descrita como cancelamento automático.',
    '12.04': 'Uma microtask enfileirada durante outra fica depois do timer, apesar da fila ainda estar sendo drenada.',
    '12.05': 'A Promise rejeita depois do retorno e escapa do catch local, ou é usada como se fosse o valor resolvido.',
    '12.06': 'Resposta antiga sobrescreve a nova, AbortError aparece como erro ao usuário ou a fixture não recebe sinal.',
    '12.07': 'O combinador não corresponde ao requisito de sucesso/falha parcial, ou timer de timeout permanece ativo.',
    '12.08': 'HTTP 404 é marcado como sucesso, JSON inválido escapa ou resposta antiga altera a tela atual.',
    '12.09': 'O callback roda em microtask no fallback ou seu throw síncrono escapa como throw síncrono.',
    '12.10': '204 tenta ler JSON, status não-2xx vira sucesso ou Content-Type inválido não segue a política publicada.',
    '12.11': 'O mesmo corpo é consumido duas vezes ou a representação lida não corresponde ao Content-Type/status.',
    '12.12': 'Data inválida/limite do TTL é classificado como fresco ou conversão de fuso muda o instante comparado.',
    '12.13': 'Valores são materializados antes do consumo ou erro parcial apaga valores já recebidos sem política.',
    '12.14': 'Promise.any rejeita na primeira entrada recusada em vez de aguardar o resultado agregado.',
}
for _card_id, _failure in _OBSERVABLE_FAILURES.items():
    CONTENT[_card_id]["failure"] = _failure

_OFFICIAL_DOCS = {
    '12.01': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model',
    '12.02': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises',
    '12.03': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all',
    '12.04': 'https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide',
    '12.05': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function',
    '12.06': 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
    '12.07': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any',
    '12.08': 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
    '12.09': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try',
    '12.10': 'https://developer.mozilla.org/en-US/docs/Web/API/Response',
    '12.11': 'https://developer.mozilla.org/en-US/docs/Web/API/Response/json',
    '12.12': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse',
    '12.13': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of',
    '12.14': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/AggregateError',
}
for _card_id, _official_url in _OFFICIAL_DOCS.items():
    CONTENT[_card_id]["docs"] = _official_url

CONTENT["12.08"]["rubric"] = (
    "Entrega 1 — API aceita fetcher injetado para /profile e /stats e valida response.ok, JSON e campos mínimos antes de atualizar a tela.",
    "Entrega 2 — estados loading, error e success são observáveis; erro HTTP/JSON preserva a mensagem e retry inicia uma nova geração.",
    "Entrega 3 — timeout/cancelamento encerra a espera e limpa o indicador; resposta antiga que termina por último não substitui a atual.",
    "Entrega 4 — checklist registra sucesso, 404 cumprido, JSON inválido, retry, timeout e resposta fora de ordem; reflexão anota o comando e confirma que não houve rede real.",
)
