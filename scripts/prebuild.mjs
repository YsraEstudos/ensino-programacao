import {spawnSync} from 'node:child_process';
import {readdirSync} from 'node:fs';

const steps = [
  ['scripts/build-curriculum-data.mjs'],
  ['scripts/build-progress-model.mjs'],
  ['course-src/build-public-curriculum.mjs', '--check'],
  ['scripts/validate-course-catalog.mjs'],
  ['scripts/validate-curriculum-source.mjs'],
  ...readdirSync('public').filter(name => name.endsWith('.js')).map(name => ['--check', `public/${name}`]),
  ['scripts/update-asset-versions.mjs']
];

for (const args of steps) {
  const result = spawnSync(process.execPath, args, {stdio: 'inherit'});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
