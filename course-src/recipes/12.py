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
    ('Retorne Promise.all([api.produtos(), api.usuarios(), api.precos()]); o array mantém '
     'a ordem declarada mesmo se as promises terminarem em outra ordem.'),
    'Carregar perfil e preferências independentes -> concorrência e ordem estável',
    load={"novelty": 2, "syntax": 3, "composition": 3, "state": 3, "debugging": 2, "files": 2, "reading": 3, "independence": 3, "tools": 2},
        kind='FADED',
    estimated=10,
    runtime='Node.js 24 LTS',
    **_lesson('async.promise_all', ('main.js: export async function carregar(api){ /* produtos, usuários, preços '
     'independentes */ }'), ('Fazer awaits sequenciais para recursos independentes ou pensar que rejeição cancela '
     'requests.'), ('Inicie as três operações antes do primeiro await.',
     'Passe promises em array na ordem do contrato.',
     'Desestruture resultado após Promise.all.'), ('return Promise.all([api.produtos(), api.usuarios(), api.precos()]);'), 'Carregar perfil e preferências independentes -> concorrência e ordem estável', 10, 'Node.js 24 LTS', ('Complete carregar iniciando juntas as requisições independentes e mantendo a ordem '
     'de entrada no array retornado. Explique o limite de rejeição.',
     'Uma tela pode pedir detalhes de conta e preferências ao mesmo tempo; mesmo que preferências '
     'termine primeiro, cada valor mantém a posição da chamada correspondente no array.',
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
     'Carregue seções independentes ao mesmo tempo e associe cada posição do array à chamada '
     'de entrada correspondente, ainda que terminem em ordens diferentes.')),
         ),
"12.04": C(
    'async.microtasks_tasks',
    'logs sync A; Promise.resolve().then P1 (que agenda Promise.then P2); queueMicrotask Q; setTimeout T; log B',
    'P1 agenda P2; ordem dos logs -> A,B,P1,Q,P2,T',
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
    **_lesson('async.microtasks_tasks', 'logs sync A; Promise.resolve().then P1 (que agenda Promise.then P2); queueMicrotask Q; setTimeout T; log B', 'Supor que novas microtasks pulam à frente das que já estavam na fila.', ('Marque execução síncrona primeiro.',
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
    ('Cheque response.ok; parseie o JSON uma vez.',
     'Valide a forma mínima dos dados antes de atualizar a interface.',
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
    content_version=2,
    **_lesson('fetch.dashboard', ('dashboard consulta /profile e /stats por fetcher injetado; fixtures locais fornecem '
     'Response/status/body/atraso determinísticos; UI loading/error/success; retry; '
    'geração por atualização'), 'Assumir que fetch rejeita em status HTTP de erro.', ('Cheque response.ok; leia o JSON uma vez.',
     'Valide a forma mínima dos dados antes de atualizar a interface.',
     'Promise.race encerra a espera; ao terminar, limpe o timer e remova o listener de cancelamento.'), ('Camada api verifica HTTP e body; controlador inicia requisições independentes, '
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

CONTENT["12.15"] = C(
    "tooling.vitest_local",
    "package.json: instale Vitest como dependência de desenvolvimento, rode a suíte e abra watch mode.",
    "npm test -> suíte Vitest aprovada; npm run test:watch -> processo interativo observa mudanças; npm ci reproduz o lockfile",
    "teste quebrado -> comando retorna falha; lockfile ausente -> npm ci não reproduz; watch não deve ser confundido com uma execução única em CI",
    "Achar que os testes executados no site já instalaram ou configuraram Vitest no computador do aluno.",
    ("Crie um projeto npm e mantenha o lockfile junto do package.json.", "Instale Vitest como devDependency e declare scripts test e test:watch.", "Rode uma vez e observe o modo watch; feche-o pelo terminal."),
    "O starter mostra a estrutura e o script de verificação sem instalar pacotes. No projeto exportado, execute npm init -y, npm install -D vitest, configure test e test:watch, rode npm test e observe watch até encerrar com Ctrl+C. A instalação é uma ação explícita do aluno, fora do verificador automático.",
    "função local -> suíte Vitest repetível com execução única e modo watch observado.",
    kind="PROJECT", title="Instale e rode Vitest localmente", runtime="Node.js 24 LTS",
    compatibility="O exemplo requer Node.js 24 LTS e uma versão compatível de Vitest instalada no projeto do aluno; o verificador estrutural não instala dependências.",
    estimated=40,
    first_response="Anote o que o site executou para você e o que ainda falta instalar no seu projeto.", first_response_timing="Antes de alterar package.json.",
    interaction="Projeto exportável com package.json, teste de exemplo e terminal local para instalação, execução e modo watch.",
    transfer_prompt="Configure Vitest numa função própria, rode a suíte e observe watch; explique como o lockfile deixa a instalação reproduzível.",
    explanation={"mental_model": "Vitest é um runner do projeto local: package scripts declaram execução única e watch, enquanto dependência e lockfile registram a instalação.", "worked_example": "Instale Vitest em devDependencies, escreva um teste importando função local, rode a suíte uma vez e observe nova execução depois de editar o teste.", "common_trap": "O executor do curso não instala o pacote no computador do aluno nem cria scripts do projeto.", "why_it_matters": "Reproduzir testes fora da plataforma ajuda a validar alterações no próprio fluxo de desenvolvimento."},
    review={"prompt": "O que muda entre vitest run e vitest?", "choices": ("Um roda uma vez e o outro observa mudanças em desenvolvimento", "Ambos instalam Vitest", "Watch mode substitui package-lock"), "answer": "Um roda uma vez e o outro observa mudanças em desenvolvimento", "feedback_correct": "Scripts separados deixam explícitos execução única e modo interativo.", "feedback_incorrect": "Os comandos executam o runner; instalação e lockfile são etapas distintas."},
    prompt="Configure Vitest no projeto exportado: inicialize npm, instale Vitest como dependência de desenvolvimento, rode a suíte com npm test e depois observe o watch mode até pará-lo no terminal.",
    resources=("Vitest Getting Started: https://vitest.dev/guide/", "Vitest CLI e watch mode: https://vitest.dev/guide/cli"),
    rubric=("package.json declara Vitest em devDependencies, scripts de teste e type module coerente.", "npm test executa a suíte e a saída observada é registrada.", "Watch mode reage a uma mudança e é encerrado pelo terminal.", "A evidência de execução local é identificada como declarada pelo aluno."),
)

CONTENT["12.16"] = C(
    "devtools.network_panel",
    "src/server.mjs e src/app.js: abra a página local, gere respostas 200/404 e compare status, timing e CORS na aba Network.",
    "GET /api/items -> 200 JSON; GET /api/missing -> 404; requisição cross-origin sem permissão -> bloqueio CORS visível no Console/Network",
    "404 -> status não informa duração; falha CORS -> política do navegador, não prova que o servidor esteve indisponível; timing inclui etapas distintas",
    "Concluir que toda resposta 404 ou falha CORS é defeito de conexão, sem separar status, política e tempo.",
    ("Inicie o servidor e registre a URL de origem.", "Na aba Network, habilite Preserve log e compare status e duração.", "Use a requisição CORS preparada e separe console, resposta do servidor e política do navegador."),
    "O projeto local expõe fixture determinística sem rede externa. Execute npm test para validar respostas e cabeçalhos; depois abra a página servida e investigue cada solicitação na aba Network. O verificador não automatiza DevTools: a captura e a explicação são evidência declarada.",
    "tela lenta -> hipótese separada por Network status, timing e política de origem.",
    kind="PROJECT", title="Investigue requisições na aba Network", runtime="browser",
    compatibility="A fixture usa HTTP local e APIs de fetch disponíveis em navegadores evergreen; CORS é observado no navegador e não é simulado pelo teste Node.",
    estimated=35,
    first_response="Registre uma hipótese: a demora vem de rede, status ou execução no cliente?", first_response_timing="Antes de abrir Network.",
    interaction="Página local com botões nomeados para gerar requests 200, 404 e CORS; resultado textual acessível e captura manual em DevTools.",
    transfer_prompt="Investigue uma API diferente usando status, timing e cabeçalhos; registre origem, hipótese e limites da observação.",
    explanation={"mental_model": "Network separa requests, status, cabeçalhos e etapas de tempo; CORS é uma decisão do navegador baseada na política de origem.", "worked_example": "Compare uma resposta 200 JSON com um 404 e uma chamada de outra origem; olhe status, timing e mensagem CORS em lugares diferentes.", "common_trap": "A aba não converte status HTTP em latência e CORS não demonstra que o servidor caiu.", "why_it_matters": "Investigar a camada certa reduz mudanças aleatórias em clientes, servidores e configurações de origem."},
    review={"prompt": "O que uma mensagem CORS permite concluir?", "choices": ("O navegador bloqueou acesso por política de origem", "O servidor necessariamente está offline", "A resposta demorou demais"), "answer": "O navegador bloqueou acesso por política de origem", "feedback_correct": "CORS descreve a política de acesso entre origens observada pelo navegador.", "feedback_incorrect": "CORS não prova indisponibilidade nem mede latência."},
    prompt="Inicie o servidor local, abra a aba Network e registre status, duração e cabeçalhos das respostas 200 e 404. Acione a fixture cross-origin e explique o erro CORS como política do navegador, com evidência observada.",
    resources=("Chrome DevTools, Network panel: https://developer.chrome.com/docs/devtools/network/", "MDN, CORS: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS"),
    rubric=("Registra status e duração como observações diferentes para as requisições de fixture.", "Explica quais etapas de timing foram observadas sem inferir causalidade de uma medida isolada.", "Distingue resposta HTTP de bloqueio CORS e identifica a origem de cada mensagem.", "Captura e conclusões são rotuladas como evidência declarada do navegador local."),
)


_LITERAL_STARTERS = {
    '12.01': "main.js: console.log('A');\nsetTimeout(() => console.log('T'), 0);\nPromise.resolve().then(() => console.log('P'));\nconsole.log('B');",
    '12.02': "material.md: Bloco A: let tentativa = 0;\nBloco B: while (tentativa < max) {\nBloco C: try { return await operacao(); }\nBloco D: catch (erro) {\nBloco E: if (tentativa === max - 1) throw erro;\nBloco F: await esperar(atraso);\nBloco G: tentativa += 1;\nBloco H: }\n\nContexto: async function tentar(operacao, max, esperar, atraso) { /* ordenar blocos */ } Atraso só ocorre antes de uma nova tentativa.",
    '12.03': "main.js: export async function carregar(api) {\n  // api.produtos(), api.usuarios() e api.precos() são independentes.\n  // TODO: iniciar as três operações em paralelo e devolver os resultados na ordem acima.\n}\n",
    '12.04': "main.js: console.log('A');\nPromise.resolve().then(() => {\n  console.log('P1');\n  Promise.resolve().then(() => console.log('P2'));\n});\nqueueMicrotask(() => console.log('Q'));\nsetTimeout(() => console.log('T'), 0);\nconsole.log('B');",
    '12.05': "profile.js: export async function carregar(fetchProfile) {\n  try {\n    return fetchProfile();\n  } catch (erro) {\n    return { nome: 'offline' };\n  }\n}\n\n// fetchProfile() devolve uma Promise que pode rejeitar depois da chamada.\n// O fallback deveria ser usado quando essa rejeição ocorre.",
    '12.06': "search.js: export function criarBusca(fetcher) {\n  let controllerAtual;\n  let sequencia = 0;\n  return async function buscar(query) {\n    // TODO: cancelar a busca anterior, iniciar a nova e ignorar resposta obsoleta.\n    // fetcher(query, { signal }) usa fixtures locais e pode resolver/rejeitar com atraso.\n  };\n}\n",
    '12.07': "material.md: // São seis requisitos possíveis: esperar todas; conservar sucessos parciais; primeiro a terminar; primeiro sucesso; corrida com timeout; consultar réplicas.\n// Para cada requisito, escolha all, allSettled, race ou any e registre efeitos de cancelamento/limpeza.",
    '12.08': "dashboard.js: export async function criarDashboard(fetcher, options = {}) {\n  // options: {onState, timeoutMs, signal}; a chamada com apenas fetcher continua válida.\n  // fetcher(path, {signal}) usa fixtures locais para /profile e /stats.\n  // TODO: emitir loading e resultado final, validar HTTP/JSON e encerrar timeout/cancelamento.\n  // Resultado: success com profile/stats, error com error.status/name ou stale sem notificação.\n}\n",
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
CONTENT["12.08"]["content_version"] = 3
CONTENT["12.08"]["prompt"] += (
    "\n\nContrato: `criarDashboard(fetcher, {onState, timeoutMs, signal} = {})`; a chamada antiga "
    "`criarDashboard(fetcher)` continua válida. O fetcher recebe `(path, {signal})` e usa somente "
    "fixtures. `onState` recebe `{status:'loading'}` e, ao final da geração atual, `{status:'success', "
    "profile, stats}` ou `{status:'error', error}`. Erro HTTP expõe `error.status`; timeout e cancelamento "
    "retornam `status:'error'` com `error.name` igual a `TimeoutError` ou `AbortError`. O mesmo objeto "
    "fetcher identifica as gerações do dashboard: somente a chamada mais recente notifica; uma anterior "
    "que termine depois retorna `{status:'stale'}` sem chamar `onState`. Timeout e sinal externo encerram "
    "a espera mesmo se a fixture não respeitar o AbortSignal."
)


# Fase 4 (análise curricular, itens 4.4, 4.5, 4.7 e 4.8): Promises a partir de callbacks, retry com backoff e pool,
# URL e URLSearchParams, PluralRules e RelativeTimeFormat.
from recipe_api import E

CONTENT["12.17"] = E(
    "async.promise_from_callbacks",
    "main.js: export function esperar(ms, valor) { /* devolva Promise que resolve após ms */ return undefined; } export function promisify(fn) { /* converta callback error-first em Promise */ return undefined; }",
    'await esperar(1, "ok") -> "ok"; promisify((x, cb) => cb(null, x * 2))(3) -> 6',
    'promisify((x, cb) => cb(new RangeError("negativo")))(-1) -> rejeita com RangeError',
    "Criar uma Promise que nunca rejeita e engole o erro do callback, ou chamar resolve e reject juntos.",
    "Com o erro do callback engolido, a Promise resolve com undefined e o aluno não vê a falha.",
    "Quando o callback recebe um erro, qual função da Promise deve ser chamada?",
    ("new Promise recebe um executor com resolve e reject; a Promise muda de estado uma única vez.", "Dentro do callback do fn, se erro existir chame reject(erro); senão chame resolve(resultado). Use rest para repassar os argumentos.", "Exemplo parecido: new Promise(r => setTimeout(r, 0)) resolve depois de um tempo, sem callback de erro."),
    "export function esperar(ms, valor) { return new Promise(resolve => setTimeout(() => resolve(valor), ms)); } export function promisify(fn) { return (...args) => new Promise((resolve, reject) => { fn(...args, (erro, resultado) => (erro ? reject(erro) : resolve(resultado))); }); }",
    "Leitor com callback error-first -> Promise; erro do callback -> rejeição que o await recebe",
    kind="MAKE", estimated=22, load={"novelty": 4, "syntax": 3, "composition": 3, "state": 3, "debugging": 3, "files": 1, "reading": 3, "independence": 3, "tools": 2},
    runtime="Node.js 24.x, módulos ES, sem DOM.",
    compatibility="Promise, setTimeout e funções de rest estão no baseline. A atividade não depende de Promise.withResolvers.",
    explanation={
        "mental_model": "Uma Promise tem um estado pendente que se resolve ou rejeita uma única vez. promisify só traduz a convenção de callback (erro primeiro) para esse estado.",
        "worked_example": "promisify(fn)(3) passa 3 e um callback ao fn. Se o callback recebe (null, 6), a Promise resolve com 6; se recebe (RangeError), rejeita com o mesmo erro.",
        "common_trap": "Ignorar o primeiro argumento do callback, ou resolver mesmo com erro. Rejeição sem tratamento vira unhandledrejection, que em Node encerra o processo por padrão.",
        "why_it_matters": "Muitas APIs ainda usam callbacks. A Promise dá um único caminho de erro para await e catch.",
    },
    first_response="Escreva qual caminho (erro ou resultado) cada chamada do callback percorre.",
    first_response_timing="Antes de executar o starter.",
    interaction="Linha do tempo textual de resolve e reject, com anúncio do estado; editor de código acessível por teclado.",
    resources=("MDN: construtor Promise — https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise", "Node.js: evento unhandledRejection — https://nodejs.org/api/process.html#event-unhandledrejection"),
    review={
        "prompt": "Um callback error-first recebe (erro, resultado). O que deve ser chamado quando erro existe?",
        "choices": ["reject(erro)", "resolve(undefined)", "resolve(erro)"],
        "answer": "reject(erro)",
        "feedback_correct": "A rejeição é o caminho do erro; await e catch recebem o mesmo objeto.",
        "feedback_incorrect": "resolve(erro) entrega o erro como sucesso, e o chamador não o trata como falha.",
    },
    transfer_prompt="Promisifique um leitor com callback error-first. Garanta que o erro chega ao await do chamador e explique o que acontece se nenhum await ou catch tratar a rejeição.",
    prompt="Implemente esperar e promisify. Antes de executar, preveja o que o chamador recebe quando o callback chama cb(new RangeError(...)).",
)

CONTENT["12.18"] = E(
    "async.retry_backoff_pool",
    "main.js: export function atrasoExponencial(tentativa, base, teto, aleatorio) { return 0; } export async function limitarConcorrencia(tarefas, limite) { return []; } export async function comRetry(operacao, { tentativas, base, teto, aleatorio, espera }) { return undefined; }",
    "atrasoExponencial(3, 100, 1000, () => 1) -> 800; atrasoExponencial(9, 100, 1000, () => 1) -> 1000",
    "limitarConcorrencia(tarefas de 5 itens, 2) -> resultados na ordem original com no máximo 2 em voo; comRetry com tentativas 0 -> lança RangeError",
    "Aplicar o teto depois de multiplicar pelo jitter, disparar todas as tarefas de uma vez no pool, ou contar esperas em vez de tentativas.",
    "Com aleatorio fixo em 1 e tentativa 9, a versão sem teto devolve 51200 em vez de 1000.",
    "Em que ordem o teto e o fator de jitter entram no cálculo, e quantas Promises podem estar em voo ao mesmo tempo?",
    ("O atraso cresce com a tentativa, mas nunca passa do teto; o jitter escala o valor final entre 0 e 1.", "Use Math.min(teto, base * 2 ** tentativa) multiplicado pelo aleatório. No pool, crie 'limite' trabalhadores que puxam a próxima tarefa de um índice compartilhado.", "Exemplo parecido: com teto 4 e base 1, as esperas de três tentativas, sem jitter, são 1, 2 e 4."),
    "export function atrasoExponencial(tentativa, base, teto, aleatorio) { return aleatorio() * Math.min(teto, base * 2 ** tentativa); } export async function limitarConcorrencia(tarefas, limite) { const resultados = new Array(tarefas.length); let proxima = 0; async function trabalhador() { while (proxima < tarefas.length) { const indice = proxima; proxima += 1; resultados[indice] = await tarefas[indice](); } } await Promise.all(Array.from({ length: Math.min(limite, tarefas.length) }, trabalhador)); return resultados; } export async function comRetry(operacao, { tentativas, base, teto, aleatorio, espera }) { if (!(tentativas >= 1)) throw new RangeError('tentativas deve ser pelo menos 1'); let ultimoErro; for (let tentativa = 0; tentativa < tentativas; tentativa += 1) { try { return await operacao(tentativa); } catch (erro) { ultimoErro = erro; if (tentativa < tentativas - 1) await espera(atrasoExponencial(tentativa, base, teto, aleatorio)); } } throw ultimoErro; }",
    "Leitura de API com retry e três requisições simultâneas -> esperas com teto e pool limitado",
    kind="MAKE", estimated=30, load={"novelty": 4, "syntax": 4, "composition": 4, "state": 4, "debugging": 3, "files": 1, "reading": 3, "independence": 4, "tools": 2},
    runtime="Node.js 24.x, módulos ES, sem DOM.",
    compatibility="Promise, async/await e Math estão no baseline. A espera é injetada, para que os testes não dependam de tempo real.",
    explanation={
        "mental_model": "Retry sem espera transforma uma falha passageira em carga extra. Backoff espaça as tentativas, o teto limita a espera e o jitter impede que clientes sincronizados tentem juntos. Um pool limita quantas operações ficam em voo.",
        "worked_example": "Com base 100 e teto 1000, as esperas máximas são 100, 200, 400, 800 e depois 1000. Com aleatorio = 0.5, a tentativa 3 espera 400. Com cinco tarefas e limite 2, duas começam; cada nova começa quando uma termina.",
        "common_trap": "Disparar todas com Promise.all ignora o limite. Esperar sem teto aumenta a espera de forma exponencial sem limite.",
        "why_it_matters": "Repetição sem controle é uma causa comum de sobrecarga em serviços. Esses dois controles são padrão em clientes de rede.",
    },
    first_response="Escreva a sequência de esperas para as tentativas 0 a 4, com base 100 e teto 1000, antes de codificar.",
    first_response_timing="Antes do primeiro Run.",
    interaction="Tabela de tentativas e esperas simuladas com aleatório fixo; painel de tarefas em voo anunciado em texto.",
    resources=("MDN: Math.min — https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Math/min", "AWS Architecture Blog: Exponential Backoff And Jitter — https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/"),
    review={
        "prompt": "Com base 100, teto 1000 e jitter igual a 1, qual é a espera da tentativa 9?",
        "choices": ["1000", "51200", "100"],
        "answer": "1000",
        "feedback_correct": "O teto corta o crescimento exponencial antes da multiplicação pelo jitter.",
        "feedback_incorrect": "2 elevado a 9 vezes a base ultrapassa o teto; o valor final fica limitado a 1000.",
    },
    transfer_prompt="Implemente retry de leitura de API com backoff, teto de atraso e limite de três requisições simultâneas. Teste com espera injetada, sem timers reais, e registre a ordem das tentativas.",
    prompt="Implemente atrasoExponencial, limitarConcorrencia e comRetry. Antes de executar, calcule a espera da tentativa 9 e diga quantas tarefas podem estar em voo com limite 2.",
)

CONTENT["12.19"] = E(
    "web.url_search_params",
    "main.js: export function montarUrl(base, caminho, parametros) { /* use URL e URLSearchParams */ return ''; } export function lerPagina(textoUrl) { return 0; }",
    'montarUrl("https://api.exemplo.test/v1/", "busca", {q: "café", page: 2}) -> "https://api.exemplo.test/v1/busca?q=caf%C3%A9&page=2"',
    'lerPagina("https://x.test/busca?page=3") -> 3; lerPagina("https://x.test/busca?page=abc") -> 1',
    "Concatenar query string à mão, ou começar o caminho com barra, o que descarta o prefixo /v1 da base.",
    "Com caminho '/busca', a URL vira https://api.exemplo.test/busca e perde /v1; a concatenação manual deixa 'café' sem codificação.",
    "Qual forma de caminho preserva o prefixo /v1 da base, e quem codifica os caracteres dos parâmetros?",
    ("new URL(caminho, base) resolve caminhos relativos a partir da base; uma barra inicial reinicia o caminho.", "Crie URL com base e caminho sem barra inicial e preencha url.search com new URLSearchParams(parametros).toString().", "Exemplo parecido: new URL('x', 'https://a.test/b/') devolve https://a.test/b/x, porque a base termina com barra."),
    "export function montarUrl(base, caminho, parametros) { const url = new URL(caminho, base); url.search = new URLSearchParams(parametros).toString(); return url.href; } export function lerPagina(textoUrl) { const url = new URL(textoUrl); const bruto = url.searchParams.get('page'); const numero = Number(bruto); return bruto !== null && Number.isInteger(numero) && numero > 0 ? numero : 1; }",
    "Listagem de pedidos com filtros -> URL com o prefixo /v1 preservado e query codificada",
    kind="MAKE", estimated=22, load={"novelty": 3, "syntax": 3, "composition": 3, "state": 1, "debugging": 2, "files": 1, "reading": 2, "independence": 3, "tools": 2},
    runtime="Node.js + browser",
    compatibility="URL e URLSearchParams estão nos navegadores e no Node.js 24. A atividade roda nos dois ambientes sem dependência externa.",
    explanation={
        "mental_model": "Uma URL tem partes separadas: origem, caminho e busca. URL e URLSearchParams constroem e leem cada parte; eles codificam caracteres, então a concatenação manual não precisa acertar a sintaxe.",
        "worked_example": "Em montarUrl('https://api.exemplo.test/v1/', 'busca', {q: 'café', page: 2}), o caminho 'busca' é relativo à base e vira /v1/busca; 'café' vira caf%C3%A9.",
        "common_trap": "Começar o caminho com barra e perder o prefixo da API. Em query string, + e % precisam de codificação: concatenar à mão deixa isso para depois.",
        "why_it_matters": "Quase toda integração com API monta URLs com parâmetros de usuário. Codificação errada quebra buscas com acento ou espaço em silêncio.",
    },
    first_response="Escreva a URL final esperada com caminho sem barra inicial e com barra inicial, antes de implementar.",
    first_response_timing="Antes do primeiro Run.",
    interaction="Painel com as partes da URL (origem, caminho, busca) separadas e anunciadas; campo com o valor codificado exibido.",
    resources=("MDN: URL — https://developer.mozilla.org/docs/Web/API/URL", "MDN: URLSearchParams — https://developer.mozilla.org/docs/Web/API/URLSearchParams"),
    review={
        "prompt": "Qual forma une base e caminho sem perder o prefixo /v1 de https://api.exemplo.test/v1/?",
        "choices": ["new URL('busca', base), com a base terminando em barra", "new URL('/busca', base)", "base + '/' + '/busca'"],
        "answer": "new URL('busca', base), com a base terminando em barra",
        "feedback_correct": "Caminho relativo sem barra inicial é resolvido sob a base.",
        "feedback_incorrect": "Barra inicial reinicia o caminho a partir da origem; a concatenação dupla cria um caminho inválido.",
    },
    transfer_prompt="Monte uma URL de listagem de pedidos com filtros de data e status, usando base com barra final. Depois leia a página de uma URL recebida e explique o que acontece com uma URL inválida.",
    prompt="Implemente montarUrl e lerPagina. Antes de executar, escreva a URL final com caminho 'busca' e com '/busca' e explique a diferença.",
)

CONTENT["12.20"] = E(
    "intl.plural_relative",
    "main.js: export function rotuloItens(n) { /* PluralRules pt-BR: 'item' para a categoria one, 'itens' para as demais */ return ''; } export function tempoRelativo(dias) { /* RelativeTimeFormat pt-BR com numeric auto */ return ''; }",
    'rotuloItens(1) -> "1 item"; rotuloItens(5) -> "5 itens"; tempoRelativo(-1) -> "ontem"',
    'tempoRelativo(0) -> "hoje"; tempoRelativo(-3) -> "há 3 dias"',
    "Escolher o plural com n === 1 em vez de consultar a categoria do idioma; esperar que numeric auto sempre devolva a forma numérica.",
    "O código passa em 1 e 5, mas ignora a categoria do idioma; o contrato exige que a escolha venha de PluralRules.",
    "Qual API informa se um número pede a forma singular ou plural no idioma, e qual formata 'ontem' e 'hoje'?",
    ("PluralRules devolve uma categoria ('one', 'other'), não um texto; RelativeTimeFormat formata a partir de um valor e de uma unidade.", "Use new Intl.PluralRules('pt-BR').select(n) para escolher o rótulo. Para o tempo, use new Intl.RelativeTimeFormat('pt-BR', {numeric: 'auto'}).format(dias, 'day').", "Exemplo parecido: new Intl.RelativeTimeFormat('en', {numeric: 'auto'}).format(-1, 'day') devolve 'yesterday'."),
    "export function rotuloItens(n) { const categoria = new Intl.PluralRules('pt-BR').select(n); return `${n} ${categoria === 'one' ? 'item' : 'itens'}`; } export function tempoRelativo(dias) { return new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' }).format(dias, 'day'); }",
    "Mensagens não lidas -> rótulo pelo plural do idioma; idade em horas -> frase relativa",
    kind="MAKE", estimated=20, load={"novelty": 4, "syntax": 2, "composition": 2, "state": 1, "debugging": 2, "files": 1, "reading": 3, "independence": 3, "tools": 2},
    runtime="Node.js + browser",
    compatibility="Intl.PluralRules e Intl.RelativeTimeFormat estão no Node.js 24 com ICU completo e nos navegadores atuais. A saída depende dos dados de idioma do runtime, por isso o contrato evita casos sensíveis como 0 em rótulos de plural.",
    explanation={
        "mental_model": "Plural e data relativa são regras do idioma. PluralRules devolve a categoria que a regra escolhe; RelativeTimeFormat monta a frase com a regra de cada idioma. Nenhum dos dois deve virar uma lista de ifs por língua.",
        "worked_example": "Em pt-BR, select(1) devolve 'one' e select(5) devolve 'other'. format(-1, 'day') com numeric auto devolve 'ontem', mas format(-3, 'day') devolve 'há 3 dias'.",
        "common_trap": "Tratar n === 1 como regra universal. Em pt-BR, o CLDR coloca 0 na categoria 'one'; se o produto exige '0 itens', trate zero antes da regra. Outros idiomas têm mais categorias.",
        "why_it_matters": "Mensagens com 'um item' e 'dois itens' aparecem em qualquer produto, e uma regra própria quebra em outros idiomas.",
    },
    first_response="Liste, para pt-BR, quais valores de n você espera no singular e no plural antes de escrever a regra.",
    first_response_timing="Antes do primeiro Run.",
    interaction="Tabela de categorias de plural e frases geradas, com anúncio textual; seletor de idioma acessível por teclado.",
    resources=("MDN: Intl.PluralRules — https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules", "MDN: Intl.RelativeTimeFormat — https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat"),
    review={
        "prompt": "Qual categoria new Intl.PluralRules('pt-BR').select(1) devolve?",
        "choices": ["one", "other", "1"],
        "answer": "one",
        "feedback_correct": "A categoria é um rótulo da regra do idioma, não o número formatado.",
        "feedback_incorrect": "select devolve uma categoria como 'one' ou 'other'; ele não formata o número.",
    },
    transfer_prompt="Escreva o rótulo de mensagens não lidas com plural pelo idioma e a idade de uma mensagem em horas com RelativeTimeFormat. Explique qual caso depende da regra do idioma e qual depende de numeric auto.",
    prompt="Implemente rotuloItens e tempoRelativo com Intl. Antes de executar, diga qual categoria pt-BR devolve para 1 e para 5, e o que numeric auto muda em -1 dia.",
)


# Fase 5 (análise curricular, item 5.6): extensão opcional de cancelamento e timeout com APIs atuais, depois de 12.06.
CONTENT["12.21"] = E(
    "async.cancel_timeout_stale",
    "main.js: export function buscarComLimite(fetchFn, url, limiteMs, sinalExterno) { /* cancele antes do envio; combine sinais com AbortSignal.any e AbortSignal.timeout */ return fetchFn(url).then(r => r.text()); } export function criarBuscaAtual(fetchFn) { /* aborte a anterior e descarte resposta obsoleta */ return url => fetchFn(url).then(r => r.text()); } export function adiarResposta() { /* Promise.withResolvers() */ return {}; }",
    'buscarComLimite com resposta a tempo -> texto; buscarComLimite com sinal já abortado -> AbortError sem chamar fetch',
    'timeout sem resposta -> TimeoutError; cancelamento durante a espera -> AbortError; só a busca mais recente entrega texto, a obsoleta devolve undefined',
    "Tratar timeout e cancelamento como o mesmo erro genérico, ou deixar uma resposta antiga sobrescrever a mais recente.",
    "Uma busca antiga que termina depois de outra sobrescreve a lista na tela e mostra dados que o usuário já substituiu.",
    "Como você distingue cancelamento pelo usuário, timeout e uma resposta que chegou tarde demais?",
    ("Cada um tem um sinal próprio: AbortSignal.timeout cria o limite e sinalExterno representa o usuário. Combine os dois com AbortSignal.any.", "Antes de chamar fetch, verifique sinalExterno.aborted. Para respostas obsoletas, guarde um AbortController atual e compare com ele ao receber o texto.", "Exemplo parecido: um campo de busca que cancela a requisição anterior a cada tecla e só mostra o último resultado."),
    "buscarComLimite rejeita sem chamar fetch quando o sinal externo já está abortado e combina sinalExterno com AbortSignal.timeout; criarBuscaAtual aborta o controle anterior e devolve undefined quando a resposta não é mais a atual.",
    "Campo de autocompletar com três buscas -> só o resultado da última é mostrado; as anteriores devolvem undefined",
    kind="MAKE", estimated=22, load={"novelty": 3, "syntax": 3, "composition": 3, "state": 3, "debugging": 3, "files": 1, "reading": 3, "independence": 3, "tools": 2},
    runtime="Node.js 24 LTS + navegador moderno",
    compatibility="Promise.withResolvers (Node.js 22), AbortSignal.timeout (Node.js 17.3) e AbortSignal.any (Node.js 20.3) estão no baseline 24 e nos navegadores atuais. Em runtime sem alguma dessas APIs, use feature detection antes de chamar.",
    optional=True,
    explanation={
        "mental_model": "Um AbortSignal é um aviso de que o trabalho deve parar. AbortSignal.timeout é um aviso que chega sozinho após um tempo; AbortSignal.any dispara quando qualquer dos sinais dispara. Respostas obsoletas são descartadas pela comparação com o controle atual.",
        "worked_example": "Com limite de 10 ms e servidor silencioso, o sinal combinado é abortado pelo timeout e a promise rejeita com TimeoutError; se o usuário cancelar antes, a rejeição é AbortError.",
        "common_trap": "Verificar o sinal só depois do fetch: o pedido já saiu. Verifique antes de chamar e combine os sinais antes do envio.",
        "why_it_matters": "Telas que buscam dados mudam de estado o tempo todo. Sem cancelamento e descarte, a tela mostra o resultado da última chamada que terminou, e não da última que o usuário pediu.",
    },
    first_response="Antes de editar, diga qual erro você espera quando o usuário cancela e quando o servidor demora, e por que são diferentes.",
    first_response_timing="Antes do primeiro Run.",
    interaction="Linha do tempo com o disparo do timeout, o cancelamento e a chegada de cada resposta, anunciada em texto.",
    resources=("MDN: Promise.withResolvers — https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers", "MDN: AbortSignal.timeout — https://developer.mozilla.org/docs/Web/API/AbortSignal/timeout_static", "MDN: AbortSignal.any — https://developer.mozilla.org/docs/Web/API/AbortSignal/any_static"),
    review={
        "prompt": "Qual API combina vários sinais de cancelamento em um só?",
        "choices": ["AbortSignal.any", "AbortSignal.timeout", "Promise.withResolvers"],
        "answer": "AbortSignal.any",
        "feedback_correct": "AbortSignal.any dispara quando qualquer um dos sinais recebidos é abortado.",
        "feedback_incorrect": "timeout cria um sinal com prazo; withResolvers cria uma promise controlável. Só any combina sinais.",
    },
    transfer_prompt="Aplique cancelamento e descarte de resposta obsoleta a um campo de autocompletar. Explique qual condição decide se a resposta é mostrada.",
    prompt="Implemente buscarComLimite, criarBuscaAtual e adiarResposta. Antes de executar, diga qual erro é lançado quando o sinal externo já está abortado e por que a resposta antiga não pode sobrescrever a nova.",
)
