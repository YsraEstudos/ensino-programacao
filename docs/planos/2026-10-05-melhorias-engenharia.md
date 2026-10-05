# Plano de melhorias de engenharia do DevPath

> **Para execução por agentes:** usar a skill `superpowers:executing-plans` para implementar uma tarefa por vez. Delegação somente quando autorizada. Os passos abaixo usam checkboxes para acompanhar a execução.

**Objetivo:** reduzir o custo de manutenção e melhorar a execução dos exercícios sem reescrever o produto nem perder progresso.

**Arquitetura:** manter o site autenticado e a interface didática existentes. Separar coordenação, visualização e execução por responsabilidades, com adaptadores para os módulos atuais. Tratar execução ESM e eventual mudança de persistência como entregas independentes.

**Tecnologias:** JavaScript, TypeScript, Next/React com Vinext, Workers, D1/SQLite e testes Node/jsdom; navegador real para os contratos que dependem de sandbox, CSP e carregamento de módulos.

**Especificação:** este plano concretiza a revisão dos dois pareceres anexados à conversa e a verificação do checkout ativo em 05/10/2026. A organização vigente está em [organizacao-projeto.md](../organizacao-projeto.md).

## Escopo e restrições

- Alterar apenas o projeto ativo `devpath-publish/`; preservar fontes pedagógicas, 254 IDs, versões de conteúdo e progresso existente.
- Código e módulos em inglês; interface e documentos em português. Módulos `.js` sem prefixo `js-`.
- Não transformar a revisão em reescrita React nem em normalização obrigatória do banco.
- Não alterar as gramáticas das etapas 00–03 incidentalmente durante extrações.
- Não adicionar dependências sem necessidade demonstrada. Não incluir código/dados dos alunos em logs ou métricas.
- Não executar migrações de produção ou publicar como parte da criação deste plano. Cada entrega implementada precisa de verificação e autorização de publicação aplicável.
- Testes com jsdom não comprovam sandbox, CSP, comportamento do Worker nem acessibilidade com leitor de tela.

## Prioridades e ordem

| Ordem | Entrega | Benefício | Risco |
|---|---|---|---|
| 1 | Registro e contexto comuns das etapas | Eliminar os encadeamentos repetidos de eventos | Médio: diferenças reais de cada etapa |
| 2 | Separação de `app.js` | Permitir manutenção e testes por responsabilidade | Médio: efeitos de renderização e salvamento |
| 3 | Prova e execução de ESM local | Executar exercícios que hoje exigem análise escrita por limitação do executor | Alto: imports, sandbox e CSP |
| 4 | Renderização incremental e migrações explícitas | Reduzir risco de foco perdido e alterações ocultas de progresso | Médio |
| 5 | Comunicação e testes do sandbox | Tornar limites e mensagens mais explícitos | Médio: origem opaca e cancelamento |
| 6 | Medição da sincronização | Decidir se persistência por exercício é necessária | Baixo para medir; alto para migrar |
| 7 | Decisão sobre módulos da aplicação e iframe principal | Melhorar carregamento e navegação quando houver evidência | Condicional |

As entregas 4–6 podem ser avaliadas separadamente após a estabilização das extrações. Não transformar os sete itens em uma única alteração grande.

## Condições críticas de revisão

1. Navegação com salvamento/execução pendentes deve cancelar a execução certa e preservar o último rascunho.
2. Uma etapa sem módulo próprio deve continuar usando o renderizador genérico; etapas 00–03 devem manter seus critérios específicos.
3. Falha de carregamento, conflito entre abas e nova tentativa offline não podem substituir o progresso remoto por dados vazios.
4. Imports com ciclos, caminhos inválidos ou tentativa de acesso externo precisam produzir resultado limitado e compreensível, sem travar a interface.
5. Edição por teclado, checkbox e controles Parsons devem preservar foco, seleção e evidências conforme o comportamento atual.

## Entrega 1 — Registro comum das etapas

**Arquivos:** criar `public/stage-registry.js`; modificar `public/app.js`, `public/devpath.html` e os auxiliares de fixtures em `scripts/`; acrescentar cobertura a `scripts/test-app-maintenance.mjs`.

**Interface:** `createStageRegistry(entries, fallback)` retorna `resolve(item)`. Cada adaptador oferece `render(item, ctx)` e, quando necessário, `handleClick(event, item, ctx)`, `handleInput(event, item, ctx)`, `handleChange(event, item, ctx)` e `complete(item, progress)`. O registro resolve a etapa; o adaptador preserva as assinaturas particulares dos módulos existentes.

**Contexto:** `ctx` contém `progress`, `activities`, `saveProgress`, `scheduleSave`, `render` e `toast`. A mesma definição atende todas as etapas; não remover parâmetros utilizados pelos módulos atuais.

- [x] Registrar testes de despacho para diagnóstico, 00–03, etapa genérica 04 e módulo obrigatório ausente. Conferir que um evento consumido não cai no manipulador genérico.
- [x] Resolver rota e atividade uma vez por evento; criar um índice `Map` por ID quando o catálogo é carregado.
- [x] Adaptar diferenças de renderização, conclusão e eventos dentro do registro; substituir cadeias repetidas e as fábricas quase iguais de contexto.
- [x] Executar `node --test scripts/test-app-maintenance.mjs scripts/test-stage01-integration.mjs scripts/test-stage02-ui.mjs scripts/test-stage03-ui.mjs` e a suíte completa. Resultado esperado: todas as rotas mantêm comportamento e conclusão.
- [x] Revisar e registrar esta entrega separadamente antes da próxima extração.

## Entrega 2 — Separar `app.js` por responsabilidade

**Arquivos:** criar `public/app-router.js`, `public/catalog-view.js`, `public/review-controller.js`, `public/sync-notifications.js` e `public/course-controller.js`; modificar `public/app.js` e `public/devpath.html`.

**Interfaces propostas:** `createRouter({onRoute}) -> {current, start, dispose}`; `renderCatalog({activities, progress, filters}) -> string`; `createReviewController(ctx) -> {render, handleClick}`; `createSyncNotifications({view, sync}) -> {show, dispose}`; `createCourseController(ctx) -> {render, handleClick, handleInput, dispose}`. As fábricas recebem dependências; não introduzir outro estado global mutável.

- [x] Extrair uma responsabilidade por alteração, começando por notificações de sincronização e roteamento; manter os comportamentos observáveis antes de mudar a estrutura restante.
- [x] Transferir catálogo, revisão e fluxo genérico de exercícios para seus módulos. `app.js` deve coordenar inicialização, composição e ciclo de vida.
- [x] Reutilizar `review-schedule.js`, `progress-sync.js` e `course-runner.js`; não reimplementar funções já extraídas.
- [x] Preservar ordem de carregamento, inicialização única, descarte de listeners/timers e bloqueio de salvamentos antes da leitura inicial.
- [x] Executar testes de aplicação, progresso, revisão e etapas; verificar no navegador navegação durante execução e recuperação após conflito. Critério: mesmo conteúdo e progresso, sem listeners duplicados nem callbacks de uma atividade atualizando outra.

## Entrega 3 — ESM: primeiro provar, depois implementar

**Arquivos:** criar a especificação `docs/especificacoes/execucao-esm.md`; protótipo local em `work/esm-prototype/`; após aprovação técnica, criar `public/module-graph.js` e modificar `public/course-runner.js` e `public/course-controller.js`.

**Interface alvo:** `buildModuleGraph({files, entryPath}) -> {entryPath, modules, dispose}`; `files` usa `{path, content}` como `starterFiles`. A interface ampliada do runner mantém compatibilidade com `run(code, onFinish, options)` e acrescenta uma entrada de múltiplos arquivos. Resultados continuam `result`, `error`, `timeout` ou `cancelled`.

- [x] Inventariar as atividades que exigem `import`/`export`, múltiplos arquivos, DOM, TypeScript ou APIs de rede. Delimitar suporte: ESM local não resolve automaticamente esses outros ambientes.
- [x] No protótipo, demonstrar `import` relativo, `export default`, export nomeado, reexport, import dinâmico local e ciclo em navegador real dentro do sandbox atual.
- [x] Rejeitar paths externos, escape do conjunto de arquivos, módulo ausente e imports dinâmicos não resolvíveis antes de executar. Não usar regex para interpretar a gramática ESM.
- [x] Verificar CSP dos blobs, origem opaca, liberação de URLs e timeout de `while(true)` dentro de um módulo importado. Testar também cancelamento durante import assíncrono.
- [x] Se o protótipo exigir permissões que enfraquecem o isolamento, interromper esta solução e documentar uma alternativa antes de alterar o executor de produção.
- [x] Implementar apenas o suporte comprovado, remover a transformação de `export` por regex nesse caminho e exibir claramente os ambientes ainda indisponíveis.
- [x] Validar com exercícios reais do catálogo e testes de navegador; preservar o modo guiado onde ele é pedagógico ou onde o ambiente continua sem suporte.

## Entrega 4 — Atualizações do DOM e migrações de progresso

**Arquivos:** modificar os módulos `public/stage00-ui.js` até `public/stage03-ui.js` onde houver falha demonstrada; criar `public/progress-migrations.js`; extrair a correção histórica de `01.04` de `public/stage01-ui.js`.

**Interface:** `migrateStage01State(id, state) -> {state, changed}`; migração pura e idempotente, aplicada na normalização do estado, sem transformar a renderização em migração de dados.

- [x] Reproduzir perda de foco/seleção nos fluxos realmente afetados antes de alterar o DOM. Manter as atualizações pontuais que já existem.
- [x] Fixar testes para o rascunho legado exato de `01.04`, rascunho personalizado, segunda aplicação da migração e invalidação apenas quando o código é alterado pela migração.
- [x] Atualizar resultados, dicas, rubricas e mensagens sem reconstruir a página quando isso resolver uma falha comprovada. Preservar a restauração de foco dos controles Parsons.
- [x] Verificar em navegador digitação com seleção, navegação por teclado, alteração de rubrica e anúncios de resultado. Não tratar a aprovação em jsdom como validação completa de acessibilidade.

## Entrega 5 — Comunicação do sandbox

**Arquivos:** modificar `public/course-runner.js` e `scripts/test-course-runner.mjs`; criar cobertura de navegador para o runner.

- [x] Passar a origem conhecida da aplicação para o bootstrap do iframe e restringir a mensagem iframe → pai a essa origem, preservando verificação de `source`, token e formato.
- [x] Manter a particularidade da direção pai → sandbox opaco; avaliar `MessageChannel` se simplificar o protocolo. Não substituir todos os `*` mecanicamente.
- [x] Testar mensagem forjada por outra janela, token errado, mensagem tardia após cancelamento, excesso de saída e falha de criação do Worker.
- [x] Verificar em navegador que requisições externas e acesso ao armazenamento da conta permanecem bloqueados. Anular propriedades de APIs não substitui CSP nem prova proteção contra exploits do navegador.
- [x] Preservar os limites de execução e saída atuais e confirmar terminação/liberação dos recursos depois de timeout e navegação.

## Entrega 6 — Sincronização: medir antes de migrar

**Arquivos:** analisar `public/progress-sync.js`, `lib/progress-sanitize.ts`, `app/api/progress/route.ts` e `db/schema.ts`; registrar resultados em `docs/especificacoes/persistencia-progresso.md`.

- [x] Usar dados sintéticos de aluno iniciante, metade e fim do curso. Medir bytes enviados, frequência por sessão, tempo de serialização/validação/gravação, fila pendente e comportamento após reconexão.
- [x] Identificar se a fila acumula snapshots obsoletos em rede lenta. Se confirmado, coalescer salvamentos pendentes preservando a tentativa mais recente, a revisão de cada gravação e o backup local.
- [x] Especificar os critérios de integridade de conclusão por etapa. Separar validação estrutural, autoavaliação e comprovação de execução; não apresentar flags enviadas pelo cliente como prova independente de domínio.
- [x] Propor atualização por exercício ou tabelas separadas somente se houver custo relevante, necessidade de consultas ou integridade que justifique a mudança. Consultas sobre JSON não são impossíveis.
- [x] Para qualquer migração aprovada, elaborar plano próprio com compatibilidade, backup, rollback, revisão por registro e testes de duas abas/dispositivos; não remover `If-Match` sem substituto equivalente.

## Entrega 7 — Decisões condicionais sobre carregamento e iframe principal

**Arquivos:** analisar `public/devpath.html`, `app/page.tsx`, os módulos públicos e a configuração de build; registrar decisão em `docs/especificacoes/interface-e-carregamento.md`.

- [x] Medir transferência, parse/execução de scripts e tempo até interação; avaliar teclado, skip links, histórico e leitor de tela entre documento externo e iframe.
- [x] Se a dependência de globals continuar dificultando manutenção após as entregas 1–2, planejar migração gradual da interface para ESM com entrada única e build reproduzível; testar os módulos realmente carregados pelo navegador.
- [x] Se houver problema concreto de acessibilidade/navegação ou custo relevante do wrapper, comparar integração sem iframe com uma casca servidor mais simples. Preservar autenticação, logout e API privada em qualquer alternativa.
- [x] Não reescrever todos os componentes em React nem remover React apenas por preferência arquitetural. Não prometer zero JavaScript para uma aplicação estática interativa.

## Critério final de aceite por entrega

- Testes específicos e `npm.cmd test` aprovados; `npm.cmd run lint`, TypeScript e `npm.cmd run build` aprovados.
- Nenhuma mudança incidental no conteúdo, IDs ou gramática das etapas.
- Referências e hashes dos assets atualizados pelo build; artefato de produção inspecionado.
- Para mudanças de runtime, comunicação ou acessibilidade, evidência no navegador real com as limitações registradas.
- Descrever o benefício entregue e o que permanece limitado; publicar cada mudança isoladamente quando autorizado.

## Fora do plano

Repetir correções já feitas de nomes, componentes mortos, número fixo de atividades, concorrência sem revisão, limite de corpo em caracteres e execução síncrona de loops. Limpar regras antigas de CSS pode acompanhar uma alteração de estilo relevante; não equivale a corrigir o contraste que já está sobrescrito pelas regras atuais.

**Estado:** implementação e avaliação locais concluídas em 05/10/2026 na branch `refactor-engineering-plan`. Não publicado.

### Resultado e decisões

1. Registro comum, contexto e índice de atividades implementados; adaptadores mantêm comportamentos específicos.
2. Roteamento, catálogo, revisão, notificações e exercícios extraídos. Timers/execuções são descartados na navegação e o roteador não duplica listeners.
3. ESM local comprovado com parser/compilador real e Worker isolado. O compilador é carregado sob demanda; modo escrito permanece disponível. Limites em [executor-modulos.md](../especificacoes/executor-modulos.md).
4. A correção de 01.04 virou migração pura/idempotente usada na normalização. Testes existentes e verificação de seleção/foco não demonstraram necessidade de reescrita dos renderizadores das etapas.
5. Origem explícita, source/token e descarte testados; não foi necessário MessageChannel.
6. Snapshots intermediários em rede lenta foram reproduzidos e consolidados. Manter banco JSON/CAS; [medições e integridade](../especificacoes/persistencia-progresso.md).
7. Manter os módulos atuais e o iframe externo após avaliação. Corrigido skip link que substituía a rota; [decisão de carregamento](../especificacoes/interface-e-carregamento.md).

**Verificação:** suíte completa, lint sem avisos, TypeScript e build aprovados. Navegador comprovou módulos locais/ciclos/import dinâmico, bloqueio de rede/armazenamento, timeout/cancelamento, recuperação, execução do starter 04.07, seleção no editor e skip link preservando a rota. Fontes pedagógicas e IDs permaneceram intactos.

**Limites de avaliação:** não foram medidos D1 remoto, sessões reais de alunos, custo de parse por script ou produção. Leitor de tela e histórico completo entre casca e iframe não foram homologados; os checkboxes de avaliação registram a análise e essa limitação, não aprovação universal de acessibilidade. Nenhuma migração de produção ou reescrita condicional foi realizada.
