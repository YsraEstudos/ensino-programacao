# Revisão pedagógica da Etapa 00 — 30/09/2026

Público: pessoa que nunca programou. Critério: toda ação pedida precisa ter conceitos, exemplo e instrução operacional disponíveis antes da tentativa. Documentação deve confirmar uma regra já apresentada, com link, seção e pergunta de consulta.

## Problemas comuns e correção

- A página escondia a explicação até registrar uma resposta. A Etapa 00 agora apresenta vocabulário e exemplo resolvido antes do desafio e mantém a teoria acessível durante a prática.
- O campo “Como responder” publicava especificações para desenvolvedores, inclusive controles inexistentes. Foi substituído por instruções para o aluno e um formato de resposta que a interface oferece.
- Os cinco números pareciam abas, mas eram spans sem ação. Agora são botões de navegação para seções existentes: Aprender, Ler o desafio, Responder, Praticar e Explicar. Cada um descreve sua função.
- Código, previsão, saída e explicação não estavam claramente separados. Há instruções distintas e indicação de arquivos somente para leitura e áreas de escrita.
- Os conceitos aparecem antes do uso, inclusive pontuação da chamada, aspas, argumento, comentário, lacuna, ambiente, API, sintaxe, atributos e hierarquia HTML.
- Referências apareciam como URLs sem tarefa de leitura. As consultas agora indicam a seção ou termo a procurar e o conhecimento que deve ser aproveitado. A teoria local permanece disponível.
- A depuração tinha uma dependência impossível: precisava executar antes da resposta e o executor vinha depois dela. A execução intacta está disponível antes da resposta; a edição só abre após a observação.

## Auditoria por exercício

| ID | Falta ou conflito identificado | Correção |
| --- | --- | --- |
| 00.01 | `main.js`, console, log, argumento, aspas, expressão, execução, saída e confiança eram presumidos; teoria bloqueada. | Definições desde zero, decomposição da chamada, exemplo com código/saída e explicação linha a linha, previsão explicitamente separada de escrever código. |
| 00.02 | Comentários e versões não explicados; duas versões em um arquivo podiam ser executadas como uma sequência ou a segunda ignorada. | Comentários ensinados, dois arquivos reais somente para leitura e execução separada de cada versão. |
| 00.03 | Saída desejada não aparecia claramente; rótulos, distrator e montagem não eram ensinados; promessa de arrastar sem controle existente. | Saída exata, quatro opções concretas e exemplo de seleção; aluno registra rótulos e copia chamadas completas para o editor, sem promessa de arrastar. |
| 00.04 | Lacunas e argumentos separados por vírgula presumidos; versões anteriores cobravam falsy antes de condições. | Ensinar substituição de lacunas, texto/número, vírgula, rótulo e zero; retirar a cobrança antecipada de falsy. |
| 00.07 | Produção do zero sem estrutura suficiente; diferença entre `0` e `"0"` podia passar despercebida. | Modelo de chamada completa, três instruções operacionais, conferência de tipo do valor e consulta à sintaxe antes de escrever. |
| 00.05 | Classificação cobrava nomes desconhecidos e categorias ambíguas; tabela prometida não existia. | Definição de todos os oito nomes e das categorias, tabela textual editável, múltiplas marcas para APIs compartilhadas e consulta guiada ao Node.js 24 e à MDN. |
| 00.06 | Parse, runtime e hipótese sem preparação; execução inicial bloqueada; ausência de alvo final claro. | Ensinar três classes de problema com exemplo, publicar alvo Olá/fim/ok, execução inicial antes da observação e histórico de execuções e notas de investigação. |
| 00.08 | Tags, elemento, atributo, árvore e for/id/class presumidos; tratamento genérico exigia editar HTML numa atividade de leitura. | Vocabulário completo, árvore resolvida paralela, arquivo HTML formatado somente para leitura, análise em resposta.md e consulta guiada ao atributo for. |
| 00.09 | Trace/efeito/remoção pouco definidos e tarefa de leitura enviada ao editor como se fosse escrita de código. | Definir rastreamento, mostrar cenário resolvido, executar original sem editar e registrar três cenários separados em resposta.md. |

## Implementação e critérios

As nove atividades usam um renderer específico da Etapa 00, integrado às mesmas estruturas de progresso por conta. As respostas antigas permanecem em suas chaves históricas; esta revisão usa a versão 4 e registra novas tentativas separadamente. A etapa inclui um rastreador com previsão antes da saída, três diagnósticos de resultado antigo, a distinção entre mensagem e ação, uma simulação de console/terminal, uma prévia HTML que corrige `for`/`id` e um desafio final de código do zero, mudança de requisito e duas transferências. A primeira aula guarda termos secundários num glossário consultável.

O executor introdutório avalia somente as chamadas e expressões ensinadas. Não roda JavaScript arbitrário. Confere os valores esperados, inclusive a diferença entre número e texto, mostra divergência em texto e reconhece a grafia incorreta usada no exercício de depuração. A análise da sintaxe precede a simulação da execução; erros durante a execução preservam as mensagens anteriores. Nos exercícios de leitura, o registro da análise e os critérios são autoavaliação explícita, sem simular correção automática.

Fonte pedagógica única: `course-src/stage00-preparation.mjs`, versionada com o Site. `npm run build:curriculum` gera o JSON intermediário em `course-src/.generated/` antes de compilar o currículo. O catálogo público e os arquivos em `public/` são saídas geradas.

Validação: `npm.cmd run test:stage00` verifica o conteúdo canônico e a interface, incluindo execução, diagnóstico, HTML, transferência do desafio final e persistência após recarga. `npm.cmd run build` valida o catálogo e compila o Site. Acessibilidade automatizada não substitui um teste real com leitor de tela.
