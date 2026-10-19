# 23.07 — Reabertura autorizada no capstone

A autorização fica no serviço src/reabrir.ts, antes de carregar ou escrever. Só admin pode mover tarefa concluída para a-fazer; estado e evento são persistidos juntos pela porta. O adapter troca estado e log somente após clonar ambos. Na pasta copiada, rode npm ci, npm test e npm run typecheck. O pacote declara Node >=24, TypeScript 6.0.3 e @types/node 24.19.1; Node 26.7.0 foi usado na conferência. A suíte cobre CRUD anterior, negação sem gravação, reabertura admin com auditoria e falha atômica.

## Transferência independente

# Transfer 23.07

Em um domínio de reembolsos, só gerente aprova solicitação liquidada; negar atendente antes de gravar, salvar mudança + evento juntos, timestamp injetável e provar que uma falha deixa status e histórico antigos.

## Critérios observáveis da avaliação

- Matriz de arquivos coloca permissão no serviço, regra de estado no domínio e atomicidade na porta/adapter.
- Teste assertivamente que usuário comum não grava, admin registra ator/instante e erro de storage não persiste metade.
- Testes originais de criar/mover/remover continuam passando sobre objetos imutáveis.

## Verificação local

npm ci

npm test

npm run typecheck

Limite: esta evidência é local/contida e não representa aprovação de navegador nem publicação.
