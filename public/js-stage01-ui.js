(function (global) {
  'use strict';
  const VERSION = 3;
  // Execution objects contain BigInt AST nodes: keep them outside persisted progress.
  const results = new Map();
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const arr = (value) => Array.isArray(value) ? value : [];
  const prep = (item) => global.DevPathStage01Preparation?.[item.id] || item.preparation || item;
  const stateFor = (item, progress) => {
    progress.stage01 ||= {};
    let p = progress.stage01[item.id];
    if (!p || p.version !== VERSION) p = progress.stage01[item.id] = {};
    const config = prep(item);
    const starter = item.starterFiles?.[0]?.content ?? config.starterFiles?.[0]?.content ?? config.starter ?? '';
    // Repair only the known compact legacy starter; preserve decisions and custom drafts.
    if (item.id === '01.04' && typeof p.code === 'string' && !p.code.includes('\n')) {
      const legacyShape = p.code.replace(/\b(?:const|let|___)(?=\s+(?:nome|pontos|ativo|volume|idioma|tentativas)\b)/g,'___').replace(/\s/g,'');
      if (legacyShape === '___nome="Ana";___pontos=0;pontos=5;___ativo=false;___volume=0;volume=7;___idioma="pt-BR";___tentativas=1;tentativas=2;') {
        p.code += '\nconsole.log(nome, pontos, ativo, volume, idioma, tentativas);';
        p.passedCode = null; p.complete = false;
      }
    }
    const transferDefaults = arr(config.masteryTransfers).map((x) => ({ id: x.id, code: x.starter || '', prediction: '', passedCode: null, hintUsed: false }));
    Object.assign(p, {
      version: VERSION, code: p.code ?? starter, predictions: arr(p.predictions), predictionSaved: !!p.predictionSaved,
      reflection: p.reflection ?? '', passedCode: p.passedCode ?? null, complete: !!p.complete,
      hintLevel: Number(p.hintLevel || 0), order: Array.isArray(p.order) ? p.order : arr(config.parsons?.initialOrder || config.initialOrder).slice(),
      secondOrder: p.secondOrder ?? '', transfers: transferDefaults.map(t => ({...t,...arr(p.transfers).find(saved => saved.id === t.id),id:t.id})),
      fontSize: Math.max(14, Math.min(22, Number(p.fontSize) || 16))
    });
    delete p.lastResult;
    p.transfers.forEach(t => delete t.lastResult);
    if (config.parsons) assemble(item, p);
    return p;
  };
  const expected = (item) => prep(item).examples?.output || prep(item).workedExample?.output || prep(item).expected || [];
  const valuesEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  function resultMarkup(result) {
    if (!result) return '';
    const rows = arr(result.results).flatMap(entry => Array.from({length: Math.max(arr(entry.expected).length, arr(entry.actual).length)}, (_, i) => ({label:entry.label,line:entry.run?.lines?.[i]?.line ?? '—', actual:entry.actual?.[i] ?? '(sem saída)',expected:entry.expected?.[i] ?? '(sem saída)'})));
    const lines = rows.map((row) => `<tr><td>${esc(row.label)}</td><td>${esc(row.line)}</td><td>${esc(row.expected)}</td><td>${esc(row.actual)}</td></tr>`).join('');
    return `<div class="s01-result" role="status" aria-live="polite" tabindex="-1" data-stage01-result><strong>${result.ok ? 'Execução conferida' : 'A execução encontrou um problema'}</strong><p>${esc(result.message || result.error || '')}</p>${lines ? `<div class="s01-table-wrap"><table><thead><tr><th>Caso</th><th>Linha</th><th>Esperado</th><th>Obtido</th></tr></thead><tbody>${lines}</tbody></table></div>` : ''}</div>`;
  }
  function codeFor(item, p) { return p.code ?? item.starterFiles?.[0]?.content ?? prep(item).starter ?? ''; }
  function assemble(item, p) { const config = prep(item), blocks = config.parsons || (config.blocks ? { blocks: config.blocks } : null); if (!blocks) return; p.code = p.order.map((id) => arr(blocks.blocks).find((b) => (b.id || b.label || b.text) === id)?.code || arr(blocks.blocks).find((b) => (b.id || b.label || b.text) === id)?.text || '').filter(Boolean).join('\n'); }
  function predictionsReady(item, p) { const rows = arr(prep(item).predictionRows); return Array.from({length: rows.length || 1}, (_, i) => String(p.predictions?.[i] ?? '').trim()).every(Boolean); }
  function completionReady(item, p) { const transfers = arr(prep(item).masteryTransfers).every((_, i) => typeof p.transfers?.[i]?.passedCode === 'string' && p.transfers[i].passedCode === p.transfers[i].code && String(p.transfers[i].prediction || '').trim() && !p.transfers[i].hintUsed); return typeof p.passedCode === 'string' && p.passedCode === p.code && p.predictionSaved && predictionsReady(item,p) && String(p.reflection || '').trim().length >= 16 && transfers; }
  function simulation(item, result) {
    if (!result?.run) return '';
    const run = result.run;
    if (item.id === '01.02') return `<div class="s01-table-wrap"><table><caption>Estado após cada instrução do seu código</caption><thead><tr><th>Linha</th><th>base</th><th>total</th></tr></thead><tbody>${arr(run.trace).map(row => `<tr><td>${row.line}</td>${['base','total'].map(name => `<td>${Object.hasOwn(row.variables,name) ? esc(global.DevPathStage01Runner.format(row.variables[name])) : 'ainda não inicializado'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    if (item.id === '01.09') return `<div class="s01-snapshots" aria-label="Fichas produzidas pelo seu código">${arr(run.lines).map((line,i) => `<article><strong>Estado ${i+1} · linha ${line.line}</strong><p>${esc(line.values.map(String).join(' '))}</p></article>`).join('')}</div>`;
    return '';
  }
  function publicCases(cases) { return `<div class="s01-contract"><h3>Contrato de saída</h3><p>Cada chamada console.log produz uma linha. Espaços, pontuação, zero e false fazem parte do formato pedido. Os casos alternativos substituem apenas os dados de entrada.</p>${arr(cases).map(c => `<details><summary>${esc(c.label)}</summary><pre>${esc(arr(c.expected).join('\n'))}</pre></details>`).join('')}</div>`; }
  function render(item, ctx = {}) {
    const config = prep(item); const progress = ctx.progress || (ctx.progress = {}); const p = stateFor(item, progress);
    const output = expected(item); const example = config.workedExample || { code: config.example || '', output: output, steps: [] };
    const predictions = arr(config.predictionRows).map((row, i) => `<label class="s01-prediction-row">${esc(row.label || `Previsão ${i + 1}`)}<input data-stage01-prediction="${i}" value="${esc(p.predictions[i] || '')}" autocomplete="off"></label>`).join('');
    const vocab = arr(config.vocabulary).map((x) => `<li>${esc(x)}</li>`).join('');
    const docs = arr(config.docs).map((d) => `<li><a href="${esc(d.url)}" target="_blank" rel="noreferrer">${esc(d.title)}</a><span>${esc(d.section || '')}</span><p>${esc(d.question || '')}</p></li>`).join('');
    const steps = arr(example.steps).map(x => `<li>${esc(x)}</li>`).join('');
    const notes = arr(config.notes).map(x => `<p>${esc(x)}</p>`).join('');
    const trace = example.trace ? `<div class="s01-table-wrap"><table><caption>Rastreamento resolvido do exemplo</caption><thead><tr>${example.trace.columns.map(x=>`<th>${esc(x)}</th>`).join('')}</tr></thead><tbody>${example.trace.rows.map(row=>`<tr>${row.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
    const blocks = config.parsons || (config.blocks ? { blocks: config.blocks, initialOrder: config.initialOrder } : null);
    const blockHtml = blocks ? `<div class="s01-parsons" data-stage01-parsons><ol>${arr(p.order).map((id) => { const b = arr(blocks.blocks).find((x) => (x.id || x.label || x.text) === id); return b ? `<li data-stage01-block="${esc(id)}"><strong>${esc(id)}</strong><code>${esc(b.code || b.text || b.label)}</code><button type="button" aria-label="Mover bloco para cima" data-stage01-action="up" data-stage01-block-id="${esc(id)}">↑</button><button type="button" aria-label="Mover bloco para baixo" data-stage01-action="down" data-stage01-block-id="${esc(id)}">↓</button><button type="button" data-stage01-action="remove" data-stage01-block-id="${esc(id)}">Remover</button></li>` : ''; }).join('')}</ol><button type="button" data-stage01-action="restore">Restaurar blocos</button><label>Segunda ordem válida (letras separadas por espaços)<input data-stage01-second-order value="${esc(p.secondOrder)}"></label></div>` : '';
    const blanks = arr(config.blanks).map((b, i) => {
      const current = new RegExp(`(?:^|[;\\n])\\s*(const|let|___)\\s+${b.name}\\b`).exec(p.code)?.[1] || '___';
      return `<label>${esc(b.name)}<select data-stage01-blank="${i}" aria-label="Declaração de ${esc(b.name)}"><option value="___" ${current==='___'?'selected':''}>Escolha const ou let</option>${arr(b.choices).map(choice => `<option ${current===choice?'selected':''}>${esc(choice)}</option>`).join('')}</select></label>`;
    }).join('');
    const transfers = arr(config.masteryTransfers).map((t, i) => `<article class="s01-transfer"><h3>${esc(t.title || `Transferência ${i + 1}`)}</h3><p>${esc(t.prompt)}</p>${publicCases(t.cases || t.publicCases || [{label:t.title,expected:t.expected}])}<label>Previsão antes de executar<textarea data-stage01-transfer="${i}">${esc(p.transfers[i]?.prediction || '')}</textarea></label><label>Código da transferência<textarea data-stage01-transfer-code="${i}">${esc(p.transfers[i]?.code ?? t.starter ?? '')}</textarea></label><button type="button" data-stage01-action="transfer-run" data-stage01-transfer-index="${i}">Executar transferência</button>${resultMarkup(results.get(`${item.id}:${t.id}`))}</article>`).join('');
    const index = arr(ctx.activities).findIndex(x => x.id === item.id);
    const navigation = `<nav class="s01-navigation" aria-label="Sequência de estudo">${index>0?`<a href="#/javascript/${esc(ctx.activities[index-1].id)}">← Atividade anterior</a>`:''}<a href="#/catalog">Ver trilha</a>${index>=0 && ctx.activities[index+1]?`<a href="#/javascript/${esc(ctx.activities[index+1].id)}">Próxima atividade →</a>`:''}</nav>`;
    const hintButton = p.hintLevel < arr(config.hints).length ? `<button type="button" data-stage01-action="hint" data-stage01-hint="${p.hintLevel}">Mostrar próxima dica</button>` : '';
    const readonly = !!config.readonly;
    return `<article class="s01-lesson" data-stage01-id="${esc(item.id)}" tabindex="-1"><nav class="s01-steps" aria-label="Navegação da atividade"><a href="#s01-learn" data-stage01-action="anchor" data-stage01-target="s01-learn">Aprender</a><a href="#s01-challenge" data-stage01-action="anchor" data-stage01-target="s01-challenge">Desafio</a><a href="#s01-predict" data-stage01-action="anchor" data-stage01-target="s01-predict">Prever</a><a href="#s01-practice" data-stage01-action="anchor" data-stage01-target="s01-practice">Praticar</a><a href="#s01-explain" data-stage01-action="anchor" data-stage01-target="s01-explain">Explicar</a></nav><header id="s01-learn" tabindex="-1"><p class="s01-eyebrow">Etapa 01 · ${esc(item.id)}</p><h1>${esc(item.title)}</h1><p>${esc(item.objective || config.explanation || '')}</p></header>${item.stageBridge ? `<details class="s01-bridge"><summary>${esc(item.stageBridgeTitle)}</summary><p>${esc(item.stageBridge)}</p></details>` : ""}<section class="s01-teaching"><h2>Aprenda</h2><p>${esc(config.explanation || '')}</p><ul class="s01-vocabulary">${vocab}</ul><h3>Exemplo trabalhado</h3><pre><code>${esc(example.code)}</code></pre><div class="s01-example-output"><strong>Saída</strong><ol>${output.map((x) => `<li>${esc(Array.isArray(x) ? x.join(' · ') : x)}</li>`).join('')}</ol></div><ol class="s01-walkthrough">${steps}</ol>${trace}${notes}<ul class="s01-docs">${docs}</ul></section><section id="s01-challenge" tabindex="-1"><h2>Desafio</h2><p>${esc(config.prompt || item.prompt || item.interaction || '')}</p><p>${esc(item.interaction || '')}</p>${config.readonly ? "" : publicCases(global.DevPathStage01Checks.cases[item.id]?.cases)}${blocks ? blockHtml : ''}${blanks ? `<div class="s01-blanks">${blanks}</div>` : ''}</section><section id="s01-predict" tabindex="-1"><h2>Prever antes de executar</h2><p>${esc(config.predictionGuide || "Registre sua previsão e salve-a antes de rodar o código.")}</p><div class="s01-predictions">${predictions || '<label>Previsão<textarea data-stage01-prediction="0"></textarea></label>'}</div><button type="button" data-stage01-action="save-predictions">Salvar previsões</button></section><section id="s01-practice" tabindex="-1"><h2>Praticar</h2><label class="s01-code-label">Código <textarea style="font-size:${p.fontSize}px" aria-label="Código" data-stage01-editor ${readonly ? 'readonly' : ''}>${esc(codeFor(item, p))}</textarea></label><div class="s01-actions"><label>Tamanho do código<select data-stage01-font>${[14,16,18,20,22].map(n=>`<option ${n===p.fontSize?'selected':''}>${n}</option>`).join('')}</select></label><button type="button" data-stage01-action="run">Executar</button>${hintButton}</div><div data-stage01-status aria-live="polite"></div><div class="s01-hints" data-stage01-hints>${arr(config.hints).slice(0, p.hintLevel).map((h, i) => `<p>Dica ${i + 1}: ${esc(h)}</p>`).join('')}</div>${resultMarkup(results.get(item.id))}${simulation(item,results.get(item.id))}</section><section id="s01-explain" tabindex="-1"><h2>Explicar e concluir</h2><h3>Critérios da atividade</h3><ul>${arr(item.rubric).map(rule=>`<li>${esc(rule)}</li>`).join("")}</ul><p>${esc(config.reflectionPrompt || 'Explique o que observou e relacione sua previsão ao resultado.')}</p><label>Sua explicação<textarea aria-label="Sua explicação" data-stage01-reflection placeholder="Sua reflexão (mínimo de 16 caracteres)">${esc(p.reflection)}</textarea></label><p>Conclua depois de conferir os casos e explicar o raciocínio.${transfers ? " As duas transferências do projeto são obrigatórias e não oferecem dicas." : ""}</p>${transfers}<div id="s01-completion" data-stage01-completion aria-live="polite">${completionMarkup(item,p)}</div><button type="button" aria-describedby="s01-completion" data-stage01-action="complete" ${completionReady(item, p) ? '' : 'disabled'}>${p.complete ? 'Atividade concluída' : 'Concluir atividade'}</button></section>${navigation}</article>`;
  }
  function completionMarkup(item, p) {
    const requirements = [
      [p.predictionSaved && predictionsReady(item,p), 'Preencher e salvar todas as previsões'],
      [typeof p.passedCode === 'string' && p.passedCode === p.code, 'Executar e conferir o código atual'],
      [String(p.reflection || '').trim().length >= 16, 'Escrever sua explicação (mínimo de 16 caracteres)'],
      ...arr(prep(item).masteryTransfers).map((t,i)=>[typeof p.transfers[i]?.passedCode === 'string' && p.transfers[i].passedCode === p.transfers[i].code && String(p.transfers[i].prediction || '').trim() && !p.transfers[i].hintUsed, `Conferir a transferência sem dica: ${t.title}`])
    ];
    return `<ul>${requirements.map(([ok,label])=>`<li>${ok ? 'Feito' : 'Pendente'}: ${esc(label)}</li>`).join('')}</ul><p>A explicação é uma autoavaliação: o sistema confere seu preenchimento, não julga automaticamente seu raciocínio.</p>`;
  }
  function rerender(item, ctx, selector) {
    if (typeof ctx.render === 'function') ctx.render();
    const root = global.document?.querySelector(`[data-stage01-id="${item.id}"]`);
    const destination = selector && root?.querySelector(selector);
    destination?.focus?.({preventScroll:true});
    destination?.scrollIntoView?.({block:'nearest',behavior:'auto'});
  }
  function check(item, p, ctx) {
    const config = prep(item); const code = p.code; let result;
    const requiredPredictions = arr(config.predictionRows).length || 1;
    if (!p.predictionSaved || !predictionsReady(item,p)) {
      const denied = { ok: false, message: 'Salve uma previsão para cada linha antes de executar.', results: [] }; results.set(item.id,denied); return denied;
    }
    const checks = global.DevPathStage01Checks;
    if (checks?.check) result = checks.check(item.id, code, { order: p.order, secondOrder: p.secondOrder });
    else result = { ok: false, message: 'Validador indisponível; código não foi aprovado.', results: [] };
    results.set(item.id,result); if (result.ok && result.run && result.run.ok) p.passedCode = code; else p.passedCode = null;
    p.complete = false; ctx.saveProgress?.(); return result;
  }
  function handleInput(event, item, ctx = {}) {
    const target = event.target; const p = stateFor(item, ctx.progress || (ctx.progress = {}));
    const invalidate = (transferIndex) => {
      const root = target.closest?.('.s01-lesson');
      if (transferIndex !== undefined) { const t=p.transfers[transferIndex]; if(t) results.delete(`${item.id}:${t.id}`); target.closest('.s01-transfer')?.querySelector('[data-stage01-result]')?.remove(); }
      else { results.delete(item.id); root?.querySelector('#s01-practice [data-stage01-result]')?.remove(); root?.querySelectorAll('#s01-practice .s01-table-wrap, #s01-practice .s01-snapshots').forEach(node=>node.remove()); }
      const status=root?.querySelector('[data-stage01-status]'); if(status) status.textContent='Dados alterados; execute novamente para conferir esta versão.';
    };
    const refresh = () => { const root = target.closest?.('.s01-lesson'); const button = root?.querySelector('[data-stage01-action="complete"]'); if (button) button.disabled = !completionReady(item, p); const checklist = root?.querySelector('[data-stage01-completion]'); if(checklist) checklist.innerHTML = completionMarkup(item,p); };
    if (target.matches('[data-stage01-editor]')) { if (!target.readOnly) { p.code = target.value; invalidate(); p.passedCode = null; p.complete = false; ctx.saveProgress?.(); refresh(); } return true; }
    if (target.matches('[data-stage01-font]')) { p.fontSize = Math.max(14, Math.min(22, Number(target.value)||16)); const editor = target.closest('.s01-lesson')?.querySelector('[data-stage01-editor]'); if(editor) editor.style.fontSize = `${p.fontSize}px`; ctx.saveProgress?.(); return true; }
    if (target.matches('[data-stage01-blank]')) { const blank = prep(item).blanks?.[Number(target.dataset.stage01Blank)]; if (blank) { p.code = p.code.replace(new RegExp(`(^|[;\\n])(\\s*)(?:___|const|let)(\\s+${blank.name}\\b)`), (_,line,space,name) => `${line}${space}${target.value}${name}`); invalidate(); p.passedCode = null; p.complete = false; const editor = target.closest('.s01-lesson')?.querySelector('[data-stage01-editor]'); if(editor) editor.value = p.code; ctx.saveProgress?.(); refresh(); } return true; }
    if (target.matches('[data-stage01-prediction]')) { p.predictions[Number(target.dataset.stage01Prediction)] = target.value; p.predictionSaved = false; invalidate(); p.passedCode = null; p.complete = false; ctx.saveProgress?.(); refresh(); return true; }
    if (target.matches('[data-stage01-reflection]')) { p.reflection = target.value; p.complete = false; ctx.saveProgress?.(); refresh(); return true; }
    if (target.matches('[data-stage01-second-order]')) { p.secondOrder = target.value; invalidate(); p.passedCode = null; p.complete = false; ctx.saveProgress?.(); refresh(); return true; }
    if (target.matches('[data-stage01-transfer], [data-stage01-transfer-code]')) { p.transfers[Number(target.dataset.stage01Transfer || target.dataset.stage01TransferCode)] ||= {}; const t = p.transfers[Number(target.dataset.stage01Transfer || target.dataset.stage01TransferCode)]; if (target.matches('[data-stage01-transfer]')) { t.prediction = target.value; t.passedCode = null; } else { t.code = target.value; t.passedCode = null; } invalidate(Number(target.dataset.stage01Transfer || target.dataset.stage01TransferCode)); p.complete = false; ctx.saveProgress?.(); refresh(); return true; }
    return false;
  }
  function handleClick(event, item, ctx = {}) {
    const target = event.target.closest?.('[data-stage01-action]'); if (!target) return false;
    event.preventDefault(); const p = stateFor(item, ctx.progress || (ctx.progress = {})); const action = target.dataset.stage01Action;
    if (action === 'anchor') { const node = target.closest('.s01-lesson')?.querySelector(`#${target.dataset.stage01Target}`); node?.scrollIntoView?.({ behavior: global.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); node?.focus?.({ preventScroll: true }); return true; }
    if (action === 'save-predictions') { p.predictionSaved = predictionsReady(item,p); ctx.saveProgress?.(); ctx.toast?.(p.predictionSaved ? 'Previsões salvas.' : 'Preencha todas as previsões.'); rerender(item, ctx, p.predictionSaved ? '[data-stage01-action="run"]' : '#s01-predict'); return true; }
    if (action === 'run') { const result = check(item, p, ctx); ctx.toast?.(result.ok ? 'Código executado.' : 'Revise a mensagem de erro.'); rerender(item, ctx, '#s01-practice [data-stage01-result]'); return true; }
    if (action === 'transfer-run') { const i = Number(target.dataset.stage01TransferIndex); const t = p.transfers[i] ||= {}; const code = t.code || target.closest('.s01-transfer')?.querySelector('[data-stage01-transfer-code]')?.value || ''; const prediction = String(t.prediction || '').trim(); if (!prediction) { ctx.toast?.('Registre a previsão antes de executar.'); return true; } const result = global.DevPathStage01Checks?.checkTransfer ? global.DevPathStage01Checks.checkTransfer(t.id, code) : { ok: false, message: 'Validador indisponível.' }; results.set(`${item.id}:${t.id}`,result); t.passedCode = result.ok ? code : null; ctx.saveProgress?.(); rerender(item, ctx, `[data-stage01-transfer-code="${i}"]`); return true; }
    if (action === 'hint') { const requested = Number(target.dataset.stage01Hint); if (requested <= p.hintLevel) { p.hintLevel = requested + 1; ctx.saveProgress?.(); rerender(item, ctx, '[data-stage01-action="hint"]'); } return true; }
    if (action === 'complete') { if (completionReady(item, p)) { p.complete = true; ctx.progress.answers ||= {}; ctx.progress.answers[item.id] = true; ctx.progress.completed ||= []; if (!ctx.progress.completed.includes(item.id)) ctx.progress.completed.push(item.id); ctx.progress.exerciseVersions ||= {}; ctx.progress.exerciseVersions[item.id] = VERSION; ctx.progress.reviewSchedule ||= {}; ctx.progress.reviewSchedule[item.id] = { intervalIndex: 0, dueAt: Date.now() + 86400000 }; ctx.saveProgress?.(); rerender(item, ctx, '[data-stage01-action="complete"]'); } return true; }
    if (action === 'restore') { results.delete(item.id); p.order = arr(prep(item).parsons?.initialOrder || prep(item).initialOrder); assemble(item, p); p.passedCode = null; p.complete = false; ctx.saveProgress?.(); rerender(item, ctx); return true; }
    if (['up','down','remove'].includes(action)) { results.delete(item.id); const id = target.dataset.stage01BlockId; const order = p.order.slice(); const index = order.indexOf(id); if (action === 'remove') order.splice(index, 1); else if (index >= 0) { const next = action === 'up' ? index - 1 : index + 1; if (next >= 0 && next < order.length) [order[index], order[next]] = [order[next], order[index]]; } p.order = order; assemble(item, p); p.passedCode = null; p.complete = false; ctx.saveProgress?.(); rerender(item, ctx, action === 'remove' ? '[data-stage01-action="restore"]' : `[data-stage01-action="${action}"][data-stage01-block-id="${id}"]`); return true; }
    if (action === 'trace-step') { ctx.toast?.(target.textContent); return true; }
    return false;
  }
  function complete(item, progress) {
    const p = progress?.stage01?.[item.id];
    if (!(p?.version === VERSION && p.complete && completionReady(item,p))) return false;
    // Recheck restored evidence: a persisted flag is not proof the current code works.
    if (!global.DevPathStage01Checks.check(item.id,p.code,{order:p.order,secondOrder:p.secondOrder}).ok) return false;
    return arr(prep(item).masteryTransfers).every(t => {
      const saved=arr(p.transfers).find(entry => entry.id===t.id);
      return saved && global.DevPathStage01Checks.checkTransfer(t.id,saved.code).ok;
    });
  }
  global.DevPathStage01UI = { render, handleClick, handleInput, complete, sync: stateFor, key: (item) => item.id };
})(globalThis);
