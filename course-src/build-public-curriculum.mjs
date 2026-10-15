import assert from 'node:assert/strict';
import {loadVariantBank} from './variant-sources.mjs';
import {createHash} from 'node:crypto';
import {existsSync, readFileSync, readdirSync, writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {stage00} from './stage00-preparation.mjs';
import {stage01Preparation} from './stage01-preparation.mjs';
import {stage03Contracts} from './stage03-contract.mjs';
import {diagnosticPreparation} from './diagnostic-preparation.mjs';
import {guidedPreparation, distinctFirstAction} from './guided-preparation.mjs';
import {validateLearningMetadata, validateRuntimeFeatureMatrix} from '../scripts/learning-metadata.mjs';
import {validateVariantBank} from '../scripts/validate-course-catalog.mjs';

const project = new URL('../', import.meta.url);

// Learner-facing interaction per activity kind. Used where the recorded interaction
// describes another kind's activity (see INTERACTION_FROM_KIND).
const KIND_INTERACTION = {
  MODIFY: 'Edite o código no editor, registre cada alteração e confira os casos públicos depois de executar.',
  PREDICT: 'Registre sua previsão em campos de texto antes de executar e compare-a com o resultado depois.',
  PROJECT: 'Construa a solução no editor, guiado pelos checkpoints, e registre a evidência de cada um.',
  DEBUG: 'Localize o defeito, corrija o código no editor e confira os casos antes e depois da correção.',
  TYPE: 'Escreva as anotações de tipo no editor e confira os diagnósticos do compilador em texto.',
  READ: 'Leia o trecho indicado e responda às perguntas com base no texto, citando a linha ou o campo.',
};
const INTERACTION_FROM_KIND = new Set(['16.10', '17.01', '17.08', '19.04', '19.05', '19.07']);
// Investigações opcionais de código alheio (Fase 6, item 6.4), publicadas depois do núcleo existente.
const INVESTIGATION_IDS_6_4 = new Set(['07.15', '11.15', '14.23', '18.11']);
const interactionFor = (id, kind, recorded) => (INTERACTION_FROM_KIND.has(id) && KIND_INTERACTION[kind]) || recorded;
const json = name => JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8'));
const bundle = (variable, value, source) => `// Generated from ${source}; edit the editorial source.\nglobalThis.${variable} = ${JSON.stringify(value, null, 2)};\n`;
const readVirtualFiles = relativeDirectory => {
  const base = new URL(`${relativeDirectory.replaceAll('\\', '/')}/`, project);
  const visit = (directory, prefix = '') => readdirSync(new URL(prefix, directory), {withFileTypes: true}).flatMap(entry => {
    const relative = prefix ? `${prefix}${entry.name}` : entry.name;
    if (entry.isDirectory()) return visit(directory, `${relative}/`);
    return {path: relative, content: readFileSync(new URL(relative, directory), 'utf8')};
  });
  return visit(base);
};
const isTestPath = path => /(?:^|\/)(?:test|tests)\//i.test(path) || /\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(path);

// Fase 6 (6.1): the variant bank is validated against the compiled activity order and the concept graph, then published
// deterministically (sorted by variantId, fixed key order, file maps as sorted {path, content} lists).
const VARIANT_TEST_PATH = '__devpath_variant_tests__.js';
const fileList = map => Object.keys(map).sort().map(path => ({path, content: map[path]}));
export function publishVariantBank(bank, records, conceptGraph) {
  const concepts = new Map(conceptGraph.concepts.map(concept => [concept.id, concept]));
  validateVariantBank(bank, {activities: records.map(record => ({id: record.id, stage: record.stage})), concepts});
  const variants = [...bank.variants].sort((a, b) => (a.variantId < b.variantId ? -1 : a.variantId > b.variantId ? 1 : 0)).map(variant => {
    const base = {
      variantId: variant.variantId, conceptId: variant.conceptId, sourceActivityId: variant.sourceActivityId,
      prerequisites: [...variant.prerequisites], format: variant.format, environment: variant.environment, evaluator: variant.evaluator,
      bands: [...variant.bands], transferDecision: variant.transferDecision, contentVersion: variant.contentVersion, prompt: variant.prompt,
    };
    if (variant.format === 'choice-predict') {
      return {...base, ...(variant.code ? {code: variant.code} : {}), choices: [...variant.choices], answer: variant.answer, feedback: {correct: variant.feedback.correct, byChoice: {...variant.feedback.byChoice}}};
    }
    if (variant.format === 'predict-code') return {...base, code: variant.code, expectedOutput: variant.expectedOutput};
    return {
      ...base, entryPath: variant.entryPath, testPath: VARIANT_TEST_PATH, tests: variant.tests,
      starterFiles: fileList(variant.starterFiles), correctFiles: fileList(variant.correctFiles),
      mutants: variant.mutants.map(mutant => ({id: mutant.id, files: fileList(mutant.files)})),
    };
  });
  return {version: bank.version, variants};
}

// Reads compiled curriculum data and editorial inputs; regeneration never
// depends on another checkout or on a previous public catalog.
export function createCourseArtifacts() {
  const records = json('.generated/resolved_preview.json');
  const overrides = json('publication-overrides.json');
  const learningMetadata = Object.fromEntries(Object.entries(json('learning-metadata.json')).filter(([key]) => key !== '_comment'));
  const runtimeBaseline = json('runtime-baseline.json');
  const featureMatrix = json('feature-matrix.json');
  const starterManifest = json('starters/manifest.json');
  const assessments = Object.fromEntries(Object.entries(json('assessments.json')).filter(([key]) => key !== '_comment'));
  for (const id of Object.keys(starterManifest)) {
    assert(!overrides[id]?.starterFiles, `${id} has real files in starters/; remove starterFiles from publication-overrides.json`);
  }
  const withoutComment = file => Object.fromEntries(Object.entries(json(file)).filter(([key]) => key !== '_comment'));
  const primers = withoutComment('prerequisite-primers.json');
  const officialDocs = withoutComment('official-docs.json');
const isGenericActivity = record => Number(record.stage) >= 4 || (record.stage === '03' && !Object.hasOwn(stage03Contracts, record.id));
  for (const [id, docs] of Object.entries(officialDocs)) {
    assert(records.some(record => record.id === id), `Official docs for unknown activity ${id}`);
    for (const doc of docs) {
      assert(doc.length === 4 && doc.every(part => typeof part === 'string' && part.trim()), `Incomplete official doc for ${id}`);
      // guided-preparation splits "title: url. Seção: section. question" on the first ':' and the section's first '.'.
      assert(!doc[0].includes(':') && !/[:.]/.test(doc[2]) && /^https:\/\//.test(doc[1]), `Official doc of ${id}: no ':' in title, no ':' or '.' in section`);
    }
  }
  const recordIds = new Set(records.map(record => record.id));
  for (const [id, lines] of Object.entries(primers)) {
    const record = records.find(entry => entry.id === id);
    assert(record && isGenericActivity(record), `Primer for unknown or non-generic activity ${id}`);
    assert(Array.isArray(lines) && lines.length && lines.every(line => typeof line === 'string' && line.trim()), `Empty primer for ${id}`);
  }
  // Executable tests (tests/<id>.test.js) import the learner's ./main.js and use describe/test/expect.
  const courseTests = {};
  for (const file of readdirSync(new URL('tests/', import.meta.url)).filter(name => name.endsWith('.test.js')).sort()) {
    const id = file.replace('.test.js', '');
    const record = records.find(entry => entry.id === id);
    assert(record && isGenericActivity(record), `Tests for unknown or non-generic activity ${id}`);
    courseTests[id] = readFileSync(new URL(`tests/${file}`, import.meta.url), 'utf8').replaceAll('\r\n', '\n');
  }
  for (const file of readdirSync(new URL('tests/', import.meta.url)).filter(name => name.endsWith('.types.ts')).sort()) {
    const id = file.replace('.types.ts', '');
    assert(recordIds.has(id) && assessments[id]?.studentSuiteKind === 'types', `Type tests for unknown or non-typed-suite activity ${id}`);
    courseTests[id] = readFileSync(new URL(`tests/${file}`, import.meta.url), 'utf8').replaceAll('\r\n', '\n');
  }
  // Only tests the browser runner executes are published: local and rubric assessments are never run in the browser,
  // so their test files stay in the source tree and are verified by their own checkers.
  const runnerChecks = new Set(['behavior', 'mutation', 'types']);
  const publishedCourseTests = Object.fromEntries(Object.entries(courseTests).filter(([id]) => {
    const assessment = assessments[id];
    return Boolean(assessment) && !['local', 'rubric'].includes(assessment.environment) && (assessment.checks || []).some(check => runnerChecks.has(check));
  }));
  const validEnvironments = new Set(['javascript', 'typescript', 'dom', 'network', 'node-simulated', 'local', 'rubric']);
  const validChecks = new Set(['types', 'behavior', 'mutation', 'rubric', 'local']);
  // Editorial/rubric and local assessments are valid without an executable
  // browser suite; every executable suite still needs an explicit manifest.
  for (const id of Object.keys(courseTests)) assert(assessments[id], `Missing assessment: ${id}`);
  for (const [id, assessment] of Object.entries(assessments)) {
    assert(recordIds.has(id), `Assessment for unknown activity ${id}`);
    assert(validEnvironments.has(assessment.environment) && Number.isInteger(assessment.version) && assessment.version > 0, `Invalid assessment: ${id}`);
    assert(Array.isArray(assessment.checks) && assessment.checks.length && assessment.checks.every(check => validChecks.has(check)), `Invalid checks: ${id}`);
    for (const key of ['testPath', 'referenceDir', 'entryPath', 'typeEntryPath', 'tsconfigPath', 'fixturesPath']) {
      if (assessment[key] !== undefined) assert(typeof assessment[key] === 'string' && assessment[key] && !assessment[key].startsWith('/') && !assessment[key].includes('\\') && !/^[a-z]+:/i.test(assessment[key]) && !/(^|[\\/])\.\.([\\/]|$)/.test(assessment[key]), `Invalid assessment path ${id}.${key}`);
    }
    if (assessment.testPath) assert(existsSync(new URL(assessment.testPath, import.meta.url)), `Missing assessment test: ${id}`);
    if (assessment.referenceDir) assert(existsSync(new URL(assessment.referenceDir, import.meta.url)), `Missing assessment reference: ${id}`);
    if (assessment.expectedDiagnostics !== undefined) {
      assert(assessment.environment === 'typescript' && assessment.checks.includes('types') && Array.isArray(assessment.expectedDiagnostics), `Invalid expected diagnostics: ${id}`);
      assert(assessment.expectedDiagnostics.every(d => Number.isInteger(d?.code) && typeof d.file === 'string' && d.file && Number.isInteger(d.line) && d.line > 0), `Invalid expected diagnostics: ${id}`);
    }
    if (assessment.contractTypeFiles !== undefined) assert(Array.isArray(assessment.contractTypeFiles) && assessment.contractTypeFiles.length > 0 && assessment.contractTypeFiles.every(file => typeof file.path === 'string' && file.path.endsWith('.ts') && typeof file.content === 'string' && file.content.trim()), `Invalid protected type assertions: ${id}`);
    if (assessment.typeContractMutants !== undefined) assert(Array.isArray(assessment.typeContractMutants) && assessment.typeContractMutants.length > 0 && assessment.typeContractMutants.every(mutant => mutant && Array.isArray(mutant.files) && mutant.files.length > 0 && mutant.files.every(file => typeof file.path === 'string' && typeof file.content === 'string')), `Invalid TypeScript contract mutants: ${id}`);
    if (assessment.local !== undefined) {
      assert(Array.isArray(assessment.local.commands) && assessment.local.commands.length && assessment.local.commands.every(command => Array.isArray(command) && command.length && command.every(argument => typeof argument === 'string' && argument)), `Invalid local commands: ${id}`);
      assert(Array.isArray(assessment.local.evidence) && assessment.local.evidence.every(evidence => typeof evidence === 'string' && evidence.trim()), `Invalid local evidence: ${id}`);
    }
    if (assessment.rubric !== undefined) assert(Array.isArray(assessment.rubric) && assessment.rubric.length && assessment.rubric.every(line => typeof line === 'string' && line.trim()), `Invalid rubric: ${id}`);
    if (assessment.checks.includes('behavior') && !['local', 'rubric'].includes(assessment.environment)) assert(courseTests[id]?.trim() && (assessment.testPath || assessment.tests), `Assessment has no behavioral tests: ${id}`);
    if (assessment.environment === 'typescript' && assessment.checks.includes('behavior')) assert(assessment.checks.includes('types'), `TypeScript behavior requires types: ${id}`);
  }
  const teaching01 = JSON.parse(JSON.stringify(stage01Preparation));
  for (const p of Object.values(teaching01)) {
    for (const transfer of p.masteryTransfers || []) delete transfer.solution;
  }
  const text = readFileSync(new URL('bridges.md', import.meta.url), 'utf8');
  const headings = [...text.matchAll(/^## Ponte (\d{2})(?:–(\d{2}))? — ([^\r\n]+)$/gm)];
  const bridges = headings.map((m, i) => ({start: Number(m[1]), end: Number(m[2] || m[1]), title: m[3].trim(), text: text.slice(m.index + m[0].length, headings[i + 1]?.index ?? text.length).trim()}));
  const seen = new Set(), answerCounts = new Map(), investigationCounts = new Map();
  const existingChoiceCounts = new Map();
  for (const record of records) {
    const choices = record.platform?.active_recall?.choices?.length;
    if (choices && !INVESTIGATION_IDS_6_4.has(record.id)) existingChoiceCounts.set(choices, (existingChoiceCounts.get(choices) || 0) + 1);
  }
  const catalog = records.map(record => {
    const lesson = record.learner, recall = record.platform?.active_recall;
    const item = {
      id: record.id, title: record.title, stage: record.stage, kind: record.kind,
      contentVersion: record.content_version || 1, optional: record.optional,
      duration: `${record.estimated_minutes} min`, runtime: record.runtime, compatibility: record.compatibility,
      objective: lesson.first_response?.action, prompt: lesson.prompt,
      firstResponse: lesson.first_response, explanation: lesson.explanation,
      interaction: interactionFor(record.id, record.kind, lesson.interaction), resources: [...lesson.resources],
      starterFiles: lesson.starter_files,
      ...(lesson.read_only_files?.length ? {readOnlyFiles: lesson.read_only_files} : {}),
      assets: lesson.assets, examples: lesson.public_examples,
      checks: lesson.public_tests, constraints: lesson.constraints, rubric: lesson.visible_rubric,
      ...(learningMetadata[record.id] ? {learningMetadata: learningMetadata[record.id]} : {}),
      // Boundary rules are part of the public contract: tests may vary data, never invent unpublished behavior.
      ...(Number(record.stage) >= 4 ? {edgeCases: [...lesson.edge_contract]} : {}),
      // Short explanations of tools an activity uses before the stage that teaches them.
      ...(primers[record.id] ? {primers: [...primers[record.id]]} : {}),
      ...(lesson.preparation ? {preparation: lesson.preparation} : {}),
      ...(recall ? {review: {prompt: recall.prompt, choices: [...recall.choices], answer: recall.choices.indexOf(recall.answer), correctFeedback: recall.feedback_correct, incorrectFeedback: recall.feedback_incorrect}} : {}),
      ...overrides[record.id],
    };
    if (!seen.has(item.stage) && item.stage !== 'D') {
      const bridge = bridges.find(b => Number(item.stage) >= b.start && Number(item.stage) <= b.end);
      assert(bridge, `Missing bridge for ${item.id}`);
      item.stageBridge = bridge.text; item.stageBridgeTitle = bridge.title;
    }
    seen.add(item.stage);
    const bridge02 = bridges.find(b => b.start === 2)?.text || '';
    if (item.id === '02.01') item.resources.push(bridge02.split('### Ponte 02B')[0].trim());
    if (item.id === '02.10') item.resources.push(`Ponte 02B${bridge02.split('### Ponte 02B')[1] || ''}`);
    if (item.stage === '00') {
      const p = stage00[item.id]; assert(p, `Missing source: ${item.id}`);
      Object.assign(item, {
        contentVersion: Math.max(item.contentVersion, 4), title: p.title, objective: p.mental,
        prompt: p.prompt, interaction: p.response, preparation: p, rubric: p.rubric,
        resources: p.docs.map(doc => `${doc.title}: ${doc.url}. ${doc.task}`),
        firstResponse: {action: p.response, timing: p.mode === 'debug' ? 'Depois de ler a explicação e executar o arquivo intacto, antes da primeira alteração.' : p.mode === 'written' ? 'Depois de ler a explicação e o exemplo resolvido, antes de preencher sua análise.' : 'Depois de ler a explicação e o exemplo resolvido, antes de executar sua tentativa.'},
        explanation: {...item.explanation, mental_model: p.mental, worked_example: p.example.walkthrough.join(' ')},
        review: {...p.review, choices: [...p.review.choices]}, constraints: [],
        ...(p.starterFiles ? {starterFiles: p.starterFiles} : {}),
      });
    }
    if (item.stage === '01') {
      const p = teaching01[item.id];
      Object.assign(item, {preparation: p, hints: p.hints, transfer: p.transfer,
        runtime: 'Interpretador introdutório da Etapa 01',
        resources: p.docs.map(doc => `${doc.title}: ${doc.url}. Seção: ${doc.section}. ${doc.question}`)});
    }
    if (item.stage === '03') {
      const p = stage03Contracts[item.id];
      if (p) Object.assign(item, {
        contentVersion: 2, preparation: p, rubric: p.rubric,
        runtime: 'Interpretador didático da Etapa 03 (execução com limite de passos)',
        explanation: {mental_model: p.teaching.paragraphs.join(' '), worked_example: p.teaching.walkthrough.join(' '), common_trap: p.teaching.pitfall, why_it_matters: p.teaching.next},
        firstResponse: {...item.firstResponse, timing: 'Depois de estudar o exemplo, antes de executar a própria tentativa ou pedir dicas.'},
        interaction: item.id === '03.03' ? 'Ordene os blocos com os botões subir/descer, acessíveis por teclado; confira o FizzBuzz gerado.' : item.id === '03.05' ? 'Preencha a matriz de resultados booleanos e confira cada fronteira.' : 'Preencha a tabela, registre a previsão e confira seu código nos casos da atividade.',
        starterFiles: [{path: item.id === '03.05' ? 'matriz.md' : 'main.js', content: p.starter || ''}],
        resources: ['Retome na Etapa 02: comparações, resto %, operadores && e || e atribuições.', 'Os exemplos resolvidos, critérios e casos desta atividade aparecem na própria página.'],
        checks: p.fixtures.map(test => ({fixture: {given: JSON.stringify(test.input), expected: JSON.stringify(test.logs)}, scoring: 'Confira o comportamento em cada caso; explique a primeira divergência.'})),
        requires: ['Operadores e comparações da Etapa 02'], transferPrompt: p.transfer?.prompt || '',
      });
      else {
        const preparation = guidedPreparation(item);
        Object.assign(item, {preparation, hints: preparation.hints, edgeCases: [...lesson.edge_contract]});
      }
      if (item.id === '03.07') item.examples = [{given:'n=10, limite=4, divisor=2', expected:'3 (6,8,10)'}, {given:'n=10, limite=5, divisor=2', expected:'3 (6,8,10)'}, {given:'n=10, limite=6, divisor=2', expected:'2 (8,10)'}];
    }
    const assessment = assessments[item.id];
    if (assessment) {
      item.assessmentEnvironment = assessment.environment;
      if (Array.isArray(assessment.rubric) && assessment.rubric.length) item.rubric = [...assessment.rubric];
    }
    if (Array.isArray(item.rubric) && item.rubric.length) {
      item.rubricFingerprint = `sha256:${createHash('sha256').update(JSON.stringify(item.rubric)).digest('hex')}`;
    } else {
      delete item.rubricFingerprint;
    }
    if ((assessment?.checks?.includes('behavior') || assessment?.checks?.includes('mutation')) && courseTests[item.id]?.trim()) {
      const entryPath = assessment.entryPath || 'main.js';
      const hasExportedEntry = item.starterFiles.some(file => file.path === entryPath && /\bexport\b/.test(file.content));
      const isStudentSuite = assessment.studentSuite === true;
      const referenceExportsEntry = assessment.correctFiles?.some(file => file.path === entryPath && /\bexport\b/.test(file.content));
      assert(hasExportedEntry || referenceExportsEntry || isStudentSuite || assessment.environment === 'dom', `${item.id} has tests: declare an exported entryPath in the starter/reference, a DOM side-effect entry, or studentSuite`);
      item.autoTested = true;
    }
    // Any behavior or mutation assessment the browser runner executes is auto-tested. Type-only investigations
    // (15.01, 15.06) keep intentional diagnostics as study material, so they stay rubric-completed.
    if (assessment && !['local', 'rubric'].includes(assessment.environment) && (assessment.checks || []).some(check => check === 'behavior' || check === 'mutation')) item.autoTested = true;
    for (const [title, url, section, question] of officialDocs[item.id] || []) {
      item.resources = [...item.resources, `${title}: ${url}. Seção: ${section}. ${question}`];
    }
    // firstResponse.action must be a concrete first step, distinct from the objective; derived before the guided scaffold reads it.
    item.firstResponse = {...item.firstResponse, action: distinctFirstAction(item)};
    if (Number(item.stage) >= 4) Object.assign(item, {preparation: guidedPreparation(item), hints: guidedPreparation(item).hints});
    assert(item.prompt?.trim() && item.firstResponse?.action?.trim() && item.review, `Incomplete public contract: ${item.id}`);
    const review = {...item.review, choices: [...item.review.choices]};
    const correct = review.choices[review.answer]; assert(typeof correct === 'string', `Invalid review answer: ${item.id}`);
    // Investigações da Fase 6 (6.4) continuam a sequência round-robin depois dos cartões existentes: assim a resposta
    // correta de cartões já publicados não muda, e o progresso (que guarda o índice escolhido) continua válido.
    const choiceCount = review.choices.length;
    let position;
    if (INVESTIGATION_IDS_6_4.has(item.id)) {
      const extra = investigationCounts.get(choiceCount) || 0;
      position = ((existingChoiceCounts.get(choiceCount) || 0) + extra) % choiceCount;
      investigationCounts.set(choiceCount, extra + 1);
    } else {
      const count = answerCounts.get(choiceCount) || 0;
      position = count % choiceCount;
      answerCounts.set(choiceCount, count + 1);
    }
    review.choices.splice(review.answer, 1); review.choices.splice(position, 0, correct); review.answer = position;
    item.review = review;
    return item;
  });
  validateLearningMetadata(catalog, learningMetadata, {optionalIds: new Set(records.filter(record => record.optional).map(record => record.id))});
  validateRuntimeFeatureMatrix(featureMatrix, {
    minimum: runtimeBaseline.node.minimum,
    current: runtimeBaseline.node.next,
  }, records);
  const sourceIds = records.map(item => item.id);
  assert.equal(catalog.length, records.length, 'Published catalog must preserve every compiled activity');
  assert.deepEqual(catalog.map(item => item.id), sourceIds, 'Published catalog IDs and order must match compiled source');
  assert.equal(new Set(sourceIds).size, sourceIds.length, 'Compiled activities must have unique IDs');
  const ids = catalog.map(item => `  "${item.id}",`).join('\n');
  const publicAssessments = Object.fromEntries(Object.entries(assessments).map(([id, assessment]) => {
    const studentSuiteFiles = assessment.studentSuite === true
      ? {
          correctFiles: readVirtualFiles(`course-src/${assessment.referenceDir}`).filter(file => !isTestPath(file.path)),
          mutantDirs: existsSync(new URL(`course-src/mutants/${id}/`, project))
            ? readdirSync(new URL(`course-src/mutants/${id}/`, project), {withFileTypes: true})
                .filter(entry => entry.isDirectory())
                .map(entry => ({id: entry.name, files: readVirtualFiles(`course-src/mutants/${id}/${entry.name}`).filter(file => !isTestPath(file.path))}))
            : [],
        }
      : {};
    return [id, {
      ...assessment,
      ...studentSuiteFiles,
      sourceTestPath: assessment.testPath,
      testPath: '__devpath_tests__.js',
      // A typed/runtime student suite remains learner-authored. An optional
      // protected behavior gate is separate: preserve its inline source so
      // the submitted implementation is verified before reference mutation.
      tests: assessment.studentSuite === true
        ? (typeof assessment.tests === 'string' ? assessment.tests : undefined)
        : courseTests[id],
      referenceDir: assessment.referenceDir,
    }];
  }));
  const publishedVariants = publishVariantBank(loadVariantBank(), records, json('.generated/concept_graph.json'));
  return new Map([
    ['public/course-catalog.json', JSON.stringify(catalog) + '\n'],
    ['public/course-variants.json', JSON.stringify(publishedVariants) + '\n'],
    ['lib/course-exercise-ids.ts', `// Generated from course-src/.generated/resolved_preview.json; learner-facing IDs only.\nexport const courseExerciseIds = [\n${ids}\n] as const;\n`],
    ['public/course-tests.json', JSON.stringify(publishedCourseTests) + '\n'],
    ['public/course-assessments.json', JSON.stringify(publicAssessments) + '\n'],
    ['public/stage01-preparation.js', bundle('DevPathStage01Preparation', teaching01, 'course-src/stage01-preparation.mjs')],
    ['public/stage03-preparation.js', bundle('DevPathStage03Preparation', stage03Contracts, 'course-src/stage03-preparation.mjs + stage03-contract.mjs')],
    ['public/diagnostic-preparation.js', bundle('DevPathDiagnosticPreparation', diagnosticPreparation, 'course-src/diagnostic-preparation.mjs')],
  ]);
}

export function buildCourseArtifacts({check = false} = {}) {
  const artifacts = createCourseArtifacts();
  for (const [path, contents] of artifacts) {
    const destination = new URL(path, project);
    if (check) assert.equal(readFileSync(destination, 'utf8'), contents, `Regenerate ${path} with npm run build:curriculum`);
    else writeFileSync(destination, contents, 'utf8');
  }
  return artifacts;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  assert(process.argv.slice(2).every(arg => arg === '--check'), 'Supported option: --check');
  const artifacts = buildCourseArtifacts({check: process.argv.includes('--check')});
  const activityCount = JSON.parse(artifacts.get('public/course-catalog.json')).length;
  console.log(`Complete curriculum: ${activityCount} activities, one editorial source, seven reproducible assets.`);
}
