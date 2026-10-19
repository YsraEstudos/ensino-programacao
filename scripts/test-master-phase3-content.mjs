import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import ts from 'typescript';

const catalog = JSON.parse(readFileSync(new URL('../public/course-catalog.json', import.meta.url), 'utf8'));
const assessments = JSON.parse(readFileSync(new URL('../public/course-assessments.json', import.meta.url), 'utf8'));
const activity = id => {
  const item = catalog.find(candidate => candidate.id === id);
  assert.ok(item, `Atividade publicada ausente: ${id}`);
  return item;
};

function runStarter(id) {
  const item = activity(id);
  const source = item.starterFiles[0]?.content;
  assert.ok(source, `Starter publicado ausente: ${id}`);
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', source], {
    encoding: 'utf8', timeout: 5000, windowsHide: true,
  });
  assert.equal(result.status, 0, result.stderr || result.error?.message);
  return result.stdout.trim().split(/\r?\n/);
}

test('08.07: o gabarito publicado escolhe marcar na descoberta para evitar duplicatas', () => {
  const {review} = activity('08.07');
  assert.match(review.prompt, /enfileir/i);
  assert.match(review.choices[review.answer], /(?:ciclos|convergentes).*(?:várias vezes|duplicad)/i);
});

test('12.04: o exemplo publicado inclui a microtask P2 na ordem executada', () => {
  const item = activity('12.04');
  assert.deepEqual(runStarter('12.04'), ['A', 'B', 'P1', 'Q', 'P2', 'T']);
  assert.match(item.examples[0].given, /P1.*P2/);
  assert.equal(item.examples[0].expected, 'A,B,P1,Q,P2,T');
});

test('14.13: o exemplo publicado inclui B síncrono antes dos callbacks', () => {
  const item = activity('14.13');
  assert.deepEqual(runStarter('14.13').map(line => line.split(' ')[0]), ['A', 'B', 'P', 'T']);
  assert.equal(item.examples[0].expected, 'A,B,P,T');
});

function diagnosticsFor19({exactOptionalPropertyTypes}) {
  const reference = assessments['19.06'].correctFiles.find(file => file.path === 'mutable.ts')?.content;
  assert.ok(reference, 'Referência TypeScript publicada ausente');
  const path = '/virtual/fase3-19-06.ts';
  const source = `${reference}\n` +
    'type Input={readonly theme?:"light"|"dark";readonly explicit?:string|undefined};\n' +
    'type Out=MutableRequired<Input>;\n' +
    'const absent:Out={explicit:"ok"};\n' +
    'const implicitUndefined:Out={theme:undefined,explicit:"ok"};\n' +
    'const explicitUndefined:Out={theme:"dark",explicit:undefined};\n';
  const options = {strict: true, exactOptionalPropertyTypes, noEmit: true, target: ts.ScriptTarget.ES2022};
  const host = ts.createCompilerHost(options);
  const originalGet = host.getSourceFile.bind(host);
  host.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) =>
    file === path ? ts.createSourceFile(file, source, languageVersion, true)
      : originalGet(file, languageVersion, onError, shouldCreateNewSourceFile);
  host.fileExists = file => file === path || ts.sys.fileExists(file);
  host.readFile = file => file === path ? source : ts.sys.readFile(file);
  const program = ts.createProgram([path], options, host);
  return ts.getPreEmitDiagnostics(program).filter(diagnostic => diagnostic.file?.fileName === path)
    .map(diagnostic => ({code: diagnostic.code, line: diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1}));
}

test('19.06: a referência publicada distingue strict do union explícito em exactOptionalPropertyTypes', () => {
  assert.deepEqual(diagnosticsFor19({exactOptionalPropertyTypes: false}), [
    {code: 2741, line: 4}, {code: 2322, line: 5}, {code: 2322, line: 6},
  ]);
  assert.deepEqual(diagnosticsFor19({exactOptionalPropertyTypes: true}), [
    {code: 2741, line: 4}, {code: 2322, line: 5},
  ]);
  const {review} = activity('19.06');
  assert.match(review.choices[review.answer], /strict.*undefined/i);
  assert.match(review.correctFeedback, /exactOptionalPropertyTypes/);
  assert.match(assessments['19.06'].rubric.join(' '), /--strict.*exactOptionalPropertyTypes/);
});
