(function (global) {
    "use strict";
    // Injected dependencies: activityById, cancelCourseRun, courseRunner, courseSaveTimer, curriculumActivities, esc, exerciseProgressKey, isExerciseDone, limits, progress, render, requiredActivities, reviewSchedule, saveProgress, toast, view.
    function create(ctx) {
        function loadCourseDraft(item) {
            const raw = ctx.progress.exerciseDrafts?.[ctx.exerciseProgressKey(item)];
            if (typeof raw === "string" && raw.startsWith("__course_files__:")) {
                try {
                    return JSON.parse(raw.slice("__course_files__:".length));
                }
                catch { /* Use the published starter files. */ }
            }
            return Object.fromEntries(item.starterFiles.map((file, index) => [file.path, index === 0 && typeof raw === "string" ? raw : file.content]));
        }
        function renderResources(resources = []) {
            return resources.length ? `
        <ul
          class="course-resource-list">${resources.map((resource) => {
                const safe = ctx.esc(resource);
                const linked = safe.replace(/https:\/\/[^\s<>]+/g, (url) => {
                    const clean = url.replace(/[),.;]+$/, "");
                    const tail = url.slice(clean.length);
                    return `<a
        href="${clean}" target="_blank" rel="noopener noreferrer">${clean}</a>${tail}`;
                });
                return `
        <li>${linked}
        </li>`;
            }).join("")}
        </ul>` : `
        <p>Sem recurso externo obrigatório nesta atividade.
        </p>`;
        }
        function renderStageBridge(item) {
            if (!item.stageBridge)
                return "";
            const paragraphs = item.stageBridge.split(/\n\s*\n/).filter(Boolean).map((paragraph) => {
                const safe = ctx.esc(paragraph.trim()).replace(/`([^`]+)`/g, "<code>$1</code>");
                return `
        <p>${safe}
        </p>`;
            }).join("");
            return `
        <section
          class="course-stage-bridge">
          <div
            class="course-section-kicker">PONTE CONCEITUAL DA ETAPA ${ctx.esc(item.stage)}
          </div>
          <h2>${ctx.esc(item.stageBridgeTitle)}
          </h2>
          <p
            class="course-bridge-intro">Leia depois da sua primeira previsão e antes de praticar. Use os exemplos para conectar a ideia ao exercício.
          </p>
          <div
            class="course-bridge-copy">${paragraphs}
          </div>
        </section>`;
        }
        // A single file is saved verbatim; several files are saved as one JSON string, so reserve room for escaping.
        function editorCharLimit(fileCount) {
            return fileCount <= 1 ? ctx.limits.draftChars : Math.floor((ctx.limits.draftChars * 0.8) / fileCount);
        }
        // An attempt that crashed or timed out is recorded for debugging, but it does not prove an implementation works.
        const IMPLEMENTATION_KINDS = new Set(["MAKE", "FADED", "DEBUG", "MODIFY", "PROJECT"]);
        function evidenceCounts(item, evidence) {
            // Activities with built-in tests are completed only by a run where every test passed.
            if (item?.autoTested)
                return evidence.status === "executed" && evidence.testsPassed === true;
            if (evidence.status === "written")
                return true;
            if (evidence.status !== "executed")
                return false;
            return !IMPLEMENTATION_KINDS.has(item?.kind) || evidence.runResult === "result";
        }
        function reviewedRubric(item, evidence) {
            if (item?.rubricFingerprint && evidence?.rubricFingerprint !== item.rubricFingerprint)
                return [];
            return Array.isArray(evidence?.rubric) ? evidence.rubric : [];
        }
        function hasCurrentRubric(item, evidence) {
            if (!item?.rubricFingerprint)
                return true;
            if (evidence?.rubricFingerprint !== item.rubricFingerprint)
                return false;
            const checked = reviewedRubric(item, evidence);
            return (item.rubric || []).every((_, index) => checked.includes(index));
        }
        function currentCompletion(item, id, evidence) {
            return ctx.isExerciseDone(id) && hasCurrentRubric(item, evidence);
        }
        let courseTestsPromise = null;
        let courseAssessmentsPromise = null;
        let runGeneration = 0;
        let activeRun = null;
        const predictionEditorOpen = new Set();
        function loadCourseTests() {
            courseTestsPromise ||= fetch("/course-tests.json", { cache: "no-cache" }).then((response) => {
                if (!response.ok)
                    throw new Error("Não foi possível carregar os testes desta atividade.");
                return response.json();
            }).catch((error) => { courseTestsPromise = null; throw error; });
            return courseTestsPromise;
        }
        function loadCourseAssessments() {
            courseAssessmentsPromise ||= fetch("/course-assessments.json", { cache: "no-cache" }).then((response) => {
                if (!response.ok)
                    throw new Error("Não foi possível carregar as avaliações desta atividade.");
                return response.json();
            }).catch((error) => { courseAssessmentsPromise = null; throw error; });
            return courseAssessmentsPromise;
        }
        let courseAssessmentsCache = null;
        let courseAssessmentsRequested = false;
        // The entry file and the checks come from course-assessments.json, which loads after the first render.
        function publishedAssessment(id) {
            if (!courseAssessmentsCache && !courseAssessmentsRequested) {
                courseAssessmentsRequested = true;
                loadCourseAssessments().then((assessments) => { courseAssessmentsCache = assessments || {}; ctx.render?.(); }).catch(() => { courseAssessmentsRequested = false; });
            }
            return courseAssessmentsCache?.[id];
        }
        const hintLevels = new Map();
        const arr = (value) => Array.isArray(value) ? value : [];
        function savedFontSize() {
            try {
                return Math.max(11, Math.min(22, Number(localStorage.getItem("devpath.codeFontSize")) || 14));
            }
            catch {
                return 14;
            }
        }
        function completionRequirements(item, state) {
            return [
                [state.answered, "Registrar sua primeira resposta"],
                [state.evidenceReady, item.autoTested ? "Executar e passar em todos os testes da atividade" : IMPLEMENTATION_KINDS.has(item.kind) ? "Executar sem erro nem tempo limite (ou registrar análise escrita se o executor não suporta o ambiente)" : "Executar ou registrar uma tentativa"],
                ...((item.rubric || []).length ? [[hasCurrentRubric(item, state.evidence), "Conferir cada critério da autoavaliação"]] : []),
                [state.reflection.trim().length >= 16, "Escrever sua explicação (mínimo de 16 caracteres)"]
            ];
        }
        function renderRequirements(item, state) {
            return completionRequirements(item, state).map(([done, label]) => `
        <li data-guided-requirement class="${done ? "done" : ""}">${done ? "✓" : "○"} ${ctx.esc(label)}</li>`).join("");
        }
        function renderCurriculumLesson(item) {
            const id = item.id;
            const prep = item.preparation || {};
            const progressKey = ctx.exerciseProgressKey(item);
            const answered = ctx.progress.warmupCompleted?.[progressKey] === true || ctx.isExerciseDone(id);
            const complete = currentCompletion(item, id, ctx.progress.exerciseEvidence?.[progressKey] || {});
            const historicCompletionNeedsReview = ctx.isExerciseDone(id) && !hasCurrentRubric(item, ctx.progress.exerciseEvidence?.[progressKey] || {});
            const prediction = ctx.progress.exercisePredictions?.[progressKey] || "";
            const reflection = ctx.progress.exerciseReflections?.[progressKey] || "";
            const evidence = ctx.progress.exerciseEvidence?.[progressKey] || {};
            const evidenceReady = evidenceCounts(item, evidence);
            const drafts = loadCourseDraft(item);
            const required = ctx.requiredActivities();
            const itemPosition = ctx.curriculumActivities.indexOf(item);
            const previous = [...required].reverse().find((candidate) => ctx.curriculumActivities.indexOf(candidate) < itemPosition);
            const next = required.find((candidate) => ctx.curriculumActivities.indexOf(candidate) > itemPosition);
            const stageCore = required.filter((candidate) => candidate.stage === item.stage);
            const stageOrder = stageCore.indexOf(item) + 1;
            const language = Number(item.stage) >= 15 && Number(item.stage) <= 19 ? "TYPESCRIPT" : "JAVASCRIPT";
            const code = (text) => ctx.esc(text).replace(/`([^`]+)`/g, "<code>$1</code>");
            const hints = arr(item.hints).length ? item.hints : arr(prep.hints);
            const level = Math.min(hintLevels.get(progressKey) || 0, hints.length);
            const fontSize = savedFontSize();
            const journey = [
                ["learn", "Aprender", "Entenda a ideia"], ["challenge", "Desafio", "Conheça a tarefa"], ["predict", "Prever", "Pense antes de rodar"], ["practice", "Praticar", "Confira no código"], ["explain", "Explicar", "Conte o raciocínio"]
            ];
            const sectionTitle = (number, title) => `
        <div class="course-section-kicker">PASSO ${number} · SEU ROTEIRO</div>
        <h2>${title}</h2>`;
            const starterPreview = item.starterFiles.map((file) => `
        <div class="course-file-preview"><span>${ctx.esc(file.path)}</span><pre><code>${ctx.esc(file.content)}</code></pre></div>`).join("");
            const readOnlyPreview = (item.readOnlyFiles || []).map((file) => `
        <details class="course-file-preview course-readonly-file"><summary>${ctx.esc(file.label)} · <code>${ctx.esc(file.path)}</code></summary><pre><code>${ctx.esc(file.content)}</code></pre></details>`).join("");
            const editors = item.starterFiles.map((file, index) => `
        <label class="course-editor-label" for="course-file-${ctx.esc(id)}-${index}"><span>${ctx.esc(file.path)}</span><textarea
          id="course-file-${ctx.esc(id)}-${index}"
          class="course-editor"
          style="font-size:${fontSize}px"
          data-course-editor="${ctx.esc(id)}"
          data-course-file="${ctx.esc(file.path)}"
          maxlength="${editorCharLimit(item.starterFiles.length)}"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off">${ctx.esc(drafts[file.path] ?? file.content)}</textarea>
        </label>`).join("");
            const codeFile = item.starterFiles.find((file) => /\.(?:m?js|jsx|ts|tsx)$/i.test(file.path));
            const rubricChecks = (item.rubric || []).map((criterion, index) => `
        <label class="course-self-check"><input
          type="checkbox"
          data-course-rubric="${ctx.esc(id)}" value="${index}" ${reviewedRubric(item, evidence).includes(index) ? "checked" : ""}><span>${ctx.esc(criterion)}</span>
        </label>`).join("");
            const published = publishedAssessment(id);
            const entryFile = published?.entryPath || codeFile?.path || "";
            const entryLabel = entryFile ? `<code>${ctx.esc(entryFile)}</code>` : "o arquivo de entrada deste exercício";
            const predictionDemo = published?.environment === "rubric" && published?.predictionTable?.outputFormat === "lines";
            const typesOnly = Array.isArray(published?.checks) && published.checks.includes("types") && !published.checks.some((check) => check === "behavior" || check === "mutation");
            const autoTestedLead = !published ? "os testes automáticos conferem o trabalho e mostram quais falharam e por quê"
                : published.environment === "dom" ? `os testes carregam ${entryLabel} no DOM e conferem a página que ela produz`
                : typesOnly ? `o verificador de TypeScript confere ${entryLabel} e lista os erros de tipo encontrados`
                : `eles importam o que você exporta em ${entryLabel}, conferem os exemplos e os casos de borda publicados e mostram quais falharam e por quê`;
            const writtenOnlyText = published?.environment === "rubric"
                ? `<p>${ctx.esc(published.evidenceNote || "Esta avaliação usa critérios declarados e revisão humana.")} ${predictionDemo ? "Execute a demonstração isolada para observar os logs e comparar com sua previsão; isso não gera aprovação automática." : "Registre sua análise e confira os critérios; executar o artefato apoia o estudo, mas não gera nota automática."}</p>`
                : item.assessmentEnvironment === "local"
                ? "<p>A verificação deste exercício é feita por um checkpoint local declarado, fora do navegador. Registre sua análise escrita e confira os critérios com a rubrica.</p>"
                : item.assessmentEnvironment === "typescript"
                    ? `<p>O verificador de TypeScript roda neste site e lista os diagnósticos de ${entryLabel}. Nesta investigação, os erros de tipo fazem parte do material de estudo e não reprovam a atividade: registre sua análise escrita e confira os critérios com a rubrica.</p>`
                : item.assessmentEnvironment === "rubric"
                    ? "<p>Este exercício não tem testes automáticos no navegador: a verificação é feita pela rubrica. Registre sua análise escrita e confira os critérios com a rubrica.</p>"
                    : "<p>O executor roda o JavaScript deste exercício e mostra a saída e os erros; o resultado serve para investigar seu código. Imports externos não são permitidos. Não há testes automáticos publicados para esta atividade, então os critérios continuam sendo conferidos por você, com a rubrica.</p>";
            const runPanel = codeFile
                ? `
        <div class="course-runner">
          <div class="course-runner-heading"><strong>${predictionDemo ? "Observe a execução" : item.autoTested ? "Execute os testes" : "Execute uma tentativa"}</strong><span>${predictionDemo ? "Demonstração isolada · uma task de timer; sem avaliação automática" : item.assessmentEnvironment === "node-simulated" ? "Node simulado · subset virtual, sem npm ou APIs do host" : item.assessmentEnvironment === "local" ? "Checkpoint local declarado · projeto temporário isolado" : "Execução local isolada · sem rede ou APIs do Node.js"}</span></div>
          ${item.autoTested ? `<p>Esta atividade é corrigida por testes automáticos: ${autoTestedLead}. A atividade só pode ser concluída quando ${typesOnly ? "a verificação passar" : "todos os testes passarem"}; a rubrica e a explicação continuam sendo suas.</p>` : writtenOnlyText}
          <button type="button" class="button-secondary" data-course-run="${ctx.esc(id)}">${item.autoTested ? "Executar testes" : predictionDemo ? "Executar demonstração" : item.assessmentEnvironment === "typescript" ? "Verificar tipos" : "Executar JavaScript"}</button>
          ${item.autoTested ? "" : `<button type="button" class="button-secondary" data-course-submit-writing="${ctx.esc(id)}">Registrar análise escrita</button>`}
          <div class="course-run-output" data-course-output="${ctx.esc(id)}" role="status" aria-live="polite">${evidence.output ? ctx.esc(evidence.output) : "A saída aparecerá aqui."}</div>
        </div>`
                : `
        <div class="course-runner">
          <div class="course-runner-heading"><strong>Registre uma análise escrita</strong><span>Modo guiado · sem IA</span></div>
          <p>Edite o arquivo acima com sua análise, diagnóstico ou solução. Depois registre a tentativa para anexar a evidência à revisão.</p>
          <button type="button" class="button-secondary" data-course-submit-writing="${ctx.esc(id)}">Registrar análise escrita</button>
          <div class="course-run-output" data-course-output="${ctx.esc(id)}" role="status" aria-live="polite">${evidence.status === "written" ? "Análise registrada." : "Escreva pelo menos 40 caracteres no material antes de registrar."}</div>
        </div>`;
            const rubricPanel = rubricChecks ? `
        <fieldset class="course-rubric-checks"><legend>Autoavaliação guiada</legend>
          <p>Marque apenas os critérios que você conferiu no próprio trabalho. Isso registra sua reflexão; não é uma nota automática.</p>${rubricChecks}
        </fieldset>` : "";
            const exampleDetails = item.examples?.length ? `
        <details class="s00-glossary"><summary>Conferir exemplos públicos depois da sua tentativa</summary>
          <ul>${item.examples.map((example) => `
        <li><strong>${ctx.esc(example.given || "Exemplo")}</strong><span>${ctx.esc(example.expected || "")}</span></li>`).join("")}</ul>
        </details>` : "";
            const constraints = arr(item.constraints).length ? `
        <details class="s00-glossary" open><summary>Restrições desta atividade</summary>
          <ul>${item.constraints.map((line) => `<li>${ctx.esc(line)}</li>`).join("")}</ul>
        </details>` : "";
            const edgeCases = arr(item.edgeCases).length ? `
        <details class="s00-glossary" open><summary>Casos de borda que fazem parte do contrato</summary>
          <p>Leia antes de implementar: estes comportamentos também serão conferidos.</p>
          <ul>${item.edgeCases.map((line) => `<li>${ctx.esc(line)}</li>`).join("")}</ul>
        </details>` : "";
            const primersPanel = arr(item.primers).length ? `
        <details class="s00-glossary" open><summary>Antes de começar: recursos usados antes da aula completa</summary>
          <p>Esta atividade usa algo que o curso aprofunda mais adiante. Isto é o suficiente para resolvê-la.</p>
          <ul>${item.primers.map((line) => `<li>${code(line)}</li>`).join("")}</ul>
        </details>` : "";
            const vocabulary = arr(prep.vocabulary).length ? `
        <details class="s00-glossary"><summary>Palavras que aparecem nesta atividade</summary>
          <ul>${prep.vocabulary.map((entry) => `<li>${code(entry)}</li>`).join("")}</ul>
        </details>` : "";
            const concepts = arr(prep.conceptSteps).map((step, index) => `
        <li><span aria-hidden="true">${index + 1}</span><p>${code(step)}</p></li>`).join("");
            const walkthrough = arr(prep.workedExample?.steps).map((step) => `<li>${code(step)}</li>`).join("");
            const notes = arr(prep.notes).map((note) => `<p>${code(note)}</p>`).join("");
            const docs = arr(prep.docs).map((doc) => `
        <li><a href="${ctx.esc(doc.url)}" target="_blank" rel="noopener noreferrer">${ctx.esc(doc.title)}</a><span>${ctx.esc(doc.section || "")}</span><p>${ctx.esc(doc.question || "")}</p></li>`).join("");
            const materials = arr(prep.materials).length ? `
        <details class="s00-glossary"><summary>Materiais desta atividade</summary>${renderResources(prep.materials)}</details>` : "";
            const docsPanel = docs ? `
        <details class="s01-docs s00-glossary"><summary>Consulta opcional · documentação oficial</summary>
          <p>Você pode resolver o desafio com a explicação acima. Se quiser aprofundar, abra a seção indicada e procure a resposta à pergunta. As páginas podem estar em inglês; use a tradução do navegador se precisar.</p>
          <ul>${docs}</ul>
        </details>` : "";
            const predictionTable = published?.predictionTable;
            const predictionKey = ctx.exerciseProgressKey(item);
            const structuredProvider = predictionTable && window.DevPathStructuredPredictions;
            const predictionState = structuredProvider ? structuredProvider.parse(prediction, predictionTable) : null;
            const answerReady = answered && (!predictionTable || predictionState?.compatible === true);
            const practiceLocked = `
        <p class="course-gate-note" role="status">${answered && predictionTable && !predictionState?.compatible ? "A resposta antiga continua preservada. Registre uma nova previsão estruturada acima para liberar a execução." : "Registre sua primeira resposta no passo 03 para liberar a prática e a explicação final."}</p>`;
            const editingPrediction = predictionEditorOpen.has(predictionKey);
            const firstResponsePanel = answered ? `
        <div class="course-first-response-saved"><strong>Sua resposta inicial foi registrada</strong>
          ${structuredProvider ? structuredProvider.renderSaved(predictionTable, prediction) : `<p>${ctx.esc(prediction)}</p>`}<span>${ctx.esc(item.firstResponse.timing)}</span>
          ${structuredProvider && editingPrediction ? `${structuredProvider.renderForm(predictionTable, predictionState?.compatible ? prediction : '')}<div class="prediction-edit-actions"><button type="button" class="button-primary" data-course-first-response="${ctx.esc(id)}">Substituir por esta previsão</button><button type="button" class="button-secondary" data-guided-action="prediction-cancel">Cancelar</button></div>` : structuredProvider ? `<button type="button" class="button-secondary" data-guided-action="prediction-edit">${predictionState?.compatible ? 'Registrar uma nova previsão' : 'Criar previsão estruturada para este exercício'}</button>` : ''}
        </div>` : `
        ${predictionTable && window.DevPathStructuredPredictions ? window.DevPathStructuredPredictions.renderForm(predictionTable, prediction) : `
        <label class="course-response-label" for="first-response-${ctx.esc(id)}"><span>Sua primeira resposta</span><small>${ctx.esc(item.firstResponse.timing)}</small><textarea
          id="first-response-${ctx.esc(id)}"
          data-first-response-input="${ctx.esc(id)}"
          maxlength="${ctx.limits.predictionChars}"
          placeholder="Escreva sua previsão, hipótese ou primeira decisão…">${ctx.esc(prediction)}</textarea>
        </label>`}<button type="button" class="button-primary" data-course-first-response="${ctx.esc(id)}">Registrar resposta <span aria-hidden="true">→</span></button>`;
            const state = { answered: answerReady, evidenceReady, evidence, reflection };
            const hintButton = level < hints.length ? `<button class="button-secondary" type="button" data-guided-action="hint" data-guided-id="${ctx.esc(id)}">Mostrar próxima dica</button>` : "";
            const practiceSection = answerReady ? `
        ${sectionTitle("04", "Sua vez de praticar")}
        <p>Edite o arquivo abaixo, execute ou registre sua tentativa e compare com a previsão. Se precisar, abra uma dica por vez.</p>
        <div class="course-editors">${editors}</div>
        <div class="s01-actions">${hintButton}
          <label>Tamanho do código<select data-guided-font aria-label="Tamanho da fonte do código">${[11, 12, 14, 16, 18, 20, 22].map((n) => `<option value="${n}" ${n === fontSize ? "selected" : ""}>${n} px</option>`).join("")}</select></label>
        </div>
        <div class="s01-hints" data-guided-hints="${ctx.esc(id)}">${hints.slice(0, level).map((hint, index) => `<p>Dica ${index + 1}: ${code(hint)}</p>`).join("")}</div>
        ${runPanel}${rubricPanel}` : `
        ${sectionTitle("04", "Sua vez de praticar")}${practiceLocked}`;
            const explainSection = answerReady ? `
        ${sectionTitle("05", "Explique o que você descobriu")}
        <p>${ctx.esc(prep.reflectionPrompt || "Explique com suas palavras o que você fez ou descobriu.")}</p>
        <label class="course-reflection-label" for="course-reflection-${ctx.esc(id)}"><span>Sua explicação</span><textarea
          id="course-reflection-${ctx.esc(id)}"
          data-course-reflection="${ctx.esc(id)}"
          maxlength="${ctx.limits.reflectionChars}"
          placeholder="Eu previ… Depois de conferir, percebi que…">${ctx.esc(reflection)}</textarea>
        </label>${exampleDetails}
        <div class="s01-completion" data-guided-completion aria-live="polite">
          <strong>Para concluir</strong>
          ${historicCompletionNeedsReview ? '<p role="status">A conclusão anterior continua registrada. Confira explicitamente a rubrica atual para confirmar estes critérios.</p>' : ''}
          <ul>${renderRequirements(item, state)}</ul>
        </div>
        <div class="course-complete-row"><span data-course-reflection-count>${reflection.trim().length}/16 caracteres · ${evidenceReady ? "tentativa registrada" : "registre uma tentativa"}</span><button
          type="button"
          class="button-primary"
          data-course-complete="${ctx.esc(id)}" ${complete || reflection.trim().length < 16 || !evidenceReady || ((item.rubric || []).length && (!hasCurrentRubric(item, evidence) || (evidence.rubric || []).length !== item.rubric.length)) ? "disabled" : ""}>${complete ? "Atividade concluída ✓" : "Concluir atividade"}</button></div>${complete ? `
        <p class="course-complete-note" role="status">Atividade concluída com uma tentativa registrada e autoavaliação. A revisão correspondente entra no intervalo de 7 dias.</p>` : ""}` : `
        ${sectionTitle("05", "Explique o que você descobriu")}${practiceLocked}`;
            const navigation = `
        <nav class="s01-navigation" aria-label="Sequência de estudo">${previous ? `<a href="#/javascript/${ctx.esc(previous.id)}">← ${ctx.esc(previous.id)} · ${ctx.esc(previous.title)}</a>` : ""}<a href="#/catalog">Ver trilha</a>${next ? `<a href="#/javascript/${ctx.esc(next.id)}">${ctx.esc(next.id)} · ${ctx.esc(next.title)} →</a>` : ""}</nav>`;
            return `
        <article class="course-lesson s00-lesson s01-lesson" data-guided-id="${ctx.esc(id)}" data-learning-journey tabindex="-1">
          <a class="lesson-back" href="#/catalog">Voltar à trilha de JavaScript</a>
          ${global.DevPathPriorAttempts?.render(item, ctx.progress) || ""}
          <header class="course-lesson-hero">
            <div class="s00-hero-top">
              <div class="eyebrow">${language} <span>/</span> ETAPA ${ctx.esc(item.stage)} · ${ctx.esc(prep.stageTitle || "")}</div><span class="s00-lesson-index">${ctx.esc(id)}</span>
            </div>
            <h1>${ctx.esc(item.title)}</h1>
            <p>${ctx.esc(prep.introduction || item.firstResponse.action)}</p>
            <div class="s00-hero-meta"><span><i aria-hidden="true"></i>${ctx.esc(item.duration || "")} · no seu ritmo</span><span>${item.optional ? "Extra opcional" : `Atividade ${stageOrder} de ${stageCore.length}`} · ${ctx.esc(item.kind)}</span><span>${complete ? "Atividade concluída" : "Uma ideia por vez"}</span></div>
          </header>
          <nav class="s00-journey" aria-label="Roteiro da atividade">
            <div class="s00-journey-caption"><span>SEU CAMINHO NESTA ATIVIDADE</span><span data-learning-caption>Aprender</span></div>
            <div class="s00-steps s01-steps">${journey.map(([target, label, help], index) => `<button
              type="button"
              data-guided-action="anchor"
              data-guided-target="g-${target}" data-learning-target="g-${target}" ${index === 0 ? 'aria-current="step"' : ""}><span class="s00-step-number">0${index + 1}</span><span class="s00-step-copy"><strong>${label}</strong><span>${help}</span></span></button>`).join("")}</div>
          </nav>
          <p class="s00-path-help">Leia a explicação e o exemplo resolvido. Depois registre sua previsão, pratique e explique o que descobriu. A previsão pode estar errada; ela serve para você comparar seu raciocínio.</p>
          <section id="g-learn" data-s00-step="01" tabindex="-1">
            ${sectionTitle("01", "Entenda a ideia, passo a passo")}
            <p>${code(prep.explanation || item.explanation.mental_model)}</p>
            <ol class="s01-concepts">${concepts}</ol>
            ${vocabulary}
            <h3>Exemplo resolvido</h3>
            <ol class="s01-walkthrough">${walkthrough}</ol>
            ${notes ? `<aside class="s01-notes"><h3>Guarde esta ideia</h3>${notes}</aside>` : ""}
            ${primersPanel}${renderStageBridge(item)}${docsPanel}
          </section>
          <section id="g-challenge" data-s00-step="02" tabindex="-1">
            ${sectionTitle("02", "Conheça o desafio")}
            <p class="course-prompt">${ctx.esc(item.prompt)}</p>
            <ol class="s01-task-steps">${arr(prep.practiceSteps).map((step) => `<li>${ctx.esc(step)}</li>`).join("")}</ol>
            <div class="course-interaction-note"><strong>Como responder</strong><p>${ctx.esc(item.interaction)}</p></div>
            ${constraints}${edgeCases}${materials}
            <div class="course-starter-read"><div class="course-section-kicker">LEIA O ARQUIVO ANTES DE RESPONDER</div>${starterPreview}${readOnlyPreview ? `<h3>Artefatos somente leitura para comparar</h3><p>Abra os arquivos de saída e a proveniência do build. Eles foram preparados a partir deste exemplo antes da atividade.</p>${readOnlyPreview}` : ""}</div>
          </section>
          <section id="g-predict" data-s00-step="03" tabindex="-1">
            ${sectionTitle("03", "Prever antes de executar")}
            <p>${ctx.esc(prep.predictionGuide || item.firstResponse.action)}</p>
            ${firstResponsePanel}
          </section>
          <section id="g-practice" data-s00-step="04" tabindex="-1">${practiceSection}</section>
          <section id="g-explain" data-s00-step="05" tabindex="-1">${explainSection}</section>${navigation}
        </article>`;
        }
        function handleClick(event, item) {
            const target = event.target.closest?.("[data-guided-action]");
            if (!target)
                return false;
            event.preventDefault();
            const lesson = target.closest(".s01-lesson");
            if (target.dataset.guidedAction === "prediction-edit") {
                predictionEditorOpen.add(ctx.exerciseProgressKey(item));
                ctx.render?.();
                return true;
            }
            if (target.dataset.guidedAction === "prediction-cancel") {
                predictionEditorOpen.delete(ctx.exerciseProgressKey(item));
                ctx.render?.();
                return true;
            }
            if (target.dataset.guidedAction === "anchor") {
                const node = lesson?.querySelector(`#${target.dataset.guidedTarget}`);
                node?.scrollIntoView?.({ behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
                node?.focus?.({ preventScroll: true });
                return true;
            }
            if (target.dataset.guidedAction === "hint") {
                const hints = arr(item.hints).length ? item.hints : arr(item.preparation?.hints);
                const key = ctx.exerciseProgressKey(item);
                const level = Math.min(hints.length, (hintLevels.get(key) || 0) + 1);
                hintLevels.set(key, level);
                const list = lesson?.querySelector("[data-guided-hints]");
                if (list) {
                    const paragraph = document.createElement("p");
                    paragraph.textContent = `Dica ${level}: ${hints[level - 1].replace(/`/g, "")}`;
                    list.append(paragraph);
                }
                if (level >= hints.length)
                    target.remove();
                return true;
            }
            return false;
        }
        function handleInput(event) {
            if (event.target.matches?.("[data-course-rubric]")) {
                const id = event.target.dataset.courseRubric;
                const item = ctx.activityById.get(id);
                const rubric = [...ctx.view.querySelectorAll(`[data-course-rubric="${ctx.esc(id)}"]:checked`)].map(input => Number(input.value));
                saveExerciseEvidence(id, { rubric, ...(item?.rubricFingerprint ? {rubricFingerprint: item.rubricFingerprint} : {}) });
                if (item && currentCompletion(item, id, ctx.progress.exerciseEvidence?.[ctx.exerciseProgressKey(item)] || {})) ctx.render?.();
                return true;
            }
            if (event.target.matches?.(".course-editor")) {
                const activityId = event.target.dataset.courseEditor;
                if (activeRun?.id === activityId)
                    activeRun.cancel();
                saveCourseDraft(activityId);
                scheduleCourseSave();
                return true;
            }
            if (!event.target.matches?.("[data-guided-font]"))
                return false;
            const size = Math.max(11, Math.min(22, Number(event.target.value) || 14));
            event.target.closest(".s01-lesson")?.querySelectorAll(".course-editor").forEach((editor) => { editor.style.fontSize = `${size}px`; });
            try {
                localStorage.setItem("devpath.codeFontSize", String(size));
            }
            catch { /* The size is a convenience only. */ }
            return true;
        }
        function saveCourseDraft(id) {
            const editors = [...ctx.view.querySelectorAll(`[data-course-editor="${ctx.esc(id)}"]`)];
            if (!editors.length)
                return;
            const files = Object.fromEntries(editors.map((editor) => [editor.dataset.courseFile, editor.value]));
            const value = editors.length === 1 ? editors[0].value : `__course_files__:${JSON.stringify(files)}`;
            if (value.length > ctx.limits.draftChars) {
                ctx.toast("Este rascunho passou do limite salvo para a atividade.");
                return;
            }
            ctx.progress.exerciseDrafts ||= {};
            ctx.progress.exerciseDrafts[ctx.exerciseProgressKey(ctx.activityById.get(id))] = value;
        }
        function scheduleCourseSave() {
            clearTimeout(ctx.courseSaveTimer);
            ctx.courseSaveTimer = setTimeout(() => { ctx.courseSaveTimer = null; ctx.saveProgress(); }, 500);
        }
        function syncCourseCompletionButton(id) {
            const item = ctx.activityById.get(id);
            const evidence = ctx.progress.exerciseEvidence?.[ctx.exerciseProgressKey(item)] || {};
            const reflection = ctx.view.querySelector(`[data-course-reflection="${ctx.esc(id)}"]`)?.value.trim() || "";
            const checked = ctx.view.querySelectorAll(`[data-course-rubric="${ctx.esc(id)}"]:checked`).length;
            const button = ctx.view.querySelector(`[data-course-complete="${ctx.esc(id)}"]`);
            const requirements = ctx.view.querySelector("[data-guided-completion] ul");
            if (requirements && item)
                requirements.innerHTML = renderRequirements(item, { answered: true, evidenceReady: evidenceCounts(item, evidence), evidence: { ...evidence, rubric: [...ctx.view.querySelectorAll(`[data-course-rubric="${ctx.esc(id)}"]:checked`)].map((input) => Number(input.value)), rubricFingerprint: item.rubricFingerprint }, reflection });
            if (button)
                button.disabled = currentCompletion(item, id, evidence) || reflection.length < 16 || !evidenceCounts(item, evidence) || ((item?.rubric || []).length > 0 && checked !== item.rubric.length) || !hasCurrentRubric(item, evidence);
        }
        function saveExerciseEvidence(id, evidence) {
            const item = ctx.activityById.get(id);
            const key = ctx.exerciseProgressKey(item);
            ctx.progress.exerciseEvidence ||= {};
            ctx.progress.exerciseEvidence[key] = { ...ctx.progress.exerciseEvidence[key], ...evidence, recordedAt: new Date().toISOString() };
            ctx.saveProgress();
            syncCourseCompletionButton(id);
        }
        async function runCourseJavaScript(id) {
            const item = ctx.activityById.get(id);
            const readCurrentFiles = () => (item?.starterFiles || []).map(file => ({ path: file.path, content: ctx.view.querySelector(`[data-course-editor="${ctx.esc(id)}"][data-course-file="${CSS.escape(file.path)}"]`)?.value ?? file.content }));
            const files = readCurrentFiles();
            const output = ctx.view.querySelector(`[data-course-output="${ctx.esc(id)}"]`);
            if (!files.length || !output)
                return;
            if (!files.some(file => file.content.trim())) {
                ctx.toast("Escreva uma tentativa antes de executar.");
                return;
            }
            saveCourseDraft(id);
            const learningAttemptId = ctx.learning?.record?.(item)?.attemptId;
            activeRun?.cancel();
            const generation = ++runGeneration;
            const abort = new AbortController();
            let stop;
            const run = { id, cancel() { abort.abort(); stop?.(); } };
            activeRun = run;
            ctx.cancelCourseRun = run.cancel;
            let assessment;
            const fingerprint = async (snapshot = readCurrentFiles()) => window.DevPathAssessment?.canonicalFingerprint({ activityId: id, contentVersion: item.contentVersion || 1, assessmentVersion: assessment?.version || 1, assessment, files: snapshot }) || "";
            let expectedFingerprint;
            const isCurrent = async () => {
                if (generation !== runGeneration || abort.signal.aborted || !output.isConnected) return false;
                let currentFingerprint;
                try { currentFingerprint = await fingerprint(readCurrentFiles()); }
                catch { return false; }
                return generation === runGeneration && !abort.signal.aborted && output.isConnected && currentFingerprint === expectedFingerprint;
            };
            const record = (result) => {
                const tests = result.tests;
                const passed = result.kind === "passed";
                const observational = result.kind === "observed";
                const predictionTable = assessment?.predictionTable;
                const savedPrediction = ctx.progress.exercisePredictions?.[ctx.exerciseProgressKey(item)];
                const predictionState = predictionTable && window.DevPathStructuredPredictions?.parse(savedPrediction, predictionTable);
                const comparison = predictionTable && savedPrediction && predictionState?.compatible && window.DevPathStructuredPredictions
                    ? window.DevPathStructuredPredictions.compare(predictionTable, savedPrediction, result.text)
                    : null;
                const comparisonText = comparison ? `\n\nComparação para reflexão (não é uma nota): ${comparison.answered}/${comparison.total} campos previstos; ${comparison.matched} coincidiram.${comparison.complete ? "" : " A comparação está incompleta."}\n${comparison.rows.map(row => `${row.label}: você previu “${row.expected || '(vazio)'}”; a execução mostrou “${row.observed}”.`).join('\n')}` : "";
                output.textContent = `${result.text || result.kind}${comparisonText}${passed || observational ? "" : "\n\nCorrija o trabalho e tente novamente antes de concluir."}`;
                const key = ctx.exerciseProgressKey(item);
                saveExerciseEvidence(id, { status: "executed", runResult: passed || observational ? "result" : result.kind, output: `${result.text || result.kind}${comparisonText}`, fingerprint: result.fingerprint || expectedFingerprint, source: result.source || "local-declared", runCount: Math.min(ctx.limits.attemptCount, Number(ctx.progress.exerciseEvidence?.[key]?.runCount || 0) + 1), testsPassed: passed, tests: tests ? { passed: tests.passed, total: tests.total, failed: tests.failed } : { passed: 0, total: 0, failed: 0 }, ...(result.firstFailure ? {firstFailure: result.firstFailure} : {}) });
                if (passed) void ctx.learning?.runAssessment?.(item, result, {attemptId: learningAttemptId, fingerprint: result.fingerprint || expectedFingerprint});
            };
            try {
                output.textContent = "Preparando avaliação local…";
                const assessments = await loadCourseAssessments();
                assessment = assessments[id];
                expectedFingerprint = await fingerprint();
                if (assessment?.environment === "rubric" && assessment.predictionTable?.outputFormat === "lines") {
                    const entryPath = assessment.entryPath || files.find(file => /\.(?:m?js|jsx)$/i.test(file.path))?.path;
                    if (!entryPath || !window.DevPathModuleGraph?.buildModuleGraph) throw new Error("Entrada da demonstração indisponível.");
                    const demoPath = "__devpath_prediction_demo__.js";
                    const demoSource = "import " + JSON.stringify("./" + entryPath) + ";\nawait new Promise(resolve => setTimeout(resolve, 0));";
                    const demoFiles = [...files.filter(file => file.path !== demoPath), {path: demoPath, content: demoSource}];
                    const graph = await window.DevPathModuleGraph.buildModuleGraph({files: demoFiles, entryPath: demoPath});
                    if (!(await isCurrent())) return;
                    output.textContent = "Executando demonstração isolada… aguardando uma task de timer.";
                    const observed = await new Promise(resolve => { stop = ctx.courseRunner.run({module: graph.code}, (kind, text, tests) => resolve({kind, text, tests}), {timeoutMs: 2000}); });
                    if (await isCurrent()) { activeRun = null; ctx.cancelCourseRun = null; record({kind: observed.kind === "result" ? "observed" : observed.kind, text: observed.text, fingerprint: expectedFingerprint, source: "rubric-declared"}); }
                    return;
                }
                if (assessment && window.DevPathAssessment) {
                    const result = await window.DevPathAssessment.run({ item, assessment, files, signal: abort.signal, fingerprint: expectedFingerprint });
                    if (await isCurrent()) { activeRun = null; ctx.cancelCourseRun = null; record(result); }
                    return;
                }
                // Compatibility path for older local activities without a manifest entry.
                const entryPath = files.find(file => /\.(?:m?js|jsx)$/i.test(file.path))?.path || files[0].path;
                const graph = await window.DevPathModuleGraph.buildModuleGraph({ files, entryPath });
                if (!(await isCurrent())) return;
                output.textContent = "Executando em ambiente isolado… limite de 2 segundos.";
                await new Promise(resolve => { stop = ctx.courseRunner.run({ module: graph.code }, async (kind, text, tests) => { if (await isCurrent()) record({ kind: kind === "result" && tests?.total > 0 && tests.failed === 0 ? "passed" : kind === "result" ? "failed" : kind, text, tests, fingerprint: expectedFingerprint }); resolve(); }); });
            }
            catch (error) {
                if (await isCurrent()) record({ kind: "error", text: error instanceof Error ? error.message : String(error), fingerprint: expectedFingerprint });
            }
            finally { if (activeRun === run) { activeRun = null; ctx.cancelCourseRun = null; } }
        }
        function submitGuidedWriting(id) {
            if (ctx.activityById.get(id)?.autoTested) {
                ctx.toast("Esta atividade é corrigida por testes: execute os testes.");
                return;
            }
            const editors = [...ctx.view.querySelectorAll(`[data-course-editor="${ctx.esc(id)}"]`)];
            const material = editors.map((editor) => editor.value.trim()).join("\n");
            const output = ctx.view.querySelector(`[data-course-output="${ctx.esc(id)}"]`);
            if (material.length < 40) {
                if (output)
                    output.textContent = `Ainda faltam ${40 - material.length} caracteres de análise no arquivo. Desenvolva sua resposta e tente novamente.`;
                return;
            }
            saveCourseDraft(id);
            if (output)
                output.textContent = `Análise registrada (${material.length} caracteres). Agora confira sua resposta com os critérios e explique o raciocínio.`;
            const item = ctx.activityById.get(id);
            saveExerciseEvidence(id, { status: "written", runResult: "guided", output: `Análise escrita registrada (${material.length} caracteres).`, rubric: ctx.progress.exerciseEvidence?.[ctx.exerciseProgressKey(item)]?.rubric || [] });
        }
        function completeCourseExercise(id) {
            const reflection = ctx.view.querySelector(`[data-course-reflection="${ctx.esc(id)}"]`)?.value.trim() || "";
            const item = ctx.activityById.get(id);
            const key = ctx.exerciseProgressKey(item);
            const evidence = ctx.progress.exerciseEvidence?.[key] || {};
            const checked = [...ctx.view.querySelectorAll(`[data-course-rubric="${ctx.esc(id)}"]:checked`)].map((input) => Number(input.value));
            if (!item || !evidenceCounts(item, evidence)) {
                ctx.toast(evidence.status === "executed" ? "A última execução terminou com erro ou tempo limite. Corrija e execute de novo antes de concluir." : "Registre uma tentativa antes de concluir.");
                return;
            }
            if (reflection.length < 16) {
                ctx.toast("Escreva pelo menos 16 caracteres na explicação final.");
                return;
            }
            if ((item.rubric || []).length && checked.length !== item.rubric.length) {
                ctx.toast("Revise cada critério da autoavaliação antes de concluir.");
                return;
            }
            if (item.rubricFingerprint && !hasCurrentRubric(item, {...evidence, rubric: checked})) {
                ctx.toast("Confira novamente cada critério da rubrica atual antes de concluir.");
                return;
            }
            void ctx.learning?.submitStudy?.(item, reflection);
            const assessment = ctx.assessments?.[id];
            if (evidence.status === "executed" && evidence.testsPassed === true && evidence.fingerprint) {
                const declaredRubricTotal = assessment?.rubric?.length || 0;
                const declaredRubricChecked = ctx.view.querySelectorAll("[data-learning-rubric]:checked").length;
                void ctx.learning?.runAssessment?.(item, {kind: "passed", source: evidence.source || "local-declared", fingerprint: evidence.fingerprint}, {
                    attemptId: ctx.learning?.record?.(item)?.attemptId,
                    fingerprint: evidence.fingerprint,
                    declaredRubricComplete: !assessment?.expectedDiagnostics?.length || (declaredRubricTotal > 0 && declaredRubricChecked === declaredRubricTotal)
                });
            }
            ctx.progress.exerciseEvidence[key] = { ...evidence, rubric: checked, ...(item.rubricFingerprint ? {rubricFingerprint: item.rubricFingerprint} : {}) };
            saveCourseDraft(id);
            ctx.progress.exerciseReflections ||= {};
            ctx.progress.exerciseReflections[key] = reflection.slice(0, ctx.limits.reflectionChars);
            ctx.progress.answers ||= {};
            ctx.progress.answers[id] = true;
            ctx.progress.exerciseVersions ||= {};
            ctx.progress.exerciseVersions[id] = Number(item.contentVersion || 1);
            ctx.progress.completed ||= [];
            if (!ctx.progress.completed.includes(id))
                ctx.progress.completed.push(id);
            ctx.progress.attempts ||= {};
            ctx.progress.attempts[id] = Math.min(ctx.limits.attemptCount, Number(ctx.progress.attempts[id] || 0) + 1);
            ctx.progress.reviewSchedule ||= {};
            if (!ctx.progress.reviewSchedule[id]) {
                ctx.progress.reviewSchedule[id] = ctx.reviewSchedule.initial();
            }
            ctx.saveProgress();
            ctx.render();
        }
        function flush() { if (ctx.courseSaveTimer) {
            clearTimeout(ctx.courseSaveTimer);
            ctx.courseSaveTimer = null;
            ctx.saveProgress();
        } }
        function dispose() { flush(); activeRun?.cancel(); runGeneration++; activeRun = null; ctx.cancelCourseRun = null; }
        function predictionSaved(id) { const item = ctx.activityById.get(id); if (item) predictionEditorOpen.delete(ctx.exerciseProgressKey(item)); }
        return Object.freeze({ flush, dispose, loadCourseDraft, renderResources, renderStageBridge, renderCurriculumLesson, handleClick, handleInput, saveCourseDraft, scheduleCourseSave, syncCourseCompletionButton, saveExerciseEvidence, runCourseJavaScript, submitGuidedWriting, completeCourseExercise, predictionSaved });
    }
    global.DevPathCourseController = Object.freeze({ create });
})(window);
