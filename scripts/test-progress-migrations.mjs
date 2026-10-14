import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const w = {};
w.window = w;
vm.runInNewContext(readFileSync('public/progress-migrations.js', 'utf8'), w);
test('legacy starter migration is pure, idempotent and preserves custom drafts', () => {
    const original = { code: 'const nome="Ana";let pontos=0;pontos=5;const ativo=false;let volume=0;volume=7;const idioma="pt-BR";let tentativas=1;tentativas=2;', complete: true, passedCode: 'old', reflection: 'mine' };
    const copy = JSON.stringify(original);
    const migrated = w.DevPathProgressMigrations.stage01('01.04', original);
    assert.equal(migrated.changed, true);
    assert.equal(JSON.stringify(original), copy);
    assert.equal(migrated.state.complete, false);
    assert.match(migrated.state.code, /console.log/);
    assert.equal(migrated.state.reflection, 'mine');
    assert.equal(w.DevPathProgressMigrations.stage01('01.04', migrated.state).changed, false);
    assert.equal(w.DevPathProgressMigrations.stage01('01.04', { code: 'console.log("custom")' }).changed, false);
    assert.equal(w.DevPathProgressMigrations.stage01('01.05', original).changed, false);
});

test('learning migration keeps legacy completion and drafts without inventing independent mastery', () => {
    const learning = {};
    vm.runInNewContext(readFileSync('public/learning-progress.js', 'utf8'), learning);
    vm.runInNewContext(readFileSync('public/progress-migrations.js', 'utf8'), learning);
    const original = {completed: ['04.01'], answers: {'04.01': true}, exerciseDrafts: {'04.01': 'draft'},
        exerciseEvidence: {'04.01': {status: 'executed', runResult: 'result', testsPassed: true}}};
    const before = JSON.stringify(original);
    const catalog = [{id: '04.01', contentVersion: 1}];
    const assessments = {assessment: {'04.01': {version: 1}}};
    const migrated = learning.DevPathProgressMigrations.migrateLegacyLearning(original, catalog, assessments);
    assert.equal(JSON.stringify(original), before);
    assert.equal(migrated.exerciseLearning['04.01'].state, 'studied');
    assert.equal(migrated.exerciseLearning['04.01'].assisted, true);
    assert.equal(migrated.exerciseLearning['04.01'].demonstratedEvidence, undefined);
    assert.deepEqual(JSON.parse(JSON.stringify(migrated.completed)), ['04.01']);
    assert.deepEqual(JSON.parse(JSON.stringify(migrated.answers)), {'04.01': true});
    assert.equal(migrated.exerciseDrafts['04.01'], 'draft');
    assert.deepEqual(learning.DevPathProgressMigrations.migrateLegacyLearning(migrated, catalog, assessments), migrated);
});

test('saved declared transfers stored as demonstrated load as transfer-declared, not demonstrated', () => {
    const learning = {};
    vm.runInNewContext(readFileSync('public/learning-progress.js', 'utf8'), learning);
    vm.runInNewContext(readFileSync('public/progress-migrations.js', 'utf8'), learning);
    const evidence = {attemptId: 'attempt-t', contentVersion: 1, assessmentVersion: 1, fingerprint: 'hash-a',
        source: 'rubric-declared', at: '2026-10-11T12:01:00.000Z', eventId: 'pass'};
    const saved = {exerciseLearning: {'04.01': {schemaVersion: 1, contentVersion: 1, assessmentVersion: 1, mode: 'recall',
        state: 'demonstrated', assisted: false, attemptId: 'attempt-t', attemptIndependent: true, currentFingerprint: 'hash-a',
        currentUpdatedAt: '2026-10-11T12:01:00.000Z', attemptHistory: [{attemptId: 'attempt-t', startedAt: '2026-10-11T12:00:00.000Z'}],
        verifiedEvidence: evidence, demonstratedEvidence: evidence, evidenceHistory: [evidence], events: []}}};
    const migrated = learning.DevPathProgressMigrations.migrateLegacyLearning(saved, [{id: '04.01', contentVersion: 1}],
        {assessment: {'04.01': {version: 1}}});
    assert.equal(migrated.exerciseLearning['04.01'].state, 'transfer-declared');
    assert.equal(migrated.exerciseLearning['04.01'].demonstratedEvidence, undefined);
    assert.equal(migrated.exerciseLearning['04.01'].transferEvidence.source, 'rubric-declared');
});
