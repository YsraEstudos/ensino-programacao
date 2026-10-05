(function (global) {
    "use strict";
    // Injected dependencies: curriculumActivities, doneCount, dueExercises, esc, isExerciseDone, nextReviewDate, progress, renderInlineCode, reviewQuestionIndex, reviewSchedule, reviewSession, saveProgress, setBreadcrumb, updateNav, view.
    function create(ctx) {
        function reviewSet() {
            const activities = ctx.curriculumActivities.filter((item) => ctx.isExerciseDone(item.id));
            const due = ctx.dueExercises().sort((a, b) => Number(ctx.progress.reviewSchedule?.[a.id]?.dueAt) - Number(ctx.progress.reviewSchedule?.[b.id]?.dueAt));
            if (due.length)
                return due.slice(0, 12).map((item) => ({ exercise: item, ...item.review, scheduled: true }));
            if (!activities.length)
                return [];
            const index = Math.max(0, Math.trunc(Number(ctx.progress.reviewIndex) || 0)) % activities.length;
            return [{ exercise: activities[index], ...activities[index].review, scheduled: false }];
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
        function renderReview() {
            ctx.setBreadcrumb("Revisão");
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
                content = `
        <section
          class="review-question">
          <div
            class="eyebrow">${ctx.esc(question.exercise.id)} · ${question.exercise.stage === "D" ? "DIAGNÓSTICO" : `ETAPA ${ctx.esc(question.exercise.stage || question.exercise.id.slice(0, 2))}`} · RECUPERAÇÃO ATIVA
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
              href="#/javascript/${ctx.esc(question.exercise.id)}">Rever este exercício</a><button
              class="button-primary"
              data-review-check="${Number(question.answer)}">Conferir resposta <span
              aria-hidden="true">→</span></button>
        </div>
        </section>`;
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
        }
        function checkReview(answer) {
            const question = ctx.reviewSession?.[ctx.reviewQuestionIndex];
            if (!question)
                return;
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
            if (question) {
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
        }
        return Object.freeze({ reviewSet, reviewSummary, renderReview, checkReview });
    }
    global.DevPathReviewController = Object.freeze({ create });
})(window);
