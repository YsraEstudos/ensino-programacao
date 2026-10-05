# DevPath: primeiros cinco exercícios de JavaScript

> Registro histórico. Os caminhos, comandos e distribuições abaixo descrevem a estrutura da época; não devem orientar a manutenção atual. Consulte [a organização atual](../organizacao-projeto.md) e execute `npm.cmd run build:curriculum` dentro de `devpath-publish/`.

## Estado

Especificação de design e plano aprovados pelo usuário em 27/09/2026. Implementação concluída com validação local; a persistência em D1 autenticado não foi exercitada sem sessão autenticada.

## Objetivo e limites

Criar no DevPath uma introdução prática a JavaScript para quem parte do zero, cobrindo os cinco primeiros exercícios ativos da etapa 00: 00.01 a 00.05. O diagnóstico D.01–D.05 fica fora deste escopo. Cada exercício ensina os conceitos que cobra antes de pedir a tarefa principal; todos exigem que o aluno escreva ou edite código, inclusive 00.05. A experiência deve ser interativa e animada, funcionar por teclado e respeitar a preferência do sistema por movimento reduzido.

O trabalho integra a prévia estática da raiz do projeto e a versão autenticada em `devpath-site`, sem substituir as aulas existentes de HTML e CSS. Não inclui publicação externa, as outras atividades do currículo, contas novas, mudança de banco de dados ou um executor geral de JavaScript/Node.

## Referências e decisões editoriais

O PDF `output/pdf/JavaScript_TypeScript_Roteiro_do_Site_3a_Edicao.pdf` é a referência curricular para os contratos 00.01–00.05, especialmente as páginas 19–23. `course-src/bridges.md` fornece a ponte conceitual da etapa 00. Esses arquivos são material de referência; o pedido direto do usuário define a adaptação do site.

O contrato do PDF descreve 00.05 como leitura/classificação sem edição de código. Por pedido explícito do usuário, a versão do site preservará a classificação dos 12 itens e acrescentará uma pequena tarefa de escrita e execução usando construções já ensinadas. O PDF de referência não será alterado neste escopo.

## Abordagens consideradas

1. **Expandir os quizzes existentes.** Menor mudança, mas não atende à prática frequente de escrita de código.
2. **Criar uma área interativa própria para a etapa 00.** Reaproveita a navegação e o progresso existentes, dá espaço para ensinar, animar, editar e executar cada exercício. Esta é a abordagem escolhida.
3. **Criar um executor geral de Node.js.** Aumenta muito o escopo e introduz uma fronteira de execução arbitrária que os cinco exercícios iniciais não precisam.

## Experiência do aluno

Cada exercício usa a mesma sequência:

1. **Aprender:** objetivo, explicação curta, vocabulário e exemplo resolvido antes da atividade.
2. **Ver:** animação controlável do programa ou da transformação, com avanço/volta e opção de pausar.
3. **Conferir entendimento:** micropergunta ou previsão curta com feedback explicativo.
4. **Praticar:** escrever ou editar código no editor da etapa 00 e registrar uma previsão antes de executar quando o contrato pede previsão.
5. **Executar e refletir:** mostrar a saída, apontar a primeira divergência e pedir uma explicação curta; oferecer três níveis de dica e uma tarefa de transferência.

| ID | Conceito ensinado antes da tarefa | Interação e evidência de código |
| --- | --- | --- |
| 00.01 — Primeiro rastreamento | Código-fonte versus saída; chamadas `console.log`; leitura de cima para baixo; expressões aritméticas simples. | Prever três linhas, digitar o programa de logs, executar e explicar a contribuição de cada linha. A animação move o indicador de execução e revela as saídas na ordem. |
| 00.02 — Rastreamento com contradição | A saída depende do texto atual do programa; mudar uma chamada altera sua própria saída sem reordenar as demais. | Editar uma linha, registrar nova previsão e executar. Uma comparação visual marca a linha modificada e as saídas que mudaram ou permaneceram. |
| 00.03 — Reconstruir o programa | Ordem das instruções e seleção de blocos relevantes. | Reordenar blocos de código, deixar o distrator de fora, alterar um literal digitando e executar o resultado. Os blocos também podem ser movidos por botões e teclado. |
| 00.04 — Complete o eco | `console.log` com rótulos e valores, vários argumentos, número zero e string vazia. | Preencher três lacunas no código, incluindo casos com `0` e `""`, e executar. A saída torna o valor vazio perceptível sem fingir que ele não foi impresso. |
| 00.05 — Mapa de ambientes | Linguagem, ambiente hospedeiro e ferramenta; diferenças de browser/Node e APIs que existem nos dois. | Classificar os 12 cartões e digitar quatro chamadas `console.log` que expressem exemplos de classificação. O feedback explica casos como `fetch`, que depende do runtime declarado. |

As respostas erradas não penalizam velocidade. O feedback aponta o primeiro resultado incompatível e uma ação concreta. O aluno pode rever a explicação, executar de novo ou pedir a próxima dica.

## Arquitetura proposta

- Acrescentar uma área “JavaScript · Etapa 00” ao catálogo, com navegação separada das três aulas atuais de Web Foundations.
- Manter a interface estática sem dependências novas. Um módulo de conteúdo/interação da etapa 00 será incluído tanto na prévia local quanto em `devpath-site/public`; as duas versões terão os mesmos IDs e conteúdo, preservando seus adaptadores de progresso próprios.
- Usar um parser e avaliador pedagógico explícito para o subconjunto ensinado: instruções `console.log`, argumentos de literais string/number e adição de literais numéricos. Ele interpreta esse subconjunto, sem executar código arbitrário num motor JavaScript. Não usar `eval`, `Function`, `import`, rede, DOM ou outras APIs para executar código do aluno. Sintaxe ainda não ensinada produz orientação específica e não conta como erro conceitual.
- Identificar a interface como interpretador introdutório da etapa 00, sem alegar que oferece Node.js 24 ou execução geral. Um futuro executor de runtime real fica fora deste projeto.
- Animar rastreamento, comparação e montagem com CSS. Movimento reduzido desativa transições não essenciais. Foco visível, instruções de leitor de tela e feedback anunciado fazem parte da implementação.
- Usar os IDs estáveis `00.01`–`00.05` em conclusão/respostas/tentativas e rascunhos de código curtos por ID, limitados a 600 caracteres. A prévia grava em seu armazenamento local; `devpath-site` continua sincronizando por `/api/progress` com D1, validando esses cinco IDs e os rascunhos. Não haverá tabela ou migração nova.
- Tratar código salvo como dado do aluno: nunca inseri-lo como HTML, executá-lo no servidor, enviá-lo à telemetria ou usá-lo como instrução para IA.

## Critérios de aceitação

1. O catálogo abre a nova área e apresenta 00.01–00.05 em ordem, sem tornar o diagnóstico parte dos cinco.
2. O aluno vê explicação e exemplo antes de cada tarefa principal; todos os cinco exercícios requerem escrita ou edição de código.
3. Os exemplos e bordas descritos no roteiro produzem o resultado público esperado, inclusive mudança de uma linha, bloco distrator, `0`, `""` e o contexto de `fetch`.
4. Cada tentativa pode ser executada novamente; falhas de sintaxe fora do subconjunto são explicadas sem serem marcadas como erro conceitual.
5. O exercício 00.03 é totalmente operável por teclado; demais interações mantêm foco visível e mensagens acessíveis. Movimento reduzido desativa animações não essenciais.
6. Rascunho e conclusão continuam salvos após recarregar a prévia local e a versão autenticada.
7. Código digitado aparece apenas como texto, não pode acessar rede/DOM pelo executor e não é enviado em telemetria.
8. As aulas existentes continuam acessíveis e mantêm seu progresso atual.

## Riscos e limites conhecidos

- O executor restrito não demonstra compatibilidade com Node.js 24 do PDF. Essa diferença é intencional nesta introdução e fica visível ao aluno; um runtime Node isolado exigiria um projeto separado.
- O exercício 00.05 do site será mais prático que a ficha atual do PDF. O documento de referência permanece sem alterações, então uma revisão editorial futura pode decidir se deve haver uma nova edição sincronizada.
- O checkout de trabalho não tem `.git` na raiz. Por isso, esta especificação poderá ser salva e revisada, mas não commitada sem um repositório configurado.
