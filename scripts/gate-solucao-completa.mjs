// Gate: todo arquivo importado pela suite existe em correctFiles.
// O arquivo de entrada do aluno (main.js/main.ts ou entryPath) não é exigido: ele é o que o aluno escreve.
// A comparação é exata: `patch.js` não casa com `patch.ts`, pois a suite do aluno importa o nome publicado.
import { normalizePath, relativeModules, suiteFor, suiteIds, indexById, starterPaths } from "./gate-common.mjs";

export const GATE = "gate-solucao-completa";

const STUDENT_ENTRY_NAMES = ["main.js", "main.ts"];

export function run({ catalog = [], assessments = {}, tests = {} } = {}) {
  const byId = indexById(catalog);
  const warnings = [];
  for (const id of suiteIds(assessments, tests)) {
    const suite = suiteFor(id, assessments, tests);
    if (!suite) continue;
    const assessment = assessments[id] ?? {};
    const provided = new Set((assessment.correctFiles ?? []).map((file) => normalizePath(file.path ?? "")));
    const entries = new Set(STUDENT_ENTRY_NAMES);
    if (assessment.entryPath) entries.add(normalizePath(assessment.entryPath));
    const inStarter = new Set(starterPaths(byId.get(id)));
    const missing = new Set();
    for (const module of relativeModules(suite)) {
      const path = normalizePath(module);
      if (entries.has(path) || provided.has(path)) continue;
      missing.add(inStarter.has(path) ? `${path} (só no starter)` : path);
    }
    if (missing.size) {
      warnings.push({
        activityId: id,
        message: `arquivo importado pela suite ausente de correctFiles: ${[...missing].join(", ")}`,
      });
    }
  }
  return { gate: GATE, warnings };
}
