import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { stage01Preparation } from "./stage01-preparation.mjs";
const stage01Teaching = JSON.parse(JSON.stringify(stage01Preparation));
for (const preparation of Object.values(stage01Teaching)) {
  for (const transfer of preparation.masteryTransfers || []) delete transfer.solution;
}
const sourcePath = fileURLToPath(new URL("resolved_preview.json", import.meta.url));
const bridgesPath = fileURLToPath(new URL("bridges.md", import.meta.url));
const fullCatalog = process.argv.includes("--full");
const stage01Only = process.argv.includes("--stage01");
const siteRoot = fileURLToPath(new URL(fullCatalog ? "../devpath-full-catalog/" : "../devpath-publish/", import.meta.url));
const source = JSON.parse(readFileSync(sourcePath, "utf8"));
const bridgeText = readFileSync(bridgesPath, "utf8");
// The full site has separately authored cards outside the revised stage.
const existingFull = (fullCatalog || stage01Only)
  ? new Map(JSON.parse(readFileSync(`${siteRoot}public/course-catalog.json`, "utf8")).map((item) => [item.id, item]))
  : null;
const bridgeHeadings = [...bridgeText.matchAll(/^## Ponte (\d{2})(?:–(\d{2}))? — ([^\r\n]+)$/gm)];
const bridges = bridgeHeadings.map((match, index) => ({
  start: Number(match[1]), end: Number(match[2] || match[1]), title: match[3].trim(),
  text: bridgeText.slice(match.index + match[0].length, bridgeHeadings[index + 1]?.index ?? bridgeText.length).trim(),
}));
const selected = source
  .filter((item) => (fullCatalog || /^(0[0-9]|1[0-9]|20)$/.test(item.stage)) && item.status === "contract_ready")
  // Preserve authored stage/activity order; IDs are stable progress keys, not sequence numbers.

const expectedCount = fullCatalog ? 254 : 217;
if (selected.length !== expectedCount) throw new Error(`Expected ${expectedCount} curriculum activities; found ${selected.length}.`);
const ids = new Set();
const firstInStage = new Set();
for (const item of selected) if (!firstInStage.has(item.stage)) firstInStage.add(item.stage);
const activitiesStageSeen = new Set();
const activities = selected.map((item, index) => {
  if (ids.has(item.id)) throw new Error(`Duplicate activity id: ${item.id}`);
  ids.add(item.id);
  if (stage01Only && item.stage !== "01") {
    const existing=existingFull.get(item.id);
    if (!existing) throw new Error(`Missing existing card: ${item.id}`);
    return existing;
  }
  if (fullCatalog && !["00", "01", "02"].includes(item.stage)) {
    const existing = existingFull.get(item.id);
    if (!existing) throw new Error(`Missing authored full-catalog card: ${item.id}`);
    return existing;
  }
  const lesson = item.learner;
  const recall = item.platform?.active_recall;
  if (!lesson?.prompt || !lesson.first_response?.action || !lesson.first_response?.timing || !lesson.explanation?.mental_model || !lesson.interaction || !lesson.starter_files?.length || !recall?.prompt || !recall.choices?.length) {
    throw new Error(`Incomplete learner contract: ${item.id}`);
  }
  const attachBridge = (!fullCatalog || item.stage === "01") && firstInStage.has(item.stage) && !activitiesStageSeen.has(item.stage);
  const bridge = attachBridge
    ? bridges.find((entry) => Number(item.stage) >= entry.start && Number(item.stage) <= entry.end)
    : null;
  if (attachBridge && !bridge) throw new Error(`Missing conceptual bridge for stage ${item.stage} (${item.id}).`);
  activitiesStageSeen.add(item.stage);
  const resources = [...lesson.resources];
  const stage02Bridge = bridges.find((entry) => entry.start === 2);
  if (item.id === "02.01") resources.push(stage02Bridge.text.split("### Ponte 02B")[0].trim());
  if (item.id === "02.10") resources.push(`Ponte 02B${stage02Bridge.text.split("### Ponte 02B")[1]}`);
  // Rotate correct answers in the complete catalog; preserve the answer text.
  const choices = [...recall.choices];
  const correctText = recall.answer;
  if (item.stage === "01") {
    choices.splice(choices.indexOf(correctText),1);
    choices.splice((Number(item.id.slice(3))-1)%3,0,correctText);
  }
  if (fullCatalog && item.stage !== "01") {
    choices.splice(choices.indexOf(correctText), 1);
    choices.splice(existingFull.get(item.id).review.answer, 0, correctText);
  }
  return {
    id: item.id,
    title: item.title,
    stage: item.stage,
    kind: item.kind,
    contentVersion: item.content_version || 1,
    optional: item.optional,
    duration: `${item.estimated_minutes} min`,
    runtime: item.stage === "01" ? "Interpretador introdutório da Etapa 01" : item.runtime,
    ...(bridge ? { stageBridge: bridge.text, stageBridgeTitle: bridge.title } : {}),
    objective: lesson.first_response.action,
    prompt: lesson.prompt,
    firstResponse: lesson.first_response,
    explanation: lesson.explanation,
    ...(lesson.preparation ? { preparation: lesson.preparation } : {}),
    ...(item.stage === "01" ? { preparation: stage01Teaching[item.id], hints: stage01Teaching[item.id].hints, transfer: stage01Teaching[item.id].transfer } : {}),
    interaction: lesson.interaction,
    resources: item.stage === "01" ? stage01Teaching[item.id].docs.map(doc => `${doc.title}: ${doc.url}. Seção: ${doc.section}. ${doc.question}`) : resources,
    starterFiles: lesson.starter_files,
    assets: lesson.assets,
    examples: lesson.public_examples,
    checks: lesson.public_tests,
    constraints: lesson.constraints,
    rubric: lesson.visible_rubric,
    review: {
      prompt: recall.prompt,
      choices,
      answer: choices.indexOf(correctText),
      correctFeedback: recall.feedback_correct,
      incorrectFeedback: recall.feedback_incorrect,
    },
  };
});

const publicPath = `${siteRoot}public/course-catalog.json`;
writeFileSync(publicPath, `${JSON.stringify(activities)}\n`, "utf8");
const idList = activities.map((item) => `  "${item.id}",`).join("\n");
writeFileSync(`${siteRoot}lib/course-exercise-ids.ts`, `// Generated from course-src/resolved_preview.json; learner-facing IDs only.\nexport const courseExerciseIds = [\n${idList}\n] as const;\n`, "utf8");
console.log(`Wrote ${activities.length} learner-safe exercises to ${publicPath}.`);
