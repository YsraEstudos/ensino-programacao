import assert from 'node:assert/strict';

import { stage00 } from '../course-src/stage00-preparation.mjs';

assert.equal(Object.keys(stage00).length, 9, 'the canonical source contains all nine Stage 00 activities');
assert(stage00['00.01'].vocabulary.length <= 7 && stage00['00.01'].glossary?.length >= 3, 'first lesson keeps secondary terms in a consultable glossary');
assert.equal(stage00['00.01'].lab?.kind, 'trace', '00.01 provides a learner-controlled execution trace');
assert.equal(stage00['00.02'].lab?.kind, 'stale-output', '00.02 diagnoses an outdated result');
assert.equal(stage00['00.04'].lab?.kind, 'message-action', '00.04 distinguishes console messages from real actions');
assert.equal(stage00['00.05'].lab?.kind, 'environment-bridge', '00.05 practices browser and Node environments');
assert.equal(stage00['00.08'].lab?.kind, 'html-label', '00.08 previews and repairs a label association');
assert.equal(stage00['00.09'].lab?.kind, 'capstone', '00.09 integrates the stage in a capstone');
assert.equal(stage00['00.09'].mode, 'edit-run', 'the capstone starts as an executable blank-file exercise');
assert.equal(stage00['00.09'].starterFiles?.find(file => file.path === 'main.js')?.content, '', 'the capstone asks the learner to write from a blank file');
assert.deepEqual(stage00['00.09'].expectedByRequirement?.zero, [['Atendimento'],['Pessoa:','Ana'],['Itens:',0],['Fim']], 'the capstone validates its changed zero-item requirement');
for (const id of ['00.05','00.08']) {
  assert.equal(stage00[id].rubric.length, 3, `${id} READ activity has three specific criteria`);
  assert.equal(new Set(stage00[id].rubric).size, 3, `${id} criteria are distinct`);
}

console.log('Stage 00 source: canonical sync and requested lesson experiences are present.');
