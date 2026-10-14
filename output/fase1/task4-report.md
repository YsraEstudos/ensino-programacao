# Tarefa 4 — revisão e correção dos primers 1.A

Revisei os 16 IDs contra os starters e consumidores publicados. Apliquei correções somente aos seis primers apontados; preservei as entradas adicionadas ou revisadas pelas tarefas anteriores.

| ID | Avaliação final |
|---|---|
| 04.02 | Suficiente. Spread, mutação/retorno de `push` e diferença entre `++n` e `n++` correspondem aos exemplos usados. |
| 04.05 | Suficiente. Explica o objeto literal de opções que o starter passa a `Intl.NumberFormat`. |
| 04.07 | Suficiente. Explica a exportação nomeada importada pelo avaliador. |
| 05.03 | Corrigido: `filter` mantém retornos truthy; `true` é o resultado booleano deste callback específico. |
| 05.04 | Suficiente. Explica o objeto devolvido e o acesso às propriedades pedidas. |
| 05.06 | Corrigido: explicita que `Object.freeze` é superficial e limita a afirmação de `TypeError` às tentativas de reescrita do starter; elas falham também fora do modo estrito. |
| 06.06 | Corrigido: acrescenta conversão de `Set` para array e reconstrução com `new Set`. |
| 06.08 | Suficiente. `try/catch` em torno de `JSON.parse` cobre o recurso antecipado; o starter descreve os demais casos da migração. |
| 06.09 | Suficiente. Explica a falha de parse e conversões de `Map` e `Set` pertinentes à nota do starter. |
| 06.07 | Corrigido: delimita as formas especiais de `__proto__`, recomenda `Object.create(null)` para cumprir o retorno de objeto indexado e reserva `Map` para uma API que aceite esse tipo de retorno. |
| 06.10 | Suficiente. `Object.create` e `Object.hasOwn` estão explicados; a etapa 10 retoma protótipos e delegação. ID mantido na etapa 06. |
| 09.05 | Corrigido: descreve callbacks adiados lendo o mesmo binding `var` e `let` criando um binding por iteração. |
| 12.13 | Suficiente e opcional. Explica geração/consumo assíncrono incremental; a atividade 20.07 retoma `for await` e `Array.fromAsync`. |
| 15.06 | Corrigido: prepara para compatibilidade estrutural entre interfaces e a exigência de mesma origem para membros `private`; mantém apenas a nota curta sobre alias `type`. |
| 16.04 | Suficiente. Os exemplos `Promise<User>` e `Array<number>` correspondem aos tipos parametrizados do starter. |
| 16.06 | Suficiente. Explica `typeof`, indexed access com `[number]` e a união literal derivada com `as const`; a própria atividade cobre o limite em runtime. |

## Verificação

- `npm.cmd run build:curriculum` — concluído, gerando 261 atividades. O processo imprimiu uma mensagem de caminho não resolvido para Python 3.13, mas encerrou com código 0.
- `npm.cmd run check:curriculum` — passou: 261 atividades, grafo acíclico, 0 avisos e 0 erros.
- Conferi que os primers publicados para os 16 IDs correspondem ao JSON de origem. Também confirmei a presença das entradas compartilhadas `03.10`, `04.11`–`04.13`, `06.11` e `17.08`.
- Não adicionei testes editoriais que apenas espelhassem as frases alteradas.
