# Change request preenchida

| Camada | Arquivo | Mudança |
|---|---|---|
| Autorização/serviço | src/reabrir.ts | rejeitar usuário comum antes de ler/escrever e validar tarefa concluída |
| Domínio | src/dominio.ts | mover cria estado novo e não altera anterior |
| Porta | src/portas.ts | salvar estado + evento em uma operação |
| Adapter | src/adapters/memoria.ts | clonar e trocar ambos após sucesso |
| Testes | test/contrato.test.ts | regressão de criar/mover/remover e falha de auditoria |

Evento { tipo: reaberta, tarefaId, por, em }. Falha de persistência não publica estado nem evento; o relógio é injetável para teste.
