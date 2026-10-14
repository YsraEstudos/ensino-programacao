(function (global) {
    'use strict';
    const VERSION = 1, runner = global.DevPathStage02Runner, lessons = global.DevPathStage02Lessons;
    const html = value => global.DevPathTeachingUtils.escapeHTML(value ?? "");
    const format = runner.format;
    const view = () => document.querySelector('#view');
    const latest = new Map();
    function inlineText(value) {
        return String(value).split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map(part => {
            if (part.startsWith('`') && part.endsWith('`'))
                return `<code>${html(part.slice(1, -1))}</code>`;
            if (part.startsWith('**') && part.endsWith('**'))
                return `<strong>${html(part.slice(2, -2))}</strong>`;
            return html(part);
        }).join('');
    }
    function bridgeMarkup(source) {
        const blocks = [];
        let paragraph = [];
        const flush = () => {
            if (paragraph.length) {
                blocks.push(`
      <p>${paragraph.map(inlineText).join('<br>')}</p>`);
                paragraph = [];
            }
        };
        for (const line of source.split(/\r?\n/)) {
            const heading = line.match(/^#{1,4}\s+(.+)$/);
            if (!line.trim()) {
                flush();
                continue;
            }
            if (heading) {
                flush();
                blocks.push(`
      <h3>${inlineText(heading[1])}</h3>`);
                continue;
            }
            paragraph.push(line);
        }
        flush();
        return blocks.join('');
    }
    function officialDocs(resources = []) {
        const urls = resources.filter(resource => resource.startsWith('Documentação oficial:')).flatMap(resource => resource.match(/https:\/\/[^\s;]+/g) || []);
        if (!urls.length)
            return '';
        return `
      <section
        class="s02-docs"
        aria-label="Documentação oficial">
      <h3>Documentação oficial
      </h3>
      <ul>${urls.map(url => {
            let label = url;
            try {
                const parsed = new URL(url);
                label = `MDN · ${decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || parsed.hostname).replaceAll('_', ' ').replaceAll('-', ' ')}`;
            }
            catch { }
            return `
      <li><a
        href="${html(url)}" target="_blank" rel="noopener noreferrer">${html(label)} ↗</a></li>`;
        }).join('')}</ul></section>`;
    }
    const questions = {
        '02.01': [
            ['Em 5 + 2 * 3, qual operação vem primeiro?', ['Multiplicação; o resultado final é 11.', 'Soma; o resultado final é 21.', 'As duas sempre ocorrem da esquerda para a direita.']],
            ['Que tipo true && "ok" devolve?', ['String: "ok".', 'Boolean: true.', 'Number: 1.']],
            ['Por que 1 == "1" difere de 1 === "1"?', ['== faz coerção; === não converte tipos.', '=== sempre converte strings em números.', '== e === seguem exatamente a mesma regra.']],
        ],
        '02.10': [
            ['Por que floor(-1.8) e trunc(-1.8) diferem?', ['Floor dá -2; trunc dá -1.', 'Ambos dão -1.', 'Trunc dá -2; floor dá -1.']],
            ['Como obter a magnitude de -4?', ['Math.abs(-4), que dá 4.', 'Math.min(-4,0), que dá 4.', 'Math.floor(-4), que dá 4.']],
            ['Qual é o intervalo de Math.random()?', ['Inclui 0 e exclui 1: [0,1).', 'Inclui 0 e 1: [0,1].', 'Devolve apenas inteiros entre 1 e 6.']],
        ],
        '02.11': [
            ['Todo decimal é aproximado em Number?', ['Não: 0.5 e 0.25 são exemplos exatos.', 'Sim: nenhum decimal é representável exatamente.', 'Não: 0.1 + 0.2 é exatamente 0.3.']],
            ['Quando BigInt ajuda?', ['Na aritmética de inteiros além da precisão segura.', 'Em frações decimais exatas, misturado com Number.', 'Apenas para arredondar números menores que 1.']],
        ],
    };
    const parsons = {
        A: 'const suficiente = saldo >= valor;', B: 'const autorizada = ativa === true;', C: 'const podePagar = suficiente && autorizada;', D: 'console.log(podePagar);', E: 'const podePagar = suficiente || autorizada;'
    };
    const parsonsSource = letters => 'const saldo = 10;\nconst valor = 8;\nconst ativa = true;\n' + letters.map(letter => parsons[letter]).join('\n');
    function validPrediction(config, prediction) {
        if (!config.rows)
            return typeof prediction === 'string' && prediction.trim().length > 0;
        try {
            const rows = JSON.parse(prediction), types = [
                'number', 'string', 'boolean', 'undefined', 'object', 'bigint'
            ];
            return Array.isArray(rows) && rows.length === config.rows.length && rows.every((row, i) => typeof row?.value === 'string' && row.value.trim() && types.includes(row.type) &&
                (!config.classifications || i % 2 !== 0 || ['sim', 'não'].includes(row.falsy) && ['sim', 'não'].includes(row.nullish)));
        }
        catch {
            return false;
        }
    }
    function getState(item, progress) {
        progress.stage02 ||= {};
        let state = progress.stage02[item.id];
        if (!state || state.version !== VERSION || !Array.isArray(state.blocks) || state.blocks.length !== lessons.lessons[item.id].length) {
            state = {
                version: VERSION, index: 0, complete: false, reflection: '', blocks: lessons.lessons[item.id].map(config => ({
                    code: config.starter, prediction: '', predictionSaved: false, understood: false, passedCode: null, hintLevel: 0, parsons: [
                        'C', 'D', 'A', 'E', 'B'
                    ]
                }))
            };
            progress.stage02[item.id] = state;
        }
        state.index = Math.max(0, Math.min(state.blocks.length - 1, Number(state.index) || 0));
        // Keep drafts and reflections, but recheck saved evidence against the
        // current cases. A previous approval must not bypass a revised boundary.
        state.blocks.forEach((block, index) => {
            const config = lessons.lessons[item.id][index];
            if (block.predictionSaved && config.rows) {
                if (!validPrediction(config, block.prediction)) {
                    block.predictionSaved = false;
                    block.understood = false;
                    block.passedCode = null;
                    state.complete = false;
                }
            }
            if (block.passedCode !== null && !lessons.check(item.id, index, block.code).ok) {
                block.passedCode = null;
                state.complete = false;
            }
        });
        return state;
    }
    function passed(state, index) { const block = state.blocks[index]; return block.predictionSaved && block.understood && block.passedCode === block.code; }
    function complete(item, progress) {
        if (!progress.stage02?.[item.id])
            return false;
        const state = getState(item, progress);
        return Boolean(state.complete && state.version === VERSION && state.blocks.every((_, index) => passed(state, index)));
    }
    function questionFor(item, index) {
        const own = questions[item.id]?.[index];
        return own ? {
            prompt: own[0], choices: own[1], answer: 0
        } : item.review;
    }
    function predictionFields(config, block) {
        const locked = block.predictionSaved ? 'readonly aria-readonly="true"' : '';
        if (!config.rows)
            return `
      <label
        class="course-response-label" for="s02-prediction"><span>Sua previsão para os casos</span><small>Registre as saídas e os tipos antes de executar sua solução. Errar faz parte da comparação.</small><textarea
        id="s02-prediction" data-s02-prediction
        maxlength="2000" ${locked}>${html(block.prediction)}</textarea></label>`;
        let values = [];
        try {
            const parsed = JSON.parse(block.prediction || '[]');
            if (Array.isArray(parsed))
                values = parsed;
        }
        catch { }
        const select = (name, i, value, choices) => `<select
        id="s02-${name}-${i}" data-s02-${name}="${i}" ${block.predictionSaved ? 'disabled' : ''}><option value="">Escolha</option>${choices.map(choice => `<option value="${choice}" ${value === choice ? 'selected' : ''}>${choice}</option>`).join('')}</select>`;
        return `
      <p
        class="s02-scroll-note">Em telas pequenas, role a tabela para conferir todas as colunas.
      </p>
      <div
        class="s02-table-wrap" tabindex="0"
        role="region"
        aria-label="Tabela de previsão, com rolagem horizontal">
      <table
        class="s02-table"><caption>Preveja valor e tipo. Strings usam aspas, inclusive "".${block.predictionSaved ? ' Previsão registrada e bloqueada para comparação.' : ''}</caption>
      <thead>
      <tr><th scope="col">Expressão</th><th scope="col">Valor previsto</th><th scope="col">Tipo previsto</th>${config.classifications ? '<th scope="col">Entrada falsy?</th><th scope="col">Entrada nullish?</th>' : ''}
      </tr>
      </thead>
      <tbody>${config.rows.map((row, i) => {
            const saved = values[i] && typeof values[i] === 'object' ? values[i] : { value: values[i] || '' };
            return `
      <tr><th scope="row"><code>${html(row)}</code></th><td>
      <label
        class="s02-sr-only" for="s02-pred-${i}">Valor de ${html(row)}
      </label><input
        id="s02-pred-${i}" data-s02-row="${i}" value="${html(saved.value || '')}" ${locked}
        maxlength="120"
        autocomplete="off" /></td><td>
      <label
        class="s02-sr-only" for="s02-type-${i}">Tipo de ${html(row)}</label>${select('type', i, saved.type, [
                'number', 'string', 'boolean', 'undefined', 'object', 'bigint'
            ])}</td>${config.classifications && i % 2 === 0 ? `<td rowspan="2">
      <label
        class="s02-sr-only" for="s02-falsy-${i}">A entrada ${html(row.split(' ||')[0])} é falsy?</label>${select('falsy', i, saved.falsy, ['sim', 'não'])}</td><td rowspan="2">
      <label
        class="s02-sr-only" for="s02-nullish-${i}">A entrada ${html(row.split(' ||')[0])} é nullish?</label>${select('nullish', i, saved.nullish, ['sim', 'não'])}</td>` : ''}</tr>`;
        }).join('')}</tbody></table></div>`;
    }
    function fadedFields(config, block) {
        return `
      <fieldset
        class="s02-gaps"><legend>Complete somente as duas expressões</legend>${['numero', 'invalido'].map(name => {
            const match = block.code.match(new RegExp('const ' + name + ' = (.*);'));
            const value = match?.[1] === '/* complete */' ? '' : match?.[1] || '';
            return `
      <label for="s02-gap-${name}"><code>const ${name} =</code><input
        id="s02-gap-${name}" data-s02-gap="${name}" value="${html(value)}" maxlength="300" spellcheck="false" autocomplete="off" /></label>`;
        }).join('')}</fieldset>`;
    }
    function sectionStart(name, number, title, kicker) {
        return `
      <section
        id="s02-${name}" class="s02-section" tabindex="-1" aria-labelledby="s02-${name}-title">
      <div
        class="s02-kicker">${number} / ${kicker}
      </div>
      <h2
        id="s02-${name}-title">${title}</h2>`;
    }
    function journeyMarkup() {
        const steps = [
            ['learn', 'Aprender', 'Vocabulário e exemplo'], ['challenge', 'Desafio', 'O que você vai fazer'], ['predict', 'Prever', 'Pensar antes de executar'], ['practice', 'Praticar', 'Código e feedback'], ['explain', 'Explicar', 'Comparar e concluir']
        ];
        return `
      <div
        class="s02-journey">
      <div
        class="s02-journey-caption">ROTEIRO DA AULA
      </div>
      <nav
        class="s02-steps"
        aria-label="Ir para uma parte desta aula">${steps.map(([target, title, detail], i) => `<button
        type="button"
        data-s02-action="navigate"
        data-s02-target="${target}" ${i === 0 ? 'aria-current="step"' : ''}><span
        class="s02-step-number">0${i + 1}</span><span><strong>${title}</strong><small>${detail}</small></span></button>`).join('')}
      </nav>
      </div>
      <p
        class="s02-path-help">Comece por Aprender e avance no seu ritmo. Você pode voltar à explicação sempre que precisar.
      </p>`;
    }
    function teachingMarkup(config) {
        const teaching = config.teaching, result = runner.run(teaching.code);
        const output = result.ok ? result.lines.map(entry => entry.values.map(format).join(', ')).join('\n') : result.error;
        return `${sectionStart('learn', '01', 'Entenda antes de tentar', 'APRENDER')}
      <div data-s02-teaching>
      
      <h3>Palavras que você vai usar
      </h3><dl
        class="s02-vocabulary">${(teaching.vocabulary || []).map(([term, meaning]) => `
      <div><dt>${inlineText(term)}</dt><dd>${inlineText(meaning)}</dd></div>`).join('')}</dl>
      
      <h3>Como a regra funciona
      </h3>
      <p>${inlineText(teaching.model)}
      </p>
      
      <h3>Veja um exemplo resolvido
      </h3>
      <p
        class="s02-muted">As entradas são diferentes das usadas na sua prática. A regra é a mesma.
      </p>
      
      <div
        class="s02-example-grid">
      <div
        class="s02-code-box">
      <div
        class="s02-code-caption">CÓDIGO · JAVASCRIPT
      </div><pre><code data-s02-example-code>${html(teaching.code)}</code></pre>
      </div>
      <div
        class="s02-code-box">
      <div
        class="s02-code-caption">SAÍDA · CONSOLE
      </div><pre
        class="s02-example-result">${html(output)}</pre>
      <p>console.log mostra os valores calculados pelo código.
      </p>
      </div>
      </div>
      
      <h3>Acompanhe o raciocínio
      </h3><ol
        class="s02-walkthrough">${teaching.steps.map(step => `
      <li>${inlineText(step)}</li>`).join('')}</ol>
      <aside
        class="s02-hint"><strong>Evite esta confusão</strong>
      <p>${inlineText(teaching.trap)}
      </p>
      </aside><button
        class="button-secondary"
        type="button"
        data-s02-action="example">Executar o exemplo novamente</button>
      <p data-s02-example-output
        role="status"
        aria-live="polite">
      </p>
      </div>
      </section>`;
    }
    function inputs(fixtures) { return Object.entries(fixtures).map(([name, value]) => `${name} = ${format(value)}`).join('; ') || 'Expressões do bloco'; }
    function resultsMarkup(result, config, block) {
        if (!result)
            return '<p>Execute seu código para ver cada caso, os valores e os tipos.</p>';
        let predictions = [];
        try {
            const parsed = JSON.parse(block.prediction);
            if (Array.isArray(parsed))
                predictions = parsed;
        }
        catch { }
        const classification = config.classifications && predictions.length ? `
      <details><summary>Comparar classificação falsy e nullish</summary>
      <ul>${config.cases.map((entry, i) => {
            const value = entry.fixtures.x, prediction = predictions[i * 2] || {};
            const falsy = !value ? 'sim' : 'não', nullish = value === null || value === undefined ? 'sim' : 'não', matches = prediction.falsy === falsy && prediction.nullish === nullish;
            return `
      <li><strong>${matches ? '✓ Classificação conferida' : 'Divergência na classificação — releia a regra'}</strong> · <code>${html(format(value))}</code>: previu falsy=${html(prediction.falsy || 'sem registro')}, nullish=${html(prediction.nullish || 'sem registro')}; regra: falsy=${falsy}, nullish=${nullish}.</li>`;
        }).join('')}</ul></details>` : '';
        return `
      <p
        role="status"
        aria-live="polite"
        class="s02-result-message ${result.ok ? 's02-success' : 's02-error'}">${html(result.message)}
      </p>
      <div
        class="s02-table-wrap" tabindex="0"
        role="region"
        aria-label="Tabela de resultados, com rolagem horizontal">
      <table
        class="s02-table"><caption>Casos públicos: entrada, esperado e obtido</caption>
      <thead>
      <tr><th scope="col">Caso / entrada</th><th scope="col">Esperado</th><th scope="col">Obtido</th><th scope="col">Resultado</th>
      </tr>
      </thead>
      <tbody>${result.results.map(row => `
      <tr><th scope="row">${html(row.label)}<small>${html(inputs(row.fixtures))}</small></th><td><code>${html(row.expected.map(format).join(', '))}</code></td><td><code>${html(row.error || row.actual.map(value => `${format(value)} (${typeof value})`).join(', '))}</code></td><td>${row.passed ? '✓ passou' : 'Ajustar'}</td></tr>`).join('')}</tbody></table></div>${classification}${config.rows && predictions.length && result.results[0]?.actual.length ? `
      <details><summary>Comparar com sua previsão registrada</summary><ol>${config.rows.map((row, index) => `
      <li><code>${html(row)}</code>: previu <code>${html(predictions[index] && typeof predictions[index] === 'object' ? `${predictions[index].value} (${predictions[index].type})` : predictions[index])}</code>; obteve <code>${html(`${format(result.results.flatMap(row => row.actual)[index])} (${typeof result.results.flatMap(row => row.actual)[index]})`)}</code>.</li>`).join('')}</ol></details>` : ''}`;
    }
    function render(item, ctx) {
        const state = getState(item, ctx.progress), index = state.index, block = state.blocks[index], configs = lessons.lessons[item.id], config = configs[index];
        const firstMissing = state.blocks.findIndex((_, i) => !passed(state, i));
        const maxOpen = firstMissing < 0 ? state.blocks.length - 1 : firstMissing;
        const question = questionFor(item, index), canRun = block.predictionSaved && block.understood;
        const allPassed = state.blocks.every((_, i) => passed(state, i));
        const key = `${item.id}:${index}`;
        const result = latest.get(key) || (passed(state, index) ? lessons.check(item.id, index, block.code) : null);
        const unitB = Number(item.id.slice(3)) >= 10;
        const bridgeTitle = unitB ? 'Ponte 02B' : 'Ponte 02A';
        const bridge = (item.resources || []).find(resource => resource.replace(/^#{1,4}\s*/, '').startsWith(`${bridgeTitle} —`));
        const hints = lessons.hints[item.id]?.[index] || [];
        return `
      <article
        class="course-lesson s02-lesson">
      <a
        class="lesson-back"
        href="#/catalog">← Todas as etapas</a>
      
      <header
        class="course-lesson-hero">
      <div
        class="s02-hero-top">
      <div
        class="eyebrow">JAVASCRIPT / ETAPA 02
      </div><span
        class="s02-lesson-index">${html(item.id)}</span>
      </div>
      <h1>${html(item.title)}
      </h1>
      <p>${inlineText(config.teaching.goal || config.title)}
      </p>
      <div
        class="course-lesson-meta"><span>${html(item.duration)}</span><span>${state.blocks.filter((_, i) => passed(state, i)).length}/${configs.length} partes conferidas</span><span>${complete(item, ctx.progress) ? '✓ concluído' : 'Em andamento'}</span></div></header>
      ${journeyMarkup()}
      ${bridge ? `
      <details
        class="s02-bridge"><summary>Preparação: ${unitB ? 'Number e Math' : 'expressões e operadores'}</summary>
      <div
        class="s02-bridge-content">${bridgeMarkup(bridge)}</div></details>` : ''}
      
      <p
        class="s02-prerequisites">${unitB ? 'Retomada: 02.01 ensina expressões; 02.04 ensina finitude. Em 02.12, retome também 02.10 (Math.abs) e 02.11 (precisão).' : 'Pré-requisito: Etapa 01 — const/let, valores, tipos e console.log. Siga 02.01 → 02.09 para construir as regras gradualmente.'}
      </p>
      
      <nav
        class="s02-block-nav"
        aria-label="Blocos do exercício">${configs.map((entry, i) => `<button
        type="button"
        data-s02-action="block"
        data-s02-index="${i}" ${i > maxOpen ? 'disabled' : ''} aria-current="${i === index ? 'step' : 'false'}">${passed(state, i) ? '✓ ' : ''}${html(entry.title)}${i > maxOpen ? ' · bloqueado' : ''}</button>`).join('')}
      </nav>
      
      <h2
        id="s02-block-heading" tabindex="-1">${html(config.title)}</h2>
      ${teachingMarkup(config)}
      ${config.debug ? `
      <section
        class="course-prompt-panel">
      <h3>Observe o erro original
      </h3><pre><code>${html(config.starter)}</code></pre>
      <p>A regra quer preservar zero. Compare a saída original com essa intenção antes de corrigir.
      </p><button
        class="button-secondary"
        type="button"
        data-s02-action="reproduce">Executar código original</button>
      <p data-s02-original-output
        role="status"
        aria-live="polite">
      </p>
      </section>` : ''}
      ${sectionStart('challenge', '02', 'Seu desafio, passo a passo', 'DESAFIO')}
      <p>${inlineText(config.teaching.goal || config.title)}
      </p><ol>${(config.teaching.taskSteps || []).map(step => `
      <li>${inlineText(step)}</li>`).join('')}</ol>
      <details><summary>Consultar o enunciado completo</summary>
      <p>${inlineText(item.prompt)}
      </p>
      </details>
      <h3>${config.cases.some(entry => Object.keys(entry.fixtures).length) ? 'Entradas que sua regra precisa atender' : 'Expressões que você vai conferir'}
      </h3>
      <p>${config.cases.some(entry => Object.keys(entry.fixtures).length) ? 'As entradas abaixo estão declaradas no código. Cada caso troca seus valores iniciais. A mesma regra deve funcionar em todos eles.' : 'Confira as expressões na tabela de previsão a seguir. Registre o valor e o tipo de cada resultado, respeitando a ordem indicada.'}
      </p>
      <ul
        class="s02-fixtures">${config.cases.map(entry => `
      <li><strong>${html(entry.label)}</strong><code>${html(inputs(entry.fixtures))}</code></li>`).join('')}</ul></section>${sectionStart('predict', '03', 'O que você acha que vai acontecer?', 'PREVER')}
      <p>Use o exemplo para antecipar os resultados. Sua previsão não precisa estar certa: ela será preservada para você comparar depois.
      </p>${predictionFields(config, block)}${!block.predictionSaved ? '<button class="button-primary" type="button" data-s02-action="predict">Registrar previsão</button>' : '<p class="s02-success">✓ Previsão registrada e preservada para comparação.</p>'}
      ${block.predictionSaved ? `
      <div
        class="s02-concept-check">
      <h3>Confira o conceito antes da prática
      </h3>
      <fieldset
        class="s02-understanding" tabindex="-1"><legend>${inlineText(question.prompt)}</legend>${question.choices.map((choice, i) => `
      <label><input
        type="radio" name="s02-understanding" value="${i}" ${block.understood && i === question.answer ? 'checked' : ''} ${block.understood ? 'disabled' : ''}/><span>${inlineText(choice)}</span></label>`).join('')}</fieldset>${block.understood ? '<p class="s02-success">✓ Conceito conferido. Agora escreva e execute.</p>' : '<button type="button" class="button-secondary" data-s02-action="understand">Conferir entendimento</button>'}
      <p data-s02-understanding-feedback
        role="status"
        aria-live="polite">
      </p>
      </div>` : ''}</section>
      ${sectionStart('practice', '04', 'Agora é sua vez', 'PRATICAR')}
      ${canRun ? `
      <div>
      <p>Complete o código com a regra que você aprendeu. Clique em Executar para conferir a mesma solução em todas as entradas.
      </p>
      <details
        class="s02-environment"><summary>Como usar este editor</summary>
      <p>Use const/let, expressões e console.log, além das operações ensinadas nesta aula. Escreva decimais com ponto: 0.25. Para unir textos, use aspas e +. Este editor trabalha apenas com essas expressões; funções próprias, loops, objetos e DOM serão estudados depois.
      </p>
      </details>
      ${config.requiredVariables.length ? `
      <p>Declare os nomes pedidos: <code>${html(config.requiredVariables.join(', '))}</code>. Compare todas as entradas; as saídas esperadas estão na tabela após executar.</p>` : ''}
      ${config.parsons ? `
      <fieldset
        class="s02-parsons"><legend>Ordene A/B/C/D e retire o distrator. A e B podem trocar de posição.</legend><ol>${block.parsons.map((letter, i) => `
      <li tabindex="-1"
        data-s02-letter="${letter}"><code>${html(letter + ': ' + parsons[letter])}</code>
      <div><button
        type="button"
        data-s02-action="up"
        data-s02-position="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Mover bloco ${letter} para cima">↑</button><button
        type="button"
        data-s02-action="down"
        data-s02-position="${i}" ${i === block.parsons.length - 1 ? 'disabled' : ''} aria-label="Mover bloco ${letter} para baixo">↓</button><button
        type="button"
        data-s02-action="remove"
        data-s02-position="${i}" aria-label="Retirar bloco ${letter}">Retirar</button></div></li>`).join('')}</ol><button
        type="button"
        class="button-secondary"
        data-s02-action="restore">Restaurar blocos</button><button
        type="button"
        class="button-secondary"
        data-s02-action="assemble">Levar montagem ao editor</button>
      <p data-s02-parsons-feedback
        role="status"
        aria-live="polite">
      </p>
      </fieldset>` : ''}
      ${config.faded ? fadedFields(config, block) : ''}
      
      <label
        class="course-editor-label" for="s02-code"><span>main.js · bloco ${index + 1}${config.faded || config.parsons ? ' · prévia do código gerado' : ''}</span><textarea
        id="s02-code" data-s02-code
        maxlength="12000"
        spellcheck="false"
        autocapitalize="off" autocorrect="off" ${config.faded || config.parsons ? 'readonly aria-readonly="true"' : ''}>${html(block.code)}</textarea>
      </label>
      
      <div
        class="s02-run-actions"><button
        class="button-primary"
        type="button"
        data-s02-action="run">Executar e conferir todos os casos</button>${config.random ? '<button class="button-secondary" type="button" data-s02-action="random">Fazer um sorteio real</button>' : ''}<button
        class="button-secondary"
        type="button"
        data-s02-action="reset">Restaurar código inicial</button><button
        class="button-secondary"
        type="button"
        data-s02-action="hint" ${block.hintLevel >= hints.length ? 'disabled' : ''}>${block.hintLevel >= hints.length ? 'Dicas abertas' : `Abrir dica ${block.hintLevel + 1}/${hints.length}`}</button></div>
      ${hints.slice(0, block.hintLevel).map((hint, i) => `
      <p
        class="s02-hint"
        data-s02-hint="${i}" tabindex="-1"><strong>Dica ${i + 1}</strong> ${inlineText(hint)}</p>`).join('')}
      
      <p
        class="s02-scroll-note">Na tabela de resultados, role horizontalmente para comparar esperado e obtido.
      </p>
      <div
        class="s02-results" data-s02-results tabindex="-1"
        role="region"
        aria-label="Resultados dos casos">${resultsMarkup(result, config, block)}
      </div>
      <p data-s02-single-output
        role="status"
        aria-live="polite">
      </p>${passed(state, index) && index < configs.length - 1 ? '<button type="button" class="button-primary" data-s02-action="next">Avançar para o próximo bloco →</button>' : ''}</div>` : '<p class="course-gate-note">Depois do exemplo, registre a previsão e confira o conceito para liberar a prática.</p>'}</section>
      ${sectionStart('explain', '05', 'Conte o que você aprendeu', 'EXPLICAR')}
      <p>Compare sua previsão com o resultado. Explique por que a regra funciona também em uma entrada que costuma causar confusão.
      </p>
      <ul
        class="s02-checklist">
      <li>Registrei minha previsão e conferi o conceito.
      </li>
      <li>Meu código atual passou em todos os casos e partes.
      </li>
      <li>Consigo explicar a regra com um exemplo.
      </li>
      </ul>
      <label
        class="course-reflection-label" for="s02-reflection"><span>Qual regra você aplicou? Use um exemplo e um caso que costuma causar confusão para explicar o resultado. O que mudou em relação à previsão?</span><textarea
        id="s02-reflection" data-s02-reflection
        maxlength="600">${html(state.reflection)}</textarea>
      </label>
      <div
        class="course-complete-row"><span data-s02-completion-status>${allPassed ? 'Todos os blocos passaram.' : 'Confira todos os blocos para liberar a conclusão.'}</span><button
        type="button"
        class="button-primary"
        data-s02-action="complete" ${!allPassed || state.reflection.trim().length < 16 || state.complete ? 'disabled' : ''}>${state.complete ? 'Atividade concluída ✓' : 'Concluir exercício e agendar revisão'}</button></div>${state.complete ? '<p class="s02-success" role="status">Revisão vinculada a este exercício, agendada para daqui a 7 dias.</p>' : ''}</section>
      ${officialDocs(item.resources)}
      
      <footer
        class="course-lesson-footer"><a
        class="button-secondary"
        href="#/catalog">Voltar ao catálogo</a>${item.id !== '02.12' ? `<a
        class="button-secondary"
        href="#/javascript/02.${String(Number(item.id.slice(3)) + 1).padStart(2, '0')}">Próximo exercício →</a>` : '<p>Próxima etapa: usar condições booleanas para decidir caminhos e repetições. Retome 02.03 se ainda confundir && e ||.</p>'}</footer></article>`;
    }
    function capture(item, ctx) {
        const state = getState(item, ctx.progress), block = state.blocks[state.index];
        const config = lessons.lessons[item.id][state.index];
        const code = view().querySelector('[data-s02-code]');
        if (code && !config.faded && !config.parsons && code.value !== block.code) {
            block.code = code.value;
            block.passedCode = null;
            state.complete = false;
            latest.delete(`${item.id}:${state.index}`);
        }
        if (config.faded) {
            const gaps = [...view().querySelectorAll('[data-s02-gap]')];
            if (gaps.length) {
                let source = config.starter;
                for (const gap of gaps)
                    source = source.replace('/* complete */', () => gap.value || '/* complete */');
                if (source !== block.code) {
                    block.code = source;
                    block.passedCode = null;
                    state.complete = false;
                    latest.delete(`${item.id}:${state.index}`);
                    if (code)
                        code.value = source;
                }
            }
        }
        if (!block.predictionSaved) {
            const rows = [...view().querySelectorAll('[data-s02-row]')];
            block.prediction = rows.length ? JSON.stringify(rows.map((row, i) => ({
                value: row.value.trim(), type: view().querySelector(`[data-s02-type="${i}"]`)?.value || '', ...(config.classifications && i % 2 === 0 ? { falsy: view().querySelector(`[data-s02-falsy="${i}"]`)?.value || '', nullish: view().querySelector(`[data-s02-nullish="${i}"]`)?.value || '' } : {})
            }))) : view().querySelector('[data-s02-prediction]')?.value ?? block.prediction;
        }
        const reflection = view().querySelector('[data-s02-reflection]');
        if (reflection)
            state.reflection = reflection.value;
        return { state, block };
    }
    function handleClick(event, item, ctx) {
        const button = event.target.closest('[data-s02-action]');
        if (!button)
            return false;
        if (button.dataset.s02Action === 'navigate') {
            const target = view().querySelector(`#s02-${button.dataset.s02Target}`);
            if (target) {
                view().querySelectorAll('[data-s02-action="navigate"]').forEach(entry => entry.removeAttribute('aria-current'));
                button.setAttribute('aria-current', 'step');
                target.focus({ preventScroll: true });
                target.scrollIntoView?.({ behavior: global.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
            }
            return true;
        }
        const { state, block } = capture(item, ctx), index = state.index, config = lessons.lessons[item.id][index], action = button.dataset.s02Action;
        const refresh = (focus = '#s02-block-heading') => {
            ctx.saveProgress();
            ctx.render();
            const destination = document.querySelector(focus);
            destination?.focus();
            const section = destination?.closest('.s02-section'), target = section?.id.replace('s02-', '');
            if (target)
                view().querySelectorAll('[data-s02-action="navigate"]').forEach(entry => {
                    if (entry.dataset.s02Target === target)
                        entry.setAttribute('aria-current', 'step');
                    else
                        entry.removeAttribute('aria-current');
                });
        };
        if (action === 'example') {
            const result = runner.run(config.teaching.code);
            view().querySelector('[data-s02-example-output]').textContent = result.ok ? `${result.lines.map(entry => entry.values.map(value => `${format(value)} (${typeof value})`).join(', ')).join('\n')}\nAPIs chamadas: ${result.calls.join(', ') || 'nenhuma'}.` : result.error;
        }
        else if (action === 'predict') {
            const valid = validPrediction(config, block.prediction);
            if (!valid) {
                ctx.toast('Preencha valores, tipos e classificações antes de continuar.');
                return true;
            }
            block.predictionSaved = true;
            refresh('.s02-understanding');
        }
        else if (action === 'understand') {
            const answer = view().querySelector('input[name="s02-understanding"]:checked'), question = questionFor(item, index);
            if (!answer || Number(answer.value) !== question.answer) {
                view().querySelector('[data-s02-understanding-feedback]').textContent = answer ? 'Releia o exemplo e confira a regra usada. Tente novamente.' : 'Escolha uma resposta antes de conferir.';
                return true;
            }
            block.understood = true;
            refresh(config.faded ? '#s02-gap-numero' : '#s02-code');
        }
        else if (action === 'run') {
            if (!block.predictionSaved || !block.understood)
                return true;
            if (config.parsons && !(block.parsons.length === 4 && [
                'A', 'B', 'C', 'D'
            ].every(letter => block.parsons.includes(letter)) && block.parsons.indexOf('C') === 2 && block.parsons.indexOf('D') === 3 && block.code === parsonsSource(block.parsons))) {
                view().querySelector('[data-s02-parsons-feedback]').textContent = 'Use A e B antes de C, depois D; retire o distrator e leve a montagem ao editor antes de executar.';
                return true;
            }
            const result = lessons.check(item.id, index, block.code);
            latest.set(`${item.id}:${index}`, result);
            block.passedCode = result.ok ? block.code : null;
            state.complete = false;
            refresh('[data-s02-results]');
        }
        else if (action === 'random' || action === 'reproduce') {
            const result = runner.run(action === 'reproduce' ? config.starter : block.code);
            view().querySelector(action === 'reproduce' ? '[data-s02-original-output]' : '[data-s02-single-output]').textContent = result.ok ? result.lines.map(entry => `Linha ${entry.line}: ${entry.values.map(format).join(', ')}`).join('\n') : result.error;
        }
        else if (action === 'next' || action === 'block') {
            const destination = action === 'next' ? index + 1 : Number(button.dataset.s02Index);
            if (destination >= 0 && destination < state.blocks.length && state.blocks.slice(0, destination).every((_, i) => passed(state, i))) {
                state.index = destination;
                refresh();
            }
        }
        else if (action === 'hint') {
            block.hintLevel = Math.min(lessons.hints[item.id]?.[index]?.length || 0, block.hintLevel + 1);
            refresh(`[data-s02-hint="${block.hintLevel - 1}"]`);
        }
        else if (action === 'reset') {
            block.code = config.starter;
            block.passedCode = null;
            state.complete = false;
            latest.delete(`${item.id}:${index}`);
            refresh();
        }
        else if ([
            'up', 'down', 'remove', 'restore', 'assemble'
        ].includes(action)) {
            block.passedCode = null;
            state.complete = false;
            latest.delete(`${item.id}:${index}`);
            const position = Number(button.dataset.s02Position), letter = block.parsons[position];
            if (action === 'restore')
                block.parsons = [
                    'C', 'D', 'A', 'E', 'B'
                ];
            if (action === 'remove')
                block.parsons.splice(position, 1);
            if (action === 'up' && position > 0)
                [block.parsons[position - 1], block.parsons[position]] = [block.parsons[position], block.parsons[position - 1]];
            if (action === 'down' && position < block.parsons.length - 1)
                [block.parsons[position + 1], block.parsons[position]] = [block.parsons[position], block.parsons[position + 1]];
            if (action === 'assemble') {
                block.code = parsonsSource(block.parsons);
                block.passedCode = null;
                state.complete = false;
            }
            refresh(action === 'assemble' ? '#s02-code' : `[data-s02-letter="${block.parsons.includes(letter) ? letter : block.parsons[0]}"]`);
        }
        else if (action === 'complete') {
            if (state.reflection.trim().length < 16 || !state.blocks.every((entry, i) => passed(state, i) && lessons.check(item.id, i, entry.code).ok)) {
                ctx.toast('Confira todos os blocos e escreva sua explicação antes de concluir.');
                return true;
            }
            void ctx.learning?.submitStudy?.(item, state.reflection);
            void ctx.learning?.runAssessment?.(item, { kind: 'passed', source: 'local-declared' });
            state.complete = true;
            ctx.progress.exerciseReflections ||= {};
            ctx.progress.exerciseReflections[item.id] = state.reflection;
            ctx.progress.answers ||= {};
            ctx.progress.answers[item.id] = true;
            ctx.progress.completed ||= [];
            if (!ctx.progress.completed.includes(item.id))
                ctx.progress.completed.push(item.id);
            ctx.progress.reviewSchedule ||= {};
            ctx.progress.reviewSchedule[item.id] = { intervalIndex: 0, dueAt: Date.now() + 7 * 86400000 };
            refresh();
        }
        return true;
    }
    function handleInput(event, item, ctx) {
        if (!event.target.matches('[data-s02-code],[data-s02-gap],[data-s02-type],[data-s02-falsy],[data-s02-nullish],[data-s02-reflection],[data-s02-prediction],[data-s02-row]'))
            return false;
        const { state } = capture(item, ctx);
        const button = view().querySelector('[data-s02-action="complete"]');
        if (button) {
            button.disabled = !state.blocks.every((_, i) => passed(state, i)) || state.reflection.trim().length < 16 || state.complete;
            button.textContent = state.complete ? 'Atividade concluída ✓' : 'Concluir exercício e agendar revisão';
        }
        const next = view().querySelector('[data-s02-action="next"]');
        if (next)
            next.disabled = !passed(state, state.index);
        const firstMissing = state.blocks.findIndex((_, i) => !passed(state, i));
        view().querySelectorAll('[data-s02-action="block"]').forEach(button => { button.disabled = firstMissing >= 0 && Number(button.dataset.s02Index) > firstMissing; });
        if (event.target.matches('[data-s02-code],[data-s02-gap]')) {
            const results = view().querySelector('[data-s02-results]');
            if (results) {
                const status = results.querySelector('.s02-result-message');
                if (status)
                    status.textContent = 'Resultado anterior: código alterado. Execute novamente para conferir esta versão.';
                else
                    results.textContent = 'Código alterado: execute novamente para conferir os casos desta versão.';
            }
        }
        const label = view().querySelector('[data-s02-completion-status]');
        if (label)
            label.textContent = state.blocks.every((_, i) => passed(state, i)) ? 'Todos os blocos passaram.' : 'Confira todos os blocos para liberar a conclusão.';
        ctx.scheduleSave();
        return true;
    }
    global.DevPathStage02UI = {
        render, handleClick, handleInput, complete, getState
    };
})(globalThis);
