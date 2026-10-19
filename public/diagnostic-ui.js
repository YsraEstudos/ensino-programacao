(function (global) {
    'use strict';
    const esc = value => global.DevPathTeachingUtils.escapeHTML(value ?? "");
    const configFor = item => global.DevPathDiagnosticPreparation[item.id];
    const key = item => Number(item.contentVersion || 1) > 1 ? `${item.id}@v${item.contentVersion}` : item.id;
    const expandedDiagnostic = item => /^D\.0[6-9]$/.test(item.id);
    function readState(item, progress) {
        let saved;
        try {
            saved = JSON.parse(progress.exercisePredictions?.[key(item)] || '');
        }
        catch {
            saved = {};
        }
        const config = configFor(item), expanded = expandedDiagnostic(item);
        return {
            answers: config.fields.map((field, index) => {
                const answer = expanded && saved?.v === 1 ? saved.a?.[index] : saved?.answers?.[index];
                return field.options.some(option => option.value === answer) ? answer : '';
            }),
            confidence: typeof (expanded && saved?.v === 1 ? saved?.c : saved?.confidence) === 'number'
                && Number.isInteger(expanded && saved?.v === 1 ? saved.c : saved.confidence)
                && (expanded && saved?.v === 1 ? saved.c : saved.confidence) >= 0
                && (expanded && saved?.v === 1 ? saved.c : saved.confidence) <= 100
                ? (expanded && saved?.v === 1 ? saved.c : saved.confidence) : null,
            revision: expanded && Number.isInteger(saved?.r) && saved.r >= 0 ? saved.r : 0,
        };
    }
    const ready = state => state.answers.every(Boolean) && state.confidence !== null;
    function snapshot(item, state) {
        return expandedDiagnostic(item) ? JSON.stringify({v:1,a:state.answers,c:state.confidence,r:state.revision})
            : JSON.stringify({answers:state.answers,confidence:state.confidence});
    }
    function latestSubmission(item, progress) {
        return progress.exerciseEvidence?.[key(item)]?.diagnostic?.submissions?.at(-1) || null;
    }
    function reviewed(item, progress, state) {
        if (!ready(state)) return false;
        const evidence = progress.exerciseEvidence?.[key(item)];
        if (evidence?.status !== 'written' || evidence.output !== snapshot(item,state)) return false;
        if (!expandedDiagnostic(item)) return true;
        const latest = latestSubmission(item,progress), record = progress.exerciseLearning?.[item.id];
        if (!latest || latest.snapshot !== evidence.output || latest.revision !== state.revision
            || latest.contentVersion !== Number(item.contentVersion || 1)) return false;
        if (record?.mode === 'recall' && latest.attemptId !== record.attemptId) return false;
        return true;
    }
    const canComplete = (item, progress, state) => reviewed(item, progress, state) && progress.warmupCompleted?.[key(item)] === true;
    const labelFor = (field, value) => field.options.find(option => option.value === value)?.label || 'Ainda sem resposta';
    function feedback(item, state, submission) {
        const config = configFor(item);
        return `
      
      <div
       
        class="diagnostic-feedback">${config.fields.map((field, index) => `
      
      <article>
      
      <h3>${esc(field.label)}
      
      </h3>
      
      <p
       
        class="diagnostic-compare">Sua resposta: ${esc(labelFor(field, state.answers[index]))}<br>Resposta explicada: ${esc(labelFor(field, field.expected))}
      
      </p>
      
      <p>${state.answers[index] === 'unknown' ? 'Tudo bem começar sem saber. Leia a explicação abaixo para conhecer esta ideia.' : state.answers[index] === field.expected ? 'Sua previsão acompanha a regra deste caso.' : 'Este caso mostra uma ideia que você pode retomar na trilha.'}
      
      </p>
      
      <p>${esc(field.explanation)}</p></article>`).join('')}
      
      </div>${expandedDiagnostic(item) ? `<aside class="diagnostic-recommendation" data-diagnostic-recommendation><strong>${submission?.recommendations?.length ? `Entrada sugerida: ${esc(submission.recommendations[0])}` : 'Sem sugestão de entrada para esta tentativa'}</strong><p>${submission?.recommendations?.length ? `A sugestão limitada considera os campos deste diagnóstico que cobrem ${esc(Object.keys(submission.coverage || {}).join(', '))}. Ela não certifica uma etapa, não conclui atividades anteriores e não é prova independente.` : 'Você ainda pode estudar e concluir o diagnóstico. Campos desconhecidos, ausentes, incorretos ou uma tentativa assistida não liberam uma entrada.'}</p></aside>` : ''}
      
      <h3>Acompanhe o raciocínio
      
      </h3><ol>${config.feedbackSteps.map(step => `
      
      <li>${esc(step)}</li>`).join('')}</ol>
      
      <aside
       
        class="diagnostic-guide"><strong>Seu próximo passo</strong>
      
      <p>${esc(config.nextStep)}
      
      </p>
      
      <p>${esc(config.takeaway)}</p></aside>`;
    }
    function render(item, ctx = {}) {
        const progress = ctx.progress || (ctx.progress = {}), config = configFor(item), state = readState(item, progress);
        const done = progress.answers?.[item.id] === true && Number(progress.exerciseVersions?.[item.id] || 1) === Number(item.contentVersion || 1);
        const didReview = reviewed(item, progress, state), submission = latestSubmission(item,progress);
        const activities = ctx.activities || [], index = activities.findIndex(entry => entry.id === item.id);
        const next = activities[index + 1];
        const diagnosticIndex = activities.filter(entry => entry.stage === 'D').findIndex(entry => entry.id === item.id) + 1;
        const diagnosticCount = activities.filter(entry => entry.stage === 'D').length || 9;
        const journey = [['look', 'Observar', 'Leia com calma'], ['answer', 'Responder', 'Registre uma hipótese'], ['review', 'Conferir', 'Entenda o resultado']];
        const prior = progress.exercisePredictions?.[key(item)];
        let legacy = '';
        if (prior && !prior.startsWith('{"answers":') && !(expandedDiagnostic(item) && prior.startsWith('{"v":1,"a":')))
            legacy = `
      
      <details
       
        class="s00-glossary"><summary>Sua resposta anterior foi preservada</summary>
      
      <p>${esc(prior)}</p></details>`;
        return `
      
      <article
       
        class="course-lesson s00-lesson diagnostic-lesson"
       
        data-diagnostic-id="${esc(item.id)}" data-learning-journey>
      <a
       
        class="lesson-back"
       
        href="#/catalog">Voltar à trilha de JavaScript</a>
      
      
      <header
       
        class="course-lesson-hero">
      
      <div
       
        class="s00-hero-top">
      
      <div
       
        class="eyebrow">JAVASCRIPT <span>/</span> DIAGNÓSTICO INICIAL
      
      </div><span
       
        class="s00-lesson-index">${esc(item.id)}</span>
      
      </div>
      
      <h1>${esc(item.title)}
      
      </h1>
      
      <p>${esc(config.introduction)}
      
      </p>

      ${['READ', 'INVESTIGATE'].includes(item.kind) && Array.isArray(item.rubric) && item.rubric.length === 3 ? `<section class="diagnostic-reading-criteria" aria-label="Critérios de ${item.kind === 'READ' ? 'leitura' : 'investigação'}"><h2>Critérios para conferir sua ${item.kind === 'READ' ? 'leitura' : 'investigação'}</h2><ul>${item.rubric.map(criterion => `<li>${esc(criterion)}</li>`).join('')}</ul></section>` : ''}
      
      <div
       
        class="s00-hero-meta"><span><i
       
        aria-hidden="true"></i>${esc(item.duration)} · no seu ritmo</span><span>${diagnosticIndex || item.id.slice(-1)} de ${diagnosticCount} · sem nota</span><span>${done ? 'Diagnóstico registrado' : 'Não exige estudo prévio'}</span>
      
      </div>
      
      </header>
      
      
      <nav
       
        class="s00-journey"
       
        aria-label="Roteiro do diagnóstico">
      
      <div
       
        class="s00-journey-caption"><span>UM RETRATO DO SEU PONTO DE PARTIDA</span><span data-learning-caption>Observar</span>
      
      </div>
      
      <div
       
        class="s00-steps">${journey.map(([id, label, help], i) => `<button
       
        type="button"
       
        data-diagnostic-action="anchor"
       
        data-diagnostic-target="diagnostic-${id}" data-learning-target="diagnostic-${id}" ${i === 0 ? 'aria-current="step"' : ''}><span
       
        class="s00-step-number">0${i + 1}</span><span
       
        class="s00-step-copy"><strong>${label}</strong><span>${help}</span></span></button>`).join('')}
      
      </div>
      
      </nav>
      
      
      <p
       
        class="s00-path-help">Você ainda não precisa conhecer estas ideias. Responda com o que sabe hoje ou escolha “Ainda não sei”. Depois, leia a explicação. As respostas orientam seu estudo e não impedem você de continuar.
      
      </p>
      
      
      <section
       
        id="diagnostic-look"
       
        data-s00-step="01" tabindex="-1">
      
      <div
       
        class="course-section-kicker">PASSO 01 · OBSERVAR
      
      </div>
      
      <h2>Leia antes de responder
      
      </h2>
      
      <p>${esc(config.orientation)}
      
      </p>
      
      <div
       
        class="course-file-preview"><strong>Material do diagnóstico · somente leitura</strong><pre><code>${esc(config.code)}</code></pre>
      
      </div>
      
      <aside
       
        class="diagnostic-intro">
      
      <p>Não precisa editar, executar ou pesquisar a resposta. Se aparecer uma palavra desconhecida, escolha “Ainda não sei”; o significado será explicado ao conferir.
      
      </p>
      
      </aside>
      
      </section>
      
      
      <section
       
        id="diagnostic-answer"
       
        data-s00-step="02" tabindex="-1">
      
      <div
       
        class="course-section-kicker">PASSO 02 · RESPONDER
      
      </div>
      
      <h2>Qual é sua hipótese?
      
      </h2>
      
      <p>Escolha uma resposta para cada campo. Você pode marcar “Ainda não sei” em alguns ou em todos.
      
      </p>${legacy}
      
      <div
       
        class="diagnostic-fields">${config.fields.map((field, i) => `
      
      <label
       
        class="diagnostic-field"><span>${esc(field.label)}</span><select
       
        data-diagnostic-field="${i}"><option value="">Escolha uma resposta</option>${field.options.map(option => `<option value="${esc(option.value)}" ${state.answers[i] === option.value ? 'selected' : ''}>${esc(option.label)}</option>`).join('')}</select></label>`).join('')}
      
      </div><button
       
        class="button-secondary"
       
        type="button"
       
        data-diagnostic-action="unknown">Ainda não sei responder esta atividade</button>
      
      <div
       
        class="diagnostic-confidence">
      
      <label>Quanta confiança você tem nas suas respostas? (0 a 100)<input
       
        type="number" data-diagnostic-confidence min="0" max="100" step="1" inputmode="numeric" value="${state.confidence ?? ''}"
       
        aria-describedby="diagnostic-confidence-help">
      
      </label><small
       
        id="diagnostic-confidence-help">0 = nenhuma confiança; 50 = tenho dúvidas; 100 = tenho certeza. Sua confiança não é uma nota.</small>
      
      </div><button
       
        class="button-primary"
       
        type="button"
       
        data-diagnostic-action="check">Registrar e conferir</button><span data-diagnostic-status
       
        role="status"
       
        aria-live="polite">${didReview ? 'Respostas registradas. Leia o feedback abaixo.' : 'Preencha as respostas e a confiança para abrir o feedback.'}</span>
      
      </section>
      
      
      <section
       
        id="diagnostic-review"
       
        data-s00-step="03" tabindex="-1">
      
      <div
       
        class="course-section-kicker">PASSO 03 · CONFERIR
      
      </div>
      
      <h2>Uma explicação para cada ideia
      
      </h2>
      
      <div data-diagnostic-feedback>${didReview ? feedback(item, state, submission) : '<p>Registre suas respostas no passo anterior para comparar suas hipóteses com a explicação resolvida.</p>'}
      
      </div>
      
      <div data-diagnostic-finish ${didReview ? '' : 'hidden'}>
      
      <label
       
        class="course-self-check"><input
       
        type="checkbox" data-diagnostic-reviewed ${progress.warmupCompleted?.[key(item)] ? 'checked' : ''}> Li o feedback e identifiquei o que quero aprender ou revisar.
      
      </label>
      
      <label>O que você gostaria de entender melhor? (opcional)<textarea data-diagnostic-reflection
       
        maxlength="600"
       
        placeholder="Uma palavra, uma linha ou uma dúvida já basta.">${esc(progress.exerciseReflections?.[key(item)] || '')}</textarea>
      
      </label><button
       
        class="button-primary"
       
        type="button"
       
        data-diagnostic-action="complete" ${canComplete(item, progress, state) ? '' : 'disabled'}>${done ? 'Diagnóstico registrado' : 'Concluir este diagnóstico'}</button>
      
      <p data-diagnostic-completion-note
       
        role="status">${done ? 'Seu registro está salvo. Você pode seguir ou refazer quando quiser.' : 'Para concluir, leia o feedback e marque a confirmação acima. Acertar não é um requisito.'}</p></div>${item.id === 'D.05' ? '<aside class="diagnostic-guide"><strong>Agora, comece pela base</strong><p>Você acabou de conhecer o que vai explorar na trilha. A Etapa 00 prepara seu ambiente e ensina a ler e executar os primeiros programas. Depois, a Etapa 01 desenvolve valores, variáveis e textos com explicações e prática. Mesmo que você já conheça algumas ideias, esse início ajuda a consolidá-las.</p><a class="button-secondary" href="#/javascript/00.01">Ir para a Etapa 00 →</a></aside>' : ''}
      
      </section>
      
      <footer
       
        class="s01-navigation">${index > 0 ? `<a
       
        href="#/javascript/${esc(activities[index - 1].id)}">← Diagnóstico anterior</a>` : '<a href="#/catalog">Ver trilha</a>'}${next ? `<a
       
        href="#/javascript/${esc(next.id)}">${next.stage === 'D' ? 'Próximo diagnóstico' : 'Começar a Etapa 00'} →</a>` : ''}</footer>
    </article>`;
    }
    function rerender(item, ctx, selector) {
        ctx.render?.();
        const target = global.document?.querySelector(`[data-diagnostic-id="${item.id}"] ${selector}`);
        target?.focus?.({ preventScroll: true });
        target?.scrollIntoView?.({ block: 'nearest', behavior: 'auto' });
    }
    function saveState(item, progress, state) {
        (progress.exercisePredictions ||= {})[key(item)] = snapshot(item,state);
    }
    function markEditedAttemptAssisted(item, progress, state, ctx) {
        if (!expandedDiagnostic(item) || !reviewed(item,progress,state)) return;
        const record = ctx.learning?.record?.(item) || progress.exerciseLearning?.[item.id];
        if (record?.mode !== 'recall' || !record.attemptId) return;
        const evidence = progress.exerciseEvidence?.[key(item)];
        if (!evidence) return;
        const diagnostic = evidence.diagnostic || {assistedAttemptIds:[],submissions:[]};
        if (!diagnostic.assistedAttemptIds.includes(record.attemptId)) {
            diagnostic.assistedAttemptIds = [...diagnostic.assistedAttemptIds,record.attemptId].slice(-20);
            evidence.diagnostic = diagnostic;
            Promise.resolve(ctx.learning?.requestHelp?.(item,'diagnostic-response-edit')).catch(() => {});
        }
    }
    function submissionFor(item, state, progress, snapshotValue) {
        const config = configFor(item), record = progress.exerciseLearning?.[item.id] || null;
        const diagnostic = progress.exerciseEvidence?.[key(item)]?.diagnostic || {assistedAttemptIds:[],submissions:[]};
        const attemptId = record?.mode === 'recall' ? String(record.attemptId || '') : '';
        const assisted = record?.assisted === true || (attemptId && diagnostic.assistedAttemptIds.includes(attemptId));
        const mode = record?.mode === 'recall' || record?.mode === 'learn' ? record.mode : 'none';
        const coverage = Object.fromEntries(Object.entries(config.coverage).map(([activityId,indices]) => [activityId,
            indices.every(index => state.answers[index] === config.fields[index]?.expected)]));
        const allCorrect = state.answers.length === config.fields.length && config.fields.every((field,index) => state.answers[index] === field.expected);
        const independent = mode === 'recall' && record?.attemptIndependent === true;
        const recommendations = independent && !assisted && allCorrect && Object.values(coverage).every(Boolean)
            ? [config.recommendation.entry] : [];
        return {attemptId,revision:state.revision,contentVersion:Number(item.contentVersion || 1),snapshot:snapshotValue,
            mode,independent,assisted:Boolean(assisted),coverage,recommendations,recordedAt:new Date().toISOString()};
    }
    function handleInput(event, item, ctx = {}) {
        const target = event.target;
        if (!target.matches('[data-diagnostic-field], [data-diagnostic-confidence], [data-diagnostic-reviewed], [data-diagnostic-reflection]'))
            return false;
        const progress = ctx.progress || (ctx.progress = {}), root = target.closest('[data-diagnostic-id]'), state = readState(item, progress);
        if (target.matches('[data-diagnostic-reflection]')) {
            (progress.exerciseReflections ||= {})[key(item)] = target.value.slice(0, 600);
        }
        else if (target.matches('[data-diagnostic-reviewed]')) {
            (progress.warmupCompleted ||= {})[key(item)] = !!target.checked;
            root.querySelector('[data-diagnostic-action="complete"]').disabled = !canComplete(item, progress, state);
        }
        else {
            const hadFeedback = expandedDiagnostic(item) && reviewed(item,progress,state);
            if (hadFeedback) markEditedAttemptAssisted(item,progress,state,ctx);
            let changed = false;
            if (target.matches('[data-diagnostic-field]')) {
                const i = Number(target.dataset.diagnosticField);
                const next = configFor(item).fields[i]?.options.some(option => option.value === target.value) ? target.value : '';
                changed = state.answers[i] !== next;
                state.answers[i] = next;
            }
            else {
                const next = target.value.trim() !== '' && Number.isInteger(Number(target.value)) && Number(target.value) >= 0 && Number(target.value) <= 100 ? Number(target.value) : null;
                changed = state.confidence !== next;
                state.confidence = next;
            }
            if (expandedDiagnostic(item) && changed) state.revision += 1;
            saveState(item,progress,state);
            (progress.warmupCompleted ||= {})[key(item)] = false;
            (progress.answers ||= {})[item.id] = false;
            root.querySelector('[data-diagnostic-finish]').hidden = true;
            root.querySelector('[data-diagnostic-feedback]').innerHTML = '<p>Suas respostas mudaram. Registre e confira novamente para ver o feedback desta tentativa.</p>';
            root.querySelector('[data-diagnostic-status]').textContent = 'Rascunho salvo. Registre e confira para comparar esta tentativa.';
        }
        ctx.saveProgress?.();
        return true;
    }
    function handleClick(event, item, ctx = {}) {
        const target = event.target.closest?.('[data-diagnostic-action]');
        if (!target)
            return false;
        event.preventDefault();
        const action = target.dataset.diagnosticAction, progress = ctx.progress || (ctx.progress = {}), state = readState(item, progress);
        if (action === 'anchor') {
            const destination = target.closest('[data-diagnostic-id]').querySelector('#' + target.dataset.diagnosticTarget);
            destination.scrollIntoView?.({ behavior: global.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
            destination.focus?.({ preventScroll: true });
        }
        else if (action === 'unknown') {
            const unknown = { answers: configFor(item).fields.map(() => 'unknown'), confidence: 0, revision: state.revision + (expandedDiagnostic(item) ? 1 : 0) };
            if (expandedDiagnostic(item)) markEditedAttemptAssisted(item,progress,state,ctx);
            saveState(item,progress,unknown);
            (progress.warmupCompleted ||= {})[key(item)] = false;
            (progress.answers ||= {})[item.id] = false;
            ctx.saveProgress?.();
            rerender(item, ctx, '[data-diagnostic-action="check"]');
        }
        else if (action === 'check') {
            if (!ready(state)) {
                const root = target.closest('[data-diagnostic-id]');
                root.querySelector('[data-diagnostic-status]').textContent = 'Escolha uma resposta em cada campo (vale “Ainda não sei”) e uma confiança inteira entre 0 e 100.';
                const missing = state.answers.findIndex(answer => !answer);
                root.querySelector(missing >= 0 ? `[data-diagnostic-field="${missing}"]` : '[data-diagnostic-confidence]')?.focus();
                return true;
            }
            const previous = progress.exerciseEvidence?.[key(item)], output = snapshot(item,state);
            const evidence = { status: 'written', runResult: 'guided', output, rubric: [], runCount: Math.min(100000,(previous?.runCount || 0) + 1), recordedAt: new Date().toISOString() };
            if (expandedDiagnostic(item)) {
                const submission = submissionFor(item,state,progress,output);
                const oldDiagnostic = previous?.diagnostic || {assistedAttemptIds:[],submissions:[]};
                evidence.diagnostic = {assistedAttemptIds:[...oldDiagnostic.assistedAttemptIds],submissions:[...oldDiagnostic.submissions,submission].slice(-20)};
            }
            (progress.exerciseEvidence ||= {})[key(item)] = evidence;
            ctx.saveProgress?.();
            rerender(item, ctx, '#diagnostic-review');
        }
        else if (action === 'complete' && canComplete(item, progress, state)) {
            const reflection = progress.exerciseReflections?.[key(item)] || '';
            const submittedResponse = reflection.trim().length >= 16 ? reflection : progress.exerciseEvidence?.[key(item)]?.output || '';
            void ctx.learning?.submitStudy?.(item, submittedResponse);
            const wasDone = progress.answers?.[item.id] === true;
            (progress.answers ||= {})[item.id] = true;
            (progress.exerciseVersions ||= {})[item.id] = item.contentVersion || 1;
            progress.completed ||= [];
            if (!progress.completed.includes(item.id))
                progress.completed.push(item.id);
            progress.attempts ||= {};
            if (!wasDone)
                progress.attempts[item.id] = Math.min(100000, Number(progress.attempts[item.id] || 0) + 1);
            progress.reviewSchedule ||= {};
            progress.reviewSchedule[item.id] ||= { intervalIndex: 0, dueAt: Date.now() + 7 * 86400000 };
            ctx.saveProgress?.();
            rerender(item, ctx, '[data-diagnostic-action="complete"]');
        }
        return true;
    }
    global.DevPathDiagnosticUI = { render, handleClick, handleInput, key, readState };
})(globalThis);
