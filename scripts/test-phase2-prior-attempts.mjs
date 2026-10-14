import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

function load() {
  const scope = {};
  vm.runInNewContext(fs.readFileSync('public/prior-attempts.js', 'utf8'), scope);
  return scope.DevPathPriorAttempts;
}

test('old version data remains readable without being copied into the current attempt', () => {
  const progress = {
    exerciseDrafts: {'04.01': '<script>old</script>', '04.01@v2': 'current', '04.01@v3': 'future', '04.02': 'other'},
    exercisePredictions: {'04.01': 'before run'}, exerciseReflections: {'04.01': 'old reflection'}
  };
  const before = JSON.stringify(progress);
  const html = load().render({id: '04.01', contentVersion: 2}, progress);
  assert.match(html, /&lt;script&gt;old&lt;\/script&gt;/);
  assert.match(html, /before run/);
  assert.match(html, /old reflection/);
  assert.match(html, /data-learning-example/);
  assert.doesNotMatch(html, /<script>|current|future|other|textarea|data-course-editor/);
  assert.equal(JSON.stringify(progress), before);
});

test('versioned older attempts and multi-file draft strings are shown as saved, with no migration', () => {
  const html = load().render({id: '12.02', contentVersion: 4}, {
    exerciseDrafts: {'12.02@v2': '__course_files__:{"a.js":"x"}'},
    exercisePredictions: {'12.02@v3': 'prediction three'}
  });
  assert.match(html, /Versão 3/);
  assert.match(html, /Versão 2/);
  assert.match(html, /__course_files__/);
  assert(html.indexOf('Versão 3') < html.indexOf('Versão 2'));
});

test('no panel for unchanged versions, unknown IDs or empty historical values', () => {
  const priorAttempts = load();
  assert.equal(priorAttempts.render({id: '04.01', contentVersion: 1}, {exerciseDrafts: {'04.01': 'current'}}), '');
  assert.equal(priorAttempts.render({id: '04.01', contentVersion: 2}, {exerciseDrafts: {'04.01': ''}}), '');
  assert.equal(priorAttempts.render({id: 'bad<id', contentVersion: 2}, {}), '');
});
