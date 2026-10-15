export function atrasoExponencial(tentativa, base, teto, aleatorio) {
  return aleatorio() * Math.min(teto, base * 2 ** tentativa);
}

export async function limitarConcorrencia(tarefas, limite) {
  const resultados = new Array(tarefas.length);
  let proxima = 0;
  async function trabalhador() {
    while (proxima < tarefas.length) {
      const indice = proxima;
      proxima += 1;
      resultados[indice] = await tarefas[indice]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limite, tarefas.length) }, trabalhador));
  return resultados;
}

export async function comRetry(operacao, { tentativas, base, teto, aleatorio, espera }) {
  if (!(tentativas >= 1)) throw new RangeError('tentativas deve ser pelo menos 1');
  let ultimoErro;
  for (let tentativa = 0; tentativa < tentativas; tentativa += 1) {
    try {
      return await operacao(tentativa);
    } catch (erro) {
      ultimoErro = erro;
      if (tentativa < tentativas - 1) await espera(atrasoExponencial(tentativa, base, teto, aleatorio));
    }
  }
  throw ultimoErro;
}
