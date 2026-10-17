import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const mutants = JSON.parse(readFileSync(path.join(root, 'mutants/manifest.json'), 'utf8'));
const source = readFileSync(path.join(root, 'reference/security.mjs'), 'utf8');
const temp = mkdtempSync(path.join(os.tmpdir(), 'devpath-p7-mutant-'));
const defects = {
  'public-access-bypass': ["return this.userFor(sessionId) === ownerId;", "return Boolean(this.userFor(sessionId));"],
  'expiry-boundary': ["session.expiresAt <= now()", "session.expiresAt < now()"],
  'csrf-ignored': ["return this.canRead(sessionId, ownerId) && Boolean(session && typeof csrf === 'string' && csrf === session.csrfToken);", "return this.canRead(sessionId, ownerId);"],
  'secret-log': ["/password|authorization|cookie|token|secret|session|comment|body/i", "/password|authorization/i"],
};
const failures = [];
const assertionFailure = result => {
  const output = `${result.stdout}\n${result.stderr}`;
  return result.status !== null && !result.error && /not ok\s+\d+|AssertionError|ERR_ASSERTION/.test(output)
    && !/ERR_MODULE_NOT_FOUND|Cannot find package|SyntaxError:|ERR_TEST_FAILURE/.test(output);
};
try {
  for (const mutant of mutants) {
    const [needle, replacement] = defects[mutant.id] || [];
    if (!needle || !source.includes(needle)) throw new Error(`Mutação ${mutant.id}: ponto de substituição ausente.`);
    const mutantSource = source.replace(needle, replacement);
    if (mutantSource === source) throw new Error(`Mutação ${mutant.id} não alterou a implementação.`);
    const file = path.join(temp, `${mutant.id}.mjs`);
    writeFileSync(file, mutantSource);
    const result = spawnSync(process.execPath, ['--test', 'test/security.contract.node.test.mjs', 'test/http.contract.node.test.mjs'], {
      cwd: root,
      env: {...process.env, PHASE7_SECURITY_MODULE: file},
      encoding: 'utf8',
    });
    if (result.error || result.status === null) throw new Error(`Mutação ${mutant.id}: ambiente/harness falhou: ${result.error?.message || 'sem status'}`);
    if (result.status === 0) failures.push(mutant.id);
    else if (!assertionFailure(result)) throw new Error(`Mutação ${mutant.id}: erro não é asserção do contrato:\n${result.stdout}\n${result.stderr}`);
    else process.stdout.write(`MUTANT KILLED BY ASSERTION ${mutant.id}\n`);
  }
} finally { rmSync(temp, {recursive: true, force: true}); }
if (failures.length) {
  console.error(`Mutantes sobreviventes: ${failures.join(', ')}`);
  process.exitCode = 1;
} else console.log(`Mutation check: ${mutants.length}/${mutants.length} implementações completas rejeitadas por asserção.`);
