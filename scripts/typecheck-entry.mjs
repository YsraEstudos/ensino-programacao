export { checkTypes } from './typecheck-host.mjs';
import { checkTypes } from './typecheck-host.mjs';

function resultText(kind, diagnostics = []) {
  if (kind === 'passed') return 'TypeScript verificado com sucesso.';
  if (kind === 'type-error') return `TypeScript encontrou ${diagnostics.length} diagnóstico(s).`;
  if (kind === 'unsupported') return 'Ambiente TypeScript não suportado.';
  if (kind === 'timeout') return 'A verificação TypeScript excedeu o tempo limite.';
  if (kind === 'cancelled') return 'A verificação TypeScript foi cancelada.';
  return 'A verificação TypeScript falhou.';
}

function workerResult(result) {
  const hasErrors = result.diagnostics.some(diagnostic => diagnostic.category === 'error');
  const kind = !result.supported ? 'unsupported' : hasErrors ? 'type-error' : 'passed';
  return {
    ...result,
    kind,
    text: resultText(kind, result.diagnostics),
    source: 'browser'
  };
}

export function installTypecheckWorker(scope = globalThis) {
  scope.onmessage = event => {
    const { token, input, libraries } = event.data || {};
    try {
      scope.postMessage({ token, result: workerResult(checkTypes(input, { libraries })) });
    } catch (error) {
      const diagnostics = [{ category: 'error', code: 0, message: error instanceof Error ? error.message : String(error) }];
      scope.postMessage({ token, result: { kind: 'unsupported', supported: false, diagnostics, text: resultText('unsupported', diagnostics), source: 'browser' } });
    }
  };
  return scope.onmessage;
}

if (typeof self !== 'undefined' && typeof window === 'undefined') installTypecheckWorker(self);
