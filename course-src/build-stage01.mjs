import {writeFileSync,copyFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {stage01Preparation} from './stage01-preparation.mjs';
const base=fileURLToPath(new URL('../',import.meta.url));
// Transfer solutions belong to editorial/testing data, never to the learner bundle.
const publicPreparation=JSON.parse(JSON.stringify(stage01Preparation));
for(const config of Object.values(publicPreparation)) {
  for(const transfer of config.masteryTransfers||[]) delete transfer.solution;
}
const bundle=`/* Generated from course-src/stage01-preparation.mjs. */\nglobalThis.DevPathStage01Preparation = ${JSON.stringify(publicPreparation,null,2)};\n`;
writeFileSync(`${base}devpath-publish/public/js-stage01-preparation.js`,bundle,'utf8');
for(const file of ['js-stage01-preparation.js','js-stage01-runner.js','js-stage01-checks.js','js-stage01-ui.js','stage01.css']) copyFileSync(`${base}devpath-publish/public/${file}`,`${base}devpath-full-catalog/public/${file}`);
console.log('Etapa 01: preparação e módulos sincronizados nas duas distribuições.');
