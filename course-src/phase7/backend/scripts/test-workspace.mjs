import {randomUUID} from 'node:crypto';
import {mkdirSync, readdirSync, lstatSync, unlinkSync, rmdirSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';

const directories = Object.freeze({
  'db-node-auth': 'test.sqlite', 'db-node-errors': 'test.sqlite',
  'db-hono-auth': 'test.sqlite', 'db-hono-errors': 'test.sqlite',
  reopen: 'persist.sqlite',
});
const fail = (code, message) => { throw Object.assign(new Error(message), {code}); };
function validateRoot(root) {
  if (typeof root !== 'string' || path.dirname(path.resolve(root)) !== path.resolve(tmpdir())
      || !/^p7-native-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(path.basename(root))) {
    fail('ERR_TEST_WORKSPACE', 'Expected a UUID test workspace directly inside the temporary directory');
  }
  const stat = lstatSync(root);
  if (!stat.isDirectory() || stat.isSymbolicLink()) fail('ERR_TEST_WORKSPACE', 'Test workspace must be a real owned directory');
}
export function databaseDirectory(name) {
  const root = process.env.PHASE7_TEST_ROOT;
  validateRoot(root);
  if (!Object.hasOwn(directories, name)) fail('ERR_TEST_WORKSPACE', 'Unknown database fixture directory');
  const folder = path.join(root, name);
  mkdirSync(folder);
  return {folder, dbPath: path.join(folder, directories[name])};
}
export function requireClosed(databases) {
  if (databases.some(db => db.isOpen)) fail('ERR_TEST_DATABASE_OPEN', 'SQLite connection is still open after test shutdown');
}
export function cleanupWorkspace(root) {
  validateRoot(root);
  const contents = [];
  // Validate the complete tree before removing anything. Unknown children are
  // retained as evidence; this parent never performs recursive deletion.
  for (const directory of readdirSync(root)) {
    if (!Object.hasOwn(directories, directory)) fail('ERR_TEST_UNKNOWN_FILE', `Unknown workspace child: ${directory}`);
    const folder = path.join(root, directory), stat = lstatSync(folder);
    if (!stat.isDirectory() || stat.isSymbolicLink()) fail('ERR_TEST_UNKNOWN_FILE', `Unexpected directory entry: ${directory}`);
    const base = directories[directory];
    const whitelist = new Set([base, `${base}-wal`, `${base}-shm`, `${base}-wal.tmp`, `${base}-shm.tmp`]);
    const files = readdirSync(folder);
    for (const file of files) {
      const stat = lstatSync(path.join(folder, file));
      if (!whitelist.has(file.toLowerCase()) || !stat.isFile() || stat.isSymbolicLink()) {
        fail('ERR_TEST_UNKNOWN_FILE', `Unknown database child: ${directory}/${file}`);
      }
    }
    contents.push({directory, folder, files});
  }
  const removedFiles = [];
  for (const {directory, folder, files} of contents) {
    for (const file of files) {
      unlinkSync(path.join(folder, file)); // any refusal, including ENOENT, fails
      removedFiles.push(`${directory}/${file}`);
    }
    if (readdirSync(folder).length) fail('ENOTEMPTY', `Database directory is still nonempty: ${folder}`);
    rmdirSync(folder);
    if (existsSync(folder)) fail('EEXIST', `Database directory still exists: ${folder}`);
  }
  if (readdirSync(root).length) fail('ENOTEMPTY', `Workspace is still nonempty: ${root}`);
  rmdirSync(root);
  if (existsSync(root)) fail('EEXIST', `Workspace still exists: ${root}`);
  return {root, directories: contents.length, removedFiles};
}
export function runNativeTests({cwd, node = process.execPath, reporter, testArgs = ['test/contract.test.mjs', 'test/maintenance.test.mjs'], args, timeout = 30000} = {}) {
  const root = path.join(tmpdir(), `p7-native-${randomUUID()}`);
  mkdirSync(root);
  const env = {...process.env, PHASE7_TEST_ROOT: root};
  delete env.NODE_TEST_CONTEXT;
  // No test-worker grandchildren: the SQLite owner is exactly this child.
  const childArgs = args || ['--test', '--test-isolation=none', ...(reporter ? [`--test-reporter=${reporter}`] : []), ...testArgs];
  const result = spawnSync(node, childArgs, {cwd, env, encoding: 'utf8', timeout, windowsHide: true});
  try {
    // spawnSync has returned: the native owner exited (or could not be started).
    // Cleanup is a separate parent obligation, not a native test pass.
    const cleanup = cleanupWorkspace(root);
    const childWasStarted = Number.isInteger(result.pid) && result.pid > 0;
    // An unused workspace can be cleaned even when no child ever existed.
    // Only a positive PID proves cleanup happened after a child's exit.
    return {result, cleanup: {...cleanup, childWasStarted, cleanupVerified: true, verifiedAfterExit: childWasStarted}};
  } catch (error) {
    error.workspace = root;
    error.nativeResult = result;
    throw error;
  }
}
