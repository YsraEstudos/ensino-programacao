// Implemente atrasoExponencial, limitarConcorrencia e comRetry.
// atraso = aleatorio() * min(teto, base * 2 ** tentativa)
export function atrasoExponencial(tentativa, base, teto, aleatorio) {
  return 0;
}

export async function limitarConcorrencia(tarefas, limite) {
  return [];
}

export async function comRetry(operacao, { tentativas, base, teto, aleatorio, espera }) {
  return undefined;
}
