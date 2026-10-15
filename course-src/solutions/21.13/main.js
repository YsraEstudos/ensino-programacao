export function criarContador() {
  const emissor = new EventTarget();
  let valor = 0;
  return {
    get valor() {
      return valor;
    },
    incrementar() {
      valor += 1;
      emissor.dispatchEvent(new CustomEvent('mudou', { detail: { valor } }));
    },
    addEventListener: (...args) => emissor.addEventListener(...args),
  };
}

export function ouvirAte(emissor, tratador, sinal) {
  emissor.addEventListener('mudou', tratador, { signal: sinal });
}
