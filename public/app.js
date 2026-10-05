(function () {
    "use strict";
    const view = document.querySelector("#view");
    const breadcrumb = document.querySelector("#breadcrumbs");
    if (!view || !breadcrumb)
        return;
    const contracts = {
        DevPathSyncNotifications: ["create"],
        DevPathAppRouter: ["create"],
        DevPathCatalogView: ["create"],
        DevPathReviewController: ["create"],
        DevPathCourseController: ["create"],
        DevPathStageRegistry: ["create"],
        DevPathModuleGraph: ["buildModuleGraph"],
        DevPathProgressMigrations: ["stage01"],
        DevPathStage00UI: ["renderExercise", "handleClick", "handleInput", "handleDrag", "flushDraft"],
        DevPathStage00Preparation: ["render", "sync", "handleClick", "handleInput"],
        DevPathStage01UI: ["render", "complete", "handleClick", "handleInput"],
        DevPathStage02UI: ["render", "complete", "handleClick", "handleInput"],
        DevPathStage03UI: ["render", "complete", "handleClick", "handleInput"],
        DevPathDiagnosticUI: ["render", "handleClick", "handleInput"],
        DevPathReviewSchedule: ["initial", "next"],
        DevPathCourseRunner: ["run"],
        DevPathProgressModel: ["create"],
        DevPathProgressSync: ["create"],
        DevPathTeachingUtils: ["escapeHTML"]
    };
    const missing = Object.entries(contracts).filter(([name, methods]) => methods.some(method => typeof window[name]?.[method] !== "function")).map(([name]) => name);
    if (!Array.isArray(window.DevPathStage00UI?.activities))
        missing.push("DevPathStage00UI.activities");
    if (missing.length) {
        view.setAttribute("role", "alert");
        view.textContent = `Não foi possível carregar ${missing.join(", ")}. Atualize a página para tentar novamente.`;
        return;
    }
    const stage00UI = window.DevPathStage00UI;
    const reviewSchedule = window.DevPathReviewSchedule;
    const courseRunner = window.DevPathCourseRunner;
    const blankProgress = window.DevPathProgressModel.create;
    const limits = window.DevPathProgressModel.limits;
    const localPreview = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
    const localProgressKey = "devpath-local-preview-v1";
    let progress = blankProgress();
    let activityById;
    let curriculumActivities = stage00UI.activities.map(item => ({ ...item, stage: item.id.slice(0, 2) }));
    let selectedCatalogFilter = "Todas";
    let selectedStageFilter = "Todas";
    let catalogSearch = "";
    let reviewQuestionIndex = 0;
    let reviewSession = null;
    let toastTimer;
    let courseSaveTimer;
    let cancelCourseRun;
    const appContext = {
        get view() { return view; },
        get progressSync() { return progressSync; },
        get render() { return render; },
        get curriculumActivities() { return curriculumActivities; }, set curriculumActivities(value) { curriculumActivities = value; },
        get esc() { return esc; },
        get breadcrumb() { return breadcrumb; },
        get dueExercises() { return dueExercises; },
        get setBreadcrumb() { return setBreadcrumb; },
        get requiredActivities() { return requiredActivities; },
        get isExerciseDone() { return isExerciseDone; },
        get doneCount() { return doneCount; },
        get percentDone() { return percentDone; },
        get progress() { return progress; }, set progress(value) { progress = value; },
        get catalogSearch() { return catalogSearch; }, set catalogSearch(value) { catalogSearch = value; },
        get selectedStageFilter() { return selectedStageFilter; }, set selectedStageFilter(value) { selectedStageFilter = value; },
        get selectedCatalogFilter() { return selectedCatalogFilter; }, set selectedCatalogFilter(value) { selectedCatalogFilter = value; },
        get renderInlineCode() { return renderInlineCode; },
        get reviewSession() { return reviewSession; }, set reviewSession(value) { reviewSession = value; },
        get reviewQuestionIndex() { return reviewQuestionIndex; }, set reviewQuestionIndex(value) { reviewQuestionIndex = value; },
        get nextReviewDate() { return nextReviewDate; },
        get reviewSchedule() { return reviewSchedule; },
        get saveProgress() { return saveProgress; },
        get updateNav() { return updateNav; },
        get exerciseProgressKey() { return exerciseProgressKey; },
        get limits() { return limits; },
        get toast() { return toast; },
        get activityById() { return activityById; }, set activityById(value) { activityById = value; },
        get courseSaveTimer() { return courseSaveTimer; }, set courseSaveTimer(value) { courseSaveTimer = value; },
        get cancelCourseRun() { return cancelCourseRun; }, set cancelCourseRun(value) { cancelCourseRun = value; },
        get courseRunner() { return courseRunner; }
    };
    const syncNotificationsController = window.DevPathSyncNotifications.create(appContext);
    const appRouterController = window.DevPathAppRouter.create(appContext);
    const catalogViewController = window.DevPathCatalogView.create(appContext);
    const reviewController = window.DevPathReviewController.create(appContext);
    const courseController = window.DevPathCourseController.create(appContext);
    const progressSync = window.DevPathProgressSync.create({
        snapshot: () => JSON.stringify(progress),
        status: setSaveStatus,
        issue: showSyncIssue
    });
    function showSyncIssue(...args) { return syncNotificationsController.showSyncIssue(...args); }
    function setSaveStatus(...args) { return syncNotificationsController.setSaveStatus(...args); }
    function saveProgress() {
        if (!localPreview && !progressSync.loaded)
            return;
        setSaveStatus("salvando…");
        const snapshot = JSON.stringify(progress);
        if (localPreview) {
            try {
                localStorage.setItem(localProgressKey, snapshot);
                setSaveStatus("salvo neste navegador");
            }
            catch {
                setSaveStatus("falha ao salvar localmente");
            }
            return;
        }
        progressSync.save(snapshot);
    }
    function validCatalog(catalog) {
        return Array.isArray(catalog) && catalog.length > 0 &&
            new Set(catalog.map(item => item?.id)).size === catalog.length &&
            catalog.every(item => item && /^(?:D|\d{2})\.\d{2}$/.test(item.id) &&
                item.stage === item.id.split(".")[0] && typeof item.title === "string" &&
                typeof item.firstResponse?.action === "string" && Array.isArray(item.starterFiles) &&
                item.starterFiles.every(file => typeof file?.path === "string" && typeof file.content === "string") &&
                typeof item.review?.prompt === "string" && Array.isArray(item.review.choices) &&
                item.review.choices.every(choice => typeof choice === "string") &&
                Number.isInteger(item.review.answer) && item.review.answer >= 0 &&
                item.review.answer < item.review.choices.length &&
                typeof item.review.correctFeedback === "string" && typeof item.review.incorrectFeedback === "string" &&
                item.learner === undefined);
    }
    function catalogStageLabel(...args) { return catalogViewController.catalogStageLabel(...args); }
    async function initialize() {
        try {
            const response = await fetch("/course-catalog.json", { cache: "no-store" });
            if (response.ok) {
                const catalog = await response.json();
                if (validCatalog(catalog)) {
                    curriculumActivities = catalog;
                }
            }
        }
        catch { /* Keep the existing starter catalog if the expanded course asset is unavailable. */ }
        activityById = new Map(curriculumActivities.map(item => [item.id, item]));
        const pathSummary = document.querySelector(".side-path small");
        if (pathSummary)
            pathSummary.textContent = `${catalogStageLabel()} · ${curriculumActivities.length} atividades`;
        if (localPreview) {
            try {
                progress = { ...blankProgress(), ...JSON.parse(localStorage.getItem(localProgressKey) || "{}") };
            }
            catch {
                progress = blankProgress();
            }
            setSaveStatus("prévia local · progresso neste navegador");
            document.querySelector(".site-footer > span:last-child").textContent = "Prévia local: seu progresso fica neste navegador.";
            render();
            return;
        }
        try {
            progress = { ...blankProgress(), ...await progressSync.load() };
            setSaveStatus("progresso sincronizado");
        }
        catch {
            setSaveStatus("erro de sincronização");
            view.setAttribute("role", "alert");
            view.textContent = "Não foi possível carregar seu progresso. Atualize a página para tentar novamente.";
            return;
        }
        render();
        try {
            const response = await fetch("/api/profile", { cache: "no-store" });
            if (!response.ok)
                return;
            const { displayName, email } = await response.json();
            const profile = document.querySelector(".profile-row > span");
            const avatar = document.querySelector(".profile-row .avatar");
            profile.innerHTML = `<strong>${esc(displayName)}</strong><small>${esc(email)}</small>`;
            avatar.textContent = Array.from(displayName)[0]?.toLocaleUpperCase("pt-BR") || "D";
        }
        catch { /* The protected app can load without optional profile display. */ }
    }
    function recordActiveDay() {
        if (!localPreview && !progressSync.ready)
            return;
        const today = new Date().toLocaleDateString("sv-SE");
        if (!progress.activeDays.includes(today)) {
            progress.activeDays.push(today);
            progress.activeDays = progress.activeDays.slice(-limits.activeDays);
            saveProgress();
        }
    }
    const esc = window.DevPathTeachingUtils.escapeHTML;
    function renderInlineCode(value) {
        return esc(value).replace(/(^|[^`])`([^`\r\n]+)`(?!`)/g, (_, before, code) => `${before}<code>${code}</code>`);
    }
    function toast(message) {
        const el = document.querySelector("#toast");
        el.textContent = message;
        el.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove("show"), 2500);
    }
    function setBreadcrumb(...args) { return appRouterController.setBreadcrumb(...args); }
    function updateNav(...args) { return appRouterController.updateNav(...args); }
    function routeInfo(...args) { return appRouterController.routeInfo(...args); }
    function exerciseProgressKey(item) {
        if (!item)
            return "";
        return Number(item.contentVersion || 1) > 1 ? `${esc(item.id)}@v${item.contentVersion}` : item.id;
    }
    function isExerciseDone(id) {
        const item = activityById.get(id);
        const adapter = stageRegistry.resolve(item);
        if (adapter.complete)
            return adapter.complete(item, progress);
        const version = Number(item?.contentVersion || 1);
        return progress.answers?.[id] === true && (version === 1 || Number(progress.exerciseVersions?.[id] || 1) === version);
    }
    function requiredActivities() { return curriculumActivities.filter((item) => item.optional !== true); }
    function doneCount() { return requiredActivities().filter((item) => isExerciseDone(item.id)).length; }
    function percentDone() { const required = requiredActivities(); return required.length ? Math.round(doneCount() / required.length * 100) : 0; }
    function dueExercises() { return requiredActivities().filter((item) => isExerciseDone(item.id) && Number(progress.reviewSchedule?.[item.id]?.dueAt || Infinity) <= Date.now()); }
    function nextReviewDate() {
        const dates = requiredActivities().filter((item) => isExerciseDone(item.id)).map((item) => Number(progress.reviewSchedule?.[item.id]?.dueAt || Infinity));
        return dates.length ? Math.min(...dates) : null;
    }
    function render() {
        if (!localPreview && !progressSync.loaded)
            return;
        courseController.dispose();
        stage00UI.flushDraft(stageContext());
        recordActiveDay();
        const route = routeInfo();
        if (route.name !== "review") {
            reviewSession = null;
            reviewQuestionIndex = 0;
        }
        updateNav(route.name);
        if (route.name === "home")
            renderHome();
        if (route.name === "catalog")
            renderCatalog();
        if (route.name === "javascript") {
            if (route.id)
                renderJavaScriptExercise(route.id);
            else
                renderJavaScriptOverview();
        }
        if (route.name === "review")
            renderReview();
        window.DevPathLearningJourney?.sync(view);
        document.querySelector("#main").focus({ preventScroll: true });
    }
    function stageContext() { return { progress, activities: curriculumActivities, saveProgress, scheduleSave: scheduleCourseSave, render, toast }; }
    const stageRegistry = window.DevPathStageRegistry.create([
        ["D", window.DevPathDiagnosticUI],
        ["00", {
                render: (item, ctx) => item.preparation ? window.DevPathStage00Preparation.render(item, ctx) : stage00UI.renderExercise(item.id, ctx.progress),
                sync: (item, ctx) => { if (item.preparation)
                    window.DevPathStage00Preparation.sync(item, ctx); },
                handleClick: (event, item, ctx) => item.preparation && window.DevPathStage00Preparation.handleClick(event, item, ctx),
                handleInput: (event, item, ctx) => item.preparation && window.DevPathStage00Preparation.handleInput(event, item, ctx)
            }],
        ["01", window.DevPathStage01UI], ["02", window.DevPathStage02UI], ["03", window.DevPathStage03UI]
    ], { render: item => renderCurriculumLesson(item) });
    function dispatchStageEvent(event) {
        const route = routeInfo();
        if (route.name !== "javascript" || !route.id)
            return false;
        const item = activityById?.get(route.id);
        if (!item)
            return false;
        const adapter = stageRegistry.resolve(item);
        const name = event.type === "click" ? "handleClick" : "handleInput";
        if (event.type === "change" && !["D", "01", "03"].includes(item.stage))
            return false;
        if (adapter[name]?.(event, item, stageContext()))
            return true;
        if (event.type === "click" && stage00UI.handleClick(event, stageContext())) {
            event.preventDefault();
            return true;
        }
        return event.type === "input" && stage00UI.handleInput(event, stageContext());
    }
    function renderJavaScriptOverview() {
        renderCatalog();
    }
    function renderJavaScriptExercise(id) {
        const item = activityById.get(id);
        if (!item) {
            location.hash = "#/javascript";
            return;
        }
        setBreadcrumb("JavaScript", item.stage === "D" ? "Diagnóstico" : `Etapa ${item.stage || item.id.slice(0, 2)}`, item.title);
        const adapter = stageRegistry.resolve(item);
        view.innerHTML = adapter.render(item, stageContext());
        adapter.sync?.(item, stageContext());
    }
    function renderHome(...args) { return catalogViewController.renderHome(...args); }
    function renderCatalog(...args) { return catalogViewController.renderCatalog(...args); }
    function updateCatalogResults(...args) { return catalogViewController.updateCatalogResults(...args); }
    function renderCurriculumLesson(...args) { return courseController.renderCurriculumLesson(...args); }
    function saveCourseDraft(...args) { return courseController.saveCourseDraft(...args); }
    function scheduleCourseSave(...args) { return courseController.scheduleCourseSave(...args); }
    function syncCourseCompletionButton(...args) { return courseController.syncCourseCompletionButton(...args); }
    function runCourseJavaScript(...args) { return courseController.runCourseJavaScript(...args); }
    function submitGuidedWriting(...args) { return courseController.submitGuidedWriting(...args); }
    function completeCourseExercise(...args) { return courseController.completeCourseExercise(...args); }
    function renderReview(...args) { return reviewController.renderReview(...args); }
    function checkReview(...args) { return reviewController.checkReview(...args); }
    view.addEventListener("click", async (event) => {
        if (dispatchStageEvent(event))
            return;
        const nextReviewBatch = event.target.closest("[data-review-next-batch]");
        if (nextReviewBatch) {
            reviewSession = null;
            reviewQuestionIndex = 0;
            renderReview();
            return;
        }
        const firstResponse = event.target.closest("[data-course-first-response]");
        if (firstResponse) {
            const id = firstResponse.dataset.courseFirstResponse;
            const response = view.querySelector(`[data-first-response-input="${esc(id)}"]`)?.value.trim() || "";
            if (!response) {
                toast("Registre uma primeira resposta antes de abrir a explicação.");
                return;
            }
            progress.exercisePredictions ||= {};
            const item = activityById.get(id);
            const key = exerciseProgressKey(item);
            progress.exercisePredictions[key] = response.slice(0, limits.predictionChars);
            progress.warmupCompleted ||= {};
            progress.warmupCompleted[key] = true;
            saveProgress();
            render();
            return;
        }
        const completeActivity = event.target.closest("[data-course-complete]");
        if (completeActivity) {
            completeCourseExercise(completeActivity.dataset.courseComplete);
            return;
        }
        const runActivity = event.target.closest("[data-course-run]");
        if (runActivity) {
            runCourseJavaScript(runActivity.dataset.courseRun);
            return;
        }
        const writtenActivity = event.target.closest("[data-course-submit-writing]");
        if (writtenActivity) {
            submitGuidedWriting(writtenActivity.dataset.courseSubmitWriting);
            return;
        }
        const filter = event.target.closest("[data-filter]");
        if (filter) {
            selectedCatalogFilter = filter.dataset.filter;
            renderCatalog();
            return;
        }
        const reviewChoice = event.target.closest("[data-review-choice]");
        if (reviewChoice) {
            document.querySelectorAll("[data-review-choice]").forEach((button) => { button.setAttribute("aria-pressed", String(button === reviewChoice)); button.classList.remove("correct", "incorrect"); });
            return;
        }
        const reviewCheck = event.target.closest("[data-review-check]");
        if (reviewCheck)
            checkReview(reviewCheck.dataset.reviewCheck);
    });
    view.addEventListener("input", (event) => {
        if (dispatchStageEvent(event))
            return;
        if (event.target.matches("#course-search")) {
            catalogSearch = event.target.value;
            updateCatalogResults();
            return;
        }
        if (event.target.matches("[data-course-editor]")) {
            saveCourseDraft(event.target.dataset.courseEditor);
            scheduleCourseSave();
            return;
        }
        if (event.target.matches("[data-course-reflection]")) {
            const id = event.target.dataset.courseReflection;
            progress.exerciseReflections ||= {};
            const item = activityById.get(id);
            progress.exerciseReflections[exerciseProgressKey(item)] = event.target.value.slice(0, limits.reflectionChars);
            const count = view.querySelector("[data-course-reflection-count]");
            const button = view.querySelector(`[data-course-complete="${esc(id)}"]`);
            if (count)
                count.textContent = `${event.target.value.trim().length}/16 caracteres`;
            if (button)
                button.disabled = event.target.value.trim().length < 16;
            scheduleCourseSave();
            syncCourseCompletionButton(id);
            return;
        }
    });
    view.addEventListener("change", (event) => {
        if (dispatchStageEvent(event))
            return;
        if (event.target.matches("[data-course-rubric]")) {
            const id = event.target.dataset.courseRubric;
            const selected = [...view.querySelectorAll(`[data-course-rubric="${esc(id)}"]:checked`)].map((input) => Number(input.value));
            progress.exerciseEvidence ||= {};
            const item = activityById.get(id);
            const key = exerciseProgressKey(item);
            progress.exerciseEvidence[key] = { ...progress.exerciseEvidence[key], rubric: selected };
            scheduleCourseSave();
            syncCourseCompletionButton(id);
            return;
        }
        if (event.target.matches("#stage-filter")) {
            selectedStageFilter = event.target.value;
            updateCatalogResults();
        }
    });
    for (const eventName of ["dragstart", "dragover", "dragleave", "drop"]) {
        view.addEventListener(eventName, (event) => {
            if (routeInfo().name === "javascript" && stage00UI.handleDrag(event))
                event.preventDefault();
        });
    }
    appRouterController.start(render);
    window.addEventListener("pagehide", () => { courseController.dispose(); appRouterController.dispose(); clearTimeout(toastTimer); });
    window.addEventListener("pageshow", event => { if (event.persisted) {
        appRouterController.start(render);
        render();
    } });
    window.addEventListener("beforeunload", () => {
        if (localPreview)
            saveProgress();
    });
    document.querySelector(".help-button").addEventListener("click", () => toast("DevPath: aprender construindo, com uma ideia nova de cada vez."));
    document.querySelector(".profile-menu").addEventListener("click", () => toast("Sua conta e suas opções estão no cabeçalho."));
    initialize();
})();
