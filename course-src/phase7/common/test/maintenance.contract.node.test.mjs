import assert from 'node:assert/strict';
import {test} from 'node:test';
import {pathToFileURL} from 'node:url';

const reportsUrl = process.env.PHASE7_REPORTS_MODULE ? pathToFileURL(process.env.PHASE7_REPORTS_MODULE).href : new URL('../foreign-base/reports.mjs', import.meta.url).href;
const reports = await import(reportsUrl);
test('change request preserves owner access and rejects another user', () => {
  assert.equal(reports.getReport('r-1', 'ana').status, 200);
  assert.equal(reports.getReport('r-1', 'bia').status, 403);
  assert.equal(reports.getReport('missing', 'ana').status, 404);
});
