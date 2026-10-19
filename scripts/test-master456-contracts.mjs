import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { loadPublished } from "./gate-common.mjs";
import * as complete from "./gate-solucao-completa.mjs";
import * as hidden from "./gate-contrato-oculto.mjs";
import { runChecks } from "./check-quality-gates.mjs";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const read = path => JSON.parse(readFileSync(join(ROOT, path), "utf8"));
const phase4 = read("scripts/master-phase4-verified-ids.json");
const phase6 = read("scripts/master-phase6-verified-ids.json");
const expectedPhase4 = ["11.04", "11.05", "13.03", "13.09", "13.13", "13.14", "16.03", "18.10", "21.07", "21.08"];
const expectedPhase6 = ["11.03", "11.08", "11.13", "14.06", "15.07", "16.10", "20.01", "20.04", "20.05", "20.06", "20.09", "20.10", "21.05", "21.06", "21.08", "22.04", "22.05", "23.02", "23.03", "23.04", "23.09", "23.10"];
const data = loadPublished(join(ROOT, "public"));
const byId = new Map(data.catalog.map(item => [item.id, item]));

test("gate de solução exige entrada e dependências transitivas da referência publicada", () => {
  const fixture = {
    catalog: [{id: "x", starterFiles: [{path: "main.js", content: ""}, {path: "helper.js", content: ""}, {path: "deep.js", content: ""}]}],
    assessments: {x: {entryPath: "main.js", correctFiles: [{path: "main.js", content: "import './helper.js';"}]}},
    tests: {x: "import './main.js';"},
  };
  assert.match(complete.run(fixture).warnings[0].message, /helper\.js \(só no starter\)/);
  fixture.assessments.x.correctFiles.push({path: "helper.js", content: "import './deep.js'; export const value = 1;"});
  assert.match(complete.run(fixture).warnings[0].message, /deep\.js \(só no starter\)/);
  fixture.assessments.x.correctFiles.push({path: "deep.js", content: "export const deep = true;"});
  assert.deepEqual(complete.run(fixture).warnings, []);
  fixture.assessments.x.correctFiles = [{path: "helper.js", content: ""}];
  assert.match(complete.run(fixture).warnings[0].message, /main\.js \(só no starter\)/);
});

test("gate percorre scripts carregados pelo HTML do starter", () => {
  const fixture = {
    catalog: [{id: "html", starterFiles: [{path: "index.html", content: '<script type="module" src="app.js?rev=1"></script><script src="https://cdn.example/ext.js"></script>'}, {path: "app.js", content: ""}]}],
    assessments: {html: {entryPath: "index.html", correctFiles: []}},
    tests: {html: "test('page', () => {});"},
  };
  assert.match(complete.run(fixture).warnings[0].message, /app\.js \(só no starter\)/);
  fixture.assessments.html.correctFiles.push({path: "app.js", content: "export function boot() {}"});
  assert.deepEqual(complete.run(fixture).warnings, []);
});

test("gate resolve new URL local com base local e ignora base externa", () => {
  const fixture = {
    catalog: [{id: "url", starterFiles: [{path: "main.js", content: ""}, {path: "worker.js", content: ""}]}],
    assessments: {url: {entryPath: "main.js", correctFiles: [{
      path: "main.js",
      content: "new Worker(new URL('worker.js', import.meta.url), {type: 'module'});",
    }]}},
    tests: {url: "import './main.js';"},
  };
  assert.match(complete.run(fixture).warnings[0].message, /worker\.js \(só no starter\)/);
  fixture.assessments.url.correctFiles.push({path: "worker.js", content: "self.onmessage = () => {};"});
  assert.deepEqual(complete.run(fixture).warnings, []);

  fixture.assessments.url.correctFiles = [{
    path: "main.js",
    content: "new Worker(new URL('worker.js', self.location.href));",
  }];
  assert.match(complete.run(fixture).warnings[0].message, /worker\.js \(só no starter\)/);
  fixture.assessments.url.correctFiles.push({path: "worker.js", content: "self.onmessage = () => {};"});
  assert.deepEqual(complete.run(fixture).warnings, []);

  fixture.assessments.url.correctFiles = [{
    path: "main.js",
    content: "new Worker(new URL('./worker.js', 'https://cdn.example/assets/'));",
  }];
  fixture.catalog[0].starterFiles = [{path: "main.js", content: ""}];
  assert.deepEqual(complete.run(fixture).warnings, []);
});

test("gate ignora exemplos de import em comentários e strings", () => {
  const fixture = {
    catalog: [{id: "x", starterFiles: []}],
    assessments: {x: {entryPath: "main.js", correctFiles: [{
      path: "main.js",
      content: "// import './comment-only.js';\nconst example = \"import './string-only.js'\";\nexport const ready = true;",
    }]}},
    tests: {x: "import './main.js';\n/* import './suite-comment.js'; */\nconst sample = \"import('./suite-string.js')\";"},
  };
  assert.deepEqual(complete.run(fixture).warnings, []);
});

test("solução completa bloqueia apenas IDs da Fase 4 verificados", () => {
  const fixture = {
    catalog: [
      {id: "11.04", starterFiles: [{path: "main.js", content: ""}, {path: "helper.js", content: ""}]},
      {id: "11.05", starterFiles: [{path: "main.js", content: ""}, {path: "helper.js", content: ""}]},
    ],
    assessments: {
      "11.04": {entryPath: "main.js", correctFiles: [{path: "main.js", content: "import './helper.js';"}]},
      "11.05": {entryPath: "main.js", correctFiles: [{path: "main.js", content: "import './helper.js';"}]},
    },
    tests: {"11.04": "import './main.js';", "11.05": "import './main.js';"},
  };
  const report = runChecks(fixture, {
    scopedStrict: ["gate-solucao-completa"],
    verifiedIds: new Set(["11.04"]),
  });
  const gate = report.results.find(result => result.gate === "gate-solucao-completa");
  assert.equal(gate.count, 2);
  assert.equal(gate.blocking, 1);
  assert.equal(report.exitCode, 1);
  assert.equal(runChecks(fixture, {
    scopedStrict: ["gate-solucao-completa"],
    verifiedIds: new Set(["18.10"]),
  }).exitCode, 0);
});

test("paráfrase do fallback de rótulo conserva o contrato sem exigir frase fixa", () => {
  const activity = byId.get("15.07");
  const phrase = "apelido quando presente ou nome como fallback";
  assert.ok(activity.prompt.includes(phrase));
  const changed = {...activity, prompt: activity.prompt.replace(phrase, "usa o apelido fornecido; sem ele, usa o nome")};
  const warnings = hidden.run({...data, catalog: [changed]}).warnings.filter(warning => warning.activityId === "15.07");
  assert.deepEqual(warnings, []);
});

test("fallback de rótulo rejeita a relação invertida entre apelido e nome", () => {
  const activity = byId.get("15.07");
  const inverted = {...activity, prompt: activity.prompt.replace(
    "apelido quando presente ou nome como fallback",
    "quando apelido estiver presente, use nome; sem apelido, use apelido",
  )};
  assert.ok(hidden.run({...data, catalog: [inverted]}).warnings.some(
    warning => warning.activityId === "15.07" && warning.check === "formato-visivel",
  ));
  const sameBranchInverted = {...activity, prompt: activity.prompt.replace(
    "apelido quando presente ou nome como fallback",
    "apelido quando estiver presente, use nome como fallback; sem apelido, use apelido",
  )};
  assert.ok(hidden.run({...data, catalog: [sameBranchInverted]}).warnings.some(
    warning => warning.activityId === "15.07" && warning.check === "formato-visivel",
  ));
});

test("manifestos estritos mantêm exatamente os IDs verificados", () => {
  assert.deepEqual(phase4, expectedPhase4);
  assert.deepEqual(phase6, expectedPhase6);
  assert.equal(new Set(phase4).size, phase4.length);
  assert.equal(new Set(phase6).size, phase6.length);
});

test("todos os contratos de formato publicados passam e cada cláusula decisiva é necessária", () => {
  const missing = hidden.run(data).warnings.filter(warning => phase6.includes(warning.activityId));
  assert.deepEqual(missing, []);
  for (const id of phase6.filter(id => hidden.FORMAT_RULES[id])) {
    const activity = byId.get(id);
    assert.ok(activity, `atividade ${id} publicada`);
    for (const [label, requirements] of hidden.FORMAT_RULES[id]) {
      for (const pattern of requirements) {
        const allOccurrences = new RegExp(pattern.source, `${pattern.flags.replace("g", "")}g`);
        const changed = {...activity, prompt: activity.prompt.replace(allOccurrences, "")};
        assert.notEqual(changed.prompt, activity.prompt, `regra ${label} encontrada em ${id}: ${pattern}`);
        const fixture = {...data, catalog: [changed]};
        assert.ok(hidden.run(fixture).warnings.some(warning => warning.activityId === id && warning.check === "formato-visivel"),
          `${id} precisa falhar quando ${label} perde ${pattern}`);
      }
    }
  }
});

test("contrato oculto bloqueia apenas IDs verificados e continua avisando os demais", () => {
  const data = {
    catalog: [
      {id: "20.01", stage: "20", prompt: "", starterFiles: []},
      {id: "20.04", stage: "20", prompt: "", starterFiles: []},
    ],
    assessments: {
      "20.01": {entryPath: "main.js", correctFiles: []},
      "20.04": {entryPath: "main.js", correctFiles: []},
    },
    tests: {
      "20.01": "import { percorrer } from './protocolo.js';",
      "20.04": "import { observar } from './proxy.js';",
    },
  };
  const scoped = runChecks(data, {
    scopedStrict: ["gate-contrato-oculto"],
    verifiedIds: new Set(["20.01"]),
  });
  const gate = scoped.results.find(result => result.gate === "gate-contrato-oculto");
  assert.equal(gate.count, 2);
  assert.equal(gate.blocking, 1);
  assert.equal(scoped.exitCode, 1);
  assert.equal(runChecks(data, {
    scopedStrict: ["gate-contrato-oculto"],
    verifiedIds: new Set(["20.04"]),
  }).exitCode, 1);
  assert.equal(runChecks(data, {
    scopedStrict: ["gate-contrato-oculto"],
    verifiedIds: new Set(["23.10"]),
  }).exitCode, 0);
});

test("dez atividades executáveis da Fase 4 têm solução publicada completa", () => {
  assert.deepEqual(complete.run(data).warnings.filter(warning => phase4.includes(warning.activityId)), []);
});

test("11.03 preserva valores originais nos erros", async () => {
  const {validar} = await import("../course-src/solutions/11.03/validate.js");
  const input = {nome: "  ", quantidade: "2.5"};
  const result = validar(input);
  assert.equal(result.ok, false);
  assert.ok(result.erros.nome);
  assert.ok(result.erros.quantidade);
  assert.deepEqual(result.valores, input);
});

test("11.08 monta o estado V1, persiste e rejeita status desconhecido", async () => {
  const {montarKanban, mover} = await import("../course-src/solutions/11.08/app.js");
  const html = byId.get("11.08").starterFiles.find(file => file.path === "index.html").content;
  const dom = new JSDOM(html, {url: "https://devpath.test/"});
  try {
    let raw = null;
    const storage = {getItem: () => raw, setItem: (_key, value) => {raw = value;}};
    const app = montarKanban(dom.window.document, storage);
    assert.deepEqual(app.getState(), {version: 1, tasks: []});
    const input = dom.window.document.querySelector("#texto");
    input.value = "  Ler pauta  ";
    dom.window.document.querySelector("#nova-tarefa").dispatchEvent(new dom.window.Event("submit", {bubbles: true, cancelable: true}));
    assert.equal(app.getState().tasks[0].text, "Ler pauta");
    assert.equal(JSON.parse(raw).tasks[0].status, "todo");
    assert.throws(() => mover(app.getState(), app.getState().tasks[0].id, "blocked"), RangeError);
  } finally {
    dom.window.close();
  }
});

test("11.13 salva registros válidos na recuperação parcial sem sobrescrever JSON inválido", async () => {
  const {carregar} = await import("../course-src/solutions/11.13/migration.js");
  const warnings = [];
  const valid = carregar({version: 1, tasks: [{id: "ok", text: "Ler", status: "todo"}, {id: "bad"}]}, warnings);
  assert.deepEqual(valid.tasks.map(task => task.id), ["ok"]);
  assert.equal(warnings.length, 1);
  let writes = 0;
  assert.deepEqual(carregar({getItem: () => "{", setItem: () => {writes++;}}), {version: 2, tasks: []});
  assert.equal(writes, 0);
});

test("14.06 valida faixa e nível sem expor TOKEN", async () => {
  const {loadConfig} = await import("../course-src/solutions/14.06/config.js");
  assert.deepEqual(loadConfig({PORT: "  ", LOG_LEVEL: "debug"}), {port: 3000, logLevel: "debug"});
  for (const PORT of ["abc", "0", "65536", "2.5"]) assert.throws(() => loadConfig({PORT}), RangeError);
  assert.throws(() => loadConfig({LOG_LEVEL: "verbose"}), RangeError);
  assert.throws(() => loadConfig({NODE_ENV: "production"}), /TOKEN obrigatório/);
  assert.equal(JSON.stringify(loadConfig({NODE_ENV: "production", TOKEN: "segredo"})).includes("segredo"), false);
});

test("15.07 torna ausência observável e mantém a chave opcional ausente", async () => {
  const {primeiroNome, semApelido, rotulo} = await import("../course-src/solutions/15.07/catalogo.ts");
  assert.equal(primeiroNome(["ana"]), "ANA");
  assert.throws(() => primeiroNome([]), RangeError);
  const source = {nome: "Caneca", apelido: "C"};
  assert.deepEqual(semApelido(source), {nome: "Caneca"});
  assert.equal(source.apelido, "C");
  assert.equal(rotulo({nome: " Caneca "}), "Caneca");
});

test("16.10 rejeita com mensagem pública fixa e preserva causa Error e não-Error", async () => {
  const {salvarPedido} = await import("../course-src/solutions/16.10/pedido.ts");
  assert.equal(await salvarPedido({id: "p1"}), "Pedido salvo.");
  const original = new Error("disco: segredo técnico");
  for (const cause of [original, "token-secreto"]) {
    await assert.rejects(salvarPedido({id: "p1"}, cause), error =>
      error instanceof Error && error.message === "Não foi possível salvar o pedido." && error.cause === cause);
  }
});
