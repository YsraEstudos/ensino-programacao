# 23.07 — Reabertura autorizada no capstone

A autorização fica no serviço src/reabrir.ts, antes de carregar ou escrever. Só admin pode mover tarefa concluída para a-fazer; estado e evento são persistidos juntos pela porta. O adapter troca estado e log somente após clonar ambos. Rode a suíte de contrato 23.08. Teste comum, admin, inexistente, coluna errada, relógio injetado e falha atômica.

## Transferência independente

# Transfer 23.07

Em um domínio de reembolsos, só gerente aprova solicitação liquidada; negar atendente antes de gravar, salvar mudança + evento juntos, timestamp injetável e provar que uma falha deixa status e histórico antigos.

## Critérios observáveis da avaliação

- Matriz de arquivos coloca permissão no serviço, regra de estado no domínio e atomicidade na porta/adapter.
- Teste assertivamente que usuário comum não grava, admin registra ator/instante e erro de storage não persiste metade.
- Testes originais de criar/mover/remover continuam passando sobre objetos imutáveis.

## Verificação local

node --experimental-strip-types --test test/reabrir.test.ts

node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --target ES2022 --module NodeNext --moduleResolution NodeNext --allowImportingTsExtensions src/dominio.ts src/portas.ts src/adapters/memoria.ts src/reabrir.ts

Limite: esta evidência é local/contida e não representa aprovação de navegador nem publicação.
