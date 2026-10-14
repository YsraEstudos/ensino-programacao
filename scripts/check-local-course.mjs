import {cp, lstat, mkdtemp, readdir, rm, mkdir} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import {dirname, isAbsolute, join, relative, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const MAX_OUTPUT = 120_000;
const DEFAULT_TIMEOUT = 30_000;

function rejectPath(value, label) {
  if (typeof value !== 'string' || !value.trim() || value.includes('\0') || value.includes('\\') || value.startsWith('/') || /^[a-z]+:/i.test(value) || /(^|\/)\.\.($|\/)/.test(value)) {
    throw new Error(`${label} must be a safe relative path inside the project root.`);
  }
}

function contained(root, candidate) {
  const rel = relative(root, candidate);
  return rel === '' || (rel && rel !== '..' && !rel.startsWith(`..${sep}`) && !isAbsolute(rel));
}

async function assertTreeSafe(source, root) {
  const info = await lstat(source);
  if (info.isSymbolicLink()) throw new Error(`Symlinked project path is not allowed: ${relative(root, source)}`);
  if (info.isDirectory()) {
    for (const entry of await readdir(source, {withFileTypes: true})) {
      if (entry.name === 'node_modules') continue;
      const child = join(source, entry.name);
      if (!contained(root, resolve(child))) throw new Error(`Project path escapes root: ${entry.name}`);
      await assertTreeSafe(child, root);
    }
  }
}

// Declared commands may call node_modules/typescript/bin/tsc. Project node_modules are never copied, so the
// repository's pinned TypeScript (devDependency, locked) is linked into the disposable copy instead.
const REPO_TYPESCRIPT = fileURLToPath(new URL('../node_modules/typescript', import.meta.url));
async function provideTypescript(destination) {
  const target = join(destination, 'node_modules', 'typescript');
  if (await lstat(target).then(() => true, () => false)) return;
  const info = await lstat(REPO_TYPESCRIPT).catch(() => null);
  if (!info?.isDirectory()) throw new Error('typescript devDependency is missing: run npm ci in the repository.');
  await mkdir(join(destination, 'node_modules'), {recursive: true});
  await cp(REPO_TYPESCRIPT, target, {recursive: true, verbatimSymlinks: false});
}

async function copyProject(referenceDir, root, destination) {
  rejectPath(referenceDir, 'referenceDir');
  const source = resolve(root, referenceDir.replaceAll('/', sep));
  if (!contained(root, source)) throw new Error('referenceDir must stay inside the approved root.');
  await assertTreeSafe(source, root);
  const stat = await lstat(source);
  if (!stat.isDirectory()) throw new Error('referenceDir must identify a project directory.');
  await cp(source, destination, {
    recursive: true,
    filter(sourcePath) {
      return !sourcePath.split(sep).includes('node_modules');
    },
    verbatimSymlinks: false,
  });
}

function npmCommand(command) {
  const [executable, ...args] = command;
  if (!/^(?:npm|npm\.cmd)$/i.test(executable)) return {executable, args};
  const npmCli = process.env.npm_execpath || join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js');
  return {executable: process.execPath, args: [npmCli, ...args]};
}

function collectChild(child, state) {
  const append = chunk => {
    if (state.output.length >= MAX_OUTPUT) return;
    state.output += String(chunk).slice(0, MAX_OUTPUT - state.output.length);
  };
  child.stdout?.on('data', append);
  child.stderr?.on('data', append);
}

async function killTree(child) {
  if (!child || child.exitCode !== null || child.killed) return;
  if (process.platform === 'win32' && Number.isInteger(child.pid)) {
    await new Promise(resolveDone => {
      const killer = spawn('taskkill', ['/PID', String(child.pid), '/T', '/F'], {shell: false, stdio: 'ignore'});
      killer.once('close', resolveDone);
      killer.once('error', resolveDone);
    });
    try { child.kill(); } catch { /* process may have exited */ }
  } else {
    try { child.kill('SIGKILL'); } catch { /* process may have exited */ }
    if (Number.isInteger(child.pid)) {
      try { process.kill(-child.pid, 'SIGKILL'); } catch { /* no process group */ }
    }
  }
}

async function runCommand(command, cwd, timeoutMs) {
  const {executable, args} = npmCommand(command);
  const state = {output: ''};
  let child;
  try {
    child = spawn(executable, args, {cwd, shell: false, windowsHide: true, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe']});
  } catch (error) {
    return {exitCode: null, output: String(error?.message || error), timedOut: false};
  }
  collectChild(child, state);
  let timedOut = false;
  let timer;
  const result = await new Promise(resolveDone => {
    let settled = false;
    let timeoutKilling = false;
    let childClosed = false;
    const finish = value => { if (settled) return; settled = true; clearTimeout(timer); resolveDone(value); };
    child.once('error', error => {
      childClosed = true;
      if (!timeoutKilling) finish({exitCode: null, output: `${state.output}${error.message}`, timedOut});
    });
    child.once('close', code => {
      childClosed = true;
      if (!timeoutKilling) finish({exitCode: code, output: state.output, timedOut});
    });
    timer = setTimeout(async () => {
      timedOut = true;
      timeoutKilling = true;
      await killTree(child);
      if (!childClosed) await new Promise(resolveClosed => {
        const settle = () => resolveClosed();
        child.once('close', settle);
        setTimeout(settle, 500);
      });
      finish({exitCode: null, output: `${state.output}\nProcess timed out after ${timeoutMs}ms.`, timedOut: true});
    }, timeoutMs);
  });
  return result;
}

async function removeTemporaryDirectory(path) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      await rm(path, {recursive: true, force: true});
      await lstat(path);
    } catch {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 50 * (attempt + 1)));
  }
}

/** Execute declared project commands in a disposable, shell-free project copy. */
export async function checkLocalProject({referenceDir, commands, timeoutMs = DEFAULT_TIMEOUT, rootDir = process.cwd()} = {}) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0 || timeoutMs > 300_000) throw new Error('timeoutMs must be between 1 and 300000.');
  if (!Array.isArray(commands) || !commands.length || commands.some(command => !Array.isArray(command) || !command.length || command.some(argument => typeof argument !== 'string' || !argument.length))) {
    throw new Error('commands must be non-empty structured argument arrays.');
  }
  const root = resolve(rootDir);
  const temp = await mkdtemp(join(tmpdir(), 'devpath-course-'));
  const project = join(temp, 'project');
  try {
    await mkdir(project);
    await copyProject(referenceDir, root, project);
    // Always provided: npm scripts (e.g. build) may invoke the repository's TypeScript without naming it in the command.
    await provideTypescript(project);
    const output = [];
    for (const command of commands) {
      const result = await runCommand(command, project, timeoutMs);
      output.push(`[${command.join(' ')}]\n${result.output}`);
      if (result.timedOut || result.exitCode !== 0) return {exitCode: result.exitCode, output: output.join('\n'), timedOut: result.timedOut};
    }
    return {exitCode: 0, output: output.join('\n'), timedOut: false};
  } finally {
    await removeTemporaryDirectory(temp);
  }
}

export const localChecker = Object.freeze({checkLocalProject});
