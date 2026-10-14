# Capstone · tarefas (ou pedidos)

Escolha: app de tarefas (este esqueleto) ou biblioteca de pedidos (mesma estrutura).

## Contrato
- Domínio puro em `src/dominio.ts`: criar, mover e remover; dado inválido é rejeitado antes de mutar.
- Porta `Repositorio` em `src/portas.ts`; adapters trocáveis (memória já existe; crie arquivo ou localStorage).
- Falha de storage vira erro público sem segredo, com `cause` técnico para o log.
- Reinício: o estado salvo é recuperado (com migração de versão se mudar o formato).
- UI ou CLI só chama o serviço; nunca o storage.

## Rodar
`npm install`, `npm run typecheck`, `npm test`.

## Documente aqui
Decisões, limites conhecidos e como trocar o adapter.
