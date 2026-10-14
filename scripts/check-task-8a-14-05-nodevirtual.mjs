import assert from 'node:assert/strict';
import {mkdir, mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';

const root = await mkdtemp(join(tmpdir(), 'devpath task8a 14-05 '));
const other = await mkdtemp(join(tmpdir(), 'devpath-cwd-'));
try {
  const dataDir = join(root, 'data'); await mkdir(dataDir);
  await writeFile(join(dataDir, 'config.json'), '{"mode":"ok"}', 'utf8');
  const modulePath = join(root, 'config.mjs');
  await writeFile(modulePath, "import {readFile} from 'node:fs/promises'; export async function carregar() { const url = new URL('./data/config.json', import.meta.url); try { return JSON.parse(await readFile(url, 'utf8')); } catch (cause) { throw new Error('Falha ao carregar configuração', {cause}); } }", 'utf8');
  const module = await import(pathToFileURL(modulePath).href);
  const previous = process.cwd(); process.chdir(other);
  try { assert.deepEqual(await module.carregar(), {mode: 'ok'}); } finally { process.chdir(previous); }
  await rm(join(dataDir, 'config.json'));
  await assert.rejects(module.carregar(), error => error.cause?.code === 'ENOENT' && error.message === 'Falha ao carregar configuração');
  console.log('14.05 module-relative URL, spaces, different cwd and ENOENT cause: pass');
} finally { await rm(root, {recursive: true, force: true}); await rm(other, {recursive: true, force: true}); }
