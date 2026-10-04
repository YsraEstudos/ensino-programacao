import {readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

const root = new URL('../public/', import.meta.url);
const page = new URL('devpath.html', root);
const original = readFileSync(page, 'utf8');
const updated = original.replace(/((?:src|href)="\/)([\w-]+\.(?:js|css))(?:\?[^"\s]*)?"/g, (_, prefix, name) => {
  const hash = createHash('sha256').update(readFileSync(new URL(name, root))).digest('hex').slice(0, 12);
  return `${prefix}${name}?v=${hash}"`;
});
if (process.argv.includes('--check')) {
  if (updated !== original) throw new Error('Asset versions are stale. Run npm run assets:version.');
} else if (updated !== original) {
  writeFileSync(page, updated);
}
