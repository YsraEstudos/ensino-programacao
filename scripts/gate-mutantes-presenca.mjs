// Gate: toda atividade com teste tem pelo menos um mutante real (id diferente de "plausible").
import { suiteFor, suiteIds } from "./gate-common.mjs";

export const GATE = "gate-mutantes-presenca";

const PLACEHOLDER_ID = "plausible";
const MUTANT_FIELDS = ["mutantDirs", "typeContractMutants", "typecheckMutants"];

function mutantId(entry) {
  if (typeof entry === "string") return entry;
  return entry?.id ?? entry?.name ?? null;
}

export function run({ assessments = {}, tests = {} } = {}) {
  const warnings = [];
  for (const id of suiteIds(assessments, tests)) {
    if (!suiteFor(id, assessments, tests)) continue;
    const assessment = assessments[id] ?? {};
    const all = MUTANT_FIELDS.flatMap((field) => (Array.isArray(assessment[field]) ? assessment[field] : []));
    const ids = all.map(mutantId).filter(Boolean);
    const real = ids.filter((value) => value !== PLACEHOLDER_ID);
    if (real.length) continue;
    const message = ids.length
      ? `só há mutante placeholder "${PLACEHOLDER_ID}" (nenhum mutante real)`
      : "nenhum mutante declarado (mutantDirs, typeContractMutants ou typecheckMutants)";
    warnings.push({ activityId: id, message });
  }
  return { gate: GATE, warnings };
}
