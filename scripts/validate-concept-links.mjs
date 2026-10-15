// Valida a fonte canônica de vínculos conceito -> atividade (course-src/concept-links.json).
// Uso: node scripts/validate-concept-links.mjs
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const TARGET_VARIANTS = 3;
const DECISIONS = new Set(['linked', 'exempt', 'needs-new-activity']);
const KINDS = new Set(['implementation', 'predict-read']);

function stageRank(stage) {
  return /^\d+$/.test(String(stage)) ? Number(stage) : Number.NaN;
}

/**
 * Valida os vínculos. Retorna o resumo quando tudo passa; lança Error com todas as
 * falhas (uma por linha) quando algo está errado.
 *
 * @param {{version: number, concepts: object[]}} links conteúdo de course-src/concept-links.json
 * @param {{concepts: {id: string, introduced_at: string}[], catalog: object[]}} source grafo e catálogo
 */
export function validateConceptLinks(links, { concepts, catalog }) {
  const errors = [];
  const fail = (msg) => errors.push(msg);

  if (!links || typeof links !== 'object' || !Array.isArray(links.concepts)) {
    throw new Error('concept-links: envelope inválido (esperado {"version":1,"concepts":[...]})');
  }

  const graphById = new Map(concepts.map((c) => [c.id, c]));
  const activityById = new Map(catalog.map((a) => [a.id, a]));
  const seen = new Set();

  for (const link of links.concepts) {
    const id = link.conceptId;
    const label = `conceito ${id ?? '(sem conceptId)'}`;
    if (!id) { fail('item sem conceptId'); continue; }
    if (seen.has(id)) { fail(`${label}: duplicado`); continue; }
    seen.add(id);

    const node = graphById.get(id);
    if (!node) { fail(`${label}: não existe no grafo`); continue; }
    if (!DECISIONS.has(link.decision)) fail(`${label}: decision inválida "${link.decision}"`);
    if (!KINDS.has(link.kind)) fail(`${label}: kind inválido "${link.kind}"`);
    if (!Array.isArray(link.activities)) { fail(`${label}: activities deve ser lista`); continue; }
    const optionalList = link.optionalActivities ?? [];
    if (!Array.isArray(optionalList)) { fail(`${label}: optionalActivities deve ser lista`); continue; }

    if (typeof link.rationale !== 'string' || link.rationale.trim() === '') {
      fail(`${label}: rationale ausente (obrigatório para "${link.decision}")`);
    }

    const introRank = stageRank(node.introduced_at);

    const checkId = (listName, aid, wantOptional) => {
      const activity = activityById.get(aid);
      if (!activity) { fail(`${label}: ${listName} cita atividade inexistente ${aid}`); return; }
      const isOptional = activity.optional === true;
      if (wantOptional && !isOptional) fail(`${label}: ${aid} está em optionalActivities mas é obrigatória`);
      if (!wantOptional && isOptional) fail(`${label}: ${aid} está em activities mas é opcional`);
      const stageNum = stageRank(activity.stage);
      if (Number.isNaN(stageNum) || Number.isNaN(introRank)) {
        fail(`${label}: etapa não comparável (${aid}=${activity.stage}, introdução=${node.introduced_at})`);
      } else if (stageNum < introRank) {
        fail(`${label}: ${aid} (etapa ${activity.stage}) é anterior à introdução do conceito (etapa ${node.introduced_at})`);
      }
    };

    const dupCheck = new Set();
    for (const aid of [...link.activities, ...optionalList]) {
      if (dupCheck.has(aid)) fail(`${label}: atividade ${aid} citada mais de uma vez`);
      dupCheck.add(aid);
    }
    for (const aid of link.activities) checkId('activities', aid, false);
    for (const aid of optionalList) checkId('optionalActivities', aid, true);

    if (link.decision === 'linked' && link.activities.length === 0) {
      fail(`${label}: decision "linked" sem nenhuma atividade obrigatória`);
    }
    if (link.decision === 'needs-new-activity' && link.activities.length > 0) {
      fail(`${label}: decision "needs-new-activity" não pode listar activities`);
    }
  }

  for (const node of concepts) {
    if (!seen.has(node.id)) fail(`conceito ${node.id} do grafo está faltando em concept-links.json`);
  }

  if (errors.length > 0) {
    throw new Error(`concept-links inválido (${errors.length} erro(s)):\n- ${errors.join('\n- ')}`);
  }

  const count = (d) => links.concepts.filter((l) => l.decision === d).length;
  let newVariantsNeeded = 0;
  for (const link of links.concepts) {
    if (link.decision === 'exempt') continue;
    if (link.kind !== 'implementation' && link.kind !== 'predict-read') continue;
    newVariantsNeeded += Math.max(0, TARGET_VARIANTS - link.activities.length);
  }

  return {
    total: links.concepts.length,
    linked: count('linked'),
    exempt: count('exempt'),
    needsNewActivity: count('needs-new-activity'),
    newVariantsNeeded,
  };
}

function readJson(relPath) {
  return JSON.parse(readFileSync(new URL(relPath, ROOT), 'utf8'));
}

function main() {
  const links = readJson('course-src/concept-links.json');
  const graph = readJson('course-src/.generated/concept_graph.json');
  const catalog = readJson('public/course-catalog.json');
  const summary = validateConceptLinks(links, { concepts: graph.concepts, catalog });
  console.log(JSON.stringify(summary));
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
