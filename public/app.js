const lessons = [
  {
    slug: "web",
    number: "01",
    title: "Como a web funciona",
    short: "Do endereço que você digita à página que aparece na tela.",
    category: "A web",
    time: "12 min",
    level: "Começando",
    art: "lime",
    glyph: "↗︎ / ↙︎",
    objectives: ["Identificar navegador, servidor e URL.", "Descrever o caminho de uma requisição.", "Ler um endereço web por partes."],
    context: "Antes de construir sua escola de programação, precisamos entender o caminho que uma página faz até você. Quando alguém abre o DevPath, não existe uma cópia mágica esperando no navegador: há uma conversa entre computadores.",
    concept: "O navegador é o cliente: ele pede um recurso. Um servidor recebe o pedido e devolve uma resposta, como um arquivo HTML. DNS ajuda o navegador a encontrar o endereço de rede associado ao domínio.",
    exampleLabel: "O caminho de uma página",
    code: "1. Você abre devpath.dev/trilhas\n2. O DNS encontra o servidor de devpath.dev\n3. O navegador envia uma requisição HTTP\n4. O servidor responde com HTML e outros arquivos\n5. O navegador monta a página na sua tela",
    goals: ["O navegador precisa de um endereço para localizar o site.", "O servidor recebe a requisição e encontra o recurso.", "A resposta volta pela rede e o navegador a interpreta."],
    prompt: "Quando você abre uma página e recebe seu HTML, qual sequência descreve melhor essa conversa?",
    choices: ["O servidor pede o HTML ao navegador, que o guarda no DNS.", "O navegador pede um recurso ao servidor, que devolve uma resposta.", "O DNS cria o HTML e envia direto para o teclado."],
    answer: 1,
    feedback: "Isso: a requisição parte do navegador, e o servidor responde com o recurso pedido.",
    error: "Pense em quem inicia a conversa quando você digita um endereço no navegador.",
    hints: ["Quem tem a iniciativa logo depois de você abrir uma URL?", "Cliente pede; servidor responde."],
    challenge: "Sem consultar o exemplo, escreva em uma frase como uma URL chega a virar uma página na tela.",
    review: "Qual é a diferença entre o papel do navegador e o papel do servidor?",
    reviewChoices: ["O navegador pede recursos; o servidor devolve respostas.", "O servidor controla a tela e o navegador guarda o endereço de rede.", "São dois nomes para o mesmo computador."],
    reviewAnswer: 0
  },
  {
    slug: "html",
    number: "02",
    title: "HTML com intenção",
    short: "Organize uma página usando elementos que dizem o que o conteúdo significa.",
    category: "HTML",
    time: "15 min",
    level: "Começando",
    art: "lilac",
    glyph: "&lt;h1&gt;",
    objectives: ["Reconhecer a estrutura semântica de uma página.", "Escolher o elemento adequado para um objetivo.", "Separar navegação, conteúdo e ações."],
    context: "A primeira tela da plataforma vai apresentar uma aula. Antes de escolher cores e tamanhos, vamos dar significado ao conteúdo. Isso torna a página mais clara para pessoas e tecnologias assistivas.",
    concept: "HTML descreve a estrutura e o significado. Um título principal é um h1; uma ação é um button; um destino é um a. Uma div não substitui esses elementos quando já existe um elemento com o significado certo.",
    exampleLabel: "Uma página de lição",
    code: "<main>\n  <header>\n    <p>HTML · Fundamentos</p>\n    <h1>Uma página com significado</h1>\n  </header>\n  <article>\n    <h2>O objetivo</h2>\n    <p>Organizar o conteúdo para quem aprende.</p>\n    <a href=\"/trilhas\">Voltar às trilhas</a>\n  </article>\n</main>",
    goals: ["main marca o conteúdo principal desta tela.", "h1 comunica o assunto mais importante da página.", "article agrupa uma unidade de conteúdo que faz sentido por si."],
    prompt: "Você quer que a pessoa execute uma ação na tela, como enviar uma resposta. Qual elemento representa melhor essa ação?",
    choices: ["Um button, porque a pessoa vai executar uma ação.", "Um a, mesmo que não exista outra página ou destino.", "Uma div com texto, porque todo conteúdo pode ser clicável."],
    answer: 0,
    feedback: "Boa escolha. Button comunica uma ação e já funciona com teclado e tecnologias assistivas.",
    error: "Considere se essa interação executa uma ação ou leva a outro endereço.",
    hints: ["A pessoa vai a outro lugar ou vai fazer algo nesta tela?", "Ações usam button; navegação usa a."],
    challenge: "Imagine um catálogo com o nome da trilha e um botão para começar. Quais elementos semânticos você usaria para título, conteúdo e ação?",
    review: "Quando você usaria um link (a) e quando usaria um botão (button)?",
    reviewChoices: ["Link para navegar até um destino; botão para executar uma ação.", "Botão para navegar; link para enviar qualquer formulário.", "São intercambiáveis: escolha só pela aparência.",],
    reviewAnswer: 0
  },
  {
    slug: "css",
    number: "03",
    title: "CSS que se adapta",
    short: "Crie uma base visual confortável em telas grandes e pequenas.",
    category: "CSS",
    time: "18 min",
    level: "Começando",
    art: "peach",
    glyph: "{ } + #",
    objectives: ["Usar uma escala curta de espaçamento.", "Organizar conteúdo com CSS Grid.", "Manter leitura e foco em diferentes telas."],
    context: "O catálogo do DevPath tem que funcionar em um notebook e também em um celular. Em vez de desenhar uma versão diferente para cada aparelho, vamos deixar o layout responder ao espaço disponível.",
    concept: "CSS controla a apresentação. Grid pode criar colunas que se ajustam ao espaço mínimo que cada item precisa, enquanto espaçamento e tipografia consistentes mantêm a página legível.",
    exampleLabel: "Uma grade que encontra espaço",
    code: ":root {\n  --space: 1rem;\n}\n\n.course-grid {\n  display: grid;\n  grid-template-columns: repeat(\n    auto-fit,\n    minmax(16rem, 1fr)\n  );\n  gap: var(--space);\n}",
    goals: ["Definir um espaço repetível evita valores aleatórios.", "auto-fit permite usar as colunas que cabem no contêiner.", "minmax mantém cada coluna confortável antes de expandir."],
    prompt: "Uma grade de cursos precisa criar colunas flexíveis que nunca fiquem menores que 16rem. Qual declaração expressa esse limite?",
    choices: ["grid-template-columns: 1fr 1fr 1fr;", "grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));", "position: fixed; width: 16rem;"],
    answer: 1,
    feedback: "Certo. minmax define o mínimo confortável; auto-fit acomoda quantas colunas cabem.",
    error: "Procure a regra que define um mínimo e deixa as colunas crescerem conforme o espaço.",
    hints: ["A propriedade precisa trabalhar com colunas e dimensionamento flexível.", "Combine repeat, auto-fit e minmax."],
    challenge: "Descreva como o número de colunas da grade muda quando o contêiner fica estreito.",
    review: "O que minmax(16rem, 1fr) protege em uma grade responsiva?",
    reviewChoices: ["Cada coluna pode encolher até zero sem restrição.", "Cada coluna mantém ao menos 16rem e pode crescer para ocupar o espaço.", "A grade terá sempre exatamente 16 colunas."],
    reviewAnswer: 1
  }
];

const blankProgress = () => ({ completed: [], answers: {}, attempts: {}, challenges: {}, reviewSchedule: {}, lastLesson: null, activeDays: [], reviewIndex: 0, lastReview: null });
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
  const section = route === "lesson" ? "catalog" : route;
  document.querySelectorAll("[data-nav]").forEach((item) => item.classList.toggle("active", item.dataset.nav === section));
  const dueCount = dueLessons().length;
  document.querySelector("#review-count").textContent = dueCount ? String(dueCount) : "↗";
}

function routeInfo() {
  const path = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (path[0] === "lesson" && lessons.some((lesson) => lesson.slug === path[1])) return { name: "lesson", slug: path[1] };
  if (["catalog", "review"].includes(path[0])) return { name: path[0] };
  return { name: "home" };
}

function lessonBySlug(slug) { return lessons.find((lesson) => lesson.slug === slug) || lessons[0]; }
function isDone(slug) { return progress.completed.includes(slug); }
function doneCount() { return lessons.filter((lesson) => isDone(lesson.slug)).length; }
function percentDone() { return Math.round(doneCount() / lessons.length * 100); }
function currentLesson() { return lessonBySlug(progress.lastLesson || lessons.find((lesson) => !isDone(lesson.slug))?.slug || lessons[0].slug); }
function dueLessons() { return lessons.filter((lesson) => isDone(lesson.slug) && Number(progress.reviewSchedule[lesson.slug]?.dueAt || Infinity) <= Date.now()); }
function nextReviewDate() {
  const dueDates = lessons.filter((lesson) => isDone(lesson.slug)).map((lesson) => Number(progress.reviewSchedule[lesson.slug]?.dueAt || Infinity));
  return dueDates.length ? Math.min(...dueDates) : null;
}

function render() {
  recordActiveDay();
  const route = routeInfo();
  if (route.name !== "review") { reviewSession = null; reviewQuestionIndex = 0; }
  updateNav(route.name);
  if (route.name === "home") renderHome();
  if (route.name === "catalog") renderCatalog();
  if (route.name === "lesson") renderLesson(lessonBySlug(route.slug));
  if (route.name === "review") renderReview();
  document.querySelector("#main").focus({ preventScroll: true });
}

function renderHome() {
  setBreadcrumb("Início");
  const next = currentLesson();
  const allDone = doneCount() === lessons.length;
  const buttonLabel = allDone ? "Revisar ideias" : isDone(next.slug) ? "Retomar trilha" : doneCount() ? "Continuar trilha" : "Começar aula";
  const href = allDone ? "#/review" : `#/lesson/${next.slug}`;
  const nextIntro = allDone ? "As primeiras ideias já são suas. Revise-as em novos contextos." : `${next.title} · ${next.time} de leitura`;
  const week = weekMarkup();
  view.innerHTML = `
    <section class="welcome">
      <div><div class="eyebrow">${new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(new Date()).toUpperCase()} · UMA IDEIA DE CADA VEZ</div><h1>Olá, aprendiz<span class="brand-period">.</span></h1><p>${allDone ? "Sua primeira trilha está completa. Que tal recuperar algumas ideias?" : `Você tem um caminho pela frente. <strong>Vamos dar o próximo passo?</strong>`}</p></div>
      <div class="date-chip">${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()).toUpperCase()}</div>
    </section>
    <section class="continue-panel" aria-labelledby="continue-title">
      <div class="continue-copy"><div class="eyebrow">WEB FOUNDATIONS · AULA ${next.number}</div><h2 id="continue-title">${esc(next.title)}.</h2><p>${esc(nextIntro)}</p>
        <div class="continue-bottom"><a class="button-primary" href="${href}">${buttonLabel}<span aria-hidden="true">→</span></a><span class="subtle-meta">${doneCount()} / ${lessons.length} etapas concluídas</span></div>
      </div>
      <div class="code-art" aria-hidden="true"><div class="code-top"><i></i><i></i><i></i></div><div class="code-line w-1"></div><div class="code-line w-2"></div><div class="code-line w-3"></div><div class="code-line w-4"></div><div class="code-line w-5"></div><span class="code-caption">&lt; seu primeiro projeto /&gt;</span></div>
    </section>
    <section aria-labelledby="path-title"><div class="section-heading"><h2 id="path-title">Sua primeira trilha</h2><a class="text-link" href="#/catalog">Ver trilhas <span aria-hidden="true">→</span></a></div>
      ${lessons.map((lesson) => `<a class="unit-row" href="#/lesson/${lesson.slug}"><span class="unit-index ${isDone(lesson.slug) ? "done" : ""}">${isDone(lesson.slug) ? "✓" : lesson.number}</span><span class="unit-copy"><h3>${esc(lesson.title)}</h3><p>${esc(lesson.short)}</p></span><span class="unit-kind">${esc(lesson.category)}</span><span class="unit-state ${isDone(lesson.slug) ? "complete" : ""}"><i class="state-dot"></i>${isDone(lesson.slug) ? "Concluída" : lesson.time}</span></a>`).join("")}
    </section>
    <div class="bottom-grid"><section class="week-panel" aria-labelledby="week-title"><div class="section-heading"><h2 id="week-title">Um pouco já conta</h2><span class="eyebrow">SEUS ÚLTIMOS 7 DIAS</span></div><div class="week-track">${week}</div></section>
    <aside class="stat-note"><span class="stat-number">${percentDone()}%</span><span class="stat-copy"><strong>${doneCount()} de ${lessons.length} etapas</strong>Seu progresso acompanha<br />o que você conseguiu fazer.</span></aside></div>`;
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
  setBreadcrumb("Trilhas");
  const filters = ["Todas", "Em andamento", "Concluídas"];
  let items = lessons;
  if (selectedCatalogFilter === "Em andamento") items = lessons.filter((lesson) => !isDone(lesson.slug));
  if (selectedCatalogFilter === "Concluídas") items = lessons.filter((lesson) => isDone(lesson.slug));
  view.innerHTML = `<section class="page-intro"><div class="eyebrow">O CAMINHO CRESCE COM VOCÊ</div><h1>Aprender, etapa por etapa<span class="brand-period">.</span></h1><p>Comece pelos fundamentos da web. Cada ideia prepara o terreno para a próxima parte do mesmo projeto.</p></section>
    <div class="catalog-toolbar"><div class="filter-tabs" role="group" aria-label="Filtrar aulas">${filters.map((filter) => `<button class="filter-tab ${selectedCatalogFilter === filter ? "selected" : ""}" data-filter="${filter}" aria-pressed="${selectedCatalogFilter === filter}">${filter}</button>`).join("")}</div><span class="catalog-count">${items.length} ${items.length === 1 ? "AULA" : "AULAS"} · WEB FOUNDATIONS</span></div>
    <section aria-label="Aulas disponíveis">${items.length ? items.map((lesson) => `<article class="catalog-course"><div class="course-art ${lesson.art}"><span class="art-label">${esc(lesson.category)} · ${lesson.number}</span><span class="art-glyph" aria-hidden="true">${lesson.glyph}</span></div><div class="catalog-info"><div class="eyebrow">WEB FOUNDATIONS</div><h2>${esc(lesson.title)}</h2><p>${esc(lesson.short)}</p><div class="course-facts"><span>${lesson.time}</span><span>${lesson.objectives.length} objetivos</span><span>${isDone(lesson.slug) ? "Concluída" : lesson.level}</span></div></div><div class="course-action"><a class="button-primary" href="#/lesson/${lesson.slug}">${isDone(lesson.slug) ? "Revisitar" : "Abrir aula"}<span aria-hidden="true">→</span></a><small>${isDone(lesson.slug) ? "Seu progresso está salvo" : "Exemplo + desafio"}</small></div></article>`).join("") : `<p class="empty-state">Ainda não há aulas nesta categoria. <button class="hint-link" data-filter="Todas">Ver todas</button></p>`}</section>
    <aside class="concept-note"><strong>Por que uma trilha primeiro?</strong><p>Você vai usar uma linguagem e uma base conhecida para resolver problemas reais. Outras linguagens entram quando fizerem sentido para o que você já sabe construir.</p></aside>`;
}

function codeMarkup(lesson) {
  return `<div class="code-block"><pre><code>${esc(lesson.code)}</code></pre><div class="code-toolbar"><span>${esc(lesson.exampleLabel)}</span><button class="copy-button" data-copy="${esc(lesson.slug)}">Copiar exemplo</button></div></div>`;
}

function renderLesson(lesson) {
  setBreadcrumb("Trilhas", lesson.title);
  const next = lessons[(lessons.indexOf(lesson) + 1) % lessons.length];
  const done = isDone(lesson.slug);
  const answeredCorrectly = progress.answers[lesson.slug] === true;
  const hintsUsed = hintIndexes[lesson.slug] || 0;
  view.innerHTML = `<div class="lesson-layout"><article class="lesson-main">
    <a class="lesson-back" href="#/catalog"><span aria-hidden="true">←</span> Todas as aulas</a>
    <div class="eyebrow">WEB FOUNDATIONS · AULA ${lesson.number}</div><h1>${esc(lesson.title)}<span class="brand-period">.</span></h1><p class="lesson-deck">${esc(lesson.short)}</p>
    <div class="lesson-meta"><span>${lesson.time}</span><span>${lesson.objectives.length} objetivos</span><span>${done ? "✓ Concluída" : "Em andamento"}</span></div>
    <div class="lesson-progress" aria-label="Progresso da trilha"><span style="width:${Math.max(8, percentDone())}%"></span></div>
    <section class="lesson-section" id="contexto"><div class="eyebrow">01 · CONTEXTO</div><h2>Um problema do projeto</h2><p>${esc(lesson.context)}</p></section>
    <section class="lesson-section" id="conceito"><div class="eyebrow">02 · IDEIA PRINCIPAL</div><h2>Uma peça de cada vez</h2><p>${esc(lesson.concept)}</p><div class="concept-note"><strong>O que você vai conseguir fazer</strong><ul>${lesson.objectives.map((objective) => `<li>${esc(objective)}</li>`).join("")}</ul></div></section>
    <section class="lesson-section" id="exemplo"><div class="eyebrow">03 · EXEMPLO RESOLVIDO</div><h2>${esc(lesson.exampleLabel)}</h2><p>Leia o exemplo de cima para baixo. Cada passo prepara o seguinte.</p>${codeMarkup(lesson)}<ol class="subgoal-list">${lesson.goals.map((goal) => `<li>${esc(goal)}</li>`).join("")}</ol></section>
    <section class="exercise-box" id="pratica"><div class="exercise-head"><h2>Agora, recupere a ideia</h2><span class="practice-tag">04 · SUA VEZ</span></div><p>${esc(lesson.prompt)}</p>
      <div class="answer-group" role="group" aria-label="Escolha uma resposta">${lesson.choices.map((choice, index) => `<button class="answer-option ${progress.answers[lesson.slug] === true && index === lesson.answer ? "correct" : ""}" data-choice="${index}" aria-pressed="false">${String.fromCharCode(65 + index)}. ${esc(choice)}</button>`).join("")}</div>
      <div class="feedback ${progress.answers[lesson.slug] === false ? "error" : ""}" id="lesson-feedback" role="status" aria-live="polite">${progress.answers[lesson.slug] === true ? esc(lesson.feedback) : progress.answers[lesson.slug] === false ? esc(lesson.error) : "Escolha uma resposta e veja o que vale observar."}</div>
      <div class="exercise-controls"><button class="hint-link" data-hint="${lesson.slug}">${hintsUsed ? "Mais uma pista" : "Preciso de uma pista"}</button><button class="button-primary" data-check="${lesson.slug}">${answeredCorrectly ? "Resposta registrada ✓" : "Conferir resposta"}<span aria-hidden="true">→</span></button></div>
      <div class="lesson-complete">${done ? `<span class="unit-state complete"><i class="state-dot"></i>Aula concluída · revisão sugerida amanhã</span>` : `<form class="challenge-form" data-challenge="${lesson.slug}"><label for="challenge-answer"><strong>Desafio sem passo a passo</strong><span>${esc(lesson.challenge)}</span></label><textarea id="challenge-answer" name="answer" maxlength="600" rows="3" placeholder="Escreva com suas palavras...">${esc(progress.challenges[lesson.slug]?.text || "")}</textarea><div class="challenge-controls"><span class="challenge-note">Sua resposta sincroniza com sua conta.</span><button class="button-primary" type="submit">Registrar tentativa <span aria-hidden="true">→</span></button></div><p class="feedback" id="challenge-feedback" role="status" aria-live="polite">${progress.challenges[lesson.slug] ? "Tentativa registrada. Você pode revisar ou alterar sua resposta." : answeredCorrectly ? "Escreva sua explicação e registre a tentativa para concluir." : "Responda ao quiz e tente o desafio para concluir a aula."}</p></form><button class="button-primary" data-complete="${lesson.slug}" ${answeredCorrectly && progress.challenges[lesson.slug] ? "" : "disabled title=\"Responda ao quiz e registre o desafio\""}>Marcar aula como concluída <span aria-hidden="true">→</span></button>`}</div>
    </section>
    <section class="lesson-section"><div class="eyebrow">05 · VOLTE A ESTA IDEIA</div><h2>Uma pergunta para mais tarde</h2><p>${esc(lesson.review)} Quando terminar as aulas de hoje, esta ideia volta em uma revisão curta.</p></section>
  </article><aside class="lesson-aside"><div class="aside-block"><div class="aside-title">Nesta aula</div><a class="toc-link" href="#contexto"><span class="toc-num">01</span> Um problema do projeto</a><a class="toc-link" href="#conceito"><span class="toc-num">02</span> Ideia principal</a><a class="toc-link" href="#exemplo"><span class="toc-num">03</span> Exemplo resolvido</a><a class="toc-link" href="#pratica"><span class="toc-num">04</span> Sua vez</a></div><div class="aside-block"><div class="aside-title">Você vai levar</div>${lesson.objectives.map((objective, index) => `<div class="toc-link"><span class="toc-num">0${index + 1}</span>${esc(objective)}</div>`).join("")}</div><div class="aside-block"><div class="next-up"><small>Na sequência</small><strong>${esc(next.title)}</strong><span>${next.time} · ${esc(next.category)}</span></div></div></aside></div>`;
}

function reviewSet() {
  const due = dueLessons();
  const mastered = lessons.filter((lesson) => isDone(lesson.slug));
  const pool = due.length ? due : mastered.length ? mastered.slice(0, 1) : lessons.slice(0, 1);
  return pool.map((lesson) => ({ lesson, prompt: lesson.review, choices: lesson.reviewChoices, answer: lesson.reviewAnswer, scheduled: due.some((item) => item.slug === lesson.slug) }));
}

function renderReview() {
  setBreadcrumb("Revisão");
  if (!reviewSession) reviewSession = reviewSet();
  const questions = reviewSession;
  const question = questions[reviewQuestionIndex % questions.length];
  const completedReview = reviewQuestionIndex >= questions.length;
  const dueCount = dueLessons().length;
  const upcoming = nextReviewDate();
  view.innerHTML = `<section class="page-intro"><div class="eyebrow">RECUPERE, NÃO APENAS RELEIA</div><h1>Revisão em pequenos passos<span class="brand-period">.</span></h1><p>Ideias antigas reaparecem para ajudar você a usá-las em novos problemas. Errar faz parte: observe a pista e tente de novo.</p></section>
    <section class="review-banner"><div class="review-icon" aria-hidden="true">↻</div><div><h2>${dueCount ? `${dueCount} ${dueCount === 1 ? "ideia para revisar" : "ideias para revisar"}` : doneCount() ? "Pratique quando quiser" : "Uma pergunta para começar"}</h2><p>${dueCount ? "Responda de memória. Uma resposta correta aumenta o intervalo." : doneCount() ? `Próxima revisão ${upcoming ? `em ${new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(new Date(upcoming))}` : "em breve"}. Uma pergunta opcional está disponível.` : "A revisão começa com a primeira ideia da trilha."}</p></div><span class="review-progress">${completedReview ? "FEITO" : dueCount ? `${Math.min(reviewQuestionIndex + 1, questions.length)} / ${questions.length}` : "PRÁTICA"}</span></section>
    ${completedReview ? `<section class="review-done"><span class="done-icon">✳</span><h2>Revisão concluída.</h2><p>Bom trabalho recuperando essas ideias sem reler a explicação primeiro. Continue a trilha e novos conceitos aparecem por aqui.</p><a class="button-primary" href="#/catalog">Voltar às trilhas <span aria-hidden="true">→</span></a></section>` : `<section class="review-question"><div class="eyebrow">${esc(question.lesson.category.toUpperCase())} · RECUPERAÇÃO ATIVA</div><h2>${esc(question.prompt)}</h2><div class="answer-group" role="group" aria-label="Escolha uma resposta">${question.choices.map((choice, index) => `<button class="answer-option" data-review-choice="${index}" aria-pressed="false">${String.fromCharCode(65 + index)}. ${esc(choice)}</button>`).join("")}</div><div class="feedback" id="review-feedback" role="status" aria-live="polite">Responda sem abrir a aula. Uma tentativa já ajuda a lembrar.</div><div class="review-actions"><a class="hint-link" href="#/lesson/${question.lesson.slug}">Rever a aula depois</a><button class="button-primary" data-review-check="${question.answer}">Conferir resposta <span aria-hidden="true">→</span></button></div></section>`}`;
}

function updateLessonAnswer(lesson, choice) {
  progress.attempts[lesson.slug] = (progress.attempts[lesson.slug] || 0) + 1;
  const correct = choice === lesson.answer;
  progress.answers[lesson.slug] = correct;
  saveProgress();
  const feedback = document.querySelector("#lesson-feedback");
  feedback.textContent = correct ? lesson.feedback : lesson.error;
  feedback.classList.toggle("error", !correct);
  document.querySelectorAll("[data-choice]").forEach((button) => {
    button.classList.remove("correct", "incorrect");
    if (Number(button.dataset.choice) === choice) button.classList.add(correct ? "correct" : "incorrect");
    button.setAttribute("aria-pressed", String(Number(button.dataset.choice) === choice));
  });
  const checkButton = document.querySelector("[data-check]");
  if (correct && checkButton) checkButton.innerHTML = "Resposta registrada ✓";
  const complete = document.querySelector("[data-complete]");
  if (correct && complete && progress.challenges[lesson.slug]) {
    complete.disabled = false;
    complete.removeAttribute("title");
  }
}

function finishLesson(slug) {
  if (!progress.answers[slug]) { toast("Tente o quiz primeiro para registrar esta etapa."); return; }
  if (!progress.completed.includes(slug)) {
    progress.completed.push(slug);
    progress.reviewSchedule[slug] = { intervalIndex: 0, dueAt: Date.now() + 24 * 60 * 60 * 1000 };
  }
  const index = lessons.findIndex((lesson) => lesson.slug === slug);
  const next = lessons[index + 1];
  progress.lastLesson = next ? next.slug : slug;
  saveProgress();
  toast("Aula concluída. Esta ideia volta em uma revisão curta.");
  setTimeout(() => { location.hash = "#/home"; }, 500);
}

function showHint(slug) {
  const lesson = lessonBySlug(slug);
  const current = hintIndexes[slug] || 0;
  const hint = lesson.hints[Math.min(current, lesson.hints.length - 1)];
  hintIndexes[slug] = current + 1;
  const feedback = document.querySelector("#lesson-feedback");
  feedback.textContent = `Pista ${Math.min(current + 1, lesson.hints.length)}: ${hint}`;
  feedback.classList.remove("error");
  const button = document.querySelector("[data-hint]");
  if (button) button.textContent = current + 1 >= lesson.hints.length ? "Última pista" : "Mais uma pista";
}

function checkReview(answer) {
  const selected = document.querySelector("[data-review-choice][aria-pressed=true]");
  const feedback = document.querySelector("#review-feedback");
  if (!selected) { feedback.textContent = "Escolha uma resposta antes de continuar."; feedback.classList.add("error"); return; }
  const correct = Number(selected.dataset.reviewChoice) === Number(answer);
  selected.classList.add(correct ? "correct" : "incorrect");
  feedback.textContent = correct ? "Isso. Você recuperou a ideia sem reler a explicação." : "Ainda não. Volte à diferença entre ação e destino e tente lembrar com suas palavras.";
  feedback.classList.toggle("error", !correct);
  const question = reviewSession?.[reviewQuestionIndex];
  if (question) {
    const schedule = progress.reviewSchedule[question.lesson.slug] || { intervalIndex: 0 };
    if (correct) {
      const intervals = [1, 3, 7, 21];
      schedule.intervalIndex = Math.min((schedule.intervalIndex || 0) + 1, intervals.length - 1);
      schedule.dueAt = Date.now() + intervals[schedule.intervalIndex] * 24 * 60 * 60 * 1000;
    } else {
      schedule.intervalIndex = 0;
      schedule.dueAt = Date.now() + 24 * 60 * 60 * 1000;
    }
    schedule.lastReviewedAt = new Date().toISOString();
    progress.reviewSchedule[question.lesson.slug] = schedule;
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
  const filter = event.target.closest("[data-filter]");
  if (filter) { selectedCatalogFilter = filter.dataset.filter; renderCatalog(); return; }
  const choice = event.target.closest("[data-choice]");
  if (choice) { document.querySelectorAll("[data-choice]").forEach((button) => button.setAttribute("aria-pressed", String(button === choice))); return; }
  const check = event.target.closest("[data-check]");
  if (check) {
    const selected = document.querySelector("[data-choice][aria-pressed=true]");
    if (!selected) { document.querySelector("#lesson-feedback").textContent = "Escolha uma resposta antes de conferir."; document.querySelector("#lesson-feedback").classList.add("error"); return; }
    updateLessonAnswer(lessonBySlug(check.dataset.check), Number(selected.dataset.choice)); return;
  }
  const hint = event.target.closest("[data-hint]");
  if (hint) { showHint(hint.dataset.hint); return; }
  const complete = event.target.closest("[data-complete]");
  if (complete) { finishLesson(complete.dataset.complete); return; }
  const copy = event.target.closest("[data-copy]");
  if (copy) {
    const lesson = lessonBySlug(copy.dataset.copy);
    try { await navigator.clipboard.writeText(lesson.code); copy.textContent = "Copiado ✓"; setTimeout(() => { if (copy.isConnected) copy.textContent = "Copiar exemplo"; }, 1600); }
    catch { toast("Selecione o exemplo e copie com Ctrl+C."); }
    return;
  }
  const reviewChoice = event.target.closest("[data-review-choice]");
  if (reviewChoice) { document.querySelectorAll("[data-review-choice]").forEach((button) => { button.setAttribute("aria-pressed", String(button === reviewChoice)); button.classList.remove("correct", "incorrect"); }); return; }
  const reviewCheck = event.target.closest("[data-review-check]");
  if (reviewCheck) checkReview(reviewCheck.dataset.reviewCheck);
});

view.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-challenge]");
  if (!form) return;
  event.preventDefault();
  const slug = form.dataset.challenge;
  const text = form.elements.answer.value.trim();
  const feedback = form.querySelector("#challenge-feedback");
  if (text.length < 10) {
    feedback.textContent = "Escreva pelo menos uma frase curta para registrar sua tentativa.";
    feedback.classList.add("error");
    form.elements.answer.focus();
    return;
  }
  progress.challenges[slug] = { text, submittedAt: new Date().toISOString() };
  saveProgress();
  feedback.textContent = "Tentativa registrada e sincronizada com sua conta.";
  feedback.classList.remove("error");
  const complete = form.parentElement.querySelector("[data-complete]");
  if (progress.answers[slug] && complete) {
    complete.disabled = false;
    complete.removeAttribute("title");
  }
});

window.addEventListener("hashchange", render);
document.querySelector(".help-button").addEventListener("click", () => toast("DevPath: aprender construindo, com uma ideia nova de cada vez."));
document.querySelector(".profile-menu").addEventListener("click", () => toast("Sua conta e suas opções estão no cabeçalho."));
initialize();
