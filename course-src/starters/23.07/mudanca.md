# Change request · reabrir tarefa concluída

Nova regra, que cruza permissões e histórico:

- Uma tarefa em `feito` só pode voltar para `a-fazer` se quem pede for administrador.
- Usuário comum recebe `ForbiddenError` e o estado fica intacto.
- Toda reabertura grava um evento de auditoria `{ tipo: "reaberta", tarefaId, por, em }`.
- Se gravar o evento falhar, a reabertura não pode ficar salva sem o evento: escolha atomicidade (salvar os dois juntos) ou compensação (desfazer) e documente.
- As outras ações (criar, mover, remover) mantêm os testes atuais passando.

Pontos que mudam no capstone: tipo, validação, serviço, storage e testes. Liste antes de editar:

| Camada | Arquivo | Mudança |
|--------|---------|---------|
| | | |
