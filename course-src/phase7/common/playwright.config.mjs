import {defineConfig} from '@playwright/test';

const portText = process.env.PHASE7_E2E_PORT;
const origin = process.env.PHASE7_E2E_ORIGIN;
const corsPortText = process.env.PHASE7_E2E_CORS_PORT;
const corsOrigin = process.env.PHASE7_E2E_CORS_ORIGIN;
if (!/^\d{1,5}$/.test(portText || '')) {
  throw new Error('Run the browser suite with `npm run test:e2e` so one isolated port is shared by the config and workers.');
}
const port = Number(portText);
const expectedOrigin = `http://127.0.0.1:${port}`;
const corsPort = Number(corsPortText);
const expectedCorsOrigin = `http://127.0.0.1:${corsPort}`;
const chromiumExecutable = process.env.PHASE7_CHROMIUM_EXECUTABLE;
if (port < 49152 || port > 65535 || origin !== expectedOrigin
  || !/^\d{1,5}$/.test(corsPortText || '') || corsPort < 49152 || corsPort > 65535
  || corsPort === port || corsOrigin !== expectedCorsOrigin) {
  throw new Error('Invalid Phase 7 E2E port/origin environment; expected distinct high loopback ports selected by scripts/run-e2e.mjs.');
}

export default defineConfig({
  testDir: './test/e2e',
  timeout: 20_000,
  use: {
    baseURL: origin,
    browserName: 'chromium',
    permissions: ['local-network-access'],
    launchOptions: {
      ...(chromiumExecutable ? {executablePath: chromiumExecutable} : {}),
    },
  },
  webServer: [
    {
      command: 'node src/server.mjs',
      url: origin,
      reuseExistingServer: false,
      timeout: 15_000,
      env: {PORT: String(port), APP_ORIGIN: origin},
    },
    {
      command: 'node src/server.mjs',
      url: corsOrigin,
      reuseExistingServer: false,
      timeout: 15_000,
      env: {PORT: String(corsPort), APP_ORIGIN: origin},
    },
  ],
});
