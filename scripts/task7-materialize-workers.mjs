import {createHash} from 'node:crypto';
import {readFileSync, readdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const assessmentPath = path.join(root, 'course-src', 'assessments.json');
const assessments = JSON.parse(readFileSync(assessmentPath, 'utf8'));
const targets = new Set(['21.04', '21.05']);
const before = Object.fromEntries(Object.entries(assessments)
  .filter(([id]) => !targets.has(id))
  .map(([id, value]) => [id, createHash('sha256').update(JSON.stringify(value)).digest('hex')]));

function read(relativePath) {
  return readFileSync(path.join(root, 'course-src', relativePath), 'utf8').trimEnd();
}

function filesUnder(relativePath) {
  const directory = path.join(root, 'course-src', relativePath);
  return readdirSync(directory, {withFileTypes: true})
    .filter(entry => entry.isFile() && /\.(?:m?js|jsx|tsx?|json|html|css)$/i.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(entry => ({path: entry.name, content: read(`${relativePath}/${entry.name}`)}));
}

function mutate(id, mutantId, files) {
  return {id: mutantId, files: files.map(file => ({path: file.path, content: file.content}))};
}

function targetAssessment(id, properties) {
  const current = assessments[id];
  if (!current || typeof current !== 'object') throw new Error(`Assessment ausente: ${id}`);
  // Keep the identity, rubrics, prior attempt metadata and Task 4 records.
  Object.assign(current, properties);
}

function writeReferenceReadme(id, details) {
  const assessment = assessments[id];
  const transfer = assessment.transfer?.files?.map(file => file.content).join('\n\n') || '';
  const rubric = assessment.rubric || [];
  const readme = [
    `# ${id} — Referência de avaliação`,
    '',
    '## Contrato observado',
    '',
    details,
    '',
    '## Transferência independente',
    '',
    transfer,
    '',
    '## Critérios observáveis da avaliação',
    '',
    ...rubric.map(value => `- ${value}`),
    '',
    '## Verificação',
    '',
    `A avaliação executa a suíte publicada no ambiente ${assessment.environment}; erro de infraestrutura, suíte vazia ou timeout não aprovam a tentativa.`,
    '',
  ].join('\n');
  writeFileSync(path.join(root, 'course-src', assessment.referenceDir, 'README.md'), readme, 'utf8');
}

const memo = read('solutions/21.04/memo.js');
const memoTests = read('tests/21.04.test.js');
const memoReference = [{path: 'memo.js', content: memo}];
const memoMutants = [
  mutate('21.04', 'fifo-hit', filesUnder('mutants/21.04/fifo-hit')),
  mutate('21.04', 'fn-throw-poisons-cache', filesUnder('mutants/21.04/fn-throw-poisons-cache')),
];
targetAssessment('21.04', {
  environment: 'javascript', version: 1, checks: ['behavior', 'mutation'],
  entryPath: 'memo.js', testPath: 'tests/21.04.test.js',
  behaviorTestPath: '__devpath_protected_behavior__.js', tests: memoTests,
  referenceDir: 'solutions/21.04', correctFiles: memoReference, mutantDirs: memoMutants,
});
assessments['21.04'].rubric[2] = 'false é um acerto de cache; a capacidade padrão continua 2.';
assessments['21.04'].transfer.rubric[2] = 'false é um acerto de cache; a capacidade padrão continua 2.';
writeReferenceReadme('21.04', 'Cache com capacidade limitada, política LRU, capacidade padrão 2, resultados falsy, capacidade zero e retry após erro. Arquivo avaliado: memo.js.');

const workerFiles = ['main.js', 'worker.js', 'primos.js'].map(name => ({
  path: name,
  content: read(`solutions/21.05/${name}`),
}));
const workerTests = read('tests/21.05.test.js');
assessments['21.05'].transfer.files = [{
  path: 'transfer.md',
  content: '# Transfer 21.05\n\nMova um cálculo de CPU para um Worker nativo do navegador. Envie solicitações {id,n}, resolva cada promessa pelo ID da resposta, converta falhas de tarefa em rejeições isoladas e encerre o Worker rejeitando trabalho pendente. Demonstre mensagens reais, resposta fora de ordem controlada e terminate no navegador servido.',
}];
const workerMutants = [
  ...['off-by-one-prime-count', 'skips-two'].map(id => mutate('21.05', id, filesUnder(`mutants/21.05/${id}`))),
  mutate('21.05', 'cleanup-without-terminate', filesUnder('mutants/21.05/cleanup-without-terminate')),
  mutate('21.05', 'response-ignores-id', filesUnder('mutants/21.05/response-ignores-id')),
];
targetAssessment('21.05', {
  environment: 'dom', version: 1, checks: ['behavior', 'mutation'],
  entryPath: 'main.js', testPath: 'tests/21.05.test.js',
  behaviorTestPath: '__devpath_protected_behavior__.js', tests: workerTests,
  referenceDir: 'solutions/21.05', correctFiles: workerFiles, mutantDirs: workerMutants,
  fixtures: {html: '<main id="worker-check"></main>', workerEntries: ['worker.js']},
  timeoutMs: 20000,
});
writeReferenceReadme('21.05', 'A suíte executa main.js e seus módulos locais no DevPathDomRunner servido. main.js cria um Worker nativo a partir de worker.js; primos.js exporta o cálculo puro. A fixture declara worker.js como entrada local e não substitui o Worker nem as mensagens.');

for (const [id, hash] of Object.entries(before)) {
  const after = createHash('sha256').update(JSON.stringify(assessments[id])).digest('hex');
  if (after !== hash) throw new Error(`O materializador alterou assessment fora do escopo: ${id}`);
}

writeFileSync(assessmentPath, `${JSON.stringify(assessments, null, 2)}\n`, 'utf8');
console.log('21.04/21.05 materializados; demais assessments permaneceram byte-semantics idênticos.');
