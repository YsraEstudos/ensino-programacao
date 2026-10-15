(function (global) {
    "use strict";
    // Injected dependencies: curriculumActivities, doneCount, dueExercises, esc, isExerciseDone, nextReviewDate, progress, renderInlineCode, reviewQuestionIndex, reviewSchedule, reviewSession, saveProgress, setBreadcrumb, updateNav, view.
    // Optional: render (re-renders a review that started before variants loaded), reviewOptIn (learner opted in to optional activities).
    // Variants are read from course-variants.json when present; without it every review uses the legacy multiple-choice card.
    const VARIANTS_URL = "course-variants.json";
    const FORMAT_LABEL = { "choice-predict": "PREVISÃO", "predict-code": "PREVISÃO DE CÓDIGO", "short-fix": "CORREÇÃO CURTA", "mini-impl": "MINI-IMPLEMENTAÇÃO" };
    const SAVE_DELAY_MS = 800;
    let bankPromise = null;
    // The published variant bank is fetched once per page and shared by the review and kata routes.
    // A missing file is normal before variants are published. Callers decide when to ask: only those routes fetch.
    function loadVariantBank() {
        if (bankPromise) return bankPromise;
        const selection = global.DevPathReviewSelection;
        bankPromise = typeof fetch === "function" && selection
            ? fetch(VARIANTS_URL, { cache: "no-cache" })
                .then(response => (response.ok ? response.json() : null))
                .then(data => (Array.isArray(data?.variants) ? data.variants.filter(selection.wellFormed) : []))
                .catch(() => [])
            : Promise.resolve([]);
        return bankPromise;
    }
    // Renders the learner's answer area for a variant. Shared by the review cards and the kata sessions.
    // Attribute names are the review's (data-review-choice, data-review-draft); the app's click handler relies on them.
    function answerMarkup(variant, draft, esc) {
        const selection = global.DevPathReviewSelection;
        if (variant.format === "choice-predict") {
            // The code is optional in this format, but when present the question is about it, so it must be on screen.
            const code = variant.code ? `<pre class="review-code"><code>${esc(variant.code)}</code></pre>
          ` : "";
            return `${code}<div
            class="answer-group"
            role="group"
            aria-label="Escolha uma resposta">${variant.choices.map((choice, index) => `<button
        class="answer-option"
        data-review-choice="${index}"
        aria-pressed="${String(draft === String(index))}">${String.fromCharCode(65 + index)}. ${esc(choice)}</button>`).join("")}
          </div>`;
        }
        if (variant.format === "predict-code") {
            return `<pre class="review-code"><code>${esc(variant.code)}</code></pre>
          <label class="review-field"><span>Saída prevista</span>
            <textarea data-review-draft rows="4" spellcheck="false">${esc(draft)}</textarea></label>`;
        }
        const starter = selection.starterOf(variant);
        return `<label class="review-field"><span>${esc(variant.entryPath)}</span>
            <textarea data-review-draft rows="14" spellcheck="false">${esc(draft || starter)}</textarea></label>`;
    }
    // Real runners for graded answers: snippets go through the course runner, behavior checks through DevPathAssessment.run.
    function createRunners() {
        const selection = global.DevPathReviewSelection;
        return {
            runSnippet: code => new Promise(resolve => {
                try {
                    global.DevPathCourseRunner.run(code, (kind, text) => resolve({ kind, text }), { timeoutMs: 2000 });
                }
                catch (error) { resolve({ kind: "error", text: error instanceof Error ? error.message : String(error) }); }
            }),
            // Behavior checks go through the same assessment runner as the course; the learner's code is never compared as text.
            runBehavior: ({ variant, files }) => global.DevPathAssessment.run(selection.behaviorRequest(variant, files))
        };
    }
    function create(ctx) {
        const selection = global.DevPathReviewSelection;
        let variants = [];
        let variantsPromise = null;
        let saveTimer;
        // Loads the bank on the first visit to the review route, so other routes make no extra request.
        function variantsReady() {
            if (variantsPromise) return variantsPromise;
            variantsPromise = loadVariantBank()
                .then(list => { variants = list; })
                .finally(() => {
                    // Rebuild a session that started with the legacy cards, unless the learner already answered something.
                    if (variants.length && typeof location !== "undefined" && location.hash.startsWith("#/review") && ctx.activityById && ctx.reviewQuestionIndex === 0 && !ctx.reviewSession?.some(item => item.checked)) {
                        ctx.reviewSession = null;
                        ctx.render?.();
                    }
                });
            return variantsPromise;
        }
        function executors() {
            const behavior = new Set();
            if (global.DevPathCourseRunner?.run && global.DevPathModuleGraph?.buildModuleGraph && global.DevPathAssessment?.run) behavior.add("javascript");
            if (global.DevPathDomRunner?.run && global.DevPathAssessment?.run) behavior.add("dom");
            return { snippet: Boolean(global.DevPathCourseRunner?.run), behavior };
        }
        function selectionContext() {
            const activities = ctx.curriculumActivities;
            return {
                studied: new Set(activities.filter(item => ctx.isExerciseDone(item.id)).map(item => item.id)),
                optional: new Set(activities.filter(item => item.optional === true).map(item => item.id)),
                optIn: ctx.reviewOptIn === true,
                executors: executors(),
                variants
            };
        }
        function persist() { ctx.saveProgress(); }
        function scheduleDraftSave() { clearTimeout(saveTimer); saveTimer = setTimeout(persist, SAVE_DELAY_MS); }
        function attempts() { ctx.progress.reviewAttempts ||= {}; return ctx.progress.reviewAttempts; }

        // Builds one review question. A pending attempt for the activity is resumed; otherwise a variant is chosen
        // and persisted before the learner sees it, so a reload returns to the same attempt.
        function questionFor(item, scheduled, context) {
            const base = { exercise: item, scheduled, checked: false };
            if (!context.variants.length) return { ...base, ...item.review, kind: "legacy", limitNote: null };
            const reconciled = selection.reconcileAttempts({ attempts: attempts(), variants: context.variants, activityId: item.id, studied: context.studied, optional: context.optional, optIn: context.optIn, executors: context.executors });
            ctx.progress.reviewAttempts = reconciled.attempts;
            if (reconciled.resumeVariantId) {
                const variant = context.variants.find(entry => entry.variantId === reconciled.resumeVariantId);
                return { ...base, kind: "variant", variant, limitNote: null };
            }
            const choice = selection.chooseReview({
                candidates: [item.id], variants: context.variants, studied: context.studied, optional: context.optional,
                optIn: context.optIn, executors: context.executors, lastByActivity: selection.lastByActivity(ctx.progress.reviewSchedule, attempts())
            });
            if (choice.kind === "variant") {
                ctx.progress.reviewAttempts = selection.startAttempt(attempts(), choice.variant, Date.now());
                return { ...base, kind: "variant", variant: choice.variant, limitNote: null };
            }
            return { ...base, ...item.review, kind: "legacy", limitNote: choice.limitNote };
        }
        function reviewSet() {
            const context = selectionContext();
            // Optional activities enter the practice pool only with the learner's opt-in; counts of core progress never change.
            const activities = ctx.curriculumActivities.filter((item) => ctx.isExerciseDone(item.id) && (item.optional !== true || context.optIn));
            const due = ctx.dueExercises().sort((a, b) => Number(ctx.progress.reviewSchedule?.[a.id]?.dueAt) - Number(ctx.progress.reviewSchedule?.[b.id]?.dueAt));
            let questions;
            if (due.length)
                questions = due.slice(0, 12).map((item) => questionFor(item, true, context));
            else if (!activities.length)
                questions = [];
            else {
                const index = Math.max(0, Math.trunc(Number(ctx.progress.reviewIndex) || 0)) % activities.length;
                questions = [questionFor(activities[index], false, context)];
            }
            if (questions.some(question => question.kind === "variant")) persist();
            return questions;
        }
        function reviewSummary(total, completed, dueCount, upcoming) {
            if (total && completed) {
                const pending = dueCount === 1 ? "revisão vencida ainda aguarda" : "revisões vencidas ainda aguardam";
                const registered = total === 1 ? "resposta registrada" : "respostas registradas";
                return {
                    heading: "Rodada concluída",
                    description: dueCount
                        ? `${total} respostas registradas nesta rodada; ${dueCount} ${pending}.`
                        : `${total} ${registered}. A próxima revisão aparece no intervalo agendado.`
                };
            }
            if (dueCount) {
                const ideas = dueCount === 1 ? "ideia para revisar" : "ideias para revisar";
                const pending = dueCount === 1 ? "revisão vencida" : "revisões vencidas";
                return {
                    heading: `${dueCount} ${ideas}`,
                    description: `${total} perguntas nesta rodada; ${dueCount} ${pending} no total. Responda uma vez e siga para a próxima.`
                };
            }
            if (ctx.doneCount()) {
                const date = upcoming
                    ? `em ${new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(new Date(upcoming))}`
                    : "em breve";
                return {
                    heading: "Pratique quando quiser",
                    description: `Próxima revisão ${date}. Você também pode praticar uma pergunta agora.`
                };
            }
            return {
                heading: "As revisões começam com seus exercícios",
                description: "Conclua um exercício para desbloquear a pergunta relacionada a ele."
            };
        }
        function currentAttempt(question) {
            const id = question.variant.variantId;
            const store = attempts();
            if (!store[id]) store[id] = selection.startAttempt(store, question.variant, Date.now())[id];
            return store[id];
        }
        function variantBody(question) {
            const attempt = currentAttempt(question);
            const draft = attempt.draft;
            return { answer: answerMarkup(question.variant, draft, ctx.esc), draft };
        }
        function questionMarkup(question) {
            const { exercise } = question;
            const stage = exercise.stage === "D" ? "DIAGNÓSTICO" : `ETAPA ${ctx.esc(exercise.stage || exercise.id.slice(0, 2))}`;
            const limit = question.limitNote ? `<p class="review-limit" role="note">${ctx.esc(question.limitNote)}</p>` : "";
            if (question.kind === "variant") {
                const { answer } = variantBody(question);
                return `
        <section
          class="review-question">
          <div
            class="eyebrow">${ctx.esc(exercise.id)} · ${stage} · ${FORMAT_LABEL[question.variant.format]}
          </div>
          <h2>${ctx.renderInlineCode(question.variant.prompt)}
          </h2>
          ${answer}
          <div
            class="feedback"
            id="review-feedback"
            role="status"
            aria-live="polite">Responda sem abrir o exercício. Uma tentativa já ajuda a lembrar.
          </div>
          <div
            class="review-actions"><a
              class="hint-link"
              data-review-help
              href="#/javascript/${ctx.esc(exercise.id)}">Rever este exercício</a><span class="review-buttons"><button
              class="button-primary"
              data-review-check="variant">Conferir resposta <span
              aria-hidden="true">→</span></button><button
              class="button-primary"
              data-review-advance hidden>Próxima pergunta <span
              aria-hidden="true">→</span></button></span>
        </div>${limit}
        </section>`;
            }
            return `
        <section
          class="review-question">
          <div
            class="eyebrow">${ctx.esc(exercise.id)} · ${stage} · RECUPERAÇÃO ATIVA
          </div>
          <h2>${ctx.renderInlineCode(question.prompt)}
          </h2>
          <div
            class="answer-group"
            role="group"
            aria-label="Escolha uma resposta">${question.choices.map((choice, index) => `<button
        class="answer-option"
        data-review-choice="${index}"
        aria-pressed="false">${String.fromCharCode(65 + index)}. ${ctx.esc(choice)}</button>`).join("")}
          </div>
          <div
            class="feedback"
            id="review-feedback"
            role="status"
            aria-live="polite">Responda sem abrir o exercício. Uma tentativa já ajuda a lembrar.
          </div>
          <div
            class="review-actions"><a
              class="hint-link"
              href="#/javascript/${ctx.esc(exercise.id)}">Rever este exercício</a><button
              class="button-primary"
              data-review-check="${Number(question.answer)}">Conferir resposta <span
              aria-hidden="true">→</span></button>
        </div>${limit}
        </section>`;
        }
        function renderReview() {
            ctx.setBreadcrumb("Revisão");
            variantsReady();
            if (!ctx.reviewSession)
                ctx.reviewSession = reviewSet();
            const questions = ctx.reviewSession;
            const completedReview = ctx.reviewQuestionIndex >= questions.length;
            const dueCount = ctx.dueExercises().length;
            const upcoming = ctx.nextReviewDate();
            const question = questions[ctx.reviewQuestionIndex];
            const empty = !questions.length;
            const { heading, description } = reviewSummary(questions.length, completedReview, dueCount, upcoming);
            let content = "";
            if (empty)
                content = `
        <section
          class="review-done"><span
            class="done-icon">✳</span>
          <h2>Seu primeiro conceito está esperando.
          </h2>
          <p>Conclua um exercício e registre sua explicação final. A pergunta correspondente aparece aqui no intervalo de revisão.
          </p><a
            class="button-primary"
            href="#/javascript/D.01">Começar pelo diagnóstico D.01 <span
              aria-hidden="true">→</span></a>
        </section>`;
            else if (completedReview)
                content = `
        <section
          class="review-done"><span
            class="done-icon">✳</span>
          <h2>Revisão concluída.
          </h2>
          <p>Você respondeu ${questions.length} ${questions.length === 1 ? "pergunta" : "perguntas"} nesta rodada.${dueCount ? ` Ainda há ${dueCount} revisões vencidas.` : " As próximas perguntas aparecem no intervalo agendado."}
          </p>${dueCount ? `<button
        type="button"
        class="button-primary" data-review-next-batch>Continuar para a próxima rodada <span
          aria-hidden="true">→</span></button>` : `<a
        class="button-primary"
        href="#/catalog">Voltar aos exercícios <span
          aria-hidden="true">→</span></a>`}
        </section>`;
            else
                content = questionMarkup(question);
            ctx.view.innerHTML = `
        <section
          class="page-intro">
          <div
            class="eyebrow">RECUPERE, NÃO APENAS RELEIA
          </div>
          <h1>Revisão em pequenos passos<span
              class="brand-period">.</span>
          </h1>
          <p>Cada exercício de JavaScript concluído tem uma pergunta de revisão vinculada. Responda de memória e retome o código quando quiser.
          </p>
          <p class="review-katas-link"><a class="hint-link" href="#/katas">Praticar katas por faixa</a></p>
        </section>
        <section
          class="review-banner">
          <div
            class="review-icon"
            aria-hidden="true">↻
          </div>
          <div>
            <h2>${heading}
            </h2>
            <p>${description}
            </p>
          </div><span
            class="review-progress">${empty ? "0 / 0" : completedReview ? "FEITO" : dueCount ? `${Math.min(ctx.reviewQuestionIndex + 1, questions.length)} / ${questions.length}` : "PRÁTICA"}</span>
          </section>${content}`;
            bindQuestion(question, completedReview || empty);
        }
        function bindQuestion(question, finished) {
            if (finished || !question || question.kind !== "variant") return;
            const draft = document.querySelector("[data-review-draft]");
            if (draft) {
                draft.addEventListener("input", () => {
                    currentAttempt(question).draft = selection.clampDraft(draft.value);
                    scheduleDraftSave();
                });
            }
            document.querySelector("[data-review-help]")?.addEventListener("click", () => {
                currentAttempt(question).usedHelp = true;
                persist();
            });
            document.querySelector("[data-review-advance]")?.addEventListener("click", () => advance(question));
        }
        function setFeedback(text, isError) {
            const feedback = document.querySelector("#review-feedback");
            if (!feedback) return;
            feedback.textContent = text;
            feedback.classList.toggle("error", Boolean(isError));
        }
        // Advances to the next question after a graded check. Completes the round when the last question is passed.
        function advance(question) {
            clearTimeout(saveTimer);
            ctx.reviewQuestionIndex += 1;
            if (question.scheduled && ctx.reviewQuestionIndex >= ctx.reviewSession.length)
                ctx.progress.lastReview = new Date().toLocaleDateString("sv-SE");
            persist();
            renderReview();
        }
        function readDraft(question) {
            if (question.variant.format === "choice-predict") {
                const selected = document.querySelector("[data-review-choice][aria-pressed=true]");
                return selected ? selection.clampDraft(selected.dataset.reviewChoice) : "";
            }
            return selection.clampDraft(document.querySelector("[data-review-draft]")?.value ?? "");
        }
        function runners() { return createRunners(); }
        // Opt-in control for an optional activity the learner has already completed. It only changes the review pool.
        function mountOptIn(root, item) {
            if (!root || !item || item.optional !== true || !ctx.isExerciseDone(item.id)) return;
            const checked = ctx.reviewOptIn === true;
            const panel = document.createElement("section");
            panel.className = "review-optin";
            panel.setAttribute("aria-labelledby", "review-optin-title");
            panel.innerHTML = `<h2 id="review-optin-title">Revisões</h2>
          <label class="review-optin-control"><input type="checkbox" data-review-opt-in ${checked ? "checked" : ""} aria-describedby="review-optin-help"><span>Incluir atividades opcionais concluídas nas minhas revisões</span></label>
          <p id="review-optin-help" class="review-optin-help">Vale para esta e para as demais atividades opcionais já concluídas. A escolha só muda as perguntas de revisão; não altera seu progresso nem conta como exercício obrigatório.</p>
          <p class="review-optin-status" data-review-opt-in-status role="status" aria-live="polite"></p>`;
            root.appendChild(panel);
        }
        function handleOptInChange(event) {
            const input = event.target;
            if (!input || !input.matches || !input.matches("[data-review-opt-in]")) return false;
            ctx.progress.reviewOptIn = input.checked === true;
            ctx.saveProgress();
            const status = document.querySelector("[data-review-opt-in-status]");
            if (status) status.textContent = input.checked ? "Atividades opcionais concluídas entram nas revisões." : "Atividades opcionais saem das revisões.";
            return true;
        }
        let checking = false;
        async function checkVariant(question) {
            if (checking) return;
            const { variant } = question;
            const draft = readDraft(question);
            const attempt = currentAttempt(question);
            // The chosen variant and the draft are saved before anything runs, so a reload resumes this attempt.
            attempt.draft = draft;
            persist();
            checking = true;
            const button = document.querySelector("[data-review-check]");
            if (button) button.disabled = true;
            let graded;
            try { graded = await selection.grade(variant, draft, runners()); }
            finally { checking = false; if (button) button.disabled = false; }
            if (graded.result === null) {
                setFeedback(graded.feedback, true);
                return;
            }
            // Grading records the schedule and history only on the first check; retries update the draft and status.
            const recorded = selection.recordCheck({
                schedule: ctx.progress.reviewSchedule?.[question.exercise.id], attempt, variant, draft,
                result: graded.result, now: Date.now(), scheduled: question.scheduled
            });
            attempts()[variant.variantId] = recorded.attempt;
            if (recorded.firstCheck && question.scheduled) {
                ctx.progress.reviewSchedule ||= {};
                ctx.progress.reviewSchedule[question.exercise.id] = recorded.schedule;
            }
            else if (recorded.firstCheck) {
                ctx.progress.reviewIndex = (Math.max(0, Math.trunc(Number(ctx.progress.reviewIndex) || 0)) + 1) % Math.max(ctx.doneCount(), 1);
            }
            question.checked = true;
            persist();
            const passed = graded.result === "passed";
            const retry = !passed && question.scheduled && recorded.firstCheck ? " Esta pergunta volta amanhã; siga para a próxima." : "";
            setFeedback(`${graded.feedback}${retry}`, !passed);
            document.querySelectorAll("[data-review-choice][aria-pressed=true]").forEach(option => option.classList.add(passed ? "correct" : "incorrect"));
            if (button) button.textContent = "Conferir de novo";
            const advanceButton = document.querySelector("[data-review-advance]");
            if (advanceButton) {
                advanceButton.hidden = false;
                advanceButton.textContent = ctx.reviewQuestionIndex + 1 >= ctx.reviewSession.length ? "Ver rodada concluída →" : "Próxima pergunta →";
            }
        }
        function checkLegacy(question, answer) {
            const selected = document.querySelector("[data-review-choice][aria-pressed=true]");
            const feedback = document.querySelector("#review-feedback");
            if (!selected) {
                feedback.textContent = "Escolha uma resposta antes de continuar.";
                feedback.classList.add("error");
                return;
            }
            const correct = Number(selected.dataset.reviewChoice) === Number(answer);
            selected.classList.add(correct ? "correct" : "incorrect");
            feedback.innerHTML = ctx.renderInlineCode(correct ? question.correctFeedback : question.incorrectFeedback);
            feedback.classList.toggle("error", !correct);
            if (question.scheduled) {
                ctx.progress.reviewSchedule ||= {};
                ctx.progress.reviewSchedule[question.exercise.id] = ctx.reviewSchedule.next(ctx.progress.reviewSchedule[question.exercise.id], correct);
            }
            else {
                const completedCount = Math.max(ctx.doneCount(), 1);
                const currentReviewIndex = Math.max(0, Math.trunc(Number(ctx.progress.reviewIndex) || 0)) % completedCount;
                ctx.progress.reviewIndex = (currentReviewIndex + 1) % completedCount;
            }
            ctx.reviewQuestionIndex += 1;
            if (question.scheduled && ctx.reviewQuestionIndex >= ctx.reviewSession.length)
                ctx.progress.lastReview = new Date().toLocaleDateString("sv-SE");
            ctx.saveProgress();
            ctx.updateNav("review");
            document.querySelectorAll("[data-review-choice]").forEach((button) => { button.disabled = true; });
            const button = document.querySelector("[data-review-check]");
            button.disabled = false;
            button.removeAttribute("data-review-check");
            button.textContent = ctx.reviewQuestionIndex >= ctx.reviewSession.length ? "Ver rodada concluída →" : "Próxima pergunta →";
            if (!correct && question.scheduled)
                feedback.innerHTML += ctx.renderInlineCode(" Esta pergunta volta amanhã; siga para a próxima.");
            button.addEventListener("click", () => renderReview(), { once: true });
        }
        function checkReview(answer) {
            const question = ctx.reviewSession?.[ctx.reviewQuestionIndex];
            if (!question) return;
            if (question.kind === "variant") return checkVariant(question);
            return checkLegacy(question, answer);
        }
        return Object.freeze({ reviewSet, reviewSummary, renderReview, checkReview, variantsReady, mountOptIn, handleOptInChange });
    }
    // loadVariantBank, answerMarkup and createRunners are shared with the kata route (public/kata-controller.js).
    global.DevPathReviewController = Object.freeze({ create, loadVariantBank, answerMarkup, createRunners, FORMAT_LABEL });
})(window);
