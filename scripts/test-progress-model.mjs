import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import {loadTsModule} from './load-ts-module.mjs';

const model = loadTsModule('lib/progress-model.ts');
const sanitize = loadTsModule('lib/progress-sanitize.ts').sanitizeUserProgress;
const context = {};
vm.runInNewContext(readFileSync('public/progress-model.js', 'utf8'), context);

test('browser and server share exactly the same defaults with independent nested state', () => {
  const server = model.createEmptyProgress();
  const client = context.DevPathProgressModel.create();
  assert.deepEqual(JSON.parse(JSON.stringify(client)), server);
  server.answers['00.01'] = true;
  assert.equal(model.createEmptyProgress().answers['00.01'], undefined);
  assert.equal(client.answers['00.01'], undefined);
});

test('evidence, schedules and versioned drafts are bounded without accepting prototype keys', () => {
  const clean = sanitize(JSON.parse('{"exerciseDrafts":{"__proto__":"x","04.01@v2":"draft"},"exerciseEvidence":{"04.01@v2":{"status":"executed","runResult":"result","runCount":999999,"output":"ok","rubric":[0,0,19,20,-1]}},"reviewSchedule":{"04.01":{"dueAt":1,"intervalIndex":999}},"activeDays":["2026-02-30","2026-10-04"]}'));
  assert.equal(clean.exerciseDrafts['04.01@v2'], 'draft');
  assert.equal(Object.hasOwn(clean.exerciseDrafts, '__proto__'), false);
  assert.equal(clean.exerciseEvidence['04.01@v2'].runCount, 100000);
  assert.deepEqual(clean.exerciseEvidence['04.01@v2'].rubric, [0, 19]);
  assert.equal(clean.reviewSchedule['04.01'].intervalIndex, 3);
  assert.deepEqual(clean.activeDays, ['2026-10-04']);
});

test('blank or modified stage02 code cannot retain a successful completion', () => {
  const input = {stage02: {'02.01': {version: 1, complete: true, blocks: [
    {code: '', passedCode: '', predictionSaved: true, understood: true}
  ]}}};
  assert.equal(sanitize(input).stage02['02.01'].complete, false);
  input.stage02['02.01'].blocks[0].code = 'console.log(1);';
  assert.equal(sanitize(input).stage02['02.01'].complete, false);
});
