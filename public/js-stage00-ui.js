(function (global) {
    "use strict";
    const activities = global.DevPathStage00Activities;
    let hintCount = {};
    let pendingSave = null;
    let pendingContext = null;
    let runToken = 0;
    const esc = global.DevPathTeachingUtils.escapeHTML;
    function byId(id) { return activities.find((item) => item.id === id); }
    function done(progress, id) { return progress.answers?.[id] === true; }
    function renderOverview(progress) {
        const completed = activities.filter((item) => done(progress, item.id)).length;
        const stages = [...new Set(activities.map((item) => item.stage || item.id.slice(0, 2)))];
        const cards = stages.map((stage) => {
            const items = activities.filter((item) => (item.stage || item.id.slice(0, 2)) === stage);
            const stageDone = items.filter((item) => done(progress, item.id)).length;
            return `
      <section
        class="js00-stage-group"
        aria-labelledby="stage-${stage}">
      <div
        class="js00-stage-heading">
      <div>
      <div
        class="eyebrow">JAVASCRIPT · SEQUÊNCIA CURRICULAR
      </div>
      <h2
        id="stage-${stage}">Etapa ${stage}
      </h2>
      </div><span>${stageDone} / ${items.length} concluídos</span>
      </div>
      <div
        class="js00-card-grid">${items.map((item) => `
      <article
        class="js00-card ${done(progress, item.id) ? "is-done" : ""}">
      <div
        class="js00-card-top"><span>${esc(item.id)}</span><span>${done(progress, item.id) ? "✓ concluído" : esc(item.duration)}</span>
      </div>
      <div
        class="js00-card-orbit"
        aria-hidden="true"><span>${[
                "{ }", "↻", "⇅", '0 ""', "JS", "!", "+", "<>", "→", "typeof"
            ][activities.indexOf(item)]}</span>
      </div>
      <h3>${esc(item.title)}
      </h3>
      <p>${esc(item.objective)}
      </p><a
        class="button-primary"
        href="#/javascript/${item.id}">${done(progress, item.id) ? "Revisitar" : "Aprender e praticar"}<span
        aria-hidden="true">→</span></a>
      </article>`).join("")}</div></section>`;
        }).join("");
        return `
      <section
        class="js00-overview">
      <div
        class="eyebrow">JAVASCRIPT · EXERCÍCIOS
      </div>
      <h1>Aprenda escrevendo<span
        class="brand-period">.</span>
      </h1>
      <p
        class="js00-lead">Aqueça com um exemplo, confira seu raciocínio, preveja a saída e escreva código antes de executar.
      </p>
      <div
        class="js00-progress"
        aria-label="Progresso geral dos exercícios"><span style="width:${completed / activities.length * 100}%"></span>
      </div>
      <p
        class="js00-progress-caption">${completed} de ${activities.length} exercícios concluídos · uma revisão vinculada a cada atividade.</p>${cards}
      <aside
        class="js00-runtime-note"><strong>O que você vai executar</strong>
      <p>O ambiente didático valida apenas as construções ensinadas em cada atividade. Ele não executa JavaScript arbitrário nem substitui navegador ou Node.js.
      </p>
      </aside>
      </section>`;
    }
    function renderExercise(id, progress) {
        const item = byId(id);
        if (!item)
            return "";
        const warmupPassed = progress.warmupCompleted?.[id] === true || done(progress, id);
        const exerciseDone = done(progress, id);
        const draft = typeof progress.exerciseDrafts?.[id] === "string" ? progress.exerciseDrafts[id] : item.starter;
        const code = draft.slice(0, 600);
        const prediction = typeof progress.exercisePredictions?.[id] === "string" ? progress.exercisePredictions[id] : "";
        const reflection = typeof progress.exerciseReflections?.[id] === "string" ? progress.exerciseReflections[id] : "";
        const micro = item.micro;
        const isRebuild = item.id === "00.03";
        const isMap = item.id === "00.05";
        const isHtml = item.codeMode === "html";
        const visual = isRebuild ? `
      <section
        class="js00-card-work"
        aria-labelledby="blocks-heading">
      <div
        class="js00-section-kicker">04 · INTERAÇÃO
      </div>
      <h2
        id="blocks-heading">Monte a rotina
      </h2>
      <p>Reordene os cartões úteis. Arraste com o mouse ou use os botões para teclado.
      </p><ol
        class="js00-block-list" data-block-list>${item.blocks.map((block, index) => `
      <li
        class="js00-block" draggable="true"
        data-block-index="${index}" data-correct="${block.correct}" data-code="${esc(block.text)}"><span
        class="js00-block-grip"
        aria-hidden="true">⠿</span><span>${esc(block.label)}</span><span><button
        type="button"
        data-move="up"
        aria-label="Mover ${esc(block.label)} para cima">↑</button><button
        type="button"
        data-move="down"
        aria-label="Mover ${esc(block.label)} para baixo">↓</button></span></li>`).join("")}</ol><button
        type="button"
        class="button-secondary" data-sync-blocks>Levar blocos úteis ao editor</button>
      <p
        class="js00-feedback" data-block-feedback
        aria-live="polite">O cartão Pausar é um distrator e deve ficar de fora.
      </p>
      </section>` : isMap ? `
      <section
        class="js00-card-work">
      <div
        class="js00-section-kicker">04 · CLASSIFICAÇÃO
      </div>
      <h2>Organize os 12 cartões
      </h2>
      <p>Escolha uma categoria em cada cartão. Para fetch e console, considere o runtime e registre “depende”.
      </p>
      <div
        class="js00-vocab-grid">${item.cards.map(([label], index) => `
      <label
        class="js00-vocab-card"><span>${esc(label)}</span><select
        data-vocab="${index}" aria-label="Categoria de ${esc(label)}"><option value="">Escolher</option>${item.categories.map((category) => `<option value="${esc(category)}">${esc(category)}</option>`).join("")}</select></label>`).join("")}
      </div><button
        type="button"
        class="button-secondary" data-check-map>Conferir os cartões</button>
      <p
        class="js00-feedback" data-map-feedback
        aria-live="polite">
      </p>
      </section>` : "";
        return `
      <article
        class="js00-exercise"><a
        class="lesson-back"
        href="#/javascript">← Visão geral da etapa</a>
      <header
        class="js00-hero">
      <div
        class="eyebrow">${esc(item.id)} · ${esc(item.focus)}
      </div>
      <h1>${esc(item.title)}<span
        class="brand-period">.</span>
      </h1>
      <p>${esc(item.objective)}
      </p>
      <div
        class="js00-hero-meta"><span>${esc(item.duration)}</span><span>${done(progress, id) ? "✓ concluído" : "em andamento"}</span><span>rascunho salvo automaticamente</span>
      </div>
      </header>
      
      <div
        class="js00-steps"
        aria-label="Etapas da atividade">${[
            "01 Aquecer", "02 Conferir", "03 Prever", "04 Escrever", "05 Executar", "06 Explicar"
        ].map((label, index) => `<span
        class="${index < (exerciseDone ? 6 : warmupPassed ? 2 : 0) ? "complete" : index === (exerciseDone ? -1 : warmupPassed ? 2 : 0) ? "active" : ""}">${label}</span>`).join("")}
      </div>
      
      <section
        class="js00-learn">
      <div
        class="js00-section-kicker">01 · APRENDER ANTES DE PRATICAR
      </div>
      <h2>Uma ideia de cada vez
      </h2>
      <p>${esc(item.explanation)}
      </p>
      <ul
        class="js00-vocabulary">${item.vocabulary.map((line) => `
      <li>${esc(line)}</li>`).join("")}
      </ul>
      </section>
      
      <section
        class="js00-worked"
        data-demo-complete="${warmupPassed}">
      <div
        class="js00-section-kicker">02 · AQUECIMENTO ANIMADO
      </div>
      <div
        class="js00-worked-head">
      <div>
      <h2>Veja o código em ação
      </h2>
      <p>O exemplo é revelado linha por linha; cada saída aparece na ordem de execução.
      </p>
      </div>
      <div
        class="js00-play-controls"><button
        type="button"
        data-step="back"
        aria-label="Passo anterior">←</button><button
        type="button"
        data-step="play">Assistir ao exemplo</button><button
        type="button"
        data-step="next"
        aria-label="Próximo passo">→</button>
      </div>
      </div>
      <div
        class="js00-demo-status" data-demo-status
        role="status"
        aria-live="polite">${warmupPassed ? "Aquecimento concluído. Você pode rever o exemplo." : "Assista à demonstração completa para liberar a pergunta rápida."}
      </div>
      <div
        class="js00-trace"><pre data-trace-code>${esc(item.example)}</pre>
      <div
        class="js00-trace-output" data-trace-output
        aria-live="polite"><span>As saídas aparecerão aqui, uma por vez.</span>
      </div>
      </div><ol
        class="js00-walkthrough">${item.walkthrough.map((line, index) => `
      <li
        data-walkthrough="${index}">${esc(line)}</li>`).join("")}</ol>
      </section>
      
      <section
        class="js00-micro">
      <div
        class="js00-section-kicker">02 · CONFERIR ENTENDIMENTO
      </div>
      <h2>Uma pergunta rápida
      </h2>
      <p>${esc(micro.question)}
      </p>
      <div
        class="js00-choice-list"
        role="group"
        aria-label="Resposta rápida">${micro.choices.map((choice, index) => `<button
        type="button"
        class="js00-choice"
        data-micro-choice="${index}" aria-pressed="${warmupPassed && index === micro.answer}" ${!warmupPassed ? "disabled" : ""}>${String.fromCharCode(65 + index)} · ${esc(choice)}</button>`).join("")}
      </div>
      <p
        class="js00-feedback" data-micro-feedback
        aria-live="polite">${warmupPassed ? `Aquecimento concluído. ${esc(micro.feedback)}` : "A pergunta será liberada depois da demonstração."}
      </p>
      </section>
      
      <p
        class="js00-practice-gate" data-practice-gate
        role="status" ${warmupPassed ? "hidden" : ""}>Responda corretamente para começar a prática.
      </p>
      
      <div
        class="js00-practice-unlocked" data-practice-unlocked ${warmupPassed ? "" : "hidden"}>${visual}
      
      <section
        class="js00-practice">
      <div
        class="js00-section-kicker">${isMap || isRebuild ? "05" : "04"} · SUA VEZ DE ESCREVER
      </div>
      <h2>Você no teclado
      </h2>
      <p>${esc(item.prompt)}
      </p>
      <label
        class="js00-prediction">${esc(item.prediction)}<input
        data-prediction="${esc(id)}" type="text" maxlength="120" placeholder="Registre sua previsão antes de executar" value="${esc(prediction)}" />
      </label>
      <label
        class="js00-code-label" for="editor-${esc(id)}">${isHtml ? "Editor de HTML" : "Editor de código"} · até 600 caracteres
      </label><textarea
        id="editor-${esc(id)}" class="js00-editor" data-stage-editor="${esc(id)}" maxlength="600" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="syntax-${esc(id)}">${esc(code)}</textarea>
      <div
        id="syntax-${esc(id)}" class="js00-syntax-note">${isHtml ? "Tags aceitas nesta prática: form, label, input e button; atributos: id, for e class." : item.id === "01.01" ? "Use console.log(typeof valor) com os literais apresentados; sem variáveis ou execução geral de JavaScript." : "Use uma chamada console.log(...) por linha. Aceitos: strings, números, typeof dos valores ensinados e somas simples."}
      </div>
      <div
        class="js00-run-row"><button
        type="button"
        class="button-primary"
        data-run="${esc(id)}">${isHtml ? "Conferir estrutura" : "Executar meu código"} <span
        aria-hidden="true">▶</span></button><button
        type="button"
        class="button-secondary"
        data-hint="${esc(id)}">Preciso de uma dica</button><span
        class="js00-attempts">${Number(progress.attempts?.[id] || 0)} ${Number(progress.attempts?.[id] || 0) === 1 ? "execução" : "execuções"}</span>
      </div>
      <p
        class="js00-feedback js00-run-feedback" data-run-feedback
        aria-live="polite">
      </p>
      <div
        class="js00-result" data-result hidden
        aria-live="polite">
      </div>
      <div
        class="js00-reflection" data-reflection hidden><strong>Agora, explique o que aconteceu.</strong>
      <p>Compare sua previsão com a saída. ${esc(item.reflectionPrompt)}
      </p>
      <label
        class="js00-code-label" for="reflection-${esc(id)}">Sua explicação · pelo menos 16 caracteres
      </label><textarea
        id="reflection-${esc(id)}" data-reflection-input="${esc(id)}" maxlength="300" placeholder="Escreva com suas palavras…">${esc(reflection)}</textarea>
      <div
        class="js00-reflection-footer"><span data-reflection-count>${reflection.trim().length}/16 caracteres</span><button
        type="button"
        class="button-primary"
        data-submit-reflection="${esc(id)}" ${reflection.trim().length < 16 ? "disabled" : ""}>Concluir com minha explicação</button>
      </div>
      <p
        class="js00-feedback" data-reflection-feedback
        aria-live="polite">
      </p>
      </div>
      <div
        class="js00-hint" data-hint-panel hidden
        aria-live="polite">
      </div>
      <div
        class="js00-transfer" data-transfer hidden><strong>Leve a ideia para outro contexto</strong>
      <p>${esc(item.transfer)}
      </p>
      </div>
      </section>
      
      <aside
        class="js00-misconception"><strong>Uma confusão comum</strong>
      <p>${esc(item.misconception)}
      </p>
      </aside>
      <footer
        class="js00-footer"><a
        class="text-link"
        href="#/javascript">Voltar à visão geral</a>${activities[activities.indexOf(item) + 1] ? `<a
        class="button-secondary"
        href="#/javascript/${activities[activities.indexOf(item) + 1].id}">Próximo exercício →</a>` : ""}</footer></div></article>`;
    }
    function saveField(context, bucket, id, value, maximum) {
        context.progress[bucket] ||= {};
        context.progress[bucket][id] = String(value).slice(0, maximum);
        clearTimeout(pendingSave);
        pendingContext = context;
        pendingSave = setTimeout(() => { pendingSave = null; pendingContext?.saveProgress(); pendingContext = null; }, 500);
    }
    function saveDraft(context, id, value) { saveField(context, "exerciseDrafts", id, value, 600); }
    function flushDraft(context) {
        if (!pendingSave)
            return;
        clearTimeout(pendingSave);
        pendingSave = null;
        (pendingContext || context).saveProgress();
        pendingContext = null;
    }
    function activateStep(root, index) {
        root.querySelectorAll(".js00-steps span").forEach((step, stepIndex) => {
            step.classList.toggle("complete", stepIndex < index);
            step.classList.toggle("active", stepIndex === index);
        });
    }
    function completeSteps(root) {
        root.querySelectorAll(".js00-steps span").forEach((step) => {
            step.classList.remove("active");
            step.classList.add("complete");
        });
    }
    function unlockPractice(root) {
        root.querySelector("[data-practice-gate]").hidden = true;
        root.querySelector("[data-practice-unlocked]").hidden = false;
        activateStep(root, 2);
        const heading = root.querySelector("[data-practice-unlocked] h2");
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
        heading.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
    function showMicrocheck(button, item, context) {
        const group = button.closest(".js00-micro");
        group.querySelectorAll("[data-micro-choice]").forEach((choice) => choice.setAttribute("aria-pressed", String(choice === button)));
        const feedback = group.querySelector("[data-micro-feedback]");
        const correct = Number(button.dataset.microChoice) === item.micro.answer;
        feedback.textContent = `${correct ? "Isso. " : "Quase. "}${item.micro.feedback}`;
        feedback.classList.toggle("error", !correct);
        feedback.classList.toggle("success", correct);
        if (correct) {
            const root = button.closest(".js00-exercise");
            context.progress.warmupCompleted ||= {};
            context.progress.warmupCompleted[item.id] = true;
            context.saveProgress();
            unlockPractice(root);
        }
    }
    function showHint(button, item) {
        const count = Math.min((hintCount[item.id] || 0) + 1, item.hints.length);
        hintCount[item.id] = count;
        const panel = button.closest(".js00-practice").querySelector("[data-hint-panel]");
        panel.hidden = false;
        const level = ["conceito", "trecho relevante", "exemplo parecido"][count - 1] || "pista";
        panel.textContent = `Dica ${count} de ${item.hints.length} · ${level}: ${item.hints[count - 1]}`;
        button.textContent = count < item.hints.length ? "Próxima dica" : "Ver dica novamente";
    }
    function moveBlock(button, direction) {
        const row = button.closest("[data-block-index]");
        const target = direction === "up" ? row.previousElementSibling : row.nextElementSibling;
        if (!target || !target.matches("[data-block-index]"))
            return;
        if (direction === "up")
            row.parentNode.insertBefore(row, target);
        else
            row.parentNode.insertBefore(target, row);
        row.querySelector(`[data-move="${direction}"]`).focus();
    }
    function handleClick(event, context) {
        const target = event.target.closest("[data-stage-action], [data-micro-choice], [data-hint], [data-run], [data-submit-reflection], " +
            "[data-step], [data-move], [data-sync-blocks], [data-check-map]");
        if (!target)
            return false;
        const id = target.dataset.stageAction || target.dataset.microChoice !== undefined && target.closest(".js00-exercise")?.querySelector("[data-run]")?.dataset.run || target.dataset.hint || target.dataset.run || target.dataset.submitReflection || target.closest(".js00-exercise")?.querySelector("[data-run]")?.dataset.run;
        const item = byId(id);
        if (!item)
            return false;
        if (target.hasAttribute("data-micro-choice")) {
            showMicrocheck(target, item, context);
            return true;
        }
        if (target.hasAttribute("data-hint")) {
            showHint(target, item);
            return true;
        }
        if (target.hasAttribute("data-move")) {
            moveBlock(target, target.dataset.move);
            return true;
        }
        if (target.hasAttribute("data-check-map")) {
            const selects = [...target.closest(".js00-card-work").querySelectorAll("[data-vocab]")];
            const correct = selects.filter((select) => select.value === item.cards[Number(select.dataset.vocab)][1]).length;
            const feedback = target.parentElement.querySelector("[data-map-feedback]");
            feedback.textContent = `${correct} de ${selects.length} classificações corretas. Revise fetch e console pensando no ambiente em que estão disponíveis.`;
            feedback.classList.toggle("success", correct === selects.length);
            feedback.classList.toggle("error", correct !== selects.length);
            return true;
        }
        if (target.hasAttribute("data-sync-blocks")) {
            const rows = [...target.parentElement.querySelectorAll("[data-block-index]")];
            const useful = rows.filter((row) => row.dataset.correct === "true");
            const order = useful.map((row) => row.querySelector("span:nth-child(2)").textContent);
            const textarea = target.closest(".js00-exercise").querySelector("[data-stage-editor]");
            textarea.value = useful.map((row) => row.dataset.code).join("\n");
            saveDraft(context, item.id, textarea.value);
            const feedback = target.parentElement.querySelector("[data-block-feedback]");
            feedback.textContent = order.join(" → ") === "Acordar → Estudar → Praticar" ? "Boa ordem. Confira se o editor também tem exatamente essas três chamadas." : `A ordem atual é ${order.join(" → ")}. Compare com o objetivo da rotina.`;
            feedback.classList.toggle("success", order.join(" → ") === "Acordar → Estudar → Praticar");
            return true;
        }
        if (target.hasAttribute("data-step")) {
            animateWalkthrough(target, item);
            return true;
        }
        if (target.hasAttribute("data-run")) {
            runCode(target, item, context);
            return true;
        }
        if (target.hasAttribute("data-submit-reflection")) {
            submitReflection(target, item, context);
            return true;
        }
        return true;
    }
    function animateWalkthrough(button, item) {
        const section = button.closest(".js00-worked");
        const output = section.querySelector("[data-trace-output]");
        const lines = item.example.split("\n");
        const list = [...section.querySelectorAll("[data-walkthrough]")];
        const current = Number(section.dataset.traceStep || -1);
        const action = button.dataset.step;
        if (action === "play") {
            const wasComplete = section.dataset.demoComplete === "true";
            section.dataset.traceStep = "0";
            if (section._traceTimer) clearInterval(section._traceTimer);
            output.innerHTML = "";
            section.querySelector("[data-demo-status]").textContent = "Acompanhe cada linha até o fim para liberar a pergunta rápida.";
            if (!wasComplete) {
                section.parentElement.querySelectorAll("[data-micro-choice]").forEach((choice) => { choice.disabled = true; });
            }
            let step = 0;
            const reveal = () => {
                list.forEach((el, index) => el.classList.toggle("is-active", index === step));
                const line = document.createElement("div");
                line.className = "js00-trace-line";
                line.innerHTML = `<span>${step + 1}</span><code></code>`;
                line.querySelector("code").textContent = lines[step];
                output.append(line);
                step += 1;
                if (step >= lines.length) {
                    clearInterval(section._traceTimer);
                    section.dataset.demoComplete = "true";
                    section.querySelector("[data-demo-status]").textContent = "Demonstração concluída. A pergunta rápida está liberada.";
                    if (!wasComplete) {
                        activateStep(section.closest(".js00-exercise"), 1);
                        section.parentElement.querySelectorAll("[data-micro-choice]").forEach((choice) => { choice.disabled = false; });
                        section.parentElement.querySelector("[data-micro-feedback]").textContent = "Agora responda para abrir a prática.";
                    }
                }
            };
            reveal();
            section._traceTimer = setInterval(reveal, matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 650);
            return;
        }
        if (section._traceTimer) clearInterval(section._traceTimer);
        const next = Math.max(0, Math.min(lines.length - 1, current + (action === "next" ? 1 : -1)));
        section.dataset.traceStep = String(next);
        list.forEach((el, index) => el.classList.toggle("is-active", index === next));
        output.replaceChildren();
        const line = document.createElement("div");
        line.className = "js00-trace-line";
        const number = document.createElement("span");
        number.textContent = String(next + 1);
        const code = document.createElement("code");
        code.textContent = lines[next];
        line.append(number, code);
        output.append(line);
    }
    function renderOutput(values, sourceLine) {
        const row = document.createElement("div");
        row.className = "js00-output-line";
        const lineMarker = document.createElement("span");
        lineMarker.className = "js00-source-line";
        lineMarker.textContent = `linha ${sourceLine}`;
        row.append(lineMarker);
        values.forEach((value, index) => {
            if (index) {
                const comma = document.createElement("span");
                comma.className = "js00-output-comma";
                comma.textContent = ", ";
                row.append(comma);
            }
            const token = document.createElement("span");
            token.className = `js00-output-value ${typeof value === "number" ? "is-number" : "is-string"}`;
            token.textContent = typeof value === "string" && value.length === 0 ? "⟨texto vazio⟩" : String(value);
            if (typeof value === "string" && value.length === 0)
                token.setAttribute("aria-label", "string vazia");
            row.append(token);
        });
        return row;
    }
    function readableValues(values) {
        return values.map((value) => typeof value === "string" && value.length === 0 ? "⟨texto vazio⟩" : String(value)).join(" · ");
    }
    async function runCode(button, item, context) {
        flushDraft(context);
        const root = button.closest(".js00-exercise");
        const editor = root.querySelector("[data-stage-editor]");
        const feedback = root.querySelector("[data-run-feedback]");
        const resultBox = root.querySelector("[data-result]");
        const reflection = root.querySelector("[data-reflection]");
        const prediction = root.querySelector("[data-prediction]").value.trim();
        if (!prediction) {
            feedback.textContent = "Registre sua previsão antes de executar o código.";
            feedback.classList.remove("success");
            feedback.classList.add("error");
            root.querySelector("[data-prediction]").focus();
            return;
        }
        activateStep(root, 4);
        root.dataset.latestRunCorrect = "false";
        const code = editor.value.slice(0, 600);
        const parsed = global.DevPathStage00Runner.interpret(code, item.codeMode || "javascript");
        const attempt = (Number(context.progress.attempts?.[item.id]) || 0) + 1;
        context.progress.attempts ||= {};
        context.progress.attempts[item.id] = attempt;
        context.saveProgress();
        root.querySelector(".js00-attempts").textContent = `${attempt} ${attempt === 1 ? "execução" : "execuções"}`;
        resultBox.hidden = false;
        reflection.hidden = true;
        feedback.classList.remove("success", "error");
        resultBox.replaceChildren();
        if (!parsed.ok) {
            feedback.textContent = parsed.error.message;
            feedback.classList.add("error");
            context.saveProgress();
            return;
        }
        const outputs = parsed.lines.map((line) => line.values);
        const outputHead = document.createElement("strong");
        outputHead.textContent = item.codeMode === "html" ? "Estrutura reconhecida" : "Saída do seu programa";
        resultBox.append(outputHead);
        const token = ++runToken;
        for (let index = 0; index < outputs.length; index += 1) {
            if (token !== runToken)
                return;
            const animated = document.createElement("div");
            animated.className = "js00-animated-output";
            animated.append(renderOutput(outputs[index], parsed.lines[index].sourceLine));
            resultBox.append(animated);
            if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
                await new Promise((resolve) => setTimeout(resolve, 220));
        }
        if (!outputs.length)
            resultBox.append(document.createTextNode("Nenhuma chamada console.log foi encontrada."));
        if (item.baseline) {
            const comparison = document.createElement("div");
            comparison.className = "js00-comparison";
            const heading = document.createElement("strong");
            heading.textContent = "Comparação: antes e agora";
            comparison.append(heading);
            item.baseline.forEach((before, index) => {
                const after = outputs[index] || [];
                const changed = JSON.stringify(before) !== JSON.stringify(after);
                const row = document.createElement("div");
                row.className = `js00-change ${changed ? "has-changed" : "stayed-same"}`;
                const status = document.createElement("span");
                status.textContent = changed ? `Linha ${index + 1} · mudou` : `Linha ${index + 1} · igual`;
                const values = document.createElement("code");
                values.textContent = `${readableValues(before)}  →  ${readableValues(after) || "sem saída"}`;
                row.append(status, values);
                comparison.append(row);
            });
            resultBox.append(comparison);
        }
        const blocksInOrder = item.id === "00.03"
            ? [...root.querySelectorAll("[data-block-index]")].filter((row) => row.dataset.correct === "true").map((row) => row.querySelector("span:nth-child(2)").textContent).join(" → ") === "Acordar → Estudar → Praticar"
            : true;
        const vocab = [...root.querySelectorAll("[data-vocab]")];
        const cardsCorrect = item.id === "00.05"
            ? vocab.length === 12 && vocab.every((select) => select.value === item.cards[Number(select.dataset.vocab)][1])
            : true;
        let codeCorrect = item.codeMode === "html" ? parsed.validation?.complete === true : JSON.stringify(outputs) === JSON.stringify(item.expected);
        if (item.minimumEdits) {
            const initial = String(item.starter || "").split(/\r?\n/);
            const current = code.split(/\r?\n/);
            const changedLines = Math.max(initial.length, current.length);
            const edits = Array.from({ length: changedLines }, (_, index) => initial[index] !== current[index]).filter(Boolean).length;
            codeCorrect = codeCorrect && edits >= item.minimumEdits;
        }
        if (item.id === "00.01")
            codeCorrect = outputs.length === 3 && typeof outputs[0]?.[0] === "string" && outputs[0][0].trim().length > 0 && JSON.stringify(outputs.slice(1)) === JSON.stringify([[10], ["Até a próxima!"]]);
        if (item.id === "00.03")
            codeCorrect = outputs.length === 3 && JSON.stringify(outputs.slice(0, 2)) === JSON.stringify([["Acordar"], ["Estudar"]]) && typeof outputs[2]?.[0] === "string" && outputs[2][0].trim().length > 0 && outputs[2][0].trim() !== "Praticar";
        const exact = codeCorrect && blocksInOrder && cardsCorrect;
        root.dataset.latestRunCorrect = String(exact);
        const predictionFeedback = ` Sua previsão: “${prediction.slice(0, 120)}”.`;
        const baselineNote = item.baseline ? ` Antes, a linha numérica mostrava ${item.baseline[1][0]}; agora mostra ${outputs[1]?.[0] ?? "outro valor"}.` : "";
        if (exact) {
            activateStep(root, 5);
            context.progress.answers ||= {};
            if (context.progress.answers[item.id] !== true)
                context.progress.answers[item.id] = false;
            feedback.textContent = `Saída correta. Compare-a com sua previsão e escreva uma explicação para concluir: ${item.expectedLabel}${baselineNote}${predictionFeedback}`;
            feedback.classList.add("success");
            reflection.hidden = false;
            root.querySelector("[data-reflection-feedback]").textContent = "";
            root.querySelector("[data-reflection-input]").focus({ preventScroll: true });
            reflection.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
            context.saveProgress();
        }
        else {
            const wasComplete = context.progress.answers?.[item.id] === true;
            const structuralNote = parsed.validation?.issues?.length ? ` ${parsed.validation.issues.join(" ")}` : "";
            const editNote = item.minimumEdits ? ` Personalize pelo menos ${item.minimumEdits} linhas em relação ao modelo e preserve os tipos esperados.` : "";
            feedback.textContent = item.codeMode === "html" || structuralNote
                ? `A estrutura ainda precisa de ajustes.${structuralNote}${predictionFeedback}`
                : `Compare a saída exibida com o objetivo (${item.expectedLabel}). Revise a primeira chamada diferente e tente novamente.${editNote}${predictionFeedback}`;
            feedback.classList.add("error");
            if (!wasComplete)
                context.progress.answers[item.id] = false;
        }
        if (item.id === "00.03") {
            const rows = [...root.querySelectorAll("[data-block-index]")];
            const order = rows.filter((row) => row.dataset.correct === "true").map((row) => row.querySelector("span:nth-child(2)").textContent);
            const okay = order.join(" → ") === "Acordar → Estudar → Praticar";
            const blockFeedback = root.querySelector("[data-block-feedback]");
            blockFeedback.textContent = okay ? "Ordem dos blocos conferida; o distrator ficou de fora." : `A ordem dos blocos úteis ficou ${order.join(" → ") || "vazia"}. Ajuste os cartões e confira novamente.`;
            blockFeedback.classList.toggle("success", okay);
        }
        if (item.id === "00.05") {
            const selects = [...root.querySelectorAll("[data-vocab]")];
            const correct = selects.filter((select) => select.value === item.cards[Number(select.dataset.vocab)][1]).length;
            const cardFeedback = root.querySelector("[data-map-feedback]");
            cardFeedback.textContent = `${correct} de ${selects.length} cartões classificados corretamente.`;
            cardFeedback.classList.toggle("success", correct === selects.length);
        }
    }
    function submitReflection(button, item, context) {
        const root = button.closest(".js00-exercise");
        const input = root.querySelector("[data-reflection-input]");
        const feedback = root.querySelector("[data-reflection-feedback]");
        const explanation = input.value.trim();
        if (root.dataset.latestRunCorrect !== "true") {
            feedback.textContent = "Execute novamente o código depois da última alteração para confirmar a saída.";
            feedback.classList.add("error");
            return;
        }
        if (explanation.length < 16) {
            feedback.textContent = "Escreva uma frase curta com pelo menos 16 caracteres.";
            feedback.classList.add("error");
            input.focus();
            return;
        }
        context.progress.exerciseReflections ||= {};
        context.progress.exerciseReflections[item.id] = explanation.slice(0, 300);
        context.progress.answers ||= {};
        context.progress.answers[item.id] = true;
        context.progress.completed ||= [];
        if (!context.progress.completed.includes(item.id))
            context.progress.completed.push(item.id);
        context.progress.reviewSchedule ||= {};
        if (!context.progress.reviewSchedule[item.id])
            context.progress.reviewSchedule[item.id] = { intervalIndex: 0, dueAt: Date.now() + 24 * 60 * 60 * 1000 };
        root.querySelector("[data-transfer]").hidden = false;
        completeSteps(root);
        button.disabled = true;
        button.textContent = "Explicação registrada ✓";
        feedback.textContent = "Explicação registrada. Exercício concluído.";
        feedback.classList.remove("error");
        feedback.classList.add("success");
        context.saveProgress();
    }
    function invalidateRun(root, step) {
        root.dataset.latestRunCorrect = "false";
        activateStep(root, step);
        root.querySelector("[data-reflection]").hidden = true;
        root.querySelector("[data-transfer]").hidden = true;
        const feedback = root.querySelector("[data-run-feedback]");
        feedback.textContent = "Previsão ou código alterados. Execute novamente antes de explicar o resultado.";
        feedback.classList.remove("success");
        feedback.classList.add("error");
    }
    function handleInput(event, context) {
        const editor = event.target.closest("[data-stage-editor]");
        if (editor) {
            saveDraft(context, editor.dataset.stageEditor, editor.value);
            invalidateRun(editor.closest(".js00-exercise"), 4);
            return true;
        }
        const prediction = event.target.closest("[data-prediction]");
        if (prediction) {
            saveField(context, "exercisePredictions", prediction.dataset.prediction, prediction.value, 120);
            invalidateRun(prediction.closest(".js00-exercise"), 2);
            return true;
        }
        const reflection = event.target.closest("[data-reflection-input]");
        if (reflection) {
            saveField(context, "exerciseReflections", reflection.dataset.reflectionInput, reflection.value, 300);
            const section = reflection.closest("[data-reflection]");
            const length = reflection.value.trim().length;
            section.querySelector("[data-reflection-count]").textContent = `${length}/16 caracteres`;
            section.querySelector("[data-submit-reflection]").disabled = length < 16;
            return true;
        }
        return false;
    }
    function handleDrag(event) {
        const row = event.target.closest("[data-block-index]");
        if (event.type === "dragstart" && row) {
            event.dataTransfer.setData("text/plain", row.dataset.blockIndex);
            event.dataTransfer.effectAllowed = "move";
            return true;
        }
        if (event.type === "dragover" && row) {
            event.preventDefault();
            row.classList.add("is-drop-target");
            return true;
        }
        if (event.type === "dragleave" && row) {
            row.classList.remove("is-drop-target");
            return true;
        }
        if (event.type === "drop" && row) {
            event.preventDefault();
            row.classList.remove("is-drop-target");
            const source = row.parentElement.querySelector(`[data-block-index="${Number(event.dataTransfer.getData("text/plain"))}"]`);
            if (source && source !== row)
                row.parentElement.insertBefore(source, row);
            return true;
        }
        return false;
    }
    global.DevPathStage00UI = Object.freeze({
        activities, renderOverview, renderExercise, handleClick, handleInput, handleDrag, flushDraft
    });
})(window);
