// Sync the learner-visible 24.01 files from the canonical fixture allowlist.
import {copyFileSync, existsSync, mkdirSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifestPath = path.join(root, 'course-src/starters/manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const files = manifest['24.01']?.files;
if (!Array.isArray(files) || files.length === 0 || new Set(files).size !== files.length) {
  throw new Error('Starter 24.01 manifest must contain a non-empty, duplicate-free allowlist.');
}

const fixtureRoot = path.resolve(root, 'course-src/phase7/common');
const starterRoot = path.resolve(root, 'course-src/starters/24.01');
for (const relative of files) {
  if (path.isAbsolute(relative) || relative.split(/[\\/]/).includes('..')) {
    throw new Error(`Unsafe 24.01 manifest path: ${relative}`);
  }
  const source = path.resolve(fixtureRoot, relative);
  const target = path.resolve(starterRoot, relative);
  if (!source.startsWith(`${fixtureRoot}${path.sep}`) || !target.startsWith(`${starterRoot}${path.sep}`)) {
    throw new Error(`24.01 manifest path escapes its root: ${relative}`);
  }
  if (!existsSync(source)) throw new Error(`Canonical 24.01 fixture file is missing: ${relative}`);
  mkdirSync(path.dirname(target), {recursive: true});
  copyFileSync(source, target);
}

console.log(`24.01 synchronized ${files.length} allowlisted learner files from the canonical fixture.`);
