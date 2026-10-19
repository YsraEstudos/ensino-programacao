import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {isStrictDescendant} from './temporary-path-guard.mjs';

const root = process.env.DEVPATH_TEST_ROOT || process.cwd();
const read = file => readFileSync(path.join(root, file), 'utf8');
const moduleAt = file => import(pathToFileURL(path.join(root, file)).href);
const source = JSON.parse(read('course-src/assessments.json'));
const published = JSON.parse(read('public/course-catalog.json'));
const item = id => published.find(entry => entry.id === id);
const starter = id => item(id).starterFiles.map(file => file.content).join('\n');
const reference = (id, file = source[id].entryPath) => source[id].correctFiles.find(entry => entry.path === file)?.content;

test('temporary regeneration guard permits only strict descendants of the temp root', () => {
  const tempRoot = path.resolve(tmpdir());
  const child = path.join(tempRoot, 'devpath-guard-copy');
  const siblingPrefix = `${tempRoot}-sibling`;
  const parent = path.dirname(tempRoot);
  const checkout = process.cwd();

  // The former prefix predicate accepted this sibling even though it is outside os.tmpdir().
  assert.equal(siblingPrefix.toLowerCase().startsWith(tempRoot.toLowerCase()), true);
  assert.equal(isStrictDescendant(child, tempRoot), true);
  assert.equal(isStrictDescendant(tempRoot, tempRoot), false);
  assert.equal(isStrictDescendant(siblingPrefix, tempRoot), false);
  assert.equal(isStrictDescendant(parent, tempRoot), false);
  assert.equal(isStrictDescendant(checkout, tempRoot), false);

  // Native Windows path.relative treats drive/path casing as equivalent.
  const caseVariantChild = path.join(tempRoot.toUpperCase(), 'devpath-guard-case-probe');
  assert.equal(isStrictDescendant(caseVariantChild, tempRoot), true);
});

test('20.08 operators are positional, immutable, lazy, and close the source on break', async () => {
  const {pipeline} = await moduleAt('course-src/solutions/20.08/pipeline.js');
  assert.deepEqual([...pipeline([1, 2, 3, 4]).take(2).map(x => x * 10)], [10, 20]);
  assert.deepEqual([...pipeline([1, 2, 3, 4]).filter(x => x % 2 === 0).take(2)], [2, 4]);
  let pulls = 0;
  function* counted() { for (const value of [1, 2, 3]) { pulls++; yield value; } }
  const lazy = pipeline(counted()).map(x => x + 1).take(1);
  assert.equal(pulls, 0);
  assert.deepEqual([...lazy], [2]);
  assert.equal(pulls, 1);
  const base = pipeline([1, 2, 3]);
  assert.deepEqual([...base.map(x => x + 1)], [2, 3, 4]);
  assert.deepEqual([...base.filter(x => x > 1)], [2, 3]);
  assert.deepEqual([...base], [1, 2, 3]);
  let closed = false;
  function* values() { try { yield 1; yield 2; } finally { closed = true; } }
  for (const value of pipeline(values())) { assert.equal(value, 1); break; }
  assert.equal(closed, true);
  assert.match(reference('20.08'), /\*\s*\[Symbol\.iterator\]\(\)/);
});

test('21.07 clock contract matches the learner starter and 100 events are simulated', async () => {
  const {debounce, throttle} = await moduleAt('course-src/solutions/21.07/tempo.js');
  let now = 0;
  const timers = [];
  const clock = {agora: () => now, setTimeout(fn, ms) { const task = {at: now + ms, fn, canceled: false}; timers.push(task); return task; }, clearTimeout(task) { task.canceled = true; }};
  const debounceCalls = [];
  const throttleCalls = [];
  const d = debounce(x => debounceCalls.push([now, x]), 100, clock);
  const t = throttle(x => throttleCalls.push([now, x]), 100, clock);
  for (let i = 0; i < 100; i++) { now = i * 10; d(i); t(i); }
  now = 1090;
  for (const task of timers.filter(task => !task.canceled && task.at <= now)) task.fn();
  assert.deepEqual(debounceCalls, [[1090, 99]]);
  assert.equal(throttleCalls.length, 10);
  assert.deepEqual(throttleCalls.map(([time]) => time), [0,100,200,300,400,500,600,700,800,900]);
  assert.match(starter('21.07'), /100 eventos/);
});

test('21.09 exports comparar and uses the mean of middle samples for even runs', async () => {
  const {medir, comparar} = await moduleAt('course-src/solutions/21.09/lab.js');
  let i = 0;
  const times = [0, 2, 3, 7, 8, 14, 15, 25];
  const result = medir(() => {}, [1], {warmups: 0, runs: 4, now: () => times[i++]});
  assert.deepEqual(result.samples, [2, 4, 6, 10]);
  assert.equal(result.median, 5);
  assert.equal(comparar([1,2,3]).resultado, 6);
});

test('23.02 never exposes storage cause in the public result', async () => {
  const {criarServico, responder} = await moduleAt('course-src/solutions/23.02/fluxo.js');
  const service = criarServico({async salvar() { throw new Error('secret database detail'); }});
  const result = await responder(service, '{"produto":"x","quantidade":1}');
  assert.equal(result.status, 500);
  assert.equal(JSON.stringify(result).includes('secret database detail'), false);
  await assert.rejects(service.criarPedido('{"produto":"x","quantidade":1}'), error => error.cause?.message === 'secret database detail');
});

test('21.08 publishes the transitive recurso.js dependency when its suite imports it', () => {
  const suite = read('course-src/tests/21.08.test.js');
  if (suite.includes("./recurso.js")) {
    assert.ok(source['21.08'].correctFiles.some(file => file.path === 'recurso.js'));
    const starterManifest = JSON.parse(read('course-src/starters/manifest.json'));
    assert.ok(starterManifest['21.08'].files.includes('recurso.js'));
    assert.ok(item('21.08').starterFiles.some(file => file.path === 'recurso.js'));
  }
});

test('23.03 keeps executable StorageError behavior and the original cause', async () => {
  assert.equal(source['23.03'].environment, 'node-simulated');
  assert.ok(source['23.03'].tests.includes('StorageError'));
  assert.ok(source['23.03'].correctFiles.some(file => file.path === 'contrato.js'));
  const {criarTarefa, StorageError} = await moduleAt('course-src/solutions/23.03/contrato.js');
  const cause = new Error('storage detail');
  await assert.rejects(criarTarefa({titulo: 'A'}, {async salvar() { throw cause; }}, () => 't-1'), error => {
    assert.ok(error instanceof StorageError);
    assert.equal(error.cause, cause);
    return true;
  });
});

test('20.01 trace helper is importable and reports the consumed iterator', async () => {
  const file = pathToFileURL(path.join(root, 'course-src/starters/20.01/protocolo.js')).href;
  const {percorrer} = await import(file);
  assert.deepEqual(percorrer(), {primeira:[1,2], depois:3, segunda:[], chamadas:4});
});

test('21.05 inline suite imports resolve inside the exercise module graph', () => {
  const inline = source['21.05'].tests;
  const sourceTest = read('course-src/tests/21.05.test.js');
  const specs = text => [...text.matchAll(/\bfrom\s*['"](\.{1,2}\/[^'"]+)['"]/g)].map(match => match[1]);
  const inlineImports = specs(inline);
  assert.deepEqual(inlineImports, ['./main.js', './primos.js']);
  assert.deepEqual(specs(sourceTest), inlineImports);
  const available = new Set(source['21.05'].correctFiles.map(file => file.path));
  for (const specifier of inlineImports) {
    const resolved = path.posix.normalize(specifier.slice(2));
    assert.ok(!resolved.startsWith('../'), `${specifier} escapes the exercise root`);
    assert.ok(available.has(resolved), `${specifier} does not resolve to a published correct file`);
  }
});

test('21.09 protected measurement cases import the exported API from the exercise module', () => {
  const inline = source['21.09'].tests;
  assert.match(inline, /async\(\)=>\{const api=await import\('\.\/lab\.js'\)/);
  assert.match(inline, /mediana de quatro amostras usa a media central',async\(\)=>\{const \{medir\}=await import\('\.\/lab\.js'\)/);
  assert.match(inline, /expect\(r\.median\)\.toBe\(5\)/);
  assert.doesNotMatch(inline, /window\.__devpathEntry/);
  assert.ok(source['21.09'].correctFiles.some(file => file.path === 'lab.js' && /export function medir\(/.test(file.content)));
});

test('visible contracts name every evaluated API, with required failure types', () => {
  const contracts = {
    '20.01': ['percorrer'], '20.04': ['observar'], '20.05': ['validarUser', 'updateUser'], '20.06': ['manualPipeline', 'take', 'run'],
    '20.08': ['pipeline', 'map', 'filter', 'take'], '20.09': ['criarStream', 'consumirLento'], '20.10': ['medirTexto', 'decodificar'],
    '21.05': ['contarPrimos'], '21.06': ['criarCache', 'cachePorId'], '21.08': ['usarRecursos'], '21.09': ['comparar', 'medir'],
    '22.04': ['migrar'], '22.05': ['executar'], '23.02': ['criarServico'],
    '23.03': ['StorageError'], '23.09': ['lerLogs', 'limparLogs'],
  };
  const prompt = id => item(id).prompt;
  for (const [id, names] of Object.entries(contracts)) {
    for (const name of names) {
      assert.match(prompt(id), new RegExp(`\\b${name}\\b`), `${id} hides ${name} from the prompt`);
      assert.match(starter(id), new RegExp(`\\b${name}\\b`), `${id} hides ${name} from the starter`);
    }
  }
  const visible = id => `${prompt(id)}\n${starter(id)}`;
  for (const id of Object.keys(contracts)) {
    const contractBlock = source[id].prompt.split(`Contrato da entrega (${id}):\n`)[1];
    assert.ok(contractBlock, `${id} source contract block is missing`);
    for (const line of contractBlock.split('\n').filter(line => line.startsWith('- ')).map(line => line.slice(2))) {
      assert.ok(prompt(id).includes(line), `${id} prompt omits contract detail: ${line}`);
      assert.ok(starter(id).includes(line), `${id} starter omits contract detail: ${line}`);
    }
  }
  assert.match(visible('20.01'), /primeira.*\[1,\s*2\].*depois.*3.*segunda.*\[\].*chamadas.*4/s);
  assert.match(visible('20.04'), /Reflect\.get\(target,\s*key,\s*receiver\)/);
  assert.match(visible('20.05'), /age.*inteiro.*0.*150.*RangeError/s);
  assert.match(visible('20.05'), /updateUser.*novo objeto.*sem mutar/s);
  assert.match(visible('20.06'), /values.*\[4,\s*8\].*pulls.*4.*zero.*\[\]/s);
  assert.match(visible('20.09'), /desiredSize.*num[eé]rico/i);
  assert.match(visible('20.09'), /cancel.*consumidor terminou/i);
  assert.match(visible('20.10'), /byteLength.*UTF-8.*fatal.*TypeError/s);
  assert.match(visible('21.05'), /RangeError.*n must be a nonnegative integer/s);
  assert.match(visible('21.06'), /WeakMap.*identidade.*Map.*ID|WeakMap.*Map.*ID/s);
  assert.match(visible('21.08'), /LIFO.*Symbol\.dispose.*Symbol\.asyncDispose.*erro/s);
  assert.match(visible('22.04'), /array vazio.*undefined.*Array\.prototype/s);
  assert.match(visible('22.05'), /SyntaxError.*TypeError/);
  assert.match(visible('23.02'), /400.*não persiste.*500.*cause.*causa/i);
  assert.match(visible('23.03'), /StorageError.*cause.*ValidationError/s);
  assert.match(visible('23.09'), /token.*Cookie.*Authorization.*causa.*técnica/s);
});
