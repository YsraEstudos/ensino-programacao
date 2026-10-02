# Auditoria e melhorias da Etapa 01 — JavaScript

Alvo: **01.01–01.09, Valores, variáveis e tipos primitivos**. Seis subagentes analisaram conteúdo/progressão, pré-requisitos, explicações/exemplos, exercícios/interações, design/acessibilidade e organização do código. As conclusões foram conferidas contra a implementação atual antes das alterações.

## Diagnóstico consolidado e prioridades

| Prioridade | Evidência e problema | Impacto no aprendizado | Mudança realizada |
|---|---|---|---|
| P1 | `js-stage01-ui.js`: seletores reconheciam somente declarações no início de linha; starter de 01.04 tinha seis lacunas na mesma linha. O starter também não tinha o `console.log` cobrado pelos checks. | O aluno podia escolher corretamente e continuar bloqueado; cinco seletores exibiam decisões que não chegavam ao código. | Seletores reconhecem também declarações após `;`. Starter organizado em linhas com impressão pronta. Migração restrita ao formato antigo conhecido, preservando escolhas e rascunhos personalizados. |
| P1 | `stage01-preparation.mjs`, 01.02: exemplo mostrava a saída final, mas a prática exigia estados por instrução; sintaxe de atribuição e nomes era pouco desenvolvida. | O iniciante tinha de construir sozinho o formato de rastreamento e o modelo temporal. | Tabela resolvida antes da prática; explicação de declaração, inicialização, atribuição, soma numérica introdutória e nomes; instrução explícita de preenchimento. |
| P1 | `stage01-preparation.mjs`, 01.07–01.09: exemplos mostravam resumos atuais sem demonstrar o erro de reutilizar uma string antiga. | O aluno podia imaginar uma ligação automática entre uma string já calculada e as variáveis que a produziram. | Exemplo contrasta resumo guardado e template recalculada; inclui energia zero. Checkpoints são explicados como momentos de observação. |
| P1 | `js-stage01-ui.js`: editar código, escolhas ou previsões invalidava aprovação, mas deixava o resultado anterior visível. | Feedback antigo podia parecer evidência do código atual. | Resultado e visualizações obsoletas são removidos; mensagem pede nova execução. Transferências são invalidadas individualmente. |
| P1 | `js-stage01-ui.js`: rerender perdia o foco; botão de conclusão não diagnosticava requisitos ausentes. | Teclado/leitor de tela exigiam reencontrar a posição; aluno não sabia como liberar a conclusão. | Foco restaurado em controles/resultados relevantes e checklist acessível de evidências feitas/pendentes. |
| P2 | 01.01/01.05: exemplos não demonstravam todos os valores menos intuitivos cobrados. | `undefined`, `null` e `NaN` dependiam principalmente de afirmações curtas. | Exemplos executáveis comentados desses valores; limites de `typeof` e diferença entre ausência e nome não declarado. |
| P2 | 01.03 e 01.06–01.08: instruções de ordenação, expressão, comentários e edição dos checkpoints eram compactas. | Regras operacionais e conceitos competiam com a dificuldade do exercício. | Ordens válidas/inválida em exemplo distinto, diagnóstico extra, sintaxe de comentários, interpolação e reatribuição sem redeclaração. |
| P2 | Testes de conteúdo importavam a fonte editorial sem comparar o bundle público. | Fonte e saída servida poderiam divergir com testes verdes. | Verificação de paridade fonte/bundle, retirando soluções privadas das transferências. |

## Progressão pedagógica

A ordem foi preservada: valores/tipos → bindings e estados → dependências → const/let → valores especiais → template guiada → resumo independente → configuração → projeto e duas transferências sem dica.

A Etapa 00 foi referência para ensinar antes de cobrar, usar exemplo comentado, explicar controles e tornar feedback/conclusão claros. Seu conteúdo e suas atividades não foram copiados.

A Etapa 02 foi consultada para delimitar a passagem a operações, conversões e comparações. A Etapa 01 agora explicita que `"3"` e `3` têm tipos diferentes, que zero e false são valores presentes e que `typeof` não valida a adequação de um número. Não antecipa exercícios ou regras de conversão da próxima etapa.

Foram mantidos os objetivos e o interpretador introdutório: sem funções, objetos, DOM, formulários ou novos subsistemas. A carga de prática descrita em `stages/01.txt` foi alinhada à soma de 102 minutos dos cards existentes.

## Conciliação dos achados

- A implementação atual já usa renderer dedicado e ensina antes da primeira resposta. A observação antiga sobre renderer genérico não se aplica.
- O gate do projeto já possui duas transferências verificáveis sem dica. Não foi criado um gate adicional em cada atividade.
- Previsões incorretas continuam permitidas: comparar e corrigir é parte do ensino. Reflexões são autoavaliação; a interface informa que o sistema verifica preenchimento, sem fingir avaliar semanticamente o texto.
- Os campos editoriais de transferência curta em 01.01–01.08 não constituem atividades executáveis na UI atual. A evidência obrigatória de generalização fica no projeto 01.09. Não foram transformados em novas tarefas obrigatórias.
- A navegação entre etapas continua livre. Alterar o acesso à Etapa 02 afetaria o comportamento de outra etapa e não fez parte desta implementação.
- Hipóteses de sobreposição da navegação mobile não foram tratadas como defeitos confirmados. Em 390 px, a navegação mediu 68 px, abaixo do offset existente de 90 px. Tabelas mantêm rolagem local; não foi feita uma reformulação visual completa.

## Fontes e escopo

`recipes/01.py` define o starter; `resolved_preview.json` é sua representação compilada; `stage01-preparation.mjs` fornece ensino e exemplos; `build-public-curriculum.mjs --stage01` aplica somente os cards 01; `build-stage01.mjs` sincroniza os módulos específicos nas duas distribuições.

O conteúdo de todas as demais etapas foi comparado estruturalmente com um snapshot anterior às alterações, nas duas distribuições, e permaneceu idêntico. Alterações preexistentes em arquivos compartilhados não foram revertidas nem atribuídas a esta auditoria. Não houve publicação.

## Validação e limites

- Testes de regressão reproduziram os defeitos antes da correção: seis seletores, resultado obsoleto, foco perdido e starter salvo sem impressão. Também há cobertura de rascunho compacto e preservação de rascunho personalizado.
- Suíte `npm.cmd run test:stage01`: 60 testes aprovados.
- `npm.cmd run build` na aplicação principal: aprovado.
- Paridade dos cinco módulos específicos entre distribuições e dos cards 01 nos testes de integração.
- Navegador real em prévia local: tabela resolvida de 01.02 e execução de 01.04 com os seis seletores, sem edição adicional do código. Os dois casos públicos passaram e o foco foi para o resultado.
- Inspeção em viewport de 390×844: sem transbordamento horizontal da página; navegação para “Prever” levou o foco à seção.
- Não foram feitos testes com leitor de tela, dispositivos físicos, nem persistência em conta no serviço publicado. O build e os testes locais não comprovam esses comportamentos.
