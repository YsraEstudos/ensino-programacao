import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { stage03Contracts } from "../course-src/stage03-contract.mjs";
import { loadVariantBank } from "../course-src/variant-sources.mjs";

const catalog = JSON.parse(readFileSync(new URL("../public/course-catalog.json", import.meta.url), "utf8"));
const canonical = JSON.parse(readFileSync(new URL("../course-src/.generated/resolved_preview.json", import.meta.url), "utf8"));
const canonicalIds = canonical.map((item) => item.id);
const idsSource = readFileSync(new URL("../lib/course-exercise-ids.ts", import.meta.url), "utf8");
const ids = [...idsSource.matchAll(/"((?:D|(?:0[0-9]|1[0-9]|2[0-3]))\.\d{2})"/g)].map((match) => match[1]);
const allowed = new Set([
  "id", "title", "stage", "kind", "optional", "duration", "runtime", "objective", "prompt", "firstResponse", "assessmentEnvironment",
  "explanation", "interaction", "resources", "starterFiles", "readOnlyFiles", "assets", "examples", "checks", "constraints", "rubric", "rubricFingerprint", "review", "contentVersion", "stageBridge", "stageBridgeTitle", "compatibility", "learningMetadata",
]);
const assessmentEnvironments = new Set(["javascript", "typescript", "dom", "network", "node-simulated", "local", "rubric"]);

export function isAllowedPublicField(item, key) {
  const stage01Fields = new Set(["preparation", "hints", "transfer", "stageBridge", "stageBridgeTitle", "edgeCases", "primers", "autoTested"]);
  const stage03Fields = new Set(["preparation", "requires", "transferPrompt"]);
  const genericStage03Fields = new Set(["preparation", "hints", "edgeCases", "primers", "autoTested"]);
  return allowed.has(key)
    || ((["00", "01"].includes(item.stage) || Number(item.stage) >= 4) && stage01Fields.has(key))
    || (item.stage === "03" && stage03Fields.has(key))
    || (item.stage === "03" && !Object.hasOwn(stage03Contracts, item.id) && genericStage03Fields.has(key));
}

export function validateAssessmentEnvironment(item) {
  if (item.assessmentEnvironment !== undefined && !assessmentEnvironments.has(item.assessmentEnvironment)) {
    throw new Error(`Invalid assessment environment: ${item.id}.`);
  }
}

// Banco de variantes (Fase 6, 6.1): itens de prática vinculados a uma atividade de origem.
// Variantes nunca entram no catálogo; por isso usam identificadores próprios (var.NN.NN.slug).
const VARIANT_EVALUATOR_BY_FORMAT = new Map([
  ["choice-predict", "choice"],
  ["predict-code", "output-match"],
  ["short-fix", "behavior"],
  ["mini-impl", "behavior"],
]);
const VARIANT_ENVIRONMENTS = new Set(["javascript", "dom", "typescript", "node-local", "rubric"]);
const VARIANT_EVALUATORS = new Set(["choice", "output-match", "behavior"]);
const BROWSER_VARIANT_ENVIRONMENTS = new Set(["javascript", "dom"]);
const KATA_BANDS = ["07", "11", "14", "18"];
const STAGE_SEQUENCE = ["D", ...Array.from({length: 24}, (_, index) => String(index).padStart(2, "0"))];
const SAFE_VARIANT_PATH = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))(?!.*\\)[\w.-]+(?:\/[\w.-]+)*\.[cm]?[jt]sx?$/;

const stageRank = stage => {
  const rank = STAGE_SEQUENCE.indexOf(stage);
  if (rank < 0) throw new Error(`Unknown stage in variant bank: ${stage}.`);
  return rank;
};

// Accepts the editorial shape (maps) and the published shape (arrays of {path, content}).
function variantFileMap(value) {
  if (Array.isArray(value)) return Object.fromEntries(value.map(file => [file?.path, file?.content]));
  return value;
}

function isFileMap(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0
    && Object.entries(value).every(([path, content]) => SAFE_VARIANT_PATH.test(path) && typeof content === "string" && content.trim() !== "");
}

// activities: [{id, stage}] in catalog order. concepts: Map of concept-graph nodes ({id, introduced_at, requires}).
export function validateVariantBank(bank, {activities, concepts}) {
  if (!bank || bank.version !== 1 || !Array.isArray(bank.variants)) throw new Error("Invalid variant bank envelope.");
  const activityIndex = new Map(activities.map((activity, index) => [activity.id, index]));
  const activityStage = new Map(activities.map(activity => [activity.id, activity.stage]));
  const seen = new Set();

  for (const variant of bank.variants) {
    const id = variant?.variantId;
    if (typeof id !== "string" || !id) throw new Error("Variant without variantId.");
    if (seen.has(id)) throw new Error(`Duplicate variant ID: ${id}.`);
    seen.add(id);
    if (/^\d{2}\.\d{2}$/.test(id) || activityIndex.has(id)) throw new Error(`Variant ID collides with an activity ID: ${id}.`);
    const match = /^var\.(\d{2}\.\d{2})\.([a-z0-9]+(?:-[a-z0-9]+)*)$/.exec(id);
    if (!match) throw new Error(`Invalid variant ID: ${id}.`);

    const source = variant.sourceActivityId;
    if (!activityIndex.has(source)) throw new Error(`Unknown source activity in ${id}: ${source}.`);
    if (match[1] !== source) throw new Error(`Variant ID ${id} does not match its source activity ${source}.`);
    const sourceIndex = activityIndex.get(source);
    const sourceStage = activityStage.get(source);

    if (!Array.isArray(variant.prerequisites) || new Set(variant.prerequisites).size !== variant.prerequisites.length) {
      throw new Error(`Invalid prerequisites in ${id}.`);
    }
    for (const prerequisite of variant.prerequisites) {
      if (!activityIndex.has(prerequisite)) throw new Error(`Unknown prerequisite in ${id}: ${prerequisite}.`);
      if (activityIndex.get(prerequisite) >= sourceIndex) throw new Error(`Prerequisite ${prerequisite} comes after source ${source} in ${id}.`);
    }

    const concept = concepts.get(variant.conceptId);
    if (!concept) throw new Error(`Unknown concept in ${id}: ${variant.conceptId}.`);
    if (stageRank(concept.introduced_at) > stageRank(sourceStage)) throw new Error(`Concept ${variant.conceptId} is introduced after source ${source} in ${id}.`);
    for (const required of concept.requires || []) {
      const requiredConcept = concepts.get(required);
      if (!requiredConcept) throw new Error(`Unknown required concept of ${variant.conceptId} in ${id}: ${required}.`);
      if (stageRank(requiredConcept.introduced_at) > stageRank(sourceStage)) throw new Error(`Hidden prerequisite concept ${required} is introduced after source ${source} in ${id}.`);
    }

    if (!VARIANT_EVALUATOR_BY_FORMAT.has(variant.format)) throw new Error(`Unknown variant format in ${id}: ${variant.format}.`);
    if (!VARIANT_ENVIRONMENTS.has(variant.environment)) throw new Error(`Invalid variant environment in ${id}: ${variant.environment}.`);
    if (!VARIANT_EVALUATORS.has(variant.evaluator)) throw new Error(`Invalid variant evaluator in ${id}: ${variant.evaluator}.`);
    if (variant.evaluator !== VARIANT_EVALUATOR_BY_FORMAT.get(variant.format)) throw new Error(`Format ${variant.format} requires evaluator ${VARIANT_EVALUATOR_BY_FORMAT.get(variant.format)} in ${id}.`);
    const executable = variant.format === "short-fix" || variant.format === "mini-impl";
    if (executable && !BROWSER_VARIANT_ENVIRONMENTS.has(variant.environment)) throw new Error(`${variant.format} requires a browser-executable environment in ${id}.`);

    if (!Array.isArray(variant.bands) || new Set(variant.bands).size !== variant.bands.length || variant.bands.some(band => !KATA_BANDS.includes(band))) {
      throw new Error(`Invalid kata bands in ${id}.`);
    }
    for (const band of variant.bands) {
      if (stageRank(band) <= stageRank(sourceStage)) throw new Error(`Kata band ${band} does not come after source ${source} in ${id}.`);
    }

    if (typeof variant.transferDecision !== "string" || variant.transferDecision.trim().length < 40) throw new Error(`Missing transfer decision in ${id}.`);
    if (!Number.isInteger(variant.contentVersion) || variant.contentVersion < 1) throw new Error(`Invalid content version in ${id}.`);
    if (typeof variant.prompt !== "string" || !variant.prompt.trim()) throw new Error(`Missing prompt in ${id}.`);

    if (variant.format === "choice-predict") {
      const choices = variant.choices;
      if (!Array.isArray(choices) || choices.length < 3 || choices.length > 5 || choices.some(choice => typeof choice !== "string" || !choice.trim())) {
        throw new Error(`Invalid choices in ${id}.`);
      }
      if (new Set(choices.map(choice => choice.trim().toLocaleLowerCase("pt-BR"))).size !== choices.length) throw new Error(`Duplicate choices in ${id}.`);
      if (!Number.isInteger(variant.answer) || variant.answer < 0 || variant.answer >= choices.length) throw new Error(`Answer out of range in ${id}.`);
      if (typeof variant.feedback?.correct !== "string" || !variant.feedback.correct.trim()) throw new Error(`Missing correct feedback in ${id}.`);
      const byChoice = variant.feedback?.byChoice;
      if (!byChoice || typeof byChoice !== "object" || Array.isArray(byChoice)) throw new Error(`Missing feedback.byChoice in ${id}.`);
      const wrong = choices.map((_, index) => index).filter(index => index !== variant.answer);
      for (const index of wrong) {
        const text = byChoice[String(index)];
        if (typeof text !== "string" || !text.trim()) throw new Error(`Missing feedback for wrong choice ${index} in ${id}.`);
      }
      if (Object.keys(byChoice).length !== wrong.length) throw new Error(`feedback.byChoice must cover only wrong choices in ${id}.`);
      if (variant.code !== undefined && (typeof variant.code !== "string" || !variant.code.trim())) throw new Error(`Invalid code in ${id}.`);
    } else if (variant.format === "predict-code") {
      if (typeof variant.code !== "string" || !variant.code.trim()) throw new Error(`Missing code in ${id}.`);
      if (typeof variant.expectedOutput !== "string" || !variant.expectedOutput.trim()) throw new Error(`Missing expectedOutput in ${id}.`);
    } else {
      const starter = variantFileMap(variant.starterFiles);
      const reference = variantFileMap(variant.correctFiles);
      if (!SAFE_VARIANT_PATH.test(variant.entryPath || "")) throw new Error(`Invalid entryPath in ${id}.`);
      if (!isFileMap(starter) || !(variant.entryPath in starter)) throw new Error(`Invalid starterFiles in ${id}.`);
      if (!isFileMap(reference) || !(variant.entryPath in reference)) throw new Error(`Invalid correctFiles in ${id}.`);
      if (JSON.stringify(Object.keys(starter).sort()) !== JSON.stringify(Object.keys(reference).sort())) throw new Error(`Starter and reference file sets differ in ${id}.`);
      if (typeof variant.tests !== "string" || !/\b(?:describe|test)\(/.test(variant.tests)) throw new Error(`Missing behavior tests in ${id}.`);
      if (!Array.isArray(variant.mutants) || variant.mutants.length < 1) throw new Error(`Executable variant needs at least one mutant: ${id}.`);
      const mutantIds = new Set();
      for (const mutant of variant.mutants) {
        if (typeof mutant?.id !== "string" || !mutant.id || mutantIds.has(mutant.id)) throw new Error(`Invalid mutant ID in ${id}.`);
        mutantIds.add(mutant.id);
        const files = variantFileMap(mutant.files);
        if (!isFileMap(files) || Object.keys(files).some(path => !(path in reference))) throw new Error(`Invalid mutant files in ${id}: ${mutant.id}.`);
        if (Object.keys(files).every(path => files[path] === reference[path])) throw new Error(`Mutant ${mutant.id} is identical to the reference in ${id}.`);
      }
    }
  }
  return {variants: seen.size, formats: Object.fromEntries([...VARIANT_EVALUATOR_BY_FORMAT.keys()].map(format => [format, bank.variants.filter(variant => variant.format === format).length]))};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
const stageCounts = new Map();
const answerPositions = new Map();
const expectedStageOrder = ["D", ...Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"))];

if (new Set(catalog.map((item) => item.id)).size !== catalog.length) throw new Error("Duplicate exercise ID in the public catalog.");
if (JSON.stringify(catalog.map((item) => item.id)) !== JSON.stringify(canonicalIds)) throw new Error("Public catalog IDs or order differ from compiled source.");
if (JSON.stringify(ids) !== JSON.stringify(catalog.map((item) => item.id))) throw new Error("API exercise ID list differs from the public catalog order.");

let previousStageIndex = -1;
for (const item of catalog) {
  validateAssessmentEnvironment(item);
  if (!item.compatibility || item.compatibility.startsWith("Recursos básicos")) throw new Error(`Missing specific compatibility in ${item.id}.`);
  if (!/^(?:D\.\d{2}|(?:0[0-9]|1[0-9]|2[0-3])\.\d{2})$/.test(item.id)) throw new Error(`Unexpected exercise ID: ${item.id}`);
  if (Object.keys(item).some((key) => !isAllowedPublicField(item, key))) throw new Error(`Non-public field in ${item.id}.`);
  const stage = item.stage;
  if (Number(stage) >= 4 && !(Array.isArray(item.edgeCases) && item.edgeCases.length && item.edgeCases.every((rule) => typeof rule === "string" && rule.trim()))) throw new Error(`Missing public edge cases: ${item.id}.`);
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
  if (item.readOnlyFiles !== undefined && (!Array.isArray(item.readOnlyFiles) || !item.readOnlyFiles.length || item.readOnlyFiles.some((file) => !file || typeof file.path !== "string" || !file.path.trim() || typeof file.label !== "string" || !file.label.trim() || typeof file.content !== "string"))) throw new Error(`Invalid read-only files: ${item.id}.`);
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

if (stageCounts.get("D") !== 9) throw new Error("The diagnostic must have nine activities.");
for (const [choiceCount, counts] of answerPositions) {
  if (Math.max(...counts) - Math.min(...counts) > 1) throw new Error(`Correct-answer positions are imbalanced for ${choiceCount}-option cards.`);
}

// Variants are checked against the compiled order and the Fase 4 concept graph, both in the editorial source and in the publication.
const conceptGraph = JSON.parse(readFileSync(new URL("../course-src/.generated/concept_graph.json", import.meta.url), "utf8"));
const concepts = new Map(conceptGraph.concepts.map(concept => [concept.id, concept]));
const variantActivities = canonical.map(item => ({id: item.id, stage: item.stage}));
const variantBank = loadVariantBank();
const publishedVariants = JSON.parse(readFileSync(new URL("../public/course-variants.json", import.meta.url), "utf8"));
const variantSummary = validateVariantBank(variantBank, {activities: variantActivities, concepts});
validateVariantBank(publishedVariants, {activities: variantActivities, concepts});
if (publishedVariants.variants.length !== variantBank.variants.length) throw new Error("Published variants differ from the editorial bank.");

console.log(JSON.stringify({
  activities: catalog.length,
  variants: variantSummary,
  stages: Object.fromEntries(stageCounts),
  correctAnswerPositions: Object.fromEntries(answerPositions),
  apiIdsMatch: true,
}, null, 2));
}
