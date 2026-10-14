import assert from 'node:assert/strict';
import test from 'node:test';
import {loadTsModule} from './load-ts-module.mjs';

const learning = loadTsModule('lib/learning-progress.ts');
const event = (id, kind, attemptId, fingerprint, at, source = 'browser') =>
  ({id, kind, attemptId, fingerprint, at, source});
const context = (fingerprint, overrides = {}) => ({
  contentVersion: 1,
  assessmentVersion: 2,
  fingerprint,
  independent: false,
  assessmentPassed: false,
  mode: 'learn',
  ...overrides
});

test('help remains attached to the same attempt through edits and mode changes', () => {
  let record = learning.transitionLearning(null,
    event('start-a', 'attempted', 'attempt-a', 'hash-a', '2026-10-11T12:00:00.000Z'),
    context('hash-a', {independent: true, mode: 'recall'}));
  record = learning.transitionLearning(record,
    event('help-a', 'help', 'attempt-a', 'hash-a', '2026-10-11T12:01:00.000Z'), context('hash-a'));
  record = learning.transitionLearning(record,
    event('edit-a', 'attempted', 'attempt-a', 'hash-b', '2026-10-11T12:02:00.000Z'), context('hash-b', {mode: 'learn'}));

  assert.equal(record.attemptId, 'attempt-a');
  assert.equal(record.currentFingerprint, 'hash-b');
  assert.equal(record.assisted, true);
  assert.equal(record.state, 'attempted');
});

test('a fresh independent attempt resets help even when its fingerprint is unchanged', () => {
  let record = learning.transitionLearning(null,
    event('start-a', 'attempted', 'attempt-a', 'same-hash', '2026-10-11T12:00:00.000Z'),
    context('same-hash', {independent: true, mode: 'recall'}));
  record = learning.transitionLearning(record,
    event('help-a', 'help', 'attempt-a', 'same-hash', '2026-10-11T12:01:00.000Z'), context('same-hash'));
  record = learning.transitionLearning(record,
    event('start-b', 'attempted', 'attempt-b', 'same-hash', '2026-10-11T12:02:00.000Z'),
    context('same-hash', {independent: true, mode: 'recall'}));
  record = learning.transitionLearning(record,
    event('prove-b', 'demonstrated', 'attempt-b', 'same-hash', '2026-10-11T12:03:00.000Z'),
    context('same-hash', {independent: true, assessmentPassed: true, mode: 'recall'}));

  assert.equal(record.assisted, false);
  assert.equal(record.state, 'demonstrated');
  assert.deepEqual(record.demonstratedEvidence, {
    attemptId: 'attempt-b', contentVersion: 1, assessmentVersion: 2,
    fingerprint: 'same-hash', source: 'browser', at: '2026-10-11T12:03:00.000Z', eventId: 'prove-b'
  });
});

test('a late or replayed callback cannot replace the current explicit attempt', () => {
  let record = learning.transitionLearning(null,
    event('start-a', 'attempted', 'attempt-a', 'same-hash', '2026-10-11T12:00:00.000Z'),
    context('same-hash', {independent: true, mode: 'recall'}));
  record = learning.transitionLearning(record,
    event('help-a', 'help', 'attempt-a', 'same-hash', '2026-10-11T12:01:00.000Z'), context('same-hash'));
  record = learning.transitionLearning(record,
    event('start-b', 'attempted', 'attempt-b', 'same-hash', '2026-10-11T12:02:00.000Z'),
    context('same-hash', {independent: true, mode: 'recall'}));
  const lateOlder = learning.transitionLearning(record,
    event('late-help-a', 'help', 'attempt-a', 'same-hash', '2026-10-11T12:01:30.000Z'), context('same-hash'));
  const replayedStart = learning.transitionLearning(record,
    event('replay-start-a', 'attempted', 'attempt-a', 'same-hash', '2026-10-11T12:03:00.000Z'),
    context('same-hash', {independent: true, mode: 'recall'}));
  assert.equal(lateOlder.attemptId, 'attempt-b');
  assert.equal(lateOlder.assisted, false);
  assert.equal(replayedStart.attemptId, 'attempt-b');
  assert.equal(replayedStart.assisted, false);
});

test('assisted passing assessment is verified, and later failure keeps its versioned evidence', () => {
  let record = learning.transitionLearning(null,
    event('start', 'attempted', 'attempt-a', 'hash-a', '2026-10-11T12:00:00.000Z'), context('hash-a'));
  record = learning.transitionLearning(record,
    event('help', 'help', 'attempt-a', 'hash-a', '2026-10-11T12:01:00.000Z'), context('hash-a'));
  record = learning.transitionLearning(record,
    event('verify', 'verified', 'attempt-a', 'hash-a', '2026-10-11T12:02:00.000Z', 'rubric-declared'),
    context('hash-a', {assessmentPassed: true}));

  assert.equal(record.state, 'verified');
  assert.equal(record.assisted, true);
  assert.deepEqual(record.verifiedEvidence, {
    attemptId: 'attempt-a', contentVersion: 1, assessmentVersion: 2,
    fingerprint: 'hash-a', source: 'rubric-declared', at: '2026-10-11T12:02:00.000Z', eventId: 'verify'
  });
  record = learning.transitionLearning(record,
    event('try-demo', 'demonstrated', 'attempt-a', 'hash-a', '2026-10-11T12:02:30.000Z'),
    context('hash-a', {independent: true, assessmentPassed: true, mode: 'recall'}));
  assert.equal(record.state, 'verified');

  record = learning.transitionLearning(record,
    event('retry', 'attempted', 'attempt-a', 'hash-b', '2026-10-11T12:03:00.000Z'), context('hash-b'));
  assert.equal(record.state, 'attempted');
  assert.equal(record.currentFingerprint, 'hash-b');
  assert.equal(record.verifiedEvidence.fingerprint, 'hash-a');
  assert.equal(record.verifiedEvidence.assessmentVersion, 2);
  assert.equal(record.verifiedEvidence.source, 'rubric-declared');

  record = learning.transitionLearning(record,
    event('start-b', 'attempted', 'attempt-b', 'hash-b', '2026-10-11T12:04:00.000Z'),
    context('hash-b', {independent: true, mode: 'recall', contentVersion: 2, assessmentVersion: 3}));
  record = learning.transitionLearning(record,
    event('verify-b', 'verified', 'attempt-b', 'hash-b', '2026-10-11T12:05:00.000Z', 'local-declared'),
    context('hash-b', {independent: true, mode: 'recall', contentVersion: 2, assessmentVersion: 3, assessmentPassed: true}));
  assert.equal(record.evidenceHistory.length, 2);
  assert.deepEqual(record.evidenceHistory.map(item => [item.contentVersion, item.assessmentVersion, item.source, item.fingerprint]), [
    [1, 2, 'rubric-declared', 'hash-a'], [2, 3, 'local-declared', 'hash-b']
  ]);
  assert.equal(learning.sanitizeLearningRecord(record).evidenceHistory.length, 2);
});

test('failed attempts remain attempted, while study without approval becomes studied', () => {
  let record = learning.transitionLearning(null,
    event('start', 'attempted', 'attempt-a', 'hash-a', '2026-10-11T12:00:00.000Z'),
    context('hash-a', {independent: true, mode: 'recall'}));
  record = learning.transitionLearning(record,
    event('timeout', 'verified', 'attempt-a', 'hash-a', '2026-10-11T12:01:00.000Z'),
    context('hash-a', {independent: true, assessmentPassed: false, mode: 'recall'}));
  assert.equal(record.state, 'attempted');
  assert.equal(record.verifiedEvidence, undefined);
  record = learning.transitionLearning(record,
    event('study', 'studied', 'attempt-a', 'hash-a', '2026-10-11T12:02:00.000Z'),
    context('hash-a', {independent: true, mode: 'recall'}));
  assert.equal(record.state, 'studied');
  assert.equal(record.verifiedEvidence, undefined);
});

test('stale, unsupported, or failed evidence cannot promote and assistance merges monotonically', () => {
  let record = learning.transitionLearning(null,
    event('start', 'attempted', 'attempt-a', 'current', '2026-10-11T12:00:00.000Z'),
    context('current', {independent: true, mode: 'recall'}));
  const stale = learning.transitionLearning(record,
    event('old-pass', 'demonstrated', 'attempt-a', 'old', '2026-10-11T12:01:00.000Z'),
    context('current', {independent: true, assessmentPassed: true}));
  assert.equal(stale.state, 'attempted');
  assert.equal(stale.demonstratedEvidence, undefined);

  const assisted = learning.transitionLearning(record,
    event('help', 'help', 'attempt-a', 'current', '2026-10-11T12:02:00.000Z'), context('current'));
  const merged = learning.mergeLearningRecords(assisted, record);
  assert.equal(merged.assisted, true);
  assert.equal(merged.attemptId, 'attempt-a');

  const edited = learning.transitionLearning(record,
    event('edit', 'attempted', 'attempt-a', 'next', '2026-10-11T12:02:00.000Z'), context('next'));
  const late = learning.transitionLearning(edited,
    event('late', 'verified', 'attempt-a', 'current', '2026-10-11T12:01:00.000Z'),
    context('current', {independent: true, assessmentPassed: true}));
  assert.equal(late.currentFingerprint, 'next');
  assert.equal(late.state, 'attempted');
});

test('help discovered by a merge downgrades current demonstration without discarding its evidence', () => {
  let demonstrated = learning.transitionLearning(null,
    event('start', 'attempted', 'attempt-a', 'hash-a', '2026-10-11T12:00:00.000Z'),
    context('hash-a', {independent: true, mode: 'recall'}));
  demonstrated = learning.transitionLearning(demonstrated,
    event('pass', 'demonstrated', 'attempt-a', 'hash-a', '2026-10-11T12:01:00.000Z'),
    context('hash-a', {independent: true, assessmentPassed: true, mode: 'recall'}));
  const helped = learning.transitionLearning(demonstrated,
    event('help', 'help', 'attempt-a', 'hash-a', '2026-10-11T12:02:00.000Z'), context('hash-a'));
  assert.equal(helped.assisted, true);
  assert.equal(helped.state, 'verified');
  assert.equal(learning.sanitizeLearningRecord(helped).state, 'verified');
  assert.equal(helped.demonstratedEvidence.attemptId, 'attempt-a');

  const merged = learning.mergeLearningRecords(demonstrated, helped);
  assert.equal(merged.assisted, true);
  assert.equal(merged.state, 'verified');
  assert.equal(learning.sanitizeLearningRecord(merged).state, 'verified');
  assert.equal(merged.demonstratedEvidence.fingerprint, 'hash-a');
});

test('sanitizer and merge derive sticky help from same-attempt help events', () => {
  let record = learning.transitionLearning(null,
    event('start', 'attempted', 'attempt-a', 'hash-a', '2026-10-11T12:00:00.000Z'),
    context('hash-a', {independent: true, mode: 'recall'}));
  record = learning.transitionLearning(record,
    event('pass', 'demonstrated', 'attempt-a', 'hash-a', '2026-10-11T12:01:00.000Z'),
    context('hash-a', {independent: true, assessmentPassed: true, mode: 'recall'}));
  const hostileBackup = {...record, assisted: false, events: [
    ...record.events,
    event('forged-help-flag', 'help', 'attempt-a', 'hash-a', '2026-10-11T12:02:00.000Z')
  ]};
  const sanitized = learning.sanitizeLearningRecord(hostileBackup);
  assert.equal(sanitized.assisted, true);
  assert.equal(sanitized.state, 'verified');
  assert.equal(sanitized.demonstratedEvidence.fingerprint, 'hash-a');
  const merged = learning.mergeLearningRecords(record, hostileBackup);
  assert.equal(merged.assisted, true);
  assert.equal(merged.state, 'verified');
  assert.equal(learning.sanitizeLearningRecord(merged).state, 'verified');
});

test('help before the 12-event window stays sticky in sanitizer and merge', () => {
  let record = learning.transitionLearning(null,
    event('start', 'attempted', 'attempt-a', 'hash-a', '2026-10-11T12:00:00.000Z'),
    context('hash-a', {independent: true, mode: 'recall'}));
  record = learning.transitionLearning(record,
    event('pass', 'demonstrated', 'attempt-a', 'hash-a', '2026-10-11T12:01:00.000Z'),
    context('hash-a', {independent: true, assessmentPassed: true, mode: 'recall'}));
  const help = event('early-help', 'help', 'attempt-a', 'hash-a', '2026-10-11T12:02:00.000Z');
  const laterEvents = Array.from({length: 12}, (_, index) => event(
    `later-${index}`, 'attempted', 'attempt-a', 'hash-a',
    new Date(Date.UTC(2026, 9, 11, 12, 3, index)).toISOString()));
  const hostileBackup = {...record, assisted: false, events: [help, ...laterEvents]};
  const sanitized = learning.sanitizeLearningRecord(hostileBackup);
  assert.equal(sanitized.events.length, 12);
  assert.equal(sanitized.events.some(item => item.id === 'early-help'), false);
  assert.equal(sanitized.assisted, true);
  assert.equal(sanitized.state, 'verified');
  const merged = learning.mergeLearningRecords(record, hostileBackup);
  assert.equal(merged.assisted, true);
  assert.equal(merged.state, 'verified');
  assert.equal(learning.sanitizeLearningRecord(merged).assisted, true);
});

test('content or assessment version changes invalidate only the current promotion', () => {
  let record = learning.transitionLearning(null,
    event('start', 'attempted', 'attempt-a', 'same-fingerprint', '2026-10-11T12:00:00.000Z'),
    context('same-fingerprint', {independent: true, mode: 'recall'}));
  record = learning.transitionLearning(record,
    event('pass', 'verified', 'attempt-a', 'same-fingerprint', '2026-10-11T12:01:00.000Z'),
    context('same-fingerprint', {independent: true, mode: 'recall', assessmentPassed: true}));
  record = learning.transitionLearning(record,
    event('editorial-change', 'attempted', 'attempt-a', 'same-fingerprint', '2026-10-11T12:02:00.000Z'),
    context('same-fingerprint', {independent: true, mode: 'recall', contentVersion: 2, assessmentVersion: 3}));
  assert.equal(record.state, 'attempted');
  assert.equal(record.contentVersion, 2);
  assert.equal(record.assessmentVersion, 3);
  assert.equal(record.verifiedEvidence.contentVersion, 1);
  assert.equal(record.verifiedEvidence.assessmentVersion, 2);
  assert.equal(record.evidenceHistory.length, 1);
});

test('unknown versions and unsupported evidence sources cannot promote an attempt', () => {
  let record = learning.transitionLearning(null,
    event('start', 'attempted', 'attempt-a', 'hash-a', '2026-10-11T12:00:00.000Z'),
    context('hash-a', {independent: true, contentVersion: 0, assessmentVersion: 0, mode: 'recall'}));
  record = learning.transitionLearning(record,
    event('verify', 'verified', 'attempt-a', 'hash-a', '2026-10-11T12:01:00.000Z'),
    context('hash-a', {independent: true, assessmentPassed: true, contentVersion: 0, assessmentVersion: 0, mode: 'recall'}));
  assert.equal(record.state, 'attempted');
  assert.equal(record.verifiedEvidence, undefined);
});

test('sanitizer caps recent events, rejects invalid provenance, and migration preserves legacy data', () => {
  const events = Array.from({length: 13}, (_, index) => event(
    `event-${index}`, 'attempted', 'legacy-04.01', 'legacy-fingerprint',
    `2026-10-11T12:${String(index).padStart(2, '0')}:00.000Z`));
  const sanitized = learning.sanitizeLearningRecord({
    schemaVersion: 1, contentVersion: 1, assessmentVersion: 1, mode: 'learn', state: 'attempted',
    assisted: true, attemptId: 'legacy-04.01', attemptIndependent: false, currentFingerprint: 'legacy-fingerprint',
    currentUpdatedAt: '2026-10-11T12:12:00.000Z', events
  });
  assert.equal(sanitized.events.length, 12);
  assert.equal(sanitized.events[0].id, 'event-1');
  assert.equal(learning.sanitizeLearningRecord({...sanitized, currentFingerprint: ''}), null);
  assert.equal(learning.sanitizeLearningRecord({...sanitized, state: 'completed'}), null);
  assert.equal(learning.sanitizeLearningRecord({...sanitized, padding: 'x'.repeat(200001)}), null);
  assert.equal(learning.sanitizeLearningRecord({...sanitized, events: [event('bad-time', 'help', 'legacy-04.01',
    'legacy-fingerprint', 'not-a-date')]}).events.length, 0);
  assert.equal(learning.sanitizeLearningRecord({...sanitized, state: 'verified', currentFingerprint: 'unknown',
    verifiedEvidence: {attemptId: 'legacy-04.01', contentVersion: 1, assessmentVersion: 1,
      fingerprint: 'unknown', source: 'browser', at: '2026-10-11T12:00:00.000Z'}}), null);

  const original = {
    completed: ['04.01'], answers: {'04.01': true}, exerciseDrafts: {'04.01': 'saved draft'},
    exerciseEvidence: {'04.01': {status: 'executed', runResult: 'result', testsPassed: true}}
  };
  const migrated = learning.migrateLegacyLearning(original,
    [{id: '04.01', contentVersion: 1}], {'04.01': {version: 1}});
  assert.equal(original.exerciseLearning, undefined);
  assert.deepEqual(migrated.completed, ['04.01']);
  assert.deepEqual(migrated.answers, {'04.01': true});
  assert.deepEqual(migrated.exerciseDrafts, {'04.01': 'saved draft'});
  assert.equal(migrated.exerciseEvidence['04.01'].testsPassed, true);
  assert.equal(migrated.exerciseLearning['04.01'].state, 'studied');
  assert.equal(migrated.exerciseLearning['04.01'].demonstratedEvidence, undefined);
  assert.deepEqual(learning.migrateLegacyLearning(migrated,
    [{id: '04.01', contentVersion: 1}], {'04.01': {version: 1}}), migrated);
});

test('help written for a diagnostic activity survives the reload path (save, reload, migrate, merge)', () => {
  // Regression: D.01 help was reported as missing after a reload. The attempt must stay assisted through each step
  // the browser takes: server sanitizing, JSON round trip, legacy migration on load, and the client-side merge.
  const d01Context = {contentVersion: 1, assessmentVersion: 1, fingerprint: 'd01-hash', independent: true, assessmentPassed: false, mode: 'recall'};
  let record = learning.transitionLearning(null,
    event('d01-start', 'attempted', 'attempt-d01', 'd01-hash', '2026-10-11T12:00:00.000Z'), d01Context);
  record = learning.transitionLearning(record,
    event('d01-help', 'help', 'attempt-d01', 'd01-hash', '2026-10-11T12:01:00.000Z'), d01Context);
  record = learning.transitionLearning(record,
    event('d01-edit', 'attempted', 'attempt-d01', 'd01-edited', '2026-10-11T12:02:00.000Z'), {...d01Context, fingerprint: 'd01-edited'});

  const saved = JSON.parse(JSON.stringify({exerciseLearning: {'D.01': record}}));
  const serverCopy = learning.sanitizeLearningRecord(saved.exerciseLearning['D.01']);
  assert.equal(serverCopy.assisted, true, 'server sanitizing keeps help');
  assert.equal(serverCopy.attemptId, 'attempt-d01');

  const loaded = learning.migrateLegacyLearning(saved, [{id: 'D.01', contentVersion: 1}], {'D.01': {version: 1}});
  assert.equal(loaded.exerciseLearning['D.01'].assisted, true, 'load-time migration keeps help');
  assert.equal(loaded.exerciseLearning['D.01'].attemptId, 'attempt-d01');
  assert.equal(loaded.exerciseLearning['D.01'].events.some(item => item.kind === 'help'), true);

  const mergedFromBackup = learning.mergeProgressSnapshots({exerciseLearning: loaded.exerciseLearning}, {exerciseLearning: {}});
  assert.equal(mergedFromBackup.exerciseLearning['D.01'].assisted, true, 'local backup merge keeps help');
  const mergedFromAccount = learning.mergeProgressSnapshots({exerciseLearning: {}}, {exerciseLearning: loaded.exerciseLearning});
  assert.equal(mergedFromAccount.exerciseLearning['D.01'].assisted, true, 'account copy merge keeps help');
});

test('a declared transfer is its own state and never produces demonstrated', () => {
  let record = learning.transitionLearning(null,
    event('start-a', 'attempted', 'attempt-a', 'hash-a', '2026-10-11T12:00:00.000Z'),
    context('hash-a', {independent: true, mode: 'recall'}));
  record = learning.transitionLearning(record,
    event('pass-a', 'verified', 'attempt-a', 'hash-a', '2026-10-11T12:01:00.000Z', 'browser'),
    context('hash-a', {independent: true, assessmentPassed: true, mode: 'recall'}));
  assert.equal(record.state, 'verified');
  record = learning.transitionLearning(record,
    event('start-t', 'attempted', 'attempt-t', 'hash-a', '2026-10-11T12:02:00.000Z'),
    context('hash-a', {independent: true, mode: 'recall'}));
  record = learning.transitionLearning(record,
    event('declare-t', 'transfer-declared', 'attempt-t', 'hash-a', '2026-10-11T12:03:00.000Z', 'rubric-declared'),
    context('hash-a', {independent: true, assessmentPassed: false, mode: 'recall'}));

  assert.equal(record.state, 'transfer-declared');
  assert.equal(record.demonstratedEvidence, undefined);
  assert.equal(record.transferEvidence.source, 'rubric-declared');
  const sanitized = learning.sanitizeLearningRecord(record);
  assert.equal(sanitized.state, 'transfer-declared');
  assert.deepEqual(learning.sanitizeLearningRecord(sanitized), sanitized);
});

test('a rubric-declared demonstration is not promoted to demonstrated', () => {
  let record = learning.transitionLearning(null,
    event('start', 'attempted', 'attempt-a', 'hash-a', '2026-10-11T12:00:00.000Z'),
    context('hash-a', {independent: true, mode: 'recall'}));
  record = learning.transitionLearning(record,
    event('pass', 'demonstrated', 'attempt-a', 'hash-a', '2026-10-11T12:01:00.000Z', 'rubric-declared'),
    context('hash-a', {independent: true, assessmentPassed: true, mode: 'recall'}));
  assert.notEqual(record.state, 'demonstrated');
  assert.equal(record.demonstratedEvidence, undefined);
});

test('a stored declared transfer saved as demonstrated is read back as transfer-declared', () => {
  const evidence = {attemptId: 'attempt-t', contentVersion: 1, assessmentVersion: 2, fingerprint: 'hash-a',
    source: 'rubric-declared', at: '2026-10-11T12:01:00.000Z', eventId: 'pass'};
  const legacy = {schemaVersion: 1, contentVersion: 1, assessmentVersion: 2, mode: 'recall', state: 'demonstrated',
    assisted: false, attemptId: 'attempt-t', attemptIndependent: true, currentFingerprint: 'hash-a',
    currentUpdatedAt: '2026-10-11T12:01:00.000Z', attemptHistory: [{attemptId: 'attempt-t', startedAt: '2026-10-11T12:00:00.000Z'}],
    verifiedEvidence: evidence, demonstratedEvidence: evidence, evidenceHistory: [evidence], events: []};
  const sanitized = learning.sanitizeLearningRecord(legacy);
  assert.equal(sanitized.state, 'transfer-declared');
  assert.equal(sanitized.demonstratedEvidence, undefined);
  assert.deepEqual(sanitized.transferEvidence, evidence);
  assert.deepEqual(learning.sanitizeLearningRecord(sanitized), sanitized);
});
