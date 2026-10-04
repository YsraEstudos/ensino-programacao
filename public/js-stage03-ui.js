(function (global) {
    'use strict';
    const VERSION = 2, hints = new Map();
    const esc = v => global.DevPathTeachingUtils.escapeHTML(v ?? "");
    const key = item => `${item.id}@v${VERSION}`;
    const prep = item => global.DevPathStage03Preparation[item.id];
    function draft(item, progress) {
        try {
            const d = JSON.parse(progress.exerciseDrafts?.[key(item)] || '{}');
            return d && typeof d === 'object' && !Array.isArray(d) ? d : {};
        }
        catch {
            return {};
        }
    }
    function getState(item, progress) {
        const p = prep(item), d = draft(item, progress);
        return {
            code: d.code ?? p.starter, cells: [...(d.cells || [])], order: [...(d.order || p.parsons?.initialOrder || [])], secondary: d.secondary ?? p.secondaryPractice?.starter ?? '', transfer: d.transfer ?? p.transfer?.starter ?? '', transferPrediction: d.transferPrediction || ''
        };
    }
    function save(item, ctx, patch) {
        const previous = getState(item, ctx.progress), d = { ...draft(item, ctx.progress), ...patch }, serialized = JSON.stringify(d);
        if (serialized.length > 2500) {
            ctx.toast?.('O rascunho ultrapassa 2.500 caracteres salvos. Reduza comentários ou texto antes de continuar.');
            return false;
        }
        ctx.progress.exerciseDrafts ||= {};
        ctx.progress.exerciseDrafts[key(item)] = serialized;
        if (complete(item, ctx.progress)) {
            ctx.progress.answers[item.id] = false;
            ctx.progress.completed = ctx.progress.completed.filter(id => id !== item.id);
        }
        if (ctx.progress.exerciseEvidence?.[key(item)] && ['code', 'cells', 'order'].some(field => Object.hasOwn(patch, field) && JSON.stringify(patch[field]) !== JSON.stringify(previous[field])))
            delete ctx.progress.exerciseEvidence[key(item)].status;
        (ctx.scheduleSave || ctx.saveProgress)?.();
        return true;
    }
    function note(root, selector, message, ok, focus = true) {
        const out = root.querySelector(selector);
        if (!out)
            return;
        out.textContent = message;
        out.classList.toggle('success', ok === true);
        out.classList.toggle('error', ok === false);
        if (focus)
            out.focus?.();
    }
    function resultMarkup(name) {
        return `
      <p data-s03-${name} role="status" tabindex="-1"></p>`;
    }
    function codeBlock(code) { return `<pre tabindex="0"><code>${esc(code)}</code></pre>`; }
    function tableMarkup(p, s) {
        if (!p.table)
            return '';
        let n = 0;
        return `
      <fieldset
        class="s03-table"><legend>${esc(p.table.caption)}</legend>
      <div
        class="s03-table-scroll">
      <table>
      <thead>
      <tr><th scope="col">Passagem ou caso</th>${p.table.columns.map(c => `<th scope="col">${esc(c)}</th>`).join('')}
      </tr>
      </thead>
      <tbody>${p.table.rows.map(row => `
      <tr><th scope="row">${esc(row.label)}</th>${p.table.columns.map(c => `<td><input
        data-s03-cell="${n}" maxlength="16" aria-label="${esc(row.label)}: ${esc(c)}" value="${esc(s.cells[n++] ?? '')}"></td>`).join('')}</tr>`).join('')}
      </tbody>
      </table>
      </div><button
        class="button-secondary"
        data-s03-action="table"
        type="button">Conferir tabela</button>${resultMarkup('table-status')}</fieldset>`;
    }
    function parsonsCode(p, order) {
        const blocks = new Map(p.parsons.blocks.map(b => [b.id, b]));
        if (order.length !== blocks.size || new Set(order).size !== blocks.size || order.some(id => !blocks.has(id)))
            return '';
        if (blocks.get(order.at(-1)).condition !== null)
            return '';
        return 'for (let i = 1; i <= 30; i++) {\n' + order.map((id, index) => {
            const b = blocks.get(id);
            return `  ${b.condition === null ? 'else' : `${index ? 'else if' : 'if'} (${b.condition})`} { console.log(${b.value}); }`;
        }).join('\n') + '\n}';
    }
    function parsonsMarkup(p, s) {
        const blocks = new Map(p.parsons.blocks.map(b => [b.id, b]));
        return `
      <fieldset
        class="s03-parsons"><legend>Ordene as regras dentro do for de 1 a 30</legend>
      <p>Os botões movem os blocos e funcionam com Tab e Enter. O caso restante deve ser o último; as regras individuais podem trocar de posição.
      </p><ol>${s.order.map((id, i) => {
            const b = blocks.get(id);
            return b ? `
      <li
        data-s03-block="${esc(id)}"><code>${esc(b.condition === null ? 'else' : b.condition)} → console.log(${esc(b.value)})</code><span><button
        class="button-secondary"
        type="button"
        data-s03-action="up"
        data-block="${esc(id)}" ${i === 0 ? 'disabled' : ''} aria-label="Mover ${esc(id)} para cima">↑</button><button
        class="button-secondary"
        type="button"
        data-s03-action="down"
        data-block="${esc(id)}" ${i === s.order.length - 1 ? 'disabled' : ''} aria-label="Mover ${esc(id)} para baixo">↓</button></span></li>` : '';
        }).join('')}</ol>
      <details><summary>Ver o código produzido pelos blocos</summary>${codeBlock(parsonsCode(p, s.order) || 'Coloque o caso restante por último para montar a cadeia.')}</details></fieldset>`;
    }
    function auxiliaryMarkup(section, name, s, required) {
        if (!section)
            return '';
        const demo = section.demonstration;
        return `
      <section
        class="s03-${name}">
      <h3>${esc(section.title || 'Transferência para outro cenário')} ${required ? '· obrigatória' : '· prática adicional'}</h3>${demo ? `${codeBlock(demo.code)}<ol>${demo.walkthrough.map(x => `
      <li>${esc(x)}</li>`).join('')}</ol>` : ''}
      <p>${esc(section.prompt)}</p>${name === 'transfer' && required ? "<p>Resolva este cenário sem dicas ou solução pronta. Preveja o estado final antes de " +
            "executar.</p><label>Previsão da transferência<textarea data-s03-transfer-prediction " +
            "maxlength=\"150\">${esc(s.transferPrediction)}</textarea></label>" : ''}
      <label>Código deste cenário<textarea data-s03-${name} maxlength="${name === 'secondary' ? 350 : 600}" spellcheck="false" autocapitalize="off">${esc(s[name])}</textarea>
      </label><button
        class="button-secondary"
        type="button"
        data-s03-action="${name}">Conferir ${name === 'secondary' ? 'miniprática' : 'transferência'}</button>${resultMarkup(`${name}-output`)}</section>`;
    }
    function render(item, ctx) {
        const p = prep(item), s = getState(item, ctx.progress), t = p.teaching, answered = ctx.progress.warmupCompleted?.[key(item)] === true;
        const prediction = ctx.progress.exercisePredictions?.[key(item)] || '', reflection = ctx.progress.exerciseReflections?.[key(item)] || '';
        const ev = ctx.progress.exerciseEvidence?.[key(item)] || {}, done = complete(item, ctx.progress), hintCount = hints.get(item.id) || 0;
        const activities = (ctx.activities || []).filter(x => !x.optional), position = activities.findIndex(x => x.id === item.id), previous = activities[position - 1], next = activities[position + 1];
        const stage = activities.filter(x => x.stage === '03');
        return `
      <article
        class="s03-lesson"><a
        class="lesson-back"
        href="#/catalog">← Todas as etapas</a>
      <header
        class="s03-hero">
      <div
        class="s03-kicker">ETAPA 03 · PASSO ${stage.findIndex(x => x.id === item.id) + 1} DE 9 · ID ${esc(item.id)}
      </div>
      <h1>${esc(item.title)}<span
        class="brand-period">.</span>
      </h1>
      <p>Decisões, repetição e mudanças de estado, sem arrays.
      </p>
      <p>Os IDs identificam as atividades. Siga os passos: decisões → fronteiras → repetição → simulações.
      </p>
      <p>Pré-requisitos: operadores, comparações, resto % e condições && / || da <a
        href="#/javascript/02.01">Etapa 02</a>.
      </p>
      </header>
      <nav
        class="s03-steps"
        aria-label="Sequência de aprendizagem"><span>1 · Entender</span><span>2 · Prever</span><span>3 · Praticar</span><span>4 · Explicar</span>
      </nav>
      <section
        class="s03-teaching">
      <div
        class="s03-kicker">EXPLICAÇÃO GUIADA
      </div>
      <h2>${esc(t.title)}</h2>${t.paragraphs.map(x => `
      <p>${esc(x)}</p>`).join('')}
      <h3>Exemplo resolvido
      </h3>${codeBlock(t.code)}<ol>${t.walkthrough.map(x => `
      <li>${esc(x)}</li>`).join('')}</ol><button
        class="button-secondary"
        type="button"
        data-s03-action="example">Executar este exemplo</button>${resultMarkup('example-output')}
      <p
        class="s03-pitfall"><strong>Armadilha comum:</strong> ${esc(t.pitfall)}
      </p>
      <p>${esc(t.next)}
      </p>
      </section>
      <section
        class="s03-prompt">
      <div
        class="s03-kicker">DESAFIO
      </div>
      <h2>Sua vez
      </h2>
      <p>${esc(item.prompt)}</p>${item.id === '03.09' ? '<p>Imprima console.log(heroi, monstro, turnos, resultado). Use as mensagens "heroi", "monstro" ou "empate".</p>' : ''}
      <p>${esc(item.firstResponse.action)}</p>${p.parsons ? '' : `
      <details
        class="s03-starter"><summary>Material inicial · somente leitura</summary>${codeBlock(p.starter)}</details>`}${tableMarkup(p, s)}${answered ? `
      <p><strong>Previsão registrada:</strong> ${esc(prediction)}</p>` : `
      <label>Previsão antes de executar<textarea data-s03-prediction
        maxlength="400">${esc(prediction)}</textarea>
      </label><button
        class="button-primary"
        type="button"
        data-s03-action="predict">Registrar previsão e abrir a prática</button>`}${resultMarkup('prediction-status')}</section>${answered ? `
      <section
        class="s03-practice">
      <h2>Praticar e conferir
      </h2>${p.parsons ? parsonsMarkup(p, s) : item.id === '03.05' ? '<p>A matriz acima é sua prática. A conferência verifica as quatro regras.</p>' : `
      <label>main.js ${p.readonly ? '· código fornecido, não altere' : ''}<textarea data-s03-code
        maxlength="1100"
        spellcheck="false"
        autocapitalize="off" ${p.readonly ? 'readonly' : ''}>${esc(p.readonly ? p.starter : s.code)}</textarea></label>`}
      <p>Confira sua previsão${p.table ? " e a tabela" : " e a ordem dos blocos"}. Os casos testam estados e fronteiras; uma mensagem de erro indica onde revisar.
      </p><button
        class="button-primary"
        type="button"
        data-s03-action="run">${item.id === '03.05' ? 'Conferir matriz e registrar prática' : 'Executar e conferir os casos'}</button>${item.id === '03.06' ? '<button class="button-secondary" type="button" data-s03-action="reproduce">Observar o starter com erro</button>' : ''}${resultMarkup('output')}<button
        class="button-secondary"
        type="button"
        data-s03-action="hint">Abrir próxima dica (${hintCount}/3)</button>${hintCount ? `
      <aside
        class="s03-hint" tabindex="-1">
      <h3>Dica ${hintCount}
      </h3>
      <p>${esc(p.hints[hintCount - 1])}</p></aside>` : ''}${auxiliaryMarkup(p.secondaryPractice, 'secondary', s, true)}${auxiliaryMarkup(p.transfer, 'transfer', s, ['03.08', '03.09'].includes(item.id))}
      <fieldset
        class="s03-rubric"><legend>Confira o que aprendeu</legend>${p.rubric.map((r, i) => `
      <label><input
        type="checkbox" data-s03-rubric value="${i}" ${ev.rubric?.includes(i) ? 'checked' : ''}><span>${esc(r)}</span></label>`).join('')}
      </fieldset>
      <label>${esc(p.reflectionPrompt)}<textarea data-s03-reflection
        maxlength="600">${esc(reflection)}</textarea>
      </label>
      <p data-s03-count>${reflection.trim().length}/16 caracteres
      </p><button
        class="button-primary"
        type="button"
        data-s03-action="complete" ${done ? 'disabled' : ''}>${done ? 'Atividade concluída ✓' : 'Concluir com minha explicação'}</button>${resultMarkup('complete-status')}</section>` : '<p class="s03-gate">Depois do exemplo, ${p.table?"preencha a tabela e " : ""}registre sua previsão para abrir a prática.</p>'}
      <footer
        class="s03-footer">${previous ? `<a
        class="button-secondary"
        href="#/javascript/${esc(previous.id)}">← ${esc(previous.id)} · ${esc(previous.title)}</a>` : '<span></span>'}${next ? `<a
        class="button-secondary"
        href="#/javascript/${esc(next.id)}">${esc(next.id)} · ${esc(next.title)} →</a>` : ''}</footer></article>`;
    }
    function validate(item, progress) {
        const p = prep(item), s = getState(item, progress), checks = global.DevPathStage03Checks;
        const table = checks.checkTable(item.id, s.cells);
        if (!table.ok)
            return table;
        if (item.id === '03.05')
            return table;
        let code = p.readonly ? p.starter : s.code;
        if (p.parsons) {
            code = parsonsCode(p, s.order);
            if (!code)
                return { ok: false, message: 'Coloque a combinação antes das regras individuais e deixe o caso restante por último.' };
        }
        return checks.check(item.id, code);
    }
    function capture(root, item, ctx) {
        const patch = {}, s = getState(item, ctx.progress);
        for (const name of ['code', 'secondary', 'transfer']) {
            const el = root.querySelector(`[data-s03-${name}]`);
            if (el && !el.readOnly)
                patch[name] = el.value;
        }
        const cells = [...root.querySelectorAll('[data-s03-cell]')];
        if (cells.length)
            patch.cells = cells.map(x => x.value);
        if (Object.entries(patch).every(([k, v]) => JSON.stringify(v) === JSON.stringify(s[k])))
            return true;
        return save(item, ctx, patch);
    }
    function handleClick(event, item, ctx) {
        const button = event.target.closest?.('[data-s03-action]');
        if (!button)
            return false;
        const root = button.closest('.s03-lesson'), p = prep(item), action = button.dataset.s03Action;
        if (!capture(root, item, ctx))
            return true;
        if (action === 'example' || action === 'reproduce') {
            const r = global.DevPathStage03Runner.run(action === 'example' ? p.teaching.code : p.starter);
            note(root, action === 'example' ? '[data-s03-example-output]' : '[data-s03-output]', r.ok ? r.lines.map(x => x.values.map(global.DevPathStage03Runner.format).join(' ')).join('\n') : r.error, r.ok);
            return true;
        }
        if (action === 'table') {
            const r = global.DevPathStage03Checks.checkTable(item.id, getState(item, ctx.progress).cells);
            note(root, '[data-s03-table-status]', r.message, r.ok);
            return true;
        }
        if (action === 'predict') {
            const value = root.querySelector('[data-s03-prediction]').value.trim();
            if (!value) {
                note(root, '[data-s03-prediction-status]', 'Escreva sua previsão antes de continuar.', false);
                return true;
            }
            ctx.progress.exercisePredictions ||= {};
            ctx.progress.exercisePredictions[key(item)] = value.slice(0, 400);
            ctx.progress.warmupCompleted ||= {};
            ctx.progress.warmupCompleted[key(item)] = true;
            ctx.saveProgress();
            ctx.render();
            global.document.querySelector('[data-s03-code], [data-s03-action="down"]:not(:disabled), [data-s03-action="run"]')?.focus();
            return true;
        }
        if (!ctx.progress.warmupCompleted?.[key(item)])
            return true;
        if (action === 'up' || action === 'down') {
            const s = getState(item, ctx.progress), i = s.order.indexOf(button.dataset.block), next = i + (action === 'up' ? -1 : 1);
            if (next < 0 || next >= s.order.length)
                return true;
            [s.order[i], s.order[next]] = [s.order[next], s.order[i]];
            if (save(item, ctx, { order: s.order })) {
                ctx.render();
                const same = global.document.querySelector(`[data-s03-action="${action}"][data-block="${button.dataset.block}"]`);
                (same && !same.disabled ? same : global.document.querySelector(`[data-block="${button.dataset.block}"]:not(:disabled)`))?.focus();
            }
            return true;
        }
        if (action === 'hint') {
            hints.set(item.id, Math.min(3, (hints.get(item.id) || 0) + 1));
            ctx.render();
            global.document.querySelector('.s03-hint')?.focus();
            return true;
        }
        if (action === 'secondary' || action === 'transfer') {
            const section = action === 'secondary' ? p.secondaryPractice : p.transfer;
            if (action === 'transfer' && ['03.08', '03.09'].includes(item.id)) {
                const predicted = root.querySelector('[data-s03-transfer-prediction]')?.value.trim();
                if (!predicted) {
                    note(root, '[data-s03-transfer-output]', 'Registre a previsão deste cenário antes de conferir.', false);
                    return true;
                }
                save(item, ctx, { transferPrediction: predicted.slice(0, 150) });
            }
            const r = global.DevPathStage03Checks.checkFixtures(getState(item, ctx.progress)[action], section.fixtures);
            note(root, `[data-s03-${action}-output]`, r.message, r.ok);
            ctx.saveProgress();
            return true;
        }
        if (action === 'run') {
            const r = validate(item, ctx.progress);
            note(root, '[data-s03-output]', r.message, r.ok);
            if (r.ok && item.id !== '03.05') {
                const state = getState(item, ctx.progress), code = p.parsons ? parsonsCode(p, state.order) : p.readonly ? p.starter : state.code;
                const actual = global.DevPathStage03Runner.run(code);
                let consoleOut = root.querySelector('[data-s03-console]');
                if (!consoleOut) {
                    consoleOut = global.document.createElement('pre');
                    consoleOut.dataset.s03Console = '';
                    consoleOut.tabIndex = 0;
                    root.querySelector('[data-s03-output]').after(consoleOut);
                }
                consoleOut.textContent = actual.ok ? 'Console da sua tentativa:\n' + actual.lines.map(line => line.values.map(global.DevPathStage03Runner.format).join(' ')).join('\n') : actual.error;
            }
            ctx.progress.exerciseEvidence ||= {};
            ctx.progress.exerciseEvidence[key(item)] = {
                ...ctx.progress.exerciseEvidence[key(item)], ...(r.ok ? { status: item.id === '03.05' ? 'written' : 'executed' } : {}), runResult: r.ok ? (item.id === '03.05' ? 'guided' : 'result') : 'error', output: r.message, runCount: Math.min(100000, (ctx.progress.exerciseEvidence[key(item)]?.runCount || 0) + 1), recordedAt: new Date().toISOString()
            };
            ctx.saveProgress();
            return true;
        }
        if (action === 'complete') {
            const ev = ctx.progress.exerciseEvidence?.[key(item)], r = validate(item, ctx.progress), s = getState(item, ctx.progress);
            if (!r.ok || !ev?.status) {
                note(root, '[data-s03-complete-status]', r.ok ? 'Execute e confira a prática antes de concluir.' : r.message, false);
                return true;
            }
            if (p.secondaryPractice) {
                const extra = global.DevPathStage03Checks.checkFixtures(s.secondary, p.secondaryPractice.fixtures);
                if (!extra.ok) {
                    note(root, '[data-s03-complete-status]', 'Conclua a miniprática: ' + extra.message, false);
                    return true;
                }
            }
            if (['03.08', '03.09'].includes(item.id)) {
                const transfer = global.DevPathStage03Checks.checkFixtures(s.transfer, p.transfer.fixtures);
                if (!draft(item, ctx.progress).transferPrediction || !transfer.ok) {
                    note(root, '[data-s03-complete-status]', 'Conclua a transferência sem dicas, incluindo sua previsão: ' + transfer.message, false);
                    return true;
                }
            }
            const reflection = root.querySelector('[data-s03-reflection]').value.trim(), rubric = [...root.querySelectorAll('[data-s03-rubric]:checked')].map(x => Number(x.value));
            if (reflection.length < 16 || rubric.length !== p.rubric.length) {
                note(root, '[data-s03-complete-status]', 'Explique com pelo menos 16 caracteres e confira todos os critérios.', false);
                return true;
            }
            ctx.progress.exerciseReflections ||= {};
            ctx.progress.exerciseReflections[key(item)] = reflection.slice(0, 600);
            ctx.progress.answers ||= {};
            ctx.progress.answers[item.id] = true;
            ctx.progress.exerciseVersions ||= {};
            ctx.progress.exerciseVersions[item.id] = VERSION;
            ctx.progress.completed ||= [];
            if (!ctx.progress.completed.includes(item.id))
                ctx.progress.completed.push(item.id);
            ctx.progress.exerciseEvidence[key(item)] = { ...ev, rubric };
            ctx.progress.reviewSchedule ||= {};
            ctx.progress.reviewSchedule[item.id] = { intervalIndex: 0, dueAt: Date.now() + 7 * 86400000 };
            ctx.saveProgress();
            ctx.render();
            return true;
        }
        return true;
    }
    function handleInput(event, item, ctx) {
        const el = event.target, root = el.closest?.('.s03-lesson');
        if (!root)
            return false;
        if (el.matches('[data-s03-reflection]')) {
            ctx.progress.exerciseReflections ||= {};
            ctx.progress.exerciseReflections[key(item)] = el.value.slice(0, 600);
            root.querySelector('[data-s03-count]').textContent = `${el.value.trim().length}/16 caracteres`;
            (ctx.scheduleSave || ctx.saveProgress)?.();
            return true;
        }
        if (el.matches('[data-s03-rubric]')) {
            ctx.progress.exerciseEvidence ||= {};
            const ev = ctx.progress.exerciseEvidence[key(item)] || {};
            ctx.progress.exerciseEvidence[key(item)] = { ...ev, rubric: [...root.querySelectorAll('[data-s03-rubric]:checked')].map(x => Number(x.value)) };
            (ctx.scheduleSave || ctx.saveProgress)?.();
            return true;
        }
        if (el.matches('[data-s03-code],[data-s03-secondary],[data-s03-transfer],[data-s03-cell]')) {
            capture(root, item, ctx);
            note(root, '[data-s03-output]', 'Resposta alterada. Confira novamente antes de concluir.', undefined, false);
            return true;
        }
        if (el.matches('[data-s03-transfer-prediction]')) {
            save(item, ctx, { transferPrediction: el.value.slice(0, 150) });
            return true;
        }
        return el.matches('[data-s03-prediction],[data-s03-transfer-prediction]');
    }
    function complete(item, progress) { return progress.answers?.[item.id] === true && progress.exerciseVersions?.[item.id] === VERSION && Boolean(progress.completed?.includes(item.id)); }
    global.DevPathStage03UI = {
        render, handleClick, handleInput, complete, getState, parsonsCode
    };
})(globalThis);
