import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { JSDOM } from "jsdom";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const readJson = path => JSON.parse(readFileSync(join(ROOT, path), "utf8"));
const assessment = readJson("public/course-assessments.json");
const sourceAssessment = readJson("course-src/assessments.json");
const catalog = readJson("public/course-catalog.json");
const byId = new Map(catalog.map(item => [item.id, item]));
const source = (...parts) => join(ROOT, "course-src", ...parts);
const tags = text => [...text.matchAll(/@case\s+([^\s*]+)/g)].map(match => match[1]).sort();
const importFile = path => import(pathToFileURL(path).href);

function withDom(html, callback) {
  const dom = new JSDOM(html, { url: "https://devpath.test/" });
  const previous = new Map(["document", "Event", "FormData"].map(key => [key, globalThis[key]]));
  globalThis.document = dom.window.document;
  globalThis.Event = dom.window.Event;
  globalThis.FormData = dom.window.FormData;
  try {
    return callback(dom.window.document, dom);
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
    dom.window.close();
  }
}

function runTypeScript(files, flags = []) {
  const tsc = join(ROOT, "node_modules/typescript/bin/tsc");
  return spawnSync(process.execPath, [tsc, "--noEmit", "--pretty", "false", "--ignoreConfig", ...flags, ...files], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 30000,
    windowsHide: true,
  });
}

function checkTypeFixture(contents, flags = []) {
  const directory = mkdtempSync(join(tmpdir(), "devpath-master456-"));
  const fixture = join(directory, "contract.ts");
  try {
    writeFileSync(fixture, contents, "utf8");
    return runTypeScript([fixture], ["--ignoreConfig", ...flags]);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test("as referências usam IDs anotados iguais nos testes, avaliações-fonte e avaliações publicadas", () => {
  for (const id of ["11.04", "11.05", "13.13", "16.03", "16.10", "18.07", "18.10"]) {
    const manifest = assessment[id];
    const sourceManifest = sourceAssessment[id];
    assert.ok(manifest, `${id} publicado`);
    const sourcePath = manifest.sourceTestPath;
    const authoredPath = sourcePath || manifest.testPaths?.[0] || manifest.testPath;
    assert.ok(authoredPath?.startsWith("tests/"), `${id} declara a origem da suíte`);
    const authored = readFileSync(join(ROOT, "course-src", authoredPath), "utf8");
    const expectedIds = tags(authored);
    const caseIds = manifest.assertionCases.map(record => record.id).sort();
    assert.deepEqual(caseIds, expectedIds, `${id}: assertionCases acompanha o arquivo-fonte`);
    assert.equal(new Set(caseIds).size, caseIds.length, `${id}: IDs sem duplicação`);
    assert.deepEqual(sourceManifest.assertionCases, manifest.assertionCases, `${id}: source e publicação contêm os mesmos registros`);
    for (const record of manifest.assertionCases) assert.equal(record.sourceTestPath, authoredPath, `${id}: ${record.id}`);

    if (typeof manifest.tests === "string" && tags(manifest.tests).length > 0) {
      assert.deepEqual(tags(manifest.tests), expectedIds, `${id}: suíte publicada mantém todos os marcadores`);
    } else if (manifest.testPaths) {
      assert.ok(manifest.testPaths.includes(authoredPath), `${id}: testPaths inclui a suíte anotada`);
    } else if (manifest.testPath?.startsWith("tests/")) {
      assert.equal(manifest.testPath, authoredPath, `${id}: testPath aponta para a suíte anotada`);
    } else {
      assert.ok(manifest.assertionCases.every(record => record.sourceTestPath === authoredPath), `${id}: runtime publicado aponta para os casos anotados`);
    }
  }
});

test("16.03, 16.10, 18.07 e 18.10 publicam expectativas atuais e nomeadas", () => {
  const records = id => assessment[id].assertionCases;
  const find = (id, part) => records(id).find(record => record.id.includes(part));
  assert.deepEqual(["16.03", "16.10", "18.07", "18.10"].map(id => records(id).length), [4, 5, 4, 4]);
  assert.equal(find("16.03", "boleto-mantem-codigo-93279f38").expectedExpression, "'Boleto B-1'");
  assert.ok(records("16.10").filter(record => record.inputExpression === "observed?.message").every(record => record.expectedExpression === "'Não foi possível salvar o pedido.'"));
  assert.ok(records("16.10").every(record => !record.expectedExpression.includes("Falhou:")));
  for (const id of [
    "16.03.cada-discriminante-usa-seu-c-99e512f9", "16.03.cada-discriminante-usa-seu-c-39303e3e",
    "16.03.boleto-mantem-codigo-93279f38", "16.03.valores-distintos-nao-colaps-5fe7a8c0",
    "16.10.sucesso-mantem-contrato-publ-e18bcdb0", "16.10.error-vira-mensagem-e-preser-6bc52ca9",
    "16.10.error-vira-mensagem-e-preser-194a4524", "16.10.valores-nao-error-usam-mensa-be63fdc4",
    "16.10.valores-nao-error-usam-mensa-98ba33c2",
  ]) assert.ok(records(id.slice(0, 5)).some(record => record.id === id), `${id} permanece estável`);
  assert.ok(records("18.07").some(record => record.id.includes("chaves-herdadas")));
  assert.equal(find("18.10", "handle-mantem-resultado-de-s").expectedExpression, "{ok:true,valor:4}");
  assert.equal(find("18.10", "handle-mantem-resultado-de-e").expectedExpression, "{ok:false,erro:'não é número: bad'}");
});

test("anotador exige IDs para refresh/init e aceita inicialização com ID explícito", () => {
  const directory = mkdtempSync(join(tmpdir(), "devpath-annotation-cli-"));
  const assessmentDir = join(directory, "course-src");
  const annotator = join(ROOT, "scripts/annotate-phase2-assertions.mjs");
  try {
    // The CLI validates its mode arguments after loading the assessment file.
    mkdirSync(assessmentDir, { recursive: true });
    writeFileSync(join(assessmentDir, "assessments.json"), "{}\n", "utf8");
    const refresh = spawnSync(process.execPath, [annotator, "--refresh-marked"], {
      cwd: directory, encoding: "utf8", timeout: 10000, windowsHide: true,
    });
    assert.notEqual(refresh.status, 0);
    assert.match(refresh.stderr, /--refresh-marked exige --ids/);
    const initialize = spawnSync(process.execPath, [annotator, "--initialize-marked"], {
      cwd: directory, encoding: "utf8", timeout: 10000, windowsHide: true,
    });
    assert.notEqual(initialize.status, 0);
    assert.match(initialize.stderr, /--initialize-marked exige --ids/);
    const missingList = spawnSync(process.execPath, [annotator, "--ids"], {
      cwd: directory, encoding: "utf8", timeout: 10000, windowsHide: true,
    });
    assert.notEqual(missingList.status, 0);
    assert.match(missingList.stderr, /--ids exige uma lista não vazia/);
    const testsDir = join(assessmentDir, "tests");
    mkdirSync(testsDir, { recursive: true });
    writeFileSync(join(assessmentDir, "assessments.json"), JSON.stringify({ "16.03": { checks: ["behavior"] } }), "utf8");
    writeFileSync(join(testsDir, "16.03.test.js"), "import assert from 'node:assert/strict';\n/*@case 16.03.explicit*/assert.equal(1, 1);\n", "utf8");
    const explicit = spawnSync(process.execPath, [annotator, "--ids", "16.03", "--initialize-marked"], {
      cwd: directory, encoding: "utf8", timeout: 10000, windowsHide: true,
    });
    assert.equal(explicit.status, 0, `${explicit.stdout}\n${explicit.stderr}`);
    assert.equal(JSON.parse(readFileSync(join(assessmentDir, "assessments.json"), "utf8"))["16.03"].assertionCases[0].id, "16.03.explicit");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("task8b regenera IDs estáveis e README que preserva as quatro transferências independentes", () => {
  const directory = mkdtempSync(join(tmpdir(), "devpath-master456-generator-"));
  const ids = ["16.03", "16.10", "18.07", "18.10"];
  const inputs = [
    "scripts/task-8b-stages16-19.mjs",
    "scripts/annotate-phase2-assertions.mjs",
    "public/course-catalog.json",
    "course-src/starters/manifest.json",
    "course-src/assessments.json",
    ...ids.flatMap(id => [`course-src/tests/${id}.test.js`, `course-src/solutions/${id}/README.md`]),
  ];
  const expectedTransfers = Object.fromEntries(ids.map(id => [id, sourceAssessment[id].transfer]));
  const bodyOf = transfer => transfer.files[0].content.split("\n\n").slice(1).join("\n\n");
  const expectedCounts = { "16.03": 4, "16.10": 5, "18.07": 4, "18.10": 4 };
  const distinctBodies = new Set(ids.map(id => bodyOf(expectedTransfers[id])));
  assert.equal(distinctBodies.size, ids.length, "cada etapa conserva uma transferência própria");
  for (const [id, phrase] of Object.entries({ "16.03": "união `Entrega`", "16.10": "`exportarRelatorio`", "18.07": "`nomeDe(id)`", "18.10": "`created | failed`" })) {
    assert.ok(bodyOf(expectedTransfers[id]).includes(phrase), `${id}: cenário independente esperado`);
  }

  try {
    for (const relative of inputs) {
      const destination = join(directory, relative);
      mkdirSync(dirname(destination), { recursive: true });
      copyFileSync(join(ROOT, relative), destination);
    }
    cpSync(join(ROOT, "node_modules/acorn"), join(directory, "node_modules/acorn"), { recursive: true });
    const generated = spawnSync(process.execPath, ["scripts/task-8b-stages16-19.mjs", "16"], {
      cwd: directory, encoding: "utf8", timeout: 30000, windowsHide: true,
    });
    assert.equal(generated.status, 0, `${generated.stdout}\n${generated.stderr}`);
    assert.match(generated.stdout, /Published 17 case records across 4 handwritten suites/);

    const generatedAssessments = JSON.parse(readFileSync(join(directory, "course-src/assessments.json"), "utf8"));
    for (const id of ids) {
      const records = generatedAssessments[id].assertionCases;
      assert.equal(records.length, expectedCounts[id], `${id}: record count after regeneration`);
      assert.deepEqual(records.map(record => record.id).sort(), sourceAssessment[id].assertionCases.map(record => record.id).sort(), `${id}: IDs persist after regeneration`);
      assert.deepEqual(generatedAssessments[id].transfer, expectedTransfers[id], `${id}: transfer prompt and rubric remain unchanged`);
      const readme = readFileSync(join(directory, `course-src/solutions/${id}/README.md`), "utf8");
      assert.ok(readme.includes(bodyOf(expectedTransfers[id])), `${id}: README documents the same independent transfer`);
    }
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("11.04 fixture publicada contém o formulário assumido pela suíte e preserva FormData nativo", async () => {
  const manifest = assessment["11.04"];
  const fixture = manifest.fixtures.html;
  assert.match(fixture, /<form[^>]+id=["']inscricao["']/i);
  assert.match(fixture, /name=["']interesse["']/);
  assert.match(fixture, /name=["']quantidade["']/);
  const { lerInscricao } = await importFile(source("solutions/11.04/form.js"));
  withDom(fixture, document => {
    const form = document.querySelector("#inscricao");
    form.elements.namedItem("nome").value = " Ana ";
    form.elements.namedItem("quantidade").value = "2";
    for (const checkbox of form.querySelectorAll("[name=interesse]")) checkbox.checked = ["JS", "TS"].includes(checkbox.value);
    assert.deepEqual(lerInscricao(form), { ok: true, nome: "Ana", quantidade: 2, interesses: ["JS", "TS"] });
    const invalid = form.elements.namedItem("quantidade");
    invalid.value = "2x";
    const result = lerInscricao(form);
    assert.equal(result.ok, false);
    assert.equal(result.valores.quantidade, "2x");
    assert.equal(invalid.value, "2x");
  });
});

test("11.05 mount, render e destroy mantêm um listener e limpam o estado", async () => {
  const { mount, render, destroy, getAcoes } = await importFile(source("solutions/11.05/app.js"));
  const fixture = '<ul id="lista"></ul>';
  withDom(fixture, document => {
    mount(document);
    render(["a"]);
    render(["b"]);
    document.querySelector("button").dispatchEvent(new Event("click", { bubbles: true }));
    assert.equal(getAcoes(), 1);
    const old = document.querySelector("button");
    destroy();
    old.dispatchEvent(new Event("click", { bubbles: true }));
    assert.equal(getAcoes(), 1);
    assert.equal(document.querySelector("button"), null);
  });
});

test("13.13 trata texto hostil como texto e a mesma asserção rejeita o mutante innerHTML", async () => {
  const { montarWidget } = await importFile(source("solutions/13.13/app.js"));
  const { montarWidget: montarWidgetMutante } = await importFile(source("mutants/13.13/inner-html/app.js"));
  const fixture = '<form id="f"><label for="text">Texto</label><input id="text"><button id="add" type="submit">Adicionar</button><ul id="list"></ul><p id="error" aria-live="polite"></p></form>';
  const observe = mount => withDom(fixture, document => {
    mount(document);
    const input = document.querySelector("#text");
    input.value = "<img src=x>";
    document.querySelector("#f").dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    const item = document.querySelector("#list li");
    return { text: item.firstChild.textContent, image: item.querySelector("img") };
  });
  const expected = { text: "<img src=x>", image: null };
  assert.deepEqual(observe(montarWidget), expected);
  assert.notDeepEqual(observe(montarWidgetMutante), expected);
});

test("07.06 acumuladores com chaves herdadas passam na referência e rejeitam a implementação antiga", async () => {
  const { resumirPorCategoria } = await importFile(source("solutions/07.06/main.js"));
  const resumirAntigo = itens => itens.reduce((acumulado, item) => {
    acumulado[item.categoria] = (acumulado[item.categoria] ?? 0) + item.preco;
    return acumulado;
  }, {});
  const input = [
    { categoria: "toString", preco: 2 }, { categoria: "__proto__", preco: 3 },
    { categoria: "constructor", preco: 4 }, { categoria: "toString", preco: 5 },
  ];
  const actual = resumirPorCategoria(input);
  assert.deepEqual(resumirPorCategoria([{ categoria: "A", preco: 2 }, { categoria: "A", preco: 3 }, { categoria: "B", preco: 4 }]), { A: 5, B: 4 });
  assert.equal(Object.getPrototypeOf(actual), Object.prototype, "o retorno preserva o contrato de objeto comum");
  assert.equal(Object.getOwnPropertyDescriptor(actual, "toString")?.value, 7);
  assert.equal(Object.getOwnPropertyDescriptor(actual, "__proto__")?.value, 3);
  assert.equal(Object.getOwnPropertyDescriptor(actual, "constructor")?.value, 4);
  assert.notDeepEqual(resumirAntigo(input), actual);
  assert.deepEqual(Object.keys(actual), ["toString", "__proto__", "constructor"]);
  assert.deepEqual(resumirPorCategoria([
    { categoria: 1, preco: 2 }, { categoria: "1", preco: 3 },
  ]), { "1": 5 }, "categorias distintas que viram a mesma chave de propriedade devem continuar somando juntas");
});

test("13.03 pagina por fatias, valida limites e preserva a lista", async () => {
  const { paginar } = await importFile(source("solutions/13.03/pagination.js"));
  const items = [3, 1, 2];
  assert.deepEqual(paginar(items, 1, 2), [3, 1]);
  assert.deepEqual(paginar(items, 2, 2), [2]);
  assert.deepEqual(paginar(items, 9, 2), []);
  assert.deepEqual(items, [3, 1, 2]);
  for (const [page, size] of [[0, 2], [1, 0], [1.5, 2]]) assert.throws(() => paginar([], page, size), RangeError);
});

test("13.09 retry limita tentativas, injeta espera e relança o erro final original", async () => {
  const { retry } = await importFile(source("solutions/13.09/retry.js"));
  let calls = 0;
  const delays = [];
  assert.equal(await retry(async () => { calls++; if (calls === 1) throw new Error("temporário"); return "ok"; }, 2, 10, (fn, ms) => { delays.push(ms); fn(); }), "ok");
  assert.equal(calls, 2);
  assert.deepEqual(delays, [10]);
  const failure = new Error("final");
  let finalCalls = 0;
  await assert.rejects(retry(() => { finalCalls++; return Promise.reject(failure); }, 2, 10, (fn, ms) => { delays.push(ms); fn(); }), error => error === failure);
  assert.equal(finalCalls, 2);
  assert.deepEqual(delays, [10, 10]);
});

test("13.14 lê o save via getItem e não grava de volta JSON inválido", async () => {
  const { migrarV2ParaV3, carregar } = await importFile(source("solutions/13.14/migration.js"));
  const reads = [];
  const storage = { getItem(key) { reads.push(key); return JSON.stringify({ version: 1, tasks: [{ id: "t1", text: "x", status: "todo" }] }); }, setItem() { throw new Error("leitura não deve gravar"); } };
  assert.deepEqual(carregar(storage), { version: 3, tasks: [{ id: "t1", text: "x", status: "todo", priority: "normal", tags: [] }] });
  assert.deepEqual(reads, ["kanban:v1"]);
  let writes = 0;
  assert.deepEqual(carregar({ getItem: () => "{", setItem: () => { writes++; } }), { version: 3, tasks: [] });
  assert.equal(writes, 0);
  const warnings = [];
  assert.deepEqual(migrarV2ParaV3({ version: 2, tasks: [{ id: "ok", text: "x", status: "todo" }, { id: "bad" }] }, warnings).tasks.map(task => task.id), ["ok"]);
  assert.equal(warnings.length, 1);
});

test("14.11 é uma avaliação por rubrica alinhada ao prompt e não possui manifesto package.json", () => {
  const item = byId.get("14.11");
  const manifest = assessment["14.11"];
  assert.ok(item);
  assert.equal(item.kind, "COMPARE");
  assert.equal(item.assessmentEnvironment, "rubric");
  assert.equal(manifest.environment, "rubric");
  assert.equal(item.starterFiles.some(file => file.path === "package.json"), false);
  assert.equal(manifest.transfer.files.some(file => file.path === "package.json"), false);
  const prompt = item.prompt.toLocaleLowerCase("pt-BR");
  assert.deepEqual(item.rubric, manifest.rubric, "rubrica visível e rubrica da avaliação permanecem alinhadas");
  const visibleRubric = item.rubric.join(" ").toLocaleLowerCase("pt-BR");
  const rubric = [...manifest.rubric, ...manifest.transfer.rubric].join(" ").toLocaleLowerCase("pt-BR");
  for (const factor of ["licença", "manutenção", "testes"]) {
    assert.ok(prompt.includes(factor), `prompt inclui ${factor}`);
    assert.ok(visibleRubric.includes(factor), `rubrica visível inclui ${factor}`);
    assert.ok(rubric.includes(factor), `rubrica de avaliação inclui ${factor}`);
  }
  assert.match(prompt, /dependências transitivas/);
  assert.match(visibleRubric, /transitive tree|árvore transitiva/);
  assert.match(rubric, /transitive tree|árvore transitiva/);
  assert.match(visibleRubric, /pin\/lock|lockfile/);
  assert.match(rubric, /lockfile/);
  assert.match(prompt, /custo futuro/);
  assert.match(visibleRubric, /plano de update|plano de atualização/);
  assert.match(rubric, /plano de update|plano de atualização/);
  assert.match(rubric, /licença incompatível/);
});

test("16.03 referência e tipos preservam o nome público linha e rejeitam variantes inválidas", async () => {
  const { resumo } = await importFile(source("solutions/16.03/pagamento.ts"));
  const resumoAntigo = pagamento => pagamento.metodo === "boleto" ? `Boleto ${pagamento.codigo}` : "";
  assert.equal(resumo({ metodo: "pix", chave: "ana@example.com" }), "Pix para ana@example.com");
  assert.equal(resumo({ metodo: "cartao", ultimos4: "1234" }), "Cartão final 1234");
  assert.equal(resumo({ metodo: "boleto", linha: "B-1" }), "Boleto B-1");
  assert.equal(resumoAntigo({ metodo: "boleto", linha: "B-1" }), "Boleto undefined");
  const modulePath = source("solutions/16.03/pagamento.ts").replace(/\\/g, "/");
  const check = checkTypeFixture(`import type { Pagamento } from ${JSON.stringify(modulePath)};\nconst boleto: Pagamento = { metodo: "boleto", linha: "B-1" };\n// @ts-expect-error código não é o campo publicado\nconst codigo: Pagamento = { metodo: "boleto", codigo: "B-1" };\n// @ts-expect-error toda variante exige seu campo exclusivo\nconst semChave: Pagamento = { metodo: "pix" };\nvoid [boleto, codigo, semChave];\n`, ["--strict", "--target", "ES2022", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--allowImportingTsExtensions"]);
  assert.equal(check.status, 0, `${check.stdout}\n${check.stderr}`);
});

test("16.10 expõe mensagem segura, preserva a causa e rejeita o vazamento antigo", async () => {
  const { salvarPedido } = await importFile(source("solutions/16.10/pedido.ts"));
  assert.equal(await salvarPedido({ id: "p1" }), "Pedido salvo.");
  const wrappedAntigo = new Error(`Falhou: ${new Error("disco: segredo").message}`, { cause: new Error("disco: segredo") });
  assert.notEqual(wrappedAntigo.message, "Não foi possível salvar o pedido.");
  assert.ok(wrappedAntigo.message.includes("segredo"));
  for (const cause of [new Error("disco: segredo"), "token-secreto", { status: 503 }, null]) {
    await assert.rejects(salvarPedido({ id: "p1" }, cause), error => error.message === "Não foi possível salvar o pedido." && error.cause === cause);
  }
});

test("18.07 trata ausência e chaves herdadas e compila com noUncheckedIndexedAccess", async () => {
  const { nomeDe } = await importFile(source("solutions/18.07/usuarios.ts"));
  const nomeDeAntigo = id => {
    const porId = { u1: { id: "u1", nome: "Ana" } };
    const usuario = porId[id];
    if (!usuario) throw new RangeError(`Usuário ausente: ${id}`);
    return usuario.nome;
  };
  assert.equal(nomeDe("u1"), "Ana");
  for (const id of ["u9", "", "constructor", "toString", "__proto__"]) assert.throws(() => nomeDe(id), error => error instanceof RangeError && error.message.includes(id));
  assert.equal(nomeDeAntigo("constructor"), undefined, "o baseline aceita uma chave herdada como se fosse usuário");
  const check = runTypeScript(["course-src/solutions/18.07/usuarios.ts"], ["--strict", "--noUncheckedIndexedAccess", "--target", "ES2022", "--module", "NodeNext", "--moduleResolution", "NodeNext"]);
  assert.equal(check.status, 0, `${check.stdout}\n${check.stderr}`);
});

test("18.10 aliases refletem as declarações-fonte e não mudam handle em runtime", async () => {
  const { handle } = await importFile(source("solutions/18.10/api.ts"));
  assert.deepEqual(handle("4"), { ok: true, valor: 4 });
  assert.deepEqual(handle("bad"), { ok: false, erro: "não é número: bad" });
  const modulePath = source("solutions/18.10/api.ts").replace(/\\/g, "/");
  const check = checkTypeFixture(`import type { LoadedUser, PresentUser, HandleInput, Evento, SemErro, SoErro } from ${JSON.stringify(modulePath)};\ntype Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;\ntype Assert<T extends true> = T;\ntype _loaded = Assert<Equal<LoadedUser, { id: string; nome: string } | null>>;\ntype _present = Assert<Equal<PresentUser, { id: string; nome: string }>>;\ntype _input = Assert<Equal<HandleInput, string>>;\nconst event: Evento = "retry";\nconst success: SemErro = "ok";\nconst failure: SoErro = "error";\n// @ts-expect-error error is excluded from SemErro\nconst badSuccess: SemErro = "error";\n// @ts-expect-error ok is excluded from SoErro\nconst badFailure: SoErro = "ok";\nvoid [event, success, failure, badSuccess, badFailure];\n`, ["--strict", "--target", "ES2022", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--allowImportingTsExtensions"]);
  assert.equal(check.status, 0, `${check.stdout}\n${check.stderr}`);
});
