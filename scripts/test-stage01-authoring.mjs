import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {test} from 'node:test';
import {stage01Preparation} from '../course-src/stage01-preparation.mjs';

const recipeScript = [
  'import json, runpy, sys',
  "sys.path.insert(0, 'course-src')",
  "print(json.dumps(runpy.run_path('course-src/recipes/01.py')['CONTENT'], ensure_ascii=True))",
].join('; ');
const recipes = JSON.parse(execFileSync(process.env.DEVPATH_PYTHON || 'python', ['-c', recipeScript], {
  cwd: new URL('..', import.meta.url),
  encoding: 'utf8',
}));

test('Etapa 01 recipes declare JavaScript starters for the runner', () => {
  for (const [id, item] of Object.entries(recipes)) {
    assert.match(item.starter, /^main\.js:\s/, `${id} starter path`);
  }
});

test('Etapa 01 compatibility names only the features used by each activity', () => {
  assert.match(recipes['01.01'].compatibility, /typeof/);
  assert.match(recipes['01.02'].compatibility, /const.*let|let.*const/);
  assert.match(recipes['01.03'].compatibility, /const.*ordem|ordem.*const/i);
  assert.match(recipes['01.04'].compatibility, /const.*let|let.*const/);
  assert.match(recipes['01.05'].compatibility, /BigInt|bigint/);
  assert.match(recipes['01.06'].compatibility, /template literal/i);
  assert.match(recipes['01.07'].compatibility, /template literal/i);
  assert.match(recipes['01.08'].compatibility, /const.*let|let.*const/);
  assert.match(recipes['01.09'].compatibility, /template literal/i);
  assert.ok(new Set(Object.values(recipes).map(item => item.compatibility)).size > 1);
});

test('01.03 names the temporal-dead-zone error and tests plausible ordering mistakes', () => {
  assert.match(recipes['01.03'].hidden, /ReferenceError/);
  assert.match(recipes['01.03'].hidden, /Cannot access ['"]nome['"] before initialization/);
  const review = recipes['01.03'].review;
  assert.ok(review.choices.some(choice => /ordem A.?B.?C|ordem fixa/i.test(choice)));
  assert.ok(review.choices.some(choice => /E precisa vir antes de D/i.test(choice)));
  assert.match(review.feedback_incorrect, /ordem fixa/i);
  assert.match(review.feedback_incorrect, /E registra/i);
});

test('01.01 third hint preserves the answer for the post-response explanation', () => {
  assert.doesNotMatch(stage01Preparation['01.01'].hints[2], /object|objeto/i);
});

test('01.07, 01.08, and 01.09 publish literal transfer outputs', () => {
  assert.match(recipes['01.07'].transfer_prompt, /2 dias \| 4 horas/);
  assert.match(recipes['01.07'].transfer_prompt, /2 dias \| 6 horas/);
  assert.match(recipes['01.08'].transfer_prompt, /Agenda \| duração 0 \| avisos false/);
  assert.match(recipes['01.08'].transfer_prompt, /Agenda \| duração 30 \| avisos false/);
  assert.match(recipes['01.09'].hidden, /Lume \| energia 0/);
  assert.match(recipes['01.09'].transfer_prompt, /Lume \| energia 8/);
  assert.match(recipes['01.09'].transfer_prompt, /Lume \| energia 3/);
  assert.match(recipes['01.09'].transfer_prompt, /Lume \| energia 0/);
  for (const id of ['01.08', '01.09']) {
    assert.doesNotMatch(recipes[id].public, /saída conforme|contrato publicado/i);
  }
});

test('01.07, 01.08, and 01.09 prompts state the literal output contract', () => {
  assert.match(recipes['01.07'].prompt, /2h15/);
  assert.match(recipes['01.08'].prompt, /Arena \| volume 0/);
  assert.match(recipes['01.08'].prompt, /Arena \| volume 7/);
  assert.match(recipes['01.09'].prompt, /Iris \| nível 1 \| vida 0 \| ativa/);
  assert.match(stage01Preparation['01.07'].transfer, /2 dias \| 4 horas/);
  assert.match(stage01Preparation['01.08'].transfer, /Agenda \| duração 0 \| avisos false/);
  assert.match(stage01Preparation['01.09'].transfer, /Lume \| energia 0/);
});
