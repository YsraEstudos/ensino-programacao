export function classifyVitestResult(result) {
  if (!result || result.error || result.signal || result.status === null || result.status === undefined) return 'runner-error';
  if (result.status === 0) return 'passed';
  if (result.status !== 1) return 'failed';

  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  const missingCommand = /(?:^|\r?\n)\s*['"]?vitest['"]?\s+is not recognized as an internal or external command(?:,|\.|$)/im.test(output)
    || /(?:^|\r?\n)\s*(?:sh: \d+: )?vitest: (?:command )?not found(?:$|\r?\n)/im.test(output);
  const missingPackage = /Cannot find package ['"]vitest['"]/.test(output);
  return missingCommand || missingPackage ? 'dependency-missing' : 'failed';
}
