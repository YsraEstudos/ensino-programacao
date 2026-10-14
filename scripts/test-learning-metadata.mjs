import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  validateLearningMetadata,
  validateRuntimeFeatureMatrix,
} from './learning-metadata.mjs';

const catalog = [
  {id: '00.01', stage: '00', hints: []},
  {id: '01.01', stage: '01', hints: ['a', 'b', 'c']},
  {id: '04.01', stage: '04', hints: ['a', 'b', 'c']},
  {id: '04.02', stage: '04', hints: ['a', 'b', 'c']},
];

test('accepts activity-ID prerequisites and dedicated hint exemption', () => {
  assert.doesNotThrow(() => validateLearningMetadata(catalog, {
    '00.01': {requires: [], hintExemption: 'stage00 authored preparation: source stage00-preparation.mjs'},
    '01.01': {requires: ['00.01']},
    '04.01': {requires: ['01.01']},
    '04.02': {requires: ['04.01']},
  }));
});

test('rejects unknown, later, self, optional, duplicate, and cyclic prerequisites', () => {
  assert.throws(() => validateLearningMetadata(catalog, {
    '00.01': {requires: ['missing']},
    '01.01': {requires: []},
    '04.01': {requires: []},
    '04.02': {requires: []},
  }), /unknown prerequisite/);
  assert.throws(() => validateLearningMetadata(catalog, {
    '00.01': {requires: ['04.01'], hintExemption: 'dedicated authored source'},
    '01.01': {requires: []},
    '04.01': {requires: []},
    '04.02': {requires: []},
  }), /later activity/);
  assert.throws(() => validateLearningMetadata(catalog, {
    '00.01': {requires: ['00.01'], hintExemption: 'dedicated authored source'},
    '01.01': {requires: []},
    '04.01': {requires: []},
    '04.02': {requires: []},
  }), /cyclic prerequisite graph/);
  assert.throws(() => validateLearningMetadata(catalog, {
    '00.01': {requires: [], hintExemption: 'dedicated authored source'},
    '01.01': {requires: ['04.01']},
    '04.01': {requires: ['01.01']},
    '04.02': {requires: []},
  }, {optionalIds: new Set(['04.01'])}), /optional activity/);
  assert.throws(() => validateLearningMetadata(catalog, {
    '00.01': {requires: [], hintExemption: 'dedicated authored source'},
    '01.01': {requires: ['00.01', '00.01']},
    '04.01': {requires: ['01.01']},
    '04.02': {requires: ['04.01']},
  }), /Duplicate prerequisite/);
  assert.throws(() => validateLearningMetadata(catalog, {
    '00.01': {requires: ['01.01'], hintExemption: 'dedicated authored source'},
    '01.01': {requires: ['00.01']},
    '04.01': {requires: []},
    '04.02': {requires: []},
  }), /cyclic prerequisite graph/);
});

test('requires metadata coverage and authored hints for generic activities', () => {
  assert.throws(() => validateLearningMetadata(catalog, {
    '00.01': {requires: [], hintExemption: 'dedicated authored source'},
    '01.01': {requires: []},
    '04.01': {requires: []},
  }), /missing metadata/);
  assert.throws(() => validateLearningMetadata([
    ...catalog,
    {id: '04.03', stage: '04', hints: []},
  ], {
    '00.01': {requires: [], hintExemption: 'dedicated authored source'},
    '01.01': {requires: ['00.01']},
    '04.01': {requires: ['01.01']},
    '04.02': {requires: ['04.01']},
    '04.03': {requires: []},
  }), /authored hints or hintExemption/);
});

test('checks runtime version distinctions and fallback declarations', () => {
  const matrix = {
    sources: {ecmascript: 'https://tc39.es/ecma262/2026/multipage/'},
    features: [{
      id: 'math-sum-precise', sourceType: 'ecmascript',
      match: ['Api'], nodeVersionAdded: '26.0.0', compatibility: 'fallback required on Node 24',
    }],
  };
  const records = [{id: 'fixture', learner: {prompt: 'Api'}, compatibility: 'fallback required on Node 24'}];
  assert.doesNotThrow(() => validateRuntimeFeatureMatrix(matrix, {minimum: 24, current: 26}, records));
  assert.throws(() => validateRuntimeFeatureMatrix({
    ...matrix,
    features: [{...matrix.features[0], nodeVersionAdded: '24.3.0', compatibility: 'Node 24'}],
  }, {minimum: 24, current: 26}, [{...records[0], compatibility: 'Node 24'}]), /compatibility strategy/);
  assert.throws(() => validateRuntimeFeatureMatrix({
    ...matrix,
    features: [{...matrix.features[0], sourceType: 'unknown'}],
  }, {minimum: 24, current: 26}), /sourceType/);
});

test('compares complete Node semver tuples against the exact 24.0.0 floor', () => {
  const versions = ['24.0.1', '24.3.0', '25.0.0', '26.0.0', 'não suportado'];
  for (const version of versions) {
    const matrix = {
      sources: {node: 'https://nodejs.org/en/about/previous-releases'},
      features: [{id: `feature-${version}`, sourceType: 'web-node-api', match: ['Api'], nodeVersionAdded: version}],
    };
    const records = [{id: 'fixture', learner: {prompt: 'Api'}, compatibility: 'Node.js 24'}];
    assert.throws(() => validateRuntimeFeatureMatrix(matrix, {minimum: '24.0.0', current: '26.0.0'}, records), /compatibility strategy/);
    records[0].compatibility = 'Node.js 24; fallback and feature detection required';
    assert.doesNotThrow(() => validateRuntimeFeatureMatrix(matrix, {minimum: '24.0.0', current: '26.0.0'}, records));
  }
  assert.throws(() => validateRuntimeFeatureMatrix({
    sources: {node: 'https://nodejs.org/en/about/previous-releases'},
    features: [{id: 'malformed', sourceType: 'web-node-api', nodeVersionAdded: '24.3.0-suffix'}],
  }, {minimum: '24.0.0', current: '26.0.0'}), /Invalid runtime version/);
});

test('accepts the checked course feature matrix with standard, platform, and proposal classes', () => {
  const matrix = JSON.parse(readFileSync(new URL('../course-src/feature-matrix.json', import.meta.url), 'utf8'));
  assert.doesNotThrow(() => validateRuntimeFeatureMatrix(matrix, {minimum: 24, current: 26}));
  assert.ok(matrix.entries.some(entry => entry.sourceType === 'ecmascript'));
  assert.ok(matrix.entries.some(entry => entry.sourceType === 'web-node-api'));
  assert.ok(matrix.entries.some(entry => entry.sourceType === 'runtime-proposal'));
});
