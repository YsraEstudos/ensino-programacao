import {spawn} from 'node:child_process';
import {randomInt} from 'node:crypto';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const playwrightCli = require.resolve('@playwright/test/cli');
const fixtureRoot = fileURLToPath(new URL('../', import.meta.url));
const port = randomInt(49152, 65536);
let corsPort = randomInt(49152, 65536);
while (corsPort === port) corsPort = randomInt(49152, 65536);
const origin = `http://127.0.0.1:${port}`;
const corsOrigin = `http://127.0.0.1:${corsPort}`;
const env = {
  ...process.env,
  PHASE7_E2E_PORT: String(port),
  PHASE7_E2E_ORIGIN: origin,
  PHASE7_E2E_CORS_PORT: String(corsPort),
  PHASE7_E2E_CORS_ORIGIN: corsOrigin,
};

const child = spawn(process.execPath, [playwrightCli, 'test', ...process.argv.slice(2)], {
  cwd: path.resolve(fixtureRoot),
  env,
  stdio: 'inherit',
  windowsHide: true,
});
let timedOut = false;
let forceKillTimer;
const timeout = setTimeout(() => {
  timedOut = true;
  console.error(`Playwright E2E exceeded 60 seconds on ${origin}; terminating the runner.`);
  child.kill('SIGTERM');
  forceKillTimer = setTimeout(() => child.kill('SIGKILL'), 5000);
}, 60_000);

const forwardSignal = signal => {
  child.kill(signal);
};
process.once('SIGINT', forwardSignal);
process.once('SIGTERM', forwardSignal);

child.once('error', error => {
  clearTimeout(timeout);
  clearTimeout(forceKillTimer);
  process.off('SIGINT', forwardSignal);
  process.off('SIGTERM', forwardSignal);
  console.error(`Unable to launch Playwright E2E runner: ${error.message}`);
  process.exitCode = 1;
});

child.once('close', (code, signal) => {
  clearTimeout(timeout);
  clearTimeout(forceKillTimer);
  process.off('SIGINT', forwardSignal);
  process.off('SIGTERM', forwardSignal);
  process.exitCode = timedOut ? 124 : (code ?? (signal ? 1 : 0));
});
