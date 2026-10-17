import assert from 'node:assert/strict';
import {cpSync, mkdtempSync, rmSync, readFileSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {classify} from './result.mjs';
import {runNativeTests} from './test-workspace.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const temp = mkdtempSync(path.join(tmpdir(), 'p7-backend-'));
const modules = ['schema.mjs', 'store.mjs', 'service.mjs', 'hono.mjs'];
function run(label, expected) {
  const {result,cleanup} = runNativeTests({cwd:temp,reporter:'./scripts/reporter.mjs'});
  const actual = classify(result, 7);
  if (actual !== expected) throw new Error(`${label}: ${actual}, expected ${expected}. Environmental/import/timeout failures are never mutant kills.\n${result.stdout}\n${result.stderr}\n${result.error || ''}`);
  console.log(`${label}: ${actual}`);
  console.log(`${label} parent cleanup: passed after child exit (${cleanup.directories} directories). Native result is separate.`);
}
const reference = () => {
  for (const name of modules) cpSync(path.join(root, 'reference', name), path.join(temp, 'src', name));
  cpSync(path.join(root, 'reference/report.mjs'), path.join(temp, 'maintenance/report.mjs'));
};
try {
  cpSync(root, temp, {recursive: true, filter: p => !/(?:^|[\\/])(?:reference|mutants)(?:[\\/]|$)/.test(p)});
  run('starter', 'assertion-failure');
  reference();
  run('reference', 'passed');
  const mutations = [
    ['owner-bypass', 'service.mjs', 'AND owner_id=?', 'AND ? IS NOT NULL'],
    ['rollback-removed', 'store.mjs', "catch (error) { db.exec('ROLLBACK'); throw error; } }", "catch (error) { db.exec('COMMIT'); throw error; } }"],
    ['predictable-session', 'service.mjs', "randomBytes(32).toString('base64url')", "'s'.repeat(43)"],
    ['schema-bypass', 'schema.mjs', "if (!result.success) throw new Error('schema');", 'if (!result.success) return value;'],
  ];
  for (const [name, file, from, to] of mutations) {
    reference();
    const target = path.join(temp, 'src', file), code = readFileSync(target, 'utf8');
    assert.ok(code.includes(from), `mutation target missing: ${name}`);
    writeFileSync(target, code.replace(from, to));
    run(name, 'assertion-failure');
  }
  console.log('mutants: 4/4 assertion-failure; HTTP/SQLite executed, no skips. Evidence: local-declared (team fixture, not learner submission).');
} finally {
  assert.equal(path.dirname(path.resolve(temp)), path.resolve(tmpdir()));
  assert.match(path.basename(temp), /^p7-backend-/);
  rmSync(temp, {recursive: true, force: true});
}
