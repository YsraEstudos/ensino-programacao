import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync(new URL("../public/course-catalog.json", import.meta.url), "utf8"));
const allowedKinds = new Set(["PREDICT", "TRACE", "PARSONS", "FADED", "READ", "DEBUG", "PROJECT", "MAKE", "MODIFY", "TEST", "TRANSFER", "COMPARE", "INVESTIGATE", "UI", "DOCS", "TYPE"]);
assert(Array.isArray(catalog), "Course catalog must be an array.");
assert.equal(catalog.length, 217, `Expected 217 activities for stages 00–20; found ${catalog.length}.`);

const ids = new Set();
const stageOrder = [];
const bridgeStages = new Set();
for (const [index, item] of catalog.entries()) {
  assert.match(item.id, /^(0[0-9]|1[0-9]|20)\.\d{2}$/u, `Out-of-scope or malformed activity ID at position ${index}: ${item.id}`);
  assert(!ids.has(item.id), `Duplicate activity ID: ${item.id}`);
  ids.add(item.id);
  assert.equal(item.stage, item.id.slice(0, 2), `Stage and ID disagree: ${item.id}`);
  if (stageOrder.at(-1) !== item.stage) stageOrder.push(item.stage);
  assert(allowedKinds.has(item.kind), `Unknown activity kind at ${item.id}: ${item.kind}`);
  assert(item.prompt?.trim() && item.firstResponse?.action?.trim() && item.firstResponse?.timing?.trim(), `Missing prompt or first response in ${item.id}`);
  assert(item.explanation?.mental_model?.trim() && item.explanation?.worked_example?.trim() && item.explanation?.common_trap?.trim() && item.explanation?.why_it_matters?.trim(), `Incomplete explanation in ${item.id}`);
  assert(item.interaction?.trim() && Array.isArray(item.starterFiles) && item.starterFiles.length > 0, `Missing interaction or starter in ${item.id}`);
  assert(Array.isArray(item.rubric) && item.rubric.length > 0, `Missing guided assessment criteria in ${item.id}`);
  assert(item.review?.prompt?.trim() && Array.isArray(item.review.choices) && item.review.choices.length >= 3, `Incomplete review question in ${item.id}`);
  assert(new Set(item.review.choices).size === item.review.choices.length, `Duplicate review choices in ${item.id}`);
  assert(Number.isInteger(item.review.answer) && item.review.answer >= 0 && item.review.answer < item.review.choices.length, `Invalid review answer in ${item.id}`);
  assert(Array.isArray(item.resources) && Array.isArray(item.examples) && Array.isArray(item.checks), `Missing learner resources/checks in ${item.id}`);
  for (const file of item.starterFiles) assert(file.path?.trim() && typeof file.content === "string", `Invalid starter file in ${item.id}`);
  if (item.stageBridge) {
    assert(item.stageBridgeTitle?.trim(), `Bridge title missing for stage ${item.stage}`);
    assert(!bridgeStages.has(item.stage), `Duplicate bridge for stage ${item.stage}`);
    bridgeStages.add(item.stage);
  }
  for (const forbidden of ["hidden_cases", "oracle", "worked_solution", "misconception_target"]) assert(!(forbidden in item), `Private authoring field leaked into public card ${item.id}: ${forbidden}`);
}
assert.deepEqual(stageOrder, Array.from({ length: 21 }, (_, index) => String(index).padStart(2, "0")), "Stages must remain in authored 00–20 order.");
assert.deepEqual([...bridgeStages].sort(), stageOrder, "Every stage must have exactly one published conceptual bridge.");
console.log(`Course catalog valid: ${catalog.length} activities; ${stageOrder.length} stages; one bridge per stage; all reviews, rubrics, starters, and public/private boundaries checked.`);
