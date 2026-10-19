import assert from 'node:assert/strict';
import {test} from 'node:test';
import {pipeline} from '../course-src/solutions/20.08/pipeline.js';
import {debounce, throttle} from '../course-src/solutions/21.07/tempo.js';
import {replaceContractBlock} from './task-9-contract-block.mjs';

function fakeClock() {
  let now = 0;
  const tasks = [];
  const clock = {
    agora: () => now,
    setTimeout(fn, wait) {
      const task = {at: now + wait, fn, cancelled: false};
      tasks.push(task);
      return task;
    },
    clearTimeout(task) { task.cancelled = true; },
  };
  return {
    clock,
    now: () => now,
    advance(target) {
      for (;;) {
        const due = tasks.filter(task => !task.cancelled && task.at <= target).sort((a, b) => a.at - b.at)[0];
        if (!due) break;
        due.cancelled = true;
        now = due.at;
        due.fn();
      }
      now = target;
    },
  };
}

test('contract block replacement is idempotent with LF and CRLF sources', () => {
  const marker = '// Contrato visível 21.07:';
  const contract = ['entrada -> saída', 'fronteira >= 100'];
  for (const newline of ['\n', '\r\n']) {
    const source = ['const before = 1;', marker, '// versão antiga', '// ainda no bloco', '', 'const after = 2;'].join(newline);
    const once = replaceContractBlock(source, marker, contract);
    const twice = replaceContractBlock(once, marker, contract);
    assert.equal(twice, once);
    assert.match(once, /const before = 1;\n\/\/ Contrato visível 21\.07:\n\/\/ entrada -> saída\n\/\/ fronteira >= 100\n\nconst after = 2;/);
    const missing = replaceContractBlock(['const before = 1;', '', 'const after = 2;'].join(newline), marker, contract);
    assert.equal(replaceContractBlock(missing, marker, contract), missing);
  }
});

test('20.08 distinguishes restartable iterable, consumed generator, and generator factory', () => {
  const array = pipeline([1, 2]);
  assert.deepEqual([...array], [1, 2]);
  assert.deepEqual([...array], [1, 2]);

  function* values() { yield 1; yield 2; }
  const instance = pipeline(values());
  assert.deepEqual([...instance], [1, 2]);
  assert.deepEqual([...instance], []);

  let created = 0;
  const createSource = () => { created++; return values(); };
  assert.deepEqual([...pipeline(createSource())], [1, 2]);
  assert.deepEqual([...pipeline(createSource())], [1, 2]);
  assert.equal(created, 2);
});

test('20.08 counts discarded pulls and propagates return without a pull past take', () => {
  const trace = [];
  function* source() {
    try {
      for (const value of [1, 2, 3, 4, 5]) { trace.push(`pull:${value}`); yield value; }
    } finally { trace.push('return'); }
  }
  assert.deepEqual([...pipeline(source()).filter(value => value % 2 === 0).take(2)], [2, 4]);
  assert.deepEqual(trace, ['pull:1', 'pull:2', 'pull:3', 'pull:4', 'return']);

  const zeroTrace = [];
  function* zeroSource() { try { zeroTrace.push('started'); yield 1; } finally { zeroTrace.push('return'); } }
  assert.deepEqual([...pipeline(zeroSource()).take(0)], []);
  assert.deepEqual(zeroTrace, []);

  let closed = false;
  function* breakSource() { try { yield 1; yield 2; } finally { closed = true; } }
  for (const value of pipeline(breakSource()).map(item => item)) break;
  assert.equal(closed, true);
});

test('21.07 reproduces the four-event starter timeline with separate policies', () => {
  const run = fakeClock();
  const debounceCalls = [];
  const throttleCalls = [];
  const d = debounce(() => debounceCalls.push(run.now()), 100, run.clock);
  const t = throttle(() => throttleCalls.push(run.now()), 100, {now: run.clock.agora});

  for (const at of [0, 20, 40, 160]) {
    run.advance(at);
    d();
    t();
  }
  run.advance(1000);
  assert.deepEqual(debounceCalls, [140, 260]);
  assert.deepEqual(throttleCalls, [0, 160]);
});

test('21.07 simulates 100 events and checks trailing and leading boundaries', () => {
  const run = fakeClock();
  const debounceCalls = [];
  const throttleCalls = [];
  const d = debounce(value => debounceCalls.push([run.now(), value]), 100, run.clock);
  const t = throttle(value => throttleCalls.push([run.now(), value]), 100, {now: run.clock.agora});

  for (let index = 0; index < 100; index++) {
    run.advance(index * 10);
    d(index);
    t(index);
  }
  run.advance(1090);
  assert.deepEqual(debounceCalls, [[1090, 99]]);
  assert.deepEqual(throttleCalls.map(([time]) => time), [0, 100, 200, 300, 400, 500, 600, 700, 800, 900]);

  const edge = fakeClock();
  const trailing = [];
  const leading = [];
  const edgeDebounce = debounce(value => trailing.push([edge.now(), value]), 100, edge.clock);
  const edgeThrottle = throttle(value => leading.push([edge.now(), value]), 100, {now: edge.clock.agora});
  edgeDebounce('due-at-100');
  edgeThrottle('at-0');
  edge.advance(99);
  edgeThrottle('at-99');
  edge.advance(100);
  edgeThrottle('at-100');
  assert.deepEqual(trailing, [[100, 'due-at-100']]);
  assert.deepEqual(leading, [[0, 'at-0'], [100, 'at-100']]);

  edgeDebounce('cancelled');
  edgeDebounce.cancel();
  edge.advance(300);
  assert.deepEqual(trailing, [[100, 'due-at-100']]);
});
