import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import { fileURLToPath } from "node:url";
import { localAssessmentCommandIssues } from "./local-assessment-validation.mjs";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_SOURCE = path.resolve(SCRIPT_DIR, "../course-src/.generated/resolved_preview.json");
const DEFAULT_ASSESSMENTS = path.resolve(SCRIPT_DIR, "../course-src/assessments.json");
const DEFAULT_PRIMER_COVERAGE = path.resolve(SCRIPT_DIR, "../course-src/concept-coverage.json");
const TIMEOUT_MS = 1_000;
const ALLOWED_STATUSES = new Set(["DRAFT", "NEEDS_CONTRACT", "CONTRACT_READY", "IMPLEMENTED", "REVIEW", "READY", "RETIRED"]);
const EXTENSION_APIS = [
  ["Array.fromAsync", /\bArray\.fromAsync\b/],
  ["Promise.try", /\bPromise\.try\b/],
  ["RegExp.escape", /\bRegExp\.escape\b/],
  ["using declarations", /\b(?:await\s+)?using\s+\w+/],
  ["DisposableStack", /\b(?:Async)?DisposableStack\b/],
  ["Symbol.dispose", /\bSymbol\.(?:asyncDispose|dispose)\b/],
  // Fase 5 (análise curricular, pré-requisito): recursos das versões atuais precisam de classificação opcional e estratégia de compatibilidade.
  ["private brand check", /#[A-Za-z_]\w*\s+in\s+[\w$.]+/],
  ["import.meta.dirname/filename", /\bimport\.meta\.(?:dirname|filename)\b/],
  ["process.loadEnvFile/--env-file", /\bloadEnvFile\s*\(|--env-file/],
  ["node --run", /\bnode\s+--run\b/],
  ["require(esm)", /\brequire\(\s*['"][^'"]+\.mjs['"]\s*\)/],
  ["JSON.parse reviver context", /\bcontext\.source\b|\bJSON\.rawJSON\b/],
  ["Map.getOrInsert", /\.getOrInsert(?:Computed)?\(/],
  ["String well-formed methods", /\.(?:isWellFormed|toWellFormed)\(/],
  ["Promise.withResolvers/AbortSignal timeout or any", /\bPromise\.withResolvers\b|\bAbortSignal\.(?:timeout|any)\b/],
  ["Uint8Array base64/hex", /\.(?:toBase64|toHex)\(|\bUint8Array\.fromBase64\b/],
];

function parseArgs(argv) {
  let source = process.env.DEVPATH_CURRICULUM_SOURCE || DEFAULT_SOURCE;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--source") {
      if (!argv[index + 1]) throw new Error("--source requires a path.");
      source = argv[index + 1];
      index += 1;
    } else if (arg.startsWith("--source=")) {
      source = arg.slice("--source=".length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return path.resolve(source);
}

function normalizeStatus(value) {
  return typeof value === "string" ? value.trim().replace(/[ -]/g, "_").toUpperCase() : "";
}

function loadJson(filePath, label) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Cannot read ${label} at ${filePath}: ${error.message}`);
  }
}

function addFinding(findings, status, itemId, code, message, { alwaysFatal = false } = {}) {
  const ready = normalizeStatus(status) === "READY";
  const severity = alwaysFatal || ready ? "error" : "warning";
  findings.push({ severity, item: itemId || "(source)", code, message });
}

function stageRank(stage) {
  if (stage === "D") return 0;
  if (typeof stage !== "string" || !/^\d{2}$/.test(stage)) return -1;
  return Number(stage) + 1;
}

function createFeatureMapper(conceptGraph) {
  const concepts = new Set((conceptGraph.concepts || []).map((item) => item.id));
  const conceptById = new Map((conceptGraph.concepts || []).map((concept) => [concept.id, concept]));
  // ESM is the exercise-runner packaging contract. Browser modules remain a distinct
  // concept, detected only from authored module graph declarations, not from runtime labels.
  const moduleConcept = concepts.has("modules.esm") ? "modules.esm" : "modules.browser";
  const conceptByFeature = new Map([
    ["function", "functions.return"],
      ["arrow", "functions.return"],
    ["callback", "callbacks.basic"],
    ["array-method", concepts.has("arrays.pipeline") ? "arrays.pipeline" : "arrays.basic"],
    ["map-set", "mapset.basic"],
    ["module", moduleConcept],
    ["async", "async.promise"],
    ["catch", "errors.try_catch"],
    ["date", "date.time"],
    ["promise", "async.promise"],
    ["async-iterable", concepts.has("async.iterables") ? "async.iterables" : "iterators.async"],
    ["fetch", "fetch.basic"],
    ["dom", "dom.basic"],
    ["class", "classes.basic"],
    ["throw", "errors.throw"],
    ["catch", "errors.try_catch"],
    ["error-type", "errors.types"],
    ["worker", "workers.basic"],
    ["typescript", "ts.basic"],
    ["math", "math.basic"],
    ["strings", "strings.basic"],
    ["scope", "scope.lexical"],
    ["using", "resources.cleanup"],
  ]);
  return { concepts, conceptById, conceptByFeature };
}

function collectFeatures(sourceFile, text) {
  const features = new Set();
  const extensionMentions = EXTENSION_APIS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  const add = (feature) => features.add(feature);
  const isTsTypeNode = (node) =>
    ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) ||
    ts.isTypeAssertionExpression(node) || ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) || ts.isNonNullExpression(node) ||
    (ts.isTypeNode(node) && !ts.isExpressionWithTypeArguments(node)) ||
    ts.isParameter(node) && Boolean(node.type);

  function visit(node) {
    if (ts.isArrowFunction(node)) { add("function"); add("arrow"); }
    if (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) add("function");
    if (ts.isArrowFunction(node) && ts.isCallExpression(node.parent)) {
      const call = node.parent.expression;
      if (ts.isPropertyAccessExpression(call) && ["map", "filter", "find", "some", "every", "reduce", "flatMap", "then", "catch", "finally", "setTimeout", "addEventListener"].includes(call.name.text)) add("callback");
    }
    if (ts.isClassDeclaration(node) || ts.isClassExpression(node)) add("class");
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node) || ts.isExportAssignment(node) ||
        ts.canHaveModifiers(node) && (ts.getModifiers(node) || []).some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) add("module");
    if (ts.isThrowStatement(node)) add("throw");
    if (ts.isCatchClause(node) || ts.isTryStatement(node)) add("catch");
    if (ts.isAwaitExpression(node) || ts.isAsyncFunction(node)) add("async");
    if (ts.isForOfStatement(node) && node.awaitModifier) add("async-iterable");
    if (isTsTypeNode(node)) add("typescript");
    if (ts.isPropertyAccessExpression(node)) {
      const name = node.name.text;
      if (["map", "filter", "find", "findIndex", "some", "every", "reduce", "flat", "flatMap", "toSorted", "toReversed", "toSpliced", "with"].includes(name)) add("array-method");
      if (["then", "all", "allSettled", "any", "race", "try"].includes(name) && node.expression.getText(sourceFile) === "Promise") add("async");
      if (["floor", "ceil", "round", "trunc", "min", "max", "abs", "random"].includes(name) && node.expression.getText(sourceFile) === "Math") add("math");
      if (name === "fromAsync" && node.expression.getText(sourceFile) === "Array") add("async-iterable");
    }
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression)) {
      const name = node.expression.text;
      if (["Map", "Set", "WeakMap", "WeakSet"].includes(name)) add("map-set");
      if (name === "Date") add("date");
      if (name === "Promise") add("promise");
      if (["Error", "TypeError", "RangeError", "AggregateError", "SuppressedError"].includes(name)) add("error-type");
      if (["Worker", "SharedWorker"].includes(name)) add("worker");
    }
    if (ts.isIdentifier(node)) {
      if (["document", "window", "HTMLElement", "Element", "Node"].includes(node.text)) add("dom");
      if (node.text === "fetch") add("fetch");
      if (node.text === "Date") add("date");
      if (node.text === "Promise") add("promise");
      if (["Error", "TypeError", "RangeError", "AggregateError", "SuppressedError"].includes(node.text)) add("error-type");
      if (node.text === "using" || node.text === "DisposableStack" || node.text === "AsyncDisposableStack") add("using");
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return { features, extensionMentions };
}

function parseCode(code, fileName, item, status, findings, featureMapper) {
  const scriptKind = /\.tsx?$/i.test(fileName) ? ts.ScriptKind.TS : /\.jsx$/i.test(fileName) ? ts.ScriptKind.JSX : ts.ScriptKind.JS;
  const sourceFile = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, scriptKind);
  const intentionallyIncomplete = ["DEBUG", "FADED", "PARSONS"].includes(String(item.kind || "").toUpperCase()) || /\/\*\s*(?:complete|preencher|TODO)\s*\*\//i.test(code);
  if (!intentionallyIncomplete) {
    for (const diagnostic of sourceFile.parseDiagnostics || []) {
      const at = diagnostic.file?.getLineAndCharacterOfPosition(diagnostic.start || 0);
      addFinding(findings, status, item.id, "JS_PARSE_ERROR", `${fileName}${at ? `:${at.line + 1}:${at.character + 1}` : ""}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, " ")}`);
    }
  }
  const result = collectFeatures(sourceFile, code, featureMapper);
  if (scriptKind === ts.ScriptKind.TS || scriptKind === ts.ScriptKind.TSX || result.features.has("typescript")) {
    result.features.add("typescript");
  }
  return result;
}

function extractFencedSnippets(value, prefix, snippets) {
  if (typeof value === "string") {
    const pattern = /```(?:js|javascript|mjs|cjs|ts|typescript|tsx)\s*\r?\n([\s\S]*?)```/gi;
    let match;
    let count = 0;
    while ((match = pattern.exec(value))) {
      const ext = /^```\s*(ts|typescript|tsx)\b/i.test(match[0]) ? ".ts" : ".js";
      snippets.push({ name: `${prefix}-fence-${count + 1}${ext}`, code: match[1] });
      count += 1;
    }
  } else if (Array.isArray(value)) {
    value.forEach((child, index) => extractFencedSnippets(child, `${prefix}-${index}`, snippets));
  } else if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) extractFencedSnippets(child, `${prefix}-${key}`, snippets);
  }
}

function matchesConceptAlias(skills, concept) {
  if (skills.includes(concept)) return true;
  const prefixes = {
    "functions.return": ["functions."],
    "callbacks.basic": ["callbacks."],
    "arrays.pipeline": ["arrays."],
    "arrays.basic": ["arrays."],
    "mapset.basic": ["mapset."],
    "async.promise": ["async."],
    "modules.esm": ["modules."],
    "modules.browser": ["modules."],
    "classes.basic": ["classes."],
    "ts.basic": ["ts."],
    "workers.basic": ["workers."],
    "resources.cleanup": ["resources."],
  }[concept] || [];
  if (skills.some((skill) => prefixes.some((prefix) => skill.startsWith(prefix)))) return true;
  if (concept === "functions.return" && skills.includes("diagnostic.function_return")) return true;
  return false;
}

async function validateGraph(cards, graph, findings) {
  const concepts = new Map((graph.concepts || []).map((concept) => [concept.id, concept]));
  const activities = graph.activities || [];
  const graphActivityById = new Map(activities.map((activity) => [activity.id, activity]));
  const skillIntroductionStage = new Map();
  for (const activity of activities) {
    for (const skill of activity.introduces || []) {
      if (!skillIntroductionStage.has(skill)) skillIntroductionStage.set(skill, activity.stage);
    }
  }
  const globalStatus = cards.some((card) => normalizeStatus(card.status) === "READY") ? "READY" : "CONTRACT_READY";
  if (concepts.size !== (graph.concepts || []).length) addFinding(findings, globalStatus, "", "GRAPH_DUPLICATE_CONCEPT", "Concept graph contains duplicate concept IDs.");
  validateDag(graph.edges || [], globalStatus, findings);
  if (graphActivityById.size !== activities.length) addFinding(findings, globalStatus, "", "GRAPH_DUPLICATE_ACTIVITY", "Concept graph contains duplicate activity IDs.");
  if (cards.length !== activities.length || cards.some((card, index) => activities[index]?.id !== card.id)) {
    addFinding(findings, globalStatus, "", "GRAPH_SEQUENCE_MISMATCH", "Activity order differs from concept_graph.json; regenerate the graph and preview from the same source revision.");
  }
  const cardIds = new Set();
  let priorStage = -1;
  for (const item of cards) {
    const status = normalizeStatus(item.status);
    if (!ALLOWED_STATUSES.has(status)) {
      addFinding(findings, status, item.id, "INVALID_STATUS", `Unknown status ${JSON.stringify(item.status)}. Allowed: ${[...ALLOWED_STATUSES].join(", ")}.`, { alwaysFatal: true });
      continue;
    }
    if (!item.id || cardIds.has(item.id)) addFinding(findings, status, item.id, "DUPLICATE_OR_MISSING_ID", "Activity ID is missing or duplicated.");
    cardIds.add(item.id);
    const rank = stageRank(item.stage);
    if (rank < 0) addFinding(findings, status, item.id, "INVALID_STAGE", `Invalid stage ${JSON.stringify(item.stage)}.`);
    else if (rank < priorStage) addFinding(findings, status, item.id, "STAGE_ORDER", "Source activities are not ordered by stage.");
    priorStage = Math.max(priorStage, rank);

    const requirements = Array.isArray(item.requires) ? item.requires : [];
    const graphActivity = graphActivityById.get(item.id);
    if (!graphActivity) addFinding(findings, status, item.id, "GRAPH_ACTIVITY_MISSING", "Activity is absent from concept_graph.json.");
    else {
      if (graphActivity.stage !== item.stage) addFinding(findings, status, item.id, "GRAPH_STAGE_MISMATCH", `Card stage ${item.stage} differs from graph stage ${graphActivity.stage}.`);
      for (const key of ["requires", "introduces"]) {
        const left = [...(item[key] || [])].sort();
        const right = [...(graphActivity[key] || [])].sort();
        if (JSON.stringify(left) !== JSON.stringify(right)) addFinding(findings, status, item.id, "GRAPH_CONTRACT_MISMATCH", `${key} differs from concept_graph.json.`);
      }
    }
    for (const required of requirements) {
      const introducedAt = concepts.get(required)?.introduced_at || skillIntroductionStage.get(required);
      if (!introducedAt) {
        addFinding(findings, status, item.id, "UNKNOWN_CONCEPT", `Unknown required concept ${required}.`);
      } else if (stageRank(introducedAt) > rank) {
        addFinding(findings, status, item.id, "FUTURE_PREREQUISITE", `${required} is not available by stage ${item.stage}.`);
      }
    }

    const featureMapper = createFeatureMapper(graph, item);
    featureMapper.skillIntroductionStage = skillIntroductionStage;
    validateCardFields(item, status, findings);
    const extensionApis = validateCardCode(item, status, findings, featureMapper);
    validateHiddenContracts(item, status, findings);
    if (extensionApis.length) {
      const optional = item.optional === true || item.extension === true || item.track === "extension";
      if (!optional) addFinding(findings, status, item.id, "OPTIONAL_EXTENSION", `Modern/rare API (${extensionApis.join(", ")}) is present without optional/extension classification.`);
    }
    validateNextIds(item, status, graphActivityById, findings);
    if (status === "READY") await validateExecutionPackage(item, status, findings);
  }
  for (const item of activities) {
    if (!cardIds.has(item.id)) addFinding(findings, globalStatus, item.id, "GRAPH_CARD_MISSING", "Concept graph activity has no source card.");
  }
}

function validateCardFields(item, status, findings) {
  const difficulty = item.difficulty;
  if (!difficulty || !Number.isFinite(item.estimated_minutes) || !Number.isInteger(item.estimated_minutes) || item.estimated_minutes <= 0) {
    addFinding(findings, status, item.id, "DIFFICULTY_DURATION", "Difficulty metadata or positive integer estimated_minutes is missing/invalid.");
  } else {
    const dimensions = ["novelty", "syntax", "composition", "state", "debugging", "files", "reading", "independence", "tools"];
    const values = dimensions.map((key) => difficulty[key]);
    if (values.some((value) => !Number.isInteger(value) || value < 1 || value > 5) || !Number.isFinite(difficulty.display) || difficulty.display < 1 || difficulty.display > 5) {
      addFinding(findings, status, item.id, "DIFFICULTY_RANGE", "Difficulty dimensions/display must be within 1–5.");
    } else {
      const average = values.reduce((sum, value) => sum + value, 0) / values.length;
      const expectedDisplay = Math.min(5, Math.max(1, Math.round(average * 2) / 2));
      if (difficulty.display !== expectedDisplay) addFinding(findings, status, item.id, "DIFFICULTY_DISPLAY_MISMATCH", `difficulty.display=${difficulty.display} differs from the dimension average (${expectedDisplay}).`);
    }
  }
  if (typeof item.platform?.observable_failure !== "string" || !item.platform.observable_failure.trim()) {
    addFinding(findings, status, item.id, "OBSERVABLE_FAILURE_MISSING", "A concrete observable_failure is required.");
  } else if (/^o caso de borda contradiz a hipótese:/i.test(item.platform.observable_failure.trim())) {
    addFinding(findings, status, item.id, "OBSERVABLE_FAILURE_GENERIC", "observable_failure uses the shared generic wrapper; author the actual learner-visible symptom directly.");
  }
}

function validateDag(edges, status, findings) {
  const adjacency = new Map();
  for (const edge of edges) {
    if (!edge?.from || !edge?.to) {
      addFinding(findings, status, "", "GRAPH_EDGE_INVALID", "Concept graph contains an edge without both endpoints.");
      continue;
    }
    const children = adjacency.get(edge.from) || [];
    children.push(edge.to);
    adjacency.set(edge.from, children);
  }
  const visiting = new Set();
  const visited = new Set();
  function visit(node) {
    if (visiting.has(node)) return false;
    if (visited.has(node)) return true;
    visiting.add(node);
    for (const child of adjacency.get(node) || []) if (!visit(child)) return false;
    visiting.delete(node);
    visited.add(node);
    return true;
  }
  for (const node of adjacency.keys()) {
    if (!visit(node)) {
      addFinding(findings, status, "", "GRAPH_CYCLE", `Concept graph contains a cycle through ${node}.`);
      return;
    }
  }
}

let primerCoverage = null;
// Concepts that a card explains with a primer, keyed by activity ID (see course-src/concept-coverage.json).
function primerCoverageFor(itemId) {
  if (!primerCoverage) {
    const coverage = loadJson(path.resolve(process.env.DEVPATH_PRIMER_COVERAGE || DEFAULT_PRIMER_COVERAGE), "primer coverage");
    primerCoverage = new Map(Object.entries(coverage).filter(([key]) => !key.startsWith("_")));
  }
  return primerCoverage.get(itemId) || [];
}

function validateCardCode(item, status, findings, featureMapper) {
  const snippets = [];
  const extensionApis = new Set();
  const starterFiles = item.learner?.starter_files || [];
  for (const file of starterFiles) {
    if (typeof file.content === "string" && /\.(?:m?js|cjs|jsx|ts|tsx)$/i.test(file.path || "")) snippets.push({ name: file.path, code: file.content });
    else extractFencedSnippets(file.content, `${item.id}-${file.path || "starter"}`, snippets);
  }
  extractFencedSnippets(item.learner, item.id, snippets);
  const detected = new Set();
  for (const snippet of snippets) {
    const parsed = parseCode(snippet.code, snippet.name, item, status, findings, featureMapper);
    for (const api of parsed.extensionMentions) extensionApis.add(api);
    for (const feature of parsed.features) {
      const conceptId = featureMapper.conceptByFeature.get(feature);
      if (!conceptId || !featureMapper.concepts.has(conceptId)) {
        addFinding(findings, status, item.id, "AST_FEATURE_UNMODELED", `Detected ${feature} in ${snippet.name}, but no matching concept is present in concept_graph.json.`);
      } else detected.add(conceptId);
    }
    if (status === "READY" && parsed.features.has("typescript")) addFinding(findings, status, item.id, "UNSUPPORTED_TS_PROFILE", `TypeScript source in ${snippet.name} cannot pass the Node-only execution gate.`);
  }
  const requires = item.requires || [];
  const introduces = item.introduces || [];
  const availableSkills = [...requires, ...introduces];
  const itemStageRank = stageRank(item.stage);
  const primerCovered = new Set(primerCoverageFor(item.id));
  for (const conceptId of detected) {
    const concept = featureMapper.concepts.has(conceptId);
    if (!concept) continue;
    if (matchesConceptAlias(availableSkills, conceptId)) continue;
    // A primer published on the card explains the concept before the practice (Fase 4, pré-requisito).
    if (primerCovered.has(conceptId)) continue;
    const conceptEntry = featureMapper.conceptById.get(conceptId);
    const skillStages = [...(featureMapper.skillIntroductionStage?.entries() || [])]
      .filter(([skill]) => matchesConceptAlias([skill], conceptId))
      .map(([, stage]) => stage);
    const earliestStage = [conceptEntry?.introduced_at, ...skillStages]
      .filter(Boolean)
      .sort((left, right) => stageRank(left) - stageRank(right))[0];
    // Stage-introduced concepts are taught in a bridge before that stage's cards.
    // The diagnostic stage intentionally samples prior knowledge without gating it.
    if (item.stage === "D" || (earliestStage && stageRank(earliestStage) <= itemStageRank)) continue;
    if (!requires.includes(conceptId)) {
      // Fatal for every card: an undeclared concept used before its stage breaks the build (Fase 4, pré-requisito).
      addFinding(findings, status, item.id, "AST_PREREQUISITE_UNDECLARED", `Starter/example uses ${conceptId}, but it is neither declared by this card, covered by a published primer, nor known to be introduced in an earlier stage${earliestStage ? ` (graph says stage ${earliestStage})` : ""}.`, { alwaysFatal: true });
    }
  }
  if (item.optional !== undefined && typeof item.optional !== "boolean") addFinding(findings, status, item.id, "OPTIONAL_NOT_BOOLEAN", "optional must be a boolean when present.");
  return [...extensionApis];
}

function validateHiddenContracts(item, status, findings) {
  const hidden = item.platform?.hidden_cases || [];
  const publicEdges = item.learner?.edge_contract || [];
  if (!hidden.length) return;
  if (!publicEdges.length) {
    addFinding(findings, status, item.id, "HIDDEN_EDGE_UNPUBLISHED", "Hidden cases exist without learner.edge_contract.");
    return;
  }
  const normalize = (value) => String(value).toLocaleLowerCase("pt-BR").replace(/\s+/g, " ").replace(/[;,.]/g, "").trim();
  for (const test of hidden) {
    const expected = typeof test === "string" ? test : `${test.given} -> ${test.expected}`;
    const found = publicEdges.some((edge) => normalize(edge) === normalize(expected));
    if (!found) addFinding(findings, status, item.id, "HIDDEN_EDGE_UNPUBLISHED", `Hidden case "${expected}" has no matching public edge contract.`);
  }
}

function validateNextIds(item, status, activities, findings) {
  const nextIds = item.platform?.next_ids || [];
  const seen = new Set();
  for (const id of nextIds) {
    if (!activities.has(id)) addFinding(findings, status, item.id, "NEXT_ACTIVITY_MISSING", `next_ids contains unknown activity ${id}.`);
    if (id === item.id || seen.has(id)) addFinding(findings, status, item.id, "NEXT_ACTIVITY_INVALID", `next_ids contains self or duplicate target ${id}.`);
    seen.add(id);
  }
}

async function validateExecutionPackage(item, status, findings) {
  const startIndex = findings.length;
  const pkg = item.platform?.execution_package;
  const fail = (code, message) => addFinding(findings, status, item.id, code, message);
  if (!pkg || typeof pkg !== "object") {
    fail("READY_PACKAGE_MISSING", "READY requires platform.execution_package with a supported Node solution, public/hidden tests, and target mutations.");
    return;
  }
  const profile = String(pkg.profile || "").toLowerCase();
  if (!/^(node|nodejs|node\.js)(?:\s|$)/.test(profile)) {
    fail("EXECUTION_PROFILE_UNSUPPORTED", `Execution profile ${JSON.stringify(pkg.profile)} is unsupported; DOM/browser and TypeScript packages cannot become READY.`);
    return;
  }
  const entry = pkg.entry || item.learner?.starter_files?.find((file) => /\.(?:m?js|cjs)$/i.test(file.path || ""))?.path;
  const sourceFiles = pkg.files || item.learner?.starter_files || [];
  const solutionFiles = pkg.solution?.files || [];
  const publicCases = pkg.public_cases || [];
  const hiddenCases = pkg.hidden_cases || [];
  const mutations = pkg.target_mutations || [];
  if (!Array.isArray(sourceFiles) || !entry || !sourceFiles.some((file) => file.path === entry)) fail("EXECUTION_ENTRY_MISSING", "Node package entry must name a JavaScript file in package files/starter_files.");
  if (!solutionFiles.length) fail("EXECUTION_SOLUTION_MISSING", "Node execution package requires solution.files.");
  if (!publicCases.length) fail("EXECUTION_PUBLIC_CASES_MISSING", "Node execution package requires public_cases.");
  if (!hiddenCases.length) fail("EXECUTION_HIDDEN_CASES_MISSING", "Node execution package requires hidden_cases.");
  if (!mutations.length) fail("EXECUTION_MUTATIONS_MISSING", "Node execution package requires target_mutations.");
  const allFiles = [...(Array.isArray(sourceFiles) ? sourceFiles : []), ...solutionFiles, ...mutations.flatMap((mutation) => mutation.files || [])];
  if (allFiles.some((file) => /\.tsx?$/i.test(file.path || ""))) {
    fail("UNSUPPORTED_TS_PROFILE", "TypeScript files are not supported by the Node VM gate; keep this card non-READY until a TS runner exists.");
    return;
  }
  for (const file of allFiles) {
    const parsed = ts.createSourceFile(file.path || "starter.js", file.content || "", ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    if ((parsed.parseDiagnostics || []).length) fail("EXECUTION_STARTER_PARSE", `${file.path || "starter"} does not parse as supported JavaScript.`);
    if (parsed.statements.some((node) => ts.isImportDeclaration(node))) fail("EXECUTION_IMPORT_UNSUPPORTED", `${file.path} imports modules; the Node VM gate currently supports a self-contained package only.`);
    let usesDom = false;
    const visit = (node) => {
      if (ts.isIdentifier(node) && ["document", "window", "HTMLElement", "Element"].includes(node.text)) usesDom = true;
      ts.forEachChild(node, visit);
    };
    visit(parsed);
    if (usesDom) fail("UNSUPPORTED_DOM_PROFILE", `${file.path} uses browser DOM APIs; the Node VM gate cannot publish DOM exercises.`);
  }
  if (!solutionFiles.some((file) => file.path === entry)) fail("EXECUTION_SOLUTION_ENTRY_MISSING", `solution.files must contain entry ${entry}.`);
  for (const test of [...publicCases, ...hiddenCases]) {
    if (!test || typeof test.code !== "string" || !test.code.trim()) fail("EXECUTION_CASE_INVALID", "Every public/hidden case needs a non-empty JavaScript code field.");
  }
  for (const mutation of mutations) {
    if (!mutation?.name || !Array.isArray(mutation.files) || !mutation.files.some((file) => file.path === entry)) fail("EXECUTION_MUTATION_INVALID", "Each target mutation needs a name and replacement entry file.");
  }
  if (findings.slice(startIndex).some((finding) => finding.item === item.id && finding.severity === "error")) return;
  try {
    await runNodePackage(item, pkg, entry, solutionFiles, publicCases, hiddenCases, mutations, findings);
  } catch (error) {
    fail("EXECUTION_GATE_ERROR", `Node VM execution failed: ${error.message}`);
  }
}

async function runNodePackage(item, pkg, entry, solutionFiles, publicCases, hiddenCases, mutations, findings) {
  const timeout = Number.isInteger(pkg.timeout_ms) ? Math.max(50, Math.min(pkg.timeout_ms, 5_000)) : TIMEOUT_MS;
  const solution = [...publicCases, ...hiddenCases];
  for (const test of solution) {
    const result = await runCase(solutionFiles, entry, test.code, timeout);
    if (!result.ok) addFinding(findings, "READY", item.id, "EXECUTION_SOLUTION_FAILED", `${test.name || "unnamed case"}: ${result.message}`);
  }
  for (const mutation of mutations) {
    const files = mutation.files || [];
    let rejected = false;
    for (const test of solution) {
      const result = await runCase(files, entry, test.code, timeout);
      if (!result.ok) { rejected = true; break; }
    }
    if (!rejected) addFinding(findings, "READY", item.id, "EXECUTION_MUTANT_SURVIVED", `Target mutation ${mutation.name} passed every public and hidden case.`);
  }
}

async function runCase(files, entry, testCode, timeout) {
  try {
    const context = vm.createContext({
      module: { exports: {} },
      exports: {},
      assert: assert.strict,
      console: { log() {}, info() {}, warn() {}, error() {} },
    }, { microtaskMode: "afterEvaluate" });
    context.exports = context.module.exports;
    const entryFile = files.find((file) => file.path === entry);
    if (!entryFile) return { ok: false, message: `entry ${entry} is missing` };
    for (const file of files) {
      if (/\.(?:tsx?|jsx?)$/i.test(file.path || "")) {
        const parsed = ts.createSourceFile(file.path, file.content || "", ts.ScriptTarget.Latest, true, /\.tsx?$/i.test(file.path) ? ts.ScriptKind.TS : ts.ScriptKind.JS);
        if (parsed.parseDiagnostics?.length || /\.(?:tsx?|jsx)$/i.test(file.path)) return { ok: false, message: `${file.path} is not plain runnable JavaScript` };
        if (parsed.statements.some((node) => ts.isImportDeclaration(node))) return { ok: false, message: `imports are not supported by the self-contained Node VM profile (${file.path})` };
        const output = ts.transpileModule(file.content || "", { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, allowJs: true } }).outputText;
        vm.runInContext(output, context, { filename: file.path, timeout });
      }
    }
    context.api = context.module.exports;
    const result = vm.runInContext(`(async () => {\n${testCode}\n})()`, context, { filename: "curriculum-test.js", timeout });
    let timerId;
    try {
      const timer = new Promise((_, reject) => { timerId = setTimeout(() => reject(new Error(`exceeded ${timeout}ms timeout`)), timeout); });
      await Promise.race([result, timer]);
    } finally {
      clearTimeout(timerId);
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

async function run() {
  const sourcePath = parseArgs(process.argv.slice(2));
  const graphPath = path.join(path.dirname(sourcePath), "concept_graph.json");
  const cards = loadJson(sourcePath, "curriculum source");
  const graph = loadJson(graphPath, "concept graph");
  const assessments = loadJson(path.resolve(process.env.DEVPATH_ASSESSMENTS_SOURCE || DEFAULT_ASSESSMENTS), "assessment source");
  if (!Array.isArray(cards)) throw new Error("Curriculum source must be a JSON array.");
  const findings = [];
  for (const issue of localAssessmentCommandIssues(assessments)) {
    addFinding(findings, "READY", issue.id, issue.code, issue.message, {alwaysFatal: true});
  }
  await validateGraph(cards, graph, findings);
  const counts = findings.reduce((result, finding) => {
    result[finding.severity] = (result[finding.severity] || 0) + 1;
    return result;
  }, {});
  for (const finding of findings) {
    const line = `${finding.severity.toUpperCase()} ${finding.item} ${finding.code}: ${finding.message}`;
    (finding.severity === "error" ? console.error : console.warn)(line);
  }
  console.log(`Curriculum source: ${cards.length} cards; ${counts.warning || 0} warning(s), ${counts.error || 0} error(s).`);
  if (findings.some((finding) => finding.severity === "error")) process.exitCode = 1;
}

try {
  await run();
} catch (error) {
  console.error(`Curriculum source validation failed: ${error.message}`);
  process.exitCode = 1;
}
