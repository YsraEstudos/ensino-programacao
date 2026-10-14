import fs from 'node:fs';
import crypto from 'node:crypto';
const baseline = JSON.parse(fs.readFileSync('output/fase2/initial-hashes.json', 'utf8'));
const changed = [], removed = [];
for (const [file, hash] of Object.entries(baseline)) {
  if (!fs.existsSync(file)) { removed.push(file); continue; }
  const current = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if (hash !== current) changed.push(file);
}
const before = JSON.parse(fs.readFileSync('output/fase2/catalog-before.json', 'utf8'));
const after = JSON.parse(fs.readFileSync('public/course-catalog.json', 'utf8'));
const oldIds = before.map(item => item.id);
const currentIds = after.map(item => item.id);
const missingIds = oldIds.filter(id => !currentIds.includes(id));
const retainedOrder = currentIds.filter(id => oldIds.includes(id));
console.log(JSON.stringify({changed, removed, missingIds, oldOrderPreserved: JSON.stringify(oldIds) === JSON.stringify(retainedOrder), addedIds: currentIds.filter(id => !oldIds.includes(id))}, null, 2));
if (removed.length || missingIds.length || JSON.stringify(oldIds) !== JSON.stringify(retainedOrder)) process.exitCode = 1;
