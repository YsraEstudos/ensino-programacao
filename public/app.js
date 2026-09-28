const blankProgress = () => ({ completed: [], answers: {}, attempts: {}, challenges: {}, exerciseDrafts: {}, exercisePredictions: {}, exerciseReflections: {}, warmupCompleted: {}, reviewSchedule: {}, lastLesson: null, activeDays: [], reviewIndex: 0, lastReview: null });
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
      if (Array.isArray(catalog) && catalog.length === 217 && catalog.every((item) => item.id && item.learner === undefined)) {
        curriculumActivities = catalog;
        document.querySelector(".side-path small").textContent = "Etapas 00–20 · 217 exercícios";
      }
    }
  } catch { /* Keep the existing starter catalog if the expanded course asset is unavailable. */ }
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

function isExerciseDone(id) { return progress.answers?.[id] === true; }
function doneCount() { return curriculumActivities.filter((item) => isExerciseDone(item.id)).length; }
function percentDone() { return Math.round(doneCount() / curriculumActivities.length * 100); }
function dueExercises() { return curriculumActivities.filter((item) => isExerciseDone(item.id) && Number(progress.reviewSchedule?.[item.id]?.dueAt || Infinity) <= Date.now()); }
function nextReviewDate() {
  const dates = curriculumActivities.filter((item) => isExerciseDone(item.id)).map((item) => Number(progress.reviewSchedule?.[item.id]?.dueAt || Infinity));
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
  document.querySelector("#main").focus({ preventScroll: true });
}

function stageContext() { return { progress, saveProgress, render }; }

function renderJavaScriptOverview() {
  renderCatalog();
}

function renderJavaScriptExercise(id) {
  const item = curriculumActivities.find((activity) => activity.id === id);
  if (!item) { location.hash = "#/javascript"; return; }
  setBreadcrumb("JavaScript", `Etapa ${item.stage || item.id.slice(0, 2)}`, item.title);
  view.innerHTML = renderCurriculumLesson(item);
}

function renderHome() {
  setBreadcrumb("Início");
  const activities = curriculumActivities;
  const next = activities.find((item) => !isExerciseDone(item.id)) || activities[0];
  const allDone = doneCount() === activities.length;
  const stageIds = [...new Set(activities.map((item) => item.stage || item.id.slice(0, 2)))];
  const stageRows = stageIds.map((stage) => {
    const items = activities.filter((item) => (item.stage || item.id.slice(0, 2)) === stage);
    const completed = items.filter((item) => isExerciseDone(item.id)).length;
    const nextInStage = items.find((item) => !isExerciseDone(item.id)) || items[0];
    return `<a class="path-stage-card" href="#/javascript/${nextInStage.id}"><div><span class="eyebrow">ETAPA ${esc(stage)}</span><strong>${completed} / ${items.length}</strong></div><h2>${esc(items[0].title)}${items.length > 1 ? ` <span>+ ${items.length - 1} atividades</span>` : ""}</h2><div class="stage-progress"><i style="width:${Math.round(completed / items.length * 100)}%"></i></div></a>`;
  }).join("");
  const label = allDone ? "Praticar revisão" : isExerciseDone(next.id) ? "Revisitar exercício" : doneCount() ? "Continuar exercício" : "Começar exercício";
  const href = allDone ? "#/review" : `#/javascript/${next.id}`;
  const week = weekMarkup();
  view.innerHTML = `
    <section class="welcome"><div><div class="eyebrow">${new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(new Date()).toUpperCase()} · UMA IDEIA DE CADA VEZ</div><h1>Olá, aprendiz<span class="brand-period">.</span></h1><p>${allDone ? `Os ${activities.length} exercícios disponíveis estão concluídos. Revise ou pratique novamente.` : "Você tem um caminho pela frente. <strong>Vamos escrever mais uma linha?</strong>"}</p></div><div class="date-chip">${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()).toUpperCase()}</div></section>
    <section class="continue-panel" aria-labelledby="continue-title"><div class="continue-copy"><div class="eyebrow">JAVASCRIPT · EXERCÍCIO ${esc(next.id)}</div><h2 id="continue-title">${esc(next.title)}.</h2><p>${esc(next.objective)}</p><div class="continue-bottom"><a class="button-primary" href="${href}">${label}<span aria-hidden="true">→</span></a><span class="subtle-meta">${doneCount()} / ${activities.length} exercícios concluídos</span></div></div><div class="code-art" aria-hidden="true"><div class="code-top"><i></i><i></i><i></i></div><div class="code-line w-1"></div><div class="code-line w-2"></div><div class="code-line w-3"></div><div class="code-line w-4"></div><div class="code-line w-5"></div><span class="code-caption">console.log("você")</span></div></section>
    <section class="path-overview"><div class="section-heading"><h2>Trilha JavaScript · etapas 00 a 20</h2><a class="text-link" href="#/catalog">Abrir os 217 exercícios →</a></div><div class="path-stage-grid">${stageRows}</div></section>
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
  view.innerHTML = `<section class="page-intro"><div class="eyebrow">JAVASCRIPT · ETAPAS 00 A 20</div><h1>Aprender escrevendo código<span class="brand-period">.</span></h1><p>217 atividades com previsão antes da explicação, espaço para escrever, exemplos públicos e revisão espaçada. Escolha uma etapa ou procure um tema.</p></section><div class="catalog-tools"><label class="course-search-label" for="course-search">Buscar exercício<input id="course-search" type="search" value="${esc(catalogSearch)}" placeholder="Título, tema ou enunciado" autocomplete="off" /></label><label class="stage-select-label" for="stage-filter">Etapa<select id="stage-filter">${["Todas", ...stages].map((stage) => `<option value="${esc(stage)}" ${selectedStageFilter === stage ? "selected" : ""}>${stage === "Todas" ? "Todas as etapas" : `Etapa ${stage}`}</option>`).join("")}</select></label><div class="filter-tabs" role="group" aria-label="Filtrar por progresso">${filters.map((filter) => `<button class="filter-tab ${selectedCatalogFilter === filter ? "selected" : ""}" data-filter="${filter}" aria-pressed="${selectedCatalogFilter === filter}">${filter}</button>`).join("")}</div></div><div class="catalog-count-row"><span id="catalog-count" class="catalog-count"></span><span>Escolha uma atividade para abrir a explicação guiada.</span></div><section id="catalog-results" aria-label="Exercícios de JavaScript"></section>`;
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
  document.querySelector("#catalog-count").textContent = `${items.length} ${items.length === 1 ? "EXERCÍCIO" : "EXERCÍCIOS"} · ${doneCount()} CONCLUÍDOS`;
  const stageIds = [...new Set(items.map((item) => item.stage || item.id.slice(0, 2)))];
  results.innerHTML = items.length ? stageIds.map((stage) => {
    const group = items.filter((item) => (item.stage || item.id.slice(0, 2)) === stage);
    const completed = group.filter((item) => isExerciseDone(item.id)).length;
    return `<section class="catalog-stage" aria-labelledby="catalog-stage-${stage}"><div class="catalog-stage-heading"><div><span class="eyebrow">SEQUÊNCIA CURRICULAR</span><h2 id="catalog-stage-${stage}">Etapa ${esc(stage)}</h2></div><span>${completed} / ${group.length} concluídos</span></div><div class="catalog-card-grid">${group.map((item) => `<article class="catalog-learning-card ${isExerciseDone(item.id) ? "is-complete" : ""}"><div class="catalog-learning-meta"><span>${esc(item.id)} · ${esc(item.kind)}${item.optional ? " · EXTRA" : ""}</span><span>${isExerciseDone(item.id) ? "✓ concluído" : esc(item.duration)}</span></div><h3>${esc(item.title)}</h3><p>${esc(item.firstResponse.action)}</p><a href="#/javascript/${item.id}" class="text-link">${isExerciseDone(item.id) ? "Revisitar atividade" : "Abrir atividade"}<span aria-hidden="true">→</span></a></article>`).join("")}</div></section>`;
  }).join("") : `<p class="empty-state">Nenhum exercício corresponde a esses filtros. Ajuste a busca ou selecione outra etapa.</p>`;
}

function loadCourseDraft(item) {
  const raw = progress.exerciseDrafts?.[item.id];
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

function renderCurriculumLesson(item) {
  const id = item.id;
  const answered = progress.warmupCompleted?.[id] === true || isExerciseDone(id);
  const complete = isExerciseDone(id);
  const prediction = progress.exercisePredictions?.[id] || "";
  const reflection = progress.exerciseReflections?.[id] || "";
  const drafts = loadCourseDraft(item);
  const previous = curriculumActivities[curriculumActivities.indexOf(item) - 1];
  const next = curriculumActivities[curriculumActivities.indexOf(item) + 1];
  const firstFile = item.starterFiles[0];
  const starterPreview = item.starterFiles.map((file) => `<div class="course-file-preview"><span>${esc(file.path)}</span><pre><code>${esc(file.content)}</code></pre></div>`).join("");
  const editors = item.starterFiles.map((file) => `<label class="course-editor-label" for="course-file-${id}-${item.starterFiles.indexOf(file)}"><span>${esc(file.path)}</span><textarea id="course-file-${id}-${item.starterFiles.indexOf(file)}" class="course-editor" data-course-editor="${esc(id)}" data-course-file="${esc(file.path)}" maxlength="${Math.max(80, Math.floor(1100 / item.starterFiles.length))}" spellcheck="false" autocapitalize="off" autocomplete="off">${esc(drafts[file.path] ?? file.content)}</textarea></label>`).join("");
  const exampleDetails = item.examples?.length ? `<details class="course-reveal"><summary>Conferir exemplos públicos depois da sua tentativa</summary><ul>${item.examples.map((example) => `<li><strong>${esc(example.given || "Exemplo")}</strong><span>${esc(example.expected || "")}</span></li>`).join("")}</ul></details>` : "";
  const rubricDetails = item.rubric?.length || item.constraints?.length ? `<details class="course-reveal"><summary>Critérios e limites desta atividade</summary>${item.rubric?.length ? `<h3>Como conferir</h3><ul>${item.rubric.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>` : ""}${item.constraints?.length ? `<h3>Restrições</h3><ul>${item.constraints.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>` : ""}</details>` : "";
  return `<article class="course-lesson"><a class="lesson-back" href="#/catalog">← Todas as etapas</a><header class="course-lesson-hero"><div class="eyebrow">${esc(item.id)} · ETAPA ${esc(item.stage)} · ${esc(item.kind)}${item.optional ? " · ATIVIDADE EXTRA" : ""}</div><h1>${esc(item.title)}<span class="brand-period">.</span></h1><p>${esc(item.firstResponse.action)}</p><div class="course-lesson-meta"><span>${esc(item.duration)}</span><span>Runtime sugerido: ${esc(item.runtime || "JavaScript")}</span><span>${complete ? "✓ concluído" : "em andamento"}</span></div></header><nav class="course-steps" aria-label="Etapas da atividade"><span class="${answered ? "complete" : "active"}">01 · Ler</span><span class="${answered ? "complete" : "active"}">02 · Responder</span><span class="${answered ? "active" : ""}">03 · Entender</span><span class="${complete ? "complete" : ""}">04 · Escrever</span><span class="${complete ? "complete" : ""}">05 · Explicar</span></nav><section class="course-prompt-panel"><div class="course-section-kicker">DESAFIO</div><p class="course-prompt">${esc(item.prompt)}</p><div class="course-interaction-note"><strong>Como responder</strong><p>${esc(item.interaction)}</p></div><div class="course-starter-read"><div class="course-section-kicker">LEIA O ARQUIVO ANTES DE RESPONDER</div>${starterPreview}</div>${answered ? `<div class="course-first-response-saved"><strong>Sua resposta inicial foi registrada</strong><p>${esc(prediction)}</p><span>${esc(item.firstResponse.timing)}</span></div>` : `<label class="course-response-label" for="first-response-${id}"><span>Sua primeira resposta</span><small>${esc(item.firstResponse.timing)}</small><textarea id="first-response-${id}" data-first-response-input="${esc(id)}" maxlength="400" placeholder="Escreva sua previsão, hipótese ou primeira decisão…">${esc(prediction)}</textarea></label><button type="button" class="button-primary" data-course-first-response="${esc(id)}">Registrar resposta e abrir a explicação <span aria-hidden="true">→</span></button>`}</section>${answered ? `<section class="course-explanation-panel"><div class="course-section-kicker">EXPLICAÇÃO GUIADA</div><h2>O modelo mental</h2><p>${esc(item.explanation.mental_model)}</p><h3>Exemplo trabalhado</h3><p>${esc(item.explanation.worked_example)}</p><div class="course-explanation-columns"><div><strong>Armadilha comum</strong><p>${esc(item.explanation.common_trap)}</p></div><div><strong>Por que isso importa</strong><p>${esc(item.explanation.why_it_matters)}</p></div></div>${exampleDetails}${rubricDetails}<div class="course-resources"><h3>Recursos para esta atividade</h3>${renderResources(item.resources)}</div></section><section class="course-practice-panel"><div class="course-section-kicker">SUA VEZ DE ESCREVER</div><h2>Edite o arquivo do exercício</h2><p>Comece pelo código fornecido. Escreva sua tentativa no editor; a página salva o rascunho na sua conta.</p><div class="course-editors">${editors}</div><label class="course-reflection-label" for="course-reflection-${id}"><span>Explique com suas palavras o que você fez ou descobriu</span><textarea id="course-reflection-${id}" data-course-reflection="${esc(id)}" maxlength="600" placeholder="Sua explicação ajuda a consolidar o raciocínio…">${esc(reflection)}</textarea></label><div class="course-complete-row"><span data-course-reflection-count>${reflection.trim().length}/16 caracteres</span><button type="button" class="button-primary" data-course-complete="${esc(id)}" ${complete || reflection.trim().length < 16 ? "disabled" : ""}>${complete ? "Atividade concluída ✓" : "Concluir com minha explicação"}</button></div>${complete ? `<p class="course-complete-note" role="status">Esta atividade foi marcada como concluída. A revisão correspondente entra no intervalo de 7 dias.</p>` : ""}</section><footer class="course-lesson-footer">${previous ? `<a class="button-secondary" href="#/javascript/${previous.id}">← ${esc(previous.id)} · ${esc(previous.title)}</a>` : `<span></span>`}${next ? `<a class="button-secondary" href="#/javascript/${next.id}">${esc(next.id)} · ${esc(next.title)} →</a>` : ""}</footer>` : `<p class="course-gate-note" role="status">A explicação e o editor aparecem depois que você registrar sua primeira resposta.</p>`}</article>`;
}

function reviewSet() {
  const activities = curriculumActivities.filter((item) => isExerciseDone(item.id));
  const due = dueExercises();
  const pool = due.length ? due : activities.slice(0, 1);
  return pool.map((item) => ({ exercise: item, ...item.review, scheduled: due.some((dueItem) => dueItem.id === item.id) }));
}

function saveCourseDraft(id) {
  const editors = [...view.querySelectorAll(`[data-course-editor="${id}"]`)];
  if (!editors.length) return;
  const files = Object.fromEntries(editors.map((editor) => [editor.dataset.courseFile, editor.value]));
  const value = editors.length === 1 ? editors[0].value : `__course_files__:${JSON.stringify(files)}`;
  if (value.length > 2500) { toast("Este rascunho passou do limite salvo para a atividade."); return; }
  progress.exerciseDrafts ||= {};
  progress.exerciseDrafts[id] = value;
}

function scheduleCourseSave() {
  clearTimeout(courseSaveTimer);
  courseSaveTimer = setTimeout(() => { courseSaveTimer = null; saveProgress(); }, 500);
}

function completeCourseExercise(id) {
  const reflection = view.querySelector(`[data-course-reflection="${id}"]`)?.value.trim() || "";
  if (reflection.length < 16) { toast("Escreva pelo menos 16 caracteres na explicação final."); return; }
  saveCourseDraft(id);
  progress.exerciseReflections ||= {};
  progress.exerciseReflections[id] = reflection.slice(0, 600);
  progress.answers ||= {};
  progress.answers[id] = true;
  progress.completed ||= [];
  if (!progress.completed.includes(id)) progress.completed.push(id);
  progress.attempts ||= {};
  progress.attempts[id] = Math.min(100000, Number(progress.attempts[id] || 0) + 1);
  progress.reviewSchedule ||= {};
  progress.reviewSchedule[id] = { intervalIndex: 0, dueAt: Date.now() + 7 * 24 * 60 * 60 * 1000, lastReviewedAt: new Date().toISOString() };
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
  const heading = dueCount ? `${dueCount} ${dueCount === 1 ? "ideia para revisar" : "ideias para revisar"}` : doneCount() ? "Pratique quando quiser" : "As revisões começam com seus exercícios";
  const description = dueCount ? "Estas ideias chegaram ao intervalo de revisão." : doneCount() ? `Próxima revisão ${upcoming ? `em ${new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(new Date(upcoming))}` : "em breve"}. Você também pode praticar uma pergunta agora.` : "Conclua um exercício para desbloquear a pergunta relacionada a ele.";
  let content = "";
  if (empty) content = `<section class="review-done"><span class="done-icon">✳</span><h2>Seu primeiro conceito está esperando.</h2><p>Depois de concluir um exercício com previsão, código executado e explicação, a revisão correspondente aparece aqui.</p><a class="button-primary" href="#/javascript/00.01">Começar o exercício 00.01 <span aria-hidden="true">→</span></a></section>`;
  else if (completedReview) content = `<section class="review-done"><span class="done-icon">✳</span><h2>Revisão concluída.</h2><p>Você recuperou ${questions.length} ${questions.length === 1 ? "ideia" : "ideias"} ligada${questions.length === 1 ? "" : "s"} ao${questions.length === 1 ? " exercício" : "s exercícios"} de JavaScript concluído${questions.length === 1 ? "" : "s"}. Novas perguntas aparecem conforme você progride.</p><a class="button-primary" href="#/catalog">Voltar aos exercícios <span aria-hidden="true">→</span></a></section>`;
  else content = `<section class="review-question"><div class="eyebrow">${esc(question.exercise.id)} · ETAPA ${esc(question.exercise.stage || question.exercise.id.slice(0, 2))} · RECUPERAÇÃO ATIVA</div><h2>${esc(question.prompt)}</h2><div class="answer-group" role="group" aria-label="Escolha uma resposta">${question.choices.map((choice, index) => `<button class="answer-option" data-review-choice="${index}" aria-pressed="false">${String.fromCharCode(65 + index)}. ${esc(choice)}</button>`).join("")}</div><div class="feedback" id="review-feedback" role="status" aria-live="polite">Responda sem abrir o exercício. Uma tentativa já ajuda a lembrar.</div><div class="review-actions"><a class="hint-link" href="#/javascript/${question.exercise.id}">Rever este exercício</a><button class="button-primary" data-review-check="${question.answer}">Conferir resposta <span aria-hidden="true">→</span></button></div></section>`;
  view.innerHTML = `<section class="page-intro"><div class="eyebrow">RECUPERE, NÃO APENAS RELEIA</div><h1>Revisão em pequenos passos<span class="brand-period">.</span></h1><p>Cada exercício de JavaScript concluído tem uma pergunta de revisão vinculada. Responda de memória e retome o código quando quiser.</p></section><section class="review-banner"><div class="review-icon" aria-hidden="true">↻</div><div><h2>${heading}</h2><p>${description}</p></div><span class="review-progress">${empty ? "0 / 0" : completedReview ? "FEITO" : dueCount ? `${Math.min(reviewQuestionIndex + 1, questions.length)} / ${questions.length}` : "PRÁTICA"}</span></section>${content}`;
}

function checkReview(answer) {
  const selected = document.querySelector("[data-review-choice][aria-pressed=true]");
  const feedback = document.querySelector("#review-feedback");
  if (!selected) { feedback.textContent = "Escolha uma resposta antes de continuar."; feedback.classList.add("error"); return; }
  const correct = Number(selected.dataset.reviewChoice) === Number(answer);
  const question = reviewSession?.[reviewQuestionIndex];
  selected.classList.add(correct ? "correct" : "incorrect");
  feedback.textContent = correct ? question.correctFeedback : question.incorrectFeedback;
  feedback.classList.toggle("error", !correct);
  if (question) {
    const schedule = progress.reviewSchedule[question.exercise.id] || { intervalIndex: 0 };
    if (correct) {
      const intervals = [1, 3, 7, 21];
      schedule.intervalIndex = Math.min((schedule.intervalIndex || 0) + 1, intervals.length - 1);
      schedule.dueAt = Date.now() + intervals[schedule.intervalIndex] * 24 * 60 * 60 * 1000;
    } else {
      schedule.intervalIndex = 0;
      schedule.dueAt = Date.now() + 24 * 60 * 60 * 1000;
    }
    schedule.lastReviewedAt = new Date().toISOString();
    progress.reviewSchedule[question.exercise.id] = schedule;
    saveProgress();
  }
  if (correct) {
    reviewQuestionIndex += 1;
    if (reviewQuestionIndex >= reviewSession.length) progress.lastReview = new Date().toLocaleDateString("sv-SE");
    const button = document.querySelector("[data-review-check]");
    button.disabled = true;
    button.innerHTML = reviewQuestionIndex >= reviewSession.length ? "Rodada completa ✓" : "Próxima pergunta →";
    button.addEventListener("click", () => renderReview(), { once: true });
  }
}


view.addEventListener("click", async (event) => {
  if (routeInfo().name === "javascript" && window.DevPathStage00UI.handleClick(event, stageContext())) { event.preventDefault(); return; }
  const firstResponse = event.target.closest("[data-course-first-response]");
  if (firstResponse) {
    const id = firstResponse.dataset.courseFirstResponse;
    const response = view.querySelector(`[data-first-response-input="${id}"]`)?.value.trim() || "";
    if (!response) { toast("Registre uma primeira resposta antes de abrir a explicação."); return; }
    progress.exercisePredictions ||= {};
    progress.exercisePredictions[id] = response.slice(0, 400);
    progress.warmupCompleted ||= {};
    progress.warmupCompleted[id] = true;
    saveProgress();
    render();
    return;
  }
  const completeActivity = event.target.closest("[data-course-complete]");
  if (completeActivity) { completeCourseExercise(completeActivity.dataset.courseComplete); return; }
  const filter = event.target.closest("[data-filter]");
  if (filter) { selectedCatalogFilter = filter.dataset.filter; renderCatalog(); return; }
  const reviewChoice = event.target.closest("[data-review-choice]");
  if (reviewChoice) { document.querySelectorAll("[data-review-choice]").forEach((button) => { button.setAttribute("aria-pressed", String(button === reviewChoice)); button.classList.remove("correct", "incorrect"); }); return; }
  const reviewCheck = event.target.closest("[data-review-check]");
  if (reviewCheck) checkReview(reviewCheck.dataset.reviewCheck);
});

view.addEventListener("input", (event) => {
  if (event.target.matches("#course-search")) { catalogSearch = event.target.value; updateCatalogResults(); return; }
  if (event.target.matches("[data-course-editor]")) { saveCourseDraft(event.target.dataset.courseEditor); scheduleCourseSave(); return; }
  if (event.target.matches("[data-course-reflection]")) {
    const id = event.target.dataset.courseReflection;
    progress.exerciseReflections ||= {};
    progress.exerciseReflections[id] = event.target.value.slice(0, 600);
    const count = view.querySelector("[data-course-reflection-count]");
    const button = view.querySelector(`[data-course-complete="${id}"]`);
    if (count) count.textContent = `${event.target.value.trim().length}/16 caracteres`;
    if (button) button.disabled = event.target.value.trim().length < 16;
    scheduleCourseSave();
    return;
  }
  if (routeInfo().name === "javascript") window.DevPathStage00UI.handleInput(event, stageContext());
});
view.addEventListener("change", (event) => {
  if (event.target.matches("#stage-filter")) { selectedStageFilter = event.target.value; updateCatalogResults(); }
});
for (const eventName of ["dragstart", "dragover", "dragleave", "drop"]) {
  view.addEventListener(eventName, (event) => {
    if (routeInfo().name === "javascript" && window.DevPathStage00UI.handleDrag(event)) event.preventDefault();
  });
}

window.addEventListener("hashchange", render);
document.querySelector(".help-button").addEventListener("click", () => toast("DevPath: aprender construindo, com uma ideia nova de cada vez."));
document.querySelector(".profile-menu").addEventListener("click", () => toast("Sua conta e suas opções estão no cabeçalho."));
initialize();
