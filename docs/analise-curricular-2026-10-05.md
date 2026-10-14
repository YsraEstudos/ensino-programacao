# Análise curricular do DevPath: o que já foi corrigido e o plano por fases

Diagnóstico original: 05/10/2026. Plano de correções fechado: 11/10/2026. **Estado revisado: 13/10/2026** (quarta revisão do plano em 12/10; Fase 1 implementada e verificada localmente em 13/10).

O diagnóstico original, com as tabelas completas de 05/10, está preservado em [analise-curricular-2026-10-05.diagnostico-original.md](analise-curricular-2026-10-05.diagnostico-original.md). Este documento substitui aquele como referência de trabalho.

Planos complementares detalhados:
- [Plano Mestre de Diagnóstico Integral e Correção](planos/plano-mestre-diagnostico-integral-devpath.md): inventário de defeitos por atividade e por lote, com gates de qualidade e a rastreabilidade de cada problema. A ordem de execução fica neste documento.
- Revisão editorial e contextualização pedagógica: metodologia, template em 4 blocos e execução dos 254 enunciados em 5 lotes. Incorporada ao plano mestre, fases 35 e 36.


**Como o estado foi verificado.** Cada item foi conferido em 12/10/2026 nas seguintes fontes:

- **Conteúdo publicado:** `public/course-catalog.json` (254 atividades, com os campos `primers`, `edgeCases` e `autoTested`) e `public/course-assessments.json` (180 entradas).
- **Fonte do currículo:** `course-src/bridges.md`, `course-src/prerequisite-primers.json`, `course-src/feature-matrix.json`, `course-src/runtime-baseline.json`, `course-src/build-public-curriculum.mjs` e `course-src/compile_content.py`.
- **Interface e progresso:** `public/app.js`, `public/course-controller.js`, `public/course-dom-runner.js`, `public/course-assessment.js` e `public/learning-progress.js`.
- **Servidor e validação:** `lib/progress-sanitize.ts`, `lib/progress-contract.json`, `scripts/validate-course-catalog.mjs` e `scripts/validate-curriculum-source.mjs`.

A última verificação independente rodou os três validadores e obteve 254 cartões, com zero avisos e zero erros. Isso confirma consistência estrutural. A suíte completa e os fluxos de navegador não foram reexecutados nesta revisão; as contagens de 11/10 vêm do relatório de fechamento (`output/learning-execution/task-13-docs-counts.json`).

**Três categorias de estado.** "Corrigido" significa que a atividade, a ordem ou o código mudou. "Mitigado por primer" significa que o conceito antecipado ganhou uma explicação curta publicada no próprio cartão (`primers`), mas a atividade continua no mesmo lugar. "Aberto" significa que nada mudou.

**Critério que orienta todo o plano.** No fim da trilha, o aluno deve conseguir receber um problema novo, esclarecer o contrato, investigar uma base existente, implementar, testar, entregar, observar uma falha e absorver uma mudança sem regressão, explicando suas decisões. Cada correção abaixo é justificada pelo quanto ela aproxima o aluno dessa capacidade.

---

## 1. Situação em uma página

| Área | Em 05/10 | Em 12/10 |
|---|---|---|
| Correção automática 04–23 | Nenhuma; conclusão por autoavaliação | 180 atividades com entrada de avaliação. Nas etapas 11–23, 86 de 145 executam automaticamente. O catálogo marca 119 atividades como `autoTested` |
| Estado "demonstrado" | Não existia | Existe, mas é concedido por uma transferência **declarada**: 40 caracteres de resposta e todos os critérios marcados, sem execução (item 0.2) |
| Executores | Só JS isolado | JavaScript, DOM em iframe, TypeScript (checker 6.0, proxy limitado do 7.0) e Node simulado; gate Chromium 42/42. Pendências: aviso desatualizado na interface (0.1) e laço infinito no DOM sem interrupção garantida (0.4) |
| Arquivos iniciais 15–23 | Descrições de uma linha | Código real em todas as atividades (de 582 a 5.791 caracteres; os menores ficam nas etapas 18 e 19) |
| Arquivos iniciais 04–14 | Mistos | **36 atividades** ainda têm só um `material.md` em prosa, sem código (item 2.0) |
| Recursos 21–23 | Zero links | Todas as atividades têm recursos |
| Pré-requisitos e dicas | 9 atividades com `requires` | 246 atividades, 457 arestas validadas; 219 com dicas; 23 com primers |
| Casos-limite no cartão | `edge_contract` não era publicado | 210 atividades publicam `edgeCases` |
| Progresso | Um estado só | Tentativa, estudada, verificada e demonstrada |
| Capacidade de crescer | — | Bloqueada: o build, o validador e o regenerador exigem contagens fixas, e o progresso descarta registros acima de 300 (passo zero) |
| Ambiente-alvo | Versões misturadas | `course-src/runtime-baseline.json` e `course-src/feature-matrix.json`; TS 7.0 nos cartões |
| Erros pontuais de conteúdo (§4 original) | 11 | 9 corrigidos, 2 abertos |
| Pré-requisitos ocultos (§2 original) | 28 linhas | 6 corrigidas, 21 mitigadas por primer, 1 aberta |
| Carga horária | ~110 h cadastradas contra 370–500 h declaradas | **Não reconciliada:** 108,7 h cadastradas (item 2.7) |
| Pilares sênior (back-end, segurança, ferramentas, framework, E2E, IA) | Ausentes | **Inalterado: ausentes** |

**Veredito em 12/10/2026.** A plataforma passou a executar e testar as implementações das etapas 11–23, e o aluno vê erros reais. Restam seis frentes:

1. O currículo não consegue crescer sem antes remover limites fixos de contagem e de persistência.
2. Alguns sinais mostrados ao aluno dizem mais do que comprovam. O principal é "demonstrado", que hoje vem de uma transferência declarada.
3. Vários conceitos antecipados foram só explicados no lugar (primers).
4. As etapas 04–14 têm 36 atividades sem código inicial, e 30 atividades de 04–10 não têm avaliação.
5. A carga declarada não está reconciliada com a cadastrada.
6. Os pilares do trabalho sênior ainda não existem.

---

## 2. O que já foi corrigido

### 2.1 Plataforma e avaliação

| Problema original | Estado em 12/10 | Evidência |
|---|---|---|
| Conclusão por autoavaliação em 04–23 | Corrigido nas etapas 11–23; parcial em 04–10 (Fase 2) | 180 entradas em `course-assessments.json` |
| Execução com erro ou timeout liberava a conclusão | Corrigido | `public/course-controller.js:63`: a tentativa com erro é registrada, mas não prova a implementação |
| Executor sem DOM, TS, Node e Vitest | Corrigido, com limitações | Gate Chromium 42/42; 42/42 mutantes mortos. Pendências nos itens 0.1, 0.4 e M.3 |
| Gates das etapas 05–10 citavam "testes ocultos" inexistentes | Corrigido | Nenhuma ocorrência no catálogo nem nos roteiros |
| Testes de TEST sem mutantes | Corrigido | 74 entradas em `mutantDirs` e 18 mutantes tipados |
| `edge_contract` descartado na publicação (§3.9 original) | Corrigido | `course-src/build-public-curriculum.mjs:122` publica `edgeCases` a partir da etapa 04 (210 atividades); o cartão os exibe e `scripts/validate-curriculum-source.mjs` os confere contra `hidden_cases`. Exemplo: 05.07 publica `[] -> [null,null,0,null]` |
| Rubricas das avaliações `rubric` | Corrigido | As 47 avaliações com `environment: "rubric"` têm critérios específicos. A pendência está no texto do cartão (item 2.2) |
| Progresso com um único estado | Corrigido na estrutura | Reducer com `attempted`, `studied`, `verified` e `demonstrated`. O critério de "demonstrado" é tratado no item 0.2 |
| Explicação liberada só depois da primeira resposta | Corrigido | Caminhos "Aprender este conceito" e "Tentar de memória" |
| Editor limitado a `1100 / nº de arquivos` caracteres | Corrigido | `draftChars` = 12.000 (`public/learning-progress.js:37`) |
| Arquivos iniciais vazios em 15–23 | Corrigido | Todas as atividades de 15 a 23 têm código real (mínimo de 582 caracteres) |
| Sem links de documentação em 21–23 | Corrigido | Nenhuma atividade sem `resources` |
| Sem dicas nem `requires` de 04 a 23 | Corrigido | 219 atividades com dicas; 246 com `requires`; o validador rejeita ciclo e dependência posterior |
| Checkpoints locais inexistentes | Corrigido, com limitações | 45 de 45 exportações elegíveis funcionam nos dois modos |
| Versões misturadas (ES2023, TS 5.0+, TS 7) | Corrigido nos rótulos | Cartões de TS dizem "TypeScript 7.0 strict"; as menções a TS 5.x que restam são notas de versão legítimas |

### 2.2 Pontes

| Problema original | Estado |
|---|---|
| Etapas 15–19 compartilhavam a mesma ponte; 20–23 também | Corrigido: cada etapa de 15 a 23 tem ponte própria |
| Ponte 03 usava `return` antes de funções | Corrigido: usa `faixa = 'adulto'` e anuncia o `return` para a 04 |
| Ponte 08 abria com BFS e a etapa começava por complexidade | Corrigido: a ponte declara que antecede 08.07 e 08.08 |

### 2.3 Erros pontuais de conteúdo (§4 original)

| Atividade | Estado | Como ficou |
|---|---|---|
| 23.07 / 23.08 | Corrigido | Ordem 23.08 → 23.09 → 23.07 |
| 11.10 | Corrigido | Vem depois de 11.08 e trata do Kanban |
| 11.05 / 11.06 | Corrigido | `closest()` é ensinado em 11.06, que agora vem antes |
| 13.14 | Corrigido | V2→V3 com `tags`, reaproveitando a migração V1→V2 de 11.13 |
| 14.07 | Corrigido | Material sobre `Promise.try` |
| 14.13 | Corrigido | Dois snippets, um de navegador e um de Node |
| 02.04 / 02.05 | Corrigido | O cartão diz que é só detecção e que a rejeição com `if` vem depois |
| 03 sem prática de `switch` | Corrigido | 03.04 pratica `switch` |
| Runtime TS inconsistente | Corrigido | Ver 2.1 |
| 14.03 usa `node:test` enquanto a 13 adota Vitest | **Aberto** | Item 4.12 |
| 07.03 sem `localeCompare`/`Intl.Collator` | **Aberto** | Item 4.3 |

### 2.4 Pré-requisitos ocultos (§2 original): estado das 28 linhas

**Corrigidas (6).** A atividade, a ordem ou os requisitos mudaram:

1. Ponte 03.
2. 11.05/11.06: ordem invertida.
3. 11.10: agora vem depois de 11.08.
4. 15.09: não usa mais `Readonly<>`.
5. 20.08 → 20.02: 20.02 virou obrigatória.
6. Etapa 08: `07.05` declarado em 08.01 e 08.06. É uma correção parcial: 08.02 continua sem `06.01` (item 1.7).

**Mitigadas por primer (21).** A atividade continua no mesmo lugar, mas o cartão publica uma explicação curta do conceito antecipado (`course-src/prerequisite-primers.json`):

- **Etapas 04–05:** 04.02, 04.05, 04.07, 05.03, 05.04, 05.06 e 05.07.
- **Etapa 06:** 06.06/06.08/06.09 (`try/catch` de JSON), 06.06/06.09 (`Map` e `Set`), 06.07 e 06.10.
- **Etapas 09–12:** 09.05, 10.01, 12.02/12.05 e 12.13.
- **Etapas 15–22:** 15.06, 16.04, 16.06, 17.08, 19.x (ternário, primer em 19.01) e 22.05.

**Aberta (1).** Etapa 13: o diagnóstico pedia uma atividade para instalar e rodar o Vitest localmente antes de 13.01. O runner do site resolve a execução, mas não ensina o setup (item 3.6).

---

## 3. O que falta corrigir: plano por fases

Em cada item, **"O que corrigir"** diz exatamente o que muda e onde, e **"Benefício para o aluno"** explica o efeito no aprendizado. Todo critério de saída exige **evidência observável**: o teste que falha antes da correção, a solução de referência aprovada depois e, quando houver interação, o fluxo real executado no navegador.

### Visão geral da execução

| Bloco | Conteúdo | Quando |
|---|---|---|
| **Passo zero** | Remover os limites fixos que impedem acrescentar atividades | Antes de tudo; poucas horas |
| **Fase 0** | Corrigir os sinais que enganam o aluno hoje e o travamento por laço infinito no DOM | Primeira entrega; poucos dias |
| **Fases 1–2** | Sequência dos pré-requisitos; código inicial, avaliação e rubricas nas etapas 04–14 | Logo depois; é o que mais impacta o aluno |
| **Fase 3** | Ambiente real e ferramentas, por marco de faixa | Em paralelo com as Fases 1–2, por marco |
| **Fases 4–8** | Expansão de conteúdo, recursos, prática, especializações e plataforma | Ajustada conforme resultados observados com alunos |
| **Trilha M** | Manutenção com data ou sem urgência: troca de LTS do Node, piso de versão, fingerprint, TS 6 × 7, cancelamento completo | Em paralelo, sem bloquear as fases |

### Ordem de implementação × ordem de aprendizagem

As fases dizem em que ordem a equipe implementa, não em que ordem o aluno estuda. Na trilha do aluno, as ferramentas e a revisão de código aparecem em **marcos de faixa**:

- **Fim da 07:** primeiro repositório Git e primeira revisão de código.
- **Antes da 13:** Vitest local.
- **Antes da 15:** TypeScript local.

Cada marco entra quando a faixa correspondente for trabalhada nas Fases 1–2. As entregas das fases não ficam acopladas entre si: uma correção da Fase 1 ou da Fase 2 pode ser publicada sozinha.

### Núcleo, especializações e opcionais

Toda atividade nova ou alterada é classificada em uma de três camadas:

- **Núcleo obrigatório:** o que todo egresso precisa para o critério final.
- **Especialização:** as trilhas da Fase 7.
- **Opcional:** recursos recentes ou raros.

Um recurso só vira obrigatório quando está ligado a uma competência do núcleo. Estar disponível no Node não basta.

### Onde editar cada parte do currículo

Os caminhos de edição de cada faixa estão na tabela 'Onde editar' do plano mestre, no topo do documento.

Depois de qualquer mudança em `public/`, rodar `npm run assets:version`.

---

### Passo zero: permitir que o currículo cresça

**Por que vem antes de tudo.** O diagnóstico de 12/10 encontrou contagens fixas que impediam novas atividades e um limite de 300 registros de progresso. As contagens foram corrigidas como dependência da Fase 1 em 13/10; o limite de progresso permanece pendente em P.2. As Fases 1, 3, 4 e 5 acrescentam atividades.

| # | Item | O que corrigir | Benefício para o aluno |
|---|---|---|---|
| P.1 | Contagens fixas | Trocar por contagens derivadas da fonte: `assert.equal(catalog.length, 254)` e a mensagem "254 activities" em `course-src/build-public-curriculum.mjs:200` e `:251`; `catalog.length !== 254` em `scripts/validate-course-catalog.mjs:32`; `assert.equal(ids.length, 42)` para as etapas 20–23 em `scripts/task-9-canonical-regeneration.mjs:13`. | O currículo pode crescer onde o aluno precisa de mais prática. |
| P.2 | Limite de 300 registros | `learningRecords: 300` e `learningEvidenceHistory: 300` aparecem em `public/progress-model.js:47`, em `public/learning-progress.js:57` e, no servidor, em `lib/progress-contract.json:32`, aplicado em `lib/progress-sanitize.ts:63`. `public/learning-progress.js:379` descarta o excedente sem avisar (`Object.keys(output).slice(maxRecords)`). Derivar o limite do tamanho do catálogo, com margem, nos dois lados. | O progresso de quem faz muitas atividades nunca é cortado em silêncio. |
| P.3 | Novas atividades sem mudar IDs existentes | Acrescentar atividades com IDs novos dentro das etapas existentes (por exemplo, 04.11 em diante) e não criar etapas como `"04B"`. Uma etapa assim quebraria três pontos: `stageRank` em `scripts/validate-curriculum-source.mjs:56` exige `/^\d{2}$/`; o build usa `Number(item.stage) >= 4` nas linhas 122 e 185, o que suprimiria `edgeCases`, `preparation` e `hints`; e a regex das pontes exige `Ponte (\d{2})`. IDs novos que estão no catálogo não precisam de migração de progresso. **Renomear ou remover um ID existente** continua exigindo migração no cliente (`public/progress-migrations.js`) e no servidor, porque `lib/progress-sanitize.ts:63` descarta IDs fora do catálogo e o fingerprint inclui `activityId` (`public/app.js:175`). Este plano não renomeia nenhum ID. | O aluno não perde nada quando o currículo cresce, e a unidade nova recebe dicas, casos-limite e ponte como as demais. |

**Critério de saída.** Uma atividade fictícia acrescentada em teste passa no build, na validação, no regenerador e na persistência do cliente e do servidor, e é removida depois. Um progresso com mais registros que o limite antigo sobrevive a um ciclo de salvar e recarregar.

---

### Fase 0: Sinais honestos e sem travamento (primeira entrega)

**Por que vem primeiro.** São problemas pequenos que hoje enganam o aluno ou travam a página. Corrigi-los é rápido e não depende de nenhuma decisão grande.

| # | Item | O que corrigir | Benefício para o aluno |
|---|---|---|---|
| 0.1 | Aviso falso no executor | Três pontos. (1) Com `autoTested` falso, `public/course-controller.js:169` diz que DOM, TypeScript e Node ficam "como análise escrita". (2) `course-src/build-public-curriculum.mjs:181` só marca `autoTested` em avaliações de tipos quando há `typeContractMutants` e `contractTypeFiles`; por isso 15.01 e 15.06 (ambiente `typescript`) mostram o aviso falso. (3) Com `autoTested` verdadeiro, o texto cita `main.js` mesmo quando o arquivo de entrada é outro. Fazer o texto refletir `assessmentEnvironment` e o `entryPath` real. | O aluno não é desencorajado a executar uma atividade que o site verifica, nem procura um arquivo que não existe. |
| 0.2 | "Demonstrado" vem de transferência declarada | `runTransfer` (`public/app.js:242`) exige que a atividade principal esteja verificada. Depois disso, aceita uma resposta de 40 caracteres ou mais e todos os critérios marcados, e grava `demonstrated` com `source: 'rubric-declared'` e `assessmentPassed: true`, sem executar a solução de transferência. Criar um estado próprio, "transferência declarada", e reservar "demonstrado" para transferências com execução testada. Ajustar o painel e os relatórios que contam "demonstrado". | O selo de domínio deixa de ser dado por um parágrafo. A reflexão continua valorizada, com o nome certo. |
| 0.3 | Decisão sobre a correção no cliente | Registrar em uma linha: **a correção continua no navegador, e os testes e soluções em `public/course-assessments.json` são públicos por design**, porque o DevPath é uma ferramenta de estudo, não uma prova. Consequência para os rótulos: "verificado" significa "passou nos testes publicados", e saída de terminal ou `git log` colados contam como evidência declarada. A plataforma não oferece avaliação independente. Se um dia oferecer, isso entra como projeto próprio, com correção no servidor. | O aluno entende que os testes existem para ajudá-lo a aprender, e nenhum selo promete uma garantia que a plataforma não dá. |
| 0.4 | Laço infinito no DOM | `public/course-dom-runner.js` usa `setTimeout` no documento pai e remove o iframe no fim. Um laço síncrono no iframe (`srcdoc` com `sandbox="allow-scripts"`) pode bloquear a mesma thread, e então esse timeout nem dispara. Instrumentar `while`, `for` e `do` ao montar o código do aluno, injetando um guarda de tempo ou de iterações que lança um erro claro. **Limite a registrar no cartão e no código:** o guarda não cobre recursão profunda, regex com backtracking catastrófico nem chamadas bloqueantes de API. O cancelamento completo fica no item M.3. | O erro de iniciante mais comum, o laço infinito, deixa de congelar a página e apagar o trabalho não salvo. O aluno recebe uma mensagem e pode investigar. |
| 0.5 | Sincronização de progresso | Se o modo conta (fora de localhost) já estiver em uso, homologar em dois navegadores: criar progresso, sincronizar, recarregar, conferir os quatro estados e o histórico de evidências. Se ainda não estiver em uso, mover para antes da sua ativação. | O aluno que estuda em mais de um dispositivo não perde o que fez. |

**Critério de saída.**

- **0.1:** nenhuma atividade executável mostra o aviso de "análise escrita", e o texto cita o arquivo de entrada real. *(Concluído em 13/10/2026: o texto segue `assessmentEnvironment` e cita o `entryPath` publicado. Toda avaliação com `behavior` ou `mutation` executada no navegador agora é `autoTested`, o que inclui nove atividades das etapas 16–19 antes sem esse sinal, e todas passam no teste "starter falha e solução passa". As investigações só de tipos, 15.01 e 15.06, continuam concluídas pela rubrica, porque os erros de tipo intencionais são o material de estudo; elas mostram que o verificador de TypeScript roda no site e trazem o botão "Verificar tipos".)*
- **0.2:** um teste do reducer comprova que uma transferência declarada não produz "demonstrado". *(Concluído: estado `transfer-declared`, "demonstrado" exige evidência executada no navegador, e registros salvos antes são lidos como transferência declarada.)*
- **0.3:** a decisão está registrada e os rótulos foram ajustados. *(Concluído. Decisão: a correção continua no navegador, e os testes e soluções em `public/course-assessments.json` são públicos por design, porque o DevPath é uma ferramenta de estudo, não uma prova. "Verificada" significa "passou nos testes publicados", e saída de terminal ou `git log` colados são evidência declarada. Rótulos e tooltips seguem essa regra.)*
- **0.4:** o teste com `while (true) {}` no DOM termina com erro claro, e a página continua respondendo. *(Concluído em 13/10/2026: laços instrumentados via AST (acorn), com limite de 1000 ms por laço. No navegador, com o tempo limite padrão de 2 s, `while (true) {}` termina em cerca de 1,1 s com a mensagem do guarda. Na primeira execução, com o compilador ainda frio, o tempo limite genérico pode chegar antes. O limite está registrado no código e na mensagem: não cobre recursão profunda, regex catastrófica nem APIs bloqueantes; ver M.3.)*
- **0.5:** sincronização homologada, ou adiada com registro. *(Adiada em 13/10/2026. O repositório não comprova que o modo conta esteja ativo: `dist/server/wrangler.json` usa `database_id` placeholder e não há URL de produção registrada. Os testes automáticos de sincronização e progresso passam (7/7 e 16/16). A homologação em dois navegadores, com duas identidades na URL hospedada, passa a ser pré-requisito da ativação do modo conta. Se a plataforma confirmar que o site já está no ar, ela deve ser feita imediatamente.)*

---

### Fase 1: Sequência sem pré-requisitos ocultos

**Concluída localmente em 13/10/2026**, com subagentes `gpt-6-luna` em raciocínio high. O catálogo passou de 254 para 261 atividades; todos os IDs anteriores e sua ordem relativa foram preservados. Plano e registro da execução: [2026-10-13-fase1.md](planos/2026-10-13-fase1.md).

**Por que vem aqui.** Um conceito cobrado antes de ensinado é o pior caso para quem está aprendendo: o aluno imita a sintaxe sem modelo mental. Os primers já reduziram o problema. Esta fase decide onde a explicação basta e onde falta prática dedicada. Nenhuma atividade existente muda de etapa ou de ID.

#### 1.A Primer suficiente: só revisar a qualidade do texto

| Atividade | Primer publicado |
|---|---|
| 04.02 | `[...a]`, `push` e `++n` explicados |
| 04.05 | Objeto literal como pacote de opções do `Intl` |
| 04.07 | `export function` e o avaliador que importa |
| 05.03 | `filter` explicado como equivalente a `for...of` + `if` + `push` |
| 05.04 | Retorno `{ primeira, ultima }` |
| 05.06 | `Object.freeze` e o `TypeError` ao mutar |
| 06.06 / 06.08 / 06.09 | `try/catch` em `JSON.parse`; `Map`/`Set` não viram JSON diretamente |
| 06.07 | Protótipo, `__proto__` como chave, `Object.create(null)` e `Map` |
| 06.10 | `Object.create(base)` e `Object.hasOwn`, com remissão à etapa 10. Fica na 06: mover exigiria migrar IDs por uma única atividade |
| 09.05 | `var`, escopo de função e içamento. 09.01 também compara `var` com `let/const` na revisão e no feedback |
| 12.13 | `async function*` e `for await`, com remissão à etapa 20. Fica na 12 por ser opcional |
| 15.06 | Compatibilidade estrutural de interfaces e origem dos membros `private`; nota curta sobre alias `type` |
| 16.04 | Tipos com parâmetro (`Promise<User>`, `Array<number>`) |
| 16.06 | `typeof STATUS` e `[number]` em posição de tipo. O diagnóstico original aceitava "explicar ali mesmo" |

**Benefício para o aluno.** Conferir que cada primer é preciso e curto garante que o aluno resolve a atividade entendendo o que escreve, sem carregar uma aula inteira antes da hora. Nas atividades 06.10 e 12.13, a etapa 10 e a etapa 20 retomam o assunto com o modelo completo.

#### 1.B Práticas dedicadas implementadas

| # | Atividade | O que foi aplicado | Benefício para o aluno |
|---|---|---|---|
| 1.1 | Erros antes da etapa 13 (05.07, 12.02, 12.05) | Unidade **"Falhas previsíveis"** em 04.11–04.13: guard clauses, `TypeError`/`RangeError`, `throw new Error`, `try/catch/finally`, limpeza e retornar ou lançar. 05.07 exige 04.11; 12.02 e 12.05 exigem 04.12. A etapa 13 mantém debugging, `cause`, testes e dublês. | O aluno aprende primeiro o que fazer quando algo dá errado e aplica isso depois em coleções e async, em vez de depender só de primers. |
| 1.2 | Optional chaining `?.` (10.01) | Nova 06.11 combina `?.` e `??`, preserva `0`, `false` e `""` e valida separadamente o tipo de perfil recebido. 10.01 exige 06.11. | O aluno usa `?.` com critério, e não para esconder dados inválidos. |
| 1.3 | Ternário (19.01) | Nova 03.10 compara uma escolha curta com ternário e uma decisão de três ramos com `if`, com critério de legibilidade. 07.06 e 19.01 exigem 03.10. O formulário genérico atende apenas esse novo ID; os nove contratos dedicados anteriores permanecem intactos. | O aluno chega aos tipos condicionais da 19 já conhecendo a forma. |
| 1.4 | Classes em TS (17.08) | Nova 17.11 posicionada antes de 17.08: corrigir membros públicos/mutáveis, usar `private`, `readonly` e `implements`, e implementar o método. Campos e atribuições explícitas são compatíveis com `erasableSyntaxOnly`; parameter properties aparecem como contraponto incompatível. Primer de 17.08 alinhado aos campos `#` do starter real. | O aluno pratica a sintaxe de classe do código TS real, e o primer deixa de explicar algo que a atividade não pede. |
| 1.5 | JSDoc e `@ts-check` (22.05) | Nova 22.11 posicionada antes de 22.05: corrigir JSDoc num arquivo `.js` e implementar o cálculo. Avaliação de tipos e comportamento, com contratos contra `any`. `checkJs: true` mantém a checagem ativa; remover só a diretiva não apaga as anotações. | A migração de JS para TS parte de uma técnica praticada. |

#### 1.C Arestas corrigidas

| # | Atividade | O que foi aplicado | Benefício para o aluno |
|---|---|---|---|
| 1.6 | 04.08, 04.09 e 04.10 | As três atividades agora exigem 04.07 em `learningMetadata.requires`, publicado a partir de `course-src/learning-metadata.json`. | Quem chega a essas atividades por outra rota também recebe a explicação do `export`. |
| 1.7 | 08.02 | Acrescentado 06.01 aos pré-requisitos, preservando 03.01 e 05.01. | O pré-requisito real fica visível no painel. |

**Critério de saída.**

- Primers de 1.A revisados.
- Unidade de erros publicada com avaliação.
- Itens 1.2–1.7 aplicados, cada atividade nova com teste que falha com o starter e passa com a referência.

**Verificação de saída (13/10).** `npm test` passou: 776 testes Node, mais os gates da etapa 00; a suíte `test:phase1` passou 12/12. Build de produção e validação curricular passaram, com 261 cartões e zero avisos/erros curriculares. Gate Chromium 7/7: cada starter reprovado, cada referência aprovada, conclusão pelo formulário e rascunho/estado "verificada" preservados após recarregar, sem erros de página. Revisões independentes aprovaram as tarefas e a entrega final. Os 16 primers de 1.A foram revisados; seis foram corrigidos e as remissões de 06.10 e 12.13 foram mantidas.

**Limites da entrega.** Operadores e legibilidade são autoavaliação declarada em 03.10/06.11; os testes conferem resultados. O gate de navegador cobre os sete novos fluxos em prévia local, sem homologação de sincronização entre contas. O lint dos arquivos da entrega tem zero erros e um aviso anterior em `app.js`; o lint global continua com 11 erros em arquivos fora desta fase. Contagens fixas foram removidas como dependência necessária de P.1; P.2 continua pendente, e 261 permanece abaixo do limite de 300. Não houve commit, push ou deploy.

---

### Fase 2: Código inicial, avaliação e feedback nas etapas 04–14 (e correções da 21)

**Por que vem aqui.** As etapas 04–10 são o núcleo da linguagem e formam o hábito de "rodar e verificar". Elas têm menos correção automática que as etapas avançadas, e várias atividades nem têm código para executar. As avaliações das etapas 04–14 são editadas diretamente em `course-src/assessments.json`.

| # | Item | O que corrigir | Benefício para o aluno |
|---|---|---|---|
| 2.0 | Starters só em prosa | 36 atividades de 04–14 têm como único arquivo inicial um `material.md` com uma descrição. Cada uma está na seção 'Prosa → código' do lote correspondente no plano mestre (fases 14 a 19). Materializar o código que o enunciado descreve. Prioridade: as atividades de 2.1 e 14.12, que pede comparar com um bundle de saída que não está nos arquivos. Quando a atividade for de leitura conceitual de propósito, deixar isso explícito no cartão. | O aluno trabalha sobre código real, que pode executar, modificar e quebrar, em vez de imaginar um código diferente do de cada colega. |
| 2.1 | 30 atividades de 04–10 sem avaliação | Depende de 2.0. Prioridade nas de implementação: **04.10, 07.06 e 10.06** (MODIFY) e **09.05** (DEBUG). Depois, as de transferência: **04.08 e 10.07**. Para PREDICT, TRACE e PARSONS sem avaliação (04.01, 05.01, 06.01, 06.02, 08.07, 09.01, 09.04 etc.), registrar a resposta e compará-la com a execução, como as etapas 01–03 já fazem. | O aluno recebe confirmação objetiva justamente na fase em que forma o modelo mental. |
| 2.2 | Rubrica genérica no cartão | As 47 avaliações `rubric` já têm critérios específicos. O problema está no checklist do cartão, que lê `item.rubric`. Esse campo vem de `visible_rubric` e recebe frases genéricas por tipo de atividade (`SCORING[kind]` em `course-src/compile_content.py`). Hoje, 44 cartões têm "Aceite qualquer implementação..." ou "Rode critérios comportamentais...". O build também não copia `assessment.rubric` para o cartão: 20.05, 20.08, 21.05, 21.07, 21.09, 22.08, 23.08 e 23.09 têm rubrica específica na avaliação e mostram texto genérico no cartão. Corrigir em duas etapas: (1) no build, usar `assessment.rubric` quando existir; (2) escrever critérios específicos para os demais, cobrindo resultado, mutação permitida, erro esperado, estado após falha e evidência exigida. Prioridade: **09.08, 11.08, 12.08, 14.08 e 23.08**. | Uma rubrica específica funciona como guia de estudo: o aluno sabe o que um bom resultado precisa ter antes de começar. |
| 2.3 | Testes que cobram bordas não publicadas | `edgeCases` já é publicado (210 atividades) e o validador confere os `hidden_cases` da fonte. Faltam os testes escritos à mão (`course-src/tests/*.test.js`). Cada asserção recebe uma anotação com o ID da borda ou do exemplo publicado que verifica, e o validador falha se houver asserção sem anotação. Uma amostra das anotações é conferida por revisão humana. Mutantes por borda ficam restritos às atividades TEST, em que o aluno escreve os testes. | O aluno é avaliado só por regras que consegue ver no cartão. |
| 2.4 | Feedback na primeira divergência | Quando um teste falha, mostrar entrada, valor esperado, valor observado e uma sugestão de próxima investigação. | Cada falha vira uma lição de depuração. |
| 2.5 | Rubrica e local sem verificação automática | Das 145 atividades de 11–23, 47 são rubricas e 12 são locais. Para cada uma, decidir se dá para converter em teste ou se continua rubrica por natureza (por exemplo, revisão de código). Evidência colada recebe o rótulo de evidência declarada (0.3). | O aluno sabe quais atividades comprovam execução e quais são de reflexão ou declaração. |
| 2.6 | Diagnóstico de nivelamento | Ainda há 5 itens, só de 00–04. Criar diagnósticos por faixa (Fundamentos, Intermediário, TypeScript, Avançado). Cada diagnóstico só pode liberar uma etapa se cobrir as competências que ela dispensa: listar, para cada etapa liberada, as competências verificadas sem ajuda e o item do diagnóstico que verifica cada uma. | Quem já programa pula para o próprio nível sem deixar uma competência essencial para trás. |
| 2.7 | Carga não reconciliada | As durações cadastradas somam 108,7 h, contra 370–500 h declaradas. Isso é uma discrepância documental, não prova de que a prática real seja menor. **Decisão (C1, 14/10):** estimar o tempo por tentativa a partir dos horários dos eventos de progresso que já existem, sem rastreamento novo. Instrumentar com consentimento só se essa estimativa não bastar. Antes disso, revisar as durações irreais marcadas nos relatórios de lote (11.09, 11.14, 11.01, 10.02, 11.03, 03.04, 11.10, 22.10 e os capstones) e recalcular a soma, alinhando os textos de apresentação ao número real ou documentando a diferença (estudo fora da plataforma). Dividir projetos grandes (11.08, 12.08, 14.08, 23.08) em entregas menores. | O aluno planeja o tempo com expectativa realista e recebe retorno frequente nos projetos. |
| 2.8 | 21.04: LRU ou TTL | O briefing menciona TTL, mas a implementação e os testes cobrem só LRU. **Decisão (C3, 14/10):** tirar TTL do briefing. A Fase 22 do mestre registra o mesmo, e a Fase 36 do mestre já não pede TTL. | O enunciado deixa de pedir algo que a correção não verifica. |
| 2.9 | 21.05: a suíte não testa o Worker | Os testes cobrem todo n de 0 a 1500, mais 12 amostras com semente fixa entre 1501 e 20.011. Uma tabela até 1500 falha, mas a semente fixa ainda permite especializar uma resposta. O problema maior é outro: a atividade ensina Worker, mensagens e responsividade, e a suíte só testa `contarPrimos`. Acrescentar testes de identificação das respostas por mensagem, propagação de erros, `terminate` e cleanup. **Decisão (C4, 14/10):** manter as amostras com semente fixa (D4 do mestre) e acrescentar os testes do Worker. O cartão declara o limite da semente fixa. | A atividade passa a avaliar o que ensina: trabalho fora da thread principal com a interface responsiva. |

**Critério de saída.**

- **2.0:** nenhuma atividade de implementação em 04–14 sem código inicial.
- **2.1:** todas as atividades de implementação de 04–10 têm teste que falha com o starter e passa com a referência.
- **2.2:** os cartões mostram a rubrica da avaliação quando ela existe, e nenhum tem "Aceite qualquer implementação".
- **2.3:** o validador falha com uma asserção sem anotação.
- **2.4:** um teste falhando mostra entrada, esperado e observado no navegador real.
- **2.5:** cada atividade `rubric` ou `local` tem rótulo de evidência.
- **2.6:** cada etapa liberada por diagnóstico tem uma matriz de cobertura de competências.
- **2.7:** existe uma primeira medição de uso real.
- **2.8 e 2.9:** as suítes de 21.04 e 21.05 matam um mutante que a suíte antiga deixava passar.

**Resultado técnico — 14/10/2026.**

| Item | Resultado verificado | Limite restante |
|---|---|---|
| 2.0–2.1 | Núcleo 04–10: 69 atividades, 17 starters materializados e 30 lacunas cobertas (22 avaliações executáveis, 8 declaradas). No Edge, 22/22 referências passaram; 9 previsões foram comparadas, e 22 rascunhos/estados verificados foram conferidos após reload. | 04.10 mantém o starter correto porque ensina renomeação sem mudança de comportamento; o teste protege a regressão, enquanto nomes permanecem avaliação declarada. |
| 2.2 | Critérios específicos e entregas graduais dos capstones publicados; fingerprint de rubrica e revalidação explícita preservam rascunho e reflexão. Gate e fluxo Edge passaram. | Os testes não demonstram correção geral dos projetos do aluno. |
| 2.3 | 156 suítes, 1.045 asserts anotados e 998 IDs estáveis; IDs repetidos mantêm contextos separados. AST, marcador, fingerprint e contrato passaram nos gates. Em 14/10, o usuário dispensou a revisão humana e o critério foi resolvido por dispensa; nenhuma revisão humana é alegada. | A amostra de oito casos permanece disponível em `output/fase2/task4-sample-review.md` para consulta futura. |
| 2.4 | Edge 155 mostrou a primeira divergência de 04.04 (`[2,4]`, esperado `3`, observado `6`), preservou feedback após reload, aceitou a referência corrigida e não registrou erro de página. Mudanças só de anotação preservaram o fingerprint. | A captura de entrada observada foi demonstrada para esse helper explícito; loops e closures continuam sem alegação de captura de valores individuais. |
| 2.5 | Das 59 avaliações `rubric`/`local`, 15 foram convertidas e 44 permanecem declaradas com rótulo visível. No Edge, as 15 referências convertidas passaram e cinco mutantes TypeScript foram rejeitados; previsões conceituais continuam sem aprovação automática. | Evidência declarada continua exigindo reflexão/revisão compatível com cada atividade. |
| 2.6 | Diagnósticos D.06–D.09 e matriz de pré-requisitos; gate 10/10 e oito cenários Edge passaram, incluindo ajuda, resposta desconhecida, persistência e recall independente. | Sugestões liberam apenas a primeira entrada mapeada da faixa; não certificam domínio nem concluem atividades antigas. |
| 2.7 | Contador local consentido foi integrado. O catálogo soma 6.722 min (112 h 02 min) de estimativa guiada. QA Edge mediu atividade, pausa por rota, reload e revogação. | QA não é uso real com alunos. Foco/visibilidade nativos ficaram não observáveis no harness, embora os testes de UI cubram o contrato. As 370–500 h seguem provisórias e sem calibração. |
| 2.8–2.9 | 21.04 foi alinhada a LRU sem TTL. A avaliação 21.05 usa Worker nativo: Edge passou 5/5, a suíte histórica 3/3 e quatro mutantes novos foram rejeitados. | A suíte histórica ainda aceita o mutante de cleanup, o que confirma que ela não cobria esse comportamento. |

Na integração, `npm.cmd test` terminou com exit 0: a Fase 1 passou 12/12 e a Fase 2 53/53. O build de produção e o versionamento de assets também terminaram com exit 0; o currículo publicou 265 atividades, sem erros e com dois avisos conhecidos de pré-requisito em 04.01. O ESLint focal dos arquivos alterados terminou sem avisos.

Assim, os entregáveis de engenharia e seus gates estão implementados. O critério 2.3 foi dispensado pelo usuário e marcado resolvido, sem alegar revisão humana. O critério 2.7 permanece pendente de medição de uso real e calibração com alunos. O QA de navegador foi documentado como QA e não substitui essa evidência.

---

### Fase 2.5: Gates e gerador transportados do plano mestre

Itens das fases 4 e 6 do plano mestre, transcritos sem alteração. Ficam fora da Fase 2 para que ela mantenha o escopo original. Executar depois da Fase 2 e antes da Fase 3.

#### 2.5.1 Gates de qualidade em modo aviso (transportado do plano mestre, fase 4)

**Resumo:** os erros da auditoria só vão parar de voltar se o build os detectar. Nesta fase os gates **avisam**; cada fase posterior os torna **erro** no seu escopo.
Criar em `scripts/` (e incluir em `check:curriculum`):
- [ ] **Contrato oculto:** todo import de `assessment.tests` existe no starter ou é citado no prompt (base: `docs/auditoria-atividades-2026-10-13/contrato-oculto.mjs`).
- [ ] **Solução publicada completa:** todo arquivo que a suíte importa existe em `correctFiles` (caso 21.08: `recurso.js` não é publicado).
- [ ] **Starter falha / solução passa,** executados sobre os arquivos **publicados**, não sobre `course-src`.
- [ ] **Mutantes:** toda atividade com teste tem ≥ 1 mutante real (não a string `"plausible"`), e todo mutante falha; timeout por teste para mutante que trava (08.03).
- [ ] **Texto:** `hints` não termina no meio de palavra; títulos sem as grafias sem acento conhecidas (`Transferencia`, `Indice`, `Mudanca`…); `review.answer` dentro do intervalo; `correctFeedback` não repetido dentro da mesma etapa; `firstResponse.action` ≠ `objective`.
- [ ] Registrar a contagem de avisos de cada gate como linha de base.

**Saída:** gates rodando em `check:curriculum`, só avisando; contagens anotadas.

#### 2.5.2 Gerador II: feedback, transfer, links, títulos e rubricas (transportado do plano mestre, fase 6)

**Resumo e verificação:**
- **Feedback de review de template:** idêntico nas 9 da etapa 01; cópia do worked_example nas 11 da etapa 11; "A resposta conceitual esperada é: …" na 14.x; `incorrectFeedback` copiando o correto em 07.03–07.05.
- **Transfer de template** ("Cenário independente… Critérios já publicados") e `transfer.rubric` = `assessment.rubric` (etapas 11, 14, 15, 22–23).
- **Links de docs partidos** entre `section` e `question` em 09.01, 09.05, 09.07, 09.08, 10.01, 10.04–10.07.
- **14 títulos sem acento** e `interaction` de outro tipo de atividade (16.10, 17.01, 17.08, 19.04, 19.05, 19.07).
- **Texto de outro projeto** em `why_it_matters`/`conceptSteps`/`notes`/`vocabulary` (11.08, 11.10, 11.13, 10.06, 04.03, 04.08, 04.09, 16.06).
- [ ] Build usa `assessment.rubric` quando existir.
- [ ] Feedback por alternativa; transfer com dados próprios; parser de links corrigido; títulos acentuados; `interaction` derivada do `kind`.
- [ ] Check: identificador citado em explicação/vocabulário existe no starter.
- [ ] Gates de título e de feedback repetido passam a **erro**.

**Saída:** nenhuma rubrica genérica onde há rubrica de assessment; 0 títulos sem acento; 0 links partidos.

---

### Fase 3: Ambiente real e ferramentas (por marco de faixa)

**Por que vem aqui.** Os checkpoints locais já existem (45 exportáveis). Cada marco é implementado quando a faixa correspondente é trabalhada nas Fases 1–2, sem esperar a expansão de conteúdo. Hoje Git aparece numa única atividade (14.09), e ESLint, Prettier, Vite, CI, `npm audit`, semver e `npm ci` não aparecem.

| # | Marco | Item | O que corrigir | Benefício para o aluno |
|---|---|---|---|---|
| 3.1 | Fim da 07 | Git contínuo | Primeiro repositório (`init`, `add`, `commit`, `log`, `diff`). Daí em diante, commits nos projetos; a partir da 11, branch, merge, conflito e PR. | Git vira hábito, e o aluno chega ao primeiro emprego sabendo trabalhar com histórico e conflito. |
| 3.2 | Fim da 07 | Revisão de código | Nos projetos a partir da 07, o aluno revisa um PR com 3–5 problemas e escreve comentários priorizados. Também recebe uma revisão do próprio código e aceita ou rejeita cada sugestão com justificativa. | Revisar e ser revisado deixa de ser um tópico da etapa 23. |
| 3.6 | Antes da 13 | Vitest local | `npm init`, instalar Vitest, rodar a suíte e o modo watch. | O aluno leva para o próprio computador a ferramenta que usou no site. |
| 3.7 | Antes da 15 | TypeScript local | `tsc --init`, type stripping nativo do Node com `erasableSyntaxOnly`, e quando usar `tsc`, `tsx` ou bundler. | O aluno sabe montar e rodar um projeto TS do zero. |
| 3.3 | Etapa 14 | Lint e formatação | ESLint 9+ (flat config) e Prettier: ler uma regra, entender por que existe e corrigir o código. | O aluno aprende que o lint ensina padrões e evita bugs. |
| 3.4 | Etapa 14 | Bundler na prática | 14.12 só compara bundlers. Acrescentar uma atividade local com Vite: criar, rodar e gerar build. | O aluno deixa de tratar o build como mágica. |
| 3.5 | Etapa 14 | CI mínimo | Pipeline em GitHub Actions com lint, typecheck e test, aplicado a um projeto do aluno. | Cria o reflexo de "verde antes de entregar". |
| 3.8 | Etapa 14 | Dependências | Semver (`^`, `~`, o que uma major quebra), `npm ci`, lockfile e `npm audit`, com riscos de cadeia de suprimentos (`postinstall`). | O aluno instala dependências com consciência de risco. |
| 3.9 | Etapas 12 e 21 | DevTools além do debugger | Atividades com as abas Network (status, timing, CORS) e Performance. | O aluno investiga problemas de rede e desempenho com as ferramentas do dia a dia. |
| 3.10 | — | Pendências dos checkpoints | Criar `course-src/local-checkpoints.json` como fonte (hoje só existe o espelho em `public/local-checkpoints.js`); dar referência à 14.05; fazer `scripts/validate-curriculum-source.mjs` rejeitar ambiente `local` sem `local.commands`. Reexecutar os projetos exportados dos checkpoints (JS, DOM e TS) com `scripts/check-local-course.mjs`, em pasta temporária limpa. A evidência é declarada pelo aluno. | Checkpoints validados no build evitam tarefas locais sem comandos ou referência. |

**Critério de saída.** Cada marco tem um checkpoint que roda num checkout limpo com os comandos documentados, e a evidência é rotulada como declarada. O validador rejeita um checkpoint `local` sem comandos.

---

### Fase 4: Lacunas de conteúdo da linguagem

**Por que vem aqui.** Com a sequência e os fundamentos avaliáveis, acrescentar conteúdo passa a gerar aprendizado verificado. Toda atividade nova entra classificada como núcleo, especialização ou opcional.

**Pré-requisito da fase: validador simples de conceitos.** As 28 ocorrências conhecidas já foram auditadas, mas a expansão desta fase pode criar novas. Antes de acrescentar atividades, registrar em cada atividade a lista de conceitos que ela usa e a atividade que introduz cada conceito. O build falha se um conceito for usado antes de ser introduzido, a menos que a atividade tenha primer para ele. Não é preciso modelar "pratica com ajuda" nem "verifica sem ajuda" nesta etapa.

| # | Tema (etapa) | O que corrigir | Benefício para o aluno |
|---|---|---|---|
| 4.1 | Regex (05) | Só 05.02 e 05.05 (opcional) praticam regex, e nada de `matchAll`, grupos nomeados ou flags. Acrescentar 2–3 atividades: `replace` com grupos nomeados, `matchAll`, flags `g/i/u/v` e "regex × parser". `RegExp.escape` (05.05) só vira obrigatório se escapar entrada do usuário fizer parte do núcleo e a matriz confirmar o suporte no piso. | O aluno deixa de copiar padrões sem entender e aprende quando *não* usar regex. |
| 4.2 | Escrever `reduce` (07) | Hoje o aluno só refatora `reduce` (07.06). Acrescentar uma atividade em que ele escreve o próprio `reduce` com acumulador explícito. | O aluno transfere o modelo de acumulador da 03 para HOFs. |
| 4.3 | `localeCompare` / `Intl.Collator` (07.03) | Nenhuma ocorrência. A atividade e o caso `João/Joao` estão na fase 15 do mestre (lote 3). | O aluno aprende por que `sort()` sem comparador erra "Ágata" × "Bruno". |
| 4.4 | Promises por dentro (12) | Nenhuma ocorrência de promisify nem de `unhandledrejection`. Ensinar `new Promise` para promisificar `setTimeout` e callbacks *error-first*, e o que acontece com uma rejeição não tratada. | O aluno entende o que `async/await` faz por baixo e integra APIs antigas. |
| 4.5 | Retry seguro (12.02) | Retry sem backoff. Acrescentar backoff exponencial com jitter e limite de concorrência (pool de N promessas). | O aluno aprende a não derrubar um servidor com tentativas sincronizadas. |
| 4.6 | Subclasses de `Error` e `Error.isError` (13) | `extends Error` só aparece na 23. Praticar na 13 junto com `cause`. `Error.isError` entra aqui, com o fallback do item 5.3. | Erros tipados permitem tratar cada falha do jeito certo nos projetos seguintes. |
| 4.7 | `URL` / `URLSearchParams` (12) | Nenhuma ocorrência. Uma atividade montando e lendo URLs de API. | Elimina a concatenação manual de query strings. |
| 4.8 | `Intl` além de números (05, 12) | Nenhuma ocorrência de `Segmenter`, `PluralRules` ou `RelativeTimeFormat`. `Intl.Segmenter` na 05.11; `PluralRules`/`RelativeTimeFormat` na 12.12. | O aluno conta "caracteres" do jeito que o usuário vê e formata plurais e datas relativas. |
| 4.9 | Getters/setters e `Object.defineProperty` (10) | Ocorrências mínimas (10.02, 20.04). Uma atividade dedicada. | O aluno lê bibliotecas que usam propriedades computadas. |
| 4.10 | Parâmetros padrão e rest (04) | Declarados no roteiro, sem prática dedicada. Uma atividade MAKE. | Evita confusão com `arguments` e `undefined`. |
| 4.11 | Proxy (20) | 20.04 e 20.05 são opcionais, então Proxy é 100% opcional. Se o roteiro promete Proxy como parte do núcleo, tornar uma delas obrigatória; se não, rebaixar Proxy explicitamente a extensão. | O roteiro deixa de prometer um conteúdo que o aluno pode pular sem saber. |
| 4.12 | Vitest × `node:test` (14.03) | 14.03 usa `node:test`, enquanto a 13 adota Vitest. Tratado na fase 19 do mestre e na decisão D3. | O aluno entende que os conceitos de teste valem para as duas ferramentas. |
| 4.13 | Tagged templates e `EventTarget` (opcional) | Nenhuma ocorrência de tagged templates; `EventTarget` só em 21.02. Atividades curtas. | Prepara a leitura de bibliotecas de SQL, estilos e eventos. |
| 4.14 | Pré-requisitos ainda abertos (fase 24 do mestre, excluída) | Conceitos cobrados antes de serem ensinados que não ficaram com primer nem com unidade própria: ESM e `export` (04.07); objetos literais, arrays e spread (04.02, 04.05, 05.04); callbacks (05.03); Map e Set (06.06, 06.09); `RegExp.escape` (05.05, declarar runtime e fallback); `AbortController` e `FormData` (11.09, distribuir pelas 11 e 12); `import.meta`, `import()` e top-level await (14.05, 14.10); `new Error(msg, {cause})`, `Object.hasOwn` e `Error.isError` (15.x, 16.x; checar o piso); `noUncheckedIndexedAccess` e `exactOptionalPropertyTypes` (18.02, 18.03). Para cada item, conferir o primer publicado. O que não estiver coberto vira atividade nova, com ID novo, ou mudança de cobrança. Intl.Segmenter está no item 4.8. | Nenhum conceito é cobrado antes de ser ensinado. |

**Critério de saída.**

- O validador de conceitos falha com uma atividade de teste que usa um conceito antes da introdução.
- Cada tema do núcleo tem uma atividade obrigatória com teste que falha com o starter e passa com a referência.
- Regex, `reduce` e Promises têm ao menos duas variações executáveis.

---

### Fase 5: Recursos atuais da linguagem e do runtime

**Por que vem aqui.** Recursos novos só ajudam depois que os fundamentos estão firmes (§8.2, item 7, do diagnóstico original). Cada recurso entra como opcional, a menos que esteja ligado a uma competência do núcleo.

**Pré-requisito da fase.** A matriz `course-src/feature-matrix.json` e o detector de recursos de `scripts/validate-curriculum-source.mjs` não cadastram os recursos abaixo. Antes de cada item, cadastrar o recurso com a versão mínima de Node e de navegador. Quando essa versão estiver acima do piso declarado (M.2), definir *feature detection* e fallback.

- `#campo in obj`;
- `import.meta.dirname`/`filename`;
- `--env-file`/`process.loadEnvFile`;
- `node --run`;
- `require(esm)`;
- `DisposableStack` e `SuppressedError`.

| # | Etapa | O que corrigir | Benefício para o aluno |
|---|---|---|---|
| 5.1 | 02.11/02.12 | Nota sobre `Math.sumPrecise` (ES2026, ainda sem suporte no Node 24/26), deixando claro que não resolve dinheiro. | O aluno não acha que um recurso novo resolve aritmética monetária. |
| 5.2 | 05 | `String.prototype.isWellFormed`/`toWellFormed` (ES2024) em 05.11. | Ensina a detectar texto corrompido antes de enviá-lo a APIs. |
| 5.3 | 06 e 13 | `JSON.rawJSON` e o contexto de origem do reviver (ES2026) em 06.06, se o runtime suportar. `Error.isError` vai para a unidade de erros (1.1) ou para a 13 (4.6). A matriz exige Node 24.3.0 para ele e marca "fallback required on Node 24". | O aluno aprende cada recurso no assunto a que ele pertence. |
| 5.4 | 07.07 e 09.06/09.07 | `Map.prototype.getOrInsert`/`getOrInsertComputed` (ES2026) depois da versão com `has/get/set`, com *feature detection*. | Mostra a evolução da linguagem a partir de um padrão que o aluno já escreveu à mão. |
| 5.5 | 10 | Verificação de marca com `#campo in obj` (ES2022), junto com campos privados. | Forma segura de checar a origem de um objeto. |
| 5.6 | 12 | `Promise.withResolvers`, `AbortSignal.timeout` e `AbortSignal.any` em 12.06/12.08. Os três estão na matriz, mas nenhum aparece nos cartões. | Cancelamento e timeout com as APIs atuais. |
| 5.7 | 14 | 14.05 com `import.meta.dirname`/`filename`; 14.06 com `--env-file`/`process.loadEnvFile`; 14.03 com `node --run`; 14.04 com `require(esm)`. | O aluno usa o Node como ele é em 2026. |
| 5.8 | 20 | Iterator helpers (20.06): tornar obrigatório só se pipelines lazy fizerem parte do núcleo da etapa 20. `toBase64`/`fromBase64`/`toHex` (ES2026) em 20.10, como opcional. | O aluno pratica o que vai usar, sem obrigações justificadas só pela disponibilidade. |
| 5.9 | 21 | `DisposableStack` e `SuppressedError` junto com `using`, depois do cleanup tradicional. | O aluno aprende a liberar recursos de forma garantida, com o modelo clássico primeiro. |
| 5.10 | 23 | Capstone com `.nvmrc`/`.node-version` e `packageManager` além de `engines`, e CI com a matriz Node principal + piso. Atividade "atualizar de Node 24 para 26 sem regressão". | Reproduz a manutenção real de projetos. |

**Critério de saída.** Cada recurso novo está cadastrado na matriz e no detector, classificado como núcleo ou opcional, e tem teste no Node principal e no piso declarado.

---

### Fase 6: Prática variada e retenção

**Por que vem aqui.** O banco de variações e a revisão executável dão escala à prática depois que o núcleo está avaliável.

| # | Item | O que corrigir | Benefício para o aluno |
|---|---|---|---|
| 6.1 | Banco de exercícios isomórficos | Para cada conceito central, 3–5 variações com dados e domínios diferentes, estruturalmente relacionadas, sem apenas trocar nomes. | O aluno prova que entendeu a estrutura, não que memorizou um exemplo. |
| 6.2 | Revisão espaçada com recuperação ativa | `review-schedule.js` passa a alternar formatos: múltipla escolha que exige previsão ou raciocínio, previsão de código novo, correção curta e mini-implementação. A múltipla escolha continua útil quando exige recuperação ativa; o problema atual é depender só dela e de perguntas de reconhecimento. | Recuperação ativa em formatos variados fixa o aprendizado no longo prazo, conforme o guia do IES citado nas referências. |
| 6.3 | Katas intercalados | Exercícios curtos de etapas anteriores misturados às novas. | A prática intercalada obriga o aluno a escolher a ferramenta certa. |
| 6.4 | Ler código alheio cedo | Hoje o primeiro mini-repositório é a 23.10. Acrescentar uma investigação em código alheio nas faixas 07, 11, 14 e 18. | Ler código existente é a maior parte do trabalho real. |

**Critério de saída.**

- Cada conceito do núcleo tem pelo menos 3 variações executáveis, cada uma com teste que falha com o starter e passa com a referência.
- Um teste do agendador comprova que a fila de revisão sorteia formatos variados.
- Há uma investigação em código alheio em cada faixa listada.

---

### Fase 7: Especializações para o nível sênior

**Por que vem aqui.** Estes pilares dependem de tudo o que vem antes. A busca no catálogo de 12/10 não encontrou nenhuma ocorrência de `node:http`, SQL/SQLite, CORS, CSP, CSRF, React, Web Components, IndexedDB, Playwright, `expectTypeOf`, decorators, ADR nem desenvolvimento com IA.

Completar uma trilha não comprova senioridade. A trilha é o contexto onde o aluno demonstra os resultados observáveis do critério final:

- **Autonomia:** resolve um ticket ambíguo começando pelas perguntas certas.
- **Manutenção:** absorve uma mudança de requisito sem regressão em código que não escreveu.
- **Transferência:** aplica o que aprendeu num domínio novo.
- **Comunicação:** justifica decisões em ADR e em revisão.

| # | Trilha | O que criar | Benefício para o aluno |
|---|---|---|---|
| 7.1 | Back-end | Servidor `node:http` e depois um framework leve (Fastify ou Hono); roteamento, middleware, validação com schema (reaproveita a 22.06); erros padronizados (RFC 9457); SQLite com migrações e transações; sessão por cookie × token; hashing de senha; desligamento gracioso (`SIGTERM`); logs estruturados; testes de integração da API. | O aluno entrega um sistema completo. |
| 7.2 | Segurança web (obrigatória em todas as trilhas) | CORS, CSP, CSRF, cookies `HttpOnly`/`SameSite`, injeção (SQL e comando), validação de URL e upload, `eval`/`new Function` e OWASP Top 10 aplicado a JS. Hoje há só fragmentos (11.12, 06.07, 14.06, 23.x). | O aluno enxerga ataques como parte do design. |
| 7.3 | Front-end de produção | Um framework de componentes (React, ou Web Components nativos) depois do Kanban; roteamento no cliente; estado assíncrono com cache; CSS de layout e responsividade; Web Vitals; IndexedDB; tipos do DOM em TS (`HTMLInputElement`, `querySelector<T>`). | O aluno transfere o modelo "estado → render" para a ferramenta que o mercado usa. |
| 7.4 | Testes além do unitário | Integração, um fluxo E2E com Playwright, testes de contrato, testes baseados em propriedades (fast-check), mutation testing rodado pelo próprio aluno e type tests com `expectTypeOf`. | O aluno escolhe o tipo de teste pelo custo e pelo risco. |
| 7.5 | Bibliotecas e ferramentas | Superfície pública, compatibilidade, declarations, consumidores, empacotamento e migração de versões, aprofundando a etapa 22. Decorators TC39 para leitura. | Prepara o aluno para manter código usado por outras pessoas. |
| 7.6 | Habilidades de sênior | Tickets ambíguos em que o primeiro passo é fazer perguntas; decomposição e estimativa; README e ADR; simulação de incidente com postmortem (23.09 começa isso); padrões de design pragmáticos e quando *não* abstrair. A revisão de código já está na Fase 3. | Separa quem escreve código de quem entrega sistemas. |
| 7.7 | Desenvolvimento com IA | Revisar código gerado por IA, escrever testes que validam sugestões, reconhecer APIs inventadas e explicar as limitações de uma solução gerada. | O aluno aprende a verificar o que recebe de um assistente. |

**Critério de saída.**

- Ao menos uma trilha completa, com projeto avaliado e testes de integração ou E2E.
- Bloco de segurança obrigatório concluído.
- Cada um dos quatro resultados observáveis tem uma tarefa avaliada, com o rótulo de evidência de 0.3.

---

### Fase 8: Recursos avançados da plataforma

**Por que vem por último.** São recursos que amplificam o aprendizado, mas dependem das fases anteriores.

| # | Recurso | O que fazer | Benefício para o aluno |
|---|---|---|---|
| 8.1 | Projeto contínuo RPG | Um único repositório que evolui de 03 a 23, com cada etapa como uma *change request*. | O aluno convive com as próprias decisões antigas e sente o custo de uma escolha ruim. |
| 8.2 | Workspace multiarquivo persistente | Árvore de arquivos, histórico e *diff* entre tentativas. | Projetos grandes ficam viáveis no site. |
| 8.3 | Git simulado no navegador | isomorphic-git integrado ao workspace. | Commits e branches viram parte natural de cada atividade. |
| 8.4 | Debugger visual e visualizadores | Breakpoints, *step*, escopo, closures e pilha; visualizador de event loop e de heap. | Torna visíveis os conceitos mais abstratos das etapas 06, 09, 10 e 12. |
| 8.5 | Cenários de rede | Partir de `public/course-network.js`, que já oferece sequências de respostas e cancelamento (`AbortError`). Acrescentar o que faltar (por exemplo, JSON inválido e respostas fora de ordem) e um painel para o aluno montar cenários. | O aluno pratica falhas de async sem depender de serviços instáveis. |
| 8.6 | Modo incidente | Logs e métricas falsos, limite de tempo e postmortem. | Treina a investigação sob pressão de forma segura. |
| 8.7 | Painel de competências | Mostra o que foi feito com ajuda, de forma independente, transferido e recuperado depois, com o rótulo de evidência de 0.3. | O aluno distingue "concluí" de "sei fazer". |
| 8.8 | Portfólio | Cada projeto com testes verdes vira um repositório publicável com README. | O aluno sai com provas concretas do que sabe fazer. |
| 8.9 | Capstone 23.08 como produto | Transformar o 23.08 num produto com PRD completo, ADRs, persistência substituível e CI verde, conforme a antiga fase 33 do mestre. Ver também 5.10 e 8.1. | O aluno entrega um projeto que outra pessoa pode manter. |

**Critério de saída.**

- Cada recurso implementado tem um fluxo real executado no navegador: abrir, usar e recarregar sem perder estado.
- Um teste automatizado cobre o comportamento principal de cada recurso.

---

### Trilha M: manutenção com data e melhorias sem urgência

**Por que fica à parte.** Estes itens não bloqueiam nenhuma fase. Alguns têm data externa; outros melhoram a robustez, mas não mudam o que o aluno vê hoje.

| # | Item | Quando | O que fazer | Benefício para o aluno |
|---|---|---|---|---|
| M.1 | Troca de LTS do Node | Janela de 28/10/2026 | `course-src/runtime-baseline.json` já define "até 28/10: Node 24 como base e mínimo". Depois de 28/10: 26 como principal e 24 como mínimo. Atualizar o baseline e os rótulos `runtime` dos cartões. **Não mudar `engines.node`:** `">=24.0.0"` já é o piso. Varrer os textos escritos à mão: "Node.js 24" aparece nos starters de 10 atividades (00.05, 14.03, 14.07, 14.13, 15.09, 16.08, 17.09, 18.09, 21.08, 22.08) e em 165 textos de `prompt`/`compatibility`. Antes, conferir quais são gerados a partir do baseline. Usar a troca como exemplo na etapa 00. | O aluno aprende no runtime que vai encontrar no trabalho, sem cartões que se contradizem. |
| M.2 | Piso de Node comprovado | Junto com M.1 | Os testes rodam no 24.19.0, mas o piso declarado é 24.0.0, e há recursos que só existem em versões intermediárias (por exemplo, `Error.isError` em 24.3.0). Rodar a suíte no 24.0.0 ou subir o piso para a menor versão de fato testada. | O aluno com uma versão mais antiga do Node 24 não encontra erros que o curso diz não existirem. |
| M.3 | Cancelamento completo no DOM | Sem urgência | O guarda de laços (0.4) não cobre recursão profunda, regex catastrófica nem chamadas bloqueantes. Avaliar isolamento real, por exemplo um iframe servido de outra origem com isolamento de processo, sem quebrar a execução offline e a pré-visualização interativa. | Elimina os travamentos que o guarda de laços não pega. |
| M.4 | Versão do executor nas evidências | Sem urgência | O esquema `devpath-assessment-fingerprint/2` (`public/course-assessment.js:43`) inclui `contentVersion`, `assessmentVersion` e a avaliação, mas não a versão do executor nem a do verificador. Guardar essas versões **ao lado** da evidência, fora do hash, para não invalidar o progresso de novo. Decidir caso a caso se uma mudança de executor exige revalidação. | Permite reavaliar evidências antigas quando o executor mudar, sem apagar o progresso do aluno sem necessidade. |
| M.5 | Checker TS 6 × TS 7 | Sem urgência; antes de migrar o verificador | O baseline já chama o checker 6.0 de "proxy estático limitado". A Microsoft condiciona a compatibilidade entre 6 e 7 a configurações como `stableTypeOrdering` e à ausência de `ignoreDeprecations`. Verificar se o host do site repassa essas opções, rodar um conjunto representativo de exercícios no TS 7 real e registrar as divergências. Avisar no cartão quando o diagnóstico do site puder diferir do TS 7. Além disso, mostrar no cartão de TypeScript a versão ensinada (lida de `course-src/runtime-baseline.json`) e a versão do verificador (lida do asset gerado, sem texto fixo). Corrigir a frase 'TS 5.0+' do contrato 15.07, mantendo a nota histórica de `const` type parameters em 17.07. | O aluno não fica confuso quando o projeto local mostra um erro diferente do que viu no site. |

**Critério de saída.**

- **M.1 e M.2:** cartões com Node 26 como principal depois de 28/10 e `npm test` verde no Node 26 e no piso declarado.
- **M.3–M.5:** cada item registrado como resolvido, ou com a decisão de não fazer.

---

## 4. Resumo da ordem

| Bloco | Foco | Pergunta que responde para o aluno |
|---|---|---|
| Passo zero | Permitir crescer | "O curso pode ganhar a prática que me falta sem perder meu progresso?" |
| 0 | Sinais honestos e sem travamento | "O que a tela me diz é verdade, e ela não vai congelar?" |
| 1 | Sequência sem pré-requisitos ocultos | "Tenho base para o que está sendo pedido?" |
| 2 | Código inicial, avaliação e feedback em 04–14 | "Tenho código para trabalhar, sei se acertei e por que errei?" |
| 3 | Ambiente real, por marco de faixa | "Consigo trabalhar fora do site?" |
| 4 | Lacunas da linguagem | "Conheço o que vou encontrar em código real?" |
| 5 | Recursos atuais | "Uso a linguagem como ela é hoje, quando isso importa?" |
| 6 | Prática variada e retenção | "Pratiquei o bastante para lembrar e transferir?" |
| 7 | Especializações | "Consigo entregar e manter um sistema com autonomia?" |
| 8 | Recursos avançados | "A plataforma simula o trabalho real?" |
| M | Manutenção | "O curso acompanha as versões que vou usar?" |

A expansão das Fases 4–8 deve ser ajustada conforme os resultados observados com alunos depois das Fases 0–3, em especial a medição de uso real de 2.7.

---

## 5. Pendências de documentação e histórico de revisões

- `docs/planos/2026-10-09-plano-por-fases.md` foi excluído em 13/10. Este documento é a referência das fases.
- Mutantes de 13.03, 13.07, 13.09 e 13.13: a fonte é o diretório `course-src/mutants/<id>/`, descoberto pelo build (`course-src/build-public-curriculum.mjs:206`). Não é divergência.

**Segunda revisão (12/10).**

- Incluídos no plano: os starters em `material.md` de 04–14 e o setup local do Vitest.
- Corrigida a faixa de tamanho dos starters.
- Reclassificados 16.06, 17.08 e 22.05 como mitigados por primer.
- Reconhecidos os primers e os `edgeCases` já publicados.
- Rubricas genéricas localizadas no cartão.
- Instruções de edição separadas por faixa.
- `engines` deixou de ser alterado.
- Recursos novos passaram a exigir cadastro na matriz.

**Terceira revisão (12/10).**

- Incluídos:
  - o estado "demonstrado" concedido por transferência declarada;
  - as finalidades da evidência;
  - o mapa completo de limites fixos;
  - a migração no servidor.
- Corrigido o diagnóstico de 21.05.
- Ferramentas e revisão de código antecipadas.
- Separados o limite do checker TS e o piso do Node.
- Critérios de saída passaram a exigir evidência observável.
- Carga horária tratada como não reconciliada.
- Separados núcleo, especializações e opcionais.
- Cenários de rede passaram a partir de `course-network.js`.

**Quarta revisão (12/10).**

- **Novo passo zero:** limites fixos, registros de 300 e IDs novos sem etapa nova.
- **Fase 0 enxuta:** aviso falso, transferência declarada, decisão de manter a correção no cliente com rótulos honestos, guarda de laços no DOM com o limite registrado, e sincronização.
- **21.04 e 21.05** passaram para a Fase 2 como correções de conteúdo.
- **Nova trilha M:** a troca do Node passou para lá, com data própria, junto com o piso de versão, a versão do executor fora do hash, a auditoria TS 6 × 7 e o cancelamento completo.
- **Fase 1 sem migrações:** 06.10 e 12.13 ficam no lugar com primer, e a migração de IDs deixou de ser necessária.
- **Integração por marco de faixa** em vez de entregas acopladas.
- **Mutantes por borda** restritos às atividades TEST.
- **Validador de conceitos** simplificado e movido para o pré-requisito da Fase 4.

---

## Apêndice A: contagens por etapa em 11/10/2026

Fonte: `output/learning-execution/task-13-docs-counts.json`.

Legenda: **Aval.** = com entrada de avaliação; **Comp.** = com teste comportamental; **Tipos** = com checagem de tipos; **Mut.** = entradas em `mutantDirs`; **Transf.** = transferência independente (declarada; ver item 0.2); **Rubr.** = ambiente `rubric`; **Local** = ambiente `local`; **Arestas (ativ.)** = arestas `requires` (atividades com ao menos uma); **Dicas** = com `hints`; **Isentas** = sem dica genérica, por renderer dedicado.

| Etapa | Ativ. | Aval. | Comp. | Tipos | Mut. | Transf. | Rubr. | Local | Arestas (ativ.) | Dicas | Isentas |
|---|---|---|---|---|---|---|---|---|---|---|---|
| D | 5 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 (0) | 0 | 5 |
| 00 | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 10 (7) | 0 | 9 |
| 01 | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 11 (8) | 9 | 0 |
| 02 | 12 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 30 (12) | 0 | 12 |
| 03 | 9 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 22 (9) | 0 | 9 |
| 04 | 10 | 5 | 5 | 0 | 0 | 0 | 0 | 0 | 10 (10) | 10 | 0 |
| 05 | 11 | 8 | 8 | 0 | 0 | 0 | 0 | 0 | 11 (11) | 11 | 0 |
| 06 | 10 | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 10 (10) | 10 | 0 |
| 07 | 10 | 7 | 7 | 0 | 0 | 0 | 0 | 0 | 20 (10) | 10 | 0 |
| 08 | 8 | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 20 (8) | 8 | 0 |
| 09 | 8 | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 11 (8) | 8 | 0 |
| 10 | 8 | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 19 (8) | 8 | 0 |
| 11 | 14 | 14 | 9 | 0 | 0 | 14 | 5 | 0 | 29 (14) | 14 | 0 |
| 12 | 14 | 14 | 5 | 0 | 0 | 14 | 9 | 0 | 17 (14) | 14 | 0 |
| 13 | 14 | 14 | 6 | 0 | 10 | 14 | 5 | 0 | 16 (14) | 14 | 0 |
| 14 | 13 | 13 | 2 | 0 | 0 | 13 | 8 | 3 | 23 (13) | 13 | 0 |
| 15 | 10 | 10 | 6 | 8 | 6 | 10 | 2 | 0 | 21 (10) | 10 | 0 |
| 16 | 10 | 10 | 7 | 9 | 7 | 10 | 1 | 0 | 18 (10) | 10 | 0 |
| 17 | 9 | 9 | 3 | 5 | 3 | 9 | 4 | 0 | 16 (9) | 9 | 0 |
| 18 | 10 | 10 | 4 | 6 | 4 | 10 | 4 | 0 | 26 (10) | 10 | 0 |
| 19 | 9 | 9 | 2 | 5 | 2 | 9 | 4 | 0 | 27 (9) | 9 | 0 |
| 20 | 10 | 10 | 10 | 0 | 12 | 10 | 0 | 0 | 15 (10) | 10 | 0 |
| 21 | 11 | 11 | 7 | 0 | 12 | 11 | 1 | 3 | 19 (11) | 11 | 0 |
| 22 | 10 | 10 | 4 | 2 | 10 | 10 | 1 | 4 | 28 (10) | 10 | 0 |
| 23 | 11 | 11 | 6 | 0 | 8 | 11 | 3 | 2 | 28 (11) | 11 | 0 |
| **Total** | **254** | **180** | **106** | **35** | **74** | **145** | **47** | **12** | **457 (246)** | **219** | **35** |

As etapas D–03 têm runners próprios com verificação embutida, por isso não aparecem em `course-assessments.json`.

Verificações finais de 11/10/2026: `npm test` 735/735 no Node 26.7.0 e no 24.19.0; `check:curriculum` com 254 cartões e 0 erros; gate Chromium 42/42; exportação 45/45. Em 12/10, uma verificação independente reexecutou só os três validadores, com 254 cartões e zero avisos e erros.

## Apêndice B: ambiente-alvo de referência (12/10/2026)

- **JavaScript:** ECMAScript 2026 (aprovado em 30/06/2026). Temporal não faz parte do ES2026 e entra só onde o runtime-alvo oferecer suporte.
- **TypeScript:** 7.0 é a versão ensinada (estável desde 08/07/2026). O site usa o checker 6.0 como **proxy estático limitado**, como registra `course-src/runtime-baseline.json`. A compatibilidade entre 6 e 7 depende de configurações como `stableTypeOrdering` e da ausência de `ignoreDeprecations`, segundo o anúncio oficial do TS 7.0. Por isso, o diagnóstico do site não deve ser tratado como equivalente ao TS 7 sem a comparação do item M.5. Migrar o verificador quando o 7.1 publicar uma API programática estável.
- **Node.js:** o 24 entra em manutenção em 20/10/2026 e o 26 vira LTS ativo em 28/10/2026. Até 28/10, o Node 24 é a base e o mínimo. Depois, 26 como principal e 24 como mínimo (item M.1). `engines.node` declara `>=24.0.0`, mas a suíte foi executada no 24.19.0, e testar no 24.19 não comprova suporte ao 24.0 (item M.2). Revisar a cada outubro (troca de LTS) e a cada junho (nova edição do ECMAScript).

## Apêndice C: como recalcular

Horas cadastradas por etapa:

```powershell
node -e "const c=require('./public/course-catalog.json');const by={};for(const a of c){by[a.stage]=(by[a.stage]||0)+(parseInt(a.duration)||0)};console.log(by)"
```

Atividades de 04–10 sem avaliação:

```powershell
node -e "const a=require('./public/course-assessments.json');const c=require('./public/course-catalog.json');console.log(c.filter(x=>+x.stage>=4&&+x.stage<=10&&!(x.id in a)).map(x=>x.id+':'+x.kind).join(' '))"
```

Starters só com `material.md` em 04–14:

```powershell
node -e "const c=require('./public/course-catalog.json');console.log(c.filter(a=>+a.stage>=4&&+a.stage<=14&&(a.starterFiles||[]).some(f=>f.path==='material.md')).map(a=>a.id).join(' '))"
```

Atividades com primer:

```powershell
node -e "const c=require('./public/course-catalog.json');console.log(c.filter(a=>a.primers&&a.primers.length).map(a=>a.id).join(' '))"
```

Limites fixos de contagem e de persistência (passo zero):

```powershell
rg -n "254|ids.length,42|learningRecords|learningEvidenceHistory" course-src/build-public-curriculum.mjs scripts/validate-course-catalog.mjs scripts/task-9-canonical-regeneration.mjs public/progress-model.js public/learning-progress.js lib
```

## Referências

**Aprendizagem**
- IES, *Practice Guide* sobre exemplos resolvidos, resolução de problemas e recuperação espaçada: <https://ies.ed.gov/ncee/wwc/PracticeGuide/1>

**Linguagens e runtimes**
- Ecma International, TC39: <https://ecma-international.org/technical-committees/tc39/>
- TypeScript, downloads e versões: <https://www.typescriptlang.org/download/>
- TypeScript, Handbook (asserções de tipo): <https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#type-assertions>
- Microsoft DevBlogs, anúncio do TypeScript 7.0: <https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/>
- Node.js, calendário de releases: <https://github.com/nodejs/Release>
- Node.js, não bloquear o event loop: <https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop>

**Observabilidade**
- OpenTelemetry, primer de observabilidade: <https://opentelemetry.io/docs/concepts/observability-primer/>
