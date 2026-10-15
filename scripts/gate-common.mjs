// Helpers compartilhados pelos gates de qualidade da Fase 2.5.
// Somente leitura: os gates recebem os arquivos publicados e nunca escrevem nada.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const PUBLISHED_FILES = {
  catalog: "course-catalog.json",
  assessments: "course-assessments.json",
  tests: "course-tests.json",
};

export function loadPublished(dir) {
  const read = (name) => JSON.parse(readFileSync(join(dir, name), "utf8"));
  return {
    catalog: read(PUBLISHED_FILES.catalog),
    assessments: read(PUBLISHED_FILES.assessments),
    tests: read(PUBLISHED_FILES.tests),
  };
}

export function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Casa `name` somente como identificador inteiro (não dentro de outra palavra).
export function wordRegExp(name, flags = "") {
  return new RegExp(`(?<![\\p{L}\\p{N}_$])${escapeRegExp(name)}(?![\\p{L}\\p{N}_$])`, `u${flags}`);
}

export function indexById(catalog) {
  return new Map((catalog ?? []).map((activity) => [activity.id, activity]));
}

// Ids que têm suíte de teste, em course-tests.json ou no campo tests de course-assessments.json.
export function suiteIds(assessments, tests) {
  return [...new Set([...Object.keys(tests ?? {}), ...Object.keys(assessments ?? {})])].sort();
}

export function suiteFor(id, assessments, tests) {
  const fromTests = tests?.[id];
  if (typeof fromTests === "string" && fromTests.trim()) return fromTests;
  const fromAssessment = assessments?.[id]?.tests;
  if (typeof fromAssessment === "string" && fromAssessment.trim()) return fromAssessment;
  return null;
}

export function starterText(activity) {
  return (activity?.starterFiles ?? []).map((file) => file.content ?? "").join("\n");
}

export function starterPaths(activity) {
  return (activity?.starterFiles ?? []).map((file) => normalizePath(file.path ?? ""));
}

export function normalizePath(path) {
  return String(path).replace(/\\/g, "/").replace(/^\.\//, "");
}

// Imports nomeados (`import { a, b as c } from './x.js'` e `const { a } = await import('./x.js')`).
const NAMED_IMPORT_RE =
  /import\s*\{([^}]*)\}\s*from\s*["']\.\/([^"']+)["']|const\s*\{([^}]*)\}\s*=\s*await\s+import\(\s*["']\.\/([^"']+)["']\s*\)/g;

// Qualquer especificador relativo: `from './x'`, `import './x'`, `import('./x')`.
const RELATIVE_MODULE_RE = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["']\.\/([^"']+)["']/g;

export function namedImports(source) {
  const out = [];
  for (const match of source.matchAll(NAMED_IMPORT_RE)) {
    const body = match[1] ?? match[3];
    const module = match[2] ?? match[4];
    const names = body
      .split(",")
      .map((item) => item.trim().replace(/^type\s+/, "").split(/\s+as\s+|\s*:\s*/)[0].trim())
      .filter(Boolean);
    out.push({ module, names });
  }
  return out;
}

export function relativeModules(source) {
  return [...source.matchAll(RELATIVE_MODULE_RE)].map((match) => match[1]);
}

export function textValues(value) {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(textValues);
  if (value && typeof value === "object") return Object.values(value).flatMap(textValues);
  return [];
}
