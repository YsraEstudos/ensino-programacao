import test from 'node:test';
import assert from 'node:assert/strict';

import { isAllowedPublicField, validateAssessmentEnvironment } from './validate-course-catalog.mjs';

test('assessmentEnvironment is an intentional public field at every stage', () => {
  for (const stage of ['D', '00', '01', '02', '03', '04', '23']) {
    assert.equal(isAllowedPublicField({stage}, 'assessmentEnvironment'), true, stage);
  }
});

test('rubricFingerprint is a public identity field for the current visible checklist', () => {
  assert.equal(isAllowedPublicField({stage: '09'}, 'rubricFingerprint'), true);
});

test('Stage 03 generic fallback fields are limited to IDs outside dedicated contracts', () => {
  for (const field of ['preparation', 'hints', 'edgeCases', 'primers', 'autoTested']) {
    assert.equal(isAllowedPublicField({id: '03.10', stage: '03'}, field), true, field);
  }
  for (const field of ['hints', 'edgeCases', 'primers', 'autoTested']) {
    assert.equal(isAllowedPublicField({id: '03.09', stage: '03'}, field), false, field);
  }
});

test('assessmentEnvironment accepts only published environment identifiers', () => {
  for (const assessmentEnvironment of ['javascript', 'typescript', 'dom', 'network', 'node-simulated', 'local', 'rubric']) {
    assert.doesNotThrow(() => validateAssessmentEnvironment({id: '15.01', assessmentEnvironment}));
  }

  assert.doesNotThrow(() => validateAssessmentEnvironment({id: '15.01'}));
  for (const assessmentEnvironment of ['', 'browser', 'DOM', 'node', null, 1]) {
    assert.throws(
      () => validateAssessmentEnvironment({id: '15.01', assessmentEnvironment}),
      /Invalid assessment environment: 15\.01/,
      String(assessmentEnvironment),
    );
  }
});
