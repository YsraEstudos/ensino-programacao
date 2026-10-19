import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const recipe = (stage, id) => read(`course-src/recipes/${stage}.py`).split('\n').find((line) => line.includes(`"${id}"`)) ?? '';
const installedTypeScript = path.join(root, 'node_modules/typescript');

function typeContract(label, sourceFiles, probe, options = []) {
  assert.ok(fs.existsSync(installedTypeScript), 'TypeScript 6.0.3 package must be available for isolated type checks');
  assert.equal(JSON.parse(fs.readFileSync(path.join(installedTypeScript, 'package.json'), 'utf8')).version, '6.0.3');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), `devpath-${label}-`));
  try {
    const isolatedTypeScript = path.join(directory, 'node_modules/typescript');
    fs.mkdirSync(path.dirname(isolatedTypeScript), {recursive: true});
    fs.cpSync(installedTypeScript, isolatedTypeScript, {recursive: true});
    for (const [name, source] of Object.entries(sourceFiles)) fs.writeFileSync(path.join(directory, name), source);
    fs.writeFileSync(path.join(directory, 'contract.test.ts'), probe);
    execFileSync(process.execPath, [path.join(isolatedTypeScript, 'bin/tsc'), '--strict', '--noEmit', '--skipLibCheck', '--target', 'es2022', ...options, 'contract.test.ts'], {cwd: directory, stdio: 'pipe'});
  } finally {
    fs.rmSync(directory, {recursive: true, force: true});
  }
}

const level = recipe(16, '16.06');
assert.match(level, /NIVEIS.*leitor.*editor.*admin/i, '16.06 uses the real access-level list');
assert.doesNotMatch(level, /STATUS|idle|loading|done/, '16.06 examples agree with the access-level starter');
assert.match(read('course-src/starters/16.06/acesso.ts'), /as const[\s\S]*typeof NIVEIS\)\[number\]/);
assert.match(read('course-src/solutions/16.06/acesso.ts'), /as const[\s\S]*typeof NIVEIS\)\[number\]/);
assert.match(read('course-src/solutions/16.06/README.md'), /não congela.*runtime/i);

const repository = recipe(17, '17.02');
assert.match(repository, /kind="MODIFY"/);
assert.doesNotMatch(repository, /kind="PARSONS"|blocos/);
assert.match(read('course-src/starters/17.02/repositorio.ts'), /Repository<T>/);
assert.doesNotMatch(read('course-src/starters/17.02/repositorio.ts'), /Map</);
assert.match(read('course-src/solutions/17.02/repository.ts'), /pair<K,\s*V>[\s\S]*Repository<T extends Entity>/);
assert.match(read('course-src/solutions/17.02/README.md'), /entidade (?:específica|concreta)[\s\S]*undefined/i);

const patchRecipe = recipe(18, '18.02');
assert.match(patchRecipe, /aplicarPatch/);
assert.match(patchRecipe, /Usuario|Perfil/);
assert.match(patchRecipe, /prompt=/);
assert.match(patchRecipe, /aplicarPatch\(usuario,\{nome:'Bia'\}\) ->/);
assert.match(patchRecipe, /aplicarPatch\(usuario,\{perfil:/);
assert.match(patchRecipe, /Perfil inteiro[^\n]*JSON externo exige guard runtime/);
assert.match(read('course-src/starters/18.02/patch.ts'), /Tarefa: substitua any/);
assert.match(read('course-src/solutions/18.02/patch.ts'), /aplicarPatch[\s\S]*patch: Partial<T>/);
assert.doesNotMatch(read('course-src/solutions/18.02/patch.ts'), /patch: any/);
assert.match(read('course-src/solutions/18.02/README.md'), /spread superficial[\s\S]*Perfil[\s\S]*substitu/i);

assert.match(read('course-src/starters/19.01/flags.ts'), /Flags<T>\s*=\s*{[\s\S]*boolean/);
assert.doesNotMatch(read('course-src/starters/19.01/flags.ts'), /unknown/);
assert.match(read('course-src/starters/19.02/element.ts'), /\?\s*U\s*:\s*T/);
assert.match(read('course-src/solutions/19.02/element.ts'), /\?\s*U\s*:\s*T/);
assert.match(recipe(19, '19.06'), /theme.*retries/i);
assert.match(read('course-src/starters/19.06/mutable.ts'), /theme[\s\S]*retries/);
assert.match(read('course-src/solutions/19.06/README.md'), /Settings[\s\S]*exactOptionalPropertyTypes/);

typeContract('16-06', {'acesso.ts': read('course-src/solutions/16.06/acesso.ts')}, `import {NIVEIS, type Nivel} from './acesso';
const allowed: Nivel = 'editor';
// @ts-expect-error level is outside the product list
const rejected: Nivel = 'dono';
// @ts-expect-error readonly is a checker constraint
NIVEIS.push('dono');
void allowed; void rejected;`);
typeContract('17-02', {'repository.ts': read('course-src/solutions/17.02/repository.ts')}, `import {pair, wrap, type Repository, type Entity} from './repository';
const tuple: [string, number] = pair('id', 2);
const wrapped: {value: number} = wrap(2);
type User = Entity & {name: string};
declare const repo: Repository<User>;
const found: User | undefined = repo.get('u1');
// @ts-expect-error ID is a string
repo.get(1);
// @ts-expect-error concrete entity fields remain required
repo.save({id: 'u2'});
void tuple; void wrapped; void found;`);
typeContract('18-02', {'patch.ts': read('course-src/solutions/18.02/patch.ts')}, `import {aplicarPatch, type Usuario} from './patch';
const base: Usuario = {id: 1, nome: 'Ana', perfil: {nome: 'Pessoal', tema: 'claro'}};
const next: Usuario = aplicarPatch(base, {nome: 'Bia'});
const profile: Usuario['perfil'] = next.perfil;
// @ts-expect-error patch preserves the numeric id contract
aplicarPatch(base, {id: '1'});
void profile;`);
typeContract('19-01', {'flags.ts': read('course-src/solutions/19.01/flags.ts')}, `import type {Flags, User} from './flags';
type Equal<A,B> = (<T>()=>T extends A?1:2) extends (<T>()=>T extends B?1:2) ? true : false;
type Expect<T extends true> = T;
type Shape = Expect<Equal<Flags<User>, {id:boolean;name:boolean;active:boolean}>>;
const valid: Flags<User> = {id:true,name:false,active:true};
// @ts-expect-error every mapped property is boolean
const invalid: Flags<User> = {id:true,name:'yes',active:false};
void valid; void invalid; void (null as unknown as Shape);`);
typeContract('19-02', {'element.ts': read('course-src/solutions/19.02/element.ts')}, `import type {ElementOrSelf} from './element';
type Equal<A,B> = (<T>()=>T extends A?1:2) extends (<T>()=>T extends B?1:2) ? true : false;
type Expect<T extends true> = T;
type MutableArray = Expect<Equal<ElementOrSelf<string[]>,string>>;
type ReadonlyTuple = Expect<Equal<ElementOrSelf<readonly ['a','b']>,'a'|'b'>>;
type Scalar = Expect<Equal<ElementOrSelf<number>,number>>;
type DistributedUnion = Expect<Equal<ElementOrSelf<string[]|number>,string|number>>;
void (null as unknown as MutableArray); void (null as unknown as ReadonlyTuple); void (null as unknown as Scalar); void (null as unknown as DistributedUnion);`);
const settingsSource = read('course-src/solutions/19.06/mutable.ts');
typeContract('19-06-exact', {'mutable.ts': settingsSource}, `import type {MutableRequired} from './mutable';
type Explicit = MutableRequired<{readonly value?: string | undefined}>;
const explicitUndefined: Explicit = {value: undefined};
// @ts-expect-error required mapped property cannot be omitted
const absent: Explicit = {};
void explicitUndefined; void absent;`, ['--exactOptionalPropertyTypes']);
typeContract('19-06-inexact', {'mutable.ts': settingsSource}, `import type {MutableRequired} from './mutable';
type Implicit = MutableRequired<{readonly value?: string}>;
// @ts-expect-error without exactOptionalPropertyTypes, -? removes the optional property's implicit undefined
const explicitUndefined: Implicit = {value: undefined};
// @ts-expect-error required mapped property cannot be omitted
const absent: Implicit = {};
void explicitUndefined; void absent;`);

for (const id of ['16.08', '17.08', '19.08']) {
  const pkg = JSON.parse(read(`course-src/starters/${id}/package.json`));
  assert.ok(pkg.scripts?.test, `${id} documents a runnable test command`);
  assert.ok(pkg.scripts?.typecheck, `${id} documents a separate static typecheck`);
  assert.ok(pkg.devDependencies?.typescript, `${id} declares TypeScript`);
  assert.ok(pkg.devDependencies?.['@types/node'], `${id} declares Node.js types`);
  assert.ok(fs.existsSync(path.join(root, `course-src/starters/${id}/package-lock.json`)), `${id} has a lockfile`);
}

const reinforcements = [
  [16, '16.05', /predicate|promete/], [16, '16.06', /Object\.isFrozen|congelamento/],
  [16, '16.08', /transiç|cancel|incompatível/], [17, '17.01', /assinatura/],
  [17, '17.06', /assinatura/], [17, '17.08', /undefined|has/],
  [18, '18.02', /superficial|aninhad/], [18, '18.06', /rota|chave/],
  [18, '18.08', /JSON|valida/], [19, '19.07', /complexidade|recurs/],
  [19, '19.08', /evento|payload/],
];
for (const [stage, id, evidence] of reinforcements) {
  assert.match(recipe(stage, id), evidence, `${id} retains its proportional study reinforcement`);
}

console.log('Stage 16–19 source and contract checks passed.');
