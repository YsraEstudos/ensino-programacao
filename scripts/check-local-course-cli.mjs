import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {checkLocalProject} from './check-local-course.mjs';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (!['--root', '--manifest', '--id', '--timeout-ms'].includes(key)) throw new Error(`Unknown option: ${key}`);
    const value = args[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`${key} requires a value.`);
    if (options[key]) throw new Error(`${key} may be supplied only once.`);
    options[key] = value;
    index += 1;
  }
  if (!options['--id']) throw new Error('--id is required.');
  return options;
}

function contained(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === '' || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function validateCommands(commands) {
  if (!Array.isArray(commands) || !commands.length || commands.some(command => !Array.isArray(command) || !command.length || command.some(value => typeof value !== 'string' || !value))) {
    throw new Error('The selected assessment must declare structured local.commands.');
  }
  for (const command of commands) {
    const executable = path.basename(command[0]).toLowerCase();
    const args = command.slice(1).map(value => value.toLowerCase());
    if (executable === 'git' || executable === 'git.exe') throw new Error('Git instructions are not run by the local reference checker.');
    if (args.some(value => ['install', 'ci'].includes(value)) && ['npm', 'npm.cmd', 'npx', 'npx.cmd'].includes(executable)) {
      throw new Error('Dependency installation is not run by the local reference checker.');
    }
  }
  return commands;
}

export async function runLocalCourseCheck(args, {cwd = projectDir} = {}) {
  const options = parseArgs(args);
  // referenceDir is relative to the course content root (course-src), so that is the default root.
  const rootDir = path.resolve(cwd, options['--root'] ?? path.join(cwd, 'course-src'));
  const manifestPath = path.resolve(rootDir, options['--manifest'] ?? 'assessments.json');
  if (!contained(rootDir, manifestPath)) throw new Error('--manifest must stay inside --root.');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const id = options['--id'];
  const assessment = manifest?.[id];
  if (!assessment || typeof assessment !== 'object' || Array.isArray(assessment)) throw new Error(`Assessment not found: ${id}.`);
  if (assessment.environment !== 'local') throw new Error(`Assessment is not local: ${id}.`);
  if (typeof assessment.referenceDir !== 'string' || !assessment.referenceDir) throw new Error(`Assessment has no referenceDir: ${id}.`);
  const commands = validateCommands(assessment.local?.commands);
  const timeoutMs = options['--timeout-ms'] === undefined ? undefined : Number(options['--timeout-ms']);
  if (timeoutMs !== undefined && (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 300_000)) {
    throw new Error('--timeout-ms must be an integer from 1 to 300000.');
  }
  const result = await checkLocalProject({referenceDir: assessment.referenceDir, commands, timeoutMs, rootDir});
  return {
    activityId: id,
    source: 'local-reference',
    scope: 'reference-verification',
    referenceDir: assessment.referenceDir,
    commands,
    timeoutMs: timeoutMs ?? 30_000,
    runtime: `Node ${process.versions.node}`,
    ...result,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const result = await runLocalCourseCheck(process.argv.slice(2));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (result.exitCode !== 0 || result.timedOut) process.exitCode = 1;
  } catch (error) {
    process.stderr.write(`Local course check failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}
