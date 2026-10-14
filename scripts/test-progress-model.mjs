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
  assert.deepEqual(server.exerciseLearning, {});
  server.answers['00.01'] = true;
  assert.equal(model.createEmptyProgress().answers['00.01'], undefined);
  assert.equal(client.answers['00.01'], undefined);
});

test('learning records are sanitized by known activity and retain explicit attempt evidence', () => {
  const record = {schemaVersion: 1, contentVersion: 1, assessmentVersion: 1, mode: 'recall', state: 'attempted',
    assisted: true, attemptId: 'attempt-1', attemptIndependent: false, currentFingerprint: 'sha256:abc', currentUpdatedAt: '2026-10-11T12:00:00.000Z', events: [
      {id: 'e1', kind: 'help', attemptId: 'attempt-1', at: '2026-10-11T12:00:00.000Z',
        fingerprint: 'sha256:abc', assisted: true, source: 'browser'}
    ]};
  const clean = sanitize({exerciseLearning: {'04.01': record, '99.99': record, '__proto__': record}});
  assert.equal(clean.exerciseLearning['04.01'].attemptId, 'attempt-1');
  assert.equal(Object.hasOwn(clean.exerciseLearning, '99.99'), false);
  assert.equal(Object.hasOwn(clean.exerciseLearning, '__proto__'), false);
});

test('evidence, schedules and versioned drafts are bounded without accepting prototype keys', () => {
  const fingerprint = `sha256:${'a'.repeat(64)}`;
  const clean = sanitize(JSON.parse(`{"exerciseDrafts":{"__proto__":"x","04.01@v2":"draft"},"exerciseEvidence":{"04.01@v2":{"status":"executed","runResult":"result","testsPassed":true,"tests":{"passed":9,"total":3},"runCount":999999,"output":"ok","rubric":[0,0,19,20,-1],"rubricFingerprint":"${fingerprint}"}},"reviewSchedule":{"04.01":{"dueAt":1,"intervalIndex":999}},"activeDays":["2026-02-30","2026-10-04"]}`));
  assert.equal(clean.exerciseDrafts['04.01@v2'], 'draft');
  assert.equal(Object.hasOwn(clean.exerciseDrafts, '__proto__'), false);
  assert.equal(clean.exerciseEvidence['04.01@v2'].runCount, 100000);
  assert.equal(clean.exerciseEvidence['04.01@v2'].testsPassed, true);
  assert.deepEqual(clean.exerciseEvidence['04.01@v2'].tests, {passed: 3, total: 3});
  assert.deepEqual(clean.exerciseEvidence['04.01@v2'].rubric, [0, 19]);
  assert.equal(clean.exerciseEvidence['04.01@v2'].rubricFingerprint, fingerprint);
  const malformed = sanitize({exerciseEvidence: {'04.01@v2': {status: 'written', runResult: 'guided', rubricFingerprint: 'old'}}});
  assert.equal(malformed.exerciseEvidence['04.01@v2'].rubricFingerprint, undefined);
  assert.equal(clean.reviewSchedule['04.01'].intervalIndex, 3);
  assert.deepEqual(clean.activeDays, ['2026-10-04']);
});

test('observational prediction evidence roundtrips as an execution without verified tests', () => {
  const evidence = {status: 'executed', runResult: 'result', output: 'A\nB\nP\nT', source: 'rubric-declared',
    testsPassed: false, tests: {passed: 0, total: 0, failed: 0}, runCount: 1};
  const clean = sanitize({exerciseEvidence: {'12.01@v1': evidence}}).exerciseEvidence['12.01@v1'];
  assert.ok(clean);
  assert.equal(clean.status, 'executed');
  assert.equal(clean.runResult, 'result');
  assert.equal(clean.source, 'rubric-declared');
  assert.equal(clean.testsPassed, false);
  assert.deepEqual(clean.tests, {passed: 0, total: 0});
  assert.equal(sanitize({exerciseEvidence: {'12.01@v1': {...evidence, runResult: 'observed'}}}).exerciseEvidence['12.01@v1'], undefined);
});

test('blank or modified stage02 code cannot retain a successful completion', () => {
  const input = {stage02: {'02.01': {version: 1, complete: true, blocks: [
    {code: '', passedCode: '', predictionSaved: true, understood: true}
  ]}}};
  assert.equal(sanitize(input).stage02['02.01'].complete, false);
  input.stage02['02.01'].blocks[0].code = 'console.log(1);';
  assert.equal(sanitize(input).stage02['02.01'].complete, false);
});
