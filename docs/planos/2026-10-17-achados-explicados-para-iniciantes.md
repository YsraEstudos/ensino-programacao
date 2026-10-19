# Achados do plano mestre do DevPath, explicados para iniciantes

**Data da revisão documental:** 17/10/2026.  
**Fonte exclusiva:** [plano-mestre-diagnostico-integral-devpath.md](plano-mestre-diagnostico-integral-devpath.md).  
**Objetivo:** explicar os problemas de organização, execução e verificação desse plano e propor formas de realizar suas fases com menos retrabalho.

Este guia foi refeito para tratar somente das **23 fases do plano mestre**. A numeração usada abaixo sempre se refere a ele. Os demais planos, registros de outras frentes e suas pendências não fazem parte desta revisão.

A análise é documental: uma contradição entre duas regras do mestre pode ser confirmada pela leitura; já um defeito que ele atribui a uma atividade continua sendo um **achado a verificar no código**. Este guia não declara essas correções implementadas e não altera o plano mestre.

## 1. Como entender a revisão

Imagine uma reforma com uma lista de serviços. Alguns problemas estão na própria lista: a vistoria aparece antes do serviço que ela exige; o mesmo reparo aparece em dois lotes; um item informa apenas o número da sala, sem dizer o que consertar.

Organizar a lista pode acelerar a reforma. Isso não permite concluir que uma instalação já está correta sem examiná-la, nem eliminar uma verificação importante só para terminar mais cedo.

Neste documento, as conclusões são separadas assim:

| Categoria | Significado |
|---|---|
| Confirmado no texto | Duas regras, uma contagem ou um trecho do próprio mestre mostram a inconsistência. |
| Risco de execução | A redação permite uma interpretação que pode gerar retrabalho, bloqueio ou avaliação inadequada. |
| Simplificação proposta | Uma forma mais direta de cumprir o objetivo; ainda precisa ser incorporada ao plano antes da execução correspondente. |
| Verificação técnica pendente | O mestre aponta um possível defeito, mas sua situação atual não foi comprovada nesta releitura documental. |

## 2. Pequeno dicionário

| Termo | Explicação simples |
|---|---|
| Fase | Uma parte do trabalho de corrigir o DevPath, como conferir gabaritos ou revisar um lote. |
| Etapa | Uma parte do curso feito pelo aluno. A atividade `16.06` pertence à etapa 16; isso não a coloca automaticamente na fase 16 do trabalho. |
| ID | O identificador de uma atividade, como `11.12`. Ele deve continuar ligado ao progresso do aluno. |
| Linha de base | O retrato inicial usado para comparar o que mudou. Precisa de data e alcance definidos. |
| Starter | Os arquivos iniciais entregues ao aluno. Podem conter uma tarefa incompleta ou um programa correto para investigar. |
| Referência | Uma solução preparada pela equipe para demonstrar o resultado esperado. |
| Contrato | As regras visíveis da tarefa: entradas, saídas, nomes necessários, limites e erros esperados. |
| Rubrica | Critérios usados para avaliar um resultado ou uma explicação. |
| Mutante | Uma versão com erro proposital, usada para conferir se os testes percebem esse erro. |
| Gate | Uma verificação de aceite. Pode avisar ou impedir o fechamento, conforme a regra definida. |
| Runner | O componente que executa código ou testes. |
| Build e regeneração | Processos que preparam ou recriam arquivos a partir das fontes do projeto. |
| Fonte de verdade | O lugar que deve ser editado para que a próxima geração preserve a mudança. |
| DOM | A estrutura de elementos de uma página, como botões, campos e imagens. |
| Worker | Um recurso para executar trabalho separado do fluxo principal da página. |
| Parsons | Um exercício em que o aluno reorganiza blocos de código. |

## 3. Os achados sobre o plano mestre

### Achado 1 — A ordem de fechamento é impossível de seguir literalmente

**Classificação:** confirmado no texto.

A instrução inicial manda executar as fases de 1 a 23 em ordem. Porém, a fase 20 exige que a fase 23 já esteja concluída. A equipe precisaria terminar a 20 para avançar, mas avançar para conseguir terminar a 20.

**Simplificação:** deixar a fase 20 como fechamento final, depois da acessibilidade prevista na fase 23. Manter os números originais nas referências, deixando explícita a ordem corrigida.

**O que preservar:** a regressão completa e a verificação de teclado. O problema está na ordem, não na existência dessas verificações.

**Base no mestre:** “Como usar este plano”, fase 20 e fase 23.

### Achado 2 — As orientações editoriais aparecem depois dos lotes que precisam delas

**Classificação:** confirmado no texto, com risco de retrabalho.

As regras gerais dos lotes já exigem o template de quatro blocos. As fases 21 e 22 detalham esse método e mandam aplicar suas ações nas fases 9–19, embora a ordem numérica as coloque depois desses lotes e do fechamento.

É como receber o modelo obrigatório do relatório depois de entregar todos os relatórios.

**Simplificação:** transformar o conteúdo das fases 21–22 em referência editorial disponível antes dos lotes. Aplicar seus critérios durante a revisão de cada atividade, sem abrir uma segunda rodada obrigatória para repetir o mesmo trabalho.

**O que preservar:** contexto compreensível, missão clara, contrato e critérios de avaliação. Usar uma referência não significa abandonar essas exigências.

**Base no mestre:** “O que toda fase de lote faz”, fases 21 e 22.

### Achado 3 — O mesmo defeito reaparece em várias fases sem um aceite único

**Classificação:** repetição confirmada; risco de execução duplicada.

O mestre trata `08.07` na fase 3 e volta a citá-la na fase 12. Faz o mesmo com casos como `13.14`, `16.10`, `18.07`, `20.08` e `23.10`. A regra dos lotes manda verificar inclusive os achados já tratados nas fases 2–8.

Uma conferência de integração é útil. Refazer toda a investigação e registrar a mesma correção várias vezes é outra coisa.

**Simplificação:** dar a cada defeito um único registro com atividade, problema, fonte, resultado e evidência. No lote posterior, conferir se a correção continua válida e acrescentar apenas o que ainda falta. Sempre que possível, resolver contrato, arquivos, teste e texto da atividade na mesma passagem.

**Cuidado:** um item marcado “já reconferido” não prova que o código não mudou desde então. Registrar a referência da conferência permite reaproveitar evidência sem dispensar a confirmação do estado relevante.

**Base no mestre:** fases 3–6, regra 1 dos lotes e referências cruzadas nas fases 9–19.

### Achado 4 — O protocolo de “starter falha, solução passa” é amplo demais

**Classificação:** risco de execução e falta de alinhamento entre regras.

O protocolo geral exige que o teste falhe no starter ou na versão defeituosa e passe na solução. Isso faz sentido para uma implementação incompleta ou uma correção de bug.

Mas o próprio mestre também prevê `READ` e `COMPARE` com rubrica. Uma previsão pode usar código já correto. Uma refatoração pode preservar exatamente o resultado inicial. Nesses casos, obrigar a falha do programa cria uma tarefa diferente da pretendida.

**Simplificação:** definir o aceite conforme o objetivo:

| Objetivo | Evidência adequada |
|---|---|
| Implementar ou corrigir um comportamento | A referência passa; a versão com o defeito relevante é rejeitada. |
| Prever ou rastrear uma execução | A resposta ou tabela do aluno é comparada ao comportamento esperado. |
| Ler ou comparar artefatos | Critérios específicos para a análise, com rótulo compatível com a forma de avaliação. |
| Refatorar preservando comportamento | Regressões continuam passando e a mudança solicitada é avaliada separadamente. |

**O que não fazer:** inserir um bug artificial em toda leitura ou refatoração apenas para obter um starter vermelho. Também não concluir que toda atividade conceitual deve ficar sem testes: é possível verificar suas respostas, seus exemplos e sua interface.

**Base no mestre:** protocolo de verificação, fase 4 e regra 4 dos lotes.

### Achado 5 — A conversão de prosa em código precisa seguir a tarefa

**Classificação:** risco de ampliação desnecessária do trabalho.

Os lotes exigem transformar starters baseados em `material.md` em código executável. A fase 22 reforça essa conversão. Ao mesmo tempo, existem tarefas de leitura e comparação em que texto, diff ou diagrama podem ser os materiais corretos.

O problema a resolver é o aluno não receber o artefato necessário para realizar a missão. O nome da extensão do arquivo, sozinho, não determina isso.

**Simplificação:** primeiro identificar o que a atividade pede. Se pede executar ou modificar um programa, fornecer o código necessário. Se pede analisar um texto ou diagrama, fornecer esse material e critérios claros. Previsões podem usar código pronto, sem exigir outra implementação do aluno.

**Cuidado:** não restringir essa decisão apenas aos rótulos `MODIFY` ou `DEBUG`. Projetos, testes, exercícios de tipos e outros formatos também podem precisar de arquivos executáveis. Conferir o contrato de cada caso listado.

**Base no mestre:** regras 3–4 dos lotes, listas “Prosa → código” e fase 22.

### Achado 6 — O custo das verificações se repete em todas as fases

**Classificação:** exigência repetida confirmada; economia proposta sem estimativa de tempo.

A sequência geral pede `check:curriculum`, `npm test` e verificadores específicos ao fechar cada fase. Os lotes repetem essa exigência, e a fase 20 ainda exige regressão completa.

O texto justifica verificar as mudanças, mas não distingue uma pequena alteração de enunciado de uma alteração no runner ou na persistência.

**Simplificação:** trabalhar com três níveis: teste focal da correção; integração do lote ou componente afetado; regressão completa no fechamento e nas integrações que a exijam. Compartilhar a preparação dos arquivos quando isso for compatível com os comandos reais.

A linha de base da fase 1 continua necessária. Ela pode ser um bloco curto de preparação, sem virar uma cerimônia independente de várias entregas documentais.

**Limite:** esta revisão não mediu os comandos nem examinou seus scripts. Não afirma quantas regenerações internas cada execução realiza, nem promete uma porcentagem de redução de tempo.

**Base no mestre:** “Sequência de fechamento de fase”, fase 1, regra 8 dos lotes e fase 20.

### Achado 7 — A promoção dos gates precisa de alcance e momento definidos

**Classificação:** risco de bloqueio entre fases.

As fases 2, 4 e 6 mandam promover gates a erro. Os lotes precisam fechar sem aviso em seu escopo, e a fase 20 exige todos os gates definidos nas fases 2–19 em modo erro e passando.

Se um gate passar a bloquear o catálogo inteiro antes de outros lotes serem corrigidos, uma entrega pequena pode depender de resolver problemas que o plano deixou para depois. O texto precisa distinguir verificação global de verificação do lote.

**Simplificação:** dizer, para cada gate, qual regra verifica, quais IDs abrange, quando vira bloqueante e como tratar resultados classificados como falsos ou parciais. Durante uma entrega, exigir o aceite de seu escopo e impedir regressões. No fechamento final, conferir todos os critérios exigidos e suas classificações.

**O que não fazer:** tratar todo aviso como bug comprovado ou esconder um problema apenas desligando um rótulo. Quando o mestre diz “sem teste”, conferir também a existência de verificações de tipos, de respostas ou de outro formato previsto na atividade.

**Base no mestre:** protocolo de classificação, fases 2, 4, 6, 16 e 20.

### Achado 8 — Existem contagens incompatíveis dentro do próprio documento

**Classificação:** confirmado no texto.

Duas diferenças podem ser observadas sem consultar o catálogo:

- A fase 11 anuncia 30 atividades, mas soma ALTA 4 + MÉDIA 15 + BAIXA 12 = **31**.
- A tabela da fase 4 enumera **12 IDs distintos**, incluindo os grupos de duas e três atividades, mas o critério de saída fala em **13 atividades**.

Outros números, como 254 atividades, 62 dicas e 61 atividades sem mutante, devem ser apresentados como retrato de uma verificação identificada. A data geral do documento não esclarece necessariamente quando cada contagem foi medida.

**Simplificação:** corrigir a aritmética e definir a linha de base de cada inventário. Usar uma lista de IDs como referência e derivar a quantidade dessa lista, quando possível. Não transformar uma contagem antiga automaticamente em quantidade de trabalho novo.

**Limite:** este guia não apresenta uma contagem atual do catálogo nem afirma quais desses defeitos continuam abertos no código.

**Base no mestre:** fase 4, fase 11 e resumos quantitativos das fases 2, 7, 21 e 22.

### Achado 9 — Os limites dos lotes não correspondem a todos os itens atribuídos

**Classificação:** confirmado no texto.

A fase 12 termina em `11.12` no título, mas também lista `11.14`. A fase 15 termina em `16.05`, mas inclui `16.09` na lista “Sem teste”. A fase 16 começa em `16.10`, mas lista `16.06` e `16.07`.

Além disso, o intervalo da fase 12 alcança `11.08` e `11.10`, que a fase 13 trata como parte do lote específico de Kanban. É necessário deixar explícito se estão excluídas do lote anterior ou se apenas recebem uma conferência posterior.

**Simplificação:** dar a cada pendência um lote responsável e declarar as exceções aos intervalos. Agrupar pelo assunto e pela fonte que será editada pode facilitar mais que manter uma quantidade fixa de atividades.

**Cuidado:** etapa e fase não são sinônimos. O problema não é `16.06` aparecer na fase 16; é o título dessa fase anunciar um intervalo diferente do conteúdo atribuído.

**Base no mestre:** títulos e listas das fases 12, 13, 15 e 16.

### Achado 10 — Alguns itens não explicam o que deve ser corrigido

**Classificação:** insuficiência de descrição confirmada.

Na fase 13, há um item de gravidade alta escrito apenas como “12.05”. Na fase 14, vários IDs aparecem como alta gravidade sem descrição individual. A fase 19 também reúne alguns itens médios apenas por intervalo.

Isso identifica onde olhar, mas não o defeito, o comportamento esperado ou a forma de comprovar a correção. Outra pessoa precisaria refazer a investigação antes de estimar a tarefa.

**Simplificação:** usar um registro curto: **atividade + problema + resultado esperado + forma de conferir**. Se o defeito ainda não foi definido, registrar “investigar”, sem apresentar o item como correção já especificada.

Por exemplo: “atividade X: o teste cobra uma função não informada; declarar a assinatura no material e conferir a referência”. Não é necessário criar um relatório separado para cada linha.

**Base no mestre:** fases 13, 14 e 19; obrigação geral de registrar o resultado no próprio item.

### Achado 11 — O template editorial pode gerar duplicação e trabalho mecânico

**Classificação:** exigência confirmada; simplificação proposta.

A fase 21 exige cenário, problema, missão e contrato tanto em `prompt` quanto em `preparation`. Os lotes também mandam reescrever enunciados nesse formato, e a fase 22 guarda ações editoriais adicionais.

Um projeto grande precisa de um briefing suficiente. Uma tarefa curta pode precisar apenas de um objetivo compreensível, um exemplo e seu contrato. Repetir os mesmos blocos em dois campos não garante mais clareza.

**Simplificação:** usar os quatro blocos como referência de completude, ajustando a apresentação ao tamanho da tarefa. Evitar duplicação entre os campos e revisar o texto na mesma passagem da correção técnica.

**Cuidado:** “menos de 150 caracteres” é um filtro de triagem, não uma prova de qualidade. Não proibir contexto nas etapas básicas nem acrescentar histórias apenas para preencher um formato. Uma primeira dica também precisa ajudar no problema concreto; uma frase automática genérica pode continuar ruim.

**Base no mestre:** fase 2, regra 5 dos lotes e fases 21–22.

### Achado 12 — A tabela de fontes precisa orientar a decisão por campo

**Classificação:** risco de execução por orientação incompleta.

A tabela inicial oferece receitas, textos de etapa, overrides, primers e geradores diferentes. A fase 21 acrescenta uma dica sobre sobrescrever campos por `publication-overrides.json`. O leitor precisa saber qual dessas opções controla o campo específico que deseja alterar.

Não basta descobrir um arquivo com o texto parecido: a próxima geração pode usar outra fonte ou outra regra de prioridade.

**Simplificação:** esclarecer, por tipo de mudança, a fonte preferida, o comando necessário, seu local e suas condições de execução e o artefato que deve ser conferido depois. Quando houver mais de uma fonte possível, explicar a prioridade, especialmente para `prompt`, `firstResponse` e `preparation`.

**Limite:** o mestre afirma que há merge desses campos; esta releitura não verifica o código do gerador nem confirma a precedência efetiva. Essa confirmação é parte do procedimento técnico antes da edição.

**O que não fazer:** congelar toda uma linguagem ou redesenhar todos os pipelines só para simplificar o plano. Primeiro tornar o caminho existente compreensível e verificável.

**Base no mestre:** tabela “Onde editar” e dica ao final da fase 21.

### Achado 13 — Contratos claros não exigem enunciados longos nem testes permissivos

**Classificação:** oportunidade de simplificação apoiada nos problemas listados.

A fase 6 lista nomes e formatos ocultos. Vários lotes também citam assinaturas, campos e mensagens que o aluno não recebe. A correção pode ser pequena: assinatura visível no starter e uma linha objetiva com entradas, saídas e falhas relevantes.

Se uma mensagem exata é apenas detalhe acidental, o teste pode avaliar tipo, código ou propriedade adequada ao objetivo. Porém, “lançou qualquer erro” pode aceitar um programa que falhou pelo motivo errado. As exigências de não expor segredos ou causas técnicas indevidas, citadas na fase 5, devem continuar protegidas.

O mestre também lista `15.07` entre contratos de formato ocultos enquanto informa que o `RangeError` já está declarado no enunciado; a fase 15 repete essa ressalva. É preciso dizer qual parte, se alguma, permanece oculta nesse caso.

**Simplificação:** corrigir somente o contrato confirmado como faltante e manter a API pública que a atividade pede. Fornecer os arquivos mínimos suficientes ao aluno, sem criar uma estrutura complexa sem necessidade e sem esconder dependências dentro do teste.

**Base no mestre:** fases 4–6, fase 15 e contratos citados nos lotes.

### Achado 14 — Mutantes, timeout e compatibilidade de runners são trabalhos diferentes

**Classificação:** risco de ampliar ou enfraquecer a correção.

A fase 7 já separa infraestrutura de interrupção e formato de mutantes da autoria dos mutantes nos lotes. Essa separação é útil. A fase 8, por sua vez, propõe padronizar runners por faixa de etapa para corrigir discrepâncias concretas.

**Simplificação:** preservar três objetivos separados: interromper uma execução que trava; detectar os defeitos relevantes com mutantes; alinhar os testes fornecidos ao ambiente que realmente os executa. Um runner compatível não exige automaticamente migrar todas as suítes que já funcionam.

Para os mutantes, priorizar erros prováveis, graves ou capazes de revelar teste vácuo. Se a meta de ao menos um mutante por teste novo for revista para reduzir autoria mecânica, a mudança precisa ser explícita, com justificativa de cobertura; não cancelar silenciosamente a proteção dos lotes.

**O que comprovar:** a referência correta passa; o defeito pretendido é percebido; uma falha de importação ou do ambiente não é confundida com sucesso pedagógico. No caso de travamento, mostrar que a interrupção ocorreu, em vez de apenas trocar o exemplo por outro que termina.

**Limite:** este guia não afirma qual mecanismo de timeout existe hoje nem que os quatro casos de runner continuam quebrados. São verificações técnicas exigidas pelos itens do mestre.

**Base no mestre:** fases 7–8, regra 4 dos lotes e caso `21.05` da fase 18.

### Achado 15 — Os critérios de navegador e acessibilidade precisam dizer o que comprovam

**Classificação:** limite de escopo e necessidade de aceite mais preciso.

A fase 23 cobre teclado nas etapas 00–03. A fase 20 pede Chromium nas etapas que usam DOM e Worker. Esses escopos devem se complementar: uma verificação de um fluxo não comprova automaticamente todos os outros.

**Simplificação:** manter cenários representativos dos caminhos exigidos pelo mestre, usando automação para repetir ações como Tab, Enter e conferência de foco. Quando a conclusão envolver anúncio por leitor de tela, usar uma observação adequada a essa afirmação; conferir apenas o texto de `aria-live` não registra, por si só, como ele foi anunciado.

No caso de `11.12`, um teste focal precisa interpretar HTML para distinguir criação de elementos de exibição literal como texto. Isso pode ser feito em um DOM com parser adequado, sem exigir a abertura de um navegador completo para cada caso da função. A integração no navegador continua necessária onde o mestre a exige.

**O que preservar:** o fluxo completo por teclado, a conferência dos estados atual e histórico e os testes pertinentes de DOM e Worker. Um único smoke test não deve receber uma conclusão maior que seu alcance.

**Base no mestre:** caso `11.12` da fase 12, caso `21.05` da fase 18 e fases 20 e 23.

## 4. O que fazer com cada uma das 23 fases

As linhas abaixo explicam como simplificar a execução proposta. Não marcam nenhuma fase como concluída e não confirmam a situação atual de seus defeitos no código.

| Fase do mestre | Simplificação recomendada | Verificação que permanece |
|---|---|---|
| 1 — Linha de base | Usar um bloco curto de preparação, com data, comandos e resultados. | Conhecer as falhas e limitações iniciais antes de corrigir. |
| 2 — Gerador, dicas e previsão | Corrigir regras compartilhadas confirmadas e revisar exceções, sem redigir tudo manualmente nem gerar pistas genéricas indiscriminadamente. | Conferir fonte e conteúdo publicado; manter dica útil e primeira ação compreensível. |
| 3 — Gabaritos e conteúdo | Conferir e corrigir os itens na mesma passagem das atividades envolvidas. | Gabarito, exemplos e feedback coerentes; resultado registrado por item. |
| 4 — Starter, solução e testes | Fornecer o material mínimo suficiente e alinhar a API; corrigir a contagem de saída. | Referência e suíte compatíveis, com aceite adequado ao tipo de atividade. |
| 5 — Bugs nas referências | Fazer correções locais preservando a API sempre que possível. | Um caso que revele o defeito confirmado e proteção dos contratos relevantes. |
| 6 — Contratos ocultos | Publicar assinatura, formatos e falhas de maneira curta e visível. | Nenhuma regra avaliada fica escondida; reclassificar itens já declarados. |
| 7 — Mutantes e travamentos | Separar infraestrutura, formato e autoria; reaproveitar proteção já comprovada após conferência. | Interrupção demonstrada e mutantes representativos do defeito pretendido. |
| 8 — Compatibilidade dos runners | Corrigir incompatibilidades confirmadas por atividade, evitando migração geral sem necessidade. | Material e avaliador compatíveis; informar onde a atividade é verificada. |
| 9 — Lote D–02 | Conferir cada problema e fornecer o artefato apropriado à tarefa introdutória. | Previsão, saída, critérios e transferência com regras visíveis. |
| 10 — Lote 02–05 | Concentrar contrato, texto, pré-requisitos e casos relevantes na mesma revisão. | Parsons aceita ordens válidas; as bordas realmente diferenciam os resultados. |
| 11 — Lote 05–08 | Corrigir a soma das gravidades e priorizar vazamento de resposta e regras incoerentes. | Resposta independente, exemplos corretos e verificações pertinentes. |
| 12 — Lote 08–11 | Delimitar as exceções do intervalo e tratar cada contrato técnico antes da revisão editorial. | Teste de renderização segura, referências DOM coerentes e ordem dos dados correta. |
| 13 — Kanban e etapa 12 | Especificar `12.05` e agrupar as correções de cada projeto. | Contratos, erros, concorrência e formatos de resposta conforme a tarefa. |
| 14 — Etapa 13 | Descrever os defeitos dos IDs e reaproveitar correções centrais já aceitas. | Arquivos fornecidos, rubrica específica e texto de ambiente coerente. |
| 15 — Lote 13–16 | Separar arquivos faltantes, contratos, ferramentas e edição de texto; ajustar o intervalo. | Comandos e artefatos exigidos disponíveis e pré-requisitos preparados. |
| 16 — Lote 16–19 | Corrigir o alcance do lote e verificar avaliações de tipos antes de concluir que faltam testes. | Verificador configurado, contratos de tipos e comportamento solicitado. |
| 17 — Etapa 20 | Revisar o gerador em uma entrega coordenada, reunindo contratos, pipeline e texto. | Correções reproduzíveis e casos que revelem os defeitos confirmados. |
| 18 — Etapas 21–22 | Agrupar alterações das mesmas fontes e preservar os objetivos de cada caso. | Worker, concorrência, encerramento, comportamento no Windows e contrato local pertinente. |
| 19 — Etapas 22–23 e capstones | Reunir briefing, arquivos, avaliação e documentação de cada entrega, com descrições completas dos itens. | Pacote e consumidor corretos, mudanças sem regressão e capstone com critérios verificáveis. |
| 20 — Fechamento | Executar por último, após as entregas de que depende. | Gates exigidos, regressão ampla e nenhuma alta gravidade pendente para o aceite. |
| 21 — Método editorial | Disponibilizar como referência antes dos lotes, sem repetir os mesmos blocos em dois campos. | Contexto suficiente, missão clara, contrato e exemplos coerentes. |
| 22 — Ações editoriais | Associar cada ação ao lote responsável, sem outra rodada duplicada. | Revisão editorial concluída durante a correção da atividade correspondente. |
| 23 — Acessibilidade | Executar antes do fechamento e reutilizar cenários automatizados pertinentes. | Fluxo por teclado, foco, estados, retorno ao usuário e observação adequada dos anúncios. |

## 5. Uma sequência mais curta para executar o mesmo escopo

Esta é uma proposta de organização. Os números originais continuam servindo para localizar as exigências do mestre.

1. **Preparar a execução:** registrar a linha de base da fase 1, disponibilizar os critérios editoriais das fases 21–22 e definir responsáveis, fontes e aceite.
2. **Corrigir os mecanismos compartilhados confirmados:** tratar a geração da fase 2, a infraestrutura da fase 7 e as incompatibilidades de execução da fase 8, conforme o que for comprovado.
3. **Corrigir atividades em lotes coordenados:** reunir os problemas das fases 3–6 com os lotes 9–19, usando um único registro por defeito. Fazer contrato, arquivos, avaliação e texto na mesma passagem quando houver relação direta.
4. **Conferir os fluxos exigidos:** executar a acessibilidade da fase 23 e as verificações de DOM e Worker previstas no fechamento, reexecutando cenários afetados por mudanças posteriores.
5. **Fechar a integração:** executar a fase 20 depois de suas dependências, registrar comandos, resultados, classificações e limitações restantes.

Os lotes devem continuar pequenos o bastante para revisão e recuperação. Agrupar por fonte não significa colocar todas as etapas num único conjunto enorme de alterações, nem dispensar verificações entre mudanças arriscadas.

## 6. Como registrar o trabalho sem criar outra camada de burocracia

O próprio mestre já pede registro no item da fase. Ele não exige um conjunto de arquivos de preparação, desenho e relatório para toda pequena tarefa. Essa regra enxuta deve ser preservada.

Um registro suficiente pode responder:

| Campo | O que escrever |
|---|---|
| Atividade e problema | Qual ID ou fluxo está sendo tratado e qual divergência foi encontrada. |
| Classificação | Confirmado, falso ou parcial, com justificativa. |
| Fonte responsável | Qual fonte indicada no mestre controla o conteúdo alterado. |
| Correção e verificação | O que mudou e qual comando ou observação demonstra o resultado. |
| Limite | O que ainda não foi verificado e se isso impede o aceite. |

Apontar os logs dos comandos pode ser suficiente; não é preciso recontar toda a execução em vários textos. Uma decisão técnica difícil recebe explicação adicional quando isso ajudar a manutenção. A documentação não deve substituir a prova da correção.

## 7. Proteções do mestre que devem continuar

- **Preservar IDs, rascunhos e progresso:** as mudanças devem respeitar as restrições e migrações previstas no próprio mestre.
- **Manter `06.10` e `12.13` nas posições decididas:** a simplificação não reabre essa decisão automaticamente.
- **Corrigir somente problemas confirmados:** um ID listado ou um aviso não comprova sozinho um defeito atual.
- **Manter contratos visíveis e referências coerentes:** reduzir texto não autoriza esconder nomes, erros ou formatos avaliados.
- **Preservar a avaliação pertinente:** sem cancelar testes conceituais, checagens de tipos ou mutantes em bloco e sem desligar rótulos para encobrir problemas.
- **Usar as fontes indicadas e conferir o conteúdo publicado:** nenhuma proposta deste guia autoriza editar espelhos gerados indiscriminadamente.
- **Manter segurança e interrupção de execução:** não eliminar casos relevantes apenas porque expõem uma falha difícil.
- **Preservar acessibilidade e regressão final:** automatizar ações repetidas deve melhorar a repetibilidade da prova, com conclusões proporcionais ao teste realizado.
- **Manter a autorização explícita para produção:** reorganizar o trabalho não autoriza publicar.

Não há medição nesta revisão para prometer “80% de economia”, “um quarto do tempo” ou ausência de retrabalho. As propostas reduzem repetições e ambiguidades identificadas no texto. A economia real depende da confirmação técnica dos itens e do custo dos comandos usados na execução.

## 8. Fonte e limites desta versão

A única fonte documental analisada para esta versão é o [plano mestre](plano-mestre-diagnostico-integral-devpath.md), com data de revisão de 17/10/2026.

Os caminhos de código, tipos de teste e IDs mencionados são assuntos tratados pelo próprio mestre. Eles aparecem para explicar o alcance das recomendações, sem transformar este guia numa auditoria geral do repositório.

Esta reescrita não consultou os outros planos para importar estados de conclusão, contagens de catálogo, bancos de variantes ou pendências de outras frentes. Não executou builds, testes ou fluxos de navegador. Antes de implementar uma correção, continua valendo o protocolo do mestre: conferir o estado relevante, classificar o achado e produzir a evidência adequada.
