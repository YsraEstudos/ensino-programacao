import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {copyFileSync, cpSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import * as esbuild from 'esbuild-wasm';
import {parse} from 'acorn';
import {setup} from './course-runner-harness.mjs';

// Fase 5 (análise curricular, itens 5.1–5.10): recursos atuais da linguagem e do runtime.
// Extensões opcionais com IDs novos, starter que reprova e referência que aprova, e checkpoints locais
// cujos comandos passam numa cópia limpa da referência.
const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => JSON.parse(readFileSync(path.join(root, file), 'utf8'));

const JS_NEW = ['05.16', '06.12', '07.14', '09.10', '10.10', '12.21', '20.11'];
const LOCAL_NEW = ['14.19', '14.20', '14.21', '14.22', '21.14'];
const RUBRIC_NEW = ['23.12'];
const ALL_NEW = [...JS_NEW, ...LOCAL_NEW, ...RUBRIC_NEW];
const OPTIONAL_NEW = ALL_NEW;
const ANCHORS = {
  '05.16': '05.11', '06.12': '06.06', '07.14': '07.07', '09.10': '09.06', '10.10': '10.09', '12.21': '12.06',
  '14.19': '14.05', '14.20': '14.06', '14.21': '14.03', '14.22': '14.04', '21.14': '21.02', '20.11': '20.10', '23.12': '23.07',
};

const catalog = read('public/course-catalog.json');
const assessments = read('public/course-assessments.json');
const sourceAssessments = read('course-src/assessments.json');
const learningMetadata = read('course-src/learning-metadata.json');
const featureMatrix = read('course-src/feature-matrix.json');
const compiled = read('course-src/.generated/resolved_preview.json');
const baselineCatalog = read('output/fase2/catalog-before.json');
const moduleGraph = (() => {
  const w = {TextEncoder};
  w.window = w;
  vm.runInThisContext('(function(window){' + readFileSync(path.join(root, 'public/module-graph.js'), 'utf8') + '})')(w);
  return w.DevPathModuleGraph;
})();
const assessmentSource = readFileSync(path.join(root, 'public/course-assessment.js'), 'utf8');

function runValidator(sourcePath) {
  return spawnSync(process.execPath, [path.join(root, 'scripts/validate-curriculum-source.mjs'), '--source', sourcePath], {
    cwd: root, encoding: 'utf8',
  });
}

function solutionFiles(referenceDir) {
  const base = path.join(root, 'course-src', referenceDir);
  const walk = (dir, prefix = '') => readdirSync(dir, {withFileTypes: true}).flatMap(entry => entry.isDirectory()
    ? walk(path.join(dir, entry.name), `${prefix}${entry.name}/`)
    : entry.name.endsWith('.md') ? [] : [{path: `${prefix}${entry.name}`, content: readFileSync(path.join(dir, entry.name), 'utf8')}]);
  return walk(base);
}

function assessmentContext(env) {
  env.w.eval(readFileSync(path.join(root, 'public/course-node-runtime.js'), 'utf8'));
  const w = {
    TextEncoder,
    DevPathNodeRuntime: env.w.DevPathNodeRuntime,
    DevPathModuleGraph: {
      buildModuleGraph: input => moduleGraph.buildModuleGraph(input, {
        build: esbuild.build, parse, transform: esbuild.transform, runtime: input.runtime,
      }),
    },
    DevPathCourseRunner: {
      run(code, finish, options) {
        return env.w.DevPathCourseRunner.run(code, (kind, text, tests, node) => finish(kind, text, tests, node), options);
      },
    },
  };
  w.window = w;
  vm.runInNewContext(assessmentSource, w);
  return w;
}

// Executa um comando declarado numa cópia limpa da referência, como o checkpoint local faria.
function runDeclared(referenceDir, [command, ...args]) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'devpath-phase5-'));
  try {
    cpSync(path.join(root, 'course-src', referenceDir), dir, {recursive: true});
    const result = command === 'node'
      ? spawnSync(process.execPath, args, {cwd: dir, encoding: 'utf8'})
      : spawnSync([command, ...args].join(' '), {cwd: dir, encoding: 'utf8', shell: true});
    return {status: result.status, output: `${result.stdout}${result.stderr}`};
  } finally {
    rmSync(dir, {recursive: true, force: true});
  }
}

test('todas as atividades novas são publicadas com o contrato declarado', () => {
  for (const id of ALL_NEW) {
    assert(catalog.some(item => item.id === id), `${id} is published`);
    assert(sourceAssessments[id], `${id} has a canonical assessment`);
    assert(learningMetadata[id], `${id} has learning metadata`);
  }
  for (const id of JS_NEW) {
    assert.equal(sourceAssessments[id].environment, 'javascript', `${id} runs in the published evaluator`);
    assert(sourceAssessments[id].testPath && sourceAssessments[id].referenceDir, `${id} has a suite and a reference`);
    assert(assessments[id]?.tests, `${id} publishes its executable assessment`);
    assert(sourceAssessments[id].assertionCases?.length > 0, `${id} has annotated assertion cases`);
  }
  for (const id of LOCAL_NEW) {
    assert.equal(sourceAssessments[id].environment, 'local', `${id} is a local checkpoint`);
    assert(sourceAssessments[id].local.commands.length > 0, `${id} declares the commands it runs`);
    assert.equal(sourceAssessments[id].evidenceLabel, 'learner-declared', `${id} is labelled learner-declared`);
    assert(sourceAssessments[id].referenceDir, `${id} has a reference project`);
  }
  assert.equal(sourceAssessments['23.12'].environment, 'rubric');
  assert.equal(sourceAssessments['23.12'].evidenceLabel, 'rubric-declared');
});

// Um starter que já cumpre uma borda ainda precisa reprovar em pelo menos um teste de comportamento.
test('o avaliador publicado reprova cada starter novo e aprova a referência', async () => {
  const env = setup();
  try {
    const evaluator = assessmentContext(env);
    for (const id of JS_NEW) {
      const item = catalog.find(entry => entry.id === id);
      const assessment = assessments[id];
      const reference = await evaluator.DevPathAssessment.run({
        item, assessment, files: solutionFiles(sourceAssessments[id].referenceDir), fingerprint: `phase5-reference-${id}`,
      });
      const starter = await evaluator.DevPathAssessment.run({
        item, assessment, files: item.starterFiles, fingerprint: `phase5-starter-${id}`,
      });
      assert.equal(reference.kind, 'passed', `${id} reference: ${reference.text}`);
      assert.equal(reference.tests.failed, 0, `${id} reference failed tests`);
      assert(reference.tests.total > 0, `${id} has no behavioral assertions`);
      assert.equal(starter.kind, 'failed', `${id} starter should fail behavior checks: ${starter.text}`);
      assert(starter.tests.failed > 0, `${id} starter passes every behavior check`);
    }
  } finally {
    env.close();
  }
});

test('cada checkpoint local passa nos comandos declarados, com a saída esperada', () => {
  const declared = Object.fromEntries(LOCAL_NEW.map(id => [id, sourceAssessments[id]]));
  for (const id of LOCAL_NEW) {
    for (const command of declared[id].local.commands) {
      const result = runDeclared(declared[id].referenceDir, command);
      assert.equal(result.status, 0, `${id} ${command.join(' ')} exited ${result.status}: ${result.output}`);
    }
  }
  assert.match(runDeclared('solutions/14.22', ['node', 'falha.cjs']).output, /ERR_REQUIRE_ASYNC_MODULE/);
  assert.match(runDeclared('solutions/14.22', ['node', 'alternativa.cjs']).output, /^1$/m);
  assert.match(runDeclared('solutions/14.22', ['node', 'usar.cjs']).output, /^5$/m);
  assert.doesNotMatch(runDeclared('solutions/14.21', ['node', '--run', 'saudacao']).output, /antes do script/);
  assert.match(runDeclared('solutions/14.21', ['npm', 'run', 'saudacao']).output, /antes do script/);
});

test('a ordem publicada posiciona cada extensão depois da prática tradicional e respeita os pré-requisitos', () => {
  const order = catalog.map(item => item.id);
  const position = id => order.indexOf(id);
  for (const id of ALL_NEW) {
    for (const required of learningMetadata[id].requires) {
      assert(position(required) < position(id), `${id} requires ${required}, which must come first`);
    }
  }
  for (const [id, anchor] of Object.entries(ANCHORS)) {
    assert.equal(learningMetadata[id].requires[0], anchor, `${id} is anchored after ${anchor}`);
    assert(position(anchor) < position(id), `${id} comes after ${anchor}`);
  }
  assert(position('14.03') < position('14.21') && position('14.21') < position('14.04'), 'node --run sits between package scripts and ESM');
  assert(position('21.08') < position('21.14') && position('21.14') < position('21.09'), 'DisposableStack follows using and comes before the microproject');
  const existing = baselineCatalog.map(item => item.id).filter(id => position(id) >= 0);
  const currentOrderOfExisting = order.filter(id => existing.includes(id));
  assert.deepEqual(existing, currentOrderOfExisting, 'existing activities keep their relative order');
  assert.equal(compiled.length, catalog.length, 'the compiled preview and the published catalog agree');
});

test('extensões novas são opcionais; nenhum núcleo depende delas', () => {
  const byId = new Map(catalog.map(item => [item.id, item]));
  for (const id of OPTIONAL_NEW) assert.equal(byId.get(id).optional, true, `${id} is an optional extension`);
  assert.equal(byId.get('20.06').optional, true, '5.8: iterator helpers stay optional; 20.08 uses generators');
  for (const entry of catalog) {
    for (const required of learningMetadata[entry.id].requires) {
      assert.equal(byId.get(required).optional, false, `${entry.id} cannot require optional ${required}`);
    }
  }
});

test('o validador sinaliza uso de recurso das versões atuais sem classificação opcional', () => {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'devpath-phase5-detector-'));
  try {
    const cards = structuredClone(compiled);
    const card = cards.find(item => item.id === '04.01');
    const main = card.learner.starter_files.find(file => file.path === 'main.js');
    main.content += '\nexport const origem = import.meta.dirname;\n';
    copyFileSync(path.join(root, 'course-src/.generated/concept_graph.json'), path.join(dir, 'concept_graph.json'));
    const source = path.join(dir, 'resolved_preview.json');
    writeFileSync(source, JSON.stringify(cards));
    const result = runValidator(source);
    // Cartões em CONTRACT_READY recebem aviso; cartões READY reprovam o build. Ambos citam o recurso detectado.
    const output = `${result.stdout}${result.stderr}`;
    assert.match(output, /04\.01[^\n]*OPTIONAL_EXTENSION[^\n]*import\.meta\.dirname\/filename/, output);
  } finally {
    rmSync(dir, {recursive: true, force: true});
  }
});

test('o detector de extensões reconhece um exemplo de cada recurso da fase', () => {
  const exemplos = [
    ['private brand check', 'const tem = #marca in objeto;'],
    ['import.meta.dirname/filename', 'const pasta = import.meta.dirname;'],
    ['process.loadEnvFile/--env-file', 'process.loadEnvFile(".env");'],
    ['node --run', 'const comando = "node --run test";'],
    ['require(esm)', "const modulo = require('./util.mjs');"],
    ['JSON.parse reviver context', 'JSON.parse(texto, (chave, valor, context) => context.source);'],
    ['Map.getOrInsert', 'mapa.getOrInsert(chave, 0);'],
    ['String well-formed methods', 'const bem = texto.isWellFormed();'],
    ['Promise.withResolvers/AbortSignal timeout or any', 'const sinal = AbortSignal.timeout(10);'],
    ['Uint8Array base64/hex', 'const hex = bytes.toHex();'],
  ];
  const dir = mkdtempSync(path.join(os.tmpdir(), 'devpath-phase5-examples-'));
  try {
    copyFileSync(path.join(root, 'course-src/.generated/concept_graph.json'), path.join(dir, 'concept_graph.json'));
    for (const [nome, trecho] of exemplos) {
      const cards = structuredClone(compiled);
      const card = cards.find(item => item.id === '04.01');
      card.learner.starter_files.find(file => file.path === 'main.js').content += `\n${trecho}\n`;
      const source = path.join(dir, 'resolved_preview.json');
      writeFileSync(source, JSON.stringify(cards));
      const result = runValidator(source);
      const output = `${result.stdout}${result.stderr}`;
      assert(output.includes('OPTIONAL_EXTENSION') && output.includes(nome), `${nome} not detected:\n${output}`);
    }
  } finally {
    rmSync(dir, {recursive: true, force: true});
  }
});

test('a matriz registra os recursos da fase com versão mínima e fonte', () => {
  const byLabel = new Map(featureMatrix.entries.map(entry => [entry.label, entry]));
  const expected = {
    'Marca privada com #campo in obj': '16.4.0',
    'import.meta.dirname e import.meta.filename': '20.11.0',
    'process.loadEnvFile e --env-file': '20.12.0',
    'node --run': '22.3.0',
    'require(esm)': '22.12.0',
    'DisposableStack e SuppressedError': '24.0.0',
    'JSON.parse com context.source no reviver': '21.0.0',
  };
  for (const [label, version] of Object.entries(expected)) {
    const entry = byLabel.get(label);
    assert(entry, `${label} is registered`);
    assert.equal(entry.nodeVersionAdded, version, `${label} minimum Node version`);
    assert(entry.match.length > 0, `${label} has match tokens for the learner text`);
  }
  assert.equal(byLabel.get('import.meta.dirname e import.meta.filename').chromeVersionAdded, 'não aplicável');
});

test('5.1: a nota de Math.sumPrecise em 02.11 não o apresenta como habilidade verificada', () => {
  const overrides = read('course-src/compatibility-overrides.json');
  assert.match(overrides['02.11'], /Math\.sumPrecise/);
  assert.match(overrides['02.11'], /nota informativa, não habilidade verificada/);
  assert.match(overrides['02.11'], /não resolve aritmética monetária/);
  assert.equal(sourceAssessments['02.11'], undefined, '02.11 keeps its informative card and gains no execution requirement');
});
