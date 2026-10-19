# 23.08 — Capstone de tarefas

O domínio puro valida antes de criar/mover/remover e retorna novos estados. O serviço orquestra a porta; adapter em memória clona na entrada/saída e persiste estado/eventos juntos. O adapter de versão migra documento 0 (campo concluida) para esquema 1 e rejeita versão desconhecida. UI/CLI deve chamar serviço, nunca acessar storage. O pacote declara Node >=24, TypeScript 6.0.3 e @types/node 24.19.1; Node 26.7.0 foi usado na conferência. Na pasta copiada, rode npm ci, npm test e npm run typecheck; o typecheck inclui fontes e testes, sem depender da configuração do repositório principal.

## Transferência independente

# Transfer 23.08

Adicionar domínio de pedidos com adapter SQLite substituível: mesma suíte de contrato cobre criar item, mover para expedido, cancelar, restart e migração v1→v2; simule falha entre estado/evento, proteja cópias e faça tela chamar somente serviço.

## Critérios observáveis da avaliação

- Contrato percorre CRUD, reinício, migração, cópia defensiva e falha sem persistência parcial para adapter.
- Validação fica no domínio, autorização/efeito no serviço e parsing de versão no adapter; UI/CLI não importa storage.
- README cita comandos, formato v0/v1, tratamento de erro/cause e limitação do adapter demonstrada por teste.

## Verificação local

npm ci

npm test

npm run typecheck

Limite: esta evidência é local/contida e não representa aprovação de navegador nem publicação.
