import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {salvarAtomico} from '../course-src/solutions/14.08/cli.js';

const root = await mkdtemp(join(tmpdir(), 'devpath-task8a-'));
try {
  const destination = join(root, 'notes.json');
  const fs = {writeFile: (path, content) => import('node:fs/promises').then(api => api.writeFile(path, content, 'utf8')), rename: (from, to) => import('node:fs/promises').then(api => api.rename(from, to))};
  await salvarAtomico(fs, destination, '{"ok":true}');
  assert.equal(await readFile(destination, 'utf8'), '{"ok":true}');
  await assert.rejects(readFile(`${destination}.tmp`), error => error.code === 'ENOENT');
  console.log('14.08 native temp+rename: pass');
} finally { await rm(root, {recursive: true, force: true}); }
