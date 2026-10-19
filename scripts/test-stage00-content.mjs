import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { stage00 } from '../course-src/stage00-preparation.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

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
const sequenceReview = stage00['00.03'].review;
assert.match(sequenceReview.choices[2], /"Olá".*"Olá, Ana"/, '00.03 tests the plausible mistake of treating a partial message as an exact match');
assert.match(sequenceReview.incorrectFeedback, /não é igual|não corresponde/i, '00.03 explains why the partial-message distractor fails');

const recipeResult = spawnSync(process.env.DEVPATH_PYTHON || 'python', ['-c', [
  'import json, sys',
  'from pathlib import Path',
  'sys.path.insert(0, str(Path("course-src").resolve()))',
  'from compile_content import load_recipes',
  'recipe = load_recipes()["00.04"]',
  'print(json.dumps({"public": recipe["public"], "hidden": recipe["hidden"]}, ensure_ascii=False))',
].join('\n')], {cwd: root, encoding: 'utf8'});
assert.equal(recipeResult.status, 0, `00.04 recipe loader failed: ${recipeResult.stderr}`);
const item004 = JSON.parse(recipeResult.stdout);
assert.notEqual(item004.hidden, item004.public, '00.04 reserved case varies the public fixture');
assert.equal(item004.hidden, 'lacunas "Rui", 7, "pronto" -> nome: Rui; pontos: 7; pronto', '00.04 reserved fixture keeps the same output contract with new values');

for (const id of ['00.05','00.08']) {
  assert.equal(stage00[id].rubric.length, 3, `${id} READ activity has three specific criteria`);
  assert.equal(new Set(stage00[id].rubric).size, 3, `${id} criteria are distinct`);
}

console.log('Stage 00 source: canonical sync and requested lesson experiences are present.');
