const blankProgress = () => ({ completed: [], answers: {}, attempts: {}, challenges: {}, exerciseVersions: {}, exerciseDrafts: {}, exercisePredictions: {}, exerciseReflections: {}, exerciseEvidence: {}, warmupCompleted: {}, reviewSchedule: {}, stage02: {}, stage01: {}, lastLesson: null, activeDays: [], reviewIndex: 0, lastReview: null });
const localPreview = ["localhost", "127.0.0.1", "[::1]"].includes(location.hostname);
const localProgressKey = "devpath-local-preview-v1";
let progress = blankProgress();
let curriculumActivities = window.DevPathStage00UI.activities;
let saveQueue = Promise.resolve();
let selectedCatalogFilter = "Todas";
let selectedStageFilter = "Todas";
let catalogSearch = "";
let reviewQuestionIndex = 0;
let reviewSession = null;
let hintIndexes = {};
let toastTimer;
let courseSaveTimer;
const view = document.querySelector("#view");
const breadcrumb = document.querySelector("#breadcrumbs");

function saveProgress() {
  const status = document.querySelector(".save-status");
  status.innerHTML = "<i></i> salvando…";
  const snapshot = JSON.stringify(progress);
  if (localPreview) {
    try { localStorage.setItem(localProgressKey, snapshot); status.innerHTML = "<i></i> salvo neste navegador"; }
    catch { status.innerHTML = "<i></i> falha ao salvar localmente"; }
    updateNav(routeInfo().name);
    return;
  }
  saveQueue = saveQueue.catch(() => {}).then(async () => {
    const response = await fetch("/api/progress", { method: "PUT", headers: { "Content-Type": "application/json" }, body: snapshot });
    if (!response.ok) throw new Error("save failed");
    status.innerHTML = "<i></i> progresso salvo";
  }).catch(() => { status.innerHTML = "<i></i> falha ao salvar"; });
  updateNav(routeInfo().name);
}

async function initialize() {
  const status = document.querySelector(".save-status");
  try {
    const response = await fetch("/course-catalog.json", { cache: "no-store" });
    if (response.ok) {
      const catalog = await response.json();
      if (Array.isArray(catalog) && catalog.length === 254 && catalog.every((item) => item.id && item.learner === undefined)) {
        curriculumActivities = catalog;
        document.querySelector(".side-path small").textContent = "Diagnóstico + etapas 00–23 · 254 exercícios";
      }
    }
  } catch { /* Keep the existing starter catalog if the expanded course asset is unavailable. */ }
  if (localPreview) {
    try { progress = { ...blankProgress(), ...JSON.parse(localStorage.getItem(localProgressKey) || "{}") }; }
    catch { progress = blankProgress(); }
    status.innerHTML = "<i></i> prévia local · progresso neste navegador";
    document.querySelector(".site-footer > span:last-child").textContent = "Prévia local: seu progresso fica neste navegador.";
    render();
    return;
  }
  try {
    const response = await fetch("/api/progress", { cache: "no-store" });
    if (!response.ok) throw new Error("load failed");
    progress = { ...blankProgress(), ...(await response.json()).progress };
    status.innerHTML = "<i></i> progresso sincronizado";
  } catch {
    status.innerHTML = "<i></i> erro de sincronização";
    toast("Não foi possível carregar seu progresso. Atualize a página para tentar novamente.");
  }
  render();
  try {
    const response = await fetch("/api/profile", { cache: "no-store" });
    if (!response.ok) return;
    const { displayName, email } = await response.json();
    const profile = document.querySelector(".profile-row > span");
    const avatar = document.querySelector(".profile-row .avatar");
    profile.innerHTML = `<strong>${esc(displayName)}</strong><small>${esc(email)}</small>`;
    avatar.textContent = Array.from(displayName)[0]?.toLocaleUpperCase("pt-BR") || "D";
  } catch { /* The protected app can load without optional profile display. */ }
}

function recordActiveDay() {
  const today = new Date().toLocaleDateString("sv-SE");
  if (!progress.activeDays.includes(today)) {
    progress.activeDays.push(today);
    progress.activeDays = progress.activeDays.slice(-30);
    saveProgress();
  }
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

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

function setBreadcrumb(...parts) {
  breadcrumb.innerHTML = `<span>Seu espaço</span>${parts.map((part) => `<span class="crumb-sep">/</span><strong>${esc(part)}</strong>`).join("")}`;
}

function updateNav(route) {
  const section = route === "javascript" ? "catalog" : route;
  document.querySelectorAll("[data-nav]").forEach((item) => item.classList.toggle("active", item.dataset.nav === section));
  const dueCount = dueExercises().length;
  document.querySelector("#review-count").textContent = dueCount ? String(dueCount) : "↗";
}

function routeInfo() {
  const path = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (path[0] === "javascript" && path[1] && curriculumActivities.some((item) => item.id === path[1])) return { name: "javascript", id: path[1] };
  if (path[0] === "javascript") return { name: "javascript" };
  if (["catalog", "review"].includes(path[0])) return { name: path[0] };
  return { name: "home" };
}

function exerciseProgressKey(item) {
  if (!item) return "";
  return Number(item.contentVersion || 1) > 1 ? `${item.id}@v${item.contentVersion}` : item.id;
}
function isExerciseDone(id) {
  if (id.startsWith("01.")) return window.DevPathStage01UI?.complete({ id }, progress) || false;
  if (id.startsWith("02.")) return window.DevPathStage02UI.complete({ id }, progress);
  const item = curriculumActivities.find((activity) => activity.id === id);
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
  window.DevPathStage00UI.flushDraft(stageContext());
  recordActiveDay();
  const route = routeInfo();
  if (route.name !== "review") { reviewSession = null; reviewQuestionIndex = 0; }
  updateNav(route.name);
  if (route.name === "home") renderHome();
  if (route.name === "catalog") renderCatalog();
  if (route.name === "javascript") route.id ? renderJavaScriptExercise(route.id) : renderJavaScriptOverview();
  if (route.name === "review") renderReview();
  window.DevPathLearningJourney?.sync(view);
  document.querySelector("#main").focus({ preventScroll: true });
}

function stageContext() { return { progress, saveProgress, render }; }
function stage02Context() { return { progress, saveProgress, render, toast, scheduleSave: scheduleCourseSave }; }
function stage00Context() { return { progress, saveProgress, render, toast, scheduleSave: scheduleCourseSave, activities: curriculumActivities }; }

function renderJavaScriptOverview() {
  renderCatalog();
}

function renderJavaScriptExercise(id) {
  const item = curriculumActivities.find((activity) => activity.id === id);
  if (!item) { location.hash = "#/javascript"; return; }
  setBreadcrumb("JavaScript", item.stage === "D" ? "Diagnóstico" : `Etapa ${item.stage || item.id.slice(0, 2)}`, item.title);
  view.innerHTML = item.stage === "D" ? window.DevPathDiagnosticUI.render(item, stage00Context()) : item.stage === "00" && item.preparation ? window.DevPathStage00Preparation.render(item, stage00Context()) : item.stage === "01" ? window.DevPathStage01UI.render(item, stage00Context()) : item.stage === "02" ? window.DevPathStage02UI.render(item, stage02Context()) : renderCurriculumLesson(item);
  if (item.stage === "00" && item.preparation) window.DevPathStage00Preparation.sync(item, stage00Context());
}

function renderHome() {
  setBreadcrumb("Início");
  const activities = curriculumActivities;
  const required = requiredActivities();
  const next = required.find((item) => !isExerciseDone(item.id)) || required[0] || activities[0];
  const allDone = doneCount() === required.length;
  const stageIds = [...new Set(activities.map((item) => item.stage || item.id.slice(0, 2)))];
  const stageRows = stageIds.map((stage) => {
    const items = activities.filter((item) => (item.stage || item.id.slice(0, 2)) === stage);
    const core = items.filter((item) => !item.optional);
    const extras = items.length - core.length;
    const completed = core.filter((item) => isExerciseDone(item.id)).length;
    const nextInStage = core.find((item) => !isExerciseDone(item.id)) || core[0] || items[0];
    const stageLabel = stage === "D" ? "DIAGNÓSTICO" : `ETAPA ${esc(stage)}`;
    return `<a class="path-stage-card" href="#/javascript/${nextInStage.id}"><div><span class="eyebrow">${stageLabel}</span><strong>${completed} / ${core.length}</strong></div><h2>${esc((core[0] || items[0]).title)}${items.length > 1 ? ` <span>+ ${items.length - 1} atividades${extras ? `, ${extras} extra` : ""}</span>` : ""}</h2><div class="stage-progress"><i style="width:${core.length ? Math.round(completed / core.length * 100) : 100}%"></i></div></a>`;
  }).join("");
  const label = allDone ? "Praticar revisão" : isExerciseDone(next.id) ? "Revisitar exercício" : doneCount() ? "Continuar exercício" : "Começar exercício";
  const href = allDone ? "#/review" : `#/javascript/${next.id}`;
  const week = weekMarkup();
  view.innerHTML = `
    <section class="welcome"><div><div class="eyebrow">${new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(new Date()).toUpperCase()} · UMA IDEIA DE CADA VEZ</div><h1>Olá, aprendiz<span class="brand-period">.</span></h1><p>${allDone ? `Os ${activities.length} exercícios disponíveis estão concluídos. Revise ou pratique novamente.` : "Você tem um caminho pela frente. <strong>Vamos escrever mais uma linha?</strong>"}</p></div><div class="date-chip">${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()).toUpperCase()}</div></section>
    <section class="continue-panel" aria-labelledby="continue-title"><div class="continue-copy"><div class="eyebrow">JAVASCRIPT · EXERCÍCIO ${esc(next.id)}</div><h2 id="continue-title">${esc(next.title)}.</h2><p>${esc(next.objective)}</p><div class="continue-bottom"><a class="button-primary" href="${href}">${label}<span aria-hidden="true">→</span></a><span class="subtle-meta">${doneCount()} / ${activities.length} exercícios concluídos</span></div></div><div class="code-art" aria-hidden="true"><div class="code-top"><i></i><i></i><i></i></div><div class="code-line w-1"></div><div class="code-line w-2"></div><div class="code-line w-3"></div><div class="code-line w-4"></div><div class="code-line w-5"></div><span class="code-caption">console.log("você")</span></div></section>
    <section class="path-overview"><div class="section-heading"><h2>JavaScript · diagnóstico e etapas 00 a 23</h2><a class="text-link" href="#/catalog">Abrir os 254 exercícios →</a></div><div class="path-stage-grid">${stageRows}</div></section>
    <div class="bottom-grid"><section class="week-panel" aria-labelledby="week-title"><div class="section-heading"><h2 id="week-title">Um pouco já conta</h2><span class="eyebrow">SEUS ÚLTIMOS 7 DIAS</span></div><div class="week-track">${week}</div></section><aside class="stat-note"><span class="stat-number">${percentDone()}%</span><span class="stat-copy"><strong>${doneCount()} de ${activities.length} exercícios</strong>Seu progresso acompanha<br />o que você conseguiu fazer.</span></aside></div>`;
}

function weekMarkup() {
  const days = [];
  const today = new Date();
  const names = ["D", "S", "T", "Q", "Q", "S", "S"];
  for (let back = 6; back >= 0; back--) {
    const date = new Date(today);
    date.setDate(today.getDate() - back);
    const iso = date.toLocaleDateString("sv-SE");
    const todayFlag = back === 0;
    const active = progress.activeDays.includes(iso);
    days.push(`<div class="day-cell ${todayFlag ? "today" : ""} ${active && !todayFlag ? "was-active" : ""}"><span>${names[date.getDay()]}</span><span class="day-mark">${active ? "✓" : todayFlag ? "·" : "–"}</span></div>`);
  }
  return days.join("");
}

function renderCatalog() {
  setBreadcrumb("Exercícios");
  const filters = ["Todas", "Em andamento", "Concluídas"];
  const stages = [...new Set(curriculumActivities.map((item) => item.stage))];
  view.innerHTML = `<section class="page-intro"><div class="eyebrow">JAVASCRIPT · DIAGNÓSTICO + ETAPAS 00 A 23</div><h1>Aprender escrevendo código<span class="brand-period">.</span></h1><p>254 atividades com previsão antes da explicação, espaço para escrever, exemplos públicos e revisão espaçada. Escolha uma etapa ou procure um tema.</p></section><div class="catalog-tools"><label class="course-search-label" for="course-search">Buscar exercício<input id="course-search" type="search" value="${esc(catalogSearch)}" placeholder="Título, tema ou enunciado" autocomplete="off" /></label><label class="stage-select-label" for="stage-filter">Etapa<select id="stage-filter">${["Todas", ...stages].map((stage) => `<option value="${esc(stage)}" ${selectedStageFilter === stage ? "selected" : ""}>${stage === "Todas" ? "Todas as etapas" : stage === "D" ? "Diagnóstico inicial" : `Etapa ${stage}`}</option>`).join("")}</select></label><div class="filter-tabs" role="group" aria-label="Filtrar por progresso">${filters.map((filter) => `<button class="filter-tab ${selectedCatalogFilter === filter ? "selected" : ""}" data-filter="${filter}" aria-pressed="${selectedCatalogFilter === filter}">${filter}</button>`).join("")}</div></div><div class="catalog-count-row"><span id="catalog-count" class="catalog-count"></span><span>Escolha uma atividade para abrir a explicação guiada.</span></div><section id="catalog-results" aria-label="Exercícios de JavaScript"></section>`;
  updateCatalogResults();
}

function updateCatalogResults() {
  const results = document.querySelector("#catalog-results");
  if (!results) return;
  const query = catalogSearch.trim().toLocaleLowerCase("pt-BR");
  let items = curriculumActivities.filter((item) => {
    const stage = item.stage || item.id.slice(0, 2);
    if (selectedCatalogFilter === "Em andamento" && isExerciseDone(item.id)) return false;
    if (selectedCatalogFilter === "Concluídas" && !isExerciseDone(item.id)) return false;
    if (selectedStageFilter !== "Todas" && stage !== selectedStageFilter) return false;
    if (query && !`${item.id} ${item.title} ${item.kind} ${item.prompt} ${item.firstResponse?.action || ""}`.toLocaleLowerCase("pt-BR").includes(query)) return false;
    return true;
  });
  document.querySelector("#catalog-count").textContent = `${items.length} ${items.length === 1 ? "EXERCÍCIO" : "EXERCÍCIOS"} · ${doneCount()} / ${requiredActivities().length} OBRIGATÓRIOS CONCLUÍDOS`;
  const stageIds = [...new Set(items.map((item) => item.stage || item.id.slice(0, 2)))];
  results.innerHTML = items.length ? stageIds.map((stage) => {
    const group = items.filter((item) => (item.stage || item.id.slice(0, 2)) === stage);
    const core = group.filter((item) => !item.optional);
    const extras = group.length - core.length;
    const completed = core.filter((item) => isExerciseDone(item.id)).length;
    return `<section class="catalog-stage" aria-labelledby="catalog-stage-${stage}"><div class="catalog-stage-heading"><div><span class="eyebrow">SEQUÊNCIA CURRICULAR</span><h2 id="catalog-stage-${stage}">${stage === "D" ? "Diagnóstico inicial" : `Etapa ${esc(stage)}`}</h2></div><span>${completed} / ${core.length} obrigatórios${extras ? ` · ${extras} extras opcionais` : ""}</span></div><div class="catalog-card-grid">${group.map((item) => { const order = core.indexOf(item); return `<article class="catalog-learning-card ${isExerciseDone(item.id) ? "is-complete" : ""}"><div class="catalog-learning-meta"><span>${esc(item.id)} · ${esc(item.kind)}${item.optional ? " · EXTRA OPT-IN" : ` · ${order + 1} de ${core.length}`}</span><span>${isExerciseDone(item.id) ? "✓ concluído" : `estimativa ${esc(item.duration)}`}</span></div><h3>${esc(item.title)}</h3><p>${renderInlineCode(item.firstResponse.action)}</p><a href="#/javascript/${item.id}" class="text-link">${isExerciseDone(item.id) ? "Revisitar atividade" : "Abrir atividade"}<span aria-hidden="true">→</span></a></article>`; }).join("")}</div></section>`;
  }).join("") : `<p class="empty-state">Nenhum exercício corresponde a esses filtros. Ajuste a busca ou selecione outra etapa.</p>`;
}

function loadCourseDraft(item) {
  const raw = progress.exerciseDrafts?.[exerciseProgressKey(item)];
  if (typeof raw === "string" && raw.startsWith("__course_files__:")) {
    try { return JSON.parse(raw.slice("__course_files__:".length)); } catch { /* Use the published starter files. */ }
  }
  return Object.fromEntries(item.starterFiles.map((file, index) => [file.path, index === 0 && typeof raw === "string" ? raw : file.content]));
}

function renderResources(resources = []) {
  return resources.length ? `<ul class="course-resource-list">${resources.map((resource) => {
    const safe = esc(resource);
    const linked = safe.replace(/https:\/\/[^\s<>]+/g, (url) => {
      const clean = url.replace(/[),.;]+$/, "");
      const tail = url.slice(clean.length);
      return `<a href="${clean}" target="_blank" rel="noopener noreferrer">${clean}</a>${tail}`;
    });
    return `<li>${linked}</li>`;
  }).join("")}</ul>` : `<p>Sem recurso externo obrigatório nesta atividade.</p>`;
}

function renderStageBridge(item) {
  if (!item.stageBridge) return "";
  const paragraphs = item.stageBridge.split(/\n\s*\n/).filter(Boolean).map((paragraph) => {
    const safe = esc(paragraph.trim()).replace(/`([^`]+)`/g, "<code>$1</code>");
    return `<p>${safe}</p>`;
  }).join("");
  return `<section class="course-stage-bridge"><div class="course-section-kicker">PONTE CONCEITUAL DA ETAPA ${esc(item.stage)}</div><h2>${esc(item.stageBridgeTitle)}</h2><p class="course-bridge-intro">Leia depois da sua primeira previsão e antes de praticar. Use os exemplos para conectar a ideia ao exercício.</p><div class="course-bridge-copy">${paragraphs}</div></section>`;
}

function renderCurriculumLesson(item) {
  const id = item.id;
  const answered = progress.warmupCompleted?.[exerciseProgressKey(item)] === true || isExerciseDone(id);
  const complete = isExerciseDone(id);
  const progressKey = exerciseProgressKey(item);
  const prediction = progress.exercisePredictions?.[progressKey] || "";
  const reflection = progress.exerciseReflections?.[progressKey] || "";
  const evidence = progress.exerciseEvidence?.[progressKey] || {};
  const evidenceReady = evidence.status === "executed" || evidence.status === "written";
  const drafts = loadCourseDraft(item);
  const required = requiredActivities();
  const itemPosition = curriculumActivities.indexOf(item);
  const previous = [...required].reverse().find((candidate) => curriculumActivities.indexOf(candidate) < itemPosition);
  const next = required.find((candidate) => curriculumActivities.indexOf(candidate) > itemPosition);
  const stageCore = required.filter((candidate) => candidate.stage === item.stage);
  const stageOrder = stageCore.indexOf(item) + 1;
  const sequenceLabel = item.optional ? "EXTRA OPT-IN" : `ORDEM ${stageOrder} DE ${stageCore.length}`;
  const firstFile = item.starterFiles[0];
  const starterPreview = item.starterFiles.map((file) => `<div class="course-file-preview"><span>${esc(file.path)}</span><pre><code>${esc(file.content)}</code></pre></div>`).join("");
  const editors = item.starterFiles.map((file) => `<label class="course-editor-label" for="course-file-${id}-${item.starterFiles.indexOf(file)}"><span>${esc(file.path)}</span><textarea id="course-file-${id}-${item.starterFiles.indexOf(file)}" class="course-editor" data-course-editor="${esc(id)}" data-course-file="${esc(file.path)}" maxlength="${Math.max(80, Math.floor(1100 / item.starterFiles.length))}" spellcheck="false" autocapitalize="off" autocomplete="off">${esc(drafts[file.path] ?? file.content)}</textarea></label>`).join("");
  const codeFile = item.starterFiles.find((file) => /\.js$/i.test(file.path));
  const rubricChecks = (item.rubric || []).map((criterion, index) => `<label class="course-self-check"><input type="checkbox" data-course-rubric="${esc(id)}" value="${index}" ${evidence.rubric?.includes(index) ? "checked" : ""}><span>${esc(criterion)}</span></label>`).join("");
  const requiresModuleImports = codeFile && /^\s*import(?:\s|\{|\*)/m.test(codeFile.content || "");
  const runPanel = codeFile && !requiresModuleImports
    ? `<div class="course-runner"><div class="course-runner-heading"><strong>Execute uma tentativa</strong><span>JavaScript em frame isolado · sem acesso à rede</span></div><p>O executor remove apenas o modificador ESM <code>export</code> de declarações para permitir a execução local. O resultado serve para investigar seu código; os critérios continuam sendo conferidos por você, com a rubrica.</p><button type="button" class="button-secondary" data-course-run="${esc(id)}">Executar JavaScript</button><div class="course-run-output" data-course-output="${esc(id)}" role="status" aria-live="polite">${evidence.output ? esc(evidence.output) : "A saída aparecerá aqui."}</div></div>`
    : `<div class="course-runner"><div class="course-runner-heading"><strong>Registre uma análise escrita</strong><span>Modo guiado · sem IA</span></div><p>Edite o arquivo acima com sua análise, diagnóstico ou solução. Depois registre a tentativa para anexar a evidência à revisão.</p><button type="button" class="button-secondary" data-course-submit-writing="${esc(id)}">Registrar análise escrita</button><div class="course-run-output" data-course-output="${esc(id)}" role="status" aria-live="polite">${evidence.status === "written" ? "Análise registrada." : "Escreva pelo menos 40 caracteres no material antes de registrar."}</div></div>`;
  const rubricPanel = rubricChecks ? `<fieldset class="course-rubric-checks"><legend>Autoavaliação guiada</legend><p>Marque apenas os critérios que você conferiu no próprio trabalho. Isso registra sua reflexão; não é uma nota automática.</p>${rubricChecks}</fieldset>` : "";
  const exampleDetails = item.examples?.length ? `<details class="course-reveal"><summary>Conferir exemplos públicos depois da sua tentativa</summary><ul>${item.examples.map((example) => `<li><strong>${esc(example.given || "Exemplo")}</strong><span>${esc(example.expected || "")}</span></li>`).join("")}</ul></details>` : "";
  const rubricDetails = item.rubric?.length || item.constraints?.length ? `<details class="course-reveal"><summary>Critérios e limites desta atividade</summary>${item.rubric?.length ? `<h3>Como conferir</h3><ul>${item.rubric.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>` : ""}${item.constraints?.length ? `<h3>Restrições</h3><ul>${item.constraints.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>` : ""}</details>` : "";
  const stageBridge = renderStageBridge(item);
  return `<article class="course-lesson"><a class="lesson-back" href="#/catalog">← Todas as etapas</a><header class="course-lesson-hero"><div class="eyebrow">${esc(sequenceLabel)} · ${esc(item.id)} · ${esc(item.kind)}${item.optional ? " · EXTRA OPT-IN" : ""}</div><h1>${esc(item.title)}<span class="brand-period">.</span></h1><p>${esc(item.firstResponse.action)}</p><div class="course-lesson-meta"><span title="Estimativa editorial inicial para planejar a sessão, não medida de domínio.">Estimativa: ${esc(item.duration)}</span><span>Runtime sugerido: ${esc(item.runtime || "JavaScript")}</span><span>${complete ? "✓ concluído" : "em andamento"}</span></div></header><nav class="course-steps" aria-label="Etapas da atividade"><span class="${answered ? "complete" : "active"}">01 · Ler</span><span class="${answered ? "complete" : "active"}">02 · Responder</span><span class="${answered ? "active" : ""}">03 · Entender</span><span class="${complete ? "complete" : ""}">04 · Escrever</span><span class="${complete ? "complete" : ""}">05 · Explicar</span></nav><section class="course-prompt-panel"><div class="course-section-kicker">DESAFIO</div><p class="course-prompt">${esc(item.prompt)}</p><div class="course-interaction-note"><strong>Como responder</strong><p>${esc(item.interaction)}</p></div><div class="course-starter-read"><div class="course-section-kicker">LEIA O ARQUIVO ANTES DE RESPONDER</div>${starterPreview}</div>${answered ? `<div class="course-first-response-saved"><strong>Sua resposta inicial foi registrada</strong><p>${esc(prediction)}</p><span>${esc(item.firstResponse.timing)}</span></div>` : `<label class="course-response-label" for="first-response-${id}"><span>Sua primeira resposta</span><small>${esc(item.firstResponse.timing)}</small><textarea id="first-response-${id}" data-first-response-input="${esc(id)}" maxlength="400" placeholder="Escreva sua previsão, hipótese ou primeira decisão…">${esc(prediction)}</textarea></label><button type="button" class="button-primary" data-course-first-response="${esc(id)}">Registrar resposta e abrir a explicação <span aria-hidden="true">→</span></button>`}</section>${answered ? `<section class="course-explanation-panel"><div class="course-section-kicker">EXPLICAÇÃO GUIADA</div><h2>O modelo mental</h2><p>${esc(item.explanation.mental_model)}</p><h3>Exemplo trabalhado</h3><p>${esc(item.explanation.worked_example)}</p><div class="course-explanation-columns"><div><strong>Armadilha comum</strong><p>${esc(item.explanation.common_trap)}</p></div><div><strong>Por que isso importa</strong><p>${esc(item.explanation.why_it_matters)}</p></div></div>${exampleDetails}${rubricDetails}<div class="course-resources"><h3>Recursos para esta atividade</h3>${renderResources(item.resources)}</div></section>${stageBridge}<section class="course-practice-panel"><div class="course-section-kicker">SUA VEZ DE ESCREVER</div><h2>Edite o arquivo do exercício</h2><p>O rascunho é salvo na sua conta. A forma de registrar a tentativa depende do material desta atividade.</p><div class="course-editors">${editors}</div>${runPanel}${rubricPanel}<label class="course-reflection-label" for="course-reflection-${id}"><span>Explique com suas palavras o que você fez ou descobriu</span><textarea id="course-reflection-${id}" data-course-reflection="${esc(id)}" maxlength="600" placeholder="Sua explicação ajuda a consolidar o raciocínio…">${esc(reflection)}</textarea></label><div class="course-complete-row"><span data-course-reflection-count>${reflection.trim().length}/16 caracteres · ${evidenceReady ? "tentativa registrada" : "registre uma tentativa"}</span><button type="button" class="button-primary" data-course-complete="${esc(id)}" ${complete || reflection.trim().length < 16 || !evidenceReady || ((item.rubric || []).length && (evidence.rubric || []).length !== item.rubric.length) ? "disabled" : ""}>${complete ? "Atividade concluída ✓" : "Concluir com minha explicação"}</button></div>${complete ? `<p class="course-complete-note" role="status">Atividade concluída com uma tentativa registrada e autoavaliação. A revisão correspondente entra no intervalo de 7 dias.</p>` : ""}</section><footer class="course-lesson-footer">${previous ? `<a class="button-secondary" href="#/javascript/${previous.id}">← ${esc(previous.id)} · ${esc(previous.title)}</a>` : `<span></span>`}${next ? `<a class="button-secondary" href="#/javascript/${next.id}">${esc(next.id)} · ${esc(next.title)} →</a>` : ""}</footer>` : `<p class="course-gate-note" role="status">A explicação e o editor aparecem depois que você registrar sua primeira resposta.</p>`}</article>`;
}

function reviewSet() {
  const activities = curriculumActivities.filter((item) => isExerciseDone(item.id));
  const due = dueExercises().sort((a, b) => Number(progress.reviewSchedule?.[a.id]?.dueAt) - Number(progress.reviewSchedule?.[b.id]?.dueAt));
  if (due.length) return due.slice(0, 12).map((item) => ({ exercise: item, ...item.review, scheduled: true }));
  if (!activities.length) return [];
  const index = Math.max(0, Math.trunc(Number(progress.reviewIndex) || 0)) % activities.length;
  return [{ exercise: activities[index], ...activities[index].review, scheduled: false }];
}

function saveCourseDraft(id) {
  const editors = [...view.querySelectorAll(`[data-course-editor="${id}"]`)];
  if (!editors.length) return;
  const files = Object.fromEntries(editors.map((editor) => [editor.dataset.courseFile, editor.value]));
  const value = editors.length === 1 ? editors[0].value : `__course_files__:${JSON.stringify(files)}`;
  if (value.length > 2500) { toast("Este rascunho passou do limite salvo para a atividade."); return; }
  progress.exerciseDrafts ||= {};
  progress.exerciseDrafts[exerciseProgressKey(curriculumActivities.find((activity) => activity.id === id))] = value;
}

function scheduleCourseSave() {
  clearTimeout(courseSaveTimer);
  courseSaveTimer = setTimeout(() => { courseSaveTimer = null; saveProgress(); }, 500);
}

function syncCourseCompletionButton(id) {
  const item = curriculumActivities.find((activity) => activity.id === id);
  const evidence = progress.exerciseEvidence?.[exerciseProgressKey(item)] || {};
  const reflection = view.querySelector(`[data-course-reflection="${id}"]`)?.value.trim() || "";
  const checked = view.querySelectorAll(`[data-course-rubric="${id}"]:checked`).length;
  const button = view.querySelector(`[data-course-complete="${id}"]`);
  if (button) button.disabled = isExerciseDone(id) || reflection.length < 16 || !["executed", "written"].includes(evidence.status) || ((item?.rubric || []).length > 0 && checked !== item.rubric.length);
}

function saveExerciseEvidence(id, evidence) {
  const item = curriculumActivities.find((activity) => activity.id === id);
  const key = exerciseProgressKey(item);
  progress.exerciseEvidence ||= {};
  progress.exerciseEvidence[key] = { ...progress.exerciseEvidence[key], ...evidence, recordedAt: new Date().toISOString() };
  saveProgress();
  syncCourseCompletionButton(id);
}

function runCourseJavaScript(id) {
  const item = curriculumActivities.find((activity) => activity.id === id);
  const file = item?.starterFiles.find((entry) => /\\.js$/i.test(entry.path));
  const editor = file && view.querySelector(`[data-course-editor="${id}"][data-course-file="${CSS.escape(file.path)}"]`);
  const output = view.querySelector(`[data-course-output="${id}"]`);
  if (!editor || !output) return;
  if (!editor.value.trim()) { toast("Escreva uma tentativa antes de executar."); return; }
  if (/^\s*import(?:\s|\{|\*)/m.test(editor.value) || /^\s*export\s*(?:\{|default\b)/m.test(editor.value)) {
    output.textContent = "Este arquivo usa import ou uma forma de export que depende do carregador ESM. Faça a análise no editor e use o modo guiado de registro desta atividade.";
    return;
  }
  saveCourseDraft(id);
  const token = `${id}-${crypto.randomUUID()}`;
  const frame = document.createElement("iframe");
  frame.title = "Execução isolada do código do exercício";
  frame.setAttribute("sandbox", "allow-scripts");
  frame.setAttribute("aria-hidden", "true");
  frame.tabIndex = -1;
  frame.style.cssText = "position:fixed;width:1px;height:1px;left:-10px;top:-10px;border:0;opacity:0;pointer-events:none";
  const moduleCode = editor.value.replace(/^\s*export\s+(?=(?:async\s+)?(?:function|class|const|let|var)\b)/gm, "");
  const safeCode = JSON.stringify(moduleCode).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
  frame.srcdoc = `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; connect-src 'none'; img-src 'none'; media-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><script>const token=${JSON.stringify(token)};const lines=[];const show=v=>{if(typeof v==='string')return v;try{return JSON.stringify(v)}catch{return String(v)}};console.log=(...v)=>{lines.push(v.map(show).join(' '));if(lines.join('\\n').length>9000)lines.push('[saída truncada]')};const send=(kind,error)=>parent.postMessage({token,kind,text:error?(error.name?error.name+': ':'')+(error.message||String(error)):lines.join('\\n')||'(sem saída no console)'},'*');try{Promise.resolve(new Function('return (async()=>{\\n'+${safeCode}+'\\n})()')()).then(()=>send('result')).catch(error=>send('error',error))}catch(error){send('error',error)}</script>`;
  output.textContent = "Executando em frame isolado… limite de 2 segundos.";
  document.body.append(frame);
  let settled = false;
  const finish = (kind, text) => {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    window.removeEventListener("message", onMessage);
    frame.remove();
    const result = String(text || "(sem saída)").slice(0, 9000);
    output.textContent = `${kind === "timeout" ? "Tempo limite excedido" : kind === "error" ? "Erro na tentativa" : "Execução concluída"}\n${result}`;
    const item = curriculumActivities.find((activity) => activity.id === id);
    const key = exerciseProgressKey(item);
    saveExerciseEvidence(id, { status: "executed", runResult: kind, output: result, runCount: Math.min(100000, Number(progress.exerciseEvidence?.[key]?.runCount || 0) + 1) });
  };
  const onMessage = (event) => {
    if (event.source !== frame.contentWindow || event.data?.token !== token) return;
    finish(event.data.kind, event.data.text);
  };
  const timeout = setTimeout(() => finish("timeout", "O código foi interrompido. Procure um loop que não termina ou uma operação longa."), 2000);
  window.addEventListener("message", onMessage);
}

function submitGuidedWriting(id) {
  const editors = [...view.querySelectorAll(`[data-course-editor="${id}"]`)];
  const material = editors.map((editor) => editor.value.trim()).join("\n");
  const output = view.querySelector(`[data-course-output="${id}"]`);
  if (material.length < 40) {
    if (output) output.textContent = `Ainda faltam ${40 - material.length} caracteres de análise no arquivo. Desenvolva sua resposta e tente novamente.`;
    return;
  }
  saveCourseDraft(id);
  if (output) output.textContent = `Análise registrada (${material.length} caracteres). Agora confira sua resposta com os critérios e explique o raciocínio.`;
  const item = curriculumActivities.find((activity) => activity.id === id);
  saveExerciseEvidence(id, { status: "written", runResult: "guided", output: `Análise escrita registrada (${material.length} caracteres).`, rubric: progress.exerciseEvidence?.[exerciseProgressKey(item)]?.rubric || [] });
}

function completeCourseExercise(id) {
  const reflection = view.querySelector(`[data-course-reflection="${id}"]`)?.value.trim() || "";
  const item = curriculumActivities.find((activity) => activity.id === id);
  const key = exerciseProgressKey(item);
  const evidence = progress.exerciseEvidence?.[key] || {};
  const checked = [...view.querySelectorAll(`[data-course-rubric="${id}"]:checked`)].map((input) => Number(input.value));
  if (!item || (evidence.status !== "executed" && evidence.status !== "written")) { toast("Registre uma tentativa antes de concluir."); return; }
  if (reflection.length < 16) { toast("Escreva pelo menos 16 caracteres na explicação final."); return; }
  if ((item.rubric || []).length && checked.length !== item.rubric.length) { toast("Revise cada critério da autoavaliação antes de concluir."); return; }
  progress.exerciseEvidence[key] = { ...evidence, rubric: checked };
  saveCourseDraft(id);
  progress.exerciseReflections ||= {};
  progress.exerciseReflections[key] = reflection.slice(0, 600);
  progress.answers ||= {};
  progress.answers[id] = true;
  progress.exerciseVersions ||= {};
  progress.exerciseVersions[id] = Number(item.contentVersion || 1);
  progress.completed ||= [];
  if (!progress.completed.includes(id)) progress.completed.push(id);
  progress.attempts ||= {};
  progress.attempts[id] = Math.min(100000, Number(progress.attempts[id] || 0) + 1);
  progress.reviewSchedule ||= {};
  if (!progress.reviewSchedule[id]) {
    progress.reviewSchedule[id] = { intervalIndex: 0, dueAt: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  }
  saveProgress();
  render();
}

function renderReview() {
  setBreadcrumb("Revisão");
  if (!reviewSession) reviewSession = reviewSet();
  const questions = reviewSession;
  const completedReview = reviewQuestionIndex >= questions.length;
  const dueCount = dueExercises().length;
  const upcoming = nextReviewDate();
  const question = questions[reviewQuestionIndex];
  const empty = !questions.length;
  const heading = questions.length && completedReview ? "Rodada concluída" : dueCount ? `${dueCount} ${dueCount === 1 ? "ideia para revisar" : "ideias para revisar"}` : doneCount() ? "Pratique quando quiser" : "As revisões começam com seus exercícios";
  const description = questions.length && completedReview ? dueCount ? `${questions.length} respostas registradas nesta rodada; ${dueCount} ${dueCount === 1 ? "revisão vencida ainda aguarda" : "revisões vencidas ainda aguardam"}.` : `${questions.length} ${questions.length === 1 ? "resposta registrada" : "respostas registradas"}. A próxima revisão aparece no intervalo agendado.` : dueCount ? `${questions.length} perguntas nesta rodada; ${dueCount} ${dueCount === 1 ? "revisão vencida" : "revisões vencidas"} no total. Responda uma vez e siga para a próxima.` : doneCount() ? `Próxima revisão ${upcoming ? `em ${new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(new Date(upcoming))}` : "em breve"}. Você também pode praticar uma pergunta agora.` : "Conclua um exercício para desbloquear a pergunta relacionada a ele.";
  let content = "";
  if (empty) content = `<section class="review-done"><span class="done-icon">✳</span><h2>Seu primeiro conceito está esperando.</h2><p>Conclua um exercício e registre sua explicação final. A pergunta correspondente aparece aqui no intervalo de revisão.</p><a class="button-primary" href="#/javascript/D.01">Começar pelo diagnóstico D.01 <span aria-hidden="true">→</span></a></section>`;
  else if (completedReview) content = `<section class="review-done"><span class="done-icon">✳</span><h2>Revisão concluída.</h2><p>Você respondeu ${questions.length} ${questions.length === 1 ? "pergunta" : "perguntas"} nesta rodada.${dueCount ? ` Ainda há ${dueCount} revisões vencidas.` : " As próximas perguntas aparecem no intervalo agendado."}</p>${dueCount ? `<button type="button" class="button-primary" data-review-next-batch>Continuar para a próxima rodada <span aria-hidden="true">→</span></button>` : `<a class="button-primary" href="#/catalog">Voltar aos exercícios <span aria-hidden="true">→</span></a>`}</section>`;
  else content = `<section class="review-question"><div class="eyebrow">${esc(question.exercise.id)} · ${question.exercise.stage === "D" ? "DIAGNÓSTICO" : `ETAPA ${esc(question.exercise.stage || question.exercise.id.slice(0, 2))}`} · RECUPERAÇÃO ATIVA</div><h2>${renderInlineCode(question.prompt)}</h2><div class="answer-group" role="group" aria-label="Escolha uma resposta">${question.choices.map((choice, index) => `<button class="answer-option" data-review-choice="${index}" aria-pressed="false">${String.fromCharCode(65 + index)}. ${esc(choice)}</button>`).join("")}</div><div class="feedback" id="review-feedback" role="status" aria-live="polite">Responda sem abrir o exercício. Uma tentativa já ajuda a lembrar.</div><div class="review-actions"><a class="hint-link" href="#/javascript/${question.exercise.id}">Rever este exercício</a><button class="button-primary" data-review-check="${question.answer}">Conferir resposta <span aria-hidden="true">→</span></button></div></section>`;
  view.innerHTML = `<section class="page-intro"><div class="eyebrow">RECUPERE, NÃO APENAS RELEIA</div><h1>Revisão em pequenos passos<span class="brand-period">.</span></h1><p>Cada exercício de JavaScript concluído tem uma pergunta de revisão vinculada. Responda de memória e retome o código quando quiser.</p></section><section class="review-banner"><div class="review-icon" aria-hidden="true">↻</div><div><h2>${heading}</h2><p>${description}</p></div><span class="review-progress">${empty ? "0 / 0" : completedReview ? "FEITO" : dueCount ? `${Math.min(reviewQuestionIndex + 1, questions.length)} / ${questions.length}` : "PRÁTICA"}</span></section>${content}`;
}

function checkReview(answer) {
  const selected = document.querySelector("[data-review-choice][aria-pressed=true]");
  const feedback = document.querySelector("#review-feedback");
  if (!selected) { feedback.textContent = "Escolha uma resposta antes de continuar."; feedback.classList.add("error"); return; }
  const correct = Number(selected.dataset.reviewChoice) === Number(answer);
  const question = reviewSession?.[reviewQuestionIndex];
  selected.classList.add(correct ? "correct" : "incorrect");
  feedback.innerHTML = renderInlineCode(correct ? question.correctFeedback : question.incorrectFeedback);
  feedback.classList.toggle("error", !correct);
  if (question) {
    if (question.scheduled) {
      const schedule = progress.reviewSchedule?.[question.exercise.id] || { intervalIndex: 0 };
      if (correct) {
        const intervals = [7, 14, 30, 60];
        const priorIndex = Math.trunc(Number(schedule.intervalIndex) || 0);
        const nextIndex = priorIndex < 0 ? 0 : Math.min(priorIndex + 1, intervals.length - 1);
        schedule.intervalIndex = nextIndex;
        schedule.dueAt = Date.now() + intervals[nextIndex] * 24 * 60 * 60 * 1000;
      } else {
        schedule.intervalIndex = -1;
        schedule.dueAt = Date.now() + 24 * 60 * 60 * 1000;
      }
      schedule.lastReviewedAt = new Date().toISOString();
      progress.reviewSchedule[question.exercise.id] = schedule;
    } else {
      const completedCount = Math.max(doneCount(), 1);
      const currentReviewIndex = Math.max(0, Math.trunc(Number(progress.reviewIndex) || 0)) % completedCount;
      progress.reviewIndex = (currentReviewIndex + 1) % completedCount;
    }
    reviewQuestionIndex += 1;
    if (question.scheduled && reviewQuestionIndex >= reviewSession.length) progress.lastReview = new Date().toLocaleDateString("sv-SE");
    saveProgress();
    document.querySelectorAll("[data-review-choice]").forEach((button) => { button.disabled = true; });
    const button = document.querySelector("[data-review-check]");
    button.disabled = true;
    button.innerHTML = reviewQuestionIndex >= reviewSession.length ? "Rodada completa ✓" : "Próxima pergunta →";
  if (!correct && question.scheduled) feedback.innerHTML += renderInlineCode(" Esta pergunta volta amanhã; siga para a próxima.");
    button.addEventListener("click", () => renderReview(), { once: true });
  }
}


view.addEventListener("click", async (event) => {
  const diagnosticItem = curriculumActivities.find(item => item.id === routeInfo().id && item.stage === "D");
  if (diagnosticItem && window.DevPathDiagnosticUI.handleClick(event, diagnosticItem, stage00Context())) return;
  const stage00Item = curriculumActivities.find(item => item.id === routeInfo().id && item.stage === "00" && item.preparation);
  if (stage00Item && window.DevPathStage00Preparation.handleClick(event, stage00Item, stage00Context())) return;
  const stage01Item = curriculumActivities.find(item => item.id === routeInfo().id && item.stage === "01");
  if (stage01Item && window.DevPathStage01UI.handleClick(event, stage01Item, stage00Context())) return;
  const stage02Item = curriculumActivities.find(item => item.id === routeInfo().id && item.stage === "02");
  if (stage02Item && window.DevPathStage02UI.handleClick(event, stage02Item, stage02Context())) return;
  if (routeInfo().name === "javascript" && window.DevPathStage00UI.handleClick(event, stageContext())) { event.preventDefault(); return; }
  const nextReviewBatch = event.target.closest("[data-review-next-batch]");
  if (nextReviewBatch) { reviewSession = null; reviewQuestionIndex = 0; renderReview(); return; }
  const firstResponse = event.target.closest("[data-course-first-response]");
  if (firstResponse) {
    const id = firstResponse.dataset.courseFirstResponse;
    const response = view.querySelector(`[data-first-response-input="${id}"]`)?.value.trim() || "";
    if (!response) { toast("Registre uma primeira resposta antes de abrir a explicação."); return; }
    progress.exercisePredictions ||= {};
    const item = curriculumActivities.find((activity) => activity.id === id);
    const key = exerciseProgressKey(item);
    progress.exercisePredictions[key] = response.slice(0, 400);
    progress.warmupCompleted ||= {};
    progress.warmupCompleted[key] = true;
    saveProgress();
    render();
    return;
  }
  const completeActivity = event.target.closest("[data-course-complete]");
  if (completeActivity) { completeCourseExercise(completeActivity.dataset.courseComplete); return; }
  const runActivity = event.target.closest("[data-course-run]");
  if (runActivity) { runCourseJavaScript(runActivity.dataset.courseRun); return; }
  const writtenActivity = event.target.closest("[data-course-submit-writing]");
  if (writtenActivity) { submitGuidedWriting(writtenActivity.dataset.courseSubmitWriting); return; }
  const filter = event.target.closest("[data-filter]");
  if (filter) { selectedCatalogFilter = filter.dataset.filter; renderCatalog(); return; }
  const reviewChoice = event.target.closest("[data-review-choice]");
  if (reviewChoice) { document.querySelectorAll("[data-review-choice]").forEach((button) => { button.setAttribute("aria-pressed", String(button === reviewChoice)); button.classList.remove("correct", "incorrect"); }); return; }
  const reviewCheck = event.target.closest("[data-review-check]");
  if (reviewCheck) checkReview(reviewCheck.dataset.reviewCheck);
});

view.addEventListener("input", (event) => {
  const diagnosticItem = curriculumActivities.find(item => item.id === routeInfo().id && item.stage === "D");
  if (diagnosticItem && window.DevPathDiagnosticUI.handleInput(event, diagnosticItem, stage00Context())) return;
  const stage00Item = curriculumActivities.find(item => item.id === routeInfo().id && item.stage === "00" && item.preparation);
  if (stage00Item && window.DevPathStage00Preparation.handleInput(event, stage00Item, stage00Context())) return;
  const stage01Item = curriculumActivities.find(item => item.id === routeInfo().id && item.stage === "01");
  if (stage01Item && window.DevPathStage01UI.handleInput(event, stage01Item, stage00Context())) return;
  const stage02Item = curriculumActivities.find(item => item.id === routeInfo().id && item.stage === "02");
  if (stage02Item && window.DevPathStage02UI.handleInput(event, stage02Item, stage02Context())) return;
  if (event.target.matches("#course-search")) { catalogSearch = event.target.value; updateCatalogResults(); return; }
  if (event.target.matches("[data-course-editor]")) { saveCourseDraft(event.target.dataset.courseEditor); scheduleCourseSave(); return; }
  if (event.target.matches("[data-course-reflection]")) {
    const id = event.target.dataset.courseReflection;
    progress.exerciseReflections ||= {};
    const item = curriculumActivities.find((activity) => activity.id === id);
    progress.exerciseReflections[exerciseProgressKey(item)] = event.target.value.slice(0, 600);
    const count = view.querySelector("[data-course-reflection-count]");
    const button = view.querySelector(`[data-course-complete="${id}"]`);
    if (count) count.textContent = `${event.target.value.trim().length}/16 caracteres`;
    if (button) button.disabled = event.target.value.trim().length < 16;
    scheduleCourseSave();
    syncCourseCompletionButton(id);
    return;
  }
  if (routeInfo().name === "javascript") window.DevPathStage00UI.handleInput(event, stageContext());
});
view.addEventListener("change", (event) => {
  const diagnosticItem = curriculumActivities.find(item => item.id === routeInfo().id && item.stage === "D");
  if (diagnosticItem && window.DevPathDiagnosticUI.handleInput(event, diagnosticItem, stage00Context())) return;
  if (event.target.matches("[data-course-rubric]")) {
    const id = event.target.dataset.courseRubric;
    const selected = [...view.querySelectorAll(`[data-course-rubric="${id}"]:checked`)].map((input) => Number(input.value));
    progress.exerciseEvidence ||= {};
    const item = curriculumActivities.find((activity) => activity.id === id);
    const key = exerciseProgressKey(item);
    progress.exerciseEvidence[key] = { ...progress.exerciseEvidence[key], rubric: selected };
    scheduleCourseSave();
    syncCourseCompletionButton(id);
    return;
  }
  const stage01Item = curriculumActivities.find(item => item.id === routeInfo().id && item.stage === "01");
  if (stage01Item && window.DevPathStage01UI.handleInput(event, stage01Item, stage00Context())) return;
  if (event.target.matches("#stage-filter")) { selectedStageFilter = event.target.value; updateCatalogResults(); }
});
for (const eventName of ["dragstart", "dragover", "dragleave", "drop"]) {
  view.addEventListener(eventName, (event) => {
    if (routeInfo().name === "javascript" && window.DevPathStage00UI.handleDrag(event)) event.preventDefault();
  });
}

window.addEventListener("hashchange", render);
window.addEventListener("beforeunload", () => { if (localPreview) saveProgress(); });
document.querySelector(".help-button").addEventListener("click", () => toast("DevPath: aprender construindo, com uma ideia nova de cada vez."));
document.querySelector(".profile-menu").addEventListener("click", () => toast("Sua conta e suas opções estão no cabeçalho."));
initialize();
