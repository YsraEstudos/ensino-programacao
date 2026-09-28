const blankProgress = () => ({ completed: [], answers: {}, attempts: {}, challenges: {}, exerciseDrafts: {}, exercisePredictions: {}, exerciseReflections: {}, warmupCompleted: {}, reviewSchedule: {}, lastLesson: null, activeDays: [], reviewIndex: 0, lastReview: null });
let progress = blankProgress();
let saveQueue = Promise.resolve();
let selectedCatalogFilter = "Todas";
let reviewQuestionIndex = 0;
let reviewSession = null;
let hintIndexes = {};
let toastTimer;
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
  if (path[0] === "javascript" && path[1] && window.DevPathStage00UI.activities.some((item) => item.id === path[1])) return { name: "javascript", id: path[1] };
  if (path[0] === "javascript") return { name: "javascript" };
  if (["catalog", "review"].includes(path[0])) return { name: path[0] };
  return { name: "home" };
}

function isExerciseDone(id) { return progress.answers?.[id] === true; }
function doneCount() { return window.DevPathStage00UI.activities.filter((item) => isExerciseDone(item.id)).length; }
function percentDone() { return Math.round(doneCount() / window.DevPathStage00UI.activities.length * 100); }
function dueExercises() { return window.DevPathStage00UI.activities.filter((item) => isExerciseDone(item.id) && Number(progress.reviewSchedule?.[item.id]?.dueAt || Infinity) <= Date.now()); }
function nextReviewDate() {
  const dates = window.DevPathStage00UI.activities.filter((item) => isExerciseDone(item.id)).map((item) => Number(progress.reviewSchedule?.[item.id]?.dueAt || Infinity));
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
  setBreadcrumb("JavaScript", "Exercícios");
  view.innerHTML = window.DevPathStage00UI.renderOverview(progress);
}

function renderJavaScriptExercise(id) {
  const item = window.DevPathStage00UI.activities.find((activity) => activity.id === id);
  if (!item) { location.hash = "#/javascript"; return; }
  setBreadcrumb("JavaScript", `Etapa ${item.stage || item.id.slice(0, 2)}`, item.title);
  view.innerHTML = window.DevPathStage00UI.renderExercise(id, progress);
}

function renderHome() {
  setBreadcrumb("Início");
  const activities = window.DevPathStage00UI.activities;
  const next = activities.find((item) => !isExerciseDone(item.id)) || activities[0];
  const allDone = doneCount() === activities.length;
  const stageIds = [...new Set(activities.map((item) => item.stage || item.id.slice(0, 2)))];
  const stageRows = stageIds.map((stage) => {
    const items = activities.filter((item) => (item.stage || item.id.slice(0, 2)) === stage);
    return `<section class="home-exercise-stage" aria-labelledby="home-stage-${stage}"><div class="section-heading"><h2 id="home-stage-${stage}">JavaScript · Etapa ${stage}</h2>${stage === stageIds[0] ? '<a class="text-link" href="#/catalog">Ver exercícios <span aria-hidden="true">→</span></a>' : ""}</div>${items.map((item,index)=>`<a class="unit-row" href="#/javascript/${item.id}"><span class="unit-index ${isExerciseDone(item.id)?"done":""}">${isExerciseDone(item.id)?"✓":String(index+1).padStart(2,"0")}</span><span class="unit-copy"><h3>${esc(item.title)}</h3><p>${esc(item.objective)}</p></span><span class="unit-kind">JavaScript</span><span class="unit-state ${isExerciseDone(item.id)?"complete":""}"><i class="state-dot"></i>${isExerciseDone(item.id)?"Concluído":esc(item.duration)}</span></a>`).join("")}</section>`;
  }).join("");
  const label = allDone ? "Praticar revisão" : isExerciseDone(next.id) ? "Revisitar exercício" : doneCount() ? "Continuar exercício" : "Começar exercício";
  const href = allDone ? "#/review" : `#/javascript/${next.id}`;
  const week = weekMarkup();
  view.innerHTML = `
    <section class="welcome"><div><div class="eyebrow">${new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(new Date()).toUpperCase()} · UMA IDEIA DE CADA VEZ</div><h1>Olá, aprendiz<span class="brand-period">.</span></h1><p>${allDone ? `Os ${activities.length} exercícios disponíveis estão concluídos. Revise ou pratique novamente.` : "Você tem um caminho pela frente. <strong>Vamos escrever mais uma linha?</strong>"}</p></div><div class="date-chip">${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()).toUpperCase()}</div></section>
    <section class="continue-panel" aria-labelledby="continue-title"><div class="continue-copy"><div class="eyebrow">JAVASCRIPT · EXERCÍCIO ${esc(next.id)}</div><h2 id="continue-title">${esc(next.title)}.</h2><p>${esc(next.objective)}</p><div class="continue-bottom"><a class="button-primary" href="${href}">${label}<span aria-hidden="true">→</span></a><span class="subtle-meta">${doneCount()} / ${activities.length} exercícios concluídos</span></div></div><div class="code-art" aria-hidden="true"><div class="code-top"><i></i><i></i><i></i></div><div class="code-line w-1"></div><div class="code-line w-2"></div><div class="code-line w-3"></div><div class="code-line w-4"></div><div class="code-line w-5"></div><span class="code-caption">console.log("você")</span></div></section>
    ${stageRows}
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
  const activities = window.DevPathStage00UI.activities;
  const filters = ["Todas", "Em andamento", "Concluídas"];
  let items = activities;
  if (selectedCatalogFilter === "Em andamento") items = activities.filter((item) => !isExerciseDone(item.id));
  if (selectedCatalogFilter === "Concluídas") items = activities.filter((item) => isExerciseDone(item.id));
  view.innerHTML = `<section class="page-intro"><div class="eyebrow">JAVASCRIPT · ETAPAS 00 E 01</div><h1>Aprender escrevendo código<span class="brand-period">.</span></h1><p>Cada exercício começa com uma explicação e um exemplo, pede uma previsão, dá espaço para escrever e executar código e termina com uma explicação sua.</p></section><div class="catalog-toolbar"><div class="filter-tabs" role="group" aria-label="Filtrar exercícios">${filters.map((filter)=>`<button class="filter-tab ${selectedCatalogFilter===filter?"selected":""}" data-filter="${filter}" aria-pressed="${selectedCatalogFilter===filter}">${filter}</button>`).join("")}</div><span class="catalog-count">${items.length} ${items.length===1?"EXERCÍCIO":"EXERCÍCIOS"} · JAVASCRIPT</span></div><section aria-label="Exercícios de JavaScript">${items.length?items.map((item,index)=>`<article class="catalog-course"><div class="course-art ${["lime","lilac","peach"][index%3]}"><span class="art-label">${esc(item.id)} · ETAPA ${esc(item.stage || item.id.slice(0, 2))}</span><span class="art-glyph" aria-hidden="true">${["{ }","↻","⇅",'0 ""',"JS","!","+","<>","→","typeof"][window.DevPathStage00UI.activities.indexOf(item)]}</span></div><div class="catalog-info"><div class="eyebrow">${esc(item.focus)}</div><h2>${esc(item.title)}</h2><p>${esc(item.objective)}</p><div class="course-facts"><span>${esc(item.duration)}</span><span>${isExerciseDone(item.id)?"Concluído":"Aquecimento + código"}</span></div></div><div class="course-action"><a class="button-primary" href="#/javascript/${item.id}">${isExerciseDone(item.id)?"Revisitar":"Começar"}<span aria-hidden="true">→</span></a><small>${isExerciseDone(item.id)?"Revisão vinculada":"Prevê · escreve · executa"}</small></div></article>`).join(""):`<p class="empty-state">Nenhum exercício nesta categoria. <button class="hint-link" data-filter="Todas">Ver todos</button></p>`}</section>`;
}

function reviewSet() {
  const activities = window.DevPathStage00UI.activities.filter((item) => isExerciseDone(item.id));
  const due = dueExercises();
  const pool = due.length ? due : activities.slice(0, 1);
  return pool.map((item) => ({ exercise: item, ...item.review, scheduled: due.some((dueItem) => dueItem.id === item.id) }));
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
  const filter = event.target.closest("[data-filter]");
  if (filter) { selectedCatalogFilter = filter.dataset.filter; renderCatalog(); return; }
  const reviewChoice = event.target.closest("[data-review-choice]");
  if (reviewChoice) { document.querySelectorAll("[data-review-choice]").forEach((button) => { button.setAttribute("aria-pressed", String(button === reviewChoice)); button.classList.remove("correct", "incorrect"); }); return; }
  const reviewCheck = event.target.closest("[data-review-check]");
  if (reviewCheck) checkReview(reviewCheck.dataset.reviewCheck);
});

view.addEventListener("input", (event) => {
  if (routeInfo().name === "javascript") window.DevPathStage00UI.handleInput(event, stageContext());
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
