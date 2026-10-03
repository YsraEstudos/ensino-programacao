import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {stage00} from './stage00-preparation.mjs';
import {stage01Preparation} from './stage01-preparation.mjs';
import {stage03Contracts} from './stage03-contract.mjs';
import {diagnosticPreparation} from './diagnostic-preparation.mjs';

const project = new URL('../', import.meta.url);
const json = name => JSON.parse(readFileSync(new URL(name, import.meta.url), 'utf8'));
const bundle = (variable, value, source) => `// Generated from ${source}; edit the editorial source.\nglobalThis.${variable} = ${JSON.stringify(value, null, 2)};\n`;

// Reads editorial inputs only; regeneration never depends on another checkout
// or on a previous copy of the generated public catalog.
export function createCourseArtifacts() {
  const records = json('resolved_preview.json');
  const overrides = json('publication-overrides.json');
  const teaching01 = JSON.parse(JSON.stringify(stage01Preparation));
  for (const p of Object.values(teaching01)) {
    for (const transfer of p.masteryTransfers || []) delete transfer.solution;
  }
  const text = readFileSync(new URL('bridges.md', import.meta.url), 'utf8');
  const headings = [...text.matchAll(/^## Ponte (\d{2})(?:–(\d{2}))? — ([^\r\n]+)$/gm)];
  const bridges = headings.map((m, i) => ({start: Number(m[1]), end: Number(m[2] || m[1]), title: m[3].trim(), text: text.slice(m.index + m[0].length, headings[i + 1]?.index ?? text.length).trim()}));
  const seen = new Set(), answerCounts = new Map();
  const catalog = records.map(record => {
    const lesson = record.learner, recall = record.platform?.active_recall;
    const item = {
      id: record.id, title: record.title, stage: record.stage, kind: record.kind,
      contentVersion: record.content_version || 1, optional: record.optional,
      duration: `${record.estimated_minutes} min`, runtime: record.runtime,
      objective: lesson.first_response?.action, prompt: lesson.prompt,
      firstResponse: lesson.first_response, explanation: lesson.explanation,
      interaction: lesson.interaction, resources: [...lesson.resources],
      starterFiles: lesson.starter_files, assets: lesson.assets, examples: lesson.public_examples,
      checks: lesson.public_tests, constraints: lesson.constraints, rubric: lesson.visible_rubric,
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
      Object.assign(item, {
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
      if (item.id === '03.07') item.examples = [{given:'n=10, limite=4, divisor=2', expected:'3 (6,8,10)'}, {given:'n=10, limite=5, divisor=2', expected:'3 (6,8,10)'}, {given:'n=10, limite=6, divisor=2', expected:'2 (8,10)'}];
    }
    assert(item.prompt?.trim() && item.firstResponse?.action?.trim() && item.review, `Incomplete public contract: ${item.id}`);
    const review = {...item.review, choices: [...item.review.choices]};
    const correct = review.choices[review.answer]; assert(typeof correct === 'string', `Invalid review answer: ${item.id}`);
    const count = answerCounts.get(review.choices.length) || 0, position = count % review.choices.length;
    answerCounts.set(review.choices.length, count + 1);
    review.choices.splice(review.answer, 1); review.choices.splice(position, 0, correct); review.answer = position;
    item.review = review;
    return item;
  });
  assert.equal(catalog.length, 254); assert.equal(new Set(catalog.map(item => item.id)).size, catalog.length);
  const ids = catalog.map(item => `  "${item.id}",`).join('\n');
  return new Map([
    ['public/course-catalog.json', JSON.stringify(catalog) + '\n'],
    ['lib/course-exercise-ids.ts', `// Generated from course-src/resolved_preview.json; learner-facing IDs only.\nexport const courseExerciseIds = [\n${ids}\n] as const;\n`],
    ['public/js-stage01-preparation.js', bundle('DevPathStage01Preparation', teaching01, 'course-src/stage01-preparation.mjs')],
    ['public/js-stage03-preparation.js', bundle('DevPathStage03Preparation', stage03Contracts, 'course-src/stage03-preparation.mjs + stage03-contract.mjs')],
    ['public/js-diagnostic-preparation.js', bundle('DevPathDiagnosticPreparation', diagnosticPreparation, 'course-src/diagnostic-preparation.mjs')],
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
  buildCourseArtifacts({check: process.argv.includes('--check')});
  console.log('Complete curriculum: 254 activities, one editorial source, five reproducible assets.');
}
