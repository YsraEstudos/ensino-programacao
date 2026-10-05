# Auditoria e revisão da Etapa 02 — 02/10/2026

> Registro histórico. Os caminhos, comandos e distribuições abaixo descrevem a estrutura da época; não devem orientar a manutenção atual. Consulte [a organização atual](organizacao-projeto.md) e execute `npm.cmd run build:curriculum` dentro de `devpath-publish/`.

A Etapa 02 tinha uma base coerente: operadores → ausência → conversão/validade → transferência → Math → precisão → tolerância. Os problemas de maior impacto estavam na entrega dessa sequência: teoria escondida até a previsão, exemplos excessivamente compactos, contratos de interação não realizados e casos insuficientes para distinguir algumas regras incorretas. A revisão preserva os 12 IDs, os temas e os objetivos próprios da etapa.

Seis subagentes analisaram, em paralelo, conteúdo/progressão, pré-requisitos, explicações/exemplos, exercícios/interações, design/acessibilidade e organização do código. Os achados foram conferidos na versão atual e conciliados antes da implementação. As etapas 01 e 03 foram contexto de progressão; a 00 forneceu critérios de experiência, especialmente ensinar antes da tentativa, separar previsão/código/saída e oferecer feedback acessível.

## Prioridades identificadas antes da alteração

| Prioridade | Atividade / evidência original | Efeito no aprendizado | Correção implementada |
| --- | --- | --- | --- |
| P1 | Todos os blocos: `stage02-ui.js` escondia o exemplo até `predictionSaved` | O iniciante precisava responder antes de receber a explicação específica | Regra, código resolvido, passos e armadilha disponíveis antes da previsão nos 17 blocos; exemplos executáveis |
| P1 | 02.01 e 02.11: `predictionFields` oferecia só valor, embora a fonte pedisse valor e tipo | A resposta não podia representar o conceito solicitado | Campos separados de valor/tipo, registro e comparação com o valor/tipo obtidos |
| P1 | 02.02: a classificação falsy/nullish era pedida, mas não coletada | Memorização de saídas sem tornar a distinção conceitual observável | Classificação por entrada, comparação posterior e indicação explícita das divergências |
| P1 | 02.10: recurso começava com `Ponte 02B`, mas a UI buscava `### Ponte 02B` | A preparação para Number/Math ficava invisível | Normalização do cabeçalho; instruções de retomada e ensino próprio em cada bloco da unidade B |
| P1 | 02.06: execução original só aparecia depois da previsão e compreensão | A investigação pedida não podia começar pela observação | Código original e execução disponíveis antes da resposta; essa execução não aprova a correção |
| P1 | 02.03: o editor permitia contornar a montagem; não havia caso saldo=valor | A atividade podia concluir sem praticar Parsons e aceitava `>` no lugar de `>=` | Prévia somente leitura, montagem válida obrigatória e caso de igualdade; mudanças na montagem invalidam aprovação |
| P1 | 02.04: duas lacunas prometidas, mas editor totalmente livre | O apoio gradual não correspondia ao exercício FADED | Duas entradas de expressão rotuladas geram a prévia do código completo |
| P1 | 02.08/02.09: poucos casos presentes; 02.12 verificava `tolerancia` só no primeiro caso | Algumas regras específicas dos exemplos passavam como generalização | Preferências presentes/mistas, dois placares presentes e tolerância verificada em todas as resoluções |
| P2 | 02.04–02.09: várias soluções omitiam nomes intermediários pedidos | A avaliação não conferia os artefatos declarados no enunciado | Declarações requeridas e valores dos bindings de saída conferidos além das saídas |
| P2 | 02.01: faltavam prática com `!==` e demonstração da avaliação condicional | Preparação incompleta para condições da Etapa 03 | Comparações estritas adicionais e exemplo de curto-circuito que evita a leitura de um nome não declarado |
| P2 | 02.04/05/07/10/11/12: exemplos curtos, taxa e tolerância pouco decompostas | Saltos entre a regra abstrata e sua composição no código | Conversão → flag → finitude → decisão; porcentagem → fração restante; intervalos; precisão; limite inclusivo |
| P2 | Foco retornava ao título após Run; texto/controles pequenos; tabela inteira era região ao vivo | O aluno perdia o resultado e o teclado exigia percorrer o conteúdo novamente | Foco em resultados, dica recém-aberta, conceito e editor; controles de 44 px, editor de 16 px, foco visível e status curto separado da tabela |
| P2 | Aprovações antigas podiam sobreviver a novos casos; previsão antiga não tinha os novos campos | Progresso salvo podia contornar a prática revisada | Revalidação das evidências; previsões incompletas reabrem; código e reflexão são preservados |

## Progressão resultante

| Trecho | Preparação e prática |
| --- | --- |
| 02.01 | Expressão, aritmética/precedência, comparação, truthiness, lógica, concatenação e igualdade/diferença estritas; três blocos graduais |
| 02.02–02.03 | Separar falsy de nullish e combinar requisitos booleanos; classificar, prever, montar e conferir |
| 02.04–02.05 | Converter texto, separar vazio de zero, detectar finitude e apresentar texto; lacunas antes da composição no editor |
| 02.06–02.09 | Observar erro, corrigir causa, construir desconto, transferir preferências e normalizar placares |
| 02.10 | Escolher arredondamento, extremos/magnitude e transformar intervalos; sorteio real separado dos testes determinísticos |
| 02.11–02.12 | Entender limites de Number/BigInt e aplicar política explícita de tolerância, incluindo a borda |

O fluxo é regra → exemplo resolvido → previsão → checagem conceitual → prática/casos → explicação e conclusão. Previsões incorretas são permitidas e preservadas para comparação; não são tratadas como reprovação. A checagem conceitual e a execução do código atual continuam obrigatórias.

## Decisões de escopo e conciliação

- `?.` aparecia como promessa na descrição histórica, mas exige objetos. A descrição da Etapa 02 agora o identifica como conteúdo posterior; inserir objetos aqui criaria um novo pré-requisito. Nenhuma etapa posterior foi editada.
- O exemplo de quatro faces em 02.10 é uma transferência válida para a tarefa de seis faces. Foi mantido, com explicação explícita de N e da adaptação, em vez de ser classificado como erro matemático.
- Não foi imposto bloqueio entre exercícios. A sequência e as retomadas são explícitas, e cada bloco ensina sua regra; navegar para um exercício continua possível.
- Retirar um bloco obrigatório no Parsons continua sendo uma decisão exploratória permitida. A montagem inválida recebe feedback e não passa; restaurar os blocos permanece disponível.
- A conclusão automática registra a prática. Autonomia sem dica e qualidade da explicação exigem conferência do aluno; o texto de conclusão não promete avaliação semântica automática da reflexão.
- `VERSION=1` é a versão do formato de armazenamento, distinta de `contentVersion=3`. Não foi necessário apagar rascunhos para atualizar o conteúdo. Evidências são revalidadas contra os casos e os novos campos.
- Promessas de painéis, diff e seleção de casos que não existiam foram substituídas na fonte por descrições da interação efetiva. Não se criou uma interface adicional sem finalidade pedagógica demonstrada.

## Fontes, manutenção e limite das alterações

Fonte curricular: `course-src/recipes/02.py`; descrição: `course-src/stages/02.txt`; saída editorial: somente os registros `stage=02` de `course-src/.generated/resolved_preview.json`.

Os módulos autorais da interação permanecem em `devpath-publish/public/stage02-lessons.js`, `stage02-ui.js` e `stage02.css`; suas cópias em `devpath-full-catalog/public` foram sincronizadas e conferidas por igualdade de conteúdo. O interpretador não precisou mudar. Os testes ficam em `devpath-full-catalog/scripts/test-stage02*.mjs` e podem usar `STAGE02_SITE=devpath-publish` para conferir o outro catálogo.

O publicador ganhou `--stage02`, que mantém integralmente todos os cartões de outras etapas, preserva a ordem das respostas de revisão de cada catálogo e não regrava a lista de IDs. Uso: `node course-src/build-public-curriculum.mjs --stage02` e a mesma chamada com `--full`. Isso evita que uma atualização local da Etapa 02 sobrescreva o trabalho preexistente na Etapa 01.

O snapshot `tmp/stage02/audit-baseline.json` e a verificação `tmp/stage02/verify-scope.mjs` comparam os cartões de outras etapas e hashes dos arquivos públicos vizinhos, APIs e biblioteca. A versão principal já possuía alterações locais da Etapa 01; elas foram preservadas. Nenhum site foi publicado.

## Validação

Os dez testes novos cobrem exemplos antes da previsão, Ponte 02B, observação do starter de depuração, igualdade no pagamento, preferências presentes, tolerância por resolução, foco/status, recuperação de previsão incompleta, feedback de classificação incorreta e revalidação da conclusão exibida no catálogo. Oito desses comportamentos foram reproduzidos como falhas antes da correção; o teste de preferências foi ajustado para reproduzir um atalho que efetivamente passava nos casos antigos.

Verificações finais: 64/64 testes na execução conjunta de interface/interpretador, auditoria, progresso e fonte; 49/49 na execução de interface/interpretador e auditoria direcionada ao catálogo principal; sintaxe JavaScript; builds dos dois projetos; comparação de escopo e cópias; `git diff --check`.

No navegador, foram conferidos a Ponte 02B e o fluxo de 02.06 em viewport de 390×844, inclusive execução, foco nos resultados, controles de 44 px e fonte do editor de 16 px. As tabelas mantêm rolagem horizontal explícita e acessível por teclado. Isso não constitui certificação de acessibilidade nem teste completo com leitor de tela. Testes usam jsdom e Node 26.7.0; o currículo declara Node 24 LTS, que não foi executado nesta revisão.

O build do catálogo completo aponta um aviso preexistente de contrato/grafo em 01.06. Ele permanece fora do escopo, sem correção nesta tarefa.

As regras técnicas foram conferidas com a documentação primária da [MDN sobre curto-circuito de &&](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND), [Math.round](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round) e [Number.EPSILON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON).

## Correção visual e organização para iniciantes

A apresentação anterior mantinha um cabeçalho pesado, enunciado extenso e painéis com pouca hierarquia. A correção aproxima a Etapa 02 da linguagem visual da Etapa 00: cabeçalho transparente, verde e lima, tipografia e espaçamento de leitura, roteiro fixo e cinco seções identificadas.

Todos os 17 blocos receberam vocabulário, objetivo curto e três instruções específicas. Os exemplos apresentam código e saída real lado a lado antes da previsão, com raciocínio e alerta de confusão. O enunciado integral e as limitações do editor continuam consultáveis em detalhes. A previsão, os desafios Parsons/lacunas, os critérios de aprovação e o progresso foram preservados.

Validação: 66 testes passaram, incluindo navegação com foco e destinos disponíveis com a prática bloqueada, exemplos reais e fluxos completos dos 12 exercícios. Os dois builds passaram. A conferência em navegador a 390 px identificou e corrigiu rolagem lateral causada por rótulos acessíveis da tabela; a largura final da página coincide com o viewport. O verificador de escopo confirma cópias Stage 02 idênticas e conteúdos/arquivos das outras etapas intactos. Nenhuma publicação realizada.
