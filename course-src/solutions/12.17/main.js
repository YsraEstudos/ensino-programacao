export function esperar(ms, valor) {
  return new Promise(resolve => setTimeout(() => resolve(valor), ms));
}

export function promisify(fn) {
  return (...args) => new Promise((resolve, reject) => {
    fn(...args, (erro, resultado) => (erro ? reject(erro) : resolve(resultado)));
  });
}
