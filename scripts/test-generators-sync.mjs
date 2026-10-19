// Guards the generators of stages 15 and 20–23 (and 23.12): a regeneration inside a temporary copy
// must reproduce the canonical checkout byte for byte. The checkout itself is never written.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {cpSync, existsSync, readFileSync, readdirSync, rmdirSync, rmSync, statSync, symlinkSync, mkdtempSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';

const root = process.cwd();
const generators = [
  'scripts/task-8b-stage15.mjs',
  'scripts/task-9-stage20.mjs',
  'scripts/task-9-stage21.mjs',
  'scripts/task-9-dom-21-09.mjs',
  'scripts/task-9-stage22.mjs',
  'scripts/task-9-stage23.mjs',
  'scripts/task-9-remaining-assessments.mjs',
  'scripts/task-9-stage23-12.mjs',
  'scripts/task-9-readmes.mjs',
  'scripts/task-9-canonical-texts.mjs',
  'scripts/task-9-advanced-repairs.mjs',
];

const excluded = relative => relative.split(path.sep).some(part => part === 'node_modules' || part === '.git' || part === '.superpowers');

function walk(base, dir = base, out = []) {
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    const relative = path.relative(base, full);
    if (excluded(relative)) continue;
    if (entry.isDirectory()) walk(base, full, out);
    else out.push(relative.split(path.sep).join('/'));
  }
  return out.sort();
}

function run(cwd, args) {
  const result = spawnSync(process.execPath, args, {cwd, encoding: 'utf8', windowsHide: true, timeout: 300000});
  assert.equal(result.status, 0, `${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

function regenerate(copy) {
  for (const generator of generators) run(copy, [generator]);
}

test('regenerating the stage 15 and 20–23 sources in a temporary copy reproduces the checkout', {timeout: 900000}, () => {
  const base = mkdtempSync(path.join(tmpdir(), 'devpath-gen-sync-'));
  const copy = path.join(base, 'repo');
  let linked = false;
  try {
    cpSync(root, copy, {recursive: true, filter: source => !excluded(path.relative(root, source))});
    // node_modules is shared through a junction; it is never copied and never removed by this test.
    symlinkSync(path.join(root, 'node_modules'), path.join(copy, 'node_modules'), 'junction');
    linked = true;

    regenerate(copy);

    const expected = walk(root);
    const actual = walk(copy);
    const differences = [];
    for (const file of new Set([...expected, ...actual])) {
      const a = existsSync(path.join(root, file)) ? readFileSync(path.join(root, file)) : null;
      const b = existsSync(path.join(copy, file)) ? readFileSync(path.join(copy, file)) : null;
      if (a === null) differences.push(`only in regenerated copy: ${file}`);
      else if (b === null) differences.push(`missing after regeneration: ${file}`);
      else if (!a.equals(b)) differences.push(`content differs: ${file}`);
    }
    assert.deepEqual(differences.sort().slice(0, 80), [], `generator output diverges from the checkout (${differences.length} files)`);
  } finally {
    if (linked) {
      // Remove only the link: rmdir on a junction never touches its target.
      rmdirSync(path.join(copy, 'node_modules'));
      rmSync(base, {recursive: true, force: true});
    } else if (existsSync(base) && statSync(base).isDirectory()) {
      rmSync(base, {recursive: true, force: true});
    }
  }
});
