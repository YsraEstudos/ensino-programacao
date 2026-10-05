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
        function renderCurriculumLesson(item) {
            const id = item.id;
            const answered = ctx.progress.warmupCompleted?.[ctx.exerciseProgressKey(item)] === true || ctx.isExerciseDone(id);
            const complete = ctx.isExerciseDone(id);
            const progressKey = ctx.exerciseProgressKey(item);
            const prediction = ctx.progress.exercisePredictions?.[progressKey] || "";
            const reflection = ctx.progress.exerciseReflections?.[progressKey] || "";
            const evidence = ctx.progress.exerciseEvidence?.[progressKey] || {};
            const evidenceReady = evidence.status === "executed" || evidence.status === "written";
            const drafts = loadCourseDraft(item);
            const required = ctx.requiredActivities();
            const itemPosition = ctx.curriculumActivities.indexOf(item);
            const previous = [...required].reverse().find((candidate) => ctx.curriculumActivities.indexOf(candidate) < itemPosition);
            const next = required.find((candidate) => ctx.curriculumActivities.indexOf(candidate) > itemPosition);
            const stageCore = required.filter((candidate) => candidate.stage === item.stage);
            const stageOrder = stageCore.indexOf(item) + 1;
            const sequenceLabel = item.optional ? "EXTRA OPT-IN" : `ORDEM ${stageOrder} DE ${stageCore.length}`;
            const starterPreview = item.starterFiles.map((file) => `
        <div
          class="course-file-preview"><span>${ctx.esc(file.path)}</span><pre><code>${ctx.esc(file.content)}</code></pre>
          </div>`).join("");
            const editors = item.starterFiles.map((file) => `
        <label
          class="course-editor-label" for="course-file-${ctx.esc(id)}-${item.starterFiles.indexOf(file)}"><span>${ctx.esc(file.path)}</span><textarea
          id="course-file-${ctx.esc(id)}-${item.starterFiles.indexOf(file)}"
          class="course-editor"
          data-course-editor="${ctx.esc(id)}"
          data-course-file="${ctx.esc(file.path)}"
          maxlength="${Math.max(80, Math.floor(1100 / item.starterFiles.length))}"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off">${ctx.esc(drafts[file.path] ?? file.content)}</textarea>
        </label>`).join("");
            const codeFile = item.starterFiles.find((file) => /\.m?js$/i.test(file.path));
            const rubricChecks = (item.rubric || []).map((criterion, index) => `
        <label
          class="course-self-check"><input
          type="checkbox"
          data-course-rubric="${ctx.esc(id)}" value="${index}" ${evidence.rubric?.includes(index) ? "checked" : ""}><span>${ctx.esc(criterion)}</span>
        </label>`).join("");
            const runPanel = codeFile
                ? `
        <div
          class="course-runner">
          <div
            class="course-runner-heading"><strong>Execute uma tentativa</strong><span>JavaScript isolado · sem DOM, rede ou APIs do Node.js</span>
          </div>
          <p>O executor aceita JavaScript e módulos que importam outros arquivos deste exercício. Imports externos não são permitidos. Atividades com DOM, TypeScript, APIs do Node.js ou ferramentas de teste continuam disponíveis como análise escrita. O resultado serve para investigar seu código; os critérios continuam sendo conferidos por você, com a rubrica.
          </p><button
            type="button"
            class="button-secondary"
            data-course-run="${ctx.esc(id)}">Executar JavaScript</button>
          <button type="button" class="button-secondary" data-course-submit-writing="${ctx.esc(id)}">Registrar análise escrita</button>
            <div
              class="course-run-output"
              data-course-output="${ctx.esc(id)}"
              role="status"
              aria-live="polite">${evidence.output ? ctx.esc(evidence.output) : "A saída aparecerá aqui."}
            </div>
          </div>`
                : `
        <div
          class="course-runner">
          <div
            class="course-runner-heading"><strong>Registre uma análise escrita</strong><span>Modo guiado · sem IA</span>
          </div>
          <p>Edite o arquivo acima com sua análise, diagnóstico ou solução. Depois registre a tentativa para anexar a evidência à revisão.
          </p><button
            type="button"
            class="button-secondary"
            data-course-submit-writing="${ctx.esc(id)}">Registrar análise escrita</button>
            <div
              class="course-run-output"
              data-course-output="${ctx.esc(id)}"
              role="status"
              aria-live="polite">${evidence.status === "written" ? "Análise registrada." : "Escreva pelo menos 40 caracteres no material antes de registrar."}
            </div>
          </div>`;
            const rubricPanel = rubricChecks ? `
        <fieldset
          class="course-rubric-checks"><legend>Autoavaliação guiada</legend>
          <p>Marque apenas os critérios que você conferiu no próprio trabalho. Isso registra sua reflexão; não é uma nota automática.
          </p>${rubricChecks}
        </fieldset>` : "";
            const exampleDetails = item.examples?.length ? `
        <details
          class="course-reveal"><summary>Conferir exemplos públicos depois da sua tentativa</summary>
          <ul>${item.examples.map((example) => `
        <li><strong>${ctx.esc(example.given || "Exemplo")}</strong><span>${ctx.esc(example.expected || "")}</span>
          </li>`).join("")}
          </ul>
        </details>` : "";
            const rubricDetails = item.rubric?.length || item.constraints?.length ? `
        <details
          class="course-reveal"><summary>Critérios e limites desta atividade</summary>${item.rubric?.length ? `
        <h3>Como conferir
        </h3>
        <ul>${item.rubric.map((line) => `
        <li>${ctx.esc(line)}
        </li>`).join("")}
        </ul>` : ""}${item.constraints?.length ? `
        <h3>Restrições
        </h3>
        <ul>${item.constraints.map((line) => `
        <li>${ctx.esc(line)}
        </li>`).join("")}
        </ul>` : ""}
        </details>` : "";
            const stageBridge = renderStageBridge(item);
            const firstResponsePanel = answered ? `
        <div
          class="course-first-response-saved"><strong>Sua resposta inicial foi registrada</strong>
          <p>${ctx.esc(prediction)}
          </p><span>${ctx.esc(item.firstResponse.timing)}</span>
          </div>` : `
        <label
          class="course-response-label" for="first-response-${ctx.esc(id)}"><span>Sua primeira resposta</span><small>${ctx.esc(item.firstResponse.timing)}</small><textarea
          id="first-response-${ctx.esc(id)}"
          data-first-response-input="${ctx.esc(id)}"
          maxlength="${ctx.limits.predictionChars}"
          placeholder="Escreva sua previsão, hipótese ou primeira decisão…">${ctx.esc(prediction)}</textarea>
        </label><button
          type="button"
          class="button-primary"
          data-course-first-response="${ctx.esc(id)}">Registrar resposta e abrir a explicação <span
          aria-hidden="true">→</span></button>`;
            const learningPanel = answered ? `
        <section
          class="course-explanation-panel">
          <div
            class="course-section-kicker">EXPLICAÇÃO GUIADA
          </div>
          <h2>O modelo mental
          </h2>
          <p>${ctx.esc(item.explanation.mental_model)}
          </p>
          <h3>Exemplo trabalhado
          </h3>
          <p>${ctx.esc(item.explanation.worked_example)}
          </p>
          <div
            class="course-explanation-columns">
            <div><strong>Armadilha comum</strong>
              <p>${ctx.esc(item.explanation.common_trap)}
              </p>
            </div>
            <div><strong>Por que isso importa</strong>
              <p>${ctx.esc(item.explanation.why_it_matters)}
              </p>
            </div>
          </div>${exampleDetails}${rubricDetails}
          <div
            class="course-resources">
            <h3>Recursos para esta atividade
            </h3>${renderResources(item.resources)}
          </div>
        </section>${stageBridge}
        <section
          class="course-practice-panel">
          <div
            class="course-section-kicker">SUA VEZ DE ESCREVER
          </div>
          <h2>Edite o arquivo do exercício
          </h2>
          <p>O rascunho é salvo na sua conta. A forma de registrar a tentativa depende do material desta atividade.
          </p>
          <div
            class="course-editors">${editors}
          </div>${runPanel}${rubricPanel}
          <label
            class="course-reflection-label" for="course-reflection-${ctx.esc(id)}"><span>Explique com suas palavras o que você fez ou descobriu</span><textarea
            id="course-reflection-${ctx.esc(id)}"
            data-course-reflection="${ctx.esc(id)}"
            maxlength="${ctx.limits.reflectionChars}"
            placeholder="Sua explicação ajuda a consolidar o raciocínio…">${ctx.esc(reflection)}</textarea>
          </label>
          <div
            class="course-complete-row"><span data-course-reflection-count>${reflection.trim().length}/16 caracteres · ${evidenceReady ? "tentativa registrada" : "registre uma tentativa"}</span><button
              type="button"
              class="button-primary"
              data-course-complete="${ctx.esc(id)}" ${complete || reflection.trim().length < 16 || !evidenceReady || ((item.rubric || []).length && (evidence.rubric || []).length !== item.rubric.length) ? "disabled" : ""}>${complete ? "Atividade concluída ✓" : "Concluir com minha explicação"}</button>
            </div>${complete ? `
        <p
          class="course-complete-note"
          role="status">Atividade concluída com uma tentativa registrada e autoavaliação. A revisão correspondente entra no intervalo de 7 dias.
        </p>` : ""}
          </section>
          <footer
            class="course-lesson-footer">${previous ? `<a
        class="button-secondary"
        href="#/javascript/${ctx.esc(previous.id)}">← ${ctx.esc(previous.id)} · ${ctx.esc(previous.title)}</a>` : `<span></span>`}${next ? `<a
        class="button-secondary"
        href="#/javascript/${ctx.esc(next.id)}">${ctx.esc(next.id)} · ${ctx.esc(next.title)} →</a>` : ""}
          </footer>` : `
        <p
          class="course-gate-note"
          role="status">A explicação e o editor aparecem depois que você registrar sua primeira resposta.
        </p>`;
            return `
        <article
          class="course-lesson"><a
            class="lesson-back"
            href="#/catalog">← Todas as etapas</a>
          <header
            class="course-lesson-hero">
            <div
              class="eyebrow">${ctx.esc(sequenceLabel)} · ${ctx.esc(item.id)} · ${ctx.esc(item.kind)}${item.optional ? " · EXTRA OPT-IN" : ""}
            </div>
            <h1>${ctx.esc(item.title)}<span
              class="brand-period">.</span>
          </h1>
          <p>${ctx.esc(item.firstResponse.action)}
          </p>
          <div
            class="course-lesson-meta"><span title="Estimativa editorial inicial para planejar a sessão, não medida de domínio.">Estimativa: ${ctx.esc(item.duration)}</span><span>Runtime sugerido: ${ctx.esc(item.runtime || "JavaScript")}</span><span>${complete ? "✓ concluído" : "em andamento"}</span>
            </div>
          </header>
          <nav
            class="course-steps"
            aria-label="Etapas da atividade"><span
              class="${answered ? "complete" : "active"}">01 · Ler</span><span
              class="${answered ? "complete" : "active"}">02 · Responder</span><span
              class="${answered ? "active" : ""}">03 · Entender</span><span
              class="${complete ? "complete" : ""}">04 · Escrever</span><span
              class="${complete ? "complete" : ""}">05 · Explicar</span>
            </nav>
            <section
              class="course-prompt-panel">
              <div
                class="course-section-kicker">DESAFIO
              </div>
              <p
                class="course-prompt">${ctx.esc(item.prompt)}
              </p>
              <div
                class="course-interaction-note"><strong>Como responder</strong>
                <p>${ctx.esc(item.interaction)}
                </p>
              </div>
              <div
                class="course-starter-read">
                <div
                  class="course-section-kicker">LEIA O ARQUIVO ANTES DE RESPONDER
                </div>${starterPreview}
              </div>${firstResponsePanel}
            </section>${learningPanel}
          </article>`;
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
            if (button)
                button.disabled = ctx.isExerciseDone(id) || reflection.length < 16 || !["executed", "written"].includes(evidence.status) || ((item?.rubric || []).length > 0 && checked !== item.rubric.length);
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
            const files = (item?.starterFiles || []).filter(file => /\.m?js$/i.test(file.path)).map(file => ({ path: file.path, content: ctx.view.querySelector(`[data-course-editor="${ctx.esc(id)}"][data-course-file="${CSS.escape(file.path)}"]`)?.value ?? file.content }));
            const output = ctx.view.querySelector(`[data-course-output="${ctx.esc(id)}"]`);
            if (!files.length || !output)
                return;
            if (!files[0].content.trim()) {
                ctx.toast("Escreva uma tentativa antes de executar.");
                return;
            }
            saveCourseDraft(id);
            ctx.cancelCourseRun?.();
            let cancelled = false;
            let stop;
            ctx.cancelCourseRun = () => { cancelled = true; stop?.(); };
            const finish = (kind, result) => {
                if (cancelled || !output.isConnected)
                    return;
                ctx.cancelCourseRun = null;
                const heading = kind === "timeout" ? "Tempo limite excedido" : kind === "error" ? "Erro na tentativa" : "Execução concluída";
                output.textContent = `${heading}\n${result}`;
                const key = ctx.exerciseProgressKey(item);
                saveExerciseEvidence(id, { status: "executed", runResult: kind, output: result, runCount: Math.min(ctx.limits.attemptCount, Number(ctx.progress.exerciseEvidence?.[key]?.runCount || 0) + 1) });
            };
            try {
                // This is only a loader choice. The parser and compiler implement module syntax.
                const needsCompiler = files.length > 1 || /\b(?:import|export)\b/.test(files[0].content);
                output.textContent = needsCompiler ? "Preparando módulos locais…" : "Executando em ambiente isolado… limite de 2 segundos.";
                const code = needsCompiler ? { module: (await window.DevPathModuleGraph.buildModuleGraph({ files, entryPath: files[0].path })).code } : files[0].content;
                if (cancelled)
                    return;
                output.textContent = "Executando em ambiente isolado… limite de 2 segundos.";
                stop = ctx.courseRunner.run(code, finish);
            }
            catch (error) {
                finish("error", error.message);
            }
        }
        function submitGuidedWriting(id) {
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
            if (!item || (evidence.status !== "executed" && evidence.status !== "written")) {
                ctx.toast("Registre uma tentativa antes de concluir.");
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
            ctx.progress.exerciseEvidence[key] = { ...evidence, rubric: checked };
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
        function dispose() { flush(); ctx.cancelCourseRun?.(); ctx.cancelCourseRun = null; }
        return Object.freeze({ flush, dispose, loadCourseDraft, renderResources, renderStageBridge, renderCurriculumLesson, saveCourseDraft, scheduleCourseSave, syncCourseCompletionButton, saveExerciseEvidence, runCourseJavaScript, submitGuidedWriting, completeCourseExercise });
    }
    global.DevPathCourseController = Object.freeze({ create });
})(window);
