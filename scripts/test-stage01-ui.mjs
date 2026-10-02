import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const root = new URL('../public/', import.meta.url);
const dom = new JSDOM('<main id="view"></main>', { runScripts: 'outside-only', url: 'http://localhost' });
dom.window.HTMLElement.prototype.scrollIntoView = function () {};
dom.window.DevPathStage01Preparation = (await import('../course-src/stage01-preparation.mjs')).stage01Preparation;
for (const file of ['js-stage01-runner.js', 'js-stage01-checks.js', 'js-stage01-ui.js']) {
  try { dom.window.eval(readFileSync(new URL(file, root), 'utf8')); } catch (error) {
    if (file !== 'js-stage01-preparation.js') throw error;
  }
}
const ui = dom.window.DevPathStage01UI;
assert.ok(ui, 'stage 01 exposes a UI API');
const item = {
  id: '01.01', title: 'Declarações', mode: 'predict', readonly: true,
  starterFiles: [{ name: 'main.js', content: 'const nome = "Ada";\nconsole.log(nome);' }],
  explanation: 'const cria uma ligação.', vocabulary: ['const'],
  workedExample: { code: 'const n = 2;\nconsole.log(n);', output: ['2'], steps: ['declarar', 'mostrar'] },
  docs: [{ title: 'MDN', url: 'https://developer.mozilla.org/', section: 'const', question: 'O que é const?' }],
  predictionRows: [{ label: 'saída' }], hints: ['h1', 'h2', 'h3'], transfer: 'Altere o nome.',
  examples: { output: ['Ada'] }
};
const progress = {};
const ctx = { progress, saveProgress() {}, render() {}, toast() {}, activities: [item] };
const html = ui.render(item, ctx);
assert.match(html, /Learn|Aprender/);
assert.match(html, /Challenge|Desafio/);
assert.match(html, /Predict|Prever/);
assert.match(html, /Practice|Praticar/);
assert.match(html, /Explain|Explicar/);
assert.match(html, /typeof/);
assert.match(html, />string</);
assert.match(html, /data-stage01-prediction/);
assert.match(html, /aria-live="polite"/);
dom.window.document.querySelector('#view').innerHTML = html;
const input = dom.window.document.querySelector('[data-stage01-prediction]');
input.value = 'nome';
ui.handleInput({ target: input }, item, ctx);
assert.equal(progress.stage01[item.id].predictions[0], 'nome');
assert.equal(progress.stage01[item.id].predictionSaved, false);
const code = dom.window.document.querySelector('[data-stage01-editor]');
assert.equal(code.readOnly, true, 'readonly lessons cannot edit the editor');
console.log('Stage 01 UI red contract passed.');

const real = { id: '01.09', title: 'Ficha de estados', starterFiles: [{ content: 'const nome = "Iris";\nconst nivel = 3;\nlet vida = 10;\nconst status = "ativa";\nconsole.log(`${nome} | nível ${nivel} | vida ${vida} | ${status}`);\nvida = 6;\nconsole.log(`${nome} | nível ${nivel} | vida ${vida} | ${status}`);\nvida = 0;\nconsole.log(`${nome} | nível ${nivel} | vida ${vida} | ${status}`);' }] };
const realProgress = {};
const realCtx = { progress: realProgress, saveProgress() {}, render() {}, toast() {} };
dom.window.document.querySelector('#view').innerHTML = ui.render(real, realCtx);
const realView = dom.window.document.querySelector('#view');
assert.equal(realView.querySelectorAll('[data-stage01-prediction]').length, 3);
const realEditor = realView.querySelector('[data-stage01-editor]');
assert.match(realEditor.value, /vida = 0/);
ui.handleClick({ target: realView.querySelector('[data-stage01-action="run"]'), preventDefault() {} }, real, realCtx);
assert.equal(realProgress.stage01[real.id].passedCode, null, 'running before predictions cannot approve code');
for (const field of realView.querySelectorAll('[data-stage01-prediction]')) { field.value = 'previsão registrada'; ui.handleInput({ target: field }, real, realCtx); }
ui.handleClick({ target: realView.querySelector('[data-stage01-action="save-predictions"]'), preventDefault() {} }, real, realCtx);
assert.equal(realProgress.stage01[real.id].predictionSaved, true);
assert.equal(ui.complete(real, realProgress), false, 'completion remains false until reflection and mastery transfers');
const before = JSON.stringify(realProgress.stage01[real.id]);
ui.complete(real, realProgress);
assert.equal(JSON.stringify(realProgress.stage01[real.id]), before, 'complete is a pure read check');
console.log('Stage 01 UI real preparation and completion gates passed.');
