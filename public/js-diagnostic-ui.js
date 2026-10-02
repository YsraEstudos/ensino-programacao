(function (global) {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const configFor = item => global.DevPathDiagnosticPreparation[item.id];
  const key = item => Number(item.contentVersion || 1) > 1 ? `${item.id}@v${item.contentVersion}` : item.id;
  function readState(item, progress) {
    let saved;
    try { saved = JSON.parse(progress.exercisePredictions?.[key(item)] || ''); } catch { saved = {}; }
    const config = configFor(item);
    return {
      answers: config.fields.map((field, index) => field.options.some(option => option.value === saved?.answers?.[index]) ? saved.answers[index] : ''),
      confidence: typeof saved?.confidence === 'number' && Number.isInteger(saved.confidence) && saved.confidence >= 0 && saved.confidence <= 100 ? saved.confidence : null,
    };
  }
  const ready = state => state.answers.every(Boolean) && state.confidence !== null;
  const reviewed = (item, progress, state) => ready(state) && progress.exerciseEvidence?.[key(item)]?.status === 'written' && progress.exerciseEvidence[key(item)].output === JSON.stringify(state);
  const canComplete = (item, progress, state) => reviewed(item, progress, state) && progress.warmupCompleted?.[key(item)] === true;
  const labelFor = (field, value) => field.options.find(option => option.value === value)?.label || 'Ainda sem resposta';
  function feedback(item, state) {
    const config = configFor(item);
    return `<div class="diagnostic-feedback">${config.fields.map((field, index) => `<article><h3>${esc(field.label)}</h3><p class="diagnostic-compare">Sua resposta: ${esc(labelFor(field, state.answers[index]))}<br>Resposta explicada: ${esc(labelFor(field, field.expected))}</p><p>${state.answers[index] === 'unknown' ? 'Tudo bem começar sem saber. Leia a explicação abaixo para conhecer esta ideia.' : state.answers[index] === field.expected ? 'Sua previsão acompanha a regra deste caso.' : 'Este caso mostra uma ideia que você pode retomar na trilha.'}</p><p>${esc(field.explanation)}</p></article>`).join('')}</div><h3>Acompanhe o raciocínio</h3><ol>${config.feedbackSteps.map(step => `<li>${esc(step)}</li>`).join('')}</ol><aside class="diagnostic-guide"><strong>Seu próximo passo</strong><p>${esc(config.nextStep)}</p><p>${esc(config.takeaway)}</p></aside>`;
  }
  function render(item, ctx = {}) {
    const progress = ctx.progress || (ctx.progress = {}), config = configFor(item), state = readState(item, progress);
    const done = progress.answers?.[item.id] === true && Number(progress.exerciseVersions?.[item.id] || 1) === Number(item.contentVersion || 1);
    const didReview = reviewed(item, progress, state);
    const activities = ctx.activities || [], index = activities.findIndex(entry => entry.id === item.id);
    const next = activities[index + 1];
    const journey = [['look','Observar','Leia com calma'],['answer','Responder','Registre uma hipótese'],['review','Conferir','Entenda o resultado']];
    const prior = progress.exercisePredictions?.[key(item)];
    let legacy = '';
    if (prior && !prior.startsWith('{"answers":')) legacy = `<details class="s00-glossary"><summary>Sua resposta anterior foi preservada</summary><p>${esc(prior)}</p></details>`;
    return `<article class="course-lesson s00-lesson diagnostic-lesson" data-diagnostic-id="${esc(item.id)}" data-learning-journey>
      <a class="lesson-back" href="#/catalog">Voltar à trilha de JavaScript</a>
      <header class="course-lesson-hero"><div class="s00-hero-top"><div class="eyebrow">JAVASCRIPT <span>/</span> DIAGNÓSTICO INICIAL</div><span class="s00-lesson-index">${esc(item.id)}</span></div><h1>${esc(item.title)}</h1><p>${esc(config.introduction)}</p><div class="s00-hero-meta"><span><i aria-hidden="true"></i>${esc(item.duration)} · no seu ritmo</span><span>${item.id.slice(-1)} de 5 · sem nota</span><span>${done ? 'Diagnóstico registrado' : 'Não exige estudo prévio'}</span></div></header>
      <nav class="s00-journey" aria-label="Roteiro do diagnóstico"><div class="s00-journey-caption"><span>UM RETRATO DO SEU PONTO DE PARTIDA</span><span data-learning-caption>Observar</span></div><div class="s00-steps">${journey.map(([id,label,help],i)=>`<button type="button" data-diagnostic-action="anchor" data-diagnostic-target="diagnostic-${id}" data-learning-target="diagnostic-${id}" ${i===0?'aria-current="step"':''}><span class="s00-step-number">0${i+1}</span><span class="s00-step-copy"><strong>${label}</strong><span>${help}</span></span></button>`).join('')}</div></nav>
      <p class="s00-path-help">Você ainda não precisa conhecer estas ideias. Responda com o que sabe hoje ou escolha “Ainda não sei”. Depois, leia a explicação. As respostas orientam seu estudo e não impedem você de continuar.</p>
      <section id="diagnostic-look" data-s00-step="01" tabindex="-1"><div class="course-section-kicker">PASSO 01 · OBSERVAR</div><h2>Leia antes de responder</h2><p>${esc(config.orientation)}</p><div class="course-file-preview"><strong>Material do diagnóstico · somente leitura</strong><pre><code>${esc(config.code)}</code></pre></div><aside class="diagnostic-intro"><p>Não precisa editar, executar ou pesquisar a resposta. Se aparecer uma palavra desconhecida, escolha “Ainda não sei”; o significado será explicado ao conferir.</p></aside></section>
      <section id="diagnostic-answer" data-s00-step="02" tabindex="-1"><div class="course-section-kicker">PASSO 02 · RESPONDER</div><h2>Qual é sua hipótese?</h2><p>Escolha uma resposta para cada campo. Você pode marcar “Ainda não sei” em alguns ou em todos.</p>${legacy}<div class="diagnostic-fields">${config.fields.map((field,i)=>`<label class="diagnostic-field"><span>${esc(field.label)}</span><select data-diagnostic-field="${i}"><option value="">Escolha uma resposta</option>${field.options.map(option=>`<option value="${esc(option.value)}" ${state.answers[i]===option.value?'selected':''}>${esc(option.label)}</option>`).join('')}</select></label>`).join('')}</div><button class="button-secondary" type="button" data-diagnostic-action="unknown">Ainda não sei responder esta atividade</button><div class="diagnostic-confidence"><label>Quanta confiança você tem nas suas respostas? (0 a 100)<input type="number" data-diagnostic-confidence min="0" max="100" step="1" inputmode="numeric" value="${state.confidence ?? ''}" aria-describedby="diagnostic-confidence-help"></label><small id="diagnostic-confidence-help">0 = nenhuma confiança; 50 = tenho dúvidas; 100 = tenho certeza. Sua confiança não é uma nota.</small></div><button class="button-primary" type="button" data-diagnostic-action="check">Registrar e conferir</button><span data-diagnostic-status role="status" aria-live="polite">${didReview ? 'Respostas registradas. Leia o feedback abaixo.' : 'Preencha as respostas e a confiança para abrir o feedback.'}</span></section>
      <section id="diagnostic-review" data-s00-step="03" tabindex="-1"><div class="course-section-kicker">PASSO 03 · CONFERIR</div><h2>Uma explicação para cada ideia</h2><div data-diagnostic-feedback>${didReview ? feedback(item,state) : '<p>Registre suas respostas no passo anterior para comparar suas hipóteses com a explicação resolvida.</p>'}</div><div data-diagnostic-finish ${didReview?'':'hidden'}><label class="course-self-check"><input type="checkbox" data-diagnostic-reviewed ${progress.warmupCompleted?.[key(item)]?'checked':''}> Li o feedback e identifiquei o que quero aprender ou revisar.</label><label>O que você gostaria de entender melhor? (opcional)<textarea data-diagnostic-reflection maxlength="600" placeholder="Uma palavra, uma linha ou uma dúvida já basta.">${esc(progress.exerciseReflections?.[key(item)] || '')}</textarea></label><button class="button-primary" type="button" data-diagnostic-action="complete" ${canComplete(item,progress,state)?'':'disabled'}>${done?'Diagnóstico registrado':'Concluir este diagnóstico'}</button><p data-diagnostic-completion-note role="status">${done?'Seu registro está salvo. Você pode seguir ou refazer quando quiser.':'Para concluir, leia o feedback e marque a confirmação acima. Acertar não é um requisito.'}</p></div>${item.id==='D.05'?'<aside class="diagnostic-guide"><strong>Agora, comece pela base</strong><p>Você acabou de conhecer o que vai explorar na trilha. A Etapa 00 prepara seu ambiente e ensina a ler e executar os primeiros programas. Depois, a Etapa 01 desenvolve valores, variáveis e textos com explicações e prática. Mesmo que você já conheça algumas ideias, esse início ajuda a consolidá-las.</p><a class="button-secondary" href="#/javascript/00.01">Ir para a Etapa 00 →</a></aside>':''}</section><footer class="s01-navigation">${index>0?`<a href="#/javascript/${esc(activities[index-1].id)}">← Diagnóstico anterior</a>`:'<a href="#/catalog">Ver trilha</a>'}${next?`<a href="#/javascript/${esc(next.id)}">${next.stage==='D'?'Próximo diagnóstico':'Começar a Etapa 00'} →</a>`:''}</footer>
    </article>`;
  }
  function rerender(item, ctx, selector) {
    ctx.render?.();
    const target = global.document?.querySelector(`[data-diagnostic-id="${item.id}"] ${selector}`);
    target?.focus?.({preventScroll:true}); target?.scrollIntoView?.({block:'nearest',behavior:'auto'});
  }
  function handleInput(event, item, ctx = {}) {
    const target = event.target;
    if (!target.matches('[data-diagnostic-field], [data-diagnostic-confidence], [data-diagnostic-reviewed], [data-diagnostic-reflection]')) return false;
    const progress = ctx.progress || (ctx.progress = {}), root = target.closest('[data-diagnostic-id]'), state = readState(item,progress);
    if (target.matches('[data-diagnostic-reflection]')) { (progress.exerciseReflections ||= {})[key(item)] = target.value.slice(0,600); }
    else if (target.matches('[data-diagnostic-reviewed]')) {
      (progress.warmupCompleted ||= {})[key(item)] = !!target.checked;
      root.querySelector('[data-diagnostic-action="complete"]').disabled = !canComplete(item,progress,state);
    } else {
      if (target.matches('[data-diagnostic-field]')) {
        const i = Number(target.dataset.diagnosticField);
        state.answers[i] = configFor(item).fields[i]?.options.some(option=>option.value===target.value) ? target.value : '';
      } else state.confidence = target.value.trim() !== '' && Number.isInteger(Number(target.value)) && Number(target.value)>=0 && Number(target.value)<=100 ? Number(target.value) : null;
      (progress.exercisePredictions ||= {})[key(item)] = JSON.stringify(state);
      (progress.warmupCompleted ||= {})[key(item)] = false;
      (progress.answers ||= {})[item.id] = false;
      root.querySelector('[data-diagnostic-finish]').hidden = true;
      root.querySelector('[data-diagnostic-feedback]').innerHTML = '<p>Suas respostas mudaram. Registre e confira novamente para ver o feedback desta tentativa.</p>';
      root.querySelector('[data-diagnostic-status]').textContent = 'Rascunho salvo. Registre e confira para comparar esta tentativa.';
    }
    ctx.saveProgress?.(); return true;
  }
  function handleClick(event, item, ctx = {}) {
    const target = event.target.closest?.('[data-diagnostic-action]'); if (!target) return false;
    event.preventDefault(); const action = target.dataset.diagnosticAction, progress = ctx.progress || (ctx.progress = {}), state = readState(item,progress);
    if (action==='anchor') {
      const destination = target.closest('[data-diagnostic-id]').querySelector('#'+target.dataset.diagnosticTarget);
      destination.scrollIntoView?.({behavior:global.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}); destination.focus?.({preventScroll:true});
    } else if (action==='unknown') {
      const unknown = {answers:configFor(item).fields.map(()=>'unknown'),confidence:0};
      (progress.exercisePredictions ||= {})[key(item)] = JSON.stringify(unknown);
      (progress.warmupCompleted ||= {})[key(item)] = false;
      (progress.answers ||= {})[item.id] = false;
      ctx.saveProgress?.(); rerender(item,ctx,'[data-diagnostic-action="check"]');
    } else if (action==='check') {
      if (!ready(state)) {
        const root = target.closest('[data-diagnostic-id]');
        root.querySelector('[data-diagnostic-status]').textContent = 'Escolha uma resposta em cada campo (vale “Ainda não sei”) e uma confiança inteira entre 0 e 100.';
        const missing = state.answers.findIndex(answer=>!answer);
        root.querySelector(missing>=0?`[data-diagnostic-field="${missing}"]`:'[data-diagnostic-confidence]')?.focus();
        return true;
      }
      const previous = progress.exerciseEvidence?.[key(item)];
      (progress.exerciseEvidence ||= {})[key(item)] = {status:'written',runResult:'guided',output:JSON.stringify(state),rubric:[],runCount:(previous?.runCount || 0)+1,recordedAt:new Date().toISOString()};
      ctx.saveProgress?.(); rerender(item,ctx,'#diagnostic-review');
    } else if (action==='complete' && canComplete(item,progress,state)) {
      const wasDone = progress.answers?.[item.id] === true;
      (progress.answers ||= {})[item.id] = true;
      (progress.exerciseVersions ||= {})[item.id] = item.contentVersion || 1;
      progress.completed ||= []; if (!progress.completed.includes(item.id)) progress.completed.push(item.id);
      progress.attempts ||= {};
      if (!wasDone) progress.attempts[item.id] = Math.min(100000, Number(progress.attempts[item.id] || 0) + 1);
      progress.reviewSchedule ||= {};
      progress.reviewSchedule[item.id] ||= {intervalIndex:0,dueAt:Date.now()+7*86400000};
      ctx.saveProgress?.(); rerender(item,ctx,'[data-diagnostic-action="complete"]');
    }
    return true;
  }
  global.DevPathDiagnosticUI = {render,handleClick,handleInput,key,readState};
})(globalThis);
