import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const root = new URL('../', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('public/course-catalog.json', root), 'utf8'));
const item = id => {
  const lesson = catalog.find(entry => entry.id === id);
  assert.ok(lesson, `missing published activity ${id}`);
  return lesson;
};
const read = path => readFileSync(new URL(path, root), 'utf8');
const solution = path => import(new URL(path, root));
const lessonText = lesson => JSON.stringify({
  prompt: lesson.prompt,
  examples: lesson.examples,
  edgeCases: lesson.edgeCases,
  resources: lesson.resources,
  hints: lesson.hints,
});

test('12.21 returns undefined for an obsolete abort and propagates the current search error', async () => {
  const {adiarResposta, criarBuscaAtual} = await solution('course-src/solutions/12.21/main.js');
  const pending = [];
  const fetchHonoringSignal = (url, {signal}) => {
    const deferred = adiarResposta();
    pending.push(deferred);
    signal.addEventListener('abort', () => deferred.reject(signal.reason), {once: true});
    return deferred.promise.then(text => ({text: async () => text}));
  };
  const search = criarBuscaAtual(fetchHonoringSignal);
  const obsolete = search('/old');
  const current = search('/new');
  pending[1].resolve('new');
  assert.equal(await current, 'new');
  assert.equal(await obsolete, undefined);

  const activeError = new Error('network failed');
  const fail = criarBuscaAtual(() => Promise.reject(activeError));
  await assert.rejects(fail('/current'), error => error === activeError);
});

test('13.14 publishes V3 tag normalization and its specific warning for one unchanged task', async () => {
  const lesson = item('13.14');
  const text = lessonText(lesson);
  assert.match(text, /V3/i);
  assert.match(text, /tags?\s*:?\s*\[?['"]?['"]?\]?|tags inválidas/i);
  const {carregar} = await solution('course-src/solutions/13.14/migration.js');
  const warnings = [];
  const storage = {getItem: () => JSON.stringify({version: 3, tasks: [{id: 'one', text: 'A', status: 'todo', tags: ['']}]})};
  const result = carregar(storage, warnings);
  assert.equal(result.tasks.length, 1, 'normalizing tags must not depend on dropping a task');
  assert.deepEqual(result.tasks[0].tags, []);
  assert.ok(warnings.some(warning => /tags inválidas/i.test(warning)), 'warn specifically about invalid tags');
});

test('12.08 documents the public profile and stats schema enforced by the reference', async () => {
  const lesson = item('12.08');
  const text = lessonText(lesson);
  assert.match(text, /profile/i);
  assert.match(text, /nome\s*:\s*string|nome[^.\n]{0,70}string/i);
  assert.match(text, /stats/i);
  assert.match(text, /total\s*:\s*number|total[^.\n]{0,70}(?:number|finito|finita)/i);

  const {criarDashboard} = await solution('course-src/solutions/12.08/dashboard.js');
  const response = data => ({ok: true, async json() { return data; }});
  const fetcher = (profile, stats) => async path => response(path === '/profile' ? profile : stats);
  assert.equal((await criarDashboard(fetcher({nome: 'Ana'}, {total: 2}))).status, 'success');
  for (const [profile, stats] of [[{}, {total: 2}], [{nome: 2}, {total: 2}], [{nome: 'Ana'}, {total: Infinity}]]) {
    const result = await criarDashboard(fetcher(profile, stats));
    assert.equal(result.status, 'error');
    assert.equal(result.error.name, 'TypeError');
  }
});

test('11.02, 12.02, 13.02 and 14.02 use DEBUG prompts/examples/edge cases for the starter defects', () => {
  const expectedKind = new Map([['11.02', 'DEBUG'], ['12.02', 'DEBUG'], ['13.02', 'DEBUG'], ['14.02', 'DEBUG']]);
  for (const [id, kind] of expectedKind) assert.equal(item(id).kind, kind, `${id} should describe a repair task`);

  const text11 = lessonText(item('11.02'));
  assert.match(text11, /texto literal|textContent|createTextNode/i);
  assert.match(text11, /apenas o (?:próprio|item acionado)|item.*acionado/i);
  assert.match(text11, /<b|<img/i);
  assert.match(text11, /dois itens iguais|itens iguais/i);

  const text12 = lessonText(item('12.02'));
  assert.match(text12, /máximo|max(?:=|\s+)2|duas chamadas/i);
  assert.match(text12, /última falha|entre tentativas|nenhuma espera/i);
  assert.match(text12, /erro original/i);

  const text13 = lessonText(item('13.02'));
  assert.match(text13, /TypeError/i);
  assert.match(text13, /RangeError/i);
  assert.match(text13, /NaN/i);
  assert.match(text13, /Infinity/i);

  const text14 = lessonText(item('14.02'));
  assert.match(text14, /comando (?:ausente|desconhecido)|comando inválido/i);
  assert.match(text14, /Uso:/i);
  assert.match(text14, /status 2|retorna 2|devolve 2/i);
});

test('the four DEBUG references repair the defects demonstrated by their starters', async () => {
  const starter11 = read('course-src/starters/11.02/main.js');
  const solution11 = read('course-src/solutions/11.02/main.js');
  assert.match(starter11, /innerHTML/);
  assert.match(starter11, /lista\.remove\(\)/);
  assert.match(solution11, /createTextNode/);
  assert.match(solution11, /item\.remove\(\)/);

  const {tentar} = await solution('course-src/solutions/12.02/main.js');
  let calls = 0;
  let waits = 0;
  const expectedError = new Error('failed');
  await assert.rejects(tentar(async () => { calls++; throw expectedError; }, 2, async () => { waits++; }, 0), error => error === expectedError);
  assert.equal(calls, 2);
  assert.equal(waits, 1);

  const {dividir} = await solution('course-src/solutions/13.02/main.js');
  assert.equal(dividir(6, 2), 3);
  assert.throws(() => dividir(Number.NaN, 2), TypeError);
  assert.throws(() => dividir(6, 0), RangeError);

  const {main} = await solution('course-src/solutions/14.02/main.js');
  const output = [];
  assert.equal(main(['node', 'script', 'desconhecido'], {write: value => output.push(value)}), 2);
  assert.match(output.join(''), /Uso:/);
  output.length = 0;
  assert.equal(main(['node', 'script', 'somar', '2', '3'], {write: value => output.push(value)}), 0);
  assert.equal(output.join(''), '5\n');
});

test('15.02 remains a real Parsons activity with usable labeled blocks and a distractor', () => {
  const lesson = item('15.02');
  assert.equal(lesson.kind, 'PARSONS');
  const starter = lesson.starterFiles.find(file => /config\.ts$/.test(file.path))?.content || '';
  const blocks = [...starter.matchAll(/^\[([A-Z])\]\s+(.+)$/gm)];
  assert.ok(blocks.length >= 6, 'published starter should expose the ordered code blocks');
  assert.ok(blocks.some(([, , content]) => /as Config/.test(content)), 'keep the type-assertion distractor');
  assert.match(starter, /parseConfig\(\{\s*port:\s*["']8080["']/);
});

test('11.04 publishes quantity in the result values and tests its invalid value', () => {
  const lesson = item('11.04');
  assert.match(lessonText(lesson), /valores/i);
  assert.match(lessonText(lesson), /quantidade/i);
  assert.match(read('course-src/tests/11.04.test.js'), /valores\.quantidade/);
});

test('12.06 publishes null for obsolete or aborted searches', () => {
  const lesson = item('12.06');
  const text = lessonText(lesson);
  assert.match(text, /null/);
  assert.match(text, /obsolet|abort|cancel/i);
  assert.match(read('course-src/tests/12.06.test.js'), /toBe\(null\)/);
});

test('11.10 describes the state/view/main module boundary without promising Kanban controls', () => {
  const lesson = item('11.10');
  const text = lessonText(lesson);
  for (const name of ['state.js', 'view.js', 'main.js']) assert.match(text, new RegExp(name.replace('.', '\\.')));
  assert.doesNotMatch(text, /adicionar\s*\/\s*mover\s*\/\s*reload/i);
  assert.doesNotMatch(text, /bot(?:ão|ões)|formulário/i);
});

test('11.01 and 11.11 examples match the published target and element types', () => {
  const lesson11 = item('11.01');
  const example11 = JSON.stringify(lesson11.examples);
  assert.match(example11, /alvo.{0,30}filho.{0,30}pai/i);
  const html11 = lesson11.starterFiles.find(file => /\.html$/i.test(file.path))?.content || '';
  assert.ok(html11, '11.01 should publish its HTML fixture');
  assert.doesNotMatch(html11, /href\s*=\s*["']#["']/i);
  const example11b = JSON.stringify(item('11.11').examples);
  assert.match(example11b, /\bdiv\b|<div\b/i);
  assert.match(example11b, /\bbutton\b|<button\b/i);
  assert.doesNotMatch(example11b, /\bul\b|<a(?:\s|>)/i);
});

test('11.08, 14.08 and 15.08 publish their short prerequisite bridges', () => {
  const bridgeFor = stage => catalog.find(lesson => lesson.id.startsWith(`${stage}.`) && lesson.stageBridge)?.stageBridge || '';
  const localStorage = bridgeFor('11');
  assert.match(localStorage, /11\.08/);
  assert.match(localStorage, /localStorage/i);
  assert.match(localStorage, /persist|recarreg|salv/i);

  const atomicWrite = bridgeFor('14');
  assert.match(atomicWrite, /14\.08/);
  assert.match(atomicWrite, /temporário|\.tmp/i);
  assert.match(atomicWrite, /rename|renome/i);

  const migration = bridgeFor('15');
  assert.match(migration, /15\.08/);
  assert.match(migration, /JavaScript|\bJS\b/i);
  assert.match(migration, /TypeScript|\bTS\b/i);
  assert.match(migration, /incremental|uma função por vez|por etapas/i);
});
