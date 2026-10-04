import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createCourseArtifacts} from '../course-src/build-public-curriculum.mjs';

test('Stage 03 count examples retain the corrected upper endpoint', () => {
  const catalog = JSON.parse(fs.readFileSync(new URL('../public/course-catalog.json', import.meta.url), 'utf8'));
  const item = catalog.find(item => item.id === '03.07');
  assert(item.examples.some(example => example.given.includes('limite=5') && example.expected === '3 (6,8,10)'));
});

test('generation preserves every authored ID and leaves source records untouched', () => {
  const sourcePath = new URL('../course-src/.generated/resolved_preview.json', import.meta.url);
  const before = fs.readFileSync(sourcePath, 'utf8');
  const generated = JSON.parse(createCourseArtifacts().get('public/course-catalog.json'));
  assert.deepEqual(generated.map(item => item.id), JSON.parse(before).map(item => item.id));
  assert.equal(fs.readFileSync(sourcePath, 'utf8'), before);
});
