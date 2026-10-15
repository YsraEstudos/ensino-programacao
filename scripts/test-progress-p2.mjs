import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import vm from 'node:vm';
import test from 'node:test';
import {loadTsModule} from './load-ts-module.mjs';

const contract = JSON.parse(readFileSync('lib/progress-contract.json', 'utf8'));
const {courseExerciseIds: catalog} = loadTsModule('lib/course-exercise-ids.ts');
const catalogSize = catalog.length;
const sanitizeModule = loadTsModule('lib/progress-sanitize.ts');
const learning = loadTsModule('lib/learning-progress.ts');
const requestModule = loadTsModule('lib/progress-request.ts');
const recordLimit = contract.limits.learningRecords;
const CATALOG_AT = '2026-10-10T12:00:00.000Z';
const STALE_AT = '2026-09-01T12:00:00.000Z';

function learningRecord(id, at, state = 'studied') {
  const attemptId = `attempt-${id}`;
  return {
    schemaVersion: 1, contentVersion: 1, assessmentVersion: 1, mode: 'learn', state,
    assisted: true, attemptId, attemptIndependent: false, currentFingerprint: `sha256:${id}`, currentUpdatedAt: at,
    events: [{id: `start-${id}`, kind: 'attempted', attemptId, at, fingerprint: `sha256:${id}`, source: 'browser'}]
  };
}

function staleRecords(count, at = STALE_AT) {
  return Object.fromEntries(Array.from({length: count}, (_, i) => [`old.${i}`, learningRecord(`old.${i}`, at)]));
}

function browserLearning() {
  const sandbox = {};
  vm.runInNewContext(readFileSync('public/learning-progress.js', 'utf8'), sandbox);
  return sandbox.DevPathLearningProgress;
}

test('record limits are derived from the catalog with a 25% margin and a floor of 300', () => {
  assert.ok(recordLimit >= catalogSize, `limit ${recordLimit} must cover the ${catalogSize}-activity catalog`);
  assert.ok(contract.limits.learningEvidenceHistory >= catalogSize);
  assert.equal(recordLimit, Math.max(300, Math.ceil(catalogSize * 1.25)));
  assert.equal(contract.limits.learningEvidenceHistory, recordLimit);
});

test('contract, generated browser files and the build check agree', () => {
  const model = {};
  vm.runInNewContext(readFileSync('public/progress-model.js', 'utf8'), model);
  assert.deepEqual(JSON.parse(JSON.stringify(model.DevPathProgressModel.limits)), contract.limits);

  const reducer = browserLearning();
  const merged = reducer.mergeExerciseLearning(staleRecords(recordLimit + 5), {});
  assert.equal(Object.keys(merged).length, recordLimit, 'browser reducer must apply the same cap as the server');

  const stdout = execFileSync(process.execPath, ['scripts/build-progress-model.mjs', '--check'], {encoding: 'utf8'});
  assert.match(stdout, /current/);
});

test('a full catalog of progress records survives merge, save, serialize and reload', () => {
  const local = Object.fromEntries(catalog.map(id => [id, learningRecord(id, CATALOG_AT)]));
  // Stale ids from an older client push the union past the limit; the oldest records must be the ones dropped.
  const remote = staleRecords(80);
  const merged = learning.mergeProgressSnapshotsWithReport({exerciseLearning: local}, {exerciseLearning: remote});
  const expectedDropped = catalogSize + 80 - recordLimit;
  assert.equal(merged.droppedLearningRecords, Math.max(0, expectedDropped));
  for (const id of catalog) assert.ok(merged.progress.exerciseLearning[id], `${id} must survive the client merge`);

  const saved = sanitizeModule.sanitizeUserProgressWithReport(merged.progress);
  const stored = JSON.stringify(saved.progress);
  const reloaded = sanitizeModule.sanitizeUserProgressWithReport(JSON.parse(stored));
  assert.deepEqual(Object.keys(reloaded.progress.exerciseLearning).sort(), [...catalog].sort());
  assert.equal(reloaded.report.truncated, false);
  assert.equal(reloaded.report.droppedLearningRecords, 0);
});

test('a payload over the limit reports truncation and keeps the most recently updated records', () => {
  const limit = 5;
  const stubs = {
    [resolve('lib/progress-contract.json')]: {...contract, limits: {...contract.limits, learningRecords: limit, learningEvidenceHistory: limit}}
  };
  const small = loadTsModule('lib/progress-sanitize.ts', stubs);
  const smallLearning = loadTsModule('lib/learning-progress.ts', stubs);
  const minute = index => new Date(Date.parse(CATALOG_AT) + index * 60_000).toISOString();
  const exerciseLearning = Object.fromEntries(catalog.map((id, index) => [id, learningRecord(id, minute(index))]));

  const {progress, report} = small.sanitizeUserProgressWithReport({exerciseLearning});
  assert.equal(report.truncated, true);
  assert.equal(report.droppedLearningRecords, catalogSize - limit);
  const kept = Object.keys(progress.exerciseLearning).sort();
  const newest = catalog.map((id, index) => ({id, index})).sort((a, b) => b.index - a.index).slice(0, limit).map(entry => entry.id).sort();
  assert.deepEqual(kept, newest);

  const merged = smallLearning.mergeProgressSnapshotsWithReport({exerciseLearning}, {exerciseLearning: {}});
  assert.equal(merged.truncated, true);
  assert.equal(Object.keys(merged.progress.exerciseLearning).length, limit);
  assert.equal(merged.droppedLearningRecords, catalogSize - limit);

  const untouched = sanitizeModule.sanitizeUserProgressWithReport({exerciseLearning: {[catalog[0]]: learningRecord(catalog[0], CATALOG_AT)}});
  assert.equal(untouched.report.truncated, false);
});

test('request body limit accepts exactly requestBytes and rejects one byte more', async () => {
  const limit = contract.limits.requestBytes;
  const body = size => {
    const prefix = '{"pad":"';
    const suffix = '"}';
    return prefix + 'x'.repeat(size - prefix.length - suffix.length) + suffix;
  };
  const accepted = await requestModule.readProgressBody(
    new Request('http://localhost/api/progress', {method: 'PUT', body: body(limit)}));
  assert.equal(accepted.pad.length, limit - '{"pad":""}'.length);
  await assert.rejects(
    requestModule.readProgressBody(new Request('http://localhost/api/progress', {method: 'PUT', body: body(limit + 1)})),
    error => error.status === 413);
});

test('a realistic save with one record per catalog activity fits requestBytes; worst-case sizes are reported, not hidden', (t) => {
  const limit = contract.limits.requestBytes;
  const exerciseLearning = Object.fromEntries(catalog.map((id, index) => {
    const at = new Date(Date.parse(CATALOG_AT) + index * 1000).toISOString();
    const record = learningRecord(id, at, 'attempted');
    record.events.push(
      {id: `study-${id}`, kind: 'studied', attemptId: record.attemptId, at, fingerprint: `sha256:${id}`, source: 'browser'},
      {id: `help-${id}`, kind: 'help', attemptId: record.attemptId, at, fingerprint: `sha256:${id}`, source: 'browser', assisted: true});
    record.evidenceHistory = [];
    return [id, record];
  }));
  const exerciseDrafts = Object.fromEntries(catalog.map(id => [id, 'a'.repeat(1000)]));
  const realistic = sanitizeModule.sanitizeUserProgress({exerciseLearning, exerciseDrafts});
  const bytes = Buffer.byteLength(JSON.stringify(realistic));
  assert.equal(Object.keys(realistic.exerciseLearning).length, catalogSize);
  assert.ok(bytes < limit, `realistic save is ${bytes} bytes, above requestBytes ${limit}`);

  const draftLimit = contract.limits.draftChars;
  const worstDrafts = catalogSize * draftLimit;
  t.diagnostic(`realistic save: ${bytes} bytes (${((bytes / limit) * 100).toFixed(1)}% of requestBytes ${limit})`);
  t.diagnostic(`open limit: ${catalogSize} drafts at draftChars ${draftLimit} = ${worstDrafts} chars, which exceeds requestBytes; not raised here`);
});
