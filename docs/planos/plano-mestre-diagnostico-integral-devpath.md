# Plano Mestre DevPath — apoio ao estudo pessoal

**Data de revisão:** 18/10/2026
**Uso definido pelo proprietário:** site privado, utilizado apenas como auxiliar do próprio estudo, sem disponibilização para outras pessoas.
**Objetivo:** aprender com conteúdo correto, conseguir praticar e conservar o progresso, com manutenção proporcional a esse uso.

## Decisão de escopo aprovada

- As fases 1–10 permanecem como histórico do trabalho realizado. Seus registros e evidências não serão refeitos para adequá-los ao novo padrão.
- As fases 11–20 são as **10 fases restantes, todas reduzidas**. As fases 11–16 tratam o conteúdo conforme ele for usado; as fases 17–19 são adiadas até o estudo alcançar os assuntos avançados; a fase 20 encerra o escopo efetivamente trabalhado.
- As fases 21–22 deixam de existir como etapas independentes. Seus princípios úteis estão resumidos nas regras deste documento.
- A campanha formal da fase 23 está dispensada. Os recursos de acessibilidade existentes ficam preservados; problemas que dificultem o uso pessoal continuam sendo corrigidos. Se o proprietário depender de leitor de tela ou navegação exclusiva por teclado, reativar a verificação pertinente antes de usar o caminho afetado.
- Os números das fases e os IDs das atividades são preservados para manter referências anteriores. A dispensa de uma fase não significa que seus testes foram executados.
- Esta revisão altera **somente o plano**. Não implementa correções futuras, não remove testes ou recursos existentes e não publica o site.

## Como escolher o próximo trabalho

1. Trabalhar na etapa atual de estudo e, quando útil, preparar a próxima. Não antecipar uma revisão completa das etapas avançadas.
2. Se houver um bloqueio confirmado fora dessa sequência, tratar o bloqueio antes de continuar o exercício.
3. Uma solicitação explícita de fase ou atividade define o escopo da execução. Não ampliar automaticamente para outras fases.
4. Reutilizar evidência das fases anteriores quando fonte, artefato e comportamento relevante não mudaram.
5. Ao terminar os lotes escolhidos, aplicar o fechamento leve da fase 20. Não há dependência obrigatória das fases dispensadas 21–23.

## O que merece correção

**Corrigir quando confirmado:** gabarito ou exemplo errado; tarefa impossível com o material fornecido; arquivo/import ausente; requisito cobrado sem ser explicado; teste que rejeita solução válida ou aceita o erro relevante; código que trava a prática; perda de rascunho/progresso; pré-requisito indispensável sem preparação.

**Melhorar somente se atrapalhar o estudo:** texto confuso, dica que entrega a resposta, rubrica genérica ou ausência de critério compreensível, estimativa de tempo muito enganosa e explicação insuficiente de um conceito usado na tarefa.

**Fora do trabalho obrigatório:** reescrever texto já compreensível por estética; padronizar todo o curso em quatro blocos; impor tamanho mínimo de prompt ou exatamente três critérios de rubrica; criar mutante para toda atividade; eliminar todo aviso do repositório; obter cobertura total; expandir infraestrutura, documentação ou homologação para um lançamento público.

Leitura, comparação e previsão continuam sendo atividades válidas. Material escrito não precisa virar código quando esse não é o objetivo. Conteúdo de segurança, DOM, Workers, TypeScript ou pacotes continua útil quando fizer parte do assunto estudado; o uso privado não autoriza ensinar um comportamento incorreto.

## Verificação simples e suficiente

1. Localizar a fonte efetiva e o conteúdo consumido pelo site. Tratar listas antigas e contagens como pistas, não como prova de defeito atual.
2. Reproduzir apenas o problema relevante. Se já estiver resolvido, registrar isso e seguir. IDs sem descrição de falha não geram correção presumida.
3. Fazer a menor correção que permita cumprir o objetivo. Manter teste de regressão quando o comportamento puder voltar a quebrar.
4. Para comportamento, conferir solução válida e um caso incorreto representativo; para tipos, usar o verificador TypeScript configurado; para previsão, conferir a resposta; para leitura, fornecer critérios específicos suficientes. Não exigir um mutante armazenado para cada caso.
5. Depois de alterar geração ou conteúdo, conferir o resultado compilado. Se mudar public/, executar npm run assets:version e seu check. Não editar só a saída gerada.
6. Executar os testes existentes afetados pela mudança. Ampliar a verificação quando mudar runner, persistência, geração compartilhada ou contrato usado por outras atividades; não repetir a suíte inteira após cada ajuste de texto.
7. Registrar no item do plano apenas ID, problema confirmado ou classificação, correção e verificação/limite. Não exigir relatório ou ledger separado, hash por arquivo, matriz de gravidade ou tabela de auditoria de toda a etapa.

### Testes, mutantes e avisos existentes

Os testes, gates e mutantes já implementados ficam preservados. A exigência futura de criar mutantes em todos os IDs pendentes, inclusive a obrigação residual registrada na fase 7, está dispensada. Criar ou ajustar um mutante só quando ele ajudar a provar um defeito relevante ou um teste insuficiente.

Manter os gates no modo existente; não relaxar ou desligar um gate, autoTested ou avaliação para ocultar uma falha. Um aviso de ausência de mutante, prompt curto ou leitura sem teste genérico não bloqueia automaticamente o estudo. Classificar o resultado e corrigir o defeito comprovado, sem confundir aviso com falha nem saída 0 com prova de qualidade global.

### Restrições de preservação

- Preservar IDs, ordem, rascunhos, respostas, progresso e trabalho não commitado. Não fazer migração ou reorganização para simplificar esta revisão.
- Preservar os runners e contratos funcionais. Não trocar o modo de avaliação para fazer a referência passar no lugar da submissão do usuário.
- Não remover conteúdo avançado ou recursos existentes para reduzir o plano. Adiar sua manutenção até que sejam necessários.
- Não publicar, enviar alterações ao remoto ou limpar arquivos sem autorização específica.
- Código em inglês; interface, cartões e documentos em português.

### Onde editar (mapa inicial; confirmar a fonte e a precedência por campo antes da edição)
As fontes abaixo são pontos de partida. Antes de alterar `prompt`, `firstResponse`, `preparation` ou `hints`, rastreie a ordem efetiva de geração e de sobrescrita daquele campo e confirme a saída publicada; não presuma que `publication-overrides.json` prevalece sobre qualquer campo. No fluxo atualmente descrito, os overrides são aplicados antes de atribuições específicas da etapa: a lógica da etapa 00 pode sobrescrever `prompt`, `preparation` e `firstResponse`; a da etapa 01 sobrescreve `preparation` e `hints`; `firstResponse.action` é recalculado por `distinctFirstAction`, e `preparation`/`hints` também são regenerados para etapas 04+. Confirme a fonte efetiva no código antes de editar e depois confira o artefato gerado.

| Conteúdo | Fonte | Depois de editar |
|---|---|---|
| Etapas D–19: texto, kind, rubrica, review | `course-src/recipes/<etapa>.py`, `course-src/stages/<etapa>.txt`, `course-src/publication-overrides.json`, `course-src/prerequisite-primers.json` | `npm run build:curriculum` |
| Diagnóstico e etapas 00–03: preparação guiada | `course-src/diagnostic-preparation.mjs`, `stage00-preparation.mjs`, `stage01-preparation.mjs`, `stage03-preparation.mjs`, `build-stage00-preparation.mjs`, `guided-preparation.mjs` (vale para 04+ também) | `npm run build:curriculum` |
| Starters, testes e soluções 04–14 | `course-src/starters/<id>/`, `course-src/tests/<id>.test.js`, `course-src/solutions/<id>/`, `course-src/mutants/`; avaliações direto em `course-src/assessments.json` (não há gerador para 04–14) | `npm run build:curriculum` |
| Avaliações 15–19 | Geradas por `scripts/task-8b-stage15.mjs` e `scripts/task-8b-stages16-19.mjs`. **Não** editar as entradas 15–19 de `assessments.json` à mão | Rodar o gerador, depois `npm run build:curriculum` |
| Etapas 20–23 (tudo) | `scripts/task-9-stage20.mjs` … `task-9-stage23.mjs` e demais `scripts/task-9-*.mjs` | Para regenerar, execute `node scripts/task-9-canonical-regeneration.mjs` somente em cópia temporária cujo diretório atual esteja sob `os.tmpdir()`; preserve e respeite o guard do script. Não rode no checkout de trabalho nem edite `course-src/assessments.json` diretamente: a regeneração sobrescreve. Compare o resultado antes de incorporá-lo. |
| Qualquer arquivo em `public/` | — | `npm run assets:version` |

## Mapa de execução após esta revisão

| Fases | Situação | Trabalho esperado |
|---|---|---|
| 1–10 | Histórico preservado | Reabrir somente se surgir regressão concreta ou evidência de erro. |
| 11–16 | Reduzidas, conforme avanço do estudo | Resolver problemas que impedem praticar ou ensinam errado. |
| 17–19 | Reduzidas e adiadas | Conferir conteúdo avançado quando o proprietário chegar a ele. |
| 20 | Fechamento leve | Testes pertinentes e um percurso real de estudo/salvamento. |
| 21–22 | Dispensadas como fases independentes | Usar as regras simples de clareza e material adequado deste documento. |
| 23 | Campanha formal dispensada | Preservar acessibilidade existente e resolver dificuldades reais de uso. |

## Histórico das fases 1–10

Os registros abaixo descrevem a execução sob o escopo anterior. Obrigações de abrangência global, mutantes por atividade, quantidade fixa de critérios e homologação de lançamento citadas nesses registros não criam novas tarefas após esta revisão. A evidência histórica continua válida dentro dos limites que ela declara.

# GRUPO 1: Base e plataforma

## Fase 1: Linha de base e registro de verificação
**Escopo:** registrar o ponto de partida sem corrigir conteúdo.
- [x] Rodar a sequência de verificação e registrar contagem de testes, avisos e falhas.
- [x] Conferir que as 23 fases têm escopo e critério de saída definidos.
- [x] Anotar no próprio plano qualquer falha ou limitação encontrada na linha de base.

**Evidência da linha de base — 17/10/2026, checkout `336922b028aa47e14bbf198a7eb2f79a7371a1f2`:** `npm run check:curriculum` terminou com código 0 após o `precheck:curriculum` regenerar dados. Fonte curricular: 310 cartões, 0 avisos e 0 erros; gates de qualidade: 166 avisos (14 contrato oculto, 8 solução completa, 126 presença de mutantes, 18 identificadores), 0 falhas estritas de texto. O gate de execução rodou em modo de aviso: 262 avaliações listadas, 129 executadas, 133 puladas, 14 IDs sinalizados (`04.01`, `04.10`, `05.01`, `06.01`, `06.02`, `08.01`, `08.07`, `09.01`, `09.04`, `10.01`, `12.14`, `13.03`, `13.07`, `13.09`), 11 starters que não falham, 0 referências falhando e 4 mutantes sobreviventes. Aviso não foi classificado como defeito confirmado nesta fase. Log: `.superpowers/sdd/mestre-fases1-3/fase1-check-curriculum.stdout.log` (SHA-256 `9E58E6CA1D4268A909B8561E9B43FE6D05E910D49AB9E9E9A2F70B1BD2E63785`).

`npm test` concluiu 19 scripts até `test:phase6`: 1.195 testes contabilizados pelo runner, 1.192 passaram, 0 falharam, 2 pulados e 1 `todo`; `test:stage00` também passou em seus verificadores próprios. Em `test:phase7` surgiram falhas explícitas nos casos 24.01, 24.02 e 24.03; a suíte não emitiu resumo nem saída final. O wrapper atingiu 420 s em `test:app`, mas a cadeia continuou avançando; `taskkill` recusou encerrar a árvore por erro de credenciais do ambiente. Após a última saída às 17:06:11, o processo ficou sem avanço observável e a sessão foi interrompida às 17:07, sem mudança adicional no log nos 8 s seguintes. Resultado global do comando: inconclusivo quanto à contagem final de `test:phase7`, com falhas já observadas; não há suíte verde completa. Log: `.superpowers/sdd/mestre-fases1-3/fase1-npm-test.stdout.log` (SHA-256 `91E5279306857BAA64434599AD60E937D6777619C31260EB7F20B940C4284864`).

As 23 fases têm escopo por título/itens e critério de saída: as fases 1–8 e 20–23 trazem `**Saída:**` própria; as fases de lote 9–19 usam o fechamento comum do grupo 4, item 8 (verificação focal, integração do lote e gates aplicáveis), sem `**Saída:**` individual. Limite documental: critérios específicos por lote ainda dependem dessa regra comum. As referências editoriais 21–22 foram lidas: os quatro elementos são proporcionais à tarefa; prompt curto é triagem, e o trabalho editorial ocorre dentro dos lotes correspondentes.

Efeito preparatório registrado, sem correção de conteúdo: `public/course-assessments.json` passou a constar como modificado após a geração. Comparação estrutural com `HEAD`: 262 IDs antes e depois; só `22.07.correctFiles` e `22.07.mutantDirs` diferem por finais de linha embutidos (CRLF/LF); após normalização de quebras, o JSON é idêntico. Hash SHA-256 inicial `4F47B17CCE14D6F6FD8F6B324F6C0544E29E20F03C01D5CB856F32F742CE0260`, final `404099DF36B7FD1319807CB63D2053D85028049CE4245AF282BF4F6DD38AC6AA`. O arquivo gerado e o trabalho preexistente foram preservados. Relatório detalhado: `.superpowers/sdd/mestre-fases1-3/fase1-report.md`.

**Saída:** linha de base registrada; nenhum arquivo de conteúdo alterado.

---

# GRUPO 2: Gerador

## Fase 2: Gerador, dicas e previsão
**Resumo e verificação** (confirmar cada um no gerador e em 2 atividades publicadas):
- **62 dicas truncadas** no meio da palavra ("…Re", "…throw T", "…fak") na varredura reportada: origem apontada em `course-src/guided-preparation.mjs:60` (`clean(item.prompt).slice(0, 240)`). Além de truncar, a dica pode apenas repetir o prompt. Reconfirmar quantidade e casos atuais.
- **Previsão invertida** em 04.01–04.10 (variantes em 05.01, 05.06, 05.10): "Antes de executar, pedir dica ou abrir a solução." Origem em `course-src/recipes/03.py` e `04.py`.
- **`firstResponse.action` = `objective`** em 238 de 254 na varredura reportada; reconfirmar no catálogo atual.
- **Texto de starter colado no prompt** ("Starter de trabalho: … Registre sua primeira decisão…") em 13.x e 14.x; "Use o starter descrito no contrato" em 08.01–08.04 (o contrato não existe).
- [x] Dica não truncada e específica à tarefa; a primeira dica é uma pista útil, não uma cópia do enunciado nem texto automático genérico.
- [x] Texto de previsão: "Escreva sua previsão antes de executar; peça dica só depois de uma tentativa."
- [x] Primeira resposta gerada como pergunta própria.
- [x] Separar resumo do starter do prompt; remover a frase do contrato inexistente.
- [x] Gates de dica e `firstResponse` passam a **erro** no escopo de IDs verificado, sem bloquear lotes ainda não trabalhados.

**Verificação em 17/10/2026 (checkout `devpath-publish`, catálogo regenerado de 310 IDs):** os números 62/254 e 238/254 eram da varredura histórica. Antes da correção, o catálogo atual tinha 0 dicas terminadas em letra e 0 `firstResponse.action = objective`; a função `excerpt()` já preservava frases completas. O defeito confirmado era a primeira dica copiar o prompt em todos os 261 IDs 04+, enquanto nenhuma primeira resposta desses IDs era uma pergunta. A fonte e o catálogo confirmaram 10 timings invertidos em 04.01–04.10, 25 prompts com bloco `Starter de trabalho` em 13.x/14.x e 6 referências ao contrato inexistente em 08.01–08.04, 08.06 e 08.08. As variantes 05.01, 05.06 e 05.10 não tinham o timing invertido; as 49 atividades D–03 não tinham igualdade com `objective` nem previsão invertida.

**Correção e saída em 17/10/2026:** `course-src/guided-preparation.mjs` gera a primeira dica a partir da armadilha específica da atividade; após revisão, `course-src/first-response-questions.mjs` fornece 120 perguntas editoriais para leituras, comparações, previsões, projetos e transferências, e as outras 141 perguntas derivam do risco específico sem usar o rótulo de `examples[0].given` como caso. D–03 permanece preservado. As receitas 03/04 corrigem a ordem da previsão; 08 elimina a menção ao contrato ausente; 13/14 deixam a missão em `prompt` e mantêm o starter em `starterFiles`, apresentado em seção própria da interface. `public/course-catalog.json` foi regenerado: 0 dicas com o molde antigo ou corte heurístico, 0 previsões invertidas, 0 ações iguais ao objetivo, 0 primeiras respostas declarativas nos 261 IDs 04+, 0 blocos de starter no prompt e 0 menções ao contrato inexistente. O diff estrutural altera `firstResponse.action`, `hints` e `preparation` somente nos 261 IDs 04+; `firstResponse.timing` muda somente em 04.01–04.10 e `prompt` em 31 IDs (08: 6; 13/14: 25). D–03 não mudou semanticamente nesses campos.

**Gate e testes em 17/10/2026:** `scripts/phase2-verified-ids.json` fixa os 261 IDs verificados; `check:curriculum` agora trata `hint-cortado`, `dica-copia-prompt`, `primeira-resposta` e `primeira-pergunta` como erro somente nesses IDs, preservando avisos dos demais. Testes vermelhos/verde do gerador e dos gates: 18/18 ao final, incluindo regressão D–03. `npm.cmd run build:curriculum`, `npm.cmd run check:curriculum`, `npm.cmd run test:catalog` (4/4), `npm.cmd run test:stage03` (19/19), `npm.cmd run test:phase6` anterior à inclusão do teste novo (184 aprovados, 1 todo, 0 falhas), `npm.cmd run assets:version` e `node scripts/update-asset-versions.mjs --check` passaram. O rerun de `test:phase6` exibiu resumo Node com 187 aprovados, 1 todo e 0 falhas, mas o processo não encerrou e foi interrompido; os testes focais finais passaram 18/18. `check:curriculum` manteve 166 avisos de outros gates e `gate-execucao` em modo aviso com 14 IDs reportados; essas pendências pertencem a outros itens do plano. Evidência detalhada, casos publicados e limites: `.superpowers/sdd/mestre-fases1-3/fase2-report.md`.

**Revisão da Fase 2 em 17/10/2026:** o review detectou perguntas iniciais sem sentido nos rótulos `esperado` (13.01), `ciclo` (14.01) e `build` (14.12), além de duas contraprovas que o gate aceitava: `Pista: ` + prompt e `Em Dobro, qual é o objetivo?`. Três testes de regressão falharam antes do ajuste e os testes focais passaram 22/22 depois. O gate agora rejeita a cópia integral do prompt mesmo com prefixo e perguntas obviamente genéricas sobre o objetivo; seus checks são estruturais e não provam, sozinhos, a utilidade pedagógica. `build:curriculum`, `test:catalog` (4/4), `check:curriculum`, `assets:version` e o check de hashes passaram; `phase6` e `npm test` não foram repetidos nesta revisão. O diff entre o snapshot anterior à revisão e o catálogo regenerado muda somente `firstResponse` e `preparation` nos mesmos 261 IDs 04+; D–03 continua idêntico. Detalhes e comandos no relatório da fase.

**Saída:** 0 dicas truncadas, 0 previsão invertida, 0 `firstResponse` = objective.

# GRUPO 3: Integridade de gabarito

> Corrigir gabaritos, referências, contratos e testes junto ao lote da atividade evita separar dependências e repetir investigação. Use as fases 3–6 integradas aos lotes 9–19, seguindo a ordem de execução definida no início.

## Fase 3: Gabaritos e conteúdo errados
| Atividade | Achado a verificar | Resultado e evidência em 17/10/2026 (checkout `devpath-publish`) |
|---|---|---|
| 08.07 | Gabarito marcava a alternativa errada. | **Confirmado e corrigido.** `course-src/publication-overrides.json` marcava a escolha de índice 2, “visitar o destino”; agora marca a escolha 0, “impedir duplicatas”. `node scripts/build-curriculum-data.mjs` regenerou o catálogo (310 IDs); o embaralhamento de `build-public-curriculum.mjs` a coloca no índice **3** publicado, mantendo o índice da resposta já persistido. A pergunta inicial em `course-src/first-response-questions.mjs` agora pergunta pelos predecessores dos vértices seguintes, sem pressupor predecessor para A. O teste focal verificou o texto escolhido (4/4, saída 0). A sugestão de índice final 0 era **parcial** porque ignorava o embaralhamento. |
| 19.06 | O feedback afirmava que `-?` não remove `undefined` em `--strict`. | **Confirmado e corrigido.** `scripts/typecheck-host.mjs` usa `strict: true` por padrão, sem `exactOptionalPropertyTypes` no assessment 19.06. TypeScript **6.0.3**, com fonte virtual e `noEmit`, rejeitou ausência (TS2741), `theme: undefined` (TS2322) e `explicit: undefined` (TS2322) no modo efetivo; com `exactOptionalPropertyTypes: true`, aceitou somente o último desses três casos. `course-src/recipes/19.py` agora explica ambos os modos. A rubrica efetiva em `scripts/materialize-phase2-artifacts.mjs` foi regenerada pelo modo `--only=19.06-rubric` e aparece em `public/course-assessments.json` e no catálogo; a alternativa correta publicada ficou no índice 2 após embaralhamento. Teste focal da referência, gabarito e rubrica: 4/4, saída 0. |
| 12.04 | O exemplo omitia P2, que o starter agenda em P1. | **Confirmado e corrigido.** `course-src/recipes/12.py` passou a descrever o agendamento de P2 e a sequência `A,B,P1,Q,P2,T`; `public/course-catalog.json` regenerado mostra a entrada e a saída compatíveis. O teste focal executou o starter e comparou suas seis linhas ao exemplo publicado (4/4, saída 0). As dicas regeneradas leem esse exemplo. |
| 14.13 | O exemplo omitia B síncrono. | **Confirmado e corrigido.** `course-src/recipes/14.py` e o catálogo regenerado registram `A,B,P,T`; o teste focal executou o snippet publicado e confirmou A, B, P, T (4/4, saída 0). A previsão Node continua dependente de versão, módulo e contexto. |
| D.05 | A alegação pressupunha bug em `total`. | **Parcial: bug falso, texto corrigido.** O cartão é `INVESTIGATE`: pede hipótese, escolha de ferramenta e evidência. A função publicada devolveu **5** para `[2,-1,3]` em execução Node, como prevê o exemplo. O prompt antigo falava em “localizar uma falha curta”; `course-src/recipes/D.py` agora explicita uma divergência hipotética em outra entrada. O catálogo regenerado mostra a pergunta sem afirmar falha real. Não foi introduzido `n = x` artificial. |
| 06.06 | O starter já protegia JSON inválido com `try/catch`, enquanto o prompt mandava depurar. | **Parcial e corrigido no texto.** O cartão é `COMPARE` e o objetivo distingue sintaxe, esquema e perdas no round-trip. O starter publicado retornou `null` para `{invalido` e o objeto com `vida: 0` para o texto JSON válido `{"vida":0}`. Tanto `course-src/recipes/06.py` quanto o override efetivo em `course-src/publication-overrides.json` agora pedem leitura e comparação; preservam a proteção e a distinção pedagógica. Dicas regeneradas do novo prompt no catálogo. |
| 01.01–01.09 | Alegação de `correctFeedback` idêntico nas nove atividades. | **Falso no estado atual.** `course-src/recipes/01.py` já contém nove feedbacks específicos, e uma leitura programática de `public/course-catalog.json` contou **9 textos distintos em 9 cartões**. Nenhuma alteração nesses cartões. |
- [x] Aplicar o protocolo de verificação a cada linha e registrar o resultado no próprio item.

**Limite da verificação em 17/10/2026:** `gate-execucao --only=06.06,08.07,12.04,14.13,19.06 --strict` saiu 1 apenas porque o starter de 08.07 já passa como exercício `TRACE`; os demais quatro IDs foram ignorados pelo gate (`rubric` ou `typescript-only`). O critério de starter vermelho não se aplica à previsão conceitual; a correção do gabarito foi verificada pelo texto da escolha e por teste focal. Os verificadores curriculares diretos terminaram com saída 0 e o gate de qualidade manteve 166 avisos históricos, sem falha strict. A suíte agrupada da Fase 3 imprimiu 17 aprovações e nenhuma falha, mas não encerrou e foi interrompida; a suíte focal nova encerrou com saída 0 (4/4).

**Saída:** sete linhas classificadas; quatro defeitos confirmados e corrigidos, dois achados parciais corrigidos e um falso, sem introduzir bug artificial.

## Fase 4: Solução, starter e testes incompatíveis

**Critério:** conferir contrato, starter, suíte e referência; aplicar aceite próprio a tarefas `READ`/rubrica. Evidência datada de 17–18/10/2026, baseline `HEAD 336922b028aa47e14bbf198a7eb2f79a7371a1f2` e saída final publicada identificada pelos hashes abaixo.

| ID | Classificação e resultado |
|---|---|
| 23.10 | **Falso/obsoleto.** É `READ`, sem suíte ativa; a comparação antiga entre APIs não comprova defeito executável. Fonte efetiva: atividade 23.10 publicada e manifesto F6; mantido inativo. |
| 21.08 | **Confirmado e corrigido.** `usarRecursos` importa `recurso.js`, que faltava em `correctFiles`; arquivo agora acompanha a referência. Fonte: gerador etapa 21, `solutions/21.08/`, avaliação publicada. Gate estrito de solução completa passou nos 10 IDs. |
| 21.07 | **Confirmado e corrigido.** O harness esperava `{agora,setTimeout,clearTimeout}`, solução usava `{set,clear,now}` e starter simulava 4 em vez de 100 eventos. Contrato, solução e prova foram alinhados. Fonte: gerador/starter/teste 21.07; suíte focal master456. |
| 13.14 | **Confirmado e corrigido.** Testes usavam save sem `getItem`; agora exercitam API Storage e JSON inválido sem escrita de volta. Fonte: `course-src/tests/13.14.test.js`, solução e assessment. Early final: 16/16. |
| 18.10 | **Confirmado e corrigido preservando o runtime.** `handle('4')` mantém o parsing numérico do starter; a referência antiga tinha ramo especial para `ok`. A transferência independente continua usando `created`/`failed`. Fonte: solução, starter, suite e assessment 18.10; early final 16/16. |
| 16.03 | **Confirmado e corrigido.** O teste exigia `codigo`, mas starter/exemplo usam `linha`; A referência usa `linha`; o README mantém a transferência independente `Entrega`/`armario`. Fonte: atividade e artefatos 16.03; early final 16/16. |
| 11.04 | **Parcial.** A alegação de formulário ausente era falsa: fixture já tinha `#inscricao` e controles. O defeito real era perder `assertionCases` na chamada DOM genérica; corrigido em `public/course-assessment.js`. DOM runtime focal 96/96; Chromium publicado 4/4. |
| 11.05 | **Confirmado e corrigido.** Montagens repetidas duplicavam listeners; cleanup deixa uma ação por clique. Chromium: referência 3/3, starter 1/3, controle de remount 4/4; mutante sem cleanup rejeitado. |
| 13.03 | **Confirmado e corrigido.** Helper importado precisava ser fornecido no conjunto da atividade; dependência publicada foi alinhada à referência. Fonte: stage 13.03 e avaliação; gate estrito F4 passou. |
| 13.09 | **Confirmado e corrigido.** `retry.js` usado pelo teste faltava no starter/arquivos publicados; helper e contrato foram alinhados. Fonte: stage 13.09 e avaliação; gate estrito F4 passou. |
| 13.13 | **Confirmado e corrigido.** Referência precisava do HTML/helper usado pela suíte; arquivos e avaliação sincronizados. Chromium 4/4, todos os mutantes declarados mortos; gate estrito F4 passou. |
| 14.11 | **Falso para o cartão ativo.** É atividade `COMPARE`/rubrica; starter ativo é material textual. O antigo bloco de `package.json` na receita é inativo e não representa pacote publicado. Fonte: receita, starter manifest, assessment/rubrica. Excluído do gate executável. |

**Gate e prova focal:** geração curricular `npm run build:curriculum` — 310 atividades, exit 0; `npm run assets:version` e `node scripts/update-asset-versions.mjs --check` — exit 0. Early final 16/16 preservou 17 casos com IDs originais (4/5/4/4); README/entrega de 16.03 e semântica de 18.10 conferidos. `node --test --test-force-exit scripts/test-master456-early.mjs scripts/test-master456-contracts.mjs scripts/test-master456-advanced.mjs scripts/test-master456-legacy.mjs` — 48/48; `node --test --test-force-exit scripts/test-phase4-curriculum.mjs` — 8/8; `node scripts/check-quality-gates.mjs --scoped-strict=gate-solucao-completa --verified-ids=scripts/master-phase4-verified-ids.json` — 10 IDs, 0 bloqueios; DOM runner e assessment — 96/96. Browser Chromium final cobriu 11.04 (4/4), 11.05 (3/3 + remount 4/4), 11.08 (7/7), 13.13 (4/4), 21.05 (5/5) e 21.09 (assessment 3/3, suite protegida 3/3, controle 4/4; mutante de mediana superior rejeitado). Saída F4: [x].

## Fase 5: Soluções de referência com comportamento incorreto

**Critério:** referência correta e teste que rejeita o comportamento antigo relevante.

| ID | Classificação e prova final |
|---|---|
| 18.07 | **Confirmado e corrigido.** `constructor`, `toString` e `__proto__` não podem escapar como propriedades herdadas; solução usa propriedade própria e regressões cobrem as chaves. Early final 16/16. |
| 20.08 | **Confirmado e corrigido.** `take` posicional, fechamento do iterador em `break`, builder imutável e generator estão cobertos; a versão antiga falha. `scripts/test-master456-advanced.mjs`, incluído no master456 48/48. |
| 21.09 | **Confirmado e corrigido.** Exporta `comparar` e calcula média das duas amostras centrais em n par. Publicado: avaliação 3/3, suite protegida 3/3 com 4 assertion cases, controle async 4/4; mutante da mediana superior rejeitado. |
| 16.10 | **Confirmado e corrigido.** Erro público é fixo; causa técnica permanece interna. Regressão incluída no early final 16/16. |
| 23.02 | **Confirmado e corrigido.** Resposta pública não revela `cause`; contrato `criarServico` está declarado e testado. Focal avançado incluído no master456 48/48. |
| 22.08 | **Confirmado e corrigido.** Build copiava `.d.ts` manual, que podia divergir da implementação. JavaScript/JSDoc agora gera declarações por TypeScript; teste valida tarball instalado por consumidor externo, runtime e tipos. `node --test scripts/test-task-9-package-22-08.mjs` — 1/1. |
| 07.06 | **Confirmado e corrigido.** Redução usa `Object.create(null)` e spread para preservar coerção de objeto comum, incluindo chaves herdadas e `1`/`'1'`; teste misto focal 1/1. |

Saída F5: [x]. Evidência comum: `node --test --test-force-exit scripts/test-master456-early.mjs scripts/test-master456-contracts.mjs scripts/test-master456-advanced.mjs scripts/test-master456-legacy.mjs` — 48/48; teste focal 07.06 1/1; pacote 22.08 1/1.

## Fase 6: Contratos ocultos

**Escopo:** 22 IDs; 23.10 fica registrado como `READ` sem suite ativa. Nomes, formatos e falhas exigidos foram comparados ao baseline e ao artefato final.

| ID | Classificação e resultado |
|---|---|
| 20.01 | **Confirmado e corrigido:** `percorrer` estava oculto; prompt/starter declaram o helper e seu contrato. |
| 20.04 | **Confirmado e corrigido:** `observar` estava oculto; contrato visível alinhado à suíte. |
| 20.05 | **Confirmado e corrigido:** `validarUser` estava oculto; contrato visível alinhado à suíte. |
| 20.06 | **Confirmado no baseline e corrigido:** importava `take`/`run`, mas starter antigo só expunha `manualPipeline`; exports e prompt completo agora incluem os nomes exigidos. Fonte baseline: `quality-before.json` e snapshots `catalog-before.json`/`assessments-before.json`; focal avançado. Não é falso positivo no estado corrigido. |
| 20.09 | **Confirmado e corrigido:** `criarStream` e `consumirLento` estavam ocultos; nomes/contratos visíveis. |
| 20.10 | **Confirmado e corrigido:** `medirTexto` e `decodificar` estavam ocultos; nomes/contratos visíveis. |
| 21.05 | **Confirmado e corrigido:** formato de entrada inválida e mensagem exata estavam ocultos; prompt e suite alinhados. Chromium 5/5, mutants mortos. |
| 21.06 | **Confirmado e corrigido:** `criarCache` e `cachePorId` estavam ocultos; contrato visível. |
| 21.08 | **Confirmado e corrigido:** `usarRecursos` estava oculto; contrato e recurso transitivo publicados. |
| 22.04 | **Confirmado e corrigido:** `migrar` estava oculto; contrato visível. |
| 22.05 | **Confirmado e corrigido:** `executar` estava oculto; contrato visível. |
| 23.02 | **Confirmado e corrigido:** `criarServico` estava oculto; assinatura e erro público declarados. |
| 23.03 | **Confirmado e corrigido:** `StorageError` e causa interna têm contrato explícito; suíte protege a mensagem pública. |
| 23.04 | **Confirmado e corrigido.** Assinaturas, formatos, mensagens e regra sem gravação em falha estão visíveis. Harness round 2 exige falha `ERR_ASSERTION` no caso esperado; cinco mutantes semânticos rejeitados e três controles de infraestrutura corretamente rejeitados. `scripts/test-master456-legacy.mjs` — 4/4; re-revisão da rodada 2 aprovada. |
| 23.09 | **Confirmado e corrigido:** `lerLogs` e `limparLogs` estavam ocultos; contrato visível. |
| 23.10 | **Falso/obsoleto para gate de nomes:** `READ`, sem suite executável atual; registro inativo, não obrigação de API. |
| 11.03 | **Formato confirmado e corrigido:** entradas/saídas exigidas pela suite agora estão no prompt. |
| 11.08 | **Formato confirmado e corrigido:** entrada e mensagem de erro declaradas; Chromium 7/7. |
| 11.13 | **Formato confirmado e corrigido:** formato exigido pelos casos explicitado no contrato. |
| 14.06 | **Formato confirmado e corrigido:** mensagem/contrato explícitos sem exposição indevida de segredo. |
| 15.07 | **Confirmado e corrigido:** `RangeError` estava oculto no catálogo base; a afirmação do plano antigo estava desatualizada. Contrato agora declara o erro e fallback de rótulo. Separadamente, o gate passou a aceitar paráfrases semânticas em vez de exigir frase fixa. |
| 16.10 | **Formato confirmado e corrigido:** mensagem pública controlada e causa técnica privada, coerente com rubrica e teste. |

**Gate e prova focal:** `node scripts/check-quality-gates.mjs --scoped-strict=gate-contrato-oculto --verified-ids=scripts/master-phase6-verified-ids.json` — 22 IDs, 0 bloqueios; testes estruturais de contrato 17/17 e re-revisão da rodada 3 aprovada; master456 48/48. `node scripts/task-9-reference-gates.mjs` — 27 assessments executáveis passaram. O resumo da suíte de fase 6 foi 191 passed, 0 failed, 1 todo; o processo não encerrou limpo. Os wrappers amplos `npm run check:curriculum` e `npm run test:executors` foram interrompidos em execuções anteriores, sem resultado global confirmado. Não declarar `npm test` global verde: a fase 20 permanece fora deste escopo.

**Snapshot da verificação browser (SHA-256, Chromium 155 em 18/10/2026):** `public/devpath.html` `8C254BACF13DB480B07B38063E71CFDE199A16AF0CA7901F104E2CA2D40C08FF`; `public/app.js` `FE7097CD82B64F50F45947D035B7263E73DC89E6BDD0F472AE6C88C772C2E6B2`; `public/course-assessment.js` `7D7A648F885A15980A5C4E896625DCC447BDAD6AA1D39BD62B3D95FE96ACBAC5`; `public/course-dom-runner.js` `44B1E0DE1AF53597261B6E7BBE4CCB0A9B8962D37B5EC04B81F8A93FAF1AB3B6`; `public/course-assessments.json` `EEF49089A5725291D364AADD1BBE464B71FBDB427EE66689781628A8066789EA`; `public/course-catalog.json` `BD388A2DBED68A216C77EF0ABAACE6356A52A5ECE1F82B3803B4FBD6E48E597E`. Após remover somente linhas em branco no fim das suítes 16.03 e 16.10 e regenerar os assets, o hash final de `public/course-assessments.json` é `4E39B63F304F07AC073B29710D435EEC5E2E5C8B0D8FA72020C83DCB735AF957`. Os demais hashes listados permanecem iguais. A conferência fonte/publicação, os hashes de assets, `git diff --check` e os 48 testes focais passaram novamente; essa alteração de whitespace não teve nova execução browser.

- [x] Fases 4–6: gates estritos e verificações focais/browsers do escopo aprovados.
- [x] Proteção da regeneração temporária corrigida: `scripts/temporary-path-guard.mjs` aceita somente descendentes estritos da pasta temporária; raiz, pai, caminho com prefixo semelhante e checkout são recusados. Teste focal 11/11, sintaxe válida e recusa do checkout com código 3; re-revisão independente aprovada.


**Conferência final independente em 18/10/2026:** 48/48 testes do escopo passaram, com saída 0. Nove verificadores diretos encerraram com código 0: publicação curricular e checkpoints em `--check`, catálogo, fonte, modelo de progresso, vínculos de conceitos, hashes de assets e os dois gates estritos listados acima. A execução com `--test-force-exit` comprova as asserções concluídas, sem comprovar limpeza de todos os handles das suítes amplas. Os gates de outros lotes continuam em modo de aviso; os 108 avisos atuais de solução completa incluem ampliação da análise, não 108 defeitos confirmados. Registros dos comandos e resultados: `.superpowers/sdd/mestre-fases4-6/root-final-checks.json`, `root-final-master-result.json`, `root-final-master-tests.log`, `shared-integration-report.md` e `browser-report.md`. Nenhum ID de atividade foi removido.

## Fase 7: Mutantes e testes que travam
**Resumo histórico da varredura:** 61 atividades com teste sem mutante; 10 (15.x/16.x) com `mutants: "plausible"`; o mutante `lo = mid` de 08.03 trava a suíte. Esses totais não são uma contagem atual de pendências.
- [x] **Confirmado e coberto por regressão (18/10/2026):** o runner de avaliação interrompe uma execução real que não termina e relata timeout. `public/course-runner.js` encerra o Worker dentro do iframe e remove o frame; `node --test scripts/test-course-runner.mjs scripts/test-gate-execucao.mjs` passou nos seis testes do runner e nos quatro casos executáveis do gate (mais um TODO histórico 21.04). Em `scripts/test-gate-execucao.mjs`, o mutante 08.03 com `while (true) {}` retornou `kind=timeout`, `killed=true`, `killedByTimeout=true` em ~2,26 s, e o gate concluiu abaixo de 60 s. Classificação: o timeout reportado está corrigido no estado atual e a interrupção real foi reproduzida; o TODO 21.04 não pertence a esta falha.
- [x] **Confirmado, corrigido e verificado (18/10/2026):** os 10 IDs 15.02–15.04, 15.07, 15.08, 15.11 e 16.02–16.05 têm mutantes estruturados com arquivos e conteúdo não vazio. A fonte canônica `scripts/task-8b-stage15.mjs` substitui os seis IDs genéricos `plausible` por nomes semânticos (os conteúdos de defeito permanecem explícitos); os quatro IDs 16.x já tinham nomes semânticos. O novo teste focal em `scripts/test-course-tests.mjs` chamou `DevPathAssessment.run` e comprovou referência aprovada e rejeição dos 12 mutantes publicados (10 comportamentais e 2 de contrato TypeScript) nos dez IDs. O gate `scripts/gate-mutantes-presenca.mjs` agora rejeita entrada legada, listas/arquivos ausentes ou vazios, caminhos absolutos Windows, IDs placeholder com variação de caixa/espaços e IDs não textuais. `node --test scripts/test-quality-gates.mjs`: 18/18 passou. O strict escopado no artefato `public/course-assessments.json` para `mutante-invalido` e `mutantes-ausentes`, restrito aos dez IDs verificados, terminou com exit 0.
- [ ] **Pendente por lote (18/10/2026):** confirmar nos lotes quais atividades fora dos dez IDs continuam sem mutantes. A contagem histórica 61 não foi promovida a defeito atual nem transformada em bloqueio global nesta fase.

**Saída da Fase 7:** interrupção real comprovada; mutantes relevantes verificados nos dez IDs alvo; formato inválido bloqueado nesses IDs pelo gate estrutural. O levantamento de ausência em outros IDs continua reservado aos lotes.

## Fase 8: Compatibilidade dos runners
**Classificação confirmada (2026-10-18):** não foi reproduzida incompatibilidade no executor do site para 04.09 nem 14.08; ambas as suítes de contrato passam. A lacuna era a fronteira de execução não declarada nos cartões: testes próprios rodam no computador local com `node --test`, enquanto o contrato protegido é avaliado no site DevPath. Em 14.03, o starter usa `node:test`, mas a instrução anterior sugeria `vitest run` sem dependência Vitest no lockfile; incompatibilidade de instrução confirmada e corrigida. Em 13.x, `autoTested` significa avaliação automática pelo runtime DevPath, não execução de CLI Vitest: o catálogo publicado classifica 13.01, 13.04, 13.11 e 13.12 como rubrica; 13.02, 13.03, 13.05–13.10 como `javascript` autoavaliado; e 13.13 como `dom` autoavaliado. `autoTested` e `assessmentEnvironment` foram preservados. 22.09 já é explicitamente local e permanece local; seu teste e geração de declarações passam no Node.js 24.19, sem migração de runner.
- [x] Preservar os runners funcionais de 04.09/14.08; os cartões publicados agora declaram teste local versus avaliação no site. Testes focais por ID passaram.
- [x] Em 14.03, explicar `node:test` integrado ao Node e Vitest como dependência separada; starter e cartão não exigem instalação. `node --test`, `node src/main.js` e `node --watch src/main.js` foram comprovados em diretório temporário limpo no Node 24.19; os scripts npm completos foram comprovados no Node 26.7. O processo watch foi encerrado intencionalmente e não é reportado como saída 0.
- [x] Declarar no cartão os ambientes de execução para 04.09, 14.03 e 14.08; explicitar avaliação automática no site versus evidência local nas atividades 13.x. Para 22.09, a interface publicada já exibe checkpoint local e não exigiu mudança.

**Evidência:** saída publicada em `public/course-catalog.json`; provas focais e limites por comando em `.superpowers/sdd/mestre-fases7-10/fase8-report.md`. `npm run build:curriculum`, `npm run assets:version` e `npm run check:curriculum` concluíram; este último saiu 0 em modo warning (avisos gerais e 16 IDs no gate de execução preexistentes, sem classificar avisos como defeitos da Fase 8). A execução focal 22.09 também passou em Node.js 24.19. Não houve instalação, migração de runner, alteração dos IDs ou regeneração Task 9.

---

# GRUPO 4: Correção por lote

### Regras dos lotes após a mudança para uso pessoal

Para as próximas execuções, usar o protocolo simples do início deste plano. As fases 9–10 abaixo mantêm o registro do padrão anterior e não serão reabertas para uma nova rodada editorial. Nas fases 11–19, conferir a atividade que será estudada, corrigir os problemas relevantes e verificar o caminho afetado; não exigir auditoria exaustiva de todos os IDs, rubrica de tamanho fixo ou mutante obrigatório.
## Fase 9: Lote 1 (D.01–02.07, 34 IDs no catálogo atual)

**Base verificada em 18/10/2026:** o histórico de 30 atividades contava D.01–D.05, mas o catálogo hoje contém D.01–D.09. A faixa D.01–02.07 contém 9 + 9 + 9 + 7 = **34 IDs**. A leitura do catálogo publicado confirmou IDs e ordem; nenhum ID, posição ou progresso foi alterado.

**Decisões de escopo:** D.05 reaproveita a correção comprovada na Fase 3; não se criou bug artificial. D.02 é previsão/classificação conceitual, 00.05 é leitura de ambientes e documentação, D.04/07/08 são leitura/análise, e os diagnósticos D são formativos. Não converter esses objetivos em código por regra. 01.02–01.09 já têm executor/verificador Stage 01; 02.01–02.07 já têm casos e fluxo de avaliação Stage 02. A ausência de uma entrada no mapa de assessments genéricos não significa ausência de avaliação.

**Comandos e saídas desta revisão (Node 24.19.1, checkout local; não cobrem Chromium/produção):**

- `node.exe --test --test-force-exit --test-timeout=120000 scripts/test-diagnostic.mjs` → 13/13; respostas, feedback, restauração, rota D e visibilidade das rubricas de leitura/investigação.
- `node.exe scripts/test-stage00-content.mjs` → fonte canônica e contratos presentes. `node.exe scripts/test-stage00-ui.mjs` → fluxo real de 9 atividades, clique/entrada, execução, conclusão e recarga; inclui os negativos de 00.03 e 00.09 descritos abaixo.
- `node.exe --test --test-force-exit --test-timeout=120000 scripts/test-stage01-flow.mjs scripts/test-stage01-checks.mjs` → 52/52; soluções/contratos, rejeições, UI, conclusão e invalidação. `node.exe scripts/test-stage01-content.mjs` → preparação-fonte igual ao artefato publicado, exemplos executáveis e contratos de transferência.
- `node.exe --test --test-force-exit --test-timeout=120000 scripts/test-stage02.mjs` → 25/25; casos visíveis, semântica, edge cases e soluções incorretas representativas. `node.exe --test --test-force-exit --test-timeout=120000 scripts/test-stage02-ui.mjs scripts/test-stage02-progress.mjs scripts/test-stage02-audit.mjs` → 52/52; checks por ID, previsões, execução, conclusão, recarga e acessibilidade declarada.

| ID | Classificação; objetivo → avaliação; preparo/rubrica verificados | Evidência publicada/fonte; comando e resultado |
|---|---|---|
| D.01 | PREDICT, conceitual; prever três logs e confiança → comparação diagnóstica, sem nota; prompt dá saída e ordem; review específico. | `course-src/recipes/D.py`, `public/course-catalog.json#D.01`; D: 12/12. |
| D.02 | PREDICT, conceitual; classificar valor/tipo/typeof incluindo null, 0 e vazio → comparação + review; não requer JavaScript executável. | `course-src/recipes/D.py`, `public/course-catalog.json#D.02`; D: 12/12. |
| D.03 | TRACE, conceitual; prever condição e ramo em duas entradas → comparação dos estados; review explica if/else. | `course-src/recipes/D.py`, `public/course-catalog.json#D.03`; D: 12/12. |
| D.04 | READ, conceitual; separar entrada, retorno e efeito → rubrica visível com 3 critérios de localização, retorno e impressão; sem edição. | `course-src/recipes/D.py`, `public/course-catalog.json#D.04`, `public/diagnostic-ui.js`; D: 13/13. |
| D.05 | INVESTIGATE, conceitual; calcular retorno conhecido e propor investigação de divergência → rubrica visível com 3 critérios de retorno, teste de borda e inspeção do estado; correção F3 reaproveitada. | `course-src/recipes/D.py`, fase 3 do plano, `public/course-catalog.json#D.05`; D: 13/13; nenhum defeito comportamental novo. |
| D.06 | PREDICT, conceitual; prever expressão síncrona e distinguir string/número/typeof → resposta e feedback formativo; explicitamente não certifica domínio. | `course-src/recipes/D.py`, `public/course-catalog.json#D.06`; D: 12/12. |
| D.07 | READ, conceitual; acompanhar retorno/estado e escolher map/filter/find → rubrica visível com 3 critérios de retorno, alias/cópia e finalidade dos métodos. | `course-src/recipes/D.py`, `public/course-catalog.json#D.07`, `public/diagnostic-ui.js`; D: 13/13. |
| D.08 | READ, conceitual; distinguir retorno, propriedade, checagem estática e validação runtime → rubrica visível com 3 critérios de conceitos e limite de cast/any. | `course-src/recipes/D.py`, `public/course-catalog.json#D.08`, `public/diagnostic-ui.js`; D: 13/13. |
| D.09 | INVESTIGATE, conceitual; classificar hipóteses e indicar observação mensurável → rubrica visível com 3 critérios de hipótese, observação e alternativa; não afirma medir sistema real. | `course-src/recipes/D.py`, `public/course-catalog.json#D.09`, `public/diagnostic-ui.js`; D: 13/13. |
| 00.01 | PREDICT executável/leitura; prever três linhas, executar arquivo intacto e explicar ordem/cálculo → runner + rubrica de saída e explicação; 6 min. | `course-src/stage00-preparation.mjs`, `public/course-catalog.json#00.01`; 00 conteúdo + UI. |
| 00.02 | TRACE executável/comparação; comparar duas versões e identificar chamada alterada → runner de cada arquivo + rubrica de diferenças; 7 min. | `course-src/stage00-preparation.mjs`, `public/course-catalog.json#00.02`; 00 conteúdo + UI. |
| 00.03 | PARSONS executável; montar exatamente Início, Olá, Ana, Fim em três linhas e excluir Olá → comparação por saída e rubrica específica; 7 min. | Fonte e artefato têm 3 saídas ordenadas. Negativo com quarta linha dá divergência; fluxo correto integra e conclui. 00 UI. |
| 00.04 | FADED executável; preencher três argumentos e preservar texto/número → runner + rubrica de lacunas e saída; 6 min. | `course-src/stage00-preparation.mjs`, `public/course-catalog.json#00.04`; 00 conteúdo + UI. |
| 00.05 | READ, análise escrita; classificar oito recursos e consultar documentação dos dois ambientes → rubrica visível com 3 critérios de origem, ambientes e referências; não exige código; 8 min. | `course-src/stage00-preparation.mjs`, `public/course-catalog.json#00.05`; 00 conteúdo + UI. |
| 00.06 | DEBUG executável; observar erro intacto, alterar uma falha por vez e validar saída alvo → runner/histórico + rubrica de erro, iteração e resultado; 9 min. | `course-src/stage00-preparation.mjs`, `public/course-catalog.json#00.06`; 00 conteúdo + UI. |
| 00.07 | MAKE executável; criar três chamadas completas do zero → runner + rubrica de chamadas e saída; 7 min. | `course-src/stage00-preparation.mjs`, `public/course-catalog.json#00.07`; 00 conteúdo + UI. |
| 00.08 | READ, análise escrita; descrever árvore HTML e associação label/for/id → rubrica visível com 3 critérios de hierarquia, atributos e associação; não exige código; 8 min. | `course-src/stage00-preparation.mjs`, `public/course-catalog.json#00.08`; 00 conteúdo + UI. |
| 00.09 | TRACE/capstone executável; produzir quatro linhas, depois manter `Itens:` e mudar 3 para 0, mais duas transferências → comparação/transferências + rubrica específica; 15 min. | `expectedByRequirement.zero` publica `[Itens:,0]`. Negativo que apaga a chamada dá divergência; solução com zero conclui e exige as duas respostas. 00 conteúdo + UI. |
| 01.01 | PREDICT; cinco rótulos typeof → Stage 01 checks/runner, previsão e rubrica de valor versus rótulo; 8 min. | `course-src/stage01-preparation.mjs`, `public/stage01-preparation.js`, `scripts/test-stage01-checks.mjs`; 01 flow: sucesso e UI. |
| 01.02 | TRACE; quatro estados de base/total → tabela prevista e checker dedicado, rubrica acompanha só total; 10 min. | Mesmas fontes Stage 01, catálogo `#01.02`; 01 checks/flow. |
| 01.03 | PARSONS; duas ordens válidas, produtores independentes antes do consumidor e excluir E → checker testa permutações válidas/inválidas; rubrica específica; 10 min. | `scripts/test-stage01-checks.mjs` aceita permutações e rejeita duplicata/E; 01 checks/flow. |
| 01.04 | FADED; seis const/let por reatribuição → checker e editor sincronizado; rubrica preserva 0/false; 10 min. | 01 checks/flow também confirma escolhas no starter real. |
| 01.05 | PREDICT; quatro valores especiais → checker/execução e rubrica de tipo; 8 min. | `course-src/stage01-preparation.mjs`, catálogo `#01.05`; 01 checks/flow. |
| 01.06 | FADED; completar uma template literal → checker de expressão, dados alternativos e rubrica; 10 min. | 01 checks/flow inclui teste da única expressão solicitada e caso alternativo. |
| 01.07 | MAKE; declarar e imprimir resumo de horas/minutos → checker rejeita saída fixa, rubrica inclui zero; 12 min. | 01 checks/flow, inclui negativo para saída constante. |
| 01.08 | TRANSFER; completar const/let e dois resumos de configuração → casos do checker e rubrica de reatribuição/derivação; 18 min. | 01 checks/flow executa contratos visíveis; revisão sem defeito de duração. |
| 01.09 | PROJECT; três estados, incluindo vida zero, e duas transferências → checker principal + transfers com casos default/alternativo e negativas; rubrica específica; 16 min. | Fonte e `public/stage01-preparation.js`; 01 flow: prompts exibidos informam 30 e 6 horas; remover as reatribuições é rejeitado; testes 52/52. |
| 02.01 | PREDICT executável; três blocos de operadores com valor/tipo e comparação `==/===/!==` → cases por bloco, execução real e review; 22 min. | `course-src/recipes/02.py`, artefatos Stage 02; C02a: 25/25, C02b: 52/52. |
| 02.02 | PREDICT; matriz `||`/`??` por falsy/nullish → casos e review específicos, previsão seguida de execução; 10 min. | Receitas e cases publicados #02.02; C02a/C02b. |
| 02.03 | PARSONS; montar condições simultâneas de saldo e conta ativa → cinco casos de fronteira e checker que não impõe ordem a independentes; review explica `&&`; 12 min. | Receitas/cases #02.03; C02a/C02b, inclusive saldo igual ao custo. |
| 02.04 | FADED; prever normalização/validade incluindo vazio, zero, NaN/Infinity → checker de casos e review; duas lacunas; 15 min. | Receitas/cases #02.04; C02a/C02b, inclusão da flag vazia e finitude. |
| 02.05 | MODIFY; converter, marcar validade, calcular diagnósticos e apresentar → casos válidos/inválidos, checker e review de sequência; 17 min. | Receitas/cases #02.05; C02a/C02b cobre 0, vazio, NaN e Infinity. |
| 02.06 | DEBUG; observar fallback que apaga zero, corrigir ausência sem validar domínio → casos zero/null/undefined e review `??`; 10 min. | Receitas/cases #02.06; C02a/C02b, fluxo executa starter e exige correção. |
| 02.07 | MAKE; calcular total após desconto para domínio declarado → casos de preço zero/desconto zero, checker e review; não pede domínio de erro; 12 min. | Receitas/cases #02.07; C02a/C02b. |

**Achados e delta:** 00.03 já requeria exatamente três linhas na ordem solicitada e excluía o distrator; 00.09 já exigia e publicava `Itens: 0`. Acrescentei na integração real casos negativos para quatro linhas em 00.03 e para apagar `Itens:` em 00.09; ambos produzem divergência e a tentativa correta segue concluindo. 01.09 tinha dois prompts de transferência sem os valores finais que os casos cobravam. Atualizei somente os prompts para declarar duração 0 → 30 e 2 dias/4 horas → 6 horas; um teste do DOM publicado verifica os valores visíveis, e o verificador continua rejeitando a solução que omite cada reatribuição. A revisão editorial também comprovou que READ/COMPARE sem comportamento precisam de três critérios verificáveis: acrescentei rubricas específicas a D.04/D.07/D.08 e 00.05/00.08; incluí rubricas equivalentes para as investigações conceituais D.05/D.09. O renderer diagnóstico exibe essas listas no cartão, sem transformá-las em nota ou certificado. Os 14 prompts curtos do inventário histórico (D.01–D.05, 01.01–01.09) foram usados como triagem, não como meta de tamanho; não se acrescentou filler. Os históricos de “13 prosa → código” e “30 sem teste” foram descartados como classificações atuais: READ/TRACE conceituais mantêm meios adequados, e os executáveis têm avaliação dedicada, não necessariamente `course-tests.json` ou diretórios de mutantes. Não surgiu outra falha confirmada em texto ou duração dos 34 IDs.

**Limites:** evidência local de catálogo e fixtures; não demonstra execução de navegador real, validade pedagógica em turma ou todos os ambientes de produção. Sem publicação. Nenhum ID, ordem ou registro de progresso mudou.

## Fase 10: Lote 2 (02.08–05.10, 39 atividades na ordem publicada)

A faixa publicada contém 5 IDs de 02, 10 de 03, 14 de 04 e 10 de 05; preservada a sequência do catálogo. Auditoria efetiva: catálogo publicado, assessments/preparations, receitas/starter/soluções/testes e os verificadores dedicados da Etapa 03. A contagem histórica de 30 não corresponde ao conjunto atual.

**Classificação dos achados antecipados:** 03.03 falso; o Parsons permite trocar as condições exclusivas three/five e o verificador da UI aceita a solução válida. 03.04 parcial: os casos/fixtures cobrem as faixas e bordas, mas o starter efetivo tinha apenas uma lacuna enquanto exigia completar três ramos; agora há lacunas D/C/B explícitas e o verificador executa todas as faixas. Os 14 min incluem classificação, tentativa, casos de transferência e conferência; é uma estimativa defensável para este percurso, não uma medição de alunos. 03.05 falso: o caminho de UI é uma matriz seguida de validação/execução; não depende de escrever código em material.md. 04.03 confirmado: havia quatro blocos prometidos e apenas três declarações, sem a chamada D; starter, solução, rubric e suíte agora cobrem A/B/C mais a chamada D. 04.07 confirmado: os casos antigos arredondavam para cima com Math.round e Math.ceil; os novos discriminadores cobrem ambos. 04.08 (frete) e 04.09 (ficha RPG) são exemplos de domínio coerentes, não defeitos. 04.09: integração F8 preservada; não reaberto runner/contrato local.

**Pré-requisitos conferidos na fonte efetiva:** primers publicados para arrays/spread (04.02), objetos (04.05), ESM (04.07), callbacks (05.03), busca/arrays (05.04) e TypeError/guardas (05.07). Os vínculos e saídas são publicados, sem ligação de progresso artificial. A rubrica de READ 04.02 publica três critérios observáveis; não foram criados mutantes artificiais para leitura, previsão ou observação.

| ID | Resultado | Objetivo, avaliação, preparo/rubrica e tempo (catálogo e fonte efetiva) |
|---|---|---|
| 02.08 | OK | Preferência/fallback para três entradas; transferência com tabela de validade/ausência; 16 min. |
| 02.09 | OK | Normaliza dois campos opcionais e produz total; checkpoint curto com verificador; 10 min. |
| 02.10 | OK | Arredondamento, utilitários e sorteio; prevê limites/valores antes da execução de cada bloco; 28 min. |
| 02.11 | OK | Precisão decimal; previsões de valor e tipo em A/B; PREDICT mantido sem mutante artificial; 22 min. |
| 02.12 | OK | Tolerância de sensor derivada da resolução; calcula limiar/diferença e decisão antes da comparação; 20 min. |
| 03.04 | PARCIAL corrigido | Classificador D/C/B/E/A; preparação e rubric com cortes explícitos, UI testa inválidos e limites até 101; starter agora tem as três lacunas; 14 min. |
| 03.05 | FALSO corrigido no diagnóstico | Matriz abaixo/no/acima para quatro regras, incluindo x>0; o verificador próprio valida tabela, solução e limites; 15 min. |
| 03.01 | OK | Trace de loop por passagem e estado final de i; preparo e três critérios na UI; 10 min. |
| 03.02 | OK | Trace sem arrays de cinco passagens; preparo e três critérios na UI; 12 min. |
| 03.03 | FALSO | Parsons FizzBuzz com quatro regras ordenadas por especificidade; exclusivas three/five podem trocar, confirmado pelo verificador; preparo e rubric, 18 min. |
| 03.06 | OK | Debug de loop: rastreia fila e avanço nas duas primeiras passagens; preparo e rubric, 16 min. |
| 03.07 | OK | Contador por intervalo: condição composta e extremos visitados; preparo e rubric, 14 min. |
| 03.08 | OK | Transferência de fila: tabela de ticks, chegadas, atendimentos e estado; quatro evidências, preparo e rubric, 25 min. |
| 03.09 | OK | Projeto de batalha: ordem de ações, parada, derrotados e dano zero; preparo/rubric e cenários coerentes, 55 min. |
| 03.10 | OK | Escolhe ternário ou if para decisões de 2/3 ramos; prevê cinco bordas, preparo, rubric e suíte; 20 min. |
| 04.01 | OK | Prevê valores de return, ausência de return e null; primer publicado; PREDICT sem mutante artificial, 13 min. |
| 04.02 | CORRIGIDO | READ separa retorno, efeito e pureza nos seis snippets; assessment efetivo alinhado à receita, com três critérios observáveis e primer arrays/spread; 14 min. |
| 04.03 | CONFIRMADO corrigido | Parsons de quatro blocos: A cParaF, B formatar, C exibir, D console.log; todas as seis ordens de declarações passam quando D fica ao final, saída 32 °F; rubric e suíte; 14 min. |
| 04.04 | OK | Completa assinaturas com entradas/saídas tipadas; preparo e suíte por função; 15 min. |
| 04.05 | OK | Implementa cálculo e três Intl formatters, declara entradas/saídas; primer de objetos; 22 min. |
| 04.06 | OK | Distingue exibição de retorno e composição em somaDobros; preparo e suíte; 17 min. |
| 04.07 | CONFIRMADO corrigido | API de carrinho por centavos; ESM preparado e unidade/arredondamento expostos; 1×0,1→1 e 333×0,07→356 diferenciam round/ceil; 30 min. |
| 04.08 | OK | Decompõe custos de peso/distância e composição do frete; contrato inclui unidades e zero; caso preexistente custoPeso(2) === 4 mata mutante de tarifa; 27 min. |
| 04.09 | REVISADO F8 | Projeto ataque/defesa/resumo, teste local Node próprio e integração de avaliação do site separados conforme F8; rubric cobre composição e entrada vazia; mutante de domínio e gate local; 55 min. |
| 04.10 | OK, exceção de gate | Renomeia variáveis internas sem mudar API/fórmula/resultado; preparo e rubric de preservação. Starter pode passar behavior por intenção; exceção no gate só com ID, kind, objetivo e rubric compatíveis; mutante continua obrigatório; 24 min. |
| 04.11 | OK | Classifica TypeError/RangeError/retorno nas bordas; primers de guards publicados, rubric e suíte; 18 min. |
| 04.12 | OK | Contextualiza erro de JSON e garante cleanup em sucesso/erro; primers publicados, rubric e suíte; 20 min. |
| 04.13 | OK | Separa null de tipo inválido; primers publicados, rubric e suíte; 16 min. |
| 04.14 | OK | Distingue omissão, 0 e null com defaults/rest; preparo/rubric e suíte; 18 min. |
| 05.01 | OK | Prevê identidade/aliasing e mutação de arrays; PREDICT sem mutante artificial; 12 min. |
| 05.03 | OK | Parsons slug: etapas e arrays intermediários; primer de callbacks publicado e suíte; 13 min. |
| 05.04 | OK | Busca primeiro/último índice e ausência; primer arrays/busca e suíte; 14 min. |
| 05.06 | OK | Diagnostica sort/reverse mutável e entrega cópia explícita + API moderna; primer e suíte; 20 min. |
| 05.07 | OK | Estatísticas, acumuladores e lista vazia; TypeError/guardas preparados e suíte; 25 min. |
| 05.10 | OK | flat remove exatamente um nível, preservando subarray mais profundo; suíte; 16 min. |
| 05.02 | OK | Regex de identificador ancora primeira posição e sequência; preparo e suíte; 13 min. |
| 05.05 | OK | Busca literal com escaping, contrasta pontuação que difere regex; preparo e suíte; 19 min. |
| 05.08 | OK | Parser conserva a mensagem após dois separadores e rejeita nível/campos vazios; caso preexistente de nível vazio mata mutante representativo; 28 min. |
| 05.09 | OK | Projeto de inventário textual: estado, mudança e retorno por operação; preparo e suíte; 45 min. |

**Mutação no escopo executável:** 22 mutantes representativos (03.10, 04.03–04.08, 04.09–04.14, 05.02–05.10). 04.09 entrou como integração sem alterar F8. 04.08 e 05.08 usam defeitos já discriminados pelos casos existentes (custoPeso(2) === 4; nível vazio rejeitado); nenhum teste dessas suítes foi alterado. O mutante inicial de 05.08 que trocava indexOf por lastIndexOf era equivalente para a saída pública e foi descartado em favor de aceitar nível vazio. 02/03 mantêm seus verificadores próprios; 04.01/05.01 não recebem mutantes por serem PREDICT; 04.02 não recebe mutante por ser READ.

**Delta F10:** corrigidos starter de 03.04 e alinhamento da tarefa/parsons de 04.03; novos discriminadores 04.07; rubric efetivo 04.02 alinhado; 22 mutantes inline + referências para gate; exceção estreita do starter-preserving de 04.10 com teste de regressão; teste editorial novo ligado à cadeia npm test por test:master10. Nenhuma edição em 04.09 fora da integração de avaliação. IDs/ordem/progresso preservados. Ver arquivos e RED/GREEN exatos em .superpowers/sdd/mestre-fases7-10/fase10-report.md.

**Limites:** fixtures e execução local reproduzem contratos do catálogo e do site; não medem aprendizagem/tempo com alunos, não cobrem todos os navegadores e não representam publicação/produção. Sem commit, push ou publicação.

# Trabalho restante — escopo reduzido

As listas seguintes preservam os principais IDs e problemas do inventário anterior para consulta. **São pontos a conferir quando a atividade entrar no estudo, não uma lista de defeitos atuais nem obrigação de revisar o lote inteiro antecipadamente.** Itens tratados nas fases 2–8 ou nos lotes 9–10 só recebem nova correção se o problema ainda existir ou tiver voltado.

## Fase 11: Lote 3 — strings, objetos, arrays e algoritmos (05.11–08.05)

**Quando:** ao estudar esta faixa. Preparar somente a atividade atual e as próximas necessárias.
- [x] Conferir, no escopo reduzido, se enunciado, exemplos, material e resposta permitem resolver a atividade sem adivinhar requisitos.
- [x] Corrigir os problemas confirmados e executar a verificação focal adequada ao objetivo.

**Pontos úteis do inventário:** 07.01 e 08.01 podem entregar respostas nas dicas; 07.06 pode usar itens não declarado ou tratar mal chaves como __proto__/toString; 07.03 pode ter entrada/saída e ordenação inconsistentes; 07.10 pode avaliar map em vez de flatMap; 06.08 pode ter review incompatível. Preparar grafemas/Intl.Segmenter em 05.11 se forem exigidos, e esclarecer referências compartilhadas em 06.02 quando necessário.

**Reutilizar:** 06.06 já teve diagnóstico na fase 3 e o timeout de 08.03 foi verificado na fase 7. Referências antigas a 05.05/05.08 pertencem ao lote já trabalhado; não reabrir sem um problema atual.

**Fora do obrigatório:** converter toda prosa em código, testar todas as leituras automaticamente, uniformizar cenários ou preencher uma cota de mutantes.
**Saída:** a atividade estudada tem material suficiente, resposta coerente e avaliação utilizável; a correção e seu resultado estão registrados.

**Registro:** 07.01 mantém starter `string[]` com respostas em branco e revisão por rubrica; a referência fornece as classificações. Em 08.01, a interface real mostrava o código em “Materiais desta atividade” antes da previsão, embora o editor de prática ficasse bloqueado. O renderer agora respeita `assessment.predictionTable.revealSourceAfterPrediction` somente em 08.01 e aguarda os metadados antes de exibir prévia/editor, inclusive quando `answered` já está salvo; após carregar, preserva respostas salvas compatíveis e só libera ambos depois da previsão. No reload com resposta salva e metadados atrasados, prévia/editor permanecem ocultos até a liberação e então reaparecem. Foram preservados PREDICT, checks, tabela e a saída correta do starter, sem torná-lo artificialmente vermelho. 05.11 não exige grafemas; 06.02, 06.08 e 07.03 não mostraram defeito; 07.06 e 08.03 reutilizam verificações anteriores. A regressão de primeira pintura passou em 14/14 verificações do controller; no Chromium real, o fluxo antes/depois e o reload com metadata atrasada passaram. O teste focal público de 08.01 também passou após geração.

## Fase 12: Lote 4 — funções, orientação a objetos e DOM

**Faixa preservada:** 08.06–11.14, exceto 11.08, 11.10 e 11.13, que ficam na fase 13.
- [x] Conferir os exercícios usados no escopo reduzido e corrigir arquivos ausentes, contratos escondidos ou exemplos que ensinem errado.
- [x] Nas atividades DOM alteradas, testar a interface no navegador usado pelo proprietário, além do teste focal quando couber.

**Pontos úteis do inventário:** 08.06 pode ordenar quando deveria preservar a ordem; 09.04/10.02 podem ter exemplos de retorno/acesso incorretos; 10.06 pode pedir modificação sem fornecer código; 10.07, 11.03 e 11.06 podem cobrar contratos não apresentados. Em 11.12, alinhar nomes de funções e verificar que texto hostil é exibido como texto quando esse for o contrato, usando DOM/parser apropriado para conferir o resultado. Explicar AbortController/FormData antes de exigir seu uso.

**Reutilizar:** resultados anteriores de 08.07, 11.04 e 11.05; conferir somente a integração relevante se o estado mudou.
**Redução:** revisar duração ou linguagem apenas se estiverem atrapalhando a prática; sem campanha geral de segurança, estética ou compatibilidade entre navegadores.
**Saída:** o exercício funciona no ambiente informado, a solução atende ao enunciado e o erro relevante é identificado pela avaliação.

**Registro:** 10.06 agora explicita que as funções recebem estado e devolvem uma cópia sem mutar a entrada. Em 11.06, dados/IDs e a avaliação foram conferidos; em 11.12, o contrato de texto/comentário foi alinhado a `childNodes`, com sete casos publicados preservando IDs e offsets. Os testes do navegador real confirmaram 11.06 (referência 3/3; starter rejeitado) e 11.12 (markup hostil, quebra de linha e vazio).

## Fase 13: Lote 5A — Kanban e programação assíncrona

**Faixa preservada:** Kanban 11.08, 11.10, 11.13 e etapa 12.
- [x] No Kanban utilizado, conferir montagem, carregamento de app.js, dados de estado e salvamento/recarga.
- [x] Nos exercícios assíncronos usados, conferir ordem de conclusão, respostas HTTP e tratamento de erros com os casos relevantes.

**Pontos úteis do inventário:** 11.08 pode esconder montarKanban(document, storage).getState(); 11.13 pode usar done inexistente ou regras contraditórias de registro parcial; 12.03 pode pedir objeto e avaliar array; 12.06 pode aceitar engolir erros; 12.08 pode verificar headers inexistentes no fake. Em 11.10, esclarecer o papel de boot e do HTML fornecido. Preparar try/catch em 12.02 se necessário. Texto herdado de outro projeto só precisa mudar quando confundir o contrato.

**Reutilizar:** a saída de 12.04 já foi tratada na fase 3. O ID 12.05 sozinho não comprova defeito; investigar apenas se houver dificuldade concreta.
**Redução:** sem ampliar o Kanban em produto completo, nem criar infraestrutura de servidor/rede se a tarefa é resolvida pelo ambiente existente.
**Saída:** o fluxo praticado mantém estado e responde corretamente aos cenários de sucesso e falha que o enunciado exige.

**Registro:** 11.08 passou no navegador real com salvamento, movimentação e recarga; 11.10 agora recebe o HTML como contexto somente leitura e restaura a tela após recarga; 11.13 manteve a migração V1 e sinaliza dados parciais. 12.03 conserva o contrato de array/ordem e inicia chamadas em paralelo; 12.08 aceita headers opcionais na fixture e cobre retry, resposta antiga, estado de loading, timeout e cancelamento pelas opções `onState`, `timeoutMs` e `signal`, mantendo a chamada antiga de um argumento. A frase de preparação foi alinhada à limpeza após `Promise.race`. Focal público de 11.10/12.08 passou; 12.04 foi reutilizado, 12.02/12.05/12.06 não apresentaram defeito, e 12.15–12.21 não foram auditados.

## Fase 14: Lote 5B — testes e depuração (13.01–13.13)

- [x] Nas atividades estudadas, confirmar que os arquivos importados existem e que o teste/critério verifica o comportamento pedido.
- [x] Corrigir dica ou explicação somente quando ela impedir entender a missão, entregar a resposta ou contradizer a avaliação.

**Pontos úteis do inventário:** arquivos de apoio em 13.03/13.09/13.13; armadilhas descritas de forma genérica. Os IDs 13.05, 13.07, 13.08, 13.10 e 13.12 foram listados sem defeito específico; isso não exige criar trabalho nem presumir falha.

**Reutilizar:** a fase 8 já esclareceu avaliação no site versus testes locais e as modalidades reais de 13.x; a fase 2 já tratou geração de dicas. Não migrar runners ou mudar autoTested para uniformizar a etapa.
**Saída:** o exercício de teste/depuração permite executar ou analisar exatamente o que pede, com critério compreensível.

**Registro:** em 13.04, foi fornecido o código de depuração ausente e alinhado o prompt condicional à tarefa. A cobertura existente de 13.x passou em 9/9, com roteamento 1/1; `test-task-8a-evidence.mjs` passou 1/1 após adaptar somente os mutantes 11.05 ao lifecycle atual. IDs sem defeito específico não foram tratados como falhas presumidas.

## Fase 15: Lote 6 — Node, ferramentas e início do TypeScript

**Faixa preservada:** 13.14–16.05 e 16.09; 16.06/16.07 ficam na fase 16.
- [x] Conferir instalação/comandos, arquivos e contratos no escopo estudado.
- [x] Executar as referências e verificações de tipos disponíveis, registrando o limite do proxy local.

**Pontos úteis do inventário:** em 14.06, tornar explícitos NODE_ENV/TOKEN e mensagens exigidas sem expor segredos; em 14.08/14.11, conferir o contrato de JSON inválido; em 14.12, fornecer build real ou saída adequada ao objetivo; em 15.08, conferir paginacao.ts. Preparar import.meta.url, import() dinâmico, cause, Object.hasOwn e Error.isError apenas quando forem usados. Alinhar rubrica visível e avaliação se cobrarem coisas diferentes.

**Reutilizar:** correções e provas anteriores de 13.14, 14.03, 14.13, 16.03 e mutantes. 15.07 já declara RangeError para lista vazia; não contar isso como contrato oculto.
**Redução:** não montar pipelines de publicação, instalar Vitest sem necessidade ou converter tarefas comparativas em projetos apenas para padronizar.
**Saída:** comandos e exemplos usados funcionam, arquivos necessários estão presentes e as avaliações aceitam a solução correta.

**Registro:** 14.06 foi resolvido; 14.08 agora valida JSON inválido sem escrever nem renomear arquivos, coberto também por contraprova publicada; 14.11 é comparação de dependências e não exige contrato de JSON inválido. Em 14.12, a divergência entre as cinco fontes entregues e o bundle foi corrigida: `src/` corresponde a `sourcesContent`, HTML/bundles/maps apontam entre si e os 12 arquivos do manifesto estão presentes, preservando os nomes genéricos. O teste de referências 15.07/15.08 passou 2/2; o checker local TypeScript 6.0.3 é proxy estático limitado e não equivale integralmente ao alvo didático TypeScript 7.0.

## Fase 16: Lote 7 — TypeScript intermediário e avançado

**Faixa preservada:** 16.06, 16.07 e 16.10–19.07; exclui 16.09.
- [x] Conferir starters, referências e contratos de tipo no escopo estudado e reaproveitar os resultados anteriores indicados.
- [x] Corrigir instruções ou contratos confirmados que impediam o percurso ou aceitavam tipos incorretos.

**Pontos úteis do inventário:** material/solução de 16.06; transição de handle em 18.05; declare em 19.05 quando a tarefa exigir execução; alternativas de review em 16.07/17.09/18.05. Preparar #campo, noUncheckedIndexedAccess e exactOptionalPropertyTypes antes de exigir seu uso.

**Reutilizar:** resultados de 16.10, 18.07, 18.10 e 19.06 nas fases anteriores. A ausência de .test.js não é falha quando há avaliação de tipos, resposta ou análise adequada.
**Redução:** sem testar todas as combinações de flags e versões do TypeScript; usar a configuração declarada, contrastando outra somente quando isso for o próprio conteúdo.
**Saída:** o percurso de tipos estudado compila ou produz os diagnósticos esperados, com contrato explicado.

**Registro:** as referências com avaliação de tipos cobertas no lote foram verificadas com o checker local 6.0.3: 19 referências e 17 mutantes de contrato rejeitados (20/20 verificações reportadas). Os quatro IDs 16.10, 18.07, 18.10 e 19.06 reutilizam evidência anterior; atividades READ ou avaliadas por rubrica/resposta foram classificadas sem exigir checker de tipos. Limite: o proxy 6.0.3 não demonstra equivalência completa com o alvo didático TypeScript 7.0.

**Limites comuns do lote 11–16:** `npm run build:curriculum`, `npm run check:curriculum` e o versionamento/check de assets terminaram com código 0; o catálogo gerado contém 310 IDs. O gate de execução reportou 129 avaliações executadas, 133 puladas, zero referências falhando, 14 starters que não falham no gate, incluindo previsões/rastreios com aceitação intencional; os demais avisos não foram classificados nesta rodada, e quatro mutantes sobrevivem em três atividades. Os 15 IDs sinalizados incluem 08.01 PREDICT, cujo starter passa como esperado. Os testes de interface desta rodada usaram Chromium real via Playwright; o navegador habitual do proprietário não foi identificado nem homologado, e não há evidência de cobertura entre navegadores. O `npm test` completo terminou com código 1 após 269,4 s, em `test:executors` (409 testes: 406 passaram, dois falharam e um foi ignorado); as falhas observadas em 08.01 e na evidência Task 8 foram corrigidas e revalidadas focalmente, mas a cadeia inteira não foi repetida e as etapas posteriores não rodaram. Não há alegação de suíte global verde. A fonte 12.15–12.21 não foi auditada; não foram adicionados testes genéricos para atividades READ. Sem commit, push ou publicação.

## Fase 17: Lote 8A — arquitetura e JavaScript avançado (19.08–20.10)

**Situação:** reduzida e adiada até o estudo chegar a estes assuntos.
- [ ] Escolher os exercícios que serão feitos e conferir entradas, saídas, assinaturas e arquivos de entrega.
- [ ] Verificar a referência e o comportamento que a tarefa pede; corrigir somente falhas ainda atuais.

**Pontos úteis do inventário:** contratos de 20.01, 20.04–20.07, 20.09 e 20.10; pipeline 20.08. Esses casos já tiveram trabalho nas fases 5–6: reaproveitar a evidência e verificar apenas o necessário para o exercício selecionado.

**Fonte:** geradores task-9 da etapa 20; seguir o mapa de fontes e a regeneração protegida em cópia temporária.
**Redução:** sem uma revisão antecipada de todo o lote, benchmark profissional ou infraestrutura adicional para tarefas que cabem no ambiente atual.
**Saída:** a atividade avançada escolhida pode ser entendida, executada e conferida.

## Fase 18: Lote 8B — desempenho, Workers e integração JS/TS (21.01–22.07)

**Situação:** reduzida e adiada até estes recursos entrarem na prática.
- [ ] Conferir os contratos dos exercícios escolhidos e executar no ambiente real que o recurso exige.
- [ ] Se estudar Workers, exercitar um Worker real e os cenários pedidos de resposta, erro e encerramento; se estudar CLI, conferir os comandos no Windows utilizado.

**Pontos úteis do inventário:** montagem/desmontagem de 21.02; ciclo de vida e pendências de 21.05; compatibilidade de process.argv em 22.04/22.05; material de transferência de 22.07. Em 21.04, o contrato é LRU, sem acrescentar TTL por engano. Em tarefas de desempenho, comparar a mesma carga em condições declaradas, sem construir uma suíte de benchmark além do objetivo.

**Reutilizar:** correções de 21.06–21.09 nas fases 4–6. Quando uma tarefa exigir resposta válida para entradas variadas, acrescentar casos que impeçam resposta decorada se a suíte atual for insuficiente; não impor testes aleatórios a todo exercício.
**Fonte:** geradores task-9 das etapas 21–22 e regra de cópia temporária.
**Redução:** sem homologação em vários navegadores, matriz extensa de desempenho ou distribuição pública de bibliotecas.
**Saída:** o recurso estudado funciona no ambiente declarado, e sua avaliação consegue conferir o comportamento exigido.

## Fase 19: Lote 9 — pacotes, arquitetura e projeto final (22.08–23.11)

**Situação:** reduzida e adiada. Fazer o projeto final somente quando ele for útil ao objetivo pessoal de aprendizagem.
- [ ] Nos exercícios escolhidos, alinhar o que o enunciado pede com implementação, testes e arquivos de entrega.
- [ ] Para um projeto final escolhido, escrever um briefing curto: problema a resolver, funcionalidades necessárias, como executar e como conferir que funciona.

**Pontos úteis do inventário:** consumo de pacote/declarações em 22.08–22.10; contrato versus implementação em 23.01/23.03; passos de refatoração de 23.04; APIs de 23.02/23.09. Em 23.08, delimitar um projeto pessoal realizável, com persistência somente se necessária. Não exigir um projeto de 30–50 horas, arquitetura em camadas, diagrama ou documentação profissional por padrão.

Se o objetivo escolhido for aprender empacotamento, manter a prova pertinente (por exemplo npm pack, consumidor separado e checagem das declarações); dispensar publicação real, conta externa e processo de release. Se o objetivo for refatorar, preservar comportamento e conferir os passos. IDs sem descrição de defeito (23.05–23.07/23.11) só geram investigação se surgir problema.

**Reutilizar:** resultados anteriores sobre 22.08, 23.02, 23.10, contratos e rubricas. Não reordenar atividades para ajustar a narrativa.
**Fonte:** geradores task-9 das etapas 22–23 e regra de cópia temporária.
**Saída:** o exercício ou projeto escolhido cumpre seus requisitos pessoais e pode ser executado e conferido, sem requisitos de lançamento público.

## Fase 20: Fechamento leve do trabalho realizado

**Quando:** após concluir os lotes escolhidos para a rodada de estudo. Etapas avançadas adiadas permanecem adiadas; este fechamento não declara que foram executadas.
- [ ] Confirmar que as correções da rodada têm uma verificação pertinente e que nenhum defeito confirmado impede o exercício usado ou põe seu progresso em risco.
- [ ] Executar os testes existentes afetados e npm run check:curriculum. Rodar npm test no fechamento da rodada ampla, com limite de tempo e registro de eventuais falhas/travamentos; não repeti-lo a cada edição de texto. Uma falha confirmada no caminho usado precisa ser corrigida; outras falhas conhecidas ficam identificadas e adiadas, sem alegar suíte global verde.
- [ ] Abrir o site no navegador habitual: estudar uma atividade alterada, fazer uma tentativa incorreta e uma válida quando houver avaliação, executar e conferir o retorno; salvar um rascunho/progresso e recarregar para confirmar a restauração. Exercitar ajuda ou modos de estudo que tenham sido alterados ou sejam usados nesse percurso.
- [ ] Se a rodada mudou DOM, Worker, runner ou persistência, conferir o comportamento afetado no navegador real; testes sintéticos não substituem essa observação. Não exigir repetir todos os fluxos e navegadores.
- [ ] Registrar em poucas linhas: atividades corrigidas, comandos/resultados, percurso manual conferido e pendências realmente adiadas.

**Dispensado:** exigir fases 21–23 concluídas, recontar todos os indicadores editoriais, atingir zero avisos, cobertura total, revisão de todo o catálogo ou homologação de lançamento. Nenhum gate será desligado para obter aprovação.
**Saída:** o percurso pessoal trabalhado permite estudar, praticar e retomar o progresso; testes pertinentes passam e os limites são explícitos. O plano pode ser retomado na próxima etapa sem reabrir o que continua correto.

## Fase 21: Dispensada como fase independente — critérios editoriais

**Estado de escopo, não de execução:** removida da fila. Manter apenas clareza suficiente: o que fazer, qual material usar e como reconhecer o resultado. Reescrever somente quando houver confusão ou erro no conteúdo. Não há nova auditoria editorial de todo o curso, formato obrigatório de quatro blocos ou tamanho mínimo de texto.

## Fase 22: Dispensada como fase independente — revisão editorial por lote

**Estado de escopo, não de execução:** removida da fila. Melhorias necessárias de linguagem/material acompanham a correção da atividade nas fases 11–19. Não há segunda passagem editorial, obrigação de adicionar histórias RPG ou de uniformizar exemplos já coerentes.

## Fase 23: Campanha formal de acessibilidade dispensada

**Estado de escopo, não de execução:** removida da fila obrigatória para o uso pessoal descrito. Preservar navegação por teclado, foco, labels e anúncios existentes. Corrigir qualquer controle inacessível que atrapalhe o proprietário, sem abrir uma campanha completa de homologação.

**Condição de reativação:** se o proprietário depender de leitor de tela ou navegação exclusiva por teclado, validar o percurso usado com essas ferramentas. Não alegar acessibilidade validada apenas pela existência de ARIA ou por um teste de DOM.

## Registro desta revisão — 18/10/2026

Replanejamento documental aprovado na conversa para uso privado como auxiliar de estudo: 10 fases reduzidas (11–20) e 3 retiradas da fila autônoma (21–23, com acessibilidade condicional). Mantidos os registros das fases 1–10, IDs, escopos de referência e mapa de fontes; substituídas as regras globais e o trabalho futuro pelo critério de utilidade pessoal. Nenhuma alteração funcional, execução das fases futuras, remoção de teste, commit ou publicação faz parte desta revisão.
