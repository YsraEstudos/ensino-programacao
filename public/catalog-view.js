(function (global) {
    "use strict";
    // Injected dependencies: catalogSearch, curriculumActivities, doneCount, esc, isExerciseDone, percentDone, progress, renderInlineCode, requiredActivities, selectedCatalogFilter, selectedStageFilter, setBreadcrumb, view.
    function create(ctx) {
        function catalogStageLabel() {
            const stages = [...new Set(ctx.curriculumActivities.map(item => item.stage))];
            const numbered = stages.filter(stage => stage !== "D").sort();
            const prefix = stages.includes("D") ? "Diagnóstico" : "";
            const range = numbered.length ? `etapas ${numbered[0]}–${numbered.at(-1)}` : "";
            return [prefix, range].filter(Boolean).join(" + ");
        }
        function renderHome() {
            ctx.setBreadcrumb("Início");
            const activities = ctx.curriculumActivities;
            const required = ctx.requiredActivities();
            const next = required.find((item) => !ctx.isExerciseDone(item.id)) || required[0] || activities[0];
            const allDone = ctx.doneCount() === required.length;
            const stageIds = [...new Set(activities.map((item) => item.stage || item.id.slice(0, 2)))];
            const stageRows = stageIds.map((stage) => {
                const items = activities.filter((item) => (item.stage || item.id.slice(0, 2)) === stage);
                const core = items.filter((item) => !item.optional);
                const extras = items.length - core.length;
                const completed = core.filter((item) => ctx.isExerciseDone(item.id)).length;
                const nextInStage = core.find((item) => !ctx.isExerciseDone(item.id)) || core[0] || items[0];
                const stageLabel = stage === "D" ? "DIAGNÓSTICO" : `ETAPA ${ctx.esc(stage)}`;
                return `<a
        class="path-stage-card"
        href="#/javascript/${ctx.esc(nextInStage.id)}">
        <div><span
            class="eyebrow">${stageLabel}</span><strong>${completed} / ${core.length}</strong>
          </div>
          <h2>${ctx.esc((core[0] || items[0]).title)}${items.length > 1 ? ` <span>+ ${items.length - 1} atividades${extras ? `, ${extras} extra` : ""}</span>` : ""}
          </h2>
          <div
            class="stage-progress"><i style="width:${core.length ? Math.round(completed / core.length * 100) : 100}%"></i>
            </div></a>`;
            }).join("");
            const label = allDone ? "Praticar revisão" : ctx.isExerciseDone(next.id) ? "Revisitar exercício" : ctx.doneCount() ? "Continuar exercício" : "Começar exercício";
            const href = allDone ? "#/review" : `#/javascript/${ctx.esc(next.id)}`;
            const week = weekMarkup();
            ctx.view.innerHTML = `
        <section
          class="welcome">
          <div>
            <div
              class="eyebrow">${new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(new Date()).toUpperCase()} · UMA IDEIA DE CADA VEZ
            </div>
            <h1>Olá, aprendiz<span
                class="brand-period">.</span>
            </h1>
            <p>${allDone ? `Os ${required.length} exercícios obrigatórios estão concluídos. Revise ou pratique novamente.` : "Você tem um caminho pela frente. <strong>Vamos escrever mais uma linha?</strong>"}
            </p>
          </div>
          <div
            class="date-chip">${new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date()).toUpperCase()}
          </div>
        </section>
        <section
          class="continue-panel"
          aria-labelledby="continue-title">
          <div
            class="continue-copy">
            <div
              class="eyebrow">JAVASCRIPT · EXERCÍCIO ${ctx.esc(next.id)}
            </div>
            <h2
              id="continue-title">${ctx.esc(next.title)}.
            </h2>
            <p>${ctx.esc(next.objective)}
            </p>
            <div
              class="continue-bottom"><a
                class="button-primary"
                href="${href}">${label}<span
                aria-hidden="true">→</span></a><span
              class="subtle-meta">${ctx.doneCount()} / ${required.length} exercícios obrigatórios concluídos</span>
            </div>
          </div>
          <div
            class="code-art"
            aria-hidden="true">
            <div
              class="code-top"><i></i><i></i><i></i>
            </div>
            <div
              class="code-line w-1">
            </div>
            <div
              class="code-line w-2">
            </div>
            <div
              class="code-line w-3">
            </div>
            <div
              class="code-line w-4">
            </div>
            <div
              class="code-line w-5">
            </div><span
              class="code-caption">console.log("você")</span>
          </div>
        </section>
        <section
          class="path-overview">
          <div
            class="section-heading">
            <h2>JavaScript · ${ctx.esc(catalogStageLabel())}
            </h2><a
              class="text-link"
              href="#/catalog">Abrir os ${activities.length} exercícios →</a>
            </div>
            <div
              class="path-stage-grid">${stageRows}
            </div>
          </section>
          <div
            class="bottom-grid">
            <section
              class="week-panel"
              aria-labelledby="week-title">
              <div
                class="section-heading">
                <h2
                  id="week-title">Um pouco já conta
                </h2><span
                  class="eyebrow">SEUS ÚLTIMOS 7 DIAS</span>
              </div>
              <div
                class="week-track">${week}
              </div>
            </section>
            <aside
              class="stat-note"><span
                class="stat-number">${ctx.percentDone()}%</span><span
                class="stat-copy"><strong>${ctx.doneCount()} de ${required.length} exercícios obrigatórios</strong>Seu progresso acompanha<br />o que você conseguiu fazer.</span>
                </aside>
              </div>`;
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
                const active = ctx.progress.activeDays.includes(iso);
                days.push(`
        <div
          class="day-cell ${todayFlag ? "today" : ""} ${active && !todayFlag ? "was-active" : ""}"><span>${names[date.getDay()]}</span><span
          class="day-mark">${active ? "✓" : todayFlag ? "·" : "–"}</span>
        </div>`);
            }
            return days.join("");
        }
        function renderCatalog() {
            ctx.setBreadcrumb("Exercícios");
            const filters = ["Todas", "Em andamento", "Concluídas"];
            const stages = [...new Set(ctx.curriculumActivities.map((item) => item.stage))];
            ctx.view.innerHTML = `
        <section
          class="page-intro">
          <div
            class="eyebrow">JAVASCRIPT · ${ctx.esc(catalogStageLabel().toLocaleUpperCase("pt-BR"))}
          </div>
          <h1>Aprender escrevendo código<span
              class="brand-period">.</span>
          </h1>
          <p>${ctx.curriculumActivities.length} atividades com previsão antes da explicação, espaço para escrever, exemplos públicos e revisão espaçada. Escolha uma etapa ou procure um tema.
          </p>
        </section>
        <div
          class="catalog-tools">
          <label
            class="course-search-label" for="course-search">Buscar exercício<input
            id="course-search"
            type="search" value="${ctx.esc(ctx.catalogSearch)}"
            placeholder="Título, tema ou enunciado"
            autocomplete="off" />
          </label>
          <label
            class="stage-select-label" for="stage-filter">Etapa<select
              id="stage-filter">${["Todas", ...stages].map((stage) => `<option value="${ctx.esc(stage)}" ${ctx.selectedStageFilter === stage ? "selected" : ""}>${stage === "Todas" ? "Todas as etapas" : stage === "D" ? "Diagnóstico inicial" : `Etapa ${ctx.esc(stage)}`}</option>`).join("")}</select>
            </label>
            <div
              class="filter-tabs"
              role="group"
              aria-label="Filtrar por progresso">${filters.map((filter) => `<button
        class="filter-tab ${ctx.selectedCatalogFilter === filter ? "selected" : ""}"
        data-filter="${ctx.esc(filter)}"
        aria-pressed="${ctx.selectedCatalogFilter === filter}">${ctx.esc(filter)}</button>`).join("")}
            </div>
          </div>
          <div
            class="catalog-count-row"><span
              id="catalog-count"
              class="catalog-count"></span><span>Escolha uma atividade para abrir a explicação guiada.</span>
          </div>
          <section
            id="catalog-results"
            aria-label="Exercícios de JavaScript">
          </section>`;
            updateCatalogResults();
        }
        function updateCatalogResults() {
            const results = document.querySelector("#catalog-results");
            if (!results)
                return;
            const query = ctx.catalogSearch.trim().toLocaleLowerCase("pt-BR");
            let items = ctx.curriculumActivities.filter((item) => {
                const stage = item.stage || item.id.slice(0, 2);
                if (ctx.selectedCatalogFilter === "Em andamento" && ctx.isExerciseDone(item.id))
                    return false;
                if (ctx.selectedCatalogFilter === "Concluídas" && !ctx.isExerciseDone(item.id))
                    return false;
                if (ctx.selectedStageFilter !== "Todas" && stage !== ctx.selectedStageFilter)
                    return false;
                if (query && !`${ctx.esc(item.id)} ${item.title} ${item.kind} ${item.prompt} ${item.firstResponse?.action || ""}`.toLocaleLowerCase("pt-BR").includes(query))
                    return false;
                return true;
            });
            document.querySelector("#catalog-count").textContent = `${items.length} ${items.length === 1 ? "EXERCÍCIO" : "EXERCÍCIOS"} · ${ctx.doneCount()} / ${ctx.requiredActivities().length} OBRIGATÓRIOS CONCLUÍDOS`;
            const stageIds = [...new Set(items.map((item) => item.stage || item.id.slice(0, 2)))];
            results.innerHTML = items.length ? stageIds.map((stage) => {
                const group = items.filter((item) => (item.stage || item.id.slice(0, 2)) === stage);
                const core = group.filter((item) => !item.optional);
                const extras = group.length - core.length;
                const completed = core.filter((item) => ctx.isExerciseDone(item.id)).length;
                return `
        <section
          class="catalog-stage"
          aria-labelledby="catalog-stage-${ctx.esc(stage)}">
          <div
            class="catalog-stage-heading">
            <div><span
                class="eyebrow">SEQUÊNCIA CURRICULAR</span>
              <h2
                id="catalog-stage-${ctx.esc(stage)}">${stage === "D" ? "Diagnóstico inicial" : `Etapa ${ctx.esc(stage)}`}
              </h2>
            </div><span>${completed} / ${core.length} obrigatórios${extras ? ` · ${extras} extras opcionais` : ""}</span>
            </div>
            <div
              class="catalog-card-grid">${group.map((item) => {
                    const order = core.indexOf(item);
                    return `
        <article
          class="catalog-learning-card ${ctx.isExerciseDone(item.id) ? "is-complete" : ""}">
          <div
            class="catalog-learning-meta"><span>${ctx.esc(item.id)} · ${ctx.esc(item.kind)}${item.optional ? " · EXTRA OPT-IN" : ` · ${order + 1} de ${core.length}`}</span><span>${ctx.isExerciseDone(item.id) ? "✓ concluído" : `estimativa ${ctx.esc(item.duration)}`}</span>
            </div>
            <h3>${ctx.esc(item.title)}
            </h3>
            <p>${ctx.renderInlineCode(item.firstResponse?.action || item.objective)}
            </p><a
              href="#/javascript/${ctx.esc(item.id)}"
              class="text-link">${ctx.isExerciseDone(item.id) ? "Revisitar atividade" : "Abrir atividade"}<span
              aria-hidden="true">→</span></a>
        </article>`;
                }).join("")}
            </div>
          </section>`;
            }).join("") : `
        <p
          class="empty-state">Nenhum exercício corresponde a esses filtros. Ajuste a busca ou selecione outra etapa.
        </p>`;
        }
        return Object.freeze({ catalogStageLabel, renderHome, weekMarkup, renderCatalog, updateCatalogResults });
    }
    global.DevPathCatalogView = Object.freeze({ create });
})(window);
