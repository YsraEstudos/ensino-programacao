// Testes dos gates de qualidade (node:test) com fixtures sintéticas.
// Rodar: node --test scripts/test-quality-gates.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as contratoOculto from "./gate-contrato-oculto.mjs";
import * as solucaoCompleta from "./gate-solucao-completa.mjs";
import * as mutantesPresenca from "./gate-mutantes-presenca.mjs";
import * as texto from "./gate-texto.mjs";
import * as identificadores from "./gate-identificadores.mjs";
import { runChecks, parseArgs } from "./check-quality-gates.mjs";
import { loadPublished } from "./gate-common.mjs";

const SCRIPTS = dirname(fileURLToPath(import.meta.url));
const RUNNER = resolve(SCRIPTS, "check-quality-gates.mjs");

function activity(id, overrides = {}) {
  return {
    id,
    title: "Atividade de exemplo",
    stage: "01",
    kind: "MAKE",
    objective: "Objetivo distinto da primeira resposta.",
    prompt: "Implemente `resultado` em main.js.",
    firstResponse: { action: "Qual caso deve ser verificado primeiro?" },
    explanation: { mental_model: "Modelo simples.", worked_example: "", common_trap: "", why_it_matters: "" },
    starterFiles: [{ path: "main.js", content: "export function resultado() {\n  return 1;\n}\n" }],
    hints: ["Uma dica completa."],
    ...overrides,
  };
}

const SUITE = "import { resultado } from './main.js';\ntest('x', () => { expect(resultado()).toBe(1); });\n";

// Fixture boa: atividade com suíte, mutante real, correctFiles completo e nenhum texto problemático.
function goodFixture() {
  return {
    catalog: [activity("01.01")],
    assessments: {
      "01.01": {
        correctFiles: [{ path: "main.js", content: "" }],
        mutantDirs: [{ id: "off-by-one", files: [{path: "main.js", content: "export function resultado() { return 2; }"}] }],
      },
    },
    tests: { "01.01": SUITE },
  };
}

function withActivity(data, id, overrides) {
  return { ...data, catalog: data.catalog.map((item) => (item.id === id ? { ...item, ...overrides } : item)) };
}

test("gate-contrato-oculto: aceita import visível no starter e rejeita import oculto", () => {
  assert.equal(contratoOculto.run(goodFixture()).warnings.length, 0);

  const bad = goodFixture();
  bad.tests["01.01"] = "import { segredo } from './main.js';\ntest('x', () => {});\n";
  const result = contratoOculto.run(bad);
  assert.equal(result.gate, "gate-contrato-oculto");
  assert.equal(result.warnings.length, 1);
  assert.equal(result.warnings[0].activityId, "01.01");
  assert.match(result.warnings[0].message, /main\.js:segredo/);
});

test("gate-contrato-oculto: nome citado no prompt conta como visível", () => {
  const data = goodFixture();
  data.tests["01.01"] = "import { extra } from './main.js';\n";
  data.catalog = [activity("01.01", { prompt: "Crie `extra` e também `resultado` em main.js." })];
  assert.equal(contratoOculto.run(data).warnings.length, 0);
});

test("gate-solucao-completa: aceita arquivo em correctFiles e ignora main.js; rejeita arquivo ausente", () => {
  const good = goodFixture();
  good.tests["01.01"] = "import { util } from './util.js';\nimport { resultado } from './main.js';\n";
  good.assessments["01.01"].correctFiles.push({ path: "util.js", content: "" });
  assert.equal(solucaoCompleta.run(good).warnings.length, 0);

  const bad = goodFixture();
  bad.catalog = [activity("01.01", { starterFiles: [{ path: "main.js", content: "" }, { path: "recurso.js", content: "" }] })];
  bad.tests["01.01"] = "import { usar } from './recurso.js';\n";
  const result = solucaoCompleta.run(bad);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0].message, /recurso\.js \(só no starter\)/);
});

test("gate-solucao-completa: extensão diferente (patch.js contra patch.ts) não casa", () => {
  const data = goodFixture();
  data.assessments["01.01"].correctFiles = [{ path: "patch.ts", content: "" }];
  data.tests["01.01"] = "import { aplicar } from './patch.js';\n";
  assert.equal(solucaoCompleta.run(data).warnings.length, 1);
});

test("gate-mutantes-presenca: aceita mutante real; rejeita só 'plausible' e ausência de mutante", () => {
  assert.equal(mutantesPresenca.run(goodFixture()).warnings.length, 0);

  const placeholder = goodFixture();
  placeholder.assessments["01.01"].mutantDirs = [{ id: "plausible", files: [{path: "main.js", content: "export function resultado() { return 2; }"}] }];
  const onlyPlausible = mutantesPresenca.run(placeholder);
  assert.equal(onlyPlausible.warnings.length, 1);
  assert.match(onlyPlausible.warnings[0].message, /plausible/);

  const none = goodFixture();
  delete none.assessments["01.01"].mutantDirs;
  assert.equal(mutantesPresenca.run(none).warnings.length, 1);

  const typeMutant = goodFixture();
  typeMutant.assessments["01.01"].mutantDirs = [];
  typeMutant.assessments["01.01"].typeContractMutants = [{ id: "any-signature", files: [{path: "contract.ts", content: "const checked: number = 1;"}] }];
  assert.equal(mutantesPresenca.run(typeMutant).warnings.length, 0);
});

test("gate-mutantes-presenca: atividade sem teste não é avisada", () => {
  const data = goodFixture();
  data.tests = {};
  delete data.assessments["01.01"].mutantDirs;
  assert.equal(mutantesPresenca.run(data).warnings.length, 0);
});

test("gate-mutantes-presenca: mutante com arquivos ausentes, vazios ou formato legado é inválido", () => {
  const malformed = [
    {mutantDirs: [{id: "real", files: []}]},
    {typeContractMutants: [{id: "real", files: [{path: "", content: ""}]}]},
    {mutants: "plausible"},
  ];
  for (const overrides of malformed) {
    const data = goodFixture();
    data.assessments["01.01"] = {...data.assessments["01.01"], ...overrides};
    const result = mutantesPresenca.run(data);
    assert.ok(result.warnings.some(warning => warning.check === "mutante-invalido" && warning.activityId === "01.01"), JSON.stringify(result));
  }
});

test("gate-mutantes-presenca: rejeita caminhos absolutos Windows e placeholder com espaços ou caixa diferente", () => {
  for (const path of ["C:\\tmp\\x.js", "C:/x.js", "\\\\server\\x.js"]) {
    const data = goodFixture();
    data.assessments["01.01"].mutantDirs[0].files[0].path = path;
    const result = mutantesPresenca.run(data);
    assert.ok(result.warnings.some(warning => warning.check === "mutante-invalido"), path);
  }

  for (const id of ["plausible ", "Plausible", 7]) {
    const data = goodFixture();
    data.assessments["01.01"].mutantDirs[0].id = id;
    const result = mutantesPresenca.run(data);
    assert.ok(result.warnings.some(warning => warning.check === "mutantes-ausentes"), id);
    if (typeof id !== "string") assert.ok(result.warnings.some(warning => warning.check === "mutante-invalido"), String(id));
  }
});

test("gate-texto: detecta hint cortado, título sem acento, resposta fora do intervalo, feedback repetido e primeira resposta igual ao objetivo", () => {
  assert.equal(texto.run(goodFixture()).warnings.length, 0);

  const cut = withActivity(goodFixture(), "01.01", { hints: ["Compare os dois valores e escreva o resultado de Compar"] });
  assert.deepEqual(texto.run(cut).warnings.map((w) => w.check), ["hint-cortado"]);

  const accent = withActivity(goodFixture(), "01.01", { title: "Transferencia de dados" });
  assert.deepEqual(texto.run(accent).warnings.map((w) => w.check), ["titulo-sem-acento"]);
  const accentOk = withActivity(goodFixture(), "01.01", { title: "Transferência de dados" });
  assert.equal(texto.run(accentOk).warnings.length, 0);

  const answer = withActivity(goodFixture(), "01.01", {
    review: { prompt: "Qual?", choices: ["a", "b"], answer: 2, correctFeedback: "ok", incorrectFeedback: "no" },
  });
  assert.deepEqual(texto.run(answer).warnings.map((w) => w.check), ["review-resposta"]);
  const answerOk = withActivity(goodFixture(), "01.01", {
    review: { prompt: "Qual?", choices: ["a", "b"], answer: 1, correctFeedback: "ok", incorrectFeedback: "no" },
  });
  assert.equal(texto.run(answerOk).warnings.length, 0);

  const sameResponse = withActivity(goodFixture(), "01.01", {
    firstResponse: { action: "Objetivo igual." },
    objective: "Objetivo igual.",
  });
  assert.deepEqual(texto.run(sameResponse).warnings.map((w) => w.check), ["primeira-resposta"]);
});

test('gate-texto: avisa quando a dica copia o prompt ou a primeira resposta não é pergunta', () => {
  const data = withActivity(goodFixture(), '01.01', {
    stage: '04',
    hints: ['Implemente `resultado` em main.js.'],
    firstResponse: {action: 'Implemente `resultado` em main.js.'},
  });
  assert.deepEqual(texto.run(data).warnings.map(warning => warning.check),
    ['dica-copia-prompt', 'primeira-pergunta']);
});

test('gate-texto: rejeita prefixo de dica copiada e pergunta genérica sobre objetivo', () => {
  const data = withActivity(goodFixture(), '01.01', {
    stage: '04',
    title: 'Dobro',
    hints: ['Pista: Implemente `resultado` em main.js.'],
    firstResponse: {action: 'Em Dobro, qual é o objetivo?'},
  });
  assert.deepEqual(texto.run(data).warnings.map(warning => warning.check),
    ['dica-copia-prompt', 'primeira-pergunta']);
});

test('checks da Fase 2 só bloqueiam IDs verificados, mantendo avisos dos demais', () => {
  const data = goodFixture();
  data.catalog = [
    activity('04.01', {stage: '04', firstResponse: {action: 'Execute o código.'}}),
    activity('05.01', {stage: '05', firstResponse: {action: 'Execute o código.'}}),
  ];
  const options = {scopedStrict: ['gate-texto:primeira-pergunta'], verifiedIds: new Set(['04.01'])};
  const report = runChecks(data, options);
  const gate = report.results.find(result => result.gate === 'gate-texto');
  assert.equal(gate.blocking, 1);
  assert.equal(gate.warnings.filter(warning => warning.check === 'primeira-pergunta').length, 2);
  assert.equal(report.exitCode, 1);
  assert.equal(runChecks(data, {...options, verifiedIds: new Set(['06.01'])}).exitCode, 0);
});

test("gate-texto: correctFeedback repetido na mesma etapa avisa; etapas diferentes não", () => {
  const review = (correctFeedback) => ({ prompt: "Q", choices: ["a", "b"], answer: 0, correctFeedback, incorrectFeedback: "x" });
  const repeated = {
    catalog: [
      activity("01.01", { review: review("Correto, siga em frente.") }),
      activity("01.02", { review: review("Correto, siga em frente.") }),
      activity("02.01", { stage: "02", review: review("Correto, siga em frente.") }),
    ],
    assessments: {},
    tests: {},
  };
  const result = texto.run(repeated).warnings.filter((w) => w.check === "feedback-repetido");
  assert.deepEqual(result.map((w) => w.activityId), ["01.01", "01.02"]);

  repeated.catalog[1].review.correctFeedback = "Outro texto.";
  assert.equal(texto.run(repeated).warnings.filter((w) => w.check === "feedback-repetido").length, 0);
});

test("gate-identificadores: avisa identificador citado ausente do starter e ignora builtins", () => {
  const good = withActivity(goodFixture(), "01.01", {
    explanation: { mental_model: "Use `resultado` e `console.log` com `string`.", worked_example: "", common_trap: "", why_it_matters: "" },
  });
  assert.equal(identificadores.run(good).warnings.length, 0);

  const bad = withActivity(good, "01.01", {
    explanation: { mental_model: "Chame `somaTotal()` antes de `resultado`.", worked_example: "", common_trap: "", why_it_matters: "" },
  });
  const result = identificadores.run(bad);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0].message, /somaTotal/);
});

test("runChecks: sem strict só avisa (exit 0); com strict falha se o gate tiver avisos", () => {
  const bad = withActivity(goodFixture(), "01.01", { title: "Mudanca de regra" });
  const warningMode = runChecks(bad);
  assert.equal(warningMode.exitCode, 0);
  assert.deepEqual(warningMode.failed, []);
  assert.equal(warningMode.results.find((r) => r.gate === "gate-texto").count, 1);

  const strictMode = runChecks(bad, { strict: ["gate-texto"] });
  assert.equal(strictMode.exitCode, 1);
  assert.deepEqual(strictMode.failed, ["gate-texto"]);

  const strictGood = runChecks(goodFixture(), { strict: ["gate-texto"] });
  assert.equal(strictGood.exitCode, 0);
});

test("parseArgs: normaliza nomes de gate e rejeita desconhecidos", () => {
  assert.deepEqual(parseArgs(["--strict=texto,gate-identificadores"]).strict, ["gate-texto", "gate-identificadores"]);
  assert.throws(() => parseArgs(["--strict=inexistente"]), /desconhecido/);
  assert.throws(() => parseArgs(["--qualquer"]), /desconhecido/);
});

test("CLI: --strict falha com exit 1 em fixture ruim e passa em fixture boa; --json é JSON válido", () => {
  const dir = mkdtempSync(join(tmpdir(), "quality-gates-"));
  try {
    const writeSet = (name, data) => {
      const target = join(dir, name);
      mkdirSync(target, { recursive: true });
      writeFileSync(join(target, "course-catalog.json"), JSON.stringify(data.catalog));
      writeFileSync(join(target, "course-assessments.json"), JSON.stringify(data.assessments));
      writeFileSync(join(target, "course-tests.json"), JSON.stringify(data.tests));
      return target;
    };
    const badDir = writeSet("bad", withActivity(goodFixture(), "01.01", { title: "Revisao rapida" }));
    const goodDir = writeSet("good", goodFixture());

    const run = (args) => spawnSync(process.execPath, [RUNNER, ...args], { encoding: "utf8" });

    assert.equal(run([`--data=${badDir}`]).status, 0, "modo aviso sempre sai com 0");
    assert.equal(run([`--data=${badDir}`, "--strict=gate-texto"]).status, 1);
    assert.equal(run([`--data=${goodDir}`, "--strict=gate-texto"]).status, 0);

    const json = run([`--data=${badDir}`, "--json"]);
    assert.equal(json.status, 0);
    const parsed = JSON.parse(json.stdout);
    assert.equal(parsed.results.length, 5);
    assert.equal(parsed.results.find((r) => r.gate === "gate-texto").count, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("dados publicados: todos os gates rodam sem erro e retornam contagens", () => {
  const data = loadPublished(resolve(SCRIPTS, "..", "public"));
  const report = runChecks(data);
  assert.equal(report.results.length, 5);
  for (const result of report.results) assert.equal(typeof result.count, "number");
  const gates = [contratoOculto, solucaoCompleta, mutantesPresenca, texto, identificadores];
  assert.equal(gates.length, report.results.length);
});
