# Plano Mestre DevPath — apoio ao estudo pessoal

**Data de revisão:** 19/10/2026
**Uso definido pelo proprietário:** site privado, utilizado apenas como auxiliar do próprio estudo, sem disponibilização para outras pessoas.
**Objetivo:** consultar conteúdo correto no site, levar os exercícios para uma IA quando necessário e praticar na própria máquina, usando editor, terminal e navegador locais.

## Decisão de escopo aprovada

- **Regra aplicável às 23 fases e a todas as etapas do currículo:** o site é material de consulta e apoio ao estudo, não o ambiente obrigatório de execução ou correção. O proprietário pode copiar enunciado, código e exemplos para uma IA e executar/conferir o exercício na própria máquina. Não criar ou adaptar runners, sandboxes, corretores, integrações de terminal, exportadores ou controles de avaliação para viabilizar esse fluxo.
- Ausência de execução interna de JavaScript, TypeScript, DOM, Workers, Node ou testes não é defeito a corrigir neste plano. Extensão de arquivo usada apenas para apresentação, limitação do simulador e falta de nota automática também não geram trabalho por si. Corrigir o material quando ele impedir a execução local proposta, ensinar errado ou omitir informação indispensável.
- As fases 1–10 permanecem como histórico do trabalho realizado. Seus registros e evidências não serão refeitos para adequá-los ao novo padrão.
- As fases 11–20 são as **10 fases restantes, todas reduzidas**. As fases 11–16 tratam o conteúdo conforme ele for usado; as fases 17–19 são adiadas até o estudo alcançar os assuntos avançados; a fase 20 encerra o escopo efetivamente trabalhado.
- As fases 21–22 deixam de existir como etapas independentes. Seus princípios úteis estão resumidos nas regras deste documento.
- A campanha formal da fase 23 está dispensada. Os recursos de acessibilidade existentes ficam preservados; problemas que dificultem o uso pessoal continuam sendo corrigidos. Se o proprietário depender de leitor de tela ou navegação exclusiva por teclado, reativar a verificação pertinente antes de usar o caminho afetado.
- Os números das fases e os IDs das atividades são preservados para manter referências anteriores. A dispensa de uma fase não significa que seus testes foram executados.
- Esta revisão altera **somente o plano**. Não implementa correções futuras, não remove testes ou recursos existentes e não publica o site.

## Como escolher o próximo trabalho

1. Trabalhar na etapa atual de estudo e, quando útil, preparar a próxima. Não antecipar uma revisão completa das etapas avançadas.
2. Se houver um bloqueio confirmado fora dessa sequência, tratar o bloqueio antes de continuar o exercício.
3. Uma solicitação explícita de fase ou atividade define o escopo da execução. Não ampliar automaticamente para outras fases.
4. Reutilizar evidência das fases anteriores quando fonte, artefato e comportamento relevante não mudaram.
5. Ao terminar os lotes escolhidos, aplicar o fechamento leve da fase 20. Não há dependência obrigatória das fases dispensadas 21–23.

## O que merece correção

**Corrigir quando confirmado:** gabarito ou exemplo errado; tarefa impossível de realizar localmente com o material fornecido; arquivo/import necessário ausente; requisito cobrado sem ser explicado; teste entregue ao aluno que rejeita solução válida ou aceita o erro relevante; código do exercício que trava a prática local; pré-requisito indispensável sem preparação. No site, tratar dificuldades concretas de acesso/leitura/cópia e perda de rascunho/progresso efetivamente utilizados, sem expandir sua estrutura.

**Melhorar somente se atrapalhar o estudo:** texto confuso, dica que entrega a resposta, rubrica genérica ou ausência de critério compreensível, estimativa de tempo muito enganosa e explicação insuficiente de um conceito usado na tarefa.

**Fora do trabalho obrigatório:** reescrever texto já compreensível por estética; padronizar todo o curso em quatro blocos; impor tamanho mínimo de prompt ou exatamente três critérios de rubrica; criar mutante para toda atividade; eliminar todo aviso do repositório; obter cobertura total; expandir infraestrutura, documentação ou homologação para um lançamento público; executar/corrigir os exercícios dentro do site; adaptar a interface a cada formato de atividade; certificar domínio automaticamente ou registrar no site tentativas feitas fora dele.

**Material suficiente para o estudo com IA e execução local:** objetivo e enunciado compreensíveis, código copiável quando necessário, nomes de arquivos/imports quando relevantes, entradas e resultados esperados ou critérios de análise, além dos comandos/dependências indispensáveis ao ambiente local. Não exigir pacote de exportação, botão de execução, teste oculto ou integração com IA. A ajuda da IA pode esclarecer e discutir a solução; a conferência usa o resultado esperado, a documentação ou o teste local pertinente, sem depender apenas da aprovação verbal da IA.

Leitura, comparação e previsão continuam sendo atividades válidas. Material escrito não precisa virar código quando esse não é o objetivo. Conteúdo de segurança, DOM, Workers, TypeScript ou pacotes continua útil quando fizer parte do assunto estudado; o uso privado não autoriza ensinar um comportamento incorreto.

## Verificação simples e suficiente

1. Localizar a fonte efetiva e o conteúdo consumido pelo site. Tratar listas antigas e contagens como pistas, não como prova de defeito atual.
2. Reproduzir apenas o problema relevante. Se já estiver resolvido, registrar isso e seguir. IDs sem descrição de falha não geram correção presumida.
3. Fazer a menor correção que permita cumprir o objetivo. Manter teste de regressão quando o comportamento puder voltar a quebrar.
4. Conferir o conteúdo fora do site: para comportamento, executar localmente a solução e um caso relevante; para tipos, usar o verificador TypeScript configurado; para previsão, conferir a resposta; para leitura, fornecer critérios específicos suficientes. Verificar um caso incorreto quando necessário para corrigir um teste entregue ao aluno. Não exigir correção automática interna nem um mutante armazenado para cada caso.
5. Depois de alterar geração ou conteúdo, conferir o resultado compilado. Se mudar public/, executar npm run assets:version e seu check. Não editar só a saída gerada.
6. Executar os testes existentes pertinentes ao conteúdo ou à geração alterados; conferir o programa do exercício no ambiente local correspondente. Não ampliar a rodada para consertar runners/corretores do site ou exigir homologação de sua execução interna. Se surgir necessidade de mudança estrutural da plataforma, registrar fora deste escopo, sem implementá-la.
7. Registrar no item do plano apenas ID, problema confirmado ou classificação, correção e verificação/limite. Não exigir relatório ou ledger separado, hash por arquivo, matriz de gravidade ou tabela de auditoria de toda a etapa.

### Testes, mutantes e avisos existentes

Os testes, gates e mutantes já implementados ficam preservados. A exigência futura de criar mutantes em todos os IDs pendentes, inclusive a obrigação residual registrada na fase 7, está dispensada. Criar ou ajustar um mutante só quando ele ajudar a provar um defeito relevante ou um teste insuficiente.

Manter os gates no modo existente; não relaxar ou desligar um gate, autoTested ou avaliação para ocultar uma falha. Ausência de mutante, prompt curto, leitura sem teste genérico ou limitação de execução/correção interna não bloqueiam o estudo externo. Registrar limitações sem transformá-las em obrigação de infraestrutura. Um teste local entregue incorreto ou conteúdo errado continua exigindo correção; saída 0 não prova qualidade global.

### Restrições de preservação

- Preservar IDs, ordem, rascunhos, respostas, progresso e trabalho não commitado. Não fazer migração ou reorganização para simplificar esta revisão.
- Preservar os runners e recursos existentes, sem exigir que sejam ampliados ou corrigidos para executar o currículo. Não trocar o modo de avaliação para fazer a referência passar no lugar da submissão do usuário. Eventual bloqueio do site que impeça consultar/copiar material deve ser registrado e tratado sem presumir autorização para uma mudança estrutural.
- Não remover conteúdo avançado ou recursos existentes para reduzir o plano. Adiar sua manutenção até que sejam necessários.
- Não publicar, enviar alterações ao remoto ou limpar arquivos sem autorização específica.
- Código em inglês; interface, cartões e documentos em português.

### Onde editar (mapa inicial; confirmar a fonte e a precedência por campo antes da edição)
As fontes abaixo são pontos de partida. Antes de alterar `prompt`, `firstResponse`, `preparation` ou `hints`, rastreie a ordem efetiva de geração e de sobrescrita daquele campo e confirme a saída publicada; não presuma que `publication-overrides.json` prevalece sobre qualquer campo. No fluxo atualmente descrito, os overrides são aplicados antes de atribuições específicas da etapa: a lógica da etapa 00 pode sobrescrever `prompt`, `preparation` e `firstResponse`; a da etapa 01 sobrescreve `preparation` e `hints`; `firstResponse.action` é recalculado por `distinctFirstAction`, e `preparation`/`hints` também são regenerados para etapas 04+. Confirme a fonte efetiva no código antes de editar e depois confira o artefato gerado.

| Conteúdo | Fonte | Depois de editar |
|---|---|---|
| Etapas D–19: texto, kind, rubrica, review | `course-src/recipes/<etapa>.py`, `course-src/stages/<etapa>.txt`, `course-src/publication-overrides.json`, `course-src/prerequisite-primers.json` | `npm run build:curriculum` |
| Diagnóstico e etapas 00–03: preparação guiada | `course-src/diagnostic-preparation.mjs`, `stage00-preparation.mjs`, `stage01-preparation.mjs`, `stage03-preparation.mjs`, `build-stage00-preparation.mjs`, `guided-preparation.mjs` (vale para 04+ também) | `npm run build:curriculum` |
| Starters, testes e soluções 04–14 | `course-src/starters/<id>/`, `course-src/tests/<id>.test.js`, `course-src/solutions/<id>/`, `course-src/mutants/`; avaliações direto em `course-src/assessments.json` (não há gerador para 04–14) | `npm run build:curriculum` |
| Avaliações 15–19 | Geradas por `scripts/task-8b-stage15.mjs` e `scripts/task-8b-stages16-19.mjs`. **Não** editar as entradas 15–19 de `assessments.json` à mão | Rodar o gerador, depois `npm run build:curriculum` |
| Etapas 20–23 (tudo) | `scripts/task-9-stage20.mjs` … `task-9-stage23.mjs` e demais `scripts/task-9-*.mjs` | Para regenerar, execute `node scripts/task-9-canonical-regeneration.mjs` somente em cópia temporária cujo diretório atual esteja sob `os.tmpdir()`; preserve e respeite o guard do script. Não rode no checkout de trabalho nem edite `course-src/assessments.json` diretamente: a regeneração sobrescreve. Compare o resultado antes de incorporá-lo. |
| Qualquer arquivo em `public/` | — | `npm run assets:version` |

## Mapa de execução após esta revisão

| Fases | Situação | Trabalho esperado |
|---|---|---|
| 1–10 | Histórico preservado | Reabrir somente se surgir regressão concreta ou evidência de erro. |
| 11–16 | Reduzidas, conforme avanço do estudo | Resolver problemas que impedem praticar ou ensinam errado. |
| 17–19 | Reduzidas e adiadas | Conferir conteúdo avançado quando o proprietário chegar a ele. |
| 20 | Fechamento leve | Conferir material consultável/copiável e prática na máquina do proprietário; salvamento somente se usado. |
| 21–22 | Dispensadas como fases independentes | Usar as regras simples de clareza e material adequado deste documento. |
| 23 | Campanha formal dispensada | Preservar acessibilidade existente e resolver dificuldades reais de uso. |

## Revisão curricular das etapas 00 e 01 — estudo com IA e execução local

**Escopo autorizado em 19/10/2026:** incorporar ao plano as revisões das etapas 00 e 01 discutidas na conversa, já filtradas pelo uso externo com IA, editor, terminal e navegador locais. Esta seção complementa o lote da fase 9 sem reescrever seu histórico, renumerar as 23 fases ou criar uma nova fase de plataforma. Não se aplica às demais etapas.

**Estado desta solicitação:** ajuste documental. A árvore já contém alterações locais em `course-src/recipes/00.py`, `course-src/recipes/01.py`, `course-src/stage00-preparation.mjs`, `course-src/stage01-preparation.mjs` e artefatos gerados. Algumas correspondem às propostas abaixo; preservá-las e conferir o estado efetivo antes de implementar qualquer coisa. Presença de texto na fonte não comprova execução local, publicação ou conclusão de todos os critérios. As caixas abertas indicam conferência pendente, não autorização para refazer trabalho já presente.

### Etapa 00 — executar, observar e investigar

| Atividade | Revisão a incorporar ou conferir | Critério de conferência fora do site |
|---|---|---|
| 00.06 | Manter o primeiro exemplo guiado e oferecer uma segunda investigação curta sem indicar a linha ou a causa. Solicitar erro observado, hipótese, uma alteração e nova execução. Usar apenas chamadas e valores já apresentados; não antecipar funções ou pilhas de chamadas complexas. | O material permite executar o trecho intacto e comparar a saída final com um alvo explícito. O aluno consegue explicar a relação entre a alteração e o resultado, com apoio da IA se necessário. |
| 00.06 | Reforçar a diferença entre falha de sintaxe, erro durante a execução e saída incorreta sem exceção, usando três trechos pequenos com resultados/categorias para conferência após a tentativa. | As três situações podem ser reproduzidas localmente; a explicação não confunde erro de análise com execução parcial nem trata ausência de exceção como solução correta. Não exigir mensagem literal idêntica entre ambientes. |
| 00.02 / 00.06 | Acrescentar ou reaproveitar um cenário textual de arquivo errado: dois arquivos com mensagens diferentes, alteração em um e execução do outro. Pedir que o aluno confira nome, pasta e comando antes de editar a lógica. | Os nomes dos arquivos, o comando e a saída esperada são suficientes para reproduzir a situação na máquina local. Não construir simulador de terminal ou gerenciador de arquivos no site. |
| Fechamento da etapa | Reaproveitar as três chamadas já ensinadas para orientar a execução em arquivo local ou console real, indicando a diferença entre código digitado e saída. Se usar Node, explicar pasta do arquivo, salvamento e `node main.js`; usar o ambiente já disponível, sem transformar instalação em bloqueio. | O aluno consegue levar o código para fora do site e reconhecer as mensagens produzidas. O exercício pode ser discutido com IA e não depende de botão Run ou nota do site. |
| 00.09 | Alinhar a classificação editorial à escrita do programa: MAKE, preservando o ID, o contrato de quatro mensagens, a mudança de quantidade 3 para 0 e as transferências existentes. A alteração para MAKE já foi encontrada na receita local; conferir o catálogo efetivo antes de considerar concluído. | Enunciado, material e classificação concordam. As quatro mensagens e a variante com zero têm resultado definido; não reabrir a alegação antiga de que só existem três saídas na preparação atual. |

- [ ] Conferir o material atual dos itens acima e completar somente o que ainda faltar para estudo local.
- [ ] Registrar a conferência das categorias/saídas dos trechos efetivamente acrescentados, sem criar uma suíte de avaliação interna.

### Etapa 01 — valores, reatribuição e texto derivado

| Atividade | Revisão a incorporar ou conferir | Critério de conferência fora do site |
|---|---|---|
| 01.02 | Reforçar a cópia do valor primitivo no momento da inicialização: pedir a previsão de `base` e `total` depois de alterar somente `total`, com outra entrada curta. Reaproveitar a tabela e as explicações existentes. | A previsão e a execução mostram que alterar `total` não altera `base`. Não generalizar a explicação para objetos nem exigir nova visualização interativa. |
| 01.04 | Transformar em comparação prática a distinção já explicada entre convenção e regra da linguagem: `let` para um nome não reatribuído pode funcionar; tentar reatribuir `const` provoca erro. | Enunciado deixa claro quando exige a convenção de usar const. A explicação não afirma que JavaScript proíbe let em valores fixos; 0 e false permanecem valores válidos. |
| 01.04 / 01.08 | Ajustar ajuda que entrega a escolha cedo demais. A primeira pista pede procurar reatribuições; a seguinte ajuda a comparar declarações e usos. Evitar nomear imediatamente todos os bindings corretos, especialmente na transferência 01.08. | O texto preserva a decisão do aluno antes de fornecer a resposta. Não impor analogia na terceira pista nem proibir referências úteis a linhas/nomes. A ajuda da IA continua permitida, sem criar telemetria ou bloqueio de domínio. |
| 01.07 | Alinhar o campo de modelo mental à preparação: a template literal avalia expressões e produz uma string; guardar o resultado não cria atualização automática. Substituir a explicação que apenas define MAKE. A alteração já aparece na receita local; conferir as fontes efetivas e o catálogo. | Modelo mental, exemplo e enunciado explicam a mesma regra. Preservar formato, espaços e resultados publicados, inclusive os casos com zero. |
| 01.09 | Converter o exemplo já existente sobre string calculada em uma tentativa curta com outros dados: imprimir uma string guardada, mudar o valor de origem, imprimi-la novamente e comparar com uma nova template literal. Solicitar previsão antes da execução e fornecer conferência separada da tarefa. | A string guardada conserva o texto anterior; a nova expressão reflete o valor atualizado, incluindo zero. Reaproveitar as duas transferências existentes, sem criar novas funções ou alterar o executor. |
| Revisão posterior | Acrescentar ou reaproveitar uma prática curta em outro dia: escolher const/let e imprimir dois estados de uma configuração com dados diferentes. Pode ser uma orientação de texto no fechamento da etapa, com saída esperada e justificativa da escolha. | A tarefa pode ser copiada e feita localmente. Sugerir tentativa antes de pedir pista à IA, sem proibir ajuda, exigir agendamento automático, registrar tentativas externas ou inventar certificado de retenção. |

- [ ] Conferir o texto atual, incluindo as alterações locais preexistentes, e completar somente as lacunas dos itens acima.
- [ ] Conferir exemplos e resultados novos no runtime local pertinente; para ajustes apenas explicativos, verificar coerência entre enunciado, exemplo e gabarito.

### Apontamentos descartados ou já atendidos no escopo 00–01

- Não renomear `material.md` nem adaptar o runner apenas para permitir execução dentro do site. Quando o aluno precisar criar um arquivo local, basta indicar o nome e o conteúdo adequados; corrigir uma extensão somente se ela tornar incorreta a instrução de execução local.
- Lacunas `___` em FADED são intencionais quando o texto ensina como preenchê-las; não exigir starter executável antes do preenchimento nem tratar sua incompletude como defeito de infraestrutura.
- Ensinar que `typeof null` devolve `"object"` e `typeof NaN` devolve `"number"` é preparação legítima. Não esconder a regra para obrigar descoberta por tentativa nem remover conteúdo correto sob o rótulo genérico de spoiler.
- A preparação atual de 00.09 já define quatro saídas e a variante com zero; 01.09 já oferece duas transferências com resultados definidos. Reutilizar esse material e corrigir apenas inconsistência efetivamente encontrada.
- O exemplo guiado inicial de 00.06 é mantido; a autonomia vem da segunda tentativa. A regra de string calculada já aparece em 01.07/01.09; reforçá-la com prática, sem duplicar a explicação inteira.
- Não adicionar suporte interno a JavaScript/TypeScript, corretores, seletores, tabelas interativas, simuladores, exportadores ou controles de ajuda. Não antecipar DOM, funções, segurança de URLs ou funcionamento interno da engine para atender estas revisões.

**Saída desta revisão curricular:** material correto, compreensível e suficiente para copiar, discutir com IA e praticar localmente. Na execução futura, preservar IDs, ordem, progresso e alterações locais; modificar somente as fontes de conteúdo necessárias de 00/01, conferir a geração pertinente e registrar limites. Este ajuste do plano não conclui os itens acima, não altera exercícios, não executa as fases e não publica o site.

## Correções curriculares executadas nas etapas 02–05 — 19/10/2026

**Autorização:** corrigir as etapas 02–05 conforme a análise da conversa. Trabalho limitado às fontes de conteúdo, material inicial de 05.03, rubrica de 05.14, artefatos derivados e verificação focal; sem adaptar a estrutura ou os executores do site.

| Etapa | Correções e reforços incorporados |
|---|---|
| 02 | Mantidos os blocos e IDs existentes. A Ponte 02B retoma ausência, validade e resultados não booleanos de operadores com previsões e conferência local, antes de Number/Math. |
| 03 | Material de FizzBuzz copiável em blocos no arquivo inicial; comparação entre < e <=; investigação adicional de progresso com três passagens limitadas; orientação Ctrl+C para a execução local do while; previsão de um único turno antes da batalha. Mantidos esqueleto de fila, formatos e verificadores existentes. |
| 04 | Exemplos de 04.01 alinhados às chamadas reais; 04.07 esclarece Math.round sobre o produto Number e publica o contraexemplo 100 × 0.145, sem exigir validação externa; 04.08 explica comparação aproximada e retira validação indevida do gabarito. Acrescentadas investigação de retorno, rastreamento dos três caminhos de leitura/parse/limpeza e orientação local de módulos. |
| 05 | Starter 05.03 entrega blocos A–E e distrator X, com saída por hífen; 05.13 explica a captura parcial ome sem flag i; 05.14 justifica parser por clareza/manutenção/diagnóstico, sem afirmar impossibilidade geral de regex. 05.08 mantém o contrato aberto a níveis não vazios, sem restringir o vocabulário a INFO/WARN/ERROR, e preserva o restante da mensagem. Acrescentadas retomadas de acumuladores, ordenação numérica/textual, delimitadores em mensagens, formato versus validade de data e blocos de estudo, com orientação de execução local. |

**Verificação desta rodada:** os quatro testes novos de contrato falharam antes das correções e passaram após a geração. O conjunto focal de conteúdo e etapas 02/03 passou 106/106; o teste focal de 02-05 passou 14/14 após a última rodada; as referências 04/05 passaram 134/134 casos no Node 26.7.0 usando o runtime de asserções existente. Geração curricular, validação do catálogo, conferência de 21 checkpoints locais e check de versões de assets passaram. O validador da fonte reportou zero erros e cinco avisos de sintaxe em 01.08, fora do escopo e em material previamente modificado. A comparação com o snapshot desta rodada confirmou os 310 IDs na mesma ordem, alterações do catálogo apenas em 02–05 e preservação byte a byte das modificações anteriores de 00/01. Revisão independente identificou a necessidade de explicitar a substituição do nome importado na instrução local de 04; texto ajustado.

**Limites:** os testes locais utilizaram Node 26.7.0, não demonstram homologação integral no Node 24 do baseline. Não foi feita observação visual em navegador, suíte global, medição de aprendizagem ou publicação. Formatos, APIs, avaliações existentes e histórico das fases 1–10 preservados; não houve instalação de dependências, commit ou push. O teste focal adicional está em `scripts/test-stages02-05-content.mjs`.

## Plano de correção das etapas 06–10 — 19/10/2026

**Autorização e estado:** incorporar ao plano a análise das etapas 06–10 feita nesta conversa. Este ajuste é **documental**: não altera exercícios, testes, fontes, IDs, ordem, progresso, runners ou publicação. As correções abaixo ficam pendentes até uma execução explícita. A auditoria de 14/10/2026 é tratada como pista, não como prova: vários achados já foram corrigidos e outros descrevem o artefato antigo.

**Diagnóstico que orienta o plano:**

- O problema principal não é carga cognitiva; é contrato entre enunciado, starter, exemplo e teste.
- Nas etapas 06–10, os cinco `PARSONS` (`06.03`, `07.03`, `08.02`, `09.02`, `10.02`) não têm blocos reais no catálogo. O editor recebe um `main.js` completo e, pelo código atual, todos os cinco starters contradizem a suíte.
- `07.06`, `09.01` e `10.06` ensinam ou exigem comportamento diferente do teste. São os três P0.
- `08.01` contém as respostas literais; `08.04` promete um terceiro trecho ausente; `07.10` mantém texto antigo em `checks.scoring`.
- `edgeCases` e `checks` fazem parte do catálogo. Antes de declarar “contrato oculto”, conferir esses campos; várias críticas da auditoria caem por já estarem publicadas.
- Testes verdes da solução não provam que o starter está correto. A verificação precisa comparar starter, exemplo, teste e fonte efetiva.

**Decisão sobre `PARSONS`:** não construir uma interface de blocos, conforme o escopo deste plano. Para cada atividade, escolher uma das opções:

1. **Manter `PARSONS`** somente se o cartão exibir blocos copiáveis e o starter não for a solução completa; o aluno monta a ordem localmente e o teste avalia o resultado.
2. **Reclassificar** para `DEBUG` quando o starter for uma solução quase pronta com um defeito; para `FADED`/`MAKE` quando for esqueleto ou implementação guiada.

Preservar ID, posição, carga e vínculos conceituais; atualizar `kind`, prompt, `preparation`, exemplos e avaliação na mesma rodada. Não criar ID novo para contornar a classificação.

### Correções por etapa

| Etapa | ID | Ação planejada | Conferência fora do site |
|---|---|---|---|
| 06 | `06.01` | Alinhar o exemplo ao starter e ao teste: usar `base/alias/copia` (ou renomear o código e o teste para `a/b/c`), mantendo a saída em objeto. | Executar o starter e comparar `2,2,1`, `false,false` e as identidades `mesmaRaiz`/`mesmoMeta`; conferir o exemplo publicado. |
| 06 | `06.03` | Reclassificar como `DEBUG` (preferencial): manter `senha` como o defeito no starter e pedir que o campo seja removido, pois ele não deve atravessar a fronteira. Alternativa: `MAKE` com esqueleto. Não manter “Ordene os blocos” sem blocos. | `normalizar({id,nome,senha})` deve devolver somente `{id,nome}`; `edgeCases` de campo extra e nome vazio devem coincidir. |
| 06 | `06.08` | Se quiser fechar “corrupção”, acrescentar casos públicos para `{version:2,audio:null}` e `version:"2"`; definir defaults e manter o teste atual. | Rodar JSON inválido, v1 sem volume, versão futura e os dois novos casos; conferir a matriz de decisões. |
| 07 | `07.03` | Reclassificar como `DEBUG`: o starter ascendente é o defeito; pedir correção para pontos decrescentes e nome crescente. Explicitar que a saída é a lista de IDs por partida, não um ranking agregado por jogador. Alternativa: fornecer blocos A–D reais. | Conferir `['y','x']`, ordem `top/middle/low` e desempate `Ágata/Bruno`; confirmar que a entrada não é mutada. |
| 07 | `07.06` | **P0.** Corrigir o starter para somar por categoria (`(resultado[categoria] ?? 0) + preco`) e preservar chaves especiais. Manter o teste atual, que também exige `__proto__` próprio e protótipo comum. Atualizar qualquer texto que descreva o starter errado. | `A=5`, `B=4`, preço zero, `toString`/`constructor`/`__proto__` e `1`/`'1'`; executar o teste focal. |
| 07 | `07.06` | Reforço sem novo ID: acrescentar à preparação um trace curto do acumulador antes da refatoração. Não transformar o exercício em aula completa de `reduce`. | O aluno consegue dizer o acumulador inicial, o retorno de cada passo e por que a categoria repetida soma. |
| 07 | `07.10` | Corrigir `checks.scoring`: trocar `pedido.cancelado` por `pedido.status === "ativo"`. Solução e teste já estão corretos; conferir também `preparation.materials`. | Gerar o catálogo e conferir que o texto de entrega esperada não contradiz o teste. |
| 07 | `07.02`, `07.09` | Traduzir `compatibility`/hint em inglês quando forem exibidos ao aluno. Não reescrever o conteúdo técnico. | Conferir o catálogo publicado; manter a mesma semântica. |
| 08 | `08.01` | **P1.** Substituir o array `analises` com respostas literais por snippets de código e campos `crescimento` em branco; o teste/assessment deve comparar a previsão com a classificação canônica, não apenas ler o array pronto. Corrigir “Set.has médio” para `O(1) médio` no material e na expectativa. | Conferir PREDICT, tabela de previsão, snippets e os oito crescimentos; executar o fluxo antes/depois. |
| 08 | `08.02` | **P1.** Antes da atividade, acrescentar uma retomada linear de recursão (sem novo ID) ou uma ponte curta. Reclassificar para `FADED`/`MAKE` ou fornecer blocos reais. Definir folha como `null` e `somar(null) = 0`; normalizar ramos ausentes com `?? null`. | `somar(null) = 0`, nó único `-2 = -2`, árvore do exemplo `17`; conferir a ordem B/C e a explicação da dependência. |
| 08 | `08.04` | Completar o terceiro trecho (dois ponteiros) ou retirar a promessa do prompt; explicitar a invariante semiaberta `[inicio,fim)`. Não é necessário criar teste executável para uma atividade `READ`. | Conferir que os três trechos existem no material e que a invariante aparece no texto; conferir o caso de array vazio. |
| 08 | `08.07` | Alinhar o retorno de destino inalcançável: usar `null` (coerente com `08.08`) ou trocar o `edgeCases` para `[]`. Acrescentar o caso ao teste se o comportamento for contrato. | `A -> D` reconstrói o caminho; `A -> X` devolve o valor escolhido; ciclo não revisita vértice. |
| 09 | `09.01` | **P0.** Corrigir o snippet: `bloco` nasce no bloco e `dentro` nasce dentro de `f`. Escolher um contrato coerente: devolver `dentro` por closure ou retirar `dentro` do objeto e testar `ReferenceError` fora de `f`. Não manter o híbrido atual. | Conferir `{fora:1,bloco:2,...}`, a soma e a tentativa de acesso fora do escopo; explicar a cadeia léxica. |
| 09 | `09.02` | **P1.** Reclassificar como `DEBUG`/`MAKE` ou fornecer blocos reais. Definir `depositar(0) = false` e usar `valor <= 0`; acrescentar a política ao prompt/`edgeCases`. | Zero, negativo, positivo, consulta e isolamento entre contas; conferir o teste atual. |
| 09 | `09.04` | Alinhar o exemplo à sequência real do starter/teste: `a.inc()` e retorno `{a:1,b:0}`, ou mudar o starter para produzir a sequência publicada. Explicitar que `const r = a.read; r()` vê o `n` atual. | Executar a sequência e comparar; não exigir `this` para o método. |
| 09 | `09.08` | Repetir no prompt o que `edgeCases` já publica: `Object.is`, cancelamento idempotente, listener removido durante emissão e isolamento entre stores. O teste existente permanece. | Conferir o texto do cartão contra o teste; não criar contrato novo. |
| 10 | `10.02` | **P1.** Reclassificar como `DEBUG` (ou fornecer blocos reais). Normalizar `inicial` com `Math.max(0, inicial)`; manter zero/negativo como depósito inválido. | `new Cofre(-4).saldo === 0`, `depositar(0) === false`, `#saldo` inacessível. |
| 10 | `10.03` | Trocar `hasOwnProperty` por `Object.hasOwn` no teste/edge, se o runtime do exercício for Node 24; não é correção de comportamento. | Rodar o caso de chave própria e o de chave herdada. |
| 10 | `10.04` | Traduzir o `edgeCases` para português; conferir que o exemplo `[5,5]`/`[5,9]` continua correto. | Executar antes/depois da reatribuição de `obj`. |
| 10 | `10.06` | **P0.** Preferencial: fornecer a hierarquia real no starter e pedir a refatoração para composição, com funções puras. Alternativa: mudar título/prompt para “Corrija a composição” e remover a promessa de hierarquia. Em ambos, `mover/atacar/curar` devem devolver novo estado sem mutar a entrada. | Conferir o teste que exige novo objeto e estado original intacto; conferir que o vocabulário do exemplo corresponde ao código. |
| 10 | `10.07` | Manter. O cenário retângulo/quadrado é proposital para LSP; o notificador é o segundo eixo de variação. Não “corrigir” a aparente falta de relação entre os cenários. | Executar a troca de canal em runtime e o setter do quadrado; comparar com o contrato. |
| 10 | `10.09` | Manter. `edgeCases` já publica `RangeError` e `Object.keys`; não tratar como contrato oculto. | Conferir saldo, `id` não enumerável e erro para saldo negativo. |

### Itens que não devem ser reabertos nesta rodada

- `06.06`: é `COMPARE`; `04.12` já ensina `try/catch/finally`. Não criar nova ponte nem exigir `try/catch` novo.
- `06.07`: o teste e o prompt atuais cobrem `__proto__` como chave própria; `Object.create(null)` não é requisito.
- `07.01`: starter vazio, sem respostas prontas; a crítica antiga está desatualizada.
- `09.08`: teste e `edgeCases` existem; falta apenas eco no prompt.
- `10.01`: `PREDICT` com starter executável é normal; a previsão é registrada antes do Run.
- `10.09`: contrato visível em `edgeCases`.
- `08.08`: a Ponte 08 e `08.07` já preparam BFS; não criar outro projeto ou outra atividade de BFS.
- Não adicionar benchmarks em 08, nova atividade de merge recursivo em 06, nova atividade de `reduce` ou uma atividade extra de LSP em 10. Corrigir o material existente primeiro.

### Ordem de execução

1. Corrigir os P0 `07.06`, `09.01` e `10.06`.
2. Resolver os cinco `PARSONS`: blocos reais ou reclassificação para `DEBUG`/`FADED`/`MAKE`.
3. Corrigir `08.01`, `08.02`, `08.04` e o texto de `07.10`.
4. Aplicar as correções P2/P3 (exemplos, tradução, `Object.hasOwn`, `08.07`).
5. Criar/estender um teste focal de conteúdo para 06–10, nos moldes de `scripts/test-stages02-05-content.mjs`, cobrindo exemplos, starters que deveriam falhar, contratos de `PARSONS` e textos de entrega. Não criar gate de plataforma.
6. Regenerar o catálogo, conferir IDs/ordem e executar os testes locais pertinentes. Registrar limites e não publicar.

**Critério de saída:** cada atividade de 06–10 usada no estudo tem enunciado, exemplo, starter e teste coerentes; o aluno consegue copiar, discutir com IA e conferir o resultado localmente; nenhuma correção exige runner, bloco interativo ou corretor interno do site.

**Relação com os registros anteriores:** as frases “06.08 e 07.03 não mostraram defeito”, “07.06 reutiliza verificação anterior” e “10.06 agora explicita…” descrevem o estado daquelas rodadas e não o estado atual. A conferência de 19/10/2026 encontrou pendências; elas estão registradas acima e não invalidam as evidências históricas dos demais IDs.

## Plano de correção das etapas 11–15 — 19/10/2026

**Autorização e estado:** incorporar ao plano a auditoria das etapas 11–15 feita nesta conversa. Este ajuste é **documental**: não altera exercícios, testes, fontes, IDs, ordem, progresso, runners ou publicação. As correções abaixo ficam pendentes até uma execução explícita. A auditoria de 14/10/2026 é tratada como pista, não como prova: o estado atual foi conferido contra catálogo, starters, testes e soluções.

**Diagnóstico que orienta o plano:**

- O gate automático das atividades executáveis de 11–15 passou **51/51**; `13.03`, `13.07`, `13.09` e `13.13` também passaram no gate focal. Teste verde não prova que enunciado, starter, exemplo e referência estão coerentes.
- Quatro atividades declaram `PARSONS`, mas não entregam blocos: `11.02`, `12.02`, `13.02` e `14.02`. Apenas `15.02` tem blocos reais. Em `11.02`, o diretório `course-src/starters/11.02/` vence a receita; por isso o catálogo publica um `main.js`, não os blocos que a fonte sugere.
- `12.21` rejeita com `AbortError` quando a busca antiga é abortada por um fetcher que honra o sinal. O teste usa um fetcher que ignora o sinal, então não detecta a violação do contrato público de devolver `undefined` para a busca obsoleta.
- `13.14` deixa tags inválidas passarem quando a contagem de tarefas não muda e não emite aviso específico para tags inválidas em `migrarV2ParaV3`.
- `12.08` exige `profile.nome` e `stats.total` no teste e na solução, mas o contrato público não declara esses campos.
- `11.04` exige `result.valores.quantidade`; `12.06` exige `null`; `11.10` promete adicionar/mover/reload no exemplo, mas o teste cobre apenas `boot`, storage e `mover`.
- `11.01` e `11.11` têm exemplos que não correspondem ao artefato/teste; `11.08`, `14.08` e `15.08` têm pontes curriculares opcionais, não contratos escondidos.
- Vários registros antigos não devem ser reabertos: `12.03` já usa array; `12.04` foi corrigido; `11.12` publica o caso de string vazia; `13.13` usa `studentSuite`/mutação; `15.02` é Parsons real; `15.05` foi aposentado para `16.09`.

**Decisão sobre `PARSONS`:** manter `PARSONS` somente quando o cartão exibir blocos copiáveis e o starter não for a solução completa. Para `11.02`, `12.02`, `13.02` e `14.02`, preferir `DEBUG` — o starter já é uma implementação quase pronta — e reescrever prompt, exemplos, `edgeCases` e avaliação na mesma rodada. Alternativa: fornecer blocos reais A–D. Preservar ID, posição e vínculo conceitual; não criar ID novo. `15.02` permanece `PARSONS`.

### Correções por etapa

| Etapa | ID | Prioridade | Ação planejada | Conferência fora do site |
|---|---|---|---|---|
| 11 | `11.02` | P1 | Reclassificar para `DEBUG` e pedir correção de texto/remoção; ou fornecer blocos reais. Não manter “Ordene os blocos” com um `main.js` completo. | Remover somente o `li` acionado; texto hostil vira `TEXT_NODE`; executar o teste focal. |
| 11 | `11.01` | P2 | Alinhar o exemplo ao teste: o alvo `alvo` vem primeiro; evitar `<a href="#">` que navega. | Executar o clique e conferir foco, alvo e prevenção de navegação. |
| 11 | `11.04` | P1 | Publicar `result.valores` (nome, quantidade e interesses; ao menos `quantidade`) no prompt/edge cases, ou retirar a exigência do teste. Manter labels; acrescentar `legend` é melhoria P2. | Sucesso e falha com `{ok:false, erros:{quantidade}, valores:{quantidade:'2x'}}`; conferir DOM local. |
| 11 | `11.08` | P2 | Acrescentar uma ponte curta de `localStorage` antes do projeto. O teste já cobre formulário, label, colunas, `aria-live`, inclusão, persistência e recarga; não há requisito de remoção. | Salvar, recarregar e recuperar; conferir que a ausência de `lang`/`title`/`h1` é dívida editorial, não falha funcional. |
| 11 | `11.10` | P1 | Escolher: reduzir exemplo/teste a módulos e remover a promessa de adicionar/mover/reload, ou implementar e testar a interface. O starter já está separado em `state.js`, `view.js` e `main.js`. | `mover` puro, storage inválido, `boot` e os controles que o enunciado prometer; não inventar UI não exigida. |
| 11 | `11.11` | P2 | Alinhar o exemplo ao artefato real (`div`/`button`, não `ul`/link). | Executar o clique e conferir o HTML publicado. |
| 11 | `11.12` | — | Não reabrir: string vazia como nó de comentário é edge case público, não contrato escondido. | Casos de texto hostil, quebra de linha e vazio já publicados. |
| 12 | `12.02` | P1 | Reclassificar para `DEBUG` ou fornecer blocos reais. Corrigir `tentativa <= max` e a espera após a última tentativa. | Com `max=2`, contar exatamente duas chamadas e esperar somente entre falhas. |
| 12 | `12.03` | — | Não reabrir: o contrato atual usa array e está coerente com exemplo, teste e solução. A alegação de “objeto nomeado” é histórica. | Conferir `[1,2,3]` e a ordem das chamadas paralelas. |
| 12 | `12.06` | P1 | Publicar que a busca obsoleta/abortada devolve `null`, ou aceitar `undefined` no teste. Preferir declarar `null` no contrato. | Busca antiga obsoleta e abortada; conferir que o `AbortError` não chega ao usuário. |
| 12 | `12.08` | P0 | Publicar `profile.nome: string` e `stats.total: number` finito no prompt/edge cases, ou remover a validação correspondente. Acrescentar caso de payload inválido. Manter o `WeakMap` por identidade do fetcher, que é contrato explícito. | Sucesso com `{nome}`, `{total}`; JSON inválido, HTTP, timeout, cancelamento e busca antiga. |
| 12 | `12.21` | P0 | Capturar/ignorar a rejeição da busca antiga abortada e garantir retorno `undefined`. Adicionar teste com fetcher que honra o `signal`, não apenas o que ignora. | Busca nova resolve; busca antiga resolve `undefined`, sem `AbortError` não tratado. |
| 13 | `13.02` | P1 | Reclassificar para `DEBUG`/`FADED` ou fornecer blocos reais. O starter é `return dividendo/divisor`; acrescentar guardas de `NaN`/`Infinity` e divisor zero. | `TypeError` para `NaN`/`Infinity`; `RangeError` para zero; caso válido. |
| 13 | `13.03`, `13.07`, `13.09` | — | Não reabrir: `studentSuite: true` avalia a suíte submetida contra referência e mutantes; o teste mínimo do starter é intencional. | Gate focal já passou; manter o mecanismo. |
| 13 | `13.13` | — | Não reabrir: a suíte de referência é `course-src/tests/13.13.test.js`; o starter tem apenas um teste fraco, mas a avaliação usa a suíte do aluno e mutação. | Gate focal passou; não exigir suíte completa no starter. |
| 13 | `13.14` | P0 | Normalizar/validar tags V3 mesmo quando a contagem de tarefas não muda; emitir aviso específico para tags inválidas em `migrarV2ParaV3`. | `carregar` com `tags:['']` deve normalizar e avisar; testar o aviso, não só a existência de warnings do registro parcial. |
| 14 | `14.02` | P1 | Reclassificar para `DEBUG` ou fornecer blocos reais; validar comando, imprimir uso e retornar status 2. | Sem argumentos, comando inválido e domínio inválido; conferir `exitCode`. |
| 14 | `14.08` | P2 | Acrescentar uma ponte curta sobre arquivo temporário + `rename` antes do projeto. A exigência é pública; não é contrato escondido. | Escrita atômica, JSON inválido e ausência de arquivo parcial. |
| 15 | `15.02` | — | Manter: é o único `PARSONS` real, com blocos e distrator; teste cobre default e limites. | Ordenar os blocos e validar `3000`, `1` e `65535`. |
| 15 | `15.05` | — | Não reabrir: foi aposentado e redireciona para `16.09`. | Conferir o redirecionamento no catálogo. |
| 15 | `15.08` | P2 | Acrescentar uma ponte curta de estratégia de migração JS→TS. Teste, solução e starter estão coerentes; não há bug confirmado. | Conferir `paginacao.ts` e a migração incremental. |

### Itens que não devem ser reabertos nesta rodada

- `12.03`: array e ordem já são o contrato corrente; a crítica de objeto nomeado descreve o artefato antigo.
- `12.04`: a sequência `A,B,P1,Q,P2,T` já foi corrigida e verificada.
- `11.12`: string vazia como nó de comentário é caso público; o starter com `innerHTML` não é contrato escondido.
- `11.10`: a crítica de XSS não se sustenta porque a view usa `textContent`; a pendência real é escopo/exemplo, não segurança.
- `11.04`: os labels já existem; a pendência é o formato oculto de `valores` e, no máximo, o `legend`.
- `13.03`, `13.07`, `13.09`, `13.13`: `studentSuite: true` e mutação são o mecanismo vigente; não migrar runner nem exigir suíte completa no starter.
- `15.02`: Parsons real; `15.03`, `15.04`, `15.07` e `15.11`: testes e soluções coerentes no estado atual.
- `15.05`: aposentado para `16.09`; não é lacuna.
- `12.18`: `limite <= 0` não está no contrato nem nos testes; não criar caso retroativo.
- `11.08`: não há requisito de remoção; o teste forte existente não deve ser “corrigido” para incluir uma operação não pedida.
- `14.08`: gravação atômica é exigência pública; a lacuna é apenas de sequência pedagógica.

### Ordem de execução

1. Corrigir os P0 `12.21`, `13.14` e publicar o schema de `12.08`.
2. Resolver os quatro `PARSONS`: `DEBUG` com prompt reescrito ou blocos reais; manter `15.02`.
3. Publicar ou alinhar os contratos P1 de `11.04`, `12.06` e `11.10`.
4. Aplicar as correções P2 de exemplos e pontes (`11.01`, `11.11`, `11.08`, `14.08`, `15.08`).
5. Criar/estender um teste focal de conteúdo para 11–15, nos moldes de `scripts/test-stages02-05-content.mjs`, cobrindo starters que deveriam falhar, contratos de `PARSONS`, schemas e textos de entrega. Não criar gate de plataforma.
6. Regenerar o catálogo, conferir IDs/ordem e executar os testes locais pertinentes. Registrar limites e não publicar.

**Critério de saída:** cada atividade de 11–15 usada no estudo tem enunciado, exemplo, starter e teste coerentes; o aluno consegue copiar, discutir com IA e conferir o resultado localmente; nenhuma correção exige runner, bloco interativo ou corretor interno do site. Em particular: `12.21` devolve `undefined` para busca obsoleta; `13.14` normaliza/avisa tags inválidas; `12.08` tem schema público; os quatro `PARSONS` foram resolvidos; `11.04`, `12.06` e `11.10` não dependem de requisito oculto.

**Limites desta conferência:** verificação local em Node, com **51/51** testes automáticos de 11–15 e reproduções focais de `12.21` e `13.14`; não houve Chromium, suíte global, edição de conteúdo, commit, push ou publicação. O gate verde não classifica os achados acima como falhas de execução.

**Relação com os registros anteriores:** as frases “12.02/12.05/12.06 não apresentaram defeito” e “12.15–12.21 não foram auditados”, na Fase 13, descrevem aquela rodada; a auditoria de 19/10/2026 encontrou pendências em `12.02`, `12.06` e `12.21`. Em `13.14`, a correção da Fase 4 tratou a fixture/teste, mas o bug de tags permanece. Em `11.04`, o ajuste de `assertionCases` não publicou o formato de `valores`. `13.13` continua sem defeito, agora com o mecanismo `studentSuite` confirmado. `15.05` está aposentado, não ausente. Essas atualizações não invalidam as evidências históricas dos demais IDs.

## Plano de correção das etapas 16–23 — 19/10/2026

**Autorização e estado:** a revisão inicialmente documental foi executada em 19/10/2026, por solicitação do proprietário, com subagentes GPT-6 Luna e revisão independente. Foram corrigidos os itens de material e preparação local descritos abaixo; as verificações e seus limites estão no registro de execução ao fim desta seção. Preservadas as alterações locais anteriores, as revisões 00–15, IDs, ordem, progresso e o histórico das 23 fases. Não houve commit, push ou publicação.

**Fluxo de estudo:** consultar/copiar o material, discutir com IA e executar ou verificar tipos na própria máquina. Não criar runner, sandbox, terminal integrado, corretor, nota automática, exportador ou interface específica. Uma lacuna de material para execução local merece correção; uma limitação do executor do site não cria tarefa de plataforma.

**Base da análise documental anterior:** comparação do catálogo com fontes, arquivos iniciais e referências, usando a auditoria de 14/10 como pista. Verificação pontual em memória com TypeScript 6.0.3 confirmou `unknown` nas propriedades de Flags<User> do starter 19.01 e no resultado de ElementOrSelf<number> do starter 19.02. Execução pontual da referência 20.08 no Node 26.7.0 confirmou duas iterações repetíveis para uma fonte array e a segunda vazia para o mesmo generator. Essa análise inicial não foi um teste integral dos oito estágios; a evidência nova está registrada abaixo.

### Correções de material e contratos

P1 indica inconsistência que pode ensinar uma resposta errada ou bloquear a prática local; P2 indica clareza ou reforço pedagógico. Reconfirmar o arquivo efetivamente publicado antes de implementar, para não refazer uma correção de outra rodada.

| Etapa | ID ou trecho | Prioridade | Ação planejada | Conferência fora do site |
|---|---|---|---|---|
| 16 | `16.06` | P1 | Alinhar os exemplos de Status/idle ao starter de NIVEIS/Nivel com leitor, editor e admin. Manter derivação a partir da lista real e separar restrição estática de congelamento runtime. | Os valores aceitos/rejeitados correspondem aos nomes do arquivo; Object.isFrozen não é inferido de as const. |
| 16/17/19 | `16.08`, `17.08`, `19.08` | P1 | Completar a preparação local dos pacotes: os tsconfigs pedem types node, mas os package.json publicados não declaram TypeScript/@types/node. Declarar versões coerentes, comandos e lockfile quando necessários; retirar uma dependência de tipos somente se os arquivos/testes realmente não precisarem dela. | Copiar o pacote para pasta isolada, preparar dependências declaradas e executar typecheck/testes pelos comandos fornecidos, sem aproveitar node_modules do repositório principal. Distinguir execução de .ts por Node de checagem estática por tsc. |
| 17 | `17.02` | P1 | Resolver o desencontro entre PARSONS e declarações sem blocos. Preferir tarefa de modificação de assinaturas se esse for o objetivo; manter PARSONS somente com blocos textuais copiáveis. Não acrescentar implementação completa com Map apenas para preencher o formato. | pair preserva os dois papéis de tipo; Repository conserva a entidade específica e a relação do ID; assinaturas e exemplos usam os mesmos nomes. |
| 18 | `18.02` | P1 | Alinhar o exemplo update ao nome aplicarPatch e aos dados Usuario/Perfil. Fornecer blocos textuais se mantiver PARSONS; caso contrário, descrever a modificação de patch:any com clareza. | Patch de primeiro nível altera somente o contrato declarado; um objeto aninhado é substituído por inteiro, sem promessa de deep merge. |
| 19 | `19.01` | P1 | Alinhar o starter de previsão ao contrato booleano já publicado: o arquivo atual usa unknown enquanto exemplo/referência usam boolean. Manter a previsão como previsão, sem exigir transformação não anunciada. | A expansão literal do tipo efetivamente entregue concorda com o gabarito para id/name/active; não reprovar unknown quando esse ainda for o starter fornecido. |
| 19 | `19.02` | P1 | Entregar blocos para ordenar ElementOrSelf, com readonly (infer U)[] e ramo falso que preserva T, conforme os exemplos publicados. Identificar unknown como distrator se usado. | Arrays mutáveis, tupla readonly, escalar e união produzem os tipos esperados; preservar o ID e não criar controle interativo. |
| 19 | `19.06` | P1 | Trocar a expansão a/b/c pelos campos theme/retries do arquivo real. Conferir a política de opcionalidade e undefined nos modos declarados, reaproveitando a correção anterior da rubrica. | Type tests usam Settings e a configuração efetiva; separar remover opcionalidade de remover um union explícito com undefined. Não substituir uma configuração por outra silenciosamente. |
| 20 | Ponte 20 e `20.08` | P1 | Retirar a regra geral de que todo for...of cria cursor novo. Distinguir coleção reiniciável, instância de generator e fábrica de generators; delimitar em que fonte a segunda iteração é independente. Manter propagação de return e ausência de pull extra. | Array pode repetir valores; a mesma instância de generator pode estar consumida. Testar take(0), entradas descartadas pelo filtro, número de pulls e fechamento antecipado sem impor reinício a uma fonte de uso único. |
| 21 | `21.07` | P1 | Alinhar o pedido de 100 eventos ao starter que simula quatro e aos respectivos horários esperados. Escolher um cenário principal ou apresentar os dois explicitamente, com espera e políticas leading/trailing. | Cada cronograma tem sua própria saída prevista. Conferir um evento exatamente no limite e distinguir debounce de throttle. |
| 22 | Ponte 22 / `22.09` | P2 | Corrigir a frase de que todo export exige retorno explícito em isolatedDeclarations: há expressões triviais inferíveis. Manter o exercício de anotar exports que realmente dependam de análise adicional. | Um export simples inferível e outro que exige anotação demonstram a diferença na versão de TypeScript escolhida. Não criar regra de anotar todo tipo do projeto. |
| 22 | `22.06` | P1 | Completar a parte de schema que o enunciado pede, mas que o material atual não entrega: escolher biblioteca e versão ou explicar como usar uma já declarada, fornecer passos locais e aplicar os mesmos dados ao guard e ao schema. | A comparação pode ser reproduzida na máquina local e separa coerção, validação e inferência. Mensagens não precisam ser literalmente iguais entre bibliotecas; não instalar dependência nesta revisão documental. |
| 23 | `23.07` | P1 | Fornecer ao aluno um comando completo de checagem/teste ou configuração local suficiente para o pacote inicial, que não traz scripts de teste/typecheck nem tsconfig. Reaproveitar o baseline do capstone quando aplicável. | O pacote copiado pode ser conferido sem configuração implícita do repositório principal; usuário comum não grava, admin reabre e falha não persiste estado/auditoria parcialmente. |
| 23 | `23.09` | P1 | Resolver a contradição entre o prompt que proíbe causa técnica nos logs e o exemplo/rubrica/referência que preservam causa redigida no log interno. Publicar a distinção entre resposta pública, log interno e segredo. | A resposta pública omite detalhes internos; logs preservam contexto útil com segredos redigidos, inclusive em campos aninhados, sem mutar a entrada. Não apagar toda causa apenas para satisfazer uma frase ambígua. |

### Reforços pedagógicos proporcionais

Os itens abaixo são práticas curtas dentro do material existente, sem novos IDs ou requisitos de plataforma. Reaproveitar exemplos já presentes e não transformar cada proposta em outro projeto obrigatório.

| Etapa | Onde | Melhoria proposta | Evidência de compreensão |
|---|---|---|---|
| 16 | `16.05`, `16.06`, antes de `16.08` | Comparar predicate correto com outro que promete mais do que verifica; contrastar as const com congelamento runtime; rastrear duas transições válidas e uma incompatível usando a política já declarada. | Explicar por que um predicate mentiroso compila, por que a marcação estática não congela dados e qual estado cada ação produz. Não construir tela de upload. |
| 17 | `17.01`/`17.06`, `17.08` | Comparar assinatura que perde informação com assinatura que a preserva. No cache, isolar primeiro valor undefined armazenado versus ausência e só depois integrar TTL. | Justificar generic/union/concreto por relação útil; usar has para distinguir presença quando get devolve undefined e testar exatamente o instante de expiração. |
| 18 | `18.02`, `18.06`, `18.08` | Demonstrar substituição rasa de um objeto aninhado, acrescentar uma rota e observar os tipos derivados; contrastar objeto estaticamente aceito com JSON externo inválido. | Distinguir derivação, restrição estática, merge runtime e validação. Não exigir tipos derivados quando um alias explícito pequeno é mais claro. |
| 19 | Antes de `19.08` e junto de `19.07` | Praticar registro/emissão/remoção para um evento concreto antes de generalizar; comparar conditional distributivo e em tupla com tipos pequenos. Perguntar que mudança na fonte a abstração acompanha e qual alternativa simples existe. | Explicar Events[K], o efeito da distributividade e o custo da abstração. Manter o orçamento de complexidade; não acrescentar type-golf nem exigir domínio universal de toda técnica avançada. |
| 20 | `20.04`, `20.08` | Mostrar Proxy/Reflect em exemplo mínimo antes de depurar recursão; comparar array, generator criado e fábrica; separar pulls, descartes, entregas e fechamento. | Escolher Proxy versus update explícito pelo contrato e explicar por que duas saídas filtradas podem exigir mais de duas entradas. |
| 21 | `21.03`, `21.05`, `21.07` | Declarar hipótese antes de medir, confirmar resultados equivalentes e incluir envio/retorno no custo de Worker; usar linha do tempo para debounce/throttle. | Distinguir tempo total de responsividade e evitar conclusão universal a partir de poucas amostras. Worker do navegador é conferido em projeto local quando for o assunto, sem adaptar o site. |
| 22 | `22.01`, `22.06`, `22.08` | Consumir o tarball em pasta independente; alterar JS sem atualizar .d.ts e investigar a divergência; comparar guard/schema com a mesma matriz de casos. | Runtime e declarações concordam no consumidor; escolha de dependência considera o tamanho do problema. npm pack é suficiente, sem publicação real. |
| 23 | `23.08`, `23.05`, `23.07` | Dividir o projeto pessoal em regra principal, armazenamento, falhas, testes e mudança de requisito; disponibilizar um caso público de mover/remover e outro de falha de storage, reaproveitando os existentes quando suficientes. Analisar uma sugestão de IA e identificar requisitos/testes esquecidos. | Projeto pequeno satisfaz os requisitos escolhidos e mantém regressões. Uma suíte inicial verde não certifica operações ainda não cobertas; refatoração pode legitimamente começar com testes verdes. |

### Decisões que limitam o trabalho

- Cast localizado pode ser justificável com evidência; o alvo é evitar assertions que substituem validação, não eliminar toda ocorrência de as.
- Não impor GUI para estados/upload, repositório completo para uma tarefa de assinaturas ou arquitetura em camadas para qualquer programa pessoal.
- Readonly, as const, satisfies e marcas nominais não são validadores de dados externos nem promessa automática de imutabilidade runtime.
- `16.05`: a referência atual verifica id number sem exigir inteiro; não reabrir a exigência antiga de Number.isInteger sem contrato novo.
- Manter a diferença entre código incompleto intencional e gabarito contraditório. As pendências de previsão em 19.01 e de exemplos em 19.06 não são justificadas apenas por o starter ser um exercício.
- Iterator helpers, Proxy, using e demais extensões não se tornam obrigatórios apenas porque uma versão os suporta. Não acrescentar dependência ou camada por aparência de sofisticação.
- Não transformar Worker em promessa de ganho de velocidade nem uma medição local em recomendação universal.
- Não exigir registry, CI, matriz de navegadores, lançamento público ou projeto de duração mínima. Em 22.08, aceitar a abordagem JS/JSDoc com declarações quando cumprir o objetivo do exercício.
- As versões de Node e TypeScript usadas na conferência precisam ser explícitas. Não apresentar execução de .ts sem typecheck como validação de tipos, nem resultado no TypeScript 6.0.3 como homologação integral do alvo 7.0.

### Ordem e critérios para execução futura

1. Reconfirmar fonte, starter publicado e alterações locais dos IDs listados; preservar revisões anteriores. Usar os geradores protegidos de 20–23 conforme o mapa de fontes, sem editar artefatos derivados à mão.
2. Corrigir alinhamento de exemplos/tipos em 16.06, 18.02, 19.01, 19.02 e 19.06, resolvendo também o formato de 17.02 sem ampliar o objetivo.
3. Completar a preparação local dos três microprojetos TS e de 23.07; definir a comparação com schema de 22.06.
4. Alinhar reinício de iteradores, cronogramas de 21.07 e contrato de logs de 23.09; corrigir a explicação de isolatedDeclarations.
5. Incorporar as práticas curtas efetivamente úteis no mesmo lote, sem duplicar conteúdo já suficiente. Não criar um projeto ou mecanismo para cada linha da tabela.
6. Conferir previsões/type tests e executar os exemplos/testes locais pertinentes. Para Worker ou outro recurso específico de navegador, usar o projeto local declarado; não considerar Worker Thread prova de API de navegador. Regenerar e conferir o material efetivo, IDs e ordem. Não exigir suíte global para encerrar ajustes de conteúdo.
7. Registrar no plano os IDs corrigidos, verificação realizada, versões e limites. Esta seção só poderá ser marcada como executada após evidência nova; nenhuma caixa de fase histórica deve ser marcada por esta edição documental.

**Critério de saída:** o material de 16–23 trabalhado permite copiar o exercício, entender seu contrato e conferir a solução com IA e ferramentas locais; exemplos e referências concordam; dependências indispensáveis estão declaradas. O esforço acompanha a etapa estudada, sem exigir manutenção estrutural do site ou publicação.

### Registro de execução das etapas 16–23 — 19/10/2026

- **16–19:** alinhados `16.06` (NIVEIS/Nivel e restrição estática versus congelamento), `17.02` (modificação de assinaturas), `18.02` (aplicarPatch/Usuario/Perfil e substituição rasa), `19.01` (Flags booleanas), `19.02` (blocos copiáveis de ElementOrSelf) e `19.06` (Settings e opcionalidade). Os pacotes `16.08`, `17.08` e `19.08` têm scripts separados de teste/typecheck e lockfiles com TypeScript 6.0.3, @types/node 24.19.1 e undici-types 7.24.6. O teste focal inclui compilação real de previsões e contratos, inclusive os dois modos de exactOptionalPropertyTypes; as três referências passaram 3/3 testes cada e typecheck em cópias isoladas. O gerador preserva as avaliações existentes de `17.11` e `18.11`, que não pertencem aos seus mapas de geração.
- **20–21:** Ponte 20 e `20.08` distinguem array, mesma instância generator e nova instância criada pela fábrica, preservando `pipeline(iterable)`. Testes conferem descartes, pulls, take(0), limite e fechamento. `21.07` separa quatro eventos (debounce 140/260; throttle 0/160) de cem eventos (debounce 1090/valor 99; throttle 0–900) e explicita a borda. Foram corrigidas duas causas de geração não idempotente: substituição parcial de comentários de contrato e repetição de export em `20.06`; o helper tem cobertura LF/CRLF. Práticas curtas já suficientes foram reaproveitadas, sem criar novos projetos ou APIs de plataforma.
- **22:** `22.06` fornece schema com Zod 3.25.76, passos/configuração local e matriz comum de sete casos para comparação com o guard, sem coerção implícita. Ponte 22 e `22.09` mostram export trivial inferível e retorno que exige anotação; o consumer verifica as declarações emitidas em dist. Starter, manifesto, pacote/lockfile, consumer e comandos estão alinhados, preservando a implementação inicial incompleta de index.ts. O gerador continua funcionando no fixture mínimo de `22.08`; o teste de tarball/consumidor separado passou.
- **23:** `23.07` tem tsconfig, dependências/lockfile e comandos locais completos; três testes públicos reais cobrem admin/auditoria, usuário comum sem escrita e falha atômica. Esses testes falham intencionalmente no starter incompleto; a referência passa. `23.09` separa resposta pública de log interno com causa útil redigida, inclusive segredos aninhados sem mutar a entrada. `23.05`/`23.08` reforçam revisão de sugestão de IA, mover/remover e falha de armazenamento, reutilizando o projeto existente.
- **Conferência integrada:** geração canônica em cópia temporária passou duas vezes com estabilidade; incorporação seletiva e build curricular produziram 310 atividades. IDs, ordem e entradas publicadas de 00–15 permaneceram iguais ao snapshot inicial; hashes dos arquivos-fonte anteriores dessas etapas também foram preservados. `node scripts/test-stages16-19-content.mjs`, `node scripts/test-stage22-content.mjs` e `node scripts/test-stage23-content.mjs` passaram. A bateria `node --test --test-force-exit scripts/test-stages20-21-content.mjs scripts/test-master456-advanced.mjs scripts/test-task-9-typed-suite.mjs scripts/test-task-9-package-22-08.mjs` passou 26/26. Validação de catálogo, fonte curricular, `build-public-curriculum.mjs --check`, versões de assets e `git diff --check` passaram. A fonte curricular terminou com 0 erros e cinco avisos de parsing em `01.08`, cujo conteúdo anterior foi preservado. A comparação canônica confirmou 1.295 hashes estáveis para a cadeia de 48 IDs de 20–23.
- **Limites:** conferência em Node.js 26.7.0 e TypeScript 6.0.3, sem homologação integral de TypeScript 7.0/Node 24, percurso em navegador ou suíte global. O cache npm offline não continha todos os pacotes/metadados necessários; os testes isolados copiaram somente as dependências fixadas disponíveis localmente, sem resolver módulos pelo node_modules do checkout. Isso comprova execução/typecheck com essas dependências, mas não uma instalação limpa via rede ou npm ci offline. Nenhum runner, corretor, progresso persistido ou recurso de publicação foi ampliado ou removido.

## Histórico das fases 1–10

Os registros abaixo descrevem a execução sob o escopo anterior. Obrigações de abrangência global, mutantes por atividade, quantidade fixa de critérios, execução/correção interna e homologação de lançamento citadas nesses registros não criam novas tarefas após esta revisão. A evidência histórica continua válida dentro dos limites que ela declara. Nas fases 11–20, os registros de execuções já realizadas também são históricos: menções a fixtures, avaliações e interfaces não reativam obrigações de plataforma.

# GRUPO 1: Base e plataforma

## Fase 1: Linha de base e registro de verificação
**Escopo:** registrar o ponto de partida sem corrigir conteúdo.
- [x] Rodar a sequência de verificação e registrar contagem de testes, avisos e falhas.
- [x] Conferir que as 23 fases têm escopo e critério de saída definidos.
- [x] Anotar no próprio plano qualquer falha ou limitação encontrada na linha de base.

**Evidência da linha de base — 17/10/2026, checkout `336922b028aa47e14bbf198a7eb2f79a7371a1f2`:** `npm run check:curriculum` terminou com código 0 após o `precheck:curriculum` regenerar dados. Fonte curricular: 310 cartões, 0 avisos e 0 erros; gates de qualidade: 166 avisos (14 contrato oculto, 8 solução completa, 126 presença de mutantes, 18 identificadores), 0 falhas estritas de texto. O gate de execução rodou em modo de aviso: 262 avaliações listadas, 129 executadas, 133 puladas, 14 IDs sinalizados (`04.01`, `04.10`, `05.01`, `06.01`, `06.02`, `08.01`, `08.07`, `09.01`, `09.04`, `10.01`, `12.14`, `13.03`, `13.07`, `13.09`), 11 starters que não falham, 0 referências falhando e 4 mutantes sobreviventes. Aviso não foi classificado como defeito confirmado nesta fase. Log: `.superpowers/sdd/mestre-fases1-3/fase1-check-curriculum.stdout.log` (SHA-256 `9E58E6CA1D4268A909B8561E9B43FE6D05E910D49AB9E9E9A2F70B1BD2E63785`).

`npm test` concluiu 19 scripts até `test:phase6`: 1.195 testes contabilizados pelo runner, 1.192 passaram, 0 falharam, 2 pulados e 1 `todo`; `test:stage00` também passou em seus verificadores próprios. Em `test:phase7` surgiram falhas explícitas nos casos 24.01, 24.02 e 24.03; a suíte não emitiu resumo nem saída final. O wrapper atingiu 420 s em `test:app`, mas a cadeia continuou avançando; `taskkill` recusou encerrar a árvore por erro de credenciais do ambiente. Após a última saída às 17:06:11, o processo ficou sem avanço observável e a sessão foi interrompida às 17:07, sem mudança adicional no log nos 8 s seguintes. Resultado global do comando: inconclusivo quanto à contagem final de `test:phase7`, com falhas já observadas; não há suíte verde completa. Log: `.superpowers/sdd/mestre-fases1-3/fase1-npm-test.stdout.log` (SHA-256 `91E5279306857BAA64434599AD60E937D6777619C31260EB7F20B940C4284864`).

As 23 fases têm escopo por título/itens e critério de saída: as fases 1–8 e 20–23 trazem `**Saída:**` própria; as fases de lote 9–19 usam o fechamento comum do grupo 4, item 8 (verificação focal, integração do lote e gates aplicáveis), sem `**Saída:**` individual. Limite documental: critérios específicos por lote ainda dependem dessa regra comum. As referências editoriais 21–22 foram lidas: os quatro elementos são proporcionais à tarefa; prompt curto é triagem, e o trabalho editorial ocorre dentro dos lotes correspondentes.

Efeito preparatório registrado, sem correção de conteúdo: `public/course-assessments.json` passou a constar como modificado após a geração. Comparação estrutural com `HEAD`: 262 IDs antes e depois; só `22.07.correctFiles` e `22.07.mutantDirs` diferem por finais de linha embutidos (CRLF/LF); após normalização de quebras, o JSON é idêntico. Hash SHA-256 inicial `4F47B17CCE14D6F6FD8F6B324F6C0544E29E20F03C01D5CB856F32F742CE0260`, final `404099DF36B7FD1319807CB63D2053D85028049CE4245AF282BF4F6DD38AC6AA`. O arquivo gerado e o trabalho preexistente foram preservados. Relatório detalhado: `.superpowers/sdd/mestre-fases1-3/fase1-report.md`.

**Saída:** linha de base registrada; nenhum arquivo de conteúdo alterado.

---

# GRUPO 2: Gerador

## Fase 2: Gerador, dicas e previsão
**Resumo e verificação** (confirmar cada um no gerador e em 2 atividades publicadas):
- **62 dicas truncadas** no meio da palavra ("…Re", "…throw T", "…fak") na varredura reportada: origem apontada em `course-src/guided-preparation.mjs:60` (`clean(item.prompt).slice(0, 240)`). Além de truncar, a dica pode apenas repetir o prompt. Reconfirmar quantidade e casos atuais.
- **Previsão invertida** em 04.01–04.10 (variantes em 05.01, 05.06, 05.10): "Antes de executar, pedir dica ou abrir a solução." Origem em `course-src/recipes/03.py` e `04.py`.
- **`firstResponse.action` = `objective`** em 238 de 254 na varredura reportada; reconfirmar no catálogo atual.
- **Texto de starter colado no prompt** ("Starter de trabalho: … Registre sua primeira decisão…") em 13.x e 14.x; "Use o starter descrito no contrato" em 08.01–08.04 (o contrato não existe).
- [x] Dica não truncada e específica à tarefa; a primeira dica é uma pista útil, não uma cópia do enunciado nem texto automático genérico.
- [x] Texto de previsão: "Escreva sua previsão antes de executar; peça dica só depois de uma tentativa."
- [x] Primeira resposta gerada como pergunta própria.
- [x] Separar resumo do starter do prompt; remover a frase do contrato inexistente.
- [x] Gates de dica e `firstResponse` passam a **erro** no escopo de IDs verificado, sem bloquear lotes ainda não trabalhados.

**Verificação em 17/10/2026 (checkout `devpath-publish`, catálogo regenerado de 310 IDs):** os números 62/254 e 238/254 eram da varredura histórica. Antes da correção, o catálogo atual tinha 0 dicas terminadas em letra e 0 `firstResponse.action = objective`; a função `excerpt()` já preservava frases completas. O defeito confirmado era a primeira dica copiar o prompt em todos os 261 IDs 04+, enquanto nenhuma primeira resposta desses IDs era uma pergunta. A fonte e o catálogo confirmaram 10 timings invertidos em 04.01–04.10, 25 prompts com bloco `Starter de trabalho` em 13.x/14.x e 6 referências ao contrato inexistente em 08.01–08.04, 08.06 e 08.08. As variantes 05.01, 05.06 e 05.10 não tinham o timing invertido; as 49 atividades D–03 não tinham igualdade com `objective` nem previsão invertida.

**Correção e saída em 17/10/2026:** `course-src/guided-preparation.mjs` gera a primeira dica a partir da armadilha específica da atividade; após revisão, `course-src/first-response-questions.mjs` fornece 120 perguntas editoriais para leituras, comparações, previsões, projetos e transferências, e as outras 141 perguntas derivam do risco específico sem usar o rótulo de `examples[0].given` como caso. D–03 permanece preservado. As receitas 03/04 corrigem a ordem da previsão; 08 elimina a menção ao contrato ausente; 13/14 deixam a missão em `prompt` e mantêm o starter em `starterFiles`, apresentado em seção própria da interface. `public/course-catalog.json` foi regenerado: 0 dicas com o molde antigo ou corte heurístico, 0 previsões invertidas, 0 ações iguais ao objetivo, 0 primeiras respostas declarativas nos 261 IDs 04+, 0 blocos de starter no prompt e 0 menções ao contrato inexistente. O diff estrutural altera `firstResponse.action`, `hints` e `preparation` somente nos 261 IDs 04+; `firstResponse.timing` muda somente em 04.01–04.10 e `prompt` em 31 IDs (08: 6; 13/14: 25). D–03 não mudou semanticamente nesses campos.

**Gate e testes em 17/10/2026:** `scripts/phase2-verified-ids.json` fixa os 261 IDs verificados; `check:curriculum` agora trata `hint-cortado`, `dica-copia-prompt`, `primeira-resposta` e `primeira-pergunta` como erro somente nesses IDs, preservando avisos dos demais. Testes vermelhos/verde do gerador e dos gates: 18/18 ao final, incluindo regressão D–03. `npm.cmd run build:curriculum`, `npm.cmd run check:curriculum`, `npm.cmd run test:catalog` (4/4), `npm.cmd run test:stage03` (19/19), `npm.cmd run test:phase6` anterior à inclusão do teste novo (184 aprovados, 1 todo, 0 falhas), `npm.cmd run assets:version` e `node scripts/update-asset-versions.mjs --check` passaram. O rerun de `test:phase6` exibiu resumo Node com 187 aprovados, 1 todo e 0 falhas, mas o processo não encerrou e foi interrompido; os testes focais finais passaram 18/18. `check:curriculum` manteve 166 avisos de outros gates e `gate-execucao` em modo aviso com 14 IDs reportados; essas pendências pertencem a outros itens do plano. Evidência detalhada, casos publicados e limites: `.superpowers/sdd/mestre-fases1-3/fase2-report.md`.

**Revisão da Fase 2 em 17/10/2026:** o review detectou perguntas iniciais sem sentido nos rótulos `esperado` (13.01), `ciclo` (14.01) e `build` (14.12), além de duas contraprovas que o gate aceitava: `Pista: ` + prompt e `Em Dobro, qual é o objetivo?`. Três testes de regressão falharam antes do ajuste e os testes focais passaram 22/22 depois. O gate agora rejeita a cópia integral do prompt mesmo com prefixo e perguntas obviamente genéricas sobre o objetivo; seus checks são estruturais e não provam, sozinhos, a utilidade pedagógica. `build:curriculum`, `test:catalog` (4/4), `check:curriculum`, `assets:version` e o check de hashes passaram; `phase6` e `npm test` não foram repetidos nesta revisão. O diff entre o snapshot anterior à revisão e o catálogo regenerado muda somente `firstResponse` e `preparation` nos mesmos 261 IDs 04+; D–03 continua idêntico. Detalhes e comandos no relatório da fase.

**Saída:** 0 dicas truncadas, 0 previsão invertida, 0 `firstResponse` = objective.

# GRUPO 3: Integridade de gabarito

> Corrigir gabaritos, referências, contratos e testes junto ao lote da atividade evita separar dependências e repetir investigação. Use as fases 3–6 integradas aos lotes 9–19, seguindo a ordem de execução definida no início.

## Fase 3: Gabaritos e conteúdo errados
| Atividade | Achado a verificar | Resultado e evidência em 17/10/2026 (checkout `devpath-publish`) |
|---|---|---|
| 08.07 | Gabarito marcava a alternativa errada. | **Confirmado e corrigido.** `course-src/publication-overrides.json` marcava a escolha de índice 2, “visitar o destino”; agora marca a escolha 0, “impedir duplicatas”. `node scripts/build-curriculum-data.mjs` regenerou o catálogo (310 IDs); o embaralhamento de `build-public-curriculum.mjs` a coloca no índice **3** publicado, mantendo o índice da resposta já persistido. A pergunta inicial em `course-src/first-response-questions.mjs` agora pergunta pelos predecessores dos vértices seguintes, sem pressupor predecessor para A. O teste focal verificou o texto escolhido (4/4, saída 0). A sugestão de índice final 0 era **parcial** porque ignorava o embaralhamento. |
| 19.06 | O feedback afirmava que `-?` não remove `undefined` em `--strict`. | **Confirmado e corrigido.** `scripts/typecheck-host.mjs` usa `strict: true` por padrão, sem `exactOptionalPropertyTypes` no assessment 19.06. TypeScript **6.0.3**, com fonte virtual e `noEmit`, rejeitou ausência (TS2741), `theme: undefined` (TS2322) e `explicit: undefined` (TS2322) no modo efetivo; com `exactOptionalPropertyTypes: true`, aceitou somente o último desses três casos. `course-src/recipes/19.py` agora explica ambos os modos. A rubrica efetiva em `scripts/materialize-phase2-artifacts.mjs` foi regenerada pelo modo `--only=19.06-rubric` e aparece em `public/course-assessments.json` e no catálogo; a alternativa correta publicada ficou no índice 2 após embaralhamento. Teste focal da referência, gabarito e rubrica: 4/4, saída 0. |
| 12.04 | O exemplo omitia P2, que o starter agenda em P1. | **Confirmado e corrigido.** `course-src/recipes/12.py` passou a descrever o agendamento de P2 e a sequência `A,B,P1,Q,P2,T`; `public/course-catalog.json` regenerado mostra a entrada e a saída compatíveis. O teste focal executou o starter e comparou suas seis linhas ao exemplo publicado (4/4, saída 0). As dicas regeneradas leem esse exemplo. |
| 14.13 | O exemplo omitia B síncrono. | **Confirmado e corrigido.** `course-src/recipes/14.py` e o catálogo regenerado registram `A,B,P,T`; o teste focal executou o snippet publicado e confirmou A, B, P, T (4/4, saída 0). A previsão Node continua dependente de versão, módulo e contexto. |
| D.05 | A alegação pressupunha bug em `total`. | **Parcial: bug falso, texto corrigido.** O cartão é `INVESTIGATE`: pede hipótese, escolha de ferramenta e evidência. A função publicada devolveu **5** para `[2,-1,3]` em execução Node, como prevê o exemplo. O prompt antigo falava em “localizar uma falha curta”; `course-src/recipes/D.py` agora explicita uma divergência hipotética em outra entrada. O catálogo regenerado mostra a pergunta sem afirmar falha real. Não foi introduzido `n = x` artificial. |
| 06.06 | O starter já protegia JSON inválido com `try/catch`, enquanto o prompt mandava depurar. | **Parcial e corrigido no texto.** O cartão é `COMPARE` e o objetivo distingue sintaxe, esquema e perdas no round-trip. O starter publicado retornou `null` para `{invalido` e o objeto com `vida: 0` para o texto JSON válido `{"vida":0}`. Tanto `course-src/recipes/06.py` quanto o override efetivo em `course-src/publication-overrides.json` agora pedem leitura e comparação; preservam a proteção e a distinção pedagógica. Dicas regeneradas do novo prompt no catálogo. |
| 01.01–01.09 | Alegação de `correctFeedback` idêntico nas nove atividades. | **Falso no estado atual.** `course-src/recipes/01.py` já contém nove feedbacks específicos, e uma leitura programática de `public/course-catalog.json` contou **9 textos distintos em 9 cartões**. Nenhuma alteração nesses cartões. |
- [x] Aplicar o protocolo de verificação a cada linha e registrar o resultado no próprio item.

**Limite da verificação em 17/10/2026:** `gate-execucao --only=06.06,08.07,12.04,14.13,19.06 --strict` saiu 1 apenas porque o starter de 08.07 já passa como exercício `TRACE`; os demais quatro IDs foram ignorados pelo gate (`rubric` ou `typescript-only`). O critério de starter vermelho não se aplica à previsão conceitual; a correção do gabarito foi verificada pelo texto da escolha e por teste focal. Os verificadores curriculares diretos terminaram com saída 0 e o gate de qualidade manteve 166 avisos históricos, sem falha strict. A suíte agrupada da Fase 3 imprimiu 17 aprovações e nenhuma falha, mas não encerrou e foi interrompida; a suíte focal nova encerrou com saída 0 (4/4).

**Saída:** sete linhas classificadas; quatro defeitos confirmados e corrigidos, dois achados parciais corrigidos e um falso, sem introduzir bug artificial.

## Fase 4: Solução, starter e testes incompatíveis

**Critério:** conferir contrato, starter, suíte e referência; aplicar aceite próprio a tarefas `READ`/rubrica. Evidência datada de 17–18/10/2026, baseline `HEAD 336922b028aa47e14bbf198a7eb2f79a7371a1f2` e saída final publicada identificada pelos hashes abaixo.

| ID | Classificação e resultado |
|---|---|
| 23.10 | **Falso/obsoleto.** É `READ`, sem suíte ativa; a comparação antiga entre APIs não comprova defeito executável. Fonte efetiva: atividade 23.10 publicada e manifesto F6; mantido inativo. |
| 21.08 | **Confirmado e corrigido.** `usarRecursos` importa `recurso.js`, que faltava em `correctFiles`; arquivo agora acompanha a referência. Fonte: gerador etapa 21, `solutions/21.08/`, avaliação publicada. Gate estrito de solução completa passou nos 10 IDs. |
| 21.07 | **Confirmado e corrigido.** O harness esperava `{agora,setTimeout,clearTimeout}`, solução usava `{set,clear,now}` e starter simulava 4 em vez de 100 eventos. Contrato, solução e prova foram alinhados. Fonte: gerador/starter/teste 21.07; suíte focal master456. |
| 13.14 | **Confirmado e corrigido.** Testes usavam save sem `getItem`; agora exercitam API Storage e JSON inválido sem escrita de volta. Fonte: `course-src/tests/13.14.test.js`, solução e assessment. Early final: 16/16. |
| 18.10 | **Confirmado e corrigido preservando o runtime.** `handle('4')` mantém o parsing numérico do starter; a referência antiga tinha ramo especial para `ok`. A transferência independente continua usando `created`/`failed`. Fonte: solução, starter, suite e assessment 18.10; early final 16/16. |
| 16.03 | **Confirmado e corrigido.** O teste exigia `codigo`, mas starter/exemplo usam `linha`; A referência usa `linha`; o README mantém a transferência independente `Entrega`/`armario`. Fonte: atividade e artefatos 16.03; early final 16/16. |
| 11.04 | **Parcial.** A alegação de formulário ausente era falsa: fixture já tinha `#inscricao` e controles. O defeito real era perder `assertionCases` na chamada DOM genérica; corrigido em `public/course-assessment.js`. DOM runtime focal 96/96; Chromium publicado 4/4. |
| 11.05 | **Confirmado e corrigido.** Montagens repetidas duplicavam listeners; cleanup deixa uma ação por clique. Chromium: referência 3/3, starter 1/3, controle de remount 4/4; mutante sem cleanup rejeitado. |
| 13.03 | **Confirmado e corrigido.** Helper importado precisava ser fornecido no conjunto da atividade; dependência publicada foi alinhada à referência. Fonte: stage 13.03 e avaliação; gate estrito F4 passou. |
| 13.09 | **Confirmado e corrigido.** `retry.js` usado pelo teste faltava no starter/arquivos publicados; helper e contrato foram alinhados. Fonte: stage 13.09 e avaliação; gate estrito F4 passou. |
| 13.13 | **Confirmado e corrigido.** Referência precisava do HTML/helper usado pela suíte; arquivos e avaliação sincronizados. Chromium 4/4, todos os mutantes declarados mortos; gate estrito F4 passou. |
| 14.11 | **Falso para o cartão ativo.** É atividade `COMPARE`/rubrica; starter ativo é material textual. O antigo bloco de `package.json` na receita é inativo e não representa pacote publicado. Fonte: receita, starter manifest, assessment/rubrica. Excluído do gate executável. |

**Gate e prova focal:** geração curricular `npm run build:curriculum` — 310 atividades, exit 0; `npm run assets:version` e `node scripts/update-asset-versions.mjs --check` — exit 0. Early final 16/16 preservou 17 casos com IDs originais (4/5/4/4); README/entrega de 16.03 e semântica de 18.10 conferidos. `node --test --test-force-exit scripts/test-master456-early.mjs scripts/test-master456-contracts.mjs scripts/test-master456-advanced.mjs scripts/test-master456-legacy.mjs` — 48/48; `node --test --test-force-exit scripts/test-phase4-curriculum.mjs` — 8/8; `node scripts/check-quality-gates.mjs --scoped-strict=gate-solucao-completa --verified-ids=scripts/master-phase4-verified-ids.json` — 10 IDs, 0 bloqueios; DOM runner e assessment — 96/96. Browser Chromium final cobriu 11.04 (4/4), 11.05 (3/3 + remount 4/4), 11.08 (7/7), 13.13 (4/4), 21.05 (5/5) e 21.09 (assessment 3/3, suite protegida 3/3, controle 4/4; mutante de mediana superior rejeitado). Saída F4: [x].

## Fase 5: Soluções de referência com comportamento incorreto

**Critério:** referência correta e teste que rejeita o comportamento antigo relevante.

| ID | Classificação e prova final |
|---|---|
| 18.07 | **Confirmado e corrigido.** `constructor`, `toString` e `__proto__` não podem escapar como propriedades herdadas; solução usa propriedade própria e regressões cobrem as chaves. Early final 16/16. |
| 20.08 | **Confirmado e corrigido.** `take` posicional, fechamento do iterador em `break`, builder imutável e generator estão cobertos; a versão antiga falha. `scripts/test-master456-advanced.mjs`, incluído no master456 48/48. |
| 21.09 | **Confirmado e corrigido.** Exporta `comparar` e calcula média das duas amostras centrais em n par. Publicado: avaliação 3/3, suite protegida 3/3 com 4 assertion cases, controle async 4/4; mutante da mediana superior rejeitado. |
| 16.10 | **Confirmado e corrigido.** Erro público é fixo; causa técnica permanece interna. Regressão incluída no early final 16/16. |
| 23.02 | **Confirmado e corrigido.** Resposta pública não revela `cause`; contrato `criarServico` está declarado e testado. Focal avançado incluído no master456 48/48. |
| 22.08 | **Confirmado e corrigido.** Build copiava `.d.ts` manual, que podia divergir da implementação. JavaScript/JSDoc agora gera declarações por TypeScript; teste valida tarball instalado por consumidor externo, runtime e tipos. `node --test scripts/test-task-9-package-22-08.mjs` — 1/1. |
| 07.06 | **Confirmado e corrigido.** Redução usa `Object.create(null)` e spread para preservar coerção de objeto comum, incluindo chaves herdadas e `1`/`'1'`; teste misto focal 1/1. |

Saída F5: [x]. Evidência comum: `node --test --test-force-exit scripts/test-master456-early.mjs scripts/test-master456-contracts.mjs scripts/test-master456-advanced.mjs scripts/test-master456-legacy.mjs` — 48/48; teste focal 07.06 1/1; pacote 22.08 1/1.

## Fase 6: Contratos ocultos

**Escopo:** 22 IDs; 23.10 fica registrado como `READ` sem suite ativa. Nomes, formatos e falhas exigidos foram comparados ao baseline e ao artefato final.

| ID | Classificação e resultado |
|---|---|
| 20.01 | **Confirmado e corrigido:** `percorrer` estava oculto; prompt/starter declaram o helper e seu contrato. |
| 20.04 | **Confirmado e corrigido:** `observar` estava oculto; contrato visível alinhado à suíte. |
| 20.05 | **Confirmado e corrigido:** `validarUser` estava oculto; contrato visível alinhado à suíte. |
| 20.06 | **Confirmado no baseline e corrigido:** importava `take`/`run`, mas starter antigo só expunha `manualPipeline`; exports e prompt completo agora incluem os nomes exigidos. Fonte baseline: `quality-before.json` e snapshots `catalog-before.json`/`assessments-before.json`; focal avançado. Não é falso positivo no estado corrigido. |
| 20.09 | **Confirmado e corrigido:** `criarStream` e `consumirLento` estavam ocultos; nomes/contratos visíveis. |
| 20.10 | **Confirmado e corrigido:** `medirTexto` e `decodificar` estavam ocultos; nomes/contratos visíveis. |
| 21.05 | **Confirmado e corrigido:** formato de entrada inválida e mensagem exata estavam ocultos; prompt e suite alinhados. Chromium 5/5, mutants mortos. |
| 21.06 | **Confirmado e corrigido:** `criarCache` e `cachePorId` estavam ocultos; contrato visível. |
| 21.08 | **Confirmado e corrigido:** `usarRecursos` estava oculto; contrato e recurso transitivo publicados. |
| 22.04 | **Confirmado e corrigido:** `migrar` estava oculto; contrato visível. |
| 22.05 | **Confirmado e corrigido:** `executar` estava oculto; contrato visível. |
| 23.02 | **Confirmado e corrigido:** `criarServico` estava oculto; assinatura e erro público declarados. |
| 23.03 | **Confirmado e corrigido:** `StorageError` e causa interna têm contrato explícito; suíte protege a mensagem pública. |
| 23.04 | **Confirmado e corrigido.** Assinaturas, formatos, mensagens e regra sem gravação em falha estão visíveis. Harness round 2 exige falha `ERR_ASSERTION` no caso esperado; cinco mutantes semânticos rejeitados e três controles de infraestrutura corretamente rejeitados. `scripts/test-master456-legacy.mjs` — 4/4; re-revisão da rodada 2 aprovada. |
| 23.09 | **Confirmado e corrigido:** `lerLogs` e `limparLogs` estavam ocultos; contrato visível. |
| 23.10 | **Falso/obsoleto para gate de nomes:** `READ`, sem suite executável atual; registro inativo, não obrigação de API. |
| 11.03 | **Formato confirmado e corrigido:** entradas/saídas exigidas pela suite agora estão no prompt. |
| 11.08 | **Formato confirmado e corrigido:** entrada e mensagem de erro declaradas; Chromium 7/7. |
| 11.13 | **Formato confirmado e corrigido:** formato exigido pelos casos explicitado no contrato. |
| 14.06 | **Formato confirmado e corrigido:** mensagem/contrato explícitos sem exposição indevida de segredo. |
| 15.07 | **Confirmado e corrigido:** `RangeError` estava oculto no catálogo base; a afirmação do plano antigo estava desatualizada. Contrato agora declara o erro e fallback de rótulo. Separadamente, o gate passou a aceitar paráfrases semânticas em vez de exigir frase fixa. |
| 16.10 | **Formato confirmado e corrigido:** mensagem pública controlada e causa técnica privada, coerente com rubrica e teste. |

**Gate e prova focal:** `node scripts/check-quality-gates.mjs --scoped-strict=gate-contrato-oculto --verified-ids=scripts/master-phase6-verified-ids.json` — 22 IDs, 0 bloqueios; testes estruturais de contrato 17/17 e re-revisão da rodada 3 aprovada; master456 48/48. `node scripts/task-9-reference-gates.mjs` — 27 assessments executáveis passaram. O resumo da suíte de fase 6 foi 191 passed, 0 failed, 1 todo; o processo não encerrou limpo. Os wrappers amplos `npm run check:curriculum` e `npm run test:executors` foram interrompidos em execuções anteriores, sem resultado global confirmado. Não declarar `npm test` global verde: a fase 20 permanece fora deste escopo.

**Snapshot da verificação browser (SHA-256, Chromium 155 em 18/10/2026):** `public/devpath.html` `8C254BACF13DB480B07B38063E71CFDE199A16AF0CA7901F104E2CA2D40C08FF`; `public/app.js` `FE7097CD82B64F50F45947D035B7263E73DC89E6BDD0F472AE6C88C772C2E6B2`; `public/course-assessment.js` `7D7A648F885A15980A5C4E896625DCC447BDAD6AA1D39BD62B3D95FE96ACBAC5`; `public/course-dom-runner.js` `44B1E0DE1AF53597261B6E7BBE4CCB0A9B8962D37B5EC04B81F8A93FAF1AB3B6`; `public/course-assessments.json` `EEF49089A5725291D364AADD1BBE464B71FBDB427EE66689781628A8066789EA`; `public/course-catalog.json` `BD388A2DBED68A216C77EF0ABAACE6356A52A5ECE1F82B3803B4FBD6E48E597E`. Após remover somente linhas em branco no fim das suítes 16.03 e 16.10 e regenerar os assets, o hash final de `public/course-assessments.json` é `4E39B63F304F07AC073B29710D435EEC5E2E5C8B0D8FA72020C83DCB735AF957`. Os demais hashes listados permanecem iguais. A conferência fonte/publicação, os hashes de assets, `git diff --check` e os 48 testes focais passaram novamente; essa alteração de whitespace não teve nova execução browser.

- [x] Fases 4–6: gates estritos e verificações focais/browsers do escopo aprovados.
- [x] Proteção da regeneração temporária corrigida: `scripts/temporary-path-guard.mjs` aceita somente descendentes estritos da pasta temporária; raiz, pai, caminho com prefixo semelhante e checkout são recusados. Teste focal 11/11, sintaxe válida e recusa do checkout com código 3; re-revisão independente aprovada.


**Conferência final independente em 18/10/2026:** 48/48 testes do escopo passaram, com saída 0. Nove verificadores diretos encerraram com código 0: publicação curricular e checkpoints em `--check`, catálogo, fonte, modelo de progresso, vínculos de conceitos, hashes de assets e os dois gates estritos listados acima. A execução com `--test-force-exit` comprova as asserções concluídas, sem comprovar limpeza de todos os handles das suítes amplas. Os gates de outros lotes continuam em modo de aviso; os 108 avisos atuais de solução completa incluem ampliação da análise, não 108 defeitos confirmados. Registros dos comandos e resultados: `.superpowers/sdd/mestre-fases4-6/root-final-checks.json`, `root-final-master-result.json`, `root-final-master-tests.log`, `shared-integration-report.md` e `browser-report.md`. Nenhum ID de atividade foi removido.

## Fase 7: Mutantes e testes que travam
**Resumo histórico da varredura:** 61 atividades com teste sem mutante; 10 (15.x/16.x) com `mutants: "plausible"`; o mutante `lo = mid` de 08.03 trava a suíte. Esses totais não são uma contagem atual de pendências.
- [x] **Confirmado e coberto por regressão (18/10/2026):** o runner de avaliação interrompe uma execução real que não termina e relata timeout. `public/course-runner.js` encerra o Worker dentro do iframe e remove o frame; `node --test scripts/test-course-runner.mjs scripts/test-gate-execucao.mjs` passou nos seis testes do runner e nos quatro casos executáveis do gate (mais um TODO histórico 21.04). Em `scripts/test-gate-execucao.mjs`, o mutante 08.03 com `while (true) {}` retornou `kind=timeout`, `killed=true`, `killedByTimeout=true` em ~2,26 s, e o gate concluiu abaixo de 60 s. Classificação: o timeout reportado está corrigido no estado atual e a interrupção real foi reproduzida; o TODO 21.04 não pertence a esta falha.
- [x] **Confirmado, corrigido e verificado (18/10/2026):** os 10 IDs 15.02–15.04, 15.07, 15.08, 15.11 e 16.02–16.05 têm mutantes estruturados com arquivos e conteúdo não vazio. A fonte canônica `scripts/task-8b-stage15.mjs` substitui os seis IDs genéricos `plausible` por nomes semânticos (os conteúdos de defeito permanecem explícitos); os quatro IDs 16.x já tinham nomes semânticos. O novo teste focal em `scripts/test-course-tests.mjs` chamou `DevPathAssessment.run` e comprovou referência aprovada e rejeição dos 12 mutantes publicados (10 comportamentais e 2 de contrato TypeScript) nos dez IDs. O gate `scripts/gate-mutantes-presenca.mjs` agora rejeita entrada legada, listas/arquivos ausentes ou vazios, caminhos absolutos Windows, IDs placeholder com variação de caixa/espaços e IDs não textuais. `node --test scripts/test-quality-gates.mjs`: 18/18 passou. O strict escopado no artefato `public/course-assessments.json` para `mutante-invalido` e `mutantes-ausentes`, restrito aos dez IDs verificados, terminou com exit 0.
- [ ] **Pendente por lote (18/10/2026):** confirmar nos lotes quais atividades fora dos dez IDs continuam sem mutantes. A contagem histórica 61 não foi promovida a defeito atual nem transformada em bloqueio global nesta fase.

**Saída da Fase 7:** interrupção real comprovada; mutantes relevantes verificados nos dez IDs alvo; formato inválido bloqueado nesses IDs pelo gate estrutural. O levantamento de ausência em outros IDs continua reservado aos lotes.

## Fase 8: Compatibilidade dos runners
**Classificação confirmada (2026-10-18):** não foi reproduzida incompatibilidade no executor do site para 04.09 nem 14.08; ambas as suítes de contrato passam. A lacuna era a fronteira de execução não declarada nos cartões: testes próprios rodam no computador local com `node --test`, enquanto o contrato protegido é avaliado no site DevPath. Em 14.03, o starter usa `node:test`, mas a instrução anterior sugeria `vitest run` sem dependência Vitest no lockfile; incompatibilidade de instrução confirmada e corrigida. Em 13.x, `autoTested` significa avaliação automática pelo runtime DevPath, não execução de CLI Vitest: o catálogo publicado classifica 13.01, 13.04, 13.11 e 13.12 como rubrica; 13.02, 13.03, 13.05–13.10 como `javascript` autoavaliado; e 13.13 como `dom` autoavaliado. `autoTested` e `assessmentEnvironment` foram preservados. 22.09 já é explicitamente local e permanece local; seu teste e geração de declarações passam no Node.js 24.19, sem migração de runner.
- [x] Preservar os runners funcionais de 04.09/14.08; os cartões publicados agora declaram teste local versus avaliação no site. Testes focais por ID passaram.
- [x] Em 14.03, explicar `node:test` integrado ao Node e Vitest como dependência separada; starter e cartão não exigem instalação. `node --test`, `node src/main.js` e `node --watch src/main.js` foram comprovados em diretório temporário limpo no Node 24.19; os scripts npm completos foram comprovados no Node 26.7. O processo watch foi encerrado intencionalmente e não é reportado como saída 0.
- [x] Declarar no cartão os ambientes de execução para 04.09, 14.03 e 14.08; explicitar avaliação automática no site versus evidência local nas atividades 13.x. Para 22.09, a interface publicada já exibe checkpoint local e não exigiu mudança.

**Evidência:** saída publicada em `public/course-catalog.json`; provas focais e limites por comando em `.superpowers/sdd/mestre-fases7-10/fase8-report.md`. `npm run build:curriculum`, `npm run assets:version` e `npm run check:curriculum` concluíram; este último saiu 0 em modo warning (avisos gerais e 16 IDs no gate de execução preexistentes, sem classificar avisos como defeitos da Fase 8). A execução focal 22.09 também passou em Node.js 24.19. Não houve instalação, migração de runner, alteração dos IDs ou regeneração Task 9.

---

# GRUPO 4: Correção por lote

### Regras dos lotes após a mudança para uso pessoal

Para as próximas execuções, usar o protocolo simples do início deste plano. As fases 9–10 abaixo mantêm o registro do padrão anterior e não serão reabertas para uma nova rodada editorial. Nas fases 11–19, conferir a atividade que será estudada, corrigir os problemas relevantes e verificar o caminho afetado; não exigir auditoria exaustiva de todos os IDs, rubrica de tamanho fixo ou mutante obrigatório.
## Fase 9: Lote 1 (D.01–02.07, 34 IDs no catálogo atual)

**Base verificada em 18/10/2026:** o histórico de 30 atividades contava D.01–D.05, mas o catálogo hoje contém D.01–D.09. A faixa D.01–02.07 contém 9 + 9 + 9 + 7 = **34 IDs**. A leitura do catálogo publicado confirmou IDs e ordem; nenhum ID, posição ou progresso foi alterado.

**Decisões de escopo:** D.05 reaproveita a correção comprovada na Fase 3; não se criou bug artificial. D.02 é previsão/classificação conceitual, 00.05 é leitura de ambientes e documentação, D.04/07/08 são leitura/análise, e os diagnósticos D são formativos. Não converter esses objetivos em código por regra. 01.02–01.09 já têm executor/verificador Stage 01; 02.01–02.07 já têm casos e fluxo de avaliação Stage 02. A ausência de uma entrada no mapa de assessments genéricos não significa ausência de avaliação.

**Comandos e saídas desta revisão (Node 24.19.1, checkout local; não cobrem Chromium/produção):**

- `node.exe --test --test-force-exit --test-timeout=120000 scripts/test-diagnostic.mjs` → 13/13; respostas, feedback, restauração, rota D e visibilidade das rubricas de leitura/investigação.
- `node.exe scripts/test-stage00-content.mjs` → fonte canônica e contratos presentes. `node.exe scripts/test-stage00-ui.mjs` → fluxo real de 9 atividades, clique/entrada, execução, conclusão e recarga; inclui os negativos de 00.03 e 00.09 descritos abaixo.
- `node.exe --test --test-force-exit --test-timeout=120000 scripts/test-stage01-flow.mjs scripts/test-stage01-checks.mjs` → 52/52; soluções/contratos, rejeições, UI, conclusão e invalidação. `node.exe scripts/test-stage01-content.mjs` → preparação-fonte igual ao artefato publicado, exemplos executáveis e contratos de transferência.
- `node.exe --test --test-force-exit --test-timeout=120000 scripts/test-stage02.mjs` → 25/25; casos visíveis, semântica, edge cases e soluções incorretas representativas. `node.exe --test --test-force-exit --test-timeout=120000 scripts/test-stage02-ui.mjs scripts/test-stage02-progress.mjs scripts/test-stage02-audit.mjs` → 52/52; checks por ID, previsões, execução, conclusão, recarga e acessibilidade declarada.

| ID | Classificação; objetivo → avaliação; preparo/rubrica verificados | Evidência publicada/fonte; comando e resultado |
|---|---|---|
| D.01 | PREDICT, conceitual; prever três logs e confiança → comparação diagnóstica, sem nota; prompt dá saída e ordem; review específico. | `course-src/recipes/D.py`, `public/course-catalog.json#D.01`; D: 12/12. |
| D.02 | PREDICT, conceitual; classificar valor/tipo/typeof incluindo null, 0 e vazio → comparação + review; não requer JavaScript executável. | `course-src/recipes/D.py`, `public/course-catalog.json#D.02`; D: 12/12. |
| D.03 | TRACE, conceitual; prever condição e ramo em duas entradas → comparação dos estados; review explica if/else. | `course-src/recipes/D.py`, `public/course-catalog.json#D.03`; D: 12/12. |
| D.04 | READ, conceitual; separar entrada, retorno e efeito → rubrica visível com 3 critérios de localização, retorno e impressão; sem edição. | `course-src/recipes/D.py`, `public/course-catalog.json#D.04`, `public/diagnostic-ui.js`; D: 13/13. |
| D.05 | INVESTIGATE, conceitual; calcular retorno conhecido e propor investigação de divergência → rubrica visível com 3 critérios de retorno, teste de borda e inspeção do estado; correção F3 reaproveitada. | `course-src/recipes/D.py`, fase 3 do plano, `public/course-catalog.json#D.05`; D: 13/13; nenhum defeito comportamental novo. |
| D.06 | PREDICT, conceitual; prever expressão síncrona e distinguir string/número/typeof → resposta e feedback formativo; explicitamente não certifica domínio. | `course-src/recipes/D.py`, `public/course-catalog.json#D.06`; D: 12/12. |
| D.07 | READ, conceitual; acompanhar retorno/estado e escolher map/filter/find → rubrica visível com 3 critérios de retorno, alias/cópia e finalidade dos métodos. | `course-src/recipes/D.py`, `public/course-catalog.json#D.07`, `public/diagnostic-ui.js`; D: 13/13. |
| D.08 | READ, conceitual; distinguir retorno, propriedade, checagem estática e validação runtime → rubrica visível com 3 critérios de conceitos e limite de cast/any. | `course-src/recipes/D.py`, `public/course-catalog.json#D.08`, `public/diagnostic-ui.js`; D: 13/13. |
| D.09 | INVESTIGATE, conceitual; classificar hipóteses e indicar observação mensurável → rubrica visível com 3 critérios de hipótese, observação e alternativa; não afirma medir sistema real. | `course-src/recipes/D.py`, `public/course-catalog.json#D.09`, `public/diagnostic-ui.js`; D: 13/13. |
| 00.01 | PREDICT executável/leitura; prever três linhas, executar arquivo intacto e explicar ordem/cálculo → runner + rubrica de saída e explicação; 6 min. | `course-src/stage00-preparation.mjs`, `public/course-catalog.json#00.01`; 00 conteúdo + UI. |
| 00.02 | TRACE executável/comparação; comparar duas versões e identificar chamada alterada → runner de cada arquivo + rubrica de diferenças; 7 min. | `course-src/stage00-preparation.mjs`, `public/course-catalog.json#00.02`; 00 conteúdo + UI. |
| 00.03 | PARSONS executável; montar exatamente Início, Olá, Ana, Fim em três linhas e excluir Olá → comparação por saída e rubrica específica; 7 min. | Fonte e artefato têm 3 saídas ordenadas. Negativo com quarta linha dá divergência; fluxo correto integra e conclui. 00 UI. |
| 00.04 | FADED executável; preencher três argumentos e preservar texto/número → runner + rubrica de lacunas e saída; 6 min. | `course-src/stage00-preparation.mjs`, `public/course-catalog.json#00.04`; 00 conteúdo + UI. |
| 00.05 | READ, análise escrita; classificar oito recursos e consultar documentação dos dois ambientes → rubrica visível com 3 critérios de origem, ambientes e referências; não exige código; 8 min. | `course-src/stage00-preparation.mjs`, `public/course-catalog.json#00.05`; 00 conteúdo + UI. |
| 00.06 | DEBUG executável; observar erro intacto, alterar uma falha por vez e validar saída alvo → runner/histórico + rubrica de erro, iteração e resultado; 9 min. | `course-src/stage00-preparation.mjs`, `public/course-catalog.json#00.06`; 00 conteúdo + UI. |
| 00.07 | MAKE executável; criar três chamadas completas do zero → runner + rubrica de chamadas e saída; 7 min. | `course-src/stage00-preparation.mjs`, `public/course-catalog.json#00.07`; 00 conteúdo + UI. |
| 00.08 | READ, análise escrita; descrever árvore HTML e associação label/for/id → rubrica visível com 3 critérios de hierarquia, atributos e associação; não exige código; 8 min. | `course-src/stage00-preparation.mjs`, `public/course-catalog.json#00.08`; 00 conteúdo + UI. |
| 00.09 | TRACE/capstone executável; produzir quatro linhas, depois manter `Itens:` e mudar 3 para 0, mais duas transferências → comparação/transferências + rubrica específica; 15 min. | `expectedByRequirement.zero` publica `[Itens:,0]`. Negativo que apaga a chamada dá divergência; solução com zero conclui e exige as duas respostas. 00 conteúdo + UI. |
| 01.01 | PREDICT; cinco rótulos typeof → Stage 01 checks/runner, previsão e rubrica de valor versus rótulo; 8 min. | `course-src/stage01-preparation.mjs`, `public/stage01-preparation.js`, `scripts/test-stage01-checks.mjs`; 01 flow: sucesso e UI. |
| 01.02 | TRACE; quatro estados de base/total → tabela prevista e checker dedicado, rubrica acompanha só total; 10 min. | Mesmas fontes Stage 01, catálogo `#01.02`; 01 checks/flow. |
| 01.03 | PARSONS; duas ordens válidas, produtores independentes antes do consumidor e excluir E → checker testa permutações válidas/inválidas; rubrica específica; 10 min. | `scripts/test-stage01-checks.mjs` aceita permutações e rejeita duplicata/E; 01 checks/flow. |
| 01.04 | FADED; seis const/let por reatribuição → checker e editor sincronizado; rubrica preserva 0/false; 10 min. | 01 checks/flow também confirma escolhas no starter real. |
| 01.05 | PREDICT; quatro valores especiais → checker/execução e rubrica de tipo; 8 min. | `course-src/stage01-preparation.mjs`, catálogo `#01.05`; 01 checks/flow. |
| 01.06 | FADED; completar uma template literal → checker de expressão, dados alternativos e rubrica; 10 min. | 01 checks/flow inclui teste da única expressão solicitada e caso alternativo. |
| 01.07 | MAKE; declarar e imprimir resumo de horas/minutos → checker rejeita saída fixa, rubrica inclui zero; 12 min. | 01 checks/flow, inclui negativo para saída constante. |
| 01.08 | TRANSFER; completar const/let e dois resumos de configuração → casos do checker e rubrica de reatribuição/derivação; 18 min. | 01 checks/flow executa contratos visíveis; revisão sem defeito de duração. |
| 01.09 | PROJECT; três estados, incluindo vida zero, e duas transferências → checker principal + transfers com casos default/alternativo e negativas; rubrica específica; 16 min. | Fonte e `public/stage01-preparation.js`; 01 flow: prompts exibidos informam 30 e 6 horas; remover as reatribuições é rejeitado; testes 52/52. |
| 02.01 | PREDICT executável; três blocos de operadores com valor/tipo e comparação `==/===/!==` → cases por bloco, execução real e review; 22 min. | `course-src/recipes/02.py`, artefatos Stage 02; C02a: 25/25, C02b: 52/52. |
| 02.02 | PREDICT; matriz `||`/`??` por falsy/nullish → casos e review específicos, previsão seguida de execução; 10 min. | Receitas e cases publicados #02.02; C02a/C02b. |
| 02.03 | PARSONS; montar condições simultâneas de saldo e conta ativa → cinco casos de fronteira e checker que não impõe ordem a independentes; review explica `&&`; 12 min. | Receitas/cases #02.03; C02a/C02b, inclusive saldo igual ao custo. |
| 02.04 | FADED; prever normalização/validade incluindo vazio, zero, NaN/Infinity → checker de casos e review; duas lacunas; 15 min. | Receitas/cases #02.04; C02a/C02b, inclusão da flag vazia e finitude. |
| 02.05 | MODIFY; converter, marcar validade, calcular diagnósticos e apresentar → casos válidos/inválidos, checker e review de sequência; 17 min. | Receitas/cases #02.05; C02a/C02b cobre 0, vazio, NaN e Infinity. |
| 02.06 | DEBUG; observar fallback que apaga zero, corrigir ausência sem validar domínio → casos zero/null/undefined e review `??`; 10 min. | Receitas/cases #02.06; C02a/C02b, fluxo executa starter e exige correção. |
| 02.07 | MAKE; calcular total após desconto para domínio declarado → casos de preço zero/desconto zero, checker e review; não pede domínio de erro; 12 min. | Receitas/cases #02.07; C02a/C02b. |

**Achados e delta:** 00.03 já requeria exatamente três linhas na ordem solicitada e excluía o distrator; 00.09 já exigia e publicava `Itens: 0`. Acrescentei na integração real casos negativos para quatro linhas em 00.03 e para apagar `Itens:` em 00.09; ambos produzem divergência e a tentativa correta segue concluindo. 01.09 tinha dois prompts de transferência sem os valores finais que os casos cobravam. Atualizei somente os prompts para declarar duração 0 → 30 e 2 dias/4 horas → 6 horas; um teste do DOM publicado verifica os valores visíveis, e o verificador continua rejeitando a solução que omite cada reatribuição. A revisão editorial também comprovou que READ/COMPARE sem comportamento precisam de três critérios verificáveis: acrescentei rubricas específicas a D.04/D.07/D.08 e 00.05/00.08; incluí rubricas equivalentes para as investigações conceituais D.05/D.09. O renderer diagnóstico exibe essas listas no cartão, sem transformá-las em nota ou certificado. Os 14 prompts curtos do inventário histórico (D.01–D.05, 01.01–01.09) foram usados como triagem, não como meta de tamanho; não se acrescentou filler. Os históricos de “13 prosa → código” e “30 sem teste” foram descartados como classificações atuais: READ/TRACE conceituais mantêm meios adequados, e os executáveis têm avaliação dedicada, não necessariamente `course-tests.json` ou diretórios de mutantes. Não surgiu outra falha confirmada em texto ou duração dos 34 IDs.

**Limites:** evidência local de catálogo e fixtures; não demonstra execução de navegador real, validade pedagógica em turma ou todos os ambientes de produção. Sem publicação. Nenhum ID, ordem ou registro de progresso mudou.

## Fase 10: Lote 2 (02.08–05.10, 39 atividades na ordem publicada)

A faixa publicada contém 5 IDs de 02, 10 de 03, 14 de 04 e 10 de 05; preservada a sequência do catálogo. Auditoria efetiva: catálogo publicado, assessments/preparations, receitas/starter/soluções/testes e os verificadores dedicados da Etapa 03. A contagem histórica de 30 não corresponde ao conjunto atual.

**Classificação dos achados antecipados:** 03.03 falso; o Parsons permite trocar as condições exclusivas three/five e o verificador da UI aceita a solução válida. 03.04 parcial: os casos/fixtures cobrem as faixas e bordas, mas o starter efetivo tinha apenas uma lacuna enquanto exigia completar três ramos; agora há lacunas D/C/B explícitas e o verificador executa todas as faixas. Os 14 min incluem classificação, tentativa, casos de transferência e conferência; é uma estimativa defensável para este percurso, não uma medição de alunos. 03.05 falso: o caminho de UI é uma matriz seguida de validação/execução; não depende de escrever código em material.md. 04.03 confirmado: havia quatro blocos prometidos e apenas três declarações, sem a chamada D; starter, solução, rubric e suíte agora cobrem A/B/C mais a chamada D. 04.07 confirmado: os casos antigos arredondavam para cima com Math.round e Math.ceil; os novos discriminadores cobrem ambos. 04.08 (frete) e 04.09 (ficha RPG) são exemplos de domínio coerentes, não defeitos. 04.09: integração F8 preservada; não reaberto runner/contrato local.

**Pré-requisitos conferidos na fonte efetiva:** primers publicados para arrays/spread (04.02), objetos (04.05), ESM (04.07), callbacks (05.03), busca/arrays (05.04) e TypeError/guardas (05.07). Os vínculos e saídas são publicados, sem ligação de progresso artificial. A rubrica de READ 04.02 publica três critérios observáveis; não foram criados mutantes artificiais para leitura, previsão ou observação.

| ID | Resultado | Objetivo, avaliação, preparo/rubrica e tempo (catálogo e fonte efetiva) |
|---|---|---|
| 02.08 | OK | Preferência/fallback para três entradas; transferência com tabela de validade/ausência; 16 min. |
| 02.09 | OK | Normaliza dois campos opcionais e produz total; checkpoint curto com verificador; 10 min. |
| 02.10 | OK | Arredondamento, utilitários e sorteio; prevê limites/valores antes da execução de cada bloco; 28 min. |
| 02.11 | OK | Precisão decimal; previsões de valor e tipo em A/B; PREDICT mantido sem mutante artificial; 22 min. |
| 02.12 | OK | Tolerância de sensor derivada da resolução; calcula limiar/diferença e decisão antes da comparação; 20 min. |
| 03.04 | PARCIAL corrigido | Classificador D/C/B/E/A; preparação e rubric com cortes explícitos, UI testa inválidos e limites até 101; starter agora tem as três lacunas; 14 min. |
| 03.05 | FALSO corrigido no diagnóstico | Matriz abaixo/no/acima para quatro regras, incluindo x>0; o verificador próprio valida tabela, solução e limites; 15 min. |
| 03.01 | OK | Trace de loop por passagem e estado final de i; preparo e três critérios na UI; 10 min. |
| 03.02 | OK | Trace sem arrays de cinco passagens; preparo e três critérios na UI; 12 min. |
| 03.03 | FALSO | Parsons FizzBuzz com quatro regras ordenadas por especificidade; exclusivas three/five podem trocar, confirmado pelo verificador; preparo e rubric, 18 min. |
| 03.06 | OK | Debug de loop: rastreia fila e avanço nas duas primeiras passagens; preparo e rubric, 16 min. |
| 03.07 | OK | Contador por intervalo: condição composta e extremos visitados; preparo e rubric, 14 min. |
| 03.08 | OK | Transferência de fila: tabela de ticks, chegadas, atendimentos e estado; quatro evidências, preparo e rubric, 25 min. |
| 03.09 | OK | Projeto de batalha: ordem de ações, parada, derrotados e dano zero; preparo/rubric e cenários coerentes, 55 min. |
| 03.10 | OK | Escolhe ternário ou if para decisões de 2/3 ramos; prevê cinco bordas, preparo, rubric e suíte; 20 min. |
| 04.01 | OK | Prevê valores de return, ausência de return e null; primer publicado; PREDICT sem mutante artificial, 13 min. |
| 04.02 | CORRIGIDO | READ separa retorno, efeito e pureza nos seis snippets; assessment efetivo alinhado à receita, com três critérios observáveis e primer arrays/spread; 14 min. |
| 04.03 | CONFIRMADO corrigido | Parsons de quatro blocos: A cParaF, B formatar, C exibir, D console.log; todas as seis ordens de declarações passam quando D fica ao final, saída 32 °F; rubric e suíte; 14 min. |
| 04.04 | OK | Completa assinaturas com entradas/saídas tipadas; preparo e suíte por função; 15 min. |
| 04.05 | OK | Implementa cálculo e três Intl formatters, declara entradas/saídas; primer de objetos; 22 min. |
| 04.06 | OK | Distingue exibição de retorno e composição em somaDobros; preparo e suíte; 17 min. |
| 04.07 | CONFIRMADO corrigido | API de carrinho por centavos; ESM preparado e unidade/arredondamento expostos; 1×0,1→1 e 333×0,07→356 diferenciam round/ceil; 30 min. |
| 04.08 | OK | Decompõe custos de peso/distância e composição do frete; contrato inclui unidades e zero; caso preexistente custoPeso(2) === 4 mata mutante de tarifa; 27 min. |
| 04.09 | REVISADO F8 | Projeto ataque/defesa/resumo, teste local Node próprio e integração de avaliação do site separados conforme F8; rubric cobre composição e entrada vazia; mutante de domínio e gate local; 55 min. |
| 04.10 | OK, exceção de gate | Renomeia variáveis internas sem mudar API/fórmula/resultado; preparo e rubric de preservação. Starter pode passar behavior por intenção; exceção no gate só com ID, kind, objetivo e rubric compatíveis; mutante continua obrigatório; 24 min. |
| 04.11 | OK | Classifica TypeError/RangeError/retorno nas bordas; primers de guards publicados, rubric e suíte; 18 min. |
| 04.12 | OK | Contextualiza erro de JSON e garante cleanup em sucesso/erro; primers publicados, rubric e suíte; 20 min. |
| 04.13 | OK | Separa null de tipo inválido; primers publicados, rubric e suíte; 16 min. |
| 04.14 | OK | Distingue omissão, 0 e null com defaults/rest; preparo/rubric e suíte; 18 min. |
| 05.01 | OK | Prevê identidade/aliasing e mutação de arrays; PREDICT sem mutante artificial; 12 min. |
| 05.03 | OK | Parsons slug: etapas e arrays intermediários; primer de callbacks publicado e suíte; 13 min. |
| 05.04 | OK | Busca primeiro/último índice e ausência; primer arrays/busca e suíte; 14 min. |
| 05.06 | OK | Diagnostica sort/reverse mutável e entrega cópia explícita + API moderna; primer e suíte; 20 min. |
| 05.07 | OK | Estatísticas, acumuladores e lista vazia; TypeError/guardas preparados e suíte; 25 min. |
| 05.10 | OK | flat remove exatamente um nível, preservando subarray mais profundo; suíte; 16 min. |
| 05.02 | OK | Regex de identificador ancora primeira posição e sequência; preparo e suíte; 13 min. |
| 05.05 | OK | Busca literal com escaping, contrasta pontuação que difere regex; preparo e suíte; 19 min. |
| 05.08 | OK | Parser conserva a mensagem após dois separadores e rejeita nível/campos vazios; caso preexistente de nível vazio mata mutante representativo; 28 min. |
| 05.09 | OK | Projeto de inventário textual: estado, mudança e retorno por operação; preparo e suíte; 45 min. |

**Mutação no escopo executável:** 22 mutantes representativos (03.10, 04.03–04.08, 04.09–04.14, 05.02–05.10). 04.09 entrou como integração sem alterar F8. 04.08 e 05.08 usam defeitos já discriminados pelos casos existentes (custoPeso(2) === 4; nível vazio rejeitado); nenhum teste dessas suítes foi alterado. O mutante inicial de 05.08 que trocava indexOf por lastIndexOf era equivalente para a saída pública e foi descartado em favor de aceitar nível vazio. 02/03 mantêm seus verificadores próprios; 04.01/05.01 não recebem mutantes por serem PREDICT; 04.02 não recebe mutante por ser READ.

**Delta F10:** corrigidos starter de 03.04 e alinhamento da tarefa/parsons de 04.03; novos discriminadores 04.07; rubric efetivo 04.02 alinhado; 22 mutantes inline + referências para gate; exceção estreita do starter-preserving de 04.10 com teste de regressão; teste editorial novo ligado à cadeia npm test por test:master10. Nenhuma edição em 04.09 fora da integração de avaliação. IDs/ordem/progresso preservados. Ver arquivos e RED/GREEN exatos em .superpowers/sdd/mestre-fases7-10/fase10-report.md.

**Limites:** fixtures e execução local reproduzem contratos do catálogo e do site; não medem aprendizagem/tempo com alunos, não cobrem todos os navegadores e não representam publicação/produção. Sem commit, push ou publicação.

# Trabalho restante — escopo reduzido

As listas seguintes preservam os principais IDs e problemas do inventário anterior para consulta. **São pontos a conferir quando a atividade entrar no estudo, não uma lista de defeitos atuais nem obrigação de revisar o lote inteiro antecipadamente.** Itens tratados nas fases 2–8 ou nos lotes 9–10 só recebem nova correção se o problema ainda existir ou tiver voltado.

## Fase 11: Lote 3 — strings, objetos, arrays e algoritmos (05.11–08.05)

**Quando:** ao estudar esta faixa. Preparar somente a atividade atual e as próximas necessárias.
- [x] Conferir, no escopo reduzido, se enunciado, exemplos, material e resposta permitem resolver a atividade sem adivinhar requisitos.
- [x] Corrigir os problemas confirmados e executar a verificação focal adequada ao objetivo.

**Pontos úteis do inventário:** 07.01 e 08.01 podem entregar respostas nas dicas; 07.06 pode usar itens não declarado ou tratar mal chaves como __proto__/toString; 07.03 pode ter entrada/saída e ordenação inconsistentes; 07.10 pode avaliar map em vez de flatMap; 06.08 pode ter review incompatível. Preparar grafemas/Intl.Segmenter em 05.11 se forem exigidos, e esclarecer referências compartilhadas em 06.02 quando necessário.

**Reutilizar:** 06.06 já teve diagnóstico na fase 3 e o timeout de 08.03 foi verificado na fase 7. Referências antigas a 05.05/05.08 pertencem ao lote já trabalhado; não reabrir sem um problema atual.

**Fora do obrigatório:** converter toda prosa em código, testar todas as leituras automaticamente, uniformizar cenários ou preencher uma cota de mutantes.
**Saída:** a atividade estudada tem material suficiente e resposta coerente para resolução com apoio de IA e conferência local; a correção e seu resultado estão registrados, sem depender da avaliação do site.

**Registro:** 07.01 mantém starter `string[]` com respostas em branco e revisão por rubrica; a referência fornece as classificações. Em 08.01, a interface real mostrava o código em “Materiais desta atividade” antes da previsão, embora o editor de prática ficasse bloqueado. O renderer agora respeita `assessment.predictionTable.revealSourceAfterPrediction` somente em 08.01 e aguarda os metadados antes de exibir prévia/editor, inclusive quando `answered` já está salvo; após carregar, preserva respostas salvas compatíveis e só libera ambos depois da previsão. No reload com resposta salva e metadados atrasados, prévia/editor permanecem ocultos até a liberação e então reaparecem. A interface foi ajustada, mas o starter ainda contém as classificações literais; a correção de conteúdo está pendente. 05.11 não exige grafemas; 06.02 não mostrou defeito. No estado atual, 06.08 e 07.03 têm correções pendentes, 07.06 mantém a solução corrigida mas o starter contradiz o teste, e 08.03 reutiliza a verificação anterior; ver “Plano de correção das etapas 06–10”. A regressão de primeira pintura passou em 14/14 verificações do controller; no Chromium real, o fluxo antes/depois e o reload com metadata atrasada passaram. O teste focal público de 08.01 também passou após geração, sem validar o conteúdo literal do starter.

## Fase 12: Lote 4 — funções, orientação a objetos e DOM

**Faixa preservada:** 08.06–11.14, exceto 11.08, 11.10 e 11.13, que ficam na fase 13.
- [x] Conferir os exercícios usados no escopo reduzido e corrigir arquivos ausentes, contratos escondidos ou exemplos que ensinem errado.
- [x] Nas atividades DOM alteradas, conferir o programa do exercício em navegador local, além do teste focal quando couber; não exigir integração com o executor do site.

**Pontos úteis do inventário:** 08.06 pode ordenar quando deveria preservar a ordem; 09.04/10.02 podem ter exemplos de retorno/acesso incorretos; 10.06 pode pedir modificação sem fornecer código; 10.07, 11.03 e 11.06 podem cobrar contratos não apresentados. Em 11.12, alinhar nomes de funções e verificar que texto hostil é exibido como texto quando esse for o contrato, usando DOM/parser apropriado para conferir o resultado. Explicar AbortController/FormData antes de exigir seu uso.

**Reutilizar:** resultados anteriores de 08.07, 11.04 e 11.05; conferir somente a integração relevante se o estado mudou.
**Redução:** revisar duração ou linguagem apenas se estiverem atrapalhando a prática; sem campanha geral de segurança, estética ou compatibilidade entre navegadores.
**Saída:** o exercício funciona no ambiente local informado, a solução atende ao enunciado e o resultado pode ser conferido por exemplos, critérios ou testes entregues.

**Registro:** 10.06 teve o texto ajustado para explicitar funções puras, mas o starter ainda é composição mutável e o enunciado ainda promete refatorar uma hierarquia; a correção está pendente na seção “Plano de correção das etapas 06–10”. Em 11.06, dados/IDs e a avaliação foram conferidos; em 11.12, o contrato de texto/comentário foi alinhado a `childNodes`, com sete casos publicados preservando IDs e offsets. Os testes do navegador real confirmaram 11.06 (referência 3/3; starter rejeitado) e 11.12 (markup hostil, quebra de linha e vazio).

**Atualização de 19/10/2026:** a revisão de 11–15 reabriu `11.01`, `11.02`, `11.04` e `11.11`; ver “Plano de correção das etapas 11–15”.

## Fase 13: Lote 5A — Kanban e programação assíncrona

**Faixa preservada:** Kanban 11.08, 11.10, 11.13 e etapa 12.
- [x] No Kanban utilizado, conferir montagem, carregamento de app.js, dados de estado e salvamento/recarga.
- [x] Nos exercícios assíncronos usados, conferir ordem de conclusão, respostas HTTP e tratamento de erros com os casos relevantes.

**Pontos úteis do inventário:** 11.08 pode esconder montarKanban(document, storage).getState(); 11.13 pode usar done inexistente ou regras contraditórias de registro parcial; 12.03 pode pedir objeto e avaliar array; 12.06 pode aceitar engolir erros; 12.08 pode verificar headers inexistentes no fake. Em 11.10, esclarecer o papel de boot e do HTML fornecido. Preparar try/catch em 12.02 se necessário. Texto herdado de outro projeto só precisa mudar quando confundir o contrato.

**Reutilizar:** a saída de 12.04 já foi tratada na fase 3. O ID 12.05 sozinho não comprova defeito; investigar apenas se houver dificuldade concreta.
**Redução:** sem ampliar o Kanban em produto completo, nem criar infraestrutura de servidor/rede no site para executar a tarefa. Quando necessários ao assunto, servidor local e navegador pertencem ao exercício feito na máquina do proprietário. Limitação de fake ou fixture do corretor interno não exige adaptação da plataforma; manter corretos os arquivos e contratos entregues para estudo local.
**Saída:** o fluxo praticado mantém estado e responde corretamente aos cenários de sucesso e falha que o enunciado exige.

**Registro:** 11.08 passou no navegador real com salvamento, movimentação e recarga; 11.10 agora recebe o HTML como contexto somente leitura e restaura a tela após recarga; 11.13 manteve a migração V1 e sinaliza dados parciais. 12.03 conserva o contrato de array/ordem e inicia chamadas em paralelo; 12.08 aceita headers opcionais na fixture e cobre retry, resposta antiga, estado de loading, timeout e cancelamento pelas opções `onState`, `timeoutMs` e `signal`, mantendo a chamada antiga de um argumento. A frase de preparação foi alinhada à limpeza após `Promise.race`. Focal público de 11.10/12.08 passou; 12.04 foi reutilizado, 12.02/12.05/12.06 não apresentaram defeito, e 12.15–12.21 não foram auditados.

**Atualização de 19/10/2026:** a revisão de 11–15 reabriu `11.08`, `11.10`, `12.02`, `12.06`, `12.08` e `12.21`; ver “Plano de correção das etapas 11–15”. O gate focal continua verde, mas não cobre os contratos e os caminhos de falha descritos lá.

## Fase 14: Lote 5B — testes e depuração (13.01–13.13)

- [x] Nas atividades estudadas, confirmar que os arquivos importados existem e que o teste/critério verifica o comportamento pedido.
- [x] Corrigir dica ou explicação somente quando ela impedir entender a missão, entregar a resposta ou contradizer a avaliação.

**Pontos úteis do inventário:** arquivos de apoio em 13.03/13.09/13.13; armadilhas descritas de forma genérica. Os IDs 13.05, 13.07, 13.08, 13.10 e 13.12 foram listados sem defeito específico; isso não exige criar trabalho nem presumir falha.

**Reutilizar:** a fase 8 já esclareceu avaliação no site versus testes locais e as modalidades reais de 13.x; a fase 2 já tratou geração de dicas. Para o uso atual, testes do exercício rodam localmente; não migrar runners ou mudar autoTested para uniformizar a etapa, nem implementar execução de testes no site.
**Saída:** o exercício de teste/depuração permite executar ou analisar exatamente o que pede, com critério compreensível.

**Registro:** em 13.04, foi fornecido o código de depuração ausente e alinhado o prompt condicional à tarefa. A cobertura existente de 13.x passou em 9/9, com roteamento 1/1; `test-task-8a-evidence.mjs` passou 1/1 após adaptar somente os mutantes 11.05 ao lifecycle atual. IDs sem defeito específico não foram tratados como falhas presumidas.

## Fase 15: Lote 6 — Node, ferramentas e início do TypeScript

**Faixa preservada:** 13.14–16.05 e 16.09; 16.06/16.07 ficam na fase 16.
- [x] Conferir instalação/comandos, arquivos e contratos no escopo estudado.
- [x] Executar as referências e verificações de tipos disponíveis, registrando o limite do proxy local.

**Pontos úteis do inventário:** em 14.06, tornar explícitos NODE_ENV/TOKEN e mensagens exigidas sem expor segredos; em 14.08/14.11, conferir o contrato de JSON inválido; em 14.12, fornecer build real ou saída adequada ao objetivo; em 15.08, conferir paginacao.ts. Preparar import.meta.url, import() dinâmico, cause, Object.hasOwn e Error.isError apenas quando forem usados. Alinhar rubrica visível e avaliação se cobrarem coisas diferentes.

**Reutilizar:** correções e provas anteriores de 13.14, 14.03, 14.13, 16.03 e mutantes. 15.07 já declara RangeError para lista vazia; não contar isso como contrato oculto.
**Redução:** não montar pipelines de publicação, instalar Vitest sem necessidade ou converter tarefas comparativas em projetos apenas para padronizar.
**Saída:** comandos e exemplos usados funcionam localmente, arquivos necessários estão presentes e os resultados ou testes entregues permitem conferir a solução correta.

**Registro:** 14.06 foi resolvido; 14.08 agora valida JSON inválido sem escrever nem renomear arquivos, coberto também por contraprova publicada; 14.11 é comparação de dependências e não exige contrato de JSON inválido. Em 14.12, a divergência entre as cinco fontes entregues e o bundle foi corrigida: `src/` corresponde a `sourcesContent`, HTML/bundles/maps apontam entre si e os 12 arquivos do manifesto estão presentes, preservando os nomes genéricos. O teste de referências 15.07/15.08 passou 2/2; o checker local TypeScript 6.0.3 é proxy estático limitado e não equivale integralmente ao alvo didático TypeScript 7.0.

**Atualização de 19/10/2026:** `13.14` continua com o bug de tags V3 e precisa de nova correção; `15.02` permanece um Parsons real e `15.08` está coerente, com ponte de migração apenas opcional; `15.05` foi aposentado para `16.09`. Ver “Plano de correção das etapas 11–15”.

## Fase 16: Lote 7 — TypeScript intermediário e avançado

**Faixa preservada:** 16.06, 16.07 e 16.10–19.07; exclui 16.09.
- [x] Conferir starters, referências e contratos de tipo no escopo estudado e reaproveitar os resultados anteriores indicados.
- [x] Corrigir instruções ou contratos confirmados que impediam o percurso ou aceitavam tipos incorretos.

**Pontos úteis do inventário:** material/solução de 16.06; transição de handle em 18.05; declare em 19.05 quando a tarefa exigir execução; alternativas de review em 16.07/17.09/18.05. Preparar #campo, noUncheckedIndexedAccess e exactOptionalPropertyTypes antes de exigir seu uso.

**Reutilizar:** resultados de 16.10, 18.07, 18.10 e 19.06 nas fases anteriores. A ausência de .test.js não é falha quando há avaliação de tipos, resposta ou análise adequada.
**Redução:** sem testar todas as combinações de flags e versões do TypeScript; usar a configuração declarada, contrastando outra somente quando isso for o próprio conteúdo.
**Saída:** o percurso de tipos estudado compila ou produz os diagnósticos esperados, com contrato explicado.

**Registro:** as referências com avaliação de tipos cobertas no lote foram verificadas com o checker local 6.0.3: 19 referências e 17 mutantes de contrato rejeitados (20/20 verificações reportadas). Os quatro IDs 16.10, 18.07, 18.10 e 19.06 reutilizam evidência anterior; atividades READ ou avaliadas por rubrica/resposta foram classificadas sem exigir checker de tipos. Limite: o proxy 6.0.3 não demonstra equivalência completa com o alvo didático TypeScript 7.0.

**Limites comuns do lote 11–16:** `npm run build:curriculum`, `npm run check:curriculum` e o versionamento/check de assets terminaram com código 0; o catálogo gerado contém 310 IDs. O gate de execução reportou 129 avaliações executadas, 133 puladas, zero referências falhando, 14 starters que não falham no gate, incluindo previsões/rastreios com aceitação intencional; os demais avisos não foram classificados nesta rodada, e quatro mutantes sobrevivem em três atividades. Os 15 IDs sinalizados incluem 08.01 PREDICT, cujo starter passa como esperado. Os testes de interface desta rodada usaram Chromium real via Playwright; o navegador habitual do proprietário não foi identificado nem homologado, e não há evidência de cobertura entre navegadores. O `npm test` completo terminou com código 1 após 269,4 s, em `test:executors` (409 testes: 406 passaram, dois falharam e um foi ignorado); as falhas observadas em 08.01 e na evidência Task 8 foram corrigidas e revalidadas focalmente, mas a cadeia inteira não foi repetida e as etapas posteriores não rodaram. Não há alegação de suíte global verde. A fonte 12.15–12.21 não foi auditada; não foram adicionados testes genéricos para atividades READ. Sem commit, push ou publicação.

## Fase 17: Lote 8A — arquitetura e JavaScript avançado (19.08–20.10)

**Situação:** reduzida e adiada até o estudo chegar a estes assuntos.
- [x] Escolher os exercícios que serão feitos e conferir entradas, saídas, assinaturas e arquivos de entrega.
- [x] Verificar a referência e o comportamento que a tarefa pede; corrigir somente falhas ainda atuais.

**Pontos úteis do inventário:** contratos de 20.01, 20.04–20.07, 20.09 e 20.10; pipeline 20.08. Esses casos já tiveram trabalho nas fases 5–6: reaproveitar a evidência e verificar apenas o necessário para o exercício selecionado.

**Fonte:** geradores task-9 da etapa 20; seguir o mapa de fontes e a regeneração protegida em cópia temporária.
**Redução:** sem uma revisão antecipada de todo o lote, benchmark profissional ou infraestrutura adicional para tarefas que cabem no ambiente atual.
**Saída:** a atividade avançada escolhida pode ser entendida, executada e conferida.

**Registro:** escolhidos 19.08 (emitter com payload associado à chave) e 20.08 (pipeline lazy). Em 19.08, starter, referência, transferência e saída publicada mantêm `Events[K]`; o typecheck strict da referência passou e `node --experimental-strip-types --test course-src/solutions/19.08/emitter.test.ts` passou 3/3. Em 20.08, starter, prompt/contrato, transferência, testes protegidos, referência e saída publicada estão alinhados: a verificação focal confirmou `[4,6]` com três pulls, `take(0)` sem consumo, fechamento da fonte no limite e no `break`, e ramificações imutáveis. Não foi confirmado defeito atual nesses dois IDs; nenhuma fonte funcional ou avaliação foi alterada. Limite: os demais IDs de 19.08–20.10 ficaram fora desta seleção; não houve percurso manual no navegador.

## Fase 18: Lote 8B — desempenho, Workers e integração JS/TS (21.01–22.07)

**Situação:** execução focal concluída para 21.01, 21.05 e 22.05; a prova didática de Worker nativo pode ser feita em navegador local quando esse exercício for estudado. Não há pendência de implementar ou homologar Worker dentro do site.
- [x] Conferir os contratos e executar a comparação de carga, a lógica de Worker e o caso CLI escolhido.
- [ ] Ao estudar Worker de navegador em 21.05, conferir os arquivos do exercício em navegador e servidor locais; a prova anterior com Worker Thread não confirma essa API. Não adaptar o executor nem o servidor do site para essa conferência.
- [x] Conferir os comandos CLI de 22.05 no Windows utilizado.

**Pontos úteis do inventário:** montagem/desmontagem de 21.02; ciclo de vida e pendências de 21.05; compatibilidade de process.argv em 22.04/22.05; material de transferência de 22.07. Em 21.04, o contrato é LRU, sem acrescentar TTL por engano. Em tarefas de desempenho, comparar a mesma carga em condições declaradas, sem construir uma suíte de benchmark além do objetivo.

**Reutilizar:** correções de 21.06–21.09 nas fases 4–6. Quando uma tarefa exigir resposta válida para entradas variadas, acrescentar casos que impeçam resposta decorada se a suíte atual for insuficiente; não impor testes aleatórios a todo exercício.
**Fonte:** geradores task-9 das etapas 21–22 e regra de cópia temporária.
**Redução:** sem homologação em vários navegadores, matriz extensa de desempenho ou distribuição pública de bibliotecas.
**Saída:** o recurso estudado funciona no ambiente local declarado, com resultados ou testes suficientes para conferir o comportamento exigido, sem depender do corretor do site.

**Registro:** em 21.01/21.05, a mesma função e carga de 50.000 números foi comparada no Node.js v26.7.0/Windows, após um aquecimento e em cinco amostras; medianas: 4,19 ms na thread principal e 4,64 ms no Worker Thread (inclui ida e volta). Em 21.05, o módulo real worker.js executou num Worker Thread real, com respostas entregues em ordem inversa ([25,4]) e associadas corretamente às chamadas ([4,25]); erro de tarefa rejeitou só a própria chamada, a seguinte retornou 1, e encerrar rejeitou o trabalho pendente e chamou terminate uma vez. O browser nativo foi tentado via Playwright/CUA e Edge/Chrome headless, mas o loopback do servidor local expirou e os binários headless falharam ao iniciar no sandbox; o cenário de navegador não está homologado. Em 22.05, o comando Windows 'node .\a.js' não imprimia o resultado porque a URL de entrada tratava incorretamente o caminho relativo; a fonte scripts/task-9-stage22.mjs agora normaliza o caminho com resolve/pathToFileURL. A geração em cópia temporária foi aplicada somente à entrada 22.05 dos artefatos, à referência e ao teste correspondentes. Após a correção, 'node .\a.js' imprime 15; importar a.js não executa o CLI; a API retorna 15, JSON inválido lança SyntaxError e formato inválido lança TypeError. 'npm run test:course-node-runtime' passou 12/12, incluindo o fixture de Worker/browser do runtime Node simulado. Os demais IDs de 21.01–22.07 não foram revisados nesta seleção.

## Fase 19: Lote 9 — pacotes, arquitetura e projeto final (22.08–23.11)

**Situação:** execução focal concluída em 22.08; brief pessoal preparado para 23.08.
- [x] Alinhar enunciado, starter, solução, testes e entrega empacotada em 22.08.
- [x] Escrever um brief curto de projeto pessoal com problema, funcionalidades, execução e conferência.

**Pontos úteis do inventário:** consumo de pacote/declarações em 22.08–22.10; contrato versus implementação em 23.01/23.03; passos de refatoração de 23.04; APIs de 23.02/23.09. Em 23.08, delimitar um projeto pessoal realizável, com persistência somente se necessária. Não exigir um projeto de 30–50 horas, arquitetura em camadas, diagrama ou documentação profissional por padrão.

Se o objetivo escolhido for aprender empacotamento, manter a prova pertinente (por exemplo npm pack, consumidor separado e checagem das declarações); dispensar publicação real, conta externa e processo de release. Se o objetivo for refatorar, preservar comportamento e conferir os passos. IDs sem descrição de defeito (23.05–23.07/23.11) só geram investigação se surgir problema.

**Reutilizar:** resultados anteriores sobre 22.08, 23.02, 23.10, contratos e rubricas. Não reordenar atividades para ajustar a narrativa.
**Fonte:** geradores task-9 das etapas 22–23 e regra de cópia temporária.
**Saída:** o exercício ou projeto escolhido cumpre seus requisitos pessoais e pode ser executado e conferido, sem requisitos de lançamento público.

**Registro:** 22.08 foi escolhido para praticar empacotamento. O prompt aponta para o cenário autoral e a transferência; esta pede instalar o tarball `@curso/centavos@0.1.0` em consumidor isolado, importar a API pela raiz, compilar `readonly number[]` e conferir exports/licença. O starter e a referência descrevem o mesmo pacote ESM, com `centavosParaTexto` (BRL/USD), `somarCentavos` e validação de centavos inteiros seguros. `node --test scripts/test-task-9-package-22-08.mjs` passou 1/1 em Node 26.7.0: a referência foi regenerada em diretório temporário; os testes do starter e da referência passaram 2/2 cada; TypeScript emitiu declarações da fonte JSDoc, e o consumidor compilou; o tarball instalado offline executou as duas funções e continha `dist/index.js`, `dist/index.d.ts`, `LICENSE`, `README.md` e `package.json`, sem `src/` ou scripts. Não houve correção funcional necessária nem publicação em registry. Limite: aviso de depreciação do teste sobre `spawnSync` com shell; não afetou o resultado.

**Brief pessoal 23.08 — quadro local de estudo:** problema: acompanhar tarefas de estudo sem conta ou serviço externo. Entrega: CLI que cria, lista, move entre “a fazer”, “fazendo” e “feito”, e remove tarefas; rejeita títulos vazios e IDs duplicados; salva/restaura o quadro em arquivo local após reiniciar; chama o serviço, com domínio e armazenamento separados. Execução: `npm install` e `node --experimental-strip-types src/cli.ts`; validação: `npm test` e `npm run typecheck`. Conferir criando e movendo uma tarefa, reiniciando a CLI e confirmando a restauração, depois removendo-a; também confirmar rejeição de entrada inválida e que a CLI não importa diretamente o adapter. Escopo pessoal: um usuário, armazenamento local e sem sincronização ou publicação.

## Fase 20: Fechamento leve do trabalho realizado

**Quando:** após concluir os lotes escolhidos para a rodada de estudo. Etapas avançadas adiadas permanecem adiadas; este fechamento não declara que foram executadas.
- [ ] Confirmar que as correções da rodada têm uma verificação pertinente e que nenhum defeito de conteúdo impede fazer localmente o exercício utilizado.
- [ ] Executar os testes focais pertinentes ao material alterado. Se houve geração curricular, executar o check correspondente com limite de tempo e registrar falhas/limitações. Não exigir npm test global nem corrigir infraestrutura interna para encerrar uma rodada de conteúdo; preservar os testes existentes, sem alegar suíte global verde.
- [ ] Conferir que o material alterado pode ser lido e copiado do site e que enunciado, código, arquivos e resultados esperados bastam para usar com IA e praticar fora dele. Executar o exercício na máquina local quando seu objetivo exigir execução; o site não precisa receber a tentativa, executar código ou aprovar a resposta.
- [ ] Se o proprietário usar rascunho/progresso do site e esse recurso tiver sido alterado, conferir salvamento e recarga. DOM, Worker e persistência do programa estudado são verificados no projeto local quando fizerem parte do objetivo, sem exigir suporte equivalente na plataforma.
- [x] Registrar em poucas linhas: atividades corrigidas, comandos/resultados, percurso manual conferido e pendências realmente adiadas.

**Registro Fase 20 — 19/10/2026:** revisão limitada aos trabalhos focais de 19.08, 20.08, 22.05 e 22.08 das fases 17–19; nesta fase, nenhuma fonte funcional foi alterada.

- `node --experimental-strip-types --test course-src/solutions/19.08/emitter.test.ts` — 3/3. `node --test scripts/test-master456-advanced.mjs` — 11/11, incluindo o contrato 20.08. `node --test scripts/test-task-9-package-22-08.mjs` — 1/1 em Node 26.7.0; consumidor temporário importou runtime e tipos do tarball. Permaneceu o aviso Node `[DEP0190]` de `spawnSync` com `shell: true`, sem falha no teste.
- `node --test scripts/test-course-node-runtime.mjs` — 12/12. `node .\a.js`, executado em `course-src/solutions/22.05`, imprimiu `15`; o contrato 22.05 também passou na execução publicada da bateria. `git diff --check` não apontou erro de whitespace.
- `npm.cmd run check:curriculum` executou a geração e validou 310 atividades, 0 avisos/erros da fonte, 21/21 checkpoints locais e modelo de progresso atual. Os gates strict registraram zero falhas strict; os gates reportaram 204 avisos editoriais conhecidos. `gate-execucao` terminou em modo warning/exit 0 e listou 15 IDs `starter-not-failing` (04.01, 05.01, 06.01, 06.02, 08.01, 08.07, 09.01, 09.04, 10.01, 12.14, 13.03, 13.07, 13.09, 20.01 e 23.04). Após esse relatório, o processo de `check:curriculum` ficou sem saída por mais de 70 s e foi interrompido; saída do comando completo: exit 1. Portanto, este check fica inconclusivo, sem atribuir os avisos gerais a defeito novo dos IDs focalizados.
- `npm.cmd test` foi executado uma vez com teto aproximado de 10 min e interrompido ainda em `test:stage02`; saída final do comando: exit 1 por interrupção, não por falha observada nessa parte. Blocos concluídos observados: catálogo 4/4, learning 62/62, executors 224 aprovados/0 falhas/1 skip (225 total), test-course-test-runtime 10/10, test-course-node-runtime 12/12, layout 4/4 e Stage 01 61/61. O resumo do executor marcou 21.05 como skip por exigir Worker nativo. Fases seguintes e o restante de Stage 02 não foram concluídos; não há resultado de suíte global.
- Tentativa no navegador: o inventário confirmou uma janela Edge “Estudar programacao”; a automação Windows dessa janela expirou antes do controle. O servidor local `vinext dev` iniciou a varredura de dependências, mas o acesso a `http://127.0.0.1:5173/` falhou no próprio host com `EACCES` de socket e no Edge com `ERR_CONNECTION_REFUSED`. Não foi possível fazer tentativa errada/correta nem salvar/recarregar rascunho/progresso. A aba local de erro foi fechada e não há processo `node`/`npm` remanescente. A caixa de percurso em navegador, incluindo a observação do Worker nativo, permanece pendente por bloqueio de acesso ao servidor loopback no sandbox; nenhum defeito funcional foi confirmado que justificasse editar código nesta fase.

**Dispensado:** exigir fases 21–23 concluídas, recontar todos os indicadores editoriais, atingir zero avisos, cobertura total, revisão de todo o catálogo, homologação de lançamento, execução/correção interna ou um percurso de tentativa errada/correta no site. Os bloqueios históricos de loopback, automação e Worker interno não geram tarefa de adaptação da plataforma. Nenhum gate será desligado para obter aprovação.
**Saída:** o material trabalhado permite estudar com IA e executar/conferir localmente quando necessário; verificações pertinentes e seus limites estão registrados. O progresso do site só entra na conferência se for utilizado e tiver sido afetado. O plano pode ser retomado na próxima etapa sem reabrir o que continua correto.

## Fase 21: Dispensada como fase independente — critérios editoriais

**Estado de escopo, não de execução:** removida da fila. Manter apenas clareza suficiente: o que fazer, qual material usar e como reconhecer o resultado. Reescrever somente quando houver confusão ou erro no conteúdo. Não há nova auditoria editorial de todo o curso, formato obrigatório de quatro blocos ou tamanho mínimo de texto.

## Fase 22: Dispensada como fase independente — revisão editorial por lote

**Estado de escopo, não de execução:** removida da fila. Melhorias necessárias de linguagem/material acompanham a correção da atividade nas fases 11–19. Não há segunda passagem editorial, obrigação de adicionar histórias RPG ou de uniformizar exemplos já coerentes.

## Fase 23: Campanha formal de acessibilidade dispensada

**Estado de escopo, não de execução:** removida da fila obrigatória para o uso pessoal descrito. Preservar navegação por teclado, foco, labels e anúncios existentes. Corrigir qualquer controle inacessível que atrapalhe o proprietário, sem abrir uma campanha completa de homologação.

**Condição de reativação:** se o proprietário depender de leitor de tela ou navegação exclusiva por teclado, validar o percurso usado com essas ferramentas. Não alegar acessibilidade validada apenas pela existência de ARIA ou por um teste de DOM.

## Registro desta revisão — 18/10/2026

Replanejamento documental aprovado na conversa para uso privado como auxiliar de estudo: 10 fases reduzidas (11–20) e 3 retiradas da fila autônoma (21–23, com acessibilidade condicional). Mantidos os registros das fases 1–10, IDs, escopos de referência e mapa de fontes; substituídas as regras globais e o trabalho futuro pelo critério de utilidade pessoal. Nenhuma alteração funcional, execução das fases futuras, remoção de teste, commit ou publicação faz parte desta revisão.

## Ajuste de escopo — 19/10/2026

O proprietário esclareceu que copia os exercícios para uma IA e executa JavaScript, TypeScript e demais programas na própria máquina. A regra vale para as 23 fases e todas as etapas curriculares: retiradas as obrigações futuras de adaptar estrutura, runners e corretores do site, homologar execução interna, obter nota automática ou registrar tentativas externas. Mantidos conteúdo correto, material copiável/suficiente, comandos e arquivos necessários, resultados esperados e testes locais pertinentes ao aprendizado. Ajustados o fechamento da fase 20 e o enquadramento da prova local de Worker da fase 18; execução local de DOM/Worker não foi confundida com suporte na plataforma. Registros históricos, IDs, ordem e recursos existentes preservados. Revisão somente documental; sem alteração funcional, remoção de testes, commit ou publicação.
