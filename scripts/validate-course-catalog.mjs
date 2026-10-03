import { readFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync(new URL("../public/course-catalog.json", import.meta.url), "utf8"));
const idsSource = readFileSync(new URL("../lib/course-exercise-ids.ts", import.meta.url), "utf8");
const ids = [...idsSource.matchAll(/"((?:D|(?:0[0-9]|1[0-9]|2[0-3]))\.\d{2})"/g)].map((match) => match[1]);
const allowed = new Set([
  "id", "title", "stage", "kind", "optional", "duration", "runtime", "objective", "prompt", "firstResponse",
  "explanation", "interaction", "resources", "starterFiles", "assets", "examples", "checks", "constraints", "rubric", "review", "contentVersion", "stageBridge", "stageBridgeTitle",
]);
const stageCounts = new Map();
const answerPositions = new Map();
const expectedStageOrder = ["D", ...Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"))];

if (catalog.length !== 254) throw new Error(`Expected 254 activities; found ${catalog.length}.`);
if (new Set(catalog.map((item) => item.id)).size !== catalog.length) throw new Error("Duplicate exercise ID in the public catalog.");
if (JSON.stringify(ids) !== JSON.stringify(catalog.map((item) => item.id))) throw new Error("API exercise ID list differs from the public catalog order.");

let previousStageIndex = -1;
for (const item of catalog) {
  if (!/^(?:D\.\d{2}|(?:0[0-9]|1[0-9]|2[0-3])\.\d{2})$/.test(item.id)) throw new Error(`Unexpected exercise ID: ${item.id}`);
  const stage01Fields = new Set(["preparation", "hints", "transfer", "stageBridge", "stageBridgeTitle"]);
  const stage03Fields = new Set(["preparation", "requires", "transferPrompt"]);
  if (Object.keys(item).some((key) => !allowed.has(key) && !(["00", "01"].includes(item.stage) && stage01Fields.has(key)) && !(item.stage === "03" && stage03Fields.has(key)))) throw new Error(`Non-public field in ${item.id}.`);
  const stage = item.stage;
  stageCounts.set(stage, (stageCounts.get(stage) ?? 0) + 1);
  const stageIndex = expectedStageOrder.indexOf(stage);
  if (stageIndex < previousStageIndex) throw new Error(`Stage order regressed at ${item.id}.`);
  previousStageIndex = stageIndex;

  if (!item.title || !item.kind || !item.duration || !item.runtime || !item.objective || !item.prompt) throw new Error(`Missing activity metadata: ${item.id}.`);
  if (!item.firstResponse?.action || !item.firstResponse?.timing) throw new Error(`Missing first-response contract: ${item.id}.`);
  for (const key of ["mental_model", "worked_example", "common_trap", "why_it_matters"]) {
    if (!item.explanation?.[key]) throw new Error(`Missing ${key} explanation: ${item.id}.`);
  }
  if (!item.interaction || !Array.isArray(item.starterFiles) || !item.starterFiles.length) throw new Error(`Missing writing interaction or starter: ${item.id}.`);
  if (!["resources", "assets", "examples", "checks", "constraints", "rubric"].every((key) => Array.isArray(item[key]))) throw new Error(`Invalid learner materials: ${item.id}.`);

  const review = item.review;
  if (!review?.prompt || !Array.isArray(review.choices) || review.choices.length < 3 || !Number.isInteger(review.answer) || review.answer < 0 || review.answer >= review.choices.length || !review.correctFeedback || !review.incorrectFeedback) {
    throw new Error(`Invalid review card: ${item.id}.`);
  }
  if (new Set(review.choices.map((choice) => choice.trim().toLocaleLowerCase("pt-BR"))).size !== review.choices.length) throw new Error(`Duplicate options: ${item.id}.`);
  // Stage 00's published, authored choices retain their original order.
  // Balance the automatically distributed review choices of the expanded catalog.
  if (item.stage !== "00") {
    const count = answerPositions.get(review.choices.length) ?? Array(review.choices.length).fill(0);
    count[review.answer] += 1;
    answerPositions.set(review.choices.length, count);
  }
}

if (stageCounts.get("D") !== 5) throw new Error("The diagnostic must have five activities.");
if ([...Array(21).keys()].reduce((sum, index) => sum + (stageCounts.get(String(index).padStart(2, "0")) ?? 0), 0) !== 217) throw new Error("Stages 00–20 must have 217 activities.");
if ([21, 22, 23].reduce((sum, index) => sum + (stageCounts.get(String(index)) ?? 0), 0) !== 32) throw new Error("Stages 21–23 must have 32 activities.");
for (const [choiceCount, counts] of answerPositions) {
  if (Math.max(...counts) - Math.min(...counts) > 1) throw new Error(`Correct-answer positions are imbalanced for ${choiceCount}-option cards.`);
}

console.log(JSON.stringify({
  activities: catalog.length,
  stages: Object.fromEntries(stageCounts),
  correctAnswerPositions: Object.fromEntries(answerPositions),
  apiIdsMatch: true,
}, null, 2));
