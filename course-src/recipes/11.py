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
        "compatibility": "Browser evergreen; o comportamento de cada API está delimitado pelo contrato desta atividade.",
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
"11.14": C(
    'dom.listener_options',
    ('botão com listener {once:true}; wheel listener {passive:true}; listener de painel '
     'com {signal:controller.signal}'),
    ('dois cliques em once -> callback uma vez; controller.abort() -> listener do painel '
     'não executa mais'),
    ('passive listener chama preventDefault -> ação não é cancelada e aviso no console; '
     'signal já abortado -> listener não é instalado'),
    'Confundir once com cleanup geral ou usar preventDefault em listener passive.',
    ('once remove após primeira invocação.',
     'passive promete que não cancelará a ação padrão.',
     'signal liga listener ao ciclo do AbortController.'),
    ('Monte três casos independentes e demonstre cleanup por abort; declare que opção '
     'signal não cancela ação padrão por si.'),
    'Dialog aberto/fechado várias vezes -> listeners removidos sem duplicação',
    load={"novelty": 2, "syntax": 2, "composition": 2, "state": 2, "debugging": 1, "files": 1, "reading": 3, "independence": 2, "tools": 2},
        kind='MODIFY',
    runtime='browser',
    estimated=6,
    **_lesson('dom.listener_options', ('botão com listener {once:true}; wheel listener {passive:true}; listener de painel '
     'com {signal:controller.signal}'), 'Confundir once com cleanup geral ou usar preventDefault em listener passive.', ('once remove após primeira invocação.',
     'passive promete que não cancelará a ação padrão.',
     'signal liga listener ao ciclo do AbortController.'), ('Monte três casos independentes e demonstre cleanup por abort; declare que opção '
     'signal não cancela ação padrão por si.'), 'Dialog aberto/fechado várias vezes -> listeners removidos sem duplicação', 6, 'browser', ('Em cada situação, decida como termina o ciclo de vida do listener e se ele pode '
     'cancelar a ação padrão. Justifique as três opções separadamente.',
     'Um botão “Copiar” pode responder uma vez; um listener de rolagem que não cancela a '
     'ação padrão pode ser passivo; fechar um painel pode abortar os listeners ligados ao '
     'controller dele.',
     'Antes de selecionar, anote para cada listener o que encerra seu ciclo e se ele pode '
     'cancelar a ação padrão.',
     'Três linhas editáveis, uma por opção, com escolha por teclado, justificativa curta e '
     'retorno textual por cenário.',
     'Snippet com três listeners, console do navegador e controles locais de '
     'click/scroll/abort; nenhuma chamada de rede.',
     'O que passive: true promete?',
     'Que o listener não chamará preventDefault para cancelar a ação padrão.',
     'Que o navegador removerá o listener depois da primeira execução.',
     'Que AbortController cancelará a ação padrão do evento.',
     'Projete instalação e limpeza de listeners para um painel de filtros que abre e fecha '
     'repetidamente, sem acumular callbacks.')),
         ),
"11.01": C(
    'dom.event_bubbling',
    'DOM pai>filho>botão; listeners bubble em cada nó; clique botão',
    'clique botão -> logs botão,filho,pai',
    ('stopPropagation em filho -> botão,filho; stopImmediatePropagation em primeiro '
     'listener do filho -> segundo listener do filho não roda'),
    'Supor que eventos sempre começam no elemento mais externo.',
    ('Identifique target e ancestralidade.',
     'Na fase bubble, suba um ancestral por vez.',
     'Distinga impedir próxima fase de impedir listener irmão.'),
    ('Trace target e caminho de propagação; exclua listeners após parada conforme método '
     'usado.'),
    'Clique em item de menu aninhado -> ordem e parada corretas',
    load={"novelty": 2, "syntax": 2, "composition": 2, "state": 2, "debugging": 1, "files": 1, "reading": 3, "independence": 2, "tools": 1},
        kind='TRACE',
    runtime='browser',
    estimated=9,
    **_lesson('dom.event_bubbling', 'DOM pai>filho>botão; listeners bubble em cada nó; clique botão', 'Supor que eventos sempre começam no elemento mais externo.', ('Identifique target e ancestralidade.',
     'Na fase bubble, suba um ancestral por vez.',
     'Distinga impedir próxima fase de impedir listener irmão.'), ('Trace target e caminho de propagação; exclua listeners após parada conforme método '
     'usado.'), 'Clique em item de menu aninhado -> ordem e parada corretas', 9, 'browser', ('Trace um clique do alvo até os ancestrais na fase bubble. Compare então '
     'stopPropagation e stopImmediatePropagation pelo efeito em listeners do mesmo nó.',
     'Em article > a > span, clicar em span começa nele; o listener bubble de a roda antes '
     'do listener de article porque o caminho sobe a partir do alvo.',
     'Antes de executar, escreva o alvo e a cadeia de ancestrais na ordem visitada pelo '
     'evento.',
     'Tabela de rastreamento com célula por nó/fase, campos de previsão e justificativa; '
     'sem exigir mouse.',
     'DOM inicial com três elementos aninhados, listeners listados por nó e log textual da '
     'ordem; DevTools é opcional.',
     'Qual diferença prática existe entre parar a propagação e pará-la imediatamente?',
     'A primeira interrompe o caminho para outros nós; a segunda também bloqueia listeners '
     'seguintes no nó atual.',
     'Ambas sempre impedem a ação padrão do link.',
     'Parar a propagação remove permanentemente todos os listeners ancestrais.',
     'Analise um menu aninhado com ação no item e no contêiner; escolha onde interromper a '
     'propagação sem bloquear controles irmãos.')),
         ),
"11.02": C(
    'dom.safe_creation',
    ("blocos: createElement('li'), createTextNode(texto), createElement('button'), append, "
     'addEventListener(remove), append no ul'),
    "texto '<b>x</b>' -> aparece literalmente; clicar Remover -> só li alvo sai",
    ("texto '<img src=x onerror=alert(1)>' -> nenhuma execução; dois itens iguais -> "
     'remover um'),
    'Usar innerHTML com dado não confiável ou remover a lista inteira.',
    ('Crie nós explícitos.',
     'textContent/createTextNode interpreta conteúdo como texto.',
     'Listener fecha sobre o li criado.'),
    ('Monte li com texto e botão, anexe listener ao botão e depois li à lista; conteúdo de '
     'usuário nunca entra em innerHTML.'),
    'Renderizar mensagens de chat como texto literal -> sem elemento injetado',
    load={"novelty": 2, "syntax": 3, "composition": 3, "state": 2, "debugging": 1, "files": 2, "reading": 3, "independence": 3, "tools": 2},
        kind='PARSONS',
    runtime='browser',
    estimated=10,
    **_lesson('dom.safe_creation', ("blocos: createElement('li'), createTextNode(texto), createElement('button'), append, "
     'addEventListener(remove), append no ul'), 'Usar innerHTML com dado não confiável ou remover a lista inteira.', ('Crie nós explícitos.',
     'textContent/createTextNode interpreta conteúdo como texto.',
     'Listener fecha sobre o li criado.'), ('Monte li com texto e botão, anexe listener ao botão e depois li à lista; conteúdo de '
     'usuário nunca entra em innerHTML.'), 'Renderizar mensagens de chat como texto literal -> sem elemento injetado', 10, 'browser', ('Ordene os blocos para criar um item de lista seguro e removível. Explique por que o '
     'texto é texto e como o botão encontra apenas seu item.',
     'Para exibir “Novo <em>rascunho</em>”, um nó de texto mantém as marcas literalmente; '
     'o navegador não cria um elemento <em> a partir delas.',
     'Desenhe primeiro a árvore final com um li, seu texto e um botão; anote qual nó cada '
     'append recebe.',
     'Blocos reordenáveis por botões Mover para cima/baixo, posição acessível pelo teclado '
     'e anúncio textual da posição; sem arrastar.',
     'Editor com os seis blocos DOM do enunciado, lista de saída e botão remover; console '
     'local, sem conteúdo remoto.',
     'Como inserir uma string de usuário para que <em> apareça literalmente?',
     'Criá-la como nó de texto e anexá-la ao elemento apropriado.',
     'Concatená-la em innerHTML para o navegador decidir se é texto ou marcação.',
     'Anexá-la diretamente ao ul sem criar um nó para cada item.',
     'Renderize mensagens externas de chat como texto literal e confira na árvore DOM que '
     'elas não criam elementos.')),
         ),
"11.03": C(
    'dom.form_validation',
    ('form com campos nome e quantidade; função validar({nome,quantidade}) retorna erros '
     'por campo'),
    "nome ' Ana ', quantidade '3' -> {ok:true,nome:'Ana',quantidade:3}",
    "nome vazio -> erro nome; '2.5'/'0'/'abc' -> erro quantidade; não perder valor digitado",
    'Validar apenas presença da string, aceitando quantidade inválida.',
    ('Trim no nome.',
     'Converta número explicitamente e cheque inteiro positivo.',
     'Associe mensagem ao campo sem apagar a entrada.'),
    ('Valide nome não vazio e Number(valor) inteiro positivo; retorne dados normalizados '
     'ou erros específicos por campo.'),
    'Form de estoque com quantidade -> mensagens por campo',
    load={"novelty": 2, "syntax": 3, "composition": 3, "state": 3, "debugging": 2, "files": 2, "reading": 3, "independence": 3, "tools": 2},
        kind='FADED',
    runtime='browser',
    estimated=10,
    **_lesson('dom.form_validation', ('form com campos nome e quantidade; função validar({nome,quantidade}) retorna erros '
     'por campo'), 'Validar apenas presença da string, aceitando quantidade inválida.', ('Trim no nome.',
     'Converta número explicitamente e cheque inteiro positivo.',
     'Associe mensagem ao campo sem apagar a entrada.'), ('Valide nome não vazio e Number(valor) inteiro positivo; retorne dados normalizados '
     'ou erros específicos por campo.'), 'Form de estoque com quantidade -> mensagens por campo', 10, 'browser', ('Complete a validação em etapas: normalize nome, converta quantidade e associe erros '
     'ao campo correto sem apagar o que a pessoa digitou.',
     'Em um formulário de entrega, “  Lia ” vira “Lia” e “4” vira o número quatro; '
     'apresentar um erro não deve substituir os valores ainda editados.',
     'Escreva as condições que tornam a quantidade convertida aceitável antes de abrir a '
     'execução.',
     'Editor da função, formulário rotulado, botão validar e região de erro ligada ao '
     'campo; resultado em texto.',
     'Starter validar, formulário HTML rotulado, console para inspecionar o objeto e '
     'painel para mensagens por campo.',
     'Por que a conversão numérica precisa ser seguida por uma verificação de inteiro '
     'positivo?',
     'A conversão pode produzir um número que ainda viola a regra de quantidade do '
     'formulário.',
     'Number converte automaticamente qualquer entrada em inteiro positivo.',
     'A validação deve limpar os campos antes de mostrar um erro.',
     'Adapte a regra para um formulário de estoque com unidade e quantidade, preservando a '
     'entrada quando houver erro.')),
         ),
"11.04": C(
    'dom.formdata_repeated',
    'form: nome, quantidade, checkboxes interesse com mesmo name; usar new FormData(form)',
    ('nome Ana, quantidade 2, interesses JS+TS -> nome Ana, quantidade 2, interesses '
     "['JS','TS']"),
    ("sem interesse -> []; quantidade '2x' -> erro; FormData.get devolve string/File/null, "
     'nunca number'),
    'Usar get no campo repetido ou tratar string numérica como number.',
    ('Leia FormData no submit preventDefault.',
     'Use getAll para campos repetidos.',
     'Valide tipo e converta quantidade só após leitura.'),
    ('Extrair nome com get, interesses com getAll e quantidade com Number seguido de '
     'inteiro positivo; preserve UI e mostre erros.'),
    'Inscrição com múltiplas preferências e idade -> array e número validados',
    load={"novelty": 2, "syntax": 3, "composition": 3, "state": 2, "debugging": 2, "files": 2, "reading": 3, "independence": 3, "tools": 3},
        kind='MAKE',
    runtime='browser',
    estimated=25,
    **_lesson('dom.formdata_repeated', 'form: nome, quantidade, checkboxes interesse com mesmo name; usar new FormData(form)', 'Usar get no campo repetido ou tratar string numérica como number.', ('Leia FormData no submit preventDefault.',
     'Use getAll para campos repetidos.',
     'Valide tipo e converta quantidade só após leitura.'), ('Extrair nome com get, interesses com getAll e quantidade com Number seguido de '
     'inteiro positivo; preserve UI e mostre erros.'), 'Inscrição com múltiplas preferências e idade -> array e número validados', 25, 'browser', ('Leia os valores no submit. Diferencie um campo simples dos controles com mesmo name '
     'e converta números somente após ler a string.',
     'Em um formulário de preferências, getAll("cor") pode retornar [azul, verde] e '
     'preservar as duas caixas marcadas; get("cor") retorna apenas uma ocorrência.',
     'Antes de preencher lacunas, escreva o tipo retornado por get/getAll e marque a etapa '
     'em que a conversão acontece.',
     'Editor com lacunas, formulário de preferências e saída textual antes/depois da '
     'normalização; navegação completa por teclado.',
     'Formulário HTML com controles de mesmo name, starter de submit e console para '
     'observar FormData; API nativa do navegador.',
     'Qual chamada preserva todas as escolhas com o mesmo name?',
     'FormData.getAll(name), seguida de validação e conversão conforme o tipo do campo.',
     'FormData.get(name), pois converte automaticamente o primeiro valor em array.',
     'Number(formData), pois FormData já normaliza qualquer campo como número.',
     'Projete a leitura de um formulário de inscrição com múltiplas preferências e idade, '
     'validando o array e o número.')),
         ),
"11.05": C(
    'dom.listener_lifecycle',
    'render() recria botões e registra listener no contêiner a cada chamada; corrigir',
    'render 3 vezes; clicar uma vez -> uma ação',
    ('item incluído depois da primeira renderização -> ainda funciona; destroy -> listener '
     'removido'),
    'Confundir render de elementos com instalação de listeners.',
    ('Conte addEventListener por ciclo.',
     'Instale uma vez fora do render e delegue pelo contêiner.',
     'Guarde referência para removeEventListener no cleanup.'),
    ('Separe mount que instala listener único, render que só atualiza DOM e destroy que '
     'remove listener.'),
    'Filtro rerenderizado repetidamente -> clique continua único',
    load={"novelty": 2, "syntax": 3, "composition": 3, "state": 3, "debugging": 4, "files": 2, "reading": 4, "independence": 3, "tools": 3},
        kind='DEBUG',
    runtime='browser',
    estimated=22,
    **_lesson('dom.listener_lifecycle', 'render() recria botões e registra listener no contêiner a cada chamada; corrigir', 'Confundir render de elementos com instalação de listeners.', ('Conte addEventListener por ciclo.',
     'Instale uma vez fora do render e delegue pelo contêiner.',
     'Guarde referência para removeEventListener no cleanup.'), ('Separe mount que instala listener único, render que só atualiza DOM e destroy que '
     'remove listener.'), 'Filtro rerenderizado repetidamente -> clique continua único', 22, 'browser', ('Repare o ciclo de vida: mount instala uma delegação, render atualiza a árvore e '
     'destroy remove o listener. Demonstre que um elemento criado depois funciona.',
     'Um painel de favoritos pode redesenhar sua lista a cada busca, enquanto um listener '
     'único no contêiner continua atendendo novos cartões.',
     'Conte quantas vezes cada função de lifecycle roda em mount, render, render, destroy '
     'antes de alterar o código.',
     'Editor separado por lifecycle e DOM, contador textual add/remove e controles para '
     'repetir render; debugger opcional.',
     'Arquivo inicial, área de saída, controles para repetir render e console com contagem '
     'de ações por clique.',
     'O que deve ficar fora de render quando ela pode ser chamada várias vezes?',
     'A instalação única do listener e sua limpeza pertencem ao ciclo mount/destroy.',
     'render deve adicionar outro listener para cada cartão.',
     'destroy deve redesenhar a interface para remover callbacks antigos.',
     'Corrija uma lista filtrável que redesenha várias vezes, mas deve manter uma ação de '
     'clique até ser desmontada.')),
         ),
"11.06": C(
    'dom.event_delegation',
    'ul#tarefas com botões data-id; um listener no ul',
    'clique botão data-id=7 -> remove tarefa 7',
    ("clique span dentro do botão -> closest('button[data-id]') encontra botão; clique "
     'fora de botão -> ignora; ID inexistente -> sem alteração'),
    'Ler dataset apenas de event.target e perder clique em filho.',
    ('Comece no target.',
     'Use closest e cheque que botão pertence ao contêiner.',
     'Converta ou compare ID conforme contrato de dados.'),
    ("Listener único usa target.closest('button[data-id]'), verifica ul.contains(botao), "
     'resolve ID e atualiza estado antes de render.'),
    'Lista de notificações adicionadas depois do mount -> um listener atende todas',
    load={"novelty": 2, "syntax": 3, "composition": 3, "state": 3, "debugging": 2, "files": 2, "reading": 3, "independence": 3, "tools": 3},
        kind='MAKE',
    runtime='browser',
    estimated=25,
    **_lesson('dom.event_delegation', 'ul#tarefas com botões data-id; um listener no ul', 'Ler dataset apenas de event.target e perder clique em filho.', ('Comece no target.',
     'Use closest e cheque que botão pertence ao contêiner.',
     'Converta ou compare ID conforme contrato de dados.'), ("Listener único usa target.closest('button[data-id]'), verifica ul.contains(botao), "
     'resolve ID e atualiza estado antes de render.'), 'Lista de notificações adicionadas depois do mount -> um listener atende todas', 25, 'browser', ('Implemente delegação no ul: normalize o alvo com closest, confirme que o botão '
     'pertence à lista e só então leia o identificador.',
     'Numa lista de arquivos, clicar no ícone dentro de Arquivar deve localizar o botão '
     'ancestral antes de ler seu data-id.',
     'Anote os alvos possíveis (botão ou filho) e o passo que os reduz ao controle válido.',
     'Área de clique com botão/ícone interno, log textual do id resolvido e status; '
     'controles operáveis por teclado.',
     'Lista HTML inicial, botões data-id, ícone interno e console; estado permanece local '
     'no navegador.',
     'Por que closest ajuda quando o alvo clicado pode ser um filho do botão?',
     'Ele sobe a árvore desde o alvo até encontrar o controle que representa a ação.',
     'Ele garante que qualquer ancestral com data-id pertença à lista atual.',
     'Ele converte event.target em objeto de estado sem validação.',
     'Use um único listener para ações de notificações adicionadas após a montagem da '
     'tela.')),
         ),
"11.07": C(
    'dom.form_accessibility',
    ('HTML defeituoso: placeholder sem label, div clicável, erro sem associação, foco '
     'perdido após submit'),
    ('label for/id, button type=submit, erro aria-describedby, região aria-live -> '
     'navegação e anúncio coerentes'),
    ('erro de campo -> foco no primeiro inválido; sucesso -> foco previsível; teclado '
     'Enter e Space operam controles nativos'),
    'Tratar cor/placeholder como substituto de nome acessível e gesto de mouse.',
    ('Use controles HTML semânticos.',
     'Associe label e mensagem por id.',
     'Defina política de foco para erro e sucesso.'),
    ('Troque div por button, ligue labels aos inputs, associe erros com aria-describedby e '
     'faça foco no primeiro inválido sem apagar dados.'),
    'Corrigir formulário de reserva para teclado e leitor de tela -> foco e mensagens',
    load={"novelty": 2, "syntax": 3, "composition": 4, "state": 3, "debugging": 2, "files": 3, "reading": 4, "independence": 4, "tools": 3},
        kind='UI',
    runtime='browser',
    estimated=35,
    **_lesson('dom.form_accessibility', ('HTML defeituoso: placeholder sem label, div clicável, erro sem associação, foco '
     'perdido após submit'), 'Tratar cor/placeholder como substituto de nome acessível e gesto de mouse.', ('Use controles HTML semânticos.',
     'Associe label e mensagem por id.',
     'Defina política de foco para erro e sucesso.'), ('Troque div por button, ligue labels aos inputs, associe erros com aria-describedby e '
     'faça foco no primeiro inválido sem apagar dados.'), 'Corrigir formulário de reserva para teclado e leitor de tela -> foco e mensagens', 35, 'browser', ('Remodele o formulário com controles nativos, relações explícitas entre rótulos e '
     'erros e uma política de foco para falha e sucesso. Verifique sem mouse.',
     'Num formulário de entrega, ativar o rótulo Endereço deve focar o input; um erro '
     'ligado por id deve ser anunciado junto ao campo.',
     'Percorra mentalmente localizar controle, entender erro, mover foco, corrigir e '
     'submeter por teclado antes de editar.',
     'Checklist interativo de Tab/Shift+Tab, Enter e Space; estado de foco em texto e '
     'erros associados por id.',
     'HTML defeituoso do formulário, painel de foco/feedback e inspetor textual; leitor de '
     'tela do sistema é opcional para revisão manual.',
     'O que conecta a mensagem de erro ao campo que ela descreve?',
     'Um id na mensagem referenciado por aria-describedby, com label associada ao input.',
     'Uma borda vermelha sem texto nem associação.',
     'Um placeholder que desaparece ao começar a digitar.',
     'Audite um formulário de reserva para que controles e erros possam ser encontrados e '
     'usados sem mouse.')),
         ),
"11.08": C(
    'dom.kanban_v1',
    ('arquivos index.html, style.css, app.js; colunas A fazer/Em curso/Feito; tarefas '
     'id,texto,status'),
    ("criar tarefa 'Ler' -> card em A fazer; mover para Feito -> card em Feito e storage "
     'atualizado'),
    ('reload -> tarefas preservadas; storage JSON inválido -> app inicia vazio com '
     "mensagem; texto '<img...>' -> literal; submit inválido -> foco no campo"),
    'Escrever DOM e storage como duas fontes de verdade ou renderizar texto via HTML.',
    ('Estado em memória é fonte para render.',
     'FormData extrai entrada; valide antes de inserir.',
     'Persistência versionada e render seguro; revise foco/aria-live.'),
    ('Implemente estado versionado, ações add/move/remove, render com '
     'createElement/textContent, save após mudança, restore seguro e feedback acessível.'),
    'Reservas de equipamento em uma lista -> estado consistente, persistência e controles operáveis por teclado',
    load={"novelty": 3, "syntax": 4, "composition": 5, "state": 5, "debugging": 4, "files": 5, "reading": 4, "independence": 5, "tools": 5},
        kind='PROJECT',
    runtime='browser',
    estimated=95,
    **_lesson('dom.kanban_v1', ('arquivos index.html, style.css, app.js; colunas A fazer/Em curso/Feito; tarefas '
     'id,texto,status'), 'Escrever DOM e storage como duas fontes de verdade ou renderizar texto via HTML.', ('Estado em memória é fonte para render.',
     'FormData extrai entrada; valide antes de inserir.',
     'Persistência versionada e render seguro; revise foco/aria-live.'), ('Implemente estado versionado, ações add/move/remove, render com '
     'createElement/textContent, save após mudança, restore seguro e feedback acessível.'), 'Reservas de equipamento em uma lista -> estado consistente, persistência e controles operáveis por teclado', 95, 'browser', ('Construa a primeira versão do Kanban ponta a ponta: entrada validada, estado fonte '
     'da verdade, render seguro, persistência e feedback acessível.',
     'Um quadro de leitura começa com “Revisar pauta”. Mover o status altera o objeto no '
     'estado; render reposiciona o cartão e a persistência guarda essa alteração.',
     'Escreva a forma do objeto tarefa e as transições possíveis entre as três colunas '
     'antes de implementar a primeira ação.',
     'Projeto em três arquivos com editor, prévia das colunas, painel storage e mensagens; '
     'teclado move foco/tarefas, sem depender de arraste.',
     'Starter index.html/style.css/app.js, localStorage do navegador, painel de prévia e '
     'console; sem conta ou serviço externo.',
     'Qual camada é a fonte de verdade quando renderização e storage precisam concordar?',
     'O estado em memória; a renderização deriva dele e storage persiste uma cópia '
     'serializada.',
     'O DOM, porque sempre se deve recuperar estado lendo os textos dos cartões.',
     'localStorage, consultado em cada render para decidir posições visuais.',
     'Crie uma lista de reservas de equipamento com estado consistente, persistência local e controles operáveis por teclado, sem '
     'reaproveitar a estrutura visual do Kanban.')),
         ),
"11.09": C(
    'dom.script_loading',
    ('HTML com scripts clássico no head, defer, async e type=module; log '
     'document.readyState e DOMContentLoaded'),
    ('clássico no head sem defer -> pode rodar antes do body; defer/module -> após parse e '
     'antes de DOMContentLoaded'),
    ('async -> ordem relativa ao parse/DOMContentLoaded não garantida; não afirmar que '
     'sempre vem antes/depois'),
    'Considerar async ordenado como defer.',
    ('Separe download, parse e execução.',
     'defer e módulo aguardam parse.',
     'async executa quando disponível e a ordem varia.'),
    ('Tabela explicita ordem garantida e não garantida; DOMContentLoaded espera deferred '
     'scripts e módulos relevantes do documento.'),
    ('Escolher atributo de script para inicializar formulário no fim do parse -> defer ou '
     'module'),
    load={"novelty": 2, "syntax": 2, "composition": 2, "state": 2, "debugging": 1, "files": 2, "reading": 4, "independence": 2, "tools": 2},
        kind='PREDICT',
    runtime='browser',
    estimated=6,
    **_lesson('dom.script_loading', ('HTML com scripts clássico no head, defer, async e type=module; log '
     'document.readyState e DOMContentLoaded'), 'Considerar async ordenado como defer.', ('Separe download, parse e execução.',
     'defer e módulo aguardam parse.',
     'async executa quando disponível e a ordem varia.'), ('Tabela explicita ordem garantida e não garantida; DOMContentLoaded espera deferred '
     'scripts e módulos relevantes do documento.'), ('Escolher atributo de script para inicializar formulário no fim do parse -> defer ou '
     'module'), 6, 'browser', ('Compare quando cada script pode executar em relação ao parse do documento. Separe '
     'garantias de ordem dos eventos que dependem do download.',
     'Um script de métricas lento com async pode terminar depois de um script menor abaixo '
     'dele; a posição no HTML não garante ordem de execução.',
     'Para cada script, escreva o que seu modo garante e o que depende da conclusão do '
     'download antes de ver a linha do tempo.',
     'Linha do tempo com marcadores parse/download/execução e campos garantido/não '
     'garantido; explicação em texto.',
     'HTML pequeno com scripts classic, defer, async e module, console e indicador '
     'DOMContentLoaded; sem dependências externas.',
     'Qual afirmação sobre async é segura sem conhecer os tempos de download?',
     'Executa quando fica pronto e não promete a ordem de defer.',
     'Sempre espera o parse completo e conserva a ordem do HTML.',
     'Sempre executa depois de DOMContentLoaded.',
     'Escolha o modo de carregamento para inicializar um formulário cujos elementos '
     'precisam ter sido interpretados.')),
         ),
"11.10": C(
    'modules.browser_entry',
    ('Kanban V1 em app.js; extrair state.js, view.js, main.js; index com script '
     'type=module src=main.js'),
    ('state exporta operações; view recebe estado; main conecta eventos; '
     'adicionar/mover/reload -> V1 preservado'),
    ('import com caminho relativo e extensão .js; abrir via file:// -> servir por HTTP '
     'local; módulo sem globals implícitas'),
    'Achar que separar arquivos sem imports/exports basta para executar no navegador.',
    ('State não importa view.',
     'View recebe snapshot e callbacks.',
     'main importa ambos e é entrada única do HTML.'),
    ('Separe domínio/persistência em state, DOM em view e composição em main; use imports '
     'ESM explícitos e servidor local.'),
    'Separar app de notas em model/view/main -> mesmas fronteiras',
    load={"novelty": 3, "syntax": 4, "composition": 4, "state": 3, "debugging": 3, "files": 4, "reading": 4, "independence": 4, "tools": 4},
        kind='MODIFY',
    runtime='browser',
    estimated=22,
    **_lesson('modules.browser_entry', ('Kanban V1 em app.js; extrair state.js, view.js, main.js; index com script '
     'type=module src=main.js'), 'Achar que separar arquivos sem imports/exports basta para executar no navegador.', ('State não importa view.',
     'View recebe snapshot e callbacks.',
     'main importa ambos e é entrada única do HTML.'), ('Separe domínio/persistência em state, DOM em view e composição em main; use imports '
     'ESM explícitos e servidor local.'), 'Separar app de notas em model/view/main -> mesmas fronteiras', 22, 'browser', ('Separe o Kanban em estado, visualização e ponto de entrada. Defina dependências e '
     'dados entre fronteiras e valide o carregamento no navegador.',
     'Num contador, state.js calcula o próximo valor, view.js desenha o número recebido e '
     'main.js conecta clique, atualização e renderização.',
     'Desenhe setas entre state, view e main e anote qual dado/callback cruza cada uma '
     'antes de mover funções.',
     'Três painéis de arquivos com mapa de imports, ação executar via servidor local e '
     'diagnóstico textual de import; navegação por teclado.',
     'index.html, state.js, view.js, main.js do Kanban, servidor local e console do '
     'navegador.',
     'Qual módulo deve compor view e estado sem fazer o domínio depender do DOM?',
     'O ponto de entrada importa state/view e conecta dados e eventos.',
     'O módulo state importa view para atualizar elementos diretamente.',
     'Todos os arquivos compartilham uma variável global em vez de import/export.',
     'Extraia model/view/main de um app de lembretes mantendo uma fronteira testável para '
     'regras e persistência.')),
         ),
"11.11": C(
    'dom.event_phases_default',
    ('link dentro de li dentro de ul; listeners capture/bubble; cenários preventDefault e '
     'stopPropagation'),
    ('capture ul, target link, bubble li, bubble ul -> ordem de fases; preventDefault no '
     'link -> navegação impedida, propagação continua'),
    ('stopPropagation no link -> navegação padrão ainda pode ocorrer; passive listener -> '
     'preventDefault não cancela'),
    'Confundir ação padrão com propagação.',
    ('Capture desce, bubble sobe.',
     'preventDefault atua na ação padrão.',
     'stopPropagation atua no caminho do evento.'),
    ('Trace fase/caminho e trate dois eixos separados: cancelamento padrão por cancelable '
     'e interrupção de propagação.'),
    'Clique em checkbox dentro de linha clicável -> escolha correta de ação e propagação',
    load={"novelty": 2, "syntax": 2, "composition": 3, "state": 2, "debugging": 1, "files": 1, "reading": 4, "independence": 3, "tools": 1},
        kind='COMPARE',
    runtime='browser',
    estimated=12,
    **_lesson('dom.event_phases_default', ('link dentro de li dentro de ul; listeners capture/bubble; cenários preventDefault e '
     'stopPropagation'), 'Confundir ação padrão com propagação.', ('Capture desce, bubble sobe.',
     'preventDefault atua na ação padrão.',
     'stopPropagation atua no caminho do evento.'), ('Trace fase/caminho e trate dois eixos separados: cancelamento padrão por cancelable '
     'e interrupção de propagação.'), 'Clique em checkbox dentro de linha clicável -> escolha correta de ação e propagação', 12, 'browser', ('Rastreie capture, target e bubble separadamente. Avalie preventDefault e '
     'stopPropagation como controles independentes.',
     'Num link dentro de item de lista, impedir navegação não impede o evento de alcançar '
     'ancestrais; parar propagação não cancela sozinho a navegação.',
     'Faça duas previsões independentes: ordem dos listeners e ocorrência da ação padrão.',
     'Matriz 2x2 para propagação/ação padrão e tabela de fases; cada combinação tem '
     'explicação textual e navegação acessível.',
     'Snippet de link aninhado, listeners capture/bubble e controles de ativar cada '
     'método; execução local.',
     'O que preventDefault altera diretamente?',
     'A ação padrão cancelável; ele sozinho não interrompe o caminho de propagação.',
     'A ordem dos listeners e a fase bubble, mantendo navegação.',
     'A lista de listeners dos elementos ancestrais.',
     'Escolha a política de evento para uma checkbox dentro de uma linha selecionável, '
     'preservando o comportamento de cada controle.')),
         ),
"11.12": C(
    'dom.untrusted_text',
    ('renderComentario(container,texto) recebe string externa; usar createElement e '
     'textContent'),
    "'<b>olá</b>' -> texto literal com sinais < >; querySelector('b') -> null",
    ("'<img src=x onerror=alert(1)>' -> nenhum img criado; string vazia -> nó de "
     'comentário vazio; quebra de linha preservada como texto'),
    'Tratar texto externo como HTML confiável.',
    ('Crie um elemento contêiner.',
     'Atribua textContent, não innerHTML.',
     'Verifique DOM resultante além da aparência visual.'),
    ("const p=document.createElement('p');p.textContent=texto;container.append(p); não use "
     'HTML parser para comentários.'),
    'Renderizar título de tarefa vindo de storage -> conteúdo literal',
    load={"novelty": 2, "syntax": 3, "composition": 3, "state": 2, "debugging": 2, "files": 2, "reading": 3, "independence": 3, "tools": 3},
        kind='UI',
    runtime='browser',
    estimated=12,
    **_lesson('dom.untrusted_text', ('renderComentario(container,texto) recebe string externa; usar createElement e '
     'textContent'), 'Tratar texto externo como HTML confiável.', ('Crie um elemento contêiner.',
     'Atribua textContent, não innerHTML.',
     'Verifique DOM resultante além da aparência visual.'), ("const p=document.createElement('p');p.textContent=texto;container.append(p); não use "
     'HTML parser para comentários.'), 'Renderizar título de tarefa vindo de storage -> conteúdo literal', 12, 'browser', ('Implemente renderComentario e inspecione o texto visível e os nós realmente criados '
     'no DOM.',
     'Uma nota “2 < 5 & 7 > 3” pode aparecer como caracteres dentro de um parágrafo; a '
     'árvore continua tendo apenas o parágrafo esperado.',
     'Antes de codificar, preveja o elemento estrutural e se o texto cria algum '
     'descendente.',
     'Editor da função, prévia do texto e inspetor de árvore com nomes/contagem de nós; '
     'execução por teclado e saída legível.',
     'Função inicial, container vazio e inspetor textual da árvore; execução local, sem '
     'conteúdo remoto.',
     'Qual propriedade indica que a entrada deve ser tratada como caracteres, não '
     'marcação?',
     'textContent em um nó criado explicitamente.',
     'innerHTML, porque converte a entrada em nó de texto por padrão.',
     'outerHTML, porque remove todos os caracteres especiais antes de renderizar.',
     'Renderize títulos recuperados do storage como texto, preservando pontuação e sinais '
     'reservados literalmente.')),
         ),
"11.13": C(
    'storage.schema_migration',
    ('storage V1: array [{text,done}]; V2:{version:2,tasks:[{id,text,status}]}; migrar ao '
     'carregar'),
    "[{text:'A',done:false},{text:'B',done:true}] -> tarefas A fazer e Feito, IDs estáveis",
    ('JSON quebrado -> estado vazio e aviso; item parcial -> recuperar itens válidos e '
     'reportar descartados; V2 -> não migrar de novo'),
    'Descartar todas as tarefas porque um único item antigo está inválido.',
    ('Leia e parseie dentro de try/catch.',
     'Valide versão e cada registro separadamente.',
     'Converta done para status e gere IDs estáveis antes de salvar V2.'),
    ('Função pura migrate valida cada item, preserva válidos, emite aviso; loader usa '
     'fallback seguro e grava V2 só após migração.'),
    'Migrar favoritos V1 string[] para V2 objetos -> válidos preservados',
    load={"novelty": 3, "syntax": 4, "composition": 4, "state": 4, "debugging": 4, "files": 3, "reading": 4, "independence": 4, "tools": 3},
        kind='MODIFY',
    runtime='browser',
    estimated=22,
    **_lesson('storage.schema_migration', ('storage V1: array [{text,done}]; V2:{version:2,tasks:[{id,text,status}]}; migrar ao '
     'carregar'), 'Descartar todas as tarefas porque um único item antigo está inválido.', ('Leia e parseie dentro de try/catch.',
     'Valide versão e cada registro separadamente.',
     'Converta done para status e gere IDs estáveis antes de salvar V2.'), ('Função pura migrate valida cada item, preserva válidos, emite aviso; loader usa '
     'fallback seguro e grava V2 só após migração.'), 'Migrar favoritos V1 string[] para V2 objetos -> válidos preservados', 22, 'browser', ('Planeje o carregamento por etapas: parse, validação por registro, migração e '
     'gravação da versão atual. Decida como itens válidos sobrevivem a um item danificado.',
     'Uma lista antiga de favoritos pode virar objetos com ids estáveis. Se uma entrada '
     'estiver incompleta, as demais podem ser convertidas e a interface pode reportar o '
     'descarte.',
     'Monte uma tabela com versão de entrada, função aplicada e formato final; marque onde '
     'falha por registro pode ser recuperada.',
     'Editor de função pura, seletor de fixture de versão e relatório textual de itens '
     'convertidos/ignorados; sem depender de cor.',
     'Fixtures locais de formatos antigo/atual, visualizador serializado e storage do '
     'navegador isolado do perfil pessoal.',
     'Por que validar registros individualmente na migração?',
     'Para preservar itens válidos e informar quais entradas precisaram ser descartadas.',
     'Para apagar toda a coleção assim que um registro não tiver um campo.',
     'Para repetir a mesma migração a cada carregamento, sem olhar a versão.',
     'Migre uma coleção antiga de favoritos para objetos identificáveis sem descartar '
     'entradas aproveitáveis.')),
         ),
}


_LITERAL_STARTERS = {
    '11.01': "material.md: <!doctype html>\n<article id=\"pai\"><a id=\"filho\" href=\"#\"><span id=\"botao\">Abrir</span></a></article>\n\nCada um dos três nós tem um listener click em bubble que registra currentTarget.id. Clique em span.",
    '11.02': "material.md: Bloco A: const item = document.createElement('li');\nBloco B: const texto = document.createTextNode(mensagem);\nBloco C: const botao = document.createElement('button');\nBloco D: botao.textContent = 'Remover';\nBloco E: botao.addEventListener('click', () => item.remove());\nBloco F: item.append(texto, botao);\nBloco G: lista.append(item);\n\nContexto fixo: const lista = document.querySelector('ul'); const mensagem = '<b>rascunho</b>'; Os blocos estão fora de ordem; cada declaração ocorre uma vez.",
    '11.03': "validate.js: export function validar({ nome, quantidade }) {\n  const erros = {};\n  // TODO: normalize o nome com trim e registre erro se ficar vazio.\n  // TODO: converta quantidade e aceite somente inteiro positivo.\n  // TODO: retorne { ok: true, nome, quantidade } ou { ok: false, erros }.\n}\n",
    '11.04': "form.js: export function lerInscricao(form) {\n  const dados = new FormData(form);\n  const nome = dados.get('nome');\n  const quantidadeTexto = dados.get('quantidade');\n  const interesses = dados.getAll('interesse');\n  // TODO: normalize e valide sem descartar os valores do formulário.\n}\n\nconst area = document.createElement('div');\narea.innerHTML = '<form><input name=\"nome\"><input name=\"quantidade\"><input type=\"checkbox\" name=\"interesse\" value=\"JS\"><input type=\"checkbox\" name=\"interesse\" value=\"TS\"></form>';\nconst form = area.querySelector('form');\nform.elements.nome.value = 'Ana';\nform.elements.quantidade.value = '2';\nform.querySelectorAll('[name=interesse]')[0].checked = true;\nform.querySelectorAll('[name=interesse]')[1].checked = true;\nconsole.log(lerInscricao(form));",
    '11.05': "app.js: const lista = document.querySelector('#lista');\nlet acoes = 0;\nconst limpezas = [];\n\nfunction render(itens) {\n  lista.replaceChildren();\n  for (const item of itens) {\n    const botao = document.createElement('button');\n    botao.textContent = item;\n    lista.append(botao);\n  }\n  const aoClicar = (event) => {\n    if (event.target.closest('button')) acoes += 1;\n  };\n  lista.addEventListener('click', aoClicar);\n  limpezas.push(() => lista.removeEventListener('click', aoClicar));\n}\n\nfunction destroy() {\n  lista.replaceChildren();\n  // BUG: limpezas nunca são executadas; renders também acumulam listeners.\n}\n\nexport { render, destroy };\nexport const getAcoes = () => acoes;",
    '11.06': "app.js: export function montarDelegacao(lista, removerPorId) {\n  lista.addEventListener('click', (event) => {\n    // TODO: normalize o alvo clicado, inclusive quando for um span dentro do botão.\n    // TODO: ignore botão ausente, externo à lista ou com id desconhecido.\n    // TODO: chame removerPorId somente com o data-id do botão válido.\n  });\n}\n\n// A lista pode receber botões novos depois desta função ser chamada.\n// <ul id=\"tarefas\"><li><button data-id=\"7\"><span>Remover</span></button></li></ul>",
    '11.07': [
        {"path": "index.html", "content": "<form id=\"reserva\"><input id=\"email\" placeholder=\"E-mail\"><div id=\"enviar\" onclick=\"enviarFormulario()\">Enviar</div><p id=\"erro\">Campo inválido</p><p id=\"resultado\" aria-live=\"polite\"></p></form>"},
        {"path": "main.js", "content": "const form = document.querySelector('#reserva');\nconst email = document.querySelector('#email');\nform?.addEventListener('submit', event => { event.preventDefault(); if (!email.value.includes('@')) document.querySelector('#erro').textContent = 'Campo inválido'; });"},
    ],
    '11.08': [
        {"path": "index.html", "content": "<!doctype html><form id=\"nova-tarefa\"><label for=\"texto\">Nova tarefa</label><input id=\"texto\" name=\"texto\" required><button type=\"submit\">Adicionar</button></form><p id=\"aviso\" aria-live=\"polite\"></p><main class=\"quadro\"><section aria-labelledby=\"todo-title\"><h2 id=\"todo-title\">A fazer</h2><ul id=\"todo\" data-status=\"todo\"></ul></section><section aria-labelledby=\"doing-title\"><h2 id=\"doing-title\">Em curso</h2><ul id=\"doing\" data-status=\"doing\"></ul></section><section aria-labelledby=\"done-title\"><h2 id=\"done-title\">Feito</h2><ul id=\"done\" data-status=\"done\"></ul></section></main>"},
        {"path": "style.css", "content": ".quadro { display: grid; grid-template-columns: repeat(3, minmax(12rem, 1fr)); gap: 1rem; } section { border: 1px solid #999; padding: 1rem; }"},
        {"path": "app.js", "content": "const STORAGE_KEY = 'kanban:v1';\nconst STATUSES = new Set(['todo', 'doing', 'done']);\nconst vazio = () => ({version: 1, tasks: []});\nexport function carregar(storage, warn = () => {}) { try { return JSON.parse(storage.getItem(STORAGE_KEY)) || vazio(); } catch { warn('JSON inválido'); return vazio(); } }\nexport function mover(estado, id, status) { return estado; }\nexport function renderizar(document, estado) { /* TODO: renderize cada status com textContent */ }\nexport function salvar(storage, estado) { storage.setItem(STORAGE_KEY, JSON.stringify(estado)); }\nexport function montarKanban(document, storage) { /* TODO: valide submit, mova por botões e anuncie */ }"},
    ],
    '11.09': "material.md: <!doctype html>\n<head>\n  <script>console.log('head clássico')</script>\n  <script defer src=\"defer.js\"></script>\n  <script async src=\"async.js\"></script>\n  <script type=\"module\" src=\"module.js\"></script>\n</head>\n<body><button id=\"salvar\">Salvar</button></body>\n<script>document.addEventListener('DOMContentLoaded', () => console.log('DOMContentLoaded'))</script>",
    '11.10': [
        {"path": "state.js", "content": "const key = 'kanban:v1';\nexport function carregar(storage) { try { return JSON.parse(storage.getItem(key)); } catch { return {version: 1, tasks: []}; } }\nexport function mover(state, id, status) { return state; }\nexport function salvar(storage, state) { storage.setItem(key, JSON.stringify(state)); }"},
        {"path": "view.js", "content": "export function render(document, state, list) { list.replaceChildren(...state.tasks.map(task => { const item = document.createElement('li'); item.innerHTML = task.text; return item; })); }"},
        {"path": "main.js", "content": "import {carregar} from './state.js';\nimport {render} from './view.js';\nexport function boot(storage, document, list) { render(document, carregar(storage), list); }"},
    ],
    '11.11': "material.md: const pai = document.querySelector('#menu');\nconst item = document.querySelector('#item');\n\nitem.addEventListener('click', () => registrar('item'));\npai.addEventListener('click', () => registrar('pai'));\nitem.addEventListener('click', (event) => {\n  if (event.target.matches('[data-parar]')) event.stopPropagation();\n});\n\n// O terceiro listener é instalado depois do primeiro listener de item.",
    '11.12': "render.js: export function mostrarTitulo(alvo, titulo) {\n  alvo.innerHTML = titulo;\n}\n\nconst titulo = '<img src=x onerror=alert(1)> Revisão';\n// Alvo inicial: <h2 id=\"titulo\"></h2>",
    '11.13': "migration.js: export function migrarV1ParaV2(entrada) {\n  // V1 usado pelo Kanban de 11.08: { version: 1, tasks: [{ id, text, status }] }\n  // V2 esperado: { version: 2, tasks: [{ id, text, status, priority }] }\n  // TODO: preserve ids/text/status, use priority='normal' quando ausente e valide por tarefa.\n}\n\nexport function carregar(entrada) {\n  // TODO: V1 passa pela migração uma vez; V2 não é migrado novamente.\n}\n",
    '11.14': "material.md: const botao = document.querySelector('#copiar');\nconst rolagem = document.querySelector('#conteudo');\nconst painel = document.querySelector('#painel');\nconst painelController = new AbortController();\n\nbotao.addEventListener('click', copiarTexto, { once: true });\nrolagem.addEventListener('wheel', observarRolagem, { passive: true });\npainel.addEventListener('click', atualizarPainel, { signal: painelController.signal });\n\n// Fechar o painel: painelController.abort(). Decida ciclo de vida e cancelamento padrão.",
}
for _card_id, _starter in _LITERAL_STARTERS.items():
    CONTENT[_card_id]["starter"] = _starter

# A tela apresenta uma decisão sobre comportamento de listeners; não pede edição.
CONTENT["11.14"]["kind"] = "COMPARE"

# O comportamento de foco faz parte do contrato observável do formulário.
CONTENT["11.07"]["hidden"] = (
    "erro -> foco no primeiro campo inválido; sucesso -> resumo com tabindex=-1 recebe foco; "
    "Enter submete e Space ativa controles nativos"
)
CONTENT["11.07"]["solution"] = (
    "Associe label e erro por id, use button submit e aria-live; em falha foque o primeiro "
    "campo inválido, e em sucesso mova o foco para um resumo com tabindex=-1. Preserve os "
    "valores digitados."
)

# A migração agora estende o formato V1 usado pelo projeto 11.08, sem trocar de domínio.
CONTENT["11.08"]["public"] = (
    "V1 {version:1,tasks:[{id:'t1',text:'Ler pauta',status:'todo'}]} -> mover para done "
    "atualiza estado/storage; reload preserva tarefa"
)
CONTENT["11.08"]["hidden"] = (
    "reload -> V1 preservado; JSON inválido -> quadro vazio e aviso sem apagar o valor "
    "original; texto '<img src=x>' -> texto literal; status desconhecido -> rejeitado"
)
CONTENT["11.08"]["solution"] = (
    "Implemente o Kanban V1 {version:1,tasks:[{id,text,status}]} com estado em memória como "
    "fonte, tarefas adicionadas/movidas/removidas, render seguro e storage local. Em JSON "
    "inválido mostre aviso e estado vazio sem sobrescrever o valor salvo."
)
CONTENT["11.13"]["public"] = (
    "V1 {version:1,tasks:[{id:'t1',text:'Ler pauta',status:'todo'}]} -> V2 "
    "{version:2,tasks:[{id:'t1',text:'Ler pauta',status:'todo',priority:'normal'}]}"
)
CONTENT["11.13"]["hidden"] = (
    "V1 -> adiciona priority='normal'; V2 -> não migra de novo; prioridade válida existente "
    "é preservada; registro parcial é ignorado com aviso; JSON inválido não sobrescreve storage"
)
CONTENT["11.13"]["solution"] = (
    "Use o loader e os fixtures do Kanban 11.08. Migre V1 para V2 preservando id/text/status "
    "e adicionando priority='normal'; valide cada registro, reporte os descartados e nunca "
    "migre V2 novamente. Grave a versão atual só depois da conversão segura."
)
CONTENT["11.05"]["failure"] = (
    "Depois de render duas vezes, um clique incrementa a ação mais de uma vez; depois de "
    "destroy, um elemento novo ainda aciona o listener antigo."
)
CONTENT["11.07"]["failure"] = (
    "Ao enviar com e-mail inválido, o foco permanece no botão e o campo não anuncia a "
    "mensagem; no sucesso, o foco não chega ao resumo definido no contrato."
)
CONTENT["11.08"]["failure"] = (
    "Após mover tarefa, render e storage mostram estados diferentes; texto com marcação vira "
    "elemento ou JSON inválido é sobrescrito sem aviso."
)
CONTENT["11.13"]["failure"] = (
    "O resultado não é V2 com prioridade padrão, descarta tarefa válida por causa de uma "
    "parcial, ou converte V2 pela segunda vez."
)
_OBSERVABLE_FAILURES = {
    '11.01': 'O log começa no ancestral, altera target durante bubble ou continua subindo depois de stopPropagation.',
    '11.02': 'A marcação da mensagem vira elemento, ou remover um item afeta um irmão da lista.',
    '11.03': "'2.5', '0' ou 'abc' é aceito como quantidade, ou o valor digitado desaparece após erro.",
    '11.04': 'Apenas uma checkbox repetida aparece, ou quantidade sai como number antes da validação/conversão explícita.',
    '11.05': 'Um clique após render repetido executa múltiplas ações, ou destroy deixa listener ativo.',
    '11.06': 'Clicar no span interno perde o botão, ou ação externa/ID inexistente altera o estado.',
    '11.07': 'Erro não é associado/anunciado e o foco não segue a política para falha ou sucesso.',
    '11.08': 'Estado, renderização e storage divergem; entrada HTML vira nó ou JSON inválido é apagado.',
    '11.09': 'A previsão afirma ordem fixa para async ou executa script antes do parse sem garantia.',
    '11.10': 'O import não resolve no navegador ou a separação de módulos mantém responsabilidade acoplada.',
    '11.11': 'Parar propagação cancela a ação padrão indevidamente ou bloqueia listener que deveria continuar.',
    '11.12': 'Texto de comentário cria elemento/evento em vez de permanecer como texto literal.',
    '11.13': 'A migração não produz V2 idempotente, perde itens válidos ou sobrescreve storage inválido.',
    '11.14': 'Listener once/passive/signal tem ciclo errado ou passive cancela a ação padrão.',
}
for _card_id, _failure in _OBSERVABLE_FAILURES.items():
    CONTENT[_card_id]["failure"] = _failure

_OFFICIAL_DOCS = {
    '11.14': 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener',
    '11.01': 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling',
    '11.02': 'https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent',
    '11.03': 'https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Constraint_validation',
    '11.04': 'https://developer.mozilla.org/en-US/docs/Web/API/FormData',
    '11.05': 'https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener',
    '11.06': 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling',
    '11.07': 'https://www.w3.org/WAI/tutorials/forms/labels/',
    '11.08': 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
    '11.09': 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script',
    '11.10': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules',
    '11.11': 'https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Events',
    '11.12': 'https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent',
    '11.13': 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage',
}
for _card_id, _official_url in _OFFICIAL_DOCS.items():
    CONTENT[_card_id]["docs"] = _official_url

# Revisão editorial de 05/10/2026: enunciado, starter e contrato realinhados.
CONTENT["11.10"]["content_version"] = 2

CONTENT["11.08"]["rubric"] = (
    "Entrega 1 — contrato V1 registra {version:1,tasks:[{id,text,status}]}, estados permitidos e transições; o draft descreve add/move/remove.",
    "Entrega 2 — app.js mantém uma fonte de verdade, valida antes de mutar e renderiza texto do usuário com textContent; a prévia mostra as três colunas.",
    "Entrega 3 — localStorage salva após cada mudança e reload recupera o quadro; JSON inválido mostra aviso sem sobrescrever os bytes originais.",
    "Entrega 4 — checklist registra evidência de CRUD, status desconhecido, reload, JSON inválido e texto '<img>' literal; reflexão anota a sequência de teclado/foco verificada.",
)
