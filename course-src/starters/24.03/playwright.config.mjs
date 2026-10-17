import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./e2e',timeout:20000,expect:{timeout:4000},workers:1,retries:0,
  reporter:process.env.P7_REPORTER?[[process.env.P7_REPORTER]]:'list',
  use:{browserName:'chromium',headless:true,trace:'retain-on-failure'},
  webServer:{command:'node server.mjs',env:{PORT:'0'},wait:{stdout:/KANBAN_READY:(?<P7_URL>http:\/\/127\.0\.0\.1:\d+)/},reuseExistingServer:false,timeout:10000,stdout:'pipe',stderr:'pipe'}
});
