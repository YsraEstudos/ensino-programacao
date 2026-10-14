import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {localCheckpointDefinitionIssues} from './local-assessment-validation.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const sourcePath = path.join(root, 'course-src', 'local-checkpoints.json');
const outputPath = path.join(root, 'public', 'local-checkpoints.js');
const args = process.argv.slice(2);
const checkOnly = args.includes('--check');
const unknownArgs = args.filter(argument => argument !== '--check');
if (unknownArgs.length) throw new Error(`Unknown arguments: ${unknownArgs.join(', ')}`);

function render(targets) {
  return `(function attachLocalCheckpoints(root) {\n` +
    `  // Generated from course-src/local-checkpoints.json; targets only.\n` +
    `  const targets = Object.freeze(${JSON.stringify(targets, null, 2)});\n` +
    `  const byId = new Map(targets.map(target => [target.id, target]));\n` +
    `  const api = Object.freeze({\n` +
    `    targets,\n` +
    `    byId(id) { return byId.get(String(id)); },\n` +
    `    gitStepFor(id) { return byId.get(String(id))?.gitStep; }\n` +
    `  });\n` +
    `  if (root) root.DevPathLocalCheckpoints = api;\n` +
    `  if (typeof module === "object" && module.exports) module.exports = api;\n` +
    `})(typeof globalThis === "object" ? globalThis : this);\n`;
}

const definitions = JSON.parse(await readFile(sourcePath, 'utf8'));
const issues = localCheckpointDefinitionIssues(definitions);
if (issues.length) throw new Error(issues.map(issue => `${issue.code} ${issue.id}: ${issue.message}`).join('\n'));
const expected = render(definitions.targets);
let current;
try {
  current = await readFile(outputPath, 'utf8');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

if (checkOnly) {
  if (current !== expected) {
    console.error('public/local-checkpoints.js is stale. Run npm run build:curriculum.');
    process.exitCode = 1;
  } else {
    console.log(`Local checkpoints: ${definitions.targets.length} targets match the canonical source.`);
  }
} else {
  await writeFile(outputPath, expected, 'utf8');
  console.log(`Generated public/local-checkpoints.js from course-src/local-checkpoints.json (${definitions.targets.length} targets).`);
}
