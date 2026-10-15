// Gate: todo import de assessment.tests existe no starter ou é citado no prompt.
// Base: docs/auditoria-atividades-2026-10-13/contrato-oculto.mjs.
import { indexById, namedImports, starterText, suiteFor, suiteIds, wordRegExp } from "./gate-common.mjs";

export const GATE = "gate-contrato-oculto";

export function run({ catalog = [], assessments = {}, tests = {} } = {}) {
  const byId = indexById(catalog);
  const warnings = [];
  for (const id of suiteIds(assessments, tests)) {
    const suite = suiteFor(id, assessments, tests);
    const activity = byId.get(id);
    if (!suite || !activity) continue;
    const visible = [activity.prompt ?? "", starterText(activity)].join("\n");
    const hidden = new Set();
    for (const { module, names } of namedImports(suite)) {
      for (const name of names) {
        if (!wordRegExp(name).test(visible)) hidden.add(`${module}:${name}`);
      }
    }
    if (hidden.size) {
      warnings.push({
        activityId: id,
        message: `import sem fonte visível (starter ou prompt): ${[...hidden].join(", ")}`,
      });
    }
  }
  return { gate: GATE, warnings };
}
