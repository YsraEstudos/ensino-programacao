import {readFileSync, writeFileSync} from 'node:fs';
import {build} from 'esbuild-wasm';

const contractFile = new URL('../lib/progress-contract.json', import.meta.url);
const catalogFile = new URL('../lib/course-exercise-ids.ts', import.meta.url);
const modelFile = new URL('../public/progress-model.js', import.meta.url);
const learningFile = new URL('../public/learning-progress.js', import.meta.url);
const checkMode = process.argv.includes('--check');

// Record limits grow with the learner-facing catalog, with a 25% margin for stale ids and a floor of 300.
const RECORD_FLOOR = 300;
const RECORD_MARGIN = 1.25;
const DERIVED_LIMITS = ['learningRecords', 'learningEvidenceHistory', 'reviewAttempts'];

export function catalogSizeOf(source) {
  const block = /export const courseExerciseIds\s*=\s*\[([\s\S]*?)\]\s*(?:as const)?;/.exec(source);
  if (!block) throw new Error('lib/course-exercise-ids.ts does not export courseExerciseIds.');
  const ids = [...block[1].matchAll(/"([^"]+)"/g)].map(match => match[1]);
  if (ids.length === 0) throw new Error('lib/course-exercise-ids.ts has no ids.');
  return ids.length;
}

export function derivedRecordLimit(catalogSize) {
  return Math.max(RECORD_FLOOR, Math.ceil(catalogSize * RECORD_MARGIN));
}

const baseContract = JSON.parse(readFileSync(contractFile, 'utf8'));
const catalogSize = catalogSizeOf(readFileSync(catalogFile, 'utf8'));
const recordLimit = derivedRecordLimit(catalogSize);
const contract = {
  ...baseContract,
  limits: {
    ...baseContract.limits,
    ...Object.fromEntries(DERIVED_LIMITS.map(name => [name, recordLimit]))
  }
};
const contractSource = `${JSON.stringify(contract, null, 2)}\n`;

const modelSource = `// Generated from lib/progress-contract.json; edit that contract.\n(function (global) {\n  "use strict";\n  const defaults = ${JSON.stringify(contract.defaults, null, 2)};\n  const limits = Object.freeze(${JSON.stringify(contract.limits, null, 2)});\n  global.DevPathProgressModel = Object.freeze({ create: () => JSON.parse(JSON.stringify(defaults)), limits });\n})(globalThis);\n`;

// The bundle must see the derived contract, not whatever is on disk, so --check stays pure.
const contractPlugin = {
  name: 'progress-contract-derived',
  setup(buildApi) {
    buildApi.onLoad({filter: /progress-contract\.json$/}, () => ({contents: contractSource, loader: 'json'}));
  }
};
const learningBundle = await build({
  entryPoints: ['lib/learning-progress.ts'],
  bundle: true,
  minify: false,
  platform: 'browser',
  target: 'es2022',
  format: 'iife',
  globalName: 'DevPathLearningProgress',
  write: false,
  plugins: [contractPlugin],
  banner: { js: '// Generated from lib/learning-progress.ts; edit the shared TypeScript source.' },
  footer: { js: 'globalThis.DevPathLearningProgress = DevPathLearningProgress;' },
  logLevel: 'silent'
});
const learningSource = learningBundle.outputFiles[0].text;

if (checkMode) {
  const stale = [];
  if (readFileSync(contractFile, 'utf8') !== contractSource) stale.push('lib/progress-contract.json');
  if (readFileSync(modelFile, 'utf8') !== modelSource) stale.push('public/progress-model.js');
  if (readFileSync(learningFile, 'utf8') !== learningSource) stale.push('public/learning-progress.js');
  if (stale.length) {
    console.error(`Stale progress files (run npm run build:progress): ${stale.join(', ')}`);
    process.exitCode = 1;
  } else {
    console.log(`Progress model is current (catalog ${catalogSize}, learningRecords ${recordLimit}).`);
  }
} else {
  writeFileSync(contractFile, contractSource);
  writeFileSync(modelFile, modelSource);
  writeFileSync(learningFile, learningSource);
  console.log(`Progress model built (catalog ${catalogSize}, learningRecords ${recordLimit}).`);
}
