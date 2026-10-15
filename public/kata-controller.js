(function (global) {
    "use strict";
    // Katas por faixa (Fase 6.3). Sessões são montadas por public/kata-selector.js a partir do banco de variantes e
    // apresentadas com os mesmos renderizadores de resposta da revisão (DevPathReviewController.answerMarkup) e a mesma
    // avaliação (DevPathReviewSelection.grade, que passa por DevPathAssessment.run). Katas registram tentativas em
    // reviewAttempts sob chaves próprias; nunca movem reviewSchedule nem concedem `demonstrated`.
    // Injected dependencies: curriculumActivities, esc, isExerciseDone, progress, renderInlineCode, reviewOptIn, saveProgress, setBreadcrumb, view.
    const SAVE_DELAY_MS = 800;
    const ROUTE = /^#\/katas(?:\/(\d{2}))?$/;
    const REASONS = Object.freeze({
        "invalid-band": "Esta faixa não existe.",
        "no-eligible-variants": "Nenhuma kata desta faixa tem todos os pré-requisitos estudados ainda. Estude mais etapas para liberar.",
        "all-eligible-rejected": "As katas desta faixa ainda não passaram na verificação do enunciado.",
        "limit-too-small-to-mix": "Esta sessão precisa de pelo menos duas katas para intercalar conceitos."
    });
    const EMPTY_BANK = "Ainda não há katas publicadas.";

    function create(ctx) {
        const selector = () => global.DevPathKataSelector;
        const selection = () => global.DevPathReviewSelection;
        const review = () => global.DevPathReviewController;
        let bank = null;
        let bankPromise = null;
        let state = emptyState();
        let saveTimer = null;
        let checking = false;

        function emptyState() { return { band: null, round: 0, items: [], index: 0, session: null }; }
        function persist() { ctx.saveProgress(); }
        function scheduleDraftSave() { clearTimeout(saveTimer); saveTimer = setTimeout(persist, SAVE_DELAY_MS); }
        function flushDraft() { if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; persist(); } }

        // The bank is requested only when this route renders; the review controller's cache is shared.
        function ensureBank() {
            if (!bankPromise) {
                bankPromise = (review()?.loadVariantBank ? review().loadVariantBank() : Promise.resolve([]))
                    .then(list => { bank = Array.isArray(list) ? list : []; });
            }
            return bankPromise;
        }
        // Same runtime test as the review: which answer formats this browser can execute.
        function executorsNow() {
            const behavior = new Set();
            if (global.DevPathCourseRunner?.run && global.DevPathModuleGraph?.buildModuleGraph && global.DevPathAssessment?.run) behavior.add("javascript");
            if (global.DevPathDomRunner?.run && global.DevPathAssessment?.run) behavior.add("dom");
            return { snippet: Boolean(global.DevPathCourseRunner?.run), behavior };
        }
        function studiedIds() { return new Set(ctx.curriculumActivities.filter(item => ctx.isExerciseDone(item.id)).map(item => item.id)); }
        function activityTitles() { return new Map(ctx.curriculumActivities.map(item => [item.id, item.title])); }
        // Katas that touch an optional activity follow the same opt-in as the review.
        function usableVariants() {
            const optional = new Set(ctx.curriculumActivities.filter(item => item.optional === true).map(item => item.id));
            const executors = executorsNow();
            const optIn = ctx.reviewOptIn === true;
            return (bank || [])
                .filter(variant => selection().formatAllowed(variant, executors))
                .filter(variant => optIn || ![variant.sourceActivityId, ...variant.prerequisites].some(id => optional.has(id)));
        }
        function sessionFor(band, round) {
            // Deterministic per band, local day and round, so a reload shows the same session and keeps its attempts.
            const text = `${band}|${new Date().toLocaleDateString("sv-SE")}|${round}`;
            let seed = 2166136261;
            for (const char of text) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
            return selector().selectSession({ variants: usableVariants(), band, studied: studiedIds(), seed: seed >>> 0, activityTitles: activityTitles() });
        }
        function availability() {
            const variants = usableVariants();
            const studied = studiedIds();
            const titles = activityTitles();
            return selector().BANDS.map(band => ({ band, session: selector().selectSession({ variants, band, studied, seed: 0, activityTitles: titles }) }));
        }
        function reasonFor(session) {
            if (!bank?.length) return EMPTY_BANK;
            return REASONS[session?.reason] || "Nenhuma kata disponível nesta faixa agora.";
        }

        // Kata attempts live under their own keys in reviewAttempts. They are created when the learner answers, not when a session opens.
        function attemptsStore() { ctx.progress.reviewAttempts ||= {}; return ctx.progress.reviewAttempts; }
        function attemptOf(item) { return attemptsStore()[selection().kataAttemptKey(item)] || null; }
        function ensureAttempt(item) {
            const key = selection().kataAttemptKey(item);
            if (!attemptsStore()[key]) ctx.progress.reviewAttempts = selection().startKataAttempt(attemptsStore(), item, Date.now());
            return attemptsStore()[key];
        }
        function currentItem() { return state.items[state.index] || null; }

        function startSession(band, fresh) {
            const session = sessionFor(band, state.round);
            state.band = band;
            state.session = session;
            state.items = session.items;
            state.index = 0;
            // A new round starts its katas over: their previous attempts are removed, the rest of the store is untouched.
            if (fresh) {
                for (const item of state.items) delete attemptsStore()[selection().kataAttemptKey(item)];
                persist();
            }
        }

        function readDraft(item) {
            if (item.format === "choice-predict") {
                const selected = ctx.view.querySelector("[data-review-choice][aria-pressed=true]");
                return selected ? selection().clampDraft(selected.dataset.reviewChoice) : "";
            }
            return selection().clampDraft(ctx.view.querySelector("[data-review-draft]")?.value ?? "");
        }
        function setFeedback(text, isError) {
            const feedback = ctx.view.querySelector("#kata-feedback");
            if (!feedback) return;
            feedback.textContent = text;
            feedback.classList.toggle("error", Boolean(isError));
        }
        function setCheckLabel(text) {
            const button = ctx.view.querySelector("[data-kata-check]");
            if (button) button.innerHTML = `${text} <span aria-hidden="true">→</span>`;
        }
        function showAdvance() {
            const button = ctx.view.querySelector("[data-kata-advance]");
            if (button) button.hidden = false;
        }

        // Grades the learner's answer with the review's own grader and records the attempt. The schedule is never touched.
        async function check() {
            const item = currentItem();
            if (!item || checking) return;
            const draft = readDraft(item);
            const key = selection().kataAttemptKey(item);
            ensureAttempt(item).draft = draft;
            persist();
            checking = true;
            const stillHere = () => currentItem() === item && Boolean(ctx.view.querySelector("#kata-feedback"));
            let graded;
            try {
                graded = await selection().grade(item, draft, review().createRunners());
            }
            catch {
                graded = { result: null, feedback: "A execução não está disponível agora. Tente de novo em instantes." };
            }
            finally { checking = false; }
            if (graded.result === null) {
                if (stillHere()) setFeedback(graded.feedback, true);
                return;
            }
            const recorded = selection().recordCheck({
                schedule: null, attempt: ensureAttempt(item), variant: item, draft,
                result: graded.result, now: Date.now(), scheduled: false
            });
            attemptsStore()[key] = recorded.attempt;
            persist();
            if (!stillHere()) return;
            const passed = graded.result === "passed";
            setFeedback(graded.feedback, !passed);
            ctx.view.querySelectorAll("[data-review-choice][aria-pressed=true]").forEach(option => option.classList.add(passed ? "correct" : "incorrect"));
            setCheckLabel("Conferir de novo");
            showAdvance();
        }

        function advance() {
            flushDraft();
            state.index += 1;
            renderSession();
            ctx.view.querySelector("#kata-prompt")?.focus();
        }

        function newRound() {
            if (!state.band) return;
            flushDraft();
            state.round += 1;
            startSession(state.band, true);
            renderSession();
        }

        function introMarkup(heading, description, extraClass = "") {
            return `
        <section
          class="page-intro${extraClass ? ` ${extraClass}` : ""}">
          <div
            class="eyebrow">KATAS · PRATIQUE SEM O EXERCÍCIO AO LADO
          </div>
          <h1>${ctx.esc(heading)}<span
              class="brand-period">.</span>
          </h1>
          <p>${ctx.esc(description)}
          </p>
        </section>`;
        }

        function indexMarkup() {
            const rows = availability().map(({ band, session }) => {
                const usable = session.kind !== "empty";
                const count = session.items.length;
                const body = usable
                    ? `<p class="kata-status" id="kata-band-${band}-status">Disponível · ${count} ${count === 1 ? "kata" : "katas"} nesta sessão${session.concepts.length > 1 ? `, ${session.concepts.length} conceitos misturados` : ""}.</p>
              <a class="button-primary" href="#/katas/${band}" aria-describedby="kata-band-${band}-status">Abrir sessão <span aria-hidden="true">→</span></a>`
                    : `<p class="kata-status" id="kata-band-${band}-status"><strong>Bloqueada.</strong> ${ctx.esc(reasonFor(session))}</p>`;
                return `<li class="kata-band ${usable ? "is-available" : "is-blocked"}">
              <h2>Faixa ${ctx.esc(band)}</h2>
              ${body}
            </li>`;
            }).join("");
            return `${introMarkup("Katas por faixa", "Cada sessão mistura conceitos das etapas que você já estudou. Katas treinam transferência: o enunciado não nomeia o exercício de origem. Elas não contam como exercícios obrigatórios e não marcam nada como demonstrado.")}
        <ul class="kata-band-list" aria-label="Faixas de katas">${rows}</ul>`;
        }

        function emptyMarkup(session) {
            return `<section
          class="review-done"><span
            class="done-icon"
            aria-hidden="true">✳</span>
          <h2>Sem katas nesta faixa agora</h2>
          <p>${ctx.esc(reasonFor(session))}</p><a
            class="button-primary"
            href="#/katas">Ver todas as faixas <span
              aria-hidden="true">→</span></a>
        </section>`;
        }

        function summaryMarkup() {
            const attempts = state.items.map(item => attemptOf(item));
            const checked = attempts.filter(attempt => attempt?.finishedAt).length;
            const passed = attempts.filter(attempt => attempt?.finishedAt && attempt.status === "passed").length;
            return `<section
          class="review-done"><span
            class="done-icon"
            aria-hidden="true">✳</span>
          <h2>Sessão concluída</h2>
          <p>${passed} de ${state.items.length} katas passaram; ${checked} foram conferidas. O treino fica registrado, mas não altera seu progresso nem a revisão agendada.</p>
          <span class="review-buttons"><button
              type="button"
              class="button-primary"
              data-kata-round>Nova sessão com outras katas <span
                aria-hidden="true">→</span></button><a
              class="hint-link"
              href="#/katas">Voltar às faixas</a></span>
        </section>`;
        }

        function itemMarkup(item, position, total) {
            const attempt = attemptOf(item);
            const checked = Boolean(attempt?.finishedAt);
            const feedback = !checked
                ? "Responda de memória. Uma tentativa já ajuda a lembrar."
                : attempt.status === "passed"
                    ? "Você já conferiu esta kata e ela passou."
                    : "Você já conferiu esta kata. Corrija a resposta e confira de novo.";
            const last = position + 1 >= total;
            return `
        <section
          class="review-question kata-question">
          <div
            class="eyebrow">KATA ${position + 1} DE ${total} · ${ctx.esc(review().FORMAT_LABEL[item.format] || "")}
          </div>
          <h2
            id="kata-prompt"
            tabindex="-1">${ctx.renderInlineCode(item.prompt)}
          </h2>
          ${review().answerMarkup(item, attempt?.draft ?? "", ctx.esc)}
          <div
            class="feedback"
            id="kata-feedback"
            role="status"
            aria-live="polite">${ctx.esc(feedback)}
          </div>
          <div
            class="review-actions">
            <span class="review-buttons"><button
                type="button"
                class="button-primary"
                data-kata-check>${checked ? "Conferir de novo" : "Conferir resposta"} <span
                  aria-hidden="true">→</span></button><button
                type="button"
                class="button-primary"
                data-kata-advance ${checked ? "" : "hidden"}>${last ? "Ver resultado da sessão" : "Próxima kata"} <span
                  aria-hidden="true">→</span></button></span>
          </div>
        </section>`;
        }

        function renderSession() {
            const { band, session, items } = state;
            const count = items.length;
            const mixed = session && session.kind === "mixed";
            const description = mixed
                ? `Esta sessão intercala ${session.concepts.length} conceitos. Responda cada kata de memória e confira antes de seguir.`
                : "Responda cada kata de memória e confira antes de seguir.";
            const position = count && state.index < count ? `${state.index + 1} / ${count}` : count ? "FEITO" : "";
            const header = introMarkup(`Faixa ${band}`, description, "kata-session-intro");
            const banner = count ? `
        <section
          class="review-banner"
          aria-label="Andamento da sessão">
          <div
            class="review-icon"
            aria-hidden="true">✳
          </div>
          <div>
            <h2>Sessão de katas
            </h2>
            <p>${count} ${count === 1 ? "kata" : "katas"} nesta sessão.
            </p>
          </div><span
            class="review-progress">${position}</span>
        </section>` : "";
            let content;
            if (!count) content = emptyMarkup(session);
            else if (state.index >= count) content = summaryMarkup();
            else content = itemMarkup(items[state.index], state.index, count);
            ctx.view.innerHTML = `${header}${banner}${content}`;
        }

        // Entry point for the #/katas and #/katas/<band> routes. `band` comes from the route; invalid bands show the index.
        function render(band) {
            if (!bank) {
                ctx.setBreadcrumb("Revisão", "Katas");
                ctx.view.innerHTML = `<p class="kata-loading" role="status">Carregando katas…</p>`;
                ensureBank().then(() => {
                    const match = ROUTE.exec(location.hash);
                    if (match) render(match[1] || null);
                });
                return;
            }
            const validBand = selector().BANDS.includes(band) ? band : null;
            if (!validBand) {
                flushDraft();
                state = emptyState();
                ctx.setBreadcrumb("Revisão", "Katas");
                ctx.view.innerHTML = indexMarkup();
                return;
            }
            ctx.setBreadcrumb("Revisão", "Katas", `Faixa ${validBand}`);
            if (state.band !== validBand) {
                flushDraft();
                state = emptyState();
                startSession(validBand, false);
            }
            renderSession();
        }

        // Drops the in-memory session when the learner leaves the route. Stored attempts stay.
        function reset() {
            flushDraft();
            state = emptyState();
        }

        function handleClick(event) {
            const target = event.target;
            if (!target || typeof target.closest !== "function") return false;
            if (target.closest("[data-kata-check]")) { check(); return true; }
            if (target.closest("[data-kata-advance]")) { advance(); return true; }
            if (target.closest("[data-kata-round]")) { newRound(); return true; }
            return false;
        }

        function handleInput(event) {
            const field = event.target;
            if (!field || typeof field.matches !== "function" || !field.matches("[data-review-draft]")) return false;
            const item = currentItem();
            if (!item) return false;
            ensureAttempt(item).draft = selection().clampDraft(field.value);
            scheduleDraftSave();
            return true;
        }

        return Object.freeze({ render, reset, handleClick, handleInput });
    }

    global.DevPathKataController = Object.freeze({ create, REASONS });
})(window);
