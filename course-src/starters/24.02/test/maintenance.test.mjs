import test from 'node:test';
import assert from 'node:assert/strict';
import {summarizeProject} from '../maintenance/report.mjs';
test('B-25 new empty state with old completed/active cases preserved; no input mutation', () => {
  for (const [tasks, expected] of [[[], 'empty'], [[{done:true}], 'done'], [[{done:true},{done:false}], 'active']]) {
    const project = {id: 1, name: 'Research', tasks};
    const before = structuredClone(project);
    assert.equal(summarizeProject(project), expected);
    assert.deepEqual(project, before);
  }
});
