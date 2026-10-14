(function (global) {
  'use strict';
  const instructional = [
    '#g-learn', '.course-explanation-panel', '.course-stage-bridge', '[data-s00-teaching]',
    '.js00-learn', '.js00-worked', '.s01-learn', '.s01-hints', '.s01-notes',
    '.s02-bridge', '.s02-teaching', '.s02-hint', '.s03-teaching', '.s03-hint',
    '.diagnostic-feedback', '.diagnostic-guide', '.s00-path-help',
    '.s00-lab-feedback', '.s00-argument-preview', '.s00-environment-demos', '.s00-lab-note',
    '.s00-lab[data-s00-lab="message-action"] [data-s00-lab-code]',
    '.s00-lab[data-s00-lab="message-action"] [data-s00-lab-output]',
    '[data-learning-solution]', '[data-learning-example]'
  ].join(',');
  const teachingDetails = node => node.matches('details') && /exemplo|solu[cç][aã]o|gabarito|resposta explicada|demonstra[cç][aã]o/i.test(node.querySelector('summary')?.textContent || '');
  const esc = value => global.DevPathTeachingUtils?.escapeHTML?.(String(value ?? '')) ?? String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const requestedHelp = new Map();
  const attemptKey = (item, record) => `${item.id}:${record?.attemptId || ''}`;
  function rememberHelp(item, record, key) {
    const id = attemptKey(item, record), targets = requestedHelp.get(id) || new Set();
    if (key) targets.add(key);
    requestedHelp.set(id, targets);
  }
  function clearHelpForActivity(item) {
    for (const key of requestedHelp.keys()) if (key.startsWith(`${item.id}:`)) requestedHelp.delete(key);
  }
  // The key stays stable across re-renders: decorate stores it on the unit before ids are assigned for focus targets.
  function unitKeyOf(unit) {
    return unit.dataset.learningUnitKey || unit.id || unit.dataset.s00Step || unit.className?.toString().split(/\s+/)[0];
  }
  function helpTargetFor(node) {
    const unit = node?.closest?.(instructional);
    return unit ? unitKeyOf(unit) : null;
  }
  // Only evaluation of the current attempt counts as a submission; a changed draft does not reopen the gate by itself.
  function submittedAttempt(item, record, progress) {
    if (!record || record.mode !== 'recall') return false;
    if (/^D\.0[6-9]$/.test(item?.id || '')) {
      const version = Number(item.contentVersion || 1), key = version > 1 ? `${item.id}@v${version}` : item.id;
      const evidence = progress?.exerciseEvidence?.[key], submission = evidence?.diagnostic?.submissions?.at(-1);
      let draft;
      try { draft = JSON.parse(progress?.exercisePredictions?.[key] || ''); } catch { draft = null; }
      return evidence?.status === 'written' && submission?.attemptId === record.attemptId && submission.snapshot === evidence.output
        && submission.revision === draft?.r && submission.contentVersion === version;
    }
    return record.verifiedEvidence?.attemptId === record.attemptId || record.demonstratedEvidence?.attemptId === record.attemptId
      || record.transferEvidence?.attemptId === record.attemptId;
  }
  // Help on a demonstrated attempt marks it assisted, so the learner must confirm before the demonstration stops counting.
  // Any action that marks a demonstrated attempt as assisted (help, or studying again in learn mode) needs confirmation.
  function confirmHelp(record, context, message = demonstrationWarning) {
    if (record?.state !== 'demonstrated' && record?.state !== 'transfer-declared') return true;
    const ask = context.confirm || (text => global.confirm?.(text));
    return ask(record.state === 'transfer-declared' ? transferWarning : message) === true;
  }
  function focusRevealed(host, unitId) {
    const unit = unitId && host?.querySelector(`[id="${unitId}"]`);
    if (!unit || unit.hidden) return;
    unit.setAttribute('tabindex', '-1');
    unit.focus?.({preventScroll: false});
  }
  const evidenceLabel = source => source === 'browser' ? 'Executada no navegador' : source === 'local-declared' ? 'Avaliação local declarada' : source === 'rubric-declared' ? 'Rubrica declarada' : 'Sem evidência atual';
  const stateLabel = state => ({attempted:'Tentativa', studied:'Estudada', verified:'Verificada', demonstrated:'Demonstrada', 'transfer-declared':'Transferência declarada'})[state] || 'Ainda não iniciada';
  // "Verificada" means the published tests passed; it is not an independent assessment.
  const stateTitle = state => state === 'verified' ? 'Verificada: passou nos testes publicados.' : state === 'transfer-declared' ? 'Transferência declarada: resposta avaliada pela rubrica declarada, não executada.' : undefined;
  const demonstrationWarning = 'Esta tentativa já está demonstrada. Pedir ajuda agora a marca como apoiada: a demonstração desta tentativa deixa de contar e ela volta a Verificada. Deseja continuar?';
  const studyDemonstrationWarning = 'Esta tentativa já está demonstrada. Estudar de novo agora a marca como apoiada: a demonstração desta tentativa deixa de contar e ela volta a Verificada. Deseja continuar?';
  const transferWarning = 'Esta tentativa já tem transferência declarada. Pedir ajuda ou estudar de novo agora a marca como apoiada: a transferência deixa de contar. Deseja continuar?';
  // The model reopens an attempt to Tentativa after an edit; the earlier study stays visible as history.
  function studiedBeforeEdit(record) {
    return Boolean(record && record.state === 'attempted' && (record.events || []).some(event => event.kind === 'studied' && event.attemptId === record.attemptId));
  }
  function historicalState(record) {
    if (record?.state === 'transfer-declared') return 'transfer-declared';
    if (record?.demonstratedEvidence) return 'demonstrated';
    if (record?.verifiedEvidence) return 'verified';
    return record?.state;
  }
  // Badges read only the learning record (the progress model), never legacy testsPassed flags.
  function badgeMarkup(record) {
    const state = record ? historicalState(record) : null;
    const title = stateTitle(state);
    return `<span class="learning-state-badge" data-learning-state="${esc(state || 'none')}"${title ? ` title="${esc(title)}"` : ''}>${esc(stateLabel(state))}</span>`;
  }
  function gateMarkup(record) {
    return `<section class="learning-gate" data-learning-gate aria-labelledby="learning-gate-title">
      <div><span class="eyebrow">ESCOLHA SEU CAMINHO</span><h2 id="learning-gate-title">Como você quer começar?</h2>
      <p>Você pode estudar primeiro ou tentar recuperar a ideia de memória. Sua escolha fica salva nesta atividade.</p></div>
      <div class="learning-gate-actions"><button type="button" class="button-primary" data-learning-mode="learn">Aprender este conceito</button>
      <button type="button" class="button-secondary" data-learning-mode="recall">Tentar de memória</button>${record?.assisted ? '<button type="button" class="button-secondary" data-learning-new-attempt>Começar nova tentativa de memória sem ajuda</button>' : ''}</div></section>`;
  }
  function evidenceMarkup(record, assessment) {
    if (!record) return '';
    const candidates = [record.transferEvidence, record.demonstratedEvidence, record.verifiedEvidence].filter(Boolean);
    const isCurrent = evidence => evidence.attemptId === record.attemptId && evidence.fingerprint === record.currentFingerprint
      && evidence.contentVersion === record.contentVersion && evidence.assessmentVersion === record.assessmentVersion;
    const evidence = candidates.find(isCurrent) || candidates[0];
    const current = Boolean(evidence && isCurrent(evidence));
    const state = stateLabel(historicalState(record));
    const assessmentStatus = current ? 'A verificação pelos testes publicados está aprovada.' : 'A verificação pelos testes publicados está pendente ou desatualizada.';
    const source = current
      ? `Origem da evidência atual: ${evidenceLabel(evidence.source)}`
      : evidence
        ? `Evidência histórica: ${evidenceLabel(evidence.source)} · Origem da evidência atual: Aguardando avaliação`
        : 'Origem da evidência atual: Aguardando avaliação';
    const rubric = Array.isArray(assessment?.rubric) && assessment.rubric.length ? `<fieldset class="learning-assessment-rubric"><legend>Rubrica declarada da avaliação</legend>${assessment.rubric.map((criterion,index)=>`<label><input type="checkbox" data-learning-rubric="${index}"><span>${esc(criterion)}</span></label>`).join('')}<small>Marque os critérios após revisar sua resposta. A rubrica complementa o resultado técnico.</small></fieldset>` : '';
    return `<section class="learning-evidence" data-learning-evidence aria-label="Estado da aprendizagem">
      <strong>Estado histórico: ${esc(state)}</strong><span>${esc(assessmentStatus)}</span><small>${esc(source)}${record.assisted ? ' · percurso com apoio registrado nesta tentativa' : ''}</small>${rubric}</section>`;
  }
  function transferMarkup(assessment, record) {
    const transfer = assessment?.transfer;
    if (!transfer || !Array.isArray(transfer.rubric) || !transfer.rubric.length || !Array.isArray(transfer.files) || !transfer.files.length) return '';
    const rows = transfer.files.map(file => `<li><code>${esc(file.path)}</code>: ${esc(file.content)}</li>`).join('');
    const checks = transfer.rubric.map((criterion, index) => `<label class="learning-transfer-criterion"><input type="checkbox" data-learning-transfer-rubric value="${index}"><span>${esc(criterion)}</span></label>`).join('');
    const evidence = record?.verifiedEvidence;
    const principalVerified = Boolean(evidence && evidence.attemptId === record.attemptId && evidence.fingerprint === record.currentFingerprint && evidence.contentVersion === record.contentVersion && evidence.assessmentVersion === record.assessmentVersion);
    const blocked = !principalVerified ? '<p role="status">Conclua uma avaliação principal atual antes de registrar a transferência.</p>' : record?.assisted ? '<p role="status">A ajuda foi registrada nesta tentativa. Comece uma nova tentativa de memória para demonstrar transferência sem ajuda.</p>' : '';
    return `<section class="learning-transfer" data-learning-transfer aria-labelledby="learning-transfer-title"><h2 id="learning-transfer-title">Tarefa de transferência independente</h2>
      <p>Use o novo caso abaixo. A avaliação é feita pela rubrica declarada e não reaproveita o resultado do exercício principal.</p><ul>${rows}</ul>
      <label>Explique e aplique a ideia neste caso<textarea data-learning-transfer-response rows="5" maxlength="4000" placeholder="Descreva a decisão e por que ela se aplica ao novo caso."></textarea></label>
      <fieldset><legend>Rubrica declarada</legend>${checks}</fieldset>${blocked}
      <button type="button" class="button-secondary" data-learning-transfer-submit ${principalVerified && !record?.assisted ? '' : 'disabled'}>Registrar transferência</button><p data-learning-transfer-status role="status" aria-live="polite"></p></section>`;
  }
  function decorate(item, markup, context = {}) {
    const template = global.document.createElement('template');
    template.innerHTML = String(markup || '').trim();
    const root = template.content.querySelector('.course-lesson') || template.content.firstElementChild;
    if (!root) return String(markup || '');
    const record = context.progress?.exerciseLearning?.[item.id] || null;
    const assessment = context.assessments?.[item.id] || {};
    const gate = global.document.createElement('template');
    gate.innerHTML = gateMarkup(record);
    const gateNode = gate.content.firstElementChild;
    const back = root.querySelector(':scope > .lesson-back');
    const badge = global.document.createElement('template');
    badge.innerHTML = `<p class="learning-state-row" data-learning-state-row><span class="learning-state-caption">Estado desta atividade:</span> ${badgeMarkup(record)}${studiedBeforeEdit(record) ? '<span class="learning-state-caption">· Estudada antes desta edição (histórico)</span>' : ''}</p>`;
    const badgeNode = badge.content.firstElementChild;
    if (back) back.after(badgeNode); else root.prepend(badgeNode);
    badgeNode.after(gateNode);
    const panel = global.document.createElement('template');
    panel.innerHTML = evidenceMarkup(record, assessment);
    const panelNode = panel.content.firstElementChild;
    if (panelNode) gateNode.after(panelNode);
    const transfer = global.document.createElement('template');
    transfer.innerHTML = transferMarkup(assessment, record);
    const transferNode = transfer.content.firstElementChild;
    if (transferNode) root.append(transferNode);
    const selected = record?.mode;
    gateNode.querySelectorAll('[data-learning-mode]').forEach(button => {
      if (button.dataset.learningMode === selected) button.setAttribute('aria-pressed', 'true');
      else button.setAttribute('aria-pressed', 'false');
    });
    const hiddenUnits = [...root.querySelectorAll(instructional)].filter(node =>
      !node.closest('[data-learning-gate],[data-learning-evidence],[data-learning-transfer]') && !node.parentElement?.closest(instructional)
    );
    if (!record) {
      for (const child of [...root.children]) if (child !== gateNode && child !== badgeNode && child !== panelNode && child !== transferNode && !child.matches('.lesson-back')) {
        child.hidden = true;
        child.querySelectorAll('*').forEach(descendant => { descendant.hidden = true; });
      }
      if (transferNode) transferNode.hidden = true;
    } else if (record.mode === 'recall') {
      const requested = requestedHelp.get(attemptKey(item, record)) || new Set();
      // Explanations stay closed until the attempt is evaluated; evaluation reveals them without recording help.
      const evaluated = submittedAttempt(item, record, context.progress);
      const exposeAllHelp = (record.assisted === true && requested.size === 0) || evaluated;
      hiddenUnits.forEach((node, index) => {
        if (node.matches('.s00-lab-feedback')) return;
        const key = node.id || node.dataset.s00Step || node.className?.toString().split(/\s+/)[0] || `unit-${index + 1}`;
        node.dataset.learningUnitKey = key;
        if (!node.id) node.id = `learning-unit-${key.replace(/[^A-Za-z0-9_-]/g, '-')}-${index + 1}`;
        if (exposeAllHelp || requested.has(key)) {
          node.hidden = false;
          delete node.dataset.learningManagedHidden;
          return;
        }
        node.hidden = true;
        node.dataset.learningManagedHidden = 'true';
        const prompt = global.document.createElement('button');
        prompt.type = 'button'; prompt.className = 'button-secondary learning-help';
        prompt.dataset.learningHelpTarget = key;
        prompt.dataset.learningUnit = node.id;
        prompt.setAttribute('aria-controls', node.id);
        prompt.setAttribute('aria-expanded', 'false');
        prompt.textContent = `Pedir ajuda sobre: ${node.querySelector('h2,h3,h4')?.textContent?.trim() || 'este conceito'}`;
        node.before(prompt);
      });
      root.querySelectorAll('details').forEach(node => {
        if (!teachingDetails(node)) return;
        const unit = node.closest(instructional), key = unit ? unitKeyOf(unit) : '';
        node.hidden = !(exposeAllHelp || requested.has(key));
      });
    }
    root.dataset.learningActivity = item.id;
    root.dataset.learningMode = selected || '';
    return template.innerHTML;
  }
  function handleClick(event, item, context, host) {
    const assistAction = event.target?.closest?.('[data-guided-action="hint"],[data-hint],[data-stage01-action="hint"],[data-s02-action="hint"],[data-s03-action="hint"]');
    if (assistAction && host?.contains(assistAction)) {
      const record = context.learning?.record?.(item) || context.progress?.exerciseLearning?.[item.id];
      if (!confirmHelp(record, context)) return true;
      const target = assistAction.dataset.learningTarget || helpTargetFor(assistAction) || assistAction.dataset.s02Hint || assistAction.dataset.s03Action || 'hint';
      rememberHelp(item, record, target);
      Promise.resolve(context.learning?.requestHelp?.(item, target)).then(() => context.render?.());
      return false;
    }
    const target = event.target?.closest?.('button[data-learning-mode],[data-learning-help-target],[data-learning-transfer-submit],[data-learning-new-attempt]');
    if (!target || !host?.contains(target)) return false;
    const restorePathFocus = target.matches('[data-learning-mode]') && target === global.document.activeElement;
    event.preventDefault?.();
    if (target.hasAttribute('data-learning-mode')) {
      const current = context.learning?.record?.(item) || context.progress?.exerciseLearning?.[item.id];
      // Studying again in learn mode marks the attempt assisted, which downgrades a demonstration. Decline sends nothing.
      if (target.dataset.learningMode === 'learn' && !confirmHelp(current, context, studyDemonstrationWarning)) return true;
      Promise.resolve(context.learning?.startLearning?.(item, target.dataset.learningMode)).then(() => {
        context.render?.();
        if (restorePathFocus) global.requestAnimationFrame?.(() => host.querySelector(`[data-learning-mode="${target.dataset.learningMode}"]`)?.focus());
      }).catch(() => context.toast?.('Não foi possível salvar sua escolha agora.'));
      return true;
    }
    if (target.hasAttribute('data-learning-new-attempt')) {
      Promise.resolve(context.learning?.startIndependentAttempt?.(item)).then(() => { clearHelpForActivity(item); context.render?.(); }).catch(() => context.toast?.('Não foi possível iniciar uma nova tentativa.'));
      return true;
    }
    if (target.hasAttribute('data-learning-help-target')) {
      const record = context.learning?.record?.(item) || context.progress?.exerciseLearning?.[item.id];
      const key = target.dataset.learningHelpTarget, unitId = target.dataset.learningUnit;
      if (!confirmHelp(record, context)) return true;
      rememberHelp(item, record, key);
      Promise.resolve(context.learning?.requestHelp?.(item, key)).then(() => {
        context.render?.();
        focusRevealed(host, unitId);
        context.toast?.('Ajuda revelada nesta atividade.');
      }).catch(() => context.toast?.('Não foi possível registrar a ajuda agora.'));
      return true;
    }
    const section = target.closest('[data-learning-transfer]');
    const response = section?.querySelector('[data-learning-transfer-response]')?.value.trim() || '';
    const checked = [...(section?.querySelectorAll('[data-learning-transfer-rubric]:checked') || [])].map(input => Number(input.value));
    const transfer = context.assessments?.[item.id]?.transfer;
    const status = section?.querySelector('[data-learning-transfer-status]');
    if (response.length < 40 || !transfer?.rubric?.length || checked.length !== transfer.rubric.length) {
      if (status) status.textContent = 'Escreva uma aplicação concreta (mínimo de 40 caracteres) e confira todos os critérios da rubrica.';
      return true;
    }
    if (context.progress?.exerciseLearning?.[item.id]?.assisted) {
      if (status) status.textContent = 'A ajuda foi registrada nesta tentativa. Inicie uma nova tentativa de memória para demonstrar transferência.';
      return true;
    }
    Promise.resolve(context.learning?.runTransfer?.(item, transfer, {response, checked})).then(result => {
      if (status) status.textContent = result?.accepted ? 'Transferência declarada registrada. Ela não conta como demonstrada, porque a rubrica é declarada e não executada.' : 'Não foi possível registrar esta transferência.';
      context.render?.();
    }).catch(() => {
      if (status) status.textContent = 'Não foi possível registrar esta transferência agora. Tente novamente.';
    });
    return true;
  }
  function handleInput(event, item, context) {
    if (!event.target?.closest?.('.course-lesson') || event.target.closest('[data-learning-transfer]')) return false;
    if (!['input','change'].includes(event.type)) return false;
    if (/^D\.0[6-9]$/.test(item?.id || '') && event.target.closest('[data-diagnostic-id]')) return false;
    context.learning?.recordAttempt?.(item);
    return false;
  }
  global.DevPathLearningPaths = Object.freeze({decorate, handleClick, handleInput, stateLabel, evidenceLabel, badgeMarkup});
})(window);
