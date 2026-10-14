import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.dirname(scriptDir);

function asList(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    return Object.entries(value).map(([id, item]) => (
      typeof item === 'object' && item !== null ? { id, ...item } : { id, value: item }
    ));
  }
  return [];
}

function assessmentFor(assessments, id) {
  if (Array.isArray(assessments)) return assessments.find((item) => item?.id === id);
  return assessments?.[id];
}

function hasValue(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
}

function isEmptyAssessment(assessment) {
  return !assessment
    || typeof assessment !== 'object'
    || Array.isArray(assessment)
    || Object.keys(assessment).length === 0;
}

function hasBehavioralTests(assessment) {
  return Boolean(
    hasValue(assessment?.testPath)
    || hasValue(assessment?.testPaths)
    || hasValue(assessment?.tests)
    || hasValue(assessment?.transfer?.testPath)
    || hasValue(assessment?.transfer?.testPaths)
    || hasValue(assessment?.local?.commands)
  );
}

function hasTypecheckCapability(assessment) {
  return assessment?.environment === 'typescript'
    && (hasValue(assessment?.entryPath) || hasValue(assessment?.tsconfigPath));
}

function executableCapability(assessment) {
  if (hasBehavioralTests(assessment)) return 'tests';
  if (hasTypecheckCapability(assessment)) return 'typecheck';
  return null;
}

const runtimeEvidenceSources = new Set(['browser', 'local']);
const runtimeResultKinds = new Set(['passed', 'failed', 'type-error', 'error', 'timeout', 'cancelled']);
const sha256Pattern = /^[a-f\d]{64}$/i;

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sameCommands(actual, declared) {
  return Array.isArray(actual) && Array.isArray(declared)
    && stableJson(actual) === stableJson(declared);
}

function isReferenceVerification(record, assessment) {
  const verification = record?.verification;
  if (!verification || verification.scope !== 'reference-verification') return false;
  if (record.source === 'browser') {
    return verification.kind === 'browser-reference'
      && typeof verification.browser === 'string' && verification.browser.trim().length > 0
      && typeof verification.version === 'string' && verification.version.trim().length > 0;
  }
  return verification.kind === 'local-reference'
    && verification.tempCopy === true
    && verification.referenceDir === assessment?.referenceDir
    && sameCommands(verification.commands, assessment?.local?.commands)
    && Number.isInteger(verification.exitCode)
    && typeof verification.timedOut === 'boolean'
    && typeof verification.runtime === 'string' && verification.runtime.trim().length > 0;
}

function asEvidenceList(evidence) {
  if (Array.isArray(evidence)) return evidence;
  if (evidence && typeof evidence === 'object') {
    return Object.entries(evidence).map(([activityId, entries]) => ({
      activityId,
      entries: Array.isArray(entries) ? entries : [entries],
    }));
  }
  return [];
}

async function normalizeExecutionEvidence(evidence, catalog, assessments, assessmentApi) {
  const catalogById = new Map(asList(catalog).filter(item => typeof item?.id === 'string').map(item => [item.id, item]));
  const byActivity = new Map();
  const rejected = [];
  const reject = (activityId, reason) => rejected.push({activityId: typeof activityId === 'string' ? activityId : null, reason});
  const records = [];

  for (const entry of asEvidenceList(evidence)) {
    if (entry && typeof entry === 'object' && Array.isArray(entry.entries)) {
      for (const nested of entry.entries) records.push({activityId: entry.activityId, ...nested});
    } else records.push(entry);
  }

  for (const record of records) {
    const activityId = record?.activityId ?? record?.id;
    const item = catalogById.get(activityId);
    const assessment = assessmentFor(assessments, activityId);
    const result = record?.result;
    if (!item || !assessment) { reject(activityId, 'unknown-activity'); continue; }
    if (!result || typeof result !== 'object' || Array.isArray(result)) { reject(activityId, 'missing-result'); continue; }
    if (!runtimeEvidenceSources.has(record.source) || result.source !== record.source) { reject(activityId, 'invalid-source'); continue; }
    if (!runtimeResultKinds.has(result.kind)) { reject(activityId, 'invalid-result-kind'); continue; }
    const fingerprint = record.fingerprint;
    if (typeof fingerprint !== 'string' || !sha256Pattern.test(fingerprint)) {
      reject(activityId, 'fingerprint-mismatch'); continue;
    }
    const files = record.files;
    if (!Array.isArray(files) || !files.length || files.some(file => !file || typeof file.path !== 'string' || !file.path || typeof file.content !== 'string')) {
      reject(activityId, 'missing-files'); continue;
    }
    if (record.contentVersion !== (item.contentVersion ?? 1)
      || record.assessmentVersion !== assessment.version) {
      reject(activityId, 'stale-version'); continue;
    }
    if (record.variantId !== undefined && record.variantId !== null && record.variantId !== assessment.transfer?.id) {
      reject(activityId, 'unknown-variant'); continue;
    }
    let recomputedFingerprint;
    try {
      recomputedFingerprint = await assessmentApi.canonicalFingerprint({
        activityId,
        contentVersion: record.contentVersion,
        assessmentVersion: record.assessmentVersion,
        assessment,
        files,
        variantId: record.variantId ?? null,
      });
    } catch {
      reject(activityId, 'fingerprint-mismatch'); continue;
    }
    if (recomputedFingerprint !== fingerprint || result.fingerprint !== recomputedFingerprint
      || (record.expectedFingerprint !== undefined && record.expectedFingerprint !== recomputedFingerprint)) {
      reject(activityId, 'fingerprint-mismatch'); continue;
    }
    if (!isReferenceVerification(record, assessment)) { reject(activityId, 'invalid-verification'); continue; }
    const verification = record.verification;
    if (record.source === 'local' && ((result.kind === 'passed' && verification.exitCode !== 0)
      || (result.kind === 'timeout' && verification.timedOut !== true))) { reject(activityId, 'invalid-verification'); continue; }
    const normalized = {
      source: record.source,
      fingerprint,
      contentVersion: record.contentVersion,
      assessmentVersion: record.assessmentVersion,
      kind: result.kind,
      verification: {scope: 'reference-verification', kind: record.verification.kind},
      ...(result.tests && Number.isFinite(result.tests.total) && Number.isFinite(result.tests.passed) && Number.isFinite(result.tests.failed)
        ? {tests: {passed: result.tests.passed, failed: result.tests.failed, total: result.tests.total}}
        : {}),
      ...(Array.isArray(result.diagnostics) ? {diagnostics: result.diagnostics} : {}),
    };
    const current = byActivity.get(activityId) ?? [];
    current.push(normalized);
    byActivity.set(activityId, current);
  }
  return {byActivity, rejected};
}

function normalizeAssessment(assessment, catalogItem, executionResults = []) {
  if (isEmptyAssessment(assessment)) return { status: 'missing', source: 'none', coverage: 'none' };
  const declarationSource = assessment.environment === 'rubric' || hasValue(assessment.rubric)
    ? 'rubric-declared'
    : 'local-declared';
  const capability = executableCapability(assessment);
  return {
    status: 'covered',
    source: executionResults.at(-1)?.source ?? declarationSource,
    declarationSource,
    coverage: executionResults.length ? 'executed' : 'declared',
    environment: assessment.environment ?? null,
    version: assessment.version ?? null,
    ...(capability ? { capability } : {}),
    ...(assessment.testPath ? { testPath: assessment.testPath } : {}),
    ...(Array.isArray(assessment.testPaths) ? {testPaths: assessment.testPaths} : {}),
    ...(assessment.rubric ? { rubric: assessment.rubric } : {}),
    ...(assessment.referenceDir ? { referenceDir: assessment.referenceDir } : {}),
    ...(assessment.transfer ? {transfer: {
      id: assessment.transfer.id ?? null,
      testPath: assessment.transfer.testPath ?? null,
      testPaths: assessment.transfer.testPaths ?? [],
      rubric: assessment.transfer.rubric ?? [],
      files: Array.isArray(assessment.transfer.files) ? assessment.transfer.files.map(file => file.path).filter(Boolean) : [],
    }} : {}),
    ...(assessment.local ? {checkpoint: {
      commands: assessment.local.commands ?? [],
      evidence: assessment.local.evidence ?? [],
    }} : {}),
    ...(executionResults.length ? {executionResults} : {}),
    ...(catalogItem.autoTested === true && !hasBehavioralTests(assessment) ? { inconsistent: true } : {}),
  };
}

export async function collectLearningCoverage({ catalog = [], assessments = {}, executionEvidence = [], assessmentApi } = {}) {
  const normalizedEvidence = asEvidenceList(executionEvidence).length
    ? await normalizeExecutionEvidence(executionEvidence, catalog, assessments, assessmentApi ?? loadAssessmentApi())
    : {byActivity: new Map(), rejected: []};
  const activities = asList(catalog).map((item) => {
    const assessment = assessmentFor(assessments, item.id);
    const normalizedAssessment = normalizeAssessment(assessment, item, normalizedEvidence.byActivity.get(item.id) ?? []);
    const stage = item.stage ?? (String(item.id ?? '').split('.')[0] || 'unknown');
    return {
      id: item.id,
      stage,
      kind: item.kind ?? null,
      runtime: item.runtime ?? null,
      // The published learning graph is additive: stage 03 keeps its authored
      // textual `requires`, while reports consume learner-facing activity IDs.
      prerequisites: item.learningMetadata?.requires ?? item.requires ?? item.prerequisites ?? item.prereqs ?? [],
      hints: item.hints ?? item.tips ?? [],
      assessment: normalizedAssessment,
      reference: normalizedAssessment.referenceDir ?? null,
      resources: item.resources ?? [],
    };
  });

  const missing = [];
  for (const [index, item] of asList(catalog).entries()) {
    const assessment = assessmentFor(assessments, item.id);
    if (isEmptyAssessment(assessment)) missing.push({ id: item.id, reason: 'missing-assessment' });
    else if (item.autoTested === true && !hasBehavioralTests(assessment)) {
      missing.push({ id: item.id, reason: 'autoTested-without-tests' });
    }
    if (item.id == null) missing.push({ index, stage: item.stage ?? 'unknown', reason: 'missing-id' });
  }

  const stageMap = new Map();
  for (const item of activities) {
    const stage = String(item.stage ?? item.id ?? '').split('.')[0] || 'unknown';
    const current = stageMap.get(stage) ?? { id: stage, activities: 0, covered: 0, missing: 0 };
    current.activities += 1;
    if (item.assessment.status === 'covered' && !item.assessment.inconsistent) current.covered += 1;
    stageMap.set(stage, current);
  }
  for (const item of missing) {
    const stage = String(item.stage ?? item.id ?? '').split('.')[0] || 'unknown';
    const current = stageMap.get(stage) ?? { id: stage, activities: 0, covered: 0, missing: 0 };
    current.missing += 1;
    stageMap.set(stage, current);
  }

  const missingIds = new Set(missing.map((item) => item.id));
  const covered = activities.filter((item) => !missingIds.has(item.id)).length;
  return {
    activities,
    stages: [...stageMap.values()].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })),
    missing,
    metadata: {
      activityCount: activities.length,
      coveredCount: covered,
      missingCount: missing.length,
      declaredCount: activities.filter((item) => item.assessment.coverage === 'declared').length,
      localDeclaredCount: activities.filter((item) => item.assessment.declarationSource === 'local-declared').length,
      rubricDeclaredCount: activities.filter((item) => item.assessment.declarationSource === 'rubric-declared').length,
      executedCount: activities.filter((item) => item.assessment.coverage === 'executed').length,
      browserExecutedCount: activities.filter((item) => item.assessment.executionResults?.some(result => result.source === 'browser')).length,
      localExecutedCount: activities.filter((item) => item.assessment.executionResults?.some(result => result.source === 'local')).length,
      executionResultCount: activities.reduce((sum, item) => sum + (item.assessment.executionResults?.length ?? 0), 0),
      rejectedExecutionEvidenceCount: normalizedEvidence.rejected.length,
      rejectedExecutionEvidence: normalizedEvidence.rejected,
      stageCount: stageMap.size,
      generatedAt: new Date().toISOString(),
    },
  };
}

function readJson(rootDir, relativePath, { optional = false } = {}) {
  const absolutePath = path.resolve(rootDir, relativePath);
  let content;
  try {
    content = fs.readFileSync(absolutePath, 'utf8');
  } catch (error) {
    if (optional && error?.code === 'ENOENT') return undefined;
    throw new Error(`Unable to read JSON ${relativePath}: ${error.message}`);
  }
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid JSON in ${relativePath}: ${error.message}`);
  }
}

export function loadCatalog(rootDir = projectDir) {
  const catalog = readJson(rootDir, 'public/course-catalog.json');
  const resolved = asList(readJson(rootDir, 'course-src/.generated/resolved_preview.json', { optional: true }) ?? []);
  const resolvedById = new Map(resolved.map((item) => [item.id, item]));
  return asList(catalog).map((item) => {
    if (item.requires !== undefined) return item;
    const resolvedItem = resolvedById.get(item.id);
    return resolvedItem?.requires === undefined ? item : { ...item, requires: resolvedItem.requires };
  });
}

export function loadAssessmentApi(rootDir = projectDir) {
  const sourcePath = path.join(rootDir, 'public', 'course-assessment.js');
  const source = fs.readFileSync(sourcePath, 'utf8');
  const scope = {TextEncoder, crypto: webcrypto};
  scope.window = scope;
  vm.runInNewContext(source, scope, {filename: sourcePath});
  if (typeof scope.DevPathAssessment?.canonicalFingerprint !== 'function') {
    throw new Error('The published assessment fingerprint API is unavailable.');
  }
  return scope.DevPathAssessment;
}

export function loadAssessments(rootDir = projectDir) {
  const publicManifest = readJson(rootDir, 'public/course-assessments.json', { optional: true });
  if (publicManifest !== undefined) return publicManifest;
  const manifest = readJson(rootDir, 'course-src/assessments.json', { optional: true });
  if (manifest !== undefined) return manifest;
  const tests = readJson(rootDir, 'public/course-tests.json', { optional: true }) ?? {};
  return Object.fromEntries(Object.entries(tests).map(([id]) => [id, {
    environment: 'javascript', version: 1, testPath: `course-src/tests/${id}.test.js`,
  }]));
}

export function formatLearningCoverage(result) {
  const lines = [
    `Cobertura: ${result.metadata.activityCount} atividades; ${result.metadata.coveredCount} declaradas; ${result.metadata.executedCount} com execução válida; ${result.metadata.missingCount} lacunas.`,
    `Declarações: ${result.metadata.localDeclaredCount} locais; ${result.metadata.rubricDeclaredCount} rubricas.`,
    `Execuções: ${result.metadata.browserExecutedCount} no navegador; ${result.metadata.localExecutedCount} locais; ${result.metadata.executionResultCount} resultados; ${result.metadata.rejectedExecutionEvidenceCount} evidências rejeitadas.`,
    '',
    'Atividade | ambiente | cobertura | fonte | resultado | referência | transferência | checkpoint',
  ];
  for (const activity of result.activities) {
    const assessment = activity.assessment;
    const reference = assessment.referenceDir ?? '—';
    const transfer = assessment.transfer?.id ?? '—';
    const checkpoint = assessment.checkpoint ? `${assessment.checkpoint.commands.length} comando(s)` : '—';
    const result = assessment.executionResults?.map(item => item.kind).join(', ') ?? '—';
    lines.push(`${activity.id} | ${assessment.environment ?? '—'} | ${assessment.coverage} | ${assessment.source} | ${result} | ${reference} | ${transfer} | ${checkpoint}`);
  }
  if (result.missing.length) {
    lines.push('', 'Lacunas:');
    for (const item of result.missing) lines.push(`- ${item.id ?? `índice ${item.index}`}: ${item.reason}`);
  }
  return `${lines.join('\n')}\n`;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    const rootIndex = args.indexOf('--root');
    const rootArg = rootIndex === -1 ? projectDir : args[rootIndex + 1];
    if (!rootArg || rootArg.startsWith('--')) throw new Error('--root requires a directory');
    const rootDir = path.resolve(rootArg);
    const evidenceIndex = args.indexOf('--evidence');
    const evidencePath = evidenceIndex === -1 ? null : args[evidenceIndex + 1];
    if (evidenceIndex !== -1 && (!evidencePath || evidencePath.startsWith('--'))) throw new Error('--evidence requires a JSON file');
    const jsonPath = evidencePath ? path.resolve(rootDir, evidencePath) : null;
    const executionEvidence = jsonPath ? readJson(path.dirname(jsonPath), path.basename(jsonPath)) : [];
    const result = await collectLearningCoverage({
      catalog: loadCatalog(rootDir),
      assessments: loadAssessments(rootDir),
      executionEvidence,
      assessmentApi: asEvidenceList(executionEvidence).length ? loadAssessmentApi(rootDir) : undefined,
    });
    process.stdout.write(args.includes('--json') ? `${JSON.stringify(result, null, 2)}\n` : formatLearningCoverage(result));
  } catch (error) {
    process.stderr.write(`Learning coverage report failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}
