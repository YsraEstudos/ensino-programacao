import {spawnSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {classifyVitestResult} from './vitest-result.mjs';

const source = fileURLToPath(new URL('../', import.meta.url));
const hasLocalDependencies = existsSync(path.join(source, 'node_modules'));
const temp = mkdtempSync(path.join(path.dirname(source), '.verify-p7-'));
const run = (args, env = process.env) => {
  const childEnv = {...env};
  delete childEnv.NODE_TEST_CONTEXT;
  return spawnSync(process.execPath, args, {cwd: temp, env: childEnv, encoding: 'utf8', timeout: 20_000, killSignal: 'SIGTERM'});
};
const runVitest = () => {
  const childEnv = {...process.env};
  delete childEnv.NODE_TEST_CONTEXT;
  const vitestTemp = path.join(temp, '.vitest-tmp');
  mkdirSync(vitestTemp, {recursive: true});
  childEnv.TEMP = vitestTemp;
  childEnv.TMP = vitestTemp;
  return spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm run test'], {
    cwd: temp, env: childEnv, encoding: 'utf8', windowsHide: true, timeout: 20_000, killSignal: 'SIGTERM',
  });
};
const assertionFailure = result => {
  const output = `${result.stdout}\n${result.stderr}`;
  return result.status !== null && !result.error && /not ok\s+\d+|AssertionError|ERR_ASSERTION/.test(output)
    && !/ERR_MODULE_NOT_FOUND|Cannot find package|SyntaxError:|ERR_TEST_FAILURE/.test(output);
};
const vitestAssertionFailure = result => {
  const output = `${result.stdout}\n${result.stderr}`;
  return classifyVitestResult(result) === 'failed' && /\bFAIL\s+test\//.test(output)
    && /AssertionError|expected .* to (?:be|equal|match)|expected .* not to/i.test(output)
    && !/ERR_MODULE_NOT_FOUND|Cannot find package|vitest is not recognized|not found|SyntaxError:|Failed to load/i.test(output);
};
try {
  cpSync(source, temp, {recursive: true, filter: item => hasLocalDependencies || !item.includes(`${path.sep}node_modules`)});
  const productionSource = readFileSync(path.join(temp, 'src/server.mjs'), 'utf8');
  if (/\beval\s*\(|\bnew\s+Function\s*\(/.test(productionSource)) throw new Error('ASVS V1.3.2 failed: dynamic code evaluation found in server source.');
  const referenceCode = readFileSync(path.join(temp, 'reference/security.mjs'), 'utf8');
  const contractArgs = ['--test', 'test/security.contract.node.test.mjs', 'test/http.contract.node.test.mjs'];
  writeFileSync(path.join(temp, 'src/security.mjs'), referenceCode);
  const reference = run(contractArgs, {...process.env, PHASE7_SECURITY_MODULE: path.join(temp, 'src/security.mjs')});
  if (reference.status !== 0) throw new Error(`Referência falhou:\n${reference.stdout}\n${reference.stderr}`);
  const vitestReference = runVitest();
  const vitestReferenceOutput = `${vitestReference.stdout}\n${vitestReference.stderr}`;
  const vitestReferenceStatus = classifyVitestResult(vitestReference);
  const vitestUnavailable = vitestReferenceStatus === 'dependency-missing';
  if (vitestReferenceStatus === 'runner-error') throw new Error(`Runner Vitest da referência falhou (spawn, sinal ou timeout; não é dependência ausente):\n${vitestReferenceOutput}`);
  if (vitestReferenceStatus === 'failed') throw new Error(`Vitest da referência falhou; ausência de outra dependência ou falha ambiental não é pendência:\n${vitestReferenceOutput}`);
  const starter = readFileSync(path.join(temp, 'starter/security.mjs'), 'utf8');
  writeFileSync(path.join(temp, 'src/security.mjs'), starter);
  const red = run(contractArgs, {...process.env, PHASE7_SECURITY_MODULE: path.join(temp, 'src/security.mjs')});
  if (!assertionFailure(red)) throw new Error(`Starter não falhou por asserção de contrato (erro ambiental/import não conta):\n${red.stdout}\n${red.stderr}`);
  if (!vitestUnavailable) {
    const vitestStarter = runVitest();
    const vitestStarterOutput = `${vitestStarter.stdout}\n${vitestStarter.stderr}`;
    if (!vitestAssertionFailure(vitestStarter)) throw new Error(`Suíte Vitest do starter não falhou por asserção (erro ambiental/import não conta):\n${vitestStarterOutput}`);
  }
  writeFileSync(path.join(temp, 'src/security.mjs'), referenceCode);
  const maintenanceStarter = run(['--test', 'test/maintenance.contract.node.test.mjs'], {...process.env, PHASE7_REPORTS_MODULE: path.join(temp, 'foreign-base/reports.mjs')});
  if (!assertionFailure(maintenanceStarter)) throw new Error(`Change request não demonstrou falha de asserção antes da correção:\n${maintenanceStarter.stdout}\n${maintenanceStarter.stderr}`);
  const maintenanceReference = run(['--test', 'test/maintenance.contract.node.test.mjs'], {...process.env, PHASE7_REPORTS_MODULE: path.join(temp, 'foreign-base/reference/reports.mjs')});
  if (maintenanceReference.status !== 0) throw new Error(`Change request: referência corrigida falhou:\n${maintenanceReference.stdout}\n${maintenanceReference.stderr}`);
  const incidentRed = run(['--test', 'incident/r17/repro.test.mjs'], {...process.env, PHASE7_R17_MODULE: path.join(temp, 'incident/r17/r17.mjs')});
  if (!assertionFailure(incidentRed)) throw new Error(`Incidente r17 não reproduziu por asserção:\n${incidentRed.stdout}\n${incidentRed.stderr}`);
  const incidentGreen = run(['--test', 'incident/r17/repro.test.mjs'], {...process.env, PHASE7_R17_MODULE: path.join(temp, 'incident/r17/reference.mjs')});
  if (incidentGreen.status !== 0) throw new Error(`Correção do incidente r17 falhou:\n${incidentGreen.stdout}\n${incidentGreen.stderr}`);
  const transferRed = run(['--test', 'transfer/contract.test.mjs']);
  if (!assertionFailure(transferRed)) throw new Error(`Transferência não falhou por asserção antes da implementação:\n${transferRed.stdout}\n${transferRed.stderr}`);
  writeFileSync(path.join(temp, 'transfer/submission.mjs'), readFileSync(path.join(temp, 'transfer/solution.mjs'), 'utf8'));
  const transferGreen = run(['--test', 'transfer/contract.test.mjs']);
  if (transferGreen.status !== 0) throw new Error(`Transferência: referência corrigida falhou:\n${transferGreen.stdout}\n${transferGreen.stderr}`);
  const mutations = run(['scripts/run-mutation.mjs']);
  if (mutations.status !== 0) throw new Error(`Mutação falhou:\n${mutations.stdout}\n${mutations.stderr}`);
  if (/(?:loopback connect|socket) blocked by environment: (?:EACCES|EPERM)/.test(reference.stdout)) throw new Error(`Contrato HTTP da referência foi ignorado por bloqueio de socket; isso não é prova verde:\n${reference.stdout}`);
  const vitestSummary = vitestUnavailable
    ? ' Vitest: PENDENTE (executável/pacote Vitest comprovadamente ausente).'
    : ' Vitest: referência verde e starter vermelho por asserção.';
  console.log(`Fixture gate: starter reprovado por asserção, referência aprovada, change request vermelho/verde, incidente r17 vermelho/verde, transferência vermelho/verde, mutantes rejeitados por asserção.${vitestSummary} HTTP: executado.`);
} finally {
  rmSync(temp, {recursive: true, force: true});
}
