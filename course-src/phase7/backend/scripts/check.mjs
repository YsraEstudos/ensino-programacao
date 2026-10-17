import {readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
for (const folder of ['src', 'test', 'scripts']) for (const name of readdirSync(folder).filter(x => x.endsWith('.mjs'))) {
  const result = spawnSync(process.execPath, ['--check', `${folder}/${name}`], {stdio: 'inherit'});
  if (result.error || result.status !== 0) process.exit(1);
}
console.log('ESM syntax checked; JavaScript project has no TypeScript compilation.');
