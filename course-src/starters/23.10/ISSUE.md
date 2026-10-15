# Issue #42 · Mapear a regra de limite do relatório antes de qualquer mudança

O financeiro quer subir o limite padrão do relatório de pedidos. Esta issue não pede mudança de código: antes de alterar qualquer coisa, precisamos saber onde a regra mora, quem é o dono do valor padrão e o que o código faz hoje.

Responda com evidência:

1. Em que arquivo e função a regra "dentro do limite" é aplicada? Qual módulo é o dono do valor padrão `LIMITE_PADRAO_CENTAVOS`?
2. Qual é o caminho de chamada desde `src/main.js` e `src/ui/tabela.js` até essa regra? Liste as funções na ordem em que são chamadas.
3. Antes de executar, preveja o resultado de `dentroDoLimite(10000)`, `dentroDoLimite(10001)` e `dentroDoLimite(-1)`. Depois rode `node --test test/investigacao.test.js`. A previsão bateu? Se não, o que explica a diferença?
4. `src/ui/formatar-limite.js` tem um nome parecido. Ele é dono da regra? Por quê?
5. Qual teste existente cobre a fronteira 10.000/10.001 centavos e serve de evidência? Cite arquivo e nome do teste.

Esta issue é de leitura: não edite `src/`. Qualquer mudança de comportamento será tratada em outra issue.
