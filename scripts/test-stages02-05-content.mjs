import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';

const catalog = JSON.parse(readFileSync(new URL('../public/course-catalog.json', import.meta.url), 'utf8'));
const item = id => catalog.find(entry => entry.id === id);
const run = code => {
  const result = spawnSync(process.execPath, ['--input-type=module', '--eval', code], {encoding:'utf8', timeout:5000, windowsHide:true});
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
};

test('04.01 publishes the same calls and values that its starter executes', () => {
  const lesson = item('04.01');
  const actual = JSON.parse(run(lesson.starterFiles[0].content));
  const calls = {a:'a()', b:'b()', c:'c(3)', dPositivo:'d(4)', dNegativo:'d(-1)', e:'e()', f:'f()', g:'g(1)', h:'h(1)'};
  const published = lesson.examples.map(example => `${example.given} -> ${example.expected}`).join('; ');
  for (const [key, call] of Object.entries(calls)) {
    assert.ok(published.includes(`${call} -> ${actual[key]}`), `missing published call/result: ${call} -> ${actual[key]}`);
  }
});

test('05.03 can be solved from the published labeled blocks without inventing code', () => {
  const code = item('05.03').starterFiles[0].content;
  const blocks = Object.fromEntries([...code.matchAll(/^\/\/ \[([A-Z])\] (.+)$/gm)].map(match => [match[1], match[2]]));
  for (const id of ['A','B','C','D','E','X']) assert.ok(blocks[id], `missing block ${id}`);
  const solve = order => `function slug(titulo) {\n${order.map(id => blocks[id]).join('\n')}\n}`;
  const inputs = ['  Olá  Mundo  ', '', ' A  B '];
  const output = run(`${solve(['A','B','C','D','E'])}\nconsole.log(JSON.stringify(${JSON.stringify(inputs)}.map(slug)));`);
  assert.deepEqual(JSON.parse(output), ['olá-mundo','','a-b']);
  const distractor = run(`${solve(['A','B','C','D','X'])}\nconsole.log(slug('Olá Mundo'));`);
  assert.equal(distractor, 'olá mundo');
  assert.notEqual(distractor, 'olá-mundo');
});

test('04.07 explains its Number rounding counterexample without promising exact decimal rounding', () => {
  const lesson = item('04.07');
  const material = [lesson.prompt, ...lesson.resources].join(' ');
  assert.match(material, /0\.145/);
  assert.match(material, /14\.499999999999998/);
  assert.match(material, /imposto[^.]*14\b/i);
  assert.doesNotMatch(material, /com meio centavo arredondado para cima/);
  assert.equal(Math.round(100 * 0.145), 14);
});

test('05.14 teaches a maintainability tradeoff instead of an impossible-regex claim', () => {
  const lesson = item('05.14');
  assert.doesNotMatch(JSON.stringify([lesson.explanation,lesson.rubric,lesson.review]), /Regex casa padrões regulares sem memória|o que a regex não representa: estado|regex gigante erra em silêncio/);
  assert.match(lesson.explanation.mental_model, /regex.*(?:aspas|escapes)/i);
  assert.match(lesson.explanation.mental_model, /clareza|manuten/i);
});

test('05.08 keeps the parser contract open to any non-empty level', () => {
  const lesson = item('05.08');
  const material = [lesson.prompt, ...(lesson.resources || []), ...(lesson.hints || [])].join(' ');
  assert.match(material, /restringe o vocabul/i);
  assert.doesNotMatch(material, /Aceite somente INFO/);
  const reference = readFileSync(new URL('../course-src/solutions/05.08/main.js', import.meta.url), 'utf8');
  const output = run(`${reference}\nconsole.log(JSON.stringify(parseLinhas(["INFO|2026-01-02|x|y", "B|2026-01-02|ok"])));`);
  assert.deepEqual(JSON.parse(output), [['INFO|2026-01-02|x|y', 'B|2026-01-02|ok'], []]);
});
