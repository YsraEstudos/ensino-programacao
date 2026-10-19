// Gate: toda atividade com teste tem pelo menos um mutante real (id diferente de "plausible").
import { suiteFor, suiteIds } from "./gate-common.mjs";

export const GATE = "gate-mutantes-presenca";

const PLACEHOLDER_ID = "plausible";
const MUTANT_FIELDS = ["mutantDirs", "typeContractMutants"];

function mutantId(entry) {
  if (typeof entry === "string") return entry;
  return entry?.id ?? entry?.name ?? null;
}

function invalidMutants(assessment) {
  const problems = [];
  if (Object.hasOwn(assessment, "mutants")) problems.push('campo legado "mutants" não é suportado');
  if (assessment.typecheckMutants !== undefined && typeof assessment.typecheckMutants !== "boolean") {
    problems.push('"typecheckMutants" deve ser booleano');
  }
  for (const field of MUTANT_FIELDS) {
    if (assessment[field] === undefined) continue;
    if (!Array.isArray(assessment[field])) {
      problems.push(`"${field}" deve ser uma lista`);
      continue;
    }
    for (const [index, mutant] of assessment[field].entries()) {
      const label = `${field}[${index}]`;
      if (!mutant || typeof mutant !== "object" || Array.isArray(mutant)) {
        problems.push(`${label} deve ser um objeto`);
        continue;
      }
      if (typeof mutant.id !== "string" || !mutant.id.trim()) problems.push(`${label} precisa de id textual`);
      else if (mutant.id !== mutant.id.trim()) problems.push(`${label} não pode ter espaços nas bordas do id`);
      if (!Array.isArray(mutant.files) || mutant.files.length === 0) {
        problems.push(`${label} precisa de ao menos um arquivo`);
        continue;
      }
      for (const [fileIndex, file] of mutant.files.entries()) {
        if (!file || typeof file !== "object" || Array.isArray(file)
          || typeof file.path !== "string" || !file.path.trim() || /^[\\/]|^[A-Za-z]:/.test(file.path)
          || file.path.split(/[\\/]/).includes("..")
          || typeof file.content !== "string" || !file.content.trim()) {
          problems.push(`${label}.files[${fileIndex}] precisa de caminho relativo e conteúdo`);
        }
      }
    }
  }
  return problems;
}

export function run({ assessments = {}, tests = {} } = {}) {
  const warnings = [];
  for (const id of suiteIds(assessments, tests)) {
    if (!suiteFor(id, assessments, tests)) continue;
    const assessment = assessments[id] ?? {};
    for (const problem of invalidMutants(assessment)) {
      warnings.push({activityId: id, check: "mutante-invalido", message: problem});
    }
    const all = MUTANT_FIELDS.flatMap((field) => (Array.isArray(assessment[field]) ? assessment[field] : []));
    const ids = all.map(mutantId).filter(Boolean);
    const real = ids.filter((value) => typeof value === "string" && value.trim().toLowerCase() !== PLACEHOLDER_ID);
    if (real.length) continue;
    const message = ids.length
      ? `só há mutante placeholder "${PLACEHOLDER_ID}" (nenhum mutante real)`
      : "nenhum mutante declarado (mutantDirs ou typeContractMutants)";
    warnings.push({ activityId: id, check: "mutantes-ausentes", message });
  }
  return { gate: GATE, warnings };
}
