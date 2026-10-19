import assert from 'node:assert/strict';
import {cp, mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const root = process.cwd();
const scratch = await mkdtemp(path.join(os.tmpdir(), 'devpath-stage22-'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(command, args, cwd, expected = 0) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: 120_000,
    windowsHide: true,
    shell: process.platform === 'win32',
  });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  assert.equal(result.status, expected, `${command} ${args.join(' ')} failed in ${cwd}\n${output}`);
  return output;
}

try {
  const recipe = await readFile(path.join(root, 'course-src/recipes/22.py'), 'utf8');
  const schemaSource = await readFile(path.join(root, 'course-src/solutions/22.06/schema.ts'), 'utf8');
  const starterSchema = await readFile(path.join(root, 'course-src/starters/22.06/schema.ts'), 'utf8');
  const stage09Recipe = recipe.match(/"22\.09": C\(([^\n]+)/)?.[1] || '';
  const starterManifest = JSON.parse(await readFile(path.join(root, 'course-src/starters/manifest.json'), 'utf8'));
  const stage06Starter = await readFile(path.join(root, 'course-src/starters/22.06/README.md'), 'utf8');
  const stage06Verify = await readFile(path.join(root, 'course-src/starters/22.06/verify.mjs'), 'utf8');
  const stage09Package = JSON.parse(await readFile(path.join(root, 'course-src/starters/22.09/package.json'), 'utf8'));
  const stage09Lock = JSON.parse(await readFile(path.join(root, 'course-src/starters/22.09/package-lock.json'), 'utf8'));
  const stage09Config = JSON.parse(await readFile(path.join(root, 'course-src/starters/22.09/tsconfig.json'), 'utf8'));
  const stage09Consumer = await readFile(path.join(root, 'course-src/starters/22.09/consumer.ts'), 'utf8');
  const stage09StarterIndex = await readFile(path.join(root, 'course-src/starters/22.09/src/index.ts'), 'utf8');
  const assessmentManifest = JSON.parse(await readFile(path.join(root, 'course-src/assessments.json'), 'utf8'));
  for (const id of ['22.06', '22.09']) {
    for (const file of starterManifest[id].files) {
      await readFile(path.join(root, 'course-src/starters', id, file));
    }
  }
  for (const file of ['README.md', 'pagamento.js', 'schema.ts', 'verify.mjs']) {
    assert.ok(starterManifest['22.06'].files.includes(file), `22.06 starter manifest includes ${file}`);
  }
  for (const file of ['README.md', 'consumer.ts', 'package-lock.json', 'package.json', 'src/isolated-demo.ts', 'tsconfig.json']) {
    assert.ok(starterManifest['22.09'].files.includes(file), `22.09 starter manifest includes ${file}`);
  }
  for (const file of ['schema.ts', 'verify.mjs']) {
    assert.ok(assessmentManifest['22.06'].correctFiles.some(item => item.path === file), `22.06 reference includes ${file}`);
  }
  assert.match(stage06Starter, /npm pkg set type=module/);
  assert.match(stage06Starter, /npm install --save-exact zod@3\.25\.76 typescript@6\.0\.3/);
  assert.match(stage06Starter, /node --experimental-strip-types verify\.mjs/);
  assert.match(stage06Verify, /validarPagamento/);
  assert.match(stage06Verify, /validarComSchema/);
  assert.equal(stage09Package.name, 'slug-kit');
  assert.equal(stage09Package.devDependencies.typescript, '6.0.3');
  assert.equal(stage09Lock.name, 'slug-kit');
  assert.equal(stage09Lock.packages[''].name, 'slug-kit');
  assert.ok(stage09Config.include.includes('src/isolated-demo.ts'));
  assert.match(stage09Consumer, /from'slug-kit'/);
  assert.match(stage09Consumer, /\.\/dist\/isolated-demo\.js/);
  assert.match(stage09StarterIndex, /export function criarSlug\(texto: string\) \{/);
  assert.doesNotMatch(stage09StarterIndex, /criarSlug\(texto: string\): string/);
  assert.match(recipe, /Zod 3\.25\.76/);
  assert.match(recipe, /payload null e id vazio/);
  assert.match(starterSchema, /TODO/i);
  assert.doesNotMatch(starterSchema, /z\.number\(\)\.finite/);
  assert.doesNotMatch(starterSchema, /z\.coerce\.number\(\)\s*\(/);
  assert.match(schemaSource, /z\.number\(\)\.finite/);
  assert.match(schemaSource, /z\.infer<typeof PagamentoSchema>/);
  assert.match(stage09Recipe, /expressão trivial inferível/);
  assert.match(stage09Recipe, /TypeScript 6\.0\.3/);

  const paymentDir = path.join(scratch, '22.06');
  await mkdir(paymentDir, {recursive: true});
  await cp(path.join(root, 'course-src/solutions/22.06/pagamento.js'), path.join(paymentDir, 'pagamento.mjs'));
  await cp(path.join(root, 'course-src/solutions/22.06/schema.ts'), path.join(paymentDir, 'schema.ts'));
  await writeFile(path.join(paymentDir, 'package.json'), JSON.stringify({
    name: 'stage22-schema-check',
    private: true,
    type: 'module',
    devDependencies: {typescript: '6.0.3', zod: '3.25.76'},
  }, null, 2));
  await mkdir(path.join(paymentDir, 'node_modules'), {recursive: true});
  await cp(path.join(root, 'node_modules/typescript'), path.join(paymentDir, 'node_modules/typescript'), {recursive: true});
  await cp(path.join(root, 'node_modules/zod'), path.join(paymentDir, 'node_modules/zod'), {recursive: true});
  assert.equal(JSON.parse(await readFile(path.join(paymentDir, 'node_modules/zod/package.json'), 'utf8')).version, '3.25.76');
  assert.equal(JSON.parse(await readFile(path.join(paymentDir, 'node_modules/typescript/package.json'), 'utf8')).version, '6.0.3');
  run('node', ['node_modules/typescript/bin/tsc', '--strict', '--target', 'ES2022', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--noEmit', 'schema.ts'], paymentDir);
  await writeFile(path.join(paymentDir, 'verify.mjs'), `
import assert from 'node:assert/strict';
import {validarPagamento} from './pagamento.mjs';
import {validarComSchema} from './schema.ts';
const cases = [
  [{id:'p1',amount:10}, true],
  [{id:'p1',amount:'10'}, false],
  [{id:'p1',amount:Infinity}, false],
  [{id:'p1',amount:NaN}, false],
  [{id:'p1',amount:null}, false],
  [null, false],
  [{id:'',amount:1}, false],
];
for (const [value, expected] of cases) {
  const guard = validarPagamento(value);
  const schema = validarComSchema(value);
  assert.equal(guard.ok, expected, 'manual guard matrix');
  assert.equal(schema.ok, expected, 'Zod matrix');
  if (expected) {
    assert.deepEqual(guard.valor, value);
    assert.deepEqual(schema.valor, value);
  }
}
console.log('22.06: guard and Zod accept/reject the same 7 inputs without coercion.');
`);
  run('node', ['--experimental-strip-types', 'verify.mjs'], paymentDir);

  const slugDir = path.join(scratch, '22.09');
  await cp(path.join(root, 'course-src/solutions/22.09'), slugDir, {recursive: true});
  await mkdir(path.join(slugDir, 'node_modules'), {recursive: true});
  await cp(path.join(root, 'node_modules/typescript'), path.join(slugDir, 'node_modules/typescript'), {recursive: true});
  const compilerVersion = run('node', ['node_modules/typescript/bin/tsc', '--version'], slugDir).trim();
  assert.equal(compilerVersion, 'Version 6.0.3');
  run('node', ['--experimental-strip-types', '--test', 'src/index.test.ts'], slugDir);
  run('node', ['node_modules/typescript/bin/tsc', '--project', 'tsconfig.json', '--emitDeclarationOnly', '--outDir', 'dist'], slugDir);
  run('node', ['node_modules/typescript/bin/tsc', '--ignoreConfig', '--noEmit', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', '--target', 'ES2022', '--strict', 'consumer.ts'], slugDir);
  const demoDeclaration = await readFile(path.join(slugDir, 'dist/isolated-demo.d.ts'), 'utf8');
  assert.match(demoDeclaration, /um\(\): number/);
  assert.match(demoDeclaration, /tamanho\(texto: string\): number/);

  await writeFile(path.join(slugDir, 'bad-isolated.ts'), 'export function tamanho(texto: string) { return texto.length; }\n');
  const diagnostic = run('node', ['node_modules/typescript/bin/tsc', '--ignoreConfig', '--strict', '--declaration', '--isolatedDeclarations', '--noEmit', '--target', 'ES2022', '--module', 'ESNext', '--pretty', 'false', 'bad-isolated.ts'], slugDir, 2);
  assert.match(diagnostic, /TS9007/);
  console.log('22.09: TypeScript 6.0.3 emits .d.ts, accepts um(), and reports TS9007 for an unannotated body-dependent return.');
} finally {
  await rm(scratch, {recursive: true, force: true});
}
