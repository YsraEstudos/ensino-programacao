import {readFileSync, writeFileSync} from 'node:fs';
import {build} from 'esbuild-wasm';
const contract = JSON.parse(readFileSync(new URL('../lib/progress-contract.json', import.meta.url), 'utf8'));
const modelFile = new URL('../public/progress-model.js', import.meta.url);
const learningFile = new URL('../public/learning-progress.js', import.meta.url);
const source = `// Generated from lib/progress-contract.json; edit that contract.\n(function (global) {\n  "use strict";\n  const defaults = ${JSON.stringify(contract.defaults, null, 2)};\n  const limits = Object.freeze(${JSON.stringify(contract.limits, null, 2)});\n  global.DevPathProgressModel = Object.freeze({ create: () => JSON.parse(JSON.stringify(defaults)), limits });\n})(globalThis);\n`;
const learningBundle = await build({
  entryPoints: ['lib/learning-progress.ts'],
  bundle: true,
  minify: false,
  platform: 'browser',
  target: 'es2022',
  format: 'iife',
  globalName: 'DevPathLearningProgress',
  write: false,
  banner: { js: '// Generated from lib/learning-progress.ts; edit the shared TypeScript source.' },
  footer: { js: 'globalThis.DevPathLearningProgress = DevPathLearningProgress;' },
  logLevel: 'silent'
});
const learningSource = learningBundle.outputFiles[0].text;
if (process.argv.includes('--check')) {
  if (readFileSync(modelFile, 'utf8') !== source) throw new Error('Regenerate the browser progress model.');
  if (readFileSync(learningFile, 'utf8') !== learningSource) throw new Error('Regenerate the browser learning reducer.');
} else {
  writeFileSync(modelFile, source);
  writeFileSync(learningFile, learningSource);
}

