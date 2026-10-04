import {readFileSync, writeFileSync} from 'node:fs';
const contract = JSON.parse(readFileSync(new URL('../lib/progress-contract.json', import.meta.url), 'utf8'));
const file = new URL('../public/js-progress-model.js', import.meta.url);
const source = `// Generated from lib/progress-contract.json; edit that contract.\n(function (global) {\n  "use strict";\n  const defaults = ${JSON.stringify(contract.defaults, null, 2)};\n  const limits = Object.freeze(${JSON.stringify(contract.limits, null, 2)});\n  global.DevPathProgressModel = Object.freeze({ create: () => JSON.parse(JSON.stringify(defaults)), limits });\n})(globalThis);\n`;
if (process.argv.includes('--check')) {
  if (readFileSync(file, 'utf8') !== source) throw new Error('Regenerate the browser progress model.');
} else writeFileSync(file, source);

