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
        DevPathKataController: ["create"],
        DevPathReviewSelection: ["chooseReview", "grade", "reconcileAttempts", "startAttempt", "recordCheck", "behaviorRequest"],
        DevPathCourseController: ["create"],
        DevPathStageRegistry: ["create"],
        DevPathModuleGraph: ["buildModuleGraph"],
        DevPathAssessment: ["run"],
        DevPathProgressMigrations: ["stage01"],
        DevPathLearningProgress: ["transitionLearning", "mergeProgressSnapshots"],
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
        DevPathTeachingUtils: ["escapeHTML"],
        DevPathLearningPaths: ["decorate", "handleClick", "handleInput"],
        DevPathLearningEventQueue: ["create"]
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
    let curriculumAssessments = {};
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
        // Learner opt-in for optional activities; stored in progress (reviewOptIn) and sanitized with the rest of it.
        get reviewOptIn() { return progress.reviewOptIn === true; },
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
        get courseRunner() { return courseRunner; },
        get learning() { return learningContext; },
        get assessments() { return curriculumAssessments; }
    };
    const syncNotificationsController = window.DevPathSyncNotifications.create(appContext);
    const appRouterController = window.DevPathAppRouter.create(appContext);
    const catalogViewController = window.DevPathCatalogView.create(appContext);
    const reviewController = window.DevPathReviewController.create(appContext);
    const kataController = window.DevPathKataController.create(appContext);
    const courseController = window.DevPathCourseController.create(appContext);
    const progressSync = window.DevPathProgressSync.create({
        snapshot: () => JSON.stringify(progress),
        merge: (local, remote) => window.DevPathLearningProgress.mergeProgressSnapshots(local, remote),
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
    function migrateLoadedProgress(value) {
        return window.DevPathProgressMigrations.migrateLegacyLearning(value, curriculumActivities, curriculumAssessments);
    }
    function transitionLearning(activityId, event, context = {}) {
        const activity = activityById?.get(activityId);
        if (!activity || !event || typeof event !== "object") return null;
        const assessment = curriculumAssessments[activityId] || {};
        const at = typeof event.at === "string" ? event.at : new Date().toISOString();
        const input = { ...event, at };
        const learningContext = {
            contentVersion: Number.isInteger(context.contentVersion) ? context.contentVersion : activity.contentVersion || 0,
            assessmentVersion: Number.isInteger(context.assessmentVersion) ? context.assessmentVersion : assessment.version || 0,
            fingerprint: event.fingerprint,
            independent: context.independent === true,
            assessmentPassed: context.assessmentPassed === true,
            ...(context.mode === "recall" || context.mode === "learn" ? { mode: context.mode } : {})
        };
        const current = progress.exerciseLearning?.[activityId] || null;
        const next = window.DevPathLearningProgress.transitionLearning(current, input, learningContext);
        progress.exerciseLearning = { ...(progress.exerciseLearning || {}), [activityId]: next };
        saveProgress();
        return next;
    }
    let learningEventSequence = 0;
    const newLearningId = () => `${Date.now().toString(36)}-${(++learningEventSequence).toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    function learningFiles(item, supplied) {
        if (Array.isArray(supplied)) return supplied;
        const editors = [...view.querySelectorAll(`[data-course-editor="${esc(item.id)}"]`)];
        if (editors.length) return editors.map(editor => ({path: editor.dataset.courseFile, content: editor.value}));
        const fields = [...view.querySelectorAll('.course-lesson input:not([type="checkbox"]), .course-lesson textarea, .course-lesson select')]
            .filter(field => !field.closest('[data-learning-transfer]') && !field.matches('[data-course-reflection]'));
        if (fields.length) return [{path: 'learning-response.json', content: JSON.stringify(fields.map(field => ({id: field.id || field.name || field.dataset.action || field.className, value: field.value, checked: field.checked}))) }];
        return (item.starterFiles || []).map(file => ({path: file.path, content: file.content}));
    }
    async function learningFingerprint(item, supplied) {
        const assessment = curriculumAssessments[item.id];
        const files = learningFiles(item, supplied);
        const payload = JSON.stringify({activityId:item.id, contentVersion:item.contentVersion || 1, assessmentVersion:assessment?.version || 1, assessment, files});
        if (window.DevPathAssessment?.canonicalFingerprint) {
            try { return await window.DevPathAssessment.canonicalFingerprint({activityId: item.id, contentVersion: item.contentVersion || 1, assessmentVersion: assessment?.version || 1, assessment, files}); }
            catch { /* Test and restricted contexts may not expose WebCrypto; keep a deterministic local fingerprint. */ }
        }
        let hash = 2166136261;
        for (let index = 0; index < payload.length; index++) hash = Math.imul(hash ^ payload.charCodeAt(index), 16777619);
        return `local-${(hash >>> 0).toString(16).padStart(8, '0')}`;
    }
    function learningRecord(item) { return progress.exerciseLearning?.[item.id] || null; }
    // Every learning event goes through one queue. The queue stamps `at` when an event is applied, so a slow fingerprint
    // on an earlier edit cannot make a later help request look stale to the reducer. Caller-supplied `at` is ignored.
    const learningQueue = window.DevPathLearningEventQueue.create({
        onError: () => toast('Não foi possível salvar esta ação agora. Tente novamente.')
    });
    function learningEvent(item, kind, {attemptId, fingerprint, source = 'rubric-declared', assisted, mode, independent, assessmentPassed = false} = {}) {
        return learningQueue.run(async ({stamp}) => {
            const record = learningRecord(item);
            // Floor at the record's own clock so a record written by a device with a fast clock is never considered newer.
            const at = stamp(record?.currentUpdatedAt);
            const eventAttemptId = attemptId || record?.attemptId || newLearningId();
            const resolvedFingerprint = fingerprint || await learningFingerprint(item);
            const event = {id: newLearningId(), kind, attemptId: eventAttemptId, at, fingerprint: resolvedFingerprint, source, ...(typeof assisted === 'boolean' ? {assisted} : {})};
            return transitionLearning(item.id, event, {contentVersion: item.contentVersion || 1, assessmentVersion: curriculumAssessments[item.id]?.version || 1, fingerprint: resolvedFingerprint, independent: independent ?? record?.attemptIndependent ?? (mode === 'recall'), assessmentPassed, ...(mode ? {mode} : {})});
        });
    }
    const learningContext = Object.freeze({
        transition: transitionLearning, record: learningRecord, fingerprint: learningFingerprint,
        startLearning: async (item, mode) => {
            if (!item || !['learn','recall'].includes(mode)) return null;
            const current = learningRecord(item);
            if (current?.mode === mode && (mode !== 'learn' || current.state !== 'attempted')) return current;
            const at = new Date().toISOString();
            const fingerprint = await learningFingerprint(item);
            // "Aprender este conceito" marks the concept as studied; "Tentar de memória" starts an unhelped attempt.
            return learningEvent(item, mode === 'learn' ? 'studied' : 'attempted', {at, attemptId: current?.attemptId || newLearningId(), fingerprint, source: 'rubric-declared', mode, independent: current ? current.attemptIndependent : mode === 'recall'});
        },
        startIndependentAttempt: async item => {
            if (!item) return null;
            const at = new Date().toISOString(), attemptId = newLearningId(), fingerprint = await learningFingerprint(item);
            return learningEvent(item, 'attempted', {at, attemptId, fingerprint, source:'rubric-declared', mode:'recall', independent:true});
        },
        recordAttempt: (item, options = {}) => learningRecord(item) ? learningEvent(item, 'attempted', {...options, at: options.at || new Date().toISOString(), source: options.source || 'rubric-declared', mode: learningRecord(item)?.mode}) : null,
        requestHelp: async (item, target) => {
            const record = learningRecord(item);
            if (!record) return null;
            return learningEvent(item, 'help', {at: new Date().toISOString(), attemptId: record.attemptId, source: 'rubric-declared', assisted: true, mode: record.mode, independent: record.attemptIndependent});
        },
        submitStudy: async (item, response) => {
            if (typeof response !== 'string' || response.trim().length < 16) return null;
            const record = learningRecord(item);
            if (!record) return null;
            return learningEvent(item, 'studied', {at: new Date().toISOString(), attemptId: record.attemptId, source: 'rubric-declared', mode: record.mode, independent: record.attemptIndependent});
        },
        runAssessment: async (item, result, options = {}) => {
            const record = learningRecord(item), assessment = curriculumAssessments[item.id];
            if (!record || !assessment || !result || result.kind !== 'passed') return null;
            const rubric = Array.isArray(assessment.rubric) ? assessment.rubric : [];
            const checked = [...view.querySelectorAll(`[data-learning-rubric]:checked`)].length;
            const declaredRubricComplete = options.declaredRubricComplete === true ||
                Boolean(assessment.expectedDiagnostics?.length && rubric.length > 0 && checked === rubric.length);
            if (assessment.expectedDiagnostics?.length && !declaredRubricComplete) return null;
            const source = ['browser','local-declared','rubric-declared'].includes(result.source) ? result.source : assessment?.environment === 'rubric' ? 'rubric-declared' : 'local-declared';
            const at = options.at || new Date().toISOString(), attemptId = options.attemptId || record.attemptId;
            const fingerprint = options.fingerprint || result.fingerprint || await learningFingerprint(item);
            return learningEvent(item, 'verified', {at, attemptId, fingerprint, source, mode: record.mode, independent: record.attemptIndependent, assessmentPassed: true});
        },
        runTransfer: async (item, transfer, evidence = {}) => {
            const assessment = curriculumAssessments[item.id];
            // Executable transfers run the learner's files with the assessment runner; only that path can grant "demonstrated".
            if (transfer?.execution === 'browser') return window.DevPathLearningPaths.runExecutableTransfer({
                item, transfer, files: evidence.files, assessment,
                current: () => learningRecord(item),
                event: (kind, options) => learningEvent(item, kind, options),
                evaluate: input => window.DevPathAssessment.run(input),
                fingerprint: input => window.DevPathAssessment.canonicalFingerprint(input),
                newId: newLearningId,
                contentVersion: item.contentVersion || 1,
                assessmentVersion: assessment?.version || 1
            });
            if (!transfer || assessment?.transfer?.id !== transfer.id || !Array.isArray(transfer.rubric) || !transfer.rubric.length || evidence.response?.trim().length < 40 || evidence.checked?.length !== transfer.rubric.length) return {accepted: false};
            const principal = learningRecord(item), principalEvidence = principal?.verifiedEvidence;
            if (!principalEvidence || principalEvidence.attemptId !== principal.attemptId || principalEvidence.fingerprint !== principal.currentFingerprint || principalEvidence.contentVersion !== (item.contentVersion || 1) || principalEvidence.assessmentVersion !== (assessment?.version || 1) || principal.assisted) return {accepted:false};
            const at = new Date().toISOString(), attemptId = newLearningId(), files = [...(transfer.files || []), {path:'transfer-response.md', content:evidence.response.trim()}];
            const fingerprint = await learningFingerprint(item, files);
            const began = await learningEvent(item, 'attempted', {at, attemptId, fingerprint, source:'rubric-declared', mode:'recall', independent:true});
            if (began?.attemptId !== attemptId || began.assisted) return {accepted:false};
            // The rubric is declared, not executed, so the answer is a declared transfer and never "demonstrated".
            const completed = await learningEvent(item, 'transfer-declared', {at:new Date(Date.parse(at)+1).toISOString(), attemptId, fingerprint, source:'rubric-declared', mode:'recall', independent:true, assessmentPassed:false});
            return {accepted:completed?.state === 'transfer-declared'};
        }
    });
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
        try {
            const response = await fetch("/course-assessments.json", { cache: "no-store" });
            if (response.ok) {
                const data = await response.json();
                if (data && typeof data === "object" && !Array.isArray(data)) curriculumAssessments = data.assessment || data;
            }
        }
        catch { /* Legacy migration remains conservative without the assessment manifest. */ }
        activityById = new Map(curriculumActivities.map(item => [item.id, item]));
        startStudyTime();
        const pathSummary = document.querySelector(".side-path small");
        if (pathSummary)
            pathSummary.textContent = `${catalogStageLabel()} · ${curriculumActivities.length} atividades`;
        if (localPreview) {
            try {
                progress = migrateLoadedProgress({ ...blankProgress(), ...JSON.parse(localStorage.getItem(localProgressKey) || "{}") });
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
            progress = migrateLoadedProgress({ ...blankProgress(), ...await progressSync.load() });
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
    function startStudyTime() {
        const root = document.querySelector("#study-time-root");
        if (!root || typeof window.DevPathStudyTime?.create !== "function" || typeof window.DevPathStudyTimeUI?.create !== "function")
            return;
        let storage = null;
        try { storage = window.localStorage; }
        catch { /* A denied storage getter must not block the course. */ }
        const counter = window.DevPathStudyTime.create({storage, now: () => performance.now()});
        window.DevPathStudyTimeUI.create({
            counter,
            root,
            getActivity: () => {
                const route = routeInfo();
                return route.name === "javascript" && route.id ? activityById?.get(route.id) || null : null;
            }
        });
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
    // Revisão usa os exercícios obrigatórios e, por adesão do aluno (reviewOptIn), as atividades opcionais concluídas.
    // Isso não entra em doneCount, percentDone nem requiredActivities.
    function reviewableActivities() { return curriculumActivities.filter((item) => item.optional !== true || progress.reviewOptIn === true); }
    function dueExercises() { return reviewableActivities().filter((item) => isExerciseDone(item.id) && Number(progress.reviewSchedule?.[item.id]?.dueAt || Infinity) <= Date.now()); }
    function nextReviewDate() {
        // Completed activities without a schedule yet have no date; they must not turn the summary into an invalid date.
        const dates = reviewableActivities().filter((item) => isExerciseDone(item.id)).map((item) => Number(progress.reviewSchedule?.[item.id]?.dueAt))
            .filter((date) => Number.isFinite(date));
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
        if (route.name !== "katas")
            kataController.reset();
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
        if (route.name === "katas")
            kataController.render(route.band || null);
        window.DevPathLearningJourney?.sync(view);
        document.querySelector("#main").focus({ preventScroll: true });
    }
    function stageContext() { return { progress, activities: curriculumActivities, assessments: curriculumAssessments, learning: learningContext, saveProgress, scheduleSave: scheduleCourseSave, render, toast }; }
    const genericCourseAdapter = {
        render: item => renderCurriculumLesson(item),
        handleClick: (event, item) => courseController.handleClick(event, item),
        handleInput: (event, item) => courseController.handleInput(event, item)
    };
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
    ], genericCourseAdapter, [["03.10", genericCourseAdapter]]);
    function dispatchStageEvent(event) {
        const route = routeInfo();
        if (route.name !== "javascript" || !route.id)
            return false;
        const item = activityById?.get(route.id);
        if (!item)
            return false;
        const context = stageContext();
        if (event.type === "click" && window.DevPathLearningPaths.handleClick(event, item, context, view))
            return true;
        if (event.type !== "click") window.DevPathLearningPaths.handleInput(event, item, context);
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
        view.innerHTML = window.DevPathLearningPaths.decorate(item, adapter.render(item, stageContext()), stageContext());
        adapter.sync?.(item, stageContext());
        reviewController.mountOptIn(view, item);
        window.DevPathLocalProjectPanel?.enhance(view, item, {
            assessment: curriculumAssessments[id],
            loadDraft: draftItem => courseController.loadCourseDraft(draftItem),
            toast,
            exporter: window.DevPathCourseProjectExport
        });
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
        if (routeInfo().name === "katas" && kataController.handleClick(event))
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
            const predictionRoot = view.querySelector(`[data-structured-prediction]`);
            const structuredAnswers = predictionRoot && window.DevPathStructuredPredictions?.read(predictionRoot);
            const response = structuredAnswers
                ? window.DevPathStructuredPredictions.serialize({version: Number(predictionRoot.dataset.structuredPrediction) || 1, fields: Object.keys(structuredAnswers).map(fieldId => ({id: fieldId}))}, structuredAnswers)
                : view.querySelector(`[data-first-response-input="${esc(id)}"]`)?.value.trim() || "";
            if (!response) {
                toast("Registre uma primeira resposta antes de abrir a explicação.");
                return;
            }
            if (response.length > limits.predictionChars) {
                toast(`A resposta passou do limite de ${limits.predictionChars} caracteres. Encurte um ou mais campos; nada foi registrado.`);
                return;
            }
            progress.exercisePredictions ||= {};
            const item = activityById.get(id);
            const key = exerciseProgressKey(item);
            progress.exercisePredictions[key] = response;
            progress.warmupCompleted ||= {};
            progress.warmupCompleted[key] = true;
            courseController.predictionSaved(id);
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
        if (routeInfo().name === "katas" && kataController.handleInput(event))
            return;
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
        if (reviewController.handleOptInChange(event))
            return;
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
