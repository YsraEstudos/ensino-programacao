import assert from 'node:assert/strict';
import {cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

await import('../public/course-project-export.js');

const root = fileURLToPath(new URL('../', import.meta.url));
const readJson = relative => JSON.parse(readFileSync(path.join(root, relative), 'utf8'));
const item = readJson('public/course-catalog.json').find(activity => activity.id === '24.01');
const assessment = readJson('course-src/assessments.json')['24.01'];
const checkpoint = readJson('course-src/local-checkpoints.json').targets.find(target => target.id === '24.01');
const manifest = readJson('course-src/starters/manifest.json')['24.01'];
const fixture = path.join(root, 'course-src/phase7/common');
assert.ok(item && assessment && checkpoint && manifest, '24.01 catalog, assessment, checkpoint, and manifest must exist');

const temp = mkdtempSync(path.join(tmpdir(), 'p7-common-export-'));
const project = path.join(temp, 'project');
mkdirSync(project);
const node = process.env.DEVPATH_NODE || process.execPath;
const env = {...process.env};
delete env.NODE_TEST_CONTEXT;
const pathKey = Object.keys(env).find(key => key.toLowerCase() === 'path') || 'PATH';
env[pathKey] = path.dirname(node) + path.delimiter + (env[pathKey] || '');
if (!env.PLAYWRIGHT_BROWSERS_PATH) {
  const browsersPath = path.join(root, 'course-src/phase7/frontend/.browsers');
  if (existsSync(browsersPath)) env.PLAYWRIGHT_BROWSERS_PATH = browsersPath;
}

const runNpm = (args, timeout = 90_000) => process.platform === 'win32'
  ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `npm.cmd ${args.join(' ')}`], {cwd: project, env, encoding: 'utf8', timeout, windowsHide: true})
  : spawnSync('npm', args, {cwd: project, env, encoding: 'utf8', timeout});

try {
  const exported = await globalThis.DevPathCourseProjectExport.downloadProject(
    {item, files: item.starterFiles, assessment, checkpoint},
    {triggerDownload: false},
  );
  const bytes = Buffer.from(await exported.blob.arrayBuffer());
  writeFileSync(path.join(temp, '24.01.zip'), bytes);
  const paths = [];
  let offset = 0;
  while (offset + 30 <= bytes.length && bytes.readUInt32LE(offset) === 0x04034b50) {
    assert.equal(bytes.readUInt16LE(offset + 8), 0, 'real exporter ZIP entries are stored');
    const length = bytes.readUInt32LE(offset + 18);
    const nameLength = bytes.readUInt16LE(offset + 26);
    const extraLength = bytes.readUInt16LE(offset + 28);
    const name = bytes.subarray(offset + 30, offset + 30 + nameLength).toString('utf8');
    assert.equal(globalThis.DevPathCourseProjectExport.normalizeProjectPath(name), name);
    const start = offset + 30 + nameLength + extraLength;
    const target = path.resolve(project, name);
    assert.ok(target.startsWith(`${project}${path.sep}`), `ZIP path escaped temporary project: ${name}`);
    mkdirSync(path.dirname(target), {recursive: true});
    writeFileSync(target, bytes.subarray(start, start + length));
    paths.push(name);
    offset = start + length;
  }

  assert.equal(bytes.readUInt32LE(offset), 0x02014b50, 'ZIP local entries must be followed by a central directory');
  const endRecord = bytes.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  assert.ok(endRecord >= offset, 'ZIP end-of-central-directory record must be present');
  assert.equal(bytes.readUInt16LE(endRecord + 8), paths.length);
  assert.equal(bytes.readUInt16LE(endRecord + 10), paths.length);
  assert.equal(endRecord + 22 + bytes.readUInt16LE(endRecord + 20), bytes.length, 'ZIP parser must consume the complete archive');
  assert.deepEqual(paths.sort(), [...manifest.files, 'devpath-project.json'].sort());
  assert.ok(paths.every(name => !/(?:reference|mutants|verify-fixtures|reporter|result\.mjs)/.test(name)));
  assert.deepEqual(readJson('course-src/phase7/common/package.json'), JSON.parse(readFileSync(path.join(project, 'package.json'))));
  assert.deepEqual(readJson('course-src/phase7/common/package-lock.json'), JSON.parse(readFileSync(path.join(project, 'package-lock.json'))));
  assert.equal(JSON.parse(readFileSync(path.join(project, 'devpath-project.json'))).evidenceSource, 'local-declared');

  cpSync(path.join(fixture, 'node_modules'), path.join(project, 'node_modules'), {recursive: true});
  const starterTest = runNpm(['test']);
  assert.equal(starterTest.error, undefined, String(starterTest.error));
  assert.equal(starterTest.status, 1, starterTest.stdout + starterTest.stderr);
  assert.match(starterTest.stdout + starterTest.stderr, /AssertionError/);
  assert.doesNotMatch(starterTest.stdout + starterTest.stderr, /does not provide an export named|ERR_MODULE_NOT_FOUND/);
  console.log('24.01 exported starter: npm test fails by assertion, with no missing export/dependency error.');

  cpSync(path.join(fixture, 'reference/security.mjs'), path.join(project, 'src/security.mjs'));
  const referenceTest = runNpm(['test']);
  assert.equal(referenceTest.error, undefined, String(referenceTest.error));
  assert.equal(referenceTest.status, 0, referenceTest.stdout + referenceTest.stderr);
  console.log('24.01 exported reference: npm test passes.');

  const browserTest = runNpm(['run', 'test:e2e'], 90_000);
  assert.equal(browserTest.error, undefined, String(browserTest.error));
  assert.equal(browserTest.status, 0, browserTest.stdout + browserTest.stderr);
  assert.match(browserTest.stdout + browserTest.stderr, /2 passed/);
  console.log(`24.01 exported reference: Chromium E2E passed; ZIP contains ${paths.length} files and excludes internal solutions.`);
} finally {
  assert.equal(path.dirname(path.resolve(temp)), path.resolve(tmpdir()));
  assert.match(path.basename(temp), /^p7-common-export-/);
  rmSync(temp, {recursive: true, force: true});
}
