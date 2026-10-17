import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {describe, test} from 'node:test';
import {classifyVitestResult} from '../course-src/phase7/common/scripts/vitest-result.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const readJson = relative => JSON.parse(readFileSync(path.join(ROOT, relative), 'utf8'));
const source = relative => readFileSync(path.join(ROOT, relative), 'utf8').replace(/\r\n/g, '\n');
const normalizeText = value => value.replace(/\r\n/g, '\n').replace(/\n+$/, '\n');
const fixtureRoot = path.join(ROOT, 'course-src', 'phase7', 'common');
const requiredFixtureFiles = [
  'package.json', 'package-lock.json', 'README.md', 'ADR-001.md', 'ticket.md',
  'change-request.md', 'incident.md', 'postmortem.md', 'src/server.mjs',
  'src/security.mjs', 'src/ai-patch/broken.mjs', 'src/ai-patch/docs-review.md',
  'test/security.test.mjs', 'test/security.contract.node.test.mjs', 'test/http.contract.node.test.mjs', 'test/regression.test.mjs', 'test/properties.test.mjs',
  'test/maintenance.contract.node.test.mjs', 'test/types.test-d.ts', 'playwright.config.mjs', 'test/e2e/security.spec.mjs',
  'scripts/run-mutation.mjs', 'scripts/run-e2e.mjs', 'mutants/manifest.json', 'incident/r17/reference.mjs',
  'scripts/vitest-result.mjs',
  'transfer/contract.md', 'transfer/contract.test.mjs', 'transfer/solution.mjs',
  'incident/r17/repro.test.mjs', 'incident/r17/r17.mjs', 'incident/r17/reference.mjs',
];

describe('Fase 7, lote comum 24.01', () => {
  test('classificador distingue ausência comprovada do Vitest de falhas do runner', () => {
    const missingCommand = "'vitest' is not recognized as an internal or external command, operable program or batch file.";
    const missingPackage = "Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vitest' imported from file.mjs";
    assert.equal(classifyVitestResult({status: 1, stdout: '', stderr: missingCommand}), 'dependency-missing');
    assert.equal(classifyVitestResult({status: 1, stdout: '', stderr: missingPackage}), 'dependency-missing');
    for (const status of [2, 127]) {
      assert.equal(classifyVitestResult({status, stdout: '', stderr: missingCommand}), 'failed', `status ${status} não é saída esperada de npm run test`);
      assert.equal(classifyVitestResult({status, stdout: '', stderr: missingPackage}), 'failed', `status ${status} não é saída esperada de npm run test`);
    }
    assert.equal(classifyVitestResult({status: 1, signal: 'SIGTERM', stdout: '', stderr: missingCommand}), 'runner-error');
    const failures = [
      {error: Object.assign(new Error('spawn EACCES'), {code: 'EACCES'}), status: null, stderr: ''},
      {error: Object.assign(new Error('spawn ENOENT'), {code: 'ENOENT'}), status: null, stderr: ''},
      {status: 1, stdout: '', stderr: "Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'fast-check' imported from test.mjs"},
      {status: 1, stdout: '', stderr: 'connect EACCES 127.0.0.1:43210'},
      {error: Object.assign(new Error('spawn ETIMEDOUT'), {code: 'ETIMEDOUT'}), status: null, stderr: "'vitest' is not recognized"},
      {status: 1, stdout: '', stderr: 'unexpected runner exit'},
    ];
    for (const failure of failures) assert.notEqual(classifyVitestResult(failure), 'dependency-missing', 'runner/environment errors must never become pending Vitest dependency status');
    assert.equal(classifyVitestResult(failures[0]), 'runner-error');
    assert.equal(classifyVitestResult(failures[2]), 'failed');
    assert.equal(classifyVitestResult(failures[4]), 'runner-error');
  });

  test('etapa 24 e checkpoint 24.01 entram no catálogo e na exportação local', () => {
    const catalog = readJson('public/course-catalog.json');
    const activity = catalog.find(item => item.id === '24.01');
    assert.ok(activity, '24.01 precisa estar publicado no catálogo');
    assert.equal(activity.stage, '24');
    assert.match(activity.title, /segurança|testes|trabalho profissional|IA/i);

    const checkpoints = readJson('course-src/local-checkpoints.json').targets;
    const checkpoint = checkpoints.find(item => item.id === '24.01');
    assert.ok(checkpoint, '24.01 precisa ser um checkpoint exportável');
    assert.deepEqual(checkpoint.activityIds, ['24.01']);
    assert.match(checkpoint.evidenceLabel, /declared/);
  });

  test('24.01 é o bloco comum obrigatório e as três especializações ficam selecionáveis', () => {
    const catalog = readJson('public/course-catalog.json');
    assert.equal(catalog.find(item => item.id === '24.01')?.optional, false);
    for (const id of ['24.02', '24.03', '24.04']) {
      assert.equal(catalog.find(item => item.id === id)?.optional, true, `${id} é uma especialização selecionável`);
    }
  });

  test('fixture canônica, starter allowlist e catálogo público mantêm todos os 30 arquivos sincronizados', () => {
    const files = readJson('course-src/starters/manifest.json')['24.01'].files;
    const catalogActivity = readJson('public/course-catalog.json').find(item => item.id === '24.01');
    assert.equal(files.length, 30);
    assert.equal(new Set(files).size, files.length, 'allowlist não deve conter caminhos duplicados');
    assert.deepEqual(catalogActivity.starterFiles.map(file => file.path).sort(), [...files].sort(), 'catálogo público precisa exportar exatamente a allowlist');
    for (const relative of files) {
      const fixture = source(`course-src/phase7/common/${relative}`);
      const starter = source(`course-src/starters/24.01/${relative}`);
      const published = catalogActivity.starterFiles.find(file => file.path === relative);
      assert.equal(normalizeText(starter), normalizeText(fixture), `starter drift: ${relative}`);
      assert.ok(published, `catálogo ausente: ${relative}`);
      assert.equal(normalizeText(published.content), normalizeText(fixture), `catálogo drift: ${relative}`);
    }
  });

  test('mapa distingue introdução, prática e avaliação com origem de evidência', () => {
    const map = readJson('course-src/phase7/competency-map.json');
    assert.equal(map.version, 1);
    assert.equal(map.stage, '24');
    for (const competency of ['7.2', '7.4', '7.6', '7.7']) {
      const entry = map.competencies.find(item => item.id === competency);
      assert.ok(entry, `${competency} precisa estar no mapa`);
      for (const phase of ['introduced', 'practiced', 'assessed']) {
        assert.ok(Array.isArray(entry[phase]) && entry[phase].length > 0, `${competency}.${phase}`);
        assert.ok(entry[phase].every(evidence => evidence.activityId && evidence.evidenceKind), `${competency}.${phase} identifica atividade e evidência`);
      }
    }
    assert.ok(map.references.some(reference => reference.id === 'OWASP-ASVS' && reference.version));
  });

  test('fixture inclui ferramentas reais, lockfile, trabalhos e patch de IA verificável', () => {
    for (const relative of requiredFixtureFiles) {
      assert.ok(existsSync(path.join(fixtureRoot, relative)), `fixture ausente: ${relative}`);
    }
    const pkg = readJson('course-src/phase7/common/package.json');
    const publicCatalogActivity = readJson('public/course-catalog.json').find(item => item.id === '24.01');
    const checkpoint = readJson('course-src/local-checkpoints.json').targets.find(target => target.id === '24.01');
    assert.equal(pkg.engines.node, '>=24.0.0');
    for (const script of ['test', 'test:e2e', 'test:http-contract', 'test:properties', 'test:types', 'test:maintenance', 'test:incident', 'test:transfer']) {
      assert.ok(pkg.scripts[script], `comando package.json ausente: ${script}`);
    }
    for (const dependency of ['@playwright/test', 'fast-check', 'vitest', 'expect-type']) {
      assert.ok(pkg.devDependencies[dependency], `dependência de prática ausente: ${dependency}`);
    }
    assert.equal(pkg.scripts['test:e2e'], 'node scripts/run-e2e.mjs', 'E2E deve usar o runner que escolhe uma porta por execução');
    const e2eRunner = source('course-src/phase7/common/scripts/run-e2e.mjs');
    const playwrightConfig = source('course-src/phase7/common/playwright.config.mjs');
    assert.match(e2eRunner, /randomInt\(49152, 65536\)/);
    assert.match(e2eRunner, /PHASE7_E2E_PORT: String\(port\)/);
    assert.match(e2eRunner, /PHASE7_E2E_ORIGIN: origin/);
    assert.match(e2eRunner, /PHASE7_E2E_CORS_PORT: String\(corsPort\)/);
    assert.match(e2eRunner, /PHASE7_E2E_CORS_ORIGIN: corsOrigin/);
    assert.match(e2eRunner, /timeout = setTimeout/);
    assert.match(playwrightConfig, /process\.env\.PHASE7_E2E_PORT/);
    assert.match(playwrightConfig, /process\.env\.PHASE7_E2E_ORIGIN/);
    assert.match(playwrightConfig, /PHASE7_CHROMIUM_EXECUTABLE/);
    assert.match(playwrightConfig, /permissions: \['local-network-access'\]/);
    assert.doesNotMatch(playwrightConfig, /randomInt/);
    assert.equal(source('course-src/starters/24.01/playwright.config.mjs'), playwrightConfig, 'starter usa o mesmo config estável');
    assert.equal(source('course-src/starters/24.01/scripts/run-e2e.mjs'), e2eRunner, 'starter usa o mesmo runner E2E');
    const starterManifest = readJson('course-src/starters/manifest.json')['24.01'];
    assert.ok(starterManifest.files.includes('scripts/run-e2e.mjs'));
    assert.equal(readJson('course-src/starters/24.01/package.json').scripts['test:e2e'], pkg.scripts['test:e2e']);
    assert.equal(checkpoint.package.scripts['test:e2e'], pkg.scripts['test:e2e']);
    for (const relative of ['scripts/run-e2e.mjs', 'playwright.config.mjs', 'test/e2e/security.spec.mjs']) {
      const fixture = source(`course-src/phase7/common/${relative}`);
      const starter = source(`course-src/starters/24.01/${relative}`);
      const exported = publicCatalogActivity.starterFiles.find(file => file.path === relative);
      assert.equal(starter, fixture, `starter deve refletir ${relative}`);
      assert.ok(exported, `catálogo público deve exportar ${relative}`);
      assert.equal(exported.content, fixture, `catálogo público deve refletir ${relative}`);
    }
    const e2eSpec = source('course-src/phase7/common/test/e2e/security.spec.mjs');
    assert.match(e2eSpec, /browser accepts the configured CORS origin, rejects another origin, and blocks inline script/);
    assert.match(e2eSpec, /access-control-allow-origin/);
    assert.match(e2eSpec, /content security policy|script-src/i);
    assert.match(e2eSpec, /process\.env\.PHASE7_E2E_CORS_ORIGIN/);
    assert.match(e2eSpec, /await blockedPage\.goto\(`\$\{corsOrigin\}\/cors-test`\)/, 'origem bloqueada vem de navegação real do browser, não de Origin fabricado');
    assert.match(source('course-src/phase7/common/README.md'), /PowerShell|Windows/i);
    assert.match(source('course-src/phase7/common/README.md'), /local-declared|evidência declarada/i);
    const lockPath = path.join(fixtureRoot, 'package-lock.json');
    const map = readJson('course-src/phase7/competency-map.json');
    assert.ok(existsSync(lockPath), 'lockfile genuíno deve existir na fixture');
    assert.equal(map.toolchain.packageLockStatus, 'available');
    assert.deepEqual(checkpoint.package, readJson('course-src/phase7/common/package.json'), 'package do checkpoint precisa refletir a fixture');
    assert.deepEqual(checkpoint.packageLock, readJson('course-src/phase7/common/package-lock.json'), 'lock do checkpoint precisa refletir a fixture');
    const publicCheckpointContext = {};
    vm.runInNewContext(source('public/local-checkpoints.js'), publicCheckpointContext);
    const publicCheckpoint = publicCheckpointContext.DevPathLocalCheckpoints.byId('24.01');
    assert.ok(publicCheckpoint, 'checkpoint público gerado deve conter 24.01');
    assert.equal(JSON.stringify(publicCheckpoint.package), JSON.stringify(pkg), 'package no checkpoint público deve refletir a fixture');
    assert.equal(JSON.stringify(publicCheckpoint.packageLock), JSON.stringify(checkpoint.packageLock), 'lock no checkpoint público deve refletir a fixture');
    const exportedPackage = publicCatalogActivity.starterFiles.find(file => file.path === 'package.json');
    const exportedLock = publicCatalogActivity.starterFiles.find(file => file.path === 'package-lock.json');
    assert.ok(exportedPackage && exportedLock, 'catálogo público deve exportar package e lock');
    assert.deepEqual(JSON.parse(exportedPackage.content), pkg, 'package embarcado no catálogo deve refletir a fixture');
    assert.deepEqual(JSON.parse(exportedLock.content), checkpoint.packageLock, 'lock embarcado no catálogo deve refletir a fixture');
    assert.deepEqual(readJson('course-src/starters/24.01/package-lock.json'), checkpoint.packageLock, 'starter precisa incluir o mesmo lockfile');
    assert.ok(readJson('course-src/starters/manifest.json')['24.01'].files.includes('package-lock.json'));
    assert.doesNotMatch(source('course-src/phase7/common/README.md'), /pending-registry|lockfile.*pendente|registry.npmjs.org.*ENOTFOUND/i);
    for (const command of checkpoint.commands) {
      if (!/^npm(?:\.cmd)?$/i.test(command[0])) continue;
      const script = command[1] === 'run' ? command[2] : command[1] === 'test' ? 'test' : null;
      if (script) assert.ok(pkg.scripts[script], `comando npm ${script} precisa de package.json script`);
    }
    assert.match(source('course-src/phase7/common/src/ai-patch/docs-review.md'), /documentação|docs/i);
    assert.match(source('course-src/phase7/common/README.md'), /falhar por asserção/i);
    assert.ok(map.asvs.controls.some(control => control.id === 'v5.0.0-V1.2.4' && control.status === 'not-applicable-no-database'));
    assert.ok(map.asvs.controls.some(control => control.id === 'v5.0.0-V11.4.2' && control.test));
    assert.ok(map.asvs.controls.some(control => control.id === 'v5.0.0-V5.2.1' && control.status === 'not-applicable-no-upload'));
    assert.ok(map.asvs.controls.every(control => control.status && control.test !== undefined));
    const metadata = readJson('course-src/learning-metadata.json');
    const requiredClosure = new Set();
    const visitRequired = id => { for (const required of metadata[id]?.requires || []) if (!requiredClosure.has(required)) { requiredClosure.add(required); visitRequired(required); } };
    visitRequired('24.01');
    const declaredClosure = map.prerequisiteClosure;
    assert.ok(Array.isArray(declaredClosure), 'mapa precisa declarar o fechamento transitivo com origem e evidência');
    assert.deepEqual(declaredClosure.map(item => item.id).sort(), [...requiredClosure].sort(), 'mapa deve corresponder exatamente ao fechamento calculado');
    assert.deepEqual(declaredClosure.filter(item => item.origin === 'direct').map(item => item.id).sort(), [...map.prerequisites].sort(), 'origens diretas devem corresponder à declaração normativa');
    for (const item of declaredClosure) {
      assert.ok(['direct', 'transitive'].includes(item.origin), `${item.id}: origem inválida`);
      assert.ok(item.evidence?.source && Array.isArray(item.evidence.chain), `${item.id}: origem/evidência ausentes`);
      assert.equal(item.evidence.chain[0], '24.01', `${item.id}: cadeia deve partir de 24.01`);
      assert.equal(item.evidence.chain.at(-1), item.id, `${item.id}: cadeia deve terminar no pré-requisito`);
      for (let i = 0; i < item.evidence.chain.length - 1; i++) {
        const from = item.evidence.chain[i], to = item.evidence.chain[i + 1];
        const declaredEdges = from === '24.01' ? map.prerequisites : (metadata[from]?.requires || []);
        assert.ok(declaredEdges.includes(to), `${item.id}: cadeia contém aresta não declarada ${from} -> ${to}`);
      }
      assert.equal(item.origin, item.evidence.chain.length === 2 ? 'direct' : 'transitive', `${item.id}: classificação da origem não corresponde à cadeia`);
    }
    const exported = readJson('course-src/starters/manifest.json')['24.01'].files;
    for (const answer of ['reference/security.mjs','incident/r17/reference.mjs','transfer/solution.mjs','foreign-base/reference/reports.mjs','scripts/run-mutation.mjs','scripts/verify-fixtures.mjs']) assert.ok(!exported.includes(answer), `resposta interna não deve ser exportada: ${answer}`);
    assert.ok(exported.includes('transfer/submission.mjs'));
    assert.ok(exported.includes('package-lock.json'));
  });

  test('a rubrica 7.6 exige quatro tarefas observáveis com todos os critérios', () => {
    const map = readJson('course-src/phase7/competency-map.json');
    const rubric = map.rubrics.find(item => item.id === '7.6');
    assert.ok(rubric, 'rubrica 7.6 ausente');
    assert.deepEqual(rubric.outcomes.map(item => item.id), ['autonomy', 'maintenance', 'transfer', 'communication']);
    for (const outcome of rubric.outcomes) {
      assert.ok(outcome.task && outcome.deliverables?.length, `${outcome.id}: tarefa e entregáveis`);
      assert.ok(outcome.criteria?.length, `${outcome.id}: critérios observáveis`);
      assert.equal(outcome.evidenceLabel, 'local-declared');
    }
  });

  test('learning-metadata inclui o fechamento transitivo dos pré-requisitos', () => {
    const metadata = readJson('course-src/learning-metadata.json');
    const closure = new Set();
    const visit = id => { for (const required of metadata[id]?.requires || []) if (!closure.has(required)) { closure.add(required); visit(required); } };
    visit('24.01');
    assert.deepEqual([...metadata['24.01'].requires].sort(), [...closure].sort());
  });

  test('gate executável reprova starter, aprova referência e rejeita mutantes', () => {
    const env = {...process.env};
    delete env.NODE_TEST_CONTEXT;
    const command = spawnSync(process.execPath, ['scripts/verify-fixtures.mjs'], {cwd: fixtureRoot, encoding: 'utf8', env});
    assert.equal(command.status, 0, `${command.stdout}\n${command.stderr}`);
    assert.match(command.stdout, /starter reprovado por asserção, referência aprovada, change request vermelho\/verde, incidente r17 vermelho\/verde, transferência vermelho\/verde, mutantes rejeitados por asserção\. Vitest: (?:PENDENTE \(executável\/pacote Vitest comprovadamente ausente\)|referência verde e starter vermelho por asserção)\. HTTP: executado\./i);
  });
});
