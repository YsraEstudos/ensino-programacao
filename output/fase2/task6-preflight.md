# Tarefa 6 — preflight de integração

## Escopo autorizado nesta preparação

`public/study-time.js` e `public/study-time-ui.js` já têm testes unitários próprios e revisão focal. Esta preparação preserva os arquivos de integração `public/app.js`, `public/devpath.html`, `public/styles.css` e builders para o escritor exclusivo da integração. Nenhum build foi executado.

## Desenho de integração

- Incluir os dois scripts locais, com versões de cache próprias, antes de `app.js`. O UI pode criar seu painel quando a aplicação já montou o shell.
- Manter o painel persistente fora de `#view`, para que os renders e a navegação não o removam nem criem eventos de tentativa.
- Consultar a atividade atual por `routeInfo()` e `activityById` somente depois de `initialize()` carregar o catálogo. Em home, catálogo e revisão, a atividade corrente é nula.
- Proteger a leitura de `localStorage` com `try/catch`; entregar o storage ao contador sem deixar bloqueio de privacidade quebrar a aprendizagem.
- Usar `performance.now()` para intervalos monotônicos. A contagem é a duração com a aba visível e focada; `item.duration` continua sendo a estimativa guiada.
- Deixar hash/focus/blur/visibility/pagehide/pageshow/storage/interval/dispose sob responsabilidade de `study-time-ui.js`; integrar o ciclo de vida sem duplicar listeners.

## Privacidade e limites da medição

O registro é opt-in e local, com somente IDs de atividade e milissegundos. Falha de armazenamento deve ser comunicada como sessão em memória. Mudanças remotas de consentimento verdadeiro não devem ser ecoadas; revogação deve interromper as demais abas e apagar o total local imediatamente.

O piloto de navegador é QA técnico controlado, não observação de aluno nem validação pedagógica. Não usar seus segundos para calibrar estimativas. Dados de alunos e calibração permanecem pendentes.

## Carga horária

Após os itens D.06–D.09, recalcular a soma atual usando `duration` do catálogo publicado. Apresentar a soma como estimativa de atividades guiadas. Explicar que as 370–500 horas declaradas também incluem leitura da documentação oficial, prática externa, retomadas, retakes e projetos. A diferença é uma questão de escopo documental; não derivar um multiplicador empírico sem dados de alunos.

## Browser QA preparado

`task6-browser-qa.mjs` inicia Edge por canal `msedge` com contexto novo e relata as durações observadas e o JSON de evidência. O helper não instala dependências nem persiste perfil de usuário. Cobre tempo por atividade, pausa por rota, reload, atualização entre abas sem echo e revogação em outra aba. A prova de pausa por foco/visibilidade ficou inconclusiva no Edge controlado: mesmo desligando a emulação de foco do Playwright e pedindo a minimização da janela via CDP, as páginas reportaram `hasFocus() === true`, `visibilityState === "visible"` e nenhum evento nativo. Esse cenário é rotulado como não observável no JSON, sem alegar pausa de foco comprovada no navegador.

## Estado

Integração no app e browser QA controlado concluídos; ver [`task6-report.md`](task6-report.md) e [`task6-qa.json`](task6-qa.json). Core e UI passaram 5/5 cada; app maintenance 8/8. O QA mediu atividades distintas, pausa por rota, retomada por reload, propagação de storage sem echo e revogação remota. Pausa real por foco/visibilidade não foi observável pelo harness/navegador e permanece sem prova de browser nesta rodada. A soma atual do catálogo é 6.722 minutos (112 h 02 min), somente tempo guiado cadastrado. A faixa declarada de 370–500 h é escopo provisório de planejamento, sem alocação por componente ou calibração com estudantes; veja `docs/README.md`.
