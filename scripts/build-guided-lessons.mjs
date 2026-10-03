import fs from 'node:fs';
import { stage01Preparation } from '../course-src/stage01-preparation.mjs';
import { diagnosticPreparation } from '../course-src/diagnostic-preparation.mjs';

const publicDir = new URL('../public/', import.meta.url);
const stage01 = JSON.parse(JSON.stringify(stage01Preparation));
for (const config of Object.values(stage01)) for (const transfer of config.masteryTransfers || []) delete transfer.solution;
for (const [name, variable, value] of [
  ['js-stage01-preparation.js', 'DevPathStage01Preparation', stage01],
  ['js-diagnostic-preparation.js', 'DevPathDiagnosticPreparation', diagnosticPreparation],
]) fs.writeFileSync(new URL(name, publicDir), `// Generated from course-src; edit the editorial source.\nglobalThis.${variable} = ${JSON.stringify(value, null, 2)};\n`);

// Update only the named stage, retaining the rest of the authored catalog verbatim.
const catalogPath = new URL('course-catalog.json', publicDir);
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
for (const item of catalog) if (item.stage === '01') item.preparation = stage01[item.id];
fs.writeFileSync(catalogPath, JSON.stringify(catalog) + '\n');
console.log('Generated D + 01 learning materials; other catalog stages retained.');
