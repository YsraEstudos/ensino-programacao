// Lista nomes importados por assessment.tests que o aluno nunca vê (prompt, objective, interaction, examples, starter).
// Uso: node docs/auditoria-atividades-2026-10-13/contrato-oculto.mjs  (a partir de devpath-publish/)
import { readFileSync } from "node:fs";

const catalog = JSON.parse(readFileSync("public/course-catalog.json", "utf8"));
const assessments = JSON.parse(readFileSync("public/course-assessments.json", "utf8"));
const importRe = /import\s*\{([^}]*)\}\s*from\s*["']\.\/([^"']+)["']|const\s*\{([^}]*)\}\s*=\s*await\s+import\(["']\.\/([^"']+)["']\)/g;

let failures = 0;
for (const [id, assessment] of Object.entries(assessments)) {
  if (!assessment.tests) continue;
  const activity = catalog.find((a) => a.id === id);
  if (!activity) continue;
  const visible = [
    activity.prompt,
    activity.objective,
    JSON.stringify(activity.interaction ?? ""),
    JSON.stringify(activity.examples ?? ""),
    ...activity.starterFiles.map((f) => f.content),
  ].join("\n");
  const hidden = [];
  for (const m of assessment.tests.matchAll(importRe)) {
    const names = (m[1] ?? m[3]).split(",").map((x) => x.trim().split(/\s+as\s+|\s*:\s*/)[0]).filter(Boolean);
    for (const name of names) if (!visible.includes(name)) hidden.push(`${m[2] ?? m[4]}:${name}`);
  }
  if (hidden.length) {
    failures++;
    console.log(`${id}  ${hidden.join(", ")}`);
  }
}
console.log(`${failures} atividade(s) com contrato oculto`);
process.exitCode = failures ? 1 : 0;
