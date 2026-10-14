import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {checkLocalProject} from './check-local-course.mjs';

const projectRoot = new URL('../', import.meta.url);
const exporter = await import('../public/course-project-export.js')
  .then(() => globalThis.DevPathCourseProjectExport)
  .catch(() => undefined);

function api() {
  assert.ok(exporter?.createProjectFiles, 'public/course-project-export.js must expose createProjectFiles');
  assert.ok(exporter?.downloadProject, 'public/course-project-export.js must expose downloadProject');
  return exporter;
}

function fixtureFiles() {
  return [
    {path: 'src/main.js', content: 'import {format} from "./format.js"; console.log(format("Iris"));\n'},
    {path: 'src/format.js', content: 'export const format = name => `Olá, ${name}`;\n'},
    {path: 'test/main.test.js', content: 'import test from "node:test"; import assert from "node:assert/strict"; import {format} from "../src/format.js"; test("format", () => assert.equal(format("Iris"), "Olá, Iris"));\n'},
  ];
}

function fixtureOptions(files = fixtureFiles()) {
  return {
    item: {id: '04.09', title: 'Resumo da ficha'},
    files,
    assessment: {
      environment: 'local', entryPath: 'src/main.js', testPath: 'test/main.test.js',
      checks: ['behavior', 'local'],
      local: {commands: [['node', '--test', 'test/main.test.js']], evidence: ['stdout', 'diff']},
    },
    checkpoint: {
      id: '04.09', title: 'Projeto Node', instructions: ['Execute o teste.'],
      commands: [['node', '--test', 'test/main.test.js']], expected: ['1 teste aprovado'],
      evidence: ['stdout', 'diff'],
      package: {name: 'devpath-04-09', version: '1.0.0', type: 'module', engines: {node: '>=24.0.0'}, scripts: {test: 'node --test test/main.test.js'}},
      packageLock: {name: 'devpath-04-09', version: '1.0.0', lockfileVersion: 3, packages: {'': {name: 'devpath-04-09', version: '1.0.0'}}},
    },
  };
}

function zipEntries(blob) {
  return blob.arrayBuffer().then(buffer => {
    const bytes = new Uint8Array(buffer);
    const view = new DataView(buffer);
    const entries = new Map();
    let offset = 0;
    while (offset + 30 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
      const method = view.getUint16(offset + 8, true);
      assert.equal(method, 0, 'portable exporter ZIP uses stored entries');
      const compressedSize = view.getUint32(offset + 18, true);
      const nameLength = view.getUint16(offset + 26, true);
      const extraLength = view.getUint16(offset + 28, true);
      const nameStart = offset + 30;
      const dataStart = nameStart + nameLength + extraLength;
      const name = new TextDecoder().decode(bytes.slice(nameStart, nameStart + nameLength));
      entries.set(name, new TextDecoder().decode(bytes.slice(dataStart, dataStart + compressedSize)));
      offset = dataStart + compressedSize;
    }
    assert.ok(offset < bytes.length, 'ZIP has a central directory after local entries');
    return entries;
  });
}

test('export preserves every draft path and content and adds a usable project guide', () => {
  const files = api().createProjectFiles(fixtureOptions());
  assert.deepEqual(files.find(file => file.path === 'src/main.js'), fixtureFiles()[0]);
  assert.equal(files.find(file => file.path === 'src/format.js')?.content, fixtureFiles()[1].content);
  assert.match(files.find(file => file.path === 'README.md')?.content || '', /04\.09/);
  assert.match(files.find(file => file.path === 'README.md')?.content || '', /node --test test\/main\.test\.js/);
  const manifest = JSON.parse(files.find(file => file.path === 'devpath-project.json')?.content || '{}');
  assert.equal(manifest.evidenceSource, 'local-declared');
  assert.equal(manifest.verificationStatus, 'not-run-by-export');
});

test('export keeps an authored README and appends checkpoint commands without replacing it', () => {
  const input = fixtureOptions();
  input.files.push({path: 'README.md', content: '# My project\n\nMy design notes stay here.\n'});
  const readme = api().createProjectFiles(input).find(file => file.path === 'README.md')?.content || '';
  assert.ok(readme.startsWith('# My project\n\nMy design notes stay here.'));
  assert.match(readme, /## DevPath local checkpoint/);
  assert.match(readme, /node --test test\/main\.test\.js/);
});

test('export rejects traversal, absolute, drive, URL, NUL, and colliding paths before packaging', () => {
  const invalid = ['../outside.txt', '/outside.txt', 'C:/outside.txt', 'https://example.test/a.js', 'src/\0evil.js'];
  for (const path of invalid) {
    assert.throws(() => api().createProjectFiles(fixtureOptions([{path, content: 'x'}])), /path|safe|relative|collision/i, path);
  }
  assert.throws(() => api().createProjectFiles(fixtureOptions([
    {path: 'src/main.js', content: 'first'}, {path: 'src/MAIN.js', content: 'second'},
  ])), /collision|duplicate/i);
  assert.throws(() => api().createProjectFiles(fixtureOptions([
    {path: 'src/main.js', content: 'file'}, {path: 'src/main.js/child.txt', content: 'child'},
  ])), /collision|conflicting/i);
  const standardPathCollision = fixtureOptions([...fixtureFiles(), {path: 'readme.md', content: 'draft'}]);
  assert.throws(() => api().createProjectFiles(standardPathCollision), /collid/i);
  const generatedPrefixCollision = fixtureOptions([...fixtureFiles(), {path: 'package.json/extra.txt', content: 'draft'}]);
  assert.throws(() => api().createProjectFiles(generatedPrefixCollision), /collid|conflicting/i);
});

test('export refuses missing declared entry, test, dependency, or incoherent lock before creating ZIP bytes', () => {
  const options = fixtureOptions();
  assert.throws(() => api().createProjectFiles({...options, files: options.files.filter(file => file.path !== 'src/main.js')}), /entry|missing|src\/main\.js/i);
  assert.throws(() => api().createProjectFiles({...options, files: options.files.filter(file => file.path !== 'test/main.test.js')}), /test|missing|test\/main\.test\.js/i);
  const dependency = {...options, checkpoint: {...options.checkpoint, package: {...options.checkpoint.package, devDependencies: {typescript: '6.0.3'}}}};
  assert.throws(() => api().createProjectFiles(dependency), /lock|typescript|dependency/i);
  const noPackageNpm = fixtureOptions();
  delete noPackageNpm.checkpoint.package;
  delete noPackageNpm.checkpoint.packageLock;
  noPackageNpm.assessment.local.commands = [['npm', 'test']];
  assert.throws(() => api().createProjectFiles(noPackageNpm), /npm command requires exported package/i);
  const noPackageCheckpointNpm = fixtureOptions();
  delete noPackageCheckpointNpm.checkpoint.package;
  delete noPackageCheckpointNpm.checkpoint.packageLock;
  noPackageCheckpointNpm.assessment.local.commands = [];
  noPackageCheckpointNpm.checkpoint.commands = [['npm', 'test']];
  assert.throws(() => api().createProjectFiles(noPackageCheckpointNpm), /npm command requires exported package/i);
  const unresolvedTransitive = fixtureOptions();
  unresolvedTransitive.checkpoint.package = {...unresolvedTransitive.checkpoint.package, devDependencies: {'@types/node': '24.19.1'}};
  unresolvedTransitive.checkpoint.packageLock = {
    name: 'devpath-04-09', version: '1.0.0', lockfileVersion: 3,
    packages: {
      '': {name: 'devpath-04-09', version: '1.0.0', devDependencies: {'@types/node': '24.19.1'}},
      'node_modules/@types/node': {version: '24.19.1', resolved: 'https://registry.npmjs.org/@types/node/-/node-24.19.1.tgz', integrity: 'sha512-aS3/DG0oM05K0RIXXP+hKjinGG5IgSSVGzswZxW3O0sS3pH4/fycXundUC9XsszgKCk4gHXylTEK6hyFxVxnoQ==', dependencies: {'undici-types': '>=7.24.0 <7.24.7'}},
    },
  };
  assert.throws(() => api().createProjectFiles(unresolvedTransitive), /does not resolve undici-types/i);
  const badLock = {...options, checkpoint: {...options.checkpoint, packageLock: {...options.checkpoint.packageLock, packages: {'': {name: 'different', version: '1.0.0'}}}}};
  assert.throws(() => api().createProjectFiles(badLock), /lock|package|coher/i);
});

test('download creates a readable ZIP containing nested files and package metadata', async () => {
  const result = await api().downloadProject(fixtureOptions(), {triggerDownload: false});
  assert.equal(result.blob.type, 'application/zip');
  const entries = await zipEntries(result.blob);
  assert.equal(entries.get('src/format.js'), fixtureFiles()[1].content);
  assert.ok(entries.has('README.md'));
  assert.ok(entries.has('package.json'));
  assert.ok(entries.has('package-lock.json'));
});

test('downloaded ZIP opens and returns original UTF-8 files through Windows ZipArchive', async () => {
  const result = await api().downloadProject(fixtureOptions(), {triggerDownload: false});
  const root = await mkdtemp(join(tmpdir(), 'devpath-zip-reader-'));
  try {
    const archivePath = join(root, 'project.zip');
    const scriptPath = join(root, 'read-zip.ps1');
    await writeFile(archivePath, new Uint8Array(await result.blob.arrayBuffer()));
    await writeFile(scriptPath, [
      '$ErrorActionPreference = "Stop"',
      'Add-Type -AssemblyName System.IO.Compression.FileSystem',
      '$archive = [System.IO.Compression.ZipFile]::OpenRead($args[0])',
      'try {',
      '  $entry = $archive.GetEntry("src/format.js")',
      '  if (-not $entry) { throw "Missing nested entry" }',
      '  $stream = $entry.Open()',
      '  $memory = [System.IO.MemoryStream]::new()',
      '  try { $stream.CopyTo($memory) } finally { $stream.Dispose() }',
      '  Write-Output ($archive.Entries.Count)',
      '  Write-Output ([Convert]::ToBase64String($memory.ToArray()))',
      '} finally { $archive.Dispose() }',
    ].join('\n'), 'utf8');
    const checked = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, archivePath], {encoding: 'utf8', windowsHide: true});
    assert.equal(checked.status, 0, `${checked.stdout}\n${checked.stderr}`);
    const lines = checked.stdout.trim().split(/\r?\n/);
    assert.equal(Number(lines[0]), result.files.length);
    assert.equal(lines[1], Buffer.from(fixtureFiles()[1].content, 'utf8').toString('base64'));
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});

test('download triggers a browser anchor and releases its temporary object URL', async () => {
  const calls = [];
  const anchor = {click: () => calls.push('click'), remove: () => calls.push('remove'), setAttribute() {}};
  const documentRef = {createElement: () => anchor, body: {appendChild: () => calls.push('append')}};
  const urlApi = {createObjectURL: blob => { calls.push(blob.type); return 'blob:project'; }, revokeObjectURL: url => calls.push(url)};
  await api().downloadProject(fixtureOptions(), {documentRef, urlApi, setTimeoutFn: callback => callback()});
  assert.deepEqual(calls.slice(0, 4), ['application/zip', 'append', 'click', 'remove']);
  assert.equal(calls[4], 'blob:project');
});

test('exported JavaScript project runs in a clean contained temp directory with the existing local checker', async () => {
  const files = api().createProjectFiles(fixtureOptions());
  const root = await mkdtemp(join(tmpdir(), 'devpath-export-test-'));
  try {
    const folder = join(root, 'student-project');
    await mkdir(folder);
    for (const file of files) {
      const path = join(folder, ...file.path.split('/'));
      await mkdir(path.slice(0, path.lastIndexOf('/')), {recursive: true});
      await writeFile(path, file.content, 'utf8');
    }
    const testContext = process.env.NODE_TEST_CONTEXT;
    delete process.env.NODE_TEST_CONTEXT;
    let result;
    try {
      result = await checkLocalProject({rootDir: root, referenceDir: 'student-project', commands: [['node', '--test', 'test/main.test.js']]});
    } finally {
      if (testContext !== undefined) process.env.NODE_TEST_CONTEXT = testContext;
    }
    assert.equal(result.exitCode, 0, result.output);
    assert.match(result.output, /pass 1/);
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});

test('prepared TypeScript checkpoint locks are internally coherent and label the course proxy', async () => {
  const definitions = JSON.parse(await readFile(new URL('../output/learning-execution/task-12-checkpoints.json', import.meta.url), 'utf8'));
  const commonFiles = [
    {path: 'src/paginacao.ts', content: 'export const paginaAtual = (pagina: number): number => pagina;\n'},
    {path: 'test/paginacao.test.js', content: 'export {};\n'},
    {path: 'tsconfig.json', content: '{"compilerOptions":{"strict":true,"noEmit":true}}\n'},
  ];
  for (const id of ['15.08', '23.08']) {
    const checkpoint = definitions.targets.find(target => target.id === id);
    assert.ok(checkpoint, `checkpoint ${id} is prepared`);
    const files = api().createProjectFiles({
      item: {id, title: checkpoint.title}, files: commonFiles,
      assessment: {
        environment: 'typescript', entryPath: 'src/paginacao.ts', testPath: 'test/paginacao.test.js', tsconfigPath: 'tsconfig.json',
        checks: ['types', 'local'], local: {commands: checkpoint.commands, evidence: checkpoint.evidence},
      },
      checkpoint,
    });
    const packageJson = JSON.parse(files.find(file => file.path === 'package.json').content);
    const lock = JSON.parse(files.find(file => file.path === 'package-lock.json').content);
    const manifest = JSON.parse(files.find(file => file.path === 'devpath-project.json').content);
    assert.equal(lock.packages['node_modules/typescript'].version, packageJson.devDependencies.typescript);
    assert.equal(lock.packages['node_modules/undici-types'].version, '7.24.6');
    assert.equal(manifest.evidenceSource, 'local-declared');
    assert.equal(manifest.verificationStatus, 'not-run-by-export');
    assert.match(files.find(file => file.path === 'README.md').content, /TypeScript 7\.0.*proxy local/);
    if (id === '23.08') assert.doesNotMatch(files.find(file => file.path === 'README.md').content, /acessibilidade.*verificad/i);
  }
});

async function saveProject(root, name, files) {
  const project = join(root, name);
  await mkdir(project, {recursive: true});
  for (const file of files) {
    const path = join(project, ...file.path.split('/'));
    const separator = path.lastIndexOf('\\');
    if (separator > 0) await mkdir(path.slice(0, separator), {recursive: true});
    await writeFile(path, file.content, 'utf8');
  }
  return project;
}

async function runContained(root, referenceDir, commands) {
  const testContext = process.env.NODE_TEST_CONTEXT;
  delete process.env.NODE_TEST_CONTEXT;
  try {
    return await checkLocalProject({rootDir: root, referenceDir, commands, timeoutMs: 30_000});
  } finally {
    if (testContext !== undefined) process.env.NODE_TEST_CONTEXT = testContext;
  }
}

test('exported DOM project is exercised structurally in a contained temporary copy', async () => {
  const harness = `const test = require('node:test');\nconst assert = require('node:assert/strict');\nconst fs = require('node:fs');\nconst {JSDOM} = require('jsdom');\ntest('DOM app adds user input as text', () => {\n const dom = new JSDOM(fs.readFileSync('index.html', 'utf8'), {runScripts: 'outside-only'});\n dom.window.eval(fs.readFileSync('app.js', 'utf8'));\n const input = dom.window.document.querySelector('#name');\n input.value = '<img src=x onerror=alert(1)>';\n dom.window.document.querySelector('#form').dispatchEvent(new dom.window.Event('submit', {bubbles: true, cancelable: true}));\n assert.equal(dom.window.document.querySelector('#items').textContent, '<img src=x onerror=alert(1)>');\n assert.equal(dom.window.document.querySelector('#items img'), null);\n dom.window.close();\n});\n`;
  const options = {
    item: {id: '11.08', title: 'Lista no navegador'},
    assessment: {environment: 'dom', entryPath: 'index.html', checks: ['local'], local: {commands: [], evidence: ['DOM antes e depois']}},
    checkpoint: {id: '11.08', title: 'Lista no navegador', instructions: ['Adicione uma linha pelo formulário.'], commands: [['node', '--test', 'test/dom-smoke.test.cjs']], expected: ['A nova linha aparece como texto literal.'], evidence: ['DOM antes e depois']},
    files: [
      {path: 'index.html', content: '<!doctype html><html><body><form id="form"><label for="name">Nome</label><input id="name"><button>Adicionar</button></form><ul id="items"></ul></body></html>\n'},
      {path: 'app.js', content: 'const form = document.querySelector("#form"); const input = document.querySelector("#name"); const list = document.querySelector("#items"); form.addEventListener("submit", event => { event.preventDefault(); const row = document.createElement("li"); row.textContent = input.value; list.append(row); });\n'},
      {path: 'style.css', content: 'body { font-family: sans-serif; }\n'},
      {path: 'test/dom-smoke.test.cjs', content: harness},
    ],
  };
  const files = api().createProjectFiles(options);
  const root = await mkdtemp(join(tmpdir(), 'devpath-dom-export-'));
  const previousNodePath = process.env.NODE_PATH;
  try {
    await saveProject(root, 'dom-project', files);
    process.env.NODE_PATH = fileURLToPath(new URL('../node_modules', import.meta.url));
    const result = await runContained(root, 'dom-project', [['node', '--test', 'test/dom-smoke.test.cjs']]);
    assert.equal(result.exitCode, 0, result.output);
    assert.match(result.output, /pass 1/);
  } finally {
    if (previousNodePath === undefined) delete process.env.NODE_PATH;
    else process.env.NODE_PATH = previousNodePath;
    await rm(root, {recursive: true, force: true});
  }
});

test('exported TypeScript project typechecks with the installed checker from a clean temporary copy', async () => {
  const name = 'devpath-15-08';
  const version = '1.0.0';
  const dependencies = {'@types/node': '24.19.1'};
  const devDependencies = {typescript: '6.0.3'};
  const hostLock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
  const packageLock = {
    name, version, lockfileVersion: 3,
    packages: {
      '': {name, version, devDependencies},
      'node_modules/@types/node': hostLock.packages['node_modules/@types/node'],
      'node_modules/typescript': hostLock.packages['node_modules/typescript'],
      'node_modules/undici-types': hostLock.packages['node_modules/undici-types'],
    },
  };
  const options = {
    item: {id: '15.08', title: 'Paginação em TypeScript'},
    assessment: {environment: 'typescript', entryPath: 'src/paginacao.ts', testPath: 'test/paginacao.test.js', tsconfigPath: 'tsconfig.json', checks: ['types', 'local'], local: {commands: [['node', '--test', 'test/paginacao.test.js']], evidence: ['runtime test', 'typecheck']}},
    checkpoint: {
      id: '15.08', title: 'Paginação em TypeScript', courseTypescript: '7.0',
      package: {name, version, private: true, type: 'module', engines: {node: '>=24.0.0'}, scripts: {test: 'node --test test/paginacao.test.js', typecheck: 'tsc --noEmit -p tsconfig.json'}, devDependencies},
      packageLock,
    },
    files: [
      {path: 'src/paginacao.ts', content: 'export function paginaAtual(total: number, tamanho: number, pagina: number): number { if (tamanho <= 0) throw new RangeError("tamanho"); return Math.max(1, Math.min(Math.ceil(total / tamanho), pagina)); }\n'},
      {path: 'test/paginacao.test.js', content: 'import { strict as assert } from "node:assert"; import { test } from "node:test"; import { paginaAtual } from "../src/paginacao.ts"; test("limita página", () => assert.equal(paginaAtual(50, 10, 9), 5));\n'},
      {path: 'tsconfig.json', content: '{"compilerOptions":{"strict":true,"target":"ES2022","module":"NodeNext","moduleResolution":"NodeNext","noEmit":true},"include":["src/**/*.ts"]}\n'},
    ],
  };
  const files = api().createProjectFiles(options);
  assert.match(files.find(file => file.path === 'README.md')?.content || '', /TypeScript 7\.0/);
  assert.match(files.find(file => file.path === 'README.md')?.content || '', /proxy local/);
  const root = await mkdtemp(join(tmpdir(), 'devpath-ts-export-'));
  try {
    await saveProject(root, 'ts-project', files);
    const checkerPath = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url));
    const result = await runContained(root, 'ts-project', [['node', '--test', 'test/paginacao.test.js'], [process.execPath, checkerPath, '--version'], [process.execPath, checkerPath, '--noEmit', '--project', 'tsconfig.json']]);
    assert.equal(result.exitCode, 0, result.output);
    assert.match(result.output, /Version 6\.0\.3/);
  } finally {
    await rm(root, {recursive: true, force: true});
  }
});


// ---- Task 12 UI integration: export button, Git instructions, eligibility, current workspace files ----

const {JSDOM: PanelJSDOM} = await import('jsdom');
await import('../public/local-checkpoints.js');
await import('../public/local-project-panel.js');
const panel = globalThis.DevPathLocalProjectPanel;
const checkpoints = globalThis.DevPathLocalCheckpoints;
assert.ok(panel?.enhance && panel?.renderPanel, 'public/local-project-panel.js must expose enhance and renderPanel');
assert.ok(checkpoints?.byId, 'public/local-checkpoints.js must expose byId');

function sortedPaths(paths) { return [...paths].sort((a, b) => a.localeCompare(b, 'en')); }

async function publicCatalog() {
  const catalog = JSON.parse(await readFile(new URL('../public/course-catalog.json', import.meta.url), 'utf8'));
  const assessments = JSON.parse(await readFile(new URL('../public/course-assessments.json', import.meta.url), 'utf8'));
  return {catalog: Array.isArray(catalog) ? catalog : Object.values(catalog), assessments: assessments.assessment || assessments};
}

function loadPanelDom(markup) {
  const dom = new PanelJSDOM(markup, {runScripts: 'outside-only', url: 'https://devpath.test/'});
  dom.window.eval(readFileSync(new URL('../public/local-checkpoints.js', import.meta.url), 'utf8'));
  dom.window.eval(readFileSync(new URL('../public/local-project-panel.js', import.meta.url), 'utf8'));
  return dom;
}

test('JS project export has the expected file list and coherent Node package metadata', () => {
  const files = api().createProjectFiles(fixtureOptions());
  assert.deepEqual(files.map(file => file.path), sortedPaths(['README.md', 'devpath-project.json', 'package-lock.json', 'package.json', 'src/format.js', 'src/main.js', 'test/main.test.js']));
  const packageJson = JSON.parse(files.find(file => file.path === 'package.json').content);
  const lock = JSON.parse(files.find(file => file.path === 'package-lock.json').content);
  assert.equal(packageJson.scripts.test, 'node --test test/main.test.js');
  assert.equal(packageJson.type, 'module');
  assert.equal(lock.name, packageJson.name);
  assert.equal(lock.version, packageJson.version);
  assert.equal(lock.packages[''].name, packageJson.name);
});

test('DOM project export keeps browser files and does not invent Node package metadata', () => {
  const files = api().createProjectFiles({
    item: {id: '11.08', title: 'Lista no navegador'},
    assessment: {environment: 'dom', entryPath: 'index.html', checks: ['local'], local: {commands: [], evidence: ['DOM antes e depois']}},
    checkpoint: {id: '11.08', title: 'Lista no navegador', instructions: ['Adicione uma linha.'], commands: [], expected: ['Linha aparece.'], evidence: ['DOM']},
    files: [
      {path: 'index.html', content: '<!doctype html><html><body><ul id="items"></ul></body></html>\n'},
      {path: 'app.js', content: 'document.querySelector("#items");\n'},
      {path: 'style.css', content: 'body {}\n'},
    ],
  });
  assert.deepEqual(files.map(file => file.path), sortedPaths(['README.md', 'app.js', 'devpath-project.json', 'index.html', 'style.css']));
  assert.equal(files.some(file => file.path === 'package.json'), false);
});

test('TypeScript export lists the expected files and keeps tsconfig, scripts and typescript pin coherent', async () => {
  const name = 'devpath-15-08';
  const devDependencies = {typescript: '6.0.3'};
  const hostLock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
  const files = api().createProjectFiles({
    item: {id: '15.08', title: 'Paginação em TypeScript'},
    files: [
      {path: 'src/paginacao.ts', content: 'export const paginaAtual = (pagina: number): number => pagina;\n'},
      {path: 'test/paginacao.test.js', content: 'export {};\n'},
      {path: 'tsconfig.json', content: '{"compilerOptions":{"strict":true,"noEmit":true},"include":["src/**/*.ts"]}\n'},
    ],
    assessment: {environment: 'typescript', entryPath: 'src/paginacao.ts', tsconfigPath: 'tsconfig.json', checks: ['types', 'local']},
    checkpoint: {
      id: '15.08', title: 'Paginação em TypeScript', courseTypescript: '7.0',
      commands: [['npm', 'run', 'typecheck']],
      package: {name, version: '1.0.0', private: true, type: 'module', scripts: {test: 'node --test test/paginacao.test.js', typecheck: 'tsc --noEmit -p tsconfig.json'}, devDependencies},
      packageLock: {name, version: '1.0.0', lockfileVersion: 3, packages: {
        '': {name, version: '1.0.0', devDependencies},
        'node_modules/typescript': hostLock.packages['node_modules/typescript'],
      }},
    },
  });
  assert.deepEqual(files.map(file => file.path), sortedPaths(['README.md', 'devpath-project.json', 'package-lock.json', 'package.json', 'src/paginacao.ts', 'test/paginacao.test.js', 'tsconfig.json']));
  const packageJson = JSON.parse(files.find(file => file.path === 'package.json').content);
  const lock = JSON.parse(files.find(file => file.path === 'package-lock.json').content);
  const tsconfig = JSON.parse(files.find(file => file.path === 'tsconfig.json').content);
  assert.match(packageJson.scripts.typecheck, /tsc --noEmit -p tsconfig\.json/);
  assert.equal(tsconfig.compilerOptions.strict, true);
  assert.equal(lock.packages['node_modules/typescript'].version, packageJson.devDependencies.typescript);
  const manifest = JSON.parse(files.find(file => file.path === 'devpath-project.json').content);
  assert.equal(manifest.courseTypescript, '7.0');
  assert.equal(manifest.checkerTypescript, '6.0.3');
  assert.match(files.find(file => file.path === 'README.md').content, /proxy local/);
});

test('grader-only assessment fields never leave the exported assessment', () => {
  const stripped = panel.exportAssessment({
    environment: 'javascript', entryPath: 'src/main.js', testPath: '__devpath_tests__.js', fixturesPath: 'f.json',
    referenceDir: 'solutions/x', sourceTestPath: 'tests/x.test.js', tests: 'test("x")', transfer: {id: 't'}, expectedDiagnostics: [], checks: ['behavior'],
  }, [{path: 'src/main.js', content: ''}]);
  assert.deepEqual(stripped, {environment: 'javascript', entryPath: 'src/main.js', checks: ['behavior']});
  assert.equal(panel.exportAssessment({entryPath: 'src/gone.js'}, [{path: 'src/main.js', content: ''}]).entryPath, undefined);
});

test('the checkpoint mirror matches the source checkpoint definitions exactly', async () => {
  const source = JSON.parse(await readFile(new URL('../output/learning-execution/task-12-checkpoints.json', import.meta.url), 'utf8'));
  assert.deepEqual(JSON.parse(JSON.stringify(checkpoints.targets)), source.targets);
});

test('export button and Git block render only for eligible activities', async () => {
  const {catalog, assessments} = await publicCatalog();
  const eligible = new Set(catalog.filter(item => panel.isEligible(item, assessments[item.id], checkpoints.byId(item.id))).map(item => item.id));
  for (const item of catalog) {
    const expected = Boolean(checkpoints.byId(item.id)) || item.kind === 'PROJECT' || ['local', 'dom', 'typescript'].includes(assessments[item.id]?.environment || item.assessmentEnvironment);
    assert.equal(eligible.has(item.id), expected, `eligibility for ${item.id}`);
  }
  for (const id of ['00.09', '01.09', '04.09', '11.08', '14.08', '15.08', '23.08']) assert.ok(eligible.has(id), `checkpoint ${id} is eligible`);
  assert.ok(eligible.has('14.03') && eligible.has('23.07') && eligible.has('22.01'), 'local activities are eligible');
  assert.ok(!eligible.has('02.01') && !eligible.has('00.01'), 'plain single-file activities are not eligible');
  const ineligible = catalog.find(item => item.id === '02.01');
  assert.equal(panel.renderPanel(ineligible, {assessment: assessments['02.01']}), '');
  const local = catalog.find(item => item.id === '14.03');
  assert.match(panel.renderPanel(local, {assessment: assessments['14.03']}), /data-local-export="14\.03"/);
});

test('Git checkpoints for local activities are rendered as copyable instructional commands', async () => {
  const {catalog, assessments} = await publicCatalog();
  const dom = new PanelJSDOM('<!doctype html><div id="host"></div>', {url: 'https://devpath.test/'});
  const host = dom.window.document.getElementById('host');
  const item = catalog.find(candidate => candidate.id === '14.08');
  host.innerHTML = panel.renderPanel(item, {assessment: assessments['14.08']});
  const commands = host.querySelector('.local-git-commands')?.textContent || '';
  for (const line of ['git init', 'git status --short', 'git add README.md package.json src test', 'git commit -m "checkpoint: baseline"', 'git commit -m "checkpoint: ajuste pequeno"', 'git log -2 --oneline']) {
    assert.ok(commands.includes(line), `Git instruction rendered: ${line}`);
  }
  assert.match(host.textContent, /O app não executa estes comandos/);
  assert.match(host.textContent, /Use depois do primer de Git/);
  // Stages that do not need Git yet show the reason instead of commands.
  host.innerHTML = panel.renderPanel(catalog.find(candidate => candidate.id === '00.09'), {assessment: assessments['00.09']});
  assert.equal(host.querySelector('.local-git-commands'), null);
  assert.match(host.textContent, /Git nesta etapa/);
});

test('enhance places the button in the practice section and exports the current editor text', async () => {
  const {catalog, assessments} = await publicCatalog();
  const item = catalog.find(candidate => candidate.id === '14.03');
  const dom = loadPanelDom('<article class="course-lesson"><header>x</header><section id="g-practice"><textarea data-course-editor="14.03" data-course-file="package.json">{"edited": true}</textarea></section></article>');
  const calls = [];
  const toasts = [];
  const exporter = {downloadProject: async input => { calls.push(input); return {filename: '14-03.zip'}; }};
  const view = dom.window.document.querySelector('.course-lesson');
  const node = dom.window.DevPathLocalProjectPanel.enhance(view, item, {assessment: assessments['14.03'], exporter, toast: message => toasts.push(message), loadDraft: () => ({})});
  assert.ok(node, 'panel is inserted for an eligible activity');
  assert.equal(dom.window.document.querySelector('#g-practice [data-local-export="14.03"]').tagName, 'BUTTON');
  dom.window.document.querySelector('[data-local-export="14.03"]').click();
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(calls.length, 1);
  assert.equal(JSON.stringify(calls[0].files), JSON.stringify([{path: 'package.json', content: '{"edited": true}'}]));
  assert.equal(calls[0].assessment.testPath, undefined);
  assert.match(dom.window.document.querySelector('[data-local-export-status="14.03"]').textContent, /Download preparado: 14-03\.zip/);
  assert.deepEqual(toasts, []);
});

test('a failed export reports an error toast and re-enables the button', async () => {
  const {catalog, assessments} = await publicCatalog();
  const item = catalog.find(candidate => candidate.id === '14.03');
  const dom = loadPanelDom('<article class="course-lesson"><section id="g-practice"></section></article>');
  const toasts = [];
  const exporter = {downloadProject: async () => { throw new Error('Project file path must be relative and cannot contain a drive or URL: C:/x'); }};
  const view = dom.window.document.querySelector('.course-lesson');
  dom.window.DevPathLocalProjectPanel.enhance(view, item, {assessment: assessments['14.03'], exporter, toast: message => toasts.push(message), loadDraft: () => ({'package.json': '{}'})});
  const button = dom.window.document.querySelector('[data-local-export="14.03"]');
  button.focus();
  button.click();
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(toasts.length, 1);
  assert.equal(toasts[0], 'Não foi possível exportar o projeto: um caminho de arquivo não é permitido neste projeto.');
  assert.equal(button.disabled, false);
  assert.equal(button.hasAttribute('aria-busy'), false);
  assert.equal(dom.window.document.activeElement, button, 'focus stays on the export button after a failure');
});

test('unknown exporter errors reach the learner as a Portuguese sentence, not the raw developer text', async () => {
  const {catalog, assessments} = await publicCatalog();
  const item = catalog.find(candidate => candidate.id === '14.03');
  const dom = loadPanelDom('<article class="course-lesson"><section id="g-practice"></section></article>');
  const toasts = [];
  const exporter = {downloadProject: async () => { throw new TypeError('undefined is not a function'); }};
  dom.window.DevPathLocalProjectPanel.enhance(dom.window.document.querySelector('.course-lesson'), item, {assessment: assessments['14.03'], exporter, toast: message => toasts.push(message), loadDraft: () => ({'package.json': '{}'})});
  dom.window.document.querySelector('[data-local-export="14.03"]').click();
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(toasts[0], 'Não foi possível exportar o projeto: ocorreu um erro inesperado ao montar o pacote. Tente novamente.');
  assert.doesNotMatch(toasts[0], /undefined is not/);
});

test('the export button stays focused and is marked busy while the package is prepared', async () => {
  const {catalog, assessments} = await publicCatalog();
  const item = catalog.find(candidate => candidate.id === '14.03');
  const dom = loadPanelDom('<article class="course-lesson"><section id="g-practice"></section></article>');
  let release;
  const exporter = {downloadProject: () => new Promise(resolve => { release = () => resolve({filename: '14-03.zip'}); })};
  dom.window.DevPathLocalProjectPanel.enhance(dom.window.document.querySelector('.course-lesson'), item, {assessment: assessments['14.03'], exporter, loadDraft: () => ({'package.json': '{}'})});
  const button = dom.window.document.querySelector('[data-local-export="14.03"]');
  button.focus();
  button.click();
  assert.equal(button.disabled, false, 'the control is not disabled while busy');
  assert.equal(button.getAttribute('aria-busy'), 'true');
  assert.equal(dom.window.document.activeElement, button);
  button.click();
  release();
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(button.hasAttribute('aria-busy'), false);
  assert.equal(dom.window.document.querySelector('[data-local-export-status="14.03"]').textContent, 'Download preparado: 14-03.zip. Revise o arquivo antes de executar.');
});

test('the export never sends grader-only assessment fields, including the full declared list', async () => {
  const grader = ['testPath', 'testPaths', 'behaviorTestPath', 'sourceTestPath', 'tests', 'assertionCases', 'fixturesPath', 'fixtures', 'referenceDir', 'correctFiles', 'mutantDirs', 'studentSuite', 'studentSuiteKind', 'typecheckMutants', 'typeContractMutants', 'contractTypeFiles', 'typeEntryPath', 'transfer', 'expectedDiagnostics'];
  const assessment = {environment: 'typescript', version: 2, checks: ['types'], entryPath: 'src/index.ts', tsconfigPath: 'tsconfig.json', local: {commands: [['node', 'src/index.ts']], evidence: []}};
  for (const field of grader) assessment[field] = field === 'mutantDirs' || field === 'correctFiles' ? [{path: 'secret.ts', content: 'x'}] : 'secret';
  const exported = panel.exportAssessment(assessment, [{path: 'src/index.ts', content: ''}, {path: 'tsconfig.json', content: '{}'}]);
  for (const field of grader) assert.equal(Object.hasOwn(exported, field), false, `${field} must not leave the grader`);
  assert.equal(exported.entryPath, 'src/index.ts');
  assert.equal(exported.environment, 'typescript');
});

test('enhance hands the declared checkpoint to the exporter', async () => {
  const {catalog, assessments} = await publicCatalog();
  const item = catalog.find(candidate => candidate.id === '15.08');
  const dom = loadPanelDom('<article class="course-lesson"><section id="g-practice"></section></article>');
  const calls = [];
  const exporter = {downloadProject: async input => { calls.push(input); return {filename: '15-08.zip'}; }};
  const view = dom.window.document.querySelector('.course-lesson');
  dom.window.DevPathLocalProjectPanel.enhance(view, item, {assessment: assessments['15.08'], exporter, loadDraft: () => ({'package.json': '{}'})});
  dom.window.document.querySelector('[data-local-export="15.08"]').click();
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(calls.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0].checkpoint)), JSON.parse(JSON.stringify(dom.window.DevPathLocalCheckpoints.byId('15.08'))));
});

test('an ineligible activity receives no export button in the DOM', () => {
  const dom = loadPanelDom('<article class="course-lesson"><section id="g-practice"></section></article>');
  const view = dom.window.document.querySelector('.course-lesson');
  const result = dom.window.DevPathLocalProjectPanel.enhance(view, {id: '02.01', title: 'x', kind: 'PREDICT'}, {assessment: {environment: 'javascript'}});
  assert.equal(result, null);
  assert.equal(dom.window.document.querySelector('[data-local-export]'), null);
});
