import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const review = readFileSync(new URL('../review/my-review.md', import.meta.url), 'utf8');
const decisions = readFileSync(new URL('../review/decisions.md', import.meta.url), 'utf8');
test('review has three to five prioritized comments with evidence and suggestion', () => {
  const comments = review.match(/^## P[0-3] — .+$/gm) || [];
  assert.ok(comments.length >= 3 && comments.length <= 5, 'expected three to five comments');
  for (const section of review.split(/^## /m).slice(1)) {
    assert.match(section, /Evidência: \S/);
    assert.match(section, /Impacto: \S/);
    assert.match(section, /Sugestão: \S/);
    assert.doesNotMatch(section, /(?:Evidência|Impacto|Sugestão):\s*\.\.\./);
  }
});
test('each received comment has an accept/reject decision and rationale', () => {
  assert.match(decisions, /^## R1: (aceitar|rejeitar) — .+$/m);
  assert.match(decisions, /^## R2: (aceitar|rejeitar) — .+$/m);
  assert.equal((decisions.match(/^Justificativa: \S/gm) || []).length, 2);
  assert.doesNotMatch(decisions, /(?:R1|R2): (?:aceitar|rejeitar) — \.\.\./);
  assert.doesNotMatch(decisions, /Justificativa: \.\.\./);
});
