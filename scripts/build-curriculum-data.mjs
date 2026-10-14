import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const python = process.env.DEVPATH_PYTHON || 'python';
const steps = [
  [process.execPath, ['course-src/build-stage00-preparation.mjs']],
  [python, ['course-src/compile_content.py']],
  [python, ['course-src/build_graph.py']],
  [python, ['course-src/build_coverage.py']],
  [process.execPath, ['course-src/build-public-curriculum.mjs']],
  [process.execPath, ['scripts/build-local-checkpoints.mjs']],
];

for (const [command, args] of steps) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log(`Generated curriculum data in ${path.join(root, 'course-src', '.generated')}`);
