import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { collectLearningCoverage, formatLearningCoverage, loadAssessmentApi } from './report-learning-coverage.mjs';

const reportScript = fileURLToPath(new URL('./report-learning-coverage.mjs', import.meta.url));
const assessmentApi = loadAssessmentApi();

async function evidenceFor({activityId, contentVersion, assessmentVersion, assessment, source = 'browser', resultKind = 'passed', files = [{path: 'main.ts', content: 'export const value = 1;'}], variantId = null, verification}) {
  const fingerprint = await assessmentApi.canonicalFingerprint({activityId, contentVersion, assessmentVersion, assessment, files, variantId});
  return {
    activityId, contentVersion, assessmentVersion, source, fingerprint, files, variantId,
    result: {kind: resultKind, source, fingerprint},
    verification: verification ?? {scope: 'reference-verification', kind: 'browser-reference', browser: 'Chromium', version: 'fixture'},
  };
}

function withFixtureRoot(callback) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'learning-coverage-'));
  fs.mkdirSync(path.join(root, 'public'), { recursive: true });
  fs.mkdirSync(path.join(root, 'course-src', '.generated'), { recursive: true });
  return Promise.resolve().then(() => callback(root)).finally(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });
}

function writeJson(root, relativePath, value) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${JSON.stringify(value)}\n`);
}

function runReport(root, evidencePath) {
  return spawnSync(process.execPath, [reportScript, '--json', '--root', root, ...(evidencePath ? ['--evidence', evidencePath] : [])], {
    encoding: 'utf8',
  });
}

test('reports a MAKE activity without a test as a coverage gap', async () => {
  const result = await collectLearningCoverage({
    catalog: [{
      id: '11.01',
      stage: '11',
      kind: 'MAKE',
      runtime: 'javascript',
      requires: ['dom.event_bubbling'],
      hints: ['Leia o contrato'],
      resources: ['docs/11.md'],
    }],
    assessments: {},
  });

  assert.equal(result.activities.length, 1);
  assert.equal(result.activities[0].id, '11.01');
  assert.ok(result.missing.some((item) => item.id === '11.01' && item.reason === 'missing-assessment'));
});

test('uses published prerequisite and solution reference fields', async () => {
  const result = await collectLearningCoverage({
    catalog: [{
      id: '11.02',
      stage: '11',
      kind: 'MAKE',
      runtime: 'Navegadores evergreen',
      requires: ['dom.event_bubbling'],
      resources: ['DOM guide, not a solution'],
      hints: ['Compare a ordem'],
    }],
    assessments: {
      '11.02': {
        environment: 'local',
        version: 2,
        checks: ['behavior'],
        referenceDir: 'course-src/tests/11.02.test.js',
      },
    },
  });

  assert.deepEqual(result.activities[0].prerequisites, ['dom.event_bubbling']);
  assert.equal(result.activities[0].reference, 'course-src/tests/11.02.test.js');
  assert.deepEqual(result.activities[0].resources, ['DOM guide, not a solution']);
  assert.equal(result.activities[0].assessment.source, 'local-declared');
  assert.equal(result.activities[0].assessment.coverage, 'declared');
  assert.equal(result.missing.length, 0);
});

test('prefers the additive learner activity graph over a dedicated textual requires field', async () => {
  const result = await collectLearningCoverage({
    catalog: [{
      id: '03.04', stage: '03', kind: 'TRACE',
      requires: ['Operadores e comparações da Etapa 02'],
      learningMetadata: {requires: ['02.01']},
      hints: [],
    }],
    assessments: {},
  });

  assert.deepEqual(result.activities[0].prerequisites, ['02.01']);
});

test('treats an empty assessment object as a coverage gap', async () => {
  const result = await collectLearningCoverage({
    catalog: [{ id: '11.03', kind: 'MAKE', runtime: 'javascript' }],
    assessments: { '11.03': {} },
  });

  assert.equal(result.activities[0].assessment.status, 'missing');
  assert.ok(result.missing.some((item) => item.id === '11.03' && item.reason === 'missing-assessment'));
});

test('keeps a READ rubric as an editorial assessment', async () => {
  const result = await collectLearningCoverage({
    catalog: [{ id: '12.02', stage: '12', kind: 'READ', runtime: 'local', reference: 'docs/12.md' }],
    assessments: {
      '12.02': { environment: 'rubric', version: 1, rubric: ['Explique a decisão com evidência'] },
    },
  });

  assert.equal(result.activities[0].assessment.status, 'covered');
  assert.equal(result.activities[0].assessment.source, 'rubric-declared');
  assert.equal(result.activities[0].assessment.coverage, 'declared');
  assert.equal(result.activities[0].assessment.environment, 'rubric');
  assert.deepEqual(result.activities[0].assessment.rubric, ['Explique a decisão com evidência']);
  assert.equal(result.missing.length, 0);
});

test('flags autoTested metadata that has no executable tests', async () => {
  const result = await collectLearningCoverage({
    catalog: [{ id: '13.03', stage: '13', kind: 'MAKE', autoTested: true, runtime: 'javascript' }],
    assessments: { '13.03': { environment: 'javascript', version: 1 } },
  });

  assert.ok(result.missing.some((item) => item.id === '13.03' && item.reason === 'autoTested-without-tests'));
});

test('does not infer execution from manifest metadata', async () => {
  const result = await collectLearningCoverage({
    catalog: [{ id: '14.01', kind: 'MAKE', autoTested: true }],
    assessments: {
      '14.01': {
        environment: 'javascript',
        coverage: 'executed',
        result: { kind: 'passed' },
        testPath: 'tests/14.01.test.js',
      },
    },
  });

  assert.equal(result.activities[0].assessment.coverage, 'declared');
  assert.equal(result.metadata.executedCount, 0);
});

test('checks alone do not declare executable tests', async () => {
  const result = await collectLearningCoverage({
    catalog: [{ id: '14.02', kind: 'MAKE', autoTested: true }],
    assessments: { '14.02': { environment: 'javascript', checks: ['behavior'] } },
  });

  assert.ok(result.missing.some((item) => item.id === '14.02' && item.reason === 'autoTested-without-tests'));
});

test('typecheck capability needs an explicit TypeScript entry or config and does not replace behavior tests', async () => {
  const result = await collectLearningCoverage({
    catalog: [
      { id: '14.03', kind: 'MAKE' },
      { id: '14.04', kind: 'MAKE', autoTested: true },
    ],
    assessments: {
      '14.03': { environment: 'typescript', checks: ['types'], tsconfigPath: 'tsconfig.json' },
      '14.04': { environment: 'typescript', checks: ['types'] },
    },
  });

  assert.equal(result.activities[0].assessment.capability, 'typecheck');
  assert.ok(result.missing.some((item) => item.id === '14.04' && item.reason === 'autoTested-without-tests'));
});

test('CLI uses requires fallback and test manifest fallback without claiming execution', async () => {
  await withFixtureRoot((root) => {
    writeJson(root, 'public/course-catalog.json', [{
      id: '15.01', stage: '15', kind: 'MAKE', runtime: 'javascript', resources: ['docs'],
    }]);
    writeJson(root, 'course-src/.generated/resolved_preview.json', [{
      id: '15.01', requires: ['functions.return'],
    }]);
    writeJson(root, 'public/course-tests.json', { '15.01': 'fixture source' });

    const run = runReport(root);
    assert.equal(run.status, 0, run.stderr);
    const report = JSON.parse(run.stdout);
    assert.deepEqual(report.activities[0].prerequisites, ['functions.return']);
    assert.equal(report.activities[0].assessment.testPath, 'course-src/tests/15.01.test.js');
    assert.equal(report.metadata.declaredCount, 1);
    assert.equal(report.metadata.executedCount, 0);
  });
});

test('CLI accepts a valid manifest and rejects a corrupt present manifest', async () => {
  await withFixtureRoot((root) => {
    writeJson(root, 'public/course-catalog.json', [{ id: '15.02', stage: '15', kind: 'READ' }]);
    writeJson(root, 'course-src/.generated/resolved_preview.json', []);
    writeJson(root, 'course-src/assessments.json', {
      '15.02': { environment: 'rubric', version: 1, rubric: ['evidência'] },
    });

    const valid = runReport(root);
    assert.equal(valid.status, 0, valid.stderr);
    assert.equal(JSON.parse(valid.stdout).metadata.declaredCount, 1);

    fs.writeFileSync(path.join(root, 'course-src', 'assessments.json'), '{"15.02":');
    const invalid = runReport(root);
    assert.notEqual(invalid.status, 0);
    assert.match(invalid.stderr, /Invalid JSON.*course-src[\\/]assessments\.json/);
  });
});

test('counts only current browser and local runtime results with matching canonical fingerprints', async () => {
  const catalog = [
    {id: '15.01', stage: '15', kind: 'MAKE', contentVersion: 2},
    {id: '15.02', stage: '15', kind: 'PROJECT', contentVersion: 1},
  ];
  const assessments = {
    '15.01': {environment: 'typescript', version: 3, referenceDir: 'solutions/15.01', testPaths: ['tests/15.01.types.ts'], transfer: {id: '15.01-transfer', files: [{path: 'transfer.ts', content: 'export {}'}], rubric: ['Prove a variante.']}},
    '15.02': {environment: 'local', version: 2, referenceDir: 'solutions/15.02', local: {commands: [['node', '--test']], evidence: ['stdout']}},
  };
  const browser = await evidenceFor({activityId: '15.01', contentVersion: 2, assessmentVersion: 3, assessment: assessments['15.01']});
  const local = await evidenceFor({
    activityId: '15.02', contentVersion: 1, assessmentVersion: 2, assessment: assessments['15.02'], source: 'local',
    verification: {scope: 'reference-verification', kind: 'local-reference', tempCopy: true, referenceDir: 'solutions/15.02', commands: [['node', '--test']], exitCode: 0, timedOut: false, runtime: 'Node 24.19'},
  });
  const executionEvidence = [
    {...browser, expectedFingerprint: browser.fingerprint, result: {...browser.result, tests: {passed: 1, failed: 0, total: 1}}},
    local,
  ];
  const report = await collectLearningCoverage({catalog, assessments, executionEvidence, assessmentApi});

  assert.equal(report.metadata.executedCount, 2);
  assert.equal(report.metadata.browserExecutedCount, 1);
  assert.equal(report.metadata.localExecutedCount, 1);
  assert.equal(report.metadata.executionResultCount, 2);
  assert.equal(report.activities[0].assessment.coverage, 'executed');
  assert.equal(report.activities[0].assessment.declarationSource, 'local-declared');
  assert.equal(report.activities[0].assessment.source, 'browser');
  assert.equal(report.activities[0].assessment.executionResults[0].fingerprint, browser.fingerprint);
  assert.deepEqual(report.activities[0].assessment.testPaths, ['tests/15.01.types.ts']);
  assert.equal(report.activities[0].assessment.transfer.id, '15.01-transfer');
  assert.deepEqual(report.activities[1].assessment.checkpoint.commands, [['node', '--test']]);
  assert.match(formatLearningCoverage(report), /15\.01 \| typescript \| executed/);
});

test('rejects unknown, declared-only, unsupported, mismatched, labeled, and stale execution evidence', async () => {
  const catalog = [{id: '15.03', stage: '15', kind: 'MAKE', contentVersion: 4}];
  const assessments = {'15.03': {environment: 'javascript', version: 7, testPath: 'tests/15.03.test.js'}};
  const valid = await evidenceFor({activityId: '15.03', contentVersion: 4, assessmentVersion: 7, assessment: assessments['15.03']});
  const executionEvidence = [
    {...valid, activityId: '99.99'},
    {...valid, source: 'local-declared', result: {...valid.result, source: 'local-declared'}},
    {...valid, result: {...valid.result, kind: 'unsupported'}},
    {...valid, fingerprint: 'd'.repeat(64)},
    {...valid, result: {...valid.result, fingerprint: 'd'.repeat(64)}},
    {...valid, fingerprint: 'parent-task9-ref23.03', result: {...valid.result, fingerprint: 'parent-task9-ref23.03'}},
    {...valid, assessmentVersion: 6},
    {...valid, contentVersion: 3},
    {...valid, verification: {scope: 'learner-declaration', kind: 'local-reference'}},
    {...valid, files: []},
  ];
  const report = await collectLearningCoverage({catalog, assessments, executionEvidence, assessmentApi});

  assert.equal(report.metadata.executedCount, 0);
  assert.equal(report.metadata.executionResultCount, 0);
  assert.equal(report.metadata.rejectedExecutionEvidenceCount, executionEvidence.length);
  assert.equal(report.activities[0].assessment.coverage, 'declared');
  assert.deepEqual(new Set(report.metadata.rejectedExecutionEvidence.map(item => item.reason)), new Set([
    'unknown-activity', 'invalid-source', 'invalid-result-kind', 'fingerprint-mismatch', 'stale-version', 'invalid-verification', 'missing-files',
  ]));
});

test('CLI consumes evidence files and exposes valid and rejected counts', async () => {
  await withFixtureRoot(async (root) => {
    writeJson(root, 'public/course-catalog.json', [{id: '15.04', stage: '15', kind: 'MAKE', contentVersion: 1}]);
    const assessment = {environment: 'javascript', version: 2, testPath: 'tests/15.04.test.js'};
    writeJson(root, 'course-src/assessments.json', {'15.04': assessment});
    fs.copyFileSync(fileURLToPath(new URL('../public/course-assessment.js', import.meta.url)), path.join(root, 'public', 'course-assessment.js'));
    const evidence = await evidenceFor({activityId: '15.04', contentVersion: 1, assessmentVersion: 2, assessment});
    writeJson(root, 'execution.json', [evidence]);

    const run = runReport(root, 'execution.json');
    assert.equal(run.status, 0, run.stderr);
    const report = JSON.parse(run.stdout);
    assert.equal(report.metadata.executedCount, 1);
    assert.equal(report.metadata.rejectedExecutionEvidenceCount, 0);
  });
});
