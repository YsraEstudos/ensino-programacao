// Executa os gates de qualidade sobre os arquivos PUBLICADOS (public/course-*.json).
// Uso:
//   node scripts/check-quality-gates.mjs [--json] [--verbose] [--strict=gate-a,gate-b:checagem] [--data=<dir>]
// Sem --strict todos os gates só avisam (exit 0). Gates em --strict saem com exit 1 se tiverem avisos.
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {readFileSync} from 'node:fs';
import { loadPublished } from "./gate-common.mjs";
import * as contratoOculto from "./gate-contrato-oculto.mjs";
import * as solucaoCompleta from "./gate-solucao-completa.mjs";
import * as mutantesPresenca from "./gate-mutantes-presenca.mjs";
import * as texto from "./gate-texto.mjs";
import * as identificadores from "./gate-identificadores.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const GATES = [contratoOculto, solucaoCompleta, mutantesPresenca, texto, identificadores];
export const GATE_NAMES = GATES.map((gate) => gate.GATE);

export function normalizeGateName(name) {
  const trimmed = name.trim();
  return trimmed.startsWith("gate-") ? trimmed : `gate-${trimmed}`;
}

export function parseArgs(argv) {
  const options = { json: false, verbose: false, strict: [], scopedStrict: [], verifiedIds: new Set(), data: join(ROOT, "public") };
  for (const arg of argv) {
    if (arg === "--json") options.json = true;
    else if (arg === "--verbose") options.verbose = true;
    else if (arg.startsWith("--strict=")) {
      options.strict = arg.slice("--strict=".length).split(",").filter(Boolean).map(normalizeGateName);
    } else if (arg.startsWith('--scoped-strict=')) {
      options.scopedStrict = arg.slice('--scoped-strict='.length).split(',').filter(Boolean).map(normalizeGateName);
    } else if (arg.startsWith('--verified-ids=')) {
      const ids = JSON.parse(readFileSync(resolve(arg.slice('--verified-ids='.length)), 'utf8'));
      if (!Array.isArray(ids) || ids.some(id => typeof id !== 'string' || !id.trim()) || new Set(ids).size !== ids.length) {
        throw new Error('--verified-ids requer um array JSON de IDs únicos');
      }
      options.verifiedIds = new Set(ids);
    } else if (arg.startsWith("--data=")) options.data = resolve(arg.slice("--data=".length));
    else throw new Error(`argumento desconhecido: ${arg}`);
  }
  const unknown = [...options.strict, ...options.scopedStrict].filter((name) => !GATE_NAMES.includes(name.split(":")[0]));
  if (unknown.length) throw new Error(`gate(s) desconhecido(s) em --strict: ${unknown.join(", ")}`);
  if (options.scopedStrict.length && !options.verifiedIds.size) throw new Error('--scoped-strict requer --verified-ids com IDs explícitos');
  return options;
}

// Uma entrada de --strict pode ser o gate inteiro ("gate-texto") ou uma checagem dele
// ("gate-texto:titulo-sem-acento"); no segundo caso só os avisos dessa checagem falham.
export function runChecks(data, { strict = [], scopedStrict = [], verifiedIds = new Set() } = {}) {
  const results = GATES.map((gate) => {
    const { warnings } = gate.run(data);
    const strictChecks = strict.filter((name) => name.startsWith(`${gate.GATE}:`)).map((name) => name.split(":")[1]);
    const scopedChecks = scopedStrict.filter((name) => name.startsWith(`${gate.GATE}:`)).map((name) => name.split(':')[1]);
    const wholeGate = strict.includes(gate.GATE);
    const blocking = warnings.filter(warning => wholeGate || strictChecks.includes(warning.check) ||
      (verifiedIds.has(warning.activityId) && (scopedStrict.includes(gate.GATE) || scopedChecks.includes(warning.check))));
    return {
      gate: gate.GATE,
      count: warnings.length,
      strict: wholeGate || strictChecks.length > 0 || scopedChecks.length > 0 || scopedStrict.includes(gate.GATE),
      strictChecks,
      scopedChecks,
      blocking: blocking.length,
      warnings,
    };
  });
  const failed = results.filter((result) => result.blocking > 0).map((result) => result.gate);
  return { results, failed, exitCode: failed.length ? 1 : 0 };
}

function countsByCheck(warnings) {
  const counts = {};
  for (const warning of warnings) {
    if (!warning.check) continue;
    counts[warning.check] = (counts[warning.check] ?? 0) + 1;
  }
  return counts;
}

function main(argv) {
  let options;
  try {
    options = parseArgs(argv);
  } catch (error) {
    console.error(error.message);
    return 2;
  }
  const data = loadPublished(options.data);
  const report = runChecks(data, options);

  if (options.json) {
    console.log(JSON.stringify({ mode: options.strict.length || options.scopedStrict.length ? "strict" : "warning", strict: options.strict, scopedStrict: options.scopedStrict, verifiedIds: [...options.verifiedIds], ...report }, null, 2));
    return report.exitCode;
  }

  const total = report.results.reduce((sum, result) => sum + result.count, 0);
  for (const result of report.results) {
    const mode = !result.strict ? 'aviso' : [
      ...(result.strictChecks.length ? [`erro em ${result.strictChecks.join('+')}`] : []),
      ...(result.scopedChecks.length ? [`erro nos IDs verificados em ${result.scopedChecks.join('+')}`] : []),
    ].join('; ') || 'erro (strict)';
    console.log(`${result.gate.padEnd(26)} ${String(result.count).padStart(5)} ${mode}`);
    const breakdown = countsByCheck(result.warnings);
    const parts = Object.entries(breakdown);
    if (parts.length) console.log(`  ${parts.map(([check, count]) => `${check}=${count}`).join(", ")}`);
    if (options.verbose) {
      for (const warning of result.warnings) {
        console.log(`  ${warning.activityId}${warning.check ? ` [${warning.check}]` : ""}: ${warning.message}`);
      }
    }
  }
  console.log(`Quality gates: ${report.results.length} gate(s), ${total} aviso(s), falhas strict: ${report.failed.length}`);
  if (report.failed.length) console.log(`Falhou (strict): ${report.failed.join(", ")}`);
  return report.exitCode;
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main(process.argv.slice(2));
