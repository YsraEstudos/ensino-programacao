import {fileURLToPath} from 'node:url';
import {runNativeTests} from './test-workspace.mjs';
const cwd = fileURLToPath(new URL('../', import.meta.url));
const testArgs = process.argv.slice(2);
try {
  const {result, cleanup} = runNativeTests({cwd, ...(testArgs.length ? {testArgs} : {})});
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  const cleanupTiming = cleanup.verifiedAfterExit ? 'after child exit' : 'without starting a child';
  console.log(`Parent cleanup: passed ${cleanupTiming} (${cleanup.directories} database directories; native outcome unchanged).`);
  if (result.error || result.signal || result.status === null) {
    console.error(`Native runner error: ${result.error?.code || result.signal || 'unknown'}`);
    process.exitCode = 2;
  } else process.exitCode = result.status;
} catch (error) {
  process.stdout.write(error.nativeResult?.stdout || '');
  process.stderr.write(error.nativeResult?.stderr || '');
  console.error(`Parent cleanup: FAILED (${error.code || 'unknown'}): ${error.message}`);
  process.exitCode = 2;
}
